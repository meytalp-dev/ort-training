/**
 * Google Apps Script — מערכת ניהול התורים של הדר בק (v3)
 * ============================================================
 *
 * קובץ אחד שמשמש שרת לכל המערכת (booking.html · health.html · admin.html).
 * עובד מעל Google Sheet אחד עם 5 גיליונות (Tabs) + יומן Google של הדר.
 *
 * פעולות (action=...):
 *   ── ציבורי (ללא PIN) ──
 *   submit              שמירת בקשת תור חדשה (+ עדכון מאגר לקוחות + הודעת WhatsApp "התקבל")
 *   busy_times          השעות התפוסות לתאריך (כולל חלון 60 דק׳ + 15 דק׳ מרווח)
 *   days_off            ימים חסומים
 *   submit_health       שמירת הצהרת בריאות (+ קישור לתור אם נמסר booking_id)
 *
 *   ── אדמין (דורש pin) ──
 *   list                כל ההזמנות
 *   update_status       אישור / דחיה / בוצע  (אישור = יוצר אירוע ביומן + שולח WhatsApp)
 *   reschedule          שינוי מועד תור — בלי ליצור הצהרת בריאות חדשה
 *   set_day_off         חסימה / שחרור של יום שלם
 *   get_health          הצהרת בריאות מלאה (לכפתור "צפייה בטופס מלא")
 *   clients             מאגר הלקוחות (לתפוצת WhatsApp)
 *   save_client         הוספה / עדכון לקוחה ידנית
 *   delete_client       מחיקת לקוחה
 *   patient_records     תיק מטופל — כל הרשומות של לקוחה (לפי טלפון)
 *   save_patient_record הוספה / עדכון רשומת טיפול (תאריך · סיבת פנייה · סיכום)
 *   delete_patient_record  מחיקת רשומת טיפול
 *   send_reminders      שליחה ידנית של תזכורות 24 שעות (גם רץ אוטומטית בטריגר)
 *
 * ============================================================
 * התקנה (פעם אחת)
 * ============================================================
 * 1. צור Google Sheet בשם "הזמנות הדר".
 * 2. צור את הגיליונות (Tabs). שורת כותרת בכל אחד:
 *
 *    "הזמנות"
 *      id | תאריך_שליחה | שם | טלפון | שירות | משך_דקות | תאריך_פגישה | שעה_פגישה | הערות | סטטוס | health_id | calendar_event_id | תזכורת_נשלחה
 *
 *    "ימי_חופש"
 *      תאריך | סיבה
 *
 *    "הצהרות_בריאות"      (נוצר אוטומטית אם חסר)
 *      id | תאריך_שליחה | שם | טלפון | גיל | תאריך_טיפול | דגלים | הערות | אישור | answers_json
 *
 *    "לקוחות"             (נוצר אוטומטית אם חסר)
 *      טלפון | שם | גיל | תאריך_הצטרפות | מספר_טיפולים | תאריך_אחרון | תיוג | הערות
 *
 *    "תיק_מטופל"          (נוצר אוטומטית אם חסר)
 *      id | טלפון | שם | תאריך_טיפול | סיבת_פנייה | סיכום_טיפול | תאריך_עדכון
 *
 * 3. File → Project Settings → Time zone: (GMT+02:00) Jerusalem.  ← חשוב ליומן ולתזכורות!
 *
 * 4. Extensions → Apps Script → הדבק את כל הקובץ הזה.
 *    עדכן את הקבועים למטה (PIN, מייל, ואם רוצים — Green API).
 *
 * 5. Deploy → New deployment → Web app · Execute as: Me · Who has access: Anyone.
 *    אשר הרשאות (Advanced → Allow). העתק את ה-URL (מסתיים ב-/exec).
 *
 * 6. הדבק את ה-URL ב-booking.html · health.html · admin.html  (const SHEETS_URL).
 *
 * 7. תזכורות 24 שעות:  Triggers (השעון בצד) → Add Trigger →
 *      Function: dailyReminders · Event: Time-driven · Day timer · 8am–9am.
 *
 * 8. ⚠️ כל שינוי בקוד דורש Deploy → Manage deployments → עיפרון → New version.
 * ============================================================
 */

// ============================================================
// 🔧 הגדרות
// ============================================================
const ADMIN_PIN   = '1234';        // ⚠️ להחליף לפני מסירה להדר
const HADAR_EMAIL = '';            // ריק = ללא מיילים. למשל 'hadarback2@gmail.com'

const CLINIC_ADDRESS = 'וינגייט 74, דירה 24, קומה 6, קוד כניסה 3740, באר שבע';
const TREATMENT_MIN  = 60;         // משך טיפול סטנדרטי
const BUFFER_MIN     = 15;         // מרווח קבוע בין מטופלות

