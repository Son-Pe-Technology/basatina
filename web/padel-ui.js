/* =====================================================================
   🎾 NA PÁDEL (17 nov. 2026) — se carga el último, después de curiosas.js
   1. Pantalla `padel` (grupo «Qué hacer»), con tres pestañas:
        · 🎾 Pistas: clubes y pistas de Navarra en el mapa y en lista (web/padel.js, robot tools/padel.py,
          © OpenStreetMap). Filtros: cubiertas, municipales, clubes, buscador y «Cerca de mí».
          Ficha de cada sitio: pistas, cubiertas, luz, dirección, horario, teléfono, web, cómo llegar y el tiempo.
        · 🏆 Competición: los partidos de pádel de «Deporte navarro» (deporte/partidos.json, dep = 'padel'),
          próximos y resultados, y el enlace a la Federación Navarra de Pádel.
        · Arriba, «¿Se puede jugar fuera?»: lluvia y rachas de viento de las próximas horas (Open‑Meteo).
   2. «Pádel» como deporte nuevo en Deporte navarro (DP_DEPS): botón, icono y en el formulario de administrador.
      Los partidos de pádel los apuntan los administradores (no hay una fuente automática todavía).
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const E=s=>(typeof esc==='function'?esc(s):String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
const N=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const abre=u=>window.amAbre?window.amAbre(u):window.open(u,'_blank');
const FNP='https://federacionnavarradepadel.com/';

/* ---------- Pádel en Deporte navarro ---------- */
try{if(!DP_DEPS.some(x=>x[0]==='padel')){const i=DP_DEPS.findIndex(x=>x[0]==='otros');DP_DEPS.splice(i<0?DP_DEPS.length:i,0,['padel','Pádel','🎾']);}}catch(e){}

/* ---------- icono ---------- */
try{Object.assign(BNI,{'i-padel':'<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="14" cy="12" rx="7.5" ry="8.6" transform="rotate(-35 14 12)" fill="currentColor" fill-opacity=".12"/><path d="M9.6 18.6L4.5 26"/><circle cx="25" cy="24" r="3.4" fill="currentColor" fill-opacity=".25"/></g><g fill="currentColor"><circle cx="12" cy="10" r="1"/><circle cx="15.5" cy="9" r="1"/><circle cx="13.5" cy="13.5" r="1"/><circle cx="17" cy="12.5" r="1"/></g>'});}catch(e){}

const st=document.createElement('style');st.textContent=`
.pdChips{display:flex;gap:6px;overflow-x:auto;padding:2px 0 6px}.pdChips button{flex:none;border:1px solid var(--line);background:none;color:inherit;border-radius:18px;padding:6px 12px;font:inherit;font-size:14px;cursor:pointer}
.pdChips button.on{background:#1565c0;color:#fff;border-color:transparent}
.pdWx{display:flex;gap:4px;overflow-x:auto;margin-top:8px}.pdWx div{flex:1 0 46px;text-align:center;border-radius:10px;padding:4px 2px;background:rgba(21,101,192,.06)}
.pdWx small{display:block;font-size:11.5px;color:var(--mut)}.pdWx b{font-size:13px}
.pdVer{border-radius:12px;padding:8px 10px;font-weight:700;margin-top:6px}
.pdTag{display:inline-block;padding:1px 8px;border-radius:10px;font-size:12px;font-weight:700;color:#fff;margin-left:4px;vertical-align:1px}
.pdM{display:flex;gap:10px;align-items:center;padding:8px 0;border-top:1px solid var(--line)}.pdM:first-child{border-top:0}
.pdM .d{flex:none;width:46px;text-align:center;border-radius:10px;background:rgba(21,101,192,.08);padding:3px 0}.pdM .d b{display:block;font-size:18px}.pdM .d small{font-size:11px;text-transform:capitalize}
.pdM .r{flex:none;font-weight:800;font-size:16px}`;document.head.appendChild(st);

