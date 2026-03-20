---
name: front-end-design
description: מערכת עיצוב WOW מלאה לכל HTML – מצגות, דשבורדים, דפי נחיתה, שאלונים, אינפוגרפיקות. הפעל תמיד כשיוצרים או משפרים HTML כלשהו. כולל: בחירת פונטים מובחנים, פלטות צבע, אנימציות, glassmorphism, themes, RTL עברית, נגישות, וכללי pre-delivery. Use when creating any HTML, improving existing design, user says "יפה יותר / wow / מרשים / שדרג עיצוב / תעצב", or building presentations, dashboards, landing pages, quizzes, or infographics.
---

# Design Intelligence – מערכת עיצוב WOW

**כלל ברזל: כל HTML שיוצא מפה חייב להיראות WOW – לא "AI slop".**

"AI slop" = Inter font + purple gradient + uniform rounded corners + scattered micro-interactions.
להפתיע. לבחור בכוונה. לבנות אווירה, לא רק ממשק.

---

## תהליך בכל יצירת HTML

### שלב 1 – הבן את הקונטקסט ושאל 4 שאלות

לפני כל שורת CSS, שאל את מייטל:

**1. מטרת השימוש – מה הפורמט?**

| פורמט | גודל / יחס | הערות |
|--------|------------|-------|
| אתר / דף נחיתה | responsive (desktop+mobile) | מבנה HTML רגיל |
| מצגת / שקפים | 16:9 (1920x1080) | ניווט חצים |
| פוסט פייסבוק | 1200x630 או 1080x1080 | תמונה סטטית / HTML לצילום מסך |
| סטורי / רילס | 9:16 (1080x1920) | אנכי |
| תמונה לוואטסאפ | 1080x1080 או חופשי | HTML לצילום מסך, פשוט וקריא |
| אינפוגרפיקה | דף אחד A4 (794x1123px) | להדפסה / שיתוף |
| כרטיס ביקור דיגיטלי | 1050x600 | ליד |

**2. סגנון – מודרני או warm?**

> "את רוצה סגנון מודרני-טכנולוגי (ORT/Tech) או סגנון warm-botanical (השראות שלך)?"

למייטל שני טעמים עיצוביים:
- **מודרני:** ORT teal, glassmorphism, SVG icons, gradient headers
- **Warm/Botanical:** רקע קרם, צבעי מים, פרחים, אווירת מחברת

→ פרטי הסגנון האישי: `references/meytal-style.md`

**3. לוגו – איזה לוגו להציג?**

