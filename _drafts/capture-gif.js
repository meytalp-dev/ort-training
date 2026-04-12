const puppeteer = require('puppeteer');
const { createCanvas, loadImage } = require('canvas');
const GIFEncoder = require('gif-encoder-2');
const { PNG } = require('pngjs');
const path = require('path');
const fs = require('fs');

(async () => {
    console.log('Starting browser...');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const filePath = path.resolve(__dirname, '..', 'docs', 'marketing', 'campaigns', 'campaign-fly.html');
    await page.goto('file:///' + filePath.replace(/\\/g, '/'), { waitUntil: 'networkidle2' });

    // Wait for fonts
    await page.waitForFunction(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 3000));

    // Capture frames
    const totalFrames = 40;
    const frameInterval = 100; // 100ms between frames = ~4 seconds total
    const frames = [];

    // Output size (scaled down for sharing)
    const outW = 540;
    const outH = 960;

    console.log('Capturing frames...');
    for (let i = 0; i < totalFrames; i++) {
        const buf = await page.screenshot({ clip: { x: 0, y: 0, width: 1080, height: 1920 } });
        frames.push(buf);
        await new Promise(r => setTimeout(r, frameInterval));
        process.stdout.write(`\rFrame ${i + 1}/${totalFrames}`);
    }
    console.log('\nFrames captured!');
    await browser.close();

    // Create GIF
    console.log('Building GIF...');
    const encoder = new GIFEncoder(outW, outH);
    const outputPath = path.resolve(__dirname, '..', 'docs', 'marketing', 'campaigns', 'campaign-fly.gif');
    const writeStream = fs.createWriteStream(outputPath);

    encoder.createReadStream().pipe(writeStream);
    encoder.start();
    encoder.setRepeat(0);   // loop forever
    encoder.setDelay(100);  // 100ms per frame
    encoder.setQuality(10);

    for (let i = 0; i < frames.length; i++) {
        const png = PNG.sync.read(frames[i]);

        // Scale down
        const scaled = new Uint8Array(outW * outH * 4);
        const sx = 1080 / outW;
        const sy = 1920 / outH;

        for (let y = 0; y < outH; y++) {
            for (let x = 0; x < outW; x++) {
                const srcX = Math.floor(x * sx);
                const srcY = Math.floor(y * sy);
                const srcIdx = (srcY * 1080 + srcX) * 4;
                const dstIdx = (y * outW + x) * 4;
                scaled[dstIdx] = png.data[srcIdx];
                scaled[dstIdx + 1] = png.data[srcIdx + 1];
                scaled[dstIdx + 2] = png.data[srcIdx + 2];
                scaled[dstIdx + 3] = png.data[srcIdx + 3];
            }
        }
        encoder.addFrame(scaled);
        process.stdout.write(`\rEncoding frame ${i + 1}/${frames.length}`);
    }

    encoder.finish();
    console.log('\nGIF saved to: ' + outputPath);

    writeStream.on('finish', () => {
        const stats = fs.statSync(outputPath);
        console.log('File size: ' + (stats.size / 1024 / 1024).toFixed(2) + ' MB');
    });
})();
