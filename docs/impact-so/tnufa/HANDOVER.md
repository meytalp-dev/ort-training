# ImpactOS Tnufa English — סיכום מלא להמשך עבודה בשיחה חדשה

> **תאריך עדכון אחרון:** 11.5.2026
> **מטרת המסמך:** סיכום כל מה שצריך לדעת כדי להמשיך לבנות בשיחה חדשה.
> **קרא ראשון:** המסמך הזה. אחר כך עבור למסמכים הספציפיים.

---

## 1 · בקצרה — מה זה הפרויקט

**ImpactOS Tnufa English** = מערכת למידה דיגיטלית באנגלית לכיתה ט', המכינה למבחני תנופה תוך פיתוח מיומנויות אמיתיות.

- **חלק מ-ImpactOS** — חברת/מותג של מיטל פלג
- **קהל יעד:** בתי ספר (B2B) + הורים פרטיים (B2C) — **לכלל בתי הספר בישראל**, לא לאורט
- **מצב:** MVP בעבודה. דף נחיתה + auth + אבחון פתיחה — בנויים. יחידה ראשונה (My World) — בקרוב
- **תקציב MVP:** 6,000-8,000 ש"ח (10 שבועות)

---

## 2 · מבנה הקבצים

### תיקייה ראשית: `docs/impact-so/tnufa/`

#### תיעוד פדגוגי (כתוב, מאומת)
- [`spec.md`](spec.md) — איפיון מוצר עסקי (16 פרקים)
- [`pedagogy.md`](pedagogy.md) — בסיס פדגוגי מאומת ממסמכי ראמ"ה רשמיים
- [`mvp-plan.md`](mvp-plan.md) — תוכנית MVP מפורטת (10 שבועות, תקציב, צוות)

#### תוכנית פדגוגית מסטר: `curriculum/`
- [`curriculum/index.md`](curriculum/index.md) — מסגרת מאחדת
- [`curriculum/hebrew-grade4.md`](curriculum/hebrew-grade4.md) — תוכנית עברית כיתה ד'
- [`curriculum/english-grade9.md`](curriculum/english-grade9.md) — תוכנית אנגלית כיתה ט'
- [`curriculum/information-literacy-grade9.md`](curriculum/information-literacy-grade9.md) — תוכנית אוריינות מידע ט'
- [`curriculum/glossary.md`](curriculum/glossary.md) — מילון 80 מושגים פדגוגיים
- [`curriculum/comparison-with-curriculum-2020.md`](curriculum/comparison-with-curriculum-2020.md) — השוואה לתוכנית רשמית
- [`curriculum/assets/style.css`](curriculum/assets/style.css) — CSS להמרת MD ל-HTML (התחלתי, לא הסתיים)

#### קוד המערכת (פעיל)
- [`index.html`](index.html) — דף נחיתה + login/register (כולל שדה classCode לתלמידים)
- [`student.html`](student.html) — דשבורד תלמיד.ה
- [`diagnostic.html`](diagnostic.html) — אבחון פתיחה
- [`session.html`](session.html) — שלד הסשן היומי (5 פעילויות)
- [`teacher.html`](teacher.html) — דשבורד מורה (3 טאבים: רוסטר/חום-מפה/בסיכון)
- `parent.html` — **לא נבנה עדיין**
- [`README.md`](README.md) — הוראות הפעלה

#### Assets
- `assets/css/style.css` — סגנונות
- `assets/js/config.js` — הגדרות מערכת + API_URL
- `assets/js/auth.js` — login/register flow (כולל classCode)
- `assets/js/api.js` — API wrapper ל-Apps Script (כולל teacher endpoints)
- `assets/js/diagnostic.js` — לוגיקת האבחון (20 שאלות)
- `assets/js/session.js` — בקר הסשן + Resume מ-localStorage
- `assets/js/activities/` — 5 מודולי פעילות (vocabulary/reading/listening/grammar/writing)
- `assets/data/unit-1-content.js` — בנק התוכן של Unit 1 (My World)

#### Backend
- `apps-script/code.gs` — Apps Script + Google Sheets

---

## 3 · הסטטוס הטכני

### Apps Script (פעיל!)
- **URL:** `https://script.google.com/macros/s/AKfycbx3myXebZIbXes6vK17K90R-rjh5FqAXHhXjsoVzwT7wNfcu_w6ZXBoDHB6pX9MFcj47w/exec`
- **כבר מוגדר ב:** `assets/js/config.js`
- **Sheets שיווצרו אוטומטית:** Users, Profiles, Sessions, Activities, Content
- **Gemini API Key:** מיטל הגדירה (Script Properties)

### GitHub Pages
- **URL ראשי:** https://meytalp-dev.github.io/ort-training/impact-so/tnufa/
- **Repo:** github.com/meytalp-dev/ort-training

