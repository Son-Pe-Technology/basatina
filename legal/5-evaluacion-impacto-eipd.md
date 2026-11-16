# Evaluación de impacto relativa a la protección de datos (EIPD) · BasatiNA

> **Qué es y por qué la tenemos.** El artículo 35 del RGPD obliga a hacer una evaluación de impacto antes de un tratamiento que pueda suponer un **alto riesgo** para las personas. El 16 de noviembre de 2026 pasamos la herramienta oficial de la AEPD **«Evalúa Riesgo RGPD»** y el resultado fue *riesgo intrínseco muy alto → EIPD obligatoria*. Este documento es esa EIPD.
> No se manda a ningún sitio: se guarda junto al informe de la herramienta y se enseña a la AEPD solo si lo pide.
> Sigue la estructura de la guía de la AEPD *«Gestión del riesgo y evaluación de impacto en tratamientos de datos personales»* y el art. 35.7 RGPD: (a) descripción del tratamiento, (b) necesidad y proporcionalidad, (c) riesgos y (d) medidas.

| | |
|---|---|
| **Responsable del tratamiento** | Pedro Iglesias Goñi (Son&Pe Technology Systems) · participa@basatina.es · Navarra (España) |
| **Colabora** | Sonia (administradora de la comunidad) |
| **Delegado de protección de datos** | No hay (no es obligatorio para este proyecto) |
| **Tratamientos evaluados** | Cuentas de usuario (Tratamiento 0), Comunidad de avisos «Alertas ciudadanas» (Tratamiento 1) y Mi Espacio en la cuenta, del registro de actividades (documento 1). El contador anónimo de uso (0 bis) se incluye solo como referencia: no trata datos personales. |
| **Fuera de esta EIPD** | Fotos de la gente, buzón de sugerencias y refranes (Tratamientos 2, 3 y 3 bis): son ocasionales, sin cuentas ni ubicación, y no salieron como alto riesgo. |
| **Versión y fecha** | Versión 1.3 · 16 de noviembre de 2026 |
| **Próxima revisión** | 16 de noviembre de 2027, o antes si cambia algo de lo del apartado 8 |

---

## 1. Por qué hace falta esta EIPD (resultado de la herramienta de la AEPD)

Herramienta: **Evalúa Riesgo RGPD** (AEPD), rellenada el 16/11/2026. Informe en PDF y archivo de respuestas guardados en la carpeta «Protección de datos».

| Resultado | Valor |
|---|---|
| Riesgo intrínseco (antes de medidas) | **1,000 · Muy alto → EIPD obligatoria** |
| Riesgo residual (con las medidas actuales) | **0,412 · Bajo** |

Factores que se marcaron, todos con mitigación significativa salvo donde se indica:
- **Finalidades:** localización (los avisos llevan el punto del suceso); identificación unívoca (cada cuenta tiene identificador y correo).
- **Tipos de datos:** diarios y notas (Mi Espacio); IP, UID y navegador/dispositivo (los usa Firebase Authentication contra el abuso); lugares habituales (Mis sitios, Mis carreteras); quejas sobre la persona (denuncias y bloqueos); preferencias de ocio (equipos favoritos).
- **Extensión:** tratamiento sistemático; variedad de datos (Mi Espacio); alcance regional (toda Navarra).
- **Interesados:** posibles menores de 14 años (la edad solo se declara con una casilla).
- **Técnicas:** servicios web, aplicación móvil y procesos automáticos (publicación de avisos no delicados, retirada por votos y limpieza nocturna).
- **Recogida:** datos desde la aplicación; asociación en la cuenta de avisos, apodo y Mi Espacio.
- **Efectos:** desinformación por avisos falsos; daño reputacional; usurpación de identidad; reidentificación por inferencia; pérdida de control en el encargado; impedir el acceso al servicio (bloqueos).
- **Responsable:** servicio de la sociedad de la información.
- **Otros (propios):** avisos que lleven a alguien a ponerse en peligro; datos de terceros en el texto libre; filtración de la llave de administración.
- **Seguridad:** confidencialidad, integridad, disponibilidad (mitigación media: no hay copias de seguridad), trazabilidad (mitigación media), autenticidad, resiliencia, fallos técnicos (mitigación media en el test; después se probaron las reglas contra la base real, ver R5) y errores de operación.

