/* =====================================================================
   ✨ INICIO CON VIDA (26 nov. 2026, lo pidió Pedro) — se carga después de ia-noticias.js
   1. «Últimas noticias de BasatiNA» en el Inicio, justo debajo del carrusel de titulares
      (que sigue arriba del todo). Sale SIEMPRE: las últimas que escribió la IA y se publicaron
      (noticias/ia_publicadas.json), aunque no sean de hoy. Sin Sucesos, como en los titulares.
      - Una noticia grande con foto vuestra del tema (la misma de los titulares: tfFoto de
        titulares-fotos.js) que se acerca despacio; si el tema no tiene foto, fondo de color
        del tema con brillo que se mueve.
      - Cada 10 s pasa a la siguiente (con barrita de progreso); debajo, las otras 3 en fila.
      - Al tocar una, se abre Noticias y se despliega esa misma noticia.
   2. Palabra del día en euskera: franja verde con un lauburu que gira despacio y hojas que caen;
      la palabra entra letra a letra.
   3. Refrán del día: franja lila con comillas grandes que flotan; el refrán aparece palabra a palabra
      y la chincheta del pueblo da un saltito.
   (El HTML de la palabra y el refrán lo pinta temas.js; aquí van los estilos.)
   Si el móvil tiene activado «reducir movimiento», no se anima nada.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const X=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const S='body.bna #t-mtiempo';

/* colores por tema (el primero, fuerte; el segundo, claro) */
const CAT={'Deportes':['#0d47a1','#42a5f5'],'Economía':['#1b5e20','#66bb6a'],'Sociedad':['#ad1457','#f06292'],'Cultura':['#5b1f8a','#ab47bc'],
 'Salud':['#006064','#26c6da'],'Educación':['#e65100','#ffa726'],'Medio ambiente':['#33691e','#9ccc65'],'Laboral':['#4e342e','#a1887f'],
 'Administración':['#37474f','#78909c'],'Navarra':['#b71c1c','#ef5350']};
const col=c=>CAT[c]||['#2e6b2a','#7cb342'];
const haceT=d=>{const m=Math.round((Date.now()-Date.parse(d))/60e3);if(!(m>=0))return '';
  if(m<60)return 'hace '+Math.max(1,m)+' min';if(m<24*60)return 'hace '+Math.round(m/60)+' h';
  const dd=Math.round(m/1440);return dd<=1?'ayer':'hace '+dd+' días';};
const meta=x=>[x.pueblo,haceT(x.pub)].filter(Boolean).map(t=>`<span>${X(t)}</span>`).join(' · ');
const foto=x=>{try{return window.tfFoto?tfFoto(x.titulo,x.id):null;}catch(e){return null;}};

/* lauburu (decoración de la palabra en euskera) */
const LAU=(()=>{const arm='<path d="M0 0A5 5 0 0 1 10 0A5 5 0 0 0 20 0A10 10 0 0 0 0 0Z"/>';
  return `<svg class="vvLau" viewBox="-21 -21 42 42" aria-hidden="true"><g fill="currentColor">${[0,90,180,270].map(r=>`<g transform="rotate(${r})">${arm}</g>`).join('')}</g></svg>`;})();

