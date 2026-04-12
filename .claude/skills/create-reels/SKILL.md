---
name: create-reels
description: יצירת סרטון רילס WOW בסגנון Greg Isenberg — Remotion, אנימציות פיזיקליות, כרטיסיות חיות, particles, glassmorphism.
---

# Skill: יצירת סרטוני רילס WOW — /create-reels

סרטון רילס (30-90 שניות, מומלץ 45-60) על כלי דיגיטלי, חידוש AI, או כל נושא — ברמת WOW שגורמת לאנשים לעצור לגלול.

**מגבלות פלטפורמה:** Instagram/Facebook Reels עד 90 שניות, YouTube Shorts עד 60, TikTok עד 10 דקות. Sweet spot: 45-60 שניות.

---

## כלל עליון — לא שיווקי אלא אם נאמר אחרת

> **ברירת מחדל: רילס הכרת כלי / טיפ / הדגמה.**
> המטרה היא להכיר את הכלי, להראות מה הוא עושה, לתת ערך.
> **לא** לפתוח עם "נמאס לכם?" / "מחפשים פתרון?" / "הצטרפו עכשיו!" — זה שיווקי.
> רילס שיווקי נבנה **רק אם מייטל אומרת במפורש** "שיווקי" / "קמפיין" / "מכירה".

### פתיחה נכונה (ברירת מחדל):
- "בואו נכיר היום את [שם הכלי]" + ספירה לאחור / אנימציית כניסה
- "[שם הכלי] מבית [חברה]" — הצגה ענייניית
- "טיפ מהיר ל-[שם הכלי]"

### פתיחה שגויה (רק אם ביקשו שיווקי):
- "נמאס לכם לבזבז זמן?"
- "בניתם קמפיין היום?"
- CTA אגרסיבי בתחילת הסרטון

---

## עקרון מנחה

> **כרטיסיות הן שחקנים, לא מיכלים.**
> אלמנטים יוצאים, מתפוצצים, מתארגנים, בורחים. כל סצנה מספרת סיפור.
> לא סתם slides שמחליקות — **דרמה בכל מעבר**.

---

## שלב 0א — חקר הכלי (חובה לפני הכל!) — סוכן חוקר

**לא מתחילים לעצב לפני שמבינים את הכלי לעומק.** סוכן החוקר רץ כאן — חוקר, מצליב, מאמת עובדות.

### 1. הבנת הכלי

- **מה הכלי עושה בפועל** — לא שורה אחת גנרית. להבין את ה-flow: מה מכניסים, מה עוברים, מה מקבלים
- **מה היתרונות המרכזיים** — מה מייחד אותו מכלים אחרים בתחום
- **טיפים חשובים** — מה עושה את ההבדל בין שימוש בסיסי לשימוש מקצועי
- **למי זה מתאים** — לא להגיד, **להראות דרך תוצרים** (דף נחיתה לעסק = יזמים, קמפיין שיווקי = שיווק, מערך שיעור = מורים)

### מקורות חקר:

```bash
# 1. חיפוש מצגות הדרכה קיימות
ls docs/training/{tool-name}/ 2>/dev/null

# 2. חיפוש טיוטות ותוצרים
ls _drafts/*{tool-name}* 2>/dev/null

# 3. חיפוש תוכן בקוד
grep -r "{tool-name}" docs/ _drafts/ --include="*.html" -l 2>/dev/null
```

- אם יש מצגת הדרכה — לקרוא אותה, היא מקור התוכן העיקרי
- להשתמש ב-`/ai-expert` או `/perplexity-search` למידע עדכני אם צריך

### 2. איסוף תמונות

**כל ריל חייב screenshots ותוצרים — לא רק טקסט על כרטיסיות.**

```bash
# חיפוש screenshots קיימים
ls docs/training/{tool-name}/screenshots/ 2>/dev/null
ls _drafts/{tool-name}-screenshots/ 2>/dev/null
ls _drafts/screenshots/*{tool-name}* 2>/dev/null
```

**מה צריך:**
- **2-4 screenshots מהכלי** — ממשק, תהליך עבודה, תוצאה
- **1-2 תוצרים** — מה *יצא* מהכלי (דף נחיתה, קמפיין, עיצוב)
- תמונות נכנסות לתיקיית `public/screenshots/` בפרויקט הריל
- בסצנות משתמשים ב-`<Img src={staticFile("screenshots/filename.png")} />` להצגה

**אם אין screenshots** — לבקש ממייטל או ליצור עם הכלי עצמו לפני בניית הריל.

### 3. סיכום חקר — להציג למייטל

```
╔══════════════════════════════════════════════════════════════╗
║  חקר כלי: [שם הכלי]                                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  מה הכלי עושה:                                               ║
║  [2-3 משפטים — ה-flow האמיתי]                                ║
║                                                              ║
║  3 יתרונות מרכזיים:                                          ║
║  1. [יתרון + למה זה חשוב]                                    ║
║  2. ...                                                      ║
║  3. ...                                                      ║
║                                                              ║
║  טיפים:                                                      ║
║  - [טיפ 1]                                                   ║
║  - [טיפ 2]                                                   ║
║                                                              ║
║  תמונות זמינות:                                              ║
║  - screenshot-1.png — [תיאור]                                ║
║  - screenshot-2.png — [תיאור]                                ║
║  - output-1.png — [תוצר: מה נוצר]                            ║
║                                                              ║
║  מה חסר (צריך ממייטל / צריך ליצור):                          ║
║  - [...]                                                     ║
╚══════════════════════════════════════════════════════════════╝
```

**רק אחרי שמייטל מאשרת את החקר — עוברים לשלב המתכון.**

---

## שלב 0ב — מתכון ייחודי (חובה לפני כל ריל!)

**כל ריל חייב להיות שונה מקודמיו.** לפני בנייה, הסקיל:

### 1. סורק רילים קיימים

```bash
# בודק אילו פתיחות/אפקטים/תבניות כבר השתמשנו בהם
ls _drafts/*-reel/src/scenes/CategoryScene.tsx 2>/dev/null
```

### 2. בונה מתכון מ-3 קוביות

