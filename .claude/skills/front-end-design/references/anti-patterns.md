# Anti-Patterns – מה להימנע

## "AI Slop" – הסימנים

תוצר HTML שנראה כמו "AI עשה אותו" מכיל:

| סימן | במקום |
|------|-------|
| Inter / Roboto / Arial | פונט מובחן לפי קונטקסט |
| Purple gradient על לבן | Palette ייחודית לנושא |
| Uniform 8px rounded corners בכל מקום | radius שונה לפי hierarchy |
| 5 צבעים מפוזרים שווה | dominant + sharp accent |
| `transition: all` | `transition: color .2s, transform .2s` |
| `box-shadow: 0 2px 4px rgba(0,0,0,.1)` | layered shadows |
| אימוג'י כאייקוני ממשק | SVG inline גיאומטרי |
| solid white background | gradient / mesh / dot pattern |
| כל element באותו scale | היררכיה ויזואלית ברורה |
| micro-interactions מפוזרות | page-load אחד מתוזמר |

---

## CSS Anti-Patterns

```css
/* ❌ NEVER */
transition: all .3s;                    /* → אנמ' כבדה על כל property */
animation: all .5s;
width/height בתוך transition;           /* → jank */
font-family: "Inter, sans-serif";       /* → גנרי */
background: #ffffff;                    /* → שטוח */
box-shadow: 0 2px 4px rgba(0,0,0,.1);  /* → weak, single layer */
border-radius: 4px;                     /* → מינימום 10px */
user-scalable=no;                       /* → accessibility violation */

/* ✓ INSTEAD */
transition: color .2s, transform .25s cubic-bezier(.4,0,.2,1);
background: linear-gradient(...) / radial-gradient(...);
box-shadow: var(--shadow-sm);           /* layered */
border-radius: var(--radius);           /* consistent token */
```

---

## Layout Anti-Patterns

| ❌ | ✓ |
|----|---|
| 3 עמודות שוות תמיד | Bento grid אסימטרי |
| תוכן מוסתר מאחורי navbar קבוע | padding-top לפי גובה navbar |
| container widths שונים בכל section | max-width אחיד |
| navbar צמודה לקצה | floating עם spacing |

---

## שפה – AI Writing Patterns

**אסור לכתוב בממשק:**
- "pivotal", "crucial", "vital", "testament"
- "seamless", "robust", "cutting-edge", "groundbreaking"
- "leverage", "multifaceted", "foster", "realm"
- "-ing phrases": "ensuring reliability", "showcasing features", "highlighting capabilities"
- "delve into", "tapestry"

**במקום:** קונקרטי, פשוט, פעיל.

| ❌ | ✓ |
|----|---|
| "Explore our robust platform" | "ניהול בתי ספר" |
| "Seamlessly integrate data" | "חיבור אוטומטי לגיליון" |
| "Leverage cutting-edge AI" | "מייצר שאלות ב-3 שניות" |
| "Ensuring reliability" | "עובד תמיד, גם offline" |

**כללי Strunk:**
- משפט פעיל (לא סביל)
- חיובי לא שלילי
- קונקרטי לא מעורפל
- גזור מילים מיותרות
- מילה חזקה בסוף המשפט

---

## אנימציות Anti-Patterns

| ❌ | ✓ |
|----|---|
| Scroll hijacking | enhance scroll, לא להחליף |
| אנימציות מכל מקום | page-load אחד מתוזמר |
| `animation-duration: 1.5s+` | 150-300ms |
| לא בודק `prefers-reduced-motion` | תמיד לבדוק |
| animating `top/left/width/height` | `transform/opacity` בלבד |

---

## Glass Cards Anti-Patterns

```css
/* ❌ Light mode – לא נראה */
background: rgba(255,255,255,.1);
border: 1px solid rgba(255,255,255,.1);

/* ✓ Light mode – גלוי */
background: rgba(255,255,255,.85);
border: 1px solid rgba(255,255,255,.6);
```

---

## D3 / Charts Anti-Patterns

```javascript
/* ❌ */
.style("font-family", "Inter, sans-serif")
.attr("fill", "steelblue")  // ← hardcoded, לא מה-theme

/* ✓ */
.style("font-family", "var(--font-body)")
.attr("fill", "var(--primary)")
```
