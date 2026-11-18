/* =========================================================
   SATRONHO BOXFIT · WIDGET DE LA PANTALLA DE INICIO DEL TELÉFONO
   El widget se agrega desde el teléfono (mantener presionada la pantalla de
   inicio › Widgets › Satronho BoxFit) y se quita igual. Aquí se elige qué muestra.
   ========================================================= */
(function(){
const WP = plugin('SFWidget');
const OPT = () => Object.assign({ streak: true, kcal: true, min: true, steps: true, water: true, light: false }, S.widget || {});
let lastSent = '';
function push(){
  if (!WP) return;
  const o = OPT(), t = todayISO(), b = SF.dayBurn(t), s = SF.streaks(), w = SF.water()[t] || 0, G = SF.G, wg = SF.waterGoal();
  const pc = (v, g) => Math.round(clamp(g ? v / g : 0, 0, 1) * 100);
  const data = { title: me.name ? TF('Hola, {s}', me.name.trim().split(/\s+/)[0]) : 'Satronho BoxFit', streak: s.day, showStreak: o.streak, light: o.light,
    kcal: { on: o.kcal, t: `Calorías ${SF.nf(b.active)} / ${SF.nf(G.kcal)}`, p: pc(b.active, G.kcal) },
    min: { on: o.min, t: `Minutos ${b.min} / ${G.min}`, p: pc(b.min, G.min) },
    steps: { on: o.steps, t: `Pasos ${SF.nf(b.steps)} / ${SF.nf(G.steps)}`, p: pc(b.steps, G.steps), goal: G.steps, label: TT('Pasos'), day: todayISO(), manual: b.steps },
    water: { on: o.water, t: `Agua ${SF.n1(w / 1000)} / ${SF.n1(wg / 1000)} L`, p: pc(w, wg) } };
  ['kcal','min','steps','water'].forEach(k => data[k].t = TT(data[k].t) );
  const j = JSON.stringify(data); if (j === lastSent) return; lastSent = j;
  WP.update({ data: j }).catch(() => {});
}
const ROWS = [['streak', '🔥 Racha'], ['kcal', '🔥 Calorías activas'], ['min', '⏱️ Minutos activos'], ['steps', '👟 Pasos'], ['water', '💧 Agua']];
function settingsHTML(){
  const o = OPT();
  return `<div class="sect"><h4>WIDGET DEL TELÉFONO</h4>
    <p class="hint">Opcional. Para ponerlo: mantén presionada la pantalla de inicio del teléfono › <b>Widgets</b> › <b>Satronho BoxFit</b>. Para quitarlo, arrástralo fuera. Elige qué muestra:</p>
    ${ROWS.map(([k, l]) => `<div class="row"><div class="l"><b>${l}</b></div><button class="switch ${o[k] ? 'on' : ''}" data-wg="${k}"></button></div>`).join('')}
    <div class="row"><div class="l"><b>Fondo claro</b><small>Si tu fondo de pantalla es claro</small></div><button class="switch ${o.light ? 'on' : ''}" data-wg="light"></button></div></div>`;
}
function bind(root){
  root.querySelectorAll('[data-wg]').forEach(b => b.addEventListener('click', () => { const o = OPT(); o[b.dataset.wg] = !o[b.dataset.wg]; S.widget = o; saveSettings(); b.classList.toggle('on', o[b.dataset.wg]); hapticTap(); push(); }));
}
document.addEventListener('visibilitychange', () => { if (document.hidden) push(); });
setInterval(push, 60000);
window.SFWidget = { push, settingsHTML, bind };
})();
