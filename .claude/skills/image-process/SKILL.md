---
name: image-process
description: עיבוד תמונות מצילומי מסך – חצים, הדגשות, זום, GIF.
---

# Skill: עיבוד תמונות – /image-process

כאשר יש צורך **לעבד תמונות מצילומי מסך** – הוספת חצים, הדגשות, זום, או יצירת GIF – הסקיל הזה מופעל.

---

## קלט

- תמונות JPG/PNG מתוך `/extract-frames`
- הנחיות: מה להדגיש, לאן לכוון, מה לזום

---

## יכולות

### 1. Annotations – סימונים על תמונה

שימוש ב-ffmpeg להוספת סימונים:

```bash
FFMPEG="..."

# הוספת טקסט
"$FFMPEG" -i input.jpg -vf "drawtext=text='לחצו כאן':fontsize=28:fontcolor=red:x=100:y=200" output.jpg

# הוספת מלבן הדגשה
"$FFMPEG" -i input.jpg -vf "drawbox=x=100:y=150:w=300:h=80:color=red@0.4:t=3" output.jpg
```

### 2. Zoom – הגדלה של אזור

```bash
# חיתוך אזור ספציפי (crop) והגדלה
"$FFMPEG" -i input.jpg -vf "crop=400:300:100:200,scale=800:600" zoomed.jpg
```

### 3. GIF מצעדים

```bash
# יצירת GIF מרצף תמונות
"$FFMPEG" -framerate 0.5 -i frame_%03d.jpg -vf "scale=800:-1" steps.gif
```

### 4. השוואה לפני/אחרי

```bash
# חיבור שתי תמונות זו לצד זו
"$FFMPEG" -i before.jpg -i after.jpg -filter_complex "[0][1]hstack=inputs=2" comparison.jpg
```

---

## פלט

תמונות מעובדות בתיקייה:

```
temp-frames/processed/
├── step_01_annotated.jpg
├── step_02_zoomed.jpg
├── step_03_annotated.jpg
└── steps_animation.gif
```

---

## שימוש מתוך CSS במצגת

התמונות המעובדות משתלבות במצגת דרך ה-classes הקיימים:

```html
<!-- תמונה בודדת -->
<div class="slide-image">
  <img src="data:image/jpeg;base64,..." alt="שלב 1">
  <div class="image-caption">לחצו על כפתור "צור עיצוב חדש"</div>
</div>

<!-- זוג תמונות (לפני/אחרי) -->
<div class="image-pair">
  <div class="slide-image"><img src="..." alt="לפני"></div>
  <div class="slide-image"><img src="..." alt="אחרי"></div>
</div>
```

---

## הערות

- כל התמונות מומרות ל-base64 ומוטמעות ב-HTML (self-contained)
- גודל מקסימלי מומלץ לתמונה: 800x600
- GIF מומלץ רק ל-3-5 פריימים (גודל קובץ)
- ניקוי `temp-frames/processed/` אחרי שילוב במצגת
