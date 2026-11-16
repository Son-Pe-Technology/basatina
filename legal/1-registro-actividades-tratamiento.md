# Registro de actividades de tratamiento (RAT) · BasatiNA

> **Qué es y por qué lo tenemos.** El artículo 30 del RGPD obliga a apuntar qué datos personales tratamos, para qué y cómo los protegemos. Quien tiene menos de 250 trabajadores se libra **salvo** que el tratamiento no sea ocasional, y la comunidad de avisos es continua, así que lo llevamos.
> No se manda a ningún sitio: se guarda y se enseña a la Agencia Española de Protección de Datos (AEPD) solo si lo pide.
> **Revisarlo** cada vez que la app empiece a recoger algo nuevo y, como mínimo, una vez al año.

**Responsable:** Pedro Iglesias Goñi (Son&Pe Technology Systems) · participa@basatina.es · Navarra (España)
**Delegado de protección de datos:** no hay (no es obligatorio para este proyecto).
**Evaluación de impacto (EIPD):** hecha el 16/11/2026 para cuentas, alertas ciudadanas y Mi Espacio → documento 5.
**Última revisión:** 16 de noviembre de 2026 (cuentas de usuario)

---

## Tratamiento 0 · Cuentas de usuario (desde el 16 nov. 2026)

| Campo | Contenido |
|---|---|
| Finalidad | Dar acceso con cuenta; confirmar el correo y recuperar la contraseña; mostrar el apodo en los avisos; evitar cuentas falsas y bloquear a quien abuse; guardar «Mi Espacio» en la cuenta para tenerlo en varios móviles. |
| Base jurídica | Prestación del servicio que la persona pide al crear la cuenta (art. 6.1.b RGPD) y consentimiento (casillas de 14 años y normas, art. 6.1.a). Antiabuso: interés legítimo (art. 6.1.f). |
| Personas afectadas | Usuarios de 14 años o más que crean una cuenta (voluntaria; solo es necesaria para avisar y votar). |
| Datos | Correo, contraseña (la guarda Firebase con hash; no la vemos), correo confirmado sí/no, apodo, fechas de alta y del último cambio de apodo, versión de normas aceptada. Si hay apodo retirado por moderación, el anterior. Mi Espacio: sitios secretos, diario de salidas (sin fotos), notas, calendario, equipos y calendario deportivo, Mis carreteras, lista de avisos propios, votos y colaboradores ocultos. **No** se sube el diario de dolores (datos de salud) ni las fotos. |
| Datos especiales | Ninguno a propósito. El diario de dolores queda fuera de la cuenta precisamente por ser datos de salud. |
| Destinatarios | Público: solo el apodo, en los avisos. Encargado: Google Ireland Ltd. (Firebase Authentication para correo y contraseña; Cloud Firestore en Madrid para `usuarios`, `apodos` y `espacio`). Los correos de confirmación y de contraseña los envía Firebase. Firebase Authentication registra la IP y el agente de usuario al darse de alta y al entrar (antiabuso) y guarda la IP unas semanas. |
| Transferencias internacionales | Firebase Authentication puede tratar los datos en EE. UU.: cubierto por las Cláusulas Contractuales Tipo y el Marco de Privacidad de Datos UE‑EE. UU. de las condiciones de Google. |
| Plazos | Mientras exista la cuenta. Copias de seguridad semanales cifradas (`copia.yml`), 35 días: lo borrado puede seguir en ellas hasta 35 días. Robot nocturno (`tools/cuentas_limpieza.py`): cuentas sin confirmar a los 30 días, cuentas sin uso en 2 años (con todos sus datos) y anónimos sin uso en 1 año. Al borrarla (app, basatina.es/borrar-cuenta.html o correo a participa@) se borra todo al momento; por correo, en 30 días como máximo. Bloqueos: 12 meses. |
| Seguridad | Reglas de Firestore: cada uno solo lee y escribe su perfil y su Mi Espacio; apodos únicos; avisar y votar solo con correo confirmado. Contraseña mínima de 8 caracteres. Ver documento 2. |

## Tratamiento 0 bis · Contador anónimo de uso (desde el 16 nov. 2026)

| Campo | Contenido |
|---|---|
| Finalidad | Saber cuántos móviles y navegadores usan la app cada día y cada mes, y cuántos son nuevos. |
| Datos | Ninguno personal: se suma +1 a unos totales (`estadisticas/AAAA-MM-DD` y `AAAA-MM`: activos, app, web, nuevos). Sin identificadores. El móvil guarda solo la fecha en que contó (`stUso`). |
| Base jurídica | Interés legítimo (art. 6.1.f), con impacto mínimo. |
| Destinatarios | Encargado: Google (Cloud Firestore, Madrid). Google ve la IP de la conexión; no se guarda. |
| Plazos | Los totales se guardan sin límite (no son datos personales). |

## Tratamiento 1 · Comunidad de avisos

