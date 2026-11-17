// Genera el ícono y la pantalla de inicio (icon/*.png) con el planeta BoxFit y los guías oficiales Satronho.
// Uso: node scripts/make-icons.mjs   (necesita rsvg-convert)
import { createRequire } from 'node:module';
import { writeFileSync, copyFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
const { planetScene, appIcon } = createRequire(import.meta.url)('../js/sf-art.js');

const BG = '#0f0d17';
const scene = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${planetScene()}</g>`;
const svgs = {
  'icon-background': `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="${BG}"/></svg>`,
  // Primer plano del ícono adaptable: la escena dentro de la zona segura (~66 % del centro)
  'icon-foreground': `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">${scene(512 - 256 * 1.22, 512 - 256 * 1.22, 1.22)}</svg>`,
  splash: `<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732"><rect width="2732" height="2732" fill="#120d14"/>${scene(1366 - 512, 1100 - 512, 2)}
    <text x="1366" y="1800" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-weight="700" font-size="170" fill="#FFF1EA">BoxFit</text>
    <text x="1366" y="1910" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="64" letter-spacing="18" fill="#FF7A45">SATRONHO</text></svg>`,
  icon: appIcon(1024),
};
for (const [name, svg] of Object.entries(svgs)) {
  writeFileSync(`/tmp/${name}.svg`, svg);
  execSync(`rsvg-convert /tmp/${name}.svg -o icon/${name}.png`);
}
copyFileSync('icon/splash.png', 'icon/splash-dark.png');
writeFileSync('icon/icon.svg', appIcon(512));
console.log('Listo: icon/');
