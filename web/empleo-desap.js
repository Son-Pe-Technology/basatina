/* =====================================================================
   💼 EMPLEO EN NAVARRA y 🔎 PERSONAS DESAPARECIDAS (21 nov. 2026) — se carga después de relax.js
   Las dos pantallas van en el grupo «Servicios».

   💼 `empleo`: dónde están las ofertas de trabajo abiertas en Navarra.
     - Arriba: botón grande a las ofertas del Servicio Navarro de Empleo (SNE–Nafar Lansare) y un buscador
       (palabra + pueblo) que abre la búsqueda en Indeed, Jooble o Google.
     - Lista EM_L: portales y bolsas de empleo. Para añadir uno: una línea más en EM_L →
         {n:'Nombre', c:['temas'], d:'Qué es', w:'web', t:'teléfono'}
       Temas (EM_T): ofi (oficial), portal, publico (oposiciones), joven, social, emprende.
       Si no hay web comprobada, no se pone `w`: sale «🔎 Buscar».

   🔎 `desaparecidos`: alertas de personas desaparecidas en Navarra.
     - Titulares de los últimos 15 días sobre desapariciones y localizaciones en Navarra: los saca el robot de
       Titulares (tools/noticias.py, cada 2 h) de los MISMOS canales RSS → noticias/desaparecidos.json
       ({t, dias, items:[{t,u,f,d,e}]}, e = 'busca' o 'ok' = localizada). Solo titular + enlace + medio + hora.
     - Enlaces a las alertas oficiales (CNDES, Ministerio del Interior) y a SOS Desaparecidos, teléfonos 112
       y 116 000, y qué hacer si desaparece alguien.
     - Inicio: tarjeta roja «Se busca» (#dsCard) si hay un titular de búsqueda de las últimas 72 horas.
       Se puede cerrar (✕): no vuelve a salir para ese titular (localStorage `dsVisto`).
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const E=s=>(typeof esc==='function'?esc(s):String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
const abre=u=>{if(window.amAbre)amAbre(u);else window.open(u,'_blank');};
const nrm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const nuevo=(t,g,l,sc,ic,fam)=>{try{window.amNuevo(t,g,l,sc,ic,fam);}catch(e){}};
const hook=(t,fn)=>{if(window.svHook)svHook(t,fn);};
const svs=(id,h)=>(window.svSec?svSec:(i,x)=>{const s=document.createElement('section');s.id='t-'+i;s.innerHTML=x;(document.querySelector('.wrap')||document.body).appendChild(s);return s;})(id,h);
const hace=d=>{const m=Math.round((Date.now()-Date.parse(d))/60e3);if(!(m>=0))return '';if(m<60)return 'hace '+Math.max(1,m)+' min';const h=Math.round(m/60);if(h<24)return 'hace '+h+' h';const n=Math.round(h/24);return n===1?'ayer':'hace '+n+' días';};

const st=document.createElement('style');st.textContent=`
.emChips{display:flex;gap:6px;overflow-x:auto;padding:2px 0 6px}.emChips button{flex:none;border:1px solid var(--line);background:none;color:inherit;border-radius:18px;padding:6px 12px;font:inherit;font-size:14px;cursor:pointer}
.emChips button.on{background:#303f9f;color:#fff;border-color:transparent}
.emIt{padding:10px 0;border-top:1px solid var(--line)}.emIt:first-child{border-top:0}.emIt b{font-size:15.5px}
.emIt .d{font-size:14px;line-height:1.45;margin-top:4px}.emIt .a{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}
.emIt .a button,.emIt .a a{border:1px solid var(--line);background:none;color:var(--acc);border-radius:10px;padding:5px 9px;font:inherit;font-size:13px;cursor:pointer;text-decoration:none}
.emBig{display:block;width:100%;margin-top:8px;border:0;border-radius:14px;padding:13px 12px;font:inherit;font-size:16px;font-weight:800;color:#fff;background:linear-gradient(150deg,#7986cb,#303f9f);cursor:pointer;text-align:left}
.emBig small{display:block;font-size:12.5px;font-weight:500;opacity:.9;margin-top:2px}
.emQ{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}.emQ input{width:100%;box-sizing:border-box}
.emQb{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.dsIt{padding:9px 0;border-top:1px solid var(--line);cursor:pointer}.dsIt:first-child{border-top:0}
.dsIt b{font-size:15px;line-height:1.35;display:block}.dsIt .m{font-size:12px;color:var(--mut);margin-top:3px}
.dsE{display:inline-block;font-size:11.5px;font-weight:800;border-radius:8px;padding:1px 7px;margin-right:5px;vertical-align:1px}
.dsE.busca{background:#c62828;color:#fff}.dsE.ok{background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7}
.dsTel{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.dsTel a,.dsTel a small{color:#fff!important}.dsTel a{display:block;text-decoration:none;border-radius:14px;padding:10px;font-weight:800;font-size:20px;text-align:center}
.dsTel a small{display:block;font-size:12px;font-weight:600;opacity:.95}
#dsCard{display:flex;align-items:center;gap:9px;background:linear-gradient(135deg,#ffebee,#fce4ec);border:1px solid #ef9a9a;border-radius:14px;padding:7px 8px 7px 10px;margin:8px 0;cursor:pointer;color:#3e0b0b}
#dsCard .i{flex:none;font-size:20px}#dsCard .x{flex:1;min-width:0}#dsCard .k{font-size:10.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#c62828}
#dsCard .t{font-size:14px;font-weight:700;line-height:1.25;margin-top:1px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#dsCard .m{font-size:11px;color:#8d4b4b;margin-top:1px}#dsCard .c{flex:none;border:0;background:none;color:#c62828;font-size:18px;padding:4px 6px;cursor:pointer}`;
document.head.appendChild(st);

try{Object.assign(BNI,{
 'i-maletin':'<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><rect x="5" y="11" width="22" height="15" rx="3" fill="currentColor" fill-opacity=".14"/><path d="M12 11V8.5A2.5 2.5 0 0 1 14.5 6h3A2.5 2.5 0 0 1 20 8.5V11M5 17h22"/></g>',
 'i-lupa':'<g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="14" cy="14" r="8" fill="currentColor" fill-opacity=".14"/><path d="M20 20l7 7"/><circle cx="14" cy="12" r="2.4"/><path d="M10 18.5c1-2 2.4-3 4-3s3 1 4 3"/></g>'});}catch(e){}

/* =================== 💼 EMPLEO =================== */
const SNE='https://administracionelectronica.navarra.es/EmpleoIntermediacion/listadodeofertas';
const EM_T=[['todo','✨ Todo'],['ofi','🏛️ Oficial'],['portal','🌐 Portales'],['publico','📝 Empleo público'],['joven','🎒 Jóvenes y sin experiencia'],['social','🤝 Entidades sociales'],['emprende','🚀 Emprender']];
const EM_L=[
 {n:'Servicio Navarro de Empleo – Nafar Lansare (SNE–NL)',c:['ofi','joven'],d:'Las ofertas de trabajo de toda Navarra que gestiona el servicio público de empleo. En cada oferta pone cómo apuntarse (muchas, con el botón «Inscribirme»).',w:SNE},
 {n:'Agencia de Empleo de Tudela (SNE–NL)',c:['ofi'],d:'Ofertas, orientación y cursos para la Ribera. Calle Díaz Bravo, 20 (Tudela).',t:'948 82 18 70'},
 {n:'Indeed · empleo en Navarra',c:['portal'],d:'Buscador que junta ofertas de muchas webs y empresas.',w:'https://es.indeed.com/browsejobs/in/Navarra-provincia'},
 {n:'InfoJobs · ofertas en Navarra',c:['portal'],d:'El portal de empleo más usado en España. Hace falta cuenta para apuntarse a las ofertas.',w:'https://www.infojobs.net/ofertas-trabajo/navarra'},
 {n:'Jooble · Comunidad Foral de Navarra',c:['portal'],d:'Buscador de ofertas de muchas webs. Puedes recibir las nuevas en tu correo.',w:'https://es.jooble.org/trabajo/Comunidad-Foral-de-Navarra'},
 {n:'Cámara de Comercio de Navarra · ofertas de empleo',c:['portal'],d:'Ofertas que publican empresas navarras a través de la Cámara (también en pueblos como Andosilla).'},
 {n:'Empleo público del Gobierno de Navarra (oposiciones)',c:['publico'],d:'Convocatorias de oposiciones y listas de contratación temporal de la Administración foral.'},
 {n:'Universidad Pública de Navarra (UPNA) · empleo público',c:['publico'],d:'Convocatorias de plazas de la UPNA (personal técnico, de gestión y de servicios).',w:'https://www.unavarra.es/sede/tablon-electronico/empleo-publico/convocatorias-pas?submenu=yes&opcion=3'},
 {n:'Boletín Oficial de Navarra (BON) · oposiciones de ayuntamientos',c:['publico'],d:'Ahí salen las convocatorias de ayuntamientos, mancomunidades y concejos de Navarra.'},
 {n:'Garantía Juvenil en Navarra (SEPE)',c:['joven'],d:'Para jóvenes de 16 a 29 años: boletines con ofertas sin experiencia, escuelas taller y cursos con contrato.'},
 {n:'Escuelas taller (formación + contrato)',c:['joven'],d:'Programas de 16 a 30 años en los que aprendes un oficio cobrando (hostelería en Tudela, comercio y almacén en Pamplona…).'},
 {n:'Red Navarra de Lucha contra la Pobreza · ofertas de entidades sociales',c:['social'],d:'Trabajo en el ámbito educativo y social: educadores, orientadores, atención directa…'},
 {n:'Navarra Emprende · Bolsa de relevo de negocios',c:['emprende'],d:'Negocios que buscan a alguien que los continúe, y asesoramiento gratis para emprender.'},
 {n:'Ruta 31 (CEIN)',c:['emprende','joven'],d:'Programa gratuito para validar tu idea y poner en marcha tu negocio en Navarra.'}
];
let EMT='todo';
svs('empleo',`<div class="card"><b>💼 Empleo en Navarra</b><div class="note">Ofertas de trabajo abiertas ahora mismo. BasatiNA no gestiona ofertas: te lleva a las webs donde se publican.</div>
 <button class="emBig" id="emSNE">🏛️ Ofertas del Servicio Navarro de Empleo<small>Todas las ofertas públicas de Navarra, al día</small></button></div>
<div class="card"><b>🔎 Buscar un trabajo</b><div class="emQ"><input id="emK" class="town" placeholder="¿De qué? (camarero, soldador…)"><input id="emP" class="town" placeholder="¿Dónde? (Navarra)"></div>
 <div class="emQb"><button class="btn pri" data-q="indeed">Buscar en Indeed</button><button class="btn" data-q="jooble">En Jooble</button><button class="btn" data-q="google">En Google</button></div></div>
<div class="card"><div class="emChips" id="emT"></div><div id="emL" style="margin-top:6px"></div></div>
<div class="card"><b>💡 Consejos</b><div class="note" style="line-height:1.55">• Inscríbete como demandante de empleo en el SNE–NL: muchas ofertas lo piden y te pueden avisar a ti.<br>• Ten tu currículum en PDF en el móvil para enviarlo enseguida.<br>• Desconfía de ofertas que piden dinero, datos del banco o que llames a números de pago: ninguna oferta seria lo hace.<br>• ¿Conoces una bolsa de empleo navarra que falte? Cuéntanoslo en el <a href="#" id="emBuz">buzón de sugerencias</a>.</div></div>`);
nuevo('empleo','Servicios','💼 Empleo','pueblo','i-maletin','b');

