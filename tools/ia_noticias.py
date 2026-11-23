"""
📰🤖 Noticias propias de BasatiNA escritas con IA (23 nov. 2026). Lo ejecuta .github/workflows/ia.yml.

  python3 tools/ia_noticias.py   ->  priv/ia_borradores.json  (repositorio PRIVADO Son-Pe-Technology/basatina-borradores)

Los borradores van al repositorio privado para que nadie los vea antes de revisarlos. Las que publicáis
desde la app pasan a noticias/ia_publicadas.json (público).

Qué hace:
  1. Coge los titulares de las últimas 24 h (noticias/noticias.json, que prepara tools/noticias.py).
  2. La IA agrupa los que cuentan LO MISMO en al menos 2 medios distintos.
  3. De cada grupo lee el texto SOLO de los medios de LEER (los que no prohíben la minería de textos,
     comprobado el 23 nov. 2026 con tools/ia_medios.py; Diario de Navarra, SER y COPE lo prohíben).
     De los demás medios usa solo el titular (eso siempre se puede).
  4. La IA escribe una noticia corta CON SUS PALABRAS y compara los datos entre medios.
  5. Se comprueba que no copia frases (8 palabras seguidas iguales que un medio = duda).
  6. Se guarda como «borrador» (o «duda» si algo no cuadra).
  7. PUBLICACIÓN SOLA (23 nov. 2026, lo pidió Pedro): la IA hace una pasada más a cada borrador pendiente:
     quita o deja en general los datos que no coinciden, reescribe frases copiadas y mira si ya está publicada.
     Solo la publica sola (noticias/ia_publicadas.json, con "auto": true) si después NO le queda ninguna duda,
     la cuentan 2 medios o más, no es de sucesos y no lleva datos de particulares. Si no, se queda para revisar
     a mano en Administrador (y llega un aviso al correo). En la app hay un botón «Retirar» por si algo sale mal.
     Para apagarla: variable IA_AUTO=0 en el workflow.
Reglas que se le dan a la IA: sin política, sin nombres ni datos personales de particulares, solo hechos
que digan las fuentes, siempre «según…», nada inventado.
"""
import json, os, re, sys, html, hashlib, datetime, urllib.request, urllib.robotparser, urllib.parse, unicodedata
sys.path.insert(0, os.path.dirname(__file__))
from ia import llamar, json_de, avisar, avisar_error, IAError

LEER = ["Navarra Capital", "Pamplona Actual", "Onda Vasca", "Orain", "Ayuntamiento de Pamplona"]
# Europa Press: su aviso legal no se pudo leer el 23 nov. 2026 → de momento solo su titular.
UA = "Mozilla/5.0 (BasatiNA/1.0; +https://basatina.es)"
ARCH = os.environ.get("IA_ARCH", "priv/ia_borradores.json")   # en el repositorio privado (el workflow lo baja a priv/)
VIEJO = "noticias/ia_borradores.json"                          # donde estaban antes (público): se pasan al privado y se borra
MAX_NUEVAS = int(os.environ.get("IA_MAX_NUEVAS", "6"))   # noticias nuevas por pasada (controla el gasto)
DIAS = 7                                                    # los borradores se guardan una semana
PUB = "noticias/ia_publicadas.json"                          # lo que ve todo el mundo
AUTO = os.environ.get("IA_AUTO", "1") == "1"                # publicar solas las seguras
MAX_AUTO = int(os.environ.get("IA_MAX_AUTO", "6"))          # pasadas de arreglo por vez (controla el gasto)
# Palabras de sucesos: si salen en el titular o el texto, NUNCA se publica sola (aunque la IA diga otra cosa).
SUCESOS = re.compile(r"\b(accident|atropell|herid|fallec|muere|muri|muert|cadaver|detenid|detenci|arrest|investigad|"
                     r"agresi|agred|robo|robad|hurto|asalt|incendi|desaparec|rescat|apunal|acuchill|violen|maltrat|"
                     r"juicio|juzgad|condena|tribunal|fiscal|denunci|guardia civil|policia|ertzaintza|bomberos|sos navarra|"
                     r"112|herido|grave|choque|colision|vuelco|ahog|suicid|abus|estafa|drogas?|okupa)", re.I)


