/* =====================================================================
   📜 LA HISTORIA DE UN REYNO (28 nov. 2026, lo pidieron Pedro y Sonia)
   Una obra en 16 tomos, uno cada sábado a las 10:00 (contenido en web/reyno-datos.js).
   Aspecto: papel viejo amarillento y letras antiguas (Cinzel, IM Fell English y EB Garamond,
   las tres libres con licencia OFL, guardadas en la app para que funcionen sin internet).
   Dónde se ve:
     · Menú: el primer grupo, con foto grande, va directo a la obra.
     · Inicio: tarjeta destacada arriba de «Ahora en Navarra» (con «Nuevo» la semana de cada tomo).
     · Pantalla propia (t-reyno): portada, qué encontrarás, el camino (los 16 tomos), por qué, y cada tomo.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const R=()=>window.REYNO||{tomos:[],pres:{}};
const pub=t=>t.secs&&t.secs.length&&Date.now()>=Date.parse(t.f);
const fecha=f=>new Date(f).toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});
const prox=()=>R().tomos.find(t=>!pub(t));
const ultimo=()=>[...R().tomos].reverse().find(pub);

/* ---------- letras y papel ---------- */
const css=document.createElement('style');
css.textContent=`
@font-face{font-family:'RyCinzel';src:url('reyno-cinzel-400.woff2') format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'RyCinzel';src:url('reyno-cinzel-700.woff2') format('woff2');font-weight:700;font-display:swap}
@font-face{font-family:'RyFell';src:url('reyno-fell.woff2') format('woff2');font-style:normal;font-display:swap}
@font-face{font-family:'RyFell';src:url('reyno-fell-it.woff2') format('woff2');font-style:italic;font-display:swap}
@font-face{font-family:'RyGaramond';src:url('reyno-garamond.woff2') format('woff2');font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:'RyGaramond';src:url('reyno-garamond-it.woff2') format('woff2');font-weight:400;font-style:italic;font-display:swap}
@font-face{font-family:'RyGaramond';src:url('reyno-garamond-600.woff2') format('woff2');font-weight:600;font-display:swap}
.ryPapel{position:relative;color:#3b2a18;font-family:'RyGaramond',Georgia,serif;font-size:18px;line-height:1.6;border-radius:6px;padding:26px 22px;margin:0 0 16px;
  background:
   radial-gradient(ellipse at 12% 8%,rgba(120,72,20,.20),transparent 40%),
   radial-gradient(ellipse at 88% 92%,rgba(120,72,20,.24),transparent 45%),
   radial-gradient(ellipse at 80% 15%,rgba(150,95,30,.10),transparent 30%),
   radial-gradient(circle at 30% 70%,rgba(110,70,25,.08),transparent 22%),
   repeating-linear-gradient(0deg,rgba(90,60,20,.025) 0 2px,transparent 2px 5px),
   linear-gradient(180deg,#f3e6c4,#ead8ab 60%,#e3cc97);
  box-shadow:inset 0 0 40px rgba(110,65,15,.45),inset 0 0 6px rgba(90,50,10,.5),0 6px 18px rgba(60,35,10,.25)}
.ryPapel:before{content:'';position:absolute;inset:7px;border:1.5px solid rgba(122,31,26,.35);border-radius:3px;pointer-events:none}
.ryPapel p{margin:0 0 12px;text-align:justify;hyphens:auto;-webkit-hyphens:auto}
.ryPapel .ryCap:first-letter{float:left;font-family:'RyCinzel',serif;font-weight:700;font-size:58px;line-height:.9;margin:6px 8px 0 0;color:#7a1f1a;text-shadow:1px 1px 0 rgba(255,240,200,.6)}
.ryH{font-family:'RyCinzel',serif;font-weight:700;color:#7a1f1a;text-align:center;letter-spacing:.04em;margin:4px 0 12px;font-size:21px;line-height:1.25}
.ryH2{font-family:'RyFell',serif;color:#5a1712;font-size:22px;text-align:center;margin:0 0 10px}
.ryOrn{text-align:center;color:#7a1f1a;opacity:.75;font-size:18px;letter-spacing:.6em;margin:6px 0 12px}
.ryPres{font-family:'RyFell',serif;font-style:italic;text-align:center;color:#6b4a24;font-size:15px;letter-spacing:.08em;text-transform:uppercase}
.ryTit{font-family:'RyCinzel',serif;font-weight:700;color:#5a1712;text-align:center;font-size:34px;line-height:1.08;margin:6px 0 6px;text-shadow:1px 1px 0 rgba(255,240,200,.7)}
.rySub{font-family:'RyFell',serif;font-style:italic;text-align:center;color:#4a3218;font-size:18px}
.ryCuenta{margin:14px auto 0;max-width:330px;text-align:center;font-family:'RyFell',serif;font-size:16px;color:#3b2a18;border-top:1px solid rgba(122,31,26,.35);border-bottom:1px solid rgba(122,31,26,.35);padding:8px 4px}
.ryCuenta b{font-family:'RyCinzel',serif;color:#7a1f1a}
.ryLista{list-style:none;padding:0;margin:0}
.ryLista li{margin:0 0 9px;padding-left:22px;position:relative}
.ryLista li:before{content:'✦';position:absolute;left:0;top:1px;color:#7a1f1a;font-size:14px}
.ryLista b{font-weight:600;color:#4a1a12}
.ryTomo{display:flex;align-items:center;gap:14px;width:100%;text-align:left;font:inherit;color:inherit;background:rgba(255,248,225,.35);border:1px solid rgba(122,31,26,.3);border-radius:4px;padding:10px 12px;margin:0 0 9px;cursor:pointer;-webkit-tap-highlight-color:transparent}
.ryTomo:active{background:rgba(122,31,26,.12)}
.rySello{flex:none;width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'RyCinzel',serif;font-weight:700;font-size:16px;color:#fbe9c4;
  background:radial-gradient(circle at 35% 30%,#b33a2e,#7a1f1a 60%,#561310);box-shadow:inset 0 0 0 3px rgba(255,220,170,.25),0 2px 4px rgba(60,20,10,.4)}
.ryTomo.prox .rySello{background:radial-gradient(circle at 35% 30%,#a08a64,#7d6845 60%,#5e4c30)}
.ryTomo .ryTT{flex:1;min-width:0;font-family:'RyGaramond',serif;font-size:17px;line-height:1.3;color:#2f2010}
.ryTomo .ryEs{display:block;font-family:'RyFell',serif;font-style:italic;font-size:14px;color:#7a1f1a;margin-top:3px}
.ryTomo.prox .ryEs{color:#6b5a3c}
.ryTomo.prox{opacity:.85}
.ryLema{font-family:'RyFell',serif;font-style:italic;text-align:center;font-size:20px;color:#5a1712;margin:14px 0 4px}
.ryNota{font-size:13.5px;line-height:1.45;color:#5b4527;font-style:italic;text-align:center}
.ryFirma{font-family:'RyFell',serif;font-style:italic;text-align:right;color:#4a3218;margin-top:8px}
.ryFirmaS{display:flex;flex-direction:column;align-items:flex-end;margin:6px 4px 0}
.ryFirmaS .rySello2{display:block}
.ryFirmaT{font-family:'RyFell',serif;font-style:italic;color:#4a3218;font-size:16px;margin:2px 22px 0 0}
#ryHome .rySello2{position:absolute;left:10px;bottom:8px;opacity:.95}
.ryVolver{font-family:'RyCinzel',serif;font-weight:700;background:#7a1f1a;color:#fbe9c4;border:0;border-radius:4px;padding:9px 14px;font-size:14px;margin:0 0 12px;cursor:pointer}
.rySec{border-top:1px solid rgba(122,31,26,.3);padding:10px 0 0;margin:10px 0 0}
.rySec>summary{list-style:none;cursor:pointer;font-family:'RyCinzel',serif;font-weight:700;color:#7a1f1a;font-size:18px;padding:2px 0 8px}
.rySec>summary::-webkit-details-marker{display:none}
.rySec>summary:after{content:' ❧';opacity:.6}
.ryCrono{border-left:2px solid rgba(122,31,26,.45);margin:4px 0 0 8px;padding-left:14px}
.ryCrono div{position:relative;margin:0 0 10px}
.ryCrono div:before{content:'';position:absolute;left:-20px;top:7px;width:10px;height:10px;border-radius:50%;background:#7a1f1a}
.ryCrono b{font-family:'RyCinzel',serif;color:#5a1712;margin-right:6px}
/* tarjeta del Inicio */
#ryHome{display:block;margin:0 0 12px;padding:18px 18px 16px;cursor:pointer;-webkit-tap-highlight-color:transparent}
#ryHome .ryTit{font-size:26px;margin:2px 0}
#ryHome .ryBtn{display:block;margin:10px auto 0;font-family:'RyCinzel',serif;font-weight:700;background:#7a1f1a;color:#fbe9c4;border:0;border-radius:4px;padding:8px 18px;font-size:14px}
#ryHome .ryNuevo{position:absolute;right:14px;top:12px;font-family:'RyCinzel',serif;font-weight:700;font-size:12px;color:#fbe9c4;background:#7a1f1a;border-radius:3px;padding:2px 7px;transform:rotate(4deg)}
/* menú */
html body.bna #bnaDGrid>.dgroup.m6G[data-m6="Historia de un Reyno"]{background-image:linear-gradient(180deg,rgba(40,20,5,.05) 40%,rgba(40,20,5,.65) 100%),url('foto-patrimonio-roncesvalles.webp') !important}
html body.bna #bnaDGrid>.dgroup.m6G[data-m6="Historia de un Reyno"]>span{font-family:'RyCinzel',serif!important;letter-spacing:.03em}
/* la pantalla: fondo de pergamino oscuro alrededor */
body.bna #t-reyno{padding-top:2px}`;
document.head.appendChild(css);

