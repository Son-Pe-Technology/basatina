/* =====================================================================
   🌡️ EL TIEMPO · «AHORA» CON TARJETAS Y BARRAS (22 nov. 2026, propuesta C que eligió Pedro) — se carga el último
   - Pueblo y «El más cercano a mí» en una sola fila (el botón queda en «Cerca», verde).
   - Arriba, el icono del cielo, la temperatura grande y «estado · máx · mín».
   - Debajo, tarjetas de dos en dos, cada una con una barrita de color para verlo de un vistazo:
     lluvia hoy (probabilidad), próximas 3 h, sensación, humedad, viento, índice UV (escala de colores),
     calidad del aire y polen. Al final, una franja con el sol (salida–puesta) y la luna.
   - Iconos de línea en vez de emojis.
   No cambia de dónde salen los datos: usa lo mismo que ya pedía la pantalla (TW de Open‑Meteo y la
   calidad del aire de Copernicus CAMS, que se guarda al pedirla en window.TA_AQ).
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
if(!$('tNow')||typeof tiempoRender!=='function')return;
const V='#3d7031',M='#5b6660';
const st=document.createElement('style');st.textContent=`
#tNow .taHero{display:flex;align-items:center;gap:16px;padding:4px 2px}
#tNow .taHero .ic{font-size:56px;line-height:1;flex:none}
#tNow .taHero .t{font-family:Montserrat,sans-serif;font-weight:800;font-size:56px;line-height:1;color:#1d1d1d}
#tNow .taHero .d{font-size:15px;color:${M}}
.taG{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}
.taC{background:#fff;border:1px solid rgba(29,45,35,.07);border-radius:18px;padding:12px 14px;display:flex;flex-direction:column;gap:7px;min-width:0;box-shadow:0 1px 6px rgba(29,45,35,.06)}
.taL{display:flex;align-items:center;gap:6px;font-size:13px;color:${M};line-height:1.2}
.taL svg{color:${V};flex:none}
.taV{font-family:Montserrat,sans-serif;font-weight:800;font-size:22px;line-height:1.1;color:#1d1d1d}
.taS{font-size:12px;color:${M};line-height:1.3}
.taB{height:8px;border-radius:4px;background:#e8ede6;overflow:hidden}.taB>i{display:block;height:100%;border-radius:4px}
.taUV{position:relative;height:8px;border-radius:4px;background:linear-gradient(90deg,#4caf50,#ffeb3b,#ff9800,#e53935,#8e24aa)}
.taUV>i{position:absolute;top:-3px;width:14px;height:14px;margin-left:-7px;border-radius:7px;background:#fff;border:2px solid #1d1d1d;box-sizing:border-box}
.taSL{display:flex;gap:10px;margin-top:10px;background:#fff;border:1px solid rgba(29,45,35,.07);border-radius:18px;padding:12px 14px;box-shadow:0 1px 6px rgba(29,45,35,.06)}
.taSL>div{flex:1 1 0;display:flex;align-items:center;gap:8px;min-width:0}
.taSL b{font-weight:800;font-size:15px;color:#1d1d1d;display:block}.taSL span{font-size:12px;color:${M}}
.taFila{display:flex;gap:8px;align-items:center}
.taFila>select{flex:1 1 auto;min-width:0;margin:0!important}
.taFila>#tNear{flex:none;width:auto!important;margin:0!important;display:inline-flex;align-items:center;gap:6px;background:${V}!important;color:#fff!important;border:none!important;border-radius:23px!important;padding:0 16px!important;height:46px;font-weight:700}`;
document.head.appendChild(st);
const P={gota:'<path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z"/>',paraguas:'<path d="M3 12a9 9 0 0 1 18 0zM12 12v7a2 2 0 0 0 4 0"/>',
 reloj:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',humedad:'<path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z"/><path d="M9 15h6"/>',
 viento:'<path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h8"/>',aire:'<path d="M5 19c8 0 14-5 14-14-9 0-14 6-14 14zM5 19l7-7"/>',
 sol:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
 flor:'<circle cx="12" cy="12" r="2.5"/><path d="M12 9.5a3 3 0 1 1 0-6 3 3 0 1 1 0 6zM12 14.5a3 3 0 1 0 0 6 3 3 0 1 0 0-6zM9.5 12a3 3 0 1 1-6 0 3 3 0 1 1 6 0zM14.5 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0z"/>',
 amanecer:'<path d="M4 18h16M7 18a5 5 0 0 1 10 0M12 6v3M5 11l1.5 1.5M19 11l-1.5 1.5M9 4l3-2 3 2"/>',luna:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
 termo:'<path d="M10 4a2 2 0 0 1 4 0v10a4 4 0 1 1-4 0z"/>',gps:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>'};
const ic=(n,s,c)=>`<svg width="${s||16}" height="${s||16}" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="${c||'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${P[n]}</g></svg>`;
const E=s=>typeof esc==='function'?esc(s):String(s);
const pc=v=>Math.max(0,Math.min(100,v));
const barra=(p,c)=>`<div class="taB"><i style="width:${pc(p)}%;background:${c}"></i></div>`;
const tarjeta=(i,l,v,ex,s)=>`<div class="taC"><span class="taL">${ic(i)}<span>${l}</span></span><span class="taV">${v}</span>${ex||''}${s?`<span class="taS">${s}</span>`:''}</div>`;

// 1 · pueblo y «cerca» en la misma fila
(function(){const s=$('tTown'),b=$('tNear');if(!s||!b||s.parentNode.classList.contains('taFila'))return;
  const f=document.createElement('div');f.className='taFila';s.parentNode.insertBefore(f,s);f.appendChild(s);f.appendChild(b);
  b.setAttribute('aria-label','El más cercano a mí');b.innerHTML=ic('gps',18)+'<span>Cerca</span>';})();

// 2 · arriba (temperatura) y primeras tarjetas, con los datos de tiempoRender
function taNow(){if(typeof TW==='undefined'||!TW)return;const {j,town}=TW,c=j.current,h=j.hourly,d=j.daily,n=new Date(),today=ymd(n),hh=n.getHours();
  let fell=0,rest=0;h.time.forEach((x,i)=>{if(x.slice(0,10)!==today)return;if(+x.slice(11,13)<=hh)fell+=h.precipitation[i]||0;else rest+=h.precipitation[i]||0;});
  const di=d.time.indexOf(today),pr=di>=0?d.precipitation_probability_max[di]:null;
  const i0=h.time.indexOf(today+'T'+String(hh).padStart(2,'0')+':00'),p3a=i0<0?[]:h.precipitation_probability.slice(i0+1,i0+4).filter(v=>v!=null),p3=p3a.length?Math.max(...p3a):null;
  const t=Math.round(c.temperature_2m),sen=Math.round(c.apparent_temperature),dif=t-sen;
  const hum=c.relative_humidity_2m;
  $('tNow').innerHTML=`<div class="taHero"><div class="ic">${wxIcon(c.weather_code,hh)}</div>
    <div><div class="t">${t}°</div><div class="d"><span>${wDesc(c.weather_code)}</span> · ${E(town)}${di>=0?` · <span>máx</span> ${Math.round(d.temperature_2m_max[di])}° · <span>mín</span> ${Math.round(d.temperature_2m_min[di])}°`:''}</div></div></div>
   <div class="taG">
    ${tarjeta('paraguas','Lluvia hoy',pr!=null?pr+' %':'—',barra(pr||0,'#1e88e5'),`${fmtN(fell,1)} mm <span>caídos</span> · ${fmtN(rest,1)} mm <span>más</span>`)}
    ${tarjeta('reloj','Próximas 3 horas',p3!=null?p3+' %':'—',barra(p3||0,'#1e88e5'),'<span>probabilidad de lluvia</span>')}
    ${tarjeta('termo','Sensación',sen+'°',barra((sen+10)/50*100,'#ff9800'),dif>0?`${dif}° <span>menos que el aire</span>`:dif<0?`${-dif}° <span>más que el aire</span>`:'<span>igual que el aire</span>')}
    ${tarjeta('humedad','Humedad',hum+' %',barra(hum,'#26a69a'))}
   </div>`;}
const _tr=tiempoRender;tiempoRender=function(){const r=_tr.apply(this,arguments);try{taNow();}catch(e){}return r;};

// 3 · aire, UV, polen, sol y luna (con la calidad del aire que pide extraRender)
const _gj=getJSON;getJSON=async function(u){const r=await _gj.apply(this,arguments);try{if(/air-quality-api/.test(u)&&/european_aqi/.test(u))window.TA_AQ=r;}catch(e){}return r;};
function taExtra(){const el=$('tExtra');if(!el)return;const q=window.TA_AQ,d=TW&&TW.j.daily,today=ymd(new Date()),di=d?d.time.indexOf(today):-1,hm=s=>s?s.slice(11,16):'—',m=moon(new Date());
  let g='';
  // el viento va aquí para que las dos rejillas tengan 4 tarjetas cada una (sin huecos)
  try{const c=TW.j.current,vi=Math.round(c.wind_speed_10m),ra=Math.round(c.wind_gusts_10m);
    g+=tarjeta('viento','Viento',vi+' km/h',barra(ra,'#78909c'),`<span>rachas de</span> ${ra} km/h`);}catch(e){}
  if(q&&q.current){const c=q.current,aqi=c.european_aqi,aq=aqi==null?['—','#9e9e9e']:aqi<=20?['Muy buena','#2e7d32']:aqi<=40?['Buena','#7cb342']:aqi<=60?['Moderada','#f9a825']:aqi<=80?['Mala','#ef6c00']:['Muy mala','#c62828'];
    const uv=Math.round((q.daily&&q.daily.uv_index_max&&q.daily.uv_index_max[0])??c.uv_index??0),uvt=uv<=2?'bajo':uv<=5?'moderado':uv<=7?'alto':uv<=10?'muy alto':'extremo';
    const P=[['Gramíneas',c.grass_pollen],['Olivo',c.olive_pollen],['Abedul',c.birch_pollen],['Aliso',c.alder_pollen],['Artemisa',c.mugwort_pollen],['Ambrosía',c.ragweed_pollen]].filter(x=>x[1]!=null);
    const mx=P.length?Math.max(...P.map(x=>x[1])):0,lv=v=>v<1?'Muy bajo':v<10?'Bajo':v<50?'Moderado':v<200?'Alto':'Muy alto',alto=P.filter(x=>x[1]>=10);
    g+=tarjeta('sol','Índice UV',`${uv} · <span>${uvt}</span>`,`<div class="taUV"><i style="left:${pc(uv/11*100)}%"></i></div>`,uv>=6?'<span>usa protección</span>':'');
    g+=tarjeta('aire','Calidad del aire',`<span style="color:${aq[1]}">${aq[0]}</span>`,barra(aqi==null?0:aqi,aq[1]),`<span>índice europeo</span> ${aqi??'—'}`);
    g+=tarjeta('flor','Polen',`<span>${lv(mx)}</span>`,barra(mx<1?2:mx/200*100,'#f9a825'),alto.length?alto.map(x=>`<span>${x[0]}</span>`).join(' · '):'<span>fuera de temporada o muy poco</span>');}
  else g+=`<div class="taC"><span class="taS">No se pudo leer la calidad del aire ahora.</span></div>`;
  el.innerHTML=`<div class="taG" style="margin-top:10px">${g}</div>
   <div class="taSL"><div>${ic('amanecer',22,'#f5a623')}<div><b>${di>=0?hm(d.sunrise[di])+' – '+hm(d.sunset[di]):'—'}</b><span>salida – puesta</span></div></div>
    <div>${ic('luna',22,'#f5a623')}<div><b>${E(m.n)} · ${m.ill} %</b><span><span>llena en</span> ${Math.round(m.full)} d · <span>nueva en</span> ${Math.round(m.nw)} d</span></div></div></div>`;}
const _er=extraRender;extraRender=async function(){const r=await _er.apply(this,arguments);try{taExtra();}catch(e){}return r;};
// si la pantalla ya estaba pintada al cargar este archivo
try{if(TW){taNow();if(window.TA_AQ)taExtra();}}catch(e){}
try{Object.assign(I18N.eu,{'Cerca':'Hurbil','Lluvia hoy':'Euria gaur','Próximas 3 horas':'Hurrengo 3 orduak','Sensación':'Sentsazioa','Humedad':'Hezetasuna','Viento':'Haizea','Índice UV':'UV indizea','Calidad del aire':'Airearen kalitatea','Polen':'Polena','caídos':'eroriak','más':'gehiago','menos que el aire':'aireak baino gutxiago','más que el aire':'aireak baino gehiago','igual que el aire':'airearen berdina','rachas de':'boladak','fuera de temporada o muy poco':'denboraldiz kanpo edo oso gutxi','Muy bajo':'Oso baxua','Bajo':'Baxua','Moderado':'Moderatua','Alto':'Altua','Muy alto':'Oso altua','llena en':'betea','nueva en':'berria','usa protección':'erabili babesa','máx':'max.','mín':'min.'});
  Object.assign(I18N.en,{'Cerca':'Near me','Lluvia hoy':'Rain today','Próximas 3 horas':'Next 3 hours','Sensación':'Feels like','Humedad':'Humidity','Viento':'Wind','Índice UV':'UV index','Calidad del aire':'Air quality','Polen':'Pollen','caídos':'fallen','más':'more','menos que el aire':'below air temp','más que el aire':'above air temp','igual que el aire':'same as air','rachas de':'gusts of','fuera de temporada o muy poco':'off season or very little','Muy bajo':'Very low','Bajo':'Low','Moderado':'Moderate','Alto':'High','Muy alto':'Very high','llena en':'full in','nueva en':'new in','usa protección':'use protection','máx':'max','mín':'min'});
  Object.assign(I18N.fr,{'Cerca':'Près de moi','Lluvia hoy':'Pluie aujourd’hui','Próximas 3 horas':'3 prochaines heures','Sensación':'Ressenti','Humedad':'Humidité','Viento':'Vent','Índice UV':'Indice UV','Calidad del aire':'Qualité de l’air','Polen':'Pollen','caídos':'tombés','más':'de plus','menos que el aire':'de moins que l’air','más que el aire':'de plus que l’air','igual que el aire':'comme l’air','rachas de':'rafales de','fuera de temporada o muy poco':'hors saison ou très peu','Muy bajo':'Très faible','Bajo':'Faible','Moderado':'Modéré','Alto':'Élevé','Muy alto':'Très élevé','llena en':'pleine dans','nueva en':'nouvelle dans','usa protección':'protège-toi','máx':'max','mín':'min'});}catch(e){}
})();
