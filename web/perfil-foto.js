/* =====================================================================
   🖼️ IMAGEN DE PERFIL (24 nov. 2026) · se carga después de superadmin.js
   La «figura» de arriba a la derecha (botón «Lo mío», #m6Mio) y la cabecera de «Mi cuenta»
   enseñan la imagen de cada uno:
   - Pedro y Sonia (súper administradores, bnSuper()): pueden poner una FOTO suya.
   - Todos los demás: eligen un AVATAR de BasatiNA (dibujos de Navarra). No hay fotos de usuarios:
     así no hay datos personales nuevos ni nada que moderar.
   La imagen solo se ve en el propio móvil (no sale en avisos ni en ningún sitio público).
   Se guarda en localStorage: «bnaAvatar» (id del avatar) y «bnaFoto» (foto pequeña, JPEG de 192 px
   en texto base64, unos 15 kB). Las dos claves están en CU_K de cuenta.js: con cuenta, viajan en
   Mi Espacio (Firestore espacio/{uid}, solo la lee su dueño).
   La foto solo se enseña si quien está dentro es súper administrador; al salir de la cuenta,
   vuelve el avatar (o la figura de siempre).
   ➕ Avatares dibujados a mano (p. ej. fotos de Pedro pasadas a dibujo): imagen cuadrada de unos
   256 px, en .webp, SUELTA en web/ (el actualizador no entra en carpetas) con nombre avatar-*.webp,
   y una línea en AV_IMG.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const X=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const g=(d,extra)=>`<g fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</g>${extra||''}`;
const F='fill="#fff" fill-opacity=".25"';
// avatares dibujados (mismo trazo que los iconos de la app): [id, nombre, color de fondo, dibujo en 32×32]
const AV=[
 ['milano','Milano real','#8d5a2b',g(`<path d="M2 13c5-3 9-3 14 2 5-5 9-5 14-2-5 0-9 3-14 8-5-5-9-8-14-8z" ${F}/><path d="M13 20l3 7 3-7"/>`)],
 ['abeto','Abeto','#2e6b34',g(`<path d="M16 3 9 13h4l-6 9h18l-6-9h4z" ${F}/><path d="M16 22v6"/>`)],
 ['haya','Hoja de haya','#5c8a2e',g(`<path d="M5 27C5 13 13 5 27 5c0 14-8 22-22 22z" ${F}/><path d="M5 27 19 13M12 20h6M15 17v-5"/>`)],
 ['monte','Monte','#4f6d7a',g(`<path d="M2 27 12 11l5 8 3-4 10 12z" ${F}/><path d="M12 11V4l6 2.5-6 2.5"/>`)],
 ['rio','Río','#1f78b4',g(`<path d="M16 3s-7 8-7 13a7 7 0 0 0 14 0c0-5-7-13-7-13z" ${F}/><path d="M3 26c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2 2.5-2 5-2"/>`)],
 ['seta','Seta','#b5452b',g(`<path d="M3 16C3 9 9 4 16 4s13 5 13 12z" ${F}/><path d="M12 16v8a4 4 0 0 0 8 0v-8"/><circle cx="11" cy="10" r="1.3"/><circle cx="20" cy="9" r="1.3"/>`)],
 ['sol','Sol','#e09a1a',g(`<circle cx="16" cy="16" r="6" ${F}/><path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8"/>`)],
 ['luna','Luna','#283a5e',g(`<path d="M19 4a12 12 0 1 0 9 18A10 10 0 0 1 19 4z" ${F}/><path d="M24 7v4M22 9h4"/>`)],
 ['trucha','Trucha','#3a7f8c',g(`<path d="M3 16c5-6 13-7 20 0-7 7-15 6-20 0z" ${F}/><path d="M23 16l6-5v10z"/><circle cx="8.5" cy="15" r="1"/>`)],
 ['flor','Flor','#a03d74',g(`<circle cx="16" cy="9" r="4"/><circle cx="22.5" cy="14" r="4"/><circle cx="20" cy="21.5" r="4"/><circle cx="12" cy="21.5" r="4"/><circle cx="9.5" cy="14" r="4"/><circle cx="16" cy="16" r="3" fill="#fff"/>`)],
 ['txapela','Txapela','#9b2226',g(`<path d="M3 19c0-5 6-9 13.5-9S29 13 29 17c0 3-6 4.5-13 4.5S3 21.5 3 19z" ${F}/><path d="M16.5 10l1-4"/><circle cx="17.7" cy="5.3" r="1.2" fill="#fff"/>`)],
 ['bici','Bici','#5a6b2f',g(`<circle cx="8" cy="21" r="5"/><circle cx="24" cy="21" r="5"/><path d="M8 21l5-9h8l3 9M13 12l5 9h-10M19 8h4"/>`)],
 ['mariposa','Mariposa','#7b4fa3',g(`<path d="M16 10c-3-6-12-7-12 0 0 4 5 6 12 6zM16 10c3-6 12-7 12 0 0 4-5 6-12 6z" ${F}/><path d="M16 16c-2 2-8 9-4 10 2 .5 4-3 4-6 0 3 2 6.5 4 6 4-1-2-8-4-10M16 8v18M14 5l2 3 2-3"/>`)],
 ['ciervo','Ciervo','#7a4e2d',g(`<path d="M11 14c0 6 2 13 5 13s5-7 5-13c0-2-2-3-5-3s-5 1-5 3z" ${F}/><path d="M12 11 8 5M8 8 5 7M10 7 9 3M20 11l4-6M24 8l3-1M22 7l1-4"/><circle cx="14" cy="17" r=".8" fill="#fff"/><circle cx="18" cy="17" r=".8" fill="#fff"/>`)]
];
// avatares dibujados a mano (imágenes sueltas en web/): [id, nombre, archivo]
const AV_IMG=[];

const ls={g:k=>{try{const v=localStorage.getItem(k);return v==null?null:JSON.parse(v);}catch(e){return null;}},
          s:k=>v=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}}};
const setAv=ls.s('bnaAvatar'),setFoto=ls.s('bnaFoto');
const esSuper=()=>{try{return !!(window.bnSuper&&window.bnSuper());}catch(e){return false;}};
const foto=()=>{const f=ls.g('bnaFoto');return esSuper()&&typeof f==='string'&&f.startsWith('data:image/')?f:null;};

// HTML de una imagen redonda de tamaño s (foto, avatar o null si no hay nada elegido)
function avHTML(id,s){const a=AV.find(x=>x[0]===id);
  if(a)return `<span style="width:${s}px;height:${s}px;border-radius:50%;background:${a[2]};display:inline-flex;align-items:center;justify-content:center;flex:none"><svg width="${Math.round(s*.66)}" height="${Math.round(s*.66)}" viewBox="0 0 32 32" aria-hidden="true">${a[3]}</svg></span>`;
  const b=AV_IMG.find(x=>x[0]===id);
  if(b)return `<img src="${X(b[2])}" alt="" style="width:${s}px;height:${s}px;border-radius:50%;object-fit:cover;flex:none;display:block">`;
  return null;}
function imagen(s){const f=foto();if(f)return `<img src="${f}" alt="" style="width:${s}px;height:${s}px;border-radius:50%;object-fit:cover;flex:none;display:block">`;
  return avHTML(ls.g('bnaAvatar'),s);}
window.bnPerfilImg=s=>imagen(s)||`<span style="font-size:${Math.round(s*.8)}px;line-height:1">👤</span>`;

/* ---------- la figura de arriba a la derecha ---------- */
const FIG='<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></g></svg>';
let ULT='';
function figura(){const b=$('m6Mio');if(!b)return;const h=imagen(40);const k=h||'fig';if(k===ULT&&b.dataset.pf)return;
  ULT=k;b.dataset.pf=1;b.innerHTML=h||FIG;b.style.padding=h?'0':'';b.style.overflow='hidden';}