/* ---------- pantalla ---------- */
const PD_T=[['pistas','🎾 <span>Pistas</span>'],['comp','🏆 <span>Competición</span>']];
const PD_F=[['','Todas'],['cu','🏠 Cubiertas'],['m','🏛️ Municipales'],['c','🎾 Clubes']];
let PDT='pistas',PDF='',PDYO=false,PDM=null,PDSEL=null;
svSec('padel',`<div class="card"><b>🎾 <span>NA Pádel</span></b><div class="note">Dónde jugar al pádel en Navarra, cómo está el tiempo para jugar fuera y la competición de los clubes navarros.</div>
 <div class="pdChips" id="pdT"></div><div id="pdWx"><div class="note">Mirando el tiempo…</div></div></div>
 <div id="pdV1"><div class="card"><div class="pdChips" id="pdF"></div><div class="row"><input id="pdQ" class="town" placeholder="🔎 Buscar pueblo o club…" style="flex:1;min-width:0"><button class="btn" id="pdYo">📍 <span>Cerca de mí</span></button></div></div>
  <div class="card" style="padding:6px"><canvas id="pdMap" class="amMap"></canvas><div class="note" style="padding:4px 6px">🔵 club · 🟢 municipal · punto grande = tiene pistas cubiertas</div></div>
  <div id="pdFi"></div><div id="pdL"><div class="card"><div class="note">Cargando…</div></div></div>
  <div class="note" style="margin:0 6px 12px">Puede faltar algún club o haber cambiado sus pistas u horarios: llama antes de ir. ¿Falta tu club? Cuéntanoslo en el <a href="#" id="pdBuz">buzón de sugerencias</a>.</div></div>
 <div id="pdV2" style="display:none"><div class="card" id="pdC"><div class="note">Cargando…</div></div>
  <div class="card"><b>🔗 <span>Federación Navarra de Pádel</span></b><div class="note">Calendario oficial, torneos, cuadros, ranking y licencias.</div><div class="row" style="margin-top:6px"><button class="btn" id="pdFnp">🌐 Abrir su web</button><button class="btn" id="pdDep">🏆 Deporte navarro</button></div></div></div>`);
window.amNuevo&&window.amNuevo('padel','Qué hacer','🎾 NA Pádel','fiesta','i-padel','b');

function pdTabs(){$('pdT').innerHTML=PD_T.map(([k,l])=>`<button class="${k===PDT?'on':''}" data-k="${k}">${l}</button>`).join('');
  $('pdT').querySelectorAll('button').forEach(b=>b.onclick=()=>{PDT=b.dataset.k;pdRender();});
  $('pdV1').style.display=PDT==='pistas'?'':'none';$('pdV2').style.display=PDT==='comp'?'':'none';}

/* ---------- ¿Se puede jugar fuera? (próximas 8 horas) ---------- */
let PDWX=0;
async function pdTiempo(){if(Date.now()-PDWX<15*60e3&&$('pdWx').dataset.ok)return;
  const la=MYPOS?MYPOS.la:42.8125,lo=MYPOS?MYPOS.lo:-1.6458,donde=MYPOS?'donde estás':'Pamplona';
  try{const j=await getJSON(`${OM}?latitude=${la.toFixed(3)}&longitude=${lo.toFixed(3)}&hourly=temperature_2m,precipitation_probability,precipitation,wind_gusts_10m,weather_code&forecast_days=2${TZ}`);
    const H=j.hourly,d=new Date(),k=ymd(d)+'T'+String(d.getHours()).padStart(2,'0')+':00';let i0=H.time.indexOf(k);if(i0<0)i0=0;
    const I=[...Array(8).keys()].map(n=>i0+n).filter(i=>i<H.time.length);
    const llu=I.filter(i=>(H.precipitation_probability[i]||0)>=50||(H.precipitation[i]||0)>=0.3).length,rac=Math.max(...I.map(i=>H.wind_gusts_10m[i]||0)),tmin=Math.min(...I.map(i=>H.temperature_2m[i]));
    const v=llu>=3?['🌧️','Va a llover: mejor una pista cubierta.','#e3f2fd','#0d47a1']:llu?['🌦️','Puede caer algún chaparrón: si juegas fuera, mira el cielo.','#fff8e1','#8d6e00']:
      rac>=45?['💨',`Mucho viento (rachas de ${Math.round(rac)} km/h): la bola se va, mejor cubierta.`,'#fff3e0','#e65100']:tmin<=3?['🥶',`Hace frío (${Math.round(tmin)} °C): calienta bien antes de jugar.`,'#eceff1','#37474f']:['✅','Buen tiempo para jugar fuera.','#e8f5e9','#1b5e20'];
    $('pdWx').dataset.ok=1;PDWX=Date.now();
    $('pdWx').innerHTML=`<div class="pdVer" style="background:${v[2]};color:${v[3]}">${v[0]} <span>${v[1]}</span></div><div class="pdWx">${I.map(i=>{const h=+H.time[i].slice(11,13);return `<div><small>${h} h</small><div style="font-size:20px">${wxIcon(H.weather_code[i],h)}</div><b>${Math.round(H.temperature_2m[i])}°</b><small>☔ ${H.precipitation_probability[i]||0}%</small><small>💨 ${Math.round(H.wind_gusts_10m[i]||0)}</small></div>`;}).join('')}</div>
      <div class="note" style="margin-top:4px">Próximas horas en ${donde} (lluvia y rachas de viento en km/h).</div>`;
  }catch(e){$('pdWx').innerHTML='<div class="note">No se ha podido mirar el tiempo ahora.</div>';}}

