# שתיים — מערכת גיוס משאבים לעמותות

## סיכום הפרויקט

מערכת דיגיטלית מלאה לגיוס משאבים לעמותות, נבנתה עבור **עמותת הופה** (לירון גולן) כפיילוט למוצר **שתיים**.

**לינק חי:** https://meytalp-dev.github.io/ort-training/shtayim/grants/?org=hoppa

---

## ארכיטקטורה

### קבצים ב-docs/shtayim/grants/

| קובץ | תפקיד |
|------|--------|
| `index.html` | הממשק הראשי — HTML + CSS (סיידבר, 12 דפים, טבלאות, מודלים) |
| `engine.js` | מנוע נתונים — טוען מ-JSON (דמו) או מ-Google Sheet (הופה) לפי `?org=` |
| `content-gen.js` | מחולל תוכן — מחקר קרן, כתיבת הגשות, צ'קליסט מסמכים, הוספת קול קורא |
| `demo.json` | נתוני דמו סטטיים (8 קולות, 6 קרנות) |
| `hoppa.json` | נתוני הופה (7 קולות, 11 קרנות, 5 פרויקטים, 3 הגשות, 4 שותפים) |
| `apps-script.js` | Google Apps Script — API לקריאה/כתיבה מ-Sheet |
| `flowchart.html` | תרשים זרימה — 7 שלבים מחיפוש עד הגשה |

### Google Sheet

- **שם:** שתיים — גיוס משאבים | הופה
- **ID:** `1MaOXuFr9bueGJj-xP1JxmV24ioZ_jXSEcWZRy-4GoPE`
- **Apps Script URL:** `https://script.google.com/macros/s/AKfycbzl7LLZIXFtFBXN8b3K0VBXZMoPzAYwokbPgdVU-WLVHr20i_Pbng9Sb94X8FOkY89m/exec`
- **גיליונות (7):** פרופיל, קולות_קוראים, קרנות, הגשות, פרויקטים, תקציב, checklist

### סוכן סריקה מתוזמן (Routine)

- **ID:** `trig_01LvA9d931yr6xEgEq5XSFkV`
- **תדירות:** כל ראשון וחמישי ב-7:00 בוקר (שעון ישראל)
- **מה עושה:** סורק DuckDuckGo ב-7 שאילתות, מנתח התאמה, כותב ל-Sheet
- **מעקב:** https://claude.ai/code/scheduled/trig_01LvA9d931yr6xEgEq5XSFkV
- **סקיל ידני:** `/scan-grants` — סריקה עמוקה עם 2 סוכנים (Perplexity + WebSearch)

---

## תהליך העבודה — 7 שלבים

1. **חיפוש קולות קוראים** — סוכן אוטומטי (ראשון+חמישי) + `/scan-grants` ידני
2. **סינון ראשוני** — ציון התאמה אוטומטי (0-100%) עם הסבר גלוי
3. **מחקר קרן** — כפתור "חקור" ליד כל קרן: לינקי חיפוש + שאלות מנחות + שמירת ממצאים ל-Sheet
4. **ניתוח הנחיות** — בורר קול קורא מה-Sheet, ממלא פרטים + פרופיל עמותה
5. **כתיבת הגשה** — מחולל תוכן עם 5 תבניות מפורטות (הצעה/אימפקט/מכתב/תקציב/תודה), מילוי מהיר מנתוני העמותה
6. **צ'קליסט מסמכים** — 10 מסמכים עם סימון חובה/אופציונלי, שמירה ל-Sheet
7. **הגשה ומעקב** — שמירת הגשות ל-Sheet, מעקב סטטוס

---

## API של Apps Script

### GET
- `?action=getAll` — כל הנתונים
- `?action=getCalls` — קולות קוראים
- `?action=getFunds` — קרנות
- `?action=getProfile` — פרופיל
- `?action=getChecklist` — צ'קליסט מסמכים

### POST
- `action: saveCalls` — שמירת קולות קוראים (מסוכן סריקה)
- `action: saveCall` — קול קורא בודד
- `action: saveSubmission` — הגשה
- `action: saveFunds` — קרנות
- `action: saveChecklist` — צ'קליסט
- `action: saveFundNotes` — הערות מחקר קרן
- `action: updateProfile` — פרופיל
- `action: clearDemo` — ניקוי נתוני דמו

---

## עיצוב

- **צבעים:** plum (#7B5EA7), coral (#E8836B), mint (#5BBF9E), gold (#D4A843), red (#E85B5B)
- **פונטים:** Rubik לכותרות, Heebo לגוף
- **סיידבר:** כהה (#0D0A14), 7 דפים גלויים + 5 מוסתרים תחת "עוד"
- **RTL:** dir="rtl", lang="he", סיידבר בימין
- **מובייל:** breakpoints 900px + 500px, touch targets 44px

---

## נתוני הופה (אמיתיים)

- **מנכ"לית:** לירון גולן — מומחית גיוס משאבים, רקע פרסום ושיווק, 2 קורסי גיוס
- **תחומים:** חינוך, נוער בסיכון, פיתוח קהילתי
- **אזור:** ירושלים, באר שבע, נתיבות
- **מוטבים:** 750 ישירים, 2,000 עקיפים
- **שביעות רצון:** 92%
- **5 פרויקטים:** אור בקצה (120), מעבדת מחשבים (80), מניעת נשירה (200), העצמת נשים (50), ספרייה קהילתית (300)
- **4 שותפים:** עיריית באר שבע, JDC, מועצת נתיבות, ברנקו וייס
- **תקציב:** 475K מבוקש, 45K מאושר

---

## בדיקות מוצר שנעשו

### סיבוב 1 — 11 סוכנים (מצב מלא)
- ציון ממוצע: **7.4/10**
- 5 תיקונים בוצעו

### סיבוב 2 — 6 סוכנים (מצב מהיר)
- ציון ממוצע: **8.0/10** (+0.6)
- 3 תיקונים נוספים לפי שירה (מנכ"לית)

### סיבוב 3 — שירה בלבד
- ציון: **7.0/10**
- 3 תיקונים אחרונים → צפי **8/10**

### בעיות ידועות (לא חוסמות)
- אין התראות WhatsApp/מייל על דדליינים
- אין ייצוא Word/PDF
- אין שיתוף פעולה (multi-user)
- הניתוח הוא תבניות, לא AI אמיתי

---

## פקודות שימושיות

```bash
# סריקה ידנית עמוקה (2 סוכנים)
/scan-grants

# בדיקת מוצר מלאה
/product-review docs/shtayim/grants/index.html?org=hoppa

# בדיקת נתונים ב-Sheet
curl -sL "https://script.google.com/macros/s/AKfycbzl7LLZIXFtFBXN8b3K0VBXZMoPzAYwokbPgdVU-WLVHr20i_Pbng9Sb94X8FOkY89m/exec?action=getAll"
```

---

## הוספת עמותה חדשה

1. צור Google Sheet חדש בשם "שתיים — גיוס משאבים | [שם עמותה]"
2. הדבק את apps-script.js ב-Extensions > Apps Script
3. הרץ `initialSetup()` — ייצור 7 גיליונות
4. Deploy > New deployment > Web app
5. צור `[name].json` חדש ב-docs/shtayim/grants/
6. עדכן את URL ב-engine.js אם צריך
7. הלינק: `?org=[name]`
