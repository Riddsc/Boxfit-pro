/* =========================================================
   SATRONHO BOXFIT · HOY
   El tablero del día: anillos de calorías, minutos y pasos,
   racha, balance de energía, sueño (Somnia), diario y semana.
   ========================================================= */
(function(){
const { nf, n1, hm, G } = SF;
const K = '#ff5a36', MI = '#22c55e', ST = '#38bdf8';
const first = () => me.name ? me.name.trim().split(/\s+/)[0] : '';

function greeting(s, b){
  const h = new Date().getHours(), hi = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
  let sub;
  if (s.today) sub = b.active >= G.kcal ? '¡Meta de calorías cumplida! Qué nivel.' : 'Ya entrenaste hoy. ¡Así se hace!';
  else if (s.restToday) sub = 'Hoy es descanso: recupérate, come bien y toma agua.';
  else if (s.day >= 2) sub = `Llevas ${s.day} días de racha. Hoy no se rompe.`;
  else sub = h < 12 ? '¿Qué entrenamos hoy?' : h < 19 ? 'Todavía hay tiempo de entrenar hoy.' : 'Un entreno corto también cuenta.';
  return `<h1 class="hello sfhello">${hi}${first() ? ',<br><em>' + esc(first()) + '</em>' : ''}</h1><p class="sub">${sub}</p>`;
}
function weekDots(){
  const mon = SF.mondayOf(todayISO()), t = todayISO();
  return [0, 1, 2, 3, 4, 5, 6].map(i => { const d = addDays(mon, i), st = dayStatus(d);
    const cls = trainedOn(d) ? 'tr' : d > t ? (st === 'pl' ? 'pl' : '') : SF.isRest(d) ? 'rs' : d === t ? 'now' : 'ms';
    return `<i class="${cls} ${d === t ? 'today' : ''}"><em>${['L', 'M', 'X', 'J', 'V', 'S', 'D'][i]}</em>${trainedOn(d) ? '✓' : cls === 'rs' ? '·' : ''}</i>`; }).join('');
}

function render(){
  const body = $('#homeBody'); if (!body) return;
  const t = todayISO(), b = SF.dayBurn(t), s = SF.streaks(), food = SFNutri.dayTotals(t), goal = SFNutri.dayGoal(t), w = SF.water()[t] || 0, wg = SF.waterGoal();
  const miss = SF.profileMissing(), nx = nextEvent('personal');
  const chip = $('#streakChip'); chip.innerHTML = `<span>🔥</span><b>${s.day}</b>`; chip.classList.toggle('on', s.today); chip.classList.toggle('zero', !s.day);
  const rd = window.SFSomnia ? SFSomnia.readiness() : null, lh = SFHealth.lastHR(), pts = SFHealth.cardioPts(t);
  const wk = SF.mondayOf(t), wkTrain = sessLog.filter(h => h.d >= wk).length;
  const hub = (id, ic, title, line, c, i) => `<button class="sfhub" data-go2="${id}" style="--c:${c};--i:${i}"><span class="ic">${ic}</span><b>${title}</b><small>${line}</small></button>`;
  body.innerHTML = `
    ${greeting(s, b)}
    ${SFTrain.liveBannerHTML()}
    ${SFGym.isLive() ? `<button class="sflive" id="hmGym" style="width:100%"><span class="ic">🏋️</span><span class="l"><small>RUTINA DE PESAS EN CURSO</small><b>Toca para seguir</b></span><span class="arrow">›</span></button>` : ''}
    ${miss.length ? `<button class="calcard" data-open="me" style="--c:#8b5cf6"><span class="calic">👤</span><span class="l"><b>COMPLETA TU PERFIL</b><small>Falta: ${miss.join(', ')}. Con eso tus calorías salen exactas.</small></span><span class="arrow">›</span></button>` : ''}
    <button class="sect sfrings" id="hmRings" aria-label="Metas del día">
      <div class="rg"><div class="r1">${SF.ring(b.active / G.kcal, K, 150, 14)}</div><div class="r2">${SF.ring(b.min / G.min, MI, 110, 14)}</div><div class="r3">${SF.ring(b.steps / G.steps, ST, 70, 14)}</div></div>
      <div class="lg">
        <div style="--c:${K}"><b>${nf(b.active)}<small> / ${nf(G.kcal)}</small></b><span>🔥 Calorías activas</span></div>
        <div style="--c:${MI}"><b>${nf(b.min)}<small> / ${G.min} min</small></b><span>⏱️ Minutos activos</span></div>
        <div style="--c:${ST}"><b>${nf(b.steps)}<small> / ${nf(G.steps)}</small></b><span>👟 Pasos</span></div>
      </div>
    </button>
    <div class="sfhubs">
      ${hub('train', '🥊', 'ENTRENAR', `${wkTrain} esta semana · boxeo, gimnasio y cardio`, '#ff5a36', 1)}
      ${hub('nutri', '🍽️', 'COMIDA', food.k ? `${nf(food.k)} de ${nf(goal.k)} kcal · 💧 ${n1(w / 1000)} L` : `Meta ${nf(goal.k)} kcal · 💧 ${n1(w / 1000)} de ${n1(wg / 1000)} L`, '#22c55e', 2)}
      ${hub('progress', '📈', 'PROGRESO', `${Object.keys(SF.medals()).length} medallas · ${lastWeight() ? fmtKg(lastWeight().kg) + ' kg' : 'peso y medidas'}`, '#8b5cf6', 3)}
      ${hub('health', '❤️', 'SALUD', `${pts} puntos cardio${lh ? ' · ' + lh.bpm + ' lpm' : ''}${rd ? ' · 🌙 ' + rd.v : ''}`, '#0ea5e9', 4)}
    </div>
    <button class="sect sfstreak ${s.today ? 'lit' : ''}" id="hmStreak">
      <div class="fl"><span class="flame">🔥</span><b>${s.day}</b></div>
      <div class="l"><b>${s.day === 1 ? '1 DÍA DE RACHA' : s.day + ' DÍAS DE RACHA'}</b><small>${s.today ? '¡Hoy ya sumaste!' : s.restToday ? 'Hoy es descanso: la racha sigue viva' : s.day ? 'Entrena hoy para no perderla' : 'Entrena hoy y enciéndela'}</small>
        <div class="wk">${weekDots()}</div><small>${s.weekDone} de ${s.weekGoal} entrenos esta semana${s.freezeOn ? ' · 🧊 comodín ' + (s.freezeUsed ? 'usado' : 'disponible') : ''}</small></div>
    </button>
    ${SFPlan.homeCard()}
    ${SFPlan.goalInfo() ? SFPlan.goalCardHTML() : ''}
    ${rd ? `<button class="calcard" data-sleep style="--c:${rd.txt[2]}"><span class="calic">🌙</span><span class="l"><b>RECUPERACIÓN ${rd.v} · ${rd.txt[0].toUpperCase()}</b><small>Dormiste ${hm(rd.n.a)}. ${rd.txt[1]}</small></span><span class="arrow">›</span></button>` : ''}
    <div class="sfquickrow three">
      <button id="hmWater" style="--c:#38bdf8"><span>💧</span>+ AGUA</button>
      <button id="hmFood" style="--c:#22c55e"><span>🍽️</span>+ COMIDA</button>
      <button id="hmAct" style="--c:#f59e0b"><span>📝</span>+ ACTIVIDAD</button>
    </div>
    <div class="sect"><h4>DIARIO DE HOY</h4>
      ${b.acts.length ? b.acts.map(h => `<div class="evrow" style="--c:${h.t === 'gym' ? '#8b5cf6' : h.t === 'cardio' ? '#06b6d4' : '#f97316'}"><i></i><span class="l"><b>${(SF.ACT[h.a] || {}).ic || (h.t === 'gym' ? '🏋️' : '🥊')} ${esc(h.p)}</b><small>${hm(SF.minOf(h))}${h.r ? ' · ' + h.r + ' rounds' : ''}${h.sets ? ' · ' + h.sets + ' series' : ''}${h.note ? ' · ' + esc(h.note) : ''}</small></span><em class="kc">${nf(SF.kcalOf(h))}<small> kcal</small></em><button class="xbtn" data-hl="${sessLog.indexOf(h)}">×</button></div>`).join('')
        : `<p class="empty">Aún no hay entrenos hoy. ${s.restToday ? 'Y está bien: es día de descanso.' : 'Dale al timer, a una rutina o anota una actividad.'}</p>`}
    </div>
    ${nx ? `<button class="calcard" data-open="calendar" style="--c:var(--mode)"><span class="calic">🗓️</span><span class="l"><b>PRÓXIMO: ${esc(nx.title.toUpperCase())}</b><small>${niceDate(nx.date)}${nx.time ? ' · ' + nx.time : ''}</small></span><span class="arrow">›</span></button>` : ''}
    ${sessLog.length ? '' : `<div class="sfwelcome">${SFArt.orbit(170)}<h3>BIENVENIDO A SATRONHO BOXFIT</h3><p>Boxeo, gimnasio, comida y salud en un solo lugar. Samy, Troya, Ñoño, Juana y MechaRidds te acompañan.</p></div>`}`;
  body.querySelectorAll('[data-open]').forEach(x => x.addEventListener('click', () => { hapticTap(); go(x.dataset.open); }));
  body.querySelectorAll('[data-go2]').forEach(x => x.addEventListener('click', () => { hapticTap(); go(x.dataset.go2); }));
  body.querySelectorAll('[data-sleep]').forEach(x => x.addEventListener('click', () => SFNav.go('health:sleep')));
  body.querySelector('#hmRings').addEventListener('click', () => SF.openGoalsForm());
  body.querySelector('#hmStreak').addEventListener('click', openStreaks);
  body.querySelector('#hmFood').addEventListener('click', () => { SFNav.tab.nutri = 'diary'; go('nutri'); setTimeout(() => SFNutri.openAdd(), 250); });
  body.querySelector('#hmWater').addEventListener('click', () => { SF.addWater(250); toast(`💧 +250 ml · ${n1((SF.water()[t] || 0) / 1000)} L hoy`); keepY(); });
  body.querySelector('#hmAct').addEventListener('click', () => SFAct.openForm(t));
  const gy = body.querySelector('#hmGym'); if (gy) gy.addEventListener('click', () => go('gymLive'));
  SFTrain.bindLiveBanner(body);
  SFPlan.bindHome(body); SFPlan.bindGoalCard(body);
  body.querySelectorAll('[data-hl]').forEach(x => x.addEventListener('click', async () => { const h = sessLog[+x.dataset.hl]; if (h && await confirmDlg('¿Quitar este entreno?', 'Se descontará de tus calorías y estadísticas.', 'QUITAR')){ removeSessLog(h); render(); } }));
}
function keepY(){ const v = $('#home'), y = v.scrollTop; render(); v.scrollTop = y; }
$('#streakChip').addEventListener('click', openStreaks);

function openStreaks(){
  const s = SF.streaks(), md = SF.medals(), n = Object.keys(md).length;
  const row = (ic, t, v, sub, c) => `<div class="row"><span class="pic" style="--c:${c}">${ic}</span><span class="l"><b>${t}</b><small>${sub}</small></span><b class="big">${v}</b></div>`;
  openForm(`<div class="gtop">${SFArt.badge('samy', 64)}<div class="speech"><small>SAMY CUIDA TU RACHA</small><b>${s.day ? s.day + (s.day === 1 ? ' DÍA' : ' DÍAS') : 'ENCIÉNDELA HOY'}</b></div></div>
    ${row('🔥', 'Racha de entrenos', s.day, `Tu mejor racha: ${s.bestDay} día${s.bestDay === 1 ? '' : 's'}`, '#f97316')}
    ${row('📅', 'Semanas cumpliendo', s.week, `${s.weekDone} de ${s.weekGoal} entrenos esta semana · mejor: ${s.bestWeek}`, '#8b5cf6')}
    ${row('🥗', 'Días anotando comida', s.food, 'Seguidos, contando hoy o ayer', '#22c55e')}
    ${row('💧', 'Días cumpliendo el agua', s.water, 'Seguidos, contando hoy o ayer', '#38bdf8')}
    <div class="row"><span class="pic" style="--c:#38bdf8">🧊</span><span class="l"><b>Comodín semanal</b><small>Si un día se te pasa entrenar, el comodín salva tu racha (uno por semana). ${s.freezeOn ? (s.freezeUsed ? 'Ya lo usaste esta semana.' : 'Disponible esta semana.') : 'Está apagado.'}</small></span><button class="switch ${s.freezeOn ? 'on' : ''}" id="skFreeze"></button></div>
    <div class="gbody"><p class="tip">${me.plan.length ? 'Los días que <b>no</b> son de entreno en tu perfil cuentan como descanso y no rompen la racha.' : `Como entrenas <b>${s.weekGoal} días por semana</b>, te perdono ${7 - s.weekGoal} día${7 - s.weekGoal === 1 ? '' : 's'} libre${7 - s.weekGoal === 1 ? '' : 's'} cada semana sin romper la racha.`} También puedes marcar un día como <b>Descanso</b> en el calendario.</p></div>
    <div class="btnrow" style="margin-top:10px"><button class="btn" id="skMed">🏅 MEDALLAS (${n})</button><button class="btn pri" id="skOk" style="--bc:#f97316">¡A DARLE!</button></div>`, sh => {
    sh.querySelector('#skOk').addEventListener('click', closeForm);
    sh.querySelector('#skFreeze').addEventListener('click', e => { S.freeze = S.freeze === false; saveSettings(); e.currentTarget.classList.toggle('on', S.freeze !== false); if (current === 'home') render(); });
    sh.querySelector('#skMed').addEventListener('click', () => { closeForm(); SFProgress.show('med'); });
  });
}

window.SFToday = { render, openStreaks };
})();
