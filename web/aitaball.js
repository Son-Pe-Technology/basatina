/* =====================================================================
   🕹️ AITABALL (26 nov. 2026) — el pinball de BasatiNA, a pantalla completa
   Lo pidió Pedro, en recuerdo de su padre (Aita): jugaban al pinball en el ordenador
   a ver quién era el mejor, y Aita le ganaba siempre.
   Diseño propio y de Navarra (no copia ninguna mesa comercial).

   LA MESA
   - Marcador arriba (puntos, bola, multiplicador y la misión del momento).
   - 🌉 Puente de Zubiri: rampa. Si subes la bola con fuerza por el pasillo de la derecha, cruza el puente
     por encima de la mesa y baja por la izquierda hasta tu flipper (2000).
   - 🍄 Tres setas (100), dos gomas (10), letras A·I·T·A (50; las cuatro: +1000 y multiplicador hasta ×5).
   - 🎯 Tres dianas que caen (500; las tres: +3000).
   - 🕳️ Cueva de Zugarramurdi: atrapa la bola un momento y la escupe (1000).
   - Misiones en orden (cada una 5000 × nivel); cada 3 misiones, bola extra.
   - Al lanzar cada bola, 8 s en que «Aita te cubre»: si se cae, vuelve.

   CONTROLES: mitad izquierda / derecha de la pantalla = flippers (varios dedos). Lanzar: mantén el lado
   derecho con la bola abajo a la derecha y suelta. Teclado: ← Z / → M / espacio ↓. Botón «atrás» del móvil: sale.

   CÓMO ESTÁ HECHO
   - Mesa de 400×780 (el marcador ocupa los 90 de arriba). Paredes = segmentos (SEG), setas (BUM),
     dianas (DT), flippers (FL). Física en pasos de 1/600 s. La rampa no es física: la bola sigue una curva (bez).
   - Récord en el móvil (localStorage «bnJgAitaball»).
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const ls={get:(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
const sec=(id,html)=>(window.svSec?svSec(id,html):(()=>{const s=document.createElement('section');s.id='t-'+id;s.innerHTML=html;(document.querySelector('.wrap')||document.body).appendChild(s);return s;})());
const zumb=p=>{try{navigator.vibrate&&navigator.vibrate(p);}catch(e){}};
const fmt=n=>Math.round(n).toLocaleString('es-ES');

/* ---------- estilos ---------- */
const st=document.createElement('style');st.textContent=`
.abCard{background:linear-gradient(180deg,#14213d,#0b1426);color:#eef3ff;border-radius:16px;padding:16px;margin:10px 0;display:flex;flex-direction:column;gap:12px;text-align:center}
.abCard h2{margin:0;font-size:30px;letter-spacing:.06em;color:#ffd54f}.abCard .rec{font-size:15px}.abCard .rec b{color:#ffd54f;font-size:20px}
.abCard .jgBig{align-self:center;min-width:70%}
.abDed{font-size:15px;font-style:italic;opacity:.92}
#abFS{position:fixed;inset:0;z-index:99999;background:#000;display:none;align-items:center;justify-content:center;touch-action:none;-webkit-user-select:none;user-select:none}
#abFS canvas{display:block;touch-action:none}
#abFS .abB{position:absolute;top:calc(6px + env(safe-area-inset-top));border:0;border-radius:10px;background:rgba(255,255,255,.14);color:#fff;font-size:18px;width:40px;height:36px;z-index:2}
#abFS .abB:active{background:rgba(255,255,255,.3)}`;
document.head.appendChild(st);

