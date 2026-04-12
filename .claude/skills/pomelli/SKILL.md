# Skill: pomelli

## תיאור
יצירת תמונות בפומלי Photoshoot של Google Labs. הפעל כשהמשתמשת אומרת "תיצור בפומלי", "פומלי", "pomelli", "photoshoot", "תמונה בסגנון פומלי".

---

## תהליך עבודה

### שלב 1 — הבנת הבקשה
לפני הכל — להבין מה מייטל רוצה:
- מה האובייקט/קונספט לתמונה?
- האם יש aspect ratio מסוים? (ברירת מחדל: Square 1:1)
- האם יש סגנון מועדף?

### שלב 2 — כתיבת פרומפט
לכתוב פרומפט באנגלית לפי הנחיות הסגנון (ראו למטה).

**להציג את הפרומפט למייטל לפני יצירה** — אלא אם היא אמרה "תעשה לבד" / "just go ahead".

### שלב 3 — חיבור לפומלי

```bash
agent-browser --profile "C:/Users/meyta/ChromeDebug" open "https://labs.google.com/pomelli"
```

החשבון `meytalp@bethaarava.ort.org.il` כבר מחובר דרך ChromeDebug profile.

### שלב 4 — ניווט ויצירה
1. ללחוץ על **Photoshoot** בסרגל הצד
2. לבחור **"Generate or edit an image"** (לא product photoshoot)
3. להגדיר aspect ratio — ברירת מחדל Square (1:1), אלא אם נאמר אחרת
4. להזין את הפרומפט
5. ללחוץ **Generate**
6. לחכות ~45 שניות ל-4 וריאציות

### שלב 5 — הורדה והצגה
1. להוריד את כל התמונות לתיקיית Downloads
2. להציג למייטל את התוצאות
3. לשאול איזו תמונה היא מעדיפה

### שלב 6 — עריכה (אופציונלי)
אם מייטל רוצה שינויים:
- אפשר להשתמש בפונקציית העריכה בתוך פומלי
- או לערוך מקומית

---

## הנחיות סגנון לפרומפטים

כל פרומפט חייב לכלול את העקרונות הבאים:

### חובה
- **Product photography style, hyper-realistic** — לא AI art
- **Clean white/light background** — מייטל מעדיפה רקע בהיר תמיד
- **Dramatic studio lighting** — תאורת סטודיו מקצועית
- **No real people faces** — אין פנים של אנשים אמיתיים

### צבעי מותג
- Teal, turquoise, dark blue — צבעי אורט בית הערבה
- Orange — צבע Claude Code
- White — רקע בהיר

### קונספטים יצירתיים מומלצים
- Unboxing experience
- Swiss army knife / multi-tool metaphor
- Hourglass / time concept
- Building blocks / modular design
- Miniature world / tilt-shift
- Floating objects / levitation
- Glass morphism / transparent materials

### מבנה פרומפט מומלץ
```
[Object/concept], product photography, hyper-realistic,
[creative concept], clean white background,
dramatic studio lighting, [brand color] accent lighting,
sharp focus, 8K quality, no text
```

### דוגמה
```
A sleek hourglass filled with glowing turquoise digital particles,
product photography, hyper-realistic,
clean white marble surface, dramatic studio lighting,
orange and teal accent rim lighting,
sharp focus, 8K quality, no text
```

---

## כללים חשובים

1. **תמיד לחכות לאישור מייטל** — לפני כל פעולה (generate, download, save to DNA, edit) — להציג את הפרומפט/התוכנית ולחכות לאישור. לא לעשות שום דבר בלי אישור מפורש.
2. **לא לשמור ל-Business DNA בלי אישור מפורש** של מייטל
3. **תמיד להציג פרומפט לפני יצירה** (אלא אם נאמר אחרת)
4. **רקע בהיר תמיד** — לא רקע כהה
5. **לא AI art** — הכל צריך להיראות כמו צילום מוצר מקצועי
6. **מייטל בודקת לפני commit** — להציג תוצאות ולחכות לאישור
7. **אין אימוג'ים** — רק SVG icons אם צריך
8. גופנים למותג: **Karantina** (כותרות כתב יד), **Heebo** (גוף טקסט)

---

## יצירת תמונות למצגות קיימות

כשמבקשים ליצור תמונות למצגות קיימות:

