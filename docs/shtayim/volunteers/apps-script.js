/**
 * Google Apps Script — שתיים | מערכת ניהול מתנדבים
 * ═══════════════════════════════════════════════
 *
 * הוראות התקנה:
 *   1. צרי Google Sheet חדש
 *   2. פתחי Extensions > Apps Script
 *   3. הדביקי את הקוד הזה בקובץ Code.gs
 *   4. הריצי initialSetup() פעם אחת — ייצור 6 גיליונות עם כותרות
 *   5. Deploy > New deployment > Web app (Execute as Me, Anyone)
 *   6. העתיקי את ה-URL והדביקי בהגדרות המערכת
 *
 * גיליונות (6):
 *   • מתנדבים — שם, טלפון, אימייל, ת"ז, מוסד, תחום, זמינות, סטטוס, תאריך, שעות, הערות
 *   • בוגרים — שם, גיל, רקע, סטטוס, מתנדב, תוכניות, טלפון, הערות
 *   • שיבוצים — מתנדב, בוגר, תאריך, סטטוס, תאריך_סיום, הערות
 *   • פעילויות — תאריך, מתנדב, בוגר, סוג, שעות, תיאור
 *   • תוכניות — שם, מוסד, סוג, דרישות, רשומים, הערות
 *   • הגדרות — key-value pairs
 *
 * API (doGet):
 *   ?action=getAll     — כל הנתונים
 *   ?action=ping       — בדיקת חיבור
 *
 * API (doPost):
 *   action=saveVolunteer   — שמירת/עדכון מתנדב
 *   action=saveGraduate    — שמירת/עדכון בוגר
 *   action=saveAssignment  — שמירת שיבוץ
 *   action=endAssignment   — סיום שיבוץ
 *   action=saveActivity    — שמירת פעילות
 *   action=saveProgram     — שמירת/עדכון תוכנית
 */

// ╔══════════════════════════════════════════════╗
// ║           Web App — doGet / doPost            ║
// ╚══════════════════════════════════════════════╝

function doGet(e) {
  var action = (e.parameter.action || 'getAll');
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === 'ping') {
    return respond({ ok: true, timestamp: new Date().toISOString() });
  }

  if (action === 'getAll') {
    return respond({
      ok: true,
      org: getSettings_(ss),
      volunteers: getVolunteers_(ss),
      graduates: getGraduates_(ss),
      assignments: getAssignments_(ss),
      activities: getActivities_(ss),
      programs: getPrograms_(ss)
    });
  }

  if (action === 'getVolunteers') {
    return respond({ ok: true, volunteers: getVolunteers_(ss) });
  }

  if (action === 'getGraduates') {
    return respond({ ok: true, graduates: getGraduates_(ss) });
  }

  return respond({ error: 'unknown action: ' + action });
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'saveVolunteer') {
      saveVolunteer_(ss, data.volunteer);
      return respond({ ok: true });
    }

    if (action === 'saveGraduate') {
      saveGraduate_(ss, data.graduate);
      return respond({ ok: true });
    }

    if (action === 'saveAssignment') {
      saveAssignment_(ss, data.assignment);
      return respond({ ok: true });
    }

    if (action === 'endAssignment') {
      endAssignment_(ss, data.assignment);
      return respond({ ok: true });
    }

    if (action === 'saveActivity') {
      saveActivity_(ss, data.activity);
      return respond({ ok: true });
    }

    if (action === 'saveProgram') {
      saveProgram_(ss, data.program);
      return respond({ ok: true });
    }

    return respond({ error: 'unknown action' });
  } catch (err) {
    return respond({ error: err.message });
  }
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ╔══════════════════════════════════════════════╗
// ║           קריאת נתונים                        ║
// ╚══════════════════════════════════════════════╝

function getVolunteers_(ss) {
  var sheet = ss.getSheetByName('מתנדבים');
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1).filter(function(r) { return r[0]; }).map(function(r) {
    return {
      name: String(r[0] || ''),
      phone: String(r[1] || ''),
      email: String(r[2] || ''),
      id: String(r[3] || ''),
      institution: String(r[4] || ''),
      field: String(r[5] || ''),
      availability: String(r[6] || ''),
      status: String(r[7] || 'active'),
      startDate: String(r[8] || ''),
      hours: Number(r[9]) || 0,
      notes: String(r[10] || '')
    };
  });
}

