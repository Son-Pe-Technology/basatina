"""
Ocio para BasatiNA: cartelera de los cines de Navarra y rutas en moto (pantallas «Cartelera de cine» y «NA en Moto»).

  python3 tools/ocio.py          -> web/ocio.js  y  tools/ocio_info.txt
  python3 tools/ocio.py --cines  -> solo la cartelera (la tarea diaria)

· Cartelera: eCartelera publica la programación de cada cine (datos públicos de los propios cines). Se lee la página
  de la provincia de Navarra, se buscan los cines y, de cada uno, las películas y las sesiones de los próximos días.
  En la app siempre sale el enlace a la página original para comprar entradas.
· Rutas en moto: cada ruta es una lista de puntos de paso (pueblos y puertos que ya tiene la app en web/pueblos.js y
  web/viaje.js). El recorrido por carretera, los km y el tiempo se piden a OSRM (OpenStreetMap, ODbL) y la altitud
  al modelo del terreno de Open-Meteo (Copernicus DEM). Para añadir una ruta: una entrada más en RUTAS_MOTO.
"""
import json, re, sys, time, math, html, urllib.request, urllib.parse, unicodedata

UA = {"User-Agent": "Mozilla/5.0 (compatible; BasatiNA/1.0; +https://github.com/Son-Pe-Technology/basatina)", "Accept-Language": "es-ES,es;q=0.9"}
INFO = []
def log(*a):
    s = " ".join(str(x) for x in a); print(s, flush=True); INFO.append(s)
def get(url, tries=3, timeout=90):
    for i in range(tries):
        try: return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout).read().decode("utf-8", "ignore")
        except Exception as e:
            print("  reintento", i + 1, url[:100], e, flush=True); time.sleep(5 * (i + 1))
    return None
def norm(s):
    s = unicodedata.normalize("NFD", str(s or "")).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", s).strip()
def leer_js(path):
    try:
        t = open(path, encoding="utf-8").read(); return json.loads(t[t.index("{"):t.rindex("}") + 1])
    except Exception as e:
        log("no se pudo leer", path, e); return None

ANT = leer_js("web/ocio.js") or {}

# ------------------------------------------------------------------ 🎬 cines
def cartelera():
    base = "https://www.ecartelera.com"
    prov = get(base + "/cines/0,34,0.html")
    if not prov: log("cartelera: la página de Navarra no responde"); return ANT.get("cines", [])
    ids = []
    for m in re.finditer(r'href="(?:https://www\.ecartelera\.com)?/cines/(\d+),0,1\.html"[^>]*>([^<]{3,80})<', prov):
        if m.group(1) not in [i for i, _ in ids]: ids.append((m.group(1), html.unescape(m.group(2)).strip()))
    log("cartelera: cines encontrados", ids)
    out = []
    def pelis_de(h):
        L = []
        for bq in re.split(r'<div class="titem"', h)[1:]:
            bq = bq.split('<div class="tdata">')[0]
            mt = re.search(r'<p class="tit"><a href="([^"]+)"[^>]*>([^<]+)</a>', bq)
            if not mt: continue
            data = [html.unescape(x).strip() for x in re.findall(r"<span>([^<]*)</span>", (re.search(r'<p class="data">(.*?)</p>', bq, re.S) or [None, ""])[1] if re.search(r'<p class="data">(.*?)</p>', bq, re.S) else "")]
            mins = next((int(re.match(r"\d+", x).group()) for x in data if re.match(r"\d+ min", x)), None)
            edad = next((x for x in data if re.match(r"^(\+\d+|TP|Apta)", x)), "")
            gen = ", ".join(x for x in data if x and not re.match(r"^(\d+ min|\+\d+|TP|Apta)", x))
            L.append({"t": html.unescape(mt.group(2)).strip(), "u": mt.group(1), "min": mins, "g": gen, "e": edad,
                      "s": sorted(set(re.findall(r'data-session-time="(\d{1,2}:\d\d)"', bq)))})
        return L
    for cid, nombre in ids[:20]:
        url = f"{base}/cines/{cid},0,1.html"; h = get(url)
        if not h: continue
        dire = re.search(r"Direcci[oó]n:</b>\s*([^<]+)", h); tel = re.search(r"Tel[eé]fono:</b>\s*([0-9 ]{9,})", h)
        tit = re.search(r"<h1[^>]*>([^<]+)</h1>", h)
        pelis = pelis_de(h)
        h1 = get(f"{base}/cines/{cid},1,1.html")
        if h1:
            for q in pelis_de(h1):
                p = next((x for x in pelis if x["t"] == q["t"]), None)
                if p: p["s1"] = q["s"]
                else: q["s1"] = q["s"]; q["s"] = []; pelis.append(q)
        out.append({"id": cid, "n": html.unescape(tit.group(1)).strip() if tit else nombre, "d": dire.group(1).strip() if dire else "",
                    "tel": tel.group(1).strip() if tel else "", "u": url, "p": pelis[:40]})
        log("  ", cid, out[-1]["n"], len(pelis), "películas,", sum(len(p["s"]) for p in pelis), "sesiones hoy")
        time.sleep(2)
    return out or ANT.get("cines", [])