// ── WhatsApp ──
// 'manual'  = המערכת לא שולחת לבד. האדמין מקבל כפתור WhatsApp מוכן ללחיצה,
//             וההודעות האוטומטיות (התקבל/תזכורת) מרוכזות במייל להדר ללחיצה.
// 'greenapi'= שליחה אוטומטית אמיתית דרך Green API (חינמי בסיסי, דורש סריקת QR פעם אחת).
const WA_PROVIDER       = 'manual';
const GREENAPI_INSTANCE = '';      // למשל '1101000001'
const GREENAPI_TOKEN    = '';      // ה-API token מ-green-api.com
// ============================================================

// ---- Sheets helpers ----
function ss() { return SpreadsheetApp.getActiveSpreadsheet(); }
function ssBookings() { return ss().getSheetByName('הזמנות'); }
function ssDaysOff()  { return ss().getSheetByName('ימי_חופש'); }

function ssHealth() {
  var s = ss().getSheetByName('הצהרות_בריאות');
  if (!s) { s = ss().insertSheet('הצהרות_בריאות');
    s.appendRow(['id','תאריך_שליחה','שם','טלפון','גיל','תאריך_טיפול','דגלים','הערות','אישור','answers_json']); }
  return s;
}
function ssClients() {
  var s = ss().getSheetByName('לקוחות');
  if (!s) { s = ss().insertSheet('לקוחות');
    s.appendRow(['טלפון','שם','גיל','תאריך_הצטרפות','מספר_טיפולים','תאריך_אחרון','תיוג','הערות']); }
  return s;
}
function ssPatient() {
  var s = ss().getSheetByName('תיק_מטופל');
  if (!s) { s = ss().insertSheet('תיק_מטופל');
    s.appendRow(['id','טלפון','שם','תאריך_טיפול','סיבת_פנייה','סיכום_טיפול','תאריך_עדכון']); }
  return s;
}

function safe(val, maxLen) {
  var s = (val == null) ? '' : String(val);
  return s.substring(0, maxLen || 500);
}
function normPhone(p) { // מפתח אחיד למאגר הלקוחות: רק ספרות
  return String(p == null ? '' : p).replace(/\D/g, '');
}
function waPhone(p) {   // פורמט בינ"ל ל-WhatsApp
  var d = normPhone(p);
  if (d.indexOf('972') === 0) return d;
  if (d.charAt(0) === '0') return '972' + d.substring(1);
  return d;
}
function nowISO() { return new Date().toISOString(); }
function todayIL(offsetDays) {
  var d = new Date();
  if (offsetDays) d = new Date(d.getTime() + offsetDays * 86400000);
  return Utilities.formatDate(d, 'Asia/Jerusalem', 'yyyy-MM-dd');
}

