/* =====================================================================
   🕹️ AITABALL (26 nov. 2026) — el pinball de BasatiNA, a pantalla completa
   Lo pidió Pedro, en recuerdo de su padre (Aita): jugaban al pinball en el ordenador
   a ver quién era el mejor, y Aita le ganaba siempre.
   Diseño propio y de Navarra (no copia ninguna mesa comercial).

   4.ª versión (26 nov. 2026): estilo «bosque» como el dibujo que trajo Pedro (rampas de alambre, cueva arriba, setas-bumper,
   carteles de madera, río y cartel central «Aita · Pinball»); los dibujos no son solo setas (Pirineos, pinos, helechos, hojas).
   3.ª versión (26 nov. 2026, Pedro: «muy simple, sin gracia; con la figura de Navarra, colores, bombillas,
   más rampas y setas»):
   - Seis carteles de madera con lugares (Zubiri, Aoiz, Pamplona, Irati, Bardenas, Urbasa): cada misión cumplida
     enciende uno; con los seis: «¡Navarra encendida!» (+50 000). (En la 3.ª versión era la silueta de Navarra con pueblos.)
   - Dos rampas: 🌉 Puente de Zubiri (entrada a la derecha, baja por la izquierda) y
     🌉 Puente la Reina (entrada a la izquierda, baja por la derecha). 2000 cada una.
   - Cuatro setas-bumper (100), dos gomas (10), letras A·I·T·A (50; las cuatro: +1000 y multiplicador hasta ×5),
     tres dianas (500; las tres: +3000), cueva de Zugarramurdi (1000).
   - 🐂 ENCIERRO (multibola): cruza los dos puentes y la cueva se enciende; mete la bola y salen 3 bolas.
   - Bombillas por todas partes: arco de luces que corre, flechas en las rampas, anillos en las setas,
     carril de lanzar, multiplicadores y pueblos.
   - Al lanzar cada bola, 8 s en que «Aita te devuelve la bola».

   CONTROLES: mitad izquierda / derecha de la pantalla = flippers (varios dedos). Lanzar: mantén el lado
   derecho con la bola abajo a la derecha y suelta. Teclado: ← Z / → M / espacio ↓. «Atrás» del móvil: sale.

   CÓMO ESTÁ HECHO
   - Mesa de 400×780 (marcador en los 90 de arriba). Paredes = segmentos (SEG), setas (BUM), dianas (DT),
     flippers (FL), bolas (BS; varias en el encierro). Física en pasos de 1/600 s.
   - Las rampas no son física: la bola sigue una curva (RAMPAS[i], Bézier) y cae en el pasillo del otro lado.
   - El fondo fijo (bosque, Pirineos, río, setas, cartel, paredes) se pinta una vez en BG (hazFondo) para que vaya fluido.
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
.abCard{background:radial-gradient(circle at 50% 30%,#3a1450,#120a24 70%);color:#eef3ff;border-radius:16px;padding:16px;margin:10px 0;display:flex;flex-direction:column;gap:12px;text-align:center}
.abCard h2{margin:0;font-size:32px;letter-spacing:.08em;color:#ffd54f;text-shadow:0 0 12px #ff9800}.abCard .rec{font-size:15px}.abCard .rec b{color:#ffd54f;font-size:20px}
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
 <div class="jgNota">Toca la mitad izquierda o la derecha de la pantalla para cada flipper. Para lanzar, mantén pulsado el lado derecho y suelta. Cruza los puentes de Zubiri y Puente la Reina, tumba las dianas, entra en la cueva y enciende A·I·T·A. Cada misión enciende un pueblo de Navarra. Con los dos puentes cruzados, la cueva suelta el 🐂 encierro: ¡tres bolas a la vez!</div>
 <div class="abDed">En recuerdo de Aita, que siempre me ganaba. 💙</div>
</div>`);
const FS=document.createElement('div');FS.id='abFS';FS.setAttribute('data-noswipe','');
FS.innerHTML='<canvas id="abC"></canvas><button class="abB" id="abX" style="left:8px" aria-label="Salir">✕</button><button class="abB" id="abP" style="left:54px" aria-label="Pausa">⏸</button><button class="abB" id="abS" style="left:100px" aria-label="Sonido">🔊</button>';
document.body.appendChild(FS);

const C=$('abC');let x=C.getContext('2d');const W=400,H=780,TOP=90,R=8,G=1000;
let S=1,TT=0;   // escala de pantalla y reloj de las luces

/* ---------- carteles de lugares de Navarra ---------- */
const PLAC=[['Zubiri',112,500],['Aoiz',112,524],['Pamplona',112,548],['Irati',258,500],['Bardenas',258,524],['Urbasa',258,548]];   // carteles: se encienden con las misiones
/* ---------- la mesa ---------- */
const SEG=[];const seg=(x1,y1,x2,y2,o={})=>SEG.push(Object.assign({x1,y1,x2,y2,e:.4,k:0,p:0,f:0},o));
const ARCO=[];(function(){let px=20,py=290;for(let i=1;i<=28;i++){const a=Math.PI+Math.PI*i/28,nx=200+180*Math.cos(a),ny=290+180*Math.sin(a);seg(px,py,nx,ny);ARCO.push([nx,ny]);px=nx;py=ny;}})();
seg(20,290,20,610);            // pared izquierda
seg(380,290,380,772);          // pared derecha
seg(350,330,350,772);          // pared del carril de lanzar
seg(350,754,380,754);          // suelo del carril
seg(20,610,103,688);           // pasillo izquierdo → flipper
seg(350,610,267,688);          // pasillo derecho → flipper
seg(286,415,280,492);          // guía de la entrada del Puente de Zubiri (derecha)
seg(84,415,90,492);            // guía de la entrada de Puente la Reina (izquierda)
[[60,540,60,620,100,642],[310,540,310,620,270,642]].forEach(([ax,ay,bx,by,cx,cy])=>{seg(ax,ay,bx,by);seg(bx,by,cx,cy);seg(ax,ay,cx,cy,{e:.5,k:420,p:10,goma:1});});
const GOMAS=SEG.filter(s=>s.goma);
const BUM=[{x:185,y:300},{x:120,y:342},{x:250,y:342},{x:185,y:388}].map(b=>Object.assign(b,{r:19,f:0}));
const LET=[{x:100,y:242,c:'A'},{x:135,y:222,c:'I'},{x:235,y:222,c:'T'},{x:270,y:242,c:'A'}].map(l=>Object.assign(l,{on:false,cd:0}));
const DT=[[150,176],[182,208],[214,240]].map(([a,c])=>({x1:a,x2:c,y:455,up:true}));
const CUE={x:185,y:232};
const RAMPAS=[{n:'PUENTE DE ZUBIRI',p:[[318,412],[300,110],[400,140],[332,540]],sx:[290,346],out:[332,548],k:'zubiri'},
              {n:'PUENTE LA REINA',p:[[52,412],[70,110],[-30,140],[38,540]],sx:[24,82],out:[38,548],k:'reina'}];
