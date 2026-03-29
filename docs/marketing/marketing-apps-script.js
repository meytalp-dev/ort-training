/**
 * Google Apps Script — אוטומציות שיווק | מיטל פלג
 *
 * הוראות התקנה:
 * 1. פתחי Google Sheet חדש בשם "CRM שיווק — מיטל פלג"
 * 2. Extensions → Apps Script
 * 3. העתיקי את כל הקוד הזה
 * 4. עדכני את CONFIG למטה (Sheet ID, מייל שלך)
 * 5. הריצי setupAllTriggers() פעם אחת
 * 6. אשרי הרשאות
 * 7. Deploy → New deployment → Web app (Execute as Me, Anyone)
 * 8. העתיקי את ה-URL — זה ה-endpoint לטפסים
 */

// ============================================
// הגדרות
// ============================================

var CONFIG = {
  SPREADSHEET_ID: '1LXy0Eh7eNMXPb4nuGf99U5jYYQZ4HHpSBhwkRO00VK8',
  ADMIN_EMAIL: 'meytalp@bethaarava.ort.org.il',
  SITE_URL: 'https://meytalp-dev.github.io/ort-presentation-builder',
  BRAND_NAME: 'מיטל פלג — הדרכות AI למורים',
  WHATSAPP_LINK: 'https://wa.me/972526857000'
};

// ============================================
// 1. מיילים אוטומטיים — ברוכים הבאים
// ============================================

/**
 * מייל ברוכים הבאים — נשלח אוטומטית כשליד חדש נרשם
 */
function sendWelcomeEmail(lead) {
  var name = lead.name || 'שלום';
  var email = lead.email;

  if (!email) return;

  var subject = 'שמחה שהצטרפת! הנה מה שמחכה לך';

  var html = buildEmailTemplate({
    preheader: 'ברוכה הבאה למשפחת ההדרכות שלי',
    title: name + ', שמחה שהצטרפת!',
    body: [
      'תודה שנרשמת לקבל עדכונים על הדרכות AI למורים.',
      '',
      '<strong>מה מחכה לך:</strong>',
      '',
      '<div style="background:#F0FDFA;border-radius:8px;padding:16px;margin:12px 0">',
      '&#10004; גישה לתיק עבודות עם 131+ תוצרים דיגיטליים<br>',
      '&#10004; טיפים שבועיים על AI בחינוך<br>',
      '&#10004; הזמנה ראשונה למחזורי הדרכה חדשים<br>',
      '&#10004; משאבים חינמיים להורדה',
      '</div>',
      '',
      'בינתיים, מוזמנת להציץ בתיק העבודות שלי:'
    ].join('<br>'),
    ctaText: 'לתיק העבודות',
    ctaUrl: CONFIG.SITE_URL + '/marketing/portfolio.html',
    footer: 'שאלות? פשוט תשלחי הודעה ב-WhatsApp'
  });

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: html,
    name: CONFIG.BRAND_NAME
  });

  // סימון בגיליון
  markLeadAction(email, 'welcome_sent', new Date().toISOString());
}

// ============================================
// 2. ניוזלטר שבועי
// ============================================

/**
 * שולח ניוזלטר שבועי — רץ כל יום ראשון ב-09:00
 */
function sendWeeklyNewsletter() {
  var subscribers = getActiveSubscribers();
  if (subscribers.length === 0) return;

  var weekNum = getWeekNumber();
  var content = getNewsletterContent(weekNum);

  if (!content) {
    Logger.log('אין תוכן לניוזלטר השבוע — דלגתי');
    return;
  }

  var subject = content.subject;

  var html = buildEmailTemplate({
    preheader: content.preheader,
    title: content.title,
    body: content.body,
    ctaText: content.ctaText || 'לקריאה המלאה',
    ctaUrl: content.ctaUrl || CONFIG.SITE_URL,
    footer: 'קיבלת את המייל הזה כי נרשמת לעדכונים. <a href="' + CONFIG.SITE_URL + '/marketing/landing.html?unsubscribe=true" style="color:#9CA3AF">להסרה</a>'
  });

  // שליחה ב-BCC
  var batchSize = 50;
  for (var i = 0; i < subscribers.length; i += batchSize) {
    var batch = subscribers.slice(i, i + batchSize);
    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      subject: subject,
      htmlBody: html,
      name: CONFIG.BRAND_NAME,
      bcc: batch.map(function(s) { return s.email; }).join(',')
    });
  }

  // לוג
  logAction('newsletter_sent', 'שבוע ' + weekNum + ' — ' + subscribers.length + ' נמענים');
}

