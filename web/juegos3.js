/* =====================================================================
   🎮 JUEGOS DE PALABRAS Y NÚMEROS (21 nov. 2026) — se carga después de deporte-rural.js
   Tres juegos nuevos en el grupo «Juegos» (data-k «NA Juega»). Todo sin internet; récords en el móvil.
   - 🔤 Sopa de letras (`jsopa`): palabras de Navarra por temas (SO_TEMAS). Se arrastra el dedo de la
     primera letra a la última (o se toca la primera y luego la última). Niveles: fácil (10×10, → ↓),
     normal (12×12, + diagonal), difícil (14×14, en las 8 direcciones, también al revés).
     Para añadir palabras: escríbelas en SO_TEMAS (en mayúsculas, sin tildes ni espacios; la Ñ vale).
   - 🔢 Sudoku (`jsudoku`): se genera cada partida con solución única. Fácil / Normal / Difícil.
     Notas a lápiz (✏️), pista (💡) y los números mal puestos salen en rojo. La partida se guarda.
   - ✏️ Crucigrama (`jcruci`): se monta solo con 8–11 palabras de CR_P (respuesta + pista de Navarra).
     Teclado propio con Ñ, «Comprobar» y «Letra» de ayuda.
     Para añadir una pista: una línea más en CR_P → ['RESPUESTA','Pista'] (mayúsculas, sin tildes ni espacios).
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ls={get:(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
const baraja=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const zumb=p=>{try{navigator.vibrate&&navigator.vibrate(p);}catch(e){}};
/* ---------- 🏅 niveles y puntos (21 nov. 2026): al terminar una partida se pasa al nivel siguiente, más difícil ---------- */
const NIV=Object.assign({sopa:1,sudoku:1,cruci:1},ls.get('bnJgNivel',{}));const nivSave=()=>ls.set('bnJgNivel',NIV);
function ganaNivel(j,pts){pts=Math.max(20,Math.round(pts));const L=NIV[j];NIV[j]=L+1;nivSave();
  const P=ls.get('bnJgPuntos',{});P[j]=(P[j]||0)+pts;P.total=(P.total||0)+pts;ls.set('bnJgPuntos',P);
  const B=ls.get('bnJgMejor',{}),nr=pts>(B[j]||0);if(nr){B[j]=pts;ls.set('bnJgMejor',B);}
  try{window.dispatchEvent(new CustomEvent('bnJuegoGanado',{detail:{juego:j,nivel:L,puntos:pts,total:P[j]}}));}catch(e){}
  return {L,pts,tot:P[j],nr};}
const winHtml=(txt,r,id)=>`<div class="j3Win">🎉 ${txt}<div style="font-size:15px;margin-top:4px">Nivel ${r.L} superado · +${r.pts} puntos${r.nr?' · 🏆 tu mejor partida':''}</div>
  <div style="font-size:13px;opacity:.85">Llevas ${r.tot} puntos en este juego</div><button class="j3Btn" id="${id}" style="margin-top:8px;font-size:16px;padding:8px 16px">➡️ Ir al nivel ${r.L+1}</button></div>`;
const lvBar=j=>`<span style="font-weight:800;font-size:15px">🏅 Nivel ${NIV[j]}</span> <span style="opacity:.8;font-size:12.5px">· ⭐ ${(ls.get('bnJgPuntos',{})[j]||0)} puntos</span>`;
const svs=(id,h)=>(window.svSec?svSec:(i,x)=>{const s=document.createElement('section');s.id='t-'+i;s.innerHTML=x;(document.querySelector('.wrap')||document.body).appendChild(s);return s;})(id,h);
const mmss=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');

