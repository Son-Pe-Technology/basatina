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
body.bna #bnaDGrid>button.mfF.on{border-left:2px solid #fff!important;box-shadow:0 0 0 3px rgba(61,112,49,.55)!important}`;
document.head.appendChild(st);
function clave(el){const t=(el.dataset.t||'').toLowerCase();if(t==='mtiempo')return'inicio';if(t==='cerca')return'cerca';
  const s=(el.querySelector('span')||el).textContent.toLowerCase().replace(/únete/,'').trim();
  for(const k in MF_FOTO)if(s.startsWith(k)||s.includes(k))return k;return null;}
// quita el emoji del principio del texto (p. ej. «🏠 Inicio · Navarra» → «Inicio · Navarra»); solo toca el texto, no los botones
const EMOJI=/^(?:[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2139}][\u{FE0F}\u{200D}\u{20E3}]*)+\s*/u;
function sinEmoji(el){const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){if(!n.nodeValue.trim())continue;
  if(EMOJI.test(n.nodeValue))n.nodeValue=n.nodeValue.replace(EMOJI,'');break;}}
function mfPinta(){if(typeof isBna==='function'&&!isBna())return;const g=$('bnaDGrid');if(!g)return;
  g.querySelectorAll(':scope>button,:scope>.dgroup').forEach(el=>{const k=clave(el);if(!k)return;el.classList.add('mfF');el.style.setProperty('--mf',`url("${MF_FOTO[k]}")`);sinEmoji(el);});
  const h=document.querySelector('#drawer .dhead');if(h){const f=(window.IF_CAB_PUB||{})[est()]||({otono:'foto-inicio-otono.webp',invierno:'foto-inicio-invierno.webp',primavera:'foto-inicio-primavera.webp',verano:'foto-inicio-verano.webp'})[est()];
    h.classList.add('mfH');h.style.setProperty('--mfH',`url("${f}")`);}}
mfPinta();setTimeout(mfPinta,800);setTimeout(mfPinta,3000);
const g=$('bnaDGrid');if(g)new MutationObserver(()=>mfPinta()).observe(g,{childList:true,subtree:true});
})();