/**
 * תכני ניוזלטר — להוסיף תוכן לפי שבוע
 * מחזירה null אם אין תוכן מוכן
 */
function getNewsletterContent(weekNum) {
  var sheet = getOrCreateSheet_('newsletter_content');
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == weekNum && rows[i][6] !== 'sent') {
      sheet.getRange(i + 1, 7).setValue('sent');
      return {
        subject: rows[i][1],
        preheader: rows[i][2],
        title: rows[i][3],
        body: rows[i][4],
        ctaText: rows[i][5] || 'לקריאה',
        ctaUrl: rows[i][6] || CONFIG.SITE_URL
      };
    }
  }
  return null;
}

// ============================================
// 3. תזכורות פרסום
// ============================================

/**
 * תזכורת פרסום יומית — נשלחת כל יום ב-08:00
 * מבוססת על לוח הפרסום מהדשבורד
 */
function sendPublishingReminder() {
  var today = new Date();
  var dayOfWeek = today.getDay(); // 0=ראשון

  var schedule = {
    0: [  // ראשון
      { time: '10:00', platform: 'WhatsApp', series: '#טיפ_AI_למורה' },
      { time: '20:00', platform: 'Facebook', series: 'פוסט ערב' }
    ],
    1: [  // שני
      { time: '09:00', platform: 'LinkedIn', series: '#מאחורי_הקלעים' }
    ],
    2: [  // שלישי
      { time: '14:00', platform: 'Facebook', series: '#לפני_אחרי_AI' },
      { time: '19:00', platform: 'Instagram', series: '#דקה_עם_מיטל (רילס)' }
    ],
    3: [  // רביעי
      { time: '10:00', platform: 'LinkedIn', series: 'מאמרון AI בחינוך' },
      { time: '16:00', platform: 'WhatsApp', series: 'עדכון שבועי' }
    ],
    4: [  // חמישי
      { time: '12:00', platform: 'Instagram', series: '#כלי_השבוע' },
      { time: '20:00', platform: 'Facebook', series: 'פוסט סוף שבוע' }
    ]
  };

  var todayPosts = schedule[dayOfWeek];
  if (!todayPosts || todayPosts.length === 0) return;

  var dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  var dateStr = Utilities.formatDate(today, 'Asia/Jerusalem', 'dd/MM/yyyy');

  var platformColors = {
    'Facebook': '#1877F2',
    'Instagram': '#E4405F',
    'LinkedIn': '#0A66C2',
    'WhatsApp': '#25D366'
  };

  var postsHtml = todayPosts.map(function(post) {
    var color = platformColors[post.platform] || '#6B7280';
    return '<div style="display:flex;align-items:center;padding:12px;margin:8px 0;background:#F9FAFB;border-radius:8px;border-right:4px solid ' + color + '">' +
      '<div style="flex:1">' +
      '<strong style="color:' + color + '">' + post.platform + '</strong> ' +
      '<span style="color:#6B7280">| ' + post.time + '</span><br>' +
      '<span style="font-size:14px">' + post.series + '</span>' +
      '</div></div>';
  }).join('');

  var html = buildEmailTemplate({
    preheader: todayPosts.length + ' פרסומים מתוכננים להיום',
    title: 'יום ' + dayNames[dayOfWeek] + ' ' + dateStr,
    body: '<p style="margin:0 0 16px;color:#6B7280">הפרסומים של היום:</p>' + postsHtml +
      '<div style="margin-top:20px;padding:12px;background:#ECFDF5;border-radius:8px;text-align:center">' +
      '<strong>טיפ:</strong> הכיני את התוכן מראש ותזמני עם Meta Business Suite' +
      '</div>',
    ctaText: 'לדשבורד השיווק',
    ctaUrl: CONFIG.SITE_URL + '/marketing/dashboard.html',
    footer: 'תזכורת אוטומטית מלוח הפרסום שלך'
  });

  MailApp.sendEmail({
    to: CONFIG.ADMIN_EMAIL,
    subject: '📋 פרסומים להיום (' + dayNames[dayOfWeek] + ') — ' + todayPosts.length + ' פוסטים',
    htmlBody: html,
    name: 'לוח פרסום'
  });
}

