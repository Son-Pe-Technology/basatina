/* =====================================================================
   🎬🏍️🚴🧺🗺️ OCIO Y TERRITORIO (15 nov. 2026)
   Qué hacer: 🎬 Cartelera de cine · 🏍️ NA en Moto · 🚴 NA Pedalea · 🧺 NA de Picnic
   Localidades: pestaña «🗺️ Comarcas y valles» con fichas de cada zona y de cada municipio y su mapa de puntos de interés.
   Datos: web/ocio.js (tools/ocio.py), web/territorio.js (tools/territorio.py), web/bici.js, web/monte.js,
   web/abiertos.js, web/tiendas.js, web/rutas.js. Cada archivo se carga solo al abrir su pantalla.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const N=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const abre=u=>window.amAbre?window.amAbre(u):window.open(u,'_blank');
const nuevo=window.amNuevo;
const pip=(la,lo,R)=>{let ins=false;for(const r of R)for(let i=0,j=r.length-1;i<r.length;j=i++){const [ya,xa]=r[i],[yb,xb]=r[j];if((ya>la)!==(yb>la)&&lo<(xb-xa)*(la-ya)/(yb-ya)+xa)ins=!ins;}return ins;};
const bboxOf=R=>{let s=90,n=-90,w=180,e=-180;R.forEach(r=>r.forEach(([a,o])=>{s=Math.min(s,a);n=Math.max(n,a);w=Math.min(w,o);e=Math.max(e,o);}));return {s,n,w,e};};
function ring(x,P,r){x.beginPath();r.forEach((q,i)=>{const [px,py]=P(q[0],q[1]);i?x.lineTo(px,py):x.moveTo(px,py);});}
function gpx(nom,pts){const g=`<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="BasatiNA" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>${esc(nom)}</name><trkseg>${pts.map(p=>`<trkpt lat="${p[0]}" lon="${p[1]}"/>`).join('')}</trkseg></trk></gpx>`;
  const f=nom.replace(/[^\w\-]+/g,'_')+'.gpx';if(APP&&window.AndroidNet.shareFile){window.AndroidNet.shareFile(f,btoa(unescape(encodeURIComponent(g))),'application/gpx+xml');return;}
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([g],{type:'application/gpx+xml'}));a.download=f;a.click();}
function perfil(alt){if(!alt||alt.length<3)return '';const mn=Math.min(...alt),mx=Math.max(...alt),W=300,H=70,X=i=>i*W/(alt.length-1),Y=a=>H-(a-mn)/(mx-mn||1)*(H-8)-2;
  return `<svg viewBox="0 0 ${W} ${H+12}" style="width:100%;height:80px;display:block;margin-top:6px"><path d="M0 ${H} ${alt.map((a,i)=>'L'+X(i).toFixed(1)+' '+Y(a).toFixed(1)).join(' ')} L${W} ${H}Z" fill="#8d6e63" fill-opacity=".25" stroke="#6d4c41" stroke-width="1.5"/>
   <text x="2" y="${H+11}" font-size="10" fill="currentColor" opacity=".7">${mn} m</text><text x="${W}" y="10" font-size="10" text-anchor="end" fill="currentColor" opacity=".7">${mx} m</text></svg>`;}
const cargando='<div class="card"><div class="note">Cargando…</div></div>';
const falta=t=>`<div class="card"><div class="note">⏳ ${t} llega${/s$/.test(t)?'n':''} con la próxima actualización de datos (se prepara sola en unas horas).</div></div>`;

/* ---------- 🎬 CARTELERA ---------- */
const CINES0=[['Golem Baiona','Pamplona','https://www.golem.es/golem/golem-baiona'],['Golem Yamaguchi','Pamplona','https://www.golem.es/golem/golem-yamaguchi'],['Golem La Morea','Cordovilla','https://www.golem.es/golem/golem-la-morea'],
 ['Yelmo Itaroa','Huarte','https://www.yelmocines.es/'],['Ocine Tudela','Tudela','https://www.ocine.es/'],['Cines Los Llanos','Estella','https://www.cineslosllanos.com/'],['Cine Las Cañas','Viana','https://www.ecartelera.com/cines/0,34,0.html']];
svSec('cines',`<div class="card"><b>🎬 Cartelera de cine en Navarra</b><div class="note">Películas y sesiones de hoy en los cines de Navarra. Toca una sesión para comprar la entrada en la web del cine.</div><div class="seg amSeg" id="ciD"><button class="btn on" data-d="0">Hoy</button><button class="btn" data-d="1">Mañana</button></div><div class="seg amSeg" id="ciC"></div>
 <input id="ciQ" class="town" placeholder="🔎 Buscar película…" style="width:100%;box-sizing:border-box;margin-top:6px"></div><div id="ciL">${cargando}</div>
 <div class="note" style="margin:0 6px 12px">Cartelera: información pública de los cines recogida por eCartelera. Puede haber cambios de última hora: confirma en la web del cine.</div>`);