> **Conclusión de este apartado:** el riesgo alto viene de que se **juntan** varios criterios (ubicación + identificadores + sistemático + regional + posibles menores), no de que se traten datos especialmente sensibles. Con las medidas actuales el riesgo queda **bajo**.

---

## 2. Descripción sistemática del tratamiento (art. 35.7.a)

### 2.1 Qué es BasatiNA y para qué se usan los datos
App gratuita, sin publicidad y sin ánimo de lucro, con información de Navarra (ríos, tiempo, naturaleza, ocio…). La mayor parte de la app **no trata datos personales**: funciona sin cuenta y guarda lo del usuario solo en su móvil. Esta EIPD cubre lo que sí los trata:

| Finalidad | Qué hace |
|---|---|
| **F1 · Alertas ciudadanas** | Que la gente avise de incidencias en Navarra (árbol caído, desprendimiento, camino cortado, crecida, cebos envenenados, accidente…) y que los demás las vean en un mapa, voten si siguen ahí y las denuncien si no cumplen las normas. |
| **F2 · Cuentas de usuario** | Que avisar y votar exija una cuenta con correo confirmado y apodo público, para frenar avisos falsos y poder bloquear a quien abuse. |
| **F3 · Mi Espacio en la cuenta** | Que quien quiera tenga sus listas personales en todos sus móviles. |
| **F4 · Moderación** | Que Pedro y Sonia revisen los avisos delicados, atiendan denuncias, retiren contenidos y bloqueen a quien incumpla las normas. |

### 2.2 Interesados
- Personas usuarias de **14 años o más** que crean una cuenta (voluntaria).
- Personas que **denuncian** un aviso sin cuenta (código anónimo al azar).
- **Terceros** que alguien pudiera nombrar en el texto de un aviso (no deseado; ver riesgo R2).
- Volumen previsto: **pocos cientos**, por debajo de mil cuentas el primer año.

### 2.3 Datos tratados

| Conjunto | Datos | Dónde |
|---|---|---|
| Cuenta | Correo, contraseña (hash; no la vemos), correo confirmado sí/no, IP y agente de usuario al entrar (Firebase, unas semanas) | Firebase Authentication |
| Perfil | Apodo, fecha de alta, fecha del último cambio de apodo, versión de normas aceptada, apodo retirado por moderación (si lo hay) | Firestore `usuarios`, `apodos` (Madrid) |
| Avisos | Tipo, texto (máx. 300 caracteres), punto del suceso (redondeado a ~10 m), fecha, apodo, votos; en la ficha privada, el identificador del autor | Firestore `avisos`, `avisos_priv`, `votos` |
| Moderación | Denuncias (motivo y código de quien denuncia), bloqueos, límite antispam, registro de acciones de moderación (acción, aviso, administrador, fecha) | Firestore `denuncias`, `bloqueados`, `limites`, `moderacion` |
| Mi Espacio | Sitios secretos, diario de salidas **sin fotos**, notas, calendario, equipos y calendario deportivo, Mis carreteras, lista de avisos propios, votos, colaboradores ocultos | Firestore `espacio` |
| **No se tratan** | Nombre y apellidos, teléfono, fecha de nacimiento, ubicación de la persona, fotos de personas, **diario de dolores (salud, se queda en el móvil)** | — |

### 2.4 Ciclo de vida de los datos

