"""
🏔️ Boletín de aludes y predicción de montaña de AEMET para el Pirineo navarro (BasatiNA).

  python3 tools/aludes.py   ->  nieve/aludes.json  y  nieve/aludes_info.txt

Usa la clave de AEMET del secreto AEMET_KEY de GitHub (la app usa la misma, guardada en Firestore claves/app).
  · Boletín de peligro de aludes (nivológica), zona 1 = Pirineo navarro y aragonés.
    AEMET solo lo publica en temporada (más o menos de diciembre a abril/mayo).
  · Predicción de montaña del Pirineo navarro (zona «nav1»), hoy y mañana.
Se guarda el texto oficial tal cual (AEMET permite reutilizarlo citando la fuente) y la fecha.
Lo ejecuta GitHub Actions (.github/workflows/aludes.yml) cada mañana y cada tarde.
Los datos van fuera de web/: no cambian la versión de la pantalla.
"""
import json, os, re, time, datetime, urllib.request, urllib.parse

# 24 nov. 2026: la clave va SOLO en los «secretos» de GitHub (Settings → Secrets → Actions → AEMET_KEY)
KEY = os.environ.get("AEMET_KEY", "").strip()
API = "https://opendata.aemet.es/opendata/api/"
UA = {"User-Agent": "BasatiNA/1.0 (+https://basatina.es)", "Accept": "application/json"}


def aemet(path):
    """AEMET contesta en dos pasos: primero una dirección con los datos y luego los datos."""
    for i in range(3):
        try:
            u = API + urllib.parse.quote(path) + "?api_key=" + urllib.parse.quote(KEY)
            j = json.loads(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40).read().decode("utf-8", "replace"))
            if j.get("estado") != 200:
                print("  ", path, "→", j.get("estado"), j.get("descripcion")); return None
            raw = urllib.request.urlopen(urllib.request.Request(j["datos"], headers=UA), timeout=40).read()
            for enc in ("utf-8", "latin-1"):
                try: return raw.decode(enc)
                except UnicodeDecodeError: pass
        except Exception as e:
            print("   intento", i + 1, "falló:", e); time.sleep(8)
    return None


def limpia(t):
    if not t: return ""
    # a veces viene en JSON (lista con secciones) y a veces en texto plano
    try:
        j = json.loads(t)
        def plano(x):
            if isinstance(x, dict): return "\n".join(plano(v) for v in x.values() if v)
            if isinstance(x, list): return "\n".join(plano(v) for v in x if v)
            return str(x)
        t = plano(j)
    except Exception:
        pass
    L = []
    for l in t.replace("\r", "").split("\n"):
        l = l.rstrip()
        # fuera las etiquetas internas del JSON de AEMET («pcp», «nubosidad», «es», enlaces…)
        if re.fullmatch(r"[a-z_0-9]{1,20}", l.strip()) or l.strip().startswith("http"): continue
        if L and l == L[-1]: continue
        L.append(l)
    return "\n".join(L).strip()[:9000]


out = {"t": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%MZ"), "aludes": "", "montana": []}
info = []
if not KEY:
    info.append("Sin clave de AEMET: falta el secreto AEMET_KEY en GitHub")
else:
    a = limpia(aemet("prediccion/especifica/nivologica/1"))
    out["aludes"] = a
    info.append("Aludes: %s" % ("%d caracteres" % len(a) if a else "no publicado (fuera de temporada o sin servicio)"))
    for dia in (0, 1):
        m = limpia(aemet("prediccion/especifica/montaña/pasada/area/nav1/dia/%d" % dia))
        if m: out["montana"].append({"dia": dia, "txt": m})
        info.append("Montaña día %d: %s" % (dia, "%d caracteres" % len(m) if m else "sin datos"))
os.makedirs("nieve", exist_ok=True)
old = {}
try: old = json.load(open("nieve/aludes.json"))
except Exception: pass
# si AEMET falla del todo, se conserva lo anterior (con su fecha)
if out["aludes"] or out["montana"] or not old:
    json.dump(out, open("nieve/aludes.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open("nieve/aludes_info.txt", "w", encoding="utf-8").write(out["t"] + "\n" + "\n".join(info) + "\n")
print("\n".join(info))
