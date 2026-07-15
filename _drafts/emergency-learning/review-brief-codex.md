# בריף ל-Codex — ביקורת קוד + נגישות + RTL

**מטרת הבדיקה:** בדיקת איכות טכנית של קבצי HTML/CSS/JS במערכת. לא ביקורת קונספט (זה נבדק בנפרד ב-GPT).

**מיקום בריפו:** `_drafts/emergency-learning/` — ריפו `meytalp-dev/ort-training`, ענף `main`.
**סטאק:** וניל HTML/CSS/JS בלבד (בלי React/build). טוקנים כתובים כ-CSS variables. אייקונים: Lucide (CDN). פונטים: Rubik + Heebo.

---

## קבצי ה-HTML לבדיקה (7 דמואים + 3 מסמכי מערכת)

**דמואים:** `student-home.html` · `mission-demo.html` · `educator-pulse.html` · `teacher-flow.html` · `principal-pulse.html` · `national-map.html` · `demo-unit-hebrew.html`
**מערכת:** `design-system.html` · `spec.html` · `management.html` · `roles.html` · `decisions.html`
**לוגיקה משותפת:** `state.js`

---

## מה לבדוק (צ'קליסט)

### 1. RTL ועברית (קריטי — כל הקבצים)
- `dir="rtl"` ו-`lang="he"` על `<html>`.
- **בלי `flex-direction: row-reverse`** — להשתמש ב-properties לוגיים (`margin-inline-start` וכו') או בסדר טבעי של RTL.
- אין טקסט/מספרים שנשברים לכיוון הפוך (LTR bleed) — טלפונים, אחוזים, תאריכים.
- פונטים עבריים נטענים בפועל, בלי fallback ל-serif.

### 2. נגישות (מובייל-first, קהל עם לקויות למידה)
- ניגודיות צבע ≥ AA על כל טקסט.
- יעדי מגע ≥ 44px (המשתמשים על מובייל).
- `alt` לתמונות, `aria-label` לכפתורי אייקון בלבד.
- ניווט מקלדת + focus states נראים.
- גודל פונט בסיס ולא קטן מדי.

### 3. תקינות טכנית
- תגיות HTML פתוחות/סגורות תקין, בלי nesting שבור.
- CSS/JS בלי שגיאות תחביר; אין `console.error`.
- כל `href`/`src` פנימי מצביע על קובץ קיים בתיקייה (אין קישורים שבורים).
- Lucide מאותחל אחרי טעינת ה-DOM.

### 4. עקביות מול מערכת העיצוב
- כל ה-HTML צורך את אותם CSS variables מ-`design-system.html` — אין צבעים/רווחים hardcoded שסוטים מהטוקנים.
- רשת 8pt נשמרת.

### 5. רספונסיביות
- כל דף עובד ב-360px רוחב בלי גלילה אופקית.
- אין רוחב קבוע ב-px שמשבור מובייל.

---

## קישורי מקור (raw) לקריאת קוד

בסיס: `https://raw.githubusercontent.com/meytalp-dev/ort-training/main/_drafts/emergency-learning/<FILE>`
לדפדוף בממשק: `https://github.com/meytalp-dev/ort-training/tree/main/_drafts/emergency-learning`

**פורמט הפלט שאני רוצה:** רשימת ממצאים לפי חומרה (🔴 חוסם / 🟡 לתקן / 🟢 שיפור), כל ממצא עם `קובץ:שורה` והמלצת תיקון קונקרטית. ריכוז מיוחד ב-RTL ובמובייל — שם ציון < 8 חוסם.
