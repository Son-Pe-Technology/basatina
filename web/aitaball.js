/* =====================================================================
   🕹️ AITABALL (26 nov. 2026) — el pinball de BasatiNA, a pantalla completa
   Lo pidió Pedro, en recuerdo de su padre (Aita): jugaban al pinball en el ordenador
   a ver quién era el mejor, y Aita le ganaba siempre. (Pedro quería el «3D Pinball Space Cadet»
   de Windows: no se copia, tiene derechos de autor.)

   5.ª versión (26 nov. 2026): LA MESA ES EL DIBUJO QUE TRAJO PEDRO (web/aitaball-mesa.webp),
   con el cartel cambiado a «Aita · Pinball» y sin los flippers dibujados (se pintan encima los que se mueven).
   La física está colocada encima del dibujo: I(x,y) pasa de píxeles del dibujo (1086×1448) a la mesa.
   - Setas-bumper: las 3 setas rojas del dibujo (100). Gomas: los 2 triángulos cromados (10).
   - Rampas: las de alambre del dibujo. Derecha = 🌉 Puente de Zubiri; izquierda = 🌉 Puente la Reina (2000).
     Se entra subiendo con fuerza por la boca de cada una (las flechas brillan); la bola recorre la curva y baja por su lado.
   - Dianas: las 3 del centro (500; las tres: +3000). Al tumbarlas se tapan.
   - Cueva de Zugarramurdi: la cueva de arriba (1000). 🐂 Encierro (multibola): cruza los dos puentes y mete la bola en la cueva.
   - Letras A·I·T·A arriba (50; las cuatro: +1000 y multiplicador hasta ×5, luces ×2…×5 encima del río).
   - Carteles del dibujo (Boletus, Níscalo, Rebozuelo, Perretxiko, Colmenilla, Otras): cada misión enciende uno;
     con los seis: «¡Navarra encendida!» (+50 000). Cada 3 misiones, bola extra.
   - 💙 «Aita te devuelve la bola»: los primeros 8 s de cada bola; el logo NA brilla.
   - Carril de lanzar: a la derecha del dibujo (lo pinta el juego).

   CONTROLES: mitad izquierda / derecha de la pantalla = flippers (varios dedos). Lanzar: mantén el lado
   derecho con la bola en el carril y suelta. Teclado: ← Z / → M / espacio ↓. «Atrás» del móvil: sale.

   CÓMO ESTÁ HECHO
   - Mesa de 430×623 (marcador en los 90 de arriba; dibujo de 400 de ancho; carril de 398 a 428).
     Paredes = segmentos (SEG, invisibles: se ven los raíles del dibujo), setas (BUM), dianas (DT), flippers (FL),
     bolas (BS; varias en el encierro). Física en pasos de 1/600 s. Las rampas no son física: la bola sigue una curva (Bézier).
   - El fondo (dibujo + carril) se pinta una vez en BG (hazFondo) para que vaya fluido.
   - Probado con una simulación de 300 bolas (sin atascos) y pintando la mesa con @napi-rs/canvas en Node.
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

const C=$('abC');let x=C.getContext('2d');const W=430,H=623,TOP=90,R=8,G=1000;
let S=1,TT=0;   // escala de pantalla y reloj de las luces

/* ---------- la mesa (encima del dibujo de Pedro: aitaball-mesa.webp, 1086×1448 escalado a 400 de ancho) ---------- */
const IS=400/1086,I=(ix,iy)=>[ix*IS,TOP+iy*IS];   // de píxeles del dibujo a la mesa
const SEG=[];const seg=(x1,y1,x2,y2,o={})=>SEG.push(Object.assign({x1,y1,x2,y2,e:.4,k:0,p:0,f:0},o));
const segI=(a,b,o)=>seg(...I(...a),...I(...b),o);
const ARCO=[];(function(){let px=18,py=230;for(let i=1;i<=30;i++){const a=Math.PI+Math.PI*i/30,nx=223+205*Math.cos(a),ny=230+92*Math.sin(a);seg(px,py,nx,ny);ARCO.push([nx,ny]);px=nx;py=ny;}})();
seg(18,230,18,473);             // pared izquierda
seg(384,240,384,473);           // pared derecha de la mesa
seg(18,473,76,496);             // pasillo izquierdo → acaba un poco por encima del flipper (si no, la bola se queda en el eje)
seg(384,473,323.7,496);         // pasillo derecho → igual
seg(398,262,398,H+8);           // carril de lanzar (dentro)
seg(384,240,398,262);           // tapa la rendija entre la mesa y el carril (la bola cae al carril)
seg(428,230,428,H+8);           // carril de lanzar (fuera)
seg(398,612,428,612);           // suelo del carril
// guías de las bocas de las rampas (los raíles del dibujo)
segI([265,330],[262,520]);segI([368,420],[372,520]);
segI([821,330],[824,520]);segI([718,420],[714,520]);
// gomas (los triángulos cromados del dibujo): el lado que mira al centro empuja
[[[170,800],[160,1010],[340,1075]],[[916,800],[926,1010],[746,1075]]].forEach(([A,B,Cc])=>{segI(A,B);segI(B,Cc);segI(A,Cc,{e:.5,k:420,p:10,goma:1});});
const GOMAS=SEG.filter(s=>s.goma);
const BUM=[[565,282],[428,338],[707,338]].map(([a,c])=>{const [px,py]=I(a,c);return {x:px,y:py,r:20,f:0};});
const LET=[[140,178,'A'],[170,160,'I'],[248,160,'T'],[278,178,'A']].map(([px,py,c])=>({x:px,y:py,c,on:false,cd:0}));
const DT=[[440,505],[520,585],[605,670]].map(([a,c])=>({x1:a*IS,x2:c*IS,y:TOP+478*IS,up:true}));
const CUE=(()=>{const [px,py]=I(568,195);return {x:px,y:py};})();
const RAMPA_Y=TOP+400*IS;       // línea de entrada de las rampas
const RAMPAS=[{n:'Puente de Zubiri',p:[[283,RAMPA_Y],[285,120],[395,140],[362,395]],sx:[266,301],out:[362,400],k:'zubiri'},
              {n:'Puente la Reina',p:[[117,RAMPA_Y],[115,120],[5,140],[40,395]],sx:[99,135],out:[40,400],k:'reina'}];