const bez=(P,t)=>{const u=1-t,[a,b,c,d]=P;return [u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]];};
const FL=[{x:105,y:690,L:62,a0:.5,a1:-.5},{x:265,y:690,L:62,a0:Math.PI-.5,a1:Math.PI+.5}].map(f=>Object.assign(f,{a:f.a0,w:0,on:false}));
const MIS=[['zubiri','Cruza el puente de Zubiri',2],['dianas','Tumba las tres dianas',1],['reina','Cruza Puente la Reina',2],['aita','Enciende A·I·T·A',1],
           ['cueva','Entra en la cueva de Zugarramurdi',2],['setas','Golpea 25 setas',25],['puente','Cruza 3 puentes cualesquiera',3]];

/* ---------- estado ---------- */
let ACT=null,abierto=false;
let BS=[],b=null,pts=0,bolaN=1,quedan=3,mult=1,vivo=false,pausa=false,carga=0,cargando=false,raf=0,tUlt=0,flash=0,msg='',msgT=0;
let mi=0,mc=0,nivel=1,hechas=0,salva=0,salvaUsada=false,lanzada=false,encendidos=0,puentes={zubiri:false,reina:false},encierro=false,multi=false;
let rec=ls.get('bnJgAitaball',0),mudo=ls.get('bnJgAitaMudo',false);
$('abRec').textContent=fmt(rec);
const suma=n=>{pts+=n*mult;};
const aviso=(t,s=1.6)=>{msg=t;msgT=s;};
const nuevaB=(px=365,py=745,vx=0,vy=0)=>({x:px,y:py,vx,vy,ramp:null,rp:null,held:0,cueCd:0});
const bolaNueva=()=>{BS=[nuevaB()];carga=0;lanzada=false;salvaUsada=false;salva=0;multi=false;};

/* ---------- sonido (pitidos sencillos, sin archivos) ---------- */
let AC=null;
function son(f,d=.08,tp='square',v=.05,f2){if(mudo)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();
  const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type=tp;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.02);}catch(e){}}
const arpe=(L,d=.09)=>L.forEach((f,i)=>setTimeout(()=>son(f,.12,'square',.05),i*d*1000));

/* ---------- misiones, pueblos y encierro ---------- */
function evento(t){const m=MIS[mi];if(m[0]!==t&&!(m[0]==='puente'&&(t==='zubiri'||t==='reina')))return;mc++;if(mc<m[2])return;
  suma(5000*nivel);hechas++;mc=0;mi=(mi+1)%MIS.length;if(mi===0)nivel++;flash=.7;arpe([523,659,784,1047]);zumb([30,40,80]);
  encendidos++;const pu=PLAC[(encendidos-1)%PLAC.length][0];
  if(encendidos%PLAC.length===0){suma(50000);aviso('¡Navarra encendida!',3);arpe([523,659,784,1047,1319,1568],.1);}else aviso('✔ ¡Misión! · '+pu,2.2);
  if(hechas%3===0){quedan++;setTimeout(()=>aviso('¡Bola extra!',2),2300);}}
function puente(k){puentes[k]=true;if(!encierro&&puentes.zubiri&&puentes.reina&&!multi){encierro=true;setTimeout(()=>aviso('🐂 ¡Encierro listo! A la cueva',2.2),1700);}}
function sueltaEncierro(){encierro=false;puentes={zubiri:false,reina:false};multi=true;aviso('🐂 ¡ENCIERRO! Multibola',2.5);flash=1;arpe([392,392,523,659,784],.12);zumb([50,50,50,50,120]);
  salva=Math.max(salva,10);salvaUsada=false;
  setTimeout(()=>{if(vivo)BS.push(nuevaB(365,745,0,-2100));},500);setTimeout(()=>{if(vivo)BS.push(nuevaB(365,745,0,-2000));},1300);}

/* ---------- física ---------- */
function choca(s,rad){const dx=s.x2-s.x1,dy=s.y2-s.y1,l2=dx*dx+dy*dy;let t=((b.x-s.x1)*dx+(b.y-s.y1)*dy)/l2;t=t<0?0:t>1?1:t;
  const qx=s.x1+t*dx,qy=s.y1+t*dy;let nx=b.x-qx,ny=b.y-qy;const d=Math.hypot(nx,ny),rr=R+rad;
  if(d>=rr||d<1e-6)return null;nx/=d;ny/=d;b.x=qx+nx*rr;b.y=qy+ny*rr;return {nx,ny,qx,qy};}
