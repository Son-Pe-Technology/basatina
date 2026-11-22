/* =====================================================================
   🗂️ MENÚ CON FOTOS (22 nov. 2026, diseño que pidió Pedro) — se carga después de inicio-fotos.js
   - Cabecera del menú con el paisaje de la estación (las mismas fotos que la barra de arriba, IF_CAB).
   - Cada grupo del menú es un cuadro con foto de fondo, el nombre en blanco y la flecha.
   Las fotos son nuestras (Pedro, Miren I.G., Sonia U.P.) y las de Commons/Pixabay que ya usa la app;
   sus autores salen en los créditos de cada sección. Para cambiar una foto: MF_FOTO (nombre del grupo → archivo).
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const MF_FOTO={'inicio':'foto-inicio-acc-cerca.webp','cerca':'foto-cerca-lesaka.webp','el tiempo':'foto-esc-tiempo.webp','ríos':'foto-esc-agua.webp',
 'vida silvestre':'foto-biodiv-pedro.webp','carreteras':'foto-incid-burguete.webp','localidades':'foto-pueblos-pedro.webp','servicios':'foto-farmacia-botica.webp',
 'salud':'foto-centros-hospital.webp','sostenibilidad':'foto-energia-miren.webp','actividad sísmica':'foto-sismo-foz.webp','terremotos':'foto-sismo-foz.webp','qué hacer':'foto-monte-aralar.webp',
 'juegos':'foto-cadenas-escudo.webp','mi espacio':'foto-astro-cabecera.webp','cuadrilla':'foto-prev-valle.webp','configuración':'foto-clima-miren.webp'};
const est=()=>{const m=new Date().getMonth()+1;return m>=3&&m<=5?'primavera':m>=6&&m<=8?'verano':m>=9&&m<=11?'otono':'invierno';};
const st=document.createElement('style');st.textContent=`
body.bna #drawer .dhead.mfH{background:#55704f var(--mfH) center 60%/cover no-repeat!important;padding:26px 16px 46px!important}
body.bna #drawer .dhead.mfH:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.45))}
body.bna #drawer .dhead.mfH>*{position:relative;z-index:1}
body.bna #drawer .dhead.mfH,body.bna #drawer .dhead.mfH *{text-shadow:0 1px 2px rgba(0,0,0,.9),0 2px 10px rgba(0,0,0,.6)}
body.bna #drawer .dhead.mfH .pvDM{display:none}
body.bna #bnaDGrid>.mfF{position:relative;overflow:hidden;min-height:82px!important;align-items:flex-end!important;border:2px solid #fff!important;
  background:#7d8f86 var(--mf) center/cover no-repeat!important;color:#fff!important;box-shadow:0 4px 12px rgba(29,45,35,.18)!important;padding:10px!important}
body.bna #bnaDGrid>.mfF{isolation:isolate}
/* el oscurecido va por debajo del texto (z-index:-1): en el modo «Emojis» el nombre es texto suelto del botón y antes quedaba tapado */
body.bna #bnaDGrid>.mfF:before{z-index:-1;content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.08) 0%,rgba(0,0,0,.38) 45%,rgba(0,0,0,.82) 100%)}
body.bna #bnaDGrid>.mfF>*{position:relative;z-index:1;color:#fff!important;text-shadow:0 1px 2px rgba(0,0,0,.95),0 2px 10px rgba(0,0,0,.7)}
body.bna #bnaDGrid>.mfF{text-shadow:0 1px 2px rgba(0,0,0,.95),0 2px 10px rgba(0,0,0,.7);font-weight:800!important;line-height:1.15!important}
body.bna #bnaDGrid>.mfF,body.bna #bnaDGrid>.mfF *{font-size:15px}
/* sin iconos ni emojis en los cuadros con foto: solo la foto y el nombre */
body.bna #bnaDGrid>.mfF .bt,body.bna #bnaDGrid>.mfF .icb,body.bna #bnaDGrid>.mfF svg,body.bna #bnaDGrid>.mfF span[style]{display:none!important}
body.bna #bnaDGrid>.mfF span:before{content:none!important}
body.bna #bnaDGrid>.mfF i{font-size:13px}
body.bna #bnaDGrid>.mfF small{color:#fff!important;opacity:.92}
body.bna #bnaDGrid>.mfF.open{border-color:var(--verde)!important;box-shadow:0 0 0 3px rgba(61,112,49,.45)!important}
/* 22 nov. 2026 · «Lista con miniaturas» (la propuesta B que eligió Pedro): al abrir un grupo, cada apartado
   lleva su foto pequeña a la izquierda, el nombre, una línea corta debajo y una flecha verde */