| קובייה | אפשרויות | הכלל |
|---------|----------|------|
| **פתיחה** | Energy Pulse / Typing Reveal / Countdown Slam / Photo Zoom / Split Reveal | לא לחזור על פתיחה שהייתה ב-2 הרילים האחרונים |
| **Hook** | 3D Card Flip / Slide Up+Glow / Slam+Bounce / Particle Converge | לא אותו hook כמו הריל הקודם |
| **3 פיצ'רים** | Button Escape / Messy→Organized / Cursor Drag / 3D Card Flip / Typewriter Build / Morph Transform | כל פיצ'ר חייב אנימציה **שונה** מהשניים האחרים |
| **Benefits** | Pill BIG→Shrink / Stack Build / Orbit | rotation בין השלושה |
| **Summary** | Number Slam / Quote Card / Before/After Split | לא אותו כמו הריל הקודם |
| **CTA** | Photo+Social / Card+QR / Fullscreen Gradient | rotation בין השלושה |
| **תבנית** | כלי AI / טיפ יומי / השוואה / סטוריטלינג / רשימה | לפי סוג התוכן (לא אקראי) |

### 3. מציג למייטל לפני בנייה

```
╔══════════════════════════════════════════════════════════════╗
║  מתכון ריל: [שם הכלי]                                       ║
╠══════════════════════════════════════════════════════════════╣
║  תבנית:    כלי AI חדש                                        ║
║  פתיחה:    Countdown Slam (3→2→1→שם)                         ║
║  צבע:      #7B2FBE (סגול Canva)                              ║
║                                                              ║
║  פיצ'ר 1:  Morph Transform — עיגול→כרטיסיה                   ║
║            "עיצוב מצגת תוך 30 שניות"                         ║
║  פיצ'ר 2:  Cursor Drag — סמן גורר תמונה לתוך הקנבס          ║
║            "גוררים תמונה — והוא מעצב סביבה"                  ║
║  פיצ'ר 3:  Typewriter Build — 3 שורות נכתבות                 ║
║            "כותבים prompt — מקבלים סרטון"                     ║
║                                                              ║
║  Benefits: 3 pills (זמן / איכות / קלות)                      ║
║  Summary:  "3" + 3 אייקונים עפים                             ║
║  CTA:      תמונה + Learni                                    ║
║                                                              ║
║  מה חדש כאן (לעומת הריל הקודם):                              ║
║  ✓ פתיחת Countdown במקום Energy Pulse                        ║
║  ✓ Morph Transform (לא היה בשום ריל)                         ║
║  ✓ פלטת סגולים במקום כתומים                                  ║
╚══════════════════════════════════════════════════════════════╝

מתאים? או רוצה לשנות משהו?
```

### 4. שומר את המתכון

אחרי אישור, שומר בתוך הפרויקט:

```
_drafts/{tool-name}-reel/RECIPE.md
```

```markdown
# Recipe: Canva AI Reel
- Date: 2026-04-02
- Template: AI Tool
- Opener: Countdown Slam
- Hook: Particle Converge
- Feature 1: Morph Transform
- Feature 2: Cursor Drag
- Feature 3: Typewriter Build
- Benefits: Stack Build
- Summary: Before/After Split
- CTA: Fullscreen Gradient
- Color: #7B2FBE (Canva purple)
- Previous reel: Claude Code (Energy Pulse / 3D Flip / Button Escape+Messy→Org+Cursor Drag / Pill BIG / Number Slam / Photo+Social)
```

זה מאפשר לסרוק בפעם הבאה ולהבטיח גיוון.

### מטריצת גיוון — מה משתנה בין רילים

| ממד | אפשרויות | הכלל |
|------|----------|------|
| **פתיחה** | 5 סוגים | לא לחזור על 2 אחרונים |
| **Hook** | 4 סוגים | לא אותו כמו קודם |
| **3 פיצ'רים** | 6 סוגים (בוחרים 3) | כל 3 שונים זה מזה |
| **Benefits** | 3 סוגים | rotation |
| **Summary** | 3 סוגים | לא אותו כמו קודם |
| **CTA** | 3 סוגים | rotation |
| **פלטת צבעים** | לפי כלי | כתום, סגול, כחול, ירוק... |
| **כיוון כניסה** | ימין/שמאל/למעלה/למטה/scale | מגוון בתוך הריל |
| **Particles** | צבעי blobs/orbs לפי הכלי | מיקומים שונים |
| **מוזיקה** | טראק שונה | לכל ריל |

### כמה קומבינציות?

5 פתיחות × 4 hooks × 20 פיצ'רים (C(6,3)) × 3 benefits × 3 summaries × 3 CTAs × 10+ צבעים = **~108,000 שילובים ייחודיים**

**לעולם לא ייצא אותו ריל פעמיים.**

---

## קלט

- תוכן מ-`/ai-expert` (חקר כלי)
- פריימים מ-`/extract-frames` (צילומי מסך)
- נושא חופשי ("תעשה רילס על Canva AI")

---

## פלט

פרויקט Remotion מלא + MP4 מרונדר:

| פורמט | יחס | שימוש |
|--------|------|-------|
| 9:16 | 1080x1920 | TikTok, Reels, Shorts |
| 1:1 | 1080x1080 | Instagram Feed, Facebook |
| 16:9 | 1920x1080 | YouTube, אתר |

---

## טכנולוגיה — Remotion (React)

### Setup

```bash
# פרויקט חדש (או שימוש בקיים)
_drafts/{tool-name}-reel/

# package.json dependencies
"remotion": "^4.0.441"
"@remotion/cli": "^4.0.441"
"@remotion/transitions": "^4.0.443"
"@remotion/google-fonts": "^4.0.441"
"react": "^19.2.4"
"typescript": "^6.0.2"
```

### מבנה תיקיות

```
_drafts/{tool-name}-reel/
├── src/
│   ├── Root.tsx              # Composition definitions
│   ├── fonts.ts              # Font loading (Google + local)
│   ├── {ToolName}Reel.tsx    # Main reel component
│   ├── styles.ts             # Design tokens + colors
│   ├── Particles.tsx         # Background particle system
│   ├── GregCard.tsx          # Reusable card component
│   ├── Icons.tsx             # Custom SVG icons
│   └── scenes/
│       ├── CategoryScene.tsx  # Opener
│       ├── HookScene.tsx      # Hook
│       ├── Feature1Scene.tsx  # Feature scenes...
│       ├── BenefitsScene.tsx  # Benefits
│       ├── SummaryScene.tsx   # Summary
│       └── CTAScene.tsx       # Call to action
├── public/
│   ├── PlaypenSansHebrew.ttf
│   ├── meytal.jpeg
│   └── music.mp3
├── package.json
├── remotion.config.ts
└── tsconfig.json
```

### Root.tsx — Composition

```tsx
import { Composition } from "remotion";
import "./fonts";
import { ToolNameReel } from "./ToolNameReel";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="ToolNameReel"
    component={ToolNameReel}
    durationInFrames={1100}  // ~36.5s at 30fps
    fps={30}
    width={1080}
    height={1920}
  />
);
```

