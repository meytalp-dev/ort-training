import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';

const FFMPEG = 'C:/Users/USER/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin/ffmpeg.exe';
const OUT_DIR = 'temp-reel';
const W = 1080;
const H = 1920;

const frames = [
  {
    id: 'intro', duration: 2, bg: 'ffffff',
    texts: [
      { text: 'Lerani', bold: true, size: 80, color: '1e3a5f', y: 880 },
      { text: 'חינוך · בינה מלאכותית · הגשמת חלומות', bold: false, size: 32, color: '4a6a8a', y: 980 },
    ]
  },
  {
    id: 'hook', duration: 4, bg: '1e3a5f',
    texts: [
      { text: 'מצגת לשיעור', bold: true, size: 72, color: 'ffffff', y: 700 },
      { text: 'תוך 5 דקות?', bold: true, size: 80, color: '5abf92', y: 800 },
      { text: 'כן, אפשר!', bold: true, size: 64, color: '7babd4', y: 1050 },
    ]
  },
  {
    id: 'what', duration: 4, bg: 'f8fafb',
    texts: [
      { text: 'Gemini', bold: true, size: 72, color: '2A9D8F', y: 750 },
      { text: 'AI של גוגל - חינמי', bold: true, size: 48, color: '1e3a5f', y: 860 },
      { text: 'gemini.google.com', bold: false, size: 36, color: '4a6a8a', y: 960 },
    ]
  },
  {
    id: 'step1', duration: 5, bg: 'ffffff',
    texts: [
      { text: 'שלב 1', bold: true, size: 42, color: '2A9D8F', y: 650 },
      { text: 'נכנסים ל-Gemini', bold: true, size: 60, color: '1e3a5f', y: 760 },
      { text: 'פותחים דפדפן', bold: false, size: 40, color: '4a6a8a', y: 880 },
      { text: 'מתחברים עם חשבון גוגל', bold: false, size: 40, color: '4a6a8a', y: 940 },
      { text: 'בוחרים Canvas', bold: true, size: 40, color: '2A9D8F', y: 1000 },
    ]
  },
  {
    id: 'step2', duration: 6, bg: 'ffffff',
    texts: [
      { text: 'שלב 2', bold: true, size: 42, color: '52B788', y: 600 },
      { text: 'כותבים פרומפט מפורט', bold: true, size: 52, color: '1e3a5f', y: 710 },
      { text: 'ציינו: נושא + כיתה + רמה', bold: false, size: 38, color: '4a6a8a', y: 850 },
      { text: 'בקשו: מבנה + שאלות + תרגול', bold: false, size: 38, color: '4a6a8a', y: 920 },
      { text: 'שפה פשוטה, מנות קטנות', bold: false, size: 38, color: '4a6a8a', y: 990 },
    ]
  },
  {
    id: 'step3', duration: 5, bg: 'ffffff',
    texts: [
      { text: 'שלב 3', bold: true, size: 42, color: '7E57C2', y: 700 },
      { text: 'Gemini בונה מצגת!', bold: true, size: 60, color: '1e3a5f', y: 810 },
      { text: 'שקפים מוכנים + תוכן', bold: false, size: 40, color: '4a6a8a', y: 940 },
      { text: 'שאלות הבנה + תרגול', bold: false, size: 40, color: '4a6a8a', y: 1010 },
    ]
  },
  {
    id: 'tip', duration: 5, bg: '1e3a5f',
    texts: [
      { text: 'טיפ!', bold: true, size: 56, color: 'E9A319', y: 700 },
      { text: 'ככל שהפרומפט מפורט יותר', bold: true, size: 44, color: 'ffffff', y: 850 },
      { text: 'התוצאה טובה יותר', bold: true, size: 50, color: '5abf92', y: 940 },
    ]
  },
  {
    id: 'compare', duration: 5, bg: 'f8fafb',
    texts: [
      { text: 'לפני Gemini:', bold: true, size: 44, color: 'E76F7A', y: 700 },
      { text: '60 דקות עבודה', bold: true, size: 56, color: '1e3a5f', y: 790 },
      { text: 'אחרי Gemini:', bold: true, size: 44, color: '2A9D8F', y: 960 },
      { text: '5 דקות בלבד!', bold: true, size: 64, color: '5abf92', y: 1060 },
    ]
  },
  {
    id: 'cta', duration: 4, bg: '1e3a5f',
    texts: [
      { text: 'נסו בעצמכם!', bold: true, size: 64, color: 'ffffff', y: 780 },
      { text: 'gemini.google.com', bold: true, size: 44, color: '5abf92', y: 900 },
      { text: 'קישור בביו', bold: false, size: 36, color: '7babd4', y: 1000 },
    ]
  },
  {
    id: 'outro', duration: 3, bg: 'ffffff',
    texts: [
      { text: 'Lerani', bold: true, size: 72, color: '1e3a5f', y: 850 },
      { text: 'עקבו לעוד טיפים!', bold: true, size: 44, color: '2A9D8F', y: 980 },
    ]
  },
];

function run(cmd) {
  return execSync(cmd, { stdio: 'pipe', shell: true }).toString();
}

function escapeText(text) {
  return text.replace(/:/g, '\\:').replace(/'/g, "\\\\'").replace(/!/g, '\\!');
}

function createClip(frame, index) {
  const drawTexts = frame.texts.map(t => {
    const fontName = t.bold ? 'Arial Bold' : 'Arial';
    return `drawtext=text='${escapeText(t.text)}':font='${fontName}':fontsize=${t.size}:fontcolor=0x${t.color}:x=(w-text_w)/2:y=${t.y}`;
  }).join(',');

  const clipPath = `${OUT_DIR}/clip_${String(index).padStart(2, '0')}.mp4`;
  const cmd = `"${FFMPEG}" -y -f lavfi -i "color=c=0x${frame.bg}:s=${W}x${H}:d=${frame.duration}" -vf "${drawTexts}" -c:v libx264 -pix_fmt yuv420p -r 30 "${clipPath}"`;

  console.log(`  ${index + 1}/${frames.length}: ${frame.id} (${frame.duration}s)`);
  try {
    run(cmd);
    return clipPath;
  } catch (err) {
    console.error(`  ERROR ${frame.id}:`, err.stderr?.toString().slice(-300));
    return null;
  }
}

// Main
console.log('Creating Gemini 5-min Reel\n');
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync('docs/training/gemini-5min', { recursive: true });

const clipPaths = [];
for (let i = 0; i < frames.length; i++) {
  const path = createClip(frames[i], i);
  if (path) clipPaths.push(path);
}

if (clipPaths.length === frames.length) {
  const concatContent = clipPaths.map(p => `file '${p.replace(OUT_DIR + '/', '')}'`).join('\n');
  writeFileSync(`${OUT_DIR}/clips.txt`, concatContent);

  const output = 'docs/training/gemini-5min/reel-9x16.mp4';
  console.log('\nConcatenating...');
  run(`"${FFMPEG}" -y -f concat -safe 0 -i "${OUT_DIR}/clips.txt" -c copy "${output}"`);

  const totalDuration = frames.reduce((sum, f) => sum + f.duration, 0);
  console.log(`\nDone! ${output} (${totalDuration}s)`);
} else {
  console.error(`\nFailed: ${clipPaths.length}/${frames.length} clips created`);
}
