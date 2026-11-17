/* =========================================================
   SATRONHO BOXFIT · IDIOMAS (español, inglés y francés)
   La app está escrita en español. En inglés o francés, cada texto que
   aparece en pantalla se busca en el diccionario (js/sf-lang.js) y se
   cambia; los números se conservan ({n} en el diccionario).
   ========================================================= */
(function(){
const NUM = /\d+(?:[.,:]\d+)*/g;
const pickLang = () => {
  const l = S.lang || 'auto';
  if (l !== 'auto') return l;
  const n = (navigator.language || 'es').toLowerCase();
  return n.startsWith('fr') ? 'fr' : n.startsWith('en') ? 'en' : 'es';
};
const lang = pickLang();
const D = lang !== 'es' && window.SF_LANG ? SF_LANG[lang] : null;
document.documentElement.lang = lang;
function t(s){
  if (!D || !s) return s;
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s), core = m[2].replace(/\s+/g, ' ');
  if (!core) return s;
  const nums = core.match(NUM) || [], key = core.replace(NUM, '{n}');
  let tr = D[key];
  if (tr == null){ for (const [re, f] of RULES[lang] || []){ const mm = re.exec(core); if (mm) return m[1] + f(mm) + m[3]; } return s; }
  let i = 0; return m[1] + tr.replace(/\{n\}/g, () => nums[i++] ?? '') + m[3];
}
const W = { en: { peso: 'weight', altura: 'height', 'género': 'gender', edad: 'age' }, fr: { peso: 'poids', altura: 'taille', 'género': 'genre', edad: 'âge' } };
const words = (l, x) => x.split(/,\s*/).map(w => (W[l] || {})[w] || w).join(', ');
const RULES = {
  en: [[/^Falta: ([^.]*)\.?$/, m => 'Missing: ' + words('en', m[1])], [/^Falta: ([^.]*)\. (.*)$/, m => 'Missing: ' + words('en', m[1]) + '. ' + t(m[2])]],
  fr: [[/^Falta: ([^.]*)\.?$/, m => 'Il manque : ' + words('fr', m[1])], [/^Falta: ([^.]*)\. (.*)$/, m => 'Il manque : ' + words('fr', m[1]) + '. ' + t(m[2])]],
};
const ATTRS = ['placeholder', 'aria-label', 'title'];
const done = new WeakMap();      // nodo de texto → lo último que escribimos
function doText(n){
  const v = n.nodeValue; if (done.get(n) === v) return;
  const p = n.parentElement; if (!p || p.closest('svg,script,style,[data-notr]')) return;
  const r = t(v); done.set(n, r); if (r !== v) n.nodeValue = r;
}
function doEl(el){
  if (el.nodeType !== 1 || el.closest('svg')) return;
  ATTRS.forEach(a => { const v = el.getAttribute(a); if (v){ const r = t(v); if (r !== v) el.setAttribute(a, r); } });
}
function walk(root){
  if (root.nodeType === 3) return doText(root);
  if (root.nodeType !== 1) return;
  doEl(root); root.querySelectorAll && root.querySelectorAll('[placeholder],[aria-label],[title]').forEach(doEl);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) doText(n);
}
if (D){
  walk(document.body);
  new MutationObserver(ms => { for (const m of ms){ if (m.type === 'characterData') doText(m.target); else m.addedNodes.forEach(walk); if (m.type === 'attributes') doEl(m.target); } })
    .observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
}
const NAMES = [['auto', 'Automático'], ['es', 'Español'], ['en', 'English'], ['fr', 'Français']];
function settingsHTML(){
  const cur = S.lang || 'auto';
  return `<div class="sect"><h4>IDIOMA · LANGUAGE · LANGUE</h4>
    <div class="seg" id="lgSeg" data-notr>${NAMES.map(([k, l]) => `<button type="button" data-lg="${k}" class="${k === cur ? 'on' : ''}">${l}</button>`).join('')}</div>
    <p class="hint">Automático usa el idioma del teléfono.</p></div>`;
}
function bind(root){
  root.querySelectorAll('[data-lg]').forEach(b => b.addEventListener('click', () => { if ((S.lang || 'auto') === b.dataset.lg) return; S.lang = b.dataset.lg; saveSettings(); location.reload(); }));
}
window.SFI18n = { t, lang, settingsHTML, bind };
})();
