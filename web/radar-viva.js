/* =====================================================================
   📡 RADAR AL ESTILO «RAIN ALARM» (20 nov. 2026, petición de Pedro)
   - Mapa grande, con botón para cambiar el fondo: 🗺️ mapa del IGN o 🛰️ ortofoto PNOA (satélite, © IGN).
   - Tu posición con un punto azul y el círculo de la zona que vigila el «Aviso de lluvia».
   - Hora grande abajo del mapa y botón ▶️/⏸️ redondo encima del mapa; arranca solo al abrir.
   - Barra de colores con los mm/h (la escala «Universal Blue» de RainViewer, de dBZ a mm/h con Marshall‑Palmer).
   No cambia cómo se cargan los fotogramas (RainViewer, Rainbow o Euskalmet): solo la forma de verlos.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
if(!$('rdc')||typeof rdInit!=='function')return;
const PNOA=(z,x,y)=>`https://www.ign.es/wmts/pnoa-ma?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=OI.OrthoimageCoverage&STYLE=default&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX=${z}&TILEROW=${y}&TILECOL=${x}&FORMAT=image/jpeg`;
let SAT=(()=>{try{return localStorage.getItem('rdSat')!=='0';}catch(e){return true;}})();
let YO=null;   // [lat, lon]

// --- estilos ---
const st=document.createElement('style');st.textContent=`
#rdWrap{position:relative;border-radius:16px;overflow:hidden}
#rdWrap .rdFab{position:absolute;right:12px;bottom:12px;width:58px;height:58px;border-radius:16px;border:0;background:#00c4ee;color:#06121d;font-size:26px;font-weight:900;box-shadow:0 4px 14px rgba(0,0,0,.35);cursor:pointer}
#rdWrap .rdHora{position:absolute;left:0;right:0;bottom:10px;text-align:center;pointer-events:none;color:#fff;font:800 24px/1 'Montserrat',system-ui,sans-serif;text-shadow:0 1px 4px rgba(0,0,0,.8)}
#rdWrap .rdHora small{display:block;font-size:11px;font-weight:700;margin-top:3px;opacity:.9}
#rdWrap .rdTop{position:absolute;left:10px;top:10px;display:flex;gap:6px}
#rdWrap .rdTop button{border:0;border-radius:12px;background:rgba(255,255,255,.92);padding:7px 10px;font:700 14px system-ui;box-shadow:0 2px 6px rgba(0,0,0,.3);cursor:pointer}
.rdBar{display:grid;grid-template-columns:repeat(9,1fr);margin-top:8px;border-radius:10px;overflow:hidden;font:800 11.5px/1 system-ui;text-align:center}
.rdBar span{padding:7px 0;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.6)}
.rdBarT{display:flex;justify-content:space-between;font-size:11.5px;margin-top:6px;opacity:.8}`;
document.head.appendChild(st);

// --- montar la pantalla (antes de que se cree el mapa) ---
const cv=$('rdc'),wrap=cv.parentElement;wrap.id='rdWrap';
cv.setAttribute('height',String(Math.max(380,Math.min(640,Math.round(innerHeight*.62)))));
wrap.insertAdjacentHTML('beforeend',`<div class="rdHora"><span id="rdHoraT">--:--</span><small id="rdHoraS"></small></div><button class="rdFab" id="rdFab">▶</button>`);
// el control de antes se queda (sirve para ir a un momento concreto), pero sin el botón repetido
const card0=$('rdPlay').closest('.card');$('rdPlay').style.display='none';
// los botones de fondo y «dónde estoy» van aquí, fuera del mapa, para no tapar nada (20 nov. 2026)
card0.insertAdjacentHTML('beforeend',`<div class="row" style="margin-top:8px;gap:8px"><button class="btn" id="rdBase">${SAT?'🗺️ Ver mapa':'🛰️ Ver satélite'}</button><button class="btn" id="rdYo">📍 Dónde estoy</button></div>`);
// leyenda: de dBZ a mm/h (R = (10^(dBZ/10)/200)^(1/1.6)); colores de RainViewer «Universal Blue»
const LEY=[[15,'#88ddee','0,6'],[20,'#00a3e0','1,3'],[25,'#0077aa','2,7'],[30,'#005588','5,6'],[35,'#ffee00','12'],[40,'#ffaa00','24'],[45,'#ff4400','49'],[50,'#c10000','100'],[55,'#ff77ff','205']];
const leg=wrap.parentElement.querySelector('.rdLeg');
if(leg)leg.outerHTML=`<div><div class="rdBar">${LEY.map(l=>`<span style="background:${l[1]};color:${l[0]===35||l[0]===15?'#06121d':'#fff'};text-shadow:${l[0]===35||l[0]===15?'none':''}">${l[2]}</span>`).join('')}</div>
  <div class="rdBarT"><span>mm/h · débil</span><span>moderada</span><span>fuerte</span><span>muy fuerte</span></div>
  <div class="note" style="margin-top:6px">🔵 Tú · ⚪ círculo: la zona que vigila tu <a href="#" onclick="showTab('ajustes');return false" style="color:var(--acc)">aviso de lluvia</a>. La nieve sale en azules claros y blancos. Fondo satélite: PNOA cedido por © IGN.</div></div>`;

// --- dónde estoy ---
function yo(cb){try{const p=CFG.lluvia&&CFG.lluvia.pos;if(p)YO=[p[0],p[1]];}catch(e){}
  if(!navigator.geolocation){cb&&cb();return;}
  navigator.geolocation.getCurrentPosition(p=>{YO=[p.coords.latitude,p.coords.longitude];cb&&cb();},()=>{cb&&cb();},{enableHighAccuracy:false,timeout:12000,maximumAge:10*60e3});}

// --- dibujo: después del radar, el punto y el círculo ---
function yoDraw(x,P){if(!YO)return;
  const [px,py]=P(YO[0],YO[1]),r=+((CFG.lluvia&&CFG.lluvia.on&&CFG.lluvia.r)||25);
  const [qx]=P(YO[0],YO[1]+r/(111.32*Math.cos(YO[0]*Math.PI/180))),rp=Math.abs(qx-px);
  x.save();x.setLineDash([6,5]);x.lineWidth=2;x.strokeStyle='rgba(255,255,255,.85)';x.beginPath();x.arc(px,py,rp,0,7);x.stroke();x.setLineDash([]);
  x.fillStyle='rgba(30,136,229,.25)';x.beginPath();x.arc(px,py,16,0,7);x.fill();
  x.fillStyle='#fff';x.beginPath();x.arc(px,py,8,0,7);x.fill();x.fillStyle='#1e88e5';x.beginPath();x.arc(px,py,5.5,0,7);x.fill();
  x.font='700 11px system-ui';x.fillStyle='#fff';x.textAlign='center';x.shadowColor='rgba(0,0,0,.8)';x.shadowBlur=3;x.fillText(r+' km',px,py-rp-5);x.restore();}
const _d=rdDraw;rdDraw=function(x,P,b){_d.apply(this,arguments);yoDraw(x,P);};
// zoom para que quepa el círculo del aviso (con un poco de margen)
const zoomYo=M=>{const r=+((CFG.lluvia&&CFG.lluvia.on&&CFG.lluvia.r)||25),deg=2.6*r/(111.32*Math.cos(YO[0]*Math.PI/180));return Math.max(1,Math.min(12,(NB.e-NB.w)/deg));};

// --- hora grande y botón ▶/⏸ ---
const _s=rdShow;rdShow=function(){_s.apply(this,arguments);const f=RDF[RDI];if(!f)return;
  $('rdHoraT').textContent=new Date(f.time*1000).toTimeString().slice(0,5);
  $('rdHoraS').textContent=f.nc?'🔮 previsión':(RDI===RDF.findLastIndex(g=>!g.nc)?'ahora':'');};
const playing=()=>$('rdPlay').textContent.includes('⏸');
const fab=()=>{$('rdFab').textContent=playing()?'❚❚':'▶';};
$('rdFab').onclick=()=>{$('rdPlay').click();fab();};

// --- botones de arriba ---
$('rdBase').onclick=()=>{SAT=!SAT;try{localStorage.setItem('rdSat',SAT?'1':'0');}catch(e){}
  $('rdBase').textContent=SAT?'🗺️ Ver mapa':'🛰️ Ver satélite';if(RDM){RDM.tile=SAT?PNOA:null;RDM.draw();RDM.base();}};
$('rdYo').onclick=()=>yo(()=>{if(RDM&&YO){RDM.la=YO[0];RDM.lo=YO[1];RDM.z=zoomYo(RDM);RDM.draw();RDM.base();}});

// --- al abrir: fondo elegido, centrado en mí y en marcha ---
const _i=rdInit;rdInit=function(){const nuevo=!RDM;_i.apply(this,arguments);if(!RDM)return;
  RDM.tile=SAT?PNOA:null;
  if(nuevo)yo(()=>{if(YO&&RDM){RDM.la=YO[0];RDM.lo=YO[1];RDM.z=zoomYo(RDM);}RDM.draw();RDM.base();});
  let n=0;const arr=setInterval(()=>{n++;if(RDF.length>1&&!playing()&&$('t-radar').classList.contains('on')){$('rdPlay').click();clearInterval(arr);}if(n>40)clearInterval(arr);fab();},250);
  setTimeout(fab,600);};
setInterval(()=>{if($('t-radar').classList.contains('on'))fab();},1000);

/* ---------- 🏠 El mismo radar en el mapa de Inicio (pestaña «📡 Radar») ----------
   En vez del mapa fijo de toda Navarra, un mapa con zoom ya centrado en donde estás, fondo satélite,
   tu punto con el círculo del aviso y la animación de las últimas 2 horas en marcha. Se puede mover y hacer zoom con dos dedos. */
