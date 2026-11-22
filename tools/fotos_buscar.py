"""
🔎 Busca fotos candidatas en Wikimedia Commons (solo licencias libres) y descarga una copia de 1280 px
para elegir a mano la cabecera de una sección. Lo ejecuta .github/workflows/fotosbuscar.yml en la rama
fotos-candidatas-* (no toca la app). Resultado: tools/candidatas/<tema>-NN.jpg y tools/candidatas/info.json
"""
import json, re, os, urllib.parse, urllib.request, html
UA = {"User-Agent": "BasatiNA/1.0 (https://basatina.es; participa@basatina.es)"}
LIBRES = re.compile(r"^(cc0|public domain|pd|cc by(-sa)? ?[0-9.]*( [a-z]+)?|cc-by(-sa)?-[0-9.]+)", re.I)
BUSCA = {
  "cine": ["cine Pamplona", "Golem cines", "sala de cine butacas", "cinema seats auditorium", "cine Navarra", "movie theater screen"],
  "peques": ["parque infantil Pamplona", "parque infantil Navarra", "playground Pamplona", "children playground slide", "niños jugando parque", "Taconera Pamplona niños"],
}
def api(p):
    u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(dict(p, format="json"))
    with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60) as r: return json.load(r)
def limpio(s): return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", s or ""))).strip()
os.makedirs("tools/candidatas", exist_ok=True)
info = {}
for tema, qs in BUSCA.items():
    vistos, n = set(), 0
    for q in qs:
        if n >= 14: break
        try:
            d = api({"action": "query", "generator": "search", "gsrsearch": q + " filetype:bitmap", "gsrnamespace": 6, "gsrlimit": 12,
                     "prop": "imageinfo", "iiprop": "url|extmetadata|size", "iiurlwidth": 1280})
        except Exception as e:
            print("error", q, e); continue
        for p in sorted((d.get("query") or {}).get("pages", {}).values(), key=lambda x: x.get("index", 0)):
            t = p["title"]
            if t in vistos or n >= 14: continue
            vistos.add(t)
            ii = (p.get("imageinfo") or [{}])[0]; m = ii.get("extmetadata", {})
            lic = limpio((m.get("LicenseShortName") or {}).get("value"))
            if not LIBRES.match(lic) or ii.get("width", 0) < 900 or ii.get("width", 0) < ii.get("height", 1): continue
            n += 1; f = f"tools/candidatas/{tema}-{n:02d}.jpg"
            try:
                with urllib.request.urlopen(urllib.request.Request(ii["thumburl"], headers=UA), timeout=60) as r: open(f, "wb").write(r.read())
            except Exception as e:
                print("no baja", t, e); n -= 1; continue
            info[os.path.basename(f)] = {"titulo": t, "autor": limpio((m.get("Artist") or {}).get("value")), "licencia": lic,
                                         "url": "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(t.replace(" ", "_")), "busqueda": q}
            print(f, t, lic)
json.dump(info, open("tools/candidatas/info.json", "w"), ensure_ascii=False, indent=1)