nuevo('cines','Qué hacer','🎬 Cartelera de cine','fiesta','i-cine','r');
let CIC='',CID=0;
function ciRender(){const O=window.OCIO,el=$('ciL');
  if(!O||!O.cines||!O.cines.length){$('ciC').innerHTML='';el.innerHTML=falta('La cartelera')+`<div class="card"><b>Cines de Navarra</b>${CINES0.map(c=>`<div class="st"><div><b>${c[0]}</b><div class="s">${c[1]}</div></div><a href="${c[2]}" target="_blank">Cartelera ›</a></div>`).join('')}</div>`;return;}
  $('ciC').innerHTML=[['','Todos'],...O.cines.map(c=>[c.id,c.n.replace(/^Cines?\s+/i,'')])].map(c=>`<button class="btn${c[0]===CIC?' on':''}" data-c="${c[0]}">${esc(c[1])}</button>`).join('');
  $('ciC').querySelectorAll('button').forEach(b=>b.onclick=()=>{CIC=b.dataset.c;ciRender();});
  const q=N($('ciQ').value),SK=CID?'s1':'s';
  el.innerHTML=O.cines.filter(c=>!CIC||c.id===CIC).map(c=>{const P=c.p.filter(p=>(!q||N(p.t).includes(q))&&(p[SK]||[]).length);
    if(!c.p.length&&!q)return `<div class="card"><div class="row" style="justify-content:space-between;align-items:center"><b>🎬 ${esc(c.n)}</b><a href="${esc(c.u)}" target="_blank" class="note">ver cartelera ›</a></div><div class="note">Este cine no publica aquí sus sesiones: mira su cartelera en la web.${c.tel?' ☎️ <a href="tel:'+esc(c.tel.replace(/\s/g,''))+'">'+esc(c.tel)+'</a>':''}</div></div>`;
    if(!P.length)return '';
    return `<div class="card"><div class="row" style="justify-content:space-between;align-items:center"><b style="font-size:16px">🎬 ${esc(c.n)}</b><a href="${esc(c.u)}" target="_blank" class="note">web ›</a></div>${c.d?`<div class="note">📍 ${esc(c.d)}${c.tel?' · ☎️ <a href="tel:'+esc(c.tel.replace(/\s/g,''))+'">'+esc(c.tel)+'</a>':''}</div>`:''}
     ${P.map(p=>`<div class="amRow" style="align-items:flex-start"><div style="flex:1;min-width:0"><b>${esc(p.t)}</b>
       <div class="note">${[p.min?p.min+' min':'',p.g,p.e].filter(Boolean).map(esc).join(' · ')}</div>
       <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:4px">${(p[SK]||[]).map(s=>`<a href="${esc(c.u)}" target="_blank" class="amPill" style="background:#ad1457;color:#fff;text-decoration:none;font-size:13px;padding:3px 10px">${esc(s)}</a>`).join('')}</div></div></div>`).join('')}</div>`;}).join('')||'<div class="card"><div class="note">No hay sesiones ese día (o ninguna película con ese nombre).</div></div>';
  el.insertAdjacentHTML('beforeend',`<div class="note" style="margin:0 6px">Actualizada: ${esc(O.t||'')}</div>`);}
$('ciQ').oninput=ciRender;$('ciD').querySelectorAll('button').forEach(b=>b.onclick=()=>{CID=+b.dataset.d;$('ciD').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));ciRender();});
svHook('cines',()=>svLoad('ocio.js','OCIO',ciRender));

/* ---------- 🏍️ NA EN MOTO ---------- */
svSec('moto',`<div class="card"><b>🏍️ NA en Moto</b><div class="note">Rutas por las carreteras más bonitas de Navarra: puertos, valles y foces. Con el recorrido, los kilómetros, el tiempo, el desnivel y el GPX para tu navegador.</div></div>
 <div id="moF"></div><div id="moL">${cargando}</div>
 <div class="card" style="border-color:#ffb020"><div class="note">⚠️ Conduce con prudencia: curvas, ganado suelto, gravilla y ciclistas. En invierno los puertos pueden tener nieve o hielo: mira antes <b>🌨️ El tiempo en las carreteras</b> y las incidencias (948 423 500).</div></div>`);
nuevo('moto','Qué hacer','🏍️ NA en Moto','carretera','i-moto','r');
let MOSEL=null,MOM=null;
function moRender(){const O=window.OCIO,el=$('moL');if(!O||!O.moto||!O.moto.length){el.innerHTML=falta('Las rutas en moto');$('moF').innerHTML='';return;}
  if(MOSEL){const r=O.moto.find(x=>x.id===MOSEL);if(r)return moFicha(r);}
  $('moF').innerHTML='';
  el.innerHTML=O.moto.map(r=>`<div class="card" data-id="${r.id}" style="cursor:pointer"><div class="row" style="justify-content:space-between;align-items:center"><b style="font-size:16px">🏍️ ${esc(r.n)}</b><span class="amPill" style="background:#d35400">${esc(r.zona)}</span></div>
    <div class="kpi" style="margin-top:6px"><div><span class="note">Distancia</span><b>${fmtN(r.km,0)} km</b></div><div><span class="note">Tiempo</span><b>${Math.floor(r.min/60)} h ${String(r.min%60).padStart(2,'0')}</b></div>${r.mx!=null?`<div><span class="note">Punto más alto</span><b>${r.mx} m</b></div>`:''}</div>
    <div class="note" style="margin-top:4px">${esc(r.via.join(' → '))}</div></div>`).join('');
  el.querySelectorAll('[data-id]').forEach(c=>c.onclick=()=>{MOSEL=c.dataset.id;moRender();window.scrollTo(0,0);});}
