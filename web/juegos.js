/* =====================================================================
   🎮 NA JUEGA (17 nov. 2026) — grupo nuevo del menú, antes de «Mi Espacio»
   - 🔗 Las Cadenas (`jcadenas`): preguntas de Navarra. 8 categorías = 8 cadenas del escudo,
     3 aciertos encienden una cadena; con las 8, la pregunta de la esmeralda.
     Para añadir preguntas: una línea más en JC_CATS (pregunta, correcta, [3 falsas], explicación).
   - 🦦 La Nutria del Arga (`jnutria`): la culebra de los Nokia. La nutria come truchas;
     cada 4 truchas sale una piedra. Se juega deslizando el dedo o con las flechas.
   - ⭕ Tres en raya (`jraya`): contra la máquina, tres niveles (Fácil, Normal, Imbatible).
   Todo funciona sin internet. Récords y avance en localStorage (claves bnJg*), solo en el móvil.
   Nombres y diseños propios: no copiar marcas (Trivial Pursuit, Monopoly…).
   ===================================================================== */
(function(){
const $=id=>document.getElementById(id);
const ls={get:(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},
          set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
const baraja=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const sec=(id,html)=>(window.svSec?svSec(id,html):(()=>{const s=document.createElement('section');s.id='t-'+id;s.innerHTML=html;(document.querySelector('.wrap')||document.body).appendChild(s);return s;})());
let ACT=null;   // pantalla abierta (para parar la nutria al salir)

/* ---------- estilos (todo con prefijo jg para no tocar nada de la app) ---------- */
const st=document.createElement('style');st.textContent=`
.jgCad{--gules:#a5121c;--gules-hondo:#6d0a12;--tinta:#2b0709;--oro:#f0c04a;--oro-apagado:#5a1a12;--pip:#a3683a;--esm:#27b074;--perg:#fbf0d9;--perg2:#e7c9a6;
  background:radial-gradient(120% 70% at 50% 0%,#a5121c 0%,#6d0a12 70%);color:#fbf0d9;border-radius:16px;padding:14px 14px 18px;margin:10px 0;display:flex;flex-direction:column;gap:12px}
.jgCad .jgTop{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
.jgCad h3{font-family:'Palatino Linotype',Georgia,serif;font-weight:400;font-size:26px;letter-spacing:.04em;margin:0;color:var(--oro)}
.jgCad .jgMar{font-size:14px;color:var(--perg2);white-space:nowrap}.jgCad .jgMar b{color:var(--perg)}
.jgCad .jgEsc{display:flex;justify-content:center}.jgCad .jgEsc svg{width:min(70vw,280px);height:auto;transition:width .25s}
.jgCad.preg .jgEsc svg{width:min(42vw,170px)}
.jgCad .campo{fill:var(--gules);stroke:var(--oro);stroke-width:3}
.jgCad .orla{fill:none;stroke:var(--oro-apagado);stroke-width:5;stroke-dasharray:15 7;stroke-linecap:round;transition:stroke .6s}
.jgCad .esl{fill:none;stroke:var(--oro-apagado);stroke-width:5;transition:stroke .4s}
.jgCad .esl.on{stroke:var(--oro);filter:drop-shadow(0 0 3px rgba(240,192,74,.7))}
.jgCad .brazo{cursor:pointer}.jgCad .brazo .zona{stroke:transparent;stroke-width:34;stroke-linecap:round}
.jgCad .brazo.sel .esl:not(.on){stroke:#a8642a}
.jgCad .gema{fill:var(--oro-apagado);stroke:var(--oro-apagado);stroke-width:3;transition:fill .5s,stroke .5s}
.jgCad .gema.lista{fill:#14724a;stroke:var(--oro);cursor:pointer;animation:jgLat 1.6s ease-in-out infinite}
.jgCad .gema.ganada{fill:var(--esm);stroke:var(--oro);filter:drop-shadow(0 0 8px rgba(39,176,116,.9))}
.jgCad .ganado .orla{stroke:var(--oro)}
@keyframes jgLat{50%{fill:#27b074}}
.jgCad p{margin:0}.jgCad .guia{color:var(--perg2);font-size:16px}
.jgCad .cads{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.jgCad button{font:inherit;color:inherit;cursor:pointer}
.jgCad .cad{display:flex;align-items:center;justify-content:space-between;gap:8px;background:rgba(43,7,9,.45);border:1.5px solid rgba(240,192,74,.35);border-radius:8px;padding:10px 12px;text-align:left;min-height:50px}
.jgCad .cad .n{font-weight:700;font-size:16px}.jgCad .cad .pp{display:flex;gap:4px;flex:none}
.jgCad .cad .pp i{width:9px;height:13px;border-radius:50%;border:2px solid var(--pip)}.jgCad .cad .pp i.on{border-color:var(--oro);background:rgba(240,192,74,.35)}
.jgCad .cad.hecha{border-color:var(--oro);background:rgba(240,192,74,.12);cursor:default}.jgCad .cad.hecha .n{color:var(--oro)}
.jgCad .acc{background:var(--oro);color:var(--tinta);border:0;border-radius:8px;padding:13px 16px;font-size:17px;font-weight:700;letter-spacing:.03em}
.jgCad .acc.gm{background:var(--esm);color:#04130c}
.jgCad .enl{background:none;border:0;padding:6px 0;color:var(--perg2);text-decoration:underline;font-size:15px;align-self:center}
.jgCad .etq{color:var(--oro);letter-spacing:.08em;font-size:14px;text-transform:uppercase;font-weight:700}
.jgCad .pq{font-size:20px;font-weight:600}
.jgCad .ops{display:flex;flex-direction:column;gap:8px}
.jgCad .op{background:var(--perg);color:var(--tinta);border:2px solid transparent;border-radius:8px;padding:12px 14px;text-align:left;font-size:17px;font-weight:500}
.jgCad .op[disabled]{cursor:default;opacity:.55}.jgCad .op.bien{opacity:1;background:#d9f3e4;border-color:var(--esm)}.jgCad .op.mal{opacity:1;background:#ffe1dc;border-color:#c2331f}
.jgCad .ver{font-weight:700;font-size:18px}.jgCad .ver.ok{color:#8fe6bb}.jgCad .ver.no{color:#ffb3a8}
.jgCad h4{font-family:'Palatino Linotype',Georgia,serif;font-weight:400;color:var(--oro);font-size:24px;margin:0}
.jgCad .conf{display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;font-size:15px;color:var(--perg2)}
.jgCad .conf button{background:none;border:1.5px solid var(--perg2);border-radius:8px;padding:6px 12px;color:var(--perg);font-size:15px}
.jgCad [hidden]{display:none!important}
.jgBox{border-radius:16px;padding:12px;margin:10px 0;display:flex;flex-direction:column;gap:10px}
.jgNut{background:linear-gradient(180deg,#0f3b4a,#0a2a35);color:#e6f6f8}
.jgNut .jgHud{display:flex;justify-content:space-between;align-items:center;font-size:15px}.jgNut .jgHud b{font-size:20px;color:#ffd54f}
.jgNut canvas{width:100%;max-width:420px;align-self:center;border-radius:12px;touch-action:none;display:block;box-shadow:0 0 0 3px #6d8f3a,0 0 0 6px #4e6b26}
.jgPad{display:grid;grid-template-columns:repeat(3,64px);grid-template-rows:repeat(2,54px);gap:8px;justify-content:center}
.jgPad button{border:0;border-radius:12px;background:rgba(255,255,255,.14);color:#fff;font-size:24px;cursor:pointer;touch-action:manipulation}
.jgPad button:active{background:rgba(255,255,255,.3)}
.jgBig{border:0;border-radius:10px;background:#ffd54f;color:#2b2100;font-weight:800;font-size:17px;padding:12px;cursor:pointer}
.jgRaya{background:linear-gradient(180deg,#1f4d2b,#14341d);color:#eef7ee}
.jgRaya .jgTab{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:min(82vw,330px);align-self:center;aspect-ratio:1}
.jgRaya .jgTab button{border:0;border-radius:12px;background:rgba(255,255,255,.1);font-size:min(14vw,58px);font-weight:900;color:#fff;cursor:pointer;line-height:1;touch-action:manipulation}
.jgRaya .jgTab button.x{color:#ff8a80}.jgRaya .jgTab button.o{color:#b9f6ca}.jgRaya .jgTab button.win{background:rgba(255,213,79,.35)}
.jgRaya .jgMk{display:flex;justify-content:space-around;text-align:center;font-size:13px}.jgRaya .jgMk b{display:block;font-size:22px}
.jgRaya .jgMsg{text-align:center;font-weight:700;font-size:17px;min-height:24px}
.jgNiv{display:flex;gap:6px}.jgNiv button{flex:1;border:1.5px solid rgba(255,255,255,.3);background:none;color:inherit;border-radius:10px;padding:8px 4px;font:inherit;font-size:14px;cursor:pointer}
.jgNiv button.on{background:#ffd54f;color:#2b2100;border-color:#ffd54f;font-weight:700}
.jgNota{font-size:13px;opacity:.8;text-align:center}
@media (prefers-reduced-motion:reduce){.jgCad *{animation:none!important;transition:none!important}}`;
document.head.appendChild(st);

/* =====================================================================
   🔗 LAS CADENAS
   ===================================================================== */
const JC_CATS=[
 {id:'rios',n:'Ríos',q:[
  ['¿Qué río cruza Pamplona?','Arga',['Ega','Irati','Cidacos'],'El Arga rodea el casco viejo de Pamplona por el norte, bajo sus murallas.'],
  ['¿En qué río desemboca el Arga?','En el Aragón',['En el Ebro','En el Ega','En el Irati'],'El Arga se une al Aragón cerca de Funes, y el Aragón llega al Ebro poco después.'],
  ['Según el dicho, ¿qué tres ríos «hacen al Ebro varón»?','Ega, Arga y Aragón',['Irati, Salazar y Esca','Bidasoa, Urumea y Oria','Arga, Ultzama y Elorz'],'«Ega, Arga y Aragón hacen al Ebro varón»: son sus grandes afluentes navarros.'],
  ['¿Qué río navarro desemboca en el Cantábrico?','Bidasoa',['Arga','Ega','Aragón'],'Nace en Baztan y llega al mar entre Hondarribia y Hendaia. Los otros tres van al Ebro.'],
  ['¿Qué río excavó la Foz de Lumbier?','Irati',['Salazar','Esca','Erro'],'El Irati atraviesa la Foz de Lumbier. La de Arbayún, muy cerca, es del Salazar.'],
  ['¿Qué río pasa por Estella-Lizarra?','Ega',['Arga','Aragón','Alhama'],'El Ega cruza Estella y desemboca en el Ebro en San Adrián.'],
  ['¿Qué río nace en Urbasa con aguas de color turquesa?','Urederra',['Larraun','Araxes','Ultzama'],'Su nombre significa «agua hermosa». Nace en Baquedano y es afluente del Ega.'],
  ['¿Qué río embalsa el pantano de Eugi?','Arga',['Irati','Erro','Urrobi'],'El embalse de Eugi, en la cabecera del Arga, abastece a la comarca de Pamplona.']]},
 {id:'montes',n:'Montes',q:[
  ['¿Cuál es la cumbre más alta de Navarra?','Mesa de los Tres Reyes',['Ori','San Donato','Adi'],'Hiru Errege Mahaia, en Roncal, supera los 2.400 metros. Allí se juntaban Navarra, Aragón y Bearne.'],
  ['¿Cuál es el primer «dosmil» del Pirineo viniendo desde el Cantábrico?','Ori',['Larrun','Txindoki','Saioa'],'El Ori (2.017 m) domina la Selva de Irati.'],
  ['¿En qué monte de Pamplona está el fuerte de Alfonso XII?','San Cristóbal (Ezkaba)',['El Perdón','Aralar','Higa de Monreal'],'El fuerte de San Cristóbal, en Ezkaba, es conocido por la gran fuga de presos de 1938.'],
  ['¿En qué sierra está el santuario de San Miguel in Excelsis?','Aralar',['Urbasa','Leire','Codés'],'San Miguel de Aralar es uno de los santuarios más queridos de Navarra.'],
  ['¿Dónde está el cabezo de Castildetierra?','En las Bardenas Reales',['En Urbasa','En la sierra de Leire','En Montejurra'],'Es la imagen más conocida de las Bardenas, Reserva de la Biosfera.'],
  ['¿Qué tipo de bosque ha hecho famosa a la Selva de Irati?','Hayedo-abetal',['Pinar','Encinar','Alcornocal'],'Irati es uno de los mayores hayedo-abetales de Europa.'],
  ['¿Qué collado se cruza junto a Roncesvalles en el Camino de Santiago?','Ibañeta',['Belagua','Velate','Lizarraga'],'El alto de Ibañeta es la entrada tradicional del Camino Francés en Navarra.'],
  ['¿En qué sierra está el mirador del Balcón de Pilatos?','Urbasa',['Aralar','Andía','Alaitz'],'Se asoma al circo donde nace el Urederra.']]},
 {id:'pueblos',n:'Pueblos',q:[
  ['¿Cuál es la capital de la Ribera?','Tudela',['Tafalla','Estella-Lizarra','Sangüesa'],'Tudela es además la segunda ciudad de Navarra.'],
  ['¿Qué ciudad presume de Palacio Real, obra de Carlos III el Noble?','Olite',['Tafalla','Viana','Sangüesa'],'El Palacio Real de Olite fue corte de los reyes de Navarra.'],
  ['¿Qué pueblo es conocido por sus cuevas y sus brujas?','Zugarramurdi',['Urdazubi/Urdax','Lesaka','Etxalar'],'Sus vecinos fueron juzgados por brujería en el auto de fe de Logroño de 1610.'],
  ['¿En qué localidad nació San Francisco Javier?','Javier',['Sangüesa','Olite','Leire'],'Nació en el castillo de Javier en 1506. Es patrón de Navarra.'],
  ['¿Qué villa conserva la muralla medieval llamada «El Cerco»?','Artajona',['Ujué','Viana','Larraga'],'El Cerco de Artajona se levantó entre los siglos XI y XIII.'],
  ['¿Cuál es la capital del valle de Baztan?','Elizondo',['Bera','Lesaka','Doneztebe/Santesteban'],'Elizondo está a orillas del río Baztan, que aguas abajo se llama Bidasoa.'],
  ['¿En qué valle está Ochagavía?','Salazar',['Roncal','Aezkoa','Erro'],'Ochagavía/Otsagabia es la localidad más poblada del valle de Salazar.'],
  ['¿En qué ciudad navarra está enterrado César Borgia?','Viana',['Estella-Lizarra','Tudela','Pamplona'],'Murió en 1507 en una emboscada cerca de Viana.']]},
 {id:'fauna',n:'Fauna',q:[
  ['¿Qué ave deja caer los huesos desde lo alto para romperlos?','Quebrantahuesos',['Buitre leonado','Alimoche','Águila real'],'Se alimenta casi solo de huesos. Vive en el Pirineo navarro.'],
  ['¿Qué gran carroñera cría en las paredes de las foces de Lumbier y Arbayún?','Buitre leonado',['Cigüeña blanca','Milano real','Urogallo'],'Las dos foces albergan grandes colonias de buitre leonado.'],
  ['¿Qué pequeño mamífero de río, en peligro crítico, tiene en Navarra uno de sus refugios?','Visón europeo',['Castor','Desmán','Turón'],'Navarra conserva una de las poblaciones más importantes de visón europeo.'],
  ['¿Qué pez remonta el Bidasoa desde el mar para desovar?','Salmón atlántico',['Trucha arcoíris','Barbo','Carpa'],'El Bidasoa es el río salmonero de Navarra.'],
  ['¿Qué pájaro carpintero vive en España solo en hayedos como los de Irati y Quinto Real?','Pico dorsiblanco',['Pito real','Pico picapinos','Torcecuello'],'Necesita hayedos viejos con mucha madera muerta.'],
  ['La betizu es una raza autóctona semisalvaje de…','Vaca',['Oveja','Cabra','Caballo'],'Su nombre viene de «behi izua», vaca huidiza.'],
  ['La latxa es una raza autóctona de…','Oveja',['Vaca','Cerdo','Gallina'],'Con su leche se elaboran quesos como el Roncal y el Idiazabal.'],
  ['«Burguete» es el nombre de una raza de…','Caballo',['Perro','Oveja','Vaca'],'El caballo Burguete es originario del Pirineo navarro.']]},
 {id:'flora',n:'Flora y huerta',q:[
  ['¿Qué árbol domina en la Selva de Irati?','Haya',['Encina','Pino carrasco','Olmo'],'El haya, junto al abeto, forma el bosque de Irati.'],
  ['El bosque de Orgi, en Ultzama, es un…','Robledal',['Hayedo','Pinar','Encinar'],'Es un robledal húmedo de roble pedunculado, raro en Navarra.'],
  ['¿Qué flor seca se cuelga en la puerta de los caseríos como protección?','Eguzkilore',['Edelweiss','Amapola','Lirio'],'El eguzkilore, «flor del sol», es un cardo silvestre.'],
  ['¿De qué localidad es el pimiento del piquillo con denominación de origen?','Lodosa',['Tudela','Mendavia','Azagra'],'El Piquillo de Lodosa se asa a la llama y se pela a mano.'],
  ['¿Qué verdura lleva el nombre de Tudela en su sello de calidad?','Alcachofa',['Borraja','Cardo','Acelga'],'La Alcachofa de Tudela es de la variedad Blanca de Tudela.'],
  ['¿Con qué fruto silvestre se hace el pacharán?','Endrinas',['Moras','Arándanos','Escaramujos'],'Las endrinas, o arañones, se maceran en anís.'],
  ['¿Qué queso navarro fue el primero de España con denominación de origen?','Roncal',['Idiazabal','Urbasa','Ultzama'],'El queso Roncal, de leche de oveja, la obtuvo en 1981.'],
  ['¿Qué hortaliza blanca de la Ribera se cosecha bajo tierra, sin ver el sol?','Espárrago',['Coliflor','Nabo','Puerro'],'Al crecer cubierto de tierra, el espárrago de Navarra no verdea.']]},
 {id:'historia',n:'Historia',q:[
  ['¿En qué año fue la batalla de Roncesvalles?','778',['711','1212','1512'],'La retaguardia de Carlomagno, con Roldán, fue derrotada en el paso del Pirineo.'],
  ['¿En qué año conquistó Castilla el reino de Navarra?','1512',['1492','1423','1610'],'Las tropas de Fernando el Católico, al mando del duque de Alba, entraron en Pamplona.'],
  ['¿Quién se considera el primer rey de Pamplona?','Íñigo Arista',['Sancho Garcés I','García Ramírez','Teobaldo I'],'Gobernó a comienzos del siglo IX.'],
  ['¿Con qué rey alcanzó el reino su mayor extensión?','Sancho III el Mayor',['Sancho VII el Fuerte','Carlos II','Carlos III el Noble'],'A comienzos del siglo XI dominó buena parte del norte peninsular.'],
  ['¿Qué general romano dio nombre a Pamplona?','Pompeyo',['Julio César','Augusto','Escipión'],'Fundó Pompaelo hacia el 75 a. C.'],
  ['¿Qué rey firmó en 1423 el Privilegio de la Unión de Pamplona?','Carlos III el Noble',['Carlos II','Sancho VII el Fuerte','Juan de Albret'],'Unió los tres burgos enfrentados: Navarrería, San Cernin y San Nicolás.'],
  ['¿Qué título llevaba el heredero del reino de Navarra?','Príncipe de Viana',['Príncipe de Olite','Duque de Pamplona','Conde de Lerín'],'Lo creó Carlos III en 1423 para su nieto Carlos.'],
  ['¿En qué año se aprobó el Amejoramiento del Fuero?','1982',['1978','1841','1936'],'Es la norma que rige el autogobierno de la Comunidad Foral.']]},
 {id:'fiestas',n:'Fiestas',q:[
  ['¿Qué día estalla el chupinazo de San Fermín?','El 6 de julio',['El 7 de julio','El 14 de julio','El 25 de julio'],'A las 12 del mediodía, desde el balcón del Ayuntamiento.'],
  ['¿A qué hora empieza el encierro en Sanfermines?','A las 8:00',['A las 7:00','A las 9:00','A las 12:00'],'Cada mañana del 7 al 14 de julio.'],
  ['¿Qué gigante de paja es el protagonista del carnaval de Lantz?','Miel Otxin',['Olentzero','Basajaun','Tartalo'],'Representa a un bandido al que se apresa y se quema.'],
  ['¿Cómo se llaman los personajes con cencerros de Ituren y Zubieta?','Joaldunak',['Txatxos','Momotxorros','Mamuxarros'],'Marchan al compás haciendo sonar los cencerros a su espalda.'],
  ['¿Qué día se celebra el Día de Navarra?','El 3 de diciembre',['El 7 de julio','El 29 de septiembre','El 12 de octubre'],'Es la fiesta de San Francisco Javier.'],
  ['¿Qué entregan cada 13 de julio los vecinos de Baretous a los del Roncal?','Tres vacas',['Tres ovejas','Tres quesos','Tres caballos'],'El Tributo de las Tres Vacas se celebra en la Piedra de San Martín desde la Edad Media.'],
  ['¿Con qué canción terminan los Sanfermines?','Pobre de mí',['Riau-riau','Uno de enero','La Chica Yeyé'],'Se canta a medianoche del 14 de julio.'],
  ['¿Qué carbonero baja del monte en Nochebuena con regalos?','Olentzero',['Miel Otxin','Zanpantzar','Basajaun'],'La tradición está muy arraigada en Lesaka.']]},
 {id:'euskera',n:'Euskera',q:[
  ['¿Qué significa «basati», la palabra de la que viene BasatiNA?','Salvaje',['Bosque','Río','Pastor'],'«Basati» es salvaje o silvestre; viene de «baso», bosque.'],
  ['¿Qué significa «ibai»?','Río',['Monte','Puente','Valle'],'Por eso tantos ríos se llaman «Ibaia» en los mapas.'],
  ['¿Qué significa «mendi»?','Monte',['Mar','Camino','Piedra'],'«Mendizale» es quien anda por el monte.'],
  ['¿Qué significa «zubi»?','Puente',['Fuente','Molino','Torre'],'Zubiri es «el pueblo del puente».'],
  ['¿Qué significa «elur»?','Nieve',['Lluvia','Viento','Niebla'],'«Elurra ari du»: está nevando.'],
  ['¿Qué significa «euri»?','Lluvia',['Sol','Nieve','Hielo'],'«Euria ari du»: está lloviendo.'],
  ['¿Cómo se dice «gracias»?','Eskerrik asko',['Egun on','Agur','Mesedez'],'«Egun on» es buenos días; «mesedez», por favor.'],
  ['¿Cuál es el nombre de Pamplona en euskera?','Iruña',['Lizarra','Tutera','Zangoza'],'Lizarra es Estella; Tutera, Tudela; Zangoza, Sangüesa.']]}
];
const JC_GEMA=[
 ['Según la leyenda, ¿en qué batalla ganó Sancho VII el Fuerte las cadenas del escudo?','Las Navas de Tolosa',['Roncesvalles','Noáin','Clavijo'],'En 1212. La tradición cuenta que rompió las cadenas que rodeaban la tienda del califa.'],
 ['¿Dónde está enterrado Sancho VII el Fuerte?','En Roncesvalles',['En Leire','En la catedral de Pamplona','En Tudela'],'Su sepulcro está en la Colegiata de Roncesvalles.'],
 ['¿Cuántas merindades históricas tiene Navarra?','Cinco',['Tres','Cuatro','Siete'],'Pamplona, Estella, Tudela, Sangüesa y Olite.'],
 ['¿Qué nombre heráldico recibe el color rojo del campo del escudo?','Gules',['Sinople','Azur','Sable'],'Sinople es verde; azur, azul; sable, negro.'],
 ['Los historiadores creen que las cadenas vienen de un refuerzo metálico del escudo. ¿Cómo se llama?','Carbunclo',['Bordura','Lambel','Jirón'],'El carbunclo era una bloca con radios; con el tiempo se dibujó como cadenas.']
];
sec('jcadenas',`<div class="jgCad" id="jcBox">
 <div class="jgTop"><h3>Las Cadenas</h3><div class="jgMar"><b id="jcEsl">0</b>/24 eslabones · <b id="jcFal">0</b> fallos</div></div>
 <div class="jgEsc"><svg id="jcSvg" viewBox="0 0 300 330" role="img" aria-label="Escudo de Navarra con las ocho cadenas">
  <path class="campo" d="M20 18 H280 V180 A130 130 0 0 1 20 180 Z"/><path class="orla" d="M36 34 H264 V180 A114 114 0 0 1 36 180 Z"/>
  <g id="jcBrazos"></g><polygon id="jcGema" class="gema" points="150,143 165,151.5 165,168.5 150,177 135,168.5 135,151.5"/></svg></div>
 <div id="jcMenu" style="display:flex;flex-direction:column;gap:12px">
  <p class="guia" id="jcGuia"></p><div class="cads" id="jcCads"></div>
  <button class="acc gm" id="jcBGema" hidden>La pregunta de la esmeralda</button>
  <button class="acc" id="jcAzar">Pregunta al azar</button>
  <button class="enl" id="jcReset">Empezar de cero</button>
  <div class="conf" id="jcConf" hidden>¿Borrar todo el avance? <button id="jcSi">Sí, borrar</button> <button id="jcNo">No</button></div></div>
 <div id="jcPreg" hidden style="display:flex;flex-direction:column;gap:12px">
  <p class="etq" id="jcQCat"></p><p class="pq" id="jcQTxt"></p><div class="ops" id="jcOps"></div>
  <p class="ver" id="jcVer" hidden></p><p id="jcExp" hidden></p><button class="acc" id="jcSeguir" hidden>Seguir</button></div>
 <div id="jcFinal" hidden style="display:flex;flex-direction:column;gap:12px">
  <h4>La esmeralda es tuya</h4><p id="jcFTxt"></p><button class="acc" id="jcOtra">Jugar otra partida</button></div>
</div><div class="note" style="margin:0 6px 12px">Juego propio de BasatiNA. Tu avance se guarda solo en este móvil.</div>`);
(function(){
 const K='bnJgCadenas',vacio=()=>({prog:{},vistas:{},fallos:0,aciertos:0,gema:false});
 let S=Object.assign(vacio(),ls.get(K,{})),act=null;
 const guarda=()=>ls.set(K,S),pr=id=>S.prog[id]||0,total=()=>JC_CATS.reduce((a,c)=>a+pr(c.id),0),llenas=()=>JC_CATS.every(c=>pr(c.id)>=3);
 const NS='http://www.w3.org/2000/svg',g=$('jcBrazos');
 JC_CATS.forEach((c,i)=>{const b=document.createElementNS(NS,'g');b.setAttribute('class','brazo');b.setAttribute('transform','rotate('+(i*45)+' 150 160)');b.dataset.cat=c.id;
   const z=document.createElementNS(NS,'line');z.setAttribute('class','zona');[['x1',150],['y1',130],['x2',150],['y2',54]].forEach(([a,v])=>z.setAttribute(a,v));b.appendChild(z);
   [116,91,66].forEach((y,k)=>{const e=document.createElementNS(NS,'ellipse');e.setAttribute('class','esl');e.setAttribute('cx',150);e.setAttribute('cy',y);e.setAttribute('rx',k%2?6:9);e.setAttribute('ry',14);b.appendChild(e);});
   b.addEventListener('click',()=>elegir(c.id));g.appendChild(b);});
 function vista(v){['jcMenu','jcPreg','jcFinal'].forEach(id=>$(id).hidden=id!==v);$('jcBox').classList.toggle('preg',v==='jcPreg');}
 function pinta(){
   document.querySelectorAll('#jcBrazos .brazo').forEach(b=>{const n=pr(b.dataset.cat);b.querySelectorAll('.esl').forEach((e,k)=>e.classList.toggle('on',k<n));b.classList.toggle('sel',!!act&&act.cat===b.dataset.cat);});
   const gm=$('jcGema');gm.classList.toggle('lista',llenas()&&!S.gema);gm.classList.toggle('ganada',S.gema);$('jcSvg').classList.toggle('ganado',S.gema);
   $('jcEsl').textContent=total();$('jcFal').textContent=S.fallos;
   const cd=$('jcCads');cd.innerHTML='';
   JC_CATS.forEach(c=>{const n=pr(c.id),b=document.createElement('button');b.className='cad'+(n>=3?' hecha':'');b.disabled=n>=3;
     b.innerHTML='<span class="n"></span><span class="pp">'+[0,1,2].map(k=>'<i class="'+(k<n?'on':'')+'"></i>').join('')+'</span>';
     b.querySelector('.n').textContent=c.n;b.onclick=()=>elegir(c.id);cd.appendChild(b);});
   const lista=llenas()&&!S.gema;$('jcBGema').hidden=!lista;$('jcAzar').hidden=llenas();
   $('jcGuia').textContent=lista?'Las ocho cadenas están encendidas. Solo falta la esmeralda del centro.':'Elige una cadena. Cada acierto enciende un eslabón; con tres, la cadena es tuya. Completa las ocho y juégate la esmeralda.';}
 function sig(lista,clave){let v=S.vistas[clave]||[],lib=lista.map((_,i)=>i).filter(i=>!v.includes(i));if(!lib.length){v=[];lib=lista.map((_,i)=>i);}
   const i=lib[Math.floor(Math.random()*lib.length)];S.vistas[clave]=v.concat(i);return lista[i];}
 function elegir(cat){if(S.gema||pr(cat)>=3)return;const c=JC_CATS.find(x=>x.id===cat);pregunta({cat,nombre:c.n,q:sig(c.q,cat)});}
 function pregunta(a){act=a;const q=a.q;$('jcQCat').textContent=a.nombre;$('jcQTxt').textContent=q[0];
   $('jcVer').hidden=$('jcExp').hidden=$('jcSeguir').hidden=true;const ops=$('jcOps');ops.innerHTML='';
   baraja([q[1]].concat(q[2])).forEach(t=>{const b=document.createElement('button');b.className='op';b.textContent=t;b.onclick=()=>responder(b,t);ops.appendChild(b);});
   vista('jcPreg');pinta();guarda();$('jcBox').scrollIntoView({block:'start',behavior:'smooth'});}
 function responder(btn,t){const q=act.q,ok=t===q[1];
   document.querySelectorAll('#jcOps .op').forEach(b=>{b.disabled=true;if(b.textContent===q[1])b.classList.add('bien');});if(!ok)btn.classList.add('mal');
   const v=$('jcVer');v.hidden=false;v.className='ver '+(ok?'ok':'no');
   if(act.cat==='gema'){if(ok){S.gema=true;S.aciertos++;v.textContent='¡La esmeralda es tuya!';}else{S.fallos++;v.textContent='La esmeralda se resiste. Era: '+q[1]+'.';}}
   else if(ok){S.prog[act.cat]=pr(act.cat)+1;S.aciertos++;v.textContent=pr(act.cat)>=3?'¡Cadena completa!':'Eslabón encendido.';}
   else{S.fallos++;v.textContent='No. Era: '+q[1]+'.';}
   $('jcExp').textContent=q[3];$('jcExp').hidden=false;const s=$('jcSeguir');s.hidden=false;
   s.textContent=S.gema?'Ver el escudo':(act.cat!=='gema'&&pr(act.cat)<3?'Otra de '+act.nombre:'Volver al escudo');pinta();guarda();}
 function final(){$('jcFTxt').textContent='Has encendido los 24 eslabones y ganado la esmeralda con '+S.fallos+(S.fallos===1?' fallo.':' fallos.')+
   (S.fallos===0?' Partida perfecta.':S.fallos<=6?' Conoces bien Navarra.':' La próxima, con menos tropiezos.');vista('jcFinal');pinta();}
 $('jcSeguir').onclick=()=>{const a=act;act=null;if(S.gema)return final();if(a&&a.cat!=='gema'&&pr(a.cat)<3)return elegir(a.cat);vista('jcMenu');pinta();};
 $('jcAzar').onclick=()=>{const l=JC_CATS.filter(c=>pr(c.id)<3);if(l.length)elegir(l[Math.floor(Math.random()*l.length)].id);};
 const gema=()=>{if(llenas()&&!S.gema)pregunta({cat:'gema',nombre:'La esmeralda',q:sig(JC_GEMA,'gema')});};
 $('jcBGema').onclick=gema;$('jcGema').addEventListener('click',gema);
 $('jcReset').onclick=()=>$('jcConf').hidden=false;$('jcNo').onclick=()=>$('jcConf').hidden=true;
 const reinicia=()=>{S=vacio();act=null;guarda();$('jcConf').hidden=true;vista('jcMenu');pinta();};$('jcSi').onclick=reinicia;$('jcOtra').onclick=reinicia;
 window.jcInit=()=>{if(S.gema)final();else if(!act){vista('jcMenu');pinta();}};
})();

/* =====================================================================
   🦦 LA NUTRIA DEL ARGA (la culebra de toda la vida)
   ===================================================================== */
sec('jnutria',`<div class="jgBox jgNut" data-noswipe>
 <div class="jgHud"><span>🐟 Truchas: <b id="jnPts">0</b></span><span>🏆 Récord: <b id="jnRec">0</b></span></div>
 <canvas id="jnC" width="400" height="500"></canvas>
 <button class="jgBig" id="jnGo">▶️ Empezar</button>
 <div class="jgPad"><span></span><button data-d="u" aria-label="Arriba">▲</button><span></span><button data-d="l" aria-label="Izquierda">◀</button><button data-d="d" aria-label="Abajo">▼</button><button data-d="r" aria-label="Derecha">▶</button></div>
 <div class="jgNota">Desliza el dedo sobre el río o usa las flechas. Come truchas 🐟 y no choques con la orilla, las piedras ni tu propia cola. Cada trucha te hace más larga y más rápida.</div>
</div>`);
(function(){
 const C=$('jnC'),x=C.getContext('2d'),W=16,H=20,T=25;   // 16×20 casillas de 25 px
 let nut,dir,cola,pez,piedras,pts,vel,tm=null,vivo=false,pausa=false,t0=0,rec=ls.get('bnJgNutria',0);
 $('jnRec').textContent=rec;
 const libre=()=>{for(let k=0;k<500;k++){const p={x:Math.floor(Math.random()*W),y:Math.floor(Math.random()*H)};
   if(!nut.some(s=>s.x===p.x&&s.y===p.y)&&!piedras.some(s=>s.x===p.x&&s.y===p.y)&&!(pez&&pez.x===p.x&&pez.y===p.y)&&Math.abs(p.x-nut[0].x)+Math.abs(p.y-nut[0].y)>3)return p;}return null;};
 function nueva(){nut=[{x:7,y:12},{x:7,y:13},{x:7,y:14}];dir={x:0,y:-1};cola=[];piedras=[];pez=null;pez=libre();pts=0;vel=170;$('jnPts').textContent=0;}
 function paso(){
   if(cola.length){const d=cola.shift();if(d.x!==-dir.x||d.y!==-dir.y)dir=d;}
   const c={x:nut[0].x+dir.x,y:nut[0].y+dir.y};
   if(c.x<0||c.y<0||c.x>=W||c.y>=H||piedras.some(p=>p.x===c.x&&p.y===c.y)||nut.slice(0,-1).some(s=>s.x===c.x&&s.y===c.y))return fin();
   nut.unshift(c);
   if(pez&&c.x===pez.x&&c.y===pez.y){pts++;$('jnPts').textContent=pts;vel=Math.max(75,vel-5);if(navigator.vibrate)try{navigator.vibrate(25);}catch(e){}
     if(pts%4===0){const p=libre();if(p)piedras.push(p);}pez=libre();}
   else nut.pop();
   dibuja();tm=setTimeout(paso,vel);}
 function fin(){vivo=false;clearTimeout(tm);if(navigator.vibrate)try{navigator.vibrate([60,40,120]);}catch(e){}
   const nuevoRec=pts>rec;if(nuevoRec){rec=pts;ls.set('bnJgNutria',rec);$('jnRec').textContent=rec;}
   dibuja();x.fillStyle='rgba(5,25,32,.72)';x.fillRect(0,0,C.width,C.height);x.textAlign='center';x.fillStyle='#fff';
   x.font='bold 30px system-ui,sans-serif';x.fillText(nuevoRec?'🏆 ¡Récord nuevo!':'¡Plof!',200,220);
   x.font='20px system-ui,sans-serif';x.fillText(pts+(pts===1?' trucha':' truchas'),200,256);x.fillText('Toca «Otra vez» para seguir',200,290);
   $('jnGo').textContent='🔄 Otra vez';$('jnGo').style.display='';}
 function rio(){const g=x.createLinearGradient(0,0,C.width,0);g.addColorStop(0,'#1d6b7d');g.addColorStop(.5,'#2a8ea3');g.addColorStop(1,'#1d6b7d');x.fillStyle=g;x.fillRect(0,0,C.width,C.height);
   x.strokeStyle='rgba(255,255,255,.12)';x.lineWidth=2;const o=(Date.now()-t0)/90;
   for(let k=0;k<12;k++){const y=((k*47+o)%(C.height+40))-20;x.beginPath();for(let i=0;i<=C.width;i+=20)x.lineTo(i,y+Math.sin((i+k*30)/30)*4);x.stroke();}}
 function trucha(cx,cy){x.save();x.translate(cx,cy);x.fillStyle='#c9b37a';x.beginPath();x.ellipse(-1,0,9,5,0,0,7);x.fill();
   x.beginPath();x.moveTo(7,0);x.lineTo(12,-5);x.lineTo(12,5);x.closePath();x.fill();x.fillStyle='#e57373';x.fillRect(-7,-1,12,2);
   x.fillStyle='#3e2f1c';[[-4,-3],[0,-3],[3,2],[-2,2]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,1,0,7);x.fill();});
   x.fillStyle='#111';x.beginPath();x.arc(-7,-1,1.3,0,7);x.fill();x.restore();}
 function piedra(cx,cy){x.fillStyle='#7d7f7a';x.beginPath();x.ellipse(cx,cy+1,11,9,.3,0,7);x.fill();x.fillStyle='#a3a59f';x.beginPath();x.ellipse(cx-3,cy-2,5,3.5,.3,0,7);x.fill();}
 function dibuja(){rio();
   piedras.forEach(p=>piedra(p.x*T+T/2,p.y*T+T/2));if(pez)trucha(pez.x*T+T/2,pez.y*T+T/2);
   // cuerpo: una línea gruesa que une las casillas (así parece un animal y no bolitas sueltas)
   const cen=s=>[s.x*T+T/2,s.y*T+T/2],u=nut[nut.length-1],pu=nut[nut.length-2]||u;
   x.lineCap='round';x.lineJoin='round';
   x.strokeStyle='#5d4029';x.lineWidth=6;x.beginPath();x.moveTo(...cen(u));x.lineTo(u.x*T+T/2-(pu.x-u.x)*14,u.y*T+T/2-(pu.y-u.y)*14);x.stroke();   // cola
   [[20,'#5d4029'],[15,'#86603d'],[5,'#a07a52']].forEach(([w,c])=>{x.strokeStyle=c;x.lineWidth=w;x.beginPath();nut.forEach((s,i)=>i?x.lineTo(...cen(s)):x.moveTo(...cen(s)));x.stroke();});
   x.fillStyle='#6d4c2f';x.beginPath();x.arc(...cen(nut[0]),11.5,0,7);x.fill();
   const h=nut[0],hx=h.x*T+T/2,hy=h.y*T+T/2,px=-dir.y,py=dir.x;
   x.fillStyle='#d7c4a8';x.beginPath();x.arc(hx+dir.x*5,hy+dir.y*5,5.5,0,7);x.fill();             // hocico
   x.fillStyle='#111';[1,-1].forEach(s=>{x.beginPath();x.arc(hx+px*5*s+dir.x*2,hy+py*5*s+dir.y*2,2,0,7);x.fill();});
   x.beginPath();x.arc(hx+dir.x*9,hy+dir.y*9,1.8,0,7);x.fill();                                      // nariz
   x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=1;[1,-1].forEach(s=>{x.beginPath();x.moveTo(hx+dir.x*7+px*3*s,hy+dir.y*7+py*3*s);x.lineTo(hx+dir.x*9+px*11*s,hy+dir.y*9+py*11*s);x.stroke();});}
 function gira(d){const D={u:{x:0,y:-1},d:{x:0,y:1},l:{x:-1,y:0},r:{x:1,y:0}}[d];if(!D||!vivo)return;const u=cola.length?cola[cola.length-1]:dir;
   if((D.x===u.x&&D.y===u.y)||(D.x===-u.x&&D.y===-u.y))return;if(cola.length<3)cola.push(D);}
 function empieza(){nueva();vivo=true;pausa=false;t0=Date.now();$('jnGo').style.display='none';dibuja();clearTimeout(tm);tm=setTimeout(paso,400);}
 function para(){if(vivo){clearTimeout(tm);pausa=true;dibuja();x.fillStyle='rgba(5,25,32,.6)';x.fillRect(0,0,C.width,C.height);x.fillStyle='#fff';x.textAlign='center';
   x.font='bold 26px system-ui,sans-serif';x.fillText('⏸️ En pausa',200,250);$('jnGo').textContent='▶️ Seguir';$('jnGo').style.display='';}}
 $('jnGo').onclick=()=>{if(vivo&&pausa){pausa=false;$('jnGo').style.display='none';tm=setTimeout(paso,300);}else empieza();};
 document.querySelectorAll('#t-jnutria .jgPad button').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();gira(b.dataset.d);}));
 let sx=null,sy=0;C.addEventListener('touchstart',e=>{const t=e.touches[0];sx=t.clientX;sy=t.clientY;},{passive:true});
 C.addEventListener('touchmove',e=>{if(sx===null)return;const t=e.touches[0],dx=t.clientX-sx,dy=t.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<22)return;
   gira(Math.abs(dx)>Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u'));sx=t.clientX;sy=t.clientY;},{passive:true});
 C.addEventListener('touchend',()=>sx=null,{passive:true});
 document.addEventListener('keydown',e=>{if(ACT!=='jnutria')return;const d={ArrowUp:'u',ArrowDown:'d',ArrowLeft:'l',ArrowRight:'r'}[e.key];if(d){e.preventDefault();gira(d);}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)para();});
 window.jnPara=para;
 window.jnInit=()=>{if(!nut){nueva();dibuja();x.fillStyle='rgba(5,25,32,.55)';x.fillRect(0,0,C.width,C.height);x.fillStyle='#fff';x.textAlign='center';
   x.font='bold 28px system-ui,sans-serif';x.fillText('🦦 La Nutria del Arga',200,230);x.font='18px system-ui,sans-serif';x.fillText('¿Cuántas truchas te comes?',200,264);}};
})();

