/* =========================================================
   SATRONHO BOXFIT · COMIDA
   Diario de comidas, calorías y macros, agua, plan según tu
   objetivo, menús sugeridos, platos guardados y ayuno.
   ---------------------------------------------------------
   Cómo sale tu meta de calorías:
   · Mantenimiento = calorías en reposo (Mifflin-St Jeor) × tu día a día
     (1,2 sentado · 1,375 algo activo · 1,55 muy activo).
   · Bajar o subir: 1 kg de grasa ≈ 7.700 kcal, o sea ≈1.100 kcal al día
     por cada kilo a la semana. Nunca baja del mínimo seguro
     (1.200 mujeres · 1.500 hombres).
   · Lo que quemas entrenando se suma a lo que puedes comer ese día (se puede apagar).
   No reemplaza a un nutricionista: es una guía para llevar la cuenta.
   ========================================================= */
(function(){
const D = window.SFData, { nf, n1 } = SF;
const MEALS = [['des', 'Desayuno', '🌅'], ['mm', 'Media mañana', '🍎'], ['alm', 'Almuerzo', '🍽️'], ['alg', 'Algo', '☕'], ['cen', 'Cena', '🌙'], ['otr', 'Otros', '🍬']];
const DIETS = { eq: ['Equilibrada', 'De todo, en su medida'], hp: ['Alta en proteína', 'Para ganar o cuidar músculo'], lc: ['Baja en harinas', 'Menos arroz, pan y azúcar'], keto: ['Keto', 'Casi sin carbohidratos'], veg: ['Vegetariana', 'Sin carnes'] };
const P_COL = '#ef4444', C_COL = '#f59e0b', F_COL = '#8b5cf6', K_COL = '#22c55e';

/* ---------- Datos ---------- */
let log = load('sf_food', {});                         // { fecha: [{ id, m, n, g, k, p, c, f }] }
let custom = load('sf_foodx', []);                     // alimentos creados: mismo formato que la base
let dishes = load('sf_dishes', []);                    // platos guardados: { id, n, items: [...] }
let nut = Object.assign({ goal: 'keep', rate: 0.5, diet: 'eq', life: 1.2, addEx: true, manual: false, kcal: 2000, p: 120, c: 230, f: 65 }, load('sf_nut', {}));
let fast = load('sf_fast', null);                      // ayuno: { start, hours }
const saveLog = () => save('sf_food', log), saveNut = () => save('sf_nut', nut);
const FOODS = () => D.FOODS.concat(custom);
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const foodByName = n => FOODS().find(f => f[0] === n);
const mk = (f, g, m) => ({ id: uid(), m, n: f[0], g: Math.round(g), k: Math.round(f[1] * g / 100), p: +(f[2] * g / 100).toFixed(1), c: +(f[3] * g / 100).toFixed(1), f: +(f[4] * g / 100).toFixed(1) });
const sum = list => list.reduce((a, x) => { a.k += x.k || 0; a.p += x.p || 0; a.c += x.c || 0; a.f += x.f || 0; return a; }, { k: 0, p: 0, c: 0, f: 0 });
function dayTotals(ds){ const t = sum(log[ds] || []); t.n = (log[ds] || []).length; return t; }

/* ---------- Metas ---------- */
function targets(){
  if (nut.manual) return { k: nut.kcal, p: nut.p, c: nut.c, f: nut.f, maint: Math.round(SF.bmr() * nut.life), manual: true };
  const w = SF.kg(), maint = SF.bmr() * nut.life, floor = me.sex === 'F' ? 1200 : 1500;
  let k = maint + (nut.goal === 'lose' ? -nut.rate * 1100 : nut.goal === 'gain' ? nut.rate * 1100 : 0);
  const capped = k < floor; k = Math.max(floor, k);
  const pkg = nut.diet === 'hp' ? (nut.goal === 'lose' ? 2.2 : 2.0) : nut.diet === 'lc' ? 1.8 : nut.diet === 'keto' ? 1.6 : (nut.goal === 'keep' ? 1.4 : 1.6);
  const fpct = nut.diet === 'keto' ? 0.70 : nut.diet === 'lc' ? 0.40 : nut.diet === 'hp' ? 0.25 : 0.28;
  const p = Math.round(Math.min(pkg * w, k * 0.4 / 4)), f = Math.round(k * fpct / 9), c = Math.max(0, Math.round((k - p * 4 - f * 9) / 4));
  return { k: Math.round(k / 10) * 10, p, c, f, maint: Math.round(maint), capped };
}
function dayGoal(ds){ const t = targets(), ex = nut.addEx ? SF.dayBurn(ds).active : 0; return { base: t.k, ex, k: t.k + ex, t }; }

/* ---------- Pantalla ---------- */
let day = todayISO();
SF.view('nutri', 'DIARIO DE COMIDA', { render: render, back: true });
const TITLES = { diary: 'DIARIO DE COMIDA', plan: 'MI PLAN', water: 'AGUA Y AYUNO' };
function render(){
  const tb = SFNav.tab.nutri;
  $('#nutriTitle').textContent = TITLES[tb];
  if (tb === 'plan') return renderPlan();
  if (tb === 'water') return renderWater();
  renderDiary();
}
const bar = (lbl, v, goal, col) => `<div class="sfmac"><div class="top"><b>${lbl}</b><span>${nf(v)} / ${nf(goal)} g</span></div><div class="trk"><i style="width:${clamp(goal ? v / goal * 100 : 0, 0, 100)}%;background:${col}"></i></div></div>`;
function renderDiary(){
  if (day > todayISO()) day = todayISO();
  const body = $('#nutriBody'), t = todayISO(), tot = dayTotals(day), g = dayGoal(day), left = g.k - tot.k;
  const items = log[day] || [], b = SF.dayBurn(day), spent = b.rest + b.active, bal = tot.k - spent;
  body.innerHTML = `
    <div class="calhead"><button class="iconbtn" id="nuPrev" aria-label="Día anterior">${SF.BACK_SVG}</button>
      <button class="calmonth" id="nuToday"><b style="font-size:22px">${day === t ? 'HOY' : day === addDays(t, -1) ? 'AYER' : niceDate(day).toUpperCase()}</b><small>${day === t ? niceDate(day) : 'Toca para volver a hoy'}</small></button>
      <button class="iconbtn" id="nuNext" aria-label="Día siguiente" ${day >= t ? 'disabled style="opacity:.3"' : ''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M9 5l7 7-7 7"/></svg></button></div>
    <div class="sect sfnsum">
      <div class="ringbox">${SF.ring(g.k ? tot.k / g.k : 0, left < 0 ? '#ef4444' : K_COL, 132, 13, `<b>${nf(Math.abs(left))}</b><small>${left < 0 ? 'kcal de más' : 'kcal quedan'}</small>`)}</div>
      <div class="eq"><div><b>${nf(g.base)}</b><small>Meta</small></div><i>+</i><div><b>${nf(g.ex)}</b><small>Ejercicio</small></div><i>−</i><div><b>${nf(tot.k)}</b><small>Comido</small></div></div>
      ${bar('Proteína', tot.p, g.t.p, P_COL)}${bar('Carbohidratos', tot.c, g.t.c, C_COL)}${bar('Grasa', tot.f, g.t.f, F_COL)}
    </div>
    <div class="sect sfbal"><h4>ENERGÍA DEL DÍA</h4>
      <div class="eq"><div><b>${nf(tot.k)}</b><small>🍽️ Comido</small></div><i>−</i><div><b>${nf(spent)}</b><small>⚡ Gastado</small></div><i>=</i><div class="${bal > 0 ? 'pos' : 'neg'}"><b>${bal > 0 ? '+' : '−'}${nf(Math.abs(bal))}</b><small>Balance</small></div></div>
      <div class="split"><span><i style="background:#71717a"></i>En reposo ${nf(b.rest)}</span><span><i style="background:#ff5a36"></i>Entrenos ${nf(b.train)}</span><span><i style="background:#38bdf8"></i>Pasos ${nf(SF.stepKcal(b.steps))}</span></div></div>
    ${MEALS.map(([k, name, ic]) => { const li = items.filter(x => x.m === k), s = sum(li);
      return `<div class="sect sfmeal"><div class="mh"><span class="ic">${ic}</span><span class="l"><b>${name.toUpperCase()}</b><small>${li.length ? nf(s.k) + ' kcal · P ' + nf(s.p) + ' · C ' + nf(s.c) + ' · G ' + nf(s.f) : 'Nada todavía'}</small></span>
        ${li.length ? `<button class="xbtn" data-mm="${k}" aria-label="Opciones">⋯</button>` : ''}<button class="smallbtn go" data-add="${k}">+ AGREGAR</button></div>
        ${li.map(x => `<button class="fi" data-fi="${x.id}"><span class="l"><b>${esc(x.n)}</b><small>${x.g ? nf(x.g) + ' g' : 'Rápido'}${x.p || x.c || x.f ? ' · P ' + n1(x.p) + ' · C ' + n1(x.c) + ' · G ' + n1(x.f) : ''}</small></span><em>${nf(x.k)}</em></button>`).join('')}</div>`; }).join('')}
    <button class="btn" id="nuCopy" style="width:100%;flex:none;margin-bottom:14px">📋 COPIAR LAS COMIDAS DE ${day === t ? 'AYER' : 'EL DÍA ANTERIOR'}</button>
    ${items.length ? '' : SFPets.says('nono', 'Anota lo que comes con <b>+ Agregar</b>: busca el alimento, dime cuánto y yo sumo calorías, proteína, carbohidratos y grasa. Hay comida de acá: arepa, bandeja, tinto, aguapanela…')}`;
  body.querySelector('#nuPrev').addEventListener('click', () => { day = addDays(day, -1); hapticTap(); render(); });
  body.querySelector('#nuNext').addEventListener('click', () => { if (day < t){ day = addDays(day, 1); hapticTap(); render(); } });
  body.querySelector('#nuToday').addEventListener('click', () => { day = t; render(); });
  body.querySelectorAll('[data-add]').forEach(x => x.addEventListener('click', () => openAdd(x.dataset.add)));
  body.querySelectorAll('[data-fi]').forEach(x => x.addEventListener('click', () => openEntry(x.dataset.fi)));
  body.querySelectorAll('[data-mm]').forEach(x => x.addEventListener('click', () => openMealMenu(x.dataset.mm)));
  body.querySelector('#nuCopy').addEventListener('click', copyPrev);
}
function renderPlan(){
  const body = $('#nutriBody'), t = targets(), gm = window.SFPlan ? SFPlan.goalCardHTML() : '';
  const tday = todayISO(), days = []; for (let i = 6; i >= 0; i--) days.push(addDays(tday, -i));
  const data = days.map(d => ({ l: WD[parseISO(d).getDay()], v: dayTotals(d).k, hi: d === tday }));
  const logged = days.filter(d => dayTotals(d).k > 0), avg = k => logged.length ? logged.reduce((a, d) => a + dayTotals(d)[k], 0) / logged.length : 0;
  const bal = logged.reduce((a, d) => a + dayTotals(d).k - (t.maint + SF.dayBurn(d).active), 0);
  body.innerHTML = `
    <div class="sect"><h4>MI META DE CADA DÍA</h4>
      <div class="sfmacs"><div style="--c:${K_COL}"><b>${nf(t.k)}</b><small>kcal</small></div><div style="--c:${P_COL}"><b>${nf(t.p)}</b><small>g proteína</small></div><div style="--c:${C_COL}"><b>${nf(t.c)}</b><small>g carbos</small></div><div style="--c:${F_COL}"><b>${nf(t.f)}</b><small>g grasa</small></div></div>
      <p class="hint">${nut.manual ? 'Metas puestas a mano.' : ({ lose: 'Bajar ' + n1(nut.rate) + ' kg por semana', gain: 'Subir ' + n1(nut.rate) + ' kg por semana', keep: 'Mantener mi peso' })[nut.goal] + ' · ' + DIETS[nut.diet][0]}. En un día normal gastas ≈${nf(t.maint)} kcal.${nut.addEx ? ' Lo que quemas entrenando se suma a tu meta.' : ''}</p>
      <button class="btn pri" id="npPlan" style="width:100%;flex:none;margin-bottom:12px;--bc:${K_COL}">🎯 CAMBIAR MI PLAN</button></div>
    ${gm}
    <div class="tiles">
      <button class="tile" style="--c:#22c55e;--i:1" id="npMenu"><span>🥗</span><b>MENÚ SUGERIDO</b><small>Un día ajustado a tu meta</small></button>
      <button class="tile" style="--c:#8b5cf6;--i:2" id="npDish"><span>🍲</span><b>MIS PLATOS</b><small>${dishes.length} guardado${dishes.length === 1 ? '' : 's'}</small></button></div>
    <div class="sect"><h4>MI SEMANA</h4>${SF.bars(data, K_COL, t.k, '')}
      <div class="sfmacs"><div style="--c:${K_COL}"><b>${nf(avg('k'))}</b><small>kcal promedio</small></div><div style="--c:${P_COL}"><b>${nf(avg('p'))}</b><small>g proteína</small></div><div style="--c:${C_COL}"><b>${nf(avg('c'))}</b><small>g carbos</small></div><div style="--c:${F_COL}"><b>${nf(avg('f'))}</b><small>g grasa</small></div></div>
      <p class="hint">${logged.length >= 3 ? `En los ${logged.length} días anotados tu balance fue de <b>${bal > 0 ? '+' : '−'}${nf(Math.abs(bal))} kcal</b>: eso equivale a ${bal > 0 ? 'subir' : 'bajar'} unos <b>${n1(Math.abs(bal) / 7700)} kg</b>.` : 'Anota al menos 3 días para ver tu balance de la semana.'}</p></div>
    ${SFPets.says(null, 'Esto es una guía para llevar la cuenta, no una dieta médica. Si tienes una condición de salud, consulta con un nutricionista.')}`;
  body.querySelector('#npPlan').addEventListener('click', openPlan);
  body.querySelector('#npMenu').addEventListener('click', openMenus);
  body.querySelector('#npDish').addEventListener('click', openDishes);
  if (window.SFPlan) SFPlan.bindGoalCard(body);
}
function openDishes(){
  openForm(`<h3 class="ftitle">🍲 MIS PLATOS</h3><p class="hint">Guarda una comida completa como plato con el botón ⋯ de cada comida en el Diario. Aquí los agregas con un toque.</p>
    ${dishes.map(d => `<div class="row"><span class="l"><b>${esc(d.n)}</b><small>${d.items.length} alimentos · ${nf(sum(d.items).k)} kcal</small></span><button class="smallbtn go" data-da="${d.id}">+ HOY</button><button class="xbtn" data-dd="${d.id}">×</button></div>`).join('') || '<p class="empty">Todavía no tienes platos guardados.</p>'}
    <button class="btn pri" id="dsOk" style="width:100%;margin-top:12px;--bc:var(--mode)">CERRAR</button>`, sh => {
    sh.querySelector('#dsOk').addEventListener('click', closeForm);
    sh.querySelectorAll('[data-da]').forEach(b => b.addEventListener('click', () => { const d = dishes.find(x => x.id === b.dataset.da); addEntries(d.items.map(x => Object.assign({}, x, { id: uid(), m: mealNow() })), todayISO()); hapticTap(); toast(TF('{s}: agregado a hoy', d.n)); }));
    sh.querySelectorAll('[data-dd]').forEach(b => b.addEventListener('click', () => { dishes = dishes.filter(d => d.id !== b.dataset.dd); save('sf_dishes', dishes); b.closest('.row').remove(); }));
  });
}
function renderWater(){
  const body = $('#nutriBody'), t = todayISO(), w = SF.water()[t] || 0, wg = SF.waterGoal(), glasses = Math.ceil(wg / 250), done = Math.floor(w / 250);
  const days = []; for (let i = 6; i >= 0; i--){ const d = addDays(t, -i); days.push({ l: WD[parseISO(d).getDay()], v: SF.water()[d] || 0, hi: d === t }); }
  const fi = fastInfo();
  body.innerHTML = `
    <div class="sect sfwaterbig"><h4>AGUA DE HOY</h4>
      <div class="ringbox">${SF.ring(w / wg, '#38bdf8', 150, 14, `<b>${n1(w / 1000)}</b><small>de ${n1(wg / 1000)} litros</small>`)}</div>
      <div class="glasses">${Array.from({ length: Math.min(glasses, 16) }, (_, i) => `<i class="${i < done ? 'on' : ''}">🥛</i>`).join('')}</div>
      <div class="btnrow"><button class="btn" data-w="-250">− VASO</button><button class="btn pri" data-w="250" style="--bc:#38bdf8">+ VASO</button><button class="btn" data-w="500">+ ½ L</button></div>
      <p class="hint">${w >= wg ? '¡Meta de agua cumplida! 💧' : 'Faltan ' + nf(wg - w) + ' ml. '}${SF.G.water ? '' : 'Tu meta sale de tu peso (35 ml por kilo); en días de entreno toma un poco más.'}</p></div>
    <div class="sect"><h4>AGUA · 7 DÍAS (ml)</h4>${SF.bars(days, '#38bdf8', wg, '')}</div>
    <div class="sect"><h4>AYUNO</h4>
      ${fi ? `<div class="sffast">${SF.ring(fi.el / fi.hours, '#8b5cf6', 150, 14, `<b>${Math.floor(fi.el)}:${pad2(Math.floor(fi.el % 1 * 60))}</b><small>de ${fi.hours} h</small>`)}</div>` : '<p class="hint">Ventana sin comer. La más usada es 16 horas de ayuno y 8 para comer. Es opcional.</p>'}
      <button class="btn ${fi ? '' : 'pri'}" id="nwFast" style="width:100%;flex:none;margin-bottom:12px;--bc:#8b5cf6">${fi ? 'VER O TERMINAR EL AYUNO' : '⏳ EMPEZAR UN AYUNO'}</button></div>`;
  body.querySelectorAll('[data-w]').forEach(b => b.addEventListener('click', () => { SF.addWater(+b.dataset.w, t); keepY(render); }));
  body.querySelector('#nwFast').addEventListener('click', openFast);
}
const keepY = fn => { const v = $('#nutri'), y = v.scrollTop; fn(); v.scrollTop = y; };
function addEntries(list, ds){ ds = ds || day; log[ds] = (log[ds] || []).concat(list); saveLog(); SF.checkMedals(); }

/* ---------- Agregar comida ---------- */
function recents(){
  const seen = new Set(), out = [];
  Object.keys(log).sort().reverse().slice(0, 30).forEach(d => log[d].slice().reverse().forEach(x => { if (x.g && !seen.has(x.n) && foodByName(x.n)){ seen.add(x.n); out.push({ f: foodByName(x.n), g: x.g }); } }));
  return out.slice(0, 20);
}
function openAdd(meal, keepTab){
  let tabk = keepTab || (recents().length ? 'rec' : 'all'), q = '', grp = '';
  openForm(`<h3 class="ftitle">+ ${MEALS.find(m => m[0] === meal)[1].toUpperCase()}</h3>
    <input class="search" id="faQ" placeholder="Buscar: arepa, pollo, banano…" autocomplete="off">
    <div class="seg" id="faT"><button type="button" data-t="rec">RECIENTES</button><button type="button" data-t="all">TODOS</button><button type="button" data-t="dish">MIS PLATOS</button></div>
    <div class="sfchips" id="faG" style="display:none"><button type="button" data-g="" class="on">Todo</button>${Object.entries(D.FOOD_GROUPS).map(([k, v]) => `<button type="button" data-g="${k}">${v[1]} ${v[0]}</button>`).join('')}<button type="button" data-g="mio">⭐ Míos</button></div>
    <div id="faL" class="sfpick"></div>
    <div class="btnrow sfsmallbtns" style="margin-top:10px"><button class="btn" id="faQuick">⚡ RÁPIDO</button><button class="btn" id="faNew">+ CREAR</button><button class="btn pri" id="faOk" style="--bc:var(--mode)">LISTO</button></div>`, sh => {
    const row = (f, g) => `<button type="button" data-f="${esc(f[0])}" data-g0="${g || ''}"><i style="background:${f[7] === 'mio' ? '#f59e0b' : '#22c55e'}"></i><span class="l"><b>${esc(f[0])}</b><small>${g ? nf(g) + ' g' : '1 ' + esc(f[5]) + ' (' + nf(f[6]) + ' g)'} · ${nf(f[1] * (g || f[6]) / 100)} kcal</small></span><em>+</em></button>`;
    const draw = () => {
      sh.querySelectorAll('#faT [data-t]').forEach(b => b.classList.toggle('on', b.dataset.t === tabk));
      sh.querySelector('#faG').style.display = tabk === 'all' && !q ? '' : 'none';
      const el = sh.querySelector('#faL');
      if (q){
        const nq = norm(q), list = FOODS().filter(f => norm(f[0]).includes(nq)).sort((a, b) => (norm(a[0]).startsWith(nq) ? 0 : 1) - (norm(b[0]).startsWith(nq) ? 0 : 1)).slice(0, 40);
        el.innerHTML = list.map(f => row(f)).join('') || `<p class="empty">No está “${esc(q)}”. Créalo con <b>+ Crear</b> o usa <b>Rápido</b> para poner solo las calorías.</p>`;
      } else if (tabk === 'rec'){ const r = recents(); el.innerHTML = r.map(x => row(x.f, x.g)).join('') || '<p class="empty">Aquí saldrá lo que más comes para agregarlo con un toque.</p>'; }
      else if (tabk === 'dish'){ el.innerHTML = dishes.map(d => { const s = sum(d.items); return `<button type="button" data-dish="${d.id}"><i style="background:#8b5cf6"></i><span class="l"><b>${esc(d.n)}</b><small>${d.items.length} alimentos · ${nf(s.k)} kcal</small></span><em>+</em></button>`; }).join('') || '<p class="empty">Guarda una comida completa como plato (botón ⋯ de cada comida) y agrégala aquí con un toque.</p>'; }
      else el.innerHTML = FOODS().filter(f => !grp || f[7] === grp).slice(0, grp ? 200 : 60).map(f => row(f)).join('') || '<p class="empty">Aún no has creado alimentos.</p>';
      el.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => openPortion(foodByName(b.dataset.f), meal, +b.dataset.g0 || 0, tabk)));
      el.querySelectorAll('[data-dish]').forEach(b => b.addEventListener('click', () => { const d = dishes.find(x => x.id === b.dataset.dish); addEntries(d.items.map(x => Object.assign({}, x, { id: uid(), m: meal }))); hapticTap(); toast(TF('{s}: agregado', d.n)); b.classList.add('added'); b.querySelector('em').textContent = '✓'; }));
    };
    sh.querySelector('#faQ').addEventListener('input', e => { q = e.target.value.trim(); draw(); });
    sh.querySelectorAll('#faT [data-t]').forEach(b => b.addEventListener('click', () => { tabk = b.dataset.t; draw(); }));
    sh.querySelectorAll('#faG [data-g]').forEach(b => b.addEventListener('click', () => { grp = b.dataset.g; sh.querySelectorAll('#faG [data-g]').forEach(x => x.classList.toggle('on', x === b)); draw(); }));
    sh.querySelector('#faOk').addEventListener('click', closeForm);
    sh.querySelector('#faQuick').addEventListener('click', () => openQuick(meal));
    sh.querySelector('#faNew').addEventListener('click', () => openNewFood(sh.querySelector('#faQ').value.trim(), meal));
    draw();
  });
}
function openPortion(f, meal, g0, backTab, editId){
  const st = { g: g0 || f[6], n: g0 ? +(g0 / f[6]).toFixed(2) : 1, meal };
  openForm(`<h3 class="ftitle">${esc(f[0].toUpperCase())}</h3>
    <p class="hint">Por 100 g: ${nf(f[1])} kcal · proteína ${n1(f[2])} g · carbohidratos ${n1(f[3])} g · grasa ${n1(f[4])} g</p>
    <div class="frow"><div class="field"><span>Porciones (${esc(f[5])})</span><div class="stepper" id="poN"></div></div><div class="field"><span>Gramos</span><div class="stepper" id="poG"></div></div></div>
    <div class="sfmacs"><div style="--c:${K_COL}"><b id="poK">0</b><small>kcal</small></div><div style="--c:${P_COL}"><b id="poP">0</b><small>proteína</small></div><div style="--c:${C_COL}"><b id="poC">0</b><small>carbos</small></div><div style="--c:${F_COL}"><b id="poF">0</b><small>grasa</small></div></div>
    <div class="field"><span>Comida</span><div class="typechips">${MEALS.map(m => `<button type="button" data-m="${m[0]}" style="--c:var(--mode)" class="${m[0] === meal ? 'on' : ''}">${m[2]} ${m[1]}</button>`).join('')}</div></div>
    <div class="btnrow">${editId ? '<button class="btn" id="poDel" style="color:#f87171">QUITAR</button>' : '<button class="btn" id="poBack">VOLVER</button>'}<button class="btn pri" id="poOk" style="--bc:${K_COL}">${editId ? 'GUARDAR' : 'AGREGAR'}</button></div>`, sh => {
    const paint = () => { const e = mk(f, st.g, st.meal); sh.querySelector('#poK').textContent = nf(e.k); sh.querySelector('#poP').textContent = n1(e.p); sh.querySelector('#poC').textContent = n1(e.c); sh.querySelector('#poF').textContent = n1(e.f); };
    const sN = sh.querySelector('#poN'), sG = sh.querySelector('#poG');
    makeStepper(sN, { get: () => st.n, set: v => { st.n = Math.round(v * 4) / 4; st.g = Math.round(st.n * f[6]); }, min: 0.25, max: 30, step: 0.25, input: true, fmt: v => n1(Math.round(v * 100) / 100), label: 'Porciones', onChange: () => { sG._paint(); paint(); } });
    makeStepper(sG, { get: () => st.g, set: v => { st.g = Math.round(v); st.n = +(st.g / f[6]).toFixed(2); }, min: 1, max: 3000, step: v => v < 100 ? 5 : 10, input: true, label: 'Gramos', onChange: () => { sN._paint(); paint(); } });
    sh.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { st.meal = b.dataset.m; sh.querySelectorAll('[data-m]').forEach(x => x.classList.toggle('on', x === b)); }));
    paint();
    const bk = sh.querySelector('#poBack'); if (bk) bk.addEventListener('click', () => openAdd(meal, backTab));
    const dl = sh.querySelector('#poDel'); if (dl) dl.addEventListener('click', () => { log[day] = (log[day] || []).filter(x => x.id !== editId); if (!log[day].length) delete log[day]; saveLog(); closeForm(); });
    sh.querySelector('#poOk').addEventListener('click', () => {
      sh.querySelectorAll('input').forEach(i => i.blur());
      const e = mk(f, st.g, st.meal);
      if (editId){ const i = (log[day] || []).findIndex(x => x.id === editId); if (i >= 0){ e.id = editId; log[day][i] = e; saveLog(); } closeForm(); return; }
      addEntries([e]); hapticTap(); toast(TT(f[0]) + ': ' + nf(e.k) + ' kcal'); openAdd(meal, backTab);
    });
  });
}
function openEntry(id){
  const x = (log[day] || []).find(e => e.id === id); if (!x) return;
  const f = x.g ? foodByName(x.n) : null;
  if (f) return openPortion(f, x.m, x.g, null, id);
  openQuick(x.m, x);
}
function openQuick(meal, edit){
  const v = edit ? Object.assign({}, edit) : { n: '', k: 200, p: 0, c: 0, f: 0 };
  openForm(`<h3 class="ftitle">⚡ AGREGAR RÁPIDO</h3><p class="hint">Para cuando solo sabes las calorías (por ejemplo, de la etiqueta). Los macros son opcionales.</p>
    <label class="field"><span>¿Qué fue?</span><input id="fqN" maxlength="40" value="${esc(v.n)}" placeholder="Ej: Almuerzo en restaurante"></label>
    <div class="field"><span>Calorías</span><div class="stepper big" id="fqK"></div></div>
    <div class="frow"><div class="field"><span>Proteína g</span><div class="stepper sm" id="fqP"></div></div><div class="field"><span>Carbos g</span><div class="stepper sm" id="fqC"></div></div><div class="field"><span>Grasa g</span><div class="stepper sm" id="fqF"></div></div></div>
    <div class="btnrow">${edit ? '<button class="btn" id="fqDel" style="color:#f87171">QUITAR</button>' : '<button class="btn" id="fqBack">VOLVER</button>'}<button class="btn pri" id="fqOk" style="--bc:${K_COL}">${edit ? 'GUARDAR' : 'AGREGAR'}</button></div>`, sh => {
    makeStepper(sh.querySelector('#fqK'), { get: () => v.k, set: x => v.k = Math.round(x), min: 0, max: 5000, step: 10, input: true, label: 'Calorías' });
    [['#fqP', 'p'], ['#fqC', 'c'], ['#fqF', 'f']].forEach(([s, k]) => makeStepper(sh.querySelector(s), { get: () => v[k], set: x => v[k] = Math.round(x), min: 0, max: 500, input: true, label: k }));
    const bk = sh.querySelector('#fqBack'); if (bk) bk.addEventListener('click', () => openAdd(meal));
    const dl = sh.querySelector('#fqDel'); if (dl) dl.addEventListener('click', () => { log[day] = (log[day] || []).filter(x => x.id !== edit.id); if (!log[day].length) delete log[day]; saveLog(); closeForm(); });
    sh.querySelector('#fqOk').addEventListener('click', () => {
      sh.querySelectorAll('input').forEach(i => i.blur());
      const e = { id: edit ? edit.id : uid(), m: meal, n: sh.querySelector('#fqN').value.trim() || 'Comida', g: 0, k: v.k, p: v.p, c: v.c, f: v.f };
      if (edit){ const i = log[day].findIndex(x => x.id === edit.id); log[day][i] = e; saveLog(); } else addEntries([e]);
      closeForm(); toast(TT(e.n) + ': ' + nf(e.k) + ' kcal');
    });
  });
}
function openNewFood(name, meal){
  const v = { k: 100, p: 0, c: 0, f: 0, ug: 100 };
  openForm(`<h3 class="ftitle">CREAR ALIMENTO</h3><p class="hint">Copia los datos de la etiqueta. Queda guardado en ⭐ Míos para usarlo siempre.</p>
    <label class="field"><span>Nombre</span><input id="nfN" maxlength="40" value="${esc(name)}" placeholder="Ej: Yogur de la tienda"></label>
    <div class="field"><span>Calorías por 100 g (o 100 ml)</span><div class="stepper" id="nfK"></div></div>
    <div class="frow"><div class="field"><span>Proteína g</span><div class="stepper sm" id="nfP"></div></div><div class="field"><span>Carbos g</span><div class="stepper sm" id="nfC"></div></div><div class="field"><span>Grasa g</span><div class="stepper sm" id="nfF"></div></div></div>
    <div class="frow"><label class="field"><span>Nombre de la porción</span><input id="nfU" maxlength="16" value="porción"></label><div class="field"><span>Gramos de la porción</span><div class="stepper sm" id="nfUG"></div></div></div>
    <div class="btnrow"><button class="btn" id="nfBack">VOLVER</button><button class="btn pri" id="nfOk" style="--bc:#f59e0b">CREAR</button></div>`, sh => {
    makeStepper(sh.querySelector('#nfK'), { get: () => v.k, set: x => v.k = Math.round(x), min: 0, max: 900, step: 5, input: true, label: 'Calorías' });
    [['#nfP', 'p'], ['#nfC', 'c'], ['#nfF', 'f']].forEach(([s, k]) => makeStepper(sh.querySelector(s), { get: () => v[k], set: x => v[k] = Math.round(x * 10) / 10, min: 0, max: 100, input: true, label: k }));
    makeStepper(sh.querySelector('#nfUG'), { get: () => v.ug, set: x => v.ug = Math.round(x), min: 1, max: 2000, step: 5, input: true, label: 'Gramos' });
    sh.querySelector('#nfBack').addEventListener('click', () => openAdd(meal));
    sh.querySelector('#nfOk').addEventListener('click', () => {
      sh.querySelectorAll('input').forEach(i => i.blur());
      const n = sh.querySelector('#nfN').value.trim(); if (!n) return toast('Ponle un nombre');
      if (foodByName(n)) return toast('Ya hay un alimento con ese nombre');
      const f = [n, v.k, v.p, v.c, v.f, sh.querySelector('#nfU').value.trim() || 'porción', v.ug, 'mio'];
      custom.push(f); save('sf_foodx', custom); toast('Alimento creado'); openPortion(f, meal, 0, 'all');
    });
  });
}
function openMealMenu(k){
  const name = MEALS.find(m => m[0] === k)[1], li = (log[day] || []).filter(x => x.m === k);
  openForm(`<h3 class="ftitle">${name.toUpperCase()}</h3><p class="hint">${li.length} alimentos · ${nf(sum(li).k)} kcal</p>
    <label class="field"><span>Guardar como plato (para repetirlo con un toque)</span><input id="mmN" maxlength="30" placeholder="Ej: Mi desayuno de siempre"></label>
    <div class="btnrow"><button class="btn" id="mmClr" style="color:#f87171">VACIAR</button><button class="btn pri" id="mmSave" style="--bc:#8b5cf6">GUARDAR PLATO</button></div>
    ${dishes.length ? `<h4 class="mini" style="margin-top:14px">MIS PLATOS</h4>${dishes.map(d => `<div class="row"><span class="l"><b>${esc(d.n)}</b><small>${nf(sum(d.items).k)} kcal</small></span><button class="xbtn" data-dd="${d.id}">×</button></div>`).join('')}` : ''}`, sh => {
    sh.querySelector('#mmSave').addEventListener('click', () => { const n = sh.querySelector('#mmN').value.trim(); if (!n) return toast('Ponle un nombre al plato'); dishes.push({ id: uid(), n, items: li.map(x => ({ n: x.n, g: x.g, k: x.k, p: x.p, c: x.c, f: x.f })) }); save('sf_dishes', dishes); closeForm(); toast('Plato guardado'); });
    sh.querySelector('#mmClr').addEventListener('click', async () => { closeForm(); if (await confirmDlg('¿Vaciar ' + name.toLowerCase() + '?', 'Se quitan los alimentos de esta comida.', 'VACIAR')){ log[day] = log[day].filter(x => x.m !== k); if (!log[day].length) delete log[day]; saveLog(); render(); } });
    sh.querySelectorAll('[data-dd]').forEach(b => b.addEventListener('click', () => { dishes = dishes.filter(d => d.id !== b.dataset.dd); save('sf_dishes', dishes); b.closest('.row').remove(); }));
  });
}
async function copyPrev(){
  const prev = addDays(day, -1), src = log[prev] || [];
  if (!src.length) return toast('Ese día no tiene comidas anotadas');
  if (!await confirmDlg('¿Copiar comidas?', `Se agregan los ${src.length} alimentos de ${niceDate(prev).toLowerCase()} a ${day === todayISO() ? 'hoy' : 'este día'}.`, 'COPIAR')) return;
  addEntries(src.map(x => Object.assign({}, x, { id: uid() }))); render(); toast('Comidas copiadas');
}

