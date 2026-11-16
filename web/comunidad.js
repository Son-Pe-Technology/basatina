/* =====================================================================
   📣 COMUNIDAD DE AVISOS (nov. 2026) · se carga después de mejoras.js
   Avisos anónimos de la gente (árbol caído, desprendimiento, cebos envenenados…).
   - Base de datos: Firebase Cloud Firestore (proyecto basatina-9a8b5, Madrid), por su interfaz web (REST),
     sin librerías. Reglas de seguridad: firestore.rules (se pegan a mano en la consola de Firebase).
   - Cada móvil entra con el «acceso anónimo» de Firebase: su uid es el «código de colaborador».
   - Desde el 16 nov. 2026, para avisar y votar hace falta una cuenta (web/cuenta.js): correo confirmado + apodo.
     Al crear la cuenta se «enlaza» el usuario anónimo, así que el uid no cambia y no se pierden los avisos.
     La sesión (anónima o de cuenta) se guarda en localStorage «cmAuth». Denunciar sigue sin cuenta.
   - Los administradores moderan desde la pestaña 🛡️ Moderar (solo en modo Administrador),
     entrando con administracion@sonpe-technology.es y su contraseña (solo dura la sesión).
   - Textos legales: docs/privacidad.html, docs/normas-comunidad.html, legal/*.md
   Si se cambian los tipos o sus horas, cambiarlos también en firestore.rules (función horas()).
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const FB={key:'AIzaSyBkD97y7lqjMS0sA7zClhQkqZlEgXtkeqk',p:'basatina-9a8b5'};
const DOCS=`projects/${FB.p}/databases/(default)/documents`, FS='https://firestore.googleapis.com/v1/'+DOCS;
const ADMIN_MAIL='administracion@sonpe-technology.es';
const CM_MODS=['Pedro','Sonia'];   // quién modera (para el registro de moderación)
// [clave, icono, nombre, horas que dura, ¿revisión previa?]
const CM_T=[['arbol','🌳','Árbol caído',72],['desprendimiento','🪨','Desprendimiento',72],['camino','🚧','Camino o carretera cortada',72],
  ['lluvia','🌧️','Lluvia muy intensa o granizo',6],['crecida','🌊','Crecida del río',24],['animal','🐗','Animal suelto en la carretera',6],
  ['accidente','🚑','Accidente',6,1],['veneno','☠️','Cebos envenenados',168,1],['otro','❓','Otro',24,1]];
const CMT=Object.fromEntries(CM_T.map(t=>[t[0],t]));
const CM_MOT={datos:'Contiene datos personales de otra persona',acusa:'Acusa a una persona concreta',falso:'Aviso falso o no comprobable',
  yano:'Ya no está / desactualizado',ofensivo:'Lenguaje ofensivo o contenido inapropiado',notema:'No es un aviso (publicidad, política, otro tema)',ilegal:'Contenido ilegal',otro:'Otro motivo'};
const CM_NORMAS=2;   // versión de las normas aceptadas (2 = con cuentas, 16 nov. 2026)
const NORMAS_URL='https://basatina.es/normas-comunidad.html',PRIV_URL='https://basatina.es/privacidad.html#comunidad';
const abre=u=>{try{if(typeof foOpenUrl==='function')return foOpenUrl(u);}catch(e){}window.open(u,'_blank');};
const dudoso=t=>/[0-9]{4}[ -]?[BCDFGHJKLMNPRSTVWXYZ]{3}/i.test(t)||/([0-9][ .-]?){9}/.test(t)||/@/.test(t);
const hace=ms=>{const m=Math.round((Date.now()-ms)/6e4);return m<1?'ahora mismo':m<60?`hace ${m} min`:m<1440?`hace ${Math.round(m/60)} h`:`hace ${Math.round(m/1440)} días`;};
const rnd=n=>{const a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',b=crypto.getRandomValues(new Uint8Array(n));return [...b].map(x=>a[x%62]).join('');};

/* ---------- valores de Firestore ---------- */
function enc(v){if(typeof v==='number')return Number.isInteger(v)?{integerValue:String(v)}:{doubleValue:v};if(typeof v==='boolean')return {booleanValue:v};if(v==null)return {nullValue:null};return {stringValue:String(v)};}
const encF=o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,enc(v)]));
function dec(v){if(!v)return null;if('stringValue' in v)return v.stringValue;if('integerValue' in v)return +v.integerValue;if('doubleValue' in v)return +v.doubleValue;
  if('timestampValue' in v)return Date.parse(v.timestampValue);if('booleanValue' in v)return v.booleanValue;return null;}
const decD=d=>{const o={id:d.name.split('/').pop()};for(const [k,v] of Object.entries(d.fields||{}))o[k]=dec(v);return o;};

/* ---------- acceso anónimo (código de colaborador) ---------- */
async function fbAuthPost(url,body,form){const r=await fetch(url,{method:'POST',headers:{'Content-Type':form?'application/x-www-form-urlencoded':'application/json'},body:form?new URLSearchParams(body):JSON.stringify(body)});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error((j.error&&j.error.message)||('HTTP '+r.status));return j;}
async function refresca(rt){const j=await fbAuthPost('https://securetoken.googleapis.com/v1/token?key='+FB.key,{grant_type:'refresh_token',refresh_token:rt},1);
  return {uid:j.user_id,it:j.id_token,rt:j.refresh_token,exp:Date.now()+(+j.expires_in-60)*1000};}
async function cmTok(){let a=lsGet('cmAuth',null);
  if(a&&a.it&&a.exp>Date.now())return a;
  try{if(a&&a.rt){a=Object.assign(a,await refresca(a.rt));lsSet('cmAuth',a);return a;}}catch(e){}
  const j=await fbAuthPost('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='+FB.key,{returnSecureToken:true});
  a={uid:j.localId,it:j.idToken,rt:j.refreshToken,exp:Date.now()+(+j.expiresIn-60)*1000};lsSet('cmAuth',a);return a;}
// marca anónima del colaborador (para «ocultar sus avisos»): no permite saber quién es ni su código
const cmAh=uid=>sha256hex('basatina:'+uid).slice(0,12);
// administrador: entra con correo y contraseña; solo dura esta sesión
const admGet=()=>{try{return JSON.parse(sessionStorage.getItem('cmAdm')||'null');}catch(e){return null;}};
const admSet=a=>{try{a?sessionStorage.setItem('cmAdm',JSON.stringify(a)):sessionStorage.removeItem('cmAdm');}catch(e){}};
async function admTok(){let a=admGet();if(!a)return null;if(a.exp>Date.now())return a.it;try{a=Object.assign(a,await refresca(a.rt));admSet(a);return a.it;}catch(e){admSet(null);return null;}}

