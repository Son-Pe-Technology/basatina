/* =====================================================================
   👤 MI CUENTA (16 nov. 2026) · se carga después de comunidad.js
   Cuentas de BasatiNA con correo y contraseña (Firebase Authentication, por REST, sin librerías).
   - Para qué: avisar y votar en «Alertas ciudadanas» (con un apodo público) y guardar Mi Espacio
     en la cuenta para tenerlo en cualquier móvil.
   - Al crear la cuenta se ENLAZA el usuario anónimo que ya tenía el móvil (accounts:update):
     el uid no cambia, así que no se pierden «Mis avisos» ni los votos.
   - Hasta que no se confirma el correo (enlace que manda Firebase) no se puede avisar ni votar.
   - Datos en Firestore (reglas en firestore.rules):
       usuarios/{uid}  → {apodo, apodoK (en minúsculas), creado, cambiado, normas}  · solo lo ve su dueño
       apodos/{apodoK} → {uid}  · reserva del apodo para que no haya dos iguales
       espacio/{uid}   → Mi Espacio: campos d_<clave> (texto JSON) y t_<clave> (cuándo cambió)
   - Sincronización: «gana el cambio más reciente» por cada lista. La primera vez en un móvil se juntan
     las dos (lo del móvil + lo de la cuenta). Las fotos del diario NO se suben (se quedan en el móvil).
     El diario de dolores (saDiario) NO se sube nunca: son datos de salud.
   - Borrar la cuenta: aquí (Mi cuenta → Borrar mi cuenta) o en https://basatina.es/borrar-cuenta.html
     (Google Play exige las dos cosas). Borra perfil, apodo, Mi Espacio, sus avisos y la cuenta.
   Textos legales: docs/privacidad.html (3.1 bis), legal/1-registro… y legal/4-google-play….
   ===================================================================== */
(function(){
if(!window.CMX)return;
const $=id=>document.getElementById(id);
const X=window.CMX,FB=X.FB;
const IT='https://identitytoolkit.googleapis.com/v1/accounts:';
const PRIV_URL='https://basatina.es/privacidad.html#cuentas',NORMAS_URL='https://basatina.es/normas-comunidad.html',BORRAR_URL='https://basatina.es/borrar-cuenta.html';
const CU_NORMAS=2;   // versión de docs/normas-comunidad.html
// lo que se guarda en la cuenta (claves de localStorage). «roads» = Mis carreteras (va dentro de CFG).
const CU_K=['sitios','diario','notas','agendaMia','dpFav','dpMios','cmMios','cmOcultos','cmVotos','roads'];
const CU_NOM={sitios:'Mis sitios secretos',diario:'Mi diario de salidas (sin fotos)',notas:'Notas',agendaMia:'Mi calendario',dpFav:'Equipos y ligas favoritos',dpMios:'Mi calendario deportivo',
  cmMios:'Mis avisos',cmOcultos:'Colaboradores ocultos',cmVotos:'Mis votos',roads:'Mis carreteras'};
// palabras que no se aceptan en el apodo (además de las de las reglas de Firestore)
// (se comparan sin tildes y cambiando 0→o, 1→i, 3→e, 4→a, 5→s, 7→t; los administradores pueden quitar cualquier otro)
const AP_NO=['puta','puto','polla','mierda','gilipo','cabron','maricon','zorra','follar','joder','nazi','hitler','idiota','subnormal','retrasad','negrata','sudaca','admin','basatina','moderad','oficial','sonpe','policia','guardiacivil'];

/* ---------- sesión ---------- */
const jwt=t=>{try{return JSON.parse(decodeURIComponent(escape(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))));}catch(e){return {};}};
const ses=()=>{const a=lsGet('cmAuth',null);return a&&a.it&&jwt(a.it).email?a:null;};     // hay sesión de cuenta (no anónima)
const verif=()=>{const a=ses();return !!(a&&jwt(a.it).email_verified);};
const perfil=()=>{const a=ses(),p=lsGet('cuPerfil',null);return a&&p&&p.uid===a.uid?p:null;};
async function post(m,body,loc){const h={'Content-Type':'application/json'};if(loc)h['X-Firebase-Locale']='es';
  const r=await fetch(IT+m+'?key='+FB.key,{method:'POST',headers:h,body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));
  if(!r.ok){const e=new Error((j.error&&j.error.message)||('HTTP '+r.status));e.code=e.message.split(/[ :]/)[0];throw e;}return j;}
const guarda=j=>{const a={uid:j.localId,it:j.idToken,rt:j.refreshToken,exp:Date.now()+(+j.expiresIn-60)*1000};lsSet('cmAuth',a);return a;};
async function tok(forzar){if(forzar){const a=lsGet('cmAuth',null);if(a){a.exp=0;lsSet('cmAuth',a);}}return X.cmTok();}
const MSG={EMAIL_EXISTS:'Ya hay una cuenta con ese correo. Entra con ella (pestaña «Entrar»).',INVALID_LOGIN_CREDENTIALS:'Correo o contraseña incorrectos.',
  INVALID_PASSWORD:'Correo o contraseña incorrectos.',EMAIL_NOT_FOUND:'Correo o contraseña incorrectos.',INVALID_EMAIL:'Ese correo no es válido.',
  MISSING_PASSWORD:'Escribe la contraseña.',WEAK_PASSWORD:'La contraseña es demasiado débil.',USER_DISABLED:'Esta cuenta está desactivada. Escríbenos a participa@basatina.es.',
  TOO_MANY_ATTEMPTS_TRY_LATER:'Demasiados intentos. Espera unos minutos y prueba otra vez.',CREDENTIAL_TOO_OLD_LOGIN_AGAIN:'Por seguridad, vuelve a escribir tu contraseña.',
  OPERATION_NOT_ALLOWED:'Las cuentas todavía no están activadas. Inténtalo más tarde.',ADMIN_ONLY_OPERATION:'Las cuentas todavía no están activadas. Inténtalo más tarde.',
  'Failed to fetch':'No hay conexión. Revísala y prueba otra vez.'};
const msg=e=>MSG[e.code]||MSG[e.message]||('No se ha podido ('+e.message+').');

/* ---------- perfil y apodo ---------- */
const apKey=a=>a.toLowerCase();
function apMal(a){if(!/^[\p{L}0-9_.-]{3,20}$/u.test(a))return 'El apodo tiene que tener de 3 a 20 letras o números (sin espacios; vale . - _).';
  const k=apKey(a).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[0-9_.-]/g,m=>({'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t'}[m]||''));
  if(AP_NO.some(w=>k.includes(w)))return 'Ese apodo no se puede usar. Elige otro.';
  if(/@|\d{6,}/.test(a))return 'No pongas tu correo ni números de teléfono en el apodo.';return '';}
