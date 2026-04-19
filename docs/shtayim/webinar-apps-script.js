/**
 * Google Apps Script — שתיים | רישום לוובינר 27.4.2026
 * ═══════════════════════════════════════════════════
 *
 * הוראות התקנה:
 *   1. צרי Google Sheet חדש בשם "שתיים — רישום וובינר"
 *   2. Extensions > Apps Script
 *   3. הדביקי את הקוד הזה בקובץ Code.gs (מחקי את מה שיש)
 *   4. הריצי setupSheet() פעם אחת (Run > setupSheet)
 *   5. Deploy > New deployment > Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   6. העתיקי את ה-URL ושלחי לי — אעדכן בדף הנחיתה
 */

// ============================================================
//  Web App endpoint
// ============================================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('רישומים') || ss.getSheets()[0];

    // בדיקת כפילות לפי מייל
    const existing = sheet.getDataRange().getValues();
    const emailCol = 2; // עמודה B = מייל
    for (let i = 1; i < existing.length; i++) {
      if (String(existing[i][emailCol]).trim().toLowerCase() === String(data.email).trim().toLowerCase()) {
        return respond({ ok: true, duplicate: true, message: 'כבר נרשמת!' });
      }
    }

    // הוספת שורה חדשה
    const now = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'dd/MM/yyyy HH:mm');
    sheet.appendRow([
      data.name || '',
      data.email || '',
      data.org || '',
      data.role || '',
      now,
      'נרשם/ה'
    ]);

    // שליחת מייל אישור
    try {
      MailApp.sendEmail({
        to: data.email,
        subject: 'שתיים × Claude Code — נרשמת לוובינר 27.4!',
        htmlBody: confirmationEmail_(data.name)
      });
    } catch (mailErr) {
      // לא קריטי — הרישום נשמר גם בלי מייל
      Logger.log('שגיאת מייל: ' + mailErr.message);
    }

    return respond({ ok: true, saved: true });
  } catch (err) {
    return respond({ ok: false, error: err.message });
  }
}

function doGet(e) {
  const action = (e.parameter.action || 'count');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('רישומים') || ss.getSheets()[0];

  if (action === 'count') {
    const count = Math.max(0, sheet.getLastRow() - 1);
    return respond({ ok: true, count: count });
  }

  if (action === 'list') {
    const data = sheet.getDataRange().getValues();
    const registrations = data.slice(1).map(r => ({
      name: r[0], email: r[1], org: r[2], role: r[3], date: r[4], status: r[5]
    }));
    return respond({ ok: true, registrations: registrations, count: registrations.length });
  }

  return respond({ ok: true, count: Math.max(0, sheet.getLastRow() - 1) });
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
//  מייל אישור
// ============================================================

function confirmationEmail_(name) {
  return `
  <div dir="rtl" style="font-family:Heebo,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#fff;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#7B5EA7;"></span>
      <span style="display:inline-block;width:20px;height:3px;background:linear-gradient(90deg,#7B5EA7,#E8836B);border-radius:2px;margin:0 6px;vertical-align:middle;"></span>
      <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#E8836B;"></span>
    </div>
    <h2 style="text-align:center;font-size:24px;color:#2D2B3A;margin-bottom:8px;">נרשמת בהצלחה!</h2>
    <p style="text-align:center;font-size:15px;color:#6B6980;line-height:1.8;">
      שלום ${name || ''},<br>
      נרשמת לוובינר <strong>שתיים × Claude Code</strong>
    </p>
    <div style="background:#F3EEF9;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
      <div style="font-size:13px;color:#7B5EA7;font-weight:700;letter-spacing:2px;margin-bottom:8px;">פרטי האירוע</div>
      <div style="font-size:18px;color:#2D2B3A;font-weight:700;">ראשון 27.4.2026 &middot; 20:00</div>
      <div style="font-size:13px;color:#6B6980;margin-top:4px;">זום &middot; 45 דקות + שאלות &middot; מוקלט</div>
    </div>
    <p style="font-size:14px;color:#6B6980;line-height:1.8;text-align:center;">
      קישור לזום יישלח אליך ביום האירוע.<br>
      נתראה!<br><br>
      <strong style="color:#2D2B3A;">מיטל ולירון — שתיים</strong>
    </p>
  </div>`;
}

// ============================================================
//  התקנה ראשונית — הריצי פעם אחת
// ============================================================

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName('רישומים');
  if (!sheet) {
    sheet = ss.insertSheet('רישומים');
  } else {
    sheet.clear();
  }

  const headers = ['שם', 'מייל', 'עמותה', 'תפקיד', 'תאריך רישום', 'סטטוס'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#F3EEF9')
    .setFontColor('#5A3D8A');

  sheet.setColumnWidth(1, 180); // שם
  sheet.setColumnWidth(2, 250); // מייל
  sheet.setColumnWidth(3, 200); // עמותה
  sheet.setColumnWidth(4, 150); // תפקיד
  sheet.setColumnWidth(5, 160); // תאריך
  sheet.setColumnWidth(6, 100); // סטטוס

  sheet.setFrozenRows(1);

  // מחיקת גיליון ברירת מחדל
  const def = ss.getSheetByName('Sheet1') || ss.getSheetByName('גיליון1');
  if (def && ss.getSheets().length > 1) {
    try { ss.deleteSheet(def); } catch(e) {}
  }

  Logger.log('גיליון "רישומים" מוכן! עכשיו: Deploy > New deployment > Web app');
}
