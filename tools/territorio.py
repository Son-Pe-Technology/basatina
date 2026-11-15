"""
Territorio de Navarra para BasatiNA (pantalla Localidades → «Comarcas y valles», NA Salud → «Centros de salud»).

  python3 tools/territorio.py   ->  web/territorio.js  y  tools/territorio_info.txt

Qué junta:
  · Municipios (IDENA, DIADMI_Pol_Municipio): habitantes, superficie y su contorno simplificado.
  · Agrupaciones de municipios: merindades (PATRIM_Pol_Merindades) y todas las capas de polígonos del catálogo
    de IDENA cuyo título hable de comarcas, zonificación, valles o partidos judiciales. Cada municipio se asigna
    a la zona que contiene su centro.
  · Wikidata (CC0): web oficial, teléfono y correo de cada ayuntamiento y su partido judicial.
  · Centros de salud, consultorios, hospitales y urgencias: capas de IDENA (si las hay) + OpenStreetMap (ODbL).
  · Bares, cafeterías y restaurantes de OpenStreetMap (ODbL) para el mapa de cada comarca.

Lo ejecuta GitHub Actions (.github/workflows/territorio.yml) cada mes. Necesita: pip install pyshp pyproj shapely
"""
import io, json, re, sys, time, zipfile, math, urllib.request, urllib.parse, collections

UA = {"User-Agent": "BasatiNA/1.0 (+https://github.com/suapedrito-z/basatina)", "Accept": "*/*"}
INFO = []
def log(*a):
    s = " ".join(str(x) for x in a); print(s, flush=True); INFO.append(s)

def get(url, data=None, tries=3, timeout=180, headers=None):
    h = dict(UA); h.update(headers or {})
    for i in range(tries):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, data=data, headers=h), timeout=timeout).read()
        except Exception as e:
            print("  reintento", i + 1, url[:120], e, flush=True); time.sleep(6 * (i + 1))
    return None

# ---------------------------------------------------------------- utilidades geográficas
def simplify(pts, tol):
    if tol <= 0 or len(pts) < 4: return pts
    if pts[0] == pts[-1]:
        m = len(pts) // 2
        return _dp(pts[:m + 1], tol)[:-1] + _dp(pts[m:], tol)
    return _dp(pts, tol)

