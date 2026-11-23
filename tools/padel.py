"""
🎾 Pistas de pádel de Navarra para BasatiNA (OpenStreetMap, ODbL).

  python3 tools/padel.py   ->  web/padel.js  y  tools/padel_info.txt

Qué hace:
  1. Descarga de Overpass, dentro de Navarra:
       · las pistas de pádel (leisure=pitch con sport=padel, también «tennis;padel», «paddle_tennis»…)
       · los clubes y polideportivos (leisure=sports_centre / sports_hall / club=sport)
  2. Mete cada pista en el club o polideportivo donde está (si cae dentro de su recuadro o a menos de 120 m).
     Las pistas sueltas que están juntas (a menos de 80 m) se agrupan en un mismo sitio.
  3. Cuenta pistas y pistas cubiertas, y adivina si es municipal (ayuntamiento, polideportivo, UPNA…)
     o de club. Las pistas privadas (urbanizaciones, access=private) NO se publican.
  4. Cada sitio se sitúa en su pueblo más cercano con web/pueblos.js.

Lo ejecuta GitHub Actions (.github/workflows/padel.yml) el día 15 de cada mes y al cambiar este archivo.
Para probar sin internet: PADEL_OSM=archivo.json python3 tools/padel.py   (respuesta guardada de Overpass)
"""
import collections, datetime, json, math, os, re, time, urllib.parse, urllib.request

UA = {"User-Agent": "BasatiNA/1.0 (+https://github.com/Son-Pe-Technology/basatina)"}
SERVIDORES = ["https://overpass-api.de/api/interpreter",
              "https://overpass.private.coffee/api/interpreter",
              "https://maps.mail.ru/osm/tools/overpass/api/interpreter"]
Q = """[out:json][timeout:600];
area["ISO3166-2"="ES-NA"]->.a;
(nwr["sport"~"padel|pádel|paddle",i](area.a);
 nwr["leisure"~"^(sports_centre|sports_hall)$"](area.a);
 nwr["club"="sport"](area.a););
out tags bb;"""


def overpass(q):
    if os.environ.get("PADEL_OSM"):
        return json.load(open(os.environ["PADEL_OSM"], encoding="utf-8"))
    for s in SERVIDORES:
        for intento in range(2):
            try:
                print("Overpass:", s, flush=True)
                r = urllib.request.urlopen(urllib.request.Request(s, data=urllib.parse.urlencode({"data": q}).encode(), headers=UA), timeout=900)
                return json.loads(r.read())
            except Exception as e:
                print("  falló:", e, flush=True); time.sleep(20)
    raise SystemExit("Ningún servidor de Overpass contestó")


txt = open("web/pueblos.js", encoding="utf-8").read()
PU = json.loads(txt[txt.index("{"):txt.rindex("}") + 1])
PUEBLOS = [(p["pt"][0], p["pt"][1], p["n"]) for p in PU["pueblos"]]


def pueblo(la, lo):
    best, bd, c = "", 1e9, math.cos(math.radians(la))
    for a, b, n in PUEBLOS:
        d = (a - la) ** 2 + ((b - lo) * c) ** 2
        if d < bd: bd, best = d, n
    return best


def metros(a, b, c, d):
    return math.hypot((a - c) * 111320, (b - d) * 111320 * math.cos(math.radians(a)))


def punto(e):
    """Nodos: su punto. Vías y relaciones: el centro de su recuadro («out bb»: Overpass no deja pedir a la vez center y bb)."""
    if "lat" in e: return e["lat"], e["lon"]
    b = e.get("bounds")
    if b: return (b["minlat"] + b["maxlat"]) / 2, (b["minlon"] + b["maxlon"]) / 2
    c = e.get("center") or {}
    return c.get("lat"), c.get("lon")


# En España «paddle_tennis» o «paddle» casi siempre es pádel mal etiquetado
es_padel = lambda t: any(k in (t.get("sport") or "").lower() for k in ("padel", "pádel", "paddle"))
es_pista = lambda t: t.get("leisure") == "pitch"
cubierta = lambda t: t.get("covered") in ("yes", "roof") or t.get("indoor") == "yes" or t.get("building") not in (None, "no")
privada = lambda t: t.get("access") in ("private", "no")
MUNI = re.compile(r"ayuntamiento|municipal|udal|concejo|polideportivo|kiroldegi|upna|universidad|deporte navarro|gobierno de navarra", re.I)

pistas, centros = [], []
R = overpass(Q)
if R.get("remark"): print("Aviso de Overpass:", R["remark"])
print("Elementos recibidos:", len(R.get("elements", [])))
for e in R.get("elements", []):
    t = e.get("tags", {})
    la, lo = punto(e)
    if la is None: continue
    x = {"t": t, "la": la, "lo": lo, "bb": e.get("bounds"), "id": e["type"][0] + str(e["id"])}
    if es_pista(t):
        if es_padel(t): pistas.append(x)
    else:
        centros.append(x)

# 1) cada pista a su club / polideportivo
def dentro(p, c, margen=0.0003):
    b = c["bb"]
    return b and b["minlat"] - margen <= p["la"] <= b["maxlat"] + margen and b["minlon"] - margen <= p["lo"] <= b["maxlon"] + margen

