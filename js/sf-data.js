/* =========================================================
   SATRONHO BOXFIT · DATOS DE BASE
   Actividades (MET), ejercicios de gimnasio, rutinas de fábrica,
   alimentos (con comida colombiana) y menús de ejemplo.
   ---------------------------------------------------------
   MET = cuántas veces el gasto en reposo cuesta una actividad
   (Compendio de Actividades Físicas, Ainsworth y cols. 2011).
   Los valores de los alimentos son promedios por 100 g (o 100 ml)
   de tablas de composición (ICBF Colombia y USDA): sirven para
   llevar la cuenta, no reemplazan la etiqueta del producto.
   ========================================================= */
(function(){

/* ---------- Actividades: [clave, nombre, emoji, MET, grupo] ---------- */
const ACTS = [
  // Boxeo y combate
  ['box_timer',  'Boxeo con el timer',        '🥊', 7.8, 'box'],
  ['box_class',  'Clase de boxeo',            '🥊', 7.8, 'box'],
  ['box_spar',   'Sparring',                  '🤼', 10.0, 'box'],
  ['box_bag',    'Saco',                      '💥', 6.5, 'box'],
  ['box_mitts',  'Manoplas',                  '🎯', 7.0, 'box'],
  ['box_shadow', 'Sombra',                    '👤', 5.5, 'box'],
  ['box_session','Sesión guiada de boxeo',    '🥋', 7.0, 'box'],
  ['rope',       'Saltar lazo',               '🪢', 10.0, 'box'],
  ['warm',       'Calentamiento',             '🔥', 4.0, 'box'],
  ['kick',       'Kickboxing / muay thai',    '🦵', 9.0, 'box'],
  ['mma',        'MMA / lucha',               '🤼', 9.0, 'box'],
  // Gimnasio
  ['w_mod',      'Pesas',                     '🏋️', 5.0, 'gym'],
  ['w_light',    'Pesas suaves',              '🏋️', 3.5, 'gym'],
  ['w_vig',      'Pesas intensas',            '🏋️', 6.0, 'gym'],
  ['circuit',    'Circuito / funcional',      '⚡', 8.0, 'gym'],
  ['hiit',       'HIIT',                      '🔥', 9.0, 'gym'],
  ['calis',      'Calistenia',                '🤸', 6.0, 'gym'],
  ['core',       'Abdominales / core',        '🧱', 3.8, 'gym'],
  ['stretch',    'Estiramiento',              '🧘', 2.3, 'gym'],
  ['yoga',       'Yoga',                      '🧘', 3.0, 'gym'],
  ['pilates',    'Pilates',                   '🧘', 3.0, 'gym'],
  // Cardio y deportes
  ['walk',       'Caminar',                   '🚶', 3.5, 'cardio'],
  ['walk_fast',  'Caminar rápido',            '🚶', 4.8, 'cardio'],
  ['jog',        'Trotar',                    '🏃', 7.0, 'cardio'],
  ['run',        'Correr',                    '🏃', 9.8, 'cardio'],
  ['run_fast',   'Correr rápido',             '🏃', 11.5, 'cardio'],
  ['bike_easy',  'Bicicleta suave',           '🚴', 5.8, 'cardio'],
  ['bike',       'Bicicleta',                 '🚴', 7.5, 'cardio'],
  ['spin',       'Spinning',                  '🚴', 8.5, 'cardio'],
  ['ellip',      'Elíptica',                  '🏃', 5.0, 'cardio'],
  ['stairs',     'Subir escaleras',           '🪜', 8.0, 'cardio'],
  ['row',        'Remo (máquina)',            '🚣', 7.0, 'cardio'],
  ['swim',       'Natación',                  '🏊', 6.0, 'cardio'],
  ['hike',       'Senderismo',                '🥾', 6.0, 'cardio'],
  ['dance',      'Baile / rumba',             '💃', 5.0, 'cardio'],
  ['zumba',      'Zumba / aeróbicos',         '💃', 6.5, 'cardio'],
  ['soccer',     'Fútbol',                    '⚽', 7.0, 'cardio'],
  ['micro',      'Microfútbol',               '⚽', 8.0, 'cardio'],
  ['basket',     'Baloncesto',                '🏀', 6.5, 'cardio'],
  ['volley',     'Voleibol',                  '🏐', 4.0, 'cardio'],
  ['tennis',     'Tenis',                     '🎾', 7.3, 'cardio'],
  ['skate',      'Patinaje',                  '🛼', 7.0, 'cardio'],
  ['house',      'Oficios de la casa',        '🧹', 3.3, 'cardio'],
  ['other',      'Otra actividad',            '✨', 5.0, 'cardio'],
];

/* ---------- Ejercicios de gimnasio: [id, nombre, músculo, equipo, tipo] ----------
   tipo: w = peso × repeticiones · b = peso corporal (repeticiones) · t = por tiempo (segundos) */
const MUSCLES = { pecho:['Pecho','#d98585'], espalda:['Espalda','#7f9bd6'], hombro:['Hombros','#d6a660'], biceps:['Bíceps','#9d8fd0'], triceps:['Tríceps','#d08aa8'],
  pierna:['Piernas','#7fb38a'], gluteo:['Glúteo y femoral','#6fb39a'], pantorrilla:['Pantorrillas','#6fb3a8'], core:['Abdomen y core','#dc9a6e'], todo:['Cuerpo completo','#6fb0b6'] };
const EXERCISES = [
  // Pecho
  ['bench','Press de banca','pecho','Barra','w'], ['bench_db','Press con mancuernas','pecho','Mancuernas','w'], ['incline','Press inclinado','pecho','Barra','w'],
  ['incline_db','Press inclinado con mancuernas','pecho','Mancuernas','w'], ['decline','Press declinado','pecho','Barra','w'], ['chest_m','Press de pecho en máquina','pecho','Máquina','w'],
  ['fly_db','Aperturas con mancuernas','pecho','Mancuernas','w'], ['pec_deck','Aperturas en máquina (mariposa)','pecho','Máquina','w'], ['cross','Cruce de poleas','pecho','Polea','w'],
  ['pushup','Flexiones de pecho','pecho','Peso corporal','b'], ['dips','Fondos en paralelas','pecho','Peso corporal','b'], ['pullover','Pullover','pecho','Mancuerna','w'],
  // Espalda
  ['pullup','Dominadas','espalda','Barra fija','b'], ['chinup','Dominadas supinas','espalda','Barra fija','b'], ['lat','Jalón al pecho','espalda','Polea','w'],
  ['lat_close','Jalón agarre cerrado','espalda','Polea','w'], ['row_bar','Remo con barra','espalda','Barra','w'], ['row_db','Remo con mancuerna','espalda','Mancuerna','w'],
  ['row_seat','Remo sentado en polea','espalda','Polea','w'], ['row_m','Remo en máquina','espalda','Máquina','w'], ['row_t','Remo en T','espalda','Barra','w'],
  ['deadlift','Peso muerto','espalda','Barra','w'], ['hyper','Hiperextensiones','espalda','Banco','b'], ['pull_straight','Jalón con brazos rectos','espalda','Polea','w'],
  ['shrug','Encogimientos de hombros','espalda','Mancuernas','w'], ['facepull','Jalón a la cara','espalda','Polea','w'],
  // Hombros
  ['ohp','Press militar','hombro','Barra','w'], ['ohp_db','Press de hombros con mancuernas','hombro','Mancuernas','w'], ['ohp_m','Press de hombros en máquina','hombro','Máquina','w'],
  ['arnold','Press Arnold','hombro','Mancuernas','w'], ['lateral','Elevaciones laterales','hombro','Mancuernas','w'], ['lateral_c','Elevaciones laterales en polea','hombro','Polea','w'],
  ['front','Elevaciones frontales','hombro','Mancuernas','w'], ['rear','Pájaros (posterior)','hombro','Mancuernas','w'], ['rear_m','Posterior en máquina','hombro','Máquina','w'],
  ['upright','Remo al mentón','hombro','Barra','w'],
  // Bíceps
  ['curl_bar','Curl con barra','biceps','Barra','w'], ['curl_db','Curl con mancuernas','biceps','Mancuernas','w'], ['hammer','Curl martillo','biceps','Mancuernas','w'],
  ['preacher','Curl predicador','biceps','Banco','w'], ['curl_c','Curl en polea','biceps','Polea','w'], ['conc','Curl concentrado','biceps','Mancuerna','w'], ['curl_inc','Curl inclinado','biceps','Mancuernas','w'],
  // Tríceps
  ['pushdown','Extensión de tríceps en polea','triceps','Polea','w'], ['rope_pd','Extensión con cuerda','triceps','Polea','w'], ['skull','Press francés','triceps','Barra','w'],
  ['oh_tri','Copa (extensión sobre la cabeza)','triceps','Mancuerna','w'], ['kick','Patada de tríceps','triceps','Mancuerna','w'], ['bench_dip','Fondos en banco','triceps','Banco','b'],
  ['close_bench','Press de banca cerrado','triceps','Barra','w'], ['diamond','Flexiones diamante','triceps','Peso corporal','b'],
  // Piernas (cuádriceps)
  ['squat','Sentadilla con barra','pierna','Barra','w'], ['front_sq','Sentadilla frontal','pierna','Barra','w'], ['goblet','Sentadilla goblet','pierna','Mancuerna','w'],
  ['smith_sq','Sentadilla en Smith','pierna','Máquina','w'], ['hack','Sentadilla hack','pierna','Máquina','w'], ['legpress','Prensa de piernas','pierna','Máquina','w'],
  ['legext','Extensión de cuádriceps','pierna','Máquina','w'], ['lunge','Zancadas (tijeras)','pierna','Mancuernas','w'], ['bulgarian','Sentadilla búlgara','pierna','Mancuernas','w'],
  ['stepup','Subidas al banco','pierna','Mancuernas','w'], ['bw_squat','Sentadilla libre','pierna','Peso corporal','b'], ['jump_sq','Sentadilla con salto','pierna','Peso corporal','b'],
  ['wall_sit','Sentadilla isométrica (pared)','pierna','Peso corporal','t'],
  // Glúteo y femoral
  ['rdl','Peso muerto rumano','gluteo','Barra','w'], ['rdl_db','Peso muerto rumano con mancuernas','gluteo','Mancuernas','w'], ['hipthrust','Empuje de cadera (hip thrust)','gluteo','Barra','w'],
  ['bridge','Puente de glúteo','gluteo','Peso corporal','b'], ['legcurl','Curl femoral','gluteo','Máquina','w'], ['legcurl_s','Curl femoral sentado','gluteo','Máquina','w'],
  ['kickback','Patada de glúteo en polea','gluteo','Polea','w'], ['abduct','Abductores en máquina','gluteo','Máquina','w'], ['adduct','Aductores en máquina','gluteo','Máquina','w'],
  ['goodm','Buenos días','gluteo','Barra','w'], ['sumo','Peso muerto sumo','gluteo','Barra','w'],
  // Pantorrillas
  ['calf','Elevación de talones de pie','pantorrilla','Máquina','w'], ['calf_s','Elevación de talones sentado','pantorrilla','Máquina','w'], ['calf_bw','Elevación de talones libre','pantorrilla','Peso corporal','b'],
  // Core
  ['plank','Plancha','core','Peso corporal','t'], ['side_plank','Plancha lateral','core','Peso corporal','t'], ['crunch','Abdominales (crunch)','core','Peso corporal','b'],
  ['legraise','Elevación de piernas','core','Peso corporal','b'], ['hang_raise','Elevación de piernas colgado','core','Barra fija','b'], ['russian','Giros rusos','core','Peso corporal','b'],
  ['bicycle','Abdominales bicicleta','core','Peso corporal','b'], ['mountain','Escaladores','core','Peso corporal','t'], ['abwheel','Rueda abdominal','core','Rueda','b'],
  ['cable_crunch','Abdominales en polea','core','Polea','w'], ['woodchop','Leñador en polea','core','Polea','w'], ['vups','Abdominales en V','core','Peso corporal','b'], ['hollow','Hollow (canoa)','core','Peso corporal','t'],
  // Cuerpo completo y potencia (muy usados por boxeadores)
  ['burpee','Burpees','todo','Peso corporal','b'], ['kb_swing','Swing con pesa rusa','todo','Pesa rusa','w'], ['clean','Cargada (clean)','todo','Barra','w'], ['thruster','Thruster','todo','Barra','w'],
  ['med_slam','Azote de balón medicinal','todo','Balón medicinal','w'], ['med_rot','Lanzamiento rotacional de balón','todo','Balón medicinal','w'], ['box_jump','Salto al cajón','todo','Cajón','b'],
  ['farmer','Paseo del granjero','todo','Mancuernas','t'], ['battle','Cuerdas de batalla','todo','Cuerdas','t'], ['land_press','Press landmine (golpe con barra)','todo','Barra','w'],
  ['neck','Cuello (flexión y extensión)','todo','Peso corporal','b'], ['sled','Empuje de trineo','todo','Trineo','t'],
];

/* ---------- Rutinas de fábrica: items [ejercicio, series, repeticiones, descanso s] ---------- */
const ROUTINES = [
  { id:'r_fbA', name:'Cuerpo completo A', color:'#9d8fd0', level:'Principiante', desc:'Lo básico de todo el cuerpo. Ideal para empezar: 3 días por semana alternando A y B.',
    items:[['squat',3,'8-10',120],['bench',3,'8-10',120],['row_seat',3,'10-12',90],['ohp_db',3,'10-12',90],['legcurl',3,'12',75],['plank',3,'40',45]] },
  { id:'r_fbB', name:'Cuerpo completo B', color:'#8f8fd2', level:'Principiante', desc:'El segundo día: se alterna con el A.',
    items:[['legpress',3,'10-12',120],['lat',3,'10-12',90],['incline_db',3,'10-12',90],['rdl_db',3,'10-12',90],['lateral',3,'12-15',60],['curl_db',2,'12',60],['pushdown',2,'12',60]] },
  { id:'r_push', name:'Empuje · pecho, hombro y tríceps', color:'#d98585', level:'Intermedio', desc:'Día de empuje de la rutina de tres días (empuje, jalón y pierna).',
    items:[['bench',4,'6-8',150],['incline_db',3,'8-10',120],['ohp_db',3,'8-10',120],['lateral',3,'12-15',60],['cross',3,'12-15',60],['pushdown',3,'10-12',75],['oh_tri',2,'12',60]] },
  { id:'r_pull', name:'Jalón · espalda y bíceps', color:'#7f9bd6', level:'Intermedio', desc:'Día de jalón: espalda ancha y fuerte para pegar y aguantar.',
    items:[['pullup',4,'6-10',150],['row_bar',4,'8-10',120],['lat',3,'10-12',90],['row_seat',3,'10-12',90],['facepull',3,'15',60],['curl_bar',3,'8-10',75],['hammer',2,'12',60]] },
  { id:'r_legs', name:'Pierna completa', color:'#7fb38a', level:'Intermedio', desc:'Cuádriceps, femoral, glúteo y pantorrilla.',
    items:[['squat',4,'6-8',180],['legpress',3,'10-12',120],['rdl',3,'8-10',120],['lunge',3,'10',90],['legext',3,'12-15',60],['legcurl',3,'12-15',60],['calf',4,'12-15',45]] },
  { id:'r_upper', name:'Torso', color:'#d6a660', level:'Intermedio', desc:'Pecho, espalda, hombros y brazos en un día. Se combina con «Pierna y glúteo».',
    items:[['bench_db',4,'8-10',120],['lat',4,'8-10',120],['ohp_db',3,'10',90],['row_db',3,'10',90],['lateral',3,'15',60],['curl_db',3,'10-12',60],['rope_pd',3,'10-12',60]] },
  { id:'r_glute', name:'Pierna y glúteo', color:'#6fb39a', level:'Intermedio', desc:'Énfasis en glúteo y femoral.',
    items:[['hipthrust',4,'8-10',120],['goblet',3,'10-12',90],['rdl_db',3,'10-12',90],['bulgarian',3,'10',90],['abduct',3,'15',60],['kickback',3,'12-15',60],['calf',3,'15',45]] },
  { id:'r_boxer', name:'Fuerza para boxeadores', color:'#dc9a6e', level:'Intermedio', desc:'Potencia de piernas y cadera, tronco que gira y hombros que aguantan. Dos veces por semana, lejos del sparring.',
    items:[['clean',4,'3-5',150],['squat',4,'4-6',150],['land_press',3,'6-8',90],['med_rot',3,'8',60],['pullup',3,'6-10',120],['pushup',3,'15-20',60],['woodchop',3,'12',60],['neck',2,'15',45]] },
  { id:'r_home', name:'En casa sin equipo', color:'#6fb0b6', level:'Principiante', desc:'Para los días sin gimnasio: solo tu cuerpo.',
    items:[['bw_squat',4,'15-20',60],['pushup',4,'10-15',60],['bridge',3,'15',45],['lunge',3,'12',60],['bench_dip',3,'12',60],['mountain',3,'30',40],['plank',3,'45',40]] },
  { id:'r_core', name:'Core de acero', color:'#cdb262', level:'Todos', desc:'Abdomen y zona media para aguantar golpes al cuerpo y pegar más duro. 15 minutos al final de cualquier entreno.',
    items:[['plank',3,'45',40],['legraise',3,'12-15',45],['russian',3,'20',45],['bicycle',3,'20',45],['side_plank',2,'30',30],['hollow',2,'30',30]] },
  { id:'r_hiit', name:'Circuito quema grasa', color:'#d08aa8', level:'Intermedio', desc:'Circuito de cuerpo completo con poco descanso. Sube pulsaciones y gasta muchas calorías.',
    items:[['burpee',4,'12',45],['kb_swing',4,'15',45],['jump_sq',4,'15',45],['pushup',4,'15',45],['mountain',4,'30',30],['battle',4,'30',45]] },
];

/* ---------- Alimentos: [nombre, kcal, proteína, carbohidratos, grasa (por 100 g o ml), porción, gramos de la porción, grupo] ---------- */
const FOOD_GROUPS = { har:['Harinas y cereales','🍚'], pro:['Carnes, huevo y pescado','🍗'], lac:['Lácteos','🥛'], fru:['Frutas','🍌'], ver:['Verduras','🥦'], leg:['Granos y frutos secos','🫘'],
  gra:['Grasas, salsas y dulce','🧈'], beb:['Bebidas','🥤'], col:['Platos colombianos','🍲'], rap:['Comidas rápidas','🍔'], dul:['Mecato y postres','🍫'], sup:['Suplementos','💪'] };
const FOODS = [
  // Harinas y cereales
  ['Arroz blanco cocido',130,2.7,28,0.3,'taza',160,'har'], ['Arroz integral cocido',123,2.7,25.6,1,'taza',160,'har'], ['Arepa de maíz',219,4.5,44,1.6,'arepa mediana',90,'har'],
  ['Arepa de choclo',250,6,40,7,'unidad',100,'har'], ['Arepa con queso',262,9,34,10,'unidad',110,'har'], ['Pan tajado blanco',265,9,49,3.2,'tajada',28,'har'],
  ['Pan integral',247,13,41,3.4,'tajada',30,'har'], ['Pan de panadería',280,9,56,2,'pan',60,'har'], ['Pandebono',330,9,45,13,'unidad',50,'har'],
  ['Pan de yuca',320,7,48,11,'unidad',40,'har'], ['Buñuelo',380,8,40,21,'unidad',50,'har'], ['Almojábana',300,10,38,12,'unidad',50,'har'],
  ['Avena en hojuelas',389,16.9,66,6.9,'1/2 taza',40,'har'], ['Pasta cocida',158,5.8,31,0.9,'plato',180,'har'], ['Papa cocida',87,1.9,20,0.1,'papa mediana',150,'har'],
  ['Papas a la francesa',312,3.4,41,15,'porción',100,'har'], ['Papa criolla cocida',95,2,21,0.2,'5 unidades',100,'har'], ['Puré de papa',105,2,16,4,'porción',150,'har'],
  ['Yuca cocida',160,1.4,38,0.3,'trozo',100,'har'], ['Tajadas de plátano maduro',250,1.2,40,10,'3 tajadas',60,'har'], ['Plátano verde cocido',116,0.8,31,0.2,'medio plátano',100,'har'],
  ['Patacón',300,1.5,45,13,'patacón',50,'har'], ['Tortilla de harina',300,8,50,7.5,'unidad',45,'har'], ['Tortilla de maíz',218,5.7,45,2.8,'unidad',25,'har'],
  ['Cereal de caja',380,6,85,2,'taza',30,'har'], ['Granola',450,10,64,17,'1/2 taza',50,'har'], ['Galletas de soda',420,9,71,11,'paquete (3)',27,'har'],
  ['Quinua cocida',120,4.4,21,1.9,'taza',185,'har'], ['Mazorca (maíz tierno)',96,3.4,21,1.5,'mazorca',100,'har'], ['Crispetas',480,9,58,24,'taza',10,'har'],
  // Carnes, huevo y pescado
  ['Pechuga de pollo a la plancha',165,31,0,3.6,'filete',120,'pro'], ['Pollo asado (presa con piel)',230,24,0,15,'presa',110,'pro'], ['Pollo apanado o frito',290,22,13,17,'presa',120,'pro'],
  ['Pollo desmechado',170,28,1,6,'porción',100,'pro'], ['Carne de res asada',200,28,0,9,'porción',120,'pro'], ['Carne molida',250,26,0,15,'porción',100,'pro'],
  ['Carne en bistec',190,22,4,9.5,'porción',130,'pro'], ['Lomo de cerdo asado',210,27,0,11,'porción',120,'pro'], ['Chicharrón',540,25,0,48,'porción',60,'pro'],
  ['Chorizo',380,16,2,34,'unidad',80,'pro'], ['Costilla de cerdo',360,20,0,31,'porción',120,'pro'], ['Hígado de res',175,26,5,5,'porción',100,'pro'],
  ['Tilapia a la plancha',128,26,0,2.7,'filete',130,'pro'], ['Mojarra frita',220,24,3,12,'mojarra',200,'pro'], ['Salmón',208,20,0,13,'filete',120,'pro'],
  ['Atún en agua',116,26,0,1,'lata',80,'pro'], ['Atún en aceite',198,29,0,8,'lata',80,'pro'], ['Sardinas en lata',208,25,0,11,'lata',90,'pro'],
  ['Camarones',99,24,0.2,0.3,'porción',100,'pro'], ['Huevo cocido',155,13,1.1,11,'huevo',50,'pro'], ['Huevo frito',196,13.6,0.8,15,'huevo',46,'pro'],
  ['Huevos revueltos',150,10,2,11.5,'2 huevos',110,'pro'], ['Huevos pericos',135,8.5,4,9.5,'2 huevos',140,'pro'], ['Clara de huevo',52,11,0.7,0.2,'clara',33,'pro'],
  ['Jamón de sándwich',110,17,3,3.5,'tajada',20,'pro'], ['Salchicha',300,12,3,27,'unidad',45,'pro'], ['Mortadela',311,16,3,25,'tajada',20,'pro'],
  ['Salchichón',320,14,4,28,'rodaja',25,'pro'], ['Tocineta',541,37,1.4,42,'tira',10,'pro'], ['Tofu',76,8,1.9,4.8,'porción',100,'pro'],
  // Lácteos
  ['Leche entera',61,3.2,4.8,3.3,'vaso',240,'lac'], ['Leche deslactosada',46,3.3,4.9,1.5,'vaso',240,'lac'], ['Leche descremada',34,3.4,5,0.1,'vaso',240,'lac'],
  ['Leche de almendras',17,0.6,0.6,1.5,'vaso',240,'lac'], ['Yogur natural',61,3.5,4.7,3.3,'vaso',200,'lac'], ['Yogur griego',90,9,4,4,'pote',150,'lac'],
  ['Yogur de frutas',95,3,16,2,'vaso',200,'lac'], ['Kumis',80,3,12,2.5,'vaso',200,'lac'], ['Queso campesino',250,17,2,19,'tajada',30,'lac'],
  ['Queso costeño',300,20,2,24,'tajada',30,'lac'], ['Cuajada',150,13,3,10,'porción',50,'lac'], ['Queso mozzarella',300,22,2.2,22,'tajada',20,'lac'],
  ['Queso doble crema',320,21,2,26,'tajada',20,'lac'], ['Queso parmesano',431,38,4,29,'cucharada',8,'lac'], ['Queso crema',342,6,4,34,'cucharada',15,'lac'],
  ['Helado',207,3.5,24,11,'bola',60,'lac'],
  // Frutas
  ['Banano',89,1.1,23,0.3,'banano',110,'fru'], ['Manzana',52,0.3,14,0.2,'manzana',150,'fru'], ['Naranja',47,0.9,12,0.1,'naranja',140,'fru'],
  ['Mandarina',53,0.8,13,0.3,'mandarina',90,'fru'], ['Mango',60,0.8,15,0.4,'medio mango',150,'fru'], ['Papaya',43,0.5,11,0.3,'tajada',150,'fru'],
  ['Piña',50,0.5,13,0.1,'rodaja',100,'fru'], ['Sandía',30,0.6,7.6,0.2,'tajada',200,'fru'], ['Melón',34,0.8,8,0.2,'tajada',150,'fru'],
  ['Fresas',32,0.7,7.7,0.3,'taza',150,'fru'], ['Uvas',69,0.7,18,0.2,'racimo',100,'fru'], ['Guayaba',68,2.6,14,1,'guayaba',80,'fru'],
  ['Maracuyá (pulpa)',97,2.2,23,0.7,'maracuyá',40,'fru'], ['Mora',43,1.4,10,0.5,'taza',140,'fru'], ['Lulo',25,0.7,6,0.2,'lulo',80,'fru'],
  ['Granadilla',97,2.2,23,0.7,'granadilla',60,'fru'], ['Aguacate',160,2,8.5,14.7,'1/4 de aguacate',50,'fru'], ['Pera',57,0.4,15,0.1,'pera',160,'fru'],
  ['Durazno',39,0.9,10,0.3,'durazno',120,'fru'], ['Kiwi',61,1.1,15,0.5,'kiwi',70,'fru'], ['Tomate de árbol',31,2,7,0.4,'unidad',80,'fru'],
  ['Uchuvas',53,1.9,11,0.7,'puñado',60,'fru'], ['Coco rallado',354,3.3,15,33,'cucharada',10,'fru'], ['Uvas pasas',299,3.1,79,0.5,'cucharada',15,'fru'],
  ['Ensalada de frutas',60,0.8,15,0.3,'vaso',250,'fru'],
  // Verduras
  ['Tomate',18,0.9,3.9,0.2,'tomate',100,'ver'], ['Cebolla',40,1.1,9.3,0.1,'media cebolla',50,'ver'], ['Zanahoria',41,0.9,10,0.2,'zanahoria',70,'ver'],
  ['Lechuga',15,1.4,2.9,0.2,'taza',50,'ver'], ['Ensalada mixta sin aderezo',20,1.2,4,0.2,'plato',120,'ver'], ['Brócoli cocido',35,2.4,7,0.4,'taza',90,'ver'],
  ['Espinaca',23,2.9,3.6,0.4,'taza',30,'ver'], ['Pepino',15,0.7,3.6,0.1,'medio pepino',100,'ver'], ['Habichuela cocida',35,1.9,7.9,0.3,'taza',125,'ver'],
  ['Ahuyama cocida',26,1,6.5,0.1,'taza',200,'ver'], ['Remolacha cocida',44,1.7,10,0.2,'media',70,'ver'], ['Repollo',25,1.3,5.8,0.1,'taza',70,'ver'],
  ['Pimentón',31,1,6,0.3,'medio',60,'ver'], ['Champiñones',22,3.1,3.3,0.3,'taza',70,'ver'], ['Coliflor cocida',23,1.8,4.1,0.5,'taza',120,'ver'],
  ['Verduras salteadas',70,2,8,3.5,'porción',150,'ver'],
  // Granos y frutos secos
  ['Fríjoles cocidos',127,8.7,22.8,0.5,'cucharón',130,'leg'], ['Fríjoles guisados',150,8,22,3.5,'taza',200,'leg'], ['Lentejas cocidas',116,9,20,0.4,'taza',200,'leg'],
  ['Garbanzos cocidos',164,8.9,27,2.6,'taza',160,'leg'], ['Arveja cocida',84,5.4,15.6,0.2,'taza',160,'leg'], ['Maní',567,26,16,49,'puñado',30,'leg'],
  ['Almendras',579,21,22,50,'puñado',28,'leg'], ['Nueces',654,15,14,65,'puñado',28,'leg'], ['Mantequilla de maní',588,25,20,50,'cucharada',16,'leg'],
  ['Semillas de chía',486,17,42,31,'cucharada',12,'leg'], ['Mezcla de frutos secos',520,15,40,34,'puñado',30,'leg'],
  // Grasas, salsas y dulce
  ['Aceite',884,0,0,100,'cucharadita',5,'gra'], ['Mantequilla',717,0.9,0.1,81,'cucharadita',5,'gra'], ['Margarina',717,0.2,0.7,80,'cucharadita',5,'gra'],
  ['Crema de leche',195,2.5,4,19,'cucharada',15,'gra'], ['Mayonesa',680,1,0.6,75,'cucharada',14,'gra'], ['Salsa de tomate',100,1.3,25,0.2,'cucharada',17,'gra'],
  ['Hogao',90,1.2,7,6.5,'cucharada',30,'gra'], ['Guacamole',155,2,8.5,14,'cucharada',30,'gra'], ['Suero costeño',180,3,4,17,'cucharada',15,'gra'],
  ['Azúcar',387,0,100,0,'cucharadita',5,'gra'], ['Panela',380,0.5,96,0.2,'trozo',20,'gra'], ['Miel',304,0.3,82,0,'cucharada',21,'gra'],
  ['Mermelada',250,0.4,65,0.1,'cucharada',20,'gra'], ['Arequipe',315,7,55,7.5,'cucharada',20,'gra'], ['Leche condensada',321,8,54,8.7,'cucharada',20,'gra'],
  // Bebidas (por 100 ml)
  ['Tinto sin azúcar',1,0.1,0,0,'pocillo',120,'beb'], ['Tinto con azúcar',17,0.1,4.2,0,'pocillo',120,'beb'], ['Café con leche',35,1.8,3.5,1.6,'pocillo',200,'beb'],
  ['Chocolate en leche',85,3.3,12,3,'pocillo',200,'beb'], ['Aguapanela',40,0,10,0,'vaso',240,'beb'], ['Jugo natural en agua',45,0.4,11,0.1,'vaso',250,'beb'],
  ['Jugo natural en leche',75,2.5,12,2,'vaso',250,'beb'], ['Jugo de naranja',45,0.7,10.4,0.2,'vaso',250,'beb'], ['Limonada con azúcar',40,0,10.5,0,'vaso',250,'beb'],
  ['Gaseosa',42,0,10.6,0,'vaso',250,'beb'], ['Gaseosa sin azúcar',0,0,0,0,'vaso',250,'beb'], ['Bebida energizante',45,0,11,0,'lata',250,'beb'],
  ['Bebida hidratante',26,0,6.4,0,'botella',500,'beb'], ['Cerveza',43,0.5,3.6,0,'botella',330,'beb'], ['Vino',85,0.1,2.6,0,'copa',150,'beb'],
  ['Aguardiente',170,0,2,0,'trago',45,'beb'], ['Ron o whisky',231,0,0,0,'trago',45,'beb'], ['Avena (bebida)',75,2.5,13,1.5,'vaso',250,'beb'],
  ['Chocolate en polvo con leche',90,3.5,13,2.8,'vaso',240,'beb'], ['Malteada',110,3.5,17,3,'vaso',300,'beb'], ['Té sin azúcar',1,0,0.2,0,'pocillo',200,'beb'],
  ['Agua de coco',19,0.7,3.7,0.2,'vaso',250,'beb'],
  // Platos colombianos
  ['Almuerzo corriente',135,7,18,4,'plato',600,'col'], ['Bandeja paisa',190,8.5,17,9.5,'bandeja',850,'col'], ['Ajiaco',70,5,8,2,'plato',450,'col'],
  ['Sancocho',75,5,9,2,'plato',500,'col'], ['Mondongo',85,6,8,3,'plato',450,'col'], ['Sopa de verduras',35,1.5,6,0.6,'plato',350,'col'],
  ['Sopa de pasta',45,2,7.5,0.8,'plato',350,'col'], ['Caldo de costilla',60,5,4,3,'plato',400,'col'], ['Changua',65,4,4,3.5,'plato',350,'col'],
  ['Arroz con pollo',150,8,20,4,'plato',350,'col'], ['Calentado',170,6,25,5,'plato',300,'col'], ['Tamal',170,7,19,7.5,'tamal',330,'col'],
  ['Empanada',300,7,30,17,'empanada',80,'col'], ['Papa rellena',220,6,24,11,'unidad',150,'col'], ['Pastel de pollo',330,9,30,19,'unidad',100,'col'],
  ['Arepa de huevo',290,9,27,16,'unidad',130,'col'], ['Lechona',250,13,14,16,'porción',250,'col'], ['Sudado de pollo',110,11,6,4.5,'plato',300,'col'],
  ['Carne sudada con papa',120,10,7,6,'plato',300,'col'], ['Fríjoles con arroz',145,5.5,26,2,'plato',350,'col'], ['Lentejas con arroz',130,5.5,24,1.2,'plato',350,'col'],
  ['Cazuela de mariscos',95,8,4,5,'plato',400,'col'], ['Arroz chino',165,6,24,5,'plato',350,'col'], ['Pollo con champiñones',140,14,3,8,'porción',200,'col'],
  // Comidas rápidas
  ['Hamburguesa sencilla',250,13,22,12,'hamburguesa',200,'rap'], ['Hamburguesa con queso y tocineta',280,15,20,16,'hamburguesa',250,'rap'], ['Perro caliente',250,9,24,13,'perro',180,'rap'],
  ['Pizza',270,11,33,10,'porción',110,'rap'], ['Salchipapa',260,7,24,15,'porción',300,'rap'], ['Sándwich de jamón y queso',250,12,28,10,'sándwich',130,'rap'],
  ['Burrito',200,9,22,8,'burrito',250,'rap'], ['Tacos',215,10,20,10,'taco',90,'rap'], ['Sushi',150,5,28,2,'8 piezas',200,'rap'],
  ['Alitas de pollo',290,22,6,20,'6 alitas',180,'rap'], ['Nuggets de pollo',296,15,18,18,'6 nuggets',100,'rap'], ['Ensalada César con pollo',130,9,5,8.5,'plato',300,'rap'],
  ['Wrap de pollo',190,11,20,7,'wrap',220,'rap'], ['Mazorcada',170,8,15,9,'porción',350,'rap'],
  // Mecato y postres
  ['Chocolatina',535,7.6,59,30,'unidad',30,'dul'], ['Chocolate oscuro',546,5,61,31,'cuadrito',10,'dul'], ['Bocadillo de guayaba',300,0.5,75,0.2,'unidad',30,'dul'],
  ['Papas de paquete',536,6.5,53,34,'paquete',35,'dul'], ['Pasabocas de maíz',520,6,58,29,'paquete',40,'dul'], ['Torta o ponqué',370,5,55,15,'porción',80,'dul'],
  ['Dona',420,5,49,23,'dona',60,'dul'], ['Brownie',440,5.5,60,20,'unidad',60,'dul'], ['Gelatina',60,1.5,14,0,'vaso',120,'dul'],
  ['Oblea con arequipe',380,6,65,10,'oblea',60,'dul'], ['Galletas dulces',480,6,68,21,'4 galletas',30,'dul'], ['Barra de cereal',400,6,70,10,'barra',23,'dul'],
  ['Gomitas',330,6,77,0,'paquete',30,'dul'], ['Flan o postre de leche',145,4,22,4.5,'porción',120,'dul'], ['Arroz con leche',130,3.5,22,3,'porción',150,'dul'],
  ['Natilla',180,3,34,3.5,'porción',100,'dul'],
  // Suplementos
  ['Proteína en polvo (whey)',390,78,8,6,'medida',30,'sup'], ['Barra de proteína',370,30,35,12,'barra',60,'sup'], ['Creatina',0,0,0,0,'medida',5,'sup'],
  ['Batido de proteína con leche',85,9,6,2.8,'vaso',300,'sup'],
];

/* ---------- Menús de ejemplo (≈2.000 kcal; se ajustan a tu meta): [alimento, gramos] ---------- */
const MENUS = [
  { id:'m_eq1', n:'Equilibrado colombiano', type:'eq', meals:{
    des:[['Huevos pericos',140],['Arepa de maíz',90],['Queso campesino',30],['Café con leche',200]], mm:[['Banano',110],['Yogur natural',200]],
    alm:[['Arroz blanco cocido',160],['Pechuga de pollo a la plancha',140],['Fríjoles cocidos',130],['Ensalada mixta sin aderezo',120],['Aguacate',50]],
    alg:[['Maní',30],['Manzana',150]], cen:[['Tilapia a la plancha',130],['Papa cocida',150],['Verduras salteadas',150]] } },
  { id:'m_eq2', n:'Equilibrado de diario', type:'eq', meals:{
    des:[['Avena en hojuelas',50],['Leche deslactosada',240],['Banano',110],['Huevo cocido',50]], mm:[['Papaya',150],['Almendras',20]],
    alm:[['Lentejas con arroz',350],['Carne de res asada',100],['Ensalada mixta sin aderezo',120]],
    alg:[['Yogur griego',150],['Fresas',150]], cen:[['Arepa de maíz',90],['Pollo desmechado',100],['Queso campesino',30],['Tomate',100]] } },
  { id:'m_hp1', n:'Alto en proteína', type:'hp', meals:{
    des:[['Huevos revueltos',165],['Clara de huevo',99],['Arepa de maíz',90],['Tinto sin azúcar',120]], mm:[['Yogur griego',150],['Proteína en polvo (whey)',30]],
    alm:[['Pechuga de pollo a la plancha',180],['Arroz blanco cocido',160],['Brócoli cocido',90],['Fríjoles cocidos',130]],
    alg:[['Atún en agua',80],['Galletas de soda',27],['Manzana',150]], cen:[['Carne de res asada',150],['Ensalada mixta sin aderezo',120],['Papa cocida',150],['Aguacate',50]] } },
  { id:'m_hp2', n:'Proteína para dar el peso', type:'hp', meals:{
    des:[['Clara de huevo',165],['Huevo cocido',50],['Avena en hojuelas',40],['Fresas',150]], mm:[['Batido de proteína con leche',300]],
    alm:[['Tilapia a la plancha',195],['Arroz integral cocido',160],['Ensalada mixta sin aderezo',120],['Habichuela cocida',125]],
    alg:[['Yogur griego',150],['Almendras',20]], cen:[['Pechuga de pollo a la plancha',150],['Verduras salteadas',150],['Ahuyama cocida',200]] } },
  { id:'m_lc1', n:'Bajo en harinas', type:'lc', meals:{
    des:[['Huevos revueltos',165],['Aguacate',100],['Queso campesino',60],['Tinto sin azúcar',120]], mm:[['Almendras',28],['Fresas',150]],
    alm:[['Carne de res asada',180],['Ensalada mixta sin aderezo',240],['Brócoli cocido',180],['Aceite',10]],
    alg:[['Yogur griego',150],['Nueces',20]], cen:[['Salmón',150],['Verduras salteadas',200],['Aguacate',50]] } },
  { id:'m_veg1', n:'Vegetariano', type:'veg', meals:{
    des:[['Avena en hojuelas',50],['Leche entera',240],['Banano',110],['Mantequilla de maní',16]], mm:[['Yogur griego',150],['Granola',30]],
    alm:[['Lentejas cocidas',300],['Arroz integral cocido',160],['Ensalada mixta sin aderezo',120],['Aguacate',50],['Huevo cocido',50]],
    alg:[['Mezcla de frutos secos',30],['Manzana',150]], cen:[['Tofu',150],['Quinua cocida',185],['Verduras salteadas',150],['Queso campesino',30]] } },
];

window.SFData = { ACTS, MUSCLES, EXERCISES, ROUTINES, FOOD_GROUPS, FOODS, MENUS };
})();
