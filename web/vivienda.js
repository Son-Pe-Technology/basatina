/* =====================================================================
   🏠 VIVIENDA EN NAVARRA + 🧮 SIMULADOR DE HIPOTECAS (21 nov. 2026) — se carga después de chinchon.js
   Pantalla `vivienda`, grupo «Servicios». BasatiNA NO copia anuncios de pisos: solo enlaza.
   (Los portales prohíben sacar sus anuncios con robots, las fotos tienen derechos y muchos
    anuncios llevan datos personales de particulares → decisión de Pedro, 21 nov. 2026.)

   1. 🔎 Buscar piso: alquiler o compra, en toda Navarra o en un pueblo. Abre la búsqueda en el portal.
      - Toda Navarra: enlace directo (VI_DIR). Un pueblo: búsqueda en Google limitada a ese portal.
   2b. 🔁 ¿Me compensa cambiar mi hipoteca? (subrogación/novación): cuota ahora vs. con otro interés, coste del
       cambio, ahorro total y en cuánto se recupera. «🔁 Comparar» en una oferta mete su interés.
   2. 🧮 Simulador de hipotecas (cuota, intereses, impuestos de Navarra, cuánto hace falta ahorrado).
      - Datos OFICIALES en vivienda/hipotecas.json → «oficial»: euríbor (Banco de España), tipo medio
        fijo y variable, importe y plazo medios (INE). Se cambian a mano cuando salen los nuevos
        (euríbor: principios de cada mes; INE: hacia el día 25, con dos meses de retraso).
      - Ofertas de bancos → «ofertas»: las apuntáis vosotros desde el modo administrador (botón
        «➕ Apuntar oferta») copiando lo que el banco publica en su web: banco, tipo, TIN, TAE,
        condiciones, fecha y enlace. Se borran solas de la vista a los 90 días (salen como antiguas).
      - Impuestos de Navarra (VI_IMP): ITP 6 % (usada); IVA 10 % + AJD 0,5 % (nueva); IVA 4 % + AJD 0,5 % (VPO).
   3. 🏛️ Vivienda pública y ayudas (lista VI_L, igual que EM_L de Empleo: añadir una = una línea).
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const E=s=>(typeof esc==='function'?esc(s):String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
const abre=u=>{if(window.amAbre)amAbre(u);else window.open(u,'_blank');};
const nuevo=(t,g,l,sc,ic,fam)=>{try{window.amNuevo(t,g,l,sc,ic,fam);}catch(e){}};
const hook=(t,fn)=>{if(window.svHook)svHook(t,fn);};
const svs=(id,h)=>(window.svSec?svSec:(i,x)=>{const s=document.createElement('section');s.id='t-'+i;s.innerHTML=x;(document.querySelector('.wrap')||document.body).appendChild(s);return s;})(id,h);
const eur=n=>isFinite(n)?Math.round(n).toLocaleString('es-ES')+' €':'—';
const pct=(n,d=2)=>isFinite(n)?n.toLocaleString('es-ES',{minimumFractionDigits:d,maximumFractionDigits:d})+' %':'—';
const num=id=>{const v=parseFloat(String(($(id)||{}).value||'').replace(/\./g,'').replace(',','.'));return isFinite(v)?v:0;};
const tasa=id=>{const v=parseFloat(String(($(id)||{}).value||'').replace(',','.'));return isFinite(v)?v:0;};
const PATH='vivienda/hipotecas.json';
const DEF={oficial:{},ofertas:[]};

const st=document.createElement('style');st.textContent=`
.viSeg{display:flex;gap:6px;margin-top:8px}.viSeg button{flex:1;border:1px solid var(--line);background:none;color:inherit;border-radius:12px;padding:8px;font:inherit;font-size:14.5px;font-weight:700;cursor:pointer}
.viSeg button.on{background:#00695c;color:#fff;border-color:transparent}
.viG{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.viG label{font-size:12.5px;color:var(--mut);display:block}
.viG input,.viG select{width:100%;box-sizing:border-box;margin-top:2px}
.viP{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}
.viRes{margin-top:10px;border-radius:14px;padding:12px;background:linear-gradient(150deg,#e0f2f1,#b2dfdb);color:#00332c}
.viRes .c{font-size:30px;font-weight:900;line-height:1.1}.viRes .c small{font-size:14px;font-weight:600}
.viRow{display:flex;justify-content:space-between;gap:8px;padding:5px 0;border-top:1px solid rgba(0,0,0,.08);font-size:14px}.viRow:first-of-type{border-top:0}
.viAv{margin-top:8px;border-radius:12px;padding:8px 10px;font-size:13.5px;line-height:1.45}
.viAv.mal{background:#ffebee;color:#8e1b1b;border:1px solid #ef9a9a}.viAv.ok{background:#e8f5e9;color:#1b5e20;border:1px solid #a5d6a7}
.viChip{display:inline-block;border:1px solid var(--line);border-radius:16px;padding:5px 10px;margin:6px 6px 0 0;font-size:13px;cursor:pointer;background:none;color:inherit;font-family:inherit}
.viTab{width:100%;border-collapse:collapse;font-size:13.5px;margin-top:6px}.viTab td,.viTab th{padding:4px 2px;text-align:right;border-top:1px solid var(--line)}.viTab th{font-size:12px;color:var(--mut);font-weight:600}.viTab td:first-child,.viTab th:first-child{text-align:left}
.viOf{padding:9px 0;border-top:1px solid var(--line)}.viOf:first-child{border-top:0}.viOf b{font-size:15px}.viOf .m{font-size:12.5px;color:var(--mut);margin-top:2px}
.viOf .a{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.viOf .a button{border:1px solid var(--line);background:none;color:var(--acc);border-radius:10px;padding:5px 9px;font:inherit;font-size:13px;cursor:pointer}`;
document.head.appendChild(st);

try{Object.assign(BNI,{'i-casa':'<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"><path d="M5 15L16 6l11 9" /><path d="M8 13v13h16V13" fill="currentColor" fill-opacity=".14"/><path d="M14 26v-7h4v7"/></g>'});}catch(e){}

/* ---------- 1. Buscar piso ---------- */
// enlaces directos para toda Navarra (Fotocasa comprobado el 21 nov. 2026; Idealista no deja comprobarlo a los robots)
const VI_DIR={
 idealista:{alq:'https://www.idealista.com/alquiler-viviendas/navarra/',com:'https://www.idealista.com/venta-viviendas/navarra/'},
 fotocasa:{alq:'https://www.fotocasa.es/es/alquiler/viviendas/navarra-provincia/todas-las-zonas/l',com:'https://www.fotocasa.es/es/comprar/viviendas/navarra-provincia/todas-las-zonas/l'}};
