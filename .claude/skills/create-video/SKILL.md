---
name: create-video
description: סרטון סיכום שיעור ~50 שניות עם מוזיקה ואנימציות נושאיות – משתלב עם מערכי שיעור.
---

# Skill: סיכום שיעור ~50 שניות – /create-video

יצירת **סרטון סיכום שיעור ב-50 שניות** בסגנון TikTok עם **מוזיקה** ו**אנימציות נושאיות**.

**המטרה:** בסוף כל שיעור, המורה מציג סרטון מהיר שמסכם את מה שלמדו.

**זה לא מצגת.** זה סרטון שרץ לבד, מהיר, חד, מגניב – עם מוזיקה תוססת ואנימציות שקשורות לנושא.

---

## שילוב עם מערכי שיעור (lesson-builder)

הסקיל הזה **משתלב ישירות עם `/lesson-builder`**.

כשמופעל כחלק מ-`/lesson-builder`:
- **אין צורך בקלט נוסף** – הכל נשאב מהתוצרים שכבר נוצרו
- הסרטון נשמר ב-`docs/lessons/{name}/video.html`

כשמופעל עצמאית:
- המשתמש מספק מקצוע + נושא + כיתה + תוכן

---

## קלט (הפעלה עצמאית)

המשתמש מספק:
- **מקצוע + נושא** (חובה)
- **כיתה** (חובה)
- **תוכן השיעור** – פרומפט / קובץ / רשימת נקודות

אם חסר – **לשאול**.

---

## מבנה – 10 סצנות × 3.5-5 שניות = ~50 שניות

| סצנה | תוכן | משך |
|-------|-------|-----|
| 1 | **Hook** – כותרת + "60 שניות על מה למדנו" | 3.5s |
| 2-8 | **תוכן** – נקודה מרכזית אחת לסצנה | 4.5-5s |
| 9 | **סיכום** – 3-5 נקודות מרכזיות עם צ'ק | 5s |
| 10 | **סיום** – "עכשיו תורכם" + שם בית הספר | 3.5s |

```javascript
var timings = [3500, 5000, 5000, 5000, 5000, 4500, 5000, 4500, 5000, 3500];
```

**קצב מהיר:** סצנות קצרות, אנימציות מהירות (0.3s), חדות.

---

## עיצוב – מגניב, צעיר, תוסס, בוגר

### כלל ברזל: לא ילדותי, כן מגניב

- **כן:** מודרני, אנרגטי, צעיר – כמו TikTok / Instagram / אפליקציה לנוער
- **כן:** צבעים חיים אבל בטעם טוב, gradient עדין, אלמנטים גרפיים
- **לא:** אימוג'ים מוגזמים, סגנון ילדים, עיגולים ענקיים צבעוניים

### רקע
- **רקע הסצנות:** לבן טהור (`#ffffff`)
- **אקסנט עדין:** עיגול אחד בלבד, שקוף מאוד (opacity 0.06), בפינה
- **רקע הדף:** `#f5f5f5` (אפור בהיר)

### צבעים – אקסנט חי לפי מקצוע

- **טקסט ראשי:** `#111` (שחור כמעט)
- **טקסט משני:** `#666`
- **אקסנט:** צבע אחד חי לפי מקצוע:

| מקצוע | אקסנט |
|-------|--------|
| מתמטיקה | `#4F46E5` (כחול-סגול) |
| היסטוריה | `#B45309` (חום-זהב) |
| מדעים | `#059669` (ירוק) |
| עברית/תנ"ך | `#7C3AED` (סגול) |
| אנגלית | `#2563EB` (כחול) |
| תספורת | `#EC4899` (ורוד) |
| אזרחות | `#0891B2` (טורקיז) |
| ברירת מחדל | `#6366F1` (אינדיגו) |

### טיפוגרפיה
- **כותרות:** `Rubik` weight 800-900, גדול וחד
- **טקסט:** `Heebo` weight 400-600
- **מספרים/אקסנטים:** `Secular One`
- **גודל כותרת:** `clamp(1.6rem, 5vw, 2.4rem)`

