/**
 * Google Apps Script — תזכורות תורנויות | אורט בית הערבה
 *
 * הוראות התקנה:
 * 1. פתחי את Google Sheet של פתיחות בוקר:
 *    https://docs.google.com/spreadsheets/d/1YySZl7g1ABfSY-oP18jANolg113Whz5s-wBWegMmqyk
 *    (שם כבר יש גיליון "צוות" עם שמות וטלפונים)
 * 2. Extensions → Apps Script
 * 3. הוסיפי קובץ חדש (+ → Script) והדביקי את הקוד הזה
 * 4. הריצי setupDutyReminders() פעם אחת
 * 5. זהו — תזכורות יישלחו אוטומטית:
 *    • 07:30 — תזכורת תורנות הפסקות
 *    • 12:00 — תזכורת תורנות צהריים
 */

// ==================== הגדרות ====================

// Green-API — אותם credentials כמו מערכת פתיחות בוקר
const DUTY_GREEN_API_INSTANCE = '7107577196';
const DUTY_GREEN_API_TOKEN = 'bbe2449cf3f84e11b1fd8dbf79541bc59b827f69e96e4268b3';
const DUTY_GREEN_API_URL = 'https://7107.api.greenapi.com';

const DUTY_PAGE_URL = 'https://meytalp-dev.github.io/ort-training/management/duties.html';

// ==================== נתוני תורנויות ====================

// ציוד לכל עמדה
const AREA_EQUIPMENT = {
  'כדורגל — דשא + פינג פונג': 'כדורגל + מחבטי פינג פונג וכדורים',
  'כדורסל — פרגולה': 'כדורסל',
  'דמקה — מספרה': 'לוחות דמקה + כלים',
  'שש בש — כיתות 1-2-3': 'לוחות שש בש + קוביות',
  'כדורעף — סדנא + 7-8-9': 'כדורעף + רשת'
};

// ימים: 0=ראשון, 1=שני, 2=שלישי, 3=רביעי, 4=חמישי
const RECESS_SCHEDULE = {
  // כדורגל / דשא + פינג פונג
  'כדורגל — דשא + פינג פונג': {
    0: ['יוסי'], 1: ['מנו'], 2: ['גיא'], 3: ['יוסי'], 4: ['יואב']
  },
  // כדורסל / פרגולה
  'כדורסל — פרגולה': {
    0: ['מנו'], 1: ['אושר'], 2: ['אופירה'], 3: ['ויקי'], 4: ['נעמה']
  },
  // דמקה / מספרה
  'דמקה — מספרה': {
    0: ['מאיה'], 1: ['פרלה'], 2: ['יעל'], 3: ['גיא'], 4: ['לינוי']
  },
  // שש בש / כיתות 1-2-3
  'שש בש — כיתות 1-2-3': {
    0: ['אפרת'], 1: ['משה'], 2: ['יואב'], 3: ['מירב'], 4: ['אליאל']
  },
  // כדורעף / סדנא + 7-8-9
  'כדורעף — סדנא + 7-8-9': {
    0: ['רעיה'], 1: ['שי'], 2: ['יעקב'], 3: ['יעקב'], 4: ['שי']
  }
};

const LUNCH_SCHEDULE = {
  0: [],                    // ראשון — לא מוגדר
  1: ['רווית', 'יסכה'],    // שני
  2: ['דורית', 'יואב'],    // שלישי
  3: ['רווית', 'מנו'],     // רביעי
  4: ['אופירה']            // חמישי
};

const DAY_NAMES = ['ראשון','שני','שלישי','רביעי','חמישי'];

// ==================== Setup ====================

/**
 * הריצי פעם אחת — יוצר שני טריגרים יומיים
 */
function setupDutyReminders() {
  // מחיקת טריגרים קודמים
  ScriptApp.getProjectTriggers().forEach(t => {
    const fn = t.getHandlerFunction();
    if (fn === 'sendRecessReminder' || fn === 'sendLunchReminder') {
      ScriptApp.deleteTrigger(t);
    }
  });

  // טריגר 07:30 — תורנות הפסקות
  ScriptApp.newTrigger('sendRecessReminder')
    .timeBased()
    .atHour(7)
    .nearMinute(30)
    .everyDays(1)
    .create();

  // טריגר 12:00 — תורנות צהריים
  ScriptApp.newTrigger('sendLunchReminder')
    .timeBased()
    .atHour(12)
    .nearMinute(0)
    .everyDays(1)
    .create();

  Logger.log('טריגרים הוגדרו: 07:30 הפסקות, 12:00 צהריים');
}

