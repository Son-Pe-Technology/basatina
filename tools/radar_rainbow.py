"""🌧️ Radar con previsión de Rainbow.ai, pedido UNA sola vez para todos (26 nov. 2026, lo pidió Pedro)

POR QUÉ: hasta ahora cada móvil pedía a Rainbow sus propias teselas (unas 19 imágenes por cada trozo de mapa,
y otra vez cada 10 minutos con el Inicio abierto). El plan gratuito da 10.000 llamadas al mes y en 12 días
se habían gastado 8.100: el gasto crecía con cada usuario. Ahora:

  · Este robot (GitHub Actions, .github/workflows/radar.yml, cada 30 min) es el ÚNICO que llama a Rainbow.
  · Pide la previsión de las próximas 4 horas (6 fotogramas) para Navarra, a zoom 7 (2 teselas por fotograma),
    les pone los colores de la leyenda de la app (RD_PAL de web/index.html) y las deja en la rama «radar»
    del repositorio. Los móviles (web/radar-central.js) las leen de ahí: da igual que haya 10 o 10.000 usuarios.
  · El radar del pasado (últimas 2 horas) sigue saliendo de RainViewer, que es gratis.

CÓMO NO PASARSE DEL CUPO (lo importante):
  · Cada pasada gasta 1 llamada (la hora de la última imagen) + 6 × 2 teselas = 13 llamadas.
  · Si en la última imagen de RainViewer no llueve a menos de ~250 km de Pamplona, NO se llama a Rainbow (0 llamadas).
  · Lleva la cuenta de lo gastado en el ciclo (del día 14 al 14, como Rainbow) en estado.json, y reparte lo que
    queda entre las horas que faltan: si no da para pedir ahora, espera. Nunca pasa del TOPE del ciclo.
  · El ciclo del 14 nov. al 14 dic. 2026 ya venía casi gastado por los móviles: su tope es solo 1.200.

La clave se lee de Firestore claves/app (la misma que guardan Pedro y Sonia desde la app) con el secreto
FIREBASE_SA; también vale el secreto RAINBOW_KEY. El repositorio y los registros son públicos: aquí NUNCA
se imprime la clave ni las direcciones que la llevan.
"""
import datetime, io, json, math, os, shutil, sys, urllib.parse, urllib.request
from zoneinfo import ZoneInfo

PREV = os.environ.get('RADAR_PREV', 'prev')     # rama «radar» tal y como estaba (puede no existir)
PUB = os.environ.get('RADAR_PUB', 'pub')        # lo que se va a publicar en la rama «radar»
MAD = ZoneInfo('Europe/Madrid')

Z = 7                                          # zoom de las teselas (Navarra entra en 2)
NAV = (-2.50, -0.72, 41.91, 43.31)             # oeste, este, sur, norte
FT = [1200, 2400, 3600, 7200, 10800, 14400]    # previsión: +20, +40, +60 min, +2, +3 y +4 h
DIA_CICLO = 14                                 # Rainbow reinicia el cupo el día 14 de cada mes
TOPE_DEF = 8500                                # de las 10.000 gratis, margen para pruebas y la clave
TOPES = {'2026-11-14': 1200}                   # ciclo que ya venía gastado por los móviles
MIN_INTERVALO_H = 0.5                          # como mucho, una pasada cada media hora
PAMPLONA = (42.8125, -1.6458)
RADIO_KM = 250                                 # si no llueve a esta distancia, no hace falta previsión

# Paleta «Universal Blue» de RainViewer, IGUAL que RD_PAL de web/index.html (índice 10 = 10 dBZ … 70 dBZ)
RD_PAL_HEX = ('087fdb 0c73dd 1068e0 145de2 1852e5 1c47e8 2c3be1 3c2fda 4d24d3 5d18cc 6e0dc6 800db9 920dac a40e9f '
              'b60e92 c80f86 c62086 c43186 c34286 c15386 c06487 c36b77 c77268 ca7959 ce804a d2883b da9439 e2a037 '
              'eaac35 f2b833 fac431 facf27 fbda1e fce514 fdf00b fefb02 fee713 fed424 fec035 fead46 fe9a58 fe8e47 '
              'fe8236 fe7626 fe6a15 fe5f05 fd5609 fd4d0e fd4512 fd3c17 fd341c f04f3c e36b5c d7867d caa29d bebebe '
              'c2c2c2 c6c6c6 cacaca cecece d3d3d3').split()
RD_PAL = {10 + i: c for i, c in enumerate(RD_PAL_HEX)}


