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
    try{if(window.puAdmin&&puAdmin.on())puAdmin.pon(false);}catch(e){}   // sin cuenta de administrador, fuera los avisos de lo pendiente
    try{const ad=JSON.parse(ss.get('cmAdm')||'null');if(ad&&SA_MAILS[ad.email])ss.set('cmAdm',null);}catch(e){}
    try{techApply();}catch(e){}AVISADO=false;PEND=null;pinta();
  }}

/* ---------- lo pendiente de aprobar ---------- */
let PEND=null,PEND_T=0,PEND_BUSY=false;
async function pendientes(forzar){const s=yo();if(!s||PEND_BUSY)return PEND;if(!forzar&&PEND&&Date.now()-PEND_T<120000){pinta();return PEND;}
  PEND_BUSY=true;const P={alertas:null,denuncias:null,ia:null,refranes:null,rfL:[],err:[]};
  try{const t=await C.cmTok();
    const [a,d]=await Promise.allSettled([C.fsQuery('avisos','estado','pendiente',t.it),C.fsQuery('denuncias',null,null,t.it)]);
    if(a.status==='fulfilled')P.alertas=a.value.length;else P.err.push('alertas: '+a.reason.message);
    if(d.status==='fulfilled')P.denuncias=d.value.length;else P.err.push('denuncias: '+d.reason.message);
    // 🗣️ refranes que ha mandado la gente (25 nov. 2026)
    if(window.RFX){try{P.rfL=await window.RFX.pendientes();P.refranes=P.rfL.length;}catch(e){P.err.push('refranes: '+e.message);}}
  }catch(e){P.err.push(e.message);}
  if(ghTok()){try{const r=await fetch(BR_API+'?t='+Date.now(),{headers:{Authorization:'Bearer '+ghTok(),Accept:'application/vnd.github.raw+json'},cache:'no-store'});
      if(r.ok){const j=await r.json();P.ia=(j.items||[]).filter(x=>x.estado==='borrador'||x.estado==='duda').length;}else if(r.status===404)P.ia=0;}catch(e){}}
  // 📸 fotos que ha mandado la gente por «Envía tu foto» (26 nov. 2026): las de Cloudinary que aún no están ni publicadas ni descartadas
  try{if(typeof cldCfg==='function'){const c=await cldCfg();if(c.cloud){
    const r=await fetch(`https://res.cloudinary.com/${encodeURIComponent(c.cloud)}/image/list/${FO_TAG}.json?t=${Date.now()}`,{cache:'no-store'});
    const L=r.ok?((await r.json()).resources||[]):[];const G=await glLoad(true),hecho=new Set([...(G.fotos||[]).map(f=>f.id),...(G.descartadas||[])]);
    P.fotos=L.filter(x=>!hecho.has(x.public_id)).length;}}}catch(e){P.err.push('fotos: '+e.message);}
  PEND=P;PEND_T=Date.now();PEND_BUSY=false;pinta();return P;}
const total=()=>PEND?(PEND.alertas||0)+(PEND.denuncias||0)+(PEND.ia||0)+(PEND.refranes||0):0;

/* ---------- avisos a la vista: Inicio y menú ---------- */
function pinta(){const n=yo()?total():0;
  // número rojo en el botón del menú
  const b=$('sadBtn');if(b){b.style.display=yo()?'':'none';let k=b.querySelector('.sadN');
    if(!k){k=document.createElement('span');k.className='sadN';b.appendChild(k);}   // applyIcons rehace el botón y lo quita
    k.textContent=n;k.style.display=n?'':'none';}
  // franja en el Inicio
  let f=$('sadBan');const ini=$('t-mapa');
  if(!n){if(f)f.remove();return;}
  if(!f&&ini){f=document.createElement('button');f.id='sadBan';f.onclick=()=>showTab('superadm');ini.prepend(f);}
  if(f){const p=[];if(PEND.alertas)p.push(`${PEND.alertas} alerta${PEND.alertas>1?'s':''}`);if(PEND.denuncias)p.push(`${PEND.denuncias} denuncia${PEND.denuncias>1?'s':''}`);if(PEND.ia)p.push(`${PEND.ia} noticia${PEND.ia>1?'s':''} de la IA`);if(PEND.refranes)p.push(`${PEND.refranes} refrán${PEND.refranes>1?'es':''}`);
    f.innerHTML=`<span style="font-size:20px">🛡️</span><span style="flex:1;text-align:left"><b>Pendiente de aprobar</b><br><small>${X(p.join(' · '))}</small></span><span class="sadN2">${n}</span>`;}
  if($('t-superadm')&&$('t-superadm').classList.contains('on')&&!document.activeElement?.matches?.('#sadKeys input, #sadIA input')){panel();claves();gastoIA();}}

