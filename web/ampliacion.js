/* =====================================================================
   🚀 AMPLIACIÓN (15 nov. 2026) — lista de cambios de Sonia y Pedro
   Se carga el último (después de comunidad.js). No reescribe nada: envuelve funciones y añade pantallas.
   1. Menú: «Cuadrilla BasatiNA · únete», «Alertas ciudadanas», «NA a Pie», «Mi calendario», Recolección en
      Vida silvestre, Turismo dentro de Localidades, cada grupo con su color, los grupos se cierran solos.
   2. El tiempo: barómetro antiguo con reloj digital de presión (20 nov. 2026: sustituye al reloj de la tarjeta de presión)
      y pronóstico por horas (además de la gráfica).
   3. Mapas: fondo del IGN en teselas (se guardan en el móvil y cargan mucho más rápido).
   4. NA Sísmica: pestaña de fallas con ficha, flechas de movimiento y simulador de intensidad (escala EMS-98).
   5. NA Salud: centros de salud, consultorios, hospitales y urgencias (web/territorio.js).
   6. Carreteras: el tiempo que puede afectar a las carreteras en los próximos 3 días.
   7. Mi Espacio: «Mis carreteras» (antes en Ajustes) con sus incidencias de ahora.
   8. Cuadrilla: refranes de cada pueblo; correos participa@basatina.es y alertas@basatina.es.
   Ríos → web/rios-plus.js · Ocio y Localidades → web/ocio-ui.js
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const dr=$('drawer');
const N=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const abre=u=>{if(APP&&window.AndroidNet&&window.AndroidNet.openUrl)window.AndroidNet.openUrl(u);else window.open(u,'_blank');};
window.amAbre=abre;
const grupo=k=>[...dr.querySelectorAll('.dgroup')].find(g=>N(g.querySelector('span')?.dataset.k||g.textContent)===N(k));
const btn=t=>dr.querySelector(`button[data-t="${t}"]`);
const setLabel=(t,txt)=>{const b=btn(t);if(!b)return;b.dataset.txt=txt.replace(/^\S+\s/,'');const s=[...b.querySelectorAll(':scope>span')].pop();
  if(s&&!s.classList.contains('bt'))s.textContent=b.dataset.txt;else b.textContent=txt;if(b.dataset.emo!==undefined)b.dataset.emo=txt.split(' ')[0]+' ';};
function title(t,txt){try{TITLES[t]=txt;}catch(e){}}

/* ---------- 1. MENÚ ---------- */
// al abrir un grupo se cierran los demás (también los que se añadieron después: Servicios, NA Salud…)
dr.addEventListener('click',e=>{const g=e.target.closest('.dgroup');if(!g)return;
  setTimeout(()=>{if(g.classList.contains('open'))dr.querySelectorAll('.dgroup.open').forEach(x=>{if(x!==g)x.classList.remove('open');});},0);},true);

// Participa → «Cuadrilla BasatiNA» con «únete» debajo (data-k sigue siendo «Participa» para que el código lo encuentre)
(function(){const g=grupo('Participa');if(!g)return;const s=g.querySelector('span[data-k]');if(!s)return;
  [...s.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).forEach(n=>n.remove());
  s.insertAdjacentHTML('beforeend','<span class="amCua"><span>Cuadrilla BasatiNA</span><small>únete</small></span>');})();

// renombrar
setLabel('comunidad','📣 Alertas ciudadanas');title('comunidad','📣 Alertas ciudadanas');
setLabel('fotos','🖼️ Fotos y reto del mes');title('fotos','🖼️ Fotos');
setLabel('monte','🥾 NA a Pie: rutas, cuevas, baño…');title('monte','🥾 NA a Pie');
setLabel('misdep','⭐ Mi calendario');title('misdep','⭐ Mi calendario');
try{BNL.monte='NA a Pie';BNL.fotos='Fotos';}catch(e){}
// Recolección pasa a Vida silvestre
(function(){const b=btn('natura'),vs=grupo('Vida silvestre');if(b&&vs&&vs.nextElementSibling)vs.nextElementSibling.appendChild(b);})();
// Turismo se une a Localidades
(function(){const tu=grupo('Turismo'),lo=grupo('Localidades');if(!tu||!lo)return;const sub=tu.nextElementSibling,dst=lo.nextElementSibling;
  if(sub&&dst)[...sub.querySelectorAll('button')].forEach(b=>dst.appendChild(b));if(sub)sub.remove();tu.remove();})();
// «Mapa de riadas» ya está dentro de «Datos históricos»
(function(){const b=btn('libre');if(b)b.style.display='none';})();

// cada grupo con su color (y sus botones con el mismo tono)
const GCOL={'El tiempo':['#4fb3f6','#1565c0'],'Ríos':['#26c6da','#00697a'],'Vida silvestre':['#7ccf5f','#2e6b1f'],'Carreteras':['#ffa04d','#d35400'],
  'Localidades':['#d9a066','#8d5524'],'Servicios':['#7986cb','#303f9f'],'NA Salud':['#ff7a7a','#c62828'],'NA Sostenible':['#c5e15a','#689f38'],
  'NA sísmica':['#a1887f','#4e342e'],'Qué hacer':['#ffd54f','#e09b00'],'Mi Espacio':['#f48fb1','#ad1457'],'Participa':['#ce93d8','#7b1fa2'],
  'Configuración':['#b0bec5','#546e7a'],'Administrador':['#90a4ae','#37474f']};
(function(){let css='';Object.entries(GCOL).forEach(([k,[a,b]])=>{const sel=`#drawer .dgroup span[data-k="${k}"] .bt`,sub=`#drawer .dgroup:has(span[data-k="${k}"])+.dsub .bt`;
    css+=`body.bna ${sel},body.bna ${sub}{background:linear-gradient(150deg,${a} 0%,${b} 100%)!important;--sh:${b}88}`;
    css+=`body:not(.bna) #drawer .dgroup span[data-k="${k}"]{color:${b}}`;});
  css+=`.amCua{display:inline-flex!important;flex-direction:column!important;align-items:flex-start!important;gap:0!important;line-height:1.1}.amCua>span{display:inline!important;gap:0!important}.amCua .na{display:inline!important;margin:0!important;position:static!important}.amCua small{font-size:11px;font-weight:600;text-transform:none;letter-spacing:0;opacity:.75;color:var(--acc)}
  body.bna #bnaDGrid>.dgroup span .amCua small{color:#7b1fa2}
  .amSeg{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}.amSeg .btn{flex:1 1 auto;min-width:0;white-space:nowrap}
  .amRow{display:flex;gap:10px;align-items:center;padding:7px 0;border-top:1px solid var(--line)}.amRow:first-child{border-top:0}
  .amPill{display:inline-block;padding:1px 8px;border-radius:10px;font-size:12px;font-weight:700;color:#fff}
  .amMap{width:100%;height:340px;border-radius:12px;display:block;touch-action:none;background:#dfe6ec}
  .amHr{display:grid;grid-template-columns:44px 34px 1fr auto;gap:6px;align-items:center;padding:6px 0;border-top:1px solid var(--line);font-size:14px}
  .amHr .t{font-weight:800;font-size:16px;text-align:right}.amDay{margin:10px 0 2px;font-weight:800;text-transform:capitalize;color:var(--acc)}
  `;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);})();

// iconos nuevos
try{Object.assign(BNI,{
 'i-cine':'<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="9" width="24" height="17" rx="3" fill="currentColor" fill-opacity=".12"/><path d="M4 14h24M9 9l3 5M15 9l3 5M21 9l3 5"/><path d="M6 6l20-3"/></g>',
 'i-moto':'<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="22" r="4.5"/><circle cx="24" cy="22" r="4.5"/><path d="M8 22l6-8h7l3 8M14 14l-3-4H7M19 10h4l1 4"/></g>',
 'i-bici':'<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="5"/><circle cx="24" cy="21" r="5"/><path d="M8 21l5-9h8l3 9M13 12l-2-4H8M16 21l5-9"/></g>',
 'i-picnic':'<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 14h22l-2 4H7z" fill="currentColor" fill-opacity=".14"/><path d="M9 18l-3 9M23 18l3 9M3 22h26M16 4v6M12 7h8"/></g>',
 'i-hosp':'<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="6" width="22" height="21" rx="3" fill="currentColor" fill-opacity=".12"/><path d="M16 11v10M11 16h10"/></g>',
 'i-refran':'<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h20a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H14l-6 5v-5H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" fill="currentColor" fill-opacity=".12"/><path d="M10 13h3M10 17h3M18 13h4M18 17h4"/></g>',
 'i-vias3':'<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 28l3-18M22 28l-3-18M16 13v3M16 20v3"/><path d="M8 8a4 4 0 0 1 8-1 3 3 0 1 1 3 5H9a2.5 2.5 0 0 1-1-4z" fill="currentColor" fill-opacity=".14"/></g>'});}catch(e){}
function nuevo(t,grupoK,label,scene,ic,fam,first){svBtn(svDsub(grupoK),t,label,first);title(t,label);try{PVS_ESC[t]=scene;}catch(e){}
  try{if(ic){BNK[t]=ic;BNF[t]=fam||'g';}if(!ICK[t]){ICK[t]='map-pin';ICC[t]={g:'#2e7d32',b:'#1565c0',r:'#e53935'}[fam||'g'];}BNL[t]=label.replace(/^\S+\s/,'').split(':')[0];}catch(e){}
  try{if(typeof applyIcons==='function')applyIcons((CFG.iconos||'pro')==='pro');}catch(e){}}
window.amNuevo=nuevo;

