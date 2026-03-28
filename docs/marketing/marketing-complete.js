/**
 * Google Apps Script — מערכת שיווק מלאה | מיטל פלג
 *
 * קובץ אחד שכולל הכל:
 * - מיילים אוטומטיים (ברוכים הבאים, מעקב, ניוזלטר)
 * - תזכורות (פרסום יומי, ניוזלטר בשבת, דוח שבועי)
 * - API לדשבורד האינטרנטי (קריאה + כתיבה)
 *
 * הוראות:
 * 1. ב-Apps Script, לחצי + → Script → שם: marketing
 * 2. הדביקי את כל הקוד הזה
 * 3. הריצי setupAllTriggers() פעם אחת
 * 4. Deploy → Manage deployments → גרסה חדשה → Deploy
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
// Web App — doGet + doPost
// ============================================

function doGet(e) {
  var action = e.parameter.action || '';
  var callback = (e.parameter.callback || '').replace(/[^a-zA-Z0-9_]/g, '');

  var result;
  switch (action) {
    case 'getLeads': result = apiGetLeads_(); break;
    case 'getContent': result = apiGetContent_(); break;
    case 'getNewsletter': result = apiGetNewsletter_(); break;
    case 'getDashboard': result = apiGetDashboard_(); break;
    case 'getTrainings': result = apiGetTrainings_(); break;
    case 'unsubscribe':
      if (e.parameter.email) unsubscribeLead(e.parameter.email);
      result = { result: 'success', message: 'unsubscribed' };
      break;
    default:
      result = { result: 'ok', message: 'marketing API active' };
  }

  var json = JSON.stringify(result);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + json + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

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
      case 'saveContent': result = apiSaveContent_(data); break;
      case 'saveNewsletter': result = apiSaveNewsletter_(data); break;
      case 'updateLead': result = apiUpdateLead_(data); break;
      case 'unsubscribe':
        unsubscribeLead(data.email);
        result = { result: 'success' };
        break;
      default:
        result = { result: 'error', message: 'unknown action' };
    }

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', message: error.toString().substring(0, 200) })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// 1. מייל ברוכים הבאים
// ============================================

function sendWelcomeEmail(lead) {
  var name = lead.name || 'שלום';
  var email = lead.email;
  if (!email) return;

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

  MailApp.sendEmail({ to: email, subject: 'שמחה שהצטרפת! הנה מה שמחכה לך', htmlBody: html, name: CONFIG.BRAND_NAME });
  markLeadAction(email, 'welcome_sent', new Date().toISOString());
}

// ============================================
// 2. ניוזלטר שבועי — ראשון 09:00
// ============================================

function sendWeeklyNewsletter() {
  var subscribers = getActiveSubscribers();
  if (subscribers.length === 0) return;

  var weekNum = getWeekNumber();
  var content = getNewsletterContent(weekNum);
  if (!content) { Logger.log('אין תוכן לניוזלטר השבוע'); return; }

  var html = buildEmailTemplate({
    preheader: content.preheader,
    title: content.title,
    body: content.body,
    ctaText: content.ctaText || 'לקריאה המלאה',
    ctaUrl: content.ctaUrl || CONFIG.SITE_URL,
    footer: 'קיבלת את המייל הזה כי נרשמת לעדכונים. <a href="' + CONFIG.SITE_URL + '/marketing/landing.html?unsubscribe=true" style="color:#9CA3AF">להסרה</a>'
  });

  var batchSize = 50;
  for (var i = 0; i < subscribers.length; i += batchSize) {
    var batch = subscribers.slice(i, i + batchSize);
    MailApp.sendEmail({ to: CONFIG.ADMIN_EMAIL, subject: content.subject, htmlBody: html, name: CONFIG.BRAND_NAME, bcc: batch.map(function(s) { return s.email; }).join(',') });
  }
  logAction('newsletter_sent', 'שבוע ' + weekNum + ' — ' + subscribers.length + ' נמענים');
}

function getNewsletterContent(weekNum) {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName('ניוזלטר');
  if (!sheet) return null;
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == weekNum && rows[i][7] !== 'sent') {
      sheet.getRange(i + 1, 8).setValue('sent');
      return { subject: rows[i][1], preheader: rows[i][2], title: rows[i][3], body: rows[i][4], ctaText: rows[i][5] || 'לקריאה', ctaUrl: rows[i][6] || CONFIG.SITE_URL };
    }
  }
  return null;
}

// ============================================
// 3. תזכורת פרסום יומית — 08:00
// ============================================

function sendPublishingReminder() {
  var today = new Date();
  var dayOfWeek = today.getDay();

  var schedule = {
    0: [{ time: '10:00', platform: 'WhatsApp', series: '#טיפ_AI_למורה' }, { time: '20:00', platform: 'Facebook', series: 'פוסט ערב' }],
    1: [{ time: '09:00', platform: 'LinkedIn', series: '#מאחורי_הקלעים' }],
    2: [{ time: '14:00', platform: 'Facebook', series: '#לפני_אחרי_AI' }, { time: '19:00', platform: 'Instagram', series: '#דקה_עם_מיטל (רילס)' }],
    3: [{ time: '10:00', platform: 'LinkedIn', series: 'מאמרון AI בחינוך' }, { time: '16:00', platform: 'WhatsApp', series: 'עדכון שבועי' }],
    4: [{ time: '12:00', platform: 'Instagram', series: '#כלי_השבוע' }, { time: '20:00', platform: 'Facebook', series: 'פוסט סוף שבוע' }]
  };

  var todayPosts = schedule[dayOfWeek];
  if (!todayPosts || todayPosts.length === 0) return;

  var dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  var dateStr = Utilities.formatDate(today, 'Asia/Jerusalem', 'dd/MM/yyyy');
  var platformColors = { 'Facebook': '#1877F2', 'Instagram': '#E4405F', 'LinkedIn': '#0A66C2', 'WhatsApp': '#25D366' };

  var postsHtml = todayPosts.map(function(post) {
    var color = platformColors[post.platform] || '#6B7280';
    return '<div style="display:flex;align-items:center;padding:12px;margin:8px 0;background:#F9FAFB;border-radius:8px;border-right:4px solid ' + color + '"><div style="flex:1"><strong style="color:' + color + '">' + post.platform + '</strong> <span style="color:#6B7280">| ' + post.time + '</span><br><span style="font-size:14px">' + post.series + '</span></div></div>';
  }).join('');

  var html = buildEmailTemplate({
    preheader: todayPosts.length + ' פרסומים מתוכננים להיום',
    title: 'יום ' + dayNames[dayOfWeek] + ' ' + dateStr,
    body: '<p style="margin:0 0 16px;color:#6B7280">הפרסומים של היום:</p>' + postsHtml + '<div style="margin-top:20px;padding:12px;background:#ECFDF5;border-radius:8px;text-align:center"><strong>טיפ:</strong> הכיני את התוכן מראש ותזמני עם Meta Business Suite</div>',
    ctaText: 'לדשבורד השיווק', ctaUrl: CONFIG.SITE_URL + '/marketing/hub.html', footer: 'תזכורת אוטומטית מלוח הפרסום שלך'
  });

  MailApp.sendEmail({ to: CONFIG.ADMIN_EMAIL, subject: 'פרסומים להיום (' + dayNames[dayOfWeek] + ') — ' + todayPosts.length + ' פוסטים', htmlBody: html, name: 'לוח פרסום' });
}

// ============================================
// 4. התראת ליד חדש
// ============================================

function notifyNewLead(lead) {
  var html = buildEmailTemplate({
    preheader: 'ליד חדש נרשם!',
    title: 'ליד חדש: ' + (lead.name || 'ללא שם'),
    body: '<table style="width:100%;border-collapse:collapse">' +
      '<tr><td style="padding:8px;border-bottom:1px solid #E5E7EB;color:#6B7280">שם</td><td style="padding:8px;border-bottom:1px solid #E5E7EB"><strong>' + (lead.name || '—') + '</strong></td></tr>' +
      '<tr><td style="padding:8px;border-bottom:1px solid #E5E7EB;color:#6B7280">מייל</td><td style="padding:8px;border-bottom:1px solid #E5E7EB">' + (lead.email || '—') + '</td></tr>' +
      '<tr><td style="padding:8px;border-bottom:1px solid #E5E7EB;color:#6B7280">טלפון</td><td style="padding:8px;border-bottom:1px solid #E5E7EB">' + (lead.phone || '—') + '</td></tr>' +
      '<tr><td style="padding:8px;border-bottom:1px solid #E5E7EB;color:#6B7280">מקור</td><td style="padding:8px;border-bottom:1px solid #E5E7EB">' + (lead.source || '—') + '</td></tr>' +
      '<tr><td style="padding:8px;color:#6B7280">תאריך</td><td style="padding:8px">' + new Date().toLocaleDateString('he-IL') + '</td></tr></table>',
    ctaText: 'פתחי את ה-CRM', ctaUrl: 'https://docs.google.com/spreadsheets/d/' + CONFIG.SPREADSHEET_ID, footer: ''
  });

  MailApp.sendEmail({ to: CONFIG.ADMIN_EMAIL, subject: 'ליד חדש: ' + (lead.name || lead.email), htmlBody: html, name: 'CRM שיווק' });
}

// ============================================
// 5. מייל מעקב — 3 ימים אחרי רישום
// ============================================

function sendFollowUpEmails() {
  var sheet = getOrCreateSheet_('leads');
  var rows = sheet.getDataRange().getValues();
  var threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  var targetDate = Utilities.formatDate(threeDaysAgo, 'Asia/Jerusalem', 'yyyy-MM-dd');

  for (var i = 1; i < rows.length; i++) {
    var email = rows[i][1], name = rows[i][0], followUpSent = rows[i][8];
    if (!email || followUpSent) continue;

    var regDate = rows[i][5];
    var regDateStr = regDate instanceof Date ? Utilities.formatDate(regDate, 'Asia/Jerusalem', 'yyyy-MM-dd') : String(regDate).substring(0, 10);
    if (regDateStr !== targetDate) continue;

    var html = buildEmailTemplate({
      preheader: 'ראיתי שנרשמת — רציתי לשאול...',
      title: (name || 'היי') + ', מה אומרת?',
      body: 'נרשמת לפני כמה ימים ורציתי לבדוק — יש משהו שאת מחפשת?<br><br><strong>הנה כמה דברים שאולי יעניינו אותך:</strong><br><br><div style="background:#F0FDFA;border-radius:8px;padding:16px;margin:12px 0">&#10148; <a href="' + CONFIG.SITE_URL + '/marketing/portfolio.html" style="color:#0D9488;text-decoration:none">תיק עבודות</a> — 131+ תוצרים דיגיטליים<br><br>&#10148; <a href="' + CONFIG.SITE_URL + '/marketing/testimonials.html" style="color:#0D9488;text-decoration:none">מה אומרים</a> — משובים ממורים שהשתתפו<br><br>&#10148; <a href="' + CONFIG.WHATSAPP_LINK + '" style="color:#0D9488;text-decoration:none">שאלה? WhatsApp</a> — אני כאן</div>',
      ctaText: 'לדף ההדרכות', ctaUrl: CONFIG.SITE_URL + '/marketing/landing.html', footer: ''
    });

    MailApp.sendEmail({ to: email, subject: 'ראיתי שנרשמת — יש משהו שמעניין אותך?', htmlBody: html, name: CONFIG.BRAND_NAME });
    sheet.getRange(i + 1, 9).setValue(new Date().toISOString());
  }
}

// ============================================
// 6. דוח שבועי — שישי 12:00
// ============================================

function sendWeeklyReport() {
  var sheet = getOrCreateSheet_('leads');
  var logSheet = getOrCreateSheet_('log');
  var rows = sheet.getDataRange().getValues();
  var weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);

  var newLeads = 0, totalLeads = rows.length - 1, sources = {};
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][5] instanceof Date && rows[i][5] > weekAgo) newLeads++;
    var source = rows[i][4] || 'לא צוין';
    sources[source] = (sources[source] || 0) + 1;
  }

  var logRows = logSheet.getDataRange().getValues();
  var emailsSent = 0;
  for (var j = 1; j < logRows.length; j++) {
    if (logRows[j][0] instanceof Date && logRows[j][0] > weekAgo && String(logRows[j][1]).indexOf('welcome') > -1) emailsSent++;
  }

  var sourcesHtml = Object.keys(sources).map(function(key) {
    return '<tr><td style="padding:6px 8px;border-bottom:1px solid #E5E7EB">' + key + '</td><td style="padding:6px 8px;border-bottom:1px solid #E5E7EB;text-align:center"><strong>' + sources[key] + '</strong></td></tr>';
  }).join('');

  var html = buildEmailTemplate({
    preheader: 'סיכום שבועי — ' + newLeads + ' לידים חדשים',
    title: 'דוח שבועי — שיווק',
    body: '<div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap"><div style="flex:1;min-width:120px;background:#ECFDF5;border-radius:8px;padding:16px;text-align:center"><div style="font-size:28px;font-weight:bold;color:#059669">' + newLeads + '</div><div style="color:#6B7280;font-size:13px">לידים חדשים</div></div><div style="flex:1;min-width:120px;background:#EFF6FF;border-radius:8px;padding:16px;text-align:center"><div style="font-size:28px;font-weight:bold;color:#2563EB">' + totalLeads + '</div><div style="color:#6B7280;font-size:13px">סה"כ לידים</div></div><div style="flex:1;min-width:120px;background:#FDF4FF;border-radius:8px;padding:16px;text-align:center"><div style="font-size:28px;font-weight:bold;color:#9333EA">' + emailsSent + '</div><div style="color:#6B7280;font-size:13px">מיילים נשלחו</div></div></div><h3 style="margin:20px 0 8px;font-size:16px">מקורות לידים</h3><table style="width:100%;border-collapse:collapse">' + sourcesHtml + '</table>',
    ctaText: 'למרכז השיווק', ctaUrl: CONFIG.SITE_URL + '/marketing/hub.html', footer: 'דוח אוטומטי שבועי'
  });

  MailApp.sendEmail({ to: CONFIG.ADMIN_EMAIL, subject: 'דוח שבועי — ' + newLeads + ' לידים חדשים, ' + totalLeads + ' סה"כ', htmlBody: html, name: 'דוח שיווק' });
}

// ============================================
// 7. תזכורת ניוזלטר — שבת 10:00
// ============================================

function sendNewsletterReminder() {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName('ניוזלטר');
  var nextWeek = getWeekNumber() + 1;

  var hasContent = false;
  if (sheet) {
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] == nextWeek && rows[i][7] !== 'sent') { hasContent = true; break; }
    }
  }

  var subscriberCount = getActiveSubscribers().length;
  var statusText = hasContent
    ? '<div style="background:#D1FAE5;border-radius:8px;padding:16px;text-align:center;margin:16px 0"><strong style="color:#059669">יש תוכן מוכן!</strong><br>הניוזלטר יישלח מחר ב-09:00 אוטומטית.</div>'
    : '<div style="background:#FEF2F2;border-radius:8px;padding:16px;text-align:center;margin:16px 0"><strong style="color:#DC2626">אין עדיין תוכן!</strong><br>הכניסי תוכן במרכז השיווק לפני מחר 09:00.</div>';

  var html = buildEmailTemplate({
    preheader: hasContent ? 'הניוזלטר מוכן למחר!' : 'תזכורת: להכין ניוזלטר למחר',
    title: 'תזכורת ניוזלטר שבועי',
    body: '<p>שבת שלום!</p><p>מחר ב-09:00 הניוזלטר נשלח אוטומטית ל-<strong>' + subscriberCount + ' מנויים</strong>.</p>' + statusText + '<h3 style="margin:20px 0 8px">מה צריך:</h3><div style="background:#F9FAFB;border-radius:8px;padding:16px">1. נושא<br>2. כותרת<br>3. תוכן קצר<br>4. קישור לכפתור</div>',
    ctaText: 'למרכז השיווק', ctaUrl: CONFIG.SITE_URL + '/marketing/hub.html', footer: 'תזכורת אוטומטית — כל שבת'
  });

  MailApp.sendEmail({ to: CONFIG.ADMIN_EMAIL, subject: hasContent ? 'ניוזלטר מוכן למחר (' + subscriberCount + ' מנויים)' : 'תזכורת: להכין ניוזלטר למחר!', htmlBody: html, name: 'תזכורת ניוזלטר' });
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
    leads.push({ name: rows[i][0]||'', email: rows[i][1]||'', phone: rows[i][2]||'', role: rows[i][3]||'', source: rows[i][4]||'', date: rows[i][5] instanceof Date ? Utilities.formatDate(rows[i][5],'Asia/Jerusalem','yyyy-MM-dd') : String(rows[i][5]), status: rows[i][6]||'new', interest: rows[i][7]||'', newsletter: rows[i][10]||'active' });
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
    content.push({ row: i+1, date: rows[i][0] instanceof Date ? Utilities.formatDate(rows[i][0],'Asia/Jerusalem','yyyy-MM-dd') : String(rows[i][0]), platform: rows[i][1]||'', series: rows[i][2]||'', title: rows[i][3]||'', status: rows[i][4]||'draft', link: rows[i][5]||'', comments: rows[i][6]||0, shares: rows[i][7]||0, notes: rows[i][8]||'' });
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
    newsletters.push({ row: i+1, week: rows[i][0]||'', subject: rows[i][1]||'', preheader: rows[i][2]||'', title: rows[i][3]||'', body: rows[i][4]||'', ctaText: rows[i][5]||'', ctaUrl: rows[i][6]||'', status: rows[i][7]||'draft' });
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
    trainings.push({ name: rows[i][0]||'', startDate: rows[i][1] instanceof Date ? Utilities.formatDate(rows[i][1],'Asia/Jerusalem','yyyy-MM-dd') : String(rows[i][1]), endDate: rows[i][2] instanceof Date ? Utilities.formatDate(rows[i][2],'Asia/Jerusalem','yyyy-MM-dd') : String(rows[i][2]), participants: rows[i][3]||0, price: rows[i][4]||0, status: rows[i][5]||'', type: rows[i][6]||'', link: rows[i][7]||'', rating: rows[i][8]||'', notes: rows[i][9]||'' });
  }
  return { result: 'success', trainings: trainings, total: trainings.length };
}

function apiGetDashboard_() {
  var leads = apiGetLeads_(), content = apiGetContent_(), trainings = apiGetTrainings_(), newsletter = apiGetNewsletter_();
  var weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  var newLeads = 0, sources = {}, statuses = {};
  leads.leads.forEach(function(l) {
    if (new Date(l.date) > weekAgo) newLeads++;
    sources[l.source||'לא צוין'] = (sources[l.source||'לא צוין']||0) + 1;
    statuses[l.status] = (statuses[l.status]||0) + 1;
  });
  return {
    result: 'success',
    stats: { totalLeads: leads.total, newLeads: newLeads, subscribers: leads.leads.filter(function(l){return l.newsletter!=='unsubscribed'}).length, publishedContent: content.content.filter(function(c){return c.status==='published'}).length, readyContent: content.content.filter(function(c){return c.status==='ready'}).length, activeTrainings: trainings.trainings.filter(function(t){return t.status==='active'}).length, plannedTrainings: trainings.trainings.filter(function(t){return t.status==='planned'}).length, sentNewsletters: newsletter.newsletters.filter(function(n){return n.status==='sent'}).length },
    sources: sources, statuses: statuses
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
    var r = parseInt(data.row);
    sheet.getRange(r,1).setValue(data.date||''); sheet.getRange(r,2).setValue(data.platform||''); sheet.getRange(r,3).setValue(data.series||'');
    sheet.getRange(r,4).setValue(data.title||''); sheet.getRange(r,5).setValue(data.status||'draft'); sheet.getRange(r,6).setValue(data.link||''); sheet.getRange(r,9).setValue(data.notes||'');
  } else {
    sheet.appendRow([data.date||new Date(), data.platform||'', data.series||'', data.title||'', data.status||'draft', data.link||'', 0, 0, data.notes||'']);
  }
  return { result: 'success' };
}

function apiSaveNewsletter_(data) {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName('ניוזלטר');
  if (!sheet) return { result: 'error', message: 'sheet not found' };
  if (data.row) {
    var r = parseInt(data.row);
    sheet.getRange(r,1).setValue(data.week||''); sheet.getRange(r,2).setValue(data.subject||''); sheet.getRange(r,3).setValue(data.preheader||'');
    sheet.getRange(r,4).setValue(data.title||''); sheet.getRange(r,5).setValue(data.body||''); sheet.getRange(r,6).setValue(data.ctaText||'');
    sheet.getRange(r,7).setValue(data.ctaUrl||''); sheet.getRange(r,8).setValue(data.status||'draft');
  } else {
    sheet.appendRow([data.week||getWeekNumber()+1, data.subject||'', data.preheader||'', data.title||'', data.body||'', data.ctaText||'', data.ctaUrl||'', data.status||'draft']);
  }
  return { result: 'success' };
}

function apiUpdateLead_(data) {
  if (!data.email) return { result: 'error', message: 'email required' };
  var sheet = getOrCreateSheet_('leads');
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] === data.email) {
      if (data.status) sheet.getRange(i+1,7).setValue(data.status);
      if (data.notes) sheet.getRange(i+1,8).setValue(data.notes);
      if (data.newsletter) sheet.getRange(i+1,11).setValue(data.newsletter);
      return { result: 'success' };
    }
  }
  return { result: 'error', message: 'lead not found' };
}

// ============================================
// פונקציות עזר
// ============================================

function getOrCreateSheet_(name) {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;
  sheet = ss.insertSheet(name);
  var headers = {
    'leads': ['שם','מייל','טלפון','תפקיד','מקור','תאריך רישום','סטטוס','הערות','followup_sent','welcome_sent','newsletter'],
    'log': ['תאריך','פעולה','פרטים'],
    'newsletter_content': ['שבוע','נושא','preheader','כותרת','תוכן HTML','טקסט CTA','קישור CTA','סטטוס']
  };
  if (headers[name]) { sheet.appendRow(headers[name]); sheet.getRange(1,1,1,headers[name].length).setFontWeight('bold'); sheet.setFrozenRows(1); }
  return sheet;
}

function saveLead(data) {
  var sheet = getOrCreateSheet_('leads');
  sheet.appendRow([data.name||'', data.email||'', data.phone||'', data.role||'', data.source||'website', new Date(), 'new', data.interest||'', '', '', 'active']);
}

function markLeadAction(email, action, value) {
  var sheet = getOrCreateSheet_('leads');
  var rows = sheet.getDataRange().getValues();
  var col = { 'welcome_sent': 10, 'followup_sent': 9 }[action];
  if (!col) return;
  for (var i = 1; i < rows.length; i++) { if (rows[i][1] === email) { sheet.getRange(i+1, col).setValue(value); break; } }
}

function unsubscribeLead(email) {
  if (!email) return;
  var sheet = getOrCreateSheet_('leads');
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) { if (rows[i][1] === email) { sheet.getRange(i+1, 11).setValue('unsubscribed'); break; } }
  logAction('unsubscribe', email);
}

function getActiveSubscribers() {
  var sheet = getOrCreateSheet_('leads');
  var rows = sheet.getDataRange().getValues();
  var subs = [];
  for (var i = 1; i < rows.length; i++) { if (rows[i][1] && rows[i][10] !== 'unsubscribed') subs.push({ email: rows[i][1], name: rows[i][0] }); }
  return subs;
}

function logAction(action, details) { getOrCreateSheet_('log').appendRow([new Date(), action, details]); }

function getWeekNumber() {
  var now = new Date(), start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil((now - start) / (7 * 24 * 60 * 60 * 1000));
}

// ============================================
// תבנית מייל
// ============================================

function buildEmailTemplate(opts) {
  return '<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>' + (opts.title||'') + '</title></head><body style="margin:0;padding:0;background:#F3F4F6;font-family:Arial,Helvetica,sans-serif"><div style="display:none;max-height:0;overflow:hidden">' + (opts.preheader||'') + '</div><div style="max-width:580px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)"><div style="background:linear-gradient(135deg,#0D9488,#14B8A6);padding:28px;text-align:center"><h1 style="margin:0;color:#fff;font-size:22px;line-height:1.4">' + (opts.title||'') + '</h1></div><div style="padding:28px;line-height:1.7;color:#374151;font-size:15px">' + (opts.body||'') + '</div>' + (opts.ctaText ? '<div style="padding:0 28px 28px;text-align:center"><a href="' + (opts.ctaUrl||'#') + '" style="display:inline-block;background:#0D9488;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">' + opts.ctaText + ' &#8592;</a></div>' : '') + '<div style="background:#F9FAFB;padding:20px 28px;text-align:center;border-top:1px solid #E5E7EB"><p style="margin:0 0 8px;font-size:14px;color:#374151;font-weight:bold">' + CONFIG.BRAND_NAME + '</p>' + (opts.footer ? '<p style="margin:0;font-size:12px;color:#9CA3AF">' + opts.footer + '</p>' : '') + '</div></div></body></html>';
}

// ============================================
// טריגרים — להריץ פעם אחת!
// ============================================

function setupAllTriggers() {
  ScriptApp.getProjectTriggers().forEach(function(t) { ScriptApp.deleteTrigger(t); });

  ScriptApp.newTrigger('sendPublishingReminder').timeBased().everyDays(1).atHour(8).create();
  ScriptApp.newTrigger('sendFollowUpEmails').timeBased().everyDays(1).atHour(10).create();
  ScriptApp.newTrigger('sendWeeklyNewsletter').timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(9).create();
  ScriptApp.newTrigger('sendWeeklyReport').timeBased().onWeekDay(ScriptApp.WeekDay.FRIDAY).atHour(12).create();
  ScriptApp.newTrigger('sendNewsletterReminder').timeBased().onWeekDay(ScriptApp.WeekDay.SATURDAY).atHour(10).create();

  Logger.log('כל הטריגרים הוגדרו!');
  Logger.log('- תזכורת פרסום: כל יום 08:00');
  Logger.log('- מעקב לידים: כל יום 10:00');
  Logger.log('- ניוזלטר: ראשון 09:00');
  Logger.log('- דוח שבועי: שישי 12:00');
  Logger.log('- תזכורת ניוזלטר: שבת 10:00');
}
