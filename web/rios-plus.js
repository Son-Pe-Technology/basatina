/* =====================================================================
   🌊 RÍOS · mejoras del 15 nov. 2026
   - Embalses: caudal que sale de cada presa (si el SAIH no lo da en el embalse, se lee la estación de justo debajo).
   - Previsión de los próximos 3 días para TODOS los ríos: mapa de cada río con sus estaciones en verde, amarillo o rojo
     según la previsión de cada día, y la barra del caudal de ahora. Se quita «¿Y si lloviera más?». Gráficas con fondo claro.
   - Datos históricos de todos los ríos (Arga, Irati, Ega, Aragón y Ebro) con sus crecidas y la leyenda de avisos.
   Previsión de caudal: Open‑Meteo Flood API (modelo europeo GloFAS, Copernicus). Caudal de ahora: SAIH Ebro.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
// -------------------------------------------------- 1. embalses: caudal de salida
const EM_DOWN=[[/EUG[UI]I?/i,['A152']],[/ITOIZ/i,[/IRATI.*(ITOIZ|AOIZ|A\.?\s*ABAJO)/i]],[/YESA/i,[/ARAG[OÓ]N.*YESA/i,/ARAG[OÓ]N.*(SANG[UÜ]ESA|A\.?\s*ABAJO)/i]],
  [/ALLOZ/i,[/SALADO.*(ALLOZ|MA[ÑN]ERU|A\.?\s*ABAJO)/i]],[/IRABIA/i,[/IRATI.*(IRABIA|ORBAITZETA|A\.?\s*ABAJO)/i]],[/MAIDEVERA/i,[/MAIDEVERA|ARAGON.*CARCASTILLO/i]]];
const EMDN={};let BQA=null;
async function busqAll(){if(BQA)return BQA;const c=LS.get('amBusqA',null);if(c&&Date.now()-c.t<14*864e5){BQA=c.L;return BQA;}
  const b=await netGet(SAIH+'/api/common/getBusquedas');try{BQA=(JSON.parse(b.body).BUSQUEDA||[]).filter(e=>e.TIPO==='_ficha'&&e.TIPO_REMOTA==='A').map(e=>({c:e.CODIGO_ESTACION,n:e.NOMBRE_ESTACION}));LS.set('amBusqA',{t:Date.now(),L:BQA});}catch(e){BQA=[];}
  return BQA;}
async function emDown(st){const B=await busqAll();
  for(const s of st){if(EMDN[s.code])continue;const e=CAU&&CAU[s.code];if(e&&pick(e,'qout'))continue;
    const R=EM_DOWN.find(([re])=>re.test(s.name));let code=null;
    if(R)for(const x of R[1]){if(typeof x==='string'){code=x;break;}const f=B.find(b=>x.test(b.n));if(f){code=f.c;break;}}
    if(!code){const w=(s.name.match(/[A-ZÁÉÍÓÚÑ]{4,}/g)||[]).filter(t=>!/EMBALSE|PRESA|RIO/.test(t));const f=B.find(b=>w.some(t=>b.n.includes(t))&&/A\.?\s*ABAJO|PRESA|AGUAS ABAJO/i.test(b.n));if(f)code=f.c;}
    if(code)EMDN[s.code]=code;}
  const need=[...new Set(Object.values(EMDN))].filter(c=>!CAU[c]||!pick(CAU[c],'q'));
  for(let i=0;i<need.length;i+=4)await Promise.all(need.slice(i,i+4).map(async c=>{const x=await netGet(SAIH+'/api/ficha/procesarTablaValoresActuales?estacion='+c);try{fichaAdd(CAU,c,JSON.parse(x.body).VALORES_ACTUALES||'');}catch(e){}}));}
if(typeof embCard==='function'){const _ec=embCard;embCard=function(code,title,down,geo){return _ec(code,title,down||EMDN[code]||null,geo);};}
if(typeof emInit==='function'){const _em=emInit;emInit=async function(){await _em.apply(this,arguments);if(!APP)return;
  try{const st=await emStations();await emDown(st);
    const vo=s=>{const e=CAU[s.code],v=e&&pick(e,'vol');return v&&/hm/i.test(v.LS_UNID_ING||'')?Number(v.VALOR_QM):null;};
    const S=st.slice().sort((a,b)=>(vo(b)||0)-(vo(a)||0));
    $('emList').innerHTML=S.map(s=>embCard(s.code,prettyName(s.name),null,s.code==='E025'?{cap:21.39,zmax:628,zmin:585}:null)).join('');
    // en el resumen, al lado del %, lo que sale de cada presa
    const q=S.map(s=>{const e=CAU[s.code],o=(e&&pick(e,'qout'))||(EMDN[s.code]&&pick(CAU[EMDN[s.code]],'q'));return o?`<div class="st"><span>⬆️ ${prettyName(s.name).replace(/^Embalse (de )?/i,'')}</span><b>${fmtN(o.VALOR_QM,1)} m³/s</b></div>`:'';}).join('');
    if(q)$('emSum').insertAdjacentHTML('beforeend',`<div style="margin-top:10px"><b>⬆️ Lo que sale de cada presa ahora</b>${q}</div>`);}catch(e){console.log('emb',e);}};}

// -------------------------------------------------- 2. previsión 3 días para todos los ríos
const ARGA_PT={A152:[42.972,-1.507],A159:[42.832,-1.594],A313:[42.826,-1.616],A323:[42.824,-1.651],A324:[42.811,-1.719],A069:[42.793,-1.785],A004:[42.316,-1.800],
  A067:[42.866,-1.598],A355:[42.989,-1.837],A356:[42.993,-1.886],A322:[42.918,-1.831],A321:[42.894,-2.040],A068:[42.813,-1.762],A358:[42.704,-1.508],A270:[42.802,-1.661]};
const PRIOS=[['arga','🌊','Arga'],['irati','🌲','Irati'],['ega','🍇','Ega'],['aragon','⛰️','Aragón'],['ebro','🏞️','Ebro']];
let PR='arga',PD=1,PM=null,PST={},PGF={},PSEL=null;
(function(){const sec=$('t-prev');if(!sec)return;
  sec.insertAdjacentHTML('afterbegin',`<div class="card" id="prC">
   <div class="note"><span>Previsión de los próximos 3 días.</span> Cada punto es una estación de medida. Su color cambia según la previsión del día que elijas.</div>
   <div class="seg amSeg msRios" id="prR">${PRIOS.map(r=>`<button class="btn${r[0]===PR?' on':''}" data-r="${r[0]}">${r[2]}</button>`).join('')}</div>
   <div class="seg amSeg" id="prD"></div>
   <canvas id="prMap" class="amMap" style="height:360px;margin-top:6px"></canvas>
   <div class="note" style="margin-top:6px;line-height:1.7"><span class="amPill" style="background:#43a047">●</span> Normal · <span class="amPill" style="background:#f9a825">●</span> Precaución (puede llegar al aviso amarillo) · <span class="amPill" style="background:#e53935">●</span> Alerta (aviso naranja o rojo) · <span class="amPill" style="background:#9e9e9e">●</span> sin datos</div>
   <div id="prInfo" class="note"></div></div><div id="prList"></div>
   <div class="card note" id="prHow">ℹ️ <b>Cómo se calcula:</b> partimos del caudal de ahora de cada estación (SAIH Ebro) y lo hacemos subir o bajar como prevé el modelo europeo de ríos GloFAS (Copernicus) para ese tramo. El color compara el nivel esperado con los umbrales de aviso del SAIH. Es una estimación: <b>los avisos oficiales de la CHE y SOS Navarra mandan</b>.</div>`);
  sec.querySelectorAll('#prR button').forEach(b=>b.onclick=()=>{PR=b.dataset.r;PSEL=null;sec.querySelectorAll('#prR button').forEach(x=>x.classList.toggle('on',x===b));prLoad();});
  // fuera «¿Y si lloviera más?»
  const fm=$('fm');if(fm){fm.value=1;fm.closest('div').style.display='none';}
  const fc=$('fcard');if(fc){const t=fc.querySelector('b');if(t)t.textContent='🌧️ Río Arga en Pamplona: caudal con la lluvia prevista (72 h)';}})();
const dName=i=>{const d=new Date();d.setDate(d.getDate()+i);return i===0?'Hoy':i===1?'Mañana':d.toLocaleDateString(LOC,{weekday:'long',day:'numeric'});};
async function prStations(r){if(PST[r])return PST[r];let L=[];
  if(r==='arga'){L=CAU_ARGA.concat(CAU_AFL).map(([c,n])=>{const e=CAU&&CAU[c];let pt=ARGA_PT[c];if(e&&e.x&&typeof utm2ll==='function'){try{pt=utm2ll(+e.x,+e.y);}catch(x){}}return {code:c,name:n,pt};});}
  else{const st=await rivStations(r);L=st.filter(s=>s.tipo==='A'&&s.lat!=null).map(s=>({code:s.code,name:prettyName(s.name),pt:[s.lat,s.lon],io:s.io}));}
  PST[r]=L.filter(s=>s.pt);return PST[r];}
async function prGlofas(L){const need=L.filter(s=>!PGF[s.code]);if(!need.length)return;
  for(let i=0;i<need.length;i+=25){const ch=need.slice(i,i+25);
    const j=await getJSON(`https://flood-api.open-meteo.com/v1/flood?latitude=${ch.map(s=>s.pt[0].toFixed(4)).join(',')}&longitude=${ch.map(s=>s.pt[1].toFixed(4)).join(',')}&daily=river_discharge,river_discharge_max&forecast_days=5`);
    const A=Array.isArray(j)?j:j?[j]:[];ch.forEach((s,k)=>{const d=A[k]&&A[k].daily;if(d)PGF[s.code]={t:d.time,q:d.river_discharge,mx:d.river_discharge_max};});}}
// estado de un día: caudal previsto = caudal de ahora × (GloFAS ese día / GloFAS hoy); nivel ≈ nivel de ahora × factor^0,6
function prEstado(s,d){const e=CAU&&CAU[s.code],q=e&&pick(e,'q'),n=e&&pick(e,'n'),g=PGF[s.code];
  if(!g||(!q&&!n))return {c:'#9e9e9e',t:'sin datos'};const i0=Math.max(0,g.t.indexOf(ymd(new Date()))),g0=Math.max(.05,g.q[i0]||0),gd=g.q[Math.min(g.q.length-1,i0+d)];
  if(gd==null)return {c:'#9e9e9e',t:'sin datos'};const f=Math.max(.05,Math.min(20,gd/g0));
  const qp=q?q.VALOR_QM*f:null,np=n?n.VALOR_QM*Math.pow(f,.6):null,u=n&&umbralOf(n);let lv=0;
  if(u&&np!=null){if(u.col2!=null&&np>=u.col2)lv=2;else if(u.col1!=null&&np>=u.col1)lv=1;}
  else if(s.code==='A313'||s.code==='A323'){if(qp>=250)lv=2;else if(qp>=150)lv=1;}
  else if(f>=4)lv=2;else if(f>=2.2)lv=1;
  return {c:['#43a047','#f9a825','#e53935'][lv],lv,qp,np,f,u,q:q&&q.VALOR_QM,n:n&&n.VALOR_QM};}
async function prLoad(){const info=$('prInfo'),list=$('prList');
  $('prD').innerHTML=[0,1,2,3].map(i=>`<button class="btn${i===PD?' on':''}" data-d="${i}">${dName(i)}</button>`).join('');
  $('prD').querySelectorAll('button').forEach(b=>b.onclick=()=>{PD=+b.dataset.d;$('prD').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));prDraw();});
  if(!APP){info.textContent='';list.innerHTML='<div class="card"><div class="note">📱 La previsión de todos los ríos funciona en la app del móvil: el móvil lee los caudales del SAIH Ebro.</div></div>';prMap();return;}
  info.textContent='Buscando las estaciones…';const L=await prStations(PR);
  if(!L.length){info.textContent='❌ El SAIH no responde ahora. Prueba en un rato.';return;}
  info.textContent='Leyendo el caudal de ahora y la previsión…';
  if(PR==='arga'){if(!CAU||Date.now()-cauT>10*60e3){try{await cauFetch();}catch(e){}}}
  else{try{await rivFetch(PR);}catch(e){}}
  if(!UMB){try{const u=await netGet(SAIH+'/api/info/getTablaUmbrales');UMB=JSON.parse(u.body);}catch(e){}}
  await prGlofas(L);info.textContent=`${L.length} estaciones del SAIH Ebro · previsión GloFAS`;prMap();prDraw();}
/* 28 nov. 2026 (Pedro): el río elegido entero, de su nacimiento a su desembocadura (el Arga hasta el Aragón en Funes),
   bien marcado encima de los demás ríos, y el mapa encuadrado a todo su recorrido. Trazado: OpenStreetMap (rios.js). */
