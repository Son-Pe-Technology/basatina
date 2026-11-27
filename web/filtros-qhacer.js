/* =====================================================================
   🏷️ AGENDA y DEPORTE: filtros como en el resto de la app (27 nov. 2026, petición de Pedro)
   - Agenda cultural: los tipos (Conciertos, Teatro…) pasan de cuadrícula con emojis a la fila de
     botoncitos redondeados que se desliza de lado, sin emojis (como «Todas / Senderos…» de NA a Pie).
   - Deporte: los deportes, igual (fila de botoncitos sin iconos). Las ligas, como son muchas,
     pasan a un desplegable «Liga ▾» (el mismo chip de filtros que Zona, Dificultad…: filtros-chips.js).
   Cómo: envuelve agRender() y dpRender() y, después de que pinten sus botones, los retoca.
   Los botones siguen siendo los mismos, así que todo lo demás (contar, favoritos…) sigue igual.
   Se carga el último (después de ampliacion.js, mejoras.js y filtros-chips.js).
   ===================================================================== */
(function () {
  const $ = id => document.getElementById(id);
  const st = document.createElement('style');
  st.textContent = `
#agCat,#dpDep{display:flex!important;flex-wrap:nowrap!important;gap:6px;overflow-x:auto;padding:4px 2px 8px;margin-top:10px!important;background:none!important;scrollbar-width:none;-webkit-overflow-scrolling:touch}
#agCat::-webkit-scrollbar,#dpDep::-webkit-scrollbar{display:none}
#agCat>button,#dpDep>button{flex:none!important;white-space:nowrap;border-radius:99px!important;padding:8px 14px!important;min-height:38px;font-size:14px!important;font-weight:700;
  background:#fff!important;border:1px solid #dfe6dc!important;color:#1d1d1d!important;box-shadow:none!important}
#agCat>button.on,#dpDep>button.on{background:#3d7031!important;border-color:#3d7031!important;color:#fff!important}
#dpComp{display:none!important}
#dpLigaBox{margin-top:2px}`;
  document.head.appendChild(st);

  // quita iconos (svg) y emojis del principio del botón, dejando solo el nombre
  const EMO = /^(?:[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}][\u{FE0F}\u{200D}\u{20E3}]*\s*)+/u;
  function limpia(id) {
    const el = $(id); if (!el) return;
    el.querySelectorAll(':scope>button').forEach(b => {
      if (b.dataset.lim === b.textContent) return;
      b.querySelectorAll('svg,img,.bt,.icb').forEach(x => x.remove());
      const t = b.textContent.replace(EMO, '').trim();
      if (b.textContent !== t) b.textContent = t;
      b.dataset.lim = b.textContent;
    });
    const on = el.querySelector(':scope>button.on'); if (on && on.offsetParent) try {on.scrollIntoView({inline: 'center', block: 'nearest'});} catch (e) {}
  }

  // 🏆 las ligas: un desplegable que, al elegir, toca el botón de esa liga (que sigue ahí, escondido)
  function ligas() {
    const cs = $('dpComp'); if (!cs) return;
    let box = $('dpLigaBox'), sel = $('dpLiga');
    if (!box) {
      cs.insertAdjacentHTML('beforebegin', '<div id="dpLigaBox"><select id="dpLiga" class="town"></select></div>');
      box = $('dpLigaBox'); sel = $('dpLiga');
      sel.addEventListener('change', () => {const b = [...cs.querySelectorAll('button[data-v]')].find(x => x.dataset.v === sel.value); if (b) b.click();});
      if (typeof msChips === 'function') msChips(box, [{el: sel, nombre: 'Liga'}]);
    }
    const B = [...cs.querySelectorAll('button[data-v]')];
    const html = B.map(b => `<option value="${(b.dataset.v || '').replace(/"/g, '&quot;')}">${b.dataset.v ? b.textContent.replace(EMO, '').trim().replace(/</g, '&lt;') : 'Todas las ligas'}</option>`).join('');
    if (sel.dataset.h !== html) {sel.innerHTML = html; sel.dataset.h = html;}
    const on = cs.querySelector('button.on'); sel.value = on ? on.dataset.v : '';
    sel.style.display = B.length > 1 ? '' : 'none';   // sin ligas que elegir, no sale el chip
    sel.dispatchEvent(new Event('change-pinta'));
  }

  if (typeof agRender === 'function') {const _ag = agRender; agRender = async function () {const r = await _ag.apply(this, arguments); try {limpia('agCat');} catch (e) {} return r;};}
  if (typeof dpRender === 'function') {const _dp = dpRender; dpRender = async function () {const r = await _dp.apply(this, arguments); try {limpia('dpDep'); ligas();} catch (e) {console.log('filtros-qhacer', e);} return r;};}
  const q = $('agPue'); if (q) q.placeholder = q.placeholder.replace(EMO, '');
  try {Object.assign(I18N.eu, {'Liga': 'Liga', 'Todas las ligas': 'Liga guztiak'}); Object.assign(I18N.en, {'Liga': 'League', 'Todas las ligas': 'All leagues'}); Object.assign(I18N.fr, {'Liga': 'Ligue', 'Todas las ligas': 'Toutes les ligues'});} catch (e) {}
  limpia('agCat'); limpia('dpDep');
})();
