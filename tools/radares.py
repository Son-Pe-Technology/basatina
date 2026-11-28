"""
Radares de velocidad de Navarra para BasatiNA.

  python3 tools/radares.py   ->  web/radares.js  y  tools/radares_info.txt

De dónde salen (28 nov. 2026, lo pidió Pedro):
  1. DGT · Punto de Acceso Nacional (nap.dgt.es), datos abiertos DATEX II:
       radares fijos y de tramo  -> PredefinedLocationsPublication/radares
  2. OpenStreetMap (ODbL) · highway=speed_camera y relaciones enforcement=maxspeed de Navarra:
       completa lo que la DGT no trae (radares de Tráfico Navarra y cabinas de Pamplona).
     Un punto de OSM a menos de 300 m de uno de la DGT se da por repetido y no se pone.
Solo se quedan los que caen dentro de un municipio de Navarra (polígonos de web/territorio.js).
Los radares móviles NO se ponen: cambian de sitio cada día y no hay dato oficial de dónde están.

Lo ejecuta GitHub Actions (.github/workflows/radares.yml) cada lunes.
"""
import json, math, re, sys, time, datetime, urllib.parse, urllib.request
import xml.etree.ElementTree as ET

UA = {"User-Agent": "BasatiNA/1.0 (+https://github.com/Son-Pe-Technology/basatina)"}
DGT = ["https://infocar.dgt.es/datex2/dgt/PredefinedLocationsPublication/radares/content.xml",
       "http://infocar.dgt.es/datex2/dgt/PredefinedLocationsPublication/radares/content.xml"]
SERVIDORES = ["https://overpass-api.de/api/interpreter",
              "https://overpass.private.coffee/api/interpreter",
              "https://maps.mail.ru/osm/tools/overpass/api/interpreter"]
Q = """[out:json][timeout:300];
area["ISO3166-2"="ES-NA"]->.a;
(node["highway"="speed_camera"](area.a);node["enforcement"="maxspeed"](area.a);relation["enforcement"~"maxspeed|average_speed"](area.a););
out body;>;out skel qt;"""
INFO = []
def log(*a):
    s = " ".join(str(x) for x in a); print(s, flush=True); INFO.append(s)

# ---------- Navarra: polígonos de los municipios ----------
txt = open("web/territorio.js", encoding="utf-8").read()
TERRI = json.loads(txt[txt.index("{"):txt.rindex("}") + 1])
ANILLOS = []
for c, m in TERRI["mun"].items():
    for r in m.get("r") or []:
        if len(r) < 3: continue
        la = [p[0] for p in r]; lo = [p[1] for p in r]
        ANILLOS.append((min(la), max(la), min(lo), max(lo), r, m.get("n", "")))
def municipio(la, lo):
    for s, n, w, e, r, nom in ANILLOS:
        if not (s <= la <= n and w <= lo <= e): continue
        dentro = False; j = len(r) - 1
        for i in range(len(r)):
            yi, xi = r[i]; yj, xj = r[j]
            if (yi > la) != (yj > la) and lo < (xj - xi) * (la - yi) / ((yj - yi) or 1e-12) + xi: dentro = not dentro
            j = i
        if dentro: return nom
    return None
def km(a, b):
    c = math.cos(math.radians(a[0]))
    return math.hypot(a[0] - b[0], (a[1] - b[1]) * c) * 111.2

def get(url, data=None, t=120):
    req = urllib.request.Request(url, data=data, headers=UA)
    return urllib.request.urlopen(req, timeout=t).read()

# ---------- 1. DGT (DATEX II) ----------
def local(tag): return tag.rsplit("}", 1)[-1]
def dgt():
    raw = None
    for u in DGT:
        try: raw = get(u, t=180); log("DGT:", u, len(raw), "bytes"); break
        except Exception as e: log("DGT falló:", u, e)
    if not raw: return []
    root = ET.fromstring(raw)
    out, ejemplo = [], True
    for el in root.iter():
        if local(el.tag) != "predefinedLocation": continue
        hojas = [(local(x.tag), (x.text or "").strip()) for x in el.iter() if len(x) == 0 and (x.text or "").strip()]
        if ejemplo:   # en el registro sale cómo viene un radar, por si la DGT cambia el formato
            log("Ejemplo DGT:", hojas[:40]); ejemplo = False
        pts, la = [], None
        for k, v in hojas:
            if k == "latitude": la = float(v)
            elif k == "longitude" and la is not None: pts.append([round(la, 5), round(float(v), 5)]); la = None
        if not pts: continue
        if not any(municipio(*p) for p in pts): continue
        d = {}
        for k, v in hojas: d.setdefault(k, v)
        nombre = d.get("value", "")
        texto = " ".join(v for k, v in hojas if k == "value")
        car = d.get("roadNumber") or d.get("roadName") or (re.search(r"\b([A-Z]{1,3}-\d{1,4}(?:-[A-Z])?)\b", texto) or [None, ""])[1] or ""
        pk = d.get("kilometerPoint") or d.get("referentPointDistance") or ""
        m = re.search(r"(?:pk|p\.k\.|km)\s*([\d.,]+)", texto, re.I)
        if not pk and m: pk = m.group(1)
        sen = d.get("tpegDirection") or d.get("directionRelativeOnLinearSection") or d.get("direction") or ""
        vel = ""
        m = re.search(r"(\d{2,3})\s*km/h", texto)
        if m: vel = m.group(1)
        tramo = len(pts) > 1 and km(pts[0], pts[-1]) > 0.3
        r = {"t": "tramo" if tramo else "fijo", "n": nombre[:120], "car": car, "pk": str(pk)[:12], "sen": sen[:40], "vel": vel,
             "pt": pts[0], "f": "DGT", "mun": municipio(*pts[0]) or ""}
        if tramo: r["fin"] = pts[-1]
        out.append(r)
    log("DGT en Navarra:", len(out))
    return out

