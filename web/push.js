/* =====================================================================
   📲 AVISOS AL MOMENTO · push (21 nov. 2026, necesita la app 5.3 / código 33) — se carga después de juegos3.js
   - Ajustes → «📲 Avisos al momento»: cada usuario elige los temas (PU_T). Se guardan en CFG.push y se
     mandan a Android con AndroidNet.setPush, que apunta o da de baja el móvil en cada tema de Firebase.
     Con temas NO guardamos ningún identificador del móvil.
   - Quien manda los avisos es el robot tools/push.py (GitHub Actions):
       · desaparecidos: tools/noticias.py, cuando sale un titular nuevo de «Se busca» en Navarra.
       · avisos: a mano, desde Actions → «Aviso push» → Run workflow (título, texto y pantalla que abre).
   - Al tocar un aviso se abre su pantalla: Android guarda la pestaña y la web la recoge con AndroidNet.takePushTab.
   - Si se añade un tema: aquí (PU_T), en PushService.TEMAS (Java) y en TEMAS de tools/push.py.
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const PU_T=[['desaparecidos','🔎 Personas desaparecidas en Navarra','En cuanto sale una alerta de «se busca» en los medios navarros.'],
            ['avisos','📢 Avisos importantes de BasatiNA','Muy pocos: novedades grandes de la app o algo que debas saber.']];
const nat=()=>typeof APP!=='undefined'&&APP&&window.AndroidNet&&typeof window.AndroidNet.setPush==='function';
const P=()=>Object.assign({desaparecidos:false,avisos:false},CFG.push||{});
function manda(){try{if(nat())window.AndroidNet.setPush(JSON.stringify(P()));}catch(e){}}

// pantalla que se abre al tocar un aviso
window.puAbrir=function(){try{if(!nat()||!window.AndroidNet.takePushTab)return;const t=window.AndroidNet.takePushTab();
  if(t&&/^[a-z0-9_-]{1,30}$/.test(t)&&document.getElementById('t-'+t)){if(typeof menu==='function')menu(false);showTab(t);}}catch(e){}};
setTimeout(window.puAbrir,1500);setTimeout(window.puAbrir,4000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(window.puAbrir,300);});

// al abrir la app, vuelve a mandar la elección (por si Android perdió los temas)
setTimeout(()=>{if(CFG.push)manda();},3000);

if(typeof ajustesRender==='function'){const _aj=ajustesRender;window.ajustesRender=ajustesRender=function(){_aj.apply(this,arguments);
  const el=$('ajBody');if(!el)return;const p=P();
  el.insertAdjacentHTML('beforeend',`<div class="card" id="puCard"><b>📲 Avisos al momento</b><div class="note">Te llegan en cuanto pasa algo, aunque tengas la app cerrada. Elige cuáles quieres:</div>
   ${nat()?PU_T.map(([k,l,d])=>`<label style="display:flex;gap:8px;align-items:flex-start;margin-top:8px"><input type="checkbox" data-pu="${k}" ${p[k]?'checked':''} style="margin-top:3px"><span><b>${l}</b><br><span class="note">${d}</span></span></label>`).join('')+
     `<div class="row" style="margin-top:8px"><button class="btn" id="puTest">🔔 Probar</button></div><div class="note" style="margin-top:6px">No guardamos nada de tu móvil para esto: te apuntas a un «tema» de Google Firebase y él te los entrega.</div>`
    :'<div class="note">⚠️ Llega con la app de Android actualizada (versión 5.3 o más).</div>'}</div>`);
  el.querySelectorAll('[data-pu]').forEach(c=>c.onchange=()=>{CFG.push=Object.assign(P(),{[c.dataset.pu]:c.checked});cfgSave();manda();});
  const t=$('puTest');if(t)t.onclick=()=>{try{window.AndroidNet.testPush();}catch(e){}};};}

// en «Personas desaparecidas»: botón para activar sus avisos
(function(){const s=$('t-desaparecidos');if(!s)return;const c=s.querySelector('.card');if(!c)return;
  c.insertAdjacentHTML('beforeend','<div class="row" style="margin-top:8px"><button class="btn pri" id="puDs">📲 Avisarme en el móvil</button></div><div class="note" id="puDsN"></div>');
  const pinta=()=>{const on=P().desaparecidos;$('puDs').textContent=on?'✅ Te avisaremos en el móvil':'📲 Avisarme en el móvil';
    $('puDsN').textContent=nat()?(on?'Puedes quitarlo en Ajustes → Avisos al momento.':''):'Llega con la app de Android actualizada (versión 5.3 o más).';};
  $('puDs').onclick=()=>{if(!nat()){pinta();return;}CFG.push=Object.assign(P(),{desaparecidos:!P().desaparecidos});cfgSave();manda();pinta();};
  pinta();})();

try{Object.assign(I18N.eu,{'Avisos al momento':'Berehalako abisuak','Avisarme en el móvil':'Abisatu mugikorrean','Probar':'Probatu'});
  Object.assign(I18N.en,{'Avisos al momento':'Instant alerts','Avisarme en el móvil':'Alert me on my phone','Probar':'Test'});
  Object.assign(I18N.fr,{'Avisos al momento':'Alertes instantanées','Avisarme en el móvil':'M’alerter sur le mobile','Probar':'Tester'});}catch(e){}
window.PU_T=PU_T;
})();
