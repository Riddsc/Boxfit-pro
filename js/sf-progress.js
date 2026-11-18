/* =========================================================
   SATRONHO BOXFIT · PROGRESO, AJUSTES Y RECORDATORIOS
   Resumen por periodo, cuerpo (peso, medidas y % de grasa),
   medallas, y las secciones nuevas de «Más».
   ---------------------------------------------------------
   % de grasa: método de la Marina de EE. UU. (Hodgdon y Beckett, 1984),
   con cuello, cintura, cadera (mujeres) y altura. Es una estimación.
   ========================================================= */
(function(){
const { nf, n1, hm, G } = SF;
let period = 7;
let body = load('sf_body', []);          // medidas: [{ id, d, waist, neck, hip, chest, arm, thigh }]
SF.view('progress', 'RESUMEN', { render: render, back: true });

const TITLES = { sum: 'RESUMEN', body: 'CUERPO', med: 'MEDALLAS' };
function render(){
  const el = $('#progressBody'), tab = SFNav.tab.progress;
  $('#progressTitle').textContent = TITLES[tab];
  el.innerHTML = '<div id="prTab"></div>';
  const box = el.querySelector('#prTab');
  if (tab === 'sum') renderSum(box); else if (tab === 'body') renderBody(box); else renderMedals(box);
  box.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => { hapticTap(); go(b.dataset.open); }));
}

