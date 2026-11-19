"""Prueba temporal: qué canales RSS de noticias curiosas responden desde GitHub Actions."""
import json, urllib.request, re, html, sys
UA = {"User-Agent": "Mozilla/5.0 (BasatiNA/1.0; +https://basatina.es)"}
C = [l.strip() for l in open("tools/probar_feeds.txt") if l.strip() and not l.startswith("#")]
out = {}
for u in C:
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=20)
        x = r.read().decode(r.headers.get_content_charset() or "utf-8", "replace")
        its = re.findall(r"<(?:item|entry)\b.*?</(?:item|entry)>", x, re.S | re.I)
        T = []
        for it in its[:80]:
            m = re.search(r"<title\b[^>]*>(.*?)</title>", it, re.S | re.I)
            l = re.search(r"<link\b[^>]*>(.*?)</link>", it, re.S | re.I)
            d = re.search(r"<(pubDate|published|updated)\b[^>]*>(.*?)</", it, re.S | re.I)
            s = re.search(r'<source[^>]*url="([^"]+)"[^>]*>(.*?)</source>', it, re.S | re.I)
            cl = lambda v: html.unescape(re.sub(r"<!\[CDATA\[|\]\]>|<[^>]+>", "", v or "")).strip()
            T.append([cl(m.group(1)) if m else "", cl(l.group(1)) if l else "", d.group(2).strip() if d else "", (s.group(1) + " " + cl(s.group(2))) if s else ""])
        out[u] = {"ok": r.status, "n": len(its), "items": T}
    except Exception as e:
        out[u] = {"err": str(e)[:150]}
    print(u, out[u].get("n"), out[u].get("err"), flush=True)
json.dump(out, open("tools/probar_feeds.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
