# BasatiNA: cómo seguir trabajando en la app

Guía para cualquier persona o asistente de IA (Claude, ChatGPT, Gemini…) que vaya a continuar con el proyecto.
**Léela entera antes de tocar nada.**

Propiedad de **Son&Pe Technology Systems** (Sonia y Pedro).

## 1. Qué es

- **BasatiNA** es una app Android para Navarra: ríos y riadas (SAIH Ebro), el tiempo, radar, carreteras, cámaras, energía, monte, caza, pesca, naturaleza, terremotos, pueblos…
- La app Android es solo una «ventana» (WebView). **Toda la pantalla está en `web/index.html`**, un solo archivo HTML+JS grande.
- El móvil descarga la pantalla nueva sola desde GitHub, así que la mayoría de cambios **no necesitan APK nueva**.

## 2. Archivos importantes

| Archivo | Qué es |
|---|---|
| `web/index.html` | Toda la app: HTML, estilos y JavaScript |
| `web/version.json` | Versión de la pantalla. **Se regenera con `python3 tools/make_version.py` después de cada cambio en `web/`** |
| `web/*.js` (rios, pesca, caza, monte, sismo, pueblos, energia, viaje, agenda) | Datos generados por GitHub Actions. No editar a mano |
| `web/eu.js` | Motor de traducción + diccionario de euskera |
| `web/idiomas.js` | Diccionarios nuevos: euskera (textos nuevos), inglés y francés. Clave = texto exacto en castellano |
| `web/novedades.js` | Cambios del 13 nov. 2026 (ver abajo). Se carga el último |
| `tools/*.py` | Scripts que descargan datos (los ejecuta GitHub Actions, que sí tiene internet) |
| `.github/workflows/*.yml` | Tareas automáticas: `build.yml` compila la APK; el resto actualiza datos |
| `app/src/main/java/es/pedrito/controlarga/` | Código Android: `MainActivity` (WebView + puente `AndroidNet`), `RiverJob` (avisos en segundo plano), `RiverWidget` |
| `app/build.gradle` | `versionCode` / `versionName` de la APK. Súbelo si cambias algo de Android |
| `config/*.json` | Claves de servicios (TomTom, AEMET). Las guarda la propia app desde el modo administrador |
| `pueblos/` | Historia, fiestas y fotos que escriben Pedro y Sonia desde la app |

## 3. Reglas para no romper nada

1. **Haz siempre `git pull` antes de editar** y edita la última versión de `web/index.html`. Ya se perdió trabajo una vez por editar una copia vieja.
2. **No borres ni reescribas secciones enteras.** Cada parte nueva se añade al final del último `<script>` y se engancha envolviendo `showTab`:
   `const _x=showTab;showTab=function(t){_x(t);if(t==='mipantalla')miInit();};`
3. **Cada pantalla** es un `<section id="t-NOMBRE">`, más un botón en el menú `<button data-t="NOMBRE">` y su título en `TITLES`.
4. **Después de tocar `web/`**: ejecuta `python3 tools/make_version.py`, haz commit y push. La APK se compila sola en GitHub Actions.
5. **Internet desde la app**:
   - Las webs que no permiten CORS (SAIH, Gobierno de Navarra, Ministerio…) se piden con `netGet(url)`, que usa el puente Android y solo funciona dentro de la app (`APP===true`).
   - Las que sí lo permiten se piden con `fetch`.
6. **No pongas contraseñas ni claves en el código.** Las claves van en `config/*.json` y se guardan desde la app (modo administrador). La firma de la APK usa los secretos de GitHub `KEYSTORE_B64` (la llave .jks en base64) y `KEYSTORE_PASS` (su contraseña). La llave NO va en el repositorio (es público). No crear nunca una llave nueva: los móviles dejarían de poder actualizar.
7. **Siempre en español**, y si puedes añade el texto en `web/idiomas.js` (euskera, inglés y francés). Pon cada palabra traducible en su propio `<span>` si va mezclada con números. Mensajes claros, sin tecnicismos.
8. **Aviso que debe seguir saliendo**: «⚠️ ANTE EL RIESGO, HAZ CASO SIEMPRE A LOS AVISOS OFICIALES».

## 4. Funciones útiles que ya existen en `index.html`

- **Mapas**: `NavMap(idCanvas, dibujar, tocar)` hace un mapa de Navarra con zoom y fondo del IGN. `drawTiles(...)` pinta capas de teselas XYZ encima.
- **Tiempo**: `getJSON(url)` (Open‑Meteo, con `OM` y `TZ`), `wxIcon(code,hora)`, `wDesc(code)`.
- **Formato y cálculo**: `fmtN(número,decimales)`, `km(lat1,lon1,lat2,lon2)`, `ymd(fecha)`.
- **Interfaz**: `toast(texto)`, `menu(true/false)`, `showTab('nombre')`.
- **Modo administrador** (en el código sigue llamándose «zona técnica»): variable `TECH` y función `techApply()`. Los elementos con clase `tech` solo se ven ahí.
- **GitHub desde la app**: `ghTok()`, `ghPut(ruta, base64, mensaje, sha)` (lo usan Pueblos y las claves).

## 5. Modo administrador (antes «zona técnica»)

