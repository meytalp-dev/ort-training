// Export EVENTS from gantt.html to CSV for Google Sheets import
const fs = require('fs');
const path = require('path');

const HTML_PATH = path.join(__dirname, 'gantt.html');
const CSV_PATH = path.join(__dirname, 'gantt.csv');

const html = fs.readFileSync(HTML_PATH, 'utf8');

// Extract EVENTS array body
const m = html.match(/const EVENTS = \[([\s\S]*?)\n\];/);
if (!m) {
  console.error('Could not find EVENTS array in gantt.html');
  process.exit(1);
}
const EVENTS = eval('[' + m[1] + ']');

// Hebrew day names (Sunday = 0)
const DAYS_HE = ['יום א\'', 'יום ב\'', 'יום ג\'', 'יום ד\'', 'יום ה\'', 'יום ו\'', 'שבת'];
const MONTHS_HE = ['', 'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

// Dimension mapping by date (mirrors getDim in gantt.html)
function getDim(dt) {
  const m = dt.getMonth(), y = dt.getFullYear();
  if (y === 2026 && (m === 8 || m === 9)) return 'שייכות';
  if (y === 2026 && (m === 10 || m === 11)) return 'כבוד';
  if (y === 2027 && (m === 0 || m === 1)) return 'מוטיבציה פנימית';
  if (y === 2027 && (m === 2 || m === 3)) return 'מסוגלות ומימוש עצמי';
  if (y === 2027 && (m === 4 || m === 5)) return 'אוטונומיה';
  return '';
}

// Event type by CSS class
const TYPE_BY_CLS = {
  'c-teal': 'שייכות / פתיחה',
  'c-purple': 'כבוד / יום שיא',
  'c-orange': 'מוטיבציה פנימית',
  'c-red': 'מסוגלות',
  'c-green': 'אוטונומיה',
  'c-gold': 'לוח עברי / הפסקה פעילה',
  'c-pink': 'פולס',
  'c-blue': 'בגרות',
  'c-deep-cyan': 'אסיפת הורים',
  'c-lime': 'תעודות',
  'c-deep-red': 'בחינת גמר',
};

// CSV escape: wrap in quotes, double internal quotes
function csv(v) {
  if (v === undefined || v === null) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// Sort events by start date, then title
const sorted = [...EVENTS].sort((a, b) => {
  if (a.date !== b.date) return a.date.localeCompare(b.date);
  return (a.title || '').localeCompare(b.title || '', 'he');
});

// Build rows
const headers = [
  '#',
  'תאריך התחלה',
  'תאריך סיום',
  'יום',
  'חודש',
  'ממד',
  'סוג אירוע',
  'כותרת',
  'אחראי',
  'יעד',
  'הכנה',
  'עלות',
  'הערות'
];

const rows = [headers.map(csv).join(',')];

sorted.forEach((ev, i) => {
  const start = new Date(ev.date);
  const dayName = DAYS_HE[start.getDay()];
  const monthName = MONTHS_HE[start.getMonth() + 1];
  const dim = getDim(start);
  const type = TYPE_BY_CLS[ev.cls] || '';
  rows.push([
    i + 1,
    ev.date,
    ev.endDate || '',
    dayName,
    monthName + ' ' + start.getFullYear(),
    dim,
    type,
    ev.title || '',
    ev.responsible || '',
    ev.target || '',
    ev.prep || '',
    ev.cost || '',
    ev.notes || ''
  ].map(csv).join(','));
});

// UTF-8 BOM for Excel/Sheets to detect Hebrew correctly
const BOM = '﻿';
fs.writeFileSync(CSV_PATH, BOM + rows.join('\r\n'), 'utf8');

console.log(`Wrote ${sorted.length} rows to ${CSV_PATH}`);
