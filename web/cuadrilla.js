/* =====================================================================
   👥 CUADRILLA BASATINA SOLO CON CUENTA (26 nov. 2026, lo pidió Pedro) — se carga después de menu6.js
   La Cuadrilla (Alertas ciudadanas, Fotos de la Cuadrilla, Buzón y Refranes) sale en el menú para todos,
   pero solo se entra con una cuenta de BasatiNA abierta y con el correo ya confirmado.
   - Con la sesión abierta (y el correo confirmado): se entra directamente, sin preguntar nada.
   - Sin cuenta, o sin haber entrado con ella: sale la «puerta» (pantalla cuadpuerta) con
     «Iniciar sesión» y «Crear mi cuenta». Al entrar, la app vuelve sola a la pantalla que se quería abrir.
   - Con cuenta pero sin confirmar el correo: lo explica y lleva a «Mi cuenta».
   Decidido por Pedro: las alertas publicadas tampoco se ven sin cuenta.
   Esto solo cierra la puerta en la app; lo que cada uno puede escribir lo siguen vigilando las reglas de Firestore.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const CUAD=['comunidad','fotos','buzon','refranes'];
const ok=()=>{try{return !!(window.CU&&CU.ok());}catch(e){return false;}};
const ses=()=>{try{return !!(window.CU&&CU.sesion());}catch(e){return false;}};
const ss={get:k=>{try{return sessionStorage.getItem(k);}catch(e){return null;}},set:(k,v)=>{try{v==null?sessionStorage.removeItem(k):sessionStorage.setItem(k,v);}catch(e){}}};
const NOM={comunidad:'Alertas ciudadanas',fotos:'Fotos de la Cuadrilla',buzon:'Buzón de sugerencias',refranes:'Refranes de tu pueblo'};

const st=document.createElement('style');st.textContent=`
#t-cuadpuerta .cpC{position:relative;overflow:hidden;border-radius:22px;background:#fff;box-shadow:0 8px 26px -10px rgba(29,45,35,.35);margin:12px 0}
#t-cuadpuerta .cpF{height:150px;background:linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,.55)),url('foto-prev-valle.webp') center/cover;display:flex;align-items:flex-end;padding:14px 16px}
#t-cuadpuerta .cpF b{color:#fff;font-size:22px;font-weight:900;text-shadow:0 1px 8px rgba(0,0,0,.5)}
#t-cuadpuerta .cpB{padding:16px}
#t-cuadpuerta .cpCand{display:inline-flex;align-items:center;gap:6px;background:#f1f7ee;color:#2e6b2a;border-radius:999px;padding:5px 12px;font-size:13px;font-weight:800;margin-bottom:10px}
#t-cuadpuerta .cpT{font-size:17px;font-weight:900;line-height:1.3;color:#1d1d1d}
#t-cuadpuerta .cpX{font-size:14.5px;line-height:1.5;color:#3b463f;margin-top:6px}
#t-cuadpuerta ul{list-style:none;margin:12px 0 4px;padding:0;display:grid;gap:8px}
#t-cuadpuerta li{display:flex;align-items:center;gap:10px;font-size:14px;color:#2a302c}
#t-cuadpuerta li i{flex:none;width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:16px}
#t-cuadpuerta .cpBt{display:flex;flex-direction:column;gap:8px;margin-top:16px}
#t-cuadpuerta .cpBt button{border:0;border-radius:14px;padding:13px;font:inherit;font-size:15.5px;font-weight:800;cursor:pointer}
#t-cuadpuerta .cpBt .p{background:linear-gradient(120deg,#2e6b2a,#4f9a3c);color:#fff;box-shadow:0 4px 12px -4px rgba(46,107,42,.6)}
#t-cuadpuerta .cpBt .s{background:#fff;color:#2e6b2a;border:1.5px solid #2e6b2a}
#t-cuadpuerta .cpN{font-size:12.5px;color:#6b756f;margin-top:12px;line-height:1.45}`;
document.head.appendChild(st);

const sec=typeof svSec==='function'?svSec('cuadpuerta','<div id="cpBody"></div>'):(()=>{const s=document.createElement('section');s.id='t-cuadpuerta';s.innerHTML='<div id="cpBody"></div>';(document.querySelector('.wrap')||document.body).appendChild(s);return s;})();
try{TITLES.cuadpuerta='👥 Cuadrilla BasatiNA';}catch(e){}
try{if(window.PVS_ESC)PVS_ESC.cuadpuerta='pueblo';}catch(e){}

function pinta(){const el=$('cpBody');if(!el)return;const t=ss.get('cuadQuiere'),sin=!ses();
  el.innerHTML=`<div class="cpC"><div class="cpB">
    <div class="cpCand">🔒 <span>Solo para la gente registrada</span></div>
    ${sin?`<div class="cpT"><span>Inicia sesión con tu usuario o regístrate para entrar en la Cuadrilla</span></div>
      <div class="cpX"><span>La Cuadrilla es la parte de BasatiNA que hacemos entre todos. Para cuidarla, solo se entra con una cuenta de BasatiNA. Es gratis y en un minuto la tienes.</span></div>`
     :`<div class="cpT"><span>Te falta confirmar tu correo</span></div>
      <div class="cpX"><span>Ya tienes cuenta, pero aún no has pulsado el enlace del correo que te mandamos al registrarte. Búscalo (mira también en «correo no deseado»), púlsalo y después toca «Ya lo he confirmado» en Mi cuenta.</span></div>`}
    <ul><li><i style="background:#fde4e4">📣</i><span>Alertas ciudadanas: árboles caídos, desprendimientos, veneno para perros…</span></li>
      <li><i style="background:#e3f0fb">📷</i><span>Fotos de Navarra que manda la gente</span></li>
      <li><i style="background:#f3e5f5">🗣️</i><span>Refranes de cada pueblo</span></li>
      <li><i style="background:#fff1d6">💬</i><span>Buzón de sugerencias para mejorar la app</span></li></ul>
    <div class="cpBt">${sin?'<button class="p" data-v="entrar"><span>Iniciar sesión</span></button><button class="s" data-v="alta"><span>Crear mi cuenta</span></button>'
      :'<button class="p" data-v="cuenta"><span>Ir a Mi cuenta para confirmarlo</span></button>'}</div>
    <div class="cpN">${t&&NOM[t]?`<span>Al entrar te llevamos directamente a</span> «${NOM[t]}». `:''}<span>Tu apodo es lo único que ven los demás; tu correo no se enseña nunca.</span></div></div></div>`;
  el.querySelectorAll('button[data-v]').forEach(b=>b.onclick=async()=>{const v=b.dataset.v;
    if(v==='cuenta'){showTab('cuenta');return;}
    try{CU.ir(v);}catch(e){showTab('cuenta');}});}

/* volver sola a lo que se quería abrir, en cuanto la cuenta esté lista */
function vuelve(){const t=ss.get('cuadQuiere');if(!t||!ok())return false;ss.set('cuadQuiere',null);setTimeout(()=>showTab(t),50);return true;}

