/* =====================================================================
   🤝 VOLUNTARIADO EN NAVARRA (20 nov. 2026) — se carga después de padel-ui.js
   Pantalla `voluntariado` (grupo «Servicios»): dónde ayudar a personas, animales y al medio ambiente.
   - Arriba: «Por dónde empezar» (Navarra+Voluntaria, Plaza On…) y filtros por tema.
   - Lista VO_L: entidades y programas reales de Navarra (buscados el 20 nov. 2026).
     Para añadir uno: una línea más en VO_L →
       {n:'Nombre', c:['temas'], z:'Zona', d:'Qué hacen', q:'Qué puedes hacer tú', w:'web', t:'teléfono', m:'correo'}
     Temas (VO_T): inicio, mayores, disca, infancia, pobreza, salud, migra, animales, ambiente, emerg, camino, jovenes.
     Si no hay web comprobada, no se pone `w`: sale el botón «🔎 Buscar» (busca su nombre en internet).
   - Abajo: actividades de voluntariado de la Agenda cultural (palabras VO_KW en agenda/cultura.json).
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const E=s=>(typeof esc==='function'?esc(s):String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
const abre=u=>{if(window.amAbre)amAbre(u);else window.open(u,'_blank');};
const nrm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const nuevo=(t,g,l,sc,ic,fam)=>{try{window.amNuevo(t,g,l,sc,ic,fam);}catch(e){}};
const hook=(t,fn)=>{if(window.svHook)svHook(t,fn);};

const VO_T=[['todo','✨ Todo'],['inicio','🧭 Por dónde empezar'],['mayores','👵 Personas mayores'],['disca','♿ Discapacidad'],['infancia','🧒 Infancia y familias'],
  ['pobreza','🍲 Alimentos y exclusión'],['salud','🏥 Salud y hospital'],['migra','🌍 Personas migrantes'],['animales','🐾 Animales'],['ambiente','🌳 Medio ambiente'],
  ['emerg','🚑 Emergencias'],['camino','🐚 Camino de Santiago'],['jovenes','🎒 Para jóvenes']];

const VO_L=[
 // ---------- por dónde empezar ----------
 {n:'Navarra+Voluntaria · Nafarroa, Orotan Lagun',c:['inicio','ambiente','mayores','disca','animales'],z:'Toda Navarra',
  d:'La plataforma de voluntariado del Gobierno de Navarra. Tiene un buscador de acciones de voluntariado y un mapa con más de 260 entidades por localidades.',
  q:'Apúntate gratis, di qué te gusta y cuánto tiempo tienes, y te ponen en contacto con la entidad. También organiza el voluntariado ambiental.',
  w:'https://navarramasvoluntaria.navarra.es',t:'848 420 799',m:'navarramasvoluntaria@navarra.es'},
 {n:'Plaza On · Red de voluntariado de Pamplona',c:['inicio','mayores','animales','ambiente'],z:'Pamplona',
  d:'La red municipal de voluntariado de Pamplona, en el Palacio del Condestable (calle Mayor, 2).',
  q:'Paseos y compañía a personas mayores que están solas, apoyo a la lectura en colegios, limpieza de ríos, plantaciones y ayuda en el Centro de Atención de Animales.',
  t:'948 420 493',m:'plazaon@pamplona.es'},
 {n:'Tantaka · Universidad de Navarra',c:['inicio','disca','pobreza','migra'],z:'Pamplona',
  d:'El banco de tiempo solidario de la Universidad de Navarra: reúne voluntariados «de cercanía» con muchas entidades.',
  q:'Ocio con personas con discapacidad, clases de castellano, reparto de alimentos, campañas… Pensado sobre todo para estudiantes y gente de la universidad.',
  w:'https://www.unav.edu/web/tantaka'},
 // ---------- personas mayores ----------
 {n:'Cruz Roja Navarra · Espacio Activo',c:['mayores','pobreza','emerg','salud'],z:'Pamplona (calle Aralar, 2) y toda Navarra',
  d:'El espacio de Cruz Roja para personas mayores y quienes las cuidan. Cruz Roja tiene además asambleas en muchos pueblos (Tudela, Estella…).',
  q:'Acompañar a personas mayores que viven solas, ir con ellas a la compra o al médico, talleres de memoria y apoyo a personas cuidadoras.',
  w:'https://www.cruzroja.es'},
 {n:'Siempre Acompañados (Pamplona)',c:['mayores'],z:'Pamplona: San Juan, Txantrea, Iturrama, Ensanche, Azpilagaña, Ermitagaña‑Mendebaldea',
  d:'Programa contra la soledad no deseada de personas mayores de 60 años, con el Ayuntamiento, Fundación «la Caixa» y Fundación Caja Navarra.',
  q:'Crear lazos de apoyo con personas mayores de tu barrio. Pregunta en tu unidad de barrio o en Plaza On.'},
 {n:'Teléfono de la Esperanza de Navarra',c:['mayores','salud'],z:'Pamplona (Rochapea)',
  d:'Ayuda emocional y prevención del suicidio. Funciona gracias a más de cien personas voluntarias.',
  q:'Escucha por teléfono y acompañamiento. Para empezar hace falta una formación de alrededor de un año (la dan ellos).',
  w:'https://www.telefonodelaesperanza.org'},
 // ---------- discapacidad ----------
 {n:'ANFAS · Discapacidad intelectual',c:['disca'],z:'Toda Navarra',
  d:'Asociación navarra en favor de las personas con discapacidad intelectual o del desarrollo y sus familias (desde 1961).',
  q:'Ocio y tiempo libre, salidas, deporte, campamentos y vacaciones de verano.'},
 {n:'ASPACE Navarra · Parálisis cerebral',c:['disca'],z:'Pamplona',
  d:'Atención a personas con parálisis cerebral y sus familias.',q:'Deporte adaptado, ocio y acompañamiento en campamentos de verano.'},
 {n:'Síndrome de Down Navarra',c:['disca','infancia'],z:'Pamplona',d:'Asociación de personas con síndrome de Down y sus familias.',q:'«Sábados de ocio» y actividades por la tarde.'},
 {n:'Autismo Navarra (ANA)',c:['disca','infancia'],z:'Navarra',d:'Asociación Navarra de Autismo.',q:'Apoyo en actividades como natación adaptada y ocio.'},
 {n:'ADACEN · Daño cerebral',c:['disca','salud'],z:'Pamplona',d:'Asociación de daño cerebral adquirido de Navarra.',q:'Acompañamiento y apoyo en actividades.'},
 {n:'ANPHEB · Espina bífida e hidrocefalia',c:['disca'],z:'Navarra',d:'Asociación Navarra de Espina Bífida e Hidrocefalia.',q:'Ocio y acompañamiento.'},
 {n:'COCEMFE Navarra · Discapacidad física',c:['disca'],z:'Navarra',d:'Federación de asociaciones de personas con discapacidad física y orgánica.',q:'Apoyo escolar, lectoescritura, acompañamiento y comunicación.'},
 {n:'Biak Bat Elkartea · Terapia con animales',c:['disca','animales'],z:'Alsasua / Altsasu',d:'Mejoran la calidad de vida de las personas con la ayuda de animales (intervenciones asistidas y perros de asistencia).',q:'Pregunta por sus programas.'},
 // ---------- infancia y familias ----------
 {n:'Mamás en Acción',c:['infancia','salud'],z:'Hospital Universitario de Navarra (Pamplona)',
  d:'Acompañan a niños y niñas ingresados en el hospital que no tienen a un adulto con ellos. No hace falta ser madre, ni mujer.',
  q:'Estar a pie de cama, jugar y dar cariño. Te registras en su web y te llaman a la formación.',w:'https://mamasenaccion.es'},
 {n:'ADANO · Niños con cáncer',c:['infancia','salud'],z:'Pamplona',d:'Asociación de Ayuda a Niños con Cáncer de Navarra: apoyo a los niños y a sus familias.',q:'Pregunta por su voluntariado de acompañamiento.'},
 {n:'Nuevo Futuro Navarra',c:['infancia'],z:'Navarra',d:'Hogares y apoyo para niños, niñas y jóvenes que no pueden vivir con su familia.',q:'Apoyo escolar, ocio y acompañamiento.'},
 {n:'Fundación Koine‑Aequalitas',c:['infancia','migra'],z:'Pamplona',d:'Fundación que participa en la Semana del Voluntariado de Navarra.',q:'Pregunta por sus programas.'},
 // ---------- alimentos y exclusión ----------
 {n:'Banco de Alimentos de Navarra',c:['pobreza'],z:'Toda Navarra',
  d:'Recoge y reparte alimentos a miles de personas en Navarra y lucha contra el desperdicio. Lo llevan personas voluntarias.',
  q:'Gran Recogida (en los supermercados, en primavera y otoño), almacén, clasificación y reparto. Ideal si solo tienes unas horas.',
  w:'https://www.bancoalimentosnavarra.org',t:'948 303 816'},
 {n:'Comedor Solidario Paris365',c:['pobreza','migra'],z:'Pamplona (Casco Antiguo)',
  d:'Comedor solidario y «txoko» de encuentro de la Fundación Gizakia Herritar. Unas 80 personas voluntarias en turnos.',
  q:'Servir comidas, recibir a la gente y echar una mano en el txoko (ordenadores, biblioteca).'},
 {n:'Cáritas Navarra',c:['pobreza','migra','mayores'],z:'Parroquias de toda Navarra',d:'Acogida y apoyo a personas en situación de pobreza.',q:'Acogida, apoyo escolar, ropa, empleo y acompañamiento.'},
 {n:'Gota de Leche',c:['pobreza','infancia'],z:'Pamplona',d:'Reparto de alimentos a familias.',q:'Repartir alimentos (mañanas entre semana).'},
 {n:'REMAR Navarra',c:['pobreza'],z:'Navarra',d:'Ayuda a personas en exclusión.',q:'Pregunta por sus programas.'},
 // ---------- salud ----------
 {n:'AECC Navarra · Contra el cáncer',c:['salud'],z:'Pamplona y comarcas',d:'Asociación Española Contra el Cáncer en Navarra.',q:'Acompañamiento en el hospital y en casa, mesas de cuestación y la marcha contra el cáncer.'},
 {n:'ANASAPS · Salud mental',c:['salud'],z:'Navarra',d:'Asociación Navarra para la Salud Mental.',q:'Ocio, acompañamiento y sensibilización.'},
 {n:'Asociación Navarra de Parkinson (ANAPAR)',c:['salud','mayores'],z:'Pamplona',d:'Apoyo a personas con párkinson y sus familias.',q:'Acompañamiento y actividades.'},
 {n:'Medicus Mundi Navarra',c:['salud'],z:'Pamplona',d:'Salud y cooperación internacional.',q:'Sensibilización y apoyo en la sede.'},
 // ---------- personas migrantes ----------
 {n:'Fundación CORE · Clases de castellano',c:['migra'],z:'Pamplona',d:'Formación y acogida de personas migrantes.',q:'Dar clases de castellano (mañanas).'},
 {n:'Ikaskide',c:['migra'],z:'Pamplona',d:'Clases de castellano para personas adultas.',q:'Dar clases de castellano, de mañana o de tarde.'},
 {n:'Asociación SEI',c:['migra','infancia'],z:'Pamplona',d:'Servicio Socioeducativo Intercultural.',q:'Apoyo educativo a jóvenes y familias.'},
 // ---------- animales ----------
 {n:'Centro de Atención de Animales de Pamplona',c:['animales'],z:'Pamplona (ctra. de la Universidad)',
  d:'Centro municipal que acoge perros y gatos abandonados.',q:'Pasear y socializar perros y cuidar a los gatos, a través de Plaza On.',t:'948 420 493',m:'plazaon@pamplona.es'},
 {n:'Fundación Protectora de Animales de Navarra',c:['animales'],z:'Mutilva (Aranguren)',
  d:'Protectora con refugio de perros y gatos. Abre todos los días de 11:00 a 13:30.',q:'Paseos, limpieza, socialización, casas de acogida y adopción.'},
 {n:'Galgo Leku',c:['animales'],z:'Navarra (casas de acogida)',d:'Rescatan galgos abandonados al final de la temporada de caza. No tienen refugio: funcionan con casas de acogida.',q:'Ser casa de acogida, paseos en grupo y transporte.'},
 {n:'Refugio Muskaria (gatos)',c:['animales'],z:'Navarra',d:'Rescate de gatos abandonados y cuidado de colonias felinas.',q:'Cuidar colonias, acogidas y ayuda en el refugio.'},
 {n:'Aranzadi Katuak · Katu Kaleko (gatos)',c:['animales'],z:'Pamplona (Aranzadi)',d:'Refugio y cuidado de gatos callejeros.',q:'Cuidados en el refugio y en las colonias.'},
 {n:'Egapeludos',c:['animales'],z:'Estella‑Lizarra',d:'Asociación de protección animal de Tierra Estella.',q:'Acogidas, paseos y cuidado de animales.'},
 {n:'Protectora Ribera Navarra',c:['animales'],z:'Tudela',d:'Protectora de animales de la Ribera.',q:'Paseos, acogidas y apoyo en el refugio.'},
 {n:'SOS Tudela Animal',c:['animales'],z:'Tudela',d:'Rescate y ayuda a animales abandonados o maltratados.',q:'Acogidas, rescates y adopción.'},
 {n:'Refugio Trikuharry',c:['animales'],z:'Urdax / Urdazubi',d:'Refugio con un centenar de animales rescatados (también exóticos y de granja).',q:'Pregunta cuándo puedes ir a echar una mano.'},
 {n:'Marcilla Rescate Animal',c:['animales'],z:'Marcilla',d:'Rescate de perros y gatos de la localidad y censo de colonias de gatos.',q:'Colonias felinas, acogidas y rescates.'},
 // ---------- medio ambiente ----------
 {n:'Voluntariado ambiental del Gobierno de Navarra',c:['ambiente'],z:'Toda Navarra',
  d:'Jornadas de limpieza de ríos, plantaciones, control de plantas invasoras y ciencia ciudadana, publicadas en Navarra+Voluntaria.',
  q:'Mira las jornadas abiertas y apúntate a la que te venga bien.',w:'https://navarramasvoluntaria.navarra.es'},
 {n:'Ríos y bosques de Pamplona (RUNA y plantaciones)',c:['ambiente'],z:'Pamplona: Arga, Sadar, Ezkaba, Mendillorri…',
  d:'El Ayuntamiento organiza limpiezas de los ríos Arga y Sadar y plantaciones de árboles (Bosque Olímpico, Agustinos, Ezkaba).',
  q:'Limpiar orillas, plantar y cuidar árboles. Inscripción en el 010 o en Plaza On.',t:'010'},
 {n:'Proyecto LIBERA · Basuraleza',c:['ambiente'],z:'Toda Navarra',
  d:'De SEO/BirdLife y Ecoembes contra la basura abandonada en la naturaleza. Cada año hay recogidas «1m² por la naturaleza» en Navarra.',
  q:'Apúntate a una recogida o organiza una en tu pueblo.',w:'https://proyectolibera.org'},
 {n:'Alianza por el Clima · Auzolanes en el Arga',c:['ambiente'],z:'Comarca de Pamplona',d:'Grandes limpiezas en auzolan del río Arga, con Greenpeace, Ekologistak Martxan y otras organizaciones.',q:'Limpiar plásticos de las orillas (Landaben, Rochapea, Burlada, Villava, Huarte…).'},
 {n:'Fondo Natural',c:['ambiente'],z:'Pamplona y otras localidades',d:'Asociación de restauración ecológica y educación ambiental.',q:'Plantar encinas y robles (por ejemplo en el monte Ezkaba).'},
 {n:'Basoberri',c:['ambiente'],z:'Toda Navarra',d:'Colectivo que planta árboles con la ciudadanía para frenar el cambio climático.',q:'Siembras de bellotas y plantaciones.'},
 {n:'Gurelur · Fondo Navarro para la Protección del Medio Natural',c:['ambiente','animales'],z:'Pamplona (Manuel de Falla, 8)',d:'Asociación de conservación de la naturaleza y la fauna de Navarra.',q:'Pregunta por sus actividades y campañas.',
  w:'https://www.pamplona.es/eu/entitateak/gurelur-natur-ingurunea-babesteko-nafarroako-funtsa'},
 {n:'Museo de Ciencias · Universidad de Navarra',c:['ambiente','jovenes'],z:'Pamplona',d:'Buscan personas con ganas de ciencia y naturaleza para sus actividades de divulgación.',q:'Ayudar en talleres y actividades.',w:'https://sciencemuseum.unav.edu/hazte-voluntario'},
 {n:'Limpieza del Ega (Estella)',c:['ambiente'],z:'Estella‑Lizarra',d:'El Ayuntamiento de Estella y Cruz Roja organizan limpiezas del río Ega, también desde el agua con piragüistas.',q:'Limpiar el río y sus orillas.'},
 // ---------- emergencias ----------
 {n:'DYA Navarra',c:['emerg','mayores'],z:'Toda Navarra',d:'Asociación de ayuda en carretera y emergencias. También ayuda a personas mayores a subir y bajar escaleras («Sube y Baja»).',q:'Socorrismo y primeros auxilios (te forman), servicios preventivos en eventos.'},
 {n:'Protección Civil de tu pueblo',c:['emerg'],z:'Muchos ayuntamientos',d:'Muchos ayuntamientos tienen una agrupación de voluntariado de Protección Civil.',q:'Apoyo en fiestas, eventos y emergencias. Pregunta en tu ayuntamiento.'},
 // ---------- Camino de Santiago (propuesta) ----------
 {n:'Hospitaleros voluntarios del Camino',c:['camino'],z:'Albergues de Roncesvalles a Viana',
  d:'Muchos albergues de peregrinos del Camino Francés funcionan con hospitaleros voluntarios, en turnos de unas dos o tres semanas.',
  q:'Recibir a peregrinos, sellar credenciales y cuidar el albergue. Normalmente piden haber hecho el Camino y un pequeño curso.'},
 {n:'Asociación de Amigos del Camino de Santiago en Navarra',c:['camino'],z:'Pamplona',d:'Informan a peregrinos y mantienen la señalización del Camino en Navarra.',q:'Atención al peregrino, señalización y acogida.',
  w:'https://www.pamplona.es/entidades/asociacion-de-amigos-del-camino-de-santiago-en-navarra-oficina-de-atencion-al-peregrino'},
 // ---------- para jóvenes (propuesta) ----------
 {n:'Campos de voluntariado juveniles (INJ)',c:['jovenes','ambiente'],z:'Toda Navarra (Urbasa, Pirineo…)',
  d:'Campos de verano del Instituto Navarro de la Juventud: naturaleza, patrimonio, memoria histórica… en Navarra y en otras comunidades.',
  q:'Convivir unas semanas con jóvenes de todas partes mientras trabajáis en un proyecto.',w:'http://www.juventudnavarra.es',m:'camposdevoluntariado@navarra.es'},
 {n:'Cuerpo Europeo de Solidaridad',c:['jovenes'],z:'Navarra y toda Europa',d:'Programa de la Unión Europea para jóvenes de 18 a 30 años: voluntariados de semanas o meses, con alojamiento y gastos cubiertos.',
  q:'Busca proyectos en Navarra (por ejemplo, el comedor Paris365 o Cruz Roja Tudela) o en otro país.',w:'https://youth.europa.eu'}
];
const VO_KW=/voluntari|auzolan|auzalan|limpieza (del|de|de la|de los) (r[ií]o|monte|orillas?)|plantaci[oó]n|recogida solidaria|gran recogida|basuraleza|reforesta/i;

let VOT='todo',VOQ='';
const st=document.createElement('style');st.textContent=`
.voChips{display:flex;gap:6px;overflow-x:auto;padding:2px 0 6px}.voChips button{flex:none;border:1px solid var(--line);background:none;color:inherit;border-radius:18px;padding:6px 12px;font:inherit;font-size:14px;cursor:pointer}
.voChips button.on{background:#303f9f;color:#fff;border-color:transparent}
.voIt{padding:10px 0;border-top:1px solid var(--line)}.voIt:first-child{border-top:0}
.voIt b{font-size:15.5px}.voIt .z{font-size:12.5px;color:var(--mut);margin-top:2px}.voIt .d{font-size:14px;line-height:1.45;margin-top:4px}
.voIt .q{font-size:14px;line-height:1.45;margin-top:4px;padding:6px 9px;border-radius:10px;background:rgba(48,63,159,.07)}
.voIt .a{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}.voIt .a button,.voIt .a a{border:1px solid var(--line);background:none;color:var(--acc);border-radius:10px;padding:5px 9px;font:inherit;font-size:13px;cursor:pointer;text-decoration:none}
.voTag{display:inline-block;font-size:11.5px;border-radius:8px;padding:1px 6px;margin:3px 4px 0 0;background:rgba(0,0,0,.05)}
.voTop{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}.voTop button{border:1px solid var(--line);background:var(--panel,#fff);color:inherit;border-radius:14px;padding:10px 4px;font:inherit;font-size:13.5px;font-weight:700;cursor:pointer;line-height:1.25}
.voTop button span{display:block;font-size:24px;margin-bottom:2px}`;
document.head.appendChild(st);

try{Object.assign(BNI,{'i-manos':'<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 27s-10-6.2-10-13a5.5 5.5 0 0 1 10-3.2A5.5 5.5 0 0 1 26 14c0 6.8-10 13-10 13z" fill="currentColor" fill-opacity=".14"/><path d="M11 15h3l2-3 2 6 2-3h2"/></g>'});}catch(e){}

const sec=(window.svSec?svSec:(id,h)=>{const s=document.createElement('section');s.id='t-'+id;s.innerHTML=h;(document.querySelector('.wrap')||document.body).appendChild(s);return s;})('voluntariado',
`<div class="card"><b>🤝 Voluntariado en Navarra</b><div class="note">Dedica un rato a quien lo necesita: personas, animales o la naturaleza. Elige un tema, toca una entidad y escríbeles o llámales. Todo es gratis y sin compromiso al principio.</div>
 <div class="voTop"><button data-k="mayores"><span>🧓</span>Personas</button><button data-k="animales"><span>🐾</span>Animales</button><button data-k="ambiente"><span>🌳</span>Medio ambiente</button></div>
 <div class="row" style="margin-top:8px"><button class="btn pri" id="voNV">🔎 Buscar acciones abiertas ahora</button></div></div>
<div class="card"><div class="voChips" id="voT"></div><input id="voQ" class="town" placeholder="🔎 Buscar por pueblo, entidad o tarea (pasear perros, ríos…)" style="width:100%;box-sizing:border-box">
 <div id="voL" style="margin-top:6px"></div></div>
<div class="card"><b>📅 Próximas jornadas en la agenda</b><div class="note">Limpiezas, plantaciones, recogidas de alimentos… que hay en la Agenda cultural.</div><div id="voA" style="margin-top:6px"><div class="note">Cargando…</div></div></div>
<div class="card"><b>💡 Antes de empezar</b><div class="note" style="line-height:1.55">• Empieza con poco: muchas entidades tienen jornadas de un solo día.<br>• La entidad te tiene que explicar tus tareas, darte formación y tener un seguro para su voluntariado.<br>• Si vas a estar con menores, te pedirán el certificado de delitos de naturaleza sexual (es gratis).<br>• Si eres menor de 18 años, pregunta: muchas actividades aceptan jóvenes desde los 14 o 16 años con permiso.<br>• ¿Conoces una entidad que falte? Cuéntanoslo en el <a href="#" id="voBuz">buzón de sugerencias</a>.</div></div>`);
nuevo('voluntariado','Servicios','🤝 Voluntariado','pueblo','i-manos','b');

function voRender(){
  $('voT').innerHTML=VO_T.map(([k,l])=>`<button class="${k===VOT?'on':''}" data-k="${k}">${l}</button>`).join('');
  $('voT').querySelectorAll('button').forEach(b=>b.onclick=()=>{VOT=b.dataset.k;voRender();});
  const q=nrm(VOQ),tn=Object.fromEntries(VO_T);
  const L=VO_L.filter(x=>(VOT==='todo'||x.c.includes(VOT))&&(!q||nrm([x.n,x.z,x.d,x.q,x.c.map(c=>tn[c]).join(' ')].join(' ')).includes(q)));
  const el=$('voL');
  el.innerHTML=L.length?L.map((x,i)=>`<div class="voIt"><b>${E(x.n)}</b><div class="z">📍 ${E(x.z)}</div>
    <div class="d">${E(x.d)}</div>${x.q?`<div class="q">🙋 ${E(x.q)}</div>`:''}<div>${x.c.filter(c=>c!=='inicio').map(c=>`<span class="voTag">${tn[c]||c}</span>`).join('')}</div>
    <div class="a">${x.w?`<button data-w="${E(x.w)}">🌐 Web</button>`:`<button data-s="${i}">🔎 Buscar</button>`}${x.t?`<a href="tel:${E(x.t.replace(/\s/g,''))}">📞 ${E(x.t)}</a>`:''}${x.m?`<a href="mailto:${E(x.m)}">✉️ Escribir</a>`:''}</div></div>`).join('')
   :'<div class="note">No hay nada con eso. Prueba con otra palabra o mira en Navarra+Voluntaria.</div>';
  el.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>abre(b.dataset.w));
  el.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{const x=L[+b.dataset.s];abre('https://www.google.com/search?q='+encodeURIComponent(x.n+' Navarra voluntariado'));});}

async function voAgenda(){const el=$('voA');let G=null;try{G=await jsLoad('agenda/cultura.json',{eventos:[]});}catch(e){}
  const hoy=typeof hoyYmd==='function'?hoyYmd():new Date().toISOString().slice(0,10);
  const L=((G&&G.eventos)||[]).filter(e=>(e.ff||e.f)>=hoy&&VO_KW.test((e.t||'')+' '+(e.desc||''))).sort((a,b)=>(a.f<hoy?hoy:a.f).localeCompare(b.f<hoy?hoy:b.f));
  const fl=d=>typeof fLarga==='function'?fLarga(d):d;
  el.innerHTML=L.length?L.slice(0,20).map(e=>`<div class="st" style="align-items:flex-start"><div style="flex:1"><b>🤝 ${E(e.t)}</b><div class="s">📅 ${e.ff&&e.ff!==e.f?'Hasta el '+fl(e.ff):fl(e.f)}${e.h?' · '+E(e.h):''}</div><div class="s">📍 ${E([e.lugar,e.pueblo].filter(Boolean).join(', '))}</div>${e.url?`<div class="s"><a href="#" data-u="${E(e.url)}">Más información ›</a></div>`:''}</div></div>`).join('')
   :'<div class="note">Ahora mismo no hay jornadas de voluntariado en la agenda. En Navarra+Voluntaria salen todas las que están abiertas.</div>';
  el.querySelectorAll('[data-u]').forEach(a=>a.onclick=ev=>{ev.preventDefault();abre(a.dataset.u);});}

sec.querySelectorAll('.voTop button').forEach(b=>b.onclick=()=>{VOT=b.dataset.k;voRender();$('voT').scrollIntoView({behavior:'smooth',block:'start'});});
$('voNV').onclick=()=>abre('https://navarramasvoluntaria.navarra.es');
$('voQ').oninput=e=>{VOQ=e.target.value;clearTimeout(voRender.t);voRender.t=setTimeout(voRender,200);};
$('voBuz').onclick=e=>{e.preventDefault();showTab('buzon');};
hook('voluntariado',()=>{voRender();voAgenda();});
window.VO_L=VO_L;
})();
