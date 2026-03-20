# Meytal's Design Preferences

Based on inspiration images collected 2026-03-19.

---

## Core Aesthetic: Warm Botanical / Stationery

Meytal's preferred design language is **warm, organic, personal** - NOT corporate/tech.
Think: Canva stationery templates, teacher planners, handcrafted feel.

**IMPORTANT: מייטל לא אוהבת רקע כהה (dark mode). תמיד ללכת על רקעים בהירים/חמים.**

---

## Key Principles (from inspiration analysis)

### 1. Background: Warm, Not Clinical
- Cream / beige / off-white (#F5F0E8, #FFF8F0, #FFFBF5) - NOT pure white (#FFF)
- Paper texture feel (subtle noise or grain)
- Watercolor wash gradients as section backgrounds

### 2. Color Palette: Soft Watercolor
- Soft pink (#F4C2C2, #E8A0BF)
- Light teal/mint (#B5D8CC, #A8D8EA)
- Warm gold/ochre (#D4A574, #E8C547)
- Sage green (#A8B5A0, #C5D5C5)
- Dusty rose (#D4A0A0)
- Always muted/pastel - never saturated neon

### 3. Botanical Elements
- Floral corners, leaf decorations, branch dividers
- Used as accent/framing - not overwhelming
- Can be implemented as SVG overlays or CSS pseudo-elements
- Watercolor-style blobs as section backgrounds

### 4. Typography: ספריית הפונטים של מייטל

**כלל ברזל: להשתמש בפונטים של מייטל – לא בפונטים גנריים!**

קבצי הפונטים: `fonts/` (באותה תיקייה של הסקיל)
דף תצוגה: `fonts/preview.html`

| פונט | סוג | זמינות | מתאים ל |
|------|------|--------|---------|
| **Playpen Sans Hebrew** | כתב יד ילדים | Google Fonts | כותרות חמות, דפי פתיחה, הזמנות, חומרי הורים |
| **Cafe** | כתב יד חופשי | מקומי (TTF) | כותרות משעשעות, יצירה, פוסטרים, לא-פורמלי |
| **Dybbuk** | כתב יד דרמטי | מקומי (TTF) | כותרות דרמטיות, היסטוריה, ספרות, ציטוטים |
| **Petel Bold** | כתב יד עגלגל | מקומי (TTF) | כותרות רכות, תוכן למורים, חגים |
| **Antiochus Bold** | Serif קלאסי | מקומי (TTF) | כותרות רשמיות, תעודות, מסמכים חגיגיים |
| **Shuneet3 Medium** | Sans מודרני | מקומי (TTF) | גוף טקסט נקי, מצגות, ממשקים |
| **Shuneet3 Square Bold** | Sans מרובע | מקומי (TTF) | כותרות חזקות, באנרים, כפתורים |

**שילובים מומלצים:**

1. **Warm Botanical** (הזמנות, מורים, ספר בי"ס):
   - כותרת: Playpen Sans Hebrew 700
   - כותרת משנה: Cafe
   - גוף: Heebo 400

2. **מצגת לימודית** (שקפים לשיעור):
   - כותרת: Shuneet3 Square Bold
   - כותרת משנה / הדגשה: Petel Bold
   - גוף: Shuneet3 Medium

3. **דרמטי** (היסטוריה, ספרות, אירועים):
   - כותרת: Antiochus Bold
   - כותרת משנה: Dybbuk
   - גוף: Heebo 400

**טעינת פונטים מקומיים ב-HTML:**
```css
@font-face {
  font-family: 'Cafe';
  src: url('fonts/Cafe.ttf') format('truetype');
  font-display: swap;
}
```
**טעינת Playpen Sans Hebrew (Google Fonts):**
```html
<link href="https://fonts.googleapis.com/css2?family=Playpen+Sans+Hebrew:wght@100;300;400;500;700;800&display=swap" rel="stylesheet">
```

- Weight contrast חשוב: light body vs bold titles

### 5. Layout: Notebook/Planner Feel
- Rounded corners (20px+)
- Spiral binding visual metaphor
- Soft borders (not sharp 1px lines)
- Cards that feel like "pages" or "sticky notes"

### 6. Badges & Tags
- Pill-shaped with soft colored backgrounds
- Holiday icons with illustrated style (not flat emoji)
- Color-coded categories with warm palette

### 7. Overall Atmosphere
- Personal, not institutional
- Handmade feel, not machine-generated
- Educational but warm
- "Teacher's desk" vibe, not "admin dashboard"

---

## When to Apply

**IMPORTANT: Always ask Meytal which style she wants!**

This style is NOT always appropriate. Ask before applying:
- "את רוצה את הסגנון שלך (warm/botanical) או סגנון מודרני/טכנולוגי?"

### Good fit for:
- Teacher-facing tools (planners, handbooks)
- Parent communication
- Event invitations
- Lesson materials
- School handbook

### Less suitable for:
- Data dashboards (needs clarity over warmth)
- Technical tools (quiz builder, game builder)
- Public-facing marketing (needs more "wow")
- Admin systems with dense data

---

## CSS Quick Reference

```css
/* Meytal's Warm Palette */
--bg: #FFF8F0;
--card: #FFFDF8;
--primary: #7AADAD; /* warm teal */
--primary-dark: #5E9191;
--accent: #D4A574; /* warm gold */
--accent-pink: #E8A0BF;
--accent-sage: #A8B5A0;
--text: #4A3F35; /* warm dark brown, not black */
--muted: #8B7E74;
--border: #E8DDD0; /* warm border */

/* Warm shadows */
--shadow-sm: 0 2px 8px rgba(74,63,53,.06);
--shadow-md: 0 4px 20px rgba(74,63,53,.08);

/* Watercolor background blob */
.watercolor-blob {
  background: radial-gradient(ellipse, rgba(232,160,191,.12), transparent 70%);
}
```
