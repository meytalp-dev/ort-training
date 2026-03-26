import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';

const dir = 'docs/lessons/hair-styling/originals';
const outDir = 'docs/lessons/hair-styling/originals';

async function extractPptx(filePath) {
  const data = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(data);
  const files = Object.keys(zip.files);
  const slides = files.filter(f => f.match(/ppt\/slides\/slide\d+\.xml$/)).sort((a, b) => {
    const na = parseInt(a.match(/slide(\d+)/)[1]);
    const nb = parseInt(b.match(/slide(\d+)/)[1]);
    return na - nb;
  });

  let output = `# ${path.basename(filePath, '.pptx')}\nTotal slides: ${slides.length}\n\n`;

  for (const slidePath of slides) {
    const content = await zip.file(slidePath).async('string');
    const texts = [];
    const regex = /<a:t>([^<]+)<\/a:t>/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      texts.push(match[1]);
    }
    const slideNum = slidePath.match(/slide(\d+)/)[1];
    output += `=== שקף ${slideNum} ===\n${texts.join('\n')}\n\n`;
  }
  return output;
}

async function main() {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.pptx'));
  let allContent = '';
  for (const file of files) {
    console.log('Extracting:', file);
    const content = await extractPptx(path.join(dir, file));
    allContent += content + '\n---\n\n';
  }
  fs.writeFileSync(path.join(outDir, 'all-content.txt'), allContent, 'utf8');
  console.log('Done! Saved to all-content.txt');
}

main().catch(e => console.error(e));