/* ---------- el sello de lacre con el logo de BasatiNA (firma de la obra) ----------
   Lacre rojo con el borde irregular, doble aro, la leyenda alrededor y la silueta del logo
   (web/reyno-sello-na.png: Navarra con el «NA», la hoja y el pájaro) en relieve. */
let NS=0;
function sello(tam,giro,id){const k=id||('rs'+(++NS));
  // borde de lacre: un círculo con «gotas» irregulares (siempre igual, para que no cambie al repintar)
  let d='';const N=48;for(let i=0;i<=N;i++){const a=i/N*Math.PI*2,r=92+Math.sin(i*2.7)*3.2+Math.sin(i*5.3+1)*2.1+(i%7===0?4:0);
    d+=(i?'L':'M')+(100+r*Math.cos(a)).toFixed(1)+' '+(100+r*Math.sin(a)).toFixed(1);}d+='Z';
  return `<svg class="rySello2" viewBox="0 0 200 200" width="${tam}" height="${tam}" style="transform:rotate(${giro||-7}deg)" role="img" aria-label="Sello del Equipo BasatiNA">
   <defs>
    <radialGradient id="${k}w" cx="42%" cy="38%" r="70%"><stop offset="0" stop-color="#d0453a"/><stop offset=".45" stop-color="#a5241d"/><stop offset=".85" stop-color="#7c1511"/><stop offset="1" stop-color="#5a0c09"/></radialGradient>
    <filter id="${k}s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="3" stdDeviation="2.5" flood-color="#3a1a08" flood-opacity=".55"/></filter>
    <filter id="${k}e" x="-10%" y="-10%" width="120%" height="120%"><feColorMatrix type="matrix" values="0 0 0 0 .42  0 0 0 0 .06  0 0 0 0 .05  0 0 0 .95 0"/>
     <feDropShadow dx="1.1" dy="1.1" stdDeviation=".4" flood-color="#2a0402" flood-opacity=".85"/><feDropShadow dx="-.8" dy="-.8" stdDeviation=".3" flood-color="#ffc2a8" flood-opacity=".55"/></filter>
    <filter id="${k}t"><feDropShadow dx=".6" dy=".6" stdDeviation=".2" flood-color="#2a0402" flood-opacity=".9"/><feDropShadow dx="-.5" dy="-.5" stdDeviation=".2" flood-color="#ffc2a8" flood-opacity=".45"/></filter>
    <path id="${k}a" d="M27 100 A73 73 0 0 1 173 100"/>
    <path id="${k}b" d="M33 100 A67 67 0 0 0 167 100"/>
    <radialGradient id="${k}p" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#f7ecd0"/><stop offset=".8" stop-color="#e9d6a8"/><stop offset="1" stop-color="#d6bb83"/></radialGradient>
   </defs>
   <path d="${d}" fill="url(#${k}w)" filter="url(#${k}s)"/>
   <circle cx="100" cy="100" r="86" fill="none" stroke="#6a100c" stroke-width="2.2" opacity=".75"/>
   <circle cx="100" cy="100" r="84.5" fill="none" stroke="#e0705f" stroke-width=".8" opacity=".45"/>
   <text font-family="RyCinzel,serif" font-weight="700" font-size="27" letter-spacing="1.5" text-anchor="middle" fill="#f6dcc0" filter="url(#${k}t)"><textPath href="#${k}a" startOffset="50%">Basati<tspan fill="#ffc94d">NA</tspan></textPath></text>
   <text font-family="RyCinzel,serif" font-weight="700" font-size="14" letter-spacing="3" text-anchor="middle" fill="#f6dcc0" filter="url(#${k}t)" dy="11"><textPath href="#${k}b" startOffset="50%">✠ MMXXVI ✠</textPath></text>
   <circle cx="100" cy="100" r="50" fill="url(#${k}p)" stroke="#6a100c" stroke-width="2.5"/>
   <circle cx="100" cy="100" r="46.5" fill="none" stroke="#a5241d" stroke-width=".8" opacity=".6"/>
   <image href="reyno-sello-color.png" x="61" y="61" width="78" height="78"/>
   <ellipse cx="78" cy="62" rx="30" ry="12" fill="#fff" opacity=".10" transform="rotate(-30 78 62)"/>
  </svg>`;}