function rebota(nx,ny,e,ux=0,uy=0){const vn=(b.vx-ux)*nx+(b.vy-uy)*ny;if(vn>=0)return 0;b.vx-=(1+e)*vn*nx;b.vy-=(1+e)*vn*ny;return -vn;}
function pasoBola(dt){
  if(b.ramp!=null){const Rp=RAMPAS[b.rp];b.ramp+=dt/1.15;const [px,py]=bez(Rp.p,Math.min(1,b.ramp));b.x=px;b.y=py;
    if(b.ramp>=1){b.ramp=null;b.x=Rp.out[0];b.y=Rp.out[1];b.vx=0;b.vy=320;suma(2000);evento(Rp.k);puente(Rp.k);aviso('🌉 '+Rp.n.charAt(0)+Rp.n.slice(1).toLowerCase());son(880,.25,'triangle',.06,440);}return;}
  if(b.held>0){b.held-=dt;if(b.held<=0){b.vx=(Math.random()<.5?-1:1)*(150+Math.random()*120);b.vy=260;b.cueCd=.8;son(200,.2,'sawtooth',.05,600);}return;}
  const py0=b.y;
  b.vy+=G*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.cueCd=Math.max(0,b.cueCd-dt);
  if(!lanzada&&b.x<340){lanzada=true;salva=Math.max(salva,8);}
  // entradas de los puentes: cruzar hacia arriba la línea y=420 por su pasillo, con fuerza
  if(py0>=420&&b.y<420&&b.vy<-380)for(let i=0;i<RAMPAS.length;i++){const s=RAMPAS[i].sx;if(b.x>s[0]&&b.x<s[1]){b.ramp=0;b.rp=i;son(330,.3,'triangle',.06,990);return;}}
  SEG.forEach(s=>{const c=choca(s,0);if(!c)return;const v=rebota(c.nx,c.ny,s.e);
    if(s.k&&v>40){b.vx+=c.nx*s.k;b.vy+=c.ny*s.k;s.f=.15;suma(s.p);son(440,.05);zumb(10);}});
  BUM.forEach(m=>{let nx=b.x-m.x,ny=b.y-m.y;const d=Math.hypot(nx,ny),rr=R+m.r;if(d>=rr||d<1e-6)return;nx/=d;ny/=d;b.x=m.x+nx*rr;b.y=m.y+ny*rr;
    if(rebota(nx,ny,.6)>0){b.vx+=nx*380;b.vy+=ny*380;m.f=.25;suma(100);evento('setas');son(560+BUM.indexOf(m)*60,.06);zumb(16);}});
  DT.forEach(t=>{if(!t.up)return;const c=choca({x1:t.x1,y1:t.y,x2:t.x2,y2:t.y},4);if(!c)return;
    if(rebota(c.nx,c.ny,.3)>60){t.up=false;suma(500);son(520,.08);zumb(14);
      if(DT.every(z=>!z.up)){suma(3000);evento('dianas');aviso('🎯 ¡Dianas!');setTimeout(()=>DT.forEach(z=>z.up=true),1500);}}});
  FL.forEach(f=>{const s={x1:f.x,y1:f.y,x2:f.x+f.L*Math.cos(f.a),y2:f.y+f.L*Math.sin(f.a)};const c=choca(s,6);if(!c)return;
    const rx=c.qx-f.x,ry=c.qy-f.y;rebota(c.nx,c.ny,.3,-f.w*ry,f.w*rx);});
  LET.forEach(l=>{if(l.cd>0||Math.hypot(b.x-l.x,b.y-l.y)>R+10)return;l.cd=.5;if(l.on)return;l.on=true;suma(50);son(990,.05,'sine',.06);
    if(LET.every(z=>z.on)){suma(1000);mult=Math.min(5,mult+1);aviso('¡A·I·T·A!  ×'+mult);flash=.6;evento('aita');arpe([392,523,659]);setTimeout(()=>LET.forEach(z=>z.on=false),900);}});
  if(!b.cueCd&&Math.hypot(b.x-CUE.x,b.y-CUE.y)<14&&Math.hypot(b.vx,b.vy)<1200){b.x=CUE.x;b.y=CUE.y;b.vx=b.vy=0;b.held=1.2;suma(1000);evento('cueva');
    if(encierro&&!multi)sueltaEncierro();else aviso('🕳️ Cueva de Zugarramurdi');son(150,.4,'sawtooth',.05,60);return;}
  const v=Math.hypot(b.vx,b.vy);if(v>2200){b.vx*=2200/v;b.vy*=2200/v;}}
function paso(dt){
  FL.forEach(f=>{const obj=f.on?f.a1:f.a0,d=obj-f.a,q=24*dt;if(Math.abs(d)<=q){f.a=obj;f.w=0;}else{f.w=Math.sign(d)*24;f.a+=f.w*dt;}});
  for(let i=BS.length-1;i>=0;i--){b=BS[i];if(!b)continue;pasoBola(dt);if(b.y>H+R*2){BS.splice(i,1);cae();}}
  // choques entre bolas (encierro)
  for(let i=0;i<BS.length;i++)for(let j=i+1;j<BS.length;j++){const p=BS[i],q=BS[j];if(p.ramp!=null||q.ramp!=null||p.held>0||q.held>0)continue;
    let nx=q.x-p.x,ny=q.y-p.y;const d=Math.hypot(nx,ny);if(d>=2*R||d<1e-6)continue;nx/=d;ny/=d;const o=(2*R-d)/2;p.x-=nx*o;p.y-=ny*o;q.x+=nx*o;q.y+=ny*o;
    const vn=(q.vx-p.vx)*nx+(q.vy-p.vy)*ny;if(vn<0){p.vx+=vn*nx*.95;p.vy+=vn*ny*.95;q.vx-=vn*nx*.95;q.vy-=vn*ny*.95;}}
  b=BS[0]||null;}
function cae(){
  if(salva>0&&!salvaUsada&&!BS.length){aviso('💙 Aita te devuelve la bola',2);son(523,.3,'sine',.06,784);salvaUsada=true;setTimeout(()=>{if(vivo&&!BS.length){BS=[nuevaB()];lanzada=false;}},800);return;}
  if(salva>0&&multi){setTimeout(()=>{if(vivo)BS.push(nuevaB(365,745,0,-2000));},600);return;}   // en el encierro, mientras dura la protección
  if(BS.length){if(BS.length===1&&multi){multi=false;aviso('Fin del encierro',1.6);}return;}
  quedan--;bolaN++;son(220,.5,'sawtooth',.06,55);zumb([40,40,90]);multi=false;
  if(quedan<=0){fin();return;}aviso('Bola '+bolaN,1.4);setTimeout(()=>{if(vivo)bolaNueva();},1000);}
const enCarril=()=>BS.find(q=>q.ramp==null&&q.x>350&&q.y>730&&Math.abs(q.vy)<40);
function lanza(){const q=enCarril();if(!q){carga=0;return;}if(carga>.04){q.vy=-(1150+1250*Math.min(1,carga));son(300,.25,'triangle',.06,900);zumb(15);}carga=0;}

