/* =====================================================================
   🙂 EMOJIS DE LOS GRUPOS DEL MENÚ (20 nov. 2026)
   Con los iconos en «Emojis», cada grupo enseña el emoji guardado en data-ico.
   Los grupos que se añadieron más tarde (Servicios, NA Salud, NA Juega…) no lo tenían.
   Esto lo pone a cualquier grupo que no lo tenga, cada vez que se abre el menú.
   ===================================================================== */
(function(){
const EMO={'El tiempo':'🌦️','Ríos':'🌊','Vida silvestre':'🦋','Carreteras':'🚗','Localidades':'🏘️','Servicios':'🛎️','NA Salud':'🩺',
  'NA Sostenible':'♻️','NA sísmica':'🌍','NA Juega':'🎮','Qué hacer':'🥾','Mi Espacio':'⭐','Participa':'📸','Configuración':'⚙️','Administrador':'🔧'};
function poner(){document.querySelectorAll('#drawer .dgroup>span').forEach(s=>{if(s.dataset.ico)return;
  const k=s.dataset.k||s.textContent.trim();const e=EMO[k]||EMO[Object.keys(EMO).find(n=>k.startsWith(n))];if(e)s.dataset.ico=e;});}
if(typeof menu==='function'){const _m=menu;window.menu=menu=function(o){const r=_m.apply(this,arguments);if(o)poner();return r;};}
[500,2000,6000].forEach(t=>setTimeout(poner,t));
})();
