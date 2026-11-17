/* =========================================================
   SATRONHO BOXFIT · GIMNASIO (PESAS)
   Rutinas, biblioteca de ejercicios, entrenamiento en vivo con
   descanso automático, historial, récords y volumen.
   ---------------------------------------------------------
   Récord estimado de una repetición (1RM): fórmula de Epley,
   peso × (1 + repeticiones / 30). Vale para series de hasta 12.
   ========================================================= */
(function(){
const D = window.SFData, { nf, n1, hm } = SF;
const M = D.MUSCLES;

/* ---------- Datos ---------- */
let customEx = load('sf_exx', []);                    // ejercicios creados por la persona
let routines = load('sf_routines', null) || D.ROUTINES.map(r => ({ id: r.id, name: r.name, color: r.color, level: r.level, desc: r.desc, items: r.items.map(i => ({ e: i[0], sets: i[1], reps: i[2], rest: i[3] })) }));
let workouts = load('sf_workouts', []);               // entrenos terminados
let live = load('sf_live', null);                     // entreno en curso
let prN = load('sf_prs', 0);
const saveR = () => save('sf_routines', routines), saveWk = () => save('sf_workouts', workouts), saveLive = () => save('sf_live', live);
const EXS = () => D.EXERCISES.map(e => ({ id: e[0], n: e[1], m: e[2], eq: e[3], k: e[4] })).concat(customEx);
let EXI = null; const exIdx = () => { if (!EXI){ EXI = {}; EXS().forEach(e => EXI[e.id] = e); } return EXI; };
const ex = id => exIdx()[id] || { id, n: 'Ejercicio', m: 'todo', eq: '', k: 'w' };
const unit = () => S.unit === 'lb' ? 'lb' : 'kg';
const toKg = (w, u) => (u || unit()) === 'lb' ? w * 0.45359 : w;
const e1rm = (w, r) => r > 0 && w > 0 ? w * (1 + Math.min(r, 12) / 30) : 0;
const num = v => { const x = parseFloat(String(v).replace(',', '.')); return isFinite(x) ? x : 0; };

/* ---------- Historial por ejercicio ---------- */
function lastOf(eid){ for (let i = workouts.length - 1; i >= 0; i--){ const x = workouts[i].ex.find(e => e.e === eid && e.sets.some(s => s.done)); if (x) return { w: workouts[i], x }; } return null; }
function bestOf(eid, upto){
  let b1 = 0, bw = 0, br = 0, bt = 0;
  workouts.forEach(w => { if (upto && w.id === upto) return; w.ex.forEach(x => { if (x.e !== eid) return; x.sets.forEach(s => { if (!s.done) return; const kgw = toKg(s.w || 0, w.u); b1 = Math.max(b1, e1rm(kgw, s.r)); bw = Math.max(bw, kgw); br = Math.max(br, s.r || 0); bt = Math.max(bt, s.t || 0); }); }); });
  return { e1: b1, w: bw, r: br, t: bt };
}
const fmtW = (kgv) => n1(unit() === 'lb' ? kgv / 0.45359 : kgv);
const setTxt = (s, k, u) => k === 't' ? `${s.t || 0} s` : k === 'b' ? `${s.r || 0}${s.w ? ' (+' + n1(s.w) + ' ' + (u || unit()) + ')' : ''}` : `${n1(s.w || 0)} × ${s.r || 0}`;
const wkVol = w => w.ex.reduce((a, x) => a + x.sets.reduce((b, s) => b + (s.done ? toKg(s.w || 0, w.u) * (s.r || 0) : 0), 0), 0);
const wkSets = w => w.ex.reduce((a, x) => a + x.sets.filter(s => s.done).length, 0);

/* ---------- Portada del gimnasio (dentro de Entrenar) ---------- */
function renderHome(box){
  const wk = SF.mondayOf(todayISO()), week = workouts.filter(w => w.d >= wk);
  const vol = week.reduce((a, w) => a + wkVol(w), 0);
  box.innerHTML = `
    ${live ? `<button class="sflive" id="gyResume" style="width:100%"><span class="ic">🏋️</span><span class="l"><small>RUTINA EN CURSO</small><b>${esc(live.name)}</b><small>${wkSets(live)} series hechas · toca para seguir</small></span><span class="arrow">›</span></button>` : ''}
    <div class="kpis sfk3"><div class="kpi" style="--kc:#8b5cf6"><b>${week.length}</b><span>Rutinas esta semana</span></div><div class="kpi" style="--kc:#22c55e"><b>${nf(unit() === 'lb' ? vol / 0.45359 : vol)}</b><span>${unit()} movidos</span></div><div class="kpi" style="--kc:#f59e0b"><b>${prN}</b><span>Récords</span></div></div>
    <div class="btnrow" style="margin-bottom:14px"><button class="btn pri" id="gyFree" style="--bc:var(--mode)">▶ LIBRE</button><button class="btn" id="gyNew">+ RUTINA</button></div>
    <div class="gridlbl">${hsecHead('📋', 'MIS RUTINAS', 'Toca ▶ para empezar o la tarjeta para editarla', '#8b5cf6')}</div>
    <div id="gyList">${routines.map((r, i) => `<div class="wcard" style="--c:${r.color};--i:${i}">
        <button class="wmain" data-re="${r.id}"><b>${esc(r.name)}</b><small>${r.items.length} ejercicios · ${r.items.reduce((a, x) => a + x.sets, 0)} series${r.level ? ' · ' + esc(r.level) : ''}</small>
          <span class="sfmus">${[...new Set(r.items.map(x => ex(x.e).m))].slice(0, 5).map(m => `<i style="--pc:${M[m][1]}">${M[m][0]}</i>`).join('')}</span></button>
        <button class="wplay" data-rp="${r.id}" aria-label="Empezar">${SFTrain.PLAY}</button></div>`).join('') || '<p class="empty">Crea tu primera rutina.</p>'}</div>
    <div class="tiles" style="margin-top:6px">
      <button class="tile" style="--c:#3b82f6;--i:1" data-open="gymHist"><span>🗂️</span><b>HISTORIAL</b><small>${workouts.length} rutinas hechas</small></button>
      <button class="tile" style="--c:#f59e0b;--i:2" data-open="gymLib"><span>📚</span><b>EJERCICIOS</b><small>${EXS().length} con tus récords</small></button></div>
    <div class="sect"><div class="row" style="border:0"><div class="l"><b>Unidad de peso</b><small>Para anotar las pesas del gimnasio</small></div><div class="seg" id="gyUnit" style="margin:0;width:120px"><button type="button" data-u="kg">KG</button><button type="button" data-u="lb">LB</button></div></div></div>
    ${workouts.length ? '' : SFPets.says(null, 'Elige una rutina, anota el peso y las repeticiones de cada serie, y yo me acuerdo de todo para que la próxima vez lo superes.')}`;
  const rs = box.querySelector('#gyResume'); if (rs) rs.addEventListener('click', () => go('gymLive'));
  box.querySelector('#gyFree').addEventListener('click', () => startWorkout(null));
  box.querySelector('#gyNew').addEventListener('click', () => { const r = { id: uid(), name: 'Mi rutina', color: '#8b5cf6', items: [] }; routines.push(r); saveR(); editing = r; go('gymRoutine'); setTimeout(() => pickExercise(addToRoutine), 350); });
  box.querySelectorAll('[data-re]').forEach(b => b.addEventListener('click', () => { editing = routines.find(r => r.id === b.dataset.re); go('gymRoutine'); }));
  box.querySelectorAll('[data-rp]').forEach(b => b.addEventListener('click', () => startWorkout(b.dataset.rp)));
  box.querySelectorAll('#gyUnit [data-u]').forEach(b => { b.classList.toggle('on', b.dataset.u === unit()); b.addEventListener('click', () => { S.unit = b.dataset.u; saveSettings(); hapticTap(); SFTrain.render(); }); });
}

/* ---------- Buscador de ejercicios ---------- */
function pickExercise(onPick, opt){
  let q = '', mus = '';
  openForm(`<h3 class="ftitle">${opt && opt.title || 'EJERCICIOS'}</h3>
    <input class="search" id="pxQ" placeholder="Buscar: press, sentadilla, curl…" autocomplete="off">
    <div class="sfchips" id="pxM"><button type="button" data-m="" class="on">Todos</button>${Object.entries(M).map(([k, v]) => `<button type="button" data-m="${k}">${v[0]}</button>`).join('')}</div>
    <div id="pxL" class="sfpick"></div>
    <div class="btnrow" style="margin-top:10px"><button class="btn" id="pxNew">+ CREAR EJERCICIO</button><button class="btn pri" id="pxOk" style="--bc:var(--mode)">LISTO</button></div>`, sh => {
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const draw = () => {
      const list = EXS().filter(e => (!mus || e.m === mus) && (!q || norm(e.n).includes(norm(q)))).slice(0, 60);
      sh.querySelector('#pxL').innerHTML = list.map(e => `<button type="button" data-e="${e.id}"><i style="background:${M[e.m][1]}"></i><span class="l"><b>${esc(e.n)}</b><small>${M[e.m][0]}${e.eq ? ' · ' + esc(e.eq) : ''}</small></span><em>+</em></button>`).join('') || '<p class="empty">No hay ejercicios con ese nombre. Créalo abajo.</p>';
      sh.querySelectorAll('#pxL [data-e]').forEach(b => b.addEventListener('click', () => { onPick(b.dataset.e); hapticTap(); b.classList.add('added'); b.querySelector('em').textContent = '✓'; }));
    };
    sh.querySelector('#pxQ').addEventListener('input', e => { q = e.target.value.trim(); draw(); });
    sh.querySelectorAll('#pxM [data-m]').forEach(b => b.addEventListener('click', () => { mus = b.dataset.m; sh.querySelectorAll('#pxM [data-m]').forEach(x => x.classList.toggle('on', x === b)); draw(); }));
    sh.querySelector('#pxOk').addEventListener('click', closeForm);
    sh.querySelector('#pxNew').addEventListener('click', () => newExercise(sh.querySelector('#pxQ').value.trim(), id => { onPick(id); }));
    draw();
  });
}
function newExercise(name, done){
  const e = { id: 'x' + uid(), n: name || '', m: 'pecho', eq: '', k: 'w', custom: true };
  openForm(`<h3 class="ftitle">CREAR EJERCICIO</h3>
    <label class="field"><span>Nombre</span><input id="nxN" maxlength="40" value="${esc(e.n)}" placeholder="Ej: Press en máquina Hammer"></label>
    <div class="field"><span>Músculo principal</span><div class="typechips">${Object.entries(M).map(([k, v]) => `<button type="button" data-m="${k}" style="--c:${v[1]}" class="${k === e.m ? 'on' : ''}">${v[0]}</button>`).join('')}</div></div>
    <div class="field"><span>¿Cómo se anota?</span><div class="seg" id="nxK"><button type="button" data-k="w" class="on">PESO × REPS</button><button type="button" data-k="b">SOLO REPS</button><button type="button" data-k="t">TIEMPO</button></div></div>
    <div class="btnrow"><button class="btn" id="nxC">CANCELAR</button><button class="btn pri" id="nxS" style="--bc:var(--mode)">CREAR</button></div>`, sh => {
    sh.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { e.m = b.dataset.m; sh.querySelectorAll('[data-m]').forEach(x => x.classList.toggle('on', x === b)); }));
    sh.querySelectorAll('#nxK [data-k]').forEach(b => b.addEventListener('click', () => { e.k = b.dataset.k; sh.querySelectorAll('#nxK [data-k]').forEach(x => x.classList.toggle('on', x === b)); }));
    sh.querySelector('#nxC').addEventListener('click', closeForm);
    sh.querySelector('#nxS').addEventListener('click', () => { e.n = sh.querySelector('#nxN').value.trim(); if (!e.n) return toast('Ponle un nombre'); customEx.push(e); save('sf_exx', customEx); EXI = null; closeForm(); toast('Ejercicio creado'); done && done(e.id); });
  });
}

