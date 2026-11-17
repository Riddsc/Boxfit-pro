/* =========================================================
   SATRONHO BOXFIT · IDIOMAS (español, inglés y francés)
   La app está escrita en español. En inglés o francés:
   · Las frases que llevan negritas o subrayados se traducen COMPLETAS
     (la clave guarda las etiquetas: «Toca <b>Guardar</b> para…»).
   · El resto de textos se traduce nodo por nodo.
   · Los números se conservan ({n} en el diccionario) y los nombres
     propios marcados con data-notr no se tocan (<x/> en la clave).
   Diccionario: js/sf-lang.js. Fechas y números: Intl (index.html).
   ========================================================= */
(function(){
const NUM = /\d+(?:(?:[.,:]|[  ](?=\d{3}))\d+)*/g;
const lang = window.SF_LG || 'es';
const D = lang !== 'es' && window.SF_LANG ? SF_LANG[lang] : null;
const INLINE = { B: 1, STRONG: 1, U: 1, I: 1, EM: 1, BR: 1, A: 1 };
const norm = s => s.replace(/[ \t\n\r\f\v]+/g, ' ');   // sin tocar los espacios finos de los miles (fr)
const numKey = s => s.replace(NUM, '{n}');

/* Reglas para frases que se arman con datos (listas de palabras, etc.) */
const W = { en: { peso: 'weight', altura: 'height', 'género': 'gender', edad: 'age' }, fr: { peso: 'poids', altura: 'taille', 'género': 'genre', edad: 'âge' } };
const words = x => x.split(/,\s*/).map(w => (W[lang] || {})[w] || w).join(', ');
const RULES = {
  en: [[/^Falta: ([^.]*)\.(?: (.*))?$/, m => 'Missing: ' + words(m[1]) + '.' + (m[2] ? ' ' + t(m[2]) : '')], [/^Falta: (.*)$/, m => 'Missing: ' + words(m[1])]],
  fr: [[/^Falta: ([^.]*)\.(?: (.*))?$/, m => 'Il manque : ' + words(m[1]) + '.' + (m[2] ? ' ' + t(m[2]) : '')], [/^Falta: (.*)$/, m => 'Il manque : ' + words(m[1])]],
};
// Texto suelto
function t(s){
  if (!D || !s) return s;
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s), core = norm(m[2]);
  if (!core) return s;
  const nums = core.match(NUM) || [], tr = D[numKey(core)];
  if (tr == null){ for (const [re, f] of RULES[lang] || []){ const mm = re.exec(core); if (mm) return m[1] + f(mm) + m[3]; } return s; }
  let i = 0; return m[1] + tr.replace(/\{n\}/g, () => nums[i++] ?? '') + m[3];
}

/* ---------- Frases completas con etiquetas ---------- */
// ¿Este elemento es una frase con etiquetas en línea (b, u, em…)? Devuelve su plantilla o null
function template(el){
  if (!el.firstChild || el.closest('svg,[data-notr]')) return null;
  let hasTag = false, hasText = false, out = '';
  const keep = [];                         // hijos que no se traducen (nombres, íconos): <x/>
  for (const c of el.childNodes){
    if (c.nodeType === 3){ out += c.nodeValue; if (/[A-Za-zÁ-ú]/.test(c.nodeValue)) hasText = true; continue; }
    if (c.nodeType !== 1) continue;
    if (!INLINE[c.tagName] && !c.hasAttribute('data-notr')) return null;
    if (c.tagName === 'BR'){ out += '<br>'; continue; }
    if (c.hasAttribute('data-notr') || c.querySelector('*')){ out += '<x/>'; keep.push(c); hasTag = true; continue; }
    const tg = c.tagName.toLowerCase(); out += `<${tg}>${c.textContent}</${tg}>`; hasTag = true;
  }
  if (!hasTag || !hasText) return null;
  const core = norm(out).trim();
  return { key: numKey(core), nums: core.replace(/<[^>]+>/g, ' ').match(NUM) || [], keep };
}
function applyTemplate(el, tp, tr){
  // las etiquetas recuperan sus atributos originales (colores, enlaces) en el mismo orden
  const attrs = {}; el.querySelectorAll(':scope > *').forEach(c => { const k = c.tagName.toLowerCase(); (attrs[k] = attrs[k] || []).push(c.outerHTML.match(/^<[^>]+>/)[0]); });
  const used = {}; let i = 0, ki = 0;
  const esc2 = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
  let html = '', last = 0; const re = /<(\/?)(b|strong|u|i|em|a)>|<br>|<x\/>|\{n\}/g; let m;
  while ((m = re.exec(tr))){
    html += esc2(tr.slice(last, m.index)); last = re.lastIndex;
    if (m[0] === '{n}') html += esc2(tp.nums[i++] ?? '');
    else if (m[0] === '<br>') html += '<br>';
    else if (m[0] === '<x/>') html += '\u0000' + (ki++) + '\u0000';
    else if (m[1]) html += `</${m[2]}>`;
    else { const k = m[2], n = used[k] = (used[k] || 0); used[k]++; html += (attrs[k] && attrs[k][n]) || `<${k}>`; }
  }
  html += esc2(tr.slice(last));
  const parts = html.split('\u0000');
  el.innerHTML = parts.map((p, j) => j % 2 ? '<span data-sfx="' + p + '"></span>' : p).join('');
  el.querySelectorAll('[data-sfx]').forEach(sp => { const k = tp.keep[+sp.dataset.sfx]; if (k) sp.replaceWith(k); else sp.remove(); });
}
const doneEl = new WeakMap(), doneText = new WeakMap();
function doElement(el){
  if (doneEl.get(el) === el.innerHTML) return true;
  const tp = template(el); if (!tp) return false;
  const tr = D[tp.key]; if (tr == null) return false;
  applyTemplate(el, tp, tr); doneEl.set(el, el.innerHTML);
  el.querySelectorAll('*').forEach(c => c.childNodes.forEach(n => { if (n.nodeType === 3) doneText.set(n, n.nodeValue); }));
  el.childNodes.forEach(n => { if (n.nodeType === 3) doneText.set(n, n.nodeValue); });
  return true;
}
function doText(n){
  const v = n.nodeValue; if (doneText.get(n) === v) return;
  const p = n.parentElement; if (!p || p.closest('svg,script,style,[data-notr]')) return;
  // si el padre es una frase con etiquetas, se traduce entera
  if (p.childNodes.length > 1 && doElement(p)) return;
  if (INLINE[p.tagName] && p.parentElement && doElement(p.parentElement)) return;
  const r = t(v); doneText.set(n, r); if (r !== v) n.nodeValue = r;
}
const ATTRS = ['placeholder', 'aria-label', 'title'];
function doAttrs(el){
  if (el.nodeType !== 1 || el.closest('svg')) return;
  ATTRS.forEach(a => { const v = el.getAttribute(a); if (v){ const r = t(v); if (r !== v) el.setAttribute(a, r); } });
}
function walk(root){
  if (root.nodeType === 3) return doText(root);
  if (root.nodeType !== 1) return;
  doAttrs(root); root.querySelectorAll('[placeholder],[aria-label],[title]').forEach(doAttrs);
  const list = []; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) list.push(n);
  list.forEach(doText);
}
if (D){
  walk(document.body);
  new MutationObserver(ms => { for (const m of ms){ if (m.type === 'characterData') doText(m.target); else if (m.type === 'attributes') doAttrs(m.target); else m.addedNodes.forEach(walk); } })
    .observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
}

