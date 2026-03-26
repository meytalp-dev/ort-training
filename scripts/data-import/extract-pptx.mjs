import JSZip from 'jszip';
import fs from 'fs';

async function extractPptx() {
  const data = fs.readFileSync('היגיינה אישית וסביבתית (1).pptx');
  const zip = await JSZip.loadAsync(data);

  const files = Object.keys(zip.files);

  const slides = files.filter(f => f.match(/ppt\/slides\/slide\d+\.xml$/)).sort((a, b) => {
    const na = parseInt(a.match(/slide(\d+)/)[1]);
    const nb = parseInt(b.match(/slide(\d+)/)[1]);
    return na - nb;
  });

  console.log('Total slides:', slides.length);
  console.log('---');

  for (const slidePath of slides) {
    const content = await zip.file(slidePath).async('string');
    const texts = [];
    const regex = /<a:t>([^<]+)<\/a:t>/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      texts.push(match[1]);
    }
    const slideNum = slidePath.match(/slide(\d+)/)[1];
    console.log('=== שקף ' + slideNum + ' ===');
    console.log(texts.join('\n'));
    console.log('');
  }
}

extractPptx().catch(e => console.error(e));
