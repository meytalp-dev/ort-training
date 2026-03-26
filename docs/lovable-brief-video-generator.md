# Brief ל-Lovable: מחולל סרטוני לימוד

## החזון
מחולל שבו המורה בוחר נושא, מקצוע, כיתה ואורך → ו-AI מייצר סרטון לימודי אינטראקטיבי (HTML שרץ לבד עם אנימציות). שני מצבים: **סרטון קצר** (60 שניות, סיכום) ו**סרטון ארוך** (הקנייה מלאה עם שאלות).

---

## 1. שני סוגי סרטונים

| | סרטון קצר | סרטון ארוך |
|--|-----------|-----------|
| **שם** | סיכום שיעור | סרטון לימודי |
| **אורך** | 60 שניות | 2–15 דקות |
| **פריימים** | 10 | 8–35 |
| **פורמט** | טלפון 9:16 | מסך 16:9 |
| **שאלות** | אין | כל 3–4 פריימים |
| **סגנון** | תמיד מהיר/מגניב | מונפש / רגיל / מצחיק |
| **שימוש** | סיכום בסוף שיעור | הקנייה מלאה |
| **auto-play** | תמיד, בלי כפתורים | כן, עם Play/Pause |

---

## 2. קלט המורה

### סרטון קצר (60 שניות)
| שדה | סוג | חובה |
|-----|------|------|
| נושא | text | כן |
| מקצוע | select | כן |
| כיתה | select | כן |
| תוכן | textarea / קובץ | אופציונלי |

**אין בחירת אורך/סגנון** – תמיד 60 שניות, תמיד מגניב.

### סרטון ארוך (לימודי)
| שדה | סוג | חובה | אפשרויות |
|-----|------|------|----------|
| נושא | text | כן | - |
| מקצוע | select | כן | מתמטיקה / היסטוריה / אזרחות / עברית / תנ"ך / אנגלית / ספרות / מדעים / תספורת / אחר |
| כיתה | select | כן | ט / י / יא / יב |
| רמה | select | כן | בסיסי / בינוני / מתקדם |
| אורך | select | כן | קצר (2-3 דק) / בינוני (5-7 דק) / ארוך (10-15 דק) |
| סגנון | select | כן | מונפש / רגיל / מצחיק |
| תוכן | textarea / קובץ | אופציונלי | PPTX / PDF / DOCX / טקסט |

---

## 3. מבנה סרטון קצר (60 שניות)

### 10 סצנות × 4-6 שניות = 60 שניות

| סצנה | תוכן | משך |
|-------|-------|-----|
| 1 | **Hook** – כותרת + "60 שניות על מה למדנו" | 4s |
| 2–8 | **תוכן** – נקודה מרכזית אחת לסצנה | 5-6s |
| 9 | **סיכום** – 3-5 נקודות עם ✓ | 6s |
| 10 | **סיום** – "עכשיו תורכם" + שם בית הספר | 4s |

### פורמט טלפון (9:16)
```css
#phone {
  width: min(380px, 100vw);
  height: min(100vh, 680px);
  background: #fff;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,0.08);
}
```

### Auto-Play
- סצנות רצות אוטומטית – **בלי כפתורי ניווט**
- לחיצה על המסך = pause/play
- progress bar דק (2px) בתחתית
- טיימר בפינה: `0:00 / 1:00`

### מסך פתיחה
- כותרת הנושא
- "60 שניות"
- כפתור play פשוט (עיגול עם משולש)
- מאפשר סנכרון עם הקלטת מסך

---

## 4. מבנה סרטון ארוך (לימודי)

### אורכים

| אורך | פריימים | זמן | שימוש |
|-------|---------|-----|-------|
| קצר | 8–12 | 2–3 דקות | חזרה מהירה |
| בינוני | 15–20 | 5–7 דקות | הסבר נושא רגיל |
| ארוך | 25–35 | 10–15 דקות | הקנייה מלאה |

כל פריים = **4-6 שניות** (auto-play) + אפשרות עצירה.

