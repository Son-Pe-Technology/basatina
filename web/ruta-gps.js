/* =====================================================================
   🧭 SEGUIR UNA RUTA CON EL GPS (25 nov. 2026, lo pidió Pedro) · fase 1, sin APK nueva
   En la ficha de cada ruta de NA a Pie sale «▶️ Seguir esta ruta con el GPS». Al pulsarlo:
     · tu posición (punto azul) y la precisión del GPS (círculo) se pintan encima del recorrido;
     · el mapa te sigue (botón 🎯 para volver a centrarte si lo mueves con el dedo);
     · panel con lo recorrido, lo que queda (km y desnivel) y la hora estimada de llegada,
       calculada con la norma DIN 33466 y corregida con tu ritmo real;
     · si te sales más de 40 m del camino, aviso con pitido (y vibración si el móvil lo deja)
       y te dice hacia dónde queda el camino; al volver, otro aviso corto;
     · al llegar al final, «¡Has llegado!».
   Cómo se calcula: cada posición se compara con todos los tramos de la ruta (en metros) y se
   coge el más cercano; si la ruta pasa dos veces por el mismo sitio (ida y vuelta), se elige el
   tramo más cercano a lo que ya llevabas recorrido, para que no salte del principio al final.
   Límites de esta fase: solo funciona con la app abierta y la pantalla encendida (Android para el
   GPS de las páginas al apagarla). Se intenta que la pantalla no se apague (Wake Lock); si el
   móvil no lo permite, se avisa. La fase 2 (APK) hará que siga con la pantalla apagada.
   Se carga después de rutas-ui.js: envuelve ruFicha y ruCerrar, y dibuja encima de RU.map.
   ===================================================================== */
(function(){
if (typeof ruFicha !== 'function' || typeof RU === 'undefined') return;
const $ = id => document.getElementById(id);
const T = (s, v) => (typeof ruT === 'function' ? ruT(s, v) : s);
const F1 = x => (typeof ruF === 'function' ? ruF(x) : (Math.round(x * 10) / 10).toString().replace('.', ','));
const SALIDA = 40, VUELTA = 25;          // metros: fuera del camino / de vuelta en el camino
const G = {on: false, r: null, w: null, pos: null, acc: null, d: null, along: null, i0: 0, en: false, fuera: 0, aviso: false,
  sigue: true, t0: 0, a0: null, lastBase: 0, lastBaseP: null, wl: null, ac: null, fin: false, seg: null};

/* ---------- geometría en metros (aproximación plana, de sobra para una ruta) ---------- */
const KLA = 110540, KLO = la => 111320 * Math.cos(la * Math.PI / 180);
function prepara(r) {     // tramos de la ruta en metros respecto a la salida, con km acumulados
  const L = r.lin, la0 = L[0][0], lo0 = L[0][1], k = KLO(la0), S = [];
  const xy = p => [(p[1] - lo0) * k, (p[0] - la0) * KLA];
  for (let i = 1; i < L.length; i++) S.push({a: xy(L[i - 1]), b: xy(L[i]), c: RU.cum[i - 1], l: RU.cum[i] - RU.cum[i - 1], i});
  return {S, xy, tot: RU.cum[RU.cum.length - 1]};
}
function cercano(g, la, lo) {   // tramo más cercano: distancia (m), km recorridos y el punto del camino
  const p = g.xy([la, lo]); const C = [];
  for (const s of g.S) {const dx = s.b[0] - s.a[0], dy = s.b[1] - s.a[1], l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((p[0] - s.a[0]) * dx + (p[1] - s.a[1]) * dy) / l2));
    const qx = s.a[0] + t * dx, qy = s.a[1] + t * dy; C.push({d: Math.hypot(p[0] - qx, p[1] - qy), km: s.c + t * s.l, q: [qx, qy], s});}
  const min = Math.min(...C.map(c => c.d)), ok = C.filter(c => c.d <= Math.max(min + 15, 30));
  let best;
  if (G.along == null) best = ok.reduce((a, b) => (b.km < a.km ? b : a));            // al empezar: el primer paso por aquí
  else best = ok.reduce((a, b) => (Math.abs(b.km - G.along) < Math.abs(a.km - G.along) ? b : a));
  if (best.d > min + 15) best = C.find(c => c.d === min);
  return best;
}
// de metros (respecto a la salida) a grados
const aGrados = (r, q) => {const la0 = r.lin[0][0], lo0 = r.lin[0][1]; return [la0 + q[1] / KLA, lo0 + q[0] / KLO(la0)];};
// rumbo en palabras desde tu posición hasta un punto
function rumbo(la1, lo1, la2, lo2) {
  const y = (la2 - la1) * KLA, x = (lo2 - lo1) * KLO(la1), a = (Math.atan2(x, y) * 180 / Math.PI + 360) % 360;
  return [['el norte', '⬆️'], ['el noreste', '↗️'], ['el este', '➡️'], ['el sureste', '↘️'], ['el sur', '⬇️'], ['el suroeste', '↙️'], ['el oeste', '⬅️'], ['el noroeste', '↖️']][Math.round(a / 45) % 8];
}

