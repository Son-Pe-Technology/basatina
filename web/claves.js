/* =====================================================================
   🔑 CLAVES DE SERVICIOS FUERA DE GITHUB (24 nov. 2026, lo pidió Pedro) — se carga después de cuenta.js
   Antes, las claves de AEMET, TomTom, Pl@ntNet, Rainbow y Web3Forms estaban en config/*.json del
   repositorio PÚBLICO, a la vista de los robots que rastrean GitHub buscando claves.
   Ahora:
   - La app las lee de Firestore, documento claves/app (un campo por servicio). Solo lo puede leer un móvil
     que ha entrado en Firebase (todos lo hacen solos, como «colaborador anónimo») y solo lo pueden
     cambiar los administradores (firestore.rules).
   - Guardar una clave desde el modo Administrador (los botones de siempre) la guarda en Firestore, no en GitHub.
   - Mudanza hecha el 24 nov. 2026: claves copiadas a Firestore, renovadas en cada servicio y config/*.json
     borrados del repositorio (las viejas, que siguen en el historial de GitHub, ya no valen).
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
// 24 nov. 2026: claves renovadas y config/*.json borrados de GitHub → ya solo se leen de Firestore
async function clave(n){const d=await clLoad();return (d[n]||'').trim();}

// keyGet y ttLoadKey (index.html) leen ahora de aquí
try{keyGet=async function(n){if(KEYS[n])return KEYS[n];KEYS[n]=await clave(n);return KEYS[n];};}catch(e){}
try{ttLoadKey=async function(){if(TTKEY)return TTKEY;TTKEY=await clave('tomtom');const b=document.getElementById('inTrafBar');if(b)b.style.display=TTKEY?'':'none';return TTKEY;};}catch(e){}

// guardar: los botones de siempre llaman a ghPut('config/<servicio>.json', …): se desvía a Firestore
async function clGuarda(n,v){const t=await C.cmTok();await C.fsPatch('claves','app',{[n]:v},t.it);await clLoad(true);KEYS[n]=v;}
try{const _gp=ghPut;ghPut=async function(path,b64,msg,sha){const m=/^config\/([a-z0-9_]+)\.json$/.exec(path||'');
    if(m&&CL_N.includes(m[1])){let v='';try{v=(JSON.parse(ub64(b64)).key||'').trim();}catch(e){}
      try{await clGuarda(m[1],v);return {ok:true};}catch(e){throw new Error('no se pudo guardar en la base de datos ('+e.message+'). ¿Has entrado con tu cuenta de administración y están publicadas las reglas?');}}
    return _gp.apply(this,arguments);};}catch(e){}

// para el Panel de administración (superadmin.js): estado de cada clave y guardar/borrar
window.bnClaves={lista:CL_N,
  estado:async()=>{const d=await clLoad(true);return Object.fromEntries(CL_N.map(n=>[n,!!(d[n]||'').trim()]));},
  guarda:async(n,v)=>{if(!CL_N.includes(n))throw new Error('clave desconocida');await clGuarda(n,(v||'').trim());
    // que la app use ya la nueva, sin reiniciar
    try{if(n==='tomtom'){TTKEY=null;TTT={};}}catch(e){}
    try{if(n==='rainbow'||n==='aemet'){RDF=[];RDT={};MTRT={};rdLoad();aeLoad();}}catch(e){}}};
})();