function moFicha(r){$('moF').innerHTML=`<div class="card"><div class="row" style="justify-content:space-between;align-items:center"><b style="font-size:17px">🏍️ ${esc(r.n)}</b><button class="btn" id="moX">✕</button></div>
   <div class="kpi" style="margin-top:6px"><div><span class="note">Distancia</span><b>${fmtN(r.km,1)} km</b></div><div><span class="note">Tiempo (sin paradas)</span><b>${Math.floor(r.min/60)} h ${String(r.min%60).padStart(2,'0')}</b></div>
   ${r.up!=null?`<div><span class="note">Subida acumulada</span><b>${fmtN(r.up,0)} m</b></div>`:''}${r.mx!=null?`<div><span class="note">Altitud</span><b>${r.mn}–${r.mx} m</b></div>`:''}</div>
   <canvas id="moMap" class="amMap" style="margin-top:8px"></canvas>${perfil(r.alt)}<div style="margin-top:6px">${esc(r.txt)}</div>
   <div class="note" style="margin-top:6px">📍 ${esc(r.via.join(' → '))}</div>
   <div class="row" style="flex-wrap:wrap"><button class="btn pri" id="moGo">🧭 Abrir en el navegador</button><button class="btn" id="moGpx">⬇️ GPX</button><button class="btn" id="moWx">🌦️ Tiempo en la ruta</button></div><div id="moW"></div></div>`;
  $('moL').innerHTML='';$('moX').onclick=()=>{MOSEL=null;MOM=null;moRender();};
  MOM=NavMap('moMap',(x,P)=>{x.lineCap='round';x.lineJoin='round';ring(x,P,r.line);x.strokeStyle='#fff';x.lineWidth=7;x.stroke();ring(x,P,r.line);x.strokeStyle='#d35400';x.lineWidth=4;x.stroke();
    (r.wp||[]).forEach((p,i)=>{const [px,py]=P(p[0],p[1]);x.beginPath();x.arc(px,py,6,0,7);x.fillStyle=i===0?'#2e7d32':i===r.wp.length-1?'#c62828':'#fff';x.fill();x.strokeStyle='#000';x.lineWidth=1.5;x.stroke();});},()=>{});
  const b=bboxOf([r.line]);setTimeout(()=>MOM.fit(b.s,b.n,b.w,b.e),30);
  $('moGo').onclick=()=>{const w=r.wp||[];if(w.length<2)return;const o=w[0],d=w[w.length-1],v=w.slice(1,-1).map(p=>p.join(',')).join('|');abre(`https://www.google.com/maps/dir/?api=1&origin=${o.join(',')}&destination=${d.join(',')}&travelmode=driving${v?'&waypoints='+encodeURIComponent(v):''}`);};
  $('moGpx').onclick=()=>gpx('BasatiNA moto - '+r.n,r.line);
  $('moWx').onclick=async()=>{const w=r.wp||[];$('moW').innerHTML='<div class="note">Cargando…</div>';
    const j=await getJSON(`${OM}?latitude=${w.map(p=>p[0]).join(',')}&longitude=${w.map(p=>p[1]).join(',')}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_gusts_10m_max&forecast_days=3${TZ}`);
    const A=Array.isArray(j)?j:j?[j]:[];if(!A.length){$('moW').innerHTML='<div class="note">No se pudo cargar.</div>';return;}
    $('moW').innerHTML=`<table class="ph" style="margin-top:8px;font-size:13px"><tr><td></td>${A[0].daily.time.map((d,i)=>`<td><b>${i?new Date(d+'T12:00').toLocaleDateString(LOC,{weekday:'short'}):'Hoy'}</b></td>`).join('')}</tr>${A.map((a,k)=>`<tr><td>${esc(r.via[k]||'')}</td>${a.daily.time.map((d,i)=>`<td>${wxIcon(a.daily.weather_code[i],12)} ${Math.round(a.daily.temperature_2m_min[i])}/${Math.round(a.daily.temperature_2m_max[i])}°${a.daily.precipitation_probability_max[i]>=40?' ☔'+a.daily.precipitation_probability_max[i]+'%':''}${a.daily.wind_gusts_10m_max[i]>=60?' 💨':''}</td>`).join('')}</tr>`).join('')}</table>`;};}
svHook('moto',()=>svLoad('ocio.js','OCIO',moRender));

/* ---------- 🚴 NA PEDALEA ---------- */
svSec('pedalea',`<div class="card"><b>🚴 NA Pedalea</b><div class="note">Rutas en bici por Navarra: BTT señalizadas, carretera, gravel, vías verdes y EuroVelo.</div>
 <div class="seg amSeg" id="peT"><button class="btn on" data-v="">Todas</button><button class="btn" data-v="btt">🚵 BTT</button><button class="btn" data-v="carretera">🚴 Carretera</button><button class="btn" data-v="gravel">🪨 Gravel</button><button class="btn" data-v="vv">🛤️ Vías verdes</button></div>
 <div class="seg amSeg" id="peD"><button class="btn on" data-v="">Cualquier dificultad</button><button class="btn" data-v="f">Fácil</button><button class="btn" data-v="m">Media</button><button class="btn" data-v="d">Difícil</button></div>
 <input id="peQ" class="town" placeholder="🔎 Buscar ruta o pueblo…" style="width:100%;box-sizing:border-box;margin-top:6px"></div>
 <div id="peF"></div><div id="peL">${cargando}</div>`);
nuevo('pedalea','Qué hacer','🚴 NA Pedalea','bosque','i-bici','g');
let PET='',PED='',PESEL=null,PEM=null;
const peDif=s=>{s=N(s);return /muy facil|facil|baja/.test(s)?'f':/media|moderad/.test(s)?'m':/dificil|alta|muy alta/.test(s)?'d':'';};
const lineKm=R=>R.reduce((t,r)=>t+r.slice(1).reduce((s,p,i)=>s+km(r[i][0],r[i][1],p[0],p[1]),0),0);
function peList(){const B=window.BICI,M=window.MONTE_GEO,L=[];if(!B)return L;
  ((B.idena||{}).btt||[]).forEach((x,i)=>L.push({id:'b'+i,t:'btt',n:x.a.N,p:x.a.D||'',km:parseFloat(x.a.BKM)||lineKm(x.r),des:parseFloat(x.a.BDES)||null,dif:x.a.BDIF||'',dur:x.a.BDUR||'',url:x.a.URL,gpx:x.a.DESCARGA,r:x.r}));
  (B.salidas||[]).forEach((x,i)=>L.push({id:'s'+i,t:x.tipo,n:x.n,p:x.ini,km:x.km,des:x.des,dif:x.dif,url:x.url,pt:x.pt}));
  ((B.idena||{}).ev||[]).forEach((x,i)=>L.push({id:'e'+i,t:'vv',n:x.a.N,p:x.a.D||'',km:lineKm(x.r),url:x.a.URL,gpx:x.a.DESCARGA,r:x.r,dif:'Fácil'}));
  if(M)Object.keys(M).filter(k=>/^DOTACI_Lin_VV/.test(k)).forEach(k=>(M[k].f||[]).forEach((x,i)=>{if(!L.find(y=>y.n===x.a.NOMBRE))L.push({id:k+i,t:'vv',n:x.a.NOMBRE,p:'',km:lineKm(x.r),url:x.a.URL1||x.a.URL,r:x.r,dif:'Fácil'});}));
  return L;}