async function apLibre(a){try{await X.fs('/apodos/'+encodeURIComponent(apKey(a)));return false;}catch(e){if(e.status===404)return true;throw e;}}
async function cargaPerfil(){const a=ses();if(!a)return null;const u=await tok();
  try{const p=X.decD(await X.fs('/usuarios/'+u.uid,{},u.it));p.uid=u.uid;lsSet('cuPerfil',p);return p;}
  catch(e){if(e.status===404||e.status===403){lsSet('cuPerfil',null);return null;}throw e;}}
async function creaPerfil(apodo){const u=await tok(),k=apKey(apodo);
  await X.fsCommit([{update:{name:X.nom('usuarios',u.uid),fields:X.encF({apodo,apodoK:k,normas:CU_NORMAS})},currentDocument:{exists:false},
      updateTransforms:[{fieldPath:'creado',setToServerValue:'REQUEST_TIME'},{fieldPath:'cambiado',setToServerValue:'REQUEST_TIME'}]},
    {update:{name:X.nom('apodos',k),fields:X.encF({uid:u.uid})},currentDocument:{exists:false}}],u.it);
  lsSet('cmNormas',Math.max(lsGet('cmNormas',0),CU_NORMAS));return cargaPerfil();}
async function cambiaApodo(apodo){const u=await tok(),p=perfil(),k=apKey(apodo);
  const W=[{update:{name:X.nom('usuarios',u.uid),fields:X.encF({apodo,apodoK:k})},updateMask:{fieldPaths:['apodo','apodoK']},currentDocument:{exists:true},
      updateTransforms:k===p.apodoK?[]:[{fieldPath:'cambiado',setToServerValue:'REQUEST_TIME'}]}];
  if(k!==p.apodoK)W.push({update:{name:X.nom('apodos',k),fields:X.encF({uid:u.uid})},currentDocument:{exists:false}},{delete:X.nom('apodos',p.apodoK)});
  await X.fsCommit(W,u.it);return cargaPerfil();}