### מה עובד עכשיו
✅ דף נחיתה יפה
✅ הרשמה (Register) — כולל שדה classCode לתלמידים, classId אוטומטי למורים
✅ כניסה (Login)
✅ דשבורד תלמיד.ה (אם עברה אבחון או לא)
✅ אבחון פתיחה (20 שאלות, מחשב CEFR אוטומטית)
✅ שמירה לפרופיל
✅ סשן יומי (5 פעילויות, ~18 דק', Unit 1 My World)
✅ 5 מודולי פעילות: vocabulary / reading / listening (TTS) / grammar / writing
✅ AI feedback על כתיבה (מוטמע ב-WritingActivity דרך API.aiFeedback)
✅ Resume של סשן (שמירה ב-localStorage, TTL 12 שעות, "להמשיך מאיפה שעצרת?")
✅ דשבורד מורה — רוסטר + חום-מפה + תלמידים בסיכון + modal פרטי תלמיד.ה
✅ שיוך כיתה (classId — מורה מקבלת קוד אוטומטי, תלמידים מקלידים בהרשמה)

### מה לא עובד עדיין
❌ דשבורד הורה (parent.html)
❌ עוד יחידות תוכן (Units 2-8) — רק Unit 1 בנוי
❌ Speaking practice
❌ Mock exam mode
❌ ייצוא PDF / דוחות
❌ שיוך תלמיד.ה לכיתה אחרי הרשמה (כרגע רק בעת ההרשמה)

---

## 4 · נקודות חשובות לדעת

### עיצוב
- **Dream Theme** — רקע לבן + lead (אינדיגו) + dream (ורוד) + create (טורקיז)
- **Heebo + Inter** (גופנים)
- **אין אימוג'ים** — רק SVG icons
- **RTL** + `lang="he"` בכל HTML
- **PWA, mobile-first** (כי תנופה בסמארטפון)

### Stack טכני
- **Frontend:** HTML/CSS/JS vanilla + Tailwind CDN
- **Backend:** Apps Script (TypeScript-style JS)
- **DB:** Google Sheets (אוטומטי)
- **AI:** Gemini API (Flash 2.5)
- **Hosting:** GitHub Pages (free)

### QA Hook
יש hook ב-`.claude/hooks/qa-html.py` שבודק:
- `dir="rtl"` ו-`lang="he"` בתגית `<html>`
- פונט עברי טעון
- קישורים לא שבורים
- פסקאות לא ארוכות מדי

**אם הוא חוסם — צור את הקישור החסר קודם.**

### עיקרי מדיניות (MEMORY)
- **commit + push אוטומטי** בסיום משימה (בלי לשאול)
- **לא לפרסם בלי אישור** במקומות חיצוניים
- **לא רק למורים** — דוגמאות גם לניהול/יזמות/שיווק
- **קישורים תמיד לחיצים** ב-markdown
- **ImpactOS ≠ אורט** — מוצר לכלל בתי הספר

---

## 5 · החלטות פדגוגיות חשובות

### העקרונות שאסור לאבד (מ-curriculum)
1. **לא teaching to the test** — מקסימום 1-2 mock exams
2. **CLT + TBLT + Lexical Approach** — לא PPP
3. **75% Reading במבחן ≠ 75% בכיתה** — Listening 25-30%, Speaking 15-20%
4. **3 שכבות לקסיקליות** — Active 600-800, Receptive 1500-2000, Strategic 200-300
5. **18 סוגי טקסטים → 5 משפחות פונקציונליות**
6. **Selective Correction** — שגיאה אחת ממוקדת לפסקה, לא תיקון מקיף
7. **Bridge חודש וחצי** בתחילת השנה לסגירת חסרים
8. **לימוד ממשיך אחרי המבחן** — יחידה 8 חיונית
9. **Lexical Chunks > מילים בודדות** (פי 3 בזיכרון)
10. **Tiered Tasks** — אותה משימה, רמות תמיכה שונות

### יעדי המוצר (לא לאבד)
- כל תרגיל ממופה לסטנדרט תנופה ספציפי
- AI נותן פידבק פדגוגי (לא רק נכון/שגוי)
- דוחות מתורגמים ל"דמות הבוגר"
- מותאם לכיתה הטרוגנית (3 רמות)

---

## 6 · מה הבא — Phases פתוחות

### ✓ Phase 4 — סשן יומי (Unit 1 My World) — הושלם
נבנה ב-9-10.5.2026:
- `session.html` + `session.js` (בקר עם Resume דרך localStorage)
- 5 מודולי פעילות תחת `assets/js/activities/`
- בנק תוכן `assets/data/unit-1-content.js` (12 chunks, 3 טקסטים, listening, grammar, writing)

### ✓ Phase 5 — AI feedback מוטמע — הושלם
WritingActivity קורא ל-`API.aiFeedback()` ומציג Praise + Focus Error + Hint.

### ✓ Phase 6 — דשבורד מורה — הושלם (חצי)
נבנה `teacher.html` עם 3 טאבים + שיוך כיתה (classId). **חסר:**
- `parent.html` — דשבורד הורה (טרם נבנה)
- שאלה פתוחה: איך הורה ניגש? קישור-שיתוף עם token, או role=parent עם linkedStudent?

### ✓ Phase 7 — תוכנית פדגוגית כ-HTML — הושלם
מייטל הזכירה ב-9.5.2026 שעשתה את זה בשיחה אחרת. ראה `curriculum/*.html` הקיימים.

### Phase 8 (הבא בתור) · אחת מהאופציות:
**א) דשבורד הורה (parent.html)**
- read-only view של תלמיד.ה מסוים.ת
- סיכום שבועי, התקדמות, רמת CEFR, מילים חדשות
- אופציה לאקסס: קישור-שיתוף עם token, או role נפרד

