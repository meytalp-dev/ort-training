/**
 * Google Apps Script — מערכת דיווח אירועים חריגים | אורט בית הערבה
 *
 * הוראות התקנה:
 * 1. פתחי Google Sheet חדש בשם "דיווח אירועים חריגים — אורט בית הערבה"
 * 2. Extensions → Apps Script
 * 3. העתיקי את כל הקוד הזה
 * 4. עדכני את SHEET_ID למטה
 * 5. הריצי setupIncidentSheets() פעם אחת
 * 6. Deploy → New deployment → Web app (Execute as Me, Anyone)
 * 7. העתיקי את ה-URL — זה ה-endpoint למערכת
 */

var SHEET_ID = 'CHANGE_ME';

// ============================================
// Web App Entry Points
// ============================================

function doGet(e) {
  var callback = (e.parameter.callback || 'callback').replace(/[^a-zA-Z0-9_]/g, '');
  var action = e.parameter.action || '';

  try {
    var result;
    switch (action) {
      case 'getAllReports':
        result = getAllReports_();
        break;
      case 'getPending':
        result = getPending_();
        break;
      case 'ping':
        result = { result: 'ok', message: 'incident-report API active', timestamp: new Date().toISOString() };
        break;
      default:
        result = { result: 'ok', message: 'incident-report API active' };
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
      case 'saveReport':
        result = saveReport_(data.report);
        break;
      case 'approveReport':
        result = updateStatus_(data.reportId, 'approved', data.approvedBy);
        break;
      case 'rejectReport':
        result = updateStatus_(data.reportId, 'rejected', data.rejectedBy, data.reason);
        break;
      default:
        result = { result: 'error', message: 'unknown action: ' + action };
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
// READ — getAllReports
// ============================================

function getAllReports_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('דיווחים');
  if (!sheet || sheet.getLastRow() < 2) return { result: 'success', reports: [] };

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var reports = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    try {
      var report = JSON.parse(row[1] || '{}');
      report.status = row[2] || 'pending';
      report.approvedBy = row[3] || '';
      report.approvedAt = row[4] || '';
      report.rejectionReason = row[5] || '';
      reports.push(report);
    } catch (err) {
      // Skip malformed rows
    }
  }

  return { result: 'success', reports: reports };
}

// ============================================
// READ — getPending
// ============================================

function getPending_() {
  var all = getAllReports_();
  var pending = all.reports.filter(function(r) { return r.status === 'pending'; });
  return { result: 'success', reports: pending, count: pending.length };
}

// ============================================
// WRITE — saveReport
// ============================================

function saveReport_(report) {
  if (!report || !report.id) return { result: 'error', message: 'no report data' };

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('דיווחים');
  if (!sheet) return { result: 'error', message: 'sheet not found — run setupIncidentSheets()' };

  // Store as: ID | JSON | status | approvedBy | approvedAt | rejectionReason | reporter | date | eventTypes | victimName
  sheet.appendRow([
    report.id,
    JSON.stringify(report),
    'pending',
    '',
    '',
    '',
    report.reporter || '',
    report.date || '',
    (report.eventTypes || []).join(', '),
    report.victimName || ''
  ]);

  // Log
  logAction_(ss, report.reporter, 'save', 'Report: ' + (report.eventTypes || []).join(', ') + ' — ' + (report.victimName || 'no victim'));

  return { result: 'success', message: 'Report saved', id: report.id };
}

// ============================================
// WRITE — updateStatus (approve / reject)
// ============================================

function updateStatus_(reportId, newStatus, byUser, reason) {
  if (!reportId) return { result: 'error', message: 'no reportId' };

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('דיווחים');
  if (!sheet) return { result: 'error', message: 'sheet not found' };

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(reportId)) {
      var rowNum = i + 1;
      sheet.getRange(rowNum, 3).setValue(newStatus);
      sheet.getRange(rowNum, 4).setValue(byUser || '');
      sheet.getRange(rowNum, 5).setValue(new Date().toISOString());
      if (reason) sheet.getRange(rowNum, 6).setValue(reason);

      // Update JSON too
      try {
        var report = JSON.parse(data[i][1]);
        report.status = newStatus;
        if (newStatus === 'approved') {
          report.approvedBy = byUser;
          report.approvedAt = new Date().toISOString();
        } else {
          report.rejectedBy = byUser;
          report.rejectedAt = new Date().toISOString();
          report.rejectionReason = reason || '';
        }
        sheet.getRange(rowNum, 2).setValue(JSON.stringify(report));
      } catch (err) {}

      logAction_(ss, byUser, newStatus, 'Report ' + reportId);
      return { result: 'success', message: 'Status updated to ' + newStatus };
    }
  }

  return { result: 'error', message: 'report not found: ' + reportId };
}

// ============================================
// LOG
// ============================================

function logAction_(ss, user, action, details) {
  var logSheet = ss.getSheetByName('לוג');
  if (!logSheet) return;
  logSheet.appendRow([new Date().toISOString(), user || '', action || '', details || '']);
}

// ============================================
// SETUP — run once
// ============================================

function setupIncidentSheets() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // Main data sheet
  var main = ss.getSheetByName('דיווחים');
  if (!main) {
    main = ss.insertSheet('דיווחים');
    main.appendRow(['id', 'json', 'status', 'approvedBy', 'approvedAt', 'rejectionReason', 'reporter', 'date', 'eventTypes', 'victimName']);
    main.setFrozenRows(1);
    main.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#E8F0FE');
    main.setColumnWidth(1, 140);
    main.setColumnWidth(2, 80);  // JSON hidden
    main.setColumnWidth(3, 100);
    main.setColumnWidth(7, 120);
    main.setColumnWidth(8, 100);
    main.setColumnWidth(9, 200);
    main.setColumnWidth(10, 120);
  }

  // Log sheet
  var log = ss.getSheetByName('לוג');
  if (!log) {
    log = ss.insertSheet('לוג');
    log.appendRow(['timestamp', 'user', 'action', 'details']);
    log.setFrozenRows(1);
    log.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#FFF3E0');
  }

  Logger.log('Setup complete! Sheets created.');
}
