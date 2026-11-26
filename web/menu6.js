/* =====================================================================
   ☰ MENÚ EN 6 GRUPOS (23 nov. 2026, lo acordado con Pedro en el chat «Fotos pendientes») — se carga el último
   Antes: 77 apartados en 16 grupos. Ahora: 6 grupos y ~28 apartados, sin borrar ninguna pantalla.

   CÓMO FUNCIONA (para no romper nada):
   - Los botones de siempre (button[data-t]) NO se crean de nuevo: se MUEVEN a los grupos nuevos (M6_GRUPOS),
     así siguen funcionando sus clics, sus iconos y sus traducciones.
   - Los grupos viejos se quedan escondidos (#m6Viejo) porque otro código los busca por su data-k
     (p. ej. «Participa»). Si algún script añade un botón más tarde, el vigilante lo vuelve a colocar.
   - Pantallas que van juntas («familias», M6_FAM): en el menú sale solo la primera, y dentro de cada pantalla
     hay una fila de pestañas arriba para pasar a las otras (El tiempo: Ahora · Radar · Nieve…).
   - 👤 Lo mío (icono arriba a la derecha): cuenta, diario, sitios, calendario, mis carreteras, la Cuadrilla y Ajustes.
   - Fuera del menú (decidido por Pedro): Personas desaparecidas (sale como aviso en el móvil), Crecidas históricas
     (pasan a «Tal día como hoy»), Puertos (lo cerrado ya sale en Incidencias), Para relajarse y Recolección
     (ahora dentro de Flora y fauna, con la temporada de cada seta o fruto y el filtro «Ahora es temporada»).
   Para añadir una pantalla nueva al menú: ponla en M6_GRUPOS (o en una familia de M6_FAM) y en M6_SUB.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const dr=$('drawer'),grid=$('bnaDGrid');if(!dr||!grid)return;
const X=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- los 6 grupos: [clave, foto del grupo, apartados (data-t)] ---------- */
const M6_GRUPOS=[
 ['Hoy','foto-inicio-acc-cerca.webp',['mtiempo','noticias','cerca']],
 ['Tiempo y ríos','foto-esc-tiempo.webp',['tiempo','caudal','sismo']],
 ['Naturaleza y salidas','foto-biodiv-pedro.webp',['biodiversidad','monte']],
 ['Moverse','foto-incid-burguete.webp',['incid','gas','bus']],
 ['Vivir en Navarra','foto-esc-pueblo.webp',['comer','super','salud','vivienda','empleo','voluntariado','mascotas']],
 ['Ocio','foto-agenda-cabecera.webp',['cultura','juegos']],
 /* 26 nov. 2026 (Pedro): la Cuadrilla sale de «Lo mío» y va al menú; para entrar hace falta cuenta con el correo confirmado (cuadrilla.js) */
 ['Cuadrilla BasatiNA','foto-prev-valle.webp',['comunidad','fotos','buzon','refranes','enviar']]];
/* familias: la primera es la que sale en el menú; las demás, como pestañas dentro */
const M6_FAM={
 tiempo:[['tiempo','Ahora'],['radar','Radar'],['nieve','Nieve'],['astro','Cielo y Luna'],['energia','Energía'],['clima','Histórico']],
 caudal:[['caudal','Caudal'],['emb','Embalses'],['prev','Previsión']],
 biodiversidad:[['biodiversidad','Flora y fauna'],['ident','Identificar'],['enp','Espacios protegidos'],['medic','Plantas medicinales']],
 monte:[['monte','A pie'],['pedalea','En bici'],['moto','En moto'],['picnic','De picnic']],
 incid:[['incid','Incidencias'],['camaras','Cámaras'],['vias3','Tiempo en carretera']],
 gas:[['gas','Gasolineras'],['transp','Recarga eléctrica']],
 comer:[['comer','Restaurantes'],['dormir','Alojamientos'],['cocina','Cocina tradicional'],['patrimonio','Museos']],
 super:[['super','Supermercados y mercadillos'],['temporada','Productos de temporada']],
 salud:[['farmacia','Farmacias'],['centros','Centros'],['salud','Tiempo y salud']],
 cultura:[['cultura','Cultura'],['cines','Cine'],['deporte','Deporte'],['peques','Peques']],
 about:[['about','Acerca de'],['fuentes','Fuentes oficiales'],['creditos','Créditos']]};
/* nombre y línea corta de cada apartado en el menú (el resto se queda como estaba) */
const M6_SUB={mtiempo:['Inicio','Lo de hoy en Navarra'],noticias:['Noticias','Titulares y noticias curiosas'],cerca:['Qué hay cerca','Lo que tienes alrededor'],
 tiempo:['El tiempo','Ahora, radar, nieve, cielo, energía e histórico'],caudal:['Ríos','Caudal, embalses y previsión'],sismo:['Terremotos','Últimos terremotos y fallas'],
 biodiversidad:['Flora y fauna','Especies, temporada de setas y frutos, espacios protegidos'],monte:['Salir','A pie, en bici, en moto y de picnic'],
 incid:['Carreteras','Incidencias, cámaras y tiempo en carretera'],gas:['Gasolineras y recarga eléctrica','Precios y puntos de recarga'],bus:['Transporte público','Villavesas, autobuses y tren'],
 pueblos:['Localidades','Pueblos, comarcas y valles'],comer:['Comer y dormir','Restaurantes, alojamientos, cocina y museos'],super:['Compras','Supermercados, mercadillos y productos de temporada'],
 salud:['Salud','Farmacias, centros y tiempo y salud'],vivienda:['Vivienda','Alquiler, venta e hipotecas'],empleo:['Empleo','Webs con ofertas en Navarra'],
 voluntariado:['Voluntariado','Echa una mano en Navarra'],mascotas:['Mascotas','Veterinarios y sitios para ir con ellas'],
 cultura:['Agenda','Cultura, cine, deporte y peques'],juegos:['Juegos','Todos los juegos y la clasificación'],
 comunidad:['Alertas ciudadanas','Avisos de la gente: árboles caídos, desprendimientos…'],fotos:['Fotos de la Cuadrilla','Las fotos de Navarra que manda la gente'],
 buzon:['Buzón de sugerencias','Cuéntanos qué mejorarías'],refranes:['Refranes de tu pueblo','Los dichos de cada pueblo']};
