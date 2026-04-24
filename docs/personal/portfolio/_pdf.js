const puppeteer = require('puppeteer');
const path = require('path');

const URL = 'https://meytalp-dev.github.io/ort-training/personal/portfolio/';
const OUT = path.resolve('docs/personal/portfolio/meytal-peleg-portfolio.pdf');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });

  console.log(`→ loading ${URL}`);
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });

  await page.evaluate(async () => {
    await new Promise(resolve => {
      let y = 0;
      const step = 400;
      const timer = setInterval(() => {
        window.scrollTo(0, y);
        y += step;
        if (y >= document.body.scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 80);
    });
  });

  await new Promise(r => setTimeout(r, 2500));

  await page.addStyleTag({
    content: `
      @media print {
        .bg-shapes { display: none !important; }
        html, body { background: #ffffff !important; }
        a { text-decoration: none !important; }
        .hero { page-break-after: avoid; }
        section { page-break-inside: avoid; }
        .work-card, .pillar-card, .testimonial, .contact-method {
          page-break-inside: avoid;
        }
      }
    `
  });

  await page.emulateMediaType('print');

  console.log('→ rendering PDF');
  await page.pdf({
    path: OUT,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: false,
    margin: { top: '12mm', right: '10mm', bottom: '12mm', left: '10mm' },
    displayHeaderFooter: true,
    footerTemplate: `
      <div style="font-size:9px; width:100%; text-align:center; color:#4a6a8a; font-family:Heebo,Assistant,sans-serif;">
        מיטל פלג · תיק עבודות · <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>`,
    headerTemplate: `<div></div>`
  });

  console.log(`  ok — ${OUT}`);
  await browser.close();
})();