- **Cómo se entra**: tocar 5 veces el logo y meter el PIN. La primera vez en cada móvil pide la llave de edición de GitHub.
- **Qué hay dentro**: Agenda de fiestas, Modo científico, SAIH, las casillas de claves, 📊 Descargas de la app (lee `download_count` de las releases de GitHub) y, en «Fotos de la gente», la subida de fotos de Instagram.
- **Fotos (desde nov. 2026)**: «Fotos de la gente» es pública. «Envía tu foto» (el formulario con alias y correo) sigue solo en el modo administrador hasta resolver el tratamiento de datos personales. Mientras, los administradores suben fotos de Instagram con permiso del autor (solo se guarda el @usuario).
- **Huella automática**: `.github/workflows/version.yml` ejecuta `tools/make_version.py` en cada push que toque `web/`, así que editar a mano en la web de GitHub también llega a los móviles.
- **Listas editables desde la app** (modo administrador): `agenda/cultura.json` (Agenda cultural), `deporte/partidos.json` (Deporte navarro), `avisos/escapadas.json` (avisos de «Antes de salir hoy»). Helpers `jsLoad`/`jsEdit`.
- **Datos abiertos de Navarra** (`tools/abiertos.py`, robot `abiertos.yml` cada lunes → `web/abiertos.js`, se carga solo al abrir Turismo): alojamientos, restaurantes, museos, arte y monumentos, festivos locales (salen en la Agenda cultural) y productos típicos/recetas. Usa la API CKAN (`package_show`) por nombre de conjunto; alojamientos y restaurantes se sitúan en su pueblo con `web/pueblos.js`. `python3 tools/abiertos.py --explorar` lista los campos en `tools/abiertos_info.txt`.
- **Bici** (`tools/bici.py`, robot `bici.yml` los martes → `web/bici.js`, ~2 MB, se carga solo al activar una capa de bici en Escapadas): capas de IDENA (DOTACI_Lin_RutasBTT, EuroVelo1/3, INFRAE_*SIGMC: red ciclista, puntos de riesgo, aparcabicis, servicios) y salidas de rutas de carretera/gravel de visitnavarra.es (sus GPX dan 404 en la web oficial: solo ponemos el pueblo de salida y el enlace). El SIG de Pamplona (sig.pamplona.es) no responde desde GitHub.
- **Manuales**: `manuales/` tiene el manual de usuario en PDF. El de administrador es interno y **no se sube aquí** (el repositorio es público): lo guardan Pedro y Sonia.

- **Localidades** (antes «Pueblos», pantalla `pueblos`): ya es pública, en su propio grupo del menú. Editar sigue siendo solo para administradores.
- **Actualizar datos**: ya no hay botón 🔄 arriba; se desliza la pantalla hacia abajo estando arriba del todo (llama a `dRefresh`).
- **Inicio**: debajo del mapa sale «La semana en Navarra» (`seInit` → `#seBody`), ya no hay accesos rápidos.
- **Avisos**: cada aviso usa `avDet(principal, detalles)`: la parte en negrita a la vista y el resto en un desplegable.
- **Diseño «Navarra viva» (nov. 2026)**: el inicio tiene un paisaje animado (`#pvBox`, funciones `pv*`) con el cielo según la hora y el tiempo real de Pamplona. Cada sección lleva arriba una escena animada de su tema (`#pvSec`, funciones `pvs*`). **Si añades una sección nueva, ponla en `PVS_ESC`** con una de estas escenas: cielo, agua, bosque, carretera, sismo, energia, pueblo, fiesta, topo, bokeh (si no, sale «aurora»). Para probar el tiempo a mano: `pvDemo(código, hora)`; `pvDemo()` vuelve a lo real.
- **Ojo al editar a mano en GitHub**: el 10 nov. 2026 una edición borró sin querer la sección Escapadas (`t-monte`) al pegar la de Arbustos. Después de editar, comprueba que siguen estando todas las `<section id="t-…">`.

- **Pantallas nuevas (12 nov. 2026)** en `web/servicios-ui.js` (se carga antes de `naturaleza-catalogo.js`):
  - El tiempo: tarjeta `#tPP` con presión atmosférica (reloj, tendencia) y polen por tipos (Open‑Meteo / CAMS). Se pinta al envolver `extraRender`.
  - 🔭 `astro`: fases de la Luna calculadas (Meeus), lluvias de estrellas, solsticios y eclipses (`AS_LL`, `AS_FIJOS`: **añadir ahí los de 2029 en adelante**). Aviso en el Inicio (`#asBanner`) del día del fenómeno y los 2 anteriores.
  - Grupo «Servicios»: 💊 `farmacia` (farmacias de IDENA con su zona de guardia + enlace a las guardias oficiales), 🧺 `mercados` (lista editable `mercados/mercados.json`; si no existe, sale la lista de `MK_DEF`), 🚌 `bus` (paradas de villavesa con enlace a tiempo real, autobuses, taxis y empresas).
  - Vida silvestre: 🦉 `biodiversidad` (sustituye al catálogo de `naturaleza-catalogo.js`, cuyas 13 fichas revisadas se añaden dentro), 🌱 `medic` (`ME_P`, texto fijo) y 🏞️ `enp` (espacios protegidos, monumentos naturales, zonas húmedas y Red Natura).
  - Robots: `tools/servicios.py` (`servicios.yml`, día 3 de cada mes → `web/servicios.js`) y `tools/especies.py` (`especies.yml`, día 9 → `web/especies.js`; GBIF + Wikipedia, ~1.200 especies, guarda caché en `tools/especies_cache.json`).
