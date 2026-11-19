"""
📰 Titulares de Navarra para BasatiNA (sin política).

  python3 tools/noticias.py   ->  noticias/noticias.json  y  noticias/noticias_info.txt

Qué hace:
  1. Para cada medio de MEDIOS usa SOLO su propio canal RSS: primero las direcciones conocidas (FEEDS),
     luego las que anuncia su web (etiqueta <link rel="alternate">) y luego las habituales (/feed/, /rss…).
     Si un medio no tiene RSS, ese medio se salta.
     POR QUÉ (legalidad, 17 nov. 2026): el RSS es lo que el propio medio publica para que otros lo
     enlacen. Ya NO se usa Google Noticias: reutilizar su buscador dentro de otra app es más dudoso.
  2. Se queda con los titulares de las últimas 48 horas.
  3. Quita los de política (lista NO, la misma idea que el «Dato del día») y los repetidos.
  4. Guarda SOLO el titular, el enlace directo al medio, el nombre del medio y la hora.
     Nunca el texto, el resumen ni las fotos: la noticia se lee en la web del medio.
     Base legal: art. 129 bis LPI (RDL 24/2021): los enlaces y los extractos muy breves (un titular)
     no necesitan licencia del editor. Fotos y textos SÍ: no añadirlos nunca.
     Si un medio pide que no se le enlace, se quita de MEDIOS y listo.

Para añadir un medio: una línea más en MEDIOS (nombre, web, dominio, palabra que debe salir si el medio es nacional).
Para quitar temas: una palabra más en NO (sin tildes, en minúsculas).
Lo ejecuta GitHub Actions (.github/workflows/noticias.yml) cada 2 horas. Los datos van fuera de web/,
así que no cambian la versión de la pantalla: la app los lee de GitHub al abrir «Titulares».
"""
import json, re, html, time, datetime, email.utils, urllib.request, urllib.parse, unicodedata, os

UA = {"User-Agent": "Mozilla/5.0 (BasatiNA/1.0; +https://basatina.es)"}
# (nombre, web donde buscar el RSS, dominio, palabra obligatoria para medios nacionales)
# Quitados el 17 nov. 2026 (comprobado desde GitHub Actions):
#   - Navarra Televisión: su web bloquea a los robots → se respeta, no se insiste.
#   - EITB y RTVE: no tienen RSS de Navarra al día (el de RTVE es de 2022, el de EITB de 2025).
#   Si algún día publican RSS que funcione, se vuelven a añadir aquí y en FEEDS.
# Diario de Noticias (noticiasdenavarra.com) se vuelve a añadir el 19 nov. 2026, ahora con las direcciones exactas
# de su página pública de RSS (https://www.noticiasdenavarra.com/rss.html) en JUNTAR, y se ha pedido permiso por
# correo. El 17 nov. su web bloqueaba a este robot al buscar el RSS por su cuenta: si vuelve a dar error 403 o
# similar en el registro de Actions, se QUITA de MEDIOS y no se insiste (ni se cambia el User-Agent para colarse).
MEDIOS = [
    ("Diario de Navarra", "https://www.diariodenavarra.es/", "diariodenavarra.es", ""),
    ("Pamplona Actual", "https://pamplonaactual.com/", "pamplonaactual.com", ""),
    ("Navarra Capital", "https://navarracapital.es/", "navarracapital.es", ""),
    ("Europa Press", "https://www.europapress.es/navarra/", "europapress.es", "navarra"),
    ("Cadena SER", "https://cadenaser.com/navarra/", "cadenaser.com", "navarra"),
    ("COPE", "https://www.cope.es/emisoras/navarra/", "cope.es", "navarra"),
    ("Diario de Noticias", "https://www.noticiasdenavarra.com/", "noticiasdenavarra.com", ""),
]
# canales RSS conocidos de cada medio (se prueban antes que los que anuncie su web)
FEEDS = {
    "Diario de Navarra": ["https://www.diariodenavarra.es/rss/contenidos.xml"],
    "Pamplona Actual": ["https://pamplonaactual.com/feed/"],
    "Navarra Capital": ["https://navarracapital.es/feed/"],
    "Europa Press": ["https://www.europapress.es/rss/rss.aspx?ch=293"],
    "COPE": ["https://www.cope.es/rss/emisoras/navarra.xml"],
    "Cadena SER": ["https://cadenaser.com/arc/outboundfeeds/rss/category/navarra/?outputType=xml",
                   "https://cadenaser.com/arc/outboundfeeds/rss/?outputType=xml"],
}
# medios que publican un canal RSS por sección: se juntan TODOS los de la lista (no solo el primero que responda)
# Diario de Noticias, secciones de su página de RSS: Navarra, Pamplona, Sociedad, Cultura y Deportes
JUNTAR = {
    "Diario de Noticias": ["https://www.noticiasdenavarra.com/rss/section/%s" % n for n in ("20000", "20153", "20008", "20013", "20017")],
}
# medios que no se usan nunca (dominios: «navarra.com» NO incluye noticiasdenavarra.com, que es otro medio)
FUERA = ("navarra.com", "okdiario.com", "elmundo.es")
# secciones que no se publican, por la ruta de la dirección (política, opinión, esquelas y la propaganda del propio medio)
PATH_NO = ("/politica/", "/opinion/", "/esquelas/", "/obituarios/", "/comunicacion/", "/elecciones")


