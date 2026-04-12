const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIR = __dirname;

// Register Hebrew fonts with exact family names used in ctx.font
try { registerFont(path.join(DIR, 'PlaypenSansHebrew.ttf'), { family: 'Playpen' }); console.log('Playpen font loaded'); } catch(e) { console.log('Playpen font error:', e.message); }
try { registerFont(path.join(DIR, 'VarelaRound.ttf'), { family: 'Varela' }); console.log('Varela font loaded'); } catch(e) { console.log('Varela font error:', e.message); }

const W = 1280, H = 720;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// Transparent background
ctx.clearRect(0, 0, W, H);

// Dark gradient at bottom for readability
const grad = ctx.createLinearGradient(0, H * 0.25, 0, H);
grad.addColorStop(0, 'rgba(0,0,0,0)');
grad.addColorStop(0.3, 'rgba(0,0,0,0.25)');
grad.addColorStop(1, 'rgba(0,0,0,0.6)');
ctx.fillStyle = grad;
ctx.fillRect(0, 0, W, H);

ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

// Draw flower
function drawFlower(cx, cy, size) {
    const colors = ['#E84B8A', '#D63A78'];
    for (let i = 0; i < 5; i++) {
        const angle = (i * 72 - 90) * Math.PI / 180;
        const px = cx + Math.cos(angle) * size * 0.6;
        const py = cy + Math.sin(angle) * size * 0.6;
        ctx.beginPath();
        ctx.ellipse(px, py, size * 0.35, size * 0.22, angle + Math.PI/2, 0, Math.PI * 2);
        ctx.fillStyle = colors[i % 2];
        ctx.globalAlpha = 0.9;
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = '#F0C05A';
    ctx.fill();
}

// Title
const titleY = H * 0.30;
ctx.font = 'bold 100px Playpen';
ctx.fillStyle = '#E8A0BF';
ctx.shadowColor = 'rgba(0,0,0,0.7)';
ctx.shadowBlur = 25;
ctx.shadowOffsetY = 4;
const titleText = 'חג פסח שמח';
const titleWidth = ctx.measureText(titleText).width;
ctx.fillText(titleText, W/2, titleY);

drawFlower(W/2 - titleWidth/2 - 45, titleY, 22);
drawFlower(W/2 + titleWidth/2 + 45, titleY, 22);

// Subtitle
ctx.font = 'bold 44px Playpen';
ctx.fillStyle = 'rgba(255,255,255,0.95)';
ctx.shadowColor = 'rgba(0,0,0,0.7)';
ctx.shadowBlur = 15;
ctx.shadowOffsetY = 3;
ctx.fillText('קהילה יקרה', W/2, titleY + 72);

// Decorative line
ctx.shadowBlur = 0;
ctx.shadowOffsetY = 0;
ctx.beginPath();
ctx.moveTo(W/2 - 120, titleY + 103);
ctx.quadraticCurveTo(W/2, titleY + 91, W/2 + 120, titleY + 103);
ctx.strokeStyle = '#E84B8A';
ctx.lineWidth = 3;
ctx.lineCap = 'round';
ctx.stroke();

// Body
ctx.font = '36px Varela';
ctx.fillStyle = '#ffffff';
ctx.shadowColor = 'rgba(0,0,0,0.8)';
ctx.shadowBlur = 20;
ctx.shadowOffsetY = 3;
const bodyLines = [
    'הלוואי שחג החירות והאביב',
    'יביא איתו תקווה לימים טובים יותר',
    'וחזרה לשגרה מבורכת',
    'עם התלמידים היקרים שלנו'
];
const bodyStartY = titleY + 140;
bodyLines.forEach((line, i) => {
    ctx.fillText(line, W/2, bodyStartY + i * 50);
});

// Signature
ctx.font = 'bold 26px Playpen';
ctx.fillStyle = '#F0C05A';
ctx.shadowColor = 'rgba(0,0,0,0.6)';
ctx.shadowBlur = 12;
ctx.fillText('מאחלים לכם ולבני משפחותיכם חג פסח שמח וכשר', W/2, bodyStartY + 230);
ctx.fillText('מיטל פלג וכל צוות בית הספר', W/2, bodyStartY + 265);

// Save overlay
const overlayPath = path.join(DIR, 'pesach-text-overlay.png');
fs.writeFileSync(overlayPath, canvas.toBuffer('image/png'));
console.log('Overlay saved:', overlayPath);

// ffmpeg: video + overlay → palette → GIF
const videoPath = path.join(DIR, 'Golden_light_sweeps_202604011256.mp4');
const palettePath = path.join(DIR, 'palette.png');
const gifPath = path.join(process.env.USERPROFILE, 'Downloads', 'pesach-greeting.gif');

console.log('Creating palette...');
execSync(`ffmpeg -y -i "${videoPath}" -i "${overlayPath}" -filter_complex "[0:v][1:v]overlay=0:0,fps=12,scale=640:-1:flags=lanczos[v];[v]palettegen=max_colors=128[pal]" -map "[pal]" -update 1 "${palettePath}"`, { stdio: 'inherit' });

console.log('Creating GIF...');
execSync(`ffmpeg -y -i "${videoPath}" -i "${overlayPath}" -i "${palettePath}" -filter_complex "[0:v][1:v]overlay=0:0,fps=12,scale=640:-1:flags=lanczos[v];[v][2:v]paletteuse=dither=bayer:bayer_scale=3[out]" -map "[out]" -t 8 "${gifPath}"`, { stdio: 'inherit' });

console.log('GIF saved to:', gifPath);

// Cleanup
try { fs.unlinkSync(palettePath); } catch(e) {}
console.log('Done!');