/* ---------- Editor de rutina ---------- */
let editing = null;
SF.view('gymRoutine', 'RUTINA', { back: true, parent: 'train', backTo: 'train', render: renderRoutine });
function addToRoutine(eid){ if (!editing) return; const l = lastOf(eid), k = ex(eid).k; editing.items.push({ e: eid, sets: 3, reps: k === 't' ? '30' : '10', rest: k === 't' ? 45 : 90 }); saveR(); }
function renderRoutine(){
  const r = editing; if (!r) return go('train', true);
  const body = $('#gymRoutineBody');
  body.innerHTML = `
    <div class="preview" style="--c:${r.color}"><div class="ic">🏋️</div><div style="flex:1;min-width:0"><input id="grName" maxlength="34" value="${esc(r.name)}"><small id="grSum"></small></div></div>
    ${r.desc ? `<p class="hint">${esc(r.desc)}</p>` : ''}
    <div class="sect"><h4>EJERCICIOS</h4><div id="grItems"></div>
      <button class="btn" id="grAdd" style="width:100%;margin:10px 0 12px;border-style:dashed">+ AGREGAR EJERCICIO</button></div>
    <div class="sect"><h4>COLOR</h4><div class="swatches">${COLORS.map(c => `<button style="--s:${c}" data-c="${c}" class="${c === r.color ? 'on' : ''}"></button>`).join('')}</div></div>
    <div class="btnrow" style="margin-bottom:8px"><button class="btn" id="grDel" style="color:#f87171">ELIMINAR</button><button class="btn pri" id="grGo" style="--bc:${r.color}">▶ EMPEZAR</button></div>`;
  const sum = () => { body.querySelector('#grSum').textContent = `${r.items.length} ejercicios · ${r.items.reduce((a, x) => a + x.sets, 0)} series · ≈${Math.round(r.items.reduce((a, x) => a + x.sets * (x.rest + 40), 0) / 60)} min`; saveR(); };
  const draw = () => {
    const el = body.querySelector('#grItems');
    el.innerHTML = r.items.map((it, i) => { const e = ex(it.e); return `<div class="drillblk" style="--c:${M[e.m][1]}">
        <div class="dbtop"><span class="dic">${i + 1}</span><span class="l"><b>${esc(e.n)}</b><small>${M[e.m][0]}${e.eq ? ' · ' + esc(e.eq) : ''}</small></span>
          <span class="dbord"><button data-up="${i}" ${i === 0 ? 'disabled' : ''}>▲</button><button data-dn="${i}" ${i === r.items.length - 1 ? 'disabled' : ''}>▼</button></span><button class="xbtn" data-rm="${i}">×</button></div>
        <div class="dbctl"><div><small>Series</small><div class="stepper sm" data-st="sets" data-i="${i}"></div></div><div><small>${e.k === 't' ? 'Segundos' : 'Repeticiones'}</small><input class="numin sfreps" data-rp="${i}" value="${esc(it.reps)}" maxlength="7" inputmode="text"></div><div><small>Descanso</small><div class="stepper sm" data-st="rest" data-i="${i}"></div></div></div></div>`; }).join('') || '<p class="empty">Agrega ejercicios para armar tu rutina.</p>';
    el.querySelectorAll('[data-st]').forEach(st => { const i = +st.dataset.i, k = st.dataset.st;
      makeStepper(st, Object.assign(k === 'sets' ? { min: 1, max: 12, step: 1 } : { min: 0, max: 600, step: 15, fmt: v => v ? fmtShort(v) : '—' }, { get: () => r.items[i][k], set: v => r.items[i][k] = v, onChange: sum })); });
    el.querySelectorAll('[data-rp]').forEach(inp => inp.addEventListener('input', () => { r.items[+inp.dataset.rp].reps = inp.value.trim() || '10'; saveR(); }));
    el.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => { r.items.splice(+b.dataset.rm, 1); draw(); }));
    el.querySelectorAll('[data-up]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.up; [r.items[i - 1], r.items[i]] = [r.items[i], r.items[i - 1]]; draw(); }));
    el.querySelectorAll('[data-dn]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.dn; [r.items[i + 1], r.items[i]] = [r.items[i], r.items[i + 1]]; draw(); }));
    sum();
  };
  draw(); renderRoutine.redraw = draw;
  body.querySelector('#grName').addEventListener('input', e => { r.name = e.target.value || 'Mi rutina'; saveR(); });
  body.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => { r.color = b.dataset.c; saveR(); renderRoutine(); }));
  body.querySelector('#grAdd').addEventListener('click', () => pickExercise(addToRoutine));
  body.querySelector('#grGo').addEventListener('click', () => startWorkout(r.id));
  body.querySelector('#grDel').addEventListener('click', async () => { if (await confirmDlg('¿Eliminar rutina?', `Se borrará “${r.name}”. Tu historial no se toca.`, 'ELIMINAR')){ routines = routines.filter(x => x.id !== r.id); saveR(); go('train', true); } });
}