/* ---------- dibujo ---------- */
function rr(px,py,w,h,r){x.beginPath();x.moveTo(px+r,py);x.arcTo(px+w,py,px+w,py+h,r);x.arcTo(px+w,py+h,px,py+h,r);x.arcTo(px,py+h,px,py,r);x.arcTo(px,py,px+w,py,r);x.closePath();}
function txt(t,px,py,f,c,al='center'){x.font=f;x.fillStyle=c;x.textAlign=al;x.textBaseline='middle';x.fillText(t,px,py);}
function bombi(px,py,r,col,on){if(on){const g=x.createRadialGradient(px,py,0,px,py,r*2.6);g.addColorStop(0,col);g.addColorStop(.35,col+'cc');g.addColorStop(1,col+'00');
    x.fillStyle=g;x.beginPath();x.arc(px,py,r*2.6,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(px,py,r*.55,0,7);x.fill();}
  else{x.fillStyle=col+'44';x.beginPath();x.arc(px,py,r,0,7);x.fill();x.strokeStyle=col+'88';x.lineWidth=1;x.stroke();}}
function flecha(px,py,ang,col,on){x.save();x.translate(px,py);x.rotate(ang);x.fillStyle=on?col:col+'40';if(on){x.shadowColor=col;x.shadowBlur=12;}
  x.beginPath();x.moveTo(0,-9);x.lineTo(8,5);x.lineTo(0,1);x.lineTo(-8,5);x.closePath();x.fill();x.restore();}
function marcador(){x.fillStyle='#000';x.fillRect(0,0,W,TOP);x.strokeStyle='#ff8f00';x.globalAlpha=.5;x.lineWidth=2;rr(152,6,242,78,8);x.stroke();x.globalAlpha=1;
  txt(fmt(pts),386,30,'bold 28px ui-monospace,Menlo,monospace','#ffb300','right');
  txt('Bola '+Math.min(bolaN,99)+(quedan>1?' (+'+(quedan-1)+')':'')+'   ×'+mult+(salva>0&&!salvaUsada&&lanzada?'   💙':'')+(multi?'   🐂':''),160,56,'14px ui-monospace,Menlo,monospace','#ffcc80','left');
  const m=MIS[mi];txt('▶ '+m[1]+(m[2]>1?'  '+mc+'/'+m[2]:''),160,74,'12px ui-monospace,Menlo,monospace','#ff8f00','left');
  txt('AITABALL',8,64,'bold 15px system-ui,sans-serif','#ffd54f','left');txt('Nivel '+nivel+' · '+(encendidos%PLAC.length)+'/6',8,80,'11px system-ui,sans-serif','#ffcc80','left');}
/* fondo fijo (bosque, Pirineos, río, setas, cartel «Aita · Pinball», paredes): se dibuja una vez en BG al ajustar la pantalla */
let BG=null;
function seta(px,py,s,tipo){x.save();x.translate(px,py);x.scale(s,s);
  if(tipo==='amanita'){x.fillStyle='#f5f0e1';x.fillRect(-4,0,8,14);x.fillStyle='#d32f2f';x.beginPath();x.ellipse(0,0,14,9,0,Math.PI,0);x.fill();
    x.fillStyle='#fff';[[-7,-4],[0,-7],[6,-3],[-2,-2]].forEach(([a,c])=>{x.beginPath();x.arc(a,c,1.6,0,7);x.fill();});}
  else if(tipo==='boletus'){x.fillStyle='#e8dcc0';x.beginPath();x.moveTo(-6,0);x.quadraticCurveTo(-9,10,-6,16);x.lineTo(6,16);x.quadraticCurveTo(9,10,6,0);x.fill();
    const g=x.createRadialGradient(-4,-6,1,0,-2,16);g.addColorStop(0,'#a1683a');g.addColorStop(1,'#5d3a1a');x.fillStyle=g;x.beginPath();x.ellipse(0,0,15,10,0,Math.PI,0);x.fill();}
  else if(tipo==='rebozuelo'){x.fillStyle='#f9a825';x.beginPath();x.moveTo(-2,14);x.lineTo(-11,-3);x.quadraticCurveTo(0,-8,11,-3);x.lineTo(2,14);x.closePath();x.fill();
    x.strokeStyle='#e65100';x.lineWidth=.8;for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(i*.8,12);x.lineTo(i*4,-3);x.stroke();}}
  else if(tipo==='colmenilla'){x.fillStyle='#e8dcc0';x.fillRect(-3,4,6,9);x.fillStyle='#795548';x.beginPath();x.ellipse(0,-2,6,10,0,0,7);x.fill();
    x.strokeStyle='#3e2723';x.lineWidth=.8;for(let i=-1;i<=1;i++){x.beginPath();x.moveTo(i*3,-11);x.lineTo(i*3,7);x.stroke();}for(let j=-2;j<=2;j++){x.beginPath();x.moveTo(-6,j*3.5);x.lineTo(6,j*3.5);x.stroke();}}
  x.restore();}
function helecho(px,py,s,ang){x.save();x.translate(px,py);x.rotate(ang);x.scale(s,s);x.strokeStyle='#4caf50';x.fillStyle='#66bb6a';x.lineWidth=1.4;
  x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(4,-20,0,-40);x.stroke();for(let i=1;i<9;i++){const t=i/9,yy=-40*t,l=10*(1-t)+2;
    [-1,1].forEach(d=>{x.beginPath();x.ellipse(d*l/2+2*t,yy,l/2,1.8,d*.35,0,7);x.fill();});}x.restore();}
function hoja(px,py,s,ang,col){x.save();x.translate(px,py);x.rotate(ang);x.scale(s,s);x.fillStyle=col;x.beginPath();x.moveTo(0,-8);
  for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;x.lineTo(8*Math.cos(a),8*Math.sin(a));x.lineTo(3.5*Math.cos(a+.63),3.5*Math.sin(a+.63));}x.closePath();x.fill();
  x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=.6;x.beginPath();x.moveTo(0,0);x.lineTo(0,10);x.stroke();x.restore();}
