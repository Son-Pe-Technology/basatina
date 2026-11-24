/* =====================================================================
   ⭐ SÚPER ADMINISTRADORES (24 nov. 2026, lo pidió Pedro) — se carga después de menu6.js
   Pedro y Sonia entran en «Mi cuenta» con SU correo (SA_MAILS) y la app los reconoce solos:
   - Se abre el modo Administrador sin PIN (mientras dure la sesión de la cuenta).
   - La moderación de «Alertas ciudadanas» entra sola con su cuenta (ya no hace falta
     administracion@sonpe-technology.es, aunque sigue valiendo) y el registro apunta quién es cada uno.
   - La llave de GitHub se guarda UNA vez en la nube (Firestore admin/llaves, que solo pueden leer
     los administradores según firestore.rules) y los demás móviles de Pedro y Sonia la cogen solos.
   - Pantalla «⭐ Panel de administración» (pestaña superadm): todo lo pendiente de aprobar
     (alertas pendientes, denuncias, borradores de la IA) y accesos a todas las herramientas y ajustes.
   - Aviso en el Inicio y número rojo en el menú cuando hay algo pendiente.
   IMPORTANTE: la seguridad de verdad está en firestore.rules (función esAdmin, con los mismos correos
   y el correo confirmado). Si se cambia SA_MAILS, cambiarlo también allí y volver a publicar las reglas.
   ===================================================================== */