/* ---------- desnivel y tiempo (MIDE desde el 26 nov. 2026, como en la ficha; antes DIN 33466) ---------- */
function desnivel(r, km0, km1) {   // metros de subida y bajada entre dos puntos kilométricos, con el perfil
  const p = r.pf, n = p.length, i0 = Math.max(0, Math.round(km0 / r.km * (n - 1))), i1 = Math.min(n - 1, Math.round(km1 / r.km * (n - 1)));
  let up = 0, dn = 0; for (let i = i0 + 1; i <= i1; i++) {const d = p[i] - p[i - 1]; if (d > 0) up += d; else dn -= d;} return [up, dn];
}
function din(km, up, dn) {const h = km / 4, v = up / 400 + dn / 600; return Math.max(h, v) + Math.min(h, v) / 2;}   // horas
const hhmm = d => d.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'});
const dur = h => {const m = Math.max(1, Math.round(h * 60)); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' min';};

/* ---------- avisos: pitido + vibración (si el móvil la deja desde la página) ---------- */
function pita(tipo) {
  try {if (navigator.vibrate) navigator.vibrate(tipo === 'fuera' ? [400, 150, 400, 150, 400] : tipo === 'fin' ? [200, 100, 200, 100, 600] : [150]);} catch (e) {}
  try {const ac = G.ac; if (!ac) return; if (ac.state === 'suspended') ac.resume();
    const notas = tipo === 'fuera' ? [[880, 0], [660, .22], [880, .44], [660, .66]] : tipo === 'fin' ? [[523, 0], [659, .18], [784, .36], [1047, .54]] : [[660, 0], [880, .15]];
    notas.forEach(([f, t]) => {const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(.0001, ac.currentTime + t); g.gain.exponentialRampToValueAtTime(.35, ac.currentTime + t + .02);
      g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + t + .19); o.connect(g).connect(ac.destination); o.start(ac.currentTime + t); o.stop(ac.currentTime + t + .2);});
  } catch (e) {}
}

/* ---------- pantalla encendida ---------- */
async function despierta() {
  try {if ('wakeLock' in navigator) {G.wl = await navigator.wakeLock.request('screen'); return true;}} catch (e) {}
  return false;
}
document.addEventListener('visibilitychange', () => {if (G.on && !document.hidden) despierta();});

/* ---------- empezar y parar ---------- */
async function empieza(r) {
  if (!navigator.geolocation) {toast('Este móvil no deja usar el GPS desde la app'); return;}
  Object.assign(G, {on: true, r, pos: null, acc: null, d: null, along: null, en: false, fuera: 0, aviso: false, sigue: true, t0: 0, a0: null, fin: false, lastBase: 0, lastBaseP: null});
  G.seg = prepara(r);
  try {G.ac = G.ac || new (window.AudioContext || window.webkitAudioContext)(); G.ac.resume();} catch (e) {G.ac = null;}
  const wl = await despierta();
  pinta(); $('rgNota').textContent = wl ? '' : T('Para que la pantalla no se apague durante la ruta, sube el tiempo de apagado de la pantalla en los ajustes del móvil.');
  G.w = navigator.geolocation.watchPosition(nueva, err => {
    $('rgEst').innerHTML = '📡 ' + (err.code === 1 ? T('BasatiNA no tiene permiso para usar tu ubicación. Dáselo en los ajustes del móvil (Aplicaciones › BasatiNA › Permisos › Ubicación › «Ubicación precisa»).') : T('Buscando la señal del GPS… Sal a cielo abierto si estás dentro de un edificio.'));
  }, {enableHighAccuracy: true, maximumAge: 0, timeout: 30000});
  $('rgBox').scrollIntoView({behavior: 'smooth', block: 'start'});
}
function para(silencio) {
  if (G.w != null) try {navigator.geolocation.clearWatch(G.w);} catch (e) {}
  G.w = null; G.on = false; G.pos = null;
  try {if (G.wl) G.wl.release();} catch (e) {} G.wl = null;
  if (!silencio) {pinta(); if (RU.map) RU.map.draw();}
}

