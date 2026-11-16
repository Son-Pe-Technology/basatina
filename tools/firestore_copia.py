"""
Copia de seguridad de Firestore (acción A1 de la EIPD, legal/5).
Descarga TODAS las colecciones de la base de datos a un archivo JSON (por defecto copia.json).
El robot .github/workflows/copia.yml lo cifra después con la contraseña del secreto BACKUP_PASS
y lo guarda 35 días como «artifact» de GitHub. El archivo sin cifrar se borra en el mismo paso.

Necesita el secreto FIREBASE_SA (la misma llave que la limpieza de cuentas).
Ojo: NO copia Firebase Authentication (correos y contraseñas): eso solo lo guarda Google.

SEGURIDAD: no imprime nada de los datos, solo cuántos documentos hay en cada colección.
Restaurar: tools/firestore_restaurar.py (explicado allí).
"""
import json, os, sys, datetime, urllib.request, urllib.parse

P = 'basatina-9a8b5'
RAIZ = f'https://firestore.googleapis.com/v1/projects/{P}/databases/(default)/documents'


def pide(url, datos=None, tok=None):
    h = {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tok}
    r = urllib.request.Request(url, data=json.dumps(datos).encode() if datos is not None else None, headers=h)
    with urllib.request.urlopen(r, timeout=120) as f:
        t = f.read()
        return json.loads(t) if t else {}


def token(sa):
    from google.oauth2 import service_account
    import google.auth.transport.requests
    c = service_account.Credentials.from_service_account_info(sa, scopes=['https://www.googleapis.com/auth/datastore'])
    c.refresh(google.auth.transport.requests.Request())
    return c.token


def colecciones(padre, tok):
    out, page = [], ''
    while True:
        j = pide(padre + ':listCollectionIds', {'pageSize': 300, **({'pageToken': page} if page else {})}, tok)
        out += j.get('collectionIds', [])
        page = j.get('nextPageToken')
        if not page: return out


def documentos(padre, col, tok):
    out, page = [], ''
    while True:
        j = pide(f'{padre}/{col}?pageSize=300&showMissing=false' + (f'&pageToken={urllib.parse.quote(page)}' if page else ''), tok=tok)
        out += j.get('documents', [])
        page = j.get('nextPageToken')
        if not page: return out


def copia(padre, tok, todo, cuenta):
    for col in colecciones(padre, tok):
        docs = documentos(padre, col, tok)
        for d in docs:
            nombre = d['name'].split('/documents/', 1)[1]
            todo[nombre] = d.get('fields', {})
            copia(f'{RAIZ}/{nombre}', tok, todo, cuenta)          # subcolecciones, si las hubiera
        cuenta[col] = cuenta.get(col, 0) + len(docs)


def main():
    sa = os.environ.get('FIREBASE_SA')
    if not sa:
        print('Sin el secreto FIREBASE_SA: no se hace copia.'); sys.exit(1)
    salida = sys.argv[1] if len(sys.argv) > 1 else 'copia.json'
    tok = token(json.loads(sa))
    todo, cuenta = {}, {}
    copia(RAIZ, tok, todo, cuenta)
    with open(salida, 'w') as f:
        json.dump({'proyecto': P, 'fecha': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                   'documentos': todo}, f, ensure_ascii=False)
    print('Copia hecha:', sum(cuenta.values()), 'documentos ·', dict(sorted(cuenta.items())))


if __name__ == '__main__':
    try: main()
    except Exception as e:
        print('Error en la copia:', type(e).__name__, str(e)[:200]); sys.exit(1)