/* ---------- Entrenamiento en vivo ---------- */
SF.view('gymLive', 'RUTINA', { hideNav: true, parent: 'train', render: renderLive });
BACK_TO.gymLive = 'train';
function blankSets(eid, n, repsTxt){
  const l = lastOf(eid), k = ex(eid).k, target = parseInt(repsTxt, 10) || (k === 't' ? 30 : 10);
  const out = [];
  for (let i = 0; i < n; i++){
    const p = l ? (l.x.sets.filter(s => s.done)[i] || l.x.sets.filter(s => s.done).slice(-1)[0]) : null;
    out.push(k === 't' ? { t: p ? p.t : target, done: false } : { w: p ? (l.w.u === unit() ? p.w : Math.round((unit() === 'lb' ? toKg(p.w, l.w.u) / 0.45359 : toKg(p.w, l.w.u)) * 2) / 2) : 0, r: p ? p.r : target, done: false });
  }
  return out;
}
async function startWorkout(rid){
  if (live){ if (await confirmDlg('Ya hay una rutina en curso', `“${live.name}” sigue abierta. ¿Quieres seguir con ella?`, 'SEGUIR')) go('gymLive'); return; }
  if (SFTrain.isLive()) return toast('Termina primero la actividad del cronómetro');
  const r = rid ? routines.find(x => x.id === rid) : null;
  if (r && !r.items.length) return toast('Agrega ejercicios a la rutina');
  audio();
  live = { id: uid(), rid: rid || '', name: r ? r.name : 'Entreno libre', color: r ? r.color : '#8b5cf6', start: Date.now(), u: unit(),
    ex: r ? r.items.map(it => ({ e: it.e, target: `${it.sets} × ${it.reps}`, rest: it.rest, sets: blankSets(it.e, it.sets, it.reps) })) : [] };
  saveLive(); Sound.bell(1); go('gymLive');
  if (!r) setTimeout(() => pickExercise(addToLive), 350);
}
function addToLive(eid){ if (!live) return; const k = ex(eid).k; live.ex.push({ e: eid, target: '', rest: k === 't' ? 45 : 90, sets: blankSets(eid, 3, k === 't' ? '30' : '10') }); saveLive(); }
const _cf = closeForm;
closeForm = function(){ _cf(); if (current === 'gymLive') renderLive(); else if (current === 'gymRoutine' && renderRoutine.redraw) renderRoutine.redraw(); };