sec('jaita',`<div class="abCard">
 <h2>AITABALL</h2>
 <div class="rec">🏆 Tu récord: <b id="abRec">0</b></div>
 <button class="jgBig" id="abAbre">▶️ Jugar a pantalla completa</button>
 <div class="jgNota">Toca la mitad izquierda o la derecha de la pantalla para cada flipper. Para lanzar, mantén pulsado el lado derecho y suelta. Cruza el puente de Zubiri, tumba las dianas, entra en la cueva y enciende A·I·T·A para completar misiones.</div>
 <div class="abDed">En recuerdo de Aita, que siempre me ganaba. 💙</div>
</div>`);
const FS=document.createElement('div');FS.id='abFS';FS.setAttribute('data-noswipe','');
FS.innerHTML='<canvas id="abC"></canvas><button class="abB" id="abX" style="left:8px" aria-label="Salir">✕</button><button class="abB" id="abP" style="left:54px" aria-label="Pausa">⏸</button><button class="abB" id="abS" style="left:100px" aria-label="Sonido">🔊</button>';
document.body.appendChild(FS);

const C=$('abC'),x=C.getContext('2d'),W=400,H=780,TOP=90,R=8,G=1000;
let S=1;   // escala de pantalla

/* ---------- la mesa ---------- */
const SEG=[];const seg=(x1,y1,x2,y2,o={})=>SEG.push(Object.assign({x1,y1,x2,y2,e:.4,k:0,p:0,f:0},o));
(function(){let px=20,py=290;for(let i=1;i<=28;i++){const a=Math.PI+Math.PI*i/28,nx=200+180*Math.cos(a),ny=290+180*Math.sin(a);seg(px,py,nx,ny);px=nx;py=ny;}})();
seg(20,290,20,610);            // pared izquierda
seg(380,290,380,772);          // pared derecha
seg(350,330,350,772);          // pared del carril de lanzar
seg(350,754,380,754);          // suelo del carril
seg(20,610,103,688);           // pasillo izquierdo → flipper
seg(350,610,267,688);          // pasillo derecho → flipper
seg(286,415,280,492);          // guía de la entrada del puente
[[60,540,60,620,100,642],[310,540,310,620,270,642]].forEach(([ax,ay,bx,by,cx,cy])=>{seg(ax,ay,bx,by);seg(bx,by,cx,cy);seg(ax,ay,cx,cy,{e:.5,k:420,p:10,goma:1});});
const GOMAS=SEG.filter(s=>s.goma);
const BUM=[{x:115,y:330},{x:190,y:318},{x:152,y:390}].map(b=>Object.assign(b,{r:20,f:0}));
const LET=[{x:130,y:225,c:'A'},{x:165,y:212,c:'I'},{x:205,y:212,c:'T'},{x:240,y:225,c:'A'}].map(l=>Object.assign(l,{on:false,cd:0}));
const DT=[[140,166],[172,198],[204,230]].map(([a,c])=>({x1:a,x2:c,y:470,up:true,f:0}));
const CUE={x:68,y:455};
const RAMPA=[[312,412],[335,80],[35,80],[40,540]];
const bez=t=>{const u=1-t,[a,b,c,d]=RAMPA;return [u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]];};
const FL=[{x:105,y:690,L:62,a0:.5,a1:-.5},{x:265,y:690,L:62,a0:Math.PI-.5,a1:Math.PI+.5}].map(f=>Object.assign(f,{a:f.a0,w:0,on:false}));
const MIS=[['puente','Cruza el puente de Zubiri',2],['dianas','Tumba las tres dianas',1],['aita','Enciende A·I·T·A',1],['cueva','Entra en la cueva de Zugarramurdi',2],['setas','Golpea 20 setas',20]];

/* ---------- estado ---------- */
let ACT=null,abierto=false;
let b=null,pts=0,bolaN=1,quedan=3,mult=1,vivo=false,pausa=false,carga=0,cargando=false,raf=0,tUlt=0,flash=0,msg='',msgT=0;
let mi=0,mc=0,nivel=1,hechas=0,salva=0,salvaUsada=false,lanzada=false,rec=ls.get('bnJgAitaball',0),mudo=ls.get('bnJgAitaMudo',false);
$('abRec').textContent=fmt(rec);
const suma=n=>{pts+=n*mult;};
const aviso=(t,s=1.6)=>{msg=t;msgT=s;};
const bolaNueva=()=>{b={x:365,y:745,vx:0,vy:0,ramp:null,held:0,cueCd:0};carga=0;lanzada=false;salvaUsada=false;salva=0;};

