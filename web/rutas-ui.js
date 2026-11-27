/* =====================================================================
   🥾 ESCAPADAS · rutas con ficha (nov. 2026)
   Arriba un buscador y debajo fichas de ruta (al estilo Wikiloc). Al tocar una ruta se abre su ficha con:
   distancia, desnivel, dificultad, altitudes, tiempo, mapa del recorrido (solo esa ruta), perfil que se sigue
   con el dedo (marca el punto en el mapa), descripción, descarga GPX y el tiempo previsto en el trayecto.
   Datos: web/rutas.js (lo genera tools/rutas.py con OpenStreetMap + IDENA; robot .github/workflows/rutas.yml).
   El mapa antiguo de «Salir al monte» (cuevas, miradores, fuentes, baño, bici) queda abajo en un desplegable.
   Se carga después de servicios-ui.js (usa svLoad, SV_N y svHook) y del script principal (NavMap, getJSON…).
   ===================================================================== */
const RU = {todas: [], q: '', g: '', z: '', d: '', k: '', c: false, o: 'nombre', pos: null, n: 25, sel: null, map: null, pt: null, cum: null, base: 'topo', scroll: 0};
const RU_DIF = {'Fácil': '#2e9e4f', 'Moderada': '#d89b00', 'Difícil': '#ef6c00', 'Muy difícil': '#d32f2f'};
const RU_GRP = [['', 'Todas', '🥾'], ['Senderos y paseos', 'Senderos y paseos', '🌿'], ['Grandes travesías', 'Grandes travesías', '🏔️'],
  ['Camino de Santiago', 'Camino de Santiago', '🐚'], ['Vías verdes', 'Vías verdes', '🚲']];
const RU_ICO = {'Senderos y paseos': '🌿', 'Grandes travesías': '🏔️', 'Camino de Santiago': '🐚', 'Vías verdes': '🚲'};
const RU_ZON = ['Pirineo', 'Baztan-Bidasoa', 'Plazaola-Sakana-Ultzama', 'Pamplona y Comarca', 'Tierra Estella', 'Zona Media', 'Sangüesa-Prepirineo', 'La Ribera'];
// 26 nov. 2026 (rutas «profesionales»): puntos de interés del recorrido, tipo de camino y pendientes
const RU_WP = {cima: ['🏔️', 'Cima', 'mountains'], collado: ['🌄', 'Collado', 'arrows-down-up'], fuente: ['💧', 'Fuente', 'drop'], agua: ['🚰', 'Agua potable', 'drop-half'], refugio: ['🛖', 'Refugio', 'house-line'],
  mirador: ['👁️', 'Mirador', 'binoculars'], cueva: ['🕳️', 'Cueva', 'door-open'], cascada: ['🌊', 'Cascada', 'waves'], historia: ['🏛️', 'Patrimonio', 'bank']};