let rest = null;   // { endAt, total, lastSec }
function renderLive(){
  if (!live) return go('train', true);
  const body = $('#gymLiveBody'), u = live.u;
  $('#gymLiveTitle').innerHTML = `<span style="display:block;line-height:1">${esc(live.name.toUpperCase())}</span><small id="glTime" class="sfelapsed">00:00</small>`;
  let tb = $('#gymLive .topbar #glEnd');
  if (!tb){ const b = document.createElement('button'); b.className = 'smallbtn go'; b.id = 'glEnd'; b.textContent = 'TERMINAR'; $('#gymLive .topbar').appendChild(b); b.addEventListener('click', finishWorkout);
    const m = document.createElement('button'); m.className = 'iconbtn'; m.id = 'glMin'; m.setAttribute('aria-label', 'Minimizar'); m.innerHTML = SF.BACK_SVG; $('#gymLive .topbar').prepend(m); m.addEventListener('click', () => go('train', true)); }
  body.innerHTML = SFPlan.warmCard('gym', 'gymLive') + live.ex.map((x, xi) => { const e = ex(x.e), l = lastOf(x.e), b = bestOf(x.e);
    return `<div class="sfex" style="--c:${M[e.m][1]}">
      <div class="hd"><span class="l"><b>${esc(e.n)}</b><small>${M[e.m][0]}${x.target ? ' · meta ' + esc(x.target) : ''}</small></span><button class="xbtn" data-xr="${xi}">×</button></div>
      ${l ? `<p class="prev">La vez pasada (${shortDate(l.w.d)}): <b>${l.x.sets.filter(s => s.done).map(s => setTxt(s, e.k, l.w.u)).join(' · ')}</b>${e.k === 'w' ? ' ' + l.w.u : ''}</p>` : '<p class="prev">Primera vez: anota lo que hagas y la próxima te lo recuerdo.</p>'}
      <div class="sets"><div class="sr th"><span>#</span><span>${e.k === 't' ? 'SEGUNDOS' : e.k === 'b' ? 'LASTRE ' + u.toUpperCase() : u.toUpperCase()}</span><span>${e.k === 't' ? '' : 'REPS'}</span><span></span></div>
      ${x.sets.map((s, si) => `<div class="sr ${s.done ? 'done' : ''}"><span class="n">${si + 1}</span>
        ${e.k === 't' ? `<input class="numin" inputmode="numeric" data-f="t" data-x="${xi}" data-s="${si}" value="${s.t || ''}"><span></span>`
          : `<input class="numin" inputmode="decimal" data-f="w" data-x="${xi}" data-s="${si}" value="${s.w || ''}" placeholder="${e.k === 'b' ? '0' : '—'}"><input class="numin" inputmode="numeric" data-f="r" data-x="${xi}" data-s="${si}" value="${s.r || ''}">`}
        <button class="chk" data-ok="${xi}:${si}" aria-label="Serie hecha">✓</button></div>`).join('')}</div>
      <div class="ft"><button class="linkbtn" data-as="${xi}">+ Serie</button>${x.sets.length > 1 ? `<button class="linkbtn" data-ds="${xi}">− Quitar última</button>` : ''}<span class="spacer"></span><span class="restlbl">Descanso</span><div class="stepper sm" data-rest="${xi}"></div></div>
    </div>`; }).join('') + `<button class="btn" id="glAdd" style="width:100%;border-style:dashed;margin:4px 0 14px;flex:none">+ AGREGAR EJERCICIO</button>
    <button class="btn" id="glCancel" style="width:100%;color:#f87171;flex:none;margin-bottom:90px">DESCARTAR ENTRENO</button>
    <div class="sfrest" id="glRest"><div class="bar"><i id="glRestBar"></i></div><div class="in"><span><small>DESCANSO</small><b id="glRestT">0:00</b></span><button class="smallbtn" data-ra="-15">−15</button><button class="smallbtn" data-ra="15">+15</button><button class="smallbtn go" id="glRestSkip">SALTAR</button></div></div>`;
  body.querySelectorAll('input[data-f]').forEach(inp => {
    inp.addEventListener('focus', () => setTimeout(() => inp.select(), 30));
    inp.addEventListener('input', () => { const s = live.ex[+inp.dataset.x].sets[+inp.dataset.s]; s[inp.dataset.f] = inp.dataset.f === 'w' ? num(inp.value) : Math.round(num(inp.value)); saveLive(); });
  });
  body.querySelectorAll('[data-ok]').forEach(b => b.addEventListener('click', () => {
    const [xi, si] = b.dataset.ok.split(':').map(Number), x = live.ex[xi], s = x.sets[si], k = ex(x.e).k;
    if (!s.done && k !== 't' && !(s.r > 0)) return toast('Anota las repeticiones');
    if (!s.done && k === 't' && !(s.t > 0)) return toast('Anota los segundos');
    s.done = !s.done; saveLive(); hapticTap();
    b.closest('.sr').classList.toggle('done', s.done);
    if (s.done){
      const pb = bestOf(x.e), kgw = toKg(s.w || 0, live.u);
      if (k === 'w' && pb.e1 > 0 && e1rm(kgw, s.r) > pb.e1 + 0.01 && !s.pr){ s.pr = 1; saveLive(); toast(TF('🏆 ¡Récord en {s}!', TT(ex(x.e).n))); Sound.win(); }
      // copia el peso a las series que siguen sin tocar
      x.sets.slice(si + 1).forEach((n, j) => { if (!n.done && !n.w && s.w){ n.w = s.w; const inp = body.querySelector(`input[data-f="w"][data-x="${xi}"][data-s="${si + 1 + j}"]`); if (inp) inp.value = s.w; } });
      const lastSet = xi === live.ex.length - 1 && si === x.sets.length - 1;
      if (x.rest > 0 && !lastSet) startRest(x.rest);
    }
    paintElapsed();
  }));
  body.querySelectorAll('[data-as]').forEach(b => b.addEventListener('click', () => { const x = live.ex[+b.dataset.as], p = x.sets[x.sets.length - 1] || {}; x.sets.push(ex(x.e).k === 't' ? { t: p.t || 30, done: false } : { w: p.w || 0, r: p.r || 10, done: false }); saveLive(); keepScroll(renderLive); }));
  body.querySelectorAll('[data-ds]').forEach(b => b.addEventListener('click', () => { live.ex[+b.dataset.ds].sets.pop(); saveLive(); keepScroll(renderLive); }));
  body.querySelectorAll('[data-xr]').forEach(b => b.addEventListener('click', async () => { const x = live.ex[+b.dataset.xr]; if (await confirmDlg('¿Quitar ejercicio?', ex(x.e).n, 'QUITAR')){ live.ex.splice(+b.dataset.xr, 1); saveLive(); renderLive(); } }));
  body.querySelectorAll('[data-rest]').forEach(st => { const xi = +st.dataset.rest; makeStepper(st, { get: () => live.ex[xi].rest, set: v => live.ex[xi].rest = v, min: 0, max: 600, step: 15, fmt: v => v ? fmtShort(v) : '—', onChange: saveLive }); });
  body.querySelector('#glAdd').addEventListener('click', () => pickExercise(addToLive));
  body.querySelector('#glCancel').addEventListener('click', async () => { if (await confirmDlg('¿Descartar el entreno?', 'No se guardará nada de esta rutina.', 'DESCARTAR')){ live = null; saveLive(); rest = null; keepAwake(false); go('train', true); } });
  body.querySelectorAll('[data-ra]').forEach(b => b.addEventListener('click', () => { if (rest){ rest.endAt += +b.dataset.ra * 1000; rest.total = Math.max(5, rest.total + +b.dataset.ra); hapticTap(); tick(); } }));
  body.querySelector('#glRestSkip').addEventListener('click', () => { rest = null; tick(); });
  SFPlan.bindWarm(body, 'gym');
  keepAwake(true); paintElapsed(); tick();
}
function keepScroll(fn){ const v = $('#gymLive'), y = v.scrollTop; fn(); v.scrollTop = y; }
function paintElapsed(){ const el = document.getElementById('glTime'); if (el && live){ const s = Math.floor((Date.now() - live.start) / 1000); el.textContent = (s >= 3600 ? Math.floor(s / 3600) + ':' : '') + fmt(s % 3600) + ' · ' + wkSets(live) + ' series'; } }
function startRest(sec){ audio(); rest = { endAt: Date.now() + sec * 1000, total: sec, lastSec: -1 }; tick(); }
function tick(){
  if (current !== 'gymLive'){ if (rest && Date.now() >= rest.endAt){ rest = null; Sound.bell(1); vibrate([300, 120, 300]); toast('⏱️ Descanso terminado: ¡a la siguiente serie!'); } return; }
  paintElapsed();
  const bar = document.getElementById('glRest'); if (!bar) return;
  if (!rest){ bar.classList.remove('show'); return; }
  const ms = rest.endAt - Date.now(), sec = Math.ceil(ms / 1000);
  if (ms <= 0){ rest = null; bar.classList.remove('show'); Sound.bell(1); vibrate([300, 120, 300]); flash('work'); return; }
  bar.classList.add('show');
  document.getElementById('glRestT').textContent = fmt(sec).replace(/^0/, '');
  document.getElementById('glRestBar').style.width = clamp(ms / (rest.total * 1000) * 100, 0, 100) + '%';
  if (sec !== rest.lastSec){ rest.lastSec = sec; if (sec <= 3 && sec >= 1 && S.countdown) Sound.beep(false); }
}
setInterval(tick, 250);

