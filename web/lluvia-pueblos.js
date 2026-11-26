/* =====================================================================
   🌧️ LLUVIA DE LAS PRÓXIMAS HORAS, CUARTO A CUARTO (26 nov. 2026, lo pidió Pedro) — se carga el último
   En El tiempo, debajo de «ahora», una tarjeta con:
     - una frase clara: «Empieza a llover hacia las 21:15 (débil)», «Está lloviendo; para hacia las 22:30»…
     - 16 barritas (próximas 4 horas, de 15 en 15 minutos) para el pueblo elegido o para donde estás;
     - «¿Dónde va a llover en la próxima hora?»: los sitios de Navarra donde empieza, ordenados por hora.
   Los datos los prepara cada hora el robot tools/lluvia_pueblos.py (lluvia.yml) con Open-Meteo y los deja en la
   rama «lluvia» (lluvia.json, ~260 puntos). Si ese archivo tiene más de 3 horas, el móvil pide a Open-Meteo
   solo su punto (gratis). Es una previsión de modelo, orientativa.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
if(!$('tNow')||typeof tiempoRender!=='function')return;
const URL_J='https://raw.githubusercontent.com/Son-Pe-Technology/basatina/lluvia/lluvia.json';
let J=null,JT=0,AQUI=null; // AQUI: {la,lo} si el usuario ha pedido «donde estoy»
// textos en euskera, inglés y francés
try{const T={
 'Lluvia en las próximas 4 horas':['Euria hurrengo 4 orduetan','Rain in the next 4 hours','Pluie dans les 4 prochaines heures'],
 'No se espera lluvia en las próximas 4 horas':['Ez da euririk espero hurrengo 4 orduetan','No rain expected in the next 4 hours','Pas de pluie prévue dans les 4 prochaines heures'],
 'Está lloviendo':['Euria ari du','It is raining','Il pleut'],
 'Empieza a llover hacia las':['Euria hasiko da','Rain starts around','La pluie commence vers'],
 'para hacia las':['aterkia','stops around','s’arrête vers'],
 'sigue al menos 4 horas':['gutxienez 4 orduz jarraituko du','keeps going for at least 4 hours','continue au moins 4 heures'],
 'débil':['ahula','light','faible'],'moderada':['moderatua','moderate','modérée'],'fuerte':['gogorra','heavy','forte'],'muy fuerte':['oso gogorra','very heavy','très forte'],
 'nieve':['elurra','snow','neige'],
 'Donde estoy':['Non nago','Where I am','Où je suis'],
 '¿Dónde va a llover en la próxima hora?':['Non egingo du euria hurrengo orduan?','Where will it rain in the next hour?','Où va-t-il pleuvoir dans l’heure ?'],
 'Sin lluvia prevista en Navarra en la próxima hora':['Ez da euririk espero Nafarroan hurrengo orduan','No rain expected in Navarre in the next hour','Pas de pluie prévue en Navarre dans l’heure'],
 'Previsión de modelo (Open-Meteo), orientativa. Ante el riesgo, haz caso a los avisos oficiales.':['Ereduaren iragarpena (Open-Meteo), gutxi gorabeherakoa. Arriskuaren aurrean, kasu egin abisu ofizialei.','Model forecast (Open-Meteo), for guidance only. When in danger, follow official warnings.','Prévision de modèle (Open-Meteo), indicative. En cas de risque, suivez les alertes officielles.'],
 'ahora':['orain','now','maintenant'],'y':['eta','and','et'],'más':['gehiago','more','de plus']};
 const I=window.I18N||{};['eu','en','fr'].forEach((l,k)=>{if(!I[l])return;for(const s in T)if(!(s in I[l]))I[l][s]=T[s][k];});}catch(e){}

const st=document.createElement('style');st.textContent=`
#lpBox{margin-top:12px;background:#fff;border:1px solid rgba(29,45,35,.07);border-radius:18px;padding:12px 14px;box-shadow:0 1px 6px rgba(29,45,35,.06)}
#lpBox .lpT{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;color:#5b6660}
#lpBox .lpT button{border:0;background:#e8f2e4;color:#3d7031;border-radius:14px;padding:5px 10px;font-weight:700;font-size:12px}
#lpBox .lpF{font-family:Montserrat,sans-serif;font-weight:800;font-size:18px;line-height:1.25;color:#1d1d1d;margin:6px 0 8px}
#lpBox .lpG{display:flex;align-items:flex-end;gap:3px;height:70px;border-bottom:1px solid #dfe5dc}
#lpBox .lpG>i{flex:1 1 0;border-radius:3px 3px 0 0;min-height:2px;background:#e8ede6}
#lpBox .lpH{display:flex;font-size:11px;color:#5b6660;margin-top:3px}#lpBox .lpH>span{flex:4 1 0}
#lpBox .lpL{margin-top:12px;border-top:1px solid #eef1ec;padding-top:10px}
#lpBox .lpL b{display:block;font-size:14px;margin-bottom:6px}
#lpBox .lpL div{display:flex;justify-content:space-between;gap:8px;font-size:13px;padding:3px 0}
#lpBox .lpL div span:last-child{color:#5b6660;white-space:nowrap}
#lpBox .note{margin-top:8px}`;
document.head.appendChild(st);

const hm=d=>d.toTimeString().slice(0,5);
const tipo=mmh=>mmh<=2?'débil':mmh<=15?'moderada':mmh<=30?'fuerte':'muy fuerte';
const col=mmh=>mmh<0.2?'#e8ede6':mmh<=2?'#7fb3e8':mmh<=15?'#1e6fd9':mmh<=30?'#f2a43a':'#d93025';
const dist=(a,b,c,d)=>Math.hypot((d-b)*Math.cos(a*Math.PI/180),c-a);

async function carga(){if(J&&Date.now()-JT<10*60e3)return J;
  try{const r=await fetch(URL_J+'?t='+Math.floor(Date.now()/600000));if(r.ok){J=await r.json();JT=Date.now();}}catch(e){}
  return J;}
// serie de un sitio: [{t:Date, mm:mm por cuarto, sn}] desde el cuarto de hora actual
async function serie(la,lo){const j=await carga(),ahora=Date.now();
  if(j&&j.p&&j.p.length&&ahora/1000-j.gen<3*3600){let b=null,bd=1e9;for(const p of j.p){const d=dist(la,lo,p[1],p[2]);if(d<bd){bd=d;b=p;}}
    if(b){const t0=new Date(j.t0).getTime();return b[3].map((v,i)=>({t:new Date(t0+i*900e3),mm:v/100,sn:!!b[4]})).filter(x=>x.t.getTime()>ahora-900e3);}}
  // archivo viejo o sin él: lo pide el móvil (solo su punto)
  try{const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&minutely_15=precipitation,snowfall&forecast_minutely_15=20&timezone=Europe%2FMadrid`);
    const d=await r.json(),m=d.minutely_15;return m.time.map((t,i)=>({t:new Date(t),mm:m.precipitation[i]||0,sn:(m.snowfall[i]||0)>0})).filter(x=>x.t.getTime()>ahora-900e3);}catch(e){return null;}}
// la frase: de los 16 cuartos que vienen
function frase(S){const s=S.slice(0,16),ll=x=>x.mm*4>=0.2;
  const sp=t=>`<span>${t}</span>`,nv=x=>x.sn?` · ${sp('nieve')}`:'';
  if(!s.length)return '';
  if(ll(s[0])){const fin=s.findIndex(x=>!ll(x)),mx=Math.max(...s.slice(0,fin<0?16:fin).map(x=>x.mm*4));
    return `${sp('Está lloviendo')} (${sp(tipo(mx))}${nv(s[0])}); `+(fin<0?sp('sigue al menos 4 horas'):`${sp('para hacia las')} ${hm(s[fin].t)}`);}
  const i=s.findIndex(ll);if(i<0)return sp('No se espera lluvia en las próximas 4 horas');
  const f2=s.findIndex((x,k)=>k>i&&!ll(x)),mx=Math.max(...s.slice(i,f2<0?16:f2).map(x=>x.mm*4));
  return `${sp('Empieza a llover hacia las')} ${hm(s[i].t)} (${sp(tipo(mx))}${nv(s[i])})`;}
function barras(S){const s=S.slice(0,16),mx=Math.max(2,...s.map(x=>x.mm*4));
  return `<div class="lpG">${s.map(x=>{const v=x.mm*4;return `<i style="height:${v<0.2?2:Math.max(6,Math.round(v/mx*100))}%;background:${col(v)}" title="${hm(x.t)} · ${v.toFixed(1).replace('.',',')} mm/h"></i>`;}).join('')}</div>
  <div class="lpH">${[0,4,8,12].map(k=>`<span>${s[k]?(k?hm(s[k].t):'<span>ahora</span>'):''}</span>`).join('')}</div>`;}
// ¿dónde empieza a llover en la próxima hora?
function lista(){const j=J;if(!j||!j.p||Date.now()/1000-j.gen>3*3600)return '';const t0=new Date(j.t0).getTime(),ahora=Date.now();
  const k0=Math.max(0,Math.floor((ahora-t0)/900e3)),L=[];
  for(const p of j.p){for(let k=k0;k<k0+4&&k<p[3].length;k++){const v=p[3][k]/100*4;if(v>=0.4){
        const mx=Math.max(...p[3].slice(k,k0+4).map(x=>x/100*4));L.push({n:p[0].split(' / ')[0],t:new Date(t0+k*900e3),mx,ya:k===k0,sn:!!p[4]});break;}}}
  if(!L.length)return `<div class="lpL"><b>${'<span>¿Dónde va a llover en la próxima hora?</span>'}</b><div><span><span>Sin lluvia prevista en Navarra en la próxima hora</span></span></div></div>`;
  L.sort((a,b)=>a.t-b.t||b.mx-a.mx);
  const v=L.slice(0,12).map(x=>`<div><span>${x.n}${x.sn?' ❄️':''}</span><span>${x.ya?'<span>ahora</span>':hm(x.t)} · <span>${tipo(x.mx)}</span></span></div>`).join('');
  return `<div class="lpL"><b><span>¿Dónde va a llover en la próxima hora?</span></b>${v}${L.length>12?`<div><span>… <span>y</span> ${L.length-12} <span>más</span></span><span></span></div>`:''}</div>`;}

async function pinta(){let box=$('lpBox');
  if(!box){box=document.createElement('div');box.id='lpBox';const ex=$('tExtra');ex?ex.parentNode.insertBefore(box,ex):$('tNow').after(box);}
  let la,lo,nom;if(AQUI){la=AQUI.la;lo=AQUI.lo;nom='📍 <span>Donde estoy</span>';}
  else{const t=(typeof TOWNS!=='undefined'&&TOWNS[TOWN])||['Pamplona',42.8125,-1.6458];la=t[1];lo=t[2];nom=t[0];}
  const S=await serie(la,lo);
  if(!S||!S.length){box.style.display='none';return;}box.style.display='';
  box.innerHTML=`<div class="lpT"><span>🌧️ <span>Lluvia en las próximas 4 horas</span> · ${nom}</span><button id="lpYo">📍 <span>Donde estoy</span></button></div>
    <div class="lpF">${frase(S)}</div>${barras(S)}${lista()}
    <div class="note"><span>Previsión de modelo (Open-Meteo), orientativa. Ante el riesgo, haz caso a los avisos oficiales.</span></div>`;
  const yb=box.querySelector&&box.querySelector('#lpYo');if(yb)yb.onclick=async()=>{try{const p=await myPos();AQUI={la:p.la,lo:p.lo};pinta();}catch(e){toast&&toast(e.message);}};
}
window.lpPinta=pinta;
// se pinta cada vez que se pinta El tiempo (al cambiar de pueblo vuelve al pueblo elegido)
let ultT=null;
const _tr=tiempoRender;tiempoRender=function(){const r=_tr.apply(this,arguments);if(TOWN!==ultT){ultT=TOWN;AQUI=null;}pinta().catch(()=>{});return r;};
setInterval(()=>{const s=$('t-tiempo');if(s&&s.classList.contains('on'))pinta().catch(()=>{});},15*60e3);
try{if(typeof TW!=='undefined'&&TW)pinta();}catch(e){}
})();
