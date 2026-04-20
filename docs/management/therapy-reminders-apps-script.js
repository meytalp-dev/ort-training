/**
 * Google Apps Script — תזכורות מעקב טיפול | אורט בית הערבה
 * ══════════════════════════════════════════════════════════
 *
 * שולח תזכורת WhatsApp לכל מטפל/ת ביום שלו/ה עם קישור לטופס מעקב.
 *
 * מטפלים:
 *   שרה מרציאנו — עיסוק — חמישי 12:00 — 0506614801
 *   מאי קליין — בעלי חיים — רביעי 12:30 — 0523465006
 *   צופיה — מוזיקה — שני 13:00 — 0545635125
 *   אלון רז — שלישי 14:00 — 0503909979
 *   מטיאס — פסיכולוג — רביעי 14:00 — 0544611004
 *   דבורה — קידום נוער — רביעי 14:00 — 0508466018
 *
 * הוראות התקנה:
 *   1. צרי Sheet חדש (או השתמשי בקיים)
 *   2. Extensions > Apps Script
 *   3. הדביקי את הקוד הזה
 *   4. הגדירי Script Properties:
 *      - GREEN_API_ID_INSTANCE
 *      - GREEN_API_TOKEN_INSTANCE
 *   5. הריצי setupTherapyTriggers() פעם אחת
 *
 * טריגרים (4):
 *   • 12:00 — שני (צופיה)
 *   • 12:30 — רביעי (מאי)
 *   • 13:50 — שלישי (אלון) + רביעי (מטיאס, דבורה)
 *   • 11:50 — חמישי (שרה)
 *
 * בפועל: 2 טריגרים יומיים שבודקים את היום ושולחים למי שצריך
 */

// ╔══════════════════════════════════════════════╗
// ║           הגדרות                              ║
// ╚══════════════════════════════════════════════╝

const GREEN_API_INSTANCE = PropertiesService.getScriptProperties().getProperty('GREEN_API_ID_INSTANCE') || '';
const GREEN_API_TOKEN = PropertiesService.getScriptProperties().getProperty('GREEN_API_TOKEN_INSTANCE') || '';
const GREEN_API_URL = 'https://7107.api.greenapi.com';

const TRACKING_FORM_URL = 'https://meytalp-dev.github.io/ort-training/management/therapy.html';

// רשימת מטפלים — יום (0=ראשון..4=חמישי), שעה, טלפון
const THERAPY_STAFF = [
  { name: 'שרה',    fullName: 'שרה מרציאנו', role: 'עיסוק',         day: 4, hour: '12:00', phone: '972506614801' },
  { name: 'מאי',    fullName: 'מאי קליין',    role: 'בעלי חיים',     day: 3, hour: '12:30', phone: '972523465006' },
  { name: 'צופיה',  fullName: 'צופיה',        role: 'מוזיקה',        day: 1, hour: '13:00', phone: '972545635125' },
  { name: 'אלון',   fullName: 'אלון רז',      role: 'טיפול',         day: 2, hour: '14:00', phone: '972503909979' },
  { name: 'מטיאס',  fullName: 'מטיאס',        role: 'פסיכולוג',      day: 3, hour: '14:00', phone: '972544611004' },
  { name: 'דבורה',  fullName: 'דבורה',        role: 'קידום נוער',    day: 3, hour: '14:00', phone: '972508466018' },
];

const MEYTAL_PHONE = '972536256653';
const YISKAH_PHONE = ''; // להוסיף כשיהיה

// חגים — אין תזכורות
const HOLIDAYS = [
  '2026-03-24','2026-03-25','2026-03-26','2026-03-27','2026-03-28',
  '2026-03-29','2026-03-30','2026-03-31',
  '2026-04-01','2026-04-02','2026-04-03','2026-04-04','2026-04-05',
  '2026-04-06','2026-04-07','2026-04-08',
  '2026-04-20','2026-04-21','2026-04-22',
];

const DAY_NAMES = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];

// ╔══════════════════════════════════════════════╗
// ║           WhatsApp — Green-API                ║
// ╚══════════════════════════════════════════════╝

