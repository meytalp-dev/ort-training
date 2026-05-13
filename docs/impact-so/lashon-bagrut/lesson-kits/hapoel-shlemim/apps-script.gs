/**
 * דף עבודה של גזרת השלמים — Apps Script Backend
 *
 * שני endpoints:
 *   action=submit  → שומר תשובת תלמיד ל-Sheet
 *   action=explain → קורא ל-Gemini כדי להסביר *למה* התלמיד טעה (לא נותן את התשובה)
 *   action=stats   → מחזיר ל-teacher.html סיכום של הסשנים האחרונים
 *
 * הגדרות לפני פריסה:
 *   1. צרו Spreadsheet חדש, העתיקו את ה-ID לפרופרטי SHEET_ID
 *   2. צרו Gemini API key בכתובת aistudio.google.com → פרופרטי GEMINI_API_KEY
 *   3. פריסה → Deploy → New deployment → Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   4. העתיקו את ה-URL ל-API_ENDPOINT ב-worksheet.html ו-teacher.html
 */

const PROPS = PropertiesService.getScriptProperties();
const SHEET_NAME = 'submissions';

/* ─── Endpoint Router ─── */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    let result;
    if (action === 'submit') result = handleSubmit(body);
    else if (action === 'explain') result = handleExplain(body);
    else result = { error: 'unknown action: ' + action };
    return json(result);
  } catch (err) {
    return json({ error: String(err), stack: err.stack });
  }
}

function doGet(e) {
  try {
    const action = (e.parameter && e.parameter.action) || 'stats';
    if (action === 'stats') return json(handleStats(e.parameter));
    if (action === 'health') return json({ ok: true, time: new Date().toISOString() });
    return json({ error: 'unknown GET action: ' + action });
  } catch (err) {
    return json({ error: String(err), stack: err.stack });
  }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ─── Action: Submit (one row per item) ─── */
function handleSubmit(body) {
  const sheet = getSheet();
  const ts = new Date();
  const rows = [];
  const studentId = body.student_id || 'anon';
  const studentName = body.student_name || '';
  const worksheetId = body.worksheet_id || 'shlemim';
  const level = body.level || '';
  const sessionId = body.session_id || Utilities.getUuid();

  (body.items || []).forEach(it => {
    rows.push([
      ts,
      sessionId,
      studentId,
      studentName,
      worksheetId,
      level,
      it.item_id || '',
      it.field || '',
      it.user_answer || '',
      it.expected || '',
      it.correct === true ? 1 : 0,
      it.attempts || 1,
      it.seconds || ''
    ]);
  });

  if (rows.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }
  return { ok: true, rows_written: rows.length, session_id: sessionId };
}

/* ─── Action: Explain (Gemini call) ─── */
function handleExplain(body) {
  const apiKey = PROPS.getProperty('GEMINI_API_KEY');
  if (!apiKey) return { error: 'GEMINI_API_KEY not set in script properties' };

  const item = body.item || {};
  const userAnswer = body.user_answer || '';
  const expected = body.expected || '';
  const field = body.field || 'תשובה';

  const prompt = buildExplainPrompt(item, field, userAnswer, expected);

  const response = UrlFetchApp.fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
    {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 250 }
      }),
      muteHttpExceptions: true
    }
  );

  const data = JSON.parse(response.getContentText());
  if (data.error) return { error: data.error.message || JSON.stringify(data.error) };

  const text = (((data.candidates || [])[0] || {}).content || {}).parts || [];
  const explanation = text.map(p => p.text).join(' ').trim();
  return { ok: true, explanation: explanation || '(לא התקבל הסבר)' };
}

