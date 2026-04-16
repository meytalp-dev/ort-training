/**
 * מערכת נתוני תלמידים מאובטחת — אורט בית הערבה
 * Apps Script Backend
 *
 * תפקיד: להגיש את נתוני התלמידים מ-Google Sheet במקום מקובץ JS סטטי.
 * כל 14+ מערכות הניהול טוענות את הנתונים מכאן במקום מ-student-data.js.
 *
 * ═══════════════════════════════════════════════════════════════
 *  הוראות התקנה:
 * ═══════════════════════════════════════════════════════════════
 *
 * 1) יצירת Google Sheet:
 *    - sheets.google.com → גיליון חדש → שם: "ort-students-secure"
 *    - טאב ראשון: "students" (שנה את שם Sheet1)
 *    - טאב שני: "grades" (הוסף טאב)
 *
 * 2) מילוי נתוני תלמידים:
 *    - בטאב students, שורה 1 = כותרות:
 *      id | last | first | cls | gender | dob | tz | city | street | num | apt | phone | parent1 | parent2 | megama | regDate | status
 *    - הדביקי את נתוני התלמידים מהקובץ students.json
 *    - *** או *** הריצי את הפונקציה importFromOldFormat() שמייבאת אוטומטית
 *
 * 3) הדבקת הקוד:
 *    - בגיליון → Extensions → Apps Script
 *    - מחקי את כל הקוד הקיים
 *    - הדביקי את הקוד הזה
 *    - שמרי (Ctrl+S)
 *
 * 4) הרצה ראשונית:
 *    - בחרי "setup" מהתפריט → Run
 *    - אשרי הרשאות
 *
 * 5) פריסה:
 *    - Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Deploy → תועתק URL
 *
 * 6) עדכון המערכות:
 *    - את ה-URL שקיבלת, הדביקי ב-student-data.js החדש
 *      (הקובץ הקטן שמחליף את הישן — ראי הוראות בפרויקט)
 *
 * ═══════════════════════════════════════════════════════════════
 */

// ============================================================
// CONFIG
// ============================================================
const SHEET_STUDENTS = 'students';
const SHEET_GRADES = 'grades';

const STUDENT_HEADERS = [
  'id','last','first','cls','gender','dob','tz','city','street','num','apt','phone','parent1','parent2','megama','regDate','status'
];

const MEGAMA_MAP = {"90306":"מחשבים","90603":"עיצוב שיער","91206":"אוטוטרוניקה","91207":"חשמל רכב"};

// ============================================================
// SETUP
// ============================================================
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Students sheet
  let sSheet = ss.getSheetByName(SHEET_STUDENTS);
  if (!sSheet) sSheet = ss.insertSheet(SHEET_STUDENTS);
  if (sSheet.getLastRow() === 0) {
    sSheet.appendRow(STUDENT_HEADERS);
    sSheet.getRange('1:1').setFontWeight('bold').setBackground('#F5F0E8');
    sSheet.setFrozenRows(1);
  }

  // Grades sheet
  let gSheet = ss.getSheetByName(SHEET_GRADES);
  if (!gSheet) gSheet = ss.insertSheet(SHEET_GRADES);
  if (gSheet.getLastRow() === 0) {
    gSheet.appendRow(['student_key','cls','avg1','avg2','subjects_json']);
    gSheet.getRange('1:1').setFontWeight('bold').setBackground('#F5F0E8');
    gSheet.setFrozenRows(1);
  }

  return 'setup complete';
}

// ============================================================
// doGET — main entry point
// ============================================================
function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    const action = params.action || 'students-js';

    // === Primary: return JavaScript for <script src="..."> loading ===
    if (action === 'students-js') {
      return serveStudentsAsJS();
    }
    if (action === 'grades-js') {
      return serveGradesAsJS();
    }

    // === Secondary: return JSON for fetch() calls ===
    if (action === 'students') {
      return respondJSON({ students: fetchStudents() });
    }
    if (action === 'grades') {
      return respondJSON({ grades: fetchGrades() });
    }
    if (action === 'ping') {
      return respondJSON({ ok: true, timestamp: new Date().toISOString() });
    }

    return respondJSON({ error: 'unknown action: ' + action });
  } catch (err) {
    return respondJSON({ error: err.toString() });
  }
}

// ============================================================
// SERVE AS JAVASCRIPT — for <script src="..."> tags
// ============================================================
function serveStudentsAsJS() {
  const students = fetchStudents();
  var js = '// Student data served securely from Google Sheets\n';
  js += '// Generated: ' + new Date().toISOString() + '\n\n';
  js += 'const MEGAMA = ' + JSON.stringify(MEGAMA_MAP) + ';\n\n';
  js += 'const STUDENTS = ' + JSON.stringify(students) + ';\n';

  return ContentService
    .createTextOutput(js)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function serveGradesAsJS() {
  const grades = fetchGrades();
  var js = '// Grade data served securely from Google Sheets\n';
  js += '// Generated: ' + new Date().toISOString() + '\n\n';
  js += 'const GRADES = ' + JSON.stringify(grades) + ';\n';

  return ContentService
    .createTextOutput(js)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// ============================================================
// DATA ACCESS
// ============================================================
function fetchStudents() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_STUDENTS);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  return data.slice(1).map(function(row) {
    const student = {};
    headers.forEach(function(h, i) {
      var val = row[i];
      // id should be numeric
      if (h === 'id' && typeof val === 'number') {
        student[h] = val;
      } else {
        student[h] = String(val || '');
      }
    });
    // Ensure id is numeric
    if (typeof student.id === 'string') student.id = parseInt(student.id) || 0;
    return student;
  }).filter(function(s) { return s.id > 0; }); // skip empty rows
}

function fetchGrades() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_GRADES);
  if (!sheet) return {};
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return {};

  const grades = {};
  for (var i = 1; i < data.length; i++) {
    var key = String(data[i][0] || '').trim();
    if (!key) continue;
    var subjects = {};
    try {
      subjects = JSON.parse(data[i][4] || '{}');
    } catch (e) {}
    grades[key] = {
      cls: String(data[i][1] || ''),
      avg1: data[i][2] === '' || data[i][2] === null ? null : Number(data[i][2]),
      avg2: data[i][3] === '' || data[i][3] === null ? null : Number(data[i][3]),
      subjects: subjects
    };
  }
  return grades;
}

// ============================================================
// IMPORT — run once to populate from existing data
// ============================================================
/**
 * Paste the content of your old STUDENTS array into the Sheet.
 * Or use this function: paste the old student-data.js content
 * into a temporary "import" sheet, then run this.
 *
 * Easiest method:
 * 1. Open the Sheet
 * 2. In the students tab, paste data from students.json/CSV
 * 3. Make sure headers match: id, last, first, cls, gender, dob, tz, city, street, num, apt, phone, parent1, parent2, megama, regDate, status
 */

// ============================================================
// UTILS
// ============================================================
function respondJSON(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