async function finishWorkout(){
  if (!live) return;
  const sets = wkSets(live);
  if (!sets){ if (await confirmDlg('No marcaste ninguna serie', 'Toca ✓ en cada serie que hagas. ¿Descartar este entreno?', 'DESCARTAR')){ live = null; saveLive(); rest = null; keepAwake(false); go('train', true); } return; }
  if (!await confirmDlg('¿Terminar la rutina?', `${sets} series hechas. Se guardará en tu historial.`, 'TERMINAR')) return;
  const min = clamp(Math.round((Date.now() - live.start) / 60000), 1, 300);
  const w = { id: live.id, d: todayISO(), ts: Date.now(), rid: live.rid, name: live.name, color: live.color, u: live.u, min,
    ex: live.ex.map(x => ({ e: x.e, sets: x.sets.filter(s => s.done).map(s => { const o = { done: true }; if (s.t) o.t = s.t; else { o.w = s.w || 0; o.r = s.r || 0; } return o; }) })).filter(x => x.sets.length) };
  // récords: se comparan con todo lo anterior (la primera vez de un ejercicio no cuenta como récord)
  const prs = [];
  w.ex.forEach(x => { const e = ex(x.e), pb = bestOf(x.e); if (e.k !== 'w' || !pb.e1) return;
    const top = x.sets.reduce((a, s) => Math.max(a, e1rm(toKg(s.w, w.u), s.r)), 0), topW = x.sets.reduce((a, s) => Math.max(a, toKg(s.w, w.u)), 0);
    if (top > pb.e1 + 0.01) prs.push({ n: e.n, txt: `1RM estimado ${fmtW(top)} ${unit()}` + (topW > pb.w + 0.01 ? ` · peso máximo ${fmtW(topW)} ${unit()}` : '') }); });
  workouts.push(w); if (workouts.length > 1500) workouts.shift(); saveWk();
  if (prs.length){ prN += prs.length; save('sf_prs', prN); }
  const vol = wkVol(w), dens = sets / min;   // series por minuto: qué tan seguido se trabajó
  const h = saving() ? logTrain({ p: w.name, t: 'gym', a: dens > 0.55 ? 'circuit' : dens > 0.3 ? 'w_vig' : 'w_mod', m: min, sets, vol: Math.round(vol), wid: w.id, manual: true }) : null;
  if (h){ w.hid = h.id; saveWk(); stats.sessions++; stats.trainSec = (stats.trainSec || 0) + min * 60; save('stats', stats); }
  live = null; saveLive(); rest = null; keepAwake(false);
  go('train', true);
  Sound.bell(3); confetti(w.color);
  openForm(`<div class="sfdone"><div class="big">🏋️</div><h3>¡RUTINA COMPLETA!</h3><p>${esc(w.name)}</p>
    <div class="kpis"><div class="kpi" style="--kc:#8b5cf6"><b>${hm(min)}</b><span>Tiempo</span></div><div class="kpi" style="--kc:#22c55e"><b>${sets}</b><span>Series</span></div>
      <div class="kpi" style="--kc:#3b82f6"><b>${nf(unit() === 'lb' ? vol / 0.45359 : vol)}</b><span>${unit()} movidos</span></div><div class="kpi" style="--kc:#f59e0b"><b>${h ? '≈' + nf(h.k) : '—'}</b><span>kcal</span></div></div>
    ${prs.length ? `<div class="prs"><h5>🏆 RÉCORDS NUEVOS</h5>${prs.map(p => `<p><b>${esc(p.n)}</b><small>${p.txt}</small></p>`).join('')}</div>` : ''}
    <button class="btn pri" id="wdOk" style="width:100%;--bc:${w.color}">¡LISTO!</button></div>`, sh => sh.querySelector('#wdOk').addEventListener('click', closeForm));
}

