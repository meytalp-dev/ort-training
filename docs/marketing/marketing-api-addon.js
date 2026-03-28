/**
 * Apps Script — API נוסף לדשבורד שיווקי
 *
 * הוראות: הדביקי את הקוד הזה בקובץ נוסף ב-Apps Script (לא להחליף את marketing!)
 * שם הקובץ: api
 *
 * זה מוסיף יכולות קריאה/כתיבה לדשבורד האינטרנטי.
 * אחרי הוספה — Deploy מחדש (גרסה חדשה)
 */

// ============================================
// הרחבת doGet — API לקריאת נתונים
// ============================================

/**
 * החליפי את doGet הקיים בקוד הזה (או מחקי את doGet מקובץ marketing
 * והשאירי רק את זה)
 */
function doGet(e) {
  var action = e.parameter.action || '';
  var callback = (e.parameter.callback || '').replace(/[^a-zA-Z0-9_]/g, '');

  var result;

  switch (action) {
    case 'getLeads':
      result = apiGetLeads_();
      break;
    case 'getContent':
      result = apiGetContent_();
      break;
    case 'getNewsletter':
      result = apiGetNewsletter_();
      break;
    case 'getDashboard':
      result = apiGetDashboard_();
      break;
    case 'getTrainings':
      result = apiGetTrainings_();
      break;
    case 'unsubscribe':
      if (e.parameter.email) unsubscribeLead(e.parameter.email);
      result = { result: 'success', message: 'unsubscribed' };
      break;
    default:
      result = { result: 'ok', message: 'marketing API active' };
  }

  var json = JSON.stringify(result);

  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// הרחבת doPost — שמירת תוכן מהדשבורד
// ============================================

/**
 * החליפי את doPost הקיים בקוד הזה
 */
function doPost(e) {
  try {
    var data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }

    var action = data.action || 'newLead';
    var result;

    switch (action) {
      case 'newLead':
        saveLead(data);
        sendWelcomeEmail(data);
        notifyNewLead(data);
        result = { result: 'success' };
        break;
      case 'saveContent':
        result = apiSaveContent_(data);
        break;
      case 'saveNewsletter':
        result = apiSaveNewsletter_(data);
        break;
      case 'updateLead':
        result = apiUpdateLead_(data);
        break;
      case 'unsubscribe':
        unsubscribeLead(data.email);
        result = { result: 'success' };
        break;
      default:
        result = { result: 'error', message: 'unknown action' };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString().substring(0, 200) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// API — קריאת נתונים
// ============================================

function apiGetLeads_() {
  var sheet = getOrCreateSheet_('leads');
  var rows = sheet.getDataRange().getValues();
  var leads = [];

  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0] && !rows[i][1]) continue;
    leads.push({
      name: rows[i][0] || '',
      email: rows[i][1] || '',
      phone: rows[i][2] || '',
      role: rows[i][3] || '',
      source: rows[i][4] || '',
      date: rows[i][5] instanceof Date ? Utilities.formatDate(rows[i][5], 'Asia/Jerusalem', 'yyyy-MM-dd') : String(rows[i][5]),
      status: rows[i][6] || 'new',
      interest: rows[i][7] || '',
      newsletter: rows[i][10] || 'active'
    });
  }

  return { result: 'success', leads: leads, total: leads.length };
}

function apiGetContent_() {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName('תוכן');
  if (!sheet) return { result: 'success', content: [], total: 0 };

  var rows = sheet.getDataRange().getValues();
  var content = [];

  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0] && !rows[i][3]) continue;
    content.push({
      row: i + 1,
      date: rows[i][0] instanceof Date ? Utilities.formatDate(rows[i][0], 'Asia/Jerusalem', 'yyyy-MM-dd') : String(rows[i][0]),
      platform: rows[i][1] || '',
      series: rows[i][2] || '',
      title: rows[i][3] || '',
      status: rows[i][4] || 'draft',
      link: rows[i][5] || '',
      comments: rows[i][6] || 0,
      shares: rows[i][7] || 0,
      notes: rows[i][8] || ''
    });
  }

  return { result: 'success', content: content, total: content.length };
}

function apiGetNewsletter_() {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName('ניוזלטר');
  if (!sheet) return { result: 'success', newsletters: [], total: 0 };

  var rows = sheet.getDataRange().getValues();
  var newsletters = [];

  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][1]) continue;
    newsletters.push({
      row: i + 1,
      week: rows[i][0] || '',
      subject: rows[i][1] || '',
      preheader: rows[i][2] || '',
      title: rows[i][3] || '',
      body: rows[i][4] || '',
      ctaText: rows[i][5] || '',
      ctaUrl: rows[i][6] || '',
      status: rows[i][7] || 'draft'
    });
  }

  return { result: 'success', newsletters: newsletters, total: newsletters.length };
}

