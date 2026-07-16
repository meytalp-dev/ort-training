/* רֶצֶף — איתור "תת-נושא-ענק" (דפוס-על 0)
 *
 * הבעיה: כשכשירות מתארת **תחום** ולא **מנה**, הפייפליין מייצר יחידה חלולה
 * שנשמעת מכסה. כדורגל מ4: "חוקת המשחק לעומקה" = תת-נושא אחד → יחידה אחת →
 * חוק אחד מתוך 17 (IFAB). GPT ציית לכלל בדיוק; הכלל נשבר.
 * הלוח מציג "מלא" ומסתיר את החור — רק מקור חיצוני תפס את זה.
 *
 * הרצה: node scan-giant-subtopics.js
 */
const path = require('path');
const DIR = __dirname;
global.window = {};
require(path.join(DIR, 'production-plan.js'));
require(path.join(DIR, 'curriculum-data.js'));
require(path.join(DIR, 'retzef-core.js'));
try { require(path.join(DIR, 'produced.js')); } catch (e) { window.PRODUCED = {}; }
const R = window.RETZEF, P = window.PRODUCED || {};

/* סימני-היכר. משקל = חומרת החשד. */
const SIGNALS = [
  { rx: /לעומק/,                                 w: 3, why: '"לעומק" — מכריז על כיסוי תחום' },
  { rx: /^יסודות\s/,                             w: 3, why: 'פותח ב"יסודות" — תחום, לא מנה' },
  { rx: /^מבוא\b|^היכרות עם\b|^סקירת\b/,          w: 3, why: 'מבוא/סקירה — ז\'אנר של קורס' },
  { rx: /^תורת\s|^עקרונות\s|^חוקת\s|^כללי\s/,     w: 3, why: 'תורת/עקרונות/חוקת — גוף ידע שלם' },
  { rx: /^עולם ה|^מושגי יסוד|^מונחי יסוד/,        w: 2, why: 'מסגור של תחום' },
  { rx: /\bודיניה?\b|\bוחוקיה?\b/,                w: 2, why: 'תחום + החוקים שלו' },
];
/* דיסציפלינות שלמות שהופיעו כתת-נושא בודד */
const DISCIPLINES = /^(כימיה|ביולוגיה|אנטומיה|פיזיולוגיה|מיסוי|מימון|תמחור|שיווק|אתיקה|היגיינה|בטיחות|טריכולוגיה|טריקולוגיה|מיקרוביולוגיה|דרמטולוגיה|תזונה|סטטיסטיקה|אלגברה|גאומטריה|רטוריקה|תחביר|מורפולוגיה)$/;

const hits = [];
window.PRODUCTION_PLAN.subjects.forEach(s => {
  s.modules.forEach(pm => {
    const c = R.compFor(s.id, pm.n);
    const subs = R.subtopics(c, s);
    subs.forEach(t => {
      let score = 0; const why = [];
      SIGNALS.forEach(sg => { if (sg.rx.test(t.text)) { score += sg.w; why.push(sg.why); } });
      if (DISCIPLINES.test(t.text.trim())) { score += 3; why.push('דיסציפלינה שלמה כתת-נושא בודד'); }
      // מילה אחת שהיא לא פועל — חשוד כשם-תחום
      if (score === 0 && t.text.trim().split(/\s+/).length === 1 && t.text.length > 2) { score += 1; why.push('מילה אחת — כנראה שם-תחום'); }
      if (!score) return;
      const rec = P[s.id + '|' + R.modNum(pm.n)];
      hits.push({
        subj: s.name, sid: s.id, mod: pm.n, text: t.text, trait: t.trait,
        score, why: why.join(' · '),
        produced: rec ? rec.n : 0, need: subs.length
      });
    });
  });
});

hits.sort((a, b) => b.score - a.score || b.produced - a.produced);

const built = hits.filter(h => h.produced > 0);
console.log('═══════════════════════════════════════════════════');
console.log('  סריקת תת-נושא-ענק — ' + hits.length + ' חשודים מתוך 1,524');
console.log('═══════════════════════════════════════════════════');
console.log('');
console.log('🔴 חמור — כבר הופקה עליהם יחידה (התוכן חשוד כחלול): ' + built.length);
console.log('───────────────────────────────────────────────────');
built.forEach(h => {
  console.log('  [' + h.score + '] ' + h.subj + ' ' + h.mod + ' · ' + h.produced + '/' + h.need + ' יח\'');
  console.log('        "' + h.text + '"  (' + h.trait + ')');
  console.log('        ← ' + h.why);
});

const pending = hits.filter(h => !h.produced);
console.log('');
console.log('🟡 טרם הופקו — לפצל לפני ייצור: ' + pending.length);
console.log('───────────────────────────────────────────────────');
pending.slice(0, 25).forEach(h => {
  console.log('  [' + h.score + '] ' + h.subj + ' ' + h.mod + ' — "' + h.text + '"');
});
if (pending.length > 25) console.log('  ... ועוד ' + (pending.length - 25));

console.log('');
console.log('סיכום: ' + hits.length + ' חשודים · ' + built.length + ' כבר הופקו · ' + pending.length + ' ממתינים');

/* ───────────────────────────────────────────────────────────────────
 * גל שני של נזק-חילוץ: פיצול על **נקודתיים**, בלי סוגריים.
 *   "עקרונות בסיסיים: נקודה" · "צורה" · "קומפוזיציה"
 *   ← במקור: "עקרונות בסיסיים: נקודה, צורה, קומפוזיציה"
 * fix-curriculum-split.js תיקן רק את מקרי-הסוגריים, כי לסוגר יש **סימן
 * סגירה** שאומר איפה הרשימה נגמרת. לנקודתיים אין. איחוי כאן = ניחוש
 * איפה הרשימה נגמרת — ולכן **לא מתקנים אוטומטית**. דורש את ה-DOCX. */
console.log('');
console.log('═══════════════════════════════════════════════════');
console.log('  ⚠ גל שני — פיצול על נקודתיים (לא ניתן לתיקון אוטומטי)');
console.log('═══════════════════════════════════════════════════');
const colon = [];
window.PRODUCTION_PLAN.subjects.forEach(s => {
  s.modules.forEach(pm => {
    const c = R.compFor(s.id, pm.n);
    const arr = [].concat(c.knowledge || [], c.skills || []);
    arr.forEach((t, i) => {
      if (!/:/.test(t)) return;
      // יתומים אחריו: פריטים קצרים (1–2 מילים) = כנראה זנב הרשימה
      const tail = [];
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[j].split(/\s+/).length <= 2 && !/:/.test(arr[j])) tail.push(arr[j]); else break;
      }
      const rec = P[s.id + '|' + R.modNum(pm.n)];
      colon.push({ subj: s.name, mod: pm.n, head: t, tail, produced: rec ? rec.n : 0 });
    });
  });
});
colon.sort((a, b) => b.tail.length - a.tail.length);
colon.slice(0, 12).forEach(h => {
  console.log('  ' + h.subj + ' ' + h.mod + (h.produced ? ' · הופקו ' + h.produced + ' יח\'' : '') );
  console.log('     ראש:  "' + h.head + '"');
  if (h.tail.length) console.log('     זנב?  ' + h.tail.map(x => '"' + x + '"').join(' · '));
});
const withTail = colon.filter(h => h.tail.length);
console.log('');
console.log('  ' + colon.length + ' תתי-נושאים עם נקודתיים · ' + withTail.length + ' מהם עם זנב-יתומים חשוד');
console.log('  ← לא מתוקן. אין סימן-סגירה → איחוי = ניחוש. דורש את ה-DOCX המקורי.');