function pino(px,py,s){x.save();x.translate(px,py);x.scale(s,s);x.fillStyle='#4e342e';x.fillRect(-2,0,4,8);x.fillStyle='#1b5e20';
  [[0,-28,9],[0,-18,12],[0,-8,15]].forEach(([a,c,w])=>{x.beginPath();x.moveTo(a,c-10);x.lineTo(a+w,c+8);x.lineTo(a-w,c+8);x.closePath();x.fill();});x.restore();}
function pina(px,py,s){x.save();x.translate(px,py);x.scale(s,s);x.fillStyle='#6d4c2f';x.beginPath();x.ellipse(0,0,7,11,0,0,7);x.fill();x.strokeStyle='#3e2a17';x.lineWidth=1;
  for(let j=-8;j<=8;j+=4){x.beginPath();x.moveTo(-6,j);x.lineTo(6,j+3);x.stroke();x.beginPath();x.moveTo(6,j);x.lineTo(-6,j+3);x.stroke();}x.restore();}
function logoNA(px,py,r){const g=x.createLinearGradient(px-r,py-r,px+r,py+r);g.addColorStop(0,'#43a047');g.addColorStop(1,'#1565c0');x.beginPath();x.arc(px,py,r,0,7);x.fillStyle=g;x.fill();
  x.lineWidth=3;x.strokeStyle='#ffc94a';x.stroke();txt('NA',px,py+1,'bold '+Math.round(r*.9)+'px system-ui,sans-serif','#fff');
  x.fillStyle='#7cb342';x.beginPath();x.ellipse(px-4,py-r+1,4,7,-.6,0,7);x.fill();x.beginPath();x.ellipse(px+4,py-r+1,4,7,.6,0,7);x.fill();}
function hazFondo(){BG=document.createElement('canvas');BG.width=C.width;BG.height=C.height;const keep=x;x=BG.getContext('2d');x.setTransform(S,0,0,S,0,0);
  // mesa: verde de bosque
  const g=x.createLinearGradient(0,TOP,0,H);g.addColorStop(0,'#1e5631');g.addColorStop(.6,'#164426');g.addColorStop(1,'#0c2a16');x.fillStyle=g;x.fillRect(0,TOP,W,H-TOP);
  // cielo y Pirineos dentro del arco
  x.save();x.beginPath();x.arc(200,290,180,Math.PI,0);x.lineTo(380,300);x.lineTo(20,300);x.closePath();x.clip();
  const cg=x.createLinearGradient(0,110,0,300);cg.addColorStop(0,'#5b8fd6');cg.addColorStop(1,'#bcd7f0');x.fillStyle=cg;x.fillRect(0,100,W,200);
  x.fillStyle='#7a8aa6';x.beginPath();x.moveTo(20,300);[[40,230],[70,250],[105,190],[135,235],[170,175],[205,225],[240,165],[275,215],[310,185],[345,240],[380,215],[380,300]].forEach(([a,c])=>x.lineTo(a,c));x.closePath();x.fill();
  x.fillStyle='#eef3fb';[[105,190],[170,175],[240,165],[310,185]].forEach(([a,c])=>{x.beginPath();x.moveTo(a,c);x.lineTo(a+11,c+14);x.lineTo(a+3,c+11);x.lineTo(a-4,c+15);x.lineTo(a-11,c+13);x.closePath();x.fill();});
  x.fillStyle='#2e6b3a';x.beginPath();x.moveTo(20,300);[[60,262],[110,275],[160,255],[215,272],[265,252],[320,270],[380,258],[380,300]].forEach(([a,c])=>x.lineTo(a,c));x.closePath();x.fill();
  [[40,282,.7],[75,276,.8],[300,278,.75],[340,272,.85],[355,286,.6]].forEach(([a,c,s])=>pino(a,c,s));
  x.restore();
  x.fillStyle='#061a0d';x.beginPath();x.moveTo(0,TOP);x.lineTo(W,TOP);x.lineTo(W,290);x.arc(200,290,180,0,Math.PI,true);x.lineTo(0,290);x.closePath();x.fill();
  // hojas de otoño, helechos y piñas por la mesa
  for(let i=0;i<26;i++){const px=(i*83)%320+30,py=(i*137)%330+320;hoja(px,py,.9+(i%3)*.15,i,['#e65100','#c62828','#f9a825','#8d6e63'][i%4]+'99');}
  [[40,600,.8,-.3],[335,600,.8,.3],[120,640,.7,-.5],[250,640,.7,.5],[95,420,.6,-.2],[275,420,.6,.2]].forEach(([a,c,s,r])=>helecho(a,c,s,r));
  // río con cascada (abajo en el centro)
  x.save();x.beginPath();x.moveTo(160,610);x.bezierCurveTo(150,640,215,650,200,690);x.lineTo(230,690);x.bezierCurveTo(245,650,180,640,212,610);x.closePath();
  const rg=x.createLinearGradient(0,610,0,690);rg.addColorStop(0,'#4fc3f7');rg.addColorStop(1,'#0277bd');x.fillStyle=rg;x.fill();x.clip();
  x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=1.2;for(let i=0;i<8;i++){x.beginPath();x.moveTo(150,615+i*10);x.quadraticCurveTo(185,620+i*10,240,612+i*10);x.stroke();}x.restore();
  x.fillStyle='#6d6d6d';[[160,612,9],[214,610,8],[170,622,5]].forEach(([a,c,r])=>{x.beginPath();x.ellipse(a,c,r,r*.7,0,0,7);x.fill();});
  // boletus grande detrás del cartel
  seta(185,512,2.9,'boletus');
  // 🪵 cartel de madera: «Aita» y debajo «Pinball»
  x.save();x.translate(185,588);x.rotate(-.04);x.fillStyle='#4e342e';x.fillRect(-4,24,8,26);
  const mg=x.createLinearGradient(0,-28,0,28);mg.addColorStop(0,'#c8a27a');mg.addColorStop(1,'#8d6e4f');x.fillStyle=mg;rr(-78,-28,156,56,7);x.fill();x.lineWidth=2;x.strokeStyle='#5d4037';x.stroke();
  x.strokeStyle='rgba(93,64,55,.35)';x.lineWidth=1;for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(-74,i*10);x.bezierCurveTo(-30,i*10+4,20,i*10-4,74,i*10);x.stroke();}
  x.fillStyle='#5d4037';[[-70,-20],[70,-20],[-70,20],[70,20]].forEach(([a,c])=>{x.beginPath();x.arc(a,c,2,0,7);x.fill();});
  txt('Aita',0,-7,'bold 30px Georgia,"Times New Roman",serif','#2d1b10');txt('Pinball',0,17,'italic bold 15px Georgia,"Times New Roman",serif','#3e2723');x.restore();
  // esquinas de abajo (fuera del juego): setas, piñas y hojas
  seta(42,735,2.6,'amanita');seta(330,740,2.4,'boletus');seta(85,760,1.6,'rebozuelo');pina(300,715,1.1);pina(60,700,1);hoja(20,760,1.5,1,'#e65100');hoja(370,700,1.4,2,'#c62828');
  // logo NA entre los flippers
  logoNA(185,752,17);
  // paredes cromadas
  x.lineCap='round';const pw=()=>SEG.forEach(s=>{if(s.goma)return;x.beginPath();x.moveTo(s.x1,s.y1);x.lineTo(s.x2,s.y2);x.stroke();});
  x.lineWidth=8;x.strokeStyle='rgba(0,0,0,.45)';pw();x.lineWidth=5;x.strokeStyle='#b0bec5';pw();x.lineWidth=1.6;x.strokeStyle='#fff';pw();
  // gomas: plástico con setas dibujadas
  [[60,540,60,620,100,642],[310,540,310,620,270,642]].forEach(([ax,ay,bx,by,cx,cy],i)=>{x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.lineTo(cx,cy);x.closePath();
    x.fillStyle='rgba(255,193,7,.35)';x.fill();const mx=(ax+bx+cx)/3,my=(ay+by+cy)/3;seta(mx+(i?3:-3),my-6,.9,'amanita');seta(mx+(i?-5:5),my+10,.6,'amanita');});
  x=keep;}
