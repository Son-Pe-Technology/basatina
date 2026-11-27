/* 28 nov. 2026 (Pedro): las filas de pestañas y de filtros ya no se deslizan de lado;
   si no caben, saltan a la fila de abajo y se ven todas sin mover la pantalla.
   Las tiras de horas y meses (tiempo por horas, pádel, temporada) siguen deslizándose. */
(()=>{const S='.m6Tabs,.msFila,.emChips,.voChips,.ruChips,.pdChips,.tmChips,.clT,#agCat,#dpDep,#foCat';
const pre=S.split(',').map(x=>'html body '+x).join(',');
const btn=S.split(',').map(x=>'html body '+x+'>*').join(',');
const st=document.createElement('style');
st.textContent=`${pre}{flex-wrap:wrap!important;overflow-x:visible!important;row-gap:8px}
${btn}{flex:0 0 auto!important;max-width:100%}`;
document.head.appendChild(st);})();
