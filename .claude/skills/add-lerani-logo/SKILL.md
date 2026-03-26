---
name: add-lerani-logo
description: הוספת לוגו לרני אוטומטית לכל תוצר HTML — מצגת, דף, אינפוגרפיקה, שאלון. הפעל אוטומטית בכל יצירת HTML חדש או עדכון תוצר קיים, אלא אם המשתמשת ביקשה אחרת.
---

# הוספת לוגו לרני לתוצרים

**כלל ברזל:** כל תוצר HTML חייב לכלול את הלוגו של לרני למעלה מימין, אלא אם מייטל אמרה במפורש "בלי לוגו".

## הלוגו

SVG inline — לוגו מלא עם כיתוב, צבעים מלאים, רקע לבן:

```html
<!-- Lerani Logo — top right -->
<div class="lerani-logo" style="position: fixed; top: 16px; right: 16px; z-index: 9999; width: 120px; pointer-events: none;">
  <svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ll-lg" cx="40%" cy="40%" r="60%"><stop offset="0%" stop-color="#a8c8f0"/><stop offset="50%" stop-color="#7babd4"/><stop offset="100%" stop-color="#5a93c0"/></radialGradient>
      <radialGradient id="ll-rg" cx="60%" cy="40%" r="60%"><stop offset="0%" stop-color="#a8e6cf"/><stop offset="50%" stop-color="#7dd4ac"/><stop offset="100%" stop-color="#5abf92"/></radialGradient>
      <linearGradient id="ll-og" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#7babd4" stop-opacity="0.6"/><stop offset="100%" stop-color="#7dd4ac" stop-opacity="0.6"/></linearGradient>
      <filter id="ll-sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#1e3a5f40"/></filter>
      <filter id="ll-tg"><feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur"/><feFlood flood-color="#ffffff" flood-opacity="0.5" result="color"/><feComposite in="color" in2="blur" operator="in" result="glow"/><feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <clipPath id="ll-cr"><circle cx="218" cy="78" r="72"/></clipPath>
    </defs>
    <circle cx="142" cy="78" r="72" fill="url(#ll-lg)" opacity="0.8" filter="url(#ll-sh)"/>
    <circle cx="218" cy="78" r="72" fill="url(#ll-rg)" opacity="0.8" filter="url(#ll-sh)"/>
    <circle cx="142" cy="78" r="72" fill="url(#ll-og)" clip-path="url(#ll-cr)" opacity="0.5"/>
    <circle cx="142" cy="78" r="72" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.35"/>
    <circle cx="218" cy="78" r="72" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.35"/>
    <g opacity="0.5"><path d="M180 6 L181.5 11 L186.5 12.5 L181.5 14 L180 19 L178.5 14 L173.5 12.5 L178.5 11 Z" fill="#7babd4"/><path d="M82 62 L83.5 65 L86.5 66.5 L83.5 68 L82 71 L80.5 68 L77.5 66.5 L80.5 65 Z" fill="#a8c8f0"/><path d="M278 55 L279.5 58 L282.5 59.5 L279.5 61 L278 64 L276.5 61 L273.5 59.5 L276.5 58 Z" fill="#a8e6cf"/></g>
    <text x="180" y="90" text-anchor="middle" font-family="'Poppins', 'Segoe UI', sans-serif" font-size="44" font-weight="700" fill="#1e3a5f" letter-spacing="2" filter="url(#ll-tg)">Lerani</text>
    <text x="180" y="172" text-anchor="middle" font-family="'Heebo', 'Segoe UI', sans-serif" font-size="15" font-weight="400" fill="#4a6a8a" letter-spacing="1.5" opacity="0.9" direction="rtl">חינוך · בינה מלאכותית · הגשמת חלומות</text>
    <line x1="100" y1="184" x2="260" y2="184" stroke="url(#ll-og)" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
  </svg>
</div>
```

## התאמה לפי סוג תוצר

| סוג תוצר | position | width | הערות |
|-----------|----------|-------|-------|
| דף נחיתה / אתר | `fixed` | `120px` | נשאר במקום בגלילה |
| מצגת (שקפים) | `absolute` | `100px` | בתוך כל שקף |
| אינפוגרפיקה | `absolute` | `100px` | בתוך ה-container |
| שאלון | `fixed` | `100px` | נשאר במקום |
| רילס (9:16) | `absolute` | `80px` | קטן יותר |

## במצגות (שקפים)

כשהלוגו בתוך שקף, צריך להוסיף אותו **בתוך כל slide div**:

```html
<div class="slide">
  <!-- Lerani logo in slide -->
  <div style="position: absolute; top: 12px; right: 12px; width: 100px; pointer-events: none; z-index: 10;">
    <!-- SVG code here -->
  </div>
  <!-- slide content -->
</div>
```

## חשוב

- ה-ID-ים של הלוגו מתחילים ב-`ll-` כדי לא להתנגש עם ID-ים אחרים בדף
- `pointer-events: none` — הלוגו לא חוסם לחיצות
- `z-index: 9999` — הלוגו תמיד מעל הכל
- אם יש כבר לוגו אורט בית הערבה — להוסיף את לרני בנוסף, לא במקום
- **אם מייטל אומרת "בלי לוגו" — לא להוסיף**
