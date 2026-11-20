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
// 💨 aviso de viento (APK 5.1 / código 31): rachas mínimas, zona y horas de silencio propias; usa la misma posición que el de lluvia
const V=()=>Object.assign({on:false,kmh:60,r:10,sil:[23,7],silOn:true},CFG.viento||{});
// 🥶 helada · 🥵 calor y UV · 🌫️ niebla (APK 5.2 / código 32): cada uno con su hora
const T=()=>{const c=CFG.tiempo||{};return {helada:Object.assign({on:false,t:0,h:20},c.helada||{}),calor:Object.assign({on:false,t:35,uv:true,h:9},c.calor||{}),niebla:Object.assign({on:false,m:500,h:7},c.niebla||{})};};
const tAlg=()=>{const t=T();return t.helada.on||t.calor.on||t.niebla.on;};
// 🔊 probar los sonidos (los mismos que suenan en el aviso del móvil): web/sonido-*.mp3
let SND=null;
window.bnSonar=function(f,btn){try{if(SND){SND.pause();const ya=SND._f===f;SND=null;document.querySelectorAll('.bnSnd').forEach(b=>b.textContent='▶ Probar');if(ya)return;}
  SND=new Audio('sonido-'+f+'.mp3');SND._f=f;if(btn)btn.textContent='■ Parar';
  SND.onended=()=>{if(btn)btn.textContent='▶ Probar';SND=null;};SND.play().catch(()=>{if(btn)btn.textContent='▶ Probar';toast&&toast('No se ha podido reproducir el sonido');});}catch(e){}};
const son=(nombre,f,extra)=>`<div style="display:flex;gap:8px;align-items:center;justify-content:space-between;margin-top:6px"><div>🔊 <span>Sonido</span>: <b>${nombre}</b>${extra?` <span class="note">${extra}</span>`:''}</div><button class="btn bnSnd" onclick="bnSonar('${f}',this)">▶ Probar</button></div>`;
const L=()=>Object.assign({on:false,prob:60,r:10,sil:[23,7],silOn:true,pos:null,radar:true,prev:true},CFG.lluvia||{});