function mesa(){
  if(BG)x.drawImage(BG,0,0,W,H);
  if(flash>0){x.fillStyle=`rgba(255,213,79,${flash*.25})`;x.fillRect(0,TOP,W,H-TOP);}
  // carteles de lugares (se encienden con las misiones)
  const nOn=encendidos%PLAC.length;
  PLAC.forEach(([n,px,py],i)=>{const on=i<nOn||(encendidos>0&&nOn===0&&flash>0);if(on){x.fillStyle='rgba(255,213,79,.35)';rr(px-30,py-11,60,22,6);x.fill();}
    const pg=x.createLinearGradient(0,py-9,0,py+9);pg.addColorStop(0,on?'#fff3c4':'#d7c2a0');pg.addColorStop(1,on?'#ffd54f':'#a1886a');x.fillStyle=pg;rr(px-26,py-9,52,18,5);x.fill();
    x.lineWidth=1.2;x.strokeStyle='#5d4037';x.stroke();bombi(px-19,py,2.6,'#ff9800',on);txt(n,px+4,py+1,'italic bold 9px Georgia,serif','#3e2723');});
  // arco de luces que corre
  ARCO.forEach(([px,py],i)=>{if(i%2)return;const col=['#ff5252','#ffd740','#69f0ae','#40c4ff','#e040fb'][(i/2|0)%5];const on=((TT*8|0)+i/2)%5===0||flash>0;
    bombi(px+(200-px)*.04,py+(290-py)*.04,3,col,on);});
  [[60,540,60,620,100,642,'#ffd740'],[310,540,310,620,270,642,'#ffd740']].forEach(([ax,ay,bx,by,cx,cy,col],i)=>{bombi(ax+4*(i?-1:1),ay+12,2.5,col,GOMAS[i].f>0||((TT*3|0)%2===i));bombi(cx+(i?8:-8),cy-6,2.5,col,GOMAS[i].f>0||((TT*3|0)%2!==i));});
  GOMAS.forEach(s=>{x.strokeStyle=s.f>0?'#fff':'#e0e0e0';x.lineWidth=6;x.beginPath();x.moveTo(s.x1,s.y1);x.lineTo(s.x2,s.y2);x.stroke();});
  // flechas de colores en las entradas de las rampas
  const chase=(TT*6|0)%4;
  [[318,'#40c4ff','#ff1744','zubiri'],[52,'#ff9100','#ffd600','reina']].forEach(([fx,c1,c2,k])=>{const hot=MIS[mi][0]===k||MIS[mi][0]==='puente'||!puentes[k];
    for(let j=0;j<3;j++)flecha(fx,486-j*22,0,j%2?c2:c1,hot&&(chase===j||chase===3));bombi(fx,506,3.5,c1,puentes[k]);});
  // 🕳️ cueva de Zugarramurdi (arriba en el centro), con una seta que brilla dentro
  x.save();x.fillStyle='#8d8178';x.beginPath();x.ellipse(CUE.x,CUE.y-4,34,26,0,Math.PI*1.02,Math.PI*1.98);x.lineTo(CUE.x+34,CUE.y+10);x.lineTo(CUE.x-34,CUE.y+10);x.closePath();x.fill();
  x.fillStyle='#6d625a';[[-24,-10],[-12,-22],[6,-24],[22,-14],[28,2],[-30,4]].forEach(([a,c])=>{x.beginPath();x.ellipse(CUE.x+a,CUE.y+c,8,6,a/20,0,7);x.fill();});
  const on=encierro||MIS[mi][0]==='cueva';const cg=x.createRadialGradient(CUE.x,CUE.y,1,CUE.x,CUE.y,20);cg.addColorStop(0,on&&(TT*4|0)%2?'#ffb74d':'#3e2723');cg.addColorStop(1,'#120a06');
  x.beginPath();x.ellipse(CUE.x,CUE.y+2,20,15,0,Math.PI,0);x.lineTo(CUE.x+20,CUE.y+12);x.lineTo(CUE.x-20,CUE.y+12);x.closePath();x.fillStyle=cg;x.fill();x.restore();
  seta(CUE.x,CUE.y+2,.8,'amanita');
  if(encierro)txt('🐂 ENCIERRO',CUE.x,CUE.y+24,'bold 10px system-ui,sans-serif',(TT*4|0)%2?'#ffd54f':'#ff7043');
  // letras A·I·T·A
  LET.forEach(l=>{if(l.on){x.fillStyle='rgba(255,213,79,.35)';x.beginPath();x.arc(l.x,l.y,20,0,7);x.fill();}x.beginPath();x.arc(l.x,l.y,12,0,7);x.fillStyle=l.on?'#ffd54f':'rgba(0,0,0,.35)';x.fill();
    x.lineWidth=2;x.strokeStyle='#ffd54f';x.stroke();txt(l.c,l.x,l.y+1,'bold 14px system-ui,sans-serif',l.on?'#2b2100':'#ffd54f');});
  // dianas: tacos de madera con seta
  DT.forEach((t,i)=>{const cx=(t.x1+t.x2)/2;if(t.up){const dg=x.createLinearGradient(0,t.y-12,0,t.y+6);dg.addColorStop(0,'#9e9e9e');dg.addColorStop(1,'#424242');x.fillStyle=dg;rr(t.x1,t.y-12,t.x2-t.x1,18,3);x.fill();
      x.fillStyle='#1b1b1b';rr(t.x1+3,t.y-10,t.x2-t.x1-6,14,2);x.fill();seta(cx,t.y-4,.55,['amanita','boletus','rebozuelo'][i]);}
    else{x.fillStyle='rgba(0,0,0,.4)';x.fillRect(t.x1,t.y-2,t.x2-t.x1,4);}
    const og=!t.up;x.fillStyle=og?'#ffeb3b':'rgba(255,235,59,.3)';x.beginPath();x.moveTo(cx-8,t.y+12);x.lineTo(cx+8,t.y+12);x.lineTo(cx+5,t.y+20);x.lineTo(cx-5,t.y+20);x.closePath();x.fill();});
  // 🍄 setas-bumper (amanita vista desde arriba) con anillo de luz
  BUM.forEach(m=>{const hit=m.f>0;const gl=x.createRadialGradient(m.x,m.y,m.r*.6,m.x,m.y,m.r+12);gl.addColorStop(0,hit?'rgba(255,241,118,.95)':'rgba(255,193,7,.6)');gl.addColorStop(1,'rgba(255,193,7,0)');
    x.fillStyle=gl;x.beginPath();x.arc(m.x,m.y,m.r+12,0,7);x.fill();
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2+TT*.8;bombi(m.x+(m.r+7)*Math.cos(a),m.y+(m.r+7)*Math.sin(a),1.8,'#fff59d',hit||k%4===((TT*5|0)%4));}
    const cap=x.createRadialGradient(m.x-6,m.y-7,2,m.x,m.y,m.r);cap.addColorStop(0,hit?'#ffcdd2':'#ff6659');cap.addColorStop(.6,'#d32f2f');cap.addColorStop(1,'#8e0000');
    x.beginPath();x.arc(m.x,m.y,m.r,0,7);x.fillStyle=cap;x.fill();x.lineWidth=2;x.strokeStyle='#f5f0e1';x.stroke();
    x.fillStyle='#fff';[[-8,-6,3.2],[5,-9,2.6],[1,2,3.4],[9,4,2.4],[-6,8,2.6],[-11,1,1.8]].forEach(([a,c,r])=>{x.beginPath();x.arc(m.x+a,m.y+c,r,0,7);x.fill();});});
  // multiplicadores
  [2,3,4,5].forEach((n,i)=>{const px=146+i*26,py=652,on=mult>=n;bombi(px,py,8,'#ff4081',on);txt('×'+n,px,py+1,'bold 10px system-ui,sans-serif',on?'#3a0016':'#ff80ab');});
  // luz de Aita (protección): el logo de abajo brilla
  const sv=salva>0&&!salvaUsada&&lanzada;if(sv&&(TT*4|0)%2){const lg=x.createRadialGradient(185,752,8,185,752,34);lg.addColorStop(0,'rgba(255,241,118,.9)');lg.addColorStop(1,'rgba(255,241,118,0)');x.fillStyle=lg;x.beginPath();x.arc(185,752,34,0,7);x.fill();logoNA(185,752,17);}
  // flippers
  FL.forEach(f=>{const tx=f.x+f.L*Math.cos(f.a),ty=f.y+f.L*Math.sin(f.a);x.strokeStyle='#b71c1c';x.lineWidth=16;x.beginPath();x.moveTo(f.x,f.y);x.lineTo(tx,ty);x.stroke();
    x.strokeStyle='#fffaf0';x.lineWidth=11;x.beginPath();x.moveTo(f.x,f.y);x.lineTo(tx,ty);x.stroke();x.fillStyle='#b0bec5';x.beginPath();x.arc(f.x,f.y,4,0,7);x.fill();});
  // muelle y luces del carril
  const my=758+carga*16;x.fillStyle='#555';x.fillRect(357,my,16,H-my);x.strokeStyle='#999';x.lineWidth=2;for(let yy=my+4;yy<H;yy+=5){x.beginPath();x.moveTo(357,yy);x.lineTo(373,yy+2);x.stroke();}
  const lc=enCarril();for(let i=0;i<8;i++)bombi(365,710-i*44,3.5,['#ff5252','#ffd740','#69f0ae','#40c4ff'][i%4],lc?((TT*10|0)%8===i):i<carga*8);
  // bolas (debajo de las rampas)
  BS.forEach(q=>{if(q.ramp==null)bola(q);});
  // 🎢 rampas de alambre cromado (por encima de todo), con bombillas
  RAMPAS.forEach((Rp,i)=>{x.save();x.lineCap='round';x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=26;camino(Rp.p,0,6);
    for(let k=0;k<=24;k++){const t=k/24,[ax,ay]=bez(Rp.p,t),[bx2,by2]=bez(Rp.p,Math.min(1,t+.01));const nx=-(by2-ay),ny=bx2-ax,d=Math.hypot(nx,ny)||1;
      x.strokeStyle='rgba(176,190,197,.8)';x.lineWidth=1.5;x.beginPath();x.moveTo(ax+nx/d*10,ay+ny/d*10);x.lineTo(ax-nx/d*10,ay-ny/d*10);x.stroke();}
    [10,-10].forEach(o=>{x.strokeStyle='#546e7a';x.lineWidth=4.5;camino(Rp.p,o,0);x.strokeStyle='#eceff1';x.lineWidth=2;camino(Rp.p,o,0);});
    for(let k=1;k<10;k++){const [px,py]=bez(Rp.p,k/10);bombi(px,py,2.2,i?'#ffab40':'#80d8ff',puentes[Rp.k]||((TT*7|0)%9===k-1));}x.restore();
    const lx=i?55:318;x.fillStyle='rgba(0,0,0,.6)';rr(lx-38,392,76,15,7);x.fill();txt(Rp.n.replace('PUENTE ','P. '),lx,400,'bold 8px system-ui,sans-serif',i?'#ffab40':'#80d8ff');});
  BS.forEach(q=>{if(q.ramp!=null)bola(q,1.25);});
  if(msgT>0){x.fillStyle=`rgba(0,0,0,${Math.min(.72,msgT)})`;rr(45,118,280,40,12);x.fill();x.strokeStyle='#ffd54f';x.lineWidth=1.5;x.stroke();txt(msg,185,139,'bold 18px system-ui,sans-serif','#ffd54f');}}