/* 👤 Lo mío */
const M6_MIO=[['Tu cuenta',['cuenta','diario','sitios','misdep','mivias']],['Ajustes',['ajustes','about']]];
/* fuera del menú (las pantallas siguen existiendo) */
const M6_MIOSUB={cuenta:'Tu cuenta de BasatiNA',diario:'Tus salidas al monte',sitios:'Tus rincones guardados',misdep:'Tus equipos y partidos',mivias:'Tus carreteras de siempre',
 comunidad:'Avisos de la gente',fotos:'Las fotos de la Cuadrilla',buzon:'Cuéntanos qué mejorarías',refranes:'Los dichos de cada pueblo',enviar:'Solo administradores',ajustes:'Avisos, letra e iconos',about:'Quiénes somos, fuentes y créditos'};
const M6_FUERA=['desaparecidos','hist','relax','natura','libre','comarcas','mercados','curiosas','padel','rural'];
/* juegos: todos en una pantalla */
const M6_JUEGOS=['jcadenas','jdonde','jlugar','jsopa','jcruci','jsudoku','jchinchon','jparejas','jsoli','jnutria','jaita','psombras','pcontar','ptruchas','jclasif'];

const FAM_DE={};Object.entries(M6_FAM).forEach(([k,L])=>L.forEach(([t])=>{if(!FAM_DE[t])FAM_DE[t]=k;}));
const btn=t=>dr.querySelector(`button[data-t="${t}"]:not(.m6Tab)`);

