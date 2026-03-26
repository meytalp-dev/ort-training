import puppeteer from 'puppeteer';
import path from 'path';

const file = process.argv[2];
if (!file) { console.error('Usage: node screenshot.mjs <html-file>'); process.exit(1); }

const abs = path.resolve(file);
const out = abs.replace(/\.html$/, '.png');

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 2 });
await page.goto('file:///' + abs.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });

const card = await page.$('.invitation');
await card.screenshot({ path: out, type: 'png' });
await browser.close();

console.log('Saved:', out);