/* ---------- Resumen ---------- */
function renderSum(box){
  const pk = SFPeriod.get('progress', 'w'), period = SFPeriod.DAYS[pk];
  const t = todayISO(), from = addDays(t, -(period - 1)), list = sessLog.filter(h => h.d >= from && h.d <= t);
  const kc = list.reduce((a, h) => a + SF.kcalOf(h), 0), min = list.reduce((a, h) => a + SF.minOf(h), 0), days = new Set(list.map(h => h.d)).size;
  const by = { box: 0, gym: 0, cardio: 0 }; list.forEach(h => by[h.t === 'gym' ? 'gym' : h.t === 'cardio' ? 'cardio' : 'box'] += SF.minOf(h));
  const tot = Math.max(1, by.box + by.gym + by.cardio);
  const data = SFPeriod.buckets(pk, d => SF.dayBurn(d).active, { agg: 'sum' });
  const all = SF.totals(), s = SF.streaks(), ms = monthTrainSummary(monthKey(t));
  const wks = SFGym.workouts().filter(w => w.d >= from), vol = wks.reduce((a, w) => a + SFGym.wkVol(w), 0);
  const steps = SF.steps(); let stSum = 0, stDays = 0; for (let i = 0; i < period; i++){ const v = steps[addDays(t, -i)] || 0; if (v){ stSum += v; stDays++; } }
  const food = []; for (let i = 0; i < period; i++){ const f = SFNutri.dayTotals(addDays(t, -i)); if (f.k) food.push(f.k); }
  box.innerHTML = `
    ${SFPeriod.seg('progress', 'w', ['w', 'm', 'q', 'y'])}
    <div class="kpis"><div class="kpi" style="--kc:#d98a78"><b>${nf(kc)}</b><span>kcal en entrenos</span></div><div class="kpi" style="--kc:#7fb38a"><b>${hm(min)}</b><span>Tiempo activo</span></div>
      <div class="kpi" style="--kc:#dc9a6e"><b>${list.length}</b><span>Entrenos</span></div><div class="kpi" style="--kc:#9d8fd0"><b>${days}<small style="font-size:.5em;opacity:.6"> / ${period}</small></b><span>Días activos</span></div></div>
    <div class="sect"><h4>CALORÍAS ACTIVAS · ${SFPeriod.title(pk).toUpperCase()}</h4>${SF.bars(data, '#d98a78', G.kcal, '')}<p class="hint">${SFPeriod.unitNote(pk)}</p></div>
    <div class="sect"><h4>¿EN QUÉ SE FUE EL TIEMPO?</h4>
      <div class="sfsplit"><i style="flex:${by.box};background:#dc9a6e"></i><i style="flex:${by.gym};background:#9d8fd0"></i><i style="flex:${by.cardio};background:#6fb0b6"></i></div>
      <div class="legend"><span><i style="background:#dc9a6e"></i>Boxeo ${Math.round(by.box / tot * 100)}% · ${hm(by.box)}</span><span><i style="background:#9d8fd0"></i>Pesas ${Math.round(by.gym / tot * 100)}% · ${hm(by.gym)}</span><span><i style="background:#6fb0b6"></i>Cardio ${Math.round(by.cardio / tot * 100)}% · ${hm(by.cardio)}</span></div>
      <div class="row"><span class="l"><b>Pesas</b><small>${wks.length} rutinas · ${nf(SFGym.unit() === 'lb' ? vol / 0.45359 : vol)} ${SFGym.unit()} movidos</small></span></div>
      <div class="row"><span class="l"><b>Pasos</b><small>${stDays ? 'Promedio de ' + nf(stSum / stDays) + ' al día (' + stDays + ' días con registro)' : 'Sin registro de pasos'}</small></span></div>
      <div class="row"><span class="l"><b>Comida</b><small>${food.length ? 'Promedio de ' + nf(food.reduce((a, b) => a + b, 0) / food.length) + ' kcal al día (' + food.length + ' días anotados)' : 'Sin comidas anotadas'}</small></span></div>
    </div>
    ${window.SFSomnia ? SFSomnia.progressHTML(period) : ''}
    <div class="tiles">
      <button class="tile" style="--c:var(--mode);--i:1" data-open="calendar"><span>📅</span><b>CALENDARIO</b><small>${ms.tr} entreno${ms.tr === 1 ? '' : 's'} este mes${ms.pct != null ? ' · ' + ms.pct + '%' : ''}</small></button>
      <button class="tile" style="--c:#d6a660;--i:2" id="prStreak"><span>🔥</span><b>RACHAS</b><small>${s.day} días · mejor ${s.bestDay}</small></button></div>
    <div class="sect"><h4>DESDE QUE EMPEZASTE</h4>
      <div class="sfall"><div><b>${nf(all.ses)}</b><small>entrenos</small></div><div><b>${nf(all.min / 60)}</b><small>horas</small></div><div><b>${nf(all.kcal)}</b><small>kcal</small></div><div><b>${nf(all.rounds)}</b><small>rounds</small></div></div></div>
    ${SFPets.says(null, all.ses ? `Llevas <b>${nf(all.ses)} entrenos</b> y <b>${nf(all.kcal)} kcal</b> quemadas. Eso son más o menos <b>${nf(all.kcal / 250)}</b> empanadas. ¡Siga así!` : 'Llevo tus cuentas. Cuando termines tu primer entreno, aquí verás cómo vas.')}`;
  SFPeriod.bind(box, 'progress', () => render());
  box.querySelector('#prStreak').addEventListener('click', () => SFToday.openStreaks());
}

