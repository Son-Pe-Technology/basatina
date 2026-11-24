/* =====================================================================
   📷 FOTOS PROPIAS EN LOS TITULARES (24 nov. 2026, lo pidió Pedro) — se carga después de temas.js
   No se usan nunca las fotos de los medios: cada titular lleva una foto vuestra según su tema.
   Datos: titulares-fotos.json + tit-*.webp (sueltos en web/) (lo hace tools/fotos_titulares.py con las carpetas del Drive
   «BasatiNA → Titulares»: campo, lluvia, osasuna, pamplona…).
   - El tema sale de las palabras del titular (lista «temas» del json; gana el primero que encaje).
   - La foto se elige con el enlace de la noticia: la misma noticia, siempre la misma foto.
   - Si el tema aún no tiene fotos, el titular va sin foto (como hasta ahora).
   Se pone en la lista de «Titulares de Navarra» (.tmNews dentro de #nwL).
   ===================================================================== */
(function(){
const N=s=>' '+String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9ñ\- ]+/g,' ').replace(/\s+/g,' ')+' ';
let TF=null;
async function carga(){if(TF)return TF;
  try{TF=await fetch('titulares-fotos.json',{cache:'no-cache'}).then(r=>r.json());}catch(e){TF={temas:{},fotos:{}};}
  TF.claves=Object.entries(TF.temas||{}).map(([k,L])=>[k,L.map(w=>{const n=N(w);return w.startsWith(' ')||w.endsWith(' ')?n:n.trim();})]);
  return TF;}
const hash=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h;};
function tema(t){const n=N(t);for(const [k,L] of TF.claves)if(L.some(w=>w&&n.includes(w)))return k;return null;}
window.tfFoto=function(titulo,url){if(!TF)return null;const k=tema(titulo);const F=k&&TF.fotos&&TF.fotos[k];if(!F||!F.length)return null;return F[hash(url||titulo)%F.length];};
const st=document.createElement('style');st.textContent=`
.tmNews.tfF{display:flex!important;gap:12px;align-items:center}
.tmNews.tfF>img{width:84px;height:63px;border-radius:12px;object-fit:cover;flex:none;background:#eef3ec}
.tmNews.tfF>.tfT{flex:1 1 auto;min-width:0}.tmNews.tfF>.tfT>b,.tmNews.tfF>.tfT>span{display:block}`;
document.head.appendChild(st);
async function pon(root){if(!root)return;await carga();
  root.querySelectorAll('.tmNews[data-u]:not(.tfOk)').forEach(a=>{a.classList.add('tfOk');const b=a.querySelector('b');if(!b)return;
    const f=tfFoto(b.textContent,a.dataset.u);if(!f)return;
    const w=document.createElement('span');w.className='tfT';while(a.firstChild)w.appendChild(a.firstChild);
    const im=document.createElement('img');im.src=f;im.alt='';im.loading='lazy';a.append(im,w);a.classList.add('tfF');});}
const L=document.getElementById('nwL');
if(L){new MutationObserver(()=>pon(L)).observe(L,{childList:true});pon(L);}
})();
