/* =========================================================
   SATRONHO BOXFIT · INICIO Y METAS
   · Inicio: saludo y siete botones (Entrenar, Comida, Progreso, Salud,
     Arma tu semana, Metas y Ajustes). La barra de abajo es la racha.
   · Metas: Hoy (anillos, energía y diario del día), Mi meta (modo meta)
     y Rachas.
   ========================================================= */
(function(){
const { nf, n1, hm, G } = SF;
const K = '#ff5a36', MI = '#22c55e', ST = '#38bdf8';
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
  const btn = (id, ic, title, line, c, i, cls) => `<button class="sfhub ${cls || ''}" data-hub="${id}" style="--c:${c};--i:${i}"><span class="ic">${ic}</span><b>${title}</b><small>${line}</small></button>`;
  body.innerHTML = `
    ${greeting(s)}
    ${SFTrain.liveBannerHTML()}
    ${SFGym.isLive() ? `<button class="sflive" id="hmGym" style="width:100%"><span class="ic">🏋️</span><span class="l"><small>RUTINA DE PESAS EN CURSO</small><b>Toca para seguir</b></span><span class="arrow">›</span></button>` : ''}
    <div class="sfhubs">
      ${btn('train', '🥊', 'ENTRENAR', wkTrain === 1 ? '1 entreno esta semana' : `${wkTrain} entrenos esta semana`, '#ff5a36', 1)}
      ${btn('nutri', '🍽️', 'COMIDA', `${nf(food.k)} de ${nf(goal.k)} kcal · 💧 ${n1(w / 1000)} L`, '#22c55e', 2)}
      ${btn('progress', '📈', 'PROGRESO', lastWeight() ? `${fmtKg(lastWeight().kg)} kg · ${Object.keys(SF.medals()).length} medallas` : `${Object.keys(SF.medals()).length} medallas`, '#8b5cf6', 3)}
      ${btn('health', '❤️', 'SALUD', `${nf(b.steps)} pasos${lh ? ' · ' + lh.bpm + ' lpm' : ''}${rd ? ' · 🌙 ' + rd.v : ''}`, '#0ea5e9', 4)}
      ${btn('week', '🗓️', 'ARMA TU SEMANA', tp ? 'Hoy toca: ' + SFPlan.TYPES[tp.t][0].toLowerCase() : 'Elige qué entrenas cada día', '#eab308', 5, 'wide')}
      ${btn('goals', '🎯', 'METAS', gi ? `${nf(b.active)} de ${nf(G.kcal)} kcal · ${gi.done ? 'meta lograda' : gi.daysLeft + ' días para tu meta'}` : `${nf(b.active)} de ${nf(G.kcal)} kcal activas hoy`, '#f97316', 6, 'wide')}
      ${btn('settings', '⚙️', 'AJUSTES', miss.length ? 'Completa tu perfil' : 'Perfil, acompañante, idioma y más', '#64748b', 7, 'wide slim')}
    </div>`;
  body.querySelectorAll('[data-hub]').forEach(x => x.addEventListener('click', () => { hapticTap(); go(x.dataset.hub); }));
  const gy = body.querySelector('#hmGym'); if (gy) gy.addEventListener('click', () => go('gymLive'));
  SFTrain.bindLiveBanner(body);
  if (current === 'home') renderNav();
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
    ${miss.length ? `<button class="calcard" data-open="me" style="--c:#8b5cf6"><span class="calic">👤</span><span class="l"><b>COMPLETA TU PERFIL</b><small>Falta: ${miss.join(', ')}. Con eso tus calorías salen exactas.</small></span><span class="arrow">›</span></button>` : ''}
    <button class="sect sfrings" id="gtRings" aria-label="Metas del día">
      <div class="rg"><div class="r1">${SF.ring(b.active / G.kcal, K, 150, 14)}</div><div class="r2">${SF.ring(b.min / G.min, MI, 110, 14)}</div><div class="r3">${SF.ring(b.steps / G.steps, ST, 70, 14)}</div></div>
      <div class="lg">
        <div style="--c:${K}"><b>${nf(b.active)}<small> / ${nf(G.kcal)}</small></b><span>🔥 Calorías activas</span></div>
        <div style="--c:${MI}"><b>${nf(b.min)}<small> / ${G.min} min</small></b><span>⏱️ Minutos activos</span></div>
        <div style="--c:${ST}"><b>${nf(b.steps)}<small> / ${nf(G.steps)}</small></b><span>👟 Pasos</span></div>
      </div>
    </button>
    <button class="btn pri" id="gtEdit" style="width:100%;flex:none;margin-bottom:14px;--bc:#f97316">🎯 CAMBIAR MIS METAS DEL DÍA</button>
    <div class="sfquickrow">
      <button id="gtWater" style="--c:#38bdf8"><span>💧</span>+ AGUA</button>
      <button id="gtFood" style="--c:#22c55e"><span>🍽️</span>+ COMIDA</button>
      <button id="gtAct" style="--c:#f59e0b"><span>📝</span>+ ACTIVIDAD</button>
      <button id="gtSteps" style="--c:#0ea5e9"><span>👟</span>PASOS</button>
    </div>
    <div class="sect"><h4>DIARIO DE HOY</h4>
      ${b.acts.length ? b.acts.map(h => `<div class="evrow" style="--c:${h.t === 'gym' ? '#8b5cf6' : h.t === 'cardio' ? '#06b6d4' : '#f97316'}"><i></i><span class="l"><b>${(SF.ACT[h.a] || {}).ic || (h.t === 'gym' ? '🏋️' : '🥊')} ${esc(h.p)}</b><small>${hm(SF.minOf(h))}${h.r ? ' · ' + h.r + ' rounds' : ''}${h.sets ? ' · ' + h.sets + ' series' : ''}${h.note ? ' · ' + esc(h.note) : ''}</small></span><em class="kc">${nf(SF.kcalOf(h))}<small> kcal</small></em><button class="xbtn" data-hl="${sessLog.indexOf(h)}">×</button></div>`).join('')
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
      <button class="tile" style="--c:#22c55e;--i:1" id="gmW"><span>⚖️</span><b>MI PESO</b><small>${lw ? fmtKg(lw.kg) + ' kg' : 'Regístralo'}</small></button>
      <button class="tile" style="--c:#8b5cf6;--i:2" id="gmN"><span>🍽️</span><b>PLAN DE COMIDA</b><small>${nf(SFNutri.targets().k)} kcal al día</small></button></div>
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
      ${row('🔥', 'Racha de entrenos', s.day, s.bestDay === 1 ? 'Tu mejor racha: 1 día' : `Tu mejor racha: ${s.bestDay} días`, '#f97316')}
      ${row('📅', 'Semanas cumpliendo', s.week, `Esta semana: ${s.weekDone} de ${s.weekGoal} entrenos`, '#8b5cf6')}
      ${row('🥗', 'Días anotando comida', s.food, 'Seguidos, contando hoy o ayer', '#22c55e')}
      ${row('💧', 'Días cumpliendo el agua', s.water, 'Seguidos, contando hoy o ayer', '#38bdf8')}
      <div class="row"><span class="pic" style="--c:#38bdf8">🧊</span><span class="l"><b>Comodín semanal</b><small>${!s.freezeOn ? 'Apagado.' : s.freezeUsed ? 'Ya lo usaste esta semana.' : 'Disponible esta semana.'} Si un día se te pasa entrenar, salva tu racha. Hay uno por semana.</small></span><button class="switch ${s.freezeOn ? 'on' : ''}" id="skFreeze"></button></div>
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