const VI_PORT=[['idealista','Idealista','idealista.com'],['fotocasa','Fotocasa','fotocasa.es'],['habitaclia','Habitaclia','habitaclia.com'],['pisos','Pisos.com','pisos.com']];
let VIOP='alq';
function viBuscar(p){const [k,,dom]=VI_PORT.find(x=>x[0]===p);const pue=($('viPue').value||'').trim();
  if(!pue&&VI_DIR[k])return abre(VI_DIR[k][VIOP]);
  const q=(VIOP==='alq'?'alquiler pisos ':'venta pisos ')+(pue||'Navarra')+(pue?' Navarra':'')+' site:'+dom;
  abre('https://www.google.com/search?q='+encodeURIComponent(q));}

/* ---------- 3. Vivienda pública y ayudas ---------- */
const VI_L=[
 {n:'Vivienda Navarra (Nasuvinsa)',d:'La web de vivienda del Gobierno de Navarra: alquiler público, promociones, ayudas y trámites.',w:'https://www.vivienda.navarra.es'},
 {n:'Bolsa de Alquiler (Nasuvinsa)',d:'Pisos de alquiler a precio asequible que gestiona el Gobierno de Navarra. También para propietarios que quieren alquilar su piso vacío con cobro asegurado.'},
 {n:'EmanZipa · ayuda al alquiler para jóvenes',d:'Ayuda mensual del Gobierno de Navarra para pagar el alquiler si eres joven y te emancipas.'},
 {n:'DAVID · ayuda al alquiler',d:'Ayuda del Gobierno de Navarra para familias con pocos ingresos que pagan alquiler.'},
 {n:'Censo de solicitantes de vivienda protegida (VPO)',d:'Hay que apuntarse aquí para poder optar a una vivienda protegida, de compra o de alquiler.'},
 {n:'Oficina de vivienda del Ayuntamiento de Pamplona',d:'Información sobre ayudas, bolsa de alquiler, VPO y cédulas de habitabilidad en Pamplona.'},
 {n:'Precio del alquiler por zonas (Ministerio de Vivienda)',d:'Sistema Estatal de Referencia del Precio del Alquiler: cuánto se paga de media en cada barrio y pueblo.'}];