**ב) Unit 2 — School Life**
- 12 chunks חדשים (theme: school, lessons, teachers, classroom)
- 3 טקסטים A2, listening, grammar (Present Simple negatives/questions), writing
- להוסיף ל-sessionSequence ולתת אפשרות לתלמיד.ה לבחור יחידה

**ג) Mock Exam Mode**
- מצב מבחן ב-pace תנופה (75% reading, 25% listening, ללא AI feedback)
- ציון אוטומטי + נקודות לעבודה

**ד) שיוך תלמיד.ה לכיתה אחרי הרשמה**
- כפתור ב-student.html "הצטרפי לכיתה" → הזנת classCode → עדכון Sheet

---

## 7 · הוראת התחלה לשיחה חדשה

### צעד 1 · קריאת מסמכי בסיס

```
1. HANDOVER.md (זה) — קרא במלואו
2. spec.md (איפיון) — סקירה
3. pedagogy.md (בסיס פדגוגי) — סקירה
```

### צעד 2 · בדיקת מצב המערכת
```bash
# בדוק קבצים קיימים
ls docs/impact-so/tnufa/

# פתח בדפדפן
https://meytalp-dev.github.io/ort-training/impact-so/tnufa/
```

### צעד 3 · הקרקע התפעולית — לא לשכוח!

⚠ **לפני שדשבורד המורה והשיוך לכיתה יעבדו, יש פעולה ידנית שטרם בוצעה (נכון ל-11.5.2026):**

1. **לעדכן את ה-Apps Script Deployment** — מייטל צריכה להעתיק את `apps-script/code.gs` החדש (כולל classId + 3 endpoints) ל-Apps Script ולעשות "Deploy → New version".
2. **להוסיף עמודת `classId`** ידנית ל-Sheet "Users" (אחרי עמודת `token`).
3. **חשבון מורה קיים** לא יקבל classId אוטומטית — צריך להירשם מחדש או לערוך ידנית בשיט.

עד שזה לא קורה — `teacher.html` יציג "אין כיתה משויכת לחשבון" או יזרוק שגיאה.

### צעד 4 · המשך לפי הצורך
ראה סעיף 6 (Phase 8) — אופציות הבאות.

---

## 8 · נקודות פתוחות לסגירה

### החלטות שעוד לא נסגרו
1. **שם המוצר הסופי** — ImpactOS Tnufa English? משהו אחר?
2. **בית ספר פיילוט** — איזה? איך מגיעים?
3. **מורה לסקירה פדגוגית** — מי? בתשלום או התנדבות?
4. **תאריך השקה** — מתי הפיילוט מתחיל?
5. **גיוס הורים פרטיים** — איך?

### צעדים מנהלתיים שמיטל צריכה לעשות
- [ ] Privacy Policy + Terms (תבניות + עו"ד)
- [ ] רישום Domain (אם רוצה דומיין משלנו)
- [ ] חוזה עם בית ספר פיילוט
- [ ] גיוס הורים פרטיים

---

## 9 · קישורים מהירים

### תיעוד
- [המסגרת המאחדת](curriculum/index.md)
- [התוכנית הפדגוגית — אנגלית ט'](curriculum/english-grade9.md)
- [מילון מושגים](curriculum/glossary.md)

### קוד
- [דף נחיתה](index.html)
- [דשבורד תלמיד](student.html)
- [אבחון](diagnostic.html)
- [Apps Script](apps-script/code.gs)

### URL Production
- https://meytalp-dev.github.io/ort-training/impact-so/tnufa/

### Apps Script Backend
- API: https://script.google.com/macros/s/AKfycbx3myXebZIbXes6vK17K90R-rjh5FqAXHhXjsoVzwT7wNfcu_w6ZXBoDHB6pX9MFcj47w/exec

---

## 10 · אילו זיכרונות חשובים שיהיו רלוונטיים

מיטל פלג. מנהלת אורט בית הערבה (עוזבת בסוף תשפ"ז). בונה מותג Learni + ImpactOS לחיים אחרי. ImpactOS = מערכת הפעלה לבית הספר, B2B, לכלל בתי הספר.

**ImpactOS תנופה** הוא מוצר אחד בקו. אחר כך — תנופה עברית ד', תנופה אוריינות מידע, ועוד.

---

**זה הכל. המסמך הזה הוא הנכס היחיד שצריך לפתוח שיחה חדשה.**
