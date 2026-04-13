/**
 * Google Apps Script — תורנויות + תזכורות מרכזיות | אורט בית הערבה
 * ══════════════════════════════════════════════════════════════════
 *
 * נשאר ב-Sheet הקיים!
 * אחרי שפתיחות בוקר עוברת ל-Sheet נפרד — להחליף את הקוד בקובץ הזה.
 *
 * Sheet קיים: https://docs.google.com/spreadsheets/d/1YySZl7g1ABfSY-oP18jANolg113Whz5s-wBWegMmqyk
 *
 * כולל:
 *   1. תורנויות — הפסקות (07:30) + צהריים (12:00)
 *   2. תזכורות מרכזיות — דוחות, ציונים, אירועים (07:00)
 *
 * הוראות עדכון (לא התקנה חדשה!):
 *   1. פתחי את ה-Sheet הקיים > Extensions > Apps Script
 *   2. מחקי את כל הקוד הישן
 *   3. הדביקי את הקוד הזה
 *   4. הריצי setupAllTriggers() פעם אחת — יעדכן ל-3 טריגרים
 *   5. אין צורך ב-Deploy חדש (אין Web App כאן)
 *
 * טריגרים (3):
 *   • 07:00 — תזכורות מרכזיות (דוחות, ציונים)
 *   • 07:30 — תזכורת תורנות הפסקות
 *   • 12:00 — תזכורת תורנות צהריים
 *
 * גיליונות נדרשים (כבר קיימים):
 *   • צוות — שם | טלפון
 *   • קבוצות — שם_קבוצה | שם | טלפון
 *   • תזכורות — id | סוג | יום_בחודש | תאריך | ימים_לפני | קבוצה | הודעה | פעיל | נשלח_לאחרונה
 *
 * גיליונות שאפשר למחוק (עברו ל-Sheet פתיחות בוקר):
 *   • שיבוצים
 *   • תיעוד
 */

// ╔══════════════════════════════════════════════╗
// ║           הגדרות                              ║
// ╚══════════════════════════════════════════════╝

const GREEN_API_INSTANCE = '7107577196';
const GREEN_API_TOKEN = 'bbe2449cf3f84e11b1fd8dbf79541bc59b827f69e96e4268b3';
const GREEN_API_URL = 'https://7107.api.greenapi.com';

const MEYTAL_PHONE = '972536256653';
const DUTY_PAGE_URL = 'https://meytalp-dev.github.io/ort-training/management/duties.html';

const DAY_NAMES_HEB = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];

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
// ║      תורנויות — נתונים                       ║
// ╚══════════════════════════════════════════════╝

const AREA_EQUIPMENT = {
  'כדורגל — דשא + פינג פונג': 'כדורגל + מחבטי פינג פונג וכדורים',
  'כדורסל — פרגולה': 'כדורסל',
  'דמקה — מספרה': 'לוחות דמקה + כלים',
  'שש בש — כיתות 1-2-3': 'לוחות שש בש + קוביות',
  'כדורעף — סדנא + 7-8-9': 'כדורעף + רשת'
};

const RECESS_SCHEDULE = {
  'כדורגל — דשא + פינג פונג': {
    0: ['יוסי'], 1: ['מנו'], 2: ['גיא'], 3: ['יוסי'], 4: ['יואב']
  },
  'כדורסל — פרגולה': {
    0: ['מנו'], 1: ['אושר'], 2: ['אופירה'], 3: ['ויקי'], 4: ['נעמה']
  },
  'דמקה — מספרה': {
    0: ['מאיה'], 1: ['פרלה'], 2: ['יעל','גיא'], 3: ['לינוי'], 4: []
  },
  'שש בש — כיתות 1-2-3': {
    0: ['אפרת'], 1: ['משה'], 2: ['יואב'], 3: ['מירב'], 4: ['אליאל']
  },
  'כדורעף — סדנא + 7-8-9': {
    0: ['רעיה'], 1: ['אליאל','שי'], 2: [], 3: ['יעקב'], 4: ['שי']
  }
};

const LUNCH_SCHEDULE = {
  0: [],
  1: ['רווית', 'יסכה'],
  2: ['דורית', 'יואב'],
  3: ['רווית', 'מנו'],
  4: ['אופירה']
};

// ╔══════════════════════════════════════════════╗
// ║      תורנויות — תזכורות (07:30 + 12:00)     ║
// ╚══════════════════════════════════════════════╝

