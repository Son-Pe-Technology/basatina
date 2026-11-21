/* =====================================================================
   🃏 CHINCHÓN contra la máquina (21 nov. 2026) · con la Baraja de Navarra (baraja.js)
   Reglas que se usan (las más habituales en Navarra con baraja de 40):
   - 7 cartas cada uno. En tu turno robas (del mazo o la de arriba de la mesa) y tiras una.
   - Combinaciones: trío o póker del mismo número, o escalera de 3 o más del mismo palo
     (1-2-3-4-5-6-7-sota-caballo-rey: el 7 va seguido de la sota).
   - Cortar: al tirar, si lo que te queda sin combinar suma 5 puntos o menos.
     Las cartas valen su número (sota 10, caballo 11, rey 12).
   - Al cortar, el otro coloca sus sueltas que encajen en tus combinaciones («ligar»).
   - Cada uno suma lo que le queda suelto. Cortar con todo combinado: −10.
     Chinchón (escalera de 7 del mismo palo): ganas la partida al momento.
   - Quien pasa de 100 puntos pierde.
   La máquina mejora con tu nivel (bnChNivel): en los primeros comete algún descuido.
   ===================================================================== */
(function(){
if(typeof bnCarta!=='function')return;
const $=id=>document.getElementById(id);
const ls={get:(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
const zumb=p=>{try{navigator.vibrate&&navigator.vibrate(p);}catch(e){}};
const PALOS=['oros','copas','espadas','bastos'],NUMS=[1,2,3,4,5,6,7,10,11,12];
const NOMP={oros:'oros',copas:'copas',espadas:'espadas',bastos:'bastos'};
const nomC=c=>({1:'as',10:'sota',11:'caballo',12:'rey'}[c.n]||c.n)+' de '+NOMP[c.p];
const rk=c=>NUMS.indexOf(c.n),val=c=>c.n;
const mezcla=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const mazo=()=>mezcla(PALOS.flatMap(p=>NUMS.map(n=>({p,n,id:p+n}))));

/* ---------- combinaciones: la mejor forma de combinar una mano (lo que menos deja suelto) ---------- */
function posibles(H){const M=[];
  // tríos y póker
  NUMS.forEach(n=>{const g=H.map((c,i)=>c.n===n?i:-1).filter(i=>i>=0);if(g.length<3)return;
    if(g.length===4)M.push(g);for(let a=0;a<g.length;a++)for(let b=a+1;b<g.length;b++)for(let c=b+1;c<g.length;c++)M.push([g[a],g[b],g[c]]);});
  // escaleras
  PALOS.forEach(p=>{const g=H.map((c,i)=>c.p===p?i:-1).filter(i=>i>=0).sort((a,b)=>rk(H[a])-rk(H[b]));
    for(let s=0;s<g.length;s++){let run=[g[s]];for(let t=s+1;t<g.length;t++){if(rk(H[g[t]])!==rk(H[run[run.length-1]])+1)break;run=run.concat(g[t]);if(run.length>=3)M.push(run.slice());}}});
  return M.map(m=>({m,mask:m.reduce((a,i)=>a|(1<<i),0),v:m.reduce((a,i)=>a+val(H[i]),0)}));}
function mejor(H){const M=posibles(H),memo={};
  const go=(k,used)=>{const key=k+'|'+used;if(key in memo)return memo[key];let b={v:0,ms:[]};
    for(let i=k;i<M.length;i++){if(M[i].mask&used)continue;const r=go(i+1,used|M[i].mask);if(r.v+M[i].v>b.v)b={v:r.v+M[i].v,ms:[M[i]].concat(r.ms)};}
    return memo[key]=b;};
  const b=go(0,0),usados=b.ms.reduce((a,x)=>a|x.mask,0);
  const melds=b.ms.map(x=>x.m.map(i=>H[i])),sueltas=H.filter((c,i)=>!(usados&(1<<i)));
  return {melds,sueltas,dw:sueltas.reduce((a,c)=>a+val(c),0)};}
const esChinchon=H=>H.length===7&&H.every(c=>c.p===H[0].p)&&(()=>{const r=H.map(rk).sort((a,b)=>a-b);return r.every((x,i)=>!i||x===r[i-1]+1);})();
// la mejor carta para tirar (la que deja menos suelto; a igualdad, la más alta suelta)
function mejorTiro(H){let b=null;H.forEach((c,i)=>{const R=H.filter((_,j)=>j!==i),m=mejor(R);const sc=m.dw*100-val(c);if(!b||sc<b.sc)b={i,sc,m};});return b;}
// ligar: las sueltas del otro que encajan en las combinaciones de quien corta
function ligar(melds,sueltas){melds=melds.map(m=>m.slice());let S=sueltas.slice(),hay=true;
  while(hay){hay=false;for(const c of S){for(const m of melds){
      const trio=m.every(x=>x.n===m[0].n);
      if(trio?(m.length<4&&c.n===m[0].n):(c.p===m[0].p&&(rk(c)===Math.min(...m.map(rk))-1||rk(c)===Math.max(...m.map(rk))+1))){m.push(c);S=S.filter(x=>x!==c);hay=true;break;}}
      if(hay)break;}}
  return S;}

/* ---------- estado ---------- */
let G=ls.get('bnChin',null),SEL=-1,OCUP=false;
const guarda=()=>ls.set('bnChin',G);
const NIVEL=()=>ls.get('bnChNivel',1);
function nuevaPartida(){G={pts:[0,0],mano:0,fin:false};nuevaMano();}
function nuevaMano(){const M=mazo();G.yo=M.splice(0,7);G.el=M.splice(0,7);G.mesa=[M.pop()];G.mazo=M;G.fase='robar';
  G.turno=G.mano%2===0?0:1;G.res=null;G.msg=G.turno===0?'Te toca: roba del mazo o de la mesa.':'Empieza la máquina…';G.yo=ordena(G.yo);guarda();pinta();if(G.turno===1)setTimeout(maquina,900);}
function ordena(H){const m=mejor(H);return m.melds.flat().concat(m.sueltas.sort((a,b)=>a.p.localeCompare(b.p)||rk(a)-rk(b)));}
function robaMazo(){if(!G.mazo.length){const top=G.mesa.pop();G.mazo=mezcla(G.mesa);G.mesa=[top];}return G.mazo.pop();}

/* ---------- jugador ---------- */
function yoRoba(de){if(OCUP||G.fin||G.res||G.turno!==0||G.fase!=='robar')return;
  const c=de==='mesa'?G.mesa.pop():robaMazo();if(!c)return;G.yo.push(c);SEL=G.yo.length-1;G.fase='tirar';
  G.msg=`Has cogido el ${nomC(c)}. Ahora elige una carta y tírala${puedeCortar(SEL)?' (¡o corta!)':''}.`;zumb(15);guarda();pinta();}
function puedeCortar(i){if(i<0||G.yo.length!==8)return false;const R=G.yo.filter((_,j)=>j!==i);return mejor(R).dw<=5;}
function yoTira(cortar){if(OCUP||G.turno!==0||G.fase!=='tirar'||SEL<0)return;const c=G.yo[SEL];
  if(cortar&&!puedeCortar(SEL))return;
  G.yo.splice(SEL,1);SEL=-1;
  if(esChinchon(G.yo)){fin(0,'chinchon');return;}
  if(cortar){G.mesaCorte=c;fin(0,'corte');return;}
  G.mesa.push(c);G.turno=1;G.fase='robar';G.msg='Turno de la máquina…';guarda();pinta();setTimeout(maquina,900);}

/* ---------- máquina ---------- */
function maquina(){if(G.fin||G.res||G.turno!==1)return;OCUP=true;const L=NIVEL(),fallo=Math.max(0,.3-.05*(L-1));
  const H=G.el,top=G.mesa[G.mesa.length-1],ahora=mejor(H).dw;
  // ¿le sirve la carta de la mesa?
  let coge='mazo';if(top){const HH=H.concat(top),t=mejorTiro(HH);if(HH[t.i]!==top&&t.m.dw<ahora&&!(Math.random()<fallo))coge='mesa';}
  const c=coge==='mesa'?G.mesa.pop():robaMazo();H.push(c);
  G.msg=coge==='mesa'?`La máquina coge el ${nomC(c)} de la mesa…`:'La máquina roba del mazo…';pinta();
  setTimeout(()=>{let t=mejorTiro(H);if(Math.random()<fallo/2){const m=mejor(H);if(m.sueltas.length){const s=m.sueltas[Math.floor(Math.random()*m.sueltas.length)];t={i:H.indexOf(s),m:mejor(H.filter(x=>x!==s))};}}
    const tirada=H.splice(t.i,1)[0];OCUP=false;
    if(esChinchon(H)){fin(1,'chinchon');return;}
    const umbral=L<=2?3:5;
    if(t.m.dw<=umbral||(t.m.dw<=5&&Math.random()<.5)){G.mesaCorte=tirada;fin(1,'corte');return;}
    G.mesa.push(tirada);G.turno=0;G.fase='robar';G.msg=`La máquina tira el ${nomC(tirada)}. Te toca: roba del mazo o de la mesa.`;guarda();pinta();},900);}

/* ---------- fin de mano ---------- */
function fin(quien,como){const A=quien===0?G.yo:G.el,B=quien===0?G.el:G.yo,ma=mejor(A),mb=mejor(B);
  const res={quien,como,manoA:ma,manoB:mb};
  if(como==='chinchon'){G.fin=true;res.txt=quien===0?'🎉 ¡CHINCHÓN! Ganas la partida.':'😮 ¡La máquina ha hecho chinchón! Gana la partida.';}
  else{const ptA=ma.dw===0?-10:ma.dw,sueltasB=ligar(ma.melds.concat(mb.melds),mb.sueltas),ptB=sueltasB.reduce((a,c)=>a+val(c),0);
    res.sueltasB=sueltasB;res.ptA=ptA;res.ptB=ptB;
    G.pts[quien]+=ptA;G.pts[1-quien]+=ptB;
    res.txt=(quien===0?'✂️ Has cortado':'✂️ La máquina ha cortado')+(ma.dw===0?' con todo combinado (−10)':` con ${ma.dw} suelto${ma.dw===1?'':'s'}`)+'.';
    if(G.pts[0]>100||G.pts[1]>100){G.fin=true;}}
  if(G.fin){const [a,b]=G.pts,pierde=a>100&&b>100?(a>=b?0:1):(a>100?0:1),gano=como==='chinchon'?quien===0:pierde===1;
    res.gano=gano;const E=ls.get('bnChStats',{g:0,p:0});gano?E.g++:E.p++;ls.set('bnChStats',E);if(gano)ls.set('bnChNivel',NIVEL()+1);zumb(gano?[60,40,60]:80);}
  G.res=res;G.mano++;guarda();pinta();}

/* ---------- pantalla ---------- */
const st=document.createElement('style');st.textContent=`
.chBox{background:radial-gradient(circle at 50% 30%,#1f6b3a,#0f3d22);color:#f1f8e9;border-radius:16px;padding:10px;margin:10px 0;user-select:none;-webkit-user-select:none}
.chBar{display:flex;justify-content:space-between;align-items:center;gap:6px;font-size:14px;flex-wrap:wrap}
.chBar button,.chBtn{border:0;border-radius:10px;background:rgba(255,255,255,.18);color:inherit;font:inherit;font-size:14px;padding:7px 10px;cursor:pointer}
.chBtn.pri{background:#ffd54f;color:#3e2723;font-weight:800}.chBtn:disabled{opacity:.35}
.chRiv{display:flex;justify-content:center;margin:8px 0}.chRiv .c{width:34px;margin-left:-14px}.chRiv .c:first-child{margin-left:0}
.chMesa{display:flex;justify-content:center;align-items:flex-end;gap:18px;margin:6px 0}.chMesa .c{width:86px;cursor:pointer}.chMesa small{display:block;text-align:center;font-size:12px;opacity:.85;margin-top:3px}
.chMano{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}.chMano .c{cursor:pointer;transition:transform .15s}
.c svg{width:100%;height:auto;display:block;border-radius:7%;box-shadow:0 2px 6px rgba(0,0,0,.35)}
.chMano .c.sel{transform:translateY(-10px)}.chMano .c.sel svg{box-shadow:0 0 0 3px #ffd54f,0 6px 12px rgba(0,0,0,.45)}
.chMano .c.comb svg{box-shadow:0 0 0 2px #81c784,0 2px 6px rgba(0,0,0,.35)}
.chMsg{text-align:center;font-size:14.5px;min-height:40px;margin:8px 0 2px;line-height:1.35}
.chAcc{display:flex;gap:6px;justify-content:center;margin-top:8px;flex-wrap:wrap}
.chRes{background:rgba(0,0,0,.35);border-radius:12px;padding:10px;margin-top:10px;font-size:14px;line-height:1.4}.chRes .fila{display:flex;gap:3px;flex-wrap:wrap;margin:4px 0}.chRes .fila .c{width:38px}
.chRes .suelta svg{box-shadow:0 0 0 2px #ef5350}`;document.head.appendChild(st);
(window.svSec||((i,h)=>{const s=document.createElement('section');s.id='t-'+i;s.innerHTML=h;document.querySelector('.wrap').appendChild(s);}))('jchinchon',
 `<div class="chBox" data-noswipe><div class="chBar"><span id="chLv"></span><span id="chPts"></span></div>
  <div class="chRiv" id="chRiv"></div><div class="chMesa" id="chMesa"></div><div class="chMsg" id="chMsg"></div>
  <div class="chMano" id="chMano"></div>
  <div class="chAcc"><button class="chBtn" id="chOrd">↕️ Ordenar</button><button class="chBtn pri" id="chTira" disabled>⬇️ Tirar</button><button class="chBtn" id="chCorta" disabled>✂️ Cortar</button></div>
  <div id="chRes"></div>
  <details style="margin-top:10px;font-size:13px;opacity:.9"><summary>📖 Cómo se juega</summary><div style="line-height:1.5;margin-top:6px">
   Cada uno tiene 7 cartas. En tu turno <b>roba</b> una (del mazo o la de arriba de la mesa) y <b>tira</b> otra.
   Junta <b>tríos o póker</b> del mismo número, o <b>escaleras</b> de 3 o más del mismo palo (el 7 va seguido de la sota). Las cartas combinadas se marcan en verde.<br>
   Puedes <b>cortar</b> al tirar si lo que te queda suelto suma 5 o menos (sota 10, caballo 11, rey 12). Cada uno se apunta lo que le queda suelto; cortar con todo combinado resta 10.
   <b>Chinchón</b> (escalera de 7 del mismo palo) gana la partida. Quien pasa de 100 pierde.</div></details>
  <div style="font-size:12px;opacity:.75;margin-top:8px">Baraja de Navarra: reyes, reinas y caballeros de la historia del reino. El número va en el escudo de Navarra.</div></div>`);
const carta=(c,cls='')=>`<div class="c ${cls}">${bnCarta(c.p,c.n,{grande:1})}</div>`;
function pinta(){if(!G)return;const E=ls.get('bnChStats',{g:0,p:0});
  $('chLv').innerHTML=`🏅 Nivel ${NIVEL()} <span style="opacity:.75;font-size:12.5px">· ${E.g} ganadas · ${E.p} perdidas</span>`;
  $('chPts').innerHTML=`Tú <b>${G.pts[0]}</b> · Máquina <b>${G.pts[1]}</b>`;
  $('chRiv').innerHTML=G.el.map(()=>`<div class="c">${bnDorso()}</div>`).join('');
  const top=G.mesa[G.mesa.length-1];
  $('chMesa').innerHTML=`<div><div class="c" id="chMz">${bnDorso()}</div><small>Mazo (${G.mazo.length})</small></div><div><div class="c" id="chMs">${top?bnCarta(top.p,top.n,{grande:1}):''}</div><small>Mesa</small></div>`;
  const comb=new Set(mejor(G.yo).melds.flat().map(c=>c.id));
  $('chMano').innerHTML=G.yo.map((c,i)=>carta(c,(i===SEL?'sel ':'')+(comb.has(c.id)?'comb':''))).join('');
  $('chMano').querySelectorAll('.c').forEach((d,i)=>d.onclick=()=>{if(G.res)return;if(G.fase==='tirar'&&G.turno===0){SEL=SEL===i?-1:i;}else{
      // fuera de turno: tocar dos cartas las cambia de sitio
      if(SEL<0)SEL=i;else{const t=G.yo[SEL];G.yo[SEL]=G.yo[i];G.yo[i]=t;SEL=-1;guarda();}}pinta();});
  $('chMz').onclick=()=>yoRoba('mazo');$('chMs').onclick=()=>{if(G.fase==='tirar'&&SEL>=0)yoTira(false);else yoRoba('mesa');};
  $('chMsg').innerHTML=G.res?'':G.msg;
  const t=G.turno===0&&G.fase==='tirar'&&!G.res;
  $('chTira').disabled=!(t&&SEL>=0);$('chCorta').disabled=!(t&&puedeCortar(SEL));
  $('chCorta').classList.toggle('pri',t&&puedeCortar(SEL));
  // resultado de la mano
  if(!G.res){$('chRes').innerHTML='';return;}const r=G.res;
  const fila=(m,s)=>`<div class="fila">${m.melds.map(x=>x.map(c=>carta(c)).join('')+'<span style="width:8px"></span>').join('')}${s.map(c=>carta(c,'suelta')).join('')}</div>`;
  const quienA=r.quien===0?'Tú':'La máquina',quienB=r.quien===0?'La máquina':'Tú';
  $('chRes').innerHTML=`<div class="chRes"><b style="font-size:16px">${r.txt}</b>
    <div style="margin-top:8px">${quienA}${r.ptA!=null?` (${r.ptA>0?'+':''}${r.ptA})`:''}:</div>${fila(r.manoA,r.manoA.sueltas)}
    <div>${quienB}${r.ptB!=null?` (+${r.ptB}${r.sueltasB.length<r.manoB.sueltas.length?', después de ligar':''})`:''}:</div>${fila(r.manoB,r.sueltasB||r.manoB.sueltas)}
    ${G.fin?`<div style="font-size:18px;font-weight:800;text-align:center;margin-top:8px">${r.gano?'🏆 ¡Has ganado la partida! Subes al nivel '+NIVEL()+'.':'😔 Has perdido la partida.'}</div>`:''}
    <div class="chAcc"><button class="chBtn pri" id="chSig">${G.fin?'🔄 Nueva partida':'➡️ Siguiente mano'}</button></div></div>`;
  $('chSig').onclick=()=>G.fin?nuevaPartida():nuevaMano();}
$('chTira').onclick=()=>yoTira(false);$('chCorta').onclick=()=>yoTira(true);
$('chOrd').onclick=()=>{if(!G||G.res)return;const sel=SEL>=0?G.yo[SEL]:null;G.yo=ordena(G.yo);SEL=sel?G.yo.indexOf(sel):-1;guarda();pinta();};

/* ---------- menú Juegos y entrada ---------- */
try{TITLES.jchinchon='🃏 Chinchón';PVS_ESC.jchinchon='aurora';ICK.jchinchon='game-controller';BNK.jchinchon='i-juego';BNF.jchinchon='r';BNL.jchinchon='Chinchón';ICC.jchinchon='#2e7d32';}catch(e){}
(function(){const sub=$('dsJuega');if(sub&&!sub.querySelector('[data-t="jchinchon"]')){const b=document.createElement('button');b.dataset.t='jchinchon';b.textContent='🃏 Chinchón';
  b.onclick=()=>{showTab('jchinchon');menu(false);};const ref=sub.querySelector('[data-t="jparejas"]');ref?ref.before(b):sub.appendChild(b);}
  try{if(typeof applyIcons==='function')applyIcons((CFG.iconos||'pro')==='pro');}catch(e){}})();
const _st=showTab;showTab=function(t){_st(t);if(t==='jchinchon')setTimeout(()=>{if(!G||!G.yo)nuevaPartida();else{pinta();if(G.turno===1&&!G.res&&!G.fin)setTimeout(maquina,600);}},40);};
window.CH_T={mejor,ligar,esChinchon,mejorTiro};   // para pruebas
})();