function jsonp(callback, obj) {
  var name = String(callback || 'callback').replace(/[^a-zA-Z0-9_]/g, '');
  return ContentService
    .createTextOutput(name + '(' + JSON.stringify(obj) + ')')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
function ok(cb, data)  { return jsonp(cb, Object.assign({ result: 'success' }, data || {})); }
function err(cb, msg)  { return jsonp(cb, { result: 'error', message: String(msg).substring(0, 250) }); }

// ============================================================
// Router
// ============================================================
function doGet(e) {
  var p = e.parameter, cb = p.callback;
  try {
    switch (p.action || 'submit') {
      case 'submit':                return submitBooking(p, cb);
      case 'busy_times':            return getBusyTimes(p, cb);
      case 'days_off':              return getDaysOff(p, cb);
      case 'submit_health':         return submitHealth(p, cb);
      case 'list':                  return listBookings(p, cb);
      case 'update_status':         return updateStatus(p, cb);
      case 'reschedule':            return reschedule(p, cb);
      case 'set_day_off':           return setDayOff(p, cb);
      case 'get_health':            return getHealth(p, cb);
      case 'clients':               return listClients(p, cb);
      case 'save_client':           return saveClient(p, cb);
      case 'delete_client':         return deleteClient(p, cb);
      case 'patient_records':       return listPatientRecords(p, cb);
      case 'save_patient_record':   return savePatientRecord(p, cb);
      case 'delete_patient_record': return deletePatientRecord(p, cb);
      case 'send_reminders':        return sendRemindersAction(p, cb);
      case 'available_slots':       return getAvailableSlots(p, cb);
      case 'slots_admin':           return slotsAdmin(p, cb);
      case 'add_slot':              return addSlot(p, cb);
      case 'remove_slot':           return removeSlot(p, cb);
      case 'add_slots_bulk':        return addSlotsBulk(p, cb);
      case 'block_all_slots':       return blockAllSlots(p, cb);
      case 'slots_month':           return slotsMonth(p, cb);
      case 'list_health':           return listHealth(p, cb);
      default: return err(cb, 'unknown action: ' + p.action);
    }
  } catch (ex) { return err(cb, ex.toString()); }
}
function requirePin(p) { return p.pin === ADMIN_PIN; }

// ============================================================
// WhatsApp — manual / Green API
// מחזיר { sent: bool, wa_url: string }
// ============================================================
function waSend(phone, message) {
  var to = waPhone(phone);
  var wa_url = 'https://api.whatsapp.com/send?phone=' + to + '&text=' + encodeURIComponent(message);
  if (WA_PROVIDER === 'greenapi' && GREENAPI_INSTANCE && GREENAPI_TOKEN) {
    try {
      var url = 'https://api.green-api.com/waInstance' + GREENAPI_INSTANCE +
                '/sendMessage/' + GREENAPI_TOKEN;
      var res = UrlFetchApp.fetch(url, {
        method: 'post', contentType: 'application/json',
        payload: JSON.stringify({ chatId: to + '@c.us', message: message }),
        muteHttpExceptions: true
      });
      var sent = res.getResponseCode() === 200;
      return { sent: sent, wa_url: wa_url };
    } catch (e) { return { sent: false, wa_url: wa_url }; }
  }
  return { sent: false, wa_url: wa_url }; // manual
}

// הודעות מוכנות
function msgReceived(name) {
  return 'היי ' + name + ' 🌿\n' +
    'הבקשה לתור התקבלה בהצלחה. אנא המתן/י לאישור סופי.\n\nהדר בק';
}
function msgApproved(name, prettyDate, time) {
  return 'היי ' + name + ' 🌿\n' +
    'התור שלך נקבע בהצלחה!\n\n' +
    '📅 תאריך: ' + prettyDate + '\n' +
    '🕐 שעה: ' + time + '\n' +
    '📍 כתובת: ' + CLINIC_ADDRESS + '\n\n' +
    '👖 נא להגיע בבגדים נוחים.\nנשמח לראותך 💆‍♀️\nהדר בק';
}
function msgReminder(name, prettyDate, time) {
  return 'תזכורת ידידותית 🌿\n' +
    'היי ' + name + ', רק להזכיר שיש לך תור מחר!\n\n' +
    '📅 ' + prettyDate + '\n' +
    '🕐 ' + time + '\n' +
    '📍 ' + CLINIC_ADDRESS + '\n\n' +
    '👖 נא להגיע בבגדים נוחים.\nנתראה מחר 💆‍♀️\nהדר בק';
}

var HE_DOW = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
var HE_MON = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
function prettyDate(iso) {
  var p = String(iso).split('-');
  if (p.length !== 3) return String(iso);
  var d = new Date(+p[0], +p[1] - 1, +p[2]);
  return 'יום ' + HE_DOW[d.getDay()] + ', ' + (+p[2]) + ' ב' + HE_MON[+p[1] - 1];
}

// ============================================================
// 1. submit — בקשת תור חדשה
// ============================================================
function submitBooking(p, cb) {
  var sheet = ssBookings();
  if (!sheet) return err(cb, 'sheet "הזמנות" not found');

  var id    = 'B' + Date.now() + Math.floor(Math.random() * 1000);
  var name  = safe(p.name, 100);
  var phone = safe(p.phone, 20);
  var dur   = safe(p.duration, 5) || String(TREATMENT_MIN);
  var date  = safe(p.date, 20);
  var time  = safe(p.time, 10);

  // id | תאריך_שליחה | שם | טלפון | שירות | משך | תאריך_פגישה | שעה | הערות | סטטוס | health_id | cal | תזכורת
  sheet.appendRow([id, p.timestamp || nowISO(), name, phone, safe(p.service, 80),
                   dur, date, time, safe(p.notes, 500), 'חדש', '', '', '']);

  upsertClient(phone, name, p.age);

  // הודעת "הבקשה התקבלה" ללקוחה (אוטומטי רק ב-Green API)
  var wa = waSend(phone, msgReceived(name));

  if (HADAR_EMAIL) {
    try {
      MailApp.sendEmail({
        to: HADAR_EMAIL,
        subject: '🌿 בקשת תור חדשה — ' + name,
        body: 'התקבלה בקשת תור חדשה:\n\n' +
          '👤 ' + name + '\n📱 ' + phone + '\n' +
          '🪷 ' + safe(p.service, 80) + ' (' + dur + ' דק׳)\n' +
          '📅 ' + prettyDate(date) + '  🕐 ' + time + '\n' +
          (p.notes ? '📝 ' + safe(p.notes, 500) + '\n' : '') +
          '\nלאישור: דף admin.html'
      });
    } catch (e) {}
  }
  return ok(cb, { id: id, wa_sent: wa.sent });
}

// מאגר לקוחות — יצירה/עדכון אוטומטי לפי טלפון
function upsertClient(phone, name, age) {
  var key = normPhone(phone);
  if (!key) return;
  var sheet = ssClients();
  var data  = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (normPhone(data[i][0]) === key) {
      if (name) sheet.getRange(i + 1, 2).setValue(name);
      if (age)  sheet.getRange(i + 1, 3).setValue(safe(age, 4));
      sheet.getRange(i + 1, 5).setValue((parseInt(data[i][4], 10) || 0) + 1); // מספר_טיפולים
      sheet.getRange(i + 1, 6).setValue(todayIL());                           // תאריך_אחרון
      return;
    }
  }
  sheet.appendRow([key, name || '', safe(age, 4), todayIL(), 1, todayIL(), '', '']);
}