def _dp(pts, tol):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; dmax, idx = 0, 0
    dx, dy = b[1] - a[1], b[0] - a[0]; L = (dx * dx + dy * dy) ** .5
    for i in range(1, len(pts) - 1):
        p = pts[i]
        d = abs(dy * p[1] - dx * p[0] + b[1] * a[0] - b[0] * a[1]) / L if L > 1e-12 else ((p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2) ** .5
        if d > dmax: dmax, idx = d, i
    if dmax > tol: return _dp(pts[:idx + 1], tol)[:-1] + _dp(pts[idx:], tol)
    return [a, b]

def shp(nombre):
    """Shapefile de IDENA -> (lista de (atributos, shape), campos)"""
    import shapefile
    b = get("https://idena.navarra.es/descargas/" + nombre + ".zip")
    if not b: log("##", nombre, "-> ERROR de descarga"); return [], []
    try: z = zipfile.ZipFile(io.BytesIO(b))
    except Exception as e: log("##", nombre, "-> no es un zip", e); return [], []
    names = z.namelist(); s = [n[:-4] for n in names if n.lower().endswith(".shp")]
    if not s: log("##", nombre, "-> sin .shp"); return [], []
    g = lambda ext: io.BytesIO(z.read([n for n in names if n.lower() == (s[0] + ext).lower()][0]))
    sf = shapefile.Reader(shp=g(".shp"), dbf=g(".dbf"), encoding="cp1252")
    campos = [f[0] for f in sf.fields[1:]]; out = []
    for sr in sf.iterShapeRecords():
        at = {k: (v.strip() if isinstance(v, str) else v) for k, v in zip(campos, sr.record)}
        out.append((at, sr.shape))
    ej = {k: str(v)[:40] for k, v in (out[0][0].items() if out else [])}
    log("##", nombre, len(out), "elementos · campos", campos, "· ejemplo", json.dumps(ej, ensure_ascii=False)[:500])
    return out, campos

from pyproj import Transformer
TR = Transformer.from_crs("EPSG:25830", "EPSG:4326", always_xy=True)
def ll(x, y):
    lo, la = TR.transform(x, y); return [round(la, 5), round(lo, 5)]

def rings_of(shape, tol):
    parts = list(shape.parts) + [len(shape.points)]; R = []
    for i in range(len(parts) - 1):
        pts = [[round(la, 4), round(lo, 4)] for la, lo in (ll(x, y) for x, y in shape.points[parts[i]:parts[i + 1]])]
        pts = simplify(pts, tol)
        if len(pts) >= 4: R.append(pts)
    return R

def norm(s):
    import unicodedata
    s = unicodedata.normalize("NFD", str(s or "")).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", s).strip()

# ---------------------------------------------------------------- 1. municipios
from shapely.geometry import shape as Shape, Point
mun_rows, _ = shp("DIADMI_Pol_Municipio")
MUN, GEOM = {}, {}
for at, s in mun_rows:
    c = str(at.get("CMUNICIPIO")).strip()
    g = Shape(s.__geo_interface__)
    rp = g.representative_point()
    MUN[c] = {"n": at.get("MUNICIPIO", "").strip(), "hab": at.get("HABIT2025") or at.get("HABIT2024") or None,
              "km2": round(float(at.get("GEOM_AREA") or 0) / 1e6, 1), "pt": ll(rp.x, rp.y),
              "r": rings_of(s, 0.004)}
    GEOM[c] = (g, rp)
log("municipios:", len(MUN))

# ---------------------------------------------------------------- 2. agrupaciones (merindades, comarcas, zonificaciones…)
def catalogo():
    b = get("https://idena.navarra.es/ogc/wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0")
    if not b: log("catálogo WMS -> ERROR"); return []
    t = b.decode("utf-8", "ignore")
    L = [(m.group(1).strip(), m.group(2).strip()) for m in re.finditer(r"<Layer[^>]*>\s*<Name>([^<]+)</Name>\s*<Title>([^<]*)</Title>", t)]
    log("catálogo WMS:", len(L), "capas"); return L
CAT = catalogo()
ZONA_RE = re.compile(r"merindad|comarca|zonificaci[oó]n|partido[s]? judicial|\bvalles?\b|zona[s]? b[áa]sica[s]? de salud|[áa]rea[s]? de salud", re.I)
SALUD_RE = re.compile(r"centro[s]? de salud|consultorio|hospital|urgencia|atenci[oó]n continuada|sanitari|ambulatori|salud mental", re.I)
log("\n# Capas del catálogo que pueden servir:")
cand_zona = [(n, t) for n, t in CAT if ZONA_RE.search(t) and "_Pol_" in n]
cand_salud = [(n, t) for n, t in CAT if SALUD_RE.search(t) and ("_Sym_" in n or "_Pto_" in n or "_Pun_" in n)]
for n, t in cand_zona: log("  zona :", n, "::", t)
for n, t in cand_salud: log("  salud:", n, "::", t)

NOMBRE_K = ("NOMBRE", "MERINDAD", "COMARCA", "SUBAREA", "SUBZONA", "AREA", "ZONA", "PARTIDO", "VALLE", "DENOMINA", "DESCRIPCIO", "MANCOMUNID", "DZONA", "DAREA")
def nombre_de(at):
    for k in NOMBRE_K:
        for kk, v in at.items():
            if kk.upper().startswith(k) and isinstance(v, str) and len(v.strip()) > 2 and not re.fullmatch(r"[\d\W]+", v):
                return v.strip()
    for kk, v in at.items():
        if isinstance(v, str) and len(v.strip()) > 3 and not re.fullmatch(r"[\d\W_]+", v): return v.strip()
    return None

GRUPOS = {}
def agrupa(capa, titulo, clave=None):
    t0 = time.time()
    rows, _ = shp(capa)
    if not rows: return
    if len(rows) > 400: log("  (se descarta", capa, "con", len(rows), "polígonos: demasiados)"); return
    zonas = []
    for at, s in rows:
        n = nombre_de(at)
        if not n or not s.points: continue
        g = Shape(s.__geo_interface__)
        zonas.append({"n": n, "g": g, "r": rings_of(s, 0.006), "m": []})
    # varias filas con el mismo nombre (islas) -> se juntan
    J = {}
    for z in zonas:
        if z["n"] in J: J[z["n"]]["gs"].append(z["g"]); J[z["n"]]["r"] += z["r"]
        else: z["gs"] = [z["g"]]; J[z["n"]] = z
    zonas = list(J.values())
    if len(zonas) < 2 or len(zonas) > 120: log("  (se descarta", capa, "con", len(zonas), "zonas)"); return
    for c, (g, rp) in GEOM.items():
        z = next((z for z in zonas if any(g.contains(rp) for g in z["gs"])), None)
        if z: z["m"].append(c)
    zonas = [z for z in zonas if z["m"]]
    if len(zonas) < 2: log("  (se descarta", capa, ": no casa con los municipios)"); return
    k = clave or re.sub(r"[^a-z]", "", norm(titulo))[:20]
    GRUPOS[k] = {"t": titulo, "capa": capa, "z": [{"n": z["n"], "m": sorted(z["m"], key=lambda c: MUN[c]["n"]), "r": z["r"]} for z in sorted(zonas, key=lambda z: norm(z["n"]))]}
    log("  ✔", capa, "->", k, len(zonas), "zonas en", round(time.time() - t0), "s")

agrupa("PATRIM_Pol_Merindades", "Merindades", "merindad")
for n, t in cand_zona[:10]:
    if n == "PATRIM_Pol_Merindades" or "Municipio" in n or "Concejo" in n: continue
    try: agrupa(n, t)
    except Exception as e: log("  error en", n, e)

# ---------------------------------------------------------------- 3. Wikidata: web, teléfono, correo y partido judicial
Q = """SELECT ?ine ?mLabel ?web ?tel ?mail ?pjLabel WHERE {
  ?m wdt:P772 ?ine . FILTER(STRSTARTS(?ine, "31") && STRLEN(?ine) = 5)
  OPTIONAL { ?m wdt:P856 ?web }
  OPTIONAL { ?m wdt:P1329 ?tel }
  OPTIONAL { ?m wdt:P968 ?mail }
  OPTIONAL { ?m (wdt:P131|wdt:P361) ?pj . ?pj rdfs:label ?pjl . FILTER(LANG(?pjl) = "es" && STRSTARTS(LCASE(?pjl), "partido judicial")) }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
}"""
b = get("https://query.wikidata.org/sparql?format=json&query=" + urllib.parse.quote(Q), headers={"Accept": "application/sparql-results+json"}, timeout=120)
nwd = 0
if b:
    try:
        for r in json.loads(b)["results"]["bindings"]:
            c = str(int(r["ine"]["value"][2:]))
            if c not in MUN: continue
            m = MUN[c]; nwd += 1
            v = lambda k: r.get(k, {}).get("value")
            if v("web") and "web" not in m: m["web"] = v("web")
            if v("tel") and "tel" not in m: m["tel"] = re.sub(r"^tel:", "", v("tel"))
            if v("mail") and "mail" not in m: m["mail"] = re.sub(r"^mailto:", "", v("mail"))
            pj = v("pjLabel")
            if pj and "pj" not in m: m["pj"] = re.sub(r"(?i)^partido judicial de\s*", "", pj).strip()
    except Exception as e: log("Wikidata: error", e)
log("Wikidata:", nwd, "filas ·", sum(1 for m in MUN.values() if "web" in m), "con web ·", sum(1 for m in MUN.values() if "tel" in m), "con teléfono ·",
    sum(1 for m in MUN.values() if "pj" in m), "con partido judicial")
# partido judicial: si no viene en Wikidata y hay capa de partidos, se usa la capa
for k, G in GRUPOS.items():
    if "judicial" in norm(G["t"]):
        for z in G["z"]:
            for c in z["m"]: MUN[c].setdefault("pj", re.sub(r"(?i)^partido judicial de\s*", "", z["n"]))

# ---------------------------------------------------------------- 4. OpenStreetMap: sanidad y bares
SERVIDORES = ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter",
              "https://maps.mail.ru/osm/tools/overpass/api/interpreter"]