function buildExplainPrompt(item, field, userAnswer, expected) {
  const context = item.context || item.word || '';
  return [
    'אתה מורה ללשון עברית שמסביר לתלמיד תיכון בתוכנית 011281 (גזרת השלמים).',
    'התלמיד התבקש: ' + (item.instruction || ''),
    'ההקשר: ' + context.replace(/<[^>]*>/g, ''),
    'השדה שנדרש: ' + field,
    'התשובה הנכונה: ' + expected,
    'התלמיד כתב: "' + userAnswer + '"',
    '',
    'משימתך: הסבר במשפט אחד או שניים *מה הסיבה לטעות הספציפית הזו*.',
    'לא לתת את התשובה הנכונה. לא לחזור על השאלה.',
    'התמקד בבלבול הקונספטואלי (למשל: "נראה שזיהית את חיריק ואחריו דגש ל-פיעל, אבל זה למעשה...").',
    'דבר בגוף נוכח (אתה/את), בעברית, ברורה ועדינה.',
    'אסור לבצע סיווג בניין/גזרה — להשתמש רק במה שמוצג בנתונים.',
  ].join('\n');
}

/* ─── Action: Stats (for teacher.html) ─── */
function handleStats(params) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { sessions: [], summary: {} };

  const data = sheet.getRange(2, 1, lastRow - 1, 13).getValues();
  const worksheetFilter = params && params.worksheet_id;

  // Aggregate by session
  const sessions = {};
  const itemStats = {};
  let totalRows = 0;
  let totalCorrect = 0;

  data.forEach(row => {
    const [ts, sessionId, studentId, studentName, worksheetId, level, itemId, fieldName, userAns, expected, correct, attempts] = row;
    if (worksheetFilter && worksheetId !== worksheetFilter) return;

    totalRows++;
    if (correct === 1) totalCorrect++;

    if (!sessions[sessionId]) {
      sessions[sessionId] = {
        session_id: sessionId,
        student_id: studentId,
        student_name: studentName,
        worksheet_id: worksheetId,
        level: level,
        started_at: ts,
        total: 0,
        correct: 0,
        wrong: 0,
        items: []
      };
    }
    sessions[sessionId].total++;
    if (correct === 1) sessions[sessionId].correct++;
    else sessions[sessionId].wrong++;
    sessions[sessionId].items.push({ item_id: itemId, field: fieldName, correct: correct === 1, user_answer: userAns, expected: expected });

    // Item difficulty stats
    const key = itemId + '|' + fieldName;
    if (!itemStats[key]) itemStats[key] = { item_id: itemId, field: fieldName, total: 0, correct: 0 };
    itemStats[key].total++;
    if (correct === 1) itemStats[key].correct++;
  });

  const sessionList = Object.values(sessions).sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
  const itemList = Object.values(itemStats)
    .map(s => ({ ...s, pct: s.total > 0 ? Math.round(s.correct / s.total * 100) : 0 }))
    .sort((a, b) => a.pct - b.pct); // hardest first

  return {
    summary: {
      total_sessions: sessionList.length,
      total_responses: totalRows,
      correct_rate_pct: totalRows > 0 ? Math.round(totalCorrect / totalRows * 100) : 0,
      unique_students: new Set(sessionList.map(s => s.student_id)).size
    },
    sessions: sessionList.slice(0, 200),
    items: itemList
  };
}

/* ─── Sheet management ─── */
function getSheet() {
  const id = PROPS.getProperty('SHEET_ID');
  if (!id) throw new Error('SHEET_ID property not set');
  const ss = SpreadsheetApp.openById(id);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'timestamp', 'session_id', 'student_id', 'student_name', 'worksheet_id', 'level',
      'item_id', 'field', 'user_answer', 'expected', 'correct', 'attempts', 'seconds'
    ]);
    sheet.getRange('A1:M1').setFontWeight('bold').setBackground('#f3f4f6');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/* ─── Helper: run once after setup to verify config ─── */
function testSetup() {
  const sheetId = PROPS.getProperty('SHEET_ID');
  const apiKey = PROPS.getProperty('GEMINI_API_KEY');
  Logger.log('SHEET_ID: ' + (sheetId ? 'OK' : 'MISSING'));
  Logger.log('GEMINI_API_KEY: ' + (apiKey ? 'OK (length ' + apiKey.length + ')' : 'MISSING'));
  if (sheetId) {
    try {
      const ss = SpreadsheetApp.openById(sheetId);
      Logger.log('Sheet name: ' + ss.getName());
      getSheet();
      Logger.log('Sheet ready.');
    } catch (e) {
      Logger.log('Sheet access failed: ' + e.message);
    }
  }
}