# ------------------------------------------------------------------ 🏍️ rutas en moto
RUTAS_MOTO = [
    {"id": "roncal", "n": "Valle de Roncal y Belagua", "zona": "Pirineo",
     "via": ["Lumbier", "Burgui", "Roncal", "Isaba", "Col de la Pierre Saint-Martin"],
     "txt": "Del desfiladero de la Foz de Lumbier al valle de Roncal, con sus pueblos de piedra (Burgui, Roncal, Isaba) y la subida final por Belagua hasta la frontera. Curvas enlazadas y paisaje de alta montaña."},
    {"id": "irati", "n": "Selva de Irati y puerto de Larrau", "zona": "Pirineo",
     "via": ["Aoiz", "Aribe", "Garralda", "Ochagavía", "Puerto de Larrau"],
     "txt": "Por el valle de Arce y Aezkoa hasta Ochagavía, en el valle de Salazar. Desde allí se sube al puerto de Larrau, uno de los más altos de Navarra, con vistas al hayedo-abetal de Irati."},
    {"id": "roncesvalles", "n": "Camino de Roncesvalles e Ibañeta", "zona": "Pirineo",
     "via": ["Pamplona", "Zubiri", "Alto Erro", "Burguete", "Orreaga", "Puerto de Ibañeta"],
     "txt": "La N-135 sube por Esteribar y el alto de Erro hasta Burguete y Roncesvalles, siguiendo el Camino de Santiago, y termina en el puerto de Ibañeta."},
    {"id": "baztan", "n": "Belate, Baztan y Otxondo", "zona": "Norte",
     "via": ["Pamplona", "Puerto de Belate", "Elizondo", "Paso de Otxondo", "Urdax"],
     "txt": "Subida al puerto de Belate entre hayedos, bajada al valle de Baztan y paso de Otxondo hasta Urdazubi/Urdax, junto a las cuevas de Zugarramurdi."},
    {"id": "urbasa", "n": "Sierras de Urbasa y Andía", "zona": "Tierra Estella",
     "via": ["Estella", "Urbasa", "Olazagutía", "Etxarri-Aranatz", "Puerto de Lizarraga", "Estella"],
     "txt": "Vuelta circular desde Estella: meseta de Urbasa con sus hayedos y rasos, bajada a la Sakana y regreso por el puerto de Lizarraga y su túnel."},
    {"id": "leyre", "n": "Foces, Yesa y Leyre", "zona": "Prepirineo",
     "via": ["Pamplona", "Monreal", "Lumbier", "Yesa", "Javier", "Sangüesa"],
     "txt": "Hacia el este por Monreal hasta Lumbier y su foz, el embalse de Yesa, el monasterio de Leyre y el castillo de Javier, terminando en Sangüesa."},
    {"id": "ujue", "n": "Zona Media: Olite y Ujué", "zona": "Zona Media",
     "via": ["Tafalla", "Olite", "Pitillas", "Ujué", "San Martín de Unx", "Tafalla"],
     "txt": "Ruta corta y muy completa: el palacio real de Olite, la laguna de Pitillas y la subida al pueblo-fortaleza de Ujué, con vuelta por San Martín de Unx."},
    {"id": "aralar", "n": "Aralar y Leitzaran", "zona": "Norte",
     "via": ["Irurtzun", "Lekunberri", "Azpirotz", "Leitza", "Goizueta"],
     "txt": "Por el valle de Larraun y el puerto de Azpirotz hasta Leitza, siguiendo luego hacia Goizueta entre montes muy verdes."},
    {"id": "bardenas", "n": "Ribera y Bardenas", "zona": "Ribera",
     "via": ["Tudela", "Arguedas", "Valtierra", "Caparroso", "Carcastillo"],
     "txt": "Llanuras de la Ribera bordeando las Bardenas Reales por carretera. Dentro del parque natural, la pista principal es de tierra: consulta antes las normas y horarios del parque."},
    {"id": "perdon", "n": "Sierra del Perdón y Camino", "zona": "Zona Media",
     "via": ["Pamplona", "Sierra del Perdón", "Puente la Reina", "Mañeru", "Cirauqui", "Estella"],
     "txt": "Subida a la sierra del Perdón (molinos y monumento al peregrino) y bajada a Puente la Reina para seguir el Camino de Santiago hasta Estella."},
]

