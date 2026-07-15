# בריף ל-Codex — ביקורת קוד · RTL · נגישות · עקביות Design System (רֶצֶף v3.0)

**מטרה:** איכות טכנית של קבצי HTML/CSS/JS ב-**גל A+B** (MVP מלא, 59 משימות). **לא** ביקורת קונספט (נבדק ב-GPT).
**מיקום:** `_drafts/emergency-learning/`
**סטאק:** וניל HTML/CSS/JS בלבד. טוקנים כ-CSS variables ב-`tokens.css`. ספריית רכיבים משותפת `components.css`. שכבת נגישות `a11y.css`/`a11y.js`. פונטים Heebo/Assistant. אייקונים inline SVG (Lucide/Tabler outline).

**ארכיטקטורה שחשוב לאמת:** המערכת בנויה על **שירותים משותפים** שהמסכים אמורים *לצרוך*, לא לשכפל:
`checkin-service.js` · `contact-log.js` · `seen-service.js` · `search-service.js` · `ai-boundary.js` · `system-mode.js` · `publish-service.js` · `favorites.js` · `library-filters.js` · `feature-flags.js`

---

## מה לבדוק (צ'קליסט)

### 1. RTL ועברית
`dir="rtl"` + `lang="he"` (✅ אומת נקי ב-49 קבצי HTML) · **בלי `flex-direction:row-reverse`** — properties לוגיים (`margin-inline-*`, `inset-inline-*`) · אין LTR bleed במספרים/אחוזים/תאריכים · פונטים עבריים נטענים בפועל.

### 2. נגישות (מובייל-first, לקויות למידה) — WCAG AA
- מגע ≥44px · `focus-visible` ברור · ניווט מקלדת מלא · `aria-label`/`aria-pressed`/`aria-current` · לא-רק-צבע (טקסט+אייקון) · `prefers-reduced-motion`.
- **🔴 ממצא ידוע לאימות:** טורקיז המותג `--brand #0B8F98` על לבן = **3.9:1** — נכשל AA לטקסט גוף רגיל (עובר רק לטקסט גדול/מודגש, או על `--brand-deep`). ראה `a11y-checklist.md`. בדוק שכל תווית כפתור ראשי ≥16px/700 או משתמשת ב-`--brand-deep`, ושצ'יפ-הדופק לא נשען על צבע בלבד לטקסט קטן.

### 3. תקינות טכנית
- תגיות מאוזנות; אין nesting שבור · אין `console.error` (למעט favicon 404 = רעש מקומי) · JS לא זורק על אף מצב מערכת (routine/remote/emergency) · SVG/אייקונים מאותחלים אחרי DOM.
- **קישורים:** רוב ה-`href`/`src` הפנימיים תקינים. לאמת 6 חשודים (ככל הנראה false-positive): `seen-flow.html→about:blank` (מכוון?), ו-`file-to-unit.html` → `worksheet`/`slides`/`link`/`text`/`curri` (כנראה מזהי-טאב ב-JS, לא קבצים — לוודא).

### 4. 🎯 עקביות Design System — הממצא המרכזי
- **צריכת `components.css`:** ודא שכל מסך *מקשר וצורך* את הספרייה המשותפת (Button/Card/StatusChip/ProgressBar/SequenceLine/MetricCard/ModeChip…) ולא משכפל סגנונות מקומית. סבב האחדה W0-D10 טיפל בחלק — ודא שאין שאריות.
- **צבעים קשיחים (טוקנים בלבד!) — 8 קבצים לתיקון** (QA מדד `#hex` ישיר):
  `roles.html` (73 — הכי גרוע) · **`teacher-flow.html` (26 — legacy, W0-D10 לא תיקן, צריך טוקניזציה עמוקה)** · `favorites.html` (23) · `library.html` (22) · `content-approval.html` (16) · `resource-page.html` (15) · `educator-pulse.html` (13) · `student-home.html` (10) · `ai-teacher.html` (11).
  *(לגיטימיים — לא לתקן: `logo.html`, `design-system.html`, `accessibility.html` — שם ה-hex הוא הדגמת פלטה/ניגודיות.)*

### 5. 🔒 אכיפת מינימיזציה בקוד (קווים אדומים — לאמת במימוש, לא בהצהרה)
- `checkin-service.js` — check-in **נמחק** אחרי התראה; אין רשומת `mood`/היסטוריה רגשית מתמשכת.
- `contact-log.js` — **שדות מובנים בלבד** (ערוץ/תוצאה/המשך); אין שדה טקסט חופשי.
- `ai-boundary.js` — **חוסם נתוני תלמיד** מלהישלח למודל; ודא ש-`ai-teacher.html` באמת עובר דרכו וש"מעטפה עם נתון תלמיד → המודל לא נקרא".
- מצרפיות ארצית — לא בסקופ הזה (קבצי `national-*` דחויים), אבל אם תיגע — אין נתיב drill לתלמיד בודד.
- `parent-weekly.html` — אין גישת הורה ל-check-in/יומן קשר; `guardian_phone` השדה היחיד.

---

## 🚫 מחוץ לסקופ — אל תבדוק
כל קובץ **דחוי**: `national-map.html` · `national-reports.html` · `national-roles.html` · `admin-users-schools.html` · `subject-analytics.html` · `gap-detection.html` · `course-catalog.html` · `course-integration.md` · `content-reports.html` · `learning-games.html` · `student-videos.html` · `content-sharing.html` · `ai-admin-insights.html` · `ai-redlines-admin.html` · `admin-roles-settings.html` · `admin-integrations.html` · `demo-lashon-3levels.html`.

---

## פורמט הפלט המבוקש
לכל ממצא: **קובץ:שורה · חומרה (חוסם/חשוב/ניקיון) · תיאור · תיקון קונקרטי.** דרג לפי חומרה. בעדיפות עליונה: הפרות RTL/נגישות/מינימיזציה; אחריהן עקביות ה-Design System (צריכת components.css + טוקניזציה).
