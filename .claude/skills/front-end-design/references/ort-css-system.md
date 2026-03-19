# ORT CSS Design System – קוד מלא

CSS מלא לכל תוצר HTML של אורט בית הערבה.
העתק את הקוד הרלוונטי לפי הצורך.

---

## CSS Custom Properties – בסיס

```css
:root {
  /* Colors – ORT Palette */
  --bg: #F0F4F8;
  --card: #fff;
  --primary: #2A9D8F;
  --primary-dark: #1a7a6d;
  --primary-light: #3CC5B5;
  --accent: #E9C46A;
  --accent-dark: #D4A93A;
  --text: #0F172A;
  --muted: #64748B;
  --border: #E2E8F0;
  --success: #059669;
  --success-bg: #D1FAE5;
  --warn: #D97706;
  --warn-bg: #FEF3C7;
  --danger: #DC2626;
  --danger-bg: #FEE2E2;

  /* Radius */
  --radius: 18px;

  /* Layered Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
  --shadow-md: 0 4px 16px rgba(0,0,0,.06), 0 2px 4px rgba(0,0,0,.04);
  --shadow-lg: 0 12px 40px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.04);
  --shadow-xl: 0 20px 60px rgba(0,0,0,.1), 0 8px 20px rgba(0,0,0,.06);

  /* Glass */
  --glass: rgba(255,255,255,.7);
  --glass-border: rgba(255,255,255,.3);
}
```

### Dark Mode

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0F172A;
    --card: rgba(30,41,59,.8);
    --text: #F1F5F9;
    --muted: #94A3B8;
    --border: #334155;
  }
}
```

---

## Glassmorphism

```css
.glass-card {
  background: rgba(255,255,255,.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,.6);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}
/* Light mode: bg-white/80 minimum – לא bg-white/10 */
```

---

## אנימציות

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px) }
  to { opacity: 1; transform: translateY(0) }
}
@keyframes fadeIn {
  from { opacity: 0 }
  to { opacity: 1 }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px) }
  to { opacity: 1; transform: translateX(0) }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(.85) }
  to { opacity: 1; transform: scale(1) }
}
@keyframes gradient-shift {
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(42,157,143,.3) }
  50% { box-shadow: 0 0 0 8px rgba(42,157,143,0) }
}
@keyframes float {
  0%, 100% { transform: translateY(0) }
  50% { transform: translateY(-6px) }
}
@keyframes shimmer {
  0% { background-position: -200% 0 }
  100% { background-position: 200% 0 }
}
```

**שימוש:**
- כניסה: `animation: fadeInUp .5s ease backwards`
- Staggered: `animation-delay: .05s, .1s, .15s...`
- דיאלוגים: `scaleIn .3s ease`
- פאנלים: `slideInRight .3s ease`

### CSS Native Scroll Animations (2024)

```css
@keyframes reveal {
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-on-scroll {
  animation: reveal linear;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}
```

### IntersectionObserver (Fallback)

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.animation = 'fadeInUp .5s ease forwards';
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
```

---

## Header

```css
.header {
  background: linear-gradient(135deg, #1a7a6d 0%, #2A9D8F 30%, #3CC5B5 60%, #2A9D8F 100%);
  background-size: 300% 300%;
  animation: gradient-shift 8s ease infinite;
  position: sticky; top: 0; z-index: 50;
  box-shadow: 0 4px 24px rgba(26,122,109,.25);
}
.header::before {
  content: '';
  position: absolute; inset: 0;
  background:
    radial-gradient(circle at 20% 50%, rgba(255,255,255,.12), transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(233,196,106,.08), transparent 50%);
  pointer-events: none;
}
```

---

## כרטיסים

```css
/* רמה 1 – בסיסי */
.card {
  background: rgba(255,255,255,.9);
  backdrop-filter: blur(12px);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(226,232,240,.6);
  transition: box-shadow .3s, border-color .3s;
}
.card:hover {
  box-shadow: var(--shadow-md);
  border-color: rgba(42,157,143,.12);
}

/* רמה 2 – אינטראקטיבי */
.card-interactive {
  cursor: pointer;
  transition: all .4s cubic-bezier(.4,0,.2,1);
}
.card-interactive:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: var(--shadow-xl);
}
.card-interactive::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--primary-light), var(--accent));
  opacity: 0;
  transition: opacity .3s;
}
.card-interactive:hover::before { opacity: 1 }