### מבנה פריימים

```
פריים 1 – Hook / פתיחה
├── כותרת הנושא בגדול
├── משפט פתיחה מושך
└── אנימציית כניסה

פריימים 2-3 – למה זה חשוב?
├── חיבור לחיים האמיתיים
└── דוגמה מעולם התלמידים

פריימי הקנייה (גוף)
├── רעיון אחד לפריים
├── כותרת + הסבר (2-3 שורות) + דוגמה
└── הדגשות צבעוניות

פריימי שאלה (כל 3-4 פריימים)
├── שאלת הבנה
├── "עצרו וחשבו" – PAUSE אוטומטי
├── 4 תשובות לבחירה
└── משוב מיידי + הסבר

פריים סיכום
├── 3 נקודות מרכזיות
└── "מה למדנו היום?"

פריים סיום
├── "נסו בעצמכם!"
└── לוגו בית הספר
```

### פורמט מסך (16:9)
```css
.video-container {
  max-width: 960px;
  aspect-ratio: 16/9;
  background: #fff;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,0.08);
}
```

### בקרות
- **Play / Pause** (רווח או לחיצה)
- **הקודם / הבא** (חצים)
- **Progress bar** בתחתית
- **Touch/swipe** לנייד
- מסך "לחצו להתחיל" לסנכרון

### שאלות אינטראקטיביות
- בפריימי שאלה – **auto-play נעצר אוטומטית**
- התלמיד בוחר תשובה → מקבל משוב
- לוחץ "המשך" → auto-play חוזר

---

## 5. סגנונות (סרטון ארוך בלבד)

### מונפש
- טקסט מופיע באנימציה (fadeIn, slideUp)
- אלמנטים נכנסים בזה אחר זה עם delay
- מעברים חלקים (fade)
- אייקונים מונפשים

### רגיל
- עיצוב נקי ומקצועי
- טקסט ברור עם הדגשות
- מעברים פשוטים (fade)
- דומה למצגת מתקדמת

### מצחיק
- הומור בטעם טוב – בדיחות קשורות לנושא
- טקסט צעיר ושובב
- אנימציות אנרגטיות (bounce, shake)
- "הידעתם?" עם עובדות מפתיעות
- סגנון TikTok/YouTube Shorts

---

## 6. צבעים – אקסנט לפי מקצוע

| מקצוע | אקסנט | שימוש |
|-------|--------|-------|
| מתמטיקה | `#4F46E5` (כחול-סגול) | כותרות, הדגשות, progress bar |
| היסטוריה | `#B45309` (חום-זהב) | |
| מדעים | `#059669` (ירוק) | |
| עברית/תנ"ך | `#7C3AED` (סגול) | |
| אנגלית | `#2563EB` (כחול) | |
| תספורת | `#EC4899` (ורוד) | |
| אזרחות | `#0891B2` (טורקיז) | |
| ברירת מחדל | `#6366F1` (אינדיגו) | |

**צבעים קבועים:**
- רקע: `#ffffff` (לבן)
- רקע דף: `#f5f5f5` (אפור בהיר)
- טקסט ראשי: `#111`
- טקסט משני: `#666`
- אקסנט עדין: עיגול שקוף (opacity 0.06) בפינה

---

## 7. טיפוגרפיה

```css
/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700&family=Rubik:wght@400;700;900&family=Secular+One&display=swap');

/* כותרות */
h1, h2, h3 { font-family: 'Rubik', sans-serif; font-weight: 800-900; }

/* טקסט */
body { font-family: 'Heebo', sans-serif; font-weight: 400-600; }

/* מספרים ואקסנטים */
.number, .accent { font-family: 'Secular One', sans-serif; }

/* גודל כותרת */
.scene-title { font-size: clamp(1.6rem, 5vw, 2.4rem); }
```

---

## 8. אנימציות