/* ---------- Cuerpo ---------- */
const FIELDS = [['waist', 'Cintura'], ['neck', 'Cuello'], ['hip', 'Cadera'], ['chest', 'Pecho'], ['arm', 'Brazo'], ['thigh', 'Muslo']];
function fatPct(m){
  const h = me.height; if (!h || !m || !m.waist || !m.neck) return null;
  let v;
  if (me.sex === 'F'){ if (!m.hip) return null; v = 495 / (1.29579 - 0.35004 * Math.log10(m.waist + m.hip - m.neck) + 0.22100 * Math.log10(h)) - 450; }
  else if (me.sex === 'M'){ if (m.waist <= m.neck) return null; v = 495 / (1.0324 - 0.19077 * Math.log10(m.waist - m.neck) + 0.15456 * Math.log10(h)) - 450; }
  else return null;
  return v > 2 && v < 60 ? v : null;
}
function renderBody(box){
  const lw = lastWeight(), a = ageOf(me), bi = lw && me.height ? bmiInfo(lw.kg, me.height, me.sex, a) : null;
  const list = body.slice().sort((x, y) => x.d.localeCompare(y.d)), last = list[list.length - 1], prev = list[list.length - 2], fp = fatPct(last);
  const wpts = weights.slice().sort((x, y) => x.date.localeCompare(y.date)).slice(-30).map(w => ({ x: shortDate(w.date), v: w.kg }));
  const diff = (k) => last && prev && last[k] && prev[k] ? last[k] - prev[k] : null;
  box.innerHTML = `
    <div class="tiles">
      <button class="tile" style="--c:#7fb38a;--i:1" data-open="weight"><span>⚖️</span><b>MI PESO</b><small>${lw ? fmtKg(lw.kg) + ' kg' : 'Sin registros'}${bi ? ' · IMC ' + fmt1(bi.bmi) : ''}</small></button>
      <button class="tile" style="--c:#9d8fd0;--i:2" data-open="me"><span>👤</span><b>MI PERFIL</b><small>${me.height ? me.height + ' cm' : 'Altura, edad y género'}</small></button></div>
    <div class="sect"><h4>PESO</h4><div style="padding-bottom:10px">${SF.lineChart(wpts, '#7fb38a', { goal: wGoal || 0, fmt: v => fmtKg(v) + ' kg', empty: 'Registra tu peso al menos 2 veces para ver la gráfica.' })}</div></div>
    <div class="sect"><div style="display:flex;align-items:center"><h4 style="flex:1">MEDIDAS (cm)</h4><button class="smallbtn go" id="bdAdd" style="margin-top:6px">+ MEDIR</button></div>
      ${last ? `<div class="sfmeas">${FIELDS.filter(f => last[f[0]]).map(f => { const d = diff(f[0]); return `<div><b>${n1(last[f[0]])}</b><small>${f[1]}</small>${d ? `<em class="${d > 0 ? 'up' : 'down'}">${d > 0 ? '▲' : '▼'} ${n1(Math.abs(d))}</em>` : ''}</div>`; }).join('')}</div>
        <p class="hint">Última medición: ${niceDate(last.d).toLowerCase()}</p>
        ${fp != null ? `<div class="note" style="--c:#d6a660;margin:0 0 12px">📐 <span>Grasa corporal estimada: <b>${n1(fp)}%</b> · masa magra ≈ <b>${lw ? n1(lw.kg * (1 - fp / 100)) + ' kg' : '—'}</b></span></div>` : `<p class="hint">Para estimar tu % de grasa mide <b>cintura y cuello</b>${me.sex === 'F' ? ' y <b>cadera</b>' : ''}, y completa género y altura en tu perfil.</p>`}`
        : '<p class="empty">Mídete con una cinta métrica cada 2 a 4 semanas: la cintura dice más que la báscula.</p>'}
      ${list.length >= 2 ? `<h4 class="mini">CINTURA</h4><div style="padding-bottom:10px">${SF.lineChart(list.filter(m => m.waist).slice(-20).map(m => ({ x: shortDate(m.d), v: m.waist })), '#d6a660', { fmt: v => n1(v) + ' cm' })}</div>` : ''}
      ${list.slice().reverse().slice(0, 8).map(m => `<div class="row"><span class="l"><b>${FIELDS.filter(f => m[f[0]]).map(f => f[1] + ' ' + n1(m[f[0]])).join(' · ')}</b><small>${niceDate(m.d)}${fatPct(m) != null ? ' · grasa ≈ ' + n1(fatPct(m)) + '%' : ''}</small></span><button class="xbtn" data-md="${m.id}">×</button></div>`).join('')}
    </div>
    ${bi ? bmiCardHTML(bi, {}) : ''}${lw ? catCardHTML(lw.kg, me.sex, a, me.cat) : ''}`;
  box.querySelector('#bdAdd').addEventListener('click', () => openMeasure(last));
  box.querySelectorAll('[data-md]').forEach(b => b.addEventListener('click', async () => { if (await confirmDlg('¿Borrar medición?', 'Se quita del historial.', 'BORRAR')){ body = body.filter(m => m.id !== b.dataset.md); save('sf_body', body); render(); } }));
  box.querySelectorAll('[data-catsys]').forEach(b => b.addEventListener('click', () => { me.cat = b.dataset.catsys; saveMe(); hapticTap(); render(); }));
}
function openMeasure(last){
  const m = { id: uid(), d: todayISO() }; FIELDS.forEach(f => m[f[0]] = last && last[f[0]] ? last[f[0]] : 0);
  openForm(`<h3 class="ftitle">📏 MEDIRME</h3><p class="hint">En centímetros, con la cinta sin apretar. Deja en 0 lo que no midas. Cintura a la altura del ombligo; cuello debajo de la nuez.</p>
    ${FIELDS.map(f => `<div class="row" style="border:0;padding:6px 0"><div class="l"><b>${f[1]}</b></div><div class="stepper" data-mf="${f[0]}"></div></div>`).join('')}
    <label class="field"><span>Fecha</span><input type="date" id="msD" value="${m.d}" max="${todayISO()}"></label>
    <div class="btnrow"><button class="btn" id="msC">CANCELAR</button><button class="btn pri" id="msS" style="--bc:#d6a660">GUARDAR</button></div>`, sh => {
    sh.querySelectorAll('[data-mf]').forEach(st => makeStepper(st, { get: () => m[st.dataset.mf], set: v => m[st.dataset.mf] = Math.round(v * 10) / 10, min: 0, max: 250, step: 0.5, input: true, fmt: v => v ? n1(v) : '0', label: st.dataset.mf }));
    sh.querySelector('#msC').addEventListener('click', closeForm);
    sh.querySelector('#msS').addEventListener('click', () => { sh.querySelectorAll('input').forEach(i => i.blur()); if (!FIELDS.some(f => m[f[0]] > 0)) return toast('Escribe al menos una medida'); m.d = sh.querySelector('#msD').value || todayISO(); body = body.filter(x => x.d !== m.d); body.push(m); save('sf_body', body); closeForm(); render(); toast('Medidas guardadas'); });
  });
}