| Fase | Cómo |
|---|---|
| **Recogida** | Los mete la propia persona en la app o la web, después de leer la información (casillas al crear la cuenta, aviso al enviar, política de privacidad). La ubicación del aviso la marca la persona en el mapa; la de su móvil solo se usa dentro del móvil para centrar el mapa y no se envía. |
| **Almacenamiento** | Cloud Firestore en **europe-southwest1 (Madrid)**. Correo y contraseña en Firebase Authentication (Google; puede tratarlos en EE. UU.). Todo con HTTPS. |
| **Uso** | Mostrar avisos publicados; revisar los delicados; votar; sincronizar Mi Espacio; moderar. |
| **Comunicación** | Público: solo el aviso publicado con su apodo. Nadie recibe correos ni identificadores. Encargado: Google (Firebase). Los correos de confirmación y contraseña los envía Firebase. |
| **Copias** | Copia semanal cifrada de Firestore (sin correos ni contraseñas) guardada 35 días en GitHub; lo borrado puede seguir en ellas hasta que caducan. |
| **Borrado** | El usuario borra sus avisos y su cuenta cuando quiere (app o basatina.es/borrar-cuenta.html). Robot nocturno: avisos 30 días después de caducar, denuncias a los 6 meses, bloqueos y registro de moderación a los 12, cuentas sin confirmar a los 30 días, cuentas sin uso a los 2 años y códigos anónimos sin uso al año. |

### 2.5 Sistemas e intervinientes
- **App Android** (WebView) y **web basatina.es** (GitHub Pages), mismo código.
- **Google Firebase** (Authentication + Cloud Firestore): encargado del tratamiento con sus Condiciones de Tratamiento de Datos.
- **GitHub Actions**: ejecuta los robots de limpieza con secretos cifrados (`CM_ADMIN_EMAIL`, `CM_ADMIN_PASS`, `FIREBASE_SA`). Sus registros son públicos y no imprimen datos personales.
- Administración: una cuenta compartida `administracion@sonpe-technology.es` para Pedro y Sonia; consola de Firebase con sus cuentas de Google (verificación en dos pasos).

---

## 3. Necesidad y proporcionalidad (art. 35.7.b)

| Principio | Cómo se cumple |
|---|---|
| **Licitud (art. 6)** | Cuenta y Mi Espacio: servicio pedido por la persona (6.1.b) y consentimiento con casillas (6.1.a). Avisos: consentimiento al enviarlos. Antiabuso y moderación: interés legítimo (6.1.f) en una comunidad segura, poco invasivo. |
| **Finalidad** | Los datos solo se usan para F1 a F4. Sin publicidad, perfiles, venta ni cesión. |
| **Minimización** | Solo correo y apodo para la cuenta; sin nombre, teléfono ni edad exacta. Ubicación del suceso, no de la persona, y redondeada. Fotos y diario de dolores fuera de la cuenta. Contador de uso sin identificadores. |
| **Exactitud** | Cada uno corrige su apodo y sus datos de Mi Espacio; los avisos caducan solos y se pueden votar como «ya no está». |
| **Limitación del plazo** | Plazos del apartado 2.4, aplicados por robots automáticos. |
| **Transparencia** | Política de privacidad (apartados 3.0, 3.1 y 3.5), normas de la comunidad y textos en la propia pantalla antes de enviar. |
| **Derechos** | Acceso, rectificación y supresión **desde la app** (Mis avisos, Mi cuenta, Borrar mi cuenta) y por correo a participa@basatina.es en un mes. Página web de borrado. |
| **Menores** | 14 años o más (art. 7 LOPDGDD), con casilla obligatoria. |
| **Encargados** | Google, con contrato de encargado incluido en las condiciones de Firebase. |
| **Transferencias internacionales** | Solo Firebase Authentication; Google está adherido al Marco de Privacidad de Datos UE‑EE. UU. (decisión de adecuación) y además ofrece cláusulas contractuales tipo. |

**Alternativas que se valoraron:**
1. *Comunidad anónima, sin cuentas* (fase 1, 14–16 nov. 2026): menos datos, pero no se podía frenar a quien metiera avisos falsos reinstalando la app. Se pasó a cuentas **solo para avisar y votar**.
2. *Cuenta obligatoria para usar toda la app*: **descartada**. Pedía datos a quien solo quiere ver un río o el tiempo, lo que no es proporcional, y podía dejar a alguien sin información de emergencia. Para saber cuántos usuarios hay se usa un contador anónimo.
3. *Subir el diario de dolores a la cuenta*: **descartada**, por ser datos de salud.

---