| Campo | Contenido |
|---|---|
| Finalidad | Recibir, moderar y publicar avisos de la gente (árboles caídos, desprendimientos, lluvia intensa, cebos envenenados, accidentes…); gestionar confirmaciones, denuncias y bloqueos; evitar abusos; informar al autor del estado de su aviso. |
| Base jurídica | Consentimiento al enviar (art. 6.1.a RGPD). Moderación, antiabuso y registro de denuncias: interés legítimo (art. 6.1.f) y cumplimiento del Reglamento de Servicios Digitales (arts. 16 y 17). |
| Personas afectadas | Usuarios de 14 años o más que envían, confirman o denuncian avisos. |
| Datos | Tipo de aviso, texto libre (máx. 300 caracteres), coordenadas del suceso, fecha/hora, apodo e identificador interno de la cuenta (desde el 16 nov. 2026 hace falta cuenta para avisar y votar; ver Tratamiento 0). Denuncias sin cuenta: código de colaborador aleatorio (acceso anónimo de Firebase). **No** se pide la ubicación de la persona. |
| Datos especiales | Ninguno a propósito. Si en un texto aparecen datos de terceros o especiales, se borran en la moderación. |
| Destinatarios | Público en general (el aviso publicado con el apodo, sin correo ni identificador). Encargados: Google Ireland Ltd. (Firebase Authentication con acceso anónimo y Cloud Firestore) y Web3Forms (aviso por correo a alertas@basatina.es con el tipo, el texto y el sitio de cada alerta nueva; **nunca** el código de colaborador). |
| Transferencias internacionales | Datos alojados en la región europe-southwest1 (Madrid). Google puede acceder desde fuera de la UE para dar soporte; cubierto por las Cláusulas Contractuales Tipo y el Marco de Privacidad de Datos UE‑EE. UU. incluidos en sus condiciones de tratamiento. |
| Plazos | Visible: 6 h – 7 días según el tipo. Borrado total: 30 días tras caducar. Denuncias y decisiones de moderación: 6 meses. Códigos bloqueados: 12 meses. Registro de moderación (`moderacion`: acción, aviso, quién de los administradores y cuándo): 12 meses. |
| Seguridad | Ver documento 2. |

## Tratamiento 2 · Fotos de la gente

| Campo | Contenido |
|---|---|
| Finalidad | Recibir, revisar y publicar fotos enviadas por los usuarios en la app, la web y redes sociales. |
| Base jurídica | Consentimiento (casillas del formulario, versión `FO_VER`). |
| Personas afectadas | Usuarios de 14 años o más (o con permiso de su madre, padre o tutor). |
| Datos | Foto (sin metadatos), lugar, alias, comentario, correo (opcional), sitio aproximado (opcional). |
| Destinatarios | Público (foto publicada con alias). Encargados: Cloudinary Ltd. (imágenes) y Web3Forms (envío del aviso por correo). |
| Transferencias internacionales | Posibles (EE. UU.). Revisar que ambos proveedores tengan Cláusulas Contractuales Tipo o el Marco de Privacidad de Datos en sus condiciones. |
| Plazos | Mientras esté publicada o hasta que se pida borrarla. Las no publicadas se borran tras revisarlas. |

## Tratamiento 3 · Buzón de sugerencias

| Campo | Contenido |
|---|---|
| Finalidad | Recibir sugerencias, errores y peticiones (incluidas las de derechos y las de contenido ilegal). |
| Base jurídica | Consentimiento. |
| Datos | Tipo de mensaje y texto libre. Anónimo, salvo que la persona escriba algo que la identifique. |
| Destinatarios | Encargado: Web3Forms → buzón participa@basatina.es (OVH, Zimbra, UE). |
| Plazos | Se borran una vez atendidos (como máximo, 6 meses). |

## Tratamiento 3 bis · Refranes de tu pueblo (desde el 15 nov. 2026)

| Campo | Contenido |
|---|---|
| Finalidad | Recibir refranes y dichos para publicarlos en la app. |
| Base jurídica | Consentimiento (casillas de 14 años o más y sin datos personales). |
| Datos | Refrán, significado (opcional) y pueblo. Anónimo: no se pide nombre ni correo. |
| Destinatarios | Encargado: Web3Forms → participa@basatina.es. Si se publica, sale sin ningún dato de quien lo envió (`participa/refranes.json`). |
| Plazos | Los correos se borran una vez revisados. El refrán publicado, mientras siga en la app. |

## Tratamiento 4 · Peticiones de derechos y de retirada de contenidos

| Campo | Contenido |
|---|---|
| Finalidad | Atender peticiones de acceso, rectificación, supresión, oposición, limitación; avisos de contenido ilegal y reclamaciones por moderación. |
| Base jurídica | Obligación legal (art. 6.1.c RGPD; arts. 15‑22 RGPD; arts. 16‑17 Reglamento de Servicios Digitales). |
| Datos | Los que dé la persona (normalmente su correo, su código de colaborador y lo que pide). |
| Plazos | 3 años desde la respuesta (lo que se puede reclamar ante la AEPD). Guardar en una carpeta aparte del correo. |

---

### Lo que NO tratamos (para que conste)
Diario, diario de dolores, calendario, notas, sitios secretos, ajustes y ubicación: se quedan **solo en el móvil** de cada persona y nunca llegan a nosotros.
