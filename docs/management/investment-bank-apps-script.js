/**
 * Google Apps Script — בנק השקעות | אורט בית הערבה
 *
 * מערכת חיזוקים חיוביים: כל איש צוות מנפיק "פתק השקעה" לתלמיד
 * על התנהגות חיובית, והתלמיד צובר נקודות וממיר לתגמולים.
 *
 * ════════════════════════════════════════════════════════════
 * הוראות התקנה (מייטל — עשי את זה פעם אחת, לוקח 5 דקות)
 * ════════════════════════════════════════════════════════════
 *
 * 1. פתחי Google Drive → New → Google Sheets → שם: "בנק השקעות — אורט בית הערבה"
 * 2. העתיקי את ה-Sheet ID מה-URL (החלק בין /d/ ל-/edit)
 *    דוגמה: https://docs.google.com/spreadsheets/d/XXXXXXXXX/edit  ← ה-XXX הוא ה-ID
 * 3. ב-Sheet: Extensions → Apps Script
 * 4. מחקי את כל הקוד שיש ב-Editor, והדביקי את כל הקוד מהקובץ הזה
 * 5. עדכני את SHEET_ID למטה (שורה 25)
 * 6. הריצי פעם אחת את הפונקציה setupSheets() — כפתור Run למעלה (תאשרי הרשאות)
 *    זה יוצר את 4 הטאבים האוטומטית עם כותרות עמודות ונתוני ברירת מחדל
 * 7. Deploy → New deployment → Web app
 *    - Description: "Investment Bank v1"
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Deploy → אשרי הרשאות → העתיקי את ה-Web app URL
 * 8. פתחי את investment-bank.html, ועדכני את הקבוע APPS_SCRIPT_URL למטה בקוד
 *
 * ════════════════════════════════════════════════════════════
 */

var SHEET_ID = '1eESmCDGGBawmYzf1kKF6ylvGWks4vbYQCoqU6B1cRM0';

// 8 קטגוריות לפי 5 הממדים. כל פתק = נקודה אחת.
var CATEGORIES = {
  'היית שם בשביל מישהו':                 { points: 1, dim: 'belong' },
  'תרמת לכיתה או לבית הספר':             { points: 1, dim: 'belong' },
  'תקשרת בכבוד — דיברת או הקשבת':         { points: 1, dim: 'respect' },
  'פתרת מצב קשה בלי לפוצץ':               { points: 1, dim: 'respect' },
  'התמדת במשימה גם כשהיה קשה':            { points: 1, dim: 'motiv' },
  'העזת לנסות משהו שקשה לך':              { points: 1, dim: 'capable' },
  'הראית יוזמה עצמאית':                  { points: 1, dim: 'auto' },
  'תיקנת משהו שעשית — התנצלת, חזרת':      { points: 1, dim: 'auto' }
};

// מכסה יומית לפי תפקיד
var DAILY_QUOTA = {
  'מורה':    5,
  'מחנכת':   8,
  'יועצת':  10,
  'מנהלת':  15,
  'אחר':     5   // בנות שירות, סייעות, מנקה, אבות בית
};