const st=document.createElement('style');st.textContent=`
.j3Box{border-radius:16px;padding:10px;margin:10px 0;user-select:none;-webkit-user-select:none}
.j3Bar{display:flex;gap:6px;align-items:center;justify-content:space-between;flex-wrap:wrap;font-size:14px;margin-bottom:8px}
.j3Bar button,.j3Btn{border:0;border-radius:10px;background:rgba(255,255,255,.18);color:inherit;font:inherit;font-size:14px;padding:7px 10px;cursor:pointer}
.j3Lv{display:flex;gap:4px}.j3Lv button.on{background:#ffd54f;color:#3e2723;font-weight:800}
.j3Win{text-align:center;padding:12px 6px;font-size:18px;font-weight:800}
/* sopa */
.sopBox{background:linear-gradient(180deg,#4a148c,#2a0a52);color:#f3e5f5}
.sopG{display:grid;gap:2px;touch-action:none;margin:0 auto;max-width:440px}
.sopG div{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:6px;background:rgba(255,255,255,.08);font:800 clamp(13px,4.2vw,19px) system-ui;color:#fff}
.sopG div.sel{background:#ffd54f;color:#3e2723}
.sopW{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px}.sopW span{padding:3px 8px;border-radius:9px;background:rgba(255,255,255,.12);font-size:13px;font-weight:700;letter-spacing:.03em}
.sopW span.ok{text-decoration:line-through;opacity:.55}
/* sudoku */
.sudBox{background:linear-gradient(180deg,#0d47a1,#082a5e);color:#e3f2fd}
.sudG{display:grid;grid-template-columns:repeat(9,1fr);max-width:440px;margin:0 auto;background:#0b1d3a;border:3px solid #0b1d3a;border-radius:8px;overflow:hidden;gap:1px}
.sudG div{aspect-ratio:1;background:#fff;color:#1565c0;display:flex;align-items:center;justify-content:center;font:700 clamp(16px,5vw,24px) system-ui;position:relative;cursor:pointer}
.sudG div.g{color:#111;font-weight:900}.sudG div.hl{background:#e3f2fd}.sudG div.same{background:#bbdefb}.sudG div.cur{background:#ffe082}
.sudG div.bad{color:#d32f2f}.sudG div.br{margin-right:2px}.sudG div.bb{margin-bottom:2px}
.sudG div .n{position:absolute;inset:1px;display:grid;grid-template-columns:repeat(3,1fr);font:600 clamp(7px,2vw,10px) system-ui;color:#607d8b;text-align:center;align-items:center}
.sudP{display:grid;grid-template-columns:repeat(9,1fr);gap:4px;max-width:440px;margin:10px auto 0}
.sudP button{border:0;border-radius:10px;background:#fff;color:#0d47a1;font:800 20px system-ui;padding:9px 0;cursor:pointer}
.sudP2{display:flex;gap:6px;justify-content:center;margin-top:8px}.sudP2 button.on{background:#ffd54f;color:#3e2723}
/* crucigrama */
.cruBox{background:linear-gradient(180deg,#bf360c,#7f1d06);color:#fff3e0}
.cruG{display:grid;gap:2px;margin:0 auto;max-width:460px}
.cruG div{aspect-ratio:1;position:relative;display:flex;align-items:center;justify-content:center;font:800 clamp(12px,3.8vw,19px) system-ui;border-radius:4px}
.cruG div.c{background:#fff;color:#3e2723;cursor:pointer}.cruG div.w{background:#ffe0b2}.cruG div.cur{background:#ffd54f}
.cruG div.bad{color:#d32f2f;background:#ffcdd2}.cruG div.rev{color:#1565c0}
.cruG div i{position:absolute;left:2px;top:0;font:700 clamp(7px,2vw,10px) system-ui;font-style:normal;color:#8d6e63}
.cruClue{min-height:44px;margin:10px 0 6px;padding:8px 10px;border-radius:12px;background:rgba(0,0,0,.25);font-size:15px;line-height:1.3}
.cruK{display:flex;flex-direction:column;gap:5px;max-width:460px;margin:0 auto}.cruK div{display:flex;gap:4px;justify-content:center}
.cruK button{flex:1;max-width:38px;border:0;border-radius:8px;background:#fff;color:#3e2723;font:800 16px system-ui;padding:10px 0;cursor:pointer}
.cruK button.wide{max-width:64px;background:#ffccbc}
.cruL{margin-top:10px;font-size:13.5px;line-height:1.45}.cruL b{display:block;margin-top:6px}.cruL div{cursor:pointer;padding:1px 0}.cruL div.ok{opacity:.5;text-decoration:line-through}`;
document.head.appendChild(st);

/* =========================== 🔤 SOPA DE LETRAS =========================== */
const SO_TEMAS={
 'Pueblos':['OLITE','TAFALLA','ESTELLA','TUDELA','SANGUESA','LESAKA','ELIZONDO','VIANA','LODOSA','AOIZ','LUMBIER','UJUE','ALSASUA','CORELLA','CASCANTE','PERALTA','MILAGRO','LEITZA','BURLADA','BERA','ARTAJONA','CINTRUENIGO'],
 'Ríos y montes':['ARGA','EGA','EBRO','IRATI','ARAGON','BIDASOA','ULTZAMA','ARAKIL','ALHAMA','SALAZAR','ESCA','URBASA','ANDIA','BARDENAS','HIGA','ORHI','ARALAR','LEYRE','MONCAYO','EZKABA','YESA','ITOIZ'],
 'Comida':['PIMIENTO','ESPARRAGO','ALCACHOFA','TXISTORRA','CUAJADA','RONCAL','PATXARAN','MAGRAS','AJOARRIERO','BORRAJA','MENESTRA','MIGAS','COGOLLO','ALUBIAS','TRUCHA','CORDERO','ROSQUILLA','TALO','MORCILLA','CARDO'],
 'Fiestas':['SANFERMIN','GIGANTES','KILIKIS','ENCIERRO','TXUPINAZO','OLENTZERO','RIAU','PAÑUELO','FAJA','JOTA','TXISTU','GAITA','DANTZA','CHARANGA','PEÑA','FUEGOS','ZORTZIKO','TORICO'],
 'Naturaleza':['HAYA','ROBLE','ENCINA','QUEJIGO','BUITRE','QUEBRANTAHUESOS','NUTRIA','JABALI','CORZO','CIERVO','MILANO','GARZA','TRUCHA','SETA','BOJ','ACEBO','PINO','SELVA','NACEDERO','FOZ']
};
const SO_NIV={facil:{n:10,w:8,d:[[0,1],[1,0]]},normal:{n:12,w:10,d:[[0,1],[1,0],[1,1]]},dificil:{n:14,w:12,d:[[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]]}};
const SO_LET='AAAAAABCDEEEEEFGHIIIIJKLLMNNÑOOOOOPQRRRSSSTTTUUUVXYZ';
let SO=null,SOT='Pueblos',SOtm=null;
// el nivel decide el tamaño, cuántas palabras y en qué direcciones (del 1-2 solo → y ↓; del 3-5 también en diagonal; desde el 6, en todas, también al revés)
const SO_CFG=L=>({n:Math.min(14,8+Math.floor((L-1)/2)),w:Math.min(14,5+L),d:L<=2?SO_NIV.facil.d:L<=5?SO_NIV.normal.d:SO_NIV.dificil.d});
svs('jsopa',`<div class="j3Box sopBox" data-noswipe>
 <div class="j3Bar"><div class="j3Lv" id="sopLv"></div><span id="sopTm">0:00</span></div>
 <div class="j3Bar"><select id="sopTe" class="j3Btn" style="background:rgba(255,255,255,.18);color:#fff">${Object.keys(SO_TEMAS).map(t=>`<option style="color:#000">${t}</option>`).join('')}</select><button id="sopNew">🔄 Nueva</button></div>
 <div class="sopG" id="sopG"></div><div class="sopW" id="sopW"></div><div id="sopMsg"></div>
 <div style="font-size:12.5px;opacity:.8;margin-top:8px">Desliza el dedo desde la primera letra hasta la última (o toca la primera y después la última).</div></div>`);

