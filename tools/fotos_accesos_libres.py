"""📷 Fotos LIBRES para los accesos directos del Inicio que no tienen foto (27 nov. 2026, lo pidió Pedro)

Mientras no haya fotos propias, cada acceso directo sin foto (ni en IF_ACC de inicio-fotos.js ni en la
cabecera de su sección, cabeceras-fotos.js) coge una foto libre de Wikimedia Commons (dominio público,
CC0, CC BY o CC BY-SA; nunca NC ni ND). Se recorta en 4:3 y se guarda en web/foto-accl-<clave>.webp.
La lista con autor, licencia y enlace va a web/accesos-libres.js (window.ACC_LIBRES), que lee inicio-fotos.js
y pone los autores en «Fotos del Inicio: autores y licencias».

Para cambiar una foto que no guste: pon su nombre de Commons («File:...») en QUITAR y vuelve a ejecutarlo.
Para poner una foto vuestra: añádela en IF_ACC de inicio-fotos.js (tiene prioridad sobre estas).

Uso: lo ejecuta GitHub Actions (.github/workflows/fotosaccesos.yml) al cambiar este archivo o a mano.
"""
import json, os, re, time, html, io, urllib.parse, urllib.request
from PIL import Image, ImageOps

UA = {"User-Agent": "BasatiNA/1.0 (https://basatina.es; participa@basatina.es)"}
WEB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
# clave del acceso (BNL de index.html): [qué es, búsquedas en Commons por orden de preferencia]
BUSCA = {
 "mascotas":  ["perro", ["Euskal artzain txakurra", "perro pastor vasco", "perro en el monte", "dog meadow"]],
 "temporada": ["verduras de temporada", ["verduras mercado", "pimientos rojos", "espárragos blancos", "vegetables market stall"]],
 "fotos":     ["cámara de fotos", ["rangefinder camera", "Leica camera", "cámara fotográfica antigua"]],
 "buzon":     ["buzón", ["buzón de Correos España", "buzón amarillo Correos", "mailbox Spain"]],
 "refranes":  ["libro antiguo", ["old book open pages", "old books shelf", "libros antiguos"]],
 "hist":      ["río crecido", ["río Arga crecida", "río Ebro crecida", "riada Navarra", "río crecido"]],
 "camaras":   ["cámara de tráfico", ["cámara de tráfico", "traffic camera highway", "autovía Navarra"]],
 "vias3":     ["carretera", ["carretera Navarra", "carretera de montaña Navarra", "N-135 Navarra"]],
 "transp":    ["autobús urbano", ["villavesa Pamplona autobús", "autobús urbano Pamplona", "Transporte Urbano Comarcal Pamplona autobús", "city bus Spain"]],
 "diario":    ["cuaderno", ["cuaderno de campo", "notebook pen table", "diario cuaderno"]],
 "sitios":    ["mirador", ["mirador Navarra", "Urbasa mirador", "Navarra paisaje"]],
 "mivias":    ["carretera de montaña", ["puerto de Belagua carretera", "carretera montaña Navarra", "Larrau carretera"]],
 "semana":    ["calendario", ["desk calendar", "wall calendar photo", "calendario de pared"]],
 "ajustes":   ["engranajes", ["engranajes", "gears machine", "gear wheels"]],
 "about":     ["Pamplona", ["Pamplona Navarra panorámica", "Murallas de Pamplona", "Pamplona desde San Cristóbal Navarra"]],
 "creditos":  ["objetivo de cámara", ["camera lens", "photographic film roll", "film camera"]],
 # juegos
 "jcadenas":  ["Navarra", ["Palacio de Navarra Pamplona", "Plaza del Castillo Pamplona"]],
 "jdonde":    ["paisaje de Navarra", ["Bardenas Reales", "valle de Baztan"]],
 "jlugar":    ["paisaje de Navarra", ["Selva de Irati", "Nacedero del Urederra", "Foz de Lumbier"]],
 "jsopa":     ["letras", ["wooden alphabet letters", "Scrabble tiles", "letterpress type"]],
 "jcruci":    ["crucigrama", ["crossword newspaper pen", "crossword puzzle newspaper", "crucigrama"]],
 "jsudoku":   ["sudoku", ["sudoku newspaper", "sudoku pencil", "sudoku puzzle"]],
 "jchinchon": ["baraja española", ["baraja española", "naipes españoles", "Spanish playing cards"]],
 "jparejas":  ["cartas", ["playing cards spread", "playing cards table", "naipes"]],
 "jsoli":     ["cartas", ["solitaire cards", "playing cards", "baraja de póker"]],
 "jnutria":   ["nutria", ["Lutra lutra", "nutria europea", "Eurasian otter"]],
 "jaita":     ["pinball", ["pinball machine", "pinball", "máquina de pinball"]],
 "psombras":  ["sombras", ["teatro de sombras", "shadow puppet theatre", "silhouette sunset tree"]],
 "pcontar":   ["contar", ["abacus beads", "colorful abacus", "wooden counting toy"]],
 "ptruchas":  ["trucha", ["Salmo trutta", "trucha común", "brown trout river"]],
}
QUITAR = {   # fotos de Commons que no queremos (revisadas a mano el 27 nov. 2026)
 'File:Pamplona, Colombia panorámica (4).jpg', 'File:Picnic table - Diergaarde Blijdorp - Rotterdam - with information board.jpg',
 'File:UCB Playing Cards.png', 'File:Sudoku-Domino.jpg', 'File:Bahamas 1989 (410) Abaco (24797713915).jpg',
 'File:Sombras chinescas (2444775233).jpg', 'File:CIUDAD DE REYES Y VERDURAS.jpg', 'File:Eskualdeko Hiri Garraioa - Maiztasunak etorbideak.png',
 'File:Sello Biblioteca Luz y Progreso.jpg', 'File:Facade of the Vintage Camera Museum 20170820.jpg',
}
LIBRES = re.compile(r"^(cc0|public domain|pd|cc by(-sa)? ?[0-9.]*( [a-z]+)?|cc-by(-sa)?-[0-9.]+)", re.I)
NO_VALE = re.compile(r"mapa|map\b|plano|coat of arms|logo|bandera|flag|diagram|grabado|pintura|cuadro|retrato|portrait|"
                     r"selfie|bel[eé]n|nativ|ermita|baseliza|iglesia|church|cathedral|catedral|capilla|altar|retablo|"
                     r"\bniñ[oa]s?\b|children|\bkids?\b|desnud|nude|cartel|poster|captura|screenshot|accident|muert|dead|blood|sangre|"
                     r"colombia|christmas|navidad|ilustra|drawing|dibujo|alcalde|elecci|election|partido|casino|gambling|apuesta|poker chips|cigar|tabaco|beer|cerveza|wine|vino", re.I)