def nrm(s):
    return "".join(c for c in unicodedata.normalize("NFD", (s or "").lower()) if unicodedata.category(c) != "Mn")


def get(u, t=25):
    r = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA}), timeout=t)
    return r.read(1500000).decode(r.headers.get_content_charset() or "utf-8", "replace")


_rb = {}
def deja(u):
    """Respeta el robots.txt de cada web."""
    p = urllib.parse.urlparse(u); base = f"{p.scheme}://{p.netloc}"
    if base not in _rb:
        rp = urllib.robotparser.RobotFileParser(); rp.set_url(base + "/robots.txt")
        try: rp.read()
        except Exception: rp = None
        _rb[base] = rp
    return _rb[base] is None or _rb[base].can_fetch("BasatiNA", u)


def texto_de(u):
    """Texto de la noticia (los párrafos del artículo). Solo para que la IA lea los hechos; no se guarda."""
    if not deja(u): return ""
    try: h = get(u)
    except Exception as e:
        print("   no se pudo leer", u[:80], e); return ""
    h = re.sub(r"(?is)<(script|style|nav|footer|aside|form|figure)\b.*?</\1>", " ", h)
    m = re.search(r"(?is)<article\b.*?</article>", h)
    zona = m.group(0) if m else h
    ps = [html.unescape(re.sub(r"<[^>]+>", " ", p)) for p in re.findall(r"(?is)<p\b[^>]*>(.*?)</p>", zona)]
    ps = [re.sub(r"\s+", " ", p).strip() for p in ps]
    return "\n".join(p for p in ps if len(p) > 50)[:6000]


def tejas(t, n=8):
    w = re.findall(r"\w+", nrm(t))
    return {" ".join(w[i:i + n]) for i in range(max(0, len(w) - n + 1))}


SIS_GRUPOS = """Eres el editor de BasatiNA, una app de Navarra. Te paso titulares numerados de varios medios.
Agrupa los que cuentan EXACTAMENTE el mismo hecho (mismo sitio, mismo día, mismos protagonistas: dos accidentes en
pueblos distintos son hechos distintos). Solo grupos con al menos 2 medios DISTINTOS (el mismo medio dos veces no cuenta).
Descarta: política (partidos, elecciones, parlamento, gobierno como debate político), opinión, columnas,
entrevistas, programas de radio, publicidad de empresas, esquelas, y noticias que no sean de Navarra.
Ordena por interés para la gente de Navarra. Máximo 10 grupos.
Responde SOLO con JSON: [{"ids":[n,n,...],"tema":"resumen de 6-10 palabras","cat":"Navarra|Deportes|El tiempo|Sucesos|Cultura|Economía"}]"""

SIS_NOTICIA = """Eres periodista de BasatiNA, una app sin ánimo de lucro de Navarra. Escribe una noticia breve y PROPIA
con los hechos que cuentan varios medios. Reglas obligatorias:
- Escribe con tus palabras y con tu propio orden. Prohibido copiar frases o trozos de frases de los medios: no
  repitas más de 5 palabras seguidas de ningún texto. Resume: no hace falta contar todos los detalles.
- Solo hechos que digan las fuentes. Nada inventado ni supuesto. Si un dato solo lo da un medio, di «según X».
- Compara los datos entre medios (lugar, pueblo, cifras, edades, horas, fechas, resultados). Si NO coinciden,
  no elijas uno: apúntalo en "dudas".
- Datos personales: NUNCA nombres ni apellidos de particulares (víctimas, heridos, detenidos, vecinos), ni edad
  junto al pueblo de una víctima. Personas públicas (deportistas, cargos, artistas) sí, con su nombre.
- Sin política ni opiniones. Tono neutro, claro, para todo el mundo.
- 3 a 5 frases. Titular de máximo 90 caracteres, sin clickbait.
Responde SOLO con JSON:
{"titulo":"…","texto":"…","pueblo":"…","cat":"…","datos":[{"dato":"…","coinciden":true}],"dudas":["…"],"personales":false,"apta":true}
"apta": false si no hay hechos suficientes o el tema no encaja (política, opinión, publicidad)."""


