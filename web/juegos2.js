/* =====================================================================
   🎮 NA JUEGA · más juegos (17 nov. 2026) — se carga después de temas.js
   - 🃏 Solitario (`jsoli`): el clásico (Klondike), robando de una en una. Toca una carta y se
     mueve sola al mejor sitio posible. Botón ↩️ deshacer. La partida se guarda en el móvil.
   - 🖼️ Parejas de Navarra (`jparejas`): cartas boca abajo con fotos de lugares de Navarra.
   - 🔍 Descubre el lugar (`jlugar`): la foto tapada en 4×4; se abre una casilla, se cierra y se abre otra.
     Adivina el sitio entre 4: cuanto antes aciertes, más puntos. Al final sale el nombre del lugar.
   Fotos: web/fotosjuego.js (robot tools/fotos_juego.py, Wikimedia Commons con licencia libre;
   se enseñan siempre el autor y la licencia). Sin fotos (sin conexión), Parejas usa dibujos.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ls={get:(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
const baraja=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const zumb=p=>{try{navigator.vibrate&&navigator.vibrate(p);}catch(e){}};
const fotos=cb=>{if(window.FOTOSJ)return cb(FOTOSJ.f||[]);if(window.svLoad)svLoad('fotosjuego.js','FOTOSJ',ok=>cb(ok&&window.FOTOSJ?FOTOSJ.f||[]:[]));else cb([]);};
const credito=f=>`📷 ${E(f.a)} · ${E(f.l)} · Wikimedia Commons`;

const st=document.createElement('style');st.textContent=`
.soBox{background:radial-gradient(120% 80% at 50% 0%,#2e7d4f,#14452b);border-radius:16px;padding:10px 8px 14px;margin:10px 0;color:#fff;user-select:none;-webkit-user-select:none}
.soBar{display:flex;gap:6px;align-items:center;justify-content:space-between;font-size:14px;margin-bottom:8px}
.soBar button{border:0;border-radius:10px;background:rgba(255,255,255,.16);color:#fff;font:inherit;font-size:14px;padding:7px 10px;cursor:pointer}
.soRow{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.soCol{position:relative;min-height:calc(var(--ch) + 4px)}
.soSlot{height:var(--ch);border:1.5px dashed rgba(255,255,255,.35);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:18px;color:rgba(255,255,255,.35)}
.soC{position:absolute;left:0;right:0;height:var(--ch);border-radius:6px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.35);cursor:pointer;overflow:hidden;font-family:Georgia,serif}
.soC .r{position:absolute;left:3px;top:1px;font-size:calc(var(--cw) * .32);font-weight:700;line-height:1.05;letter-spacing:-.04em}
.soC .s{position:absolute;right:3px;top:2px;font-size:calc(var(--cw) * .28)}
.soC .g{position:absolute;left:0;right:0;bottom:2px;text-align:center;font-size:calc(var(--cw) * .55)}
.soC.red{color:#c62828}.soC.blk{color:#1b1b1b}
.soC.back{background:repeating-linear-gradient(45deg,#b71c1c 0 4px,#c62828 4px 8px);border:2px solid #fff}
.soC.back:after{content:'NA';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#ffd54f;font:900 calc(var(--cw) * .32) system-ui}
.soC.sel{outline:3px solid #ffd54f;z-index:50}
.soC.no{animation:soNo .3s}@keyframes soNo{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.soWin{text-align:center;padding:10px;font-size:18px;font-weight:800}
.paBox{background:linear-gradient(180deg,#14334a,#0d2333);border-radius:16px;padding:10px;margin:10px 0;color:#eaf4fb}
.paG{display:grid;gap:6px;margin:8px auto 0;max-width:440px}
.paC{aspect-ratio:3/4;perspective:600px;cursor:pointer}
.paC>div{position:relative;width:100%;height:100%;transition:transform .35s;transform-style:preserve-3d}
.paC.up>div,.paC.ok>div{transform:rotateY(180deg)}
.paC .f,.paC .b{position:absolute;inset:0;border-radius:10px;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden}
.paC .b{background:linear-gradient(135deg,#2e7d32,#1b5e20);border:2px solid #a5d6a7;display:flex;align-items:center;justify-content:center;color:#fff;font:900 22px system-ui}
.paC .b span{color:#ff5252}
.paC .f{transform:rotateY(180deg);background:#fff center/cover no-repeat;display:flex;align-items:center;justify-content:center;font-size:40px}
.paC.ok .f{box-shadow:0 0 0 3px #ffd54f inset}
.paCap{min-height:24px;text-align:center;font-weight:700;margin-top:8px}
.luBox{background:linear-gradient(180deg,#3e2723,#271a16);border-radius:16px;padding:10px;margin:10px 0;color:#fff7ee}
.luF{position:relative;width:100%;max-width:440px;aspect-ratio:4/3;margin:8px auto 0;border-radius:12px;overflow:hidden;background:#000 center/cover no-repeat}
.luG{position:absolute;inset:0;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr)}
.luG i{background:#5d4037;border:1px solid #3e2723;transition:opacity .35s}.luG i.op{opacity:0}
.luG i:nth-child(odd){background:#6d4c41}
.luOps{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px}
.luOps button{border:0;border-radius:10px;background:#fff7ee;color:#3e2723;font:inherit;font-weight:700;font-size:15px;padding:11px 8px;cursor:pointer;line-height:1.2}
.luOps button.bien{background:#c8e6c9}.luOps button.mal{background:#ffcdd2}.luOps button[disabled]{cursor:default}
.luN{text-align:center;margin-top:10px;font-size:20px;font-weight:800;min-height:26px}
.luCr{text-align:center;font-size:12px;opacity:.75;margin-top:2px}
`;document.head.appendChild(st);

/* =====================================================================
   🃏 SOLITARIO
   ===================================================================== */
