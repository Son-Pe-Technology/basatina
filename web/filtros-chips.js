/* =====================================================================
   🏷️ FILTROS EN FILA DE CHIPS (22 nov. 2026, propuesta A que eligió Pedro) — se carga el último
   Cambia los desplegables grandes de filtros (zona, dificultad, distancia…) por una fila de botoncitos
   que se desliza de lado: «Zona ▾», «Dificultad ▾»… El filtro que está puesto se pone verde con su valor
   y una ✕ para quitarlo. Sin emojis y sin textos cortados.

   CÓMO FUNCIONA (para no romper nada): los <select> de siempre NO se borran; se meten dentro de cada chip,
   invisibles y del mismo tamaño que el chip. Al tocar el chip se abre la lista normal del móvil, y el código
   de cada pantalla sigue escuchando sus mismos select (onchange), así que no hay que tocarlo.
   Las casillas (p. ej. «Solo rutas circulares») pasan a ser un chip que se enciende y se apaga.
   El «ordenar» va aparte, como texto verde a la derecha del número de resultados.

   Para usarlo en otra pantalla: msChips(contenedor, [{el:select, nombre:'Zona'}, {el:checkbox, nombre:'Circular', tipo:'check'}…],
   {orden:{el:select, junto:elementoDelNúmero}}).
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const st=document.createElement('style');st.textContent=`
.msFila{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 8px;margin:2px 0 4px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.msFila::-webkit-scrollbar{display:none}
.msChip{position:relative;flex:none;display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 12px 0 14px;border-radius:19px;
  background:#fff;color:#1d1d1d;border:1px solid #dfe6dc;font-weight:700;font-size:14px;white-space:nowrap;box-sizing:border-box;cursor:pointer;user-select:none}
.msChip>select,.msChip>input{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;margin:0!important;opacity:0!important;
  cursor:pointer;z-index:1;font-size:16px!important;-webkit-appearance:none;appearance:none}
.msChip .msV{color:#3d7031;display:inline-flex}
.msChip.on{background:#e5efe1;color:#2b5222;border:1.5px solid #3d7031;padding-right:6px}
.msChip .msX{position:relative;z-index:2;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:14px;color:#2b5222}
.msChip .msX:active{background:rgba(61,112,49,.15)}
.msChip.on .msV{display:none}.msChip:not(.on) .msX{display:none}
.msChip.chk:not(.on) .msX{display:none}.msChip.chk .msV{display:none}
.msOrdenF{display:flex;align-items:center;justify-content:space-between;gap:8px}
.msOrdenF>.note{margin:0!important;flex:1 1 auto;min-width:0}
.msOrden{position:relative;flex:none;display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 6px;color:#3d7031;font-weight:700;font-size:14px;white-space:nowrap;cursor:pointer}
.msOrden>select{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;margin:0!important;opacity:0!important;cursor:pointer;font-size:16px!important}`;
document.head.appendChild(st);
const EMO=/^(?:[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}][\u{FE0F}\u{200D}\u{20E3}]*)+\s*/u;
const limpio=t=>String(t||'').replace(EMO,'').replace(/\s*\(\d+\)\s*$/,'').trim();
const tr=t=>{try{return window.T?T(t):t;}catch(e){return t;}};
const pon=(n,t)=>{if(n.textContent!==t)n.textContent=t;};
const V='<span class="msV"><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9 L12 15 L18 9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
const X='<span class="msX" role="button" aria-label="Quitar filtro"><svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></span>';
const ORD='<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const filas=[];
function pinta(c){const el=c.el;
  if(c.tipo==='check'){c.chip.classList.toggle('on',!!el.checked);pon(c.txt,tr(c.nombre));}
  else{const o=el.options[el.selectedIndex],on=!!(el.value&&o);c.chip.classList.toggle('on',on);pon(c.txt,on?limpio(o.text):tr(c.nombre));}
  // si la pantalla esconde el filtro (p. ej. el de cadenas solo con «Supermercados»), se esconde el chip
  c.chip.style.display=el.style.display==='none'?'none':'';}