/* ---------- alta, entrada, salida ---------- */
async function alta(email,pass,apodo){
  // 1) el apodo, libre
  if(!(await apLibre(apodo)))throw Object.assign(new Error('apodo'),{code:'APODO'});
  // 2) enlazar el usuario anónimo del móvil (mismo uid) o crear uno nuevo
  let a=lsGet('cmAuth',null),j;
  if(a&&!ses()){try{const u=await tok();j=await post('update',{idToken:u.it,email,password:pass,returnSecureToken:true});}
    catch(e){if(e.code==='EMAIL_EXISTS'||e.code==='INVALID_EMAIL'||e.code==='WEAK_PASSWORD')throw e;j=null;}}
  if(!j)j=await post('signUp',{email,password:pass,returnSecureToken:true});
  // 3) entrar de nuevo con correo y contraseña (token limpio de cuenta)
  j=await post('signInWithPassword',{email,password:pass,returnSecureToken:true});guarda(j);
  // 4) perfil + apodo y 5) correo de confirmación
  try{await creaPerfil(apodo);}catch(e){console.log('perfil',e);}
  await post('sendOobCode',{requestType:'VERIFY_EMAIL',idToken:j.idToken},1).catch(()=>{});
  lsSet('cuSync',null);}
async function entra(email,pass){const j=await post('signInWithPassword',{email,password:pass,returnSecureToken:true});guarda(j);lsSet('cuSync',null);
  await cargaPerfil().catch(()=>null);if(verif())await cuSync(1).catch(()=>{});}
function sale(){lsSet('cmAuth',null);lsSet('cuPerfil',null);lsSet('cuSync',null);}
async function borraCuenta(pass){const a=ses();const email=jwt(a.it).email;
  const j=await post('signInWithPassword',{email,password:pass,returnSecureToken:true});const it=j.idToken,uid=j.localId;
  let mios=[];try{mios=await X.fsQuery('avisos_priv','autor',uid,it);}catch(e){}
  let p=null;try{p=X.decD(await X.fs('/usuarios/'+uid,{},it));}catch(e){}
  const W=[];mios.forEach(m=>W.push({delete:X.nom('avisos',m.id)},{delete:X.nom('avisos_priv',m.id)}));
  W.push({delete:X.nom('espacio',uid)},{delete:X.nom('usuarios',uid)},{delete:X.nom('limites',uid)});if(p&&p.apodoK)W.push({delete:X.nom('apodos',p.apodoK)});
  for(let i=0;i<W.length;i+=400)await X.fsCommit(W.slice(i,i+400),it);
  await post('delete',{idToken:it});sale();lsSet('cmMios',[]);}

/* ---------- Mi Espacio en la cuenta ---------- */
let CUQ=0,CUT=null,CUBUSY=0;
const meta=()=>Object.assign({uid:null,t:{},roads:null,ult:0},lsGet('cuSync',{}));
const lee=k=>{if(k==='roads')return JSON.stringify((typeof CFG!=='undefined'&&CFG.roads)||[]);try{return localStorage.getItem(k);}catch(e){return null;}};
function pon(k,v){CUQ=1;try{if(k==='roads'){if(typeof CFG!=='undefined'){CFG.roads=JSON.parse(v||'[]');cfgSave();}}else if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){}CUQ=0;}
function junta(a,b){let x,y;try{x=JSON.parse(a);}catch(e){}try{y=JSON.parse(b);}catch(e){}if(x==null)return b;if(y==null)return a;
  const une=(p,q)=>{const s=new Map();[...q,...p].forEach(o=>s.set(o&&typeof o==='object'?(o.id||JSON.stringify(o)):JSON.stringify(o),o));return [...s.values()];};
  if(Array.isArray(x)&&Array.isArray(y))return JSON.stringify(une(x,y));
  if(typeof x==='object'&&typeof y==='object'){const r=Object.assign({},y,x);for(const k in r)if(Array.isArray(x[k])&&Array.isArray(y[k]))r[k]=une(x[k],y[k]);return JSON.stringify(r);}
  return a;}
// avisar de cambios: cualquier guardado de esas claves marca la hora y programa la subida
(function(){const _s=Storage.prototype.setItem,_r=Storage.prototype.removeItem;
  const marca=k=>{if(CUQ||!(CU_K.includes(k)||k==='cfg'))return;if(k==='cfg'){const m=meta();if(lee('roads')===m.roads)return;k='roads';}
    const m=meta();m.t[k]=Date.now();CUQ=1;try{_s.call(localStorage,'cuSync',JSON.stringify(m));}catch(e){}CUQ=0;programa();};
  Storage.prototype.setItem=function(k,v){_s.call(this,k,v);if(this===localStorage&&k!=='cuSync')marca(k);};
  Storage.prototype.removeItem=function(k){_r.call(this,k);if(this===localStorage&&k!=='cuSync')marca(k);};})();
