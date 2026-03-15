---
name: lesson-builder
description: מערך שיעור מלא – דף נחיתה, פתיחה, מצגת+משחקים, סרטון סיכום ושאלון דיפרנציאלי.
---

# Skill: מערך שיעור מלא – /lesson-builder

סקיל-על שמייצר **חבילת שיעור מלאה** בלחיצה אחת:
דף נחיתה + פעילות פתיחה + מצגת עם משחקים + סרטון סיכום + שאלון דיפרנציאלי.

המורה מקבל **קישור אחד** שמוביל לדשבורד עם כל הרכיבים.

---

# קלט חובה

לפני תחילת העבודה, יש לאסוף:

| שדה | דוגמה | חובה? |
|------|--------|--------|
| נושא | "מחזוריות צמיחת השיער" | ✔ |
| מקצוע | תספורת / היסטוריה / מתמטיקה / עברית / אזרחות / מדעים / אנגלית / תנ"ך | ✔ |
| כיתה | ט / י / יא / יב | ✔ |
| מייל מורה | dana@bethaarava.ort.org.il | ✔ |
| קובץ מצורף | PPTX / PDF / DOCX / TXT / HTML | אופציונלי |

אם חסר מידע → שאל עם `AskUserQuestion`.

אם יש קובץ מצורף – חלץ ממנו: רעיונות מרכזיים, מושגים, הסברים, דוגמאות, שאלות.

---

# מבנה הפלט

```
docs/lessons/{lesson-name}/
├── index.html          ← דף נחיתה (דשבורד השיעור)
├── opener.html         ← 3 פעילויות פתיחה
├── lesson.html         ← מצגת + משחקים + פעילות קבוצתית + סיכום
├── video.html          ← סרטון סיכום 60 שניות

docs/quizzes/{lesson-name}/
└── index.html          ← שאלון דיפרנציאלי
```

**שם התיקייה**: אנגלית בלבד, kebab-case (דרישת GitHub Pages).

---

# זרימת עבודה – סדר היצירה

## שלב 1: lesson.html – המצגת (הליבה)

זהו התוצר המרכזי. כל השאר נגזר ממנו.

קובץ HTML אחד עם **4 לשוניות**:

### לשונית 1 – מצגת
- 8–15 שקפים
- כל שקף: כותרת + 3–5 נקודות + דוגמה
- שקף 1: "מה נלמד" + 3–4 bullet points
- שקפי הקנייה: רעיון מרכזי אחד לשקף
- שאלות הבנה אחרי כל מושג
- שקף סיכום: 3 רעיונות מרכזיים + שאלת חשיבה
- ניווט: חצים + מקלדת + touch/swipe
- פס התקדמות עליון

### לשונית 2 – משחקים לימודיים
- לפחות 3 משחקים: חידון טריוויה, התאמה, נכון/לא נכון
- ניקוד + משוב מיידי
- שליחת ציונים ל-Google Sheets

### לשונית 3 – פעילות קבוצתית
- הוראות ברורות לעבודה בזוגות/קבוצות
- 3–4 שלבים ממוספרים
- משימת בונוס

### לשונית 4 – סיכום
- 3 נקודות מפתח עם אייקונים
- Exit Ticket: שאלה פתוחה → נשלחת ל-Google Sheets

**מסך כניסה**: שם תלמיד + כיתה (חובה לפני כניסה)

**תבנית עיצוב**: ראה `docs/lessons/hair-styling/hygiene.html` כדוגמה מלאה.

---

## שלב 2: opener.html – פעילויות פתיחה

3 פעילויות אינטראקטיביות להתחלת השיעור.

**בנה לפי סקיל `/lesson-opener`** – אותו מבנה HTML, אותם סגנונות.

שמור ב-`docs/lessons/{name}/opener.html` (לא ב-`docs/openers/`).

בחירת סוגי פעילויות לפי מקצוע:
- היסטוריה/אזרחות → סיפור + נכון/לא נכון + דילמה
- מתמטיקה/מדעים → חידה + שאלת חשיבה + סקר
- עברית/ספרות → ענן מילים + תמונה מדברת + שאלה
- תספורת/מקצועי → "מה היית עושה" + סקר + חידה

