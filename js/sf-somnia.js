/* =========================================================
   SATRONHO BOXFIT · CRUCE CON SATRONHO SOMNIA
   BoxFit recibe tu sueño (horas, fases y puntaje) y Somnia recibe
   tus entrenos, para ver cómo se afectan entre sí.
   ---------------------------------------------------------
   Dos caminos, los dos sin internet:
   1. Un toque: BoxFit abre Somnia con el enlace satronhosomnia://cruce,
      Somnia guarda tus entrenos y responde con satronhoboxfit://cruce.
   2. Por archivo (como el «modo dos teléfonos» de Somnia): cada app
      comparte un .json y la otra lo abre.
   Formato que llega de Somnia: { app:'satronho-somnia', kind:'sueno', v:1,
     need (horas), nights:[{ w: fecha en que despertaste, s, e, a: min dormido,
     ef: eficiencia %, dp: profundo, rm: REM, sc: puntaje, sn: % ronquido }] }
   ========================================================= */
(function(){
const { nf, n1, hm } = SF;
let sl = load('sf_sleep', null);          // { at, need, name, nights: { fecha: {...} } }
const has = () => !!(sl && sl.nights && Object.keys(sl.nights).length);
const b64e = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64d = s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));

/* ---------- Lo que BoxFit le manda a Somnia ---------- */
function pack(){
  const t = todayISO(), from = addDays(t, -60), days = {};
  sessLog.filter(h => h.d >= from).forEach(h => { const d = days[h.d] || (days[h.d] = { d: h.d, min: 0, kcal: 0, end: 0, n: 0 }); d.min += SF.minOf(h); d.kcal += SF.kcalOf(h); d.n++; if (h.ts && iso(new Date(h.ts)) === h.d) d.end = Math.max(d.end, h.ts); });
  return { app: 'satronho-boxfit', kind: 'entrenos', v: 1, name: me.name || '', days: Object.values(days) };
}

/* ---------- Lo que llega de Somnia ---------- */
function importPack(p){
  if (!p || p.app !== 'satronho-somnia' || p.kind !== 'sueno' || !Array.isArray(p.nights)) return false;
  sl = sl && sl.nights ? sl : { nights: {} };
  p.nights.forEach(n => { if (n && n.w && n.a > 0) sl.nights[n.w] = { a: Math.round(n.a), ef: n.ef || null, dp: n.dp || 0, rm: n.rm || 0, sc: n.sc == null ? null : Math.round(n.sc), sn: n.sn == null ? null : n.sn, s: n.s || 0, e: n.e || 0 }; });
  const keys = Object.keys(sl.nights).sort(); keys.slice(0, Math.max(0, keys.length - 200)).forEach(k => delete sl.nights[k]);
  sl.at = Date.now(); sl.need = p.need || sl.need || 8; sl.name = p.name || '';
  save('sf_sleep', sl); SF.checkMedals();
  return p.nights.length;
}
const night = ds => has() ? sl.nights[ds] : null;

/* Recuperación de hoy: 60 % cómo dormiste anoche, 25 % las horas frente a lo que necesitas (3 noches), 15 % qué tan duro entrenaste ayer */
function readiness(){
  const t = todayISO(), n = night(t); if (!n) return null;
  const need = (sl.need || 8) * 60;
  const last3 = [0, 1, 2].map(i => night(addDays(t, -i))).filter(Boolean), avg3 = last3.reduce((a, x) => a + x.a, 0) / last3.length;
  const q = n.sc != null ? n.sc / 100 : clamp(n.a / need, 0, 1);
  const load = clamp(SF.dayBurn(addDays(t, -1)).train / Math.max(200, SF.G.kcal * 2), 0, 1);
  const v = Math.round((q * 0.6 + clamp(avg3 / need, 0, 1) * 0.25 + (1 - load) * 0.15) * 100);
  return { v, n, txt: v >= 80 ? ['Recuperado', 'Dormiste bien: hoy puedes darle duro.', '#22c55e'] : v >= 60 ? ['Normal', 'Entrena normal y oye a tu cuerpo.', '#f59e0b'] : ['Cansado', 'Dormiste poco: mejor técnica o algo suave, y acuéstate temprano.', '#ef4444'] };
}