/* ---------- sonido (pitidos sencillos, sin archivos) ---------- */
let AC=null;
function son(f,d=.08,tp='square',v=.05,f2){if(mudo)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();
  const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type=tp;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.02);}catch(e){}}
const arpe=(L,d=.09)=>L.forEach((f,i)=>setTimeout(()=>son(f,.12,'square',.05),i*d*1000));

/* ---------- misiones ---------- */
function evento(t){const m=MIS[mi];if(m[0]!==t)return;mc++;if(mc<m[2])return;
  suma(5000*nivel);hechas++;mc=0;mi=(mi+1)%MIS.length;if(mi===0)nivel++;aviso('¡Misión cumplida!',2);flash=.7;arpe([523,659,784,1047]);zumb([30,40,80]);
  if(hechas%3===0){quedan++;setTimeout(()=>aviso('¡Bola extra!',2),2000);}}

/* ---------- física ---------- */
function choca(s,rad){const dx=s.x2-s.x1,dy=s.y2-s.y1,l2=dx*dx+dy*dy;let t=((b.x-s.x1)*dx+(b.y-s.y1)*dy)/l2;t=t<0?0:t>1?1:t;
  const qx=s.x1+t*dx,qy=s.y1+t*dy;let nx=b.x-qx,ny=b.y-qy;const d=Math.hypot(nx,ny),rr=R+rad;
  if(d>=rr||d<1e-6)return null;nx/=d;ny/=d;b.x=qx+nx*rr;b.y=qy+ny*rr;return {nx,ny,qx,qy};}