function peRender(){const el=$('peL');if(!window.BICI){el.innerHTML=falta('Las rutas en bici');return;}
  const all=peList();if(PESEL){const r=all.find(x=>x.id===PESEL);if(r)return peFicha(r);}$('peF').innerHTML='';
  const q=N($('peQ').value),L=all.filter(r=>(!PET||r.t===PET)&&(!PED||peDif(r.dif)===PED)&&(!q||N(r.n+' '+r.p).includes(q)));
  const ic={btt:'🚵',carretera:'🚴',gravel:'🪨',vv:'🛤️'};
  el.innerHTML=`<div class="card"><b>${L.length} rutas</b>${L.map(r=>`<div class="st" data-id="${esc(r.id)}" style="cursor:pointer"><div><b>${ic[r.t]||'🚲'} ${esc(r.n)}</b><div class="s">${[r.p,r.km?fmtN(r.km,0)+' km':'',r.des?fmtN(r.des,0)+' m de desnivel':'',r.dif].filter(Boolean).map(esc).join(' · ')}</div></div><span>›</span></div>`).join('')}</div>`;
  el.querySelectorAll('[data-id]').forEach(d=>d.onclick=()=>{PESEL=d.dataset.id;peRender();window.scrollTo(0,0);});}
function peFicha(r){$('peL').innerHTML='';$('peF').innerHTML=`<div class="card"><div class="row" style="justify-content:space-between;align-items:center"><b style="font-size:16px">${esc(r.n)}</b><button class="btn" id="peX">✕</button></div>
  <div class="kpi" style="margin-top:6px">${r.km?`<div><span class="note">Distancia</span><b>${fmtN(r.km,1)} km</b></div>`:''}${r.des?`<div><span class="note">Desnivel</span><b>${fmtN(r.des,0)} m</b></div>`:''}${r.dif?`<div><span class="note">Dificultad</span><b>${esc(r.dif)}</b></div>`:''}${r.dur?`<div><span class="note">Tiempo</span><b>${esc(r.dur)} h</b></div>`:''}</div>
  ${r.p?`<div class="note">📍 ${esc(r.p)}</div>`:''}<canvas id="peMap" class="amMap" style="margin-top:8px"></canvas>
  <div class="row" style="flex-wrap:wrap">${urlOk(r.url)?'<button class="btn pri" id="peU">ℹ️ Ficha completa</button>':''}${urlOk(r.gpx)?'<button class="btn" id="peG">⬇️ GPX oficial</button>':r.r?'<button class="btn" id="peG2">⬇️ GPX</button>':''}${r.pt||r.r?'<button class="btn" id="peC">🧭 Cómo llegar a la salida</button>':''}</div></div>`;
  $('peX').onclick=()=>{PESEL=null;peRender();};
  const st=r.pt||(r.r&&r.r[0]&&r.r[0][0]);
  PEM=NavMap('peMap',(x,P)=>{if(r.r)r.r.forEach(rr=>{x.lineCap='round';ring(x,P,rr);x.strokeStyle='#fff';x.lineWidth=6;x.stroke();ring(x,P,rr);x.strokeStyle='#2e7d32';x.lineWidth=3.5;x.stroke();});
    if(st){const [px,py]=P(st[0],st[1]);x.beginPath();x.arc(px,py,7,0,7);x.fillStyle='#2e7d32';x.fill();x.strokeStyle='#fff';x.lineWidth=2;x.stroke();}},()=>{});
  setTimeout(()=>{if(r.r){const b=bboxOf(r.r);PEM.fit(b.s,b.n,b.w,b.e);}else if(st)PEM.fit(st[0]-.08,st[0]+.08,st[1]-.11,st[1]+.11);},30);
  if($('peU'))$('peU').onclick=()=>abre(r.url);if($('peG'))$('peG').onclick=()=>abre(r.gpx);if($('peG2'))$('peG2').onclick=()=>gpx(r.n,r.r.flat());
  if($('peC'))$('peC').onclick=()=>abre(`https://www.google.com/maps/dir/?api=1&destination=${st[0]},${st[1]}`);}
(function(){const seg=(id,set)=>$(id).querySelectorAll('button').forEach(b=>b.onclick=()=>{set(b.dataset.v);$(id).querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));PESEL=null;peRender();});
  seg('peT',v=>PET=v);seg('peD',v=>PED=v);$('peQ').oninput=()=>{PESEL=null;peRender();};})();
svHook('pedalea',()=>svLoad('bici.js','BICI',()=>svLoad('monte.js','MONTE_GEO',peRender)));

/* ---------- 🧺 NA DE PICNIC ---------- */
svSec('picnic',`<div class="card"><b>🧺 NA de Picnic</b><div class="note">Merenderos y áreas recreativas de Navarra para comer en el campo.</div>
 <div class="row" style="flex-wrap:wrap;gap:8px;margin-top:6px"><label class="note"><input type="checkbox" id="piB"> 🔥 Con barbacoa</label><label class="note"><input type="checkbox" id="piS"> 🌳 Con sombra</label></div>
 <div class="row"><input id="piQ" class="town" placeholder="🔎 Buscar pueblo o sitio…" style="flex:1;box-sizing:border-box"><button class="btn" id="piYo">📍 Cerca de mí</button></div></div>
 <div class="card" style="padding:6px"><canvas id="piMap" class="amMap"></canvas><div class="note" style="padding:4px 6px">🟢 área recreativa del Gobierno de Navarra · 🟠 merendero</div></div><div id="piF"></div><div id="piL">${cargando}</div>
 <div class="card" style="border-color:#ffb020"><div class="note">🔥 Antes de encender fuego mira si está permitido: en verano suele estar prohibido por riesgo de incendio. Llévate la basura y deja el sitio como lo encontraste.</div></div>`);
nuevo('picnic','Qué hacer','🧺 NA de Picnic','bosque','i-picnic','g');
let PIM=null,PISEL=null,PIYO=false;
function piList(){const M=window.MONTE_GEO,B=window.BICI,L=[];
  ((M&&M.FOREST_Sym_AreasRecForest&&M.FOREST_Sym_AreasRecForest.f)||[]).forEach(x=>L.push({k:'a',n:x.a.NOMBRE||'Área recreativa',pt:x.pt,barb:/s[ií]/i.test(x.a.BARBACOA||''),som:/sombra/i.test(x.a.VEGETACION||''),eq:x.a.EQUIPAMIEN||'',park:x.a.PARKING||'',veg:x.a.VEGETACION||'',pais:x.a.ELEPAISAJE||'',dem:x.a.DEMARCACIO||''}));
  ((B&&B.idena&&B.idena.serv)||[]).filter(x=>/merendero/i.test(x.a.N)).forEach(x=>{if(!L.some(y=>Math.abs(y.pt[0]-x.pt[0])<.0015&&Math.abs(y.pt[1]-x.pt[1])<.002))L.push({k:'m',n:'Merendero',pt:x.pt,p:x.a.D||''});});
  return L;}
