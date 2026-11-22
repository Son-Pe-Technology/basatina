/* =====================================================================
   📡 RADAR AL ESTILO «RAIN ALARM» (20 nov. 2026, petición de Pedro)
   - Mapa grande, con botón para cambiar el fondo: 🗺️ mapa del IGN o 🛰️ ortofoto PNOA (satélite, © IGN).
   - Tu posición con un punto azul (el círculo de la zona se quitó el 21 nov. 2026).
   - Hora grande abajo del mapa y botón ▶️/⏸️ redondo encima del mapa; arranca solo al abrir.
   - Barra de colores con los mm/h (la escala «Universal Blue» de RainViewer, de dBZ a mm/h con Marshall‑Palmer).
   No cambia cómo se cargan los fotogramas (RainViewer, Rainbow o Euskalmet): solo la forma de verlos.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
if(!$('rdc')||typeof rdInit!=='function')return;
const PNOA=(z,x,y)=>`https://www.ign.es/wmts/pnoa-ma?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=OI.OrthoimageCoverage&STYLE=default&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX=${z}&TILEROW=${y}&TILECOL=${x}&FORMAT=image/jpeg`;
// fondos: 🌑 oscuro (CARTO Dark Matter, © OpenStreetMap © CARTO), 🛰️ satélite (PNOA, © IGN), 🗺️ mapa (IGN)
const CARTO=(z,x,y)=>`https://${'abcd'[(x+y)%4]}.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}@2x.png`;
const FONDOS={sat:['🛰️ Satélite',PNOA],osc:['🌑 Oscuro',CARTO],map:['🗺️ Mapa',null]};
// satélite «como Rain Alarm» (20 nov. 2026): más oscuro, con más contraste y color, para que los montes se vean en volumen
const FILTRO={sat:'brightness(.8) contrast(1.15) saturate(1.4)'};
let FONDO=(()=>{try{return localStorage.getItem('rdFondo2')||'sat';}catch(e){return 'sat';}})();if(!FONDOS[FONDO])FONDO='sat';
const fondoT=()=>FONDOS[FONDO][1];

/* ---------- ⛰️ RELIEVE EN 3D (20 nov. 2026) ----------
   Sombreado del terreno calculado en el propio móvil a partir de las alturas (teselas «Terrarium» de los
   datos abiertos de AWS: SRTM y otros modelos, ~30 m). Cada tesela de alturas se convierte en luces y sombras
   con el sol al noroeste (como en los mapas de relieve de toda la vida), exagerando la altura para que se vean
   los valles hundidos, las cuencas y las llanuras. Las sombras se pintan en negro transparente y las laderas
   al sol en blanco transparente, encima del satélite. */
