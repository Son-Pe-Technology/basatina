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
/* 3 · filas de botones (pestañas, filtros, empresas…) todas iguales, en rejilla (gana a pestanas-filas.js, menu6.js y .seg) */
html body .pfGrid.pfGrid.pfGrid.pfGrid.pfGrid:not(#pfNo):not(#pfNo2){display:grid!important;grid-template-columns:repeat(var(--pfC,3),minmax(0,1fr))!important;grid-auto-rows:1fr;gap:8px!important;overflow:visible!important}
html body .pfGrid.pfGrid.pfGrid.pfGrid.pfGrid:not(#pfNo):not(#pfNo2)>button,html body .pfGrid.pfGrid.pfGrid.pfGrid.pfGrid:not(#pfNo):not(#pfNo2)>label.msChip{width:100%!important;min-width:0!important;max-width:none!important;margin:0!important;flex:none!important;white-space:nowrap;text-align:center;display:flex;align-items:center;justify-content:center}
html body .pfGrid.pfGrid.pfGrid.pfGrid.pfGrid:not(#pfNo):not(#pfNo2).pfMide{display:flex!important;flex-wrap:nowrap!important}
html body .pfGrid.pfGrid.pfGrid.pfGrid.pfGrid:not(#pfNo):not(#pfNo2).pfMide>button,html body .pfGrid.pfGrid.pfGrid.pfGrid.pfGrid:not(#pfNo):not(#pfNo2).pfMide>label.msChip{width:auto!important;flex:none!important}
/* si no caben en una línea, el texto se parte en dos renglones (todos los botones igual de altos) antes que cortarse */
html body .pfGrid.pfGrid.pfGrid.pfGrid.pfGrid:not(#pfNo):not(#pfNo2).pfLargo>button{white-space:normal;line-height:1.2}
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
    // pantallas que se quedaron en blanco en este móvil (para saber cuál arreglar)
    if(!$('sadBlanco')){let L=[];try{L=JSON.parse(localStorage.getItem('bnaBlanco')||'[]');}catch(e){}
      if(L.length){const c=document.createElement('div');c.className='card';c.id='sadBlanco';
        c.innerHTML='<b>⚪ Pantallas en blanco en este móvil</b><div class="note">La app os llevó al Inicio porque no se veía ninguna pantalla. Mandad captura de esto a Claude para arreglarlo.</div>'+
          L.map(x=>`<div class="note">${new Date(x.h).toLocaleString('es-ES',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})} · pantalla «${String(x.t).replace(/[<>&"]/g,'')}»</div>`).join('');
        const ult=box.querySelector(':scope>.card:last-child');box.insertBefore(c,ult&&!ult.querySelector(':scope>b,:scope>.ajPlH')?ult:null);}}
    box.querySelectorAll(':scope>.card').forEach(plegar);};
  // el panel se vuelve a pintar a menudo (y las claves y el gasto de la IA, por su cuenta): se pliega cada vez
  new MutationObserver(todo).observe(box,{childList:true,subtree:true});todo();}

/* ---------- 2 · Qué hay cerca: busca solo al entrar ---------- */
let ceUlt=0;
const ceBtn=()=>document.querySelector('#t-cerca #ceGo');
const b0=ceBtn();if(b0)b0.textContent='🔄 Volver a buscar';

/* ---------- 3 · pestañas del mismo tamaño ---------- */
// todas las filas de botones de la app: pestañas, filtros, combustibles, empresas, grupos, zonas, periodos…
const PF_SEL='div.m6Tabs,.msFila,.emChips,.voChips,.ruChips,.pdChips,.tmChips,.clT,#agCat,#dpDep,#foCat,.bcChips,.gsChips,.seg,#biTp';
// 28 nov. 2026 (Pedro): en estas filas de botones, sin iconos (si al quitarlo el botón se queda vacío, se deja)
const EMO=/\p{Extended_Pictographic}\uFE0F?\u200D?\s*/gu;
function quitaIconos(K){K.forEach(b=>{const tw=document.createTreeWalker(b,NodeFilter.SHOW_TEXT);const T=[];let n;while((n=tw.nextNode()))T.push(n);
  if(!T.some(t=>t.nodeValue.replace(EMO,'').trim()))return;T.forEach(t=>{const v=t.nodeValue.replace(EMO,'');if(v!==t.nodeValue)t.nodeValue=v;});});}
function filas(){try{filas0();}catch(e){console.log('filas',e);}}
function filas0(){document.querySelectorAll('section.on').forEach(sec=>sec.querySelectorAll(PF_SEL).forEach(r=>{
  const K=[...r.children].filter(x=>getComputedStyle(x).display!=='none');
  if(K.length<2||K.some(x=>x.tagName!=='BUTTON'&&!(x.tagName==='LABEL'&&x.classList.contains('msChip'))))return;   // solo filas de botones (o de chips Zona/Dificultad…)
  quitaIconos(K);
  r.classList.add('pfGrid','pfMide');r.classList.remove('pfLargo');
  const L=Math.max(...K.map(x=>x.offsetWidth));const W=r.clientWidth;r.classList.remove('pfMide');
  if(!W||!L)return;
  const gap=8,cw=c=>(W-gap*(c-1))/c;let max=Math.max(1,Math.floor((W+gap)/(L+gap))),largo=false;
  // el más largo no cabe ni solo en dos columnas: con muchos botones, se ponen en 2 columnas y el texto en dos renglones
  if(max<2&&K.length>=4&&L<=cw(2)*1.8){max=2;largo=true;}else if(max===1&&L>W)largo=true;
  // si la última fila se queda coja (3 botones en 2 columnas → 2+1) y con una columna más quedan todas llenas, una más con el texto en dos renglones
  {const c0=Math.ceil(K.length/Math.ceil(K.length/max));if(K.length%c0&&K.length%(max+1)===0&&K.length<=8&&L<=cw(max+1)*1.8){max++;largo=true;}}
  const nf=Math.ceil(K.length/max),cols=Math.ceil(K.length/nf);   // filas equilibradas: 6 → 3+3, 5 → 3+2, 17 → 2 columnas
  r.style.setProperty('--pfC',cols);r.classList.toggle('pfLargo',largo);}));}
let tf=0;const filasYa=()=>{clearTimeout(tf);tf=setTimeout(filas,60);};
window.addEventListener('resize',filasYa);
try{new MutationObserver(m=>{if(m.some(x=>x.target.nodeType===1&&x.target.matches&&x.target.matches(PF_SEL)))filasYa();}).observe(document.body,{childList:true,subtree:true});}catch(e){}

const _st=showTab;showTab=function(t){window._pfUlt=t;_st.apply(this,arguments);setTimeout(blanco,700);
  try{filasYa();setTimeout(filas,400);}catch(e){}
  if(t==='cerca'&&Date.now()-ceUlt>120000&&typeof ceGo==='function'){ceUlt=Date.now();setTimeout(()=>{try{ceGo();}catch(e){console.log('cerca',e);}},150);}};
const b1=ceBtn();if(b1){const v=b1.onclick;b1.onclick=e=>{ceUlt=Date.now();return v&&v.call(b1,e);};}
filasYa();
/* ---------- 5 · nunca la pantalla en blanco ----------
   28 nov. 2026 (Pedro): a veces la app se quedaba solo con la barra de arriba, la de abajo y «Propiedad de Son&Pe»:
   se había pedido abrir una pantalla que no existe (o aún no estaba creada, p. ej. al volver tras una
   actualización) y se apagaban todas. Ahora, si no hay ninguna pantalla visible, se va al Inicio.
   Queda apuntado en el móvil (localStorage «bnaBlanco») qué pantalla falló, para poder arreglarla. */
function blanco(){const s=document.querySelector('section.on');if(s&&s.offsetHeight>0)return;
  if(document.querySelector('#mfBox'))return;
  try{const L=JSON.parse(localStorage.getItem('bnaBlanco')||'[]');L.unshift({t:(window._pfUlt||'?'),h:new Date().toISOString()});localStorage.setItem('bnaBlanco',JSON.stringify(L.slice(0,10)));}catch(e){}
  try{showTab('mtiempo');}catch(e){}}
setInterval(blanco,1500);
let firma='';setInterval(()=>{const sec=document.querySelector('section.on');if(!sec)return;
  const f=sec.id+'|'+innerWidth+'|'+[...sec.querySelectorAll(PF_SEL)].map(r=>r.children.length+(r.classList.contains('pfGrid')?'g':'')).join(',');
  if(f!==firma){firma=f;filas();}},1000);
// al cambiar de pantalla por cualquier camino (no solo con showTab), también
try{new MutationObserver(m=>{if(m.some(x=>x.target.tagName==='SECTION'&&x.target.classList.contains('on')))filasYa();}).observe(document.body,{attributes:true,attributeFilter:['class'],subtree:true});}catch(e){}
})();
try{Object.assign(I18N.eu,{'🔄 Volver a buscar':'🔄 Berriz bilatu'});Object.assign(I18N.en,{'🔄 Volver a buscar':'🔄 Search again'});Object.assign(I18N.fr,{'🔄 Volver a buscar':'🔄 Chercher à nouveau'});}catch(e){}