const bez=(P,t)=>{const u=1-t,[a,b,c,d]=P;return [u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]];};
const FL=[{x:82.9,y:508,L:104,a0:.5,a1:-.5},{x:316.8,y:508,L:104,a0:Math.PI-.5,a1:Math.PI+.5}].map(f=>Object.assign(f,{a:f.a0,w:0,on:false}));
// carteles del dibujo (se encienden con las misiones): [nombre, x0, y0, x1, y1] en píxeles del dibujo
const PLAC=[['Boletus',200,607,345,650],['Níscalo',185,665,340,708],['Rebozuelo',175,725,342,768],['Perretxiko',745,607,880,650],['Colmenilla',752,665,895,708],['Otras',760,725,905,768]];
// flechas del dibujo que se iluminan (bocas de las rampas)
const FLE=[[[290,495],[290,540],[290,580],[350,470]],[[810,535],[810,578],[790,470],[810,365]]];
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
const nuevaB=(px=413,py=604,vx=0,vy=0)=>({x:px,y:py,vx,vy,ramp:null,rp:null,held:0,cueCd:0});
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
  setTimeout(()=>{if(vivo)BS.push(nuevaB(413,604,0,-1900));},500);setTimeout(()=>{if(vivo)BS.push(nuevaB(413,604,0,-1800));},1300);}

/* ---------- física ---------- */
function choca(s,rad){const dx=s.x2-s.x1,dy=s.y2-s.y1,l2=dx*dx+dy*dy;let t=((b.x-s.x1)*dx+(b.y-s.y1)*dy)/l2;t=t<0?0:t>1?1:t;
  const qx=s.x1+t*dx,qy=s.y1+t*dy;let nx=b.x-qx,ny=b.y-qy;const d=Math.hypot(nx,ny),rr=R+rad;
  if(d>=rr||d<1e-6)return null;nx/=d;ny/=d;b.x=qx+nx*rr;b.y=qy+ny*rr;return {nx,ny,qx,qy};}