- **Agenda cultural**: buscador por localidad (`#agPue`, variable `AGPUE`), filtra también los festivos locales.

- **Escapadas con fichas de ruta (14 nov. 2026)** (`web/rutas-ui.js`, se carga después de `efemerides.js`): buscador arriba, filtros (grupo, zona turística, dificultad, distancia, orden, circulares) y fichas al estilo Wikiloc. Cada ficha: distancia, desnivel, dificultad, altitudes, tiempo (DIN 33466), mapa solo de esa ruta (fondo IGN topográfico/mapa/satélite con `M.wms` de `NavMap`), perfil táctil que mueve el punto en el mapa, descripción, GPX (en la app con `AndroidNet.shareFile`), cómo llegar y el tiempo en salida, cima y llegada. El «atrás» del móvil cierra la ficha. El mapa antiguo (cuevas, miradores, fuentes, baño, bici) sigue debajo, en el desplegable `#moViejo`.
  - **Datos**: `tools/rutas.py` (robot `rutas.yml`, el día 1 de cada mes o al cambiar el script) → `web/rutas.js` (~1 MB, se carga al abrir Escapadas) y `rutas/rutas.json` + `rutas/rutas_info.txt` (resumen para revisar). Junta rutas a pie de OpenStreetMap (Overpass, ODbL) con etapas de GR, Camino de Santiago, vías verdes y senderos de IDENA (lee `web/monte.js`), cose cada ruta en una sola línea, parte las largas en etapas, quita repetidas y calcula el perfil con el modelo del terreno Copernicus GLO-30 (Open-Meteo corta por exceso de peticiones). Zona turística: la de los alojamientos de `web/abiertos.js`.
  - **No usar rutas de Wikiloc**: sus condiciones prohíben descargarlas en bloque y volver a publicarlas.
  - **Idiomas**: los textos de esta pantalla van en `window.I18N_RU` (final de `web/idiomas.js`) y se piden con `ruT()`; en euskera, inglés y francés la descripción de la ruta se monta con sus datos (`ruDesc`).

## 6. Cosas pendientes o ideas

- **Asistente con IA dentro de la app**: solo con la clave protegida en un servidor, nunca en el repositorio público.
- **Radar con previsión (Rainbow.ai)**: preparado, pero sin clave, porque pide tarjeta.

- **Novedades 13 nov. 2026** (`web/novedades.js`, versión de la APK 3.8 / código 18):
  - «BasatiNA» sale siempre con la **NA en rojo** (un vigilante cambia el texto en cualquier pantalla; en la web, `naRojo()` en `docs/index.html`).
  - Vida silvestre: «🦉 Flora y fauna» (antes «Flora, fauna y setas») con el filtro **🌿 Arbustos** dentro (las fichas de `arbustos.js` se añaden a `ESPECIES`). La pantalla `arbustos` lleva ahí.
  - **Retirado**: «Fichas de flora» (`fichas-arboles.js` y sus datos), el script `naturaleza-catalogo.js` ya no se carga (sigue en `web/` solo como fuente de `tools/especies.py`) y se borraron los robots de parches de una sola vez (`naturaleza-*.yml`, `vida-silvestre-solo-identificador.yml`, `fichas-arboles.yml`, `verificar-fichas.yml`): podían volver a meter código viejo en `index.html`.
  - Inicio → **«Ahora en Navarra»**: carrusel (`anLoad`/`anDraw`) con agenda cultural, deporte, mercados, cielo, tu calendario y aviso de salud de hoy, mañana y pasado. Cambia cada 10 s; filtros Todo/Cultura/Deporte/Otros.
  - Grupo **NA Salud** (`salud`): presión y dolores de cabeza, articulaciones, calor/frío, UV, aire y polen (`saCalc`), diario de dolores (solo en el móvil, `saDiario` en localStorage), teléfonos 112 y Toxicología. Plantas medicinales y Farmacias se han movido aquí.
  - **Idioma**: botón «Castellano · Euskara · English · Français» en Configuración. Los grupos del menú guardan su nombre en castellano en `data-k`, así el código los encuentra en cualquier idioma.
  - **Seguridad**: los enlaces externos se abren fuera de la app; el PIN se bloquea tras 5 fallos (30 s, 1 min…); en Android, el WebView solo abre pantallas propias, `AndroidNet.get` solo acepta http/https, `openUrl` solo web/correo/teléfono/mapas y la actualización ignora nombres de archivo raros.

