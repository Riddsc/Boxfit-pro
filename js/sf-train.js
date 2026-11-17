/* =========================================================
   SATRONHO BOXFIT · ENTRENAR
   Una sola pantalla con tres pestañas: Boxeo, Gimnasio y Cardio.
   También: la Escuelita de boxeo y el cronómetro de actividades.
   ========================================================= */
(function(){
const { nf, hm } = SF;
const PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.2-6.5a1 1 0 0 0 0-1.7L9.5 4.6A1 1 0 0 0 8 5.5z"/></svg>';
SF.view('train', 'BOXEO', { render: render, back: true });
const tab = () => S.trainTab === 'cardio' ? 'cardio' : S.disc === 'gym' ? 'gym' : 'box';
function setTab(t){
  S.trainTab = t; if (t !== 'cardio') S.disc = t;
  saveSettings(); hapticTap(); applyModeUI(); render();
}

const TITLES = { box: 'BOXEO', gym: 'GIMNASIO', cardio: 'CARDIO' };
function render(){
  const body = $('#trainBody'), t = tab();
  document.documentElement.dataset.mode = S.disc === 'gym' ? 'gym' : 'box';
  $('#trainTitle').textContent = TITLES[t];
  body.innerHTML = `${liveBannerHTML()}${window.SFPlan ? SFPlan.todayStrip(t) : ''}<div id="trainTab"></div>`;
  bindLiveBanner(body);
  if (window.SFPlan) SFPlan.bindStrip(body);
  const box = body.querySelector('#trainTab');
  if (t === 'box') renderBox(box); else if (t === 'gym') SFGym.renderHome(box); else renderCardio(box);
  box.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => { hapticTap(); go(b.dataset.open); }));
}

/* ---------- Boxeo ---------- */
function renderBox(box){
  const wk = SF.mondayOf(todayISO());
  const week = sessLog.filter(h => h.d >= wk && h.t !== 'gym' && h.t !== 'cardio');
  const rounds = week.reduce((a, h) => a + (h.r || 0), 0), kc = week.reduce((a, h) => a + SF.kcalOf(h), 0);
  box.innerHTML = `
    <div class="kpis sfk3"><div class="kpi" style="--kc:#f97316"><b>${week.length}</b><span>Entrenos esta semana</span></div><div class="kpi" style="--kc:#ef4444"><b>${rounds}</b><span>Rounds</span></div><div class="kpi" style="--kc:#f59e0b"><b>${nf(kc)}</b><span>kcal</span></div></div>
    ${SFPlan.warmCard('box', 'train')}
    ${S.noSave ? `<div class="note" style="--c:#3b82f6;margin:0 0 12px">📣 <span><b>Modo clase activo:</b> el timer y las sesiones no guardan nada en tus datos.</span></div>` : ''}
    ${hsec('🛠️', 'HERRAMIENTAS', 'Timer de rounds, semáforo y ruletas', '#ef4444', `<div class="tiles three">${toolTiles()}</div>`)}
    ${hsec('🥋', 'ENTRENO GUIADO', 'Te llevo paso a paso con tiempo y campana', '#f97316', `<div class="tiles">
      <button class="tile" style="--c:#f97316;--i:1" data-open="psessions"><span>🥊</span><b>SESIONES</b><small>${pSessions.length} preparadas</small></button>
      <button class="tile" style="--c:#eab308;--i:2" data-open="warmups"><span>🔥</span><b>CALENTAMIENTOS</b><small>${bhWarmups.length} rutinas guiadas</small></button>
      <button class="tile" style="--c:#06b6d4;--i:3" data-open="tecnica"><span>📖</span><b>ESCUELITA</b><small>${SFTecnica.items.length} técnicas explicadas</small></button>
      <button class="tile" style="--c:#22c55e;--i:4" id="trAct"><span>📝</span><b>+ ACTIVIDAD</b><small>Clase, sparring, saco…</small></button></div>`)}
    <div class="gridlbl">${hsecHead('⏱️', 'RUTINAS DEL TIMER', 'Elige una y queda lista para darle play', '#ef4444')}</div>
    <div class="grid" id="profileGrid"></div>
    <div class="sect" style="margin-top:14px"><h4>AJUSTES DEL BOXEO</h4>
      <div class="row"><div class="l"><b>Intensidad de mis rounds</b><small>Para calcular mejor las calorías del timer</small></div></div>
      <div class="seg" id="bxInt"><button type="button" data-i="1">SUAVE</button><button type="button" data-i="2">NORMAL</button><button type="button" data-i="3">FUERTE</button></div>
      <div class="row"><div class="l"><b>Modo clase</b><small>Para prestar el celular o dar clase a todos: timer, semáforo y ruletas sin guardar nada en tus datos</small></div><button class="switch ${S.noSave ? 'on' : ''}" id="bxNoSave"></button></div>
    </div>`;
  renderProfileGrid(box.querySelector('#profileGrid'));
  SFPlan.bindWarm(box, 'box');
  box.querySelector('#trAct').addEventListener('click', () => SFAct.openForm(todayISO(), 'box_class'));
  const paintI = () => box.querySelectorAll('#bxInt [data-i]').forEach(b => b.classList.toggle('on', +b.dataset.i === (S.boxInt || 2)));
  box.querySelectorAll('#bxInt [data-i]').forEach(b => b.addEventListener('click', () => { S.boxInt = +b.dataset.i; saveSettings(); hapticTap(); paintI(); }));
  paintI();
  box.querySelector('#bxNoSave').addEventListener('click', () => { S.noSave = !S.noSave; saveSettings(); hapticTap(); toast(S.noSave ? 'Modo clase: no se guarda nada' : 'Modo personal: todo vuelve a guardarse'); render(); });
}