/* ---------- cada posición nueva del GPS ---------- */
function nueva(p) {
  if (!G.on || RU.sel !== G.r) return;
  const r = G.r, la = p.coords.latitude, lo = p.coords.longitude, acc = p.coords.accuracy || 999;
  G.pos = [la, lo]; G.acc = acc;
  const c = cercano(G.seg, la, lo); G.d = c.d; G.punto = aGrados(r, c.q);
  const fiable = acc <= 60;
  if (c.d <= SALIDA) {
    if (!G.en) {G.en = true; G.t0 = Date.now(); G.a0 = c.km;}
    // lo recorrido solo avanza (o retrocede poco): evita saltos por el «baile» del GPS
    if (G.along == null || c.km >= G.along - 0.15) G.along = c.km;
  }
  // fuera del camino: dos lecturas seguidas y con buena precisión, para no dar falsas alarmas
  if (G.en && fiable) {
    if (c.d - acc * 0.5 > SALIDA) {G.fuera++; if (G.fuera >= 2 && !G.aviso) {G.aviso = true; pita('fuera'); toast('⚠️ ' + T('Te has salido del camino'));}}
    else if (c.d < VUELTA) {if (G.aviso) {pita('vuelta'); toast('✅ ' + T('De vuelta en el camino'));} G.fuera = 0; G.aviso = false;}
  }
  // llegada
  if (G.en && !G.fin && G.along != null && G.along >= G.seg.tot - 0.06 && c.d <= SALIDA && (Date.now() - G.t0) > 3 * 60e3) {G.fin = true; pita('fin');}
  // el mapa te sigue (el fondo se vuelve a pedir como mucho cada 20 s o si te mueves 150 m)
  const M = RU.map;
  if (M && G.sigue) {
    M.la = la; M.lo = lo; const quiere = (NB.e - NB.w) / 0.018; if (M.z < quiere * 0.6) M.z = quiere;
    const lejos = !G.lastBaseP || Math.hypot((la - G.lastBaseP[0]) * KLA, (lo - G.lastBaseP[1]) * KLO(la)) > 150;
    if (lejos || Date.now() - G.lastBase > 20e3) {G.lastBase = Date.now(); G.lastBaseP = [la, lo]; M.base();}
  }
  if (M) M.draw();
  pinta();
}

