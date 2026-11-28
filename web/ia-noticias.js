/* =====================================================================
   🤖 IA DE BASATINA EN LA APP (23 nov. 2026) — se carga el último
   1. Noticias → «Noticias de BasatiNA»: las que escribió la IA y vosotros publicasteis (con «Según…» y enlaces).
   2. Noticias → «Borradores de la IA» (solo Administrador): leer, corregir, Publicar o Descartar.
      Los borradores están en un repositorio PRIVADO (Son-Pe-Technology/basatina-borradores, ia_borradores.json):
      solo los ve quien tenga una llave con acceso a él. Al Publicar, la noticia se copia a
      noticias/ia_publicadas.json (público), que es lo que ve todo el mundo.
   3. Inicio → «Navarra hoy»: el resumen de la mañana (noticias/navarra_hoy.json), arriba de «Ahora en Navarra».
   Los archivos los prepara el robot (tools/ia_noticias.py y tools/ia_hoy.py, .github/workflows/ia.yml).
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const PUB_PATH='noticias/ia_publicadas.json',PUB_DEF={items:[]},HOY_PATH='noticias/navarra_hoy.json';
/* borradores: repositorio privado, leído y escrito con la llave del móvil */
const BR_REPO='https://api.github.com/repos/Son-Pe-Technology/basatina-borradores',BR_API=BR_REPO+'/contents/ia_borradores.json';
const brH=()=>({Authorization:'Bearer '+ghTok(),Accept:'application/vnd.github+json'});
let BR={d:{items:[]},sha:null};
async function brLoad(){const r=await fetch(BR_API+'?t='+Date.now(),{headers:brH(),cache:'no-store'});
  if(r.ok){const j=await r.json();BR={d:JSON.parse(ub64(j.content)),sha:j.sha};return BR.d;}
  if(r.status===404){const q=await fetch(BR_REPO,{headers:brH(),cache:'no-store'});
    if(!q.ok)throw new Error('La llave de este móvil no tiene acceso al repositorio basatina-borradores');
    BR={d:{items:[]},sha:null};return BR.d;}
  throw new Error('GitHub respondió '+r.status);}
async function brEdit(fn,msg){await brLoad();fn(BR.d);
  const r=await fetch(BR_API,{method:'PUT',headers:Object.assign({'Content-Type':'application/json'},brH()),
    body:JSON.stringify({message:msg+' ('+(edName()||'app')+')',content:b64u(JSON.stringify(BR.d,null,1)),sha:BR.sha||undefined})});
  if(!r.ok)throw new Error('No se pudo guardar ('+r.status+')');BR.sha=(await r.json()).content.sha;}