function rebota(nx,ny,e,ux=0,uy=0){const vn=(b.vx-ux)*nx+(b.vy-uy)*ny;if(vn>=0)return 0;b.vx-=(1+e)*vn*nx;b.vy-=(1+e)*vn*ny;return -vn;}
function pasoBola(dt){
  if(b.ramp!=null){const Rp=RAMPAS[b.rp];b.ramp+=dt/1.15;const [px,py]=bez(Rp.p,Math.min(1,b.ramp));b.x=px;b.y=py;
    if(b.ramp>=1){b.ramp=null;b.x=Rp.out[0];b.y=Rp.out[1];b.vx=0;b.vy=320;suma(2000);evento(Rp.k);puente(Rp.k);aviso('🌉 '+Rp.n);son(880,.25,'triangle',.06,440);}return;}
  if(b.held>0){b.held-=dt;if(b.held<=0){b.vx=(Math.random()<.5?-1:1)*(150+Math.random()*120);b.vy=260;b.cueCd=.8;son(200,.2,'sawtooth',.05,600);}return;}
  const py0=b.y;
  b.vy+=G*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.cueCd=Math.max(0,b.cueCd-dt);
  if(!lanzada&&b.x<390){lanzada=true;salva=Math.max(salva,8);}
  // entradas de los puentes: cruzar hacia arriba la línea y=420 por su pasillo, con fuerza
  if(py0>=RAMPA_Y&&b.y<RAMPA_Y&&b.vy<-380)for(let i=0;i<RAMPAS.length;i++){const s=RAMPAS[i].sx;if(b.x>s[0]&&b.x<s[1]){b.ramp=0;b.rp=i;son(330,.3,'triangle',.06,990);return;}}
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
  if(salva>0&&multi){setTimeout(()=>{if(vivo)BS.push(nuevaB(413,604,0,-1800));},600);return;}   // en el encierro, mientras dura la protección
  if(BS.length){if(BS.length===1&&multi){multi=false;aviso('Fin del encierro',1.6);}return;}
  quedan--;bolaN++;son(220,.5,'sawtooth',.06,55);zumb([40,40,90]);multi=false;
  if(quedan<=0){fin();return;}aviso('Bola '+bolaN,1.4);setTimeout(()=>{if(vivo)bolaNueva();},1000);}
const enCarril=()=>BS.find(q=>q.ramp==null&&q.x>398&&q.y>585&&Math.abs(q.vy)<40);
function lanza(){const q=enCarril();if(!q){carga=0;return;}if(carga>.04){q.vy=-(1050+950*Math.min(1,carga));son(300,.25,'triangle',.06,900);zumb(15);}carga=0;}