/* ---------- Mi plan ---------- */
function openPlan(){
  const N = Object.assign({}, nut);
  openForm(`<h3 class="ftitle">🎯 MI PLAN DE COMIDA</h3>
    <div class="field"><span>Mi objetivo</span><div class="seg" id="plG"><button type="button" data-g="lose">BAJAR</button><button type="button" data-g="keep">MANTENER</button><button type="button" data-g="gain">SUBIR</button></div></div>
    <div class="field" id="plRw"><span>Ritmo por semana</span><div class="seg" id="plR"><button type="button" data-r="0.25">¼ KG</button><button type="button" data-r="0.5">½ KG</button><button type="button" data-r="0.75">¾ KG</button><button type="button" data-r="1">1 KG</button></div></div>
    <div class="field"><span>Mi día a día (sin contar los entrenos)</span><div class="seg" id="plL"><button type="button" data-l="1.2">SENTADO</button><button type="button" data-l="1.375">ALGO ACTIVO</button><button type="button" data-l="1.55">MUY ACTIVO</button></div></div>
    <div class="field"><span>Tipo de alimentación</span><div class="typechips" id="plD">${Object.entries(DIETS).map(([k, v]) => `<button type="button" data-d="${k}" style="--c:${K_COL}">${v[0]}</button>`).join('')}</div><p class="hint" id="plDd" style="padding-top:6px"></p></div>
    <div class="row"><div class="l"><b>Sumar lo que quemo entrenando</b><small>Los días que entrenas puedes comer un poco más</small></div><button class="switch" id="plEx"></button></div>
    <div class="row"><div class="l"><b>Poner mis metas a mano</b><small>Si un nutricionista ya te las dio</small></div><button class="switch" id="plMan"></button></div>
    <div id="plManBox"></div>
    <div class="sfplanres" id="plRes"></div>
    <div class="btnrow"><button class="btn" id="plC">CANCELAR</button><button class="btn pri" id="plOk" style="--bc:${K_COL}">GUARDAR</button></div>`, sh => {
    const paint = () => {
      sh.querySelectorAll('#plG [data-g]').forEach(b => b.classList.toggle('on', b.dataset.g === N.goal));
      sh.querySelectorAll('#plR [data-r]').forEach(b => b.classList.toggle('on', +b.dataset.r === N.rate));
      sh.querySelectorAll('#plL [data-l]').forEach(b => b.classList.toggle('on', +b.dataset.l === N.life));
      sh.querySelectorAll('#plD [data-d]').forEach(b => b.classList.toggle('on', b.dataset.d === N.diet));
      sh.querySelector('#plDd').textContent = DIETS[N.diet][1] + (N.diet === 'keto' ? '. Es exigente: mejor con acompañamiento profesional.' : '');
      sh.querySelector('#plRw').style.display = N.goal === 'keep' || N.manual ? 'none' : '';
      sh.querySelector('#plEx').classList.toggle('on', !!N.addEx); sh.querySelector('#plMan').classList.toggle('on', !!N.manual);
      const keep = nut; nut = N; const t = targets(); nut = keep;
      const miss = SF.profileMissing(), lw = lastWeight();
      let eta = '';
      if (!N.manual && N.goal !== 'keep' && wGoal && lw && ((N.goal === 'lose' && wGoal < lw.kg) || (N.goal === 'gain' && wGoal > lw.kg))){ const wk = Math.abs(lw.kg - wGoal) / N.rate; eta = `<p>A este ritmo llegas a tu meta de <b>${fmtKg(wGoal)} kg</b> en unas <b>${Math.ceil(wk)} semanas</b>.</p>`; }
      sh.querySelector('#plRes').innerHTML = `<div class="sfmacs"><div style="--c:${K_COL}"><b>${nf(t.k)}</b><small>kcal al día</small></div><div style="--c:${P_COL}"><b>${nf(t.p)}</b><small>g proteína</small></div><div style="--c:${C_COL}"><b>${nf(t.c)}</b><small>g carbos</small></div><div style="--c:${F_COL}"><b>${nf(t.f)}</b><small>g grasa</small></div></div>
        <p>Tu cuerpo gasta unas <b>${nf(t.maint)} kcal</b> en un día normal sin entrenar.</p>${eta}
        ${t.capped ? '<p class="warn">⚠️ Ese ritmo te dejaría por debajo del mínimo seguro; ajusté las calorías al mínimo. Baja más despacio o habla con un profesional.</p>' : ''}
        ${N.goal === 'lose' && N.rate >= 1 ? '<p class="warn">⚠️ Bajar 1 kg por semana es muy rápido: se pierde músculo y fuerza. Para dar el peso de una pelea, hazlo con tu entrenador.</p>' : ''}
        ${miss.length ? `<p class="warn">Falta en tu perfil: ${miss.join(', ')}. Por ahora uso valores promedio.</p>` : ''}`;
      const mb = sh.querySelector('#plManBox');
      if (N.manual && !mb.innerHTML){
        mb.innerHTML = `<div class="field"><span>Calorías al día</span><div class="stepper" id="pmK"></div></div><div class="frow"><div class="field"><span>Proteína g</span><div class="stepper sm" id="pmP"></div></div><div class="field"><span>Carbos g</span><div class="stepper sm" id="pmC"></div></div><div class="field"><span>Grasa g</span><div class="stepper sm" id="pmF"></div></div></div>`;
        makeStepper(mb.querySelector('#pmK'), { get: () => N.kcal, set: x => N.kcal = Math.round(x), min: 800, max: 6000, step: 50, input: true, label: 'Calorías', onChange: paint });
        [['#pmP', 'p'], ['#pmC', 'c'], ['#pmF', 'f']].forEach(([s, k]) => makeStepper(mb.querySelector(s), { get: () => N[k], set: x => N[k] = Math.round(x), min: 0, max: 800, step: 5, input: true, label: k, onChange: paint }));
      } else if (!N.manual) mb.innerHTML = '';
    };
    sh.querySelectorAll('#plG [data-g]').forEach(b => b.addEventListener('click', () => { N.goal = b.dataset.g; paint(); }));
    sh.querySelectorAll('#plR [data-r]').forEach(b => b.addEventListener('click', () => { N.rate = +b.dataset.r; paint(); }));
    sh.querySelectorAll('#plL [data-l]').forEach(b => b.addEventListener('click', () => { N.life = +b.dataset.l; paint(); }));
    sh.querySelectorAll('#plD [data-d]').forEach(b => b.addEventListener('click', () => { N.diet = b.dataset.d; paint(); }));
    sh.querySelector('#plEx').addEventListener('click', () => { N.addEx = !N.addEx; paint(); });
    sh.querySelector('#plMan').addEventListener('click', () => { N.manual = !N.manual; if (N.manual){ const k = nut; nut = Object.assign({}, N, { manual: false }); const t = targets(); nut = k; if (!load('sf_nut', {}).manual){ N.kcal = t.k; N.p = t.p; N.c = t.c; N.f = t.f; } } paint(); });
    paint();
    sh.querySelector('#plC').addEventListener('click', closeForm);
    sh.querySelector('#plOk').addEventListener('click', () => { sh.querySelectorAll('input').forEach(i => i.blur()); nut = N; saveNut(); closeForm(); toast('Plan guardado'); if (current === 'home') SFToday.render(); });
  });
}