/* =====================================================================
   ⭕ TRES EN RAYA contra la máquina
   ===================================================================== */
sec('jraya',`<div class="jgBox jgRaya" data-noswipe>
 <div class="jgNiv" id="jrNiv"><button data-n="0">😊 Fácil</button><button data-n="1">🤔 Normal</button><button data-n="2">🤖 Imbatible</button></div>
 <div class="jgMk"><div>Tú (✕)<b id="jrT">0</b></div><div>Empates<b id="jrE">0</b></div><div>BasatiNA (◯)<b id="jrM">0</b></div></div>
 <div class="jgMsg" id="jrMsg"></div>
 <div class="jgTab" id="jrTab"></div>
 <button class="jgBig" id="jrOtra">🔄 Otra partida</button>
 <div class="jgNota">Empieza una vez cada uno. En «Imbatible» la máquina no pierde nunca: a ver si le sacas el empate.</div>
</div>`);
(function(){
 const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
 let tab,turno,fin,empiezaYo=true,M=ls.get('bnJgRaya',{t:0,e:0,m:0,n:1});
 const gana=b=>{for(const l of L)if(b[l[0]]&&b[l[0]]===b[l[1]]&&b[l[0]]===b[l[2]])return l;return null;};
 const lleno=b=>b.every(Boolean);
 function mm(b,yo){const w=gana(b);if(w)return b[w[0]]==='o'?10:-10;if(lleno(b))return 0;   // minimax: o = máquina
   let best=yo?-99:99;for(let i=0;i<9;i++)if(!b[i]){b[i]=yo?'o':'x';const v=mm(b,!yo);b[i]=null;best=yo?Math.max(best,v):Math.min(best,v);}return best;}
 function jugadaMaquina(){const lib=tab.map((v,i)=>v?null:i).filter(i=>i!==null);
   const azar=()=>lib[Math.floor(Math.random()*lib.length)];
   if(M.n===0&&Math.random()<.75)return azar();
   if(M.n===1&&Math.random()<.3)return azar();
   let best=-99,op=[];lib.forEach(i=>{tab[i]='o';const v=mm(tab,false);tab[i]=null;if(v>best){best=v;op=[i];}else if(v===best)op.push(i);});
   return op[Math.floor(Math.random()*op.length)];}
 function pinta(win){$('jrTab').innerHTML=tab.map((v,i)=>`<button data-i="${i}" class="${v||''}${win&&win.includes(i)?' win':''}" aria-label="Casilla ${i+1}">${v==='x'?'✕':v==='o'?'◯':''}</button>`).join('');
   $('jrTab').querySelectorAll('button').forEach(b=>b.onclick=()=>toca(+b.dataset.i));
   $('jrT').textContent=M.t;$('jrE').textContent=M.e;$('jrM').textContent=M.m;
   document.querySelectorAll('#jrNiv button').forEach(b=>b.classList.toggle('on',+b.dataset.n===M.n));}
 function cierra(){const w=gana(tab);if(w){fin=true;if(tab[w[0]]==='x'){M.t++;$('jrMsg').textContent='🎉 ¡Has ganado!';}else{M.m++;$('jrMsg').textContent='🤖 Gana BasatiNA';}ls.set('bnJgRaya',M);pinta(w);return true;}
   if(lleno(tab)){fin=true;M.e++;ls.set('bnJgRaya',M);$('jrMsg').textContent='🤝 Empate';pinta();return true;}return false;}
 function toca(i){if(fin||turno!=='x'||tab[i])return;tab[i]='x';pinta();if(cierra())return;turno='o';$('jrMsg').textContent='BasatiNA está pensando…';
   setTimeout(()=>{tab[jugadaMaquina()]='o';turno='x';pinta();if(!cierra())$('jrMsg').textContent='Te toca';},450);}
 function nueva(){tab=Array(9).fill(null);fin=false;turno=empiezaYo?'x':'o';pinta();$('jrMsg').textContent=empiezaYo?'Empiezas tú':'Empieza BasatiNA';
   if(!empiezaYo)setTimeout(()=>{tab[jugadaMaquina()]='o';turno='x';pinta();$('jrMsg').textContent='Te toca';},500);empiezaYo=!empiezaYo;}
 document.querySelectorAll('#jrNiv button').forEach(b=>b.onclick=()=>{M.n=+b.dataset.n;ls.set('bnJgRaya',M);nueva();});
 $('jrOtra').onclick=nueva;
 window.jrInit=()=>{if(!tab)nueva();};
})();