/* ---------- 2. EL TIEMPO ---------- */
// 2a · barómetro antiguo (aguja negra = ahora; aguja dorada = hace 3 horas, como la «aguja de referencia» de los barómetros de pared)
const BARO_S=[[950,970,'Tempestad','⛈️','#3949ab'],[970,990,'Lluvia','🌧️','#1e88e5'],[990,1010,'Variable','⛅','#78909c'],[1010,1030,'Buen tiempo','☀️','#f9a825'],[1030,1050,'Muy seco','🌵','#ef6c00']];
const baroSec=p=>BARO_S.find(x=>p<x[1])||BARO_S[4];
// barómetro de esfera: semicírculo con 5 zonas de color y la aguja (negra = ahora, dorada = hace 3 h)
function baroSvg(p,p3){const cx=160,cy=168,R=138,ang=v=>Math.PI*(1-(Math.max(950,Math.min(1050,v))-950)/100),pt=(v,r)=>[cx+r*Math.cos(ang(v)),cy-r*Math.sin(ang(v))];
  const arc=(v0,v1,r0,r1,c)=>{const [a,b]=pt(v0,r1),[c2,d]=pt(v1,r1),[e,f]=pt(v1,r0),[g,h]=pt(v0,r0);return `<path d="M${a} ${b} A${r1} ${r1} 0 0 1 ${c2} ${d} L${e} ${f} A${r0} ${r0} 0 0 0 ${g} ${h}Z" fill="${c}"/>`;};
  let h=BARO_S.map(x=>arc(x[0],x[1],78,R,x[4]+(baroSec(p)===x?'':'b3'))).join('');
  h+=BARO_S.map(x=>{const m=(x[0]+x[1])/2,[tx,ty]=pt(m,108);return `<text x="${tx.toFixed(1)}" y="${(ty-4).toFixed(1)}" font-size="17" text-anchor="middle">${x[3]}</text><text x="${tx.toFixed(1)}" y="${(ty+13).toFixed(1)}" font-size="${x[2].length>8?8.6:10.5}" font-weight="800" text-anchor="middle" fill="#fff">${x[2].toUpperCase()}</text>`;}).join('');
  for(let v=950;v<=1050;v+=10){const [x1,y1]=pt(v,R+2),[x2,y2]=pt(v,R+9),[tx,ty]=pt(v,R+19);h+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="1.5" opacity=".6"/><text x="${tx.toFixed(1)}" y="${(ty+3).toFixed(1)}" font-size="9" text-anchor="middle" fill="currentColor" opacity=".7">${v}</text>`;}
  const nd=(v,len,col,w,dash)=>{const [x,y]=pt(v,len);return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"${dash?' stroke-dasharray="5 4"':''}/>`;};
  if(p3!=null)h+=nd(p3,R-6,'#c9952f',3,1);h+=nd(p,R-4,'currentColor',4.5)+`<circle cx="${cx}" cy="${cy}" r="9" fill="currentColor"/><circle cx="${cx}" cy="${cy}" r="3.5" fill="#c9952f"/>`;
  return `<svg viewBox="-16 -12 352 195" style="width:100%;max-width:380px;display:block;margin:6px auto 0" role="img" aria-label="Barómetro: ${baroSec(p)[2]}">${h}</svg>`;}
function baroTxt(p,d3){const s=baroSec(p)[2].toLowerCase();
  if(d3<=-3)return `La presión baja deprisa (${fmtN(d3,1)} hPa en 3 h): lo más probable es que empeore pronto, con viento o lluvia.`;
  if(d3<=-1)return `La presión va bajando: el tiempo tiende a empeorar. Ahora marca «${s}».`;
  if(d3>=1)return `La presión va subiendo: el tiempo tiende a mejorar. Ahora marca «${s}».`;
  return `La presión está estable: seguirá parecido. Marca «${s}».`;}
if(typeof ppRender==='function'){const _pp=ppRender;ppRender=async function(){const r=await _pp.apply(this,arguments);try{await amBaro();}catch(e){}return r;};}
// reloj digital de pantalla LCD (20 nov. 2026): presión real con un decimal y flecha verde (sube) / roja (baja) / gris (estable)
const SEG={a:[2,0,12,3],b:[13,2,3,11],c:[13,15,3,11],d:[2,25,12,3],e:[0,15,3,11],f:[0,2,3,11],g:[2,12.5,12,3]};
const DIG={'0':'abcdef','1':'bc','2':'abged','3':'abgcd','4':'fgbc','5':'afgcd','6':'afgedc','7':'abc','8':'abcdefg','9':'abcdfg',' ':''};
function lcdNum(p){const v=Math.round(p*10),ent=String(Math.floor(v/10)).slice(-4).padStart(4,' '),dd=String(v%10);let x=0,h='';
  const dig=ch=>{h+=`<g transform="translate(${x} 0) skewX(-7)">${Object.entries(SEG).map(([k,[sx,sy,w,hh]])=>`<rect x="${sx}" y="${sy}" width="${w}" height="${hh}" rx="1.4" fill="${DIG[ch].includes(k)?'#16231a':'rgba(0,0,0,.07)'}"/>`).join('')}</g>`;x+=20;};
  [...ent].forEach(dig);h+=`<rect x="${x-3}" y="25" width="3.5" height="3.5" rx="1" fill="#16231a"/>`;x+=4;dig(dd);
  return `<svg viewBox="-2 -2 ${x+2} 32" style="height:34px;display:block">${h}</svg>`;}
function lcdFlecha(d3){const c=d3>=1?'#34d058':d3<=-1?'#ff5252':'#9aa5ad',up=d3>=1,dn=d3<=-1,dos=Math.abs(d3)>=3;
  const tri=y=>up?`<path d="M14 ${y} L26 ${y+11} L2 ${y+11}Z" fill="${c}"/>`:`<path d="M2 ${y} L26 ${y} L14 ${y+11}Z" fill="${c}"/>`;
  const svg=!up&&!dn?`<svg viewBox="0 0 28 28" width="26" height="26"><rect x="3" y="9" width="22" height="3.5" rx="1.5" fill="${c}"/><rect x="3" y="15.5" width="22" height="3.5" rx="1.5" fill="${c}"/></svg>`
    :`<svg viewBox="0 0 28 28" width="26" height="26" style="filter:drop-shadow(0 0 4px ${c})">${dos?tri(2)+tri(15):tri(8)}</svg>`;
  return [svg,c,up?'Subiendo':dn?(dos?'Bajando rápido':'Bajando'):'Estable'];}
async function amBaro(){const el=$('ppBaro');if(!el)return;const t=TOWNS[TOWN];let p=null,p3=null;
  const D=window.PPD;if(D&&D.town===TOWN){p=D.p;p3=D.p3;}
  else try{const w=await getJSON(`${OM}?latitude=${t[1]}&longitude=${t[2]}&current=pressure_msl&hourly=pressure_msl&past_days=1&forecast_days=1${TZ}`);
    if(w&&w.current){p=w.current.pressure_msl;const H=w.hourly,now=new Date(),i=Math.max(0,H.time.findIndex(s=>new Date(s)>now)-1);p3=H.pressure_msl[Math.max(0,i-3)];}}catch(e){}
  if(p==null){el.innerHTML='<div class="note">No se pudo leer la presión ahora.</div>';return;}
  const S=baroSec(p),d3=p3!=null?p-p3:0,[fl,fc,ft]=lcdFlecha(d3);
  el.innerHTML=`${baroSvg(p,p3)}
   <div style="text-align:center;margin-top:-2px"><span class="amPill" style="background:${S[4]};font-size:15px;padding:4px 14px">${S[3]} ${S[2]}</span></div>
   <div style="display:flex;align-items:stretch;gap:0;width:max-content;max-width:100%;margin:10px auto 0;background:linear-gradient(160deg,#30363b,#1c2024);border-radius:14px;padding:6px;box-shadow:0 3px 10px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.08)" role="img" aria-label="${fmtN(p,1)} hPa, ${ft}">
     <div style="background:linear-gradient(170deg,#cfdcbf,#b3c39f);border-radius:9px;padding:6px 10px 5px;box-shadow:inset 0 2px 5px rgba(0,0,0,.28)">
       <div style="display:flex;justify-content:space-between;font:800 8.5px/1 monospace;color:#2c3a2e;letter-spacing:.08em;margin-bottom:3px"><span>PRESIÓN</span><span>${esc(t[0]).toUpperCase().slice(0,14)}</span></div>
       <div style="display:flex;align-items:flex-end;gap:5px">${lcdNum(p)}<span style="font:800 12px/1 monospace;color:#16231a;padding-bottom:2px">hPa</span></div></div>
     <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 10px 0 12px;min-width:62px">${fl}
       <span style="font:800 11px/1.2 monospace;color:${fc};margin-top:3px">${d3>0?'+':''}${fmtN(d3,1)}</span><span style="font:700 8.5px/1.2 monospace;color:#9aa5ad">en 3 h</span></div></div>
   <div style="margin-top:8px">${baroTxt(p,d3)}</div>
   <div class="note" style="margin-top:6px">Aguja negra: ahora · aguja dorada de rayas: hace 3 horas. Como los barómetros de pared de toda la vida: lo que importa es hacia dónde se mueve la aguja.</div>`;}
// quita la tarjeta suelta del barómetro de versiones anteriores (ahora va dentro de «Presión atmosférica»)
(function(){const o=$('amBaroC');if(o)o.remove();})();