svSec('jsoli',`<div class="soBox" id="soBox" data-noswipe>
 <div class="soBar"><span>⏱️ <b id="soT">0:00</b> · <b id="soM">0</b> mov.</span><span><button id="soU">↩️</button> <button id="soA" style="display:none">⚡ Terminar</button> <button id="soN">🔄 Nueva</button></span></div>
 <div class="soRow" id="soTop"></div><div class="soRow" id="soTab" style="margin-top:10px"></div><div id="soW"></div>
</div><div class="note" style="margin:0 6px 12px">Toca una carta y se mueve sola al mejor sitio. Toca el mazo para sacar otra carta. Se guarda la partida en este móvil. 🏆 Ganadas: <b id="soG">0</b></div>`);
(function(){
 const PAL=['♠','♥','♦','♣'],RN=['','A','2','3','4','5','6','7','8','9','10','J','Q','K'],rojo=s=>s===1||s===2;
 let S=ls.get('bnJgSoli',null),HIS=[],tick=null,sel=null;
 function nueva(){const m=[];for(let s=0;s<4;s++)for(let r=1;r<=13;r++)m.push({s,r,u:0});const b=baraja(m),tab=[];
   for(let c=0;c<7;c++){tab.push(b.splice(0,c+1));tab[c][c].u=1;}
   S={stock:b,waste:[],f:[[],[],[],[]],tab,mov:0,t0:Date.now(),seg:0,win:0};HIS=[];guarda();pinta();}
 const guarda=()=>ls.set('bnJgSoli',S),snap=()=>{HIS.push(JSON.stringify(S));if(HIS.length>200)HIS.shift();};
 const top=a=>a[a.length-1];
 const aFund=c=>{const f=S.f[c.s];return (f.length?top(f).r:0)===c.r-1;};
 const aCol=(c,col)=>{const t=top(col);return t?(t.u&&rojo(t.s)!==rojo(c.s)&&t.r===c.r+1):c.r===13;};
 function voltea(){S.tab.forEach(col=>{const t=top(col);if(t&&!t.u)t.u=1;});}
 function hecho(){S.mov++;voltea();if(S.f.every(f=>f.length===13)){S.win=1;S.seg=Math.round((Date.now()-S.t0)/1000);ls.set('bnJgSoliG',ls.get('bnJgSoliG',0)+1);zumb([40,60,40,60,120]);}guarda();pinta();}
 function mueve(from,i){ // from: 'w' (descarte) | 'f0'..'f3' (palos) | número de columna ; i = índice de la carta
   const esF=typeof from==='string'&&from[0]==='f';let src,cards;
   if(from==='w'){src=S.waste;cards=[top(src)];}
   else if(esF){src=S.f[+from.slice(1)];cards=[top(src)];}
   else{src=S.tab[from];cards=src.slice(i);if(!cards[0].u)return false;}
   const c=cards[0];
   if(cards.length===1&&!esF&&aFund(c)){snap();src.pop();S.f[c.s].push(c);hecho();return true;}
   // a otra columna: primero a una con cartas, luego a una vacía (solo reyes, y si no vienen ya de arriba del todo)
   const dest=[...S.tab.keys()].filter(k=>k!==from&&aCol(c,S.tab[k])).sort((a,b)=>(S.tab[a].length?0:1)-(S.tab[b].length?0:1));
   for(const k of dest){if(!S.tab[k].length&&typeof from==='number'&&i===0)continue;
     snap();src.splice(src.length-cards.length,cards.length);S.tab[k].push(...cards);hecho();return true;}
   return false;}
 function roba(){snap();if(S.stock.length){const c=S.stock.pop();c.u=1;S.waste.push(c);}else if(S.waste.length){S.stock=S.waste.reverse().map(c=>(c.u=0,c));S.waste=[];}else{HIS.pop();return;}S.mov++;guarda();pinta();}
 function auto(){let n=0;const paso=()=>{let hizo=false;
     const cand=[['w',S.waste.length-1],...S.tab.map((c,k)=>[k,c.length-1])].filter(([f,i])=>i>=0);
     cand.sort((a,b)=>{const ca=a[0]==='w'?top(S.waste):top(S.tab[a[0]]),cb=b[0]==='w'?top(S.waste):top(S.tab[b[0]]);return ca.r-cb.r;});
     for(const [f,i] of cand){const c=f==='w'?top(S.waste):top(S.tab[f]);if(c&&aFund(c)){snap();(f==='w'?S.waste:S.tab[f]).pop();S.f[c.s].push(c);hecho();hizo=true;break;}}
     if(!hizo&&S.stock.length){roba();hizo=true;}
     if(!hizo&&S.waste.length&&!S.stock.length){roba();hizo=true;}
     if(hizo&&!S.win&&++n<300)setTimeout(paso,70);};paso();}
 const puedeAuto=()=>!S.win&&S.tab.every(c=>c.every(x=>x.u));
 function carta(c,extra){const d=document.createElement('div');d.className='soC '+(c.u?(rojo(c.s)?'red':'blk'):'back')+(extra||'');
   if(c.u)d.innerHTML=`<span class="r">${RN[c.r]}</span><span class="s">${PAL[c.s]}</span><span class="g">${PAL[c.s]}</span>`;return d;}
 function no(el){el.classList.remove('no');void el.offsetWidth;el.classList.add('no');zumb(30);}
 function pinta(){const box=$('soBox'),w=Math.min(box.clientWidth||360,480)-16,cw=(w-24)/7,ch=cw*1.38;box.style.setProperty('--cw',cw+'px');box.style.setProperty('--ch',ch+'px');
   const T=$('soTop');T.innerHTML='';
   const so=document.createElement('div');so.className='soCol';so.appendChild(S.stock.length?carta({u:0}):Object.assign(document.createElement('div'),{className:'soSlot',textContent:S.waste.length?'↻':''}));so.onclick=roba;T.appendChild(so);
   const wa=document.createElement('div');wa.className='soCol';if(S.waste.length){const c=carta(top(S.waste));c.style.top='0';c.onclick=e=>{e.stopPropagation();if(!mueve('w',S.waste.length-1))no(c);};wa.appendChild(c);}else wa.innerHTML='<div class="soSlot"></div>';T.appendChild(wa);
   T.appendChild(document.createElement('div'));
   S.f.forEach((f,k)=>{const d=document.createElement('div');d.className='soCol';if(f.length){const c=carta(top(f));c.onclick=()=>{if(!mueve('f'+k,f.length-1))no(c);};d.appendChild(c);}else d.innerHTML=`<div class="soSlot">${PAL[k]}</div>`;T.appendChild(d);});
   const B=$('soTab');B.innerHTML='';let maxH=ch;
   S.tab.forEach((col,k)=>{const d=document.createElement('div');d.className='soCol';if(!col.length)d.innerHTML='<div class="soSlot">K</div>';
     let y=0;col.forEach((c,i)=>{const e=carta(c);e.style.top=y+'px';e.style.zIndex=i+1;e.onclick=()=>{if(!c.u){no(e);return;}if(!mueve(k,i))no(e);};d.appendChild(e);y+=c.u?ch*.3:ch*.13;});
     maxH=Math.max(maxH,y+ch*.7+ch*.3);d.style.height=Math.max(ch,y-(col.length?(col[col.length-1].u?ch*.3:ch*.13):0)+ch)+'px';B.appendChild(d);});
   $('soM').textContent=S.mov;$('soU').disabled=!HIS.length;$('soA').style.display=puedeAuto()?'':'none';$('soG').textContent=ls.get('bnJgSoliG',0);
   $('soW').innerHTML=S.win?`<div class="soWin">🎉 ¡Solitario completado!<br><span style="font-size:14px;font-weight:400">${S.mov} movimientos · ${Math.floor(S.seg/60)}:${String(S.seg%60).padStart(2,'0')}</span></div>`:'';}
 function reloj(){clearInterval(tick);tick=setInterval(()=>{if(!S||S.win)return;const s=Math.round((Date.now()-S.t0)/1000);$('soT').textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');},1000);}
 $('soN').onclick=()=>{if(S&&!S.win&&S.mov>3&&!confirm('¿Empezar otra partida? Se pierde la de ahora.'))return;nueva();};
 $('soU').onclick=()=>{if(!HIS.length)return;S=JSON.parse(HIS.pop());guarda();pinta();};
 $('soA').onclick=auto;
 window.addEventListener('resize',()=>{if(window.JG2ACT==='jsoli')pinta();});
 window.soInit=()=>{if(!S||!S.tab)nueva();else pinta();reloj();};
 window.soPara=()=>clearInterval(tick);
})();

/* =====================================================================
   🖼️ PAREJAS DE NAVARRA
   ===================================================================== */
const PA_DIB=[['🏰','Palacio Real de Olite'],['🌲','Selva de Irati'],['🏜️','Bardenas Reales'],['🦅','Buitre leonado'],['🐟','Trucha del Arga'],['🧀','Queso Roncal'],
 ['🌶️','Pimiento del piquillo'],['🍷','Vino de Navarra'],['🐄','Betizu'],['⛰️','Mesa de los Tres Reyes'],['🍄','Setas de otoño'],['🎉','San Fermín']];
svSec('jparejas',`<div class="paBox" data-noswipe>
 <div class="jgNiv" id="paNiv"><button data-n="6">😊 6 parejas</button><button data-n="8">🤔 8</button><button data-n="10">🧠 10</button></div>
 <div style="display:flex;justify-content:space-between;font-size:14px;margin-top:8px"><span>Intentos <b id="paI">0</b></span><span>Parejas <b id="paP">0</b></span><span>🏆 <b id="paR">—</b></span></div>
 <div class="paG" id="paG"></div><div class="paCap" id="paCap"></div><div id="paFin"></div>
</div><div class="note" style="margin:0 6px 12px">Da la vuelta a dos cartas: si son el mismo lugar, se quedan boca arriba. Fotos: Wikimedia Commons (autor y licencia al terminar).</div>`);
(function(){
 let N=ls.get('bnJgParN',6),C=[],abiertas=[],bloq=false,int=0,par=0,usadas=[];
 function nueva(){$('paFin').innerHTML='';$('paCap').textContent='';int=0;par=0;abiertas=[];bloq=false;$('paI').textContent=0;$('paP').textContent=0;
   const r=ls.get('bnJgParR',{})[N];$('paR').textContent=r?r+' int.':'—';
   document.querySelectorAll('#paNiv button').forEach(b=>b.classList.toggle('on',+b.dataset.n===N));
   fotos(F=>{const base=F.length>=N?baraja(F).slice(0,N).map(f=>({n:f.n,img:f.img,f})):baraja(PA_DIB).slice(0,N).map(d=>({n:d[1],e:d[0]}));usadas=base;
     C=baraja(base.concat(base).map((x,i)=>({x,id:i})));const g=$('paG');g.style.gridTemplateColumns=`repeat(${N===6?3:4},1fr)`;g.style.maxWidth=N===6?'330px':'440px';
     g.innerHTML=C.map((c,i)=>`<div class="paC" data-i="${i}"><div><div class="b">N<span>A</span></div><div class="f" style="${c.x.img?`background-image:url('${E(c.x.img)}')`:''}">${c.x.e||''}</div></div></div>`).join('');
     g.querySelectorAll('.paC').forEach(d=>d.onclick=()=>toca(+d.dataset.i,d));});}
 function toca(i,d){if(bloq||d.classList.contains('up')||d.classList.contains('ok'))return;d.classList.add('up');abiertas.push([i,d]);
   if(abiertas.length<2)return;int++;$('paI').textContent=int;const [[a,da],[b,db]]=abiertas;abiertas=[];
   if(C[a].x===C[b].x){par++;$('paP').textContent=par;zumb(25);setTimeout(()=>{da.classList.add('ok');db.classList.add('ok');},250);$('paCap').textContent='📍 '+C[a].x.n;if(par===N)fin();}
   else{bloq=true;setTimeout(()=>{da.classList.remove('up');db.classList.remove('up');bloq=false;},900);}}
 function fin(){const R=ls.get('bnJgParR',{}),nr=!R[N]||int<R[N];if(nr){R[N]=int;ls.set('bnJgParR',R);$('paR').textContent=int+' int.';}zumb([40,60,120]);
   $('paFin').innerHTML=`<div style="text-align:center;margin-top:8px"><b style="font-size:18px">${nr?'🏆 ¡Récord nuevo!':'🎉 ¡Todas las parejas!'}</b><div>${int} intentos (lo mínimo es ${N})</div>
    <button class="jgBig" id="paOtra" style="margin-top:8px;width:100%">🔄 Otra partida</button></div>
    ${usadas.some(u=>u.f)?`<details style="margin-top:8px;font-size:12.5px;opacity:.85"><summary>📷 Autores de las fotos</summary>${usadas.filter(u=>u.f).map(u=>`<div>${E(u.n)}: ${credito(u.f)}</div>`).join('')}</details>`:''}`;
   $('paOtra').onclick=nueva;}
 document.querySelectorAll('#paNiv button').forEach(b=>b.onclick=()=>{N=+b.dataset.n;ls.set('bnJgParN',N);nueva();});
 window.paInit=()=>{if(!C.length)nueva();};
})();

/* =====================================================================
   🔍 DESCUBRE EL LUGAR
   ===================================================================== */
svSec('jlugar',`<div class="luBox" data-noswipe>
 <div style="display:flex;justify-content:space-between;font-size:14px"><span>Foto <b id="luRo">1</b>/8</span><span>Puntos <b id="luPt">0</b></span><span>🏆 <b id="luRec">0</b></span></div>
 <label style="display:flex;gap:6px;align-items:center;font-size:13px;margin-top:6px;opacity:.85"><input type="checkbox" id="luFac"> Modo fácil: las casillas se quedan abiertas</label>
 <div class="luF" id="luF"><div class="luG" id="luG"></div></div>
 <div class="luOps" id="luOps"></div><div class="luN" id="luN"></div><div class="luCr" id="luCr"></div>
 <button class="jgBig" id="luSig" style="display:none;width:100%;margin-top:10px">Siguiente ›</button>
</div><div class="note" style="margin:0 6px 12px">Se abre una casilla, se cierra y se abre otra. ¿Sabes qué lugar de Navarra es? Cuanto antes aciertes, más puntos (100 con la primera casilla).</div>`);
(function(){
 let F=[],ronda=0,pts=0,act=null,orden=[],paso=0,tm=null,resp=false,usadas=[],rec=ls.get('bnJgLugar',0);
 const tapa=()=>$('luG').innerHTML='<i></i>'.repeat(16);
 function nueva(){ronda=0;pts=0;usadas=[];$('luPt').textContent=0;$('luRec').textContent=rec;sig();}
 function sig(){clearTimeout(tm);if(ronda>=8)return fin();ronda++;$('luRo').textContent=ronda;resp=false;$('luN').textContent='';$('luCr').textContent='';$('luSig').style.display='none';
   let f,k=0;do{f=F[Math.floor(Math.random()*F.length)];k++;}while(usadas.includes(f.n)&&k<60);usadas.push(f.n);act=f;
   tapa();$('luF').style.backgroundImage=`url('${f.img}')`;
   const ops=baraja([f.n,...baraja(F.filter(x=>x.n!==f.n)).slice(0,3).map(x=>x.n)]);
   $('luOps').innerHTML=ops.map(o=>`<button>${E(o)}</button>`).join('');$('luOps').querySelectorAll('button').forEach(b=>b.onclick=()=>contesta(b));
   orden=baraja([...Array(16).keys()]);paso=0;const im=new Image();im.onload=im.onerror=()=>{tm=setTimeout(abre,400);};im.src=f.img;}
 function abre(){if(resp)return;const T=$('luG').children,fac=$('luFac').checked;
   if(!fac&&paso>0)T[orden[(paso-1)%16]].classList.remove('op');
   if(paso>=16&&fac)return;T[orden[paso%16]].classList.add('op');paso++;tm=setTimeout(abre,1400);}
 function contesta(b){if(resp)return;resp=true;clearTimeout(tm);const ok=b.textContent===act.n,p=ok?Math.max(10,100-6*(Math.max(1,paso)-1))*($('luFac').checked?.5:1)|0:0;
   pts+=p;$('luPt').textContent=pts;$('luOps').querySelectorAll('button').forEach(x=>{x.disabled=true;if(x.textContent===act.n)x.classList.add('bien');});if(!ok)b.classList.add('mal');
   [...$('luG').children].forEach(t=>t.classList.add('op'));zumb(ok?25:[50,40,50]);
   $('luN').innerHTML=`📍 ${E(act.n)}<div style="font-size:14px;font-weight:600;margin-top:2px">${ok?'¡Bien! +'+p+' puntos':'No era esa 😅'}</div>`;$('luCr').innerHTML=credito(act);
   $('luSig').textContent=ronda>=8?'Ver resultado ›':'Siguiente ›';$('luSig').style.display='';}
 function fin(){act=null;const nr=pts>rec;if(nr){rec=pts;ls.set('bnJgLugar',rec);$('luRec').textContent=rec;}
   $('luOps').innerHTML='';$('luN').innerHTML=`${nr?'🏆 ¡Récord nuevo!':'Fin de la partida'}<div style="font-size:16px;margin-top:4px">${pts} de 800 puntos</div>`;$('luCr').textContent='';
   $('luSig').textContent='🔄 Otra partida';$('luSig').style.display='';}
 $('luSig').onclick=()=>{if(!act)return nueva();sig();};
 window.luInit=()=>{if(F.length>=4){if(!act&&ronda===0)nueva();else if(act&&!resp){clearTimeout(tm);tm=setTimeout(abre,400);}return;}$('luN').textContent='Cargando fotos…';
   fotos(L=>{F=L;if(F.length<4){$('luN').innerHTML='<span style="font-size:15px">Las fotos llegan con la próxima actualización (y hace falta conexión para verlas).</span>';return;}$('luN').textContent='';nueva();});};
 window.luPara=()=>{clearTimeout(tm);};
})();

/* ---------- menú «NA Juega»: botones nuevos y orden ---------- */
(function(){const sub=$('dsJuega');if(!sub)return;
  [['jlugar','🔍 Descubre el lugar'],['jparejas','🖼️ Parejas de Navarra'],['jsoli','🃏 Solitario']].forEach(([t,l])=>{const b=document.createElement('button');b.dataset.t=t;b.textContent=l;b.onclick=()=>{showTab(t);menu(false);};sub.appendChild(b);});
  ['jcadenas','jdonde','jlugar','jparejas','jsoli','jnutria'].forEach(t=>{const b=sub.querySelector(`[data-t="${t}"]`);if(b)sub.appendChild(b);});
  try{Object.assign(TITLES,{jlugar:'🔍 Descubre el lugar',jparejas:'🖼️ Parejas de Navarra',jsoli:'🃏 Solitario'});
    Object.assign(PVS_ESC,{jlugar:'pueblo',jparejas:'bokeh',jsoli:'bosque'});
    ['jlugar','jparejas','jsoli'].forEach(t=>{ICK[t]='game-controller';BNK[t]='i-juego';BNF[t]='g';});Object.assign(ICC,{jlugar:'#6d4c41',jparejas:'#1565c0',jsoli:'#2e7d32'});
    Object.assign(BNL,{jlugar:'Descubre',jparejas:'Parejas',jsoli:'Solitario'});
    if(typeof applyIcons==='function')applyIcons((CFG.iconos||'pro')==='pro');}catch(e){}
  try{Object.assign(I18N.eu,{'Descubre el lugar':'Asmatu tokia','Parejas de Navarra':'Nafarroako bikoteak','Solitario':'Bakarkakoa'});
    Object.assign(I18N.en,{'Descubre el lugar':'Guess the place','Parejas de Navarra':'Navarre pairs','Solitario':'Solitaire'});
    Object.assign(I18N.fr,{'Descubre el lugar':'Devine le lieu','Parejas de Navarra':'Paires de Navarre','Solitario':'Solitaire'});}catch(e){}})();
const _st2=showTab;showTab=function(t){const prev=window.JG2ACT;_st2(t);window.JG2ACT=t;
  if(prev==='jsoli'&&t!=='jsoli')soPara();if(prev==='jlugar'&&t!=='jlugar')luPara();
  if(t==='jsoli')setTimeout(soInit,40);if(t==='jparejas')setTimeout(paInit,40);if(t==='jlugar')setTimeout(luInit,40);};
})();
