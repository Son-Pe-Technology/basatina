/* =====================================================================
   🪓 DEPORTE RURAL · HERRI KIROLAK (21 nov. 2026) — se carga después de empleo-desap.js
   1. «Deporte rural» como deporte nuevo de Deporte navarro (DP_DEPS, clave `rural`): los administradores
      apuntan campeonatos y exhibiciones en Deporte navarro con ese deporte (en «Local» el campeonato o
      el deportista, «Visitante» puede ir vacío) y salen aquí y en Deporte navarro.
   2. Pantalla `rural` (grupo «Qué hacer»):
      - Próximas citas: las de Deporte navarro con dep='rural' + las de la Agenda cultural que tengan
        palabras de RU_KW (aizkolari, harrijasotzaile, sokatira, txinga…).
      - Últimos resultados (Deporte navarro, dep='rural').
      - Modalidades: lista RU_M (añadir una = una línea: [emoji, nombre, euskera, explicación]).
      - San Fermín: del 8 al 14 de julio, a las 12:00, en la plaza de los Fueros (con la Federación Navarra).
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const E=s=>(typeof esc==='function'?esc(s):String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
const abre=u=>{if(window.amAbre)amAbre(u);else window.open(u,'_blank');};
const hook=(t,fn)=>{if(window.svHook)svHook(t,fn);};
const urlOk=u=>/^https?:\/\//.test(u||'');

/* ---------- 1. deporte nuevo en Deporte navarro ---------- */
try{if(!DP_DEPS.some(x=>x[0]==='rural')){const i=DP_DEPS.findIndex(x=>x[0]==='otros');DP_DEPS.splice(i<0?DP_DEPS.length:i,0,['rural','Deporte rural','🪓']);}}catch(e){}

try{Object.assign(BNI,{'i-hacha':'<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 9l14 17"/><path d="M6.5 13.5c-1.8-3.6.4-8 4.2-9.2L15 8.8l-5.4 6.4z" fill="currentColor" fill-opacity=".18"/><path d="M5 27h22"/><rect x="18" y="21" width="9" height="6" rx="1.5" fill="currentColor" fill-opacity=".12"/></g>'});}catch(e){}

const RU_M=[
 ['🪓','Aizkora (aizkolaris)','aizkora','Cortar troncos a golpe de hacha lo más rápido posible. Hay campeonatos individuales y por parejas.'],
 ['🪚','Tronza','trontza','Dos personas cortan un tronco con una sierra larga, una a cada lado, tirando a la vez.'],
 ['🪨','Levantamiento de piedra','harri-jasotzea','Los harrijasotzailes levantan piedras de muchos kilos hasta el hombro, el mayor número de veces.'],
 ['🪢','Sokatira','sokatira','Dos equipos tiran de una cuerda gruesa: gana el que arrastra al otro. En Navarra hay clubes en Berriozar, la Txantrea, Ansoáin, Lesaka, Betelu y Baztan.'],
 ['🏋️','Txinga-erute','txingak eramatea','Andar la mayor distancia posible con una pesa (txinga) en cada mano.'],
 ['🛞','Levantamiento de carro','orga-jokoa','Levantar un carro de mucho peso por la lanza y hacerlo girar sin que las ruedas toquen el suelo.'],
 ['🌾','Fardo','lasto-altxatzea','Subir con una polea o lanzar un fardo de paja lo más alto posible.'],
 ['🐂','Arrastre de piedra','idi-probak / gizon-probak','Arrastrar una piedra enorme por la plaza, con bueyes o con personas, dando las vueltas que se pueda en un tiempo.'],
 ['⚙️','Motosierra','motozerra','Cortes de tronco con motosierra contra reloj. En San Fermín hay trofeo propio.'],
 ['🌱','Siega (segalaris)','segalariak','Segar hierba a guadaña en un terreno marcado; gana quien más siega.']
];
const RU_KW=/herri ?kirol|deporte rural|aizkol|aizkora|harri ?jaso|levantamiento de (piedra|carro|fardo)|sokatira|soka-tira|txinga|tronza|trontza|segalari|idi ?proba|gizon ?proba|arrastre de piedra|motosierra/i;

const st=document.createElement('style');st.textContent=`
.ruM{display:grid;grid-template-columns:1fr;gap:6px;margin-top:8px}.ruM div{border:1px solid var(--line);border-radius:12px;padding:8px 10px}
.ruM b{font-size:15px}.ruM i{font-style:normal;font-size:12px;color:var(--mut);margin-left:4px}.ruM p{margin:3px 0 0;font-size:13.5px;line-height:1.4}
.ruC{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-top:1px solid var(--line)}.ruC:first-child{border-top:0}
.ruC .d{flex:none;width:44px;text-align:center;border-radius:10px;background:rgba(121,85,72,.1);padding:3px 0;line-height:1.1}.ruC .d b{display:block;font-size:18px}.ruC .d small{font-size:11px}
.ruC .s{font-size:12.5px;color:var(--mut);margin-top:2px}.ruC .r{flex:none;font-weight:800;color:var(--acc)}`;
document.head.appendChild(st);

