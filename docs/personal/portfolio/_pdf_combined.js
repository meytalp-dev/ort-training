// Builds the combined portfolio PDF: portfolio pages + filtered feedback highlights.
// Run: node docs/personal/portfolio/_pdf_combined.js

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

const BASE = 'https://meytalp-dev.github.io/ort-training';
const PORTFOLIO_PDF = path.resolve('docs/personal/portfolio/meytal-peleg-portfolio.pdf');
const FEEDBACK_TMP = path.resolve('c:/tmp/_feedback-highlights.pdf');

// CSS to hide critical / less-flattering sections of the feedback dashboard for PDF.
// We keep: KPIs, overall score, recommendation, teaching-quality chart, best moments,
// "what to keep" quotes (about her), positive insights, future topics, special thank-you quotes.
// We hide: "what to change" quotes, difficulty/practice/organizations charts, negative insights.
const FEEDBACK_PRINT_CSS = `
@page { size: A4; margin: 10mm 10mm; }
@media print {
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body { font-size: 11.5px !important; padding: 0 !important; background: white !important; }
  .lerani-logo { display: none !important; }

  /* Hide critique/neutral charts — keep only the flattering ones */
  .chart-card:has(#difficultyChart),
  .chart-card:has(#practiceChart),
  .chart-card:has(#orgChart) { display: none !important; }

  /* Hide the "what to change" criticism column */
  .quotes-card.change { display: none !important; }
  .quotes-grid { grid-template-columns: 1fr !important; }

  /* Hide negative insight items (1=needs more practice, 3=pace too fast, 5=missing recordings) */
  .insight-item:nth-child(1),
  .insight-item:nth-child(3),
  .insight-item:nth-child(5) { display: none !important; }
  /* Re-flow remaining 3 items in a single row so there's no empty gap */
  .insight-grid {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 12px !important;
  }
  .insight-item { padding: 14px !important; }
  .insight-text { font-size: 0.88rem !important; line-height: 1.55 !important; }

  /* Tighten layout */
  .header { padding: 24px 20px !important; margin-bottom: 18px !important; }
  .header h1 { font-size: 1.7rem !important; }
  .kpi-row { gap: 12px !important; margin-bottom: 18px !important; }
  .kpi-card { padding: 18px 14px !important; }
  .kpi-number { font-size: 2.2rem !important; }
  .charts-grid { gap: 14px !important; margin-bottom: 18px !important; }
  .chart-card { padding: 18px !important; break-inside: avoid !important; }
  .chart-container { height: 200px !important; }
  .chart-container.tall { height: 240px !important; }

  .moments-section, .insights-section, .topics-section, .quotes-section {
    margin-bottom: 18px !important;
    padding: 22px !important;
    break-inside: avoid !important;
  }
  .moment, .quote { padding: 12px 14px !important; margin-bottom: 8px !important; font-size: 0.92rem !important; }
  .quotes-grid { gap: 14px !important; }
  .quotes-card { padding: 22px !important; break-inside: avoid !important; }

  .footer { padding: 12px !important; }
}
`;

async function renderFeedback() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1800, deviceScaleFactor: 2 });
  console.log(`→ feedback page`);
  await page.goto(`${BASE}/training/claude-code/feedback-summary.html`, { waitUntil: 'networkidle2', timeout: 60000 });

  // Wait for charts to render
  await new Promise(r => setTimeout(r, 2500));

  await page.evaluate(async () => {
    await new Promise(resolve => {
      let y = 0;
      const t = setInterval(() => {
        window.scrollTo(0, y);
        y += 500;
        if (y >= document.body.scrollHeight) { clearInterval(t); window.scrollTo(0, 0); resolve(); }
      }, 70);
    });
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.addStyleTag({ content: FEEDBACK_PRINT_CSS });
  await page.emulateMediaType('print');

  await page.pdf({
    path: FEEDBACK_TMP,
    format: 'A4',
    printBackground: true,
    margin: { top: '10mm', right: '10mm', bottom: '12mm', left: '10mm' },
    displayHeaderFooter: true,
    headerTemplate: `<div></div>`,
    footerTemplate: `<div style="font-size:8.5px; width:100%; text-align:center; color:#4a6a8a; font-family:Heebo,sans-serif; padding: 0 14mm;">
      מיטל פלג · ציטוטים מהקורס Claude Code · <span class="pageNumber"></span>
    </div>`
  });
  console.log(`  ok — ${FEEDBACK_TMP}`);
  await browser.close();
}

async function merge() {
  const out = await PDFDocument.create();
  for (const f of [PORTFOLIO_PDF, FEEDBACK_TMP]) {
    const src = await PDFDocument.load(fs.readFileSync(f));
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach(p => out.addPage(p));
    console.log(`  + ${path.basename(f)} (${src.getPageCount()} pages)`);
  }
  const bytes = await out.save();
  fs.writeFileSync(PORTFOLIO_PDF, bytes);
  console.log(`merged → ${PORTFOLIO_PDF} (${out.getPageCount()} pages, ${(bytes.length/1024/1024).toFixed(2)} MB)`);
}

(async () => {
  // First regenerate the portfolio core (4 pages)
  console.log('→ regenerating portfolio core');
  require('child_process').execSync('node docs/personal/portfolio/_pdf.js', { stdio: 'inherit' });
  // Then build filtered feedback PDF
  await renderFeedback();
  // Then merge
  await merge();
})().catch(e => { console.error(e); process.exit(1); });
