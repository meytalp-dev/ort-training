const puppeteer = require('puppeteer');
const path = require('path');

const URL = 'https://meytalp-dev.github.io/ort-training/personal/portfolio/';
const OUT = path.resolve('docs/personal/portfolio/meytal-peleg-portfolio.pdf');

const PRINT_CSS = `
@page { size: A4; margin: 12mm 11mm; }

@media print {
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

  html, body { background: #ffffff !important; font-size: 12px !important; }

  .bg-shapes, nav { display: none !important; }

  a { text-decoration: none !important; color: inherit !important; }

  /* Hero — single column, explicit flex order so text comes first */
  .hero {
    display: flex !important;
    flex-direction: column !important;
    padding: 0 0 18px 0 !important;
    max-width: 100% !important;
    margin: 0 !important;
    gap: 16px;
  }
  .hero > div:first-child { order: 1 !important; width: 100%; }
  .hero-visual { order: 2 !important; }
  .hero h1 { font-size: 28px !important; line-height: 1.15 !important; margin-bottom: 12px !important; }
  .hero .lede { font-size: 13px !important; line-height: 1.6 !important; margin-bottom: 14px !important; max-width: 100% !important; }
  .hero-ctas { display: none !important; }
  .hero-kicker { font-size: 10.5px !important; padding: 5px 12px !important; margin-bottom: 12px !important; }

  /* Convert hero-visual from absolute stat cards to clean 4-up grid */
  .hero-visual {
    position: static !important;
    height: auto !important;
    display: grid !important;
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 10px !important;
    margin-top: 8px !important;
  }
  .stat-card {
    position: static !important;
    transform: none !important;
    width: auto !important;
    padding: 12px 12px !important;
    box-shadow: 0 2px 8px rgba(30,58,95,0.08) !important;
    max-width: 100% !important;
  }
  .stat-card .big { font-size: 20px !important; }
  .stat-card .label { font-size: 9.5px !important; }

  /* Sections base — tight */
  section {
    max-width: 100% !important;
    padding: 14px 0 !important;
    margin: 0 !important;
  }
  .section-title { font-size: 22px !important; margin-bottom: 6px !important; line-height: 1.2 !important; }
  .section-lede { font-size: 12px !important; margin-bottom: 14px !important; max-width: 100% !important; line-height: 1.5 !important; }
  .section-kicker { font-size: 10px !important; margin-bottom: 5px !important; letter-spacing: 1.2px !important; }

  /* About — tighter single column */
  .about {
    display: block !important;
    padding: 20px 22px !important;
    border-radius: 16px !important;
    margin: 0 !important;
  }
  .about-img {
    width: 120px !important;
    height: 120px !important;
    float: left !important;
    margin: 0 0 8px 16px !important;
    border-radius: 12px !important;
    aspect-ratio: auto !important;
  }
  .about-badge { display: none !important; }
  .about-content h3 { font-size: 16px !important; margin-bottom: 8px !important; line-height: 1.3 !important; }
  .about-content p { font-size: 11.5px !important; margin-bottom: 6px !important; line-height: 1.6 !important; }
  .about-quote { font-size: 11.5px !important; margin-top: 10px !important; padding: 8px 12px !important; clear: both; }

  /* Expertise chips */
  .expertise { gap: 6px !important; }
  .chip { font-size: 11px !important; padding: 6px 12px !important; }

  /* Projects — 2 columns, compact cards, avoid mid-card break */
  .projects-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 10px !important;
  }
  .project {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    border-radius: 12px !important;
    box-shadow: 0 2px 8px rgba(30,58,95,0.08) !important;
  }
  .project-visual {
    height: 80px !important;
    background-size: cover !important;
    background-position: center top !important;
  }
  .project-body { padding: 10px 12px !important; }
  .project-tag { font-size: 9.5px !important; margin-bottom: 3px !important; }
  .project h4 { font-size: 13px !important; margin-bottom: 4px !important; line-height: 1.25 !important; }
  .project-body p { font-size: 10.5px !important; line-height: 1.5 !important; margin-bottom: 6px !important; }
  .project-meta { gap: 4px !important; margin-bottom: 6px !important; }
  .meta-pill { font-size: 9px !important; padding: 2px 7px !important; }
  .project-link { font-size: 10.5px !important; }

  /* Training section — must not split across pages */
  #training {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  .training {
    padding: 22px 26px !important;
    border-radius: 16px !important;
    margin: 0 !important;
    overflow: visible !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  .training::before { display: none !important; }
  .training-inner { padding: 0 !important; }
  .training .section-kicker { margin-bottom: 4px !important; }
  .training .section-title { font-size: 20px !important; margin-bottom: 6px !important; }
  .training .section-lede { font-size: 12px !important; margin-bottom: 12px !important; }
  .training-stats {
    display: grid !important;
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 10px !important;
    margin-top: 12px !important;
  }
  .t-stat {
    padding: 12px 12px !important;
    border-radius: 12px !important;
    background: #2d4a6e !important;
    border: 1px solid rgba(255,255,255,0.2) !important;
    backdrop-filter: none !important;
  }
  .t-stat .num { font-size: 24px !important; color: #5abf92 !important; }
  .t-stat .lbl { font-size: 10px !important; color: #e5edf5 !important; }
  .training .btn { padding: 9px 18px !important; font-size: 12px !important; }
  .training > div > div[style*="margin-top"] { margin-top: 14px !important; }

  /* Impact numbers — stay tight so keep on one page */
  .impact-row {
    gap: 10px !important;
    flex-wrap: wrap !important;
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
  }
  .impact-num {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  .impact-num .n { font-size: 28px !important; }
  .impact-num .t { font-size: 10.5px !important; }

  /* Award */
  .award { padding: 16px 20px !important; border-radius: 16px !important; gap: 14px !important; }
  .award-badge { width: 42px !important; height: 42px !important; flex: 0 0 42px !important; }
  .award-text h4 { font-size: 14px !important; margin-bottom: 3px !important; }
  .award-text p { font-size: 11px !important; line-height: 1.5 !important; }

  /* Contact — must stay on one page (heading + buttons + footer together) */
  #contact {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    text-align: center;
  }
  .contact h2 { font-size: 20px !important; line-height: 1.25 !important; margin-bottom: 8px !important; }
  .contact .section-lede { margin-bottom: 14px !important; }
  .contact-methods {
    display: grid !important;
    grid-template-columns: repeat(5, 1fr) !important;
    gap: 8px !important;
    max-width: 100% !important;
    margin: 0 auto !important;
    justify-content: center !important;
  }
  .contact-btn {
    font-size: 10.5px !important;
    padding: 9px 8px !important;
    gap: 6px !important;
  }
  .contact-btn svg { width: 14px !important; height: 14px !important; }

  /* Testimonial blocks */
  .testimonial, .testimonials-grid > * {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  /* Keep award and contact together; impact stays contained */
  #training + section,
  #training + section + section,
  #contact { break-before: auto; }

  /* Avoid orphaned section kickers/titles */
  .section-kicker, .section-title {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }

  /* Hide in-page footer — we show a running page footer via puppeteer */
  body > footer { display: none !important; }
}
`;

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  // Wider viewport so responsive grid stays desktop-shaped before we override for print
  await page.setViewport({ width: 1280, height: 1800, deviceScaleFactor: 2 });

  console.log(`→ loading ${URL}`);
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });

  // Force images to finish loading
  await page.evaluate(async () => {
    const imgs = Array.from(document.images);
    await Promise.all(imgs.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(res => { img.onload = img.onerror = res; });
    }));
  });

  // Slow scroll to trigger lazy backgrounds
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let y = 0;
      const step = 500;
      const timer = setInterval(() => {
        window.scrollTo(0, y);
        y += step;
        if (y >= document.body.scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 70);
    });
  });

  await new Promise(r => setTimeout(r, 1800));

  await page.addStyleTag({ content: PRINT_CSS });
  await page.emulateMediaType('print');

  console.log('→ rendering PDF');
  await page.pdf({
    path: OUT,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '14mm', right: '12mm', bottom: '14mm', left: '12mm' },
    displayHeaderFooter: true,
    headerTemplate: `<div></div>`,
    footerTemplate: `
      <div style="font-size:8.5px; width:100%; text-align:center; color:#4a6a8a; font-family:Heebo,Assistant,sans-serif; padding: 0 14mm;">
        מיטל פלג · תיק עבודות · <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>`
  });

  console.log(`  ok — ${OUT}`);
  await browser.close();
})();
