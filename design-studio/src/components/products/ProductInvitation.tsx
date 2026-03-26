import { useWizard } from '@/store/wizard';
import { useState } from 'react';
import { detectTheme, generateDecorationHTML, getSecondaryEmojis } from '@/lib/thematicDecorations';
import { getBgFromPalette } from '@/lib/paletteBg';
import { getToolbarHTML } from '@/lib/toolbarHTML';
import ColorCustomizer, { type ColorOverrides } from './ColorCustomizer';
import { fontFamilyMap } from '@/lib/fontFamily';

interface Props {
  onBack: () => void;
}

export default function ProductInvitation({ onBack }: Props) {
  const { palette, style, fontCombo, buttonStyle } = useWizard();
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
    text: '#444444',
  });

  if (!palette || !style || !fontCombo || !buttonStyle) return null;

  const headingFont = fontFamilyMap[fontCombo.heading] || `'${fontCombo.heading}', sans-serif`;
  const bodyFont = fontFamilyMap[fontCombo.body] || `'${fontCombo.body}', sans-serif`;
  const decorationHTML = detectedTheme ? generateDecorationHTML(detectedTheme) : '';

  const openInNewTab = () => {
    const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<title>הזמנה – ${palette.name}</title>
<link href="https://fonts.googleapis.com/css2?family=${fontCombo.heading.replace(/ /g, '+')}&family=${fontCombo.body.replace(/ /g, '+')}&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f0f0f0; }
.card { width: 1080px; height: 1350px; background: ${colors.background}; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 100px 80px; }
.card [contenteditable]:focus { outline: 2px dashed ${colors.accent}; outline-offset: 4px; }
.border-frame { position: absolute; inset: 30px; border: 3px solid ${colors.accent}20; border-radius: 24px; pointer-events: none; }
.inner-frame { position: absolute; inset: 50px; border: 1px solid ${c[1]?.hex || colors.accent}15; border-radius: 16px; pointer-events: none; }
.top-ornament { width: 120px; height: 4px; background: linear-gradient(90deg, transparent, ${colors.accent}, transparent); margin-bottom: 40px; }
.subtitle { font-family: ${bodyFont}; font-size: 24px; color: ${c[1]?.hex || '#888'}; margin-bottom: 20px; letter-spacing: 2px; }
h1 { font-family: ${headingFont}; font-size: 64px; color: ${colors.heading}; margin-bottom: 30px; line-height: 1.3; }
.divider { width: 60px; height: 60px; border: 2px solid ${colors.accent}40; transform: rotate(45deg); margin: 20px auto; display: flex; align-items: center; justify-content: center; }
.divider-inner { width: 8px; height: 8px; background: ${colors.accent}; border-radius: 50%; }
.details { font-family: ${bodyFont}; font-size: 28px; color: ${colors.text}; line-height: 2.2; margin-top: 30px; }
.details strong { color: ${colors.heading}; font-size: 32px; }
.footer-dots { display: flex; gap: 10px; margin-top: 50px; }
.footer-dots span { width: 10px; height: 10px; border-radius: 50%; }
</style>
</head>
<body>
${getToolbarHTML('.card', 'invitation-' + palette.name, colors.accent)}
<div class="card">
  <div class="border-frame"></div>
  <div class="inner-frame"></div>
  ${decorationHTML}
  <div class="top-ornament"></div>
  <div class="subtitle" contenteditable="true">הנכם מוזמנים</div>
  <h1 contenteditable="true">${themeText || 'שם האירוע'}</h1>
  <div class="divider"><div class="divider-inner"></div></div>
  <div class="details" contenteditable="true">
    <strong>📅 יום שלישי, 15 בינואר 2025</strong><br>
    🕗 בשעה 18:00<br>
    📍 אולם האירועים, רחוב הראשי 42<br><br>
    נשמח לראותכם!
  </div>
  <div class="footer-dots">${c.map(col => `<span style="background:${col.hex}"></span>`).join('')}</div>
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
        <h2 className="text-xl font-bold font-heebo">🎉 הזמנה לאירוע</h2>
      </div>

      {/* Theme input */}
      <div className="flex flex-col items-center gap-2">
        <label className="text-sm font-medium text-muted-foreground">✨ כתבי נושא והאלמנטים יתאימו אוטומטית</label>
        <input
          type="text"
          value={themeText}
          onChange={(e) => setThemeText(e.target.value)}
          placeholder="לדוגמה: חג פסח שמח, חתונה, בר מצווה..."
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

      <div className="flex justify-center">
        <div className="relative overflow-hidden shadow-2xl border border-border" style={{ width: 320, height: 400, background: colors.background }}>
          {/* Border frames */}
          <div className="absolute pointer-events-none" style={{ inset: 12, border: `2px solid ${colors.accent}20`, borderRadius: 12 }} />
          <div className="absolute pointer-events-none" style={{ inset: 20, border: `1px solid ${c[1]?.hex || colors.accent}15`, borderRadius: 8 }} />
          {/* Thematic decorations */}
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
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-0.5 mb-4" style={{ background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)` }} />
            <p className="text-[10px] mb-2 tracking-widest" style={{ fontFamily: bodyFont, color: c[1]?.hex || '#888' }}>הנכם מוזמנים</p>
            <h3 className="text-xl font-bold mb-3" style={{ fontFamily: headingFont, color: colors.heading }}>{themeText || 'שם האירוע'}</h3>
            <div className="w-6 h-6 border rotate-45 mb-3 flex items-center justify-center" style={{ borderColor: `${colors.accent}40` }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.accent }} />
            </div>
            <div className="text-[10px] leading-loose" style={{ fontFamily: bodyFont, color: colors.text }}>
              <p style={{ color: colors.heading, fontWeight: 700 }}>📅 יום שלישי, 15 בינואר</p>
              <p>🕗 בשעה 18:00</p>
              <p>📍 אולם האירועים</p>
            </div>
            <div className="absolute bottom-4 flex gap-1.5">
              {c.map((col, i) => <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: col.hex }} />)}
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
        💡 בטאב החדש – לחצו על כל טקסט כדי לערוך אותו. גודל: 1080×1350 פיקסלים
      </p>
    </div>
  );
}
