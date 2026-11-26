/* =====================================================================
   🏛️ APP NO OFICIAL + ENLACES A LAS FUENTES OFICIALES (18 nov. 2026)
   Por qué existe: Google Play rechazó la app por la política de
   «Afirmaciones engañosas» (Misleading Claims). Pide dos cosas:
     1. Un aviso claro y fácil de ver de que la app NO es de ningún organismo público.
     2. Un enlace claro a la fuente original de cada dato público (.gob.es, navarra.es…).
   Qué hace este archivo:
     - Aviso la primera vez que se abre la app (se puede volver a ver en «Fuentes oficiales»).
     - Tarjeta fija en Inicio con el aviso y el botón «Fuentes oficiales».
     - Pantalla nueva «🏛️ Fuentes oficiales» con todas las webs y su dirección visible.
     - Abajo de cada pantalla con datos públicos, en letra pequeña: «Fuente oficial: … ↗» (antes arriba).
   Para añadir una fuente a una pantalla: una línea más en SRC_TAB (nombre de pestaña → claves de FUENTES).
   ===================================================================== */
(function(){
  const FUENTES={
    saih:['SAIH Ebro · Confederación Hidrográfica del Ebro','https://www.chebro.es','Caudal y nivel de los ríos, embalses y umbrales de aviso'],
    che:['Confederación Hidrográfica del Ebro (CHE)','https://www.chebro.es','Avisos y notas oficiales sobre ríos y crecidas'],
    aemet:['AEMET · Agencia Estatal de Meteorología','https://www.aemet.es','Avisos meteorológicos oficiales'],
    sos:['SOS Navarra 112','https://www.navarra.es','Emergencias en Navarra (teléfono 112)'],
    navarra:['Gobierno de Navarra','https://www.navarra.es','Información general del Gobierno de Navarra'],
    opendata:['Gobierno de Navarra · Datos abiertos','https://datosabiertos.navarra.es','Datos públicos usados en varias secciones'],
    idena:['IDENA · Infraestructura de Datos Espaciales de Navarra','https://geoportal.navarra.es/es/idena','Mapas, cotos de caza y pesca, espacios naturales'],
    carreteras:['Gobierno de Navarra · Carreteras','https://www.navarra.es','Incidencias, cámaras y puertos de montaña (848 423 500)'],
    dgt:['DGT · Dirección General de Tráfico','https://www.dgt.es','Tráfico en carreteras del Estado'],
    espacios:['Gobierno de Navarra · Espacios naturales (IDENA)','https://geoportal.navarra.es/es/idena','Parques y reservas naturales'],
    ign:['IGN · Instituto Geográfico Nacional','https://www.ign.es','Terremotos (Red Sísmica Nacional) y mapas'],
    cnig:['CNIG · Centro Nacional de Información Geográfica','https://centrodedescargas.cnig.es','Modelos del terreno (MDT25) para el simulador'],
    miteco:['MITECO · Ministerio para la Transición Ecológica','https://www.miteco.gob.es','Embalses, agua y medio ambiente'],
    minetur:['Ministerio · Geoportal de gasolineras','https://geoportalgasolineras.es','Precios oficiales de los carburantes'],
    lexnavarra:['LexNavarra · Normativa de Navarra','https://www.lexnavarra.navarra.es','Normativa oficial (caza, pesca, recolección…)'],
    pamplona:['Ayuntamiento de Pamplona','https://www.pamplona.es','Avisos y eventos municipales'],
    turismo:['Turismo de Navarra','https://www.visitnavarra.es','Información turística oficial'],
    cultura:['Cultura Navarra','https://www.culturanavarra.es/es/agenda','Agenda cultural oficial'],
    salud:['Salud Navarra','https://www.navarra.es','Centros de salud y farmacias'],
    sne:['Servicio Navarro de Empleo – Nafar Lansare','https://www.navarra.es/es/empleo','Ofertas de empleo públicas de Navarra'],
    cndes:['CNDES · Centro Nacional de Desaparecidos (Ministerio del Interior)','https://cndes-web.ses.mir.es','Alertas oficiales de personas desaparecidas'],
    upna:['Universidad Pública de Navarra','https://www.unavarra.es','Convocatorias de empleo público de la UPNA'],
    mcp:['Mancomunidad de la Comarca de Pamplona','https://www.mcp.es','Transporte urbano comarcal (villavesas)'],
    igme:['IGME‑CSIC · Instituto Geológico y Minero de España','https://www.igme.es','Fallas activas (base QAFI)'],
    euskalmet:['Euskalmet · Gobierno Vasco','https://www.euskalmet.euskadi.eus','Radar meteorológico de Kapildui'],
    ree:['Red Eléctrica','https://www.ree.es','Datos del sistema eléctrico (REData)'],
    copernicus:['Copernicus · Unión Europea','https://www.copernicus.eu','Calidad del aire, polen (CAMS), previsión de ríos (GloFAS) y relieve'],
    meteoalarm:['Meteoalarm · EUMETNET','https://www.meteoalarm.org','Avisos meteorológicos europeos']
  };
  // pestaña → fuentes oficiales que se muestran arriba de esa pantalla
  const SRC_TAB={
    mapa:['saih','che','sos'], libre:['saih','che','sos'], sim:['saih','che','aemet'], juego:['saih','che'],
    ciencia:['saih','cnig'], hist:['che','saih'], prev:['saih','aemet','che','copernicus'], caudal:['saih','che','sos'],
    emb:['saih','miteco'], saih:['saih','che'],
    tiempo:['aemet','meteoalarm','copernicus'], radar:['aemet','euskalmet'], clima:['aemet'],
    incid:['carreteras','dgt'], camaras:['carreteras','dgt'], puertos:['carreteras','dgt'],
    sismo:['ign','igme'], gas:['minetur'],
    caza:['idena','lexnavarra'], pesca:['idena','lexnavarra'], natura:['lexnavarra','espacios'],
    monte:['idena','espacios'], energia:['idena','ree'], pueblos:['navarra','turismo'],
    patrimonio:['navarra','turismo'], cultura:['cultura'], agenda:['cultura','pamplona'], cerca:['salud','navarra'],
    empleo:['sne','upna'], desaparecidos:['cndes','sos'], bus:['mcp','idena'], salud:['copernicus']
  };
  // 20 nov. 2026 (petición de Pedro): de dónde salen los datos que NO son oficiales (Open‑Meteo, OpenStreetMap…)
  // ya no se escribe en mitad de cada pantalla: va aquí, en el pie de fuentes, en letra pequeña.
  // Para una pantalla nueva con datos de otros: una línea más (pestaña → texto).
  const DATOS={
    mtiempo:'mapa © IGN · tiempo: Open‑Meteo · ríos: SAIH Ebro',
    tiempo:'Open‑Meteo (modelos de AEMET, ECMWF y otros) · avisos: Meteoalarm/AEMET · aire y polen: Copernicus CAMS',
    radar:'RainViewer (uso personal y no comercial) y Euskalmet (radar de Kapildui) · fondos: © OpenStreetMap © CARTO, satélite PNOA cedido por © IGN, mapa © IGN',
    salud:'Open‑Meteo (CC BY 4.0) y Copernicus CAMS',
    hist:'Ayuntamiento de Pamplona, CHE (SAIH y notas de prensa), MITECO, Gobierno de Navarra, Plan de inundaciones de Huarte, Consorcio de Compensación de Seguros, Universidad de Zaragoza y prensa (Noticias de Navarra, Onda Vasca)',
    prev:'lluvia prevista: Open‑Meteo · caudal: SAIH Ebro (Burlada) · ríos: GloFAS (Copernicus)',
    caudal:'SAIH Ebro, datos provisionales cada 15 minutos', emb:'SAIH Ebro, datos provisionales cada 15 minutos',
    caza:'Planes de Ordenación Cinegética · © Gobierno de Navarra · IDENA (CC BY 4.0)', pesca:'Gobierno de Navarra · IDENA (CC BY 4.0)',
    monte:'rutas: © OpenStreetMap (ODbL), IDENA y Turismo de Navarra · alturas: Copernicus DEM GLO-30 · mapas: © IGN · tiempo: Open‑Meteo',
    transp:'recarga: © OpenStreetMap (ODbL) · red ciclista, aparcabicis, EuroVelo y puntos de riesgo: IDENA',
    energia:'Red Eléctrica (REData), Gobierno de Navarra (IDENA), © OpenStreetMap y Open‑Meteo',
    camaras:'Gobierno de Navarra (cámaras de carreteras) y alberguesyrefugios.com (Refugio de Belagua); las imágenes son de sus dueños',
    incid:'Centro de Control de Conservación de Carreteras (Gobierno de Navarra)',
    gas:'precios: geoportal de gasolineras (MITECO) · recarga: © OpenStreetMap (ODbL)',
    puertos:'puertos: © OpenStreetMap · incidencias y cámaras: Gobierno de Navarra y refugios · tiempo: Open‑Meteo',
    sismo:'IGN (Red Sísmica Nacional) · fallas: base QAFI (IGME‑CSIC) y estudios universitarios',
    farmacia:'Farmacias de Navarra · Departamento de Salud / IDENA (CC BY 4.0)',
    bus:'IDENA (Gobierno de Navarra y Mancomunidad de la Comarca de Pamplona, CC BY 4.0)',
    enp:'IDENA (Gobierno de Navarra, CC BY 4.0)',
    biodiversidad:'observaciones: GBIF.org (CC0 / CC BY) · textos: Wikipedia (CC BY-SA 4.0) · amenaza: Lista Roja de la UICN',
    super:'© colaboradores de OpenStreetMap (ODbL)', peques:'parques infantiles: © OpenStreetMap (ODbL)', mascotas:'© OpenStreetMap (ODbL)',
    padel:'© OpenStreetMap (ODbL) · tiempo: Open‑Meteo', centros:'© OpenStreetMap (ODbL) y Gobierno de Navarra (IDENA)',
    vias3:'Open‑Meteo (modelos de AEMET, ECMWF y otros)', nieve:'AEMET (boletín de aludes y predicción de montaña) · Open‑Meteo',
    comunidad:'mapa © IGN', jdonde:'mapa de municipios: © Gobierno de Navarra · IDENA (CC BY 4.0)',
    moto:'recorridos: OSRM con © OpenStreetMap (ODbL) · altitud: Copernicus DEM',
    pedalea:'Gobierno de Navarra (IDENA), Turismo de Navarra (visitnavarra.es), Vías Verdes y EuroVelo',
    picnic:'Gobierno de Navarra (IDENA): áreas recreativas y red ciclista',
    comarcas:'Gobierno de Navarra (IDENA, CC BY 4.0) y Wikidata (CC0)', pueblos:'Gobierno de Navarra (IDENA, CC BY 4.0) y Wikidata (CC0)'
  };
  const datosTxt=t=>DATOS[t]?`<br>📚 Datos: ${DATOS[t]}.`:'';
  window.BNA_DATOS=DATOS;
  const AVISO='BasatiNA es una app independiente y NO oficial. No representa ni está vinculada al Gobierno de Navarra, a la Confederación Hidrográfica del Ebro, a AEMET ni a ningún otro organismo público.';
  const AVISO2='Los datos públicos se toman de sus fuentes oficiales, que puedes consultar en los enlaces. Ante cualquier riesgo, haz caso siempre a los avisos oficiales.';

  function abrir(u){try{if(typeof APP!=='undefined'&&APP&&window.AndroidNet&&window.AndroidNet.openUrl)window.AndroidNet.openUrl(u);else window.open(u,'_blank');}catch(e){window.open(u,'_blank');}}
  window.bnaAbrirFuente=abrir;
  const dom=u=>u.replace(/^https?:\/\//,'').replace(/\/$/,'');
  const enlace=k=>{const f=FUENTES[k];return `<a href="#" data-url="${f[1]}" class="bnaSrcA" style="color:var(--acc);text-decoration:underline">${f[0].split(' · ')[0]} ↗ <span style="opacity:.75">(${dom(f[1])})</span></a>`;};

  // estilos
  const st=document.createElement('style');
  st.textContent=`.bnaSrc{margin:8px 12px 4px;padding:8px 10px;border:1px solid var(--line);border-left:4px solid #ffb020;border-radius:10px;font-size:13px;line-height:1.6}
.bnaOfi{margin:10px 12px;padding:12px;border:1px solid #ffb020;border-radius:14px;background:rgba(255,176,32,.08)}
.bnaOfi b{display:block;margin-bottom:4px}.bnaOfiBtn{margin-top:8px;border:0;border-radius:10px;padding:8px 12px;font:inherit;font-weight:700;background:#ffb020;color:#1b1b1b;cursor:pointer}
#bnaOfiModal{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:18px}
#bnaOfiModal>div{max-width:440px;background:var(--bg,#fff);color:var(--txt,#111);border-radius:16px;padding:18px;box-shadow:0 10px 40px rgba(0,0,0,.4);font-size:15px;line-height:1.5}
#t-mtiempo>.bnaPie:not(.bnaPieSrc){margin:10px 18px 2px;padding:8px 0 0;font-size:10.5px;line-height:1.45;opacity:.7}#t-mtiempo>.bnaPie a{color:inherit!important;text-decoration:underline}#t-mtiempo>.bnaPieSrc{display:none!important}
.bnaPie{margin:18px 14px 6px;padding:8px 10px;border-top:1px solid var(--line);font-size:11.5px;line-height:1.5;opacity:.85;text-align:center}
.bnaFList a{display:block;padding:10px 0;border-bottom:1px solid var(--line);color:var(--acc);text-decoration:none}.bnaFList small{display:block;color:var(--txt);opacity:.75}`;
  document.head.appendChild(st);

  // clic en cualquier enlace a fuente (funciona también en lo que se pinta después)
  document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('.bnaSrcA');if(a){e.preventDefault();abrir(a.dataset.url);}});

  // pantalla «Fuentes oficiales»
  const sec=document.createElement('section');sec.id='t-fuentes';
  sec.innerHTML=`<div class="bnaOfi"><b>ℹ️ App no oficial</b>${AVISO}<br><br>${AVISO2}</div>
<div class="card"><b>🏛️ Fuentes oficiales de los datos públicos</b><div class="bnaFList">${Object.keys(FUENTES).map(k=>{const f=FUENTES[k];return `<a href="#" data-url="${f[1]}" class="bnaSrcA">${f[0]} ↗<small>${f[2]} · ${f[1]}</small></a>`;}).join('')}</div></div>
<div class="card"><div class="note">BasatiNA es un proyecto gratuito y sin ánimo de lucro de Son&amp;Pe Technology Systems. Contacto: <a href="mailto:participa@basatina.es" style="color:var(--acc)">participa@basatina.es</a>. Otras fuentes no públicas (Open‑Meteo, OpenStreetMap, RainViewer…) están en «📚 Fuentes y créditos».</div></div>`;
  const last=document.querySelectorAll('section');(last[last.length-1]||document.body).after(sec);
  if(typeof TITLES!=='undefined')TITLES.fuentes='🏛️ Fuentes oficiales · App no oficial';
  // botón en el menú, junto a «Fuentes y créditos»
  const cr=document.querySelector('#drawer button[data-t="creditos"]');
  if(cr&&!document.querySelector('#drawer button[data-t="fuentes"]')){const b=document.createElement('button');b.dataset.t='fuentes';b.textContent='🏛️ Fuentes oficiales';b.onclick=()=>showTab('fuentes');cr.before(b);}

  // tarjeta fija en Inicio y en «Acerca de»
  function tarjeta(id){const s=document.getElementById(id);if(!s||s.querySelector('.bnaOfi'))return;
    const d=document.createElement('div');d.className='bnaOfi';
    d.innerHTML=`<b>ℹ️ App no oficial</b>${AVISO}<br><button class="bnaOfiBtn">🏛️ Ver fuentes oficiales</button>`;
    d.querySelector('button').onclick=()=>showTab('fuentes');s.prepend(d);}

  // fuente de cada pantalla con datos públicos: abajo del todo y en letra pequeña, como en Inicio
  // (petición de Pedro, 20 nov. 2026; antes era una franja arriba). Se vuelve a poner al final un par de veces
  // porque algunas pantallas añaden tarjetas después de abrirse.
  function franja(t){const k=SRC_TAB[t]||[];if(!k.length&&!DATOS[t])return;const sid=(t==='sim'||t==='libre')?'mapa':t;const s=document.getElementById('t-'+sid);if(!s)return;
    const vieja=s.querySelector(':scope>.bnaSrc');if(vieja)vieja.remove();
    let d=s.querySelector(':scope>.bnaPieSrc');if(!d){d=document.createElement('div');d.className='bnaPie bnaPieSrc';
      d.innerHTML=`${k.length?`🏛️ Fuente oficial: ${k.map(enlace).join(' · ')}<br>`:''}ℹ️ BasatiNA no es una app oficial. <a href="#" onclick="showTab('fuentes');return false" style="color:var(--acc);text-decoration:underline">Más información</a>${datosTxt(t)}`;}
    s.appendChild(d);}
  const franjaLuego=t=>{franja(t);setTimeout(()=>franja(t),1500);setTimeout(()=>franja(t),5000);};

  // Inicio: aviso pequeño abajo del todo (petición de Pedro, 18 nov. 2026)
  function pie(){const s=document.getElementById('t-mtiempo');if(!s)return;let d=s.querySelector(':scope>.bnaPie');
    if(!d){d=document.createElement('div');d.className='bnaPie';
      /* 26 nov. 2026 (Pedro): más discreto: dos líneas cortas (el aviso entero está en «Fuentes oficiales» y al abrir la app por primera vez) */
      const fu=k=>`<a href="#" data-url="${FUENTES[k][1]}" class="bnaSrcA">${FUENTES[k][0].split(' · ')[0]}</a>`;
      d.innerHTML=`ℹ️ BasatiNA es una app independiente y no oficial: no está vinculada a ningún organismo público. <a href="#" onclick="showTab('fuentes');return false">Fuentes oficiales</a>: ${['aemet','saih','navarra'].map(fu).join(' · ')}${DATOS.mtiempo?`<br>Datos: ${DATOS.mtiempo}.`:''}`;}
    s.appendChild(d);}
  const _st=showTab;showTab=function(t){_st(t);try{if(t==='mtiempo')pie();if(t==='about')tarjeta('t-about');franjaLuego(t);}catch(e){}};
  pie();setTimeout(pie,1500);setTimeout(pie,5000);tarjeta('t-about');
  const on=document.querySelector('section.on');if(on)franjaLuego(on.id.slice(2));

  // aviso la primera vez que se abre la app
  let visto=false;try{visto=localStorage.getItem('bnaNoOficial')==='1';}catch(e){}
  if(!visto){const m=document.createElement('div');m.id='bnaOfiModal';
    m.innerHTML=`<div><div style="font-size:18px;font-weight:800;margin-bottom:8px">ℹ️ App no oficial</div><p>${AVISO}</p><p>${AVISO2}</p>
<button class="bnaOfiBtn" id="bnaOfiOk">Entendido</button> <button class="bnaOfiBtn" id="bnaOfiVer" style="background:none;color:var(--acc);border:1px solid var(--acc)">Ver fuentes oficiales</button></div>`;
    document.body.appendChild(m);
    const cerrar=()=>{try{localStorage.setItem('bnaNoOficial','1');}catch(e){}m.remove();};
    m.querySelector('#bnaOfiOk').onclick=cerrar;
    m.querySelector('#bnaOfiVer').onclick=()=>{cerrar();showTab('fuentes');};}
})();
