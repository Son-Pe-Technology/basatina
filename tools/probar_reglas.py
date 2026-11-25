"""
Prueba de las reglas de Firestore CONTRA LA BASE DE DATOS REAL (acción A2 de la EIPD, legal/5).
Lo lanza a mano .github/workflows/probar-reglas.yml (Actions → «Probar reglas» → Run workflow).

Qué hace:
  1. Con la llave FIREBASE_SA crea 3 cuentas de prueba (A y B con correo confirmado, C sin confirmar)
     con su perfil y apodo, y una cuenta anónima.
  2. Con los permisos normales de cada una (como haría la app) intenta cosas permitidas y cosas prohibidas,
     y comprueba que Firebase responde lo que tiene que responder.
  3. Al final borra TODO lo que ha creado (cuentas, perfiles, avisos, contador), pase lo que pase.
Si alguna prueba no da lo esperado, termina en rojo (exit 1) y dice cuál.
Los avisos de prueba son de tipo «veneno» (quedan pendientes de revisar), así que nunca se ven en público.
"""
import json, os, sys, random, string, datetime, urllib.request, urllib.error

KEY = 'AIzaSyBkD97y7lqjMS0sA7zClhQkqZlEgXtkeqk'
P = 'basatina-9a8b5'
BASE = f'projects/{P}/databases/(default)/documents'
FS = 'https://firestore.googleapis.com/v1/' + BASE
IT = 'https://identitytoolkit.googleapis.com/v1/accounts:'
ITA = f'https://identitytoolkit.googleapis.com/v1/projects/{P}/accounts'
R = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))


def pide(url, datos=None, tok=None, metodo=None):
    h = {'Content-Type': 'application/json'}
    if tok: h['Authorization'] = 'Bearer ' + tok
    r = urllib.request.Request(url, data=json.dumps(datos).encode() if datos is not None else None, headers=h, method=metodo)
    with urllib.request.urlopen(r, timeout=60) as f:
        t = f.read()
        return json.loads(t) if t else {}


def token_sa(sa):
    from google.oauth2 import service_account
    import google.auth.transport.requests
    c = service_account.Credentials.from_service_account_info(sa, scopes=['https://www.googleapis.com/auth/cloud-platform'])
    c.refresh(google.auth.transport.requests.Request())
    return c.token


S = lambda v: {'stringValue': v}
I = lambda v: {'integerValue': str(v)}
F = lambda v: {'doubleValue': v}
nom = lambda c, i: f'{BASE}/{c}/{i}'


def commit(writes, tok):
    return pide(FS + ':commit', {'writes': writes}, tok)


# ---------------- pruebas ----------------
RES = []


def prueba(n, texto, espera, fn):
    try:
        fn(); obt = 'permitido'
    except urllib.error.HTTPError as e:
        obt = 'denegado' if e.code in (401, 403) else f'error {e.code}'
    except Exception as e:
        obt = f'error {type(e).__name__}'
    ok = obt == espera
    RES.append(ok)
    print(f"{'✅' if ok else '❌'} {n:>2}. {texto} → {obt}" + ('' if ok else f'  (se esperaba: {espera})'))


def aviso(uid, apodo, tok, id_):
    return commit([
        {'update': {'name': nom('avisos', id_), 'fields': {'tipo': S('veneno'), 'texto': S('Prueba automática de reglas'),
            'lat': F(42.8167), 'lon': F(-1.6432), 'estado': S('pendiente'), 'si': I(0), 'no': I(0), 'ah': S('prueba' + R), 'apodo': S(apodo)}},
         'currentDocument': {'exists': False}, 'updateTransforms': [{'fieldPath': 'creado', 'setToServerValue': 'REQUEST_TIME'}]},
        {'update': {'name': nom('avisos_priv', id_), 'fields': {'autor': S(uid)}}, 'currentDocument': {'exists': False}},
        {'update': {'name': nom('limites', uid), 'fields': {}}, 'updateTransforms': [{'fieldPath': 'ultimo', 'setToServerValue': 'REQUEST_TIME'}]}], tok)


def refran(uid, tok, id_, estado='pendiente'):
    return commit([
        {'update': {'name': nom('refranes', id_), 'fields': {'t': S('Prueba automática de reglas'), 's': S(''), 'p': S('Prueba'), 'estado': S(estado)}},
         'currentDocument': {'exists': False}, 'updateTransforms': [{'fieldPath': 'creado', 'setToServerValue': 'REQUEST_TIME'}]},
        {'update': {'name': nom('limites_rf', uid), 'fields': {}}, 'updateTransforms': [{'fieldPath': 'ultimo', 'setToServerValue': 'REQUEST_TIME'}]}], tok)


