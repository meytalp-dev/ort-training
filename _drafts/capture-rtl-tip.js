const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
  const filePath = path.resolve(__dirname, 'daily-tip-2026-04-10-rtl-fix.html');
  await page.goto('file:///' + filePath.replace(/\\/g, '/'), { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  const el = await page.$('.canvas');
  const out = path.resolve(__dirname, '..', 'docs', 'marketing', 'assets', 'posts', 'daily-tip-2026-04-10-rtl-fix.png');
  await el.screenshot({ path: out });
  await browser.close();
  console.log('saved:', out);
})();