def overpass(q):
    for s in SERVIDORES:
        for intento in range(2):
            try:
                print("Overpass:", s, flush=True)
                r = urllib.request.urlopen(urllib.request.Request(s, data=urllib.parse.urlencode({"data": q}).encode(), headers=UA), timeout=360)
                return json.loads(r.read())
            except Exception as e:
                print("  falló:", e, flush=True); time.sleep(20)
    log("Ningún servidor de Overpass contestó"); return {"elements": []}

txt = open("web/pueblos.js", encoding="utf-8").read()
P = json.loads(txt[txt.index("{"):txt.rindex("}") + 1])
PUEBLOS = [(p["pt"][0], p["pt"][1], p["n"]) for p in P["pueblos"]]
def pueblo(la, lo):
    best, bd = "", 1e9; c = math.cos(math.radians(la))
    for a, o, n in PUEBLOS:
        d = (a - la) ** 2 + ((o - lo) * c) ** 2
        if d < bd: bd, best = d, n
    return best

AREA = '[out:json][timeout:300];area["ISO3166-2"="ES-NA"]->.na;'
QS = AREA + """(
  nwr["amenity"~"^(hospital|clinic|doctors)$"](area.na);
  nwr["healthcare"~"^(hospital|clinic|centre|doctor)$"](area.na);
  nwr["emergency"="yes"]["amenity"](area.na);
);out center tags;"""
els = overpass(QS)["elements"]
SALUD = []
def cls(t, n):
    s = (n + " " + " ".join(f"{k}={v}" for k, v in t.items())).lower()
    if re.search(r"urgenc|s\.?u\.?a\.?p|\bsue\b|\bpac\b|atenci[oó]n continuada|emergency=yes", s): return "urg"
    if t.get("amenity") == "hospital" or t.get("healthcare") == "hospital" or re.search(r"hospital|cl[ií]nica universidad|complejo hospitalario", s): return "hosp"
    if re.search(r"centro de salud|osasun etxe|osasun zentro|ambulatorio", s): return "cs"
    if re.search(r"consultorio|kontsultategi", s): return "cons"
    return "otro"
