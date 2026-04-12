const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// Register Hebrew fonts
const fontDir = 'c:/Users/meyta/Downloads/ort-presentation-builder/_drafts';
registerFont(path.join(fontDir, 'PlaypenSansHebrew.ttf'), { family: 'Playpen' });

const mngFonts = 'c:/Users/meyta/Downloads/ort-presentation-builder/docs/management/fonts';
registerFont(path.join(mngFonts, 'Shuneet3 Medium.ttf'), { family: 'Shuneet3' });

const W = 1080, H = 1080;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// === BACKGROUND: Warm cream-to-rose gradient ===
const bgGrad = ctx.createLinearGradient(0, 0, W, H);
bgGrad.addColorStop(0, '#FFF5EE');
bgGrad.addColorStop(0.4, '#FFF0E8');
bgGrad.addColorStop(1, '#FFE4D6');
ctx.fillStyle = bgGrad;
ctx.fillRect(0, 0, W, H);

// === SUBTLE DOT PATTERN ===
ctx.fillStyle = 'rgba(224, 96, 120, 0.035)';
for (let x = 0; x < W; x += 28) {
  for (let y = 0; y < H; y += 28) {
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// === LARGE DECORATIVE CIRCLES (gathering motif) ===
function radialGlow(cx, cy, r, color) {
  const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
  g.addColorStop(0, color);
  g.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
}

radialGlow(820, 180, 220, 'rgba(224, 96, 144, 0.12)');
radialGlow(200, 850, 160, 'rgba(212, 165, 116, 0.10)');
radialGlow(150, 300, 80, 'rgba(224, 96, 144, 0.08)');
radialGlow(540, 540, 300, 'rgba(224, 96, 144, 0.04)');

// === ABSTRACT FIGURES (community gathering) ===
function drawPerson(cx, cy, scale, color) {
  ctx.fillStyle = color;
  // Head
  ctx.beginPath();
  ctx.arc(cx, cy - 28 * scale, 16 * scale, 0, Math.PI * 2);
  ctx.fill();
  // Body (rounded trapezoid)
  ctx.beginPath();
  ctx.moveTo(cx - 14 * scale, cy);
  ctx.quadraticCurveTo(cx - 18 * scale, cy + 45 * scale, cx - 6 * scale, cy + 55 * scale);
  ctx.lineTo(cx + 6 * scale, cy + 55 * scale);
  ctx.quadraticCurveTo(cx + 18 * scale, cy + 45 * scale, cx + 14 * scale, cy);
  ctx.closePath();
  ctx.fill();
}

// Row of figures — upper center
const figures = [
  { x: 340, y: 260, s: 1.6, c: 'rgba(224, 96, 144, 0.13)' },
  { x: 420, y: 240, s: 1.9, c: 'rgba(200, 130, 100, 0.12)' },
  { x: 510, y: 230, s: 2.1, c: 'rgba(180, 120, 160, 0.14)' },
  { x: 600, y: 235, s: 2.0, c: 'rgba(160, 140, 120, 0.12)' },
  { x: 680, y: 248, s: 1.8, c: 'rgba(140, 160, 180, 0.13)' },
  { x: 750, y: 265, s: 1.5, c: 'rgba(200, 150, 130, 0.11)' },
];
figures.forEach(f => drawPerson(f.x, f.y, f.s, f.c));

// === EMBRACE ARC connecting figures ===
ctx.strokeStyle = 'rgba(224, 96, 144, 0.10)';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(280, 370);
ctx.quadraticCurveTo(540, 190, 810, 370);
ctx.stroke();

ctx.strokeStyle = 'rgba(212, 165, 116, 0.08)';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(310, 390);
ctx.quadraticCurveTo(540, 220, 780, 390);
ctx.stroke();

// === HEARTS (soft, scattered) ===
function drawHeart(cx, cy, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  const s = size;
  ctx.moveTo(cx, cy + s * 0.35);
  ctx.bezierCurveTo(cx, cy, cx - s * 0.5, cy, cx - s * 0.5, cy + s * 0.25);
  ctx.bezierCurveTo(cx - s * 0.5, cy + s * 0.55, cx, cy + s * 0.7, cx, cy + s * 0.85);
  ctx.bezierCurveTo(cx, cy + s * 0.7, cx + s * 0.5, cy + s * 0.55, cx + s * 0.5, cy + s * 0.25);
  ctx.bezierCurveTo(cx + s * 0.5, cy, cx, cy, cx, cy + s * 0.35);
  ctx.fill();
}

drawHeart(180, 180, 40, 'rgba(224, 96, 144, 0.07)');
drawHeart(880, 480, 32, 'rgba(224, 96, 144, 0.05)');
drawHeart(120, 680, 25, 'rgba(200, 130, 100, 0.06)');
drawHeart(910, 780, 20, 'rgba(224, 96, 144, 0.04)');
drawHeart(760, 130, 24, 'rgba(200, 150, 130, 0.05)');

// === DECORATIVE RINGS ===
ctx.strokeStyle = 'rgba(224, 96, 144, 0.06)';
ctx.lineWidth = 2;
ctx.beginPath(); ctx.arc(900, 250, 45, 0, Math.PI * 2); ctx.stroke();
ctx.strokeStyle = 'rgba(212, 165, 116, 0.06)';
ctx.beginPath(); ctx.arc(100, 500, 30, 0, Math.PI * 2); ctx.stroke();

// === HORIZONTAL ACCENT LINE ===
const lineGrad = ctx.createLinearGradient(200, 0, 880, 0);
lineGrad.addColorStop(0, 'rgba(224, 96, 144, 0)');
lineGrad.addColorStop(0.3, 'rgba(224, 96, 144, 0.18)');
lineGrad.addColorStop(0.7, 'rgba(224, 96, 144, 0.18)');
lineGrad.addColorStop(1, 'rgba(224, 96, 144, 0)');
ctx.strokeStyle = lineGrad;
ctx.lineWidth = 1.5;
ctx.beginPath(); ctx.moveTo(200, 465); ctx.lineTo(880, 465); ctx.stroke();

// === MAIN TEXT ===
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

// Line 1
ctx.font = '72px Shuneet3';
ctx.fillStyle = '#5A3040';
ctx.fillText('\u202Bאנחנו לא רק כיתה\u202C', W / 2, 555);

// Line 2 — bigger, accent color
ctx.font = '82px Shuneet3';
ctx.fillStyle = '#C04870';
ctx.fillText('\u202Bאנחנו משפחה\u202C', W / 2, 660);

// === SMALL DECORATIVE COMMA/DASH between lines ===
ctx.fillStyle = 'rgba(224, 96, 144, 0.25)';
ctx.fillRect(W / 2 - 20, 600, 40, 3);

// === DIMENSION BADGE ===
const badgeW = 130, badgeH = 44, badgeX = W - badgeW - 60, badgeY = 58;
ctx.fillStyle = 'rgba(224, 96, 144, 0.10)';
ctx.beginPath(); ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 22); ctx.fill();
ctx.strokeStyle = 'rgba(224, 96, 144, 0.20)';
ctx.lineWidth = 1.5;
ctx.beginPath(); ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 22); ctx.stroke();
ctx.font = '22px Playpen';
ctx.fillStyle = '#C04870';
ctx.textAlign = 'center';
ctx.fillText('\u202Bשייכות\u202C', badgeX + badgeW / 2, badgeY + badgeH / 2 + 1);

