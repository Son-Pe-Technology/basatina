/* =====================================================================
   🚧 APP «EN OBRAS» (23 nov. 2026, lo pidió Pedro) — se carga el último
   Si config/cierre.json tiene "cerrada": true, todo el mundo ve una pantalla de «Estamos en obras»
   MENOS los móviles de administración (los que tienen guardada la llave de GitHub: ghTok()).
   Esos ven la app normal y una franja arriba que recuerda que está cerrada para los demás.

   Abrir o cerrar:
   - Desde la app: modo Administrador → «🚧 App en obras» → botón Cerrar/Abrir para todos.
   - O a mano en GitHub: config/cierre.json → "cerrada": true / false.
   Tarda unos minutos en llegar a los móviles (lo mira al abrir la app, al volver a ella y cada 5 min).
   Se recuerda en el móvil (localStorage 'bnaCierre') para que no se vea la app ni un segundo al abrir.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const PATH='config/cierre.json',DEF={cerrada:false,titulo:'Estamos en obras',texto:''};
const TXT='Estamos preparando una BasatiNA nueva, con más vida. Volvemos muy pronto. ¡Gracias por la paciencia!';
const X=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const admin=()=>{try{return typeof ghTok==='function'&&!!ghTok();}catch(e){return false;}};
const st=document.createElement('style');st.textContent=`
#ciOv{position:fixed;inset:0;z-index:2147483000;background:linear-gradient(180deg,#eef5ea 0%,#f7f3e8 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:28px;text-align:center;font-family:inherit;color:#1d2b22;overflow:auto}
#ciOv .ciL{width:96px;height:96px;border-radius:50%;background:#fff;box-shadow:0 6px 20px rgba(29,45,35,.15);display:flex;align-items:center;justify-content:center;margin-bottom:14px}
#ciOv .ciL img{width:76px;height:76px;object-fit:contain}
#ciOv .ciB{font-family:Montserrat,sans-serif;font-weight:800;font-size:30px;letter-spacing:-.02em;margin-bottom:18px}
#ciOv .ciB span{color:#d32f2f}
#ciOv .ciI{width:120px;height:120px;margin:0 auto 10px;color:#e6a100}
#ciOv h2{font-size:24px;margin:6px 0 10px;font-weight:900}
#ciOv p{font-size:16px;line-height:1.5;max-width:340px;margin:0 auto 18px;color:#3b4a40}
#ciOv .ciF{display:flex;gap:6px;justify-content:center;margin-bottom:22px}
#ciOv .ciF i{width:10px;height:10px;border-radius:50%;background:#3d7031;opacity:.25;animation:ciP 1.4s infinite}
#ciOv .ciF i:nth-child(2){animation-delay:.2s}#ciOv .ciF i:nth-child(3){animation-delay:.4s}
@keyframes ciP{0%,100%{opacity:.25;transform:scale(1)}50%{opacity:1;transform:scale(1.25)}}
#ciOv small{font-size:13px;color:#6b776f}
#ciOv .ciS{margin-top:22px;font-size:12px;color:#8a948d}
#ciBar{position:sticky;top:0;z-index:50;background:#e6a100;color:#1d1d1d;font-weight:800;font-size:13px;text-align:center;padding:6px 10px}`;
document.head.appendChild(st);
const CONO=`<svg class="ciI" viewBox="0 0 64 64" aria-hidden="true"><path d="M27 8h10l12 44H15z" fill="currentColor"/><path d="M23.5 21h17l2.6 9.5h-22.2zM19.6 35.5h24.8l2.7 9.5H16.9z" fill="#fff"/><rect x="8" y="51" width="48" height="6" rx="3" fill="#3d4a40"/></svg>`;
function pinta(c){
  const ov=$('ciOv'),bar=$('ciBar');
  if(!c||!c.cerrada){if(ov)ov.remove();if(bar)bar.remove();document.documentElement.style.overflow='';return;}
  if(admin()){if(ov)ov.remove();document.documentElement.style.overflow='';
    if(!bar){const h=document.querySelector('header');const b=document.createElement('div');b.id='ciBar';b.textContent='🚧 App cerrada para todos menos administración (en obras)';
      (h&&h.parentNode?h.parentNode.insertBefore(b,h.nextSibling):document.body.prepend(b));}
    return;}
  if(bar)bar.remove();
  const html=`<div class="ciL"><img src="logo.png" alt=""></div><div class="ciB">Basati<span>NA</span></div>${CONO}
    <h2>${X(c.titulo||DEF.titulo)}</h2><p>${X(c.texto||TXT)}</p><div class="ciF"><i></i><i></i><i></i></div>
    <small>Mientras tanto, ante cualquier riesgo, haz caso siempre a los avisos oficiales (112, AEMET, SAIH Ebro).</small>
    <div class="ciS">Son&amp;Pe Technology Systems · basatina.es</div>`;
  let o=ov;if(!o){o=document.createElement('div');o.id='ciOv';o.setAttribute('role','alertdialog');document.body.appendChild(o);}
  if(o.dataset.h!==html){o.innerHTML=html;o.dataset.h=html;}
  document.documentElement.style.overflow='hidden';}
// lo último que se supo, para que no se vea la app ni un momento
let C=null;try{C=JSON.parse(localStorage.getItem('bnaCierre')||'null');}catch(e){}
pinta(C);
async function mira(){try{
    const r=await fetch(GH_RAW+PATH+'?t='+Math.floor(Date.now()/60000),{cache:'no-store'});
    C=r.ok?await r.json():DEF;}catch(e){return;}   // sin internet: se queda como estaba
  try{localStorage.setItem('bnaCierre',JSON.stringify(C));}catch(e){}
  pinta(C);panel();}
mira();setInterval(()=>{if(!document.hidden)mira();},5*60e3);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)mira();});

/* ---------- botón en modo Administrador ---------- */
function panel(){const sub=$('dgApp')&&$('dgApp').nextElementSibling;if(!sub)return;
  let b=$('ciBtn');if(!b){b=document.createElement('button');b.id='ciBtn';sub.prepend(b);
    b.onclick=async()=>{const cerrar=!(C&&C.cerrada);
      if(!confirm(cerrar?'¿Cerrar la app para todos menos administración? Verán «Estamos en obras».':'¿Abrir la app otra vez para todo el mundo?'))return;
      try{C=await jsEdit(PATH,DEF,d=>{d.cerrada=cerrar;if(!d.titulo)d.titulo=DEF.titulo;},cerrar?'App en obras: cerrada':'App en obras: abierta');
        try{localStorage.setItem('bnaCierre',JSON.stringify(C));}catch(e){}pinta(C);panel();
        try{toast(cerrar?'🚧 Cerrada para los demás (tarda unos minutos en llegar)':'✅ Abierta para todos (tarda unos minutos en llegar)');}catch(e){}}
      catch(e){try{toast('❌ '+e.message);}catch(x){}}};}
  /* 26 nov. 2026 (Pedro): icono en cuadrado de color (cono naranja), como el resto del menú */
  try{ICK.ciBtn='traffic-cone';ICC.ciBtn='#ef6c00';}catch(e){}
  const tx=C&&C.cerrada?'App en obras: ABRIR para todos':'App en obras: cerrar para todos';
  b.dataset.emo='🚧 ';b.dataset.txt=tx;      // lo que usa applyIcons al repintar el menú
  b.innerHTML=(document.body.classList.contains('pro')&&typeof icoBox==='function'?icoBox('ciBtn',16,28):'🚧 ')+'<span>'+tx+'</span>';}
panel();setTimeout(panel,1500);
})();