// ============================================
// 4. מעקב לידים — התראות
// ============================================

/**
 * התראה על ליד חדש — נקראת מ-doPost
 */
function notifyNewLead(lead) {
  var html = buildEmailTemplate({
    preheader: 'ליד חדש נרשם!',
    title: 'ליד חדש: ' + (lead.name || 'ללא שם'),
    body: [
      '<table style="width:100%;border-collapse:collapse">',
      '<tr><td style="padding:8px;border-bottom:1px solid #E5E7EB;color:#6B7280">שם</td><td style="padding:8px;border-bottom:1px solid #E5E7EB"><strong>' + (lead.name || '—') + '</strong></td></tr>',
      '<tr><td style="padding:8px;border-bottom:1px solid #E5E7EB;color:#6B7280">מייל</td><td style="padding:8px;border-bottom:1px solid #E5E7EB">' + (lead.email || '—') + '</td></tr>',
      '<tr><td style="padding:8px;border-bottom:1px solid #E5E7EB;color:#6B7280">טלפון</td><td style="padding:8px;border-bottom:1px solid #E5E7EB">' + (lead.phone || '—') + '</td></tr>',
      '<tr><td style="padding:8px;border-bottom:1px solid #E5E7EB;color:#6B7280">מקור</td><td style="padding:8px;border-bottom:1px solid #E5E7EB">' + (lead.source || '—') + '</td></tr>',
      '<tr><td style="padding:8px;border-bottom:1px solid #E5E7EB;color:#6B7280">עניין</td><td style="padding:8px;border-bottom:1px solid #E5E7EB">' + (lead.interest || '—') + '</td></tr>',
      '<tr><td style="padding:8px;color:#6B7280">תאריך</td><td style="padding:8px">' + new Date().toLocaleDateString('he-IL') + '</td></tr>',
      '</table>'
    ].join(''),
    ctaText: 'פתחי את ה-CRM',
    ctaUrl: 'https://docs.google.com/spreadsheets/d/' + CONFIG.SPREADSHEET_ID,
    footer: ''
  });

  MailApp.sendEmail({
    to: CONFIG.ADMIN_EMAIL,
    subject: '🆕 ליד חדש: ' + (lead.name || lead.email),
    htmlBody: html,
    name: 'CRM שיווק'
  });
}

// ============================================
// 5. מייל מעקב — 3 ימים אחרי רישום
// ============================================

/**
 * בודק לידים שנרשמו לפני 3 ימים ושולח מייל מעקב
 * רץ כל יום ב-10:00
 */