/* ---------- ⭐ Panel de administración ---------- */
const st=document.createElement('style');st.textContent=`
#sadBan{display:flex;align-items:center;gap:10px;width:calc(100% - 20px);margin:10px;padding:10px 12px;border:0;border-radius:14px;background:#fff4e5;border-left:5px solid #ef6c00;color:#4a2a00;font:inherit;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.08)}
#sadBan small{color:#6d4c2a}
.sadN,.sadN2{display:inline-block;min-width:20px;padding:1px 6px;border-radius:10px;background:#d32f2f;color:#fff;font-weight:800;font-size:12px;text-align:center;margin-left:6px}
.sadN2{font-size:15px;padding:3px 9px}
.sadFila{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid rgba(0,0,0,.07)}
.sadFila:first-of-type{border-top:0}
.sadFila .sadI{font-size:24px;width:34px;text-align:center}
.sadFila .sadT{flex:1}.sadFila .sadT small{display:block;color:#5b6660}
.sadNum{font-size:20px;font-weight:900;min-width:28px;text-align:right}
.sadNum.hay{color:#d32f2f}
.sadHerr{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
.sadHerr button{text-align:left;padding:10px;border-radius:12px;border:1px solid rgba(0,0,0,.1);background:#f7faf5;font:inherit;font-size:14px;cursor:pointer}`;
document.head.appendChild(st);

svSec('superadm',`<div id="sadBody"></div>`);
Object.assign(TITLES,{superadm:'⭐ Panel de administración'});
try{PVS_ESC.superadm='pueblo';}catch(e){}

/* 🔔 Probar avisos (26 nov. 2026, lo pidió Pedro): un botón por tipo de aviso → AndroidNet.probarAviso (APK 5.8) */
const PA=[['lluvia','🌧️ Lluvia'],['tormenta','⛈️ Lluvia fuerte'],['viento','💨 Viento'],['helada','🥶 Helada'],['calor','🥵 Calor y UV'],['niebla','🌫️ Niebla'],
  ['rio','🌊 Río, carreteras y monte'],['sismo','🌍 Terremoto'],['desaparecidos','🆘 Desaparecidos'],['push','📲 Avisos de BasatiNA'],['admin','⭐ Algo por revisar'],
  ['dato','💡 Dato del día'],['curiosa','😄 Noticia curiosa']];
function abrirMod(){showTab('comunidad');setTimeout(()=>{const b=$('cmModB');if(b)b.click();},250);}
function abrirIA(){showTab('noticias');setTimeout(()=>{const a=$('iaAdm');if(a)a.scrollIntoView({behavior:'smooth',block:'start'});},900);}