// ============================================================
// 2. busy_times — שעות תפוסות (כולל חלון טיפול+מרווח)
// מחזיר רשימת { time, dur } לכל הזמנה פעילה ביום. הסינון בצד הלקוח.
// ============================================================
function getBusyTimes(p, cb) {
  var date = safe(p.date, 20);
  if (!date) return err(cb, 'date required');
  return ok(cb, { busy: busyForDate(date), buffer: BUFFER_MIN });
}

// תורים פעילים (לא נדחו) לתאריך → [{time,dur}]
function busyForDate(date) {
  var sheet = ssBookings();
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  var busy = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    if (String(r[6]) === date && String(r[9]) !== 'נדחה') {
      busy.push({ time: String(r[7]), dur: parseInt(r[5], 10) || TREATMENT_MIN });
    }
  }
  return busy;
}

// ============================================================
// 3. days_off
// ============================================================
function getDaysOff(p, cb) {
  var sheet = ssDaysOff();
  if (!sheet) return ok(cb, { dates: [] });
  var data = sheet.getDataRange().getValues();
  var dates = [];
  for (var i = 1; i < data.length; i++) if (data[i][0]) dates.push(String(data[i][0]));
  return ok(cb, { dates: dates });
}

// ============================================================
// 4. list — כל ההזמנות (אדמין)
// ============================================================
function listBookings(p, cb) {
  if (!requirePin(p)) return err(cb, 'unauthorized');
  var sheet = ssBookings();
  if (!sheet) return ok(cb, { bookings: [] });
  var data = sheet.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    out.push({
      id: r[0], submitted: r[1], name: r[2], phone: r[3], service: r[4],
      duration: r[5], date: r[6], time: r[7], notes: r[8], status: r[9],
      health_id: r[10] || '', calendar_event_id: r[11] || '', reminder_sent: r[12] || ''
    });
  }
  out.sort(function (a, b) { return String(b.submitted).localeCompare(String(a.submitted)); });
  return ok(cb, { bookings: out });
}

// ============================================================
// 5. update_status — אישור / דחיה / בוצע
//   אישור  → יוצר אירוע ביומן של הדר + שולח WhatsApp ללקוחה
//   דחיה   → מוחק את אירוע היומן (אם קיים) ומשחרר את השעה
// ============================================================
function updateStatus(p, cb) {
  if (!requirePin(p)) return err(cb, 'unauthorized');
  var id = safe(p.id, 60), status = safe(p.status, 20);
  if (!id || !status) return err(cb, 'id and status required');
  if (['חדש', 'אושר', 'נדחה', 'בוצע'].indexOf(status) === -1) return err(cb, 'invalid status');

  var sheet = ssBookings();
  var data  = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      var row = i + 1, r = data[i];
      sheet.getRange(row, 10).setValue(status);
      var resp = { id: id, status: status };

      if (status === 'אושר') {
        if (!r[11]) { // צור אירוע ביומן אם עוד לא נוצר
          var evId = createCalEvent(r[2], r[3], r[4], String(r[6]), String(r[7]), parseInt(r[5], 10) || TREATMENT_MIN, r[8]);
          if (evId) sheet.getRange(row, 12).setValue(evId);
        }
        var wa = waSend(r[3], msgApproved(r[2], prettyDate(r[6]), r[7]));
        resp.wa_sent = wa.sent; resp.wa_url = wa.wa_url;
      } else if (status === 'נדחה') {
        deleteCalEvent(r[11]); sheet.getRange(row, 12).setValue('');
      }
      return ok(cb, resp);
    }
  }
  return err(cb, 'id not found');
}

