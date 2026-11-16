"""
Limpieza nocturna de la Comunidad de avisos (lo que promete la política de privacidad):
  · avisos (y su ficha privada y sus votos) → se borran 30 días después de caducar
  · denuncias → 6 meses · bloqueos → 12 meses · controles antispam («limites») → 30 días
  · registro de moderación («moderacion») → 12 meses
Entra como administrador con los secretos de GitHub CM_ADMIN_EMAIL y CM_ADMIN_PASS
(Settings → Secrets and variables → Actions). Lo lanza .github/workflows/comunidad.yml cada noche.
Si no hay secretos, no hace nada.
"""
import json, os, sys, urllib.request, urllib.parse, datetime

KEY = 'AIzaSyBkD97y7lqjMS0sA7zClhQkqZlEgXtkeqk'
P = 'basatina-9a8b5'
FS = f'https://firestore.googleapis.com/v1/projects/{P}/databases/(default)/documents'
HORAS = {'arbol': 72, 'desprendimiento': 72, 'camino': 72, 'lluvia': 6, 'crecida': 24,
         'animal': 6, 'accidente': 6, 'veneno': 168, 'otro': 24}
AHORA = datetime.datetime.now(datetime.timezone.utc)
DIA = datetime.timedelta(days=1)


def pide(url, datos=None, metodo=None, tok=None):
    h = {'Content-Type': 'application/json'}
    if tok: h['Authorization'] = 'Bearer ' + tok
    r = urllib.request.Request(url, data=json.dumps(datos).encode() if datos is not None else None, headers=h, method=metodo)
    with urllib.request.urlopen(r, timeout=60) as f:
        t = f.read()
        return json.loads(t) if t else {}


def fecha(v):
    if not v: return None
    s = v.get('timestampValue') or v.get('stringValue')
    try: return datetime.datetime.fromisoformat(s.replace('Z', '+00:00'))
    except Exception: return None


def todos(col, tok):
    out, page = [], ''
    while True:
        j = pide(f'{FS}/{col}?pageSize=300' + (f'&pageToken={page}' if page else ''), tok=tok)
        out += j.get('documents', [])
        page = j.get('nextPageToken')
        if not page: return out


def borra(nombre, tok):
    pide('https://firestore.googleapis.com/v1/' + nombre, metodo='DELETE', tok=tok)


def main():
    mail, clave = os.environ.get('CM_ADMIN_EMAIL'), os.environ.get('CM_ADMIN_PASS')
    if not mail or not clave:
        print('Sin secretos CM_ADMIN_EMAIL / CM_ADMIN_PASS: no se limpia nada.'); return
    tok = pide('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + KEY,
               {'email': mail, 'password': clave, 'returnSecureToken': True})['idToken']
    n = {'avisos': 0, 'votos': 0, 'denuncias': 0, 'bloqueados': 0, 'limites': 0, 'moderacion': 0}
    viejos = set()
    for d in todos('avisos', tok):
        f = d.get('fields', {})
        c = fecha(f.get('creado'))
        h = HORAS.get(f.get('tipo', {}).get('stringValue'), 168)
        if c and AHORA > c + datetime.timedelta(hours=h) + 30 * DIA:
            i = d['name'].rsplit('/', 1)[1]
            viejos.add(i)
            borra(d['name'], tok)
            try: borra(f'projects/{P}/databases/(default)/documents/avisos_priv/{i}', tok)
            except Exception: pass
            n['avisos'] += 1
    for d in todos('votos', tok):
        a = d.get('fields', {}).get('aviso', {}).get('stringValue')
        if a in viejos: borra(d['name'], tok); n['votos'] += 1
    for col, campo, dias in [('denuncias', 'creado', 183), ('bloqueados', 'desde', 365), ('limites', 'ultimo', 30), ('moderacion', 'cuando', 365)]:
        for d in todos(col, tok):
            c = fecha(d.get('fields', {}).get(campo))
            if c and AHORA > c + dias * DIA: borra(d['name'], tok); n[col] += 1
    pend = len([1 for d in todos('avisos', tok) if d.get('fields', {}).get('estado', {}).get('stringValue') == 'pendiente'])
    den = len(todos('denuncias', tok))
    print('Borrados:', n, '· Pendientes de revisar:', pend, '· Denuncias abiertas:', den)


if __name__ == '__main__':
    try: main()
    except Exception as e:
        print('Error en la limpieza:', e); sys.exit(1)
