"""Busca fotos con licencia libre en Wikimedia Commons y guarda candidatas para elegir a mano.
Solo licencias que permiten usarlas en la app: dominio público, CC0, CC BY y CC BY-SA (con autor)."""
import json, os, re, time, urllib.parse, urllib.request
UA = {'User-Agent': 'BasatiNA/1.0 (https://basatina.es; participa@basatina.es)'}
API = 'https://commons.wikimedia.org/w/api.php'
OK = re.compile(r'^(CC0|Public domain|PD|CC BY(-SA)? \d)', re.I)
BUSCA = {
 'in_otono':     ['Selva de Irati otoño', 'Irati forest autumn', 'hayedo otoño Navarra', 'Bosque de Irati'],
 'in_invierno':  ['Belagua nieve', 'Valle de Belagua invierno', 'Larra Belagua snow', 'Pirineo navarro nieve'],
 'in_primavera': ['Sierra de Urbasa', 'Urbasa prado', 'Valle de Baztán', 'Baztan landscape'],
 'in_verano':    ['Bardenas Reales', 'Castildetierra', 'Foz de Arbayún', 'Valle de Roncal'],
 'in_tiempo':    ['Pamplona nubes', 'Navarra cielo nubes', 'Pamplona skyline clouds', 'tormenta Navarra'],
 'in_carreteras':['Puerto de Belate', 'carretera Navarra montaña', 'Puerto de Lizarraga', 'carretera Bardenas'],
 'in_cerca':     ['Olite castillo pueblo', 'Puente la Reina', 'Estella Lizarra', 'Ujué'],
 'in_pie':       ['senderismo Navarra', 'Mesa de los Tres Reyes', 'Orhi mendia', 'Pirineo navarro sendero'],
 'in_deporte':   ['frontón Navarra pelota', 'pelota vasca frontón', 'Frontón Labrit', 'El Sadar estadio'],
 'in_agenda':    ['Sanfermines', 'San Fermín Pamplona fiesta', 'gigantes Pamplona', 'Olite fiestas medievales'],
 'in_recol':     ['setas hayedo', 'Boletus edulis', 'boletus forest', 'mushrooms beech forest'],
 'in_arga':      ['río Arga Pamplona', 'Arga river Pamplona', 'Puente de la Magdalena Pamplona', 'Arga Puente la Reina'],
 'in_ega':       ['río Ega Estella', 'Ega river Estella', 'Puente de la Cárcel Estella', 'Nacedero del Urederra'],
 'in_aragon':    ['río Aragón Sangüesa', 'Aragon river Navarra', 'río Aragón Caparroso', 'Sangüesa puente'],
 'in_ebro':      ['río Ebro Tudela', 'Ebro Tudela puente', 'Ebro river Tudela', 'río Ebro Navarra'],
 'in_irati':     ['río Irati Aoiz', 'Irati river', 'Foz de Lumbier', 'río Irati'],
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