// ============================================================
// 6. reschedule — שינוי מועד תור, ללא הצהרת בריאות חדשה
// ?action=reschedule&pin=..&id=B..&date=YYYY-MM-DD&time=HH:MM
// ============================================================
function reschedule(p, cb) {
  if (!requirePin(p)) return err(cb, 'unauthorized');
  var id = safe(p.id, 60), date = safe(p.date, 20), time = safe(p.time, 10);
  if (!id || !date || !time) return err(cb, 'id, date, time required');

  var sheet = ssBookings();
  var data  = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      var row = i + 1, r = data[i];
      sheet.getRange(row, 7).setValue(date);  // תאריך_פגישה
      sheet.getRange(row, 8).setValue(time);  // שעה_פגישה
      sheet.getRange(row, 13).setValue('');   // לאפס תזכורת — תישלח שוב למועד החדש
      // עדכון אירוע היומן הקיים (אם יש)
      updateCalEvent(r[11], r[2], r[4], date, time, parseInt(r[5], 10) || TREATMENT_MIN);
      // הודעת WhatsApp על המועד החדש (אם אושר)
      var resp = { id: id, date: date, time: time };
      if (String(r[9]) === 'אושר') {
        var wa = waSend(r[3], msgApproved(r[2], prettyDate(date), time));
        resp.wa_sent = wa.sent; resp.wa_url = wa.wa_url;
      }
      return ok(cb, resp);
    }
  }
  return err(cb, 'id not found');
}

// ============================================================
// 7. set_day_off — חסימה / שחרור יום שלם
// ============================================================
function setDayOff(p, cb) {
  if (!requirePin(p)) return err(cb, 'unauthorized');
  var date = safe(p.date, 20), op = safe(p.op, 10) || 'add';
  if (!date) return err(cb, 'date required');
  var sheet = ssDaysOff();
  if (!sheet) return err(cb, 'sheet "ימי_חופש" not found');

  var data = sheet.getDataRange().getValues(), rowIdx = -1;
  for (var i = 1; i < data.length; i++) if (String(data[i][0]) === date) { rowIdx = i + 1; break; }

  if (op === 'remove') { if (rowIdx > 0) sheet.deleteRow(rowIdx); return ok(cb, { date: date, op: 'removed' }); }
  if (rowIdx === -1) sheet.appendRow([date, safe(p.reason, 100)]);
  return ok(cb, { date: date, op: 'added' });
}

// ============================================================
// 8. submit_health — הצהרת בריאות (+ קישור לתור)
// ============================================================
function submitHealth(p, cb) {
  var sheet = ssHealth();
  if (!sheet) return err(cb, 'sheet "הצהרות_בריאות" not found');

  var id    = 'H' + Date.now() + Math.floor(Math.random() * 1000);
  var name  = safe(p.name, 100);
  var phone = safe(p.phone, 20);
  sheet.appendRow([id, p.timestamp || nowISO(), name, phone, safe(p.age, 4),
                   safe(p.appointment, 60), safe(p.flags, 1500), safe(p.notes, 600),
                   safe(p.consent, 10), safe(p.answers_json, 4000)]);

  // קשירה לתור קיים אם נמסר booking_id
  var bid = safe(p.booking_id, 60);
  if (bid) linkHealthToBooking(bid, id);

  upsertClient(phone, name, p.age);

  if (HADAR_EMAIL) {
    try {
      MailApp.sendEmail({
        to: HADAR_EMAIL,
        subject: '🌿 הצהרת בריאות חדשה — ' + name,
        body: '👤 ' + name + '\n📱 ' + phone + (p.age ? '  · גיל ' + safe(p.age, 4) : '') + '\n' +
          (p.appointment ? '📅 ' + safe(p.appointment, 60) + '\n' : '') +
          '\n⚠️ דגלים:\n' + (safe(p.flags, 1500) || 'אין') + '\n' +
          (p.notes ? '\n📝 ' + safe(p.notes, 600) + '\n' : '') + '\n✓ אישרה את ההצהרה.'
      });
    } catch (e) {}
  }
  return ok(cb, { id: id });
}

function linkHealthToBooking(bookingId, healthId) {
  var sheet = ssBookings();
  var data  = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === bookingId) { sheet.getRange(i + 1, 11).setValue(healthId); return; }
  }
}

