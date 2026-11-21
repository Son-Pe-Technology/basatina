/* =====================================================================
   ⏰ MAPA DEL TIEMPO POR HORAS (21 nov. 2026, petición de Pedro) — se carga el último
   Nueva pestaña «⏰ Horas» en el mapa del Inicio, junto a Hoy/Lluvia/Radar/Viento/Ríos.
   - Pide a Open‑Meteo la previsión por horas (hoy y mañana) de los mismos pueblos del mapa (TOWNS).
   - Debajo del mapa sale una tira de horas (Ahora, 16 h, 17 h…) y un botón ▶️ que las pasa solas.
   - Cada pueblo muestra el icono y la temperatura de la hora elegida.
   Cómo se dibuja: NO se toca mtDraw de index.html. Se envuelve: en la capa «horas» se le pasa por un
   momento al mapa normal («tiempo», Hoy) los datos de la hora elegida como si fueran los de «ahora»,
   y el icono de día/noche se calcula con esa hora. Así el mapa, los toques y los estilos son los mismos.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
if(!$('mtBar')||typeof mtDraw!=='function'||typeof TOWNS==='undefined')return;
const VAR='temperature_2m,weather_code,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m';
let HR=null,HRAT=0,HRI=0,PLAY=null,CARGA=null;

// botón en la barra del mapa (después de «Lluvia»)
const b=document.createElement('button');b.className='btn mtb';b.dataset.l='horas';b.textContent='⏰ Horas';
const ll=document.querySelector('.mtb[data-l="lluvia"]');(ll?ll:$('mtBar').lastElementChild).after(b);
b.onclick=e=>{e.stopPropagation();try{mtDayMenu(false);}catch(_){}hrStop();mtSetLayer('horas');};

// tira de horas debajo del mapa
const st=document.createElement('style');st.textContent=`
#mhBar{display:none;align-items:center;gap:6px;margin-top:6px}
#mhPlay{flex:none;width:38px;height:38px;border-radius:50%;border:0;background:#2f8fd8;color:#fff;font-size:16px;cursor:pointer}
#mhH{display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;padding:2px 0}#mhH::-webkit-scrollbar{display:none}
#mhH button{flex:none;border:1px solid var(--line);background:var(--panel);color:inherit;border-radius:12px;padding:4px 8px;font:inherit;font-size:12.5px;line-height:1.2;cursor:pointer;text-align:center}
#mhH button small{display:block;font-size:10.5px;opacity:.75}
#mhH button.on{background:#2f8fd8;color:#fff;border-color:#2f8fd8}
#mtBar{overflow:visible;gap:2px!important}#mtBar .mtb{padding:5px 4px!important;font-size:11.5px!important;letter-spacing:-.03em}
@media (max-width:370px){#mtBar .mtb{font-size:10.5px!important;padding:5px 3px!important}}`;document.head.appendChild(st);
$('mtWrap').insertAdjacentHTML('afterend','<div id="mhBar"><button id="mhPlay" aria-label="Pasar las horas">▶️</button><div id="mhH"></div></div>');
$('mhPlay').onclick=()=>PLAY?hrStop():hrPlay();

const hhmm=s=>s.slice(11,13)+' h';
const diaDe=s=>{const d=new Date(s.slice(0,10)+'T12:00'),h=new Date();h.setHours(12,0,0,0);const k=Math.round((d-h)/864e5);return k===0?'Hoy':k===1?'Mañana':(typeof dayName==='function'?dayName(k):'');};

async function hrLoad(){if(HR&&Date.now()-HRAT<30*60e3)return HR;if(CARGA)return CARGA;
  CARGA=(async()=>{try{
    const u=`${OM}?latitude=${TOWNS.map(t=>t[1]).join(',')}&longitude=${TOWNS.map(t=>t[2]).join(',')}&hourly=${VAR}&forecast_days=3${TZ}`;
    const j=await getJSON(u),A=j&&(Array.isArray(j)?j:[j]);
    if(A&&A[0]&&A[0].hourly){
      const T=A[0].hourly.time,now=new Date(),cur=(typeof ymd==='function'?ymd(now):now.toISOString().slice(0,10))+'T'+String(now.getHours()).padStart(2,'0');
      let i0=T.findIndex(t=>t.startsWith(cur));if(i0<0)i0=0;
      HR={time:T.slice(i0,i0+36),A:A.map(a=>a.hourly),i0};HRAT=Date.now();HRI=0;}
  }catch(e){}CARGA=null;return HR;})();return CARGA;}

function hrTira(){const el=$('mhH');if(!HR){el.innerHTML='<span class="note">Cargando la previsión por horas…</span>';return;}
  el.innerHTML=HR.time.map((t,k)=>`<button data-k="${k}" class="${k===HRI?'on':''}">${k===0?'Ahora':hhmm(t)}<small>${k===0?'':diaDe(t)}</small></button>`).join('');
  el.querySelectorAll('button').forEach(x=>x.onclick=()=>{hrStop();HRI=+x.dataset.k;hrPinta();});}
function hrMarca(){const el=$('mhH');el.querySelectorAll('button').forEach(x=>x.classList.toggle('on',+x.dataset.k===HRI));
  const on=el.querySelector('.on');if(on){const l=on.offsetLeft-el.clientWidth/2+on.clientWidth/2;el.scrollTo({left:l,behavior:'smooth'});}}
function hrPinta(){hrMarca();mtDraw();}
function hrPlay(){if(!HR)return;$('mhPlay').textContent='⏸️';if(HRI>=HR.time.length-1)HRI=0;
  PLAY=setInterval(()=>{if(MTL!=='horas'||!HR){hrStop();return;}HRI++;if(HRI>=HR.time.length){HRI=HR.time.length-1;hrStop();return;}hrPinta();},900);}
function hrStop(){if(PLAY){clearInterval(PLAY);PLAY=null;}const p=$('mhPlay');if(p)p.textContent='▶️';}

// envoltorio del dibujo del mapa
const _draw=mtDraw;
mtDraw=function(){const bar=$('mhBar');
  if(MTL!=='horas'){if(bar)bar.style.display='none';hrStop();return _draw.apply(this,arguments);}
  bar.style.display='flex';
  if(!HR||Date.now()-HRAT>30*60e3){if(!$('mhH').children.length||!HR)hrTira();hrLoad().then(()=>{hrTira();if(MTL==='horas')mtDraw();});if(!HR){const sv=MTL;MTL='tiempo';try{_draw.apply(this,arguments);}finally{MTL=sv;}return;}}
  const k=HRI,t=HR.time[k],hora=+t.slice(11,13),i=HR.i0+k;
  const falso=HR.A.map(h=>({current:{temperature_2m:h.temperature_2m[i],weather_code:h.weather_code[i],precipitation:h.precipitation[i],
      wind_speed_10m:h.wind_speed_10m[i],wind_direction_10m:h.wind_direction_10m[i],wind_gusts_10m:h.wind_gusts_10m[i]},daily:{}}));
  const sMT=MT,sL=MTL,sD=MTD,sW=window.wxIcon;
  MT=falso;MTL='tiempo';MTD=0;
  if(typeof sW==='function')wxIcon=(c,h)=>sW(c,hora);
  try{_draw.apply(this,arguments);}finally{MT=sMT;MTL=sL;MTD=sD;if(typeof sW==='function')wxIcon=sW;}
  const leg=$('mtLeg');if(leg){leg.style.display='';
    const llueve=falso.filter(m=>(m.current.precipitation||0)>=0.1).length;
    leg.innerHTML=`⏰ <b>${k===0?'Ahora':diaDe(t)+' a las '+t.slice(11,16)}</b>`+(llueve?` · 💧 lloverá en ${llueve} de ${falso.length} pueblos`:' · sin lluvia en los pueblos del mapa');}};
})();
