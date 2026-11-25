/* =====================================================================
   🏠 INICIO · PARTE CENTRAL «COMO EL DIBUJO» (23 nov. 2026, diseño que trajo Pedro) — se carga el último
   Solo cambia la parte central del Inicio, desde «Ahora en Navarra» hacia abajo (la cabecera, el buscador,
   el tiempo, los accesos directos y la barra de abajo se quedan como están):
     1. Río · ahora: título azul con olas, estaciones en cuadritos grises, «Normal» en verde y flechas grandes.
     2. Agenda (Todo / Cultura / Deporte / Otros): foto pequeña según lo que es, fecha en verde con calendario,
        etiqueta de color y una flecha.
     3. Palabra del día (sobre foto de bosque, letras blancas) y Refrán del día (lila, con paisaje arriba).
     4. Noticia curiosa: con foto a la izquierda y «Otra ›» naranja.
     5. La semana en Navarra: cada tarjeta con su foto y el dato principal en una pastilla encima.
   No cambia de dónde salen los datos (novedades.js, temas.js, curiosas.js, seInit de index.html):
   solo los viste. Si algo se vuelve a pintar, se vuelve a vestir solo (MutationObserver).
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const enIni=()=>typeof isBna==='function'&&isBna();
const S='body.bna #t-mtiempo';
// fotos (todas ya están en la app; autores en los créditos del Inicio y de cada sección)
// 23 nov. 2026 (noche): Pedro pidió quitar TODAS las fotos de la app → sin fotos, colores lisos
const F={ag:{},semCol:['#3f7cae','#6b5fa8','#3d7031','#b8612a']};
const I={ola:'<path d="M2 9c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/>',
 cal:'<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><circle cx="12" cy="15" r="1.4"/>',
 hoja:'<path d="M5 19c8 0 14-5 14-14-9 0-14 6-14 14zM5 19l7-7"/>',
 comillas:'<path d="M9 7c-3 1-4.5 3.5-4.5 6.5V17h5v-5H7c0-2 1-3.2 2.6-3.8zM18.5 7c-3 1-4.5 3.5-4.5 6.5V17h5v-5h-2.5c0-2 1-3.2 2.6-3.8z" fill="currentColor" stroke="none"/>',
 megafono:'<path d="M4 10v4h3l7 4V6l-7 4zM17 9a4 4 0 0 1 0 6"/>',flecha:'<path d="M9 6l6 6-6 6"/>'};
const ic=(n,s)=>`<svg class="icS" width="${s||18}" height="${s||18}" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${I[n]}</g></svg>`;
const st=document.createElement('style');st.textContent=`
${S} .bnaH{font-size:17px!important;font-weight:900!important;border-left:4px solid #3d7031;padding-left:9px!important;margin:16px 2px 8px!important;line-height:1.15}
/* 1 · río */
${S} #rzTk{border-radius:20px!important;border:1px solid rgba(29,45,35,.06)!important;box-shadow:0 4px 16px rgba(29,45,35,.08)!important;margin-bottom:12px}
${S} #rzTk .anC,${S} #anTk .anC{position:relative}
${S} #rzTk .anC{padding:12px 12px 8px!important;align-items:stretch!important}
/* la etiqueta (Normal, Cultura…) arriba a la derecha: así los datos y el título tienen todo el ancho */
${S} #rzTk .anC>.bdg,${S} #anTk .anC>.bdg{position:absolute!important;top:10px;right:10px;margin:0!important}
${S} #rzTk .anW,${S} #anTk .anW{padding-right:86px}
${S} #rzTk .anE.ifR{width:104px!important;min-height:96px!important;border-radius:14px!important}
${S} #rzTk .anE.ifR b{display:none!important}
${S} #rzTk .anW{display:flex!important;align-items:center;gap:6px;color:#0d62a0!important;font-size:15px!important;font-weight:800!important;margin-bottom:4px}
${S} #rzTk .anW .icS{color:#0d62a0;flex:none}
${S} #rzTk .rzG{gap:6px!important}
${S} #rzTk .rzZ{background:#f1f3f4!important;border-radius:12px!important;padding:7px 8px!important}
${S} #rzTk .rzZ.am{background:#fff4dc!important}${S} #rzTk .rzZ.ro{background:#fde4e4!important}
${S} #rzTk .rzZ .rzL,${S} #rzTk .rzZ .rzN{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:11.5px!important;color:#5b6660!important}
${S} #rzTk .rzZ b{font-size:16px!important;color:#1d1d1d}
${S} #rzTk .bdg,${S} #anTk .bdg{align-self:flex-start;border-radius:999px!important;padding:5px 12px!important;font-weight:800!important;font-size:12.5px!important}
${S} #rzTk .bdg.ok{background:#2e6b2a!important;color:#fff!important;border:none!important}
${S} #rzTk .bdg.am{background:#f39c12!important;color:#fff!important;border:none!important}${S} #rzTk .bdg.ro{background:#c62828!important;color:#fff!important;border:none!important}
${S} .anF{display:flex!important;align-items:center;gap:10px;padding:4px 12px 12px!important}
${S} .anF .anP,${S} .anF .anX{flex:none;width:52px;height:36px;border-radius:12px!important;border:none!important;background:#f1f3f4!important;color:#1d1d1d!important;font-size:22px!important;font-weight:700;line-height:1;display:inline-flex;align-items:center;justify-content:center}
${S} .anF>span{font-size:14px;color:#5b6660;font-weight:700;min-width:38px;text-align:center}
${S} .anF .anBar{flex:1;height:6px!important;border-radius:3px!important;background:#e3e7e5!important;overflow:hidden}
${S} #rzTk .anF .anBar i{background:#1e78d2!important;border-radius:3px}
${S} #anTk .anF .anBar i{background:#2e6b2a!important;border-radius:3px}
/* 2 · agenda */
${S} #anTk{border-radius:20px!important;border:1px solid rgba(29,45,35,.06)!important;box-shadow:0 4px 16px rgba(29,45,35,.08)!important}
${S} #anTk .anS{padding:12px 12px 2px!important;gap:8px!important}
${S} #anTk .anS button{border:1.5px solid #dfe6dc!important;background:#fff!important;color:#1d1d1d!important;border-radius:999px!important;padding:6px 14px!important;font-size:14px!important;font-weight:800!important}
${S} #anTk .anS button.on{background:#2e6b2a!important;border-color:#2e6b2a!important;color:#fff!important}
${S} #anTk .anC{align-items:center!important;gap:12px!important;padding:12px!important}
${S} #anTk .anE.icF{flex:none;width:86px;height:86px;border-radius:14px;background:#8aa096 center/cover no-repeat;font-size:0!important;overflow:hidden}
${S} #anTk .anE.icF>*{display:none!important}
${S} #anTk .anW{display:flex!important;align-items:center;gap:6px;color:#2e6b2a!important;font-size:14px!important;font-weight:800!important}
${S} #anTk .anW .icS{color:#2e6b2a;flex:none}
${S} #anTk .anC b{font-size:16.5px!important;line-height:1.25!important;font-weight:900!important;display:-webkit-box!important;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
${S} #anTk .anC small:not(.anW){font-size:13px!important;color:#5b6660!important;display:-webkit-box!important;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;white-space:normal!important}
${S} #anTk .bdg{background:#e3f0fb!important;color:#1565c0!important;border:none!important}
${S} #anTk .bdg.ok{background:#e6f2e3!important;color:#2e6b2a!important}${S} #anTk .bdg.am{background:#fff1d6!important;color:#9a5b00!important}${S} #anTk .bdg.ro{background:#fde4e4!important;color:#b3261e!important}
${S} #anTk .anC .icFl{flex:none;color:#1d1d1d;align-self:center}
/* 3 · palabra y refrán */
${S} #ifPar{gap:12px!important;margin:14px 0!important}
/* 24 nov. 2026 (Pedro): palabra y refrán SIN fondo de color: tarjeta blanca como las demás */
${S} #pdCard{position:relative;overflow:hidden;border-radius:20px!important;min-height:150px;background:#fff!important;color:#1d1d1d!important;border:1px solid rgba(29,45,35,.08)!important;box-shadow:0 4px 16px rgba(29,45,35,.08);padding:14px!important;justify-content:space-between}

${S} #pdCard>*{position:relative;z-index:1}
${S} #pdCard .pdK{display:flex!important;align-items:center;gap:8px;color:#2e6b2a!important;text-transform:none!important;letter-spacing:0!important;font-size:14.5px!important;font-weight:800!important;line-height:1.2}
${S} #pdCard .pdK .icS{flex:none;width:30px;height:30px;padding:6px;box-sizing:border-box;border-radius:9px;background:#2e6b2a;color:#fff}
${S} #pdCard .pdP{font-size:19px!important;color:#1d1d1d!important;text-shadow:none!important;margin-top:auto}
${S} #pdCard .pdP b{color:#1b5e20!important;font-size:22px!important}
${S} #pdCard .pdN{color:#5b6660!important}${S} #pdCard .pdF{display:none!important}
${S} #rfCard{position:relative;overflow:hidden;border-radius:20px!important;background:#fff!important;border:1px solid rgba(29,45,35,.08)!important;box-shadow:0 4px 16px rgba(29,45,35,.08);padding:0!important;min-height:150px}
${S} #rfCard .rfX{display:flex!important;flex-direction:column;gap:6px;padding:0 12px}
${S} #rfCard .rfK{display:flex!important;align-items:center;gap:7px;margin:0 -12px;padding:10px 12px;min-height:44px;box-sizing:border-box;color:#5b1f8a!important;text-transform:none!important;letter-spacing:0!important;font-size:14.5px!important;font-weight:900!important;
  background:transparent}
${S} #rfCard .rfK .icS{flex:none;width:28px;height:28px;padding:5px;box-sizing:border-box;border-radius:8px;background:#6a2fa3;color:#fff}
${S} #rfCard .rfT{font-style:italic;font-size:15px!important;line-height:1.3!important;color:#1d1d1d!important;-webkit-line-clamp:4!important}
${S} #rfCard .rfM{color:#5b6660!important}
${S} #rfCard .rfB{margin:6px 12px 12px!important;align-self:flex-start;border:1.5px solid #6a2fa3!important;color:#5b1f8a!important;background:#fff!important;border-radius:999px!important;padding:6px 14px!important;font-weight:800!important;font-size:13.5px!important}
/* 4 · noticia curiosa */
${S} #cuCard{align-items:center!important;gap:12px!important;padding:10px 12px!important;border-radius:20px!important;background:#fdf1e6!important;border:1px solid #f5d9bf!important;box-shadow:0 4px 16px rgba(120,60,10,.08);margin:12px 0!important}
${S} #cuCard .cuI{flex:none;width:76px;height:76px;border-radius:14px;background:#f6c9a3;font-size:0!important;display:none!important}
${S} #cuCard .cuK{display:flex!important;align-items:center;gap:6px;text-transform:none!important;letter-spacing:0!important;font-size:14px!important;font-weight:900!important;color:#d84315!important}
${S} #cuCard .cuK .icS{flex:none;color:#d84315}
${S} #cuCard .cuT{font-size:15.5px!important;font-weight:800!important;color:#1d1d1d}
${S} #cuCard .cuM{font-size:12.5px!important;color:#7a6a5f!important}
${S} #cuCard .cuO{border:1.5px solid #e65100!important;color:#d84315!important;background:#fff!important;border-radius:999px!important;padding:6px 12px!important;font-weight:800!important;font-size:13.5px!important}
/* 5 · la semana · 24 nov. 2026 (Pedro): fuera del Inicio */
${S} #seHome{display:none!important}
${S} #seHome>b{font-size:17px!important;font-weight:900!important;margin:16px 4px 8px!important}
body.bna.ifIni #seBody{gap:12px!important}
body.bna.ifIni #seBody>.card.seF{padding:12px 10px 10px!important;border-radius:20px!important;border:1px solid rgba(29,45,35,.06)!important;box-shadow:0 4px 16px rgba(29,45,35,.08)!important;display:flex;flex-direction:column;gap:10px}
body.bna.ifIni #seBody>.card.seF>b{display:flex!important;align-items:center;gap:8px;font-size:15.5px!important;font-weight:900!important;line-height:1.2!important}
body.bna.ifIni #seBody>.card.seF>b .seI{flex:none;font-size:30px;line-height:1}
body.bna.ifIni #seBody>.card.seF>:not(b):not(.seP){display:none!important}
body.bna.ifIni #seBody .seP{position:relative;height:118px;border-radius:14px;background:#7d8f86;overflow:hidden;display:flex;align-items:flex-end;padding:8px}
body.bna.ifIni #seBody .seP:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 35%,rgba(0,0,0,.45))}
body.bna.ifIni #seBody .seV{position:relative;flex:1;min-width:0;border:1.5px solid rgba(255,255,255,.75);border-radius:14px;background:rgba(20,30,25,.38);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);color:#fff;padding:6px 10px}
body.bna.ifIni #seBody .seV small{display:block;font-size:12px;opacity:.95;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
body.bna.ifIni #seBody .seV b{display:block;font-size:17px;font-weight:900;line-height:1.15;overflow-wrap:anywhere}`;
document.head.appendChild(st);

/* 1 · río: olas delante del título */
function rio(){const w=document.querySelector('#rzTk .anC.hoyR .anW');   // solo en las tarjetas de río (no en titulares ni agenda)
  if(w&&!w.querySelector('.icS'))w.insertAdjacentHTML('afterbegin',ic('ola',20));}
/* 2 · agenda: foto según la etiqueta, calendario delante de la fecha y flecha a la derecha */
function agenda(){const c=document.querySelector('#anTk .anC');if(!c)return;const e=c.querySelector('.anE'),bd=c.querySelector('.bdg'),t=bd?bd.textContent.trim():'';
  const f=F.ag[t]||(Object.keys(F.ag).find(k=>T(k)===t)&&F.ag[Object.keys(F.ag).find(k=>T(k)===t)]);
  if(e){if(f){e.classList.add('icF');const u=`url("${f}")`;if(e.style.backgroundImage!==u)e.style.backgroundImage=u;}else{e.classList.remove('icF');e.style.backgroundImage='';}}
  const w=c.querySelector('.anW');if(w&&!w.querySelector('.icS'))w.insertAdjacentHTML('afterbegin',ic('cal',18));
  if(!c.querySelector('.icFl')&&!c.textContent.includes('Cargando'))c.insertAdjacentHTML('beforeend',ic('flecha',22).replace('class="icS"','class="icS icFl"'));}
const T=s=>{try{return window.T?window.T(s):s;}catch(e){return s;}};
/* 3 · palabra y refrán: iconos de línea */
function pares(){const k=document.querySelector('#pdCard .pdK');if(k&&!k.querySelector('.icS'))k.insertAdjacentHTML('afterbegin',ic('hoja',18));
  const r=document.querySelector('#rfCard .rfK');if(r&&!r.querySelector('.icS'))r.insertAdjacentHTML('afterbegin',ic('comillas',18));}
/* 4 · curiosa */
function curiosa(){const k=document.querySelector('#cuCard .cuK');if(k&&!k.querySelector('.icS'))k.insertAdjacentHTML('afterbegin',ic('megafono',18));}
/* 5 · la semana: icono grande, foto y el dato principal en una pastilla */
const EMO=/^((?:[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}][\u{FE0F}\u{200D}]*)+)\s*/u;
function semana(){if(!document.body.classList.contains('ifIni'))return;const B=$('seBody');if(!B)return;
  [...B.querySelectorAll(':scope>.card')].forEach((c,i)=>{if(c.classList.contains('seF'))return;const b=c.querySelector(':scope>b');if(!b)return;
    const k=c.querySelector('.kpi>div'),n=c.querySelector(':scope>.note');let lab='',val='';
    if(k){lab=(k.querySelector('.note')||{}).textContent||'';const vb=k.querySelector('b');val=vb?vb.textContent.trim():'';}
    else if(n){const tx=n.textContent.trim().replace(EMO,'');const m=tx.match(/^([^:]+):\s*(.+)$/);lab=m?m[1]:'';val=m?m[2]:tx;}
    if(!val)return;
    const m=b.textContent.match(EMO);if(m){b.innerHTML=`<span class="seI">${m[1]}</span><span>${b.textContent.replace(EMO,'')}</span>`;}
    c.classList.add('seF');
    c.insertAdjacentHTML('beforeend',`<div class="seP" style="background:${F.semCol[i%F.semCol.length]}"><div class="seV"><small></small><b></b></div></div>`);
    const v=c.querySelector('.seV');v.querySelector('small').textContent=lab.trim();v.querySelector('b').textContent=val;});}
function todo(){try{rio();agenda();pares();curiosa();semana();}catch(e){console.log('inicio-centro',e);}}
const H=$('t-mtiempo');if(H)new MutationObserver(todo).observe(H,{childList:true,subtree:true});
todo();setTimeout(todo,800);setTimeout(todo,3000);
})();
/* 25 nov. 2026 (lo pidió Pedro): en «Titulares de hoy», una foto pequeña del niño vendedor de
   periódicos en lugar del icono del periódico. Solo en esa tarjeta (.hoyN); el resto sigue igual. */
(function(){const st=document.createElement('style');st.textContent=`
.anC.hoyN>.anE{flex:none;width:58px!important;height:58px!important;min-height:0!important;align-self:center!important;border-radius:12px!important;background:#8a8a8a url("foto-titulares.webp") center/cover no-repeat!important;font-size:0!important;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)}
.anC.hoyN>.anE>*{display:none!important}`;document.head.appendChild(st);})();
