/* =====================================================================
   📸 RADARES DE VELOCIDAD (28 nov. 2026, lo pidió Pedro)
   Radares fijos y de tramo de Navarra: datos abiertos de la DGT y OpenStreetMap
   (web/radares.js, lo genera tools/radares.py cada lunes).
   - Carreteras: capa «Radares» en el mapa (se enciende y apaga), ficha al tocar y lista en botones.
   - Qué hay cerca: los radares más cercanos (ver ceGo en index.html).
   Los radares móviles no salen: cambian de sitio cada día y no hay dato oficial.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
{const st=document.createElement('style');st.textContent='body.bna #vialCard .st{background:#eef5fd!important;border:1.5px solid #bcd4ee!important;border-radius:14px!important;padding:10px 12px!important;margin-top:8px!important}';document.head.appendChild(st);}
let CARGANDO=false;const CB=[];
window.radLoad=function(cb){if(window.RADARES)return cb&&cb();if(cb)CB.push(cb);if(CARGANDO)return;CARGANDO=true;
  const s=document.createElement('script');s.src='radares.js?t='+Math.floor(Date.now()/864e5);
  s.onload=s.onerror=()=>{CARGANDO=false;if(!window.RADARES)window.RADARES={L:[]};CB.splice(0).forEach(f=>{try{f();}catch(e){}});};document.body.appendChild(s);};
const L=()=>(window.RADARES&&window.RADARES.L)||[];
window.radTxt=r=>{const t=r.t==='tramo'?'Radar de tramo':r.t==='movil'?'Tramo vigilado con radar móvil':'Radar fijo';
  return {tit:`${t}${r.car?' · '+r.car:''}`,sub:[r.pk?'PK '+r.pk:'',r.sen?'sentido '+String(r.sen).toLowerCase():'',r.vel?'límite '+r.vel+' km/h':'',r.mun||''].filter(Boolean).join(' · ')};};
let ON=true;try{ON=localStorage.getItem('bnaRadOn')!=='0';}catch(e){}
let SEL=null;

// ---------- dibujo encima del mapa de Carreteras ----------
function icono(x,px,py,sel){const s=sel?13:10;x.beginPath();x.roundRect?x.roundRect(px-s,py-s,2*s,2*s,4):x.rect(px-s,py-s,2*s,2*s);
  x.fillStyle='#263238';x.fill();x.strokeStyle=sel?'#ffeb3b':'#fff';x.lineWidth=sel?3:2;x.stroke();
  x.font=(sel?14:11)+'px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('📸',px,py+1);x.textAlign='start';x.textBaseline='alphabetic';}
function dibuja(x,P){vDibuja(x,P);if(!ON)return;L().forEach(r=>{const [a,b]=P(r.pt[0],r.pt[1]);
  if(r.t==='movil'){if(!r.fin)return;const [c,d]=P(r.fin[0],r.fin[1]);x.save();x.strokeStyle=SEL===r?'#e65100':'#fb8c00';x.lineWidth=SEL===r?6:4;x.setLineDash([3,4]);x.lineCap='round';x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke();x.restore();return;}
  if(r.t==='tramo'&&r.fin){const [c,d]=P(r.fin[0],r.fin[1]);x.save();x.strokeStyle='#7b1fa2';x.lineWidth=5;x.setLineDash([8,5]);x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke();x.restore();icono(x,c,d,SEL===r);}
  icono(x,a,b,SEL===r);});}
function ficha(r){const el=$('inFicha');if(!el||!r)return;const t=radTxt(r);
  el.innerHTML=`<div style="border-left:4px solid #263238;padding-left:10px"><b style="font-size:16px">📸 ${E(t.tit)}</b><div class="note">${E(t.sub)}</div>
   ${r.n&&r.n!==t.tit?`<div style="margin:6px 0;line-height:1.45">${E(r.n)}</div>`:''}
   <div class="note">Fuente: ${r.f==='DGT'?'DGT (datos abiertos)':'© OpenStreetMap (ODbL)'} · actualizado ${E((window.RADARES||{}).t||'')}</div></div>`;}
if(typeof inDraw==='function'){const _d=inDraw;inDraw=function(x,P,b,M){_d.apply(this,arguments);try{dibuja(x,P);}catch(e){}};}
if(typeof inTap==='function'){const _t=inTap;inTap=function(px,py,M){
  {const v=vToca(px,py,M);if(v){SEL=null;try{INSEL=null;}catch(e){}M.draw();vFicha(v);return;}}
  if(ON){let best=null,bd=22;L().forEach(r=>[r.pt,r.fin].filter(Boolean).forEach(p=>{const [a,b]=M.P(p[0],p[1]),d=Math.hypot(a-px,b-py);if(d<bd){bd=d;best=r;}}));
    if(best){SEL=best;try{INSEL=null;}catch(e){}M.draw();ficha(best);return;}}
  SEL=null;return _t.apply(this,arguments);};}

// ---------- botón de la capa y lista ----------
function pinta(){const sec=$('t-incid');if(!sec)return;
  let bar=$('radBar');if(!bar){const ref=$('inFicha');if(!ref)return;
    bar=document.createElement('div');bar.id='radBar';bar.className='row';bar.style.cssText='margin:8px 0 0';
    bar.innerHTML='<button class="btn" id="radOn" style="flex:1"></button>';ref.before(bar);
    $('radOn').onclick=()=>{ON=!ON;try{localStorage.setItem('bnaRadOn',ON?'1':'0');}catch(e){}if(!ON)SEL=null;pinta();try{INM&&INM.draw();}catch(e){}};}
  const b=$('radOn');b.textContent=ON?'📸 Radares: sí':'📸 Radares: no';b.classList.toggle('on',ON);
  let c=$('radCard');const R=L();
  if(!c){c=document.createElement('div');c.className='card';c.id='radCard';const li=$('inList');(li?li.closest('.card'):sec.lastElementChild).after(c);}
  if(!R.length){c.innerHTML='<b>📸 Radares fijos y de tramo</b><div class="note">Cargando…</div>';return;}
  const nF=R.filter(r=>r.t!=='movil').length,nM=R.length-nF;
  c.innerHTML=`<b>📸 Radares (${nF} fijos y de tramo · ${nM} tramos de radar móvil)</b><div class="note">Los que publica Tráfico. Los «tramos de radar móvil» (en naranja en el mapa) son los tramos donde la DGT vigila más a menudo con radar móvil: no dicen dónde está el radar cada día. Respeta siempre los límites.</div>`+
    R.map((r,i)=>{const t=radTxt(r);return `<div class="st" data-ri="${i}" style="cursor:pointer"><div><b>📸 ${E(t.tit)}</b><div class="s">${E(t.sub)}</div></div><span>›</span></div>`;}).join('')+
    `<div class="note" style="margin-top:8px">Fuentes: DGT (datos abiertos, Punto de Acceso Nacional) y © OpenStreetMap (ODbL). Actualizado ${E((window.RADARES||{}).t||'')}.</div>`;
  c.querySelectorAll('[data-ri]').forEach(d=>d.onclick=()=>{const r=R[+d.dataset.ri];SEL=r;ON=true;pinta();ficha(r);
    try{const p=r.fin?[(r.pt[0]+r.fin[0])/2,(r.pt[1]+r.fin[1])/2]:r.pt;INM&&INM.fit(p[0]-.03,p[0]+.03,p[1]-.045,p[1]+.045);}catch(e){}
    const m=$('inc');if(m)m.scrollIntoView({behavior:'smooth',block:'center'});});}
/* ---------- ❄️ NIEVE, HIELO Y MAL TIEMPO EN LAS CARRETERAS (DGT, tiempo real) ----------
   carreteras/vialidad.json lo genera tools/dgt_vialidad.py cada 30 minutos (fuera de web/: no obliga a actualizar la app). */