(function(){const mtc=$('mtc'),mw=$('mtWrap');if(!mtc||!mw||typeof NavMap!=='function')return;
  mtc.insertAdjacentHTML('afterend',`<div id="mtrBox" style="display:none;position:relative;border-radius:14px;overflow:hidden"><canvas id="mtr" height="${Math.max(360,mtc.clientHeight||400)}"></canvas>
    <div class="rdHora" style="position:absolute;left:0;right:0;bottom:38px;text-align:center;pointer-events:none;color:#fff;font:800 22px/1 'Montserrat',system-ui,sans-serif;text-shadow:0 1px 4px rgba(0,0,0,.8)"><span id="mtrT">--:--</span><small id="mtrS" style="display:block;font-size:11px;margin-top:2px"></small></div>
    <button id="mtrFab" style="position:absolute;right:10px;bottom:40px;width:50px;height:50px;border-radius:14px;border:0;background:#00c4ee;color:#06121d;font-size:22px;font-weight:900;box-shadow:0 4px 12px rgba(0,0,0,.35)">❚❚</button>
    <div style="position:absolute;left:0;right:0;bottom:0;display:grid;grid-template-columns:repeat(9,1fr);font:800 10px/1 system-ui;text-align:center">${LEY.map(l=>`<span style="background:${l[1]};padding:5px 0;color:${l[0]===35||l[0]===15?'#06121d':'#fff'}">${l[2]}</span>`).join('')}</div></div>`);
  let M=null,I=-1,TM=null,PLAY=true;const T={};
  const vis=()=>MTL==='radar'&&$('t-mtiempo').classList.contains('on');
  const pinta=()=>{const L=RDF;if(!L.length)return;const f=L[I]||L[L.length-1];$('mtrT').textContent=new Date(f.time*1000).toTimeString().slice(0,5);
    $('mtrS').textContent=f.nc?'🔮 previsión':(I===RDF.findLastIndex(g=>!g.nc)?'ahora':'');M&&M.draw();};
  const dib=(x,P,b)=>{const f=RDF[I];x.fillStyle='rgba(8,16,26,.15)';x.fillRect(0,0,b.W,b.H);
    if(f){rdPaint(x,P,b,f.path||f,T,()=>M&&M.draw());if(!f.nc&&typeof eusDraw==='function')eusDraw(x,P,eusAt(f.time),()=>M&&M.draw());}yoDraw(x,P);};
  const anima=()=>{clearInterval(TM);TM=setInterval(()=>{if(!vis()){clearInterval(TM);TM=null;return;}if(!PLAY||!RDF.length)return;
      const ult=RDF.findLastIndex(g=>!g.nc);I=I>=RDF.length-1?0:I+1;pinta();if(I===ult){PLAY&&(PLAY='pausa');setTimeout(()=>{if(PLAY==='pausa')PLAY=true;},1500);}},700);};
  $('mtrFab').onclick=e=>{e.stopPropagation();PLAY=!PLAY;$('mtrFab').textContent=PLAY?'❚❚':'▶';};
  function abrir(){mtc.style.display='none';$('mtrBox').style.display='';const lg=$('mtLeg');if(lg)lg.style.visibility='hidden';
    if(!M){M=NavMap('mtr',dib,()=>{});M.tile=SAT?PNOA:null;}
    yo(()=>{if(YO){M.la=YO[0];M.lo=YO[1];M.z=zoomYo(M);}M.draw();M.base();});
    const go=()=>{if(I<0||I>=RDF.length)I=Math.max(0,RDF.findLastIndex(g=>!g.nc));pinta();anima();};
    if(RDF.length)go();else rdLoad().then(go);}
  function cerrar(){mtc.style.display='';$('mtrBox').style.display='none';const lg=$('mtLeg');if(lg)lg.style.visibility='';clearInterval(TM);TM=null;}
  const _set=mtSetLayer;mtSetLayer=function(l){_set.apply(this,arguments);if(l==='radar')abrir();else cerrar();};
  const _st=showTab;showTab=function(t){_st.apply(this,arguments);if(t==='mtiempo'&&MTL==='radar')setTimeout(abrir,60);};
  setInterval(()=>{if(vis())rdLoad().then(()=>{pinta();});},10*60e3);})();
})();