def get(u):
    for i in range(3):
        try:
            return json.loads(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40).read())
        except Exception as e:
            print("   falló:", e); time.sleep(5)
    return None


def limpia(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", s or ""))).strip()


def busca(q):
    j = get("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "query", "format": "json", "generator": "search", "gsrsearch": q + " filetype:bitmap",
        "gsrnamespace": 6, "gsrlimit": 25, "prop": "imageinfo", "iiprop": "url|size|extmetadata|mime", "iiurlwidth": 1000}))
    pages = ((j or {}).get("query") or {}).get("pages") or {}
    return sorted(pages.values(), key=lambda p: p.get("index", 99))


def recorta(datos, dst):
    im = ImageOps.exif_transpose(Image.open(io.BytesIO(datos))).convert("RGB")
    W, H = im.size
    r = 4 / 3
    if W / H > r:
        w = int(H * r); x0 = (W - w) // 2; im = im.crop((x0, 0, x0 + w, H))
    else:
        h = int(W / r); y0 = int((H - h) * 0.45); im = im.crop((0, y0, W, y0 + h))
    im.resize((480, 360), Image.LANCZOS).save(dst, "WEBP", quality=78)


def elige(qs, usados):
    for q in qs:
        for p in busca(q):
            t = p.get("title", "")
            if t in usados or t in QUITAR or NO_VALE.search(t): continue
            ii = (p.get("imageinfo") or [{}])[0]
            if ii.get("mime") not in ("image/jpeg", "image/webp"): continue   # sin png: suelen ser mapas, esquemas o textos
            w, h = ii.get("width", 0), ii.get("height", 0)
            if w < 800 or not h or not (1.0 <= w / h <= 2.2): continue
            m = ii.get("extmetadata", {})
            lic = limpia((m.get("LicenseShortName") or {}).get("value"))
            if not LIBRES.match(lic) or re.search(r"\bnc\b|\bnd\b", lic, re.I): continue
            desc = limpia((m.get("ImageDescription") or {}).get("value"))
            if NO_VALE.search(desc[:300]): continue
            autor = limpia((m.get("Artist") or {}).get("value"))[:80] or "Desconocido"
            if re.search(r"cojon|joder|mierda|\bputa|\bpolla\b|\bco[ñn]o\b", autor, re.I): continue
            try:
                datos = urllib.request.urlopen(urllib.request.Request(ii.get("thumburl") or ii["url"], headers=UA), timeout=60).read()
            except Exception as e:
                print("   no baja", t, e); continue
            return t, datos, autor, lic, ii.get("descriptionurl", "")
    return None


def main():
    for f in os.listdir(WEB):
        if re.match(r"foto-accl-.+\.webp$", f):
            os.remove(os.path.join(WEB, f))
    out, info, usados = {}, [], set()
    for k, (que, qs) in BUSCA.items():
        r = elige(qs, usados)
        if not r:
            info.append("%-10s SIN FOTO LIBRE" % k); print(k, "sin foto"); continue
        t, datos, autor, lic, url = r
        nombre = "foto-accl-%s.webp" % k
        try:
            recorta(datos, os.path.join(WEB, nombre))
        except Exception as e:
            info.append("%-10s NO SE PUDO RECORTAR %s" % (k, t)); continue
        usados.add(t)
        out[k] = [nombre, que, autor, lic, url]
        info.append("%-10s %s · %s · %s" % (k, t[5:70], lic, autor[:40]))
        print(k, t)
        time.sleep(0.6)
    open(os.path.join(WEB, "accesos-libres.js"), "w", encoding="utf-8").write(
        "// Generado por tools/fotos_accesos_libres.py: fotos libres (Wikimedia Commons) para los accesos directos sin foto.\n"
        "// clave: [archivo, qué es, autor, licencia, enlace]\nwindow.ACC_LIBRES=" + json.dumps(out, ensure_ascii=False) + ";\n")
    open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "fotosaccesos_info.txt"), "w", encoding="utf-8").write(
        "Fotos libres para accesos directos: %d de %d\n%s\n" % (len(out), len(BUSCA), "\n".join(info)))


if __name__ == "__main__":
    main()
