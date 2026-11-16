"""
Restaurar una copia de seguridad de Firestore (hecha por tools/firestore_copia.py).

CÓMO (desde un ordenador con Python; no hace falta hacerlo nunca salvo desastre):
  1. GitHub → Actions → «Copia de seguridad» → la ejecución que quieras → abajo, «Artifacts» → descargar.
     Se descarga un .zip con copia.json.gpg dentro.
  2. Descifrar (pide la contraseña de BACKUP_PASS):
        gpg --decrypt copia.json.gpg > copia.json
  3. Probar sin escribir nada (solo cuenta lo que haría):
        FIREBASE_SA="$(cat llave.json)" python3 tools/firestore_restaurar.py copia.json
  4. Restaurar de verdad (sobrescribe los documentos que estén en la copia; no borra los que no estén):
        FIREBASE_SA="$(cat llave.json)" python3 tools/firestore_restaurar.py copia.json --de-verdad
     Solo una colección:   ... --de-verdad --solo avisos
  5. Borrar copia.json, copia.json.gpg y la llave del ordenador al terminar.

Ojo: las cuentas (correo y contraseña) no están en la copia; las personas siguen pudiendo entrar
mientras sus cuentas existan en Firebase Authentication.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(__file__))
from firestore_copia import P, pide, token

BASE = f'projects/{P}/databases/(default)/documents'


def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    datos = json.load(open(sys.argv[1]))
    de_verdad = '--de-verdad' in sys.argv
    solo = sys.argv[sys.argv.index('--solo') + 1] if '--solo' in sys.argv else None
    docs = {k: v for k, v in datos['documentos'].items() if not solo or k.split('/')[0] == solo}
    print(f"Copia del {datos['fecha']}: {len(docs)} documentos" + (f' de «{solo}»' if solo else ''))
    if not de_verdad:
        print('Prueba: no se ha escrito nada. Añade --de-verdad para restaurar.'); return
    tok = token(json.loads(os.environ['FIREBASE_SA']))
    W = [{'update': {'name': f'{BASE}/{k}', 'fields': v}} for k, v in docs.items()]
    for i in range(0, len(W), 400):
        pide(f'https://firestore.googleapis.com/v1/{BASE}:commit', {'writes': W[i:i + 400]}, tok)
    print('Restaurados', len(W), 'documentos.')


if __name__ == '__main__':
    main()