function soNueva(){const cf=SO_CFG(NIV.sopa),n=cf.n,G=Array.from({length:n},()=>Array(n).fill(''));
  const pool=baraja([...new Set(SO_TEMAS[SOT])].filter(w=>w.length<=n)).slice(0,cf.w+6).sort((a,b)=>b.length-a.length),W=[];
  for(const w of pool){if(W.length>=cf.w)break;let ok=false;
    for(let t=0;t<250&&!ok;t++){const [dr,dc]=cf.d[Math.floor(Math.random()*cf.d.length)],r=Math.floor(Math.random()*n),c=Math.floor(Math.random()*n);
      const er=r+dr*(w.length-1),ec=c+dc*(w.length-1);if(er<0||er>=n||ec<0||ec>=n)continue;
      let fit=true;for(let i=0;i<w.length;i++){const x=G[r+dr*i][c+dc*i];if(x&&x!==w[i]){fit=false;break;}}
      if(!fit)continue;for(let i=0;i<w.length;i++)G[r+dr*i][c+dc*i]=w[i];W.push({w,r,c,dr,dc,ok:false});ok=true;}}
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(!G[r][c])G[r][c]=SO_LET[Math.floor(Math.random()*SO_LET.length)];
  SO={n,G,W,t0:Date.now(),fin:false,hue:0,marc:{}};soPinta();clearInterval(SOtm);SOtm=setInterval(()=>{if(SO&&!SO.fin)$('sopTm').textContent='⏱ '+mmss(Math.floor((Date.now()-SO.t0)/1000));},1000);}