setInterval(figura,3000);[300,1500,4000].forEach(d=>setTimeout(figura,d));

/* ---------- elegir la imagen (arriba de «Lo mío») ---------- */
function tarjeta(){const sec=$('t-lomio');if(!sec)return;let c=$('pfCard');
  if(!c){c=document.createElement('div');c.id='pfCard';c.className='card';c.style.cssText='border-radius:20px;margin-bottom:12px';
    const L=$('m6MioL');L?sec.insertBefore(c,L):sec.prepend(c);}
  const sup=esSuper(),f=foto(),av=ls.g('bnaAvatar');
  c.innerHTML=`<div class="row" style="align-items:center;gap:12px">${window.bnPerfilImg(56)}<div style="flex:1"><b>Tu imagen</b><div class="note" style="margin-top:2px;line-height:1.4">${sup?'Pon una foto tuya o elige un avatar.':'Elige un avatar de Navarra.'} Solo se ve en tu móvil (y en los tuyos, si tienes cuenta).</div></div></div>
    <div class="row" style="margin-top:8px;flex-wrap:wrap;gap:6px"><button class="btn" id="pfAvB">Elegir avatar</button>${sup?`<button class="btn" id="pfFoB">${f?'Cambiar foto':'Poner foto'}</button>${f?'<button class="btn" id="pfFoX">Quitar foto</button>':''}`:''}${av&&!f?'<button class="btn" id="pfAvX">Quitar avatar</button>':''}</div>
    <div id="pfGr" style="display:none;margin-top:10px"></div><div class="note" id="pfM"></div>`;
  $('pfAvB').onclick=()=>{const gr=$('pfGr');if(gr.style.display==='block'){gr.style.display='none';return;}
    gr.style.display='block';
    gr.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:10px">${AV.concat(AV_IMG).map(a=>`<button type="button" data-av="${X(a[0])}" title="${X(a[1])}" style="border:${a[0]===av?'3px solid #3d7031':'3px solid transparent'};background:none;border-radius:50%;padding:2px;cursor:pointer;justify-self:center">${avHTML(a[0],52)}</button>`).join('')}</div>`;
    gr.querySelectorAll('[data-av]').forEach(b=>b.onclick=()=>{setAv(b.dataset.av);
      if(foto())$('pfM').textContent='Avatar guardado. Mientras tengas foto, se ve la foto.';
      else toast('✅ Avatar guardado');
      todo();});};
  if($('pfAvX'))$('pfAvX').onclick=()=>{setAv(null);todo();};
  if($('pfFoX'))$('pfFoX').onclick=()=>{if(!confirm('¿Quitar tu foto?'))return;setFoto(null);todo();};
  if($('pfFoB'))$('pfFoB').onclick=()=>{const i=document.createElement('input');i.type='file';i.accept='image/*';
    i.onchange=()=>{const fl=i.files&&i.files[0];if(!fl)return;$('pfM').textContent='Preparando la foto…';reduce(fl).then(d=>{
        if(!esSuper())return $('pfM').textContent='❌ Solo los administradores pueden poner foto.';
        if(!setFoto(d))return $('pfM').textContent='❌ No queda espacio en el móvil para guardarla.';
        toast('✅ Foto guardada');todo();})
      .catch(()=>{$('pfM').textContent='❌ No se ha podido abrir esa imagen. Prueba con otra (JPG o PNG).';});};
    i.click();};}
// recorta al centro y la deja en 192×192 px (JPEG): unos 15 kB
function reduce(fl){return new Promise((ok,ko)=>{const u=URL.createObjectURL(fl),im=new Image();
  im.onload=()=>{try{const s=Math.min(im.naturalWidth,im.naturalHeight),N=192,cv=document.createElement('canvas');cv.width=cv.height=N;
      cv.getContext('2d').drawImage(im,(im.naturalWidth-s)/2,(im.naturalHeight-s)/2,s,s,0,0,N,N);URL.revokeObjectURL(u);ok(cv.toDataURL('image/jpeg',.82));}
    catch(e){ko(e);}};
  im.onerror=()=>{URL.revokeObjectURL(u);ko(new Error('imagen'));};im.src=u;});}
function todo(){ULT='';figura();tarjeta();
  const h=$('cuAvT');if(h)h.innerHTML=window.bnPerfilImg(48);}
// al abrir «Lo mío»
const _st=showTab;showTab=function(x){_st.apply(this,arguments);if(x==='lomio')setTimeout(tarjeta,60);};
// si llega una imagen desde la cuenta (otro móvil), se repinta sola con el intervalo de figura()
})();
