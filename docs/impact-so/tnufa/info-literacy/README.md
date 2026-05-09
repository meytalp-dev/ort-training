# ImpactOS · אוריינות מידע · ט'

> **מערכת למידה דיגיטלית** לאוריינות מידע לכיתה ט' לקראת תנופה למחר.
> **קהל יעד:** תלמידים (B2C) + בתי ספר (B2B).
> **מבוסס על:** [התוכנית הפדגוגית המלאה](../curriculum/information-literacy-grade9.md).

---

## פילוסופיה

> **המערכת לא מכינה למבחן — היא בונה הרגלי חשיבה.**

אוריינות מידע אינה מקצוע — היא תרבות. המערכת הזו תומכת בערוץ הוראה משולב בכל המקצועות, עם:

- **אבחון פתיחה היברידי** (לא 100 שאלות אמריקאיות) — תרחישים אמיתיים שמודדים את ההרגלים שלך עם AI ואת היכולת שלך להעריך מקור.
- **פורטפוליו ביצועים** — לא ציון יחיד, אלא צמיחה מתועדת.
- **AI Log** — תיעוד שקוף של שימוש ב-AI (כלל 4 מתוך 4 כללי הזהב).
- **5 שלבים שנתיים** — פתיחה · גרעין · יישום · הצגה · רפלקציה.
- **13 רכיבים ב-3 ממדים** — איתור (45%) · ארגון (35%) · הצגה (20%).

---

## מבנה תיקייה

```
docs/impact-so/tnufa/info-literacy/
├── README.md                — קובץ זה
├── index.html               — דף נחיתה + auth
├── student.html             — דשבורד תלמיד.ה
├── diagnostic.html          — אבחון פתיחה (15 שאלות, 20 דק')
├── portfolio.html           — פורטפוליו ביצועים (4 טאבים)
├── teacher.html             — דשבורד מורה (תלמידים + חום-מפה + מטריצה + המלצה)
├── unit-ai-missed.html      — יחידה לדוגמה: "מה ה-AI החמיץ?" (90 דק', 6 שלבים)
├── apps-script/
│   └── code.gs              — backend (Apps Script + Google Sheets)
└── assets/
    ├── css/style.css        — סגנונות (פלטה: truth/think/voice)
    └── js/
        ├── config.js        — 13 רכיבים, 5 שלבים, 4 כללי AI
        ├── auth.js          — login/register
        ├── api.js           — wrapper ל-Apps Script
        └── diagnostic.js    — מנוע ניקוד + שאלות אבחון
```

---

## פלטה

3 צבעים — אחד לכל ממד:

| ממד | צבע | משמעות |
|------|------|--------|
| **1 · איתור והערכה** | `truth` (emerald) | אמת, אימות, יסוד |
| **2 · ארגון ועיבוד** | `think` (violet) | מחשבה, חיבור |
| **3 · הצגה** | `voice` (amber) | קול, ביטוי, חמימות |

---

## Stack טכני

### Frontend
- **HTML/CSS/JS** vanilla (כמו `tnufa/` לאנגלית)
- **Tailwind CSS** (CDN)
- **Heebo + Inter** (Google Fonts)
- **GitHub Pages** לאירוח

### Backend
- **Google Apps Script** (serverless)
- **Google Sheets** כ-DB ב-MVP

### AI
- **Gemini API** (אופציונלי — לפידבק על תשובות פתוחות)

---

## הרצה מקומית

המערכת **סטטית** — אפשר לפתוח כל קובץ HTML בדפדפן.

```bash
cd docs/impact-so/tnufa/info-literacy
open index.html
```

**Demo Mode:** אם `API_URL` ב-`assets/js/config.js` לא הוגדר, המערכת רצה במצב דמו ושומרת ל-localStorage.

---

## הגדרות נדרשות (חד-פעמי)

### 1. Apps Script
1. Open Google Sheets — צור קובץ חדש: "ImpactOS Info Literacy DB"
2. Extensions → Apps Script
3. Copy `apps-script/code.gs`
4. Deploy → New deployment → Web app
   - Execute as: Me
   - Who has access: Anyone
