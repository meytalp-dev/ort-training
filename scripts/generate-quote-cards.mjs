/**
 * Generate Social Media Quote Cards — Learni Claude Code Course
 * Creates branded quote cards in two formats:
 *   - 1200x630 (Facebook / OG)
 *   - 1080x1080 (Instagram / WhatsApp)
 */

import { createCanvas, registerFont } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'assets', 'quote-cards');

mkdirSync(OUT, { recursive: true });

// Register Hebrew fonts
const fontsDir = join(ROOT, '.claude', 'skills', 'front-end-design', 'fonts');
// Register all Heebo weights under same family — node-canvas matches by weight
registerFont(join(fontsDir, 'פונטים (מתעדכן!)', 'Heebo-Regular.ttf'), { family: 'Heebo', weight: 'normal', style: 'normal' });
registerFont(join(fontsDir, 'פונטים (מתעדכן!)', 'Heebo-Bold.ttf'), { family: 'Heebo', weight: 'bold', style: 'normal' });
registerFont(join(fontsDir, 'פונטים (מתעדכן!)', 'Heebo-Medium.ttf'), { family: 'Heebo', weight: '500', style: 'normal' });
registerFont(join(fontsDir, 'פונטים (מתעדכן!)', 'Heebo-Light.ttf'), { family: 'Heebo', weight: '300', style: 'normal' });
registerFont(join(fontsDir, 'פונטים (מתעדכן!)', 'Heebo-ExtraBold.ttf'), { family: 'Heebo', weight: '800', style: 'normal' });
console.log('Fonts registered: Heebo (5 weights)');

// --- Card Data ---
const cards = [
  {
    id: 'featured',
    quote: 'מיטל, אין לי מילים להודות לך.\nברשת יש הרבה קורסים בתשלום לקלוד קוד,\nאבל לא מצאתי קורס מותאם למורים.\nחסכת לי המון זמן ותלמידים רבים\nיוכלו להנות מהיכולות שלימדת.',
    author: 'סיגל גולן עתיר',
    role: 'בית ספר עירוני',
    colorTop: '#7EC8E3',
    colorBottom: '#B8E4F0',
    accent: '#5AAFCF',
  },
  {
    id: 'magical',
    quote: 'היה קסום! הכל!\nכיף גדול להיחשף לעולם חדש מלא הפתעות —\nוהכי חשוב שיש ליווי צמוד\nשמפחית תסכולים של מתחילים.',
    author: 'הדס שרון',
    role: 'רשת עתיד',
    colorTop: '#A8D5BA',
    colorBottom: '#D4EDDA',
    accent: '#7BC496',
  },
  {
    id: 'materials',
    quote: 'המצגות ודפי הקישורים — מעולים!!!\nסדר, נגישות לחומרים.',
    author: 'סיגל גולן עתיר & הילה זוהר',
    role: 'רשת עתיד',
    colorTop: '#F0DFC0',
    colorBottom: '#F8F0E0',
    accent: '#D4A96E',
  },
  {
    id: 'game',
    quote: 'מבחינתי הרגע המוצלח היה אחרי הקורס,\nכשהצלחתי לייצר משחק.',
    author: 'סיגל גולן עתיר',
    role: 'בית ספר עירוני',
    colorTop: '#D4C0E8',
    colorBottom: '#EDE0F5',
    accent: '#B088D0',
  },
  {
    id: 'instructor',
    quote: 'את מיטל המהממת והסבלנית\nוהמשקיענית והאיכפתית!!\nמנחה מדהימה.',
    author: 'הדס שרון & משתתפים נוספים',
    role: 'רשת עתיד',
    colorTop: '#7EC8E3',
    colorBottom: '#C8E8F5',
    accent: '#5AAFCF',
  },
];

// --- Drawing Utilities ---

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(' ');
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
  }
  return lines;
}

function addNoiseTexture(ctx, w, h, opacity = 0.02) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 30;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }
  const tempCanvas = createCanvas(w, h);
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.putImageData(imageData, 0, 0);
  ctx.globalAlpha = opacity;
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.globalAlpha = 1;
}