כל פעילות חייבת: מסך מלא (projector), רמז למורה, אינטראקטיביות.

---

## שלב 3: video.html – סרטון סיכום 60 שניות

**בנה לפי סקיל `/create-video`** – אותו פורמט 9:16, אותו עיצוב.

10 סצנות × 4–6 שניות:

| סצנה | תוכן | אורך |
|-------|--------|-------|
| 1 | Hook: כותרת + "60 שניות על מה שלמדנו" | 4s |
| 2–8 | תוכן: רעיון מרכזי אחד לסצנה | 5–6s |
| 9 | סיכום: 3–5 נקודות מפתח עם ✓ | 6s |
| 10 | סיום: "עכשיו תורכם" + שם בית הספר | 4s |

שמור ב-`docs/lessons/{name}/video.html`.

צבע מבטא לפי מקצוע:
```
מתמטיקה: #4F46E5 | היסטוריה: #B45309 | מדעים: #059669
עברית/תנ"ך: #7C3AED | אנגלית: #2563EB | תספורת: #EC4899
אזרחות: #0891B2 | ברירת מחדל: #6366F1
```

---

## שלב 4: שאלון דיפרנציאלי

**בנה לפי סקיל `/create-quiz`** – אותו מבנה מדויק.

שמור ב-`docs/quizzes/{lesson-name}/index.html`.

עדכן את מאגר השאלונים ב-`docs/quizzes/index.html` (הוסף כרטיס חדש).

מבנה השאלון:
1. מסך פתיחה: שם + כיתה
2. 2 שאלות מאבחנות (סמויות!)
3. 8 שאלות ברמה שנקבעה (בסיסי/בינוני/מתקדם)
4. משוב מיידי אחרי כל שאלה
5. מסך סיום עם ציון
6. שליחת ציונים ל-Google Sheets

**חובה**: correctIndex משתנה בין שאלות (לא תמיד באותו מיקום).

Google Sheets URL:
```
https://script.google.com/macros/s/AKfycbyLwo3jrseEDJ4GLnVNCzoJTRJBK_IAkJE0IiGGcx18buwJQ0XSRgOcJ2FmbMtA5ojU/exec
```

---

## שלב 5: index.html – דף נחיתה

דף כרטיסים שמקשר לכל הרכיבים. זהו הקישור שמשתפים עם המורים.

### HTML Template לדף הנחיתה:

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>מערך שיעור – {LESSON_TITLE}</title>
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700&family=Rubik:wght@400;700;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#F0F4F8;--card:#fff;
  --primary:#2A9D8F;--primary-l:#D4F3EF;--primary-d:#1a7a6d;
  --secondary:#E76F7A;--sec-l:#FDE8EA;
  --blue:#4A90D9;--blue-l:#DBEAFE;
  --purple:#7C3AED;--purple-l:#EDE7F6;
  --green:#52B788;--green-l:#D8F3DC;
  --orange:#F4A261;--orange-l:#FEF0E1;
  --dark:#1E293B;--gray:#64748B;
  --shadow:0 2px 20px -4px rgba(0,0,0,.06);
  --shadow-md:0 8px 28px rgba(0,0,0,.07);
  --r:20px;
}
body{font-family:'Heebo',sans-serif;background:var(--bg);color:var(--dark);min-height:100vh}

/* Header */
.header{background:linear-gradient(135deg,var(--primary),var(--primary-d));color:#fff;padding:3rem 1.5rem 2.5rem;text-align:center;position:relative;overflow:hidden}
.header::after{content:'';position:absolute;bottom:-40px;left:50%;transform:translateX(-50%);width:120%;height:80px;background:var(--bg);border-radius:50% 50% 0 0}
.header h1{font-family:'Rubik',sans-serif;font-size:clamp(1.8rem,5vw,2.6rem);font-weight:900;margin-bottom:.5rem}
.header .meta{display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;margin-top:.5rem}
.badge{background:rgba(255,255,255,.2);padding:.3rem .8rem;border-radius:20px;font-size:.85rem;backdrop-filter:blur(4px)}

/* Grid */
.container{max-width:900px;margin:-1rem auto 2rem;padding:0 1.5rem}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.2rem;margin-top:1.5rem}

