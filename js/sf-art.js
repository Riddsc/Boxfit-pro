/* =========================================================
   SATRONHO BOXFIT · ARTE OFICIAL DE LOS GUÍAS SATRONHO
   Samy, Troya, Ñoño, Juana y MechaRidds: los mismos dibujos de Satronho Bot y
   Satronho Somnia (src/art/), para que la familia sea igual en todas las apps.
   Este archivo también lo usa scripts/make-icons.mjs para generar el ícono.
   ========================================================= */
(function(root){
const DOGS_API = (function(){
// Copiado de Satronho Bot (dashboard/js) para que los guías sean los mismos en todas las apps Satronho.
// Dibujos de Samy, Troya, Ñoño y Juana: los perritos de RiddsSatronho.
// Ilustraciones propias (SVG) basadas en cómo son de verdad:
//   Samy  – café rojiza con mancha blanca, orejas grandes, collar azul.
//   Troya – atigrada con máscara oscura, orejas paradas, gafas en la frente.
//   Ñoño  – blanco con parches negros, orejas caídas, lengua afuera, corbatín.
//   Juana – negrita de hocico gris, cejas canosas y moño rosado.
// Todas comparten la misma base de ojos, nariz y mejillas para que se
// vean como una familia.

const INK = '#1c1a22';

function eyes({ lashes = false, brows = null, iris = '#6b3f1f' } = {}) {
  const eye = (x, dir) => `
    <ellipse cx="${x}" cy="53" rx="6.4" ry="6.8" fill="#fff"/>
    <circle cx="${x + dir * 0.6}" cy="54" r="4.3" fill="${iris}"/>
    <circle cx="${x + dir * 0.6}" cy="54" r="2.3" fill="${INK}"/>
    <circle cx="${x + dir * 0.6 - 1.4}" cy="52.3" r="1.3" fill="#fff"/>
    ${lashes ? `<g stroke="${INK}" stroke-width="1.5" stroke-linecap="round"><path d="M${x + dir * 5} ${48} l${dir * 3.2} -2.6"/><path d="M${x + dir * 6.2} ${50.4} l${dir * 3.6} -1.2"/></g>` : ''}`;
  return `${eye(37, -1)}${eye(63, 1)}${brows ? `<g fill="none" stroke="${brows}" stroke-width="4.2" stroke-linecap="round"><path d="M30 43 Q36 39.5 42 42"/><path d="M58 42 Q64 39.5 70 43"/></g>` : ''}`;
}

const cheeks = (opacity = 0.45) =>
  `<ellipse cx="29" cy="65" rx="5" ry="3.4" fill="#ff7a8a" opacity="${opacity}"/><ellipse cx="71" cy="65" rx="5" ry="3.4" fill="#ff7a8a" opacity="${opacity}"/>`;

const smile = (y = 74) => `<path d="M43 ${y} Q50 ${y + 5} 57 ${y}" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;

const DOGS = {
  samy: () => `
    <path d="M30 40 C20 32 12 18 14 8 C24 10 34 22 38 32 Z" fill="#a95a2f"/>
    <path d="M28 35 C22 28 18 19 18 13 C24 16 30 24 33 31 Z" fill="#e9a6a0"/>
    <path d="M70 40 C80 32 88 18 86 8 C76 10 66 22 62 32 Z" fill="#a95a2f"/>
    <path d="M72 35 C78 28 82 19 82 13 C76 16 70 24 67 31 Z" fill="#e9a6a0"/>
    <path d="M14 8 C10 12 9 17 12 20 C14 15 16 11 14 8 Z M86 8 C90 12 91 17 88 20 C86 15 84 11 86 8 Z" fill="#8c4824"/>
    <ellipse cx="50" cy="57" rx="33" ry="32" fill="#c06d3d"/>
    <path d="M50 25 C47 36 43 48 40 60 L60 60 C57 48 53 36 50 25 Z" fill="#f8f1e8"/>
    <ellipse cx="50" cy="71" rx="17" ry="13.5" fill="#f8f1e8"/>
    ${eyes({ lashes: true, brows: '#8c4824' })}
    <ellipse cx="50" cy="64.5" rx="6.6" ry="4.8" fill="#d98b8b"/>
    <ellipse cx="47.6" cy="65.4" rx="1.4" ry="1" fill="#9c5656"/><ellipse cx="52.4" cy="65.4" rx="1.4" ry="1" fill="#9c5656"/>
    ${cheeks()}${smile(73)}
    <path d="M24 84 Q50 97 76 84 L74 90 Q50 102 26 90 Z" fill="#23356b"/>`,

  troya: () => `
    <path d="M27 40 L20 6 L44 28 Z" fill="#3e2b20"/>
    <path d="M28 33 L24 13 L39 27 Z" fill="#c98f7f"/>
    <path d="M73 40 L80 6 L56 28 Z" fill="#3e2b20"/>
    <path d="M72 33 L76 13 L61 27 Z" fill="#c98f7f"/>
    <ellipse cx="50" cy="57" rx="32" ry="33" fill="#7a5435"/>
    <g stroke="#3e2b20" stroke-width="2.4" stroke-linecap="round" opacity=".55" fill="none">
      <path d="M23 52 l7 2"/><path d="M22 60 l8 1"/><path d="M77 52 l-7 2"/><path d="M78 60 l-8 1"/>
    </g>
    <path d="M50 30 C38 34 32 44 33 56 C35 66 42 72 50 72 C58 72 65 66 67 56 C68 44 62 34 50 30 Z" fill="#4a3427"/>
    <ellipse cx="50" cy="74" rx="13" ry="10" fill="#c7b6a3"/>
    <ellipse cx="38" cy="43.5" rx="4" ry="2.4" fill="#d9b48a"/><ellipse cx="62" cy="43.5" rx="4" ry="2.4" fill="#d9b48a"/>
    ${eyes({ lashes: true })}
    <ellipse cx="50" cy="65" rx="6.4" ry="4.6" fill="${INK}"/><ellipse cx="48.4" cy="63.6" rx="2" ry="1.1" fill="#fff" opacity=".5"/>
    ${cheeks(0.4)}${smile(73.5)}
    <path d="M17 31 Q50 23 83 31" fill="none" stroke="#8b5cf6" stroke-width="5" stroke-linecap="round"/>
    <rect x="29" y="24" width="18" height="12" rx="5" fill="#c9e8ff" stroke="#2b2b6b" stroke-width="2.6"/>
    <rect x="53" y="24" width="18" height="12" rx="5" fill="#c9e8ff" stroke="#2b2b6b" stroke-width="2.6"/>
    <path d="M47 29 L53 29" stroke="#2b2b6b" stroke-width="2.6"/>
    <path d="M32 27 l4 0 M56 27 l4 0" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".9"/>`,

  nono: () => `
    <ellipse cx="17" cy="56" rx="11" ry="24" fill="#1f1f22" transform="rotate(12 17 56)"/>
    <ellipse cx="83" cy="56" rx="11" ry="24" fill="#1f1f22" transform="rotate(-12 83 56)"/>
    <ellipse cx="50" cy="57" rx="32" ry="33" fill="#f6f3ee"/>
    <path d="M47 24.5 C36 25 24 32 20 44 C19 52 22 58 28 60 C36 61 43 56 46 48 C47.5 41 47.5 32 47 24.5 Z" fill="#1f1f22"/>
    <path d="M53 24.5 C64 25 76 32 80 44 C81 52 78 58 72 60 C64 61 57 56 54 48 C52.5 41 52.5 32 53 24.5 Z" fill="#1f1f22"/>
    ${eyes({})}
    <ellipse cx="50" cy="66" rx="7.6" ry="5.4" fill="${INK}"/><ellipse cx="48" cy="64.4" rx="2.4" ry="1.3" fill="#fff" opacity=".5"/>
    <g fill="#9a9a9a"><circle cx="40" cy="71" r=".9"/><circle cx="37" cy="69" r=".9"/><circle cx="60" cy="71" r=".9"/><circle cx="63" cy="69" r=".9"/></g>
    <path d="M42 73 Q50 78 58 73" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M45.5 75 Q45 86 50 87 Q55 86 54.5 75 Z" fill="#ef7088"/><path d="M50 76 L50 84" stroke="#c94d64" stroke-width="1.4" stroke-linecap="round"/>
    ${cheeks(0.3)}
    <g transform="translate(50 93)"><path d="M0 0 L-12 -6 L-12 6 Z M0 0 L12 -6 L12 6 Z" fill="#8b5cf6"/><circle r="3.6" fill="#6d3fe0"/></g>`,

  juana: () => `
    <ellipse cx="18" cy="54" rx="11" ry="22" fill="#2a2b31" transform="rotate(16 18 54)"/>
    <ellipse cx="82" cy="54" rx="11" ry="22" fill="#2a2b31" transform="rotate(-16 82 54)"/>
    <ellipse cx="50" cy="57" rx="32" ry="33" fill="#34363d"/>
    <ellipse cx="50" cy="71" rx="15.5" ry="12.5" fill="#7c7e86"/>
    ${eyes({ lashes: true, brows: '#b4b6bd' })}
    <ellipse cx="50" cy="64.5" rx="6.6" ry="4.8" fill="#1c1d22"/><ellipse cx="48.2" cy="63.2" rx="2" ry="1.1" fill="#fff" opacity=".45"/>
    ${cheeks(0.5)}${smile(73.5)}
    <g transform="translate(68 24) rotate(-12)">
      <path d="M0 0 C-6 -9 -16 -7 -15 0 C-16 7 -6 9 0 0 Z" fill="#e5788c"/>
      <path d="M0 0 C6 -9 16 -7 15 0 C16 7 6 9 0 0 Z" fill="#e5788c"/>
      <circle r="4.2" fill="#c95369"/>
    </g>`,
};

function mascotSVG(id, label = '') {
  const body = DOGS[id] ? DOGS[id]() : '';
  // Un poco más pequeño y abajo para que las orejas quepan en el círculo.
  return `<svg viewBox="0 0 100 100" role="img" aria-label="${label}"><g class="dog" transform="translate(5 8) scale(.9)">${body}</g></svg>`;
}

return { mascotSVG };
})();
const MECHA_API = (function(){
// Copiado de Satronho Bot (dashboard/js) para que los guías sean los mismos en todas las apps Satronho.
// MechaRidds: Ridds (RiddsSatronho), el creador de Satronho Bot, en versión
// androide caricaturizada. Mismo estilo que los perritos (mascots.js):
// cabeza grande y redonda, ojos con brillo, mejillas y sonrisa simples.
// De Ridds conserva la gorra negra con el control, las gafas grandes, la
// piel morena, las orejas con candongas negras, la sonrisa y la bata.
// De androide (0.11): un ojo mecánico violeta (el otro es su ojo café),
// media mandíbula metálica con costura de luz, articulaciones en las sienes,
// antena con luz, circuito en la mejilla, cuello con pistones y un núcleo en
// el pecho. Las luces son verde Hulk; el violeta es el de la app.
// Es un ayudante: aparece en Chat Bot, Novedades y Reportar, sin quitarle
// protagonismo a los perritos.
//
// mechaHead(): cabeza para los círculos de guía (viewBox 0 0 100 100).
// mechaBust(): busto pequeño para la portada del Chat Bot y Novedades.

const INK = '#1c1a22';
const SKIN = '#c98b63';
const SKIN_IN = '#ad6e4a';
const METAL = '#d7dce6';
const METAL_D = '#8a93a8';
const METAL_DD = '#5d6579';
const GLOW = '#74d14c'; // verde Hulk
const GLOW_D = '#3f8f2a';
const VIOLET = '#8b5cf6'; // el morado de la app
const BROWN = '#4a2a17';

const bolt = (x, y, r = 1.5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${METAL_D}"/><path d="M${x - r * 0.6} ${y} h${r * 1.2}" stroke="${METAL_DD}" stroke-width=".7"/>`;

function head() {
  // Ojo de Ridds: café oscuro con brillo, como los perritos.
  const eyeHuman = (x) => `
    <ellipse cx="${x}" cy="57" rx="6" ry="6.4" fill="#fff"/>
    <circle cx="${x + 0.4}" cy="58" r="4" fill="${BROWN}"/>
    <circle cx="${x + 0.4}" cy="58" r="2.1" fill="#160c06"/>
    <circle cx="${x - 1}" cy="56.3" r="1.4" fill="#fff"/>`;
  // Ojo mecánico: lente violeta con anillo segmentado y aro de metal.
  const eyeMecha = (x) => `
    <circle cx="${x}" cy="57.4" r="6.6" fill="${METAL}" stroke="${METAL_D}" stroke-width="1"/>
    <circle cx="${x}" cy="57.4" r="4.9" fill="#1b1430"/>
    <circle cx="${x}" cy="57.4" r="3.9" fill="${VIOLET}"/>
    <circle cx="${x}" cy="57.4" r="3.9" fill="none" stroke="#c9b5ff" stroke-width=".9" stroke-dasharray="1.5 1.1"/>
    <circle cx="${x}" cy="57.4" r="1.7" fill="#120d22"/>
    <circle cx="${x - 1.3}" cy="55.9" r="1.2" fill="#fff"/>`;
  return `
    <!-- antena con anillo y luz -->
    <path d="M62 15 L66 4" stroke="${METAL_D}" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="61.6" y="10" width="5" height="2.6" rx="1.2" transform="rotate(20 64 11)" fill="${METAL_DD}"/>
    <circle cx="66.6" cy="3.6" r="5.5" fill="${GLOW}" opacity=".25"/>
    <circle cx="66.6" cy="3.6" r="3.1" fill="${GLOW}"/>
    <circle cx="65.6" cy="2.7" r="1" fill="#fff"/>
    <!-- orejas de piel con candongas negras -->
    <ellipse cx="19.5" cy="61" rx="6.5" ry="8.5" fill="${SKIN}"/>
    <ellipse cx="20.5" cy="61" rx="3.2" ry="5" fill="${SKIN_IN}"/>
    <ellipse cx="80.5" cy="61" rx="6.5" ry="8.5" fill="${SKIN}"/>
    <ellipse cx="79.5" cy="61" rx="3.2" ry="5" fill="${SKIN_IN}"/>
    <!-- cara -->
    <ellipse cx="50" cy="60" rx="31" ry="30" fill="${SKIN}"/>
    <!-- media mandíbula metálica (lado del ojo mecánico) con costura de luz -->
    <path d="M56 89.4 C68 88 78 80 80.6 68 L70 66 Q66 78 56 80 Z" fill="${METAL}"/>
    <path d="M56 80 Q66 78 70 66 L80.6 68" fill="none" stroke="${GLOW}" stroke-width="1.3"/>
    <path d="M62 86 v-4 h6 l3 -4" fill="none" stroke="${METAL_D}" stroke-width=".9"/>
    ${bolt(74, 76, 1.4)}
    <!-- circuito en la otra mejilla -->
    <path d="M26 64 v6 l4 4 h3" fill="none" stroke="${GLOW}" stroke-width="1.1" stroke-linecap="round"/>
    <circle cx="33.4" cy="74" r="1.1" fill="${GLOW}"/>
    <!-- candongas negras -->
    <circle cx="17.5" cy="73" r="4.2" fill="none" stroke="${INK}" stroke-width="2.3"/>
    <circle cx="82.5" cy="73" r="4.2" fill="none" stroke="${INK}" stroke-width="2.3"/>
    <!-- articulaciones de las sienes -->
    <circle cx="23.5" cy="50" r="4.2" fill="${METAL}" stroke="${METAL_D}" stroke-width="1"/>${bolt(23.5, 50)}
    <circle cx="76.5" cy="50" r="4.2" fill="${METAL}" stroke="${METAL_D}" stroke-width="1"/>${bolt(76.5, 50)}
    <!-- gorra negra con el control gris y el punto morado -->
    <path d="M18 47 C17 25 31 14 50 14 C69 14 83 25 82 47 Z" fill="#1d1b24"/>
    <path d="M17 46 Q50 40 83 46 L83 50.5 Q50 44.5 17 50.5 Z" fill="#2c2935"/>
    <path d="M22 47.4 Q50 42.6 78 47.4" fill="none" stroke="${GLOW}" stroke-width=".9" opacity=".7"/>
    <rect x="40" y="25" width="20" height="9" rx="4.5" fill="#d9d6e2"/>
    <path d="M43.6 29.5 h3.6 M45.4 27.7 v3.6" stroke="#5b5672" stroke-width="1.4" stroke-linecap="round"/>
    <circle cx="53.6" cy="29.5" r="1.5" fill="${VIOLET}"/><circle cx="56.8" cy="29.5" r="1.1" fill="#9c96b0"/>
    <!-- ojos y gafas negras grandes con reflejo -->
    ${eyeHuman(38)}${eyeMecha(62)}
    <rect x="52.5" y="49" width="19" height="16" rx="5" fill="${VIOLET}" opacity=".1"/>
    <rect x="28.5" y="49" width="19" height="16" rx="5" fill="none" stroke="#111017" stroke-width="3.6"/>
    <rect x="52.5" y="49" width="19" height="16" rx="5" fill="none" stroke="#111017" stroke-width="3.6"/>
    <path d="M31.5 53 l4 -2.2 M55.5 53 l4 -2.2" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>
    <path d="M47.5 55 Q50 53.4 52.5 55" fill="none" stroke="#111017" stroke-width="3"/>
    <!-- mejilla y sonrisa con dientes -->
    <ellipse cx="31" cy="70" rx="4.4" ry="2.8" fill="#ff7a8a" opacity=".35"/>
    <path d="M39 72 Q50 88 61 72 Q50 75 39 72 Z" fill="#3b1620"/>
    <path d="M40.6 72.6 Q50 75.6 59.4 72.6 L58.4 75.4 Q50 78 41.6 75.4 Z" fill="#fff"/>
    <path d="M45 81 Q50 83.6 55 81 Q50 79.4 45 81 Z" fill="#e5788c"/>`;
}

function mechaHead(label = 'MechaRidds') {
  return `<svg viewBox="0 0 100 100" role="img" aria-label="${label}"><g transform="translate(5 6) scale(.9)">${head()}</g></svg>`;
}

// Busto pequeño y caricaturizado: cabeza grande, cuello con pistones y bata.
function mechaBust(label = 'MechaRidds') {
  return `<svg viewBox="0 0 120 134" role="img" aria-label="${label}">
    <!-- cuello articulado con anillos y pistones -->
    <rect x="51" y="94" width="18" height="15" rx="3" fill="${METAL}" stroke="${METAL_D}" stroke-width="1.2"/>
    <path d="M51 99 h18 M51 104 h18" stroke="${METAL_D}" stroke-width="1"/>
    <path d="M54 95 v13 M66 95 v13" stroke="${METAL_DD}" stroke-width="1.6" stroke-linecap="round"/>
    <!-- camiseta negra con núcleo verde -->
    <path d="M30 134 C30 118 42 108 60 108 C78 108 90 118 90 134 Z" fill="#17151d"/>
    <circle cx="60" cy="122" r="5" fill="${GLOW}" opacity=".25"/>
    <circle cx="60" cy="122" r="3.2" fill="${GLOW}"/>
    <circle cx="60" cy="122" r="3.2" fill="none" stroke="${GLOW_D}" stroke-width=".8"/>
    <circle cx="59.2" cy="121.2" r=".9" fill="#fff"/>
    <!-- bata blanca -->
    <path d="M24 134 C26 118 36 108 50 106 L56 120 L52 134 Z M96 134 C94 118 84 108 70 106 L64 120 L68 134 Z" fill="#f4f2f8"/>
    <path d="M50 106 L56 120 L51 124 L44 110 Z M70 106 L64 120 L69 124 L76 110 Z" fill="#dcd8e6"/>
    <rect x="78" y="118" width="11" height="9" rx="2" fill="#e7e3ef" stroke="#cbc6d8"/>
    <rect x="80.5" y="114" width="2" height="6" rx="1" fill="${VIOLET}"/><rect x="84" y="113" width="2" height="7" rx="1" fill="${GLOW}"/>
    <g transform="translate(10 0)">${head()}</g>
  </svg>`;
}

return { mechaHead, mechaBust };
})();

const GUIDES = {
  samy:  { name:'Samy',       role:'Cuida tu racha',              color:'#ffb23e' },
  troya: { name:'Troya',      role:'Entrenadora de fuerza',       color:'#9b8cff' },
  nono:  { name:'Ñoño',       role:'Científico de la nutrición',  color:'#4fd1c5' },
  juana: { name:'Juana',      role:'Lleva tus estadísticas',      color:'#ff8fb5' },
  mecha: { name:'MechaRidds', role:'Calcula tus calorías',        color:'#74d14c' },
};
const headSVG = id => id === 'mecha' ? MECHA_API.mechaHead(GUIDES.mecha.name) : DOGS_API.mascotSVG(id, GUIDES[id].name);
// Cabeza dentro de un círculo con el color del guía, centrada en (cx, cy) con radio r
function ringed(id, cx, cy, r){
  const inner = headSVG(id).replace('<svg ', `<svg x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" `);
  return `<g><circle cx="${cx}" cy="${cy}" r="${r}" fill="#1d1733"/>${inner}<circle cx="${cx}" cy="${cy}" r="${(r - r * 0.045).toFixed(2)}" fill="none" stroke="${GUIDES[id].color}" stroke-width="${(r * 0.09).toFixed(2)}"/></g>`;
}
function badge(id, size){
  size = size || 56;
  return `<svg class="sfguide" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="${GUIDES[id].name}">${ringed(id, 50, 50, 48)}</svg>`;
}
// Guante de boxeo + mancuerna: el emblema del planeta BoxFit (cuadro de 200×200 centrado en 0,0)
function emblem(){
  return `<g>
    <g transform="rotate(-18)">
      <rect x="-86" y="34" width="172" height="20" rx="10" fill="#2a0a0c" opacity=".55"/>
      <rect x="-98" y="20" width="22" height="48" rx="9" fill="#2a0a0c" opacity=".55"/><rect x="76" y="20" width="22" height="48" rx="9" fill="#2a0a0c" opacity=".55"/>
      <rect x="-70" y="26" width="14" height="36" rx="6" fill="#2a0a0c" opacity=".55"/><rect x="56" y="26" width="14" height="36" rx="6" fill="#2a0a0c" opacity=".55"/>
    </g>
    <g transform="translate(-4 -14) rotate(-14)">
      <path d="M-38 34 L-34 62 Q-33 70 -25 70 L27 70 Q35 70 36 62 L39 34 Z" fill="#fff4e0"/>
      <path d="M-35 44 L37 44 M-34 56 L36 56" stroke="#e11d48" stroke-width="5"/>
      <path d="M-46 -8 C-50 -52 -18 -76 16 -72 C50 -68 68 -40 62 -6 C58 18 48 30 40 36 L-36 36 C-42 26 -45 10 -46 -8 Z" fill="#fff4e0"/>
      <path d="M-46 -4 C-70 -10 -78 14 -66 30 C-58 40 -46 40 -36 36 C-44 24 -46 10 -46 -4 Z" fill="#ffe2b8"/>
      <path d="M-20 -52 C0 -62 30 -56 44 -34" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".9"/>
      <path d="M-30 12 C-10 20 22 20 44 10" fill="none" stroke="#f1c98e" stroke-width="5" stroke-linecap="round"/>
    </g>
  </g>`;
}
// Escena en un cuadro de 512×512, misma línea que los íconos de Satronho Bot y Somnia:
// planeta (aquí rojo fuego, con guante y mancuerna), anillo inclinado y los cinco guías en órbita.
let uidN = 0;
function planetScene(opt){
  const frame = !!(opt && opt.frame);
  const k = 'bf' + (++uidN);
  const tilt = -18, cx = 256, cy = 270, rx = 214, ry = 62;
  const t = tilt * Math.PI / 180;
  const onRing = deg => { const a = deg * Math.PI / 180, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(t) - y * Math.sin(t), cy + x * Math.sin(t) + y * Math.cos(t)]; };
  const front = [['samy', 163, 48], ['troya', 17, 48], ['mecha', 90, 58]].map(([id, deg, r]) => { const [x, y] = onRing(deg); return ringed(id, +x.toFixed(1), +y.toFixed(1), r); });
  const back = [ringed('nono', 150, 142, 42), ringed('juana', 362, 136, 32)];
  const stars = [[70,110,2.2],[130,60,1.6],[420,70,2],[460,150,1.4],[92,380,1.5],[440,420,2.2],[300,40,1.3],[40,250,1.4],[478,300,1.6],[200,470,1.4]].map(([x,y,r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".7"/>`).join('');
  const ring = () => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="url(#${k}g)" stroke-width="26" transform="rotate(${tilt} ${cx} ${cy})"/>`;
  return `
    <defs>
      <radialGradient id="${k}p" cx="38%" cy="30%" r="72%"><stop offset="0" stop-color="#ffc9a8"/><stop offset=".5" stop-color="#ef4444"/><stop offset="1" stop-color="#7a1220"/></radialGradient>
      <linearGradient id="${k}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffb23e"/><stop offset="1" stop-color="#ff5a36"/></linearGradient>
      <clipPath id="${k}f"><rect x="-200" y="270" width="912" height="400" transform="rotate(${tilt} 256 270)"/></clipPath>
      ${frame ? `<clipPath id="${k}r"><rect width="512" height="512" rx="112"/></clipPath>` : ''}
    </defs>
    <g ${frame ? `clip-path="url(#${k}r)"` : ''}>
      ${frame ? '<rect width="512" height="512" fill="#0f0d17"/>' : ''}
      <circle cx="256" cy="256" r="230" fill="#1d1733"/>
      ${stars}
      ${back.join('')}
      ${ring()}
      <circle cx="256" cy="256" r="132" fill="url(#${k}p)"/>
      <ellipse cx="206" cy="320" rx="34" ry="16" fill="#5a0d18" opacity=".28"/><circle cx="322" cy="322" r="13" fill="#5a0d18" opacity=".24"/>
      <g clip-path="url(#${k}f)">${ring()}</g>
      <g transform="translate(262 226) scale(.94)">${emblem()}</g>
      ${front.join('')}
    </g>`;
}
const orbit = size => `<svg class="sforbit" width="${size || 200}" height="${size || 200}" viewBox="0 0 512 512" role="img" aria-label="Samy, Troya, Ñoño, Juana y MechaRidds en órbita">${planetScene()}</svg>`;
const appIcon = size => `<svg xmlns="http://www.w3.org/2000/svg" width="${size || 512}" height="${size || 512}" viewBox="0 0 512 512">${planetScene({ frame:true })}</svg>`;

const API = { GUIDES, badge, headSVG, ringed, planetScene, orbit, appIcon, mechaBust: MECHA_API.mechaBust };
root.SFArt = API;
if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