function sendFollowUpEmails() {
  var sheet = getOrCreateSheet_('לידים');
  var rows = sheet.getDataRange().getValues();
  var threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  var targetDate = Utilities.formatDate(threeDaysAgo, 'Asia/Jerusalem', 'yyyy-MM-dd');

  for (var i = 1; i < rows.length; i++) {
    var regDate = rows[i][5]; // עמודה F — תאריך רישום
    var followUpSent = rows[i][8]; // עמודה I — followup_sent
    var email = rows[i][1]; // עמודה B — מייל
    var name = rows[i][0]; // עמודה A — שם

    if (!email || followUpSent) continue;

    var regDateStr = '';
    if (regDate instanceof Date) {
      regDateStr = Utilities.formatDate(regDate, 'Asia/Jerusalem', 'yyyy-MM-dd');
    } else {
      regDateStr = String(regDate).substring(0, 10);
    }

    if (regDateStr !== targetDate) continue;

    var html = buildEmailTemplate({
      preheader: 'ראיתי שנרשמת — רציתי לשאול...',
      title: (name || 'היי') + ', מה אומרת?',
      body: [
        'נרשמת לפני כמה ימים ורציתי לבדוק — יש משהו שאת מחפשת?',
        '',
        '<strong>הנה כמה דברים שאולי יעניינו אותך:</strong>',
        '',
        '<div style="background:#F0FDFA;border-radius:8px;padding:16px;margin:12px 0">',
        '&#10148; <a href="' + CONFIG.SITE_URL + '/marketing/portfolio.html" style="color:#0D9488;text-decoration:none">תיק עבודות</a> — 131+ תוצרים דיגיטליים<br><br>',
        '&#10148; <a href="' + CONFIG.SITE_URL + '/marketing/testimonials.html" style="color:#0D9488;text-decoration:none">מה אומרים</a> — משובים ממורים שהשתתפו<br><br>',
        '&#10148; <a href="' + CONFIG.WHATSAPP_LINK + '" style="color:#0D9488;text-decoration:none">שאלה? WhatsApp</a> — אני כאן',
        '</div>'
      ].join('<br>'),
      ctaText: 'לדף ההדרכות',
      ctaUrl: CONFIG.SITE_URL + '/marketing/landing.html',
      footer: ''
    });

    MailApp.sendEmail({
      to: email,
      subject: 'ראיתי שנרשמת — יש משהו שמעניין אותך?',
      htmlBody: html,
      name: CONFIG.BRAND_NAME
    });

    // סימון
    sheet.getRange(i + 1, 9).setValue(new Date().toISOString());
  }
}

// ============================================
// 6. דוח שבועי — סיכום שיווק
// ============================================

/**
 * דוח שבועי — נשלח כל שישי ב-12:00
 */
function sendWeeklyReport() {
  var sheet = getOrCreateSheet_('לידים');
  var logSheet = getOrCreateSheet_('log');

  // ספירת לידים חדשים השבוע
  var rows = sheet.getDataRange().getValues();
  var weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  var newLeads = 0;
  var totalLeads = rows.length - 1;
  var sources = {};

  for (var i = 1; i < rows.length; i++) {
    var regDate = rows[i][5];
    if (regDate instanceof Date && regDate > weekAgo) {
      newLeads++;
    }
    var source = rows[i][4] || 'לא צוין';
    sources[source] = (sources[source] || 0) + 1;
  }

  // ספירת פעולות מהלוג
  var logRows = logSheet.getDataRange().getValues();
  var emailsSent = 0;
  var newslettersSent = 0;

  for (var j = 1; j < logRows.length; j++) {
    var logDate = logRows[j][0];
    if (logDate instanceof Date && logDate > weekAgo) {
      if (String(logRows[j][1]).indexOf('welcome') > -1) emailsSent++;
      if (String(logRows[j][1]).indexOf('newsletter') > -1) newslettersSent++;
    }
  }

  // מקורות כ-HTML
  var sourcesHtml = Object.keys(sources).map(function(key) {
    return '<tr><td style="padding:6px 8px;border-bottom:1px solid #E5E7EB">' + key + '</td>' +
      '<td style="padding:6px 8px;border-bottom:1px solid #E5E7EB;text-align:center"><strong>' + sources[key] + '</strong></td></tr>';
  }).join('');

  var html = buildEmailTemplate({
    preheader: 'סיכום שבועי — ' + newLeads + ' לידים חדשים',
    title: 'דוח שבועי — שיווק',
    body: [
      '<div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap">',
      '<div style="flex:1;min-width:120px;background:#ECFDF5;border-radius:8px;padding:16px;text-align:center"><div style="font-size:28px;font-weight:bold;color:#059669">' + newLeads + '</div><div style="color:#6B7280;font-size:13px">לידים חדשים</div></div>',
      '<div style="flex:1;min-width:120px;background:#EFF6FF;border-radius:8px;padding:16px;text-align:center"><div style="font-size:28px;font-weight:bold;color:#2563EB">' + totalLeads + '</div><div style="color:#6B7280;font-size:13px">סה"כ לידים</div></div>',
      '<div style="flex:1;min-width:120px;background:#FDF4FF;border-radius:8px;padding:16px;text-align:center"><div style="font-size:28px;font-weight:bold;color:#9333EA">' + emailsSent + '</div><div style="color:#6B7280;font-size:13px">מיילים נשלחו</div></div>',
      '</div>',
      '',
      '<h3 style="margin:20px 0 8px;font-size:16px">מקורות לידים</h3>',
      '<table style="width:100%;border-collapse:collapse">' + sourcesHtml + '</table>',
      '',
      '<div style="margin-top:20px;padding:12px;background:#FEF3C7;border-radius:8px">',
      '<strong>תזכורת:</strong> לבדוק את הדשבורד ולתכנן את הפרסומים לשבוע הבא',
      '</div>'
    ].join(''),
    ctaText: 'לדשבורד',
    ctaUrl: CONFIG.SITE_URL + '/marketing/dashboard.html',
    footer: 'דוח אוטומטי שבועי'
  });

  MailApp.sendEmail({
    to: CONFIG.ADMIN_EMAIL,
    subject: '📊 דוח שבועי — ' + newLeads + ' לידים חדשים, ' + totalLeads + ' סה"כ',
    htmlBody: html,
    name: 'דוח שיווק'
  });
}