| הקשר | לוגו | מיקום |
|-------|------|-------|
| **בית ספר** (מצגות, שאלונים, ספר ביה"ס) | לוגו אורט בית הערבה + לוגו משרד העבודה | header או footer |
| **הדרכות / לרני** (training, כלים דיגיטליים) | לוגו לרני | footer צף + כפתורי קישור |
| **שניהם** | שניהם | לפי הקשר |

כשזה **לרני** – להוסיף גם כפתורים מעוצבים:
- כפתור וואטסאפ (ירוק, עם אייקון SVG)
- כפתור פייסבוק (כחול, עם אייקון SVG)
- כפתור זום (כחול בהיר)

→ קישורים קבועים: ראה `memory/meytal-links.md`

**4. שאלות נוספות:**
- **מי המשתמש?** תלמיד, מורה, מנהל, הורה?
- **מה הוא צריך לעשות?** בתוך 30 שניות – האם ברור?
- **אווירה:** מקצועי? חינוכי? דרמטי? חגיגי?

### שלב 2 – בחר Theme

| Theme | מתאים ל |
|-------|---------|
| **ORT** (ברירת מחדל) | כל תוצר אורט – תכלת, טורקיז, ירוק |
| **Warm Botanical** | תוכן למורים, תכנון, ספר בי"ס, הזמנות |
| **Tech Dark** | דשבורדים, ניתוח נתונים |
| **Minimal Light** | מצגות מקצועיות, תוכן כבד |
| **Midnight Galaxy** | נושאים דרמטיים, היסטוריה |
| **Botanical** | חינוך, מדעים, טבע |
| **Warm Editorial** | כתיבה, שפה, ספרות |

לפרטי כל theme: `references/themes.md`
לסגנון האישי של מייטל: `references/meytal-style.md`

### שלב 3 – בחר טיפוגרפיה מספריית מייטל

**כלל ברזל: להשתמש בפונטים של מייטל! לא Inter/Roboto/Open Sans/Heebo לבד.**

ספריית הפונטים: `fonts/` (TTF files + Google Fonts)
דף תצוגה: `fonts/preview.html`
קבצים ב-GitHub Pages: `docs/fonts/`

**בחר שילוב לפי הקשר:**

| הקשר | כותרת | כותרת משנה | גוף |
|------|--------|------------|------|
| **Warm / הזמנות / מורים** | Playpen Sans Hebrew 700 | Cafe | Heebo 400 |
| **מצגת לימודית / שיעור** | Shuneet3 Square Bold | Petel Bold | Shuneet3 Medium |
| **דרמטי / היסטוריה / ספרות** | Antiochus Bold | Dybbuk | Heebo 400 |
| **טכני / דשבורד** | Heebo 800 | Heebo 400 | Heebo 300 |

פרטים מלאים: `references/typography.md`

### שלב 4 – בנה

- טען `references/ort-css-system.md` לקוד CSS הבסיסי
- טען פונטים מקומיים עם `@font-face` (src מ-`fonts/` או `../fonts/` לפי מיקום ה-HTML)
- ב-GitHub Pages: `src: url('/ort-training/fonts/Cafe.ttf')`
- הוסף אנימציות page-load מתוזמרות (staggered)
- רקע עם עומק – לא solid color
- RTL מלא לעברית

### שלב 5 – בדוק Pre-Delivery Checklist

לפני כל deliverable → `references/checklist.md`

### שלב 6 – פתח בדפדפן אוטומטית

לאחר יצירת/עדכון קובץ HTML, **תמיד פתח אותו אוטומטית בדפדפן** עם:
```bash
start "" "path/to/file.html"
```
אל תבקש מהמשתמשת לפתוח בעצמה – פשוט תפתח.

---

## כללי ליבה

### אנימציות – פחות זה יותר

- page-load אחד מתוזמר > מיקרו-אינטרקציות מפוזרות
- transitions: `150-300ms` בלבד
- GPU only: `transform`, `opacity` – **לא** `width/height/top/left`
- CSS native 2024: `animation-timeline: view()` לscroll-triggered
- `prefers-reduced-motion` תמיד

### צבעים – token architecture

```css
/* שכבה 1 – Primitive */
--blue-500: #2A9D8F;

/* שכבה 2 – Semantic */
--color-primary: var(--blue-500);

/* שכבה 3 – Component */
--button-bg: var(--color-primary);
```

OKLCH לצבעים עדינים: `oklch(0.7 0.15 180)`

### Layout – אסימטריה > סימטריה

- Bento grid > 3 עמודות שוות
- Whitespace נושם – לא לדחוס
- היררכיה: תמונה/אייקון → כותרת → טקסט → CTA
- max-width עקבי: `1200px` או `900px`

### RTL עברית

```css
html { direction: rtl; }
body { font-family: 'Heebo', 'Rubik', sans-serif; }
```

- tab order עוקב אחרי זרימה ויזואלית (ימין לשמאל)
- אנימציות: `slideInRight` → `slideInLeft` ב-RTL

### נגישות – לא אופציונלי

- contrast: 4.5:1 לטקסט רגיל, 3:1 לגדול
- `<button>` לכפתורים, לא `<div onClick>`
- `cursor: pointer` על כל אלמנט לחיץ
- focus-visible תמיד גלוי
- alt text לכל תמונה (ריק לדקורטיבי)
- touch targets ≥ 44px

### אייקונים

SVG inline גיאומטריים בלבד:
- `stroke-based`, `stroke-width: 1.5-2`, `stroke-linecap: round`
- `currentColor` למשתני CSS
- **אסור אימוג'י כאייקוני ממשק**

---

## Anti-Patterns – מה להימנע

→ ראה `references/anti-patterns.md`

**קיצור:**
- אסור: Inter/Roboto/Arial
- אסור: purple gradient על לבן
- אסור: uniform 8px rounded corners בכל מקום
- אסור: `transition: all`
- אסור: `box-shadow: 0 2px 4px` יחיד ושטוח
- אסור: אייקוני אימוג'י
- אסור: `font-family: "Inter, sans-serif"` ב-D3/charts

**שפה (בטקסטים בממשק):**
- אסור: "pivotal", "crucial", "seamless", "robust", "cutting-edge"
- אסור: "-ing phrases" ריקות: "ensuring reliability"
- לכתוב: קונקרטי, פשוט, פעיל

---

## References

| קובץ | תוכן |
|------|------|
| `references/ort-css-system.md` | כל ה-CSS המלא – glassmorphism, cards, buttons, animations |
| `references/typography.md` | בחירת פונטים, font pairings, weight contrast |
| `references/themes.md` | 10 themes עם hex + fonts |
| `references/checklist.md` | Pre-delivery checklist מלא |
| `references/anti-patterns.md` | AI slop + כללי כתיבה |
| `references/whatsapp-image-guide.md` | גדלים, פונטים מינימליים, ייצוא PNG לוואטסאפ |
