import { readFileSync } from 'fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const file = process.argv[2];
const buf = readFileSync(file);
const data = new Uint8Array(buf);

const doc = await getDocument({ data }).promise;
console.log(`Pages: ${doc.numPages}`);

for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const content = await page.getTextContent();
  const text = content.items.map(item => item.str).join(' ');
  console.log(`\n--- PAGE ${i} ---`);
  console.log(text);
}