// ============================================================
// 9. get_health — הצהרה מלאה (לפי id או טלפון; האחרונה)
// ============================================================
function getHealth(p, cb) {
  if (!requirePin(p)) return err(cb, 'unauthorized');
  var sheet = ssHealth();
  if (!sheet) return ok(cb, { health: null });
  var id = safe(p.id, 60), phone = normPhone(p.phone);
  var data = sheet.getDataRange().getValues(), found = null;
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    var match = id ? (r[0] === id) : (phone && normPhone(r[3]) === phone);
    if (match) {
      found = { id: r[0], submitted: r[1], name: r[2], phone: r[3], age: r[4],
                appointment: r[5], flags: r[6], notes: r[7], consent: r[8], answers_json: r[9] || '' };
      if (id) break; // id מדויק — עצור. טלפון — שמור את האחרון
    }
  }
  return ok(cb, { health: found });
}

// ============================================================
// 10. clients — מאגר לקוחות (אדמין)
// ============================================================
function listClients(p, cb) {
  if (!requirePin(p)) return err(cb, 'unauthorized');
  var sheet = ssClients();
  var data = sheet.getDataRange().getValues(), out = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    if (!r[0] && !r[1]) continue;
    out.push({ phone: r[0], name: r[1], age: r[2], joined: r[3],
               visits: r[4], last: r[5], tag: r[6], notes: r[7] });
  }
  out.sort(function (a, b) { return String(a.name).localeCompare(String(b.name), 'he'); });
  return ok(cb, { clients: out });
}

function saveClient(p, cb) {
  if (!requirePin(p)) return err(cb, 'unauthorized');
  var key = normPhone(p.phone);
  if (!key) return err(cb, 'phone required');
  var sheet = ssClients();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (normPhone(data[i][0]) === key) {
      var row = i + 1;
      if (p.name !== undefined)  sheet.getRange(row, 2).setValue(safe(p.name, 100));
      if (p.age !== undefined)   sheet.getRange(row, 3).setValue(safe(p.age, 4));
      if (p.tag !== undefined)   sheet.getRange(row, 7).setValue(safe(p.tag, 60));
      if (p.notes !== undefined) sheet.getRange(row, 8).setValue(safe(p.notes, 400));
      return ok(cb, { phone: key, op: 'updated' });
    }
  }
  sheet.appendRow([key, safe(p.name, 100), safe(p.age, 4), todayIL(), 0, '', safe(p.tag, 60), safe(p.notes, 400)]);
  return ok(cb, { phone: key, op: 'created' });
}

function deleteClient(p, cb) {
  if (!requirePin(p)) return err(cb, 'unauthorized');
  var key = normPhone(p.phone);
  var sheet = ssClients();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (normPhone(data[i][0]) === key) { sheet.deleteRow(i + 1); return ok(cb, { phone: key, op: 'deleted' }); }
  }
  return err(cb, 'not found');
}

// ============================================================
// 11. תיק מטופל — רשומות טיפול
// ============================================================
function listPatientRecords(p, cb) {
  if (!requirePin(p)) return err(cb, 'unauthorized');
  var phone = normPhone(p.phone);
  var sheet = ssPatient();
  var data = sheet.getDataRange().getValues(), out = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    if (phone && normPhone(r[1]) !== phone) continue;
    out.push({ id: r[0], phone: r[1], name: r[2], date: r[3],
               reason: r[4], summary: r[5], updated: r[6] });
  }
  out.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  return ok(cb, { records: out });
}

function savePatientRecord(p, cb) {
  if (!requirePin(p)) return err(cb, 'unauthorized');
  var phone = normPhone(p.phone);
  if (!phone) return err(cb, 'phone required');
  var sheet = ssPatient();
  var id = safe(p.id, 60);

  if (id) { // עדכון
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        var row = i + 1;
        sheet.getRange(row, 3).setValue(safe(p.name, 100));
        sheet.getRange(row, 4).setValue(safe(p.date, 20));
        sheet.getRange(row, 5).setValue(safe(p.reason, 300));
        sheet.getRange(row, 6).setValue(safe(p.summary, 2000));
        sheet.getRange(row, 7).setValue(nowISO());
        return ok(cb, { id: id, op: 'updated' });
      }
    }
    return err(cb, 'id not found');
  }
  var newId = 'R' + Date.now() + Math.floor(Math.random() * 1000);
  sheet.appendRow([newId, phone, safe(p.name, 100), safe(p.date, 20) || todayIL(),
                   safe(p.reason, 300), safe(p.summary, 2000), nowISO()]);
  return ok(cb, { id: newId, op: 'created' });
}

function deletePatientRecord(p, cb) {
  if (!requirePin(p)) return err(cb, 'unauthorized');
  var id = safe(p.id, 60);
  var sheet = ssPatient();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) { sheet.deleteRow(i + 1); return ok(cb, { id: id, op: 'deleted' }); }
  }
  return err(cb, 'not found');
}

