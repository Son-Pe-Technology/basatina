/* =====================================================================
   🔽 APARTADOS PLEGABLES (22 nov. 2026, mejoras que pidió Sonia)
   Un recuadro (.card) se convierte en plegable con msPlegar(card, opciones):
   - El título queda arriba con una flechita pequeña al final (▸). Al tocar el título se abre o se cierra.
   - modo 'todo': plegado solo se ve el título (p. ej. «Polen en el aire»).
   - modo 'exp' : plegado se ve lo importante (gráficas, conclusión) y se esconde solo lo que lleva la clase
                  msExp (las explicaciones largas). Así no hay que reescribir cada pantalla.
   - clave: si se da, la app recuerda si lo dejaste abierto o cerrado.
   Si la pantalla vuelve a pintar el recuadro (al cambiar de pueblo, por ejemplo), el título se vuelve a
   preparar solo (MutationObserver), y se mantiene abierto o cerrado como estaba.
   ===================================================================== */
(function(){
const st=document.createElement('style');st.textContent=`
.msPl>.msCab{display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent}
.msPl>.msCab>.msTit{flex:1 1 auto;min-width:0}
.msPl>.msCab>.msFl{flex:none;width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;
  font-size:11px;color:var(--verde,#3d7031);background:rgba(61,112,49,.10);transition:transform .2s}
.msPl.abierto>.msCab>.msFl{transform:rotate(90deg)}
.msPl.msTodo:not(.abierto)>*:not(.msCab){display:none!important}
.msPl.msExpM:not(.abierto) .msExp{display:none!important}
.msPl>.msCab>.msMas{flex:none;font-size:11.5px;color:var(--mut,#777);font-weight:600;white-space:nowrap}
.msPl.abierto>.msCab>.msMas{display:none}`;
document.head.appendChild(st);
const lg=k=>{try{return localStorage.getItem('msPl_'+k);}catch(e){return null;}};
const ls=(k,v)=>{try{localStorage.setItem('msPl_'+k,v);}catch(e){}};
function cabecera(card,o){if(card.querySelector(':scope>.msCab'))return;
  let t=o.titulo?card.querySelector(o.titulo):null;
  if(!t){t=[...card.children].find(x=>x.matches('b,h2,h3,.ccTit')||(x.tagName==='DIV'&&x.firstElementChild&&x.firstElementChild.tagName==='B'&&x.textContent.trim().length<70));}
  if(!t)return;
  const cab=document.createElement('div');cab.className='msCab';cab.setAttribute('role','button');cab.tabIndex=0;
  t.parentNode.insertBefore(cab,t);const tit=document.createElement('div');tit.className='msTit';tit.appendChild(t);cab.appendChild(tit);
  cab.insertAdjacentHTML('beforeend',(o.modo==='exp'?'<span class="msMas">'+(o.mas||'Más info')+'</span>':'')+'<span class="msFl" aria-hidden="true">▶</span>');
  cab.setAttribute('aria-expanded',card.classList.contains('abierto'));}
window.msPlegar=function(card,o){if(!card)return;o=o||{};if(card.__msPl){cabecera(card,card.__msPl);return;}
  card.__msPl=o;card.classList.add('msPl',o.modo==='exp'?'msExpM':'msTodo');
  const g=o.clave?lg(o.clave):null;if(g==='1'||(g==null&&o.abierto))card.classList.add('abierto');
  cabecera(card,o);
  new MutationObserver(()=>cabecera(card,o)).observe(card,{childList:true});};
function toca(e){const cab=e.target.closest('.msPl>.msCab');if(!cab)return;
  if(e.type==='keydown'&&e.key!=='Enter'&&e.key!==' ')return;
  if(e.target.closest('a,input,select,textarea,.btn:not(.msCab)'))return;
  const card=cab.parentNode,ab=card.classList.toggle('abierto');cab.setAttribute('aria-expanded',ab);
  if(card.__msPl&&card.__msPl.clave)ls(card.__msPl.clave,ab?'1':'0');
  if(ab&&card.__msPl&&card.__msPl.alAbrir)try{card.__msPl.alAbrir(card);}catch(err){}
  if(e.type==='keydown')e.preventDefault();}
document.addEventListener('click',toca);document.addEventListener('keydown',toca);
})();