/* ---------- Cardio: actividades rápidas y cronómetro ---------- */
const QUICK = ['walk', 'walk_fast', 'jog', 'run', 'bike', 'rope', 'stairs', 'swim', 'dance', 'soccer', 'hike', 'hiit'];
function renderCardio(box){
  const wk = SF.mondayOf(todayISO()), week = sessLog.filter(h => h.d >= wk && h.t === 'cardio');
  const st = SF.steps()[todayISO()] || 0;
  box.innerHTML = `
    ${SFPlan.warmCard('cardio', 'train')}
    <div class="kpis sfk3"><div class="kpi" style="--kc:#06b6d4"><b>${week.length}</b><span>Actividades esta semana</span></div><div class="kpi" style="--kc:#22c55e"><b>${hm(week.reduce((a, h) => a + SF.minOf(h), 0))}</b><span>Tiempo</span></div><div class="kpi" style="--kc:#38bdf8"><b>${nf(st)}</b><span>Pasos hoy</span></div></div>
    ${hsec('⏱️', 'EMPEZAR AHORA', 'Toca una actividad y el cronómetro arranca; al terminar se guarda sola', '#06b6d4',
      `<div class="sfquick">${QUICK.map(k => { const a = SF.ACT[k]; return `<button type="button" data-live="${k}"><span>${a.ic}</span><b>${a.n}</b><small>≈${nf(SF.kcalCalc({ a:k, m:30, manual:true }))} kcal / 30 min</small></button>`; }).join('')}</div>`)}
    <button class="btn" id="cdMore" style="width:100%;margin-bottom:10px;flex:none">📝 ANOTAR LO QUE YA HICE</button>
    <button class="btn" id="cdSteps" style="width:100%;margin-bottom:14px;flex:none">👟 PASOS DE HOY</button>
    ${SFPets.says(null, 'Las calorías salen de tu <b>peso</b>, el <b>tiempo</b> y lo duro de la actividad. Mantén tu peso al día y serán más precisas.')}`;
  SFPlan.bindWarm(box, 'cardio');
  box.querySelectorAll('[data-live]').forEach(b => b.addEventListener('click', () => startLive(b.dataset.live)));
  box.querySelector('#cdMore').addEventListener('click', () => SFAct.openForm(todayISO(), 'walk'));
  box.querySelector('#cdSteps').addEventListener('click', () => SF.openStepsForm());
}

