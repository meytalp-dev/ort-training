import { readFileSync, writeFileSync } from 'fs';

// Convert images to base64 directly
const imgDir = 'docs/presentations/gemini/images';
const img1 = readFileSync(`${imgDir}/יצירת שיחה חדשה.png`).toString('base64');
const img2 = readFileSync(`${imgDir}/בחירת קנבס ומעמיק.png`).toString('base64');
const img3 = readFileSync(`${imgDir}/ייצוא לסליידס והורדה.png`).toString('base64');

// Read SVG logo - create two versions with unique IDs to avoid conflicts
const logoSvgRaw = readFileSync('docs/assets/lerani-logo.svg', 'utf-8');
const logoSvg = logoSvgRaw;
const logoSvg2 = logoSvgRaw
  .replace(/id="leftCircle"/g, 'id="leftCircle2"')
  .replace(/id="rightCircle"/g, 'id="rightCircle2"')
  .replace(/id="overlapGrad"/g, 'id="overlapGrad2"')
  .replace(/id="softShadow"/g, 'id="softShadow2"')
  .replace(/id="textGlow"/g, 'id="textGlow2"')
  .replace(/id="clipLeft"/g, 'id="clipLeft2"')
  .replace(/id="clipRight"/g, 'id="clipRight2"')
  .replace(/url\(#leftCircle\)/g, 'url(#leftCircle2)')
  .replace(/url\(#rightCircle\)/g, 'url(#rightCircle2)')
  .replace(/url\(#overlapGrad\)/g, 'url(#overlapGrad2)')
  .replace(/url\(#softShadow\)/g, 'url(#softShadow2)')
  .replace(/url\(#textGlow\)/g, 'url(#textGlow2)')
  .replace(/url\(#clipLeft\)/g, 'url(#clipLeft2)')
  .replace(/url\(#clipRight\)/g, 'url(#clipRight2)');

const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reel – מצגת ב-5 דקות עם Gemini | Lerani</title>
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;800;900&family=Rubik:wght@500;600;700;800;900&family=Secular+One&family=Poppins:wght@600;700;800;900&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }

body {
  display:flex; align-items:center; justify-content:center;
  min-height:100vh; background:#0a0a0a;
  font-family:'Heebo',sans-serif;
  overflow:hidden;
}

.reel {
  width:1080px; height:1920px;
  transform:scale(0.45); transform-origin:center center;
  position:relative; overflow:hidden;
  border-radius:48px;
  box-shadow:0 0 120px rgba(123,171,212,.15), 0 0 60px rgba(90,191,146,.1);
}

.frame {
  position:absolute; inset:0;
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  padding:100px 70px;
  opacity:0;
  pointer-events:none;
}

.frame.active {
  opacity:1;
  z-index:10;
  pointer-events:auto;
}

/* ===== SPARKLE SYSTEM - Lerani Signature ===== */
.sparkle-container {
  position:absolute; inset:0; pointer-events:none; z-index:50;
  overflow:hidden;
}

.sparkle {
  position:absolute;
  width:4px; height:4px;
  border-radius:50%;
  background:#fff;
  animation:sparkleFloat 3s ease-in-out infinite;
  box-shadow: 0 0 6px 2px rgba(255,255,255,.6),
              0 0 12px 4px rgba(123,171,212,.3);
}

.sparkle.gold {
  background:#f0d060;
  box-shadow: 0 0 6px 2px rgba(240,208,96,.6),
              0 0 12px 4px rgba(240,208,96,.3);
}

.sparkle.teal {
  background:#5abf92;
  box-shadow: 0 0 6px 2px rgba(90,191,146,.6),
              0 0 12px 4px rgba(90,191,146,.3);
}

.sparkle.blue {
  background:#7babd4;
  box-shadow: 0 0 6px 2px rgba(123,171,212,.6),
              0 0 12px 4px rgba(123,171,212,.3);
}

/* Star-shaped sparkle */
.sparkle-star {
  position:absolute;
  pointer-events:none;
  animation:sparkleStarPulse 2s ease-in-out infinite;
}

.sparkle-star svg {
  filter: drop-shadow(0 0 8px rgba(255,255,255,.5));
}

@keyframes sparkleFloat {
  0% { opacity:0; transform:translateY(0) scale(0); }
  20% { opacity:1; transform:translateY(-20px) scale(1); }
  80% { opacity:1; transform:translateY(-80px) scale(1); }
  100% { opacity:0; transform:translateY(-120px) scale(0); }
}

@keyframes sparkleStarPulse {
  0%,100% { opacity:.4; transform:scale(.7) rotate(0deg); }
  50% { opacity:1; transform:scale(1.1) rotate(180deg); }
}

@keyframes sparkleTrail {
  0% { opacity:0; transform:translate(0,0) scale(0); }
  30% { opacity:1; transform:translate(-30px,-40px) scale(1.2); }
  100% { opacity:0; transform:translate(-60px,-100px) scale(0); }
}

/* Magic wand sparkle burst */
.wand-sparkle {
  position:absolute;
  width:6px; height:6px;
  border-radius:50%;
  animation:wandBurst 1.5s ease-out forwards;
}

@keyframes wandBurst {
  0% { opacity:1; transform:translate(0,0) scale(1); }
  100% { opacity:0; transform:translate(var(--tx), var(--ty)) scale(0); }
}

/* ===== ANIMATIONS ===== */
@keyframes fadeUp { from{opacity:0;transform:translateY(60px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes scaleIn { from{opacity:0;transform:scale(.5)} to{opacity:1;transform:scale(1)} }
@keyframes scaleInBounce {
  0%{opacity:0;transform:scale(.3)}
  60%{opacity:1;transform:scale(1.08)}
  100%{opacity:1;transform:scale(1)}
}
@keyframes slideUp { from{opacity:0;transform:translateY(100px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideDown { from{opacity:0;transform:translateY(-80px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
@keyframes glow { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.3)} }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
@keyframes shimmer {
  0% { background-position:-200% center; }
  100% { background-position:200% center; }
}
@keyframes gradientShift {
  0% { background-position:0% 50%; }
  50% { background-position:100% 50%; }
  100% { background-position:0% 50%; }
}
@keyframes typewriter {
  from { width:0; }
  to { width:100%; }
}
@keyframes blink { 50% { border-color:transparent; } }
@keyframes countPop {
  0% { opacity:0; transform:scale(0) rotate(-10deg); }
  60% { transform:scale(1.15) rotate(3deg); }
  100% { opacity:1; transform:scale(1) rotate(0deg); }
}
@keyframes swoopIn {
  0% { opacity:0; transform:translateX(100px) rotate(5deg); }
  100% { opacity:1; transform:translateX(0) rotate(0); }
}
@keyframes revealUp {
  0% { clip-path:inset(100% 0 0 0); opacity:0; }
  100% { clip-path:inset(0 0 0 0); opacity:1; }
}

.frame.active .anim-fu { animation:fadeUp .7s cubic-bezier(.22,1,.36,1) both; }
.frame.active .anim-fi { animation:fadeIn .5s ease both; }
.frame.active .anim-si { animation:scaleIn .5s cubic-bezier(.22,1,.36,1) both; }
.frame.active .anim-sib { animation:scaleInBounce .6s cubic-bezier(.22,1,.36,1) both; }
.frame.active .anim-su { animation:slideUp .7s cubic-bezier(.22,1,.36,1) both; }
.frame.active .anim-sd { animation:slideDown .6s cubic-bezier(.22,1,.36,1) both; }
.frame.active .anim-p { animation:pulse 2s ease infinite; }
.frame.active .anim-g { animation:glow 2s ease infinite; }
.frame.active .anim-fl { animation:float 3s ease infinite; }
.frame.active .anim-sw { animation:swoopIn .7s cubic-bezier(.22,1,.36,1) both; }
.frame.active .anim-rv { animation:revealUp .8s cubic-bezier(.22,1,.36,1) both; }
.frame.active .anim-cp { animation:countPop .6s cubic-bezier(.22,1,.36,1) both; }

.d1{animation-delay:.1s!important} .d2{animation-delay:.2s!important}
.d3{animation-delay:.3s!important} .d4{animation-delay:.4s!important}
.d5{animation-delay:.5s!important} .d6{animation-delay:.6s!important}
.d7{animation-delay:.7s!important} .d8{animation-delay:.8s!important}
.d9{animation-delay:.9s!important} .d10{animation-delay:1s!important}
.d12{animation-delay:1.2s!important} .d15{animation-delay:1.5s!important}
.d18{animation-delay:1.8s!important} .d20{animation-delay:2s!important}

/* ===== PROGRESS ===== */
.progress {
  position:absolute; top:0; left:0; right:0;
  height:5px; background:rgba(255,255,255,.08); z-index:100;
}
.progress-fill {
  height:100%;
  background:linear-gradient(90deg,#7babd4,#7dd4ac,#f0d060);
  background-size:200% 100%;
  animation:gradientShift 3s ease infinite;
  transition:width .3s ease;
  border-radius:0 3px 3px 0;
}

/* ===== GRADIENT TEXT HELPER ===== */
.gradient-text {
  background:linear-gradient(135deg,#7babd4,#5abf92,#7dd4ac);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
}

.gradient-text-warm {
  background:linear-gradient(135deg,#f0d060,#e8a040,#f0d060);
  background-size:200% 100%;
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  animation:shimmer 3s ease infinite;
}

.gradient-text-magic {
  background:linear-gradient(90deg,#7babd4,#b39ddb,#f0b4c8,#f0d060,#7dd4ac,#7babd4);
  background-size:300% 100%;
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  animation:shimmer 4s ease infinite;
}

/* ===== FRAME STYLES ===== */

/* -- Intro -- */
.f-intro {
  background:linear-gradient(160deg,#f8fafb 0%,#eef5f0 40%,#e8f0fa 100%);
  overflow:hidden;
}

.f-intro::before {
  content:'';
  position:absolute; top:-200px; right:-200px;
  width:600px; height:600px; border-radius:50%;
  background:radial-gradient(circle,rgba(123,171,212,.12) 0%,transparent 70%);
}

.f-intro::after {
  content:'';
  position:absolute; bottom:-200px; left:-200px;
  width:600px; height:600px; border-radius:50%;
  background:radial-gradient(circle,rgba(125,212,172,.12) 0%,transparent 70%);
}

.logo-svg {
  width:360px; height:260px; margin-bottom:20px;
}

.logo-tagline {
  font-size:30px; color:#4a6a8a; font-weight:400; margin-top:16px;
  letter-spacing:2px; opacity:.85;
}

.intro-subtitle {
  font-family:'Secular One',sans-serif;
  font-size:36px;
  margin-top:40px;
  padding:16px 48px;
  border-radius:50px;
  background:rgba(123,171,212,.08);
  border:2px solid rgba(123,171,212,.15);
}

/* -- Hook -- */
.f-hook {
  background:linear-gradient(160deg,#f0f4f8 0%,#e4eef8 50%,#dce8f5 100%);
  overflow:hidden;
}

.f-hook::before {
  content:'';
  position:absolute; inset:0;
  background:
    radial-gradient(circle at 20% 30%, rgba(123,171,212,.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(125,212,172,.1) 0%, transparent 50%);
}

.hook-badge {
  padding:14px 36px; border-radius:50px;
  background:linear-gradient(135deg,rgba(123,171,212,.15),rgba(125,212,172,.15));
  border:1px solid rgba(123,171,212,.2);
  font-size:28px; color:#4a6a8a; font-weight:500;
  margin-bottom:50px;
  backdrop-filter:blur(8px);
}

.hook-q {
  font-family:'Secular One',sans-serif; font-size:76px;
  color:#1e3a5f; text-align:center; line-height:1.35;
  position:relative;
}

.hook-answer {
  font-family:'Rubik',sans-serif; font-size:88px; font-weight:800;
  margin-top:50px;
  position:relative;
}

/* -- What -- */
.f-what {
  background:linear-gradient(150deg,#f4f8f6 0%,#e8f4f0 40%,#e0f0ec 100%);
  overflow:hidden;
}

.gemini-badge {
  display:flex; align-items:center; gap:20px;
  padding:20px 48px;
  background:rgba(255,255,255,.7);
  border-radius:100px;
  border:2px solid rgba(42,157,143,.15);
  backdrop-filter:blur(10px);
  margin-bottom:50px;
}

.gemini-icon-small {
  width:56px; height:56px;
  background:linear-gradient(135deg,#4285F4,#34A853,#FBBC05,#EA4335);
  border-radius:14px;
  display:flex; align-items:center; justify-content:center;
  font-size:28px;
}

.gemini-name {
  font-family:'Poppins',sans-serif; font-size:36px; font-weight:700;
  color:#1e3a5f;
}

.what-hero {
  font-family:'Secular One',sans-serif; font-size:60px;
  color:#1e3a5f; text-align:center; line-height:1.4;
  margin-bottom:40px;
}

.what-highlight {
  font-size:52px; font-weight:800;
  text-align:center;
  margin-bottom:40px;
}

.what-features {
  display:flex; gap:20px; margin-top:30px;
}

.what-chip {
  padding:16px 28px;
  border-radius:20px;
  font-size:28px; font-weight:600; color:#2D3436;
  background:rgba(255,255,255,.8);
  border:1.5px solid rgba(42,157,143,.15);
  backdrop-filter:blur(6px);
}

/* -- Steps with screenshots -- */
.f-step-screen {
  background:linear-gradient(150deg,#fafbfc 0%,#f0f4f8 50%,#e8f0f5 100%);
  padding:80px 50px;
}

.step-header {
  display:flex; align-items:center; gap:20px;
  margin-bottom:30px;
}

.step-num-circle {
  width:72px; height:72px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  font-family:'Poppins',sans-serif; font-size:36px; font-weight:800;
  color:#fff; flex-shrink:0;
}

.step-num-circle.c1 { background:linear-gradient(135deg,#2A9D8F,#45B7C5); }
.step-num-circle.c2 { background:linear-gradient(135deg,#52B788,#2A9D8F); }
.step-num-circle.c3 { background:linear-gradient(135deg,#7E57C2,#B39DDB); }

.step-label {
  font-family:'Secular One',sans-serif; font-size:48px;
  color:#1e3a5f;
}

.step-desc {
  font-size:32px; color:#4a6a8a; font-weight:500;
  margin-bottom:30px; text-align:center;
}

/* Screenshot styling - looks like a browser/device */
.screenshot-frame {
  width:100%; max-width:920px;
  background:#fff;
  border-radius:24px;
  box-shadow:0 20px 60px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.04);
  overflow:hidden;
  border:1px solid rgba(0,0,0,.06);
}

.screenshot-bar {
  height:44px; background:#f5f5f5;
  display:flex; align-items:center; padding:0 16px; gap:8px;
  border-bottom:1px solid rgba(0,0,0,.06);
}

.screenshot-dot {
  width:12px; height:12px; border-radius:50%;
}
.screenshot-dot.r { background:#ff5f57; }
.screenshot-dot.y { background:#ffbd2e; }
.screenshot-dot.g { background:#28c840; }

.screenshot-url {
  flex:1; text-align:center;
  font-family:'Poppins',sans-serif; font-size:16px; color:#999;
  margin-left:20px;
}

.screenshot-frame img {
  width:100%; display:block;
  object-fit:contain;
}

/* Arrow pointer overlay */
.screenshot-pointer {
  position:absolute;
  font-size:60px;
  animation:float 1.5s ease infinite, glow 2s ease infinite;
  filter:drop-shadow(0 4px 12px rgba(0,0,0,.3));
  z-index:5;
}

/* -- Tip -- */
.f-tip {
  background:linear-gradient(160deg,#fdf8e8 0%,#fef3d0 50%,#fdefc0 100%);
  overflow:hidden;
}

.f-tip::before {
  content:'';
  position:absolute; top:0; right:0;
  width:500px; height:500px;
  background:radial-gradient(circle,rgba(240,176,64,.1) 0%,transparent 70%);
}

.tip-icon-big {
  width:140px; height:140px; border-radius:50%;
  background:linear-gradient(135deg,#f0c040,#e8a030);
  display:flex; align-items:center; justify-content:center;
  font-size:70px; margin-bottom:50px;
  box-shadow:0 16px 48px rgba(240,176,64,.3);
}

.tip-main {
  font-family:'Secular One',sans-serif; font-size:52px;
  color:#5a4010; text-align:center; line-height:1.5;
}

.tip-result {
  font-family:'Rubik',sans-serif; font-size:60px; font-weight:800;
  color:#2A9D8F; margin-top:30px; text-align:center;
}

/* -- Compare -- */
.f-compare {
  background:linear-gradient(150deg,#fafbfc 0%,#f2f5f8 100%);
  overflow:hidden;
}

.compare-vs {
  display:flex; flex-direction:column; align-items:center; gap:30px;
  width:100%; max-width:900px;
}

.compare-card {
  width:100%;
  border-radius:28px; padding:44px;
  text-align:center;
  position:relative;
  overflow:hidden;
}

.compare-card.before {
  background:#fff;
  border:2px solid rgba(200,80,80,.15);
}

.compare-card.before::before {
  content:''; position:absolute; top:0; left:0; right:0; height:4px;
  background:linear-gradient(90deg,#E76F7A,#f0a0a0);
}

.compare-card.after {
  background:linear-gradient(135deg,rgba(42,157,143,.04),rgba(125,212,172,.06));
  border:2px solid rgba(42,157,143,.2);
}

.compare-card.after::before {
  content:''; position:absolute; top:0; left:0; right:0; height:4px;
  background:linear-gradient(90deg,#2A9D8F,#5abf92,#7dd4ac);
}

.compare-emoji { font-size:56px; margin-bottom:12px; }
.compare-label { font-size:30px; font-weight:600; margin-bottom:8px; }
.compare-label.red { color:#c06060; }
.compare-label.green { color:#2A9D8F; }

.compare-num {
  font-family:'Poppins',sans-serif; font-size:100px; font-weight:900;
  line-height:1;
}
.compare-num.red { color:#E76F7A; }
.compare-num.green { color:#2A9D8F; }

.compare-unit { font-size:34px; color:#64748B; font-weight:500; margin-top:8px; }

.compare-arrow-section {
  display:flex; align-items:center; gap:16px;
}

.compare-arrow-line {
  width:3px; height:40px;
  background:linear-gradient(180deg,#E76F7A,#2A9D8F);
  border-radius:2px;
}

.compare-arrow-icon { font-size:36px; }

/* -- CTA -- */
.f-cta {
  background:linear-gradient(160deg,#e8f4f0 0%,#d0ece4 40%,#c0e8dc 100%);
  overflow:hidden;
}

.f-cta::before {
  content:'';
  position:absolute; inset:0;
  background:
    radial-gradient(circle at 30% 20%, rgba(42,157,143,.08) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(123,171,212,.08) 0%, transparent 50%);
}

.cta-hero {
  font-family:'Secular One',sans-serif; font-size:68px;
  color:#1e3a5f; margin-bottom:40px; text-align:center;
}

.cta-btn {
  background:linear-gradient(135deg,#2A9D8F,#45B7C5);
  color:#fff;
  padding:30px 64px; border-radius:60px;
  font-family:'Rubik',sans-serif; font-size:42px; font-weight:700;
  box-shadow:0 16px 48px rgba(42,157,143,.3);
  margin-bottom:24px;
  position:relative;
  overflow:hidden;
}

.cta-btn::after {
  content:'';
  position:absolute; top:0; left:-100%;
  width:100%; height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);
  animation:shimmer 2.5s ease infinite;
}

.cta-sub {
  font-size:32px; color:#4a6a8a; font-weight:500; margin-top:20px;
}

.cta-link-badge {
  display:flex; align-items:center; gap:12px;
  margin-top:30px; padding:14px 36px;
  background:rgba(255,255,255,.6);
  border-radius:50px;
  border:1px solid rgba(42,157,143,.2);
  backdrop-filter:blur(8px);
  font-size:28px; color:#2A9D8F; font-weight:600;
}

/* -- Outro -- */
.f-outro {
  background:linear-gradient(160deg,#f4f8fa 0%,#eaf2ee 40%,#e4eef8 100%);
  overflow:hidden;
}

.outro-wave {
  position:absolute; bottom:0; left:0; right:0; height:300px;
  background:linear-gradient(180deg,transparent,rgba(123,171,212,.06));
}

.outro-cta {
  font-family:'Secular One',sans-serif;
  font-size:46px; color:#1e3a5f;
  margin-top:40px; text-align:center;
}

.outro-social {
  display:flex; gap:20px; margin-top:30px;
}

.social-chip {
  padding:14px 28px; border-radius:50px;
  font-size:26px; font-weight:600;
  background:rgba(123,171,212,.1);
  color:#4a6a8a;
  border:1px solid rgba(123,171,212,.15);
}

/* ===== CONTROLS ===== */
.controls {
  position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
  display:flex; gap:10px; z-index:1000;
}
.controls button {
  padding:10px 22px; border:none; border-radius:10px;
  font-family:'Heebo',sans-serif; font-size:15px; cursor:pointer;
  background:linear-gradient(135deg,#2A9D8F,#45B7C5);
  color:#fff; font-weight:600;
  transition:transform .15s;
}
.controls button:hover { transform:scale(1.05); }
.controls button:active { transform:scale(.95); }
</style>
</head>
<body>

<div class="reel" id="reel">
  <div class="progress"><div class="progress-fill" id="progressFill"></div></div>

  <!-- Sparkle overlay - always visible -->
  <div class="sparkle-container" id="sparkleContainer"></div>

  <!-- 1: INTRO - Lerani Logo -->
  <div class="frame f-intro active" data-duration="3000">
    <div class="logo-svg anim-sib" style="position:relative;">
      ${logoSvg}
    </div>
    <div class="logo-tagline anim-fi d5">חינוך · בינה מלאכותית · הגשמת חלומות</div>
    <div class="intro-subtitle gradient-text anim-fu d8">מגישה לכם קסם</div>
  </div>

  <!-- 2: HOOK - Attention Grabber -->
  <div class="frame f-hook" data-duration="4000">
    <div class="hook-badge anim-sd">✨ טיפ שישנה לכם את החיים</div>
    <div class="hook-q anim-fu d2">
      מצגת מושלמת<br>
      <span style="font-size:84px;">תוך 5 דקות?!</span>
    </div>
    <div class="hook-answer gradient-text-magic anim-cp d7">בטח שאפשר! 🪄</div>
  </div>

  <!-- 3: WHAT - Gemini intro -->
  <div class="frame f-what" data-duration="4500">
    <div class="gemini-badge anim-sd">
      <div class="gemini-icon-small">✨</div>
      <div class="gemini-name">Google Gemini</div>
    </div>
    <div class="what-hero anim-fu d2">
      AI שהופך רעיון<br>למצגת מוכנה<br>בלחיצת כפתור
    </div>
    <div class="what-highlight gradient-text anim-cp d6">
      חינמי. מיידי. וואו. 🤯
    </div>
    <div class="what-features anim-fu d8">
      <div class="what-chip">🎨 מצגות</div>
      <div class="what-chip">📝 תוכן</div>
      <div class="what-chip">🧠 חכם</div>
    </div>
  </div>

  <!-- 4: STEP 1 - Enter Gemini (with screenshot) -->
  <div class="frame f-step-screen" data-duration="5000">
    <div class="step-header anim-sd">
      <div class="step-num-circle c1">1</div>
      <div class="step-label">נכנסים ל-Gemini</div>
    </div>
    <div class="step-desc anim-fi d2">פותחים דפדפן → מתחברים עם גוגל → בוחרים Canvas</div>
    <div class="screenshot-frame anim-rv d4" style="position:relative;">
      <div class="screenshot-bar">
        <div class="screenshot-dot r"></div>
        <div class="screenshot-dot y"></div>
        <div class="screenshot-dot g"></div>
        <div class="screenshot-url">gemini.google.com</div>
      </div>
      <img src="data:image/png;base64,${img1}" alt="מסך הבית של Gemini">
    </div>
  </div>

  <!-- 5: STEP 2 - Write prompt (with Canvas screenshot) -->
  <div class="frame f-step-screen" data-duration="5500">
    <div class="step-header anim-sd">
      <div class="step-num-circle c2">2</div>
      <div class="step-label">בוחרים Canvas ✨</div>
    </div>
    <div class="step-desc anim-fi d2">הכלי הסודי שיוצר מצגות מדהימות ישירות!</div>
    <div class="screenshot-frame anim-rv d4" style="position:relative;">
      <div class="screenshot-bar">
        <div class="screenshot-dot r"></div>
        <div class="screenshot-dot y"></div>
        <div class="screenshot-dot g"></div>
        <div class="screenshot-url">gemini.google.com/canvas</div>
      </div>
      <img src="data:image/png;base64,${img2}" alt="בחירת Canvas">
    </div>
  </div>

  <!-- 6: STEP 3 - Result! (with export screenshot) -->
  <div class="frame f-step-screen" data-duration="5500">
    <div class="step-header anim-sd">
      <div class="step-num-circle c3">3</div>
      <div class="step-label">וואו, מוכן! 🎉</div>
    </div>
    <div class="step-desc anim-fi d2">מצגת מקצועית מוכנה לייצוא ל-Google Slides!</div>
    <div class="screenshot-frame anim-rv d4" style="position:relative;">
      <div class="screenshot-bar">
        <div class="screenshot-dot r"></div>
        <div class="screenshot-dot y"></div>
        <div class="screenshot-dot g"></div>
        <div class="screenshot-url">gemini.google.com</div>
      </div>
      <img src="data:image/png;base64,${img3}" alt="ייצוא מצגת">
    </div>
  </div>

  <!-- 7: TIP -->
  <div class="frame f-tip" data-duration="4500">
    <div class="tip-icon-big anim-sib anim-p">💡</div>
    <div class="tip-main anim-fu d3">
      ככל שתכתבו פרומפט<br>מפורט יותר...
    </div>
    <div class="tip-result anim-cp d8">
      המצגת תהיה מ-ד-ה-י-מ-ה! ✨
    </div>
  </div>

  <!-- 8: COMPARE -->
  <div class="frame f-compare" data-duration="5000">
    <div class="compare-vs">
      <div class="compare-card before anim-sw d1">
        <div class="compare-emoji">😩</div>
        <div class="compare-label red">בלי Gemini</div>
        <div class="compare-num red">60</div>
        <div class="compare-unit">דקות של סבל</div>
      </div>
      <div class="compare-arrow-section anim-si d5">
        <div class="compare-arrow-line"></div>
        <div class="compare-arrow-icon">⚡</div>
        <div class="compare-arrow-line"></div>
      </div>
      <div class="compare-card after anim-sw d7">
        <div class="compare-emoji">🤩</div>
        <div class="compare-label green">עם Gemini</div>
        <div class="compare-num green">5</div>
        <div class="compare-unit">דקות של קסם!</div>
      </div>
    </div>
  </div>

  <!-- 9: CTA -->
  <div class="frame f-cta" data-duration="4500">
    <div class="cta-hero anim-fu">
      עכשיו תורכם<br>לנסות! 🪄
    </div>
    <div class="cta-btn anim-sib d3 anim-p">gemini.google.com</div>
    <div class="cta-sub anim-fi d6">חינמי · פשוט · מדהים</div>
    <div class="cta-link-badge anim-fu d9">
      <span>🔗</span>
      <span>קישור בביו</span>
    </div>
  </div>

  <!-- 10: OUTRO -->
  <div class="frame f-outro" data-duration="3500">
    <div class="outro-wave"></div>
    <div class="logo-svg anim-sib" style="position:relative;">
      ${logoSvg2}
    </div>
    <div class="outro-cta anim-fu d5">
      עקבו ל-<span class="gradient-text">Lerani</span><br>
      לעוד טיפים שישנו לכם את השיעור! 🔔
    </div>
    <div class="outro-social anim-fi d9">
      <div class="social-chip">💙 לייק</div>
      <div class="social-chip">💾 שמרו</div>
      <div class="social-chip">📤 שתפו</div>
    </div>
  </div>
</div>

<div class="controls">
  <button onclick="startAutoPlay()">▶ הפעל</button>
  <button onclick="prevFrame()">◀ הקודם</button>
  <button onclick="nextFrame()">הבא ▶</button>
  <button onclick="togglePause()">⏸ עצור</button>
</div>

<script>
// ===== SPARKLE SYSTEM =====
const sparkleContainer = document.getElementById('sparkleContainer');
const SPARKLE_COLORS = ['', 'gold', 'teal', 'blue'];

function createSparkle() {
  const s = document.createElement('div');
  s.className = 'sparkle ' + SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
  s.style.left = Math.random() * 100 + '%';
  s.style.top = Math.random() * 100 + '%';
  s.style.width = (2 + Math.random() * 4) + 'px';
  s.style.height = s.style.width;
  s.style.animationDuration = (2 + Math.random() * 3) + 's';
  s.style.animationDelay = Math.random() * 2 + 's';
  sparkleContainer.appendChild(s);
  setTimeout(() => s.remove(), 5000);
}

function createStarSparkle() {
  const star = document.createElement('div');
  star.className = 'sparkle-star';
  star.style.left = Math.random() * 100 + '%';
  star.style.top = Math.random() * 100 + '%';
  star.style.animationDuration = (1.5 + Math.random() * 2) + 's';
  star.style.animationDelay = Math.random() * 1 + 's';

  const size = 12 + Math.random() * 16;
  const colors = ['#7babd4', '#7dd4ac', '#f0d060', '#ffffff'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  star.innerHTML = \`<svg width="\${size}" height="\${size}" viewBox="0 0 24 24"><path d="M12 2 L14 9 L21 9 L15.5 14 L17.5 21 L12 17 L6.5 21 L8.5 14 L3 9 L10 9 Z" fill="\${color}" opacity="0.7"/></svg>\`;
  sparkleContainer.appendChild(star);
  setTimeout(() => star.remove(), 4000);
}

// Continuous sparkle generation
setInterval(createSparkle, 300);
setInterval(createStarSparkle, 800);

// Initial burst of sparkles
for (let i = 0; i < 15; i++) {
  setTimeout(() => { createSparkle(); createStarSparkle(); }, i * 100);
}

// ===== FRAME NAVIGATION =====
const frames = document.querySelectorAll('.frame');
const progressFill = document.getElementById('progressFill');
let current = 0;
let autoTimer = null;
let isPaused = false;

function showFrame(index) {
  frames.forEach(f => f.classList.remove('active'));
  frames[index].classList.add('active');
  current = index;
  progressFill.style.width = ((index + 1) / frames.length) * 100 + '%';

  // Burst of sparkles on frame change
  for (let i = 0; i < 8; i++) {
    setTimeout(() => { createSparkle(); createStarSparkle(); }, i * 50);
  }
}

function nextFrame() {
  if (current < frames.length - 1) showFrame(current + 1);
}

function prevFrame() {
  if (current > 0) showFrame(current - 1);
}

function togglePause() {
  if (isPaused) {
    isPaused = false;
    playFromCurrent();
  } else {
    isPaused = true;
    clearTimeout(autoTimer);
  }
}

function playFromCurrent() {
  clearTimeout(autoTimer);
  if (isPaused) return;
  const dur = parseInt(frames[current].dataset.duration) || 3000;
  autoTimer = setTimeout(() => {
    if (current < frames.length - 1) {
      showFrame(current + 1);
      playFromCurrent();
    }
  }, dur);
}

function startAutoPlay() {
  isPaused = false;
  showFrame(0);
  playFromCurrent();
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') nextFrame();   // RTL
  else if (e.key === 'ArrowRight') prevFrame();
  else if (e.key === ' ') { e.preventDefault(); togglePause(); }
  else if (e.key === 'r' || e.key === 'R') startAutoPlay();
});

// Auto-start
setTimeout(startAutoPlay, 800);
</script>
</body>
</html>`;

writeFileSync('docs/training/gemini-5min/reel.html', html);
console.log('Reel created: docs/training/gemini-5min/reel.html');
