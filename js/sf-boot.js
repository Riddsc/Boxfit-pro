/* =========================================================
   SATRONHO BOXFIT · ARRANQUE
   Va de último: todos los módulos ya cargaron.
   ========================================================= */
(function(){
// Ícono de la marca en la barra de arriba (el mismo del APK)
$('#brandIcon').innerHTML = SFArt.appIcon(40);
if (!load('sf_v4', false)){ if (S.askAtStart === undefined) S.askAtStart = true; save('sf_v4', true); }
// Pasos: se leen al abrir y cada vez que la app vuelve al frente
const refresh = async () => { if (await SF.readSteps(false)){ if (current === 'home') SFToday.render(); SF.checkMedals(); } };
refresh();
document.addEventListener('visibilitychange', () => { if (!document.hidden){ refresh(); if (current === 'home') SFToday.render(); } });
SF.checkMedals(true);
if (window.SFRemind) SFRemind.sync();
bootApp();
// Novedades de la versión 4 (una sola vez)
if (!load('sf_news4', false)) setTimeout(() => {
  openForm(`<div class="sfnews"><div class="orb">${SFArt.orbit(180)}</div><h3>¡BIENVENIDO A SATRONHO BOXFIT!</h3>
    <ul>
      <li><span>🔥</span><div><b>Hoy:</b> anillos de calorías, minutos y pasos, tu balance de energía y tu racha.</div></li>
      <li><span>🏋️</span><div><b>Gimnasio:</b> rutinas, más de 100 ejercicios, series con descanso automático y récords.</div></li>
      <li><span>🥊</span><div><b>Boxeo:</b> el timer, semáforo, ruletas y sesiones de siempre, más la Escuelita.</div></li>
      <li><span>🍽️</span><div><b>Comida:</b> calorías, proteína, carbos y grasa con comida de acá, agua, plan y ayuno.</div></li>
      <li><span>🌙</span><div><b>Satronho Somnia:</b> cruza tu sueño con tus entrenos.</div></li>
      <li><span>🏅</span><div><b>Medallas y rachas</b> que no se rompen en tus días de descanso.</div></li>
    </ul>
    <button class="btn pri" id="nwOk" style="width:100%;--bc:var(--mode)">${SF.profileMissing().length ? 'COMPLETAR MI PERFIL' : '¡A DARLE!'}</button></div>`, sh => sh.querySelector('#nwOk').addEventListener('click', () => { save('sf_news4', true); closeForm(); if (SF.profileMissing().length) go('me'); }));
}, 600);
})();
