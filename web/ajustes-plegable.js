/* =====================================================================
   AJUSTES PLEGABLES (24 nov. 2026, Pedro)
   - Cada apartado de «Ajustes» se abre y se cierra tocando su título,
     para no volverse loco con tantas cosas a la vez. Empiezan cerrados.
   - La app recuerda cuáles dejaste abiertos.
   - Arriba del todo, botón «Buscar nueva versión de la app» (en el menú nuevo
     ya no aparecía).
   Funciona con todos los apartados, también los que añaden otros archivos
   (lluvia, viento, push, copia de datos…): vigila la pantalla y pliega
   cada tarjeta nueva que aparece.
   ===================================================================== */
(function(){
  const box=document.getElementById('ajBody');if(!box)return;
  const KEY='bnaAjAbiertos';
  let ABIERTOS=new Set();
  try{ABIERTOS=new Set(JSON.parse(localStorage.getItem(KEY)||'[]'));}catch(e){}
  const guardar=()=>{try{localStorage.setItem(KEY,JSON.stringify([...ABIERTOS]));}catch(e){}};

  const css=document.createElement('style');
  css.textContent=`
#ajBody .ajPlH{display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent}
#ajBody .ajPlH>i{font-style:normal;color:var(--mut);font-size:18px;transition:transform .2s;flex:none}
#ajBody .card.ajPlOn .ajPlH>i{transform:rotate(90deg)}
#ajBody .ajPlB{display:none;margin-top:8px}
#ajBody .card.ajPlOn .ajPlB{display:block}
#ajBody #ajUpd .btn{width:100%;margin-top:8px}`;
  document.head.appendChild(css);

  function plegar(card){
    if(card.dataset.pleg)return;card.dataset.pleg='1';
    const t=card.firstElementChild;
    if(!t||t.tagName!=='B')return;               // tarjetas sin título (avisos sueltos): se quedan como están
    const clave=t.textContent.replace(/\(.*?\)/g,'').trim();
    const h=document.createElement('div');h.className='ajPlH';
    const b=document.createElement('div');b.className='ajPlB';
    card.insertBefore(h,t);h.appendChild(t);
    const fl=document.createElement('i');fl.textContent='▸';h.appendChild(fl);
    while(h.nextSibling)b.appendChild(h.nextSibling);   // se mueven tal cual: los botones siguen funcionando
    card.appendChild(b);
    if(ABIERTOS.has(clave))card.classList.add('ajPlOn');
    h.onclick=()=>{const on=card.classList.toggle('ajPlOn');if(on)ABIERTOS.add(clave);else ABIERTOS.delete(clave);guardar();};
  }

  function botonActualizar(){
    if(document.getElementById('ajUpd'))return;
    if(typeof APP==='undefined'||!APP||!window.AndroidNet||!window.AndroidNet.updateWeb||typeof checkUpdate!=='function')return;
    const c=document.createElement('div');c.className='card';c.id='ajUpd';c.dataset.pleg='1';
    c.innerHTML='<b>⬆️ Buscar nueva versión de la app</b><div class="note">Si hay una versión nueva de la pantalla, se pone al momento.</div><button class="btn">⬆️ Buscar nueva versión de la app</button>';
    c.querySelector('button').onclick=()=>checkUpdate(true);
    box.insertBefore(c,box.firstChild);
  }

  function repasar(){botonActualizar();[...box.children].forEach(c=>{if(c.classList.contains('card'))plegar(c);});}
  new MutationObserver(repasar).observe(box,{childList:true});
  repasar();
})();