const st=document.createElement('style');st.textContent=`
/* ---------- 1 · Últimas noticias ---------- */
#inNw{display:block;margin:4px 0 6px}
#inNw .inH{display:flex;align-items:center;gap:8px;margin:6px 2px 8px}
#inNw .inH b{font-size:17px;font-weight:900;line-height:1.1;color:#1d1d1d}
#inNw .inH small{font-size:12.5px;color:#5b6660;font-weight:700}
#inNw .inPulso{position:relative;flex:none;width:10px;height:10px;border-radius:50%;background:#e53935}
#inNw .inPulso:after{content:"";position:absolute;inset:-5px;border-radius:50%;border:2px solid #e53935;animation:inPul 1.8s ease-out infinite}
#inNw .inTodas{margin-left:auto;border:1.5px solid #2e6b2a;background:#fff;color:#2e6b2a;border-radius:999px;padding:5px 12px;font:inherit;font-size:13px;font-weight:800;cursor:pointer}
#inNw .inL{position:relative;display:block;border-radius:20px;overflow:hidden;cursor:pointer;background:#fff;
  box-shadow:0 6px 20px -6px rgba(29,45,35,.28);border:1px solid rgba(29,45,35,.06);animation:inIn .55s cubic-bezier(.2,.8,.2,1)}
#inNw .inF{position:relative;height:168px;overflow:hidden;background:linear-gradient(135deg,var(--c1),var(--c2))}
#inNw .inF>i{position:absolute;inset:0;background:center/cover no-repeat;animation:inZoom 14s ease-in-out infinite alternate}
#inNw .inF.sin>i{background:radial-gradient(circle at 20% 30%,rgba(255,255,255,.35),transparent 45%),radial-gradient(circle at 80% 70%,rgba(255,255,255,.22),transparent 40%);
  background-size:200% 200%;animation:inBrillo 9s ease-in-out infinite alternate}
#inNw .inF:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 30%,rgba(0,0,0,.72))}
#inNw .inF .inTx{position:absolute;left:0;right:0;bottom:0;z-index:1;padding:12px 14px;color:#fff}
#inNw .inChip{display:inline-flex;align-items:center;gap:5px;background:var(--c1);color:#fff;border-radius:999px;padding:3px 10px;font-size:11.5px;font-weight:900;letter-spacing:.02em;box-shadow:0 2px 6px rgba(0,0,0,.25)}
#inNw .inChip:before{content:"";width:6px;height:6px;border-radius:50%;background:#fff;opacity:.9}
#inNw .inF .inT{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;margin-top:6px;font-size:18px;font-weight:900;line-height:1.22;text-shadow:0 1px 8px rgba(0,0,0,.45)}
#inNw .inF .inM{font-size:12px;opacity:.92;margin-top:4px}
#inNw .inX{padding:10px 14px 13px;font-size:14px;line-height:1.42;color:#2a302c}#inNw .inX>span{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#inNw .inBar{position:absolute;left:0;bottom:0;height:3px;width:100%;background:rgba(0,0,0,.06)}
#inNw .inBar>i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--c1),var(--c2));animation:inProg 10s linear forwards}
#inNw .inLs{display:flex;flex-direction:column;gap:8px;margin-top:10px}
#inNw .inR{position:relative;display:flex;align-items:center;gap:11px;padding:9px 12px 9px 9px;border-radius:16px;background:#fff;cursor:pointer;
  border:1px solid rgba(29,45,35,.06);box-shadow:0 3px 12px -6px rgba(29,45,35,.22);overflow:hidden;opacity:0;animation:inSube .5s ease forwards}
#inNw .inR:before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,var(--c1),var(--c2))}
#inNw .inR .inMin{flex:none;width:60px;height:60px;border-radius:12px;background:linear-gradient(135deg,var(--c1),var(--c2)) center/cover no-repeat;margin-left:4px;
  display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:22px}
#inNw .inR>div{flex:1;min-width:0}
#inNw .inR .inK{font-size:11.5px;font-weight:900;color:var(--c1)}
#inNw .inR b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:14.5px;font-weight:800;line-height:1.25;color:#1d1d1d;margin-top:1px}
#inNw .inR small{display:block;font-size:12px;color:#5b6660;margin-top:2px}
#inNw .inL:active,#inNw .inR:active{transform:scale(.985);transition:transform .12s}
#t-noticias .iaN.inVer{animation:inVer 2.2s ease}
@keyframes inPul{0%{transform:scale(.4);opacity:1}100%{transform:scale(1.6);opacity:0}}
@keyframes inIn{from{opacity:0;transform:translateY(8px) scale(.985)}to{opacity:1;transform:none}}
@keyframes inSube{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes inZoom{from{transform:scale(1)}to{transform:scale(1.09) translate(-1.5%,-1%)}}
@keyframes inBrillo{from{background-position:0% 0%}to{background-position:100% 100%}}
@keyframes inProg{to{width:100%}}
@keyframes inVer{0%,40%{background:#fff4d6}100%{background:transparent}}

/* ---------- 2 y 3 · palabra y refrán con vida ---------- */
${S} #ifPar>#pdCard.viv,${S} #ifPar>#rfCard.viv,#pdCard.viv,#rfCard.viv{padding:0!important;gap:0!important;display:flex!important;flex-direction:column!important;align-items:stretch!important;
  justify-content:flex-start!important;overflow:hidden;border-radius:20px!important;background:#fff!important;min-height:168px;cursor:pointer;
  box-shadow:0 6px 20px -8px rgba(29,45,35,.3)!important;border:1px solid rgba(29,45,35,.06)!important}
#pdCard.viv .vvBand,#rfCard.viv .vvBand{position:relative;overflow:hidden;min-height:46px;padding:10px 12px;display:flex;align-items:center;flex:none}
#pdCard.viv .vvBand{background:linear-gradient(120deg,#1f5a1c,#3d7031 55%,#6aa84f);background-size:200% 100%;animation:vvMar 8s ease-in-out infinite alternate}
#rfCard.viv .vvBand{background:linear-gradient(120deg,#4a1878,#6a2fa3 55%,#a66ad8);background-size:200% 100%;animation:vvMar 8s ease-in-out infinite alternate}
${S} #pdCard.viv .pdK,${S} #rfCard.viv .rfK,#pdCard.viv .pdK,#rfCard.viv .rfK{position:relative;z-index:1;color:#fff!important;margin:0!important;padding:0!important;min-height:0!important;
  font-size:13.5px!important;font-weight:900!important;line-height:1.2!important;text-transform:none!important;letter-spacing:0!important;display:flex!important;align-items:center;gap:7px;padding-right:30px!important}
${S} #pdCard.viv .pdK .icS,${S} #rfCard.viv .rfK .icS{background:rgba(255,255,255,.22)!important;color:#fff!important;width:26px!important;height:26px!important;padding:5px!important;border-radius:8px}
#pdCard.viv .vvLau{position:absolute;right:-8px;top:50%;width:52px;height:52px;margin-top:-26px;color:rgba(255,255,255,.28);animation:vvGira 22s linear infinite}
#pdCard.viv .vvHoja{position:absolute;top:-14px;width:10px;height:14px;border-radius:0 100% 0 100%;background:#c5e1a5;opacity:.85;animation:vvCae 6s linear infinite}
#pdCard.viv .vvHoja.h1{left:46%}#pdCard.viv .vvHoja.h2{left:72%;background:#ffe082;animation-delay:3s;animation-duration:7.5s}
${S} #pdCard.viv .pdX,#pdCard.viv .pdX{display:flex!important;flex-direction:column;flex:1;padding:12px 12px 12px;overflow:visible!important}
${S} #pdCard.viv .pdP,#pdCard.viv .pdP{margin:0!important;display:flex;flex-direction:column;gap:3px;white-space:normal!important}
${S} #pdCard.viv .pdP b.vvW,#pdCard.viv .vvW{font-size:25px!important;font-weight:900;color:#1b5e20!important;line-height:1.1;overflow-wrap:anywhere}
#pdCard.viv .vvW>i{font-style:normal;display:inline-block;opacity:0;animation:vvLetra .5s cubic-bezier(.3,1.6,.5,1) forwards}
#pdCard.viv .vvEq{font-size:15px;color:#3b463f;font-weight:700;opacity:0;animation:vvAparece .5s .9s ease forwards}
#pdCard.viv .vvEq:before{content:"= ";color:#7cb342;font-weight:900}
${S} #pdCard.viv .pdN,#pdCard.viv .pdN{display:none;font-size:13px!important;line-height:1.35;color:#5b6660!important;margin-top:8px;padding:7px 9px;border-radius:10px;background:#f1f7ee}
${S} #pdCard.viv.abierta .pdN,#pdCard.viv.abierta .pdN{display:block}
#pdCard.viv .vvMas{margin-top:auto;padding-top:8px;font-size:12px;font-weight:800;color:#3d7031}
#pdCard.viv .vvMas:before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:#7cb342;margin-right:6px;vertical-align:1px;animation:vvLate 1.6s ease-in-out infinite}
#pdCard.viv.abierta .vvMas{display:none}
#rfCard.viv .vvCom{position:absolute;right:8px;top:-12px;font-family:Georgia,serif;font-size:64px;line-height:1;color:rgba(255,255,255,.26);animation:vvFlota 4.5s ease-in-out infinite}
#rfCard.viv .vvCom.c2{right:34px;top:2px;font-size:40px;color:rgba(255,255,255,.16);animation-delay:1.5s}
${S} #rfCard.viv .rfX,#rfCard.viv .rfX{display:flex!important;flex-direction:column;gap:6px;padding:12px 12px 4px!important;flex:1}
${S} #rfCard.viv .rfT,#rfCard.viv .rfT{font-family:Georgia,serif;font-style:italic;font-size:15.5px!important;line-height:1.35!important;color:#2a1640!important;display:block!important;-webkit-line-clamp:unset!important}
#rfCard.viv .rfT>i{font-style:italic;display:inline-block;opacity:0;animation:vvPalabra .55s ease forwards}
${S} #rfCard.viv .rfM,#rfCard.viv .rfM{display:block!important;font-size:12px!important;line-height:1.35;color:#6a2fa3!important;font-weight:700}
#rfCard.viv .vvPin{display:inline-block;margin:0 6px 0 1px;vertical-align:-1px;width:10px;height:10px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#e53935;animation:vvSalta 2.4s ease-in-out infinite}
${S} #rfCard.viv .rfB,#rfCard.viv .rfB{margin:6px 12px 12px!important;align-self:flex-start;background:linear-gradient(120deg,#6a2fa3,#a66ad8)!important;color:#fff!important;border:none!important;
  border-radius:999px!important;padding:7px 14px!important;font-weight:800!important;font-size:13px!important;box-shadow:0 3px 10px -3px rgba(106,47,163,.6)}
@keyframes vvMar{from{background-position:0% 50%}to{background-position:100% 50%}}
@keyframes vvGira{to{transform:rotate(360deg)}}
@keyframes vvCae{0%{transform:translateY(0) rotate(0);opacity:0}10%{opacity:.9}100%{transform:translateY(72px) translateX(-18px) rotate(220deg);opacity:0}}
@keyframes vvLetra{from{opacity:0;transform:translateY(10px) scale(.6)}to{opacity:1;transform:none}}
@keyframes vvAparece{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
@keyframes vvPalabra{from{opacity:0;transform:translateY(6px);filter:blur(3px)}to{opacity:1;transform:none;filter:none}}
@keyframes vvFlota{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}
@keyframes vvSalta{0%,70%,100%{transform:rotate(-45deg) translate(0,0)}80%{transform:rotate(-45deg) translate(2px,-2px)}90%{transform:rotate(-45deg) translate(0,0)}}
@keyframes vvLate{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:.5}}
@media (prefers-reduced-motion:reduce){#inNw *,#inNw *:before,#inNw *:after,#pdCard.viv *,#rfCard.viv *,#pdCard.viv .vvBand,#rfCard.viv .vvBand{animation:none!important;opacity:1!important}}`;
document.head.appendChild(st);