let PIL=null;
function piRender(){if(!window.MONTE_GEO){$('piL').innerHTML=falta('Los merenderos');return;}if(!PIL)PIL=piList();
  const q=N($('piQ').value),b=$('piB').checked,s=$('piS').checked;let L=PIL.filter(x=>(!b||x.barb)&&(!s||x.som)&&(!q||N(x.n+' '+x.p+' '+x.dem).includes(q)));
  if(PIYO&&MYPOS)L=L.map(x=>Object.assign(x,{dk:km(MYPOS.la,MYPOS.lo,x.pt[0],x.pt[1])})).sort((a,c)=>a.dk-c.dk);
  if(!PIM){PIM=NavMap('piMap',(x,P)=>{(window.__piV||[]).forEach(p=>{const [px,py]=P(p.pt[0],p.pt[1]);x.beginPath();x.arc(px,py,PISEL===p?8:p.k==='a'?5:3.5,0,7);x.fillStyle=p.k==='a'?'#2e7d32':'#ef6c00';x.fill();x.strokeStyle='#fff';x.lineWidth=PISEL===p?3:1;x.stroke();});},
    (px,py,M)=>{let best=null,bd=18;(window.__piV||[]).forEach(p=>{const [x,y]=M.P(p.pt[0],p.pt[1]),d=Math.hypot(x-px,y-py);if(d<bd){bd=d;best=p;}});if(best){PISEL=best;M.draw();piFicha(best);}});setTimeout(()=>PIM.fit(41.9,43.3,-2.5,-0.7),30);}
  window.__piV=L;PIM.draw();
  $('piL').innerHTML=`<div class="card"><b>${L.length} sitios</b>${L.slice(0,120).map((p,i)=>`<div class="st" data-i="${i}" style="cursor:pointer"><div><b>${p.k==='a'?'🌳':'🧺'} ${esc(p.n)}</b><div class="s">${[p.p,p.dem,p.barb?'🔥 barbacoa':'',p.dk!=null?fmtN(p.dk,1)+' km':''].filter(Boolean).map(esc).join(' · ')}</div></div><span>›</span></div>`).join('')}${L.length>120?'<div class="note">Busca un pueblo o usa «Cerca de mí» para ver más.</div>':''}</div>`;
  $('piL').querySelectorAll('[data-i]').forEach(d=>d.onclick=()=>{const p=L[+d.dataset.i];PISEL=p;PIM.fit(p.pt[0]-.02,p.pt[0]+.02,p.pt[1]-.03,p.pt[1]+.03);piFicha(p);});}
function piFicha(p){$('piF').innerHTML=`<div class="card" style="border-color:${p.k==='a'?'#2e7d32':'#ef6c00'}"><div class="row" style="justify-content:space-between;align-items:center"><b style="font-size:16px">${p.k==='a'?'🌳':'🧺'} ${esc(p.n)}</b><button class="btn" id="piX">✕</button></div>
  ${p.p?`<div class="note">📍 ${esc(p.p)}</div>`:''}${p.barb?'<div class="st"><b>🔥 Barbacoa</b><span>Sí</span></div>':''}${p.veg?`<div class="st"><b>🌳 Vegetación</b><span style="text-align:right">${esc(p.veg)}</span></div>`:''}
  ${p.eq?`<div class="st"><b>🪑 Equipamiento</b><span style="text-align:right">${esc(p.eq)}</span></div>`:''}${p.park?`<div class="st"><b>🅿️ Aparcamiento</b><span style="text-align:right">${esc(p.park)}</span></div>`:''}${p.pais?`<div class="st"><b>🏞️ Paisaje</b><span>${esc(p.pais)}</span></div>`:''}
  <div class="row"><button class="btn pri" id="piGo">🧭 Cómo llegar</button><button class="btn" id="piWx">🌦️ ¿Qué tiempo hará?</button></div><div id="piW"></div></div>`;
  $('piX').onclick=()=>{$('piF').innerHTML='';PISEL=null;PIM.draw();};$('piGo').onclick=()=>abre(`https://www.google.com/maps/dir/?api=1&destination=${p.pt[0]},${p.pt[1]}`);
  $('piWx').onclick=async()=>{const j=await getJSON(`${OM}?latitude=${p.pt[0]}&longitude=${p.pt[1]}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=4${TZ}`);if(!j||!j.daily)return;
    $('piW').innerHTML='<div class="row" style="margin-top:6px">'+j.daily.time.map((d,i)=>`<div style="flex:1;text-align:center"><div class="note">${i?new Date(d+'T12:00').toLocaleDateString(LOC,{weekday:'short'}):'Hoy'}</div><div style="font-size:24px">${wxIcon(j.daily.weather_code[i],12)}</div><b>${Math.round(j.daily.temperature_2m_max[i])}°</b><div class="note">☔ ${j.daily.precipitation_probability_max[i]}%</div></div>`).join('')+'</div>';};
  $('piF').scrollIntoView({behavior:'smooth',block:'nearest'});}
(function(){['piB','piS'].forEach(i=>$(i).onchange=piRender);$('piQ').oninput=piRender;
  $('piYo').onclick=async()=>{try{await myPos();PIYO=true;piRender();PIM.fit(MYPOS.la-.12,MYPOS.la+.12,MYPOS.lo-.16,MYPOS.lo+.16);}catch(e){toast(e.message);}};})();
svHook('picnic',()=>svLoad('monte.js','MONTE_GEO',()=>svLoad('bici.js','BICI',piRender)));