/* ---------- llamadas a la base de datos ---------- */
async function fs(path,opt,tok){const h={'Content-Type':'application/json'};if(tok)h.Authorization='Bearer '+tok;
  const r=await fetch(path.startsWith('http')?path:FS+path,Object.assign({headers:h},opt||{}));const j=await r.json().catch(()=>({}));
  if(!r.ok){const e=new Error((j.error&&j.error.message)||('HTTP '+r.status));e.status=r.status;throw e;}return j;}
async function fsQuery(col,campo,val,tok){const j=await fs(':runQuery',{method:'POST',body:JSON.stringify({structuredQuery:{from:[{collectionId:col}],
  where:campo?{fieldFilter:{field:{fieldPath:campo},op:'EQUAL',value:enc(val)}}:undefined,limit:500}})},tok);return (j||[]).filter(x=>x.document).map(x=>decD(x.document));}
const fsCommit=(writes,tok)=>fs(':commit',{method:'POST',body:JSON.stringify({writes})},tok);
const nom=(col,id)=>`${DOCS}/${col}/${id}`;
const fsPatch=(col,id,obj,tok)=>fs(`/${col}/${id}?`+Object.keys(obj).map(k=>'updateMask.fieldPaths='+encodeURIComponent(k)).join('&'),{method:'PATCH',body:JSON.stringify({fields:encF(obj)})},tok);
const fsDel=(col,id,tok)=>fs(`/${col}/${id}`,{method:'DELETE'},tok);

// herramientas compartidas con web/cuenta.js
window.CMX={FB,DOCS,fbAuthPost,refresca,cmTok,fs,fsQuery,fsCommit,fsPatch,fsDel,nom,enc,encF,dec,decD,rnd,abre};
const CU=()=>window.CU||{ok:()=>false,perfil:()=>null,ir:()=>showTab('cuenta')};
// pide cuenta confirmada; si no la hay, explica y lleva a «Mi cuenta»
function pideCuenta(que){if(CU().ok()&&CU().perfil())return true;
  if(confirm('Para '+que+' necesitas una cuenta de BasatiNA (gratis, con tu correo y un apodo).'+(CU().sesion&&CU().sesion()?' Te falta confirmar el correo o elegir el apodo.':'')+'\n\n¿Ir a «Mi cuenta»?'))CU().ir();return false;}

/* ---------- estado local ---------- */
let CMV='mapa',CMA=[],CMSEL=null,CMM=null,CMF=null,CMPT=null,CMTIPO=null,CMCARGA=0;
const ocultos=()=>Object.assign({ids:[],ah:[]},lsGet('cmOcultos',{}));
const vigente=a=>a.estado==='publicado'&&a.creado&&CMT[a.tipo]&&Date.now()<a.creado+CMT[a.tipo][3]*36e5&&!(a.no>=3&&a.no>a.si);
async function cmCargar(){CMCARGA=1;try{const L=await fsQuery('avisos','estado','publicado'),O=ocultos();
    CMA=L.filter(a=>vigente(a)&&!O.ids.includes(a.id)&&!(a.ah&&O.ah.includes(a.ah))).sort((a,b)=>b.creado-a.creado);CMCARGA=2;}
  catch(e){CMCARGA=3;CMA=[];console.log('comunidad',e);}}
let PBL=null;function pueblo(la,lo){if(!PBL){const P=window.PUEBLOS;if(!P)return '';PBL=P.pueblos.map(p=>[p.pt[0],p.pt[1],p.n]);}
  let b='',d=1e9;const c=Math.cos(la*Math.PI/180);for(const [a,o,n] of PBL){const q=(a-la)**2+((o-lo)*c)**2;if(q<d){d=q;b=n;}}return b;}

/* ---------- pantalla ---------- */
svSec('comunidad',`<div class="card" style="background:#fdecea;border-left:5px solid #e53935"><b style="color:#b71c1c">🚨 Si hay heridos o peligro, llama primero al 112.</b>
  <div class="note" style="color:#5d4037">Esto no es un servicio de emergencias. Los avisos los escribe la gente: úsalos como una pista y sigue siempre los avisos oficiales.</div></div>
 <div class="card"><b>📣 Alertas ciudadanas</b><div class="note">Árboles caídos, desprendimientos, caminos cortados, lluvias muy fuertes, cebos envenenados… Avisa a los demás y mira lo que pasa cerca de ti. Ver los avisos es libre; para avisar y votar hace falta una cuenta (sale tu apodo, nunca tu correo).</div>
  <div class="note" id="cmQuien" style="margin-top:4px"></div>
  <div class="seg" id="cmSeg" style="margin-top:8px;flex-wrap:wrap"><button class="btn on" data-v="mapa">🗺️ Avisos</button><button class="btn" data-v="nuevo">➕ Avisar</button><button class="btn" data-v="mios">📋 Mis avisos</button><button class="btn" data-v="mod" id="cmModB" style="display:none">🛡️ Moderar</button></div></div>
 <div id="cmBody"></div>
 <div class="note" style="margin:0 6px 12px"><a href="#" id="cmNor">Normas de la comunidad</a> · <a href="#" id="cmPri">Privacidad</a> · Mapa © IGN</div>`);
$('cmNor').onclick=e=>{e.preventDefault();abre(NORMAS_URL);};$('cmPri').onclick=e=>{e.preventDefault();abre(PRIV_URL);};
$('cmSeg').querySelectorAll('button').forEach(b=>b.onclick=()=>{CMV=b.dataset.v;cmRender();});

function cmQuien(){const el=$('cmQuien');if(!el)return;const p=CU().perfil();
  el.innerHTML=CU().ok()&&p?`👤 Avisas como <b>${esc(p.apodo)}</b>`:`👤 <a href="#" id="cmIrC">Crea tu cuenta o entra</a> para avisar y votar.`;
  if($('cmIrC'))$('cmIrC').onclick=e=>{e.preventDefault();CU().ir();};}
function cmRender(){cmQuien();$('cmSeg').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===CMV));
  $('cmModB').style.display=(typeof TECH!=='undefined'&&TECH)?'':'none';if(CMV==='mod'&&!TECH)CMV='mapa';
  CMM=null;CMF=null;({mapa:cmMapa,nuevo:cmNuevo,mios:cmMios,mod:cmMod})[CMV]();}