/* ---------- panel ---------- */
function pinta() {
  const B = $('rgBox'); if (!B) return; const r = G.r || RU.sel;
  $('rgGo').style.display = G.on ? 'none' : ''; $('rgPanel').style.display = G.on ? '' : 'none';
  if (!G.on || !r) return;
  const est = $('rgEst'), dat = $('rgDat'), pr = $('rgPrec');
  if (!G.pos) {est.innerHTML = '📡 ' + T('Buscando la señal del GPS…'); dat.innerHTML = ''; pr.textContent = ''; return;}
  // precisión
  const a = Math.round(G.acc);
  pr.innerHTML = a <= 15 ? `🟢 ${T('GPS')} ±${a} m` : a <= 40 ? `🟡 ${T('GPS')} ±${a} m` : `🔴 ${T('GPS')} ±${a} m · ` + (a > 150 ? T('ubicación aproximada: activa «Ubicación precisa» en los permisos de BasatiNA') : T('señal débil (bosque, barranco o edificio)'));
  // estado
  if (!G.en) {
    const [txt, fl] = rumbo(G.pos[0], G.pos[1], G.punto[0], G.punto[1]);
    const dS = Math.hypot((G.pos[0] - r.lin[0][0]) * KLA, (G.pos[1] - r.lin[0][1]) * KLO(G.pos[0]));
    est.innerHTML = `🚶 ${T('Aún no estás en la ruta')}: ${T('el camino está a')} <b>${G.d >= 1000 ? F1(G.d / 1000) + ' km' : Math.round(G.d) + ' m'}</b> ${T('hacia')} ${T(txt)} ${fl}` +
      (dS > 1500 ? `<br><button class="btn" id="rgIr" style="margin-top:6px">🚗 ${T('Cómo llegar a la salida')}</button>` : '');
    const b = $('rgIr'); if (b) b.onclick = () => ruOpen(`https://www.google.com/maps/dir/?api=1&destination=${r.lin[0][0]},${r.lin[0][1]}`);
    dat.innerHTML = ''; return;
  }
  if (G.fin) est.innerHTML = `<span style="color:#2e7d32">🏁 <b>${T('¡Has llegado!')}</b> ${T('Ruta terminada en')} ${dur((Date.now() - G.t0) / 36e5)}.</span>`;
  else if (G.aviso) {const [txt, fl] = rumbo(G.pos[0], G.pos[1], G.punto[0], G.punto[1]);
    est.innerHTML = `<span style="color:#c62828">⚠️ <b>${T('Te has salido del camino')}</b>: ${T('estás a')} <b>${Math.round(G.d)} m</b>. ${T('El camino queda hacia')} ${T(txt)} ${fl}</span>`;}
  else est.innerHTML = `<span style="color:#2e7d32">✅ <b>${T('En el camino')}</b></span>` + (G.d > 15 ? ` · ${T('a')} ${Math.round(G.d)} m` : '');
  // datos
  const tot = G.seg.tot, hecho = Math.max(0, G.along || 0), queda = Math.max(0, tot - hecho);
  const [qu, qd] = desnivel(r, hecho, tot);
  let f = 1; const mov = (Date.now() - G.t0) / 36e5, kmH = hecho - (G.a0 || 0);
  if (kmH >= 0.5 && mov >= 8 / 60) {const [u, d] = desnivel(r, G.a0 || 0, hecho), esp = din(kmH, u, d); if (esp > 0) f = Math.max(0.6, Math.min(2, mov / esp));}
  const hq = din(queda, qu, qd) * f, lleg = new Date(Date.now() + hq * 36e5);
  const pc = Math.round(hecho / tot * 100);
  dat.innerHTML = `<div class="rgBar"><i style="width:${pc}%"></i></div>
   <div class="rgK"><div><span>${T('Recorrido')}</span><b>${F1(hecho)} km</b></div><div><span>${T('Quedan')}</span><b>${F1(queda)} km</b></div>
    <div><span>${T('Falta subir')}</span><b>↗ ${Math.round(qu)} m</b></div><div><span>${T('Falta bajar')}</span><b>↘ ${Math.round(qd)} m</b></div>
    <div><span>${T('Tiempo que falta')}</span><b>${G.fin ? '—' : dur(hq)}</b></div><div><span>${T('Llegada')}</span><b>${G.fin ? '🏁' : '≈ ' + hhmm(lleg)}</b></div></div>
   <div class="note" style="margin-top:4px">${f !== 1 ? T('Calculado con tu ritmo real') + ` (${f < 1 ? T('vas más rápido de lo normal') : T('vas más despacio de lo normal')}).` : T('Calculado con la norma DIN 33466; en cuanto lleves medio kilómetro se ajusta a tu ritmo.')}</div>`;
  // marca también el punto en el perfil
  try {ruCursor(r, hecho / tot);} catch (e) {}
}

/* ---------- dibujo encima del mapa de la ficha ---------- */
function engancha(M) {
  if (!M || M._rg) return; M._rg = 1; const orig = M.draw;
  M.draw = function () {orig.apply(this, arguments); if (!G.on || !G.pos || !M.P) return;
    const cv = $('ruMapa'); if (!cv) return; const x = cv.getContext('2d'), [px, py] = M.P(G.pos[0], G.pos[1]);
    const [ex] = M.P(G.pos[0], G.pos[1] + G.acc / KLO(G.pos[0])), rad = Math.max(0, ex - px);
    if (rad > 10) {x.fillStyle = 'rgba(30,136,229,.15)'; x.strokeStyle = 'rgba(30,136,229,.5)'; x.lineWidth = 1; x.beginPath(); x.arc(px, py, rad, 0, 7); x.fill(); x.stroke();}
    if (G.aviso && G.punto) {const [qx, qy] = M.P(G.punto[0], G.punto[1]); x.setLineDash([6, 5]); x.strokeStyle = '#c62828'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(px, py); x.lineTo(qx, qy); x.stroke(); x.setLineDash([]);}
    x.fillStyle = '#1e88e5'; x.strokeStyle = '#fff'; x.lineWidth = 3; x.beginPath(); x.arc(px, py, 8, 0, 7); x.fill(); x.stroke();
  };
  // si mueves el mapa con el dedo, deja de seguirte hasta que pulses 🎯
  const cv = $('ruMapa'); if (cv) cv.addEventListener('pointerdown', () => {if (G.on) {G.sigue = false; const b = $('rgSig'); if (b) b.classList.remove('on');}});
}

