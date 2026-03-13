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
<title>{שם המצגת} – אורט בית הערבה</title>
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&family=Rubik:wght@400;500;600;700;800;900&family=Secular+One&display=swap" rel="stylesheet">
```

## CSS Variables

```css
:root {
  --bg:#F0F4F8;--bg-warm:#E8EDF2;--card:#ffffff;
  --primary:#2A9D8F;--primary-l:#D4F3EF;--primary-d:#1a7a6d;
  --secondary:#E76F7A;--sec-l:#FDE8EA;
  --blue:#4A90D9;--blue-l:#DBEAFE;
  --purple:#7E57C2;--purple-l:#EDE7F6;
  --green:#52B788;--green-l:#D8F3DC;
  --accent:#E9A319;--accent-l:#FEF3C7;
  --teal:#2A9D8F;--teal-l:#D4F3EF;--teal-d:#1a7a6d;
  --peach:#FDDDC5;--peach-d:#C96A2A;
  --dark:#1E293B;--gray:#64748B;--gray-l:#94A3B8;
  --border:rgba(0,0,0,.06);
  --shadow:0 2px 20px -4px rgba(0,0,0,.06);
  --shadow-md:0 8px 28px rgba(0,0,0,.07);
  --r:20px;--r-lg:24px;
}
```

## מערכת שקפים

- כל שקף הוא `<div class="slide">` בתוך `<div class="slide-container">`
- שקף פעיל: `class="slide active"`
- שקפים מוסתרים עם `opacity:0`, מוצגים עם `opacity:1`
- transition: `opacity .5s cubic-bezier(.4,0,.2,1), transform .5s`
- כל שקף `position:absolute` עם `padding:40px`

## אנימציות

```css
@keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
```

- `.anim` = fadeUp
- `.anim-si` = scaleIn
- `.anim-fi` = fadeIn
- `.anim-sr` / `.anim-sl` = slideRight / slideLeft
- `.d1` עד `.d8` = animation-delay (.1s עד .8s)
- אנימציות רק בשקף `.active`

## רכיבי CSS מוכנים

| Class | תיאור |
|-------|--------|
| `.card` | כרטיס לבן עם צל |
| `.icon-box` + `.ib-primary` | ריבוע אייקון צבעוני |
| `.step-item` + `.step-num` + `.step-content` | שלב ממוספר |
| `.bullet-list` | רשימת נקודות |
| `.tip` + `.tip-primary` / `.tip-green` / `.tip-peach` | טיפ צבעוני |
| `.feat-card` | כרטיס פיצ'ר |
| `.grid-2` / `.grid-3` / `.grid-4` | פריסת גריד |
| `.sec-div` | קו הפרדה עם נקודה |
| `.slide-image` | תמונה מעוצבת עם סיבוב, מסגרת, hover |
| `.image-caption` | כיתוב מתחת לתמונה |
| `.image-pair` | שתי תמונות זו לצד זו |

## ניווט

- סרגל ניווט קבוע למטה-שמאל עם כפתורי קודם/הבא
- מונה שקפים
- תמיכה במקלדת (חצים)
- תמיכה ב-touch/swipe
- Progress bar למעלה
- ניתן לגרירה (draggable)

## לוגו

```html
<div style="position:fixed;bottom:18px;right:20px;z-index:200;opacity:.45;pointer-events:none">
  <img src="../לוגו לרני עיגולים.png" alt="Lerani" style="height:32px;width:auto">
</div>
```

---

# מבנה פדגוגי חובה

## שקף 1 – כותרת
- שם הנושא בגדול
- אייקון מתאים
- תת-כותרת קצרה
- "במצגת נלמד:" + 3-4 נקודות
- תגית "הדרכה לצוות"

## שקף 2 – מה זה? (פתיחה)
- הסבר קצר ופשוט על הנושא
- למה זה חשוב / למה כדאי להשתמש

## שקפי הקנייה (גוף המצגת)
- **כל שקף = רעיון מרכזי אחד**
- עד 4 שורות טקסט בשקף
- משפטים קצרים ופשוטים
- דוגמאות מהחיים
- שימוש ב-step-items לשלבים
- שימוש ב-grid לרשימות
- שימוש ב-feat-card לפיצ'רים

## שאלות הבנה
- 1-3 שאלות אחרי כל הסבר מרכזי
- אפשר חידון אינטראקטיבי (quiz)

## שקף סיכום
- 3 רעיונות מרכזיים
- שאלה מסכמת

## שקף סקר (אופציונלי)
- סקר היכרות / מוכנות
- כפתורים לבחירה

---

# כללי שפה

- עברית פשוטה וברורה
- משפטים קצרים (עד 10 מילים)
- מילים פשוטות
- דוגמאות מהחיים
- **אסור**: שפה אקדמית, פסקאות ארוכות, הסברים מורכבים

---

# כללי עיצוב

- מעט טקסט – הרבה הבנה
- רעיון אחד לשקף
- פונט גדול וברור
- צבעי אורט: תכלת, טורקיז, ירוק בהיר, רקע לבן
- עיצוב מודרני ונקי
- ריווח גדול
- הדגשת מושגים חשובים
- לא ילדותי – מתאים לנוער בתיכון

---

# קהל יעד

תלמידי תיכון מקצועי (ט–יב) באורט בית הערבה.

מאפיינים:
- קשיי קשב וריכוז
- לקויות למידה
- רמות שונות
- צורך בחומר חזותי ופשוט

---

# שמות קבצים

- שם התיקייה באנגלית בלבד (לדוגמה: `google-forms`, `genially-course`)
- שמות תמונות באנגלית בלבד (לדוגמה: `dashboard.png`, `login.png`)
- **אסור שמות בעברית** – גורם לכשלון ב-GitHub Pages

---

# אחרי יצירת המצגת

1. שמור את הקובץ ב-`docs/presentations/{name}/index.html`
2. הוסף את המצגת לרשימת ההדרכות ב-`docs/index.html`
3. `git add` + `git commit` + `git push`
4. הצג למשתמש את הקישור למצגת החיה