/* ---------- estilos ---------- */
const st=document.createElement('style');st.textContent=`
#m6Viejo{display:none!important}
section.rwOnly>div.m6Tabs.m6Tabs.m6Tabs{display:flex!important}
.m6Tabs{display:flex!important;gap:8px;overflow-x:auto;padding:2px 2px 10px;margin:0 0 4px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.m6Tabs::-webkit-scrollbar{display:none}
.m6Tabs button{flex:none;border:1.5px solid #d6e2d1;background:#fff;color:#2f4a2a;border-radius:999px;padding:8px 14px;font:inherit;font-size:14px;font-weight:700;white-space:nowrap;cursor:pointer}
.m6Tabs button.on{background:#3d7031;border-color:#3d7031;color:#fff}
body.bna #bnaDGrid>.dgroup.m6G{grid-column:1/-1;min-height:58px}
/* fotos de otros grupos (24 nov. 2026, fotos de Pedro): oscurecidas a la izquierda para que se lea el nombre */
body.bna #bnaDGrid>.dgroup.m6G.m6Ft{min-height:140px;border-color:transparent !important;background-size:cover !important;background-position:center !important;background-repeat:no-repeat !important}
body.bna #bnaDGrid>.dgroup.m6G[data-m6="Hoy"]{background-image:linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%),url('foto-menu-hoy.webp') !important}
body.bna #bnaDGrid>.dgroup.m6G[data-m6="Localidades"]{background-image:linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%),url('foto-menu-loc.webp') !important}
body.bna #bnaDGrid>.dgroup.m6G[data-m6="Tiempo y ríos"]{background-image:linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%),url('foto-menu-rios.webp') !important}
body.bna #bnaDGrid>.dgroup.m6G[data-m6="Naturaleza y salidas"]{background-image:linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%),url('foto-menu-nat.webp') !important}
body.bna #bnaDGrid>.dgroup.m6G[data-m6="Moverse"]{background-image:linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%),url('foto-menu-mov.webp') !important}
body.bna #bnaDGrid>.dgroup.m6G[data-m6="Vivir en Navarra"]{background-image:linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%),url('foto-menu-vivir.webp') !important}
/* «BasatiNA» lleva el «NA» en otro trozo: sin hueco entre «Basati» y «NA» (el icono lleva su propio margen) */
body.bna #bnaDGrid>.dgroup.m6G[data-m6="Cuadrilla BasatiNA"]>span{gap:0 !important}
body.bna #bnaDGrid>.dgroup.m6G[data-m6="Cuadrilla BasatiNA"]>span>:first-child{margin-right:8px}
body.bna #bnaDGrid>.dgroup.m6G[data-m6="Cuadrilla BasatiNA"]{background-image:linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%),url('foto-prev-valle.webp') !important}
body.bna #bnaDGrid>.dgroup.m6G[data-m6="Ocio"]{background-image:linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%),url('foto-menu-ocio.webp') !important}
body.bna #bnaDGrid>.dgroup.m6G.m6Ft>span{color:#fff !important;font-size:20px;font-weight:800;text-shadow:0 1px 6px rgba(0,0,0,.6)}
body.bna #bnaDGrid>.dgroup.m6G.m6Ft>i{color:#fff !important;text-shadow:0 1px 4px rgba(0,0,0,.6)}
body.bna #bnaDGrid>.dgroup.m6Solo>i{visibility:hidden}
/* 24 nov. 2026: foto arriba del menú (la misma del Inicio, cambia con la estación) */
/* igual que la cabecera del Inicio: velo blanco arriba, foto limpia abajo y sin los picos de montes */
body.bna #drawer .dhead.m6Foto{background:linear-gradient(180deg,rgba(255,255,255,.93) 0%,rgba(255,255,255,.8) 38%,rgba(255,255,255,0) 72%),var(--m6f) center 62%/cover no-repeat!important;
  min-height:130px;color:#1d2b22!important;align-items:flex-start;padding:18px 16px 46px!important;border-radius:0 0 22px 22px;box-shadow:0 4px 14px rgba(29,45,35,.12)}
body.bna #drawer .dhead.m6Foto:after,body.bna #drawer .dhead.m6Foto:before,body.bna #drawer .dhead.m6Foto .pvDM{display:none!important}
body.bna #drawer .dhead.m6Foto,body.bna #drawer .dhead.m6Foto *{text-shadow:none!important}
body.bna #drawer .dhead.m6Foto b{color:#1d2b22!important}body.bna #drawer .dhead.m6Foto .lema{color:#3b4a40!important;opacity:1}
#bnaDGrid .dsub[data-m6s]>button small.m6S{display:block;font-size:12px;font-weight:400;color:#5b6660;margin-top:1px;line-height:1.25}
#bnaDGrid .dsub[data-m6s]>button>span:not(.bt){display:block;text-align:left}
#m6Mio{flex:none;width:40px;height:40px;border-radius:50%;border:none;background:rgba(255,255,255,.92);color:#2f4a2a;display:inline-flex;align-items:center;justify-content:center;margin-left:6px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.2)}
#m6Mio svg{width:22px;height:22px}
body.bna #m6Acc{margin:4px 12px 10px}
body.bna #m6Acc .m6AccT{display:block;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#5b6660;margin:0 4px 8px}
body.bna #m6Acc .m6AccF{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}
body.bna #m6Acc button{display:flex;flex-direction:column;align-items:center;gap:6px;border:0;background:none;padding:2px 0;font-family:inherit;font-size:12px;font-weight:700;line-height:1.2;color:#1d2b22;cursor:pointer;min-height:44px;text-align:center}
body.bna #m6Acc button .bt{border-radius:50%!important;box-shadow:0 2px 8px rgba(0,0,0,.14)}
body.bna #m6Acc button:active .bt{transform:scale(.94)}
#m6AccCfg .m6AccN{font-size:13px;color:#5b6660;padding:0 10px 8px}
#m6AccCfg .m6AccM{display:flex;gap:6px;padding:0 8px 8px}
#m6AccCfg .m6AccM button{flex:1;min-height:40px;border-radius:12px;border:1px solid #d5dfd2;background:#fff;font-family:inherit;font-size:14px;font-weight:700;color:#1d2b22}
#m6AccCfg .m6AccM button.on{background:#3d7031;border-color:#3d7031;color:#fff}
#m6AccCfg .m6AccC{display:flex;flex-wrap:wrap;gap:6px;padding:0 8px 8px}
#m6AccCfg .m6AccC button{position:relative;display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:4px 10px 4px 5px;border-radius:999px;border:1px solid #d5dfd2;background:#fff;font-family:inherit;font-size:14px;color:#1d2b22}
#m6AccCfg .m6AccC button.on{border-color:#3d7031;background:#eef4ea;font-weight:700}
#m6AccCfg .m6AccC em{font-style:normal;background:#3d7031;color:#fff;border-radius:50%;width:20px;height:20px;font-size:12px;display:inline-flex;align-items:center;justify-content:center}
#m6AccCfg .m6AccC .bt,#m6AccCfg .m6AccP .bt{border-radius:50%!important}
#m6AccCfg .m6AccP{display:flex;flex-wrap:wrap;gap:10px}
#m6AccCfg .m6AccP span{display:inline-flex;align-items:center;gap:6px;font-size:14px}
#t-lomio .m6MioG{background:#fff;border-radius:20px;padding:6px;box-shadow:0 6px 18px rgba(29,45,35,.10);margin-bottom:12px}
#t-lomio .m6MioG>b{display:block;font-size:12px;color:#5b6660;text-transform:uppercase;letter-spacing:.07em;padding:8px 10px 4px}
#t-lomio button[data-t]{display:flex;align-items:center;gap:12px;width:100%;border:none;background:none;padding:9px 10px;border-radius:14px;font:inherit;text-align:left;color:inherit;cursor:pointer}
#t-lomio button[data-t]:active{background:#eef3ec}
#t-lomio button[data-t] .icb{display:none!important}#t-lomio .m6Bt{flex:none;display:inline-flex!important;align-items:center;justify-content:center}
.m6Jg{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.m6Jg button{display:flex;flex-direction:column;align-items:center;gap:6px;border:none;background:#fff;border-radius:18px;padding:12px 6px;box-shadow:0 2px 10px rgba(29,45,35,.08);font:inherit;font-size:13px;font-weight:700;color:#2a302c;cursor:pointer;text-align:center;line-height:1.2}
.m6Jg button:active{transform:scale(.96)}
.m6Jg .m6Ji{width:54px;height:54px;border-radius:15px;display:flex;align-items:center;justify-content:center;font-size:28px;background-size:cover;background-position:center}
.m6Tm .st{cursor:default}.m6Tm .m6T{font-size:12.5px;color:#3d7031;font-weight:700;margin-top:2px}.m6Tm .m6Ya{color:#e65100}`;
document.head.appendChild(st);