/* ---- 🗺️ mapa y lista ---- */
function cmDibuja(x,P,b,M){for(const a of CMA){const [px,py]=P(a.lat,a.lon);if(px<-20||py<-20||px>b.W+20||py>b.H+20)continue;const sel=CMSEL===a.id;
    x.beginPath();x.arc(px,py,sel?17:14,0,7);x.fillStyle=sel?'#ffeb3b':'#fff';x.fill();x.lineWidth=2.5;x.strokeStyle=CMT[a.tipo][4]?'#c62828':'#1565c0';x.stroke();
    x.font=(sel?18:15)+'px system-ui';x.textAlign='center';x.textBaseline='middle';x.fillText(CMT[a.tipo][1],px,py+1);}
  if(MYPOS){const [px,py]=P(MYPOS.la,MYPOS.lo);x.beginPath();x.arc(px,py,6,0,7);x.fillStyle='#1e88e5';x.fill();x.strokeStyle='#fff';x.lineWidth=2;x.stroke();}}
function cmToca(px,py,M){let best=null,bd=24;for(const a of CMA){const [qx,qy]=M.P(a.lat,a.lon),d=Math.hypot(qx-px,qy-py);if(d<bd){bd=d;best=a;}}
  if(best){CMSEL=CMSEL===best.id?null:best.id;M.draw();cmLista();if(CMSEL){const r=document.querySelector(`#cmL [data-a="${CMSEL}"]`);if(r)r.scrollIntoView({behavior:'smooth',block:'nearest'});}}}
async function cmMapa(){const el=$('cmBody');
  el.innerHTML=`<div class="card" style="padding:6px"><canvas id="cmMap" height="300" style="width:100%;border-radius:10px;touch-action:none"></canvas>
    <div class="row" style="margin-top:6px"><button class="btn" id="cmIn">＋</button><button class="btn" id="cmOut">－</button><button class="btn" id="cmYo">📍 Cerca de mí</button><button class="btn" id="cmRe">🔄</button></div></div>
   <div class="card" id="cmL"><div class="note">Cargando avisos…</div></div>`;
  svLoad('pueblos.js','PUEBLOS',()=>cmLista());
  CMM=NavMap('cmMap',cmDibuja,cmToca);CMM.fit(41.9,43.32,-2.5,-0.72);
  $('cmIn').onclick=()=>CMM.zoom(1.6);$('cmOut').onclick=()=>CMM.zoom(1/1.6);$('cmRe').onclick=async()=>{$('cmL').innerHTML='<div class="note">Cargando avisos…</div>';await cmCargar();CMM.draw();cmLista();};
  $('cmYo').onclick=async e=>{try{await myPos();CMM.fit(MYPOS.la-.12,MYPOS.la+.12,MYPOS.lo-.16,MYPOS.lo+.16);cmLista();}catch(x){toast('No se pudo saber dónde estás');}};
  await cmCargar();if(CMV!=='mapa')return;CMM.draw();cmLista();}
function cmFila(a){const t=CMT[a.tipo],sel=CMSEL===a.id,v=lsGet('cmVotos',{})[a.id],p=pueblo(a.lat,a.lon),k=MYPOS?km(MYPOS.la,MYPOS.lo,a.lat,a.lon):null;
  return `<div class="st" data-a="${a.id}" style="cursor:pointer;align-items:flex-start;${sel?'background:rgba(255,235,59,.18);border-radius:8px':''}"><div style="font-size:26px">${t[1]}</div><div style="flex:1">
    <b>${t[2]}</b>${p?` · <span class="note">${esc(p)}</span>`:''}<div class="s">${a.apodo?'👤 '+esc(a.apodo)+' · ':''}${hace(a.creado)}${k!=null?` · ${fmtN(k,k<10?1:0)} km`:''}${a.si||a.no?` · 👍 ${a.si} · 👎 ${a.no}`:''}</div>
    ${a.texto?`<div style="margin-top:3px;white-space:pre-line">${esc(a.texto)}</div>`:''}
    ${sel?`<div class="row" style="margin-top:6px;flex-wrap:wrap;gap:4px">
      <button class="btn" data-vt="si" ${v?'disabled':''}>👍 Sigue ahí${v==='si'?' ✓':''}</button><button class="btn" data-vt="no" ${v?'disabled':''}>👎 Ya no está${v==='no'?' ✓':''}</button>
      <button class="btn" data-ir="1">🧭 Cómo llegar</button></div>
      <div class="row" style="margin-top:4px;flex-wrap:wrap;gap:4px"><button class="btn" data-den="1">🚩 Denunciar</button><button class="btn" data-oc="1">🙈 Ocultar avisos de este colaborador</button></div>
      ${a.tipo==='veneno'?'<div class="note" style="margin-top:6px;color:#b71c1c">☠️ No lo toques. Si lo ves, avisa a la Policía Foral (112) o al SEPRONA (062). Lleva a tu perro atado por la zona.</div>':''}
      <div id="cmDen"></div>`:''}</div></div>`;}
function cmLista(){const el=$('cmL');if(!el)return;
  if(CMCARGA===3){el.innerHTML='<div class="note">No se han podido cargar los avisos. Revisa la conexión y toca 🔄.</div>';return;}
  if(CMCARGA<2){el.innerHTML='<div class="note">Cargando avisos…</div>';return;}
  let L=CMA.slice();if(MYPOS)L.sort((a,b)=>km(MYPOS.la,MYPOS.lo,a.lat,a.lon)-km(MYPOS.la,MYPOS.lo,b.lat,b.lon));
  el.innerHTML=L.length?`<div class="note">${L.length} ${L.length===1?'aviso activo':'avisos activos'}${MYPOS?' · ordenados por cercanía':''}. Toca uno para verlo.</div>`+L.map(cmFila).join('')
    :'<div class="note">Ahora mismo no hay avisos activos en Navarra. 🌿 Si ves algo, toca «➕ Avisar».</div>';
  el.querySelectorAll('[data-a]').forEach(d=>d.onclick=e=>{if(e.target.closest('button,select,textarea,input'))return;CMSEL=CMSEL===d.dataset.a?null:d.dataset.a;if(CMM)CMM.draw();cmLista();});
  const a=CMA.find(x=>x.id===CMSEL);if(!a)return;
  el.querySelectorAll('[data-vt]').forEach(b=>b.onclick=()=>cmVotar(a,b.dataset.vt));
  el.querySelectorAll('[data-ir]').forEach(b=>b.onclick=()=>abre(abMapsPt(a.lat,a.lon)));
  el.querySelectorAll('[data-oc]').forEach(b=>b.onclick=()=>{if(!confirm('¿Ocultar en este móvil todos los avisos de este colaborador?'))return;const O=ocultos();
    if(a.ah)O.ah.push(a.ah);O.ids.push(a.id);lsSet('cmOcultos',O);CMA=CMA.filter(x=>x.id!==a.id&&!(a.ah&&x.ah===a.ah));CMSEL=null;if(CMM)CMM.draw();cmLista();toast('🙈 Ya no verás sus avisos');});
  el.querySelectorAll('[data-den]').forEach(b=>b.onclick=()=>{$('cmDen').innerHTML=`<div class="card" style="margin-top:6px"><b>🚩 Denunciar este aviso</b>
      <select id="cmDm" class="town" style="width:100%;margin-top:6px">${['datos','acusa','falso','ofensivo','ilegal','yano','otro'].map(k=>`<option value="${k}">${CM_MOT[k]}</option>`).join('')}</select>
      <textarea id="cmDt" class="town" maxlength="300" rows="2" placeholder="Explícalo si quieres (opcional, sin datos personales)" style="width:100%;box-sizing:border-box;margin-top:6px"></textarea>
      <div class="row" style="margin-top:6px"><button class="btn pri" id="cmDe">Enviar denuncia</button></div></div>`;
    $('cmDe').onclick=()=>cmDenunciar(a,$('cmDm').value,$('cmDt').value.trim());});}
