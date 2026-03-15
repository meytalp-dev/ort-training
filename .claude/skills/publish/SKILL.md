---
name: publish
description: פרסום תוצר מוכן (מצגת/רילס/אינפוגרפיקה/סימולציה) ל-GitHub Pages ועדכון קישורים.
---

# Skill: פרסום ומעקב – /publish

כאשר תוצר מוכן (מצגת, רילס, אינפוגרפיקה, סימולציה) – הסקיל הזה מפרסם אותו באתר ומעדכן את כל הקישורים.

---

## תהליך

### שלב 1: שאלה – באיזה אתר?

**כלל ברזל:** תמיד לשאול לפני פרסום:

- **Training** – `meytalp-dev.github.io/ort-training/` (תיקיית `docs/`)
- **Lovable** – `kerem-lerani-hub.lovable.app` (תיקיית `lerani-pedagogy-hub/`)
- **שניהם**

### שלב 2: שמירת קבצים

```
docs/training/{tool-name}/
├── index.html          ← מצגת ראשית
├── reel-9x16.mp4       ← רילס (אם נוצר)
├── reel-1x1.mp4        ← רילס מרובע (אם נוצר)
├── infographic.html    ← אינפוגרפיקה (אם נוצרה)
└── practice.html       ← סימולציה (אם נוצרה)
```

### שלב 3: עדכון דף הבית

עדכון `docs/index.html` – הוספת כרטיס חדש להדרכה:

```html
<div class="training-card">
  <div class="card-icon">🎨</div>
  <h3>{שם הכלי}</h3>
  <p>{תיאור קצר}</p>
  <div class="card-links">
    <a href="training/{name}/index.html">📊 מצגת</a>
    <a href="training/{name}/reel-9x16.mp4">🎬 רילס</a>
    <!-- לינקים נוספים לפי מה שנוצר -->
  </div>
</div>
```

### שלב 4: Git

```bash
git add docs/training/{tool-name}/
git add docs/index.html
git commit -m "Add {tool-name} training materials"
git push
```

### שלב 5: אישור

הצגת כל הקישורים החיים למשתמש:

```
✅ פורסם בהצלחה!

🔗 מצגת: https://meytalp-dev.github.io/ort-training/training/{name}/index.html
🎬 רילס: https://meytalp-dev.github.io/ort-training/training/{name}/reel-9x16.mp4
📊 אינפוגרפיקה: https://meytalp-dev.github.io/ort-training/training/{name}/infographic.html
🎯 סימולציה: https://meytalp-dev.github.io/ort-training/training/{name}/practice.html
```

---

## כללים

- **שמות באנגלית בלבד** – תיקיות וקבצים (GitHub Pages)
- **תמיד לשאול** באיזה אתר לפרסם
- **תמיד git push** – לא להשאיר שינויים מקומיים
- **תמיד לעדכן דף הבית** – כדי שההדרכה תופיע ברשימה
- **לנקות temp files** – למחוק `temp-frames/` וקבצים זמניים אחרי פרסום

---

## Google Sheets – מעקב ציונים

אם התוצר כולל שאלון/חידון – לוודא שהציונים נשלחים ל:

```
URL: https://script.google.com/macros/s/AKfycbyLwo3jrseEDJ4GLnVNCzoJTRJBK_IAkJE0IiGGcx18buwJQ0XSRgOcJ2FmbMtA5ojU/exec
Spreadsheet ID: 1LwEQg4OWZbd06A6mFMDG7MTw_R70GSjMOO3KrncoxKw
```

כל שאלון מקבל טאב נפרד ב-Google Sheet.
