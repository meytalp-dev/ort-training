/**
 * סקריפט תזכורת יומית למורים מקצועיים – אורט בית הערבה
 *
 * הוראות התקנה:
 * 1. היכנסי ל-https://script.google.com
 * 2. לחצי "פרויקט חדש"
 * 3. העתיקי את כל הקוד הזה
 * 4. לחצי "הפעל" על הפונקציה setupDailyReminder
 * 5. אשרי הרשאות (פעם ראשונה בלבד)
 * 6. זהו! המייל יישלח כל יום ב-18:00 עד 22/3/2026
 */

// רשימת המורים המקצועיים
const TEACHERS_EMAILS = [
  "moshetzbr1@gmail.com",
  "osher17044@gmail.com",
  "rayamizrahi@gmail.com",
  "ofiram@bethaarava.ort.org.il",
  "perla@bh.ort.org.il",
  "Ygmvk1@gmail.com",
  "naamak@bethaarava.ort.org.il",
  "guy5352202@gmail.com",
  "yoavrot@bh.ort.org.il",
  "manod2828@walla.co.il",
  "yossir@bh.ort.org.il",
  "meravbetito1995@gmail.com",
  "mayaben343@gmail.com",
  "efratb@bh.ort.org.il",
  "zaretzky33@gmail.com",
  "shayb@bh.ort.org.il",
  "adir.c1@gmail.com",
  "vickikal@gmail.com",
  "elielk@bh.ort.org.il",
  "batsheva@bh.ort.org.il",
  "linoyb@bh.ort.org.il",
  "Yaelschrader@gmail.com"
];

// תאריך סיום – יום ראשון 22/3/2026
const END_DATE = new Date(2026, 2, 22, 23, 59); // חודש 2 = מרץ (0-indexed)

/**
 * הפעילי פונקציה זו פעם אחת – היא תיצור טריגר יומי ב-18:00
 */
function setupDailyReminder() {
  // מחיקת טריגרים קודמים (למניעת כפילויות)
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'sendDailyReminder') {
      ScriptApp.deleteTrigger(t);
    }
  });

  // יצירת טריגר יומי ב-18:00
  ScriptApp.newTrigger('sendDailyReminder')
    .timeBased()
    .atHour(18)
    .everyDays(1)
    .create();

  Logger.log('✅ טריגר יומי ב-18:00 הוגדר בהצלחה!');
  Logger.log('📅 יפסיק אוטומטית אחרי 22/3/2026');

  // שליחה מיידית לבדיקה
  sendDailyReminder();
}

/**
 * שולח את התזכורת – נקרא אוטומטית כל יום ב-18:00
 */
function sendDailyReminder() {
  // בדיקה אם עברנו את תאריך הסיום
  if (new Date() > END_DATE) {
    Logger.log('⏹ עברנו את תאריך הסיום – מוחק טריגר');
    ScriptApp.getProjectTriggers().forEach(t => {
      if (t.getHandlerFunction() === 'sendDailyReminder') {
        ScriptApp.deleteTrigger(t);
      }
    });
    return;
  }

  const subject = 'תזכורת – מטלות ומערכת';
  const body = 'הי,\n\nמזכירה לשלוח מטלות למארגן ואת המערכת לקבוצות ההורים והתלמידים.\n\nתודה והמשך ערב נעים ושקט 🌙';

  // שליחה ב-BCC (כל אחד מקבל בנפרד, לא רואים את האחרים)
  GmailApp.sendEmail(
    TEACHERS_EMAILS[0],  // to (חייב לפחות נמען אחד)
    subject,
    body,
    {
      bcc: TEACHERS_EMAILS.slice(1).join(','),
      name: 'אורט בית הערבה'
    }
  );

  Logger.log('✅ תזכורת נשלחה ל-' + TEACHERS_EMAILS.length + ' מורים');
}

/**
 * לביטול ידני – הפעילי אם רוצה לעצור לפני 22/3
 */
function stopReminder() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'sendDailyReminder') {
      ScriptApp.deleteTrigger(t);
    }
  });
  Logger.log('⏹ תזכורת יומית בוטלה');
}