function programa(){if(!verif())return;clearTimeout(CUT);CUT=setTimeout(()=>cuSync().catch(e=>console.log('sync',e)),15000);}
async function cuSync(aviso){if(!verif()||CUBUSY)return;CUBUSY=1;
  try{const u=await tok(),m=meta(),primera=m.uid!==u.uid;let R={};
    try{R=X.decD(await X.fs('/espacio/'+u.uid,{},u.it));}catch(e){if(e.status!==404)throw e;}
    let sube=0,baja=0;
    for(const k of CU_K){const lt=m.t[k]||0,rt=+R['t_'+k]||0,lv=lee(k),rv=R['d_'+k];
      if(primera){if(rv!=null){const v=junta(lv,rv);if(v!==lv){pon(k,v);baja++;}if(v!==rv)sube=1;}else if(lv!=null)sube=1;m.t[k]=Math.max(lt,rt,1);}
      else if(rt>lt&&rv!=null){if(rv!==lv){pon(k,rv);baja++;}m.t[k]=rt;}
      else if(lt>rt)sube=1;}
    m.uid=u.uid;m.roads=lee('roads');
    if(sube){const F={};for(const k of CU_K){const v=lee(k);if(v!=null){F['d_'+k]=v;F['t_'+k]=m.t[k]||Date.now();}}
      const tam=JSON.stringify(F).length;if(tam>900000)throw new Error('Mi Espacio ocupa demasiado para guardarlo en la cuenta ('+Math.round(tam/1000)+' kB)');
      await X.fs('/espacio/'+u.uid,{method:'PATCH',body:JSON.stringify({fields:X.encF(F)})},u.it);}
    m.ult=Date.now();lsSet('cuSync',m);
    if(baja){if(aviso)toast('☁️ Mi Espacio traído de tu cuenta');try{if($('t-cuenta')&&$('t-cuenta').classList.contains('on'))cuRender();}catch(e){}}
    return {sube,baja};}
  finally{CUBUSY=0;}}
// al abrir la app y al volver a ella
setTimeout(()=>{if(verif())cuSync(1).catch(e=>console.log('sync',e));},4000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&verif()&&Date.now()-meta().ult>60000)cuSync(1).catch(()=>{});});

/* ---------- pantalla ---------- */
let CUV='entrar';
svSec('cuenta',`<div class="card"><b>👤 Mi cuenta de BasatiNA</b><div class="note" style="margin-top:4px;line-height:1.5">Gratis y opcional para usar la app. Con una cuenta puedes <b>avisar y votar</b> en 📣 Alertas ciudadanas (sale tu apodo, nunca tu correo) y tener <b>Mi Espacio en todos tus móviles</b>.</div></div>
 <div id="cuBody"></div>
 <div class="note" style="margin:0 6px 12px"><a href="#" id="cuPri">Privacidad</a> · <a href="#" id="cuNor">Normas de la comunidad</a></div>`);
$('cuPri').onclick=e=>{e.preventDefault();X.abre(PRIV_URL);};$('cuNor').onclick=e=>{e.preventDefault();X.abre(NORMAS_URL);};
const inp=(id,type,ph,extra)=>`<input id="${id}" class="town" type="${type}" placeholder="${ph}" ${extra||''} style="width:100%;box-sizing:border-box;margin-top:6px">`;
const pwd=(id,ph)=>`<div style="position:relative">${inp(id,'password',ph,'autocomplete="'+(id==='cuP1'||id==='cuNP'?'new-password':'current-password')+'"')}<button class="btn" type="button" data-ver="${id}" style="position:absolute;right:4px;top:9px;padding:4px 8px">👁️</button></div>`;
function ojos(el){el.querySelectorAll('[data-ver]').forEach(b=>b.onclick=()=>{const i=$(b.dataset.ver);i.type=i.type==='password'?'text':'password';});}

