/* רֶצֶף — מייצר את produced.js מסריקת הדיסק (מקור-אמת: הקבצים עצמם).
 * מריצים: node gen-produced.js   (או אוטומטית דרך refresh.sh / "רַעֲנֵן")
 *
 * למה זה קיים: produced.js תוחזק ידנית והתיישן ברגע ש-GPT דחף.
 * 16.7 — הלוח הראה 135 יחידות כשבדיסק היו 205 (פער 70), ומיטל ראתה
 * מודולות "תקועות על 1" שכבר היו מלאות. הלוח חייב לקרוא את המציאות. */
const fs = require('fs'), path = require('path');
const DIR = __dirname;
global.window = {};
require(path.join(DIR, 'production-plan.js'));
require(path.join(DIR, 'curriculum-data.js'));
require(path.join(DIR, 'retzef-core.js'));

let prev = {};
try { require(path.join(DIR, 'produced.js')); prev = window.PRODUCED || {}; } catch (e) { prev = {}; }

const R = window.RETZEF;
const out = {};

function countUnits(subjId, modNum) {
  const d = path.join(DIR, subjId, 'module-' + String(modNum).padStart(2, '0'));
  try {
    return fs.readdirSync(d).filter(f => /^unit-.*\.md$/.test(f)).length;
  } catch (e) { return 0; }
}

window.PRODUCTION_PLAN.subjects.forEach(function (s) {
  s.modules.forEach(function (pm) {
    const n = R.modNum(pm.n);
    const cnt = countUnits(s.id, n);
    if (!cnt) return;
    const k = s.id + '|' + n, p = prev[k];
    /* שומרים "reviewed" רק אם Claude בדק *בדיוק* את המספר הזה.
     * נחתו יחידות חדשות → חוזר ל-"built" (יש מה להפריך). */
    const stage = (p && p.n === cnt && p.stage === 'reviewed') ? 'reviewed' : 'built';
    out[k] = { n: cnt, stage: stage };
  });
});

const keys = Object.keys(out);
const total = keys.reduce((a, k) => a + out[k].n, 0);
const lines = keys.map(k => '  ' + JSON.stringify(k) + ': { n: ' + out[k].n + ', stage: ' + JSON.stringify(out[k].stage) + ' }');

const hdr =
  '/* רֶצֶף — מודולות שהופקו + שלב בפס. מפתח: subjId|מספר-מודולה → {n, stage}.\n' +
  ' * stage: "built" = טיוטה בריפו · "reviewed" = Claude בדק (הערות ב-refutation-log.md).\n' +
  ' *\n' +
  ' * 🤖 נוצר אוטומטית — אל תערוך ידנית. הרץ: node gen-produced.js (או "רַעֲנֵן").\n' +
  ' * המספרים נסרקים מהדיסק. עריכה ידנית תתיישן ברגע ש-GPT ידחוף.\n' +
  ' */\n' +
  'window.PRODUCED = {\n' + lines.join(',\n') + '\n};\n';

fs.writeFileSync(path.join(DIR, 'produced.js'), hdr, 'utf8');
console.log('produced.js נוצר מחדש — ' + keys.length + ' מודולות · ' + total + ' יחידות');