/* ---------- 🗺️ LOCALIDADES: comarcas, merindades y valles ---------- */
const POI=[['cueva','🕳️','Cuevas','#5d4037'],['fuente','⛲','Fuentes','#0288d1'],['ruta','🥾','Rutas (salida)','#2e7d32'],['albergue','🎒','Albergues y campings','#00897b'],
  ['hotel','🏨','Hoteles y pensiones','#3949ab'],['rural','🏡','Casas rurales y apartamentos','#7cb342'],['bar','🍺','Bares y cafés','#ef6c00'],['rest','🍽️','Restaurantes','#e53935'],
  ['tienda','🛒','Tiendas','#8e24aa'],['monu','🏛️','Monumentos y patrimonio','#6d4c41'],['mira','👀','Miradores y turismo','#f9a825'],['rio','🌊','Ríos','#1e88e5']];
let CO=lsGet('amCoOn',null)||{cueva:1,fuente:1,ruta:1,albergue:1,hotel:1,rural:1,bar:0,rest:1,tienda:0,monu:1,mira:1,rio:1};
let COG=null,COZ=null,COM=null,COMAP=null,COPTS=[];
(function(){const sec=$('t-pueblos'),lv=$('pbListV');if(!sec||!lv)return;
  sec.insertAdjacentHTML('afterbegin',`<div class="seg amSeg" id="pbTabs"><button class="btn on" data-v="l">🔤 Localidades</button><button class="btn" data-v="c">🗺️ Comarcas y valles</button></div><div id="pbComV" style="display:none"></div>`);
  sec.querySelectorAll('#pbTabs button').forEach(b=>b.onclick=()=>{const c=b.dataset.v==='c';sec.querySelectorAll('#pbTabs button').forEach(x=>x.classList.toggle('on',x===b));
    [...sec.children].forEach(x=>{if(x.id==='pbTabs'||x.id==='pbComV'||/^pv/.test(x.id))return;if(c){x.dataset.amD=x.style.display;x.style.display='none';}else if(x.dataset.amD!==undefined){x.style.display=x.dataset.amD;delete x.dataset.amD;}});
    $('pbComV').style.display=c?'':'none';if(c)coInit();});})();
nuevo('comarcas','Localidades','🗺️ Comarcas, valles y merindades','pueblo','i-mapa','g');
(function(){const b=document.querySelector('#drawer button[data-t="comarcas"]'),p=document.querySelector('#drawer button[data-t="pueblos"]');if(b&&p)p.after(b);})();
(function(){const b=document.querySelector('#drawer button[data-t="comarcas"]');if(b)b.onclick=()=>{showTab('pueblos');menu(false);setTimeout(()=>{const t=document.querySelector('#pbTabs button[data-v="c"]');if(t)t.click();},60);};})();
function coInit(){const V=$('pbComV');V.innerHTML=cargando;window.amTerri(()=>{const T=window.TERRI;if(!T){V.innerHTML=falta('Los datos de comarcas');return;}
  const G=T.grupos||{},K=Object.keys(G);if(!K.length){V.innerHTML=falta('Los datos de comarcas');return;}if(!COG||!G[COG])COG=K.includes('comarca')?'comarca':K[0];coRender();});}
const sumH=ms=>ms.reduce((s,c)=>s+(+((window.TERRI.mun[c]||{}).hab)||0),0);
function coRender(){const T=window.TERRI,G=T.grupos,V=$('pbComV');const g=G[COG];
  if(COZ!=null){const z=g.z[COZ];if(z)return coZona(z);}
  V.innerHTML=`<div class="card"><b>🗺️ Navarra por zonas</b><div class="note">Elige cómo agrupar los municipios y toca una zona para ver sus pueblos, sus datos y su mapa.</div>
    <div class="seg amSeg" id="coG">${Object.entries(G).map(([k,x])=>`<button class="btn${k===COG?' on':''}" data-g="${k}">${esc(x.t.replace(/^Zonificaciones tradicionales\.?\s*/i,'').replace(/^Zonificaci[oó]n\s*/i,''))}</button>`).join('')}</div></div>
    <div class="card" style="padding:6px"><canvas id="coMapA" class="amMap" style="height:320px"></canvas><div id="coSelI" class="note" style="padding:6px 4px 2px">Toca una zona del mapa para ver su nombre.</div></div>
    <div class="card"><b>${g.z.length} zonas</b>${g.z.map((z,i)=>`<div class="st" data-z="${i}" style="cursor:pointer"><div><b>${esc(z.n)}</b><div class="s">${z.m.length} municipios · ${sumH(z.m).toLocaleString(LOC)} habitantes</div></div><span>›</span></div>`).join('')}</div>`;
  V.querySelectorAll('#coG button').forEach(b=>b.onclick=()=>{COG=b.dataset.g;COZ=null;coRender();});
  V.querySelectorAll('[data-z]').forEach(d=>d.onclick=()=>{COZ=+d.dataset.z;coRender();window.scrollTo(0,0);});
  const pal=['#4caf50','#2196f3','#ff9800','#9c27b0','#e91e63','#009688','#795548','#3f51b5','#cddc39','#ff5722','#607d8b','#00bcd4'];
  /* 28 nov. 2026 (Pedro): sin nombres encima del mapa (con tantos valles no se leía nada). Al tocar una zona se marca,
     sale su nombre en el mapa y debajo, con el botón para entrar en ella. */
  let SEL=-1;
  const M=NavMap('coMapA',(x,P)=>{g.z.forEach((z,i)=>{z.r.forEach(r=>{ring(x,P,r);x.closePath();x.fillStyle=pal[i%pal.length]+(i===SEL?'bb':'55');x.fill();x.strokeStyle=i===SEL?'#10202a':pal[i%pal.length];x.lineWidth=i===SEL?3:1.5;x.stroke();});});
    if(SEL>=0){const z=g.z[SEL],b=bboxOf(z.r),[px,py]=P((b.s+b.n)/2,(b.w+b.e)/2);x.font='bold 13px system-ui';x.textAlign='center';x.fillStyle='#10202a';x.strokeStyle='#fff';x.lineWidth=4;x.strokeText(z.n,px,py);x.fillText(z.n,px,py);}},
    (px,py,M)=>{const b=M.box(),la=b.n-(b.n-b.s)*py/b.H,lo=b.w+(b.e-b.w)*px/b.W,i=g.z.findIndex(z=>pip(la,lo,z.r));if(i<0)return;SEL=i;M.draw();
      const z=g.z[i],el=$('coSelI');if(el){el.innerHTML=`<div class="st" style="cursor:pointer"><div><b>${esc(z.n)}</b><div class="s">${z.m.length} municipios · ${sumH(z.m).toLocaleString(LOC)} habitantes</div></div><span>Ver zona ›</span></div>`;
        el.firstChild.onclick=()=>{const bx=$('mfBox');if(bx){const c=bx.querySelector('.mfCab button');if(c)c.click();}COZ=i;coRender();window.scrollTo(0,0);};}});
  setTimeout(()=>M.fit(41.9,43.3,-2.5,-0.7),30);}
