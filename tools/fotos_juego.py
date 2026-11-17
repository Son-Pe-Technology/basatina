"""
🖼️ Fotos de lugares de Navarra para los juegos de BasatiNA (Parejas y Descubre el lugar).

  python3 tools/fotos_juego.py   ->  web/fotosjuego.js  y  tools/fotosjuego_info.txt

Para cada lugar de LUGARES coge la foto principal de su artículo de Wikipedia en castellano y
comprueba en Wikimedia Commons su autor y su licencia. Solo se aceptan licencias libres
(dominio público, CC0, CC BY y CC BY-SA): la app enseña siempre el autor y la licencia.
No se descarga ninguna foto: se guarda la dirección de una copia de 800 px en Wikimedia.

Para añadir un lugar: una línea más en LUGARES = (nombre que sale en el juego, título del artículo en es.wikipedia).
Lo ejecuta GitHub Actions (.github/workflows/fotosjuego.yml) el día 13 de cada mes o al cambiar este archivo.
"""
import json, re, time, html, urllib.parse, urllib.request, datetime

UA = {"User-Agent": "BasatiNA/1.0 (https://basatina.es; participa@basatina.es)"}
LUGARES = [
    ("Selva de Irati", "Selva de Irati"), ("Bardenas Reales", "Bardenas Reales"), ("Castildetierra (Bardenas)", "Castildetierra"),
    ("Palacio Real de Olite", "Palacio Real de Olite"), ("Castillo de Javier", "Castillo de Javier"), ("Monasterio de Leyre", "Monasterio de Leyre"),
    ("Foz de Lumbier", "Foz de Lumbier"), ("Foz de Arbayún", "Foz de Arbayún"), ("Nacedero del Urederra", "Nacedero del Urederra"),
    ("Cuevas de Zugarramurdi", "Cueva de Zugarramurdi"), ("Colegiata de Roncesvalles", "Real Colegiata de Santa María de Roncesvalles"),
    ("Puente de Puente la Reina", "Puente de Puente la Reina"), ("Catedral de Pamplona", "Catedral de Santa María la Real de Pamplona"),
    ("Ciudadela de Pamplona", "Ciudadela de Pamplona"), ("Plaza del Castillo (Pamplona)", "Plaza del Castillo"),
    ("Ayuntamiento de Pamplona", "Casa Consistorial de Pamplona"), ("Monasterio de Irache", "Monasterio de Irache"),
    ("Santa María de Eunate", "Santa María de Eunate"), ("Santuario de Ujué", "Iglesia de Santa María de Ujué"),
    ("Catedral de Tudela", "Catedral de Santa María de Tudela"), ("Embalse de Itoiz", "Embalse de Itoiz"),
    ("Sierra de Urbasa", "Sierra de Urbasa"), ("San Miguel de Aralar", "Santuario de San Miguel de Aralar"),
    ("Castillo de Marcilla", "Castillo de Marcilla"), ("Monte Ori / Orhi", "Monte Ori"), ("Mesa de los Tres Reyes", "Mesa de los Tres Reyes"),
    ("Señorío de Bertiz", "Parque natural del Señorío de Bértiz"), ("Ochagavía / Otsagabia", "Ochagavía"), ("Isaba / Izaba", "Isaba"),
    ("Cerco de Artajona", "Cerco de Artajona"), ("Santa María la Real de Sangüesa", "Iglesia de Santa María la Real (Sangüesa)"),
    ("Monasterio de la Oliva", "Monasterio de la Oliva"), ("Monasterio de Fitero", "Monasterio de Santa María de Fitero"),
    ("Laguna de Pitillas", "Laguna de Pitillas"), ("Fuerte de San Cristóbal (Ezkaba)", "Fuerte de San Cristóbal"),
    ("Elizondo (Baztan)", "Elizondo"), ("Estella-Lizarra", "Estella"), ("Viana", "Viana (Navarra)"), ("Olite", "Olite"),
    ("Lekunberri", "Lekunberri"), ("Valle de Roncal", "Valle de Roncal"), ("Valle de Salazar", "Valle de Salazar"),
    ("Embalse de Alloz", "Embalse de Alloz"), ("Peña de Etxauri", "Etxauri"), ("Bosque de Orgi", "Bosque de Orgi"),
    ("Palacio de los Reyes de Navarra (Estella)", "Palacio de los Reyes de Navarra"), ("Sierra de Leyre", "Sierra de Leyre"),
    ("Valle de Baztan", "Baztán"), ("Tudela", "Tudela (Navarra)"), ("Puente la Reina", "Puente la Reina"),
]
LIBRES = re.compile(r"^(cc0|public domain|pd|cc by(-sa)? ?[0-9.]*( [a-z]+)?|cc-by(-sa)?-[0-9.]+)", re.I)