const X=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const abre=u=>{if(window.amAbre)amAbre(u);else if(typeof APP!=='undefined'&&APP&&window.AndroidNet&&AndroidNet.openUrl)AndroidNet.openUrl(u);else window.open(u,'_blank');};
const cuando=d=>{try{return typeof hace==='function'?hace(d):new Date(d).toLocaleString('es-ES');}catch(e){return '';}};
const st=document.createElement('style');st.textContent=`
#iaPub .iaN{padding:12px 0;border-top:1px solid #eef2ec}#iaPub .iaN:first-of-type{border-top:none}
#iaPub .iaM{font-size:12.5px;color:#5b6660;margin-bottom:3px}
#iaPub .iaT{font-weight:900;font-size:16.5px;line-height:1.25;color:#1d1d1d;cursor:pointer;display:flex;gap:8px;align-items:flex-start;-webkit-tap-highlight-color:transparent}
#iaPub .iaT>span{flex:1}
#iaPub .iaT>i{font-style:normal;color:#3d7031;font-size:15px;flex:none;margin-top:1px;transition:transform .2s}
#iaPub .iaN.abierta .iaT>i{transform:rotate(90deg)}
/* 28 nov. 2026 (Pedro): solo se ve el titular; al tocarlo se despliega la noticia entera */
#iaPub .iaX{font-size:14.5px;line-height:1.45;margin-top:6px;color:#2a302c;display:none;white-space:pre-line}
#iaPub .iaS{display:none}
#iaPub .iaN.abierta .iaX,#iaPub .iaN.abierta .iaS{display:block}
#iaPub .iaS{font-size:12.5px;color:#5b6660;margin-top:6px}#iaPub .iaS a{color:#3d7031;font-weight:700;cursor:pointer}
#iaPub .iaPie{font-size:11.5px;color:#7b857f;margin-top:8px}
#iaAdm .iaB{border:1px solid #e3e8e1;border-radius:14px;padding:10px;margin-top:10px;background:#fff}
#iaAdm .iaB.duda{border-color:#f0b429;background:#fffaf0}
#iaAdm .iaB input,#iaAdm .iaB textarea{width:100%;box-sizing:border-box;font:inherit;font-size:14px;border:1px solid #dfe6dc;border-radius:10px;padding:8px;margin-top:6px}
#iaAdm .iaB textarea{min-height:120px}
#iaAdm .iaD{color:#9a5b00;font-size:13px;margin-top:6px}#iaAdm .iaD li{margin:2px 0}
#iaAdm .iaF{font-size:12.5px;color:#5b6660;margin-top:6px}#iaAdm .iaF a{color:#3d7031;cursor:pointer}
#iaAdm .iaBt{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
/* 28 nov. 2026: Corregir y Retirar, dos botones iguales debajo de quién la publicó */
#iaPub .iaBt.iaBt2{display:grid!important;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}#iaPub .iaBt.iaBt2 .iaM{grid-column:1/-1}#iaPub .iaBt.iaBt2 .btn{width:100%;margin:0;justify-content:center;text-align:center}
#iaHoy{background:#fff;border-radius:20px;border:1px solid rgba(29,45,35,.06);box-shadow:0 4px 16px rgba(29,45,35,.08);padding:14px 16px;margin:0 0 12px}
#iaHoy .iaHk{display:flex;align-items:center;gap:8px;color:#b26a00;font-weight:900;font-size:14px}
#iaHoy .iaHt{font-weight:900;font-size:17px;margin:4px 0 6px;line-height:1.25}
#iaHoy ul{margin:0;padding-left:18px}#iaHoy li{font-size:14px;line-height:1.4;margin:3px 0;color:#2a302c}
#iaHoy .iaPie{font-size:11px;color:#7b857f;margin-top:6px}`;
document.head.appendChild(st);

/* ---------- 1 y 2 · en Noticias ---------- */
function sitio(){const sec=$('t-noticias'),nc=$('nwC');if(!sec||!nc)return null;const ref=nc.closest('.card')||sec.querySelector('.card');
  if(!$('iaPub')){ref.insertAdjacentHTML('beforebegin','<div class="card" id="iaPub" style="display:none"></div><div class="card tech" id="iaAdm"><b>🤖 Borradores de la IA</b><div class="note">Cargando…</div></div>');}
  return true;}
