"""
🐕 Mascotas en Navarra para BasatiNA (OpenStreetMap, ODbL).

  python3 tools/mascotas.py   ->  web/mascotas.js  y  tools/mascotas_info.txt

Qué descarga (Overpass), dentro de Navarra:
  · amenity=veterinary      -> clínicas veterinarias (las de 24 h, si OpenStreetMap lo dice, salen marcadas)
  · leisure=dog_park        -> parques y zonas para perros
  · amenity=animal_shelter  -> protectoras y refugios
  · shop=pet                -> tiendas de animales
Cada punto se sitúa en su pueblo más cercano con web/pueblos.js.
Lo ejecuta GitHub Actions (.github/workflows/mascotas.yml) el día 11 de cada mes.
"""
import json, math, time, urllib.parse, urllib.request, datetime, collections

UA = {"User-Agent": "BasatiNA/1.0 (+https://github.com/suapedrito-z/basatina)"}
SERVIDORES = ["https://overpass-api.de/api/interpreter",
              "https://overpass.private.coffee/api/interpreter",
              "https://maps.mail.ru/osm/tools/overpass/api/interpreter"]
Q = """[out:json][timeout:600];
area["ISO3166-2"="ES-NA"]->.a;
(nwr["amenity"="veterinary"](area.a);nwr["leisure"="dog_park"](area.a);nwr["amenity"="animal_shelter"](area.a);nwr["shop"="pet"](area.a););
out center tags;"""


def overpass(q):
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
P = json.loads(txt[txt.index("{"):txt.rindex("}") + 1])
PUEBLOS = [(p["pt"][0], p["pt"][1], p["n"]) for p in P["pueblos"]]


def pueblo(la, lo):
    best, bd, c = "", 1e9, math.cos(math.radians(la))
    for a, b, n in PUEBLOS:
        d = (a - la) ** 2 + ((b - lo) * c) ** 2
        if d < bd: bd, best = d, n
    return best


TIPO = lambda t: "vet" if t.get("amenity") == "veterinary" else "park" if t.get("leisure") == "dog_park" else "prot" if t.get("amenity") == "animal_shelter" else "tienda"
NOMBRE0 = {"vet": "Clínica veterinaria", "park": "Zona para perros", "prot": "Protectora de animales", "tienda": "Tienda de animales"}
L, cuenta = [], collections.Counter()
for e in overpass(Q).get("elements", []):
    t = e.get("tags", {})
    la, lo = (e.get("lat"), e.get("lon")) if "lat" in e else ((e.get("center") or {}).get("lat"), (e.get("center") or {}).get("lon"))
    if la is None: continue
    k = TIPO(t)
    h = t.get("opening_hours", "")
    x = {"k": k, "n": t.get("name") or NOMBRE0[k], "pt": [round(la, 5), round(lo, 5)],
         "p": t.get("addr:city") or pueblo(la, lo)}
    dirc = " ".join(v for v in (t.get("addr:street"), t.get("addr:housenumber")) if v)
    if dirc: x["d"] = dirc
    tel = t.get("phone") or t.get("contact:phone")
    if tel: x["tel"] = tel.split(";")[0].strip()
    web = t.get("website") or t.get("contact:website")
    if web: x["w"] = web
    if h: x["h"] = h[:120]
    if "24/7" in h or t.get("emergency") == "yes": x["u"] = 1
    L.append(x); cuenta[k] += 1
L.sort(key=lambda x: (x["k"], x["p"], x["n"]))
hoy = datetime.date.today().isoformat()
open("web/mascotas.js", "w", encoding="utf-8").write(
    "// Mascotas en Navarra: veterinarios, zonas para perros, protectoras y tiendas (© OpenStreetMap, ODbL). Generado por tools/mascotas.py\n"
    "window.MASCOTAS=" + json.dumps({"t": hoy, "p": L}, ensure_ascii=False, separators=(",", ":")) + ";\n")
open("tools/mascotas_info.txt", "w", encoding="utf-8").write("Mascotas %s\n%s\nUrgencias/24 h: %d\n" % (hoy, dict(cuenta), sum(1 for x in L if x.get("u"))))
print(dict(cuenta))