// ============================================
// Web App — קבלת לידים מטפסים
// ============================================

function doPost(e) {
  try {
    var data;
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        // Form submission (application/x-www-form-urlencoded) — use parameters
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }

    var action = data.action || 'newLead';

    if (action === 'newLead') {
      saveLead(data);
      sendWelcomeEmail(data);
      notifyNewLead(data);
    } else if (action === 'unsubscribe') {
      unsubscribeLead(data.email);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString().substring(0, 200) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var callback = (e.parameter.callback || 'callback').replace(/[^a-zA-Z0-9_]/g, '');
  var action = e.parameter.action || '';

  if (action === 'unsubscribe' && e.parameter.email) {
    unsubscribeLead(e.parameter.email);
    return ContentService
      .createTextOutput(callback + '({"result":"success","message":"unsubscribed"})')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  // Fallback — save lead via GET (image pixel / fallback)
  if (action === 'newLead' && e.parameter.email) {
    saveLead(e.parameter);
    sendWelcomeEmail(e.parameter);
    notifyNewLead(e.parameter);
    return ContentService
      .createTextOutput(callback + '({"result":"success","message":"lead saved"})')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(callback + '({"result":"ok","message":"marketing API active"})')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// ============================================
// פונקציות עזר — גיליונות
// ============================================

function getOrCreateSheet_(name) {
  var ss = CONFIG.SPREADSHEET_ID
    ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;

  sheet = ss.insertSheet(name);

  var headers = {
    'לידים': ['שם', 'מייל', 'טלפון', 'תפקיד', 'מקור', 'תאריך רישום', 'סטטוס', 'הערות', 'followup_sent', 'welcome_sent', 'newsletter'],
    'log': ['תאריך', 'פעולה', 'פרטים'],
    'newsletter_content': ['שבוע', 'נושא', 'preheader', 'כותרת', 'תוכן HTML', 'טקסט CTA', 'קישור CTA', 'סטטוס'],
    'subscribers': ['מייל', 'שם', 'תאריך הצטרפות', 'פעיל', 'מקור']
  };

  if (headers[name]) {
    sheet.appendRow(headers[name]);
    sheet.getRange(1, 1, 1, headers[name].length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function saveLead(data) {
  var sheet = getOrCreateSheet_('לידים');
  sheet.appendRow([
    data.name || '',
    data.email || '',
    data.phone || '',
    data.role || '',
    data.source || 'website',
    new Date(),
    'new',
    data.interest || '',
    '',  // followup_sent
    '',  // welcome_sent
    'active'  // newsletter
  ]);
}

function markLeadAction(email, action, value) {
  var sheet = getOrCreateSheet_('לידים');
  var rows = sheet.getDataRange().getValues();
  var colIndex = { 'welcome_sent': 10, 'followup_sent': 9 };
  var col = colIndex[action];
  if (!col) return;

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] === email) {
      sheet.getRange(i + 1, col).setValue(value);
      break;
    }
  }
}

function unsubscribeLead(email) {
  if (!email) return;
  var sheet = getOrCreateSheet_('לידים');
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] === email) {
      sheet.getRange(i + 1, 11).setValue('unsubscribed');
      break;
    }
  }
  logAction('unsubscribe', email);
}

function getActiveSubscribers() {
  var sheet = getOrCreateSheet_('לידים');
  var rows = sheet.getDataRange().getValues();
  var subs = [];

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] && rows[i][10] !== 'unsubscribed') {
      subs.push({ email: rows[i][1], name: rows[i][0] });
    }
  }
  return subs;
}