/* ---------- estilos ---------- */
const st = document.createElement('style'); st.textContent = `
#rgBox{margin:10px 0}#rgGo{width:100%;min-height:48px;font-size:16px;font-weight:800}
#rgPanel{border:2px solid #1e88e5}#rgPanel .rgTop{display:flex;align-items:center;justify-content:space-between;gap:8px}
#rgEst{margin:8px 0 6px;font-size:15px;line-height:1.45}#rgPrec{font-size:12.5px;color:var(--mut)}
.rgBar{height:8px;border-radius:5px;background:rgba(127,127,127,.18);overflow:hidden;margin:6px 0 8px}.rgBar i{display:block;height:100%;background:#1e88e5}
.rgK{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.rgK>div{background:rgba(30,136,229,.07);border-radius:10px;padding:6px 8px}
.rgK span{display:block;font-size:11.5px;color:var(--mut)}.rgK b{font-size:15.5px}
#rgPanel .rgBt{display:flex;gap:8px;margin-top:8px}#rgPanel .rgBt .btn{flex:1}#rgSig.on{background:#1e88e5;color:#fff;border-color:#1e88e5}
#rgNota:empty{display:none}`;
document.head.appendChild(st);

/* ---------- enganche con la ficha de la ruta ---------- */
const _ficha = ruFicha;
ruFicha = function (r) {
  if (G.on && G.r !== r) para(true);
  const res = _ficha.apply(this, arguments);
  // 27 nov. 2026: el botón va el primero de las acciones de la ficha (#ruAcc); si no está, encima del mapa como antes
  const acc = document.querySelector('#ruFicha #ruAcc'), mb = acc || document.querySelector('#ruFicha .ruMapBox'); if (!mb) return res;
  mb.insertAdjacentHTML(acc ? 'afterbegin' : 'beforebegin', `<div id="rgBox">
    <button class="btn pri" id="rgGo">${typeof ruI === 'function' ? ruI('navigation-arrow', 18) : '▶️'} ${T('Seguir esta ruta con el GPS')}</button>
    <div class="card" id="rgPanel" style="display:none"><div class="rgTop"><b>🧭 ${T('Siguiendo la ruta')}</b><span id="rgPrec"></span></div>
     <div id="rgEst"></div><div id="rgDat"></div>
     <div class="rgBt"><button class="btn on" id="rgSig">🎯 ${T('Centrar en mí')}</button><button class="btn" id="rgStop">⏹️ ${T('Terminar')}</button></div>
     <div class="note" id="rgNota" style="margin-top:6px"></div>
     <div class="note" style="margin-top:6px">${T('El GPS gasta batería: sal con el móvil cargado. Funciona con la app abierta y la pantalla encendida. Ante cualquier duda, haz caso a las señales del camino. Emergencias: 112.')}</div></div></div>`);
  $('rgGo').onclick = () => empieza(r);
  $('rgStop').onclick = () => para();
  $('rgSig').onclick = () => {G.sigue = true; $('rgSig').classList.add('on'); if (G.pos && RU.map) {RU.map.la = G.pos[0]; RU.map.lo = G.pos[1]; RU.map.draw(); RU.map.base();}};
  // el mapa se crea un poco después (setTimeout en ruFicha)
  setTimeout(() => {engancha(RU.map); if (G.on && G.r === r) {pinta(); RU.map && RU.map.draw();}}, 120);
  if (G.on && G.r === r) pinta();
  return res;
};
const _cerrar = ruCerrar;
ruCerrar = function () {para(true); return _cerrar.apply(this, arguments);};
// si sales de NA a Pie a otra pantalla, se deja de seguir (el GPS gasta batería)
const _st = showTab; showTab = function (t) {if (G.on && t !== 'monte') para(true); return _st.apply(this, arguments);};
window.rgEstado = () => G;   // para pruebas
})();
