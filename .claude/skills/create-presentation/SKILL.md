---
name: create-presentation
description: יצירת מצגת לימודית HTML חדשה מנושא או מקובץ (PPTX/PDF/DOCX).
---

# Skill: צור מצגת – /create-presentation

כאשר המשתמש מבקש **ליצור מצגת חדשה** על נושא כלשהו, או מעלה קובץ (PPTX / PDF / DOCX / טקסט) ומבקש להפוך אותו למצגת – יש להפעיל את הסקיל הזה.

---

# קלט

המשתמש יספק אחד מאלה:
- נושא בטקסט חופשי (לדוגמה: "צור לי מצגת על גוגל פורמס")
- קובץ מצורף (PPTX, PDF, DOCX, טקסט)
- קישור לתוכן

---

# פלט

יש ליצור **קובץ HTML אחד** שמכיל מצגת מלאה ועובדת.

הקובץ נשמר ב: `docs/presentations/{שם-באנגלית}/index.html`

לאחר השמירה:
1. git add
2. git commit
3. git push

הקישור למצגת: `https://meytalp-dev.github.io/ort-training/presentations/{שם}/index.html`

---

# מבנה טכני של קובץ ה-HTML

## Head

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{שם המצגת} – Learni</title>
<link href="https://fonts.googleapis.com/css2?family=Playpen+Sans+Hebrew:wght@400;700&family=Heebo:wght@300;400;500;600;700;800;900&family=Karantina:wght@400;700&family=Rubik:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
```

## CSS Variables

```css
:root {
  --bg:#FAF8F5;--bg-warm:#F0FAF7;--card:#ffffff;
  --primary:#2A9D8F;--primary-l:#D4F3EF;--primary-d:#1a7a6d;
  --secondary:#E76F7A;--sec-l:#FDE8EA;
  --blue:#4A90D9;--blue-l:#DBEAFE;
  --purple:#7E57C2;--purple-l:#EDE7F6;
  --green:#52B788;--green-l:#D8F3DC;
  --accent:#E9A319;--accent-l:#FEF3C7;
  --teal:#2A9D8F;--teal-l:#D4F3EF;--teal-d:#1a7a6d;
  --orange:#E8784D;--orange-l:#FEE8DE;
  --peach:#FDDDC5;--peach-d:#C96A2A;
  --lerani-blue:#7babd4;--lerani-green:#5abf92;--lavender:#9b7ed8;
  --dark:#1E293B;--gray:#64748B;--gray-l:#6B7D8F;
  --text:#2D3436;--text-mid:#4A5568;--text-muted:#6B7D8F;
  --border:rgba(0,0,0,.06);
  --shadow:0 2px 20px -4px rgba(0,0,0,.06);
  --shadow-md:0 8px 28px rgba(0,0,0,.07);
  --shadow-lg:0 12px 40px rgba(0,0,0,.08);
  --r:20px;--r-lg:28px;
}
```

## רקע גרדיאנט

כל שקף ברקע גרדיאנט קרם→מנטה (לא צבע אחיד):
```css
.slide { background: linear-gradient(160deg, #FAF8F5 0%, #F0FAF7 40%, #F5F9F7 100%); }
```

## מערכת שקפים

- כל שקף הוא `<div class="slide">` בתוך `<div class="slide-container">`
- שקף פעיל: `class="slide active"`
- שקפים מוסתרים עם `opacity:0`, מוצגים עם `opacity:1`
- transition: `opacity .5s cubic-bezier(.4,0,.2,1), transform .5s`
- כל שקף `position:absolute` עם `padding:40px`
- glassmorphism על כרטיסי תוכן: `backdrop-filter:blur(16px); background:rgba(255,255,255,.88)`

## אנימציות בסיסיות

```css
@keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeInUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
@keyframes bounceIn{0%{opacity:0;transform:scale(.3)}50%{opacity:1;transform:scale(1.05)}70%{transform:scale(.95)}100%{transform:scale(1)}}
@keyframes slideInRight{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideInLeft{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes glowPulse{0%,100%{box-shadow:0 0 5px rgba(42,157,143,.2)}50%{box-shadow:0 0 25px rgba(42,157,143,.35)}}
```

- staggered entry: `.slide.active :nth-child(N) { animation-delay: N*0.05s }`
- אנימציות רק בשקף `.active`

## אנימציות WOW

- **Shimmer gradient** על כותרת ראשית — טקסט עם background-clip
- **Bounce + glow** על עיגולי מפריד
- **SlideInRight/Left** על עמודות השוואה
- **BounceIn** על מספרי שלבים
- **Hover zoom** על צילומי מסך
- **Card shimmer sweep** — פס אור שעובר על כרטיס ב-hover
- **Progress pulse** — נקודה זוהרת בקצה ה-progress bar

## רכיבי CSS מוכנים

| Class | תיאור |
|-------|--------|
| `.slide-inner` | כרטיס תוכן ראשי עם glassmorphism, **חובה `min-height: 420px`** לגובה אחיד בין שקפים |
| `.g-card` | כרטיס לבן עם צל + shimmer hover + top gradient line |
| `.step-card` + `.step-number` | שלב ממוספר עם bounceIn |
| `.tip-box` + `.tip-box.warning/.green/.orange/.purple/.rose` | טיפ צבעוני |
| `.compare-wrap` + `.compare-cols` + `.compare-col.bad/.good` | השוואת עמודות |
| `.grid-2` / `.grid-3` | פריסת גריד |
| `.screenshot-frame` + `.screenshot-frame.small/.medium` | מסגרת תמונה עם hover zoom |
| `.chat-demo` + `.chat-bubble.user/.ai` | דמו צ'אט |
| `.highlight` + `.highlight.green/.orange/.purple/.rose` | הדגשת מילה בצבע |
| `.brand-word` | מילה מודגשת בכתב יד (Playpen Sans Hebrew) + קו תחתון בצבע הכלי |
| `.big-quote` + `.accent` | ציטוט גדול |
| `.divider-slide` + `.divider-circle` + `.divider-title` | שקף מפריד |
| `.section-header` + `.section-icon` + `.section-title` | כותרת סעיף |
| `.flow-container` + `.flow-col` + `.flow-step` + `.flow-num` | תרשים זרימה |

## רכיבים אינטראקטיביים

### Before/After Slider
```html
<div class="ba-slider">
  <img src="before.png" class="ba-before">
  <img src="after.png" class="ba-after">
  <div class="ba-handle"></div>
  <div class="ba-label before">לפני</div>
  <div class="ba-label after">אחרי</div>
</div>
```
גרירה אינטראקטיבית להשוואת לפני/אחרי. JS נדרש.

### Typing Animation (בועות צ'אט)
```html
<div class="typing-dots"><span></span><span></span><span></span></div>
```
3 נקודות שקופצות לפני תגובת AI — מוסיף תחושת חיים.

### Copy Prompt (העתקה בלחיצה)
```html
<div class="copy-prompt" onclick="copyPrompt(this)">
  <div class="copy-btn">...</div>
  <span class="prompt-text">טקסט הפרומפט</span>
</div>
<div class="copy-toast" id="copyToast">הפרומפט הועתק!</div>
```
לחיצה → copy ללוח + אנימציית וי ירוק + toast.

### Keyboard Hints
```html
<div class="kb-hint"><kbd>&larr;</kbd> <kbd>&rarr;</kbd> לניווט</div>
```
נעלם אחרי הלחיצה הראשונה.

## ניווט

- סרגל ניווט קבוע למטה עם כפתורי קודם/הבא (44px touch targets)
- מונה שקפים
- תמיכה במקלדת (חצים, RTL-aware)
- תמיכה ב-touch/swipe
- Progress bar למעלה עם נקודה זוהרת (pulse)
- ניתן לגרירה (draggable)
- Navigation glow pulse

## לוגו

```html
<div style="position:fixed;bottom:18px;right:20px;z-index:200;opacity:.45;pointer-events:none">
  <img src="../לוגו לרני עיגולים.png" alt="Learni" style="height:32px;width:auto">
</div>
```

---

# מבנה פדגוגי חובה — מצגת הדרכה על כלי

## שקף 1 — כותרת עם Hook
- **לוגו הכלי מעל הכותרת** — SVG/PNG מדף הלוגואים (`docs/marketing/ai-tools.html`). אם צריך ליצור לוגו — להשתמש בסקיל `/pomelli`
- שם הכלי בגדול עם `.brand-word`
- **תת-כותרת מסקרנת** — לא תיאור יבש, אלא hook: "איך עיצבתי X ב-Y דקות — בלי Z"
- Badge: "Learni | הדרכה של 5 דקות שתשנה לכם את העבודה"
- 4 נושאים בתצוגה מקדימה (topic-items)

## שקף 2 — מה זה? (עם Pain Point)
- **תת-כותרת שמתחברת לכאב:** "צריכים X, אין Y, אין Z? [כלי] פותר את זה."
- 3 כרטיסים: מה הכלי עושה, מה מיוחד בו, כמה עולה
- צילום מסך של הכלי
- tip-box עם סטטוס (בטא/חינם/בתשלום)

## שקף 3 — איך נכנסים?
- 3 שלבים פשוטים (step-cards)
- צילומי מסך של מסך הכניסה

## שקפי "איך עובדים" (4-6 שקפים)
- **שקף לכל שלב בתהליך** — עם צילום מסך + הסבר
- שקף טיפים לפרומפט/שימוש — **כולל 3 פרומפטים/דוגמאות מוכנות להעתקה** (copy-prompt)
- tip-box עם אזהרות חשובות (גופנים עבריים, RTL, מגבלות)

## שקף השוואה — [כלי] מול Canva / כלי מוכר
- compare-cols עם השוואה ברורה
- **מסר: "כלים משלימים, לא מתחרים"**
- 5 תרחישי שימוש ספציפיים מעולם החינוך (highlights)

## שקף יתרונות + מגבלות
- יתרונות ב-grid כרטיסים (4-6)
- מגבלות vs פתרונות (compare-cols bad/good)
- שפה פשוטה — בלי מונחים טכניים כמו production-ready, MCP

## סקשן מתקדמים — חיבור עם Claude Code (2-3 שקפים, לפני הסיכום)

### שקף 1 — חיבור עם Claude Code
- **כותרת:** "חיבור עם Claude Code"
- **שורה קטנה מתחת לכותרת:** "לא מכירים את Claude Code? [לחצו כאן להדרכה המלאה →]" → קישור ל-`docs/training/claude-code/intro.html`
- תרשים זרימה (flow-container) — 3 שלבים:
  1. אתם מכינים תוכן בכלי
  2. Claude Code לוקח את התוצר ובונה ממנו מצגת/דף/אינפוגרפיקה
  3. אתם בודקים ומבקשים שינויים בעברית פשוטה
- tip-box: "תוכן קודם, עיצוב אחר כך"

### שקף 2 — מה Claude Code יכול לעשות עם [שם הכלי]
- 3-4 כרטיסים עם דוגמאות ספציפיות לכלי (משתנה לפי ההדרכה)
- copy-prompt עם פרומפט לדוגמה שמתאים לכלי
- שפה פשוטה — בלי "MCP", "pipeline", "API"
- Before/After Slider אם יש דוגמה טובה

### שקף 3 — רוצים להמשיך?
- כפתור: **"רוצים ללמוד על Claude Code?"** → `docs/training/claude-code/intro.html`
- כפתור: **"רוצים להתחיל להשתמש?"** → `https://meytalp-dev.github.io/ort-training/training/claude-code/landing-page.html`

## שקף סיכום
- 3 כרטיסים גדולים עם brand-word
- tip-box ירוק עם מסר מסכם

## שקף CTA — אתגר
- **2 שלבים בלבד** (לא 4 — יותר מדי = משתק)
- **אתגר 5 דקות** עם תמריץ: "צלמו מסך ושלחו — תקבלו פידבק אישי"
- ציטוט סיום (big-quote)
- Learni branding

---

# כללי שפה

- עברית פשוטה וברורה
- משפטים קצרים (עד 10 מילים)
- מילים פשוטות — **לא מונחים טכניים בלי הסבר**
- דוגמאות מעולם החינוך הישראלי (בגרות, יום פתוח, חוברת להורים)
- **אסור**: שפה אקדמית, פסקאות ארוכות, הסברים מורכבים
- **מונחים טכניים** שחייבים — להוסיף הסבר בסוגריים בפעם הראשונה

---

# כללי עיצוב

- מעט טקסט — הרבה הבנה
- רעיון אחד לשקף
- פונט מינימום 14px (לא 13px!)
- **רקע גרדיאנט קרם→מנטה** — לא צבע אחיד, לא סגול, לא כהה
- **צבעים מבוססי לוגו לרני:** תכלת (#7babd4), ירוק (#5abf92), לבנדר (#9b7ed8)
- **לוגו הכלי מעל הכותרת** — בשקף הכותרת, לוגו הכלי (SVG/PNG) מוצג מעל הכותרת הראשית. מקור לוגואים: `docs/marketing/ai-tools.html` (דף הלוגואים)
- **כותרות עם מילה מודגשת:** מילה אחת בגופן כתב יד **Playpen Sans Hebrew** בצבע טורקיז/תכלת, עם קו תחתון (underline) בצבע הכלי (לדוגמה: כתום ל-Claude Code, סגול ל-Gemini). אם אין צבע מזוהה לכלי — סגול (#7E57C2) כברירת מחדל
- **צבעי מצגת מבוססי הכלי** — פלטת הצבעים של כל מצגת הדרכה מותאמת לכלי שעליו ההדרכה (לא רק צבעי לרני). מקור צבעים: דף הלוגואים `docs/marketing/ai-tools.html`. הצבעים משפיעים על: כותרות, borders, tip-boxes, step-numbers, progress bar, accents
- גופנים: Heebo (גוף) + Karantina (כותרות) + **Playpen Sans Hebrew** (מילה מודגשת בכתב יד)
- glassmorphism על כרטיסי תוכן
- SVG icons בלבד — בלי אימוג'ים
- ניגודיות WCAG AA — text-muted לפחות #6B7D8F על רקע בהיר
- כפתורי ניווט 44px minimum (touch target)
- **תוכן שממלא את השקף** — `.slide-inner` חייב למלא את רוב שטח השקף (min-height: 80vh או padding מינימלי). אסור שהכרטיס יהיה קטן באמצע עם הרבה רווח לבן מסביב. כרטיסי תוכן, grid, flow — הכל צריך לנצל את המקום. אם התוכן קצר — להגדיל פונטים, padding, או gap — לא להשאיר שקף חצי ריק
- **אנימציות מגוונות בין מצגות** — לא להשתמש באותן אנימציות בכל מצגת הדרכה. לגוון: fadeUp במצגת אחת, slideInRight באחרת, scaleIn בשלישית וכו'. לבחור 2-3 אנימציות עיקריות לכל מצגת ולהתמיד בהן לאורך אותה מצגת (עקביות פנימית, גיוון בין מצגות)
- ריווח גדול
- לא ילדותי

---

# תרשימים ויזואליים — מחולל אינפוגרפיקה

בכל מצגת הדרכה, להשתמש ב**מחולל האינפוגרפיקה** (`docs/infographic-builder/index.html`) ליצירת תרשימים ויזואליים ולהטמיע אותם במצגת.

**סוגי תרשימים לפי תוכן:**
- **תרשים זרימה** — לשלבי עבודה (איך נכנסים, איך עובדים, Flow עם Claude Code)
- **השוואה** — לשקף כלי מול כלי
- **רשימה ויזואלית** — ליתרונות/מגבלות
- **תהליך** — לסקשן מתקדמים (Claude Code + הכלי)

**כללים:**
- הצבעים של התרשים מותאמים לפלטת הצבעים של הכלי (אותה פלטה שמוגדרת למצגת)
- התרשים מיוצא כ-PNG ומוטמע בשקף הרלוונטי
- לא חייב בכל שקף — רק איפה שתרשים מוסיף ערך על פני טקסט
- לבחור את סוג התרשים המתאים ביותר לתוכן

---

# אלמנטי WOW חובה

כל מצגת הדרכה חייבת לכלול לפחות 4 מתוך אלה:

1. **Brand-word** — מילה בכתב יד (Playpen Sans Hebrew) בכותרות, צבע טורקיז/תכלת, עם קו תחתון בצבע הכלי (סגול כברירת מחדל)
2. **Before/After Slider** — אם יש השוואה לפני/אחרי
3. **Typing Animation** — בשקף צ'אט/דמו
4. **Copy Prompt** — פרומפטים מוכנים להעתקה בלחיצה
5. **Compare Columns slideIn** — עמודות השוואה שנכנסות מהצדדים
6. **Progress Pulse** — נקודה זוהרת ב-progress bar
7. **KB Hints** — הנחיית מקלדת שנעלמת אחרי הלחיצה הראשונה
8. **Shimmer gradient** — על כותרת ראשית
9. **Screenshot hover zoom** — תמונות שמתקרבות ב-hover

---

# קהל יעד

תלוי בהקשר:
- **הדרכות Learni** (פייסבוק/כללי) — מורים, מדריכים, רכזי טכנולוגיה. שפה מקצועית-נגישה.
- **מצגות אורט** (בית ספר) — תלמידי תיכון מקצועי (ט–יב). שפה פשוטה במיוחד.

---

# שמות קבצים

- שם התיקייה באנגלית בלבד (לדוגמה: `google-stitch`, `pomelli-training`)
- שמות תמונות באנגלית בלבד (לדוגמה: `dashboard.png`, `login.png`)
- **אסור שמות בעברית** — גורם לכשלון ב-GitHub Pages

---

# שקף סיום — קישורים חובה

בשקף הסיום / CTA של כל מצגת הדרכה חייבים להופיע:

1. **קישור לקבוצת וואטסאפ:** `https://chat.whatsapp.com/HhAL8L2I2jCH1CW1Iehr4J` — כפתור ירוק "הצטרפו לקבוצת הוואטסאפ"
2. **קישור לדף לרני:** `https://meytalp-dev.github.io/ort-training/training/claude-code/landing-page.html` — כפתור "לפרטים נוספים"
3. **מייל:** `meytalp@bethaarava.ort.org.il` — כפתור או טקסט "שאלות? כתבו לי"
4. **שאלות אינטראקטיביות** — לפחות 2-3 שאלות הבנה/סיכום במהלך המצגת (לא רק בסוף). אפשר: אמריקאיות, גרירה, פתוחות, או "נכון/לא נכון"

---

# בדיקת איכות (QA) — חובה אחרי כל מצגת הדרכה

אחרי סיום בניית מצגת הדרכה, לרוץ על הצ'קליסט הזה:

### 1. כללי הסקיל
- [ ] מבנה פדגוגי שלם (כותרת → מה זה → איך נכנסים → איך עובדים → השוואה → יתרונות/מגבלות → סיכום → CTA)
- [ ] לפחות 4 אלמנטי WOW מהרשימה
- [ ] שאלות אינטראקטיביות (לפחות 2-3)

### 2. לוגו וכתב יד
- [ ] **לוגו לרני** מופיע (fixed, bottom-right)
- [ ] **לוגו הכלי** מופיע מעל הכותרת בשקף 1
- [ ] **מילה מודגשת** בכותרות — גופן Playpen Sans Hebrew, צבע טורקיז/תכלת, קו תחתון בצבע הכלי

### 3. צבעים
- [ ] פלטת צבעים מותאמת לכלי (לא רק צבעי לרני)
- [ ] רקע גרדיאנט קרם→מנטה (לא כהה!)
- [ ] ניגודיות WCAG AA

### 4. קישורים ותמונות
- [ ] כל הקישורים הפנימיים (href, src) עובדים
- [ ] קישורים חיצוניים (https://) נגישים
- [ ] **תמונות לא חתוכות** — object-fit: contain או cover נכון, בדיקת overflow
- [ ] צילומי מסך בגודל נכון (לא מוקטנים מדי)

### 5. שקף סיום
- [ ] קישור וואטסאפ קבוצתי — עובד
- [ ] קישור דף לרני — עובד
- [ ] מייל `meytalp@bethaarava.ort.org.il` — עובד
- [ ] אתגר 5 דקות / CTA ברור

### 6. טכני
- [ ] `dir="rtl"` + `lang="he"`
- [ ] Google Fonts כולל Playpen Sans Hebrew
- [ ] ניווט מקלדת + touch/swipe עובד
- [ ] SVG icons בלבד (בלי אימוג'ים)
- [ ] **תוכן ממלא את השקף** — אין שקפים עם כרטיס קטן באמצע והרבה רווח לבן
- [ ] **אנימציות שונות** ממצגות הדרכה קודמות (לבדוק מול `docs/training/*/`)

---

# מקורות לוגואים וצבעים

- **דף לוגואים:** `docs/marketing/ai-tools.html` — כל הלוגואים של הכלים + צבעי המותג שלהם
- **יצירת לוגו חדש:** סקיל `/pomelli` — ליצירת לוגו בסגנון product photography אם הכלי לא קיים בדף הלוגואים
- **כלל צבעים:** בכל מצגת הדרכה, לקחת את צבעי הכלי מדף הלוגואים ולהשתמש בהם כ-primary/accent. הצבעים משפיעים על: כותרות, קו תחתון ב-brand-word, tip-boxes, step-numbers, progress bar, accents, borders

---

# כללים שנלמדו מייצור מצגות (מעודכן 30.3.2026)

## תוכן ודוגמאות
- **דוגמאות מחינוך כללי בלבד** — עברית, היסטוריה, אזרחות, תנ"ך, מתמטיקה. לא עיצוב שיער, מספרה, או מקצועות ספציפיים. ההדרכות מיועדות לחינוך הכללי
- **מונחים טכניים** — בפעם הראשונה תמיד בסוגריים: "פרומפט (ההוראה שכותבים)", "טרמינל (חלון פקודות)". לא להניח שהקהל מכיר
- **דיוק עובדתי** — לבדוק מחירים, תוכניות חינמיות, והשוואות מול מתחרים. לא לכתוב "תוכנית חינמית" אם אין כזו
- **השוואות הוגנות** — לא לפשט יתר על המידה מתחרים. ChatGPT יש לו גם Artifacts ו-Code Interpreter — ההבדל הוא בעבודה ישירה על קבצים
- **תוכן מ-3 המצגות הקיימות** — כשבונים מצגת הכרות עם Claude Code, לשלב תוכן מ-Session 1 (טבלת זמנים, ככה לא/ככה כן), Session 2 (Skills), Session 3 (אינטגרציות)

## עיצוב ומבנה
- **גובה אחיד לשקפים** — `min-height: 480px` + `justify-content: center` על `.slide-inner`. במובייל: `min-height: auto`
- **תמונות בהירות בלבד** — לא צילומי מסך כהים (VS Code dark mode). אם אין תמונה בהירה — לא לשים תמונה בכלל
- **תרשימי זרימה בתוך שקפים** — להשתמש ב-CSS class `.v-flow` (אנכי) במקום תמונות חיצוניות. כל שלב עם צבע שונה ואנימציית כניסה
- **קרוסלת תוצרים עם lightbox** — לחיצה על כרטיס פותחת תמונה גדולה. חובה כשמציגים צילומי מסך קטנים
- **יתרונות/מגבלות כגריד** — כרטיסים 2x2, כל כרטיס מציג מגבלה (אדום) + פתרון (ירוק) ביחד. לא עמודות compare נפרדות
- **שקף "איך משתפים"** — בכל מצגת הדרכה על Claude Code, להסביר שהתוצר הוא HTML ושצריך לפרסם ב-GitHub Pages כדי לשתף

## ניווט ואינטראקטיביות
- **אין auto-advance** — מעברים רק עם ניווט (חצים, כפתורים, swipe)
- **אין kb-hint (פס שחור)** — מבלבל ומפריע. להסיר לגמרי
- **קישורים חיצוניים ב-target="_blank"** — מדריך התקנה, סרטון, דף נחיתה — תמיד נפתחים בטאב חדש
- **שאלות אינטראקטיביות** — רק אם הן ברמה גבוהה מספיק. שאלות בייסיקיות עדיף לא לשים בכלל

## CSS טכני
- **brand-word**: `font-size: 1.5em` (לא 1.3em), `font-family: 'Playpen Sans Hebrew'`, `color: var(--teal)`, underline בצבע הכלי
- **פונטים מינימום 14px** — גם ב-topic-item, copy-prompt, kb-hint. לא 13px
- **touch targets מינימום 44px** — כולל copy-btn (לא 32px)
- **quiz buttons** — `<button>` ולא `<div>`, עם `aria-live="polite"` על feedback
- **overflow-x: hidden** על body

## הנגשה לקהל מורים מתחילים (מביקורת פומלי 30.3.2026)
- **פרומפטים באנגלית — תמיד עם תרגום עברי:** שורת `בעברית: ...` מתחת לכל פרומפט. `direction:rtl; font-size:12px; border-top:1px dashed`
- **Claude Code חייב הסבר + חלופה:** 2-3 משפטים "מה זה?" + "אין לכם? אפשר גם ב-Canva/PowerPoint"
- **URL-ים קליקביליים:** כל URL חייב `<a href target="_blank">`, לא טקסט בלבד
- **הגבלות גיאוגרפיות:** tip-box warning עם הסבר VPN אם הכלי לא זמין מישראל
- **כפתור copy גלוי במובייל:** `@media (max-width:768px) { .copy-btn { opacity:.7 } }`
- **Clipboard עם catch:** `navigator.clipboard.writeText(text).catch(() => {})`
- **Contrast:** `--text-muted: #5A6B7D` (לא #6B7D8F — נכשל WCAG AA)
- **typing-dots במובייל:** `margin-right: 20px` ב-media query
- **גלריות מקסימום 2 ברצף:** לא 3 שקפי תמונות ברצף. ביניהם שקף אינטראקטיבי
- **תוצרים אמיתיים:** שקף "מה פרסמנו בפועל" עם תמונות שפורסמו — ממיר הכי טוב
- **URL רשמי:** Google Labs = `labs.google.com/...`, לא דומיין עצמאי

---

# Reference — מצגות לדוגמה

- `docs/training/stitch/presentation.html` — מצגת הדרכה מלאה עם כל האלמנטים (brand-word, BA slider, copy prompt, typing animation, compare columns, flow chart, screenshots, CTA challenge)
- `docs/training/pomelli/presentation.html` — מצגת עם ברנדינג ורוד, תרגום פרומפטים, הסבר Claude Code + חלופה, VPN note, תוצרים אמיתיים
- `docs/training/claude-code/intro.html` — מצגת הכרות 14 שקפים עם תרשימי זרימה, קרוסלת תוצרים עם lightbox, יתרונות/מגבלות כגריד, שקף "איך משתפים"
