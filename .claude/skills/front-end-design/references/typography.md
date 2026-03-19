# Typography – בחירת פונטים

## כלל ברזל

**אל תבחר Inter, Roboto, Open Sans, Lato, Arial.** הם גנריים ומסמנים "AI slop".

בחר פונט אחד מובחן ושתמש בו בכוונה.

---

## לפרויקט ORT (ברירת מחדל)

```html
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;800;900&family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">
```

- **Heebo** – כותרות, כפתורים, מספרים (RTL מצוין)
- **Rubik** – גוף טקסט, תוויות

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