SIS_ARREGLO = """Eres el editor jefe de BasatiNA, una app sin ánimo de lucro de Navarra. Te paso un BORRADOR de noticia
escrito por otra IA, sus dudas, los textos de los medios y los titulares que BasatiNA ya ha publicado en las últimas 48 h.
Tu trabajo: dejarla lista para publicar SIN revisión humana, o decir que no se puede. Nunca inventes nada.
- Dato que no coincide entre medios: quítalo o déjalo en general («varias personas», «esta semana», «cerca de»).
  Si ese dato es el centro de la noticia y sin él no se entiende, "publicable": false.
- Frases copiadas: ningún trozo de más de 5 palabras seguidas igual que un medio. Reescribe con tus palabras.
- Si cuenta el MISMO hecho que una de las ya publicadas, pon su id en "repetida".
- "publicable": false si es de sucesos (accidentes, heridos, fallecidos, detenciones, robos, incendios, rescates,
  desaparecidos, juicios, agresiones), si lleva nombres o datos de particulares, si es política u opinión,
  o si te queda cualquier duda.
- Estilo: neutro, 3 a 5 frases, titular de máximo 90 caracteres, «según X» si un dato solo lo da un medio.
Responde SOLO con JSON:
{"titulo":"…","texto":"…","quedan_dudas":["…"],"repetida":null,"publicable":true,"motivo":"si no es publicable, por qué, en pocas palabras"}"""


def bloqueo(it):
    """Motivos para NO publicar sola, antes de gastar IA."""
    if (it.get("cat") or "") == "Sucesos": return "sucesos"
    if len({f.get("f") for f in it.get("fuentes", [])}) < 2: return "menos de 2 medios"
    if any("datos personales" in (d or "").lower() for d in it.get("dudas", [])): return "datos personales"
    if SUCESOS.search(nrm(it.get("titulo", "") + " " + it.get("texto", ""))): return "parece de sucesos"
    return ""


