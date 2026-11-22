/* =====================================================================
   ✨ MEJORAS DE SONIA (22 nov. 2026) — se carga el último
   Lista de mejoras que apuntó Sonia en el móvil. Aquí van las que tocan varias pantallas a la vez
   (los cambios sencillos están directamente en su archivo: temas.js, rios-plus.js, servicios-ui.js…).
   1. Apartados plegables (ver plegables.js): El tiempo (24 h y 7 días), Caudal de los ríos,
      Embalses (nombre y % siempre a la vista; el detalle, plegado) y Terremotos.
   2. «Mercados semanales» pasa a ser la pestaña «Mercadillos» de «Supermercados y mercados».
   3. «Titulares de Navarra» + «Noticias curiosas» = «Noticias» (titulares arriba y curiosas plegables debajo).
   4. «Localidades de Navarra» y «Comarcas, valles y merindades» = «Localidades y Comarcas» (una pantalla, dos pestañas).
   5. «NA Pádel» y «Deporte rural» salen de «Qué hacer»: se llega desde «Deporte navarro».
   6. «Terremotos» se llama «Actividad sísmica».
   Las pantallas viejas (mercados, curiosas, comarcas) siguen existiendo por dentro: si algo las abre
   (un acceso directo, un aviso…), se va a su sitio nuevo.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const P=(el,o)=>{if(el&&window.msPlegar)msPlegar(el,o);};
const st=document.createElement('style');st.textContent=`
.msSub{margin-top:12px;padding-top:10px;border-top:1px solid var(--line)}
#msMasDep .row{flex-wrap:wrap;gap:6px}
/* los cinco ríos siempre en una sola fila (el Ebro ya no baja a la fila de abajo) */
.seg.msRios{flex-wrap:nowrap!important}.seg.msRios>.btn{flex:1 1 0!important;min-width:0!important;padding-left:3px!important;padding-right:3px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#drawer button[data-t="mercados"],#drawer button[data-t="curiosas"],#drawer button[data-t="comarcas"],
#drawer button[data-t="padel"],#drawer button[data-t="rural"]{display:none!important}`;
document.head.appendChild(st);

/* ---------- traducciones de los textos nuevos ---------- */
try{const T={
 'Noticias':['Albisteak','News','Actualités'],
 'Localidades y Comarcas':['Herriak eta eskualdeak','Towns and districts','Localités et comarques'],
 'Actividad sísmica':['Jarduera sismikoa','Seismic activity','Activité sismique'],
 'Actividad sísmica, fallas y placas':['Jarduera sismikoa, failak eta plakak','Seismic activity, faults and plates','Activité sismique, failles et plaques'],
 'Actividad sísmica y fallas':['Jarduera sismikoa eta failak','Seismic activity and faults','Activité sismique et failles'],
 'Más info':['Informazio gehiago','More info','Plus d’infos'],'Detalles':['Xehetasunak','Details','Détails'],
 'Previsión de los próximos 3 días.':['Hurrengo 3 egunetako iragarpena.','Forecast for the next 3 days.','Prévisions pour les 3 prochains jours.'],
 'El punto azul del mapa eres tú (dónde estás ahora).':['Mapako puntu urdina zu zara (orain zauden lekua).','The blue dot on the map is you (where you are now).','Le point bleu sur la carte, c’est vous (là où vous êtes).'],
 'Si nieva, la nieve se ve en azul claro y blanco.':['Elurra egiten badu, urdin argiz eta zuriz ikusten da.','If it snows, snow shows in light blue and white.','S’il neige, la neige apparaît en bleu clair et blanc.'],
 'Más deporte navarro':['Nafarroako kirol gehiago','More Navarre sport','Plus de sport navarrais'],
 'Pistas y clubes de pádel':['Padel pistak eta klubak','Padel courts and clubs','Courts et clubs de padel'],
 'Deporte rural: modalidades y citas':['Herri kirolak: modalitateak eta hitzorduak','Rural sports: events and dates','Force basque : épreuves et dates'],
 'Supermercados y mercados municipales de Navarra, con horario (si se conoce), cómo llegar y teléfono. Los mercadillos de cada semana, en la pestaña «Mercadillos».':
  ['Nafarroako supermerkatuak eta udal merkatuak, ordutegiarekin (jakinez gero), nola iritsi eta telefonoa. Asteroko azokak, «Azokak» fitxan.',
   'Supermarkets and municipal markets in Navarre, with opening hours (if known), directions and phone. Weekly street markets are in the «Street markets» tab.',
   'Supermarchés et marchés municipaux de Navarre, avec horaires (si connus), itinéraire et téléphone. Les marchés hebdomadaires sont dans l’onglet « Marchés ».']};
 Object.entries(T).forEach(([k,[eu,en,fr]])=>{I18N.eu[k]=eu;I18N.en[k]=en;I18N.fr[k]=fr;});}catch(e){}

/* ---------- utilidades ---------- */
// cambia el nombre de un botón del menú (vale para los dos modos de iconos) y el título de su pantalla
function renombra(t,txt,emo){const b=document.querySelector('#drawer button[data-t="'+t+'"]');
  if(b){if(b.dataset.txt!==undefined)b.dataset.txt=txt;if(emo&&b.dataset.emo!==undefined)b.dataset.emo=emo+' ';
    const sp=b.querySelector('span:not(.bt):not(.icb)');if(sp)sp.textContent=txt;else if(!b.children.length)b.textContent=(emo?emo+' ':'')+txt;}
  try{TITLES[t]=(emo?emo+' ':'')+txt;}catch(e){}try{BNL[t]=txt;}catch(e){}}
function esconde(t){document.querySelectorAll('#drawer button[data-t="'+t+'"]').forEach(b=>b.style.display='none');}
// ¿quién llama? showTab nuevo, que manda las pantallas antiguas a su sitio nuevo
const _st=showTab;
showTab=function(t){
  if(t==='mercados'){_st('super');setTimeout(()=>msSuVista('semana'),80);return;}
  if(t==='curiosas'){_st('noticias');setTimeout(()=>{const c=$('msCur');if(c){c.classList.add('abierto');if(window.cuRender)cuRender(true);c.scrollIntoView({behavior:'smooth',block:'start'});}},120);return;}
  if(t==='comarcas'){_st('pueblos');setTimeout(()=>{const b=document.querySelector('#pbTabs button[data-v="c"]');if(b)b.click();},60);return;}
  _st.apply(this,arguments);
  if(t==='noticias'){const c=$('msCur');if(c&&c.classList.contains('abierto')&&window.cuRender)setTimeout(()=>cuRender(true),40);}
  if(t==='emb')setTimeout(msEmb,60);};

/* ---------- 1. plegables ---------- */
// El tiempo: próximas 24 horas y próximos 7 días
(function(){const h=$('tH'),d=$('tDays');
  P(h&&h.closest('.card'),{clave:'t24',alAbrir:()=>{if(typeof tiempoRender==='function')tiempoRender();}});
  P(d&&d.closest('.card'),{clave:'t7d'});})();
// Caudal de los ríos: cada apartado plegable (el Arga y el río elegido abiertos al principio)
(function(){const a=$('cauArga'),f=$('cauAfl'),r=$('rivList');
  P(a&&a.closest('.card'),{clave:'cauArga',abierto:true});
  P(f&&f.closest('.card'),{clave:'cauAfl'});
  P(r&&r.closest('.card'),{clave:'cauRiv',abierto:true,titulo:'#rivTit'});})();
// Embalses: nombre y % siempre; entra, sale, agua embalsada, nivel y caudal, al desplegar
function msEmb(){document.querySelectorAll('#emList>.card').forEach(c=>{const t=(c.querySelector('b')||{}).textContent||'';P(c,{modo:'exp',mas:'Detalles',clave:'emb_'+t.trim()});});}
(function(){const l=$('emList');if(l)new MutationObserver(msEmb).observe(l,{childList:true});msEmb();})();
// Terremotos: los últimos, los más fuertes y las placas, plegados; «Importante» siempre abierto
function msSi(){const R=$('siRes');if(!R)return;R.querySelectorAll(':scope>.card').forEach((c,i)=>P(c,{clave:i?'siTop':'siLast'}));}
(function(){const R=$('siRes');if(R)new MutationObserver(msSi).observe(R,{childList:true});msSi();
  const pc=$('sipc');P(pc&&pc.closest('.card'),{clave:'siPlacas',alAbrir:()=>setTimeout(()=>{if(typeof siPlates==='function')siPlates();},30)});})();

/* ---------- 2. Mercadillos dentro de «Supermercados y mercados» ---------- */
function msSuVista(v){const seg=$('suSeg'),W=$('suSemana');if(!seg||!W)return;const sem=v==='semana';
  seg.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
  W.style.display=sem?'':'none';
  ['suList'].forEach(id=>{const e=$(id);if(e)e.style.display=sem?'none':'';});
  const q=$('suQ');if(q&&q.parentNode)q.parentNode.style.display=sem?'none':'flex';
  const m=$('suM');if(m&&sem)m.style.display='none';
  if(sem){if(typeof mkRender==='function')mkRender();}
  else{const b=seg.querySelector('button[data-v="'+v+'"]');if(b&&b.__orig)b.__orig.call(b);}}
window.msSuVista=msSuVista;
(function(){const S=$('t-super'),M=$('t-mercados'),seg=$('suSeg');if(!S||!M||!seg)return;
  const W=document.createElement('div');W.id='suSemana';W.style.display='none';
  seg.closest('.card').after(W);
  [...M.children].forEach(x=>{if(x.id==='pvSec'||x.classList.contains('fsFoto')||x.classList.contains('fsCred')||x.classList.contains('bnaPie'))return;W.appendChild(x);});
  const t=W.querySelector('.card>b');if(t)t.textContent='🧺 Mercadillos de cada semana';
  const n=seg.closest('.card').querySelector('.note');if(n)n.textContent='Supermercados y mercados municipales de Navarra, con horario (si se conoce), cómo llegar y teléfono. Los mercadillos de cada semana, en la pestaña «Mercadillos».';
  // supermercados y mercados siguen con su botón de siempre (mejoras.js); «Mercadillos» ya no cambia de pantalla
  seg.querySelectorAll('button').forEach(b=>{b.__orig=b.onclick;b.onclick=()=>msSuVista(b.dataset.v);});})();
esconde('mercados');

/* ---------- 3. «Noticias»: titulares + curiosas ---------- */
(function(){const N=$('t-noticias'),C=$('t-curiosas'),L=$('nwL');if(!N||!C||!L)return;
  const W=document.createElement('div');W.className='card';W.id='msCur';W.innerHTML='<b>😄 Noticias curiosas</b>';
  L.after(W);
  [...C.children].forEach((x,i)=>{if(x.id==='pvSec'||x.classList.contains('fsFoto')||x.classList.contains('fsCred')||x.classList.contains('bnaPie'))return;
    if(x.classList.contains('card')&&!x.id&&x.querySelector('#cuDest,#cuL')==null&&/Noticias curiosas/.test((x.querySelector('b')||{}).textContent||'')){
      const nt=x.querySelector('.note');if(nt)W.appendChild(nt);x.remove();return;}
    x.classList.remove('card');x.classList.add('msSub');W.appendChild(x);});
  P(W,{clave:'msCur',alAbrir:()=>{if(window.cuRender)cuRender(true);}});
  const t=N.querySelector('.card>b');if(t)t.textContent='📰 Titulares de Navarra';})();
renombra('noticias','Noticias','📰');esconde('curiosas');

/* ---------- 4. Localidades y Comarcas ---------- */
renombra('pueblos','Localidades y Comarcas','🗺️');esconde('comarcas');

/* ---------- 5. Pádel y deporte rural, desde Deporte navarro ---------- */
esconde('padel');esconde('rural');
(function(){const D=$('t-deporte'),pr=$('dpProx');if(!D||$('msMasDep'))return;
  const h=`<div class="card" id="msMasDep"><b>➕ Más deporte navarro</b><div class="row" style="margin-top:6px">
    <button class="btn" data-go2="padel">🎾 <span>Pistas y clubes de pádel</span></button><button class="btn" data-go2="rural">🪓 <span>Deporte rural: modalidades y citas</span></button></div></div>`;
  // justo debajo de los botones de deportes (la lista de partidos es muy larga: abajo del todo no se vería)
  if(pr)pr.insertAdjacentHTML('beforebegin',h);else D.insertAdjacentHTML('beforeend',h);
  D.querySelectorAll('#msMasDep [data-go2]').forEach(b=>b.onclick=()=>showTab(b.dataset.go2));})();

/* ---------- 6. «Actividad sísmica» ---------- */
renombra('sismo','Actividad sísmica, fallas y placas','🌍');
try{TITLES.sismo='🌍 Actividad sísmica y fallas';}catch(e){}

// los iconos del menú se vuelven a pintar con los nombres nuevos
try{if(typeof applyIcons==='function')applyIcons((CFG.iconos||'pro')==='pro');}catch(e){}
})();