/* ---------- Para el rastreo de textos (pruebas) ---------- */
// Devuelve las claves que hay en pantalla: frases con etiquetas y textos sueltos
function collect(root){
  const out = new Set(), inTpl = new WeakSet();
  root = root || document.body;
  root.querySelectorAll('*').forEach(el => { if (el.closest('svg,[data-notr],script,style')) return; const tp = template(el); if (tp){ out.add(tp.key); el.querySelectorAll('*').forEach(c => inTpl.add(c)); inTpl.add(el); } });
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())){ const p = n.parentElement; if (!p || p.closest('svg,script,style,[data-notr]') || inTpl.has(p)) continue; const k = numKey(norm(n.nodeValue).trim()); if (/[A-Za-zÁ-ú]{2}/.test(k)) out.add(k); }
  root.querySelectorAll('[placeholder],[aria-label],[title]').forEach(el => ATTRS.forEach(a => { const v = el.getAttribute(a); if (v && /[A-Za-zÁ-ú]{2}/.test(v)) out.add(numKey(norm(v).trim())); }));
  return [...out];
}
// Textos que siguen sin traducir en pantalla (para revisar)
function missing(root){ return D ? collect(root).filter(k => D[k] == null && !Object.values(D).includes(k)) : []; }

const NAMES = [['auto', 'Automático'], ['es', 'Español'], ['en', 'English'], ['fr', 'Français']];
function settingsHTML(){
  const cur = S.lang || 'auto';
  return `<div class="sect"><h4 data-notr>IDIOMA · LANGUAGE · LANGUE</h4>
    <div class="seg" id="lgSeg" data-notr>${NAMES.map(([k, l]) => `<button type="button" data-lg="${k}" class="${k === cur ? 'on' : ''}">${l}</button>`).join('')}</div>
    <p class="hint">Automático usa el idioma del teléfono.</p></div>`;
}
function bind(root){
  root.querySelectorAll('[data-lg]').forEach(b => b.addEventListener('click', () => { if ((S.lang || 'auto') === b.dataset.lg) return; S.lang = b.dataset.lg; saveSettings(); location.reload(); }));
}
const dayNames = [0, 1, 2, 3, 4, 5, 6].map(i => WD_LONG[i]);
const dayLetters = [1, 2, 3, 4, 5, 6, 0].map(i => lang === 'es' ? ['D', 'L', 'M', 'X', 'J', 'V', 'S'][i] : WD_LONG[i].charAt(0));
function f(key, ...v){ let s = (D && D[key]) || key, i = 0; return s.replace(/\{s\}/g, () => v[i++] ?? ''); }
window.SFI18n = { t, f, lang, settingsHTML, bind, collect, missing, dayNames, dayLetters, template };
})();
