/**
 * Apps Script — קבלת תשובות שאלון "היום שלך במערכת"
 * ושמירה ל-Google Sheet
 *
 * הוראות התקנה:
 * 1. צור Google Sheet חדש בשם "מיפוי שימוש - מערכות פדגוגיות"
 * 2. עבור ל-Extensions → Apps Script
 * 3. הדבק את הקוד הזה
 * 4. החלף את SHEET_ID ב-ID של הגיליון שלך
 * 5. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. העתק את ה-URL וההחלף ב-APPS_SCRIPT_URL בקובץ index.html
 */

const SHEET_ID = 'YOUR_SHEET_ID_HERE'; // ← להחליף
const SHEET_NAME = 'תשובות';

const HEADERS = [
  'תאריך',
  'תפקיד',
  'שלב חינוך',
  'גודל בי"ס',
  'נוכחות',
  'ציונים',
  'הורים',
  'מערכת שעות',
  'דוחות',
  'תכנון',
  'משמעת',
  'מחוץ למערכת',
  'דקות ביום',
  'דיוקן',
  'שם',
  'מייל',
  'מקור'
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    sheet.appendRow([
      new Date(data.timestamp),
      roleLabel(data.role),
      stageLabel(data.stage),
      sizeLabel(data.schoolSize),
      freqLabel(data.modules.attendance),
      freqLabel(data.modules.grades),
      freqLabel(data.modules.parents),
      freqLabel(data.modules.timetable),
      freqLabel(data.modules.reports),
      freqLabel(data.modules.planning),
      freqLabel(data.modules.discipline),
      (data.outsideSystem || []).join(' | '),
      data.minutesPerDay,
      personaLabel(data.persona),
      data.name || '(אנונימי)',
      data.email || '',
      data.referrer || 'direct'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Use POST to submit' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#EDE5FA')
      .setHorizontalAlignment('right');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function roleLabel(v) {
  return { principal: 'מנהל/ת', vice: 'סגן/ית', coord: 'רכז/ת', teacher: 'מורה' }[v] || v;
}

function stageLabel(v) {
  return { elementary: 'יסודי', middle: 'חט"ב', high: 'תיכון', mixed: 'משולב' }[v] || v;
}

function sizeLabel(v) {
  return { xs: 'עד 300', s: '300-600', m: '600-900', l: 'מעל 900' }[v] || v;
}

function freqLabel(v) {
  return {
    daily: 'כל יום',
    often: 'כמה פעמים בשבוע',
    weekly: 'פעם בשבוע',
    rare: 'פחות',
    never: 'לא משתמש'
  }[v] || '—';
}

function personaLabel(v) {
  return {
    contact: 'איש הקשר',
    documenter: 'המתעד',
    strategist: 'האסטרטג',
    pragmatist: 'הפרגמטי',
    adaptive: 'המסתגל',
    swift: 'הזריז',
    mentor: 'המנטור',
    starter: 'המתחיל',
    routine: 'השגרתי'
  }[v] || v;
}
