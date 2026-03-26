/**
 * Google Apps Script - Vienna Delegation Registration Handler
 *
 * הוראות התקנה:
 * 1. פתחו Google Sheet חדש בשם "הרשמה משלחת וינה"
 * 2. בשורה הראשונה הוסיפו את הכותרות (ראו למטה)
 * 3. לחצו על Extensions → Apps Script
 * 4. העתיקו את הקוד הזה לתוך הקובץ
 * 5. לחצו Deploy → New deployment → Web app
 * 6. בחרו: Execute as = Me, Who has access = Anyone
 * 7. העתיקו את ה-URL שקיבלתם
 * 8. הדביקו את ה-URL בקובץ vienna-delegation.html במקום 'YOUR_GOOGLE_APPS_SCRIPT_URL'
 *
 * כותרות הגיליון (שורה 1):
 * תאריך | שם מלא | תעודת זהות | דרכון בתוקף | תפוגת דרכון | רמת אנגלית | מוטיבציה | התחייבות
 */

function safe(val, maxLen) {
  var s = val || '';
  return s.substring(0, maxLen || 500);
}

function doGet(e) {
  var params = e.parameter;
  var callback = (params.callback || 'callback').replace(/[^a-zA-Z0-9_]/g, '');

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    sheet.appendRow([
      params.timestamp || new Date().toISOString(),
      safe(params.full_name, 100),
      safe(params.id_number, 9),
      safe(params.passport_valid, 10),
      safe(params.passport_expiry, 20),
      safe(params.english_level, 20),
      safe(params.motivation, 2000),
      safe(params.commitment, 10)
    ]);

    return ContentService
      .createTextOutput(callback + '({"result":"success","message":"saved"})')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    var safeError = error.toString().replace(/["\\\n\r]/g, ' ').substring(0, 200);
    return ContentService
      .createTextOutput(callback + '({"result":"error","message":"' + safeError + '"})')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}