const firmaSello=()=>`<div class="ryFirmaS">${sello(150,-8)}<div class="ryFirmaT">${E(R().firma)}</div></div>`;

/* ---------- la pantalla ---------- */
const sec=svSec('reyno','<div id="ryV" class="noFB"></div>');
try{TITLES.reyno='La Historia de un Reyno';PVS_ESC.reyno='pueblo';}catch(e){}
let VISTA=null;   // null = portada; n = tomo
function portada(){const D=R(),P=D.pres||{},nx=prox();
  return `<div class="ryPapel">
   <div class="ryPres">BasatiNA presenta</div>
   <div class="ryTit">${E(D.titulo)}</div>
   <div class="rySub">${E(D.sub)}</div>
   <div class="ryOrn">❦ ✠ ❦</div>
   ${nx?`<div class="ryCuenta">${nx.n==='0'&&!ultimo()?'Primer tomo':'Próximo tomo'}: <b>Tomo ${E(nx.n)}</b><br>${E(fecha(nx.f))}, a las 10:00${cuenta(nx)}</div>`:''}
  </div>
  <div class="ryPapel">
   <div class="ryH">Presentación</div>
   ${(P.intro||[]).map((p,i)=>`<p${i?'':' class="ryCap"'}>${E(p)}</p>`).join('')}
  </div>
  <div class="ryPapel">
   <div class="ryH">Qué encontrarás aquí</div>
   <p>${E(P.que)}</p><p>Cada tomo recogerá:</p>
   <ul class="ryLista">${(P.queLista||[]).map(([a,b])=>`<li><b>${E(a)}:</b> ${E(b)}</li>`).join('')}</ul>
  </div>
  <div class="ryPapel">
   <div class="ryH">El camino que vamos a recorrer</div>
   ${D.tomos.map(t=>{const p=pub(t);return `<button class="ryTomo${p?'':' prox'}" data-n="${E(t.n)}"><span class="rySello">${E(t.n)}</span>
     <span class="ryTT">${E(t.t)}<span class="ryEs">${p?'Leer el tomo ›':'Próximamente · '+E(fecha(t.f))}</span></span></button>`;}).join('')}
  </div>
  <div class="ryPapel">
   <div class="ryH">Por qué contamos esta historia</div>
   ${(P.porque||[]).map((p,i)=>`<p${i?'':' class="ryCap"'}>${E(p)}</p>`).join('')}
   <div class="ryOrn">❦</div>
   <div class="ryLema">${E(P.lema)}</div>
   ${firmaSello()}
  </div>
  <div class="ryNota" style="margin:0 10px 16px">${E(P.nota)}</div>`;}
