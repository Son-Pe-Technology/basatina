/* =====================================================================
   🎂 ZORIONAK: TARJETA DE CUMPLEAÑOS EN EL INICIO (26 nov. 2026, lo pidió Pedro) — se carga el último
   Arriba del Inicio, el día del cumpleaños, una tarjeta alegre con confeti:
     - ZN_FIJAS: felicitaciones que ponen Pedro y Sonia (fecha AAAA-MM-DD, nombre, texto y enlace opcional
       a una página de felicitación). La ve todo el que abre la app ese día.
     - window.bnZorionak(nombre, texto, enlace): la misma tarjeta para usarla desde otras partes
       (p. ej., más adelante, el cumpleaños de cada usuario con cuenta, que solo vería él).
   Se puede cerrar con ×; una vez cerrada no vuelve a salir ese día en ese móvil.
   ===================================================================== */
(function(){
const ZN_FIJAS=[
  {f:'2026-11-27',n:'Josal',t:'Hoy es tu día, y desde Zubiri hasta el último rincón de Navarra lo celebramos contigo. ¡Un abrazo enorme del equipo BasatiNA!',u:'https://basatina.es/zorionak-josal-7k2p/'}
];
const hoy=(()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})();
const st=document.createElement('style');st.textContent=`
.znC{position:relative;overflow:hidden;margin:10px 0 12px;border-radius:20px;padding:16px 46px 16px 16px;color:#2c3a2f;cursor:pointer;
  background:linear-gradient(135deg,#fffaf2 0%,#ffeedd 100%);border:2px solid #f3c9a6;box-shadow:0 6px 18px rgba(198,40,40,.15);display:flex;gap:14px;align-items:center}
.znC .zi{font-size:44px;line-height:1;flex:none;animation:znB 1.6s ease-in-out infinite}
@keyframes znB{50%{transform:translateY(-5px) rotate(-5deg)}}
.znC b{display:block;font-family:Montserrat,system-ui,sans-serif;font-weight:900;font-size:22px;line-height:1.1;color:#c62828}
.znC span.zt{display:block;font-size:14px;line-height:1.4;margin-top:4px}
.znC small{display:block;margin-top:6px;font-weight:800;font-size:12.5px;color:#2e6b2f}
.znC .zx{position:absolute;top:8px;right:10px;width:30px;height:30px;border-radius:15px;border:0;background:rgba(0,0,0,.07);color:#5b6660;font-size:18px;line-height:30px;padding:0}
.znC canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;background:transparent!important;filter:none!important}
.znC>div,.znC .zi{position:relative;z-index:1}.znC .zx{z-index:2}
.znC{background:linear-gradient(135deg,#fffaf2 0%,#ffeedd 100%)!important;color:#2c3a2f!important}`;
document.head.appendChild(st);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// confeti en movimiento: una lluvia fuerte al salir y después cae suave sin parar mientras se ve la tarjeta
function confeti(cv){if(cv._on){cv._mas=70;return;}cv._on=1;const x=cv.getContext('2d'),k=window.devicePixelRatio||1;let W=0,H=0;
  const col=['#c62828','#ffb300','#2e6b2f','#1e88e5','#8e24aa'],P=[];
  const nuevo=arriba=>({x:Math.random()*W,y:arriba?-10-Math.random()*20:-Math.random()*H,v:.6+Math.random()*1.6,r:3+Math.random()*3,a:Math.random()*6,va:(Math.random()-.5)*.2,c:col[(Math.random()*5)|0]});
  (function f(){if(!cv.isConnected)return;
    if(cv.clientWidth!==W||cv.clientHeight!==H){W=cv.clientWidth;H=cv.clientHeight;cv.width=W*k;cv.height=H*k;x.setTransform(k,0,0,k,0,0);}
    if(!P.length)for(let i=0;i<70;i++)P.push(nuevo(false));
    if(cv._mas){for(let i=0;i<cv._mas;i++)P.push(nuevo(true));cv._mas=0;}
    x.clearRect(0,0,W,H);
    for(let i=P.length-1;i>=0;i--){const p=P[i];p.y+=p.v;p.a+=p.va;
      if(p.y>H+10){if(P.length>28)P.splice(i,1);else Object.assign(p,nuevo(true));continue;}   // se queda en unos 28 trocitos cayendo
      x.save();x.translate(p.x+Math.sin(p.a*2)*3,p.y);x.rotate(p.a);x.fillStyle=p.c;x.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);x.restore();}
    requestAnimationFrame(f);})();}
function abre(u){try{if(typeof APP!=='undefined'&&APP&&window.AndroidNet&&window.AndroidNet.openUrl)window.AndroidNet.openUrl(u);else window.open(u,'_blank');}catch(e){}}
function tarjeta(id,nombre,texto,url){
  const S=document.getElementById('t-mtiempo');if(!S||document.getElementById(id))return;
  try{if(localStorage.getItem('znCerrada')===id+hoy)return;}catch(e){}
  S.insertAdjacentHTML('afterbegin',`<div class="znC" id="${id}"><canvas></canvas><span class="zi">🎂</span><div><b>Zorionak, ${esc(nombre)}!</b><span class="zt">${esc(texto)}</span>${url?'<small>Toca para abrir tu felicitación 🎉</small>':''}</div><button class="zx" aria-label="Cerrar">×</button></div>`);
  const c=document.getElementById(id);
  c.querySelector('.zx').onclick=e=>{e.stopPropagation();c.remove();try{localStorage.setItem('znCerrada',id+hoy);}catch(e){}};
  c.onclick=()=>{if(url)abre(url);else confeti(c.querySelector('canvas'));};
  setTimeout(()=>confeti(c.querySelector('canvas')),400);
  // otras partes del Inicio se pintan después y se ponen arriba: la tarjeta vuelve a subir al primer puesto
  let n=0;const sube=setInterval(()=>{const s=document.getElementById('t-mtiempo');if(s&&c.isConnected&&c.parentNode===s&&s.firstElementChild!==c)s.prepend(c);if(++n>8)clearInterval(sube);},700);}
window.bnZorionak=(nombre,texto,url)=>tarjeta('znU',nombre,texto,url);
ZN_FIJAS.filter(z=>z.f===hoy).forEach((z,i)=>tarjeta('znF'+i,z.n,z.t,z.u));
// 🎂 el cumpleaños de cada usuario (Mi cuenta → «Mi cumpleaños», guardado como «MM-DD» en bnCumple): solo con la
// sesión abierta y solo en sus móviles. El 29 de febrero se felicita el 28 los años que no son bisiestos.
function miCumple(){let c='',p=null,ses=null;try{c=localStorage.getItem('bnCumple')||'';p=JSON.parse(localStorage.getItem('cuPerfil')||'null');ses=localStorage.getItem('cmAuth');}catch(e){}
  if(!c||!ses||!p||!p.apodo)return;const md=hoy.slice(5),y=+hoy.slice(0,4),bis=(y%4===0&&y%100!==0)||y%400===0;
  if(c===md||(c==='02-29'&&!bis&&md==='02-28'))tarjeta('znU',p.apodo,'¡Feliz cumpleaños! Que pases un día estupendo. Un abrazo de todo el equipo BasatiNA.','');}
miCumple();setTimeout(miCumple,4000);   // por si la sesión o el perfil se cargan un poco después
})();
