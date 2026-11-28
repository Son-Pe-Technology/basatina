/* =====================================================================
   TODAS LAS LISTAS EN BOTONES (28 nov. 2026, Pedro: «mejor pon todas en botones»)
   En cualquier pantalla, las filas de una lista (estaciones, terremotos, zonas, nieve,
   plantas, fenómenos de la Luna, centrales…) se ven como botones dentro de su recuadro,
   igual que en Ríos, Qué hay cerca e Incidencias.
   Cómo sabe qué es una lista: dos o más filas seguidas del mismo tipo, a todo lo ancho
   de su recuadro. Las tarjetas, los mapas, las filas de botones y el Inicio no se tocan.
   Para que una fila NO se convierta: ponerle la clase «noFB».
   ===================================================================== */
(function(){
const css=document.createElement('style');
css.textContent=`
body.bna .fbFila{background:#f7faf5!important;border:1.5px solid #d5dfd2!important;border-radius:14px!important;padding:10px 12px!important;margin:8px 0 0!important;box-shadow:none!important}
body.bna .fbFila:first-child{margin-top:4px!important}
body.bna .fbFila[data-c],body.bna .fbFila[data-z],body.bna .fbFila[data-i],body.bna .fbFila[onclick],body.bna details.fbFila>summary{cursor:pointer}
body.bna .fbFila:active{background:#e5efe1!important}
body.bna details.fbFila>summary{list-style:none}
body.bna details.fbFila>summary::-webkit-details-marker{display:none}
body.bna details.fbFila>summary:after{content:'›';float:right;color:#6b7a70;font-size:18px;line-height:1;transition:transform .2s}
body.bna details.fbFila[open]>summary:after{transform:rotate(90deg)}`;
document.head.appendChild(css);
const NO_SEC=/^t-(mtiempo|mapa|j[a-z]+)$/;          // Inicio, mapa del simulador y juegos: como están
const NO_DENTRO='.pfGrid,.msFila,.bcChips,.gsChips,.seg,.mfW,.mfFijo,#mfBox,.iaBt,.kpi,.nvDias,#biList,#gsList,#coList,#doList,#paList,.noFB';
const firma=e=>e.tagName+'|'+e.className.replace(/\bfbFila\b/,'').trim();
function repasa(sec){if(!sec||NO_SEC.test(sec.id))return;
  const vistos=new Set();
  sec.querySelectorAll('div,details,a,li').forEach(e=>{
    const p=e.parentElement;if(!p||vistos.has(p)||p===sec||p.tagName==='SECTION')return;
    vistos.add(p);
    if(p.closest(NO_DENTRO))return;
    const K=[...p.children];if(K.length<2)return;
    // grupos de hermanas iguales
    const G={};K.forEach(k=>{const f=firma(k);(G[f]=G[f]||[]).push(k);});
    Object.values(G).forEach(L=>{if(L.length<2)return;const W=p.clientWidth;if(!W)return;
      L.forEach(k=>{if(k.classList.contains('fbFila')||k.classList.contains('card')||k.classList.contains('noFB')||k.classList.contains('note'))return;   // las notas de texto, como están
        if(!/^(DIV|DETAILS|A|LI)$/.test(k.tagName))return;
        const cs=getComputedStyle(k);if(cs.display==='none'||cs.position==='absolute'||cs.position==='fixed')return;
        if(k.offsetWidth<W*0.8||k.offsetHeight<28||k.offsetHeight>600)return;   // filas a todo lo ancho, no fichas sueltas
        if(k.querySelector('canvas,.card,input,select,textarea'))return;
        if(k.closest('.fbFila'))return;                                         // dentro de otra fila ya convertida: no
        if(!k.textContent.trim())return;
        k.classList.add('fbFila');});});});}
let t=0;const ya=()=>{clearTimeout(t);t=setTimeout(()=>{try{repasa(document.querySelector('section.on'));}catch(e){console.log('filas-botones',e);}},120);};
new MutationObserver(m=>{const on=document.querySelector('section.on');
  if(m.some(x=>(x.target.tagName==='SECTION'&&x.attributeName==='class')||(on&&on.contains(x.target)&&(x.type==='childList'||x.attributeName==='open'))))ya();})
  .observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','open']});
const _st=showTab;showTab=function(){const r=_st.apply(this,arguments);ya();setTimeout(ya,600);return r;};
ya();
})();
