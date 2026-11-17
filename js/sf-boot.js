/* =========================================================
   SATRONHO BOXFIT · ARRANQUE
   Va de último: todos los módulos ya cargaron.
   ========================================================= */
(function(){
// Ícono de la marca en la barra de arriba (el mismo del APK)
$('#brandIcon').innerHTML = SFArt.appIcon(40);
// Franja detrás de la hora y la batería del teléfono, para que siempre se lean
const sb = document.createElement('div'); sb.className = 'sfstatusbg'; document.body.appendChild(sb);
const SBP = plugin('StatusBar');
const paintStatus = () => { if (!SBP) return; const light = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(); const isLightBg = /^#(f|e|d)/i.test(light) || /255/.test(light);
  SBP.setStyle({ style: isLightBg ? 'LIGHT' : 'DARK' }).catch(() => {}); };
paintStatus(); new MutationObserver(paintStatus).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
if (!load('sf_v4', false)){ if (S.askAtStart === undefined) S.askAtStart = true; save('sf_v4', true); }
// Pasos: se leen al abrir y cada vez que la app vuelve al frente
const refresh = async () => { const a = await SF.readSteps(false), b = await SFHealth.syncHC(false); if (a || b){ if (current === 'home') SFToday.render(); else if (current === 'health') SFHealth.render(); SF.checkMedals(); } SFWidget.push(); };
refresh();
document.addEventListener('visibilitychange', () => { if (!document.hidden){ refresh(); if (current === 'home') SFToday.render(); } });
SF.checkMedals(true);
if (window.SFRemind) SFRemind.sync();
bootApp();
// Novedades de la versión 4 (una sola vez)
if (!load('sf_news41', false)) setTimeout(() => {
  openForm(`<div class="sfnews"><div class="orb">${SFArt.orbit(180)}</div><h3>¡BIENVENIDO A SATRONHO BOXFIT!</h3>
    <ul>
      <li><span>🔥</span><div><b>Hoy:</b> anillos de calorías, minutos y pasos, tu balance de energía y tu racha.</div></li>
      <li><span>🏋️</span><div><b>Gimnasio:</b> rutinas, más de 100 ejercicios, series con descanso automático y récords.</div></li>
      <li><span>🥊</span><div><b>Boxeo:</b> el timer, semáforo, ruletas y sesiones de siempre, más la Escuelita.</div></li>
      <li><span>🍽️</span><div><b>Comida:</b> calorías, proteína, carbos y grasa con comida de acá, agua, plan y ayuno.</div></li>
      <li><span>❤️</span><div><b>Salud:</b> pasos, puntos cardio, pulso con la cámara o el reloj, y tu sueño con Satronho Somnia.</div></li>
      <li><span>🗓️</span><div><b>Plan semanal y modo meta</b>, calentamiento sugerido y widget para el teléfono.</div></li>
      <li><span>🏅</span><div><b>Medallas y rachas</b> que no se rompen en tus días de descanso.</div></li>
    </ul>
    <button class="btn pri" id="nwOk" style="width:100%;--bc:var(--mode)">${SF.profileMissing().length ? 'COMPLETAR MI PERFIL' : '¡A DARLE!'}</button></div>`, sh => sh.querySelector('#nwOk').addEventListener('click', () => { save('sf_news41', true); closeForm(); if (SF.profileMissing().length) go('me'); }));
}, 600);
})();