svs('vivienda',`<div class="card"><b>🏠 Vivienda en Navarra</b><div class="note">Pisos y casas de alquiler y venta. BasatiNA no guarda anuncios: te lleva a los portales donde se publican.</div>
 <div class="viSeg" id="viOp"><button data-v="alq" class="on">🔑 Alquiler</button><button data-v="com">🏡 Compra</button></div>
 <input id="viPue" class="town" style="width:100%;box-sizing:border-box;margin-top:8px" placeholder="¿Dónde? (vacío = toda Navarra)">
 <div class="viP">${VI_PORT.map(([k,n])=>`<button class="btn${k==='idealista'?' pri':''}" data-p="${k}">${n}</button>`).join('')}</div></div>

<div class="card"><b>🧮 Simulador de hipotecas</b><div class="note">Cuánto pagarías al mes, cuánto te cuesta en total y cuánto necesitas ahorrado. Es orientativo: lo que vale es la oferta por escrito del banco (la FEIN).</div>
 <div class="viG">
  <label>Precio de la vivienda (€)<input id="viPr" class="town" inputmode="numeric" value="220000"></label>
  <label>Ahorros que pones (€)<input id="viAh" class="town" inputmode="numeric" value="60000"></label>
  <label>Plazo (años)<input id="viAn" class="town" inputmode="numeric" value="26"></label>
  <label>Vivienda<select id="viTi" class="town"><option value="usada">Segunda mano</option><option value="nueva">Nueva</option><option value="vpo">Nueva protegida (VPO)</option></select></label>
 </div>
 <div class="viSeg" id="viTp"><button data-v="fijo" class="on">🔒 Tipo fijo</button><button data-v="var">📈 Variable</button></div>
 <div class="viG" id="viFijo"><label>Interés (TIN %)<input id="viTin" class="town" inputmode="decimal" value="3,16"></label><label>&nbsp;<span id="viFijoNota" class="note" style="display:block;margin-top:6px"></span></label></div>
 <div class="viG" id="viVar" style="display:none"><label>Euríbor (%)<input id="viEu" class="town" inputmode="decimal" value="3,239"></label><label>Diferencial del banco (%)<input id="viDif" class="town" inputmode="decimal" value="0,75"></label></div>
 <div id="viChips"></div>
 <div class="viG"><label>Ingresos netos al mes en casa (€, opcional)<input id="viIn" class="town" inputmode="numeric" placeholder="p. ej. 3000"></label><label>&nbsp;</label></div>
 <div id="viRes"></div>
 <details style="margin-top:8px"><summary style="cursor:pointer;font-size:14px">📉 Cuánto debes con los años</summary><div id="viTab"></div></details></div>

<div class="card"><b>🔁 ¿Me compensa cambiar mi hipoteca?</b><div class="note">Si ya tienes hipoteca, mira cuánto ahorrarías llevándola a otro banco (subrogación) o pidiendo a tu banco que te baje el interés (novación). Los datos están en tu último recibo.</div>
 <div class="viG">
  <label>Lo que te queda por pagar (€)<input id="viCp" class="town" inputmode="numeric" value="120000"></label>
  <label>Años que te quedan<input id="viCa" class="town" inputmode="numeric" value="18"></label>
  <label>Tu interés ahora (%)<input id="viCi" class="town" inputmode="decimal" value="4,10"></label>
  <label>Interés del otro banco (%)<input id="viCn" class="town" inputmode="decimal" value="3,16"></label>
  <label>Comisión por cambiar (%)<input id="viCc" class="town" inputmode="decimal" value="0"></label>
  <label>Otros gastos (tasación…) (€)<input id="viCg" class="town" inputmode="numeric" value="500"></label>
 </div><div class="note" style="margin-top:4px">Para el interés ahora en variable: euríbor + tu diferencial. Toca «🔁 Comparar» en una oferta de abajo para meter su interés.</div>
 <div id="viCRes"></div>
 <details style="margin-top:8px"><summary style="cursor:pointer;font-size:14px">📜 ¿Cuánto me pueden cobrar por cambiar?</summary><div class="note" style="line-height:1.55;margin-top:6px">Mira tu escritura: lo que pone ahí es lo que vale. Para hipotecas firmadas desde el 16 de junio de 2019 (Ley 5/2019), como mucho:<br>• <b>Variable</b>: 0,25 % los 3 primeros años o 0,15 % los 5 primeros (según el contrato). Después, nada.<br>• <b>De variable a fija</b>: 0,05 % los 3 primeros años. Después, nada.<br>• <b>Fija</b>: 2 % los 10 primeros años y 1,5 % después, y nunca más de lo que el banco pierda de verdad.<br>Antes de irte, enseña la oferta a tu banco: muchas veces la iguala para no perderte, y te ahorras los gastos del cambio.</div></details></div>
<div class="card"><b>🏦 Ofertas de los bancos</b><div class="note">Condiciones que publica cada banco en su web. Toca «Usar» para meterla en el simulador. Comprueba siempre en el banco: cambian a menudo.</div>
 <div id="viOf" style="margin-top:6px"><div class="note">Cargando…</div></div>
 <button class="btn tech" id="viAdd" style="display:none;margin-top:8px">➕ Apuntar oferta</button></div>

<div class="card"><b>🏛️ Vivienda pública y ayudas</b><div id="viL" style="margin-top:4px"></div></div>

<div class="card"><b>💡 Antes de firmar</b><div class="note" style="line-height:1.55">• <b>TIN</b> es el interés del préstamo; la <b>TAE</b> suma los gastos y productos que te obligan a contratar (seguros, nómina…). Para comparar bancos, mira la TAE.<br>• Los bancos suelen prestar hasta el <b>80 %</b> del precio (o de la tasación, si es menor). El resto y los impuestos van con tus ahorros.<br>• Que la cuota no pase del <b>30–35 %</b> de lo que entra en casa.<br>• El banco te tiene que dar la <b>FEIN</b> (la oferta por escrito) y, antes de firmar, vas gratis al notario a que te la explique.<br>• Los gastos de notaría, registro y gestoría de la hipoteca los paga el banco; tú pagas la tasación, la notaría y el registro de la compra.</div></div>`);
nuevo('vivienda','Servicios','🏠 Vivienda','pueblo','i-casa','b');

