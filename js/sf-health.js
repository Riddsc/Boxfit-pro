/* =========================================================
   SATRONHO BOXFIT · SALUD (al estilo de Google Fit / Salud)
   · Pasos: del sensor del teléfono, de Health Connect o a mano; por hora y por día.
   · Puntos cardio: como los de Google y la OMS: 1 punto por minuto de actividad
     moderada y 2 por minuto de actividad intensa; la meta es 150 a la semana.
   · Corazón: pulso con la cámara y el flash (dedo sobre la cámara, unos 30 s)
     o desde un reloj por Health Connect. Pulso máximo: fórmula de Tanaka
     (208 − 0,7 × edad); zonas por reserva de pulso (Karvonen) si hay pulso en reposo.
   · Sueño: Satronho Somnia.
   Nada de esto es un aparato médico: si algo te preocupa, consulta a un médico.
   ========================================================= */
(function(){
const { nf, n1, hm } = SF;
const HC = plugin('HealthConnect');
let hr = load('sf_hr', []);                  // mediciones: [{ id, ts, bpm, src:'cam'|'hc'|'man', ctx:'rest'|'post'|'other' }]
let hcState = load('sf_hc', { on: false, at: 0 });
const saveHR = () => save('sf_hr', hr);
const TITLES = { sum: 'MI SALUD', steps: 'PASOS Y ACTIVIDAD', heart: 'CORAZÓN', sleep: 'SUEÑO' };
SF.view('health', 'MI SALUD', { render, back: true });

function render(){
  const tab = SFNav.tab.health, body = $('#healthBody');
  $('#healthTitle').textContent = TITLES[tab];
  if (tab === 'heart') renderHeart(body); else if (tab === 'sleep') renderSleep(body); else if (tab === 'steps') renderSteps(body); else renderSum(body);
}

/* ---------- Puntos cardio ---------- */
function cardioPts(ds){
  let p = 0;
  sessLog.filter(h => h.d === ds).forEach(h => {
    const a = SF.ACT[h.a] || SF.ACT[h.t === 'gym' ? 'w_mod' : 'box_class'], met = a.met * ([0, 0.82, 1, 1.18][h.i || 2] || 1);
    if (met >= 3) p += SF.minOf(h) * (met >= 6 ? 2 : 1);
  });
  // caminata rápida: en las horas con muchos pasos, los que pasan de 1.500 cuentan como minutos a paso vivo (≈110 por minuto)
  const hh = SF.stepHours()[ds];
  if (hh) hh.forEach(v => { if (v >= 2500) p += Math.min(60, Math.round((v - 1500) / 110)); });
  return Math.round(p);
}
const weekPts = () => { let s = 0; const mon = SF.mondayOf(todayISO()); for (let i = 0; i < 7; i++){ const d = addDays(mon, i); if (d <= todayISO()) s += cardioPts(d); } return s; };
const stride = () => (me.height || 170) * 0.415 / 100;     // metros por paso

/* ---------- Pasos ---------- */
function renderSteps(body){
  const t = todayISO(), st = SF.steps()[t] || 0, G = SF.G, b = SF.dayBurn(t), pts = cardioPts(t), wp = weekPts();
  const hh = SF.stepHours()[t] || new Array(24).fill(0), nowH = new Date().getHours();
  const hours = hh.slice(5, 24).map((v, i) => ({ l: (i + 5) % 3 === 0 ? String(i + 5) : '', v, hi: i + 5 === nowH }));
  const week = []; for (let i = 6; i >= 0; i--){ const d = addDays(t, -i); week.push({ l: WD[parseISO(d).getDay()], v: SF.steps()[d] || 0, hi: d === t }); }
  const ptsWeek = []; for (let i = 6; i >= 0; i--){ const d = addDays(t, -i); ptsWeek.push({ l: WD[parseISO(d).getDay()], v: cardioPts(d), hi: d === t }); }
  let s30 = 0, n30 = 0; for (let i = 0; i < 30; i++){ const v = SF.steps()[addDays(t, -i)] || 0; if (v){ s30 += v; n30++; } }
  body.innerHTML = `
    <div class="sect sfgfit">
      <div class="rg">${SF.ring(b.min / G.min, '#7fb38a', 170, 14)}<div class="r2">${SF.ring(pts / Math.max(1, Math.round(150 / 7)), '#6fa8c4', 132, 14)}</div>
        <div class="sfringin"><b style="color:#7fb38a">${b.min}</b><small>MIN. DE MOVIMIENTO</small><b style="color:#6fa8c4;margin-top:4px">${pts}</b><small>PUNTOS CARDIO</small></div></div>
      <div class="three"><div><b>${nf(st)}</b><small>Pasos</small></div><div><b>${n1(st * stride() / 1000)}</b><small>km</small></div><div><b>${nf(b.active)}</b><small>kcal activas</small></div></div>
      <div class="trk"><i style="width:${clamp(st / G.steps * 100, 0, 100)}%;background:#7aa9d1"></i></div>
      <p class="hint" style="text-align:center">${st >= G.steps ? '¡Meta de pasos cumplida! 👟' : 'Faltan ' + nf(G.steps - st) + ' pasos para tu meta de ' + nf(G.steps)}</p>
      <div class="btnrow"><button class="btn" id="hsEdit">✏️ PASOS</button><button class="btn" id="hsGoals">🎯 METAS</button></div>
    </div>
    ${stepsPeriodHTML()}
    <div class="sect"><h4>PUNTOS CARDIO · SEMANA</h4>
      <div class="sfweekpts"><div class="ringbox">${SF.ring(wp / 150, '#6fa8c4', 96, 10, `<b>${wp}</b><small>de 150</small>`)}</div>
        <p>La OMS recomienda <b>150 minutos</b> de actividad moderada a la semana. Ganas <b>1 punto</b> por minuto moderado (caminar rápido, pesas) y <b>2</b> por minuto intenso (boxeo, correr).${wp >= 150 ? ' <b>¡Meta semanal cumplida!</b>' : ''}</p></div>
      ${SF.bars(ptsWeek, '#6fa8c4', 0, '')}</div>
    ${hcCardHTML()}
    <div class="sect"><h4>PASOS AUTOMÁTICOS</h4><div class="row" style="border:0"><span class="pic" style="--c:var(--mode)">👟</span><div class="l"><b>Contar pasos con el teléfono</b><small>${S.stepSensor ? 'Se cuentan solos, aunque la app esté cerrada, con el sensor del celular (casi no gasta batería).' : 'Apagado: actívalo y el teléfono los cuenta solo, como Google.'}</small></div><button class="switch ${S.stepSensor ? 'on' : ''}" id="hsSensor"></button></div>
      ${S.stepSensor ? '<div id="hsBatt"></div>' : ''}</div>`;
  body.querySelector('#hsEdit').addEventListener('click', () => SF.openStepsForm());
  body.querySelector('#hsGoals').addEventListener('click', () => SF.openGoalsForm());
  body.querySelector('#hsSensor').addEventListener('click', async e => { const bt = e.currentTarget, on = !bt.classList.contains('on'); bt.classList.toggle('on', on); const ok = await SF.enableSteps(on); if (on && !ok) bt.classList.remove('on'); else render(); });
  bindHC(body);
  SFPeriod.bind(body, 'steps', () => render());
  battCheck(body);
}
function stepsPeriodHTML(){
  const p = SFPeriod.get('steps', 'd'), G = SF.G, st = SF.steps(), val = d => st[d] || 0;
  const data = SFPeriod.buckets(p, val, { hours: d => SF.stepHours()[d], agg: 'sum' }), sm = SFPeriod.stats(p, val);
  const head = p === 'd' ? `<b>${nf(val(todayISO()))}</b><small>pasos hoy</small>` : `<b>${nf(sm.avg)}</b><small>${sm.days ? 'pasos al día en promedio' : 'sin pasos en este periodo'}</small>`;
  const empty = p === 'd' && !data.some(x => x.v);
  return `<div class="sect"><h4>PASOS · ${SFPeriod.title(p).toUpperCase()}</h4>${SFPeriod.seg('steps', 'd')}<div class="sfperhead">${head}</div>
    ${empty ? `<p class="empty">${S.stepSensor || hcState.on ? 'Tus pasos de hoy irán apareciendo aquí hora por hora.' : 'Activa los pasos automáticos o conecta Health Connect para ver tus pasos por hora.'}</p>` : SF.bars(data, '#7aa9d1', p === 'd' ? 0 : G.steps, '')}
    <p class="hint">${SFPeriod.unitNote(p)}${sm.best && p !== 'd' ? ' · Mejor día: <b>' + nf(sm.best) + '</b>' : ''}</p></div>`;
}
// Algunos teléfonos (Xiaomi, Samsung, Huawei…) frenan las apps cerradas para ahorrar batería
async function battCheck(body){
  const box = body.querySelector('#hsBatt'), P = SF.stepsPlugin(); if (!box || !P) return;
  try {
    const r = await P.batteryOk(); if (r && r.ok) return;
    box.innerHTML = `<div class="sfbatt"><b>¿Los pasos no avanzan con la app cerrada?</b><small>Tu teléfono puede estar frenándola para ahorrar batería. Toca abajo y elige <b>Permitir</b> o <b>Sin restricciones</b>.</small><button class="smallbtn go" id="hsBattGo">PERMITIR EN SEGUNDO PLANO</button></div>`;
    box.querySelector('#hsBattGo').addEventListener('click', () => P.openBattery());
  } catch(e){}
}

/* ---------- Health Connect (reloj, Google Fit, Samsung Health…) ---------- */
const HC_TYPES = ['Steps', 'HeartRateSeries', 'RestingHeartRate'];
function hcCardHTML(){
  return `<div class="sect"><h4>RELOJ Y OTRAS APPS · HEALTH CONNECT</h4>
    <div class="row" style="border:0"><span class="pic" style="--c:#6fa8c4">⌚</span><div class="l"><b>${hcState.on ? 'Conectado' : 'Sin conectar'}</b><small>${hcState.on ? 'Último dato: ' + (hcState.at ? niceDate(iso(new Date(hcState.at))).toLowerCase() : 'todavía nada') : 'Si usas reloj o pulsera (o Google Fit, Samsung Health), BoxFit lee de ahí tus pasos y tu pulso. Solo lee: nunca escribe.'}</small></div>
      <button class="smallbtn ${hcState.on ? '' : 'go'}" id="hcBtn">${hcState.on ? 'ACTUALIZAR' : 'CONECTAR'}</button></div>
    ${hcState.on ? '<button class="linkbtn" id="hcOff">Desconectar</button>' : ''}</div>`;
}
function bindHC(root){
  const b = root.querySelector('#hcBtn'); if (b) b.addEventListener('click', async () => { if (!hcState.on){ if (await connectHC()) await syncHC(true); } else await syncHC(true); render(); });
  const o = root.querySelector('#hcOff'); if (o) o.addEventListener('click', () => { hcState.on = false; save('sf_hc', hcState); toast('Health Connect desconectado'); render(); });
}
async function connectHC(){
  if (!HC){ toast('Health Connect funciona en la app instalada en el teléfono'); return false; }
  try {
    const a = await HC.checkAvailability();
    if (a.availability !== 'Available'){ toast('Instala o actualiza la app Health Connect de Google'); try { await HC.openHealthConnectSetting(); } catch(e){} return false; }
    const r = await HC.requestHealthPermissions({ read: HC_TYPES, write: [] });
    if (!r.grantedPermissions || !r.grantedPermissions.length){ toast('Sin permisos no puedo leer nada'); return false; }
    hcState.on = true; save('sf_hc', hcState); toast('Health Connect conectado ⌚'); return true;
  } catch(e){ toast('No se pudo conectar con Health Connect'); return false; }
}
async function hcRead(type, from, to){
  const out = []; let pageToken;
  for (let i = 0; i < 8; i++){
    const r = await HC.readRecords(Object.assign({ type, timeRangeFilter: { type: 'between', startTime: new Date(from), endTime: new Date(to) }, pageSize: 500 }, pageToken ? { pageToken } : {}));
    out.push(...(r.records || [])); pageToken = r.pageToken; if (!pageToken) break;
  }
  return out;
}
async function syncHC(loud){
  if (!HC || !hcState.on) return false;
  try {
    const to = Date.now(), from = to - 7 * 864e5;
    const [stR, hrR, rhR] = await Promise.all(HC_TYPES.map(tp => hcRead(tp, from, to).catch(() => [])));
    const byDay = {}, byHour = {};
    stR.forEach(r => { const a = new Date(r.startTime), d = iso(a); byDay[d] = (byDay[d] || 0) + (r.count || 0); const h = byHour[d] || (byHour[d] = new Array(24).fill(0)); h[a.getHours()] += r.count || 0; });
    if (stR.length) SF.setStepsFromHC(byDay, byHour);
    // pulso: una medición por hora (la más baja), y el pulso en reposo de cada día
    const seen = new Set(hr.filter(x => x.src === 'hc').map(x => x.ts));
    const perHour = {};
    hrR.forEach(r => (r.samples || []).forEach(sm => { const ts = new Date(sm.time).getTime(), k = Math.floor(ts / 3600e3); if (!perHour[k] || sm.beatsPerMinute < perHour[k].bpm) perHour[k] = { ts, bpm: sm.beatsPerMinute }; }));
    Object.values(perHour).forEach(x => { if (!seen.has(x.ts)) hr.push({ id: uid(), ts: x.ts, bpm: Math.round(x.bpm), src: 'hc', ctx: 'other' }); });
    rhR.forEach(r => { const ts = new Date(r.time).getTime(); if (!seen.has(ts)) hr.push({ id: uid(), ts, bpm: Math.round(r.beatsPerMinute), src: 'hc', ctx: 'rest' }); });
    hr.sort((a, b) => a.ts - b.ts); if (hr.length > 3000) hr = hr.slice(-3000); saveHR();
    hcState.at = Date.now(); save('sf_hc', hcState);
    if (loud) toast(`Health Connect: ${stR.length ? 'pasos' : 'sin pasos'}${hrR.length || rhR.length ? ' y pulso' : ''} al día`);
    return true;
  } catch(e){ if (loud) toast('No se pudo leer Health Connect'); return false; }
}

/* ---------- Corazón ---------- */
function restingHR(){
  const from = Date.now() - 14 * 864e5, r = hr.filter(x => x.ts >= from && x.ctx === 'rest').map(x => x.bpm);
  if (!r.length) return null;
  r.sort((a, b) => a - b); return r[Math.floor(r.length / 2)];
}
const maxHR = () => Math.round(208 - 0.7 * SF.ageY());
function zones(){
  const mx = maxHR(), rs = restingHR(), z = [[50, 60, 'Muy suave', 'Recuperación', '#94a3b8'], [60, 70, 'Suave', 'Quema de grasa y base', '#7fb38a'], [70, 80, 'Moderada', 'Resistencia aeróbica', '#cdb262'], [80, 90, 'Intensa', 'Rounds y sparring', '#dc9a6e'], [90, 100, 'Máxima', 'Sprints y explosión', '#d98585']];
  return z.map(([a, b, n, u, c]) => { const f = p => Math.round(rs ? rs + (mx - rs) * p / 100 : mx * p / 100); return { a: f(a), b: f(b), n, u, c, pa: a, pb: b }; });
}
function hrClass(bpm){ return bpm < 50 ? ['Bajo', '#7aa9d1'] : bpm <= 100 ? ['Normal en reposo', '#7fb38a'] : ['Alto para estar en reposo', '#d6a660']; }
function renderHeart(body){
  const last = hr[hr.length - 1], rs = restingHR(), mx = maxHR(), zs = zones();
  const per = SFPeriod.get('heart', 'm'), since = per === 'd' ? parseISO(todayISO()).getTime() : Date.now() - SFPeriod.DAYS[per] * 864e5;
  const inPer = hr.filter(x => x.ts >= since && (per === 'd' || x.ctx === 'rest'));
  const pts = (per === 'q' || per === 'y' ? weeklyRest(inPer) : inPer.map(x => ({ x: per === 'd' ? pad2(new Date(x.ts).getHours()) + ':' + pad2(new Date(x.ts).getMinutes()) : shortDate(iso(new Date(x.ts))), v: x.bpm }))).slice(-60);
  const pv = inPer.map(x => x.bpm), pAvg = pv.length ? Math.round(pv.reduce((a, b) => a + b, 0) / pv.length) : 0;
  body.innerHTML = `
    <div class="sect sfheart">
      <div class="big"><span class="hb">❤️</span><b>${last ? last.bpm : '—'}</b><small>lpm</small></div>
      <p class="hint" style="text-align:center">${last ? (last.ctx === 'rest' ? hrClass(last.bpm)[0] + ' · ' : '') + niceDate(iso(new Date(last.ts))).toLowerCase() + ' ' + pad2(new Date(last.ts).getHours()) + ':' + pad2(new Date(last.ts).getMinutes()) + ' · ' + ({ cam: 'con la cámara', hc: 'del reloj', man: 'anotado a mano' })[last.src] : 'Todavía no hay mediciones'}</p>
      <button class="btn pri" id="hmCam" style="width:100%;flex:none;--bc:#d98585;margin-bottom:8px">📷 MEDIR CON LA CÁMARA</button>
      <div class="btnrow"><button class="btn" id="hmMan">✏️ ANOTAR</button><button class="btn" id="hmHC">⌚ RELOJ</button></div>
    </div>
    <div class="kpis"><div class="kpi" style="--kc:#7fb38a"><b>${rs || '—'}</b><span>Pulso en reposo</span></div><div class="kpi" style="--kc:#d98585"><b>${mx}</b><span>Pulso máximo estimado</span></div></div>
    <div class="sect"><h4>${per === 'd' ? 'PULSO · HOY' : 'PULSO EN REPOSO · ' + SFPeriod.title(per).toUpperCase()}</h4>${SFPeriod.seg('heart', 'm')}
      <div class="sfperhead">${pAvg ? `<b>${pAvg} <span style="font-size:.5em">lpm</span></b><small>${per === 'd' ? 'promedio de hoy' : 'promedio'} · ${Math.min(...pv)}–${Math.max(...pv)}</small>` : '<b>—</b><small>sin mediciones en este periodo</small>'}</div><div style="padding-bottom:8px">${SF.lineChart(pts, '#d98585', { fmt: v => Math.round(v) + ' lpm', minSpan: 8, empty: 'Mide tu pulso en reposo (sentado, tranquilo, mejor al despertar) al menos 2 días para ver la gráfica.' })}</div>
      <p class="hint">Un pulso en reposo que baja con las semanas es señal de mejor forma física. Si sube varios días seguidos, puede ser cansancio, poco sueño o que te estás enfermando.</p></div>
    <div class="sect"><h4>ZONAS DE ENTRENAMIENTO</h4>${zs.map(z => `<div class="sfzone" style="--c:${z.c}"><i></i><span class="l"><b>${z.n} · ${z.pa}-${z.pb}%</b><small>${z.u}</small></span><em>${z.a}-${z.b}</em></div>`).join('')}
      <p class="hint">${rs ? 'Calculadas con tu pulso en reposo (método de Karvonen).' : 'Mide tu pulso en reposo y las zonas se ajustan mejor a ti.'} En los rounds de boxeo lo normal es estar en zona intensa.</p></div>
    <div class="sect"><h4>MEDICIONES</h4>${hr.slice().reverse().filter(x => x.src !== 'hc' || x.ctx === 'rest').slice(0, 12).map(x => `<div class="row"><span class="l"><b>${x.bpm} lpm</b><small>${niceDate(iso(new Date(x.ts)))} ${pad2(new Date(x.ts).getHours())}:${pad2(new Date(x.ts).getMinutes())} · ${({ rest: 'En reposo', post: 'Después de entrenar', other: 'Otro momento' })[x.ctx]}</small></span>${x.src !== 'hc' ? `<button class="xbtn" data-hd="${x.id}">×</button>` : '<small>⌚</small>'}</div>`).join('') || '<p class="empty">Sin mediciones.</p>'}</div>
    ${SFPets.says(null, 'La medición con la cámara es aproximada: sirve para seguir tu tendencia, no para diagnosticar. Si sientes dolor en el pecho, mareo o palpitaciones raras, busca atención médica.')}`;
  SFPeriod.bind(body, 'heart', () => render());
  body.querySelector('#hmCam').addEventListener('click', openCamera);
  body.querySelector('#hmMan').addEventListener('click', openManual);
  body.querySelector('#hmHC').addEventListener('click', async () => { if (!hcState.on){ if (await connectHC()) await syncHC(true); } else await syncHC(true); render(); });
  body.querySelectorAll('[data-hd]').forEach(b => b.addEventListener('click', async () => { if (await confirmDlg('¿Borrar medición?', '', 'BORRAR')){ hr = hr.filter(x => x.id !== b.dataset.hd); saveHR(); render(); } }));
}
function addHR(bpm, src, ctx, noCheck){ hr.push({ id: uid(), ts: Date.now(), bpm: Math.round(bpm), src, ctx }); saveHR(); if (ctx === 'rest' && !noCheck) setTimeout(() => hrCheck(Math.round(bpm)), 450); }
// Promedio semanal del pulso en reposo (para 3 meses y año)
function weeklyRest(list){
  const by = {}; list.forEach(x => { const k = SF.mondayOf(iso(new Date(x.ts))); (by[k] = by[k] || []).push(x.bpm); });
  return Object.keys(by).sort().map(k => ({ x: shortDate(k), v: Math.round(by[k].reduce((a, b) => a + b, 0) / by[k].length) }));
}
/* ---------- Revisiones de salud: pulso alto o bajo en reposo (solo informativo) ---------- */
const HR_HI = 100, HR_LO = 50;
const checkOn = k => S['hr' + k] !== false;
function alerts(days){ const from = Date.now() - days * 864e5; return hr.filter(x => x.ts >= from && x.ctx === 'rest' && x.src !== 'hc'); }
function hrCheck(bpm){
  const hi = bpm > HR_HI && checkOn('Hi'), lo = bpm < HR_LO && checkOn('Lo');
  if (!hi && !lo) return;
  openForm(`<div class="sfalert ${hi ? 'hi' : 'lo'}"><div class="ic">${hi ? '💓' : '💙'}</div><h3 class="ftitle">${hi ? 'PULSO ALTO EN REPOSO' : 'PULSO BAJO EN REPOSO'}</h3>
    <div class="big"><b>${bpm}</b> lpm</div>
    <p>${hi ? `Está por encima de ${HR_HI} lpm. Puede pasar por café, estrés, calor, fiebre o porque no estabas del todo en reposo.` : `Está por debajo de ${HR_LO} lpm. En personas muy entrenadas puede ser normal.`}</p>
    <p class="hint">Mide de nuevo en 5 minutos, sentado y tranquilo. ${hi ? 'Si se repite seguido o tienes dolor en el pecho, mareo o falta de aire' : 'Si te sientes mareado, débil o te desmayas'}, consulta a un médico. Esto es solo informativo, no un diagnóstico.</p>
    <button class="btn pri" id="alOk" style="width:100%">ENTENDIDO</button></div>`, sh => sh.querySelector('#alOk').addEventListener('click', closeForm));
}
function checksHTML(){
  const a = alerts(30), nHi = a.filter(x => x.bpm > HR_HI).length, nLo = a.filter(x => x.bpm < HR_LO).length;
  const row = (k, ic, t, n) => `<div class="row"><span class="pic" style="--c:var(--mode)">${ic}</span><div class="l"><b>${t}</b><small>${checkOn(k) ? (n ? (n === 1 ? '1 aviso en 30 días' : n + ' avisos en 30 días') : 'Activado · sin avisos') : 'Apagado'}</small></div><button class="switch ${checkOn(k) ? 'on' : ''}" data-chk="${k}"></button></div>`;
  return `<div class="sect"><h4>REVISIONES DE SALUD</h4>${row('Hi', '💓', 'Pulso alto en reposo', nHi)}${row('Lo', '💙', 'Pulso bajo en reposo', nLo)}
    <p class="hint">Te aviso si una medición en reposo sale por encima de ${HR_HI} o por debajo de ${HR_LO} lpm. Es solo informativo.</p></div>`;
}
const ctxSeg = (id, cur) => `<div class="seg" id="${id}"><button type="button" data-c="rest" class="${cur === 'rest' ? 'on' : ''}">EN REPOSO</button><button type="button" data-c="post" class="${cur === 'post' ? 'on' : ''}">TRAS ENTRENAR</button><button type="button" data-c="other" class="${cur === 'other' ? 'on' : ''}">OTRO</button></div>`;
function bindCtx(sh, id, st){ sh.querySelectorAll('#' + id + ' [data-c]').forEach(b => b.addEventListener('click', () => { st.ctx = b.dataset.c; sh.querySelectorAll('#' + id + ' [data-c]').forEach(x => x.classList.toggle('on', x === b)); })); }
function openManual(){
  const st = { bpm: 70, ctx: 'rest' };
  openForm(`<h3 class="ftitle">✏️ ANOTAR PULSO</h3><p class="hint">Por ejemplo, el que te marca un tensiómetro o un oxímetro.</p>
    <div class="field"><span>Pulsaciones por minuto</span><div class="stepper big" id="mhB"></div></div>${ctxSeg('mhC', st.ctx)}
    <div class="btnrow"><button class="btn" id="mhX">CANCELAR</button><button class="btn pri" id="mhOk" style="--bc:#d98585">GUARDAR</button></div>`, sh => {
    makeStepper(sh.querySelector('#mhB'), { get: () => st.bpm, set: v => st.bpm = Math.round(v), min: 30, max: 220, input: true, label: 'Pulso' });
    bindCtx(sh, 'mhC', st);
    sh.querySelector('#mhX').addEventListener('click', closeForm);
    sh.querySelector('#mhOk').addEventListener('click', () => { sh.querySelectorAll('input').forEach(i => i.blur()); addHR(st.bpm, 'man', st.ctx); closeForm(); toast('Pulso guardado'); render(); });
  });
}

/* Medición con la cámara (fotopletismografía): con el flash prendido, el color del
   dedo cambia un poquito con cada latido. Se mide el rojo promedio ~30 veces por
   segundo, se filtra y se cuentan los picos. */
let cam = null;
function stopCam(){
  if (!cam) return;
  cam.stop = true;
  try { cam.stream.getTracks().forEach(t => { try { t.applyConstraints({ advanced: [{ torch: false }] }); } catch(e){} t.stop(); }); } catch(e){}
  keepAwake(false); cam = null;
}
async function openCamera(){
  const st = { ctx: 'rest' };
  openForm(`<h3 class="ftitle">📷 MEDIR EL PULSO</h3>
    <p class="hint" id="cmTip">Tapa con la yema del dedo índice la cámara de atrás <b>y el flash</b>, sin apretar. Apoya la mano y quédate quieto unos 20 a 40 segundos.</p>
    <div class="sfcam"><div class="ringbox" id="cmRing">${SF.ring(0, '#d98585', 150, 12, '<b id="cmBpm">—</b><small id="cmSt">PREPARANDO</small>')}</div><canvas id="cmWave" width="320" height="70"></canvas></div>
    ${ctxSeg('cmC', st.ctx)}
    <video id="cmV" playsinline muted style="width:1px;height:1px;opacity:0;position:absolute"></video>
    <div class="btnrow"><button class="btn" id="cmX">CANCELAR</button><button class="btn pri" id="cmOk" style="--bc:#d98585" disabled>GUARDAR</button></div>`, async sh => {
    bindCtx(sh, 'cmC', st);
    sh.querySelector('#cmX').addEventListener('click', () => { stopCam(); closeForm(); });
    let result = null, quality = 0;
    sh.querySelector('#cmOk').addEventListener('click', () => { if (!result) return; stopCam(); addHR(result, 'cam', st.ctx, quality < 0.6); closeForm(); toast(`❤️ ${result} lpm guardado`); render(); });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 176 }, height: { ideal: 144 }, frameRate: { ideal: 30 } }, audio: false });
      const v = sh.querySelector('#cmV'); v.srcObject = stream; await v.play();
      const track = stream.getVideoTracks()[0];
      try { const cp = track.getCapabilities ? track.getCapabilities() : {}; if (cp.torch) await track.applyConstraints({ advanced: [{ torch: true }] }); else sh.querySelector('#cmTip').innerHTML += ' <b>Este teléfono no deja prender el flash desde la app: mide con buena luz.</b>'; } catch(e){}
      keepAwake(true);
      cam = { stream, stop: false };
      measure(sh, v, (bpm, q) => { result = bpm; quality = q; sh.querySelector('#cmOk').disabled = false; });
    } catch(e){
      sh.querySelector('#cmSt').textContent = 'SIN CÁMARA';
      sh.querySelector('#cmTip').innerHTML = 'No pude usar la cámara. Revisa que la app tenga permiso de cámara en los ajustes del teléfono, o anota el pulso a mano.';
    }
  });
  const _cf = closeForm; // si se cierra el formulario de otra forma, se apaga la cámara
  const watch = setInterval(() => { if (!$('#formModal').classList.contains('show')){ stopCam(); clearInterval(watch); } }, 500);
}
function measure(sh, video, done){
  const c = document.createElement('canvas'); c.width = 40; c.height = 30;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  const wave = sh.querySelector('#cmWave'), wctx = wave.getContext('2d');
  const sig = [], MIN = 20000, MAX = 40000, SETTLE = 2500;
  let fingerSince = 0, lostSince = 0;
  const $s = q => sh.querySelector(q);
  const step = () => {
    if (!cam || cam.stop) return;
    ctx.drawImage(video, 0, 0, 40, 30);
    const d = ctx.getImageData(0, 0, 40, 30).data; let r = 0, g = 0, b = 0;
    for (let i = 0; i < d.length; i += 4){ r += d[i]; g += d[i + 1]; b += d[i + 2]; }
    const n = d.length / 4; r /= n; g /= n; b /= n;
    // dedo sobre la cámara: la imagen se ve roja (o casi blanca y rojiza si el flash satura)
    const finger = r > 60 && r >= g * 1.15 && r >= b * 1.15;
    const now = performance.now();
    if (!finger){
      if (!lostSince) lostSince = now;
      if (now - lostSince > 800){ fingerSince = 0; sig.length = 0; $s('#cmSt').textContent = 'PON EL DEDO'; $s('#cmBpm').textContent = '—'; paintRing(0); }
    } else {
      lostSince = 0;
      if (!fingerSince) fingerSince = now;
      if (now - fingerSince > SETTLE) sig.push({ t: now, r, g });
      const el = sig.length ? now - sig[0].t : 0;
      paintRing(el / MIN);
      $s('#cmSt').textContent = el ? 'MIDIENDO…' : 'QUIETO…';
      if (el > 10000 && sig.length % 10 === 0){
        const live = calcBpm(sig, false);
        if (live){ $s('#cmBpm').textContent = live.bpm; if (el >= MIN && live.frac >= 0.7) return finish(live); }
      }
      if (el >= MAX){
        const fin = calcBpm(sig, true);
        if (fin) return finish(fin);
        $s('#cmSt').textContent = 'REPETIR'; $s('#cmBpm').textContent = '—';
        $s('#cmTip').innerHTML = 'No logré leer bien el pulso. Apoya la mano en la mesa, tapa la cámara y el flash con la yema (sin apretar) y no hables mientras mide.';
        sig.length = 0; fingerSince = 0;
      }
    }
    drawWave(wctx, wave, sig);
    if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(step); else requestAnimationFrame(step);
  };
  const finish = res => { $s('#cmBpm').textContent = res.bpm; $s('#cmSt').textContent = 'LISTO'; paintRing(1); drawWave(wctx, wave, sig); Sound.bell(1); vibrate(200); stopCam(); done(res.bpm, res.frac); };
  const paintRing = p => { const fg = sh.querySelector('#cmRing .fg'); if (!fg) return; const c0 = +fg.style.getPropertyValue('--c0') || 440; fg.style.animation = 'none'; fg.setAttribute('stroke-dashoffset', (c0 * (1 - clamp(p, 0, 1))).toFixed(1)); };
  step();
}
// Pulso por cámara (4.3.1): canal rojo y verde, ventanas de 8 s y mediana. Más estable con el ritmo
// natural del corazón, la respiración y el flash que satura el rojo.
const PPG_FS = 30;
// Remuestreo uniforme a 30 Hz de un canal ('r' o 'g')
function ppgResample(sig, k){
  const t0 = sig[0].t, n = Math.floor((sig[sig.length - 1].t - t0) / 1000 * PPG_FS), x = new Array(Math.max(0, n)); let j = 0;
  for (let i = 0; i < n; i++){
    const tt = t0 + i * 1000 / PPG_FS; while (j < sig.length - 2 && sig[j + 1].t < tt) j++;
    const a = sig[j], b = sig[j + 1] || a, w = b.t > a.t ? clamp((tt - a.t) / (b.t - a.t), 0, 1) : 0; x[i] = a[k] + (b[k] - a[k]) * w;
  }
  return x;
}
// Quita la deriva (media móvil centrada de 1,5 s) y suaviza (4 muestras ≈ filtro paso bajo de ~7 Hz)
function ppgPrep(x){
  const n = x.length, H = Math.round(0.75 * PPG_FS), y = new Array(n), cs = [0];
  for (let i = 0; i < n; i++) cs.push(cs[i] + x[i]);
  for (let i = 0; i < n; i++){ const a = Math.max(0, i - H), b = Math.min(n, i + H + 1); y[i] = x[i] - (cs[b] - cs[a]) / (b - a); }
  const z = new Array(n); for (let i = 0; i < n; i++){ let s = 0, c = 0; for (let k = Math.max(0, i - 3); k <= i; k++){ s += y[k]; c++; } z[i] = s / c; }
  return z;
}
// Ritmo de una ventana por autocorrelación (40–180 lpm). Devuelve { bpm, q } (q = parecido entre latidos, 0–1)
function ppgAc(x){
  const n = x.length, m = x.reduce((p, v) => p + v, 0) / n, d = x.map(v => v - m), e0 = d.reduce((p, v) => p + v * v, 0);
  if (!e0) return null;
  const minL = Math.round(PPG_FS * 60 / 180), maxL = Math.min(Math.round(PPG_FS * 60 / 40), Math.floor(n * 0.6));
  const ac = []; for (let L = 0; L <= maxL + 1; L++){ let p = 0; for (let i = 0; i + L < n; i++) p += d[i] * d[i + L]; ac[L] = p / e0 * n / (n - L); }
  const peaks = []; for (let L = minL; L <= maxL; L++) if (ac[L] > ac[L - 1] && ac[L] >= ac[L + 1]) peaks.push(L);
  if (!peaks.length) return null;
  let best = peaks.reduce((a, b) => ac[b] > ac[a] ? b : a);
  // si el pico más alto es el doble de un período real (ritmo rápido), quedarse con el más corto
  const half = peaks.find(L => Math.abs(L - best / 2) <= 2 && ac[L] > ac[best] * 0.9); if (half) best = half;
  const y0 = ac[best - 1], y1 = ac[best], y2 = ac[best + 1], den = y0 - 2 * y1 + y2, off = den ? clamp(0.5 * (y0 - y2) / den, -0.5, 0.5) : 0;
  return { bpm: 60 * PPG_FS / (best + off), q: ac[best] };
}
// Ventanas de 8 s cada 2 s, en el canal rojo y en el verde; se queda con el canal más limpio y la mediana
function calcBpm(sig, final){
  if (sig.length < 2 || sig[sig.length - 1].t - sig[0].t < 9000) return null;
  let pick = null;
  ['r', 'g'].forEach(k => {
    const x = ppgPrep(ppgResample(sig, k)), W = 8 * PPG_FS, S = 2 * PPG_FS, ok = [];
    for (let s = 0; s + W <= x.length; s += S){ const r = ppgAc(x.slice(s, s + W)); if (r && r.q >= 0.3) ok.push(r); }
    const wins = Math.max(1, Math.floor((x.length - W) / S) + 1);
    if (ok.length < 2) return;
    const med = ok.map(r => r.bpm).sort((a, b) => a - b)[Math.floor(ok.length / 2)];
    const agree = ok.filter(r => Math.abs(r.bpm - med) <= 7), frac = agree.length / wins;
    const bpm = agree.reduce((p, r) => p + r.bpm, 0) / agree.length;
    const cand = { bpm: Math.round(bpm), frac, q: agree.reduce((p, r) => p + r.q, 0) / agree.length, n: agree.length };
    if (!pick || cand.frac * cand.q > pick.frac * pick.q) pick = cand;
  });
  if (!pick || pick.bpm < 38 || pick.bpm > 200) return null;
  if (pick.frac < (final ? 0.45 : 0.5) || pick.n < 3) return null;
  return pick;
}
function drawWave(c, cv, sig){
  const W = cv.width, H = cv.height; c.clearRect(0, 0, W, H);
  const last = sig.slice(-150); if (last.length < 40 || last[last.length - 1].t - last[0].t < 2000) return;
  const xr = ppgPrep(ppgResample(last, 'r')), xg = ppgPrep(ppgResample(last, 'g'));
  const sd = x => Math.sqrt(x.reduce((p, v) => p + v * v, 0) / (x.length || 1)), f = sd(xg) > sd(xr) * 1.2 ? xg : xr;
  if (f.length < 5) return;
  const mx = Math.max(...f.map(Math.abs)) || 1;
  c.strokeStyle = '#d98585'; c.lineWidth = 2.5; c.lineJoin = 'round'; c.beginPath();
  f.forEach((v, i) => { const px = i / (f.length - 1) * W, py = H / 2 - (v / mx) * (H / 2 - 4); i ? c.lineTo(px, py) : c.moveTo(px, py); });
  c.stroke();
}