### Render

```bash
npx remotion render ToolNameReel out/reel-9x16.mp4

# 1:1
npx remotion render ToolNameReel out/reel-1x1.mp4 --width 1080 --height 1080

# 16:9
npx remotion render ToolNameReel out/reel-16x9.mp4 --width 1920 --height 1080
```

---

## מבנה סרטון — 8 סצנות

| # | סצנה | משך | פריימים (30fps) | מה קורה |
|---|-------|------|-----------------|---------|
| 1 | **Category** | 3s | 90 | פתיחה דרמטית — פיצוץ אנרגיה / typing / countdown |
| 2 | **Hook** | 4s | 120 | כרטיסיה מתהפכת חושפת שם הכלי + tagline |
| 3-5 | **3 Features** | 5s x3 | 150 x3 | כל פיצ'ר עם אנימציה ייחודית |
| 6 | **Benefits** | 10s | 300 | pills נכנסים BIG, קוראים, מתכווצים |
| 7 | **Summary** | 3.5s | 105 | מספר ענק + אייקונים עפים |
| 8 | **CTA** | 3.5s | 105 | תמונה + שם + לינקים |

**סה"כ:** ~39s גולמי - 70 frames חפיפת crossfade = **~36.5s** = 1100 frames

### Main Reel Component

```tsx
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

export const ToolNameReel: React.FC = () => {
  const crossfade = 10;
  return (
    <AbsoluteFill style={{ backgroundColor: STYLE.bg }}>
      <Audio src={staticFile("music.mp3")} volume={0.2} />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={90}>
          <CategoryScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />
        {/* ... repeat for each scene ... */}
      </TransitionSeries>
      {/* Learni watermark */}
      <div style={{
        position: "absolute", top: 40, right: 40,
        fontFamily: STYLE.fontHeading, fontSize: 22,
        color: "rgba(42,31,26,0.15)", zIndex: 100,
      }}>Learni</div>
    </AbsoluteFill>
  );
};
```

---

## 5 סוגי פתיחות (Category Scene)

בחר את הפתיחה המתאימה לסוג התוכן:

### 1. Energy Pulse (ברירת מחדל — WOW מקסימלי)
נקודה צבעונית פועמת → מתכווצת → **פיצוץ** עם screen shake + 20 חלקיקים → טקסט מתפרץ ענק (scale 4→1)

```tsx
// Dot pulses (frame 0-20)
const dotPulse = 1 + Math.sin(frame / 3) * 0.15;
// Dot shrinks before explosion (frame 20-26)
const dotShrink = interpolate(frame, [20, 26], [1, 0.3], { extrapolateRight: "clamp" });
// EXPLOSION (frame 26+)
const flashOpacity = interpolate(frame, [26, 28, 34], [0, 0.5, 0], { extrapolateRight: "clamp" });
// Screen shake
const shakeX = frame >= 26 && frame <= 34
  ? Math.sin(frame * 12) * (34 - frame) * 2 : 0;
// Text BURSTS out (frame 28+)
const textScale = spring({ frame: Math.max(0, frame - 28), fps,
  from: 4, to: 1, config: { damping: 5, mass: 0.3, stiffness: 180 } });
// Sparkles around text (frame 34+)
```

**מתאים ל:** כלי AI חדש, חידוש מפתיע, "ידעתם?"

### 2. Typing Reveal
סמן מהבהב → אותיות מופיעות אחת-אחת בגופן כתב יד → סימן שאלה קופץ

```tsx
const typedChars = Math.floor(interpolate(frame, [8, 60], [0, text.length], {
  extrapolateRight: "clamp" }));
const visibleText = text.slice(0, typedChars);
// Cursor blinks
const cursorOpacity = Math.sin(frame / 4) > 0 ? 1 : 0;
```

**מתאים ל:** טיפ, שאלה, "מכירים את...?"

### 3. Countdown Slam
3 → 2 → 1 → מילה (כל מספר slam in עם flash)

```tsx
const numbers = [3, 2, 1];
numbers.forEach((num, i) => {
  const slamFrame = i * 20;
  const scale = spring({ frame: Math.max(0, frame - slamFrame), fps,
    from: 6, to: 1, config: { damping: 4, mass: 0.2 } });
  const flash = interpolate(frame, [slamFrame, slamFrame+2, slamFrame+6], [0, 0.3, 0]);
});
```

**מתאים ל:** השוואות, "3 דברים ש...", רשימות

### 4. Photo Zoom
תמונה של מייטל מתקרבת → blur → טקסט מופיע מעל

```tsx
const photoScale = interpolate(frame, [0, 60], [1, 1.4], { extrapolateRight: "clamp" });
const blurAmount = interpolate(frame, [20, 40], [0, 8], { extrapolateRight: "clamp" });
const textOpacity = interpolate(frame, [40, 50], [0, 1], { extrapolateRight: "clamp" });
```

**מתאים ל:** סטוריטלינג, ניסיון אישי, "אתם לא תאמינו..."

### 5. Split Reveal
שני חצאים (שמאל/ימין) מתפצלים וחושפים תוכן באמצע

```tsx
const splitX = spring({ frame: Math.max(0, frame - 10), fps,
  from: 0, to: 540, config: { damping: 8, mass: 0.6 } });
// Left half: translateX(-splitX)
// Right half: translateX(splitX)
// Content in center: opacity fades in after split
```

**מתאים ל:** לפני/אחרי, השוואה, "הבדל אחד ש..."

---

## אנימציות סצנות פיצ'ר — 6 סיפורי כרטיסיה

כל פיצ'ר מקבל **סיפור ייחודי** — לא סתם slide in:

### 1. Button Escape (כפתור בורח)
כרטיסיה עם כפתור → כפתור רועד → **בורח** למעלה → **מתפוצץ** → כרטיסיה חדשה ב-3D

```tsx
// Button shakes (frame 30-42)
const btnShake = frame >= 30 && frame < 42
  ? Math.sin(frame * 4) * 8 * Math.min(1, (frame - 30) / 6) : 0;
// Escapes upward (frame 42+)
const btnY = spring({ from: 0, to: -400, config: { damping: 6, mass: 0.4 } });
const btnRotate = spring({ from: 0, to: -20 });
// Explosion particles (frame 52+)
// New card with 3D rotation (frame 62+)
const card2RotateY = spring({ from: -30, to: 0, config: { damping: 10, mass: 0.8 } });
```

### 2. Messy → Organized (בלגן מתארגן)
כרטיסיה עם pills מפוזרים → מתארגנים → Z's צפים (שינה) → כרטיסיה מתמלאת