let V=null,VSEL=null,VT=0;
const VQ={useSnowChainsOrTyres:'Cadenas o neumáticos de invierno obligatorios',useSnowChains:'Cadenas obligatorias',useWinterTyres:'Neumáticos de invierno obligatorios',
  winterEquipmentOnBoardRequired:'Obligatorio llevar cadenas en el coche',snowfall:'Nevando',heavySnowfall:'Nevando con fuerza',blowingSnow:'Ventisca',
  ice:'Hielo',blackIce:'Placas de hielo',frost:'Escarcha',fog:'Niebla',denseFog:'Niebla densa',patchyFog:'Bancos de niebla',strongWinds:'Viento fuerte',gales:'Rachas muy fuertes',
  heavyRain:'Lluvia fuerte',hail:'Granizo',snowOnTheRoad:'Nieve en la calzada',packedSnow:'Nieve compactada',iceOnTheRoad:'Hielo en la calzada',slipperyRoad:'Calzada deslizante',
  wetIcyRoad:'Calzada húmeda con hielo',freezingRain:'Lluvia helada',looseSnow:'Nieve suelta',slushOnRoad:'Nieve medio derretida',heavyGoodsVehicle:'camiones',articulatedVehicle:'vehículos articulados'};
const vTxt=r=>{const q=(r.que||[]).map(x=>x.split('=')[1]).filter(k=>VQ[k]&&!/^(poorEnvironment|weather|roadMaintenance)$/.test(k)).map(k=>VQ[k]);
  const veh=(r.veh||[]).filter(v=>v!=='anyVehicle').map(v=>VQ[v]||v);return [...new Set(q)].join(' · ')+(veh.length?' (solo '+veh.join(', ')+')':'')||'Afectada por el tiempo';};