def fuera(u):
    """True si el enlace es de un medio de FUERA. Se compara el dominio completo, no un trozo del texto."""
    h = (urllib.parse.urlparse(u).hostname or "").lower()
    return any(h == d or h.endswith("." + d) for d in FUERA)
NO = ["elecci", "electoral", "partido politico", "partidos politicos", "parlament", "gobierno de espana", "consejer", "diputacion", "congreso", "senado",
      "ministr", "alcald", "concejal", "pleno", "votacion", "referendum", "presupuestos generales", "moncloa",
      "upn", "psn", "psoe", "pnv", "bildu", "geroa", "podemos", "vox", " pp ", "sumar", "contigo navarra",
      "sanchez", "feijoo", "chivite", "asiron", "esparza", "abascal", "puigdemont", "independentis", "nacionalis",
      " eta ", "terroris", "atentad", "guerra", "israel", "gaza", "ucrania", "putin", "trump", "franquis", "manifestacion", "huelga general"]
CAT = [("Deportes", r"osasuna|futbol|baloncesto|balonmano|ciclis|pelota|atletism|partido de|liga|copa|helvetia anaitasuna|tenis|carrera|maraton|sadar"),
       ("El tiempo", r"tiempo|lluvia|nieve|temporal|viento|aemet|calor|frio|inundac|crecida|riada|tormenta|granizo|helada|aviso amarillo|aviso naranja"),
       ("Sucesos", r"accidente|herid|fallec|muere|muerto|incendio|deten|robo|guardia civil|policia|rescat|atropell|choque"),
       ("Cultura", r"concierto|festival|teatro|exposic|museo|cine|libro|musica|baluarte|gayarre|fiesta|san fermin|sanfermin|carnaval|danza"),
       ("Economía", r"empresa|empleo|paro|trabajador|inversion|euros|millones|precio|vivienda|industria|comercio|turismo|agricult|ganader")]


def nrm(s):
    return "".join(c for c in unicodedata.normalize("NFD", (s or "").lower()) if unicodedata.category(c) != "Mn")


def get(url, t=25):
    r = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=t)
    return r.read().decode(r.headers.get_content_charset() or "utf-8", "replace")


def rss_de(home):
    """Busca los canales RSS que la propia web anuncia."""
    try:
        h = get(home)
    except Exception as e:
        print("   web no responde:", e)
        return []
    L = []
    for m in re.finditer(r"<link[^>]+>", h, re.I):
        tag = m.group(0)
        if re.search(r"rss\+xml|atom\+xml", tag, re.I):
            u = re.search(r'href=["\']([^"\']+)', tag)
            if u: L.append(urllib.parse.urljoin(home, html.unescape(u.group(1))))
    # el de la sección de Navarra primero
    return sorted(dict.fromkeys(L), key=lambda u: 0 if "navarra" in u.lower() else 1)


