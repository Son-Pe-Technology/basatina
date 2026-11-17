"""
📰 Titulares de Navarra para BasatiNA (sin política).

  python3 tools/noticias.py   ->  noticias/noticias.json  y  noticias/noticias_info.txt

Qué hace:
  1. Para cada medio de MEDIOS busca su canal RSS en su propia web (la etiqueta <link rel="alternate">).
     Si no lo encuentra o viene vacío, usa la búsqueda de Google Noticias limitada a ese medio.
  2. Se queda con los titulares de las últimas 48 horas.
  3. Quita los de política (lista NO, la misma idea que el «Dato del día») y los repetidos.
  4. Guarda SOLO el titular, el enlace, el medio y la hora. Nunca el texto de la noticia:
     la noticia se lee en la web del medio.

Para añadir un medio: una línea más en MEDIOS (nombre, web, dominio, palabra que debe salir si el medio es nacional).
Para quitar temas: una palabra más en NO (sin tildes, en minúsculas).
Lo ejecuta GitHub Actions (.github/workflows/noticias.yml) cada 2 horas. Los datos van fuera de web/,
así que no cambian la versión de la pantalla: la app los lee de GitHub al abrir «Titulares».
"""
import json, re, html, time, datetime, email.utils, urllib.request, urllib.parse, unicodedata, os

UA = {"User-Agent": "Mozilla/5.0 (BasatiNA/1.0; +https://basatina.es)"}
# (nombre, web donde buscar el RSS, dominio, palabra obligatoria para medios nacionales)
MEDIOS = [
    ("Diario de Navarra", "https://www.diariodenavarra.es/", "diariodenavarra.es", ""),
    ("Noticias de Navarra", "https://www.noticiasdenavarra.com/", "noticiasdenavarra.com", ""),
    ("Pamplona Actual", "https://pamplonaactual.com/", "pamplonaactual.com", ""),
    ("Navarra Capital", "https://navarracapital.es/", "navarracapital.es", ""),
    ("EITB", "https://www.eitb.eus/es/noticias/navarra/", "eitb.eus", "navarra"),
    ("Europa Press", "https://www.europapress.es/navarra/", "europapress.es", "navarra"),
    ("Cadena SER", "https://cadenaser.com/navarra/", "cadenaser.com", "navarra"),
    ("RTVE", "https://www.rtve.es/noticias/navarra/", "rtve.es", "navarra"),
]
# medios que no se usan nunca
FUERA = ("navarra.com", "okdiario", "elmundo.es")
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


def google(dominio, palabra):
    q = "site:%s %s when:2d" % (dominio, palabra)
    u = "https://news.google.com/rss/search?" + urllib.parse.urlencode({"q": q.strip(), "hl": "es", "gl": "ES", "ceid": "ES:es"})
    L = items(get(u))
    for x in L: x["t"] = re.sub(r"\s+-\s+[^-]+$", "", x["t"])   # «Titular - Medio»
    return L


ahora = datetime.datetime.now(datetime.timezone.utc)
todo, info, vistos = [], [], set()
for nombre, home, dom, palabra in MEDIOS:
    print("·", nombre, flush=True)
    L, origen = [], ""
    for f in rss_de(home)[:3]:
        try:
            L = items(get(f)); origen = f
            if L: break
        except Exception as e:
            print("   RSS falló:", f, e)
    if not L:
        try:
            L = google(dom, palabra); origen = "Google Noticias"
        except Exception as e:
            print("   Google Noticias falló:", e)
    n0 = len(L)
    sel = []
    for x in L:
        if not x["d"] or (ahora - x["d"]).total_seconds() > 48 * 3600: continue
        if any(b in x["u"] for b in FUERA): continue
        nt = " " + nrm(x["t"]) + " "
        if palabra and palabra not in nt and palabra not in nrm(x["u"]): continue
        if any(w in nt for w in NO): continue
        k = re.sub(r"\W+", "", nt)[:70]
        if k in vistos: continue
        vistos.add(k)
        cat = next((c for c, rx in CAT if re.search(rx, nt)), "Navarra")
        sel.append({"t": x["t"][:200], "u": x["u"], "f": nombre, "d": x["d"].astimezone(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%MZ"), "c": cat})
        if len(sel) >= 15: break
    info.append("%-20s %3d leídos · %3d publicados · %s" % (nombre, n0, len(sel), origen or "SIN DATOS"))
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
