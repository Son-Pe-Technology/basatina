/* =====================================================================
   🕹️ AITABALL (26 nov. 2026) — el pinball de BasatiNA
   Lo pidió Pedro, en recuerdo de su padre (Aita): jugaban al pinball en el ordenador
   a ver quién era el mejor, y Aita le ganaba siempre.

   CÓMO SE JUEGA
   - Mitad izquierda de la mesa = flipper izquierdo; mitad derecha = flipper derecho (vale con varios dedos).
   - Lanzar: con la bola abajo a la derecha, mantén pulsado el lado derecho y suelta (más tiempo = más fuerte).
   - Teclado: ← o Z (izquierdo), → o M (derecho), espacio o ↓ (lanzar).
   - Tres bolas. Setas: 100 · gomas: 10 · letras A·I·T·A: 50. Con las cuatro letras, +1000 y el multiplicador sube (hasta ×5).
   - El récord se guarda en el móvil (localStorage «bnJgAitaball»).

   CÓMO ESTÁ HECHO (por si hay que tocarlo)
   - Mesa de 400×680 px. Paredes = segmentos (SEG), setas = círculos (BUM), flippers = segmentos que giran (FL).
   - Física en pasos muy pequeños (1/600 s) para que la bola no atraviese nada aunque vaya rápida.
   - Al rebotar en un flipper se tiene en cuenta lo rápido que se mueve el flipper en ese punto (así «pega» de verdad).
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const ls={get:(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
const sec=(id,html)=>(window.svSec?svSec(id,html):(()=>{const s=document.createElement('section');s.id='t-'+id;s.innerHTML=html;(document.querySelector('.wrap')||document.body).appendChild(s);return s;})());
const zumb=p=>{try{navigator.vibrate&&navigator.vibrate(p);}catch(e){}};

/* ---------- estilos (prefijo ab) ---------- */
const st=document.createElement('style');st.textContent=`
.abBox{background:linear-gradient(180deg,#14213d,#0b1426);color:#eef3ff;border-radius:16px;padding:12px;margin:10px 0;display:flex;flex-direction:column;gap:10px}
.abHud{display:flex;justify-content:space-between;align-items:center;font-size:14px}.abHud b{font-size:19px;color:#ffd54f;font-variant-numeric:tabular-nums}
.abBox canvas{width:min(100%,420px,calc(64vh * 400 / 680));align-self:center;border-radius:14px;touch-action:none;display:block;box-shadow:0 0 0 3px #c9a227,0 0 0 6px #7a5c0f;-webkit-user-select:none;user-select:none}
.abBox .jgBig{align-self:center;min-width:60%}
.abDed{text-align:center;font-size:14px;font-style:italic;opacity:.9}`;
document.head.appendChild(st);

sec('jaita',`<div class="abBox" data-noswipe>
 <div class="abHud"><span>Bola <b id="abBola">1</b>/3</span><span>Puntos <b id="abPts">0</b></span><span>🏆 <b id="abRec">0</b></span></div>
 <button class="jgBig" id="abGo">▶️ Empezar</button>
 <canvas id="abC" width="400" height="680"></canvas>
 <div class="jgNota">Toca la mitad izquierda o la derecha de la mesa para mover cada flipper. Para lanzar, mantén pulsado el lado derecho y suelta: cuanto más tiempo, más fuerte. Pasa la bola por las cuatro letras A·I·T·A para multiplicar los puntos.</div>
 <div class="abDed">En recuerdo de Aita, que siempre me ganaba. 💙</div>
</div>`);

const C=$('abC'),x=C.getContext('2d'),W=400,H=680,R=8,G=1000;