// ==================== תזכורת הפסקות (07:30) ====================

function sendRecessReminder() {
  const dayIdx = getDayIndex_();
  if (dayIdx < 0) return; // שבת/שישי

  const dayName = DAY_NAMES[dayIdx];

  // איסוף כל המורים התורנים היום
  const teacherDuties = {}; // name → [areas]

  for (const area in RECESS_SCHEDULE) {
    const teachers = RECESS_SCHEDULE[area][dayIdx] || [];
    teachers.forEach(name => {
      if (!teacherDuties[name]) teacherDuties[name] = [];
      teacherDuties[name].push(area);
    });
  }

  // שליחת הודעה לכל מורה
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  for (const name in teacherDuties) {
    const phone = getStaffPhoneByFirst_(ss, name);
    if (!phone) {
      Logger.log('חסר טלפון: ' + name);
      continue;
    }

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

    sendDutyWhatsApp_(phone, message);
    Logger.log('תזכורת הפסקות נשלחה ל: ' + name);
  }
}

// ==================== תזכורת צהריים (12:00) ====================

function sendLunchReminder() {
  const dayIdx = getDayIndex_();
  if (dayIdx < 0) return;

  const dayName = DAY_NAMES[dayIdx];
  const teachers = LUNCH_SCHEDULE[dayIdx] || [];

  if (teachers.length === 0) {
    Logger.log('אין תורנות צהריים היום (' + dayName + ')');
    return;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  teachers.forEach(name => {
    const phone = getStaffPhoneByFirst_(ss, name);
    if (!phone) {
      Logger.log('חסר טלפון: ' + name);
      return;
    }

    const message =
      `שלום ${name},\n\n` +
      `תזכורת: היום (יום ${dayName}) יש לך תורנות צהריים.\n` +
      `נא להגיע לחדר האוכל.\n\n` +
      `תודה רבה!`;

    sendDutyWhatsApp_(phone, message);
    Logger.log('תזכורת צהריים נשלחה ל: ' + name);
  });
}

// ==================== עזר ====================

/**
 * מחזיר אינדקס יום: 0=ראשון..4=חמישי, -1=שישי/שבת
 */
function getDayIndex_() {
  const d = new Date();
  const jsDay = d.getDay(); // JS: 0=Sun..6=Sat
  if (jsDay === 5 || jsDay === 6) return -1; // שישי/שבת
  return jsDay; // 0=ראשון=Sunday, 1=שני=Monday, etc.
}

/**
 * חיפוש טלפון לפי שם פרטי בגיליון "צוות"
 * הגיליון צריך להכיל עמודות: שם | טלפון
 */
function getStaffPhoneByFirst_(ss, firstName) {
  const sheet = ss.getSheetByName('צוות');
  if (!sheet) return null;

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const fullName = String(data[i][0]);
    // התאמה לפי שם פרטי (מופיע בתחילת או בסוף השם המלא)
    if (fullName === firstName ||
        fullName.startsWith(firstName + ' ') ||
        fullName.endsWith(' ' + firstName) ||
        fullName.includes(' ' + firstName + ' ')) {
      return String(data[i][1]);
    }
  }
  return null;
}

/**
 * שליחת WhatsApp דרך Green-API
 */
function sendDutyWhatsApp_(phone, message) {
  const url = `${DUTY_GREEN_API_URL}/waInstance${DUTY_GREEN_API_INSTANCE}/sendMessage/${DUTY_GREEN_API_TOKEN}`;

  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        chatId: phone + '@c.us',
        message: message
      }),
      muteHttpExceptions: true
    });

    const code = response.getResponseCode();
    if (code === 200) {
      Logger.log('WhatsApp OK → ' + phone);
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

// ==================== בדיקה ידנית ====================

/**
 * הריצי לבדיקה — תשלח את כל התזכורות של היום
 */
function testDutyReminders() {
  Logger.log('=== בדיקת תזכורות הפסקות ===');
  sendRecessReminder();
  Logger.log('=== בדיקת תזכורות צהריים ===');
  sendLunchReminder();
}