5. Copy ה-Web App URL ל-`assets/js/config.js` (`API_URL`)

### 2. Gemini API Key (אופציונלי — לפידבק AI)
1. Get key at https://makersuite.google.com/app/apikey
2. Apps Script → Project Settings → Script Properties → Add: `GEMINI_API_KEY`

### 3. Sheets שייווצרו אוטומטית
- `Users` — משתמשים (תלמידים/מורים)
- `Profiles` — פרופיל למידה
- `Diagnostics` — תוצאות אבחון פתיחה
- `Portfolio` — פריטי פורטפוליו ביצועים
- `AILog` — לוג שימוש ב-AI (כלל השקיפות)
- `Activities` — פעילויות בתוך יחידות
- `Classes` — שיוך תלמידים-מורים-כיתות

---

## פלואו של תלמיד

```
1. הרשמה (index.html)
       ↓
2. אבחון פתיחה (diagnostic.html, 20 דק')
       ↓
3. דשבורד אישי (student.html)
   ↓
   ├─ פרופיל ב-13 רכיבים
   ├─ 5 שלבים שנתיים
   ├─ 4 כללי הזהב ל-AI
   └─ קישור ליחידה הבאה
       ↓
4. יחידה: "מה ה-AI החמיץ?" (unit-ai-missed.html, 90 דק')
   ↓
   ├─ ניסוח קודם (כלל 1)
   ├─ השוואת 3 פלטי AI (רכיב 1.3)
   ├─ אימות מול מקור אנושי (כלל 2)
   ├─ "מה ה-AI החמיץ?" (כלל 3)
   ├─ תיעוד שקוף (כלל 4)
   └─ שמירה לפורטפוליו
       ↓
5. פורטפוליו (portfolio.html)
   ↓
   ├─ מטלות חקר
   ├─ AI Log
   ├─ פרויקטים מקיפים
   └─ רפלקציות
```

---

## פלואו של מורה

```
1. הרשמה כ-teacher (index.html)
       ↓
2. דשבורד מורה (teacher.html)
   ↓
   ├─ טאב תלמידים: רוסטר עם רמה כללית, חוזקות, חולשות
   ├─ טאב חום-מפה: רמה ממוצעת לכל אחד מ-13 הרכיבים
   ├─ טאב מטריצה חוצת-מקצועות: מי מוביל איזה רכיב
   └─ טאב המלצה השבוע: רכיב חלש + הצעת שיעור
```

---

## סטטוס MVP

### Phase 1 — מוכן ✓
- [x] תוכנית פדגוגית מאושרת ([curriculum](../curriculum/information-literacy-grade9.md))
- [x] דף נחיתה + role selection + auth
- [x] אבחון פתיחה היברידי (15 שאלות, 4 חלקים)
- [x] דשבורד תלמיד עם 13 רכיבים + 5 שלבים
- [x] פורטפוליו ביצועים (4 סוגי פריטים)
- [x] AI Log (כלל השקיפות)
- [x] דשבורד מורה (4 טאבים)
- [x] יחידה לדוגמה: "מה ה-AI החמיץ?"
- [x] Backend Apps Script
- [x] Demo mode (עובד בלי API)

### Phase 2 — V1
- [ ] עוד 5-7 יחידות (פר רכיב)
- [ ] AI feedback אוטומטי על תשובות פתוחות
- [ ] שיוך classId בהרשמה
- [ ] יצוא PDF של פורטפוליו
- [ ] רפלקציה בסוף שלב — אוטומטית

### Phase 3 — V2
- [ ] דשבורד מנהל בית-ספר
- [ ] דוחות PDF למפקחת
- [ ] אינטגרציה עם תנופה תוצאות

---

## URLs

- **Production (פיילוט):** https://meytalp-dev.github.io/ort-training/impact-so/tnufa/info-literacy/
- **Repository:** https://github.com/meytalp-dev/ort-training
- **תוכנית פדגוגית:** [curriculum/information-literacy-grade9.md](../curriculum/information-literacy-grade9.md)

---

## Contact

ImpactOS · מיטל פלג
