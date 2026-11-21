/* =====================================================================
   🧩 TEMAS NUEVOS (17 nov. 2026) — se carga el último, después de juegos.js
   1. 📰 Titulares de Navarra (`noticias`, grupo Servicios) + tarjeta en el Inicio.
        Datos: noticias/noticias.json (robot tools/noticias.py cada 2 h). Sin política.
   2. 🏔️ Nieve y aludes (`nieve`, grupo El tiempo): nieve en el suelo y nevadas de 3 días
        (Open‑Meteo) en puntos del Pirineo y sierras (NV_P) + boletín de aludes y montaña de AEMET
        (nieve/aludes.json, robot tools/aludes.py).
   3. 🗣️ Palabra del día en euskera: tarjeta en el Inicio, debajo de «Tal día como hoy» (lista PD_L).
   4. 🐕 Mascotas (`mascotas`, grupo Servicios): veterinarios, zonas para perros, protectoras y tiendas
        (web/mascotas.js, robot tools/mascotas.py) + consejos (MA_C).
   5. 🧺 Productos de temporada (`temporada`, grupo Localidades): calendario TP_L + ferias y jornadas
        gastronómicas sacadas de la Agenda cultural (palabras TP_KW).
   6. 📍 ¿Dónde está? (`jdonde`, grupo NA Juega): toca en el mapa de Navarra dónde está cada municipio
        (web/territorio.js).
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const E=s=>(typeof esc==='function'?esc(s):String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
const abre=u=>{if(window.amAbre)amAbre(u);else window.open(u,'_blank');};
const nrm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const nuevo=(t,g,l,sc,ic,fam)=>{try{window.amNuevo(t,g,l,sc,ic,fam);}catch(e){}};
const hook=(t,fn)=>{if(window.svHook)svHook(t,fn);};
const hace=d=>{const m=Math.round((Date.now()-new Date(d))/60000);return m<60?'hace '+Math.max(1,m)+' min':m<48*60?'hace '+Math.round(m/60)+' h':new Date(d).toLocaleDateString('es-ES',{day:'numeric',month:'short'});};

const st=document.createElement('style');st.textContent=`
.tmCard{background:var(--panel,#fff);border:1px solid var(--line);border-radius:16px;padding:12px 13px;margin:10px 0}
#pdCard{display:flex;align-items:center;gap:9px;padding:7px 10px;margin:8px 0;border-radius:14px;cursor:pointer}
#pdCard .pdI{flex:none;font-size:20px;line-height:1}#pdCard .pdX{flex:1;min-width:0}
#pdCard .pdK{font-size:10.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#2e7d32}
#pdCard .pdP{font-size:15px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#pdCard .pdP b{font-size:16px;color:#1b5e20}
#pdCard .pdN{font-size:12.5px;color:var(--mut);margin-top:3px;display:none}#pdCard.abierta .pdN{display:block}#pdCard .pdF{flex:none;color:#9aa;font-size:13px}
#rfCard{display:flex;align-items:center;gap:9px;background:linear-gradient(135deg,#f3e5f5,#ede7f6);border:1px solid #d1c4e9;border-radius:14px;padding:7px 8px 7px 10px;margin:8px 0;cursor:pointer;color:#311b92}
#rfCard .rfI{flex:none;font-size:20px;line-height:1}#rfCard .rfX{flex:1;min-width:0}
#rfCard .rfK{font-size:10.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#6a1b9a}
#rfCard .rfT{font-family:Georgia,serif;font-size:14.5px;line-height:1.25;margin-top:1px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#rfCard .rfM{font-size:11px;color:#7e57c2;margin-top:1px}
#rfCard .rfB{flex:none;border:1px solid #b39ddb;background:#fff;color:#6a1b9a;border-radius:10px;padding:5px 8px;font:inherit;font-size:12px;font-weight:700;cursor:pointer}
.tmH{display:flex;align-items:center;gap:10px}.tmI{font-size:22px;width:40px;height:40px;border-radius:13px;display:flex;align-items:center;justify-content:center;flex:none}
.tmK{font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase}
.tmNews{display:block;padding:9px 0;border-top:1px solid var(--line);cursor:pointer;color:inherit;text-decoration:none}.tmNews:first-child{border-top:0}
.tmNews b{display:block;font-size:15px;line-height:1.3}.tmNews span{font-size:12.5px;color:var(--mut)}
.tmChips{display:flex;gap:6px;overflow-x:auto;padding:2px 0 6px}.tmChips button{flex:none;border:1px solid var(--line);background:none;color:inherit;border-radius:18px;padding:6px 12px;font:inherit;font-size:14px;cursor:pointer}
.tmChips button.on{background:var(--acc,#2e7d32);color:#fff;border-color:transparent}
#nwTk{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:8px 10px;margin:0 0 10px;cursor:pointer;box-shadow:0 2px 8px rgba(29,45,35,.05);overflow:hidden}
.nwTkL{flex:none;font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#1565c0;background:#e3f2fd;border-radius:8px;padding:4px 7px}
.nwTkV{flex:1;overflow:hidden;white-space:nowrap;-webkit-mask-image:linear-gradient(90deg,transparent,#000 12px,#000 calc(100% - 12px),transparent);mask-image:linear-gradient(90deg,transparent,#000 12px,#000 calc(100% - 12px),transparent)}
.nwTkC{display:inline-block;white-space:nowrap;font-size:14.5px;color:var(--txt,#1d2b23);animation:nwTk 60s linear infinite;will-change:transform}
.nwTkC b{color:#1565c0;font-weight:800;margin-right:4px}
body:not(.light):not(.bna):not(.alegre) #nwTk{background:var(--panel);border-color:var(--line);box-shadow:none}
body:not(.light):not(.bna):not(.alegre) .nwTkL{background:rgba(100,181,246,.18);color:#90caf9}
body:not(.light):not(.bna):not(.alegre) .nwTkC b{color:#90caf9}.nwTkC i{font-style:normal;color:#9aa;margin:0 12px}
#nwTk:active .nwTkC,#nwTk:hover .nwTkC{animation-play-state:paused}
@keyframes nwTk{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@media (prefers-reduced-motion:reduce){.nwTkC{animation:none}.nwTkV{overflow-x:auto}}
.tmPal{font-size:28px;font-weight:900;letter-spacing:.01em;margin:6px 0 0}
.tmNv{display:grid;grid-template-columns:1fr auto;gap:2px 10px;padding:9px 0;border-top:1px solid var(--line)}.tmNv:first-child{border-top:0}
.tmNv .big{font-size:20px;font-weight:800;text-align:right}
.tmBol{white-space:pre-wrap;font-size:14px;line-height:1.45;max-height:340px;overflow:auto;background:rgba(0,0,0,.03);border-radius:10px;padding:10px}
.tmLvl{display:inline-block;border-radius:8px;padding:3px 10px;font-weight:800;color:#fff}
.tmMes{display:flex;gap:4px;overflow-x:auto;padding-bottom:4px}.tmMes button{flex:none;border:1px solid var(--line);background:none;color:inherit;border-radius:10px;padding:6px 9px;font:inherit;font-size:13px;cursor:pointer;text-transform:capitalize}
.tmMes button.on{background:#e09b00;color:#fff;border-color:transparent;font-weight:700}
.tmProd{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-top:1px solid var(--line)}.tmProd:first-child{border-top:0}.tmProd .e{font-size:24px;width:32px;text-align:center}
.jdBox{background:linear-gradient(180deg,#e9f1e3,#dbe7d2);color:#1d2b23;border-radius:16px;padding:12px;margin:10px 0;display:flex;flex-direction:column;gap:10px}
.jdBox canvas{width:100%;max-width:440px;align-self:center;border-radius:12px;background:#dfe4e2;touch-action:none}
.jdQ{font-size:20px;font-weight:800;text-align:center;min-height:28px}.jdR{text-align:center;font-size:15px;min-height:22px}
.jdBox .jgNiv button{border-color:rgba(0,0,0,.2)}
`;document.head.appendChild(st);

/* =====================================================================
   1. 📰 TITULARES DE NAVARRA
   ===================================================================== */