/* ---------- Historial ---------- */
SF.view('gymHist', 'HISTORIAL', { back: true, parent: 'train', backTo: 'train', render: renderHist });
function renderHist(){
  const body = $('#gymHistBody'), list = workouts.slice().reverse();
  body.innerHTML = list.length ? `<div class="sect" style="padding:4px 14px">${list.slice(0, 120).map(w => `<button class="evrow" data-w="${w.id}" style="--c:${w.color || '#8b5cf6'}"><i></i><span class="l"><b>${esc(w.name)}</b><small>${niceDate(w.d)} · ${hm(w.min)} · ${wkSets(w)} series · ${nf(unit() === 'lb' ? wkVol(w) / 0.45359 : wkVol(w))} ${unit()}</small></span><span class="arrow">›</span></button>`).join('')}</div>`
    : SFPets.says(null, 'Todavía no has terminado ninguna rutina. Cuando termines la primera, aquí queda guardada con cada serie.');
  body.querySelectorAll('[data-w]').forEach(b => b.addEventListener('click', () => openWorkout(b.dataset.w)));
}
function openWorkout(id){
  const w = workouts.find(x => x.id === id); if (!w) return;
  const h = sessLog.find(x => x.wid === w.id);
  openForm(`<h3 class="ftitle">${esc(w.name.toUpperCase())}</h3><p class="hint">${niceDate(w.d)} · ${hm(w.min)} · ${wkSets(w)} series${h ? ' · ≈' + nf(SF.kcalOf(h)) + ' kcal' : ''}</p>
    ${w.ex.map(x => { const e = ex(x.e); return `<div class="sfwex"><b>${esc(e.n)}</b><small>${x.sets.map(s => setTxt(s, e.k, w.u)).join(' · ')}${e.k === 'w' ? ' ' + w.u : ''}</small></div>`; }).join('')}
    <div class="btnrow" style="margin-top:12px"><button class="btn" id="owDel" style="color:#f87171">BORRAR</button>${w.rid && routines.find(r => r.id === w.rid) ? '<button class="btn" id="owRep">REPETIR</button>' : ''}<button class="btn pri" id="owOk" style="--bc:var(--mode)">CERRAR</button></div>`, sh => {
    sh.querySelector('#owOk').addEventListener('click', closeForm);
    const rp = sh.querySelector('#owRep'); if (rp) rp.addEventListener('click', () => { closeForm(); startWorkout(w.rid); });
    sh.querySelector('#owDel').addEventListener('click', async () => { closeForm(); if (await confirmDlg('¿Borrar este entreno?', 'Se quita del historial, de tus calorías y de tus récords.', 'BORRAR')){ workouts = workouts.filter(x => x.id !== w.id); saveWk(); if (h) removeSessLog(h); renderHist(); } });
  });
}