function rebota(nx,ny,e,ux=0,uy=0){const vn=(b.vx-ux)*nx+(b.vy-uy)*ny;if(vn>=0)return 0;b.vx-=(1+e)*vn*nx;b.vy-=(1+e)*vn*ny;return -vn;}
function paso(dt){
  FL.forEach(f=>{const obj=f.on?f.a1:f.a0,d=obj-f.a,q=24*dt;if(Math.abs(d)<=q){f.a=obj;f.w=0;}else{f.w=Math.sign(d)*24;f.a+=f.w*dt;}});
  if(!b)return;
  if(b.ramp!=null){b.ramp+=dt/1.15;const [px,py]=bez(Math.min(1,b.ramp));b.x=px;b.y=py;
    if(b.ramp>=1){b.ramp=null;b.x=40;b.y=548;b.vx=0;b.vy=320;suma(2000);evento('puente');aviso('🌉 Puente de Zubiri');son(880,.25,'triangle',.06,440);}return;}
  if(b.held>0){b.held-=dt;if(b.held<=0){b.vx=300;b.vy=-380;b.cueCd=.8;son(200,.2,'sawtooth',.05,600);}return;}
  const py0=b.y;
  b.vy+=G*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.cueCd=Math.max(0,b.cueCd-dt);
  if(!lanzada&&b.x<340){lanzada=true;salva=8;}
  // entrada del puente: cruzar hacia arriba la línea y=420 por el pasillo derecho, con fuerza
  if(py0>=420&&b.y<420&&b.x>290&&b.x<346&&b.vy<-380){b.ramp=0;son(330,.3,'triangle',.06,990);return;}
  SEG.forEach(s=>{const c=choca(s,0);if(!c)return;const v=rebota(c.nx,c.ny,s.e);
    if(s.k&&v>40){b.vx+=c.nx*s.k;b.vy+=c.ny*s.k;s.f=.15;suma(s.p);son(440,.05);zumb(10);}});
  BUM.forEach(m=>{let nx=b.x-m.x,ny=b.y-m.y;const d=Math.hypot(nx,ny),rr=R+m.r;if(d>=rr||d<1e-6)return;nx/=d;ny/=d;b.x=m.x+nx*rr;b.y=m.y+ny*rr;
    if(rebota(nx,ny,.6)>0){b.vx+=nx*380;b.vy+=ny*380;m.f=.18;suma(100);evento('setas');son(660,.06);zumb(16);}});
  DT.forEach(t=>{if(!t.up)return;const c=choca({x1:t.x1,y1:t.y,x2:t.x2,y2:t.y},4);if(!c)return;
    if(rebota(c.nx,c.ny,.3)>60){t.up=false;suma(500);son(520,.08);zumb(14);
      if(DT.every(z=>!z.up)){suma(3000);evento('dianas');aviso('🎯 ¡Dianas!');setTimeout(()=>DT.forEach(z=>z.up=true),1500);}}});
  FL.forEach(f=>{const s={x1:f.x,y1:f.y,x2:f.x+f.L*Math.cos(f.a),y2:f.y+f.L*Math.sin(f.a)};const c=choca(s,6);if(!c)return;
    const rx=c.qx-f.x,ry=c.qy-f.y;rebota(c.nx,c.ny,.3,-f.w*ry,f.w*rx);});
  LET.forEach(l=>{if(l.cd>0||Math.hypot(b.x-l.x,b.y-l.y)>R+10)return;l.cd=.5;if(l.on)return;l.on=true;suma(50);son(990,.05,'sine',.06);
    if(LET.every(z=>z.on)){suma(1000);mult=Math.min(5,mult+1);aviso('¡A·I·T·A!  ×'+mult);flash=.6;evento('aita');arpe([392,523,659]);setTimeout(()=>LET.forEach(z=>z.on=false),900);}});
  if(!b.cueCd&&Math.hypot(b.x-CUE.x,b.y-CUE.y)<14&&Math.hypot(b.vx,b.vy)<1200){b.x=CUE.x;b.y=CUE.y;b.vx=b.vy=0;b.held=1.2;suma(1000);evento('cueva');aviso('🕳️ Cueva de Zugarramurdi');son(150,.4,'sawtooth',.05,60);return;}
  const v=Math.hypot(b.vx,b.vy);if(v>2200){b.vx*=2200/v;b.vy*=2200/v;}
  if(b.y>H+R*2)pierde();}
function pierde(){b=null;
  if(salva>0&&!salvaUsada){aviso('💙 Aita te devuelve la bola',2);son(523,.3,'sine',.06,784);setTimeout(()=>{if(vivo){bolaNueva();salvaUsada=true;}},800);return;}
  quedan--;bolaN++;son(220,.5,'sawtooth',.06,55);zumb([40,40,90]);
  if(quedan<=0){fin();return;}aviso('Bola '+bolaN,1.4);setTimeout(()=>{if(vivo)bolaNueva();},1000);}
const listo=()=>b&&b.ramp==null&&b.x>350&&b.y>730&&Math.abs(b.vy)<40;
function lanza(){if(!listo()){carga=0;return;}if(carga>.04){b.vy=-(1150+1250*Math.min(1,carga));son(300,.25,'triangle',.06,900);zumb(15);}carga=0;}