function emRender(){
  $('emT').innerHTML=EM_T.map(([k,l])=>`<button class="${k===EMT?'on':''}" data-k="${k}">${l}</button>`).join('');
  $('emT').querySelectorAll('button').forEach(b=>b.onclick=()=>{EMT=b.dataset.k;emRender();});
  const L=EM_L.filter(x=>EMT==='todo'||x.c.includes(EMT)),el=$('emL');
  el.innerHTML=L.map((x,i)=>`<div class="emIt"><b>${E(x.n)}</b><div class="d">${E(x.d)}</div><div class="a">${x.w?`<button data-w="${E(x.w)}">🌐 Ver ofertas</button>`:`<button data-s="${i}">🔎 Buscar</button>`}${x.t?`<a href="tel:${E(x.t.replace(/\s/g,''))}">📞 ${E(x.t)}</a>`:''}</div></div>`).join('');
  el.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>abre(b.dataset.w));
  el.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>abre('https://www.google.com/search?q='+encodeURIComponent(L[+b.dataset.s].n+' Navarra')));}
$('emSNE').onclick=()=>abre(SNE);
document.querySelectorAll('#t-empleo [data-q]').forEach(b=>b.onclick=()=>{const k=$('emK').value.trim(),p=$('emP').value.trim()||'Navarra';
  const u={indeed:'https://es.indeed.com/jobs?q='+encodeURIComponent(k)+'&l='+encodeURIComponent(p),
    jooble:'https://es.jooble.org/SearchResult?ukw='+encodeURIComponent(k)+'&rgns='+encodeURIComponent(p),
    google:'https://www.google.com/search?q='+encodeURIComponent((k?k+' ':'')+'ofertas de empleo '+p)}[b.dataset.q];abre(u);});