/* ---------- Biblioteca y detalle de ejercicio ---------- */
let libQ = '', libM = '', exSel = null;
SF.view('gymLib', 'EJERCICIOS', { back: true, parent: 'train', backTo: 'train', render: renderLib, action: '+ CREAR' });
SF.view('gymEx', 'EJERCICIO', { back: true, parent: 'train', backTo: 'gymLib', render: renderEx });
$('#gymLibAct').addEventListener('click', () => newExercise('', () => renderLib()));
function renderLib(){
  const body = $('#gymLibBody');
  if (!body.querySelector('#glQ')){
    body.innerHTML = `<input class="search" id="glQ" placeholder="Buscar ejercicio…" autocomplete="off"><div class="sfchips" id="glM"><button type="button" data-m="" class="on">Todos</button>${Object.entries(M).map(([k, v]) => `<button type="button" data-m="${k}">${v[0]}</button>`).join('')}</div><div id="glL" class="sfpick"></div>`;
    body.querySelector('#glQ').addEventListener('input', e => { libQ = e.target.value.trim(); drawLib(); });
    body.querySelectorAll('#glM [data-m]').forEach(b => b.addEventListener('click', () => { libM = b.dataset.m; body.querySelectorAll('#glM [data-m]').forEach(x => x.classList.toggle('on', x === b)); drawLib(); }));
  }
  drawLib();
}
function drawLib(){
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const list = EXS().filter(e => (!libM || e.m === libM) && (!libQ || norm(e.n).includes(norm(libQ))));
  $('#glL').innerHTML = list.map(e => { const b = bestOf(e.id); return `<button type="button" data-e="${e.id}"><i style="background:${M[e.m][1]}"></i><span class="l"><b>${esc(e.n)}</b><small>${M[e.m][0]}${e.eq ? ' · ' + esc(e.eq) : ''}</small></span>${b.w || b.r || b.t ? `<span class="tagpill" style="--pc:#f59e0b">🏆 ${e.k === 'w' ? fmtW(b.w) + ' ' + unit() : e.k === 't' ? b.t + ' s' : b.r + ' reps'}</span>` : '<em>›</em>'}</button>`; }).join('') || '<p class="empty">Nada con ese nombre.</p>';
  $$('#glL [data-e]').forEach(b => b.addEventListener('click', () => { exSel = b.dataset.e; go('gymEx'); }));
}
function renderEx(){
  const e = ex(exSel), b = bestOf(e.id), body = $('#gymExBody');
  const hist = workouts.filter(w => w.ex.some(x => x.e === e.id));
  const pts = hist.slice(-20).map(w => { const x = w.ex.find(x => x.e === e.id); return { x: shortDate(w.d), v: e.k === 'w' ? x.sets.reduce((a, s) => Math.max(a, e1rm(toKg(s.w, w.u), s.r)), 0) / (unit() === 'lb' ? 0.45359 : 1) : e.k === 't' ? x.sets.reduce((a, s) => Math.max(a, s.t || 0), 0) : x.sets.reduce((a, s) => Math.max(a, s.r || 0), 0) }; });
  body.innerHTML = `<div class="preview" style="--c:${M[e.m][1]}"><div class="ic">🏋️</div><div style="flex:1;min-width:0"><b class="sfexname">${esc(e.n)}</b><small>${M[e.m][0]}${e.eq ? ' · ' + esc(e.eq) : ''}${e.custom ? ' · creado por ti' : ''}</small></div></div>
    <div class="kpis">${e.k === 'w' ? `<div class="kpi" style="--kc:#f59e0b"><b>${b.w ? fmtW(b.w) + ' ' + unit() : '—'}</b><span>Peso máximo</span></div><div class="kpi" style="--kc:#8b5cf6"><b>${b.e1 ? fmtW(b.e1) + ' ' + unit() : '—'}</b><span>1RM estimado</span></div>`
      : `<div class="kpi" style="--kc:#f59e0b"><b>${e.k === 't' ? (b.t || '—') + (b.t ? ' s' : '') : (b.r || '—')}</b><span>${e.k === 't' ? 'Mejor tiempo' : 'Más repeticiones'}</span></div><div class="kpi" style="--kc:#8b5cf6"><b>${hist.length}</b><span>Veces hecho</span></div>`}</div>
    <div class="sect"><h4>${e.k === 'w' ? '1RM ESTIMADO' : e.k === 't' ? 'SEGUNDOS' : 'REPETICIONES'} · PROGRESO</h4><div style="padding-bottom:10px">${SF.lineChart(pts, M[e.m][1], { empty: 'Hazlo en 2 entrenos o más y verás tu progreso.', minSpan: 4 })}</div></div>
    ${e.k === 'w' && b.e1 ? `<div class="sect"><h4>TUS PESOS POR REPETICIONES</h4><p class="hint">Calculado con tu mejor serie (fórmula de Epley). Úsalo de guía para escoger el peso.</p><div class="sfrm">${[1, 3, 5, 8, 10, 12].map(r => `<div><b>${fmtW(b.e1 / (1 + r / 30) * (r === 1 ? 1 + 1 / 30 : 1))}</b><small>${r} rep${r > 1 ? 's' : ''}</small></div>`).join('')}</div></div>` : ''}
    <div class="sect"><h4>HISTORIAL</h4>${hist.slice().reverse().slice(0, 15).map(w => { const x = w.ex.find(x => x.e === e.id); return `<div class="row"><span class="l"><b>${x.sets.map(s => setTxt(s, e.k, w.u)).join(' · ')}${e.k === 'w' ? ' ' + w.u : ''}</b><small>${niceDate(w.d)} · ${esc(w.name)}</small></span></div>`; }).join('') || '<p class="empty">Aún no lo has hecho.</p>'}</div>
    ${e.custom ? '<button class="btn" id="exDel" style="width:100%;color:#f87171;flex:none">ELIMINAR EJERCICIO</button>' : ''}`;
  const del = body.querySelector('#exDel'); if (del) del.addEventListener('click', async () => { if (await confirmDlg('¿Eliminar ejercicio?', 'Se quita de la biblioteca. Los entrenos donde lo usaste se conservan.', 'ELIMINAR')){ customEx = customEx.filter(x => x.id !== e.id); save('sf_exx', customEx); EXI = null; go('gymLib', true); } });
}