const PR_RE={arga:/^arga( ibaia)?$/i,irati:/^irati( ibaia)?$/i,ega:/^ega( ibaia)?$/i,aragon:/^(r[ií]o arag[oó]n|aragoi ibaia)$/i,ebro:/^(r[ií]o ebro|ebro ibaia)$/i};
const prDelRio=w=>{const re=PR_RE[PR];return !!re&&[w.n,w.es,w.eu].some(n=>n&&re.test(String(n).trim()));};
function prCauce(){if(!window.RIOS_GEO)return null;let s=90,n=-90,o=180,e=-180,hay=false;(RIOS_GEO.w||[]).forEach(w=>{if(!prDelRio(w))return;hay=true;
  w.p.forEach(q=>{s=Math.min(s,q[0]);n=Math.max(n,q[0]);o=Math.min(o,q[1]);e=Math.max(e,q[1]);});});return hay?{s,n,w:o,e}:null;}
function prMap(){if(PM)return PM.draw();PM=NavMap('prMap',(x,P,b,M)=>{const L=PST[PR]||[];
    if(window.RIOS_GEO){x.strokeStyle='#1e88e5';x.lineWidth=1.2;x.globalAlpha=.4;(RIOS_GEO.w||[]).forEach(w=>{if(prDelRio(w))return;x.beginPath();w.p.forEach((q,i)=>{const [px,py]=P(q[0],q[1]);i?x.lineTo(px,py):x.moveTo(px,py);});x.stroke();});x.globalAlpha=1;
      x.lineCap='round';x.lineJoin='round';[['#fff',6.5],['#0d47a1',3.6]].forEach(([c,lw])=>{x.strokeStyle=c;x.lineWidth=lw;(RIOS_GEO.w||[]).forEach(w=>{if(!prDelRio(w))return;x.beginPath();w.p.forEach((q,i)=>{const [px,py]=P(q[0],q[1]);i?x.lineTo(px,py):x.moveTo(px,py);});x.stroke();});});}
    L.forEach(s=>{const e=prEstado(s,PD),[px,py]=P(s.pt[0],s.pt[1]),sel=PSEL===s.code;x.beginPath();x.arc(px,py,sel?11:8,0,7);x.fillStyle=e.c;x.fill();x.strokeStyle=sel?'#000':'#fff';x.lineWidth=sel?3:2;x.stroke();
      if(M.z>2.5||L.length<10){x.font='bold 10.5px system-ui';x.textAlign='left';x.fillStyle='#10202a';x.strokeStyle='#fff';x.lineWidth=3;x.strokeText(s.name,px+11,py+4);x.fillText(s.name,px+11,py+4);}});},
  (px,py,M)=>{let best=null,bd=22;(PST[PR]||[]).forEach(s=>{const [x,y]=M.P(s.pt[0],s.pt[1]),d=Math.hypot(x-px,y-py);if(d<bd){bd=d;best=s;}});if(best){PSEL=best.code;M.draw();const el=document.querySelector(`#prList [data-c="${best.code}"]`);if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.style.outline='2px solid var(--acc)';setTimeout(()=>el.style.outline='',1500);}}});
  if(!window.RIOS_GEO){const s=document.createElement('script');s.src='rios.js';s.onload=()=>{if(PM){prFit();PM.draw();}};document.body.appendChild(s);}
  prFit();}
