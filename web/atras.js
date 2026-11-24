/* =====================================================================
   ◀ BOTÓN «ATRÁS» DEL MÓVIL (24 nov. 2026, lo pidió Pedro)
   El botón o el gesto «atrás» del móvil ya no depende del historial de la WebView
   (que a veces se saltaba pasos o cerraba la app). Ahora la app Android pregunta a la
   página con basatinaAtras() y la página decide, en este orden:
     1. Si hay una ventana abierta encima (foto, aviso, idioma, cuenta…), la cierra.
     2. Si el menú está abierto, lo cierra.
     3. Si dentro de la pantalla hay una ficha abierta con botón «‹ Volver» (ruta, localidad,
        árbol…), pulsa ese botón.
     4. Si no, vuelve a la pantalla anterior.
     5. Si no hay pantalla anterior y no estás en el Inicio, va al Inicio.
     6. En el Inicio, sin nada abierto, devuelve false y la app se va al fondo (como siempre).
   Necesita la APK 36 (5.6) o posterior. Con APKs viejas sigue funcionando el historial de antes.
   ===================================================================== */
(function(){
const HOME='mtiempo';
const STK=[];            // pantallas anteriores
let cur=(typeof NAVCUR!=='undefined'&&NAVCUR)||null,POP=false;
const vis=el=>{if(!el||!el.isConnected)return false;const cs=getComputedStyle(el);
  return cs.display!=='none'&&cs.visibility!=='hidden'&&(el.offsetWidth>0||el.offsetHeight>0);};

// apuntar cada pantalla que se abre
const _st=showTab;
showTab=function(t){
  const prev=cur,vuelta=POP||(typeof NAVPOP!=='undefined'&&NAVPOP);
  const r=_st.apply(this,arguments);
  if(vuelta){if(STK[STK.length-1]===t)STK.pop();}
  else if(t===HOME)STK.length=0;                       // al Inicio: desde ahí «atrás» sale
  else if(prev&&t!==prev){STK.push(prev);if(STK.length>40)STK.shift();}
  cur=t;return r;
};

// 1. ventanas encima de la pantalla
const VENTANAS='#foBox,#grBox,#pinBox,#bnaAccBox,#nvLang,#nvDl,#bnaOfiModal,.nvMu';
const CERRAR=/^(✕|×|✖|❌|x|cerrar|ahora no|no, gracias|cancelar|entendido|aceptar|vale|ok|volver|‹|◀)/i;
function cierraVentana(){
  const vs=[...document.querySelectorAll(VENTANAS)].filter(vis);
  if(!vs.length)return false;
  const o=vs[vs.length-1];
  if(o.id==='pinBox'&&typeof pinClose==='function'){pinClose();return true;}
  const b=[...o.querySelectorAll('button')].filter(vis).find(x=>CERRAR.test(x.textContent.trim()));
  if(b){b.click();if(!vis(o))return true;}
  o.dispatchEvent(new MouseEvent('click',{bubbles:true}));   // muchas se cierran tocando el fondo
  if(!vis(o))return true;
  if(o.id==='foBox'||o.id==='grBox'||o.id==='pinBox')o.style.display='none';else o.remove();
  return true;
}

// 3. fichas dentro de la pantalla con su botón «‹ Volver»
const VOLVER=/^(‹|◀|←|⬅)/;
function volverDentro(){
  const rv=document.getElementById('ruVolver');
  if(vis(rv)){rv.click();return true;}
  const secs=[...document.querySelectorAll('section[id^="t-"]')].filter(vis);
  for(const s of secs){
    const b=[...s.querySelectorAll('button')].find(x=>vis(x)&&(VOLVER.test(x.textContent.trim())||/(Volver|Back)$/.test(x.id||'')));
    if(b){b.click();return true;}
  }
  return false;
}

function ir(t){POP=true;try{showTab(t);}finally{POP=false;}
  try{history.replaceState({t},'');}catch(e){}
  if(typeof NAVCUR!=='undefined')try{NAVCUR=t;}catch(e){}
  try{window.scrollTo(0,0);}catch(e){}}

window.basatinaAtras=function(){
  try{
    if(document.getElementById('ciOv'))return false;          // «en obras»: nada que hacer
    if(cierraVentana())return true;
    const dr=document.getElementById('drawer');
    if(dr&&dr.classList.contains('on')){menu(false);return true;}
    if(volverDentro())return true;
    while(STK.length){const t=STK.pop();if(t&&t!==cur){ir(t);return true;}}
    if(cur&&cur!==HOME){ir(HOME);return true;}
    return false;
  }catch(e){return false;}
};
})();