Object.assign(GUIDE, {
  gymRoutine: () => ({ t:'cómo armar una rutina', b:[`<p>Agrega ejercicios y ajusta las <b>series</b>, las <b>repeticiones</b> (puede ser un rango, como 8-12) y el <b>descanso</b> de cada uno.</p>`, `<p>Ordénalos con las flechas. Con ▶ arrancas la rutina y yo te voy llevando.</p>`] }),
  gymLive: () => ({ t:'el entreno en vivo', b:[`<p>Anota el <b>peso</b> y las <b>repeticiones</b> de cada serie y toca <b>✓</b>. El descanso arranca solo y suena cuando termina.</p>`, `<ul><li>Arriba de cada ejercicio ves lo que hiciste la vez pasada.</li><li>Si superas tu mejor marca, te aviso: 🏆 récord.</li><li>La flecha minimiza la rutina sin perderla; <b>Terminar</b> la guarda.</li></ul>`] }),
  gymHist: () => ({ t:'tu historial', b:[`<p>Todas tus rutinas terminadas, con cada serie. Toca una para verla, repetirla o borrarla.</p>`] }),
  gymLib: () => ({ t:'los ejercicios', b:[`<p>La biblioteca completa por músculo. Toca un ejercicio para ver tus <b>récords</b>, tu progreso y qué peso usar según las repeticiones.</p>`, `<p>¿No está el que haces? Créalo con <b>+ Crear</b>.</p>`] }),
  gymEx: () => ({ t:'este ejercicio', b:[`<p>Tu mejor peso, tu <b>1RM estimado</b> (lo máximo que podrías levantar una vez) y cómo has progresado.</p>`] }),
});

window.SFGym = { routines: () => routines, renderHome, isLive: () => !!live, prCount: () => prN, workouts: () => workouts, wkVol, wkSets, unit, muscleOf: id => ex(id).m };
})();