// camino de una rampa, desplazado «o» hacia un lado (raíles) y «dy» hacia abajo (sombra)
function camino(P,o,dy=0){x.beginPath();for(let i=0;i<=48;i++){const t=i/48,[px,py]=bez(P,t),[qx,qy]=bez(P,Math.min(1,t+.01)),[rx,ry]=bez(P,Math.max(0,t-.01));
  let nx=-(qy-ry),ny=qx-rx;const d=Math.hypot(nx,ny)||1;nx/=d;ny/=d;const X=px+nx*o,Y=py+ny*o+dy;i?x.lineTo(X,Y):x.moveTo(X,Y);}x.stroke();}
function bola(q,k=1){const r=R*k,gb=x.createRadialGradient(q.x-3*k,q.y-3*k,1,q.x,q.y,r);gb.addColorStop(0,'#fff');gb.addColorStop(.5,'#cfd8dc');gb.addColorStop(1,'#546e7a');
  x.shadowColor='rgba(0,0,0,.6)';x.shadowBlur=6;x.shadowOffsetY=3;x.beginPath();x.arc(q.x,q.y,r,0,7);x.fillStyle=gb;x.fill();x.shadowBlur=0;x.shadowOffsetY=0;}
function pinta(){x.setTransform(S,0,0,S,0,0);mesa();marcador();}
function velo(t1,t2,t3){pinta();x.fillStyle='rgba(8,6,26,.78)';x.fillRect(0,TOP,W,H-TOP);txt(t1,W/2,360,'bold 40px system-ui,sans-serif','#ffd54f');
  if(t2)txt(t2,W/2,405,'19px system-ui,sans-serif','#fff');if(t3)txt(t3,W/2,440,'italic 16px system-ui,sans-serif','#cfd8dc');}

