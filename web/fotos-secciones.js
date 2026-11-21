/* =====================================================================
   📷 FOTOS REALES EN LAS SECCIONES (21 nov. 2026, petición de Pedro) — se carga el último
   Cambia la cabecera animada («Navarra viva») de algunas secciones por una FOTO real, y las pestañas
   de dentro por tarjetas con foto y una franja de color abajo (diseño que eligió Pedro).
   Empieza por 🛒 Supermercados y mercados. Para añadir otra sección: una entrada en FS_CAB (cabecera)
   y, si tiene pestañas, otra en FS_TABS. Las fotos van en web/foto-*.webp (sueltas en web/: el actualizador no entra en carpetas; WebP, cabecera 900×375, pestañas 480×300).

   FOTOS: todas de Wikimedia Commons con licencia libre. La licencia CC BY-SA obliga a poner el autor y
   la licencia: salen en letra pequeña al final de la sección (FS_CRED) y en las fuentes de la app.
   Se buscaron con el robot tools/fotos_commons.py (rama fotos-candidatas) y se eligieron a mano.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const FS_CAB={super:'foto-super-cabecera.webp'};
// pestañas: [contenedor, {valor: [foto, color de la franja]}]
const FS_TABS={super:['suSeg',{super:['foto-super-tab-super.webp','#2e7d32'],mercado:['foto-super-tab-mercado.webp','#e0640f'],semana:['foto-super-tab-semana.webp','#2e7d32']}]};
const FS_CRED={super:[
 ['Cabecera','Benjamín Núñez González','CC BY-SA 4.0','https://commons.wikimedia.org/wiki/File:Mercado_de_la_Cebada,_un_puesto_de_fruta,_Madrid,_Espa%C3%B1a,_2015_09.JPG'],
 ['Supermercados','Wilfredor','CC BY-SA 4.0','https://commons.wikimedia.org/wiki/File:Fresh_produce_shelves_in_L_Intermarche_supermarket_in_Quebec_City.jpg'],
 ['Mercados (Santo Domingo, Pamplona)','Millars','CC BY-SA 4.0','https://commons.wikimedia.org/wiki/File:Market_of_Santo_Domingo,_Pamplona_02.jpg'],
 ['Mercadillos (Estella-Lizarra)','El Pantera','CC BY-SA 3.0','https://commons.wikimedia.org/wiki/File:Estella-Mercadillo_MIN-DSC07614.JPG']]};

const st=document.createElement('style');st.textContent=`
body.bna #pvSec.fsFoto{background:#1d2b36 center/cover no-repeat}
body.bna #pvSec.fsFoto canvas{display:none}
body.bna #pvSec.fsFoto:before{content:"";position:absolute;inset:0;z-index:0;background:linear-gradient(90deg,rgba(0,0,0,.62) 0%,rgba(0,0,0,.35) 55%,rgba(0,0,0,.05) 100%)}
body.bna #pvSec.fsFoto .pvsC{display:none}
body.bna #pvSec.fsFoto .pvsT{z-index:1}
.fsTabs{display:grid!important;grid-template-columns:repeat(3,1fr);gap:8px!important;background:none!important;padding:0!important}
.fsTabs button{position:relative;height:96px;border-radius:16px!important;overflow:hidden;border:0!important;padding:0!important;background-color:#9aa7a0!important;background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;
  box-shadow:0 2px 8px rgba(0,0,0,.15);color:#fff!important;font-weight:800!important;font-size:12.5px!important;display:flex;align-items:flex-end;justify-content:center;transition:transform .15s}
.fsTabs button span{position:relative;z-index:1;width:100%;padding:16px 4px 7px;text-align:center;line-height:1.15;white-space:nowrap;letter-spacing:-.01em}
.fsTabs button span:before{content:"";position:absolute;inset:0;z-index:-1;background:var(--fsc);clip-path:path('M0 14 Q 40 0 80 9 T 200 6 L 200 60 L 0 60 Z')}
.fsTabs button.on{outline:3px solid var(--fsc);outline-offset:2px;transform:scale(1.02)}
.fsTabs button:not(.on){filter:saturate(.85)}
.fsCred{font-size:11px;color:var(--mut);margin:0 8px 12px;line-height:1.45}.fsCred a{color:inherit}`;
document.head.appendChild(st);

function fsTabs(t){const c=FS_TABS[t];if(!c)return;const el=$(c[0]);if(!el||el.dataset.fs)return;el.dataset.fs=1;el.classList.add('fsTabs');
  el.querySelectorAll('button').forEach(b=>{const f=c[1][b.dataset.v];if(!f)return;
    const txt=b.textContent.trim().replace(/^[^\wÁÉÍÓÚÑáéíóúñ]+/,'');b.style.setProperty('background-image',`url("${f[0]}")`,'important');b.style.setProperty('--fsc',f[1]);b.innerHTML=`<span>${txt}${b.dataset.v==='semana'?' ›':''}</span>`;});}
function fsCred(t){const L=FS_CRED[t],sec=$('t-'+t);if(!L||!sec||sec.querySelector('.fsCred'))return;
  const d=document.createElement('div');d.className='fsCred';
  d.innerHTML='📷 Fotos de Wikimedia Commons: '+L.map(([q,a,l,u])=>`${q}, <a href="${u}" target="_blank" rel="noopener">${a}</a> (${l})`).join(' · ')+'.';
  sec.appendChild(d);d.querySelectorAll('a').forEach(a=>a.onclick=e=>{if(window.amAbre){e.preventDefault();amAbre(a.href);}});}
function fsCab(t){const el=$('pvSec');if(!el)return;const f=FS_CAB[t];
  if(f){el.classList.add('fsFoto');el.style.backgroundImage=`url("${f}")`;
    try{if(PVSraf){cancelAnimationFrame(PVSraf);PVSraf=0;}}catch(e){}}   // sin animación debajo de la foto: ahorra batería
  else{el.classList.remove('fsFoto');el.style.backgroundImage='';}}
function fsAplica(t){try{fsCab(t);fsTabs(t);fsCred(t);}catch(e){console.log(e);}}
const _st=showTab;showTab=function(t){_st.apply(this,arguments);fsAplica(t);};
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&typeof BNTAB!=='undefined'&&FS_CAB[BNTAB])setTimeout(()=>fsCab(BNTAB),50);});
try{Object.assign(window.BNA_DATOS||{},{fotos:'fotos de las secciones: Wikimedia Commons (licencias CC BY-SA, autores en cada sección)'});}catch(e){}
})();