/* ---------- palabra: lauburu en la franja (temas.js la vuelve a pintar al volver al Inicio) ---------- */
function lauburu(){const b=document.querySelector('#pdCard.viv .vvBand');if(b&&!b.querySelector('.vvLau'))b.insertAdjacentHTML('beforeend',LAU);}

/* ---------- 1 · Últimas noticias ---------- */
let D=null,Dt=0,LI=0,TM=null;
async function carga(){if(D&&Date.now()-Dt<10*60e3)return D;Dt=Date.now();
  try{D=await jsLoad('noticias/ia_publicadas.json',{items:[]},true);}catch(e){Dt=0;}return D||{items:[]};}
const lista=()=>((D||{}).items||[]).filter(x=>x&&x.titulo&&x.cat!=='Sucesos').slice(0,4);
function sitio(){const H=$('bnaHome');const now=H&&H.querySelector('.bnaNow');if(!now)return null;
  let el=$('inNw');if(!el){el=document.createElement('section');el.id='inNw';}
  const rz=$('rzTk'),hy=$('iaHoy'),tras=rz&&rz.parentNode===now?rz:hy&&hy.parentNode===now?hy:null;
  if(tras){if(tras.nextElementSibling!==el)tras.after(el);}else if(now.firstElementChild!==el)now.prepend(el);
  return el;}
