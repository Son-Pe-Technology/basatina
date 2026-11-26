"""📷 Fotos LIBRES para los titulares, mientras no haya fotos propias (26 nov. 2026, lo pidió Pedro)

Para cada tema de los titulares (TEMAS de tools/fotos_titulares.py) busca en Wikimedia Commons fotos
de Navarra con licencia libre (dominio público, CC0, CC BY o CC BY-SA; nunca NC ni ND), las recorta en 4:3
y las guarda en web/tit-<tema>-c<huella>.webp. Autor, licencia y enlace de cada una van a
web/titulares-fotos.json → «libres» y «creditos» (la app los enseña en Créditos y en la noticia grande del Inicio).

La app usa SIEMPRE antes las fotos propias («fotos», del Drive); las libres solo salen en los temas
que aún no tienen fotos vuestras. Para quitar una foto libre que no guste: su nombre en QUITAR.

Uso: lo ejecuta GitHub Actions (.github/workflows/fotostitulares.yml) al cambiar este archivo o a mano.
"""
import json, os, re, time, html, hashlib, io, urllib.parse, urllib.request
from PIL import Image, ImageOps

UA = {"User-Agent": "BasatiNA/1.0 (https://basatina.es; participa@basatina.es)"}
WEB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
POR_TEMA = 4
# búsquedas en Commons por tema (lo más de Navarra posible). «iglesia» no se busca: línea editorial sin religión.
BUSCA = {
 "osasuna": ["Estadio El Sadar Pamplona", "El Sadar estadio"],
 "pelota": ["frontón Navarra", "frontón pelota vasca"],
 "balonmano-baloncesto": ["Navarra Arena Pamplona", "pabellón deportivo Pamplona"],
 "ciclismo-carreras": ["ciclismo Navarra carretera", "ciclistas Navarra"],
 "deporte": ["campo de fútbol Navarra", "polideportivo Navarra"],
 "sanfermines": ["encierro San Fermín Pamplona", "San Fermín Pamplona fiestas"],
 "fiestas-pueblo": ["gigantes Pamplona comparsa", "fiestas Navarra pueblo"],
 "concierto": ["concierto Pamplona", "auditorio Baluarte Pamplona"],
 "teatro": ["Teatro Gayarre Pamplona", "Baluarte Pamplona"],
 "museo": ["Museo de Navarra Pamplona", "Museo Universidad de Navarra"],
 "libros": ["Biblioteca de Navarra", "biblioteca Pamplona"],
 "rescate-monte": ["Pirineo navarro montaña", "Mesa de los Tres Reyes"],
 "bomberos-incendio": ["Bomberos de Navarra", "camión de bomberos Navarra"],
 "policia": ["Policía Foral de Navarra", "Policía Municipal de Pamplona"],
 "ambulancia-hospital": ["Complejo Hospitalario de Navarra", "Hospital de Navarra Pamplona"],
 "carretera": ["autovía Navarra", "carretera Navarra"],
 "rio-crecida": ["río Arga crecida", "río Arga Pamplona", "río Ebro Tudela"],
 "nieve": ["nieve Belagua", "nieve Navarra"],
 "niebla-frio": ["niebla Navarra", "helada Navarra"],
 "viento-temporal": ["aerogeneradores Navarra", "nubes tormenta Navarra"],
 "lluvia": ["lluvia Pamplona", "lluvia Navarra"],
 "calor-sol": ["Bardenas Reales", "verano Navarra campo"],
 "parlamento-gobierno": ["Parlamento de Navarra", "Palacio de Navarra Pamplona"],
 "universidad": ["Universidad Pública de Navarra campus", "Universidad de Navarra campus"],
 "colegio": ["instituto Pamplona edificio", "colegio Navarra edificio"],
 "vivienda": ["viviendas Pamplona", "edificios viviendas Navarra"],
 "dinero": ["billetes de euro", "monedas de euro"],
 "empresa-industria": ["Volkswagen Navarra Landaben", "polígono industrial Navarra"],
 "comercio": ["Casco Antiguo Pamplona calle", "mercado de Santo Domingo Pamplona"],
 "tudela": ["Tudela Navarra"],
 "estella": ["Estella-Lizarra"],
 "pamplona": ["Plaza del Castillo Pamplona", "Ayuntamiento de Pamplona", "Ciudadela de Pamplona"],
 "pueblo": ["pueblo Navarra", "Baztan pueblo", "Ochagavía"],
}
QUITAR = set()   # nombres de archivo de Commons que no queremos (p. ej. "File:Foo.jpg")
LIBRES = re.compile(r"^(cc0|public domain|pd|cc by(-sa)? ?[0-9.]*( [a-z]+)?|cc-by(-sa)?-[0-9.]+)", re.I)
NO_VALE = re.compile(r"mapa|map\b|plano|escudo|coat of arms|logo|bandera|flag|diagram|grabado|dibujo|pintura|cuadro|retrato|portrait|"
                     r"selfie|\bniñ[oa]s?\b|children|kids|desnud|nude|cartel|poster|panel|captura|screenshot", re.I)


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
    """Hasta 25 fotos de Commons para una búsqueda, con url de 1000 px y su autor y licencia."""
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


def main():
    jf = os.path.join(WEB, "titulares-fotos.json")
    D = json.load(open(jf, encoding="utf-8"))
    cred = D.get("creditos", {})
    libres, info, usados = {}, [], set()
    # se borran las libres viejas: se vuelven a sacar todas (así QUITAR funciona)
    for f in os.listdir(WEB):
        if re.match(r"tit-.+-c[0-9a-f]{10}\.webp$", f):
            os.remove(os.path.join(WEB, f)); cred.pop(f, None)
    for tema, qs in BUSCA.items():
        L = []
        for q in qs:
            for p in busca(q):
                if len(L) >= POR_TEMA: break
                t = p.get("title", "")
                if t in usados or t in QUITAR or NO_VALE.search(t): continue
                ii = (p.get("imageinfo") or [{}])[0]
                if ii.get("mime") not in ("image/jpeg", "image/webp"): continue
                w, h = ii.get("width", 0), ii.get("height", 0)
                if w < 1000 or not h or not (1.15 <= w / h <= 2.1): continue     # apaisadas y con buena resolución
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
                nombre = "tit-%s-c%s.webp" % (tema, hashlib.sha1(t.encode()).hexdigest()[:10])
                try:
                    recorta(datos, os.path.join(WEB, nombre))
                except Exception as e:
                    print("   no recorta", t, e); continue
                usados.add(t); L.append(nombre)
                cred[nombre] = {"a": autor, "l": lic, "u": ii.get("descriptionurl", ""), "t": t.replace("File:", "")}
                info.append("%-22s %s · %s · %s" % (tema, t[5:60], lic, autor[:40]))
                time.sleep(0.6)
            if len(L) >= POR_TEMA: break
        if L: libres[tema] = L
        else: info.append("%-22s SIN FOTOS LIBRES" % tema)
        print(tema, len(L))
    D["libres"] = libres
    D["creditos"] = cred
    json.dump(D, open(jf, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(os.path.join(os.path.dirname(jf), "..", "tools", "fotostitulares_info.txt"), "w", encoding="utf-8").write(
        "Fotos libres para titulares: %d fotos en %d temas\n%s\n" % (sum(map(len, libres.values())), len(libres), "\n".join(info)))


if __name__ == "__main__":
    main()
