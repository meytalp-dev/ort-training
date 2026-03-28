/**
 * Google Apps Script — הקמת CRM שיווקי | מיטל פלג
 *
 * הוראות:
 * 1. פתחי Google Sheet חדש בשם "CRM שיווק — מיטל פלג"
 * 2. Extensions → Apps Script
 * 3. העתיקי את הקוד הזה
 * 4. הריצי setupCRM() פעם אחת
 *
 * הסקריפט יוצר אוטומטית:
 * - גיליון לידים (leads)
 * - גיליון הדרכות (trainings)
 * - גיליון תוכן (content)
 * - גיליון ניוזלטר (newsletter)
 * - דשבורד סיכום (dashboard)
 * - לוג פעולות (log)
 *
 * אחרי ההקמה — העתיקי את ה-SPREADSHEET_ID לתוך marketing-apps-script.js
 */

// ============================================
// הקמת CRM מלא
// ============================================

function setupCRM() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('מתחיל הקמת CRM...');

  // ===== 1. גיליון לידים =====
  var leads = createOrGetSheet_(ss, 'לידים', [
    'שם', 'מייל', 'טלפון', 'תפקיד', 'מקור',
    'תאריך רישום', 'סטטוס', 'עניין', 'followup_sent',
    'welcome_sent', 'ניוזלטר', 'הערות', 'ציון (1-5)'
  ]);
  formatSheet_(leads, {
    colWidths: { 1: 120, 2: 200, 3: 120, 4: 120, 5: 100, 6: 120, 7: 100, 8: 150, 9: 100, 10: 100, 11: 80, 12: 200, 13: 60 },
    headerColor: '#059669',
    freezeRows: 1,
    freezeCols: 2
  });

  // Validation — סטטוס
  setDropdown_(leads, 'G2:G500', ['new', 'contacted', 'interested', 'registered', 'completed', 'inactive']);
  // Validation — מקור
  setDropdown_(leads, 'E2:E500', ['website', 'facebook', 'instagram', 'linkedin', 'whatsapp', 'referral', 'google', 'other']);
  // Validation — ניוזלטר
  setDropdown_(leads, 'K2:K500', ['active', 'unsubscribed']);
  // Validation — ציון
  setDropdown_(leads, 'M2:M500', ['1', '2', '3', '4', '5']);

  // Conditional formatting — סטטוס
  addStatusColors_(leads, 7, {
    'new': '#DBEAFE',
    'contacted': '#FEF3C7',
    'interested': '#D1FAE5',
    'registered': '#ECFDF5',
    'completed': '#F0FDF4',
    'inactive': '#F3F4F6'
  });

  Logger.log('גיליון לידים נוצר');

  // ===== 2. גיליון הדרכות =====
  var trainings = createOrGetSheet_(ss, 'הדרכות', [
    'שם הדרכה', 'תאריך התחלה', 'תאריך סיום', 'מספר משתתפים',
    'מחיר', 'סטטוס', 'סוג', 'קישור', 'ציון משוב ממוצע', 'הערות'
  ]);
  formatSheet_(trainings, {
    colWidths: { 1: 200, 2: 120, 3: 120, 4: 100, 5: 80, 6: 100, 7: 120, 8: 250, 9: 100, 10: 200 },
    headerColor: '#2563EB',
    freezeRows: 1
  });
  setDropdown_(trainings, 'F2:F100', ['planned', 'active', 'completed', 'cancelled']);
  setDropdown_(trainings, 'G2:G100', ['קורס', 'סדנה', 'הרצאה', 'ליווי אישי', 'zoom']);

  // הכנסת הדרכות קיימות
  trainings.appendRow(['קורס Claude Code למורים', '2026-01-15', '2026-02-12', 50, 0, 'completed', 'קורס', 'https://meytalp-dev.github.io/ort-presentation-builder/training/claude-code/', 8.9, 'מחזור ראשון']);
  trainings.appendRow(['Claude Code — מחזור א', '2026-04-07', '2026-05-05', '', 199, 'planned', 'קורס', '', '', 'מחזור בתשלום']);
  trainings.appendRow(['Claude Code — מחזור ב', '2026-05-12', '2026-06-09', '', 199, 'planned', 'קורס', '', '', 'מחזור בתשלום']);

  Logger.log('גיליון הדרכות נוצר');

  // ===== 3. גיליון תוכן =====
  var content = createOrGetSheet_(ss, 'תוכן', [
    'תאריך', 'פלטפורמה', 'סדרה', 'כותרת',
    'סטטוס', 'קישור', 'תגובות', 'שיתופים', 'הערות'
  ]);
  formatSheet_(content, {
    colWidths: { 1: 100, 2: 100, 3: 140, 4: 250, 5: 80, 6: 250, 7: 70, 8: 70, 9: 200 },
    headerColor: '#9333EA',
    freezeRows: 1
  });
  setDropdown_(content, 'B2:B500', ['Facebook', 'Instagram', 'LinkedIn', 'WhatsApp', 'Newsletter', 'Blog']);
  setDropdown_(content, 'C2:C500', ['#טיפ_AI_למורה', '#לפני_אחרי_AI', '#דקה_עם_מיטל', '#כלי_השבוע', '#מאחורי_הקלעים', 'מאמרון', 'אחר']);
  setDropdown_(content, 'E2:E500', ['draft', 'ready', 'published', 'scheduled']);

  addStatusColors_(content, 5, {
    'draft': '#FEF3C7',
    'ready': '#DBEAFE',
    'scheduled': '#E9D5FF',
    'published': '#D1FAE5'
  });

  Logger.log('גיליון תוכן נוצר');

  // ===== 4. גיליון ניוזלטר =====
  var newsletter = createOrGetSheet_(ss, 'ניוזלטר', [
    'שבוע', 'נושא (Subject)', 'preheader', 'כותרת',
    'תוכן HTML', 'טקסט CTA', 'קישור CTA', 'סטטוס'
  ]);
  formatSheet_(newsletter, {
    colWidths: { 1: 60, 2: 200, 3: 200, 4: 200, 5: 300, 6: 100, 7: 250, 8: 80 },
    headerColor: '#DC2626',
    freezeRows: 1
  });
  setDropdown_(newsletter, 'H2:H100', ['draft', 'ready', 'sent']);

  Logger.log('גיליון ניוזלטר נוצר');

  // ===== 5. דשבורד =====
  var dashboard = createOrGetSheet_(ss, 'דשבורד', [
    'מדד', 'ערך', 'עדכון אחרון'
  ]);
  formatSheet_(dashboard, {
    colWidths: { 1: 200, 2: 120, 3: 160 },
    headerColor: '#0D9488',
    freezeRows: 1
  });

  // נוסחאות אוטומטיות
  dashboard.appendRow(['סה"כ לידים', '=COUNTA(לידים!A2:A)', '=NOW()']);
  dashboard.appendRow(['לידים חדשים (7 ימים)', '=COUNTIFS(לידים!F2:F,">="&TODAY()-7)', '=NOW()']);
  dashboard.appendRow(['לידים מעוניינים', '=COUNTIF(לידים!G2:G,"interested")', '=NOW()']);
  dashboard.appendRow(['נרשמים', '=COUNTIF(לידים!G2:G,"registered")', '=NOW()']);
  dashboard.appendRow(['שיעור המרה', '=IFERROR(COUNTIF(לידים!G2:G,"registered")/COUNTA(לידים!A2:A)*100,0)&"%"', '=NOW()']);
  dashboard.appendRow(['מנויי ניוזלטר', '=COUNTIF(לידים!K2:K,"active")', '=NOW()']);
  dashboard.appendRow(['הדרכות פעילות', '=COUNTIF(הדרכות!F2:F,"active")', '=NOW()']);
  dashboard.appendRow(['הדרכות מתוכננות', '=COUNTIF(הדרכות!F2:F,"planned")', '=NOW()']);
  dashboard.appendRow(['תכנים שפורסמו', '=COUNTIF(תוכן!E2:E,"published")', '=NOW()']);
  dashboard.appendRow(['תכנים מוכנים', '=COUNTIF(תוכן!E2:E,"ready")', '=NOW()']);
  dashboard.appendRow(['ממוצע ציון לידים', '=IFERROR(AVERAGE(לידים!M2:M),"")', '=NOW()']);
  dashboard.appendRow(['מקור #1', '=IFERROR(INDEX(לידים!E2:E,MATCH(MAX(COUNTIF(לידים!E2:E,לידים!E2:E)),COUNTIF(לידים!E2:E,לידים!E2:E),0)),"")', '=NOW()']);

  // עיצוב מספרים גדולים
  dashboard.getRange('B2:B13').setFontSize(18).setFontWeight('bold');

  Logger.log('דשבורד נוצר');

  // ===== 6. לוג =====
  var logSheet = createOrGetSheet_(ss, 'לוג', [
    'תאריך', 'פעולה', 'פרטים'
  ]);
  formatSheet_(logSheet, {
    colWidths: { 1: 160, 2: 150, 3: 400 },
    headerColor: '#6B7280',
    freezeRows: 1
  });

  Logger.log('גיליון לוג נוצר');

  // ===== סידור סדר הגיליונות =====
  var sheetOrder = ['דשבורד', 'לידים', 'הדרכות', 'תוכן', 'ניוזלטר', 'לוג'];
  sheetOrder.forEach(function(name, idx) {
    var s = ss.getSheetByName(name);
    if (s) {
      ss.setActiveSheet(s);
      ss.moveActiveSheet(idx + 1);
    }
  });

  // מחיקת Sheet1 אם קיים
  var sheet1 = ss.getSheetByName('Sheet1') || ss.getSheetByName('גיליון1');
  if (sheet1 && ss.getSheets().length > 1) {
    ss.deleteSheet(sheet1);
  }

  // שמירת ה-ID ללוג
  Logger.log('');
  Logger.log('========================================');
  Logger.log('CRM הוקם בהצלחה!');
  Logger.log('');
  Logger.log('SPREADSHEET_ID: ' + ss.getId());
  Logger.log('');
  Logger.log('העתיקי את ה-ID הזה לתוך marketing-apps-script.js');
  Logger.log('(בשורה: SPREADSHEET_ID: "...")');
  Logger.log('========================================');
}