def get(u):
    for i in range(3):
        try:
            return json.loads(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40).read())
        except Exception as e:
            print("   falló:", e); time.sleep(5)
    return None


def limpia(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", s or ""))).strip()


out, info = [], []
for nombre, art in LUGARES:
    # nombre del archivo de la foto principal del artículo (pageimages), siguiendo redirecciones
    s = get("https://es.wikipedia.org/w/api.php?" + urllib.parse.urlencode({"action": "query", "prop": "pageimages", "piprop": "name",
                                                                           "titles": art, "redirects": 1, "format": "json"}))
    try:
        fichero = list(s["query"]["pages"].values())[0]["pageimage"]
    except Exception:
        info.append("SIN FOTO  " + nombre); continue
    if re.search(r"\.(png|svg|gif|tif+)$", fichero, re.I):      # mapas, escudos y dibujos: no valen
        info.append("NO ES FOTO %s (%s)" % (nombre, fichero)); continue
    q = urllib.parse.urlencode({"action": "query", "titles": "File:" + fichero, "prop": "imageinfo", "iiprop": "url|extmetadata",
                                "iiurlwidth": 800, "format": "json"})
    j = get("https://commons.wikimedia.org/w/api.php?" + q)
    try:
        ii = list(j["query"]["pages"].values())[0]["imageinfo"][0]
    except Exception:
        info.append("SIN DATOS " + nombre + " (" + fichero + ")"); continue
    m = ii.get("extmetadata", {})
    lic = limpia((m.get("LicenseShortName") or {}).get("value"))
    autor = limpia((m.get("Artist") or {}).get("value"))[:80] or "Desconocido"
    if re.search(r"cojon|joder|mierda|\bputa|\bpolla\b|\bco[ñn]o\b", autor, re.I):   # app para todas las edades: fuera autores con tacos en el nombre
        info.append("AUTOR     %s (nombre no apto)" % nombre); continue
    if not LIBRES.match(lic) or re.search(r"\bnc\b|\bnd\b", lic, re.I):
        info.append("LICENCIA  %s: %s" % (nombre, lic)); continue
    w, h = ii.get("thumbwidth", 0), ii.get("thumbheight", 0)
    if w and h and (w / h < 0.6 or w / h > 2.4):       # demasiado alargadas para el juego
        info.append("FORMA     %s %sx%s" % (nombre, w, h)); continue
    out.append({"n": nombre, "img": ii.get("thumburl") or ii["url"], "a": autor, "l": lic, "u": ii.get("descriptionurl", "")})
    info.append("OK        %s · %s · %s" % (nombre, lic, autor[:40]))
    time.sleep(0.5)

hoy = datetime.date.today().isoformat()
open("web/fotosjuego.js", "w", encoding="utf-8").write(
    "// Fotos de lugares de Navarra para los juegos (Wikimedia Commons, licencias libres; autor y licencia en cada foto). Generado por tools/fotos_juego.py\n"
    "window.FOTOSJ=" + json.dumps({"t": hoy, "f": out}, ensure_ascii=False, separators=(",", ":")) + ";\n")
open("tools/fotosjuego_info.txt", "w", encoding="utf-8").write("Fotos para juegos %s: %d de %d\n%s\n" % (hoy, len(out), len(LUGARES), "\n".join(info)))
print("\n".join(info)); print(len(out), "fotos")
