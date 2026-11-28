/* =====================================================================
   📸 «Foto de la Cuadrilla» abajo del todo en el Inicio (26 nov. 2026, petición de Pedro)
   Qué hace:
   - Enseña, en un recuadro grande y con vida (borde de colores que se mueve y la foto que se acerca
     despacito), una foto que la gente ha mandado por «Cuadrilla BasatiNA › Envía tu foto».
   - 27 nov. 2026 (Pedro): es un CARRUSEL. Pasan solas las últimas fotos aprobadas (hasta 12), una cada
     6 segundos, y se pueden pasar con el dedo. Los puntitos de abajo dicen cuál estás viendo.
     La marcada con «🏠 Poner en el Inicio» (en la ficha de la foto, en Fotos) sale siempre la primera.
     Ya no lleva la etiqueta de río, pueblo… (lo cuentan en la descripción).
   - Al tocar la foto se abre en grande; ahí se puede ampliar con dos dedos o con doble toque.
   - Si todavía no hay fotos aprobadas, sale una invitación para mandar la primera.
   - Va justo encima del aviso de «app no oficial» y de la información legal.
   De dónde sale: fotos/galeria.json (lo mismo que la galería: solo fotos ya revisadas y aprobadas).
   Si la persona tiene puesto «reducir movimiento» en el móvil, no se mueve nada (ni pasan solas: se pasan con el dedo).
   ===================================================================== */