async function cuRender(){const el=$('cuBody');if(!el)return;const a=ses();
  if(!a)return cuFuera(el);
  if(!verif()){const email=jwt(a.it).email;
    el.innerHTML=`<div class="card"><b>📧 Confirma tu correo</b><div class="note" style="margin-top:4px;line-height:1.5">Te hemos enviado un correo a <b>${esc(email)}</b> con un enlace. Púlsalo y vuelve aquí.<br>Si no lo ves, mira en <b>spam</b> o «Promociones». Lo envía <i>noreply@basatina-9a8b5.firebaseapp.com</i>.<br>⏳ Si no lo confirmas en <b>30 días</b>, la cuenta se borra sola.</div>
      <div class="row" style="margin-top:8px;flex-wrap:wrap;gap:6px"><button class="btn pri" id="cuYa">✅ Ya lo he confirmado</button><button class="btn" id="cuRe">📨 Enviar otra vez</button></div><div class="note" id="cuM"></div></div>
     <div class="card"><div class="row"><button class="btn" id="cuOut">Cerrar sesión</button></div></div>`;
    $('cuYa').onclick=async()=>{$('cuM').textContent='Comprobando…';try{await tok(1);if(verif()){await cargaPerfil().catch(()=>{});await cuSync(1).catch(()=>{});toast('✅ ¡Correo confirmado!');cuRender();}else $('cuM').textContent='Todavía no consta como confirmado. Pulsa el enlace del correo y prueba otra vez.';}catch(e){$('cuM').textContent='❌ '+msg(e);}};
    $('cuRe').onclick=async()=>{try{const u=await tok();await post('sendOobCode',{requestType:'VERIFY_EMAIL',idToken:u.it},1);$('cuM').textContent='📨 Enviado otra vez. Mira también en spam.';}catch(e){$('cuM').textContent='❌ '+msg(e);}};
    $('cuOut').onclick=()=>{sale();cuRender();};return;}
  let p=perfil();if(!p){el.innerHTML='<div class="card"><div class="note">Cargando tu cuenta…</div></div>';try{p=await cargaPerfil();}catch(e){}}
  if(!p)return cuApodo(el,null);
  const m=meta(),email=jwt(a.it).email;
  el.innerHTML=`<div class="card"><div class="row" style="align-items:center;gap:10px"><div style="font-size:40px">👤</div><div style="flex:1"><b style="font-size:19px">${esc(p.apodo)}</b><div class="note">${esc(email)} · ✅ correo confirmado</div></div></div>
     ${p.quitado&&/^Vecino\d{4}$/.test(p.apodo)?`<div class="note" style="margin-top:6px;color:#b71c1c">🏷️ Un administrador cambió tu apodo anterior porque no cumplía las normas. Puedes elegir otro.</div>`:''}</div>
   <div class="card"><b>☁️ Mi Espacio en la cuenta</b><div class="note" style="margin-top:4px;line-height:1.5">Se guarda solo: ${CU_K.map(k=>CU_NOM[k]).join(', ')}.<br>Las <b>fotos</b> del diario y el <b>diario de dolores</b> se quedan solo en este móvil.</div>
     <div class="note" id="cuSy" style="margin-top:4px">${m.ult?'Última vez: '+new Date(m.ult).toLocaleString('es-ES',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'Todavía no se ha guardado.'}</div>
     <div class="row" style="margin-top:6px"><button class="btn" id="cuSn">🔄 Guardar y traer ahora</button></div></div>
   <div class="card"><b>⚙️ Cuenta</b><div class="row" style="margin-top:6px;flex-wrap:wrap;gap:6px"><button class="btn" id="cuCA">🏷️ Cambiar apodo</button><button class="btn" id="cuCP">🔑 Cambiar contraseña</button><button class="btn" id="cuOut">🚪 Cerrar sesión</button></div><div id="cuX"></div></div>
   <div class="card"><b>🗑️ Borrar mi cuenta</b><div class="note" style="margin-top:4px">Se borran tu cuenta, tu apodo, Mi Espacio guardado en la cuenta y tus avisos. Lo que tengas en este móvil no se toca. No se puede deshacer.</div>
     <div class="row" style="margin-top:6px"><button class="btn" id="cuDel" style="color:#b71c1c">Borrar mi cuenta</button></div><div id="cuDX"></div></div>`;
  $('cuSn').onclick=async()=>{$('cuSy').textContent='Guardando…';try{const r=await cuSync(1);$('cuSy').textContent='✅ Hecho'+(r&&r.baja?' (se han traído cambios de la cuenta)':'');}catch(e){$('cuSy').textContent='❌ '+msg(e);}};
  $('cuOut').onclick=()=>{if(!confirm('¿Cerrar sesión en este móvil? Lo que tienes en Mi Espacio se queda en el móvil.'))return;sale();toast('🚪 Sesión cerrada');cuRender();};
  $('cuCA').onclick=()=>cuApodo($('cuX'),p);
  $('cuCP').onclick=()=>{$('cuX').innerHTML=`<div class="card" style="margin-top:6px">${pwd('cuOP','Contraseña actual')}${pwd('cuNP','Contraseña nueva (8 o más caracteres)')}<div class="row" style="margin-top:6px"><button class="btn pri" id="cuPok">Guardar</button></div><div class="note" id="cuPm"></div></div>`;ojos($('cuX'));
    $('cuPok').onclick=async()=>{const n=$('cuNP').value;if(n.length<8)return $('cuPm').textContent='La contraseña nueva tiene que tener 8 caracteres o más.';$('cuPm').textContent='Guardando…';
      try{const j=await post('signInWithPassword',{email,password:$('cuOP').value,returnSecureToken:true});const k=await post('update',{idToken:j.idToken,password:n,returnSecureToken:true});guarda(k);$('cuX').innerHTML='<div class="note" style="margin-top:6px">✅ Contraseña cambiada.</div>';}
      catch(e){$('cuPm').textContent='❌ '+msg(e);}};};
  $('cuDel').onclick=()=>{$('cuDX').innerHTML=`<div class="card" style="margin-top:6px"><div class="note">Escribe tu contraseña para confirmar.</div>${pwd('cuDP','Contraseña')}<div class="row" style="margin-top:6px"><button class="btn" id="cuDok" style="color:#fff;background:#c62828">🗑️ Borrar para siempre</button></div><div class="note" id="cuDm"></div></div>`;ojos($('cuDX'));
    $('cuDok').onclick=async()=>{if(!confirm('¿Seguro? Se borra tu cuenta y no se puede recuperar.'))return;$('cuDm').textContent='Borrando…';
      try{await borraCuenta($('cuDP').value);toast('🗑️ Cuenta borrada');cuRender();}catch(e){$('cuDm').textContent='❌ '+msg(e);}};};}