function prFit(){const L=PST[PR]||[];if(!PM)return;const C=prCauce();
  const la=L.map(s=>s.pt[0]).concat(C?[C.s,C.n]:[]),lo=L.map(s=>s.pt[1]).concat(C?[C.w,C.e]:[]);
  if(!la.length)return PM.fit(41.9,43.3,-2.5,-0.7);
  PM.fit(Math.min(...la)-.03,Math.max(...la)+.03,Math.min(...lo)-.05,Math.max(...lo)+.05);}
function prDraw(){if(PM){prFit();PM.draw();}const L=PST[PR]||[];if(!L.length)return;
  const bar=(v,mx,c)=>`<span style="display:block;height:9px;border-radius:5px;background:rgba(127,127,127,.18);overflow:hidden;margin-top:4px"><span style="display:block;height:100%;width:${Math.max(2,Math.min(100,v/mx*100))}%;background:${c}"></span></span>`;
  $('prList').innerHTML=`<div class="card"><b>${PRIOS.find(r=>r[0]===PR)[1]} Río ${PRIOS.find(r=>r[0]===PR)[2]} · ${dName(PD).toLowerCase()}</b>${L.map(s=>{const E=[0,1,2,3].map(d=>prEstado(s,d)),e=E[PD],mx=Math.max(1,...E.map(x=>x.qp||0),e.q||0)*1.15;
    return `<div class="st" data-c="${s.code}" style="display:block;cursor:pointer"><div style="display:flex;justify-content:space-between;gap:8px"><b>${s.io==='in'?'⬅️ ':s.io==='out'?'➡️ ':''}${esc(s.name)}</b><span class="amPill" style="background:${e.c}">${e.lv===2?'Alerta':e.lv===1?'Precaución':e.c==='#9e9e9e'?'—':'Normal'}</span></div>
     ${e.q!=null?`<div class="s">Ahora: <b>${fmtN(e.q,1)} m³/s</b>${e.n!=null?' · nivel '+fmtN(e.n,2)+' m':''}${bar(e.q,mx,'#1e88e5')}</div>`:'<div class="s">Sin caudal ahora</div>'}
     ${PD>0&&e.qp!=null?`<div class="s">${dName(PD)}: ≈ <b>${fmtN(e.qp,1)} m³/s</b> (${e.f>=1?'×'+fmtN(e.f,1):'baja'})${bar(e.qp,mx,e.c)}</div>`:''}
     <div class="s" style="margin-top:4px">${E.map((x,d)=>`<span title="${dName(d)}" style="display:inline-block;width:22%;text-align:center;border-radius:6px;padding:1px 0;margin-right:2%;background:${x.c}22;border:1px solid ${x.c};font-size:11.5px">${d===0?'hoy':dName(d).slice(0,3)} ${x.qp!=null?fmtN(x.qp,0):'—'}</span>`).join('')}</div>
     ${e.u?`<div class="s" style="opacity:.75">Umbrales de nivel: 🟡 ${fmtN(e.u.col1,2)} m · 🟠 ${fmtN(e.u.col2,2)} m · 🔴 ${fmtN(e.u.col3,2)} m</div>`:''}</div>`;}).join('')}</div>`;
  $('prList').querySelectorAll('[data-c]').forEach(d=>d.onclick=()=>{PSEL=d.dataset.c;const s=L.find(x=>x.code===PSEL);if(PM&&s){PM.fit(s.pt[0]-.08,s.pt[0]+.08,s.pt[1]-.12,s.pt[1]+.12);}});}
