/* =====================================================================
   🔭🌙 ASTRONOMÍA Y EL CAMPO (21 nov. 2026, a petición de Pedro)
   Une «🔭 Cielo y astronomía» y «🌙 La Luna y el campo» en una sola pantalla.
   - Se queda la pantalla «astro» (el cielo de hoy y los próximos fenómenos) y debajo
     el calendario lunar del campo, que ahora marca también las lluvias de estrellas,
     eclipses, solsticios y equinoccios de cada mes.
   - El botón «La Luna y el campo» desaparece del menú; si algo abre «lunacampo»,
     se va a «astro».
   Carga después de servicios-ui.js (astro) y mejoras.js (lunacampo).
   ===================================================================== */
(function(){
if(!window.LC||!document.getElementById('t-astro'))return;
const NOM='🔭 Astronomía y el campo';
try{TITLES.astro=NOM;TITLES.lunacampo=NOM;}catch(e){}
try{Object.assign(I18N.eu,{'Astronomía y el campo':'Astronomia eta landa','Fenómenos del mes':'Hilabeteko fenomenoak'});
  Object.assign(I18N.en,{'Astronomía y el campo':'Astronomy and the countryside','Fenómenos del mes':'This month in the sky'});
  Object.assign(I18N.fr,{'Astronomía y el campo':'Astronomie et campagne','Fenómenos del mes':'Phénomènes du mois'});}catch(e){}

// --- menú: fuera «La Luna y el campo» y el otro botón pasa a llamarse «Astronomía y el campo» ---
function menuFix(){document.querySelectorAll('[data-t="lunacampo"]').forEach(b=>{if(b.tagName==='BUTTON'||b.tagName==='A')b.remove();});
  document.querySelectorAll('button[data-t="astro"]').forEach(b=>{if(b.dataset.txt)b.dataset.txt='Astronomía y el campo';
    const w=document.createTreeWalker(b,NodeFilter.SHOW_TEXT);let n;
    while((n=w.nextNode()))if(/Cielo y astronom/i.test(n.nodeValue))n.nodeValue=n.nodeValue.replace(/Cielo y astronomía/i,'Astronomía y el campo');});}
menuFix();[300,1500,4000].forEach(t=>setTimeout(menuFix,t));
const dr=document.getElementById('drawer');if(dr)new MutationObserver(()=>{if(dr.querySelector('[data-t="lunacampo"]')||/Cielo y astronom/.test(dr.textContent))menuFix();}).observe(dr,{childList:true,subtree:true});

// --- la pantalla: cabecera nueva y el calendario del campo debajo del cielo de hoy ---
const sec=document.getElementById('t-astro'),c0=sec.querySelector('.card');
if(c0){const b=c0.querySelector('b');if(b)b.textContent=NOM;const n=c0.querySelector('.note');
  if(n)n.textContent='El cielo de hoy, las fases de la Luna, lluvias de estrellas, eclipses y solsticios, y el calendario lunar de siempre para la huerta y el monte. Cuando llega un fenómeno importante, sale un aviso en el Inicio.';}
const lc=document.getElementById('lcBody');if(lc&&c0)c0.after(lc);
const vieja=document.getElementById('t-lunacampo');if(vieja)vieja.style.display='none';

// abrir «lunacampo» (avisos, búsquedas, enlaces viejos) lleva aquí
const _st=showTab;showTab=function(x){return _st(x==='lunacampo'?'astro':x);};
svHook('astro',()=>LC.ver());

// --- fenómenos de un mes (lluvias de estrellas, eclipses, solsticios…) ---
function feMes(y,m){const L=[],mm=String(m).padStart(2,'0');
  try{for(const [mi,d,t,x] of AS_LL)if(mi===m-1)L.push({f:`${y}-${mm}-${String(d).padStart(2,'0')}`,ico:'🌠',t:'Lluvia de estrellas: '+t,d:'Noche del '+d+' al '+(d+1)+' (aprox.). '+x,ll:1});}catch(e){}
  try{for(const [f,ico,t,d] of AS_FIJOS)if(f.startsWith(`${y}-${mm}`))L.push({f,ico,t,d});}catch(e){}
  L.forEach(e=>{if(!e.ll||typeof moon!=='function')return;const k=moon(new Date(e.f+'T23:00'));
    if(k.ill>60)e.d+=` Ojo: Luna ${k.ill} % iluminada, se verán menos.`;else if(k.ill<25)e.d+=' Sin apenas Luna: buena noche para verla.';});
  return L.sort((a,b)=>a.f.localeCompare(b.f));}

// --- el calendario del campo, con los fenómenos marcados (lo llama lcRender de mejoras.js al pintar) ---
window.lcExtra=function(el,y,m,LCS){const F=feMes(y,m),by={};F.forEach(e=>(by[e.f]=by[e.f]||[]).push(e));
  el.querySelectorAll('.calD').forEach(b=>{const L=by[b.dataset.f];if(!L)return;b.style.position='relative';
    b.insertAdjacentHTML('beforeend',`<span style="position:absolute;top:1px;right:2px;font-size:11px;line-height:1">${L[0].ico}</span>`);b.title=L.map(e=>e.t).join(' · ');});
  // el día elegido, si tiene fenómeno, se cuenta arriba
  const sel=by[LCS],top=el.querySelector('.card');
  if(sel&&top)top.insertAdjacentHTML('beforeend',sel.map(e=>`<div style="margin-top:8px;padding:8px 10px;border-radius:10px;background:linear-gradient(90deg,#1a237e,#4a148c);color:#fff;line-height:1.45"><b>${e.ico} ${esc(e.t)}</b><div style="font-size:13px;opacity:.92">${esc(e.d)}</div></div>`).join(''));
  // leyenda y lista del mes, debajo del calendario
  const cal=el.querySelector('.calG:not(.calH)'),card=cal&&cal.closest('.card');
  if(card)card.insertAdjacentHTML('beforeend',`<div class="note" style="margin-top:4px">🌠 lluvia de estrellas · 🌒💍 eclipse · ☀️🌱🍂 solsticio o equinoccio</div>`+
    (F.length?`<div style="margin-top:8px"><b>✨ Fenómenos del mes</b>${F.map(e=>`<div class="st" style="align-items:flex-start;padding:6px 0"><div style="font-size:22px;line-height:1">${e.ico}</div><div style="flex:1"><b>${esc(e.t)}</b><div class="s">${cap1(fLarga(e.f))}</div><div class="s">${esc(e.d)}</div></div></div>`).join('')}</div>`
      :`<div class="note" style="margin-top:8px">✨ Este mes no hay lluvias de estrellas importantes, eclipses ni solsticios: solo las fases de la Luna.</div>`));};
})();