/** רץ כל יום ב-07:30 — תזכורת הפסקות */
function sendRecessReminder() {
  const dayIdx = getDutyDayIndex_();
  if (dayIdx < 0) return;

  const dayName = DAY_NAMES_HEB[dayIdx];
  const teacherDuties = {};

  for (const area in RECESS_SCHEDULE) {
    const teachers = RECESS_SCHEDULE[area][dayIdx] || [];
    teachers.forEach(name => {
      if (!teacherDuties[name]) teacherDuties[name] = [];
      teacherDuties[name].push(area);
    });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  for (const name in teacherDuties) {
    const phone = getStaffPhoneByFirst_(ss, name);
    if (!phone) { Logger.log('חסר טלפון: ' + name); continue; }

    const areas = teacherDuties[name];
    const areasText = areas.map(a => `• ${a}`).join('\n');
    const equipList = areas.map(a => AREA_EQUIPMENT[a]).filter(Boolean);
    const equipText = [...new Set(equipList)].join(', ');

    const message =
      `בוקר טוב ${name},\n\n` +
      `תזכורת: היום (יום ${dayName}) יש לך תורנות הפסקות:\n` +
      `${areasText}\n\n` +
      `אל תשכח/י לקחת איתך: ${equipText}\n\n` +
      `תודה רבה!\n` +
      `${DUTY_PAGE_URL}`;

    sendWhatsApp(phone, message);
    Logger.log('תזכורת הפסקות נשלחה ל: ' + name);
  }
}

/** רץ כל יום ב-12:00 — תזכורת צהריים */
function sendLunchReminder() {
  const dayIdx = getDutyDayIndex_();
  if (dayIdx < 0) return;

  const dayName = DAY_NAMES_HEB[dayIdx];
  const teachers = LUNCH_SCHEDULE[dayIdx] || [];
  if (teachers.length === 0) { Logger.log('אין תורנות צהריים היום'); return; }

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  teachers.forEach(name => {
    const phone = getStaffPhoneByFirst_(ss, name);
    if (!phone) { Logger.log('חסר טלפון: ' + name); return; }

    const message =
      `שלום ${name},\n\n` +
      `תזכורת: היום (יום ${dayName}) יש לך תורנות צהריים.\n` +
      `נא להגיע לחדר האוכל.\n\n` +
      `תודה רבה!`;

    sendWhatsApp(phone, message);
    Logger.log('תזכורת צהריים נשלחה ל: ' + name);
  });
}

// ╔══════════════════════════════════════════════╗
// ║      תורנויות — פונקציות עזר                 ║
// ╚══════════════════════════════════════════════╝

function getDutyDayIndex_() {
  const jsDay = new Date().getDay();
  if (jsDay === 5 || jsDay === 6) return -1;
  return jsDay;
}

function getStaffPhoneByFirst_(ss, firstName) {
  const sheet = ss.getSheetByName('צוות');
  if (!sheet) return null;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const fullName = String(data[i][0]);
    if (fullName === firstName ||
        fullName.startsWith(firstName + ' ') ||
        fullName.endsWith(' ' + firstName) ||
        fullName.includes(' ' + firstName + ' ')) {
      return String(data[i][1]);
    }
  }
  return null;
}

// ╔══════════════════════════════════════════════╗
// ║      תזכורות מרכזיות (07:00)                ║
// ╚══════════════════════════════════════════════╝

function getHolidays_() {
  return [
    '2026-03-24','2026-03-25','2026-03-26','2026-03-27','2026-03-28',
    '2026-03-29','2026-03-30','2026-03-31',
    '2026-04-01','2026-04-02','2026-04-03','2026-04-04','2026-04-05',
    '2026-04-06','2026-04-07','2026-04-08',
    '2026-04-21','2026-04-22',
  ];
}

function getTodayString_() {
  return Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'yyyy-MM-dd');
}

/** רץ כל יום ב-07:00 — תזכורות מגיליון "תזכורות" */
function checkAndSendReminders() {
  const today = new Date();
  const todayStr = getTodayString_();
  const dayOfWeek = today.getDay();

  if (dayOfWeek === 5 || dayOfWeek === 6) { Logger.log('סוף שבוע'); return; }
  if (getHolidays_().includes(todayStr)) { Logger.log('חג'); return; }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('תזכורות');
  if (!sheet) { Logger.log('גיליון "תזכורות" לא נמצא'); return; }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) { Logger.log('אין תזכורות'); return; }

  const todayDay = today.getDate();
  let sentCount = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const type = String(row[1]).trim();
    const dayInMonth = Number(row[2]);
    const specificDate = row[3];
    const daysBefore = Number(row[4]);
    const groupName = String(row[5]).trim();
    const messageTemplate = String(row[6]).trim();
    const active = String(row[7]).trim();
    const lastSent = row[8];

    if (active !== 'כן') continue;

    let shouldSend = false;

    if (type === 'חודשית') {
      if (todayDay === dayInMonth) {
        if (!lastSent || !isSameMonth_(lastSent, today)) shouldSend = true;
      }
    } else if (type === 'לפני_אירוע') {
      if (specificDate) {
        const targetDate = new Date(specificDate);
        targetDate.setDate(targetDate.getDate() - (daysBefore || 0));
        const targetStr = Utilities.formatDate(targetDate, 'Asia/Jerusalem', 'yyyy-MM-dd');
        if (todayStr === targetStr) {
          const lastSentStr = lastSent ? Utilities.formatDate(new Date(lastSent), 'Asia/Jerusalem', 'yyyy-MM-dd') : '';
          if (lastSentStr !== todayStr) shouldSend = true;
        }
      }
    } else if (type === 'חד_פעמית') {
      if (specificDate) {
        const eventStr = Utilities.formatDate(new Date(specificDate), 'Asia/Jerusalem', 'yyyy-MM-dd');
        if (todayStr === eventStr && !lastSent) shouldSend = true;
      }
    }

    if (!shouldSend) continue;

    const members = getGroupMembers_(groupName);
    if (members.length === 0) { Logger.log('קבוצה ריקה: ' + groupName); continue; }

    let groupSentOk = false;
    for (const member of members) {
      const firstName = member.name.split(' ')[0];
      const personalMessage = messageTemplate.replace(/\{שם\}/g, firstName);
      const ok = sendWhatsApp(member.phone, personalMessage);
      if (ok) { groupSentOk = true; sentCount++; }
      Utilities.sleep(1000);
    }

    if (groupSentOk) sheet.getRange(i + 1, 9).setValue(new Date());
  }

  Logger.log('סיום — נשלחו ' + sentCount + ' הודעות תזכורת');
}

