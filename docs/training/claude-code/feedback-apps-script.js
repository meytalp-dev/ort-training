/**
 * Google Apps Script - Course Feedback Handler
 *
 * הוראות התקנה:
 * 1. פתחו Google Sheet חדש בשם "משוב קורס Claude Code"
 * 2. בשורה הראשונה הוסיפו את הכותרות (ראו למטה)
 * 3. לחצו על Extensions → Apps Script
 * 4. העתיקו את הקוד הזה לתוך הקובץ
 * 5. לחצו Deploy → New deployment → Web app
 * 6. בחרו: Execute as = Me, Who has access = Anyone
 * 7. העתיקו את ה-URL שקיבלתם
 * 8. הדביקו את ה-URL בקובץ feedback.html במקום 'YOUR_GOOGLE_APPS_SCRIPT_URL'
 *
 * חשוב: הטופס שולח POST (לא GET) כדי לתמוך בטקסט ארוך בעברית.
 * אם צריך לעדכן – Deploy → Manage deployments → עריכת גרסה חדשה
 *
 * כותרות הגיליון נוצרות אוטומטית בשליחה הראשונה (כולל השאלות המלאות).
 */

// Truncate text fields to prevent abuse
function safe(val, maxLen) {
  var s = val || '';
  return s.substring(0, maxLen || 500);
}

// Headers with full question text so you know what each column is
var HEADERS = [
  'תאריך',
  'שם (לא חובה)',
  'מאיפה את/ה?',
  'תפקיד',
  'בכמה מפגשים השתתפת?',
  'אם היית רק במפגש הראשון ולא המשכת — מדוע?',
  'מפגש 1 — הצעד הראשון (דירוג)',
  'מפגש 2 — בונים סוכנים (דירוג)',
  'מפגש 3 — מחברים הכל (דירוג)',
  'איזה מפגש הכי תרם לך?',
  'בהירות ההסברים (דירוג)',
  'קצב ההעברה',
  'זמינות לשאלות ותמיכה (דירוג)',
  'יכולת לעורר עניין והשראה (דירוג)',
  'אווירה כללית במפגשים (דירוג)',
  'האם הרגשת בנוח לשאול שאלות?',
  'מידת ההנאה מהקורס (דירוג)',
  'מה הרגע הכי מוצלח בקורס?',
  'איך הרגשת לגבי רמת הקושי של הקורס?',
  'האם ההתקנה הטכנית הייתה מאתגרת?',
  'כמה רלוונטי הקורס לעבודה היומיומית שלך? (דירוג)',
  'האם כבר השתמשת ב-Claude Code מאז המפגש הראשון?',
  'למה השתמשת? ספר/י לנו!',
  'איכות המצגות (דירוג)',
  'שימושיות דף הקישורים (דירוג)',
  'ההדגמות החיות (דירוג)',
  'לפני הקורס, כמה ידעת על AI?',
  'עכשיו, כמה בטוח/ה את/ה להשתמש ב-Claude Code? (דירוג)',
  'ציון כולל לקורס (1-10)',
  'הייתי ממליצ/ה לקולגה?',
  'מה הייתי משנה?',
  'מה הייתי שומר/ת בדיוק כמו שזה?',
  'נושאים שהייתי רוצה ללמוד בהמשך',
  'האם היה מספיק זמן לתרגול מעשי במפגשים?',
  'עוד משהו שחשוב לך שנדע?',
  'הערות לסקציות'
];

// Save feedback row from params object
function saveFeedback(params) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Add headers automatically if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    params.timestamp || new Date().toISOString(),
    safe(params.respondent_name, 100),
    safe(params.organization, 100),
    safe(params.role, 100),
    safe(params.meetings_attended, 10),
    safe(params.didnt_continue_reason, 1000),
    safe(params.meeting1_rating, 10),
    safe(params.meeting2_rating, 10),
    safe(params.meeting3_rating, 10),
    safe(params.best_meeting, 100),
    safe(params.clarity_rating, 10),
    safe(params.pace_rating, 50),
    safe(params.support_rating, 10),
    safe(params.inspiration_rating, 10),
    safe(params.atmosphere_rating, 10),
    safe(params.comfortable_asking, 50),
    safe(params.enjoyment_rating, 10),
    safe(params.best_moment, 1000),
    safe(params.difficulty_level, 50),
    safe(params.installation_challenge, 50),
    safe(params.relevance_rating, 10),
    safe(params.already_used, 50),
    safe(params.used_for, 1000),
    safe(params.presentations_rating, 10),
    safe(params.links_page_rating, 10),
    safe(params.demos_rating, 10),
    safe(params.prior_knowledge, 50),
    safe(params.confidence_rating, 10),
    safe(params.overall_score, 10),
    safe(params.would_recommend, 50),
    safe(params.what_to_change, 1000),
    safe(params.what_to_keep, 1000),
    safe(params.future_topics, 500),
    safe(params.enough_practice, 50),
    safe(params.anything_else, 1000),
    safe(params.section_comments, 2000)
  ]);
}

// POST handler — primary method (supports long Hebrew text)
function doPost(e) {
  try {
    var params = e.parameter;
    saveFeedback(params);
    return ContentService
      .createTextOutput(JSON.stringify({result: 'success', message: 'saved'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({result: 'error', message: error.toString().substring(0, 200)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET handler — fallback for JSONP (kept for backwards compatibility)
function doGet(e) {
  var params = e.parameter;
  var callback = (params.callback || 'callback').replace(/[^a-zA-Z0-9_]/g, '');

  try {
    saveFeedback(params);
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