const NW_CAT=['Todo','Navarra','Deportes','El tiempo','Cultura','Economía','Sucesos'];
let NW=null,NWC='Todo',NWF='';
// mezcla los medios: el más reciente de cada medio, luego el segundo de cada uno… (así no salen todos seguidos los del mismo diario)
function nwMezcla(L){const G={};L.slice().sort((a,b)=>b.d.localeCompare(a.d)).forEach(x=>(G[x.f]=G[x.f]||[]).push(x));
  const K=Object.keys(G).sort(()=>Math.random()-.5),out=[];   // cada vez empieza un medio distinto
  for(let i=0;out.length<L.length;i++)K.forEach(k=>{if(G[k][i])out.push(G[k][i]);});return out;}
async function nwLoad(force){if(NW&&!force)return NW;try{NW=await jsLoad('noticias/noticias.json',{items:[]},force);}catch(e){NW={items:[]};}
  NW=Object.assign({},NW,{items:nwMezcla(NW.items||[])});return NW;}
const nwRow=x=>`<a class="tmNews" data-u="${E(x.u)}"><b>${E(x.t)}</b><span>${E(x.f)} · ${hace(x.d)}${x.c&&x.c!=='Navarra'?' · '+E(x.c):''}</span></a>`;
const nwBind=el=>el.querySelectorAll('[data-u]').forEach(a=>a.onclick=e=>{e.preventDefault();abre(a.dataset.u);});
svSec('noticias',`<div class="card"><b>📰 Titulares de Navarra</b><div class="note">Lo último de los medios de Navarra, <b>sin noticias de política</b>. Toca un titular para leer la noticia en la web del medio.</div>
 <div class="tmChips" id="nwC"></div><select class="town" id="nwF" style="width:100%;margin-top:4px"><option value="">Todos los medios</option></select></div>
 <div class="card" id="nwL"><div class="note">Cargando…</div></div>
 <div class="card"><div class="note">También puedes ir directamente al periódico (sin titulares automáticos aquí):</div><a class="btn" id="nwDN" style="display:block;margin-top:6px;text-align:center">📰 Abrir Diario de Noticias</a></div>
 <div class="note" style="margin:0 6px 12px" id="nwT"></div>`);
{const dn=$('nwDN');if(dn)dn.onclick=e=>{e.preventDefault();abre('https://www.noticiasdenavarra.com/');};}
nuevo('noticias','Servicios','📰 Titulares de Navarra','pueblo','i-news','b');
async function nwRender(){const D=await nwLoad();const L=(D.items||[]);
  $('nwC').innerHTML=NW_CAT.map(c=>`<button class="${c===NWC?'on':''}" data-c="${c}">${c}</button>`).join('');
  $('nwC').querySelectorAll('button').forEach(b=>b.onclick=()=>{NWC=b.dataset.c;nwRender();});
  const F=[...new Set(L.map(x=>x.f))].sort(),sel=$('nwF');if(sel.options.length<=1)F.forEach(f=>sel.insertAdjacentHTML('beforeend',`<option>${E(f)}</option>`));
  const V=L.filter(x=>(NWC==='Todo'||x.c===NWC)&&(!NWF||x.f===NWF));
  $('nwL').innerHTML=V.length?V.slice(0,80).map(nwRow).join(''):`<div class="note">${L.length?'No hay titulares de este tipo ahora mismo.':'Los titulares llegan en un rato (se preparan solos cada 2 horas).'}</div>`;nwBind($('nwL'));
  $('nwT').textContent=D.t?'Actualizado '+hace(D.t)+'. Titulares y enlaces de cada medio; la noticia completa está en su web.':'';}
$('nwF').onchange=e=>{NWF=e.target.value;nwRender();};
hook('noticias',()=>nwRender());

/* =====================================================================
   3. 🗣️ PALABRA DEL DÍA EN EUSKERA  [palabra, significado, ejemplo o pista]
   ===================================================================== */