/* ---------- pantallas nuevas: Juegos y Lo mío ---------- */
const svs=(id,h)=>(window.svSec?svSec:(i,x)=>{const s=document.createElement('section');s.id='t-'+i;s.innerHTML=x;(document.querySelector('.wrap')||document.body).appendChild(s);return s;})(id,h);
if(!$('t-juegos'))svs('juegos','<div class="card"><b>Juegos de Navarra</b><div class="note">Elige un juego. Los que suben de nivel suman puntos para la clasificación.</div></div><div class="m6Jg" id="m6Jg"></div>');
if(!$('t-lomio'))svs('lomio','<div id="m6MioL"></div>');
try{Object.assign(TITLES,{juegos:'🎲 Juegos',lomio:'👤 Lo mío'});}catch(e){}
try{Object.assign(PVS_ESC,{juegos:'fiesta',lomio:'topo'});}catch(e){}
const M6_LEMA={juegos:'Juega y aprende sobre Navarra',lomio:'Tu cuenta, tus cosas y ajustes'};
const JCOL=['#e8f1e4','#e3eef7','#fdf0e1','#f3e8f6','#fbe7e7','#eef3d9'];
function pintaJuegos(){const g=$('m6Jg');if(!g)return;
  g.innerHTML=M6_JUEGOS.map((t,i)=>{const b=btn(t);if(!b)return'';const n=(b.dataset.txt||b.textContent).replace(/^\S+\s/,s=>/\p{Extended_Pictographic}/u.test(s)?'':s).trim();
    const e=(b.dataset.emo||'🎲').trim();
    return `<button data-j="${t}"><span class="m6Ji" style="background-color:${JCOL[i%JCOL.length]}">${X(e)}</span><span>${X(n.replace(/\s*\(.*\)$/,''))}</span></button>`;}).join('');
  g.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>showTab(b.dataset.j));}

/* ---------- iconos (23 nov. 2026: Pedro quiere iconos en vez de fotos en el menú) ---------- */
const M6_ICO={'g:Hoy':['i-inicio','g','house'],'g:Tiempo y ríos':['i-tiempo','b','cloud-sun'],'g:Naturaleza y salidas':['i-hoja','g','tree'],
 'g:Moverse':['i-carretera','r','car'],'g:Vivir en Navarra':['i-casa','g','buildings'],'g:Ocio':['i-agenda','r','calendar'],'g:Localidades':['i-pin','g','map-pin'],'g:Cuadrilla BasatiNA':['i-manos','b','users-three'],juegos:['i-juego','b','game-controller'],super:['i-cesta','r','basket'],lomio:['i-ajustes','b','user']};
try{Object.entries(M6_ICO).forEach(([k,[n,f,ic]])=>{BNK[k]=n;BNF[k]=f;if(!ICK[k])ICK[k]=ic;if(!ICC[k])ICC[k]={g:'#2e7d32',b:'#1565c0',r:'#e53935'}[f];});}catch(e){}
function iconos(){try{applyIcons((CFG.iconos||'pro')==='pro');}catch(e){}}
/* línea corta debajo del nombre de cada apartado */
function subs(){grid.querySelectorAll('.dsub[data-m6s]>button[data-t]').forEach(b=>{const s=M6_SUB[b.dataset.t];if(!s)return;
  const sp=[...b.querySelectorAll(':scope>span')].filter(x=>!x.classList.contains('bt')).pop();if(!sp)return;
  if(sp.textContent!==s[0])sp.textContent=s[0];let sm=sp.querySelector('small.m6S');if(!sm){sp.insertAdjacentHTML('beforeend',`<small class="m6S">${X(s[1])}</small>`);}});}

/* ---------- colocar los botones ---------- */
let viejo=null,hecho=false;
function grupoHTML(k,f){return `<div class="dgroup m6G" data-m6="${X(k)}"><span data-k="${X(k)}">${X(k)}</span><i>▸</i></div><div class="dsub mfLs" data-m6s="${X(k)}"></div>`;}
function texto(b,t){const s=M6_SUB[t];if(!s)return;b.dataset.txt=s[0];const bb=b.querySelector('.mfLt b'),sm=b.querySelector('.mfLt small');
  if(bb){bb.textContent=s[0];if(sm)sm.textContent=s[1];else bb.insertAdjacentHTML('afterend',`<small>${X(s[1])}</small>`);}
  else{const sp=[...b.querySelectorAll(':scope>span')].pop();if(sp&&!sp.classList.contains('bt'))sp.textContent=s[0];}
  const sin=b.querySelector('span.mfLi');if(sin&&M6_FOTO[t])sin.outerHTML=`<img class="mfLi" src="${M6_FOTO[t]}" alt="" loading="lazy">`;}