// 2b · pronóstico por horas (la gráfica sigue; se elige con dos botones)
let HMODE=lsGet('amHm','g'),HX=null;
(function(){const cv=$('tH');if(!cv)return;const card=cv.closest('.card'),lg=card.querySelector('.note');
  card.querySelector('b').insertAdjacentHTML('afterend','<div class="seg amSeg" id="amHSeg"><button class="btn" data-m="g">📈 Gráfica</button><button class="btn" data-m="h">🕐 Por horas</button></div>');
  card.insertAdjacentHTML('beforeend','<div id="amHL" style="display:none"></div>');
  const set=m=>{HMODE=m;lsSet('amHm',m);card.querySelectorAll('#amHSeg button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));
    cv.style.display=lg.style.display=m==='g'?'':'none';$('amHL').style.display=m==='h'?'':'none';if(m==='h')amHoras();else if(typeof tiempoRender==='function')tiempoRender();};
  card.querySelectorAll('#amHSeg button').forEach(b=>b.onclick=()=>set(b.dataset.m));set(HMODE);
  if(typeof tiempoRender==='function'){const _tr=tiempoRender;tiempoRender=function(){const r=_tr.apply(this,arguments);if(HMODE==='h')amHoras();return r;};}})();
async function amHoras(){const el=$('amHL');if(!el||typeof TW==='undefined'||!TW)return;const t=TOWNS[TOWN],key=TOWN+'|'+Math.floor(Date.now()/18e5);
  if(!HX||HX.k!==key){el.innerHTML='<div class="note">Cargando…</div>';
    const j=await getJSON(`${OM}?latitude=${t[1]}&longitude=${t[2]}&hourly=wind_speed_10m,wind_gusts_10m,relative_humidity_2m,apparent_temperature&forecast_days=3${TZ}`);HX={k:key,j};}
  const h=TW.j.hourly,w=HX.j&&HX.j.hourly,now=new Date(),key0=ymd(now)+'T'+String(now.getHours()).padStart(2,'0')+':00';let i0=h.time.indexOf(key0);if(i0<0)i0=0;
  let out='',dia='';
  for(let i=i0;i<Math.min(h.time.length,i0+48);i++){const s=h.time[i],d=s.slice(0,10),H=+s.slice(11,13),wi=w?w.time.indexOf(s):-1;
    if(d!==dia){dia=d;out+=`<div class="amDay">${d===ymd(now)?'Hoy':new Date(d+'T12:00').toLocaleDateString(LOC,{weekday:'long',day:'numeric'})}</div>`;}
    const pr=h.precipitation[i]||0,pp=h.precipitation_probability?h.precipitation_probability[i]:null,ws=wi>=0?w.wind_speed_10m[wi]:null,wg=wi>=0?w.wind_gusts_10m[wi]:null;
    out+=`<div class="amHr"><b>${String(H).padStart(2,'0')}:00</b><span style="font-size:24px;text-align:center">${wxIcon(h.weather_code[i],H)}</span>
      <span><span>${wDesc(h.weather_code[i])}</span><br><span class="note">${pp!=null?'☔ '+pp+' %':''}${pr>=0.1?' · 💧 '+fmtN(pr,1)+' mm':''}${ws!=null?' · 💨 '+Math.round(ws)+(wg!=null&&wg>ws+10?' (rachas '+Math.round(wg)+')':'')+' km/h':''}</span></span>
      <span class="t">${Math.round(h.temperature_2m[i])}°</span></div>`;}
  el.innerHTML=out||'<div class="note">Sin datos ahora.</div>';}

/* ---------- 3. MAPAS MÁS RÁPIDOS: fondo del IGN en teselas ----------
   Antes cada movimiento pedía al IGN una imagen nueva del mapa entero (tarda 1-3 s). Ahora se usan las teselas
   ya hechas del servicio WMTS del IGN: se piden en paralelo, el móvil las guarda y al volver a la misma zona salen al momento.
   Mientras llega una tesela se pinta ampliada la del nivel anterior. Si el WMTS fallara, se vuelve al sistema de antes. */
const TILE=(z,x,y)=>`https://www.ign.es/wmts/ign-base?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=IGNBaseTodo&STYLE=default&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX=${z}&TILEROW=${y}&TILECOL=${x}&FORMAT=image/jpeg`;
const TC=new Map();let TFAIL=0;
function tImg(z,x,y,cb,T){const u=(T||TILE)(z,x,y);let im=TC.get(u);if(!im){im=new Image();im.onload=()=>{TFAIL=0;cb&&cb();};im.onerror=()=>{TFAIL++;const n=(im.n||0)+1;setTimeout(()=>{if(TC.get(u)===im)TC.delete(u);cb&&cb();},1500*n);};im.src=u;TC.set(u,im);if(TC.size>900)TC.delete(TC.keys().next().value);}return im;}
function tilesDraw(x,P,b,redraw,T){T=T||TILE;const dpr=Math.min(2,window.devicePixelRatio||1),z=Math.max(6,Math.min(18,Math.round(Math.log2(360*b.W*dpr*.75/(256*(b.e-b.w)))))),n=2**z;
  const tx=lo=>Math.floor((lo+180)/360*n),ty=la=>{const r=la*Math.PI/180;return Math.floor((1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*n);};
  const lon=(X,m)=>X/m*360-180,lat=(Y,m)=>{const k=Math.PI-2*Math.PI*Y/m;return 180/Math.PI*Math.atan(.5*(Math.exp(k)-Math.exp(-k)));};
  const x0=tx(b.w),x1=tx(b.e),y0=ty(b.n),y1=ty(b.s);if((x1-x0+1)*(y1-y0+1)>70)return false;
  for(let X=x0;X<=x1;X++)for(let Y=y0;Y<=y1;Y++){const im=tImg(z,X,Y,redraw,T),[ax,ay]=P(lat(Y,n),lon(X,n)),[bx,by]=P(lat(Y+1,n),lon(X+1,n));
    if(im.complete&&im.naturalWidth){x.drawImage(im,ax,ay,bx-ax,by-ay);continue;}
    for(let k=1;k<=3;k++){const pz=z-k,m=2**pz,PX=X>>k,PY=Y>>k,u=T(pz,PX,PY),pi=TC.get(u);
      if(pi&&pi.complete&&pi.naturalWidth){const f=1<<k,sx=(X-PX*f)*256/f,sy=(Y-PY*f)*256/f;x.drawImage(pi,sx,sy,256/f,256/f,ax,ay,bx-ax,by-ay);break;}}}
  return true;}
if(typeof NavMap==='function'){const _NM=NavMap;NavMap=function(id,draw,tap){const c0=$(id);if(c0&&!c0.getAttribute('height')){c0.setAttribute('height',parseInt(c0.style.height)||parseInt(getComputedStyle(c0).height)||340);delete c0.dataset.h;}
  const M=_NM(id,draw,tap),cv=$(id),base0=M.base;
  let pend=0;const redraw=()=>{if(pend)return;pend=requestAnimationFrame(()=>{pend=0;M.draw();});};
  M.base=()=>{if(M.wms||TFAIL>6)return base0();clearTimeout(M.t);M.t=setTimeout(()=>M.ovLoad(),250);M.draw();};
  M.draw=()=>{if(cv.clientWidth<10)return;const x=fitCanvas(cv),b=M.box(),P=(la,lo)=>[b.W*(lo-b.w)/(b.e-b.w),b.H*(b.n-la)/(b.n-b.s)];
    x.fillStyle='#dfe6ec';x.fillRect(0,0,b.W,b.H);let ok=false;
    if(!M.wms&&TFAIL<=6){x.globalAlpha=.9;if(M.tileFilter)x.filter=M.tileFilter;ok=tilesDraw(x,P,b,redraw,M.tile);x.filter='none';x.globalAlpha=1;}
    if(!ok&&M.img&&M.ib){const [x0,y0]=P(M.ib.n,M.ib.w),[x1,y1]=P(M.ib.s,M.ib.e);x.globalAlpha=.85;x.drawImage(M.img,x0,y0,x1-x0,y1-y0);x.globalAlpha=1;}
    if(M.ov&&M.ovImg&&M.ovB){const [x0,y0]=P(M.ovB.n,M.ovB.w),[x1,y1]=P(M.ovB.s,M.ovB.e);x.globalAlpha=.8;x.drawImage(M.ovImg,x0,y0,x1-x0,y1-y0);x.globalAlpha=1;}
    if(typeof drawPetilla==='function')drawPetilla(x,P,M.z>=6);M.P=P;draw(x,P,b,M);};
  return M;};}

// el mapa del Inicio también con teselas (antes: una imagen WMS grande de una vez)
if(typeof mtBase==='function'){const _mb=mtBase;mtBase=function(){if(mtImg)return;if(TFAIL>6)return _mb();
  const c=document.createElement('canvas');c.width=900;c.height=960;c.complete=false;c.naturalWidth=0;mtImg=c;const x=c.getContext('2d');x.fillStyle='#dfe6ec';x.fillRect(0,0,900,960);
  const P=(la,lo)=>[900*(lo-NB.w)/(NB.e-NB.w),960*(NB.n-la)/(NB.n-NB.s)];let ok=0,bad=0,t=0;
  const upd=()=>{if(t)return;t=setTimeout(()=>{t=0;try{mtDraw();}catch(e){}},150);};
  const capa=(z,cb)=>{const n=2**z,tx=lo=>Math.floor((lo+180)/360*n),ty=la=>{const r=la*Math.PI/180;return Math.floor((1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*n);};
    const lon=X=>X/n*360-180,lat=Y=>{const k=Math.PI-2*Math.PI*Y/n;return 180/Math.PI*Math.atan(.5*(Math.exp(k)-Math.exp(-k)));};
    const L=[];for(let X=tx(NB.w);X<=tx(NB.e);X++)for(let Y=ty(NB.n);Y<=ty(NB.s);Y++)L.push([X,Y]);let pend=L.length;
    L.forEach(([X,Y])=>{const [ax,ay]=P(lat(Y),lon(X)),[bx,by]=P(lat(Y+1),lon(X+1));let intento=0;
      const pide=()=>{const im=new Image();im.onload=()=>{x.drawImage(im,ax,ay,bx-ax,by-ay);ok++;c.complete=true;c.naturalWidth=900;upd();if(--pend===0&&cb)cb();};
        im.onerror=()=>{if(++intento<4)setTimeout(pide,1200*intento);else{bad++;if(--pend===0&&cb)cb();if(bad>L.length*.5&&!ok){mtImg=null;TFAIL=99;_mb();}}};
        im.src=TILE(z,X,Y)+(intento?'&r='+intento:'');};pide();});};
  // fondo rápido (pocas teselas) y encima el detallado: si alguna detallada falla, se ve la de debajo y nunca un cuadro gris
  capa(9,()=>capa(10));};}

/* ---------- 4. NA SÍSMICA: aviso, fallas y simulador ---------- */
// 4a · aviso en el móvil (la app lo comprueba cada 15 min en segundo plano, como los avisos del río)
if(CFG.sismo===undefined){CFG.sismo=true;CFG.sismoM=2.5;LS.set('cfg',CFG);}
if(typeof cfgApply==='function'){const _ca=cfgApply;cfgApply=function(){_ca.apply(this,arguments);
  try{if(APP&&window.AndroidNet.setAlerts)window.AndroidNet.setAlerts(JSON.stringify({on:CFG.avisos,qAma:CFG.qAma,qRoj:CFG.qRoj,subida:CFG.subida,roads:CFG.roads||[],snow:CFG.snow||[],
    finde:CFG.finde?[TOWNS[TOWN][0],TOWNS[TOWN][1],TOWNS[TOWN][2]]:null,dato:!!CFG.dato,datoH:CFG.datoH||9,sismo:CFG.sismo!==false,sismoM:+CFG.sismoM||2.5}));}catch(e){}};cfgApply();}
// tarjeta en Ajustes (y quitar de Ajustes «Carreteras que usas», que pasa a Mi Espacio)
if(typeof ajustesRender==='function'){const _ar=ajustesRender;ajustesRender=function(){_ar.apply(this,arguments);const el=$('ajBody');if(!el)return;
  const rd=$('ajRoads');if(rd){const box=rd.parentElement;box.innerHTML='<b>🚧 Carreteras que usas</b><div class="note">Ahora están en <b>Mi Espacio → 🚧 Mis carreteras</b>, con sus incidencias de ahora.</div><div class="row"><button class="btn" id="amGoVias">Ir a Mis carreteras</button></div>';$('amGoVias').onclick=()=>showTab('mivias');}
  el.insertAdjacentHTML('beforeend',`<div class="card"><b>🌍 Aviso de terremotos</b><div class="note">Te avisa en el móvil cuando hay un terremoto en Navarra o alrededores (datos del IGN a través del EMSC). Lo mira cada 15 minutos aunque la app esté cerrada.</div>
   <div class="seg"><button class="btn${CFG.sismo!==false?' on':''}" data-sm="1">Activado</button><button class="btn${CFG.sismo===false?' on':''}" data-sm="0">Desactivado</button></div>
   <div class="st"><div><b>Avisar desde magnitud</b><div class="s">los de menos de 2,5 casi nunca se notan</div></div><select class="town" id="amSmM" style="width:auto">${[2,2.5,3,3.5,4].map(v=>`<option value="${v}"${+CFG.sismoM===v?' selected':''}>${String(v).replace('.',',')}</option>`).join('')}</select></div>
   ${APP&&window.AndroidNet.setAlerts?'':'<div class="note">⚠️ Llega con la app del móvil.</div>'}</div>`);
  el.querySelectorAll('[data-sm]').forEach(b=>b.onclick=()=>{CFG.sismo=b.dataset.sm==='1';cfgSave();ajustesRender();});
  $('amSmM').onchange=e=>{CFG.sismoM=+e.target.value;cfgSave();};};}

// 4b · pestañas Terremotos | Fallas | Simulador ; las líneas de las fallas ya no salen en el mapa de terremotos
const FALLAS=[
 {id:'ES817',n:'Falla de Pamplona',k:'desgarre',dir:'NNE-SSO',mov:[[[42.42,-1.80],[43.20,-1.50]],'izq'],
  txt:'Gran fractura de más de 100 km que cruza Navarra de norte a sur, desde el frente del Pirineo hasta Francia. Separa el Pirineo occidental de la cuenca vasco-cantábrica: es una «falla de transferencia». Al sur está marcada por una fila de diapiros de sal (Salinas de Oro, Undiano, Etxauri…).',
  act:'Hay terremotos agrupados en su tramo central, cerca de Pamplona, con movimientos de falla normal y de desgarre. Algunos geólogos piensan que hoy se mueven sobre todo fallas más pequeñas a su alrededor.',
  ej:'Enjambre de El Perdón y Etxauri (2013, más de 300 temblores, dos de magnitud ~4) y los terremotos de Lizoáin-Egüés (2017, 2020 y 2021).',ref:'GASPI (UB), UPV-EHU, QAFI (IGME)'},
 {id:'ES816',n:'Falla de Leitza',k:'inversa',dir:'E-O',mov:[[[43.08,-2.10],[43.07,-1.62]],'inv'],
  txt:'Falla de dirección este-oeste en el norte de Navarra que separa los macizos paleozoicos (Cinco Villas, Quinto Real) de la cuenca vasco-cantábrica. Es una estructura muy profunda, que llega a la corteza.',
  act:'Las redes sísmicas temporales mostraron que la sismicidad del Pirineo sigue hacia el oeste a lo largo de esta falla, hasta la de Hendaia. Los terremotos son más profundos hacia el norte.',
  ej:'Pequeños terremotos frecuentes entre Leitza, Ultzama y Baztan.',ref:'GASPI (UB), QAFI (IGME)'},
 {id:'ES815',n:'Falla de Aralar',k:'inversa',dir:'E-O',mov:[[[42.98,-2.20],[42.95,-1.85]],'inv'],
  txt:'Cabalgamiento del frente norte de la sierra de Aralar, en el borde noroeste de Navarra. Forma parte del sistema de pliegues y fallas que levantó las sierras de Aralar, Urbasa y Andía.',
  act:'Los geólogos todavía discuten si se ha movido en los últimos 2,6 millones de años (Cuaternario).',ej:'Sismicidad baja y dispersa.',ref:'QAFI (IGME)'},
 {id:'ES818',n:'Falla de Roncesvalles',k:'normal',dir:'NO-SE',mov:[[[43.08,-1.40],[42.92,-1.20]],'nor'],
  txt:'Falla del Pirineo navarro en la zona de Roncesvalles, Auritz/Burguete y Aezkoa.',
  act:'Hay un núcleo de actividad sísmica en Roncesvalles; los terremotos de la zona muestran sobre todo fallas normales (la corteza se estira de norte a sur).',ej:'Pequeños terremotos frecuentes en el Pirineo navarro.',ref:'QAFI (IGME), UCM'},
 {id:'FR005',n:'Falla de Herrère (Bearn)',k:'activa',dir:'E-O',mov:[[[43.14,-0.66],[43.11,-0.46]],'inv'],
  txt:'Una de las fallas norpirenaicas del Bearn (Francia), a unos 70 km al noreste de Navarra.',
  act:'Falla activa: hay pruebas de movimiento en el Cuaternario. La zona del Bearn es la más sísmica del Pirineo occidental.',
  ej:'El terremoto de Arette (13 de agosto de 1967, magnitud ~5,3) causó daños en el Bearn y se sintió en Navarra.',ref:'QAFI (IGME)'},
 {id:'FR004',n:'Falla de Bedous',k:'desgarre',dir:'NNE-SSO',mov:[[[42.95,-0.62],[43.05,-0.58]],'izq'],
  txt:'Falla del valle de Aspe (Francia), al este del Roncal.',act:'Posiblemente activa (en estudio).',ej:'Sismicidad del valle de Aspe.',ref:'QAFI (IGME)'},
 {id:'FR008',n:'Falla de Mail Arrouy',k:'normal',dir:'E-O',mov:[[[43.08,-0.50],[43.07,-0.30]],'nor'],
  txt:'Falla del Pirineo francés, en el Bearn.',act:'Posiblemente activa (en estudio).',ej:'—',ref:'QAFI (IGME)'}];
const fGeo=f=>{const g=((window.SISMO_GEO||{}).f||[]).find(z=>z.a.ID===f.id);if(!g)return {A:f.mov[0][0],B:f.mov[0][1],C:[(f.mov[0][0][0]+f.mov[0][1][0])/2,(f.mov[0][0][1]+f.mov[0][1][1])/2]};
  const r=g.r.reduce((a,b)=>b.length>a.length?b:a);return {A:r[0],B:r[r.length-1],C:r[Math.floor(r.length/2)]};};
const FK={desgarre:'Falla de desgarre (los dos bloques se deslizan de lado)',inversa:'Falla inversa o cabalgamiento (un bloque sube sobre el otro: la corteza se acorta)',normal:'Falla normal (un bloque baja respecto al otro: la corteza se estira)',activa:'Falla activa (cabalgamiento norpirenaico)'};
const EMS=[[1,'I','No sentido','Solo lo registran los aparatos.','#e3f2fd'],[2,'II','Apenas sentido','Lo notan muy pocas personas en reposo, en pisos altos.','#bbdefb'],
 [3,'III','Débil','Lo notan algunas personas dentro de casa: ligero balanceo.','#90caf9'],[4,'IV','Ampliamente observado','Lo nota mucha gente dentro de casa: vibran ventanas, puertas y platos.','#a5d6a7'],
 [5,'V','Fuerte','Lo nota casi todo el mundo; se balancean objetos colgados y despierta a quien duerme.','#ffee58'],[6,'VI','Levemente dañino','Mucha gente se asusta; caen objetos y aparecen grietas finas en edificios.','#ffb74d'],
 [7,'VII','Dañino','Muebles volcados; daños moderados en muchos edificios corrientes.','#ff7043'],[8,'VIII','Gravemente dañino','Daños graves en muchos edificios y alguno se derrumba en parte.','#e53935'],
 [9,'IX','Destructivo','Monumentos y columnas caen; muchos edificios se derrumban en parte.','#b71c1c'],[10,'X','Muy destructivo','Muchos edificios corrientes se derrumban.','#880e4f'],
 [11,'XI','Devastador','La mayoría de los edificios se derrumban.','#4a148c'],[12,'XII','Completamente devastador','Prácticamente todo se destruye.','#1a0033']];
// intensidad orientativa a partir de la magnitud y la distancia al foco (relación sencilla, calibrada con terremotos del Pirineo)
const IPE=(M,R)=>Math.max(1,Math.min(12,1.5*M-3.5*Math.log10(Math.max(R,3))+3.0));
let SIT='q',FSEL=null,SIMM=null,SIMQ={M:4.5,h:10,pt:null};
const SIPTS=()=>(TOWNS||[]).filter(t=>t[1]>41.9);
(function(){const sec=$('t-sismo');if(!sec)return;const fal=$('siFal');if(fal){fal.checked=false;fal.closest('label').style.display='none';}
  sec.insertAdjacentHTML('afterbegin',`<div class="seg amSeg" id="amSiT"><button class="btn on" data-v="q">🌍 Terremotos</button><button class="btn" data-v="f">🪨 Fallas</button><button class="btn" data-v="s">🎚️ Simulador</button></div><div id="amSiF" style="display:none"></div>`);
  sec.querySelectorAll('#amSiT button').forEach(b=>b.onclick=()=>{SIT=b.dataset.v;sec.querySelectorAll('#amSiT button').forEach(x=>x.classList.toggle('on',x===b));amSiShow();});})();
function amSiShow(){const sec=$('t-sismo'),F=$('amSiF');[...sec.children].forEach(c=>{if(c.id==='amSiT'||c.id==='amSiF'||/^pv/.test(c.id))return;c.style.display=SIT==='q'?'':'none';});
  F.style.display=SIT==='q'?'none':'';if(SIT==='q'){if(typeof siRender==='function')siRender();return;}
  if(SIT==='f')amFallas();else amSimul();}
function amFallas(){const F=$('amSiF');
  F.innerHTML=`<div class="card"><b>🪨 Fallas de Navarra y alrededores</b><div class="note">Elige una para ver dónde está, cómo se mueve y qué sabemos de ella. Datos de la base QAFI (IGME-CSIC) y estudios universitarios.</div>
   <div class="amSeg" style="margin-top:8px">${FALLAS.map(f=>`<button class="btn${FSEL===f.id?' on':''}" data-f="${f.id}">${f.n.replace(/^Falla de /,'')}</button>`).join('')}</div></div>
   <div class="card" style="padding:6px"><canvas id="amFc" class="amMap"></canvas><div class="note" style="padding:4px 6px">➡️ Las flechas enseñan hacia dónde se mueve cada bloque. ★ Pamplona.</div></div><div id="amFF"></div>`;
  F.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{FSEL=b.dataset.f;amFallas();});
  const fs=FSEL&&FALLAS.find(f=>f.id===FSEL),geo=fs&&((window.SISMO_GEO||{}).f||[]).find(x=>x.a.ID===fs.id);
  const M=NavMap('amFc',(x,P,b,M)=>{const arrow=(x0,y0,x1,y1,c)=>{x.strokeStyle=c;x.fillStyle=c;x.lineWidth=4;x.beginPath();x.moveTo(x0,y0);x.lineTo(x1,y1);x.stroke();const a=Math.atan2(y1-y0,x1-x0);x.beginPath();x.moveTo(x1,y1);x.lineTo(x1-12*Math.cos(a-.45),y1-12*Math.sin(a-.45));x.lineTo(x1-12*Math.cos(a+.45),y1-12*Math.sin(a+.45));x.closePath();x.fill();};
    FALLAS.forEach(f=>{const g=((window.SISMO_GEO||{}).f||[]).find(z=>z.a.ID===f.id),sel=f.id===FSEL,col=sel?'#d50000':'#6d4c41';
      const R=g?g.r:[f.mov[0]];R.forEach(r=>{x.beginPath();r.forEach((q,i)=>{const [px,py]=P(q[0],q[1]);i?x.lineTo(px,py):x.moveTo(px,py);});x.lineCap='round';x.lineWidth=sel?7:4;x.strokeStyle='#0007';x.stroke();x.lineWidth=sel?4.5:2.2;x.strokeStyle=col;x.stroke();});
      if(sel){const G=fGeo(f),[ax,ay]=P(G.A[0],G.A[1]),[bx,by]=P(G.B[0],G.B[1]),[mx,my]=P(G.C[0],G.C[1]),dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,nx=-uy,ny=ux,s=34,o=16;
        if(f.mov[1]==='izq'){arrow(mx+nx*o-ux*s/2,my+ny*o-uy*s/2,mx+nx*o+ux*s/2,my+ny*o+uy*s/2,'#1565c0');arrow(mx-nx*o+ux*s/2,my-ny*o+uy*s/2,mx-nx*o-ux*s/2,my-ny*o-uy*s/2,'#1565c0');}
        else if(f.mov[1]==='inv'){arrow(mx+nx*(o+s),my+ny*(o+s),mx+nx*o,my+ny*o,'#e65100');arrow(mx-nx*(o+s),my-ny*(o+s),mx-nx*o,my-ny*o,'#e65100');}
        else{arrow(mx+nx*o,my+ny*o,mx+nx*(o+s),my+ny*(o+s),'#2e7d32');arrow(mx-nx*o,my-ny*o,mx-nx*(o+s),my-ny*(o+s),'#2e7d32');}
        x.font='bold 12px system-ui';x.fillStyle='#000';x.textAlign='center';x.fillText(f.n,mx,my-o-s/2-4);}});
    const [px,py]=P(42.8125,-1.6458);x.fillStyle='#000';x.font='bold 11px system-ui';x.textAlign='center';x.fillText('★ Pamplona',px,py-6);},()=>{});
  setTimeout(()=>{if(fs){const L=(geo?geo.r.flat():fs.mov[0]);const la=L.map(p=>p[0]),lo=L.map(p=>p[1]);M.fit(Math.min(...la)-.12,Math.max(...la)+.12,Math.min(...lo)-.2,Math.max(...lo)+.2);}else M.fit(42.3,43.3,-2.3,-0.3);},30);
  if(!window.SISMO_GEO&&typeof siLoad==='function')siLoad(()=>M.draw());
  if(!fs){$('amFF').innerHTML='<div class="card"><div class="note">👆 Toca el nombre de una falla.</div><div class="note" style="margin-top:6px"><b>Tipos de falla:</b><br>'+Object.values(FK).slice(0,3).map(x=>'• '+x).join('<br>')+'</div></div>';return;}
  const n=geo?((window.SISMO_GEO.q||[]).filter(q=>geo.r.some(r=>r.some(p=>Math.abs(p[0]-q[1])<.08&&Math.abs(p[1]-q[2])<.1))).length):null;
  $('amFF').innerHTML=`<div class="card"><b style="font-size:16px">${fs.n}</b><div class="note" style="margin-top:2px">${FK[fs.k]} · dirección ${fs.dir}</div>
   <div style="margin-top:8px">${fs.txt}</div><div class="st"><b>¿Está activa?</b><span style="text-align:right;max-width:60%">${fs.act}</span></div>
   <div class="st"><b>Terremotos conocidos</b><span style="text-align:right;max-width:60%">${fs.ej}</span></div>${n!=null?`<div class="st"><b>Terremotos registrados cerca (desde 1998)</b><span>${n.toLocaleString(LOC)}</span></div>`:''}
   <div class="st"><b>Fuente</b><span>${fs.ref}</span></div><div class="row"><button class="btn pri" id="amFSim">🎚️ Simular un terremoto en esta falla</button></div></div>`;
  $('amFSim').onclick=()=>{SIMQ.pt=fGeo(fs).C.slice();SIT='s';document.querySelectorAll('#amSiT button').forEach(x=>x.classList.toggle('on',x.dataset.v==='s'));amSiShow();};}
function amSimul(){const F=$('amSiF');if(!SIMQ.pt)SIMQ.pt=[42.83,-1.58];
  F.innerHTML=`<div class="card"><b>🎚️ Simulador: ¿cómo se sentiría un terremoto?</b><div class="note">Toca el mapa para poner el epicentro y mueve la magnitud y la profundidad. Cada pueblo muestra la <b>intensidad</b> que se sentiría con la escala EMS-98, la que usa el IGN (números romanos del I al XII).</div>
   <div style="margin-top:8px"><label>Magnitud: <b id="amSmv">${fmtN(SIMQ.M,1)}</b></label><input type="range" id="amSm" min="2" max="7" step="0.1" value="${SIMQ.M}" style="width:100%"></div>
   <div><label>Profundidad: <b id="amShv">${SIMQ.h}</b> km</label><input type="range" id="amSh" min="1" max="40" step="1" value="${SIMQ.h}" style="width:100%"></div>
   <div class="amSeg">${FALLAS.slice(0,5).map(f=>`<button class="btn" data-sf="${f.id}">📍 ${f.n.replace(/^Falla de /,'')}</button>`).join('')}</div></div>
   <div class="card" style="padding:6px"><canvas id="amSc" class="amMap" style="height:380px"></canvas></div><div id="amSR"></div>
   <div class="card"><b>📏 Escala de intensidad EMS-98 (la del IGN)</b><div class="note">La <b>magnitud</b> mide la energía del terremoto (un solo número). La <b>intensidad</b> mide cómo se siente en cada sitio: baja al alejarse del epicentro y con más profundidad.</div>
   ${EMS.slice(0,10).map(e=>`<div class="amRow"><span class="amPill" style="background:${e[4]};color:${e[0]<6?'#222':'#fff'};min-width:34px;text-align:center">${e[1]}</span><div><b>${e[2]}</b><div class="note">${e[3]}</div></div></div>`).join('')}</div>
   <div class="card" style="border-color:#ffb020"><div class="note">⚠️ Simulación orientativa con una fórmula sencilla. Los terremotos reales dependen del terreno, de cómo se rompe la falla y de los edificios. No sirve para predecir nada.</div></div>`;
  const draw=(x,P,b,M)=>{const [ex,ey]=P(SIMQ.pt[0],SIMQ.pt[1]);
    // anillos de intensidad
    for(let I=10;I>=2;I--){let lo=0,hi=400;for(let k=0;k<30;k++){const m=(lo+hi)/2;if(IPE(SIMQ.M,Math.hypot(m,SIMQ.h))>=I+.5)lo=m;else hi=m;}const Rkm=Math.sqrt(Math.max(0,lo*lo));if(Rkm<.5)continue;
      const [rx]=P(SIMQ.pt[0],SIMQ.pt[1]+Rkm/(111.32*Math.cos(SIMQ.pt[0]*Math.PI/180)));const e=EMS[I-1];x.beginPath();x.arc(ex,ey,Math.abs(rx-ex),0,7);x.fillStyle=e[4]+'55';x.fill();x.strokeStyle=e[4];x.lineWidth=1.5;x.stroke();}
    SIPTS().forEach(t=>{const d=km(SIMQ.pt[0],SIMQ.pt[1],t[1],t[2]),I=Math.round(IPE(SIMQ.M,Math.hypot(d,SIMQ.h))),e=EMS[I-1],[px,py]=P(t[1],t[2]);
      x.beginPath();x.arc(px,py,9,0,7);x.fillStyle=e[4];x.fill();x.strokeStyle='#0009';x.lineWidth=1;x.stroke();x.fillStyle=I<6?'#000':'#fff';x.font='bold 9px system-ui';x.textAlign='center';x.fillText(e[1],px,py+3);});
    x.font='22px system-ui';x.textAlign='center';x.fillText('💥',ex,ey+8);};
  SIMM=NavMap('amSc',draw,(px,py,M)=>{const b=M.box();SIMQ.pt=[b.n-(b.n-b.s)*py/b.H,b.w+(b.e-b.w)*px/b.W];M.draw();amSimL();});
  setTimeout(()=>SIMM.fit(41.95,43.3,-2.5,-0.75),30);
  $('amSm').oninput=e=>{SIMQ.M=+e.target.value;$('amSmv').textContent=fmtN(SIMQ.M,1);SIMM.draw();amSimL();};
  $('amSh').oninput=e=>{SIMQ.h=+e.target.value;$('amShv').textContent=SIMQ.h;SIMM.draw();amSimL();};
  F.querySelectorAll('[data-sf]').forEach(b=>b.onclick=()=>{const f=FALLAS.find(x=>x.id===b.dataset.sf);SIMQ.pt=fGeo(f).C.slice();SIMM.draw();amSimL();});
  amSimL();}
function amSimL(){const L=SIPTS().map(t=>{const d=km(SIMQ.pt[0],SIMQ.pt[1],t[1],t[2]);return [t[0],d,Math.round(IPE(SIMQ.M,Math.hypot(d,SIMQ.h)))];}).sort((a,b)=>a[1]-b[1]);
  $('amSR').innerHTML=`<div class="card"><b>Cómo se sentiría (magnitud ${fmtN(SIMQ.M,1)}, ${SIMQ.h} km de profundidad)</b>${L.map(([n,d,I])=>{const e=EMS[I-1];return `<div class="amRow"><span class="amPill" style="background:${e[4]};color:${I<6?'#222':'#fff'};min-width:34px;text-align:center">${e[1]}</span><div style="flex:1"><b>${esc(n)}</b> <span class="note">a ${fmtN(d,0)} km</span><div class="note">${e[2]}: ${e[3]}</div></div></div>`;}).join('')}</div>`;}
// el simulador y las fallas se redibujan al volver a la pantalla
svHook('sismo',()=>{if(SIT!=='q')amSiShow();});

/* ---------- 5. NA SALUD: centros de salud y urgencias ---------- */
svSec('centros',`<div class="card"><b>🏥 Centros de salud y urgencias</b><div class="note">Centros de salud, consultorios, hospitales y urgencias de Navarra. En una emergencia llama siempre al <b>112</b>. Fuera del horario de tu centro de salud, para dudas: Consejo Sanitario <a href="tel:948290290">948 290 290</a>.</div>
 <div class="seg amSeg" id="ceT"><button class="btn on" data-k="">Todo</button><button class="btn" data-k="urg">🚑 Urgencias</button><button class="btn" data-k="hosp">🏥 Hospitales</button><button class="btn" data-k="cs">🩺 Centros de salud</button><button class="btn" data-k="cons">🏠 Consultorios</button></div>
 <div class="row"><input id="ceQ" class="town" placeholder="🔎 Buscar pueblo o centro…" style="flex:1;box-sizing:border-box"><button class="btn" id="ceYo">📍 Cerca de mí</button></div></div>
 <div class="card" style="padding:6px"><canvas id="ceMap" class="amMap"></canvas></div>
 <div class="card"><b>📞 Teléfonos útiles</b><div class="st"><b>Emergencias</b><a href="tel:112">112</a></div><div class="st"><b>Consejo Sanitario (enfermería)</b><a href="tel:948290290">948 290 290</a></div>
 <div class="st"><b>Cita previa en tu centro de salud</b><a href="#" id="ceCita">Carpeta Personal de Salud</a></div></div>
 <div id="ceList"></div><div class="note" style="margin:0 6px 12px">Datos: OpenStreetMap (ODbL) y Gobierno de Navarra (IDENA). Los horarios de urgencias pueden cambiar: confírmalos en el Servicio Navarro de Salud.</div>`);
nuevo('centros','NA Salud','🏥 Centros de salud y urgencias','pueblo','i-hosp','r');
const CEK={urg:['🚑','Urgencias','#c62828'],sm:['🧠','Salud mental','#00897b'],hosp:['🏥','Hospital','#6a1b9a'],cs:['🩺','Centro de salud','#1565c0'],cons:['🏠','Consultorio','#2e7d32'],otro:['➕','Centro sanitario','#546e7a']};
let CEF='',CEM=null,CESEL=null;
function ceL(){const T=window.TERRI;if(!T)return [];const q=N($('ceQ').value.trim());let L=(T.salud||[]).filter(s=>(!CEF||s.k===CEF||(CEF==='urg'&&s.urg))&&(!q||N(s.n+' '+s.p).includes(q)));
  if(MYPOS&&$('ceYo').classList.contains('on'))L=L.map(s=>Object.assign({},s,{dk:km(MYPOS.la,MYPOS.lo,s.pt[0],s.pt[1])})).sort((a,b)=>a.dk-b.dk);return L;}
function ceRender(){const T=window.TERRI;if(!T){$('ceList').innerHTML='<div class="card"><div class="note">⏳ Los datos de centros llegan con la próxima actualización de la app.</div></div>';return;}
  const L=ceL();
  if(!CEM){CEM=NavMap('ceMap',(x,P)=>{ceL().forEach(s=>{const [px,py]=P(s.pt[0],s.pt[1]),c=CEK[s.k]||CEK.otro,sel=CESEL===s;x.beginPath();x.arc(px,py,sel?9:6,0,7);x.fillStyle=c[2];x.fill();x.strokeStyle='#fff';x.lineWidth=sel?3:1.5;x.stroke();});},
    (px,py,M)=>{let best=null,bd=20;ceL().forEach(s=>{const [x,y]=M.P(s.pt[0],s.pt[1]),d=Math.hypot(x-px,y-py);if(d<bd){bd=d;best=s;}});CESEL=best;M.draw();if(best)ceFicha(best);});
    setTimeout(()=>CEM.fit(41.9,43.3,-2.5,-0.7),30);}else CEM.draw();
  $('ceList').innerHTML=`<div class="card"><b>${L.length} centros</b>${L.slice(0,150).map((s,i)=>{const c=CEK[s.k]||CEK.otro;return `<div class="st" data-i="${i}" style="cursor:pointer"><div><b>${c[0]} ${esc(s.n)}</b><div class="s">${c[1]} · ${esc(s.p)}${s.dk!=null?' · '+fmtN(s.dk,1)+' km':''}</div></div><span>›</span></div>`;}).join('')}${L.length>150?'<div class="note">Escribe para ver más…</div>':''}</div>`;
  $('ceList').querySelectorAll('[data-i]').forEach(d=>d.onclick=()=>{const s=L[+d.dataset.i];CESEL=s;CEM.fit(s.pt[0]-.03,s.pt[0]+.03,s.pt[1]-.04,s.pt[1]+.04);ceFicha(s);});}
function ceFicha(s){const c=CEK[s.k]||CEK.otro;let f=$('ceF');if(!f){$('ceList').insertAdjacentHTML('beforebegin','<div id="ceF"></div>');f=$('ceF');}
  f.innerHTML=`<div class="card" style="border-color:${c[2]}"><div class="row" style="justify-content:space-between;align-items:center"><b style="font-size:16px">${c[0]} ${esc(s.n)}</b><button class="btn" id="ceX">✕</button></div>
   <div class="note">${c[1]} · ${esc(s.p)}</div>${s.d?`<div class="st"><b>Dirección</b><span>${esc(s.d)}</span></div>`:''}${s.h?`<div class="st"><b>Horario</b><span style="text-align:right">${esc(s.h)}</span></div>`:''}
   ${s.tel?`<div class="st"><b>Teléfono</b><a href="tel:${esc(s.tel.replace(/\s/g,''))}">${esc(s.tel)}</a></div>`:''}${s.cita?`<div class="st"><b>Cita</b><a href="tel:${esc(s.cita.replace(/\s/g,''))}">${esc(s.cita)}</a></div>`:''}${s.t?`<div class="st"><b>Tipo</b><span>${esc(s.t)}</span></div>`:''}
   <div class="row"><button class="btn pri" id="ceGo">🧭 Cómo llegar</button>${urlOk(s.web)?'<button class="btn" id="ceWeb">🌐 Web</button>':''}</div></div>`;
  $('ceX').onclick=()=>{f.innerHTML='';CESEL=null;CEM.draw();};$('ceGo').onclick=()=>abre(`https://www.google.com/maps/dir/?api=1&destination=${s.pt[0]},${s.pt[1]}`);
  if($('ceWeb'))$('ceWeb').onclick=()=>abre(s.web);f.scrollIntoView({behavior:'smooth',block:'nearest'});}
(function(){document.querySelectorAll('#ceT button').forEach(b=>b.onclick=()=>{CEF=b.dataset.k;document.querySelectorAll('#ceT button').forEach(x=>x.classList.toggle('on',x===b));ceRender();});
  $('ceQ').oninput=()=>ceRender();$('ceYo').onclick=async()=>{try{await myPos();$('ceYo').classList.add('on');ceRender();CEM.fit(MYPOS.la-.15,MYPOS.la+.15,MYPOS.lo-.2,MYPOS.lo+.2);}catch(e){toast(e.message);}};
  $('ceCita').onclick=e=>{e.preventDefault();abre('https://carpetadesalud.navarra.es/');};})();
svHook('centros',()=>svLoad('territorio.js','TERRI',()=>ceRender()));
window.amTerri=cb=>svLoad('territorio.js','TERRI',cb);

/* ---------- 6. CARRETERAS: el tiempo en los próximos 3 días ---------- */
svSec('vias3',`<div class="card"><b>🌨️ El tiempo en las carreteras (próximos 3 días)</b><div class="note">Nieve, hielo, niebla, viento fuerte y lluvia intensa previstos en los puertos y en las principales zonas de Navarra. Es una previsión: antes de salir mira las incidencias de verdad.</div>
 <div class="seg amSeg" id="v3D"></div></div><div class="card" style="padding:6px"><canvas id="v3Map" class="amMap"></canvas><div class="note" id="v3Leg" style="padding:4px 6px"></div></div><div id="v3L"><div class="card"><div class="note">Cargando previsión…</div></div></div>
 <div class="card"><div class="st"><b>Estado de las carreteras (Gobierno de Navarra)</b><a href="tel:948423500">948 423 500</a></div><div class="row"><button class="btn" onclick="showTab('incid')">🚧 Incidencias de ahora</button><button class="btn" onclick="showTab('puertos')">🏔️ Puertos</button></div></div>
 <div class="note" style="margin:0 6px 12px">Previsión: Open‑Meteo (modelos de AEMET, ECMWF y otros).</div>`);
nuevo('vias3','Carreteras','🌨️ El tiempo en las carreteras (3 días)','carretera','i-vias3','r');
const V3R=[['nieve','❄️','Nieve','#1e88e5'],['hielo','🧊','Hielo','#00acc1'],['niebla','🌫️','Niebla','#78909c'],['viento','💨','Viento fuerte','#8e24aa'],['lluvia','🌧️','Lluvia intensa','#3949ab']];
let V3=null,V3D=0,V3M=null;
async function v3Load(){const el=$('v3L');vjLoad(async()=>{const P=puList().filter(p=>p.pt).map(p=>({n:p.n,la:p.pt[0],lo:p.pt[1],ele:p.ele,pu:1}));
  const Z=TOWNS.filter(t=>t[1]>41.9).map(t=>({n:t[0],la:t[1],lo:t[2]}));const L=P.concat(Z).slice(0,70);
  const j=await getJSON(`${OM}?latitude=${L.map(p=>p.la).join(',')}&longitude=${L.map(p=>p.lo).join(',')}&daily=snowfall_sum,precipitation_sum,temperature_2m_min,temperature_2m_max,wind_gusts_10m_max,weather_code&hourly=visibility&forecast_days=3${TZ}`);
  const A=Array.isArray(j)?j:j?[j]:[];if(!A.length){el.innerHTML='<div class="card"><div class="note">❌ No se pudo cargar la previsión. Prueba en un rato.</div></div>';return;}
  V3={L:L.map((p,i)=>{const d=A[i]&&A[i].daily,h=A[i]&&A[i].hourly;if(!d)return null;
    const R=[0,1,2].map(k=>{const r=[],sn=d.snowfall_sum[k]||0,pr=d.precipitation_sum[k]||0,tmin=d.temperature_2m_min[k],g=d.wind_gusts_10m_max[k]||0;
      const vis=h?Math.min(...h.visibility.slice(k*24,k*24+24).filter(v=>v!=null)):99999;
      if(sn>=0.5)r.push(['nieve',sn>=5?2:1,`${fmtN(sn,1)} cm`]);if(tmin<=0.5&&(pr>0.2||tmin<=-2))r.push(['hielo',tmin<=-3?2:1,`mín ${Math.round(tmin)}°`]);
      if(vis<1000)r.push(['niebla',vis<200?2:1,`visibilidad ${vis<1000?Math.round(vis/50)*50:'—'} m`]);if(g>=60)r.push(['viento',g>=80?2:1,`rachas ${Math.round(g)} km/h`]);
      if(pr>=20)r.push(['lluvia',pr>=40?2:1,`${Math.round(pr)} mm`]);return r;});return Object.assign(p,{R,dias:d.time});}).filter(Boolean)};v3Render();});}
function v3Render(){if(!V3)return;const dias=V3.L[0].dias;
  $('v3D').innerHTML=dias.map((d,i)=>`<button class="btn${i===V3D?' on':''}" data-d="${i}">${i===0?'Hoy':i===1?'Mañana':new Date(d+'T12:00').toLocaleDateString(LOC,{weekday:'long'})}</button>`).join('');
  $('v3D').querySelectorAll('button').forEach(b=>b.onclick=()=>{V3D=+b.dataset.d;v3Render();});
  const C=V3.L.filter(p=>p.R[V3D].length).sort((a,b)=>Math.max(...b.R[V3D].map(r=>r[1]))-Math.max(...a.R[V3D].map(r=>r[1])));
  const col=p=>{const r=p.R[V3D];if(!r.length)return '#43a047';return Math.max(...r.map(x=>x[1]))>=2?'#e53935':'#fbc02d';};
  if(!V3M){V3M=NavMap('v3Map',(x,P)=>{V3.L.forEach(p=>{const [px,py]=P(p.la,p.lo),r=p.R[V3D];x.beginPath();x.arc(px,py,p.pu?7:5,0,7);x.fillStyle=col(p);x.fill();x.strokeStyle='#fff';x.lineWidth=1.5;x.stroke();
      if(r.length){x.font='13px system-ui';x.textAlign='center';x.fillText(r.map(z=>V3R.find(v=>v[0]===z[0])[1]).join(''),px,py-9);}});},()=>{});setTimeout(()=>V3M.fit(41.9,43.3,-2.5,-0.7),30);}else V3M.draw();
  $('v3Leg').innerHTML='🟢 sin problemas · 🟡 precaución · 🔴 peligro · '+V3R.map(r=>r[1]+' '+r[2].toLowerCase()).join(' · ');
  $('v3L').innerHTML=`<div class="card"><b>${C.length?C.length+' sitios con posibles problemas':'✅ No se esperan problemas por el tiempo'}</b>${C.map(p=>`<div class="amRow"><span class="amPill" style="background:${col(p)}">${p.pu?'⛰️':'🏘️'}</span><div style="flex:1"><b>${esc(p.n)}</b>${p.ele?` <span class="note">${Math.round(p.ele)} m</span>`:''}
    <div class="note">${p.R[V3D].map(r=>{const v=V3R.find(x=>x[0]===r[0]);return `${v[1]} ${v[2]} (${r[2]})`;}).join(' · ')}</div></div></div>`).join('')}</div>`;}
svHook('vias3',()=>{if(!V3)v3Load();else v3Render();});

/* ---------- 7. MI ESPACIO: mis carreteras ---------- */
svSec('mivias',`<div class="card"><b>🚧 Mis carreteras</b><div class="note">Escribe las carreteras que usas. Aquí verás sus incidencias de ahora y, si tienes los avisos activados (Ajustes → 🔔 Avisos en el móvil), te avisará cuando aparezca una nueva.</div>
 <input id="mvR" class="town" placeholder="Ej.: A-15, NA-137, N-135" style="width:100%;box-sizing:border-box;margin-top:6px"><div class="row"><button class="btn pri" id="mvS">💾 Guardar</button><button class="btn" id="mvA">🔔 Avisos</button></div><div class="note" id="mvM"></div></div><div id="mvL"></div>`);
nuevo('mivias','Mi Espacio','🚧 Mis carreteras','carretera','i-carretera','r');
async function mvRender(){$('mvR').value=(CFG.roads||[]).join(', ');const el=$('mvL');const R=(CFG.roads||[]).map(r=>r.toUpperCase().replace(/\s/g,''));
  if(!R.length){el.innerHTML='<div class="card"><div class="note">Todavía no has puesto ninguna carretera.</div></div>';return;}
  if(!INC||Date.now()-INAT>10*60e3){el.innerHTML='<div class="card"><div class="note">Mirando las incidencias…</div></div>';try{await inFetch();}catch(e){}}
  const L=(INC||[]).filter(x=>R.includes(String(x.car).toUpperCase().replace(/\s/g,'')));
  el.innerHTML=R.map(r=>{const I=L.filter(x=>String(x.car).toUpperCase().replace(/\s/g,'')===r);return `<div class="card"><b>${esc(r)}</b> ${I.length?`<span class="amPill" style="background:#e53935">${I.length}</span>`:'<span class="amPill" style="background:#43a047">sin incidencias</span>'}
    ${I.map(x=>`<div class="st" style="display:block"><b>${inIco(x.cat+' '+x.tipo)} ${esc(x.tit||x.tipo)}</b><div class="s">${esc(x.des||x.af)}${x.pk!=null?' · pk '+esc(x.pk):''}</div></div>`).join('')}</div>`;}).join('')+
    '<div class="row"><button class="btn" onclick="showTab(\'incid\')">🗺️ Ver todas en el mapa</button></div>';}
(function(){$('mvS').onclick=()=>{CFG.roads=$('mvR').value.toUpperCase().split(/[,;\s]+/).map(s=>s.trim()).filter(s=>/^[A-Z]+-?\d/.test(s));cfgSave();$('mvM').textContent='✅ Guardado';mvRender();};
  $('mvA').onclick=()=>showTab('ajustes');})();
svHook('mivias',mvRender);

/* ---------- 8. CUADRILLA: refranes, correos ---------- */
const RF_PATH='participa/refranes.json',RF_DEF={refranes:[]};
svSec('refranes',`<div class="card"><b>🗣️ Refranes de nuestros pueblos</b><div class="note">Dichos, refranes y frases de toda la vida de tu pueblo o valle. Mándanos el tuyo: lo revisamos y lo publicamos aquí.</div>
 <div class="row"><input id="rfQ" class="town" placeholder="🔎 Buscar refrán o pueblo…" style="flex:1;box-sizing:border-box"></div></div><div id="rfL"><div class="card"><div class="note">Cargando…</div></div></div>
 <div class="card"><b>✍️ Envía un refrán</b><textarea id="rfT" class="town" rows="2" maxlength="300" placeholder="El refrán o dicho" style="width:100%;box-sizing:border-box;margin-top:6px"></textarea>
 <input id="rfS" class="town" maxlength="200" placeholder="¿Qué quiere decir? (opcional)" style="width:100%;box-sizing:border-box;margin-top:6px">
 <input id="rfP" class="town" maxlength="60" placeholder="Pueblo o valle donde se dice" style="width:100%;box-sizing:border-box;margin-top:6px">
 <label class="note" style="display:flex;gap:8px;align-items:flex-start;margin-top:8px"><input type="checkbox" class="rfOk"><span>Tengo <b>14 años o más</b>.</span></label>
 <label class="note" style="display:flex;gap:8px;align-items:flex-start;margin-top:4px"><input type="checkbox" class="rfOk"><span>No incluye datos personales ni insultos.</span></label>
 <input type="checkbox" id="rfH" style="display:none" tabindex="-1" autocomplete="off">
 <div class="row"><button class="btn pri" id="rfE">📨 Enviar</button></div><div class="note" id="rfM"></div><div class="note">Es anónimo: no pedimos tu nombre ni tu correo.</div></div>`);
nuevo('refranes','Participa','🗣️ Refranes de tu pueblo','pueblo','i-refran','r');
let RFED=null;
async function rfRender(){const G=await jsLoad(RF_PATH,RF_DEF),q=N(($('rfQ')||{}).value||'');
  const L=(G.refranes||[]).filter(r=>!q||N(r.t+' '+(r.s||'')+' '+(r.p||'')).includes(q)).sort((a,b)=>(a.p||'').localeCompare(b.p||'','es'));
  $('rfL').innerHTML=`<div class="card">${L.length?L.map(r=>`<div class="amRow" style="display:block"><div style="font-family:Georgia,serif;font-size:16px">«${esc(r.t)}»</div>${r.s?`<div class="note">${esc(r.s)}</div>`:''}<div class="note">📍 ${esc(r.p||'Navarra')}</div>
     ${TECH?`<div class="row"><button class="btn" data-del="${esc(r.id)}">🗑️ Quitar</button></div>`:''}</div>`).join(''):'<div class="note">Todavía no hay refranes. ¡Sé el primero en mandar uno!</div>'}
   ${TECH?`<div style="margin-top:8px;border-top:1px solid var(--line);padding-top:8px"><b>➕ Publicar refrán (administrador)</b><input id="rfAT" class="town" placeholder="Refrán" style="width:100%;box-sizing:border-box;margin-top:4px"><input id="rfAS" class="town" placeholder="Significado" style="width:100%;box-sizing:border-box;margin-top:4px"><input id="rfAP" class="town" placeholder="Pueblo" style="width:100%;box-sizing:border-box;margin-top:4px"><div class="row"><button class="btn pri" id="rfAG">💾 Publicar</button></div></div>`:''}</div>`;
  if(TECH){$('rfAG').onclick=async()=>{const t=$('rfAT').value.trim();if(!t)return;try{await jsEdit(RF_PATH,RF_DEF,d=>{(d.refranes=d.refranes||[]).push({id:Date.now().toString(36),t,s:$('rfAS').value.trim(),p:$('rfAP').value.trim()});},'Refrán nuevo');toast('✅ Publicado');rfRender();}catch(e){toast('❌ '+e.message);}};
    $('rfL').querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{if(!confirm('¿Quitar este refrán?'))return;try{await jsEdit(RF_PATH,RF_DEF,d=>{d.refranes=(d.refranes||[]).filter(r=>r.id!==b.dataset.del);},'Refrán quitado');rfRender();}catch(e){toast('❌ '+e.message);}});}}
(function(){$('rfQ').oninput=()=>rfRender();
  $('rfE').onclick=async()=>{const m=$('rfM'),t=$('rfT').value.trim();if($('rfH').checked)return;if(t.length<5){m.textContent='❌ Escribe el refrán.';return;}
    if(![...document.querySelectorAll('.rfOk')].every(c=>c.checked)){m.textContent='❌ Marca las dos casillas.';return;}
    const ult=+(lsGet('rfUlt',0)||0);if(Date.now()-ult<30000){m.textContent='⏳ Espera unos segundos.';return;}
    const k=await amKey('participa');if(!k){m.textContent='⏳ El envío todavía no está activado. Inténtalo más tarde.';return;}
    m.textContent='Enviando…';try{const ok=await w3Send(k,{subject:'BasatiNA · 🗣️ Refrán nuevo',from_name:'Cuadrilla BasatiNA',refran:t,significado:$('rfS').value.trim()||'—',pueblo:$('rfP').value.trim()||'—',casillas:'14 años o más · sin datos personales',botcheck:false});
      if(ok){m.textContent='✅ ¡Eskerrik asko! Lo revisaremos y saldrá publicado.';['rfT','rfS','rfP'].forEach(i=>$(i).value='');document.querySelectorAll('.rfOk').forEach(c=>c.checked=false);lsSet('rfUlt',Date.now());}
      else m.textContent='❌ No se pudo enviar. Prueba otra vez.';}catch(e){m.textContent='❌ No se pudo enviar. Prueba otra vez.';}};})();
svHook('refranes',rfRender);

// correos: participa@basatina.es (buzón, fotos, refranes) y alertas@basatina.es (alertas ciudadanas). Cada uno con su clave de Web3Forms.
async function amKey(q){if(q==='alertas'){const a=await keyGet('web3forms_alertas');if(a)return a;}return keyGet('web3forms');}
window.amKey=amKey;
(function(){const ky=$('kyW3');if(!ky)return;const card=ky.closest('.card');
  card.querySelector('.note').innerHTML='Créala gratis en web3forms.com poniendo <b>participa@basatina.es</b>: la clave llega a ese correo. Ahí llegan el buzón, las fotos y los refranes. Al guardarla se envía un mensaje de prueba.';
  card.insertAdjacentHTML('afterend',`<div class="card tech" style="display:none"><b>🔧 Clave de las alertas ciudadanas (Web3Forms)</b><div class="note">Créala en web3forms.com con <b>alertas@basatina.es</b>. Cada alerta ciudadana nueva os llegará a ese correo (tipo, texto y sitio; nunca datos de quien la manda).</div>
   <input id="kyAl" class="town" autocomplete="off" placeholder="Pega aquí la clave (access key)" style="width:100%;box-sizing:border-box;margin-top:6px"><div class="row"><button class="btn pri" id="kyAlS">💾 Guardar clave de alertas</button></div><div class="note" id="kyAlM"></div></div>`);
  $('kyAlS').onclick=async()=>{const m=$('kyAlM'),v=$('kyAl').value.trim();if(!v){m.textContent='Pega la clave primero';return;}if(!ghTok()){m.textContent='❌ Falta la llave de edición de GitHub en este móvil';return;}
    m.textContent='Enviando un mensaje de prueba…';
    try{if(!await w3Send(v,{subject:'BasatiNA · Prueba de alertas ciudadanas',from_name:'Alertas BasatiNA',mensaje:'Si te llega este correo, los avisos de alertas ciudadanas ya llegan a alertas@basatina.es. 🎉'})){m.textContent='❌ Web3Forms no acepta esa clave.';return;}
      let sha=null;try{const r=await fetch(GH_API+'config/web3forms_alertas.json?ref=main',{headers:{Authorization:'Bearer '+ghTok()}});if(r.ok)sha=(await r.json()).sha;}catch(e){}
      await ghPut('config/web3forms_alertas.json',b64u(JSON.stringify({key:v})),'Clave de las alertas ciudadanas',sha);KEYS.web3forms_alertas=v;m.textContent='✅ Guardada. Te habrá llegado un correo de prueba a alertas@basatina.es.';}catch(e){m.textContent='❌ No se pudo guardar: '+e.message;}};
  try{techApply();}catch(e){}})();
// textos con los correos nuevos
(function(){const sw=(root)=>{const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode()))if(/participa@sonpe-technology\.es/.test(n.textContent))n.textContent=n.textContent.replace(/participa@sonpe-technology\.es/g,'participa@basatina.es');};
  ['t-buzon','t-privacidad','t-about'].forEach(id=>{const s=$(id);if(s)sw(s);});document.querySelectorAll('section').forEach(sw);})();

