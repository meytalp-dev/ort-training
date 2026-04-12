# Recipe: Google Forms + AI = Smart Quiz Reel

- **Date:** 2026-04-03
- **Template:** Tip / Hack
- **Duration:** ~36.7s (1100 frames @ 30fps)
- **Dimensions:** 1080x1920 (9:16 vertical)

---

## Scenes

### 1. CategoryScene — Typing Reveal (90 frames / 3s)
"Google Forms + AI = ?" typed character by character with blinking cursor, handwriting font (Playpen Sans Hebrew). "Tip" badge at top. Decorative line and sparkles.

### 2. HookScene — Particle Converge (120 frames / 4s)
24 scattered particles converge to center, flash on impact, "!בוחן חכם" slams in BIG with scale spring (6->1), expanding ring, subtitle "ב-3 צעדים פשוטים".

### 3. Feature1Scene — Cursor Drag (150 frames / 5s)
Custom cursor moves to Google Forms icon, clicks (ripple rings), drags form into glassmorphism card. Card reveals: "בונים טופס רגיל ב-Google Forms" with form preview lines.

### 4. Feature2Scene — Button Escape (150 frames / 5s)
Initial card with "AI" button that shakes increasingly, escapes upward, explodes into particles. New card rotates in 3D (rotateY spring). Text: "מבקשים מ-AI לכתוב שאלות לפי נושא ורמה".

### 5. Feature3Scene — Messy to Organized (150 frames / 5s)
5 question pills scattered with wobble, reorganize into line with spring physics. Z's float up during organize. Card forms around them with "מדביקים, מפעילים — יש בוחן מוכן!" + checkmark celebration.

### 6. BenefitsScene — Stack Build (300 frames / 10s)
Golden "טיפ בונוס" badge. 4 tip cards stack like deck, each dropping from above with bounce spring. Cards: מפתח תשובות, הסברים לכל שאלה, רמות קושי מותאמות, חוסכים שעות עבודה. Gold shimmer effect.

### 7. SummaryScene — Quote Card (105 frames / 3.5s)
Elegant glassmorphism card. Giant quotation marks fly in from sides. Handwriting font: "3 צעדים. בוחן מוכן." Decorative gradient underline. Glow pulse behind card.

### 8. CTAScene — Fullscreen Gradient (105 frames / 3.5s)
Animated rotating gradient background. Learni logo, Meytal photo with glow ring, "עוד טיפים בעמוד שלנו" big text, Learni.ai button with glow pulse, SVG social icons (Facebook, Instagram, LinkedIn).

---

## Design System

- **Color:** #7B61FF (Google purple) + #7DD4AC (mint green)
- **Background:** #F5F3FF (light lavender), never dark
- **Cards:** rgba(255,255,255,0.8) + backdrop-filter blur(20px) + border-radius 28px
- **Fonts:** Rubik (headings), Heebo (body), Playpen Sans Hebrew (handwriting)
- **Animations:** Spring physics everywhere (damping 4-12, mass 0.2-0.8)
- **Hebrew:** min 44px body, 68px+ headings, RTL direction
- **Icons:** SVG only, no emojis
- **Transitions:** Crossfade 10 frames between all scenes
- **Audio:** music.mp3 at volume 0.2
- **Watermark:** "Learni" top-right, 15% opacity

---

## Previous reels reference
Claude Code (Energy Pulse / 3D Flip / Button+Messy+Cursor / Pill BIG / Number Slam / Photo+Social), Stitch (Countdown / Particle Converge / Typewriter+Morph+3DFlip / Orbit / Before-After / Fullscreen Gradient), Pomelli (Photo Zoom / Slide Up+Glow / Cursor+Button+Messy / Stack Build / Quote Card / Card+QR)
