"""
😄 Noticias curiosas y simpáticas para BasatiNA (mañana, tarde y noche).

  python3 tools/curiosas.py   ->  noticias/curiosas.json  y  noticias/curiosas_info.txt

Qué hace:
  1. Lee el canal RSS de muchos medios (de distintas líneas editoriales; nunca Navarra.com, OKdiario
     ni El Mundo). Casi ningún medio tiene un RSS solo de «noticias graciosas» (comprobado el
     17 nov. 2026), así que se leen sus canales generales o de sociedad y nos quedamos con las curiosas:
       - por la SECCIÓN de la web en el enlace (/curioso/, /viral/, /curiosidades/…)  -> SECCION
       - o por PALABRAS del titular (curioso, insólito, se hace viral, divertido…)       -> FUERTE y SUAVE
  2. Quita política (lista NO, la misma idea que los «Titulares») y los temas tristes (lista TRISTE:
     muertes, accidentes, enfermedades, violencia…). Una noticia «curiosa» triste no es graciosa.
  3. Quita las que hayáis ocultado desde la app (noticias/curiosas_ocultas.json, modo Administrador)
     y las palabras extra que pongáis ahí en "prohibidas".
  4. Elige la «noticia curiosa» de cada turno: mañana (m), tarde (t) y noche (n), hora de Madrid.
     Una vez elegida, no cambia en todo el turno (así el aviso del móvil y la app dicen lo mismo).
  5. Guarda SOLO titular + enlace + medio + hora (art. 129 bis LPI: enlaces y titulares sí;
     textos y fotos no). La noticia se lee en la web del medio.

Para añadir un medio: una línea más en MEDIOS. Para quitar temas: una palabra más en NO o TRISTE
(sin tildes y en minúsculas), o sin programar en "prohibidas" de noticias/curiosas_ocultas.json.
Lo ejecuta GitHub Actions (.github/workflows/curiosas.yml) varias veces al día.
"""
import json, re, html, time, datetime, email.utils, urllib.request, urllib.parse, unicodedata, os, sys
from zoneinfo import ZoneInfo

