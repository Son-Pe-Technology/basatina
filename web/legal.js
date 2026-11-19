/* =====================================================================
   ⚖️ INFORMACIÓN LEGAL DESPLEGABLE (19 nov. 2026, petición de Pedro)
   Qué hace: abajo del todo en Inicio (debajo del aviso de «app no oficial») y en «Acerca de»
   pone una lista de apartados que se despliegan al tocarlos:
     Aviso legal · Política de privacidad · Condiciones de uso · Cookies · Código ético ·
     Accesibilidad · Preferencias de privacidad · Agradecimientos
   Por qué así: Google Play pide que la información legal sea fácil de encontrar dentro de la app,
   y un desplegable no ocupa sitio en la pantalla.
   Cómo cambiar un texto: edita su apartado en LEG (icono, título y html). Se ven en rejilla de 4 por fila; al tocar uno, su texto se abre debajo. Los textos completos
   siguen en la web (docs/privacidad.html, docs/aviso-legal.html, docs/normas-comunidad.html).
   Se carga después de oficial.js (que pone el aviso de «app no oficial»).
   ===================================================================== */
(function(){
  const W='https://basatina.es/',MAIL='participa@basatina.es',FECHA='19 de noviembre de 2026';
  const a=(u,t)=>`<a href="#" class="bnaSrcA" data-url="${u}">${t||u.replace(/^https?:\/\//,'')} ↗</a>`;
  const mail=`<a href="mailto:${MAIL}">${MAIL}</a>`;
  const noUso=()=>{try{return localStorage.getItem('bnaNoUso')==='1';}catch(e){return false;}};

  const LEG=[
  ['📜','Aviso legal',()=>`
<p><b>Quién está detrás.</b> BasatiNA (app y web basatina.es) es un proyecto gratuito y sin ánimo de lucro de <b>Son&amp;Pe Technology Systems</b> (marca registrada). Titular: Pedro Iglesias Goñi · Navarra (España). Contacto: ${mail}.</p>
<p><b>App no oficial.</b> BasatiNA es independiente: no representa ni está vinculada al Gobierno de Navarra, a la Confederación Hidrográfica del Ebro, a AEMET ni a ningún otro organismo público. Los datos públicos se muestran tal como los publican sus fuentes, pueden tener retrasos o errores y no sustituyen a los avisos oficiales. En una emergencia, llama al <b>112</b>.</p>
<p><b>Propiedad intelectual.</b> El nombre, el logo y el diseño de BasatiNA y de Son&amp;Pe son de sus titulares. Los datos de terceros son de sus fuentes y se usan según sus licencias. Las fotos de la comunidad siguen siendo de quien las hizo.</p>
<p><b>Ley aplicable:</b> la española.</p>
<p>Texto completo: ${a(W+'aviso-legal.html')}</p>`],

  ['🔒','Política de privacidad',()=>`
<p><b>En resumen:</b> BasatiNA no tiene publicidad ni herramientas de seguimiento. Puedes usarla sin cuenta, y lo que guardas (diario, fotos, calendario, notas, ajustes…) <b>se queda en tu móvil</b>.</p>
<ul>
<li><b>Responsable:</b> Pedro Iglesias Goñi · ${mail}.</li>
<li><b>Solo nos llega lo que tú envías:</b> tu cuenta (correo, apodo y Mi Espacio), tus alertas ciudadanas, las fotos, sugerencias y refranes que nos mandes.</li>
<li><b>Ubicación, cámara y fotos:</b> solo cuando tú las usas, y no las guardamos.</li>
<li><b>Dónde:</b> Google Firebase (base de datos en Madrid, UE). No vendemos ni cedemos tus datos.</li>
<li><b>Tus derechos:</b> acceder, corregir, borrar u oponerte escribiendo a ${mail}. Puedes reclamar ante la AEPD (aepd.es).</li>
<li><b>Edad:</b> para crear cuenta o enviar algo hay que tener 14 años o más.</li>
</ul>
<p>Texto completo: ${a(W+'privacidad.html')}</p>`],

  ['📋','Condiciones de uso',()=>`
<p>Al usar BasatiNA aceptas estas condiciones:</p>
<ul>
<li><b>Es gratis y sin publicidad.</b> No se cobra nada ni hay compras dentro de la app.</li>
<li><b>No es un servicio de emergencias</b> ni una app oficial. Los datos son orientativos: ante cualquier riesgo, sigue siempre a las autoridades y llama al 112.</li>
<li><b>Úsala con cabeza:</b> no te pongas en peligro por mirar la app, ni para dar un aviso. En el monte, en el río o en la carretera, la responsabilidad de tu seguridad es tuya.</li>
<li><b>Cuenta:</b> es voluntaria, una por persona y con 14 años o más. Eres responsable de lo que publicas. Si incumples las normas, podemos retirar tu contenido o bloquear tu cuenta.</li>
<li><b>Lo que envías</b> (avisos, fotos, refranes, sugerencias) debe cumplir las ${a(W+'normas-comunidad.html','Normas de la comunidad')}.</li>
<li><b>Sin garantías:</b> hacemos lo posible para que todo funcione y esté al día, pero la app puede fallar, cambiar o dejar de estar disponible. No respondemos de los daños por usar la información de la app ni de los contenidos de otras webs a las que enlaza.</li>
<li><b>Cambios:</b> si cambian estas condiciones, lo pondremos aquí con su fecha.</li>
</ul>`],

  ['🍪','Cookies',()=>`
<p><b>BasatiNA no usa cookies de publicidad, de análisis ni de terceros para seguirte.</b> Por eso no te sale el típico cartel de aceptar cookies.</p>
<p>Lo único que se guarda en tu móvil o navegador es lo necesario para que la app funcione (almacenamiento local):</p>
<ul>
<li>Tus ajustes (idioma, tema, pueblo elegido…) y tus datos de Mi Espacio.</li>
<li>La sesión de tu cuenta, si has entrado (la gestiona Google Firebase).</li>
<li>Qué día se contó tu visita en el contador anónimo de uso (sin ningún dato tuyo; lo puedes desactivar en «Preferencias de privacidad»).</li>
</ul>
<p>Se borra todo al borrar los datos de la app o al desinstalarla (en la web, al borrar los datos del sitio en el navegador).</p>`],

  ['🤝','Código ético',()=>`
<p>Estos son los compromisos de Son&amp;Pe con BasatiNA:</p>
<ul>
<li><b>Gratis y sin ánimo de lucro:</b> sin publicidad, sin vender datos y sin pedir nada a cambio.</li>
<li><b>Para toda la gente de Navarra:</b> sin política ni temas que dividan. Información útil, para todo el mundo y en castellano, euskera, inglés y francés.</li>
<li><b>Honestidad:</b> decimos siempre de dónde viene cada dato y que no somos una app oficial.</li>
<li><b>Tu privacidad primero:</b> pedimos lo mínimo y lo tuyo se queda en tu móvil.</li>
<li><b>Respeto:</b> moderamos la comunidad con las mismas reglas para todo el mundo, sin insultos, acusaciones ni datos de otras personas.</li>
<li><b>Cuidar Navarra:</b> animamos a disfrutar del monte, los ríos y la naturaleza con respeto: sin dejar basura, sin molestar a la fauna y cumpliendo la normativa.</li>
<li><b>Respeto a los autores:</b> citamos las fuentes y solo publicamos fotos con permiso de quien las hizo.</li>
</ul>
<p>Si crees que no cumplimos algo de esto, dínoslo: ${mail}.</p>`],

  ['♿','Accesibilidad',()=>`
<p>Queremos que BasatiNA la pueda usar todo el mundo. Tomamos como referencia las pautas WCAG 2.1 (nivel AA), aunque la app <b>no está certificada</b> y aún nos queda trabajo.</p>
<p><b>Lo que ya tiene:</b></p>
<ul>
<li>El tamaño de la letra sigue el que tengas puesto en el móvil.</li>
<li>Tema claro y oscuro, y cuatro idiomas (castellano, euskera, inglés y francés).</li>
<li>Textos sencillos, sin tecnicismos, y los avisos importantes siempre con texto (no solo con colores).</li>
</ul>
<p><b>Lo que sabemos que aún falla:</b> algunos mapas, gráficas y animaciones no se leen bien con lector de pantalla (TalkBack), y algunos juegos necesitan la vista y gestos táctiles.</p>
<p>Si encuentras algo que te cuesta usar, escríbenos a ${mail} y lo intentamos arreglar.</p>`],

  ['⚙️','Preferencias de privacidad',()=>`
<p>Aquí decides tú:</p>
<div class="bnaLegOpt"><label><input type="checkbox" class="bnaLegUso" ${noUso()?'':'checked'}> <b>Contar mi visita en el contador anónimo de uso</b></label>
<small>Suma +1 a un total el primer día que abres la app cada día y cada mes. No envía ningún dato tuyo ni de tu móvil. Nos ayuda a saber si la app se usa.</small></div>
<div class="bnaLegOpt"><b>📍 Ubicación, 📷 cámara y 🔔 notificaciones</b>
<small>Son permisos del móvil: los das o los quitas en <b>Ajustes del móvil → Aplicaciones → BasatiNA → Permisos</b> (y Notificaciones).</small></div>
<div class="bnaLegOpt"><b>📦 Mis datos guardados en este móvil</b>
<small>Puedes llevártelos a un archivo (es tuyo, no se envía a nadie). Para borrarlos todos: Ajustes del móvil → Aplicaciones → BasatiNA → Almacenamiento → Borrar datos.</small>
<button class="bnaOfiBtn" data-a="copia">📦 Hacer copia de mis datos</button></div>
<div class="bnaLegOpt"><b>👤 Mi cuenta</b>
<small>Puedes borrarla cuando quieras, con todo lo que guarda: Mi Espacio → 👤 Mi cuenta → Borrar mi cuenta.</small>
<button class="bnaOfiBtn" data-a="borrar" style="background:none;color:var(--acc);border:1px solid var(--acc)">Cómo borrar mi cuenta ↗</button></div>
<div class="bnaLegOpt"><b>🔕 Publicidad y seguimiento</b><small>No hay nada que desactivar: BasatiNA no tiene ni publicidad ni seguimiento.</small></div>`],

  ['💚','Agradecimientos',()=>`
<p>BasatiNA existe gracias a mucha gente y a muchos datos abiertos. <b>¡Eskerrik asko!</b></p>
<ul>
<li><b>A la Cuadrilla BasatiNA:</b> a quienes probáis la app, enviáis avisos, fotos, refranes y sugerencias, y nos ayudáis a mejorarla.</li>
<li><b>A nuestras familias</b>, por la paciencia y por probar cada versión.</li>
<li><b>A quienes publican datos abiertos:</b> Gobierno de Navarra (Datos abiertos, IDENA), SAIH Ebro y Confederación Hidrográfica del Ebro, AEMET, IGN y CNIG, IGME, MITECO, DGT y Red Eléctrica.</li>
<li><b>A los proyectos libres y colaborativos:</b> Open‑Meteo, OpenStreetMap y sus colaboradores (© ODbL), EMSC, GBIF, Pl@ntNet, Wikipedia, RainViewer y TomTom.</li>
<li><b>A las herramientas que usamos:</b> GitHub, Google Firebase, Cloudinary, Web3Forms, jsPDF y las fuentes Lato y Montserrat (licencia SIL OFL).</li>
<li><b>A los fotógrafos y fotógrafas</b> que nos dejáis enseñar vuestras fotos de Navarra.</li>
<li><b>Y queremos agradecer especialmente al guarda del refugio de Belagua</b> su trabajo y todas las facilidades que nos ha dado, como poder enseñar las imágenes de su cámara.</li>
</ul>
<p>La lista completa de fuentes y licencias está en <a href="#" onclick="showTab('creditos');return false">📚 Fuentes y créditos</a> y en <a href="#" onclick="showTab('fuentes');return false">🏛️ Fuentes oficiales</a>.</p>`]
  ];

  const st=document.createElement('style');
  st.textContent=`.bnaLeg{margin:6px 10px 18px;font-size:12.5px;line-height:1.5}
.bnaLeg h4{margin:0 0 8px;font-size:12px;opacity:.75;text-align:center;font-weight:700;letter-spacing:.3px}
.bnaLegGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
@media(max-width:300px){.bnaLegGrid{grid-template-columns:repeat(3,1fr)}}
.bnaLegBtn{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:3px;padding:8px 3px;min-height:58px;border:1px solid var(--line);border-radius:10px;background:transparent;color:inherit;font:inherit;font-size:10.5px;font-weight:700;line-height:1.2;text-align:center;cursor:pointer}
.bnaLegBtn .ic{font-size:17px;line-height:1}
.bnaLegBtn.on{border-color:var(--acc);background:rgba(127,127,127,.12)}
.bnaLegPanel{margin-top:8px;padding:10px 12px;border:1px solid var(--line);border-radius:12px}
.bnaLegPanel h5{margin:0 0 4px;font-size:13px}
.bnaLeg .bnaLegTxt p{margin:5px 0}.bnaLeg ul{margin:5px 0;padding-left:18px}.bnaLeg li{margin:3px 0}
.bnaLeg a{color:var(--acc);text-decoration:underline}
.bnaLegOpt{margin:8px 0;padding:9px;border:1px solid var(--line);border-radius:10px}.bnaLegOpt small{display:block;opacity:.8;margin-top:3px}
.bnaLegOpt input{width:18px;height:18px;vertical-align:middle}
.bnaLegOpt label{font-size:12.5px;color:inherit;opacity:1}.bnaLegOpt b{font-size:12.5px}
.bnaLeg .bnaOfiBtn{font-size:12px;padding:6px 10px;margin-top:6px}
.bnaLeg .bnaLegFecha{text-align:center;font-size:10.5px;opacity:.6;margin-top:8px}`;
  document.head.appendChild(st);

  // rejilla de 4 por fila; al tocar un apartado su texto se abre debajo, a todo el ancho
  function bloque(){const d=document.createElement('div');d.className='bnaLeg';
    d.innerHTML=`<h4>⚖️ Información legal</h4><div class="bnaLegGrid">`+LEG.map(([ic,t],i)=>`<button class="bnaLegBtn" data-i="${i}" aria-expanded="false"><span class="ic">${ic}</span><span>${t}</span></button>`).join('')+
      `</div><div class="bnaLegPanel" hidden></div><div class="bnaLegFecha">Actualizado el ${FECHA} · BasatiNA · Son&amp;Pe Technology Systems</div>`;
    const panel=d.querySelector('.bnaLegPanel');
    d.querySelectorAll('.bnaLegBtn').forEach(b=>b.onclick=()=>{const i=+b.dataset.i,abierto=b.classList.contains('on');
      d.querySelectorAll('.bnaLegBtn').forEach(x=>{x.classList.remove('on');x.setAttribute('aria-expanded','false');});
      if(abierto){panel.hidden=true;panel.innerHTML='';return;}
      b.classList.add('on');b.setAttribute('aria-expanded','true');
      const [ic,t,h]=LEG[i];panel.innerHTML=`<h5>${ic} ${t}</h5><div class="bnaLegTxt">${h()}</div>`;panel.hidden=false;
      const u=panel.querySelector('.bnaLegUso');if(u)u.onchange=()=>{try{u.checked?localStorage.removeItem('bnaNoUso'):localStorage.setItem('bnaNoUso','1');}catch(e){}
        if(typeof toast==='function')toast(u.checked?'Contador anónimo activado':'Contador anónimo desactivado');};
      const c=panel.querySelector('[data-a="copia"]');if(c)c.onclick=()=>{if(typeof muGuardar==='function')muGuardar();else showTab('ajustes');};
      const br=panel.querySelector('[data-a="borrar"]');if(br)br.onclick=()=>{(window.bnaAbrirFuente||(x=>window.open(x,'_blank')))(W+'borrar-cuenta.html');};
      try{panel.scrollIntoView({block:'nearest',behavior:'smooth'});}catch(e){}});
    return d;}

  // Inicio: siempre lo último, debajo del aviso de «app no oficial» (oficial.js lo vuelve a poner al final cada vez)
  function enInicio(){const s=document.getElementById('t-mtiempo');if(!s)return;let d=s.querySelector(':scope>.bnaLeg');if(!d)d=bloque();s.appendChild(d);}
  function enAbout(){const s=document.getElementById('t-about');if(!s||s.querySelector('.bnaLeg'))return;s.appendChild(bloque());}
  // al volver a una pantalla, que la casilla del contador enseñe el estado real
  function refresca(){document.querySelectorAll('.bnaLegUso').forEach(x=>x.checked=!noUso());}
  const _st=showTab;showTab=function(t){_st(t);try{if(t==='mtiempo')enInicio();if(t==='about')enAbout();refresca();}catch(e){}};
  enInicio();setTimeout(enInicio,1600);setTimeout(enInicio,5100);enAbout();
})();
