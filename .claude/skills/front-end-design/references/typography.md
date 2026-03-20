# Typography – בחירת פונטים

## כלל ברזל

**אל תבחר Inter, Roboto, Open Sans, Lato, Arial.** הם גנריים ומסמנים "AI slop".

בחר פונט אחד מובחן ושתמש בו בכוונה.

---

## ספריית הפונטים של מייטל (ברירת מחדל!)

**כלל: תמיד להשתמש בפונטים של מייטל. לא Heebo/Rubik לבד!**

קבצי TTF: `fonts/` (בתיקיית הסקיל)

### פונטי כתב יד (לכותרות, ציטוטים, הדגשות)
- **Playpen Sans Hebrew** – כתב יד ילדי, חם, variable (Google Fonts)
- **Cafe** – כתב יד חופשי וקליל (מקומי)
- **Dybbuk** – כתב יד דרמטי ואמנותי (מקומי)
- **Petel Bold** – כתב יד עגלגל ורך (מקומי)

### פונטי כותרות (רשמי / חזק)
- **Antiochus Bold** – serif קלאסי וחגיגי (מקומי)
- **Shuneet3 Square Bold** – sans מרובע וחזק (מקומי)

### פונט גוף טקסט
- **Shuneet3 Medium** – sans מודרני ונקי (מקומי)
- **Heebo** – fallback, כפתורים, ממשק (Google Fonts)

### טעינה ב-HTML
```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Playpen+Sans+Hebrew:wght@100;300;400;500;700;800&family=Heebo:wght@300;400;700;800&display=swap" rel="stylesheet">

<!-- פונטים מקומיים -->
<style>
@font-face { font-family: 'Cafe'; src: url('fonts/Cafe.ttf') format('truetype'); font-display: swap; }
@font-face { font-family: 'Dybbuk'; src: url('fonts/Dybbuk.ttf') format('truetype'); font-display: swap; }
@font-face { font-family: 'Petel'; src: url('fonts/Petel Bold.ttf') format('truetype'); font-display: swap; }
@font-face { font-family: 'Antiochus'; src: url('fonts/Antiochus Bold.ttf') format('truetype'); font-display: swap; }
@font-face { font-family: 'Shuneet3'; src: url('fonts/Shuneet3 Medium.ttf') format('truetype'); font-display: swap; }
@font-face { font-family: 'Shuneet3 Square'; src: url('fonts/Shuneet3 Square Bold.ttf') format('truetype'); font-display: swap; }
</style>
```

### בחירת פונט לפי הקשר

| הקשר | כותרת | כותרת משנה | גוף |
|------|--------|------------|------|
| **Warm / הזמנות / מורים** | Playpen Sans Hebrew 700 | Cafe | Heebo 400 |
| **מצגת לימודית / שיעור** | Shuneet3 Square Bold | Petel Bold | Shuneet3 Medium |
| **דרמטי / היסטוריה / ספרות** | Antiochus Bold | Dybbuk | Heebo 400 |
| **טכני / דשבורד** | Heebo 800 | Heebo 400 | Heebo 300 |

---

## Font Pairings לתוכן באנגלית / בינלאומי

### Code / Tech
- **JetBrains Mono** + **Space Grotesk**
- אווירה: precision, developer, modern
- weight contrast: 200 לגוף / 800 לכותרות

### Editorial / Academic
- **Playfair Display** + **Source Sans 3**
- אווירה: classical, trustworthy, depth
- weight contrast: 400 לגוף / 700 לכותרות

### Distinctive / Bold
- **Bricolage Grotesque** + **IBM Plex Sans**
- אווירה: contemporary, confident, unique
- weight contrast: 300 לגוף / 900 לכותרות

### Warm / Educational
- **Newsreader** + **Rubik**
- אווירה: approachable, clear, human
- weight contrast: 400 לגוף / 700 לכותרות

### Dark / Dramatic
- **Crimson Pro** + **Space Grotesk**
- אווירה: cinematic, serious, intense

---

## עיקרון ה-Contrast

**Extremes work. Middle doesn't.**

- weight 100/200 לגוף vs weight 800/900 לכותרות ✓
- weight 400 לגוף vs weight 600 לכותרות ✗ (לא מספיק הבדל)
- size jump: 3x+ ✓ (body 1rem → hero 3rem)
- size jump: 1.5x ✗ (לא מרגיש כלום)

---

## Google Fonts Load Pattern

```html
<!-- טען רק weights שאתה משתמש בהם -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@300;800&family=IBM+Plex+Sans:wght@400;500&display=swap" rel="stylesheet">
```

---

## Typography Scale

```css
:root {
  --font-hero: clamp(2.5rem, 6vw, 4.5rem);
  --font-h1: clamp(1.8rem, 4vw, 2.5rem);
  --font-h2: clamp(1.3rem, 2.5vw, 1.8rem);
  --font-h3: 1.2rem;
  --font-body: 1rem;       /* מינימום 16px על מובייל */
  --font-small: 0.875rem;
  --font-tiny: 0.75rem;
}
```

## Line Height

- גוף טקסט: `line-height: 1.6-1.75`
- כותרות: `line-height: 1.1-1.2`
- שורת טקסט: מקסימום 65-75 תווים (45ch-75ch)

```css
.prose { max-width: 65ch; line-height: 1.7; }
```