// קטלוג תגמולים (ברירת מחדל — מייטל תוכל לערוך בטאב rewards_catalog ידנית)
var DEFAULT_REWARDS = [
  // שלב 1 — 3 פתקים · ניצחונות קטנים
  { cost: 3,  name: 'בחירת שיר להפסקה',                      type: 'אוטונומיה' },
  { cost: 3,  name: 'בחירת המקום שלך בכיתה ליום',             type: 'אוטונומיה' },
  { cost: 3,  name: 'עוזר המורה ליום בנושא שמעניין אותך',     type: 'משמעות' },
  { cost: 3,  name: 'הפעלת הפלייליסט בסדנה המקצועית',         type: 'אוטונומיה' },
  // שלב 2 — 7 פתקים · טעימה קטנה
  { cost: 7,  name: 'שתיה או חטיף מהמקרר של ביה"ס',           type: 'מוחשי' },
  { cost: 7,  name: 'מדבקת "השקעה" + איזכור פומבי בשיעור',    type: 'מוחשי' },
  { cost: 7,  name: 'אוזניות ומוזיקה 20 דק\' בעבודה עצמית',   type: 'אוטונומיה' },
  { cost: 7,  name: 'להצטרף לכיתה אחרת לשיעור אחד',           type: 'אוטונומיה' },
  { cost: 7,  name: 'שליח ביה"ס ליום',                       type: 'משמעות' },
  { cost: 7,  name: 'אחריות על משימה מיוחדת בכיתה',          type: 'משמעות' },
  { cost: 7,  name: 'DJ של הסדנה — הוספת שיר לפלייליסט הקבוע', type: 'אוטונומיה' },
  // שלב 3 — 15 פתקים · משהו אמיתי
  { cost: 15, name: 'תלוש גלידה / שייק / משקה מיוחד',         type: 'מוחשי' },
  { cost: 15, name: 'ווצאפ גאוותי מהמנהלת להורים',            type: 'הורים' },
  { cost: 15, name: 'בחירת פעילות בשעה חברתית לכל הכיתה',     type: 'משמעות' },
  { cost: 15, name: 'DJ ביה"ס ליום — 5 שירים לפלייליסט ההפסקות', type: 'סטטוס' },
  { cost: 15, name: 'הובלת חלק קטן של שיעור בנושא שבחרת',     type: 'משמעות' },
  { cost: 15, name: 'שימוש בציוד מקצועי מיוחד בסדנה',         type: 'משמעות' },
  // שלב 4 — 25 פתקים · משמעותי
  { cost: 25, name: 'זוג כרטיסי קולנוע',                     type: 'מוחשי' },
  { cost: 25, name: 'קיצור יום לימודים אחד',                 type: 'אוטונומיה' },
  { cost: 25, name: 'תפקיד מיוחד בטקס בית ספרי',             type: 'משמעות' },
  { cost: 25, name: 'סדנה מקצועית אישית עם מורה מומחה',      type: 'משמעות' },
  { cost: 25, name: 'מתנה קטנה ממותגת "בנק השקעות"',          type: 'מוחשי' },
  { cost: 25, name: 'יום התמחות חיצוני באתר עבודה בתחום המגמה', type: 'משמעות' },
  { cost: 25, name: 'ציוד אישי למגמה — הסט המקצועי שלך',      type: 'מוחשי' },
  // שלב 5 — 40 פתקים · הלב של המערכת
  { cost: 40, name: 'השקעה אמיתית — סדנה / ספר / קורס / חוויה לבחירתך (עד 200₪)', type: 'השקעה' }
];

// ============================================
// Web App Entry Points
// ============================================

function doGet(e) {
  var callback = (e.parameter.callback || 'callback').replace(/[^a-zA-Z0-9_]/g, '');
  var action = e.parameter.action || '';

  try {
    var result;
    switch (action) {
      case 'getBalance':    result = getBalance_(e.parameter.student_id); break;
      case 'getStudent':    result = getStudentHistory_(e.parameter.student_id); break;
      case 'getDashboard':  result = getDashboard_(); break;
      case 'getQuota':      result = getQuota_(e.parameter.issuer); break;
      case 'getRewards':    result = getRewards_(); break;
      case 'issue':         result = issueInvestment_(e.parameter); break;
      case 'redeem':        result = redeemReward_(e.parameter); break;
      default:              result = { result: 'ok', message: 'investment-bank API v2' };
    }
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch (err) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify({ result: 'error', message: err.toString().substring(0, 300) }) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action || '';
    var result;

    switch (action) {
      case 'issue':   result = issueInvestment_(data); break;
      case 'redeem':  result = redeemReward_(data); break;
      default:        result = { result: 'error', message: 'unknown action: ' + action };
    }
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString().substring(0, 300) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// SETUP — הרצה חד-פעמית
// ============================================

function setupSheets() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // Sheet 1: investments — כל הפתקים
  ensureSheet_(ss, 'investments', [
    'id', 'timestamp', 'student_id', 'student_name', 'student_class',
    'issuer_name', 'issuer_role', 'category', 'personal_note', 'points', 'dimension'
  ]);

  // Sheet 2: rewards_catalog — רשימת תגמולים
  var rewards = ensureSheet_(ss, 'rewards_catalog', ['cost', 'name', 'type']);
  if (rewards.getLastRow() <= 1) {
    var rows = DEFAULT_REWARDS.map(function (r) { return [r.cost, r.name, r.type]; });
    rewards.getRange(2, 1, rows.length, 3).setValues(rows);
  }

  // Sheet 3: redemptions — מימושים
  ensureSheet_(ss, 'redemptions', [
    'id', 'timestamp', 'student_id', 'student_name', 'reward_name', 'cost', 'approver'
  ]);

  // Sheet 4: staff_quotas — מעקב מכסה יומית
  ensureSheet_(ss, 'staff_quotas', ['issuer', 'date', 'count']);

  // Sheet 5: error_log — לוג שגיאות לאבחון
  ensureSheet_(ss, 'error_log', ['timestamp', 'action', 'issuer', 'student_id', 'error', 'raw_params']);

  SpreadsheetApp.getUi().alert('מוכן! 5 טאבים נוצרו בהצלחה. אפשר להמשיך ל-Deploy.');
}

function logError_(ss, action, issuer, studentId, error, params) {
  try {
    var sh = ss.getSheetByName('error_log');
    if (!sh) sh = ensureSheet_(ss, 'error_log', ['timestamp', 'action', 'issuer', 'student_id', 'error', 'raw_params']);
    sh.appendRow([new Date().toISOString(), action || '', issuer || '', studentId || '', String(error).substring(0, 300), JSON.stringify(params || {}).substring(0, 500)]);
  } catch (e) { /* swallow — לוג לא צריך להפיל את הזרימה */ }
}

function ensureSheet_(ss, name, headers) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#E8E3F5');
    sh.setFrozenRows(1);
  }
  return sh;
}