```css
/* אנימציה עיקרית – fadeUp */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* סרטון קצר: 0.3s, מהיר וחד */
.short-video .animate {
  animation: fadeUp 0.3s ease forwards;
}

/* סרטון ארוך (מונפש): 0.5s, יותר חלק */
.long-video .animate {
  animation: fadeUp 0.5s ease forwards;
}

/* delays */
.animate:nth-child(2) { animation-delay: 0.3s; }
.animate:nth-child(3) { animation-delay: 0.6s; }

/* מעבר בין פריימים */
.frame {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.6s ease;
}
.frame.active { opacity: 1; }

/* סגנון מצחיק – אנימציות נוספות */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes shake {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-3deg); }
  75% { transform: rotate(3deg); }
}
```

---

## 9. רכיבי UI

### מספר סצנה (סרטון קצר)
```css
.scene-num {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--accent); color: #fff;
  font-weight: 800; font-size: 0.9rem;
  display: flex; align-items: center; justify-content: center;
}
```

### רשימה מינימליסטית
```css
.item {
  padding: 0.4rem 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 1rem; color: #333;
  display: flex; align-items: center; gap: 0.6rem;
}
.item-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--accent); flex-shrink: 0;
}
```

### צ'ק-ליסט (סיכום)
```css
.check { color: var(--accent); font-weight: 700; }
/* ✓ נקודה 1, ✓ נקודה 2... */
```

### שאלה אינטראקטיבית (סרטון ארוך)
```css
.question-frame {
  text-align: center;
}
.question-text {
  font-size: 1.3rem; font-weight: 700;
  margin-bottom: 1.5rem;
}
.question-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.question-opt {
  padding: 1rem;
  border: 2px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.question-opt.correct { background: #D8F3DC; border-color: #52B788; }
.question-opt.wrong { background: #FDE8EA; border-color: #E76F7A; }
.question-opt.disabled { pointer-events: none; opacity: 0.45; }
```

### ללא (דברים שלא לכלול)
- emoji circles ענקיים
- tags צבעוניים
- icon-grids
- כרטיסים עם borders עבים
- אימוג'ים מוגזמים

---

## 10. מבנה טכני – HTML

### סרטון קצר

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>60 שניות – [נושא]</title>
  <!-- Google Fonts -->
  <style>/* כל ה-CSS כאן */</style>
</head>
<body>
  <div id="page">
    <div id="phone">
      <!-- מסך פתיחה -->
      <div id="start-overlay">
        <h1>[נושא]</h1>
        <p>60 שניות</p>
        <button id="playBtn">▶</button>
      </div>

      <!-- 10 סצנות -->
      <div class="scene active" data-duration="4000">
        <!-- תוכן סצנה 1 -->
      </div>
      <div class="scene" data-duration="5000">
        <!-- תוכן סצנה 2 -->
      </div>
      <!-- ... -->

      <!-- progress bar -->
      <div id="progress"><div id="progressFill"></div></div>
      <!-- טיימר -->
      <div id="timer">0:00 / 1:00</div>
    </div>
  </div>

  <script>
    // Auto-play logic
    let currentScene = 0;
    let isPlaying = false;
    let timer;

    function startVideo() {
      document.getElementById('start-overlay').style.display = 'none';
      isPlaying = true;
      showScene(0);
      advanceAuto();
    }

    function showScene(idx) {
      document.querySelectorAll('.scene').forEach((s, i) => {
        s.classList.toggle('active', i === idx);
      });
      currentScene = idx;
      updateProgress();
    }

    function advanceAuto() {
      const scene = document.querySelectorAll('.scene')[currentScene];
      const duration = parseInt(scene.dataset.duration) || 5000;
      timer = setTimeout(() => {
        if (currentScene < totalScenes - 1) {
          showScene(currentScene + 1);
          advanceAuto();
        }
      }, duration);
    }

    // Click to pause/play
    document.getElementById('phone').addEventListener('click', (e) => {
      if (e.target.closest('#start-overlay')) return;
      if (isPlaying) { clearTimeout(timer); isPlaying = false; }
      else { isPlaying = true; advanceAuto(); }
    });
  </script>