### רכיבי UI

**מספר סצנה** – עיגול קטן (36px) עם צבע האקסנט:
```css
.scene-num {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--accent); color: #fff;
  font-weight: 800; font-size: 0.9rem;
}
```

**רשימה** – מינימליסטית, בלי רקע לפריטים:
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

**ללא:** emoji circles ענקיים, tags צבעוניים, icon-grids, כרטיסים עם borders.

---

## מוזיקה – Web Audio API (חובה!)

כל סרטון **חייב** מוזיקת רקע שנוצרת ב-Web Audio API. המוזיקה נלכדת בהקלטת מסך (Win+G).

### סגנון: Dance/EDM 140 BPM

**BPM:** 140 (אנרגטי, תוסס – לא lo-fi!)

**פרוגרסיה:** Em → C → G → D (או פרוגרסיה אנרגטית דומה)

### רכיבי המוזיקה (כולם חובה)

| רכיב | תיאור | פרמטרים |
|-------|--------|----------|
| **Kick** | four-on-the-floor, כל ביט | sine 200→30Hz + click transient 3500Hz |
| **Clap** | ביט 2 ו-4 | 3 noise bursts × 8ms stagger, bandpass 2500Hz |
| **Hi-hat** | 16th notes (closed + open) | noise, highpass 11000Hz (closed) / 7000Hz (open) |
| **Pad** | כל 8 ביטים, filter sweep | sawtooth + detune, lowpass sweep 800→3500→1200Hz |
| **Bass** | offbeat pumping pattern | sawtooth, lowpass 400Hz, Q=2 |
| **Pluck** | catchy riff על offbeats | square, filter decay 5000→400Hz |

### Master Gain – fade in/out

```javascript
masterGain.gain.setValueAtTime(0, now);
masterGain.gain.linearRampToValueAtTime(0.4, now + 1);      // fade in 1s
masterGain.gain.setValueAtTime(0.4, now + dur - 2);
masterGain.gain.linearRampToValueAtTime(0, now + dur);       // fade out 2s
```

### סנכרון עם pause/play

```javascript
// On pause:
if (audioCtx) audioCtx.suspend();
// On resume:
if (audioCtx) audioCtx.resume();
```

### כפתור Mute

- כפתור `#mute-btn` בפינה ימנית עליונה (z-index:50)
- אייקון: `&#128266;` (speaker) / `&#128264;` (muted)
- מקש קיצור: **M** (toggleMute)
- לחיצה על mute **לא עוצרת** את הסרטון (stopPropagation)

```css
#mute-btn {
  position: absolute; top: 16px; right: 16px; z-index: 50;
  background: none; border: none; cursor: pointer;
  color: #bbb; font-size: 1.2rem;
}
```

---

## אנימציות נושאיות – CSS (חובה!)

כל סרטון **חייב** אנימציות CSS ייחודיות שקשורות לנושא השיעור.

### כלל: אנימציות מופעלות על `.scene.active`

כל אנימציה מתחילה כש-`.scene` מקבל class `active`. כשהסצנה מתחלפת, האנימציה מתאפסת.

### דוגמאות לפי נושא

**תספורת/שיער:**
- שערות צומחות מלמטה (`hairGrow` + `hairSway`)
- שערות נושרות כגשם (`rain` עם `--dur`, `--delay`, `--rot`)
- זקיק שיער עם גדילה/הצטמקות (`follicle` + `growUp` / `shrinkDown`)
- נבט ירוק צומח (`sproutGrow`)
- ספרקלים חוגגים (`sparkle`)

**היסטוריה:**
- דגלים מתנופפים, חרב/מגן מסתובב
- שריפה (להבות CSS), חומות מתמוטטות
- מפה מתגלה בהדרגה

**מתמטיקה/מדעים:**
- גרף עולה, מספרים מסתובבים
- מולקולות/אטומים מתנדנדים
- נוסחה מתגלה אות אחרי אות