function isSameMonth_(dateValue, referenceDate) {
  const d = new Date(dateValue);
  return d.getMonth() === referenceDate.getMonth() && d.getFullYear() === referenceDate.getFullYear();
}

function getGroupMembers_(groupName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('קבוצות');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const members = [];
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === groupName) {
      members.push({ name: String(data[i][1]).trim(), phone: String(data[i][2]).trim() });
    }
  }
  return members;
}

function sendReminderNow(rowIndex) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('תזכורות');
  if (!sheet) return;
  const actualRow = rowIndex + 1;
  if (actualRow > sheet.getLastRow()) return;

  const row = sheet.getRange(actualRow, 1, 1, 9).getValues()[0];
  const groupName = String(row[5]).trim();
  const messageTemplate = String(row[6]).trim();
  if (!messageTemplate) return;

  const members = getGroupMembers_(groupName);
  let sentCount = 0;
  for (const member of members) {
    const firstName = member.name.split(' ')[0];
    const personalMessage = messageTemplate.replace(/\{שם\}/g, firstName);
    if (sendWhatsApp(member.phone, personalMessage)) sentCount++;
    Utilities.sleep(1000);
  }
  sheet.getRange(actualRow, 9).setValue(new Date());
  Logger.log('תזכורת ידנית — ' + sentCount + '/' + members.length + ' לקבוצה ' + groupName);
}

// ╔══════════════════════════════════════════════╗
// ║           טריגרים                             ║
// ╚══════════════════════════════════════════════╝

const MANAGED_FUNCTIONS = ['checkAndSendReminders', 'sendRecessReminder', 'sendLunchReminder'];

/** הריצי פעם אחת — מעדכן ל-3 טריגרים (בלי פתיחות בוקר) */
function setupAllTriggers() {
  // מחק רק טריגרים שלנו + הישנים של פתיחות בוקר
  const ALL_KNOWN = [...MANAGED_FUNCTIONS, 'sendDailyReminder', 'checkAndNotifyManager'];
  ScriptApp.getProjectTriggers().forEach(t => {
    if (ALL_KNOWN.includes(t.getHandlerFunction())) {
      ScriptApp.deleteTrigger(t);
    }
  });

  // 07:00 — תזכורות מרכזיות
  ScriptApp.newTrigger('checkAndSendReminders')
    .timeBased().atHour(7).nearMinute(0).everyDays(1)
    .inTimezone('Asia/Jerusalem').create();

  // 07:30 — תורנויות הפסקות
  ScriptApp.newTrigger('sendRecessReminder')
    .timeBased().atHour(7).nearMinute(30).everyDays(1)
    .inTimezone('Asia/Jerusalem').create();

  // 12:00 — תורנויות צהריים
  ScriptApp.newTrigger('sendLunchReminder')
    .timeBased().atHour(12).nearMinute(0).everyDays(1)
    .inTimezone('Asia/Jerusalem').create();

  Logger.log('3 טריגרים הוגדרו: 07:00 תזכורות, 07:30 הפסקות, 12:00 צהריים');
  Logger.log('פתיחות בוקר (14:30 + 16:00) הוסרו — עברו ל-Sheet נפרד');
}

// ╔══════════════════════════════════════════════╗
// ║           בדיקות                              ║
// ╚══════════════════════════════════════════════╝

function testWhatsApp() {
  const ok = sendWhatsApp(MEYTAL_PHONE, 'בדיקת מערכת תורנויות + תזכורות — הכל עובד!');
  Logger.log(ok ? 'הודעה נשלחה' : 'שליחה נכשלה');
}

function testRecessReminder() { sendRecessReminder(); }
function testLunchReminder() { sendLunchReminder(); }
function testCentralReminders() { checkAndSendReminders(); }