(function(){
if(!window.CMX)return;
const $=id=>document.getElementById(id);
const X=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const C=window.CMX;
const SA_MAILS={'pedro@sonpe-technology.es':'Pedro','sonia@sonpe-technology.es':'Sonia'};
const BR_API='https://api.github.com/repos/Son-Pe-Technology/basatina-borradores/contents/ia_borradores.json';
const ss={get:k=>{try{return sessionStorage.getItem(k);}catch(e){return null;}},set:(k,v)=>{try{v==null?sessionStorage.removeItem(k):sessionStorage.setItem(k,v);}catch(e){}}};
const jwt=t=>{try{return JSON.parse(decodeURIComponent(escape(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))));}catch(e){return {};}};

/* ---------- ¿quién está dentro? ---------- */
// súper administrador = sesión de cuenta con uno de los correos de SA_MAILS, ya confirmado
function yo(){const a=lsGet('cmAuth',null);if(!a||!a.it)return null;const j=jwt(a.it),m=(j.email||'').toLowerCase();
  if(!SA_MAILS[m]||!j.email_verified)return null;return {mail:m,nombre:SA_MAILS[m],a};}
window.bnSuper=()=>!!yo();

/* ---------- entrar y salir solos ---------- */
let AVISADO=false;
async function sync(){const s=yo();
  if(s){
    if(!TECH){TECH=true;ss.set('tech','1');ss.set('techSuper','1');try{techApply();}catch(e){}
      if(!AVISADO){AVISADO=true;toast(`⭐ Hola, ${s.nombre}: modo súper administrador abierto`);}}
    try{const t=await C.cmTok();
      // la moderación (comunidad.js) lee esta sesión: así entra sola con la cuenta de Pedro o Sonia
      const ad=(()=>{try{return JSON.parse(ss.get('cmAdm')||'null');}catch(e){return null;}})();
      if(!ad||ad.email!==s.mail||ad.it!==t.it)ss.set('cmAdm',JSON.stringify({it:t.it,rt:t.rt,exp:t.exp,email:s.mail,quien:s.nombre}));
      // la llave de GitHub, de la nube, si este móvil no la tiene
      if(!ghTok()){try{const d=C.decD(await C.fs('/admin/llaves',{},t.it));if(d.gh&&/^(github_pat_|ghp_)/.test(d.gh)){localStorage.setItem('ghTok',d.gh);if(!localStorage.getItem('edName'))localStorage.setItem('edName',s.nombre);toast('🔑 Llave de GitHub traída de la nube');}}catch(e){}}
    }catch(e){console.log('superadmin',e);}
    pendientes();
  }else if(TECH||ss.get('techSuper')==='1'){
    // sin cuenta de súper administrador no hay modo administrador (desde el 24 nov. 2026 ya no hay PIN)
    TECH=false;ss.set('tech',null);ss.set('techSuper',null);
    try{const ad=JSON.parse(ss.get('cmAdm')||'null');if(ad&&SA_MAILS[ad.email])ss.set('cmAdm',null);}catch(e){}
    try{techApply();}catch(e){}AVISADO=false;PEND=null;pinta();
  }}

/* ---------- lo pendiente de aprobar ---------- */
let PEND=null,PEND_T=0,PEND_BUSY=false;
async function pendientes(forzar){const s=yo();if(!s||PEND_BUSY)return PEND;if(!forzar&&PEND&&Date.now()-PEND_T<120000){pinta();return PEND;}
  PEND_BUSY=true;const P={alertas:null,denuncias:null,ia:null,err:[]};
  try{const t=await C.cmTok();
    const [a,d]=await Promise.allSettled([C.fsQuery('avisos','estado','pendiente',t.it),C.fsQuery('denuncias',null,null,t.it)]);
    if(a.status==='fulfilled')P.alertas=a.value.length;else P.err.push('alertas: '+a.reason.message);
    if(d.status==='fulfilled')P.denuncias=d.value.length;else P.err.push('denuncias: '+d.reason.message);
  }catch(e){P.err.push(e.message);}
  if(ghTok()){try{const r=await fetch(BR_API+'?t='+Date.now(),{headers:{Authorization:'Bearer '+ghTok(),Accept:'application/vnd.github.raw+json'},cache:'no-store'});
      if(r.ok){const j=await r.json();P.ia=(j.items||[]).filter(x=>x.estado==='borrador'||x.estado==='duda').length;}else if(r.status===404)P.ia=0;}catch(e){}}
  PEND=P;PEND_T=Date.now();PEND_BUSY=false;pinta();return P;}
const total=()=>PEND?(PEND.alertas||0)+(PEND.denuncias||0)+(PEND.ia||0):0;

/* ---------- avisos a la vista: Inicio y menú ---------- */
function pinta(){const n=yo()?total():0;
  // número rojo en el botón del menú
  const b=$('saBtn');if(b){b.style.display=yo()?'':'none';const k=b.querySelector('.saN');if(k){k.textContent=n;k.style.display=n?'':'none';}}
  // franja en el Inicio
  let f=$('saBan');const ini=$('t-mapa');
  if(!n){if(f)f.remove();return;}
  if(!f&&ini){f=document.createElement('button');f.id='saBan';f.onclick=()=>showTab('superadm');ini.prepend(f);}
  if(f){const p=[];if(PEND.alertas)p.push(`${PEND.alertas} alerta${PEND.alertas>1?'s':''}`);if(PEND.denuncias)p.push(`${PEND.denuncias} denuncia${PEND.denuncias>1?'s':''}`);if(PEND.ia)p.push(`${PEND.ia} noticia${PEND.ia>1?'s':''} de la IA`);
    f.innerHTML=`<span style="font-size:20px">🛡️</span><span style="flex:1;text-align:left"><b>Pendiente de aprobar</b><br><small>${X(p.join(' · '))}</small></span><span class="saN2">${n}</span>`;}
  if($('t-superadm')&&$('t-superadm').classList.contains('on'))panel();}

/* ---------- ⭐ Panel de administración ---------- */
const st=document.createElement('style');st.textContent=`
#saBan{display:flex;align-items:center;gap:10px;width:calc(100% - 20px);margin:10px;padding:10px 12px;border:0;border-radius:14px;background:#fff4e5;border-left:5px solid #ef6c00;color:#4a2a00;font:inherit;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.08)}
#saBan small{color:#6d4c2a}
.saN,.saN2{display:inline-block;min-width:20px;padding:1px 6px;border-radius:10px;background:#d32f2f;color:#fff;font-weight:800;font-size:12px;text-align:center;margin-left:6px}
.saN2{font-size:15px;padding:3px 9px}
.saFila{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid rgba(0,0,0,.07)}
.saFila:first-of-type{border-top:0}
.saFila .saI{font-size:24px;width:34px;text-align:center}
.saFila .saT{flex:1}.saFila .saT small{display:block;color:#5b6660}
.saNum{font-size:20px;font-weight:900;min-width:28px;text-align:right}
.saNum.hay{color:#d32f2f}
.saHerr{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
.saHerr button{text-align:left;padding:10px;border-radius:12px;border:1px solid rgba(0,0,0,.1);background:#f7faf5;font:inherit;font-size:14px;cursor:pointer}`;
document.head.appendChild(st);

svSec('superadm',`<div id="saBody"></div>`);
Object.assign(TITLES,{superadm:'⭐ Panel de administración'});
try{PVS_ESC.superadm='pueblo';}catch(e){}

function abrirMod(){showTab('comunidad');setTimeout(()=>{const b=$('cmModB');if(b)b.click();},250);}
function abrirIA(){showTab('noticias');setTimeout(()=>{const a=$('iaAdm');if(a)a.scrollIntoView({behavior:'smooth',block:'start'});},900);}

async function panel(){const el=$('saBody');if(!el)return;const s=yo();
  if(!s){const a=lsGet('cmAuth',null),j=a&&a.it?jwt(a.it):{},m=(j.email||'').toLowerCase();
    el.innerHTML=`<div class="card"><b>⭐ Panel de administración</b><div class="note" style="margin-top:6px;line-height:1.5">${SA_MAILS[m]&&!j.email_verified?'Confirma primero tu correo (el enlace que te mandó BasatiNA) y vuelve a entrar.':'Entra en «Mi cuenta» con vuestro correo de administración para ver este panel.'}</div>
      <div class="row" style="margin-top:8px"><button class="btn pri" id="saCu">👤 Ir a Mi cuenta</button></div></div>`;
    $('saCu').onclick=()=>{try{window.CU.ir('entrar');}catch(e){showTab('cuenta');}};return;}
  const P=PEND||{},num=v=>v==null?'<span class="saNum">–</span>':`<span class="saNum ${v?'hay':''}">${v}</span>`;
  const herr=[...document.querySelectorAll('#dgApp + .dsub button')].filter(b=>b.id!=='saBtn'&&b.id!=='dLock'&&b.id!=='dPin');
  el.innerHTML=`<div class="card"><div class="row" style="align-items:center;gap:10px"><div style="font-size:36px">⭐</div><div style="flex:1"><b style="font-size:18px">Hola, ${X(s.nombre)}</b><div class="note">Súper administrador · ${X(s.mail)}</div></div><button class="btn" id="saRf">🔄</button></div></div>
   <div class="card"><b>⏳ Pendiente de aprobar</b>
     <div class="saFila"><span class="saI">📣</span><span class="saT"><b>Alertas ciudadanas</b><small>Avisos de la gente esperando a ser publicados</small></span>${num(P.alertas)}<button class="btn" data-ir="mod">Revisar</button></div>
     <div class="saFila"><span class="saI">🚩</span><span class="saT"><b>Denuncias</b><small>Avisos publicados que alguien ha denunciado</small></span>${num(P.denuncias)}<button class="btn" data-ir="mod">Revisar</button></div>
     <div class="saFila"><span class="saI">🤖</span><span class="saT"><b>Noticias de la IA</b><small>Borradores que la IA no ha publicado sola</small></span>${num(P.ia)}<button class="btn" data-ir="ia">Revisar</button></div>
     ${P.err&&P.err.length?`<div class="note" style="margin-top:6px">⚠️ No se ha podido mirar todo (${X(P.err.join('; '))}). ¿Están publicadas las reglas nuevas de Firestore?</div>`:''}
     ${P.ia==null?'<div class="note" style="margin-top:6px">Para ver las noticias de la IA hace falta la llave de GitHub (abajo).</div>':''}</div>
   <div class="card"><b>🛠️ Herramientas</b><div class="saHerr">
     <button data-ir="ajustes">⚙️ Ajustes y avisos</button><button data-ir="cuenta">👤 Mi cuenta</button><button data-ir="creditos">📚 Fuentes y créditos</button>
     ${herr.map((b,i)=>`<button data-hx="${i}">${X(b.textContent.trim())}</button>`).join('')}</div></div>
   <div class="card"><b>🔑 Llave de GitHub</b><div class="note" style="margin-top:4px;line-height:1.5">${ghTok()?'✅ Este móvil tiene la llave.':'❌ Este móvil no tiene la llave.'} Sirve para editar contenidos, la agenda, las fotos y las noticias de la IA.
     Si la guardáis en la nube, vuestros otros móviles la cogen solos al entrar con vuestra cuenta. Solo la podéis leer Sonia y tú.</div>
     <div class="row" style="margin-top:8px;flex-wrap:wrap;gap:6px">${ghTok()?'<button class="btn pri" id="saGu">☁️ Guardar en la nube</button>':''}<button class="btn" id="saQu">🗑️ Quitar de la nube</button>${ghTok()?'':'<button class="btn" id="saPeg">📋 Pegar llave</button>'}</div><div class="note" id="saKm"></div></div>
   <div class="card"><div class="note" style="line-height:1.5">El modo Administrador solo se abre con vuestras cuentas y se cierra solo si sales de la cuenta. Ya no hay PIN.</div></div>`;
  el.querySelectorAll('[data-ir]').forEach(b=>b.onclick=()=>{const v=b.dataset.ir;v==='mod'?abrirMod():v==='ia'?abrirIA():showTab(v);});
  el.querySelectorAll('[data-hx]').forEach(b=>b.onclick=()=>{const h=herr[+b.dataset.hx];if(h)h.click();try{menu(false);}catch(e){}});
  $('saRf').onclick=async()=>{$('saRf').disabled=true;await pendientes(true);panel();};
  const km=t=>{$('saKm').textContent=t;};
  if($('saGu'))$('saGu').onclick=async()=>{km('Guardando…');try{const t=await C.cmTok();await C.fsPatch('admin','llaves',{gh:ghTok(),quien:s.nombre,cuando:new Date().toISOString()},t.it);km('✅ Guardada en la nube. Vuestros otros móviles la cogerán al entrar.');}catch(e){km('❌ No se pudo guardar ('+e.message+'). ¿Están publicadas las reglas nuevas?');}};
  $('saQu').onclick=async()=>{if(!confirm('¿Quitar la llave de la nube? Los móviles que ya la tienen la siguen teniendo.'))return;km('Quitando…');try{const t=await C.cmTok();await C.fsDel('admin','llaves',t.it);km('🗑️ Quitada de la nube.');}catch(e){km('❌ '+e.message);}};
  if($('saPeg'))$('saPeg').onclick=async()=>{const v=(prompt('Pega la llave de edición de GitHub (empieza por github_pat_)')||'').trim();if(!v)return;km('Comprobando…');
    try{const r=await fetch('https://api.github.com/repos/'+GH_REPO,{headers:{Authorization:'Bearer '+v,Accept:'application/vnd.github+json'}});const j=await r.json();
      if(!(r.ok&&j.permissions&&j.permissions.push))return km('❌ Llave no válida');localStorage.setItem('ghTok',v);km('✅ Llave guardada en este móvil');panel();}catch(e){km('❌ Sin conexión');}};}

svHook('superadm',async()=>{panel();await pendientes(true);});

/* ---------- botón en el menú (grupo Administrador, el primero) ---------- */
function boton(){const sub=document.querySelector('#dgApp + .dsub');if(!sub||$('saBtn'))return;
  const b=document.createElement('button');b.id='saBtn';b.dataset.t='superadm';b.style.display='none';
  b.innerHTML='⭐ Panel de administración<span class="saN" style="display:none">0</span>';
  b.onclick=()=>{showTab('superadm');try{menu(false);}catch(e){}};sub.prepend(b);}
boton();

/* ---------- adiós al PIN (24 nov. 2026, lo pidió Pedro) ----------
   Tocar 5 veces el logo ya no pide PIN: a Pedro y Sonia les abre el panel; a los demás no les hace nada.
   Si un móvil tenía abierto el modo administrador con el PIN antiguo, se cierra al arrancar. */
try{pinOpen=function(){if(yo()){showTab('superadm');try{menu(false);}catch(e){}}};}catch(e){}
{const d=$('dPin');if(d)d.remove();}
if(TECH&&!yo()){TECH=false;ss.set('tech',null);ss.set('techSuper',null);try{techApply();}catch(e){}}

/* ---------- cuándo mirar ---------- */
// al abrir, al cambiar de pantalla (entrar/salir de la cuenta pasa en «Mi cuenta»), al volver a la app y cada 2 min
const _s=showTab;showTab=function(t){_s.apply(this,arguments);if(t!=='superadm')setTimeout(sync,400);};
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>{PEND_T=0;sync();},800);});
setInterval(sync,120000);
setTimeout(sync,1500);
})();
