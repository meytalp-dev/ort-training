/**
 * Edura Analytics — Google Apps Script web app
 * Pattern matches docs/passover-cards/google-apps-script-analytics.js
 *
 * SETUP:
 * 1. Create a new Google Sheet, name it "Edura Analytics"
 * 2. Add this header row in row 1:
 *      תאריך | אירוע | פרטים | עמוד | מכשיר | session | זמן_שניות | מקור
 * 3. Extensions → Apps Script
 * 4. Paste this entire file. Save.
 * 5. Deploy → New deployment → Web app
 *      Execute as: Me
 *      Who has access: Anyone
 * 6. Copy the Web app URL.
 * 7. Open docs/edura/analytics.js, replace PASTE_YOUR_APPS_SCRIPT_URL_HERE with the URL.
 * 8. Commit + push. Done.
 */

function doGet(e) {
  var params = (e && e.parameter) || {};
  var callback = params.callback || 'cb';

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([
      new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
      params.event || '',
      params.details || '',
      params.page || '',
      params.device || '',
      params.session || '',
      params.duration || '',
      params.referrer || ''
    ]);

    return ContentService
      .createTextOutput(callback + '({"result":"ok"})')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch (err) {
    return ContentService
      .createTextOutput(callback + '({"result":"error","msg":"' + String(err).replace(/"/g, '\\"') + '"})')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// sendBeacon hits doPost — handle the same way
function doPost(e) {
  return doGet(e);
}