/* ---------- simulador ---------- */
let H=DEF,VITP='fijo';
const VI_IMP={usada:{t:6,n:'ITP 6 %'},nueva:{t:10.5,n:'IVA 10 % + AJD 0,5 %'},vpo:{t:4.5,n:'IVA 4 % + AJD 0,5 %'}};
const OTROS=2000;   // tasación, notaría, registro y gestoría de la compra: aproximado
function cuota(P,anual,anos){const n=Math.round(anos*12),i=anual/1200;if(P<=0||n<=0)return 0;return i?P*i/(1-Math.pow(1+i,-n)):P/n;}
function viCalc(){
  const pr=num('viPr'),ah=num('viAh'),an=Math.max(1,Math.min(40,num('viAn')||26)),ti=$('viTi').value,ing=num('viIn');
  const tin=VITP==='fijo'?tasa('viTin'):tasa('viEu')+tasa('viDif');
  const imp=pr*VI_IMP[ti].t/100,gastos=imp+OTROS,entrada=ah-gastos,P=Math.max(0,pr-Math.max(0,entrada));
  const c=cuota(P,tin,an),tot=c*Math.round(an*12),int=tot-P,fin=pr?P/pr*100:0;
  const av=[];
  if(entrada<0)av.push(['mal',`Tus ahorros no llegan ni para los impuestos y gastos de la compra (${eur(gastos)}). Te faltan ${eur(-entrada)} antes de pedir la hipoteca.`]);
  else if(fin>80)av.push(['mal',`Pides el ${Math.round(fin)} % del precio. La mayoría de bancos prestan como mucho el 80 %: para eso necesitarías ahorrar ${eur(pr*0.2+gastos)} en total (te faltan ${eur(pr*0.2+gastos-ah)}).`]);
  else if(P>0)av.push(['ok',`Pides el ${Math.round(fin)} % del precio: dentro de lo que suelen dar los bancos (hasta el 80 %).`]);
  if(ing>0&&c>0){const e=c/ing*100;av.push([e>35?'mal':'ok',`La cuota sería el ${Math.round(e)} % de lo que entra en casa${e>35?': más del 35 % que suelen aceptar los bancos.':'. Bien: por debajo del 35 %.'}`]);}
  $('viRes').innerHTML=`<div class="viRes"><div class="note" style="color:inherit;opacity:.85">Pagarías al mes</div><div class="c">${eur(c)} <small>durante ${an} años</small></div>
   <div style="margin-top:8px">
    <div class="viRow"><span>Te prestan</span><b>${eur(P)}</b></div>
    <div class="viRow"><span>Interés ${VITP==='fijo'?'fijo':'(euríbor + diferencial)'}</span><b>${pct(tin)}</b></div>
    <div class="viRow"><span>Intereses en total</span><b>${eur(int)}</b></div>
    <div class="viRow"><span>Devuelves en total</span><b>${eur(tot)}</b></div>
    <div class="viRow"><span>Impuestos de la compra (${VI_IMP[ti].n})</span><b>${eur(imp)}</b></div>
    <div class="viRow"><span>Notaría, registro, tasación… (aprox.)</span><b>${eur(OTROS)}</b></div>
    <div class="viRow"><span>Lo que pone de tus ahorros a la entrada</span><b>${eur(Math.max(0,entrada))}</b></div></div></div>
   ${av.map(([k,t])=>`<div class="viAv ${k}">${k==='mal'?'⚠️':'✅'} ${t}</div>`).join('')}
   ${VITP==='var'?'<div class="note" style="margin-top:6px">En variable la cuota cambia cada vez que se revisa con el euríbor. Muchas hipotecas variables tienen un primer año a tipo fijo.</div>':''}`;
  // tabla: capital pendiente con los años
  const i=tin/1200;let rows='',S=P;const marcas=[1,5,10,15,20,25,30,35,40].filter(y=>y<an);marcas.push(an);
  let mes=0,intAc=0;for(const y of marcas){while(mes<y*12&&mes<an*12){const it=S*i;intAc+=it;S=Math.max(0,S-(c-it));mes++;}
    rows+=`<tr><td>Año ${y}</td><td>${eur(S)}</td><td>${eur(intAc)}</td></tr>`;}
  $('viTab').innerHTML=P>0?`<table class="viTab"><tr><th></th><th>Te queda por pagar</th><th>Intereses pagados</th></tr>${rows}</table>`:'';}

