/* =====================================================================
   📷 FOTOS REALES EN LAS SECCIONES (21 nov. 2026, petición de Pedro) — se carga el último
   Cambia la cabecera animada («Navarra viva») de algunas secciones por una FOTO real, y las pestañas
   de dentro por tarjetas con foto y una franja de color abajo (diseño que eligió Pedro).
   Empezó por 🛒 Supermercados y mercados; 1.ª tanda de 15 secciones más el 21 nov. 2026. Para añadir otra sección: una entrada en FS_CAB (cabecera)
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

// ---- 1.ª tanda (21 nov. 2026): pueblos, patrimonio, comer, dormir, NA a Pie, naturaleza, cocina, agendas y deporte ----
Object.assign(FS_CAB,{"pueblos": "foto-pueblos-cabecera.webp", "comarcas": "foto-comarcas-cabecera.webp", "patrimonio": "foto-patrimonio-cabecera.webp", "comer": "foto-comer-cabecera.webp", "dormir": "foto-dormir-cabecera.webp", "monte": "foto-monte-cabecera.webp", "natura": "foto-natura-cabecera.webp", "natfau": "foto-natfau-cabecera.webp", "natveg": "foto-natveg-cabecera.webp", "natarb": "foto-natarb-cabecera.webp", "biodiversidad": "foto-biodiversidad-cabecera.webp", "cocina": "foto-cocina-cabecera.webp", "agenda": "foto-agenda-cabecera.webp", "cultura": "foto-cultura-cabecera.webp", "deporte": "foto-deporte-cabecera.webp"});
Object.assign(FS_TABS,{"pueblos": ["pbTabs", {"l": ["foto-pueblos-tab-l.webp", "#2e7d32"], "c": ["foto-pueblos-tab-c.webp", "#e0640f"]}], "cocina": ["ckSeg", {"rec": ["foto-cocina-tab-rec.webp", "#2e7d32"], "prod": ["foto-cocina-tab-prod.webp", "#e0640f"]}]});
Object.assign(FS_CRED,{"pueblos": [["Cabecera: Valle de Roncal (Urzainqui)","Jialxv","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Urzainqui_(Valle_de_Roncal,_Navarra)_11.jpg"],["Plaza del Castillo, Pamplona","Zarateman","CC0","https://commons.wikimedia.org/wiki/File:Pamplona_-_Plaza_del_Castillo_09.jpg"],["Valle de Roncal","Jialxv","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Urzainqui_(Valle_de_Roncal,_Navarra)_04.jpg"]],"comarcas": [["Cabecera: Valle de Roncal","Jialxv","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Urzainqui_(Valle_de_Roncal,_Navarra)_04.jpg"]],"patrimonio": [["Cabecera: Palacio Real de Olite","Jorab","CC BY 3.0","https://commons.wikimedia.org/wiki/File:Palacio_de_Olite.JPG"]],"comer": [["Cabecera: Pintxos de piquillo, Pamplona","Yann from Madrid, Spain","CC BY 2.0","https://commons.wikimedia.org/wiki/File:Pamplona-pintxos-pimiento_del_piquillo-eltito.jpg"]],"dormir": [["Cabecera: Casa de pueblo en Larraona","Basotxerri","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Larraona_-_Casa_de_pueblo_01.jpg"]],"monte": [["Cabecera: Selva de Irati","Rodelar","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Selva_de_Irati_015.jpg"]],"natura": [["Cabecera: Cesta de setas","George Chernilevsky","Public domain","https://commons.wikimedia.org/wiki/File:Edible_fungi_in_basket_2012_G1.jpg"]],"natfau": [["Cabecera: Foz de Arbayún, refugio de buitres", "amaianos from Galicia", "CC BY 2.0", "https://commons.wikimedia.org/wiki/File:La_Foz_de_Arbay%C3%BAn_o_Arbaiun,_Leyre_Navarra_(4894662904).jpg"]],"natveg": [["Cabecera: Hayedo de Urbasa","Jesús Ignacio Bravo Soler","CC BY 3.0","https://commons.wikimedia.org/wiki/File:Hayedo_En_Urbasa_(69311353).jpeg"]],"natarb": [["Cabecera: Robles singulares de Etxarri-Aranatz","Basotxerri","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Etxarri-Aranatz_-_Sendero_de_los_Robles_Singulares_01.jpg"]],"biodiversidad": [["Cabecera: Foz de Lumbier","Sílvia Martín","CC BY 2.0","https://commons.wikimedia.org/wiki/File:Foz_de_Lumbier_(9425064092).jpg"]],"cocina": [["Cabecera: Campo de espárragos en Metauten","Basotxerri","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Metauten_-_Campo_de_esp%C3%A1rragos_01.jpg"],["Menestra de verduras","Juan Emilio Prades Bel","CC BY 4.0","https://commons.wikimedia.org/wiki/File:Menestra_de_verduras_hervidas.jpg"],["Queso del Roncal","No machine-readable author provided. Ardo Beltz assumed (based on copyright claims).","CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:Queso_roncal.jpg"]],"agenda": [["Cabecera: Gigantes en San Fermín","San Fermin Pamplona Navarra from España","CC0","https://commons.wikimedia.org/wiki/File:14_de_julio_d%C3%ADa_de_despedidas_(29969735828).jpg"]],"cultura": [["Cabecera: Teatro Gayarre, Pamplona","Joanbanjo","CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:Gaiarre_antzokia.JPG"]],"deporte": [["Cabecera: Estadio El Sadar, Pamplona","Visma17","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Estadio_El_Sadar.jpg"]]});

// ---- 2.ª tanda (21 nov. 2026): peques, mascotas, vivienda, Pedalea, Moto, Picnic y temporada ----
Object.assign(FS_CAB,{"peques": "foto-peques-cabecera.webp", "mascotas": "foto-mascotas-cabecera.webp", "vivienda": "foto-vivienda-cabecera.webp", "pedalea": "foto-pedalea-cabecera.webp", "moto": "foto-moto-cabecera.webp", "picnic": "foto-picnic-cabecera.webp", "temporada": "foto-temporada-cabecera.webp"});
Object.assign(FS_TABS,{"peques": ["pqSeg", {"sitios": ["foto-peques-tab-sitios.webp", "#2e7d32"], "juegos": ["foto-peques-tab-juegos.webp", "#e0640f"], "rutas": ["foto-peques-tab-rutas.webp", "#2e7d32"], "agenda": ["foto-peques-tab-agenda.webp", "#e0640f"]}]});
Object.assign(FS_CRED,{"peques": [["Cabecera: Parque de la Taconera, Pamplona", "JLVwiki", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Parque_de_la_Taconera_(Pamplona)-5.jpg"], ["Parque de Aranzadi, Pamplona", "JLVwiki", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Parque_de_Aranzadi,_Pamplona_3.jpg"], ["Parque de la Taconera", "JLVwiki", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Parque_de_la_Taconera_(Pamplona)-8.jpg"], ["Parque fluvial de Pamplona", "Sanduzelaiko Biblioteka Publikoa - Biblioteca Pública de San Jorge", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Iru%C3%B1eko_Ibai_Parkea_-_Parque_Fluvial_de_Pamplona.png"], ["Kilikis de Pamplona", "Yiorsito", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Kilikis_jorge_urdanoz.jpg"]], "mascotas": [["Cabecera: Euskal artzain txakurra (perro pastor vasco)", "Euskal Artzain Txakurraren Adiskideak", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Euskal_Artzain_Txakurra-_Iletsua.jpg"]], "vivienda": [["Cabecera: Segundo Ensanche, Pamplona", "Culturea", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Pamplona,_Segundo_Ensanche,_V%C3%ADctor_Eusa.jpg"]], "pedalea": [["Cabecera: Vía Verde del Plazaola", "Cherubino", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:A_la_V%C3%ADa_Verde_del_Plazaola_05.JPG"]], "moto": [["Cabecera: Puerto de Larrau", "Ronnie Macdonald from Chelmsford, United Kingdom", "CC BY 2.0", "https://commons.wikimedia.org/wiki/File:Puerto_de_Narrau_1_(7575195526).jpg"]], "picnic": [["Cabecera: Embalses de Leurtza", "Francis Vaquero", "CC BY 4.0", "https://commons.wikimedia.org/wiki/File:Embalses_de_Leurtza_Francis_Vaquero_Turismo_de_Navarra.jpg"]], "temporada": [["Cabecera: Huerta frente a las Bardenas", "Video Forest", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Huerto_enfrente_las_Bardenas.jpg"]]});

const st=document.createElement('style');st.textContent=`
body.bna #pvSec.fsFoto{background:#1d2b36 center/cover no-repeat}
body.bna #pvSec.fsFoto canvas{display:none}
body.bna #pvSec.fsFoto:before{content:"";position:absolute;inset:0;z-index:0;background:linear-gradient(90deg,rgba(0,0,0,.62) 0%,rgba(0,0,0,.35) 55%,rgba(0,0,0,.05) 100%)}
body.bna #pvSec.fsFoto .pvsC{display:none}
body.bna #pvSec.fsFoto .pvsT{z-index:1}
.fsTabs{display:grid!important;grid-auto-flow:column;grid-auto-columns:1fr;gap:8px!important;background:none!important;padding:0!important}
.fsTabs button{position:relative;height:96px;border-radius:16px!important;overflow:hidden;border:0!important;padding:0!important;background-color:#9aa7a0!important;background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;
  box-shadow:0 2px 8px rgba(0,0,0,.15);color:#fff!important;font-weight:800!important;font-size:12.5px!important;display:flex;align-items:flex-end;justify-content:center;transition:transform .15s}
.fsTabs button span{position:relative;z-index:1;width:100%;padding:16px 4px 7px;text-align:center;line-height:1.15;white-space:nowrap;letter-spacing:-.01em}
.fsTabs button span:before{content:"";position:absolute;inset:0;z-index:-1;background:var(--fsc);clip-path:path('M0 14 Q 40 0 80 9 T 200 6 L 200 60 L 0 60 Z')}
.fsTabs button.on{outline:3px solid var(--fsc);outline-offset:2px;transform:scale(1.02)}
.fsTabs button:not(.on){filter:saturate(.85)}
.fsCred{font-size:11px;color:var(--mut);margin:0 8px 12px;line-height:1.45}.fsCred a{color:inherit}`;
document.head.appendChild(st);

// ── 3.ª tanda (22 nov. 2026): fotos de Pedro (Pedro Iglesias Goñi, fotos propias) en vez de las de Commons ──
(function(){const P='Pedro Iglesias Goñi',F='foto propia';
 Object.assign(FS_CAB,{natfau:'foto-natfau-cabecera.webp',astro:'foto-astro-cabecera.webp',monte:'foto-monte-cabecera.webp',patrimonio:'foto-patrimonio-cabecera.webp'});
 const cab={natfau:'Cabecera: milano real (galforro)',astro:'Cabecera: luna llena entre los árboles',monte:'Cabecera: cascada de Ixkier, valle de Larraun',patrimonio:'Cabecera: Palacio Real de Olite'};
 for(const k in cab){const L=FS_CRED[k]||(FS_CRED[k]=[]);const e=[cab[k],P,F,''];if(L.length&&/^Cabecera/.test(L[0][0]))L[0]=e;else L.unshift(e);}
})();
// ── 4.ª tanda (22 nov. 2026): TODAS las secciones con foto (petición de Pedro), menos el Inicio (tarjeta del tiempo «Navarra viva») ──
// Las secciones sin foto propia en FS_CAB usan la foto de su escena (PVS_ESC: cielo, agua, bosque…). Casi todas son fotos de Pedro.
const FS_ESC={cielo:'foto-esc-cielo.webp',agua:'foto-esc-agua.webp',bosque:'foto-esc-bosque.webp',pueblo:'foto-esc-pueblo.webp',carretera:'foto-esc-carretera.webp',
 fiesta:'foto-esc-fiesta.webp',bokeh:'foto-esc-bokeh.webp',sismo:'foto-esc-sismo.webp',topo:'foto-esc-topo.webp',aurora:'foto-esc-aurora.webp',energia:'foto-esc-energia.webp'};
const FS_ESC_CRED=(()=>{const P='Pedro Iglesias Goñi',F='foto propia';return{
 cielo:[['Cabecera: cúmulo de tormenta',P,F,'']],agua:[['Cabecera: Nacedero del Urederra',P,F,'']],bosque:[['Cabecera: hayedo en otoño',P,F,'']],
 pueblo:[['Cabecera: Monumento a los Fueros, Pamplona',P,F,'']],fiesta:[['Cabecera: Frontón Labrit, Pamplona',P,F,'']],bokeh:[['Cabecera: cielo de nubes',P,F,'']],
 sismo:[['Cabecera: cueva de Mendukilo (Astitz, Larraun)',P,F,'']],topo:[['Cabecera: camino bajo los cortados de Urbasa',P,F,'']],aurora:[['Cabecera: luna entre los árboles',P,F,'']],
 carretera:[['Cabecera: Puente de Hierro, Sangüesa','Zarateman','CC0','https://commons.wikimedia.org/wiki/File:Sanguesa_-_Puente_de_Hierro_1.jpg']],
 energia:[['Cabecera: aerogeneradores en el Alto del Perdón','Ricardo Fernández','CC BY 2.0','https://commons.wikimedia.org/wiki/File:Alto_del_Perd%C3%B3n-richardfdez-02.jpg']]};})();
FS_CAB.tiempo='foto-tiempo-miren.webp';FS_CRED.tiempo=[['Cabecera: gotas de lluvia en el cristal','Miren I.G.','foto propia','']];
FS_CAB.clima='foto-clima-miren.webp';FS_CRED.clima=[['Cabecera: puesta de sol','Miren I.G.','foto propia','']];
FS_CAB.nieve='foto-nieve-pedro.webp';FS_CRED.nieve=[['Cabecera: nevada en el parque','Pedro Iglesias Goñi','foto propia','']];  // 22 nov.: foto de Miren, hermana de Pedro
const fsEsc=t=>{try{return (PVS_ESC&&PVS_ESC[t])||'aurora';}catch(e){return 'aurora';}};
const fsFoto=t=>t==='mtiempo'?null:(FS_CAB[t]||FS_ESC[fsEsc(t)]||null);
const fsCredL=t=>t==='mtiempo'?null:(FS_CRED[t]||(FS_CAB[t]?null:FS_ESC_CRED[fsEsc(t)])||null);
function fsTabs(t){const c=FS_TABS[t];if(!c)return;const el=$(c[0]);if(!el||el.dataset.fs)return;el.dataset.fs=1;el.classList.add('fsTabs');
  el.querySelectorAll('button').forEach(b=>{const v=b.dataset.v||b.dataset.t,f=c[1][v];if(!f)return;
    const txt=b.textContent.trim().replace(/^[^\wÁÉÍÓÚÑáéíóúñ]+/,'');b.style.setProperty('background-image',`url("${f[0]}")`,'important');b.style.setProperty('--fsc',f[1]);b.innerHTML=`<span>${txt}${v==='semana'?' ›':''}</span>`;});}
function fsCred(t){const sec=document.querySelector('section.on')||$('t-'+t);if(!sec)return;   // Fauna/Vegetación/Árboles comparten pantalla con Recolección
  let d=sec.querySelector('.fsCred');const L=fsCredL(t);if(!L){if(d)d.remove();return;}
  if(!d){d=document.createElement('div');d.className='fsCred';sec.appendChild(d);}
  d.innerHTML='📷 Fotos: '+L.map(([q,a,l,u])=>u?`${q}, <a href="${u}" target="_blank" rel="noopener">${a}</a> (${l})`:`${q}, ${a} (${l})`).join(' · ')+'.';
  d.querySelectorAll('a').forEach(a=>a.onclick=e=>{if(window.amAbre){e.preventDefault();amAbre(a.href);}});}
function fsCab(t){const el=$('pvSec');if(!el)return;const f=fsFoto(t);
  if(f){el.classList.add('fsFoto');el.style.backgroundImage=`url("${f}")`;
    try{if(PVSraf){cancelAnimationFrame(PVSraf);PVSraf=0;}}catch(e){}}   // sin animación debajo de la foto: ahorra batería
  else{el.classList.remove('fsFoto');el.style.backgroundImage='';}}
function fsAplica(t){try{fsCab(t);fsTabs(t);fsCred(t);}catch(e){console.log(e);}}
const _st=showTab;showTab=function(t){_st.apply(this,arguments);fsAplica(t);};
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&typeof BNTAB!=='undefined'&&fsFoto(BNTAB))setTimeout(()=>fsCab(BNTAB),50);});
try{Object.assign(window.BNA_DATOS||{},{fotos:'fotos de las secciones: Wikimedia Commons (licencias CC BY-SA, autores en cada sección)'});}catch(e){}
})();
