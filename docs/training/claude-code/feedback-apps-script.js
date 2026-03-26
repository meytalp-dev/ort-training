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
 * כותרות הגיליון (שורה 1):
 * תאריך | שם | ארגון | תפקיד | כמה מפגשים | סיבה שלא המשיך | מפגש 1 | מפגש 2 | מפגש 3 | מפגש שהכי תרם |
 * בהירות הסברים | קצב העברה | זמינות לשאלות | עניין והשראה |
 * אווירה | בנוח לשאול | הנאה | הרגע הכי מוצלח |
 * רמת קושי | התקנה מאתגרת |
 * רלוונטיות | כבר השתמש | למה השתמש |
 * איכות מצגות | דף קישורים | הדגמות חיות |
 * ידע קודם AI | ביטחון עצמי |
 * ציון כולל | ימליץ | מה לשנות | מה לשמור | נושאים להמשך |
 * מספיק תרגול | עוד משהו | הערות לסקציות
 */

function doGet(e) {
  var params = e.parameter;
  // Sanitize callback to prevent injection (allow only alphanumeric + underscore)
  var callback = (params.callback || 'callback').replace(/[^a-zA-Z0-9_]/g, '');

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Truncate text fields to prevent abuse (max 1000 chars)
    function safe(val, maxLen) {
      var s = val || '';
      return s.substring(0, maxLen || 500);
    }

    // Add new row with all feedback data
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