function cuenta(t){const ms=Date.parse(t.f)-Date.now();if(ms<=0)return '';const d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5);
  return `<br><i>faltan ${d?d+' día'+(d>1?'s':'')+(h?' y ':''):''}${h||!d?h+' hora'+(h!==1?'s':''):''}</i>`;}
function tomo(t){const sx=(t.secs||[]);
  return `<button class="ryVolver" id="ryVolver">‹ Todos los tomos</button>
  <div class="ryPapel">
   <div class="ryPres">Tomo ${E(t.n)}</div>
   <div class="ryTit" style="font-size:28px">${E(t.t)}</div>
   <div class="ryOrn">❦ ✠ ❦</div>
   ${sx.map((s,i)=>`<details class="rySec"${i===0?' open':''}><summary>${E(s.t)}</summary>${(s.p||[]).map((p,j)=>`<p${i===0&&j===0?' class="ryCap"':''}>${p}</p>`).join('')}</details>`).join('')}
   ${(t.crono||[]).length?`<details class="rySec"><summary>Cronología</summary><div class="ryCrono">${t.crono.map(([a,b])=>`<div><b>${E(a)}</b>${E(b)}</div>`).join('')}</div></details>`:''}
   ${(t.fuentes||[]).length?`<details class="rySec"><summary>Fuentes</summary><ul class="ryLista">${t.fuentes.map(f=>`<li>${f}</li>`).join('')}</ul></details>`:''}
   ${firmaSello()}
  </div>`;}