/* רמה 3 – KPI */
.kpi-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--primary-light));
  opacity: .6;
}
.kpi-card .num {
  font-size: 2rem; font-weight: 800;
  background: linear-gradient(135deg, var(--primary-dark), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## כפתורים

```css
.btn {
  padding: 9px 20px;
  border-radius: 11px;
  border: none;
  font-family: Heebo;
  font-weight: 600;
  cursor: pointer;
  transition: all .25s cubic-bezier(.4,0,.2,1);
  position: relative;
  overflow: hidden;
}
.btn::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(rgba(255,255,255,.15), transparent);
  opacity: 0;
  transition: opacity .2s;
}
.btn:hover::after { opacity: 1 }
.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  box-shadow: 0 2px 8px rgba(42,157,143,.25);
}
.btn-primary:hover {
  box-shadow: 0 4px 16px rgba(42,157,143,.35);
  transform: translateY(-1px);
}
```

---

## טבלאות

```css
.tbl { width: 100%; border-collapse: separate; border-spacing: 0; }
.tbl th {
  background: linear-gradient(180deg, #E0F5F1, #D4F3EF);
  color: var(--primary-dark);
  padding: 12px 14px;
  font-weight: 600;
  border-bottom: 2px solid rgba(42,157,143,.15);
}
.tbl th:first-child { border-radius: 0 12px 0 0 }
.tbl th:last-child { border-radius: 12px 0 0 0 }
.tbl td { padding: 11px 14px; border-bottom: 1px solid var(--border); transition: background .2s; }
.tbl tr:hover td { background: rgba(42,157,143,.03) }
```

---

## שדות טפסים

```css
input, select, textarea {
  padding: 9px 14px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-family: Heebo;
  background: #fff;
  transition: all .2s;
}
input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(42,157,143,.1);
}
```

---

## רקע – לא שטוח לעולם

```css
/* Gradient עדין */
body::before {
  content: '';
  position: fixed; top: 0; left: 0; right: 0;
  height: 400px;
  background: linear-gradient(135deg,
    #E0F5F1 0%, #D4F3EF 25%,
    #F0F4F8 50%, #FEF9EE 75%,
    #F0F4F8 100%);
  z-index: -1;
  opacity: .7;
}

/* דפוס נקודות */
.dot-bg {
  background-image: radial-gradient(circle, rgba(42,157,143,.06) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* Mesh gradient */
.mesh-bg {
  background:
    radial-gradient(at 20% 30%, rgba(42,157,143,.15) 0%, transparent 50%),
    radial-gradient(at 80% 70%, rgba(233,196,106,.1) 0%, transparent 50%),
    radial-gradient(at 50% 50%, rgba(60,197,181,.05) 0%, transparent 70%);
}
```

---

## מודלים ו-Overlays

```css
.overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,.5);
  backdrop-filter: blur(4px);
  z-index: 100;
  animation: fadeIn .2s ease;
}
.modal {
  background: rgba(255,255,255,.97);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  box-shadow: var(--shadow-xl);
  animation: fadeInUp .3s ease;
}
```

---

## Micro-Interactions

```css
.icon:hover { transform: scale(1.1) rotate(-3deg) }
.badge-urgent { animation: pulse-glow 2s infinite }
.skeleton {
  background: linear-gradient(90deg, var(--border) 25%, rgba(255,255,255,.5) 50%, var(--border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}
```

---

## נגישות

```css
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  border-radius: 4px;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
::selection {
  background: rgba(42,157,143,.15);
  color: var(--text);
}
```

---

## Scrollbar

```css
::-webkit-scrollbar { width: 6px; height: 6px }
::-webkit-scrollbar-track { background: transparent }
::-webkit-scrollbar-thumb { background: rgba(42,157,143,.2); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(42,157,143,.35) }
```

---

## Typography Scale

| Element | Size | Weight |
|---------|------|--------|
| Hero | 2rem | 800 |
| Page title | 1.5rem | 800 |
| Section | 1.3rem | 700 |
| Card title | 1.05rem | 700 |
| Body | .87rem | 400 |
| Small | .78rem | 400 |
| Tiny/Badge | .72rem | 500 |

---

## Responsive

```css
@media (max-width: 900px) {
  .container { padding: 16px }
  .split { grid-template-columns: 1fr }
  .kpi-grid { grid-template-columns: repeat(2, 1fr) }
}
@media (max-width: 600px) {
  .container { padding: 12px }
  .header { padding: 14px 16px }
  .nav { overflow-x: auto }
  .card-body { padding: 14px }
}
```

---

## Color Coding

| צבע | משתנה | שימוש |
|------|--------|-------|
| טורקיז | `--primary` | פעולות ראשיות, CTA |
| זהב | `--accent` | הדגשות |
| ירוק | `--success` | הצלחה, פעיל |
| כתום | `--warn` | אזהרה, ממתין |
| אדום | `--danger` | שגיאה, דחוף |
| כחול | `#DBEAFE/#1E40AF` | מידע |
| סגול | `#EDE9FE/#6D28D9` | אירועים |
