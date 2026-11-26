/* =====================================================================
   📸 «Foto de la Cuadrilla» abajo del todo en el Inicio (26 nov. 2026, petición de Pedro)
   Qué hace:
   - Enseña, en un recuadro grande y con vida (borde de colores que se mueve y la foto que se acerca
     despacito), una foto que la gente ha mandado por «Cuadrilla BasatiNA › Envía tu foto».
   - Cuál sale: la que un administrador ha marcado con «🏠 Poner en el Inicio» (en la ficha de la foto,
     en Fotos). Si no hay ninguna marcada, la última foto aprobada. Si todavía no hay fotos aprobadas,
     sale una invitación para mandar la primera.
   - Va justo encima del aviso de «app no oficial» y de la información legal.
   De dónde sale: fotos/galeria.json (lo mismo que la galería: solo fotos ya revisadas y aprobadas).
   Si la persona tiene puesto «reducir movimiento» en el móvil, no se mueve nada.
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
.bnaFdIn img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform-origin:50% 60%;
  animation:bnaFdZoom 18s ease-in-out infinite alternate}
.bnaFdIn::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,0) 28%,rgba(0,0,0,0) 52%,rgba(0,0,0,.78) 100%)}
.bnaFdTop{position:absolute;z-index:2;top:12px;left:12px;right:12px;display:flex;justify-content:space-between;align-items:center;gap:8px}
.bnaFdBad{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;font-weight:800;font-size:13px;color:#fff;
  background:rgba(255,255,255,.18);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.35);letter-spacing:.02em}
.bnaFdBad i{width:8px;height:8px;border-radius:50%;background:#7fd36b;box-shadow:0 0 0 0 rgba(127,211,107,.7);animation:bnaFdLat 2s infinite}
.bnaFdCat{padding:5px 10px;border-radius:999px;font-size:12px;font-weight:700;color:#fff}
.bnaFdPie{position:absolute;z-index:2;left:16px;right:16px;bottom:14px;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.6)}
.bnaFdPie b{display:block;font-size:21px;line-height:1.15;font-weight:800}
.bnaFdPie span{display:block;font-size:13.5px;opacity:.92;margin-top:3px}
.bnaFdPie em{display:block;font-style:normal;font-size:13px;opacity:.88;margin-top:5px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.bnaFdBtn{position:absolute;z-index:3;right:14px;bottom:14px;padding:9px 14px;border-radius:999px;border:0;font-weight:800;font-size:13px;
  color:#17351f;background:linear-gradient(135deg,#ffe08a,#ffd166);box-shadow:0 4px 12px rgba(0,0,0,.3)}
.bnaFdC.vacia .bnaFdIn{background:linear-gradient(135deg,#2e8b57,#1f6f8b 60%,#5b8def);display:flex;align-items:center;justify-content:center}
.bnaFdC.vacia .bnaFdIn::after{display:none}
.bnaFdVac{position:relative;z-index:2;text-align:center;color:#fff;padding:18px}
.bnaFdVac .ic{font-size:46px;display:block;animation:bnaFdFlota 3.5s ease-in-out infinite}
.bnaFdVac b{display:block;font-size:20px;margin:6px 0 4px}
.bnaFdVac span{display:block;font-size:13.5px;opacity:.92;margin-bottom:12px}
.bnaFdVac .bnaFdBtn{position:static}
@keyframes bnaFdGira{to{transform:rotate(360deg)}}
@keyframes bnaFdZoom{from{transform:scale(1.02)}to{transform:scale(1.14) translateY(-2%)}}
@keyframes bnaFdLat{70%{box-shadow:0 0 0 8px rgba(127,211,107,0)}100%{box-shadow:0 0 0 0 rgba(127,211,107,0)}}
@keyframes bnaFdFlota{50%{transform:translateY(-6px)}}
@media (prefers-reduced-motion:reduce){.bnaFdC::before,.bnaFdIn img,.bnaFdBad i,.bnaFdVac .ic{animation:none}}`;
  document.head.appendChild(st);

  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const mini=u=>typeof cldT==='function'?cldT(u,'c_fill,w_1000,h_750,g_auto,q_auto,f_auto'):u;
  const enviar=e=>{if(e)e.stopPropagation();try{showTab('enviar');}catch(x){}};

  // qué foto sale: la marcada para el Inicio; si no, la última aprobada
  function elegida(G){const F=(G&&G.fotos||[]).filter(f=>f&&f.url);if(!F.length)return null;
    return F.find(f=>f.id===G.inicio)||F.slice().sort((a,b)=>(b.d||'').localeCompare(a.d||''))[0];}

  function pinta(G){
    const s=document.getElementById('t-mtiempo');if(!s)return;
    let d=s.querySelector(':scope>.bnaFdC');if(!d){d=document.createElement('div');d.className='bnaFdC';}
    const f=elegida(G);
    if(!f){d.classList.add('vacia');
      d.innerHTML=`<div class="bnaFdIn"><div class="bnaFdVac"><span class="ic">📸</span><b>Tu foto, aquí</b><span>Manda una foto de Navarra desde la Cuadrilla BasatiNA y puede salir en el Inicio de todos.</span><button class="bnaFdBtn">Enviar una foto</button></div></div>`;
      d.onclick=enviar;
    }else{d.classList.remove('vacia');
      const c=typeof foCat==='function'?foCat(f.cat):['','📷','Foto'],col=(typeof FO_COL!=='undefined'&&FO_COL[f.cat])||'#2e8b57';
      d.innerHTML=`<div class="bnaFdIn"><img src="${esc(mini(f.url))}" alt="${esc(f.lugar||'Foto de Navarra')}" loading="lazy" onerror="this.style.display='none'">
        <div class="bnaFdTop"><span class="bnaFdBad"><i></i>Foto de la Cuadrilla</span><span class="bnaFdCat" style="background:${col}">${c[1]} ${esc(c[2])}</span></div>
        <div class="bnaFdPie" style="right:${f.desc?16:130}px"><b>${esc(f.lugar||c[2])}</b><span>📷 ${esc(f.alias||'Anónimo')}${f.gana?' · ⭐ Ganadora del reto':''}</span>${f.desc?`<em>${esc(f.desc)}</em>`:''}</div>
        ${f.desc?'':'<button class="bnaFdBtn">Envía la tuya</button>'}</div>`;
      d.onclick=()=>{try{foOpen(f.id);}catch(e){}};
      const b=d.querySelector('.bnaFdBtn');if(b)b.onclick=enviar;
    }
    coloca(d);
  }
  // encima de la nota de autores de las fotos, del aviso de «app no oficial» (oficial.js) y de lo legal (legal.js)
  function coloca(d){const s=document.getElementById('t-mtiempo');if(!s||!d)return;
    const pie=s.querySelector(':scope>.ifCred')||s.querySelector(':scope>.bnaPie')||s.querySelector(':scope>.bnaLeg');
    if(pie){if(d.nextElementSibling!==pie)s.insertBefore(d,pie);}else if(d.parentNode!==s||s.lastElementChild!==d)s.appendChild(d);}

  async function carga(fresca){try{const G=typeof glLoad==='function'?await glLoad(!!fresca):null;pinta(G);}catch(e){pinta(null);}}
  window.bnaFotoInicio=carga;   // la ficha de la foto la llama al cambiar la del Inicio

  const recoloca=()=>{const s=document.getElementById('t-mtiempo'),d=s&&s.querySelector(':scope>.bnaFdC');if(d)coloca(d);};
  const _st=showTab;showTab=function(t){_st(t);try{if(t==='mtiempo'){recoloca();setTimeout(recoloca,1700);}}catch(e){}};
  carga(false);setTimeout(recoloca,1700);setTimeout(recoloca,5300);
  setInterval(()=>{if(!document.hidden)carga(true);},10*60*1000);   // cada 10 minutos, por si han cambiado la foto
})();
