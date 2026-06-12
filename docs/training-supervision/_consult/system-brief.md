# מערכת לניהול פדגוגי — הדרכות קבוצתיות ופרטניות
## תקציר להתייעצות עם GPT / Codex

---

## 🎯 מה המערכת עושה

מערכת ניהול ודיווח על הדרכות מקצועיות למורים בבתי ספר טכנולוגיים בישראל. הלקוח: יחידת הפיקוח על הדרכות במשרד העבודה.

**5 תפקידי משתמש:**
1. **מפקחת ארצית** (רויטל אמיר) — תמונת מצב חוצת-רשתות, סינון לפי מקצוע, שליחת דוחות לכל רשת
2. **מנהל/ת רשת** — סקירת בתי הספר ברשת, אחוז נוכחות פר ביה"ס, שליחת דוח לרשת
3. **מנהל/ת בית ספר** — רשימת המורים בבית הספר + היסטוריית נוכחות בכל המקצועות
4. **רכז/ת פדגוגי/ת** — אותו דשבורד כמו מנהל ביה"ס, פילטר אוטומטי למקצוע יחיד (URL param)
5. **מדריכ/ה מקצועי/ת** (כמו שירה סיבוני במתמטיקה) — דשבורד עם 95 המורים שמלווה, היסטוריית נוכחות, הדרכות עתידיות, כפתור "העתק קישור צ'ק-אין"
6. **מורה** (לא מיושם עדיין) — צ'ק-אין דרך קישור QR

**רשתות נתמכות (9):** אורט · עמל · עתיד · סכנין · דרור · עצמאי חרדי · בית אל · קנדה ישראל · שלומית חרדי

**מקצועות (7 עיוניים):** מתמטיקה · אנגלית · עברית · ספרות · היסטוריה · אזרחות · תנ"ך

---

## 🏗️ ארכיטקטורה

```
┌─────────────────────────────────────────┐
│  Frontend (GitHub Pages)                │
│  HTML + CSS + JS וניל (אין framework)   │
│  RTL · Hebrew · Frank Ruhl Libre+Heebo   │
└─────────────────────────────────────────┘
                  ↕ fetch (GET/POST JSON)
┌─────────────────────────────────────────┐
│  Backend (Google Apps Script)            │
│  ~1100 שורות JS, doGet/doPost router    │
│  ~30 endpoints (action=xxx)              │
└─────────────────────────────────────────┘
                  ↕ SpreadsheetApp API
┌─────────────────────────────────────────┐
│  Database (Google Sheets)                │
│  10 טאבים: networks, schools, teachers,  │
│  trainings, attendance, pd, questions,   │
│  knowledge, feedback, alerts             │
└─────────────────────────────────────────┘
```

**אין שרת ייעודי.** אין DB. הכל רץ על תשתית גוגל + GitHub Pages סטטי.

---

## 📊 מודל הנתונים (10 טאבים)

| טאב | שדות עיקריים |
|---|---|
| `networks` | id, name, color, contactEmail |
| `schools` | id, name, network, principalName, principalEmail, attendanceTarget |
| `teachers` | id, school, network, name, subject, phone, email, sector, seniority, units, students, moeApproval, pdActive |
| `trainings` | id, date, subject, guideName, guideEmail, network, location, qrToken, feedbackEnabled |
| `attendance` | id, trainingId, teacherId, status (present/partial/absent), notes, timestamp, checkedInVia |
| `feedback` | id, trainingId, teacherId, rating, comment |
| `alerts` | id, type, severity, message, targetRole, targetId, createdAt, resolvedAt |
| `pd` | id, teacherId, subject, year, status, fileUrl |
| `questions` | id, teacherId, question, answer, status |
| `knowledge` | id, title, category, audience, link |

נתונים אמיתיים שנטענו עד היום: **שירה סיבוני / מתמטיקה / ינו'-יוני 2026** — 34 בתי ספר, 95 מורים, 6 הדרכות, 176 רשומות נוכחות.

---

## 🔌 Endpoints עיקריים (Apps Script)

**CRUD בסיסיים:**
`networks.list` · `schools.list` · `teachers.list/create/update` · `trainings.list/create` · `attendance.record/bulk`

**דשבורדים מובנים** (כל מידע במסך אחד, מחזירים בקריאה אחת):
- `guide.dashboard` — למדריך/ה (95 מורים + נוכחות + הדרכות)
- `school.dashboard` — למנהל/רכז ב"ס (מקובץ לפי מקצוע)
- `network.dashboard` — למנהל רשת (סטטיסטיקות שנתיות)
- `ministry.dashboard` — למפקחת ארצית (פילוח רשתות, בתי ספר חלשים)

**פיצ'רים מיוחדים:**
- `qr.checkin` — מורה סורקת QR, נרשמת אוטומטית (deduped)
- `certificate.generate` — תעודת PDF אוטומטית בסוף שנה (Google Docs → PDF)
- `seed.import` — upsert חבילת JSON ל-Sheet (לפיילוטים)
- `feedback.submit` — דירוג איכות הדרכה
- `alerts.compute` — מורים שפספסו חודשיים ברציפות

---

## 🚨 בעיות / שאלות פתוחות