for e in els:
    t = e.get("tags", {}); n = (t.get("name") or t.get("name:es") or "").strip()
    la = e.get("lat") or (e.get("center") or {}).get("lat"); lo = e.get("lon") or (e.get("center") or {}).get("lon")
    if not n or la is None: continue
    k = cls(t, n)
    if k == "otro" and t.get("amenity") == "doctors": continue   # consultas privadas sueltas: fuera
    SALUD.append({"n": n, "k": k, "pt": [round(la, 5), round(lo, 5)], "p": pueblo(la, lo),
                  "tel": t.get("phone") or t.get("contact:phone") or "", "web": t.get("website") or t.get("contact:website") or "",
                  "h": t.get("opening_hours") or "", "d": " ".join(x for x in [t.get("addr:street", ""), t.get("addr:housenumber", "")] if x).strip(),
                  "urg": 1 if t.get("emergency") == "yes" else 0, "src": "osm"})
# capas sanitarias de IDENA (si existen): mandan sobre OSM en nombre y teléfono
for capa, titulo in cand_salud[:6]:
    rows, _ = shp(capa)
    for at, s in rows:
        if not s.points: continue
        pt = ll(*s.points[0][:2])
        n = nombre_de(at) or titulo
        tel = next((str(v) for k, v in at.items() if k.upper().startswith("TELEF") and v), "")
        dire = next((str(v) for k, v in at.items() if k.upper().startswith(("DIRECC", "DOMICIL")) and v), "")
        k = cls({}, n + " " + titulo)
        if k == "otro": k = "cs" if re.search(r"salud", titulo, re.I) else "hosp" if re.search(r"hospital", titulo, re.I) else "otro"
        SALUD.append({"n": n, "k": k, "pt": pt, "p": pueblo(*pt), "tel": tel, "web": "", "h": "", "d": dire, "urg": 1 if k == "urg" else 0, "src": capa})
# quitar repetidos (mismo tipo a menos de 120 m)
OUT = []
for s in sorted(SALUD, key=lambda s: (s["src"] == "osm", s["n"])):
    if any(o["k"] == s["k"] and abs(o["pt"][0] - s["pt"][0]) < .0011 and abs(o["pt"][1] - s["pt"][1]) < .0015 for o in OUT): continue
    OUT.append(s)
SALUD = sorted(OUT, key=lambda s: (s["p"], s["n"]))
log("sanidad:", len(SALUD), dict(collections.Counter(s["k"] for s in SALUD)))

QB = AREA + 'nwr["amenity"~"^(bar|pub|cafe|restaurant|fast_food|biergarten)$"]["name"](area.na);out center tags;'
BAR = []
for e in overpass(QB)["elements"]:
    t = e.get("tags", {}); la = e.get("lat") or (e.get("center") or {}).get("lat"); lo = e.get("lon") or (e.get("center") or {}).get("lon")
    if la is None: continue
    a = t.get("amenity"); k = "r" if a in ("restaurant", "fast_food") else "c" if a == "cafe" else "b"
    BAR.append([t.get("name", "")[:60], k, round(la, 5), round(lo, 5)])
log("bares, cafés y restaurantes:", len(BAR))

# ---------------------------------------------------------------- 5. guardar
for m in MUN.values():
    if m.get("hab") is not None:
        try: m["hab"] = int(m["hab"])
        except Exception: pass
OUTJ = {"t": time.strftime("%Y-%m-%d"), "mun": MUN, "grupos": GRUPOS, "salud": SALUD, "bares": BAR}
with open("web/territorio.js", "w", encoding="utf-8") as f:
    f.write("// Territorio de Navarra: municipios y agrupaciones (© Gobierno de Navarra · IDENA, CC BY 4.0), ayuntamientos (Wikidata, CC0),\n"
            "// sanidad, bares y restaurantes (© OpenStreetMap, ODbL). Generado por tools/territorio.py\n")
    f.write("window.TERRI=" + json.dumps(OUTJ, ensure_ascii=False, separators=(",", ":")) + ";\n")
open("tools/territorio_info.txt", "w", encoding="utf-8").write("\n".join(INFO) + "\n")
log("OK web/territorio.js", round(len(json.dumps(OUTJ)) / 1e6, 2), "MB")
