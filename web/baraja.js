/* =====================================================================
   🃏 BARAJA DE NAVARRA (21 nov. 2026, idea de Pedro)
   Baraja española de 40 cartas con figuras de la historia de Navarra:
   - Reyes: espadas Sancho VII el Fuerte · bastos Íñigo Arista · oros Sancho VI el Sabio ·
     copas Alfonso I el Batallador (dejó el reino a los templarios).
   - Sotas: las reinas. Caballos: jefes de tropas navarros (mariscal Pedro de Navarra…).
   - El número va dentro del escudo de Navarra en todas las cartas.
   Todo se dibuja en SVG (sin imágenes), para que pese poco y se vea nítido en cualquier pantalla.
   No hay retratos de la época: las caras se basan en lo que cuentan las crónicas y la tradición
   (por ejemplo, Sancho VII muy alto y fuerte).
   bnCarta(palo, n) → texto SVG. palo: 'oros' | 'copas' | 'espadas' | 'bastos'; n: 1-7, 10 sota, 11 caballo, 12 rey.
   ===================================================================== */
(function(){
const W=240,H=380;
const PAL={oros:{c:'#d4a017',o:'#7a5800'},copas:{c:'#c62828',o:'#6d1010'},espadas:{c:'#1e5aa8',o:'#0d2f5c'},bastos:{c:'#2e7d32',o:'#1b4a1e'}};
const GAPS={oros:0,copas:1,espadas:2,bastos:3};   // «pintas»: cortes del marco, como en la baraja española

/* ---------- escudo de Navarra con el número dentro ---------- */
function escudo(x,y,s,num){const k=s/40;
  const sh=`M0 0 H40 V26 Q40 44 20 52 Q0 44 0 26 Z`;
  // cadenas: borde, cruz y aspa (eslabones como trazos de puntos)
  const ch='stroke="#f2c230" stroke-width="2.6" stroke-dasharray="3.2 1.6" fill="none" stroke-linecap="round"';
  return `<g transform="translate(${x},${y}) scale(${k})">
    <path d="M6 -3 L10 -10 L15 -4 L20 -12 L25 -4 L30 -10 L34 -3 Z" fill="#f2c230" stroke="#7a5800" stroke-width=".8"/>
    <path d="${sh}" fill="#c8102e" stroke="#6d0a1a" stroke-width="1.4"/>
    <path d="M3.5 3.5 H36.5 V26 Q36.5 41 20 48 Q3.5 41 3.5 26 Z" ${ch}/>
    <path d="M20 4 V48 M4 24 H36 M5 5 L35 43 M35 5 L5 43" ${ch}/>
    <circle cx="20" cy="24" r="10.5" fill="#fbf6ea" stroke="#1b7a3e" stroke-width="2.2"/>
    <text x="20" y="29" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="${num>9?11:14}" fill="#2a1a10">${num}</text></g>`;}

/* ---------- símbolos de los palos ---------- */
const sim={
  oros:(x,y,r)=>`<g transform="translate(${x},${y})"><circle r="${r}" fill="#f2c230" stroke="#7a5800" stroke-width="${r*.12}"/><circle r="${r*.62}" fill="none" stroke="#b8860b" stroke-width="${r*.1}"/><circle r="${r*.22}" fill="#c8102e"/></g>`,
  copas:(x,y,r)=>`<g transform="translate(${x},${y}) scale(${r/20})"><path d="M-16 -18 H16 Q16 4 4 8 V16 H10 Q12 20 10 22 H-10 Q-12 20 -10 16 H-4 V8 Q-16 4 -16 -18 Z" fill="#f2c230" stroke="#7a5800" stroke-width="2"/><path d="M-16 -18 H16" stroke="#c62828" stroke-width="4"/><circle cy="-6" r="3.5" fill="#c62828"/></g>`,
  espadas:(x,y,r)=>`<g transform="translate(${x},${y}) scale(${r/20})"><path d="M0 -40 L4 -32 V14 H-4 V-32 Z" fill="#dfe6ee" stroke="#4a5868" stroke-width="1.5"/><path d="M-14 14 H14" stroke="#7a5800" stroke-width="5" stroke-linecap="round"/><path d="M0 16 V30" stroke="#5d3a1a" stroke-width="5"/><circle cy="33" r="4" fill="#f2c230" stroke="#7a5800"/></g>`,
  bastos:(x,y,r)=>`<g transform="translate(${x},${y}) scale(${r/20})"><path d="M-6 30 Q-9 0 -4 -26 Q0 -36 6 -28 Q10 0 6 30 Z" fill="#8d5a2b" stroke="#4a2c10" stroke-width="1.6"/><circle cx="-6" cy="-6" r="2.5" fill="#4a2c10"/><circle cx="5" cy="10" r="2.5" fill="#4a2c10"/><path d="M3 -18 q8 -4 10 -12" stroke="#2e7d32" stroke-width="3" fill="none"/></g>`};

/* ---------- personajes ----------
   piel, pelo, barba ('larga' | 'corta' | 'no'), ropa (2 colores), adorno del pecho, tocado ('corona' | 'toca'), objeto (palo) */
const P={
  // ---- reyes ----
  'espadas-12':{nom:'Sancho VII',sub:'el Fuerte · 1194-1234',piel:'#e9b98f',pelo:'#3b2416',barba:'larga',ropa:['#b71c1c','#7f1010'],capa:'#1a1a1a',pecho:'aguila',toc:'corona',ancho:1.18,cara:'dura'},
  'bastos-12':{nom:'Íñigo Arista',sub:'primer rey de Pamplona · †851',piel:'#e2b08a',pelo:'#8d8a84',barba:'larga',ropa:['#5d4a2e','#3e3020'],capa:'#2e5d2e',pecho:'encina',toc:'diadema',ancho:1.05,cara:'viejo'},
  'oros-12':{nom:'Sancho VI',sub:'el Sabio · 1150-1194',piel:'#efc39c',pelo:'#b9b2a6',barba:'corta',ropa:['#1e4f8f','#123563'],capa:'#6a1b9a',pecho:'fuero',toc:'corona',ancho:1,cara:'sabio'},
  'copas-12':{nom:'Alfonso I',sub:'el Batallador · 1104-1134',piel:'#efc39c',pelo:'#6b4423',barba:'corta',ropa:['#f4f1e8','#cfc8b4'],capa:'#8b1a1a',pecho:'temple',toc:'corona',ancho:1.05,cara:'guerrero'},
  // ---- sotas: las reinas ----
  'espadas-10':{nom:'Constanza de Tolosa',sub:'reina · esposa de Sancho VII',piel:'#f3d2b4',pelo:'#3b2416',barba:'no',ropa:['#a3122a','#6d0a1a'],capa:'#1a1a1a',pecho:'tolosa',toc:'toca',ancho:.95,cara:'dama',rx:15},
  'bastos-10':{nom:'Oneca',sub:'madre de Íñigo Arista · s. VIII-IX',piel:'#e8bd98',pelo:'#5a3b22',barba:'no',ropa:['#4e6b2e','#33481d'],capa:'#7a5a33',pecho:'encina',toc:'toca',ancho:.95,cara:'dama-mayor',rx:17},
  'oros-10':{nom:'Sancha de Castilla',sub:'reina · esposa de Sancho VI',piel:'#f3cfae',pelo:'#8a5a2b',barba:'no',ropa:['#1f6f5c','#134a3d'],capa:'#5b2a86',pecho:'castillo',toc:'toca',ancho:.95,cara:'dama-dulce',rx:16.5},
  'copas-10':{nom:'Urraca de Castilla',sub:'reina · esposa de Alfonso I',piel:'#f1caa6',pelo:'#2f1d12',barba:'no',ropa:['#6a1b9a','#4a1270'],capa:'#c62828',pecho:'leon',toc:'toca',ancho:.95,cara:'dama-seria',rx:16},
  // ---- caballos: jefes de tropas de la defensa del reino (1512-1524) ----
  'espadas-11':{nom:'Pedro de Navarra',sub:'mariscal del reino · †1522',caballo:'#3b2a1e',manta:'#c8102e',mantaE:'navarra',casco:'#9aa5b1',pluma:'#c8102e',barba:'corta',pelo:'#3b2416',piel:'#e9b98f'},
  'bastos-11':{nom:'Jaime Vélaz de Medrano',sub:'alcaide de Amaiur · 1522',caballo:'#6b4a2b',manta:'#2e5d2e',mantaE:'cruz',casco:'#8d98a5',pluma:'#f2c230',barba:'larga',pelo:'#4a3020',piel:'#e2b08a'},
  'oros-11':{nom:'Juan Vélaz de Medrano',sub:'merino de Estella · 1512',caballo:'#d9d2c5',manta:'#1e4f8f',mantaE:'navarra',casco:'#a8b2bd',pluma:'#1e4f8f',barba:'corta',pelo:'#5a3b22',piel:'#efc39c'},
  'copas-11':{nom:'Pedro de Navarra, hijo',sub:'defensor de Hondarribia · 1524',caballo:'#1e1a18',manta:'#6a1b9a',mantaE:'navarra',casco:'#9aa5b1',pluma:'#ffffff',barba:'no',pelo:'#3b2416',piel:'#f0c8a2'}};

function cara(p,cx,cy){const s=p.piel,dama=/^dama/.test(p.cara||''),ojos=dama?`<path d="M-9 -2 q4 -3 8 0 M1 -2 q4 -3 8 0" stroke="#3a2416" stroke-width="1.6" fill="none"/><circle cx="-5" cy="0" r="1.6" fill="#2a1a10"/><circle cx="5" cy="0" r="1.6" fill="#2a1a10"/>`+
      (p.cara==='dama-seria'?`<path d="M-10 -6 L-2 -4 M10 -6 L2 -4" stroke="#2f1d12" stroke-width="1.8" stroke-linecap="round"/>`:'')+
      (p.cara==='dama-mayor'?`<path d="M-11 4 q-1 3 0 5 M11 4 q1 3 0 5 M-8 -8 q4 -1 7 0 M1 -8 q4 -1 7 0" stroke="#b07a55" stroke-width="1" fill="none"/>`:'')+
      (p.cara==='dama-dulce'?`<path d="M-9 -6 q4 -3 7 -1 M2 -7 q4 -2 7 1" stroke="#8a5a2b" stroke-width="1.3" fill="none"/>`:'')
    :`<path d="M-11 -5 L-2 -3 M11 -5 L2 -3" stroke="${p.pelo}" stroke-width="${p.cara==='dura'?3:2.2}" stroke-linecap="round"/><circle cx="-6" cy="0" r="1.9" fill="#2a1a10"/><circle cx="6" cy="0" r="1.9" fill="#2a1a10"/>`;
  const barba=p.barba==='larga'?`<path d="M-15 2 Q-16 24 -6 34 L0 40 L6 34 Q16 24 15 2 Q12 12 6 13 Q0 10 -6 13 Q-12 12 -15 2 Z" fill="${p.pelo}"/><path d="M-6 13 Q0 9 6 13" stroke="${p.pelo}" stroke-width="3" fill="none"/>`
    :p.barba==='corta'?`<path d="M-14 4 Q-13 20 0 24 Q13 20 14 4 Q11 12 6 12 Q0 9 -6 12 Q-11 12 -14 4 Z" fill="${p.pelo}"/><path d="M-6 12 Q0 9 6 12" stroke="${p.pelo}" stroke-width="2.4" fill="none"/>`:'';
  const arr=p.cara==='viejo'||p.cara==='sabio'?`<path d="M-9 -9 q4 -1.5 8 0 M1 -9 q4 -1.5 8 0 M-12 3 q-1 3 0 5 M12 3 q1 3 0 5" stroke="#b07a55" stroke-width="1" fill="none"/>`:'';
  const boca=p.barba==='no'?(p.cara==='dama-seria'?`<path d="M-4 13 h8" stroke="#8a3a30" stroke-width="1.8" stroke-linecap="round"/>`:`<path d="M-4 12 q4 ${p.cara==='dama-dulce'?4:3} 8 0" stroke="#a0453a" stroke-width="1.8" fill="none" stroke-linecap="round"/>`)+`<circle cx="-9" cy="7" r="3" fill="#f0a090" opacity=".45"/><circle cx="9" cy="7" r="3" fill="#f0a090" opacity=".45"/>`:'';
  const pelo=p.toc==='toca'?`<path d="M-17 -6 Q-18 -20 0 -21 Q18 -20 17 -6 Q16 -14 0 -15 Q-16 -14 -17 -6 Z" fill="${p.pelo}"/>`
    :`<path d="M-17 4 Q-19 -20 0 -20 Q19 -20 17 4 Q15 -10 0 -12 Q-15 -10 -17 4 Z" fill="${p.pelo}"/>`;
  return `<g transform="translate(${cx},${cy})">${p.toc==='toca'?`<path d="M-24 -10 Q-26 30 -20 46 L20 46 Q26 30 24 -10 Q20 -26 0 -27 Q-20 -26 -24 -10 Z" fill="#f7f3ea" stroke="#bdb5a0" stroke-width="1.2"/>`:''}
    <ellipse rx="${p.rx||16}" ry="20" cy="2" fill="${s}" stroke="#9a6a48" stroke-width="1"/>${pelo}${ojos}
    <path d="M0 0 Q-2 6 0 8 Q2 8 3 7" stroke="#9a6a48" stroke-width="1.4" fill="none"/>${arr}${barba}${boca}
    ${p.toc==='toca'?`<path d="M-17 18 Q0 30 17 18" stroke="#bdb5a0" stroke-width="1.2" fill="none"/>`:''}</g>`;}
function corona(cx,cy,w,p){if(p.toc==='diadema')return `<g transform="translate(${cx},${cy+3})"><rect x="-${w}" y="-6" width="${w*2}" height="7" rx="2" fill="#d9a520" stroke="#7a5800" stroke-width="1"/><path d="M-${w*.5} -6 L-${w*.5} -12 M0 -6 L0 -14 M${w*.5} -6 L${w*.5} -12" stroke="#d9a520" stroke-width="3"/><circle cy="-15" r="2.2" fill="#f2c230" stroke="#7a5800"/><circle cy="-2.5" r="1.8" fill="#c8102e"/></g>`;
  return p.toc==='toca'?`<g transform="translate(${cx},${cy})"><path d="M-14 0 L-12 -9 L-6 -3 L0 -12 L6 -3 L12 -9 L14 0 Z" fill="#f2c230" stroke="#7a5800" stroke-width="1"/><circle cy="-6" r="2" fill="#c8102e"/></g>`
  :`<g transform="translate(${cx},${cy})"><path d="M-${w} 0 L-${w} -14 L-${w*.6} -6 L-${w*.3} -18 L0 -8 L${w*.3} -18 L${w*.6} -6 L${w} -14 L${w} 0 Z" fill="#f2c230" stroke="#7a5800" stroke-width="1.2"/>
    <rect x="-${w}" y="-3" width="${w*2}" height="5" fill="#e0a800" stroke="#7a5800" stroke-width="1"/><circle cx="0" cy="-1" r="2.2" fill="#c8102e"/><circle cx="-${w*.55}" cy="-1" r="1.8" fill="#1b7a3e"/><circle cx="${w*.55}" cy="-1" r="1.8" fill="#1e5aa8"/></g>`;}
function pecho(t,x,y){
  // Arrano beltza (21 nov. 2026, según la imagen de referencia que mandó Pedro): águila negra con las alas
  // levantadas y las plumas colgando en «dedos», cabeza mirando a la derecha, garras abiertas, sobre el rojo
  // de la túnica (sin escudo). Dibujo propio: el ala derecha es la izquierda reflejada.
  if(t==='aguila'){const ala=`<path d="M8 -10 Q12 -26 25 -30 Q36 -32 40 -22 Q43 -12 42 2
      Q44 8 40 10 Q38 6 36 6 Q38 14 33 15 Q31 10 29 10 Q30 18 25 18 Q23 13 21 13 Q21 20 16 19 Q15 13 12 12 Q10 4 5 2 Z"/>
      <path d="M14 -22 Q24 -27 33 -24" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
    pata=`<path d="M5 14 Q12 18 15 26" stroke="#111" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M15 26 Q20 25 23 28 M15 26 Q19 30 20 34 M15 26 Q14 31 11 33" stroke="#111" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    return `<g transform="translate(${x},${y+2}) scale(.78)"><g fill="#111">
      ${ala}<g transform="scale(-1,1)">${ala}</g>${pata}<g transform="scale(-1,1)">${pata}</g>
      <path d="M-7 -10 Q-9 6 -5 16 L-8 30 L-3 26 L0 32 L3 26 L8 30 L5 16 Q9 6 7 -10 Q4 -16 0 -16 Q-4 -16 -7 -10 Z"/>
      <path d="M-6 -22 Q0 -25 7 -22 L8 -6 Q0 -3 -8 -6 Z"/><g transform="translate(0,-6) scale(1.15)"><path d="M-5 -10 Q-6 -24 0 -28 Q6 -30 9 -25 L16 -24 Q18 -20 13 -18 L12 -21 L8 -19 Q6 -14 5 -8 Z"/></g></g>
      <circle cx="4.5" cy="-35" r="1.5" fill="#fff"/>
      <path d="M-6 -4 Q0 -6 6 -9" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></g>`;}
  if(t==='encina')return `<g transform="translate(${x},${y})"><circle cx="-7" cy="-4" r="9" fill="#2e7d32"/><circle cx="7" cy="-4" r="9" fill="#2e7d32"/><circle cy="-12" r="10" fill="#388e3c"/><rect x="-2.5" y="2" width="5" height="14" fill="#5d3a1a"/>
    <path d="M0 -30 V-18 M-5 -25 H5" stroke="#c8102e" stroke-width="3" stroke-linecap="round"/></g>`;
  if(t==='fuero')return `<g transform="translate(${x},${y})"><path d="M-17 -10 Q-8 -14 0 -9 Q8 -14 17 -10 V12 Q8 8 0 13 Q-8 8 -17 12 Z" fill="#f7f0dc" stroke="#7a5800" stroke-width="1.2"/><path d="M0 -9 V13" stroke="#7a5800"/>
    <path d="M-13 -4 H-4 M-13 0 H-4 M-13 4 H-5 M4 -4 H13 M4 0 H13 M5 4 H13" stroke="#8a7a60" stroke-width="1"/></g>`;
  if(t==='tolosa')return `<g transform="translate(${x},${y}) scale(.9) rotate(45)"><path d="M-14 -14 L0 -4 L14 -14 L4 0 L14 14 L0 4 L-14 14 L-4 0 Z" fill="#f2c230" stroke="#7a5800" stroke-width="1"/>
    ${[[-14,-14],[14,-14],[14,14],[-14,14]].map(([a,b])=>`<circle cx="${a}" cy="${b}" r="2.6" fill="#f2c230" stroke="#7a5800" stroke-width=".8"/>`).join('')}</g>`;
  if(t==='leon')return `<g transform="translate(${x},${y})"><rect x="-17" y="-14" width="17" height="14" fill="#c8102e"/><rect x="0" y="0" width="17" height="14" fill="#c8102e"/><rect x="0" y="-14" width="17" height="14" fill="#f7f3ea"/><rect x="-17" y="0" width="17" height="14" fill="#f7f3ea"/>
    <path d="M-13 -3 V-10 H-11 V-8 H-9 V-10 H-7 V-8 H-5 V-10 H-3 V-3 Z" fill="#f2c230"/><path d="M4 -4 Q5 -12 10 -11 Q13 -10 12 -7 L14 -5 L10 -5 L9 -3 Z" fill="#6a1b9a"/>
    <path d="M4 10 Q5 2 10 3 Q13 4 12 7 L14 9 L10 9 L9 11 Z" fill="#6a1b9a"/><path d="M-13 11 V4 H-11 V6 H-9 V4 H-7 V6 H-5 V4 H-3 V11 Z" fill="#f2c230"/>
    <rect x="-17" y="-14" width="34" height="28" fill="none" stroke="#7a5800"/></g>`;
  if(t==='temple')return `<g transform="translate(${x},${y})"><path d="M-3 -16 H3 L5 -4 L16 -3 V3 L5 4 L3 16 H-3 L-5 4 L-16 3 V-3 L-5 -4 Z" fill="#c62828"/></g>`;
  if(t==='castillo')return `<g transform="translate(${x},${y})"><rect x="-11" y="-6" width="22" height="16" fill="#f2c230" stroke="#7a5800"/><rect x="-14" y="-12" width="7" height="8" fill="#f2c230" stroke="#7a5800"/><rect x="7" y="-12" width="7" height="8" fill="#f2c230" stroke="#7a5800"/><rect x="-4" y="-14" width="8" height="10" fill="#f2c230" stroke="#7a5800"/><rect x="-3" y="2" width="6" height="8" fill="#1e5aa8"/></g>`;
  return '';}

// caballero a caballo, de lado (mirando a la izquierda), con armadura y el objeto del palo levantado
function jinete(palo,p){const C=p.caballo,M=p.manta,cx=W/2;
  const manta=`<path d="M58 168 Q118 150 178 166 L184 236 Q150 250 120 246 Q90 250 54 236 Z" fill="${M}" stroke="#222" stroke-width="1"/>
    <path d="M54 236 l8 10 l8 -10 l8 10 l8 -10 l8 10 l8 -10 l8 10 l8 -10 l8 10 l8 -10 l8 10 l8 -10 l8 10 l8 -10 l8 10 l6 -10" fill="${M}" stroke="#222" stroke-width="1"/>`;
  const emb=p.mantaE==='navarra'?escudo(140,184,28,'')
    :`<path d="M156 182 V226 M138 200 H174" stroke="#f2c230" stroke-width="6" stroke-linecap="round"/>`;
  const caballo=`<path d="M168 238 L172 300 L180 300 L182 240 M150 244 L146 302 L154 302 L160 244 M84 244 L74 300 L82 302 L96 246 M66 236 L56 296 L64 298 L80 240" stroke="${C}" stroke-width="11" stroke-linecap="round" fill="none"/>
    <path d="M56 296 h10 M146 302 h10 M74 300 h10 M172 300 h10" stroke="#222" stroke-width="5"/>
    <path d="M60 170 Q40 140 46 110 Q50 92 62 84 L70 76 L72 86 Q78 96 76 108 L84 150 Z" fill="${C}" stroke="#222" stroke-width="1"/>
    <path d="M46 110 Q34 114 30 106 Q30 98 40 94 Q48 90 54 92" fill="${C}" stroke="#222" stroke-width="1"/><circle cx="52" cy="100" r="2" fill="#111"/>
    <path d="M62 84 Q72 100 80 140" stroke="#222" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M178 172 Q200 180 198 214 Q196 232 186 236" stroke="#222" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  // jinete: pierna, cuerpo con armadura, casco con pluma
  const jin=`<path d="M120 172 L124 214 L114 230" stroke="#7d8894" stroke-width="12" stroke-linecap="round" fill="none"/>
    <path d="M100 172 Q98 130 108 110 Q120 100 134 110 Q144 130 142 172 Z" fill="${p.casco}" stroke="#333" stroke-width="1.2"/>
    <path d="M104 140 H140" stroke="#333" stroke-width="1"/><path d="M100 160 H142" stroke="#333" stroke-width="1"/>
    <path d="M102 120 L120 128 L140 120" stroke="${M}" stroke-width="6" fill="none"/>
    <g transform="translate(121,86)"><ellipse rx="13" ry="15" cy="2" fill="${p.piel}" stroke="#9a6a48"/>
      ${p.barba!=='no'?`<path d="M-12 6 Q-11 ${p.barba==='larga'?24:16} 0 ${p.barba==='larga'?28:19} Q11 ${p.barba==='larga'?24:16} 12 6 Q8 11 0 9 Q-8 11 -12 6 Z" fill="${p.pelo}"/>`:''}
      <circle cx="-5" cy="0" r="1.6" fill="#2a1a10"/><circle cx="5" cy="0" r="1.6" fill="#2a1a10"/><path d="M-9 -5 L-2 -4 M9 -5 L2 -4" stroke="${p.pelo}" stroke-width="2"/>
      <path d="M-15 -2 Q-16 -22 0 -24 Q16 -22 15 -2 L11 -4 Q10 -14 0 -15 Q-10 -14 -11 -4 Z" fill="${p.casco}" stroke="#333" stroke-width="1.2"/>
      <path d="M0 -24 Q6 -38 18 -40 Q12 -30 14 -22" fill="${p.pluma}" stroke="#333" stroke-width=".8"/></g>
    <path d="M104 124 Q90 120 82 100" stroke="${p.casco}" stroke-width="11" stroke-linecap="round" fill="none"/><circle cx="81" cy="98" r="6" fill="${p.piel}" stroke="#9a6a48"/>`;
  const obj=palo==='espadas'?sim.espadas(80,74,26):palo==='bastos'?sim.bastos(80,80,24):palo==='copas'?sim.copas(80,84,15):sim.oros(80,86,14);
  return caballo+manta+emb+jin+obj;}
function figura(palo,n){const p=P[palo+'-'+n];if(!p)return '';if(n===11)return jinete(palo,p);const cx=W/2,a=p.ancho,pc=PAL[palo];
  const hom=n===12,cy=hom?102:110;
  // cuerpo: capa, túnica, cinturón, brazos
  const cuerpo=`<path d="M${cx-48*a} 330 Q${cx-56*a} 200 ${cx-38*a} 150 Q${cx} 128 ${cx+38*a} 150 Q${cx+56*a} 200 ${cx+48*a} 330 Z" fill="${p.capa}" stroke="#222" stroke-width="1"/>
    <path d="M${cx-36*a} 330 Q${cx-40*a} 210 ${cx-30*a} 152 Q${cx} 140 ${cx+30*a} 152 Q${cx+40*a} 210 ${cx+36*a} 330 Z" fill="${p.ropa[0]}" stroke="#333" stroke-width="1"/>
    <path d="M${cx-34*a} 330 Q${cx-36*a} 260 ${cx-28*a} 236 H${cx+28*a} Q${cx+36*a} 260 ${cx+34*a} 330 Z" fill="${p.ropa[1]}" opacity=".85"/>
    <rect x="${cx-30*a}" y="228" width="${60*a}" height="8" fill="#f2c230" stroke="#7a5800" stroke-width="1"/>
    <path d="M${cx-30*a} 150 Q${cx-50*a} 160 ${cx-52*a} 215" stroke="${p.ropa[0]}" stroke-width="${16*a}" fill="none" stroke-linecap="round"/>
    <path d="M${cx+30*a} 150 Q${cx+50*a} 160 ${cx+52*a} 215" stroke="${p.ropa[0]}" stroke-width="${16*a}" fill="none" stroke-linecap="round"/>
    <circle cx="${cx-52*a}" cy="218" r="7" fill="${p.piel}" stroke="#9a6a48"/><circle cx="${cx+52*a}" cy="218" r="7" fill="${p.piel}" stroke="#9a6a48"/>
    ${hom?`<path d="M${cx-30*a} 150 Q${cx} 162 ${cx+30*a} 150" stroke="#f7f3ea" stroke-width="7" fill="none"/><path d="M${cx-30*a} 150 Q${cx} 162 ${cx+30*a} 150" stroke="#222" stroke-width="7" fill="none" stroke-dasharray="2 4"/>`:`<path d="M${cx-26} 150 Q${cx} 168 ${cx+26} 150" stroke="#f2c230" stroke-width="3" fill="none"/>`}
    ${pecho(p.pecho,cx,190)}`;
  // el objeto del palo, en la mano derecha (a la izquierda de quien mira)
  const ox=cx-52*a,obj=palo==='espadas'?sim.espadas(ox,178,34):palo==='bastos'?sim.bastos(ox,190,30):palo==='copas'?sim.copas(ox,196,18):sim.oros(ox,200,17);
  return `${cuerpo}${cara(p,cx,cy)}${corona(cx,cy-17,hom?19:14,p)}${obj}`;}

/* ---------- la carta ---------- */
function marco(palo){const g=GAPS[palo],c=PAL[palo].c,L=12,R=W-12,T=12,B=H-12;let top=`M${L} ${T}`,bot=`M${L} ${B}`;
  if(!g){top+=` H${R}`;bot+=` H${R}`;}else{const seg=(R-L)/(g*2+1);let x=L;for(let i=0;i<g*2+1;i++){x+=seg;if(i%2===0){top+=` H${x}`;bot+=` H${x}`;}else{top+=` M${x} ${T}`;bot+=` M${x} ${B}`;}}}
  return `<path d="${top} M${L} ${T} V${B} ${bot} M${R} ${T} V${B}" stroke="${c}" stroke-width="2.5" fill="none"/>`;}
function bnCarta(palo,n){const pc=PAL[palo],p=P[palo+'-'+n];
  let medio='';
  if(p){medio=figura(palo,n)+`<rect x="20" y="322" width="174" height="40" rx="6" fill="#fbf6ea" stroke="${pc.c}" stroke-width="1.6"/>
    <text x="107" y="340" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="${p.nom.length>14?14:16}" fill="#2a1a10">${p.nom}</text>
    <text x="107" y="355" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="10.5" fill="#5a4030">${p.sub}</text>`;}
  else{// cartas numéricas: los símbolos repartidos
    const pos={1:[[0,0]],2:[[0,-1],[0,1]],3:[[0,-1.2],[0,0],[0,1.2]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],
      6:[[-1,-1.2],[1,-1.2],[-1,0],[1,0],[-1,1.2],[1,1.2]],7:[[-1,-1.3],[1,-1.3],[0,-.65],[-1,0],[1,0],[-1,1.3],[1,1.3]]}[n]||[];
    medio=pos.map(([a,b])=>sim[palo](W/2+a*48,H/2+b*62,n===1?44:palo==='oros'?20:22)).join('');}
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <rect x="1" y="1" width="${W-2}" height="${H-2}" rx="14" fill="#fbf6ea" stroke="#b9ad92" stroke-width="2"/>${marco(palo)}
    ${medio}${escudo(16,24,30,n)}<g transform="rotate(180 ${W/2} ${H/2})">${escudo(16,24,30,n)}</g></svg>`;}
window.bnCarta=bnCarta;window.BN_BARAJA=P;
})();