svHook('prev',()=>{prLoad();});

// gráfica del Arga con fondo claro (misma lógica que antes)
if(typeof fcRender==='function'){fcRender=function(){const res=$('fres');FQ=fcModel();if(!fx||fcc.clientWidth<10)return;
  const W=fcc.clientWidth,H=LH(fcc);fx.fillStyle='#ffffff';fx.fillRect(0,0,W,H);fcc.style.background='#fff';
  fx.fillStyle='#d5dde3';for(let gx=40;gx<W;gx+=24)for(let gy=10;gy<H-14;gy+=18)fx.fillRect(gx,gy,1.2,1.2);
  if(!FQ){fx.fillStyle='#5b6b78';fx.font='12px system-ui';fx.fillText('Sin datos de previsión todavía',10,20);res.textContent='';return;}
  const N=FQ.length,rain=(FC.rain||[]).map(Number),qmax=Math.max(400,...FQ)*1.1,rmax=Math.max(3,...rain);
  const X=t=>32+t/(N-1)*(W-40),Yq=q=>H-16-q/qmax*(H-30);
  rain.forEach((v,t)=>{const h=v/rmax*40;fx.fillStyle='rgba(30,136,229,.45)';fx.fillRect(X(t)-1.5,4,3,h);});
  [[150,'#f9a825'],[250,'#ef6c00'],[350,'#e53935'],[608,'#8e24aa']].forEach(([q,c])=>{if(q>qmax)return;fx.strokeStyle=c;fx.globalAlpha=.8;fx.setLineDash([4,4]);fx.beginPath();fx.moveTo(32,Yq(q));fx.lineTo(W-8,Yq(q));fx.stroke();fx.setLineDash([]);fx.globalAlpha=1;fx.fillStyle=c;fx.font='bold 10px system-ui';fx.textAlign='right';fx.fillText(q===608?'2021':q,W-10,Yq(q)-2);});
  fx.strokeStyle='#0d47a1';fx.lineWidth=2.4;fx.beginPath();FQ.forEach((q,t)=>fx[t?'lineTo':'moveTo'](X(t),Yq(q)));fx.stroke();
  const t0=new Date(FC.t0);for(let t=0;t<N;t+=24){const d=new Date(t0.getTime()+t*3600e3);fx.fillStyle='#41525e';fx.font='10px system-ui';fx.textAlign='left';fx.fillText(d.toLocaleDateString(LOC,{weekday:'short',day:'numeric'})+' '+d.getHours()+'h',X(t)+2,H-3);}
  fx.textAlign='left';fx.fillStyle='#41525e';fx.fillText('m³/s',2,H-20);fx.fillText('lluvia',2,14);
  let ip=0;FQ.forEach((q,i)=>{if(q>FQ[ip])ip=i;});const pk=Math.round(FQ[ip]),dp=new Date(t0.getTime()+ip*3600e3),ph=phaseOf(pk)[0];
  const tot=Math.round(rain.reduce((a,b)=>a+b,0));
  res.innerHTML=`Lluvia prevista: ${tot} mm en 72 h · Pico: <span style="color:${phaseOf(pk)[1]}">${pk} m³/s</span> ${ip===0?'(ahora: el río tiende a bajar)':'el '+dp.toLocaleDateString(LOC,{weekday:'long'})+' a las '+dp.getHours()+' h'} → ${ph}`;};}