/* ---------- Tarjeta de Hoy ---------- */
function card(){
  const r = readiness();
  if (r){ const n = r.n;
    return `<div class="sect sfsleep"><h4>ANOCHE · SATRONHO SOMNIA</h4><div class="in">
      <div class="ringbox">${SF.ring(r.v / 100, r.txt[2], 96, 10, `<b>${r.v}</b><small>recuperación</small>`)}</div>
      <div class="l"><b style="color:${r.txt[2]}">${r.txt[0].toUpperCase()}</b><small>${r.txt[1]}</small>
        <div class="st"><span>🌙 <b>${hm(n.a)}</b></span>${n.sc != null ? `<span>⭐ <b>${n.sc}</b> puntos</span>` : ''}${n.dp ? `<span>Profundo <b>${hm(n.dp)}</b></span>` : ''}${n.rm ? `<span>REM <b>${hm(n.rm)}</b></span>` : ''}</div></div></div></div>`; }
  if (has()){ const days = Math.floor((Date.now() - (sl.at || 0)) / 864e5);
    return `<button class="calcard" id="smSync" style="--c:#8b5cf6"><span class="calic">🌙</span><span class="l"><b>¿CÓMO DORMISTE ANOCHE?</b><small>${days >= 1 ? 'Último cruce hace ' + days + ' día' + (days === 1 ? '' : 's') + '. ' : ''}Toca para traer tu sueño de Somnia.</small></span><span class="arrow">›</span></button>`; }
  if (S.somniaHide) return '';
  return `<div class="calcard" style="--c:#8b5cf6"><span class="calic">🌙</span><button class="l" id="smSync" style="text-align:left"><b>CRUZA TU SUEÑO CON SOMNIA</b><small>Trae tus noches de Satronho Somnia y te digo qué tan recuperado estás para entrenar.</small></button><button class="xbtn" id="smHide" aria-label="Ocultar">×</button></div>`;
}

/* ---------- En Progreso ---------- */
function progressHTML(period){
  if (!has()) return '';
  const t = todayISO(), ns = [], tr = [], no = [];
  for (let i = 0; i < period; i++){ const d = addDays(t, -i), n = night(d); if (!n) continue; ns.push(n); (trainedOn(addDays(d, -1)) ? tr : no).push(n); }   // la noche que termina el día d sigue al entreno del día anterior
  if (!ns.length) return '';
  const av = (l, k) => l.reduce((a, x) => a + (x[k] || 0), 0) / l.length;
  const pts = []; for (let i = Math.min(period, 30) - 1; i >= 0; i--){ const d = addDays(t, -i), n = night(d); if (n) pts.push({ x: shortDate(d), v: n.a / 60 }); }
  const cmp = tr.length >= 3 && no.length >= 3 ? (() => { const d = av(tr, 'a') - av(no, 'a'); const sc = tr.every(x => x.sc != null) && no.every(x => x.sc != null) ? av(tr, 'sc') - av(no, 'sc') : null;
    return `<div class="note" style="--c:#8b5cf6;margin:0 0 12px">🥊 <span>Las noches después de entrenar duermes <b>${Math.abs(d) < 8 ? 'casi lo mismo' : hm(Math.abs(d)) + (d > 0 ? ' más' : ' menos')}</b>${sc != null && Math.abs(sc) >= 3 ? ` y tu puntaje ${sc > 0 ? 'sube' : 'baja'} <b>${Math.round(Math.abs(sc))} puntos</b>` : ''} (${tr.length} noches con entreno, ${no.length} sin).</span></div>`; })()
    : '<p class="hint">Con 3 noches después de entrenar y 3 sin entrenar te digo cómo cambia tu sueño.</p>';
  return `<div class="sect"><h4>SUEÑO · SATRONHO SOMNIA</h4>
    <div class="sfall"><div><b>${hm(av(ns, 'a'))}</b><small>promedio</small></div><div><b>${ns.some(x => x.sc != null) ? Math.round(av(ns.filter(x => x.sc != null), 'sc')) : '—'}</b><small>puntaje</small></div><div><b>${ns.length}</b><small>noches</small></div><div><b>${sl.need || 8} h</b><small>necesitas</small></div></div>
    <div style="padding:6px 0 10px">${SF.lineChart(pts, '#8b5cf6', { goal: sl.need || 8, fmt: v => n1(v) + ' h', minSpan: 2, empty: 'Con 2 noches o más verás la gráfica.' })}</div>${cmp}</div>`;
}