/* ---------- la mesa ---------- */
const SEG=[];const seg=(x1,y1,x2,y2,o={})=>SEG.push(Object.assign({x1,y1,x2,y2,e:.4,k:0,p:0,f:0},o));
// arco de arriba (de la pared izquierda a la derecha)
(function(){let px=20,py=200;for(let i=1;i<=28;i++){const a=Math.PI+Math.PI*i/28,nx=200+180*Math.cos(a),ny=200+180*Math.sin(a);seg(px,py,nx,ny,{arc:1});px=nx;py=ny;}})();
seg(20,200,20,520);            // pared izquierda
seg(380,200,380,672);          // pared derecha (exterior del carril de lanzar)
seg(350,240,350,672);          // pared del carril de lanzar
seg(350,664,380,664);          // suelo del carril (donde espera la bola)
seg(20,520,103,598);           // pasillo izquierdo hacia el flipper
seg(350,520,267,598);          // pasillo derecho hacia el flipper
// gomas (triángulos encima de los flippers): el lado que mira al centro da un empujón
[[60,450,60,530,100,552],[310,450,310,530,270,552]].forEach(([ax,ay,bx,by,cx,cy])=>{
  seg(ax,ay,bx,by);seg(bx,by,cx,cy);seg(ax,ay,cx,cy,{e:.5,k:420,p:10,goma:1});});
const GOMAS=SEG.filter(s=>s.goma);
// setas (bumpers)
const BUM=[{x:125,y:275,r:22},{x:245,y:275,r:22},{x:185,y:355,r:22}].map(b=>Object.assign(b,{f:0}));
// letras A·I·T·A
const LET=[{x:130,y:135,c:'A'},{x:165,y:122,c:'I'},{x:205,y:122,c:'T'},{x:240,y:135,c:'A'}].map(l=>Object.assign(l,{on:false,cd:0}));
// flippers: pivote, largo, ángulo en reposo (a0) y arriba (a1)
const FL=[{x:105,y:600,L:62,a0:.5,a1:-.5},{x:265,y:600,L:62,a0:Math.PI-.5,a1:Math.PI+.5}].map(f=>Object.assign(f,{a:f.a0,w:0,on:false}));

/* ---------- estado ---------- */
let ACT=null;   // pantalla abierta (para parar al salir)
let b=null,pts=0,bola=1,mult=1,vivo=false,pausa=false,carga=0,cargando=false,raf=0,tUlt=0,flash=0,msg='',msgT=0,rec=ls.get('bnJgAitaball',0);
$('abRec').textContent=rec.toLocaleString('es-ES');
const hud=()=>{$('abPts').textContent=pts.toLocaleString('es-ES');$('abBola').textContent=Math.min(bola,3);};
const suma=n=>{pts+=n*mult;hud();};
const aviso=(t,s=1.4)=>{msg=t;msgT=s;};
const bolaNueva=()=>{b={x:365,y:655,vx:0,vy:0};carga=0;};

/* ---------- física ---------- */
function choca(s,rad,e){// devuelve la normal si hay choque (y saca la bola), si no null
  const dx=s.x2-s.x1,dy=s.y2-s.y1,l2=dx*dx+dy*dy;let t=((b.x-s.x1)*dx+(b.y-s.y1)*dy)/l2;t=t<0?0:t>1?1:t;
  const qx=s.x1+t*dx,qy=s.y1+t*dy;let nx=b.x-qx,ny=b.y-qy;const d=Math.hypot(nx,ny),rr=R+rad;
  if(d>=rr||d<1e-6)return null;nx/=d;ny/=d;b.x=qx+nx*rr;b.y=qy+ny*rr;return {nx,ny,qx,qy};}