/* ---------- dibujo ---------- */
function rr(px,py,w,h,r){x.beginPath();x.moveTo(px+r,py);x.arcTo(px+w,py,px+w,py+h,r);x.arcTo(px+w,py+h,px,py+h,r);x.arcTo(px,py+h,px,py,r);x.arcTo(px,py,px+w,py,r);x.closePath();}
function txt(t,px,py,f,c,al='center'){x.font=f;x.fillStyle=c;x.textAlign=al;x.textBaseline='middle';x.fillText(t,px,py);}
function bombi(px,py,r,col,on){if(on){const g=x.createRadialGradient(px,py,0,px,py,r*2.6);g.addColorStop(0,col);g.addColorStop(.35,col+'cc');g.addColorStop(1,col+'00');
    x.fillStyle=g;x.beginPath();x.arc(px,py,r*2.6,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(px,py,r*.55,0,7);x.fill();}
  else{x.fillStyle=col+'44';x.beginPath();x.arc(px,py,r,0,7);x.fill();x.strokeStyle=col+'88';x.lineWidth=1;x.stroke();}}
function flecha(px,py,ang,col,on){x.save();x.translate(px,py);x.rotate(ang);x.fillStyle=on?col:col+'40';if(on){x.shadowColor=col;x.shadowBlur=12;}
  x.beginPath();x.moveTo(0,-9);x.lineTo(8,5);x.lineTo(0,1);x.lineTo(-8,5);x.closePath();x.fill();x.restore();}
function marcador(){x.fillStyle='#000';x.fillRect(0,0,W,TOP);x.strokeStyle='#ff8f00';x.globalAlpha=.5;x.lineWidth=2;rr(152,6,W-158,78,8);x.stroke();x.globalAlpha=1;
  txt(fmt(pts),W-14,30,'bold 28px ui-monospace,Menlo,monospace','#ffb300','right');
  txt('Bola '+Math.min(bolaN,99)+(quedan>1?' (+'+(quedan-1)+')':'')+'   ×'+mult+(salva>0&&!salvaUsada&&lanzada?'   💙':'')+(multi?'   🐂':''),160,56,'14px ui-monospace,Menlo,monospace','#ffcc80','left');
  const m=MIS[mi];txt('▶ '+m[1]+(m[2]>1?'  '+mc+'/'+m[2]:''),160,74,'12px ui-monospace,Menlo,monospace','#ff8f00','left');
  txt('AITABALL',8,64,'bold 15px system-ui,sans-serif','#ffd54f','left');txt('Nivel '+nivel+' · '+(encendidos%PLAC.length)+'/6',8,80,'11px system-ui,sans-serif','#ffcc80','left');}
/* fondo fijo: el dibujo de Pedro + el carril de lanzar; se pinta una vez en BG al ajustar la pantalla */
let BG=null;const IMG=new Image();IMG.onload=()=>{if(abierto)ajusta();};IMG.src='aitaball-mesa.webp';
function hazFondo(){BG=document.createElement('canvas');BG.width=C.width;BG.height=C.height;const keep=x;x=BG.getContext('2d');x.setTransform(S,0,0,S,0,0);
  x.fillStyle='#0b2a12';x.fillRect(0,TOP,W,H-TOP);
  try{if(IMG.complete&&IMG.naturalWidth)x.drawImage(IMG,0,TOP,400,1448*IS);}catch(e){}
  // carril de lanzar (a la derecha del dibujo)
  const lg=x.createLinearGradient(398,0,428,0);lg.addColorStop(0,'#263238');lg.addColorStop(.5,'#37474f');lg.addColorStop(1,'#263238');x.fillStyle=lg;x.fillRect(398,170,30,H-170);
  x.lineCap='round';[[398,262,398,H],[428,200,428,H]].forEach(([a,b,c,d])=>{x.strokeStyle='#546e7a';x.lineWidth=5;x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke();x.strokeStyle='#eceff1';x.lineWidth=1.6;x.stroke();});
  x=keep;}
function mesa(){
  if(BG)x.drawImage(BG,0,0,W,H);
  if(flash>0){x.fillStyle=`rgba(255,213,79,${flash*.22})`;x.fillRect(0,TOP,W,H-TOP);}
  // carteles: apagados un poco oscuros, encendidos con brillo dorado
  const nOn=encendidos%PLAC.length;
  PLAC.forEach(([n,a,b2,c,d],i)=>{const on=i<nOn||(encendidos>0&&nOn===0&&flash>0);const [x0,y0]=I(a,b2),[x1,y1]=I(c,d);
    if(on){x.fillStyle='rgba(255,224,130,.38)';rr(x0-3,y0-3,x1-x0+6,y1-y0+6,7);x.fill();x.strokeStyle='#ffd54f';x.lineWidth=2;x.stroke();}
    else{x.fillStyle='rgba(0,0,0,.32)';rr(x0,y0,x1-x0,y1-y0,6);x.fill();}});
  // flechas de las rampas: brillan cuando toca ir allí
  const chase=(TT*6|0)%4;
  FLE.forEach((L,i)=>{const k=i?'zubiri':'reina',hot=MIS[mi][0]===k||MIS[mi][0]==='puente'||!puentes[k];
    L.forEach((q,j)=>{if(hot&&(chase===j||chase===3)){const [px,py]=I(...q);halo(px,py,13,'255,236,179');}});});
  // cueva: brilla con el encierro listo o si es la misión
  if(encierro||MIS[mi][0]==='cueva'){if((TT*4|0)%2)halo(CUE.x,CUE.y,24,'255,152,0');}
  if(encierro)txt('🐂 ENCIERRO',CUE.x,CUE.y-18,'bold 10px system-ui,sans-serif',(TT*4|0)%2?'#ffd54f':'#ff7043');
  // letras A·I·T·A
  LET.forEach(l=>{if(l.on)halo(l.x,l.y,18,'255,213,79');x.beginPath();x.arc(l.x,l.y,10,0,7);x.fillStyle=l.on?'#ffd54f':'rgba(0,0,0,.55)';x.fill();
    x.lineWidth=1.6;x.strokeStyle='#ffd54f';x.stroke();txt(l.c,l.x,l.y+1,'bold 12px system-ui,sans-serif',l.on?'#2b2100':'#ffd54f');});
  // dianas tumbadas: se tapan (hundidas)
  DT.forEach(t=>{if(!t.up){x.fillStyle='rgba(10,10,10,.82)';rr(t.x1-1,t.y-21,t.x2-t.x1+2,23,3);x.fill();}});
  // setas: destello al golpear
  BUM.forEach(m=>{if(m.f>0)halo(m.x,m.y,m.r+14,'255,255,220');});
  // gomas: destello al golpear
  GOMAS.forEach(s=>{if(s.f>0){x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=5;x.beginPath();x.moveTo(s.x1,s.y1);x.lineTo(s.x2,s.y2);x.stroke();}});
  // multiplicadores
  [2,3,4,5].forEach((n,i)=>{const px=167+i*22,py=487,on=mult>=n;if(on)halo(px,py,11,'255,64,129');x.beginPath();x.arc(px,py,7,0,7);x.fillStyle=on?'#ff4081':'rgba(0,0,0,.55)';x.fill();
    x.lineWidth=1;x.strokeStyle='#ff80ab';x.stroke();txt('×'+n,px,py+1,'bold 8px system-ui,sans-serif',on?'#fff':'#ff80ab');});
  // luz de Aita (protección): el logo NA brilla
  if(salva>0&&!salvaUsada&&lanzada&&(TT*4|0)%2)halo(200,528,34,'255,241,118');
  // flippers (como los del dibujo: blancos con borde rojo)
  FL.forEach(f=>{const tx=f.x+f.L*Math.cos(f.a),ty=f.y+f.L*Math.sin(f.a);x.lineCap='round';
    x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=24;x.beginPath();x.moveTo(f.x+2,f.y+4);x.lineTo(tx+2,ty+4);x.stroke();
    x.strokeStyle='#b71c1c';x.lineWidth=22;x.beginPath();x.moveTo(f.x,f.y);x.lineTo(tx,ty);x.stroke();
    x.lineWidth=12;x.beginPath();x.moveTo(f.x,f.y);x.lineTo(tx,ty);x.stroke();x.strokeStyle='#fffaf0';x.lineWidth=14;x.beginPath();x.moveTo(f.x,f.y);x.lineTo(f.x+(tx-f.x)*.97,f.y+(ty-f.y)*.97);x.stroke();});
  // muelle y luces del carril
  const my=616+carga*14;x.fillStyle='#777';x.fillRect(405,my,16,H-my);x.strokeStyle='#bbb';x.lineWidth=2;for(let yy=my+4;yy<H;yy+=5){x.beginPath();x.moveTo(405,yy);x.lineTo(421,yy+2);x.stroke();}
  const lc=enCarril();for(let i=0;i<7;i++)bombi(413,580-i*48,3.2,['#ff5252','#ffd740','#69f0ae','#40c4ff'][i%4],lc?((TT*10|0)%7===i):i<carga*7);
  // bolas: las de la rampa, un poco más grandes (van por arriba)
  BS.forEach(q=>bola(q,q.ramp!=null?1.2:1));
  if(msgT>0){x.fillStyle=`rgba(0,0,0,${Math.min(.75,msgT)})`;rr(55,292,290,38,12);x.fill();x.strokeStyle='#ffd54f';x.lineWidth=1.5;x.stroke();txt(msg,200,312,'bold 18px system-ui,sans-serif','#ffd54f');}}
function halo(px,py,r,rgb){const g=x.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,`rgba(${rgb},.85)`);g.addColorStop(.45,`rgba(${rgb},.45)`);g.addColorStop(1,`rgba(${rgb},0)`);x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,7);x.fill();}
function bola(q,k=1){const r=R*k,gb=x.createRadialGradient(q.x-3*k,q.y-3*k,1,q.x,q.y,r);gb.addColorStop(0,'#fff');gb.addColorStop(.5,'#cfd8dc');gb.addColorStop(1,'#546e7a');
  x.shadowColor='rgba(0,0,0,.6)';x.shadowBlur=6;x.shadowOffsetY=3;x.beginPath();x.arc(q.x,q.y,r,0,7);x.fillStyle=gb;x.fill();x.shadowBlur=0;x.shadowOffsetY=0;}
function pinta(){x.setTransform(S,0,0,S,0,0);mesa();marcador();}
function velo(t1,t2,t3){pinta();x.fillStyle='rgba(8,6,26,.72)';x.fillRect(0,TOP,W,H-TOP);txt(t1,W/2,300,'bold 40px system-ui,sans-serif','#ffd54f');
  if(t2)txt(t2,W/2,345,'19px system-ui,sans-serif','#fff');if(t3)txt(t3,W/2,380,'italic 16px system-ui,sans-serif','#cfd8dc');}

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
  velo(nuevo?'🏆 ¡Récord!':'Fin de partida',fmt(pts)+' puntos','Aita estaría orgulloso');setTimeout(()=>{if(!vivo&&abierto)txt('Toca para jugar otra vez',W/2,420,'16px system-ui,sans-serif','#ffcc80');},600);}
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