// 27 nov. 2026 (ficha «profesional»): iconos de línea en vez de emojis. Son de Phosphor Icons (licencia MIT), estilo «regular».
const RU_IC = {"ruler":"M235.32,73.37,182.63,20.69a16,16,0,0,0-22.63,0L20.68,160a16,16,0,0,0,0,22.63l52.69,52.68a16,16,0,0,0,22.63,0L235.32,96A16,16,0,0,0,235.32,73.37ZM84.68,224,32,171.31l32-32,26.34,26.35a8,8,0,0,0,11.32-11.32L75.31,128,96,107.31l26.34,26.35a8,8,0,0,0,11.32-11.32L107.31,96,128,75.31l26.34,26.35a8,8,0,0,0,11.32-11.32L139.31,64l32-32L224,84.69Z","clock":"M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z","trend-up":"M240,56v64a8,8,0,0,1-16,0V75.31l-82.34,82.35a8,8,0,0,1-11.32,0L96,123.31,29.66,189.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0L136,140.69,212.69,64H168a8,8,0,0,1,0-16h64A8,8,0,0,1,240,56Z","trend-down":"M240,128v64a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h44.69L136,107.31l-34.34,34.35a8,8,0,0,1-11.32,0l-72-72A8,8,0,0,1,29.66,58.34L96,124.69l34.34-34.35a8,8,0,0,1,11.32,0L224,172.69V128a8,8,0,0,1,16,0Z","arrow-left":"M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z","navigation-arrow":"M237.33,106.21,61.41,41l-.16-.05A16,16,0,0,0,40.9,61.25a1,1,0,0,0,.05.16l65.26,175.92A15.77,15.77,0,0,0,121.28,248h.3a15.77,15.77,0,0,0,15-11.29l.06-.2,21.84-78,78-21.84.2-.06a16,16,0,0,0,.62-30.38ZM149.84,144.3a8,8,0,0,0-5.54,5.54L121.3,232l-.06-.17L56,56l175.82,65.22.16.06Z","download-simple":"M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z","car":"M240,104H229.2L201.42,41.5A16,16,0,0,0,186.8,32H69.2a16,16,0,0,0-14.62,9.5L26.8,104H16a8,8,0,0,0,0,16h8v80a16,16,0,0,0,16,16H64a16,16,0,0,0,16-16V184h96v16a16,16,0,0,0,16,16h24a16,16,0,0,0,16-16V120h8a8,8,0,0,0,0-16ZM69.2,48H186.8l24.89,56H44.31ZM64,200H40V184H64Zm128,0V184h24v16Zm24-32H40V120H216ZM56,144a8,8,0,0,1,8-8H80a8,8,0,0,1,0,16H64A8,8,0,0,1,56,144Zm112,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H176A8,8,0,0,1,168,144Z","share-network":"M176,160a39.89,39.89,0,0,0-28.62,12.09l-46.1-29.63a39.8,39.8,0,0,0,0-28.92l46.1-29.63a40,40,0,1,0-8.66-13.45l-46.1,29.63a40,40,0,1,0,0,55.82l46.1,29.63A40,40,0,1,0,176,160Zm0-128a24,24,0,1,1-24,24A24,24,0,0,1,176,32ZM64,152a24,24,0,1,1,24-24A24,24,0,0,1,64,152Zm112,72a24,24,0,1,1,24-24A24,24,0,0,1,176,224Z","map-trifold":"M228.92,49.69a8,8,0,0,0-6.86-1.45L160.93,63.52,99.58,32.84a8,8,0,0,0-5.52-.6l-64,16A8,8,0,0,0,24,56V200a8,8,0,0,0,9.94,7.76l61.13-15.28,61.35,30.68A8.15,8.15,0,0,0,160,224a8,8,0,0,0,1.94-.24l64-16A8,8,0,0,0,232,200V56A8,8,0,0,0,228.92,49.69ZM104,52.94l48,24V203.06l-48-24ZM40,62.25l48-12v127.5l-48,12Zm176,131.5-48,12V78.25l48-12Z","arrow-square-out":"M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z","mountains":"M164,80a28,28,0,1,0-28-28A28,28,0,0,0,164,80Zm0-40a12,12,0,1,1-12,12A12,12,0,0,1,164,40Zm90.88,155.92-54.56-92.08A15.87,15.87,0,0,0,186.55,96h0a15.85,15.85,0,0,0-13.76,7.84L146.63,148l-44.84-76.1a16,16,0,0,0-27.58,0L1.11,195.94A8,8,0,0,0,8,208H248a8,8,0,0,0,6.88-12.08ZM88,80l23.57,40H64.43ZM22,192l33-56h66l18.74,31.8,0,0L154,192Zm150.57,0-16.66-28.28L186.55,112,234,192Z","path":"M200,168a32.06,32.06,0,0,0-31,24H72a32,32,0,0,1,0-64h96a40,40,0,0,0,0-80H72a8,8,0,0,0,0,16h96a24,24,0,0,1,0,48H72a48,48,0,0,0,0,96h97a32,32,0,1,0,31-40Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,200,216Z","map-pin":"M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z","cloud-sun":"M164,72a76.2,76.2,0,0,0-20.26,2.73,55.63,55.63,0,0,0-9.41-11.54l9.51-13.57a8,8,0,1,0-13.11-9.18L121.22,54A55.9,55.9,0,0,0,96,48c-.58,0-1.16,0-1.74,0L91.37,31.71a8,8,0,1,0-15.75,2.77L78.5,50.82A56.1,56.1,0,0,0,55.23,65.67L41.61,56.14a8,8,0,1,0-9.17,13.11L46,78.77A55.55,55.55,0,0,0,40,104c0,.57,0,1.15,0,1.72L23.71,108.6a8,8,0,0,0,1.38,15.88,8.24,8.24,0,0,0,1.39-.12l16.32-2.88a55.74,55.74,0,0,0,5.86,12.42A52,52,0,0,0,84,224h80a76,76,0,0,0,0-152ZM56,104a40,40,0,0,1,72.54-23.24,76.26,76.26,0,0,0-35.62,40,52.14,52.14,0,0,0-31,4.17A40,40,0,0,1,56,104ZM164,208H84a36,36,0,1,1,4.78-71.69c-.37,2.37-.63,4.79-.77,7.23a8,8,0,0,0,16,.92,58.91,58.91,0,0,1,1.88-11.81c0-.16.09-.32.12-.48A60.06,60.06,0,1,1,164,208Z","warning":"M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM222.93,203.8a8.5,8.5,0,0,1-7.48,4.2H40.55a8.5,8.5,0,0,1-7.48-4.2,7.59,7.59,0,0,1,0-7.72L120.52,44.21a8.75,8.75,0,0,1,15,0l87.45,151.87A7.59,7.59,0,0,1,222.93,203.8ZM120,144V104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z","arrows-clockwise":"M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a80,80,0,0,1-112.47-.66L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z","arrow-right":"M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z","binoculars":"M237.2,151.87v0a47.1,47.1,0,0,0-2.35-5.45L193.26,51.8a7.82,7.82,0,0,0-1.66-2.44,32,32,0,0,0-45.26,0A8,8,0,0,0,144,55V80H112V55a8,8,0,0,0-2.34-5.66,32,32,0,0,0-45.26,0,7.82,7.82,0,0,0-1.66,2.44L21.15,146.4a47.1,47.1,0,0,0-2.35,5.45v0A48,48,0,1,0,112,168V96h32v72a48,48,0,1,0,93.2-16.13ZM76.71,59.75a16,16,0,0,1,19.29-1v73.51a47.9,47.9,0,0,0-46.79-9.92ZM64,200a32,32,0,1,1,32-32A32,32,0,0,1,64,200ZM160,58.74a16,16,0,0,1,19.29,1l27.5,62.58A47.9,47.9,0,0,0,160,132.25ZM192,200a32,32,0,1,1,32-32A32,32,0,0,1,192,200Z","house-line":"M240,208H224V136l2.34,2.34A8,8,0,0,0,237.66,127L139.31,28.68a16,16,0,0,0-22.62,0L18.34,127a8,8,0,0,0,11.32,11.31L32,136v72H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM48,120l80-80,80,80v88H160V152a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v56H48Zm96,88H112V160h32Z","drop":"M174,47.75a254.19,254.19,0,0,0-41.45-38.3,8,8,0,0,0-9.18,0A254.19,254.19,0,0,0,82,47.75C54.51,79.32,40,112.6,40,144a88,88,0,0,0,176,0C216,112.6,201.49,79.32,174,47.75ZM128,216a72.08,72.08,0,0,1-72-72c0-57.23,55.47-105,72-118,16.53,13,72,60.75,72,118A72.08,72.08,0,0,1,128,216Zm55.89-62.66a57.6,57.6,0,0,1-46.56,46.55A8.75,8.75,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68Z","drop-half":"M174,47.75a254.19,254.19,0,0,0-41.45-38.3,8,8,0,0,0-9.18,0A254.19,254.19,0,0,0,82,47.75C54.51,79.32,40,112.6,40,144a88,88,0,0,0,176,0C216,112.6,201.49,79.32,174,47.75ZM200,144a70.57,70.57,0,0,1-.46,8H136V136h63.64Q200,140,200,144ZM183.39,88H136V72h36.89A175.85,175.85,0,0,1,183.39,88ZM136,200h37.19A71.67,71.67,0,0,1,136,215.54Zm0-16V168h59.87a72,72,0,0,1-8,16Zm0-64V104h55.39a116.84,116.84,0,0,1,5.45,16Zm23.89-64H136V32.6A257.22,257.22,0,0,1,159.89,56ZM56,144c0-50,42.26-92.71,64-111.4V215.54A72.08,72.08,0,0,1,56,144Z","waves":"M222.16,177.25a8,8,0,0,1-1,11.25c-17.36,14.39-32.86,19.5-47,19.5-18.58,0-34.82-8.82-49.93-17-25.35-13.76-47.24-25.64-79.07.74a8,8,0,1,1-10.22-12.31c40.17-33.28,70.32-16.92,96.93-2.48,25.35,13.75,47.24,25.63,79.07-.74A8,8,0,0,1,222.16,177.25Zm-11.27-57c-31.83,26.38-53.72,14.5-79.07.74-26.61-14.43-56.76-30.79-96.93,2.49a8,8,0,0,0,10.22,12.31c31.83-26.38,53.72-14.5,79.07-.74,15.11,8.19,31.35,17,49.93,17,14.14,0,29.64-5.11,47-19.5a8,8,0,1,0-10.22-12.31ZM45.11,79.8c31.83-26.37,53.72-14.49,79.07-.74,15.11,8.2,31.35,17,49.93,17,14.14,0,29.64-5.12,47-19.5a8,8,0,1,0-10.22-12.31c-31.83,26.38-53.72,14.5-79.07.74C105.21,50.58,75.06,34.22,34.89,67.5A8,8,0,1,0,45.11,79.8Z","bank":"M24,104H48v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16H208V104h24a8,8,0,0,0,4.19-14.81l-104-64a8,8,0,0,0-8.38,0l-104,64A8,8,0,0,0,24,104Zm40,0H96v64H64Zm80,0v64H112V104Zm48,64H160V104h32ZM128,41.39,203.74,88H52.26ZM248,208a8,8,0,0,1-8,8H16a8,8,0,0,1,0-16H240A8,8,0,0,1,248,208Z","door-open":"M232,216H208V40a16,16,0,0,0-16-16H64A16,16,0,0,0,48,40V216H24a8,8,0,0,0,0,16H232a8,8,0,0,0,0-16Zm-40,0H176V40h16ZM64,40h96V216H64Zm80,92a12,12,0,1,1-12-12A12,12,0,0,1,144,132Z","arrows-down-up":"M117.66,170.34a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L72,188.69V48a8,8,0,0,1,16,0V188.69l18.34-18.35A8,8,0,0,1,117.66,170.34Zm96-96-32-32a8,8,0,0,0-11.32,0l-32,32a8,8,0,0,0,11.32,11.32L168,67.31V208a8,8,0,0,0,16,0V67.31l18.34,18.35a8,8,0,0,0,11.32-11.32Z","gauge":"M207.06,72.67A111.24,111.24,0,0,0,128,40h-.4C66.07,40.21,16,91,16,153.13V176a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V152A111.25,111.25,0,0,0,207.06,72.67ZM224,176H119.71l54.76-75.3a8,8,0,0,0-12.94-9.42L99.92,176H32V153.13c0-3.08.15-6.12.43-9.13H56a8,8,0,0,0,0-16H35.27c10.32-38.86,44-68.24,84.73-71.66V80a8,8,0,0,0,16,0V56.33A96.14,96.14,0,0,1,221,128H200a8,8,0,0,0,0,16h23.67c.21,2.65.33,5.31.33,8Z","sneaker-move":"M231.16,166.63l-28.63-14.31A47.74,47.74,0,0,1,176,109.39V80a8,8,0,0,0-8-8,48.05,48.05,0,0,1-48-48,8,8,0,0,0-12.83-6.37L30.13,76l-.2.16a16,16,0,0,0-1.24,23.75L142.4,213.66a8,8,0,0,0,5.66,2.34H224a16,16,0,0,0,16-16V180.94A15.92,15.92,0,0,0,231.16,166.63ZM224,200H151.37L40,88.63l12.87-9.76,38.79,38.79A8,8,0,0,0,103,106.34L65.74,69.11l40-30.31A64.15,64.15,0,0,0,160,87.5v21.89a63.65,63.65,0,0,0,35.38,57.24L224,180.94ZM70.8,184H32a8,8,0,0,1,0-16H70.8a8,8,0,1,1,0,16Zm40,24a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16h54.8A8,8,0,0,1,110.8,208Z"};
const ruI = (n, s = 18) => RU_IC[n] ? `<svg class="ruI" width="${s}" height="${s}" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="${RU_IC[n]}"/></svg>` : '';
const RU_P2 = {};   // los mismos iconos para dibujarlos en el mapa (canvas)
const ruP2 = n => RU_P2[n] || (RU_IC[n] && window.Path2D ? (RU_P2[n] = new Path2D(RU_IC[n])) : null);
const ruWpI = (w, s) => ruI((RU_WP[w[1]] || [])[2] || 'map-pin', s);
const RU_SAC = ['', 'T1 · Senderismo', 'T2 · Senderismo de montaña', 'T3 · Senderismo de montaña exigente', 'T4 · Senderismo alpino', 'T5 · Senderismo alpino exigente', 'T6 · Senderismo alpino difícil'];
// colores de la pendiente (en %): llano, suave, media, fuerte, muy fuerte
const RU_PEN = [[5, '#4caf50'], [10, '#c0ca33'], [15, '#ffa000'], [20, '#f4511e'], [999, '#b71c1c']];
const ruPenCol = g => (RU_PEN.find(([m]) => Math.abs(g) < m) || RU_PEN[4])[1];
// Cartografía de fondo del mapa de la ficha (IGN): topográfico, mapa base y foto aérea
const RU_WMS = {
  topo: b => `https://www.ign.es/wms-inspire/mapa-raster?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=mtn_rasterizado&STYLES=&CRS=EPSG:4326&BBOX=${b.s},${b.w},${b.n},${b.e}&WIDTH=${Math.round(b.W * 1.5)}&HEIGHT=${Math.round(b.H * 1.5)}&FORMAT=image/jpeg`,
  sat: b => `https://www.ign.es/wms-inspire/pnoa-ma?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=OI.OrthoimageCoverage&STYLES=&CRS=EPSG:4326&BBOX=${b.s},${b.w},${b.n},${b.e}&WIDTH=${Math.round(b.W * 1.5)}&HEIGHT=${Math.round(b.H * 1.5)}&FORMAT=image/jpeg`,
  mapa: null};

