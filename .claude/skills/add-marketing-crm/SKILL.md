---
name: add-marketing-crm
description: חיבור אוטומטי של טופס רישום ל-CRM שיווקי בכל דף נחיתה חדש. הפעל אוטומטית כשנוצר דף נחיתה, דף הרשמה, או כל דף עם טופס שאוסף לידים — אלא אם המשתמשת ביקשה אחרת.
---

# חיבור אוטומטי ל-CRM שיווקי

**כלל ברזל:** כל דף נחיתה או דף עם טופס רישום חייב להיות מחובר ל-CRM השיווקי, אלא אם מייטל אמרה במפורש "בלי CRM" או "בלי טופס".

## מתי להפעיל

- דף נחיתה חדש (landing page)
- דף הרשמה (registration)
- כל דף שיש בו טופס שאוסף שם/מייל/טלפון
- דף שמקדם הדרכה, קורס, או שירות

## שלב 1 — הוספת סקריפט ההגדרות

הוסיפי לפני `</body>`:

```html
<!-- CRM שיווקי -->
<script src="/ort-presentation-builder/marketing/config.js"></script>
```

## שלב 2 — חיבור הטופס

בכל טופס רישום, בפונקציית ה-submit, הוסיפי קריאה ל-`sendLeadToCRM`:

```javascript
form.addEventListener('submit', async function(e) {
  e.preventDefault();

  // איסוף הנתונים מהטופס
  var lead = {
    name: form.querySelector('[name="name"]').value,
    email: form.querySelector('[name="email"]').value,
    phone: form.querySelector('[name="phone"]').value || '',
    role: form.querySelector('[name="role"]').value || '',
    source: 'LANDING_PAGE_NAME',  // ← שם הדף הספציפי
    interest: 'INTEREST_HERE'      // ← מה מעניין (קורס, סדנה, וכו)
  };

  try {
    await sendLeadToCRM(lead);
    // הצגת הודעת הצלחה
  } catch(err) {
    // הצגת הודעת שגיאה
  }
});
```

## שלב 3 — עדכון source לפי הדף

**חשוב:** תמיד לעדכן את `source` לפי שם הדף הספציפי:

| דף | source |
|----|--------|
| דף נחיתה כללי | `'landing-main'` |
| דף הדרכת Claude Code | `'landing-claude-code'` |
| דף הרשמה לקורס | `'register-course'` |
| דף למנהלים | `'landing-principals'` |
| דף אינסטגרם | `'link-in-bio'` |
| כל דף אחר | `'landing-PAGENAME'` |

ככה אפשר לדעת ב-CRM מאיפה הגיע כל ליד.

## מה זה עושה

כש-ליד נרשם דרך הטופס:
1. הנתונים נשמרים בגיליון הלידים ב-Google Sheets
2. נשלח מייל "ברוכים הבאים" אוטומטי לנרשם
3. מייטל מקבלת התראה במייל על ליד חדש
4. אחרי 3 ימים נשלח מייל מעקב אוטומטי

## חשוב

- **לא לשנות את ה-URL ישירות בדף** — תמיד להשתמש בקובץ config.js המשותף
- אם צריך לשנות URL — לשנות רק ב-`docs/marketing/config.js`
- הפונקציה `sendLeadToCRM()` כבר כוללת fallback אם POST לא עובד
- אם הדף כבר מחובר ל-Apps Script ישן (SHEETS_URL) — להחליף ל-config.js
- **אם מייטל אומרת "בלי CRM" — לא לחבר**
