/**
 * Google Apps Script — מערכת הזמנות הדר בק (רמה 1)
 *
 * מטפל ב-6 פעולות (action=...):
 *   1. submit          — שמירת הזמנה חדשה
 *   2. busy_times      — החזרת שעות תפוסות לתאריך (ציבורי, לא חושף פרטים)
 *   3. list            — טבלת כל ההזמנות (אדמין, דורש PIN)
 *   4. update_status   — עדכון סטטוס הזמנה (אדמין, דורש PIN)
 *   5. days_off        — החזרת ימי חופש (ציבורי)
 *   6. set_day_off     — הוספה/הסרה של יום חופש (אדמין, דורש PIN)
 *
 * ============================================================
 * הוראות התקנה (פעם אחת):
 * ============================================================
 *
 * 1. צור Google Sheet חדש בשם "הזמנות הדר"
 *
 * 2. צור 2 גיליונות (Tabs בתחתית):
 *    "הזמנות"  ← שורה 1: id | תאריך_שליחה | שם | טלפון | שירות | משך_דקות | תאריך_פגישה | שעה_פגישה | הערות | סטטוס
 *    "ימי_חופש" ← שורה 1: תאריך | סיבה
 *
 * 3. Extensions → Apps Script
 *    מחק את כל הקוד והדבק את הקובץ הזה
 *
 * 4. עדכן את 2 הקבועים למטה:
 *    - ADMIN_PIN  — סיסמת הדר לכניסה לאדמין (4-8 ספרות)
 *    - HADAR_EMAIL — מייל להתראות (אופציונלי, השאר ריק = לא לשלוח)
 *
 * 5. שמור (Ctrl+S), שם פרויקט: "Hadar Booking v2"
 *
 * 6. Deploy → New deployment → Type: Web app
 *    Execute as: Me · Who has access: Anyone
 *    אשר הרשאות (Advanced → Allow)
 *
 * 7. העתק את ה-URL (מסתיים ב-/exec)
 *
 * 8. הדבק את ה-URL בשני המקומות:
 *    - booking.html   → const SHEETS_URL = '...';
 *    - admin.html     → const SHEETS_URL = '...';
 *
 * 9. ⚠️ כל שינוי בקוד דורש Deploy → Manage deployments → עיפרון → Version: New
 *    אחרת השינוי לא יופיע!
 *
 * ============================================================
 */

const ADMIN_PIN  = '1234';   // ⚠️ שנה לסיסמה של הדר!
const HADAR_EMAIL = '';      // למשל 'hadar@gmail.com', השאר ריק כדי לא לשלוח מייל

// ---- Sheets helpers ----
function ssBookings()  { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('הזמנות'); }
function ssDaysOff()   { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ימי_חופש'); }

function safe(val, maxLen) {
  var s = (val == null) ? '' : String(val);
  return s.substring(0, maxLen || 500);
}

function jsonp(callback, obj) {
  var name = String(callback || 'callback').replace(/[^a-zA-Z0-9_]/g, '');
  var json = JSON.stringify(obj);
  return ContentService
    .createTextOutput(name + '(' + json + ')')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function ok(callback, data)   { return jsonp(callback, Object.assign({ result: 'success' }, data || {})); }
function err(callback, msg)   { return jsonp(callback, { result: 'error', message: String(msg).substring(0, 200) }); }

// ============================================================
// Router
// ============================================================
function doGet(e) {
  var p = e.parameter;
  var cb = p.callback;
  try {
    var action = p.action || 'submit';
    if (action === 'submit')        return submitBooking(p, cb);
    if (action === 'busy_times')    return getBusyTimes(p, cb);
    if (action === 'days_off')      return getDaysOff(p, cb);
    if (action === 'list')          return listBookings(p, cb);
    if (action === 'update_status') return updateStatus(p, cb);
    if (action === 'set_day_off')   return setDayOff(p, cb);
    return err(cb, 'unknown action: ' + action);
  } catch (e) {
    return err(cb, e.toString());
  }
}

// ============================================================
// 1. submit — שמירת הזמנה חדשה
// ============================================================
function submitBooking(p, cb) {
  var sheet = ssBookings();
  if (!sheet) return err(cb, 'sheet "הזמנות" not found');

  var id       = 'B' + Date.now() + Math.floor(Math.random() * 1000);
  var ts       = p.timestamp || new Date().toISOString();
  var name     = safe(p.name, 100);
  var phone    = safe(p.phone, 20);
  var service  = safe(p.service, 80);
  var duration = safe(p.duration, 5);
  var date     = safe(p.date, 20);
  var time     = safe(p.time, 10);
  var notes    = safe(p.notes, 500);

  sheet.appendRow([id, ts, name, phone, service, duration, date, time, notes, 'חדש']);

  if (HADAR_EMAIL) {
    try {
      MailApp.sendEmail({
        to: HADAR_EMAIL,
        subject: '🌿 הזמנת תור חדשה — ' + name,
        body:
          'התקבלה הזמנת תור חדשה דרך האתר:\n\n' +
          '👤 שם: ' + name + '\n' +
          '📱 טלפון: ' + phone + '\n' +
          '🪷 טיפול: ' + service + ' (' + duration + ' דק׳)\n' +
          '📅 תאריך: ' + date + '\n' +
          '🕒 שעה: ' + time + '\n' +
          (notes ? '📝 הערות: ' + notes + '\n' : '') +
          '\nכניסה לאדמין לאישור: בדף admin.html'
      });
    } catch (e) {}
  }

  return ok(cb, { id: id });
}

// ============================================================
// 2. busy_times — שעות תפוסות לתאריך (ציבורי)
// פורמט: ?action=busy_times&date=2026-05-10
// חסימה מיידית: כל סטטוס מלבד "נדחה" חוסם את השעה.
//   - "חדש"  = הזמנה ממתינה לאישור הדר → השעה תפוסה (הראשונה תופסת)
//   - "אושר" = הדר אישרה → השעה תפוסה
//   - "בוצע" = הטיפול התקיים → השעה תפוסה (היסטוריה)
//   - "נדחה" = הדר דחתה → השעה משתחררת
// ============================================================
function getBusyTimes(p, cb) {
  var sheet = ssBookings();
  if (!sheet) return ok(cb, { times: [] });
  var date = safe(p.date, 20);
  if (!date) return err(cb, 'date required');

  var data = sheet.getDataRange().getValues();
  var times = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rowDate   = String(row[6]); // עמודה G
    var rowTime   = String(row[7]); // עמודה H
    var rowStatus = String(row[9]); // עמודה J
    if (rowDate === date && rowStatus !== 'נדחה') {
      times.push(rowTime);
    }
  }
  return ok(cb, { times: times });
}

// ============================================================
// 3. days_off — ימי חופש (ציבורי)
// ============================================================
function getDaysOff(p, cb) {
  var sheet = ssDaysOff();
  if (!sheet) return ok(cb, { dates: [] });
  var data = sheet.getDataRange().getValues();
  var dates = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) dates.push(String(data[i][0]));
  }
  return ok(cb, { dates: dates });
}

