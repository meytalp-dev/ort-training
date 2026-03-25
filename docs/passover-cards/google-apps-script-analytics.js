/**
 * Google Apps Script - Passover Cards Analytics
 *
 * הוראות התקנה:
 * 1. פתחו Google Sheet חדש בשם "אנליטיקס - גלויות פסח"
 * 2. בשורה הראשונה הוסיפו כותרות: תאריך | אירוע | פרטים | מכשיר | זמן_שהייה
 * 3. לחצו על Extensions → Apps Script
 * 4. העתיקו את הקוד הזה לתוך הקובץ
 * 5. לחצו Deploy → New deployment → Web app
 * 6. בחרו: Execute as = Me, Who has access = Anyone
 * 7. העתיקו את ה-URL שקיבלתם
 * 8. הדביקו את ה-URL בקובץ index.html במקום ANALYTICS_SCRIPT_URL
 */

function doGet(e) {
  var params = e.parameter;
  var callback = params.callback || 'cb';

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    sheet.appendRow([
      new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
      params.event || '',
      params.details || '',
      params.device || '',
      params.duration || ''
    ]);

    return ContentService
      .createTextOutput(callback + '({"result":"ok"})')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (err) {
    return ContentService
      .createTextOutput(callback + '({"result":"error"})')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}
