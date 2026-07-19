/* ============================================================
   רֶצֶף — מנוע QA דטרמיניסטי ליחידות + מסכים
   ------------------------------------------------------------
   בטריות (שכבה 1 — דטרמיניסטית, חינם, שניות):
     A. מבנה+שאלות   (על 444 היחידות)
     B. דליפות       (מטא-מחבר / חשיפת-תשובה)
     C. עיצוב        (מסכים — טוקנים/פטל-דיו/hex/אימוג'י/גופן)
   פלט: qa-report.json + סיכום לקונסול, מקובץ לפי בדיקה.
   הרצה:  node qa-engine.js
   ------------------------------------------------------------
   שכבות 2-3 (LLM-שופט + פרפלקסיטי) — לא כאן. ראו QA-KICKOFF.md.
   ✅ ארכיטקטורה: הפרסר אוחד ל-unit-parser.js — גם unit-view וגם qa-engine
                  צורכים אותו, כך שה-QA בודק את הרינדור המדויק (עקרון 1).
   ============================================================ */
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const P = require('./unit-parser.js');   // מקור-אמת יחיד לפירוש-שאלות

function loadWindow(rel){
  const w = {};
  try { new Function('window', fs.readFileSync(path.join(ROOT, rel), 'utf8'))(w); } catch(e){}
  return w;
}
const CONTENT = loadWindow('units-content.js').RETZEF_CONTENT || {};
const UNITS   = loadWindow('units-data.js').RETZEF_UNITS || [];
const MIG     = loadWindow('migration-data.js').MIGRATION || { screens: [] };
const UMETA = {}; UNITS.forEach(u => UMETA[u.id] = u);

const findings = [];
function flag(scope, id, check, severity, category, detail){
  findings.push({ scope, id, check, severity, category, detail });
}

/* ============================================================
   בטרייה A + B — יחידות
   ============================================================ */