// ---------- idiomas: textos de esta pantalla en web/idiomas.js (window.I18N_RU) ----------
const ruT = (s, v) => {const L = window.LANG, d = (L && L !== 'es' && window.I18N_RU && I18N_RU[L]) || {}; let t = d[s] || s;
  if (v) t = t.replace(/\{(\w)\}/g, (_, k) => v[k] == null ? '' : v[k]); return t;};
// descripción de la ruta: en castellano la de tools/rutas.py; en otros idiomas se monta con los datos de la ruta
function ruDesc(r) {
  if (!window.LANG || LANG === 'es') return r.desc;
  const p = r.pf, a = p[0], b = p[p.length - 1], k = p.indexOf(r.mx), F = x => ruF(x);
  let t = r.circ ? ruT('Ruta circular con salida y llegada en {p} ({a} m).', {p: r.pueblo, a}) : ruT('Sale de {p} ({a} m) y llega a {f} ({b} m).', {p: r.pueblo, a, f: r.fin, b});
  const L = (r.pasa || []).slice(0, 7); if (L.length) t += ' ' + ruT('Pasa por {l}.', {l: L.length === 1 ? L[0] : L.slice(0, -1).join(', ') + ruT(' y ') + L[L.length - 1]});
  t += ' ' + (k <= 3 ? ruT('El punto más alto ({m} m) es la salida.', {m: r.mx}) : k >= p.length - 4 && !r.circ ? ruT('El punto más alto ({m} m) es la llegada.', {m: r.mx})
    : ruT('Punto más alto: {m} m, hacia el km {k}.', {m: r.mx, k: F(r.km * k / (p.length - 1))}));
  return t + ' ' + ruT('Sube {u} m y baja {d} m en {k} km.', {u: r.up, d: r.dn, k: F(r.km)});
}

// ---------- utilidades ----------
const ruKm = (a, b) => {const r = Math.PI / 180, p1 = a[0] * r, p2 = b[0] * r, dp = p2 - p1, dl = (b[1] - a[1]) * r;
  return 12742 * Math.asin(Math.min(1, Math.sqrt(Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2)));};
const ruH = h => {const H = Math.floor(h), m = Math.round((h - H) * 60 / 5) * 5; return m === 60 ? `${H + 1} h` : H ? `${H} h${m ? ' ' + String(m).padStart(2, '0') : ''}` : `${m} min`;};
const ruF = (x, d = 1) => (typeof fmtN === 'function' ? fmtN(x, d) : (+x).toFixed(d));
const ruE = s => (typeof esc === 'function' ? esc(s) : String(s == null ? '' : s));
function ruOpen(u) {if (APP && window.AndroidNet.openUrl) window.AndroidNet.openUrl(u); else window.open(u, '_blank');}
// punto de la línea a una fracción (0-1) de su longitud
function ruPunto(r, fr) {const L = r.lin, c = RU.cum, t = fr * c[c.length - 1]; let k = 1; while (k < c.length - 1 && c[k] < t) k++;
  const a = L[k - 1], b = L[k], q = c[k] > c[k - 1] ? (t - c[k - 1]) / (c[k] - c[k - 1]) : 0; return [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q];}

// ---------- estilos ----------
document.head.insertAdjacentHTML('beforeend', `<style>
#ruBox .ruBusca{position:relative;margin:6px 0}
#ruQ{width:100%;box-sizing:border-box;font-size:16px;padding:12px 14px;border-radius:12px}
.ruChips{display:flex;gap:6px;overflow-x:auto;padding:4px 0 8px;scrollbar-width:none}.ruChips::-webkit-scrollbar{display:none}
.ruChips button{white-space:nowrap;border-radius:99px;padding:7px 12px;flex:none}
.ruFil{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px}.ruFil select{width:100%;margin:0}
.ruFil label{grid-column:1/-1;display:flex;align-items:center;gap:6px;font-size:14px;color:var(--txt)}
.ruCard{display:flex;gap:11px;align-items:stretch;cursor:pointer;padding:10px;margin:8px 0}
.ruCard:active{transform:scale(.99)}
.ruMini{width:84px;height:84px;border-radius:12px;flex:none;background:linear-gradient(160deg,rgba(60,180,120,.18),rgba(41,198,242,.16));border:1px solid var(--line)}
.ruTx{flex:1;min-width:0;display:flex;flex-direction:column}
.ruNom{font-size:15px;line-height:1.25;color:var(--txt)}
.ruDat{display:flex;flex-wrap:wrap;gap:3px 8px;font-size:12.5px;margin-top:5px;color:var(--txt);align-items:center}.ruDat>span{white-space:nowrap;display:inline-flex;align-items:center;gap:3px}
.ruDif{color:#fff;border-radius:99px;padding:1px 9px;font-size:12px;font-weight:700}
.ruSpark{width:100%;height:26px;margin-top:auto;display:block}
.ruTit{font-size:21px;line-height:1.2;margin:8px 0 3px;color:var(--txt)}
.ruKpi{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:10px 0}
.ruKpi>div{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:8px 4px;text-align:center}
.ruKpi span{font-size:11px;color:var(--mut);display:block;margin-bottom:2px}.ruKpi b{font-size:15px;color:var(--txt)}
.ruMapBox{position:relative;border-radius:14px;overflow:hidden;border:1px solid var(--line)}
.ruMapBtn{position:absolute;right:8px;top:8px;display:flex;flex-direction:column;gap:6px}
.ruBase{position:absolute;left:8px;bottom:8px;display:flex;gap:4px}
.ruBase button{padding:5px 9px;font-size:12px;border-radius:99px}
.ruPasa{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}.ruPasa span{background:var(--bg);border:1px solid var(--line);border-radius:99px;padding:2px 9px;font-size:12.5px;color:var(--txt)}
.ruKpi>div.w2{grid-column:span 2}
.ruPenL{display:flex;flex-wrap:wrap;gap:4px 10px;margin-top:6px;font-size:11px;color:var(--mut)}.ruPenL i,.ruCompL i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px;vertical-align:-1px}
.ruComp{display:flex;height:12px;border-radius:6px;overflow:hidden;margin-top:8px;background:var(--line)}.ruComp i{display:block;height:100%}
.ruCompL{display:flex;flex-wrap:wrap;gap:4px 14px;margin-top:6px;font-size:12.5px;color:var(--txt)}
.ruWp>div{display:flex;align-items:center;gap:10px;padding:7px 2px;border-top:1px solid var(--line);cursor:pointer}.ruWp>div:first-child{border-top:0}
.ruWp .i{font-size:20px;width:26px;text-align:center;flex:none}.ruWp .n{flex:1;min-width:0;font-size:14px;color:var(--txt)}.ruWp .n small{display:block;font-size:11.5px;color:var(--mut)}
.ruWp .k{font-size:12.5px;font-weight:700;color:var(--txt);white-space:nowrap}
.ruWx{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin:6px 0 10px}
.ruWx>div{background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:6px 2px;text-align:center;font-size:12px;color:var(--txt)}
.ruWx .i{font-size:22px;display:block}
.ruBtns{display:grid;grid-template-columns:1fr 1fr;gap:8px}
/* ---- ficha «profesional» (27 nov. 2026) ---- */
.ruI{display:inline-block;vertical-align:-3px;flex:none}
#ruFicha .ruVol{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;font-size:14px}
#ruFicha .ruMapBox{margin-top:8px;border-radius:18px}
#ruFicha .ruMapBox canvas{display:block;width:100%}
.ruHead{padding:12px 2px 2px}
.ruZona{font-size:12.5px;color:var(--mut);margin:0}
#ruFicha .ruTit{font-size:23px;margin:2px 0 8px}
.ruTags{display:flex;flex-wrap:wrap;gap:6px}
.ruTag{font-size:12.5px;padding:4px 10px;border-radius:8px;background:var(--panel);border:1px solid var(--line);color:var(--txt);display:inline-flex;align-items:center;gap:5px}
.ruTag.dif{color:#fff;border:0;font-weight:700}
.ruBig{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}
.ruBig>div{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:10px 12px}
.ruBig span{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--mut)}
.ruBig b{display:block;font-size:22px;line-height:1.2;margin-top:3px;color:var(--txt);font-weight:700}
.ruAcc{display:flex;flex-direction:column;gap:8px;margin:4px 0 12px}
.ruAcc .btn{display:inline-flex;align-items:center;justify-content:center;gap:7px}
.ruAcc2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.ruAcc3{display:flex;justify-content:center;gap:18px;margin-top:2px}
.ruAcc3 button{background:none;border:0;color:var(--mut);font-size:12.5px;display:inline-flex;align-items:center;gap:5px;padding:4px}
.ruSec{font-size:16px;margin:0 0 6px;color:var(--txt);display:flex;align-items:center;gap:7px}
.ruTec>div{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--line);font-size:14px;color:var(--txt)}
.ruTec>div:first-of-type{border-top:0}
.ruTec .l{color:var(--mut);flex:none}
.ruTec .v{text-align:right;font-weight:600}
.ruMide{display:inline-flex;gap:3px;align-items:center;vertical-align:middle;margin-right:6px}.ruMide i{width:16px;height:6px;border-radius:3px;background:var(--line)}
.ruTec .ruComp{width:100%;margin-top:0}
.ruWp .i{color:var(--acc);font-size:0}
#ruFicha .card{border-radius:16px}
#ruAcc #rgBox{margin:0}#ruAcc #rgGo{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#2e7d32;border-color:#2e7d32;color:#fff}
</style>`);