### ביצועים
- **קריאה ראשונה לדשבורד: 15-30 שניות** (cold start + readAll פר טאב).
- הוספתי client-side cache 5 דקות, אבל זה פתרון UX-ית בלבד.
- האם יש דרך להאיץ Apps Script + Sheets בארכיטקטורה הזאת? או שצריך מעבר?

### ארכיטקטורה
- **האם Apps Script + Sheets מתאים לסקלה של ~800 מורים × 9 רשתות?**
- מתי לעבור ל-Firebase / Supabase / שרת ייעודי?
- האם להוסיף שכבת cache בצד השרת (Apps Script Cache Service)?

### אבטחה
- **דשבורד מדריכ/ה נפתח לפי URL: `?guide=Shiras@gram.ort.org.il`** — כל מי שיודע את האימייל יכול לראות. האם זה קביל? איך לאבטח?
- נתוני מורים (שם + טלפון + נוכחות) חשופים בלי authentication.
- בקרה על בקשות `seed.import` — אין אימות שמדובר ב-admin.

### UX
- מורות מתמודדות עם **טפסים שלא יודעות לזהות שייכות פיזית** — חיפוש לפי שם בלבד עלול לתת קולגות נוספים עם אותו שם. איך לעצב את זה?
- הדשבורדים מציגים הרבה מידע בבת אחת — האם לשבור לויזרדים? לתת default views?

### מודל נתונים
- **שדה `subject` ב-teachers הוא string חופשי.** אין נירמול. מורה שמלמדת 2 מקצועות = 2 רשומות שונות?
- חודש "מרץ" סומן כ"לא חובה" בקובץ המקורי של שירה — איך לייצג? הסטטיסטיקה תכלול אותו?
- היסטוריה: רשומה ב-`attendance` היא ל-trainingId ספציפי, אבל הדרכות חודשיות אצל שירה לא היו מתועדות פר תאריך — רק פר חודש. נחתי על "אמצע חודש 15.X.2026" — האם זה גישה סבירה?

### תעדוף תכונות
- מה הפיצ'ר הבא הכי משתלם? Push notifications? Email automation? Mobile app? Admin SPA נפרד?

---

## 💡 שאלות ספציפיות שכדאי לשאול

הנה רשימה שאת יכולה לבחור מתוכה מה לשלוח:

1. **"זה ארכיטקטורה סבירה למצב הזה? מה הסיכון בסקלה?"**
2. **"איך אאבטח את הדשבורדים? אני לא רוצה ש-anyone-with-URL יוכל לראות את כל המורים בבית הספר."**
3. **"קריאה ראשונה לדשבורד לוקחת 15-30 שניות. איך לזרז? יש דרך לעשות cache בצד השרת ב-Apps Script?"**
4. **"איך לעצב את המעבר ממסך 'בחירת תפקיד' לדשבורד המתאים, אם כל בית ספר עדיין משתמש באותו URL?"**
5. **"איך לטפל במורה שמלמדת 2 מקצועות שונים — לפצל לרשומות נפרדות או לעשות subjects[] על אותו record?"**
6. **"מה הפיצ'ר הבא שהכי ישפיע על אימוץ — push notifications, אפליקציה לטלפון, או משהו אחר?"**
7. **"אני שוקלת לעבור ל-Supabase או Firebase. שווה את המעבר עכשיו או לחכות עם Apps Script עד שיש 5,000+ מורים?"**

---

## 📦 קוד לעיון

הכל גלוי ב-GitHub (פתוח):
- **ריפו:** https://github.com/meytalp-dev/ort-training
- **תיקיית המערכת:** `docs/training-supervision/`
- **Backend (Apps Script):** `docs/training-supervision/apps-script/code.gs`
- **Frontend:**
  - `docs/training-supervision/index.html` — בחירת תפקיד
  - `docs/training-supervision/ministry/` — דשבורד רויטל
  - `docs/training-supervision/admin-network/` — דשבורד מנהל רשת
  - `docs/training-supervision/admin-school/` — דשבורד מנהל ב"ס + רכז
  - `docs/training-supervision/guide/` — דשבורד מדריך/ה
  - `docs/training-supervision/checkin/` — צ'ק-אין QR
  - `docs/training-supervision/assets/styles.css` — design system
  - `docs/training-supervision/assets/app.js` — API client + cache
- **חי:** https://meytalp-dev.github.io/ort-training/training-supervision/

---

## 🎨 עיצוב

- Mobile-first, RTL, Hebrew
- Frank Ruhl Libre (סריף ממלכתי) לכותרות + Heebo לגוף
- כחול-נייבי `#0b2545` + מבטא זהב `#c8a04d`
- ללא אימוג'ים — SVG inline
- 9 צבעים פר רשת (color chips)

---

## ⏱️ זמן פיתוח עד כה

- 27.5.2026 — תשתית בסיסית, 5 תפקידים, Apps Script פרוס
- 7-12.6.2026 — נתוני שירה אמיתיים, דשבורדים משופרים, דמו ל-5 מקצועות, cache
- **סה"כ ~2 שבועות עבודה חלקית** עם Claude Code (קוד נכתב באמצעי AI agent)