function cuFuera(el){
  el.innerHTML=`<div class="card"><div class="seg" id="cuSeg" style="flex-wrap:wrap"><button class="btn" data-v="entrar">Entrar</button><button class="btn" data-v="alta">Crear cuenta</button><button class="btn" data-v="olvido">¿Olvidaste la contraseña?</button></div><div id="cuF"></div></div>`;
  $('cuSeg').querySelectorAll('button').forEach(b=>{b.classList.toggle('on',b.dataset.v===CUV);b.onclick=()=>{CUV=b.dataset.v;cuFuera(el);};});
  const f=$('cuF');
  if(CUV==='entrar'){f.innerHTML=`${inp('cuE','email','Tu correo','autocomplete="email"')}${pwd('cuP','Contraseña')}<div class="row" style="margin-top:8px"><button class="btn pri" id="cuOk" style="flex:1">Entrar</button></div><div class="note" id="cuM"></div>`;ojos(f);
    $('cuP').onkeydown=e=>{if(e.key==='Enter')$('cuOk').click();};
    $('cuOk').onclick=async()=>{const e1=$('cuE').value.trim();if(!e1||!$('cuP').value)return $('cuM').textContent='Escribe tu correo y tu contraseña.';$('cuM').textContent='Entrando…';
      try{await entra(e1,$('cuP').value);toast('👋 ¡Hola de nuevo!');cuRender();}catch(e){$('cuM').textContent='❌ '+msg(e);}};}
  else if(CUV==='olvido'){f.innerHTML=`<div class="note" style="margin-top:6px">Te mandamos un correo con un enlace para poner una contraseña nueva.</div>${inp('cuE','email','Tu correo','autocomplete="email"')}<div class="row" style="margin-top:8px"><button class="btn pri" id="cuOk" style="flex:1">Enviar enlace</button></div><div class="note" id="cuM"></div>`;
    $('cuOk').onclick=async()=>{const e1=$('cuE').value.trim();if(!e1)return $('cuM').textContent='Escribe tu correo.';
      try{await post('sendOobCode',{requestType:'PASSWORD_RESET',email:e1},1);}catch(e){if(e.code!=='EMAIL_NOT_FOUND')return $('cuM').textContent='❌ '+msg(e);}
      $('cuM').textContent='📨 Si ese correo tiene cuenta, te llegará el enlace en unos minutos (mira también en spam).';};}
  else{f.innerHTML=`${inp('cuE','email','Tu correo','autocomplete="email"')}${pwd('cuP1','Contraseña (8 o más caracteres)')}${inp('cuA','text','Apodo público (lo que verán los demás)','maxlength="20" autocomplete="off"')}
      <div class="note" style="margin-top:4px">El apodo sale en tus avisos. No pongas tu nombre y apellidos ni tu correo: mejor algo como «Montañero_Ultzama».</div>
      <label class="note" style="display:flex;gap:8px;align-items:flex-start;margin-top:8px"><input type="checkbox" id="cuC1"> <span>Tengo <b>14 años o más</b>.</span></label>
      <label class="note" style="display:flex;gap:8px;align-items:flex-start;margin-top:6px"><input type="checkbox" id="cuC2"> <span>Acepto las <a href="#" id="cuNo">Normas de la comunidad</a> y he leído la <a href="#" id="cuPr">política de privacidad</a>.</span></label>
      <div class="note" style="margin-top:6px;line-height:1.5">ℹ️ Tu correo y tu contraseña los guarda Google Firebase (nosotros no vemos la contraseña). El correo solo lo usamos para tu cuenta: nada de publicidad.</div>
      <div class="row" style="margin-top:8px"><button class="btn pri" id="cuOk" style="flex:1">Crear mi cuenta</button></div><div class="note" id="cuM"></div>`;ojos(f);
    $('cuNo').onclick=e=>{e.preventDefault();X.abre(NORMAS_URL);};$('cuPr').onclick=e=>{e.preventDefault();X.abre(PRIV_URL);};
    $('cuOk').onclick=async()=>{const m=$('cuM'),e1=$('cuE').value.trim(),p1=$('cuP1').value,ap=$('cuA').value.trim();
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e1))return m.textContent='Escribe un correo válido.';
      if(p1.length<8)return m.textContent='La contraseña tiene que tener 8 caracteres o más.';
      const am=apMal(ap);if(am)return m.textContent=am;
      if(!($('cuC1').checked&&$('cuC2').checked))return m.textContent='Marca las dos casillas para crear la cuenta.';
      m.textContent='Creando tu cuenta…';$('cuOk').disabled=true;
      try{await alta(e1,p1,ap);toast('✅ Cuenta creada. Confirma tu correo');cuRender();}
      catch(e){$('cuOk').disabled=false;m.textContent=e.code==='APODO'?'❌ Ese apodo ya lo tiene otra persona. Prueba con otro.':'❌ '+msg(e);}};}}