def puntos():
    P = leer_js("web/pueblos.js") or {"pueblos": []}; V = leer_js("web/viaje.js") or {"pue": []}
    D = {}
    for p in P["pueblos"]:
        for alias in [p["n"]] + [x.strip() for x in p["n"].split("/")]:
            D.setdefault(norm(alias), p["pt"])
    for x in V.get("pue", []):
        if x.get("pt"): D.setdefault(norm(x["n"]), x["pt"])
    return D

def ruta_moto(r, D):
    pts = []
    for v in r["via"]:
        k = norm(v); pt = D.get(k) or next((D[x] for x in D if x.startswith(k) or k.startswith(x) and len(x) > 4), None)
        if not pt: log("   ⚠️ no encuentro", v); continue
        pts.append(pt)
    if len(pts) < 2: return None
    coords = ";".join(f"{lo},{la}" for la, lo in pts)
    t = get(f"https://router.project-osrm.org/route/v1/driving/{coords}?overview=full&geometries=geojson")
    if not t: return None
    j = json.loads(t)
    if j.get("code") != "Ok": log("   OSRM:", j.get("code")); return None
    ro = j["routes"][0]; line = [[round(la, 5), round(lo, 5)] for lo, la in ro["geometry"]["coordinates"]]
    # simplificar para la app (cada ~120 m)
    simp = [line[0]]
    for p in line[1:]:
        if abs(p[0] - simp[-1][0]) + abs(p[1] - simp[-1][1]) > 0.0012: simp.append(p)
    if simp[-1] != line[-1]: simp.append(line[-1])
    # altitud: 80 puntos repartidos
    idx = [round(i * (len(simp) - 1) / 79) for i in range(80)]
    q = [simp[i] for i in idx]
    alt = None
    tt = get("https://api.open-meteo.com/v1/elevation?latitude=" + ",".join(str(p[0]) for p in q) + "&longitude=" + ",".join(str(p[1]) for p in q))
    if tt:
        try: alt = [round(a) for a in json.loads(tt)["elevation"]]
        except Exception: alt = None
    up = sum(max(0, alt[i] - alt[i - 1]) for i in range(1, len(alt))) if alt else None
    return dict(r, km=round(ro["distance"] / 1000, 1), min=round(ro["duration"] / 60), line=simp, alt=alt, up=up,
                mx=max(alt) if alt else None, mn=min(alt) if alt else None, via=r["via"], wp=pts)

solo_cines = "--cines" in sys.argv
OUT = {"t": time.strftime("%Y-%m-%d %H:%M"), "cines": cartelera(), "moto": ANT.get("moto", [])}
if not solo_cines:
    D = puntos(); M = []
    for r in RUTAS_MOTO:
        log("moto:", r["n"])
        x = ruta_moto(r, D)
        if x: M.append(x); log("   ", x["km"], "km ·", x["min"], "min · sube", x["up"], "m · máx", x["mx"], "m")
        else:
            old = next((o for o in OUT["moto"] if o.get("id") == r["id"]), None)
            if old: M.append(old)
        time.sleep(1.5)
    if M: OUT["moto"] = M
with open("web/ocio.js", "w", encoding="utf-8") as f:
    f.write("// Cartelera de los cines de Navarra (datos públicos de los cines vía eCartelera) y rutas en moto (OSRM · © OpenStreetMap, ODbL; altitud Copernicus DEM vía Open-Meteo). Generado por tools/ocio.py\n")
    f.write("window.OCIO=" + json.dumps(OUT, ensure_ascii=False, separators=(",", ":")) + ";\n")
open("tools/ocio_info.txt", "w", encoding="utf-8").write("\n".join(INFO) + "\n")
log("OK web/ocio.js")
