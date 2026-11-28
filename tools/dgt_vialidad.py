"""
Estado de las carreteras de Navarra por nieve, hielo y mal tiempo (DGT, tiempo real) para BasatiNA.

  python3 tools/dgt_vialidad.py   ->  carreteras/vialidad.json

Fuente: DGT · Punto de Acceso Nacional, «Incidencias DGT DATEX2 v3.6» (datos abiertos, CC BY).
Del fichero de toda España (unos 4 MB) se queda solo con lo de Navarra que tiene que ver con el tiempo:
  · WinterDrivingManagement        -> cadenas, neumáticos de invierno, prohibido a camiones…
  · PoorEnvironmentConditions      -> nevando, hielo, niebla, viento…
  · NonWeatherRelatedRoadConditions / WeatherRelatedRoadConditions -> calzada con nieve, hielo, deslizante…
  · y cualquier otra incidencia cuyo motivo («cause») sea el tiempo.
El archivo va en la carpeta carreteras/ (fuera de web/): la app lo lee al abrir Carreteras, sin
tener que actualizar la pantalla de todos los móviles cada media hora.
Lo ejecuta GitHub Actions (.github/workflows/vialidad.yml) cada 30 minutos.
"""
import json, os, sys, datetime, urllib.request
import xml.etree.ElementTree as ET

URL = "https://nap.dgt.es/datex2/v3/dgt/SituationPublication/datex2_v36.xml"
UA = {"User-Agent": "BasatiNA/1.0 (+https://github.com/Son-Pe-Technology/basatina)"}
TIPOS = ("WinterDrivingManagement", "PoorEnvironmentConditions", "NonWeatherRelatedRoadConditions", "WeatherRelatedRoadConditions")
CAUSAS_TIEMPO = ("poorWeather", "weather", "snow", "ice", "flood", "wind", "fog", "environmentalObstruction", "poorEnvironment")
OUT = "carreteras/vialidad.json"

def local(t): return t.rsplit("}", 1)[-1]
try:
    raw = urllib.request.urlopen(urllib.request.Request(URL, headers=UA), timeout=180).read()
except Exception as e:
    print("La DGT no contesta:", e); sys.exit(0)        # se deja el archivo como estaba
root = ET.fromstring(raw)
XSI = "{http://www.w3.org/2001/XMLSchema-instance}type"
L = []
for el in root.iter():
    if local(el.tag) != "situationRecord": continue
    tipo = el.attrib.get(XSI, "").split(":")[-1]
    hojas = [(local(x.tag), (x.text or "").strip()) for x in el.iter() if len(x) == 0 and (x.text or "").strip()]
    d = {}
    for k, v in hojas: d.setdefault(k, v)
    if "Navarra" not in d.get("autonomousCommunity", "") and d.get("province", "") != "Navarra": continue
    causa = d.get("causeType", "")
    if tipo not in TIPOS and not any(c.lower() in causa.lower() for c in CAUSAS_TIEMPO): continue
    pts, la = [], None
    for k, v in hojas:
        if k == "latitude": la = float(v)
        elif k == "longitude" and la is not None: pts.append([round(la, 5), round(float(v), 5)]); la = None
    pk = [v for k, v in hojas if k == "kilometerPoint"]
    mun = [v for k, v in hojas if k == "municipality"]
    # todo lo que describe qué pasa (los nombres de campo de DATEX II terminan en «Type» casi siempre)
    que = sorted({f"{k}={v}" for k, v in hojas if k.endswith("Type") and k not in ("tpegLinearLocationType", "tpegSimplePointLocationType", "vehicleType")})
    txt = [v for k, v in hojas if k in ("value", "comment", "generalMessage")]
    L.append({"tipo": tipo, "que": que, "txt": txt[:4], "car": d.get("roadName", ""), "pk": [pk[0], pk[-1]] if pk else [],
              "mun": sorted(set(mun)), "dest": d.get("roadDestination", ""), "sen": d.get("tpegDirectionRoad", ""),
              "veh": sorted({v for k, v in hojas if k == "vehicleType"}), "pts": pts[:2], "desde": d.get("overallStartTime", "")})
L.sort(key=lambda r: (r["car"], r["pk"]))
print("Navarra, tiempo:", len(L))
for r in L[:8]: print(" ", r)
viejo = None
if os.path.exists(OUT):
    try: viejo = json.load(open(OUT, encoding="utf-8")).get("L")
    except Exception: pass
if viejo == L:
    print("Sin cambios"); sys.exit(0)
os.makedirs("carreteras", exist_ok=True)
json.dump({"t": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%MZ"), "fuente": "DGT · Punto de Acceso Nacional (CC BY)", "L": L},
          open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
