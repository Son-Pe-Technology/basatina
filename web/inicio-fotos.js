/* =====================================================================
   📷 INICIO CON FOTOS DE NAVARRA (22 nov. 2026, diseño que eligió Pedro) — se carga después de fotos-secciones.js
   Qué hace (solo en el tema BasatiNA y solo en el Inicio):
     1. Cabecera (logo y hora) con un paisaje de Navarra que cambia con la estación (IF_CAB). Desde el 22 nov. también en las demás pantallas (clase ifTop, franja más baja).
     2. Accesos directos con foto: la foto de fondo y el nombre encima (IF_ACC). Los que no tienen foto
        siguen con su icono de siempre. «Ríos» y la tarjeta del Arga llevan la foto de Pedro: el puente de la Rabia de Zubiri, su pueblo.
     3. Tarjeta del río en «Ahora en Navarra» con la foto de ese río (IF_RIO), cambia al pasar de río.
     4. Dos apartados por fila: Palabra del día + Refrán, y las 4 tarjetas de «La semana en Navarra»
        (la lluvia, resumida: el listado completo sigue en la pantalla «La semana»).
     5. Autores y licencias de las fotos al final del Inicio (IF_CRED, obligatorio con CC BY-SA).
   No toca: la tarjeta del tiempo («Navarra viva»), el mapa, los ríos ni las demás pantallas.
   Para cambiar una foto: se sustituye el archivo web/foto-inicio-*.webp y su línea de IF_CRED.
   Fotos de Wikimedia Commons (robot tools/fotos_commons.py, rama fotos-inicio) y la de Pedro.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
// 23 nov. 2026 (noche): Pedro pidió quitar TODAS las fotos. Con IF_FOTOS=false se quedan solo el orden
// (palabra y refrán en dos columnas, la semana 2×2), sin paisaje en la cabecera, ni fotos en accesos, río ni créditos.
const IF_FOTOS=false;
const IF_CAB_INI=true;
const IF_ACC_ON=true;   // 23 nov. 2026 (noche): vuelven las fotos de los accesos directos, con fotos nuevas de Pedro   // 23 nov. 2026 (noche): Pedro vuelve a querer el paisaje arriba, solo en el Inicio
const IF_CAB={otono:'foto-inicio-otono.webp',invierno:'foto-inicio-invierno.webp',primavera:'foto-inicio-primavera.webp',verano:'foto-inicio-verano.webp'};
const ifEst=()=>{const m=new Date().getMonth()+1;return m>=3&&m<=5?'primavera':m>=6&&m<=8?'verano':m>=9&&m<=11?'otono':'invierno';};
// clave del acceso directo (BNL de index.html) → foto
const IF_ACC={tiempo:'foto-inicio-acc-tiempo.webp',caudal:'foto-inicio-acc-rios.webp',incid:'foto-inicio-acc-carreteras.webp',cerca:'foto-inicio-acc-cerca.webp',
  monte:'foto-inicio-acc-pie.webp',deporte:'foto-inicio-acc-deporte.webp',cultura:'foto-inicio-acc-agenda.webp',natura:'foto-inicio-acc-recol.webp',
  // 23 nov. 2026: para los accesos que se pueden añadir con «Editar»
  mtiempo:'foto-inicio-acc-inicio.webp',noticias:'foto-inicio-acc-prensa.webp',curiosas:'foto-inicio-acc-prensa.webp',sismo:'foto-inicio-acc-sismo.webp',
  gas:'foto-inicio-acc-gas.webp',pueblos:'foto-inicio-acc-localidades.webp',cocina:'foto-inicio-acc-comidas.webp',comer:'foto-inicio-acc-comidas.webp',vivienda:'foto-inicio-acc-vivienda.webp',empleo:'foto-inicio-acc-empleo.webp'};
// río del carrusel (RZ_RIOS de novedades.js + arga) → foto
const IF_RIO={arga:'foto-inicio-rio-arga.webp',irati:'foto-inicio-rio-irati.webp',ega:'foto-inicio-rio-ega.webp',aragon:'foto-inicio-rio-aragon.webp',ebro:'foto-inicio-rio-ebro.webp'};
const IF_CRED=[
 ['Cabecera de otoño: hayedo','Pedro Iglesias Goñi','foto propia',''],
 ['Cabecera de invierno: nevada en el parque','Pedro Iglesias Goñi','foto propia',''],
 ['Cabecera de primavera: doble arcoíris','Pedro Iglesias Goñi','foto propia',''],
 ['Cabecera de verano: Nacedero del Urederra','Pedro Iglesias Goñi','foto propia',''],
 ['El tiempo: gotas de lluvia en el cristal','Amplio Espectro','foto cedida',''],
 ['Ríos: río entre árboles','Pedro Iglesias Goñi','foto propia',''],
 ['Carreteras: carretera bajo un cielo aborregado','Pedro Iglesias Goñi','foto propia',''],
 ['Cerca de mí: Monumento a los Fueros, Pamplona','Pedro Iglesias Goñi','foto propia',''],
 ['NA a Pie: camino en el bosque','Pedro Iglesias Goñi','foto propia',''],
 ['Deporte: estadio de El Sadar','Pedro Iglesias Goñi','foto propia',''],
 ['Inicio: Ayuntamiento de Pamplona con los gigantes','Pedro Iglesias Goñi','foto propia',''],
 ['Noticias: vendedor de periódicos (foto antigua)','[autor por confirmar]','[licencia por confirmar]',''],
 ['Actividad sísmica: cueva','Pedro Iglesias Goñi','foto propia',''],
 ['Gasolineras: gasolinera de noche','Pedro Iglesias Goñi','foto propia',''],
 ['Localidades: pueblo al pie del monte','Pedro Iglesias Goñi','foto propia',''],
 ['Comidas: chistorra, morcilla y panceta','Embutidos Arrieta','foto cedida',''],
 ['Vivienda: grúas de obra junto a El Sadar, Pamplona','Pedro Iglesias Goñi','foto propia',''],
 ['Empleo: obra de viviendas, Pamplona','Pedro Iglesias Goñi','foto propia (retocada con IA)',''],
 ['Agenda: Sanfermines','San Fermín Pamplona (Flickr)','CC0','https://commons.wikimedia.org/wiki/File:San_Ferm%C3%ADn_la_fiesta_est%C3%A1_en_la_calle_(42031343420).jpg'],
 ['Recolección: setas en el bosque','GenGH','CC BY-SA 4.0','https://commons.wikimedia.org/wiki/File:Oudemansiella_mucida,_Asturias_04.jpg']];

const st=document.createElement('style');st.textContent=`
/* 1. cabecera con paisaje (solo en el Inicio) */
body.bna.ifTop header{background:#dfe9ee var(--ifCab) center 62%/cover no-repeat!important;position:relative;overflow:hidden}
body.bna.ifTop header:before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,.93) 0%,rgba(255,255,255,.8) 34%,rgba(255,255,255,0) 66%)}
body.bna.ifTop .topbar{position:relative;z-index:1;padding-bottom:40px}
body.bna.ifTop.ifIni .topbar{padding-bottom:64px}
body.bna.ifTop .topbar:after{display:none}
/* 2. accesos directos con foto */
body.bna .bnaQ button.ifF{position:relative;aspect-ratio:4/3;padding:0!important;overflow:hidden;justify-content:flex-end;background:#8aa096 center/cover no-repeat;
  border:2px solid #fff;box-shadow:0 2px 4px rgba(29,45,35,.12),0 8px 18px -8px rgba(29,45,35,.35)}
body.bna .bnaQ button.ifF .bt{display:none}
body.bna .bnaQ button.ifF>span:not(.bt){position:relative;z-index:1;width:100%;box-sizing:border-box;padding:14px 3px 6px;color:#fff;font-size:12.5px;font-weight:800;text-align:center;
  text-shadow:0 1px 3px rgba(0,0,0,.6);background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.62))}
