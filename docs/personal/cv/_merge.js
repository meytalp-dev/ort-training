const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

(async () => {
  const cv = await PDFDocument.load(fs.readFileSync('docs/personal/cv/cv-meytal-peleg.pdf'));
  const award = await PDFDocument.load(fs.readFileSync('docs/personal/cv/awards/education-award-2021.pdf'));
  const merged = await PDFDocument.create();

  const cvPages = await merged.copyPages(cv, cv.getPageIndices());
  cvPages.forEach(p => merged.addPage(p));

  const awardPages = await merged.copyPages(award, award.getPageIndices());
  awardPages.forEach(p => merged.addPage(p));

  const bytes = await merged.save();
  fs.writeFileSync('docs/personal/cv/cv-meytal-peleg-full.pdf', bytes);
  console.log('Merged:', bytes.length, 'bytes');
})();