</body>
</html>
```

### סרטון ארוך

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>סרטון לימודי – [נושא]</title>
  <style>/* כל ה-CSS כאן */</style>
</head>
<body>
  <div class="video-container">
    <!-- מסך פתיחה -->
    <div id="start-overlay">
      <h1>[נושא]</h1>
      <p>[מקצוע] | כיתה [X] | [רמה]</p>
      <button id="startBtn">▶ לחצו להתחיל</button>
    </div>

    <!-- פריימים -->
    <div class="frame active" data-duration="5000">
      <!-- תוכן פריים -->
      <div class="animate">כותרת</div>
      <div class="animate">טקסט</div>
    </div>

    <!-- פריים שאלה (auto-pause) -->
    <div class="frame" data-duration="0" data-type="question">
      <div class="question-text">שאלה?</div>
      <div class="question-options">
        <div class="question-opt" data-correct="true" onclick="answerQ(this)">תשובה א</div>
        <div class="question-opt" onclick="answerQ(this)">תשובה ב</div>
        <div class="question-opt" onclick="answerQ(this)">תשובה ג</div>
        <div class="question-opt" onclick="answerQ(this)">תשובה ד</div>
      </div>
      <div class="q-feedback" id="qFeedback"></div>
      <button class="btn-continue" onclick="continueVideo()">המשך ▶</button>
    </div>

    <!-- בקרות -->
    <div id="controls">
      <button onclick="prevFrame()">◀</button>
      <button onclick="togglePlay()" id="playPauseBtn">⏸</button>
      <button onclick="nextFrame()">▶</button>
    </div>
    <div id="progress"><div id="progressFill"></div></div>
  </div>

  <script>
    let currentFrame = 0;
    let isPlaying = false;
    let timer;
    const frames = document.querySelectorAll('.frame');

    function startVideo() {
      document.getElementById('start-overlay').style.display = 'none';
      isPlaying = true;
      showFrame(0);
      advanceAuto();
    }

    function showFrame(idx) {
      frames.forEach((f, i) => f.classList.toggle('active', i === idx));
      currentFrame = idx;
      updateProgress();
    }

    function advanceAuto() {
      const frame = frames[currentFrame];
      const duration = parseInt(frame.dataset.duration);

      // שאלה = pause אוטומטי
      if (frame.dataset.type === 'question' || duration === 0) {
        isPlaying = false;
        return;
      }

      timer = setTimeout(() => {
        if (currentFrame < frames.length - 1) {
          showFrame(currentFrame + 1);
          if (isPlaying) advanceAuto();
        }
      }, duration);
    }

    function answerQ(el) {
      const opts = el.parentElement.querySelectorAll('.question-opt');
      const isCorrect = el.dataset.correct === 'true';
      opts.forEach(o => {
        o.classList.add('disabled');
        if (o.dataset.correct === 'true') o.classList.add('correct');
      });
      if (!isCorrect) el.classList.add('wrong');
      // Show feedback + continue button
      document.querySelector('.btn-continue').style.display = 'block';
    }

    function continueVideo() {
      showFrame(currentFrame + 1);
      isPlaying = true;
      advanceAuto();
    }

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') prevFrame();
      if (e.key === 'ArrowLeft') nextFrame();
      if (e.key === ' ') togglePlay();
    });

    // Touch/swipe
    let touchStartX;
    document.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX);
    document.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextFrame(); else prevFrame();
      }
    });
  </script>
</body>
</html>
```

---

## 11. Gemini AI Integration

**כמו במחולל המשחקים:**

```javascript
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const apiKey = localStorage.getItem('ort-gemini-key');

async function generateVideo(params) {
  const { topic, subject, grade, level, length, style } = params;

  const prompt = `אתה מורה מנוסה בבית ספר תיכון מקצועי "אורט בית הערבה".
נושא: "${topic}"
מקצוע: ${subject}
כיתה: ${grade}
רמה: ${level}
אורך: ${length}
סגנון: ${style}

