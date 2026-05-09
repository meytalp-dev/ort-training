# ImpactOS Tnufa · English

> **מערכת למידה דיגיטלית** באנגלית לכיתה ט' לקראת תנופה.
> **קהל יעד:** תלמידים (B2C) + בתי ספר (B2B).

---

## תוכן הפרויקט

### תכנון ופדגוגיה
- [`spec.md`](spec.md) — איפיון המוצר העסקי
- [`pedagogy.md`](pedagogy.md) — בסיס פדגוגי מאומת
- [`mvp-plan.md`](mvp-plan.md) — תוכנית MVP (10 שבועות)
- [`curriculum/`](curriculum/) — תוכנית פדגוגית מסטר (4 מסמכים + מילון + השוואה)

### קוד המערכת
- `index.html` — דף נחיתה + בחירת תפקיד + login/register
- `student.html` — דשבורד תלמיד.ה (בקרוב)
- `teacher.html` — דשבורד מורה (בקרוב)
- `parent.html` — דשבורד הורה (בקרוב)
- `assets/` — CSS, JS, אייקונים
- `apps-script/code.gs` — backend (Apps Script + Google Sheets)

---

## Stack טכני

### Frontend
- **HTML/CSS/JS** vanilla (כמו parent-meetings)
- **Tailwind CSS** (CDN)
- **Heebo + Inter** (Google Fonts)
- **GitHub Pages** לאירוח חינמי
- **PWA** מותאם לסמארטפון

### Backend
- **Google Apps Script** (serverless)
- **Google Sheets** כ-DB ב-MVP
- **CORS-friendly endpoints** (doGet/doPost)

### AI
- **Gemini API** — generation, evaluation, feedback
- **Web Speech API** (browser-native) — STT/TTS חינמי
- **ElevenLabs** (אופציונלי) — TTS איכותי לתשלום

### תקשורת
- **Email** — דרך MailApp.sendEmail (Apps Script)
- **WhatsApp** — דרך api.whatsapp.com פתיחה אוטומטית

---

## הרצה מקומית

המערכת **סטטית** — אפשר לפתוח כל קובץ HTML בדפדפן.
ה-backend רץ ב-Google Cloud (Apps Script).

```bash
# Clone + open
git clone https://github.com/meytalp-dev/ort-training
cd ort-training/docs/impact-so/tnufa
open index.html
```

---

## הגדרות נדרשות (חד-פעמי)

### 1. Apps Script
1. Open Google Sheets — צור קובץ חדש בשם "ImpactOS Tnufa English DB"
2. Extensions → Apps Script
3. Copy `apps-script/code.gs` content
4. Deploy → New deployment → Web app
   - Execute as: Me
   - Who has access: Anyone
5. Copy ה-Web App URL ל-`assets/js/config.js` (`API_URL`)

### 2. Gemini API Key
1. Get key at https://makersuite.google.com/app/apikey
2. ב-Apps Script: Project Settings → Script Properties → Add: `GEMINI_API_KEY`

### 3. Sheets שייווצרו אוטומטית
- `Users` — משתמשים (תלמידים/מורים/הורים)
- `Sessions` — סשנים
- `Activities` — פעילויות בתוך סשנים
- `Profiles` — פרופיל למידה (רמה, חולשות)
- `Content` — מאגר טקסטים, שאלות, פעילויות
- `Vocabulary` — chunks ידועים לכל תלמיד.ה

---

## Roadmap

### MVP (Phase 1) — בעבודה
- [x] תוכנית פדגוגית מאושרת
- [x] איפיון מוצר
- [x] תוכנית MVP מפורטת
- [ ] **כעת:** דף נחיתה + role selection + auth
- [ ] אבחון פתיחה (Diagnostic)
- [ ] דשבורד תלמיד + יחידה ראשונה (My World)
- [ ] AI feedback על כתיבה
- [ ] Spaced retrieval לאוצר מילים
- [ ] דשבורד הורה (סיכום שבועי)
- [ ] דשבורד מורה (כיתתי)

### V1 (אחרי MVP מוצלח)
- [ ] 7 יחידות נוספות
- [ ] Speaking practice עם Voice
- [ ] Mock Exam mode (פעמיים בלבד)
- [ ] אינטגרציה Google Classroom
- [ ] תשלומים אוטומטיים

### V2
- [ ] עברית כיתה ד'
- [ ] אוריינות מידע ט'
- [ ] אפליקציה native

---

## URLs

- **Production (פיילוט):** https://meytalp-dev.github.io/ort-training/impact-so/tnufa/
- **Repository:** https://github.com/meytalp-dev/ort-training
- **Docs:** [התוכנית הפדגוגית המלאה](curriculum/index.md)

---

## Contact

ImpactOS · מיטל פלג

