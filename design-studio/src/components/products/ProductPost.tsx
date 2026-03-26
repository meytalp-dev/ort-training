import { useWizard } from '@/store/wizard';
import { useRef, useState } from 'react';
import { detectTheme, generateDecorationHTML, getSecondaryEmojis } from '@/lib/thematicDecorations';
import { getBgFromPalette } from '@/lib/paletteBg';
import { getToolbarHTML } from '@/lib/toolbarHTML';
import ColorCustomizer, { type ColorOverrides } from './ColorCustomizer';
import { fontFamilyMap } from '@/lib/fontFamily';

interface Props {
  onBack: () => void;
}

export default function ProductPost({ onBack }: Props) {
  const { palette, style, fontCombo, buttonStyle } = useWizard();
  const previewRef = useRef<HTMLDivElement>(null);
  const [themeText, setThemeText] = useState('');
  const detectedTheme = detectTheme(themeText);
  const secondaryEmojis = getSecondaryEmojis(themeText);
  const c = palette?.colors || [];
  const paletteBg = getBgFromPalette(c);
  const [colors, setColors] = useState<ColorOverrides>({
    heading: c[0]?.hex || '#333',
    background: paletteBg,
    accent: c[0]?.hex || '#333',
    button: c[0]?.hex || '#333',
    text: '#555555',
  });

  if (!palette || !style || !fontCombo || !buttonStyle) return null;

  const headingFont = fontFamilyMap[fontCombo.heading] || `'${fontCombo.heading}', sans-serif`;
  const bodyFont = fontFamilyMap[fontCombo.body] || `'${fontCombo.body}', sans-serif`;

  const isOutline = buttonStyle.category === 'outline';
  const isGradient = buttonStyle.category === 'gradient';
  const btnBg = isOutline ? 'transparent' : isGradient ? `linear-gradient(135deg, ${colors.button}, ${c[3]?.hex || c[1]?.hex})` : colors.button;
  const btnColor = isOutline ? colors.button : '#fff';
  const btnBorder = isOutline ? `2px solid ${colors.button}` : 'none';
  const decorationHTML = detectedTheme ? generateDecorationHTML(detectedTheme) : '';

  const openInNewTab = () => {
    const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<title>פוסט – ${palette.name}</title>
<link href="https://fonts.googleapis.com/css2?family=${fontCombo.heading.replace(/ /g, '+')}&family=${fontCombo.body.replace(/ /g, '+')}&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f0f0f0; }
.post { width: 1080px; height: 1080px; position: relative; overflow: hidden; background: ${colors.background}; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 80px; }
.post [contenteditable]:focus { outline: 2px dashed ${colors.accent}; outline-offset: 4px; }
.accent-bar { position: absolute; top: 0; left: 0; right: 0; height: 12px; background: linear-gradient(90deg, ${c.map(col => col.hex).join(', ')}); }
.accent-bottom { position: absolute; bottom: 0; left: 0; right: 0; height: 12px; background: linear-gradient(90deg, ${c.map(col => col.hex).join(', ')}); }
.blob { position: absolute; border-radius: 50%; opacity: 0.08; }
h1 { font-family: ${headingFont}; font-size: 72px; color: ${colors.heading}; margin-bottom: 24px; line-height: 1.2; }
p { font-family: ${bodyFont}; font-size: 28px; color: ${colors.text}; line-height: 1.6; margin-bottom: 40px; max-width: 800px; }
.cta { display: inline-flex; align-items: center; justify-content: center; font-family: ${bodyFont}; font-size: 24px; font-weight: 600; padding: 16px 48px; background: ${btnBg}; color: ${btnColor}; border: ${btnBorder}; border-radius: ${buttonStyle.css.borderRadius || '12px'}; cursor: pointer; }
.dots { display: flex; gap: 12px; position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); }
.dot { width: 16px; height: 16px; border-radius: 50%; }
</style>
</head>
<body>
${getToolbarHTML('.post', 'post-' + palette.name, colors.accent)}
<div class="post">
  <div class="accent-bar"></div>
  <div class="blob" style="width:300px;height:300px;background:${colors.accent};top:-50px;right:-50px;"></div>
  <div class="blob" style="width:250px;height:250px;background:${c[2]?.hex || colors.accent};bottom:60px;left:-40px;"></div>
  ${decorationHTML}
  <h1 contenteditable="true">${themeText || 'הכותרת שלך כאן'}</h1>
  <p contenteditable="true">טקסט תיאורי קצר שמסביר את המסר העיקרי של הפוסט. ערכו את הטקסט לפי הצורך.</p>
  <div class="cta" contenteditable="true">קריאה לפעולה</div>
  <div class="accent-bottom"></div>
  <div class="dots">${c.map(col => `<div class="dot" style="background:${col.hex}"></div>`).join('')}</div>
</div>
</body>
</html>`;
    const w = window.open();
    if (w) { w.document.write(html); w.document.close(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">← חזרה לתוצרים</button>
        <h2 className="text-xl font-bold font-heebo">📱 פוסט לרשתות חברתיות</h2>
      </div>

      {/* Theme input */}
      <div className="flex flex-col items-center gap-2">
        <label className="text-sm font-medium text-muted-foreground">✨ כתבי נושא והאלמנטים יתאימו אוטומטית</label>
        <input
          type="text"
          value={themeText}
          onChange={(e) => setThemeText(e.target.value)}
          placeholder="לדוגמה: חג פסח שמח, יום הולדת, חתונה..."
          className="w-full max-w-md px-4 py-2.5 rounded-xl border border-border bg-background text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          dir="rtl"
        />
        {detectedTheme && (
          <div className="flex items-center gap-2 text-sm text-primary animate-fade-in">
            <span>זוהה נושא: {detectedTheme.label}</span>
            <span className="flex gap-1">{secondaryEmojis.map((e, i) => <span key={i}>{e}</span>)}</span>
          </div>
        )}
      </div>

      {/* Color customizer */}
      <ColorCustomizer
        paletteColors={c}
        defaultBg={style.bgColor}
        overrides={colors}
        onChange={setColors}
      />

      {/* Preview */}
      <div className="flex justify-center">
        <div
          ref={previewRef}
          className="relative overflow-hidden shadow-2xl border border-border"
          style={{ width: 400, height: 400, background: colors.background }}
        >
          {/* Accent bars */}
          <div className="absolute top-0 left-0 right-0 h-2" style={{ background: `linear-gradient(90deg, ${c.map(col => col.hex).join(', ')})` }} />
          <div className="absolute bottom-0 left-0 right-0 h-2" style={{ background: `linear-gradient(90deg, ${c.map(col => col.hex).join(', ')})` }} />
          {/* Blobs */}
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-10" style={{ backgroundColor: colors.accent }} />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: c[2]?.hex }} />
          {/* Thematic decorations in preview */}
          {detectedTheme && detectedTheme.positions.map((pos, i) => (
            <div
              key={i}
              className="absolute pointer-events-none select-none"
              style={{
                top: pos.top, bottom: pos.bottom, left: pos.left, right: pos.right,
                fontSize: `${parseInt(pos.fontSize) * 0.45}px`,
                opacity: pos.opacity,
                transform: pos.rotate ? `rotate(${pos.rotate}deg)` : undefined,
              }}
            >
              {detectedTheme.emoji}
            </div>
          ))}
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-8">
            <h3 className="text-2xl font-bold mb-3 leading-tight" style={{ fontFamily: headingFont, color: colors.heading }}>
              {themeText || 'הכותרת שלך כאן'}
            </h3>
            <p className="text-xs mb-4 leading-relaxed" style={{ fontFamily: bodyFont, color: colors.text }}>
              טקסט תיאורי קצר שמסביר את המסר העיקרי של הפוסט
            </p>
            <div
              className="text-xs font-semibold px-5 py-2 inline-flex items-center justify-center"
              style={{ background: btnBg, color: btnColor, border: btnBorder, borderRadius: buttonStyle.css.borderRadius || '12px' }}
            >
              קריאה לפעולה
            </div>
            <div className="absolute bottom-4 flex gap-1.5">
              {c.map((col, i) => <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.hex }} />)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <button onClick={openInNewTab} className="px-6 py-3 rounded-full studio-gradient text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105">
          פתח לעריכה בטאב חדש
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        💡 בטאב החדש – לחצו על כל טקסט כדי לערוך אותו. גודל הפוסט: 1080×1080 פיקסלים
      </p>
    </div>
  );
}