// === SUBTITLE ===
ctx.font = '22px Playpen';
ctx.fillStyle = 'rgba(90, 48, 64, 0.30)';
ctx.textAlign = 'center';
ctx.fillText('\u202Bחמשת הממדים  \u00B7  אורט בית הערבה\u202C', W / 2, 740);

// === FIVE DIMENSION DOTS (bottom) ===
const dotColors = ['#E06090', '#5B9BD5', '#E8A838', '#8B6BC0', '#7AB648'];
const dotY = 940;
const dotSpacing = 50;
const dotStartX = W / 2 - (dotColors.length - 1) * dotSpacing / 2;
dotColors.forEach((color, i) => {
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(dotStartX + i * dotSpacing, dotY, 7, 0, Math.PI * 2);
  ctx.fill();
});
ctx.globalAlpha = 1;

// === SCHOOL NAME BOTTOM ===
ctx.font = '17px Playpen';
ctx.fillStyle = 'rgba(90, 48, 64, 0.25)';
ctx.textAlign = 'center';
ctx.fillText('\u202B\u05EA\u05E9\u05E4\u05F4\u05D6  \u00B7  \u05D0\u05D5\u05E8\u05D8 \u05D1\u05D9\u05EA \u05D4\u05E2\u05E8\u05D1\u05D4\u202C', W / 2, 1000);

// === CORNER ACCENTS ===
ctx.strokeStyle = 'rgba(224, 96, 144, 0.06)';
ctx.lineWidth = 35;
ctx.beginPath(); ctx.arc(0, 0, 100, 0, Math.PI / 2); ctx.stroke();

ctx.strokeStyle = 'rgba(212, 165, 116, 0.05)';
ctx.lineWidth = 25;
ctx.beginPath(); ctx.arc(W, H, 90, Math.PI, Math.PI * 1.5); ctx.stroke();

// === SAVE ===
const out = fs.createWriteStream('C:/Users/meyta/Downloads/poster-belong-1.png');
const stream = canvas.createPNGStream();
stream.pipe(out);
out.on('finish', () => console.log('SAVED: poster-belong-1.png (1080x1080)'));
