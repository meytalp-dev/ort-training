# בריף ל-Codex — ביקורת קוד + נגישות + RTL (גרסה 1.3)

**מטרת הבדיקה:** איכות טכנית של קבצי HTML/CSS/JS. לא ביקורת קונספט (נבדק ב-GPT).

**מיקום:** `_drafts/emergency-learning/` — ריפו `meytalp-dev/ort-training`, ענף `main`.
**סטאק:** וניל HTML/CSS/JS בלבד. טוקנים כ-CSS variables. אייקונים Lucide (inline SVG). פונטים Rubik/Heebo + Playpen/Assistant.

**⚠️ עודכן ב-15.7 (v1.3 — הסטת מרכז כובד ללמידה).** נוסף קוד JS משמעותי בקבצים הבאים — תן להם דגש:
- **student-home.html** — `renderPath()` (מסלול למידה, beads), בורר רמת תמיכה, `renderTasks` עם seq, הסתרת בורר בחירום.
- **teacher-flow.html** — `renderDecision()` (פאנל דופק הלמידה: פסי פילוג + המלצה + כפתור פעולה), שדה `learn` ב-BOARD.
- **principal-pulse.html** — `renderLearning()` (סקשן דופק למידה: big + stall/help lists), מיספור סקשנים 1–6.

---

## קבצי ה-HTML לבדיקה

**דמואים:** `student-home.html` · `mission-demo.html` · `educator-pulse.html` · `teacher-flow.html` · `principal-pulse.html` · `demo-unit-hebrew.html`
**מערכת:** `design-system.html` · `spec.html` · `management.html` · `roles.html` · `decisions.html`

---

## מה לבדוק (צ'קליסט)

### 1. RTL ועברית (קריטי — כל הקבצים)
- `dir="rtl"` ו-`lang="he"` על `<html>`.
- **בלי `flex-direction: row-reverse`** — properties לוגיים (`margin-inline-start`, `inset-inline-*`).
- אין LTR bleed במספרים/אחוזים/תאריכים. שים לב במיוחד ל**מסלול הלמידה** (beads ב-student-home) ול**פסי הפילוג** (teacher-flow) — שהסדר והכיוון נכונים ב-RTL.
- פונטים עבריים נטענים בפועל.

### 2. נגישות (מובייל-first, לקויות למידה)
- ניגודיות ≥ AA. יעדי מגע ≥ 44px (בורר רמת התמיכה + כפתור ההמלצה החדשים).
- `aria-pressed` על הבוררים (רמת תמיכה, מצב, לשוניות) — לוודא שמתעדכן.
- `aria-label` לכפתורי אייקון. ניווט מקלדת + focus-visible.

### 3. תקינות טכנית
- תגיות מאוזנות; אין nesting שבור (בדוק את ההוספות ל-student-home/teacher-flow/principal).
- אין `console.error` (למעט favicon 404 שהוא רעש מקומי).
- כל `href`/`src` פנימי קיים. JS: `renderPath`/`renderDecision`/`renderLearning` לא זורקים על אף מצב (routine/remote/emergency).
- Lucide/SVG מאותחלים אחרי DOM.

### 4. עקביות מול מערכת העיצוב
- הרכיבים החדשים (מסלול, בורר, פאנל החלטה, דופק למידה) צורכים את אותם CSS variables — אין צבעים hardcoded שסוטים מהטוקנים.
- רשת 8pt נשמרת.

### 5. רספונסיביות
- כל דף עובד ב-360px בלי גלילה אופקית. שים לב ל-`.learn-cols` (2 עמודות שקורסות ל-1) ול-`.path-track` (6 beads בשורה צרה).

---

## קישורי מקור

בסיס raw: `https://raw.githubusercontent.com/meytalp-dev/ort-training/main/_drafts/emergency-learning/<FILE>`
דפדוף: `https://github.com/meytalp-dev/ort-training/tree/main/_drafts/emergency-learning`

**פלט:** ממצאים לפי חומרה (🔴 חוסם / 🟡 לתקן / 🟢 שיפור), כל אחד עם `קובץ:שורה` + תיקון. סף <8 ב-RTL ובמובייל = חוסם.