const M6_FOTO={mtiempo:'foto-inicio-otono.webp',juegos:'foto-cadenas-escudo.webp'};
function coloca(){let nuevos=false;
  if(!hecho){hecho=true;
    viejo=document.createElement('div');viejo.id='m6Viejo';
    [...grid.children].forEach(el=>{if(el.matches('.dgroup,.dsub')&&!el.classList.contains('m6G')&&!el.dataset.m6s&&el.id!=='dgApp'&&!(el.previousElementSibling&&el.previousElementSibling.id==='dgApp'))viejo.appendChild(el);});
    grid.appendChild(viejo);
    grid.insertAdjacentHTML('afterbegin',M6_GRUPOS.map(([k,f])=>grupoHTML(k,f)).join(''));
    // Localidades suelta en el menú (24 nov. 2026, Pedro): va directa, sin desplegable
    grid.querySelector('.dsub[data-m6s="Hoy"]').insertAdjacentHTML('afterend','<div class="dgroup m6G m6Solo" data-m6="Localidades"><span data-k="Localidades">Localidades</span><i>▸</i></div>');
    ['Hoy','Localidades','Tiempo y ríos','Naturaleza y salidas','Moverse','Vivir en Navarra','Ocio','Cuadrilla BasatiNA'].forEach(k=>{const g=grid.querySelector(`.dgroup.m6G[data-m6="${k}"]`);if(g)g.classList.add('m6Ft');});
    iconos();
    { const l=grid.querySelector('.m6Solo');l.onclick=e=>{e.stopPropagation();showTab('pueblos');try{menu(false);}catch(x){}};}
    // foto de arriba del menú
    { const h=dr.querySelector('.dhead');const m=new Date().getMonth()+1,est=m>=3&&m<=5?'primavera':m>=6&&m<=8?'verano':m>=9&&m<=11?'otono':'invierno';
      if(h){h.classList.add('m6Foto');h.style.setProperty('--m6f',`url('foto-inicio-${est}.webp')`);} }
    grid.querySelectorAll('.dgroup.m6G:not(.m6Solo)').forEach(g=>g.onclick=()=>{const o=!g.classList.contains('open');dr.querySelectorAll('.dgroup').forEach(x=>x.classList.remove('open'));if(o)g.classList.add('open');});
  }
  // los botones al grupo que les toca
  M6_GRUPOS.forEach(([k,,L])=>{const sub=grid.querySelector(`.dsub[data-m6s="${k}"]`);L.forEach(t=>{let b=btn(t);
    if(!b&&t==='juegos'){b=document.createElement('button');b.dataset.t='juegos';b.dataset.emo='🎲 ';b.dataset.txt='Juegos';b.innerHTML='<span>Juegos</span>';b.onclick=()=>{showTab('juegos');try{menu(false);}catch(e){}};}
    if(b&&b.parentElement!==sub){sub.appendChild(b);nuevos=true;}if(b)texto(b,t);});
    // orden fijo
    L.forEach(t=>{const b=sub.querySelector(`button[data-t="${t}"]`);if(b)sub.appendChild(b);});});
  // el resto: a lo escondido (siguen existiendo para las pestañas, la búsqueda y Lo mío)
  const enMenu=new Set(M6_GRUPOS.flatMap(g=>g[2]));
  grid.querySelectorAll('button[data-t]').forEach(b=>{const t=b.dataset.t;if(enMenu.has(t))return;
    if(b.closest('.dsub')&&b.closest('.dsub').previousElementSibling&&b.closest('.dsub').previousElementSibling.id==='dgApp')return; // Administrador
    if(b.closest('#m6Viejo'))return;viejo.appendChild(b);});
  if(nuevos)iconos();subs();pintaMio();}
/* ---------- 👤 Lo mío ---------- */
function pintaMio(){const L=$('m6MioL');if(!L)return;
  if(!L.dataset.ok){L.dataset.ok=1;L.innerHTML=M6_MIO.map(([n],i)=>`<div class="m6MioG" data-g="${i}"><b>${X(n)}</b></div>`).join('');}
  M6_MIO.forEach(([,ts],i)=>{const g=L.querySelector(`[data-g="${i}"]`);ts.forEach(t=>{const b0=btn(t);if(!b0)return;
    let c=g.querySelector(`button[data-t="${t}"]`);
    if(!c){c=document.createElement('button');c.dataset.t=t;c.className='m6Tab'+(b0.classList.contains('tech')?' tech':'');c.onclick=()=>showTab(t);g.appendChild(c);}
    const tx=(b0.querySelector('.mfLt b')||{}).textContent||b0.dataset.txt||b0.textContent.trim(),sm=(b0.querySelector('.mfLt small')||{}).textContent||M6_MIOSUB[t]||'';
    let ic='';try{ic=bnTile(t,22,42);}catch(e){}
    const h=`${ic?ic.replace('class="bt ','class="m6Bt bt '):'<span style="width:42px;height:42px;border-radius:13px;background:#eef4ea;flex:none"></span>'}<span style="flex:1"><b style="display:block">${X(tx)}</b>${sm?`<small style="color:#5b6660">${X(sm)}</small>`:''}</span><span style="color:#3d7031;font-weight:900">›</span>`;
    if(c.dataset.h!==h){c.innerHTML=h;c.dataset.h=h;}});});
  try{if(typeof techApply==='function')techApply();}catch(e){}}