const PD_L=[
 ['ibaia','el río','«Arga ibaia» = el río Arga.'],['mendia','el monte','Mendizalea = la persona que anda por el monte.'],['basoa','el bosque','De «baso» viene «basati», salvaje: BasatiNA.'],
 ['zuhaitza','el árbol',''],['lorea','la flor','Eguzkilorea = la flor del sol.'],['hostoa','la hoja',''],['elurra','la nieve','«Elurra ari du» = está nevando.'],
 ['euria','la lluvia','«Euria ari du» = está lloviendo.'],['haizea','el viento',''],['eguzkia','el sol',''],['ilargia','la luna',''],['izarra','la estrella',''],
 ['hodeia','la nube',''],['lainoa','la niebla',''],['ortzadarra','el arcoíris',''],['harria','la piedra',''],['lurra','la tierra',''],['ura','el agua',''],
 ['zubia','el puente','Zubiri = el pueblo del puente.'],['herria','el pueblo',''],['etxea','la casa','Etxeberria = la casa nueva.'],['baserria','el caserío',''],
 ['bidea','el camino',''],['kalea','la calle',''],['eliza','la iglesia',''],['iturria','la fuente',''],['errota','el molino',''],
 ['txakurra','el perro',''],['katua','el gato',''],['behia','la vaca','Betizu viene de «behi izu», vaca huidiza.'],['ardia','la oveja',''],['zaldia','el caballo',''],
 ['txoria','el pájaro',''],['arraina','el pez',''],['amuarraina','la trucha',''],['igaraba','la nutria','Como la de nuestro juego del Arga.'],['otsoa','el lobo',''],
 ['hartza','el oso',''],['azeria','el zorro',''],['basurdea','el jabalí',''],['oreina','el ciervo',''],['erlea','la abeja',''],['tximeleta','la mariposa',''],
 ['perretxikoa','la seta',''],['gaztaina','la castaña',''],['sagarra','la manzana','Sagardoa = la sidra (vino de manzana).'],['ogia','el pan',''],
 ['gazta','el queso',''],['ardoa','el vino',''],['esnea','la leche',''],['arrautza','el huevo',''],['babarrunak','las alubias',''],['piperra','el pimiento',''],
 ['laguna','el amigo / la amiga',''],['ama','la madre',''],['aita','el padre',''],['amona','la abuela',''],['aitona','el abuelo',''],['haurra','el niño / la niña',''],
 ['kaixo','hola',''],['agur','adiós',''],['egun on','buenos días',''],['arratsalde on','buenas tardes',''],['gabon','buenas noches',''],
 ['eskerrik asko','muchas gracias',''],['mesedez','por favor',''],['barkatu','perdón',''],['bai','sí',''],['ez','no',''],['zorionak','felicidades','Se dice en cumpleaños, bodas y Navidad.'],
 ['on egin','que aproveche',''],['osasuna','la salud','Por eso el club se llama así.'],['poza','la alegría',''],['bihotza','el corazón',''],
 ['bat, bi, hiru','uno, dos, tres',''],['lau, bost, sei','cuatro, cinco, seis',''],['zazpi, zortzi','siete, ocho','Zazpiak bat = las siete (provincias), una.'],['bederatzi, hamar','nueve, diez',''],
 ['astelehena','lunes',''],['asteartea','martes',''],['asteazkena','miércoles',''],['osteguna','jueves',''],['ostirala','viernes',''],['larunbata','sábado',''],['igandea','domingo',''],
 ['udaberria','la primavera',''],['uda','el verano',''],['udazkena','el otoño',''],['negua','el invierno',''],
 ['gorria','rojo',''],['urdina','azul',''],['berdea','verde',''],['horia','amarillo',''],['zuria','blanco',''],['beltza','negro',''],
 ['handia','grande',''],['txikia','pequeño','Txiki se usa también en castellano de Navarra.'],['polita','bonito',''],['hotza','el frío',''],['beroa','el calor',''],
 ['gaur','hoy',''],['bihar','mañana',''],['atzo','ayer',''],['jaia','la fiesta','Jaiak = las fiestas.'],['dantza','el baile',''],['liburua','el libro',''],['eskola','la escuela',''],['lana','el trabajo','']];
const MESES_EU=['urtarrila','otsaila','martxoa','apirila','maiatza','ekaina','uztaila','abuztua','iraila','urria','azaroa','abendua'];
function pdHoy(){const d=new Date(),n=Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()))/864e5);
  if(d.getDate()===1)return [MESES_EU[d.getMonth()],'nombre de este mes','Hoy empieza '+MESES_EU[d.getMonth()]+'.'];
  return PD_L[(n*7)%PD_L.length];}
/* Tarjeta pequeña (19 nov. 2026): una sola línea; si tiene explicación, se abre al tocarla */
function pdDraw(){const el=$('pdCard');if(!el)return;const p=pdHoy();
  el.innerHTML=`<div class="pdI">🗣️</div><div class="pdX"><div class="pdK">Palabra del día en euskera</div><div class="pdP"><b>${E(p[0])}</b> = ${E(p[1])}</div>${p[2]?`<div class="pdN">${E(p[2])}</div>`:''}</div>${p[2]?'<div class="pdF">💡</div>':''}`;
  el.onclick=()=>{if(p[2])el.classList.toggle('abierta');};}

/* 🗣️ Refrán del día (19 nov. 2026): sale de los refranes que manda la gente desde «Refranes de tu pueblo»
   (Cuadrilla BasatiNA → participa@basatina.es) y que publicáis desde el modo Administrador (participa/refranes.json).
   Todos ven el mismo refrán cada día. Si aún no hay ninguno publicado, la franja invita a mandar el primero. */
async function rfHoyDraw(){const el=$('rfCard');if(!el||typeof jsLoad!=='function')return;let L=[];
  try{L=((await jsLoad('participa/refranes.json',{refranes:[]}))||{}).refranes||[];}catch(e){}
  const env='<button class="rfB" aria-label="Envía el refrán de tu pueblo">Envía el tuyo ›</button>';
  if(!L.length){el.innerHTML=`<div class="rfI">🗣️</div><div class="rfX"><div class="rfK">Refrán del día</div><div class="rfT">¿Qué se dice en tu pueblo? Manda tu refrán y saldrá aquí para toda Navarra.</div></div>${env}`;}
  else{const d=new Date(),n=Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5),r=L[(n*5)%L.length];
    el.innerHTML=`<div class="rfI">🗣️</div><div class="rfX"><div class="rfK">Refrán del día</div><div class="rfT">«${E(r.t)}»</div><div class="rfM">📍 ${E(r.p||'Navarra')} · lo mandó la cuadrilla</div></div>${env}`;}
  el.onclick=()=>showTab('refranes');}

/* tarjetas del Inicio: palabra del día + titulares */
(function(){const ref=$('efHome')||$('seHome');if(!ref||$('pdCard'))return;
  ref.insertAdjacentHTML('afterend','<div id="pdCard" class="tmCard"></div><div id="rfCard" role="button"></div>');pdDraw();setTimeout(rfHoyDraw,1800);})();
const _stRf=showTab;showTab=function(t){_stRf(t);if(t==='mtiempo')rfHoyDraw();};
/* 📰 cinta de titulares arriba del Inicio: van pasando solos; al tocarla se abre «Titulares de Navarra» */
(function(){const sec=$('t-mtiempo');if(!sec||$('nwTk'))return;
  sec.insertAdjacentHTML('afterbegin','<div id="nwTk" role="button" aria-label="Titulares de Navarra: toca para verlos todos"><span class="nwTkL">📰 Titulares</span><div class="nwTkV"><div class="nwTkC" id="nwTkC"><span>Cargando titulares…</span></div></div></div>');
  $('nwTk').onclick=()=>showTab('noticias');
  // 20 nov. 2026: la cinta va SIEMPRE arriba del todo del Inicio. En el tema BasatiNA el paisaje del tiempo (#pvBox)
  // se pinta después y se ponía encima; si algo se mete delante, la cinta vuelve a subir sola.
  const arriba=()=>{const t=$('nwTk');if(t&&sec.firstElementChild!==t)sec.prepend(t);};
  try{new MutationObserver(arriba).observe(sec,{childList:true});}catch(e){}arriba();})();
