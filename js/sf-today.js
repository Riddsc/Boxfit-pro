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
  const miss = SF.profileMissing(), nx = nextEvent('personal'), sl = window.SFSomnia ? SFSomnia.card() : '';
  const left = goal.k - food.k, spent = b.rest + b.active, balance = food.k - spent;
  const week = []; for (let i = 6; i >= 0; i--){ const d = addDays(t, -i); week.push({ l: WD[parseISO(d).getDay()], v: SF.dayBurn(d).active, hi: d === t }); }
  const chip = $('#streakChip'); chip.innerHTML = `<span>🔥</span><b>${s.day}</b>`; chip.classList.toggle('on', s.today); chip.classList.toggle('zero', !s.day);
  const fi = SFNutri.fastInfo();
  body.innerHTML = `
    ${greeting(s, b)}
    ${SFTrain.liveBannerHTML()}
    ${SFGym.isLive() ? `<button class="sflive" id="hmGym" style="width:100%"><span class="ic">🏋️</span><span class="l"><small>RUTINA DE PESAS EN CURSO</small><b>Toca para seguir</b></span><span class="arrow">›</span></button>` : ''}
    ${miss.length ? `<button class="calcard" data-open="me" style="--c:#8b5cf6"><span class="calic">👤</span><span class="l"><b>COMPLETA TU PERFIL</b><small>Falta: ${miss.join(', ')}. Con eso tus calorías salen exactas.</small></span><span class="arrow">›</span></button>` : ''}
    <button class="sect sfrings" id="hmRings" aria-label="Metas del día">
      <div class="rg"><div class="r1">${SF.ring(b.active / G.kcal, K, 168, 15)}</div><div class="r2">${SF.ring(b.min / G.min, MI, 126, 15)}</div><div class="r3">${SF.ring(b.steps / G.steps, ST, 84, 15)}</div></div>
      <div class="lg">
        <div style="--c:${K}"><b>${nf(b.active)}<small> / ${nf(G.kcal)}</small></b><span>🔥 Calorías activas</span></div>
        <div style="--c:${MI}"><b>${nf(b.min)}<small> / ${G.min} min</small></b><span>⏱️ Minutos activos</span></div>
        <div style="--c:${ST}"><b>${nf(b.steps)}<small> / ${nf(G.steps)}</small></b><span>👟 Pasos</span></div>
      </div>
    </button>
    <button class="sect sfstreak ${s.today ? 'lit' : ''}" id="hmStreak">
      <div class="fl"><span class="flame">🔥</span><b>${s.day}</b></div>
      <div class="l"><b>${s.day === 1 ? '1 DÍA DE RACHA' : s.day + ' DÍAS DE RACHA'}</b><small>${s.today ? '¡Hoy ya sumaste!' : s.restToday ? 'Hoy es descanso: la racha sigue viva' : s.day ? 'Entrena hoy para no perderla' : 'Entrena hoy y enciéndela'}</small>
        <div class="wk">${weekDots()}</div><small>${s.weekDone} de ${s.weekGoal} entrenos esta semana${s.week ? ' · ' + s.week + ' semana' + (s.week === 1 ? '' : 's') + ' cumpliendo' : ''}</small></div>
    </button>
    <div class="sfquickrow">
      <button data-go2="train" style="--c:var(--mode)"><span>${S.disc === 'gym' ? '🏋️' : '🥊'}</span>ENTRENAR</button>
      <button id="hmFood" style="--c:#22c55e"><span>🍽️</span>COMIDA</button>
      <button id="hmWater" style="--c:#38bdf8"><span>💧</span>+ AGUA</button>
      <button id="hmAct" style="--c:#f59e0b"><span>📝</span>ACTIVIDAD</button>
    </div>
    <div class="sect sfbal">
      <h4>ENERGÍA DE HOY</h4>
      <div class="eq"><button data-go2="nutri"><b>${nf(food.k)}</b><small>🍽️ Comido</small></button><i>−</i><div><b>${nf(spent)}</b><small>⚡ Gastado</small></div><i>=</i><div class="${balance > 0 ? 'pos' : 'neg'}"><b>${balance > 0 ? '+' : '−'}${nf(Math.abs(balance))}</b><small>Balance</small></div></div>
      <div class="split"><span><i style="background:#71717a"></i>En reposo ${nf(b.rest)}</span><span><i style="background:${K}"></i>Entrenos ${nf(b.train)}</span><span><i style="background:${ST}"></i>Pasos ${nf(SF.stepKcal(b.steps))}</span></div>
      <div class="foodleft"><div class="trk"><i style="width:${clamp(goal.k ? food.k / goal.k * 100 : 0, 0, 100)}%;background:${left < 0 ? '#ef4444' : '#22c55e'}"></i></div>
        <small>${food.n ? (left >= 0 ? `Te quedan <b>${nf(left)} kcal</b> por comer hoy` : `Te pasaste <b>${nf(-left)} kcal</b> de tu meta`) : 'Anota lo que comes para ver cuánto te queda'} · meta ${nf(goal.k)}</small></div>
      <div class="mini3"><div><b>${nf(food.p)}<small> / ${nf(goal.t.p)} g</small></b><span>Proteína</span></div><div><b>${n1(w / 1000)}<small> / ${n1(wg / 1000)} L</small></b><span>Agua</span></div><div><b>${fi ? Math.floor(fi.el) + ' h' : '—'}</b><span>${fi ? 'Ayuno de ' + fi.hours : 'Ayuno'}</span></div></div>
    </div>
    ${sl}
    <div class="sect"><div style="display:flex;align-items:center"><h4 style="flex:1">DIARIO DE HOY</h4><button class="smallbtn" id="hmAct2" style="margin-top:6px">+ ACTIVIDAD</button></div>
      ${b.acts.length ? b.acts.map(h => `<div class="evrow" style="--c:${h.t === 'gym' ? '#8b5cf6' : h.t === 'cardio' ? '#06b6d4' : '#f97316'}"><i></i><span class="l"><b>${(SF.ACT[h.a] || {}).ic || (h.t === 'gym' ? '🏋️' : '🥊')} ${esc(h.p)}</b><small>${hm(SF.minOf(h))}${h.r ? ' · ' + h.r + ' rounds' : ''}${h.sets ? ' · ' + h.sets + ' series' : ''}${h.note ? ' · ' + esc(h.note) : ''}</small></span><em class="kc">${nf(SF.kcalOf(h))}<small> kcal</small></em><button class="xbtn" data-hl="${sessLog.indexOf(h)}">×</button></div>`).join('')
        : `<p class="empty">Aún no hay entrenos hoy. ${s.restToday ? 'Y está bien: es día de descanso.' : 'Dale al timer, a una rutina o anota una actividad.'}</p>`}
      ${b.steps ? `<div class="evrow" style="--c:${ST}"><i></i><span class="l"><b>👟 ${nf(b.steps)} pasos</b><small>≈${n1(b.steps * 0.00075)} km caminados</small></span><em class="kc">${nf(SF.stepKcal(b.steps))}<small> kcal</small></em></div>` : ''}
    </div>
    <div class="sect"><div style="display:flex;align-items:center"><h4 style="flex:1">CALORÍAS ACTIVAS · 7 DÍAS</h4><button class="smallbtn" data-go2="progress" style="margin-top:6px">VER MÁS</button></div>${SF.bars(week, K, G.kcal, '')}</div>
    ${nx ? `<button class="calcard" data-open="calendar" style="--c:var(--mode)"><span class="calic">🗓️</span><span class="l"><b>PRÓXIMO: ${esc(nx.title.toUpperCase())}</b><small>${niceDate(nx.date)}${nx.time ? ' · ' + nx.time : ''}</small></span><span class="arrow">›</span></button>` : ''}
    ${sessLog.length ? '' : `<div class="sfwelcome">${SFArt.orbit(170)}<h3>BIENVENIDO A SATRONHO BOXFIT</h3><p>Boxeo, gimnasio, calorías y comida en un solo lugar. Samy, Troya, Ñoño, Juana y MechaRidds te acompañan.</p></div>`}`;
  body.querySelectorAll('[data-open]').forEach(x => x.addEventListener('click', () => { hapticTap(); go(x.dataset.open); }));
  body.querySelectorAll('[data-go2]').forEach(x => x.addEventListener('click', () => { hapticTap(); go(x.dataset.go2); }));
  body.querySelector('#hmRings').addEventListener('click', () => SF.openGoalsForm());
  body.querySelector('#hmStreak').addEventListener('click', openStreaks);
  body.querySelector('#hmFood').addEventListener('click', () => { go('nutri'); setTimeout(() => SFNutri.openAdd(), 250); });
  body.querySelector('#hmWater').addEventListener('click', () => { SF.addWater(250); toast(`💧 +250 ml · ${n1((SF.water()[t] || 0) / 1000)} L hoy`); keepY(); });
  body.querySelector('#hmAct').addEventListener('click', () => SFAct.openForm(t));
  body.querySelector('#hmAct2').addEventListener('click', () => SFAct.openForm(t));
  const gy = body.querySelector('#hmGym'); if (gy) gy.addEventListener('click', () => go('gymLive'));
  SFTrain.bindLiveBanner(body);
  body.querySelectorAll('[data-hl]').forEach(x => x.addEventListener('click', async () => { const h = sessLog[+x.dataset.hl]; if (h && await confirmDlg('¿Quitar este entreno?', 'Se descontará de tus calorías y estadísticas.', 'QUITAR')){ removeSessLog(h); render(); } }));
  if (window.SFSomnia) SFSomnia.bind(body);
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
    <div class="gbody"><p class="tip">${me.plan.length ? 'Los días que <b>no</b> son de entreno en tu perfil cuentan como descanso y no rompen la racha.' : `Como entrenas <b>${s.weekGoal} días por semana</b>, te perdono ${7 - s.weekGoal} día${7 - s.weekGoal === 1 ? '' : 's'} libre${7 - s.weekGoal === 1 ? '' : 's'} cada semana sin romper la racha.`} También puedes marcar un día como <b>Descanso</b> en el calendario.</p></div>
    <div class="btnrow" style="margin-top:10px"><button class="btn" id="skMed">🏅 MEDALLAS (${n})</button><button class="btn pri" id="skOk" style="--bc:#f97316">¡A DARLE!</button></div>`, sh => {
    sh.querySelector('#skOk').addEventListener('click', closeForm);
    sh.querySelector('#skMed').addEventListener('click', () => { closeForm(); SFProgress.show('med'); });
  });
}

window.SFToday = { render, openStreaks };
})();