async function panel(){const el=$('sadBody');if(!el)return;const s=yo();
  if(!s){const a=lsGet('cmAuth',null),j=a&&a.it?jwt(a.it):{},m=(j.email||'').toLowerCase();
    el.innerHTML=`<div class="card"><b>⭐ Panel de administración</b><div class="note" style="margin-top:6px;line-height:1.5">${SA_MAILS[m]&&!j.email_verified?'Confirma primero tu correo (el enlace que te mandó BasatiNA) y vuelve a entrar.':'Entra en «Mi cuenta» con vuestro correo de administración para ver este panel.'}</div>
      <div class="row" style="margin-top:8px"><button class="btn pri" id="sadCu">👤 Ir a Mi cuenta</button></div></div>`;
    $('sadCu').onclick=()=>{try{window.CU.ir('entrar');}catch(e){showTab('cuenta');}};return;}
  const P=PEND||{},num=v=>v==null?'<span class="sadNum">–</span>':`<span class="sadNum ${v?'hay':''}">${v}</span>`;
  const herr=[...document.querySelectorAll('#dgApp + .dsub button')].filter(b=>b.id!=='sadBtn'&&b.id!=='dLock'&&b.id!=='dPin');
  el.innerHTML=`<div class="card"><div class="row" style="align-items:center;gap:10px"><div style="font-size:36px">⭐</div><div style="flex:1"><b style="font-size:18px">Hola, ${X(s.nombre)}</b><div class="note">Súper administrador · ${X(s.mail)}</div></div><button class="btn" id="sadRf">🔄</button></div></div>
   <div class="card"><b>⏳ Pendiente de aprobar</b>
     <div class="sadFila"><span class="sadI">📣</span><span class="sadT"><b>Alertas ciudadanas</b><small>Avisos de la gente esperando a ser publicados</small></span>${num(P.alertas)}<button class="btn" data-ir="mod">Revisar</button></div>
     <div class="sadFila"><span class="sadI">🚩</span><span class="sadT"><b>Denuncias</b><small>Avisos publicados que alguien ha denunciado</small></span>${num(P.denuncias)}<button class="btn" data-ir="mod">Revisar</button></div>
     <div class="sadFila"><span class="sadI">🗣️</span><span class="sadT"><b>Refranes</b><small>Los que ha mandado la gente (abajo)</small></span>${num(P.refranes)}<button class="btn" data-ir="rfAbajo">Ver</button></div>
     <div class="sadFila"><span class="sadI">📸</span><span class="sadT"><b>Fotos de la gente</b><small>Las que han mandado por «Envía tu foto»</small></span>${num(P.fotos)}<button class="btn" data-ir="fotosRev">Revisar</button></div>
     <div class="sadFila"><span class="sadI">🤖</span><span class="sadT"><b>Noticias de la IA</b><small>Borradores que la IA no ha publicado sola</small></span>${num(P.ia)}<button class="btn" data-ir="ia">Revisar</button></div>
     ${P.err&&P.err.length?`<div class="note" style="margin-top:6px">⚠️ No se ha podido mirar todo (${X(P.err.join('; '))}). ¿Están publicadas las reglas nuevas de Firestore?</div>`:''}
     ${P.ia==null?'<div class="note" style="margin-top:6px">Para ver las noticias de la IA hace falta la llave de GitHub (abajo).</div>':''}</div>
   <div class="card" id="sadPush"><b>🔔 Avisarme en el móvil</b><div class="note" style="margin-top:4px;line-height:1.5">Te llega un aviso en cuanto haya algo nuevo por revisar (noticias de la IA, refranes, fotos, alertas ciudadanas o denuncias), aunque tengas la app cerrada. Al tocarlo se abre este panel. De 23:00 a 7:00 no suena: lo que entre de noche te llega a las 7.</div>
     ${window.puAdmin&&puAdmin.puede()?`<label style="display:flex;gap:8px;align-items:center;margin-top:8px"><input type="checkbox" id="sadPu" ${puAdmin.on()?'checked':''}><b>Avisarme de lo pendiente</b></label>`:'<div class="note" style="margin-top:6px">⚠️ Hace falta la app 5.7 o más nueva (Google Play).</div>'}
     <div class="note" style="margin-top:6px">También avisa de las fotos que manda la gente (y además llegan por correo a participa@basatina.es).</div></div>
   <div class="card" id="sadPA"><b>🔔 Probar avisos</b><div class="note" style="margin-top:4px;line-height:1.5">Toca uno y te llega al momento un aviso de prueba, con su sonido de verdad. Si alguno no suena, mira en los ajustes del móvil (Aplicaciones → BasatiNA → Notificaciones) que esa categoría no esté silenciada, y que el volumen de notificaciones esté subido.</div>
     ${window.AndroidNet&&AndroidNet.probarAviso?`<div class="sadHerr">${PA.map(([k,t])=>`<button data-pa="${k}">${t}</button>`).join('')}</div>`:'<div class="note" style="margin-top:6px">⚠️ Hace falta la app 5.8 o más nueva (Google Play).</div>'}</div>
   <div class="card" id="sadRfC"><b>🗣️ Refranes por aprobar</b>${(P.rfL||[]).length?P.rfL.map(r=>`<div class="sadFila" style="display:block"><div style="font-family:Georgia,serif;font-size:16px">«${X(r.t)}»</div>${r.s?`<div class="note">${X(r.s)}</div>`:''}<div class="note">📍 ${X(r.p||'sin pueblo')}${r.creado?' · '+X(new Date(r.creado).toLocaleString('es-ES',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})):''}</div>
     <div class="row" style="gap:6px;margin-top:6px"><button class="btn pri" data-rfok="${X(r.id)}">✅ Publicar</button><button class="btn" data-rfno="${X(r.id)}">🗑️ Eliminar</button></div></div>`).join(''):`<div class="note" style="margin-top:6px">${P.refranes==null?'No se han podido mirar (¿están publicadas las reglas nuevas de Firestore?).':'No hay ninguno esperando. 👍'}</div>`}</div>
   <div class="card"><b>🛠️ Herramientas</b><div class="sadHerr">
     <button data-ir="noticias">📰 Corregir noticias</button><button data-ir="ajustes">⚙️ Ajustes y avisos</button><button data-ir="cuenta">👤 Mi cuenta</button><button data-ir="creditos">📚 Fuentes y créditos</button>
     ${herr.map((b,i)=>`<button data-hx="${i}">${X(b.textContent.trim())}</button>`).join('')}</div></div>
   <div class="card" id="sadIA"><b>🤖 Gasto de la IA</b><div class="note">Cargando…</div></div>
   <div class="card" id="sadKeys"><b>🔐 Claves de servicios</b><div class="note">Cargando…</div></div>
   <div class="card"><b>🔑 Llave de GitHub</b><div class="note" style="margin-top:4px;line-height:1.5">${ghTok()?'✅ Este móvil tiene la llave.':'❌ Este móvil no tiene la llave.'} Sirve para editar contenidos, la agenda, las fotos y las noticias de la IA.
     Si la guardáis en la nube, vuestros otros móviles la cogen solos al entrar con vuestra cuenta. Solo la podéis leer Sonia y tú.</div>
     <div class="row" style="margin-top:8px;flex-wrap:wrap;gap:6px">${ghTok()?'<button class="btn pri" id="sadGu">☁️ Guardar en la nube</button>':''}<button class="btn" id="sadQu">🗑️ Quitar de la nube</button>${ghTok()?'':'<button class="btn" id="sadPeg">📋 Pegar llave</button>'}</div><div class="note" id="sadKm"></div></div>
   <div class="card"><div class="note" style="line-height:1.5">El modo Administrador solo se abre con vuestras cuentas y se cierra solo si sales de la cuenta. Ya no hay PIN.</div></div>`;
  el.querySelectorAll('[data-ir]').forEach(b=>b.onclick=()=>{const v=b.dataset.ir;if(v==='rfAbajo'){const c=$('sadRfC');if(c)c.scrollIntoView({behavior:'smooth',block:'start'});return;}
    if(v==='fotosRev'){showTab('fotos');setTimeout(()=>{const b=$('foPendB');if(b){b.click();b.scrollIntoView({behavior:'smooth',block:'start'});}},500);return;}v==='mod'?abrirMod():v==='ia'?abrirIA():showTab(v);});
  // 🗣️ publicar o eliminar refranes con un toque
  const rfHecho=async(b,fn,txt)=>{el.querySelectorAll('[data-rfok],[data-rfno]').forEach(x=>x.disabled=true);
    try{await fn();toast(txt);}catch(e){toast('❌ '+e.message);}await pendientes(true);panel();};
  el.querySelectorAll('[data-rfok]').forEach(b=>b.onclick=()=>rfHecho(b,()=>window.RFX.aprobar(b.dataset.rfok),'✅ Refrán publicado'));
  el.querySelectorAll('[data-rfno]').forEach(b=>b.onclick=()=>{if(confirm('¿Eliminar este refrán? No se publicará.'))rfHecho(b,()=>window.RFX.eliminar(b.dataset.rfno),'🗑️ Refrán eliminado');});
  el.querySelectorAll('[data-pa]').forEach(b=>b.onclick=()=>{try{AndroidNet.probarAviso(b.dataset.pa);toast('🔔 Prueba enviada: '+b.textContent);}catch(e){toast('❌ No se pudo lanzar la prueba');}});
  const pu=$('sadPu');if(pu)pu.onchange=()=>{puAdmin.pon(pu.checked);toast(pu.checked?'🔔 Te avisaremos de lo pendiente':'🔕 Avisos de lo pendiente apagados');};
  el.querySelectorAll('[data-hx]').forEach(b=>b.onclick=()=>{const h=herr[+b.dataset.hx];if(h)h.click();try{menu(false);}catch(e){}});
  $('sadRf').onclick=async()=>{$('sadRf').disabled=true;await pendientes(true);panel();claves();gastoIA();};
  const km=t=>{$('sadKm').textContent=t;};
  if($('sadGu'))$('sadGu').onclick=async()=>{km('Guardando…');try{const t=await C.cmTok();await C.fsPatch('admin','llaves',{gh:ghTok(),quien:s.nombre,cuando:new Date().toISOString()},t.it);km('✅ Guardada en la nube. Vuestros otros móviles la cogerán al entrar.');}catch(e){km('❌ No se pudo guardar ('+e.message+'). ¿Están publicadas las reglas nuevas?');}};
  $('sadQu').onclick=async()=>{if(!confirm('¿Quitar la llave de la nube? Los móviles que ya la tienen la siguen teniendo.'))return;km('Quitando…');try{const t=await C.cmTok();await C.fsDel('admin','llaves',t.it);km('🗑️ Quitada de la nube.');}catch(e){km('❌ '+e.message);}};
  if($('sadPeg'))$('sadPeg').onclick=async()=>{const v=(prompt('Pega la llave de edición de GitHub (empieza por github_pat_)')||'').trim();if(!v)return;km('Comprobando…');
    try{const r=await fetch('https://api.github.com/repos/'+GH_REPO,{headers:{Authorization:'Bearer '+v,Accept:'application/vnd.github+json'}});const j=await r.json();
      if(!(r.ok&&j.permissions&&j.permissions.push))return km('❌ Llave no válida');localStorage.setItem('ghTok',v);km('✅ Llave guardada en este móvil');panel();}catch(e){km('❌ Sin conexión');}};}