function viChips(){const O=(H&&H.oficial)||{},el=$('viChips');const ch=[];
  if(O.fijo)ch.push(`<button class="viChip" data-f="${O.fijo.v}">📊 Media fija: ${pct(O.fijo.v)} <small>(INE, ${E(O.fijo.mes)})</small></button>`);
  if(O.variable)ch.push(`<button class="viChip" data-vi="${O.variable.v}">📊 Media variable inicial: ${pct(O.variable.v)} <small>(INE)</small></button>`);
  if(O.euribor)ch.push(`<button class="viChip" data-e="${O.euribor.v}">🇪🇺 Euríbor oficial: ${pct(O.euribor.v,3)} <small>(${E(O.euribor.mes)})</small></button>`);
  if(O.plazo)ch.push(`<button class="viChip" data-p="${O.plazo.v}">⏳ Plazo medio: ${O.plazo.v} años</button>`);
  el.innerHTML=ch.length?`<div class="note" style="margin-top:8px">Datos oficiales (toca para usarlos):</div>${ch.join('')}`:'';
  el.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{setTp('fijo');$('viTin').value=String(b.dataset.f).replace('.',',');viCalc();});
  el.querySelectorAll('[data-vi]').forEach(b=>b.onclick=()=>{setTp('fijo');$('viTin').value=String(b.dataset.vi).replace('.',',');viCalc();toast&&toast('Es el interés del primer año: luego depende del euríbor');});
  el.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{setTp('var');$('viEu').value=String(b.dataset.e).replace('.',',');viCalc();});
  el.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{$('viAn').value=b.dataset.p;viCalc();});
  if(O.euribor&&!$('viEu').dataset.toc)$('viEu').value=String(O.euribor.v).replace('.',',');
  if(O.fijo&&!$('viTin').dataset.toc)$('viTin').value=String(O.fijo.v).replace('.',',');
  $('viFijoNota').textContent=O.fijo?'Media oficial de las hipotecas fijas: '+pct(O.fijo.v):'';}
function setTp(v){VITP=v;$('viTp').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));$('viFijo').style.display=v==='fijo'?'':'none';$('viVar').style.display=v==='var'?'':'none';}

