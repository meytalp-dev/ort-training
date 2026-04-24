const puppeteer = require('puppeteer');
const path = require('path');

const slug = process.argv[2] || 'joint-elka';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const fileUrl = 'file:///' + path.resolve(`docs/personal/cover-letters/${slug}.html`).replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: `docs/personal/cover-letters/cover-letter-${slug}.pdf`,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' }
  });
  await browser.close();
  console.log(`PDF created: cover-letter-${slug}.pdf`);
})();