/* ---------- Medallas ---------- */
function renderMedals(box){
  SF.checkMedals(true);
  const md = SF.medals(), got = SF.MEDALS.filter(m => md[m[0]]);
  box.innerHTML = `<div class="sfmedhead">${SFArt.badge('samy', 60)}<div><b>${got.length} de ${SF.MEDALS.length} medallas</b><small>Cada una se gana entrenando, comiendo bien y siendo constante.</small><div class="trk"><i style="width:${got.length / SF.MEDALS.length * 100}%"></i></div></div></div>
    <div class="sfmedals">${SF.MEDALS.map((m, i) => `<div class="${md[m[0]] ? 'on' : ''}" style="--i:${i}"><span>${m[1]}</span><b>${esc(m[2])}</b><small>${md[m[0]] ? 'Ganada el ' + shortDate(md[m[0]]) : esc(m[3])}</small></div>`).join('')}</div>`;
}

/* ---------- Recordatorios (notificaciones del teléfono) ---------- */
const LN = plugin('LocalNotifications');
const REM = () => Object.assign({ train: false, trainH: 18, trainM: 0, food: false, water: false, sleep: false }, S.rem || {});
const IDS = [9120, 9101, 9102, 9110, 9111, 9112, 9113, 9114, 9115, 9116];
async function syncRem(ask){
  if (!LN) return false;
  const r = REM();
  try {
    if (ask){ const p = await LN.requestPermissions(); if (p && p.display && p.display !== 'granted'){ toast('Activa las notificaciones de la app en los ajustes del teléfono'); return false; } }
    await LN.cancel({ notifications: IDS.map(id => ({ id })) }).catch(() => {});
    const list = [], mk = (id, title, body, hour, minute) => list.push({ id, title: TT(title), body: TT(body), schedule: { on: { hour, minute }, allowWhileIdle: true } });
    const s = SF.streaks();
    if (r.train) mk(9101, s.day >= 2 ? `🔥 Tu racha de ${s.day} días te espera` : '🥊 Hora de entrenar', s.day >= 2 ? 'Entrena hoy para no perderla. Un entreno corto también cuenta.' : 'Abre Satronho BoxFit y dale al timer o a tu rutina.', r.trainH, r.trainM);
    if (r.food) mk(9102, '🍽️ ¿Ya anotaste tu comida?', 'Anota lo de hoy para saber cómo vas con tus calorías.', 20, 30);
    if (r.water) [9, 11, 13, 15, 17, 19].forEach((h, i) => mk(9110 + i, '💧 Toma agua', 'Un vaso ahora te acerca a tu meta del día.', h, 0));
    const sp = window.SFHealth && SFHealth.sleepPlan();
    if (r.sleep && sp && sp.bed){ let [h, m] = sp.bed.split(':').map(Number); m -= 30; if (m < 0){ m += 60; h = (h + 23) % 24; } mk(9120, '🌙 Se acerca tu hora de dormir', 'En media hora te toca. Dormir bien también es entrenar.', h, m); }
    if (list.length) await LN.schedule({ notifications: list });
    return true;
  } catch(e){ return false; }
}