def area(c):
    b = c["bb"]
    return (b["maxlat"] - b["minlat"]) * (b["maxlon"] - b["minlon"]) if b else 0

dueno = {}
for p in pistas:
    cand = sorted((c for c in centros if dentro(p, c)), key=area)
    if not cand:
        cerca = sorted(((metros(p["la"], p["lo"], c["la"], c["lo"]), i) for i, c in enumerate(centros)))
        cand = [centros[cerca[0][1]]] if cerca and cerca[0][0] < 120 else []
    if cand: dueno[p["id"]] = cand[0]["id"]

# 2) pistas sueltas: se juntan las que están a menos de 80 m
sueltas = [p for p in pistas if p["id"] not in dueno]
padre = {p["id"]: p["id"] for p in sueltas}
def raiz(i):
    while padre[i] != i:
        padre[i] = padre[padre[i]]; i = padre[i]
    return i
for i, a in enumerate(sueltas):
    for b in sueltas[i + 1:]:
        if metros(a["la"], a["lo"], b["la"], b["lo"]) < 80:
            padre[raiz(a["id"])] = raiz(b["id"])
for p in sueltas: dueno[p["id"]] = "g" + raiz(p["id"])

grupos = collections.defaultdict(list)
for p in pistas: grupos[dueno[p["id"]]].append(p)
C = {c["id"]: c for c in centros}
# clubes etiquetados como de pádel aunque no tengan las pistas dibujadas
for c in centros:
    if es_padel(c["t"]) and c["id"] not in grupos: grupos[c["id"]] = []


def tag(*ts, k):
    for t in ts:
        if t and t.get(k): return t[k]
    return ""


L, quitadas = [], 0
for g, ps in grupos.items():
    c = C.get(g)
    ct = c["t"] if c else {}
    pt0 = ps[0]["t"] if ps else {}
    if (c and privada(ct)) or (ps and all(privada(p["t"]) for p in ps)):
        quitadas += 1; continue
    ps = [p for p in ps if not privada(p["t"])]
    if c: la, lo = c["la"], c["lo"]
    else: la, lo = sum(p["la"] for p in ps) / len(ps), sum(p["lo"] for p in ps) / len(ps)
    nom = ct.get("name") or next((p["t"]["name"] for p in ps if p["t"].get("name") and not re.fullmatch(r"(pista\s*)?\d+|pista.*\d", p["t"]["name"], re.I)), "")
    op = tag(ct, pt0, k="operator")
    pue = pueblo(la, lo)  # siempre el nombre de pueblos.js, para que no salga el mismo pueblo escrito de dos maneras
    x = {"n": nom or ("Polideportivo" if ct.get("leisure") in ("sports_centre", "sports_hall") else "Pistas de pádel"),
         "pt": [round(la, 5), round(lo, 5)], "p": pue, "pi": len(ps),
         "cu": sum(1 for p in ps if cubierta(p["t"]) or ct.get("leisure") == "sports_hall")}
    x["k"] = "m" if MUNI.search(" ".join([nom, op, ct.get("leisure", "") if not nom else ""])) or ct.get("fee") == "no" or (not c and not nom) else "c"
    dirc = " ".join(v for v in (tag(ct, pt0, k="addr:street"), tag(ct, pt0, k="addr:housenumber")) if v)
    if dirc: x["d"] = dirc
    if op: x["op"] = op
    tel = tag(ct, pt0, k="phone") or tag(ct, pt0, k="contact:phone")
    if tel: x["tel"] = tel.split(";")[0].strip()
    web = tag(ct, pt0, k="website") or tag(ct, pt0, k="contact:website")
    if web and re.match(r"https?://", web): x["w"] = web
    h = tag(ct, pt0, k="opening_hours")
    if h: x["h"] = h[:120]
    if any(p["t"].get("lit") == "yes" for p in ps): x["luz"] = 1
    L.append(x)

L.sort(key=lambda x: (x["p"], x["n"]))
hoy = datetime.date.today().isoformat()
if not L:
    raise SystemExit("No ha salido ninguna pista: no se guarda nada (se queda la lista anterior)")
open("web/padel.js", "w", encoding="utf-8").write(
    "// Pistas de pádel de Navarra (© OpenStreetMap, ODbL). Generado por tools/padel.py. No editar a mano.\n"
    "window.PADEL=" + json.dumps({"t": hoy, "c": L}, ensure_ascii=False, separators=(",", ":")) + ";\n")
resumen = ("Pistas de pádel %s\nSitios: %d (municipales %d, clubes %d)\nPistas: %d (cubiertas %d)\n"
           "Clubes de pádel sin pistas dibujadas en OSM: %d\nSitios privados quitados: %d\n\nPueblos con más sitios:\n%s\n") % (
    hoy, len(L), sum(x["k"] == "m" for x in L), sum(x["k"] == "c" for x in L), sum(x["pi"] for x in L), sum(x["cu"] for x in L),
    sum(1 for x in L if not x["pi"]), quitadas,
    "\n".join("  %s: %d" % kv for kv in collections.Counter(x["p"] for x in L).most_common(15)))
open("tools/padel_info.txt", "w", encoding="utf-8").write(resumen)
print(resumen)