/* ---------- Sueño (Satronho Somnia) ---------- */
/* ---------- Sueño: horario y noches (con o sin Satronho Somnia) ---------- */
let slp = Object.assign({ goal: 0, bed: '', wake: '', nights: {} }, load('sf_slp', {}));
const saveSlp = () => save('sf_slp', slp);
const toMin = hhmm => { const [h, m] = (hhmm || '0:0').split(':').map(Number); return h * 60 + (m || 0); };
const fromMin = m => { m = ((m % 1440) + 1440) % 1440; return pad2(Math.floor(m / 60)) + ':' + pad2(m % 60); };
const durOf = (s0, e0) => { const d = toMin(e0) - toMin(s0); return d <= 0 ? d + 1440 : d; };
const clock = hhmm => { if (!hhmm) return '—'; const [h, m] = hhmm.split(':').map(Number); if (window.SF_LG === 'en'){ return ((h + 11) % 12 + 1) + ':' + pad2(m) + (h < 12 ? ' AM' : ' PM'); } return pad2(h) + ':' + pad2(m); };
// Minutos dormidos de la noche que terminó ese día: lo anotado manda; si no, lo que trajo Somnia
function sleepMin(d){ const n = slp.nights[d]; if (n) return durOf(n.s, n.e); const so = window.SFSomnia ? SFSomnia.nights()[d] : null; return so ? so.a : 0; }
function nightCount(){ const k = new Set(Object.keys(slp.nights)); if (window.SFSomnia) Object.keys(SFSomnia.nights()).forEach(x => k.add(x)); return k.size; }
function lastNight(){ for (let i = 0; i < 3; i++){ const d = addDays(todayISO(), -i), m = sleepMin(d); if (m) return { d, m, man: !!slp.nights[d], n: slp.nights[d] || null }; } return null; }
const goalMsg = g => g < 420 ? ['warn', 'Los adultos necesitan al menos 7 horas para recuperarse bien, y más si entrenas fuerte.'] : g > 540 ? ['warn', 'Más de 9 horas seguidas no suele hacer falta. Si siempre necesitas tanto, coméntalo con un médico.'] : ['ok', 'Es una meta saludable: este descanso te ayuda a estar fresco y con energía todo el día.'];

