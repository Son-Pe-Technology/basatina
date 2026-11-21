/* =====================================================================
   🏆 CLASIFICACIÓN DE LOS JUEGOS (21 nov. 2026) · se carga después de juegos3.js y cuenta.js
   - Pantalla «🏆 Clasificación» en el menú Juegos: los mejores puntos (total, sopa, sudoku, crucigrama).
   - Para salir hace falta cuenta de BasatiNA con el correo confirmado (el apodo es el de la cuenta)
     y activar «Salir en la clasificación» (consentimiento: docs/privacidad.html 3.7).
   - Los puntos y niveles se ganan en el móvil (juegos3.js: bnJgPuntos y bnJgNivel). Al ganar una partida
     (evento «bnJuegoGanado») se suben a Firestore: clasif/{uid}.
   - Las reglas (firestore.rules) solo dejan subir de nivel de 1 en 1, un máximo de puntos por vez y una
     escritura cada 15 s; por eso se sube «a pasos» (clSube) hasta alcanzar lo que hay en el móvil.
   ===================================================================== */
(function(){
if(!window.CMX)return;
const $=id=>document.getElementById(id),X=window.CMX;
const lg=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},ls=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
const J=[['total','🏆 Total'],['sopa','🔤 Sopa'],['sudoku','🔢 Sudoku'],['cruci','✏️ Crucigrama']];
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CU=()=>window.CU||null;
const si=()=>!!lg('bnClasifSi',false);
let VER='total',TM=null,ULT=0;

/* ---------- lo que hay en el móvil ---------- */
function local(){const P=lg('bnJgPuntos',{}),N=Object.assign({sopa:1,sudoku:1,cruci:1},lg('bnJgNivel',{}));
  // el nivel que se sube es el último superado (empieza en 0)
  return {sopa:P.sopa||0,sudoku:P.sudoku||0,cruci:P.cruci||0,nsopa:N.sopa-1,nsudoku:N.sudoku-1,ncruci:N.cruci-1};}

/* ---------- subir (a pasos, como mandan las reglas) ---------- */
async function clSube(){clearTimeout(TM);const cu=CU();if(!si()||!cu||!cu.ok()||!cu.perfil())return;
  const espera=ULT+16e3-Date.now();if(espera>0){TM=setTimeout(clSube,espera);return;}
  const p=cu.perfil(),L=local(),u=await X.cmTok();
  let o=lg('bnClasifSrv',null);
  if(!o||o.uid!==u.uid){try{o=X.decD(await X.fs('/clasif/'+u.uid));o.uid=u.uid;}catch(e){if(e.status===404)o=null;else return;}}
  const n={apodo:p.apodo,apodoK:p.apodoK};
  for(const j of ['sopa','sudoku','cruci']){
    if(!o){n['n'+j]=L['n'+j];n[j]=L[j];continue;}
    n['n'+j]=Math.min(L['n'+j],(o['n'+j]||0)+1);if(n['n'+j]<(o['n'+j]||0))n['n'+j]=o['n'+j];
    n[j]=Math.max(o[j]||0,Math.min(L[j],(o[j]||0)+300*n['n'+j]+1000));}
  if(!o){let t=n.sopa+n.sudoku+n.cruci;if(t>30000){const f=30000/t;for(const j of ['sopa','sudoku','cruci'])n[j]=Math.floor(n[j]*f);}}
  n.total=n.sopa+n.sudoku+n.cruci;
  if(o&&['sopa','sudoku','cruci','nsopa','nsudoku','ncruci'].every(k=>n[k]===(o[k]||0))&&o.apodo===p.apodo)return;
  try{ULT=Date.now();await X.fsCommit([{update:{name:X.nom('clasif',u.uid),fields:X.encF(n)},updateTransforms:[{fieldPath:'t',setToServerValue:'REQUEST_TIME'}]}],u.it);
    ls('bnClasifSrv',Object.assign({uid:u.uid},n));}
  catch(e){ls('bnClasifSrv',null);console.log('clasif',e.message);return;}
  // ¿falta subir más? otra vez dentro de 16 s
  if(['sopa','sudoku','cruci'].some(j=>n[j]<L[j]||n['n'+j]<L['n'+j]))TM=setTimeout(clSube,16e3);
  if(document.getElementById('t-jclasif')?.classList.contains('on'))clPinta();}
async function clBorra(){const u=await X.cmTok();try{await X.fsDel('clasif',u.uid,u.it);}catch(e){}ls('bnClasifSrv',null);}
window.addEventListener('bnJuegoGanado',()=>{if(si())setTimeout(clSube,800);});
setTimeout(()=>{if(si())clSube();},6000);

/* ---------- pantalla ---------- */
const st=document.createElement('style');st.textContent=`.clT{display:flex;gap:4px;overflow-x:auto;margin:6px 0}.clT button{flex:0 0 auto}
 .clR{display:flex;align-items:center;gap:10px;padding:7px 4px;border-bottom:1px solid var(--line,rgba(127,127,127,.2))}.clR .p{width:30px;text-align:center;font-weight:800;font-size:16px}
 .clR .a{flex:1;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.clR .v{font-weight:800;font-variant-numeric:tabular-nums}.clR.yo{background:rgba(0,196,238,.16);border-radius:8px}
 .clSw{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:8px}`;document.head.appendChild(st);
svSec('jclasif',`<div class="card"><b>🏆 Clasificación de los juegos</b><div class="note">Los mejores puntos de la sopa de letras, el sudoku y el crucigrama. Cada partida ganada suma puntos y te sube de nivel: cuanto más alto el nivel, más puntos.</div>
  <div id="clYo" style="margin-top:8px"></div></div>
 <div class="card"><div class="clT seg" id="clT">${J.map(([k,l])=>`<button class="btn${k===VER?' on':''}" data-k="${k}">${l}</button>`).join('')}</div><div id="clL"><div class="note">Cargando…</div></div></div>`);
try{TITLES.jclasif='🏆 Clasificación';PVS_ESC.jclasif='fiesta';}catch(e){}
$('clT').querySelectorAll('button').forEach(b=>b.onclick=()=>{VER=b.dataset.k;$('clT').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));clLista();});

