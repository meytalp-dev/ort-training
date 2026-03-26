import { useState, useRef, useCallback } from 'react';
import { Upload, ArrowRight, RotateCcw } from 'lucide-react';
import { colorPalettes, type ColorPalette } from '@/data/studio';
import { useWizard } from '@/store/wizard';

// Simple K-means-ish dominant color extraction using canvas
function extractColors(img: HTMLImageElement, k = 5): string[] {
  const canvas = document.createElement('canvas');
  const size = 100; // downsample for speed
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;

  // Collect pixel colors, skip near-white/near-black
  const pixels: [number, number, number][] = [];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 128) continue;
    const brightness = (r + g + b) / 3;
    if (brightness > 240 || brightness < 15) continue;
    pixels.push([r, g, b]);
  }

  if (pixels.length === 0) return ['#888888'];

  // Simple clustering: pick k diverse centroids
  const centroids: [number, number, number][] = [pixels[0]];
  for (let c = 1; c < k && c < pixels.length; c++) {
    let best: [number, number, number] = pixels[0];
    let bestDist = 0;
    for (const p of pixels) {
      const minDist = Math.min(...centroids.map(ct => colorDist(p, ct)));
      if (minDist > bestDist) { bestDist = minDist; best = p; }
    }
    centroids.push(best);
  }

  // One round of assignment + update
  const clusters: [number, number, number][][] = centroids.map(() => []);
  for (const p of pixels) {
    let minIdx = 0, minD = Infinity;
    for (let i = 0; i < centroids.length; i++) {
      const d = colorDist(p, centroids[i]);
      if (d < minD) { minD = d; minIdx = i; }
    }
    clusters[minIdx].push(p);
  }

  return clusters
    .filter(cl => cl.length > 0)
    .sort((a, b) => b.length - a.length)
    .slice(0, k)
    .map(cl => {
      const avg = cl.reduce((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0]);
      return rgbToHex(Math.round(avg[0] / cl.length), Math.round(avg[1] / cl.length), Math.round(avg[2] / cl.length));
    });
}

function colorDist(a: [number, number, number], b: [number, number, number]) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function paletteDistance(extracted: string[], palette: ColorPalette): number {
  const eRgb = extracted.map(hexToRgb);
  const pRgb = palette.colors.map(c => hexToRgb(c.hex));
  let total = 0;
  for (const e of eRgb) {
    const minD = Math.min(...pRgb.map(p => colorDist(e, p)));
    total += minD;
  }
  return total / eRgb.length;
}

function findClosestPalettes(extracted: string[], count = 4): ColorPalette[] {
  return [...colorPalettes]
    .map(p => ({ palette: p, dist: paletteDistance(extracted, p) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, count)
    .map(x => x.palette);
}

interface Props {
  onBack: () => void;
}

export default function LogoExtractor({ onBack }: Props) {
  const { setPalette, setStep } = useWizard();
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<ColorPalette[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      setImgSrc(src);
      const img = new window.Image();
      img.onload = () => {
        const colors = extractColors(img);
        setExtracted(colors);
        setSuggestions(findClosestPalettes(colors));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const selectPalette = (p: ColorPalette) => {
    setPalette(p);
    setStep(1); // go to style selection
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-heebo">העלו את הלוגו</h2>
        <p className="text-muted-foreground">נחלץ את הצבעים הדומיננטיים ונציע שילובים מתאימים</p>
      </div>

      {!imgSrc ? (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-border rounded-2xl p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
        >
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">לחצו להעלאת תמונה</p>
          <p className="text-sm text-muted-foreground">PNG, JPG, SVG</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preview + extracted colors */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <img src={imgSrc} alt="לוגו" className="w-32 h-32 object-contain rounded-xl border border-border bg-card p-2" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-bold">צבעים שזוהו:</p>
              <div className="flex gap-2">
                {extracted.map((hex, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-xl border border-border shadow-sm" style={{ backgroundColor: hex }} />
                    <span className="text-[10px] font-mono text-muted-foreground">{hex}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Suggested palettes */}
          {suggestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold">פלטות מתאימות:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestions.map(pal => (
                  <button
                    key={pal.id}
                    onClick={() => selectPalette(pal)}
                    className="rounded-xl border-2 border-border bg-card p-4 text-right hover:border-primary hover:shadow-lg transition-all group"
                  >
                    <div className="flex gap-1 mb-2 h-8 rounded-lg overflow-hidden">
                      {pal.colors.map((c, j) => (
                        <div key={j} className="flex-1" style={{ backgroundColor: c.hex }} />
                      ))}
                    </div>
                    <p className="font-bold text-sm">{pal.name}</p>
                    <p className="text-xs text-muted-foreground">{pal.description}</p>
                    <div className="mt-2 text-center">
                      <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        בחרו פלטה זו
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => { setImgSrc(null); setExtracted([]); setSuggestions([]); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <RotateCcw className="w-4 h-4" /> העלו תמונה אחרת
          </button>
        </div>
      )}

      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowRight className="w-4 h-4" /> חזרה
      </button>
    </div>
  );
}
