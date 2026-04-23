/**
 * יצירת Google Sheet עם כל מענים לאוטיזם — 9 טאבים מתוך GitHub
 * הוראות: script.google.com → New project → מדביקים קוד → ⏵ Run → buildSheet
 */

const BASE = 'https://meytalp-dev.github.io/ort-training/autism/oti/data/csv/';

const SHEETS = [
  { name: 'הכול',              file: 'all.csv' },
  { name: 'מסגרות חינוך',      file: 'education.csv' },
  { name: 'טיפולים ומטפלים',   file: 'therapists.csv' },
  { name: 'אבחון והערכה',      file: 'diagnosis.csv' },
  { name: 'שירותים לבוגרים',   file: 'adults.csv' },
  { name: 'זכויות ורווחה',     file: 'rights.csv' },
  { name: 'ארגונים ועמותות',   file: 'orgs.csv' },
  { name: 'קייטנות ופנאי',     file: 'camps.csv' },
  { name: 'ציוד ועזרים',       file: 'equipment.csv' },
];

function buildSheet() {
  const ss = SpreadsheetApp.create('מענים לאוטיזם — מחולץ מצ\'אטים');

  // מחיקת הטאב הדיפולטי אחרי שנוסיף אחד חדש
  const defaultSheet = ss.getSheets()[0];

  SHEETS.forEach((tab, i) => {
    const csv = UrlFetchApp.fetch(BASE + encodeURIComponent(tab.file)).getContentText();
    const data = Utilities.parseCsv(csv);
    const sheet = (i === 0) ? defaultSheet : ss.insertSheet();
    sheet.setName(tab.name);
    if (data.length) {
      sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, data[0].length)
        .setFontWeight('bold')
        .setBackground('#3f7c8c')
        .setFontColor('#ffffff');
      sheet.setRightToLeft(true);
      sheet.autoResizeColumns(1, data[0].length);
    }
  });

  const url = ss.getUrl();
  Logger.log('נוצר: ' + url);
  return url;
}