def main():
    sa = os.environ.get('FIREBASE_SA')
    if not sa: print('Falta el secreto FIREBASE_SA.'); sys.exit(1)
    adm = token_sa(json.loads(sa))
    U, docs, est_previo = {}, [], None
    manana = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1)).strftime('%Y-%m-%d')
    try:
        # --- preparar cuentas de prueba (la llave salta las reglas) ---
        for k, conf in (('A', True), ('B', True), ('C', False)):
            mail, pw = f'prueba-reglas-{k.lower()}-{R}@basatina.es', 'Prueba-' + R + '-' + k
            j = pide(IT + 'signUp?key=' + KEY, {'email': mail, 'password': pw, 'returnSecureToken': True})
            uid = j['localId']
            if conf: pide(ITA + ':update', {'localId': uid, 'emailVerified': True}, adm)
            tok = pide(IT + 'signInWithPassword?key=' + KEY, {'email': mail, 'password': pw, 'returnSecureToken': True})['idToken']
            ap = f'Prueba{k}{R}'
            U[k] = {'uid': uid, 'tok': tok, 'apodo': ap}
            commit([{'update': {'name': nom('usuarios', uid), 'fields': {'apodo': S(ap), 'apodoK': S(ap.lower()), 'normas': I(2)}},
                     'updateTransforms': [{'fieldPath': 'creado', 'setToServerValue': 'REQUEST_TIME'}, {'fieldPath': 'cambiado', 'setToServerValue': 'REQUEST_TIME'}]},
                    {'update': {'name': nom('apodos', ap.lower()), 'fields': {'uid': S(uid)}}}], adm)
            docs += [nom('usuarios', uid), nom('apodos', ap.lower()), nom('espacio', uid), nom('limites', uid), nom('limites_rf', uid)]
        j = pide(IT + 'signUp?key=' + KEY, {'returnSecureToken': True})
        U['anon'] = {'uid': j['localId'], 'tok': j['idToken']}
        docs += [nom('limites', j['localId']), nom('limites_rf', j['localId'])]
        try: est_previo = pide(f'{FS}/estadisticas/{manana}', tok=adm).get('fields')
        except urllib.error.HTTPError: est_previo = None
        A, B, C, N = U['A'], U['B'], U['C'], U['anon']
        X, Y, Z = 'pruebaX' + R, 'pruebaY' + R, 'pruebaZ' + R
        docs += [nom('avisos', i) for i in (X, Y, Z)] + [nom('avisos_priv', i) for i in (X, Y, Z)]
        RF1, RF2, RF3 = 'pruebaRf1' + R, 'pruebaRf2' + R, 'pruebaRf3' + R
        docs += [nom('refranes', i) for i in (RF1, RF2, RF3)]
        print('Cuentas de prueba creadas. Empiezan las pruebas:\n')

        # --- perfiles y Mi Espacio ---
        prueba(1, 'B lee el perfil de A', 'denegado', lambda: pide(f"{FS}/usuarios/{A['uid']}", tok=B['tok']))
        prueba(2, 'A lee su propio perfil', 'permitido', lambda: pide(f"{FS}/usuarios/{A['uid']}", tok=A['tok']))
        prueba(3, 'A guarda su Mi Espacio', 'permitido', lambda: pide(f"{FS}/espacio/{A['uid']}", {'fields': {'d_notas': S('[]')}}, A['tok'], 'PATCH'))
        prueba(4, 'B lee el Mi Espacio de A', 'denegado', lambda: pide(f"{FS}/espacio/{A['uid']}", tok=B['tok']))
        prueba(5, 'B escribe en el Mi Espacio de A', 'denegado', lambda: pide(f"{FS}/espacio/{A['uid']}", {'fields': {'d_notas': S('[1]')}}, B['tok'], 'PATCH'))
        prueba(6, 'C (correo SIN confirmar) guarda Mi Espacio', 'denegado', lambda: pide(f"{FS}/espacio/{C['uid']}", {'fields': {'d_notas': S('[]')}}, C['tok'], 'PATCH'))
        # --- apodos ---
        prueba(7, 'B se queda el apodo de A', 'denegado', lambda: commit([{'update': {'name': nom('apodos', A['apodo'].lower()), 'fields': {'uid': S(B['uid'])}}}], B['tok']))
        prueba(8, 'B se pone el apodo «admin_' + R + '»', 'denegado', lambda: commit([
            {'update': {'name': nom('usuarios', B['uid']), 'fields': {'apodo': S('admin_' + R), 'apodoK': S('admin_' + R)}}, 'updateMask': {'fieldPaths': ['apodo', 'apodoK']}},
            {'update': {'name': nom('apodos', 'admin_' + R), 'fields': {'uid': S(B['uid'])}}, 'currentDocument': {'exists': False}}], B['tok']))
        # --- avisos ---
        prueba(9, 'Anónimo (sin cuenta) envía un aviso', 'denegado', lambda: aviso(N['uid'], 'Nadie', N['tok'], Z))
        prueba(10, 'C (correo SIN confirmar) envía un aviso', 'denegado', lambda: aviso(C['uid'], C['apodo'], C['tok'], Z))
        prueba(11, 'B envía un aviso con el apodo de A', 'denegado', lambda: aviso(B['uid'], A['apodo'], B['tok'], Z))
        prueba(12, 'A envía un aviso con su apodo', 'permitido', lambda: aviso(A['uid'], A['apodo'], A['tok'], X))
        prueba(13, 'A envía otro aviso enseguida (límite de 2 min)', 'denegado', lambda: aviso(A['uid'], A['apodo'], A['tok'], Y))
        prueba(14, 'B mira quién escribió el aviso de A', 'denegado', lambda: pide(f"{FS}/avisos_priv/{X}", tok=B['tok']))
        prueba(15, 'B ve el aviso pendiente de A', 'denegado', lambda: pide(f"{FS}/avisos/{X}", tok=B['tok']))
        prueba(16, 'Sin entrar, ve el aviso pendiente de A', 'denegado', lambda: pide(f"{FS}/avisos/{X}"))
        prueba(17, 'A ve su propio aviso pendiente', 'permitido', lambda: pide(f"{FS}/avisos/{X}", tok=A['tok']))
        prueba(18, 'B borra el aviso de A', 'denegado', lambda: commit([{'delete': nom('avisos', X)}, {'delete': nom('avisos_priv', X)}], B['tok']))
        prueba(19, 'B se publica él mismo un aviso pendiente de A', 'denegado', lambda: commit([{'update': {'name': nom('avisos', X), 'fields': {'estado': S('publicado')}}, 'updateMask': {'fieldPaths': ['estado']}}], B['tok']))
        # --- moderación y contador ---
        prueba(20, 'B lee las denuncias', 'denegado', lambda: pide(f"{FS}/denuncias", tok=B['tok']))
        prueba(21, 'B se desbloquea / se apunta como bloqueado a otro', 'denegado', lambda: commit([{'update': {'name': nom('bloqueados', A['uid']), 'fields': {}}}], B['tok']))
        prueba(22, 'Sin entrar, suma +1 al contador de mañana', 'permitido', lambda: commit([{'transform': {'document': nom('estadisticas', manana), 'fieldTransforms': [{'fieldPath': 'activos', 'increment': I(1)}]}}], None))
        prueba(23, 'Sin entrar, suma +50 al contador', 'denegado', lambda: commit([{'transform': {'document': nom('estadisticas', manana), 'fieldTransforms': [{'fieldPath': 'activos', 'increment': I(50)}]}}], None))
        prueba(24, 'Sin entrar, lee el contador', 'denegado', lambda: pide(f"{FS}/estadisticas/{manana}"))
        prueba(25, 'A borra su propio aviso', 'permitido', lambda: commit([{'delete': nom('avisos', X)}, {'delete': nom('avisos_priv', X)}], A['tok']))

        # --- 🗣️ refranes (25 nov. 2026) ---
        prueba(26, 'Anónimo manda un refrán (queda pendiente)', 'permitido', lambda: refran(N['uid'], N['tok'], RF1))
        prueba(27, 'Anónimo manda otro refrán enseguida (límite de 1 min)', 'denegado', lambda: refran(N['uid'], N['tok'], RF2))
        prueba(28, 'B manda un refrán ya publicado', 'denegado', lambda: refran(B['uid'], B['tok'], RF3, 'publicado'))
        prueba(29, 'Sin entrar, lee el refrán pendiente', 'denegado', lambda: pide(f"{FS}/refranes/{RF1}"))
        prueba(30, 'Anónimo se publica él mismo el refrán', 'denegado', lambda: commit([{'update': {'name': nom('refranes', RF1), 'fields': {'estado': S('publicado')}}, 'updateMask': {'fieldPaths': ['estado']}}], N['tok']))
        prueba(31, 'Anónimo borra el refrán pendiente', 'denegado', lambda: commit([{'delete': nom('refranes', RF1)}], N['tok']))
        commit([{'update': {'name': nom('refranes', RF1), 'fields': {'estado': S('publicado')}}, 'updateMask': {'fieldPaths': ['estado']}}], adm)
        prueba(32, 'Sin entrar, lee el refrán ya publicado', 'permitido', lambda: pide(f"{FS}/refranes/{RF1}"))
    finally:
        # --- limpiar SIEMPRE ---
        try:
            for i in range(0, len(docs), 400): commit([{'delete': d} for d in docs[i:i + 400]], adm)
            if est_previo is None:
                commit([{'delete': nom('estadisticas', manana)}], adm)
            else:
                commit([{'update': {'name': nom('estadisticas', manana), 'fields': est_previo}}], adm)
            ids = [u['uid'] for u in U.values()]
            if ids: pide(ITA + ':batchDelete', {'localIds': ids, 'force': True}, adm)
            print('\nLimpieza hecha: borradas las cuentas y los datos de prueba.')
        except Exception as e:
            print('\n⚠️ Fallo al limpiar:', type(e).__name__, str(e)[:150])
    bien = sum(RES)
    print(f'\nResultado: {bien} de {len(RES)} pruebas correctas.')
    if bien != len(RES): sys.exit(1)


if __name__ == '__main__':
    main()