function drawCard(card, width, height, suffix) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const scale = width / 1200;
  const isSquare = width === height;

  // --- Background gradient ---
  const grad = ctx.createLinearGradient(0, 0, width * 0.3, height);
  grad.addColorStop(0, card.colorTop);
  grad.addColorStop(1, card.colorBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // --- Subtle noise texture ---
  addNoiseTexture(ctx, width, height, 0.015);

  // --- Decorative circle (top-left area) ---
  ctx.beginPath();
  ctx.arc(width * 0.12, height * 0.18, width * 0.15, 0, Math.PI * 2);
  ctx.fillStyle = card.accent + '12';
  ctx.fill();

  // --- Second decorative circle (bottom-right) ---
  ctx.beginPath();
  ctx.arc(width * 0.88, height * 0.82, width * 0.1, 0, Math.PI * 2);
  ctx.fillStyle = card.accent + '0A';
  ctx.fill();

  // --- Inner card (rounded rectangle) ---
  const margin = width * 0.08;
  const cardX = margin;
  const cardY = height * 0.1;
  const cardW = width - margin * 2;
  const cardH = height * 0.8;
  const radius = 24 * scale;

  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fill();

  // --- Subtle card shadow ---
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
  ctx.shadowBlur = 40 * scale;
  ctx.shadowOffsetY = 8 * scale;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fill();
  ctx.restore();

  // --- Right accent bar ---
  const barW = 5 * scale;
  ctx.beginPath();
  ctx.roundRect(cardX + cardW - barW, cardY + height * 0.08, barW, cardH - height * 0.16, barW / 2);
  ctx.fillStyle = card.accent;
  ctx.fill();

  // --- Giant quotation mark ---
  ctx.font = `bold ${120 * scale}px Heebo`;
  ctx.fillStyle = card.accent + '15';
  ctx.textAlign = 'right';
  ctx.textDirection = 'rtl';
  ctx.fillText('"', cardX + cardW - 30 * scale, cardY + 110 * scale);

  // --- Quote text ---
  const textPadding = 40 * scale;
  const textAreaX = cardX + textPadding;
  const textAreaWidth = cardW - textPadding * 2 - 20 * scale;

  const quoteFontSize = isSquare
    ? (card.quote.length > 100 ? 28 : 32) * scale
    : (card.quote.length > 100 ? 26 : 30) * scale;

  ctx.font = `bold ${quoteFontSize}px Heebo`;
  ctx.fillStyle = '#2A2A40';
  ctx.textAlign = 'right';
  ctx.textDirection = 'rtl';

  const lines = wrapText(ctx, card.quote, textAreaWidth);
  const lineHeight = quoteFontSize * 1.65;
  const totalTextHeight = lines.length * lineHeight;
  const startY = cardY + (cardH - totalTextHeight) / 2 - 10 * scale;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], cardX + cardW - textPadding - 10 * scale, startY + i * lineHeight);
  }

  // --- Author line ---
  const authorY = startY + totalTextHeight + 30 * scale;
  ctx.font = `${18 * scale}px Heebo`;
  ctx.fillStyle = '#6A7A8A';
  ctx.fillText(`— ${card.author}`, cardX + cardW - textPadding - 10 * scale, authorY);

  ctx.font = `${15 * scale}px Heebo`;
  ctx.fillStyle = '#8A9AB0';
  ctx.fillText(card.role, cardX + cardW - textPadding - 10 * scale, authorY + 24 * scale);

  // --- Rating badge (top-left of card) ---
  const badgeX = cardX + 24 * scale;
  const badgeY = cardY + 20 * scale;
  const badgeW = 90 * scale;
  const badgeH = 34 * scale;

  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, badgeH / 2);
  ctx.fillStyle = card.accent + '20';
  ctx.fill();

  ctx.font = `bold ${16 * scale}px Heebo`;
  ctx.fillStyle = card.accent;
  ctx.textAlign = 'center';
  ctx.fillText('9.0 / 10', badgeX + badgeW / 2, badgeY + badgeH * 0.68);

  // --- Learni branding (bottom) ---
  ctx.textAlign = 'center';
  ctx.font = `${14 * scale}px Heebo`;
  ctx.fillStyle = '#6A7A8A';
  ctx.fillText('Learni — קורס Claude Code', width / 2, height * 0.95);

  // --- Thin bottom line ---
  ctx.beginPath();
  ctx.moveTo(width * 0.35, height * 0.965);
  ctx.lineTo(width * 0.65, height * 0.965);
  ctx.strokeStyle = card.accent + '30';
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();

  // --- Export ---
  const filename = `quote-${card.id}-${suffix}.png`;
  const buffer = canvas.toBuffer('image/png');
  writeFileSync(join(OUT, filename), buffer);
  console.log(`  Created: ${filename} (${width}x${height})`);
}

// --- Generate all cards ---
console.log('\nGenerating quote cards...\n');

for (const card of cards) {
  drawCard(card, 1200, 630, 'fb');
  drawCard(card, 1080, 1080, 'square');
}

console.log(`\nDone! ${cards.length * 2} cards saved to assets/quote-cards/\n`);
