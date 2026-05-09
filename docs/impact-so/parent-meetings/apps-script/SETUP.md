# הוראות דיפלוי — Apps Script Backend

## שלבי הקמה (פעם אחת)

### 1. צרי גיליון Google Sheets חדש
- כותרת מומלצת: `ImpactOS — אסיפות הורים`

### 2. פתחי את עורך ה-Apps Script
- מתוך הגיליון: `Extensions → Apps Script`
- מחקי את `Code.gs` הריק והדביקי את כל התוכן של `code.gs` שבתיקייה זו.
- שמרי (`Ctrl+S`).

### 3. הריצי `setupSheets` פעם אחת
- בעורך: בחרי את הפונקציה `setupSheets` בתפריט ולחצי `Run`.
- אישרי הרשאות בפעם הראשונה (Allow).
- הגיליון יקבל 3 לשוניות: `Events`, `Students`, `Bookings`.

### 4. דיפלוי כ-Web App
- `Deploy → New deployment`
- Type: **Web app**
- Execute as: **Me**
- Who has access: **Anyone**
- לחצי `Deploy` והעתיקי את ה-**Web app URL**.

### 5. עדכני את הקליינט
- פתחי את `docs/impact-so/parent-meetings/assets/config.js`
- הדביקי את ה-URL בתוך `PARENT_MEETINGS_API_URL`.

### 6. הפעילי טריגר תזכורות
- בעורך Apps Script: בחרי את הפונקציה `installReminderTrigger` והריצי אותה פעם אחת.
- מעכשיו תרוץ פעם בשעה ותשלח תזכורות אוטומטית יום לפני האסיפה.

---

## בדיקת תקינות

### דמו מקומי (בלי Apps Script)
- אם `PARENT_MEETINGS_API_URL` ריק, המערכת רצה במצב localStorage —
  שימושי לבדיקת UI אבל הנתונים נשארים רק בדפדפן הספציפי.

### בדיקת המערכת החיה
1. פתחי `index.html` → צרי אירוע ניסיון.
2. פתחי את הקישור להורים בחלון פרטי, רשמי שעה.
3. פתחי את הקישור האישי שלך — בדקי שהפגישה מופיעה.
4. בגיליון: וודאי שיש שורות חדשות ב-`Events`/`Students`/`Bookings`.

### בדיקת תזכורת
- כדי לבדוק את `sendDueReminders` ידנית: הריצי אותה ישירות בעורך כשיש אירוע ליום הבא ופגישה לא-מתוזכרת.
- בדקי את ה-Logs (`Executions`) שאין שגיאות.

---

## מה הגיליון מכיל

| לשונית   | שדות |
|----------|------|
| Events   | eventId, token, title, teacherName, teacherEmail, date, startTime, endTime, slotMinutes, reminderHour, createdAt |
| Students | eventId, studentName, parentEmail, parentPhone |
| Bookings | eventId, studentName, slot, parentName, parentEmail, parentPhone, bookedAt, reminderSent |

`token` הוא מפתח גישת מורה (URL פרטי). אסור לשתף.