$('emBuz').onclick=e=>{e.preventDefault();showTab('buzon');};
hook('empleo',emRender);

/* =================== 🔎 PERSONAS DESAPARECIDAS =================== */
const CNDES='https://cndes-web.ses.mir.es';
let DS=null;
async function dsLoad(force){if(DS&&!force)return DS;try{DS=await jsLoad('noticias/desaparecidos.json',{items:[]},force);}catch(e){DS={items:[]};}return DS||{items:[]};}
svs('desaparecidos',`<div class="card"><b>🔎 Personas desaparecidas en Navarra</b><div class="note">Si ves a alguien de estas alertas, <b>no actúes por tu cuenta: llama al 112</b> y di dónde y cuándo lo has visto. Compartir la alerta oficial también ayuda.</div>
 <div class="dsTel"><a href="tel:112" style="background:#c62828">112<small>Emergencias · SOS Navarra</small></a><a href="tel:116000" style="background:#6a1b9a">116 000<small>Menores desaparecidos</small></a></div></div>
<div class="card"><b>🚨 Alertas oficiales</b><div class="note">Las fichas con foto las publica la policía. Aquí tienes dónde verlas:</div>
 <div class="emQb"><button class="btn pri" id="dsCN">🏛️ Centro Nacional de Desaparecidos</button><button class="btn" id="dsSOS">SOS Desaparecidos</button></div></div>
<div class="card"><b>📰 En las noticias (últimos 15 días)</b><div class="note">Titulares de medios navarros sobre desapariciones y personas localizadas. Toca uno para leerlo en el medio.</div><div id="dsL" style="margin-top:6px"><div class="note">Cargando…</div></div></div>
<div class="card"><b>🧭 Si desaparece alguien cercano</b><div class="note" style="line-height:1.55">• <b>No esperes 24 horas</b>: es un mito. Si es menor, mayor o tiene problemas de salud, llama ya al 112.<br>• Denuncia en la Policía Foral, Policía Nacional, Guardia Civil o Policía Municipal, con una foto reciente, su ropa, su móvil y los sitios a los que suele ir.<br>• Busca en casa, en casa de familiares y amigos, en parques y en los lugares donde vivió antes.<br>• Antes de difundir nada en redes, habla con la policía. Comparte solo alertas oficiales y quítalas cuando aparezca.</div></div>`);
nuevo('desaparecidos','Servicios','🔎 Personas desaparecidas','pueblo','i-lupa','r');