def lut():
    """La misma tabla que RD_LUT de index.html: del valor rojo de Rainbow (dBZ+32, bit 128 = nieve) a RGBA."""
    L = [(0, 0, 0, 0)] * 256
    for v in range(256):
        sn, d = v & 128, (v & 127) - 32
        if d < 5:
            continue
        if sn:
            t = max(0, min(1, (d - 10) / 55))
            c = (round(191 - 191 * t), round(255 - 224 * t), 255)
        else:
            h = RD_PAL[max(10, min(70, d))]
            c = tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
        a = round(255 * (d - 4) / 6) if d < 10 else 255
        L[v] = (*c, a)
    return L


def teselas(z):
    n = 2 ** z
    tx = lambda lo: int((lo + 180) / 360 * n)
    def ty(la):
        r = math.radians(la)
        return int((1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * n)
    return [(x, y) for x in range(tx(NAV[0]), tx(NAV[1]) + 1) for y in range(ty(NAV[3]), ty(NAV[2]) + 1)]


def baja(url, timeout=40):
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'BasatiNA-radar'}), timeout=timeout) as f:
        return f.read()


def clave():
    k = (os.environ.get('RAINBOW_KEY') or '').strip()
    if k:
        return k
    sa = os.environ.get('FIREBASE_SA')
    if not sa:
        return ''
    from google.oauth2 import service_account
    import google.auth.transport.requests
    c = service_account.Credentials.from_service_account_info(json.loads(sa), scopes=['https://www.googleapis.com/auth/datastore'])
    c.refresh(google.auth.transport.requests.Request())
    r = urllib.request.Request('https://firestore.googleapis.com/v1/projects/basatina-9a8b5/databases/(default)/documents/claves/app',
                               headers={'Authorization': 'Bearer ' + c.token})
    with urllib.request.urlopen(r, timeout=40) as f:
        d = json.loads(f.read())
    return ((d.get('fields', {}).get('rainbow') or {}).get('stringValue') or '').strip()


def ciclo(hoy):
    """Inicio y fin del ciclo de Rainbow (del día 14 al 14) que contiene `hoy`."""
    ini = hoy.replace(day=DIA_CICLO) if hoy.day >= DIA_CICLO else (hoy.replace(day=1) - datetime.timedelta(days=1)).replace(day=DIA_CICLO)
    fin = (ini.replace(day=28) + datetime.timedelta(days=7)).replace(day=DIA_CICLO)
    return ini, fin


def llueve_cerca():
    """¿Hay eco de radar (RainViewer, gratis) a menos de RADIO_KM de Pamplona? None si no se puede saber."""
    try:
        from PIL import Image
        j = json.loads(baja('https://api.rainviewer.com/public/weather-maps.json'))
        f = (j.get('radar') or {}).get('past') or []
        if not f:
            return None
        host, path, z = j['host'], f[-1]['path'], 5
        n = 2 ** z
        pix = 0
        for X in (15, 16):                    # a zoom 5, estas dos teselas cubren de Portugal a Italia
            im = Image.open(io.BytesIO(baja(f'{host}{path}/256/{z}/{X}/11/2/1_1.png'))).convert('RGBA')
            w, h = im.size
            a = im.getchannel('A').load()
            for py in range(0, h, 2):
                la = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * (11 + py / h) / n))))
                for px in range(0, w, 2):
                    if not a[px, py]:
                        continue
                    lo = (X + px / w) / n * 360 - 180
                    dk = 6371 * math.acos(min(1, math.sin(math.radians(la)) * math.sin(math.radians(PAMPLONA[0])) +
                                              math.cos(math.radians(la)) * math.cos(math.radians(PAMPLONA[0])) * math.cos(math.radians(lo - PAMPLONA[1]))))
                    if dk <= RADIO_KM:
                        pix += 1
        print(f'RainViewer: {pix} puntos con lluvia a menos de {RADIO_KM} km de Pamplona')
        return pix >= 8
    except Exception as e:
        print('No se pudo mirar RainViewer:', type(e).__name__)
        return None