/* 3. foto del río */
#rzTk .anE.ifR{width:92px;height:auto;align-self:stretch;min-height:84px;border-radius:13px;background:#6d8a99 center/cover no-repeat;position:relative;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)}
#rzTk .anE.ifR .bt,#rzTk .anE.ifR svg{display:none}
#rzTk .anE.ifR b{position:absolute;left:0;right:0;bottom:0;padding:12px 6px 5px;color:#fff;font-size:12px;line-height:1.1;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.65))}
/* 4. dos por fila */
#ifPar{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:8px 0;align-items:stretch}
#ifPar>*{margin:0!important;min-width:0;align-items:flex-start!important}
#ifPar>*{flex-direction:column!important;align-items:stretch!important;gap:6px!important;padding:10px 11px!important}
#ifPar .pdI,#ifPar .rfI{display:none!important}
#ifPar *{white-space:normal!important;text-overflow:clip!important;-webkit-line-clamp:unset!important;max-width:100%}
#ifPar .pdX,#ifPar .rfX{overflow:visible!important;display:block!important}
#ifPar button,#ifPar .btn{margin:auto 0 0!important;align-self:flex-start}
body.bna.ifIni #seBody{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
body.bna.ifIni #seBody>.card{margin:0!important;min-width:0;cursor:pointer;padding:12px}
body.bna.ifIni #seBody>.card>b{font-size:14px;line-height:1.2;display:block}
body.bna.ifIni #seBody .st{display:none!important}
body.bna.ifIni #seBody .kpi{display:grid!important;grid-template-columns:1fr;gap:6px}
body.bna.ifIni #seBody .kpi>div{padding:7px 9px}
body.bna.ifIni #seBody .kpi b{font-size:13.5px!important;overflow-wrap:anywhere}
/* 5. créditos */
.ifCred{font-size:11px;color:var(--mut);margin:4px 8px 12px;line-height:1.45}.ifCred a{color:inherit}.ifCred summary{cursor:pointer}`;
document.head.appendChild(st);

const enIni=()=>typeof isBna==='function'&&isBna()&&(typeof BNTAB==='undefined'||BNTAB==='mtiempo');
// 22 nov. 2026: la barra de arriba (logo y hora) lleva el paisaje de la estación en TODAS las pantallas (más baja fuera del Inicio)
function ifCab(){const on=enIni(),top=typeof isBna==='function'&&isBna();document.body.classList.toggle('ifIni',on);document.body.classList.toggle('ifTop',top&&(IF_FOTOS||(IF_CAB_INI&&on)));
  if(top)document.body.style.setProperty('--ifCab',`url("${IF_CAB[ifEst()]}")`);}
function ifAcc(){if(!IF_FOTOS&&!IF_ACC_ON)return;document.querySelectorAll('#bnaHome .bnaQ button[data-go]').forEach(b=>{const f=IF_ACC[b.dataset.go];
  if(!f||b.classList.contains('ifF'))return;b.classList.add('ifF');b.style.backgroundImage=`url("${f}")`;});}
function ifRio(){const el=$('rzTk');if(!el)return;const e=el.querySelector('.anE');if(!e)return;
  let r=null,n='';try{const R=rzRios();if(R.length){const x=R[RZ.i%R.length];r=x.r;n=x.rio;}}catch(x){}
  if(!IF_FOTOS||!r||!IF_RIO[r]){e.classList.remove('ifR');e.style.backgroundImage='';return;}
  e.classList.add('ifR');e.style.backgroundImage=`url("${IF_RIO[r]}")`;if(!e.querySelector('b'))e.insertAdjacentHTML('beforeend','<b></b>');const t='Río '+n,bb=e.querySelector('b');if(bb.textContent!==t)bb.textContent=t;}
function ifPar(){const pd=$('pdCard'),rf=$('rfCard');if(!pd||!rf)return;let w=$('ifPar');
  if(!w){w=document.createElement('div');w.id='ifPar';pd.parentNode.insertBefore(w,pd);}
  if(pd.parentNode!==w)w.appendChild(pd);if(rf.parentNode!==w)w.appendChild(rf);}
function ifSem(){const b=$('seBody');if(!b||b.dataset.if)return;b.dataset.if=1;
  b.addEventListener('click',e=>{if(enIni()&&e.target.closest('.card')&&!e.target.closest('a,button'))showTab('semana');});}
function ifCred(){if(!IF_FOTOS&&!IF_ACC_ON)return;const sec=$('t-mtiempo');if(!sec||sec.querySelector('.ifCred'))return;const d=document.createElement('details');d.className='ifCred';
  d.innerHTML='<summary>📷 Fotos del Inicio: autores y licencias</summary>'+IF_CRED.map(([q,a,l,u])=>`${q}: ${u?`<a href="${u}" target="_blank" rel="noopener">${a}</a>`:a} (${l})`).join(' · ')+'.';
  const pie=sec.querySelector('.bnaPie');pie?sec.insertBefore(d,pie):sec.appendChild(d);
  d.querySelectorAll('a').forEach(a=>a.onclick=e=>{if(window.amAbre){e.preventDefault();amAbre(a.href);}});}
function ifTodo(){try{ifCab();if(!enIni())return;ifAcc();ifRio();ifPar();ifSem();ifCred();}catch(e){console.log('inicio-fotos',e);}}

// cada vez que se redibuja algo del Inicio
if(typeof rzDraw==='function'){const _rz=rzDraw;window.rzDraw=rzDraw=function(){_rz.apply(this,arguments);try{if(enIni())ifRio();}catch(e){}};}
const _st=showTab;showTab=function(){_st.apply(this,arguments);ifTodo();};
const H=$('bnaHome');if(H)new MutationObserver(()=>{ifAcc();ifRio();}).observe(H,{childList:true,subtree:true});
const T=$('t-mtiempo');if(T)new MutationObserver(()=>ifPar()).observe(T,{childList:true});
ifTodo();setTimeout(ifTodo,600);setTimeout(ifTodo,2500);
try{Object.assign(window.BNA_DATOS||{},{fotosInicio:'fotos del Inicio: Wikimedia Commons (autores al final del Inicio) y Pedro Iglesias Goñi'});}catch(e){}
})();