// ---------- montaje en la sección Escapadas ----------
(function () {
  const box = document.getElementById('ruBox'); if (!box) return;
  box.innerHTML = `<div id="ruLista">
    <div class="ruBusca"><input id="ruQ" class="town" type="search" placeholder="${ruT('Busca ruta, pueblo o sendero (Zubiri, PR-NA 120…)')}" autocomplete="off"></div>
    <div class="ruChips" id="ruG">${RU_GRP.map(([v, t]) => `<button class="btn${v ? '' : ' on'}" data-g="${v}">${ruT(t)}</button>`).join('')}</div>
    <div class="ruFil">
      <select id="ruZ" class="town"><option value="">${ruT('Todas las zonas')}</option>${RU_ZON.map(z => `<option value="${z}">${ruT(z)}</option>`).join('')}</select>
      <select id="ruD" class="town"><option value="">${ruT('Cualquier dificultad')}</option>${Object.keys(RU_DIF).map(d => `<option value="${d}">${ruT(d)}</option>`).join('')}</select>
      <select id="ruK" class="town"><option value="">${ruT('Cualquier distancia')}</option>${[['0-5', 'Hasta 5 km'], ['5-10', 'De 5 a 10 km'], ['10-20', 'De 10 a 20 km'], ['20-999', 'Más de 20 km']].map(([v, t]) => `<option value="${v}">${ruT(t)}</option>`).join('')}</select>
      <select id="ruO" class="town">${[['nombre', '', 'Por nombre'], ['cerca', '', 'Más cerca de mí'], ['km', '', 'Más cortas primero'], ['kmd', '', 'Más largas primero'], ['up', '', 'Menos desnivel primero']].map(([v, i, t]) => `<option value="${v}">${i}${ruT(t)}</option>`).join('')}</select>
      <label><input type="checkbox" id="ruC"> ${ruT('Solo rutas circulares')}</label>
    </div>
    <div class="note" id="ruN">${ruT('Cargando rutas…')}</div>
    <div id="ruL"></div>
    <button class="btn" id="ruMas" style="width:100%;display:none">${ruT('Ver más rutas')}</button>
  </div>
  <div id="ruFicha" style="display:none"></div>`;
  const $ = id => document.getElementById(id);
  let t = 0; $('ruQ').oninput = e => {clearTimeout(t); t = setTimeout(() => {RU.q = e.target.value; RU.n = 25; ruLista();}, 200);};
  $('ruG').onclick = e => {const b = e.target.closest('button'); if (!b) return; RU.g = b.dataset.g; RU.n = 25;
    $('ruG').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); ruLista();};
  $('ruZ').onchange = e => {RU.z = e.target.value; RU.n = 25; ruLista();};
  $('ruD').onchange = e => {RU.d = e.target.value; RU.n = 25; ruLista();};
  $('ruK').onchange = e => {RU.k = e.target.value; RU.n = 25; ruLista();};
  $('ruC').onchange = e => {RU.c = e.target.checked; RU.n = 25; ruLista();};
  $('ruO').onchange = async e => {RU.o = e.target.value; RU.n = 25;
    if (RU.o === 'cerca' && !RU.pos) {$('ruN').textContent = '📍 ' + ruT('Buscando dónde estás…');
      try {const p = await myPos(); RU.pos = [p.la, p.lo];} catch (er) {$('ruN').textContent = '⚠️ ' + er.message; RU.o = 'nombre'; e.target.value = 'nombre';}}
    ruLista();};
  $('ruMas').onclick = () => {RU.n += 25; ruLista(true);};
  $('ruL').onclick = e => {const c = e.target.closest('.ruCard'); if (c) ruFicha(RU.todas[+c.dataset.i]);};
  // el mapa antiguo, al abrir su desplegable, se vuelve a dibujar con su tamaño real
  const old = $('moViejo'); if (old) old.addEventListener('toggle', () => {if (old.open) setTimeout(() => {if (typeof MOM !== 'undefined' && MOM) {MOM.draw(); MOM.base();}}, 80);});
})();

function ruInit() {
  if (RU.todas.length) {if (!RU.sel) ruLista(); else if (RU.map) setTimeout(() => {RU.map.draw(); RU.map.base();}, 60); return;}
  svLoad('rutas.js', 'RUTAS', ok => {
    if (!ok || !window.RUTAS) {document.getElementById('ruN').textContent = '⚠️ ' + ruT('No se pudieron cargar las rutas. Desliza hacia abajo para reintentar.'); return;}
    RU.todas = RUTAS.rutas.map((r, i) => Object.assign(r, {i, _s: SV_N([r.n, r.ref, r.pueblo, r.muni, r.fin, r.zona, ruT(r.zona), r.tipo, r.grupo, ruT(r.grupo), (r.pasa || []).join(' ')].join(' '))}));
    ruLista();
  });
}
svHook('monte', ruInit);

