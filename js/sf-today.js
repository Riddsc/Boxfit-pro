/* =========================================================
   SATRONHO BOXFIT · INICIO Y METAS
   · Inicio: saludo y siete botones (Entrenar, Comida, Progreso, Salud,
     Arma tu semana, Metas y Ajustes). La barra de abajo es la racha.
   · Metas: Hoy (anillos, energía y diario del día), Mi meta (modo meta)
     y Rachas.
   ========================================================= */
(function(){
const { nf, n1, hm, G } = SF;
const K = '#d98a78', MI = '#7fb38a', ST = '#7aa9d1';
const first = () => me.name ? me.name.trim().split(/\s+/)[0] : '';

function greeting(s){
  const h = new Date().getHours(), hi = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
  let sub;
  if (s.today) sub = 'Ya entrenaste hoy. ¡Así se hace!';
  else if (s.restToday) sub = 'Hoy es descanso: recupérate, come bien y toma agua.';
  else sub = h < 12 ? '¿Qué entrenamos hoy?' : h < 19 ? 'Todavía hay tiempo de entrenar hoy.' : 'Un entreno corto también cuenta.';
  return `<h1 class="hello sfhello">${hi}${first() ? ',<br><em data-notr>' + esc(first()) + '</em>' : ''}</h1><p class="sub">${sub}</p>`;
}
const DAYL = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
function weekDots(){
  const mon = SF.mondayOf(todayISO()), t = todayISO();
  return [0, 1, 2, 3, 4, 5, 6].map(i => { const d = addDays(mon, i), st = dayStatus(d);
    const cls = trainedOn(d) ? 'tr' : d > t ? (st === 'pl' ? 'pl' : '') : SF.isRest(d) ? 'rs' : d === t ? 'now' : 'ms';
    return `<i class="${cls} ${d === t ? 'today' : ''}"><em>${dayLetter(i)}</em>${trainedOn(d) ? '✓' : cls === 'rs' ? '·' : ''}</i>`; }).join('');
}
const dayLetter = i => (window.SFI18n && SFI18n.dayLetters) ? SFI18n.dayLetters[i] : DAYL[i];

/* ---------- Inicio ---------- */
function render(){
  const body = $('#homeBody'); if (!body) return;
  const t = todayISO(), s = SF.streaks(), b = SF.dayBurn(t), food = SFNutri.dayTotals(t), goal = SFNutri.dayGoal(t), w = SF.water()[t] || 0;
  const rd = window.SFSomnia ? SFSomnia.readiness() : null, lh = SFHealth.lastHR(), pts = SFHealth.cardioPts(t);
  const wkTrain = sessLog.filter(h => h.d >= SF.mondayOf(t)).length, tp = SFPlan.todayPlan(), gi = SFPlan.goalInfo(), miss = SF.profileMissing();
  const btn = (id, ic, title, val, line, c, i, cls) => `<button class="sfhub ${cls || ''}" data-hub="${id}" style="--c:${c};--i:${i}"><span class="ic">${ic}</span><b>${title}</b>${val ? `<em class="val">${val}</em>` : ''}<small>${line}</small></button>`;
  const left = Math.max(0, goal.k - food.k), lw = lastWeight(), md = Object.keys(SF.medals()).length;
  body.innerHTML = `
    ${greeting(s)}
    ${SFTrain.liveBannerHTML()}
    ${SFGym.isLive() ? `<button class="sflive" id="hmGym" style="width:100%"><span class="ic">🏋️</span><span class="l"><small>RUTINA DE PESAS EN CURSO</small><b>Toca para seguir</b></span><span class="arrow">›</span></button>` : ''}
    <div class="sfhubs">
      ${btn('train', '🥊', 'ENTRENAR', String(wkTrain), wkTrain === 1 ? 'entreno esta semana' : 'entrenos esta semana', 'var(--s-train)', 1)}
      ${btn('nutri', '🍽️', 'COMIDA', nf(left), `kcal restantes · 💧 ${n1(w / 1000)} L`, 'var(--s-nutri)', 2)}
      ${btn('progress', '📈', 'PROGRESO', lw ? fmtKg(lw.kg) + ' kg' : String(md), lw ? (md === 1 ? '1 medalla' : md + ' medallas') : (md === 1 ? 'medalla' : 'medallas'), 'var(--s-progress)', 3)}
      ${btn('health', '❤️', 'SALUD', nf(b.steps), `pasos${lh ? ' · ' + lh.bpm + ' lpm' : ''}${rd ? ' · 🌙 ' + rd.v : ''}`, 'var(--s-health)', 4)}
      ${btn('week', '🗓️', 'ARMA TU SEMANA', '', tp ? 'Hoy toca: ' + SFPlan.TYPES[tp.t][0].toLowerCase() : 'Elige qué entrenas cada día', 'var(--s-week)', 5, 'wide')}
      ${btn('goals', '🎯', 'METAS', '', gi ? `${nf(b.active)} de ${nf(G.kcal)} kcal · ${gi.done ? 'meta lograda' : gi.daysLeft + ' días para tu meta'}` : `${nf(b.active)} de ${nf(G.kcal)} kcal activas hoy`, 'var(--s-goals)', 6, 'wide')}
      ${btn('settings', '⚙️', 'AJUSTES', '', miss.length ? 'Completa tu perfil' : 'Perfil, acompañante, idioma y más', 'var(--s-settings)', 7, 'wide slim')}
    </div>
    ${setupHTML(miss)}`;
  bindSetup(body);
  body.querySelectorAll('[data-hub]').forEach(x => x.addEventListener('click', () => { hapticTap(); go(x.dataset.hub); }));
  const gy = body.querySelector('#hmGym'); if (gy) gy.addEventListener('click', () => go('gymLive'));
  SFTrain.bindLiveBanner(body);
  if (current === 'home') renderNav();
}
// Lista de bienvenida (como la de Google): se va sola cuando todo está listo o si la ocultas
function setupItems(miss){
  return [
    ['me', '👤', 'Completa tu perfil', 'Con tu peso, altura, edad y género las calorías salen exactas', !miss.length],
    ['steps', '👟', 'Activa los pasos automáticos', 'El teléfono los cuenta solo, aunque la app esté cerrada', !!S.stepSensor],
    ['goals', '🎯', 'Pon tus metas del día', 'Calorías activas, minutos y pasos a tu medida', load('sf_goals', null) != null],
    ['sleep', '🌙', 'Arma tu horario de sueño', 'Cuánto quieres dormir y a qué hora te levantas', !!(SFHealth.sleepPlan() || {}).wake],
  ];
}
function setupHTML(miss){
  if (S.setupHide) return '';
  const it = setupItems(miss), done = it.filter(x => x[4]).length;
  if (done === it.length) return '';
  const open = S.setupOpen !== false;
  return `<div class="sfsetup ${open ? 'open' : ''}"><button class="hd" id="suTog"><span class="cnt" data-notr>${done}/${it.length}</span><b>¡Bienvenido! Arranquemos</b><span class="chev">${open ? '⌃' : '⌄'}</span></button>
    ${open ? `${it.map(x => `<button class="it ${x[4] ? 'ok' : ''}" data-su="${x[0]}"><span class="ic">${x[1]}</span><span class="l"><b>${x[2]}</b><small>${x[3]}</small></span><span class="ck">${x[4] ? '✓' : ''}</span></button>`).join('')}
    <button class="btn" id="suHide" style="width:100%;margin-top:8px">OCULTAR</button>` : ''}</div>`;
}
function bindSetup(body){
  const tg = body.querySelector('#suTog'); if (!tg) return;
  tg.addEventListener('click', () => { S.setupOpen = S.setupOpen === false; saveSettings(); hapticTap(); render(); });
  const hd = body.querySelector('#suHide'); if (hd) hd.addEventListener('click', () => { S.setupHide = true; saveSettings(); render(); });
  body.querySelectorAll('[data-su]').forEach(b => b.addEventListener('click', async () => {
    hapticTap(); const k = b.dataset.su;
    if (k === 'me') go('me');
    else if (k === 'steps'){ if (!S.stepSensor && await SF.enableSteps(true)) render(); else SFNav.go('health:steps'); }
    else if (k === 'goals') SF.openGoalsForm();
    else SFNav.go('health:sleep');
  }));
}
// La barra de abajo del Inicio: la racha
function streakBar(){
  const s = SF.streaks();
  return `<button class="sfnavstreak ${s.today ? 'lit' : ''}" id="navStreak"><span class="fl">🔥</span><span class="n">${s.day}</span>
    <span class="l"><b>${s.day === 1 ? 'DÍA DE RACHA' : 'DÍAS DE RACHA'}</b><span class="wk">${weekDots()}</span></span><span class="arrow">›</span></button>`;
}

/* ---------- Metas ---------- */
const TITLES = { today: 'METAS DE HOY', target: 'MI META', streak: 'RACHAS' };
SF.view('goals', 'METAS DE HOY', { render: renderGoals, back: true });
function renderGoals(){
  const tab = SFNav.tab.goals, body = $('#goalsBody');
  $('#goalsTitle').textContent = TITLES[tab];
  if (tab === 'target') renderTarget(body); else if (tab === 'streak') renderStreak(body); else renderToday(body);
}
function renderToday(body){
  const t = todayISO(), b = SF.dayBurn(t), s = SF.streaks(), miss = SF.profileMissing();
  const week = []; for (let i = 6; i >= 0; i--){ const d = addDays(t, -i); week.push({ l: WD[parseISO(d).getDay()], v: SF.dayBurn(d).active, hi: d === t }); }
  body.innerHTML = `
    ${miss.length ? `<button class="calcard" data-open="me" style="--c:#9d8fd0"><span class="calic">👤</span><span class="l"><b>COMPLETA TU PERFIL</b><small>Falta: ${miss.join(', ')}. Con eso tus calorías salen exactas.</small></span><span class="arrow">›</span></button>` : ''}
    <button class="sect sfrings" id="gtRings" aria-label="Metas del día">
      <div class="rg"><div class="r1">${SF.ring(b.active / G.kcal, K, 150, 14)}</div><div class="r2">${SF.ring(b.min / G.min, MI, 110, 14)}</div><div class="r3">${SF.ring(b.steps / G.steps, ST, 70, 14)}</div></div>
      <div class="lg">
        <div style="--c:${K}"><b>${nf(b.active)}<small> / ${nf(G.kcal)}</small></b><span>🔥 Calorías activas</span></div>
        <div style="--c:${MI}"><b>${nf(b.min)}<small> / ${G.min} min</small></b><span>⏱️ Minutos activos</span></div>
        <div style="--c:${ST}"><b>${nf(b.steps)}<small> / ${nf(G.steps)}</small></b><span>👟 Pasos</span></div>
      </div>
    </button>
    <button class="btn pri" id="gtEdit" style="width:100%;flex:none;margin-bottom:14px;--bc:#dc9a6e">🎯 CAMBIAR MIS METAS DEL DÍA</button>
    <div class="sfquickrow">
      <button id="gtWater" style="--c:#7aa9d1"><span>💧</span>+ AGUA</button>
      <button id="gtFood" style="--c:#7fb38a"><span>🍽️</span>+ COMIDA</button>
      <button id="gtAct" style="--c:#d6a660"><span>📝</span>+ ACTIVIDAD</button>
      <button id="gtSteps" style="--c:#6fa8c4"><span>👟</span>PASOS</button>
    </div>
    <div class="sect"><h4>DIARIO DE HOY</h4>
      ${b.acts.length ? b.acts.map(h => `<div class="evrow" style="--c:${h.t === 'gym' ? '#9d8fd0' : h.t === 'cardio' ? '#6fb0b6' : '#dc9a6e'}"><i></i><span class="l"><b>${(SF.ACT[h.a] || {}).ic || (h.t === 'gym' ? '🏋️' : '🥊')} ${esc(h.p)}</b><small>${hm(SF.minOf(h))}${h.r ? ' · ' + h.r + ' rounds' : ''}${h.sets ? ' · ' + h.sets + ' series' : ''}${h.note ? ' · ' + esc(h.note) : ''}</small></span><em class="kc">${nf(SF.kcalOf(h))}<small> kcal</small></em><button class="xbtn" data-hl="${sessLog.indexOf(h)}">×</button></div>`).join('')
        : `<p class="empty">${s.restToday ? 'Hoy es descanso. Si entrenas igual, aquí aparece.' : 'Aún no hay entrenos hoy. Dale al timer, a una rutina o anota una actividad.'}</p>`}
    </div>
    <div class="sect"><h4>CALORÍAS ACTIVAS · 7 DÍAS</h4>${SF.bars(week, K, G.kcal, '')}</div>`;
  body.querySelectorAll('[data-open]').forEach(x => x.addEventListener('click', () => { hapticTap(); go(x.dataset.open); }));
  body.querySelector('#gtRings').addEventListener('click', () => SF.openGoalsForm());
  body.querySelector('#gtEdit').addEventListener('click', () => SF.openGoalsForm());
  body.querySelector('#gtWater').addEventListener('click', () => { SF.addWater(250); toast(`💧 +250 ml · ${n1((SF.water()[t] || 0) / 1000)} L`); keepY(); });
  body.querySelector('#gtFood').addEventListener('click', () => { SFNav.tab.nutri = 'diary'; go('nutri'); setTimeout(() => SFNutri.openAdd(), 250); });
  body.querySelector('#gtAct').addEventListener('click', () => SFAct.openForm(t));
  body.querySelector('#gtSteps').addEventListener('click', () => SF.openStepsForm());
  body.querySelectorAll('[data-hl]').forEach(x => x.addEventListener('click', async () => { const h = sessLog[+x.dataset.hl]; if (h && await confirmDlg('¿Quitar este entreno?', 'Se descontará de tus calorías y estadísticas.', 'QUITAR')){ removeSessLog(h); renderGoals(); } }));
}
function renderTarget(body){
  const lw = lastWeight();
  body.innerHTML = `${SFPlan.goalCardHTML()}
    <div class="tiles">
      <button class="tile" style="--c:#7fb38a;--i:1" id="gmW"><span>⚖️</span><b>MI PESO</b><small>${lw ? fmtKg(lw.kg) + ' kg' : 'Regístralo'}</small></button>
      <button class="tile" style="--c:#9d8fd0;--i:2" id="gmN"><span>🍽️</span><b>PLAN DE COMIDA</b><small>${nf(SFNutri.targets().k)} kcal al día</small></button></div>
    ${SFPets.says(null, 'Una buena meta tiene fecha y es realista: bajar o subir más de 1 % de tu peso por semana te hace perder músculo y fuerza.')}`;
  SFPlan.bindGoalCard(body);
  body.querySelector('#gmW').addEventListener('click', () => go('weight'));
  body.querySelector('#gmN').addEventListener('click', () => SFNav.go('nutri:plan'));
}
function renderStreak(body){
  const s = SF.streaks(), md = SF.medals(), n = Object.keys(md).length;
  const row = (ic, tt, v, sub, c) => `<div class="row"><span class="pic" style="--c:${c}">${ic}</span><span class="l"><b>${tt}</b><small>${sub}</small></span><b class="big">${v}</b></div>`;
  const free = 7 - s.weekGoal;
  body.innerHTML = `
    <div class="sect sfstreak ${s.today ? 'lit' : ''}" style="display:flex">
      <div class="fl"><span class="flame">🔥</span><b>${s.day}</b></div>
      <div class="l"><b>${s.day === 1 ? '1 DÍA DE RACHA' : s.day + ' DÍAS DE RACHA'}</b><small>${s.today ? '¡Hoy ya sumaste!' : s.restToday ? 'Hoy es descanso: la racha sigue viva' : s.day ? 'Entrena hoy para no perderla' : 'Entrena hoy y enciéndela'}</small>
        <div class="wk">${weekDots()}</div></div></div>
    <div class="sect">
      ${row('🔥', 'Racha de entrenos', s.day, s.bestDay === 1 ? 'Tu mejor racha: 1 día' : `Tu mejor racha: ${s.bestDay} días`, '#dc9a6e')}
      ${row('📅', 'Semanas cumpliendo', s.week, `Esta semana: ${s.weekDone} de ${s.weekGoal} entrenos`, '#9d8fd0')}
      ${row('🥗', 'Días anotando comida', s.food, 'Seguidos, contando hoy o ayer', '#7fb38a')}
      ${row('💧', 'Días cumpliendo el agua', s.water, 'Seguidos, contando hoy o ayer', '#7aa9d1')}
      <div class="row"><span class="pic" style="--c:#7aa9d1">🧊</span><span class="l"><b>Comodín semanal</b><small>${!s.freezeOn ? 'Apagado.' : s.freezeUsed ? 'Ya lo usaste esta semana.' : 'Disponible esta semana.'} Si un día se te pasa entrenar, salva tu racha. Hay uno por semana.</small></span><button class="switch ${s.freezeOn ? 'on' : ''}" id="skFreeze"></button></div>
    </div>
    ${SFPets.says('samy', me.plan.length ? 'Los días que no son de entreno en tu semana cuentan como descanso y no rompen la racha.' : free === 1 ? 'Como entrenas 6 días por semana, te perdono 1 día libre cada semana sin romper la racha.' : `Como entrenas ${s.weekGoal} días por semana, te perdono ${free} días libres cada semana sin romper la racha.`)}
    <button class="btn" id="skMed" style="width:100%;flex:none;margin-bottom:10px">🏅 MIS MEDALLAS (${n})</button>
    <button class="btn" id="skWeek" style="width:100%;flex:none">🗓️ ARMA TU SEMANA</button>`;
  body.querySelector('#skFreeze').addEventListener('click', e => { S.freeze = S.freeze === false; saveSettings(); renderGoals(); });
  body.querySelector('#skMed').addEventListener('click', () => SFNav.go('progress:med'));
  body.querySelector('#skWeek').addEventListener('click', () => go('week'));
}
function keepY(){ const v = $('#' + current), y = v.scrollTop; VIEW_RENDER[current] ? VIEW_RENDER[current]() : render(); v.scrollTop = y; }
const openStreaks = () => SFNav.go('goals:streak');
$('#streakChip').style.display = 'none';
Object.assign(GUIDE, {
  home: () => ({ t:'el inicio', b:[`<p>Desde aquí vas a todo: <b>Entrenar</b>, <b>Comida</b>, <b>Progreso</b>, <b>Salud</b>, <b>Arma tu semana</b>, <b>Metas</b> y <b>Ajustes</b>.</p>`, `<p>Abajo está tu <b>racha</b>: tócala para ver el detalle.</p>`, `<p class="tip">Dentro de cada apartado, la barra de abajo cambia y siempre tiene Inicio y Ajustes.</p>`] }),
  goals: () => ({ t:'tus metas', b:[`<p><b>Hoy:</b> los anillos de calorías, minutos y pasos, y todo lo que hiciste hoy.</p>`, `<p><b>Mi meta:</b> llegar a un peso en una fecha, o dar el peso de una pelea.</p>`, `<p><b>Rachas:</b> tus días seguidos y el comodín semanal.</p>`] }),
});
window.SFToday = { render, openStreaks, streakBar, weekDots };
})();
