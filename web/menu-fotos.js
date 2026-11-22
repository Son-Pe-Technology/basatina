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
 'salud':'foto-centros-hospital.webp','sostenibilidad':'foto-energia-miren.webp','terremotos':'foto-sismo-foz.webp','qué hacer':'foto-monte-aralar.webp',
 'juegos':'foto-cadenas-escudo.webp','mi espacio':'foto-astro-cabecera.webp','cuadrilla':'foto-prev-valle.webp','configuración':'foto-clima-miren.webp'};
const est=()=>{const m=new Date().getMonth()+1;return m>=3&&m<=5?'primavera':m>=6&&m<=8?'verano':m>=9&&m<=11?'otono':'invierno';};
const st=document.createElement('style');st.textContent=`
body.bna #drawer .dhead.mfH{background:#55704f var(--mfH) center 60%/cover no-repeat!important;padding:26px 16px 46px!important}
body.bna #drawer .dhead.mfH:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.45))}
body.bna #drawer .dhead.mfH>*{position:relative;z-index:1}
body.bna #drawer .dhead.mfH b,body.bna #drawer .dhead.mfH small{text-shadow:0 1px 6px rgba(0,0,0,.55)}
body.bna #drawer .dhead.mfH .pvDM{display:none}
body.bna #bnaDGrid>.mfF{position:relative;overflow:hidden;min-height:82px!important;align-items:flex-end!important;border:2px solid #fff!important;
  background:#7d8f86 var(--mf) center/cover no-repeat!important;color:#fff!important;box-shadow:0 4px 12px rgba(29,45,35,.18)!important;padding:10px!important}
body.bna #bnaDGrid>.mfF:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 20%,rgba(0,0,0,.66))}
body.bna #bnaDGrid>.mfF>*{position:relative;z-index:1;color:#fff!important;text-shadow:0 1px 4px rgba(0,0,0,.6)}
body.bna #bnaDGrid>.mfF,body.bna #bnaDGrid>.mfF *{font-size:15px}
body.bna #bnaDGrid>.mfF i{font-size:13px}
body.bna #bnaDGrid>.mfF.open{border-color:var(--verde)!important;box-shadow:0 0 0 3px rgba(61,112,49,.45)!important}
body.bna #bnaDGrid>button.mfF.on{border-left:2px solid #fff!important;box-shadow:0 0 0 3px rgba(61,112,49,.55)!important}`;
document.head.appendChild(st);
function clave(el){const t=(el.dataset.t||'').toLowerCase();if(t==='mtiempo')return'inicio';if(t==='cerca')return'cerca';
  const s=(el.querySelector('span')||el).textContent.toLowerCase().replace(/únete/,'').trim();
  for(const k in MF_FOTO)if(s.startsWith(k)||s.includes(k))return k;return null;}
function mfPinta(){if(typeof isBna==='function'&&!isBna())return;const g=$('bnaDGrid');if(!g)return;
  g.querySelectorAll(':scope>button,:scope>.dgroup').forEach(el=>{const k=clave(el);if(!k)return;el.classList.add('mfF');el.style.setProperty('--mf',`url("${MF_FOTO[k]}")`);});
  const h=document.querySelector('#drawer .dhead');if(h){const f=(window.IF_CAB_PUB||{})[est()]||({otono:'foto-inicio-otono.webp',invierno:'foto-inicio-invierno.webp',primavera:'foto-inicio-primavera.webp',verano:'foto-inicio-verano.webp'})[est()];
    h.classList.add('mfH');h.style.setProperty('--mfH',`url("${f}")`);}}
mfPinta();setTimeout(mfPinta,800);setTimeout(mfPinta,3000);
const g=$('bnaDGrid');if(g)new MutationObserver(()=>mfPinta()).observe(g,{childList:true});
})();