function pinta(){const el=sitio();if(!el)return;const L=lista();
  if(!L.length){el.style.display='none';return;}el.style.display='';
  LI=LI%L.length;const x=L[LI],c=col(x.cat),f=foto(x),otras=L.filter((y,i)=>i!==LI);
  el.innerHTML=`<div class="inH"><span class="inPulso"></span><b><span>Últimas noticias</span></b><small><span>de BasatiNA</span></small><button class="inTodas"><span>Ver todas</span> ›</button></div>
   <article class="inL" data-id="${X(x.id)}" style="--c1:${c[0]};--c2:${c[1]}">
    <div class="inF${f?'':' sin'}"><i${f?` style="background-image:url('${X(f)}')"`:''}></i>
     <div class="inTx"><span class="inChip"><span>${X(x.cat||'Navarra')}</span></span><div class="inT">${X(x.titulo)}</div><div class="inM">${meta(x)}</div></div></div>
    <div class="inX"><span>${X(x.texto)}</span></div>${L.length>1?'<div class="inBar"><i></i></div>':''}</article>
   <div class="inLs">${otras.map((y,i)=>{const k=col(y.cat),g=foto(y);
     return `<div class="inR" data-id="${X(y.id)}" style="--c1:${k[0]};--c2:${k[1]};animation-delay:${150+i*110}ms">
      <span class="inMin"${g?` style="background-image:url('${X(g)}')"`:''}>${g?'':X((y.cat||'N')[0])}</span>
      <div><div class="inK"><span>${X(y.cat||'Navarra')}</span></div><b>${X(y.titulo)}</b><small>${meta(y)}</small></div></div>`;}).join('')}</div>`;
  el.querySelector('.inTodas').onclick=e=>{e.stopPropagation();showTab('noticias');};
  el.querySelectorAll('[data-id]').forEach(n=>n.onclick=()=>abre(n.dataset.id));
  clearTimeout(TM);if(L.length>1)TM=setTimeout(()=>{if(enInicio()){LI=(LI+1)%L.length;pinta();}else TM=setTimeout(pinta,4000);},10000);}