// ============================================
// WRITE — issue new investment
// ============================================

function issueInvestment_(data) {
  var ss;
  try { ss = SpreadsheetApp.openById(SHEET_ID); } catch (e) {
    return { result: 'error', message: 'שגיאת חיבור ל-Sheet: ' + e.toString().substring(0, 150) };
  }

  // ולידציות
  if (!data.student_id) { logError_(ss, 'issue', data.issuer_name, data.student_id, 'חסר תלמיד', data); return { result: 'error', message: 'חסר תלמיד' }; }
  if (!data.category)   { logError_(ss, 'issue', data.issuer_name, data.student_id, 'חסרה קטגוריה', data); return { result: 'error', message: 'חסרה קטגוריה' }; }
  if (!data.personal_note || data.personal_note.length < 15) {
    logError_(ss, 'issue', data.issuer_name, data.student_id, 'הערה קצרה מדי', data);
    return { result: 'error', message: 'הערה אישית חייבת להיות לפחות 15 תווים' };
  }
  if (!data.issuer_name || !data.issuer_role) {
    logError_(ss, 'issue', data.issuer_name, data.student_id, 'חסר פרטי מנפיק', data);
    return { result: 'error', message: 'חסר פרטי מנפיק' };
  }

  var cat = CATEGORIES[data.category];
  if (!cat) {
    logError_(ss, 'issue', data.issuer_name, data.student_id, 'קטגוריה לא מוכרת: ' + data.category, data);
    return { result: 'error', message: 'קטגוריה לא מוכרת' };
  }

  // LockService — מונע race condition בין מנפיקים במקביל
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { result: 'error', message: 'המערכת עמוסה, נסו שוב בעוד רגע' };
  }

  try {
    // Idempotency — אם הפתק עם אותו id כבר קיים, להחזיר success בלי לכתוב שוב
    if (data.id) {
      var existingRow = findInvestmentById_(ss, data.id);
      if (existingRow) {
        return {
          result: 'success',
          id: data.id,
          points: cat.points,
          dimension: cat.dim,
          duplicate: true,
          message: 'הפתק כבר נשמר קודם'
        };
      }
    }

    // בדיקת מכסה יומית
    var quota = DAILY_QUOTA[data.issuer_role] || 5;
    var today = Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'yyyy-MM-dd');
    var currentCount = getQuotaCount_(ss, data.issuer_name, today);

    if (currentCount >= quota) {
      logError_(ss, 'issue', data.issuer_name, data.student_id, 'מכסה יומית', data);
      return { result: 'error', message: 'הגעת למכסה היומית שלך (' + quota + '). ננסה שוב מחר.' };
    }

    // שמירה — משתמש ב-client_id אם סופק כדי למנוע כפילויות
    var id = data.id || ('SRV-' + Utilities.getUuid().substring(0, 8));
    var timestamp = new Date().toISOString();
    var sh = ss.getSheetByName('investments');
    sh.appendRow([
      id, timestamp, data.student_id, data.student_name || '', data.student_class || '',
      data.issuer_name, data.issuer_role, data.category, data.personal_note, cat.points, cat.dim
    ]);

    incrementQuota_(ss, data.issuer_name, today);

    return {
      result: 'success',
      id: id,
      points: cat.points,
      dimension: cat.dim,
      quota_used: currentCount + 1,
      quota_max: quota
    };
  } catch (e) {
    logError_(ss, 'issue', data.issuer_name, data.student_id, e.toString(), data);
    return { result: 'error', message: 'שגיאה: ' + e.toString().substring(0, 200) };
  } finally {
    lock.releaseLock();
  }
}

function findInvestmentById_(ss, id) {
  var sh = ss.getSheetByName('investments');
  if (!sh) return null;
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) return i + 1;
  }
  return null;
}

// ============================================
// WRITE — redeem reward
// ============================================

function redeemReward_(data) {
  if (!data.student_id || !data.reward_name || !data.cost || !data.approver) {
    return { result: 'error', message: 'חסרים פרטים' };
  }

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var balance = calcBalance_(ss, data.student_id);
  if (balance < data.cost) {
    return { result: 'error', message: 'יתרה לא מספקת. יש ' + balance + ', צריך ' + data.cost };
  }

  var sh = ss.getSheetByName('redemptions');
  var id = Utilities.getUuid().substring(0, 8);
  sh.appendRow([
    id, new Date().toISOString(), data.student_id, data.student_name || '',
    data.reward_name, data.cost, data.approver
  ]);

  return { result: 'success', id: id, new_balance: balance - data.cost };
}