/* 🔐 todas las claves de servicios juntas (24 nov. 2026, lo pidió Pedro): se guardan en Firestore claves/app */
const SA_K=[['aemet','🌦️ AEMET','Radar, rayos y aludes. También va en GitHub → secreto AEMET_KEY (para el robot).','https://opendata.aemet.es/centrodedescargas/altaUsuario'],
  ['tomtom','🚗 TomTom','Tráfico en el mapa de carreteras.','https://developer.tomtom.com/user/me/apps'],
  ['plantnet','🌿 Pl@ntNet','Identificar plantas con una foto.','https://my.plantnet.org/account/settings'],
  ['rainbow','🌧️ Rainbow','Radar con previsión de lluvia (opcional).','https://www.rainbow.ai/'],
  ['web3forms','✉️ Web3Forms · participa@','Buzón de sugerencias y participación.','https://web3forms.com/'],
  ['web3forms_alertas','✉️ Web3Forms · alertas@','Correo de las alertas ciudadanas.','https://web3forms.com/']];
async function claves(){const el=$('sadKeys');if(!el||!window.bnClaves)return;let E={};
  try{E=await window.bnClaves.estado();}catch(e){el.innerHTML=`<b>🔐 Claves de servicios</b><div class="note">❌ No se pudieron leer (${X(e.message)}).</div>`;return;}
  el.innerHTML=`<b>🔐 Claves de servicios</b><div class="note" style="margin-top:4px;line-height:1.5">Todas juntas. Se guardan en vuestra base de datos (no en GitHub). Pega la nueva y dale a Guardar: la app la usa al momento en todos los móviles.</div>`+
    SA_K.map(([k,n,d,u])=>`<div class="sadFila" style="display:block"><div style="display:flex;align-items:center;gap:8px"><b style="flex:1">${n}</b><span class="note">${E[k]?'✅ guardada':'❌ falta'}</span></div>
      <div class="note">${X(d)} <a href="#" data-ku="${X(u)}">Conseguir clave ↗</a></div>
      <div class="row" style="margin-top:6px;gap:6px"><input class="town" type="password" data-kv="${k}" placeholder="Pega aquí la clave nueva" autocomplete="off" style="flex:1;min-width:0">
      <button class="btn" data-kver="${k}" aria-label="Ver">👁️</button><button class="btn pri" data-kg="${k}">Guardar</button></div><div class="note" data-km="${k}"></div></div>`).join('');
  el.querySelectorAll('[data-ku]').forEach(a=>a.onclick=e=>{e.preventDefault();try{C.abre(a.dataset.ku);}catch(x){window.open(a.dataset.ku,'_blank');}});
  el.querySelectorAll('[data-kver]').forEach(b=>b.onclick=()=>{const i=el.querySelector(`[data-kv="${b.dataset.kver}"]`);i.type=i.type==='password'?'text':'password';});
  el.querySelectorAll('[data-kg]').forEach(b=>b.onclick=async()=>{const k=b.dataset.kg,v=el.querySelector(`[data-kv="${k}"]`).value.trim(),m=el.querySelector(`[data-km="${k}"]`);
    if(v.length<10)return m.textContent='Pega la clave completa.';if(/\s/.test(v))return m.textContent='La clave no puede llevar espacios: revisa que no se haya colado nada.';
    b.disabled=true;m.textContent='Guardando…';try{await window.bnClaves.guarda(k,v);m.textContent='✅ Guardada'+(k==='aemet'?'. Ponla también en GitHub (secreto AEMET_KEY).':'.');setTimeout(claves,1500);}
    catch(e){b.disabled=false;m.textContent='❌ '+e.message;}});}
