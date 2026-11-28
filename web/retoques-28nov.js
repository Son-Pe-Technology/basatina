/* =====================================================================
   RETOQUES DEL 28 NOV. 2026 (Pedro) · se carga el último
   1. Panel de administración: cada tarjeta con título (Pendiente de aprobar,
      Herramientas, Probar avisos…) se abre y se cierra tocando su título.
      Empiezan cerradas y la app recuerda las que dejaste abiertas.
      «Pendiente de aprobar» enseña en el título cuántas cosas hay.
   2. Qué hay cerca: al entrar busca solo, sin tener que darle a «Buscar».
   3. Pestañas de las secciones (Ahora, Radar, Nieve…): todas del mismo
      tamaño, sin cortar letras, en filas iguales (6 → 3 + 3, 5 → 3 + 2…).
   4. Ríos: las filas de datos (embalse, estaciones) van dentro de botones,
      sin cambiar la tarjeta blanca de fondo.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const css=document.createElement('style');
css.textContent=`
#sadBody .ajPlH{display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent}
#sadBody .ajPlH>i{font-style:normal;color:var(--mut);font-size:18px;transition:transform .2s;flex:none}
#sadBody .card.ajPlOn .ajPlH>i{transform:rotate(90deg)}
#sadBody .ajPlB{display:none;margin-top:8px}
#sadBody .card.ajPlOn .ajPlB{display:block}
#sadBody .ajPlH .sadN{margin-left:auto}
/* 3 · pestañas iguales en rejilla (gana a pestanas-filas.js y a menu6.js) */
html body section div.m6Tabs.m6Tabs.m6Tabs.m6Tabs{display:grid!important;grid-template-columns:repeat(var(--pfC,3),minmax(0,1fr));gap:8px!important;overflow:visible!important}
html body section div.m6Tabs.m6Tabs.m6Tabs.m6Tabs>button{width:100%;min-width:0;max-width:none;padding:9px 10px;text-align:center;white-space:nowrap;flex:none!important}
html body section div.m6Tabs.m6Tabs.m6Tabs.m6Tabs.pfMide{display:flex!important;flex-wrap:nowrap!important}
html body section div.m6Tabs.m6Tabs.m6Tabs.m6Tabs.pfMide>button{width:auto;padding:9px 10px}
/* si una palabra no cabe ni sola en su fila, se parte en dos renglones antes que cortarse */
html body section div.m6Tabs.m6Tabs.m6Tabs.m6Tabs.pfLargo>button{white-space:normal;line-height:1.2}
/* 4 · ríos: cada dato, en su botón */
body.bna #t-caudal .card .st{background:#f7faf5;border:1.5px solid #d5dfd2!important;border-radius:14px;padding:10px 12px!important;margin-top:8px}
body.bna #t-caudal .card .st:first-of-type{margin-top:10px}`;
document.head.appendChild(css);

/* ---------- 1 · panel de administración plegable ---------- */
const KEY='bnaSadAbiertos';let AB=new Set();
try{AB=new Set(JSON.parse(localStorage.getItem(KEY)||'[]'));}catch(e){}
const guarda=()=>{try{localStorage.setItem(KEY,JSON.stringify([...AB]));}catch(e){}};
function plegar(card){
  if(card.querySelector(':scope>.ajPlH'))return;
  const t=card.firstElementChild;if(!t||t.tagName!=='B')return;   // «Hola, Pedro» y la nota final se quedan como están
  const clave=t.textContent.replace(/\d+/g,'').trim();
  const h=document.createElement('div');h.className='ajPlH';
  const b=document.createElement('div');b.className='ajPlB';
  card.insertBefore(h,t);h.appendChild(t);
  // en «Pendiente de aprobar», el número de cosas por revisar a la vista
  if(card.id==='sadPendC'){let n=0;card.querySelectorAll('.sadNum.hay').forEach(x=>n+=+x.textContent||0);
    if(n){const k=document.createElement('span');k.className='sadN';k.textContent=n;h.appendChild(k);}}
  const fl=document.createElement('i');fl.textContent='▸';h.appendChild(fl);
  while(h.nextSibling)b.appendChild(h.nextSibling);
  card.appendChild(b);
  if(AB.has(clave))card.classList.add('ajPlOn');
  h.onclick=()=>{const on=card.classList.toggle('ajPlOn');if(on)AB.add(clave);else AB.delete(clave);guarda();};}
const box=$('sadBody');
if(box){const todo=()=>{if(!$('sadPendC'))return;   // sin entrar con vuestra cuenta, la tarjeta de «Ir a Mi cuenta» se queda abierta
    box.querySelectorAll(':scope>.card').forEach(plegar);};
  // el panel se vuelve a pintar a menudo (y las claves y el gasto de la IA, por su cuenta): se pliega cada vez
  new MutationObserver(todo).observe(box,{childList:true,subtree:true});todo();}

/* ---------- 2 · Qué hay cerca: busca solo al entrar ---------- */
let ceUlt=0;
const ceBtn=()=>document.querySelector('#t-cerca #ceGo');
const b0=ceBtn();if(b0)b0.textContent='🔄 Volver a buscar';

/* ---------- 3 · pestañas del mismo tamaño ---------- */
function filas(){document.querySelectorAll('section.on div.m6Tabs').forEach(r=>{
  const B=[...r.children].filter(x=>x.tagName==='BUTTON'&&x.offsetParent!==null);if(!B.length)return;
  r.classList.add('pfMide');r.classList.remove('pfLargo');
  const L=Math.max(...B.map(x=>x.offsetWidth));const W=r.clientWidth;r.classList.remove('pfMide');
  if(!W)return;
  const gap=8,max=Math.max(1,Math.floor((W+gap)/(L+gap)));
  const nf=Math.ceil(B.length/max),cols=Math.ceil(B.length/nf);   // filas equilibradas: 6 → 3+3, 5 → 3+2
  r.style.setProperty('--pfC',cols);
  if(max===1&&L>W)r.classList.add('pfLargo');});}
let tf=0;const filasYa=()=>{clearTimeout(tf);tf=setTimeout(filas,60);};
window.addEventListener('resize',filasYa);

const _st=showTab;showTab=function(t){_st.apply(this,arguments);
  try{filasYa();setTimeout(filas,400);}catch(e){}
  if(t==='cerca'&&Date.now()-ceUlt>120000&&typeof ceGo==='function'){ceUlt=Date.now();setTimeout(()=>{try{ceGo();}catch(e){console.log('cerca',e);}},150);}};
const b1=ceBtn();if(b1){const v=b1.onclick;b1.onclick=e=>{ceUlt=Date.now();return v&&v.call(b1,e);};}
filasYa();
})();
try{Object.assign(I18N.eu,{'🔄 Volver a buscar':'🔄 Berriz bilatu'});Object.assign(I18N.en,{'🔄 Volver a buscar':'🔄 Search again'});Object.assign(I18N.fr,{'🔄 Volver a buscar':'🔄 Chercher à nouveau'});}catch(e){}
