"""
📜 Aviso al móvil cuando sale un tomo de «La Historia de un Reyno» (28 nov. 2026).
Lo lanza .github/workflows/reyno.yml los sábados a las 10:05 (hora de Madrid).
Si hoy se publica un tomo y ya tiene texto (secs en web/reyno-datos.js), manda un aviso al tema «avisos»
(los que tienen activados los «Avisos de BasatiNA») que abre la pantalla de la obra.
"""
import datetime, re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from push import enviar
txt = open("web/reyno-datos.js", encoding="utf-8").read()
hoy = datetime.date.today().isoformat()
# cada tomo es una línea {n:'…',t:'…',f:'AAAA-MM-DD…' …}
for m in re.finditer(r"\{n:'([^']+)',t:'([^']+)',f:'(\d{4}-\d{2}-\d{2})[^']*'(.*?)\}\s*(?:,|\n\s*\])", txt, re.S):
    n, t, f, resto = m.groups()
    if f == hoy:
        if "secs" not in resto:
            print("Hoy tocaba el Tomo", n, "pero aún no tiene texto: no se avisa"); sys.exit(0)
        enviar("avisos", f"📜 Nuevo tomo de La Historia de un Reyno", f"Tomo {n}: {t}", "reyno")
        print("Aviso enviado: Tomo", n); sys.exit(0)
print("Hoy no se publica ningún tomo")