**עברית/תנ"ך:**
- אותיות צפות ומתרכבות למילה
- מגילה נפתחת
- עט כותב

### מבנה CSS טיפוסי

```css
/* אלמנט בסיס */
.element-name {
  position: absolute;
  /* מיקום ומראה */
}

/* מופעל רק כשהסצנה פעילה */
.scene.active .element-name {
  animation: animName 2s ease-out forwards;
}
.scene.active .element-name:nth-child(2) { animation-delay: .3s }
.scene.active .element-name:nth-child(3) { animation-delay: .6s }

@keyframes animName {
  0% { opacity: 0; transform: ... }
  100% { opacity: 1; transform: ... }
}
```

### סוגי אנימציות שימושיים

| אנימציה | שימוש | keyframes |
|----------|-------|-----------|
| `slideInRight` | רשימות, פריטים | `translateX(40px)→0` |
| `checkPop` | צ'קליסט | `scale(0)→scale(1)` cubic-bezier bounce |
| `fadeIn` | הופעה עדינה | `opacity 0→1` |
| `numPulse` | מספרים גדולים | `scale(1)→1.08→1` infinite |
| `vsFlash` | VS divider | `opacity + scale` infinite |
| `sparkle` | חגיגה, סיום | `scale(0)→1→0` infinite |
| `rain` | נפילה | `translateY(0→700px)` with rotation |

### כלל חשוב: stagger delays

כל פריט ברשימה/קבוצה מקבל `animation-delay` שונה ליצירת אפקט "גל":
```css
:nth-child(1) { animation-delay: .2s }
:nth-child(2) { animation-delay: .5s }
:nth-child(3) { animation-delay: .8s }
```

---

## מבנה טכני

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
- progress bar דק (2px) בתחתית – צבע אקסנט בלבד
- טיימר בפינה שמאלית: `0:00 / 0:50`
- כפתור mute בפינה ימנית

### מסך פתיחה
- כותרת הנושא
- "סיכום ב-50 שניות"
- כפתור play פשוט (עיגול עם משולש)
- מאפשר סנכרון עם הקלטת מסך (Win+G)

### מעברים בין סצנות
- `opacity 0→1` + `translateY 15px→0` ב-0.3s
- לא slide, לא zoom, לא bounce

### כפתור חזרה
- קישור חזרה לדף הנחיתה (`index.html`)
- `position:fixed; top:16px; left:16px;`
- עיצוב: רקע כהה שקוף עם backdrop-filter:blur

---

## שמירה

```
docs/videos/{subject}-{topic}/index.html
```

כשנוצר כחלק מ-`/lesson-builder`:
```
docs/lessons/{lesson-name}/video.html
```

---

## כללים

1. **~50 שניות** – קצב מהיר, לא להאריך
2. **10 סצנות** – 3.5-5 שניות לסצנה
3. **מוזיקה חובה** – Web Audio API, dance/EDM 140 BPM, עם mute
4. **אנימציות נושאיות חובה** – CSS animations שקשורות לנושא
5. **עיצוב מגניב ובוגר** – צעיר, תוסס, לא ילדותי
6. **רקע לבן** – אקסנט חי אחד לפי מקצוע
7. **פורמט טלפון** – 9:16
8. **HTML אחד** – self-contained (ללא קבצים חיצוניים מלבד Google Fonts)
9. **RTL** – `dir="rtl" lang="he"`
10. **שפה פשוטה** – מנות קטנות, משפטים קצרים
11. **Pause = music suspend** – מוזיקה עוצרת עם הווידאו
12. **שואב תוכן** – כשמשולב עם lesson-builder, שואב אוטומטית מהמצגת

### דוגמה מלאה

ראה: `docs/lessons/hair-growth/video.html` – סרטון על מחזוריות צמיחת השיער עם:
- מוזיקה dance/EDM 140 BPM (Em→C→G→D)
- אנימציות: שערות צומחות, זקיקים, שערות נושרות, ספרקלים
- 10 סצנות × ~5 שניות = ~50 שניות