// ============================================================
// 12. Google Calendar — יומן הדר
// ============================================================
function calStart(dateStr, timeStr) {
  var d = String(dateStr).split('-'), t = String(timeStr).split(':');
  return new Date(+d[0], +d[1] - 1, +d[2], +t[0] || 0, +t[1] || 0, 0);
}
function createCalEvent(name, phone, service, dateStr, timeStr, durationMin, notes) {
  try {
    var cal = CalendarApp.getDefaultCalendar();
    var start = calStart(dateStr, timeStr);
    var end = new Date(start.getTime() + (durationMin || TREATMENT_MIN) * 60000);
    var ev = cal.createEvent('עיסוי — ' + name + (service ? ' (' + service + ')' : ''), start, end, {
      description: '📱 ' + phone + (notes ? '\n📝 ' + notes : '') + '\n\nנקבע דרך מערכת ההזמנות.',
      location: CLINIC_ADDRESS
    });
    return ev.getId();
  } catch (e) { return ''; }
}
function updateCalEvent(eventId, name, service, dateStr, timeStr, durationMin) {
  if (!eventId) return;
  try {
    var ev = CalendarApp.getDefaultCalendar().getEventById(eventId);
    if (!ev) return;
    var start = calStart(dateStr, timeStr);
    ev.setTime(start, new Date(start.getTime() + (durationMin || TREATMENT_MIN) * 60000));
  } catch (e) {}
}
function deleteCalEvent(eventId) {
  if (!eventId) return;
  try { var ev = CalendarApp.getDefaultCalendar().getEventById(eventId); if (ev) ev.deleteEvent(); } catch (e) {}
}

// ============================================================
// 13. תזכורות 24 שעות
//   dailyReminders()  — לחבר כטריגר Time-driven (בוקר).
//   send_reminders    — להרצה ידנית מהאדמין.
// ============================================================
function dailyReminders() { runReminders(false); }

function sendRemindersAction(p, cb) {
  if (!requirePin(p)) return err(cb, 'unauthorized');
  var res = runReminders(true);
  return ok(cb, { reminders: res });
}

function runReminders(returnList) {
  var sheet = ssBookings();
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  var tomorrow = todayIL(1);
  var out = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    if (String(r[6]) === tomorrow && String(r[9]) === 'אושר' && String(r[12] || '') !== 'כן') {
      var wa = waSend(r[3], msgReminder(r[2], prettyDate(r[6]), r[7]));
      if (wa.sent) sheet.getRange(i + 1, 13).setValue('כן');
      out.push({ name: r[2], phone: r[3], time: r[7], date: r[6], sent: wa.sent, wa_url: wa.wa_url });
    }
  }
  // במצב manual — מרכז את כל התזכורות במייל אחד להדר עם קישורי לחיצה
  if (out.length && HADAR_EMAIL && WA_PROVIDER !== 'greenapi') {
    var body = 'תזכורות לתורים של מחר (' + prettyDate(tomorrow) + '):\n\n';
    out.forEach(function (x) {
      body += '• ' + x.name + ' — ' + x.time + '\n  שליחה: ' + x.wa_url + '\n\n';
    });
    try { MailApp.sendEmail({ to: HADAR_EMAIL, subject: '🔔 תזכורות לתורים של מחר', body: body }); } catch (e) {}
  }
  return returnList ? out : [];
}

// ============================================================
// 14. שעות זמינות — מודל "שעות מפורסמות" (כמו AvailableSlot)
//   הדר פותחת ידנית שעות לכל תאריך. דף ההזמנה מציג רק שעות פתוחות.
//   גיליון "שעות_זמינות": תאריך | שעה   (נוצר אוטומטית)
// ============================================================
function ssSlots() {
  var s = ss().getSheetByName('שעות_זמינות');
  if (!s) { s = ss().insertSheet('שעות_זמינות'); s.appendRow(['תאריך', 'שעה']); }
  return s;
}

// ציבורי — שעות פתוחות לתאריך + תפוסות + האם המערכת הוגדרה בכלל
// configured=false → דף ההזמנה נופל חזרה לשעות העבודה הקבועות (תאימות).
function getAvailableSlots(p, cb) {
  var date = safe(p.date, 20);
  if (!date) return err(cb, 'date required');
  var sheet = ssSlots();
  var data = sheet.getDataRange().getValues();
  var hasAny = data.length > 1;
  var slots = [];
  for (var i = 1; i < data.length; i++) if (String(data[i][0]) === date) slots.push(String(data[i][1]));
  slots.sort();
  return ok(cb, { slots: slots, busy: busyForDate(date), buffer: BUFFER_MIN, configured: hasAny });
}