const _st=showTab;
showTab=function(t){
  if(CUAD.includes(t)&&!ok()){ss.set('cuadQuiere',t);_st.call(this,'cuadpuerta');pinta();try{menu(false);}catch(e){}return;}
  _st.apply(this,arguments);
  if(t==='cuadpuerta')pinta();};
window.showTab=showTab;
// después de entrar en «Mi cuenta»: si estaba esperando para entrar en la Cuadrilla, la lleva
setInterval(()=>{if(document.hidden||!ss.get('cuadQuiere'))return;const on=document.querySelector('section.on');
  if(on&&(on.id==='t-cuenta'||on.id==='t-cuadpuerta')&&ok())vuelve();},1500);
/* ---------- en el menú: al desplegar «Cuadrilla BasatiNA» sin cuenta, sale el aviso en vez de la lista ---------- */
document.head.insertAdjacentHTML('beforeend',`<style>
#bnaDGrid .dsub.cpCerr>button[data-t]:not(.tech){display:none!important}
#bnaDGrid .cpMini{grid-column:1/-1;margin:4px 4px 8px;padding:14px;border-radius:16px;background:#f4f8f1;border:1px solid #dfe9da}
#bnaDGrid .cpMini b{display:block;font-size:15px;line-height:1.3;color:#1d2b22}
#bnaDGrid .cpMini p{margin:5px 0 0;font-size:13px;line-height:1.4;color:#4f5b54}
#bnaDGrid .cpMini .cpMb{display:flex;gap:8px;margin-top:10px}
#bnaDGrid .cpMini .cpMb button{flex:1;border:0;border-radius:12px;padding:10px 8px;font:inherit;font-size:14px;font-weight:800;cursor:pointer;min-height:0}
#bnaDGrid .cpMini .cpMb .p{background:#2e6b2a;color:#fff}#bnaDGrid .cpMini .cpMb .s{background:#fff;color:#2e6b2a;border:1.5px solid #2e6b2a}
</style>`);
function menuPuerta(){const sub=document.querySelector('#bnaDGrid .dsub[data-m6s="Cuadrilla BasatiNA"]');if(!sub)return;
  const cerr=!ok(),sinCta=!ses();let c=sub.querySelector(':scope>.cpMini');sub.classList.toggle('cpCerr',cerr);
  if(!cerr){if(c)c.remove();return;}
  if(!c){c=document.createElement('div');c.className='cpMini';sub.prepend(c);}
  const k=sinCta?'a':'v';if(c.dataset.k===k)return;c.dataset.k=k;
  c.innerHTML=sinCta?`<b>🔒 <span>Inicia sesión con tu usuario o regístrate para entrar en la Cuadrilla</span></b><p><span>Alertas ciudadanas, fotos, refranes y buzón: solo para la gente registrada. Es gratis.</span></p>
    <div class="cpMb"><button class="p" data-v="entrar"><span>Iniciar sesión</span></button><button class="s" data-v="alta"><span>Registrarme</span></button></div>`
   :`<b>📧 <span>Te falta confirmar tu correo</span></b><p><span>Pulsa el enlace del correo que te mandamos y entra en la Cuadrilla.</span></p>
    <div class="cpMb"><button class="p" data-v="cuenta"><span>Ir a Mi cuenta</span></button></div>`;
  c.querySelectorAll('button[data-v]').forEach(b=>b.onclick=e=>{e.stopPropagation();const v=b.dataset.v;try{menu(false);}catch(x){}
    if(v==='cuenta')showTab('cuenta');else{try{CU.ir(v);}catch(x){showTab('cuenta');}}});}
// antes de que se despliegue el grupo (captura: va antes que el clic del menú)
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#bnaDGrid .dgroup[data-m6="Cuadrilla BasatiNA"]'))menuPuerta();},true);
setTimeout(menuPuerta,1500);setInterval(menuPuerta,3000);
// al cerrar o abrir sesión: todo al momento
window.addEventListener('bnSesion',()=>{setTimeout(()=>{menuPuerta();const on=document.querySelector('section.on');
  if(on&&CUAD.includes(on.id.slice(2))&&!ok())showTab(on.id.slice(2));else if(on&&on.id==='t-cuadpuerta'){if(!vuelve())pinta();}},80);});
// si alguien estaba dentro de la Cuadrilla y cierra la sesión, fuera
setInterval(()=>{const on=document.querySelector('section.on');if(on&&CUAD.includes(on.id.slice(2))&&!ok())showTab(on.id.slice(2));},4000);
})();
