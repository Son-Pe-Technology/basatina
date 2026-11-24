/* =====================================================================
   🔑 CLAVES DE SERVICIOS FUERA DE GITHUB (24 nov. 2026, lo pidió Pedro) — se carga después de cuenta.js
   Antes, las claves de AEMET, TomTom, Pl@ntNet, Rainbow y Web3Forms estaban en config/*.json del
   repositorio PÚBLICO, a la vista de los robots que rastrean GitHub buscando claves.
   Ahora:
   - La app las lee de Firestore, documento claves/app (un campo por servicio). Solo lo puede leer un móvil
     que ha entrado en Firebase (todos lo hacen solos, como «colaborador anónimo») y solo lo pueden
     cambiar los administradores (firestore.rules).
   - Guardar una clave desde el modo Administrador (los botones de siempre) la guarda en Firestore, no en GitHub.
   - Mudanza: la primera vez que Pedro o Sonia abren la app con su cuenta, las claves que aún estén en
     config/*.json se copian solas a Firestore. Después se borran del repositorio.
   - Los robots de GitHub (tools/aludes.py) usan la clave de AEMET de los «secretos» de GitHub (AEMET_KEY).
   OJO: una clave que usa el móvil nunca es secreta del todo (quien sepa puede sacarla de la app). Por eso
   conviene además limitar cada clave en la web de su servicio cuando se pueda.
   ===================================================================== */
(function(){
if(!window.CMX)return;
const C=window.CMX;
const CL_N=['aemet','tomtom','plantnet','rainbow','web3forms','web3forms_alertas'];
let CL=null,CL_P=null;
// lee claves/app una vez por sesión
function clLoad(forzar){if(CL&&!forzar)return Promise.resolve(CL);if(CL_P&&!forzar)return CL_P;
  CL_P=(async()=>{try{const t=await C.cmTok();CL=C.decD(await C.fs('/claves/app',{},t.it));}catch(e){if(!CL)CL={};}CL_P=null;return CL;})();return CL_P;}
// la de antes, por si Firestore no tiene aún la clave (hasta que se borren los archivos)
async function viejo(n){try{const r=await fetch(GH_RAW+'config/'+n+'.json?t='+Math.floor(Date.now()/600000));if(r.ok)return ((await r.json()).key||'').trim();}catch(e){}return '';}
async function clave(n){const d=await clLoad();let v=(d[n]||'').trim();if(!v)v=await viejo(n);return v;}

// keyGet y ttLoadKey (index.html) leen ahora de aquí
try{keyGet=async function(n){if(KEYS[n])return KEYS[n];KEYS[n]=await clave(n);return KEYS[n];};}catch(e){}
try{ttLoadKey=async function(){if(TTKEY)return TTKEY;TTKEY=await clave('tomtom');const b=document.getElementById('inTrafBar');if(b)b.style.display=TTKEY?'':'none';return TTKEY;};}catch(e){}

// guardar: los botones de siempre llaman a ghPut('config/<servicio>.json', …): se desvía a Firestore
async function clGuarda(n,v){const t=await C.cmTok();await C.fsPatch('claves','app',{[n]:v},t.it);await clLoad(true);KEYS[n]=v;}
try{const _gp=ghPut;ghPut=async function(path,b64,msg,sha){const m=/^config\/([a-z0-9_]+)\.json$/.exec(path||'');
    if(m&&CL_N.includes(m[1])){let v='';try{v=(JSON.parse(ub64(b64)).key||'').trim();}catch(e){}
      try{await clGuarda(m[1],v);return {ok:true};}catch(e){throw new Error('no se pudo guardar en la base de datos ('+e.message+'). ¿Has entrado con tu cuenta de administración y están publicadas las reglas?');}}
    return _gp.apply(this,arguments);};}catch(e){}

// mudanza: Pedro o Sonia copian a Firestore las claves que siguen en GitHub
let MUDADO=false;
async function mudanza(){if(MUDADO||!(window.bnSuper&&window.bnSuper()))return;MUDADO=true;
  try{const d=await clLoad(true),nuevo={};
    for(const n of CL_N){if(!(d[n]||'').trim()){const v=await viejo(n);if(v)nuevo[n]=v;}}
    if(Object.keys(nuevo).length){const t=await C.cmTok();await C.fsPatch('claves','app',nuevo,t.it);await clLoad(true);
      toast('🔑 Claves de servicios copiadas a la base de datos ('+Object.keys(nuevo).length+')');}}
  catch(e){MUDADO=false;console.log('mudanza claves',e);}}
setTimeout(mudanza,4000);
const _s=showTab;showTab=function(){_s.apply(this,arguments);setTimeout(mudanza,1500);};
// para el Panel de administración (superadmin.js): estado de cada clave y guardar/borrar
window.bnClaves={lista:CL_N,
  estado:async()=>{const d=await clLoad(true);return Object.fromEntries(CL_N.map(n=>[n,!!(d[n]||'').trim()]));},
  guarda:async(n,v)=>{if(!CL_N.includes(n))throw new Error('clave desconocida');await clGuarda(n,(v||'').trim());
    // que la app use ya la nueva, sin reiniciar
    try{if(n==='tomtom'){TTKEY=null;TTT={};}}catch(e){}
    try{if(n==='rainbow'||n==='aemet'){RDF=[];RDT={};MTRT={};rdLoad();aeLoad();}}catch(e){}}};
})();
