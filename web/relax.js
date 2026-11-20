/* =====================================================================
   🌙 PARA RELAJARSE (20 nov. 2026) — NA Salud. Se carga después de voluntariado.js
   - Sonidos para relajarse o conciliar el sueño: lluvia, tormenta lejana, mar, bosque con pájaros,
     río de montaña, hoguera, ruido rosa y ruido marrón (RX_S).
   - Los archivos están en docs/sonidos/*.webm → https://basatina.es/sonidos/… (no van dentro de la app para
     no hacer más pesada cada actualización: se descargan solo al tocarlos). Son sonidos sintéticos hechos con
     tools/sonidos_relax.py (sin grabaciones de nadie) y empalman consigo mismos, así que suenan sin cortes
     todo el tiempo que se quiera.
   - Temporizador (RX_MIN): al acabar se apaga poco a poco en el último minuto. Sigue sonando con la pantalla
     apagada o en otra pantalla de la app (botón flotante 🌙 para pararlo).
   - «Respira conmigo»: círculo que crece y se encoge (4 s tomar aire, 6 s soltarlo).
   Para añadir un sonido: generarlo en tools/sonidos_relax.py y añadir una línea en RX_S.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const nuevo=(t,g,l,sc,ic,fam)=>{try{window.amNuevo(t,g,l,sc,ic,fam);}catch(e){}};
const hook=(t,fn)=>{if(window.svHook)svHook(t,fn);};
const BASE=(/(^|\.)basatina\.es$/.test(location.hostname)?'/':'https://basatina.es/')+'sonidos/';
const RX_S=[
 ['lluvia','🌧️','Lluvia','Lluvia constante sobre el campo. La más pedida para dormir.','#1e88e5'],
 ['tormenta','⛈️','Tormenta lejana','Lluvia con truenos suaves, a lo lejos.','#3949ab'],
 ['mar','🌊','Olas del mar','Olas que llegan y se van, despacio.','#00838f'],
 ['bosque','🐦','Bosque y pájaros','Viento entre los árboles y pájaros (mirlo, petirrojo, cuco…).','#2e7d32'],
 ['rio','🏞️','Río de montaña','Agua corriendo entre piedras, como un regato del Pirineo.','#00897b'],
 ['hoguera','🔥','Hoguera','El fuego de la chimenea crepitando.','#e65100'],
 ['rosa','🌸','Ruido rosa','Un «shhh» suave y uniforme. Tapa ruidos de la calle.','#ad1457'],
 ['marron','🟤','Ruido marrón','Como el rumor grave de una cascada lejana. Más profundo que el rosa.','#6d4c41']];
const RX_MIN=[15,30,45,60,90,0];   // 0 = sin fin
let A=null,CUR=null,MIN=30,FIN=0,VOL=.7,TK=0;
try{const g=JSON.parse(localStorage.getItem('bnRelax')||'{}');if(g.min!=null)MIN=g.min;if(g.vol!=null)VOL=g.vol;}catch(e){}
const guarda=()=>{try{localStorage.setItem('bnRelax',JSON.stringify({min:MIN,vol:VOL}));}catch(e){}};

const st=document.createElement('style');st.textContent=`
.rxG{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:8px}
.rxB{position:relative;border:0;border-radius:18px;padding:14px 12px;text-align:left;color:#fff;font:inherit;cursor:pointer;min-height:104px;overflow:hidden;box-shadow:0 6px 16px -10px rgba(0,0,0,.6)}
.rxB i{font-style:normal;font-size:30px;display:block;line-height:1}.rxB b{display:block;font-size:15.5px;margin-top:6px}.rxB small{display:block;font-size:12px;opacity:.9;line-height:1.3;margin-top:2px}
.rxB.on{outline:3px solid #fff;outline-offset:-6px}.rxB .rxP{position:absolute;top:10px;right:12px;font-size:18px}
.rxB.on .rxEq{display:flex}.rxEq{display:none;position:absolute;bottom:10px;right:12px;gap:3px;align-items:flex-end;height:16px}
.rxEq span{width:3px;background:#fff;border-radius:2px;animation:rxEq 1s ease-in-out infinite}.rxEq span:nth-child(2){animation-delay:.25s}.rxEq span:nth-child(3){animation-delay:.5s}
@keyframes rxEq{0%,100%{height:4px}50%{height:16px}}
.rxChips{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.rxChips button{border:1px solid var(--line);background:none;color:inherit;border-radius:18px;padding:6px 12px;font:inherit;font-size:14px;cursor:pointer}
.rxChips button.on{background:#5e35b1;color:#fff;border-color:transparent}
#rxEst{margin-top:8px;font-size:14px}#rxVol{width:100%;accent-color:#5e35b1}
#rxFlot{position:fixed;right:12px;bottom:calc(84px + var(--sab,0px));z-index:9000;display:none;align-items:center;gap:8px;background:#311b92;color:#fff;border-radius:24px;padding:8px 14px;font-weight:700;box-shadow:0 6px 18px rgba(0,0,0,.35);cursor:pointer;font-size:14px}
.rxResp{display:flex;flex-direction:column;align-items:center;padding:8px 0}
.rxCir{width:120px;height:120px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#b39ddb,#5e35b1);transform:scale(.55);transition:transform 4s ease-in-out;box-shadow:0 0 30px rgba(94,53,177,.35)}
.rxCir.sale{transition-duration:6s}.rxTx{margin-top:10px;font-weight:700;font-size:16px;min-height:22px}
@media (prefers-reduced-motion:reduce){.rxEq span{animation:none;height:10px}}`;
document.head.appendChild(st);

try{Object.assign(BNI,{'i-luna':'<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 20.5A10 10 0 0 1 12.5 6a10 10 0 1 0 13 13 10 10 0 0 1-3.5 1.5z" fill="currentColor" fill-opacity=".14"/><path d="M23 6v4M21 8h4M27 13v2M26 14h2"/></g>'});}catch(e){}

const sec=(window.svSec?svSec:(id,h)=>{const s=document.createElement('section');s.id='t-'+id;s.innerHTML=h;(document.querySelector('.wrap')||document.body).appendChild(s);return s;})('relax',
`<div class="card"><b>🌙 Para relajarse</b><div class="note">Sonidos de naturaleza para descansar, concentrarte o dormirte. Elige uno, pon el temporizador y apaga la pantalla: sigue sonando y se apaga solo, poco a poco.</div>
 <div class="rxG" id="rxG"></div>
 <div id="rxEst" class="note">Toca un sonido para empezar.</div></div>
<div class="card"><b>⏲️ Apagar dentro de…</b><div class="rxChips" id="rxT"></div>
 <div style="margin-top:12px"><b style="font-size:14px">🔊 Volumen</b><input type="range" id="rxVol" min="0" max="1" step="0.05"></div>
 <div class="note" style="margin-top:6px">Para dormir, mejor bajito: que apenas tape los ruidos de fuera. Si usas cascos, no los pongas fuertes.</div></div>
<div class="card"><b>🫁 Respira conmigo</b><div class="note">Respirar despacio (unas 6 veces por minuto) ayuda a calmarse. Sigue el círculo: toma aire mientras crece y suéltalo mientras se encoge.</div>
 <div class="rxResp"><div class="rxCir" id="rxCir"></div><div class="rxTx" id="rxTx"></div><button class="btn" id="rxRb" style="margin-top:10px">▶️ Empezar</button></div></div>
<div class="card"><b>💡 Bueno saber</b><div class="note" style="line-height:1.55">• <b>¿Hay una frecuencia «probada» para dormir?</b> No hay ninguna frecuencia mágica con pruebas sólidas (tampoco los famosos 432 Hz). Lo que mejor sale en los estudios es un sonido suave y constante: algunos estudios pequeños han visto que el <b>ruido rosa</b> ayuda a dormir más profundo, y que tapar los ruidos de fuera ayuda a no despertarse. Por eso están el ruido rosa y el marrón.<br>
• Los sonidos los hemos fabricado nosotros con el ordenador (no son grabaciones), y se repiten sin cortes.<br>
• Necesitan internet la primera vez que los pones; después el móvil suele guardarlos.<br>
• Si duermes mal muchas noches seguidas, habla con tu médico.</div></div>`);
nuevo('relax','NA Salud','🌙 Para relajarse','cielo','i-luna','b');

const flot=document.createElement('div');flot.id='rxFlot';document.body.appendChild(flot);
flot.onclick=()=>showTab('relax');

function quedan(){return FIN?Math.max(0,FIN-Date.now()):Infinity;}
function txtQ(){const q=quedan();if(q===Infinity)return 'sin temporizador';const m=Math.ceil(q/60000);return 'se apaga en '+(m>=60?Math.floor(m/60)+' h '+(m%60?m%60+' min':''):m+' min');}
function pinta(){const g=$('rxG');if(!g)return;
  g.innerHTML=RX_S.map(([k,e,n,d,c])=>`<button class="rxB${CUR===k?' on':''}" data-k="${k}" style="background:linear-gradient(150deg,${c},${c}cc 55%,#1a1a2e)"><span class="rxP">${CUR===k&&A&&!A.paused?'⏸':'▶'}</span><i>${e}</i><b>${n}</b><small>${d}</small><span class="rxEq"><span></span><span></span><span></span></span></button>`).join('');
  g.querySelectorAll('.rxB').forEach(b=>b.onclick=()=>toca(b.dataset.k));
  $('rxT').innerHTML=RX_MIN.map(m=>`<button class="${m===MIN?'on':''}" data-m="${m}">${{15:'15 min',30:'30 min',45:'45 min',60:'1 h',90:'1 h 30'}[m]||'∞ Sin fin'}</button>`).join('');
  $('rxT').querySelectorAll('button').forEach(b=>b.onclick=()=>{MIN=+b.dataset.m;guarda();if(A&&!A.paused)FIN=MIN?Date.now()+MIN*60000:0;pinta();});
  $('rxVol').value=VOL;estado();}
function estado(){const s=RX_S.find(x=>x[0]===CUR),el=$('rxEst');
  const on=A&&!A.paused&&s;
  if(el)el.innerHTML=on?`🎧 Suena <b>${s[2]}</b> · ${txtQ()} <button class="btn" id="rxStop" style="margin-left:6px;padding:4px 10px">⏹️ Parar</button>`:(el.dataset.err||'Toca un sonido para empezar.');
  const b=$('rxStop');if(b)b.onclick=para;
  const vis=on&&!(document.querySelector('section.on')||{}).id?.endsWith('-relax');
  flot.style.display=vis?'flex':'none';if(on)flot.innerHTML=`🌙 ${s[1]} ${s[2]} · ⏸`;}
function para(){if(A){A.pause();}CUR=null;FIN=0;clearInterval(TK);TK=0;try{navigator.mediaSession.playbackState='paused';}catch(e){}pinta();}
function toca(k){
  if(CUR===k&&A&&!A.paused){para();return;}
  const s=RX_S.find(x=>x[0]===k);if(!A){A=new Audio();A.loop=true;A.preload='auto';
    A.addEventListener('timeupdate',tick);
    A.addEventListener('playing',()=>{const e=$('rxEst');if(e)delete e.dataset.err;pinta();});
    A.addEventListener('error',()=>{const e=$('rxEst');if(e)e.dataset.err='⚠️ No se ha podido cargar el sonido. Comprueba que tienes internet y vuelve a tocarlo.';CUR=null;pinta();});}
  CUR=k;A.src=BASE+k+'.webm';A.volume=VOL;FIN=MIN?Date.now()+MIN*60000:0;
  const e=$('rxEst');if(e)e.innerHTML='⏳ Cargando '+s[2]+'…';
  const p=A.play();if(p&&p.catch)p.catch(()=>{const e=$('rxEst');if(e)e.dataset.err='⚠️ No se ha podido empezar. Vuelve a tocarlo.';CUR=null;pinta();});
  try{if('mediaSession' in navigator){navigator.mediaSession.metadata=new MediaMetadata({title:s[2],artist:'BasatiNA · Para relajarse',artwork:[{src:'logo.png',sizes:'512x512',type:'image/png'}]});
    navigator.mediaSession.setActionHandler('pause',para);navigator.mediaSession.setActionHandler('stop',para);navigator.mediaSession.setActionHandler('play',()=>toca(k));navigator.mediaSession.playbackState='playing';}}catch(x){}
  clearInterval(TK);TK=setInterval(tick,1000);pinta();}
// temporizador: en el último minuto baja el volumen poco a poco y al final para
function tick(){if(!A||A.paused)return;const q=quedan();
  if(q<=0){para();return;}
  A.volume=q<60000?Math.max(0,VOL*q/60000):VOL;
  if(!tick.t||Date.now()-tick.t>15000){tick.t=Date.now();estado();}}
$('rxVol').oninput=e=>{VOL=+e.target.value;if(A&&quedan()>=60000)A.volume=VOL;guarda();};

// respiración
let RS=0,RT=0;
function respira(){const c=$('rxCir'),t=$('rxTx');if(!RS)return;
  const dentro=RS%2===1;c.classList.toggle('sale',!dentro);c.style.transform=dentro?'scale(1)':'scale(.55)';t.textContent=dentro?'Toma aire… (4 s)':'Suéltalo despacio… (6 s)';
  RT=setTimeout(()=>{if(RS){RS++;respira();}},dentro?4000:6000);}
$('rxRb').onclick=()=>{if(RS){RS=0;clearTimeout(RT);$('rxCir').style.transform='scale(.55)';$('rxTx').textContent='';$('rxRb').textContent='▶️ Empezar';}
  else{RS=1;$('rxRb').textContent='⏹️ Parar';respira();}};

hook('relax',pinta);
const _st=showTab;showTab=function(t){_st(t);try{estado();if(t!=='relax'&&RS){RS=0;clearTimeout(RT);$('rxRb').textContent='▶️ Empezar';$('rxTx').textContent='';}}catch(e){}};
})();