body.bna #bnaDGrid>.dsub.mfLs{padding:6px!important;border:none!important;border-radius:20px!important;background:#fff!important;box-shadow:0 6px 18px rgba(29,45,35,.12)!important}
body.bna #bnaDGrid>.dsub.mfLs>button.mfL{align-items:center!important;gap:12px!important;padding:7px 8px!important;margin:0!important;width:100%!important;border:none!important;border-radius:14px!important;background:transparent!important;color:#1d1d1d!important;text-align:left;min-height:66px}
body.bna #bnaDGrid>.dsub.mfLs>button.mfL.on{background:#E5EFE1!important}
body.bna #bnaDGrid>.dsub.mfLs>button.mfL:active{background:#eef3ec!important}
body.bna #bnaDGrid>.dsub.mfLs>button.mfL .bt,body.bna #bnaDGrid>.dsub.mfLs>button.mfL .icb,body.bna #bnaDGrid>.dsub.mfLs>button.mfL>span[style]{display:none!important}
.mfLi{flex:none;width:52px;height:52px;border-radius:12px;object-fit:cover;background:#dfe6dc}
.mfLt{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1 1 auto}
.mfLt b{font-weight:800;font-size:15.5px;line-height:1.2;color:#1d1d1d}
.mfLt small{font-size:12.5px;line-height:1.25;color:#5b6660}
.mfLf{flex:none;width:18px;height:18px}
body.bna #bnaDGrid>button.mfF.on{border-left:2px solid #fff!important;box-shadow:0 0 0 3px rgba(61,112,49,.55)!important}`;
document.head.appendChild(st);
// línea corta de cada apartado (si no hay, solo sale el nombre)
const MF_SUB={tiempo:'Ahora y los próximos días',clima:'Cómo ha sido el tiempo otros años',radar:'La lluvia, en directo',astro:'Luna, cielo y faenas del campo',nieve:'Nieve en el suelo y peligro de aludes',
 caudal:'Cuánta agua llevan ahora',emb:'Cómo de llenos están',prev:'Cómo irán los ríos',hist:'Las grandes crecidas',
 biodiversidad:'Animales y plantas de Navarra',ident:'Haz una foto y descubre qué es',enp:'Parques y reservas naturales',natura:'Setas, frutos y lo que da el monte',
 incid:'Cómo están ahora las carreteras',gas:'Dónde echar más barato',puertos:'Abiertos, cerrados o con cadenas',camaras:'Mira cómo están las carreteras',vias3:'Lluvia, nieve y viento en la ruta',
 pueblos:'Pueblos, comarcas y valles',dormir:'Hoteles, casas rurales y albergues',comer:'Restaurantes y bares',cocina:'Recetas de siempre',patrimonio:'Qué ver en cada sitio',temporada:'Lo que toca comer este mes',
 super:'Supermercados, mercados y mercadillos',bus:'Villavesas, autobuses y tren',noticias:'Titulares y noticias curiosas',mascotas:'Veterinarios y sitios para ir con ellas',voluntariado:'Echa una mano en Navarra',empleo:'Webs con ofertas en Navarra',desaparecidos:'Avisos de personas desaparecidas',vivienda:'Alquiler, venta e hipotecas',
 salud:'Cómo te puede afectar el tiempo',medic:'Para qué sirve cada planta',farmacia:'Abiertas hoy',centros:'Dónde ir y teléfonos',relax:'Sonidos para descansar',
 energia:'De dónde sale la luz ahora',transp:'Recarga eléctrica y carriles bici',sismo:'Últimos terremotos y fallas',
 monte:'Rutas a pie por toda Navarra',cultura:'Conciertos, teatro y fiestas',deporte:'Partidos y resultados',peques:'Planes para ir con niños',cines:'Qué echan en Navarra',moto:'Rutas y puertos',pedalea:'Bici y vías verdes',picnic:'Merenderos y zonas verdes',
 jcadenas:'Preguntas sobre Navarra',jdonde:'Encuentra el sitio en el mapa',jlugar:'Adivina el sitio por la foto',jclasif:'Quién va ganando',
 cuenta:'Tu cuenta de BasatiNA',diario:'Tus salidas al monte',sitios:'Tus rincones guardados',misdep:'Tus equipos y partidos',mivias:'Tus carreteras de siempre',
 comunidad:'Avisos de la gente',fotos:'Las fotos de la Cuadrilla',buzon:'Cuéntanos qué mejorarías',refranes:'Los dichos de cada pueblo',
 ajustes:'Avisos, letra e iconos',about:'Quiénes somos',fuentes:'Organismos de donde salen los datos',creditos:'Fotos y datos que usamos'};
const CHEV='<svg class="mfLf" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6 L15 12 L9 18" fill="none" stroke="#3d7031" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const escH=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// convierte los apartados de un grupo abierto en la lista con miniaturas (se repite si la app vuelve a pintar el botón)
function mfLista(){const g=$('bnaDGrid');if(!g)return;
  g.querySelectorAll(':scope>.dgroup.mfF').forEach(gr=>{const sub=gr.nextElementSibling;if(!sub||!sub.classList.contains('dsub'))return;sub.classList.add('mfLs');
    const fg=MF_FOTO[clave(gr)]||'';
    sub.querySelectorAll(':scope>button').forEach(b=>{if(b.querySelector(':scope>.mfLt'))return;
      const t=b.dataset.t||'',txt=(b.dataset.txt!==undefined?b.dataset.txt:(b.querySelector('span:not(.bt):not(.icb)')||b).textContent).replace(EMOJI,'').trim();if(!txt)return;
      let f=null;try{f=window.fsFoto&&t?fsFoto(t):null;}catch(e){}f=f||fg;
      b.classList.add('mfL');
      b.innerHTML=(f?`<img class="mfLi" src="${escH(f)}" alt="" loading="lazy">`:'<span class="mfLi"></span>')+`<span class="mfLt"><b>${escH(txt)}</b>${MF_SUB[t]?`<small>${escH(MF_SUB[t])}</small>`:''}</span>`+CHEV;});});}
function clave(el){const t=(el.dataset.t||'').toLowerCase();if(t==='mtiempo')return'inicio';if(t==='cerca')return'cerca';
  const s=(el.querySelector('span')||el).textContent.toLowerCase().replace(/únete/,'').trim();
  for(const k in MF_FOTO)if(s.startsWith(k)||s.includes(k))return k;return null;}
// quita el emoji del principio del texto (p. ej. «🏠 Inicio · Navarra» → «Inicio · Navarra»); solo toca el texto, no los botones
const EMOJI=/^(?:[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2139}][\u{FE0F}\u{200D}\u{20E3}]*)+\s*/u;
function sinEmoji(el){const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){if(!n.nodeValue.trim())continue;
  if(EMOJI.test(n.nodeValue))n.nodeValue=n.nodeValue.replace(EMOJI,'');break;}}
function mfPinta(){if(typeof isBna==='function'&&!isBna())return;const g=$('bnaDGrid');if(!g)return;
  g.querySelectorAll(':scope>button,:scope>.dgroup').forEach(el=>{const k=clave(el);if(!k)return;el.classList.add('mfF');el.style.setProperty('--mf',`url("${MF_FOTO[k]}")`);sinEmoji(el);});
  mfLista();
  const h=document.querySelector('#drawer .dhead');if(h){const f=(window.IF_CAB_PUB||{})[est()]||({otono:'foto-inicio-otono.webp',invierno:'foto-inicio-invierno.webp',primavera:'foto-inicio-primavera.webp',verano:'foto-inicio-verano.webp'})[est()];
    h.classList.add('mfH');h.style.setProperty('--mfH',`url("${f}")`);}}
mfPinta();setTimeout(mfPinta,800);setTimeout(mfPinta,3000);
const g=$('bnaDGrid');if(g)new MutationObserver(()=>mfPinta()).observe(g,{childList:true,subtree:true});
})();