/* Cards */
.card{background:var(--card);border-radius:var(--r);padding:1.5rem;box-shadow:var(--shadow);transition:transform .3s,box-shadow .3s;cursor:pointer;text-decoration:none;color:inherit;display:flex;flex-direction:column;gap:.8rem;opacity:0;animation:fadeUp .6s ease forwards}
.card:hover{transform:translateY(-6px);box-shadow:var(--shadow-md)}
.card:nth-child(1){animation-delay:.1s}
.card:nth-child(2){animation-delay:.2s}
.card:nth-child(3){animation-delay:.3s}
.card:nth-child(4){animation-delay:.4s}
.card:nth-child(5){animation-delay:.5s}
.icon-box{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center}
.icon-box svg{width:26px;height:26px}
.card h3{font-family:'Rubik',sans-serif;font-weight:700;font-size:1.15rem}
.card p{color:var(--gray);font-size:.9rem;line-height:1.5}
.card .cta{display:inline-flex;align-items:center;gap:.3rem;color:var(--primary);font-weight:700;font-size:.85rem;margin-top:auto}
.card .cta::after{content:'←';transition:transform .3s}
.card:hover .cta::after{transform:translateX(-4px)}

/* Teacher Guide */
.teacher-section{max-width:900px;margin:1rem auto 3rem;padding:0 1.5rem}
.teacher-toggle{background:var(--card);border:none;width:100%;padding:1.2rem 1.5rem;border-radius:var(--r);box-shadow:var(--shadow);cursor:pointer;display:flex;align-items:center;gap:.8rem;font-family:'Rubik',sans-serif;font-size:1.05rem;font-weight:700;color:var(--dark);transition:box-shadow .3s}
.teacher-toggle:hover{box-shadow:var(--shadow-md)}
.teacher-toggle .arrow{transition:transform .3s;font-size:1.2rem}
.teacher-toggle.open .arrow{transform:rotate(90deg)}
.teacher-content{background:var(--card);border-radius:0 0 var(--r) var(--r);padding:0 1.5rem;max-height:0;overflow:hidden;transition:max-height .4s ease,padding .4s ease;box-shadow:var(--shadow)}
.teacher-content.open{max-height:600px;padding:1.5rem}
.teacher-content h4{font-family:'Rubik',sans-serif;color:var(--primary);margin:1rem 0 .5rem}
.teacher-content h4:first-child{margin-top:0}
.flow-step{display:flex;gap:.8rem;align-items:flex-start;margin:.5rem 0}
.flow-num{width:28px;height:28px;border-radius:50%;background:var(--primary-l);color:var(--primary-d);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem;flex-shrink:0}
.flow-text{font-size:.9rem;line-height:1.5}

/* Footer */
.footer{text-align:center;padding:1.5rem;color:var(--gray);font-size:.8rem}

@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

@media(max-width:600px){
  .header{padding:2rem 1rem 2rem}
  .grid{grid-template-columns:1fr}
}
</style>
</head>
<body>

<div class="header">
  <h1>{LESSON_TITLE}</h1>
  <div class="meta">
    <span class="badge">{SUBJECT}</span>
    <span class="badge">כיתה {CLASS}</span>
    <span class="badge">אורט בית הערבה</span>
  </div>
</div>