const enInicio=()=>!document.hidden&&(typeof BNTAB==='undefined'||BNTAB==='mtiempo');
/* al tocar: abre Noticias y despliega esa noticia */
function abre(id){showTab('noticias');let n=0;
  const busca=()=>{const e=document.querySelector(`#iaPub .iaN[data-id="${CSS.escape(id)}"]`);
    if(e){e.classList.add('abierta','inVer');e.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>e.classList.remove('inVer'),2400);}
    else if(n++<25)setTimeout(busca,150);};
  setTimeout(busca,120);}
async function arranca(){await carga();pinta();}
/* si el Inicio se vuelve a pintar, el bloque vuelve a su sitio */
const H=$('bnaHome');if(H)new MutationObserver(()=>{const el=$('inNw'),now=H.querySelector('.bnaNow');
  if(now&&(!el||el.parentNode!==now||($('rzTk')&&$('rzTk').nextElementSibling!==el)))pinta();}).observe(H,{childList:true,subtree:true});
const T=$('t-mtiempo');if(T)new MutationObserver(lauburu).observe(T,{childList:true,subtree:true});
setTimeout(arranca,1500);setTimeout(()=>{if(D)pinta();},6000);   // a los 6 s ya están las fotos de los temas
setInterval(()=>{if(enInicio())carga().then(()=>{});},10*60e3);
const _st=showTab;showTab=function(t){_st.apply(this,arguments);if(t==='mtiempo'){lauburu();carga().then(pinta);}};
lauburu();
})();
