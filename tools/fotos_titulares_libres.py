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
 "balonmano-baloncesto": ["Navarra Arena Pamplona exterior", "pabellón Anaitasuna Pamplona", "pabellón deportivo Pamplona"],
 "ciclismo-carreras": ["ciclismo Navarra carretera", "ciclistas Navarra"],
 "deporte": ["campo de fútbol Navarra", "polideportivo Navarra"],
 "sanfermines": ["encierro San Fermín Pamplona", "San Fermín Pamplona fiestas"],
 "fiestas-pueblo": ["gigantes Pamplona comparsa", "fiestas Navarra pueblo"],
 "concierto": ["concierto Pamplona", "escenario concierto Navarra", "auditorio Baluarte Pamplona"],
 "teatro": ["Teatro Gayarre Pamplona", "Baluarte Pamplona"],
 "museo": ["Museo de Navarra Pamplona", "Museo Universidad de Navarra"],
 "libros": ["Biblioteca de Navarra", "biblioteca Pamplona"],
 "rescate-monte": ["Pirineo navarro montaña", "Mesa de los Tres Reyes"],
 "bomberos-incendio": ["Bomberos de Navarra", "parque de bomberos Navarra", "incendio forestal humo España"],
 "policia": ["Policía Foral de Navarra", "Policía Municipal de Pamplona", "Guardia Civil coche patrulla"],
 "ambulancia-hospital": ["Complejo Hospitalario de Navarra", "Hospital de Navarra Pamplona", "ambulancia Navarra", "ambulancia España"],
 "carretera": ["Autovía A-15 Navarra", "autovía Navarra", "carretera Navarra", "N-121 Navarra"],
 "rio-crecida": ["río Arga crecida", "río Arga Pamplona", "río Ebro Tudela"],
 "nieve": ["nieve Belagua", "nieve Navarra", "nieve Pirineo navarro", "Larra nieve"],
 "niebla-frio": ["niebla Navarra", "helada Navarra"],
 "viento-temporal": ["parque eólico Navarra", "aerogeneradores Navarra", "Sierra del Perdón molinos", "nubes de tormenta"],
 "lluvia": ["lluvia Pamplona", "paraguas lluvia calle", "gotas de lluvia"],
 "calor-sol": ["Bardenas Reales", "verano Navarra campo"],
 "parlamento-gobierno": ["Parlamento de Navarra", "Palacio de Navarra Pamplona"],
 "universidad": ["Universidad Pública de Navarra campus", "Universidad de Navarra Pamplona edificio", "Universidad de Navarra campus Pamplona"],
 "colegio": ["colegio público Navarra", "ikastola Navarra", "aula escuela pupitres", "Instituto de Educación Secundaria Navarra"],
 "vivienda": ["viviendas Pamplona", "edificios viviendas Navarra"],
 "dinero": ["billetes de euro", "monedas de euro"],
 "empresa-industria": ["Volkswagen Navarra Landaben", "polígono industrial Navarra"],
 "comercio": ["Casco Antiguo Pamplona calle", "mercado de Santo Domingo Pamplona"],
 "tudela": ["Tudela Navarra", "Plaza de los Fueros Tudela"],
 "estella": ["Estella-Lizarra"],
 "pamplona": ["Plaza del Castillo Pamplona", "Ayuntamiento de Pamplona", "Ciudadela de Pamplona"],
 "pueblo": ["pueblo Navarra", "Baztan pueblo", "Ochagavía", "Valle de Roncal pueblo"],
}
QUITAR = {   # fotos de Commons que no queremos (revisadas a mano el 26 nov. 2026: gente en primer plano, religión, fuera de Navarra, no pegan…)
 'File:(CHN-Hubei) Showcar Luxeed R7 No-plate rear 2024-12-04.jpg',
 'File:1908-10-17, Blanco y Negro, Concierto por la tarde en uno de los paseos de la Exposición, Coyne.jpg',
 'File:2012-01-20 17-34-13 Spain Canarias Jandía 2.jpg',
 'File:2012-01-20 17-34-13 Spain Canarias Jandía.jpg',
 'File:Belen jardín Diputación Navarra 2.jpg',
 'File:Campus Universidad Navarra-Madrid-02.jpg',
 'File:Campus Universidad Navarra-Madrid-05.jpg',
 'File:Charla del Justicia en el Parlamento de Navarra (46562979485).jpg',
 'File:Elurretako amabirjinaren baseliza 02.jpg',
 'File:Equipo en el Groove Music Festival, Navarra Arena, 13 de septiembre de 2025.jpg',
 'File:Groove Music Festival, Navarra Arena, 13 de septiembre de 2025.jpg',
 'File:Instituto Navarro de Administración Pública (INAP).jpg',
 'File:Interior del Instituto Navarro de Administración Pública (Pamplona).jpg',
 'File:Javierada 2020 09.jpg',
 'File:Jendetza Nafarroa Arenan.jpg',
 'File:Lokiz Aramendia nieve.jpg',
 'File:Pamplona - Instituto Navarro de Administración Pública (INAP) 1.jpg',
 'File:Pamplona - Instituto Navarro de Administración Pública (INAP) 2.jpg',
 'File:Pasaje de invierno Esain, Navarra 40x50 Julio Garcia de la Peña Oller.jpg',
 'File:Tanque de amortiguacion de lluvias en Av. Ramon Anador entre Navarra y Maipu - 20220517dicimouysm1182.jpg',
 'File:Tanque de amortiguacion de lluvias en Av. Ramon Anador entre Navarra y Maipu - 20220517dicimouysm1217.jpg',
 'File:Toma de Posesión del Defensor del Pueblo de Navarra (51979120772).jpg',
 'File:Tudela - Hotel Santa Ana Tudela 2.jpg',
 'File:24 Denboraldia. Donostia.jpg',
 'File:Camión de Bomberos, Santiago A74181820240526.jpg',
 'File:Antiguo Camión de Bomberos A74181920240526.jpg',
 'File:Cuartel de Bomberos de la Boca 03 camión de bomberos antiguo.jpg',
 'File:2013ko Sanferminak 4.jpg',
 'File:Hospital de Navarra.jpg',
 'File:PH-CHN (16429449098).jpg',
 'File:A15 errepidea 1 - 94-001.jpg',
 'File:2007-08-15 Spain Mallorca Palma Port Costa Concordia.JPG',
 'File:Aralar, árboles 1990 04.jpg',
 'File:En la "frontera".jpg',
 'File:HectorCloud.jpg',
 'File:Tanque de amortiguacion de lluvias en Av. Ramon Anador entre Navarra y Maipu - 20220517dicimouysm1065.jpg',
 'File:Tanque de amortiguacion de lluvias en Av. Ramon Anador entre Navarra y Maipu - 20220517dicimouysm1161.jpg',
 'File:Tanque de amortiguacion de lluvias en Av. Ramon Anador entre Navarra y Maipu - 20220517dicimouysm1338.jpg',
 'File:Clínica Universidad de Navarra-Oratorio 02.jpg',
 'File:24 Denboraldia. Donostia - 53364063220.jpg',
 'File:4X-CHN ErezS.jpg',
 'File:CHN ENERGY 20250909.jpg',
 'File:Copia de IMG 2349 09.jpg',
 'File:El Lehendakari Urkullu participa en la manifestación de Barcelona contra los atentados terroristas y en solidaridad con las víctimas 01.jpg',
 'File:Ihurbain mendia eta Unanu herria Urbasatik ikusita.jpg',
 'File:Lot-8235-15 (30536047861).jpg',
 'File:Oratorio de la Clínica Universidad de Navarra 07.jpg',
 'File:The Web Conference 2019 May 15, 11 50 44 AM.jpg',
 'File:Vicente Espinel Library Mural (Flores, 2023) 01.jpg',
 'File:Vicente Espinel Library Mural (Flores, 2023) 03.jpg',
 'File:Vicente Espinel Library Mural (Flores, 2023) 04.jpg',
}
LIBRES = re.compile(r"^(cc0|public domain|pd|cc by(-sa)? ?[0-9.]*( [a-z]+)?|cc-by(-sa)?-[0-9.]+)", re.I)
NO_VALE = re.compile(r"mapa|map\b|plano|escudo|coat of arms|logo|bandera|flag|diagram|grabado|dibujo|pintura|cuadro|retrato|portrait|"
                     r"selfie|toma de posesi|charla|reunión|reunion|bel[eé]n|nativ|ermita|baseliza|iglesia|church|capilla|hotel|showcar|altar|retablo|crucero|cruise|aeropuerto|airport|avión|t[uú]nel|alcantarill|\bniñ[oa]s?\b|children|kids|desnud|nude|cartel|poster|panel|captura|screenshot", re.I)


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