/* ---------- dibujo ---------- */
function rr(px,py,w,h,r){x.beginPath();x.moveTo(px+r,py);x.arcTo(px+w,py,px+w,py+h,r);x.arcTo(px+w,py+h,px,py+h,r);x.arcTo(px,py+h,px,py,r);x.arcTo(px,py,px+w,py,r);x.closePath();}
function txt(t,px,py,f,c,al='center'){x.font=f;x.fillStyle=c;x.textAlign=al;x.textBaseline='middle';x.fillText(t,px,py);}
function marcador(){x.fillStyle='#000';x.fillRect(0,0,W,TOP);x.strokeStyle='#ff8f00';x.globalAlpha=.5;x.lineWidth=2;rr(152,6,242,78,8);x.stroke();x.globalAlpha=1;
  txt(fmt(pts),386,30,'bold 28px ui-monospace,Menlo,monospace','#ffb300','right');
  txt('Bola '+Math.min(bolaN,99)+(quedan>1?' (+'+(quedan-1)+')':'')+'   ×'+mult+(salva>0&&!salvaUsada&&lanzada?'   💙':''),160,56,'14px ui-monospace,Menlo,monospace','#ffcc80','left');
  const m=MIS[mi];txt('▶ '+m[1]+(m[2]>1?'  '+mc+'/'+m[2]:''),160,74,'12px ui-monospace,Menlo,monospace','#ff8f00','left');
  txt('AITABALL',8,64,'bold 15px system-ui,sans-serif','#ffd54f','left');txt('Nivel '+nivel,8,80,'11px system-ui,sans-serif','#ffcc80','left');}