```tsx
// Pills at messy positions
const x = messyX + (cleanX - messyX) * organizeProgress;
const y = messyY + (cleanY - messyY) * organizeProgress;
const r = messyR + (cleanR - messyR) * organizeProgress;
// Z's float up during organize
const zY = -(frame - zDelay) * speed;
const zX = Math.sin((frame - zDelay) / 5) * 25;
```

### 3. Cursor Drag (סמן גורר תוכן)
כרטיסיה ריקה → סמן יוצא ממנה → לוחץ + ripples → גורר בלוק תוכן → מכניס חזרה

```tsx
// Cursor path
const cursorPhase = interpolate(frame, [8, 18, 22, 30, 40], [0, 1, 1.5, 2, 3]);
const cursorX = interpolate(cursorPhase, [0, 1, 1.5, 2, 3], [540, 900, 900, 900, 540]);
// Click ripples — 3 rings with stagger
const ripples = [0, 3, 6].map(delay => ({
  scale: spring({ from: 0.5, to: 3.5, config: { damping: 18, mass: 1.2 } }),
  opacity: interpolate(frame, [start, start+10], [0.35, 0]),
}));
```

### 4. 3D Card Flip (כרטיסיה מתהפכת)
גב כרטיסיה (gradient צבעוני + אייקון) → מתהפכת 180 מעלות → חזית (glassmorphism + תוכן)

```tsx
const flipProgress = spring({ from: 0, to: 180, config: { damping: 12, mass: 0.8 } });
const showFront = flipProgress > 90;
const rotateY = showFront ? flipProgress - 180 : flipProgress;
// perspective: 1200 on parent
// backfaceVisibility: "hidden" on card
// Flash on flip completion
```

### 5. Typewriter Build (בנייה שורה-שורה)
כרטיסיה ריקה → שורות מופיעות אחת-אחת עם אנימציית הקלדה → checkmark בסוף

```tsx
const lines = ["שורה 1", "שורה 2", "שורה 3"];
lines.forEach((line, i) => {
  const lineStart = 10 + i * 25;
  const chars = Math.floor(interpolate(frame, [lineStart, lineStart + 20], [0, line.length]));
  const checkScale = spring({ frame: Math.max(0, frame - lineStart - 22), fps,
    from: 0, to: 1, config: { damping: 3, stiffness: 400 } });
});
```

### 6. Morph Transform (מורפינג)
צורה גיאומטרית → מתמרפת לצורה אחרת → לכרטיסיה

```tsx
const morphProgress = interpolate(frame, [0, 30], [0, 1]);
const borderRadius = interpolate(morphProgress, [0, 0.5, 1], ["50%", "30%", `${cardRadius}px`]);
const width = interpolate(morphProgress, [0, 0.5, 1], [200, 500, 900]);
const height = interpolate(morphProgress, [0, 0.5, 1], [200, 300, 500]);
```

---

## Hook Scene — 4 וריאציות

### Hook A: 3D Card Flip (ברירת מחדל)
גב כרטיסיה (gradient + אייקון כלי) → מתהפכת 180 מעלות → חזית עם שם הכלי + subtitle יוצא מלמטה

```tsx
const flipProgress = spring({ from: 0, to: 180, config: { damping: 12, mass: 0.8 } });
// Flash on flip, glow behind card, subtitle emerges from below
```

### Hook B: Slide Up + Glow
כרטיסיה עולה מלמטה עם glow ring שמתפשט מאחוריה

```tsx
const cardY = spring({ from: 600, to: 0, config: { damping: 8 } });
const glowScale = spring({ from: 0.5, to: 2, config: { damping: 15 } });
// Ring of light expands behind card as it rises
```

### Hook C: Slam + Bounce
שם הכלי slam in ענק (scale 8→1) עם screen shake + כרטיסיה מתרכבת מסביבו

```tsx
const nameScale = spring({ from: 8, to: 1, config: { damping: 4, mass: 0.2, stiffness: 250 } });
// Screen shake on landing, then card builds around the text
```

### Hook D: Particle Converge
חלקיקים מפוזרים → מתכנסים למרכז → מתגבשים לצורת הלוגו/שם הכלי

```tsx
const convergeProgress = interpolate(frame, [0, 40], [0, 1]);
particles.forEach(p => {
  p.x = p.startX + (centerX - p.startX) * convergeProgress;
  p.y = p.startY + (centerY - p.startY) * convergeProgress;
});
// Flash when fully converged, text appears
```

---

## Benefits Scene — 3 וריאציות

### Benefits A: Pill BIG→Shrink (ברירת מחדל)
Pills נכנסים BIG (1.3) למרכז → קוראים → מתכווצים (0.92) למקומם

```tsx
const pills = [
  { enterFrame: 28, shrinkFrame: 60, settledY: -300 },
  { enterFrame: 66, shrinkFrame: 98, settledY: -30 },
  { enterFrame: 104, shrinkFrame: 136, settledY: 240 },
];
// Enter: spring from 0 to 1.3
// Shrink: spring from 1.3 to 0.92 + moveY to settledY
// Tagline at end: scale 2.5→1
```

### Benefits B: Stack Build
כרטיסיות נערמות אחת על השנייה (כמו חפיסת קלפים) — כל אחת נוחתת עם bounce קל

```tsx
const cards = benefits.map((b, i) => {
  const landFrame = 20 + i * 35;
  const y = spring({ from: -800, to: i * 8, config: { damping: 6, mass: 0.4 } }); // stack offset
  const rotate = spring({ from: -15 + i * 10, to: i * 2 - 2 }); // slight fan
  // Each card lands with a mini flash + the stack shifts down slightly
});
```

### Benefits C: Orbit
3 כרטיסיות מסתובבות בטבעת (כמו קרוסלה 3D) — כל אחת עוצרת במרכז לקריאה

```tsx
const activeIndex = Math.floor(interpolate(frame, [0, 90, 180, 270], [0, 1, 2, 2]));
cards.forEach((card, i) => {
  const angle = ((i - activeIndex) / 3) * Math.PI * 2;
  const x = Math.sin(angle) * 300;
  const z = Math.cos(angle) * 300;
  const scale = z > 0 ? 1.1 : 0.7; // front card is bigger
  const opacity = z > 0 ? 1 : 0.4;
});
```

---

## Summary Scene — 3 וריאציות

### Summary A: Number Slam (ברירת מחדל)
מספר ענק slam in (scale 5→1) + flash → 3 אייקונים עפים מכיוונים שונים → מתיישבים בשורה

