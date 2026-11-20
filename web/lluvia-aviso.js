/* =====================================================================
   🌧️ AVISO DE LLUVIA EN EL MÓVIL (20 nov. 2026, necesita la app 4.9 / código 29)
   Ajustes → «🌧️ Aviso de lluvia». Cada usuario elige:
     - la probabilidad mínima (0–100 %): con 0 % avisa de cualquier lluvia que vaya a caer;
     - la zona que se vigila: un círculo de 0 a 50 km alrededor de donde está el móvil;
     - si quiere horas de silencio y cuáles.
   Dónde está el móvil: al abrir la app (y al volver a ella) se pide la ubicación al teléfono y se guarda.
   Si no hay permiso, se usa el pueblo elegido en El tiempo.
   El trabajo en segundo plano (RiverJob.checkLluvia, en Java) mira cada ~15 minutos la lluvia de la próxima
   media hora en 17 puntos de la zona y manda el aviso cuando llega.
   Se carga después de curiosas.js: manda a Android la lista completa de avisos + «lluvia».
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const NAT=()=>typeof APP!=='undefined'&&APP&&window.AndroidNet&&window.AndroidNet.setAlerts;
const VER=()=>{try{return window.AndroidNet.appVersion?window.AndroidNet.appVersion():0;}catch(e){return 0;}};
const L=()=>Object.assign({on:false,prob:60,r:10,sil:[23,7],silOn:true,pos:null},CFG.lluvia||{});

// el pueblo más cercano, para que el aviso diga «al norte de Burlada» y no unas coordenadas
function cercano(la,lo){let b=null,bd=1e9;try{TOWNS.forEach(t=>{const d=km(la,lo,t[1],t[2]);if(d<bd){bd=d;b=t;}});}catch(e){}return b?b[0]:'tu zona';}
function posGuardar(){const l=L();if(!l.on)return;
  const pueblo=()=>{try{const t=TOWNS[TOWN];if(!l.pos){l.pos=[t[1],t[2],t[0]];CFG.lluvia=l;cfgSave();}}catch(e){}};
  if(!navigator.geolocation){pueblo();return;}
  navigator.geolocation.getCurrentPosition(p=>{const la=+p.coords.latitude.toFixed(4),lo=+p.coords.longitude.toFixed(4),o=l.pos;
      if(o&&Math.abs(o[0]-la)<0.005&&Math.abs(o[1]-lo)<0.005)return;   // casi en el mismo sitio: no hace falta guardar
      l.pos=[la,lo,cercano(la,lo)];CFG.lluvia=l;cfgSave();},
    pueblo,{enableHighAccuracy:false,timeout:15000,maximumAge:10*60e3});}

// manda a Android la lista completa (la misma que curiosas.js) + lluvia
if(typeof cfgApply==='function'){const _ca=cfgApply;window.cfgApply=cfgApply=function(){_ca.apply(this,arguments);
  try{if(NAT()){const l=L();window.AndroidNet.setAlerts(JSON.stringify({on:CFG.avisos,qAma:CFG.qAma,qRoj:CFG.qRoj,subida:CFG.subida,roads:CFG.roads||[],snow:CFG.snow||[],
    finde:CFG.finde?[TOWNS[TOWN][0],TOWNS[TOWN][1],TOWNS[TOWN][2]]:null,dato:!!CFG.dato,datoH:CFG.datoH||9,sismo:CFG.sismo!==false,sismoM:+CFG.sismoM||2.5,curiosa:!!CFG.curiosa,
    lluvia:{on:!!l.on,prob:+l.prob,r:+l.r,sil:l.silOn?l.sil:null,pos:l.pos}}));}}catch(e){}};
  if(L().on)cfgApply();}

// tarjeta en Ajustes
const hrs=sel=>Array.from({length:24},(_,h)=>`<option value="${h}"${h===sel?' selected':''}>${String(h).padStart(2,'0')}:00</option>`).join('');
const pTxt=p=>p==0?'cualquier lluvia':p+' % o más';
const rTxt=r=>r==0?'solo donde estoy':r+' km a mi alrededor';
if(typeof ajustesRender==='function'){const _aj=ajustesRender;window.ajustesRender=ajustesRender=function(){_aj.apply(this,arguments);
  const el=$('ajBody');if(!el)return;const l=L(),ok=NAT()&&VER()>=29;
  el.insertAdjacentHTML('beforeend',`<div class="card" id="ajLl"><b>🌧️ Aviso de lluvia</b>
   <div class="note">Te avisa en el móvil cuando va a llover en la próxima media hora en la zona que elijas, con la intensidad, la probabilidad y a qué distancia está.</div>
   ${ok?`<label style="display:flex;gap:8px;align-items:center;margin-top:8px"><input type="checkbox" id="llOn" ${l.on?'checked':''}> <span>Avisarme de la lluvia</span></label>
   <div id="llOpc" style="${l.on?'':'display:none'}">
    <div style="margin-top:10px"><span>Probabilidad mínima</span>: <b id="llPv">${pTxt(l.prob)}</b>
     <input type="range" id="llP" min="0" max="100" step="5" value="${l.prob}" style="width:100%"></div>
    <div style="margin-top:6px"><span>Zona que vigilo</span>: <b id="llRv">${rTxt(l.r)}</b>
     <input type="range" id="llR" min="0" max="50" step="5" value="${l.r}" style="width:100%"></div>
    <label style="display:flex;gap:8px;align-items:center;margin-top:8px"><input type="checkbox" id="llS" ${l.silOn?'checked':''}> <span>Horas de silencio</span></label>
    <div id="llSh" style="display:${l.silOn?'flex':'none'};gap:8px;align-items:center;margin-top:4px"><span>de</span> <select id="llS0">${hrs(l.sil[0])}</select> <span>a</span> <select id="llS1">${hrs(l.sil[1])}</select></div>
    <div class="note" style="margin-top:8px">📍 <span id="llPos">${l.pos?'Vigilando alrededor de '+esc(l.pos[2]):'Buscando dónde estás…'}</span>. Se actualiza cada vez que abres la app. Si no das permiso de ubicación, se usa el pueblo de El tiempo.</div>
    <div class="note">Android comprueba más o menos cada 15 minutos (puede retrasarlo un poco para ahorrar batería). Es una previsión: ante el riesgo, haz caso siempre a los avisos oficiales de AEMET.</div>
   </div>`:'<div class="note" style="margin-top:6px">📲 Llega con la app de Android 4.9 o más nueva. Actualízala desde «Buscar nueva versión de la app» o Google Play.</div>'}</div>`);
  if(!ok)return;
  const g=()=>{CFG.lluvia=Object.assign(L(),{on:$('llOn').checked,prob:+$('llP').value,r:+$('llR').value,silOn:$('llS').checked,sil:[+$('llS0').value,+$('llS1').value]});cfgSave();};
  $('llOn').onchange=()=>{$('llOpc').style.display=$('llOn').checked?'':'none';g();if($('llOn').checked)posGuardar();};
  $('llP').oninput=()=>{$('llPv').textContent=pTxt(+$('llP').value);};$('llP').onchange=g;
  $('llR').oninput=()=>{$('llRv').textContent=rTxt(+$('llR').value);};$('llR').onchange=g;
  $('llS').onchange=()=>{$('llSh').style.display=$('llS').checked?'flex':'none';g();};
  $('llS0').onchange=g;$('llS1').onchange=g;};}

// al abrir la app y al volver a ella: guardar dónde está el móvil
setTimeout(posGuardar,3000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)posGuardar();});

try{const T={"Aviso de lluvia":["Euri abisua","Rain alert","Alerte pluie"],"Avisarme de la lluvia":["Euriaz abisatu","Alert me about rain","M’alerter de la pluie"],
  "Probabilidad mínima":["Gutxieneko probabilitatea","Minimum chance","Probabilité minimale"],"Zona que vigilo":["Zaintzen dudan eremua","Area to watch","Zone surveillée"],
  "Horas de silencio":["Isilune orduak","Quiet hours","Heures de silence"]};
  Object.entries(T).forEach(([k,[eu,en,fr]])=>{I18N.eu[k]=eu;I18N.en[k]=en;I18N.fr[k]=fr;});}catch(e){}
})();
