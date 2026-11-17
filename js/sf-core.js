/* =========================================================
   SATRONHO BOXFIT · NÚCLEO
   Calorías (MET + metabolismo en reposo), metas del día, agua,
   pasos, rachas, medallas y el registro de actividades.
   ---------------------------------------------------------
   Cómo se calculan las calorías:
   · En reposo (lo que gasta el cuerpo sin moverse): Mifflin-St Jeor (1990).
   · Activas: (MET − 1) × peso en kg × horas. Se resta 1 MET porque ese
     ya está contado en el reposo; así nada se cuenta dos veces.
   · Pasos: ≈0,04 kcal por paso para 70 kg (se ajusta a tu peso).
   Son estimaciones: sirven para comparar tus días, no son una medida de laboratorio.
   ========================================================= */
(function(){
const D = window.SFData;
const ACT = {}; D.ACTS.forEach(a => ACT[a[0]] = { k:a[0], n:a[1], ic:a[2], met:a[3], g:a[4] });
const nf = v => Math.round(v || 0).toLocaleString('es-CO');
const n1 = v => (Math.round((v || 0) * 10) / 10).toLocaleString('es-CO');
const hm = min => { min = Math.round(min || 0); return min < 60 ? min + ' min' : Math.floor(min / 60) + ' h' + (min % 60 ? ' ' + min % 60 + ' min' : ''); };

/* ---------- Estado guardado ---------- */
const G = Object.assign({ kcal: 400, min: 30, steps: 8000, water: 0, days: 0, life: 1.2 }, load('sf_goals', {}));
let water = load('sf_water', {});       // { fecha: ml }
let steps = load('sf_steps', {});       // { fecha: pasos }
let medals = load('sf_medals', {});     // { id: fecha en que se ganó }
let best = Object.assign({ day: 0, week: 0 }, load('sf_best', {}));
const saveG = () => save('sf_goals', G);

/* ---------- Tu cuerpo ---------- */
const kg = () => { const w = lastWeight(); return w ? w.kg : 70; };
const ageY = () => { const a = ageOf(me); return a ? a.y : 30; };
const profileMissing = () => { const m = []; if (!lastWeight()) m.push('peso'); if (!me.height) m.push('altura'); if (!me.sex) m.push('género'); if (!ageOf(me)) m.push('edad'); return m; };
// Calorías en reposo de un día completo (Mifflin-St Jeor). Sin género, el punto medio entre las dos fórmulas.
function bmr(){
  const base = 10 * kg() + 6.25 * (me.height || 170) - 5 * ageY();
  return Math.round(base + (me.sex === 'M' ? 5 : me.sex === 'F' ? -161 : -78));
}
// Meta de agua: 35 ml por kilo (redondeado a 250), o la que la persona elija
const waterGoal = () => G.water || Math.max(1500, Math.round(kg() * 35 / 250) * 250);
// Días de entreno por semana: los que marcó en su perfil, o la meta elegida, o 4
const weekGoal = () => G.days || me.plan.length || 4;

/* ---------- Calorías de un entreno ---------- */
const INT = [0, 0.82, 1, 1.18];                      // intensidad: suave, normal, fuerte
const minOf = h => h.m || (h.s ? Math.max(1, Math.round(h.s / 60 * 1.3)) : 0);
function kcalCalc(h, w){
  w = w || kg();
  const a = ACT[h.a] || ACT[h.t === 'gym' ? 'w_mod' : h.t === 'cardio' ? 'other' : h.manual ? 'box_class' : 'box_timer'];
  const met = a.met * (INT[h.i || 2] || 1);
  const min = minOf(h);
  let k;
  if (h.s && !h.manual && min * 60 > h.s){            // con timer: rounds a la intensidad de la actividad y descansos casi en reposo
    k = w * ((met - 1) * h.s / 3600 + (2.0 - 1) * (min * 60 - h.s) / 3600);
  } else k = w * (met - 1) * min / 60;
  return Math.max(0, Math.round(k));
}
function fillKcal(h){ if (h.k == null) h.k = kcalCalc(h); return h; }
const kcalOf = h => h.k != null ? h.k : kcalCalc(h);

/* ---------- Resumen de un día ---------- */
const stepKcal = n => Math.round((n || 0) * 0.00057 * kg());
const stepMin = n => Math.round((n || 0) / 115);
function dayBurn(ds){
  const acts = sessLog.filter(h => h.d === ds);
  const st = steps[ds] || 0;
  const train = acts.reduce((a, h) => a + kcalOf(h), 0), tmin = acts.reduce((a, h) => a + minOf(h), 0);
  const active = train + stepKcal(st), b = bmr();
  // Hoy el reposo va por la hora que es; los días pasados, completo
  const frac = ds === todayISO() ? (new Date().getHours() * 60 + new Date().getMinutes()) / 1440 : ds > todayISO() ? 0 : 1;
  return { acts, steps: st, train, active, min: tmin + stepMin(st), tmin, bmr: b, rest: Math.round(b * frac), total: Math.round(b * frac) + active };
}
function dayStripHTML(ds){
  const b = dayBurn(ds), f = window.SFNutri ? SFNutri.dayTotals(ds) : null, w = water[ds] || 0;
  if (!b.active && !(f && f.k) && !w) return '';
  return `<div class="sfstrip"><span>🔥 <b>${nf(b.active)}</b> kcal activas</span><span>⏱️ <b>${b.min}</b> min</span>${f && f.k ? `<span>🍽️ <b>${nf(f.k)}</b> kcal</span>` : ''}${w ? `<span>💧 <b>${n1(w / 1000)}</b> L</span>` : ''}</div>`;
}

/* ---------- Rachas ---------- */
const isRest = ds => pmarks[ds] === 'rest' || (me.plan.length > 0 && !me.plan.includes(parseISO(ds).getDay()) && pmarks[ds] !== 'miss');
function dayStreak(){
  const t = todayISO(), free = 7 - weekGoal();
  let n = 0, d = t, guard = 0, first = sessLog.reduce((a, h) => h.d < a ? h.d : a, t);
  const missed = [];
  while (d >= first && guard++ < 2000){
    if (trainedOn(d)) n++;
    else if (d === t || isRest(d)) { /* hoy todavía no cuenta en contra; el descanso es neutro */ }
    else if (!me.plan.length){
      // Sin días fijos: se perdonan los días libres de la semana (7 − tu meta de días)
      missed.push(d);
      if (missed.filter(x => x <= addDays(d, 6)).length > free) break;
    } else break;
    d = addDays(d, -1);
  }
  return n;
}
const mondayOf = ds => { const d = parseISO(ds); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); };
const weekDays = mon => { let n = 0; for (let i = 0; i < 7; i++) if (trainedOn(addDays(mon, i))) n++; return n; };
function weekStreak(){
  const goal = weekGoal(); let mon = mondayOf(todayISO()), n = 0, guard = 0;
  if (weekDays(mon) >= goal) n++;
  mon = addDays(mon, -7);
  while (weekDays(mon) >= goal && guard++ < 520){ n++; mon = addDays(mon, -7); }
  return n;
}
function logStreak(has){ let n = 0, d = todayISO(), g = 0; if (!has(d)) d = addDays(d, -1); while (has(d) && g++ < 2000){ n++; d = addDays(d, -1); } return n; }
function streaks(){
  const day = dayStreak(), week = weekStreak();
  if (day > best.day || week > best.week){ best.day = Math.max(best.day, day); best.week = Math.max(best.week, week); save('sf_best', best); }
  const t = todayISO();
  return { day, week, bestDay: best.day, bestWeek: best.week, today: trainedOn(t), restToday: !trainedOn(t) && isRest(t),
    food: window.SFNutri ? logStreak(d => SFNutri.dayTotals(d).k > 0) : 0, water: logStreak(d => (water[d] || 0) >= waterGoal()),
    weekDone: weekDays(mondayOf(t)), weekGoal: weekGoal() };
}

/* ---------- Medallas ---------- */
const totals = () => {
  const t = { ses: sessLog.length, kcal: 0, min: 0, rounds: 0, gym: 0, box: 0, cardio: 0, days: new Set() };
  sessLog.forEach(h => { t.kcal += kcalOf(h); t.min += minOf(h); t.rounds += h.r || 0; t.days.add(h.d); if (h.t === 'gym') t.gym++; else if (h.t === 'cardio') t.cardio++; else t.box++; });
  t.days = t.days.size; return t;
};
const MEDALS = [
  ['first',   '🥊', 'Primer campanazo',    'Termina tu primer entreno',                    (t) => t.ses >= 1],
  ['s10',     '🔟', 'Diez entrenos',       'Completa 10 entrenos',                         (t) => t.ses >= 10],
  ['s50',     '🏅', 'Cincuenta entrenos',  'Completa 50 entrenos',                         (t) => t.ses >= 50],
  ['s100',    '💯', 'Cien entrenos',       'Completa 100 entrenos',                        (t) => t.ses >= 100],
  ['r100',    '🔔', '100 rounds',          'Acumula 100 rounds',                           (t) => t.rounds >= 100],
  ['r500',    '🛎️', '500 rounds',          'Acumula 500 rounds',                           (t) => t.rounds >= 500],
  ['d3',      '🔥', 'Racha de 3',          'Tres días de entreno seguidos',                (t, s) => s.bestDay >= 3],
  ['d7',      '🔥', 'Semana de fuego',     'Racha de 7 días',                              (t, s) => s.bestDay >= 7],
  ['d30',     '🌋', 'Mes imparable',       'Racha de 30 días',                             (t, s) => s.bestDay >= 30],
  ['d100',    '☄️', 'Leyenda',             'Racha de 100 días',                            (t, s) => s.bestDay >= 100],
  ['w4',      '📅', 'Mes cumplido',        'Cuatro semanas seguidas cumpliendo tu meta',   (t, s) => s.bestWeek >= 4],
  ['w12',     '🗓️', 'Tres meses firmes',   'Doce semanas seguidas cumpliendo tu meta',     (t, s) => s.bestWeek >= 12],
  ['k1',      '⚡', '1.000 kcal',          'Quema 1.000 kcal entrenando',                  (t) => t.kcal >= 1000],
  ['k10',     '🚀', '10.000 kcal',         'Quema 10.000 kcal entrenando',                 (t) => t.kcal >= 10000],
  ['k50',     '🌟', '50.000 kcal',         'Quema 50.000 kcal entrenando',                 (t) => t.kcal >= 50000],
  ['h10',     '⏱️', '10 horas',            'Acumula 10 horas de entreno',                  (t) => t.min >= 600],
  ['h50',     '⌛', '50 horas',            'Acumula 50 horas de entreno',                  (t) => t.min >= 3000],
  ['gym1',    '🏋️', 'Fierros',             'Termina tu primera rutina de pesas',           (t) => t.gym >= 1],
  ['gym25',   '💪', 'De hierro',           'Termina 25 rutinas de pesas',                  (t) => t.gym >= 25],
  ['mix',     '🎭', 'Completo',            'Entrena boxeo, pesas y cardio',                (t) => t.box > 0 && t.gym > 0 && t.cardio > 0],
  ['pr',      '🏆', 'Nuevo récord',        'Supera un récord en un ejercicio',             (t, s, x) => x.prs >= 1],
  ['pr10',    '👑', 'Rompe récords',       'Supera 10 récords',                            (t, s, x) => x.prs >= 10],
  ['food7',   '🥗', 'Semana anotada',      'Registra tu comida 7 días seguidos',           (t, s) => s.food >= 7],
  ['food30',  '📒', 'Mes anotado',         'Registra tu comida 30 días seguidos',          (t, s) => s.food >= 30],
  ['water7',  '💧', 'Bien hidratado',      'Cumple tu meta de agua 7 días seguidos',       (t, s) => s.water >= 7],
  ['goal',    '🎯', 'Día redondo',         'Cierra los anillos de calorías y minutos el mismo día', (t, s, x) => x.rings],
  ['weight5', '⚖️', 'Constante',           'Registra tu peso 5 veces',                     () => weights.length >= 5],
  ['sleep',   '🌙', 'Sueño y sudor',       'Cruza tus datos con Satronho Somnia',          (t, s, x) => x.sleep],
];
function medalState(){
  const b = dayBurn(todayISO());
  return { prs: window.SFGym ? SFGym.prCount() : 0, rings: b.active >= G.kcal && b.min >= G.min, sleep: window.SFSomnia ? SFSomnia.has() : false };
}
function checkMedals(quiet){
  const t = totals(), s = streaks(), x = medalState(), fresh = [];
  MEDALS.forEach(m => { if (!medals[m[0]] && m[4](t, s, x)){ medals[m[0]] = todayISO(); fresh.push(m); } });
  if (fresh.length){
    save('sf_medals', medals);
    if (!quiet) setTimeout(() => showMedal(fresh), 900);
  }
  return fresh;
}
function showMedal(list){
  const m = list[0];
  openForm(`<div class="sfmedalwin"><div class="big">${m[1]}</div><small>MEDALLA NUEVA${list.length > 1 ? ' · y ' + (list.length - 1) + ' más' : ''}</small><h3>${esc(m[2])}</h3><p>${esc(m[3])}</p>
    <div class="who">${SFArt.badge('samy', 46)}<span>¡Qué berraquera! Samy te guarda esta medalla en <b>Progreso</b>.</span></div>
    <button class="btn pri" id="mdOk" style="width:100%;--bc:#f59e0b">¡VAMOS!</button></div>`, sh => sh.querySelector('#mdOk').addEventListener('click', closeForm));
  Sound.win(); confetti('#f59e0b');
}

/* ---------- Al terminar cualquier entreno ---------- */
function onTrain(h){
  const s = streaks();
  if (current === 'home' && window.SFToday) SFToday.render();
  const fresh = checkMedals();
  if (!fresh.length && s.day >= 2 && sessLog.filter(x => x.d === h.d).length === 1) setTimeout(() => toast(`🔥 Racha de ${s.day} días`), 1200);
  if (window.SFRemind) SFRemind.sync();
}

/* ---------- Agua ---------- */
function addWater(ml, ds){
  ds = ds || todayISO();
  const before = water[ds] || 0;
  water[ds] = Math.max(0, before + ml); if (!water[ds]) delete water[ds];
  save('sf_water', water); hapticTap();
  if (before < waterGoal() && (water[ds] || 0) >= waterGoal()){ toast('💧 ¡Meta de agua cumplida!'); confetti('#38bdf8'); checkMedals(); }
}

/* ---------- Pasos (sensor del teléfono, si lo hay; si no, a mano) ---------- */
const StepsP = plugin('Steps');
let stepState = load('sf_stepc', null);  // { c: contador del sensor, boot: hora de encendido, ts: última lectura }
let stepsOn = false;
function splitSteps(n, fromTs, toTs){
  // Reparte los pasos entre los días que pasaron desde la última lectura, según las horas de cada día
  if (n <= 0) return;
  const span = Math.max(1, toTs - fromTs);
  let cur = fromTs;
  while (cur < toTs){
    const d = new Date(cur), end = Math.min(toTs, new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime());
    const ds = iso(d); steps[ds] = Math.round((steps[ds] || 0) + n * (end - cur) / span);
    cur = end;
  }
  save('sf_steps', steps);
}
async function readSteps(ask){
  if (!StepsP || !S.stepSensor) return false;
  try {
    if (ask){ const p = await StepsP.requestPermissions(); if (p && p.activity && p.activity !== 'granted'){ toast('Sin permiso de actividad física no se pueden contar los pasos'); return false; } }
    const r = await StepsP.read();
    if (!r || r.steps == null || r.steps < 0) return false;
    const now = Date.now(), prev = stepState;
    if (prev && Math.abs((prev.boot || 0) - r.boot) < 120000 && r.steps >= prev.c){
      const delta = r.steps - prev.c;
      if (delta > 0 && delta < 150000) splitSteps(delta, Math.max(prev.ts, now - 3 * 864e5), now);
    } else if (prev && r.boot > prev.ts){
      splitSteps(Math.min(r.steps, 150000), Math.max(r.boot, now - 864e5), now);   // el teléfono se reinició: cuenta lo que lleva desde que encendió
    }
    stepState = { c: r.steps, boot: r.boot, ts: now }; save('sf_stepc', stepState);
    stepsOn = true;
    return true;
  } catch(e){ return false; }
}
async function enableSteps(on){
  S.stepSensor = !!on; saveSettings();
  if (!on) return false;
  if (!StepsP){ toast('El contador automático funciona en la app instalada en el teléfono'); S.stepSensor = false; saveSettings(); return false; }
  try { const a = await StepsP.available(); if (!a || !a.available){ toast('Este teléfono no tiene sensor de pasos; anótalos a mano'); S.stepSensor = false; saveSettings(); return false; } } catch(e){}
  stepState = null;                       // la primera lectura solo marca el punto de partida
  const ok = await readSteps(true);
  if (!ok){ S.stepSensor = false; saveSettings(); } else toast('Contador de pasos activado');
  return ok;
}
function openStepsForm(){
  const t = todayISO(), v = { n: steps[t] || 0 };
  openForm(`<h3 class="ftitle">👟 PASOS DE HOY</h3>
    <p class="hint">${S.stepSensor ? 'El teléfono los cuenta solo cada vez que abres la app. Aquí puedes corregirlos.' : 'Escribe los pasos que marca tu reloj o tu teléfono, o activa el contador automático.'}</p>
    <div class="field"><span>Pasos</span><div class="stepper big" id="stN"></div></div>
    <div class="row" style="border:0"><div class="l"><b>Contar con el teléfono</b><small>Usa el sensor de pasos del celular (pide permiso de actividad física)</small></div><button class="switch ${S.stepSensor ? 'on' : ''}" id="stAuto"></button></div>
    <div class="field"><span>Meta diaria</span><div class="stepper" id="stG"></div></div>
    <div class="btnrow"><button class="btn" id="stC">CANCELAR</button><button class="btn pri" id="stS" style="--bc:#38bdf8">GUARDAR</button></div>`, sh => {
    makeStepper(sh.querySelector('#stN'), { get:() => v.n, set:x => v.n = Math.round(x), min:0, max:99999, step:500, input:true, label:'Pasos' });
    makeStepper(sh.querySelector('#stG'), { get:() => G.steps, set:x => G.steps = Math.round(x), min:1000, max:40000, step:500, input:true, label:'Meta de pasos' });
    sh.querySelector('#stAuto').addEventListener('click', async e => { const b = e.currentTarget, on = !b.classList.contains('on'); b.classList.toggle('on', on); const ok = await enableSteps(on); if (on && !ok) b.classList.remove('on'); });
    sh.querySelector('#stC').addEventListener('click', closeForm);
    sh.querySelector('#stS').addEventListener('click', () => { const i = sh.querySelector('#stN input'); if (i) i.blur(); if (v.n) steps[t] = v.n; else delete steps[t]; save('sf_steps', steps); saveG(); closeForm(); if (current === 'home') SFToday.render(); checkMedals(); });
  });
}

/* ---------- Registrar una actividad a mano ---------- */
const GROUPS = [['box', '🥊 BOXEO'], ['gym', '🏋️ GIMNASIO'], ['cardio', '🏃 CARDIO Y DEPORTES']];
function openActForm(date, preset){
  date = date || todayISO();
  if (date > todayISO()) return toast('Solo se puede registrar hasta hoy');
  const lastM = sessLog.filter(h => h.manual && h.a).slice(-1)[0];
  const rec = { d: date, a: preset || (lastM ? lastM.a : (S.disc === 'gym' ? 'w_mod' : 'box_class')), m: lastM && !preset ? (lastM.m || 60) : 60, r: 0, i: 2, note: '' };
  let grp = (ACT[rec.a] || ACT.box_class).g;
  openForm(`<h3 class="ftitle">+ ACTIVIDAD</h3>
    <p class="hint">Suma a tus calorías, tus minutos y tu racha aunque no hayas usado el timer de la app.</p>
    <div class="seg" id="acG">${GROUPS.map(g => `<button type="button" data-g="${g[0]}">${g[1]}</button>`).join('')}</div>
    <div class="typechips sfacts" id="acL"></div>
    <div class="frow"><div class="field"><span>Minutos</span><div class="stepper" id="acM"></div></div><div class="field" id="acRw"><span>Rounds (opcional)</span><div class="stepper" id="acR"></div></div></div>
    <div class="field"><span>¿Qué tan duro estuvo?</span><div class="seg" id="acI"><button type="button" data-i="1">SUAVE</button><button type="button" data-i="2">NORMAL</button><button type="button" data-i="3">FUERTE</button></div></div>
    <div class="sfkcalprev"><b id="acK">0</b><span>kcal activas, más o menos</span></div>
    <div class="frow"><label class="field"><span>Fecha</span><input type="date" id="acD" value="${rec.d}" max="${todayISO()}"></label><label class="field"><span>Nota (opcional)</span><input id="acN" maxlength="60" placeholder="Ej: con el profe"></label></div>
    <div class="btnrow"><button class="btn" id="acC">CANCELAR</button><button class="btn pri" id="acS" style="--bc:#22c55e">GUARDAR</button></div>`, sh => {
    const prev = () => { sh.querySelector('#acK').textContent = nf(kcalCalc({ a: rec.a, m: rec.m, i: rec.i, manual: true })); };
    const paintL = () => {
      sh.querySelectorAll('#acG [data-g]').forEach(b => b.classList.toggle('on', b.dataset.g === grp));
      sh.querySelector('#acL').innerHTML = D.ACTS.filter(a => a[4] === grp && a[0] !== 'box_timer' && a[0] !== 'box_session').map(a => `<button type="button" data-a="${a[0]}" class="${a[0] === rec.a ? 'on' : ''}" style="--c:var(--mode)">${a[2]} ${a[1]}</button>`).join('');
      sh.querySelectorAll('#acL [data-a]').forEach(b => b.addEventListener('click', () => { rec.a = b.dataset.a; sh.querySelectorAll('#acL [data-a]').forEach(x => x.classList.toggle('on', x === b)); prev(); }));
      sh.querySelector('#acRw').style.visibility = grp === 'box' ? '' : 'hidden';
    };
    sh.querySelectorAll('#acG [data-g]').forEach(b => b.addEventListener('click', () => { grp = b.dataset.g; if ((ACT[rec.a] || {}).g !== grp) rec.a = D.ACTS.find(a => a[4] === grp && a[0] !== 'box_timer')[0]; paintL(); prev(); }));
    const paintI = () => sh.querySelectorAll('#acI [data-i]').forEach(b => b.classList.toggle('on', +b.dataset.i === rec.i));
    sh.querySelectorAll('#acI [data-i]').forEach(b => b.addEventListener('click', () => { rec.i = +b.dataset.i; paintI(); prev(); }));
    makeStepper(sh.querySelector('#acM'), { get:() => rec.m, set:v => rec.m = Math.round(v), min:1, max:600, step:5, input:true, label:'Minutos', onChange:prev });
    makeStepper(sh.querySelector('#acR'), { get:() => rec.r, set:v => rec.r = Math.round(v), min:0, max:60, input:true, label:'Rounds' });
    paintL(); paintI(); prev();
    sh.querySelector('#acC').addEventListener('click', closeForm);
    sh.querySelector('#acS').addEventListener('click', () => {
      sh.querySelectorAll('input').forEach(i => i.blur());
      const d = sh.querySelector('#acD').value || todayISO(); if (d > todayISO()) return toast('Esa fecha todavía no llega');
      const a = ACT[rec.a];
      logTrain({ d, p: a.n, a: a.k, t: a.g, m: rec.m, r: grp === 'box' ? rec.r : 0, i: rec.i, note: sh.querySelector('#acN').value.trim(), manual: true });
      stats.sessions++; stats.rounds += grp === 'box' ? rec.r : 0; stats.trainSec = (stats.trainSec || 0) + rec.m * 60; save('stats', stats);
      closeForm(); Sound.win(); confetti('#22c55e'); toast(`¡Guardado! ≈${nf(lastTrain.k)} kcal 💪`);
      if (current === 'calendar') renderCalendar(); else if (current === 'home') SFToday.render(); else if (current === 'train' && window.SFTrain) SFTrain.render();
    });
  });
}

/* ---------- Metas del día ---------- */
function openGoalsForm(){
  const g = Object.assign({}, G); if (!g.days) g.days = weekGoal(); const wAuto = !G.water; g.water = waterGoal();
  openForm(`<h3 class="ftitle">🎯 MIS METAS</h3>
    <p class="hint">Los anillos de Hoy se llenan con estas metas. Ponlas retadoras pero alcanzables.</p>
    <div class="row" style="border:0"><div class="l"><b>Calorías activas</b><small>Lo que quemas moviéndote, sin contar el reposo</small></div><div class="stepper" id="gK"></div></div>
    <div class="row"><div class="l"><b>Minutos activos</b><small>La OMS recomienda al menos 150 a la semana</small></div><div class="stepper" id="gM"></div></div>
    <div class="row"><div class="l"><b>Pasos</b></div><div class="stepper" id="gS"></div></div>
    <div class="row"><div class="l"><b>Agua (ml)</b><small>${wAuto ? 'Calculada con tu peso: 35 ml por kilo' : 'Puesta por ti'}</small></div><div class="stepper" id="gW"></div></div>
    <div class="row"><div class="l"><b>Días de entreno por semana</b><small>Para la racha semanal. Los demás días son descanso y no rompen la racha.</small></div><div class="stepper" id="gD"></div></div>
    <div class="btnrow" style="margin-top:10px"><button class="btn" id="gC">CANCELAR</button><button class="btn pri" id="gOk" style="--bc:var(--mode)">GUARDAR</button></div>`, sh => {
    let wTouched = false;
    makeStepper(sh.querySelector('#gK'), { get:() => g.kcal, set:v => g.kcal = Math.round(v), min:50, max:3000, step:50, input:true, label:'Calorías activas' });
    makeStepper(sh.querySelector('#gM'), { get:() => g.min, set:v => g.min = Math.round(v), min:5, max:300, step:5, input:true, label:'Minutos' });
    makeStepper(sh.querySelector('#gS'), { get:() => g.steps, set:v => g.steps = Math.round(v), min:1000, max:40000, step:500, input:true, label:'Pasos' });
    makeStepper(sh.querySelector('#gW'), { get:() => g.water, set:v => g.water = Math.round(v), min:500, max:8000, step:250, input:true, label:'Agua', onChange:() => wTouched = true });
    makeStepper(sh.querySelector('#gD'), { get:() => g.days, set:v => g.days = Math.round(v), min:1, max:7 });
    sh.querySelector('#gC').addEventListener('click', closeForm);
    sh.querySelector('#gOk').addEventListener('click', () => {
      sh.querySelectorAll('input').forEach(i => i.blur());
      G.kcal = g.kcal; G.min = g.min; G.steps = g.steps; G.days = g.days; if (wTouched || !wAuto) G.water = g.water;
      saveG(); closeForm(); toast('Metas guardadas'); if (VIEW_RENDER[current]) VIEW_RENDER[current](); else if (current === 'home') SFToday.render(); else if (current === 'settings') renderSettings();
    });
  });
}

/* ---------- Piezas de interfaz compartidas ---------- */
// Anillo de progreso (SVG). pct puede pasar de 1: el anillo da otra vuelta más clara.
function ring(pct, color, size, sw, inner){
  size = size || 120; sw = sw || 12; const r = (size - sw) / 2, c = 2 * Math.PI * r, p = clamp(pct || 0, 0, 1), over = clamp((pct || 0) - 1, 0, 1);
  return `<svg class="sfring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="--rc:${color}">
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--hl2)" stroke-width="${sw}"/>
    <circle class="fg" cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - p)).toFixed(1)}" transform="rotate(-90 ${size/2} ${size/2})" style="--c0:${c.toFixed(1)}"/>
    ${over > 0 ? `<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="${sw * 0.45}" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - over)).toFixed(1)}" transform="rotate(-90 ${size/2} ${size/2})"/>` : ''}
  </svg>${inner ? `<div class="sfringin">${inner}</div>` : ''}`;
}
// Barras de los últimos días: data = [{ l: etiqueta, v: valor, hi: resaltada }]
function bars(data, color, goal, unit){
  const mx = Math.max(goal || 0, ...data.map(d => d.v), 1);
  return `<div class="sfbars" style="--bc:${color}">${goal ? `<i class="goal" style="bottom:${(goal / mx * 100).toFixed(1)}%"><em>${nf(goal)}${unit ? ' ' + unit : ''}</em></i>` : ''}${data.map(d => `<div class="b ${d.hi ? 'hi' : ''} ${goal && d.v >= goal ? 'ok' : ''}"><span>${d.v ? nf(d.v) : ''}</span><i style="height:${Math.max(d.v ? 3 : 0, d.v / mx * 100).toFixed(1)}%"></i><small>${d.l}</small></div>`).join('')}</div>`;
}
// Línea simple para tendencias: pts = [{ x: etiqueta, v }]
function lineChart(pts, color, opt){
  opt = opt || {};
  if (pts.length < 2) return `<p class="empty">${opt.empty || 'Con 2 registros o más verás la gráfica.'}</p>`;
  const W = 340, H = 140, px = 28, py = 16, vals = pts.map(p => p.v).concat(opt.goal ? [opt.goal] : []);
  let mn = Math.min(...vals), mx = Math.max(...vals); if (mx - mn < (opt.minSpan || 2)){ mn -= (opt.minSpan || 2) / 2; mx += (opt.minSpan || 2) / 2; }
  const x = i => px + i * (W - px * 2) / (pts.length - 1), y = v => py + (mx - v) / (mx - mn) * (H - py * 2);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.v).toFixed(1)).join(' ');
  const id = 'lg' + Math.random().toString(36).slice(2, 7);
  return `<svg viewBox="0 0 ${W} ${H}" class="wtsvg"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".35"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    ${opt.goal ? `<line x1="${px}" x2="${W - px}" y1="${y(opt.goal)}" y2="${y(opt.goal)}" stroke="#facc15" stroke-dasharray="5 5" stroke-width="1.5"/>` : ''}
    <path d="${d} L${x(pts.length - 1).toFixed(1)} ${H - py} L${x(0).toFixed(1)} ${H - py} Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="wtline"/>
    ${pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.v)}" r="${i === pts.length - 1 ? 5 : 2.6}" fill="${i === pts.length - 1 ? 'var(--text)' : color}"/>`).join('')}
    <text x="${px}" y="${H - 2}" fill="#71717a" font-size="11" font-weight="700">${pts[0].x}</text><text x="${W - px}" y="${H - 2}" text-anchor="end" fill="#71717a" font-size="11" font-weight="700">${pts[pts.length - 1].x}</text>
    <text x="${W - px}" y="${y(pts[pts.length - 1].v) - 9}" text-anchor="end" fill="var(--text)" font-size="13" font-weight="700">${opt.fmt ? opt.fmt(pts[pts.length - 1].v) : n1(pts[pts.length - 1].v)}</text></svg>`;
}
// Crea una vista (pantalla) nueva con su barra de título
const BACK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M15 5l-7 7 7 7"/></svg>';
function view(id, title, opt){
  opt = opt || {};
  let el = document.getElementById(id);
  if (!el){
    el = document.createElement('section'); el.className = 'view'; el.id = id;
    el.innerHTML = `<div class="topbar">${opt.back ? `<button class="iconbtn" data-sfback aria-label="Atrás">${BACK_SVG}</button>` : ''}<div class="title" id="${id}Title">${title}</div>${opt.action ? `<button class="smallbtn" id="${id}Act">${opt.action}</button>` : ''}</div><div id="${id}Body"></div>`;
    document.getElementById('nav').before(el);
    const bk = el.querySelector('[data-sfback]'); if (bk) bk.addEventListener('click', () => { hapticTap(); handleBack(); });
  }
  if (opt.parent) NAV_PARENT[id] = opt.parent;
  if (opt.backTo) BACK_TO[id] = opt.backTo;
  if (opt.render) VIEW_RENDER[id] = opt.render;
  if (opt.hideNav && !NAV_HIDE.includes(id)) NAV_HIDE.push(id);
  return el;
}
// Un guía Satronho hablando (para consejos y pantallas vacías)
const says = (id, text) => `<div class="sfsays">${SFArt.badge(id, 52)}<div class="bub"><b style="color:${SFArt.GUIDES[id].color}">${SFArt.GUIDES[id].name}</b><p>${text}</p></div></div>`;

window.SF = { ACT, G, saveG, nf, n1, hm, kg, ageY, bmr, profileMissing, waterGoal, weekGoal, kcalCalc, fillKcal, kcalOf, minOf, dayBurn, dayStripHTML, stepKcal,
  streaks, isRest, mondayOf, weekDays, totals, MEDALS, medals: () => medals, checkMedals, onTrain, water: () => water, addWater, steps: () => steps, readSteps, enableSteps, stepsOn: () => stepsOn, openStepsForm,
  openGoalsForm, ring, bars, lineChart, view, says, BACK_SVG };
window.SFAct = { openForm: openActForm };
})();