for (const id of Object.keys(CONTENT)){
  const raw = CONTENT[id];
  const { body, hasLevels } = P.splitLevels(raw);
  const meta = UMETA[id] || {};

  // A1 — מבנה
  const assessmentUnit = /##\s+.*(משימת הערכה|כרטיס אבחון)/.test(body);
  if (!hasLevels && !assessmentUnit) flag('unit', id, 'no-levels', 'high', 'render', 'אין 3 רמות ולא יחידת-הערכה');

  // A2 — רעיון מרכזי
  if (!/^>\s*רעיון מרכזי/m.test(body) && !(meta.idea)) flag('unit', id, 'no-central-idea', 'med', 'content', 'חסר "רעיון מרכזי"');

  // שאלות — על כל היחידה. הפירוש זהה למנוע-התצוגה (unit-parser.parseQuestion).
  const allQ = P.questionBlocks(body);
  // A3 — מיעוט שאלות (מפרט: 2/3/3 ≈ 8; דגל אם < 4 בסה"כ)
  if (allQ.length < 4) flag('unit', id, 'few-questions', 'med', 'content',
    `${allQ.length} שאלות בלבד (מפרט unit-dna: 2/3/3 ≈ 8)`);

  const types = {};
  allQ.forEach((b, i) => {
    const q = P.parseQuestion(b);
    const hasRubric = /מחוון|תשובה צפויה|תשובה נכונה|תשובה אפשרית|משוב\s*:/.test(b);
    const inlineMarkers = (b.split('\n')[0].match(/\([א-ת]\)/g) || []).length >= 2;
    types[q.type] = (types[q.type]||0)+1;
    // A4 — כשל-רינדור: אפשרויות (א)(ב) בשורה שהמנוע *עדיין* מציג כפתוחה.
    //      אחרי איחוד-הפרסר וזיהוי-inline — אמור להיות 0. נשמר כשומר לפורמט-כשל חדש.
    if (inlineMarkers && q.type === 'open') flag('unit', id, 'inline-mcq-undetected', 'high', 'render',
      `שאלה ${i+1}: אפשרויות (א)(ב)(ג) בשורה אחת — המנוע מציג כפתוחה`);
    // A5 — אמריקאית בלי תשובה נכונה מזוהה (המנוע לא יידע לסמן נכון)
    if (q.type === 'mcq' && q.correctIndex < 0) flag('unit', id, 'mcq-no-correct', 'high', 'content',
      `שאלה ${i+1}: אמריקאית בלי סימון תשובה נכונה`);
    // A6 — שאלה לא-אמריקאית בלי מחוון/תשובה-צפויה (הפרת מפרט)
    if (q.type === 'open' && !hasRubric) flag('unit', id, 'open-without-rubric', 'high', 'content',
      `שאלה ${i+1}: פתוחה/מובנית בלי מחוון/תשובה-צפויה (unit-dna דורש)`);
  });
  // A7 — כל השאלות מאותה שיטה (מפרט אוסר "הכול MC")
  if (allQ.length >= 4 && Object.keys(types).length === 1)
    flag('unit', id, 'single-method', 'low', 'content', `כל ${allQ.length} השאלות מסוג "${Object.keys(types)[0]}" (מפרט: לגוון)`);

  // B1-B3 — דליפות מטא-מחבר שאמורות להיות מוסתרות ברינדור
  if (/error_type/.test(body)) flag('unit', id, 'leak-error-type', 'med', 'render', 'מכיל {error_type} — לוודא שהמנוע מסתיר');
  if (/\*\*מסיחים\s*:\*\*/.test(body)) flag('unit', id, 'leak-distractors-section', 'med', 'render', 'מקטע **מסיחים:** — חייב מוסתר');
  if (/(?<!`)\[מקור\s*:/.test(body)) flag('unit', id, 'leak-source-tag', 'low', 'render', 'תג [מקור:] לא-בגרשיים — לוודא ניקוי');
}

/* ============================================================
   בטרייה C — עיצוב (מסכים)
   ============================================================ */
const layerByFile = {};
MIG.screens.forEach(s => { layerByFile[s.f] = s; });

function screenFiles(){
  return fs.readdirSync(ROOT)
    .filter(f => f.endsWith('.html'))
    .filter(f => !/^(unit-view|catalog-preview|content-admin|design-migration)\.html$/.test(f))
    .filter(f => !/^demo-|^enrichment-lesson-alive/.test(f)); // דמו-יחידות נבדקות כתוכן
}
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u;

for (const f of screenFiles()){
  let html; try { html = fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch(e){ continue; }
  const sc = layerByFile[f] || {};
  const isShell = sc.layer === 'shell';

  // C1 — טוקנים v2
  if (!/tokens\.css\?v=2/.test(html)) flag('screen', f, 'missing-tokens-v2', 'high', 'design', 'לא טוען tokens.css?v=2');
  // C2 — hex גולמי ב-background/color (לא כ-fallback ב-var, לא ב-SVG)
  const styleOnly = html.split(/<svg[\s\S]*?<\/svg>/gi).join(' ');
  const rawHex = (styleOnly.match(/(background|color)\s*:\s*#[0-9a-fA-F]{3,6}/g) || []).length;
  if (rawHex > 0) flag('screen', f, 'raw-hex', 'high', 'design', `${rawHex} צבעי-hex גולמיים ב-background/color`);
  // C3 — פלטה מקומית שדורסת טוקנים
  if (/:root\s*\{[^}]*--teal/.test(html)) flag('screen', f, 'local-palette', 'high', 'design', 'בלוק :root{--teal…} מקומי דורס טוקנים');
  // C4 — אימוג'י ציורי (לא SVG)
  const textOnly = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g,' ');
  if (EMOJI.test(textOnly)) flag('screen', f, 'emoji', 'high', 'design', 'אימוג\'י ציורי בטקסט (כלל: SVG בלבד)');
  // C5 — צבע-פעולה לפי שכבה (פטל/דיו): מסך מעטפת עם var(--brand) על כפתור = טורקיז דקורטיבי
  if (isShell && /\.btn[^{]*\{[^}]*var\(--brand\)/.test(html))
    flag('screen', f, 'action-color-layer', 'high', 'design', 'שכבת-מעטפת: כפתור עם var(--brand) — צריך פטל (--action/--shell)');
  // C6 — גופן Rubik (במקום Heebo)
  if (/Rubik/.test(html)) flag('screen', f, 'wrong-font', 'low', 'design', 'משתמש ב-Rubik (הסטנדרט: Heebo)');
  // C7 — RTL
  if (!/dir="rtl"/.test(html) || !/lang="he"/.test(html)) flag('screen', f, 'missing-rtl', 'med', 'design', 'חסר dir="rtl" או lang="he"');
}

/* ============================================================
   סיכום + דוח
   ============================================================ */
const byCheck = {};
findings.forEach(fd => {
  byCheck[fd.check] = byCheck[fd.check] || { check: fd.check, severity: fd.severity, category: fd.category, count: 0, samples: [] };
  byCheck[fd.check].count++;
  if (byCheck[fd.check].samples.length < 5) byCheck[fd.check].samples.push(fd.id);
});
const summary = Object.values(byCheck).sort((a,b) =>
  ({high:0,med:1,low:2}[a.severity]-{high:0,med:1,low:2}[b.severity]) || (b.count-a.count));

const report = {
  ranAt: 'stamp-after-run',
  totals: { units: Object.keys(CONTENT).length, screens: screenFiles().length, findings: findings.length },
  bySeverity: {
    high: findings.filter(f=>f.severity==='high').length,
    med:  findings.filter(f=>f.severity==='med').length,
    low:  findings.filter(f=>f.severity==='low').length
  },
  summary,
  findings
};
fs.writeFileSync(path.join(ROOT, 'qa-report.json'), JSON.stringify(report, null, 2), 'utf8');
// גרסת-דפדפן: נטענת ב-content-admin (טאב 5) דרך <script>. file:// חוסם fetch(json).
fs.writeFileSync(path.join(ROOT, 'qa-report.js'),
  'window.RETZEF_QA = ' + JSON.stringify(report) + ';\n', 'utf8');

console.log('=== רֶצֶף QA — שכבה 1 (דטרמיניסטית) ===');
console.log(`יחידות: ${report.totals.units} · מסכים: ${report.totals.screens} · ממצאים: ${report.totals.findings}`);
console.log(`חומרה — גבוה: ${report.bySeverity.high} · בינוני: ${report.bySeverity.med} · נמוך: ${report.bySeverity.low}`);
console.log('\nלפי בדיקה (severity · category · count · דוגמאות):');
summary.forEach(s => {
  console.log(`  [${s.severity.toUpperCase().padEnd(4)}] ${s.check.padEnd(26)} ${String(s.count).padStart(4)}  (${s.category})  ${s.samples.slice(0,3).join(', ')}`);
});
console.log('\nנכתב: qa-report.json');