function renderSleep(body){
  const has = SFSomnia.has(), ln = lastNight(), g = slp.goal || 480;
  const setup = !slp.wake ? (S.slpLater ? `<div class="sect"><div class="row" style="border:0"><span class="pic" style="--c:var(--mode)">🛏️</span><div class="l"><b>Tu horario de sueño</b><small>Sin configurar</small></div><button class="smallbtn go" id="slSet">CONFIGURAR</button></div></div>`
    : `<div class="sect sfslsetup"><small class="kick">SUEÑO</small><h3>Arma tu horario</h3><p>Dime a qué hora planeas dormir y despertar, y cuántas horas quieres dormir. Así sabrás si descansas lo que tu cuerpo necesita para entrenar.</p>
      <div class="art">${SFArt.planetScene ? SFArt.orbit(150) : ''}</div>
      <div class="btnrow"><button class="btn" id="slLater">AHORA NO</button><button class="btn pri" id="slSet">CONTINUAR</button></div></div>`)
    : `<div class="sect"><h4>TU HORARIO</h4>
      <div class="sfsched"><div><small>Hora de dormir</small><b>${clock(slp.bed)}</b></div><div><small>Despertar</small><b>${clock(slp.wake)}</b></div><div><small>Meta</small><b>${hm(g)}</b></div></div>
      <button class="linkbtn" id="slSet">Cambiar horario</button></div>`;
  const pct = ln ? Math.min(100, Math.round(ln.m / g * 100)) : 0;
  const night = `<div class="sect sfnight"><h4>${ln && ln.d === todayISO() ? 'ANOCHE' : 'ÚLTIMA NOCHE'}</h4>
    ${ln ? `<div class="big"><b>${hm(ln.m)}</b><small>${ln.m >= g ? 'cumpliste tu meta 🌙' : 'de ' + hm(g) + ' de meta'}</small></div>
      <div class="trk"><i style="width:${pct}%;background:var(--mode)"></i></div>
      <p class="hint">${ln.man ? 'Anotado: <span data-notr>' + clock(ln.n.s) + ' → ' + clock(ln.n.e) + (ln.n.q ? ' · ' + ['', '😫', '😕', '😐', '🙂', '😄'][ln.n.q] : '') + '</span>' : 'De Satronho Somnia'} · <span data-notr>${niceDate(ln.d).toLowerCase()}</span></p>`
      : '<p class="empty">Sin datos de sueño todavía. Anota cómo dormiste o sincroniza Satronho Somnia.</p>'}
    <button class="btn" id="slAdd" style="width:100%">＋ ANOTAR NOCHE</button></div>`;
  const per = SFPeriod.get('sleep', 'w'), data = SFPeriod.buckets(per, d => Math.round(sleepMin(d) / 6) / 10, { agg: 'avg' }), st = SFPeriod.stats(per, sleepMin);
  const chart = per === 'd' ? '' : `<div class="sect"><h4>SUEÑO · ${SFPeriod.title(per).toUpperCase()}</h4>${SFPeriod.seg('sleep', 'w', ['w', 'm', 'q', 'y'])}
    <div class="sfperhead">${st.days ? `<b>${hm(st.avg)}</b><small>promedio · ${st.days === 1 ? '1 noche' : st.days + ' noches'}</small>` : '<b>—</b><small>sin noches en este periodo</small>'}</div>
    ${SF.bars(data.map(x => ({ ...x, t: n1(x.v) })), '#9d8fd0', g / 60, 'h')}<p class="hint">Horas dormidas · la línea es tu meta</p></div>`;
  body.innerHTML = `${setup}${night}${chart}${has ? SFSomnia.card() + SFSomnia.progressHTML(30) : inviteHTML()}${SFSomnia.settingsHTML()}`;
  SFSomnia.bind(body);
  const on = (id, f) => { const e = body.querySelector(id); if (e) e.addEventListener('click', f); };
  on('#slSet', openSchedule); on('#slLater', () => { S.slpLater = true; saveSettings(); render(); }); on('#slAdd', () => openNight());
  SFPeriod.bind(body, 'sleep', () => render());
}
function openSchedule(){
  const st = { goal: slp.goal || 480, wake: slp.wake || '06:30', bed: slp.bed || '', bedTouched: !!slp.bed, rem: !!SFRemind.REM().sleep };
  const autoBed = () => fromMin(toMin(st.wake) - st.goal - 15);   // 15 min para quedarse dormido
  if (!st.bed) st.bed = autoBed();
  openForm(`<small class="kick">SUEÑO</small><h3 class="ftitle">¿CUÁNTO QUIERES DORMIR?</h3>
    <div class="sfdur"><div><div class="stepper big" id="sdH"></div><small>Horas</small></div><div><div class="stepper big" id="sdM"></div><small>Minutos</small></div></div>
    <p class="sfgoalmsg" id="sdMsg"></p>
    <div class="field"><span>Despertar</span><input type="time" id="sdWake" value="${st.wake}"></div>
    <div class="field"><span>Hora de dormir</span><input type="time" id="sdBed" value="${st.bed}"><small class="hint">Incluye 15 minutos para quedarte dormido.</small></div>
    <div class="row" style="border:0"><div class="l"><b>Avisarme media hora antes</b><small>Una notificación para ir bajando el ritmo</small></div><button class="switch ${st.rem ? 'on' : ''}" id="sdRem"></button></div>
    <div class="btnrow"><button class="btn" id="sdX">CANCELAR</button><button class="btn pri" id="sdOk">GUARDAR</button></div>`, sh => {
    const msg = () => { const [k, t] = goalMsg(st.goal); const m = sh.querySelector('#sdMsg'); m.className = 'sfgoalmsg ' + k; m.innerHTML = 'ⓘ ' + t; if (!st.bedTouched){ st.bed = autoBed(); sh.querySelector('#sdBed').value = st.bed; } };
    makeStepper(sh.querySelector('#sdH'), { get: () => Math.floor(st.goal / 60), set: v => { st.goal = Math.round(v) * 60 + st.goal % 60; msg(); }, min: 4, max: 12, label: 'Horas' });
    makeStepper(sh.querySelector('#sdM'), { get: () => st.goal % 60, set: v => { st.goal = Math.floor(st.goal / 60) * 60 + Math.round(v); msg(); }, min: 0, max: 45, step: 15, label: 'Minutos' });
    msg();
    sh.querySelector('#sdWake').addEventListener('change', e => { st.wake = e.target.value || st.wake; msg(); });
    sh.querySelector('#sdBed').addEventListener('change', e => { st.bed = e.target.value || st.bed; st.bedTouched = true; });
    sh.querySelector('#sdRem').addEventListener('click', e => { st.rem = !st.rem; e.currentTarget.classList.toggle('on', st.rem); });
    sh.querySelector('#sdX').addEventListener('click', closeForm);
    sh.querySelector('#sdOk').addEventListener('click', async () => {
      slp.goal = st.goal; slp.wake = st.wake; slp.bed = st.bed; saveSlp();
      const r = SFRemind.REM(); r.sleep = st.rem; S.rem = r; saveSettings();
      closeForm(); toast('Horario guardado 🌙'); render();
      if (st.rem && !(await SFRemind.ask())){ r.sleep = false; S.rem = r; saveSettings(); } else SFRemind.sync();
    });
  });
}
function openNight(d0){
  const d = d0 || todayISO(), old = slp.nights[d];
  const st = { d, s: old ? old.s : (slp.bed || '23:00'), e: old ? old.e : (slp.wake || '06:30'), q: old ? old.q || 0 : 0 };
  openForm(`<h3 class="ftitle">🌙 ¿CÓMO DORMISTE?</h3>
    <div class="field"><span>Día en que despertaste</span><input type="date" id="snD" value="${st.d}" max="${todayISO()}"></div>
    <div class="sfdur"><div class="field"><span>Me dormí</span><input type="time" id="snS" value="${st.s}"></div><div class="field"><span>Desperté</span><input type="time" id="snE" value="${st.e}"></div></div>
    <p class="sfgoalmsg ok" id="snDur"></p>
    <div class="field"><span>¿Qué tal descansaste?</span><div class="sfq">${['😫', '😕', '😐', '🙂', '😄'].map((x, i) => `<button type="button" data-q="${i + 1}" class="${st.q === i + 1 ? 'on' : ''}">${x}</button>`).join('')}</div></div>
    <div class="btnrow">${old ? '<button class="btn" id="snDel">BORRAR</button>' : '<button class="btn" id="snX">CANCELAR</button>'}<button class="btn pri" id="snOk">GUARDAR</button></div>`, sh => {
    const upd = () => { sh.querySelector('#snDur').textContent = TF('Dormiste {s}', hm(durOf(st.s, st.e))); };
    upd();
    sh.querySelector('#snD').addEventListener('change', e => { if (e.target.value && e.target.value <= todayISO()) st.d = e.target.value; });
    sh.querySelector('#snS').addEventListener('change', e => { st.s = e.target.value || st.s; upd(); });
    sh.querySelector('#snE').addEventListener('change', e => { st.e = e.target.value || st.e; upd(); });
    sh.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => { st.q = +b.dataset.q; sh.querySelectorAll('[data-q]').forEach(x => x.classList.toggle('on', x === b)); hapticTap(); }));
    const x = sh.querySelector('#snX'); if (x) x.addEventListener('click', closeForm);
    const del = sh.querySelector('#snDel'); if (del) del.addEventListener('click', () => { delete slp.nights[d]; saveSlp(); closeForm(); render(); });
    sh.querySelector('#snOk').addEventListener('click', () => {
      if (old && st.d !== d) delete slp.nights[d];
      slp.nights[st.d] = { s: st.s, e: st.e, q: st.q || 0 };
      const ks = Object.keys(slp.nights).sort(); ks.slice(0, Math.max(0, ks.length - 400)).forEach(k => delete slp.nights[k]);
      saveSlp(); closeForm(); toast('Noche guardada 🌙'); render();
    });
  });
}