// ---------- lista de rutas ----------
function ruFiltra() {
  const q = SV_N(RU.q).split(/\s+/).filter(Boolean);
  let L = RU.todas.filter(r => (!RU.g || r.grupo === RU.g) && (!RU.z || r.zona === RU.z) && (!RU.d || r.dif === RU.d) && (!RU.c || r.circ)
    && (!RU.k || (() => {const [a, b] = RU.k.split('-').map(Number); return r.km >= a && r.km < b;})()) && q.every(w => r._s.includes(w)));
  const by = {nombre: (a, b) => a.n.localeCompare(b.n, 'es'), km: (a, b) => a.km - b.km, kmd: (a, b) => b.km - a.km, up: (a, b) => a.up - b.up,
    cerca: (a, b) => a._d - b._d}[RU.o];
  if (RU.o === 'cerca' && RU.pos) L.forEach(r => r._d = ruKm(RU.pos, r.lin[0]));
  return L.sort(by);
}
function ruCardHtml(r) {
  const d = RU.o === 'cerca' && r._d != null ? ' · ' + ruT('a {d} km', {d: ruF(r._d, r._d < 10 ? 1 : 0)}) : '';
  return `<div class="card ruCard" data-i="${r.i}"><canvas class="ruMini" data-i="${r.i}"></canvas>
   <div class="ruTx"><b class="ruNom">${ruE(r.n)}</b>
    <div class="note">${ruE(ruT(r.zona))} · ${ruE(ruT(r.circ ? 'circular desde {p}' : 'sale de {p}', {p: r.pueblo}))}${d}</div>
    <div class="ruDat"><span class="ruDif" style="background:${RU_DIF[r.dif]}">${ruT(r.dif)}</span><span>${ruI('ruler', 14)} ${ruF(r.km)} km</span><span>${ruI('trend-up', 14)} ${r.up} m</span><span>${ruI('clock', 14)} ${ruH(r.h)}</span></div>
    ${ruSpark(r)}</div></div>`;
}
function ruSpark(r) {const p = r.pf, mn = Math.min(...p), mx = Math.max(...p), rg = Math.max(30, mx - mn), W = 200, H = 26;
  const pts = p.map((e, i) => `${(i / (p.length - 1) * W).toFixed(1)},${(H - 2 - (e - mn) / rg * (H - 4)).toFixed(1)}`).join(' ');
  return `<svg class="ruSpark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><polygon points="0,${H} ${pts} ${W},${H}" fill="${RU_DIF[r.dif]}33"/><polyline points="${pts}" fill="none" stroke="${RU_DIF[r.dif]}" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>`;}
// recuadro de la lista: trozo del mapa del IGN con la ruta dibujada encima.
// El mapa se pide solo cuando la ruta aparece en pantalla (para no gastar datos con las que no se ven).
function ruMini(cv, r) {const W = 84, H = 84, k = window.devicePixelRatio || 1;
  cv.width = W * k; cv.height = H * k; const x = cv.getContext('2d'); x.setTransform(k, 0, 0, k, 0, 0);
  const L = r.lin, la = L.map(p => p[0]), lo = L.map(p => p[1]), s = Math.min(...la), n = Math.max(...la), w = Math.min(...lo), e = Math.max(...lo);
  const cla = (s + n) / 2, clo = (w + e) / 2, kx = Math.cos(cla * Math.PI / 180);
  // escala: que la ruta quepa con margen, pero sin acercarse más de ~1 km de lado (rutas muy cortas)
  const sc = Math.min((W - 18) / Math.max(1e-6, (e - w) * kx), (H - 18) / Math.max(1e-6, n - s), H / 0.009);
  const P = p => [W / 2 + (p[1] - clo) * kx * sc, H / 2 - (p[0] - cla) * sc];
  const ruta = () => {x.lineJoin = x.lineCap = 'round';
    for (const [col, wd] of [['rgba(255,255,255,.95)', 5.5], [RU_DIF[r.dif], 3]]) {x.strokeStyle = col; x.lineWidth = wd; x.beginPath(); L.forEach((p, i) => {const [a, b] = P(p); i ? x.lineTo(a, b) : x.moveTo(a, b);}); x.stroke();}
    const [a, b] = P(L[0]); x.fillStyle = '#2e9e4f'; x.strokeStyle = '#fff'; x.lineWidth = 2; x.beginPath(); x.arc(a, b, 4.5, 0, 7); x.fill(); x.stroke();};
  ruta();
  // zona del mapa que cubre el recuadro (en grados: el IGN la estira igual que el dibujo, así encajan)
  const dla = H / 2 / sc, dlo = W / 2 / (kx * sc), px = Math.round(W * k);
  const u = `https://www.ign.es/wms-inspire/ign-base?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=IGNBaseTodo&STYLES=&CRS=EPSG:4326&BBOX=${(cla - dla).toFixed(5)},${(clo - dlo).toFixed(5)},${(cla + dla).toFixed(5)},${(clo + dlo).toFixed(5)}&WIDTH=${px}&HEIGHT=${px}&FORMAT=image/jpeg`;
  const pide = () => {const im = new Image(); im.onload = () => {x.clearRect(0, 0, W, H); x.drawImage(im, 0, 0, W, H); ruta();}; im.src = u;};
  if (!window.IntersectionObserver) return pide();
  const ob = new IntersectionObserver(es => {if (es.some(q => q.isIntersecting)) {ob.disconnect(); pide();}}, {rootMargin: '200px'}); ob.observe(cv);
}
function ruLista(mas) {
  const L = ruFiltra(), el = document.getElementById('ruL'); if (!el) return;
  document.getElementById('ruN').textContent = RU.todas.length !== L.length ? ruT(L.length === 1 ? '{n} ruta de {t}' : '{n} rutas de {t}', {n: L.length, t: RU.todas.length}) : ruT('{n} rutas en Navarra', {n: L.length});
  const desde = mas ? el.children.length : 0, trozo = L.slice(desde, RU.n);
  if (!mas) el.innerHTML = '';
  el.insertAdjacentHTML('beforeend', trozo.map(ruCardHtml).join('') || (mas ? '' : `<div class="card note">${ruT('No hay rutas con esos filtros. Prueba a quitar alguno.')}</div>`));
  el.querySelectorAll('canvas.ruMini:not([data-ok])').forEach(cv => {cv.dataset.ok = 1; ruMini(cv, RU.todas[+cv.dataset.i]);});
  document.getElementById('ruMas').style.display = L.length > RU.n ? '' : 'none';
}

