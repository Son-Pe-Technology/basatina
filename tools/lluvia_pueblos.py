"""🌧️ Lluvia de las próximas horas, cuarto de hora a cuarto de hora, en toda Navarra (26 nov. 2026, lo pidió Pedro)

Cada hora (GitHub Actions, .github/workflows/lluvia.yml) pide a Open-Meteo (gratis, sin clave) la lluvia prevista
en tramos de 15 minutos para las próximas 6 horas en unos 260 puntos que cubren Navarra (uno cada ~5 km,
sacados de los pueblos de web/pueblos.js) y lo deja en la rama «lluvia» del repositorio (lluvia.json).
La app (web/lluvia-pueblos.js) lo lee de ahí para decir «empieza a llover hacia las 21:15» en El tiempo y
para la lista «¿Dónde va a llover?». Así los móviles no tienen que pedir nada a nadie.

Por qué cada hora y no más: los modelos de Open-Meteo para aquí se renuevan como mucho cada hora, y el plan
gratuito de Open-Meteo permite 10.000 consultas al día (cada punto cuenta como una): 260 × 24 ≈ 6.300.
Si Open-Meteo falla, no se publica nada y la app sigue con lo anterior (o lo pide ella misma si es muy viejo).
"""
import datetime, json, math, os, sys, time, urllib.request
from zoneinfo import ZoneInfo

PUB = os.environ.get('LLUVIA_PUB', 'pub')
RAW = 'https://raw.githubusercontent.com/Son-Pe-Technology/basatina/main/web/pueblos.js'
CELDA = 0.05            # grados de latitud (~5,5 km); en longitud se estira para que sea casi cuadrada
LOTE = 60               # puntos por consulta
CUARTOS = 24            # 6 horas
# los pueblos de la lista de El tiempo (TOWNS) dan nombre a su celda, para que salgan nombres conocidos
CONOCIDOS = {'Pamplona', 'Tudela', 'Estella', 'Tafalla', 'Sangüesa', 'Alsasua', 'Elizondo', 'Lekunberri', 'Aoiz',
             'Zubiri', 'Burguete', 'Ochagavía', 'Isaba', 'Roncal', 'Lumbier', 'Puente la Reina', 'Viana', 'Los Arcos',
             'Olite', 'Peralta', 'Corella', 'Cintruénigo', 'Cascante', 'Bera', 'Leitza', 'Doneztebe', 'Lesaka',
             'Irurtzun', 'Huarte', 'Burlada', 'Villava', 'Barañáin', 'Lodosa', 'San Adrián', 'Caparroso', 'Carcastillo'}


def baja(url, timeout=60):
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'BasatiNA-lluvia'}), timeout=timeout) as f:
        return f.read()


def pueblos():
    try:
        s = baja(RAW).decode('utf-8')
    except Exception:
        s = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'web', 'pueblos.js'), encoding='utf-8').read()
    return json.loads(s[s.index('{'):s.rindex('}') + 1])['pueblos']


def puntos():
    """Un punto por celda de ~5 km: el pueblo más céntrico de la celda (o uno conocido si lo hay)."""
    cel = {}
    for p in pueblos():
        la, lo = p['pt']
        k = (round(la / CELDA), round(lo / (CELDA * 1.35)))
        cel.setdefault(k, []).append(p)
    out = []
    for k, L in sorted(cel.items()):
        cla, clo = sum(p['pt'][0] for p in L) / len(L), sum(p['pt'][1] for p in L) / len(L)
        con = [p for p in L if p['n'].split(' / ')[0] in CONOCIDOS or any(c in p['n'].split(' / ') for c in CONOCIDOS)]
        r = min(con or L, key=lambda p: (p['pt'][0] - cla) ** 2 + ((p['pt'][1] - clo) * 0.73) ** 2)
        out.append((r['n'], round(r['pt'][0], 4), round(r['pt'][1], 4)))
    return out


def consulta(lote):
    la = ','.join(str(p[1]) for p in lote)
    lo = ','.join(str(p[2]) for p in lote)
    u = (f'https://api.open-meteo.com/v1/forecast?latitude={la}&longitude={lo}'
         f'&minutely_15=precipitation,snowfall&forecast_minutely_15={CUARTOS}&timezone=Europe%2FMadrid')
    for intento in range(3):
        try:
            d = json.loads(baja(u))
            return d if isinstance(d, list) else [d]
        except Exception as e:
            print(f'Open-Meteo falló ({type(e).__name__}), intento {intento + 1}')
            time.sleep(20 * (intento + 1))
    raise RuntimeError('Open-Meteo no responde')


def main():
    P = puntos()
    print(f'{len(P)} puntos en Navarra')
    filas, t0 = [], None
    for i in range(0, len(P), LOTE):
        lote = P[i:i + LOTE]
        try:
            R = consulta(lote)
        except RuntimeError:
            print('Sin datos de Open-Meteo: no se publica nada (la app sigue con lo anterior)')
            return 0
        for p, r in zip(lote, R):
            m = r.get('minutely_15') or {}
            tt, pr, sn = m.get('time') or [], m.get('precipitation') or [], m.get('snowfall') or []
            if not tt:
                continue
            if t0 is None:
                t0 = tt[0]
            if tt[0] != t0:   # todos deben empezar a la misma hora; si no, se ajusta
                desf = int((datetime.datetime.fromisoformat(tt[0]) - datetime.datetime.fromisoformat(t0)).total_seconds() // 900)
                pr = [None] * desf + pr if desf > 0 else pr[-desf:]
                sn = [None] * desf + sn if desf > 0 else sn[-desf:]
            v = [round((x or 0) * 100) for x in pr[:CUARTOS]]
            nieve = any((x or 0) > 0 for x in sn[:CUARTOS])
            filas.append([p[0], p[1], p[2], v] + ([1] if nieve else []))
        time.sleep(2)
    if not filas:
        print('Open-Meteo no ha dado datos: no se publica nada')
        return 0
    ahora = datetime.datetime.now(ZoneInfo('Europe/Madrid'))
    J = {'gen': int(ahora.timestamp()), 't0': t0, 'paso': 15, 'unidad': 'centésimas de mm en cada cuarto de hora',
         'fuente': 'Open-Meteo (CC BY 4.0)', 'p': filas}
    os.makedirs(PUB, exist_ok=True)
    json.dump(J, open(os.path.join(PUB, 'lluvia.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    llueve = sum(1 for f in filas if any(x >= 5 for x in f[3][:4]))
    print(f'Publicado: {len(filas)} puntos desde {t0}; con lluvia en la próxima hora: {llueve}')
    open('cambio', 'w').write('ok')
    return 0


if __name__ == '__main__':
    sys.exit(main())
