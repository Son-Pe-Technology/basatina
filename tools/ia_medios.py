"""
🔎 ¿Qué medios dejan que sus textos se lean con programas (minería de textos, art. 67 bis LPI)?
Solo lectura: mira robots.txt, /.well-known/tdmrep.json, la cabecera «tdm-reservation» y las etiquetas <meta>
de la portada de cada medio de tools/noticias.py, y de dos fuentes oficiales (BON y Gobierno de Navarra).
No lee ninguna noticia. Resultado: tools/ia_medios.txt. Lo ejecuta .github/workflows/iamedios.yml (rama ia-*).
"""
import re, json, urllib.request, urllib.parse, importlib.util, sys, io, contextlib
UA = {"User-Agent": "Mozilla/5.0 (BasatiNA/1.0; +https://basatina.es)"}
src = open("tools/noticias.py", encoding="utf-8").read()
MEDIOS = eval(re.search(r"^MEDIOS = (\[.*?^\])", src, re.S | re.M).group(1))
EXTRA = [("BON (Boletín Oficial de Navarra)", "https://bon.navarra.es/es/", "bon.navarra.es", ""),
         ("Gobierno de Navarra (notas de prensa)", "https://www.navarra.es/es/noticias", "navarra.es", "")]
BOTS = ["GPTBot", "ChatGPT-User", "ClaudeBot", "anthropic-ai", "Claude-Web", "CCBot", "Google-Extended", "PerplexityBot", "Bytespider", "*"]
def get(u, t=20):
    r = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=t)
    return r.status, dict(r.headers), r.read(400000).decode("utf-8", "replace")
def robots(txt):
    grupos, cur, out = [], None, {}
    for ln in txt.splitlines():
        ln = ln.split("#")[0].strip()
        if not ln or ":" not in ln: continue
        k, v = [x.strip() for x in ln.split(":", 1)]
        k = k.lower()
        if k == "user-agent":
            if cur is None or cur["reglas"]: cur = {"ua": [], "reglas": []}; grupos.append(cur)
            cur["ua"].append(v)
        elif k in ("disallow", "allow") and cur is not None: cur["reglas"].append((k, v))
    for b in BOTS:
        g = [x for x in grupos if any(u.lower() == b.lower() for u in x["ua"])]
        if not g: continue
        dis = [v for k, v in g[0]["reglas"] if k == "disallow"]
        out[b] = "TODO PROHIBIDO" if "/" in dis else ("algo prohibido" if any(dis) else "permitido")
    return out
L = []
for nombre, web, dom, _ in MEDIOS + EXTRA:
    p = urllib.parse.urlparse(web); base = f"{p.scheme}://{p.netloc}"
    r = {"medio": nombre}
    try: s, h, t = get(base + "/robots.txt"); r["robots"] = robots(t); r["robots_tdm"] = bool(re.search(r"tdm|text and data|minería", t, re.I))
    except Exception as e: r["robots"] = f"error {e}"
    try: s, h, t = get(base + "/.well-known/tdmrep.json"); r["tdmrep"] = t[:300] if s == 200 and t.strip().startswith(("[", "{")) else "no"
    except Exception as e: r["tdmrep"] = "no"
    try:
        s, h, t = get(web)
        r["cabecera_tdm"] = {k: v for k, v in h.items() if "tdm" in k.lower()} or "no"
        r["meta"] = re.findall(r'<meta[^>]+(?:tdm-|robots)[^>]*>', t, re.I)[:5]
        r["aviso_legal"] = sorted(set(re.findall(r'href=["\']([^"\']*(?:aviso-legal|legal|condiciones|terminos)[^"\']*)', t, re.I)))[:4]
    except Exception as e: r["portada"] = f"error {e}"
    L.append(r); print(json.dumps(r, ensure_ascii=False))
open("tools/ia_medios.txt", "w", encoding="utf-8").write("\n".join(json.dumps(x, ensure_ascii=False, indent=1) for x in L))
