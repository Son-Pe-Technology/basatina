/* =====================================================================
   🌧️ RADAR CON PREVISIÓN DESDE LA CACHÉ CENTRAL (26 nov. 2026, lo pidió Pedro) — se carga el último
   Antes, cada móvil pedía sus teselas a Rainbow.ai con la clave: unas 19 imágenes por trozo de mapa y otra
   vez cada 10 minutos con el Inicio abierto. En 12 días se gastaron 8.100 de las 10.000 llamadas gratis del mes.
   Ahora:
   - Los móviles YA NO llaman nunca a Rainbow. El pasado (últimas 2 horas) sale de RainViewer (gratis) y la
     previsión de 4 horas la pide UNA vez para todos el robot tools/radar_rainbow.py (radar.yml), que la deja
     en la rama «radar» del repositorio: rainbow.json + radar/<imagen>/<segundos>/<z>/<x>/<y>.png, ya con
     los colores de la leyenda (RD_PAL).
   - Si no llueve cerca, el robot no pide previsión y el radar sale solo con el pasado, como sin clave.
   - Vale también en la web (antes, por CORS, la web no podía enseñar la previsión).
   ===================================================================== */
(function(){
if(typeof rdLoad!=='function'||typeof _rdLoad0!=='function')return;
const RC='https://raw.githubusercontent.com/Son-Pe-Technology/basatina/radar/';
async function rcFrames(){try{const r=await fetch(RC+'rainbow.json?t='+Math.floor(Date.now()/300000));if(!r.ok)return [];const j=await r.json();
    if(!j||!j.snap||!Array.isArray(j.frames))return [];
    return j.frames.map(f=>({time:f.t,url:(z,X,Y)=>`${RC}radar/${j.snap}/${f.ft}/${z}/${X}/${Y}.png`,nc:1,z:j.z||7}));}catch(e){return [];}}
// carga: pasado de RainViewer + rayos de Euskalmet (como antes) y, detrás, la previsión central
rdLoad=async function(){
  const [_,fut]=await Promise.all([Promise.all([_rdLoad0(),typeof eusLoad==='function'?eusLoad():null]),rcFrames()]);
  const past=RDF.filter(f=>!f.nc),ult=past.length?past[past.length-1].time:Date.now()/1000-600;
  const nc=fut.filter(f=>f.time>ult);   // la previsión que ya ha pasado no se enseña
  if(nc.length){RDF=past.concat(nc);
    const s=document.getElementById('rdT');if(s){s.max=RDF.length-1;if(RDI>RDF.length-1)RDI=past.length-1;s.value=RDI;}
    const src=document.getElementById('rdSrc');if(src)src.textContent='Radar: RainViewer (últimas 2 horas) y Rainbow.ai (previsión de 4 horas). 🔮 = previsión.';}
  if(RDM){rdShow();RDM.draw();}};
// pintar: los fotogramas de la caché central solo tienen un zoom (z); el resto, como siempre
const _rp=rdPaint;
rdPaint=function(x,P,b,path,cache,redraw){const f=RDF.find(g=>g===path||g.path===path)||null;
  if(f&&f.z)return drawTiles(x,P,b,f.url,cache,f.z,f.z,1,redraw);
  if(f&&f.url&&!f.path)return;           // fotograma viejo de Rainbow directo: ya no se pide
  return _rp.apply(this,arguments);};
// lo que estuviera cargado con el sistema anterior se tira y se vuelve a cargar
try{RDF=[];RDT={};MTRT={};if(RDM||document.getElementById('t-radar')?.classList.contains('on'))rdLoad();}catch(e){}
})();