function getGraduates_(ss) {
  var sheet = ss.getSheetByName('בוגרים');
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1).filter(function(r) { return r[0]; }).map(function(r) {
    return {
      name: String(r[0] || ''),
      age: Number(r[1]) || '',
      background: String(r[2] || ''),
      status: String(r[3] || 'searching'),
      volunteer: String(r[4] || ''),
      programs: String(r[5] || ''),
      phone: String(r[6] || ''),
      notes: String(r[7] || '')
    };
  });
}

function getAssignments_(ss) {
  var sheet = ss.getSheetByName('שיבוצים');
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1).filter(function(r) { return r[0]; }).map(function(r) {
    return {
      volunteer: String(r[0] || ''),
      graduate: String(r[1] || ''),
      date: String(r[2] || ''),
      status: String(r[3] || 'active'),
      endDate: String(r[4] || ''),
      notes: String(r[5] || '')
    };
  });
}

function getActivities_(ss) {
  var sheet = ss.getSheetByName('פעילויות');
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1).filter(function(r) { return r[0]; }).map(function(r) {
    return {
      date: String(r[0] || ''),
      volunteer: String(r[1] || ''),
      graduate: String(r[2] || ''),
      type: String(r[3] || 'other'),
      hours: Number(r[4]) || 0,
      description: String(r[5] || '')
    };
  });
}

function getPrograms_(ss) {
  var sheet = ss.getSheetByName('תוכניות');
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1).filter(function(r) { return r[0]; }).map(function(r) {
    return {
      name: String(r[0] || ''),
      institution: String(r[1] || ''),
      type: String(r[2] || 'other'),
      requirements: String(r[3] || ''),
      enrolled: Number(r[4]) || 0,
      notes: String(r[5] || '')
    };
  });
}

function getSettings_(ss) {
  var sheet = ss.getSheetByName('הגדרות');
  var data = sheet.getDataRange().getValues();
  var settings = {};
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) settings[String(data[i][0]).trim()] = String(data[i][1] || '');
  }
  return {
    name: settings['שם'] || 'עמותת הופה',
    email: settings['אימייל'] || '',
    phone: settings['טלפון'] || '',
    avatar: settings['אבטאר'] || 'הפ',
    description: settings['תיאור'] || ''
  };
}

// ╔══════════════════════════════════════════════╗
// ║           כתיבת נתונים                        ║
// ╚══════════════════════════════════════════════╝

function saveVolunteer_(ss, vol) {
  var sheet = ss.getSheetByName('מתנדבים');
  var row = findRow_(sheet, vol.id || vol.name);
  var values = [vol.name, vol.phone, vol.email, vol.id, vol.institution, vol.field, vol.availability, vol.status, vol.startDate, vol.hours || 0, vol.notes];
  if (row > 0) {
    sheet.getRange(row, 1, 1, values.length).setValues([values]);
  } else {
    sheet.appendRow(values);
  }
}

function saveGraduate_(ss, grad) {
  var sheet = ss.getSheetByName('בוגרים');
  var row = findRow_(sheet, grad.name);
  var values = [grad.name, grad.age, grad.background, grad.status, grad.volunteer, grad.programs, grad.phone, grad.notes];
  if (row > 0) {
    sheet.getRange(row, 1, 1, values.length).setValues([values]);
  } else {
    sheet.appendRow(values);
  }
}

function saveAssignment_(ss, assign) {
  var sheet = ss.getSheetByName('שיבוצים');
  sheet.appendRow([assign.volunteer, assign.graduate, assign.date, assign.status, assign.endDate || '', assign.notes || '']);
}

function endAssignment_(ss, assign) {
  var sheet = ss.getSheetByName('שיבוצים');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === assign.volunteer && String(data[i][1]) === assign.graduate && String(data[i][3]) === 'active') {
      sheet.getRange(i + 1, 4).setValue('ended');
      sheet.getRange(i + 1, 5).setValue(assign.endDate || new Date().toLocaleDateString('he-IL'));
      break;
    }
  }
}