function sendWhatsApp(phone, message) {
  const url = `${GREEN_API_URL}/waInstance${GREEN_API_INSTANCE}/sendMessage/${GREEN_API_TOKEN}`;
  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ chatId: phone + '@c.us', message: message }),
      muteHttpExceptions: true
    });
    const code = response.getResponseCode();
    if (code === 200) {
      Logger.log('WhatsApp sent to ' + phone);
      return true;
    } else {
      Logger.log('WhatsApp error: ' + code + ' — ' + response.getContentText());
      return false;
    }
  } catch(err) {
    Logger.log('WhatsApp fetch error: ' + err.message);
    return false;
  }
}

// ╔══════════════════════════════════════════════╗
// ║      תזכורת מעקב טיפול                       ║
// ╚══════════════════════════════════════════════╝

/** רץ כל יום — שולח תזכורת למטפלים שהיום הוא יום העבודה שלהם */
function sendTherapyTrackingReminders() {
  const today = new Date();
  const todayStr = Utilities.formatDate(today, 'Asia/Jerusalem', 'yyyy-MM-dd');
  const dayOfWeek = today.getDay();

  // סופ"ש
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    Logger.log('סוף שבוע — אין תזכורות');
    return;
  }

  // חגים
  if (HOLIDAYS.includes(todayStr)) {
    Logger.log('חג — אין תזכורות');
    return;
  }

  const dayName = DAY_NAMES[dayOfWeek];
  const todayStaff = THERAPY_STAFF.filter(s => s.day === dayOfWeek);

  if (todayStaff.length === 0) {
    Logger.log('אין מטפלים היום (יום ' + dayName + ')');
    return;
  }

  let sentCount = 0;

  todayStaff.forEach(staff => {
    const message =
      `שלום ${staff.fullName},\n\n` +
      `תזכורת: היום (יום ${dayName}) יום מעקב טיפול.\n\n` +
      `נא למלא עדכון שבועי על התלמידים שלך בטופס המעקב:\n` +
      `${TRACKING_FORM_URL}\n\n` +
      `(היכנס/י > טאב "מעקב טיפול" > בחר/י את שמך > כתוב/י עדכון לכל תלמיד/ה)\n\n` +
      `תודה רבה!`;

    const ok = sendWhatsApp(staff.phone, message);
    if (ok) sentCount++;
    Utilities.sleep(1000);
  });

  Logger.log(`נשלחו ${sentCount}/${todayStaff.length} תזכורות מעקב טיפול (יום ${dayName})`);

  // עדכון למייטל
  if (sentCount > 0) {
    const names = todayStaff.map(s => s.fullName).join(', ');
    sendWhatsApp(MEYTAL_PHONE,
      `תזכורות מעקב טיפול נשלחו (יום ${dayName}):\n${names}`
    );
  }
}

// ╔══════════════════════════════════════════════╗
// ║           טריגרים                             ║
// ╚══════════════════════════════════════════════╝

const MANAGED_FUNCTIONS = ['sendTherapyTrackingReminders'];

/** הריצי פעם אחת — מגדיר טריגר יומי */
function setupTherapyTriggers() {
  // מחק טריגרים קיימים
  ScriptApp.getProjectTriggers().forEach(t => {
    if (MANAGED_FUNCTIONS.includes(t.getHandlerFunction())) {
      ScriptApp.deleteTrigger(t);
    }
  });

  // 11:30 כל יום — בודק אם יש מטפלים היום ושולח
  ScriptApp.newTrigger('sendTherapyTrackingReminders')
    .timeBased().atHour(11).nearMinute(30).everyDays(1)
    .inTimezone('Asia/Jerusalem').create();

  Logger.log('טריגר תזכורות מעקב טיפול הוגדר — 11:30 כל יום');
}

// ╔══════════════════════════════════════════════╗
// ║           בדיקות                              ║
// ╚══════════════════════════════════════════════╝

/** בדיקה — שולח תזכורת למייטל */
function testTherapyReminder() {
  const ok = sendWhatsApp(MEYTAL_PHONE,
    'בדיקת מערכת תזכורות מעקב טיפול — הכל עובד!\n\n' +
    'קישור לטופס: ' + TRACKING_FORM_URL
  );
  Logger.log(ok ? 'הודעה נשלחה' : 'שליחה נכשלה');
}

/** בדיקה — מריץ את הפונקציה הראשית */
function testSendReminders() {
  sendTherapyTrackingReminders();
}