// אדמין — שעות פתוחות + תפוסות לתאריך (לניהול)
function slotsAdmin(p, cb) {
  if (!requirePin(p)) return err(cb, 'unauthorized');
  var date = safe(p.date, 20);
  if (!date) return err(cb, 'date required');
  var data = ssSlots().getDataRange().getValues();
  var open = [];
  for (var i = 1; i < data.length; i++) if (String(data[i][0]) === date) open.push(String(data[i][1]));
  var booked = busyForDate(date).map(function (b) { return b.time; });
  return ok(cb, { open: open.sort(), booked: booked });
}

function slotExists(data, date, time) {
  for (var i = 1; i < data.length; i++) if (String(data[i][0]) === date && String(data[i][1]) === time) return i + 1;
  return -1;
}

function addSlot(p, cb) {
  if (!requirePin(p)) return err(cb, 'unauthorized');
  var date = safe(p.date, 20), time = safe(p.time, 10);
  if (!date || !time) return err(cb, 'date, time required');
  var sheet = ssSlots(), data = sheet.getDataRange().getValues();
  if (slotExists(data, date, time) === -1) sheet.appendRow([date, time]);
  return ok(cb, { date: date, time: time, op: 'added' });
}

function removeSlot(p, cb) {
  if (!requirePin(p)) return err(cb, 'unauthorized');
  var date = safe(p.date, 20), time = safe(p.time, 10);
  if (!date || !time) return err(cb, 'date, time required');
  var sheet = ssSlots(), data = sheet.getDataRange().getValues();
  var row = slotExists(data, date, time);
  if (row > 0) sheet.deleteRow(row);
  return ok(cb, { date: date, time: time, op: 'removed' });
}

function addSlotsBulk(p, cb) {
  if (!requirePin(p)) return err(cb, 'unauthorized');
  var date = safe(p.date, 20), times = safe(p.times, 600);
  if (!date || !times) return err(cb, 'date, times required');
  var sheet = ssSlots(), data = sheet.getDataRange().getValues();
  var arr = times.split(',').map(function (t) { return t.trim(); }).filter(Boolean);
  var added = 0;
  arr.forEach(function (t) { if (slotExists(data, date, t) === -1) { sheet.appendRow([date, t]); data.push([date, t]); added++; } });
  return ok(cb, { date: date, op: 'bulk', added: added });
}

function blockAllSlots(p, cb) {
  if (!requirePin(p)) return err(cb, 'unauthorized');
  var date = safe(p.date, 20);
  if (!date) return err(cb, 'date required');
  var sheet = ssSlots(), data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) if (String(data[i][0]) === date) sheet.deleteRow(i + 1);
  return ok(cb, { date: date, op: 'blocked' });
}

// סיכום חודשי לתצוגת הלוח — אילו תאריכים יש בהם שעות פתוחות / תורים
// ?action=slots_month&pin=..&month=YYYY-MM
function slotsMonth(p, cb) {
  if (!requirePin(p)) return err(cb, 'unauthorized');
  var month = safe(p.month, 7); // YYYY-MM
  if (!month) return err(cb, 'month required');
  var openDates = {}, bookedDates = {};
  var sd = ssSlots().getDataRange().getValues();
  for (var i = 1; i < sd.length; i++) { var d = String(sd[i][0]); if (d.indexOf(month) === 0) openDates[d] = true; }
  var bd = ssBookings() ? ssBookings().getDataRange().getValues() : [];
  for (var j = 1; j < bd.length; j++) {
    var r = bd[j];
    if (String(r[6]).indexOf(month) === 0 && String(r[9]) !== 'נדחה') bookedDates[String(r[6])] = true;
  }
  var off = [];
  var od = ssDaysOff() ? ssDaysOff().getDataRange().getValues() : [];
  for (var k = 1; k < od.length; k++) { var dd = String(od[k][0]); if (dd.indexOf(month) === 0) off.push(dd); }
  return ok(cb, { open: Object.keys(openDates), booked: Object.keys(bookedDates), off: off });
}

// ============================================================
// 15. list_health — כל הצהרות הבריאות (אדמין, לטאב "הצהרות")
// ============================================================
function listHealth(p, cb) {
  if (!requirePin(p)) return err(cb, 'unauthorized');
  var sheet = ssHealth();
  var data = sheet.getDataRange().getValues(), out = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    if (!r[0]) continue;
    out.push({ id: r[0], submitted: r[1], name: r[2], phone: r[3], age: r[4],
               appointment: r[5], flags: r[6], notes: r[7], consent: r[8], answers_json: r[9] || '' });
  }
  out.sort(function (a, b) { return String(b.submitted).localeCompare(String(a.submitted)); });
  return ok(cb, { declarations: out });
}
