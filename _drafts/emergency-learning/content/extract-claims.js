/* רֶצֶף — חילוץ קביעות פדגוגיות ממודולה, לצורך אימות מול מקור חיצוני.
 *
 * למה: דפוס הכשל של LLM הוא קביעה שנשמעת נכון ושגויה מול מקור סמכותי.
 * סוכן LLM שבודק LLM לא תופס את זה — אותה הטיה. רק מקור חיצוני שובר את
 * הלולאה (CLAUDE.md). הסקריפט הזה מכין את רשימת הקביעות; האימות עצמו
 * נעשה מול Perplexity + מקור סמכותי.
 *
 * הרצה: node extract-claims.js <subject-id> <module-number>
 *        node extract-claims.js media-design 6
 */
const fs = require('fs'), path = require('path');
const DIR = __dirname;
const [subjId, modNum] = process.argv.slice(2);
if (!subjId || !modNum) { console.error('שימוש: node extract-claims.js <subject-id> <module-number>'); process.exit(1); }

global.window = {};
require(path.join(DIR, 'production-plan.js'));
require(path.join(DIR, 'curriculum-data.js'));
require(path.join(DIR, 'retzef-core.js'));
const R = window.RETZEF;

const subj = window.PRODUCTION_PLAN.subjects.find(s => s.id === subjId);
if (!subj) { console.error('מקצוע לא נמצא: ' + subjId); process.exit(1); }
const pm = subj.modules.find(m => R.modNum(m.n) === parseInt(modNum));
const c = R.compFor(subjId, pm.n);
const cl = R.classifyModule(subj, c, pm);
const gtype = R.greenType(subj, c);

const dir = path.join(DIR, subjId, 'module-' + String(modNum).padStart(2, '0'));
let files = [];
try { files = fs.readdirSync(dir).filter(f => /^unit-.*\.md$/.test(f)).sort(); }
catch (e) { console.error('אין תיקייה: ' + dir); process.exit(1); }

/* שער תחולה — אימות-מול-מקור תקף רק כשיש סמכות חיצונית אמיתית.
 * RED (בטיחות/כימיה/מס/משפט) = תקרת-LLM לפי DNA §6 — מומחה אנושי, לא Perplexity. */
const blocked = cl.rg === 'red';
const partial = cl.rg === 'mixed';

/* מה מאמתים ומה לא:
 * ✔ "רעיון מרכזי" ו-"### הסבר" — שם גרות הקביעות הכלליות על התחום. אלה
 *   הטענות שהמודל מתחייב עליהן, ומולן יש מקור חיצוני לפגוע.
 * ✘ "### פתיח" ו-"### דוגמה" — תרחישים בדויים ("בריף מתאר בית קפה רגוע").
 *   אין מה לאמת בהמצאה מכוונת; לאמת אותה = רעש שמטביע את האמת.
 * ✘ שאלות/סיכום — נגזרות מההסבר. אם ההסבר תקף, הן תקפות. */
const SKIP_SCENARIO = /^###\s*(פתיח|דוגמה)/;
const TAKE = /^###\s*(הסבר)/;

const claims = [];
files.forEach(f => {
  const txt = fs.readFileSync(path.join(dir, f), 'utf8');
  const lines = txt.split('\n');
  let level = '', inTake = false;
  lines.forEach((raw, i) => {
    const line = raw.trim();
    const lv = line.match(/^##\s*[🟢🔵🟣]\s*(basic|standard|advanced)/);
    if (lv) level = lv[1];
    if (/^###\s/.test(line)) inTake = TAKE.test(line) && !SKIP_SCENARIO.test(line);
    if (/^##\s/.test(line) && !/^###/.test(line)) inTake = false;

    // הרעיון המרכזי — הקביעה הנושאת של היחידה
    if (/^>\s*.*רעיון מרכזי/.test(line)) {
      const t = line.replace(/^>\s*/, '').replace(/\[מקור:[^\]]*\]/g, '')
        .replace(/^.*רעיון מרכזי אחד \(מנה אחת\):\s*/, '').trim();
      if (t.length > 15) claims.push({ file: f, level: 'רעיון', text: t, line: i + 1 });
    }
    else if (inTake && line.length > 22 && !/^###/.test(line)) {
      const t = line.replace(/\[מקור:[^\]]*\]/g, '').replace(/^[*\->\s\d.]+/, '').trim();
      if (t.length > 20 && !/^רלוונטיות/.test(t)) {
        claims.push({ file: f, level: level || '-', text: t, line: i + 1 });
      }
    }
  });
});

// דדופ — אותה קביעה חוזרת בין רמות/יחידות
const seen = new Set();
const uniq = claims.filter(c2 => {
  const k = c2.text.replace(/\s+/g, ' ').trim();
  if (seen.has(k)) return false;
  seen.add(k); return true;
});
const dupCount = claims.length - uniq.length;
claims.length = 0; claims.push(...uniq);

const flagged = claims.filter(c2 => /לאימות/.test(c2.text));
console.log('═══════════════════════════════════════');
console.log('  חילוץ קביעות — ' + subj.name + ' · ' + pm.n);
console.log('═══════════════════════════════════════');
console.log('נושא:   ' + (pm.t || c.title || ''));
console.log('סיווג:  ' + cl.rg + (cl.why ? ' (' + cl.why + ')' : '') + ' · סוג: ' + gtype);
console.log('יחידות: ' + files.length + ' · קביעות ייחודיות: ' + claims.length + ' (הוסרו ' + dupCount + ' כפולות)');
console.log('');
if (blocked) {
  console.log('🔴 חסום לאימות-מול-מקור. DNA §6: RED = תקרת-LLM.');
  console.log('   Perplexity אינו מחליף ממונה בטיחות / יועץ משפטי. עצור.');
  process.exit(0);
}
if (partial) console.log('🟠 מודולה מעורבת — אמת רק את החלק ה-🟢. תתי-נושאי ה-🔴 (' + cl.why + ') → מומחה אנושי.\n');
if (gtype === 'technique') console.log('🟡 GREEN-טכני — סמכות חיצונית עשויה שלא להתקיים. אם אין מקור אמיתי לפגוע בו — אל תאמת, סמן [ממתין למקור].\n');

console.log('─── קביעות לאימות ───');
claims.forEach((c2, i) => {
  console.log((i + 1) + '. [' + c2.file.replace(/^unit-|\.md$/g, '') + ' · ' + c2.level + '] ' + c2.text);
});
console.log('');
console.log('─── כבר מסומנות [לאימות] ע"י היצרן: ' + flagged.length + ' ───');
flagged.forEach(c2 => console.log('   ⚠ ' + c2.file + ': ' + c2.text));
console.log('');
console.log('הבא: אמת מול Perplexity + מקור סמכותי. כתוב רשומה ל-' + path.relative(DIR, dir) + '/_verification.md');
