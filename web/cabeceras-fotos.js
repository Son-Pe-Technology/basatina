/* =====================================================================
   📷 CABECERAS CON FOTO (24 nov. 2026, fotos elegidas por Pedro) · se carga después de perfil-foto.js
   Desde el 23 nov. 2026 las secciones van sin fotos (fotos-secciones.js ya no se carga). Pedro ha
   vuelto a poner foto SOLO en la cabecera de estas secciones: la cabecera animada («Navarra viva»,
   #pvSec) se cambia por la foto, con el título encima. No toca pestañas ni tarjetas.
   Fotos: web/foto-cab2-<sección>.webp (900×375, WebP, SUELTAS en web/: el actualizador no entra en carpetas).
   Créditos: letra pequeña al final de cada sección. Si el autor va vacío (''), solo sale qué es la foto. Para añadir otra sección: una línea en CF.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const P='Pedro Iglesias Goñi',S='Sonia U.P.',M='Miren I.G.',A='Embutidos Arrieta',PR='foto propia',CE='foto cedida';
// sección: [foto, qué es, autor, licencia, enlace]
const CF={
 agenda:['foto-cab2-agenda.webp','Gigantes en San Fermín','San Fermin Pamplona Navarra from España','CC0','https://commons.wikimedia.org/wiki/File:14_de_julio_d%C3%ADa_de_despedidas_(29969735828).jpg'],
 incid:['foto-cab2-incid.webp','carretera bajo un cielo aborregado',M,PR,''],
 tiempo:['foto-cab2-tiempo.webp','cielo aborregado',P,PR,''],
 caudal:['foto-cab2-caudal.webp','Puente de la Rabia, Zubiri (río Arga)',S,PR,''],
 comer:['foto-cab2-comer.webp','chistorra, morcilla y panceta',A,CE,''],
 dormir:['foto-cab2-dormir.webp','luna sobre los tejados',P,PR,''],
 cocina:['foto-cab2-cocina.webp','garbanzos con chorizo',A,CE,''],
 patrimonio:['foto-cab2-patrimonio.webp','Virgen de Orreaga/Roncesvalles, Real Colegiata de Roncesvalles',P,PR,''],
 biodiversidad:['foto-cab2-biodiversidad.webp','Nacedero del Urederra',S,PR,''],
 ident:['foto-cab2-ident.webp','araña cangrejo sobre flores amarillas',S,PR,''],
 // 25 nov. 2026: 10 cabeceras más, elegidas por Pedro
 noticias:['foto-cab2-noticias.webp','imprenta antigua (foto libre)','','',''],
 cerca:['foto-cab2-cerca.webp','Casco Viejo de Pamplona con la torre de San Cernin (foto libre)','','',''],
 radar:['foto-cab2-radar.webp','nubes mammatus antes de la tormenta',M,PR,''],
 nieve:['foto-cab2-nieve.webp','parque nevado',P,PR,''],
 astro:['foto-cab2-astro.webp','Luna entre los árboles',P,PR,''],
 energia:['foto-cab2-energia.webp','aerogeneradores al atardecer',M,PR,''],
 clima:['foto-cab2-clima.webp','nube de tormenta',P,PR,''],
 emb:['foto-cab2-emb.webp','embalse de Yesa visto desde el monte',S,PR,''],
 prev:['foto-cab2-prev.webp','sol entre las nubes',S,PR,''],
 enp:['foto-cab2-enp.webp','río entre hayedos',S,PR,''],
 // 25 nov. 2026 (2.ª tanda): 7 cabeceras más, elegidas por Pedro (Plantas medicinales cambia la lavanda por la margarita)
 monte:['foto-cab2-monte.webp','camino entre hayas en otoño',S,PR,''],
 pedalea:['foto-cab2-pedalea.webp','bicis públicas en el Casco Viejo de Pamplona (foto libre)','','',''],
 moto:['foto-cab2-moto.webp','moto por una carretera entre árboles (foto libre)','','',''],
 picnic:['foto-cab2-picnic.webp','merendero en el hayedo en otoño (foto libre)','','',''],
 juegos:['foto-cab2-juegos.webp','fuegos artificiales',S,PR,''],
 sismo:['foto-cab2-sismo.webp','Foz de Lumbier',S,PR,''],
 medic:['foto-cab2-medic2.webp','margarita entre la hierba',S,PR,''],
 // 25 nov. 2026 (3.ª tanda): 7 cabeceras más, elegidas por Pedro (Actividad sísmica cambia de foto)
 gas:['foto-cab2-gas.webp','gasolinera de noche (foto libre)','','',''],
 cultura:['foto-cab2-cultura.webp','Plaza del Castillo de Pamplona al atardecer',S,PR,''],
 cines:['foto-cab2-cines.webp','sala de cine (foto libre)','','',''],
 deporte:['foto-cab2-deporte.webp','partido de pelota en el frontón Labrit (Pamplona)',P,PR,''],
 peques:['foto-cab2-peques.webp','gigante en San Fermín (foto libre)','','','']
};
const st=document.createElement('style');st.textContent=`
body.bna #pvSec.cfFoto{background:#1d2b36 center/cover no-repeat}
body.bna #pvSec.cfFoto canvas,body.bna #pvSec.cfFoto .pvsC,#pvSec.cfFoto .pvsT .bt{display:none!important}
body.bna #pvSec.cfFoto:before{content:"";position:absolute;inset:0;z-index:0;background:linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.6) 100%)}
#pvSec.cfFoto .pvsT{z-index:1;left:14px;right:14px;bottom:9px;gap:0;display:block}
#pvSec.cfFoto .pvsT b{font-size:16.5px!important;line-height:1.15}
#pvSec.cfFoto .pvsT small{font-size:11.5px!important;margin-top:1px}
.cfCred{font-size:11px;color:var(--mut);margin:0 8px 12px;line-height:1.45}.cfCred a{color:inherit}`;
document.head.appendChild(st);
// precarga suave para que la foto salga al momento
setTimeout(()=>{for(const k in CF){const i=new Image();i.src=CF[k][0];}},8000);
function cab(t){const el=$('pvSec');if(!el)return;const f=CF[t];
  if(f){el.classList.add('cfFoto');el.style.backgroundImage=`url("${f[0]}")`;try{if(PVSraf){cancelAnimationFrame(PVSraf);PVSraf=0;}}catch(e){}}   // sin animación debajo: ahorra batería
  else if(el.classList.contains('cfFoto')){el.classList.remove('cfFoto');el.style.backgroundImage='';}}
function cred(t){const f=CF[t];if(!f)return;const sec=document.querySelector('section.on')||$('t-'+t);if(!sec)return;
  let d=sec.querySelector(':scope>.cfCred');if(!d){d=document.createElement('div');d.className='cfCred';sec.appendChild(d);}
  const [,q,a,l,u]=f;d.innerHTML=a?`📷 Cabecera: ${q}, ${u?`<a href="${u}" target="_blank" rel="noopener">${a}</a>`:a} (${l}).`:`📷 Cabecera: ${q}.`;   // sin autor: solo qué es
  d.querySelectorAll('a').forEach(x=>x.onclick=e=>{if(window.amAbre){e.preventDefault();amAbre(x.href);}});}
const _st=showTab;showTab=function(t){_st.apply(this,arguments);try{cab(t);cred(t);}catch(e){console.log('cabeceras',e);}};
// al volver a la app, la animación puede haber vuelto a arrancar
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&typeof BNTAB!=='undefined'&&CF[BNTAB])setTimeout(()=>cab(BNTAB),50);});
})();
/* =====================================================================
   🔍 FOTO ENTERA AL TOCAR LA CABECERA (25 nov. 2026, lo pidió Pedro)
   La cabecera es un recorte apaisado (900×375). Al tocarla se abre el visor de fotos (#foBox) con la foto
   entera: web/fotos-full/foto-full-<sección>.webp (máx. 1600 px, en la CARPETA fotos-full para que el
   actualizador no la baje a todos los móviles: se pide a GitHub solo al tocar la cabecera). Si una sección no tiene foto entera,
   se enseña la de la cabecera. Para añadir una: guárdala en web/fotos-full/ y pon la sección en CF_FULL.
   ===================================================================== */