def auto_publicar(B, ahora):
    """Arregla y publica solas las noticias seguras. Devuelve cuántas ha publicado."""
    if not AUTO: print("Publicación sola apagada (IA_AUTO=0)"); return 0
    ah = ahora.strftime("%Y-%m-%dT%H:%MZ")
    try: P = json.load(open(PUB, encoding="utf-8"))
    except Exception: P = {"items": []}
    P.setdefault("items", [])
    hace48 = (ahora - datetime.timedelta(hours=48)).strftime("%Y-%m-%dT%H:%MZ")
    recientes = [x for x in P["items"] if x.get("pub", "") >= hace48]
    hechas = intentos = 0
    for it in B["items"]:
        if intentos >= MAX_AUTO: break
        if it.get("estado") not in ("borrador", "duda") or it.get("auto_intento"): continue
        it["auto_intento"] = ah
        m = bloqueo(it)
        if m: it["auto_motivo"] = m; print("  ✋", m, "·", it["titulo"]); continue
        leidos = [(f, texto_de(f["u"])) for f in it.get("fuentes", []) if f.get("f") in LEER]
        leidos = [(f, t) for f, t in leidos if len(t) > 200]
        if not leidos: it["auto_motivo"] = "sin texto para comprobar"; continue
        intentos += 1
        fuentes_txt = "\n\n".join(f"### {f['f']} — {f.get('t','')}\n{t}" for f, t in leidos)
        otros = "\n".join(f"- {f['f']}: {f.get('t','')}" for f in it["fuentes"] if f.get("f") not in LEER)
        datos = "\n".join(f"- {'OK' if d.get('coinciden', True) else 'NO COINCIDE'}: {d.get('dato','')}" for d in it.get("datos", []))
        pub = "\n".join(f"- id={x.get('id')}: {x.get('titulo')}" for x in recientes) or "(ninguno)"
        msg = (f"BORRADOR\nTitular: {it['titulo']}\nTexto: {it['texto']}\nCategoría: {it.get('cat','')}\n"
               f"Dudas: {'; '.join(it.get('dudas', [])) or '(ninguna)'}\nDatos comparados:\n{datos or '(ninguno)'}\n\n"
               f"TEXTOS DE LOS MEDIOS:\n{fuentes_txt}\n\nOTROS MEDIOS (solo titular):\n{otros or '(ninguno)'}\n\n"
               f"YA PUBLICADAS (48 h):\n{pub}")
        try:
            R = json_de(llamar(SIS_ARREGLO, msg, 900))
        except IAError as e:
            avisar_error(e)
            if str(e) in ("sin_saldo", "clave_mala"): break
            continue
        if not isinstance(R, dict): continue
        rep = R.get("repetida")
        if rep and any(str(x.get("id")) == str(rep) for x in recientes):
            it["estado"] = "descartada"; it["auto_motivo"] = f"repetida ({rep})"; print("  ♻️ repetida ·", it["titulo"]); continue
        t, x = (R.get("titulo") or "").strip()[:120], (R.get("texto") or "").strip()[:1500]
        quedan = [d for d in R.get("quedan_dudas", []) if d]
        motivo = ""
        if not R.get("publicable") or not t or not x: motivo = R.get("motivo") or "la IA no la ve publicable"
        elif quedan: motivo = "quedan dudas"
        elif tejas(x) & set().union(*(tejas(tt) for _, tt in leidos)): motivo = "sigue copiando frases"
        elif SUCESOS.search(nrm(t + " " + x)): motivo = "parece de sucesos"
        if motivo:
            it["auto_motivo"] = motivo
            if quedan: it["dudas"] = list(dict.fromkeys(it.get("dudas", []) + quedan))[:10]
            print("  ✋", motivo, "·", it["titulo"]); continue
        it.update({"titulo": t, "texto": x, "estado": "publicada", "pub": ah, "auto": True, "dudas": []})
        P["items"] = [y for y in P["items"] if y.get("id") != it["id"]]
        nueva = {"id": it["id"], "pub": ah, "titulo": t, "texto": x, "pueblo": it.get("pueblo", ""), "cat": it.get("cat", ""),
                 "fuentes": [{"f": f["f"], "u": f["u"]} for f in it["fuentes"]], "auto": True}
        P["items"].insert(0, nueva); recientes.append(nueva); hechas += 1
        print("  ✅ publicada sola ·", t)
    if hechas:
        P["items"] = P["items"][:40]; P["t"] = ah
        json.dump(P, open(PUB, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return hechas


def migrar():
    """Una sola vez: pasa los borradores del archivo público antiguo al privado y borra el público."""
    if not os.path.exists(VIEJO): return
    try: V = json.load(open(VIEJO, encoding="utf-8")).get("items", [])
    except Exception: V = []
    try: B = json.load(open(ARCH, encoding="utf-8"))
    except Exception: B = {"items": []}
    ids = {x.get("id") for x in B.get("items", [])}
    B["items"] = B.get("items", []) + [x for x in V if x.get("id") not in ids]
    os.makedirs(os.path.dirname(ARCH) or ".", exist_ok=True)
    json.dump(B, open(ARCH, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    os.remove(VIEJO)
    print(f"Migrados {len(V)} borradores al repositorio privado; borrado {VIEJO}")


def main():
    migrar()
    ahora = datetime.datetime.now(datetime.timezone.utc)
    try: N = json.load(open("noticias/noticias.json", encoding="utf-8"))
    except Exception: print("Sin noticias.json"); return
    try: B = json.load(open(ARCH, encoding="utf-8"))
    except Exception: B = {"items": []}
    lim = (ahora - datetime.timedelta(days=DIAS)).strftime("%Y-%m-%dT%H:%MZ")
    B["items"] = [x for x in B.get("items", []) if x.get("creada", "") >= lim]
    usadas = {f["u"] for x in B["items"] for f in x.get("fuentes", [])}
    hace24 = (ahora - datetime.timedelta(hours=24)).strftime("%Y-%m-%dT%H:%MZ")
    L = [x for x in N.get("items", []) if x.get("d", "") >= hace24 and x.get("u") not in usadas]
    if len(L) < 2:
        print("Pocos titulares nuevos"); L = []
    G = []
    lista = "\n".join(f"{i}. [{x['f']}] {x['t']}" for i, x in enumerate(L))
    try:
        if L: G = json_de(llamar(SIS_GRUPOS, lista, 1500))
    except IAError as e:
        avisar_error(e); return
    nuevas, dudas = 0, 0
    for g in G if isinstance(G, list) else []:
        if nuevas >= MAX_NUEVAS: break
        xs = [L[i] for i in g.get("ids", []) if isinstance(i, int) and 0 <= i < len(L)]
        medios = {x["f"] for x in xs}
        if len(medios) < 2: continue
        leidos = []
        for x in xs:
            if x["f"] in LEER:
                t = texto_de(x["u"])
                if len(t) > 200: leidos.append((x, t))
        if not leidos:
            print("  sin texto legible:", g.get("tema")); continue
        fuentes_txt = "\n\n".join(f"### {x['f']} — {x['t']}\n{t}" for x, t in leidos)
        otros = "\n".join(f"- {x['f']}: {x['t']}" for x in xs if x["f"] not in LEER)
        msg = f"Tema: {g.get('tema','')}\n\nTEXTOS DE LOS MEDIOS:\n{fuentes_txt}\n\nOTROS MEDIOS (solo titular):\n{otros or '(ninguno)'}"
        try:
            R = json_de(llamar(SIS_NOTICIA, msg, 900))
        except IAError as e:
            avisar_error(e)
            if str(e) in ("sin_saldo", "clave_mala"): break
            continue
        if not R.get("apta", True) or not R.get("titulo") or not R.get("texto"): continue
        du = [d for d in R.get("dudas", []) if d]
        # ¿copia frases? (8 palabras seguidas iguales que algún medio). Si copia, se le pide UNA vez que lo reescriba.
        fuente_tejas = set().union(*(tejas(t) for _, t in leidos))
        iguales = tejas(R["texto"]) & fuente_tejas
        if iguales:
            try:
                R2 = json_de(llamar(SIS_NOTICIA, msg + "\n\nTU VERSIÓN ANTERIOR COPIABA ESTOS TROZOS LITERALES DE LOS MEDIOS. "
                                    "Reescribe la noticia entera con otras palabras y otro orden, sin repetir ninguno:\n- " + "\n- ".join(sorted(iguales)[:12]), 900))
                if R2.get("titulo") and R2.get("texto"): R = R2; du = [d for d in R.get("dudas", []) if d]
            except IAError as e:
                avisar_error(e)
            iguales = tejas(R["texto"]) & fuente_tejas
        if iguales: du.append("Alguna frase se parece mucho a la de un medio: reescribir antes de publicar.")
        if R.get("personales"): du.append("Puede llevar datos personales: revisar.")
        cat = R.get("cat") or g.get("cat") or "Navarra"
        if cat == "Sucesos": du.append("Sucesos: revisar siempre a mano.")
        k = hashlib.sha1("|".join(sorted(x["u"] for x in xs)).encode()).hexdigest()[:12]
        B["items"].insert(0, {"id": k, "creada": ahora.strftime("%Y-%m-%dT%H:%MZ"), "estado": "duda" if du else "borrador",
                              "titulo": R["titulo"][:120], "texto": R["texto"][:1500], "pueblo": R.get("pueblo", ""), "cat": cat,
                              "fuentes": [{"f": x["f"], "u": x["u"], "t": x["t"]} for x in xs], "leidas": [x["f"] for x, _ in leidos],
                              "datos": R.get("datos", [])[:12], "dudas": du})
        nuevas += 1; dudas += bool(du)
        print("  +", "DUDA" if du else "ok", R["titulo"])
    solas = auto_publicar(B, ahora)
    B["t"] = ahora.strftime("%Y-%m-%dT%H:%MZ")
    os.makedirs(os.path.dirname(ARCH) or ".", exist_ok=True)
    json.dump(B, open(ARCH, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    pend = sum(1 for x in B["items"] if x["estado"] in ("borrador", "duda"))
    hoy_pend = sum(1 for x in B["items"] if x["estado"] in ("borrador", "duda") and x.get("creada") == B["t"])
    print(f"Nuevas: {nuevas} · con dudas: {dudas} · publicadas solas: {solas} · pendientes de revisar: {pend}")
    if hoy_pend:
        avisar("🤖 IA: hay noticias con dudas para revisar",
               f"Hay {hoy_pend} noticia(s) nueva(s) que la IA no ha publicado sola ({pend} pendientes en total). "
               f"Revísalas en la app: Noticias → Borradores de la IA (modo Administrador).")


if __name__ == "__main__":
    main()