const DEM=(z,x,y)=>`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;
const HC=new Map();let HFAIL=0;
function hillTile(z,X,Y,redraw){const k=z+'/'+X+'/'+Y;let h=HC.get(k);if(h)return h;h={ok:false};HC.set(k,h);if(HC.size>260)HC.delete(HC.keys().next().value);
  const im=new Image();im.crossOrigin='anonymous';
  im.onload=()=>{try{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);
      const d=g.getImageData(0,0,256,256).data,E=new Float32Array(65536);
      for(let i=0;i<65536;i++)E[i]=d[i*4]*256+d[i*4+1]+d[i*4+2]/256-32768;
      const n=2**z,lat=Math.atan(Math.sinh(Math.PI*(1-2*(Y+.5)/n))),cell=156543.03*Math.cos(lat)/n;
      const ex=z<=8?3.2:z<=10?2.4:1.8;   // exageración: más cuanto más lejos, para que se note el volumen
      const azm=(360-315+90)*Math.PI/180,al=38*Math.PI/180,sa=Math.sin(al),ca=Math.cos(al);
      const o=g.createImageData(256,256),q=o.data,e=(x,y)=>E[Math.max(0,Math.min(255,y))*256+Math.max(0,Math.min(255,x))];
      for(let y=0;y<256;y++)for(let x=0;x<256;x++){
        const dx=((e(x+1,y-1)+2*e(x+1,y)+e(x+1,y+1))-(e(x-1,y-1)+2*e(x-1,y)+e(x-1,y+1)))/(8*cell)*ex,
              dy=((e(x-1,y+1)+2*e(x,y+1)+e(x+1,y+1))-(e(x-1,y-1)+2*e(x,y-1)+e(x+1,y-1)))/(8*cell)*ex;
        const sl=Math.atan(Math.hypot(dx,dy)),asp=Math.atan2(dy,-dx);
        let v=sa*Math.cos(sl)+ca*Math.sin(sl)*Math.cos(azm-asp);   // 0 sombra … 1 de cara al sol
        const f=v/sa-1, j=(y*256+x)*4;   // <0 sombra, >0 luz (respecto a lo llano)
        if(f<0){q[j]=q[j+1]=0;q[j+2]=12;q[j+3]=Math.min(235,-f*260);}
        else{q[j]=255;q[j+1]=250;q[j+2]=235;q[j+3]=Math.min(110,f*170);}}
      g.putImageData(o,0,0);h.c=c;h.ok=true;HFAIL=0;redraw&&redraw();}catch(err){HFAIL++;}};
  im.onerror=()=>{HFAIL++;setTimeout(()=>HC.delete(k),20000);};im.src=DEM(z,X,Y);return h;}
function hillDraw(x,P,b,redraw){if(HFAIL>8)return;const dpr=Math.min(2,window.devicePixelRatio||1);
  const z=Math.max(6,Math.min(12,Math.round(Math.log2(360*b.W*dpr*.6/(256*(b.e-b.w)))))),n=2**z;
  const tx=lo=>Math.floor((lo+180)/360*n),ty=la=>{const r=la*Math.PI/180;return Math.floor((1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*n);};
  const lon=X=>X/n*360-180,lat=Y=>{const k=Math.PI-2*Math.PI*Y/n;return 180/Math.PI*Math.atan(.5*(Math.exp(k)-Math.exp(-k)));};
  const x0=tx(b.w),x1=tx(b.e),y0=ty(b.n),y1=ty(b.s);if((x1-x0+1)*(y1-y0+1)>60)return;
  for(let X=x0;X<=x1;X++)for(let Y=y0;Y<=y1;Y++){const h=hillTile(z,X,Y,redraw);if(!h.ok)continue;
    const [ax,ay]=P(lat(Y),lon(X)),[bx,by]=P(lat(Y+1),lon(X+1));x.drawImage(h.c,ax,ay,bx-ax+.5,by-ay+.5);}}
const REL={sat:true,osc:true,map:false};   // en qué fondos va el relieve
const fondo=M=>{M.tile=fondoT();M.tileFilter=FILTRO[FONDO]||null;M.overTiles=REL[FONDO]?hillDraw:null;};
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
card0.insertAdjacentHTML('beforeend',`<div class="row" style="margin-top:8px;gap:6px;flex-wrap:wrap">${Object.entries(FONDOS).map(([k,v])=>`<button class="btn rdF${k===FONDO?' pri':''}" data-f="${k}">${v[0]}</button>`).join('')}<button class="btn" id="rdYo">📍 Dónde estoy</button></div>`);
// leyenda: de dBZ a mm/h (R = (10^(dBZ/10)/200)^(1/1.6)). 21 nov. 2026: colores EXACTOS de la paleta «Universal Blue»
// de RainViewer (su tabla oficial), la misma con la que se pinta el mapa (RainViewer y Rainbow, ver RD_PAL en index.html)
const LEY=[15,20,25,30,35,40,45,50,55].map(d=>{const c=RD_PAL[d],mm=Math.pow(Math.pow(10,d/10)/200,1/1.6);
  return [d,c,mm<10?mm.toFixed(1).replace('.',','):String(Math.round(mm)),(parseInt(c.slice(1,3),16)*299+parseInt(c.slice(3,5),16)*587+parseInt(c.slice(5,7),16)*114)/1000>150];});
const leg=wrap.parentElement.querySelector('.rdLeg');
if(leg)leg.outerHTML=`<div><div class="rdBar">${LEY.map(l=>`<span style="background:${l[1]};color:${l[3]?'#06121d':'#fff'};text-shadow:${l[3]?'none':''}">${l[2]}</span>`).join('')}</div>
  <div class="rdBarT"><span>mm/h · débil</span><span>moderada</span><span>fuerte</span><span>muy fuerte</span></div>
  <div class="note" style="margin-top:6px"><span>El punto azul del mapa eres tú (dónde estás ahora).</span> <span>Si nieva, la nieve se ve en azul claro y blanco.</span></div></div>`;

// --- dónde estoy ---
function yo(cb){try{const p=CFG.lluvia&&CFG.lluvia.pos;if(p)YO=[p[0],p[1]];}catch(e){}
  if(!navigator.geolocation){cb&&cb();return;}
  navigator.geolocation.getCurrentPosition(p=>{YO=[p.coords.latitude,p.coords.longitude];cb&&cb();},()=>{cb&&cb();},{enableHighAccuracy:false,timeout:12000,maximumAge:10*60e3});}

// 21 nov. 2026: Pedro pidió quitar el círculo del radar. Solo sale el punto azul de dónde estás.
// --- dibujo: después del radar, el punto de dónde estás ---
function yoDraw(x,P){if(!YO)return;
  const [px,py]=P(YO[0],YO[1]);x.save();
  x.fillStyle='rgba(30,136,229,.25)';x.beginPath();x.arc(px,py,14,0,7);x.fill();
  x.fillStyle='#fff';x.beginPath();x.arc(px,py,7,0,7);x.fill();x.fillStyle='#1e88e5';x.beginPath();x.arc(px,py,4.8,0,7);x.fill();x.restore();}
const _d=rdDraw;rdDraw=function(x,P,b){_d.apply(this,arguments);yoDraw(x,P);};
// zoom: unos 25 km alrededor de donde estás
const zoomYo=M=>{const r=25,deg=2.6*r/(111.32*Math.cos(YO[0]*Math.PI/180));return Math.max(1,Math.min(12,(NB.e-NB.w)/deg));};

// --- hora grande y botón ▶/⏸ ---
const _s=rdShow;rdShow=function(){_s.apply(this,arguments);const f=RDF[RDI];if(!f)return;
  $('rdHoraT').textContent=new Date(f.time*1000).toTimeString().slice(0,5);
  $('rdHoraS').textContent=f.nc?'🔮 previsión':(RDI===RDF.findLastIndex(g=>!g.nc)?'ahora':'');};
const playing=()=>$('rdPlay').textContent.includes('⏸');
const fab=()=>{$('rdFab').textContent=playing()?'❚❚':'▶';};
$('rdFab').onclick=()=>{$('rdPlay').click();fab();};

// --- botones de arriba ---
document.querySelectorAll('.rdF').forEach(b=>b.onclick=()=>{FONDO=b.dataset.f;try{localStorage.setItem('rdFondo2',FONDO);}catch(e){}
  document.querySelectorAll('.rdF').forEach(c=>c.classList.toggle('pri',c===b));
  for(const M of [RDM,window.MTR_M])if(M){fondo(M);M.draw();M.base();}});
$('rdYo').onclick=()=>yo(()=>{if(RDM&&YO){RDM.la=YO[0];RDM.lo=YO[1];RDM.z=zoomYo(RDM);RDM.draw();RDM.base();}});

// --- al abrir: fondo elegido, centrado en mí y en marcha ---
const _i=rdInit;rdInit=function(){const nuevo=!RDM;_i.apply(this,arguments);if(!RDM)return;
  fondo(RDM);
  if(nuevo)yo(()=>{if(YO&&RDM){RDM.la=YO[0];RDM.lo=YO[1];RDM.z=zoomYo(RDM);}RDM.draw();RDM.base();});
  let n=0;const arr=setInterval(()=>{n++;if(RDF.length>1&&!playing()&&$('t-radar').classList.contains('on')){$('rdPlay').click();clearInterval(arr);}if(n>40)clearInterval(arr);fab();},250);
  setTimeout(fab,600);};
setInterval(()=>{if($('t-radar').classList.contains('on'))fab();},1000);

/* ---------- 🏠 El mismo radar en el mapa de Inicio (pestaña «📡 Radar») ----------
   En vez del mapa fijo de toda Navarra, un mapa con zoom ya centrado en donde estás, fondo satélite,
   tu punto y la animación de las últimas 2 horas en marcha. Se puede mover y hacer zoom con dos dedos. */
(function(){const mtc=$('mtc'),mw=$('mtWrap');if(!mtc||!mw||typeof NavMap!=='function')return;
  mtc.insertAdjacentHTML('afterend',`<div id="mtrBox" style="display:none;position:relative;border-radius:14px;overflow:hidden"><canvas id="mtr" height="${Math.max(360,mtc.clientHeight||400)}"></canvas>
    <div class="rdHora" style="position:absolute;left:0;right:0;bottom:38px;text-align:center;pointer-events:none;color:#fff;font:800 22px/1 'Montserrat',system-ui,sans-serif;text-shadow:0 1px 4px rgba(0,0,0,.8)"><span id="mtrT">--:--</span><small id="mtrS" style="display:block;font-size:11px;margin-top:2px"></small></div>
    <button id="mtrFab" style="position:absolute;right:10px;bottom:40px;width:50px;height:50px;border-radius:14px;border:0;background:#00c4ee;color:#06121d;font-size:22px;font-weight:900;box-shadow:0 4px 12px rgba(0,0,0,.35)">❚❚</button>
    <div style="position:absolute;left:0;right:0;bottom:0;display:grid;grid-template-columns:repeat(9,1fr);font:800 10px/1 system-ui;text-align:center">${LEY.map(l=>`<span style="background:${l[1]};padding:5px 0;color:${l[3]?'#06121d':'#fff'}">${l[2]}</span>`).join('')}</div></div>`);
  let M=null,I=-1,TM=null,PLAY=true;const T={};
  const vis=()=>MTL==='radar'&&$('t-mtiempo').classList.contains('on');
  const pinta=()=>{const L=RDF;if(!L.length)return;const f=L[I]||L[L.length-1];$('mtrT').textContent=new Date(f.time*1000).toTimeString().slice(0,5);
    $('mtrS').textContent=f.nc?'🔮 previsión':(I===RDF.findLastIndex(g=>!g.nc)?'ahora':'');M&&M.draw();};
  const dib=(x,P,b)=>{const f=RDF[I];x.fillStyle='rgba(8,16,26,.15)';x.fillRect(0,0,b.W,b.H);
    if(f){rdPaint(x,P,b,f.path||f,T,()=>M&&M.draw());}yoDraw(x,P);};
  const anima=()=>{clearInterval(TM);TM=setInterval(()=>{if(!vis()){clearInterval(TM);TM=null;return;}if(!PLAY||!RDF.length)return;
      const ult=RDF.findLastIndex(g=>!g.nc);I=I>=RDF.length-1?0:I+1;pinta();if(I===ult){PLAY&&(PLAY='pausa');setTimeout(()=>{if(PLAY==='pausa')PLAY=true;},1500);}},700);};
  $('mtrFab').onclick=e=>{e.stopPropagation();PLAY=!PLAY;$('mtrFab').textContent=PLAY?'❚❚':'▶';};
  function abrir(){mtc.style.display='none';$('mtrBox').style.display='';const lg=$('mtLeg');if(lg)lg.style.visibility='hidden';
    if(!M){M=window.MTR_M=NavMap('mtr',dib,()=>{});}fondo(M);
    yo(()=>{if(YO){M.la=YO[0];M.lo=YO[1];M.z=zoomYo(M);}M.draw();M.base();});
    const go=()=>{if(I<0||I>=RDF.length)I=Math.max(0,RDF.findLastIndex(g=>!g.nc));pinta();anima();};
    if(RDF.length)go();else rdLoad().then(go);}
  function cerrar(){mtc.style.display='';$('mtrBox').style.display='none';const lg=$('mtLeg');if(lg)lg.style.visibility='';clearInterval(TM);TM=null;}
  const _set=mtSetLayer;mtSetLayer=function(l){_set.apply(this,arguments);if(l==='radar')abrir();else cerrar();};
  const _st=showTab;showTab=function(t){_st.apply(this,arguments);if(t==='mtiempo'&&MTL==='radar')setTimeout(abrir,60);};
  setInterval(()=>{if(vis())rdLoad().then(()=>{pinta();});},10*60e3);})();
})();