(function(){
const CF_FULL=new Set(['noticias','cerca','radar','nieve','astro','energia','clima','emb','prev','ident','gas','sismo','cultura','cines','deporte','peques']);
const st=document.createElement('style');st.textContent='body.bna #pvSec.cfFoto{cursor:zoom-in}#pvSec.cfFoto .cfLupa{position:absolute;right:10px;top:8px;z-index:2;width:30px;height:30px;border-radius:50%;background:rgba(0,0,0,.45);color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;pointer-events:none}#pvSec:not(.cfFoto) .cfLupa{display:none}';
document.head.appendChild(st);
function abre(){const el=document.getElementById('pvSec');if(!el||!el.classList.contains('cfFoto'))return;
  const t=typeof BNTAB!=='undefined'?BNTAB:'';const m=(el.style.backgroundImage||'').match(/url\("?([^")]+)"?\)/);if(!m)return;
  const box=document.getElementById('foBox'),img=document.getElementById('foBoxI'),tx=document.getElementById('foBoxT');if(!box||!img)return;
  // las fotos enteras NO van sueltas en web/ (el actualizador las bajaría a todos los móviles): están en
  // web/fotos-full/ y se piden a GitHub solo cuando alguien toca la cabecera. Sin internet, se ve la cabecera.
  img.onerror=()=>{img.onerror=null;img.src=m[1];};
  img.src=CF_FULL.has(t)?`${typeof GH_RAW!=='undefined'?GH_RAW:'https://raw.githubusercontent.com/Son-Pe-Technology/basatina/main/'}web/fotos-full/foto-full-${t}.webp`:m[1];
  const cr=document.querySelector('section.on>.cfCred');if(tx)tx.innerHTML=cr?`<div style="font-size:13px;opacity:.85">${cr.innerHTML}</div>`:'';
  box.style.display='flex';}
function pon(){const el=document.getElementById('pvSec');if(!el||el.dataset.cfZ)return;el.dataset.cfZ=1;
  el.addEventListener('click',e=>{if(e.target.closest('button,a'))return;abre();});
  el.insertAdjacentHTML('beforeend','<span class="cfLupa" aria-hidden="true">⤢</span>');}
const _s=showTab;showTab=function(t){const r=_s.apply(this,arguments);try{pon();}catch(e){}return r;};
setTimeout(pon,1500);
})();