def items(xml):
    out = []
    for it in re.findall(r"<(?:item|entry)\b.*?</(?:item|entry)>", xml, re.S | re.I):
        def tag(n):
            m = re.search(r"<%s\b[^>]*>(.*?)</%s>" % (n, n), it, re.S | re.I)
            if not m: return ""
            v = m.group(1)
            for _ in range(2):   # a veces el CDATA viene escapado (&lt;![CDATA[…): se limpia dos veces
                v = html.unescape(re.sub(r"<!\[CDATA\[|\]\]>|<[^>]+>", "", v))
            return v.strip()
        t = tag("title")
        u = tag("link") or (re.search(r'<link[^>]+href=["\']([^"\']+)', it) or [None, ""])[1]
        d = tag("pubDate") or tag("published") or tag("updated") or tag("dc:date")
        try:
            f = email.utils.parsedate_to_datetime(d) if "," in d or re.search(r"[A-Za-z]{3} \d{4}", d) else datetime.datetime.fromisoformat(d.replace("Z", "+00:00"))
            if f.tzinfo is None: f = f.replace(tzinfo=datetime.timezone.utc)
        except Exception:
            f = None
        if t and u: out.append({"t": re.sub(r"\s+", " ", t), "u": u.strip(), "d": f})
    return out


ahora = datetime.datetime.now(datetime.timezone.utc)
todo, info, vistos = [], [], set()
for nombre, home, dom, palabra in MEDIOS:
    print("·", nombre, flush=True)
    L, origen = [], ""
    base = home.split("/", 3); base = base[0] + "//" + base[2] + "/"
    if nombre in JUNTAR:
        # un canal por sección: se leen todos y se juntan, sin repetir enlaces
        enlaces = set()
        for f in JUNTAR[nombre]:
            try:
                for x in items(get(f)):
                    if x["u"] not in enlaces:
                        enlaces.add(x["u"]); L.append(x)
                origen = "%d canales RSS propios (JUNTAR)" % len(JUNTAR[nombre])
            except Exception as e:
                print("   RSS falló:", f, e)
            time.sleep(1)
    else:
        probar = FEEDS.get(nombre, []) + rss_de(home)[:3] + [base + "feed/", base + "rss/", base + "rss.xml"]
        for f in dict.fromkeys(probar):
            try:
                L = items(get(f)); origen = f
                if L: break
            except Exception as e:
                print("   RSS falló:", f, e)
    if not L: origen = ""
    # si el canal ya es el de la sección de Navarra, no hace falta que el titular diga «Navarra»
    pal = "" if "navarra" in origen.lower() else palabra
    n0 = len(L)
    sel = []
    if L: print("   ejemplo:", L[0]["d"], L[0]["u"][:90], flush=True)   # para revisar en el registro de Actions
    for x in L:
        if not x["d"] or (ahora - x["d"]).total_seconds() > 48 * 3600: continue
        if fuera(x["u"]) or any(p in x["u"].lower() for p in PATH_NO): continue
        if not x["u"].startswith("http") or dom not in x["u"]: continue   # solo enlaces directos al propio medio
        nt = " " + nrm(x["t"]) + " "
        if pal and pal not in nt and pal not in nrm(x["u"]): continue
        if any(w in nt for w in NO): continue
        k = re.sub(r"\W+", "", nt)[:70]
        if k in vistos: continue
        vistos.add(k)
        cat = next((c for c, rx in CAT if re.search(rx, nt)), "Navarra")
        sel.append({"t": x["t"][:200], "u": x["u"], "f": nombre, "d": x["d"].astimezone(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%MZ"), "c": cat})
        if len(sel) >= 15: break
    info.append("%-20s %3d leídos · %3d publicados · %s" % (nombre, n0, len(sel), origen or "SIN RSS (medio saltado)"))
    print("  ", info[-1], flush=True)
    todo += sel
    time.sleep(1)

todo.sort(key=lambda x: x["d"], reverse=True)
os.makedirs("noticias", exist_ok=True)
if len(todo) < 5 and os.path.exists("noticias/noticias.json"):
    print("Muy pocos titulares: se deja el archivo anterior")
else:
    json.dump({"t": ahora.strftime("%Y-%m-%dT%H:%MZ"), "items": todo[:150]}, open("noticias/noticias.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
open("noticias/noticias_info.txt", "w", encoding="utf-8").write("Titulares %s\n%s\nTotal: %d\n" % (ahora.isoformat()[:16], "\n".join(info), len(todo)))
print("Total:", len(todo))