/* ---------- bucle ---------- */
function bucle(t){raf=requestAnimationFrame(bucle);const dt=Math.min(1/30,(t-tUlt)/1000||0);tUlt=t;TT+=dt;if(!vivo||pausa)return;
  if(cargando&&enCarril())carga=Math.min(1,carga+dt);
  const n=Math.ceil(dt/(1/600));for(let i=0;i<n;i++)paso(dt/n);
  BUM.forEach(m=>m.f=Math.max(0,m.f-dt));GOMAS.forEach(s=>s.f=Math.max(0,s.f-dt));LET.forEach(l=>l.cd=Math.max(0,l.cd-dt));
  if(!vivo)return;   // la partida acaba de terminar: no tapar la pantalla de «Fin»
  if(lanzada&&salva>0)salva=Math.max(0,salva-dt);flash=Math.max(0,flash-dt);msgT=Math.max(0,msgT-dt);pinta();}
function empieza(){pts=0;bolaN=1;quedan=3;mult=1;mi=0;mc=0;nivel=1;hechas=0;encendidos=0;encierro=false;puentes={zubiri:false,reina:false};
  LET.forEach(l=>l.on=false);DT.forEach(t=>t.up=true);FL.forEach(f=>{f.on=false;f.a=f.a0;});
  bolaNueva();vivo=true;pausa=false;aviso('¡A por Aita!',1.8);arpe([392,494,587,784]);cancelAnimationFrame(raf);tUlt=performance.now();raf=requestAnimationFrame(bucle);}
function fin(){vivo=false;cancelAnimationFrame(raf);BS=[];const nuevo=pts>rec;if(nuevo){rec=pts;ls.set('bnJgAitaball',rec);$('abRec').textContent=fmt(rec);arpe([523,659,784,1047,1319],.12);}
  velo(nuevo?'🏆 ¡Récord!':'Fin de partida',fmt(pts)+' puntos','Aita estaría orgulloso');setTimeout(()=>{if(!vivo&&abierto)txt('Toca para jugar otra vez',W/2,500,'16px system-ui,sans-serif','#ffcc80');},600);}
function para(){if(!vivo||pausa)return;pausa=true;FL.forEach(f=>f.on=false);cargando=false;DED.clear();velo('⏸️ En pausa','Toca para seguir','');}

/* ---------- pantalla completa ---------- */
function ajusta(){const w=window.innerWidth,h=window.innerHeight,dpr=Math.min(2,window.devicePixelRatio||1);const s=Math.min(w/W,h/H);
  C.style.width=Math.floor(W*s)+'px';C.style.height=Math.floor(H*s)+'px';C.width=Math.floor(W*s*dpr);C.height=Math.floor(H*s*dpr);S=C.width/W;hazFondo();
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
window.AB_T={SEG,BUM,FL,LET,DT,paso,get BS(){return BS;},set BS(v){BS=v;},estado:()=>({encierro,multi,puentes,encendidos,pts})};   // para pruebas
})();