/* ---------- Menú sugerido ---------- */
function openMenus(){
  const t = targets(), type = nut.diet === 'keto' ? 'lc' : nut.diet;
  const list = D.MENUS.filter(m => m.type === type).concat(D.MENUS.filter(m => m.type !== type));
  let sel = list[0].id;
  openForm(`<h3 class="ftitle">🥗 MENÚ SUGERIDO</h3><p class="hint">Un día de ejemplo con comida de acá, con las cantidades ajustadas a tu meta de <b>${nf(t.k)} kcal</b>. Cámbialo a tu gusto: es una guía, no una dieta médica.</p>
    <div class="sfchips" id="meS">${list.map(m => `<button type="button" data-m="${m.id}">${esc(m.n)}</button>`).join('')}</div><div id="meB"></div>
    <div class="btnrow" style="margin-top:10px"><button class="btn" id="meC">CERRAR</button><button class="btn pri" id="meAll" style="--bc:${K_COL}">ANOTAR TODO EN ${day === todayISO() ? 'HOY' : 'ESTE DÍA'}</button></div>`, sh => {
    const build = () => {
      const m = D.MENUS.find(x => x.id === sel), raw = {};
      let base = 0; MEALS.forEach(([k]) => { raw[k] = (m.meals[k] || []).map(([n, g]) => ({ f: foodByName(n), g })).filter(x => x.f); raw[k].forEach(x => base += x.f[1] * x.g / 100); });
      const sc = clamp(t.k / base, 0.6, 1.7), out = {};
      MEALS.forEach(([k]) => out[k] = raw[k].map(x => mk(x.f, Math.max(5, Math.round(x.g * sc / 5) * 5), k)));
      return out;
    };
    let cur = build();
    const draw = () => {
      sh.querySelectorAll('#meS [data-m]').forEach(b => b.classList.toggle('on', b.dataset.m === sel));
      cur = build(); const all = sum(Object.values(cur).flat());
      sh.querySelector('#meB').innerHTML = `<div class="sfmacs"><div style="--c:${K_COL}"><b>${nf(all.k)}</b><small>kcal</small></div><div style="--c:${P_COL}"><b>${nf(all.p)}</b><small>proteína</small></div><div style="--c:${C_COL}"><b>${nf(all.c)}</b><small>carbos</small></div><div style="--c:${F_COL}"><b>${nf(all.f)}</b><small>grasa</small></div></div>`
        + MEALS.filter(([k]) => cur[k].length).map(([k, n, ic]) => `<div class="sfmenu"><div class="mh"><b>${ic} ${n}</b><small>${nf(sum(cur[k]).k)} kcal</small><button class="smallbtn" data-am="${k}">+ ANOTAR</button></div>${cur[k].map(x => `<p>${esc(x.n)} <small>${nf(x.g)} g · ${nf(x.k)} kcal</small></p>`).join('')}</div>`).join('');
      sh.querySelectorAll('[data-am]').forEach(b => b.addEventListener('click', () => { addEntries(cur[b.dataset.am]); hapticTap(); b.textContent = '✓ ANOTADO'; b.disabled = true; }));
    };
    sh.querySelectorAll('#meS [data-m]').forEach(b => b.addEventListener('click', () => { sel = b.dataset.m; draw(); }));
    sh.querySelector('#meC').addEventListener('click', closeForm);
    sh.querySelector('#meAll').addEventListener('click', () => { addEntries(Object.values(cur).flat()); closeForm(); toast('Menú anotado'); });
    draw();
  });
}