function mesa(){
  const g=x.createLinearGradient(0,TOP,0,H);g.addColorStop(0,'#1d3461');g.addColorStop(.55,'#162a4f');g.addColorStop(1,'#0c1830');x.fillStyle=g;x.fillRect(0,TOP,W,H-TOP);
  if(flash>0){x.fillStyle=`rgba(255,213,79,${flash*.3})`;x.fillRect(0,TOP,W,H-TOP);}
  x.fillStyle='#08101f';x.beginPath();x.moveTo(0,TOP);x.lineTo(W,TOP);x.lineTo(W,290);x.arc(200,290,180,0,Math.PI,true);x.lineTo(0,290);x.closePath();x.fill();
  // adorno: cadenas de Navarra en círculo
  x.save();x.globalAlpha=.14;x.strokeStyle='#ffd54f';x.lineWidth=3;
  for(let i=0;i<20;i++){const a=i/20*Math.PI*2;x.save();x.translate(185+62*Math.cos(a),570+62*Math.sin(a));x.rotate(a+Math.PI/2);x.beginPath();x.ellipse(0,0,8,4.5,0,0,7);x.stroke();x.restore();}
  x.restore();
  // paredes
  x.lineCap='round';x.strokeStyle='#c9a227';x.lineWidth=4;SEG.forEach(s=>{if(s.goma)return;x.beginPath();x.moveTo(s.x1,s.y1);x.lineTo(s.x2,s.y2);x.stroke();});
  GOMAS.forEach(s=>{x.strokeStyle=s.f>0?'#fff':'#ff7043';x.lineWidth=6;x.beginPath();x.moveTo(s.x1,s.y1);x.lineTo(s.x2,s.y2);x.stroke();});
  // flecha de la entrada del puente
  x.fillStyle=MIS[mi][0]==='puente'&&(Date.now()/300|0)%2?'#ffd54f':'rgba(255,213,79,.35)';x.beginPath();x.moveTo(318,452);x.lineTo(306,476);x.lineTo(330,476);x.closePath();x.fill();
  // cueva
  const cg=x.createRadialGradient(CUE.x,CUE.y,2,CUE.x,CUE.y,17);cg.addColorStop(0,'#000');cg.addColorStop(1,'#4e342e');x.beginPath();x.arc(CUE.x,CUE.y,17,0,7);x.fillStyle=cg;x.fill();
  x.lineWidth=2;x.strokeStyle=MIS[mi][0]==='cueva'&&(Date.now()/300|0)%2?'#ffd54f':'#8d6e63';x.stroke();
  // letras
  LET.forEach(l=>{x.beginPath();x.arc(l.x,l.y,13,0,7);x.fillStyle=l.on?'#ffd54f':'rgba(255,255,255,.1)';x.fill();x.lineWidth=2;x.strokeStyle='#ffd54f';x.stroke();
    txt(l.c,l.x,l.y+1,'bold 15px system-ui,sans-serif',l.on?'#2b2100':'#ffd54f');});
  // dianas
  DT.forEach(t=>{if(t.up){x.fillStyle='#ffca28';x.fillRect(t.x1,t.y-5,t.x2-t.x1,10);x.fillStyle='#b71c1c';x.fillRect(t.x1+9,t.y-3,8,6);}
    else{x.fillStyle='rgba(255,202,40,.2)';x.fillRect(t.x1,t.y-2,t.x2-t.x1,4);}});
  // setas
  BUM.forEach(m=>{x.beginPath();x.arc(m.x,m.y,m.r+4,0,7);x.fillStyle='#c9a227';x.fill();
    const gg=x.createRadialGradient(m.x-6,m.y-6,3,m.x,m.y,m.r);gg.addColorStop(0,m.f>0?'#fff':'#ff6f6f');gg.addColorStop(1,m.f>0?'#ffd54f':'#b71c1c');
    x.beginPath();x.arc(m.x,m.y,m.r,0,7);x.fillStyle=gg;x.fill();x.fillStyle='rgba(255,255,255,.85)';[[-6,-5],[5,-7],[0,4],[7,3]].forEach(([a,c])=>{x.beginPath();x.arc(m.x+a,m.y+c,2.4,0,7);x.fill();});});
  // flippers
  FL.forEach(f=>{const tx=f.x+f.L*Math.cos(f.a),ty=f.y+f.L*Math.sin(f.a);x.strokeStyle='#b71c1c';x.lineWidth=15;x.beginPath();x.moveTo(f.x,f.y);x.lineTo(tx,ty);x.stroke();
    x.strokeStyle='#fff';x.lineWidth=10;x.beginPath();x.moveTo(f.x,f.y);x.lineTo(tx,ty);x.stroke();x.fillStyle='#c9a227';x.beginPath();x.arc(f.x,f.y,4,0,7);x.fill();});
  // muelle
  const my=758+carga*16;x.fillStyle='#555';x.fillRect(357,my,16,H-my);x.strokeStyle='#999';x.lineWidth=2;for(let yy=my+4;yy<H;yy+=5){x.beginPath();x.moveTo(357,yy);x.lineTo(373,yy+2);x.stroke();}
  for(let i=0;i<5;i++){x.beginPath();x.arc(365,700-i*34,4,0,7);x.fillStyle=listo()&&((Date.now()/120|0)%5===i)?'#ffd54f':'rgba(255,213,79,.22)';x.fill();}
  // bola (debajo del puente si no va por él)
  if(b&&b.ramp==null)bola();
  // puente de Zubiri (por encima de todo)
  x.save();x.lineCap='round';x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=30;camino(4);x.strokeStyle='#8d7b68';x.lineWidth=26;camino(0);
  x.strokeStyle='#b7a58f';x.lineWidth=18;camino(0);x.setLineDash([3,9]);x.strokeStyle='#6d5d4c';x.lineWidth=18;camino(0);x.setLineDash([]);x.restore();
  const [mx,mY]=bez(.5);txt('PUENTE DE ZUBIRI',mx,mY+1,'bold 10px system-ui,sans-serif','#3e2f22');
  if(b&&b.ramp!=null)bola(1.25);
  if(msgT>0){x.fillStyle=`rgba(0,0,0,${Math.min(.6,msgT)})`;rr(40,500,290,48,12);x.fill();txt(msg,185,525,'bold 21px system-ui,sans-serif','#ffd54f');}}