async function dsRender(force){const el=$('dsL');const D=await dsLoad(force);const L=(D.items||[]);
  el.innerHTML=L.length?L.map((x,i)=>`<div class="dsIt" data-i="${i}"><b><span class="dsE ${x.e==='ok'?'ok':'busca'}">${x.e==='ok'?'📍 Localizada':'🔎 Se busca'}</span>${E(x.t)}</b><div class="m">${E(x.f)} · ${hace(x.d)}</div></div>`).join('')
   :'<div class="note">No hay titulares de desapariciones en Navarra estos días. Las alertas oficiales están en el Centro Nacional de Desaparecidos.</div>';
  el.querySelectorAll('[data-i]').forEach(d=>d.onclick=()=>abre(L[+d.dataset.i].u));}
$('dsCN').onclick=()=>abre(CNDES);
$('dsSOS').onclick=()=>abre('https://sosdesaparecidos.es');
hook('desaparecidos',()=>dsRender(true));

// tarjeta en el Inicio: solo si hay un titular «Se busca» de las últimas 72 horas que no hayas cerrado
const visto=()=>{try{return JSON.parse(localStorage.getItem('dsVisto')||'[]');}catch(e){return [];}};
async function dsHome(force){const ini=$('t-mtiempo');if(!ini)return;let el=$('dsCard');
  const D=await dsLoad(force),V=visto();
  const x=(D.items||[]).find(x=>x.e!=='ok'&&Date.now()-Date.parse(x.d)<72*3600e3&&!V.includes(x.u));
  if(!x){if(el)el.style.display='none';return;}
  if(!el){const ref=$('nwTk');ini.insertAdjacentHTML('afterbegin','<div id="dsCard" role="button"></div>');el=$('dsCard');if(ref&&ref.parentNode===ini)ref.after(el);}
  el.style.display='';
  el.innerHTML=`<div class="i">🔎</div><div class="x"><div class="k">Alerta · Se busca en Navarra</div><div class="t">${E(x.t)}</div><div class="m">${E(x.f)} · ${hace(x.d)} · toca para ver más</div></div><button class="c" aria-label="Cerrar">✕</button>`;
  el.onclick=e=>{if(e.target.closest('.c')){e.stopPropagation();try{const v=visto();v.push(x.u);localStorage.setItem('dsVisto',JSON.stringify(v.slice(-40)));}catch(_){}el.style.display='none';return;}showTab('desaparecidos');};}
setTimeout(()=>dsHome(),2600);
setInterval(()=>{if($('t-mtiempo')&&$('t-mtiempo').classList.contains('on'))dsHome(true);},30*60e3);

/* ---------- fuentes en el pie de cada pantalla (oficial.js) ---------- */
try{Object.assign(window.BNA_DATOS||{},{
  empleo:'enlaces a las webs de cada servicio o portal de empleo; BasatiNA no guarda ofertas',
  desaparecidos:'titulares y enlaces de los medios (Diario de Navarra, Europa Press, Cadena SER, COPE, Pamplona Actual, Navarra Capital) · alertas oficiales: Centro Nacional de Desaparecidos (Ministerio del Interior)'});}catch(e){}
window.EM_L=EM_L;
})();