function saveActivity_(ss, act) {
  var sheet = ss.getSheetByName('פעילויות');
  sheet.appendRow([act.date, act.volunteer, act.graduate, act.type, act.hours, act.description]);

  // Update volunteer hours
  var volSheet = ss.getSheetByName('מתנדבים');
  var volData = volSheet.getDataRange().getValues();
  for (var i = 1; i < volData.length; i++) {
    if (String(volData[i][0]) === act.volunteer) {
      var currentHours = Number(volData[i][9]) || 0;
      volSheet.getRange(i + 1, 10).setValue(currentHours + (act.hours || 0));
      break;
    }
  }
}

function saveProgram_(ss, prog) {
  var sheet = ss.getSheetByName('תוכניות');
  var row = findRow_(sheet, prog.name);
  var values = [prog.name, prog.institution, prog.type, prog.requirements, prog.enrolled || 0, prog.notes];
  if (row > 0) {
    sheet.getRange(row, 1, 1, values.length).setValues([values]);
  } else {
    sheet.appendRow(values);
  }
}

// ╔══════════════════════════════════════════════╗
// ║           עזר                                 ║
// ╚══════════════════════════════════════════════╝

function findRow_(sheet, key) {
  if (!key) return -1;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(key).trim()) return i + 1;
  }
  return -1;
}

// ╔══════════════════════════════════════════════╗
// ║           התקנה ראשונית                       ║
// ╚══════════════════════════════════════════════╝

function initialSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // מתנדבים
  var s1 = ss.getSheetByName('מתנדבים') || ss.insertSheet('מתנדבים');
  if (s1.getLastRow() === 0) {
    s1.appendRow(['שם_מלא', 'טלפון', 'אימייל', 'ת_זהות', 'מוסד_לימודים', 'תחום_לימודים', 'זמינות', 'סטטוס', 'תאריך_התחלה', 'שעות_סהכ', 'הערות']);
    s1.getRange(1, 1, 1, 11).setFontWeight('bold');
  }

  // בוגרים
  var s2 = ss.getSheetByName('בוגרים') || ss.insertSheet('בוגרים');
  if (s2.getLastRow() === 0) {
    s2.appendRow(['שם_מלא', 'גיל', 'רקע', 'סטטוס', 'מתנדב_אחראי', 'תוכניות', 'טלפון', 'הערות']);
    s2.getRange(1, 1, 1, 8).setFontWeight('bold');
  }

  // שיבוצים
  var s3 = ss.getSheetByName('שיבוצים') || ss.insertSheet('שיבוצים');
  if (s3.getLastRow() === 0) {
    s3.appendRow(['מתנדב', 'בוגר', 'תאריך_שיבוץ', 'סטטוס', 'תאריך_סיום', 'הערות']);
    s3.getRange(1, 1, 1, 6).setFontWeight('bold');
  }

  // פעילויות
  var s4 = ss.getSheetByName('פעילויות') || ss.insertSheet('פעילויות');
  if (s4.getLastRow() === 0) {
    s4.appendRow(['תאריך', 'מתנדב', 'בוגר', 'סוג', 'משך_שעות', 'תיאור']);
    s4.getRange(1, 1, 1, 6).setFontWeight('bold');
  }

  // תוכניות
  var s5 = ss.getSheetByName('תוכניות') || ss.insertSheet('תוכניות');
  if (s5.getLastRow() === 0) {
    s5.appendRow(['שם', 'מוסד', 'סוג', 'דרישות', 'בוגרים_רשומים', 'הערות']);
    s5.getRange(1, 1, 1, 6).setFontWeight('bold');
  }

  // הגדרות
  var s6 = ss.getSheetByName('הגדרות') || ss.insertSheet('הגדרות');
  if (s6.getLastRow() === 0) {
    s6.appendRow(['שדה', 'ערך']);
    s6.appendRow(['שם', 'עמותת הופה']);
    s6.appendRow(['אימייל', 'info@hoppa.org.il']);
    s6.appendRow(['טלפון', '']);
    s6.appendRow(['אבטאר', 'הפ']);
    s6.appendRow(['תיאור', 'ליווי בוגרים ומניעת נשירה']);
    s6.getRange(1, 1, 1, 2).setFontWeight('bold');
  }

  // Delete default Sheet1
  var sheet1 = ss.getSheetByName('Sheet1') || ss.getSheetByName('גיליון1');
  if (sheet1 && ss.getSheets().length > 1) {
    try { ss.deleteSheet(sheet1); } catch(e) {}
  }

  SpreadsheetApp.getUi().alert('ההתקנה הושלמה! 6 גיליונות נוצרו.');
}