function cuApodo(el,p){
  el.innerHTML=`<div class="card"${p?' style="margin-top:6px"':''}><b>🏷️ ${p?'Cambiar apodo':'Elige tu apodo'}</b><div class="note" style="margin-top:4px">Sale en tus avisos. De 3 a 20 letras o números, sin espacios. ${p?'Solo se puede cambiar una vez al día.':''}</div>
    ${inp('cuA2','text','Apodo','maxlength="20" autocomplete="off" value="'+esc(p?p.apodo:'')+'"')}
    ${p?'':`<label class="note" style="display:flex;gap:8px;align-items:flex-start;margin-top:8px"><input type="checkbox" id="cuC3"> <span>Tengo 14 años o más y acepto las <a href="#" id="cuNo2">Normas de la comunidad</a>.</span></label>`}
    <div class="row" style="margin-top:8px"><button class="btn pri" id="cuAok">Guardar</button></div><div class="note" id="cuAm"></div></div>`;
  if($('cuNo2'))$('cuNo2').onclick=e=>{e.preventDefault();X.abre(NORMAS_URL);};
  $('cuAok').onclick=async()=>{const ap=$('cuA2').value.trim(),m=$('cuAm'),am=apMal(ap);if(am)return m.textContent=am;
    if(!p&&!$('cuC3').checked)return m.textContent='Marca la casilla para seguir.';
    if(p&&ap===p.apodo)return m.textContent='Es el mismo apodo que ya tienes.';
    m.textContent='Guardando…';
    try{if(apKey(ap)!==(p&&p.apodoK)&&!(await apLibre(ap)))return m.textContent='❌ Ese apodo ya lo tiene otra persona.';
      p?await cambiaApodo(ap):await creaPerfil(ap);toast('🏷️ Apodo guardado');cuRender();}
    catch(e){m.textContent=e.status===403&&p?'❌ No se ha podido: el apodo solo se puede cambiar una vez al día.':'❌ '+msg(e);}};}