async function nwHome(force){const el=$('nwTkC');if(!el)return;const D=await nwLoad(force);const L=(D.items||[]).filter(x=>x.c!=='Sucesos').slice(0,15);
  if(!L.length){el.innerHTML='<span>Los titulares llegan en un rato</span>';el.style.animation='none';return;}
  const h=L.map(x=>`<span><b>${E(x.f)}</b> ${E(x.t)}</span>`).join('<i>•</i>');
  el.innerHTML=h+'<i>•</i>'+h+'<i>•</i>';   // dos veces seguidas: así la cinta da la vuelta sin saltos
  requestAnimationFrame(()=>{const w=el.scrollWidth/2;el.style.animationDuration=Math.max(20,w/45)+'s';el.style.animation='none';void el.offsetWidth;el.style.animation='';el.style.animationDuration=Math.max(20,w/45)+'s';});}
setTimeout(()=>nwHome(),1800);
let PDDAY=new Date().getDate();setInterval(()=>{if(new Date().getDate()!==PDDAY){PDDAY=new Date().getDate();pdDraw();nwHome(true);}},10*60e3);
const _stHome=showTab;showTab=function(t){_stHome(t);if(t==='mtiempo'){pdDraw();if(NW&&Date.now()-(NW._t||0)>30*60e3){NW._t=Date.now();nwHome(true);}}};

/* =====================================================================
   2. 🏔️ NIEVE Y ALUDES
   ===================================================================== */
// [nombre, lat, lon, altitud (m)] — puntos aproximados
const NV_P=[['Piedra de San Martín (Larra-Belagua)',42.9737,-0.7608,1760],['Belagua',42.953,-0.812,1420],['Isaba',42.8617,-0.9219,813],
  ['Ori / Orhi',42.988,-1.007,1900],['Ochagavía / Otsagabia',42.906,-1.088,765],['Roncesvalles / Orreaga',43.0093,-1.3195,952],
  ['Puerto de Velate',43.048,-1.640,847],['Aralar (San Miguel)',42.947,-1.969,1235],['Urbasa',42.85,-2.17,930]];
const ALUD=[[1,'Débil','#43a047'],[2,'Limitado','#fbc02d'],[3,'Notable','#fb8c00'],[4,'Fuerte','#e53935'],[5,'Muy fuerte','#6d1b1b']];
svSec('nieve',`<div class="card"><b>🏔️ Nieve y aludes</b><div class="note">Nieve en el suelo, nevadas de los próximos días y el boletín oficial de peligro de aludes del Pirineo navarro.</div></div>
 <div class="card"><b>❄️ Nieve ahora y próximos 3 días</b><div id="nvL" style="margin-top:6px"><div class="note">Cargando…</div></div>
  <div class="note" style="margin-top:6px">Mira siempre el estado real antes de salir.</div></div>
 <div class="card"><b>⚠️ Peligro de aludes · AEMET</b><div id="nvA" style="margin-top:6px"><div class="note">Cargando…</div></div>
  <div class="note" style="margin-top:8px">Escala europea: ${ALUD.map(a=>`<span class="tmLvl" style="background:${a[2]};font-size:12px;padding:1px 7px;margin:2px 2px 0 0">${a[0]} ${a[1]}</span>`).join('')}</div>
  <div class="row" style="margin-top:8px"><button class="btn" id="nvAem">🌐 Predicción de montaña en AEMET</button></div></div>
 <div class="card" id="nvM" style="display:none"><b>🥾 Predicción de montaña · Pirineo navarro</b><div id="nvMt"></div></div>
 <div class="card" style="border-color:#ffb020"><div class="note">⚠️ <b>ANTE EL RIESGO, HAZ CASO SIEMPRE A LOS AVISOS OFICIALES.</b> En invierno lleva crampones, piolet, ARVA, pala y sonda si vas a terreno de aludes, y di a alguien adónde vas. Emergencias: <a href="tel:112">112</a>.</div></div>`);