/* ---------- Ayuno ---------- */
function openFast(){
  const hrs = fast ? fast.hours : (S.fastHours || 16);
  const st = { h: hrs };
  const body = () => { if (!fast) return `<p class="hint">Ventana sin comer. La más usada es 16 horas de ayuno y 8 para comer. El agua, el tinto y el té sin azúcar no lo rompen.</p><div class="field"><span>Horas de ayuno</span><div class="seg" id="fsH">${[12, 14, 16, 18, 20].map(h => `<button type="button" data-h="${h}" class="${h === st.h ? 'on' : ''}">${h} H</button>`).join('')}</div></div>`;
    const el = (Date.now() - fast.start) / 3600000, pct = el / fast.hours, end = new Date(fast.start + fast.hours * 3600000);
    return `<div class="sffast">${SF.ring(pct, '#8b5cf6', 150, 14, `<b>${Math.floor(el)}:${pad2(Math.floor(el % 1 * 60))}</b><small>de ${fast.hours} h</small>`)}</div><p class="hint" style="text-align:center">${pct >= 1 ? '¡Ayuno cumplido! Rompe el ayuno con algo liviano.' : 'Termina ' + (iso(end) === todayISO() ? 'hoy' : 'mañana') + ' a las ' + pad2(end.getHours()) + ':' + pad2(end.getMinutes())}</p>`; };
  openForm(`<h3 class="ftitle">⏳ AYUNO</h3><div id="fsB">${body()}</div>
    <p class="hint">No es para todo el mundo: si tienes diabetes, estás embarazada o eres menor de edad, consulta primero.</p>
    <div class="btnrow"><button class="btn" id="fsC">CERRAR</button><button class="btn pri" id="fsGo" style="--bc:#8b5cf6">${fast ? 'TERMINAR AYUNO' : 'EMPEZAR AYUNO'}</button></div>`, sh => {
    sh.querySelectorAll('#fsH [data-h]').forEach(b => b.addEventListener('click', () => { st.h = +b.dataset.h; sh.querySelectorAll('#fsH [data-h]').forEach(x => x.classList.toggle('on', x === b)); }));
    sh.querySelector('#fsC').addEventListener('click', closeForm);
    sh.querySelector('#fsGo').addEventListener('click', () => {
      if (fast){ const el = (Date.now() - fast.start) / 3600000; toast(el >= fast.hours ? `¡Ayuno de ${fast.hours} h cumplido! 💪` : `Ayuno terminado a las ${n1(el)} h`); if (el >= fast.hours) confetti('#8b5cf6'); fast = null; }
      else { fast = { start: Date.now(), hours: st.h }; S.fastHours = st.h; saveSettings(); toast('Ayuno en marcha'); }
      save('sf_fast', fast); closeForm(); if (window.SFRemind) SFRemind.sync();
    });
  });
}
const fastInfo = () => fast ? { el: (Date.now() - fast.start) / 3600000, hours: fast.hours } : null;