svHook('cuenta',cuRender);
svBtn(svDsub('Mi Espacio'),'cuenta','👤 Mi cuenta',true);
Object.assign(TITLES,{cuenta:'👤 Mi cuenta'});
try{PVS_ESC.cuenta='pueblo';}catch(e){}
try{ICK.cuenta='user-circle';ICC.cuenta='#5e35b1';BNK.cuenta='i-libro';BNF.cuenta='b';}catch(e){}
try{if(typeof applyIcons==='function')applyIcons((CFG.iconos||'pro')==='pro');}catch(e){}

window.CU={ok:verif,sesion:ses,perfil,cargaPerfil,sync:cuSync,ir:v=>{if(v&&!ses())CUV=v;showTab('cuenta');try{menu(false);}catch(e){}}};

/* ---------- 👋 bienvenida (una sola vez por móvil, si no hay sesión) ---------- */
function bienvenida(){if(ses()||lsGet('cuBienv',0)||$('cuBv'))return;
  if(document.querySelector('#muBox,#nvLang,#pinBox[style*="flex"]'))return setTimeout(bienvenida,8000);   // si hay otra ventana abierta, más tarde
  lsSet('cuBienv',1);const o=document.createElement('div');o.id='cuBv';o.className='nvMu';
  o.innerHTML=`<div><div style="text-align:center"><img src="logo.png" alt="" style="width:72px;height:auto;object-fit:contain"><h2 style="margin:6px 0 2px">Bienvenido a Basati<span style="color:#DD4826">NA</span></h2><div class="note">Navarra en tu bolsillo</div></div>
    <div class="note" style="margin-top:12px;line-height:1.5">Crea tu cuenta gratis y podrás:</div>
    <ul class="note" style="margin:4px 0 0;padding-left:20px;line-height:1.5"><li>📣 <b>Avisar y votar</b> en las Alertas ciudadanas.</li><li>☁️ Tener <b>Mi Espacio</b> (sitios, diario, calendarios…) en todos tus móviles.</li></ul>
    <div class="note" style="margin-top:8px">Los ríos, el tiempo y todo lo demás funcionan igual sin cuenta.</div>
    <button class="btn pri" id="cuBvA" style="width:100%;margin-top:14px">Crear cuenta</button>
    <button class="btn" id="cuBvE" style="width:100%;margin-top:8px">Ya tengo cuenta: entrar</button>
    <button class="btn" id="cuBvN" style="width:100%;margin-top:8px;background:transparent;box-shadow:none;opacity:.8">Seguir sin cuenta</button></div>`;
  document.body.appendChild(o);const fin=v=>{o.remove();if(v)CU.ir(v);};
  $('cuBvA').onclick=()=>fin('alta');$('cuBvE').onclick=()=>fin('entrar');$('cuBvN').onclick=()=>fin(null);o.onclick=e=>{if(e.target===o)fin(null);};}
setTimeout(bienvenida,2500);

/* ---------- 📊 contador anónimo de uso ----------
   Cada móvil (o navegador) suma +1 la primera vez que abre BasatiNA cada día y cada mes, en
   estadisticas/AAAA-MM-DD y estadisticas/AAAA-MM: «activos», «app» o «web» y, la primera vez de todas, «nuevos».
   No se envía ningún identificador: el móvil solo recuerda en qué día y mes ya contó. Lo leen los administradores
   en Alertas ciudadanas → 🛡️ Moderar → 📊 Usuarios. */
async function cuenta1(){const d=new Date(),p=n=>String(n).padStart(2,'0'),dia=`${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`,mes=dia.slice(0,7);
  const st=Object.assign({dia:'',mes:'',ya:0},lsGet('stUso',{})),tipo=(typeof APP!=='undefined'&&APP)?'app':'web',W=[];
  const inc=(doc,campos)=>({transform:{document:X.nom('estadisticas',doc),fieldTransforms:campos.map(f=>({fieldPath:f,increment:{integerValue:'1'}}))}});
  if(st.dia!==dia)W.push(inc(dia,['activos',tipo,...(st.ya?[]:['nuevos'])]));
  if(st.mes!==mes)W.push(inc(mes,['activos',tipo,...(st.ya?[]:['nuevos'])]));
  if(!W.length)return;
  try{await X.fsCommit(W);lsSet('stUso',{dia,mes,ya:1});}catch(e){console.log('uso',e);}}
setTimeout(cuenta1,5000);
// si un administrador ha cambiado el apodo, que se entere al abrir la app
setTimeout(()=>{if(verif())cargaPerfil().catch(()=>{});},6000);
})();
