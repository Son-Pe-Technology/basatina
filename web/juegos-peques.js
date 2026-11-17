/* =====================================================================
   🧸 JUEGOS PARA LOS PEQUES (17 nov. 2026) — se carga después de juegos2.js
   Pensados para niños pequeños: dibujos grandes, botones grandes y casi sin leer.
   Si el móvil sabe leer en voz alta (speechSynthesis), dice los nombres y los números.
   - 🐾 Las sombras (`psombras`): sale la sombra de un animal de Navarra y hay que elegir cuál es (de 3).
   - 🔢 A contar (`pcontar`): cuenta los animales y toca el número (1 a 10, por niveles).
   - 🐟 Atrapa las truchas (`ptruchas`): las truchas saltan en las pozas; tócalas antes de que se escondan.
   Para añadir un animal: una línea más en PQ_AN [dibujo, nombre con artículo].
   Están en «NA Juega» y en la pantalla 🧸 Para los peques.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const baraja=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const zumb=p=>{try{navigator.vibrate&&navigator.vibrate(p);}catch(e){}};
const ls={get:(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
// voz: solo si el móvil la tiene (en algunos Android dentro de la app no hay)
const habla=t=>{try{if(!window.speechSynthesis||ls.get('bnPqVoz',1)===0)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='es-ES';u.rate=.9;u.pitch=1.15;speechSynthesis.speak(u);}catch(e){}};
const PQ_AN=[['🐻','el oso'],['🦊','el zorro'],['🐗','el jabalí'],['🦌','el ciervo'],['🐺','el lobo'],['🦅','el águila'],['🦉','el búho'],['🐸','la rana'],
 ['🐟','la trucha'],['🦔','el erizo'],['🐿️','la ardilla'],['🐄','la vaca'],['🐑','la oveja'],['🐐','la cabra'],['🐴','el caballo'],['🐓','el gallo'],
 ['🐝','la abeja'],['🦋','la mariposa'],['🐌','el caracol'],['🦆','el pato'],['🐞','la mariquita'],['🐇','el conejo'],['🦇','el murciélago'],['🐍','la culebra'],
 ['🦦','la nutria'],['🐈','el gato'],['🐕','el perro'],['🐖','el cerdo'],['🦢','el cisne'],['🐢','la tortuga']];
const BIEN=['¡Muy bien!','¡Genial!','¡Eso es!','¡Bravo!','¡Lo has clavado!','¡Fenomenal!'],ANIMO=['¡Casi!','Prueba otra vez','¡Uy! Otra vez'];
const al=a=>a[Math.floor(Math.random()*a.length)];

const st=document.createElement('style');st.textContent=`
.pqBox{border-radius:20px;padding:12px;margin:10px 0;display:flex;flex-direction:column;gap:12px;user-select:none;-webkit-user-select:none}
.pqTop{display:flex;justify-content:space-between;align-items:center;font-size:16px;font-weight:700}
.pqTop button{border:0;border-radius:12px;background:rgba(255,255,255,.7);font-size:20px;padding:6px 10px;cursor:pointer}
.pqStars{font-size:20px;letter-spacing:2px;min-height:26px}
.pqBig{font-size:min(38vw,170px);line-height:1;text-align:center;transition:transform .25s,filter .4s}
.pqSom{filter:brightness(0) opacity(.85)}
.pqOps{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.pqOps button{border:0;border-radius:18px;background:#fff;box-shadow:0 4px 0 rgba(0,0,0,.15);font-size:min(14vw,60px);padding:10px 0;cursor:pointer;touch-action:manipulation;transition:transform .1s}
.pqOps button:active{transform:translateY(3px);box-shadow:0 1px 0 rgba(0,0,0,.15)}
.pqOps button.bien{background:#c8f7c5}.pqOps button.mal{background:#ffd6d6;animation:pqNo .35s}
.pqNum button{font-size:min(10vw,40px);font-weight:900;color:#5d4037}
@keyframes pqNo{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.pqMsg{text-align:center;font-size:24px;font-weight:900;min-height:32px}
.pqHop{animation:pqHop .5s}@keyframes pqHop{40%{transform:scale(1.18) rotate(-6deg)}}
.pqCnt{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;font-size:min(13vw,54px);min-height:130px;align-content:center;background:rgba(255,255,255,.55);border-radius:16px;padding:10px}
.pqCnt span{transition:transform .2s}.pqCnt span.on{transform:scale(1.25)}
.pqNiv{display:flex;gap:6px}.pqNiv button{flex:1;border:0;border-radius:12px;background:rgba(255,255,255,.6);font:inherit;font-weight:700;padding:8px 4px;cursor:pointer}.pqNiv button.on{background:#fff;box-shadow:0 0 0 2px #ff7043}
.pqPozas{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.pqPoza{aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 50% 60%,#4fc3f7,#0277bd 70%,#01579b);box-shadow:inset 0 6px 12px rgba(0,0,0,.35);position:relative;overflow:hidden;cursor:pointer;touch-action:manipulation}
.pqPoza span{position:absolute;left:0;right:0;bottom:-70%;text-align:center;font-size:min(14vw,56px);transition:bottom .18s ease-out}
.pqPoza.up span{bottom:18%}.pqPoza.pillada{background:radial-gradient(circle at 50% 60%,#a5d6a7,#2e7d32 70%)}
.pqPoza.bota span{filter:none}
.pqBar{height:10px;border-radius:5px;background:rgba(255,255,255,.5);overflow:hidden}.pqBar i{display:block;height:100%;background:#ff7043;transition:width 1s linear}
.pqGo{border:0;border-radius:16px;background:#ff7043;color:#fff;font-size:22px;font-weight:900;padding:14px;cursor:pointer;box-shadow:0 4px 0 #d84315}
.pqConf{position:fixed;inset:0;pointer-events:none;z-index:90;overflow:hidden}
.pqConf i{position:absolute;top:-40px;font-style:normal;font-size:28px;animation:pqCae 1.6s linear forwards}
@keyframes pqCae{to{transform:translateY(110vh) rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.pqConf{display:none}.pqHop{animation:none}}`;
document.head.appendChild(st);
function confeti(){const d=document.createElement('div');d.className='pqConf';
  d.innerHTML=[...Array(22)].map(()=>`<i style="left:${Math.random()*100}%;animation-delay:${Math.random()*.6}s">${al(['🎉','⭐','🌟','🎈','💚','❤️'])}</i>`).join('');
  document.body.appendChild(d);setTimeout(()=>d.remove(),2600);}
const vozBtn=id=>`<button id="${id}" title="Voz">${ls.get('bnPqVoz',1)?'🔊':'🔇'}</button>`;
function vozBind(id){$(id).onclick=()=>{const v=ls.get('bnPqVoz',1)?0:1;ls.set('bnPqVoz',v);document.querySelectorAll('.pqVozB').forEach(b=>b.textContent=v?'🔊':'🔇');if(v)habla('Hola');};$(id).classList.add('pqVozB');}

/* =====================================================================
   🐾 LAS SOMBRAS
   ===================================================================== */