<div class="container">
  <div class="grid">

    <!-- Card 1: Opener -->
    <a href="opener.html" class="card">
      <div class="icon-box" style="background:var(--orange-l)">
        <svg fill="none" stroke="var(--orange)" stroke-width="2" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m-8-9H3m18 0h-1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>
      </div>
      <h3>פעילויות פתיחה</h3>
      <p>3 פעילויות אינטראקטיביות לפתיחת השיעור על המסך</p>
      <span class="cta">פתח</span>
    </a>

    <!-- Card 2: Lesson -->
    <a href="lesson.html" class="card">
      <div class="icon-box" style="background:var(--primary-l)">
        <svg fill="none" stroke="var(--primary)" stroke-width="2" viewBox="0 0 24 24"><path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
      </div>
      <h3>מצגת + משחקים</h3>
      <p>מצגת לימודית, 3 משחקים אינטראקטיביים, פעילות קבוצתית וסיכום</p>
      <span class="cta">פתח</span>
    </a>

    <!-- Card 3: Quiz -->
    <a href="../../quizzes/{QUIZ_FOLDER}/index.html" class="card">
      <div class="icon-box" style="background:var(--purple-l)">
        <svg fill="none" stroke="var(--purple)" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <h3>שאלון דיפרנציאלי</h3>
      <p>שאלון מותאם רמה – הציונים נשלחים אוטומטית למורה</p>
      <span class="cta">פתח</span>
    </a>

    <!-- Card 4: Video -->
    <a href="video.html" class="card">
      <div class="icon-box" style="background:var(--sec-l)">
        <svg fill="none" stroke="var(--secondary)" stroke-width="2" viewBox="0 0 24 24"><path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"/></svg>
      </div>
      <h3>סיכום ב-60 שניות</h3>
      <p>סרטון סיכום קצר בסגנון TikTok – לצפייה בבית או בכיתה</p>
      <span class="cta">צפה</span>
    </a>

    <!-- Card 5: Teacher Guide -->
    <div class="card" onclick="document.querySelector('.teacher-toggle').click();this.style.display='none'">
      <div class="icon-box" style="background:var(--green-l)">
        <svg fill="none" stroke="var(--green)" stroke-width="2" viewBox="0 0 24 24"><path d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/></svg>
      </div>
      <h3>מדריך למורה</h3>
      <p>זרימת שיעור מומלצת, תזמון וטיפים</p>
      <span class="cta">הצג</span>
    </div>

  </div>
</div>

<!-- Teacher Guide Section -->
<div class="teacher-section">
  <button class="teacher-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">
    <span class="arrow">◂</span>
    מדריך למורה – זרימת שיעור מומלצת
  </button>
  <div class="teacher-content">
    <h4>זרימת שיעור ({TOTAL_MINUTES} דקות)</h4>
    <div class="flow-step"><span class="flow-num">1</span><span class="flow-text"><strong>פתיחה (5–10 ד׳)</strong> – הקרינו את פעילויות הפתיחה על המסך. בחרו 1–2 פעילויות.</span></div>
    <div class="flow-step"><span class="flow-num">2</span><span class="flow-text"><strong>הקנייה (15–20 ד׳)</strong> – הציגו את המצגת. עצרו לשאלות הבנה.</span></div>
    <div class="flow-step"><span class="flow-num">3</span><span class="flow-text"><strong>תרגול (10 ד׳)</strong> – תלמידים משחקים את המשחקים בזוגות על הטלפון.</span></div>
    <div class="flow-step"><span class="flow-num">4</span><span class="flow-text"><strong>פעילות קבוצתית (10 ד׳)</strong> – חלקו לקבוצות, עקבו אחרי ההוראות בלשונית.</span></div>
    <div class="flow-step"><span class="flow-num">5</span><span class="flow-text"><strong>סיכום (5 ד׳)</strong> – הקרינו את הסרטון. תלמידים ממלאים Exit Ticket.</span></div>

    <h4>שיעורי בית (אופציונלי)</h4>
    <div class="flow-step"><span class="flow-num">📝</span><span class="flow-text">שלחו את קישור השאלון לתלמידים. הציונים נשלחים אוטומטית ל-Google Sheets.</span></div>

    <h4>טיפים</h4>
    <div class="flow-step"><span class="flow-num">💡</span><span class="flow-text">התאימו את הזמנים לכיתה. אפשר לדלג על רכיבים לפי הצורך.</span></div>
    <div class="flow-step"><span class="flow-num">💡</span><span class="flow-text">הסרטון מתאים גם לחזרה לפני מבחן – שלחו לתלמידים.</span></div>
  </div>