/* ---------- 🎾 Pistas ---------- */
function pdLista(){const q=N($('pdQ').value);let L=(window.PADEL.c||[]).filter(x=>(!PDF||(PDF==='cu'?x.cu>0:x.k===PDF))&&(!q||N(x.n+' '+x.p+' '+(x.d||'')+' '+(x.op||'')).includes(q)));
  if(PDYO&&MYPOS)L=L.map(x=>Object.assign(x,{dk:km(MYPOS.la,MYPOS.lo,x.pt[0],x.pt[1])})).sort((a,b)=>a.dk-b.dk);else L.forEach(x=>delete x.dk);
  return L;}
const pistasTxt=x=>x.pi?`${x.pi} pista${x.pi>1?'s':''}${x.cu?` (${x.cu===x.pi?(x.pi>1?'todas cubiertas':'cubierta'):x.cu+' cubierta'+(x.cu>1?'s':'')})`:''}`:'Pistas sin contar';
function pdPistas(){$('pdF').innerHTML=PD_F.map(([k,l])=>`<button class="${k===PDF?'on':''}" data-k="${k}">${l}</button>`).join('');
  $('pdF').querySelectorAll('button').forEach(b=>b.onclick=()=>{PDF=b.dataset.k;pdPistas();});
  if(!window.PADEL){$('pdL').innerHTML='<div class="card"><div class="note">Cargando…</div></div>';
    svLoad('padel.js','PADEL',ok=>{if(ok)pdPistas();else $('pdL').innerHTML='<div class="card"><div class="note">⏳ La lista de pistas llega con la próxima actualización de datos (se prepara sola en unas horas).</div></div>';});return;}
  const L=pdLista();window.__pdV=L;
  if(!PDM){PDM=NavMap('pdMap',(x,P)=>{(window.__pdV||[]).forEach(p=>{const [px,py]=P(p.pt[0],p.pt[1]);x.beginPath();x.arc(px,py,PDSEL===p?9:p.cu?6:4.5,0,7);x.fillStyle=p.k==='m'?'#2e7d32':'#1565c0';x.fill();x.strokeStyle='#fff';x.lineWidth=PDSEL===p?3:1.2;x.stroke();});},
    (px,py,M)=>{let best=null,bd=18;(window.__pdV||[]).forEach(p=>{const [x,y]=M.P(p.pt[0],p.pt[1]),d=Math.hypot(x-px,y-py);if(d<bd){bd=d;best=p;}});if(best){PDSEL=best;M.draw();pdFicha(best);}});
    setTimeout(()=>PDM.fit(41.9,43.3,-2.5,-0.7),30);}
  PDM.draw();
  const tot=L.reduce((s,x)=>s+x.pi,0);
  $('pdL').innerHTML=`<div class="card"><b>${L.length} <span>sitios</span> · ${tot} <span>pistas</span></b>${L.length?L.slice(0,120).map((p,i)=>`<div class="st" data-i="${i}" style="cursor:pointer"><div style="flex:1;min-width:0"><b>${E(p.n)}</b>${p.k==='m'?'<span class="pdTag" style="background:#2e7d32">Municipal</span>':''}${p.cu?'<span class="pdTag" style="background:#1565c0">Cubierta</span>':''}
     <div class="s">${[p.p,pistasTxt(p),p.dk!=null?fmtN(p.dk,p.dk<10?1:0)+' km':''].filter(Boolean).map(E).join(' · ')}</div></div><span>›</span></div>`).join(''):'<div class="note">No hay ninguno con ese nombre o pueblo.</div>'}
    ${L.length>120?'<div class="note">Busca un pueblo o usa «Cerca de mí» para ver más.</div>':''}</div>
   <div class="note" style="margin:0 6px 6px">Actualizado: ${E(window.PADEL.t)}.</div>`;
  $('pdL').querySelectorAll('[data-i]').forEach(d=>d.onclick=()=>{const p=L[+d.dataset.i];PDSEL=p;PDM.fit(p.pt[0]-.015,p.pt[0]+.015,p.pt[1]-.02,p.pt[1]+.02);pdFicha(p);});}