function pintaOrden(o){const el=o.el,op=el.options[el.selectedIndex];pon(o.txt,op?limpio(op.text):'');o.box.style.display=el.style.display==='none'?'none':'';}
window.msChips=function(antes,items,opt){if(!antes||antes.dataset.msChips)return;antes.dataset.msChips=1;opt=opt||{};
  const fila=document.createElement('div');fila.className='msFila';antes.parentNode.insertBefore(fila,antes);
  const cs=[];
  items.forEach(it=>{const el=it.el;if(!el)return;const chip=document.createElement('label');chip.className='msChip'+(it.tipo==='check'?' chk':'');
    const txt=document.createElement('span');chip.appendChild(txt);chip.insertAdjacentHTML('beforeend',V+X);
    const lab=el.closest('label');el.style.removeProperty('flex');el.style.removeProperty('width');
    chip.appendChild(el);if(lab&&lab!==chip&&!lab.querySelector('select,input'))lab.remove();
    fila.appendChild(chip);const c={el,chip,txt,nombre:it.nombre,tipo:it.tipo};cs.push(c);
    el.addEventListener('change',()=>pinta(c));
    chip.querySelector('.msX').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();
      if(c.tipo==='check')el.checked=false;else el.value='';el.dispatchEvent(new Event('change',{bubbles:true}));pinta(c);});
    pinta(c);});
  let o=null;
  if(opt.orden&&opt.orden.el){const el=opt.orden.el,box=document.createElement('label');box.className='msOrden';box.innerHTML=ORD;
    const txt=document.createElement('span');box.appendChild(txt);el.style.removeProperty('flex');el.style.removeProperty('width');box.appendChild(el);
    const j=opt.orden.junto;if(j){const f=document.createElement('div');f.className='msOrdenF';j.parentNode.insertBefore(f,j);f.appendChild(j);f.appendChild(box);}
    else fila.appendChild(box);
    o={el,box,txt};el.addEventListener('change',()=>pintaOrden(o));pintaOrden(o);}
  // el contenedor viejo de los desplegables queda vacío: fuera
  if(!items.some(it=>it.el===antes)&&!antes.querySelector('select,input,button'))antes.style.display='none';
  filas.push({cs,o,fila});};
// el código de cada pantalla a veces cambia el valor o rellena las opciones sin avisar: se repasa cada poco (solo lo que se ve)
setInterval(()=>filas.forEach(f=>{if(!f.fila.offsetParent)return;f.cs.forEach(pinta);if(f.o)pintaOrden(f.o);}),700);

/* ---------- dónde se usa ---------- */
// 🥾 NA a Pie (rutas-ui.js): sin emojis en las categorías y filtros en chips
(function(){const F=document.querySelector('#ruLista .ruFil');if(!F)return;
  document.querySelectorAll('#ruG button').forEach(b=>{b.textContent=limpio(b.textContent);});
  const q=$('ruQ');if(q)q.placeholder=limpio(q.placeholder);
  msChips(F,[{el:$('ruZ'),nombre:'Zona'},{el:$('ruD'),nombre:'Dificultad'},{el:$('ruK'),nombre:'Distancia'},{el:$('ruC'),nombre:'Circular',tipo:'check'}],
    {orden:{el:$('ruO'),junto:$('ruN')}});})();
// 🛏️ Dónde dormir · 🍽️ Dónde comer · 🏛️ Museos y monumentos
(function(){const z=$('doZ');if(z)msChips(z.parentNode,[{el:z,nombre:'Zona'}]);})();
(function(){const z=$('coZ');if(z)msChips(z.parentNode,[{el:z,nombre:'Zona'},{el:$('coE'),nombre:'Cocina'}]);})();
(function(){const z=$('paZ');if(z)msChips(z.parentNode,[{el:$('paT'),nombre:'Tipo'},{el:z,nombre:'Zona'}]);})();
// 🦋 Flora y fauna · 🏞️ Espacios protegidos · 🛒 Supermercados (cadena) · 📰 Noticias (medio)
(function(){const g=$('biG');if(g)msChips(g.parentNode,[{el:g,nombre:'Grupo'},{el:$('biZ'),nombre:'Zona'}]);})();
(function(){const f=$('epFig');if(f)msChips(f,[{el:f,nombre:'Figura de protección'}]);})();
(function(){const m=$('suM');if(m)msChips(m,[{el:m,nombre:'Cadena'}]);})();
(function(){const m=$('nwF');if(m)msChips(m,[{el:m,nombre:'Medio'}]);})();
try{Object.assign(I18N.eu,{'Zona':'Eremua','Dificultad':'Zailtasuna','Distancia':'Distantzia','Circular':'Zirkularra','Cocina':'Sukaldaritza','Tipo':'Mota','Grupo':'Taldea','Figura de protección':'Babes-figura','Cadena':'Katea','Medio':'Hedabidea'});
  Object.assign(I18N.en,{'Zona':'Area','Dificultad':'Difficulty','Distancia':'Distance','Circular':'Loop','Cocina':'Cuisine','Tipo':'Type','Grupo':'Group','Figura de protección':'Protection type','Cadena':'Chain','Medio':'Source'});
  Object.assign(I18N.fr,{'Zona':'Zone','Dificultad':'Difficulté','Distancia':'Distance','Circular':'Circulaire','Cocina':'Cuisine','Tipo':'Type','Grupo':'Groupe','Figura de protección':'Type de protection','Cadena':'Enseigne','Medio':'Média'});}catch(e){}
})();
