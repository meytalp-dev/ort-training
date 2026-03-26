/**
 * Google Apps Script - Newsletter Signup Handler
 *
 * הוראות התקנה:
 * 1. פתחו Google Sheet חדש בשם "תפוצת מייל - Learni"
 * 2. בשורה הראשונה הוסיפו כותרות: תאריך | שם | אימייל | ארגון | תפקיד
 * 3. לחצו על Extensions → Apps Script
 * 4. העתיקו את הקוד הזה לתוך הקובץ
 * 5. לחצו Deploy → New deployment → Web app
 * 6. בחרו: Execute as = Me, Who has access = Anyone
 * 7. העתיקו את ה-URL שקיבלתם
 * 8. הדביקו את ה-URL בקובץ index.html במקום 'YOUR_GOOGLE_APPS_SCRIPT_URL'
 */

function doGet(e) {
  var params = e.parameter;
  var callback = params.callback;

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Check for duplicate email
    var data = sheet.getDataRange().getValues();
    var emailCol = 2; // Column C (0-indexed)
    for (var i = 1; i < data.length; i++) {
      if (data[i][emailCol] === params.email) {
        return ContentService
          .createTextOutput(callback + '({"result":"success","message":"already_registered"})')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
    }

    // Add new row
    sheet.appendRow([
      params.date || new Date().toISOString(),
      params.name || '',
      params.email || '',
      params.org || '',
      params.role || ''
    ]);

    return ContentService
      .createTextOutput(callback + '({"result":"success","message":"registered"})')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    return ContentService
      .createTextOutput(callback + '({"result":"error","message":"' + error.toString() + '"})')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}