// ---------- ficha de una ruta ----------
function ruFicha(r) {
  // puntos de interés: del mismo tipo y a menos de 300 m (p. ej. cinco dólmenes del mismo collado) sale solo el primero
  if (r.wp && !r._wpf) {const o = []; r.wp.forEach(w => {if (!o.some(v => v[1] === w[1] && Math.abs(v[0] - w[0]) < 0.3)) o.push(w);}); r.wp = o; r._wpf = 1;}
  RU.sel = r; RU.pt = null; RU.scroll = window.scrollY;
  // la ficha ocupa un paso en el historial: el «atrás» del móvil la cierra y vuelve a la lista
  if (!(history.state && history.state.ruta)) history.pushState({t: 'monte', ruta: 1}, '');
  const L = r.lin; RU.cum = [0]; for (let i = 1; i < L.length; i++) RU.cum.push(RU.cum[i - 1] + ruKm(L[i - 1], L[i]));
  const fi = document.getElementById('ruFicha'), li = document.getElementById('ruLista');
  li.style.display = 'none'; fi.style.display = '';
  const ref = r.ref && !SV_N(r.n).includes(SV_N(r.ref)) ? ruE(r.ref) + ' · ' : '';
  const difCol = RU_DIF[r.dif] || '#888', mideBar = r.mide ? `<span class="ruMide">${[1, 2, 3, 4, 5].map(n => `<i style="${n <= r.mide ? 'background:' + difCol : ''}"></i>`).join('')}</span>${r.mide}/5` : '';
  const C = [['Senda', '#5d8c3a'], ['Pista', '#c49a5a'], ['Asfalto', '#6b7075']];
  fi.innerHTML = `<button class="btn ruVol" id="ruVolver">${ruI('arrow-left', 16)} ${ruT('Volver a las rutas')}</button>
   <div class="ruMapBox"><canvas id="ruMapa" height="320"></canvas>
    <div class="ruMapBtn"><button class="btn mtb" id="ruIn">＋</button><button class="btn mtb" id="ruOut">－</button><button class="btn mtb" id="ruAll">⤢</button></div>
    <div class="ruBase">${[['topo', 'Topo'], ['mapa', 'Mapa'], ['sat', 'Satélite']].map(([k, t]) => `<button class="btn${RU.base === k ? ' on' : ''}" data-b="${k}">${ruT(t)}</button>`).join('')}</div></div>
   <div class="ruHead"><p class="ruZona">${ref}${ruE(ruT(r.zona))} · ${ruE(r.muni || r.pueblo)}</p>
    <h2 class="ruTit">${ruE(r.n)}</h2>
    <div class="ruTags"><span class="ruTag dif" style="background:${difCol}">${ruT(r.dif)}</span>
     <span class="ruTag">${ruI(r.circ ? 'arrows-clockwise' : 'arrow-right', 14)} ${ruT(r.circ ? 'Circular' : 'Lineal')}</span>
     ${r.sac ? `<span class="ruTag">SAC ${RU_SAC[r.sac].split(' ')[0]}</span>` : ''}<span class="ruTag">${ruE(ruT(r.grupo))}</span></div></div>
   <div class="ruBig">
    <div><span>${ruI('ruler', 16)} ${ruT('Distancia')}</span><b>${ruF(r.km)} km</b></div>
    <div><span>${ruI('clock', 16)} ${ruT(r.mide ? 'Tiempo MIDE' : 'Tiempo')}</span><b>${ruH(r.h)}</b></div>
    <div><span>${ruI('trend-up', 16)} ${ruT('Subida')}</span><b>${r.up} m</b></div>
    <div><span>${ruI('trend-down', 16)} ${ruT('Bajada')}</span><b>${r.dn} m</b></div></div>
   <div class="ruAcc" id="ruAcc">
    <div class="ruAcc2"><button class="btn" id="ruGpx">${ruI('download-simple', 17)} ${ruT('GPX')}</button><button class="btn" id="ruIr">${ruI('car', 17)} ${ruT('Cómo llegar')}</button></div>
    <div class="ruAcc3"><button id="ruSh">${ruI('share-network', 15)} ${ruT('Compartir')}</button>${r.osm ? `<button id="ruOsm">${ruI('map-trifold', 15)} OpenStreetMap</button>` : ''}${r.web ? `<button id="ruWeb">${ruI('arrow-square-out', 15)} ${ruT('Web oficial')}</button>` : ''}</div></div>
   <div class="card" style="padding:12px 10px 10px"><h3 class="ruSec">${ruI('mountains')} ${ruT('Perfil')}</h3>${ruPerfil(r)}
    <div id="ruPfT" class="note" style="min-height:2.9em;margin-top:2px">${ruT('Desliza el dedo por la gráfica (o toca la ruta en el mapa) para ver la altitud de cada punto.')}</div>
    ${r.ps ? `<div class="ruPenL">${RU_PEN.map(([m, c], i) => `<span><i style="background:${c}"></i>${i ? (i < 4 ? RU_PEN[i - 1][0] + '–' + m : '+' + RU_PEN[3][0]) : '0–' + m} %</span>`).join('')}</div>` : ''}</div>
   <div class="card ruTec"><h3 class="ruSec">${ruI('gauge')} ${ruT('Ficha técnica')}</h3>
    ${r.mide ? `<div><span class="l">${ruT('Esfuerzo MIDE')}</span><span class="v">${mideBar}</span></div>` : ''}
    <div><span class="l">${ruT('Dificultad')}</span><span class="v" style="color:${difCol}">${ruT(r.dif)}</span></div>
    ${r.ps ? `<div><span class="l">${ruT('Pendiente máx.')}</span><span class="v"><span style="color:${ruPenCol(r.ps[0])}">${r.ps[0]} %</span> ${ruT('sube')} · <span style="color:${ruPenCol(r.pb[0])}">${r.pb[0]} %</span> ${ruT('baja')}</span></div>` : ''}
    <div><span class="l">${ruT('Altitud')}</span><span class="v">${r.mn} – ${r.mx} m</span></div>
    ${r.sac ? `<div><span class="l">${ruT('Tramo más difícil (escala SAC)')}</span><span class="v">${ruT(RU_SAC[r.sac])}</span></div>` : ''}
    ${r.comp ? `<div style="flex-direction:column;align-items:stretch;gap:6px"><span class="l">${ruT('Terreno')}</span><div class="ruComp">${r.comp.map((v, i) => v ? `<i style="width:${v}%;background:${C[i][1]}"></i>` : '').join('')}</div>
     <div class="ruCompL">${r.comp.map((v, i) => `<span><i style="background:${C[i][1]}"></i>${ruT(C[i][0])} <b>${v} %</b></span>`).join('')}</div></div>` : ''}</div>
   ${ruWpHtml(r)}
   <div class="card"><h3 class="ruSec">${ruI('sneaker-move')} ${ruT('La ruta')}</h3><div style="font-size:14.5px;line-height:1.55;color:var(--txt)">${ruE(ruDesc(r))}</div>
    ${r.destaca ? `<div class="note" style="margin-top:6px">${ruT('Destacado')}: ${ruE(r.destaca)}</div>` : ''}
    ${r.pasa && r.pasa.length ? `<div class="note" style="margin-top:8px">${ruT('Pueblos por los que pasa:')}</div><div class="ruPasa">${r.pasa.map(p => `<span>${ruE(p)}</span>`).join('')}</div>` : ''}</div>
   <div class="card" id="ruTiempo"><h3 class="ruSec">${ruI('cloud-sun')} ${ruT('El tiempo en el recorrido')}</h3><div class="note">${ruT('Cargando la previsión…')}</div></div>
   <div class="card" style="border-color:#ffb020"><div class="note" style="display:flex;gap:8px"><span style="color:#d89b00">${ruI('warning')}</span><span>${r.mide ? ruT('Tiempo orientativo sin paradas (método MIDE: 4 km/h en llano, 400 m/h subiendo, 600 m/h bajando). Alturas y pendientes con el modelo del terreno de 5 m del IGN. La dificultad sale de la distancia, el desnivel y la escala SAC de los tramos: infórmate antes de salir, mira los avisos y lleva agua, ropa de abrigo y el móvil cargado. Emergencias: 112.') : ruT('Tiempo orientativo sin paradas (norma DIN 33466: 4 km/h en llano, 300 m/h subiendo, 500 m/h bajando). La dificultad está calculada con la distancia y el desnivel, no con el terreno: infórmate antes de salir, mira los avisos y lleva agua, ropa de abrigo y el móvil cargado. Emergencias: 112.')}</span></div></div>`;
  const $ = id => document.getElementById(id);
  $('ruVolver').onclick = () => {if (history.state && history.state.ruta) history.back(); else ruCerrar();};
  $('ruGpx').onclick = () => ruGpx(r);
  $('ruIr').onclick = () => ruOpen(`https://www.google.com/maps/dir/?api=1&destination=${r.lin[0][0]},${r.lin[0][1]}`);
  if ($('ruOsm')) $('ruOsm').onclick = () => ruOpen(`https://www.openstreetmap.org/relation/${r.osm}`);
  if ($('ruWeb')) $('ruWeb').onclick = () => ruOpen(r.web);
  $('ruSh').onclick = () => {const t = `🥾 ${r.n}\n📏 ${ruF(r.km)} km · ↗ ${r.up} m · ↘ ${r.dn} m · ${ruT(r.dif)} · ⏱️ ${ruH(r.h)}\n📍 ${ruT('Salida')}: https://www.google.com/maps/search/?api=1&query=${r.lin[0][0]},${r.lin[0][1]}\n(BasatiNA · basatina.es)`;
    if (APP) window.AndroidNet.share(t); else if (navigator.share) navigator.share({text: t}).catch(() => {}); else navigator.clipboard && navigator.clipboard.writeText(t);};
  fi.querySelectorAll('.ruWp>div[data-k]').forEach(d => d.onclick = () => {ruCursor(r, +d.dataset.k / r.km); const m = document.getElementById('ruMapa');
    if (m) window.scrollTo(0, Math.max(0, m.getBoundingClientRect().top + window.scrollY - 90));});
  fi.querySelectorAll('.ruBase button').forEach(b => b.onclick = () => {RU.base = b.dataset.b; fi.querySelectorAll('.ruBase button').forEach(x => x.classList.toggle('on', x === b));
    if (RU.map) {RU.map.wms = RU_WMS[RU.base]; RU.map.img = null; RU.map.base();}});
  window.scrollTo(0, Math.max(0, fi.getBoundingClientRect().top + window.scrollY - 100));
  setTimeout(() => {ruMapa(r); ruPerfilTouch(r);}, 30);
  ruTiempo(r);
}
// tipo de camino: senda / pista / asfalto (de OpenStreetMap) y escala SAC
function ruCaminoHtml(r) {
  if (!r.comp && !r.sac) return '';
  const C = [['Senda', '#5d8c3a'], ['Pista', '#c49a5a'], ['Asfalto', '#6b7075']];
  return `<div class="card"><b>🛤️ ${ruT('Por dónde va')}</b>${r.comp ? `<div class="ruComp">${r.comp.map((v, i) => v ? `<i style="width:${v}%;background:${C[i][1]}"></i>` : '').join('')}</div>
    <div class="ruCompL">${r.comp.map((v, i) => `<span><i style="background:${C[i][1]}"></i>${ruT(C[i][0])} <b>${v} %</b></span>`).join('')}</div>` : ''}
    ${r.sac ? `<div class="note" style="margin-top:8px">${ruT('Tramo más difícil (escala SAC)')}: <b>${ruT(RU_SAC[r.sac])}</b></div>` : ''}</div>`;
}
// puntos de interés del recorrido, en orden
function ruWpHtml(r) {
  if (!r.wp || !r.wp.length) return '';
  return `<div class="card"><h3 class="ruSec">${ruI('map-pin')} ${ruT('Qué te vas a encontrar')}</h3><div class="note" style="margin:-2px 0 6px">${ruT('Toca uno para verlo en el mapa y en el perfil.')}</div><div class="ruWp">${r.wp.map(w =>
    `<div data-k="${w[0]}"><span class="i">${ruWpI(w, 20)}</span><span class="n">${ruE(w[2])}<small>${ruT((RU_WP[w[1]] || ['', ''])[1])}${w[5] ? ' · ' + w[5] + ' m' : ''}</small></span><span class="k">km ${ruF(w[0])}</span></div>`).join('')}</div></div>`;
}
function ruCerrar() {RU.sel = null; document.getElementById('ruFicha').style.display = 'none'; document.getElementById('ruFicha').innerHTML = '';
  document.getElementById('ruLista').style.display = ''; RU.map = null; setTimeout(() => window.scrollTo(0, RU.scroll), 20);}