function coPois(z,cb){const b=bboxOf(z.r),inz=(la,lo)=>la>=b.s&&la<=b.n&&lo>=b.w&&lo<=b.e&&pip(la,lo,z.r),L=[];
  svLoad('monte.js','MONTE_GEO',()=>svLoad('abiertos.js','ABIERTOS',()=>svLoad('tiendas.js','TIENDAS',()=>svLoad('rutas.js','RUTAS',()=>svLoad('rios.js','RIOS_GEO',()=>{
    const M=window.MONTE_GEO||{},A=window.ABIERTOS||{},Ti=window.TIENDAS||{},R=window.RUTAS||{},T=window.TERRI||{};
    ((M.GEOLOG_Sym_Cuevas||{}).f||[]).forEach(x=>{if(inz(...x.pt))L.push(['cueva',x.a.CUEVA||x.a.TOPONIMIA||'Cueva',x.pt,x.a.TIPO||'']);});
    ((M.IDEMUN_Sym_Fuentes||{}).f||[]).forEach(x=>{if(inz(...x.pt))L.push(['fuente',x.a.FUENTE||'Fuente',x.pt,x.a.POTABLE==='Sí'?'agua potable':'']);});
    ((M.DOTACI_Sym_Miradores||{}).f||[]).forEach(x=>{if(inz(...x.pt))L.push(['mira',x.a.RECTUR||'Mirador',x.pt,x.a.POBLACION||'']);});
    ((M.PATRIM_Sym_BICarquite||{}).f||[]).forEach(x=>{if(inz(...x.pt))L.push(['monu',x.a.BIC,x.pt,(x.a.TIPO||'')+' · '+(x.a.POBLACION||'')]);});
    (A.arte||[]).forEach(x=>{if(inz(x[5],x[6]))L.push(['monu',x[0],[x[5],x[6]],x[1]+' · '+x[3]]);});
    (A.aloj||[]).forEach(x=>{if(x[7]==null||!inz(x[7],x[8]))return;const k=/albergue|camping/.test(x[0])?'albergue':/hotel/.test(x[0])?'hotel':'rural';L.push([k,x[1],[x[7],x[8]],[x[2],x[4]].filter(Boolean).join(' · ')]);});
    (A.rest||[]).forEach(x=>{if(x[6]!=null&&inz(x[6],x[7]))L.push(['rest',x[0],[x[6],x[7]],[x[2],x[4]].filter(Boolean).join(' · ')]);});
    (T.bares||[]).forEach(x=>{if(!inz(x[2],x[3]))return;if(x[1]==='r'){if(!L.some(y=>y[0]==='rest'&&Math.abs(y[2][0]-x[2])<.0007&&Math.abs(y[2][1]-x[3])<.0009))L.push(['rest',x[0],[x[2],x[3]],'restaurante']);}else L.push(['bar',x[0]||'Bar',[x[2],x[3]],x[1]==='c'?'cafetería':'bar']);});
    (Ti.super||[]).forEach(x=>{if(inz(x[2],x[3]))L.push(['tienda',x[1]||x[0],[x[2],x[3]],x[4]||'']);});
    (R.rutas||[]).forEach(x=>{const p=x.lin&&x.lin[0];if(p&&inz(p[0],p[1]))L.push(['ruta',x.n,p,(x.km?fmtN(x.km,1)+' km':'')+(x.up?' · +'+x.up+' m':'')]);});
    cb(L);})))));}
