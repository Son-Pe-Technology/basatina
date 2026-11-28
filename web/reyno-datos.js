/* =====================================================================
   📜 LA HISTORIA DE UN REYNO · contenido (28 nov. 2026, Pedro y Sonia)
   Textos de elaboración propia del equipo de BasatiNA. Aquí está todo lo que se lee:
     · pres: la presentación (portada).
     · tomos: los 16 tomos. «f» = cuándo se publica (hora de Madrid). Hasta esa hora sale como «Próximamente».
       Para publicar un tomo se rellena su «secs» (apartados), «crono» (cronología) y «fuentes».
       Un tomo sin «secs» sale como «Próximamente» aunque haya pasado su fecha.
   Formato de un apartado: {t:'Título', p:['párrafo','párrafo',…]}  (en los párrafos vale <b>, <i> y <br>)
   Cronología: [['778','Carlomagno toma Pamplona'], …]
   ===================================================================== */
window.REYNO={
 titulo:'La Historia de un Reyno',
 sub:'Del Reino de Pamplona a la Ley Paccionada',
 firma:'Equipo BasatiNA',
 pres:{
  intro:['Durante más de mil años existió en estas tierras un reino. Nació en torno a Pamplona, entre las montañas del Pirineo y la ribera del Ebro. Lo levantaron gentes que supieron mantenerse en pie entre dos grandes poderes: los francos al norte y al-Ándalus al sur.',
   'Primero se llamó Reino de Pamplona y después Reino de Navarra. Tuvo reyes y reinas, Cortes y fueros, monasterios y caminos de peregrinos, guerras y pactos. También tuvo derrotas, y aun así supo conservar durante siglos sus leyes y su forma de gobierno.',
   'Este espacio nace para contar esa historia completa, sin prisas y con detalle.'],
  que:'Cada semana publicaremos una nueva entrega de una obra en varios tomos. Empezará antes del año 778 y llegará hasta la Ley Paccionada de 1841.',
  queLista:[
   ['Los hechos, uno a uno','batallas, pactos, matrimonios, concilios, fundaciones, fueros y donaciones, con todos los que estén documentados.'],
   ['Las personas','reyes, reinas, obispos, nobles y gentes del pueblo, y también los aliados y rivales francos y musulmanes.'],
   ['Los debates','dónde no se ponen de acuerdo los historiadores y por qué.'],
   ['Leyenda frente a historia','qué es tradición y qué está demostrado.'],
   ['Una cronología detallada','de cada periodo.'],
   ['Las fuentes','crónicas de la época y bibliografía académica, para que cualquiera pueda comprobar lo que contamos.']],
  porque:['Un pueblo que olvida de dónde viene pierde parte de lo que es.',
   'Detrás de cada fecha hubo personas reales. Defendieron sus valles y su ciudad. Negociaron con vecinos poderosos y, cuando hizo falta, se enfrentaron a ellos. Supieron convivir con culturas distintas y levantaron unas leyes propias que duraron siglos.',
   'Muchos de ellos no dejaron su nombre escrito en ninguna parte. Aun así, su esfuerzo sigue presente en nuestros pueblos, nuestras iglesias, nuestros caminos y nuestra manera de entender la comunidad.',
   'Queremos recordar lo que fuimos para que la lucha de nuestros antepasados no caiga en el olvido. Lo haremos con respeto por la verdad histórica, porque la mejor forma de honrarles es contar su historia tal y como fue.'],
  lema:'Cada semana, un paso más en la historia de un Reyno.',
  nota:'Contenido de elaboración propia, a partir de fuentes académicas, libros de historia y documentales citadas en cada tomo. Algunos textos se apoyan también en Wikipedia (licencia CC BY-SA 4.0).'
 },
 tomos:[
  {n:'0',t:'Antes del reino: vascones, romanos, visigodos y la llegada del islam',f:'2026-12-05T10:00:00+01:00'},
  {n:'I',t:'778–824: de Roncesvalles a Íñigo Arista',f:'2026-12-12T10:00:00+01:00'},
  {n:'II',t:'824–905: la dinastía Arista',f:'2026-12-19T10:00:00+01:00'},
  {n:'III',t:'905–1000: la dinastía Jimena',f:'2026-12-26T10:00:00+01:00'},
  {n:'IV',t:'1000–1035: Sancho III el Mayor',f:'2027-01-02T10:00:00+01:00'},
  {n:'V',t:'1035–1076: de García el de Nájera a Peñalén',f:'2027-01-09T10:00:00+01:00'},
  {n:'VI',t:'1076–1134: la unión con Aragón',f:'2027-01-16T10:00:00+01:00'},
  {n:'VII',t:'1134–1234: la restauración del reino',f:'2027-01-23T10:00:00+01:00'},
  {n:'VIII',t:'1234–1328: las casas de Champaña y Francia',f:'2027-01-30T10:00:00+01:00'},
  {n:'IX',t:'1328–1425: la casa de Évreux',f:'2027-02-06T10:00:00+01:00'},
  {n:'X',t:'1425–1479: el Príncipe de Viana y la guerra civil',f:'2027-02-13T10:00:00+01:00'},
  {n:'XI',t:'1479–1512: Foix, Albret y la conquista',f:'2027-02-20T10:00:00+01:00'},
  {n:'XII',t:'1512–1530: la lucha por recuperar el reino',f:'2027-02-27T10:00:00+01:00'},
  {n:'XIII',t:'1512–1620: la Baja Navarra',f:'2027-03-06T10:00:00+01:00'},
  {n:'XIV',t:'1530–1808: el reino dentro de la Monarquía Hispánica',f:'2027-03-13T10:00:00+01:00'},
  {n:'XV',t:'1808–1841: de la guerra a la Ley Paccionada',f:'2027-03-20T10:00:00+01:00'}
 ]
};