async function cmVotar(a,v){if(!pideCuenta('votar'))return;try{const u=await cmTok();
    await fsCommit([{update:{name:nom('votos',a.id+'_'+u.uid),fields:encF({aviso:a.id,v})},currentDocument:{exists:false}},
      {transform:{document:nom('avisos',a.id),fieldTransforms:[{fieldPath:v,increment:{integerValue:'1'}}]},currentDocument:{exists:true}}],u.it);
    const V=lsGet('cmVotos',{});V[a.id]=v;lsSet('cmVotos',V);a[v]++;toast(v==='si'?'👍 Gracias por confirmarlo':'👎 Gracias: si más gente lo confirma, desaparecerá');cmLista();}
  catch(e){const V=lsGet('cmVotos',{});if(e.status===403||/exist/i.test(e.message)){V[a.id]=v;lsSet('cmVotos',V);toast('Ya habías votado este aviso');cmLista();}else toast('No se pudo enviar el voto. Revisa la conexión');}}
async function cmDenunciar(a,motivo,texto){try{const u=await cmTok();
    await fsCommit([{update:{name:nom('denuncias',rnd(20)),fields:encF({aviso:a.id,motivo,texto,autor:u.uid})},currentDocument:{exists:false},updateTransforms:[{fieldPath:'creado',setToServerValue:'REQUEST_TIME'}]}],u.it);
    $('cmDen').innerHTML='<div class="note" style="margin-top:6px">✅ Denuncia enviada. La revisaremos lo antes posible. Gracias.</div>';}
  catch(e){toast('No se pudo enviar la denuncia. Prueba otra vez');}}

/* ---- ➕ dar un aviso ---- */
function cmNuevo(){const el=$('cmBody'),ok=lsGet('cmNormas',0)>=CM_NORMAS;CMPT=null;CMTIPO=null;
  if(!(CU().ok()&&CU().perfil())){const s=CU().sesion&&CU().sesion();
    el.innerHTML=`<div class="card"><b>👤 Para avisar necesitas una cuenta</b><div class="note" style="margin-top:4px;line-height:1.5">Es gratis: tu correo, una contraseña y un apodo. En los avisos solo sale el apodo, nunca tu correo.<br>Pedimos cuenta para que no se cuelen avisos falsos y para poder bloquear a quien abuse.</div>
      ${s?'<div class="note" style="margin-top:6px">⚠️ Ya has entrado, pero te falta '+(CU().ok()?'elegir tu apodo':'confirmar tu correo')+'.</div>':''}
      <div class="row" style="margin-top:8px"><button class="btn pri" id="cmCu" style="flex:1">${s?'Terminar mi cuenta':'Crear cuenta o entrar'}</button></div></div>`;
    $('cmCu').onclick=()=>CU().ir();return;}
  el.innerHTML=`<div class="card"><b>1. ¿Qué pasa?</b><div id="cmTp" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px">${CM_T.map(t=>`<button class="btn" data-t="${t[0]}" style="flex-direction:column;padding:8px 4px;font-size:12px;line-height:1.2;white-space:normal"><span style="font-size:24px">${t[1]}</span>${t[2]}</button>`).join('')}</div>
     <div class="note" id="cmTpN" style="margin-top:6px"></div></div>
   <div class="card"><b>2. ¿Dónde?</b><div class="note">Toca el mapa en el sitio exacto (puedes acercarte con ＋ o con dos dedos).</div>
     <canvas id="cmPick" height="280" style="width:100%;border-radius:10px;margin-top:6px;touch-action:none"></canvas>
     <div class="row" style="margin-top:6px"><button class="btn" id="cmPIn">＋</button><button class="btn" id="cmPOut">－</button><button class="btn" id="cmPYo">📍 Estoy aquí</button></div><div class="note" id="cmPN">Sin marcar todavía.</div></div>
   <div class="card"><b>3. Cuéntalo (opcional)</b><textarea id="cmTx" class="town" maxlength="300" rows="3" placeholder="Ej.: Pino caído que corta el camino a 200 m de la ermita" style="width:100%;box-sizing:border-box;margin-top:6px"></textarea>
     <div class="note"><span id="cmTxN">0</span>/300 · ⚠️ Sin nombres, matrículas, teléfonos ni acusaciones a nadie.</div></div>
   <div class="card"><div class="note" style="line-height:1.5">ℹ️ <b>Tu aviso sale con tu apodo (${esc((CU().perfil()||{}).apodo||'')}).</b> Tu correo no lo ve nadie más que los administradores, si hiciera falta. Se guarda en Google Firebase (Madrid) para revisarlo y publicarlo. Lo verá cualquiera que use BasatiNA. Desaparece solo y se borra del todo a los 30 días. Puedes pedir que lo borremos cuando quieras. <a href="#" id="cmPr">Más información</a></div>
     ${ok?'':`<label class="note" style="display:flex;gap:8px;align-items:flex-start;margin-top:8px"><input type="checkbox" id="cmC1"> <span>Tengo <b>14 años o más</b>.</span></label>
     <label class="note" style="display:flex;gap:8px;align-items:flex-start;margin-top:6px"><input type="checkbox" id="cmC2"> <span>He leído y acepto las <a href="#" id="cmNo">Normas de la comunidad</a>. Mi aviso no incluye nombres, matrículas ni datos de otras personas.</span></label>`}
     <div style="margin-top:8px;color:#b71c1c;font-weight:600">🚨 Si hay heridos o peligro, llama primero al 112.</div>
     <div class="row" style="margin-top:8px"><button class="btn pri" id="cmEnv" style="flex:1">📣 Enviar aviso</button></div><div class="note" id="cmMsg"></div></div>`;
  $('cmPr').onclick=e=>{e.preventDefault();abre(PRIV_URL);};if($('cmNo'))$('cmNo').onclick=e=>{e.preventDefault();abre(NORMAS_URL);};
  $('cmTp').querySelectorAll('button').forEach(b=>b.onclick=()=>{CMTIPO=b.dataset.t;$('cmTp').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));const t=CMT[CMTIPO];
    $('cmTpN').innerHTML=(t[4]?'👀 Este tipo de aviso lo revisa un administrador antes de publicarlo. ':'')+`Se verá durante ${t[3]>=48?t[3]/24+' días':t[3]+' horas'}.`+(CMTIPO==='veneno'?'<br>☠️ Avisa también a la Policía Foral (112) o al SEPRONA (062). No digas quién crees que lo ha puesto.':'')+(CMTIPO==='accidente'?'<br>🚑 Si hay heridos, llama al 112. No pongas datos de las personas ni matrículas.':'');});
  $('cmTx').oninput=e=>{$('cmTxN').textContent=e.target.value.length;};
  CMF=NavMap('cmPick',(x,P)=>{if(!CMPT)return;const [px,py]=P(CMPT[0],CMPT[1]);x.font='30px system-ui';x.textAlign='center';x.textBaseline='bottom';x.fillText('📍',px,py+4);},
    (px,py,M)=>{const b=M.box();CMPT=[+(b.n-(b.n-b.s)*py/b.H).toFixed(4),+(b.w+(b.e-b.w)*px/b.W).toFixed(4)];M.draw();cmPN();});
  CMF.fit(41.9,43.32,-2.5,-0.72);
  $('cmPIn').onclick=()=>CMF.zoom(1.6);$('cmPOut').onclick=()=>CMF.zoom(1/1.6);
  $('cmPYo').onclick=async()=>{try{await myPos();CMPT=[+MYPOS.la.toFixed(4),+MYPOS.lo.toFixed(4)];CMF.fit(MYPOS.la-.01,MYPOS.la+.01,MYPOS.lo-.014,MYPOS.lo+.014);cmPN();}catch(e){toast('No se pudo saber dónde estás');}};
  $('cmEnv').onclick=cmEnviar;}
