/* =========================================================
   SATRONHO BOXFIT · SELECTOR DE PERIODO (como Google Health)
   Día · Semana · Mes · 3 meses · Año. Cada pantalla recuerda el suyo.
   buckets() arma las barras: por hora (día), por día (semana y mes),
   por semana (3 meses) y por mes (año).
   ========================================================= */
(function(){
const LBL = { es: { d:'D', w:'S', m:'M', q:'3M', y:'A' }, en: { d:'D', w:'W', m:'M', q:'3M', y:'Y' }, fr: { d:'J', w:'S', m:'M', q:'3M', y:'A' } }[window.SF_LG || 'es'] || {};
const DAYS = { d: 1, w: 7, m: 30, q: 91, y: 365 };
const get = (key, def) => (S.per && S.per[key]) || def || 'w';
function seg(key, def, allowed){
  const cur = get(key, def), ks = allowed || ['d', 'w', 'm', 'q', 'y'];
  return `<div class="sfperiod" data-perk="${key}">${ks.map(k => `<button type="button" data-p="${k}" class="${k === cur ? 'on' : ''}" data-notr>${LBL[k]}</button>`).join('')}</div>`;
}
function bind(root, key, cb){
  root.querySelectorAll(`[data-perk="${key}"] [data-p]`).forEach(b => b.addEventListener('click', () => {
    S.per = S.per || {}; S.per[key] = b.dataset.p; saveSettings(); hapticTap(); cb(b.dataset.p);
  }));
}
// Título del rango: "Hoy", "Esta semana"…
const title = p => ({ d: 'Hoy', w: 'Últimos 7 días', m: 'Últimos 30 días', q: 'Últimos 3 meses', y: 'Último año' })[p];
/* valueOf(fecha) → número del día · opt.hours(fecha) → [24] para la vista de día
   opt.agg: 'sum' (pasos, kcal) o 'avg' (pulso, horas de sueño): cómo se juntan los días de una semana o un mes */
function buckets(p, valueOf, opt){
  opt = opt || {};
  const t = todayISO(), out = [];
  if (p === 'd'){
    const h = opt.hours ? opt.hours(t) || [] : [], nowH = new Date().getHours();
    for (let i = 5; i < 24; i++) out.push({ l: i % 3 === 0 ? String(i) : '', v: Math.round(h[i] || 0), hi: i === nowH });
    return out;
  }
  const avgOf = days => { const v = days.map(valueOf).filter(x => x); if (!v.length) return 0; const s = v.reduce((a, b) => a + b, 0); return Math.round(opt.agg === 'sum' ? s / days.length : s / v.length); };
  if (p === 'w' || p === 'm'){
    const n = DAYS[p];
    for (let i = n - 1; i >= 0; i--){ const d = addDays(t, -i), dt = parseISO(d); out.push({ l: p === 'w' ? WD[dt.getDay()] : (i % 7 === 0 ? String(dt.getDate()) : ''), v: Math.round(valueOf(d) || 0), hi: d === t }); }
    return out;
  }
  if (p === 'q'){
    let mon = SF.mondayOf(t);
    for (let k = 0; k < 13; k++){
      const days = []; for (let j = 0; j < 7; j++){ const d = addDays(mon, j); if (d <= t) days.push(d); }
      out.unshift({ l: k % 3 === 0 ? String(parseISO(mon).getDate()) + ' ' + MONTHS[parseISO(mon).getMonth()].slice(0, 3).toLowerCase() : '', v: avgOf(days), hi: k === 0 });
      mon = addDays(mon, -7);
    }
    return out;
  }
  const now = parseISO(t);
  for (let k = 11; k >= 0; k--){
    const m0 = new Date(now.getFullYear(), now.getMonth() - k, 1), days = [];
    for (let d = new Date(m0); d.getMonth() === m0.getMonth() && iso(d) <= t; d.setDate(d.getDate() + 1)) days.push(iso(d));
    out.push({ l: MONTHS[m0.getMonth()].slice(0, 1).toUpperCase(), v: avgOf(days), hi: k === 0 });
  }
  return out;
}
// Resumen de un periodo: promedio por día con dato, total y días con dato
function stats(p, valueOf){
  const t = todayISO(), n = DAYS[p]; let s = 0, c = 0, best = 0;
  for (let i = 0; i < n; i++){ const v = valueOf(addDays(t, -i)) || 0; if (v){ s += v; c++; if (v > best) best = v; } }
  return { sum: s, days: c, avg: c ? s / c : 0, best, n };
}
// Etiqueta de las barras: en semana/mes son días; en 3 meses y año, promedio diario
const unitNote = p => p === 'q' ? 'Promedio diario por semana' : p === 'y' ? 'Promedio diario por mes' : p === 'd' ? 'Por hora' : 'Por día';
window.SFPeriod = { seg, bind, get, buckets, stats, title, unitNote, DAYS };
})();
