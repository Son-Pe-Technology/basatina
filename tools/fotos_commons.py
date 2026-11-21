"""Busca fotos con licencia libre en Wikimedia Commons y guarda candidatas para elegir a mano.
Solo licencias que permiten usarlas en la app: dominio público, CC0, CC BY y CC BY-SA (con autor)."""
import json, os, re, time, urllib.parse, urllib.request
UA = {'User-Agent': 'BasatiNA/1.0 (https://basatina.es; participa@basatina.es)'}
API = 'https://commons.wikimedia.org/w/api.php'
OK = re.compile(r'^(CC0|Public domain|PD|CC BY(-SA)? \d)', re.I)
BUSCA = {
 't2_padel':      ['pádel Pamplona', 'padel court Spain', 'pista de pádel'],
 't2_rural':      ['aizkolari', 'harri jasotzaile', 'herri kirolak', 'deporte rural vasco'],
 't2_peques':     ['Senda Viva Arguedas', 'parque infantil Pamplona', 'Parque de la Taconera'],
 't2_pqparques':  ['Parque de la Taconera Pamplona', 'Parque Yamaguchi Pamplona', 'Parque de la Media Luna Pamplona'],
 't2_pqpaseos':   ['Paseo del Arga Pamplona', 'Parque fluvial Arga', 'río Arga Pamplona'],
 't2_pqagenda':   ['Olentzero Pamplona', 'cabezudos Pamplona', 'kilikis Pamplona'],
 't2_mascotas':   ['perro monte Navarra', 'pastor vasco perro', 'euskal artzain txakurra'],
 't2_volunt':     ['voluntarios limpieza río', 'Banco de Alimentos Navarra', 'voluntariado medio ambiente'],
 't2_empleo':     ['Sarriguren Ciudad de la Innovación', 'Polígono Landaben', 'Pamplona Ensanche edificios'],
 't2_vivienda':   ['Pamplona Ensanche', 'Casco Viejo Pamplona calle', 'Pamplona barrio viviendas'],
 't2_pedalea':    ['Vía verde del Plazaola', 'Vía verde del Bidasoa', 'ciclistas Navarra carretera'],
 't2_moto':       ['puerto de Larrau', 'carretera Navarra montaña', 'Foz de Lumbier carretera', 'Puerto de Belagua'],
 't2_picnic':     ['embalse de Leurtza', 'área recreativa Navarra', 'Urbasa pradera', 'Nacedero del Urederra'],
 't2_temporada':  ['huerta Tudela', 'alcachofas Tudela', 'Ribera Navarra huerta', 'Tudela verduras'],
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