function logAction(action, details) {
  var sheet = getOrCreateSheet_('log');
  sheet.appendRow([new Date(), action, details]);
}

function getWeekNumber() {
  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 1);
  var diff = now - start;
  return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
}

// ============================================
// תבנית מייל מעוצבת
// ============================================

function buildEmailTemplate(opts) {
  return [
    '<!DOCTYPE html>',
    '<html dir="rtl" lang="he">',
    '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="x-apple-disable-message-reformatting">',
    '<title>' + (opts.title || '') + '</title></head>',
    '<body style="margin:0;padding:0;background:#F3F4F6;font-family:Arial,Helvetica,sans-serif">',
    '<!-- Preheader -->',
    '<div style="display:none;max-height:0;overflow:hidden">' + (opts.preheader || '') + '</div>',
    '<div style="max-width:580px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">',
    // Header
    '<div style="background:linear-gradient(135deg,#0D9488,#14B8A6);padding:28px;text-align:center">',
    '<h1 style="margin:0;color:#fff;font-size:22px;line-height:1.4">' + (opts.title || '') + '</h1>',
    '</div>',
    // Body
    '<div style="padding:28px;line-height:1.7;color:#374151;font-size:15px">',
    opts.body || '',
    '</div>',
    // CTA
    opts.ctaText ? '<div style="padding:0 28px 28px;text-align:center"><a href="' + (opts.ctaUrl || '#') + '" style="display:inline-block;background:#0D9488;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">' + opts.ctaText + ' &#8592;</a></div>' : '',
    // Footer
    '<div style="background:#F9FAFB;padding:20px 28px;text-align:center;border-top:1px solid #E5E7EB">',
    '<p style="margin:0 0 8px;font-size:14px;color:#374151;font-weight:bold">' + CONFIG.BRAND_NAME + '</p>',
    opts.footer ? '<p style="margin:0;font-size:12px;color:#9CA3AF">' + opts.footer + '</p>' : '',
    '</div>',
    '</div>',
    '</body></html>'
  ].join('\n');
}

// ============================================
// 7. תזכורת ניוזלטר — שבת בבוקר
// ============================================

/**
 * תזכורת להכין ניוזלטר — נשלחת כל שבת ב-10:00
 * הניוזלטר עצמו נשלח אוטומטית ביום ראשון 09:00
 */