```tsx
const numScale = spring({ from: 5, to: 1, config: { damping: 5, mass: 0.3, stiffness: 200 } });
// Icons: fly in BIG from random directions, spin, shrink to row
// Bottom text appears: "X מצבים. 0 התערבות."
```

### Summary B: Quote Card
כרטיסיה אלגנטית עם ציטוט מרכזי (גופן כתב יד) + מרכאות גדולות מונפשות

```tsx
const quoteScale = spring({ from: 0.5, to: 1, config: { damping: 8 } });
// Giant quotation marks (" ") fly in from sides
// Quote text typewriter effect
// Author name fades in below
```

### Summary C: Before/After Split
מסך מתחלק — שמאל (לפני, אדום/אפור) וימין (אחרי, ירוק/accent) — עם מספרים

```tsx
const splitProgress = spring({ from: 0, to: 1 });
// Left: "לפני" + "3 שעות" in gray
// Right: "אחרי" + "30 שניות" in accent with glow
// Divider line animates down
```

---

## CTA Scene — 3 וריאציות

**חובה בכל CTA:** שורה "עקבו אחרי ברשתות החברתיות" + אייקוני רשתות (Facebook, Instagram, LinkedIn)

### CTA A: Photo + Social (ברירת מחדל)
תמונה עגולה עם glow ring → שם בעברית → כפתור Learni.ai עם pulse → שורת social icons → "עקבו אחרי ברשתות החברתיות"

```tsx
// Photo: spring scale 0.3→1, glow ring scales 0.5→1.3
// Button: pulse = 1 + Math.sin(frame / 5) * 0.03
// Icons row: Facebook, Instagram, LinkedIn, Mail
// "עקבו אחרי ברשתות החברתיות"
// "הלינקים בתגובה הראשונה"
```

### CTA B: Card with QR
כרטיסיה גדולה עם תמונה בצד + QR code מונפש (נבנה פיקסל-פיקסל) + "סרקו עכשיו" + "עקבו אחרי ברשתות החברתיות"

```tsx
// Card slides in from bottom
// Photo on right side
// QR pixels appear in stagger animation (top-left to bottom-right)
// Glow pulse around QR
// Text: "סרקו והצטרפו"
// "עקבו אחרי ברשתות החברתיות" + icons row
```

### CTA C: Fullscreen Gradient
מסך מלא עם gradient מונפש (צבעים זזים) + טקסט גדול במרכז + כפתור פועם + "עקבו אחרי ברשתות החברתיות"

```tsx
const gradientAngle = frame * 2; // rotating gradient
// Background: linear-gradient with animated angle
// BIG text: "הצטרפו להדרכה" in white
// Button: "Learni.ai" with heavy glow + pulse
// Small: "מיטל פלג" + social icons row
// "עקבו אחרי ברשתות החברתיות"
```

---

## קומפוננטות בסיס (חובה בכל ריל)

### 1. Particles — רקע חי

**חובה בכל סצנה.** יוצר תחושת עומק וחיות.

```tsx
export const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {/* Liquid morphing blobs — SVG with quadratic curves */}
      {/* 2 blobs, 8 points each, radius varies by sin/cos(frame) */}
      {/* opacity: 0.22, filter: feGaussianBlur stdDeviation=50 */}

      {/* 6 Floating orbs */}
      {/* size: 35-60px, opacity: 0.18, glow shadow */}
      {/* drift: sin/cos(frame / speed) * distance */}
      {/* pulse: 1 + sin(frame / 8) * 0.15 */}

      {/* 4 Glowing rings */}
      {/* size: 100-180px, opacity: 0.14 */}
      {/* border: 2px solid accent, box-shadow glow */}

      {/* 5 Rotating diamonds */}
      {/* size: 16-24px, opacity: 0.14 */}
      {/* rotate: frame * 2 + offset */}

      {/* Bottom wave — SVG path animated by frame */}
      {/* opacity: 0.08 */}
    </>
  );
};
```

**גדלים קריטיים (מייטל לא רואה קטנים!):**
- orbs: **35-60px**, opacity **0.18**
- rings: **100-180px**, opacity **0.14**
- diamonds: **16-24px**, opacity **0.14**
- blobs: radius **300-350**, opacity **0.22**
- **אף אלמנט מתחת ל-opacity 0.12**

### 2. GregCard — כרטיסיה עם כניסה

```tsx
interface GregCardProps {
  children: React.ReactNode;
  width?: number;       // default 920
  dark?: boolean;       // dark or light card
  delay?: number;       // frame delay
  from?: "right" | "left" | "bottom" | "top" | "scale";
}

// Entry: spring from direction (800px offset) or scale (0.3→1)
// Opacity: interpolate [0, 8] → [0, 1]
// Float: Math.sin(frame / 15) * 4 — subtle constant bob
// Glassmorphism: background rgba(255,255,255,0.8) + backdropFilter blur(20px)
// Shadow: accent-tinted (e.g., rgba(217,119,87,0.12))
```

### 3. Icons — SVG מותאם

כל אייקון חייב להיות **SVG נקי** עם props של `size` ו-`color`:

```tsx
interface IconProps { size?: number; color?: string; }
// ShieldIcon, MoonIcon, MonitorIcon, ZapIcon, SparklesIcon
// + אייקונים ספציפיים לכלי (Canva, Gemini, etc.)
```

---

## עיצוב — Design Tokens

### צבעים — לפי כלי!

כל כלי מקבל פלטת צבעים משלו. הצבע הראשי הוא **צבע הכלי**.

```tsx
export const STYLE = {
  // Claude Code
  bg: "#FFF5EE",           // warm cream
  bgAlt: "#FFEDE0",
  card: "#FFFFFF",
  cardDark: "#2A1F1A",
  accent: "#D97757",       // ← THIS CHANGES PER TOOL
  accentLight: "#F0A47A",
  accentDark: "#B85C3E",
  teal: "#2CBAA0",         // secondary for contrast
  textDark: "#2A1F1A",
  textMuted: "#6A5A4A",
  textLight: "#FFFFFF",
  shadow: "0 12px 40px rgba(accent,0.12), 0 4px 12px rgba(0,0,0,0.06)",
  shadowHeavy: "0 20px 60px rgba(accent,0.2), 0 8px 24px rgba(0,0,0,0.08)",
  fontHeading: "'Rubik', sans-serif",
  fontBody: "'Heebo', sans-serif",
  cardRadius: 28,
  cardPadding: 48,
};
```

**צבעי כלים:**