הנחיות:
- שפה פשוטה וברורה
- מתאימה לתלמידי תיכון עם קשיי קשב ולקויות למידה
- מנות קטנות – רעיון אחד לפריים
- שאלת הבנה כל 3-4 פריימים
- משפטים קצרים (עד 10 מילים)

צור סרטון לימודי בפורמט JSON:
{
  "title": "כותרת הסרטון",
  "frames": [
    {
      "type": "hook",
      "title": "כותרת",
      "content": "משפט פתיחה מושך"
    },
    {
      "type": "content",
      "title": "כותרת משנה",
      "points": ["נקודה 1", "נקודה 2"],
      "example": "דוגמה (אופציונלי)"
    },
    {
      "type": "question",
      "text": "שאלה?",
      "options": ["א", "ב", "ג", "ד"],
      "correct": 0,
      "explanation": "הסבר"
    },
    {
      "type": "summary",
      "points": ["✓ נקודה 1", "✓ נקודה 2", "✓ נקודה 3"]
    },
    {
      "type": "ending",
      "text": "עכשיו תורכם!"
    }
  ]
}`;

  const res = await fetch(GEMINI_URL + '?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
    })
  });

  const data = await res.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
}
```

---

## 12. שמירה + פרסום

### מיקום קבצים
```
docs/videos/{subject}-{topic}/index.html
```
דוגמאות:
- `docs/videos/math-quadratic/index.html`
- `docs/videos/history-great-revolt/index.html`

### פרסום ל-Google Sheets (אופציונלי)
אפשר לשמור מטא-דאטה של הסרטון ל-Google Sheets:
```javascript
POST → {
  action: 'saveVideo',
  id: videoId,
  name: title,
  subject: subject,
  grade: grade,
  type: 'short' | 'long',
  teacher: userName,
  email: userEmail
}
```

### הורדה
- כפתור "הורד HTML" – מוריד קובץ HTML עצמאי
- כפתור "העתק קישור" – אחרי פרסום ל-GitHub Pages

---

## 13. כללי עיצוב חשובים

### כלל ברזל: לא ילדותי, כן מגניב

**כן:**
- מודרני, אנרגטי, צעיר
- כמו TikTok / Instagram / אפליקציה לנוער
- צבעים חיים אבל בטעם טוב
- gradient עדין, אלמנטים גרפיים מינימליים

**לא:**
- אימוג'ים מוגזמים
- סגנון ילדים
- עיגולים ענקיים צבעוניים
- כרטיסים עם borders עבים

### רקע
- סצנות: לבן טהור (#ffffff)
- אקסנט עדין: עיגול אחד שקוף מאוד (opacity 0.06) בפינה
- רקע דף: #f5f5f5

---

## 14. Responsive

### סרטון קצר (טלפון)
```css
@media (max-width: 400px) {
  #phone { width: 100vw; height: 100vh; border-radius: 0; }
}
```

### סרטון ארוך (מסך)
```css
@media (max-width: 768px) {
  .video-container { aspect-ratio: auto; min-height: 100vh; }
  .question-options { grid-template-columns: 1fr; }
}
```

---

## 15. כללים

1. **קובץ HTML אחד** – self-contained, בלי תלויות (חוץ מ-Google Fonts)
2. **RTL** – `dir="rtl" lang="he"`
3. **שפה פשוטה** – משפטים קצרים, מילים פשוטות
4. **מנות קטנות** – רעיון אחד לפריים
5. **שאלות** (סרטון ארוך) – כל 3-4 פריימים + auto-pause
6. **Auto-play** – הסרטון רץ לבד
7. **מסך "לחצו להתחיל"** – לסנכרון עם הקלטת מסך
8. **עיצוב מגניב ובוגר** – לא ילדותי
9. **צבע אקסנט אחד** – לפי מקצוע
10. **אנימציות מהירות** – fadeUp 0.3s (קצר) / 0.5s (ארוך)