svSec('psombras',`<div class="pqBox" style="background:linear-gradient(180deg,#fff3c4,#ffe082)" data-noswipe>
 <div class="pqTop"><span class="pqStars" id="psSt"></span>${vozBtn('psV')}</div>
 <div style="text-align:center;font-size:18px;font-weight:800;color:#6d4c41">¿De quién es esta sombra?</div>
 <div class="pqBig pqSom" id="psA"></div><div class="pqMsg" id="psM"></div>
 <div class="pqOps" id="psO"></div></div>
 <div class="note" style="margin:0 6px 12px">Para los más peques: toca el animal que tiene esa sombra. Cada acierto, una estrella ⭐ (con 10, ¡fiesta!).</div>`);
(function(){let act=null,est=0,bloq=false;
 function ronda(){bloq=false;const ops=baraja(PQ_AN).slice(0,3);act=al(ops);
   const a=$('psA');a.textContent=act[0];a.className='pqBig pqSom';$('psM').textContent='';
   $('psO').innerHTML=ops.map(o=>`<button data-a="${o[0]}">${o[0]}</button>`).join('');
   $('psO').querySelectorAll('button').forEach(b=>b.onclick=()=>toca(b));}
 function toca(b){if(bloq)return;const ok=b.dataset.a===act[0],nom=PQ_AN.find(x=>x[0]===b.dataset.a)[1];
   if(ok){bloq=true;b.classList.add('bien');const a=$('psA');a.className='pqBig pqHop';const t=al(BIEN);$('psM').textContent=t+' Es '+act[1];habla(t+' Es '+act[1]);zumb(30);
     est++;$('psSt').textContent='⭐'.repeat(est%10||(est?10:0));if(est%10===0){confeti();habla('¡Diez estrellas! ¡Eres un campeón!');}setTimeout(ronda,1900);}
   else{b.classList.remove('mal');void b.offsetWidth;b.classList.add('mal');const t=al(ANIMO);$('psM').textContent=t;habla('Ese es '+nom+'. '+t);zumb([40,30,40]);}}
 vozBind('psV');window.psInit=()=>{if(!act)ronda();};})();

/* =====================================================================
   🔢 A CONTAR
   ===================================================================== */