const adminOk=()=>typeof TECH!=='undefined'&&TECH&&typeof ghTok==='function'&&!!ghTok();
async function pinta(fresh){if(!sitio())return;const PD=await jsLoad(PUB_PATH,PUB_DEF,fresh);
  const P=(PD.items||[]).slice(0,12),pub=$('iaPub');
  pub.style.display=P.length?'':'none';
  pub.innerHTML=`<b>📰 Noticias de BasatiNA</b>`+P.map(x=>`<div class="iaN" data-id="${X(x.id)}"><div class="iaM">${X([x.pueblo,x.cat].filter(Boolean).join(' · '))}${x.pub?' · '+X(cuando(x.pub)):''}</div>
    <div class="iaT"><span>${X(x.titulo)}</span><i>▸</i></div><div class="iaX">${X(x.texto)}</div>
    <div class="iaS">Según ${(x.fuentes||[]).filter((f,i,a)=>a.findIndex(y=>y.f===f.f)===i).map(f=>`<a data-u="${X(f.u)}">${X(f.f)}</a>`).join(', ')}</div>
    ${adminOk()?`<div class="iaBt tech iaBt2"><span class="iaM">${x.auto?'Publicada sola por la IA':'Publicada a mano'}</span><button class="btn" data-cor="${X(x.id)}">Corregir</button><button class="btn" data-ret="${X(x.id)}">Retirar</button></div>`:''}</div>`).join('')+
    `<div class="iaPie">Redactadas por BasatiNA con ayuda de IA a partir de lo que cuentan al menos dos medios. Las de sucesos se revisan siempre a mano. La noticia completa está en cada medio.</div>`;
  pub.querySelectorAll('.iaT,.iaX').forEach(e=>e.onclick=()=>e.closest('.iaN').classList.toggle('abierta'));
  // ↩️ Retirar (solo Administrador): la quita de lo público y la marca como «retirada» en los borradores
  pub.querySelectorAll('button[data-ret]').forEach(b=>b.onclick=async()=>{const id=b.dataset.ret;
    if(!confirm('¿Retirar esta noticia? Dejará de verse en la app.'))return;b.disabled=true;
    try{await jsEdit(PUB_PATH,PUB_DEF,d=>{d.items=(d.items||[]).filter(y=>y.id!==id);},'IA: noticia retirada');
      try{await brEdit(d=>{const it=(d.items||[]).find(y=>y.id===id);if(it){it.estado='retirada';it.retirada=new Date().toISOString().slice(0,16)+'Z';}},'IA: noticia retirada');}catch(e){}
      toast('↩️ Retirada');pinta(true);}
    catch(e){b.disabled=false;toast('❌ '+e.message);}});
  pub.querySelectorAll('a[data-u]').forEach(a=>a.onclick=()=>abre(a.dataset.u));
  // ✏️ Corregir (24 nov. 2026, Pedro): cambiar titular y texto de una noticia ya publicada (erratas, datos…)
  pub.querySelectorAll('button[data-cor]').forEach(b=>b.onclick=()=>{const id=b.dataset.cor,n=b.closest('.iaN'),x=P.find(y=>y.id===id);if(!x||n.querySelector('.iaEd'))return;
    n.classList.add('abierta');const ed=document.createElement('div');ed.className='iaEd';
    ed.innerHTML=`<input class="iaIt" value="${X(x.titulo)}" aria-label="Titular" style="width:100%;box-sizing:border-box;margin-top:8px">
      <textarea class="iaIx" aria-label="Texto" style="width:100%;box-sizing:border-box;min-height:140px;margin-top:6px">${X(x.texto)}</textarea>
      <div class="iaBt"><button class="btn pri" data-g="1">💾 Guardar</button><button class="btn" data-c="1">Cancelar</button></div><div class="iaM" data-m="1"></div>`;
    n.querySelector('.iaT').style.display='none';n.querySelector('.iaX').style.display='none';b.closest('.iaBt').before(ed);
    ed.querySelector('[data-c]').onclick=()=>pinta(false);
    ed.querySelector('[data-g]').onclick=async e=>{const t=ed.querySelector('.iaIt').value.trim(),tx=ed.querySelector('.iaIx').value.trim(),m=ed.querySelector('[data-m]');
      if(!t||!tx)return m.textContent='El titular y el texto no pueden quedar vacíos.';e.target.disabled=true;m.textContent='Guardando…';
      try{await jsEdit(PUB_PATH,PUB_DEF,d=>{const it=(d.items||[]).find(y=>y.id===id);if(!it)throw new Error('ya no está publicada');it.titulo=t;it.texto=tx;it.corregida=new Date().toISOString().slice(0,16)+'Z';},'Noticia corregida a mano');
        try{await brEdit(d=>{const it=(d.items||[]).find(y=>y.id===id);if(it){it.titulo=t;it.texto=tx;}},'Noticia corregida a mano');}catch(x){}
        toast('✏️ Noticia corregida');pinta(true);}
      catch(x){e.target.disabled=false;m.textContent='❌ '+x.message;}};});
  // administrador
  const adm=$('iaAdm');if(!adm)return;
  if(!(typeof TECH!=='undefined'&&TECH)||!ghTok()){adm.innerHTML='<b>🤖 Borradores de la IA</b><div class="note">Hace falta la llave de GitHub en este móvil.</div>';return;}
  let D;try{D=await brLoad();}catch(e){adm.innerHTML=`<b>🤖 Borradores de la IA</b><div class="note">❌ ${X(e.message)}</div>`;return;}
  const L=D.items||[],Pd=L.filter(x=>x.estado==='borrador'||x.estado==='duda');
  adm.innerHTML=`<b>🤖 Borradores de la IA</b><div class="note">${Pd.length?`${Pd.length} pendiente(s) que la IA no se ha atrevido a publicar sola. Corrige lo que haga falta y dale a Publicar. Las de sucesos, siempre revisadas a mano.`:'No hay borradores pendientes.'}${D.t?' · Última pasada del robot: '+X(cuando(D.t)):''}</div>`+
    Pd.map(x=>`<div class="iaB ${x.estado==='duda'?'duda':''}" data-id="${X(x.id)}">
      <div class="iaM" style="font-size:12.5px;color:#5b6660">${x.auto_motivo?'✋ No publicada sola: '+X(x.auto_motivo)+' · ':''}${x.estado==='duda'?'⚠️ CON DUDAS · ':''}${X([x.cat,x.pueblo].filter(Boolean).join(' · '))} · ${X(cuando(x.creada))}</div>
      <input class="iaIt" value="${X(x.titulo)}" aria-label="Titular"><textarea class="iaIx" aria-label="Texto">${X(x.texto)}</textarea>
      ${(x.dudas||[]).length?`<ul class="iaD">${x.dudas.map(d=>`<li>${X(d)}</li>`).join('')}</ul>`:''}
      ${(x.datos||[]).length?`<div class="iaF">Datos comparados: ${x.datos.map(d=>`${d.coinciden===false?'❌':'✅'} ${X(d.dato)}`).join(' · ')}</div>`:''}
      <div class="iaF">Fuentes (texto leído: ${X((x.leidas||[]).join(', ')||'—')}):<br>${(x.fuentes||[]).map(f=>`<a data-u="${X(f.u)}">${X(f.f)}: ${X(f.t)}</a>`).join('<br>')}</div>
      <div class="iaBt"><button class="btn pri" data-a="pub">✅ Publicar</button><button class="btn" data-a="gua">💾 Guardar cambios</button><button class="btn" data-a="des">🗑️ Descartar</button></div></div>`).join('');
  adm.querySelectorAll('a[data-u]').forEach(a=>a.onclick=()=>abre(a.dataset.u));
  adm.querySelectorAll('.iaB button[data-a]').forEach(b=>b.onclick=async()=>{const c=b.closest('.iaB'),id=c.dataset.id,a=b.dataset.a;
    const t=c.querySelector('.iaIt').value.trim(),x=c.querySelector('.iaIx').value.trim();
    if(a==='des'&&!confirm('¿Descartar esta noticia?'))return;
    b.disabled=true;
    try{const pubF=new Date().toISOString().slice(0,16)+'Z';
      if(a==='pub'){const it=((BR.d||{}).items||[]).find(y=>y.id===id);if(!it)throw new Error('No encuentro el borrador; recarga');
        // 1) se copia al archivo público (solo lo que se ve en la app)
        await jsEdit(PUB_PATH,PUB_DEF,d=>{d.items=(d.items||[]).filter(y=>y.id!==id);
          d.items.unshift({id,pub:pubF,titulo:t,texto:x,pueblo:it.pueblo||'',cat:it.cat||'',fuentes:(it.fuentes||[]).map(f=>({f:f.f,u:f.u}))});
          d.items=d.items.slice(0,40);},'IA: noticia publicada');}
      // 2) se marca en los borradores (privado)
      await brEdit(d=>{const it=(d.items||[]).find(y=>y.id===id);if(!it)return;it.titulo=t;it.texto=x;
        if(a==='pub'){it.estado='publicada';it.pub=pubF;}if(a==='des')it.estado='descartada';},
        a==='pub'?'IA: noticia publicada':a==='des'?'IA: noticia descartada':'IA: noticia corregida');
      toast(a==='pub'?'✅ Publicada':a==='des'?'🗑️ Descartada':'💾 Guardado');pinta(true);}
    catch(e){b.disabled=false;toast('❌ '+e.message);}});}
