---
name: extract-frames
description: חילוץ תמונות מפתח מהקלטת מסך (MP4).
---

# Skill: חילוץ תמונות מהקלטה – /extract-frames

כאשר המשתמש **מעלה הקלטת מסך** (MP4) ורוצה לחלץ ממנה תמונות מפתח – הסקיל הזה מופעל.

---

## קלט

- קובץ MP4 (הקלטת מסך מ-Windows Game Bar או כלי אחר)
- מיקום ברירת מחדל: `C:\Users\USER\Videos\Captures\`

---

## תהליך

### שלב 1: זיהוי הקובץ
- חיפוש קבצי MP4 בתיקיית Captures
- אם יש מספר קבצים – שואלים את המשתמש איזה קובץ
- אם יש קובץ אחד חדש – משתמשים בו

### שלב 2: יצירת תיקיית פריימים
```bash
mkdir -p temp-frames
```

### שלב 3: חילוץ פריימים עם ffmpeg

**נתיב ffmpeg:**
```
/c/Users/USER/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin/ffmpeg.exe
```

**פקודת חילוץ (פריים כל 5 שניות):**
```bash
FFMPEG="/c/Users/USER/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin/ffmpeg.exe"

"$FFMPEG" -i "{input.mp4}" -vf "fps=1/5" -q:v 2 temp-frames/frame_%03d.jpg
```

**אופציות חילוץ:**
| שיטה | פקודה | מתי להשתמש |
|-------|-------|------------|
| כל 5 שניות | `fps=1/5` | ברירת מחדל – טוב לרוב ההקלטות |
| כל 3 שניות | `fps=1/3` | הקלטה קצרה או מהירה |
| כל 10 שניות | `fps=1/10` | הקלטה ארוכה (מעל 5 דקות) |

### שלב 4: ניתוח פריימים
- קריאת כל הפריימים (Read tool)
- זיהוי מה מוצג בכל פריים
- סיווג: מסך פתיחה / צעד / תוצאה / חוזר
- סינון כפילויות

### שלב 5: בחירת פריימי מפתח
- בחירת 10-15 פריימים מייצגים
- כתיבת תיאור לכל פריים: מספר צעד, כותרת, תיאור
- יצירת מסמך JSON עם רשימת הפריימים הנבחרים

---

## פלט

```json
{
  "tool": "canva-ai",
  "totalFrames": 33,
  "selectedFrames": [
    {
      "file": "frame_001.jpg",
      "step": 1,
      "title": "חיפוש קנבה",
      "description": "נכנסים לגוגל ומחפשים 'קנבה AI'"
    }
  ]
}
```

---

## הערות טכניות

- **-vsync deprecated**: ffmpeg מזהיר שזה deprecated, להשתמש ב-`-fps_mode` במקום
- **pixel format**: אם יש שגיאת "Non full-range YUV" – להוסיף `format=yuvj420p`
- **scene detection**: `select='gt(scene,0.3)'` לא תמיד עובד טוב – עדיף `fps=1/N`
- **ניקוי**: אחרי שהפריימים שולבו במצגת – למחוק את `temp-frames/`

---

## דוגמת שימוש

```
משתמש: "הקלטתי את המסך של Canva"
→ חיפוש MP4 ב-Captures
→ חילוץ 33 פריימים (fps=1/5)
→ ניתוח: 14 פריימי מפתח נבחרו
→ פלט: JSON עם רשימת הפריימים + תיאורים
→ מעביר ל-/create-presentation או /create-reels
```
