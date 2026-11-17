/* =========================================================
   SATRONHO BOXFIT · PLAN SEMANAL, MODO META Y CALENTAMIENTO SUGERIDO
   · Plan semanal: qué toca cada día. Hay planes sugeridos, pero cada día
     se cambia a gusto; nada es obligatorio.
   · Modo meta: llegar a un peso en una fecha (o dar el peso de una pelea).
   · Calentamiento: siempre se sugiere, nunca frena el entreno si se salta.
   ========================================================= */
(function(){
const { nf, n1 } = SF;
const TYPES = { rest: ['Descanso', '😴', '#64748b'], box: ['Boxeo', '🥊', '#ff5a36'], gym: ['Gimnasio', '🏋️', '#8b5cf6'], cardio: ['Cardio', '🏃', '#06b6d4'], free: ['Libre', '✨', '#22c55e'] };
const DOW = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const ORDER = [1, 2, 3, 4, 5, 6, 0];
let plan = load('sf_wplan', null);      // { days: { 0..6: { t, rid } } }
const saveP = () => { save('sf_wplan', plan); syncMePlan(); };
// Los días con entreno del plan son los «días de entreno» del perfil (racha y calendario)
function syncMePlan(){ if (!plan) return; me.plan = ORDER.filter(d => plan.days[d] && plan.days[d].t !== 'rest'); saveMe(); }

/* Planes sugeridos según cuántos días por semana entrenas */
function suggest(kind, n){
  n = clamp(n || SF.weekGoal(), 2, 6);
  const slots = { 2: [2, 5], 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 5, 6], 6: [1, 2, 3, 4, 5, 6] }[n];
  const seq = { box: ['box', 'box', 'cardio', 'box', 'box', 'cardio'], gym: ['gym', 'gym', 'cardio', 'gym', 'gym', 'cardio'], mix: ['box', 'gym', 'box', 'gym', 'cardio', 'box'] }[kind];
  const days = {}; [0, 1, 2, 3, 4, 5, 6].forEach(d => days[d] = { t: 'rest' });
  slots.forEach((d, i) => days[d] = { t: seq[i] });
  // en gimnasio, alterna las rutinas de cuerpo completo o empuje/jalón/pierna
  const r = SFGym.routines ? SFGym.routines() : [];
  const gymR = n <= 3 ? ['r_fbA', 'r_fbB'] : ['r_push', 'r_pull', 'r_legs', 'r_upper'];
  let gi = 0; Object.values(days).forEach(x => { if (x.t === 'gym'){ const id = gymR[gi++ % gymR.length]; if (r.some(y => y.id === id)) x.rid = id; } });
  return { days };
}
const todayPlan = (ds) => plan && plan.days[parseISO(ds || todayISO()).getDay()];
const label = x => { if (!x) return ''; const T0 = TYPES[x.t]; const r = x.rid && SFGym.routines ? SFGym.routines().find(y => y.id === x.rid) : null; return T0[1] + ' ' + T0[0] + (r ? ' · ' + r.name : ''); };

// Franja «Hoy toca» en Entrenar
function todayStrip(tab){
  const x = todayPlan(); if (!x) return '';
  const done = trainedOn(todayISO());
  return `<button class="sfplanstrip" id="plStrip" style="--c:${TYPES[x.t][2]}"><span class="l"><small>HOY TOCA${done ? ' · ✓ YA ENTRENASTE' : ''}</small><b>${esc(label(x))}</b></span><span class="arrow">›</span></button>`;
}
function bindStrip(root){ const b = root.querySelector('#plStrip'); if (b) b.addEventListener('click', () => go('week')); }
// Tarjeta del Inicio
function homeCard(){
  const t = todayISO();
  if (!plan) return `<button class="calcard" id="plHome" style="--c:#22c55e"><span class="calic">🗓️</span><span class="l"><b>ARMA TU SEMANA</b><small>Elige qué entrenas cada día. Te sugiero un plan y lo cambias a tu gusto.</small></span><span class="arrow">›</span></button>`;
  const x = todayPlan(t), y = todayPlan(addDays(t, -1)), yd = addDays(t, -1);
  const missedY = y && y.t !== 'rest' && !trainedOn(yd) && pmarks[yd] !== 'rest';
  return `<button class="calcard" id="plHome" style="--c:${TYPES[x.t][2]}"><span class="calic">${TYPES[x.t][1]}</span><span class="l"><b>HOY TOCA: ${esc(label(x).replace(/^\S+ /, '').toUpperCase())}</b><small>${trainedOn(t) ? '¡Listo por hoy! 💪' : x.t === 'rest' ? 'Descansar también es entrenar.' : 'Toca para ver tu semana.'}${missedY ? ' Ayer tocaba ' + TYPES[y.t][0].toLowerCase() + ' y no quedó registrado.' : ''}</small></span><span class="arrow">›</span></button>`;
}
function bindHome(root){ const b = root.querySelector('#plHome'); if (b) b.addEventListener('click', openPlanEditor); }

function openPlanEditor(){
  const P = JSON.parse(JSON.stringify(plan || suggest(S.disc === 'gym' ? 'gym' : 'box')));
  const routines = SFGym.routines ? SFGym.routines() : [];
  openForm(`<h3 class="ftitle">🗓️ MI SEMANA</h3><p class="hint">Toca un día para cambiar lo que toca. Los días de descanso no rompen tu racha. Puedes empezar con un plan sugerido y ajustarlo.</p>
    <div class="sfchips" id="peSug"><button type="button" data-sg="box">🥊 Sugerido boxeo</button><button type="button" data-sg="gym">🏋️ Sugerido gimnasio</button><button type="button" data-sg="mix">🔀 Mixto</button></div>
    <div id="peDays"></div>
    <div class="btnrow" style="margin-top:10px">${plan ? '<button class="btn" id="peOff" style="color:#f87171">QUITAR PLAN</button>' : '<button class="btn" id="peC">CANCELAR</button>'}<button class="btn pri" id="peOk" style="--bc:var(--mode)">GUARDAR</button></div>`, sh => {
    const draw = () => {
      sh.querySelector('#peDays').innerHTML = ORDER.map(d => { const x = P.days[d] || { t: 'rest' };
        return `<div class="sfpday" style="--c:${TYPES[x.t][2]}"><b>${DOW[d]}</b><div class="opts">${Object.entries(TYPES).map(([k, v]) => `<button type="button" data-d="${d}" data-t="${k}" class="${x.t === k ? 'on' : ''}" title="${v[0]}">${v[1]}</button>`).join('')}</div>
          ${x.t === 'gym' && routines.length ? `<select data-rd="${d}"><option value="">Rutina libre</option>${routines.map(r => `<option value="${r.id}" ${x.rid === r.id ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</select>` : `<small>${TYPES[x.t][0]}</small>`}</div>`; }).join('');
      sh.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => { P.days[b.dataset.d] = { t: b.dataset.t }; hapticTap(); draw(); }));
      sh.querySelectorAll('[data-rd]').forEach(x => x.addEventListener('change', () => { P.days[x.dataset.rd].rid = x.value || undefined; }));
    };
    sh.querySelectorAll('[data-sg]').forEach(b => b.addEventListener('click', () => { Object.assign(P, suggest(b.dataset.sg)); hapticTap(); draw(); }));
    const c = sh.querySelector('#peC'); if (c) c.addEventListener('click', closeForm);
    const off = sh.querySelector('#peOff'); if (off) off.addEventListener('click', () => { plan = null; save('sf_wplan', null); closeForm(); toast('Plan quitado'); refresh(); });
    sh.querySelector('#peOk').addEventListener('click', () => { plan = P; saveP(); closeForm(); toast('Semana guardada 💪'); refresh(); });
    draw();
  });
}
function refresh(){ if (current === 'home') SFToday.render(); else if (VIEW_RENDER[current]) VIEW_RENDER[current](); }

/* ---------- Modo meta (peso a una fecha, o pesaje de pelea) ---------- */
let goal = load('sf_goal', null);      // { type:'weight'|'fight', target, date, name, start:{ kg, d } }
function goalInfo(){
  if (!goal) return null;
  const lw = lastWeight(), now = lw ? lw.kg : goal.start.kg, t = todayISO();
  const daysLeft = Math.round((parseISO(goal.date) - parseISO(t)) / 864e5), weeks = Math.max(daysLeft / 7, 0.01);
  const toGo = goal.target - now, total = goal.target - goal.start.kg;
  const pct = total ? clamp((now - goal.start.kg) / total, 0, 1) : 1;
  const rate = toGo / weeks, maxSafe = now * 0.01;            // más de 1 % del peso por semana es muy agresivo
  return { now, daysLeft, toGo, pct, rate, risky: Math.abs(rate) > maxSafe + 0.01, done: Math.abs(toGo) < 0.25, over: daysLeft < 0 };
}
function goalCardHTML(){
  if (!goal) return `<button class="calcard" id="gmEdit" style="--c:#f59e0b"><span class="calic">🎯</span><span class="l"><b>MODO META</b><small>Ponte una meta de peso con fecha (o el pesaje de una pelea) y te digo cómo vas.</small></span><span class="arrow">›</span></button>`;
  const g = goalInfo();
  return `<div class="sect sfgoal"><div class="hd"><span class="calic">${goal.type === 'fight' ? '🥊' : '🎯'}</span><span class="l"><b>${esc((goal.name || (goal.type === 'fight' ? 'Pesaje de pelea' : 'Mi meta')).toUpperCase())}</b><small>${fmtKg(goal.target)} kg · ${niceDate(goal.date)}</small></span><button class="smallbtn" id="gmEdit">CAMBIAR</button></div>
    <div class="trk"><i style="width:${g.pct * 100}%;background:#f59e0b"></i></div>
    <div class="sfall"><div><b>${fmtKg(g.now)}</b><small>hoy</small></div><div><b>${g.done ? '✓' : (g.toGo > 0 ? '+' : '−') + fmtKg(Math.abs(g.toGo))}</b><small>${g.done ? 'logrado' : 'kg faltan'}</small></div><div><b>${g.over ? '—' : g.daysLeft}</b><small>días</small></div><div><b>${g.done || g.over ? '—' : n1(Math.abs(g.rate))}</b><small>kg/semana</small></div></div>
    ${g.done ? '<p class="hint">🎉 ¡Llegaste a tu meta! Ahora a mantenerla.</p>' : g.over ? '<p class="hint">La fecha ya pasó. Cámbiala o pon una meta nueva.</p>'
      : `${g.risky ? `<p class="warn">⚠️ Necesitarías ${n1(Math.abs(g.rate))} kg por semana: es más de lo recomendado (1 % de tu peso). ${goal.type === 'fight' ? 'Para una pelea, hazlo con tu entrenador y nunca a punta de deshidratarte.' : 'Dale más tiempo para no perder músculo.'}</p>` : ''}
        <button class="btn" id="gmApply" style="width:100%;flex:none;margin-bottom:12px">AJUSTAR MI PLAN DE COMIDA A ESTA META</button>`}</div>`;
}
function bindGoalCard(root){
  const e = root.querySelector('#gmEdit'); if (e) e.addEventListener('click', openGoal);
  const a = root.querySelector('#gmApply'); if (a) a.addEventListener('click', () => {
    const g = goalInfo(), r = [0.25, 0.5, 0.75, 1].reduce((b, x) => Math.abs(x - Math.abs(g.rate)) < Math.abs(b - Math.abs(g.rate)) ? x : b, 0.5);
    SFNutri.setPlan(g.toGo < 0 ? 'lose' : 'gain', Math.min(r, Math.max(0.25, Math.floor(g.now * 0.01 * 4) / 4)));
    toast('Plan de comida ajustado a tu meta'); refresh();
  });
}
function openGoal(){
  const lw = lastWeight(), G0 = goal ? Object.assign({}, goal) : { type: 'weight', target: lw ? Math.round(lw.kg) : 70, date: addDays(todayISO(), 84), name: '' };
  openForm(`<h3 class="ftitle">🎯 MODO META</h3>
    <div class="seg" id="gmT"><button type="button" data-t="weight">META DE PESO</button><button type="button" data-t="fight">PESAJE DE PELEA</button></div>
    <label class="field"><span>Nombre (opcional)</span><input id="gmN" maxlength="30" value="${esc(G0.name || '')}" placeholder="Ej: Torneo departamental"></label>
    <div class="frow"><div class="field"><span>Peso meta (kg)</span><div class="stepper" id="gmK"></div></div><label class="field"><span id="gmDl">Fecha</span><input type="date" id="gmD" value="${G0.date}" min="${addDays(todayISO(), 1)}"></label></div>
    ${lw ? `<p class="hint">Peso de hoy: ${fmtKg(lw.kg)} kg. Ve registrando tu peso para que la meta se actualice.</p>` : '<p class="hint">Registra tu peso en Progreso › Cuerpo para seguir la meta.</p>'}
    <div class="btnrow">${goal ? '<button class="btn" id="gmDel" style="color:#f87171">QUITAR META</button>' : '<button class="btn" id="gmC">CANCELAR</button>'}<button class="btn pri" id="gmOk" style="--bc:#f59e0b">GUARDAR</button></div>`, sh => {
    const paint = () => { sh.querySelectorAll('#gmT [data-t]').forEach(b => b.classList.toggle('on', b.dataset.t === G0.type)); sh.querySelector('#gmDl').textContent = G0.type === 'fight' ? 'Día del pesaje' : 'Fecha'; };
    sh.querySelectorAll('#gmT [data-t]').forEach(b => b.addEventListener('click', () => { G0.type = b.dataset.t; paint(); }));
    makeStepper(sh.querySelector('#gmK'), { get: () => G0.target, set: v => G0.target = Math.round(v * 10) / 10, min: 30, max: 200, step: 0.5, input: true, fmt: v => fmtKg(v), label: 'Peso meta' });
    paint();
    const c = sh.querySelector('#gmC'); if (c) c.addEventListener('click', closeForm);
    const d = sh.querySelector('#gmDel'); if (d) d.addEventListener('click', () => { goal = null; save('sf_goal', null); closeForm(); refresh(); });
    sh.querySelector('#gmOk').addEventListener('click', () => {
      sh.querySelectorAll('input').forEach(i => i.blur());
      const date = sh.querySelector('#gmD').value; if (!date || date <= todayISO()) return toast('Elige una fecha que todavía no haya llegado');
      G0.date = date; G0.name = sh.querySelector('#gmN').value.trim();
      if (!goal || goal.target !== G0.target) G0.start = { kg: lw ? lw.kg : G0.target, d: todayISO() };
      goal = G0; save('sf_goal', goal); wGoal = goal.target; saveW();
      closeForm(); toast('Meta guardada 🎯'); refresh();
    });
  });
}

/* ---------- Calentamiento sugerido (opcional, nunca bloquea) ---------- */
const EXTRA_WARM = [
  { id: 'wgym', name: 'Calentamiento para pesas', color: '#8b5cf6', items: [{ n: 'Bicicleta o elíptica suave', s: 180 }, { n: 'Movilidad de hombros', s: 45 }, { n: 'Movilidad de cadera', s: 45 }, { n: 'Sentadillas sin peso', s: 40 }, { n: 'Flexiones suaves', s: 30 }, { n: 'Puente de glúteo', s: 30 }, { n: 'Series de aproximación con poco peso', s: 90 }] },
  { id: 'wcar', name: 'Calentamiento para cardio', color: '#06b6d4', items: [{ n: 'Caminar a paso vivo', s: 120 }, { n: 'Círculos de tobillos y rodillas', s: 40 }, { n: 'Zancadas suaves', s: 40 }, { n: 'Talones al glúteo', s: 30 }, { n: 'Rodillas arriba', s: 30 }, { n: 'Trote muy suave', s: 90 }] },
];
EXTRA_WARM.forEach(w => { if (!bhWarmups.some(x => x.id === w.id)) bhWarmups.push(JSON.parse(JSON.stringify(w))); });
saveBH();
const warmFor = kind => { const id = (S.warmPick || {})[kind] || { box: 'wg', gym: 'wgym', cardio: 'wcar' }[kind]; return bhWarmups.find(w => w.id === id) || bhWarmups[0]; };
const warmedToday = () => sessLog.some(h => h.d === todayISO() && h.a === 'warm');
function warmCard(kind, ret){
  if (S.warmSug === false || warmedToday()) return '';
  const w = warmFor(kind); if (!w) return '';
  const min = Math.round(w.items.reduce((a, x) => a + x.s, 0) / 60);
  return `<div class="sfwarm" style="--c:${w.color}"><span class="ic">🔥</span><span class="l"><small>CALENTAMIENTO SUGERIDO · OPCIONAL</small><b>${esc(w.name)}</b><small>${min} min · ${w.items.length} ejercicios</small></span>
    <button class="smallbtn go" data-warm="${w.id}" data-ret="${ret}">▶</button><button class="xbtn" data-warmx aria-label="Saltar">×</button><button class="xbtn" data-warmcfg aria-label="Cambiar">⋯</button></div>`;
}
let skipped = {};
function bindWarm(root, kind){
  root.querySelectorAll('[data-warm]').forEach(b => b.addEventListener('click', () => { playReturn = b.dataset.ret; startWarmup(b.dataset.warm); }));
  root.querySelectorAll('[data-warmx]').forEach(b => b.addEventListener('click', () => { skipped[kind] = todayISO(); b.closest('.sfwarm').remove(); }));
  root.querySelectorAll('[data-warmcfg]').forEach(b => b.addEventListener('click', () => openWarmPick(kind)));
}
const warmCardIf = (kind, ret) => skipped[kind] === todayISO() ? '' : warmCard(kind, ret);
function openWarmPick(kind){
  const cur = warmFor(kind);
  openForm(`<h3 class="ftitle">🔥 CALENTAMIENTO SUGERIDO</h3><p class="hint">Elige cuál sugerirte para ${kind === 'gym' ? 'pesas' : kind === 'cardio' ? 'cardio' : 'boxeo'}. Puedes editar o crear calentamientos en Entrenar › Boxeo › Calentamientos.</p>
    ${bhWarmups.map(w => `<button class="evrow" data-wk="${w.id}" style="--c:${w.color};width:100%"><i></i><span class="l"><b>${esc(w.name)}${w.id === cur.id ? ' ✓' : ''}</b><small>${Math.round(w.items.reduce((a, x) => a + x.s, 0) / 60)} min</small></span></button>`).join('')}
    <div class="row"><div class="l"><b>Sugerir calentamiento</b><small>Apágalo si no quieres ver la sugerencia</small></div><button class="switch ${S.warmSug !== false ? 'on' : ''}" id="wkOn"></button></div>
    <button class="btn pri" id="wkOk" style="width:100%;margin-top:10px;--bc:var(--mode)">LISTO</button>`, sh => {
    sh.querySelectorAll('[data-wk]').forEach(b => b.addEventListener('click', () => { S.warmPick = Object.assign({}, S.warmPick, { [kind]: b.dataset.wk }); saveSettings(); closeForm(); refresh(); }));
    sh.querySelector('#wkOn').addEventListener('click', e => { S.warmSug = S.warmSug === false; saveSettings(); e.currentTarget.classList.toggle('on', S.warmSug !== false); });
    sh.querySelector('#wkOk').addEventListener('click', () => { closeForm(); refresh(); });
  });
}

/* ---------- Apartado «Mi semana» (se edita en la misma pantalla y se guarda solo) ---------- */
SF.view('week', 'MI SEMANA', { render: renderWeek, back: true });
function renderWeek(){
  const body = $('#weekBody'), routines = SFGym.routines ? SFGym.routines() : [];
  const P = plan || null, t = todayISO(), x = todayPlan(t);
  body.innerHTML = `
    ${P ? `<div class="sfplanstrip" style="--c:${TYPES[x.t][2]}"><span class="l"><small>HOY TOCA${trainedOn(t) ? ' · ✓ YA ENTRENASTE' : ''}</small><b>${esc(label(x))}</b></span>${x.t !== 'rest' ? `<button class="smallbtn go" id="wkGo">${x.t === 'free' ? 'ENTRENAR' : 'IR'}</button>` : ''}</div>`
      : `<p class="hint">Elige qué entrenas cada día. Puedes empezar con un plan sugerido y cambiar cualquier día. Nada es obligatorio y los días de descanso no rompen tu racha.</p>`}
    <div class="sfchips" id="wkSug"><button type="button" data-sg="box">🥊 Sugerido boxeo</button><button type="button" data-sg="gym">🏋️ Sugerido gimnasio</button><button type="button" data-sg="mix">🔀 Mixto</button></div>
    <div class="sect" id="wkDays" style="padding-top:2px">${ORDER.map(d => { const y = (P && P.days[d]) || { t: 'rest' }, today = parseISO(t).getDay() === d;
      return `<div class="sfpday ${today ? 'today' : ''}" style="--c:${TYPES[y.t][2]}"><b><span>${dayName(d)}</span>${today ? '<em class="sfpnow">HOY</em>' : ''}</b><div class="opts">${Object.entries(TYPES).map(([k, v]) => `<button type="button" data-d="${d}" data-t="${k}" class="${y.t === k ? 'on' : ''}" aria-label="${v[0]}">${v[1]}</button>`).join('')}</div>
        ${y.t === 'gym' && routines.length ? `<select data-rd="${d}"><option value="">Rutina libre</option>${routines.map(r => `<option value="${r.id}" ${y.rid === r.id ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</select>` : `<small>${TYPES[y.t][0]}</small>`}</div>`; }).join('')}</div>
    <div class="sect"><h4>CALENTAMIENTO SUGERIDO</h4>
      <div class="row"><div class="l"><b>Sugerir calentamiento</b><small>Aparece antes de entrenar. Siempre es opcional y se salta con un toque.</small></div><button class="switch ${S.warmSug !== false ? 'on' : ''}" id="wkWarm"></button></div>
      ${['box', 'gym', 'cardio'].map(k => `<div class="row"><div class="l"><b>${({ box: 'Para boxeo', gym: 'Para pesas', cardio: 'Para cardio' })[k]}</b><small>${esc(warmFor(k).name)}</small></div><button class="smallbtn" data-wp="${k}">CAMBIAR</button></div>`).join('')}
    </div>
    ${P ? '<button class="btn" id="wkOff" style="width:100%;flex:none;color:#f87171">QUITAR MI PLAN</button>' : ''}`;
  const ensure = () => { if (!plan) plan = suggest(S.disc === 'gym' ? 'gym' : 'box'); };
  body.querySelectorAll('[data-sg]').forEach(b => b.addEventListener('click', () => { plan = suggest(b.dataset.sg); saveP(); hapticTap(); toast('Plan sugerido listo: cámbialo a tu gusto'); keep(); }));
  body.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => { ensure(); plan.days[b.dataset.d] = { t: b.dataset.t }; saveP(); hapticTap(); keep(); }));
  body.querySelectorAll('[data-rd]').forEach(el => el.addEventListener('change', () => { plan.days[el.dataset.rd].rid = el.value || undefined; saveP(); }));
  body.querySelector('#wkWarm').addEventListener('click', e => { S.warmSug = S.warmSug === false; saveSettings(); e.currentTarget.classList.toggle('on', S.warmSug !== false); });
  body.querySelectorAll('[data-wp]').forEach(b => b.addEventListener('click', () => openWarmPick(b.dataset.wp)));
  const off = body.querySelector('#wkOff'); if (off) off.addEventListener('click', async () => { if (await confirmDlg('¿Quitar tu plan?', 'Tus entrenos y tu racha no se tocan.', 'QUITAR')){ plan = null; save('sf_wplan', null); renderWeek(); } });
  const g = body.querySelector('#wkGo'); if (g) g.addEventListener('click', () => { const y = todayPlan(); if (y.t === 'gym' && y.rid){ SFNav.go('train:gym'); } else SFNav.go('train:' + (y.t === 'free' ? (S.disc === 'gym' ? 'gym' : 'box') : y.t)); });
}
const keep = () => { const v = $('#week'), y = v.scrollTop; renderWeek(); v.scrollTop = y; };
const dayName = d => (window.SFI18n && SFI18n.dayNames) ? SFI18n.dayNames[d] : DOW[d];
NAV_PARENT.calendar = 'week'; BACK_TO.calendar = 'week';
Object.assign(GUIDE, { week: () => ({ t:'tu semana', b:[`<p>Toca el ícono de cada día para elegir qué toca: descanso, boxeo, gimnasio, cardio o libre.</p>`, `<p>Se guarda solo. Los días que eliges como descanso no rompen tu racha.</p>`, `<p class="tip">En la barra de abajo está tu <b>calendario</b>.</p>`] }) });

window.SFPlan = { renderWeek, todayStrip, bindStrip, homeCard, bindHome, openPlanEditor, todayPlan, label, goalCardHTML, bindGoalCard, openGoal, goalInfo, warmCard: warmCardIf, bindWarm, openWarmPick, TYPES };
})();