## 4. Riesgos y medidas (art. 35.7.c y d)

Escala: Probabilidad e Impacto = Baja / Media / Alta. Riesgo residual = después de las medidas.

| # | Riesgo para las personas | Prob. | Impacto | Medidas que ya hay | Residual |
|---|---|---|---|---|---|
| R1 | **Aviso falso o exagerado** que asusta o lleva a alguien a ponerse en peligro (acercarse a una crecida, no llamar al 112) | Baja | Alto | Cartel fijo «Si hay heridos o peligro, llama primero al 112». Veneno, accidentes y «otro» van siempre a revisión. Votos «ya no está» lo quitan. Caducidad automática. Cuenta con correo confirmado y bloqueo de quien abuse. | **Bajo** |
| R2 | **Datos de terceros** en el texto (nombres, matrículas, teléfonos, acusaciones) → daño reputacional | Baja | Medio | Filtro automático que manda a revisión textos con matrículas, teléfonos, correos o expresiones de culpa. Normas que lo prohíben. 🚩 Denunciar sin cuenta. Los administradores editan o retiran en menos de 24 h. | **Bajo** |
| R3 | **Reidentificación** de quien avisa (apodo + sitio + hora en un pueblo pequeño) | Baja | Bajo | Recomendación de no usar el nombre real en el apodo; apodos con nombre o correo bloqueados; correo e identificador nunca públicos; hora mostrada como «hace X»; avisos que caducan. | **Bajo** |
| R4 | **Usurpación de cuenta** o de identidad (contraseña robada, apodo que imita a otro o a una autoridad) | Baja | Bajo | Contraseña de 8+ caracteres; Firebase frena intentos; protección contra la enumeración de correos activada; apodos únicos; apodos «oficiales» prohibidos en las reglas; administradores cambian apodos ofensivos. | **Bajo** |
| R5 | **Acceso indebido** a datos ajenos (correos, Mi Espacio, avisos pendientes) por fallo en las reglas | Baja | Medio | Reglas de Firestore: cada uno solo lee y escribe lo suyo; el correo no está en Firestore. **Probadas contra la base de datos real** el 16/11/2026 con `tools/probar_reglas.py` (25 de 25 pruebas correctas: perfiles y Mi Espacio ajenos, apodos, avisos sin cuenta o sin confirmar, límite de envío, avisos pendientes, denuncias, bloqueos y contador). | **Bajo** |
| R6 | **Filtración de la llave de administración** (cuenta de servicio o contraseña de moderación) | Baja | Alto | Secretos cifrados de GitHub; nunca en archivos ni registros; verificación en dos pasos en Google, GitHub y OVH; solo Pedro y Sonia. | **Bajo** |
| R7 | **Pérdida de datos** (Mi Espacio, avisos) por fallo o error | Baja | Bajo | Mi Espacio sigue en el móvil aunque falle la nube; Google con servidores redundantes; **copia semanal cifrada** (AES‑256) de Firestore, guardada 35 días fuera de Google (GitHub) y con guía para restaurarla. | **Bajo** |
| R8 | **Robot que borra de más** por un error | Baja | Medio | Modo simulación; se para si fuera a borrar más de la mitad de las cuentas; no toca la de administración; las cuentas bloqueadas a mano no se borran solas. | **Bajo** |
| R9 | **Menores de 14** que crean cuenta mintiendo | Media | Bajo | Casilla obligatoria; no se piden datos que identifiquen; revisión de avisos delicados; si se detecta, se borra la cuenta. | **Bajo** |
| R10 | **Bloqueo injusto** de una cuenta (impide avisar) | Baja | Bajo | Lo deciden personas, no una máquina; se informa del motivo; se puede reclamar en participa@; ver los avisos sigue siendo libre; bloqueo máximo de 12 meses. | **Bajo** |
| R11 | **Encargado (Google)** que trate los datos de otra forma o los transfiera | Baja | Medio | Condiciones de tratamiento de datos de Firebase; Firestore en Madrid; Marco de Privacidad de Datos UE‑EE. UU. | **Bajo** |
| R12 | **Falta de registro** de quién retiró o editó cada aviso (trazabilidad) | Media | Bajo | Motivo de retirada guardado en el aviso y visible para su autor. **Registro de moderación** (`moderacion`): qué acción, sobre qué aviso, quién de los dos administradores y cuándo; solo lo ven los administradores y se borra a los 12 meses. | **Bajo** |

