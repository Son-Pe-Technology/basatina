/* =====================================================================
   ⚠️ NA a Pie · «Antes de salir hoy» que va pasando (27 nov. 2026, petición de Pedro)
   Qué hace:
   - Los avisos del recuadro de arriba (cortes de caminos, AEMET, batidas, carreteras cortadas…)
     salen de uno en uno y van pasando solos cada 6 segundos, como los titulares del Inicio.
   - Abajo: ‹ 1 / 3 › para pasarlos a mano y una barrita que se va llenando.
   - Si abres un aviso para leer el detalle, se queda quieto hasta que lo cierres.
   - Si solo hay un aviso (o ninguno), se ve como siempre, sin flechas.
   Cómo: envuelve moAvisos() de index.html. Después de que pinte el recuadro, deja visible
   solo un aviso (.avd) y esconde el resto.
   ===================================================================== */
(function () {
  if (typeof moAvisos !== 'function') return;
  const MS = 6000, S = {i: 0, tm: null};
  const st = document.createElement('style');
  st.textContent = `
#moAv .avd.maOff{display:none}
#moAv .avd.maOn{animation:maEntra .45s ease}
.maPie{display:flex;align-items:center;gap:10px;margin-top:8px;font-size:12.5px;color:var(--mut)}
.maPie button{background:none;border:1px solid var(--line);border-radius:99px;width:30px;height:30px;font-size:17px;line-height:1;color:var(--txt);cursor:pointer;flex:none}
.maBar{flex:1;height:3px;border-radius:2px;background:var(--line);overflow:hidden}
.maBar i{display:block;height:100%;width:0;background:#ff8a3d}
.maBar i.va{width:100%;transition:width ${MS}ms linear}
@keyframes maEntra{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){#moAv .avd.maOn{animation:none}.maBar i.va{transition:none}}`;
  document.head.appendChild(st);

  const caja = () => document.getElementById('moAv');
  const items = () => {const el = caja(); return el ? [...el.querySelectorAll(':scope > .avd')] : [];};
  const visible = () => {const s = document.getElementById('t-monte'); return s && s.classList.contains('on') && !document.hidden;};

  function ver(i) {
    const L = items(), el = caja(); if (L.length < 2 || !el) return;
    S.i = (i + L.length) % L.length;
    L.forEach((d, k) => {d.classList.toggle('maOff', k !== S.i); d.classList.toggle('maOn', k === S.i); if (k !== S.i && d.open) d.open = false;});
    const n = el.querySelector('.maN'); if (n) n.textContent = `${S.i + 1} / ${L.length}`;
    const b = el.querySelector('.maBar i');
    if (b) {b.classList.remove('va'); void b.offsetWidth; if (S.tm) b.classList.add('va');}
  }
  function arranca() {
    clearInterval(S.tm); S.tm = null;
    if (items().length < 2) return;
    if (!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches))
      S.tm = setInterval(() => {
        const L = items(); if (!visible() || L.length < 2) return;
        if (L.some(d => d.open)) return;   // está leyendo uno: no lo cambiamos
        ver(S.i + 1);
      }, MS);
    ver(S.i);
  }
  function monta() {
    const el = caja(), L = items(); if (!el) return;
    el.querySelectorAll('.maPie').forEach(x => x.remove());
    if (L.length < 2) {L.forEach(d => d.classList.remove('maOff', 'maOn')); clearInterval(S.tm); S.tm = null; return;}
    if (S.i >= L.length) S.i = 0;
    L[L.length - 1].insertAdjacentHTML('afterend', `<div class="maPie"><button class="maP" aria-label="Anterior">‹</button><span class="maN"></span><div class="maBar"><i></i></div><button class="maX" aria-label="Siguiente">›</button></div>`);
    el.querySelector('.maP').onclick = () => {ver(S.i - 1); arranca();};
    el.querySelector('.maX').onclick = () => {ver(S.i + 1); arranca();};
    // al cerrar el detalle de un aviso, vuelve a pasar solo
    L.forEach(d => d.addEventListener('toggle', () => {const b = el.querySelector('.maBar i'); if (!b) return;
      if (d.open) b.classList.remove('va'); else {b.classList.remove('va'); void b.offsetWidth; b.classList.add('va');}}));
    // pasar con el dedo
    let x0 = null;
    el.ontouchstart = e => {x0 = e.touches[0].clientX;};
    el.ontouchend = e => {if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50 && !items().some(d => d.open)) {ver(S.i + (dx < 0 ? 1 : -1)); arranca();}};
    arranca();
  }

  const _mo = moAvisos;
  moAvisos = async function () {const r = await _mo.apply(this, arguments); try {monta();} catch (e) {console.log('monte-avisos', e);} return r;};
  if (items().length) monta();
})();
