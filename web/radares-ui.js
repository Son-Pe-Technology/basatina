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
let CARGANDO=false;const CB=[];
window.radLoad=function(cb){if(window.RADARES)return cb&&cb();if(cb)CB.push(cb);if(CARGANDO)return;CARGANDO=true;
  const s=document.createElement('script');s.src='radares.js?t='+Math.floor(Date.now()/864e5);
  s.onload=s.onerror=()=>{CARGANDO=false;if(!window.RADARES)window.RADARES={L:[]};CB.splice(0).forEach(f=>{try{f();}catch(e){}});};document.body.appendChild(s);};
const L=()=>(window.RADARES&&window.RADARES.L)||[];
window.radTxt=r=>{const t=r.t==='tramo'?'Radar de tramo':'Radar fijo';
  return {tit:`${t}${r.car?' · '+r.car:''}`,sub:[r.pk?'PK '+r.pk:'',r.sen?'sentido '+String(r.sen).toLowerCase():'',r.vel?'límite '+r.vel+' km/h':'',r.mun||''].filter(Boolean).join(' · ')};};
let ON=true;try{ON=localStorage.getItem('bnaRadOn')!=='0';}catch(e){}
let SEL=null;

// ---------- dibujo encima del mapa de Carreteras ----------
function icono(x,px,py,sel){const s=sel?13:10;x.beginPath();x.roundRect?x.roundRect(px-s,py-s,2*s,2*s,4):x.rect(px-s,py-s,2*s,2*s);
  x.fillStyle='#263238';x.fill();x.strokeStyle=sel?'#ffeb3b':'#fff';x.lineWidth=sel?3:2;x.stroke();
  x.font=(sel?14:11)+'px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('📸',px,py+1);x.textAlign='start';x.textBaseline='alphabetic';}
function dibuja(x,P){if(!ON)return;L().forEach(r=>{const [a,b]=P(r.pt[0],r.pt[1]);
  if(r.t==='tramo'&&r.fin){const [c,d]=P(r.fin[0],r.fin[1]);x.save();x.strokeStyle='#7b1fa2';x.lineWidth=5;x.setLineDash([8,5]);x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke();x.restore();icono(x,c,d,SEL===r);}
  icono(x,a,b,SEL===r);});}
function ficha(r){const el=$('inFicha');if(!el||!r)return;const t=radTxt(r);
  el.innerHTML=`<div style="border-left:4px solid #263238;padding-left:10px"><b style="font-size:16px">📸 ${E(t.tit)}</b><div class="note">${E(t.sub)}</div>
   ${r.n&&r.n!==t.tit?`<div style="margin:6px 0;line-height:1.45">${E(r.n)}</div>`:''}
   <div class="note">Fuente: ${r.f==='DGT'?'DGT (datos abiertos)':'© OpenStreetMap (ODbL)'} · actualizado ${E((window.RADARES||{}).t||'')}</div></div>`;}
if(typeof inDraw==='function'){const _d=inDraw;inDraw=function(x,P,b,M){_d.apply(this,arguments);try{dibuja(x,P);}catch(e){}};}
if(typeof inTap==='function'){const _t=inTap;inTap=function(px,py,M){
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
  c.innerHTML=`<b>📸 Radares fijos y de tramo (${R.length})</b><div class="note">Los que avisa Tráfico. Los radares móviles no salen: cambian de sitio cada día. Respeta siempre los límites.</div>`+
    R.map((r,i)=>{const t=radTxt(r);return `<div class="st" data-ri="${i}" style="cursor:pointer"><div><b>📸 ${E(t.tit)}</b><div class="s">${E(t.sub)}</div></div><span>›</span></div>`;}).join('')+
    `<div class="note" style="margin-top:8px">Fuentes: DGT (datos abiertos, Punto de Acceso Nacional) y © OpenStreetMap (ODbL). Actualizado ${E((window.RADARES||{}).t||'')}.</div>`;
  c.querySelectorAll('[data-ri]').forEach(d=>d.onclick=()=>{const r=R[+d.dataset.ri];SEL=r;ON=true;pinta();ficha(r);
    try{const p=r.fin?[(r.pt[0]+r.fin[0])/2,(r.pt[1]+r.fin[1])/2]:r.pt;INM&&INM.fit(p[0]-.03,p[0]+.03,p[1]-.045,p[1]+.045);}catch(e){}
    const m=$('inc');if(m)m.scrollIntoView({behavior:'smooth',block:'center'});});}
const _st=showTab;showTab=function(t){const r=_st.apply(this,arguments);if(t==='incid')radLoad(()=>{pinta();try{INM&&INM.draw();}catch(e){}});return r;};
try{Object.assign(I18N.eu,{'📸 Radares: sí':'📸 Radarrak: bai','📸 Radares: no':'📸 Radarrak: ez'});Object.assign(I18N.en,{'📸 Radares: sí':'📸 Speed cameras: on','📸 Radares: no':'📸 Speed cameras: off'});Object.assign(I18N.fr,{'📸 Radares: sí':'📸 Radars : oui','📸 Radares: no':'📸 Radars : non'});}catch(e){}
})();
