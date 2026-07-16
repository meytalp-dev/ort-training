/* רֶצֶף — תיקון החילוץ השבור ב-curriculum-data.js
 *
 * הבעיה: החילוץ מה-DOCX פיצל כשירות אחת על **פסיקים**, וריסק רשימות בסוגריים
 * לפרגמנטים חסרי-פשר:
 *   "יסודות ניהול עסק קטן (תמחור" · "מימון" · "מיסוי" · "חוקי מדינה — הרצאות מרוכזות)"
 *   ↑ כשירות אחת, לא ארבע. הסוגר נפתח בראשונה ונסגר ברביעית.
 * הנזק: GPT הפיק יחידה שלמה לכל פרגמנט, ומוני ה"צריך" בלוח נופחו.
 *
 * האלגוריתם: עוברים על כל מערך; פריט שמשאיר סוגר פתוח — מאחים אליו את
 * הפריטים הבאים (עם ", ") עד לאיזון. לא הצליח לאזן → משאירים כמו שהוא
 * (לא מאבדים מידע לעולם).
 *
 * הרצה: node fix-curriculum-split.js          → יבש, מדפיס דוגמאות
 *       node fix-curriculum-split.js --write   → כותב בפועל
 */
const fs = require('fs'), path = require('path');
const DIR = __dirname, WRITE = process.argv.includes('--write');
global.window = {};
require(path.join(DIR, 'curriculum-data.js'));
const C = window.CURRICULUM;

const bal = s => (s.match(/\(/g) || []).length - (s.match(/\)/g) || []).length;

function repair(arr) {
  const out = [], joins = [];
  let i = 0;
  while (i < arr.length) {
    let cur = arr[i], b = bal(cur);
    if (b <= 0) { out.push(cur); i++; continue; }
    // סוגר פתוח — מאחים קדימה עד איזון
    const parts = [cur];
    let j = i + 1;
    while (j < arr.length && b > 0) { parts.push(arr[j]); b += bal(arr[j]); j++; }
    if (b === 0 && parts.length > 1) {
      const merged = parts.join(', ');
      joins.push({ from: parts.slice(), to: merged });
      out.push(merged);
      i = j;
    } else {
      out.push(cur); i++;   // לא אוזן — לא נוגעים
    }
  }
  return { out, joins };
}

let totalJoins = 0, totalRemoved = 0;
const samples = [];

Object.keys(C).forEach(id => {
  (C[id].mods || []).forEach(m => {
    ['knowledge', 'skills'].forEach(k => {
      if (!Array.isArray(m[k])) return;
      const before = m[k].length;
      const { out, joins } = repair(m[k]);
      if (!joins.length) return;
      totalJoins += joins.length;
      totalRemoved += before - out.length;
      joins.forEach(j => samples.push({ id, mod: m.n, field: k, from: j.from, to: j.to }));
      m[k] = out;
    });
  });
});

console.log('איחודים: ' + totalJoins + ' · תתי-נושאים מזויפים שהוסרו: ' + totalRemoved);

// שארית: פרגמנטים שעדיין לא מאוזנים אחרי התיקון
let left = 0;
Object.keys(C).forEach(id => (C[id].mods || []).forEach(m =>
  ['knowledge', 'skills'].forEach(k => (m[k] || []).forEach(t => { if (bal(t) !== 0) { left++; console.log('  ⚠ נותר לא מאוזן: ' + id + ' מ' + m.n + ' → "' + t + '"'); } }))));
console.log('נותרו לא מאוזנים: ' + left);

console.log('\n=== דוגמאות (10 ראשונות) ===');
samples.slice(0, 10).forEach(s => {
  console.log('\n' + s.id + ' · מ' + s.mod + ' · ' + s.field);
  s.from.forEach(f => console.log('   לפני:  "' + f + '"'));
  console.log('   אחרי:  "' + s.to + '"');
});

if (WRITE) {
  const hdr =
    '/* מדף הרציפות — נתוני תוכניות הלימודים (כשירויות NQF מתוך המקור)\n' +
    ' * מקור: סל תוכניות תשפ"ז (docx · פרטי). חולץ אוטומטית 16.7.2026.\n' +
    ' * לכל מודולה (=נושא): knowledge[] (ידע) · skills[] (מיומנות) · responsibility · assess (תוצר/הערכה).\n' +
    ' * העמוד גוזר תתי-נושאים + "איך נבחן" לפי מיפוי trait→assessment ב-content-standard.\n' +
    ' *\n' +
    ' * 🔧 תוקן 16.7.2026 — fix-curriculum-split.js: החילוץ המקורי פיצל כשירויות על\n' +
    ' * פסיקים וריסק רשימות-בסוגריים לפרגמנטים ("...(תמחור" · "מימון" · "מיסוי").\n' +
    ' * ' + totalJoins + ' איחודים · ' + totalRemoved + ' תתי-נושאים מזויפים הוסרו.\n' +
    ' * זהו תיקון מכני, לא חילוץ מחדש — שברים ללא סוגריים עשויים להישאר.\n' +
    ' */\n';
  fs.writeFileSync(path.join(DIR, 'curriculum-data.js'),
    hdr + 'window.CURRICULUM = ' + JSON.stringify(C, null, 1) + ';\n', 'utf8');
  console.log('\n✅ נכתב curriculum-data.js');
} else {
  console.log('\n(הרצה יבשה — לא נכתב כלום. להרצה בפועל: --write)');
}