(window.svSec?svSec:(id,h)=>{const s=document.createElement('section');s.id='t-'+id;s.innerHTML=h;(document.querySelector('.wrap')||document.body).appendChild(s);return s;})('rural',
`<div class="card"><b>🪓 Deporte rural · Herri kirolak</b><div class="note">Los deportes que nacieron del trabajo en el caserío y el campo: cortar troncos, levantar piedras, tirar de la soga… Aquí tienes las próximas citas en Navarra y qué es cada modalidad.</div>
 <div class="row" style="margin-top:8px;flex-wrap:wrap"><button class="btn pri" id="ruDep">🏆 Ver en Deporte navarro</button><button class="btn" id="ruFed">🔎 Federación Navarra de Herri Kirolak</button></div></div>
<div class="card"><b>📅 Próximas citas</b><div id="ruP" style="margin-top:6px"><div class="note">Cargando…</div></div></div>
<div class="card"><b>🏁 Últimos resultados</b><div id="ruR" style="margin-top:6px"></div></div>
<div class="card"><b>🎉 En San Fermín</b><div class="note" style="line-height:1.5">Del 8 al 14 de julio, todos los días a las 12:00, la plaza de los Fueros de Pamplona acoge campeonatos navarros, torneos y exhibiciones de deporte rural, con la Federación Navarra. Gratis y al aire libre.</div></div>
<div class="card"><b>📖 Las modalidades</b><div class="ruM" id="ruM"></div></div>`);
try{window.amNuevo('rural','Qué hacer','🪓 Deporte rural','fiesta','i-hacha','r');}catch(e){}

const fila=x=>{const dt=new Date(x.f+'T12:00');return `<div class="ruC"><div class="d"><small>${dt.toLocaleDateString('es-ES',{weekday:'short'}).replace('.','')}</small><b>${dt.getDate()}</b><small>${dt.toLocaleDateString('es-ES',{month:'short'}).replace('.','')}</small></div>
  <div style="flex:1;min-width:0"><b>${E(x.t)}</b><div class="s">${[x.h&&'🕛 '+x.h,x.lugar&&'📍 '+x.lugar].filter(Boolean).map(E).join(' · ')}</div>${urlOk(x.url)?`<div class="s"><a href="#" data-u="${E(x.url)}">Más información ›</a></div>`:''}</div>${x.res?`<div class="r">${E(x.res)}</div>`:''}</div>`;};

async function ruRender(){
  $('ruM').innerHTML=RU_M.map(m=>`<div><b>${m[0]} ${E(m[1])}</b><i>${E(m[2])}</i><p>${E(m[3])}</p></div>`).join('');
  const hoy=typeof hoyYmd==='function'?hoyYmd():new Date().toISOString().slice(0,10);
  let G={partidos:[]},A={eventos:[]};
  try{G=await jsLoad(DP_PATH,DP_DEF)||G;}catch(e){}
  try{A=await jsLoad('agenda/cultura.json',{eventos:[]})||A;}catch(e){}
  const P=(G.partidos||[]).filter(x=>x.dep==='rural').map(x=>({t:[x.comp,[x.loc,x.vis].filter(Boolean).join(' – ')].filter(Boolean).join(': '),f:x.f,h:x.h,lugar:x.lugar,url:x.url,res:x.res}));
  const Ag=(A.eventos||[]).filter(e=>(e.ff||e.f)>=hoy&&RU_KW.test((e.t||'')+' '+(e.desc||''))).map(e=>({t:e.t,f:e.f<hoy?hoy:e.f,h:e.h,lugar:[e.lugar,e.pueblo].filter(Boolean).join(', '),url:e.url}));
  const asc=(a,b)=>(a.f+(a.h||'99')).localeCompare(b.f+(b.h||'99'));
  const prox=P.filter(x=>x.f>=hoy).concat(Ag).sort(asc),res=P.filter(x=>x.f<hoy&&x.res).sort((a,b)=>asc(b,a));
  $('ruP').innerHTML=prox.length?prox.slice(0,30).map(fila).join(''):'<div class="note">Ahora mismo no hay citas apuntadas. La temporada fuerte es el verano, con las fiestas de los pueblos.</div>'+(TECH?'<div class="note">👉 Apúntalas en Deporte navarro con el deporte «🪓 Deporte rural».</div>':'');
  $('ruR').innerHTML=res.length?res.slice(0,15).map(fila).join(''):'<div class="note">Aún no hay resultados.</div>';
  document.querySelectorAll('#t-rural [data-u]').forEach(a=>a.onclick=e=>{e.preventDefault();abre(a.dataset.u);});}

$('ruDep').onclick=()=>{try{DPDEP='rural';DPCOMP='';}catch(e){}showTab('deporte');setTimeout(()=>{const b=document.querySelector('#dpDep button.on');if(b)b.scrollIntoView({inline:'center',block:'nearest'});},500);};
$('ruFed').onclick=()=>abre('https://www.google.com/search?q='+encodeURIComponent('Federación Navarra de Herri Kirolak Nafarroako Herri Kirol Federazioa'));
hook('rural',ruRender);
try{(window.BNA_DATOS||{}).rural='citas: Deporte navarro (apuntadas por BasatiNA) y Agenda cultural';}catch(e){}
try{Object.assign(I18N.eu,{'Deporte rural':'Herri kirolak','Próximas citas':'Hurrengo hitzorduak','Las modalidades':'Modalitateak','En San Fermín':'Sanferminetan','Ver en Deporte navarro':'Ikusi Nafarroako kirolean'});
  Object.assign(I18N.en,{'Deporte rural':'Rural sports','Próximas citas':'Upcoming events','Las modalidades':'The disciplines','En San Fermín':'At San Fermín','Ver en Deporte navarro':'See in Navarre sport'});
  Object.assign(I18N.fr,{'Deporte rural':'Sports ruraux','Próximas citas':'Prochains rendez-vous','Las modalidades':'Les disciplines','En San Fermín':'À San Fermín','Ver en Deporte navarro':'Voir dans Sport navarrais'});}catch(e){}
window.RU_M=RU_M;
})();