function soPinta(){const g=$('sopG');g.style.gridTemplateColumns=`repeat(${SO.n},1fr)`;
  g.innerHTML=SO.G.map((f,r)=>f.map((x,c)=>`<div data-r="${r}" data-c="${c}" style="${SO.marc[r+','+c]?`background:${SO.marc[r+','+c]};color:#fff`:''}">${x}</div>`).join('')).join('');
  $('sopW').innerHTML=SO.W.map(x=>`<span class="${x.ok?'ok':''}">${x.w}</span>`).join('');
  $('sopLv').innerHTML=lvBar('sopa');$('sopMsg').innerHTML='';}
function soLinea(a,b){const dr=Math.sign(b.r-a.r),dc=Math.sign(b.c-a.c),len=Math.max(Math.abs(b.r-a.r),Math.abs(b.c-a.c));
  if(!(a.r===b.r||a.c===b.c||Math.abs(b.r-a.r)===Math.abs(b.c-a.c)))return null;const L=[];for(let i=0;i<=len;i++)L.push({r:a.r+dr*i,c:a.c+dc*i});return L;}
function soMarca(L){$('sopG').querySelectorAll('.sel').forEach(d=>d.classList.remove('sel'));(L||[]).forEach(p=>{const d=$('sopG').children[p.r*SO.n+p.c];if(d)d.classList.add('sel');});}
function soPrueba(L){if(!L||L.length<2)return false;const s=L.map(p=>SO.G[p.r][p.c]).join(''),rv=[...s].reverse().join('');
  const x=SO.W.find(x=>!x.ok&&(x.w===s||x.w===rv));
  if(!x)return false;x.ok=true;SO.hue=(SO.hue+67)%360;const col=`hsl(${SO.hue},70%,45%)`;L.forEach(p=>SO.marc[p.r+','+p.c]=col);zumb(30);soPinta();
  if(SO.W.every(x=>x.ok)){SO.fin=true;const s2=Math.floor((Date.now()-SO.t0)/1000),L=NIV.sopa,r=ganaNivel('sopa',100*L+Math.max(0,240-s2));
    $('sopMsg').innerHTML=winHtml(`¡Todas encontradas en ${mmss(s2)}!`,r,'sopSig');$('sopSig').onclick=soNueva;}
  return true;}
(function(){const g=$('sopG');let a=null,pend=null,mov=false;
  const celda=e=>{const el=document.elementFromPoint(e.clientX,e.clientY);return el&&el.parentNode===g&&el.dataset.r!=null?{r:+el.dataset.r,c:+el.dataset.c}:null;};
  g.addEventListener('pointerdown',e=>{if(!SO||SO.fin)return;e.preventDefault();a=celda(e);mov=false;if(a)soMarca([a]);});
  g.addEventListener('pointermove',e=>{if(!a)return;const b=celda(e);if(b&&(b.r!==a.r||b.c!==a.c)){mov=true;soMarca(soLinea(a,b)||[a]);}});
  const fin=e=>{if(!a)return;const b=celda(e)||a;
    if(!mov&&b.r===a.r&&b.c===a.c){if(pend&&(pend.r!==a.r||pend.c!==a.c)){const L=soLinea(pend,a);if(!soPrueba(L))soMarca([]);pend=null;}else{pend=a;soMarca([a]);}}
    else{const L=soLinea(a,b);if(!soPrueba(L))soMarca([]);pend=null;}a=null;};
  g.addEventListener('pointerup',fin);g.addEventListener('pointercancel',()=>{a=null;soMarca([]);});})();
$('sopNew').onclick=soNueva;$('sopTe').onchange=e=>{SOT=e.target.value;soNueva();};
window.sopInit=()=>{if(!SO)soNueva();};

/* =============================== 🔢 SUDOKU =============================== */
const SU_NIV={facil:40,normal:49,dificil:55};   // casillas que se vacían
let SU=ls.get('bnJgSudo',null),SUsel=-1,SUnot=false,SUtm=null;
function suResolver(g,lim){let n=0;const a=g.slice();
  const pos=(i,v)=>{const r=Math.floor(i/9),c=i%9,br=r-r%3,bc=c-c%3;for(let k=0;k<9;k++){if(a[r*9+k]===v||a[k*9+c]===v||a[(br+Math.floor(k/3))*9+bc+k%3]===v)return false;}return true;};
  (function bt(){if(n>=lim)return;let best=-1,bc=null;
    for(let i=0;i<81;i++)if(!a[i]){const c=[];for(let v=1;v<=9;v++)if(pos(i,v))c.push(v);if(!c.length)return;if(!bc||c.length<bc.length){best=i;bc=c;if(c.length===1)break;}}
    if(best<0){n++;return;}for(const v of bc){a[best]=v;bt();a[best]=0;if(n>=lim)return;}})();return n;}
function suLleno(){const a=Array(81).fill(0);const pos=(i,v)=>{const r=Math.floor(i/9),c=i%9,br=r-r%3,bc=c-c%3;for(let k=0;k<9;k++){if(a[r*9+k]===v||a[k*9+c]===v||a[(br+Math.floor(k/3))*9+bc+k%3]===v)return false;}return true;};
  (function bt(i){if(i===81)return true;for(const v of baraja([1,2,3,4,5,6,7,8,9]))if(pos(i,v)){a[i]=v;if(bt(i+1))return true;a[i]=0;}return false;})(0);return a;}
// el nivel decide cuántas casillas se vacían: 33 en el nivel 1 y 3 más cada nivel, hasta 56
const SU_VAC=L=>Math.min(56,30+3*L);
function suNueva(){const niv=NIV.sudoku,sol=suLleno(),g=sol.slice();let quit=0;
  for(const i of baraja([...Array(81).keys()])){if(quit>=SU_VAC(niv))break;const v=g[i];g[i]=0;if(suResolver(g,2)!==1)g[i]=v;else quit++;}
  SU={niv,sol,giv:g.map(v=>v>0),v:g.slice(),notas:Array(81).fill(0),seg:0,fin:false,pistas:0};SUsel=-1;suGuarda();suPinta();}
const suGuarda=()=>ls.set('bnJgSudo',SU);
function suPinta(){const g=$('sudG'),s=SUsel,vs=s>=0?SU.v[s]:0;
  g.innerHTML=SU.v.map((v,i)=>{const r=Math.floor(i/9),c=i%9;let cl=[];if(SU.giv[i])cl.push('g');
    if(s>=0){const sr=Math.floor(s/9),sc=s%9;if(r===sr||c===sc||(Math.floor(r/3)===Math.floor(sr/3)&&Math.floor(c/3)===Math.floor(sc/3)))cl.push('hl');if(vs&&v===vs)cl.push('same');if(i===s)cl.push('cur');}
    if(v&&!SU.giv[i]&&v!==SU.sol[i])cl.push('bad');if(c===2||c===5)cl.push('br');if(r===2||r===5)cl.push('bb');
    const nt=!v&&SU.notas[i]?`<span class="n">${[1,2,3,4,5,6,7,8,9].map(k=>SU.notas[i]&(1<<k)?k:'&nbsp;').map(x=>`<span>${x}</span>`).join('')}</span>`:'';
    return `<div class="${cl.join(' ')}" data-i="${i}">${v||''}${nt}</div>`;}).join('');
  g.querySelectorAll('[data-i]').forEach(d=>d.onclick=()=>{SUsel=+d.dataset.i;suPinta();});
  $('sudLv').innerHTML=lvBar('sudoku');
  $('sudNot').classList.toggle('on',SUnot);
  const cnt=n=>SU.v.filter((v,i)=>v===n&&v===SU.sol[i]).length;$('sudP').querySelectorAll('button').forEach(b=>{b.style.opacity=cnt(+b.dataset.n)>=9?.3:1;});
  $('sudMsg').innerHTML=SU.fin&&SU.res?winHtml(`¡Sudoku resuelto en ${mmss(SU.seg)}${SU.pistas?` con ${SU.pistas} pista${SU.pistas>1?'s':''}`:''}!`,SU.res,'sudSig'):'';
  if(SU.fin&&SU.res)$('sudSig').onclick=()=>suNueva();}
let SUconf=0;function confirmarNueva(){if(Date.now()-SUconf<3000)return true;SUconf=Date.now();toast&&toast('Toca otra vez para empezar uno nuevo');return false;}
function suPon(n){if(SU.fin||SUsel<0||SU.giv[SUsel])return;const i=SUsel;
  if(SUnot&&n){if(SU.v[i])return;SU.notas[i]^=(1<<n);}else{SU.v[i]=SU.v[i]===n?0:n;SU.notas[i]=0;
    if(n&&n===SU.sol[i]){const r=Math.floor(i/9),c=i%9,br=r-r%3,bc=c-c%3;for(let k=0;k<9;k++){[r*9+k,k*9+c,(br+Math.floor(k/3))*9+bc+k%3].forEach(j=>SU.notas[j]&=~(1<<n));}}
    else if(n)zumb([20,40,20]);}
  if(!SU.fin&&SU.v.every((v,j)=>v===SU.sol[j])){SU.fin=true;zumb(80);SU.res=ganaNivel('sudoku',150*SU.niv+Math.max(0,900-SU.seg)-60*SU.pistas);}
  suGuarda();suPinta();}
svs('jsudoku',`<div class="j3Box sudBox" data-noswipe>
 <div class="j3Bar"><div class="j3Lv" id="sudLv"></div><span id="sudTm">0:00</span></div>
 <div class="sudG" id="sudG"></div>
 <div class="sudP" id="sudP">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-n="${n}">${n}</button>`).join('')}</div>
 <div class="sudP2"><button class="j3Btn" id="sudNot">✏️ Notas</button><button class="j3Btn" id="sudDel">⌫ Borrar</button><button class="j3Btn" id="sudPis">💡 Pista</button><button class="j3Btn" id="sudNew">🔄 Nuevo</button></div>
 <div id="sudMsg"></div>
 <div style="font-size:12.5px;opacity:.8;margin-top:8px">Rellena cada fila, columna y cuadro de 3×3 con los números del 1 al 9, sin repetir. Los que no encajan salen en rojo.</div></div>`);
$('sudP').querySelectorAll('button').forEach(b=>b.onclick=()=>suPon(+b.dataset.n));
$('sudDel').onclick=()=>{if(SUsel>=0&&!SU.giv[SUsel]){SU.v[SUsel]=0;SU.notas[SUsel]=0;suGuarda();suPinta();}};
$('sudNot').onclick=()=>{SUnot=!SUnot;suPinta();};
$('sudPis').onclick=()=>{if(SU.fin)return;let i=SUsel>=0&&!SU.giv[SUsel]&&SU.v[SUsel]!==SU.sol[SUsel]?SUsel:SU.v.findIndex((v,j)=>v!==SU.sol[j]);if(i<0)return;SUsel=i;SU.pistas++;SUnot=false;suPon(SU.sol[i]);};
$('sudNew').onclick=()=>{if(SU.fin||confirmarNueva())suNueva();};
window.sudInit=()=>{if(!SU||!SU.sol||typeof SU.niv!=='number')suNueva();else suPinta();clearInterval(SUtm);SUtm=setInterval(()=>{if(SU&&!SU.fin&&ACT3==='jsudoku'){SU.seg++;if(SU.seg%10===0)suGuarda();}$('sudTm').textContent='⏱ '+mmss(SU?SU.seg:0);},1000);};

/* ============================= ✏️ CRUCIGRAMA ============================= */
const CR_P=[
 ['ARGA','Río que atraviesa Pamplona'],['EGA','Río que pasa por Estella‑Lizarra'],['EBRO','El gran río que pasa por Tudela'],['IRATI','Selva y río del Pirineo navarro'],
 ['ARAGON','Río que llena el embalse de Yesa'],['BIDASOA','Río que nace en Baztan y llega al mar en Hondarribia'],['OLITE','Pueblo con un palacio real de cuento'],
 ['TUDELA','Capital de la Ribera'],['ESTELLA','Ciudad del Camino de Santiago junto al Ega'],['BARDENAS','El «desierto» navarro'],['URBASA','Sierra con un gran nacedero del Urederra'],
 ['GAYARRE','Famoso tenor nacido en el valle de Roncal'],['SANFERMIN','Fiestas de julio en Pamplona'],['ENCIERRO','Carrera por las calles delante de los toros'],
 ['TXUPINAZO','Cohete que abre las fiestas de Pamplona'],['KILIKIS','Cabezudos que persiguen a los niños'],['PIMIENTO','Del piquillo, de Lodosa'],
 ['ESPARRAGO','Hortaliza blanca con denominación de Navarra'],['CUAJADA','Postre de leche de oveja'],['PATXARAN','Licor de endrinas'],['TXISTORRA','Embutido fino, ideal en bocadillo'],
 ['RONCAL','Queso y valle del Pirineo'],['OSASUNA','Club de fútbol de Pamplona'],['SADAR','Estadio de Osasuna'],['JAVIER','Castillo donde nació san Francisco'],
 ['LEYRE','Monasterio junto al embalse de Yesa'],['PELOTA','Deporte de frontón'],['AIZKOLARI','Corta troncos con el hacha'],['SOKATIRA','Dos equipos tirando de una cuerda'],
 ['OLENTZERO','Carbonero que trae regalos en Navidad'],['EUSKERA','Lengua propia de Navarra junto al castellano'],['IRUÑA','Pamplona en euskera'],['CADENAS','Están en el escudo de Navarra'],
 ['BAZTAN','Valle cuya capital es Elizondo'],['UJUE','Pueblo amurallado famoso por sus migas'],['VIANA','Último pueblo navarro del Camino de Santiago'],['ALCACHOFA','Verdura estrella de Tudela'],
 ['BORRAJA','Verdura típica de la Ribera'],['AJOARRIERO','Bacalao al estilo navarro'],['MENESTRA','Plato de verduras de Tudela'],['GIGANTES','Bailan por las calles en las fiestas'],
['ULTZAMA','Valle con un famoso robledal'],['TAFALLA','Ciudad de la Zona Media'],['SANGUESA','Ciudad del Camino junto al río Aragón'],
 ['YESA','Embalse en el río Aragón'],['ITOIZ','Embalse en el río Irati'],['NUTRIA','Animal que nada en el Arga'],['BUITRE','Ave carroñera de las foces'],['HAYA','Árbol que domina la selva de Irati'],
 ['FOZ','Cañón estrecho, como la de Lumbier'],['TXISTU','Flauta de tres agujeros'],['JOTA','Baile y canto de la Ribera'],['MIGAS','Plato de pastor hecho con pan']];
let CR=null,CRsel=null,CRdir='a';
function crMonta(){const MX=Math.min(16,6+NIV.cruci);for(let intento=0;intento<60;intento++){const L=baraja(CR_P).slice(0,24).sort((a,b)=>b[0].length-a[0].length),M={},P=[];
  const get=(r,c)=>M[r+','+c];
  const cabe=(w,r,c,d)=>{const dr=d==='d'?1:0,dc=d==='a'?1:0;let cruces=0;
    if(get(r-dr,c-dc)||get(r+dr*w.length,c+dc*w.length))return -1;
    for(let i=0;i<w.length;i++){const rr=r+dr*i,cc=c+dc*i,x=get(rr,cc);
      if(x){if(x.l!==w[i]||x[d])return -1;cruces++;}
      else{if(get(rr+dc,cc+dr)||get(rr-dc,cc-dr))return -1;}}return cruces;};
  const pon=(w,r,c,d,q)=>{const dr=d==='d'?1:0,dc=d==='a'?1:0;for(let i=0;i<w.length;i++){const k=(r+dr*i)+','+(c+dc*i);M[k]=M[k]||{l:w[i]};M[k][d]=1;}P.push({w,q,r,c,d});};
  if(L[0][0].length>12)L.push(L.shift());pon(L[0][0],0,0,'a',L[0][1]);let BB={r0:0,c0:0,r1:0,c1:L[0][0].length-1};
  for(const [w,q] of L.slice(1)){if(P.length>=MX)break;let best=null;
    for(const k in M){const [r,c]=k.split(',').map(Number),x=M[k];for(let i=0;i<w.length;i++)if(w[i]===x.l){
      for(const d of ['a','d']){const r0=d==='d'?r-i:r,c0=d==='a'?c-i:c,s=cabe(w,r0,c0,d);if(s<=0)continue;
        const r1=d==='d'?r0+w.length-1:r0,c1=d==='a'?c0+w.length-1:c0,h=Math.max(BB.r1,r1)-Math.min(BB.r0,r0)+1,wd=Math.max(BB.c1,c1)-Math.min(BB.c0,c0)+1;
        if(h>12||wd>12)continue;const sc=s*40-h*wd-Math.abs(h-wd)*3+Math.random()*8;
        if(!best||sc>best.sc)best={r:r0,c:c0,d,sc,r1,c1};}}}
    if(best){pon(w,best.r,best.c,best.d,q);BB={r0:Math.min(BB.r0,best.r),c0:Math.min(BB.c0,best.c),r1:Math.max(BB.r1,best.r1),c1:Math.max(BB.c1,best.c1)};}}
  const ks=Object.keys(M).map(k=>k.split(',').map(Number)),r0=Math.min(...ks.map(k=>k[0])),c0=Math.min(...ks.map(k=>k[1])),R=Math.max(...ks.map(k=>k[0]))-r0+1,C=Math.max(...ks.map(k=>k[1]))-c0+1;
  if(P.length<Math.min(8,MX)||R>12||C>12)continue;
  P.forEach(p=>{p.r-=r0;p.c-=c0;});P.sort((a,b)=>a.r-b.r||a.c-b.c);let num=0;const nums={};
  P.forEach(p=>{const k=p.r+','+p.c;if(!nums[k])nums[k]=++num;p.n=nums[k];});
  const sol={};Object.keys(M).forEach(k=>{const [r,c]=k.split(',').map(Number);sol[(r-r0)+','+(c-c0)]=M[k].l;});
  return {R,C,P,sol,nums,v:{},rev:{},bad:{},fin:false,ayu:0,niv:NIV.cruci};}return null;}
function crNueva(){CR=crMonta();CRsel=CR.P[0];CRdir=CRsel.d;CR.cur=crCeldas(CRsel)[0];crPinta();}
const crCeldas=p=>Array.from({length:p.w.length},(_,i)=>p.d==='a'?(p.r)+','+(p.c+i):(p.r+i)+','+p.c);
function crPinta(){const g=$('cruG'),sel=CRsel?crCeldas(CRsel):[],cur=CR.cur;g.style.gridTemplateColumns=`repeat(${CR.C},1fr)`;let h='';
  for(let r=0;r<CR.R;r++)for(let c=0;c<CR.C;c++){const k=r+','+c;if(!CR.sol[k]){h+='<div></div>';continue;}
    const cl=['c'];if(sel.includes(k))cl.push('w');if(k===cur)cl.push('cur');if(CR.bad[k])cl.push('bad');if(CR.rev[k])cl.push('rev');
    h+=`<div class="${cl.join(' ')}" data-k="${k}">${CR.nums[k]?`<i>${CR.nums[k]}</i>`:''}${CR.v[k]||''}</div>`;}
  g.innerHTML=h;g.querySelectorAll('[data-k]').forEach(d=>d.onclick=()=>crToca(d.dataset.k));
  $('cruClue').innerHTML=CRsel?`<b>${CRsel.n} ${CRsel.d==='a'?'→':'↓'}</b> ${E(CRsel.q)} <span style="opacity:.7">(${CRsel.w.length})</span>`:'Toca una casilla';
  const hecho=p=>crCeldas(p).every(k=>CR.v[k]===CR.sol[k]);
  $('cruL').innerHTML=[['a','→ Horizontales'],['d','↓ Verticales']].map(([d,t])=>`<b>${t}</b>`+CR.P.filter(p=>p.d===d).map(p=>`<div data-p="${CR.P.indexOf(p)}" class="${hecho(p)?'ok':''}"><b style="display:inline">${p.n}.</b> ${E(p.q)} (${p.w.length})</div>`).join('')).join('');
  $('cruL').querySelectorAll('[data-p]').forEach(d=>d.onclick=()=>{CRsel=CR.P[+d.dataset.p];CR.cur=crCeldas(CRsel).find(k=>!CR.v[k])||crCeldas(CRsel)[0];crPinta();$('cruG').scrollIntoView({behavior:'smooth',block:'nearest'});});
  $('cruMsg').innerHTML=CR.fin&&CR.res?winHtml('¡Crucigrama completo!',CR.res,'cruSig'):'';if(CR.fin&&CR.res)$('cruSig').onclick=crNueva;
  const lv=$('cruLv');if(lv)lv.innerHTML=lvBar('cruci');}
function crGana(){if(CR.fin)return;CR.fin=true;zumb(80);const n=ls.get('bnJgCruci',0)+1;ls.set('bnJgCruci',n);
  CR.res=ganaNivel('cruci',120*CR.niv+10*CR.P.length-25*CR.ayu);}
function crToca(k){const en=CR.P.filter(p=>crCeldas(p).includes(k));if(!en.length)return;
  if(CR.cur===k&&en.length>1){CRsel=en.find(p=>p!==CRsel)||en[0];}else CRsel=en.find(p=>p.d===CRdir)||en[0];CRdir=CRsel.d;CR.cur=k;crPinta();}
function crTecla(x){if(!CRsel||CR.fin)return;const L=crCeldas(CRsel);let i=Math.max(0,L.indexOf(CR.cur));
  if(x==='⌫'){if(!CR.v[L[i]]&&i>0)i--;delete CR.v[L[i]];delete CR.bad[L[i]];CR.cur=L[i];}
  else{CR.v[L[i]]=x;delete CR.bad[L[i]];CR.cur=L[Math.min(i+1,L.length-1)];}
  if(Object.keys(CR.sol).every(k=>CR.v[k]===CR.sol[k]))crGana();crPinta();}
svs('jcruci',`<div class="j3Box cruBox" data-noswipe>
 <div class="j3Bar"><div id="cruLv"></div><span><button id="cruChk">🔍 Comprobar</button> <button id="cruRev">💡 Letra</button> <button id="cruNew">🔄</button></span></div>
 <div class="cruG" id="cruG"></div><div class="cruClue" id="cruClue"></div>
 <div class="cruK" id="cruK">${['QWERTYUIOP','ASDFGHJKLÑ','ZXCVBNM⌫'].map(f=>`<div>${[...f].map(x=>`<button class="${x==='⌫'?'wide':''}" data-x="${x}">${x}</button>`).join('')}</div>`).join('')}</div>
 <div id="cruMsg"></div><div class="cruL" id="cruL"></div></div>`);
$('cruK').querySelectorAll('button').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();crTecla(b.dataset.x);}));
$('cruChk').onclick=()=>{let mal=0;Object.keys(CR.sol).forEach(k=>{if(CR.v[k]&&CR.v[k]!==CR.sol[k]){CR.bad[k]=1;mal++;}});crPinta();toast&&toast(mal?`❌ ${mal} letra${mal>1?'s':''} mal`:'✅ Todo lo que has puesto está bien');};
$('cruRev').onclick=()=>{if(!CRsel||CR.fin)return;const k=crCeldas(CRsel).find(k=>CR.v[k]!==CR.sol[k]);if(!k)return;CR.v[k]=CR.sol[k];CR.rev[k]=1;CR.ayu++;delete CR.bad[k];CR.cur=k;
  if(Object.keys(CR.sol).every(k=>CR.v[k]===CR.sol[k]))crGana();crPinta();};
$('cruNew').onclick=crNueva;
document.addEventListener('keydown',e=>{if(ACT3!=='jcruci')return;const k=e.key.toUpperCase();if(/^[A-ZÑ]$/.test(k)){e.preventDefault();crTecla(k);}else if(e.key==='Backspace'){e.preventDefault();crTecla('⌫');}});
window.cruInit=()=>{if(!CR)crNueva();};

/* ---------- menú «Juegos» (data-k «NA Juega») ---------- */
const J3=[['jsopa','🔤 Sopa de letras','Sopa de letras'],['jsudoku','🔢 Sudoku','Sudoku'],['jcruci','✏️ Crucigrama','Crucigrama']];
(function(){const sub=$('dsJuega');if(sub){J3.forEach(([t,l])=>{if(sub.querySelector(`[data-t="${t}"]`))return;const b=document.createElement('button');b.dataset.t=t;b.textContent=l;b.onclick=()=>{showTab(t);menu(false);};sub.appendChild(b);});
    ['jcadenas','jdonde','jlugar','jsopa','jcruci','jsudoku','jparejas','jsoli','jnutria'].forEach(t=>{const b=sub.querySelector(`[data-t="${t}"]`);if(b)sub.appendChild(b);});
    [...sub.querySelectorAll('[data-t^="p"]')].forEach(b=>sub.appendChild(b));}   // los de los peques, al final
  try{J3.forEach(([t,l,n])=>{TITLES[t]=l;PVS_ESC[t]='aurora';ICK[t]='game-controller';BNK[t]='i-juego';BNF[t]='b';BNL[t]=n;});Object.assign(ICC,{jsopa:'#7b1fa2',jsudoku:'#1565c0',jcruci:'#e64a19'});
    if(typeof applyIcons==='function')applyIcons((CFG.iconos||'pro')==='pro');}catch(e){}
  try{Object.assign(I18N.eu,{'Sopa de letras':'Letra-zopa','Sudoku':'Sudokua','Crucigrama':'Gurutzegrama','Crucigrama de Navarra':'Nafarroako gurutzegrama','Notas':'Oharrak','Borrar':'Ezabatu','Pista':'Pista','Nuevo':'Berria','Nueva':'Berria','Comprobar':'Egiaztatu','Letra':'Letra','Fácil':'Erraza','Normal':'Normala','Difícil':'Zaila'});
    Object.assign(I18N.en,{'Sopa de letras':'Word search','Sudoku':'Sudoku','Crucigrama':'Crossword','Crucigrama de Navarra':'Navarre crossword','Notas':'Notes','Borrar':'Erase','Pista':'Hint','Nuevo':'New','Nueva':'New','Comprobar':'Check','Letra':'Letter','Fácil':'Easy','Normal':'Normal','Difícil':'Hard'});
    Object.assign(I18N.fr,{'Sopa de letras':'Mots mêlés','Sudoku':'Sudoku','Crucigrama':'Mots croisés','Crucigrama de Navarra':'Mots croisés de Navarre','Notas':'Notes','Borrar':'Effacer','Pista':'Indice','Nuevo':'Nouveau','Nueva':'Nouvelle','Comprobar':'Vérifier','Letra':'Lettre','Fácil':'Facile','Normal':'Normal','Difícil':'Difficile'});}catch(e){}})();
let ACT3='';
const _st3=showTab;showTab=function(t){_st3(t);ACT3=t;if(t==='jsopa')setTimeout(sopInit,40);if(t==='jsudoku')setTimeout(sudInit,40);if(t==='jcruci')setTimeout(cruInit,40);};
window.CR_P=CR_P;window.SO_TEMAS=SO_TEMAS;
})();
