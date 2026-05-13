# הוראות פריסה — חיבור דשבורד מורה ל-Apps Script

מה זה: דף העבודה כבר עובד מקומית בלי שום backend. הקובץ `apps-script.gs` הוא ה-backend שמחבר את הדף ל-Google Sheet (לציונים) ול-Gemini (להסבר "למה טעיתי?").

זמן הגדרה: ~10 דקות.

---

## שלב 1 · יצירת Google Sheet

1. פתחי [sheets.google.com](https://sheets.google.com) → צרי גיליון חדש.
2. שמרי את שם הגיליון (לדוגמה: "Shlemim Results").
3. העתיקי את ה-Sheet ID מה-URL — הוא הקטע בין `/d/` ל-`/edit`:

   ```
   https://docs.google.com/spreadsheets/d/[THIS_IS_THE_ID]/edit
   ```

---

## שלב 2 · יצירת Gemini API Key

1. עברי ל-[aistudio.google.com](https://aistudio.google.com/app/apikey).
2. "Create API key" → בחרי פרויקט קיים או חדש.
3. העתיקי את ה-key.

---

## שלב 3 · יצירת Apps Script Web App

1. עברי ל-[script.google.com](https://script.google.com) → "New project".
2. החליפי את כל התוכן של `Code.gs` בתוכן של הקובץ `apps-script.gs` (מהתיקייה הזו).
3. שני שמירה (Ctrl+S).

### הגדרת פרופרטיז:
4. בצד שמאל: ⚙ Project Settings → Script properties → Add script property.
5. הוסיפי שני properties:
   - `SHEET_ID` → ה-ID שהעתקת בשלב 1
   - `GEMINI_API_KEY` → ה-API key שהעתקת בשלב 2

### בדיקה ראשונית:
6. חזרי ל-Editor.
7. בחרי את הפונקציה `testSetup` בתפריט העליון → לחצי על "Run".
8. אשרי הרשאות (Authorize).
9. פתחי את ה-Logs (View → Logs) → צריך לראות:
   ```
   SHEET_ID: OK
   GEMINI_API_KEY: OK (length 39)
   Sheet name: ...
   Sheet ready.
   ```

### פריסה כ-Web App:
10. למעלה מימין: **Deploy** → **New deployment**.
11. ⚙ → סוג: **Web app**.
12. הגדרות:
    - **Description**: "Shlemim Worksheet API"
    - **Execute as**: Me (your@email.com)
    - **Who has access**: **Anyone** (חשוב — אחרת תלמידים לא יוכלו לגשת)
13. **Deploy** → אשרי הרשאות שוב.
14. **העתיקי את ה-URL**. הוא נראה כך:
    ```
    https://script.google.com/macros/s/AKfycb.../exec
    ```

---

## שלב 4 · חיבור הקבצים

ערכי את שני הקבצים:

### `worksheet.html`
חפשי בערך בשורה 360:
```javascript
const API_ENDPOINT = '';
```
החליפי ל:
```javascript
const API_ENDPOINT = 'https://script.google.com/macros/s/AKfycb.../exec';
```

### `teacher.html`
אותו דבר — חפשי `const API_ENDPOINT = '';` והכניסי את ה-URL.

---

## שלב 5 · בדיקה מקצה לקצה

1. פתחי את `worksheet.html`.
2. הקלידי שם והשלימי 2-3 פריטים. לחצי **בדיקה**.
3. על תשובה שגויה — לחצי **"למה טעיתי?"**. תוך 2-4 שניות צריך להופיע הסבר אישי מ-Gemini.
4. לחצי **"שליחה למורה"**. הכפתור הופך לירוק עם "נשלח ✓".
5. פתחי את `teacher.html`. רענני. הסשן שלך אמור להופיע ברשימה.
6. פתחי את ה-Sheet — צריכות להיות שורות עם התשובות.

---

## פתרון בעיות נפוצות

### "שגיאת רשת" / CORS
Apps Script לפעמים מחזיר CORS שגיאות. הקוד שלנו כבר משתמש ב-`Content-Type: text/plain` שעוקף את זה. אם עדיין יש בעיה — וודאי שהפריסה היא **Anyone** ולא **Anyone with Google Account**.

### "GEMINI_API_KEY not set"
לא הוגדר ה-property. חזרי ל-Project Settings → Script properties.

### תלמידים לא רואים הסברי AI
ה-API_ENDPOINT לא הוכנס ל-worksheet.html. הכפתור "למה טעיתי?" מופיע רק כש-API_ENDPOINT מוגדר.

### העדכון לא מופיע ב-teacher.html
לחצי "רענון" בכפתור הצהוב למעלה. ה-Sheet עדכני, ה-cache של הדפדפן הוא הבעיה.

---

## תחזוקה

- כל מחיקה / שינוי של הקוד ב-Apps Script דורש **Deploy → Manage deployments → Edit (העפרון) → New version → Deploy** כדי שהשינוי יחול.
- ה-Sheet ייגדל עם הזמן. ניתן ליצור Sheet חדש בכל סוף שנה — פשוט מעדכנים את ה-`SHEET_ID` property.

---

## הרחבה לנושאים אחרים

הקובץ `apps-script.gs` מתוכנן להיות **כללי** — הוא תומך בכל worksheet_id (לא רק שלמים). כשתבני דף עבודה לנושא נוסף, ה-API_ENDPOINT נשאר זהה — רק ה-`WORKSHEET_ID` בקבצי ה-HTML משתנה. כל הנתונים יזרמו לאותו Sheet, מסוננים לפי worksheet_id.