// -------------------------------------------------- 3. datos históricos de todos los ríos
const HIST={
 irati:{t:'🌲 Irati (y Salazar, Esca)',c:[
  ['Diciembre 2021','Itoiz retiene más de 700 m³/s','Los embalses de Itoiz (Irati) y Yesa (Aragón) llegaron a retener cada uno más de 700 m³/s de punta. Sin ellos, en Sangüesa habrían pasado unos 2.200 m³/s; pasaron poco más de 800.'],
  ['Diciembre 2019','Esca en Sigües: 300 m³/s (récord)','El 13 de diciembre de 2019 el Esca batió su récord en la estación de Sigües: 4,15 m de altura y 300 m³/s. Desbordamientos en muchos ríos de la mitad norte.']],
  n:'Itoiz (418 hm³) e Irabia regulan el Irati. Los avisos se dan por el nivel de cada estación del SAIH.'},
 ega:{t:'🍇 Ega',c:[
  ['Diciembre 2021','Crecida extraordinaria','El Ega se desbordó en Tierra Estella. En Andosilla llegó a unos 4,6 m de altura el sábado 11 de diciembre. La punta pasó por Estella con menos daños de los que preveían los modelos.'],
  ['Enero 2025','Previsión de 200–250 m³/s en Estella','La CHE avisó de una crecida de hasta 200–250 m³/s en la estación de Estella entre el 30 y el 31 de enero.'],
  ['Febrero 2026','Hasta ~250 m³/s en Estella','Con la borrasca de mediados de febrero se previeron hasta unos 250 m³/s en Estella; el Ebro tomó después el relevo.']],
  n:'En el Ega, el Urederra y los manantiales de Ancín aportan buena parte del agua. Los avisos se dan por el nivel de cada estación del SAIH.'},
 aragon:{t:'⛰️ Aragón',c:[
  ['Diciembre 2021','Sangüesa se libra gracias a Itoiz y Yesa','La laminación conjunta de Itoiz y Yesa bajó el caudal en Sangüesa de unos 2.200 m³/s (lo que habría pasado sin presas) a poco más de 800 m³/s.'],
  ['Diciembre 2024','Crecida que llega al Ebro','El máximo del Aragón llegó al tramo Alfaro–Castejón–Tudela el 10 de diciembre; la CHE estimó 1.500–1.900 m³/s en el Ebro.']],
  n:'Yesa (con su recrecimiento) regula el Aragón. El Aragón recoge el Irati y el Arga antes de llegar al Ebro en Milagro.'},
 ebro:{t:'🏞️ Ebro (Castejón y Tudela)',c:[
  ['Febrero 2003','2.847 m³/s en Castejón','Uno de los mayores caudales registrados en Castejón (dato revisado por la CHE; al principio se estimaron 3.317 m³/s).'],
  ['Febrero–marzo 2015','~2.400 m³/s en Castejón','El 27 de febrero el nivel en Castejón llegó a 7,78 m, unos 2.400 m³/s. Riada muy larga en la Ribera y en Aragón.'],
  ['Diciembre 2021','~2.500 m³/s en Castejón y 2.679 en Tudela','La punta pasó por Castejón el sábado 11 de diciembre por la noche. Sin la laminación de los embalses se calcula que habrían pasado cerca de 4.000 m³/s.'],
  ['Enero 2013','~1.750 m³/s en Castejón','Crecida «ordinaria» del Ebro por el agua del Arga (más de 1.000 m³/s en Etxauri), el alto Ebro y el Aragón.']],
  n:'En Castejón se habla de crecida «ordinaria» y «extraordinaria» según el caudal. En las grandes riadas parte del agua pasa por fuera del aforo, así que el dato real puede ser algo mayor.'},
 arga2:[['Enero 2013','Etxauri: más de 1.000 m³/s','Pamplona superó los 430 m³/s, Etxauri los 1.000 m³/s (el mayor episodio desde 2003) y Funes 925 m³/s.']]};