| כלי | accent | bg |
|------|--------|----|
| Claude Code | `#D97757` | `#FFF5EE` (warm cream) |
| Canva | `#7B2FBE` | `#F9F5FF` (lavender) |
| Gemini | `#4285F4` | `#F0F6FF` (light blue) |
| ChatGPT | `#10A37F` | `#F0FDF9` (mint) |
| Gamma | `#FF6B35` | `#FFF5F0` (peach) |
| Notion | `#000000` | `#F7F6F3` (warm gray) |
| Perplexity | `#20808D` | `#F0FAFB` (cool cyan) |
| Google Flow | `#EA4335` | `#FFF5F5` (rose) |
| CapCut | `#00E5FF` | `#F0FDFF` (ice) |
| Default | `#6366F1` | `#F5F5FF` (indigo) |

**תמיד רקע בהיר/קרם/פסטלי. לא רקע כהה.**

### Background Style

```tsx
export const bgStyle: CSSProperties = {
  background: `linear-gradient(145deg, ${STYLE.bg} 0%, #FFF0E5 40%, ${STYLE.bgAlt} 100%)`,
  width: "100%", height: "100%",
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  fontFamily: STYLE.fontBody,
  direction: "rtl",
  overflow: "hidden",
};
```

### טיפוגרפיה

| רכיב | פונט | גודל | משקל |
|-------|------|-------|------|
| פתיחה (Category) | Playpen Sans Hebrew | 140px | 400 |
| כותרת אנגלית (שם כלי) | Rubik | 68-88px | 900 |
| תיאור עברי | Heebo | **44px מינימום** | 500 |
| Highlight עברי | Rubik | 36-44px | 700 |
| Badge (01, 02, 03) | Rubik | 24px | 700 |
| Benefits label | Rubik | 38px | 800 |
| Benefits text | Heebo | 34px | 500 |
| Tagline | Rubik | 40-56px | 800-900 |

**כללי ברזל:**
- עברית: **44px מינימום** (34px קטן מדי!)
- כותרות אנגליות: **68px מינימום**
- **פחות מילים, יותר גדולות** — סגנון Greg

### פונטים — Loading

```tsx
// fonts.ts
import { loadFont as loadRubik } from "@remotion/google-fonts/Rubik";
import { loadFont as loadHeebo } from "@remotion/google-fonts/Heebo";
import { staticFile } from "remotion";

loadRubik();
loadHeebo();

// Playpen Sans Hebrew — local
const playpenStyle = document.createElement("style");
playpenStyle.textContent = `
  @font-face {
    font-family: 'Playpen Sans Hebrew';
    src: url('${staticFile("PlaypenSansHebrew.ttf")}') format('truetype');
  }
`;
document.head.appendChild(playpenStyle);
```

---

## Glassmorphism — הסגנון המרכזי

כל כרטיסיה:

```tsx
{
  background: "rgba(255,255,255,0.8)",
  backdropFilter: "blur(20px)",
  borderRadius: 28,
  boxShadow: `0 20px 60px ${STYLE.accent}20, 0 0 1px rgba(255,255,255,0.6) inset`,
  border: "1px solid rgba(255,255,255,0.5)",
}
```

כרטיסיה כהה:

```tsx
{
  background: STYLE.cardDark,
  boxShadow: STYLE.shadowHeavy,
}
```

---

## אנימציות — Cheat Sheet

### Spring Physics (תנועה טבעית)

```tsx
// כניסה מהירה ומדויקת
spring({ frame, fps, from: 0, to: 1, config: { damping: 8, mass: 0.5 } })

// כניסה עם bounce
spring({ frame, fps, from: 0, to: 1, config: { damping: 4, mass: 0.2, stiffness: 300 } })

// כניסה כבדה ואיטית
spring({ frame, fps, from: 0, to: 1, config: { damping: 12, mass: 0.8 } })

// SLAM (גדול→קטן)
spring({ frame, fps, from: 5, to: 1, config: { damping: 5, mass: 0.3, stiffness: 200 } })
```

### Impact Effects

```tsx
// Screen shake
const shakeX = frame >= start && frame <= start + 8
  ? Math.sin(frame * 12) * (start + 8 - frame) * 2 : 0;
const shakeY = frame >= start && frame <= start + 8
  ? Math.cos(frame * 10) * (start + 8 - frame) * 1.5 : 0;

// Flash
const flash = interpolate(frame, [start, start+2, start+8], [0, 0.3, 0],
  { extrapolateRight: "clamp" });

// Explosion particles (12-20)
const particles = Array.from({ length: 20 }, (_, i) => {
  const angle = (i / 20) * Math.PI * 2;
  const distance = spring({ from: 0, to: 150 + (i % 4) * 100, config: { damping: 12, mass: 0.5 } });
  const opacity = interpolate(frame, [start, start+3, start+18], [0, 0.8, 0]);
  return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
});
```

### Continuous Effects

```tsx
// Float (constant subtle bob)
const floatY = Math.sin(frame / 14) * 5;

// Pulse (size breathe)
const pulse = 1 + Math.sin(frame / 5) * 0.03;

// Glow pulse
const glowIntensity = 0.2 + Math.sin(frame / 5) * 0.1;

// Twinkle (sparkles)
const twinkle = 0.4 + Math.sin((frame + offset) / 3) * 0.6;

