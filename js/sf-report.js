/* =========================================================
   SATRONHO BOXFIT · REPORTE EN PDF (solo cuando la persona lo pide)
   Usa jsPDF (js/vendor/jspdf.umd.min.js), que se carga apenas se necesita.
   ========================================================= */
(function(){
const { nf, n1, hm } = SF;
const T = s => TT(String(s));
function loadPdf(){
  if (window.jspdf) return Promise.resolve(window.jspdf.jsPDF);
  return new Promise((ok, bad) => { const s = document.createElement('script'); s.src = 'js/vendor/jspdf.umd.min.js'; s.onload = () => ok(window.jspdf.jsPDF); s.onerror = bad; document.head.appendChild(s); });
}
function open(){
  let days = 30;
  openForm(`<h3 class="ftitle">📄 REPORTE EN PDF</h3><p class="hint">Un resumen para guardar, imprimir o mostrarle a tu entrenador o nutricionista.</p>
    <div class="seg" id="rpP"><button type="button" data-d="7">7 DÍAS</button><button type="button" data-d="30">30 DÍAS</button><button type="button" data-d="90">90 DÍAS</button></div>
    <div class="btnrow"><button class="btn" id="rpX">CANCELAR</button><button class="btn pri" id="rpOk" style="--bc:#ef4444">CREAR PDF</button></div>`, sh => {
    const paint = () => sh.querySelectorAll('#rpP [data-d]').forEach(b => b.classList.toggle('on', +b.dataset.d === days));
    sh.querySelectorAll('#rpP [data-d]').forEach(b => b.addEventListener('click', () => { days = +b.dataset.d; paint(); }));
    sh.querySelector('#rpX').addEventListener('click', closeForm);
    sh.querySelector('#rpOk').addEventListener('click', async () => { const b = sh.querySelector('#rpOk'); b.disabled = true; b.textContent = 'CREANDO…'; try { await make(days); closeForm(); } catch(e){ toast('No se pudo crear el PDF'); b.disabled = false; b.textContent = 'CREAR PDF'; } });
    paint();
  });
}
async function make(days){
  const jsPDF = await loadPdf();
  const doc = new jsPDF({ unit: 'mm', format: 'a4' }), W = 210, M = 16;
  let y = 0;
  const t = todayISO(), from = addDays(t, -(days - 1));
  const head = () => {
    doc.setFillColor(15, 13, 23); doc.rect(0, 0, W, 30, 'F');
    doc.setTextColor(255, 90, 54); doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.text('SATRONHO BOXFIT', M, 14);
    doc.setTextColor(230, 230, 240); doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(`${me.name ? TF('Reporte de {s}', me.name) : T('Reporte de mi entrenamiento')} · ${niceDate(from)} – ${niceDate(t)}`, M, 22);
    y = 40; doc.setTextColor(20, 20, 30);
  };
  const need = h => { if (y + h > 282){ doc.addPage(); head(); } };
  const title = s => { need(14); doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(255, 90, 54); doc.text(T(s), M, y); y += 2; doc.setDrawColor(230, 230, 236); doc.line(M, y, W - M, y); y += 6; doc.setTextColor(20, 20, 30); doc.setFont('helvetica', 'normal'); doc.setFontSize(10); };
  const line = (a, b) => { need(6); doc.setFont('helvetica', 'normal'); doc.text(T(a), M, y); if (b != null){ doc.setFont('helvetica', 'bold'); doc.text(T(b), W - M, y, { align: 'right' }); } y += 6; };
  const para = s => { doc.setFontSize(9); doc.setTextColor(110, 110, 120); const l = doc.splitTextToSize(T(s), W - 2 * M); need(l.length * 4.5); doc.text(l, M, y); y += l.length * 4.5 + 2; doc.setTextColor(20, 20, 30); doc.setFontSize(10); };
  head();
  // Perfil
  const lw = lastWeight(), a = ageOf(me);
  title('PERFIL');
  line('Edad', a ? ageText(a) : '—'); line('Altura', me.height ? me.height + ' cm' : '—'); line('Peso actual', lw ? fmtKg(lw.kg) + ' kg' : '—');
  line('Gasto en reposo estimado', nf(SF.bmr()) + ' kcal/día');
  // Entrenos
  const L = sessLog.filter(h => h.d >= from && h.d <= t), kc = L.reduce((x, h) => x + SF.kcalOf(h), 0), mn = L.reduce((x, h) => x + SF.minOf(h), 0);
  const by = { box: 0, gym: 0, cardio: 0 }; L.forEach(h => by[h.t === 'gym' ? 'gym' : h.t === 'cardio' ? 'cardio' : 'box']++);
  title('ENTRENAMIENTO');
  line('Entrenos', L.length); line('Días activos', new Set(L.map(h => h.d)).size + ' de ' + days); line('Tiempo total', hm(mn)); line('Calorías en entrenos', nf(kc) + ' kcal');
  line('Boxeo / Gimnasio / Cardio', `${by.box} / ${by.gym} / ${by.cardio}`);
  const s = SF.streaks(); line('Racha actual', s.day + ' días (mejor: ' + s.bestDay + ')');
  L.slice().reverse().slice(0, 40).forEach(h => line(`${shortDate(h.d)}  ${T(h.p)}`, `${hm(SF.minOf(h))} · ${nf(SF.kcalOf(h))} kcal`));
  if (L.length > 40) para(`…y ${L.length - 40} entrenos más.`);
  // Pesas
  const wk = SFGym.workouts().filter(w => w.d >= from);
  if (wk.length){ title('PESAS'); line('Rutinas', wk.length); line('Series', wk.reduce((x, w) => x + SFGym.wkSets(w), 0)); line('Peso movido', nf(wk.reduce((x, w) => x + SFGym.wkVol(w), 0)) + ' kg'); }
  // Comida
  const fd = []; for (let i = 0; i < days; i++){ const f = SFNutri.dayTotals(addDays(t, -i)); if (f.k) fd.push(f); }
  title('COMIDA');
  if (fd.length){ const av = k => nf(fd.reduce((x, f) => x + f[k], 0) / fd.length); const tg = SFNutri.targets();
    line('Días anotados', fd.length); line('Calorías promedio', av('k') + ' kcal (meta ' + nf(tg.k) + ')'); line('Proteína / Carbos / Grasa promedio', `${av('p')} / ${av('c')} / ${av('f')} g`); }
  else para('No hay comidas anotadas en este periodo.');
  let wt = 0, wn = 0; for (let i = 0; i < days; i++){ const v = SF.water()[addDays(t, -i)]; if (v){ wt += v; wn++; } }
  if (wn) line('Agua promedio', n1(wt / wn / 1000) + ' L/día');
  // Cuerpo
  const W0 = weights.filter(w => w.date >= from).sort((x, z) => x.date.localeCompare(z.date));
  title('CUERPO');
  if (W0.length >= 2) line('Peso', `${fmtKg(W0[0].kg)} -> ${fmtKg(W0[W0.length - 1].kg)} kg  (${W0[W0.length - 1].kg - W0[0].kg >= 0 ? '+' : ''}${fmtKg(W0[W0.length - 1].kg - W0[0].kg)})`);
  else para(W0.length ? 'Solo hay un registro de peso en el periodo.' : 'No hay registros de peso en el periodo.');
  const g = SFPlan.goalInfo(); if (g) line('Meta', `${fmtKg(g.now)} -> ${fmtKg(g.now + g.toGo)} kg · ${g.daysLeft} días`);
  // Salud
  title('SALUD');
  let st = 0, sn = 0; for (let i = 0; i < days; i++){ const v = SF.steps()[addDays(t, -i)]; if (v){ st += v; sn++; } }
  line('Pasos promedio', sn ? nf(st / sn) + ' al día' : '—'); line('Puntos cardio esta semana', SFHealth.weekPts() + ' de 150');
  line('Pulso en reposo', SFHealth.restingHR() ? SFHealth.restingHR() + ' lpm' : '—'); line('Pulso máximo estimado', SFHealth.maxHR() + ' lpm');
  if (SFSomnia.has()){ const r = SFSomnia.readiness(); line('Recuperación de hoy (Somnia)', r ? r.v + ' / 100' : '—'); }
  // Medallas
  const md = SF.medals(), got = SF.MEDALS.filter(m => md[m[0]]);
  title('MEDALLAS'); para(got.length ? got.map(m => T(m[2])).join(' · ') : 'Todavía no hay medallas.');
  para('Las calorías y el pulso son estimaciones para seguir tu progreso; no reemplazan una valoración médica o nutricional.');
  const b64 = doc.output('datauristring').split(',')[1], name = `Satronho-BoxFit-reporte-${t}.pdf`;
  const FS = plugin('Filesystem'), SH = plugin('Share');
  if (FS && SH){
    const r = await FS.writeFile({ path: name, data: b64, directory: 'CACHE' });
    try { await SH.share({ title: name, files: [r.uri], dialogTitle: T('Guardar o enviar el reporte') }); } catch(e){}
  } else doc.save(name);
  toast('Reporte listo 📄');
}
window.SFReport = { open };
})();