let HR='arga';
(function(){const sec=$('t-hist');if(!sec)return;
  sec.insertAdjacentHTML('afterbegin',`<div class="seg amSeg msRios" id="hiR">${PRIOS.map(r=>`<button class="btn${r[0]==='arga'?' on':''}" data-r="${r[0]}">${r[2]}</button>`).join('')}</div><div id="hiO" style="display:none"></div>`);
  // tarjeta nueva del Arga (enero 2013), detrás de la de 2024
  const cs=[...sec.querySelectorAll('.card.hist')];if(cs.length)cs[cs.length-1].insertAdjacentHTML('afterend',HIST.arga2.map(h=>`<div class="card hist"><h3>${h[0]} · ${h[1]}</h3><div class="note">${h[2]}</div></div>`).join(''));
  sec.querySelectorAll('#hiR button').forEach(b=>b.onclick=()=>{HR=b.dataset.r;sec.querySelectorAll('#hiR button').forEach(x=>x.classList.toggle('on',x===b));
    [...sec.children].forEach(c=>{if(c.id!=='hiR'&&c.id!=='hiO'&&!/^pv/.test(c.id)&&!c.classList.contains('rwMsg')&&!c.classList.contains('bnaSrc')&&!c.classList.contains('bnaPieSrc'))c.style.display=HR==='arga'?'':'none';});const o=$('hiO');o.style.display=HR==='arga'?'none':'';if(HR!=='arga')hiRender();});})();