UA = {"User-Agent": "Mozilla/5.0 (BasatiNA/1.0; +https://basatina.es)"}
MAD = ZoneInfo("Europe/Madrid")
# (nombre, dominio, [canales RSS]) — comprobados desde GitHub Actions el 17 nov. 2026
MEDIOS = [
    ("Telecinco", "telecinco.es", ["https://www.telecinco.es/noticias/rss.xml"]),
    ("Cuatro", "cuatro.com", ["https://www.cuatro.com/noticias/rss.xml"]),
    ("Antena 3", "antena3.com", ["https://www.antena3.com/noticias/rss/4043815.xml"]),
    ("laSexta", "lasexta.com", ["https://www.lasexta.com/rss/351410.xml"]),
    ("20minutos", "20minutos.es", ["https://www.20minutos.es/rss/"]),
    ("El Español", "elespanol.com", ["https://www.elespanol.com/rss/curiosidades/"]),
    ("COPE", "cope.es", ["https://www.cope.es/rss/actualidad/sociedad.xml"]),
    ("ABC", "abc.es", ["https://www.abc.es/rss/2.0/sociedad/"]),
    ("La Vanguardia", "lavanguardia.com", ["https://www.lavanguardia.com/rss/vida.xml"]),
    ("HuffPost", "huffingtonpost.es", ["https://www.huffingtonpost.es/feeds/index.xml"]),
    ("elDiario.es", "eldiario.es", ["https://www.eldiario.es/rss/"]),
    ("Cadena SER", "cadenaser.com", ["https://cadenaser.com/arc/outboundfeeds/rss/?outputType=xml"]),
    ("El Correo", "elcorreo.com", ["https://www.elcorreo.com/rss/2.0/?section="]),
    ("Diario de Navarra", "diariodenavarra.es", ["https://www.diariodenavarra.es/rss/contenidos.xml"]),
]
# Canales que son SOLO de curiosidades: todas sus noticias cuentan como de la sección curiosa (+3 puntos)
CANAL_CURIOSO = ("https://www.telecinco.es/noticias/curioso/rss.xml", "https://www.elespanol.com/rss/curiosidades/")
MEDIOS.insert(0, ("Telecinco", "telecinco.es", ["https://www.telecinco.es/noticias/curioso/rss.xml"]))   # 19 nov 2026: canal propio de «Curioso»
# 🔎 Google Noticias (19 nov 2026): búsquedas de noticias curiosas en cientos de medios españoles (gl=ES).
# Con los canales de arriba solo salían 2-3 curiosas al día. De aquí solo se guarda titular, enlace y medio.
# El medio va en <source url="…">: así se quitan Navarra.com, OKdiario y El Mundo, los deportivos y los de fuera de España.
GN = "https://news.google.com/rss/search?hl=es&gl=ES&ceid=ES:es&q="
GOOGLE = [GN + urllib.parse.quote(q) for q in (
    'curioso OR insólito OR "se hace viral" when:2d',
    '"récord Guinness" when:3d',
    'curiosa OR divertida OR surrealista OR hilarante when:2d',
    '"historia curiosa" OR "noticias curiosas" OR "nunca visto" OR "no daba crédito" when:3d',
    'Navarra (curioso OR insólito OR viral OR "récord") when:7d',   # un toque de casa
)]
# Solo medios de España: dominios .es/.eus/.cat/.gal y esta lista de medios españoles con .com
# (Google Noticias mete muchos de América aunque se pida España). Para añadir uno: una palabra más aquí.
GN_COM = ("elconfidencial.com", "eldebate.com", "antena3.com", "lasexta.com", "cuatro.com", "cadenaser.com", "elperiodico.com", "lavanguardia.com",
          "elcorreo.com", "diariovasco.com", "larioja.com", "noticiasdenavarra.com", "elespanol.com", "elpais.com", "levante-emv.com", "elplural.com",
          "vozpopuli.com", "theobjective.com", "lainformacion.com", "granadahoy.com", "elperiodicodearagon.com", "elperiodicoextremadura.com",
          "elperiodicomediterraneo.com", "revistaque.com", "vocesdecuenca.com", "xataka.com", "genbeta.com", "directoalpaladar.com", "trendencias.com",
          "microsiervos.com", "muyinteresante.com", "hogarmania.com", "eltiempo.es", "meteored.com", "europapress.es", "lavozdeasturias.com",
          "nationalgeographic.com.es", "infosalus.com", "elcorreogallego.com", "laopinioncoruna.com", "diariodeleon.com", "elnortedecastilla.com")
GN_FUERA = ("sport.es", "superdeporte.es", "estadiodeportivo.com", "eldesmarque.com", "relevo.com", "defensacentral.com", "futbolfantasy.com")
# temas de Google que no son «noticias graciosas» (críticas de cine, fútbol, videojuegos…); solo para Google Noticias
GN_NO = ["critica", "comedia", "cine", "resena", "pelicula", "serie", "temporada", "estreno", "netflix", "prime video", "disney", "hbo", "album", "disco", "concierto",
         "gta", "videojuego", "fichaje", "partido", "liga", "champions", "gol", "entrenador", "selección", "seleccion", "real madrid", "barca", "atletico",
         "famos", "reality", "casa de los famosos", "gran hermano", "supervivientes", "oferta", "descuento", "black friday", "chollo"]
def gn_fuera(u):
    h = (urllib.parse.urlparse(u).hostname or "").lower()
    es = h.endswith((".es", ".eus", ".cat", ".gal")) or any(h == d or h.endswith("." + d) for d in GN_COM)
    return not h or not es or fuera(u) or any(h == d or h.endswith("." + d) for d in GN_FUERA)
# Diario de Noticias: quitado 19 nov 2026, su servidor responde 406 (WAF) a GitHub Actions. No insistir ni cambiar el User-Agent.
JUNTAR = ()
FUERA = ("navarra.com", "okdiario.com", "elmundo.es")   # dominios exactos (noticiasdenavarra.com NO es navarra.com)
PATH_NO = ("/politica/", "/opinion/", "/esquelas/", "/obituarios/", "/comunicacion/", "/elecciones")
def fuera(u):
    h = (urllib.parse.urlparse(u).hostname or "").lower()
    return any(h == d or h.endswith("." + d) for d in FUERA)