function camino(dy){x.beginPath();for(let i=0;i<=40;i++){const [px,py]=bez(i/40);i?x.lineTo(px,py+dy):x.moveTo(px,py+dy);}x.stroke();}
function bola(k=1){const r=R*k,gb=x.createRadialGradient(b.x-3*k,b.y-3*k,1,b.x,b.y,r);gb.addColorStop(0,'#fff');gb.addColorStop(.5,'#cfd8dc');gb.addColorStop(1,'#607d8b');x.beginPath();x.arc(b.x,b.y,r,0,7);x.fillStyle=gb;x.fill();}
function pinta(){x.setTransform(S,0,0,S,0,0);mesa();marcador();}
function velo(t1,t2,t3){pinta();x.fillStyle='rgba(8,16,31,.8)';x.fillRect(0,TOP,W,H-TOP);txt(t1,W/2,360,'bold 40px system-ui,sans-serif','#ffd54f');
  if(t2)txt(t2,W/2,405,'19px system-ui,sans-serif','#fff');if(t3)txt(t3,W/2,440,'italic 16px system-ui,sans-serif','#cfd8dc');}

/* ---------- bucle ---------- */
function bucle(t){raf=requestAnimationFrame(bucle);const dt=Math.min(1/30,(t-tUlt)/1000||0);tUlt=t;if(!vivo||pausa)return;
  if(cargando&&listo())carga=Math.min(1,carga+dt);
  const n=Math.ceil(dt/(1/600));for(let i=0;i<n;i++)paso(dt/n);
  BUM.forEach(m=>m.f=Math.max(0,m.f-dt));GOMAS.forEach(s=>s.f=Math.max(0,s.f-dt));LET.forEach(l=>l.cd=Math.max(0,l.cd-dt));
  if(lanzada&&salva>0)salva=Math.max(0,salva-dt);flash=Math.max(0,flash-dt);msgT=Math.max(0,msgT-dt);pinta();}
function empieza(){pts=0;bolaN=1;quedan=3;mult=1;mi=0;mc=0;nivel=1;hechas=0;LET.forEach(l=>l.on=false);DT.forEach(t=>t.up=true);FL.forEach(f=>{f.on=false;f.a=f.a0;});
  bolaNueva();vivo=true;pausa=false;aviso('¡A por Aita!',1.8);arpe([392,494,587,784]);cancelAnimationFrame(raf);tUlt=performance.now();raf=requestAnimationFrame(bucle);}
function fin(){vivo=false;cancelAnimationFrame(raf);const nuevo=pts>rec;if(nuevo){rec=pts;ls.set('bnJgAitaball',rec);$('abRec').textContent=fmt(rec);arpe([523,659,784,1047,1319],.12);}
  velo(nuevo?'🏆 ¡Récord!':'Fin de partida',fmt(pts)+' puntos','Aita estaría orgulloso');setTimeout(()=>{if(!vivo&&abierto)txt('Toca para jugar otra vez',W/2,500,'16px system-ui,sans-serif','#ffcc80');},600);}
function para(){if(!vivo||pausa)return;pausa=true;FL.forEach(f=>f.on=false);cargando=false;DED.clear();velo('⏸️ En pausa','Toca para seguir','');}

/* ---------- pantalla completa ---------- */
function ajusta(){const w=window.innerWidth,h=window.innerHeight,dpr=Math.min(2,window.devicePixelRatio||1);const s=Math.min(w/W,h/H);
  C.style.width=Math.floor(W*s)+'px';C.style.height=Math.floor(H*s)+'px';C.width=Math.floor(W*s*dpr);C.height=Math.floor(H*s*dpr);S=C.width/W;
  if(vivo&&!pausa)return;if(vivo)velo('⏸️ En pausa','Toca para seguir','');else velo('AITABALL',rec?'Récord: '+fmt(rec):'Toca para empezar','En recuerdo de Aita');}
let atrasPrev=null;
function abre(){if(abierto)return;abierto=true;FS.style.display='flex';ajusta();
  try{const el=document.documentElement,f=el.requestFullscreen||el.webkitRequestFullscreen;if(f){const p=f.call(el);if(p&&p.catch)p.catch(()=>{});}}catch(e){}
  atrasPrev=window.basatinaAtras||null;window.basatinaAtras=function(){if(abierto){cierra();return true;}return atrasPrev?atrasPrev.apply(this,arguments):null;};}