/* icono arriba a la derecha */
function iconoMio(){const tb=document.querySelector('header .topbar');if(!tb||$('m6Mio'))return;
  tb.insertAdjacentHTML('beforeend','<button id="m6Mio" aria-label="Lo mío"><svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></g></svg></button>');
  $('m6Mio').onclick=()=>{try{menu(false);}catch(e){}showTab('lomio');};}

/* ---------- pestañas dentro de cada pantalla de una familia ---------- */
function pestanas(t){const k=FAM_DE[t];if(!k)return;const L=M6_FAM[k],sec=$('t-'+t);if(!sec)return;
  let f=sec.querySelector(':scope>.m6Tabs');
  if(!f){f=document.createElement('div');f.className='m6Tabs';f.setAttribute('role','tablist');
    f.innerHTML=L.map(([x,n])=>`<button class="m6Tab" data-x="${x}" role="tab">${X(typeof window.trT==='function'?trT(n):n)}</button>`).join('');
    f.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{if(b.dataset.x!==t)showTab(b.dataset.x);});}
  // siempre la primera cosa de la pantalla (después de la cabecera con foto, si la hay)
  const cab=sec.querySelector(':scope>.fsFoto,:scope>.fsCab,:scope>#pvSec,:scope>.svHead');
  if(cab){if(cab.nextElementSibling!==f)cab.after(f);}else if(sec.firstElementChild!==f)sec.prepend(f);
  f.querySelectorAll('[data-x]').forEach(b=>b.classList.toggle('on',b.dataset.x===t));
  const on=f.querySelector('.on');if(on&&on.scrollIntoView)try{on.scrollIntoView({block:'nearest',inline:'center'});}catch(e){}
  // en el menú se marca el apartado de la familia
  const cab0=btn(L[0][0]);if(cab0)cab0.classList.add('on');}

/* ---------- 🧺 Recolección dentro de Flora y fauna ---------- */
const MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
function tramo(m){if(!m||!m.length)return'';const s=[...new Set(m)].sort((a,b)=>a-b);
  // meses seguidos, también pasando de diciembre a enero
  let ini=s.findIndex((v,i)=>!s.includes(((v+10)%12)+1));if(ini<0)ini=0;const o=s.slice(ini).concat(s.slice(0,ini));
  const tr=[];let a=o[0],b=o[0];for(let i=1;i<o.length;i++){if(o[i]===(b%12)+1)b=o[i];else{tr.push([a,b]);a=b=o[i];}}tr.push([a,b]);
  return tr.map(([a,b])=>a===b?MESES[a-1]:`de ${MESES[a-1]} a ${MESES[b-1]}`).join(' y ');}
const recL=()=>{try{return NREC;}catch(e){return [];}};
let TEMP=false;
function recPinta(){const el=$('biList');if(!el)return;const mes=new Date().getMonth()+1,solo=($('biMes')||{}).checked,q=(($('biQ')||{}).value||'').toLowerCase();
  const nrm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
  const R=recL().filter(o=>(!solo||o.m.includes(mes))&&(!q||nrm(o.n+' '+o.l).includes(nrm(q))));
  const CAT={seta:'Setas',silv:'Frutos silvestres',frut:'Frutales y cultivos'};
  $('biCnt').textContent=R.length+' de '+recL().length+(solo?' · en temporada ahora':'');
  el.innerHTML=Object.keys(CAT).map(c=>{const L=R.filter(o=>o.c===c);if(!L.length)return'';
    return `<div class="card m6Tm"><b>${CAT[c]}</b>${L.map(o=>`<div class="st"><div style="font-size:22px">${o.i}</div><div style="flex:1"><b>${X(o.n)}</b>${o.l?` <i class="s">${X(o.l)}</i>`:''}
      <div class="m6T${o.m.includes(mes)?' m6Ya':''}">${o.m.includes(mes)?'● Ahora es temporada · ':''}Temporada: ${X(tramo(o.m))}${o.p&&o.p.length?' · mejor en '+X(tramo(o.p)):''}</div>
      <div class="s">${X(o.d)}</div></div></div>`).join('')}</div>`;}).join('')+
    `<div class="note">Recoge solo lo que conozcas bien y respeta las normas de cada zona (permisos de recogida de setas, espacios protegidos y fincas privadas).</div>`;}
function recUI(){const tp=$('biTp');if(!tp||tp.querySelector('[data-v="__temp"]'))return;
  tp.insertAdjacentHTML('beforeend','<button class="btn" data-v="__temp">🧺 Temporada</button>');
  const b=tp.querySelector('[data-v="__temp"]');
  tp.querySelectorAll('button').forEach(x=>x.addEventListener('click',()=>{TEMP=x===b;tp.querySelectorAll('button').forEach(y=>y.classList.toggle('on',y===x));
    const lab=$('biMes')&&$('biMes').closest('label');if(lab&&lab.lastChild)lab.lastChild.nodeValue=TEMP?' Ahora es temporada':' Solo lo que se ve este mes';
    [$('biG'),$('biZ')].forEach(s=>{const c=s&&(s.closest('.msChip')||s.parentElement);if(c)c.style.display=TEMP?'none':'';});
    if(TEMP)recPinta();},true));}