function apiGetTrainings_() {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName('הדרכות');
  if (!sheet) return { result: 'success', trainings: [], total: 0 };

  var rows = sheet.getDataRange().getValues();
  var trainings = [];

  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    trainings.push({
      name: rows[i][0] || '',
      startDate: rows[i][1] instanceof Date ? Utilities.formatDate(rows[i][1], 'Asia/Jerusalem', 'yyyy-MM-dd') : String(rows[i][1]),
      endDate: rows[i][2] instanceof Date ? Utilities.formatDate(rows[i][2], 'Asia/Jerusalem', 'yyyy-MM-dd') : String(rows[i][2]),
      participants: rows[i][3] || 0,
      price: rows[i][4] || 0,
      status: rows[i][5] || '',
      type: rows[i][6] || '',
      link: rows[i][7] || '',
      rating: rows[i][8] || '',
      notes: rows[i][9] || ''
    });
  }

  return { result: 'success', trainings: trainings, total: trainings.length };
}

function apiGetDashboard_() {
  var leads = apiGetLeads_();
  var content = apiGetContent_();
  var trainings = apiGetTrainings_();
  var newsletter = apiGetNewsletter_();

  var now = new Date();
  var weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  var newLeads = 0;
  var sources = {};
  var statuses = {};

  leads.leads.forEach(function(l) {
    var d = new Date(l.date);
    if (d > weekAgo) newLeads++;
    sources[l.source || 'לא צוין'] = (sources[l.source || 'לא צוין'] || 0) + 1;
    statuses[l.status] = (statuses[l.status] || 0) + 1;
  });

  var publishedContent = content.content.filter(function(c) { return c.status === 'published'; }).length;
  var readyContent = content.content.filter(function(c) { return c.status === 'ready'; }).length;
  var activeTrainings = trainings.trainings.filter(function(t) { return t.status === 'active'; }).length;
  var plannedTrainings = trainings.trainings.filter(function(t) { return t.status === 'planned'; }).length;
  var subscribers = leads.leads.filter(function(l) { return l.newsletter !== 'unsubscribed'; }).length;

  return {
    result: 'success',
    stats: {
      totalLeads: leads.total,
      newLeads: newLeads,
      subscribers: subscribers,
      publishedContent: publishedContent,
      readyContent: readyContent,
      activeTrainings: activeTrainings,
      plannedTrainings: plannedTrainings,
      sentNewsletters: newsletter.newsletters.filter(function(n) { return n.status === 'sent'; }).length
    },
    sources: sources,
    statuses: statuses
  };
}

// ============================================
// API — כתיבת נתונים
// ============================================

function apiSaveContent_(data) {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName('תוכן');
  if (!sheet) return { result: 'error', message: 'sheet not found' };

  if (data.row) {
    // עדכון שורה קיימת
    var r = parseInt(data.row);
    sheet.getRange(r, 1).setValue(data.date || '');
    sheet.getRange(r, 2).setValue(data.platform || '');
    sheet.getRange(r, 3).setValue(data.series || '');
    sheet.getRange(r, 4).setValue(data.title || '');
    sheet.getRange(r, 5).setValue(data.status || 'draft');
    sheet.getRange(r, 6).setValue(data.link || '');
    sheet.getRange(r, 9).setValue(data.notes || '');
  } else {
    // שורה חדשה
    sheet.appendRow([
      data.date || new Date(),
      data.platform || '',
      data.series || '',
      data.title || '',
      data.status || 'draft',
      data.link || '',
      0, 0,
      data.notes || ''
    ]);
  }

  return { result: 'success' };
}

function apiSaveNewsletter_(data) {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName('ניוזלטר');
  if (!sheet) return { result: 'error', message: 'sheet not found' };

  if (data.row) {
    var r = parseInt(data.row);
    sheet.getRange(r, 1).setValue(data.week || '');
    sheet.getRange(r, 2).setValue(data.subject || '');
    sheet.getRange(r, 3).setValue(data.preheader || '');
    sheet.getRange(r, 4).setValue(data.title || '');
    sheet.getRange(r, 5).setValue(data.body || '');
    sheet.getRange(r, 6).setValue(data.ctaText || '');
    sheet.getRange(r, 7).setValue(data.ctaUrl || '');
    sheet.getRange(r, 8).setValue(data.status || 'draft');
  } else {
    sheet.appendRow([
      data.week || getWeekNumber() + 1,
      data.subject || '',
      data.preheader || '',
      data.title || '',
      data.body || '',
      data.ctaText || '',
      data.ctaUrl || '',
      data.status || 'draft'
    ]);
  }

  return { result: 'success' };
}

function apiUpdateLead_(data) {
  if (!data.email) return { result: 'error', message: 'email required' };

  var sheet = getOrCreateSheet_('leads');
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] === data.email) {
      if (data.status) sheet.getRange(i + 1, 7).setValue(data.status);
      if (data.notes) sheet.getRange(i + 1, 8).setValue(data.notes);
      if (data.newsletter) sheet.getRange(i + 1, 11).setValue(data.newsletter);
      return { result: 'success' };
    }
  }

  return { result: 'error', message: 'lead not found' };
}
