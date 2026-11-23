# Genera web/version.json: la lista de archivos de la pantalla con su "huella" (sha1).
# La app compara esta lista con la suya y descarga solo lo que ha cambiado.
import hashlib, json, os, re
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
web = os.path.join(root, "web")
vf = os.path.join(web, "version.json")
old = json.load(open(vf)) if os.path.exists(vf) else {"version": 0, "files": {}}
# 20 nov. 2026: cada <script src="x.js"> de index.html lleva la huella de su archivo (x.js?v=1a2b3c4d).
# Así, cuando un .js cambia, cambia también su dirección y el WebView del móvil no puede seguir usando la copia
# vieja que tiene en memoria (antes había que cerrar la app para ver algunos cambios).
idx = os.path.join(web, "index.html")
html = open(idx, encoding="utf-8").read()
def _huella(m):
    name = m.group(2)
    p = os.path.join(web, name)
    if "/" in name or not os.path.isfile(p):
        return m.group(0)
    return m.group(1) + name + "?v=" + hashlib.sha1(open(p, "rb").read()).hexdigest()[:8] + '"'
nuevo = re.sub(r'(<script src=")([^"?]+)(?:\?v=[0-9a-f]+)?"', _huella, html)
if nuevo != html:
    open(idx, "w", encoding="utf-8").write(nuevo)
files = {f: hashlib.sha1(open(os.path.join(web, f), "rb").read()).hexdigest()
         for f in sorted(os.listdir(web)) if f != "version.json" and not f.startswith(".")}
apk = int(re.search(r"versionCode (\d+)", open(os.path.join(root, "app", "build.gradle")).read()).group(1))
version = old["version"] + (1 if files != old.get("files") else 0)
out = {"version": version, "apk": apk, "files": files,
       "apkUrl": "https://github.com/Son-Pe-Technology/basatina/releases/latest/download/BasatiNA.apk"}
json.dump(out, open(vf, "w"), indent=1)
print("pantalla v%d · app v%d · %d archivos" % (version, apk, len(files)))