// ---------- mapa de la ficha: solo esta ruta ----------
function ruMapa(r) {
  const M = NavMap('ruMapa', (x, P, b) => {
    const L = r.lin; x.lineJoin = x.lineCap = 'round';
    for (const [col, wd] of [['rgba(255,255,255,.9)', 7], [RU_DIF[r.dif], 4]]) {x.strokeStyle = col; x.lineWidth = wd; x.beginPath();
      L.forEach((p, i) => {const [a, c] = P(p[0], p[1]); i ? x.lineTo(a, c) : x.moveTo(a, c);}); x.stroke();}
    // flechas de sentido cada cierto trecho
    const tot = RU.cum[RU.cum.length - 1], paso = Math.max(tot / 8, 0.3);
    x.fillStyle = '#fff';
    for (let d = paso / 2; d < tot; d += paso) {const fr = d / tot, p = ruPunto(r, fr), q = ruPunto(r, Math.min(1, fr + 0.002)), [a, c] = P(p[0], p[1]), [a2, c2] = P(q[0], q[1]), an = Math.atan2(c2 - c, a2 - a);
      x.save(); x.translate(a, c); x.rotate(an); x.beginPath(); x.moveTo(5, 0); x.lineTo(-4, -4); x.lineTo(-4, 4); x.closePath(); x.fill(); x.restore();}
    const mk = (p, col, t) => {const [a, c] = P(p[0], p[1]); x.fillStyle = col; x.strokeStyle = '#fff'; x.lineWidth = 2.5; x.beginPath(); x.arc(a, c, 9, 0, 7); x.fill(); x.stroke();
      x.fillStyle = '#fff'; x.font = 'bold 10px system-ui'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(t, a, c + .5);};
    if (r.wp) {x.font = '15px system-ui'; x.textAlign = 'center'; x.textBaseline = 'middle';
      r.wp.forEach(w => {const [a, c] = P(w[3], w[4]); x.fillStyle = '#fff'; x.strokeStyle = 'rgba(0,0,0,.3)'; x.lineWidth = 1; x.beginPath(); x.arc(a, c, 11, 0, 7); x.fill(); x.stroke();
        const ic = ruP2((RU_WP[w[1]] || [])[2] || 'map-pin');
        if (ic) {x.save(); x.translate(a - 7, c - 7); x.scale(14 / 256, 14 / 256); x.fillStyle = '#1f5f8b'; x.fill(ic); x.restore();} else {x.fillStyle = '#000'; x.fillText((RU_WP[w[1]] || ['📍'])[0], a, c + 1);}});}
    if (!r.circ) mk(L[L.length - 1], '#d32f2f', 'F');
    mk(L[0], '#2e9e4f', r.circ ? '⟳' : 'S');
    if (RU.pt) {const [a, c] = P(RU.pt[0], RU.pt[1]); x.fillStyle = '#ffeb3b'; x.strokeStyle = '#222'; x.lineWidth = 2; x.beginPath(); x.arc(a, c, 7, 0, 7); x.fill(); x.stroke();}
  }, (px, py, M) => {   // tocar la ruta en el mapa: se marca ese punto también en el perfil
    const L = r.lin; let best = -1, bd = 24;
    L.forEach((p, i) => {const [a, c] = M.P(p[0], p[1]), d = Math.hypot(a - px, c - py); if (d < bd) {bd = d; best = i;}});
    if (best >= 0) ruCursor(r, RU.cum[best] / RU.cum[RU.cum.length - 1]);
  });
  M.wms = RU_WMS[RU.base]; RU.map = M;
  const la = r.lin.map(p => p[0]), lo = r.lin.map(p => p[1]);
  M.fit(Math.min(...la), Math.max(...la), Math.min(...lo), Math.max(...lo));
  const $ = id => document.getElementById(id);
  $('ruIn').onclick = () => M.zoom(1.6); $('ruOut').onclick = () => M.zoom(1 / 1.6);
  $('ruAll').onclick = () => M.fit(Math.min(...la), Math.max(...la), Math.min(...lo), Math.max(...lo));
}