function cmPN(){const el=$('cmPN');if(!el||!CMPT)return;const ok=CMPT[0]>41.85&&CMPT[0]<43.35&&CMPT[1]>-2.55&&CMPT[1]<-0.70;
  svLoad('pueblos.js','PUEBLOS',()=>{el.innerHTML=ok?`📍 Marcado${pueblo(CMPT[0],CMPT[1])?' cerca de <b>'+esc(pueblo(CMPT[0],CMPT[1]))+'</b>':''}. Si no es exacto, toca otra vez en el sitio bueno.`:'⚠️ Ese punto está fuera de Navarra.';});}
async function cmEnviar(){const msg=$('cmMsg'),tx=$('cmTx').value.trim(),ok=lsGet('cmNormas',0)>=CM_NORMAS;
  if(!CMTIPO)return msg.textContent='Elige qué pasa (paso 1).';
  if(!CMPT)return msg.textContent='Marca el sitio en el mapa (paso 2).';
  if(!(CMPT[0]>41.85&&CMPT[0]<43.35&&CMPT[1]>-2.55&&CMPT[1]<-0.70))return msg.textContent='El sitio tiene que estar en Navarra.';
  if(!ok&&!($('cmC1').checked&&$('cmC2').checked))return msg.textContent='Marca las dos casillas para poder enviarlo.';
  const t=CMT[CMTIPO],rev=!!t[4]||dudoso(tx);msg.textContent='Enviando…';$('cmEnv').disabled=true;
  try{const u=await cmTok(),id=rnd(20),pf=(await CU().cargaPerfil().catch(()=>null))||CU().perfil();if(!pf)throw Object.assign(new Error('sin perfil'),{status:403});
    await fsCommit([
      {update:{name:nom('avisos',id),fields:encF({tipo:CMTIPO,texto:tx,lat:CMPT[0]+(Number.isInteger(CMPT[0])?1e-6:0),lon:CMPT[1]+(Number.isInteger(CMPT[1])?1e-6:0),estado:rev?'pendiente':'publicado',si:0,no:0,ah:cmAh(u.uid),apodo:pf.apodo})},currentDocument:{exists:false},updateTransforms:[{fieldPath:'creado',setToServerValue:'REQUEST_TIME'}]},
      {update:{name:nom('avisos_priv',id),fields:encF({autor:u.uid})},currentDocument:{exists:false}},
      {update:{name:nom('limites',u.uid),fields:{}},updateTransforms:[{fieldPath:'ultimo',setToServerValue:'REQUEST_TIME'}]}],u.it);
    if(!ok)lsSet('cmNormas',CM_NORMAS);
    const M=lsGet('cmMios',[]);M.unshift({id,t:CMTIPO,f:Date.now()});lsSet('cmMios',M.slice(0,50));
    try{const k=window.amKey&&await window.amKey('alertas');if(k)w3Send(k,{subject:'BasatiNA · '+t[1]+' Alerta ciudadana: '+t[2]+(rev?' (pendiente de revisar)':''),from_name:'Alertas BasatiNA',tipo:t[2],apodo:pf.apodo,texto:tx||'—',sitio:(pueblo(CMPT[0],CMPT[1])||'')+' · https://www.google.com/maps?q='+CMPT[0]+','+CMPT[1],estado:rev?'pendiente: entrad en Alertas ciudadanas → Moderar':'publicado',botcheck:false}).catch(()=>{});}catch(e){}
    toast(rev?'✅ Aviso enviado. Lo revisaremos antes de publicarlo':'✅ ¡Aviso publicado! Gracias por avisar');CMV=rev?'mios':'mapa';cmRender();}
  catch(e){$('cmEnv').disabled=false;msg.textContent=e.status===403?'❌ No se ha podido enviar. Espera 2 minutos entre un aviso y otro, comprueba que el sitio está en Navarra y que tu correo está confirmado (👤 Mi cuenta).':'❌ No se ha podido enviar. Revisa la conexión y prueba otra vez.';console.log('comunidad',e);}}