/* 🤖 gasto de la IA (24 nov. 2026): lo apunta el robot en noticias/ia_gasto.json; el crédito cargado se apunta aquí
   (Firestore admin/ia, solo administradores) para calcular lo que queda. Claude Console: platform.claude.com */
const IA_WEB={saldo:'https://platform.claude.com/settings/billing',coste:'https://platform.claude.com/cost'};
async function gastoIA(){const el=$('sadIA');if(!el)return;let G={},A={};
  try{const r=await fetch(GH_RAW+'noticias/ia_gasto.json?t='+Math.floor(Date.now()/300000));if(r.ok)G=await r.json();}catch(e){}
  try{const t=await C.cmTok();A=C.decD(await C.fs('/admin/ia',{},t.it));}catch(e){}
  const hoy=new Date(),mes=hoy.toISOString().slice(0,7),M=G[mes]||{},dias=new Date(hoy.getFullYear(),hoy.getMonth()+1,0).getDate();
  // el primer mes se cuenta desde el primer día con gasto (23 nov. 2026), no desde el día 1
  const desde=mes==='2026-11'?23:1,pasados=Math.max(1,hoy.getDate()-desde+1),resto=dias-desde+1;
  const prev=(M.dolares||0)/pasados*resto,total=Object.values(G).reduce((a,x)=>a+((x&&x.dolares)||0),0);
  // «da para»: con el gasto medio por día × 30 (el mes de arranque es corto y engañaría)
  const carg=+A.cargado||0,queda=carg?carg-total:null,porMes=(M.dolares||0)/pasados*30,meses=queda!=null&&porMes>0?queda/porMes:null;
  const usd=v=>(v||0).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})+' $';
  el.innerHTML=`<b>🤖 Gasto de la IA</b><div class="note" style="margin-top:2px">Noticias propias, «Navarra hoy» y correcciones. Datos del robot (se actualizan en cada pasada).</div>
    <div class="kpi" style="margin-top:8px;flex-wrap:wrap"><div><span class="note">Este mes</span><b>${usd(M.dolares)}</b></div><div><span class="note">Previsión del mes</span><b>${usd(prev)}</b></div>
    <div><span class="note">Llamadas este mes</span><b>${M.llamadas||0}</b></div></div>
    ${carg?`<div class="kpi" style="margin-top:6px;flex-wrap:wrap"><div><span class="note">Queda (aprox.)</span><b style="color:${queda<3?'#c62828':'inherit'}">${usd(queda)}</b></div><div><span class="note">Cargado en total</span><b>${usd(carg)}</b></div>
      ${meses!=null?`<div><span class="note">Da para</span><b>${meses<1?'menos de 1 mes':'≈ '+Math.floor(meses)+' mes'+(Math.floor(meses)>1?'es':'')}</b></div>`:''}</div>
      ${queda<3?'<div class="note" style="color:#c62828;margin-top:4px">⚠️ Queda poco crédito: cuando se acabe, la IA deja de escribir noticias.</div>':''}`
     :'<div class="note" style="margin-top:6px">Apunta abajo cuánto crédito habéis cargado y te digo cuánto queda.</div>'}
    <div class="row" style="margin-top:8px;gap:6px;flex-wrap:wrap"><input class="town" id="sadIAc" type="number" min="0" step="1" inputmode="decimal" placeholder="Crédito cargado en total ($)" value="${carg||''}" style="flex:1;min-width:0"><button class="btn" id="sadIAg">Guardar</button></div>
    <div class="note" style="margin-top:4px">Cada vez que carguéis crédito, suma lo nuevo aquí (p. ej. 20 + 10 = 30). Es aproximado: lo exacto está en la web de Claude.</div>
    <div class="row" style="margin-top:8px;gap:6px;flex-wrap:wrap"><button class="btn pri" data-iaw="saldo">💳 Ver saldo / cargar</button><button class="btn" data-iaw="coste">📈 Gasto por días</button></div><div class="note" id="sadIAm"></div>`;
  el.querySelectorAll('[data-iaw]').forEach(b=>b.onclick=()=>{const u=IA_WEB[b.dataset.iaw];try{C.abre(u);}catch(e){window.open(u,'_blank');}});
  $('sadIAg').onclick=async()=>{const v=+$('sadIAc').value;if(!(v>=0))return $('sadIAm').textContent='Pon una cantidad.';$('sadIAm').textContent='Guardando…';
    try{const t=await C.cmTok();await C.fsPatch('admin','ia',{cargado:v,cuando:new Date().toISOString()},t.it);gastoIA();}catch(e){$('sadIAm').textContent='❌ '+e.message;}};}