// ============================================
// פונקציות עזר
// ============================================

function createOrGetSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (sheet) {
    Logger.log('גיליון "' + name + '" כבר קיים — מדלג');
    return sheet;
  }
  sheet = ss.insertSheet(name);
  sheet.appendRow(headers);
  return sheet;
}

function formatSheet_(sheet, opts) {
  var lastCol = sheet.getLastColumn();

  // Header styling
  var headerRange = sheet.getRange(1, 1, 1, lastCol);
  headerRange.setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground(opts.headerColor)
    .setFontSize(11)
    .setHorizontalAlignment('center');

  // Column widths
  if (opts.colWidths) {
    Object.keys(opts.colWidths).forEach(function(col) {
      sheet.setColumnWidth(parseInt(col), opts.colWidths[col]);
    });
  }

  // Freeze
  if (opts.freezeRows) sheet.setFrozenRows(opts.freezeRows);
  if (opts.freezeCols) sheet.setFrozenColumns(opts.freezeCols);

  // RTL
  sheet.getRange(1, 1, 500, lastCol).setTextDirection(SpreadsheetApp.TextDirection.RIGHT_TO_LEFT);

  // Alternating row colors
  var bandingExists = sheet.getBandings();
  if (bandingExists.length === 0) {
    sheet.getRange(1, 1, 500, lastCol).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false);
  }
}

function setDropdown_(sheet, range, values) {
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(values, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(range).setDataValidation(rule);
}

function addStatusColors_(sheet, col, colorMap) {
  Object.keys(colorMap).forEach(function(status) {
    var rule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(status)
      .setBackground(colorMap[status])
      .setRanges([sheet.getRange(2, col, 500, 1)])
      .build();
    var rules = sheet.getConditionalFormatRules();
    rules.push(rule);
    sheet.setConditionalFormatRules(rules);
  });
}