</div>

<div class="footer">אורט בית הערבה – מערך שיעור דיגיטלי</div>

<script>
// Smooth card click for teacher guide
</script>
</body>
</html>
```

החלף את `{LESSON_TITLE}`, `{SUBJECT}`, `{CLASS}`, `{QUIZ_FOLDER}`, `{TOTAL_MINUTES}` בערכים הנכונים.

---

# שלב 6: פרסום

1. `git add docs/lessons/{name}/ docs/quizzes/{name}/`
2. `git commit -m "Add complete lesson: {name}"`
3. `git push`
4. הצג למשתמשת:

```
✅ מערך שיעור מלא נוצר!

🏠 דף נחיתה: https://meytalp-dev.github.io/ort-training/lessons/{name}/
📖 מצגת: https://meytalp-dev.github.io/ort-training/lessons/{name}/lesson.html
🎯 פתיחה: https://meytalp-dev.github.io/ort-training/lessons/{name}/opener.html
🎬 סרטון: https://meytalp-dev.github.io/ort-training/lessons/{name}/video.html
📝 שאלון: https://meytalp-dev.github.io/ort-training/quizzes/{name}/
```

---

# קהל יעד

תלמידי תיכון מקצועי (כיתות ט–יב).

מאפיינים:
- קשיי קשב וריכוז
- לקויות למידה
- צורך בהסברים פשוטים

לכן יש להקפיד על:
- שפה פשוטה, משפטים קצרים
- מנות ידע קטנות
- דוגמאות מהחיים
- חלוקה ברורה

---

# עקרונות עיצוב

## Design System

```css
:root {
  --primary: #2A9D8F;
  --primary-l: #D4F3EF;
  --secondary: #E76F7A;
  --blue: #4A90D9;
  --green: #52B788;
  --accent: #E9A319;
  --dark: #1E293B;
  --gray: #64748B;
  --bg: #F0F4F8;
  --r: 20px;
}
```

## פונטים
- **Heebo** – גוף טקסט
- **Rubik** – כותרות (bold/900)
- **Secular One** – מספרים/הדגשות (אופציונלי)

## כללים
- כרטיסים עם פינות מעוגלות (20px) והצללה עדינה
- אנימציות fadeUp עם animation-delay
- RTL עברית
- Self-contained HTML (ללא קבצים חיצוניים מלבד Google Fonts)
- ניווט מקלדת (חצים) + touch/swipe
- מינימום טקסט בשקף
- אייקונים מודרניים (outline SVG, לא אימוג'ים ילדותיים)
- עיצוב בוגר ומקצועי – כמו אפליקציית למידה, לא כמו דף לילדים

## Google Sheets – שליחת ציונים

URL:
```
https://script.google.com/macros/s/AKfycbyLwo3jrseEDJ4GLnVNCzoJTRJBK_IAkJE0IiGGcx18buwJQ0XSRgOcJ2FmbMtA5ojU/exec
```

Spreadsheet ID: `1LwEQg4OWZbd06A6mFMDG7MTw_R70GSjMOO3KrncoxKw`

כל רכיב שולח ציונים עם `action: 'submit'` + שם התלמיד + כיתה + ציון + מייל המורה.

---

# דוגמה מלאה

קלט: "מערך שיעור על מחזוריות צמיחת השיער, תספורת, כיתה י, meytalp@bethaarava.ort.org.il"

פלט:
```
docs/lessons/hair-growth/
├── index.html      (דשבורד עם 5 כרטיסים)
├── opener.html     (3 פעילויות: סקר + חידה + נכון/לא נכון)
├── lesson.html     (15 שקפים + 3 משחקים + פעילות קבוצתית + סיכום)
├── video.html      (10 סצנות, 60 שניות, צבע ורוד #EC4899)

docs/quizzes/hair-growth/
└── index.html      (2 מאבחנות + 8 שאלות × 3 רמות)
```