# ---------- 2. OpenStreetMap ----------
def osm():
    for s in SERVIDORES:
        try:
            j = json.loads(get(s, data=urllib.parse.urlencode({"data": Q}).encode(), t=400)); break
        except Exception as e: log("Overpass falló:", s, e); time.sleep(15)
    else: return []
    N = {e["id"]: e for e in j["elements"] if e["type"] == "node"}
    out, usados = [], set()
    for e in j["elements"]:
        if e["type"] != "relation": continue
        tg = e.get("tags", {})
        dev = [N[m["ref"]] for m in e.get("members", []) if m["type"] == "node" and m.get("role") == "device" and m["ref"] in N]
        frm = [N[m["ref"]] for m in e.get("members", []) if m["type"] == "node" and m.get("role") == "from" and m["ref"] in N]
        to = [N[m["ref"]] for m in e.get("members", []) if m["type"] == "node" and m.get("role") == "to" and m["ref"] in N]
        media = tg.get("enforcement") == "average_speed"
        if media and frm and to:
            p0, p1 = [round(frm[0]["lat"], 5), round(frm[0]["lon"], 5)], [round(to[0]["lat"], 5), round(to[0]["lon"], 5)]
            out.append({"t": "tramo", "n": tg.get("name", "Radar de tramo"), "car": tg.get("ref", ""), "pk": "", "sen": "", "vel": tg.get("maxspeed", ""),
                        "pt": p0, "fin": p1, "f": "OSM", "mun": municipio(*p0) or ""})
            usados.update(x["id"] for x in frm + to + dev)
        for d in dev:
            usados.add(d["id"])
            p = [round(d["lat"], 5), round(d["lon"], 5)]
            out.append({"t": "fijo", "n": tg.get("name", "") or d.get("tags", {}).get("name", "") or "Radar fijo", "car": tg.get("ref", ""), "pk": "", "sen": "",
                        "vel": tg.get("maxspeed", "") or d.get("tags", {}).get("maxspeed", ""), "pt": p, "f": "OSM", "mun": municipio(*p) or ""})
    for n in N.values():
        tg = n.get("tags", {})
        if n["id"] in usados or tg.get("highway") != "speed_camera": continue
        p = [round(n["lat"], 5), round(n["lon"], 5)]
        out.append({"t": "fijo", "n": tg.get("name", "") or "Radar fijo", "car": tg.get("ref", ""), "pk": "", "sen": "", "vel": tg.get("maxspeed", ""),
                    "pt": p, "f": "OSM", "mun": municipio(*p) or ""})
    out = [r for r in out if r["mun"]]
    log("OSM en Navarra:", len(out))
    return out

D = dgt()
O = [r for r in osm() if not any(km(r["pt"], x["pt"]) < 0.3 for x in D)]
L = D + O
L.sort(key=lambda r: (r["car"] or "zz", r["pt"][0]))
if not L:
    log("No hay radares: no se cambia el archivo"); open("tools/radares_info.txt", "w", encoding="utf-8").write("\n".join(INFO) + "\n"); sys.exit(0)
hoy = datetime.date.today().isoformat()
with open("web/radares.js", "w", encoding="utf-8") as f:
    f.write("// Radares de velocidad de Navarra (DGT, datos abiertos; © OpenStreetMap, ODbL). Generado por tools/radares.py\n")
    f.write("window.RADARES=" + json.dumps({"t": hoy, "L": L}, ensure_ascii=False, separators=(",", ":")) + ";\n")
log("Total:", len(L), "· fijos:", sum(r["t"] == "fijo" for r in L), "· tramos:", sum(r["t"] == "tramo" for r in L))
open("tools/radares_info.txt", "w", encoding="utf-8").write("\n".join(INFO) + "\n")
