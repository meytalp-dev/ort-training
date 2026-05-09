# מערכת הזמנת תורים — הדר בק | מדריך התקנה

מערכת בת 3 קבצים שעובדת על Google Sheets בלבד. בלי שרת, בלי דאטה־בייס.

## קבצים

| קובץ | תיאור | דורש Deploy? |
|---|---|---|
| `booking.html` | דף הזמנת התור הציבורי ללקוחות | ❌ — קובץ סטטי |
| `admin.html` | דשבורד ניהול להדר (PIN protected) | ❌ — קובץ סטטי |
| `apps-script.js` | קוד שרת ב-Google Apps Script | ✅ — חייב Deploy |

---

## התקנה (פעם אחת, ~15 דק')

### שלב 1 — Google Sheet
1. פתחי https://sheets.google.com → יצירת גיליון חדש בשם **"הזמנות הדר"**
2. צרי 2 גיליונות (Tabs בתחתית, סימן `+`):

   **גיליון "הזמנות"** — שורה 1:
   ```
   id | תאריך_שליחה | שם | טלפון | שירות | משך_דקות | תאריך_פגישה | שעה_פגישה | הערות | סטטוס
   ```

   **גיליון "ימי_חופש"** — שורה 1:
   ```
   תאריך | סיבה
   ```

### שלב 2 — Apps Script
1. בתוך הגיליון: **Extensions → Apps Script**
2. מחקי את הקוד הקיים (`function myFunction() {}`)
3. העתיקי את כל התוכן של [`apps-script.js`](apps-script.js) ← הדביקי
4. עדכני בראש הקוד 2 קבועים:
   ```js
   const ADMIN_PIN  = '1234';   // ← בחרי קוד 4 ספרות להדר
   const HADAR_EMAIL = '';      // ← אימייל להדר (אופציונלי, למשל hadar@gmail.com)
   ```
5. שמרי (Ctrl+S), שם פרויקט: **"Hadar Booking"**

### שלב 3 — Deploy
1. **Deploy → New deployment**
2. לחצי על הגלגל ובחרי **Web app**
3. הגדרות:
   - **Description:** `Hadar Booking v1`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
4. **Deploy** → אשרי הרשאות (`Advanced → Go to Hadar Booking (unsafe) → Allow`)
5. **העתיקי את ה-Web app URL** (מסתיים ב-`/exec`)

### שלב 4 — חיבור הקבצים
1. ב-`booking.html` — חפשי `const SHEETS_URL = '';` והדביקי את ה-URL בין הגרשיים
2. ב-`admin.html` — חפשי `const SHEETS_URL = '';` והדביקי את ה-URL בין הגרשיים

### שלב 5 — בדיקה
1. פתחי את `booking.html` בדפדפן → הזמיני תור דמה
2. פתחי את `admin.html`, הכניסי PIN → צריך לראות את ההזמנה
3. אשרי את ההזמנה → השעה הזאת לא תופיע יותר ב-`booking.html` באותו תאריך

---

## ⚠️ עדכון הקוד אחרי שינוי

כל שינוי ב-`apps-script.js` דורש Deploy חדש:
1. **Deploy → Manage deployments**
2. עיפרון (✏️) ליד ה-deployment הקיים
3. **Version: New version** → Deploy
4. ה-URL **לא משתנה** — לא צריך לעדכן בקבצים

---

## איך זה עובד

```
לקוחה → booking.html → JSONP submit → Apps Script → Sheet (status="חדש")
                                                  ↓
                                            (אופציונלי) מייל להדר
הדר → admin.html → PIN → רשימת הזמנות → לחיצה "אישור" → status="אושר"
                                                       ↓
                              busy_times API → booking.html יסנן את השעה הזאת
```

**סטטוסים:**
- `חדש` — בקשה חדשה, ממתינה לאישור הדר. השעה עדיין פנויה למישהי אחרת.
- `אושר` — הדר אישרה. השעה חסומה במערכת.
- `נדחה` — הדר דחתה. השעה משתחררת.
- `בוצע` — הטיפול התקיים. השעה נשארת חסומה (היסטוריה).

---

## הוספת מחירים (מאוחר יותר)

ב-`booking.html` — חפשי את `const SERVICES`. כל שירות יש לו `price: null`.
שני את ל-`price: 280` (לדוגמה) → המחיר יוצג בכרטיס.

---

## מה אין במערכת (אבל אפשר להוסיף בשלב הבא)

- ❌ תזכורת SMS אוטומטית 24 שעות לפני (דורש Twilio או Green API)
- ❌ סנכרון עם Google Calendar
- ❌ תשלום מקדמה אונליין
- ❌ דשבורד ללקוחה (היסטוריית טיפולים)

---

## כתובות

- **דף הזמנה ציבורי:** `https://meytalp-dev.github.io/ort-presentation-builder/clients/hadar-massage/booking.html`
- **דשבורד ניהול:** `https://meytalp-dev.github.io/ort-presentation-builder/clients/hadar-massage/admin.html`

⚠️ ה-PIN הוא ההגנה היחידה על האדמין. **לא לשתף את ה-URL** של admin עם אף אחת חוץ מהדר.
