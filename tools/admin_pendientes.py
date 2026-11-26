"""🔔 Aviso a los administradores de lo pendiente de revisar (26 nov. 2026, lo pidió Pedro)

Cada 10 minutos (GitHub Actions, .github/workflows/admin-avisos.yml) mira qué hay por revisar:
  · 🤖 borradores de la IA (repositorio privado basatina-borradores, ia_borradores.json: estado borrador o duda)
  · 🗣️ refranes que ha mandado la gente (Firestore «refranes», estado pendiente)
  · 📣 alertas ciudadanas esperando revisión (Firestore «avisos», estado pendiente)
  · 🚩 denuncias de avisos publicados (Firestore «denuncias»)
  · 📸 fotos que ha mandado la gente por «Envía tu foto» (Cloudinary, etiqueta basatina_recibida) que aún no
    están ni publicadas ni descartadas en fotos/galeria.json (26 nov. 2026)
Si hay algo NUEVO desde la última vez, manda un aviso push al tema «admin» (solo se apuntan Pedro y Sonia,
desde el ⭐ Panel de administración). Al tocarlo se abre el panel.

  · De 23:00 a 7:00 (hora de Madrid) no se manda nada: lo que entre de noche se avisa a partir de las 7.
  · Lo ya avisado se guarda en Firestore admin/push_pend (solo lo pueden leer los administradores),
    así no se repite el aviso de lo mismo.
  · El repositorio y los registros son públicos: aquí NUNCA se imprimen textos ni identificadores, solo cuántos hay.

Necesita los secretos FIREBASE_SA (Firestore y push) y BORRADORES_TOKEN (para bajar los borradores, lo hace el workflow).
Con PUSH_PRUEBA=1 manda el aviso al tema «admin-prueba».
"""
import json, os, sys, datetime, urllib.request, urllib.error
from zoneinfo import ZoneInfo

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from push import enviar

P = 'basatina-9a8b5'
FS = f'https://firestore.googleapis.com/v1/projects/{P}/databases/(default)/documents'
BORR = os.environ.get('IA_ARCH', 'priv/ia_borradores.json')
SILENCIO = (23, 7)   # de las 23 a las 7, sin avisos


def token(sa):
    from google.oauth2 import service_account
    import google.auth.transport.requests
    c = service_account.Credentials.from_service_account_info(sa, scopes=['https://www.googleapis.com/auth/datastore'])
    c.refresh(google.auth.transport.requests.Request())
    return c.token


def pide(url, datos=None, metodo=None, tok=None):
    r = urllib.request.Request(url, data=json.dumps(datos).encode() if datos is not None else None, method=metodo,
                               headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tok})
    with urllib.request.urlopen(r, timeout=60) as f:
        t = f.read()
        return json.loads(t) if t else {}


def ids(tok, col, estado=None):
    """Identificadores de los documentos de `col` (con estado == `estado` si se da)."""
    q = {'from': [{'collectionId': col}], 'select': {'fields': [{'fieldPath': '__name__'}]}, 'limit': 500}
    if estado:
        q['where'] = {'fieldFilter': {'field': {'fieldPath': 'estado'}, 'op': 'EQUAL', 'value': {'stringValue': estado}}}
    out = pide(f'{FS}:runQuery', {'structuredQuery': q}, 'POST', tok)
    return [col + ':' + r['document']['name'].rsplit('/', 1)[1] for r in out if 'document' in r]


def borradores():
    try:
        D = json.load(open(BORR, encoding='utf-8'))
    except Exception:
        return None
    return ['ia:' + str(x.get('id')) for x in D.get('items', []) if x.get('estado') in ('borrador', 'duda')]


RAW = 'https://raw.githubusercontent.com/Son-Pe-Technology/basatina/main/'