/* ---------- ¿me compensa cambiar? ---------- */
function viCambio(){const P=num('viCp'),an=Math.max(1,Math.min(40,num('viCa')||1)),ia=tasa('viCi'),inn=tasa('viCn');
  const n=Math.round(an*12),ca=cuota(P,ia,an),cn=cuota(P,inn,an),coste=P*tasa('viCc')/100+num('viCg');
  const ahM=ca-cn,ahT=ahM*n-coste,rec=ahM>0?Math.ceil(coste/ahM):Infinity;
  const k=ahT>0&&rec<=n?'ok':'mal';
  $('viCRes').innerHTML=P>0?`<div class="viRes" style="${k==='mal'?'background:linear-gradient(150deg,#fff3e0,#ffe0b2);color:#4e2a00':''}">
   <div class="note" style="color:inherit;opacity:.85">${ahM>0?'Ahorrarías al mes':'Pagarías más al mes'}</div><div class="c">${eur(Math.abs(ahM))}</div>
   <div style="margin-top:8px"><div class="viRow"><span>Cuota ahora</span><b>${eur(ca)}</b></div><div class="viRow"><span>Cuota con el cambio</span><b>${eur(cn)}</b></div>
   <div class="viRow"><span>Coste del cambio</span><b>${eur(coste)}</b></div>
   <div class="viRow"><span>Ahorro total (ya restado el coste)</span><b>${eur(ahT)}</b></div>
   ${ahM>0?`<div class="viRow"><span>Recuperas el coste en</span><b>${rec<=n?(rec<12?rec+' meses':(Math.round(rec/12*10)/10).toLocaleString('es-ES')+' años'):'nunca'}</b></div>`:''}</div></div>
   <div class="viAv ${k}">${k==='ok'?(ahT>3000?'✅ Merece la pena: pide la oferta por escrito (FEIN) y enséñasela antes a tu banco.':'✅ Sale a cuenta, pero por poco: compara también seguros y lo que te obligan a contratar (mira la TAE).'):'⚠️ Así no compensa: lo que cuesta cambiar es más de lo que ahorras.'}</div>`:'';}

/* ---------- ofertas de bancos ---------- */
function viOfertas(){const el=$('viOf'),L=((H&&H.ofertas)||[]).slice().sort((a,b)=>(a.tae||99)-(b.tae||99));
  const vieja=o=>o.fecha&&(Date.now()-Date.parse(o.fecha))>90*864e5;
  el.innerHTML=L.length?L.map((o,i)=>`<div class="viOf"><b>${E(o.banco)}</b> · ${o.tipo==='var'?'Variable':o.tipo==='mixto'?'Mixta':'Fija'}
     <div style="font-size:14.5px;margin-top:2px">${o.tipo==='var'?'Euríbor + '+pct(o.dif):'TIN '+pct(o.tin)}${o.tae?' · <b>TAE '+pct(o.tae)+'</b>':''}</div>
     ${o.cond?`<div class="m">${E(o.cond)}</div>`:''}<div class="m">Apuntada el ${E(o.fecha||'')}${vieja(o)?' · ⚠️ antigua, puede haber cambiado':''}</div>
     <div class="a"><button data-u="${i}">🧮 Usar</button><button data-c="${i}">🔁 Comparar</button>${o.url?`<button data-w="${i}">🌐 Ver en el banco</button>`:''}<button class="tech" style="display:none" data-x="${i}">🗑️ Quitar</button></div></div>`).join('')
   :'<div class="note">Todavía no hay ofertas apuntadas. Mientras, puedes usar las medias oficiales del simulador.</div>';
  el.querySelectorAll('[data-u]').forEach(b=>b.onclick=()=>{const o=L[+b.dataset.u];
    if(o.tipo==='var'){setTp('var');$('viDif').value=String(o.dif).replace('.',',');}else{setTp('fijo');$('viTin').value=String(o.tin).replace('.',',');$('viTin').dataset.toc=1;}
    viCalc();$('viRes').scrollIntoView({behavior:'smooth',block:'center'});});
  el.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{const o=L[+b.dataset.c],O=(H&&H.oficial)||{};
    const v=o.tipo==='var'?((O.euribor&&O.euribor.v)||0)+(o.dif||0):o.tin;$('viCn').value=String(Math.round(v*1000)/1000).replace('.',',');viCambio();$('viCRes').scrollIntoView({behavior:'smooth',block:'center'});});
  el.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>abre(L[+b.dataset.w].url));
  el.querySelectorAll('[data-x]').forEach(b=>b.onclick=async()=>{const o=L[+b.dataset.x];if(!confirm('¿Quitar la oferta de '+o.banco+'?'))return;
    try{H=await jsEdit(PATH,DEF,d=>{d.ofertas=(d.ofertas||[]).filter(x=>!(x.banco===o.banco&&x.fecha===o.fecha&&x.tin===o.tin&&x.dif===o.dif));},'Vivienda: quitar oferta de '+o.banco);viOfertas();toast&&toast('Quitada');}catch(e){alert(e.message);}});
  try{if(typeof techApply==='function')techApply();}catch(e){}}