# secciones de curiosidades en la dirección de la noticia
SECCION = r"/(curioso|curiosidades?|viral|insolito|tremending|sorprendente|trending|redes-sociales|curiosa)/"
# palabras del titular (se buscan al principio de palabra: «gato» no salta con «obligatoria»)
# FUERTE = casi seguro que es simpática (2 puntos); SUAVE = ayuda, pero sola no basta (1 punto)
FUERTE = ["curios", "insolit", "viral", "divertid", "gracios", "surrealista", "hilarante", "carcajada", "risas", "peculiar",
          "record guinness", "guinness", "record mundial", "hazana", "extravagan", "no daba credito", "no te lo vas a creer", "ingenios", "anecdota", "meme", "memes"]
SUAVE = ["sorprend", "inesperad", "el motivo", "la razon por la que", "truco", "mascota", "perro", "perrit", "gato", "gatit", "loro", "pinguino", "panda",
         "cabra", "burro", "erizo", "nutria", "abuela", "abuelo", "centenari", "boda", "tarta", "pizza", "croqueta", "tortilla", "churro", "jamon",
         "broma", "disfraz", "ovni", "dinosaurio", "tesoro", "record", "records"]
NO = ["politic", "democrac", "derecha", "izquierda", "ultra", "elecci", "electoral", "candidat", "mitin", "partido politico", "parlament", "gobierno", "consejer", "diputacion", "congreso", "senado",
      "ministr", "alcald", "concejal", "pleno", "votacion", "voto", "referendum", "presupuesto", "moncloa", " ley ", "decreto", "tribunal", "juez", "juzgado", "fiscal",
      "upn", "psn", "psoe", "pnv", "bildu", "geroa", "podemos", "vox", " pp ", "sumar", "contigo navarra", " erc ", "junts",
      "sanchez", "feijoo", "chivite", "asiron", "abascal", "puigdemont", "ayuso", " illa ", "yolanda diaz", "trump", "putin", "netanyahu", "milei", "maduro",
      "independentis", "nacionalis", " eta ", "terroris", "atentad", "guerra", "ejercito", "militar", "misil", "israel", "gaza", "ucrania", "rusia", " iran ",
      "franquis", "manifestacion", "huelga", "inmigra", " ice ", "aranceles", "sindicato", "corrupcion", "abalos", "cerdan", "koldo", " uco "]
TRISTE = ["muere", "morgue", "resucit", "velatorio", "muerte", "muerto", "fallec", " mata ", "asesin", "homicid", "cadaver", "fallecid", "luto", "funeral", "suicid", "accidente", "atropell", "choque",
          "herid", "grave", "hospital", " uci ", "cancer", "enferm", "brote", "virus", "legionel", "sarampion", "pandemi", "infart", "ictus", "tumor", "dolor",
          "violen", "agresi", "maltrat", "abuso", "acoso", "viola", "machis", "deten", "arrest", "carcel", "prision", "condena", " robo ", " robos ", " roba ", "estafa", "fraude",
          "polic", "guardia civil", "disparo", "tiroteo", " arma", "explosi", "bomba", "incendio", "fuego", "inundac", "dana", "terremoto", "tragedia", "catastrofe",
          "desapareci", "rescat", "ahog", "naufrag", "victima", "sangre", "cruel", "abandon", "sacrific", "envenen", "veneno", " odio", "racis", "insult", "amenaz",
          "crisis", "despid", "desahuc", "pobreza", "hambre", "drog", "alcohol", "porno", "sexual", "pederast", "pedofil", "parkinson", "alzheimer", "demencia", "desnud", "infiel", "polemic", "denuncia", "multa"]
TURNOS = (("m", "mañana"), ("t", "tarde"), ("n", "noche"))
OCULTAS = "noticias/curiosas_ocultas.json"
SALIDA = "noticias/curiosas.json"


def nrm(s):
    return "".join(c for c in unicodedata.normalize("NFD", (s or "").lower()) if unicodedata.category(c) != "Mn")


def get(url, t=25):
    r = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=t)
    return r.read().decode(r.headers.get_content_charset() or "utf-8", "replace")