const vIco=r=>/Chains|Tyres|snow|Snow/i.test((r.que||[]).join())?'❄️':/ice|Ice|frost|Icy/i.test((r.que||[]).join())?'🧊':/fog|Fog/i.test((r.que||[]).join())?'🌫️':'⚠️';
async function vCarga(){if(V&&Date.now()-VT<5*60e3)return V;try{V=await jsLoad('carreteras/vialidad.json',{L:[]},true);VT=Date.now();}catch(e){V={L:[]};}return V;}
function vDibuja(x,P){if(!V)return;(V.L||[]).forEach(r=>{const p=r.pts||[];if(!p.length)return;const Q=p.map(q=>P(q[0],q[1]));
  if(Q.length>1){x.save();x.lineCap='round';x.strokeStyle='#fff';x.lineWidth=VSEL===r?11:9;x.beginPath();x.moveTo(...Q[0]);Q.slice(1).forEach(q=>x.lineTo(...q));x.stroke();
    x.strokeStyle='#1565c0';x.lineWidth=VSEL===r?7:5;x.beginPath();x.moveTo(...Q[0]);Q.slice(1).forEach(q=>x.lineTo(...q));x.stroke();x.restore();}
  const [a,b]=Q[0];x.beginPath();x.arc(a,b,VSEL===r?13:11,0,7);x.fillStyle='#e3f2fd';x.fill();x.strokeStyle='#1565c0';x.lineWidth=2;x.stroke();
  x.font='12px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(vIco(r),a,b+1);x.textAlign='start';x.textBaseline='alphabetic';});}
function vToca(px,py,M){if(!V)return null;let best=null,bd=22;(V.L||[]).forEach(r=>(r.pts||[]).forEach(q=>{const [a,b]=M.P(q[0],q[1]),d=Math.hypot(a-px,b-py);if(d<bd){bd=d;best=r;}}));if(best)VSEL=best;return best;}
const vPk=r=>r.pk&&r.pk.length?(r.pk[0]===r.pk[1]?'PK '+r.pk[0]:'PK '+r.pk[0]+' a '+r.pk[1]).replace(/\./g,','):'';
function vFicha(r){const el=$('inFicha');if(!el)return;
  el.innerHTML=`<div style="border-left:4px solid #1565c0;padding-left:10px"><b style="font-size:16px">${vIco(r)} ${E(r.car||'Carretera')} · ${E(vTxt(r))}</b>
   <div class="note">${E([vPk(r),(r.mun||[]).join(', '),r.dest?'hacia '+r.dest:''].filter(Boolean).join(' · '))}</div>
   ${r.desde?`<div class="note">Desde ${E(new Date(r.desde).toLocaleString('es-ES',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}))}</div>`:''}
   <div class="note">Fuente: DGT (datos abiertos, tiempo real). Antes de salir, consulta siempre el 011 o el 848 423 500.</div></div>`;}
async function vPinta(){const sec=$('t-incid');if(!sec)return;await vCarga();
  let c=$('vialCard');if(!c){c=document.createElement('div');c.className='card';c.id='vialCard';const s0=$('inSum');(s0||sec.firstElementChild).after(c);}
  const L=(V&&V.L)||[];
  c.innerHTML=`<b>❄️ Nieve, hielo y mal tiempo en las carreteras</b>`+(L.length?`<div class="note">${L.length} tramo${L.length>1?'s':''} afectado${L.length>1?'s':''} ahora (en azul en el mapa).</div>`+
    L.map((r,i)=>`<div class="st" data-vi="${i}" style="cursor:pointer"><div><b>${vIco(r)} ${E(r.car||'Carretera')} · ${E(vTxt(r))}</b><div class="s">${E([vPk(r),(r.mun||[]).join(', ')].filter(Boolean).join(' · '))}</div></div><span>›</span></div>`).join(''):
    '<div class="note">✅ Ahora mismo no hay carreteras de Navarra afectadas por nieve, hielo o niebla según la DGT.</div>')+
    `<div class="note" style="margin-top:6px">Fuente: DGT, datos abiertos en tiempo real${V&&V.t?' · '+E(new Date(V.t).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})):''}.</div>`;
  c.querySelectorAll('[data-vi]').forEach(d=>d.onclick=()=>{const r=L[+d.dataset.vi];VSEL=r;vFicha(r);
    try{const p=r.pts[0],q=r.pts[r.pts.length-1];INM&&INM.fit(Math.min(p[0],q[0])-.03,Math.max(p[0],q[0])+.03,Math.min(p[1],q[1])-.045,Math.max(p[1],q[1])+.045);}catch(e){}
    const m=$('inc');if(m)m.scrollIntoView({behavior:'smooth',block:'center'});});
  try{INM&&INM.draw();}catch(e){}}
window.vialCarga=vCarga;window.vialTxt=vTxt;window.vialIco=vIco;
const _st=showTab;showTab=function(t){const r=_st.apply(this,arguments);if(t==='incid'){radLoad(()=>{pinta();try{INM&&INM.draw();}catch(e){}});vPinta();}return r;};
try{Object.assign(I18N.eu,{'📸 Radares: sí':'📸 Radarrak: bai','📸 Radares: no':'📸 Radarrak: ez'});Object.assign(I18N.en,{'📸 Radares: sí':'📸 Speed cameras: on','📸 Radares: no':'📸 Speed cameras: off'});Object.assign(I18N.fr,{'📸 Radares: sí':'📸 Radars : oui','📸 Radares: no':'📸 Radars : non'});}catch(e){}
})();