def main():
    ahora = datetime.datetime.now(MAD)
    ini, fin = ciclo(ahora.date())
    tope = TOPES.get(ini.isoformat(), TOPE_DEF)
    try:
        E = json.load(open(os.path.join(PREV, 'estado.json'), encoding='utf-8'))
    except Exception:
        E = {}
    if E.get('ciclo') != ini.isoformat():
        E = {'ciclo': ini.isoformat(), 'usadas': 0, 'ultima': 0}
    try:
        J = json.load(open(os.path.join(PREV, 'rainbow.json'), encoding='utf-8'))
    except Exception:
        J = {}

    tiles = teselas(Z)
    por_pasada = 1 + len(FT) * len(tiles)
    queda = tope - E['usadas']
    fin_dt = datetime.datetime.combine(fin, datetime.time(0, 0), MAD)
    horas = max(1.0, (fin_dt - ahora).total_seconds() / 3600)
    pasadas = queda // por_pasada
    intervalo = max(MIN_INTERVALO_H, horas / pasadas) if pasadas > 0 else None
    desde = (ahora.timestamp() - E.get('ultima', 0)) / 3600
    print(f'Ciclo {ini}→{fin}: gastadas {E["usadas"]} de {tope} · {por_pasada} por pasada · '
          + (f'una pasada cada {intervalo:.1f} h como mucho' if intervalo else 'cupo agotado'))

    def publica(motivo):
        # copia lo que hubiera y escribe el estado y el JSON nuevos
        if os.path.isdir(PREV):
            shutil.copytree(PREV, PUB, dirs_exist_ok=True, ignore=shutil.ignore_patterns('.git'))
        os.makedirs(PUB, exist_ok=True)
        json.dump(E, open(os.path.join(PUB, 'estado.json'), 'w'), indent=1)
        json.dump(J, open(os.path.join(PUB, 'rainbow.json'), 'w'), separators=(',', ':'))
        open('cambio', 'w').write(motivo)
        print('Publicado:', motivo)

    if intervalo is None:
        if J.get('frames'):
            J.update(frames=[], motivo='cupo', gen=int(ahora.timestamp()))
            publica('sin cupo: se quita la previsión')
        return
    if desde < intervalo - 0.05:
        print(f'Última pasada hace {desde:.1f} h: todavía no toca')
        return
    ll = llueve_cerca()
    if ll is False:
        if J.get('frames') or J.get('motivo') != 'seco':
            J.update(frames=[], motivo='seco', gen=int(ahora.timestamp()))
            publica('no llueve cerca: sin previsión (0 llamadas)')
        return

    k = clave()
    if not k:
        print('No hay clave de Rainbow (Firestore claves/app o secreto RAINBOW_KEY): no se hace nada')
        return
    from PIL import Image
    L = lut()
    q = urllib.parse.quote(k, safe='')
    gast = 0
    try:
        gast += 1
        snap = int(json.loads(baja(f'https://api.rainbow.ai/tiles/v1/snapshot?token={q}'))['snapshot'])
    except Exception as e:
        print('Rainbow no ha dado la hora de la imagen:', type(e).__name__)
        E['usadas'] += gast; E['ultima'] = int(ahora.timestamp())
        publica('fallo al pedir a Rainbow')
        return
    if os.path.isdir(PREV):
        shutil.copytree(PREV, PUB, dirs_exist_ok=True, ignore=shutil.ignore_patterns('.git'))
    base = os.path.join(PUB, 'radar')
    # se guardan solo la imagen nueva y la anterior (por si un móvil tiene aún el JSON viejo)
    if os.path.isdir(base):
        viejas = sorted(d for d in os.listdir(base) if d.isdigit() and int(d) != snap)
        for d in viejas[:-1]:
            shutil.rmtree(os.path.join(base, d))
    frames = []
    for ft in FT:
        ok = 0
        for (x, y) in tiles:
            try:
                gast += 1
                im = Image.open(io.BytesIO(baja(f'https://api.rainbow.ai/tiles/v1/precip/{snap}/{ft}/{Z}/{x}/{y}?token={q}&color=dbz_u8'))).convert('RGBA')
                px = im.load()
                out = Image.new('RGBA', im.size)
                po = out.load()
                for j in range(im.size[1]):
                    for i in range(im.size[0]):
                        r, g, b, a = px[i, j]
                        if a:
                            po[i, j] = L[r]
                d = os.path.join(base, str(snap), str(ft), str(Z), str(x))
                os.makedirs(d, exist_ok=True)
                out.save(os.path.join(d, f'{y}.png'), optimize=True)
                ok += 1
            except Exception as e:
                print(f'Tesela +{ft // 60} min {x}/{y}: fallo ({type(e).__name__})')
        if ok:
            frames.append({'t': snap + ft, 'ft': ft})
    E['usadas'] += gast
    E['ultima'] = int(ahora.timestamp())
    J = {'snap': snap, 'z': Z, 'tiles': tiles, 'frames': frames, 'motivo': 'ok', 'gen': int(ahora.timestamp())}
    print(f'Rainbow: {len(frames)} fotogramas, {gast} llamadas (llevamos {E["usadas"]} de {tope} en el ciclo)')
    os.makedirs(PUB, exist_ok=True)
    json.dump(E, open(os.path.join(PUB, 'estado.json'), 'w'), indent=1)
    json.dump(J, open(os.path.join(PUB, 'rainbow.json'), 'w'), separators=(',', ':'))
    open('cambio', 'w').write('previsión nueva')


if __name__ == '__main__':
    sys.exit(main())