function rebota(nx,ny,e,ux=0,uy=0){const vn=(b.vx-ux)*nx+(b.vy-uy)*ny;if(vn>=0)return 0;b.vx-=(1+e)*vn*nx;b.vy-=(1+e)*vn*ny;return -vn;}
function paso(dt){
  // flippers
  FL.forEach(f=>{const obj=f.on?f.a1:f.a0,d=obj-f.a,sp=24,st=sp*dt;if(Math.abs(d)<=st){f.a=obj;f.w=0;}else{f.w=Math.sign(d)*sp;f.a+=f.w*dt;}});
  if(!b)return;
  b.vy+=G*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
  SEG.forEach(s=>{const c=choca(s,0);if(!c)return;const v=rebota(c.nx,c.ny,s.e);
    if(s.k&&v>40){b.vx+=c.nx*s.k;b.vy+=c.ny*s.k;s.f=.15;suma(s.p);zumb(12);}});
  BUM.forEach(m=>{let nx=b.x-m.x,ny=b.y-m.y;const d=Math.hypot(nx,ny),rr=R+m.r;if(d>=rr||d<1e-6)return;nx/=d;ny/=d;b.x=m.x+nx*rr;b.y=m.y+ny*rr;
    if(rebota(nx,ny,.6)>0){b.vx+=nx*380;b.vy+=ny*380;m.f=.18;suma(100);zumb(18);}});
  FL.forEach(f=>{const s={x1:f.x,y1:f.y,x2:f.x+f.L*Math.cos(f.a),y2:f.y+f.L*Math.sin(f.a)};const c=choca(s,6);if(!c)return;
    const rx=c.qx-f.x,ry=c.qy-f.y;rebota(c.nx,c.ny,.3,-f.w*ry,f.w*rx);});
  LET.forEach((l,i)=>{if(l.cd>0||Math.hypot(b.x-l.x,b.y-l.y)>R+10)return;l.cd=.5;if(!l.on){l.on=true;suma(50);zumb(8);
    if(LET.every(z=>z.on)){suma(1000);mult=Math.min(5,mult+1);aviso('¡A·I·T·A!  ×'+mult);flash=.6;zumb([30,30,60]);setTimeout(()=>LET.forEach(z=>z.on=false),900);}}});
  const v=Math.hypot(b.vx,b.vy);if(v>2200){b.vx*=2200/v;b.vy*=2200/v;}
  if(b.y>H+R*2)pierde();}
function pierde(){b=null;bola++;zumb([40,40,90]);
  if(bola>3){fin();return;}aviso('Bola '+bola,1.2);setTimeout(()=>{if(vivo)bolaNueva();},900);hud();}
function listo(){return b&&b.x>350&&b.y>640&&Math.abs(b.vy)<40;}
function lanza(){if(!listo()){carga=0;return;}if(carga>.04){b.vy=-(1150+1250*Math.min(1,carga));zumb(15);}carga=0;}

