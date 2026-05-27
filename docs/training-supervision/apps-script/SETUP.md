# מדריך התקנה — מערכת פיקוח הדרכות

## שלב 1: יצירת Google Sheet
1. פתחי [Google Sheets חדש](https://sheets.new)
2. שמי לו שם "פיקוח הדרכות — משרד העבודה"
3. **צרי 8 טאבים** בשמות הבאים (חשוב — בדיוק כך):
   - `networks`
   - `schools`
   - `teachers`
   - `trainings`
   - `attendance`
   - `pd`
   - `questions`
   - `knowledge`

## שלב 2: התקנת Apps Script
1. בתוך ה-Sheet → תפריט **Extensions → Apps Script**
2. מחקי את כל הקוד הקיים והדביקי את התוכן של `code.gs`
3. שמרי (Ctrl+S)
4. הריצי פעם אחת את הפונקציה `setupSchema()` (בחרי אותה מהתפריט "Run").
   זה ייצור את כל העמודות בטאבים והנתונים הראשוניים.

## שלב 3: Deploy
1. כפתור **Deploy → New deployment**
2. סוג: **Web app**
3. הגדרות:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. לחצי **Deploy** — תקבלי URL בצורת `https://script.google.com/macros/s/.../exec`

## שלב 4: חיבור המערכת
1. חזרי לדף הראשי של המערכת
2. לחצי **הגדרות** בראש הדף
3. הדביקי את ה-URL ולחצי שמירה
4. הדף יטען מחדש — המערכת מחוברת

## תפריטי בחירה (5 רשתות)
- אורט
- עמל
- עתיד
- סכנין
- דרור

ניתן להוסיף רשתות נוספות דרך הטאב `networks` ב-Sheet.