/* ---------- Resumen de salud (como «Health» de Google) ---------- */
function renderSum(body){
  const t = todayISO(), st = SF.steps(), b = SF.dayBurn(t), ln = lastNight(), lw = typeof lastWeight === 'function' ? lastWeight() : null, w = SF.water()[t] || 0;
  const hrToday = hr.some(x => iso(new Date(x.ts)) === t), wkW = lw && lw.date >= addDays(t, -6);
  const vit = [[st[t] > 0, '👟', 'Pasos'], [hrToday, '❤️', 'Pulso'], [ln && ln.d >= addDays(t, -1), '🌙', 'Sueño'], [wkW, '⚖️', 'Peso'], [w > 0, '💧', 'Agua']];
  const nV = vit.filter(v => v[0]).length;
  const cnt = (n, one, many) => n === 1 ? one : TF(many, nf(n));
  const foodDays = Object.keys(load('sf_food', {})).length, waterDays = Object.values(SF.water()).filter(v => v > 0).length, stepDays = Object.values(st).filter(v => v > 0).length;
  const area = (go, ic, tl, n, c) => `<button class="sfarea" data-go="${go}" style="--c:${c}"><span class="ai">${ic}</span><span class="al"><b>${tl}</b><small>${n}</small></span></button>`;
  body.innerHTML = `
    <div class="sect sfvitals"><h4>ESTADO DE HOY</h4>
      <div class="vt"><b>${TF('{s} de 5', nV)}</b><small>${nV === 5 ? '¡Todo registrado hoy!' : nV ? 'datos registrados hoy' : 'Aún sin datos de hoy'}</small></div>
      <div class="vrow">${vit.map(v => `<span class="${v[0] ? 'on' : ''}"><i>${v[1]}</i><small>${v[2]}</small></span>`).join('')}</div></div>
    <div class="sect"><h4>ÁREAS</h4><div class="sfareas">
      ${area('health:heart', '❤️', 'Corazón', cnt(hr.length, '1 medición', '{s} mediciones'), '#d98585')}
      ${area('health:steps', '👟', 'Actividad', cnt(stepDays, '1 día con pasos', '{s} días con pasos'), '#7aa9d1')}
      ${area('health:sleep', '🌙', 'Sueño', cnt(nightCount(), '1 noche', '{s} noches'), '#9d8fd0')}
      ${area('progress:body', '⚖️', 'Peso', cnt(weights.length, '1 registro', '{s} registros'), '#d6a660')}
      ${area('nutri:diary', '🍎', 'Nutrición', cnt(foodDays, '1 día anotado', '{s} días anotados'), '#7fb38a')}
      ${area('nutri:water', '💧', 'Hidratación', cnt(waterDays, '1 día', '{s} días'), '#6fb0b6')}
    </div></div>
    ${checksHTML()}
    ${recordsHTML()}
    ${SFPets.says(null, nV < 3 ? 'Con unos pocos datos al día (pasos, pulso, sueño) te muestro cómo va tu salud. ¡No hace falta un reloj!' : 'Vas muy bien. Revisa cada área para ver tu tendencia.')}`;
  body.querySelectorAll('[data-go]').forEach(x => x.addEventListener('click', () => { hapticTap(); SFNav.go(x.dataset.go); }));
  body.querySelectorAll('[data-chk]').forEach(x => x.addEventListener('click', () => { const k = 'hr' + x.dataset.chk; S[k] = !checkOn(x.dataset.chk); saveSettings(); hapticTap(); render(); }));
  body.querySelectorAll('[data-rec]').forEach(x => x.addEventListener('click', () => { hapticTap(); SFNav.go(x.dataset.rec); }));
}
// Mis récords personales
function recordsHTML(){
  const st = SF.steps(); let bs = null; Object.entries(st).forEach(([d, v]) => { if (!bs || v > bs[1]) bs = [d, v]; });
  let bk = null; new Set(sessLog.map(h => h.d)).forEach(d => { const a = SF.dayBurn(d).active; if (!bk || a > bk[1]) bk = [d, a]; });
  let bl = null, br = null; sessLog.forEach(h => { const m = SF.minOf(h); if (!bl || m > bl[1]) bl = [h.d, m]; if (h.r && (!br || h.r > br[1])) br = [h.d, h.r]; });
  const s = SF.streaks(), prs = SFGym.prCount();
  const rows = [];
  if (bs && bs[1]) rows.push(['👟', 'Más pasos en un día', nf(bs[1]), niceDate(bs[0]).toLowerCase(), 'health:steps']);
  if (bk && bk[1]) rows.push(['🔥', 'Más kcal activas en un día', nf(bk[1]) + ' kcal', niceDate(bk[0]).toLowerCase(), 'progress:sum']);
  if (bl && bl[1]) rows.push(['⏱️', 'Entreno más largo', hm(bl[1]), niceDate(bl[0]).toLowerCase(), 'progress:sum']);
  if (br) rows.push(['🥊', 'Más rounds en un entreno', String(br[1]), niceDate(br[0]).toLowerCase(), 'progress:sum']);
  if (s.bestDay) rows.push(['📅', 'Mejor racha', s.bestDay === 1 ? '1 día' : TF('{s} días', s.bestDay), 'racha de entrenos', 'goals:streak']);
  if (prs) rows.push(['🏋️', 'Récords de pesas', String(prs), 'en tus ejercicios', 'train:gym']);
  return `<div class="sect"><h4>🏆 MIS RÉCORDS</h4>${rows.length ? rows.map(r => `<button class="row sfrec" data-rec="${r[4]}"><span class="pic" style="--c:var(--mode)">${r[0]}</span><span class="l"><b>${r[1]}</b><small>${r[3]}</small></span><em>${r[2]}</em></button>`).join('') : '<p class="empty">Tus récords aparecerán aquí cuando entrenes y camines.</p>'}</div>`;
}
function inviteHTML(){
  return `<div class="sect sfinvite"><div class="orb">${SFArt.orbit(150)}</div>
    <h3>SATRONHO SOMNIA</h3><p>La app hermana de BoxFit para el <b>sueño, el ronquido y la apnea</b>. Juntas te dicen:</p>
    <ul><li>🌙 Cuánto y cómo dormiste: fases, puntaje y ronquido.</li><li>🔋 Qué tan recuperado estás para entrenar hoy.</li><li>🥊 Si entrenar te ayuda a dormir mejor o a roncar menos.</li></ul>
    <p class="hint">¿Todavía no la tienes? Pídele el instalador a quien te pasó Satronho BoxFit. Cuando la instales, vuelve aquí y toca <b>Sincronizar</b>.</p></div>`;
}

Object.assign(GUIDE, {
  health: () => ({ t: 'tu salud', b: [`<p>Como en las apps de salud de Google: abajo cambias entre <b>Resumen</b>, <b>Pasos</b>, <b>Corazón</b> y <b>Sueño</b>.</p>`, `<ul><li><b>Resumen:</b> lo que registraste hoy, tus áreas, los avisos de pulso y tus récords.</li><li><b>Pasos:</b> se cuentan solos, aunque la app esté cerrada. Arriba eliges día, semana, mes, 3 meses o año.</li><li><b>Corazón:</b> mide tu pulso con la cámara o tráelo de tu reloj.</li><li><b>Sueño:</b> arma tu horario, anota tus noches o crúzalas con Satronho Somnia.</li></ul>`] }),
});
window.SFHealth = { _ppg: calcBpm, _hrCheck: b => hrCheck(b), sleepPlan: () => slp, sleepMin, lastNight, _calc: (s, st) => calcBpm(s, st), render, syncHC, restingHR, maxHR, cardioPts, weekPts, lastHR: () => hr[hr.length - 1] || null, hcOn: () => hcState.on };
})();