// Dot pulse
const dotPulse = 1 + Math.sin(frame / 3) * 0.15;
```

---

## תבניות לפי סוג תוכן

### תבנית 1: כלי AI חדש (ברירת מחדל)
- **Category:** Energy Pulse + "ידעתם?"
- **Hook:** Card Flip → שם הכלי
- **Features:** 3 פיצ'רים עם Button Escape / Messy→Organized / Cursor Drag
- **Benefits:** 3 pills (מה זה נותן)
- **Summary:** מספר + אייקונים
- **CTA:** תמונה + Learni

### תבנית 2: טיפ יומי / Hack
- **Category:** Typing Reveal + "טיפ שיחסוך לכם שעות"
- **Hook:** לפני/אחרי (split screen)
- **Features:** 3 צעדים (Typewriter Build)
- **Benefits:** pill אחד BIG עם התוצאה
- **Summary:** "עכשיו תורכם"
- **CTA:** תמונה + Learni

### תבנית 3: השוואה / VS
- **Category:** Countdown Slam (3, 2, 1)
- **Hook:** שני כרטיסים נכנסים מצדדים
- **Features:** 3 קריטריונים — כל אחד מנפח את הכרטיס המנצח
- **Benefits:** "המנצח הוא..." עם confetti
- **Summary:** tagline
- **CTA:** "נסו בעצמכם"

### תבנית 4: סטוריטלינג / ניסיון אישי
- **Category:** Photo Zoom + "אתם לא תאמינו..."
- **Hook:** בעיה (כרטיסיה אדומה)
- **Features:** פתרון בשלבים (morph transform)
- **Benefits:** תוצאה (כרטיסיה ירוקה)
- **Summary:** "שינה לי את..."
- **CTA:** תמונה + Learni

### תבנית 5: 5 WOW / רשימה
- **Category:** Split Reveal + "5 דברים ש..."
- **Hook:** מספר ענק (5)
- **Features:** 5 pills שנכנסים BIG אחד-אחד (כמו Benefits אבל בתוכן)
- **Summary:** "איזה הכי הפתיע אתכם?"
- **CTA:** "כתבו בתגובות"

---

## מוזיקה

### סגנון
- Lo-fi / Chill Electronic — אנרגטי אבל לא אגרסיבי
- **120-140 BPM** — מתאים לקצב הסצנות
- Fade in 1 שנייה, fade out 2 שניות

### מקורות (royalty-free)
- Pixabay Music
- Mixkit
- YouTube Audio Library

### טכני

```tsx
<Audio src={staticFile("music.mp3")} volume={0.2} />
```

**Volume: 0.2** — מוזיקת רקע, לא דומיננטית. הריל צריך לעבוד גם בלי קול.

---

## RTL — בעיות ידועות

1. **טקסט אנגלי** חייב `direction: "ltr"` wrapper:
```tsx
<div style={{ direction: "ltr" }}>
  <span>Claude Code</span>
</div>
```

2. **סימן שאלה בעברית:** לכתוב `ידעתם?` ולא `?ידעתם`

3. **Encoding:** לוודא שתווים עבריים לא נשברים (UTF-8)

---

## קצב — הלקח הכי חשוב

**v1-v3 היו מהירים מדי.** כל סצנה צריכה מספיק זמן לקריאה.

| סצנה | זמן מינימלי |
|-------|-------------|
| Category (פתיחה) | 3 שניות |
| Hook | 4 שניות |
| פיצ'ר (עם אנימציה) | 5 שניות |
| Benefits (3 pills) | 10 שניות |
| Summary | 3.5 שניות |
| CTA | 3.5 שניות |
| Crossfade | 10 frames |

- **Pill BIG stage:** scale 1.3, נשאר ~1.5 שניות לקריאה, מתכווץ ל-0.92
- **אלמנטים שזזים** צריכים מספיק זמן לפני שהם זזים

---

## תוכן — כללי ברזל

1. **חובה screenshots ותוצרים** — כל ריל על כלי חייב להכיל תמונות מסך מהכלי עצמו ותוצרים שיצאו ממנו. טקסט על כרטיסיה לא מספיק — הצופה צריך *לראות* את הכלי בפעולה
2. **Show don't tell** — במקום לכתוב "מתאים ליזמים" → להראות תוצר של דף נחיתה לעסק. במקום "מתאים לשיווק" → להראות קמפיין שנוצר. התוצר מספר למי זה מתאים
3. **תוכן מדויק** — לא להגיד "צלם מוצרים" אם הכלי בונה קמפיינים. לחקור את הכלי לעומק לפני שכותבים תוכן (שלב 0א)
4. **חובה דוגמה קונקרטית** — לא "הוא רץ לבד" אלא "בנה לי דף נחיתה — ומקבלים אתר"
5. **לא לדבר רק על קוד** — קהל רחב! ניהול, יזמות, שיווק, חינוך
6. **CTA עם פעולה** — לא רק "Learni.ai" אלא "הצטרפו להדרכה" / לינקים
7. **שפה ידידותית** — "כאילו יושב לידכם" ולא "שולט במסך בלעדיכם"
8. **טיפים חשובים** — לשלב טיפ אחד לפחות שעושה את ההבדל בשימוש בכלי
9. **שם בעברית** — "מיטל פלג" ולא "Meytal Peleg" לקהל ישראלי

---

## טעויות לא לחזור עליהן

1. לא להתחיל מהיר ולהאט — **קצב נכון מההתחלה**
2. לא לשים אלמנטים באוויר בלי קונטקסט — **הכל על/מתוך כרטיסיה**
3. לא לכתוב "כרטיסיה ריקה" — **פשוט ריק**
4. לא opacity מתחת ל-0.12 לקישוטים — **לא רואים**
5. לא 34px לעברית — **מינימום 44px**
6. לא flash חוזר בכל סצנה — **לגוון מעברים**
7. לא תוכן כללי — **דוגמאות קונקרטיות**
8. לא ריל בלי screenshots — **כל ריל על כלי חייב תמונות מסך ותוצרים**
9. לא תוכן בלי חקר — **קודם שלב 0א (חקר הכלי), אחר כך עיצוב**
10. לא תיאורים שטוחים/גנריים — **להבין מה הכלי באמת עושה לפני שכותבים עליו**

---

## Branding — Lerani

מפורט ב-[lerani-brand-guide.md](lerani-brand-guide.md).

עיקרי:
- **אינטרו** (2s): שני עיגולים (כחול #7babd4 + ירוק #7dd4ac) מתחברים → "Lerani" מופיע
- **אאוטרו** (3s): לוגו + "עקבו לעוד טיפים"
- **Watermark:** "Learni" קטן ושקוף (opacity 0.15) בפינה ימנית עליונה

---

## שמירה

```
_drafts/{tool-name}-reel/     # פרויקט Remotion
_drafts/{tool-name}-reel/out/ # MP4 output

