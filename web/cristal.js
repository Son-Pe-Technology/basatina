/* =====================================================================
   🫧 BOTONES DE CRISTAL (27 nov. 2026, elegido por Pedro y Sonia: «cristal claro»)
   Los botones que van ENCIMA DE UNA FOTO O DE UN MAPA son de cristal: medio transparentes,
   con la foto de detrás difuminada (backdrop-filter) y un borde fino blanco.
   Los botones sobre fondo liso NO cambian: ahí no hay nada que difuminar y no se leerían.
   Dónde:
   - Menú: los grupos (Hoy, Localidades…) pierden el icono de color; el nombre es un botón de cristal con ›.
   - Inicio: «Foto de la Cuadrilla» (etiqueta) y «Envía la tuya».
   - Cabeceras con foto: la lupa ⤢ de ampliar.
   - En los MAPAS no: el mapa topográfico es muy claro y las letras blancas no se leerían
     (allí siguen los botones de cristal oscuro que ya tenían).
   Para cambiar el aspecto de todos a la vez, toca solo CRISTAL de aquí abajo.
   ===================================================================== */
(function () {
  const CRISTAL = `background:rgba(255,255,255,.22)!important;border:1px solid rgba(255,255,255,.55)!important;
    -webkit-backdrop-filter:blur(12px) saturate(1.3)!important;backdrop-filter:blur(12px) saturate(1.3)!important;
    box-shadow:0 4px 14px rgba(0,0,0,.18)!important;color:#fff!important;-webkit-text-fill-color:#fff!important;text-shadow:0 1px 2px rgba(0,0,0,.35)!important`;
  const st = document.createElement('style');
  st.textContent = `
/* Menú: grupos con foto */
body.bna #bnaDGrid>.dgroup.m6G.m6Ft>span .bt{display:none!important}
body.bna #bnaDGrid>.dgroup.m6G.m6Ft>i{display:none!important}
body.bna #bnaDGrid>.dgroup.m6G.m6Ft>span{${CRISTAL};right:auto!important;flex:none!important;width:fit-content!important;max-width:calc(100% - 28px)!important;
  border-radius:99px!important;padding:8px 16px!important;font-size:15px!important;font-weight:800!important;display:inline-flex!important;align-items:center!important;gap:8px!important}
body.bna #bnaDGrid>.dgroup.m6G.m6Ft>span::after{content:'›';font-size:20px;line-height:1}
body.bna #bnaDGrid>.dgroup.m6G.m6Ft:active>span{background:rgba(255,255,255,.38)!important}
/* Inicio: foto de la Cuadrilla */
.bnaFdBad,.bnaFdBtn{${CRISTAL}}
.bnaFdBad i{background:#fff!important}
/* Cabeceras con foto: lupa */
#pvSec.cfFoto .cfLupa{${CRISTAL}}`;
  document.head.appendChild(st);
})();