function pdFicha(p){const fila=(t,v)=>`<div class="st"><b>${t}</b><span style="text-align:right">${v}</span></div>`;
  $('pdFi').innerHTML=`<div class="card" style="border-color:${p.k==='m'?'#2e7d32':'#1565c0'}"><div class="row" style="justify-content:space-between;align-items:center"><b style="font-size:16px">🎾 ${E(p.n)}</b><button class="btn" id="pdX">✕</button></div>
   <div class="note">📍 ${E([p.d,p.p].filter(Boolean).join(', '))}</div>
   ${fila('🎾 Pistas',p.pi?p.pi:'Sin datos')}${p.pi?fila('🏠 Cubiertas',p.cu?p.cu:'No'):''}${p.luz?fila('💡 Con luz','Sí'):''}${fila('🏛️ Tipo',p.k==='m'?'Municipal / pública':'Club o centro deportivo')}
   ${p.op?fila('👥 Gestiona',E(p.op)):''}${p.h?fila('🕐 Horario',E(p.h)):''}
   <div class="row" style="flex-wrap:wrap"><button class="btn pri" id="pdGo">🧭 Cómo llegar</button>${p.tel?`<a class="btn" href="tel:${E(p.tel.replace(/\s/g,''))}">📞 Llamar</a>`:''}${p.w?'<button class="btn" id="pdW">🌐 Web / reservar</button>':''}<button class="btn" id="pdWx4">🌦️ El tiempo</button></div><div id="pdW4"></div>
   ${p.pi&&!p.cu?'<div class="note" style="margin-top:6px">☀️ Pistas al aire libre: mira el tiempo antes de ir.</div>':''}</div>`;
  $('pdX').onclick=()=>{$('pdFi').innerHTML='';PDSEL=null;PDM.draw();};
  $('pdGo').onclick=()=>abre(`https://www.google.com/maps/dir/?api=1&destination=${p.pt[0]},${p.pt[1]}`);
  if(p.w)$('pdW').onclick=()=>abre(p.w);
  $('pdWx4').onclick=async()=>{const j=await getJSON(`${OM}?latitude=${p.pt[0]}&longitude=${p.pt[1]}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_gusts_10m_max&forecast_days=4${TZ}`);if(!j||!j.daily)return;
    $('pdW4').innerHTML='<div class="row" style="margin-top:6px">'+j.daily.time.map((d,i)=>`<div style="flex:1;text-align:center"><div class="note">${i?new Date(d+'T12:00').toLocaleDateString(LOC,{weekday:'short'}):'Hoy'}</div><div style="font-size:24px">${wxIcon(j.daily.weather_code[i],12)}</div><b>${Math.round(j.daily.temperature_2m_max[i])}°</b><div class="note">☔ ${j.daily.precipitation_probability_max[i]}%</div><div class="note">💨 ${Math.round(j.daily.wind_gusts_10m_max[i])}</div></div>`).join('')+'</div>';};
  $('pdFi').scrollIntoView({behavior:'smooth',block:'nearest'});}