if(typeof hook==='function')hook('noticias',()=>pinta());
else{const _s=showTab;showTab=function(t){_s.apply(this,arguments);if(t==='noticias')setTimeout(pinta,60);};}

/* ---------- 3 · Navarra hoy en el Inicio ---------- */
let HOY=null,HOYt=0;
async function hoy(){const H=$('bnaHome');if(!H)return;const now=H.querySelector('.bnaNow');if(!now)return;
  if(!HOY||Date.now()-HOYt>30*60e3){HOYt=Date.now();try{const r=await fetch((typeof GH_RAW!=='undefined'?GH_RAW:'')+HOY_PATH+'?t='+Math.floor(Date.now()/600000),{cache:'no-store'});HOY=r.ok?await r.json():null;}catch(e){HOY=null;}}
  let c=$('iaHoy');const d=new Date(),hoyS=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  if(!HOY||HOY.f!==hoyS||!(HOY.lineas||[]).length){if(c)c.remove();return;}
  if(!c){c=document.createElement('article');c.id='iaHoy';}
  if(now.firstElementChild!==c)now.prepend(c);
  const h=`<div class="iaHk"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></g></svg><span>Navarra hoy</span></div>
    <div class="iaHt">${X(HOY.titulo)}</div><ul>${HOY.lineas.map(l=>`<li>${X(l)}</li>`).join('')}</ul><div class="iaPie">Resumen hecho por BasatiNA con ayuda de IA, con datos de Open‑Meteo, la agenda y los titulares de los medios.</div>${adminOk()?'<div class="iaBt"><button class="btn" id="iaHoyCor">✏️ Corregir</button></div>':''}`;
  if(c.dataset.h!==h){c.innerHTML=h;c.dataset.h=h;
    const cb=$('iaHoyCor');if(cb)cb.onclick=()=>{   // ✏️ corregir «Navarra hoy» (24 nov. 2026): una línea por renglón
      c.querySelector('ul').outerHTML=`<div class="iaEd"><input id="iaHoyT" value="${X(HOY.titulo)}" aria-label="Titular" style="width:100%;box-sizing:border-box;margin-top:4px">
        <textarea id="iaHoyL" aria-label="Líneas" style="width:100%;box-sizing:border-box;min-height:160px;margin-top:6px">${X(HOY.lineas.join('\n'))}</textarea>
        <div class="iaPie">Una línea por renglón.</div><div class="iaBt"><button class="btn pri" id="iaHoyG">💾 Guardar</button><button class="btn" id="iaHoyC">Cancelar</button></div><div class="iaPie" id="iaHoyM"></div></div>`;
      c.querySelector('.iaHt').style.display='none';cb.style.display='none';
      $('iaHoyC').onclick=()=>{c.dataset.h='';hoy();};
      $('iaHoyG').onclick=async()=>{const t=$('iaHoyT').value.trim(),L=$('iaHoyL').value.split('\n').map(x=>x.trim()).filter(Boolean);
        if(!t||!L.length)return $('iaHoyM').textContent='No puede quedar vacío.';$('iaHoyG').disabled=true;$('iaHoyM').textContent='Guardando…';
        try{await jsEdit(HOY_PATH,{},d=>{d.titulo=t;d.lineas=L.slice(0,8);d.corregido=new Date().toISOString().slice(0,16)+'Z';},'Navarra hoy corregido a mano');
          HOY=Object.assign({},HOY,{titulo:t,lineas:L.slice(0,8)});c.dataset.h='';toast('✏️ «Navarra hoy» corregido');hoy();}
        catch(x){$('iaHoyG').disabled=false;$('iaHoyM').textContent='❌ '+x.message;}};};}}
const H=$('bnaHome');if(H)new MutationObserver(()=>{if(!$('iaHoy')||!H.querySelector('.bnaNow')||H.querySelector('.bnaNow').firstElementChild!==$('iaHoy'))hoy();}).observe(H,{childList:true,subtree:true});
setTimeout(hoy,1200);setInterval(()=>{if(!document.hidden)hoy();},30*60e3);
})();