async function hiRender(){const H=HIST[HR],o=$('hiO');
  o.innerHTML=`${H.c.map(c=>`<div class="card hist"><h3>${c[0]} · ${c[1]}</h3><div class="note">${c[2]}</div></div>`).join('')}
   <div class="card"><b>Fases de aviso de las estaciones del SAIH Ebro</b><div class="note">Igual que en el Arga, cada estación tiene tres umbrales de nivel: 🟡 aviso amarillo, 🟠 aviso naranja y 🔴 aviso rojo.</div><div id="hiU"><div class="note">${APP?'Cargando los umbrales…':'📱 Los umbrales de cada estación salen en la app del móvil.'}</div></div></div>
   <div class="card note">${H.n}</div>`;
  if(!APP)return;try{const st=await rivStations(HR);await rivFetch(HR);if(!UMB){const u=await netGet(SAIH+'/api/info/getTablaUmbrales');UMB=JSON.parse(u.body);}
    const rows=st.filter(s=>s.tipo==='A').map(s=>{const n=CAU&&CAU[s.code]&&pick(CAU[s.code],'n'),u=n&&umbralOf(n);return u?`<table class="ph" style="margin-top:6px"><tr><td colspan="2"><b>${esc(prettyName(s.name))}</b>${n?` · ahora ${fmtN(n.VALOR_QM,2)} m`:''}</td></tr><tr><td>🟡 Aviso amarillo</td><td>${fmtN(u.col1,2)} m</td></tr><tr><td>🟠 Aviso naranja</td><td>${fmtN(u.col2,2)} m</td></tr><tr><td>🔴 Aviso rojo</td><td>${fmtN(u.col3,2)} m</td></tr></table>`:'';}).join('');
    $('hiU').innerHTML=rows||'<div class="note">El SAIH no da umbrales para estas estaciones.</div>';}catch(e){$('hiU').innerHTML='<div class="note">No se pudieron leer los umbrales ahora.</div>';}}
})();