async function viAdd(){
  const banco=prompt('Banco (p. ej. Caja Rural de Navarra):');if(!banco)return;
  const tp=(prompt('Tipo: escribe fija, variable o mixta','fija')||'').trim().toLowerCase();if(!tp)return;
  const t=tp.startsWith('v')?'var':tp.startsWith('m')?'mixto':'fijo';
  const n=s=>{const v=parseFloat(String(s||'').replace(',','.'));return isFinite(v)?v:null;};
  let tin=null,dif=null;
  if(t==='var')dif=n(prompt('Diferencial sobre el euríbor (%), p. ej. 0,65'));else tin=n(prompt('TIN (%)'+(t==='mixto'?' de los años a tipo fijo':'')+', p. ej. 2,45'));
  const tae=n(prompt('TAE (%), p. ej. 3,10 (vacío si no la pone)'));
  const cond=prompt('Condiciones (nómina, seguros, plazo, % que financia…)','')||'';
  const url=prompt('Enlace a la página de la hipoteca en la web del banco','https://')||'';
  if(t==='var'?dif==null:tin==null)return alert('Falta el interés: no se ha guardado.');
  const o={banco:banco.trim(),tipo:t,tin,dif,tae,cond:cond.trim(),url:/^https?:\/\/.+\..+/.test(url)?url.trim():'',fecha:new Date().toISOString().slice(0,10)};
  try{H=await jsEdit(PATH,DEF,d=>{(d.ofertas=d.ofertas||[]).push(o);},'Vivienda: oferta de '+o.banco);viOfertas();toast&&toast('Oferta apuntada');}catch(e){alert(e.message);}}

/* ---------- pintar ---------- */
function viLista(){$('viL').innerHTML=VI_L.map((x,i)=>`<div class="viOf"><b>${E(x.n)}</b><div class="m" style="font-size:14px;color:inherit">${E(x.d)}</div><div class="a">${x.w?`<button data-w="${i}">🌐 Ir a la web</button>`:`<button data-s="${i}">🔎 Buscar</button>`}</div></div>`).join('');
  $('viL').querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>abre(VI_L[+b.dataset.w].w));
  $('viL').querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>abre('https://www.google.com/search?q='+encodeURIComponent(VI_L[+b.dataset.s].n+' Navarra')));}
$('viOp').querySelectorAll('button').forEach(b=>b.onclick=()=>{VIOP=b.dataset.v;$('viOp').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));});
document.querySelectorAll('#t-vivienda [data-p]').forEach(b=>{if(b.closest('.viP'))b.onclick=()=>viBuscar(b.dataset.p);});
$('viTp').querySelectorAll('button').forEach(b=>b.onclick=()=>{setTp(b.dataset.v);viCalc();});
['viPr','viAh','viAn','viTi','viTin','viEu','viDif','viIn'].forEach(id=>{const x=$(id);x.addEventListener('input',()=>{x.dataset.toc=1;viCalc();});x.addEventListener('change',viCalc);});
$('viAdd').onclick=()=>viAdd();
['viCp','viCa','viCi','viCn','viCc','viCg'].forEach(id=>$(id).addEventListener('input',viCambio));
async function viInit(){try{H=await jsLoad(PATH,DEF,true)||DEF;}catch(e){H=DEF;}viChips();viOfertas();viCalc();}
viLista();viCalc();viCambio();
hook('vivienda',viInit);

try{Object.assign(window.BNA_DATOS||{},{vivienda:'euríbor: Banco de España (BOE) · tipos, importe y plazo medios: INE, Estadística de Hipotecas · ofertas: webs de cada banco · anuncios: enlaces a cada portal; BasatiNA no guarda anuncios'});}catch(e){}
})();