1. **סריקת תיקיית `docs/`** — לחפש קבצי מצגות (HTML) בתיקיות המתאימות (`docs/lessons/`, `docs/presentations/` וכו')
2. **קונספט יצירתי ייחודי לכל נושא** — לא אותו סגנון לכולם. לדוגמה:
   - מצגת על שיער — קונספט מיקרוסקופ/מרקם
   - מצגת על כימיה — קונספט מבחנות/מעבדה
   - מצגת על אזרחות — קונספט סמלי מדינה/מסמכים
3. **תמיד להציג את הקונספט למייטל לפני יצירה** — לתאר את הרעיון ואת הפרומפט המתוכנן, ולחכות לאישור
4. **התמונה מיועדת לשקף 1 (שקף כותרת)** — לכן:
   - נקייה ולא עמוסה
   - עובדת גם בגדלים קטנים
   - משאירה מקום לטקסט כותרת
   - רקע בהיר תמיד

---

## סוכן בדיקת איכות (QA Agent)

אחרי כל יצירת תמונה או עריכה בפומלי, יש להריץ את הבדיקות הבאות:

### 1 — איכות תמונה (Image Quality)
- התמונה נראית כמו **צילום מוצר מקצועי** — לא AI art
- אין ארטיפקטים: אצבעות מוזרות, טקסט מעוות, עיוותי צורה
- חדות גבוהה, ללא blur לא מכוון או pixelation
- תאורה טבעית ועקבית — אין צללים שסותרים את כיוון האור

### 2 — לוגו ומיתוג (Logo & Branding)
- אם הוכנס לוגו Claude Code — לוודא שהוא:
  - **לא חתוך** — כל הלוגו נראה במלואו
  - **בגודל נכון** — לא קטן מדי ולא שולט על התמונה
  - **ממוקם נכון** — בדרך כלל bottom-right או top-left
  - **שקוף/משתלב** — לא חוסם אלמנטים חשובים בתמונה
- אם יש טקסט מותג (Learni וכו') — לוודא שהוא קריא וברור

### 3 — פלטת צבעים (Color Palette)
- הצבעים תואמים את צבעי המותג:
  - **Teal / Turquoise** — צבעי אורט בית הערבה
  - **Orange** — צבע Claude Code
  - **White / Light background** — רקע בהיר תמיד
- אין צבעים חורגים שלא מתאימים למותג
- **רקע כהה = כישלון אוטומטי** — תמיד רקע בהיר/לבן/קרם

### 4 — קומפוזיציה (Composition)
- האיזון הכללי של התמונה — אובייקטים לא דחוסים לצד אחד
- יש מספיק white space
- תאורת סטודיו ברורה — dramatic lighting כמו שמצופה
- האובייקט המרכזי בולט וברור
- אין אלמנטים מיותרים שמסיחים את הדעת

### 5 — אימות הורדה (Download Verification)
- הקובץ הורד בהצלחה — `ls` on the expected download path
- פורמט תקין: `.png` or `.jpg`
- גודל קובץ סביר — לפחות 100KB (תמונה ריקה/שבורה תהיה קטנה מאוד)
- שם קובץ ברור — לשנות שם מ-`image.png` לשם תיאורי אם צריך

```bash
# Example verification
ls -la ~/Downloads/pomelli-*.png
file ~/Downloads/pomelli-*.png
```

### 6 — אימות עריכה (Edit Verification)
אם בוצעה עריכה על התמונה (logo overlay, text, crop):
- הלוגו/טקסט נראה **טבעי ומשתלב** — לא "מודבק" בצורה גסה
- אין הבדלי רזולוציה בין שכבות
- אין הילה לבנה (white halo) סביב אלמנט שנוסף
- Opacity ו-blend mode מתאימים — לא 100% opacity אטום על רקע עדין
- הצללים של האלמנט המוסף תואמים את תאורת התמונה המקורית

### דוח סיכום QA

בסיום הבדיקה — להציג למייטל טבלה קצרה:

| בדיקה | סטטוס | הערות |
|--------|--------|-------|
| איכות תמונה | Pass/Fail | — |
| לוגו ומיתוג | Pass/Fail/N/A | — |
| פלטת צבעים | Pass/Fail | — |
| קומפוזיציה | Pass/Fail | — |
| הורדה | Pass/Fail | — |
| עריכה | Pass/Fail/N/A | — |

**ציון כולל: X/6** (או X/4 אם לא היו לוגו ועריכה)