def fotos():
    """Fotos recibidas en Cloudinary que no están ni publicadas ni descartadas (None si no se puede mirar)."""
    def js(u):
        with urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'BasatiNA-avisos'}), timeout=60) as f:
            return json.loads(f.read())
    try:
        cloud = (js(RAW + 'config/cloudinary.json').get('key') or '').strip()
    except Exception:
        return []                       # Cloudinary sin configurar: no hay fotos
    if not cloud:
        return []
    try:
        G = js(RAW + 'fotos/galeria.json')
        hecho = set(f.get('id') for f in G.get('fotos', [])) | set(G.get('descartadas', []))
        try:
            L = js(f'https://res.cloudinary.com/{cloud}/image/list/basatina_recibida.json').get('resources', [])
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return []               # aún no ha llegado ninguna
            raise
        return ['foto:' + x['public_id'] for x in L if x.get('public_id') not in hecho]
    except Exception as e:
        print('No se pudo mirar fotos', type(e).__name__)
        return None


def main():
    sa = os.environ.get('FIREBASE_SA')
    if not sa:
        print('Sin el secreto FIREBASE_SA: nada.'); return
    tok = token(json.loads(sa))
    G = {'ia': borradores(), 'fotos': fotos()}
    for k, col, est in (('refranes', 'refranes', 'pendiente'), ('alertas', 'avisos', 'pendiente'), ('denuncias', 'denuncias', None)):
        try:
            G[k] = ids(tok, col, est)
        except Exception as e:
            print('No se pudo mirar', k, e); G[k] = None
    print('Pendiente:', {k: (len(v) if v is not None else '?') for k, v in G.items()})

    # lo ya avisado
    try:
        d = pide(f'{FS}/admin/push_pend', tok=tok)
        vistos = set(v['stringValue'] for v in d.get('fields', {}).get('vistos', {}).get('arrayValue', {}).get('values', []))
    except Exception:
        vistos = set()
    ahora = set(i for v in G.values() if v for i in v)
    nuevos = {k: [i for i in (v or []) if i not in vistos] for k, v in G.items()}
    n = sum(len(v) for v in nuevos.values())
    h = datetime.datetime.now(ZoneInfo('Europe/Madrid')).hour
    noche = h >= SILENCIO[0] or h < SILENCIO[1]
    if n and noche:
        print('Hay %d nuevo(s), pero es de noche (%d h): se avisa a partir de las 7.' % (n, h)); return
    if n:
        NOM = {'ia': ('noticia de la IA', 'noticias de la IA'), 'refranes': ('refrán', 'refranes'),
               'alertas': ('alerta ciudadana', 'alertas ciudadanas'), 'denuncias': ('denuncia', 'denuncias'),
               'fotos': ('foto de la gente', 'fotos de la gente')}
        partes = ['%d %s' % (len(v), NOM[k][len(v) != 1]) for k, v in nuevos.items() if v]
        total = len(ahora)
        titulo = '⭐ BasatiNA: tienes cosas por revisar'
        texto = 'Nuevo: ' + ', '.join(partes) + '.' + (' En total hay %d pendientes.' % total if total > n else '') + ' Toca para abrir el panel.'
        if not enviar('admin', titulo, texto, 'superadm'):
            return   # no se marca como avisado: se reintenta en la próxima pasada
        print('Aviso enviado: %d nuevo(s).' % n)
    # se guarda lo pendiente de ahora (lo ya revisado sale de la lista solo)
    if ahora != vistos and all(v is not None for v in G.values()):
        pide(f'{FS}/admin/push_pend?updateMask.fieldPaths=vistos&updateMask.fieldPaths=t', {'fields': {
            'vistos': {'arrayValue': {'values': [{'stringValue': i} for i in sorted(ahora)]}},
            't': {'timestampValue': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}}}, 'PATCH', tok)
    elif ahora != vistos:
        # si algo no se pudo mirar, no se borra lo visto de eso (para no repetir avisos): solo se añade
        nv = sorted(vistos | ahora)
        pide(f'{FS}/admin/push_pend?updateMask.fieldPaths=vistos', {'fields': {
            'vistos': {'arrayValue': {'values': [{'stringValue': i} for i in nv]}}}}, 'PATCH', tok)


if __name__ == '__main__':
    main()