def items(xml):
    out = []
    for it in re.findall(r"<(?:item|entry)\b.*?</(?:item|entry)>", xml, re.S | re.I):
        def tag(n):
            m = re.search(r"<%s\b[^>]*>(.*?)</%s>" % (n, n), it, re.S | re.I)
            if not m: return ""
            v = m.group(1)
            for _ in range(2):   # a veces el CDATA viene escapado: se limpia dos veces
                v = html.unescape(re.sub(r"<!\[CDATA\[|\]\]>|<[^>]+>", "", v))
            return v.strip()
        t = tag("title").replace("⁠", "").strip()
        u = tag("link") or (re.search(r'<link[^>]+href=["\']([^"\']+)', it) or [None, ""])[1]
        d = tag("pubDate") or tag("published") or tag("updated") or tag("dc:date")
        try:
            f = email.utils.parsedate_to_datetime(d) if "," in d or re.search(r"[A-Za-z]{3} \d{4}", d) else datetime.datetime.fromisoformat(d.replace("Z", "+00:00"))
            if f.tzinfo is None: f = f.replace(tzinfo=datetime.timezone.utc)
        except Exception:
            f = None
        so = re.search(r'<source[^>]*url=["\']([^"\']+)["\'][^>]*>(.*?)</source>', it, re.S | re.I)
        if t and u: out.append({"t": re.sub(r"\s+", " ", t), "u": u.strip(), "d": f,
                                "su": so.group(1).strip() if so else "", "sn": html.unescape(re.sub(r"<!\[CDATA\[|\]\]>", "", so.group(2))).strip() if so else ""})
    return out


def tiene(nt, L):
    return [w for w in L if w in nt]


def turno_de(dt):
    """Turno de Madrid: mañana 5-12 h, tarde 13-18 h, noche 19-4 h (de madrugada sigue siendo la noche anterior)."""
    l = dt.astimezone(MAD)
    if l.hour < 5: l -= datetime.timedelta(hours=5); return l.strftime("%Y-%m-%d") + "-n"
    return l.strftime("%Y-%m-%d") + "-" + ("m" if l.hour < 13 else "t" if l.hour < 19 else "n")


def clave(t):
    return re.sub(r"\W+", "", nrm(t))[:60]


ahora = datetime.datetime.now(datetime.timezone.utc)
try:
    OC = json.load(open(OCULTAS, encoding="utf-8"))
except Exception:
    OC = {}
ocultas = set(OC.get("urls") or [])
extra = [nrm(w) for w in (OC.get("prohibidas") or []) if w]
try:
    ANT = json.load(open(SALIDA, encoding="utf-8"))
except Exception:
    ANT = {}

todo, info, vistos = [], [], set()


