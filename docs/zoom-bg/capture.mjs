import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(__dirname, 'export-b.html');
const outPath = path.resolve(__dirname, 'zoom-bg-claude-code.png');
const url = 'file:///' + htmlPath.replace(/\\/g, '/');
console.log('Loading:', url);

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });

// Debug: check if the page has content
const bodyHTML = await page.evaluate(() => document.body.innerHTML.substring(0, 200));
console.log('Body preview:', bodyHTML);

const bgColor = await page.evaluate(() => {
  const el = document.querySelector('.zoom-bg');
  if (!el) return 'NO ELEMENT FOUND';
  const style = window.getComputedStyle(el);
  return `bg: ${style.background}, w: ${el.offsetWidth}, h: ${el.offsetHeight}`;
});
console.log('Element info:', bgColor);

await new Promise(r => setTimeout(r, 2000));
await page.screenshot({ path: outPath, type: 'png' });
await browser.close();

console.log('Saved:', outPath);