/* ---- 📋 mis avisos ---- */
async function cmMios(){const el=$('cmBody'),a=lsGet('cmAuth',null),cu=CU().ok()&&CU().perfil();let M=lsGet('cmMios',[]);
  el.innerHTML=`<div class="card"><b>📋 Mis avisos</b><div id="cmML" class="note" style="margin-top:6px">${M.length||cu?'Cargando…':'Todavía no has enviado ningún aviso desde este móvil.'}</div></div>
   <div class="card">${cu?`<b>👤 Tu cuenta</b><div class="note" style="margin-top:4px">Tus avisos van con tu cuenta (<b>${esc(CU().perfil().apodo)}</b>): los verás en cualquier móvil en el que entres. Si nos escribes por un aviso (participa@basatina.es), dinos tu apodo.</div>`
     :`<b>🔑 Tu código de colaborador</b><div class="note" style="margin-top:4px">${a?`<code style="user-select:all;word-break:break-all">${esc(a.uid)}</code><br>Es anónimo. Solo lo necesitas si nos pides ver o borrar tus avisos antiguos (participa@basatina.es).`:'Se crea la primera vez que denuncias o entras.'}</div>
     ${a?'<div class="row" style="margin-top:6px"><button class="btn" id="cmNew">Generar código nuevo</button></div>':''}`}</div>`;
  if($('cmNew'))$('cmNew').onclick=()=>{if(!confirm('Se creará un código nuevo y este móvil dejará de ver el estado de los avisos que ya enviaste. ¿Seguir?'))return;lsSet('cmAuth',null);lsSet('cmMios',[]);cmMios();};
  let u=null;try{if(M.length||cu)u=await cmTok();}catch(e){}
  // con cuenta: también los avisos enviados desde otros móviles
  if(cu&&u){try{const S=await fsQuery('avisos_priv','autor',u.uid,u.it),ids=new Set(M.map(m=>m.id));S.forEach(x=>{if(!ids.has(x.id))M.push({id:x.id,t:'otro',f:0});});}catch(e){console.log('mios',e);}}
  if(!M.length){$('cmML').textContent='Todavía no has enviado ningún aviso.';return;}
  const R=await Promise.all(M.map(async m=>{try{return Object.assign({ok:1},m,decD(await fs(`/avisos/${m.id}`,{},u&&u.it)));}catch(e){return Object.assign({ok:0,st:e.status},m);}}));
  R.sort((x,y)=>(y.creado||y.f)-(x.creado||x.f));
  $('cmML').innerHTML=R.map(r=>{const t=CMT[r.tipo||r.t]||CMT.otro;let est;
    if(!r.ok)est=(r.st===404||r.st===403)?'🗑️ Ya no está (caducado y borrado)':'⚪ No se puede consultar ahora';
    else if(r.estado==='pendiente')est='⏳ Pendiente de revisar';
    else if(r.estado==='retirado')est='❌ Retirado'+(r.motivo?': '+esc(CM_MOT[r.motivo]||r.motivo):'');
    else est=vigente(r)?`✅ Publicado · 👍 ${r.si} · 👎 ${r.no}`:'⌛ Ya ha caducado';
    return `<div class="st" style="align-items:flex-start"><div style="font-size:22px">${t[1]}</div><div style="flex:1"><b>${t[2]}</b><div class="s">${new Date(r.creado||r.f).toLocaleString('es-ES',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
      ${r.texto?`<div class="s">${esc(r.texto)}</div>`:''}<div style="margin-top:2px">${est}</div>
      ${r.ok?`<div class="row" style="margin-top:4px"><button class="btn" data-bo="${r.id}">🗑️ Borrar</button></div>`:''}</div></div>`;}).join('')
    +'<div class="note" style="margin-top:6px">Puedes borrar tus avisos cuando quieras. Si no estás de acuerdo con una retirada, escríbenos a participa@basatina.es.</div>';
  el.querySelectorAll('[data-bo]').forEach(b=>b.onclick=async()=>{if(!confirm('¿Borrar este aviso? Desaparecerá para todo el mundo.'))return;const id=b.dataset.bo;
    try{const v=await cmTok();await fsCommit([{delete:nom('avisos',id)},{delete:nom('avisos_priv',id)}],v.it);lsSet('cmMios',lsGet('cmMios',[]).filter(m=>m.id!==id));toast('🗑️ Aviso borrado');cmMios();}
    catch(e){toast('❌ No se pudo borrar ('+e.message+')');}});}