def puntuar(x, nombre, sec_canal=False):
    """Devuelve la noticia lista para guardar, o None si no es curiosa / es política / es triste."""
    if not x["d"] or (ahora - x["d"]).total_seconds() > 72 * 3600: return None
    nt = " " + re.sub(r"[^a-z0-9]+", " ", nrm(x["t"])) + " "   # sin signos: «Irán:» -> « iran »
    if tiene(nt, NO) or tiene(nt, TRISTE) or tiene(nt, extra): return None
    sec = sec_canal or bool(re.search(SECCION, nrm(x["u"])))
    fu, su = tiene(nt, [" " + w for w in FUERTE]), tiene(nt, [" " + w for w in SUAVE])
    p = (3 if sec else 0) + 2 * min(len(fu), 2) + min(len(su), 2)
    if p < 2: return None          # una sola palabra suave («perro», «boda»…) no basta
    k = clave(x["t"])
    if k in vistos: return None
    vistos.add(k)
    # puntos: sección de curiosidades 3, palabra fuerte 2, suave 1; +1 si es de las últimas 24 h
    p += 1 if (ahora - x["d"]).total_seconds() < 24 * 3600 else 0
    print("   +", nombre, p, "SEC" if sec else "", [w.strip() for w in fu + su][:3], "|", x["t"][:90], flush=True)
    return {"t": x["t"][:200], "u": x["u"], "f": nombre, "d": x["d"].astimezone(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%MZ"), "p": p}


for nombre, dom, feeds in MEDIOS:
    L, origen = [], ""
    for f in feeds:
        try:
            if nombre in JUNTAR:
                vu = {y["u"] for y in L}
                L += [y for y in items(get(f)) if y["u"] not in vu]; origen = "%d canales RSS" % len(feeds); time.sleep(1)
                continue
            L = items(get(f)); origen = f
            if L: break
        except Exception as e:
            print("   RSS falló:", nombre, f, e)
    n0, nsel = len(L), 0
    for x in L:
        u = x["u"]
        if fuera(u) or any(q in u.lower() for q in PATH_NO) or not u.startswith("http") or dom not in u or u in ocultas: continue
        y = puntuar(x, nombre, origen in CANAL_CURIOSO)
        if y: todo.append(y); nsel += 1
    info.append("%-18s %3d leídos · %3d curiosas · %s" % (nombre, n0, nsel, origen or "SIN RSS"))
    print(info[-1], flush=True)
    time.sleep(1)

# ---- Google Noticias: muchas más curiosas, como mucho 3 por medio para que haya variedad ----
porMedio, n0, nsel = {}, 0, 0
for f in GOOGLE:
    try:
        L = items(get(f))
    except Exception as e:
        print("   Google Noticias falló:", f, e); L = []
    n0 += len(L)
    for x in L:
        su, sn = x.get("su", ""), x.get("sn", "") or "Google Noticias"
        if gn_fuera(su) or x["u"] in ocultas: continue
        if sn and x["t"].endswith(" - " + sn): x["t"] = x["t"][: -len(" - " + sn)].strip()   # «Titular - Medio» -> «Titular»
        if porMedio.get(sn, 0) >= 3: continue
        nt = " " + re.sub(r"[^a-z0-9]+", " ", nrm(x["t"])) + " "
        if tiene(nt, [" " + w for w in GN_NO]): continue
        y = puntuar(x, sn)
        if y: todo.append(y); nsel += 1; porMedio[sn] = porMedio.get(sn, 0) + 1
    time.sleep(1)
info.append("%-18s %3d leídos · %3d curiosas · %d búsquedas (%d medios)" % ("Google Noticias", n0, nsel, len(GOOGLE), len(porMedio)))
print(info[-1], flush=True)

todo.sort(key=lambda x: (x["p"], x["d"]), reverse=True)

# ---- la noticia de cada turno (no cambia una vez elegida, salvo que se oculte) ----
dest = [d for d in (ANT.get("dest") or []) if d.get("u") not in ocultas]
k_hoy = turno_de(ahora)
usadas = {d.get("u") for d in dest} | {clave(d.get("t", "")) for d in dest}
if not any(d.get("k") == k_hoy for d in dest):
    medios_recientes = [d.get("f") for d in dest[-2:]]
    cand = [x for x in todo if x["u"] not in usadas and clave(x["t"]) not in usadas]
    # mejor si no repite medio con los dos turnos anteriores
    elegida = next((x for x in cand if x["f"] not in medios_recientes), cand[0] if cand else None)
    if elegida:
        dest.append({"k": k_hoy, "t": elegida["t"], "u": elegida["u"], "f": elegida["f"], "d": elegida["d"]})
dest = dest[-12:]   # los 4 últimos días

os.makedirs("noticias", exist_ok=True)
if len(todo) < 3 and ANT.get("items"):
    print("Muy pocas noticias curiosas: se dejan las anteriores")
    todo = [x for x in ANT["items"] if x.get("u") not in ocultas]
json.dump({"t": ahora.strftime("%Y-%m-%dT%H:%MZ"), "turno": k_hoy, "dest": dest, "items": todo[:60]},
          open(SALIDA, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
open("noticias/curiosas_info.txt", "w", encoding="utf-8").write(
    "Noticias curiosas %s (turno %s)\n%s\nTotal: %d\nNoticia del turno: %s\n" % (
        ahora.astimezone(MAD).isoformat()[:16], k_hoy, "\n".join(info), len(todo),
        next((d["f"] + " · " + d["t"] for d in dest if d["k"] == k_hoy), "ninguna")))
print("Total:", len(todo), "· turno", k_hoy)
