import re, html, urllib.request, urllib.parse, sys
UA={"User-Agent":"Mozilla/5.0 (BasatiNA/1.0; +https://basatina.es)"}
def get(u):
    r=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=20)
    return r.read().decode(r.headers.get_content_charset() or "utf-8","replace")
PAG=["https://www.europapress.es/curiosidades/","https://www.20minutos.es/viral/","https://www.lavanguardia.com/vida/curiosidades",
"https://www.lavanguardia.com/andro4all","https://www.abc.es/viral/","https://www.larazon.es/viral/","https://www.antena3.com/noticias/sociedad/",
"https://www.lasexta.com/noticias/viral/","https://www.huffingtonpost.es/tendencias/","https://www.elconfidencial.com/alma-corazon-vida/",
"https://www.publico.es/tremending/","https://www.cope.es/actualidad/sociedad/","https://cadenaser.com/tag/curiosidades/","https://www.telecinco.es/noticias/sociedad/",
"https://www.eldiario.es/","https://www.elespanol.com/curiosidades/","https://www.diariodenavarra.es/","https://www.lavozdegalicia.es/","https://www.elperiodico.com/es/curiosidades/",
"https://www.heraldo.es/noticias/curiosidades/","https://www.elcorreo.com/","https://www.rtve.es/noticias/sociedad/","https://www.niusdiario.es/sociedad/curiosidades/","https://www.cuatro.com/noticias/"]
FEED=["https://www.europapress.es/rss/rss.aspx?ch=00668","https://www.europapress.es/rss/rss.aspx?ch=668","https://www.20minutos.es/rss/viral/","https://www.20minutos.es/rss/",
"https://www.larazon.es/arc/outboundfeeds/rss/category/viral/?outputType=xml","https://www.huffingtonpost.es/feeds/index.xml","https://rss.elconfidencial.com/alma-corazon-vida/",
"https://www.publico.es/rss/tremending","https://www.lavanguardia.com/rss/vida.xml","https://www.abc.es/rss/2.0/sociedad/","https://www.abc.es/rss/feeds/abc_Viral.xml",
"https://www.elperiodico.com/es/rss/curiosidades/rss.xml","https://www.heraldo.es/rss/curiosidades/","https://www.elespanol.com/rss/curiosidades/","https://www.cope.es/rss/actualidad/sociedad.xml",
"https://cadenaser.com/arc/outboundfeeds/rss/?outputType=xml","https://www.rtve.es/api/tematicas/1048/noticias.rss","https://www.lasexta.com/rss/351410.xml","https://www.antena3.com/noticias/rss/4013050.xml"]
def rss(h,base):
    L=[]
    for m in re.finditer(r"<link[^>]+>",h,re.I):
        t=m.group(0)
        if re.search(r"rss\+xml|atom\+xml",t,re.I):
            u=re.search(r'href=["\']([^"\']+)',t)
            if u:L.append(urllib.parse.urljoin(base,html.unescape(u.group(1))))
    return L
def cuenta(u):
    try:
        x=get(u);its=re.findall(r"<(?:item|entry)\b.*?</(?:item|entry)>",x,re.S|re.I)
        tit=[html.unescape(re.sub(r"<!\[CDATA\[|\]\]>|<[^>]+>","",(re.search(r"<title[^>]*>(.*?)</title>",i,re.S) or [0,""])[1])).strip() for i in its[:4]]
        lk=[(re.search(r"<link>(.*?)</link>",i,re.S) or [0,""])[1].strip()[:90] for i in its[:2]]
        print("   FEED",len(its),u);[print("      ·",t[:100]) for t in tit];[print("      >",l) for l in lk]
    except Exception as e: print("   FEED ERR",u,e)
print("== FEEDS directos");[cuenta(u) for u in FEED]
print("== PAGINAS")
for p in PAG:
    try:
        L=rss(get(p),p);print("PAG",p,len(L));[cuenta(u) for u in L[:4]]
    except Exception as e: print("PAG ERR",p,e)