# אחרי אישור ופרסום:
docs/training/{tool-name}/
├── reel-9x16.mp4
├── reel-1x1.mp4
└── reel-16x9.mp4
```

---

## מערכת סוכנים — בקרת איכות לפני הצגה למייטל

**חובה:** אחרי בניית הריל, לפני הצגה למייטל — 5 סוכנים רצים ונותנים הצעות לשיפור. אני משפר לפי ההצעות, ורק אז מציג למייטל.

### סדר הסוכנים

| # | סוכן | סוג | מתי רץ | מה בודק |
|---|-------|------|---------|---------|
| 1 | **חוקר** | Agent (Explore/perplexity) | לפני הכל | חוקר את הכלי/נושא, מצליב עם תוכן קיים, מוודא עובדות |
| 2 | **תוכן** | Agent | אחרי חקר, לפני בנייה | כותב טקסט נגיש וידידותי, בודק עברית תקנית |
| 3 | **עיצוב ותמונות** | Agent | אחרי בנייה | בודק תמונות, זמני שקפים, שלא שיווקי |
| 4 | **מומחה רילס** | Agent | אחרי בנייה | Remotion תקין, אנימציות, RTL, פונטים, קצב |
| 5 | **הערכה** | Agent | אחרון | האם משיג מטרה, מובן, כדאי להכין |

### סוכן 1 — חוקר (רץ בשלב 0א)

**תפקיד:** חוקר את הכלי או הנושא לעומק כדי לתת מידע מהימן.

**מה עושה:**
- מחפש מצגות והדרכות קיימות בפרויקט (`docs/training/`, `_drafts/`)
- מצליב מידע עם מקורות חיצוניים (דרך `/perplexity-search` או `/ai-expert`)
- מוודא שעובדות, מספרים ושמות מדויקים
- אם יש תוכן קיים — בודק שהריל לא סותר אותו
- מציין מה חסר ומה צריך לאמת

**פלט:** דוח חקר עם עובדות מאומתות + רשימת דברים שצריך לתקן/להשלים

### סוכן 2 — תוכן (רץ אחרי חקר, לפני בנייה)

**תפקיד:** כותב את כל הטקסטים של הריל בצורה שבני אדם רגילים יבינו.

**מה עושה:**
- כותב טקסט פשוט, נגיש, ידידותי וקליל
- משפטים קצרים, מילים פשוטות
- בודק עברית תקנית — ניקוד, פיסוק, כתיב
- מוודא שהשפה לא אקדמית ולא שיווקית
- מתאים לקהל מגוון: מורים, מנהלים, יזמים, שיווק
- בודק שה-CTA אומר "עקבו אחרי ברשתות החברתיות"
- **בדיקת שיווקיות (קריטי!):**
  - פתיחה לא שיווקית — לא "נמאס לכם?", "מחפשים פתרון?", "הצטרפו עכשיו!"
  - פתיחה נכונה — "בואו נכיר את...", "טיפ מהיר ל-...", הצגה ענייניית
  - אין CTA אגרסיבי באמצע הסרטון
  - הטון מנגיש ידע, לא מוכר מוצר
  - אם מזהה משפט שיווקי — מסמן אותו ומציע חלופה ענייניית

**פלט:** טקסטים סופיים לכל סצנה + הערות שפה + דגלים על משפטים שיווקיים (אם נמצאו)

### סוכן 3 — עיצוב ותמונות (רץ אחרי בנייה)

**תפקיד:** מומחה ויזואלי — בודק שהכל נראה כמו שצריך.

**מה בודק:**
- תמונות תקינות ונראות — `<Img>` עם נתיבים נכונים, גדלים מתאימים
- screenshots מהכלי קיימים ונטענים
- זמני שקפים — מספיק זמן לקריאה (לפי טבלת הזמנים)
- שהריל **מנגיש ידע ולא משווק** — בודק פתיחה, שפה, CTA
- גדלי פונט — עברית 44px+, אנגלית 68px+
- opacity של קישוטים — לא מתחת ל-0.12
- רקע בהיר (לא כהה)

**פלט:** רשימת בעיות ויזואליות + הצעות תיקון

### סוכן 4 — מומחה רילס (רץ אחרי בנייה)

**תפקיד:** בודק שהריל תקין טכנית ועובד.

**מה בודק:**
- Remotion — קומפוננטות, imports, types תקינים
- אנימציות — spring, interpolate, timing נכונים
- RTL — `direction: "rtl"`, LTR wrapper לאנגלית
- פונטים — Rubik, Heebo, Playpen Sans Hebrew נטענים
- קצב — כל סצנה בזמן הנכון (לפי טבלת הזמנים)
- TransitionSeries — crossfades תקינים
- Particles — קיימים בכל סצנה
- מוזיקה — volume 0.2, קובץ קיים

**פלט:** רשימת בעיות טכניות + תיקונים מומלצים

### סוכן 5 — הערכה (רץ אחרון)

**תפקיד:** מבט-על — האם הריל משיג את מטרתו.

**מה בודק:**
- האם הסרטון **מובן** לצופה שלא מכיר את הכלי
- האם הוא **נותן ערך** — הצופה יוצא עם ידע חדש
- האם **כדאי להכין אותו** — הנושא מספיק מעניין ורלוונטי
- האם הקצב נכון — לא מהיר מדי, לא משעמם
- האם ה-CTA ברור — "עקבו אחרי ברשתות החברתיות"
- ציון כולל (1-10) והמלצות

**פלט:** ציון + 3 המלצות עיקריות לשיפור

### תהליך העבודה המלא

```
שלב 0א — סוכן חוקר רץ → דוח חקר
    ↓
שלב 0ב — סוכן תוכן כותב טקסטים → טקסטים מאושרים
    ↓
בנייה — Remotion, אנימציות, סצנות
    ↓
סוכן עיצוב + סוכן רילס (במקביל) → הצעות שיפור
    ↓
תיקונים לפי ההצעות
    ↓
סוכן הערכה → ציון + המלצות סופיות
    ↓
תיקונים אחרונים
    ↓
הצגה למייטל — רק אחרי שכל הסוכנים אישרו
```

**חשוב:** אם סוכן ההערכה נותן ציון מתחת ל-7, חוזרים לתקן לפי ההמלצות ומריצים שוב עד שהציון 7+.

---

## כללים

1. **Remotion** — לא ffmpeg. React components, spring animations, TransitionSeries
2. **30-45 שניות** — אורך מומלץ, מקסימום 60
3. **כל סצנה = סיפור** — לא סתם slide in/out
4. **Particles חובה** — בכל סצנה, רקע חי
5. **Glassmorphism** — backdrop-filter blur, שקיפות 80%
6. **Spring physics** — לא linear, תמיד spring עם damping/mass
7. **פתיחה WOW** — 3 שניות שמחליטות אם הצופה נשאר
8. **טקסט גדול** — עברית 44px+, אנגלית 68px+
9. **קישוטים גדולים** — opacity 0.12+, size 3-4x מהאינסטינקט הראשון
10. **רקע בהיר** — תמיד cream/pastel, לא dark mode
11. **תוכן קונקרטי** — דוגמאות ממשיות, לא כלליות
12. **RTL** — `direction: "rtl"`, LTR wrapper לאנגלית
13. **מוזיקה** — volume 0.2, royalty-free
14. **CTA** — תמונה + שם בעברית + Learni.ai + social icons + "עקבו אחרי ברשתות החברתיות"
15. **סוכנים** — 5 סוכנים בודקים לפני הצגה למייטל (חוקר → תוכן → עיצוב+רילס → הערכה)