// el pueblo más cercano, para que el aviso diga «al norte de Burlada» y no unas coordenadas
function cercano(la,lo){let b=null,bd=1e9;try{TOWNS.forEach(t=>{const d=km(la,lo,t[1],t[2]);if(d<bd){bd=d;b=t;}});}catch(e){}return b?b[0]:'tu zona';}
function posGuardar(){const l=L();if(!l.on&&!V().on&&!tAlg())return;
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
    lluvia:{on:!!l.on,prob:+l.prob,r:+l.r,sil:l.silOn?l.sil:null,pos:l.pos,radar:l.radar!==false,prev:l.prev!==false},
    viento:(v=>({on:!!v.on,kmh:+v.kmh,r:+v.r,sil:v.silOn?v.sil:null,pos:l.pos}))(V()),
    tiempo:Object.assign(T(),{alguno:tAlg(),pos:l.pos})}));}}catch(e){}};
  if(L().on||V().on||tAlg())cfgApply();}

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
    ${VER()>=30?`<div style="margin-top:8px"><span>Avisar con</span>:</div>
    <label style="display:flex;gap:8px;align-items:flex-start;margin-top:4px"><input type="checkbox" id="llRad" ${l.radar!==false?'checked':''} style="margin-top:4px"> <div><span>📡 Radar en directo</span><div class="note">La lluvia que ya está cayendo y se acerca</div></div></label>
    <label style="display:flex;gap:8px;align-items:flex-start;margin-top:4px"><input type="checkbox" id="llPre" ${l.prev!==false?'checked':''} style="margin-top:4px"> <div><span>🔮 Previsión</span><div class="note">La que se va a formar en la próxima media hora</div></div></label>`:''}
    <div style="margin-top:10px"><span>Probabilidad mínima</span> <span class="note">(previsión)</span>: <b id="llPv">${pTxt(l.prob)}</b>
     <input type="range" id="llP" min="0" max="100" step="5" value="${l.prob}" style="width:100%"></div>
    <div style="margin-top:6px"><span>Zona que vigilo</span>: <b id="llRv">${rTxt(l.r)}</b>
     <input type="range" id="llR" min="0" max="50" step="5" value="${l.r}" style="width:100%"></div>
    <label style="display:flex;gap:8px;align-items:center;margin-top:8px"><input type="checkbox" id="llS" ${l.silOn?'checked':''}> <span>Horas de silencio</span></label>
    <div id="llSh" style="display:${l.silOn?'flex':'none'};gap:8px;align-items:center;margin-top:4px"><span>de</span> <select id="llS0">${hrs(l.sil[0])}</select> <span>a</span> <select id="llS1">${hrs(l.sil[1])}</select></div>
    <div class="note" style="margin-top:8px">📍 <span id="llPos">${l.pos?'Vigilando alrededor de '+esc(l.pos[2]):'Buscando dónde estás…'}</span>. Se actualiza cada vez que abres la app. Si no das permiso de ubicación, se usa el pueblo de El tiempo.</div>
    ${VER()>=31?son('Lluvia','lluvia')+son('Lluvia con truenos','tormenta','(si va a llover fuerte)'):''}
    <div class="note">Radar: RainViewer, con los radares meteorológicos europeos. Android comprueba más o menos cada 15 minutos (puede retrasarlo un poco para ahorrar batería). Ante el riesgo, haz caso siempre a los avisos oficiales de AEMET.</div>
   </div>`:'<div class="note" style="margin-top:6px">📲 Llega con la app de Android 4.9 o más nueva. Actualízala desde «Buscar nueva versión de la app» o Google Play.</div>'}</div>`);
  const v=V(),okV=NAT()&&VER()>=31,kTxt=k=>'rachas de '+k+' km/h o más';
  el.insertAdjacentHTML('beforeend',`<div class="card" id="ajVi"><b>💨 Aviso de viento</b>
   <div class="note">Te avisa en el móvil cuando en la próxima hora va a haber rachas de viento fuertes en la zona que elijas, con la fuerza, de dónde viene y dónde.</div>
   ${okV?`<label style="display:flex;gap:8px;align-items:center;margin-top:8px"><input type="checkbox" id="viOn" ${v.on?'checked':''}> <span>Avisarme del viento</span></label>
   <div id="viOpc" style="${v.on?'':'display:none'}">
    <div style="margin-top:10px"><span>Avisar con</span>: <b id="viKv">${kTxt(v.kmh)}</b>
     <input type="range" id="viK" min="30" max="120" step="5" value="${v.kmh}" style="width:100%"></div>
    <div class="note">Orientativo: 40–60 km/h se nota mucho; 70–90 rompe ramas y tira cosas; más de 100, peligroso.</div>
    <div style="margin-top:6px"><span>Zona que vigilo</span>: <b id="viRv">${rTxt(v.r)}</b>
     <input type="range" id="viR" min="0" max="50" step="5" value="${v.r}" style="width:100%"></div>
    <label style="display:flex;gap:8px;align-items:center;margin-top:8px"><input type="checkbox" id="viS" ${v.silOn?'checked':''}> <span>Horas de silencio</span></label>
    <div id="viSh" style="display:${v.silOn?'flex':'none'};gap:8px;align-items:center;margin-top:4px"><span>de</span> <select id="viS0">${hrs(v.sil[0])}</select> <span>a</span> <select id="viS1">${hrs(v.sil[1])}</select></div>
    ${son('Viento','viento')}
    <div class="note" style="margin-top:6px">📍 <span>Usa tu ubicación, igual que el aviso de lluvia.</span></div>
    <div class="note">Previsión de Open‑Meteo. Ante el riesgo, haz caso siempre a los avisos oficiales de AEMET.</div>
   </div>`:'<div class="note" style="margin-top:6px">📲 Llega con la app de Android 5.1 o más nueva. Actualízala desde «Buscar nueva versión de la app» o Google Play.</div>'}</div>`);
  if(okV){const gv=()=>{CFG.viento=Object.assign(V(),{on:$('viOn').checked,kmh:+$('viK').value,r:+$('viR').value,silOn:$('viS').checked,sil:[+$('viS0').value,+$('viS1').value]});cfgSave();};
    $('viOn').onchange=()=>{$('viOpc').style.display=$('viOn').checked?'':'none';gv();if($('viOn').checked)posGuardar();};
    $('viK').oninput=()=>{$('viKv').textContent=kTxt(+$('viK').value);};$('viK').onchange=gv;
    $('viR').oninput=()=>{$('viRv').textContent=rTxt(+$('viR').value);};$('viR').onchange=gv;
    $('viS').onchange=()=>{$('viSh').style.display=$('viS').checked?'flex':'none';gv();};
    $('viS0').onchange=gv;$('viS1').onchange=gv;}
  const t=T(),okT=NAT()&&VER()>=32,hr=h=>String(h).padStart(2,'0')+':00';
  const opt=(arr,sel,f)=>arr.map(v=>`<option value="${v}"${v==sel?' selected':''}>${f(v)}</option>`).join('');
  const bloque=(id,ico,tit,desc,on,cuerpo)=>`<div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(128,128,128,.25)">
    <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="${id}On" ${on?'checked':''}> <b>${ico} <span>${tit}</span></b></label>
    <div class="note">${desc}</div><div id="${id}Opc" style="${on?'':'display:none'}">${cuerpo}</div></div>`;
  el.insertAdjacentHTML('beforeend',`<div class="card" id="ajTi"><b>🌡️ Helada, calor y niebla</b>
   <div class="note">Un aviso al día en el móvil, a la hora que elijas, con la previsión de donde estás.</div>
   ${okT?bloque('tiHe','🥶','Aviso de helada','Por la tarde, si esta noche o mañana temprano va a helar.',t.helada.on,
      `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:6px"><span>Si baja de</span> <select id="tiHeT">${opt([3,2,1,0,-2,-4,-6],t.helada.t,v=>(v>0?'+':'')+v+' °C')}</select> <span>· avisar a las</span> <select id="tiHeH">${opt([16,17,18,19,20,21,22],t.helada.h,hr)}</select></div>${son('Hielo','helada')}`)
   +bloque('tiCa','🥵','Aviso de calor y UV','Por la mañana, si hoy va a hacer mucho calor o el sol pega muy fuerte.',t.calor.on,
      `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:6px"><span>Si llega a</span> <select id="tiCaT">${opt([30,32,34,35,36,38,40],t.calor.t,v=>v+' °C')}</select> <span>· avisar a las</span> <select id="tiCaH">${opt([7,8,9,10,11],t.calor.h,hr)}</select></div>
       <label style="display:flex;gap:8px;align-items:center;margin-top:6px"><input type="checkbox" id="tiCaU" ${t.calor.uv?'checked':''}> <span>Avisar también si el índice UV es muy alto (8 o más)</span></label>${son('Chicharras','calor')}`)
   +bloque('tiNi','🌫️','Aviso de niebla','Antes de salir, si en las próximas 3 horas va a haber niebla. Útil si coges el coche temprano.',t.niebla.on,
      `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:6px"><span>Si se ve a menos de</span> <select id="tiNiM">${opt([200,500,1000],t.niebla.m,v=>v<1000?v+' m':'1 km')}</select> <span>· avisar a las</span> <select id="tiNiH">${opt([5,6,7,8,9],t.niebla.h,hr)}</select></div>${son('Sirena de niebla','niebla')}`)
   +`<div class="note" style="margin-top:10px">📍 <span>Usa tu ubicación, igual que el aviso de lluvia.</span> Previsión de Open‑Meteo. Ante el riesgo, haz caso siempre a los avisos oficiales de AEMET.</div>`
   :'<div class="note" style="margin-top:6px">📲 Llega con la app de Android 5.2 o más nueva. Actualízala desde «Buscar nueva versión de la app» o Google Play.</div>'}</div>`);
  if(okT){const gt=()=>{CFG.tiempo={helada:{on:$('tiHeOn').checked,t:+$('tiHeT').value,h:+$('tiHeH').value},
      calor:{on:$('tiCaOn').checked,t:+$('tiCaT').value,uv:$('tiCaU').checked,h:+$('tiCaH').value},
      niebla:{on:$('tiNiOn').checked,m:+$('tiNiM').value,h:+$('tiNiH').value}};cfgSave();};
    ['tiHe','tiCa','tiNi'].forEach(id=>{$(id+'On').onchange=()=>{$(id+'Opc').style.display=$(id+'On').checked?'':'none';gt();if($(id+'On').checked)posGuardar();};});
    ['tiHeT','tiHeH','tiCaT','tiCaH','tiCaU','tiNiM','tiNiH'].forEach(id=>$(id).onchange=gt);}
  if(!ok)return;
  const g=()=>{CFG.lluvia=Object.assign(L(),{on:$('llOn').checked,prob:+$('llP').value,r:+$('llR').value,silOn:$('llS').checked,sil:[+$('llS0').value,+$('llS1').value]},$('llRad')?{radar:$('llRad').checked,prev:$('llPre').checked}:{});cfgSave();};
  $('llOn').onchange=()=>{$('llOpc').style.display=$('llOn').checked?'':'none';g();if($('llOn').checked)posGuardar();};
  $('llP').oninput=()=>{$('llPv').textContent=pTxt(+$('llP').value);};$('llP').onchange=g;
  $('llR').oninput=()=>{$('llRv').textContent=rTxt(+$('llR').value);};$('llR').onchange=g;
  $('llS').onchange=()=>{$('llSh').style.display=$('llS').checked?'flex':'none';g();};
  $('llS0').onchange=g;$('llS1').onchange=g;if($('llRad')){$('llRad').onchange=g;$('llPre').onchange=g;}};}

// al abrir la app y al volver a ella: guardar dónde está el móvil
setTimeout(posGuardar,3000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)posGuardar();});

try{const T={"Aviso de lluvia":["Euri abisua","Rain alert","Alerte pluie"],"Avisarme de la lluvia":["Euriaz abisatu","Alert me about rain","M’alerter de la pluie"],
  "Probabilidad mínima":["Gutxieneko probabilitatea","Minimum chance","Probabilité minimale"],"Zona que vigilo":["Zaintzen dudan eremua","Area to watch","Zone surveillée"],
  "Horas de silencio":["Isilune orduak","Quiet hours","Heures de silence"],"Avisar con":["Abisatu honekin","Alert using","Alerter avec"],"📡 Radar en directo":["📡 Radarra zuzenean","📡 Live radar","📡 Radar en direct"],"🔮 Previsión":["🔮 Iragarpena","🔮 Forecast","🔮 Prévision"],
  "Aviso de viento":["Haize abisua","Wind alert","Alerte vent"],"Sonido":["Soinua","Sound","Son"],
  "Aviso de helada":["Izotz abisua","Frost alert","Alerte gel"],"Aviso de calor y UV":["Bero eta UV abisua","Heat and UV alert","Alerte chaleur et UV"],"Aviso de niebla":["Laino abisua","Fog alert","Alerte brouillard"],
  "Si baja de":["Hemendik behera jaisten bada","If it drops below","S’il descend sous"],"Si llega a":["Hona iristen bada","If it reaches","S’il atteint"],"Si se ve a menos de":["Ikuspena hau baino txikiagoa bada","If visibility is under","Si la visibilité est inférieure à"],
  "· avisar a las":["· abisatu ordu honetan","· alert at","· alerter à"],"Avisar también si el índice UV es muy alto (8 o más)":["Abisatu UV indizea oso altua bada ere (8 edo gehiago)","Also alert if the UV index is very high (8+)","Alerter aussi si l’indice UV est très élevé (8 ou plus)"],"Avisarme del viento":["Haizeaz abisatu","Alert me about wind","M’alerter du vent"],
  "Suena a viento.":["Haize soinua du.","Sounds like wind.","Son de vent."],"Usa tu ubicación, igual que el aviso de lluvia.":["Zure kokapena erabiltzen du, euri abisuak bezala.","Uses your location, like the rain alert.","Utilise ta position, comme l’alerte pluie."],
  "Suena a lluvia; si va a llover fuerte, a lluvia con truenos.":["Euri soinua du; euri handia bada, trumoiekin.","Sounds like rain; with thunder if it will rain hard.","Son de pluie ; avec du tonnerre s’il va pleuvoir fort."]};
  Object.entries(T).forEach(([k,[eu,en,fr]])=>{I18N.eu[k]=eu;I18N.en[k]=en;I18N.fr[k]=fr;});}catch(e){}
})();
