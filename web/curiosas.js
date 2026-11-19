/* =====================================================================
   😄 NOTICIAS CURIOSAS (17 nov. 2026) — se carga el último, después de juegos-peques.js
   - Pantalla `curiosas` (grupo Servicios, junto a «Titulares de Navarra»).
   - Tarjeta en el Inicio: «La noticia curiosa de la mañana / tarde / noche».
   - Aviso en el móvil a las 9, 15 y 21 h (Ajustes → «😄 Noticia curiosa»; lo manda RiverJob.checkCuriosa).
   - Datos: noticias/curiosas.json (robot tools/curiosas.py, varias veces al día).
     dest = la noticia elegida de cada turno {k:'AAAA-MM-DD-m|t|n', t, u, f, d}; items = todas las curiosas.
   - Modo Administrador: 🙈 Ocultar una noticia y palabras prohibidas → noticias/curiosas_ocultas.json
     (el robot vuelve a pasar solo al guardarlo y ya no la usa).
   - Solo titular + enlace + medio: la noticia se lee en la web del medio. Sin política ni temas tristes.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const E=s=>(typeof esc==='function'?esc(s):String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
const abre=u=>{if(window.amAbre)amAbre(u);else window.open(u,'_blank');};
const nuevo=(t,g,l,sc,ic,fam)=>{try{window.amNuevo(t,g,l,sc,ic,fam);}catch(e){}};
const hook=(t,fn)=>{if(window.svHook)svHook(t,fn);};
const hace=d=>{const m=Math.round((Date.now()-new Date(d))/60000);return m<60?'hace '+Math.max(1,m)+' min':m<48*60?'hace '+Math.round(m/60)+' h':new Date(d).toLocaleDateString('es-ES',{day:'numeric',month:'short'});};
const CU_PATH='noticias/curiosas.json',CU_OC='noticias/curiosas_ocultas.json',CU_OCDEF={urls:[],prohibidas:[]};
const TURNO={m:'de la mañana',t:'de la tarde',n:'de la noche'};
let CU=null,CUOC=null;

/* Turno de ahora, en hora de Madrid (igual que turno_de() del robot y que RiverJob.turnoCuriosa) */
function cuTurno(){const p={};new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'})
   .formatToParts(new Date()).forEach(x=>p[x.type]=x.value);
  let h=+p.hour;if(h<5){const d=new Date(Date.UTC(+p.year,+p.month-1,+p.day)-864e5);return d.toISOString().slice(0,10)+'-n';}
  return `${p.year}-${p.month}-${p.day}-`+(h<13?'m':h<19?'t':'n');}

async function cuLoad(force){if(CU&&!force)return CU;
  try{CU=await jsLoad(CU_PATH,{items:[],dest:[]},force);}catch(e){CU={items:[],dest:[]};}
  try{CUOC=await jsLoad(CU_OC,CU_OCDEF,force);}catch(e){CUOC=CU_OCDEF;}
  const oc=new Set((CUOC&&CUOC.urls)||[]);
  CU=Object.assign({},CU,{items:(CU.items||[]).filter(x=>!oc.has(x.u)),dest:(CU.dest||[]).filter(x=>!oc.has(x.u))});return CU;}

/* la noticia del turno: la elegida por el robot; si aún no la hay, la mejor de la lista */
function cuDelTurno(D){const k=cuTurno();const d=(D.dest||[]).find(x=>x.k===k);if(d)return {x:d,k};
  const usadas=new Set((D.dest||[]).map(x=>x.u));const x=(D.items||[]).find(x=>!usadas.has(x.u))||(D.dest||[]).slice(-1)[0]||(D.items||[])[0];
  return x?{x,k}:null;}

const st=document.createElement('style');st.textContent=`
#cuCard{display:flex;align-items:center;gap:9px;background:linear-gradient(135deg,#fff8e1,#fff3e0);border:1px solid #ffe0b2;border-radius:14px;padding:7px 8px 7px 10px;margin:8px 0;cursor:pointer;color:#3e2723}
#cuCard .cuI{flex:none;font-size:20px;line-height:1}
#cuCard .cuX{flex:1;min-width:0}
#cuCard .cuK{font-size:10.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#e65100}
#cuCard .cuT{font-size:14px;font-weight:700;line-height:1.25;margin-top:1px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#cuCard .cuM{font-size:11px;color:#8d6e63;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#cuCard .cuO{flex:none;border:1px solid #ffcc80;background:#fff;color:#e65100;border-radius:10px;padding:5px 8px;font:inherit;font-size:12px;font-weight:700;cursor:pointer}
.cuRow{display:flex;gap:8px;align-items:flex-start;padding:9px 0;border-top:1px solid var(--line)}.cuRow:first-child{border-top:0}
.cuRow a{flex:1;color:inherit;text-decoration:none;cursor:pointer}.cuRow a b{display:block;font-size:15px;line-height:1.3}.cuRow a span{font-size:12.5px;color:var(--mut)}
.cuRow .cuOcu{flex:none;border:1px solid var(--line);background:none;border-radius:10px;padding:5px 8px;font-size:13px;cursor:pointer;color:inherit}
.cuDest{border-left:4px solid #ffb300;padding-left:9px;margin:6px 0}
`;document.head.appendChild(st);