- **Google Play (13 nov. 2026)**: la app apunta a Android 16 (API 36) y desde la versión 4.0 (código 20) su identificador es **`es.sonpe.basatina`** (antes `es.pedrito.controlarga`). **No se puede volver a cambiar nunca.** El paquete Java sigue siendo `es.pedrito.controlarga` (eso da igual).
  - Para el móvil es otra app: en Ajustes está **📦 Copia de mis datos** (guardar/recuperar un .json con localStorage y las fotos de IndexedDB, sin `ghTok` ni el PIN). La app antigua (código < 20) muestra «BasatiNA se muda» (`bnMudanza`).
  - GitHub fabrica el `.aab` para Google Play (Actions → Construir APK → Artifacts). Política de privacidad: `docs/privacidad.html`.
- **Actualización sola (13 nov. 2026)**: `checkUpdate` (envuelto en `novedades.js`) mira si hay pantalla nueva al abrir la app, al volver a ella y cada 30 min, y la aplica sola en el Inicio si no estás escribiendo. La APK desde la web sigue necesitando que el usuario la instale; la de Google Play se actualiza sola desde Play.
- **Ahora en Navarra**: los eventos cambian cada 3 s. Encima, tarjeta de ríos por zonas (`rz*`): Arga alta (Huarte/Eugui), media (Burlada/Pamplona/Arazuri) y baja (Funes/Etxauri); Irati, Ega, Aragón y Ebro con las estaciones que la app ya conoce de «Ríos» (`RIVST`), partidas en tres zonas según hacia dónde corre el río. Solo en la app.

- **📜 Dato del día (13 nov. 2026, APK 4.3 / código 23)**: tarjeta «Tal día como hoy» en el Inicio, encima de «La semana en Navarra» (`web/efemerides.js`), y aviso cada mañana en el móvil (`RiverJob.checkDato`, se activa en Ajustes → «📜 Dato del día», con hora a elegir).
  - Datos en **`efemerides/navarra.json`**: `dias` con clave `MM-DD` (lista de datos `{a, t, txt, cat, fuente, ok}`) y `curiosidades` (salen, rotando, los días sin dato propio). `ok:true` = revisado por Pedro o Sonia. Se edita a mano en GitHub o desde la app en modo administrador (tocar la tarjeta → ✏️).
  - **Sin política**: nada de elecciones, partidos, gobiernos, guerras ni atentados. Hay un filtro de palabras (`EF_NO` en `efemerides.js` y `NO_DATO` en `RiverJob.java`, **deben ser iguales**) y una lista extra `prohibidas` en el JSON que se puede ampliar sin programar.
  - El primer lote (34 días + 19 curiosidades) está **sin revisar** (`ok:false`): comprobad fechas y textos con la fuente antes de darlo por bueno.
  - **Personaje de la semana (APK 4.4 / código 24)**: `semanas` en el JSON = `[{desde:'AAAA-MM-DD' (el sábado en que empieza), personaje, fuente?, dias:[7 datos {t, txt, fuente?}, de sábado a viernes]}]`. Tiene prioridad sobre `dias` y `curiosidades`. Lo leen `efSemana` (web) y `checkDato` (Java).

- **Mejoras 14 nov. 2026** (`web/mejoras.js`, se carga el último, después de `rutas-ui.js`):
  - **PIN común**: la huella del PIN (SHA-256 repetido 20.000 veces con «sal») va en `config/admin.json`. En un dispositivo nuevo se pide la llave de GitHub una vez y, si ya hay PIN común, entra sin crear otro. «Cambiar PIN» lo cambia para todos. Los móviles con el PIN antiguo (`pinH`, solo local) lo suben solos la primera vez que entran. El repositorio es público: el PIN solo esconde herramientas; la protección real es la llave.
  - El tiempo: probabilidad de lluvia (hoy, próximas 3 h, cada día y línea de puntos en «Próximas 24 horas»). Gráficas con **fondo claro** y cuadrícula de puntos (`chGrid`) en el tiempo, Histórico del clima y Energía. Arreglado: la gráfica horaria de Energía no salía porque su `id="enH"` coincidía con la casilla trampa del buzón (ahora `enHc`).
  - 🌙 `lunacampo`: fases, luna ascendente/descendente (`lcDecl`, aproximada), calendario lunar de la huerta (`LC_FASE`, `LC_MES`). Todo marcado como tradición popular.
  - Vida silvestre: la ficha se abre debajo del nombre y se cierra al cambiar de pestaña. Pestaña **🌸 Flores** (`FL_D`, zonas `FL_Z`, `flCompat`): para añadir una flor, una línea más en `FL_D`.
  - 🍲 `cocina` (Turismo): recetas en `CO_R` (añadir una = una línea) y productos típicos de `abiertos.js`. «Dónde comer» queda solo con restaurantes.
  - Ríos: en la web (sin `APP`) cada pantalla de Ríos muestra «Solo en la app del móvil».
  - 🛒 `super` (Servicios) y parques infantiles: `tools/tiendas.py` (robot `tiendas.yml`, día 5 de cada mes) → `web/tiendas.js` (OpenStreetMap).
  - Deporte: ☆ equipo favorito, ☆ seguir liga y ➕ partido suelto (`dpFav`, `dpMios` en localStorage) → **⭐ Mi calendario deportivo** (`misdep`, Mi Espacio), con enlace a Google Calendar y exportar .ics.
  - 🧸 `peques` (Qué hacer): sitios (`PQ_S`), parques infantiles, paseos fáciles (de `rutas.js`) y agenda infantil (palabras de `PQ_KW` en `agenda/cultura.json`).