svHook('superadm',async()=>{panel();claves();gastoIA();
  // subtítulo propio en la cabecera (si no, saldría el de la escena «pueblo»)
  setTimeout(()=>{document.querySelectorAll('#t-superadm .pvsT small, #pvSec .pvsT small').forEach(e=>{if($('t-superadm').classList.contains('on'))e.textContent='Solo para Pedro y Sonia';});},150);
  await pendientes(true);});

/* ---------- botón en el menú (grupo Administrador, el primero) ---------- */
function boton(){const sub=document.querySelector('#dgApp + .dsub');if(!sub||$('sadBtn'))return;
  const b=document.createElement('button');b.id='sadBtn';b.dataset.t='superadm';b.style.display='none';
  /* 26 nov. 2026 (Pedro): icono en cuadrado de color, como el resto del menú (antes el emoji ⭐) */
  try{ICP.star=ICP.star||'<path d="M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z"/>';
    ICK.superadm='star';ICC.superadm='#f2a900';}catch(e){}
  b.dataset.emo='⭐ ';b.dataset.txt='Panel de administración';
  b.innerHTML=(document.body.classList.contains('pro')&&typeof icoBox==='function'?icoBox('superadm',16,28):'⭐ ')+'<span>Panel de administración</span><span class="sadN" style="display:none">0</span>';
  b.onclick=()=>{showTab('superadm');try{menu(false);}catch(e){}};sub.prepend(b);}
boton();
// cuando se repintan los iconos del menú, que vuelva el número rojo de pendientes
try{const _ai=applyIcons;applyIcons=function(){_ai.apply(this,arguments);try{pinta();}catch(e){}};}catch(e){}

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
window.addEventListener('bnSesion',()=>setTimeout(sync,50));   // 26 nov. 2026: al cerrar o abrir sesión, al momento
setInterval(sync,120000);
setTimeout(sync,1500);
})();