function coZona(z){const T=window.TERRI,V=$('pbComV'),b=bboxOf(z.r),hab=sumH(z.m),km2=z.m.reduce((s,c)=>s+((T.mun[c]||{}).km2||0),0);
  V.innerHTML=`<div class="card"><div class="row" style="justify-content:space-between;align-items:center"><b style="font-size:17px">🗺️ ${esc(z.n)}</b><button class="btn" id="coX">← Zonas</button></div>
   <div class="kpi" style="margin-top:6px"><div><span class="note">Municipios</span><b>${z.m.length}</b></div><div><span class="note">Habitantes</span><b>${hab.toLocaleString(LOC)}</b></div><div><span class="note">Superficie</span><b>${fmtN(km2,0)} km²</b></div></div></div>
   <div class="card" style="padding:6px"><canvas id="coMap" class="amMap" style="height:380px"></canvas><div id="coLay" style="padding:6px;display:flex;flex-wrap:wrap;gap:4px 10px"></div><div id="coPI" class="note" style="padding:0 6px 6px"></div></div>
   <div class="card"><b>🏘️ Municipios</b><input id="coQ" class="town" placeholder="🔎 Buscar municipio…" style="width:100%;box-sizing:border-box;margin:6px 0"><div id="coML"></div></div>`;
  $('coX').onclick=()=>{COZ=null;coRender();};
  $('coLay').innerHTML=POI.map(([k,ic,n,c])=>`<label class="note" style="display:inline-flex;align-items:center;gap:4px"><input type="checkbox" data-k="${k}" ${CO[k]?'checked':''}><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${c}"></span>${ic} ${n}</label>`).join('');
  $('coLay').querySelectorAll('input').forEach(i=>i.onchange=()=>{CO[i.dataset.k]=i.checked?1:0;lsSet('amCoOn',CO);COMAP&&COMAP.draw();});
  COPTS=[];let sel=null;
  COMAP=NavMap('coMap',(x,P,bb,M)=>{z.r.forEach(r=>{ring(x,P,r);x.closePath();x.fillStyle='rgba(255,255,255,.18)';x.fill();x.strokeStyle='#c62828';x.lineWidth=2.5;x.setLineDash([7,4]);x.stroke();x.setLineDash([]);});
    if(CO.rio&&window.RIOS_GEO){x.strokeStyle='#1e88e5';x.lineWidth=1.8;(RIOS_GEO.w||[]).forEach(w=>{if(!w.p.some(p=>p[0]>=b.s&&p[0]<=b.n&&p[1]>=b.w&&p[1]<=b.e))return;x.beginPath();w.p.forEach((q,i)=>{const [px,py]=P(q[0],q[1]);i?x.lineTo(px,py):x.moveTo(px,py);});x.stroke();});}
    z.m.forEach(c=>{const m=T.mun[c];if(m&&m.r)m.r.forEach(r=>{ring(x,P,r);x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=.8;x.stroke();});});
    const r=Math.max(3,Math.min(7,2+M.z*.35));COPTS.forEach(p=>{if(!CO[p[0]])return;const [px,py]=P(p[2][0],p[2][1]),c=POI.find(q=>q[0]===p[0])[3];x.beginPath();x.arc(px,py,sel===p?r+3:r,0,7);x.fillStyle=c;x.fill();x.strokeStyle='#fff';x.lineWidth=sel===p?2.5:1;x.stroke();});
    if(M.z>4)z.m.forEach(c=>{const m=T.mun[c];if(!m)return;const [px,py]=P(m.pt[0],m.pt[1]);x.font='bold 10.5px system-ui';x.textAlign='center';x.fillStyle='#10202a';x.strokeStyle='#fff';x.lineWidth=3;x.strokeText(m.n,px,py);x.fillText(m.n,px,py);});},
    (px,py,M)=>{let best=null,bd=18;COPTS.forEach(p=>{if(!CO[p[0]])return;const [x,y]=M.P(p[2][0],p[2][1]),d=Math.hypot(x-px,y-py);if(d<bd){bd=d;best=p;}});sel=best;M.draw();
      $('coPI').innerHTML=best?`${POI.find(q=>q[0]===best[0])[1]} <b>${esc(best[1])}</b>${best[3]?' · '+esc(best[3]):''} · <a href="#" id="coGo">cómo llegar</a>`:'';if(best)$('coGo').onclick=e=>{e.preventDefault();abre(`https://www.google.com/maps/dir/?api=1&destination=${best[2][0]},${best[2][1]}`);};});
  setTimeout(()=>COMAP.fit(b.s,b.n,b.w,b.e),30);
  $('coPI').textContent='Cargando puntos de interés…';coPois(z,L=>{COPTS=L;COMAP.draw();const C={};L.forEach(p=>C[p[0]]=(C[p[0]]||0)+1);$('coPI').textContent=Object.keys(C).length?POI.filter(q=>C[q[0]]).map(q=>q[1]+' '+C[q[0]]).join(' · ')+' · toca un punto':'';});
  const mlist=()=>{const q=N($('coQ').value);$('coML').innerHTML=z.m.map(c=>[c,T.mun[c]]).filter(([c,m])=>m&&(!q||N(m.n).includes(q))).map(([c,m])=>`<details class="amMun" style="border-top:1px solid var(--line);padding:6px 0"><summary style="cursor:pointer"><b>${esc(m.n)}</b> <span class="note">· ${m.hab!=null?(+m.hab).toLocaleString(LOC)+' hab.':''}</span></summary>
     <div class="st"><b>👥 Habitantes</b><span>${m.hab!=null?(+m.hab).toLocaleString(LOC):'—'}</span></div><div class="st"><b>📐 Superficie</b><span>${fmtN(m.km2,1)} km²</span></div>
     <div class="st"><b>⚖️ Partido judicial</b><span>${esc(m.pj||'—')}</span></div>
     <div class="st"><b>📜 Registro de la Propiedad</b><a href="#" data-u="https://www.registradores.org/">consultar cuál te toca ›</a></div>
     ${m.tel?`<div class="st"><b>☎️ Ayuntamiento</b><a href="tel:${esc(String(m.tel).replace(/\s/g,''))}">${esc(m.tel)}</a></div>`:''}
     ${m.mail?`<div class="st"><b>✉️ Correo</b><a href="mailto:${esc(m.mail)}">${esc(m.mail)}</a></div>`:''}
     ${urlOk(m.web)?`<div class="st"><b>🌐 Web</b><a href="#" data-u="${esc(m.web)}">${esc(m.web.replace(/^https?:\/\/(www\.)?/,'').replace(/\/$/,''))}</a></div>`:''}
     <div class="row"><button class="btn" data-mz="${c}">🗺️ Ver en el mapa</button><button class="btn" data-pb="${esc(m.n)}">🏘️ Sus localidades</button></div></details>`).join('')||'<div class="note">Ninguno.</div>';
    $('coML').querySelectorAll('[data-u]').forEach(a=>a.onclick=e=>{e.preventDefault();abre(a.dataset.u);});
    $('coML').querySelectorAll('[data-mz]').forEach(b=>b.onclick=()=>{const m=T.mun[b.dataset.mz];const bb=m.r&&m.r.length?bboxOf(m.r):{s:m.pt[0]-.03,n:m.pt[0]+.03,w:m.pt[1]-.04,e:m.pt[1]+.04};COMAP.fit(bb.s,bb.n,bb.w,bb.e);$('coMap').scrollIntoView({behavior:'smooth',block:'center'});});
    $('coML').querySelectorAll('[data-pb]').forEach(b=>b.onclick=()=>{document.querySelector('#pbTabs button[data-v="l"]').click();const q=$('pbQ');if(q){q.value=b.dataset.pb.split('/')[0].trim();q.dispatchEvent(new Event('input'));}});};
  $('coQ').oninput=mlist;mlist();}

try{if(typeof applyIcons==='function')applyIcons((CFG.iconos||'pro')==='pro');}catch(e){}
})();
