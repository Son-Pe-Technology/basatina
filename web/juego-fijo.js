/* =====================================================================
   🔒 PANTALLA QUIETA MIENTRAS SE JUEGA (22 nov. 2026, petición de Pedro: su sobrina jugaba
   a «Atrapa las truchas» y la pantalla se movía). Se carga el último.
   Cuando se pulsa ▶️ en un juego, el juego se centra en la pantalla y la página deja de
   desplazarse (ni arrastrando el dedo ni con el «tirar para recargar»). Al terminar la
   partida (vuelve a salir el botón) o al cambiar de pantalla, todo vuelve a la normalidad.
   Para añadir otro juego: una línea más en JF (id del botón de jugar → caja del juego).
   ===================================================================== */
(function(){
const JF={ptGo:'.pqBox',jnGo:'.jgBox'};
const st=document.createElement('style');st.textContent=`
html.jgFijo,html.jgFijo body{overflow:hidden!important;overscroll-behavior:none!important;touch-action:none}
html.jgFijo .jfCaja{touch-action:none}
html.jgFijo .jfCaja button{touch-action:manipulation}`;
document.head.appendChild(st);
let btn=null,caja=null,vig=null;
const pDef=e=>{if(document.documentElement.classList.contains('jgFijo')&&e.cancelable)e.preventDefault();};
function suelta(){document.documentElement.classList.remove('jgFijo');if(caja)caja.classList.remove('jfCaja');
  document.removeEventListener('touchmove',pDef,{passive:false});clearInterval(vig);btn=caja=null;}
function fija(b){const c=b.closest(JF[b.id]);if(!c)return;btn=b;caja=c;
  try{c.scrollIntoView({block:'center',behavior:'instant'});}catch(e){c.scrollIntoView();}
  setTimeout(()=>{if(btn!==b)return;if(b.style.display!=='none'){suelta();return;}   // no ha empezado
    document.documentElement.classList.add('jgFijo');c.classList.add('jfCaja');
    document.addEventListener('touchmove',pDef,{passive:false});
    clearInterval(vig);vig=setInterval(()=>{if(!btn||btn.style.display!=='none'||!btn.offsetParent&&!caja.offsetParent)suelta();},400);},120);}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(b&&JF[b.id])fija(b);},true);
try{const _st=showTab;showTab=function(){suelta();return _st.apply(this,arguments);};}catch(e){}
})();