/* ---------- Mi semana ---------- */
function openWeek(){
  const t = todayISO(), days = []; for (let i = 6; i >= 0; i--) days.push(addDays(t, -i));
  const tg = targets(), data = days.map(d => ({ l: WD[parseISO(d).getDay()], v: dayTotals(d).k, hi: d === day }));
  const logged = days.filter(d => dayTotals(d).k > 0), avg = k => logged.length ? logged.reduce((a, d) => a + dayTotals(d)[k], 0) / logged.length : 0;
  const bal = logged.reduce((a, d) => a + dayTotals(d).k - (tg.maint + SF.dayBurn(d).active), 0);
  openForm(`<h3 class="ftitle">📊 MI SEMANA</h3><p class="hint">Calorías comidas en los últimos 7 días. La línea es tu meta base.</p>
    ${SF.bars(data, K_COL, tg.k, '')}
    <div class="sfmacs" style="margin-top:12px"><div style="--c:${K_COL}"><b>${nf(avg('k'))}</b><small>kcal promedio</small></div><div style="--c:${P_COL}"><b>${nf(avg('p'))}</b><small>g proteína</small></div><div style="--c:${C_COL}"><b>${nf(avg('c'))}</b><small>g carbos</small></div><div style="--c:${F_COL}"><b>${nf(avg('f'))}</b><small>g grasa</small></div></div>
    ${logged.length >= 3 ? `<p class="hint" style="padding-top:10px">En los ${logged.length} días anotados tu balance fue de <b>${bal > 0 ? '+' : '−'}${nf(Math.abs(bal))} kcal</b> frente a lo que gastaste: eso equivale a ${bal > 0 ? 'subir' : 'bajar'} unos <b>${n1(Math.abs(bal) / 7700)} kg</b>.</p>` : '<p class="hint" style="padding-top:10px">Anota al menos 3 días para ver tu balance de la semana.</p>'}
    <button class="btn pri" id="wkOk" style="width:100%;--bc:var(--mode)">CERRAR</button>`, sh => sh.querySelector('#wkOk').addEventListener('click', closeForm));
}