function cierra(){if(!abierto)return;para();abierto=false;FS.style.display='none';cancelAnimationFrame(raf);
  if(atrasPrev)window.basatinaAtras=atrasPrev;atrasPrev=null;
  try{if(document.fullscreenElement)document.exitFullscreen();}catch(e){}}
window.addEventListener('resize',()=>{if(abierto)ajusta();});
$('abAbre').onclick=abre;
$('abX').onclick=e=>{e.stopPropagation();cierra();};
$('abP').onclick=e=>{e.stopPropagation();if(vivo&&!pausa)para();else toca();};
$('abS').onclick=e=>{e.stopPropagation();mudo=!mudo;ls.set('bnJgAitaMudo',mudo);$('abS').textContent=mudo?'🔇':'🔊';};
$('abS').textContent=mudo?'🔇':'🔊';
function toca(){if(vivo&&pausa){pausa=false;tUlt=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(bucle);}else if(!vivo)empieza();}

/* ---------- controles ---------- */
const DED=new Map();
const aplica=()=>{const v=[...DED.values()],dR=v.includes('R');const l0=FL[0].on,r0=FL[1].on;FL[0].on=v.includes('L');FL[1].on=dR;
  if((FL[0].on&&!l0)||(FL[1].on&&!r0))son(140,.04,'triangle',.05);
  if(dR&&!cargando)cargando=true;else if(!dR&&cargando){cargando=false;lanza();}};
FS.addEventListener('pointerdown',e=>{if(e.target.closest('.abB'))return;e.preventDefault();if(!vivo||pausa){toca();return;}
  DED.set(e.pointerId,e.clientX<window.innerWidth/2?'L':'R');try{FS.setPointerCapture(e.pointerId);}catch(_){}aplica();});
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>FS.addEventListener(ev,e=>{if(DED.delete(e.pointerId))aplica();}));
FS.addEventListener('contextmenu',e=>e.preventDefault());
const TEC={ArrowLeft:'L',KeyZ:'L',ArrowRight:'R',KeyM:'R',Space:'P',ArrowDown:'P'};
document.addEventListener('keydown',e=>{if(!abierto)return;if(e.code==='Escape'){cierra();return;}const k=TEC[e.code];if(!k)return;e.preventDefault();
  if(!vivo||pausa){toca();return;}if(k==='L')FL[0].on=true;else if(k==='R')FL[1].on=true;else cargando=true;});
document.addEventListener('keyup',e=>{if(!abierto)return;const k=TEC[e.code];if(!k)return;
  if(k==='L')FL[0].on=false;else if(k==='R')FL[1].on=false;else{cargando=false;lanza();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)para();});

/* ---------- menú Juegos y entrada ---------- */
try{TITLES.jaita='🕹️ Aitaball';PVS_ESC.jaita='aurora';ICK.jaita='game-controller';ICC.jaita='#1565c0';BNK.jaita='i-juego';BNF.jaita='b';BNL.jaita='Aitaball';}catch(e){}
(function(){const sub=$('dsJuega');if(sub&&!sub.querySelector('[data-t="jaita"]')){const bt=document.createElement('button');bt.dataset.t='jaita';bt.textContent='🕹️ Aitaball';
  bt.onclick=()=>{showTab('jaita');menu(false);};const ref=sub.querySelector('[data-t="jnutria"]');ref?ref.after(bt):sub.appendChild(bt);}
  try{if(typeof applyIcons==='function')applyIcons((CFG.iconos||'pro')==='pro');}catch(e){}})();
const _st=showTab;showTab=function(t){_st(t);if(ACT==='jaita'&&t!=='jaita')cierra();ACT=t;};
window.AB_T={SEG,BUM,FL,LET,DT,paso,get b(){return b;},set b(v){b=v;},get ramp(){return b&&b.ramp;}};   // para pruebas
})();
