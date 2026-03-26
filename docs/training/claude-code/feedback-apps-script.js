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
 * תאריך | ארגון | תפקיד | מפגש 1 | מפגש 2 | מפגש 3 | מפגש שהכי תרם |
 * בהירות הסברים | קצב העברה | זמינות לשאלות | עניין והשראה |
 * אווירה | בנוח לשאול | הנאה | הרגע הכי מוצלח |
 * רמת קושי | התקנה מאתגרת |
 * רלוונטיות | כבר השתמש | למה השתמש |
 * איכות מצגות | דף קישורים | הדגמות חיות |
 * ידע קודם AI | ביטחון עצמי |
 * ציון כולל | ימליץ | מה לשנות | מה לשמור | נושאים להמשך
 */

function doGet(e) {
  var params = e.parameter;
  var callback = params.callback;

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Add new row with all feedback data
    sheet.appendRow([
      params.timestamp || new Date().toISOString(),
      params.organization || '',
      params.role || '',
      params.meeting1_rating || '',
      params.meeting2_rating || '',
      params.meeting3_rating || '',
      params.best_meeting || '',
      params.clarity_rating || '',
      params.pace_rating || '',
      params.support_rating || '',
      params.inspiration_rating || '',
      params.atmosphere_rating || '',
      params.comfortable_asking || '',
      params.enjoyment_rating || '',
      params.best_moment || '',
      params.difficulty_level || '',
      params.installation_challenge || '',
      params.relevance_rating || '',
      params.already_used || '',
      params.used_for || '',
      params.presentations_rating || '',
      params.links_page_rating || '',
      params.demos_rating || '',
      params.prior_knowledge || '',
      params.confidence_rating || '',
      params.overall_score || '',
      params.would_recommend || '',
      params.what_to_change || '',
      params.what_to_keep || '',
      params.future_topics || '',
      params.enough_practice || '',
      params.anything_else || ''
    ]);

    return ContentService
      .createTextOutput(callback + '({"result":"success","message":"saved"})')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    return ContentService
      .createTextOutput(callback + '({"result":"error","message":"' + error.toString() + '"})')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}