nuevo('nieve','El tiempo','🏔️ Nieve y aludes','topo','i-nieve','b');
$('nvAem').onclick=()=>abre('https://www.aemet.es/es/eltiempo/prediccion/montana');
let NVD=null;
async function nvRender(){
  if(!NVD||Date.now()-NVD.t>30*60e3){$('nvL').innerHTML='<div class="note">Cargando…</div>';
    try{const q=k=>NV_P.map(p=>p[k]).join(',');
      const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${q(1)}&longitude=${q(2)}&elevation=${q(3)}&current=temperature_2m,snow_depth&hourly=freezing_level_height&daily=snowfall_sum,temperature_2m_min,temperature_2m_max&timezone=Europe%2FMadrid&forecast_days=4`);
      const j=await r.json();NVD={t:Date.now(),d:Array.isArray(j)?j:[j]};}catch(e){NVD=null;}}
  if(!NVD){$('nvL').innerHTML='<div class="note">No se pudo cargar ahora. Prueba en un rato.</div>';}
  else $('nvL').innerHTML=NV_P.map((p,i)=>{const d=NVD.d[i]||{},c=d.current||{},dl=d.daily||{},sd=c.snow_depth,fl=(d.hourly&&d.hourly.freezing_level_height)||[],h=new Date().getHours();
    const nev=(dl.snowfall_sum||[]).slice(1,4),tot=nev.reduce((a,b)=>a+(b||0),0);
    return `<div class="tmNv"><div><b>${E(p[0])}</b> <span class="note">${fmtN(p[3],0)} m</span>
      <div class="note">🌡️ ${c.temperature_2m!=null?fmtN(c.temperature_2m,0)+' °C':'—'}${fl[h]!=null?' · cota 0 °C: '+fmtN(Math.round(fl[h]/50)*50,0)+' m':''}</div>
      <div class="note">🌨️ Próximos 3 días: ${tot>=0.5?nev.map((v,k)=>['mañ.','pas.','+3'][k]+' '+fmtN(v||0,0)+' cm').join(' · '):'sin nevadas previstas'}</div></div>
      <div class="big">${sd==null?'—':sd<0.01?'<span style="font-size:14px;font-weight:600">sin nieve</span>':fmtN(sd*100,0)+' cm'}</div></div>`;}).join('');
  let A=null;try{A=await jsLoad('nieve/aludes.json',{},true);}catch(e){}
  const t=(A&&A.aludes)||'';
  const fuera=t&&/finalizada la campana|fin de la campana/.test(nrm(t));
  if(fuera)$('nvA').innerHTML=`<div class="note">❄️ Ahora mismo <b>no hay boletín de aludes en vigor</b>: AEMET lo publica en temporada de nieve (más o menos de diciembre a abril). Último aviso de AEMET:</div><div class="tmBol" style="margin-top:6px">${E(t)}</div>`;
  else if(t){const m=nrm(t).match(/(debil|limitado|notable|fuerte|muy fuerte)\s*\(?\s*([1-5])/)||nrm(t).match(/nivel\s*(?:de peligro)?\s*:?\s*([1-5])/);
    const n=m?+(m[2]||m[1]):0,a=ALUD.find(x=>x[0]===n);
    $('nvA').innerHTML=(a?`<div style="margin-bottom:6px">Nivel citado en el boletín: <span class="tmLvl" style="background:${a[2]}">${a[0]} · ${a[1]}</span></div>`:'')+
      `<div class="tmBol">${E(t)}</div><div class="note" style="margin-top:4px">Boletín oficial de AEMET · recogido ${A.t?hace(A.t):''}. Lee el boletín completo: el nivel puede cambiar según la orientación y la altura.</div>`;}
  else $('nvA').innerHTML='<div class="note">AEMET publica el boletín de peligro de aludes del Pirineo navarro solo en temporada de nieve (más o menos de diciembre a abril). Ahora mismo no hay boletín en vigor.</div>';
  const M=(A&&A.montana)||[];$('nvM').style.display=M.length?'':'none';
  $('nvMt').innerHTML=M.map(x=>`<div style="margin-top:8px"><b style="font-size:14px">${x.dia?'Mañana':'Hoy'}</b><div class="tmBol">${E(x.txt)}</div></div>`).join('');}
hook('nieve',nvRender);

/* =====================================================================
   4. 🐕 MASCOTAS
   ===================================================================== */
const MA_T=[['vet','🩺 Veterinarios'],['park','🐕 Zonas para perros'],['prot','🏠 Protectoras'],['tienda','🛍️ Tiendas'],['consejos','💡 Consejos']];
const MA_C=[
 ['🐛','Procesionaria del pino','De finales de invierno a primavera baja de los pinos en filas. Sus pelos urticantes son muy peligrosos para los perros (lengua y boca). Si la toca: lava con agua sin frotar y ve al veterinario ya.'],
 ['🌾','Espigas en verano','Se clavan en orejas, nariz y entre los dedos. Revisa a tu perro al volver de campo. Si estornuda mucho o sacude la cabeza, al veterinario.'],
 ['🕷️','Garrapatas','Sobre todo de primavera a otoño en hierba alta y monte. Revísale al volver y usa antiparasitarios. Quítalas enteras, con pinzas.'],
 ['☠️','Cebos envenenados','Si ves comida sospechosa, no la toques: avisa en 📣 Alertas ciudadanas y a la Guardia Civil (062) o al 112. Si tu perro se pone mal tras comer algo, al veterinario de urgencia.'],
 ['🌡️','Calor','Nunca lo dejes en el coche, ni un rato. En verano, paseos a primera o última hora y siempre con agua: el asfalto quema las almohadillas.'],
 ['🐄','Ganado y fauna','En el monte, perro atado cerca de vacas, ovejas, yeguas y mastines, y en espacios protegidos y épocas de cría. Respeta las señales de cada zona.'],
 ['🚮','Recoge siempre','Lleva bolsas y agua para limpiar el pis en la calle. Es lo justo y en muchos pueblos hay multas.'],
 ['🆔','Microchip y registro','Los perros, gatos y hurones tienen que llevar microchip y estar registrados. Si se pierde, avisa a tu veterinario, a la Policía Municipal y a las protectoras de la zona.']];
let MAT='vet',MAQ='',MAPOS=null;
// Clínicas que salen siempre las primeras en Veterinarios (petición de Pedro, 21 nov. 2026). Nombre exacto, como en OpenStreetMap.
const MA_PRIMERAS=['Clínica veterinaria Aoiz'];
// Datos que nos han pasado de una clínica (tienen prioridad sobre OpenStreetMap). Clave = nombre exacto de OpenStreetMap.
const MA_DATOS={'Clínica veterinaria Aoiz':{d:'Calle Aoiz, 18, bajo (Segundo Ensanche)',p:'31004 Pamplona',tel:'948 246 912',m:'clinivetaoiz@gmail.com',
  w:'https://www.clinicaveterinariaaoiz.com',h:'Lunes a viernes 10:00–13:00 y 17:00–19:00 · Sábados 10:00–13:00',txt:'Clínica veterinaria de barrio, con trato cercano y profesional.'}};
svSec('mascotas',`<div class="card"><b>🐾 Mascotas en Navarra</b><div class="note">Veterinarios, zonas para soltar al perro, protectoras y tiendas, y consejos para el campo.</div>
 <div class="tmChips" id="maT"></div><div class="row" id="maBus"><input id="maQ" class="town" placeholder="🔎 Buscar por pueblo o nombre…" style="flex:1;min-width:0"><button class="btn" id="maCerca">📍 Cerca de mí</button></div></div>
 <div class="card" id="maL"><div class="note">Cargando…</div></div>
 <div class="note" style="margin:0 6px 12px" id="maN">Puede faltar algún sitio o haber cambiado su horario: llama antes de ir.</div>`);
nuevo('mascotas','Servicios','🐾 Mascotas','pueblo','i-pata','g');
function maRender(){$('maT').innerHTML=MA_T.map(([k,l])=>`<button class="${k===MAT?'on':''}" data-k="${k}">${l}</button>`).join('');
  $('maT').querySelectorAll('button').forEach(b=>b.onclick=()=>{MAT=b.dataset.k;maRender();});
  $('maBus').style.display=MAT==='consejos'?'none':'';const el=$('maL');
  if(MAT==='consejos'){el.innerHTML=MA_C.map(c=>`<div class="tmProd"><div class="e">${c[0]}</div><div><b>${E(c[1])}</b><div class="note">${E(c[2])}</div></div></div>`).join('')+
     `<div class="row" style="margin-top:8px"><button class="btn" onclick="showTab('comunidad')">📣 Ver alertas ciudadanas</button><a class="btn" href="tel:112">📞 112</a></div>`;return;}
  if(!window.MASCOTAS){el.innerHTML='<div class="note">Cargando…</div>';svLoad('mascotas.js','MASCOTAS',ok=>{if(ok)maRender();else el.innerHTML='<div class="note">⏳ La lista llega con la próxima actualización de datos (se prepara sola en unas horas).</div>';});return;}
  const q=nrm(MAQ);let L=MASCOTAS.p.map(x=>MA_DATOS[x.n]?Object.assign({},x,MA_DATOS[x.n]):x).filter(x=>x.k===MAT&&(!q||nrm(x.n+' '+x.p+' '+(x.d||'')).includes(q)));
  if(MAPOS){L=L.map(x=>Object.assign({_k:km(MAPOS.la,MAPOS.lo,x.pt[0],x.pt[1])},x)).sort((a,b)=>a._k-b._k);}
  if(MAT==='vet'){const fi=x=>{const i=MA_PRIMERAS.findIndex(n=>nrm(n)===nrm(x.n));return i<0?999:i;};L=L.slice().sort((a,b)=>fi(a)-fi(b));}
  el.innerHTML=(MAT==='vet'?'<div class="note" style="margin-bottom:6px">🚨 Las marcadas con <b>24 h</b> atienden urgencias: confírmalo por teléfono.</div>':'')+
   (L.length?L.slice(0,80).map(x=>`<div class="st" style="align-items:flex-start"><div style="flex:1;min-width:0"><b>${E(x.n)}</b>${x.u?' <span class="amPill" style="background:#c62828">24 h</span>':''}
     <div class="s">📍 ${E([x.d,x.p].filter(Boolean).join(', '))}${x._k!=null?' · '+fmtN(x._k,x._k<10?1:0)+' km':''}</div>${x.txt?`<div class="s">${E(x.txt)}</div>`:''}${x.h?`<div class="s">🕐 ${E(x.h)}</div>`:''}
     <div class="s">${x.tel?`<a href="tel:${E(x.tel.replace(/\s/g,''))}">📞 ${E(x.tel)}</a> · `:''}<a href="#" data-m="${x.pt}">🗺️ Cómo llegar</a>${x.w?` · <a href="#" data-w="${E(x.w)}">🌐 Web</a>`:''}${x.m?` · <a href="mailto:${E(x.m)}">✉️ Correo</a>`:''}</div></div></div>`).join('')
    :'<div class="note">No hay ninguno con ese nombre o pueblo.</div>')+(L.length>80?`<div class="note">Y ${L.length-80} más: busca por pueblo.</div>`:'');
  el.querySelectorAll('[data-m]').forEach(a=>a.onclick=e=>{e.preventDefault();abre('https://www.google.com/maps/search/?api=1&query='+a.dataset.m);});
  el.querySelectorAll('[data-w]').forEach(a=>a.onclick=e=>{e.preventDefault();abre(a.dataset.w);});}
$('maQ').oninput=e=>{MAQ=e.target.value;maRender();};
$('maCerca').onclick=async()=>{const b=$('maCerca');b.textContent='📍 Buscando…';try{MAPOS=await myPos();b.textContent='📍 Ordenado por cercanía';}catch(e){b.textContent='📍 Cerca de mí';toast(e.message);}maRender();};
hook('mascotas',maRender);

/* =====================================================================
   5. 🧺 PRODUCTOS DE TEMPORADA  [emoji, nombre, meses (1-12), tipo, nota]
   ===================================================================== */
const TP_L=[
 ['🌸','Alcachofa de Tudela',[11,12,1,2,3,4,5],'Verdura','IGP Alcachofa de Tudela. La mejor, en invierno y primavera.'],
 ['🤍','Espárrago de Navarra',[4,5,6],'Verdura','IGP. El fresco, en primavera; en conserva todo el año.'],
 ['🌶️','Pimiento del piquillo de Lodosa',[9,10,11],'Verdura','DOP. Se asa a la llama y se pela a mano.'],
 ['🫘','Pochas',[8,9,10],'Verdura','Alubia blanca tierna. Con codorniz o almejas.'],
 ['🥬','Borraja',[10,11,12,1,2,3,4],'Verdura','Con patata y aceite, o en buñuelos.'],
 ['🥬','Cardo',[11,12,1,2],'Verdura','El de Navidad: con almendras o bechamel.'],
 ['🥗','Cogollos de Tudela',[10,11,12,1,2,3,4],'Verdura','Con anchoas o ajo frito.'],
 ['🥦','Coliflor y acelga',[10,11,12,1,2,3],'Verdura',''],
 ['🫛','Habas y guisantes',[3,4,5,6],'Verdura','Habitas tiernas de la Ribera.'],
 ['🍅','Tomate de la Ribera',[7,8,9],'Verdura',''],
 ['🫑','Pimientos y calabacín',[6,7,8,9],'Verdura',''],
 ['🍒','Cereza',[5,6,7],'Fruta',''],
 ['🍑','Melocotón',[7,8,9],'Fruta',''],
 ['🍐','Pera',[8,9,10],'Fruta',''],
 ['🍎','Manzana',[9,10,11,12],'Fruta','Y con ella, la sidra.'],
 ['🍇','Uva y vendimia',[9,10],'Fruta','DO Navarra.'],
 ['🌰','Castañas y nueces',[10,11,12],'Fruta',''],
 ['🫐','Endrinas (pacharán)',[9,10],'Del monte','Se cogen maduras, tras las primeras heladas mejor.'],
 ['🍄','Perretxikos',[4,5],'Del monte','Seta de primavera. Mira las normas de recolección.'],
 ['🍄','Boletus y setas de otoño',[9,10,11],'Del monte','Mira las normas de recolección de cada zona.'],
 ['⚫','Trufa negra',[12,1,2,3],'Del monte',''],
 ['🧀','Queso Roncal e Idiazabal',[1,2,3,4,5,6,7,8,9,10,11,12],'Todo el año','DO. El Roncal fue la primera DO de queso de España.'],
 ['🐑','Cordero de Navarra y txistorra',[1,2,3,4,5,6,7,8,9,10,11,12],'Todo el año','IGP Cordero de Navarra.']];
const TP_KW=/gastron|degusta|feria|mercado|jornadas|verdura|alcachofa|esparrago|espárrago|piquillo|pimiento|pocha|txistorra|queso|vino|vendimia|sidra|pacharan|pacharán|seta|micol|trufa|cordero|chuleta|pintxo|tapa|cocina|ajo|miel|aceite/i;
let TPM=new Date().getMonth()+1;
const MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
svSec('temporada',`<div class="card"><b>🧺 Productos de temporada</b><div class="note">Qué toca comprar y cocinar cada mes en Navarra, y las ferias y jornadas gastronómicas de la agenda.</div>
 <div class="tmMes" id="tpM" style="margin-top:8px"></div></div><div id="tpL"></div>
 <div class="card"><b>🎪 Ferias y jornadas gastronómicas</b><div id="tpF" style="margin-top:6px"><div class="note">Cargando…</div></div></div>
 <div class="note" style="margin:0 6px 12px">Las ferias salen de la 🎭 Agenda cultural.</div>`);
nuevo('temporada','Localidades','🧺 Productos de temporada','pueblo','i-cesta','g');
async function tpRender(){$('tpM').innerHTML=MESES.map((m,i)=>`<button class="${i+1===TPM?'on':''}" data-m="${i+1}">${m.slice(0,3)}</button>`).join('');
  $('tpM').querySelectorAll('button').forEach(b=>b.onclick=()=>{TPM=+b.dataset.m;tpRender();});
  const on=$('tpM').querySelector('.on');if(on)on.scrollIntoView({inline:'center',block:'nearest'});
  const L=TP_L.filter(p=>p[2].includes(TPM)),G=['Verdura','Fruta','Del monte','Todo el año'];
  $('tpL').innerHTML=G.map(g=>{const X=L.filter(p=>p[3]===g);if(!X.length)return '';
    return `<div class="card"><b>${{'Verdura':'🥬 Verdura y hortaliza','Fruta':'🍎 Fruta','Del monte':'🌲 Del monte','Todo el año':'⭐ Todo el año'}[g]} · <span style="text-transform:capitalize">${MESES[TPM-1]}</span></b>
     ${X.map(p=>{const ult=!p[2].includes(TPM%12+1),pri=!p[2].includes((TPM+10)%12+1);return `<div class="tmProd"><div class="e">${p[0]}</div><div style="flex:1"><b>${E(p[1])}</b>${g!=='Todo el año'&&pri?' <span class="amPill" style="background:#43a047">empieza</span>':''}${g!=='Todo el año'&&ult?' <span class="amPill" style="background:#ef6c00">último mes</span>':''}${p[4]?`<div class="note">${E(p[4])}</div>`:''}</div></div>`;}).join('')}</div>`;}).join('');
  if(tpRender.f)return;tpRender.f=1;let A=null;try{A=await jsLoad('agenda/cultura.json',{eventos:[]});}catch(e){}
  const hoy=hoyYmd(),F=((A&&A.eventos)||[]).filter(e=>(e.ff||e.f)>=hoy&&TP_KW.test((e.t||'')+' '+(e.cat||''))).sort((a,b)=>(a.f<hoy?hoy:a.f).localeCompare(b.f<hoy?hoy:b.f));
  $('tpF').innerHTML=F.length?F.slice(0,40).map(e=>`<div class="st" style="align-items:flex-start"><div style="flex:1"><b>🎪 ${E(e.t)}</b><div class="s">📅 ${e.ff&&e.ff!==e.f?'Hasta el '+fLarga(e.ff):fLarga(e.f)}${e.h?' · '+E(e.h):''}</div><div class="s">📍 ${E([e.lugar,e.pueblo].filter(Boolean).join(', '))}</div>${e.url?`<div class="s"><a href="#" data-w="${E(e.url)}">Más información ›</a></div>`:''}</div></div>`).join('')
    :'<div class="note">Ahora mismo no hay ferias ni jornadas gastronómicas en la agenda. Mira también la 🎭 Agenda cultural.</div>';
  $('tpF').querySelectorAll('[data-w]').forEach(a=>a.onclick=e=>{e.preventDefault();abre(a.dataset.w);});}
hook('temporada',tpRender);

/* =====================================================================
   6. 📍 ¿DÓNDE ESTÁ? (juego, grupo NA Juega)
   ===================================================================== */
svSec('jdonde',`<div class="jdBox" data-noswipe>
 <div class="jgNiv" id="jdNiv"><button data-n="0">😊 Fácil</button><button data-n="1">🤔 Normal</button><button data-n="2">🧭 Experto</button></div>
 <div style="display:flex;justify-content:space-between;font-size:14px"><span>Ronda <b id="jdRo">1</b>/10</span><span>Puntos <b id="jdPt">0</b></span><span>🏆 <b id="jdRec">0</b></span></div>
 <div class="jdQ" id="jdQ">Cargando el mapa…</div>
 <canvas id="jdC" width="440" height="480"></canvas>
 <div class="jdR" id="jdR"></div>
 <button class="jgBig" id="jdSig" style="display:none">Siguiente ›</button>
 <div class="jgNota" style="color:#4a5a4f">Toca en el mapa dónde crees que está. Cuanto más cerca, más puntos (hasta 100 por ronda). Fácil: los municipios grandes · Normal: más de 800 habitantes · Experto: todos.</div>
</div>`);
(function(){
 const C=$('jdC'),x=C.getContext('2d'),B={s:41.9,n:43.33,w:-2.52,e:-0.70},COS=Math.cos(42.6*Math.PI/180);
 const W=C.width,H=C.height,sx=W/((B.e-B.w)*COS),sy=H/(B.n-B.s),S=Math.min(sx,sy),ox=(W-(B.e-B.w)*COS*S)/2,oy=(H-(B.n-B.s)*S)/2;
 const P=(la,lo)=>[ox+(lo-B.w)*COS*S,oy+(B.n-la)*S],INV=(px,py)=>[B.n-(py-oy)/S,B.w+(px-ox)/(COS*S)];
 let G=ls('bnJgDonde',{n:0,rec:[0,0,0]}),POOL=[],ronda=0,pts=0,act=null,res=null,usadas=[];
 function ls(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
 function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
 function mapa(hl){x.clearRect(0,0,W,H);x.fillStyle='#dfe4e2';x.fillRect(0,0,W,H);if(!window.TERRI)return;
   Object.values(TERRI.mun).forEach(m=>{if(!m.r)return;x.beginPath();m.r.forEach(ring=>ring.forEach((q,i)=>{const [a,b]=P(q[0],q[1]);i?x.lineTo(a,b):x.moveTo(a,b);}));
     x.fillStyle=m===hl?'#ffd54f':'#eef3e6';x.fill('evenodd');x.strokeStyle='rgba(90,110,80,.35)';x.lineWidth=.6;x.stroke();});}
 function pool(){const n=G.n,L=Object.values(TERRI.mun).filter(m=>m.pt&&m.n&&(n===2||(n===1?(m.hab||0)>=800:(m.hab||0)>=3000)));return L;}
 function nueva(){POOL=pool();ronda=0;pts=0;usadas=[];$('jdPt').textContent=0;$('jdRec').textContent=G.rec[G.n]||0;
   document.querySelectorAll('#jdNiv button').forEach(b=>b.classList.toggle('on',+b.dataset.n===G.n));sig();}
 function sig(){if(ronda>=10)return fin();ronda++;$('jdRo').textContent=ronda;res=null;$('jdSig').style.display='none';$('jdR').textContent='';
   let m,k=0;do{m=POOL[Math.floor(Math.random()*POOL.length)];k++;}while(usadas.includes(m.n)&&k<50);usadas.push(m.n);act=m;
   $('jdQ').textContent='¿Dónde está '+m.n.split(' / ')[0]+'?';mapa();}
 function pin(px,py,c){x.fillStyle=c;x.strokeStyle='#fff';x.lineWidth=2.5;x.beginPath();x.arc(px,py,7,0,7);x.fill();x.stroke();}
 function toca(e){if(!act||res)return;const r=C.getBoundingClientRect(),px=(e.clientX-r.left)*W/r.width,py=(e.clientY-r.top)*H/r.height,[la,lo]=INV(px,py);
   const d=km(la,lo,act.pt[0],act.pt[1]),p=Math.max(0,Math.round(100-d*2));res=1;pts+=p;$('jdPt').textContent=pts;
   mapa(act);const [ax,ay]=P(act.pt[0],act.pt[1]);x.strokeStyle='#c62828';x.setLineDash([5,4]);x.lineWidth=2;x.beginPath();x.moveTo(px,py);x.lineTo(ax,ay);x.stroke();x.setLineDash([]);
   pin(px,py,'#c62828');pin(ax,ay,'#2e7d32');
   $('jdR').innerHTML=(d<3?'🎯 <b>¡Clavado!</b> ':d<10?'👏 <b>¡Muy cerca!</b> ':d<25?'👍 ':'😅 ')+`Estaba a <b>${fmtN(d,d<10?1:0)} km</b> · +${p} puntos<br><span class="note">${E(act.n)}${act.hab?' · '+fmtN(act.hab,0)+' habitantes':''}</span>`;
   $('jdSig').textContent=ronda>=10?'Ver resultado ›':'Siguiente ›';$('jdSig').style.display='';}
 function fin(){act=null;const r=G.rec[G.n]||0,nr=pts>r;if(nr){G.rec[G.n]=pts;lsSet('bnJgDonde',G);}
   $('jdQ').textContent=nr?'🏆 ¡Récord nuevo!':'Fin de la partida';$('jdRec').textContent=G.rec[G.n];
   $('jdR').innerHTML=`<b style="font-size:20px">${pts} de 1.000 puntos</b><br>${pts>=800?'Conoces Navarra como la palma de tu mano.':pts>=550?'¡Muy bien! Navarra no tiene secretos para ti.':pts>=300?'No está mal. ¡A por la revancha!':'Toca darse una vuelta por Navarra 😉'}`;
   $('jdSig').textContent='🔄 Otra partida';$('jdSig').style.display='';ronda=10;}
 $('jdSig').onclick=()=>{if(!act)return nueva();sig();};
 C.addEventListener('click',toca);
 document.querySelectorAll('#jdNiv button').forEach(b=>b.onclick=()=>{G.n=+b.dataset.n;lsSet('bnJgDonde',G);nueva();});
 window.jdInit=()=>{if(POOL.length)return;$('jdQ').textContent='Cargando el mapa…';svLoad('territorio.js','TERRI',ok=>{if(!ok){$('jdQ').textContent='No se pudo cargar el mapa. Prueba con conexión.';return;}nueva();});};
})();
// botón en «NA Juega»
(function(){const sub=$('dsJuega');if(!sub)return;const b=document.createElement('button');b.dataset.t='jdonde';b.textContent='📍 ¿Dónde está? (mapa de Navarra)';b.onclick=()=>{showTab('jdonde');menu(false);};sub.appendChild(b);
  try{TITLES.jdonde='📍 ¿Dónde está?';PVS_ESC.jdonde='topo';ICK.jdonde='game-controller';ICC.jdonde='#6d4c41';BNK.jdonde='i-juego';BNF.jdonde='g';BNL.jdonde='¿Dónde está?';}catch(e){}})();
hook('jdonde',()=>window.jdInit&&jdInit());

/* iconos (estilo de la barra «bna») y traducciones del menú */
try{Object.assign(BNI,{
 'i-news':'<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="20" height="21" rx="2.5" fill="currentColor" fill-opacity=".12"/><path d="M24 11h3v13a3 3 0 0 1-3 3M8 11h12M8 15h12M8 19h8M8 23h6"/></g>',
 'i-nieve':'<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 27l9-15 5 7 3-4 9 12z" fill="currentColor" fill-opacity=".12"/><path d="M10 15.5l2-3.5 2 3"/><path d="M24 4v7M20.5 6l7 3M20.5 9l7-3"/></g>',
 'i-pata':'<g fill="currentColor" fill-opacity=".85"><ellipse cx="16" cy="21" rx="6" ry="5"/><circle cx="8" cy="14" r="2.6"/><circle cx="12.5" cy="9" r="2.6"/><circle cx="19.5" cy="9" r="2.6"/><circle cx="24" cy="14" r="2.6"/></g>',
 'i-cesta':'<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13h24l-3 13H7z" fill="currentColor" fill-opacity=".12"/><path d="M10 13l4-8M22 13l-4-8M12 17v5M16 17v5M20 17v5"/></g>'});
 const _a=window.applyIcons;if(typeof _a==='function')_a((CFG.iconos||'pro')==='pro');}catch(e){}
try{Object.assign(I18N.eu,{'Titulares de Navarra':'Nafarroako izenburuak','Nieve y aludes':'Elurra eta elur-jausiak','Mascotas':'Maskotak','Productos de temporada':'Sasoiko produktuak','¿Dónde está? (mapa de Navarra)':'Non dago? (Nafarroako mapa)','Palabra del día en euskera':'Eguneko hitza euskaraz'});
  Object.assign(I18N.en,{'Titulares de Navarra':'Navarre headlines','Nieve y aludes':'Snow and avalanches','Mascotas':'Pets','Productos de temporada':'Seasonal produce','¿Dónde está? (mapa de Navarra)':'Where is it? (Navarre map)','Palabra del día en euskera':'Basque word of the day'});
  Object.assign(I18N.fr,{'Titulares de Navarra':'Titres de Navarre','Nieve y aludes':'Neige et avalanches','Mascotas':'Animaux de compagnie','Productos de temporada':'Produits de saison','¿Dónde está? (mapa de Navarra)':'Où est-ce ? (carte de Navarre)','Palabra del día en euskera':'Mot basque du jour'});}catch(e){}
})();