function pinta(){const v=$('ryV');if(!v)return;const t=VISTA!=null&&R().tomos.find(x=>x.n===VISTA&&pub(x));
  v.innerHTML=t?tomo(t):portada();
  v.querySelectorAll('.ryTomo').forEach(b=>b.onclick=()=>{const x=R().tomos.find(y=>y.n===b.dataset.n);
    if(x&&pub(x)){VISTA=x.n;try{localStorage.setItem('ryUlt',x.n);}catch(e){}pinta();window.scrollTo(0,0);}
    else if(x)toast('📜 El Tomo '+x.n+' se publica el '+fecha(x.f)+' a las 10:00');});
  const vb=$('ryVolver');if(vb)vb.onclick=()=>{VISTA=null;pinta();window.scrollTo(0,0);};}

/* ---------- tarjeta del Inicio ---------- */
function home(){const H=$('bnaHome');if(!H)return;const now=H.querySelector('.bnaNow');if(!now)return;
  let c=$('ryHome');const u=ultimo(),nx=prox(),nuevo=u&&Date.now()-Date.parse(u.f)<7*864e5;
  const html=`${nuevo?'<span class="ryNuevo">Nuevo</span>':''}<div class="ryPres">${u?'Tomo '+E(u.n)+' ya disponible':'Nuevo en BasatiNA'}</div>
    <div class="ryTit">La Historia de un Reyno</div>
    <div class="rySub" style="font-size:16px">${u?E(u.t):'Del Reino de Pamplona a la Ley Paccionada, en 16 tomos'}</div>
    ${nx?`<div class="ryNota" style="margin-top:8px">${nx.n==='0'&&!u?'Primer tomo':'Tomo '+E(nx.n)}: ${E(fecha(nx.f))}, 10:00</div>`:''}
    <button class="ryBtn">${u?'Leer el tomo':'Leer la presentación'}</button>${sello(54,-12,'rsHome')}`;
  if(!c){c=document.createElement('article');c.id='ryHome';c.className='ryPapel noFB';c.onclick=()=>{const l=ultimo();VISTA=l&&nuevo?l.n:null;showTab('reyno');};}
  if(c.dataset.h!==html){c.innerHTML=html;c.dataset.h=html;}
  // lo primero de la parte central del Inicio: encima del título «Ahora en Navarra»
  const tit=now.previousElementSibling&&now.previousElementSibling.classList.contains('bnaH')?now.previousElementSibling:now;
  if(c.nextElementSibling!==tit||c.parentElement!==tit.parentElement)tit.parentElement.insertBefore(c,tit);}
setInterval(()=>{try{if($('t-mtiempo')&&$('t-mtiempo').classList.contains('on'))home();}catch(e){}},2000);

/* ---------- menú: el primer grupo, directo ---------- */
function menu6(){const g=$('bnaDGrid');if(!g||g.querySelector('[data-m6="Historia de un Reyno"]'))return;
  if(!g.querySelector('.dgroup.m6G'))return;   // el menú aún no está montado
  const d=document.createElement('div');d.className='dgroup m6G m6Solo m6Ft';d.dataset.m6='Historia de un Reyno';
  d.innerHTML='<span data-k="Historia de un Reyno">La Historia de un Reyno</span><i>▸</i>';
  d.onclick=e=>{e.stopPropagation();VISTA=null;showTab('reyno');try{menu(false);}catch(x){}};
  g.prepend(d);}
const dg=$('bnaDGrid');if(dg)new MutationObserver(menu6).observe(dg,{childList:true});setTimeout(menu6,500);setTimeout(menu6,2500);

const _st=showTab;showTab=function(t){const r=_st.apply(this,arguments);
  if(t==='reyno'){pinta();const s=document.querySelector('#pvSec .pvsT small');if(s)s.textContent='Mil años de historia';}
  if(t==='mtiempo')setTimeout(home,300);return r;};
setTimeout(home,1500);
try{Object.assign(I18N.eu,{'La Historia de un Reyno':'Erresuma baten Historia'});}catch(e){}
})();