/* =====================================================================
   🧩 Menú: grupo «NA Juega» antes de «Mi Espacio», títulos, escenas e iconos
   ===================================================================== */
(function(){const dr=$('drawer');if(!dr||$('dgJuega'))return;
  const ref=[...dr.querySelectorAll('.dgroup')].find(x=>/mi espacio/i.test(x.querySelector('span')?.dataset.k||x.textContent));
  const html='<div class="dgroup" id="dgJuega"><span data-k="NA Juega">NA Juega</span><i>▸</i></div><div class="dsub" id="dsJuega"></div>';
  if(ref)ref.insertAdjacentHTML('beforebegin',html);else (($('bnaDGrid')||dr)).insertAdjacentHTML('beforeend',html);
  const gr=$('dgJuega'),sub=$('dsJuega');
  gr.onclick=()=>{const o=!gr.classList.contains('open');dr.querySelectorAll('.dgroup').forEach(z=>z.classList.remove('open'));if(o)gr.classList.add('open');};
  const J=[['jcadenas','🔗 Las Cadenas (preguntas de Navarra)','i-cadena'],['jnutria','🦦 La Nutria del Arga','i-nutria'],['jraya','⭕ Tres en raya','i-raya']];
  J.forEach(([t,l])=>{const b=document.createElement('button');b.dataset.t=t;b.textContent=l;b.onclick=()=>{showTab(t);menu(false);};sub.appendChild(b);});
  try{Object.assign(TITLES,{jcadenas:'🔗 Las Cadenas',jnutria:'🦦 La Nutria del Arga',jraya:'⭕ Tres en raya'});}catch(e){}
  try{Object.assign(PVS_ESC,{jcadenas:'fiesta',jnutria:'agua',jraya:'bosque'});}catch(e){}
  try{ICP['game-controller']='<path fill-rule="evenodd" d="M176,64H80a56,56,0,0,0,0,112h96a56,56,0,0,0,0-112ZM104,128H88v16a8,8,0,0,1-16,0V128H56a8,8,0,0,1,0-16H72V96a8,8,0,0,1,16,0v16h16a8,8,0,0,1,0,16Zm48-8a12,12,0,1,1,12-12A12,12,0,0,1,152,120Zm24,32a12,12,0,1,1,12-12A12,12,0,0,1,176,152Z"/>';
    Object.assign(ICK,{'g:NA Juega':'game-controller',jcadenas:'game-controller',jnutria:'game-controller',jraya:'game-controller'});
    Object.assign(ICC,{'g:NA Juega':'#f4511e',jcadenas:'#c62828',jnutria:'#00838f',jraya:'#2e7d32'});}catch(e){}
  try{BNI['i-juego']='<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 9h12a7 7 0 0 1 0 14H10A7 7 0 0 1 10 9z" fill="currentColor" fill-opacity=".12"/><path d="M10 13v6M7 16h6"/><circle cx="20" cy="15" r="1.2" fill="currentColor"/><circle cx="23" cy="18" r="1.2" fill="currentColor"/></g>';
    Object.assign(BNK,{'g:NA Juega':'i-juego',jcadenas:'i-juego',jnutria:'i-juego',jraya:'i-juego'});Object.assign(BNF,{'g:NA Juega':'r',jcadenas:'r',jnutria:'b',jraya:'g'});
    Object.assign(BNL,{jcadenas:'Las Cadenas',jnutria:'La Nutria',jraya:'Tres en raya'});}catch(e){}
  // color del grupo, como los demás (GCOL de ampliacion.js)
  const c=document.createElement('style');c.textContent='body:not(.bna) #drawer .dgroup span[data-k="NA Juega"]{color:#e64a19}';document.head.appendChild(c);
  try{if(typeof applyIcons==='function')applyIcons((CFG.iconos||'pro')==='pro');}catch(e){}
  // textos del menú en otros idiomas (eu.js los usa si están)
  try{Object.assign(I18N.eu,{'NA Juega':'NA Jolasean','Las Cadenas (preguntas de Navarra)':'Kateak (Nafarroari buruzko galderak)','La Nutria del Arga':'Argako igaraba','Tres en raya':'Hiru lerroan'});
    Object.assign(I18N.en,{'NA Juega':'NA Plays','Las Cadenas (preguntas de Navarra)':'The Chains (Navarre quiz)','La Nutria del Arga':'The Arga Otter','Tres en raya':'Tic-tac-toe'});
    Object.assign(I18N.fr,{'NA Juega':'NA Joue','Las Cadenas (preguntas de Navarra)':'Les Chaînes (quiz de Navarre)','La Nutria del Arga':'La Loutre de l’Arga','Tres en raya':'Morpion'});}catch(e){}
})();

