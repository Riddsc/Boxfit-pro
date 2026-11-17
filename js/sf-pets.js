/* =========================================================
   SATRONHO BOXFIT · LOS GUÍAS SATRONHO
   · MechaRidds boxeador boxea siempre en el timer.
   · El acompañante fijo (botón flotante y explicaciones) es MechaRidds por
     defecto; la persona puede escoger a Samy, Troya, Ñoño o Juana.
   · Los consejos y mensajes los dicen los perritos así: Samy y Troya el 65 %
     (32,5 % cada una), Ñoño el 25 % y Juana el 10 %. El que habla se elige
     al azar pero fijo por mensaje y por día, para que no cambie en cada toque.
   ========================================================= */
(function(){
const W = [['samy', 32.5], ['troya', 32.5], ['nono', 25], ['juana', 10]];
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
function pick(seed){
  let r = hash((seed || '') + todayISO()) * 100;
  for (const [id, w] of W){ if ((r -= w) < 0) return id; }
  return 'samy';
}
// Un perrito hablando. id = null → lo elige el reparto 65/25/10
function says(id, text){
  id = id || pick(text);
  const g = SFArt.GUIDES[id];
  return `<div class="sfsays">${SFArt.badge(id, 52)}<div class="bub"><b style="color:${g.color}">${g.name}</b><p>${text}</p></div></div>`;
}
// Elegir el acompañante fijo
function openCompanion(){
  const ids = ['mecha', 'samy', 'troya', 'nono', 'juana'];
  let sel = companion();
  openForm(`<h3 class="ftitle">MI ACOMPAÑANTE</h3><p class="hint">Es quien te acompaña en todas las pantallas y te explica cada sección. <b>MechaRidds boxeador</b> sigue boxeando contigo en el timer, elijas a quien elijas.</p>
    <div class="sfpets">${ids.map(id => `<button type="button" data-pet="${id}" style="--c:${SFArt.GUIDES[id].color}">${SFArt.badge(id, 70)}<b>${SFArt.GUIDES[id].name}</b><small>${id === 'mecha' ? 'Por defecto' : SFArt.GUIDES[id].role}</small></button>`).join('')}</div>
    <button class="btn" id="cpLook" style="width:100%;flex:none;margin:6px 0 8px">🥊 VESTIR A MECHARIDDS BOXEADOR</button>
    <div class="btnrow"><button class="btn" id="cpC">CANCELAR</button><button class="btn pri" id="cpOk" style="--bc:var(--mode)">GUARDAR</button></div>`, sh => {
    const paint = () => sh.querySelectorAll('[data-pet]').forEach(b => b.classList.toggle('on', b.dataset.pet === sel));
    sh.querySelectorAll('[data-pet]').forEach(b => b.addEventListener('click', () => { sel = b.dataset.pet; hapticTap(); paint(); }));
    sh.querySelector('#cpC').addEventListener('click', closeForm);
    sh.querySelector('#cpLook').addEventListener('click', () => { closeForm(); setTimeout(openLookForm, 250); });
    sh.querySelector('#cpOk').addEventListener('click', () => { S.companion = sel; saveSettings(); paintMascots(); closeForm(); toast(`${gName()} te acompaña 🐾`); if (current === 'settings') renderSettings(); });
    paint();
  });
}
window.SFPets = { says, pick, openCompanion };
SF.says = says;
})();