/* Cronómetro de actividad: sigue contando aunque cierres la app (guarda la hora de inicio) */
let live = load('sf_liveact', null);     // { a, start, pausedMs, pauseAt }
const liveMs = () => live ? (live.pauseAt || Date.now()) - live.start - (live.pausedMs || 0) : 0;
function liveBannerHTML(){
  if (!live) return '';
  const a = SF.ACT[live.a] || SF.ACT.other;
  return `<div class="sflive" id="liveBar"><span class="ic">${a.ic}</span><span class="l"><small>${live.pauseAt ? 'EN PAUSA' : 'EN CURSO'} · ${esc(a.n)}</small><b id="liveTime">${fmt(liveMs() / 1000)}</b><small id="liveKcal"></small></span>
    <button class="smallbtn" id="livePause">${live.pauseAt ? '▶' : 'II'}</button><button class="smallbtn go" id="liveStop">TERMINAR</button></div>`;
}
function bindLiveBanner(root){
  const p = root.querySelector('#livePause'), s = root.querySelector('#liveStop');
  if (p) p.addEventListener('click', () => { hapticTap(); if (live.pauseAt){ live.pausedMs = (live.pausedMs || 0) + Date.now() - live.pauseAt; live.pauseAt = 0; } else live.pauseAt = Date.now(); save('sf_liveact', live); rerender(); });
  if (s) s.addEventListener('click', stopLive);
  tickLive();
}
const rerender = () => { if (current === 'train') render(); else if (current === 'home') SFToday.render(); };
async function startLive(k){
  if (live){ if (!await confirmDlg('Ya hay una actividad en curso', 'Termínala primero para empezar otra.', 'ENTENDIDO')) return; return; }
  if (window.SFGym && SFGym.isLive()) return toast('Termina primero tu rutina de pesas');
  audio(); live = { a: k, start: Date.now(), pausedMs: 0, pauseAt: 0 }; save('sf_liveact', live);
  Sound.bell(1); toast(`${SF.ACT[k].n}: cronómetro en marcha`); rerender();
}
async function stopLive(){
  if (!live) return;
  const min = Math.round(liveMs() / 60000), a = SF.ACT[live.a] || SF.ACT.other;
  if (min < 1){ if (await confirmDlg('¿Descartar?', 'Lleva menos de un minuto: no se guardará.', 'DESCARTAR')){ live = null; save('sf_liveact', null); rerender(); } return; }
  if (!await confirmDlg('¿Terminar?', `${a.n} · ${hm(min)} · ≈${nf(SF.kcalCalc({ a: a.k, m: min, manual: true }))} kcal`, 'TERMINAR')) return;
  logTrain({ p: a.n, a: a.k, t: a.g, m: min, manual: true });
  stats.sessions++; stats.trainSec = (stats.trainSec || 0) + min * 60; save('stats', stats);
  live = null; save('sf_liveact', null);
  Sound.win(); confetti('#06b6d4'); toast(`¡Guardado! ≈${nf(lastTrain.k)} kcal`); rerender();
}
function tickLive(){
  const el = document.getElementById('liveTime'); if (!el || !live) return;
  el.textContent = fmt(liveMs() / 1000);
  const k = document.getElementById('liveKcal'); if (k) k.textContent = '≈' + nf(SF.kcalCalc({ a: live.a, m: liveMs() / 60000, manual: true })) + ' kcal';
}
setInterval(tickLive, 1000);

/* ---------- Escuelita de boxeo ---------- */
let tecCat = 'fundamentos', tecOpen = null;
SF.view('tecnica', 'ESCUELITA', { back: true, parent: 'train', backTo: 'train', render: renderTec });
const LV_COLOR = { 'Básico':'#22c55e', 'Intermedio':'#f59e0b', 'Avanzado':'#ef4444' };
function renderTec(){
  const body = $('#tecnicaBody'), T0 = SFTecnica;
  const list = T0.items.filter(x => x.c === tecCat);
  body.innerHTML = `<p class="sub" style="margin-bottom:10px">Lo básico del boxeo explicado paso a paso. Escrito para un diestro: si eres zurdo, hazlo al revés.</p>
    <div class="sfchips">${T0.cats.map(c => `<button type="button" data-tc="${c[0]}" class="${c[0] === tecCat ? 'on' : ''}">${c[1]}</button>`).join('')}</div>
    ${list.map((x, i) => `<div class="sftec ${tecOpen === x.id ? 'open' : ''}" style="--i:${i}">
      <button type="button" class="hd" data-tid="${x.id}"><span class="l"><b>${esc(x.t)}</b><small>${esc(x.r)}</small></span><span class="tagpill" style="--pc:${LV_COLOR[x.l] || '#71717a'}">${esc(x.l)}</span></button>
      ${tecOpen === x.id ? `<div class="bd">
        ${x.p.length ? `<h5>PASO A PASO</h5><ol>${x.p.map(p => `<li>${esc(p)}</li>`).join('')}</ol>` : ''}
        ${x.e.length ? `<h5>ERRORES COMUNES</h5><ul class="bad">${x.e.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
        ${x.k ? `<p class="tipbox">💡 ${esc(x.k)}</p>` : ''}</div>` : ''}</div>`).join('')}`;
  body.querySelectorAll('[data-tc]').forEach(b => b.addEventListener('click', () => { tecCat = b.dataset.tc; tecOpen = null; hapticTap(); renderTec(); }));
  body.querySelectorAll('[data-tid]').forEach(b => b.addEventListener('click', () => { tecOpen = tecOpen === b.dataset.tid ? null : b.dataset.tid; hapticTap(); const y = $('#tecnica').scrollTop; renderTec(); $('#tecnica').scrollTop = y; }));
}
Object.assign(GUIDE, {
  tecnica: () => ({ t:'la escuelita', b:[`<p>Aquí está <b>lo básico del boxeo</b> bien explicado: guardia, golpes, defensa, combos, físico y cuidado.</p>`, `<p>Toca una técnica para ver el paso a paso, los errores más comunes y un consejo. Practícala en la sombra o en una <b>sesión guiada</b>.</p>`] }),
});

window.SFTrain = { render, liveBannerHTML, bindLiveBanner, isLive: () => !!live, PLAY };
})();
