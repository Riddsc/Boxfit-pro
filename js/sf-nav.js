/* =========================================================
   SATRONHO BOXFIT · BARRA DE ABAJO QUE CAMBIA SEGÚN EL APARTADO
   Inicio:   Inicio · Entrenar · Comida · Progreso · Salud · Ajustes
   Entrenar: Inicio · Boxeo · Gimnasio · Cardio · Ajustes
   Comida:   Inicio · Diario · Plan · Agua · Ajustes
   Progreso: Inicio · Resumen · Cuerpo · Medallas · Ajustes
   Salud:    Inicio · Pasos · Corazón · Sueño · Ajustes
   Ajustes siempre está, y abre los ajustes sin perder el apartado.
   ========================================================= */
(function(){
const I = {
  home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  train:'<path d="M6.5 7.5v9M3.5 10v4M17.5 7.5v9M20.5 10v4M6.5 12h11"/>',
  nutri:'<path d="M12 7.5c-1.3-1.7-3.2-2.2-4.8-1.5-2.3 1-3.2 3.6-2.6 6.3.7 3.3 3 7.5 5.4 7.5.8 0 1.3-.4 2-.4s1.2.4 2 .4c2.4 0 4.7-4.2 5.4-7.5.6-2.7-.3-5.3-2.6-6.3-1.6-.7-3.5-.2-4.8 1.5z"/><path d="M12 7.5c0-2 .9-3.4 2.6-4.2"/>',
  progress:'<path d="M4 20V11M10 20V4M16 20v-6M21 20H3"/>',
  health:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z"/><path d="M3 12.5h4l1.5-3 2.5 6 2-4h8"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  box:'<path d="M7 11V7.5A3.5 3.5 0 0 1 10.5 4h3A4.5 4.5 0 0 1 18 8.5V13a5 5 0 0 1-5 5H11a4 4 0 0 1-4-4z"/><path d="M7 11h4a2 2 0 0 1 0 4H8.5M9 18v3h6v-3"/>',
  gym:'<path d="M6.5 7.5v9M3.5 10v4M17.5 7.5v9M20.5 10v4M6.5 12h11"/>',
  cardio:'<circle cx="14" cy="4.5" r="1.8"/><path d="M8 21l3-6 3 2v5M6 11l3-3h4l2 4 3 1M11 15l2-5"/>',
  diary:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  plan:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8" fill="currentColor"/>',
  water:'<path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5z"/>',
  sum:'<path d="M4 20V11M10 20V4M16 20v-6M21 20H3"/>',
  body:'<circle cx="12" cy="5" r="2"/><path d="M6 9h12M12 9v6M9 21l3-6 3 6"/>',
  med:'<circle cx="12" cy="14" r="5"/><path d="M8.5 9.5 6 3h4l2 4 2-4h4l-2.5 6.5"/>',
  steps:'<path d="M7 16c-1.6 0-2.5-1.2-2.5-3.3C4.5 9.5 6 6 7.8 6S10 8.4 9.8 11c-.2 2.2-.8 5-2.8 5zM5 18.5h4M15 11c-1.6 0-2.5-1.2-2.5-3.3C12.5 4.5 14 1 15.8 1S18 3.4 17.8 6c-.2 2.2-.8 5-2.8 5zM13 13.5h4"/>',
  heart:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z"/>',
  sleep:'<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4 7 7 0 0 0 20 14.5z"/>',
  goal:'<path d="M12 21V4M12 4l7 3-7 3"/><path d="M8 21h8"/>',
  flame:'<path d="M12 21c-4 0-6.5-2.6-6.5-6 0-3.3 2.4-5 3.5-8 1.6 1.4 2.4 3 2.5 4.6C13 10 13.6 8 13.4 5c3.3 2.3 5.1 6 5.1 9.5 0 3.7-2.6 6.5-6.5 6.5z"/>',
  week:'<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M7.5 14h2M11 14h2M14.5 14h2"/>',
  cal:'<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><circle cx="12" cy="15" r="1.6" fill="currentColor"/>',
};
// [clave, etiqueta, ícono]; las claves con «:» son pestañas dentro de un apartado
const BARS = {
  home:     [['home','INICIO','home'],['train','ENTRENAR','train'],['nutri','COMIDA','nutri'],['progress','PROGRESO','progress'],['health','SALUD','health'],['settings','AJUSTES','settings']],
  train:    [['home','INICIO','home'],['train:box','BOXEO','box'],['train:gym','GIMNASIO','gym'],['train:cardio','CARDIO','cardio'],['settings','AJUSTES','settings']],
  nutri:    [['home','INICIO','home'],['nutri:diary','DIARIO','diary'],['nutri:plan','PLAN','plan'],['nutri:water','AGUA','water'],['settings','AJUSTES','settings']],
  progress: [['home','INICIO','home'],['progress:sum','RESUMEN','sum'],['progress:body','CUERPO','body'],['progress:med','MEDALLAS','med'],['settings','AJUSTES','settings']],
  health:   [['home','INICIO','home'],['health:steps','PASOS','steps'],['health:heart','CORAZÓN','heart'],['health:sleep','SUEÑO','sleep'],['settings','AJUSTES','settings']],
  goals:    [['home','INICIO','home'],['goals:today','HOY','plan'],['goals:target','MI META','goal'],['goals:streak','RACHAS','flame'],['settings','AJUSTES','settings']],
  week:     [['home','INICIO','home'],['week','MI SEMANA','week'],['calendar','CALENDARIO','cal'],['settings','AJUSTES','settings']],
  settings: [['home','INICIO','home'],['me','MI PERFIL','body'],['settings','AJUSTES','settings']],
};
const ROOTS = ['home', 'train', 'nutri', 'progress', 'health', 'goals', 'week', 'settings'];
let lastSec = 'home';
// A qué apartado pertenece una pantalla (sube por NAV_PARENT hasta llegar a uno)
function sectionOf(v){
  let g = 0;
  if (v === 'me') return 'settings';
  while (v && !ROOTS.includes(v) && g++ < 6) v = NAV_PARENT[v];
  return ROOTS.includes(v) ? v : lastSec;
}
const TAB = {                                    // pestaña activa de cada apartado
  train:    () => S.trainTab === 'cardio' ? 'cardio' : S.disc === 'gym' ? 'gym' : 'box',
  nutri:    () => SFNav.tab.nutri,
  progress: () => SFNav.tab.progress,
  health:   () => SFNav.tab.health,
  goals:    () => SFNav.tab.goals,
};
const PLAIN = ['week', 'settings'];        // apartados cuyas pestañas son pantallas
const BOX_VIEWS = ['timer', 'traffic', 'roulette', 'editor', 'psessions', 'psessionEdit', 'warmups', 'warmupEdit', 'tecnica'];
function activeKey(sec){
  if (sec === 'home') return 'home';
  if (PLAIN.includes(sec)) return current;
  if (sec === 'train'){
    if (BOX_VIEWS.includes(current)) return 'train:box';
    if (/^gym/.test(current)) return 'train:gym';
  }
  return sec + ':' + TAB[sec]();
}
renderNav = function(){
  const sec = sectionOf(current);
  if (sec !== 'settings') lastSec = sec;
  const box = $('#navBtns');
  // En el Inicio la barra de abajo es la racha
  if (sec === 'home'){
    box.dataset.k = 'home'; box.innerHTML = SFToday.streakBar();
    box.querySelector('#navStreak').addEventListener('click', () => { hapticTap(); SFNav.go('goals:streak'); });
    $('#nav').classList.add('streak'); $('#nav').classList.remove('six'); $('#navInd').style.opacity = '0';
    return;
  }
  $('#nav').classList.remove('streak');
  const items = BARS[sec], on = activeKey(sec);
  const key = sec + '|' + items.length;
  if (box.dataset.k !== key){
    box.dataset.k = key;
    box.innerHTML = items.map(([k, l, ic]) => `<button data-nav="${k}" aria-label="${l}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">${I[ic]}</svg><span>${l}</span></button>`).join('');
    box.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => { hapticTap(); navTo(b.dataset.nav); }));
    $('#nav').classList.toggle('six', items.length === 6); $('#nav').classList.toggle('three', items.length === 3); $('#nav').classList.toggle('four', items.length === 4);
  }
  const idx = items.findIndex(x => x[0] === on);
  box.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', i === idx));
  $('#navInd').style.opacity = idx >= 0 ? '1' : '0';
  if (idx >= 0) requestAnimationFrame(() => positionNavInd(idx));
};
function navTo(k){
  const [sec, tab] = k.split(':');
  if (!tab){
    if (k === 'settings' && current === 'settings') return;
    if (k === current) return VIEW_RENDER[k] ? VIEW_RENDER[k]() : null;
    return go(k);
  }
  if (sec === 'train'){ S.trainTab = tab; if (tab !== 'cardio') S.disc = tab; saveSettings(); document.documentElement.dataset.mode = S.disc === 'gym' ? 'gym' : 'box'; }
  else SFNav.tab[sec] = tab;
  if (current === sec){ VIEW_RENDER[sec](); $('#' + sec).scrollTop = 0; renderNav(); if (window.guideOnView) guideOnView(sec); }
  else go(sec);
}
// Atrás: de Ajustes se vuelve al apartado donde estabas; de un apartado, a Inicio
window.SFBack = function(){
  if (current === 'settings'){ go(lastSec === 'settings' ? 'home' : lastSec, true); return true; }
  if (current === 'calendar'){ go('week', true); return true; }
  if (ROOTS.includes(current) && current !== 'home'){ go('home', true); return true; }
  return false;
};
// Con la barra nueva, Ajustes siempre vuelve a su sitio
NAV_PARENT.settings = undefined; NAV_PARENT.me = 'settings'; BACK_TO.me = 'settings';
window.SFNav = { tab: { nutri: 'diary', progress: 'sum', health: 'steps', goals: 'today' }, go: navTo, sectionOf, lastSec: () => lastSec };
})();
