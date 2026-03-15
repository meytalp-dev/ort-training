---
name: create-reels
description: יצירת סרטון רילס קצר (Remotion) על כלי דיגיטלי או חידוש AI.
---

# Skill: יצירת סרטוני רילס – /create-reels

כאשר המשתמש מבקש **ליצור סרטון רילס קצר** על כלי דיגיטלי או חידוש AI – הסקיל הזה מופעל.

---

## קלט

- תוכן מ-`/ai-expert` (מסמך חקר כלי / חידוש AI)
- פריימים מ-`/extract-frames` (תמונות מצילומי מסך)
- או: נושא חופשי ("תעשה רילס על Canva AI")

---

## פלט

סרטון MP4 ב-3 פורמטים:

| פורמט | יחס | שימוש |
|--------|------|-------|
| 9:16 | 1080x1920 | TikTok, Instagram Reels, YouTube Shorts |
| 1:1 | 1080x1080 | Instagram Feed, Facebook |
| 16:9 | 1920x1080 | YouTube, אתר |

---

## שפת מותג Lerani – Brand Language

### צבעים
- **כחול ראשי:** #7babd4 (עיגול שמאלי בלוגו)
- **ירוק ראשי:** #7dd4ac (עיגול ימני בלוגו)
- **כהה:** #1e3a5f (טקסט)
- **בהיר:** #f8fafb (רקע)
- **gradient:** linear-gradient(135deg, #7babd4, #5abf92)

### פונטים
- **כותרות:** Poppins Bold (אנגלית) / Secular One (עברית)
- **טקסט:** Heebo (עברית) / Rubik (עברית חלופי)

### לוגו
- שני עיגולים חופפים (כחול + ירוק)
- טקסט "Lerani" בפונט Poppins 700
- תגית: "חינוך · בינה מלאכותית · הגשמת חלומות"
- SVG: `docs/assets/lerani-logo.svg`

### אינטרו (2 שניות)
- הופעת שני העיגולים באנימציה
- טקסט "Lerani" מתגלה
- צליל עדין (swoosh)

### אאוטרו (3 שניות)
- לוגו Lerani במרכז
- "עקבו לעוד טיפים" / "Follow for more"
- כפתורי רשתות חברתיות

### סגנון תוכן
- **מהיר** – כל פריים 3-5 שניות
- **טקסט על מסך** – עברית, גדול, ברור
- **מוזיקה** – ביטים אנרגטיים אך לא אגרסיביים
- **tone:** צעיר, מקצועי, לא ילדותי – מתאים לנוער בתיכון
- **CTA:** קריאה לפעולה בסוף (עקבו / שתפו / נסו בעצמכם)

---

## מבנה סרטון (60 שניות)

```
0-2s    אינטרו Lerani (לוגו + סאונד)
2-5s    Hook – "הידעתם ש...?" / "הכלי הזה ישנה לכם את החיים"
5-45s   תוכן – 4-6 טיפים/צעדים עם צילומי מסך
45-52s  תוצאה – "ככה זה נראה בסוף!"
52-57s  CTA – "נסו בעצמכם! קישור בביו"
57-60s  אאוטרו Lerani
```

---

## טכנולוגיה – ffmpeg

**נתיב ffmpeg:**
```
/c/Users/USER/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin/ffmpeg.exe
```

### יצירת סרטון מתמונות + טקסט

```bash
FFMPEG="..."

# שלב 1: יצירת קליפ מכל תמונה (4 שניות, עם טקסט)
"$FFMPEG" -loop 1 -i frame.jpg -t 4 \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=#1e3a5f,\
  drawtext=text='הטקסט כאן':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=h-200:font=Heebo" \
  -c:v libx264 -pix_fmt yuv420p clip_01.mp4

# שלב 2: חיבור קליפים
"$FFMPEG" -f concat -safe 0 -i clips.txt -c copy output.mp4

# שלב 3: הוספת מוזיקה
"$FFMPEG" -i output.mp4 -i music.mp3 \
  -filter_complex "[1:a]volume=0.3[bg];[bg]afade=t=out:st=57:d=3[aout]" \
  -map 0:v -map "[aout]" -shortest final.mp4
```

### Transitions בין פריימים

```bash
# Fade transition
"$FFMPEG" -i clip1.mp4 -i clip2.mp4 \
  -filter_complex "[0][1]xfade=transition=fade:duration=0.5:offset=3.5" \
  merged.mp4
```

---

## שמירה

```
docs/training/{tool-name}/
├── reel-9x16.mp4
├── reel-1x1.mp4
└── reel-16x9.mp4
```

---

## שילוב באתר

כל עמוד הדרכה מקבל **כפתור רילס**:

```html
<a href="reel-9x16.mp4" class="reel-button" download>
  🎬 צפו בסרטון קצר
</a>
```

---

## כללים

- **אורך מקסימלי:** 60 שניות (TikTok) / 90 שניות (Reels)
- **אורך מומלץ:** 30-45 שניות
- **טקסט:** עברית, גדול, קריא גם בנייד
- **כתוביות:** חובה (אנשים צופים בלי קול)
- **מוזיקה:** royalty-free בלבד
- **ברנדינג:** לוגו Lerani באינטרו + אאוטרו
- **CTA:** תמיד לסיים עם קריאה לפעולה
