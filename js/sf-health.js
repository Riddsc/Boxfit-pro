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
const TITLES = { steps: 'PASOS Y ACTIVIDAD', heart: 'CORAZÓN', sleep: 'SUEÑO' };
SF.view('health', 'PASOS Y ACTIVIDAD', { render, back: true });

function render(){
  const tab = SFNav.tab.health, body = $('#healthBody');
  $('#healthTitle').textContent = TITLES[tab];
  if (tab === 'heart') renderHeart(body); else if (tab === 'sleep') renderSleep(body); else renderSteps(body);
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
      <div class="rg">${SF.ring(b.min / G.min, '#22c55e', 170, 14)}<div class="r2">${SF.ring(pts / Math.max(1, Math.round(150 / 7)), '#0ea5e9', 132, 14)}</div>
        <div class="sfringin"><b style="color:#22c55e">${b.min}</b><small>MIN. DE MOVIMIENTO</small><b style="color:#0ea5e9;margin-top:4px">${pts}</b><small>PUNTOS CARDIO</small></div></div>
      <div class="three"><div><b>${nf(st)}</b><small>Pasos</small></div><div><b>${n1(st * stride() / 1000)}</b><small>km</small></div><div><b>${nf(b.active)}</b><small>kcal activas</small></div></div>
      <div class="trk"><i style="width:${clamp(st / G.steps * 100, 0, 100)}%;background:#38bdf8"></i></div>
      <p class="hint" style="text-align:center">${st >= G.steps ? '¡Meta de pasos cumplida! 👟' : 'Faltan ' + nf(G.steps - st) + ' pasos para tu meta de ' + nf(G.steps)}</p>
      <div class="btnrow"><button class="btn" id="hsEdit">✏️ PASOS</button><button class="btn" id="hsGoals">🎯 METAS</button></div>
    </div>
    <div class="sect"><h4>PASOS POR HORA · HOY</h4>${hh.some(v => v) ? SF.bars(hours, '#38bdf8', 0, '') : `<p class="empty">${S.stepSensor || hcState.on ? 'Abre la app de vez en cuando y aquí se irán repartiendo tus pasos por hora.' : 'Activa el contador del teléfono o conecta Health Connect para ver tus pasos por hora.'}</p>`}</div>
    <div class="sect"><h4>PASOS · 7 DÍAS</h4>${SF.bars(week, '#38bdf8', G.steps, '')}<p class="hint">${n30 ? 'Promedio de los últimos 30 días: <b>' + nf(s30 / n30) + '</b> pasos al día.' : ''}</p></div>
    <div class="sect"><h4>PUNTOS CARDIO · SEMANA</h4>
      <div class="sfweekpts"><div class="ringbox">${SF.ring(wp / 150, '#0ea5e9', 96, 10, `<b>${wp}</b><small>de 150</small>`)}</div>
        <p>La OMS recomienda <b>150 minutos</b> de actividad moderada a la semana. Ganas <b>1 punto</b> por minuto moderado (caminar rápido, pesas) y <b>2</b> por minuto intenso (boxeo, correr).${wp >= 150 ? ' <b>¡Meta semanal cumplida!</b>' : ''}</p></div>
      ${SF.bars(ptsWeek, '#0ea5e9', 0, '')}</div>
    ${hcCardHTML()}
    <div class="sect"><div class="row" style="border:0"><div class="l"><b>Contar pasos con el teléfono</b><small>Usa el sensor del celular; los suma cada vez que abres la app</small></div><button class="switch ${S.stepSensor ? 'on' : ''}" id="hsSensor"></button></div></div>`;
  body.querySelector('#hsEdit').addEventListener('click', () => SF.openStepsForm());
  body.querySelector('#hsGoals').addEventListener('click', () => SF.openGoalsForm());
  body.querySelector('#hsSensor').addEventListener('click', async e => { const bt = e.currentTarget, on = !bt.classList.contains('on'); bt.classList.toggle('on', on); const ok = await SF.enableSteps(on); if (on && !ok) bt.classList.remove('on'); else render(); });
  bindHC(body);
}

/* ---------- Health Connect (reloj, Google Fit, Samsung Health…) ---------- */
const HC_TYPES = ['Steps', 'HeartRateSeries', 'RestingHeartRate'];
function hcCardHTML(){
  return `<div class="sect"><h4>RELOJ Y OTRAS APPS · HEALTH CONNECT</h4>
    <div class="row" style="border:0"><span class="pic" style="--c:#0ea5e9">⌚</span><div class="l"><b>${hcState.on ? 'Conectado' : 'Sin conectar'}</b><small>${hcState.on ? 'Último dato: ' + (hcState.at ? niceDate(iso(new Date(hcState.at))).toLowerCase() : 'todavía nada') : 'Si usas reloj o pulsera (o Google Fit, Samsung Health), BoxFit lee de ahí tus pasos y tu pulso. Solo lee: nunca escribe.'}</small></div>
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
  const mx = maxHR(), rs = restingHR(), z = [[50, 60, 'Muy suave', 'Recuperación', '#94a3b8'], [60, 70, 'Suave', 'Quema de grasa y base', '#22c55e'], [70, 80, 'Moderada', 'Resistencia aeróbica', '#eab308'], [80, 90, 'Intensa', 'Rounds y sparring', '#f97316'], [90, 100, 'Máxima', 'Sprints y explosión', '#ef4444']];
  return z.map(([a, b, n, u, c]) => { const f = p => Math.round(rs ? rs + (mx - rs) * p / 100 : mx * p / 100); return { a: f(a), b: f(b), n, u, c, pa: a, pb: b }; });
}
function hrClass(bpm){ return bpm < 50 ? ['Bajo', '#38bdf8'] : bpm <= 100 ? ['Normal en reposo', '#22c55e'] : ['Alto para estar en reposo', '#f59e0b']; }
function renderHeart(body){
  const last = hr[hr.length - 1], rs = restingHR(), mx = maxHR(), zs = zones();
  const pts = hr.filter(x => x.ctx === 'rest').slice(-30).map(x => ({ x: shortDate(iso(new Date(x.ts))), v: x.bpm }));
  body.innerHTML = `
    <div class="sect sfheart">
      <div class="big"><span class="hb">❤️</span><b>${last ? last.bpm : '—'}</b><small>lpm</small></div>
      <p class="hint" style="text-align:center">${last ? (last.ctx === 'rest' ? hrClass(last.bpm)[0] + ' · ' : '') + niceDate(iso(new Date(last.ts))).toLowerCase() + ' ' + pad2(new Date(last.ts).getHours()) + ':' + pad2(new Date(last.ts).getMinutes()) + ' · ' + ({ cam: 'con la cámara', hc: 'del reloj', man: 'anotado a mano' })[last.src] : 'Todavía no hay mediciones'}</p>
      <button class="btn pri" id="hmCam" style="width:100%;flex:none;--bc:#ef4444;margin-bottom:8px">📷 MEDIR CON LA CÁMARA</button>
      <div class="btnrow"><button class="btn" id="hmMan">✏️ ANOTAR</button><button class="btn" id="hmHC">⌚ RELOJ</button></div>
    </div>
    <div class="kpis"><div class="kpi" style="--kc:#22c55e"><b>${rs || '—'}</b><span>Pulso en reposo</span></div><div class="kpi" style="--kc:#ef4444"><b>${mx}</b><span>Pulso máximo estimado</span></div></div>
    <div class="sect"><h4>PULSO EN REPOSO</h4><div style="padding-bottom:8px">${SF.lineChart(pts, '#ef4444', { fmt: v => Math.round(v) + ' lpm', minSpan: 8, empty: 'Mide tu pulso en reposo (sentado, tranquilo, mejor al despertar) al menos 2 días para ver la gráfica.' })}</div>
      <p class="hint">Un pulso en reposo que baja con las semanas es señal de mejor forma física. Si sube varios días seguidos, puede ser cansancio, poco sueño o que te estás enfermando.</p></div>
    <div class="sect"><h4>ZONAS DE ENTRENAMIENTO</h4>${zs.map(z => `<div class="sfzone" style="--c:${z.c}"><i></i><span class="l"><b>${z.n} · ${z.pa}-${z.pb}%</b><small>${z.u}</small></span><em>${z.a}-${z.b}</em></div>`).join('')}
      <p class="hint">${rs ? 'Calculadas con tu pulso en reposo (método de Karvonen).' : 'Mide tu pulso en reposo y las zonas se ajustan mejor a ti.'} En los rounds de boxeo lo normal es estar en zona intensa.</p></div>
    <div class="sect"><h4>MEDICIONES</h4>${hr.slice().reverse().filter(x => x.src !== 'hc' || x.ctx === 'rest').slice(0, 12).map(x => `<div class="row"><span class="l"><b>${x.bpm} lpm</b><small>${niceDate(iso(new Date(x.ts)))} ${pad2(new Date(x.ts).getHours())}:${pad2(new Date(x.ts).getMinutes())} · ${({ rest: 'En reposo', post: 'Después de entrenar', other: 'Otro momento' })[x.ctx]}</small></span>${x.src !== 'hc' ? `<button class="xbtn" data-hd="${x.id}">×</button>` : '<small>⌚</small>'}</div>`).join('') || '<p class="empty">Sin mediciones.</p>'}</div>
    ${SFPets.says(null, 'La medición con la cámara es aproximada: sirve para seguir tu tendencia, no para diagnosticar. Si sientes dolor en el pecho, mareo o palpitaciones raras, busca atención médica.')}`;
  body.querySelector('#hmCam').addEventListener('click', openCamera);
  body.querySelector('#hmMan').addEventListener('click', openManual);
  body.querySelector('#hmHC').addEventListener('click', async () => { if (!hcState.on){ if (await connectHC()) await syncHC(true); } else await syncHC(true); render(); });
  body.querySelectorAll('[data-hd]').forEach(b => b.addEventListener('click', async () => { if (await confirmDlg('¿Borrar medición?', '', 'BORRAR')){ hr = hr.filter(x => x.id !== b.dataset.hd); saveHR(); render(); } }));
}
function addHR(bpm, src, ctx){ hr.push({ id: uid(), ts: Date.now(), bpm: Math.round(bpm), src, ctx }); saveHR(); }
const ctxSeg = (id, cur) => `<div class="seg" id="${id}"><button type="button" data-c="rest" class="${cur === 'rest' ? 'on' : ''}">EN REPOSO</button><button type="button" data-c="post" class="${cur === 'post' ? 'on' : ''}">TRAS ENTRENAR</button><button type="button" data-c="other" class="${cur === 'other' ? 'on' : ''}">OTRO</button></div>`;
function bindCtx(sh, id, st){ sh.querySelectorAll('#' + id + ' [data-c]').forEach(b => b.addEventListener('click', () => { st.ctx = b.dataset.c; sh.querySelectorAll('#' + id + ' [data-c]').forEach(x => x.classList.toggle('on', x === b)); })); }
function openManual(){
  const st = { bpm: 70, ctx: 'rest' };
  openForm(`<h3 class="ftitle">✏️ ANOTAR PULSO</h3><p class="hint">Por ejemplo, el que te marca un tensiómetro o un oxímetro.</p>
    <div class="field"><span>Pulsaciones por minuto</span><div class="stepper big" id="mhB"></div></div>${ctxSeg('mhC', st.ctx)}
    <div class="btnrow"><button class="btn" id="mhX">CANCELAR</button><button class="btn pri" id="mhOk" style="--bc:#ef4444">GUARDAR</button></div>`, sh => {
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
    <p class="hint" id="cmTip">Tapa con la yema del dedo índice la cámara de atrás <b>y el flash</b>, sin apretar. Quédate quieto unos 30 segundos.</p>
    <div class="sfcam"><div class="ringbox" id="cmRing">${SF.ring(0, '#ef4444', 150, 12, '<b id="cmBpm">—</b><small id="cmSt">PREPARANDO</small>')}</div><canvas id="cmWave" width="320" height="70"></canvas></div>
    ${ctxSeg('cmC', st.ctx)}
    <video id="cmV" playsinline muted style="width:1px;height:1px;opacity:0;position:absolute"></video>
    <div class="btnrow"><button class="btn" id="cmX">CANCELAR</button><button class="btn pri" id="cmOk" style="--bc:#ef4444" disabled>GUARDAR</button></div>`, async sh => {
    bindCtx(sh, 'cmC', st);
    sh.querySelector('#cmX').addEventListener('click', () => { stopCam(); closeForm(); });
    let result = null;
    sh.querySelector('#cmOk').addEventListener('click', () => { if (!result) return; stopCam(); addHR(result, 'cam', st.ctx); closeForm(); toast(`❤️ ${result} lpm guardado`); render(); });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 176 }, height: { ideal: 144 }, frameRate: { ideal: 30 } }, audio: false });
      const v = sh.querySelector('#cmV'); v.srcObject = stream; await v.play();
      const track = stream.getVideoTracks()[0];
      try { const cp = track.getCapabilities ? track.getCapabilities() : {}; if (cp.torch) await track.applyConstraints({ advanced: [{ torch: true }] }); else sh.querySelector('#cmTip').innerHTML += ' <b>Este teléfono no deja prender el flash desde la app: mide con buena luz.</b>'; } catch(e){}
      keepAwake(true);
      cam = { stream, stop: false };
      measure(sh, v, bpm => { result = bpm; sh.querySelector('#cmOk').disabled = false; });
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
  const sig = [], t0 = performance.now(), DUR = 30000, SETTLE = 3000;
  let fingerSince = 0, lastBpm = null;
  const step = () => {
    if (!cam || cam.stop) return;
    ctx.drawImage(video, 0, 0, 40, 30);
    const d = ctx.getImageData(0, 0, 40, 30).data; let r = 0, g = 0, b = 0;
    for (let i = 0; i < d.length; i += 4){ r += d[i]; g += d[i + 1]; b += d[i + 2]; }
    const n = d.length / 4; r /= n; g /= n; b /= n;
    const finger = r > 90 && r > g * 1.6 && r > b * 1.6;
    const now = performance.now();
    if (!finger){ fingerSince = 0; sig.length = 0; sh.querySelector('#cmSt').textContent = 'PON EL DEDO'; paintRing(0); }
    else {
      if (!fingerSince) fingerSince = now;
      if (now - fingerSince > SETTLE) sig.push({ t: now, v: r });
      const el = sig.length ? now - sig[0].t : 0;
      paintRing(el / DUR);
      sh.querySelector('#cmSt').textContent = el ? 'MIDIENDO…' : 'QUIETO…';
      if (sig.length > 90 && sig.length % 15 === 0){ const bpm = calcBpm(sig); if (bpm){ lastBpm = bpm; sh.querySelector('#cmBpm').textContent = bpm; } }
      if (el >= DUR){
        const bpm = calcBpm(sig, true);
        if (bpm){ sh.querySelector('#cmBpm').textContent = bpm; sh.querySelector('#cmSt').textContent = 'LISTO'; Sound.bell(1); vibrate(200); stopCam(); done(bpm); return; }
        sh.querySelector('#cmSt').textContent = 'REPETIR'; sh.querySelector('#cmTip').innerHTML = 'La señal salió con mucho ruido. Quédate quieto, no aprietes el dedo y vuelve a intentar.'; sig.length = 0; fingerSince = 0;
      }
    }
    drawWave(wctx, wave, sig);
    if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(step); else requestAnimationFrame(step);
  };
  const paintRing = p => { const fg = sh.querySelector('#cmRing .fg'); if (!fg) return; const c0 = +fg.style.getPropertyValue('--c0') || 440; fg.style.animation = 'none'; fg.setAttribute('stroke-dashoffset', (c0 * (1 - clamp(p, 0, 1))).toFixed(1)); };
  step();
}
// Señal filtrada: se le resta la media móvil de 1 s (quita la deriva) y se suaviza con 3 muestras
function filtered(sig){
  const out = [];
  for (let i = 0; i < sig.length; i++){
    let a = 0, n = 0; for (let j = i; j >= 0 && sig[i].t - sig[j].t < 1000; j--){ a += sig[j].v; n++; }
    out.push({ t: sig[i].t, v: sig[i].v - a / n });
  }
  for (let i = 2; i < out.length; i++) out[i].s = (out[i].v + out[i - 1].v + out[i - 2].v) / 3;
  return out.slice(2);
}
// El ritmo se saca por autocorrelación: se busca cada cuánto se repite la señal (entre 0,3 y 1,7 s)
function calcBpm(sig, strict){
  const f = filtered(sig); if (f.length < 90) return null;
  const FS = 30, t0 = f[0].t, n = Math.floor((f[f.length - 1].t - t0) / 1000 * FS);
  if (n < 90) return null;
  const x = new Array(n); let j = 0;
  for (let i = 0; i < n; i++){                                        // remuestreo uniforme a 30 Hz
    const tt = t0 + i * 1000 / FS; while (j < f.length - 2 && f[j + 1].t < tt) j++;
    const a = f[j], b = f[j + 1], w = b.t > a.t ? (tt - a.t) / (b.t - a.t) : 0; x[i] = a.s + (b.s - a.s) * clamp(w, 0, 1);
  }
  const mean = x.reduce((p, v) => p + v, 0) / n; for (let i = 0; i < n; i++) x[i] -= mean;
  const e0 = x.reduce((p, v) => p + v * v, 0); if (!e0) return null;
  const minL = Math.round(0.29 * FS), maxL = Math.min(Math.round(1.75 * FS), Math.floor(n / 2));
  const ac = []; for (let L = 0; L <= maxL; L++){ let p = 0; for (let i = 0; i + L < n; i++) p += x[i] * x[i + L]; ac[L] = p / e0 * n / (n - L); }
  // primer pico fuerte (evita quedarse con el doble del período)
  let best = -1, bv = -1;
  for (let L = minL; L < maxL; L++) if (ac[L] > ac[L - 1] && ac[L] >= ac[L + 1] && ac[L] > bv){ bv = ac[L]; best = L; }
  if (best < 0) return null;
  for (let L = minL; L < best; L++) if (ac[L] > ac[L - 1] && ac[L] >= ac[L + 1] && ac[L] > bv * 0.85){ best = L; bv = ac[L]; break; }
  if (bv < (strict ? 0.35 : 0.25)) return null;                      // demasiado ruido
  const y0 = ac[best - 1], y1 = ac[best], y2 = ac[best + 1], den = y0 - 2 * y1 + y2, off = den ? 0.5 * (y0 - y2) / den : 0;
  const bpm = Math.round(60 * FS / (best + clamp(off, -0.5, 0.5)));
  return bpm >= 35 && bpm <= 210 ? bpm : null;
}
function drawWave(c, cv, sig){
  const W = cv.width, H = cv.height; c.clearRect(0, 0, W, H);
  const last = sig.slice(-120); if (last.length < 10) return;
  const f = filtered(last); if (f.length < 5) return;
  const mx = Math.max(...f.map(x => Math.abs(x.s))) || 1;
  c.strokeStyle = '#ef4444'; c.lineWidth = 2.5; c.lineJoin = 'round'; c.beginPath();
  f.forEach((x, i) => { const px = i / (f.length - 1) * W, py = H / 2 + (x.s / mx) * (H / 2 - 4); i ? c.lineTo(px, py) : c.moveTo(px, py); });
  c.stroke();
}

/* ---------- Sueño (Satronho Somnia) ---------- */
function renderSleep(body){
  const has = SFSomnia.has();
  body.innerHTML = `${has ? SFSomnia.card() : ''}${has ? SFSomnia.progressHTML(30) : inviteHTML()}${SFSomnia.settingsHTML()}`;
  SFSomnia.bind(body);
}
function inviteHTML(){
  return `<div class="sect sfinvite"><div class="orb">${SFArt.orbit(150)}</div>
    <h3>SATRONHO SOMNIA</h3><p>La app hermana de BoxFit para el <b>sueño, el ronquido y la apnea</b>. Juntas te dicen:</p>
    <ul><li>🌙 Cuánto y cómo dormiste: fases, puntaje y ronquido.</li><li>🔋 Qué tan recuperado estás para entrenar hoy.</li><li>🥊 Si entrenar te ayuda a dormir mejor o a roncar menos.</li></ul>
    <p class="hint">¿Todavía no la tienes? Pídele el instalador a quien te pasó Satronho BoxFit. Cuando la instales, vuelve aquí y toca <b>Sincronizar</b>.</p></div>`;
}

Object.assign(GUIDE, {
  health: () => ({ t: 'tu salud', b: [`<p>Como en las apps de salud de Google: abajo cambias entre <b>Pasos</b>, <b>Corazón</b> y <b>Sueño</b>.</p>`, `<ul><li><b>Puntos cardio:</b> 1 por minuto moderado y 2 por minuto intenso; la meta es 150 a la semana.</li><li><b>Corazón:</b> mide tu pulso con la cámara o tráelo de tu reloj.</li><li><b>Sueño:</b> cruza tus noches de Satronho Somnia.</li></ul>`] }),
});
window.SFHealth = { _calc: (s, st) => calcBpm(s, st), render, syncHC, restingHR, maxHR, cardioPts, weekPts, lastHR: () => hr[hr.length - 1] || null, hcOn: () => hcState.on };
})();