// ============================================================
// 4. list — כל ההזמנות (אדמין, PIN)
// ============================================================
function listBookings(p, cb) {
  if (p.pin !== ADMIN_PIN) return err(cb, 'unauthorized');
  var sheet = ssBookings();
  if (!sheet) return ok(cb, { bookings: [] });

  var data = sheet.getDataRange().getValues();
  var bookings = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    bookings.push({
      id: r[0], submitted: r[1], name: r[2], phone: r[3],
      service: r[4], duration: r[5], date: r[6], time: r[7],
      notes: r[8], status: r[9]
    });
  }
  // Newest first
  bookings.sort(function(a,b){ return String(b.submitted).localeCompare(String(a.submitted)); });
  return ok(cb, { bookings: bookings });
}

// ============================================================
// 5. update_status — עדכון סטטוס (אדמין, PIN)
// ?action=update_status&pin=...&id=B...&status=אושר|נדחה|בוצע|חדש
// ============================================================
function updateStatus(p, cb) {
  if (p.pin !== ADMIN_PIN) return err(cb, 'unauthorized');
  var id     = safe(p.id, 60);
  var status = safe(p.status, 20);
  if (!id || !status) return err(cb, 'id and status required');
  var allowed = ['חדש','אושר','נדחה','בוצע'];
  if (allowed.indexOf(status) === -1) return err(cb, 'invalid status');

  var sheet = ssBookings();
  var data  = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 10).setValue(status); // עמודה J
      return ok(cb, { id: id, status: status });
    }
  }
  return err(cb, 'id not found');
}

// ============================================================
// 6. set_day_off — הוספה/הסרה של יום חופש (אדמין, PIN)
// ?action=set_day_off&pin=...&date=2026-05-15&reason=...&op=add|remove
// ============================================================
function setDayOff(p, cb) {
  if (p.pin !== ADMIN_PIN) return err(cb, 'unauthorized');
  var date = safe(p.date, 20);
  var op   = safe(p.op, 10) || 'add';
  if (!date) return err(cb, 'date required');

  var sheet = ssDaysOff();
  if (!sheet) return err(cb, 'sheet "ימי_חופש" not found');

  var data = sheet.getDataRange().getValues();
  // search for existing
  var rowIdx = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === date) { rowIdx = i + 1; break; }
  }

  if (op === 'remove') {
    if (rowIdx > 0) sheet.deleteRow(rowIdx);
    return ok(cb, { date: date, op: 'removed' });
  }
  // op = add
  if (rowIdx === -1) {
    sheet.appendRow([date, safe(p.reason, 100)]);
  }
  return ok(cb, { date: date, op: 'added' });
}