const _cf = closeForm;
closeForm = function(){ _cf(); if (current === 'nutri') keepY(render); };
Object.assign(GUIDE, {
  nutri: () => ({ t:'tu comida', b:[`<p>Lleva la cuenta de lo que comes. Arriba ves cuánto te <b>queda</b> hoy: tu meta, más lo que quemaste entrenando, menos lo que has comido.</p>`,
    `<ul><li><b>+ Agregar:</b> busca el alimento y di cuánto (porciones o gramos).</li><li><b>Rápido:</b> pon solo las calorías cuando no encuentres algo.</li><li><b>Mi plan:</b> bajar, mantener o subir, y el tipo de alimentación.</li><li><b>Menú sugerido:</b> un día completo ajustado a tu meta.</li><li><b>Agua:</b> suma cada vaso; la meta sale de tu peso.</li></ul>`,
    `<p class="tip">Guarda tus comidas de siempre como <b>plato</b> (botón ⋯) y agrégalas con un toque.</p>`] }),
});

window.SFNutri = { setPlan: (g, r) => { nut.goal = g; nut.rate = r; nut.manual = false; saveNut(); }, dayTotals, targets, dayGoal, openPlan, openAdd: m => { day = todayISO(); openAdd(m || mealNow()); }, fastInfo, openFast, MEALS, nut: () => nut, setDay: d => day = d };
function mealNow(){ const h = new Date().getHours(); return h < 10 ? 'des' : h < 12 ? 'mm' : h < 15 ? 'alm' : h < 18 ? 'alg' : 'cen'; }
})();