/* ---------- pantalla ---------- */
const sec=window.svSec?svSec('curiosas',`<div class="card"><b>😄 Noticias curiosas</b><div class="note">Noticias simpáticas, raras o sorprendentes de muchos medios. <b>Sin política ni noticias tristes.</b> Cada mañana, tarde y noche elegimos una. Toca un titular para leerla en la web del medio.</div></div>
 <div class="card"><b>⭐ Las elegidas</b><div id="cuDest"><div class="note">Cargando…</div></div></div>
 <div class="card"><b>📰 Todas las curiosas de estos días</b><div id="cuL"><div class="note">Cargando…</div></div></div>
 <div class="card tech" id="cuAdm"><b>🛡️ Administrador</b><div class="note">🙈 <b>Ocultar</b> quita una noticia de la app para todos (el robot ya no la vuelve a coger). Las palabras prohibidas sirven para que no salgan noticias con esa palabra.</div>
   <div style="display:flex;gap:6px;margin-top:6px"><input id="cuPal" class="town" style="flex:1" placeholder="Palabra prohibida (p. ej. famoso)"><button class="btn" id="cuPalB">➕ Añadir</button></div>
   <div class="note" id="cuPalL" style="margin-top:6px"></div></div>
 <div class="note" style="margin:0 6px 12px" id="cuT"></div>`):null;
nuevo('curiosas','Servicios','😄 Noticias curiosas','fiesta','i-news','r');

const fila=(x,adm)=>`<div class="cuRow"><a data-u="${E(x.u)}"><b>${E(x.t)}</b><span>${E(x.f)} · ${hace(x.d)}</span></a>${adm?`<button class="cuOcu" data-o="${E(x.u)}" title="Ocultar para todos">🙈</button>`:''}</div>`;
function enlaza(el){el.querySelectorAll('[data-u]').forEach(a=>a.onclick=e=>{e.preventDefault();abre(a.dataset.u);});
  el.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>cuOcultar(b.dataset.o));}

async function cuRender(force){const D=await cuLoad(force),adm=typeof TECH!=='undefined'&&TECH;
  const dest=(D.dest||[]).slice().reverse().slice(0,9);
  const fK=k=>{const [a,m,d,t]=k.split('-');return new Date(+a,+m-1,+d).toLocaleDateString('es-ES',{weekday:'long',day:'numeric'})+' · '+(TURNO[t]||'').replace('de la ','');};
  $('cuDest').innerHTML=dest.length?dest.map(x=>`<div class="cuDest"><div class="note" style="text-transform:capitalize">${E(fK(x.k))}</div>${fila(x,adm)}</div>`).join(''):'<div class="note">La primera llega en el próximo turno (mañana, tarde o noche).</div>';
  $('cuL').innerHTML=(D.items||[]).length?D.items.slice(0,60).map(x=>fila(x,adm)).join(''):'<div class="note">Ahora mismo no hay noticias curiosas. Vuelve en un rato.</div>';
  enlaza($('cuDest'));enlaza($('cuL'));
  $('cuT').textContent=D.t?'Actualizado '+hace(D.t)+'. Titulares y enlaces de cada medio; la noticia completa está en su web.':'';
  const pl=(CUOC&&CUOC.prohibidas)||[];$('cuPalL').innerHTML=pl.length?'Prohibidas: '+pl.map(w=>`<b>${E(w)}</b>`).join(', '):'Sin palabras prohibidas extra.';}

async function cuOcultar(u){if(!confirm('¿Ocultar esta noticia para todos?'))return;
  try{CUOC=await jsEdit(CU_OC,CU_OCDEF,d=>{d.urls=d.urls||[];if(!d.urls.includes(u))d.urls.push(u);d.urls=d.urls.slice(-300);},'Ocultar noticia curiosa');
    toast('🙈 Oculta. En unos minutos desaparece para todos');CU=null;cuRender();cuHome();}
  catch(e){toast('No se pudo guardar: '+e.message);}}
if($('cuPalB'))$('cuPalB').onclick=async()=>{const w=$('cuPal').value.trim().toLowerCase();if(!w)return;
  try{CUOC=await jsEdit(CU_OC,CU_OCDEF,d=>{d.prohibidas=d.prohibidas||[];if(!d.prohibidas.includes(w))d.prohibidas.push(w);},'Palabra prohibida en noticias curiosas');
    $('cuPal').value='';toast('✅ Guardada. El robot la aplica en unos minutos');cuRender();}catch(e){toast('No se pudo guardar: '+e.message);}};
hook('curiosas',()=>cuRender(true));