/* ---------- En Más ---------- */
function settingsHTML(){
  return `<div class="sect sfsomnia"><h4>SATRONHO SOMNIA · SUEÑO</h4>
    <div class="row" style="border:0"><span class="sfsomico">🌙</span><div class="l"><b>${has() ? Object.keys(sl.nights).length + ' noches cruzadas' : 'Cruza tu sueño con tus entrenos'}</b><small>${has() ? 'Último cruce: <span data-notr>' + niceDate(iso(new Date(sl.at))).toLowerCase() + '</span>' : 'Somnia te dice cómo dormiste; BoxFit, qué tan recuperado estás para entrenar. Somnia también aprende si entrenar te cambia el ronquido.'}</small></div></div>
    <button class="btn pri" id="smSync" style="width:100%;--bc:#8b5cf6;margin-bottom:8px">🔄 SINCRONIZAR CON SOMNIA</button>
    <div class="btnrow" style="margin-bottom:12px"><button class="btn" id="smOpen" style="font-size:17px">📂 ABRIR ARCHIVO DE SOMNIA</button><button class="btn" id="smSend" style="font-size:17px">📤 ENVIAR MIS ENTRENOS</button></div>
    <p class="hint">Todo pasa dentro del teléfono, sin internet. Necesitas Satronho Somnia 4.5 o más nueva. Si el botón de sincronizar no abre Somnia, usa los archivos: en Somnia ve a <b>Más › Satronho BoxFit</b>.</p></div>`;
}
let waiting = 0;
function sync(){
  hapticTap();
  const url = 'satronhosomnia://cruce?d=' + b64e(JSON.stringify(pack()));
  if (!isNative) return toast('La sincronización con un toque funciona en la app instalada. Aquí usa los archivos.');
  waiting = Date.now(); toast('Abriendo Satronho Somnia…');
  try { window.location.href = url; } catch(e){}
  setTimeout(() => { if (waiting && document.visibilityState === 'visible'){ waiting = 0; toast('No se abrió Somnia: instala la versión 4.5 o usa los archivos'); } }, 3000);
}
function bind(root){
  const s = root.querySelector('#smSync'); if (s) s.addEventListener('click', sync);
  const h = root.querySelector('#smHide'); if (h) h.addEventListener('click', () => { S.somniaHide = true; saveSettings(); if (current === 'home') SFToday.render(); });
  const o = root.querySelector('#smOpen'); if (o) o.addEventListener('click', () => fileIn.click());
  const e = root.querySelector('#smSend'); if (e) e.addEventListener('click', () => saveFile(`BoxFit-para-Somnia-${todayISO()}.json`, JSON.stringify(pack()), 'application/json'));
}
const fileIn = document.createElement('input'); fileIn.type = 'file'; fileIn.accept = '.json,application/json'; fileIn.hidden = true; document.body.appendChild(fileIn);
fileIn.addEventListener('change', async e => {
  const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
  let p; try { p = JSON.parse(await f.text()); } catch(err){ return toast('Ese archivo no es de Satronho Somnia'); }
  const n = importPack(p); if (n === false) return toast('Ese archivo no es el sueño de Somnia (búscalo en Somnia › Más › Satronho BoxFit)');
  done(n);
});
function done(n){
  waiting = 0; Sound.win(); confetti('#8b5cf6'); toast(`🌙 ${n} noche${n === 1 ? '' : 's'} de Somnia cruzada${n === 1 ? '' : 's'}`);
  if (current === 'home') SFToday.render(); else if (current === 'settings') renderSettings(); else if (current === 'progress') SFProgress.render();
}
// Respuesta de Somnia por enlace: satronhoboxfit://cruce?d=<datos>
function onUrl(url){
  if (!url || url.indexOf('satronhoboxfit://') !== 0) return;
  const m = /[?&]d=([^&]+)/.exec(url); if (!m) return;
  let p; try { p = JSON.parse(b64d(m[1])); } catch(e){ return toast('No se pudo leer lo que envió Somnia'); }
  const n = importPack(p); if (n === false) return toast('Somnia envió algo que no reconozco');
  done(n);
}
if (AppP){
  AppP.addListener('appUrlOpen', ev => onUrl(ev && ev.url));
  if (AppP.getLaunchUrl) AppP.getLaunchUrl().then(r => { if (r && r.url) setTimeout(() => onUrl(r.url), 800); }).catch(() => {});
}

window.SFSomnia = { has, card, bind, progressHTML, settingsHTML, readiness, importPack, pack, onUrl };
})();