**Riesgo residual global: BAJO** (coincide con la herramienta: 0,412).

---

## 5. Plan de acción (medidas pendientes)

| # | Medida | Para qué riesgo | Prioridad | Estado |
|---|---|---|---|---|
| A1 | Copia de seguridad **semanal** de Firestore hecha por el robot y guardada fuera de Google | R7 | Media | ✅ Hecha (16/11/2026): `copia.yml`, cifrada, 35 días |
| A2 | Probar las reglas contra la base real | R5 | Media | ✅ Hecha (16/11/2026): robot «Probar reglas», 25/25. Repetir cada vez que cambien las reglas. |
| A3 | Activar **Firebase App Check** si aparece spam automático | R1, R4 | Baja | Solo si hace falta |
| A4 | Guardar en cada retirada **qué administrador** la hizo y cuándo | R12 | Baja | ✅ Hecha (16/11/2026): registro de moderación, 12 meses |
| A5 | Formularios de Google Play: Seguridad de los datos, Eliminación de cuentas y cuenta de prueba para el revisor (documento 4) | Transparencia | Alta | Cuando Google verifique la identidad |
| A6 | Repetir «Evalúa Riesgo RGPD» y esta EIPD si se cumple algo del apartado 8 | Todos | — | Programado |

---

## 6. Opinión de los interesados (art. 35.9)

No se ha hecho una consulta formal antes de lanzar las cuentas: el proyecto es pequeño y los usuarios actuales son, sobre todo, personas cercanas. Para recogerla en adelante:
- El **buzón de sugerencias** anónimo de la app sirve para que cualquiera opine sobre la comunidad y la privacidad.
- Las reclamaciones sobre moderación o datos que lleguen a participa@basatina.es se revisarán en cada actualización de esta EIPD.

---

## 7. Conclusión y decisión

- El tratamiento es **necesario y proporcionado** para lo que se busca (alertas fiables entre vecinos y Mi Espacio en varios móviles), y se han descartado las opciones más invasivas.
- Con las medidas aplicadas, el **riesgo residual es BAJO**. **No** es necesaria la consulta previa a la AEPD (art. 36 RGPD), que solo es obligatoria si el riesgo sigue siendo alto.
- Se aprueba poner en marcha el tratamiento y se aplicará el plan de acción del apartado 5.

| | |
|---|---|
| **Aprobado por** | Pedro Iglesias Goñi, responsable del tratamiento |
| **Fecha** | 16 de noviembre de 2026 |
| **Firma** | ____________________ |

---

## 8. Cuándo hay que revisar esta EIPD

Antes de la fecha prevista (16/11/2027) si pasa cualquiera de estas cosas:
- Se superan las **5.000 cuentas**, o la comunidad se extiende fuera de Navarra.
- Se añaden **fotos** a los avisos, **ubicación en tiempo real**, notificaciones por cercanía o cualquier dato nuevo.
- Se sube a la cuenta algo de **salud** (por ejemplo, el diario de dolores) o datos de menores.
- Se cambia de proveedor (salir de Firebase) o se empieza a cobrar o a poner publicidad.
- Hay una **brecha de seguridad** o una reclamación ante la AEPD.

**Historial**
| Versión | Fecha | Cambio |
|---|---|---|
| 1 | 16/11/2026 | Primera EIPD, tras el resultado de «Evalúa Riesgo RGPD» (riesgo intrínseco muy alto, residual bajo). |
| 1.1 | 16/11/2026 | Hecha la acción A1 (copias de seguridad semanales cifradas). |
| 1.2 | 16/11/2026 | Hecha la acción A2 (reglas probadas contra la base real: 25/25). |
| 1.3 | 16/11/2026 | Hecha la acción A4 (registro de moderación). |