/* ---------- dibujo ---------- */
function rr(px,py,w,h,r){x.beginPath();x.moveTo(px+r,py);x.arcTo(px+w,py,px+w,py+h,r);x.arcTo(px+w,py+h,px,py+h,r);x.arcTo(px,py+h,px,py,r);x.arcTo(px,py,px+w,py,r);x.closePath();}
function mesa(){
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1d3461');g.addColorStop(.55,'#162a4f');g.addColorStop(1,'#0c1830');x.fillStyle=g;x.fillRect(0,0,W,H);
  if(flash>0){x.fillStyle=`rgba(255,213,79,${flash*.35})`;x.fillRect(0,0,W,H);}
  // fuera de la mesa (encima del arco), más oscuro
  x.fillStyle='#08101f';x.beginPath();x.moveTo(0,0);x.lineTo(W,0);x.lineTo(W,200);x.arc(200,200,180,0,Math.PI,true);x.lineTo(0,200);x.closePath();x.fill();
  // adorno: cadenas en círculo, como en el escudo de Navarra
  x.save();x.globalAlpha=.13;x.strokeStyle='#ffd54f';x.lineWidth=3;
  for(let i=0;i<22;i++){const a=i/22*Math.PI*2;x.save();x.translate(185+78*Math.cos(a),330+78*Math.sin(a));x.rotate(a+Math.PI/2);x.beginPath();x.ellipse(0,0,9,5,0,0,7);x.stroke();x.restore();}
  x.font='bold 34px system-ui,sans-serif';x.textAlign='center';x.fillStyle='#ffd54f';x.fillText('AITABALL',185,470);x.restore();
  // paredes
  x.lineCap='round';x.strokeStyle='#c9a227';x.lineWidth=4;SEG.forEach(s=>{if(s.goma)return;x.beginPath();x.moveTo(s.x1,s.y1);x.lineTo(s.x2,s.y2);x.stroke();});
  // gomas
  GOMAS.forEach(s=>{x.strokeStyle=s.f>0?'#fff':'#ff7043';x.lineWidth=6;x.beginPath();x.moveTo(s.x1,s.y1);x.lineTo(s.x2,s.y2);x.stroke();});
  // letras
  LET.forEach(l=>{x.beginPath();x.arc(l.x,l.y,13,0,7);x.fillStyle=l.on?'#ffd54f':'rgba(255,255,255,.1)';x.fill();x.lineWidth=2;x.strokeStyle='#ffd54f';x.stroke();
    x.fillStyle=l.on?'#2b2100':'#ffd54f';x.font='bold 15px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(l.c,l.x,l.y+1);});
  // setas
  BUM.forEach(m=>{x.beginPath();x.arc(m.x,m.y,m.r+4,0,7);x.fillStyle='#c9a227';x.fill();
    const gg=x.createRadialGradient(m.x-6,m.y-6,3,m.x,m.y,m.r);gg.addColorStop(0,m.f>0?'#fff':'#ff6f6f');gg.addColorStop(1,m.f>0?'#ffd54f':'#b71c1c');
    x.beginPath();x.arc(m.x,m.y,m.r,0,7);x.fillStyle=gg;x.fill();x.fillStyle='#fff';x.font='bold 12px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('100',m.x,m.y+1);});
  // flippers
  FL.forEach(f=>{const tx=f.x+f.L*Math.cos(f.a),ty=f.y+f.L*Math.sin(f.a);x.strokeStyle='#b71c1c';x.lineWidth=15;x.beginPath();x.moveTo(f.x,f.y);x.lineTo(tx,ty);x.stroke();
    x.strokeStyle='#fff';x.lineWidth=10;x.beginPath();x.moveTo(f.x,f.y);x.lineTo(tx,ty);x.stroke();x.fillStyle='#c9a227';x.beginPath();x.arc(f.x,f.y,4,0,7);x.fill();});
  // muelle del lanzador
  const my=668+carga*18;x.fillStyle='#555';x.fillRect(357,my,16,H-my);x.strokeStyle='#999';x.lineWidth=2;
  for(let yy=my+4;yy<H;yy+=5){x.beginPath();x.moveTo(357,yy);x.lineTo(373,yy+2);x.stroke();}
  if(listo()){x.fillStyle='rgba(255,213,79,.85)';x.font='bold 12px system-ui,sans-serif';x.textAlign='center';x.fillText(carga>0?'¡suelta!':'mantén',365,620);x.fillText(carga>0?'':'y suelta',365,634);}
  // multiplicador
  x.fillStyle='#ffd54f';x.font='bold 16px system-ui,sans-serif';x.textAlign='left';x.textBaseline='alphabetic';x.fillText('×'+mult,30,240);
  // bola
  if(b){const gb=x.createRadialGradient(b.x-3,b.y-3,1,b.x,b.y,R);gb.addColorStop(0,'#fff');gb.addColorStop(.5,'#cfd8dc');gb.addColorStop(1,'#607d8b');x.beginPath();x.arc(b.x,b.y,R,0,7);x.fillStyle=gb;x.fill();}
  // mensaje
  if(msgT>0){x.fillStyle=`rgba(0,0,0,${Math.min(.55,msgT)})`;rr(70,560-310,230,52,12);x.fill();x.fillStyle='#ffd54f';x.font='bold 24px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(msg,185,276);}
  x.textBaseline='alphabetic';}
function velo(t1,t2,t3){mesa();x.fillStyle='rgba(8,16,31,.78)';x.fillRect(0,0,W,H);x.textAlign='center';x.fillStyle='#ffd54f';x.font='bold 40px system-ui,sans-serif';x.fillText(t1,W/2,300);
  x.fillStyle='#fff';x.font='19px system-ui,sans-serif';if(t2)x.fillText(t2,W/2,342);x.font='italic 16px system-ui,sans-serif';x.fillStyle='#cfd8dc';if(t3)x.fillText(t3,W/2,378);}

/* ---------- bucle ---------- */
function bucle(t){raf=requestAnimationFrame(bucle);let dt=Math.min(1/30,(t-tUlt)/1000||0);tUlt=t;if(!vivo||pausa)return;
  if(cargando&&listo())carga=Math.min(1,carga+dt);
  const n=Math.ceil(dt/(1/600));for(let i=0;i<n;i++)paso(dt/n);
  BUM.forEach(m=>m.f=Math.max(0,m.f-dt));GOMAS.forEach(s=>s.f=Math.max(0,s.f-dt));LET.forEach(l=>l.cd=Math.max(0,l.cd-dt));
  flash=Math.max(0,flash-dt);msgT=Math.max(0,msgT-dt);mesa();}
function empieza(){try{C.scrollIntoView({block:'center',behavior:'smooth'});}catch(e){}
  pts=0;bola=1;mult=1;LET.forEach(l=>l.on=false);FL.forEach(f=>{f.on=false;f.a=f.a0;});bolaNueva();hud();vivo=true;pausa=false;$('abGo').style.display='none';
  aviso('¡A por Aita!',1.6);cancelAnimationFrame(raf);tUlt=performance.now();raf=requestAnimationFrame(bucle);}
function fin(){vivo=false;cancelAnimationFrame(raf);const nuevo=pts>rec;if(nuevo){rec=pts;ls.set('bnJgAitaball',rec);$('abRec').textContent=rec.toLocaleString('es-ES');}
  velo(nuevo?'🏆 ¡Récord!':'Fin de partida',pts.toLocaleString('es-ES')+' puntos','Aita estaría orgulloso');$('abGo').textContent='🔄 Otra vez';$('abGo').style.display='';}
function para(){if(!vivo||pausa)return;pausa=true;FL.forEach(f=>f.on=false);cargando=false;velo('⏸️ En pausa','Toca «Seguir»','');$('abGo').textContent='▶️ Seguir';$('abGo').style.display='';}
$('abGo').onclick=()=>{if(vivo&&pausa){pausa=false;$('abGo').style.display='none';tUlt=performance.now();}else empieza();};

/* ---------- controles ---------- */
const DED=new Map();   // dedo → lado
const aplica=()=>{const v=[...DED.values()],dR=v.includes('R');FL[0].on=v.includes('L');FL[1].on=dR;
  if(dR&&!cargando){cargando=true;}else if(!dR&&cargando){cargando=false;lanza();}};
C.addEventListener('pointerdown',e=>{e.preventDefault();if(!vivo||pausa){$('abGo').click();return;}
  const r=C.getBoundingClientRect();DED.set(e.pointerId,(e.clientX-r.left)<r.width/2?'L':'R');try{C.setPointerCapture(e.pointerId);}catch(_){}aplica();});
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>C.addEventListener(ev,e=>{if(DED.delete(e.pointerId))aplica();}));
C.addEventListener('contextmenu',e=>e.preventDefault());
const TEC={ArrowLeft:'L',KeyZ:'L',ArrowRight:'R',KeyM:'R',Space:'P',ArrowDown:'P'};
document.addEventListener('keydown',e=>{if(ACT!=='jaita'||!vivo||pausa)return;const k=TEC[e.code];if(!k)return;e.preventDefault();
  if(k==='L')FL[0].on=true;else if(k==='R')FL[1].on=true;else cargando=true;});
document.addEventListener('keyup',e=>{if(ACT!=='jaita')return;const k=TEC[e.code];if(!k)return;
  if(k==='L')FL[0].on=false;else if(k==='R')FL[1].on=false;else{cargando=false;lanza();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)para();});

/* ---------- menú Juegos y entrada ---------- */
try{TITLES.jaita='🕹️ Aitaball';PVS_ESC.jaita='aurora';ICK.jaita='game-controller';ICC.jaita='#1565c0';BNK.jaita='i-juego';BNF.jaita='b';BNL.jaita='Aitaball';}catch(e){}
(function(){const sub=$('dsJuega');if(sub&&!sub.querySelector('[data-t="jaita"]')){const bt=document.createElement('button');bt.dataset.t='jaita';bt.textContent='🕹️ Aitaball';
  bt.onclick=()=>{showTab('jaita');menu(false);};const ref=sub.querySelector('[data-t="jnutria"]');ref?ref.after(bt):sub.appendChild(bt);}
  try{if(typeof applyIcons==='function')applyIcons((CFG.iconos||'pro')==='pro');}catch(e){}})();
const _st=showTab;showTab=function(t){_st(t);if(ACT==='jaita'&&t!=='jaita')para();ACT=t;
  if(t==='jaita')setTimeout(()=>{if(!vivo)velo('AITABALL',rec?'Récord: '+rec.toLocaleString('es-ES'):'Toca «Empezar»','En recuerdo de Aita');},40);};
window.AB_T={SEG,BUM,FL,LET,paso,get b(){return b;},set b(v){b=v;}};   // para pruebas
})();