// abrir / cerrar cada juego
const _stJ=showTab;showTab=function(t){_stJ(t);if(ACT==='jnutria'&&t!=='jnutria'&&window.jnPara)jnPara();ACT=t;
  if(t==='jcadenas')setTimeout(()=>window.jcInit&&jcInit(),30);if(t==='jnutria')setTimeout(()=>window.jnInit&&jnInit(),30);if(t==='jraya')setTimeout(()=>window.jrInit&&jrInit(),30);};

/* =====================================================================
   📷 INSTAGRAM @basatina.es: botón en «Cuadrilla BasatiNA» y tarjeta en «Acerca de»
   (la galería «Fotos y reto del mes» lo lee de fotos/galeria.json → "instagram")
   ===================================================================== */
const IG='basatina.es',IGU='https://www.instagram.com/'+IG+'/';
const abreIG=()=>{if(window.amAbre)amAbre(IGU);else if(window.APP&&window.AndroidNet&&AndroidNet.openUrl)AndroidNet.openUrl(IGU);else window.open(IGU,'_blank');};
(function(){const dr=$('drawer');if(!dr)return;
  const g=[...dr.querySelectorAll('.dgroup')].find(x=>(x.querySelector('span')?.dataset.k||x.textContent).trim()==='Participa'||/Participa/.test(x.textContent));
  const sub=g&&g.nextElementSibling;
  if(sub&&!$('igBtn')){const b=document.createElement('button');b.id='igBtn';b.textContent='📷 Síguenos en Instagram';b.onclick=()=>{menu(false);abreIG();};sub.appendChild(b);
    try{Object.assign(ICK,{igBtn:'instagram-logo'});Object.assign(ICC,{igBtn:'#d81b60'});if(typeof applyIcons==='function')applyIcons((CFG.iconos||'pro')==='pro');}catch(e){}}
  const ab=$('t-about');
  if(ab&&!$('abIG')){const c=document.createElement('div');c.className='card';c.id='abIG';c.style.cssText='display:flex;gap:12px;align-items:center;cursor:pointer';
    c.innerHTML=`<span style="display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:12px;background:linear-gradient(45deg,#f9a825,#e53935 45%,#8e24aa);color:#fff;font-size:24px;flex:none">📷</span><div style="flex:1"><b>Síguenos en Instagram</b><div class="note">@${IG} · fotos de Navarra, novedades de la app y el reto del mes.</div></div><span class="note">›</span>`;
    c.onclick=abreIG;const ref=ab.querySelectorAll('.card')[1];ref?ref.before(c):ab.appendChild(c);}
  try{Object.assign(I18N.eu,{'Síguenos en Instagram':'Jarraitu gaitzazu Instagramen'});Object.assign(I18N.en,{'Síguenos en Instagram':'Follow us on Instagram'});Object.assign(I18N.fr,{'Síguenos en Instagram':'Suivez-nous sur Instagram'});}catch(e){}
})();
})();