/* ---------- tarjeta del Inicio ---------- */
(function(){const ref=$('pdCard')||$('efHome')||$('seHome');if(!ref||$('cuCard'))return;
  ref.insertAdjacentHTML('afterend','<div id="cuCard" role="button" style="display:none"></div>');})();
/* Tarjeta pequeña (19 nov. 2026): la elegida del turno y, con «Otra ›», van pasando las demás curiosas */
let CUI=-1;
async function cuHome(force){const el=$('cuCard');if(!el)return;const D=await cuLoad(force);const r=cuDelTurno(D);
  if(!r){el.style.display='none';return;}
  const t=r.k.slice(-1),L=[r.x].concat((D.items||[]).filter(x=>x.u!==r.x.u));
  const x=CUI<0?r.x:L[CUI%L.length];el.style.display='';
  el.innerHTML=`<div class="cuI">😄</div><div class="cuX"><div class="cuK">${CUI<0?'Noticia curiosa '+TURNO[t]:'Otra curiosa'}</div><div class="cuT">${E(x.t)}</div><div class="cuM">${E(x.f)} · ${hace(x.d)}</div></div>${L.length>1?'<button class="cuO" aria-label="Otra noticia curiosa">Otra ›</button>':''}`;
  el.onclick=e=>{if(e.target.closest('.cuO')){CUI=(CUI<0?1:CUI+1)%L.length;cuHome();return;}abre(x.u);};
  el.oncontextmenu=e=>{e.preventDefault();showTab('curiosas');};}
setTimeout(()=>cuHome(),2200);
let CUK=cuTurno();setInterval(()=>{const k=cuTurno();if(k!==CUK){CUK=k;CUI=-1;cuHome(true);}},5*60e3);   // cambia sola al pasar de turno
const _stCu=showTab;showTab=function(t){_stCu(t);if(t==='mtiempo'&&CU&&Date.now()-(CU._t||0)>30*60e3){CU._t=Date.now();cuHome(true);}};

/* ---------- Ajustes: aviso en el móvil ---------- */
if(typeof cfgApply==='function'){const _ca=cfgApply;window.cfgApply=cfgApply=function(){_ca.apply(this,arguments);
  // misma lista que la última versión (ampliacion.js) + curiosa
  try{if(APP&&window.AndroidNet.setAlerts)window.AndroidNet.setAlerts(JSON.stringify({on:CFG.avisos,qAma:CFG.qAma,qRoj:CFG.qRoj,subida:CFG.subida,roads:CFG.roads||[],snow:CFG.snow||[],
    finde:CFG.finde?[TOWNS[TOWN][0],TOWNS[TOWN][1],TOWNS[TOWN][2]]:null,dato:!!CFG.dato,datoH:CFG.datoH||9,sismo:CFG.sismo!==false,sismoM:+CFG.sismoM||2.5,curiosa:!!CFG.curiosa}));}catch(e){}};
  if(CFG.curiosa)cfgApply();}
if(typeof ajustesRender==='function'){const _aj=ajustesRender;window.ajustesRender=ajustesRender=function(){_aj.apply(this,arguments);
  const el=$('ajBody');if(!el)return;const nat=typeof APP!=='undefined'&&APP&&window.AndroidNet&&window.AndroidNet.setAlerts;
  el.insertAdjacentHTML('beforeend',`<div class="card"><b>😄 Noticia curiosa</b><div class="note">Una noticia simpática o sorprendente por la mañana, por la tarde y por la noche. Sin política ni noticias tristes.</div>
   ${nat?`<label style="display:flex;gap:8px;align-items:center;margin-top:6px"><input type="checkbox" id="ajCur" ${CFG.curiosa?'checked':''}> Avisarme en el móvil (9:00, 15:00 y 21:00)</label>
   <div class="note">Android puede retrasarlo unos minutos para ahorrar batería.</div>`:'<div class="note">El aviso en el móvil llega con la app de Android actualizada (versión 4.6 o más). La tarjeta se ve en el Inicio.</div>'}</div>`);
  const c=$('ajCur');if(c)c.onchange=()=>{CFG.curiosa=c.checked;cfgSave();};};}

/* ---------- traducciones del menú y la tarjeta ---------- */
try{Object.assign(I18N.eu,{'Noticias curiosas':'Albiste bitxiak','Noticia curiosa':'Albiste bitxia','Otra ›':'Beste bat ›','Otra curiosa':'Beste albiste bitxi bat'});
  Object.assign(I18N.en,{'Noticias curiosas':'Fun news','Noticia curiosa':'Fun news','Otra ›':'Next ›','Otra curiosa':'More fun news'});
  Object.assign(I18N.fr,{'Noticias curiosas':'Insolite','Noticia curiosa':'Insolite','Otra ›':'Suivante ›','Otra curiosa':'Encore de l’insolite'});}catch(e){}

window.CURIOSAS={cuLoad,cuHome,cuTurno};
})();