/* ---------- 9. ACERCA DE ---------- */
(function(){const s=$('t-about');if(!s)return;const b=[...s.querySelectorAll('.card b')].find(x=>x.textContent.trim()==='¿Qué es?');if(!b)return;
  b.nextElementSibling.innerHTML='<b>BasatiNA</b> es <i>Navarra en tu bolsillo</i>: una app gratuita y sin ánimo de lucro para conocer, vivir y cuidar Navarra. Reúne en un solo sitio el tiempo y los ríos en directo, las carreteras, la naturaleza, los pueblos y su historia, la salud, los terremotos, la agenda cultural y deportiva, rutas a pie, en bici y en moto, y una cuadrilla de gente que comparte alertas, fotos y refranes.<br><br>Nació como un simulador de riadas del río Arga y ha crecido hasta mirar a toda Navarra, de los Pirineos a las Bardenas. La hacen Sonia y Pedro (Son&amp;Pe Technology Systems) con datos públicos y abiertos.';})();

/* ---------- 10. QUÉ HACER: sin pestaña «Todo» en Agenda cultural y Deporte ---------- */
function sinTodo(id,get,set,render){const el=$(id);if(!el)return;const b0=el.querySelector('button[data-v=""]');if(b0)b0.style.display='none';
  el.querySelectorAll('button[data-v]:not([data-v=""])').forEach(b=>{const f=b.onclick;b.onclick=e=>{if(get()===b.dataset.v){set('');render();}else f&&f.call(b,e);};});}
if(typeof agRender==='function'){const _ag=agRender;agRender=async function(){const r=await _ag.apply(this,arguments);sinTodo('agCat',()=>AGCAT,v=>{AGCAT=v;},agRender);return r;};}
if(typeof dpRender==='function'){const _dp=dpRender;dpRender=async function(){const r=await _dp.apply(this,arguments);sinTodo('dpDep',()=>DPDEP,v=>{DPDEP=v;DPCOMP='';},dpRender);return r;};}

try{if(typeof applyIcons==='function')applyIcons((CFG.iconos||'pro')==='pro');}catch(e){}
})();
