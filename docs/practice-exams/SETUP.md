# תרגול מבחני גמר — מדריך הקמה

מערכת תרגול מבחני גמר של משרד העבודה, למגזר כללי ולמגזר ערבי, בכל המקצועות. **רב-מורה** — כל מורה רושמת חשבון, מקבלת קוד אישי, ומשתפת קישור עם הכיתה שלה בלבד.

## ארכיטקטורה

- **index.html** — דף נחיתה (כניסת מורה בלבד; תלמידים נכנסים דרך קישור ממורה)
- **student.html** — פתיחה אוטומטית מקישור `?t=TEA-XXXXX`. תלמיד רושם PIN בפעם ראשונה
- **teacher.html** — רישום/כניסת מורה, דשבורד פרטי, מחוונים
- **exams/index.json + exams/<id>.json** — קטלוג וקבצי מבחנים
- **practice-exams-apps-script.js** — Backend Google Sheet

## זרימה

### מורה חדשה
1. נכנסת ל-[index.html](./index.html) → "רישום / כניסה"
2. בטאב "רישום חדש" — שם, מייל (אופציונלי), PIN (4+ ספרות)
3. מקבלת קוד אישי (לדוגמה `TEA-XK7P2`) + קישור לשיתוף
4. שולחת את הקישור לתלמידים דרך WhatsApp/מייל

### מורה חוזרת
- נכנסת עם שם + PIN → ישר לדשבורד פרטי

### תלמיד
1. לוחץ על הקישור שהמורה שלחה (`student.html?t=TEA-XXXXX`)
2. רואה באנר "המורה שלך: [שם]"
3. פעם ראשונה — ממלא שם + כיתה + בוחר PIN → רישום אוטומטי
4. פעם הבאה — אותם שם+כיתה+PIN → כניסה
5. פותר מבחן → ההגשה מתויגת אוטומטית למורה

### חישוב ציון
- אמריקאית עם מחוון → אוטומטי
- אמריקאית ללא מחוון → לבדיקת מורה
- פתוחה → תמיד לבדיקת מורה
- סופי = אוטומטי + ציונים ידניים

### הפרדה בין מורות
- כל מורה רואה רק את ההגשות של התלמידים שנכנסו דרך הקישור שלה
- מחוונים משותפים (כל מורה רואה את אותן תשובות נכונות למבחן)

## הקמה (חד-פעמית, למיטל)

### שלב 1: Google Sheet + Apps Script
1. sheets.google.com → יצירת גיליון חדש "ort-practice-exams"
2. Extensions → Apps Script → הדבקת `practice-exams-apps-script.js`
3. Save → הרצת `setup` → אישור הרשאות
4. ייווצרו 5 טאבים: submissions, answer_keys, teachers, students, log
5. Deploy → New deployment → Web app:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy → העתקת URL

### שלב 2: חיבור ה-URL
- ב-student.html ו-teacher.html — `const APPS_SCRIPT_URL = ''` → הדבקת URL

### שלב 3: פרסום ל-GitHub Pages
- commit + push → `meytalp-dev.github.io/ort-training/practice-exams/`

## עדכון מ-v1 ל-v2 (אם כבר היה מותקן Apps Script)

1. החלפת הקוד ב-Apps Script (Ctrl+A → Delete → Paste → Save)
2. הרצת `setup` שוב — ייווצרו teachers ו-students
3. **חשוב**: Deploy → Manage deployments → עפרון Edit → Version: "New version" → Deploy
4. ה-URL לא משתנה → אין צורך לעדכן ב-HTML

## הוספת מבחנים חדשים

בניית JSON חדש ב-`exams/<id>.json` לפי התבנית של `civics-taspe-general.json`, הוספה ל-`exams/index.json` עם `"status": "ready"`.

## הגדרת מחוון

כל מורה יכולה להגדיר בטאב "מחוונים" — לוחצת על א/ב/ג/ד הנכון לכל שאלה. נשמר גלובלית למבחן.

## אבטחה — חשוב לדעת

- **PIN**: נשמר plaintext ב-Sheet. לא לשימושי בנק, OK לתרגול בית-ספרי.
- **Web App Access: Anyone**: כל מי שיש לו את הקוד יכול לשלוח. אין בעיה כי ההגשות מתויגות לפי teacherCode.
- **אין איפוס PIN אוטומטי** — אם מורה שוכחת, צריך להירשם מחדש עם שם אחר (או למחוק ידנית מ-teachers Sheet).

## קישורים
- פורטל: [practice-exams/index.html](./index.html)
- מורה: [practice-exams/teacher.html](./teacher.html)
- תלמיד (דרך קישור): [practice-exams/student.html?t=TEA-XXXXX](./student.html)