const NUM=['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez'];
svSec('pcontar',`<div class="pqBox" style="background:linear-gradient(180deg,#e1f5fe,#b3e5fc)" data-noswipe>
 <div class="pqTop"><span class="pqStars" id="pcSt"></span>${vozBtn('pcV')}</div>
 <div class="pqNiv" id="pcNiv"><button data-n="5">Hasta 5</button><button data-n="10">Hasta 10</button></div>
 <div style="text-align:center;font-size:18px;font-weight:800;color:#01579b" id="pcQ">¿Cuántos hay?</div>
 <div class="pqCnt" id="pcA"></div><div class="pqMsg" id="pcM"></div>
 <div class="pqOps pqNum" id="pcO"></div></div>
 <div class="note" style="margin:0 6px 12px">Cuenta los animales (puedes tocarlos para contarlos uno a uno) y toca el número.</div>`);
(function(){let n=0,an=null,est=0,bloq=false,max=ls.get('bnPqMax',5),cuenta=0;
 function ronda(){bloq=false;cuenta=0;n=1+Math.floor(Math.random()*max);an=al(PQ_AN);
   document.querySelectorAll('#pcNiv button').forEach(b=>b.classList.toggle('on',+b.dataset.n===max));
   $('pcQ').textContent='¿Cuántos hay?';$('pcM').textContent='';
   $('pcA').innerHTML=[...Array(n)].map(()=>`<span>${an[0]}</span>`).join('');
   $('pcA').querySelectorAll('span').forEach(s=>s.onclick=()=>{if(s.classList.contains('on'))return;s.classList.add('on');cuenta++;habla(NUM[cuenta]);});
   let ops=new Set([n]);while(ops.size<3){const k=Math.max(1,Math.min(max,n+Math.floor(Math.random()*5)-2));ops.add(k);}
   $('pcO').innerHTML=[...ops].sort((a,b)=>a-b).map(k=>`<button data-k="${k}">${k}</button>`).join('');
   $('pcO').querySelectorAll('button').forEach(b=>b.onclick=()=>toca(b));}
 function toca(b){if(bloq)return;const k=+b.dataset.k;
   if(k===n){bloq=true;b.classList.add('bien');const t=al(BIEN);$('pcM').textContent=t+' Hay '+n;habla(t+' Hay '+NUM[n]);zumb(30);
     $('pcA').querySelectorAll('span').forEach((s,i)=>setTimeout(()=>s.classList.add('on'),i*120));
     est++;$('pcSt').textContent='⭐'.repeat(est%10||(est?10:0));if(est%10===0)confeti();setTimeout(ronda,2200);}
   else{b.classList.remove('mal');void b.offsetWidth;b.classList.add('mal');$('pcM').textContent=al(ANIMO);habla(NUM[k]+' no. Cuenta otra vez');zumb([40,30,40]);}}
 document.querySelectorAll('#pcNiv button').forEach(b=>b.onclick=()=>{max=+b.dataset.n;ls.set('bnPqMax',max);ronda();});
 vozBind('pcV');window.pcInit=()=>{if(!an)ronda();};})();

/* =====================================================================
   🐟 ATRAPA LAS TRUCHAS
   ===================================================================== */
svSec('ptruchas',`<div class="pqBox" style="background:linear-gradient(180deg,#dcedc8,#aed581)" data-noswipe>
 <div class="pqTop"><span>🐟 <b id="ptP">0</b></span><span>🏆 <b id="ptR">0</b></span>${vozBtn('ptV')}</div>
 <div class="pqBar"><i id="ptB" style="width:100%"></i></div>
 <div class="pqPozas" id="ptG"></div><div class="pqMsg" id="ptM"></div>
 <button class="pqGo" id="ptGo">▶️ ¡A jugar!</button></div>
 <div class="note" style="margin:0 6px 12px">Las truchas saltan en las pozas del río: ¡tócalas antes de que se escondan! Cuidado con la bota vieja 🥾, que resta. Dura 30 segundos.</div>`);
