/* =====================================================================
   🔘 MENÚ: apartados de dentro de cada grupo como BOTONES (27 nov. 2026, elegido por Pedro y Sonia)
   Antes: lista con icono en cuadrado de color + nombre + línea corta.
   Ahora: cada apartado es un botón blanco redondeado con el nombre en grande, la línea corta
   debajo y una flecha › a la derecha. Sin iconos.
   Vale para los 7 grupos del menú (.dsub.mfLs): Hoy, Tiempo y ríos, Naturaleza y salidas,
   Moverse, Vivir en Navarra, Ocio y Cuadrilla BasatiNA.
   También arregla el hueco de «Cuadrilla Basati NA» en el botón de cristal del grupo.
   ===================================================================== */
(function () {
  const st = document.createElement('style');
  st.textContent = `
body.bna #drawer .dsub.mfLs{background:none!important;box-shadow:none!important;border:0!important;padding:6px 2px 4px!important;display:flex!important;flex-direction:column!important;gap:8px!important}
body.bna #drawer .dsub.mfLs>button .bt{display:none!important}
body.bna #drawer .dsub.mfLs>button{background:#fff!important;border:1.5px solid #d5dfd2!important;border-radius:16px!important;padding:10px 14px 10px 16px!important;margin:0!important;
  box-shadow:0 1px 3px rgba(29,45,35,.06)!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;min-height:0!important;width:100%!important;text-align:left!important}
body.bna #drawer .dsub.mfLs>button>span{color:#2b4a24!important;font-weight:800!important;font-size:16px!important;line-height:1.25!important;flex:1;min-width:0}
body.bna #drawer .dsub.mfLs>button .m6S{display:block!important;color:#5b6660!important;font-weight:500!important;font-size:13.5px!important;margin-top:2px}
body.bna #drawer .dsub.mfLs>button::after{content:'›';font-size:24px;line-height:1;color:#3d7031;flex:none}
body.bna #drawer .dsub.mfLs>button:active{background:#eef5ea!important;border-color:#3d7031!important}
/* «Cuadrilla BasatiNA»: sin hueco entre Basati y NA (el hueco iba entre los trozos del nombre) */
body.bna #bnaDGrid>.dgroup.m6G.m6Ft>span{gap:0!important}
body.bna #bnaDGrid>.dgroup.m6G.m6Ft>span::after{margin-left:8px}`;
  document.head.appendChild(st);
})();