(function(){
  const st=document.createElement('style');
  st.textContent=`
.bnaFdC{position:relative;margin:22px 14px 8px;border-radius:24px;padding:3px;overflow:hidden;isolation:isolate;
  box-shadow:0 10px 28px rgba(20,60,40,.28),0 2px 6px rgba(0,0,0,.12);cursor:pointer}
.bnaFdC::before{content:"";position:absolute;inset:-60%;z-index:-1;
  background:conic-gradient(from 0deg,#2e8b57,#7fd36b,#ffd166,#f08a4b,#e0457b,#5b8def,#2ec4b6,#2e8b57);
  animation:bnaFdGira 9s linear infinite}
.bnaFdIn{position:relative;border-radius:21px;overflow:hidden;background:#1d2a24;aspect-ratio:4/3}
.bnaFdTr{position:absolute;inset:0;display:flex;transition:transform .55s cubic-bezier(.4,0,.2,1);touch-action:pan-y}
.bnaFdSl{position:relative;flex:0 0 100%;height:100%;overflow:hidden}
.bnaFdSl::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,0) 28%,rgba(0,0,0,0) 52%,rgba(0,0,0,.78) 100%)}
.bnaFdDots{position:absolute;z-index:3;left:0;right:0;bottom:6px;display:flex;justify-content:center;gap:5px;pointer-events:none}
.bnaFdDots i{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.5);transition:all .3s}
.bnaFdDots i.on{width:16px;border-radius:3px;background:#fff}
.bnaFdIn img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform-origin:50% 60%;
  animation:bnaFdZoom 18s ease-in-out infinite alternate}
.bnaFdTop{position:absolute;z-index:2;top:12px;left:12px;right:12px;display:flex;justify-content:space-between;align-items:center;gap:8px}
.bnaFdBad{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;font-weight:800;font-size:13px;color:#fff;
  background:rgba(255,255,255,.18);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.35);letter-spacing:.02em}
.bnaFdBad i{width:8px;height:8px;border-radius:50%;background:#7fd36b;box-shadow:0 0 0 0 rgba(127,211,107,.7);animation:bnaFdLat 2s infinite}
.bnaFdCat{padding:5px 10px;border-radius:999px;font-size:12px;font-weight:700;color:#fff}
.bnaFdPie{position:absolute;z-index:2;left:16px;right:16px;bottom:20px;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.6)}
.bnaFdPie b{display:block;font-size:21px;line-height:1.15;font-weight:800}
.bnaFdPie span{display:block;font-size:13.5px;opacity:.92;margin-top:3px}
.bnaFdPie em{display:block;font-style:normal;font-size:13px;opacity:.88;margin-top:5px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.bnaFdBtn{position:absolute;z-index:3;right:14px;bottom:20px;padding:9px 14px;border-radius:999px;border:0;font-weight:800;font-size:13px;
  color:#17351f;background:linear-gradient(135deg,#ffe08a,#ffd166);box-shadow:0 4px 12px rgba(0,0,0,.3)}
.bnaFdC.vacia .bnaFdIn{background:linear-gradient(135deg,#2e8b57,#1f6f8b 60%,#5b8def);display:flex;align-items:center;justify-content:center}

.bnaFdVac{position:relative;z-index:2;text-align:center;color:#fff;padding:18px}
.bnaFdVac .ic{font-size:46px;display:block;animation:bnaFdFlota 3.5s ease-in-out infinite}
.bnaFdVac b{display:block;font-size:20px;margin:6px 0 4px}
.bnaFdVac span{display:block;font-size:13.5px;opacity:.92;margin-bottom:12px}
.bnaFdVac .bnaFdBtn{position:static}
@keyframes bnaFdGira{to{transform:rotate(360deg)}}
@keyframes bnaFdZoom{from{transform:scale(1.02)}to{transform:scale(1.14) translateY(-2%)}}
@keyframes bnaFdLat{70%{box-shadow:0 0 0 8px rgba(127,211,107,0)}100%{box-shadow:0 0 0 0 rgba(127,211,107,0)}}
@keyframes bnaFdFlota{50%{transform:translateY(-6px)}}
@media (prefers-reduced-motion:reduce){.bnaFdC::before,.bnaFdIn img,.bnaFdBad i,.bnaFdVac .ic{animation:none}.bnaFdTr{transition:none}}`;
  document.head.appendChild(st);

  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const mini=u=>typeof cldT==='function'?cldT(u,'c_fill,w_1000,h_750,g_auto,q_auto,f_auto'):u;
  const enviar=e=>{if(e)e.stopPropagation();try{showTab('enviar');}catch(x){}};

  const quieto=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  // qué fotos salen: la marcada para el Inicio la primera y luego las más nuevas (hasta 12)
  function lista(G){const F=(G&&G.fotos||[]).filter(f=>f&&f.url);
    F.sort((a,b)=>((b.ts||b.d||'')).localeCompare(a.ts||a.d||''));
    const i=F.findIndex(f=>f.id===G.inicio);if(i>0)F.unshift(F.splice(i,1)[0]);
    return F.slice(0,12);}

  let C={ids:'',n:0,i:0,t:null,tr:null};
  const ir=(i,anim)=>{if(!C.n||!C.tr)return;C.i=(i+C.n)%C.n;C.tr.style.transition=anim===false?'none':'';
    C.tr.style.transform=`translateX(${-C.i*100}%)`;
    C.tr.parentNode.querySelectorAll('.bnaFdDots i').forEach((d,k)=>d.classList.toggle('on',k===C.i));};
  const enInicio=()=>{const s=document.getElementById('t-mtiempo');return s&&s.classList.contains('on')&&!document.hidden;};
  function arranca(){clearInterval(C.t);C.t=null;if(C.n<2||quieto())return;
    C.t=setInterval(()=>{if(enInicio())ir(C.i+1);},6000);}

  function pinta(G){
    const s=document.getElementById('t-mtiempo');if(!s)return;
    let d=s.querySelector(':scope>.bnaFdC');if(!d){d=document.createElement('div');d.className='bnaFdC';}
    const F=lista(G),ids=F.map(f=>f.id).join(',');
    if(!F.length){d.classList.add('vacia');clearInterval(C.t);C={ids:'',n:0,i:0,t:null,tr:null};
      d.innerHTML=`<div class="bnaFdIn"><div class="bnaFdVac"><span class="ic">📸</span><b>Tu foto, aquí</b><span>Manda una foto de Navarra desde la Cuadrilla BasatiNA y puede salir en el Inicio de todos.</span><button class="bnaFdBtn">Enviar una foto</button></div></div>`;
      d.onclick=enviar;coloca(d);return;}
    if(ids===C.ids&&d.isConnected){coloca(d);return;}   // nada nuevo: no lo reiniciamos
    d.classList.remove('vacia');
    d.innerHTML=`<div class="bnaFdIn"><div class="bnaFdTr">${F.map(f=>`<div class="bnaFdSl" data-id="${esc(f.id)}"><img src="${esc(mini(f.url))}" alt="${esc(f.lugar||'Foto de Navarra')}" loading="lazy" onerror="this.style.display='none'">
        <div class="bnaFdPie" style="right:${f.desc?16:130}px"><b>${esc(f.lugar||'Foto de Navarra')}</b><span>📷 ${esc(f.alias||'Anónimo')}${f.gana?' · ⭐ Ganadora del reto':''}</span>${f.desc?`<em>${esc(f.desc)}</em>`:''}</div>
        ${f.desc?'':'<button class="bnaFdBtn">Envía la tuya</button>'}</div>`).join('')}</div>
      <div class="bnaFdTop"><span class="bnaFdBad"><i></i>Foto de la Cuadrilla</span></div>
      ${F.length>1?`<div class="bnaFdDots">${F.map(()=>'<i></i>').join('')}</div>`:''}</div>`;
    C.ids=ids;C.n=F.length;C.tr=d.querySelector('.bnaFdTr');
    d.querySelectorAll('.bnaFdBtn').forEach(b=>b.onclick=enviar);
    // pasar con el dedo; un toque (sin arrastrar) abre la foto en grande
    let x0=null,y0=0,dx=0,mov=false;const W=()=>C.tr.parentNode.clientWidth||1;
    C.tr.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY;dx=0;mov=false;clearInterval(C.t);},{passive:true});
    C.tr.addEventListener('touchmove',e=>{if(x0==null)return;dx=e.touches[0].clientX-x0;const dy=e.touches[0].clientY-y0;
      if(!mov&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy))mov=true;
      if(mov&&C.n>1){C.tr.style.transition='none';C.tr.style.transform=`translateX(${-C.i*100+dx/W()*100}%)`;}},{passive:true});
    C.tr.addEventListener('touchend',()=>{if(x0==null)return;x0=null;
      if(mov&&C.n>1)ir(Math.abs(dx)>W()*.18?C.i+(dx<0?1:-1):C.i);arranca();});
    d.onclick=e=>{if(mov){mov=false;return;}const sl=e.target.closest('.bnaFdSl');if(sl)try{foOpen(sl.dataset.id);}catch(x){}};
    ir(0,false);arranca();coloca(d);
  }
  // encima de la nota de autores de las fotos, del aviso de «app no oficial» (oficial.js) y de lo legal (legal.js)
  function coloca(d){const s=document.getElementById('t-mtiempo');if(!s||!d)return;
    const pie=s.querySelector(':scope>.ifCred')||s.querySelector(':scope>.bnaPie')||s.querySelector(':scope>.bnaLeg');
    if(pie){if(d.nextElementSibling!==pie)s.insertBefore(d,pie);}else if(d.parentNode!==s||s.lastElementChild!==d)s.appendChild(d);}

  async function carga(fresca){try{const G=typeof glLoad==='function'?await glLoad(!!fresca):null;pinta(G);}catch(e){pinta(null);}}
  window.bnaFotoInicio=carga;   // la ficha de la foto la llama al cambiar la del Inicio

  /* 🔍 Ampliar en el visor de fotos (foBox): dos dedos o doble toque; con un dedo se mueve la foto ampliada */
  (function(){const im=document.getElementById('foBoxI');if(!im)return;
    let z=1,tx=0,ty=0,d0=0,z0=1,p0=null,last=0;
    const ap=()=>{im.style.transform=z>1?`translate(${tx}px,${ty}px) scale(${z})`:'';};
    const reset=()=>{z=1;tx=ty=0;ap();};
    im.addEventListener('load',reset);
    const dist=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
    im.addEventListener('touchstart',e=>{if(e.touches.length===2){d0=dist(e.touches);z0=z;}
      else if(e.touches.length===1){const now=Date.now();if(now-last<300){z>1?reset():(z=2.5,ap());last=0;e.preventDefault();return;}last=now;
        p0={x:e.touches[0].clientX-tx,y:e.touches[0].clientY-ty};}},{passive:false});
    im.addEventListener('touchmove',e=>{e.preventDefault();im.style.transition='none';
      if(e.touches.length===2&&d0){z=Math.min(5,Math.max(1,z0*dist(e.touches)/d0));if(z===1){tx=ty=0;}ap();}
      else if(e.touches.length===1&&z>1&&p0){tx=e.touches[0].clientX-p0.x;ty=e.touches[0].clientY-p0.y;ap();}},{passive:false});
    im.addEventListener('touchend',e=>{im.style.transition='';if(e.touches.length<2)d0=0;if(z<1.05)reset();});
    im.addEventListener('dblclick',()=>{z>1?reset():(z=2.5,ap());});   // en la web, con el ratón
    const x=document.getElementById('foBoxX');if(x)x.addEventListener('click',reset);
  })();

  const recoloca=()=>{const s=document.getElementById('t-mtiempo'),d=s&&s.querySelector(':scope>.bnaFdC');if(d)coloca(d);};
  const _st=showTab;showTab=function(t){_st(t);try{if(t==='mtiempo'){recoloca();setTimeout(recoloca,1700);}}catch(e){}};
  carga(false);setTimeout(recoloca,1700);setTimeout(recoloca,5300);
  // 28 nov. 2026: al publicar o quitar una foto en este móvil, el carrusel cambia al momento (sin volver a abrir la app)
  window.addEventListener('bnGaleria',()=>carga(false));
  // y en los demás móviles: al volver a la app o al Inicio, y cada 3 minutos (glLoad no pide más de una vez cada 45 s)
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)carga(true);});
  const _st2=showTab;showTab=function(t){_st2(t);try{if(t==='mtiempo')carga(true);}catch(e){}};
  setInterval(()=>{if(!document.hidden)carga(true);},3*60*1000);
})();
