/* =====================================================================
   ❤️ MI ACTIVIDAD (17 nov. 2026) — se carga después de juegos-peques.js
   Pasos y pulsaciones del reloj (Samsung, Fitbit, Garmin, Xiaomi…) a través de Health Connect.
   - La parte Android está en app/.../Salud.kt y en MainActivity (AndroidNet.salud*).
   - Necesita la APK 4.6 (versionCode 26) o superior. Con una APK anterior, esta pantalla
     avisa de que hay que actualizar la app (la web se actualiza sola, la APK no).
   - En la versión web (navegador) no hay Health Connect: se explica y ya está.
   - Los datos NO se guardan ni se envían: se leen de Health Connect y se enseñan.
   Está en Mi Espacio → ❤️ Mi actividad (reloj).
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const N=window.AndroidNet||{};
const HAY=typeof N.saludEstado==='function';          // ¿la APK ya trae el puente de salud?
const num=n=>Number(n||0).toLocaleString('es-ES');
const DIAS=['dom','lun','mar','mié','jue','vie','sáb'];

// llamada al puente con respuesta asíncrona (mismo sistema que AndroidNet.get)
let k=0;
function pide(fn){return new Promise(res=>{const id='salud'+(++k)+'_'+Date.now();
  window.__netCbs[id]=r=>{let j={ok:false};try{j=JSON.parse(r.body);}catch(e){}res(j);};
  try{N[fn](id);}catch(e){delete window.__netCbs[id];res({ok:false,error:String(e)});}});}

const st=document.createElement('style');st.textContent=`
#t-actividad .saBig{font-size:2.6em;font-weight:900;line-height:1;color:var(--acc)}
#t-actividad .saGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px;text-align:center}
#t-actividad .saGrid div{background:rgba(127,127,127,.08);border-radius:12px;padding:8px 4px}
#t-actividad .saGrid b{display:block;font-size:1.4em}
#t-actividad .saBars{display:flex;align-items:flex-end;gap:6px;height:120px;margin-top:10px}
#t-actividad .saBars div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;font-size:.75em}
#t-actividad .saBars i{display:block;width:100%;border-radius:6px 6px 0 0;background:var(--acc);min-height:2px;opacity:.85}
#t-actividad .saBars .hoy i{opacity:1;box-shadow:0 0 0 2px rgba(0,0,0,.08) inset}
#t-actividad ol{margin:6px 0 0 18px;padding:0}`;
document.head.appendChild(st);

svSec('actividad',`
<div class="card"><b>❤️ Mi actividad</b>
 <div class="note">Pasos y pulsaciones de tu reloj o pulsera (Samsung, Fitbit, Garmin, Xiaomi…), leídos de <b>Health Connect</b>, el almacén de salud de Android. No se guardan ni se envían a ningún sitio: solo se enseñan aquí.</div>
 <div class="row" style="margin-top:8px"><button class="btn pri" id="saBtn">🔄 Actualizar</button></div>
 <div id="saMsg" class="note" style="margin-top:6px"></div></div>
<div id="saDatos"></div>
<div class="card"><details><summary><b>⌚ Cómo conectar tu reloj</b></summary>
 <ol class="note">
  <li>Tu reloj tiene que estar sincronizado con su app (Samsung Health, Fitbit, Garmin Connect, Zepp, Mi Fitness…).</li>
  <li>En esa app, activa <b>Health Connect</b>. En Samsung Health: <b>⋮ → Ajustes → Health Connect</b> y deja que escriba pasos y frecuencia cardiaca.</li>
  <li>Vuelve aquí, pulsa <b>Conectar</b> y marca <b>Pasos</b> y <b>Frecuencia cardiaca</b>.</li>
  <li>Los datos tardan un poco en llegar: el reloj los pasa a su app y esta a Health Connect cada cierto tiempo.</li>
 </ol>
 <div class="note">Puedes quitar el permiso cuando quieras en Ajustes del móvil → Health Connect → BasatiNA. <a href="#" onclick="foOpenUrl&&foOpenUrl('https://basatina.es/privacidad.html#salud');return false" style="color:var(--acc)">Privacidad</a></div>
</details></div>`);

function msg(h){$('saMsg').innerHTML=h||'';}
function datos(h){$('saDatos').innerHTML=h||'';}

function pinta(d){
  let h='';
  if(d.pasos!=null){
    const sem=d.semana||[],max=Math.max(1,...sem.map(x=>x.pasos||0)),hoy=sem.length?sem[sem.length-1].dia:'';
    h+=`<div class="card"><b>👣 Pasos de hoy</b><div class="saBig">${num(d.pasos)}</div>`;
    if(sem.length){const media=Math.round(sem.reduce((a,x)=>a+(x.pasos||0),0)/sem.length);
      h+=`<div class="saBars">${sem.map(x=>{const f=new Date(x.dia+'T12:00');return `<div class="${x.dia===hoy?'hoy':''}" title="${num(x.pasos)} pasos"><span>${x.pasos>=1000?Math.round(x.pasos/1000)+'k':x.pasos}</span><i style="height:${Math.round((x.pasos||0)/max*85)}%"></i><span>${DIAS[f.getDay()]}</span></div>`;}).join('')}</div>
      <div class="note">Media de los 7 últimos días: <b>${num(media)}</b> pasos al día.</div>`;}
    h+='</div>';}
  if(d.pulso){const p=d.pulso;
    h+=`<div class="card"><b>💓 Pulsaciones de hoy</b>`;
    if(p.ultimo!=null)h+=`<div class="saBig">${p.ultimo} <span style="font-size:.4em">ppm</span></div><div class="note">Última medida a las ${p.hora||'—'}</div>`;
    if(p.media!=null)h+=`<div class="saGrid"><div><b>${p.min??'—'}</b>mínima</div><div><b>${p.media??'—'}</b>media</div><div><b>${p.max??'—'}</b>máxima</div></div>`;
    else h+='<div class="note">Hoy todavía no hay pulsaciones guardadas.</div>';
    h+='<div class="note" style="margin-top:6px">Datos orientativos del reloj, no son una medida médica.</div></div>';}
  datos(h);
}

async function carga(){
  const b=$('saBtn');datos('');
  if(!APP){msg('Esta parte solo funciona en la <b>app de Android</b>: el navegador no puede leer los datos del reloj.');b.style.display='none';return;}
  if(!HAY){msg('Para esto hace falta la <b>versión 4.6</b> de la app. Ve a <b>Ajustes → Buscar nueva versión</b>.');b.style.display='none';return;}
  const e=N.saludEstado();
  if(e==='no'){msg('Este móvil no admite Health Connect (hace falta Android 8 o superior con los servicios de Google).');b.style.display='none';return;}
  if(e==='instalar'){msg('Falta instalar o actualizar <b>Health Connect</b> desde Google Play.');b.textContent='📲 Instalar Health Connect';b.onclick=()=>N.saludInstalar();b.style.display='';return;}
  msg('Leyendo…');
  const p=await pide('saludConcedidos');
  if(!p.ok||(!p.pasos&&!p.pulso)){msg('BasatiNA todavía no tiene permiso para leer tus pasos y pulsaciones.');b.textContent='⌚ Conectar';b.onclick=conecta;b.style.display='';return;}
  const d=await pide('saludHoy');
  b.textContent='🔄 Actualizar';b.onclick=carga;b.style.display='';
  if(!d.ok){msg(d.error==='sin-permiso'?'Se ha quitado el permiso. Pulsa Conectar otra vez.':'No se han podido leer los datos. Prueba otra vez en un rato.');return;}
  msg((!p.pasos||!p.pulso)?'Solo has dado permiso para '+(p.pasos?'los pasos':'las pulsaciones')+'. <a href="#" id="saMas" style="color:var(--acc)">Dar el otro</a>':'');
  const m=$('saMas');if(m)m.onclick=ev=>{ev.preventDefault();conecta();};
  pinta(d);
  if(!d.pasos&&!(d.pulso&&d.pulso.media!=null))msg('Hoy todavía no han llegado datos. Mira «Cómo conectar tu reloj» abajo.');
}
async function conecta(){msg('Abriendo Health Connect…');await pide('saludPermisos');carga();}
$('saBtn').onclick=carga;

/* ---------- menú: Mi Espacio → ❤️ Mi actividad (reloj) ---------- */
(function(){const dr=$('drawer');if(!dr)return;
  const g=[...dr.querySelectorAll('.dgroup')].find(x=>/mi espacio/i.test(x.textContent));
  const sub=g&&g.nextElementSibling;if(sub&&sub.classList.contains('dsub')&&!sub.querySelector('[data-t="actividad"]')){
    const b=document.createElement('button');b.dataset.t='actividad';b.textContent='❤️ Mi actividad (reloj)';
    b.onclick=()=>{showTab('actividad');menu(false);};sub.appendChild(b);}
  try{TITLES.actividad='❤️ Mi actividad';PVS_ESC.actividad='bokeh';}catch(e){}
  try{Object.assign(I18N.eu,{'❤️ Mi actividad (reloj)':'❤️ Nire jarduera (erlojua)','❤️ Mi actividad':'❤️ Nire jarduera'});
    Object.assign(I18N.en,{'❤️ Mi actividad (reloj)':'❤️ My activity (watch)','❤️ Mi actividad':'❤️ My activity'});
    Object.assign(I18N.fr,{'❤️ Mi actividad (reloj)':'❤️ Mon activité (montre)','❤️ Mi actividad':'❤️ Mon activité'});}catch(e){}})();

// al entrar en la pantalla, se leen los datos
const _stS=showTab;showTab=function(t){_stS(t);if(t==='actividad')setTimeout(carga,40);};
})();
