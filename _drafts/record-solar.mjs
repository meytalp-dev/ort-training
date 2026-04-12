import { chromium } from 'playwright';
import { mkdirSync, readdirSync, renameSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';

const HTML_PATH = resolve('_drafts/solar-system-gemini.html');
const OUT_DIR = resolve('_drafts/solar-video');
mkdirSync(OUT_DIR, { recursive: true });

const URL = 'file:///' + HTML_PATH.replace(/\\/g, '/') + '?auto=1';
const DURATION_MS = 10500; // 10.5s, we'll trim to 10s

const FFMPEG = 'C:/Users/meyta/AppData/Local/ms-playwright/ffmpeg-1011/ffmpeg-win64.exe';
const FFMPEG_EXISTS = existsSync(FFMPEG);
const CHROME_EXE = 'C:/Users/meyta/AppData/Local/ms-playwright/chromium-1208/chrome-win64/chrome.exe';

const formats = [
  { name: 'facebook-16x9', width: 1280, height: 720 },
  { name: 'instagram-1x1', width: 1080, height: 1080 },
];

async function recordOne(fmt) {
  const tmpDir = join(OUT_DIR, fmt.name + '-tmp');
  mkdirSync(tmpDir, { recursive: true });

  console.log(`\n→ Recording ${fmt.name} (${fmt.width}x${fmt.height})...`);

  const browser = await chromium.launch({ headless: true, executablePath: CHROME_EXE });
  const context = await browser.newContext({
    viewport: { width: fmt.width, height: fmt.height },
    recordVideo: { dir: tmpDir, size: { width: fmt.width, height: fmt.height } },
  });
  const page = await context.newPage();
  await page.goto(URL);
  await page.waitForTimeout(800); // let scene init + fonts load
  // Reset the autoMode timer by reloading
  await page.evaluate(() => { /* ensure rendering loop running */ });
  await page.waitForTimeout(DURATION_MS);

  await page.close();
  await context.close();
  await browser.close();

  // Find recorded webm and rename
  const files = readdirSync(tmpDir).filter(f => f.endsWith('.webm'));
  if (!files.length) {
    console.error(`  ✗ No video file produced for ${fmt.name}`);
    return null;
  }
  const webmPath = join(tmpDir, files[0]);
  const finalWebm = join(OUT_DIR, `solar-${fmt.name}.webm`);
  renameSync(webmPath, finalWebm);
  console.log(`  ✓ ${finalWebm}`);

  // Convert to mp4 if ffmpeg is available
  if (FFMPEG_EXISTS) {
    const mp4Path = join(OUT_DIR, `solar-${fmt.name}.mp4`);
    try {
      execSync(`"${FFMPEG}" -y -i "${finalWebm}" -t 10 -c:v libx264 -pix_fmt yuv420p -movflags +faststart -crf 20 "${mp4Path}"`, { stdio: 'pipe' });
      console.log(`  ✓ ${mp4Path}`);
    } catch (e) {
      console.error(`  ✗ ffmpeg failed for ${fmt.name}:`, e.message);
    }
  }

  return finalWebm;
}

console.log('Solar System Recorder');
console.log('======================');
console.log('Source:', URL);
console.log('FFmpeg:', FFMPEG_EXISTS ? 'available' : 'NOT FOUND (webm only)');

for (const fmt of formats) {
  await recordOne(fmt);
}

console.log('\nDone. Files in:', OUT_DIR);