// ---------- perfil que se sigue con el dedo ----------
const RU_PF = {W: 360, H: 150, L: 36};
function ruPerfil(r) {
  const p = r.pf, {W, H, L} = RU_PF, mn = Math.min(...p), mx = Math.max(...p), rg = Math.max(40, mx - mn), y0 = mn - rg * .08, y1 = mx + rg * .12;
  const X = i => L + i / (p.length - 1) * (W - L), Y = e => H - (e - y0) / (y1 - y0) * H, col = RU_DIF[r.dif];
  const pl = p.map((e, i) => X(i).toFixed(1) + ',' + Y(e).toFixed(1)).join(' ');
  const st = [25, 50, 100, 200, 250, 500].find(v => rg / v <= 4) || 1000; let gr = '';
  for (let e = Math.ceil(y0 / st) * st; e <= y1; e += st) gr += `<line x1="${L}" x2="${W}" y1="${Y(e).toFixed(1)}" y2="${Y(e).toFixed(1)}" stroke="currentColor" stroke-opacity=".12"/><text x="${L - 4}" y="${(Y(e) + 3).toFixed(1)}" text-anchor="end" font-size="9" fill="currentColor" fill-opacity=".6">${e}</text>`;
  const ks = r.km <= 4 ? 1 : r.km <= 10 ? 2 : r.km <= 25 ? 5 : r.km <= 60 ? 10 : 20;
  for (let k = 0; k <= r.km + 1e-9; k += ks) gr += `<text x="${(L + k / r.km * (W - L)).toFixed(1)}" y="${H + 13}" text-anchor="middle" font-size="9" fill="currentColor" fill-opacity=".6">${k}${k ? '' : ' km'}</text>`;
  RU_PF.y = Y;
  // línea coloreada según la pendiente de cada tramo (si la ruta trae pendientes; si no, de un color)
  let lin = `<polyline points="${pl}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linejoin="round"/>`;
  if (r.ps) {const dk = r.km * 1000 / (p.length - 1); lin = '';
    for (let i = 1; i < p.length; i++) {const a = Math.max(0, i - 2), b = Math.min(p.length - 1, i + 1), g = (p[b] - p[a]) / ((b - a) * dk) * 100;
      lin += `<line x1="${X(i - 1).toFixed(1)}" y1="${Y(p[i - 1]).toFixed(1)}" x2="${X(i).toFixed(1)}" y2="${Y(p[i]).toFixed(1)}" stroke="${ruPenCol(g)}" stroke-width="2.8" stroke-linecap="round"/>`;}}
  const wp = (r.wp || []).map(w => {const xx = L + w[0] / r.km * (W - L), i = Math.round(w[0] / r.km * (p.length - 1)), yy = Y(p[Math.max(0, Math.min(p.length - 1, i))]);
    return `<line x1="${xx.toFixed(1)}" x2="${xx.toFixed(1)}" y1="${(yy - 4).toFixed(1)}" y2="${Math.max(10, yy - 16).toFixed(1)}" stroke="currentColor" stroke-opacity=".35"/><circle cx="${xx.toFixed(1)}" cy="${Math.max(6, yy - 19).toFixed(1)}" r="4" fill="#1f5f8b" stroke="#fff" stroke-width="1.5"/>`;}).join('');
  return `<svg id="ruPf" viewBox="0 0 ${W} ${H + 17}" style="width:100%;touch-action:pan-y;display:block;margin-top:6px;color:var(--txt)">
   <defs><linearGradient id="ruGr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".45"/><stop offset="1" stop-color="${col}" stop-opacity=".04"/></linearGradient></defs>${gr}
   <polygon points="${L},${H} ${pl} ${W},${H}" fill="url(#ruGr)"/>${lin}${wp}
   <line id="ruPfC" x1="0" x2="0" y1="0" y2="${H}" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3" visibility="hidden"/>
   <circle id="ruPfD" r="5" fill="#ffeb3b" stroke="#222" stroke-width="1.5" visibility="hidden"/>
   <g id="ruPfB" visibility="hidden"><rect id="ruPfR" rx="5" height="18" fill="#222" fill-opacity=".82"/><text id="ruPfX" font-size="11" font-weight="700" fill="#fff" y="13"></text></g></svg>`;
}
function ruCursor(r, fr) {
  const p = r.pf, n = p.length, {W, L} = RU_PF, i = Math.round(Math.max(0, Math.min(1, fr)) * (n - 1)), cx = L + i / (n - 1) * (W - L), cy = RU_PF.y(p[i]);
  const C = document.getElementById('ruPfC'), D = document.getElementById('ruPfD'); if (!C) return;
  C.setAttribute('x1', cx); C.setAttribute('x2', cx); C.setAttribute('visibility', 'visible'); D.setAttribute('cx', cx); D.setAttribute('cy', cy); D.setAttribute('visibility', 'visible');
  // burbuja con la altitud encima del punto
  const tx = `${p[i]} m`, bw = tx.length * 6.6 + 10, bx = Math.max(L, Math.min(W - bw, cx - bw / 2)), by = Math.max(0, cy - 26);
  const B = document.getElementById('ruPfB'); document.getElementById('ruPfR').setAttribute('width', bw); document.getElementById('ruPfX').textContent = tx;
  document.getElementById('ruPfX').setAttribute('x', 5); B.setAttribute('transform', `translate(${bx.toFixed(1)},${by.toFixed(1)})`); B.setAttribute('visibility', 'visible');
  const dk = r.km / (n - 1) * 1000, a = Math.max(0, i - 2), b = Math.min(n - 1, i + 2), g = (p[b] - p[a]) / ((b - a) * dk) * 100;
  document.getElementById('ruPfT').innerHTML = ruT('Km {a} de {b} · altitud {c} · pendiente {d}', {a: `<b>${ruF(i / (n - 1) * r.km)}</b>`, b: ruF(r.km), c: `<b>${p[i]} m</b>`, d: `<b>${g > 0 ? '+' : ''}${Math.round(g)} %</b>`});
  RU.pt = ruPunto(r, i / (n - 1)); if (RU.map) RU.map.draw();
}
function ruPerfilTouch(r) {
  const sv = document.getElementById('ruPf'); if (!sv) return; const {W, L} = RU_PF;
  const mv = e => {const b = sv.getBoundingClientRect(), xv = (e.clientX - b.left) / b.width * W; ruCursor(r, (xv - L) / (W - L));};
  sv.addEventListener('pointerdown', e => {sv.setPointerCapture(e.pointerId); mv(e);});
  sv.addEventListener('pointermove', e => {if (e.buttons || e.pointerType === 'touch') mv(e);});
}

// ---------- descarga GPX (con las alturas del perfil) ----------
function ruGpx(r) {
  const L = r.lin, tot = RU.cum[RU.cum.length - 1], p = r.pf, n = p.length;
  const ele = i => {const f = tot ? RU.cum[i] / tot * (n - 1) : 0, a = Math.floor(f), b = Math.min(n - 1, a + 1); return Math.round(p[a] + (p[b] - p[a]) * (f - a));};
  const x = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="BasatiNA (basatina.es)" xmlns="http://www.topografix.com/GPX/1/1">\n<metadata><name>${x(r.n)}</name><desc>${x((r.fuente || []).join(' · '))}</desc></metadata>\n`
    + `<wpt lat="${L[0][0]}" lon="${L[0][1]}"><ele>${ele(0)}</ele><name>${x(ruT('Salida'))}</name></wpt>\n`
    + (r.wp || []).map(w => `<wpt lat="${w[3]}" lon="${w[4]}">${w[5] ? `<ele>${w[5]}</ele>` : ''}<name>${x(w[2])}</name><type>${x(ruT((RU_WP[w[1]] || ['', ''])[1]))}</type></wpt>\n`).join('')
    + (r.circ ? '' : `<wpt lat="${L[L.length - 1][0]}" lon="${L[L.length - 1][1]}"><ele>${ele(L.length - 1)}</ele><name>${x(ruT('Llegada'))}</name></wpt>\n`)
    + `<trk><name>${x(r.n)}</name><trkseg>\n${L.map((q, i) => `<trkpt lat="${q[0]}" lon="${q[1]}"><ele>${ele(i)}</ele></trkpt>`).join('\n')}\n</trkseg></trk>\n</gpx>\n`;
  const nom = SV_N(r.n).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) + '.gpx';
  if (APP && window.AndroidNet.shareFile) {window.AndroidNet.shareFile(nom, btoa(unescape(encodeURIComponent(gpx))), 'application/gpx+xml'); return;}
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([gpx], {type: 'application/gpx+xml'})); a.download = nom; document.body.appendChild(a); a.click();
  setTimeout(() => {URL.revokeObjectURL(a.href); a.remove();}, 1000);
}

// ---------- el tiempo en el recorrido: salida, punto más alto y llegada ----------
async function ruTiempo(r) {
  const el = document.getElementById('ruTiempo'); if (!el) return;
  const L = r.lin, k = r.pf.indexOf(r.mx), cima = ruPunto(r, k / (r.pf.length - 1));
  const P = [[ruT('Salida') + ' · ' + r.pueblo, L[0], r.pf[0]]];
  if (k > 2 && k < r.pf.length - 3 && r.mx - Math.max(r.pf[0], r.pf[r.pf.length - 1]) > 80) P.push([ruT('Punto más alto'), cima, r.mx]);
  if (!r.circ && ruKm(L[0], L[L.length - 1]) > 2) P.push([ruT('Llegada') + ' · ' + r.fin, L[L.length - 1], r.pf[r.pf.length - 1]]);
  const J = await Promise.all(P.map(([, q, alt]) => getJSON(`${OM}?latitude=${q[0].toFixed(4)}&longitude=${q[1].toFixed(4)}&elevation=${alt}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&forecast_days=4${TZ}`)));
  if (RU.sel !== r || !document.getElementById('ruTiempo')) return;
  if (J.every(j => !j || !j.daily)) {el.innerHTML = `<h3 class="ruSec">${ruI('cloud-sun')} ${ruT('El tiempo en el recorrido')}</h3><div class="note">${ruT('No se pudo cargar la previsión ahora.')}</div>`; return;}
  const h = new Date().getHours();
  el.innerHTML = `<h3 class="ruSec">${ruI('cloud-sun')} ${ruT('El tiempo en el recorrido')}</h3>` + P.map(([t, , alt], n) => {const j = J[n]; if (!j || !j.daily) return ''; const d = j.daily;
    return `<div style="margin-top:8px;font-size:13.5px;color:var(--txt)"><b>${ruE(t)}</b> <span class="note">(${alt} m) · ${ruT('ahora')} ${wxIcon(j.current.weather_code, h)} ${Math.round(j.current.temperature_2m)}°</span></div>
     <div class="ruWx">${d.time.map((x, i) => {const dt = new Date(x + 'T12:00'); return `<div><b>${i ? DOW[dt.getDay()] + ' ' + dt.getDate() : ruT('Hoy')}</b><span class="i">${wxIcon(d.weather_code[i], 12)}</span>
      <b>${Math.round(d.temperature_2m_max[i])}°</b> <span class="note">${Math.round(d.temperature_2m_min[i])}°</span><br><span class="note">${d.precipitation_sum[i] > 0.1 ? '💧' + ruF(d.precipitation_sum[i]) + ' mm' : '☀️ ' + ruT('seco')}</span><br><span class="note">💨 ${Math.round(d.wind_speed_10m_max[i])} km/h</span></div>`;}).join('')}</div>`;}).join('');
}

window.addEventListener('popstate', e => {if (RU.sel && !(e.state && e.state.ruta)) ruCerrar();});
