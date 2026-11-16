"""
Limpieza de CUENTAS (lo que promete la política de privacidad, apartado 3.0):
  · cuentas que nunca confirmaron el correo → se borran a los 30 días de crearlas
  · cuentas sin usar en 2 años → se borran con todos sus datos (perfil, apodo, Mi Espacio, avisos)
  · códigos anónimos (los de denunciar sin cuenta) sin usar en 1 año → se borran
La cuenta de administración (CM_ADMIN_EMAIL) no se toca nunca.

Necesita el secreto de GitHub FIREBASE_SA: la «clave privada» de la cuenta de servicio de Firebase
(Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada), pegada entera.
Con esa clave el robot puede listar y borrar usuarios, cosa que el administrador normal no puede.
Si no hay secreto, no hace nada.

SEGURIDAD
  · El repositorio es público y los registros de GitHub Actions también: aquí NUNCA se imprimen
    correos ni identificadores, solo cuántas cuentas se borran.
  · Si fuera a borrar más de la mitad de las cuentas (y más de 20), se para: sería un fallo.
  · Con SIMULAR=1 solo cuenta lo que borraría, sin borrar nada (para probar).
Lo lanza .github/workflows/comunidad.yml cada noche, después de la limpieza de avisos.
"""
import json, os, sys, urllib.request, urllib.parse, datetime

P = 'basatina-9a8b5'
FS = f'https://firestore.googleapis.com/v1/projects/{P}/databases/(default)/documents'
IT = f'https://identitytoolkit.googleapis.com/v1/projects/{P}/accounts'
AHORA = datetime.datetime.now(datetime.timezone.utc)
DIA = datetime.timedelta(days=1)
SIN_CONFIRMAR, SIN_USO, ANONIMOS = 30 * DIA, 730 * DIA, 365 * DIA


def pide(url, datos=None, metodo=None, tok=None):
    h = {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tok}
    r = urllib.request.Request(url, data=json.dumps(datos).encode() if datos is not None else None, headers=h, method=metodo)
    with urllib.request.urlopen(r, timeout=60) as f:
        t = f.read()
        return json.loads(t) if t else {}


def token(sa):
    from google.oauth2 import service_account
    import google.auth.transport.requests
    c = service_account.Credentials.from_service_account_info(sa, scopes=['https://www.googleapis.com/auth/cloud-platform'])
    c.refresh(google.auth.transport.requests.Request())
    return c.token


def ms(v):
    try: return datetime.datetime.fromtimestamp(int(v) / 1000, datetime.timezone.utc)
    except Exception: return None


def iso(v):
    try: return datetime.datetime.fromisoformat(v.replace('Z', '+00:00'))
    except Exception: return None


def usuarios(tok):
    out, page = [], ''
    while True:
        j = pide(f'{IT}:batchGet?maxResults=1000' + (f'&nextPageToken={urllib.parse.quote(page)}' if page else ''), tok=tok)
        out += j.get('users', [])
        page = j.get('nextPageToken')
        if not page or not j.get('users'): return out


def ultimo_uso(u):
    f = [x for x in (ms(u.get('createdAt')), ms(u.get('lastLoginAt')), iso(u.get('lastRefreshAt') or '')) if x]
    return max(f) if f else None


def que_hacer(u, admin):
    """Devuelve el motivo para borrar la cuenta, o None si se queda."""
    email = (u.get('email') or '').lower()
    if admin and email == admin: return None
    if u.get('disabled'): return None                      # las bloqueadas a mano las decidís vosotros
    creada, uso = ms(u.get('createdAt')), ultimo_uso(u)
    if not creada or not uso: return None
    if email:
        if not u.get('emailVerified') and AHORA > creada + SIN_CONFIRMAR: return 'sin_confirmar'
        if AHORA > uso + SIN_USO: return 'sin_uso_2_anos'
    elif not u.get('providerUserInfo') and AHORA > uso + ANONIMOS:
        return 'anonimo_1_ano'
    return None


def borra_datos(uid, tok):
    """Perfil, apodo, Mi Espacio, límite y avisos de esa cuenta (la clave de servicio salta las reglas)."""
    W = []
    try:
        p = pide(f'{FS}/usuarios/{uid}', tok=tok).get('fields', {})
        k = p.get('apodoK', {}).get('stringValue')
        if k: W.append({'delete': f'projects/{P}/databases/(default)/documents/apodos/{k}'})
    except Exception:
        pass
    q = pide(FS + ':runQuery', {'structuredQuery': {'from': [{'collectionId': 'avisos_priv'}],
              'where': {'fieldFilter': {'field': {'fieldPath': 'autor'}, 'op': 'EQUAL', 'value': {'stringValue': uid}}}}}, tok=tok)
    for x in q or []:
        if x.get('document'):
            i = x['document']['name'].rsplit('/', 1)[1]
            W += [{'delete': f'projects/{P}/databases/(default)/documents/avisos/{i}'}, {'delete': x['document']['name']}]
    for col in ('usuarios', 'espacio', 'limites'):
        W.append({'delete': f'projects/{P}/databases/(default)/documents/{col}/{uid}'})
    for i in range(0, len(W), 400):
        pide(FS + ':commit', {'writes': W[i:i + 400]}, tok=tok)


def main():
    sa = os.environ.get('FIREBASE_SA')
    if not sa:
        print('Sin el secreto FIREBASE_SA: no se limpian cuentas.'); return
    simular = os.environ.get('SIMULAR') == '1'
    admin = (os.environ.get('CM_ADMIN_EMAIL') or 'administracion@sonpe-technology.es').lower()
    tok = token(json.loads(sa))
    U = usuarios(tok)
    borrar = {}
    for u in U:
        m = que_hacer(u, admin)
        if m: borrar.setdefault(m, []).append(u['localId'])
    total = sum(len(v) for v in borrar.values())
    resumen = {m: len(v) for m, v in borrar.items()}
    con_correo = sum(1 for u in U if u.get('email'))
    print(f'Cuentas: {len(U)} ({con_correo} con correo, {len(U) - con_correo} anónimas) · a borrar: {resumen or "ninguna"}')
    if total > 20 and total > len(U) / 2:
        print('⚠️ Iba a borrar más de la mitad de las cuentas: me paro por si es un fallo. Revisadlo.'); sys.exit(1)
    if simular:
        print('SIMULAR=1: no se ha borrado nada.'); return
    for m, ids in borrar.items():
        for uid in ids:
            if m != 'anonimo_1_ano': borra_datos(uid, tok)
            else:
                try: pide(f'{FS}/limites/{uid}', metodo='DELETE', tok=tok)
                except Exception: pass
        for i in range(0, len(ids), 500):
            pide(f'{IT}:batchDelete', {'localIds': ids[i:i + 500], 'force': True}, tok=tok)
    print('Hecho. Borradas:', resumen or 'ninguna')


if __name__ == '__main__':
    try: main()
    except Exception as e:
        print('Error en la limpieza de cuentas:', type(e).__name__, str(e)[:200]); sys.exit(1)