// biRender y biFicha son globales (servicios-ui.js): se envuelven para el modo «Temporada» y para poner la temporada en la ficha
if(typeof window.biRender==='function'){const _r=window.biRender;window.biRender=function(){if(TEMP)return recPinta();return _r.apply(this,arguments);};}
if(typeof window.biFicha==='function'){const _f=window.biFicha;window.biFicha=function(o){const r=_f.apply(this,arguments);
  try{if(o){const s=String(o.s||'').toLowerCase();const n=recL().find(x=>x.l&&s&&(s.startsWith(x.l.toLowerCase().split(' / ')[0])||x.l.toLowerCase().startsWith(s)));
    const el=$('biFicha');if(n&&el&&!el.querySelector('.m6T'))el.insertAdjacentHTML('beforeend',`<div class="m6T" style="margin-top:8px;font-weight:700;color:#3d7031">🧺 Temporada de recogida: ${X(tramo(n.m))}${n.p&&n.p.length?' · mejor en '+X(tramo(n.p)):''}</div>`);}}catch(e){}
  return r;};}
/* El mapa de riadas (que se abría desde Crecidas históricas) se abre ahora desde Previsión */
function riadas(){const s=$('t-prev');if(!s||$('m6Riadas'))return;s.insertAdjacentHTML('beforeend','<div class="card" id="m6Riadas"><b>🎚️ Mapa de riadas</b><div class="note">Elige tú el caudal y mira hasta dónde llegaría el agua.</div><div class="row"><button class="btn pri" onclick="showTab(\'libre\')">Abrir el mapa de riadas</button></div></div>');}

/* ---------- ⭐ Accesos rápidos del menú (24 nov. 2026, Pedro: propuesta D) ----------
   Cuatro círculos arriba del menú, debajo del buscador.
   · Por defecto salen las 4 pantallas que más usa cada persona: cada vez que abres una
     se suma 1 en el móvil (localStorage «bnaUso»; no sale del teléfono).
   · En 👤 Lo mío › «Accesos rápidos del menú» se pueden elegir a mano (localStorage «bnaAcc»). */
const ACC_DEF=['tiempo','caudal','incid','gas'];
const ACC_CORTO={mtiempo:'Inicio',noticias:'Noticias',cerca:'Cerca',tiempo:'El tiempo',caudal:'Ríos',sismo:'Terremotos',biodiversidad:'Flora y fauna',monte:'Salir',
 incid:'Carreteras',gas:'Gasolina',bus:'Transporte',pueblos:'Localidades',comer:'Comer',super:'Compras',salud:'Salud',vivienda:'Vivienda',empleo:'Empleo',
 voluntariado:'Voluntariado',mascotas:'Mascotas',cultura:'Agenda',juegos:'Juegos'};
const ACC_TODAS=Object.keys(ACC_CORTO);
const lsJ=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(e){return d;}};
const lsP=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
const TR=t=>typeof window.trT==='function'?trT(t):t;
function accUso(t){const k=FAM_DE[t]||t;if(!ACC_CORTO[k]||k==='mtiempo')return;const u=lsJ('bnaUso',{});u[k]=(u[k]||0)+1;lsP('bnaUso',u);}
function accLista(){const yo=lsJ('bnaAcc',null);
  // automático: los más usados; si hay empate (o aún no hay uso), manda el orden de ACC_DEF
  const u=lsJ('bnaUso',{}),peso=t=>(u[t]||0)*10-(ACC_DEF.includes(t)?ACC_DEF.indexOf(t)-5:0);
  const auto=ACC_TODAS.filter(t=>t!=='mtiempo').sort((a,b)=>peso(b)-peso(a));
  if(!Array.isArray(yo))return auto.slice(0,4);
  const L=yo.filter(t=>ACC_CORTO[t]).slice(0,4);auto.forEach(t=>{if(L.length<4&&!L.includes(t))L.push(t);});return L;}
function icoAcc(t,s,box){let h='';try{h=bnTile(t,s,box);}catch(e){}return h||`<span class="bt g" style="width:${box}px;height:${box}px"></span>`;}
function pintaAcc(){const sr=$('bnaSRes')||$('bnaSearch');if(!sr)return;let r=$('m6Acc');
  if(!r){sr.insertAdjacentHTML('afterend','<div id="m6Acc"><b class="m6AccT">Lo que más usas</b><div class="m6AccF"></div></div>');r=$('m6Acc');}
  r.querySelector('.m6AccT').textContent=TR(Array.isArray(lsJ('bnaAcc',null))?'Tus accesos':'Lo que más usas');
  const f=r.querySelector('.m6AccF'),L=accLista(),h=L.map(t=>`<button data-acc="${t}">${icoAcc(t,24,56)}<span>${X(TR(ACC_CORTO[t]))}</span></button>`).join('');
  if(f.dataset.h!==h){f.innerHTML=h;f.dataset.h=h;f.querySelectorAll('[data-acc]').forEach(b=>b.onclick=()=>{try{menu(false);}catch(e){}showTab(b.dataset.acc);});}}