function sendNewsletterReminder() {
  var sheet = getOrCreateSheet_('newsletter_content');
  var rows = sheet.getDataRange().getValues();
  var nextWeek = getWeekNumber() + 1;

  // בדיקה אם יש תוכן מוכן לשבוע הבא
  var hasContent = false;
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == nextWeek && rows[i][7] !== 'sent') {
      hasContent = true;
      break;
    }
  }

  var statusText = hasContent
    ? '<div style="background:#D1FAE5;border-radius:8px;padding:16px;text-align:center;margin:16px 0"><strong style="color:#059669">יש תוכן מוכן לשבוע הבא!</strong><br>הניוזלטר יישלח מחר (ראשון) ב-09:00 אוטומטית.</div>'
    : '<div style="background:#FEF2F2;border-radius:8px;padding:16px;text-align:center;margin:16px 0"><strong style="color:#DC2626">אין עדיין תוכן לניוזלטר!</strong><br>הכניסי תוכן לטאב "ניוזלטר" בגיליון לפני מחר 09:00.</div>';

  var subscriberCount = getActiveSubscribers().length;

  var html = buildEmailTemplate({
    preheader: hasContent ? 'הניוזלטר מוכן למחר!' : 'תזכורת: להכין ניוזלטר למחר',
    title: 'תזכורת ניוזלטר שבועי',
    body: [
      '<p>שבת שלום!</p>',
      '<p>מחר (ראשון) ב-09:00 הניוזלטר השבועי נשלח אוטומטית ל-<strong>' + subscriberCount + ' מנויים</strong>.</p>',
      statusText,
      '<h3 style="margin:20px 0 8px">מה צריך להיות בניוזלטר:</h3>',
      '<div style="background:#F9FAFB;border-radius:8px;padding:16px">',
      '1. <strong>נושא (Subject)</strong> — שורת הנושא של המייל<br>',
      '2. <strong>כותרת</strong> — הכותרת הראשית בגוף המייל<br>',
      '3. <strong>תוכן</strong> — טיפ, חדשות, או עדכון קצר<br>',
      '4. <strong>קישור CTA</strong> — לאן הכפתור מוביל',
      '</div>'
    ].join(''),
    ctaText: 'פתחי את גיליון הניוזלטר',
    ctaUrl: 'https://docs.google.com/spreadsheets/d/' + CONFIG.SPREADSHEET_ID,
    footer: 'תזכורת אוטומטית — כל שבת בבוקר'
  });

  MailApp.sendEmail({
    to: CONFIG.ADMIN_EMAIL,
    subject: hasContent ? '&#10004; ניוזלטר מוכן למחר (' + subscriberCount + ' מנויים)' : '&#9888; תזכורת: להכין ניוזלטר למחר!',
    htmlBody: html,
    name: 'תזכורת ניוזלטר'
  });
}

// ============================================
// הגדרת טריגרים — להריץ פעם אחת!
// ============================================

function setupAllTriggers() {
  // מחיקת טריגרים קיימים
  ScriptApp.getProjectTriggers().forEach(function(t) {
    ScriptApp.deleteTrigger(t);
  });

  // תזכורת פרסום יומית — 08:00 (ראשון-חמישי)
  ScriptApp.newTrigger('sendPublishingReminder')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();

  // מייל מעקב — 10:00 כל יום
  ScriptApp.newTrigger('sendFollowUpEmails')
    .timeBased()
    .everyDays(1)
    .atHour(10)
    .create();

  // ניוזלטר שבועי — ראשון 09:00
  ScriptApp.newTrigger('sendWeeklyNewsletter')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(9)
    .create();

  // דוח שבועי — שישי 12:00
  ScriptApp.newTrigger('sendWeeklyReport')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(12)
    .create();

  // תזכורת ניוזלטר — שבת 10:00
  ScriptApp.newTrigger('sendNewsletterReminder')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SATURDAY)
    .atHour(10)
    .create();

  Logger.log('כל הטריגרים הוגדרו בהצלחה!');
  Logger.log('- תזכורת פרסום: כל יום 08:00');
  Logger.log('- מעקב לידים: כל יום 10:00');
  Logger.log('- ניוזלטר: ראשון 09:00');
  Logger.log('- דוח שבועי: שישי 12:00');
  Logger.log('- תזכורת ניוזלטר: שבת 10:00');
}
