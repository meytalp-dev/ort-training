const puppeteer = require('puppeteer');
const path = require('path');

const BASE = 'https://meytalp-dev.github.io/ort-training';
const OUT = path.resolve('docs/personal/portfolio/screenshots');

// Pages that need special handling (PIN dismissal, sub-view, longer wait, etc.)
const targets = [
  { id: 'gantt',           url: `${BASE}/management/gantt.html`,              wait: 2500 },
  { id: 'student-file',    url: `${BASE}/management/student-file.html` },
  { id: 'attendance',      url: `${BASE}/management/attendance-report.html`,  wait: 3000 },
  { id: 'practice-exams',  url: `${BASE}/practice-exams/` },
  { id: 'counselor-hub',   url: `${BASE}/management/counselor-hub.html` },
  { id: 'student-risk',    url: `${BASE}/management/student-risk.html` },
  { id: 'lesson-demo',     url: `${BASE}/lessons/hitpael-nifal/` },
  { id: 'five-dimensions', url: `${BASE}/management/five-dimensions.html` },
  { id: 'ai-tools',        url: `${BASE}/marketing/ai-tools.html` },
  { id: 'oti',             url: `${BASE}/autism/oti/` },
  { id: 'hofa',            url: `${BASE}/hofa/authorities-landing.html` },
  { id: 'morning',         url: `${BASE}/management/morning-schedule.html` },
  { id: 'claude-training', url: `${BASE}/training/claude-code/landing-page.html` },
];

async function dismissOverlays(page) {
  await page.evaluate(() => {
    // PIN modals
    document.querySelectorAll('.pin-modal, [id*="pinModal" i], [class*="pin-modal" i]').forEach(el => {
      el.style.display = 'none';
      el.classList.remove('show');
    });
    // Loading spinners / overlays
    document.querySelectorAll(
      '.loader, .loading, [class*="loader" i], [class*="loading" i], [id*="loader" i], [id*="loading" i]'
    ).forEach(el => {
      const txt = (el.innerText || '').trim();
      if (txt.length < 50) el.style.display = 'none';
    });
    // Hide empty-state / loading sections containing "טוען"
    document.querySelectorAll('div, section').forEach(el => {
      const txt = (el.innerText || '').trim();
      if (txt === 'טוען מערכת שעות...' || /^טוען/.test(txt) && txt.length < 40) {
        el.style.display = 'none';
      }
    });
    document.body.style.overflow = 'auto';
  });
}

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  for (const t of targets) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
    try {
      console.log(`→ ${t.id}`);
      await page.goto(t.url, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, t.wait || 1500));
      if (t.dismissPin) await dismissOverlays(page);
      await new Promise(r => setTimeout(r, 500));
      await page.screenshot({
        path: path.join(OUT, `${t.id}.jpg`),
        type: 'jpeg',
        quality: 82,
        clip: { x: 0, y: 0, width: 1440, height: 900 }
      });
      console.log(`  ok — ${t.id}.jpg`);
    } catch (e) {
      console.log(`  FAIL ${t.id}: ${e.message}`);
    }
    await page.close();
  }
  await browser.close();
  console.log('done');
})();