/* elegirlos en Lo mío */
function pintaAccCfg(){const L=$('m6MioL');if(!L)return;let c=$('m6AccCfg');
  if(!c){L.insertAdjacentHTML('afterbegin','<div class="m6MioG" id="m6AccCfg"><b>Accesos rápidos del menú</b><div class="m6AccN"></div><div class="m6AccM"><button data-m="auto">Los que más uso</button><button data-m="yo">Elegirlos yo</button></div><div class="m6AccC"></div></div>');c=$('m6AccCfg');
    c.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{lsP('bnaAcc',b.dataset.m==='yo'?accLista():null);if(b.dataset.m==='auto')try{localStorage.removeItem('bnaAcc');}catch(e){}pintaAccCfg();pintaAcc();});}
  const yo=lsJ('bnaAcc',null),esYo=Array.isArray(yo),act=accLista();
  c.querySelectorAll('[data-m]').forEach(b=>b.classList.toggle('on',(b.dataset.m==='yo')===esYo));
  c.querySelector('.m6AccN').textContent=TR(esYo?'Toca para poner o quitar. Caben 4: el orden es el orden en que los tocas.':'Los 4 círculos de arriba del menú se ponen solos con las pantallas que más abres.');
  const ch=c.querySelector('.m6AccC');
  ch.innerHTML=esYo?ACC_TODAS.map(t=>{const i=yo.indexOf(t);return `<button data-c="${t}" class="${i>=0?'on':''}">${icoAcc(t,16,28)}<span>${X(TR(ACC_CORTO[t]))}</span>${i>=0?`<em>${i+1}</em>`:''}</button>`;}).join('')
    :`<div class="m6AccP">${act.map(t=>`<span>${icoAcc(t,16,28)}${X(TR(ACC_CORTO[t]))}</span>`).join('')}</div>`;
  ch.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{let y=lsJ('bnaAcc',[]);if(!Array.isArray(y))y=[];const t=b.dataset.c;
    if(y.includes(t))y=y.filter(x=>x!==t);else{if(y.length>=4)y.shift();y.push(t);}lsP('bnaAcc',y);pintaAccCfg();pintaAcc();});}
/* ---------- enganches ---------- */
let CUR='';
const _s=showTab;showTab=function(t){const r=_s.apply(this,arguments);
  try{accUso(t);pestanas(t);[250,1000].forEach(d=>setTimeout(()=>{if(CUR===t)pestanas(t);},d));if(t==='juegos')pintaJuegos();if(t==='lomio'){pintaMio();pintaAccCfg();}if(t==='biodiversidad')recUI();if(t==='prev')riadas();
    CUR=t;if(M6_LEMA[t])[0,300,900].forEach(d=>setTimeout(()=>{const sm=document.querySelector('#pvSec .pvsT small');if(sm&&CUR===t)sm.textContent=M6_LEMA[t];},d));
    const mio=$('m6Mio');if(mio)mio.style.background=t==='lomio'?'#3d7031':'';if(mio)mio.style.color=t==='lomio'?'#fff':'';}catch(e){console.warn('menu6',e);}
  return r;};
window.showTab=showTab;
function todo(){try{coloca();iconoMio();pintaAcc();}catch(e){console.warn('menu6',e);}}
todo();setTimeout(todo,800);setTimeout(todo,3000);
let pend=0;new MutationObserver(()=>{if(pend)return;pend=setTimeout(()=>{pend=0;todo();},120);}).observe(grid,{childList:true});
// al abrir el menú, todos los grupos empiezan cerrados (23 nov. 2026, Pedro: si no, se quedaba abierto el último)
// Se vigila la clase «on» del menú porque se abre desde varios sitios (☰, la barra de abajo, el logo…).
let abierto=dr.classList.contains('on');
new MutationObserver(()=>{const on=dr.classList.contains('on');if(on&&!abierto){pintaAcc();dr.querySelectorAll('.dgroup.open').forEach(x=>x.classList.remove('open'));dr.scrollTop=0;}abierto=on;})
  .observe(dr,{attributes:true,attributeFilter:['class']});
})();
/* 25 nov. 2026: Pedro quitó «Puertos de montaña» de la app (los puertos ya salen en Incidencias).
   Si algún acceso viejo (accesos directos, Mi espacio…) intenta abrirla, va a Incidencias. */
(function(){const _s=showTab;showTab=function(t){if(t==='puertos'){arguments[0]='incid';}return _s.apply(this,arguments);};})();
/* 25 nov. 2026 (lo pidió Pedro): en los 7 grupos con foto, el icono y el nombre van abajo y más
   pequeños, para que se vea mejor la foto. La sombra oscura solo está en la franja de abajo. */
(function(){const st=document.createElement('style');st.textContent=`
body.bna #bnaDGrid>.dgroup.m6G.m6Ft{align-items:flex-end !important;padding:0 14px 10px !important}
body.bna #bnaDGrid>.dgroup.m6G.m6Ft>span{display:flex !important;align-items:center;gap:8px;font-size:15px !important;font-weight:700 !important;letter-spacing:.01em;text-shadow:0 1px 4px rgba(0,0,0,.7) !important}
body.bna #bnaDGrid>.dgroup.m6G.m6Ft>span .bt{width:30px !important;height:30px !important;min-width:30px;border-radius:9px !important;box-shadow:0 1px 4px rgba(0,0,0,.35)}
body.bna #bnaDGrid>.dgroup.m6G.m6Ft>span .bt svg{width:18px !important;height:18px !important}
body.bna #bnaDGrid>.dgroup.m6G.m6Ft>i{font-size:12px;margin-bottom:6px}`;document.head.appendChild(st);})();