/* ---- 🛡️ moderar (solo modo Administrador) ---- */
async function cmMod(){const el=$('cmBody');const tok=await admTok();
  if(!tok){el.innerHTML=`<div class="card"><b>🛡️ Entrar a moderar</b><div class="note">Usuario de administración de Firebase. La sesión se cierra al cerrar la app.</div>
     <input id="cmAe" class="town" type="email" value="${ADMIN_MAIL}" style="width:100%;box-sizing:border-box;margin-top:8px">
     <input id="cmAp" class="town" type="password" placeholder="Contraseña" style="width:100%;box-sizing:border-box;margin-top:6px">
     <select id="cmAq" class="town" style="width:100%;box-sizing:border-box;margin-top:6px"><option value="">¿Quién eres?</option>${CM_MODS.map(n=>`<option>${n}</option>`).join('')}</select>
     <div class="row" style="margin-top:8px"><button class="btn pri" id="cmAok">Entrar</button></div><div class="note" id="cmAm"></div></div>`;
    $('cmAp').onkeydown=e=>{if(e.key==='Enter')$('cmAok').click();};
    $('cmAok').onclick=async()=>{if(!$('cmAq').value)return $('cmAm').textContent='Elige quién eres (para el registro de moderación).';$('cmAm').textContent='Entrando…';try{const j=await fbAuthPost('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+FB.key,{email:$('cmAe').value.trim(),password:$('cmAp').value,returnSecureToken:true});
        admSet({it:j.idToken,rt:j.refreshToken,exp:Date.now()+(+j.expiresIn-60)*1000,email:j.email,quien:$('cmAq').value});cmMod();}
      catch(e){$('cmAm').textContent='❌ No se ha podido entrar ('+e.message+').';}};return;}
  el.innerHTML='<div class="card"><div class="note">Cargando…</div></div>';
  let P=[],D=[],U=[];try{[P,D,U]=await Promise.all([fsQuery('avisos','estado','pendiente',tok),fsQuery('denuncias',null,null,tok),fsQuery('avisos','estado','publicado',tok)]);}
  catch(e){el.innerHTML=`<div class="card"><div class="note">❌ No se pudo cargar (${esc(e.message)}). ¿Están publicadas las reglas?</div><div class="row"><button class="btn" id="cmSal">Salir</button></div></div>`;$('cmSal').onclick=()=>{admSet(null);cmMod();};return;}
  const todos={};[...P,...U].forEach(a=>todos[a.id]=a);
  // 📜 registro de moderación (acción A4 de la EIPD): quién hizo qué y cuándo. Solo administradores; se borra a los 12 meses.
  const quien=(admGet()||{}).quien||'';let LG=[];try{LG=(await fsQuery('moderacion',null,null,tok)).sort((a,b)=>(b.cuando||'').localeCompare(a.cuando||'')).slice(0,15);}catch(e){}
  const reg=async(accion,aviso,detalle)=>{try{await fsPatch('moderacion',rnd(20),{accion,aviso:aviso||'',quien:quien||'?',cuando:new Date().toISOString(),detalle:(detalle||'').slice(0,120)},tok);}catch(e){console.log('registro',e);}};
  // 📊 usuarios: contador anónimo (estadisticas/) y cuentas creadas
  let ES=[],NC=null;try{ES=await fsQuery('estadisticas',null,null,tok);}catch(e){}
  try{const j=await fs(':runAggregationQuery',{method:'POST',body:JSON.stringify({structuredAggregationQuery:{structuredQuery:{from:[{collectionId:'usuarios'}]},aggregations:[{alias:'n',count:{}}]}})},tok);NC=+(j[0].result.aggregateFields.n.integerValue);}catch(e){}
  const ED={};ES.forEach(x=>ED[x.id]=x);const p2=n=>String(n).padStart(2,'0'),dd=k=>{const d=new Date(Date.now()-k*864e5);return `${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`;};
  const g=(id,f)=>(ED[id]&&ED[id][f])||0,mes=dd(0).slice(0,7),mesA=(()=>{const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-1);return `${d.getFullYear()}-${p2(d.getMonth()+1)}`;})();
  const med7=Math.round([1,2,3,4,5,6,7].reduce((s,k)=>s+g(dd(k),'activos'),0)/7),nuev30=[...Array(30).keys()].reduce((s,k)=>s+g(dd(k),'nuevos'),0);
  const est=`<div class="card"><b>📊 Usuarios</b><div class="kpi" style="margin-top:6px;flex-wrap:wrap"><div><span class="note">Hoy</span><b>${g(dd(0),'activos')}</b></div><div><span class="note">Ayer</span><b>${g(dd(1),'activos')}</b></div><div><span class="note">Media 7 días</span><b>${med7}</b></div></div>
     <div class="kpi" style="margin-top:6px;flex-wrap:wrap"><div><span class="note">Este mes</span><b>${g(mes,'activos')}</b></div><div><span class="note">Mes pasado</span><b>${g(mesA,'activos')}</b></div><div><span class="note">Nuevos (30 días)</span><b>${nuev30}</b></div></div>
     <div class="note" style="margin-top:6px">Este mes: 📱 app ${g(mes,'app')} · 🌐 web ${g(mes,'web')}${NC!=null?` · 👤 cuentas creadas en total: <b>${NC}</b>`:''}<br>Cuenta móviles y navegadores distintos (anónimo: sin saber quién). Quien borra los datos de la app cuenta como nuevo.</div></div>`;P.sort((a,b)=>a.creado-b.creado);D.sort((a,b)=>a.creado-b.creado);U.sort((a,b)=>b.creado-a.creado);
  const motSel=id=>`<select class="town" data-ms="${id}" style="flex:1;min-width:0">${Object.entries(CM_MOT).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select>`;
  const tarj=(a,pend)=>{const t=CMT[a.tipo]||CMT.otro;return `<div class="st" style="align-items:flex-start;display:block"><div><b>${t[1]} ${t[2]}</b> <span class="note">· ${a.apodo?'👤 '+esc(a.apodo)+' · ':''}${a.creado?hace(a.creado):''} · ${esc(pueblo(a.lat,a.lon))} · <a href="#" data-map="${a.lat},${a.lon}">ver sitio</a></span></div>
      <textarea class="town" data-tx="${a.id}" maxlength="300" rows="2" style="width:100%;box-sizing:border-box;margin-top:4px">${esc(a.texto||'')}</textarea>
      <div class="row" style="margin-top:4px;flex-wrap:wrap;gap:4px">${pend?`<button class="btn pri" data-ok="${a.id}">✅ Publicar</button>`:''}<button class="btn" data-ed="${a.id}">✏️ Guardar texto</button></div>
      <div class="row" style="margin-top:4px;gap:4px">${motSel(a.id)}<button class="btn" data-no="${a.id}">❌ Retirar</button></div>
      <div class="row" style="margin-top:4px;flex-wrap:wrap;gap:4px"><button class="btn" data-bl="${a.id}">⛔ Bloquear al autor (12 meses)</button>${a.apodo?`<button class="btn" data-ap="${a.id}">🏷️ Quitar apodo ofensivo</button>`:''}</div></div>`;};
  el.innerHTML=`<div class="card"><div class="row" style="justify-content:space-between;align-items:center"><b>🛡️ Moderación</b><span><button class="btn" id="cmRf">🔄</button> <button class="btn" id="cmSal">Salir</button></span></div>
     <div class="note">Quitar datos personales: editar el texto y «Guardar texto». Al retirar, el autor verá el motivo en «Mis avisos». Guía: legal/3-moderacion-y-derechos.md</div></div>
   ${quien?'':`<div class="card"><b>👤 ¿Quién eres?</b><div class="note">Para apuntar quién hace cada acción.</div><div class="row" style="margin-top:6px;gap:6px">${CM_MODS.map(n=>`<button class="btn" data-yo="${n}">${n}</button>`).join('')}</div></div>`}
   ${est}
   <div class="card"><b>⏳ Pendientes (${P.length})</b>${P.length?P.map(a=>tarj(a,1)).join(''):'<div class="note">Nada pendiente. 🎉</div>'}</div>
   <div class="card"><b>🚩 Denuncias (${D.length})</b>${D.length?D.map(d=>{const a=todos[d.aviso];return `<div class="st" style="display:block"><div><b>${esc(CM_MOT[d.motivo]||d.motivo)}</b> <span class="note">· ${d.creado?hace(d.creado):''}</span></div>${d.texto?`<div class="s">«${esc(d.texto)}»</div>`:''}
       <div class="s" style="margin-top:3px">Aviso: ${a?`${CMT[a.tipo][1]} ${esc(a.texto||CMT[a.tipo][2])} (${a.estado})`:'ya no está publicado'}</div>
       <div class="row" style="margin-top:4px;flex-wrap:wrap;gap:4px">${a&&a.estado==='publicado'?`<button class="btn" data-dr="${d.id}" data-av="${a.id}" data-mo="${esc(d.motivo==='yano'?'yano':d.motivo)}">❌ Retirar el aviso</button>`:''}<button class="btn" data-dx="${d.id}">✔️ Revisada, se mantiene</button></div></div>`;}).join(''):'<div class="note">Sin denuncias.</div>'}</div>
   <div class="card"><b>✅ Publicados (${U.length})</b>${U.length?U.map(a=>tarj(a,0)).join(''):'<div class="note">Ninguno.</div>'}</div>
   <div class="card"><b>📜 Últimas acciones de moderación</b>${LG.length?LG.map(l=>`<div class="s" style="margin-top:4px">${new Date(l.cuando).toLocaleString('es-ES',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})} · <b>${esc(l.quien)}</b> · ${esc(l.accion)}${l.detalle?' · '+esc(l.detalle):''}</div>`).join(''):'<div class="note">Todavía no hay ninguna.</div>'}
     <div class="note" style="margin-top:6px">Se guarda 12 meses. Solo lo veis los administradores.</div></div>`;
  const hecho=t=>{toast(t);cmMod();},err=e=>toast('❌ '+e.message);
  el.querySelectorAll('[data-yo]').forEach(b=>b.onclick=()=>{const a=admGet();if(a){a.quien=b.dataset.yo;admSet(a);}cmMod();});
  $('cmRf').onclick=cmMod;$('cmSal').onclick=()=>{admSet(null);cmMod();};
  el.querySelectorAll('[data-map]').forEach(a=>a.onclick=e=>{e.preventDefault();const [la,lo]=a.dataset.map.split(',');abre(abMapsPt(+la,+lo));});
  el.querySelectorAll('[data-ok]').forEach(b=>b.onclick=async()=>{const id=b.dataset.ok;try{await fsPatch('avisos',id,{estado:'publicado',texto:el.querySelector(`[data-tx="${id}"]`).value.trim()},tok);await reg('✅ Publicar',id,todos[id]&&todos[id].tipo);hecho('✅ Publicado');}catch(e){err(e);}});
  el.querySelectorAll('[data-ed]').forEach(b=>b.onclick=async()=>{const id=b.dataset.ed;try{await fsPatch('avisos',id,{texto:el.querySelector(`[data-tx="${id}"]`).value.trim()},tok);await reg('✏️ Editar texto',id,todos[id]&&todos[id].tipo);hecho('✏️ Texto guardado');}catch(e){err(e);}});
  el.querySelectorAll('[data-no]').forEach(b=>b.onclick=async()=>{const id=b.dataset.no;try{await fsPatch('avisos',id,{estado:'retirado',motivo:el.querySelector(`[data-ms="${id}"]`).value},tok);await reg('❌ Retirar',id,CM_MOT[el.querySelector(`[data-ms="${id}"]`).value]);hecho('❌ Retirado');}catch(e){err(e);}});
  el.querySelectorAll('[data-bl]').forEach(b=>b.onclick=async()=>{if(!confirm('¿Bloquear al autor de este aviso durante 12 meses? No podrá enviar más avisos, votos ni denuncias.'))return;const id=b.dataset.bl;
    try{const p=decD(await fs(`/avisos_priv/${id}`,{},tok));await fsPatch('bloqueados',p.autor,{desde:new Date().toISOString(),aviso:id},tok);
      await fsPatch('avisos',id,{estado:'retirado',motivo:el.querySelector(`[data-ms="${id}"]`).value},tok);await reg('⛔ Bloquear autor (12 meses)',id,CM_MOT[el.querySelector(`[data-ms="${id}"]`).value]);hecho('⛔ Autor bloqueado y aviso retirado');}catch(e){err(e);}});
  // apodo ofensivo: se cambia por «VecinoNNNN» en su perfil y en este aviso
  el.querySelectorAll('[data-ap]').forEach(b=>b.onclick=async()=>{if(!confirm('¿Cambiar el apodo de este autor por uno automático («Vecino» + números)? Se le avisará la próxima vez que abra su cuenta.'))return;const id=b.dataset.ap;
    try{const p=decD(await fs(`/avisos_priv/${id}`,{},tok)),us=decD(await fs(`/usuarios/${p.autor}`,{},tok)),nv='Vecino'+(1000+Math.floor(Math.random()*9000)),k=nv.toLowerCase();
      await fsCommit([{update:{name:nom('usuarios',p.autor),fields:encF({apodo:nv,apodoK:k,quitado:us.apodo||''})},updateMask:{fieldPaths:['apodo','apodoK','quitado']},updateTransforms:[{fieldPath:'cambiado',setToServerValue:'REQUEST_TIME'}]},
        {update:{name:nom('apodos',k),fields:encF({uid:p.autor})},currentDocument:{exists:false}},...(us.apodoK?[{delete:nom('apodos',us.apodoK)}]:[])],tok);
      await fsPatch('avisos',id,{apodo:nv},tok);await reg('🏷️ Quitar apodo ofensivo',id,'→ '+nv);hecho('🏷️ Apodo cambiado a '+nv);}catch(e){err(e);}});
  el.querySelectorAll('[data-dr]').forEach(b=>b.onclick=async()=>{try{await fsPatch('avisos',b.dataset.av,{estado:'retirado',motivo:CM_MOT[b.dataset.mo]?b.dataset.mo:'otro'},tok);await fsDel('denuncias',b.dataset.dr,tok);await reg('❌ Retirar por denuncia',b.dataset.av,CM_MOT[b.dataset.mo]||b.dataset.mo);hecho('❌ Aviso retirado');}catch(e){err(e);}});
  el.querySelectorAll('[data-dx]').forEach(b=>b.onclick=async()=>{try{await fsDel('denuncias',b.dataset.dx,tok);await reg('✔️ Denuncia revisada, se mantiene','',b.dataset.dx);hecho('✔️ Denuncia cerrada');}catch(e){err(e);}});}

svHook('comunidad',()=>{CMSEL=null;cmRender();});
// menú: el primero de «Participa»
svBtn(svDsub('Participa'),'comunidad','📣 Alertas ciudadanas',true);
Object.assign(TITLES,{comunidad:'📣 Alertas ciudadanas'});
try{PVS_ESC.comunidad='pueblo';}catch(e){}
try{ICK.comunidad='broadcast';ICC.comunidad='#e53935';BNK.comunidad='i-chat';BNF.comunidad='r';}catch(e){}
try{if(typeof applyIcons==='function')applyIcons((CFG.iconos||'pro')==='pro');}catch(e){}
window.cmRender=cmRender;
})();