/* ---------- Secciones nuevas en «Más» ---------- */
function renderSettings(){
  const top = $('#sfSetTop'), ex = $('#sfSetExtra'); if (!top || !ex) return;
  const lw = lastWeight(), a = ageOf(me), t = SFNutri.targets(), r = REM(), miss = SF.profileMissing();
  top.innerHTML = `
    <button class="sfprofile" id="stMe"><span class="av">${me.name ? esc(initials(me.name)) : '👤'}</span><span class="l"><b>${me.name ? esc(me.name) : 'Mi perfil'}</b><small>${[a ? ageText(a) : '', me.height ? me.height + ' cm' : '', lw ? fmtKg(lw.kg) + ' kg' : ''].filter(Boolean).join(' · ') || 'Completa tus datos'}</small>${miss.length ? `<small style="color:#d6a660">Falta: ${miss.join(', ')}</small>` : `<small>En reposo gastas ≈${nf(SF.bmr())} kcal al día</small>`}</span><span class="arrow">›</span></button>
    <div class="sect"><h4>METAS Y PLAN</h4>
      <div class="row"><span class="pic" style="--c:#d98a78">🎯</span><div class="l"><b>Metas del día</b><small>${nf(G.kcal)} kcal · ${G.min} min · ${nf(G.steps)} pasos · ${SF.weekGoal()} días por semana</small></div><button class="smallbtn" id="stGoals">CAMBIAR</button></div>
      <div class="row"><span class="pic" style="--c:#7fb38a">🍽️</span><div class="l"><b>Plan de comida</b><small>${nf(t.k)} kcal · P ${nf(t.p)} · C ${nf(t.c)} · G ${nf(t.f)} g</small></div><button class="smallbtn" id="stPlan">CAMBIAR</button></div>
      <div class="row"><span class="pic" style="--c:#9d8fd0">⚖️</span><div class="l"><b>Peso y medidas</b><small>${lw ? 'Último: ' + fmtKg(lw.kg) + ' kg' : 'Sin registros'}</small></div><button class="smallbtn" id="stBody">VER</button></div>
    </div>
    <div class="sect"><h4>MI SEMANA Y MIS METAS</h4>
      <div class="row"><span class="pic" style="--c:#7fb38a">🗓️</span><div class="l"><b>Plan semanal</b><small>${SFPlan.todayPlan() ? 'Hoy toca: ' + esc(SFPlan.label(SFPlan.todayPlan())) : 'Sin plan: arma tu semana cuando quieras'}</small></div><button class="smallbtn" id="stWeek">${SFPlan.todayPlan() ? 'CAMBIAR' : 'ARMAR'}</button></div>
      <div class="row"><span class="pic" style="--c:#d6a660">🎯</span><div class="l"><b>Modo meta</b><small>${SFPlan.goalInfo() ? 'Activo' : 'Meta de peso o pesaje de pelea'}</small></div><button class="smallbtn" id="stGoal">${SFPlan.goalInfo() ? 'VER' : 'ACTIVAR'}</button></div>
      <div class="row"><span class="pic" style="--c:#dc9a6e">🔥</span><div class="l"><b>Calentamiento sugerido</b><small>${S.warmSug === false ? 'Apagado' : 'Se sugiere antes de entrenar; siempre lo puedes saltar'}</small></div><button class="switch ${S.warmSug !== false ? 'on' : ''}" id="stWarm"></button></div>
    </div>
    <div class="sect"><h4>ACOMPAÑANTE</h4>
      <div class="row"><span class="sfcomp">${SFArt.badge(companion(), 46)}</span><div class="l"><b>${esc(gName())}</b><small>Te acompaña en todas las pantallas. MechaRidds boxeador siempre boxea en el timer.</small></div><button class="smallbtn" id="stComp">CAMBIAR</button></div></div>
    <div class="sect"><h4>SALUD</h4>
      <div class="row"><span class="pic" style="--c:#9d8fd0">🌙</span><div class="l"><b>Satronho Somnia</b><small>${SFSomnia.has() ? 'Sueño cruzado con tus entrenos' : 'Cruza tu sueño con tus entrenos'}</small></div><button class="smallbtn" id="stSleep">ABRIR</button></div>
      <div class="row"><span class="pic" style="--c:#6fa8c4">⌚</span><div class="l"><b>Reloj y Health Connect</b><small>${SFHealth.hcOn() ? 'Conectado' : 'Pasos y pulso desde tu reloj u otras apps'}</small></div><button class="smallbtn" id="stHC">ABRIR</button></div></div>
    ${window.SFWidget ? SFWidget.settingsHTML() : ''}
    ${window.SFI18n ? SFI18n.settingsHTML() : ''}`;
  ex.innerHTML = `
    <div class="sect"><h4>RECORDATORIOS</h4>
      ${LN ? '' : '<p class="hint">Funcionan en la app instalada en el teléfono.</p>'}
      <div class="row"><div class="l"><b>Hora de entrenar</b><small>Te aviso cada día para cuidar la racha</small></div><input type="time" id="rmT" class="ta" style="width:112px;margin:0;padding:6px 8px" value="${pad2(r.trainH)}:${pad2(r.trainM)}"><button class="switch ${r.train ? 'on' : ''}" data-rem="train"></button></div>
      <div class="row"><div class="l"><b>Anotar la comida</b><small>Todos los días a las 8:30 pm</small></div><button class="switch ${r.food ? 'on' : ''}" data-rem="food"></button></div>
      <div class="row"><div class="l"><b>Tomar agua</b><small>Cada dos horas, de 9 am a 7 pm</small></div><button class="switch ${r.water ? 'on' : ''}" data-rem="water"></button></div>
    </div>
    <div class="sect"><h4>REPORTE</h4>
      <div class="row"><span class="pic" style="--c:#d98585">📄</span><div class="l"><b>Exportar un reporte en PDF</b><small>Entrenos, comida, peso, salud y medallas del periodo que elijas. Solo cuando tú quieras.</small></div><button class="smallbtn" id="stPdf">CREAR</button></div></div>
    <div class="sect"><h4>MEDICIÓN</h4>
      <div class="row"><div class="l"><b>Contar pasos con el teléfono</b><small>Usa el sensor del celular; los suma cada vez que abres la app</small></div><button class="switch ${S.stepSensor ? 'on' : ''}" id="stSteps"></button></div>
      <div class="row"><div class="l"><b>Unidad de las pesas</b></div><div class="seg" id="stUnit" style="margin:0;width:120px"><button type="button" data-u="kg">KG</button><button type="button" data-u="lb">LB</button></div></div>
      <div class="row"><div class="l"><b>Modo clase</b><small>El timer y las sesiones de boxeo no guardan nada (para prestar el celular o dar clase)</small></div><button class="switch ${S.noSave ? 'on' : ''}" id="stNoSave"></button></div>
    </div>`;
  top.querySelector('#stMe').addEventListener('click', () => go('me'));
  top.querySelector('#stGoals').addEventListener('click', () => SF.openGoalsForm());
  top.querySelector('#stPlan').addEventListener('click', () => SFNutri.openPlan());
  top.querySelector('#stBody').addEventListener('click', () => show('body'));
  top.querySelector('#stWeek').addEventListener('click', () => SFPlan.openPlanEditor());
  top.querySelector('#stGoal').addEventListener('click', () => SFPlan.openGoal());
  top.querySelector('#stWarm').addEventListener('click', e => { S.warmSug = S.warmSug === false; saveSettings(); e.currentTarget.classList.toggle('on', S.warmSug !== false); });
  top.querySelector('#stComp').addEventListener('click', () => SFPets.openCompanion());
  top.querySelector('#stSleep').addEventListener('click', () => SFNav.go('health:sleep'));
  top.querySelector('#stHC').addEventListener('click', () => SFNav.go('health:steps'));
  if (window.SFWidget) SFWidget.bind(top);
  if (window.SFI18n) SFI18n.bind(top);
  ex.querySelectorAll('[data-rem]').forEach(b => b.addEventListener('click', async () => {
    const k = b.dataset.rem, r2 = REM(); r2[k] = !r2[k]; S.rem = r2; saveSettings(); b.classList.toggle('on', r2[k]); hapticTap();
    if (!LN){ if (r2[k]) toast('Los avisos llegan en la app instalada en el teléfono'); return; }
    const ok = await syncRem(r2[k]); if (r2[k] && !ok){ r2[k] = false; S.rem = r2; saveSettings(); b.classList.remove('on'); } else if (r2[k]) toast('Recordatorio activado');
  }));
  ex.querySelector('#stPdf').addEventListener('click', () => SFReport.open());
  ex.querySelector('#rmT').addEventListener('change', e => { const [h, m] = (e.target.value || '18:00').split(':').map(Number); const r2 = REM(); r2.trainH = h; r2.trainM = m || 0; S.rem = r2; saveSettings(); syncRem(); });
  ex.querySelector('#stSteps').addEventListener('click', async e => { const b = e.currentTarget, on = !b.classList.contains('on'); b.classList.toggle('on', on); const ok = await SF.enableSteps(on); if (on && !ok) b.classList.remove('on'); });
  ex.querySelectorAll('#stUnit [data-u]').forEach(b => { b.classList.toggle('on', b.dataset.u === SFGym.unit()); b.addEventListener('click', () => { S.unit = b.dataset.u; saveSettings(); hapticTap(); ex.querySelectorAll('#stUnit [data-u]').forEach(x => x.classList.toggle('on', x === b)); }); });
  ex.querySelector('#stNoSave').addEventListener('click', e => { S.noSave = !S.noSave; saveSettings(); hapticTap(); e.currentTarget.classList.toggle('on', S.noSave); toast(S.noSave ? 'Modo clase: no se guarda nada' : 'Modo personal: todo vuelve a guardarse'); });
}
function show(t){ SFNav.go('progress:' + t); }

Object.assign(GUIDE, {
  progress: () => ({ t:'tu progreso', b:[`<p>Tres pestañas: <b>Resumen</b> (calorías, tiempo y entrenos por periodo), <b>Cuerpo</b> (peso, medidas y % de grasa) y <b>Medallas</b>.</p>`, `<ul><li>Arriba eliges el periodo: semana, mes, 3 meses o año.</li><li>La barra de colores muestra cuánto fue boxeo, pesas y cardio.</li><li>Desde aquí abres el <b>calendario</b> y tus <b>rachas</b>.</li></ul>`] }),
});
window.SFProgress = { render, show };
window.SFSettings = { render: renderSettings };
window.SFRemind = { sync: () => syncRem(false), ask: () => syncRem(true), REM };
})();