// ============================================
// READ — balance + history
// ============================================

function getBalance_(studentId) {
  if (!studentId) return { result: 'error', message: 'חסר תלמיד' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  return { result: 'success', balance: calcBalance_(ss, studentId) };
}

function getStudentHistory_(studentId) {
  if (!studentId) return { result: 'error', message: 'חסר תלמיד' };
  var ss = SpreadsheetApp.openById(SHEET_ID);

  var investments = readSheet_(ss, 'investments').filter(function (r) {
    return String(r.student_id) === String(studentId);
  });
  var redemptions = readSheet_(ss, 'redemptions').filter(function (r) {
    return String(r.student_id) === String(studentId);
  });
  var earned = investments.reduce(function (s, r) { return s + (Number(r.points) || 0); }, 0);
  var spent = redemptions.reduce(function (s, r) { return s + (Number(r.cost) || 0); }, 0);

  return {
    result: 'success',
    balance: earned - spent,
    total_earned: earned,
    total_spent: spent,
    investments: investments,
    redemptions: redemptions
  };
}

function calcBalance_(ss, studentId) {
  var investments = readSheet_(ss, 'investments').filter(function (r) {
    return String(r.student_id) === String(studentId);
  });
  var redemptions = readSheet_(ss, 'redemptions').filter(function (r) {
    return String(r.student_id) === String(studentId);
  });
  var earned = investments.reduce(function (s, r) { return s + (Number(r.points) || 0); }, 0);
  var spent = redemptions.reduce(function (s, r) { return s + (Number(r.cost) || 0); }, 0);
  return earned - spent;
}

// ============================================
// READ — dashboard (admin)
// ============================================

function getDashboard_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var investments = readSheet_(ss, 'investments');
  var redemptions = readSheet_(ss, 'redemptions');

  // מצטברים לפי תלמיד
  var perStudent = {};
  investments.forEach(function (r) {
    var k = r.student_id;
    if (!perStudent[k]) perStudent[k] = { student_id: k, student_name: r.student_name, student_class: r.student_class, earned: 0, count: 0 };
    perStudent[k].earned += Number(r.points) || 0;
    perStudent[k].count += 1;
  });
  redemptions.forEach(function (r) {
    var k = r.student_id;
    if (!perStudent[k]) perStudent[k] = { student_id: k, student_name: r.student_name, earned: 0, count: 0 };
    perStudent[k].spent = (perStudent[k].spent || 0) + (Number(r.cost) || 0);
  });

  // מצטברים לפי מנפיק
  var perIssuer = {};
  investments.forEach(function (r) {
    var k = r.issuer_name;
    if (!perIssuer[k]) perIssuer[k] = { name: k, role: r.issuer_role, count: 0, points: 0 };
    perIssuer[k].count += 1;
    perIssuer[k].points += Number(r.points) || 0;
  });

  return {
    result: 'success',
    total_tickets: investments.length,
    total_points: investments.reduce(function (s, r) { return s + (Number(r.points) || 0); }, 0),
    total_redemptions: redemptions.length,
    per_student: Object.keys(perStudent).map(function (k) { return perStudent[k]; }),
    per_issuer: Object.keys(perIssuer).map(function (k) { return perIssuer[k]; }),
    recent: investments.slice(-20).reverse()
  };
}

// ============================================
// READ — helpers
// ============================================

function getQuota_(issuer) {
  if (!issuer) return { result: 'error', message: 'חסר שם' };
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var today = Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'yyyy-MM-dd');
  return { result: 'success', count: getQuotaCount_(ss, issuer, today) };
}

function getRewards_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  return { result: 'success', rewards: readSheet_(ss, 'rewards_catalog') };
}

function getQuotaCount_(ss, issuer, dateStr) {
  var sh = ss.getSheetByName('staff_quotas');
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === issuer && data[i][1] === dateStr) return Number(data[i][2]) || 0;
  }
  return 0;
}

function incrementQuota_(ss, issuer, dateStr) {
  var sh = ss.getSheetByName('staff_quotas');
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === issuer && data[i][1] === dateStr) {
      sh.getRange(i + 1, 3).setValue((Number(data[i][2]) || 0) + 1);
      return;
    }
  }
  sh.appendRow([issuer, dateStr, 1]);
}

function readSheet_(ss, name) {
  var sh = ss.getSheetByName(name);
  if (!sh) return [];
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).map(function (row) {
    var obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i]; });
    return obj;
  });
}