(function(){let pts=0,tm=null,fin=0,vivo=false,rec=ls.get('bnPqTruchas',0),tick=null;
 const G=$('ptG');G.innerHTML=[...Array(9)].map((_,i)=>`<div class="pqPoza" data-i="${i}"><span></span></div>`).join('');
 const P=[...G.children];
 P.forEach(p=>p.addEventListener('pointerdown',e=>{e.preventDefault();if(!vivo||!p.classList.contains('up')||p.dataset.ok)return;p.dataset.ok=1;
   if(p.classList.contains('bota')){pts=Math.max(0,pts-2);zumb([60,40,60]);$('ptM').textContent='¡Puaj, una bota! −2';}
   else{pts++;zumb(20);p.classList.add('pillada');$('ptM').textContent=al(['¡Pillada!','¡Bien!','¡Otra!','¡Toma!']);}
   $('ptP').textContent=pts;setTimeout(()=>baja(p),220);}));
 function baja(p){p.classList.remove('up','pillada','bota');delete p.dataset.ok;}
 function salta(){if(!vivo)return;const libres=P.filter(p=>!p.classList.contains('up'));if(libres.length){const p=al(libres),bota=Math.random()<.15;
     p.querySelector('span').textContent=bota?'🥾':'🐟';p.classList.toggle('bota',bota);p.classList.add('up');
     const queda=Math.max(650,1300-(30000-(fin-Date.now()))/30);setTimeout(()=>{if(!p.dataset.ok)baja(p);},queda);}
   tm=setTimeout(salta,Math.max(380,820-(30000-(fin-Date.now()))/45));}
 function empieza(){pts=0;$('ptP').textContent=0;$('ptM').textContent='';P.forEach(baja);vivo=true;fin=Date.now()+30000;$('ptGo').style.display='none';habla('¡A pescar!');
   $('ptB').style.transition='none';$('ptB').style.width='100%';void $('ptB').offsetWidth;$('ptB').style.transition='width 1s linear';
   clearInterval(tick);tick=setInterval(()=>{const q=Math.max(0,fin-Date.now());$('ptB').style.width=(q/300)+'%';if(!q)termina();},250);tm=setTimeout(salta,500);}
 function termina(){vivo=false;clearTimeout(tm);clearInterval(tick);P.forEach(baja);const nr=pts>rec;if(nr){rec=pts;ls.set('bnPqTruchas',rec);$('ptR').textContent=rec;confeti();}
   $('ptM').textContent=(nr?'🏆 ¡Récord! ':'')+pts+(pts===1?' trucha':' truchas');habla((nr?'¡Récord! ':'')+'Has pescado '+pts+(pts===1?' trucha':' truchas'));
   $('ptGo').textContent='🔄 ¡Otra vez!';$('ptGo').style.display='';}
 $('ptGo').onclick=empieza;$('ptR').textContent=rec;vozBind('ptV');
 window.ptPara=()=>{if(vivo){vivo=false;clearTimeout(tm);clearInterval(tick);P.forEach(baja);$('ptGo').textContent='▶️ ¡A jugar!';$('ptGo').style.display='';$('ptM').textContent='';}};})();

/* ---------- menú «NA Juega» y pantalla «Para los peques» ---------- */
const PJ=[['psombras','🧸 Peques: Las sombras','🐾 Las sombras'],['pcontar','🧸 Peques: A contar','🔢 A contar'],['ptruchas','🧸 Peques: Atrapa las truchas','🐟 Atrapa las truchas']];
(function(){const sub=$('dsJuega');if(sub)PJ.forEach(([t,l])=>{const b=document.createElement('button');b.dataset.t=t;b.textContent=l;b.onclick=()=>{showTab(t);menu(false);};sub.appendChild(b);});
  try{PJ.forEach(([t,,n])=>{TITLES[t]=n;PVS_ESC[t]='bokeh';ICK[t]='game-controller';ICC[t]='#ff7043';BNK[t]='i-juego';BNF[t]='r';BNL[t]=n.replace(/^\S+\s/,'');});
    if(typeof applyIcons==='function')applyIcons((CFG.iconos||'pro')==='pro');}catch(e){}
  // en «🧸 Para los peques», una tarjeta con los juegos
  const pq=$('t-peques');if(pq&&!$('pqJuegos')){const c=document.createElement('div');c.className='card';c.id='pqJuegos';
    c.innerHTML=`<b>🎮 Juegos para los peques</b><div class="note">Sin internet, con dibujos grandes y casi sin leer.</div><div class="row" style="margin-top:8px">${PJ.map(([t,,n])=>`<button class="btn" data-go="${t}">${n}</button>`).join('')}</div>`;
    c.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>showTab(b.dataset.go));const f=pq.querySelector('.card');f?f.after(c):pq.prepend(c);}
  try{Object.assign(I18N.eu,{'Peques: Las sombras':'Txikiak: Itzalak','Peques: A contar':'Txikiak: Zenbatu','Peques: Atrapa las truchas':'Txikiak: Harrapatu amuarrainak'});
    Object.assign(I18N.en,{'Peques: Las sombras':'Kids: Shadows','Peques: A contar':'Kids: Counting','Peques: Atrapa las truchas':'Kids: Catch the trout'});
    Object.assign(I18N.fr,{'Peques: Las sombras':'Petits : Les ombres','Peques: A contar':'Petits : Compter','Peques: Atrapa las truchas':'Petits : Attrape les truites'});}catch(e){}})();
const _stP=showTab;showTab=function(t){const prev=window.PQACT;_stP(t);window.PQACT=t;try{if(window.speechSynthesis)speechSynthesis.cancel();}catch(e){}
  if(prev==='ptruchas'&&t!=='ptruchas')ptPara();
  if(t==='psombras')setTimeout(psInit,40);if(t==='pcontar')setTimeout(pcInit,40);};
})();
