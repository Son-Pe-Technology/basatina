/* =====================================================================
   MAPAS FIJOS Y TODO EN BOTONES (28 nov. 2026, Pedro) · se carga el último
   1. Mapas de Terremotos y Gasolineras: quietos, para poder subir y bajar la
      pantalla con el dedo encima. Tocar un punto sigue abriendo su ficha y los
      botones ＋ / － siguen funcionando. Con el botón ⛶ (esquina de abajo) el
      mapa se abre en grande y ahí sí se mueve y se amplía con los dedos.
      Para ponerlo en otro mapa: mfMapa('idDelCanvas', ()=>mapa, 'idDeLaFicha').
   2. Las listas desplegables (combustible, grupo, zona) pasan a botones:
      bcChips('idDelSelect','Título'). El select sigue ahí, escondido, y el
      código de siempre lo sigue leyendo.
   3. Flora y fauna: sin dibujitos (emojis) en botones ni en la lista, y cada
      especie en su botón. Gasolineras: cada gasolinera de la lista en su botón.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const css=document.createElement('style');
css.textContent=`
.mfFijo>canvas{touch-action:pan-y!important}
.mfAmp{position:absolute;left:8px;bottom:8px;z-index:2;width:44px;height:44px;border-radius:50%;border:0;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.25);font-size:20px;line-height:44px;padding:0;cursor:pointer;color:#2f4a2a}
#mfBox{position:fixed;inset:0;z-index:99990;background:#f3f6f1;display:flex;flex-direction:column}
#mfBox .mfCab{display:flex;align-items:center;gap:10px;padding:10px 12px;padding-top:max(10px,env(safe-area-inset-top));background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.08)}
#mfBox .mfCab b{flex:1;font-size:16px}
#mfBox .mfMap{flex:1;position:relative;padding:8px}
#mfBox .mfMap>div:not(.mfFi){height:100%}
.mfW{position:relative}
#mfBox .mfAmp{display:none}
#mfBox .mfFi{position:absolute;left:8px;right:8px;bottom:8px;max-height:45vh;overflow:auto;background:#fff;border-radius:16px;padding:12px;box-shadow:0 4px 16px rgba(0,0,0,.2);z-index:3}
#mfBox .mfFi:empty{display:none}
/* listas desplegables → botones */
.bcChips,.gsChips{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 8px}
.bcChips>button,.gsChips>button{flex:0 0 auto;max-width:100%;border:1.5px solid #d6e2d1;background:#fff;color:#2f4a2a;border-radius:999px;padding:8px 14px;font:inherit;font-size:14px;font-weight:700;cursor:pointer;white-space:normal;text-align:center}
.bcChips>button.on,.gsChips>button.on{background:#3d7031;border-color:#3d7031;color:#fff}
.bcTit{font-size:12.5px;color:#5b6660;font-weight:700;margin-top:8px}
label.bcSw{display:inline-flex!important;align-items:center;border:1.5px solid #d6e2d1;background:#fff;color:#2f4a2a;border-radius:999px;padding:8px 14px;font-size:14px;font-weight:700;cursor:pointer;margin-top:8px!important}
label.bcSw input{display:none}
label.bcSw.on{background:#3d7031;border-color:#3d7031;color:#fff}
/* cada fila de la lista, en su botón */
body.bna #biList .card,body.bna #gsList{background:transparent}
body.bna #biList .st,body.bna #gsList .st{background:#fff;border:1.5px solid #d5dfd2!important;border-radius:16px;padding:10px 14px!important;margin:0 0 8px}
body.bna #biList>.card{box-shadow:none;border:0;padding:0}
body.bna #biList .st>div[style*="font-size:22px"]{display:none}
/* 28 nov. 2026 · Comer y dormir: cada sitio en su botón y «Cómo llegar», «Web» y «Llamar» a la derecha */
body.bna #coList.card,body.bna #doList.card,body.bna #paList.card{background:transparent;box-shadow:none;border:0;padding:0}
body.bna #coList>.st,body.bna #doList>.st,body.bna #paList>.st{background:#fff;border:1.5px solid #d5dfd2!important;border-radius:16px;padding:10px 12px 10px 14px!important;margin:0 0 8px}
body.bna #coList>.st>div,body.bna #doList>.st>div,body.bna #paList>.st>div{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:10px;align-items:center}
body.bna #coList>.st>div>*,body.bna #doList>.st>div>*,body.bna #paList>.st>div>*{grid-column:1}
body.bna #coList>.st>div>.row,body.bna #doList>.st>div>.row,body.bna #paList>.st>div>.row{grid-column:2;grid-row:1/span 6;display:flex;flex-direction:column;gap:6px;margin:0!important;align-self:center}
body.bna #coList>.st>div>.row>.btn,body.bna #doList>.st>div>.row>.btn,body.bna #paList>.st>div>.row>.btn{width:100%;margin:0;padding:7px 10px;font-size:13px;white-space:nowrap;justify-content:center;text-align:center}
body.bna #coList>.note,body.bna #doList>.note,body.bna #paList>.note{margin:0 4px 8px}
/* 28 nov. 2026 · Incidencias en carretera: cada incidencia en su botón, dentro de su recuadro */
body.bna #inList .st{background:#f7faf5;border:1.5px solid #d5dfd2!important;border-radius:14px;padding:10px 12px!important;margin-top:8px;cursor:pointer}
body.bna #inList .st:active{background:#e5efe1}
/* 28 nov. 2026 · Qué hay cerca: cada cosa en su botón, dentro del recuadro de su apartado */
body.bna #t-cerca .card .st{background:#f7faf5;border:1.5px solid #d5dfd2!important;border-radius:14px;padding:10px 12px!important;margin-top:8px;cursor:pointer}
/* 28 nov. 2026 · fotos nuevas de los grupos del menú, con su autor en una esquina */
html body.bna #bnaDGrid>.dgroup.m6G[data-m6="Hoy"]{background-image:linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%),url('foto-menu-hoy.webp') !important}
html body.bna #bnaDGrid>.dgroup.m6G[data-m6="Tiempo y ríos"]{background-image:linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%),url('foto-menu-rios.webp') !important}
html body.bna #bnaDGrid>.dgroup.m6G[data-m6="Cuadrilla BasatiNA"]{background-image:linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%),url('foto-menu-cuadrilla.webp') !important}
html body.bna #bnaDGrid>.dgroup.m6G{position:relative}
html body.bna #bnaDGrid>.dgroup.m6G>.m6Cr{position:absolute;right:10px;top:7px;font-size:12px;font-weight:700;font-style:normal;color:#fff;opacity:.9;text-shadow:0 1px 3px rgba(0,0,0,.7);pointer-events:none}`;
document.head.appendChild(css);

/* ---------- 1 · mapa fijo + ampliar ---------- */
let ABIERTO=null;
function mfMapa(cid,getM,fichaId,titulo){const cv=$(cid);if(!cv||cv.dataset.mf)return;cv.dataset.mf='1';
  let w=cv.parentElement;
  // si el mapa comparte recuadro con otras cosas (capas, textos…), se mete en una caja suya para abrir en grande solo el mapa
  const otros=[...w.children].filter(x=>x!==cv&&getComputedStyle(x).position!=='absolute');
  if(otros.length){const d=document.createElement('div');d.className='mfW';cv.before(d);d.appendChild(cv);w=d;}
  if(getComputedStyle(w).position==='static')w.style.position='relative';
  // la ficha que se rellena al tocar un punto: la que se diga o la que se llame como el mapa (inc → inFicha, coMap → coPI…)
  if(fichaId===undefined){const pre=cid.replace(/(c|Map|Mapa|MapA)$/,'');fichaId=['Ficha','Fi','PI','Info','SelI'].map(k=>pre+k).find(k=>$(k))||null;}
  w.classList.add('mfFijo');
  // en pequeño: arrastrar y pellizcar no mueven el mapa (así la pantalla sube y baja); tocar un punto, sí
  let x0=0,y0=0,mov=false;
  w.addEventListener('pointerdown',e=>{if(e.target===cv){x0=e.clientX;y0=e.clientY;mov=false;}},true);
  w.addEventListener('pointermove',e=>{if(e.target!==cv||!w.classList.contains('mfFijo'))return;
    if(Math.abs(e.clientX-x0)+Math.abs(e.clientY-y0)>8)mov=true;e.stopPropagation();},true);
  w.addEventListener('pointerup',e=>{if(e.target!==cv||!w.classList.contains('mfFijo')||!mov)return;
    e.stopPropagation();cv.dispatchEvent(new PointerEvent('pointercancel',{pointerId:e.pointerId}));},true);   // era un deslizamiento, no un toque
  w.addEventListener('wheel',e=>{if(e.target===cv&&w.classList.contains('mfFijo'))e.stopPropagation();},true);
  const b=document.createElement('button');b.className='mfAmp';b.type='button';b.textContent='⛶';b.setAttribute('aria-label','Ampliar el mapa');
  b.onclick=()=>abrir();w.appendChild(b);
  function abrir(){const M=getM();if(!M||ABIERTO)return;let fi=fichaId?$(fichaId):null;if(fi&&w.contains(fi))fi=null;
    const sitio=document.createComment('mapa'),sitioF=document.createComment('ficha');w.before(sitio);if(fi)fi.before(sitioF);
    const box=document.createElement('div');box.id='mfBox';
    const t=titulo||((typeof TITLES!=='undefined'&&typeof BNTAB!=='undefined'&&TITLES[BNTAB])||'Mapa');
    box.innerHTML=`<div class="mfCab"><b></b><button class="btn pri" type="button">✕ Cerrar</button></div><div class="mfMap"></div>`;
    box.querySelector('b').textContent=t;document.body.appendChild(box);
    const zona=box.querySelector('.mfMap');zona.appendChild(w);
    let fiBox=null;if(fi){fiBox=document.createElement('div');fiBox.className='mfFi';zona.appendChild(fiBox);fiBox.appendChild(fi);
      // la ficha vacía no tapa el mapa
      const vacia=()=>fiBox.style.display=fi.textContent.trim()?'':'none';vacia();fiBox._o=new MutationObserver(vacia);fiBox._o.observe(fi,{childList:true,subtree:true});}
    w.classList.remove('mfFijo');const h0=cv.dataset.h,sh0=cv.style.height;
    const alto=()=>{cv.dataset.h=Math.max(250,zona.clientHeight-16);M.draw();M.base();};
    document.documentElement.style.overflow='hidden';
    ABIERTO={cerrar:()=>{if(fiBox&&fiBox._o)fiBox._o.disconnect();sitio.replaceWith(w);if(fi)sitioF.replaceWith(fi);box.remove();
      w.classList.add('mfFijo');if(h0===undefined)delete cv.dataset.h;else cv.dataset.h=h0;cv.style.height=sh0;document.documentElement.style.overflow='';window.removeEventListener('resize',alto);ABIERTO=null;setTimeout(()=>{M.draw();M.base();},30);}};
    box.querySelector('.mfCab button').onclick=ABIERTO.cerrar;window.addEventListener('resize',alto);setTimeout(alto,30);}}
window.mfMapa=mfMapa;
// el «atrás» del móvil cierra el mapa en grande
const _at=window.basatinaAtras;if(typeof _at==='function')window.basatinaAtras=function(){if(ABIERTO){ABIERTO.cerrar();return true;}return _at.apply(this,arguments);};
// al cambiar de pantalla, se cierra
const _st=showTab;showTab=function(){if(ABIERTO)ABIERTO.cerrar();const r=_st.apply(this,arguments);setTimeout(repasa,300);return r;};

const MF_NO=new Set(['cmPick','arpc','dipc','mtr']);   // mtr: el mapa del Inicio se queda como está
const MF_FI={coMapA:'coSelI',prMap:'prInfo',mtr:null,rdc:null};
try{const _NM=NavMap;NavMap=function(id){const M=_NM.apply(this,arguments);if(!MF_NO.has(id))setTimeout(()=>mfMapa(id,()=>M,id in MF_FI?MF_FI[id]:undefined),0);return M;};}catch(e){}
mfMapa('sic',()=>typeof SIM!=='undefined'?SIM:null,'siFicha','🌍 Terremotos y fallas');
mfMapa('gsc',()=>typeof GSM!=='undefined'?GSM:null,'gsFicha','⛽ Gasolineras');

/* ---------- 2 · listas desplegables → botones ---------- */
function bcChips(id,tit){const s=$(id);if(!s||s.dataset.bc)return;s.dataset.bc='1';
  const box=document.createElement('div');box.className='bcChips';box.id=id+'Bc';
  let row=s.parentElement;
  // si el desplegable ya está metido en un chip («Zona ▾», «Grupo ▾» de filtros-chips.js), los botones van debajo de toda esa fila
  if(row.matches('label.msChip')){row.style.display='none';row=row.closest('.msFila')||row;}
  // los botones van debajo de la fila del select (detrás de los que ya se hayan puesto ahí)
  let anc=row;while(anc.nextElementSibling&&anc.nextElementSibling.matches('.bcTit,.bcChips'))anc=anc.nextElementSibling;
  anc.after(box);if(tit)box.before(Object.assign(document.createElement('div'),{className:'bcTit',textContent:tit}));
  s.style.display='none';if(![...row.children].some(x=>x.style.display!=='none'))row.style.display='none';
  const pinta=()=>{const sig=[...s.options].map(o=>o.value+'='+o.textContent).join('|')+'#'+s.value;if(box._sig===sig)return;box._sig=sig;box.innerHTML='';[...s.options].forEach(o=>{const b=document.createElement('button');b.type='button';b.className='btn'+(o.value===s.value?' on':'');
      b.textContent=o.textContent.replace(/\p{Extended_Pictographic}️?\s*/gu,'').trim()||o.textContent;
      b.onclick=()=>{s.value=o.value;s.dispatchEvent(new Event('change',{bubbles:true}));pinta();};box.appendChild(b);});};
  pinta();new MutationObserver(pinta).observe(s,{childList:true,subtree:true});s.addEventListener('change',pinta);box._pinta=pinta;}
window.bcChips=bcChips;
function sw(id){const c=$(id);if(!c)return;const l=c.closest('label');if(!l||l.classList.contains('bcSw'))return;l.classList.add('bcSw');
  const p=()=>l.classList.toggle('on',c.checked);c.addEventListener('change',p);p();}

/* ---------- 3 · sin dibujitos en Flora y fauna ---------- */
const EMO=/\p{Extended_Pictographic}️?‍?\s*/gu;
function sinEmo(root){if(!root)return;const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
  while((n=tw.nextNode())){if(EMO.test(n.nodeValue)){EMO.lastIndex=0;n.nodeValue=n.nodeValue.replace(EMO,'');}EMO.lastIndex=0;}
  root.querySelectorAll('img,svg').forEach(i=>{if(i.closest('button'))i.style.display='none';});}
function flora(){const sec=$('t-biodiversidad');if(!sec)return;
  sinEmo($('biTp'));sinEmo($('biList'));const t=sec.querySelector('.card>b');if(t)sinEmo(t);
  const q=$('biQ');if(q&&/\p{Extended_Pictographic}/u.test(q.placeholder))q.placeholder=q.placeholder.replace(EMO,'');}
function repasa(){
  bcChips('gsFuel','Combustible');sw('biMes');
  // Grupo y Zona: se rellenan al abrir Flora y fauna
  if($('biG')&&$('biG').options.length)bcChips('biG','Grupo');if($('biZ')&&$('biZ').options.length)bcChips('biZ','Zona');
  flora();
  // Comer y dormir (Restaurantes, Alojamientos, Cocina tradicional, Museos): sin emoticonos en toda la pantalla
  ['t-comer','t-dormir','t-cocina','t-patrimonio'].forEach(k=>{const sec=$(k);if(!sec)return;sinEmo(sec);
    sec.querySelectorAll('input[placeholder]').forEach(q=>{if(/\p{Extended_Pictographic}/u.test(q.placeholder))q.placeholder=q.placeholder.replace(EMO,'');});});
  // Comer y dormir: zona, cocina y tipo, en botones (se rellenan al abrir cada pantalla)
  [['coZ','Zona'],['coE','Cocina'],['doZ','Zona'],['paT','Tipo'],['paZ','Zona']].forEach(([k,t])=>{const e=$(k);if(e&&e.options.length)bcChips(k,t);});
  // las cajas de botones de grupo/zona se vuelven a pintar si el código cambia la elección sin avisar
  ['biGBc','biZBc','gsFuelBc','coZBc','coEBc','doZBc','paTBc','paZBc'].forEach(k=>{const b=$(k);if(b&&b._pinta)b._pinta();});}
let tm=0;['t-biodiversidad','t-comer','t-dormir','t-cocina','t-patrimonio'].forEach(k=>{const sb=$(k);if(sb)new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(repasa,40);}).observe(sb,{childList:true,subtree:true});});

/* ---------- 4 · fotos del menú: autor en la esquina; Moverse va cambiando entre sus dos fotos ---------- */
const MOV=[['foto-menu-mov.webp','Miren I.G.'],['foto-menu-mov2.webp','Archivo']];
const mv=MOV[Math.floor(Math.random()*MOV.length)];
// url() no admite var(): se pone la regla con la foto que toca
const cssMv=document.createElement('style');cssMv.textContent=`html body.bna #bnaDGrid>.dgroup.m6G[data-m6="Moverse"]{background-image:linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%),url('${mv[0]}') !important}`;document.head.appendChild(cssMv);
const CR={'Hoy':'Sonia','Localidades':'Pedrito','Tiempo y ríos':'Pedrito','Naturaleza y salidas':'Pedrito','Moverse':mv[1],'Vivir en Navarra':'Pedrito','Ocio':'Pedrito','Cuadrilla BasatiNA':'Foto libre'};   // las demás del menú son fotos de Pedro (24 nov.)
function creditos(){document.querySelectorAll('#bnaDGrid>.dgroup.m6G').forEach(g=>{const k=g.dataset.m6,t=CR[k];if(!t||g.querySelector(':scope>.m6Cr'))return;
  const e=document.createElement('em');e.className='m6Cr';e.textContent='© '+t;g.appendChild(e);});}
const dg=document.getElementById('bnaDGrid')||document.getElementById('drawer');
if(dg)new MutationObserver(creditos).observe(dg,{childList:true,subtree:true});creditos();
repasa();
})();
