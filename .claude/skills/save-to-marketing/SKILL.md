---
name: save-to-marketing
description: שמירת פוסט/עיצוב/GIF למערכת השיווק. הפעל כשמייטל אומרת "שמור במערכת", "תוסיף לשיווק", "תשמור את זה לפייסבוק", "שמור פוסט", או כל בקשה לשמור תוצר שיווקי. גם אחרי סיום עיצוב/GIF/תמונה — להציע לשמור.
---

# שמירת תוצר למערכת השיווק

**מתי להפעיל:**
- מייטל מבקשת לשמור פוסט/עיצוב/GIF/תמונה למערכת
- מייטל סיימה ליצור תוצר שיווקי (להציע: "רוצה שאשמור את זה במערכת השיווק?")
- מייטל אומרת "שמור לפייסבוק/אינסטגרם/לינקדאין"

## תהליך

### שלב 1 — איסוף פרטים
לשאול את מייטל (רק מה שחסר):
- **פלטפורמה**: פייסבוק / אינסטגרם / לינקדאין / וואטסאפ
- **דף**: learny / ort (אם פייסבוק)
- **טקסט הפוסט**: מה לכתוב
- **תאריך פרסום**: מתי לפרסם (או "עכשיו")
- **סדרה**: אם שייך לסדרה (#טיפ_AI_למורה, #לפני_אחרי_AI, וכו')

### שלב 2 — שמירת הקובץ
אם יש קובץ (תמונה/GIF):
1. העתק/שמור את הקובץ לתיקייה: `docs/marketing/assets/posts/`
2. שם הקובץ: `YYYY-MM-DD-platform-short-title.ext`
   דוגמה: `2026-03-28-facebook-fly-with-ai.gif`

### שלב 3 — שמירה בגיליון
שלח POST ל-Apps Script:
```javascript
fetch('https://script.google.com/macros/s/AKfycbxT00qDSj1NCQgRnAKbktihfoIERvWsuT4cxkTvAeOWPZFWqOCIuZ6uchlCjQEfiZjO/exec', {
  method: 'POST',
  body: JSON.stringify({
    action: 'saveContent',
    date: '2026-03-28',
    platform: 'Facebook',
    series: '#טיפ_AI_למורה',
    title: 'טקסט הפוסט כאן',
    status: 'ready',  // או 'scheduled' אם יש תאריך עתידי
    link: 'https://meytalp-dev.github.io/ort-training/marketing/assets/posts/filename.gif',
    notes: 'דף: learny | תמונה: filename.gif'
  })
})
```

### שלב 4 — פרסום (אם ביקשה "עכשיו" או "פרסמי")
השתמשי ב-Facebook MCP:

**פוסט עם תמונה/GIF:**
```
fb_publish_photo(
  page: "learny",  // או "ort"
  message: "טקסט הפוסט",
  image_url: "https://meytalp-dev.github.io/ort-training/marketing/assets/posts/filename.gif"
)
```

**פוסט טקסט בלבד:**
```
fb_publish_post(
  page: "learny",
  message: "טקסט הפוסט"
)
```

אחרי פרסום — עדכן את הסטטוס בגיליון ל-"published".

### שלב 5 — אישור
הצג למייטל:
- "הפוסט נשמר במרכז השיווק" + קישור ל-hub.html
- אם פורסם: "הפוסט פורסם בפייסבוק!" + קישור לפוסט

## דפי פייסבוק זמינים
| שם | מזהה | שימוש |
|----|------|-------|
| learny | לרני-learny | הדרכות AI, תוכן מקצועי |
| ort | תיכון אורט בית הערבה | תוכן בית ספרי |

## מבנה תיקיות לקבצים
```
docs/marketing/assets/posts/
  2026-03-28-facebook-fly-with-ai.gif
  2026-03-29-instagram-tool-of-week.png
  ...
```

## חשוב
- תמיד לשמור גם בגיליון וגם את הקובץ
- לדחוף ל-GitHub אחרי שמירת קובץ (כדי שה-URL יעבוד)
- אם מייטל אומרת "תזמני" — לשמור עם סטטוס "scheduled" ולציין בהערות את התאריך
- אם מייטל אומרת "פרסמי עכשיו" — לפרסם ישר דרך Facebook MCP
- **לא לפרסם בלי אישור מפורש** של מייטל
