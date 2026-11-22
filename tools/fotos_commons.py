"""Busca fotos con licencia libre en Wikimedia Commons y guarda candidatas para elegir a mano.
Solo licencias que permiten usarlas en la app: dominio público, CC0, CC BY y CC BY-SA (con autor)."""
import json, os, re, time, urllib.parse, urllib.request
UA = {'User-Agent': 'BasatiNA/1.0 (https://basatina.es; participa@basatina.es)'}
API = 'https://commons.wikimedia.org/w/api.php'
OK = re.compile(r'^(CC0|Public domain|PD|CC BY(-SA)? \d)', re.I)
BUSCA = {
 'en_eolico':   ['parque eólico Navarra', 'Sierra del Perdón aerogeneradores', 'aerogeneradores Navarra', 'Alaiz parque eólico', 'wind farm Navarre'],
}
def get(params):
    u = API + '?' + urllib.parse.urlencode(dict(params, format='json'))
    with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30) as r: return json.load(r)
def limpia(h): return re.sub(r'<[^>]+>', '', h or '').strip()
os.makedirs('fotos/candidatas', exist_ok=True)
info = {}
for slot, qs in BUSCA.items():
    vistos, n = set(), 0
    for q in qs:
        try:
            j = get({'action': 'query', 'generator': 'search', 'gsrsearch': 'filetype:bitmap ' + q, 'gsrnamespace': 6,
                     'gsrlimit': 12, 'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size', 'iiurlwidth': 900})
        except Exception as e: print('fallo', q, e); continue
        for p in sorted(j.get('query', {}).get('pages', {}).values(), key=lambda p: p.get('index', 99)):
            if n >= 6 or p['title'] in vistos: continue
            ii = (p.get('imageinfo') or [{}])[0]; m = ii.get('extmetadata', {})
            lic = limpia(m.get('LicenseShortName', {}).get('value'))
            if not OK.match(lic) or ii.get('width', 0) < 1200 or ii.get('width', 0) < ii.get('height', 1): continue
            vistos.add(p['title']); n += 1
            nom = f'{slot}_{n}.jpg'
            try:
                with urllib.request.urlopen(urllib.request.Request(ii['thumburl'], headers=UA), timeout=60) as r: open('fotos/candidatas/' + nom, 'wb').write(r.read())
            except Exception as e: print('fallo bajar', p['title'], e); n -= 1; continue
            info[nom] = {'titulo': p['title'], 'autor': limpia(m.get('Artist', {}).get('value'))[:120], 'licencia': lic,
                         'pagina': ii.get('descriptionurl'), 'busqueda': q}
            time.sleep(1)
    print(slot, n)
prev = json.load(open('fotos/candidatas/candidatas.json')) if os.path.exists('fotos/candidatas/candidatas.json') else {}
prev.update(info); info = prev
json.dump(info, open('fotos/candidatas/candidatas.json', 'w'), ensure_ascii=False, indent=1)