- **Paquete legal (14 nov. 2026)**, preparado para la futura **Comunidad de avisos**:
  - Públicos (web, `docs/`): `privacidad.html` (actualizada: comunidad, fotos, buzón, menores 14, derechos), `normas-comunidad.html`, `aviso-legal.html`. Enlazados en el pie de basatina.es y en la tarjeta de Privacidad de la app.
  - Internos (`legal/`): 1 registro de actividades (RAT), 2 riesgos y medidas, 3 guía de moderación, derechos y plantillas de respuesta, 4 Google Play (contenido de usuarios + formulario «Seguridad de los datos») y textos de la pantalla de enviar aviso.
  - Diseño acordado para la comunidad: anónima (código de colaborador al azar), Firebase Firestore en Madrid (europe-southwest1), veneno y accidentes con revisión previa, caducidad 6 h–7 días y borrado a los 30 días, botones 🚩 Denunciar y 🙈 Ocultar colaborador (los exige Google Play).
  - Responsable confirmado: Pedro Iglesias Goñi. Sin NIF ni domicilio en el aviso legal (proyecto sin ánimo de lucro).
- **Firebase creado (14 nov. 2026):** proyecto `basatina-9a8b5`, Firestore `(default)` en europe-southwest1 (Madrid), plan Spark (gratis, sin copias de seguridad), app web «BasatiNA» registrada. Configuración pública en `config/firebase.json`. Siguiente: usuarios de administrador en Authentication (correo/contraseña) y pegar las reglas de seguridad en Firestore → Reglas.
- **Reglas de Firestore** en `firestore.rules` (se pegan a mano en Firebase → Firestore → Reglas → Publicar). Cada móvil usa el **acceso anónimo** de Firebase Authentication (su uid es el «código de colaborador»). Administrador único: administracion@sonpe-technology.es (correo/contraseña). La caducidad se calcula con `creado` + horas del tipo (`horas()` en las reglas): si se cambian los tipos, cambiarlo en las reglas y en la app.
- **📣 Comunidad de avisos** (`web/comunidad.js`, sección `comunidad`, primera de «Participa»): mapa y lista de avisos activos, ➕ Avisar (tipo, punto en el mapa, texto, casillas 14 años + normas), 👍/👎, 🚩 Denunciar, 🙈 Ocultar colaborador (campo `ah` = 12 primeras cifras de sha256('basatina:'+uid)), 📋 Mis avisos (con el código de colaborador) y 🛡️ Moderar (solo modo Administrador; entra con administracion@sonpe-technology.es, sesión en sessionStorage). Habla con Firebase por REST, sin librerías. Tipos y horas en `CM_T` (iguales que `horas()` de `firestore.rules`).
  - Robot nocturno `comunidad.yml` → `tools/comunidad_limpieza.py` (borra según los plazos de la política de privacidad). Necesita los secretos de GitHub `CM_ADMIN_EMAIL` y `CM_ADMIN_PASS`.