function clYo(){const cu=CU(),L=local(),tot=L.sopa+L.sudoku+L.cruci,el=$('clYo');
  const mios=`<div class="kpi"><div><span class="note">Tus puntos</span><b>${tot}</b></div><div><span class="note">Niveles superados</span><b>${L.nsopa+L.nsudoku+L.ncruci}</b><span class="note">🔤 ${L.nsopa} · 🔢 ${L.nsudoku} · ✏️ ${L.ncruci}</span></div></div>`;
  if(!cu||!cu.sesion()){el.innerHTML=mios+`<div class="note" style="margin-top:8px">Para salir en la clasificación necesitas una cuenta de BasatiNA (gratis, con un apodo). Sin cuenta, tus puntos se quedan solo en este móvil.</div><div class="row" style="margin-top:6px"><button class="btn pri" id="clCu">👤 Crear cuenta o entrar</button></div>`;
    $('clCu').onclick=()=>cu?cu.ir('alta'):showTab('cuenta');return;}
  if(!cu.ok()){el.innerHTML=mios+`<div class="note" style="margin-top:8px">📧 Confirma tu correo (el enlace que te mandamos) para poder salir en la clasificación.</div>`;return;}
  const p=cu.perfil();
  el.innerHTML=mios+`<div class="clSw"><div><b>Salir en la clasificación</b><div class="note">Con tu apodo${p?` «${E(p.apodo)}»`:''}. Los demás solo ven el apodo y los puntos.</div></div>
    <input type="checkbox" id="clSi" ${si()?'checked':''} style="width:26px;height:26px;flex:0 0 auto"></div>`;
  $('clSi').onchange=async e=>{if(e.target.checked){ls('bnClasifSi',true);await clSube();}else{ls('bnClasifSi',false);await clBorra();}clLista();};}
async function clLista(){const el=$('clL');el.innerHTML='<div class="note">Cargando…</div>';let L=[];
  try{const j=await X.fs(':runQuery',{method:'POST',body:JSON.stringify({structuredQuery:{from:[{collectionId:'clasif'}],orderBy:[{field:{fieldPath:VER},direction:'DESCENDING'}],limit:50}})});
    L=(j||[]).filter(x=>x.document).map(x=>X.decD(x.document)).filter(x=>x[VER]>0);}
  catch(e){el.innerHTML='<div class="note">No se puede cargar la clasificación ahora. Prueba en un rato.</div>';return;}
  const cu=CU(),yo=cu&&cu.perfil()&&cu.perfil().uid;
  el.innerHTML=L.length?L.map((x,i)=>`<div class="clR${x.id===yo?' yo':''}"><div class="p">${['🥇','🥈','🥉'][i]||i+1}</div><div class="a">${E(x.apodo)}${VER!=='total'?`<div class="note" style="font-weight:400">nivel ${x['n'+VER]||0}</div>`:''}</div><div class="v">${x[VER]}</div></div>`).join('')
    :'<div class="note">Todavía no hay nadie. ¡Gana una partida y sé el primero!</div>';}
function clPinta(){clYo();clLista();}
svHook('jclasif',clPinta);

// botón en el menú Juegos y en el mensaje de partida ganada
(function(){const sub=$('dsJuega');if(sub&&!sub.querySelector('[data-t="jclasif"]')){const b=document.createElement('button');b.dataset.t='jclasif';b.textContent='🏆 Clasificación';
  b.onclick=()=>{showTab('jclasif');menu(false);};sub.appendChild(b);}})();
window.addEventListener('bnJuegoGanado',()=>setTimeout(()=>{document.querySelectorAll('.j3Win').forEach(w=>{if(w.querySelector('.clVer'))return;
  w.insertAdjacentHTML('beforeend',`<div><button class="j3Btn clVer" style="margin-top:6px">🏆 Ver la clasificación</button></div>`);w.querySelector('.clVer').onclick=()=>showTab('jclasif');});},50));
})();