/* ---------- 🏆 Competición (partidos de pádel de Deporte navarro) ---------- */
async function pdComp(){const el=$('pdC');let G;try{G=await jsLoad(DP_PATH,DP_DEF);}catch(e){el.innerHTML='<div class="note">No se ha podido cargar la competición.</div>';return;}
  const hoy=hoyYmd(),P=(G.partidos||[]).filter(x=>x.dep==='padel'),asc=(a,b)=>(a.f+(a.h||'99')).localeCompare(b.f+(b.h||'99'));
  const prox=P.filter(x=>x.f>=hoy).sort(asc),res=P.filter(x=>x.f<hoy).sort((a,b)=>asc(b,a));
  const fila=x=>{const dt=new Date(x.f+'T12:00');return `<div class="pdM"><div class="d"><small>${dt.toLocaleDateString('es-ES',{weekday:'short'}).replace('.','')}</small><b>${dt.getDate()}</b><small>${dt.toLocaleDateString('es-ES',{month:'short'}).replace('.','')}</small></div>
    <div style="flex:1;min-width:0"><b>${E(x.loc)} – ${E(x.vis)}</b><div class="s">${E(x.comp||'')}${x.lugar?' · 📍 '+E(x.lugar):''}</div>${urlOk(x.url)?`<div class="s"><a href="#" data-u="${E(x.url)}">Más información ›</a></div>`:''}</div>
    <div class="r">${x.res?E(x.res):(x.h?E(x.h):'--:--')}</div></div>`;};
  el.innerHTML=`<b>🏆 <span>Pádel navarro por equipos</span></b><div class="note">Copa Reyno, Liga Comunidad Foral y campeonatos de clubes navarros.</div>
   <div style="margin-top:8px"><b>📅 <span>Próximos partidos</span></b>${prox.length?prox.slice(0,30).map(fila).join(''):'<div class="note">Todavía no hay partidos de pádel apuntados.</div>'}</div>
   <div style="margin-top:10px"><b>🏁 <span>Últimos resultados</span></b>${res.length?res.slice(0,20).map(fila).join(''):'<div class="note">Aún no hay resultados.</div>'}</div>
   ${TECH?'<div class="row" style="margin-top:8px"><button class="btn pri" id="pdAdd">➕ Añadir partido de pádel</button></div><div class="note">Se apunta en Deporte navarro con el deporte «🎾 Pádel». Después del partido, edítalo y pon el resultado (p. ej. 3-2).</div>':''}`;
  el.querySelectorAll('[data-u]').forEach(a=>a.onclick=e=>{e.preventDefault();abre(a.dataset.u);});
  if(TECH)$('pdAdd').onclick=()=>{pdIrDeporte();setTimeout(()=>{const a=$('dpAdm');if(a)a.scrollIntoView({behavior:'smooth'});},400);};}
function pdIrDeporte(){try{DPDEP='padel';DPCOMP='';}catch(e){}showTab('deporte');setTimeout(()=>{const b=document.querySelector('#dpDep button.on');if(b)b.scrollIntoView({inline:'center',block:'nearest'});},500);}

function pdRender(){pdTabs();pdTiempo();if(PDT==='pistas')pdPistas();else pdComp();}
$('pdQ').oninput=()=>window.PADEL&&pdPistas();
$('pdYo').onclick=async()=>{const b=$('pdYo');try{await myPos();PDYO=true;b.innerHTML='📍 <span>Ordenado por cercanía</span>';$('pdWx').dataset.ok='';pdTiempo();pdPistas();if(PDM)PDM.fit(MYPOS.la-.12,MYPOS.la+.12,MYPOS.lo-.16,MYPOS.lo+.16);}catch(e){toast(e.message);}};
$('pdFnp').onclick=()=>abre(FNP);
$('pdDep').onclick=pdIrDeporte;
$('pdBuz').onclick=e=>{e.preventDefault();showTab('buzon');};
svHook('padel',pdRender);
})();