- **👤 Cuentas de usuario (16 nov. 2026)** (`web/cuenta.js`, se carga justo después de `comunidad.js`; pantalla `cuenta`, primera de «Mi Espacio»):
  - Correo + contraseña con Firebase Authentication por REST. **Avisar y votar exigen cuenta con el correo confirmado** (lo comprueban las reglas: `cuenta()` = token con `email` y `email_verified`). Denunciar 🚩 sigue sin cuenta (lo pide Google Play).
  - Al crear la cuenta se **enlaza** el usuario anónimo del móvil (`accounts:update`): el uid no cambia y no se pierden los avisos anteriores. La sesión (anónima o de cuenta) sigue en `localStorage.cmAuth`; `cuPerfil` guarda el perfil y `cuSync` la sincronización.
  - Firestore: `usuarios/{uid}` (apodo, apodoK, creado, cambiado, normas, quitado), `apodos/{apodo en minúsculas}` → {uid} (apodos únicos), `espacio/{uid}` (Mi Espacio: `d_<clave>` texto JSON + `t_<clave>` hora del cambio). Los avisos llevan el campo `apodo` (tiene que coincidir con el del perfil).
  - **Mi Espacio en la cuenta**: claves `CU_K` de `cuenta.js` (sitios, diario sin fotos, notas, agendaMia, dpFav, dpMios, cmMios, cmOcultos, cmVotos y `roads` = Mis carreteras de `CFG`). Gana el cambio más reciente de cada lista; la primera vez en un móvil se juntan. **No se sube nunca `saDiario`** (datos de salud) ni las fotos. Si añades una lista nueva a Mi Espacio, ponla en `CU_K` y `CU_NOM` y en la política de privacidad (3.0).
  - Apodo: 3–20 letras/números/._- ; palabras prohibidas en `AP_NO` (y nombres «oficiales» en `apodoOk()` de las reglas). En 🛡️ Moderar hay «🏷️ Quitar apodo ofensivo» (lo cambia por `VecinoNNNN`).
  - Borrar la cuenta: en la app y en `docs/borrar-cuenta.html` (https://basatina.es/borrar-cuenta.html, **Google Play lo exige**). Borra perfil, apodo, Mi Espacio, `limites`, sus avisos y la cuenta.
  - Normas en su versión 2 (`CM_NORMAS`/`CU_NORMAS` = 2). Textos legales actualizados: `docs/privacidad.html#cuentas`, `legal/1…` (Tratamiento 0), `legal/2…` (R9–R11), `legal/3…` (borrar una cuenta a mano), `legal/4…` (A bis: Play Console).
  - **👋 Bienvenida**: la primera vez que se abre la app sin sesión sale una ventana con «Crear cuenta / Entrar / Seguir sin cuenta» (`bienvenida()`, marca `cuBienv`).
  - **📊 Contador anónimo** (`cuenta1()` en `cuenta.js`): +1 por móvil y día/mes en `estadisticas/AAAA-MM-DD` y `estadisticas/AAAA-MM` (campos activos, app, web, nuevos), sin identificadores ni sesión. Se ve en Alertas ciudadanas → 🛡️ Moderar → 📊 Usuarios (con el total de cuentas). Es aproximado: quien borra los datos de la app cuenta como nuevo.
  - **🤖 Limpieza de cuentas** (`tools/cuentas_limpieza.py`, paso 2 del robot `comunidad.yml`): cada noche borra las cuentas sin confirmar a los 30 días, las cuentas sin usar en 2 años (con perfil, apodo, Mi Espacio y avisos) y los anónimos sin uso en 1 año. Nunca toca la de administración. Usa el secreto **FIREBASE_SA** (clave de la cuenta de servicio). No imprime correos ni uids (los registros son públicos). Para probar: Actions → Limpieza de la comunidad → Run workflow → simular = «sí».
  - **💾 Copia de seguridad** (`.github/workflows/copia.yml`, domingos 3:17 UTC): `tools/firestore_copia.py` descarga todo Firestore, se cifra con gpg (AES-256, secreto **BACKUP_PASS**) y se guarda 35 días como artifact. No incluye Authentication. Restaurar: `tools/firestore_restaurar.py` (instrucciones dentro).
  - **🧪 Probar reglas** (`.github/workflows/probar-reglas.yml`, a mano): `tools/probar_reglas.py` crea cuentas de prueba, intenta 25 cosas permitidas y prohibidas contra la base real y lo borra todo al final. **Lanzarlo siempre después de publicar unas reglas nuevas.** Si añades una colección o regla, añade su prueba.
  - **📜 Registro de moderación** (`moderacion`, solo administradores): cada acción de 🛡️ Moderar guarda {accion, aviso, quien, cuando, detalle}. Quién se elige al entrar (`CM_MODS` en `comunidad.js`). El robot lo borra a los 12 meses.
  - **En la consola de Firebase** (hecho una vez): Authentication → Método de acceso → «Correo electrónico/contraseña» activado (y «Anónimo» también, para denunciar); Plantillas en español; Configuración → protección contra la enumeración de correos activada. Y pegar `firestore.rules` nuevas.

- **Ampliación del 15 nov. 2026** (lista de Sonia y Pedro). Tres archivos nuevos que se cargan los últimos, en este orden: `web/ampliacion.js`, `web/rios-plus.js`, `web/ocio-ui.js`. No reescriben nada: envuelven funciones (`ppRender`, `tiempoRender`, `NavMap`, `cfgApply`, `ajustesRender`, `agRender`, `dpRender`, `embCard`, `emInit`, `fcRender`) y añaden pantallas con `svSec` + `amNuevo(id, grupo, texto, escena, icono, familia)`.
  - **Menú**: «Participa» se ve como **Cuadrilla BasatiNA · únete** (su `data-k` sigue siendo «Participa»: el código lo busca así). «Avisos de la gente» → **Alertas ciudadanas**; «Escapadas» → **NA a Pie**; «Mi calendario deportivo» → **Mi calendario**; Recolección pasa a Vida silvestre; **Turismo se ha fundido con Localidades** (el grupo Turismo ya no existe); «Mapa de riadas» se abre desde Datos históricos. Cada grupo tiene su color (`GCOL` en `ampliacion.js`). Al abrir un grupo se cierran todos los demás.
  - **Mapas más rápidos**: `NavMap` pinta el fondo con las **teselas WMTS del IGN** (`IGNBaseTodo`, `GoogleMapsCompatible`) en vez de pedir una imagen WMS entera en cada movimiento. Se guardan en memoria (`TC`) y mientras llega una se amplía la del nivel anterior. Si `M.wms` está puesto (topográfico/satélite de las rutas) o el WMTS falla, vuelve al sistema de antes.
  - **El tiempo**: barómetro de esfera (`baroSvg`, zonas `BARO_S`) en su propia tarjeta debajo de Presión y polen; aguja dorada = presión de hace 3 h. «Próximas 24 horas» tiene dos modos: 📈 Gráfica y 🕐 Por horas (48 h, con viento).
  - **NA Sísmica**: pestañas Terremotos · Fallas · Simulador. Las líneas de fallas ya no salen en el mapa de terremotos. Fichas en `FALLAS` (texto, tipo, dirección y sentido de movimiento para las flechas). Simulador: intensidad orientativa `IPE(M,R)=1,5·M − 3,5·log10(R) + 3` con R = distancia al foco en km, escala **EMS-98** (`EMS`). **Aviso en el móvil** de terremotos: `RiverJob.checkSismo` (APK 4.5 / código 25), configurable en Ajustes (`CFG.sismo`, `CFG.sismoM`, se manda en `setAlerts`).
  - **NA Salud → 🏥 Centros de salud y urgencias** (`centros`), **Carreteras → 🌨️ El tiempo en las carreteras (3 días)** (`vias3`: nieve, hielo, niebla, viento, lluvia en puertos y pueblos), **Mi Espacio → 🚧 Mis carreteras** (`mivias`, usa `CFG.roads`, que ya no está en Ajustes).
  - **Cuadrilla → 🗣️ Refranes** (`refranes`): se envían anónimos por Web3Forms y se publican desde la app en modo administrador en `participa/refranes.json`.
  - **Correos**: todo lo de participar va a **participa@basatina.es** (clave `config/web3forms.json`: hay que regenerarla en web3forms.com con ese correo y guardarla desde Buzón → modo administrador). Las alertas ciudadanas nuevas avisan a **alertas@basatina.es** con su propia clave `config/web3forms_alertas.json` (tarjeta en el Buzón, modo administrador). Si esa clave no existe, se usa la de participa.
  - **Ríos** (`rios-plus.js`): embalses con el caudal que sale de cada presa (`EM_DOWN`: si el SAIH no da la salida en el embalse, se lee la estación de justo debajo). **Previsión 3 días para todos los ríos**: mapa por río con las estaciones en verde/amarillo/rojo según el día elegido. Cálculo: caudal de ahora (SAIH) × (GloFAS ese día / GloFAS hoy) con la Flood API de Open‑Meteo; nivel ≈ nivel de ahora × factor^0,6, comparado con los umbrales del SAIH. Se quitó «¿Y si lloviera más?». Gráfica del Arga con fondo claro. **Datos históricos** con pestañas por río (`HIST`).
  - **Qué hacer**: 🎬 Cartelera (`cines`), 🏍️ NA en Moto (`moto`), 🚴 NA Pedalea (`pedalea`, con `bici.js` y las vías verdes de `monte.js`), 🧺 NA de Picnic (`picnic`, áreas recreativas `FOREST_Sym_AreasRecForest` y merenderos de `bici.js`). En Agenda cultural y Deporte no sale la pestaña «Todo»: al tocar otra vez la pestaña elegida se ven todas.
  - **Localidades → pestaña 🗺️ Comarcas y valles** (también en el menú): zonas de `web/territorio.js`, ficha de cada zona (municipios, habitantes, superficie, mapa con cuevas, fuentes, rutas, alojamientos, bares, restaurantes, tiendas, monumentos, miradores y ríos) y de cada municipio (habitantes, partido judicial, teléfono, correo y web del ayuntamiento).
  - **Robots nuevos**: `tools/territorio.py` (robot `territorio.yml`, día 7 de cada mes → `web/territorio.js`: municipios y agrupaciones de IDENA, Wikidata para web/teléfono/partido judicial, sanidad y bares de OpenStreetMap; resumen en `tools/territorio_info.txt`). `tools/ocio.py` (robot `ocio.yml`: cartelera cada día y rutas en moto los lunes → `web/ocio.js`). **Para añadir una ruta en moto**: una entrada más en `RUTAS_MOTO` con los pueblos o puertos por los que pasa (los nombres de `pueblos.js` y `viaje.js`).

- **🎮 NA Juega (17 nov. 2026)** (`web/juegos.js`, se carga el último, después de `ocio-ui.js`): grupo nuevo del menú, antes de «Mi Espacio». Todo funciona sin internet; récords y avance solo en el móvil (localStorage `bnJgCadenas`, `bnJgNutria`, `bnJgRaya`).
  - 🔗 **Las Cadenas** (`jcadenas`): preguntas de Navarra; 8 categorías = 8 cadenas del escudo, 3 aciertos por cadena y luego la pregunta de la esmeralda. **Para añadir preguntas**: una línea más en `JC_CATS` (o en `JC_GEMA`): `[pregunta, correcta, [3 falsas], explicación]`.
  - 🦦 **La Nutria del Arga** (`jnutria`): la culebra de los Nokia. Botón Empezar encima del río; se controla tocando el río a un lado de la cabeza (gira hacia allí), deslizando el dedo (eventos `pointer*`) o con las flechas. Truchas = puntos, cada 4 sale una piedra, se acelera con cada trucha. Se para sola al salir de la pantalla.
  - ⭕ **Tres en raya** (`jraya`): contra la máquina (minimax), niveles Fácil / Normal / Imbatible.
  - Juegos propios: no usar nombres ni diseños de marcas (Trivial Pursuit, Monopoly…).
- **📷 Instagram @basatina.es**: botón «Síguenos en Instagram» en Cuadrilla BasatiNA y tarjeta en Acerca de (`IG` en `juegos.js`), `"instagram"` en `fotos/galeria.json` (lo usa «Fotos y reto del mes»; se cambia también desde el modo administrador) y enlace en el pie de basatina.es (`docs/index.html`).

- **🧩 Temas nuevos (17 nov. 2026)** (`web/temas.js`, se carga el último, después de `juegos.js`):
  - 📰 **Titulares de Navarra** (`noticias`, grupo Servicios) y **cinta de titulares arriba del Inicio** (`#nwTk`, `nwHome`: 15 titulares sin Sucesos que pasan solos; se para al tocar y abre la pantalla). Los medios se **mezclan** (`nwMezcla`: uno de cada medio por turnos, empezando cada vez por uno distinto). Robot `tools/noticias.py` (`noticias.yml`, cada 2 h) → `noticias/noticias.json` (fuera de `web/`: no cambia la versión de la pantalla). **Sin política** (lista `NO` del robot). Solo titular + enlace + medio + hora; la noticia se lee en la web del medio. Medios en `MEDIOS` (nunca Navarra.com, OKdiario ni El Mundo: `FUERA`). Resumen en `noticias/noticias_info.txt` (qué medio da datos y de dónde).
  - 🏔️ **Nieve y aludes** (`nieve`, grupo El tiempo): nieve en el suelo, cota 0 °C y nevadas de 3 días con Open‑Meteo en los puntos `NV_P` + boletín de peligro de aludes y predicción de montaña del Pirineo navarro de AEMET. Robot `tools/aludes.py` (`aludes.yml`, 2 veces al día, usa `config/aemet.json`) → `nieve/aludes.json`. Fuera de temporada AEMET deja el último boletín («finalizada la campaña») y la app lo dice.
  - 🗣️ **Palabra del día en euskera**: tarjeta en el Inicio debajo de «Tal día como hoy». Lista `PD_L` (añadir = una línea). El día 1 de cada mes sale el nombre del mes.
  - 🐾 **Mascotas** (`mascotas`, grupo Servicios): veterinarios (24 h si OSM lo dice), zonas para perros, protectoras, tiendas y consejos (`MA_C`). Robot `tools/mascotas.py` (`mascotas.yml`, día 11) → `web/mascotas.js`.
  - 🧺 **Productos de temporada** (`temporada`, grupo Localidades): calendario `TP_L` (orientativo) y ferias/jornadas gastronómicas de `agenda/cultura.json` (palabras `TP_KW`).
  - 📍 **¿Dónde está?** (`jdonde`, grupo NA Juega): 10 rondas, toca en el mapa de municipios (`web/territorio.js`) dónde está cada uno; 100 puntos a 0 km, 0 a 50 km. Niveles por habitantes (≥3.000, ≥800, todos).

- **🎮 NA Juega, más juegos (17 nov. 2026)** (`web/juegos2.js`, se carga después de `temas.js`). Se **quitó el tres en raya** (lo pidió Pedro). Orden del menú: Las Cadenas, ¿Dónde está?, Descubre el lugar, Parejas, Solitario, La Nutria.
  - 🃏 **Solitario** (`jsoli`): Klondike robando de una en una; tocar una carta la mueve sola (primero a su palo, luego a otra columna), ↩️ deshacer, ⚡ terminar solo cuando todo está boca arriba. Partida guardada en `bnJgSoli`.
  - 🖼️ **Parejas de Navarra** (`jparejas`): 6, 8 o 10 parejas con fotos de lugares; sin fotos, usa dibujos (`PA_DIB`). Al acabar, autores y licencias de las fotos.
  - 🔍 **Descubre el lugar** (`jlugar`): foto tapada en 4×4; se abre una casilla, se cierra y se abre otra (modo fácil: se quedan abiertas). 4 opciones; 100 puntos con la primera casilla, −6 por cada casilla más. 8 fotos por partida. Debajo sale el nombre del lugar y el crédito de la foto.
  - **Fotos**: robot `tools/fotos_juego.py` (`fotosjuego.yml`, día 13) → `web/fotosjuego.js`: foto principal del artículo de es.wikipedia de cada lugar de `LUGARES`, solo con licencia libre (PD, CC0, CC BY, CC BY-SA) y siempre con autor y licencia a la vista. Descarta mapas, banderas y escudos. Resumen en `tools/fotosjuego_info.txt` (qué lugares no tienen foto válida). Más adelante se pueden sumar las fotos de «Fotos de la gente» con permiso.

- **🧸 Juegos para los peques (17 nov. 2026)** (`web/juegos-peques.js`, se carga después de `juegos2.js`). En «NA Juega» (con «🧸 Peques:» delante) y en una tarjeta de la pantalla 🧸 Para los peques. Sin internet, botones grandes; si el móvil lo permite, lee en voz alta (`speechSynthesis`, botón 🔊/🔇, `bnPqVoz`).
  - 🐾 **Las sombras** (`psombras`): sombra de un animal (el dibujo con `filter:brightness(0)`) y 3 opciones. Animales en `PQ_AN` (añadir = una línea).
  - 🔢 **A contar** (`pcontar`): hasta 5 o hasta 10; se pueden tocar los animales para contarlos uno a uno.
  - 🐟 **Atrapa las truchas** (`ptruchas`): 30 s, 9 pozas; la bota vieja resta 2. Va más rápido al final.
