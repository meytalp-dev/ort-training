import { useWizard } from '@/store/wizard';
import { useState } from 'react';
import { getBgFromPalette } from '@/lib/paletteBg';
import { getToolbarHTML } from '@/lib/toolbarHTML';
import ColorCustomizer, { type ColorOverrides } from './ColorCustomizer';
import { fontFamilyMap } from '@/lib/fontFamily';

interface Props {
  onBack: () => void;
}

export default function ProductBusinessCard({ onBack }: Props) {
  const { palette, style, fontCombo } = useWizard();
  const c = palette?.colors || [];
  const paletteBg = getBgFromPalette(c);
  const [colors, setColors] = useState<ColorOverrides>({
    heading: c[0]?.hex || '#333',
    background: paletteBg,
    accent: c[0]?.hex || '#333',
    button: c[0]?.hex || '#333',
    text: '#555555',
  });

  if (!palette || !style || !fontCombo) return null;

  const headingFont = fontFamilyMap[fontCombo.heading] || `'${fontCombo.heading}', sans-serif`;
  const bodyFont = fontFamilyMap[fontCombo.body] || `'${fontCombo.body}', sans-serif`;

  const openInNewTab = () => {
    const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<title>כרטיס ביקור – ${palette.name}</title>
<link href="https://fonts.googleapis.com/css2?family=${fontCombo.heading.replace(/ /g, '+')}&family=${fontCombo.body.replace(/ /g, '+')}&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f0f0f0; gap: 40px; flex-direction: column; }
.label { font-family: sans-serif; font-size: 14px; color: #888; }
.card { width: 1050px; height: 600px; background: ${colors.background}; position: relative; overflow: hidden; display: flex; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,.15); }
.card [contenteditable]:focus { outline: 2px dashed ${colors.accent}; outline-offset: 2px; }
.left-accent { width: 12px; background: linear-gradient(180deg, ${colors.accent}, ${c[2]?.hex || c[1]?.hex || colors.accent}); flex-shrink: 0; }
.content { flex: 1; padding: 60px 50px; display: flex; flex-direction: column; justify-content: center; }
.name { font-family: ${headingFont}; font-size: 42px; color: ${colors.heading}; margin-bottom: 8px; }
.title-role { font-family: ${bodyFont}; font-size: 20px; color: ${c[1]?.hex || '#666'}; margin-bottom: 30px; letter-spacing: 1px; }
.divider { width: 60px; height: 3px; background: ${colors.accent}; margin-bottom: 30px; opacity: 0.4; }
.info { font-family: ${bodyFont}; font-size: 16px; color: ${colors.text}; line-height: 2; }
.info span { margin-left: 8px; }
.side { width: 280px; background: ${colors.accent}; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; flex-shrink: 0; }
.side .initials { width: 100px; height: 100px; border-radius: 50%; background: rgba(255,255,255,.2); display: flex; align-items: center; justify-content: center; font-family: ${headingFont}; font-size: 40px; color: white; }
.dots { display: flex; gap: 8px; margin-top: 20px; }
.dots span { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,.3); }
</style>
</head>
<body>
${getToolbarHTML('.card', 'business-card-' + palette.name, colors.accent)}
<div class="label">חזית הכרטיס (1050×600 px)</div>
<div class="card">
  <div class="left-accent"></div>
  <div class="content">
    <div class="name" contenteditable="true">שם מלא</div>
    <div class="title-role" contenteditable="true">תפקיד | שם הארגון</div>
    <div class="divider"></div>
    <div class="info" contenteditable="true">
      📱 <span>050-1234567</span><br>
      ✉️ <span>email@example.com</span><br>
      🌐 <span>www.example.com</span><br>
      📍 <span>רחוב הדוגמה 1, תל אביב</span>
    </div>
  </div>
  <div class="side">
    <div class="initials" contenteditable="true">א.ב</div>
    <div class="dots">${c.slice(0, 4).map(() => `<span></span>`).join('')}</div>
  </div>
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
        <h2 className="text-xl font-bold font-heebo">💳 כרטיס ביקור</h2>
      </div>

      {/* Color customizer */}
      <ColorCustomizer
        paletteColors={c}
        defaultBg={style.bgColor}
        overrides={colors}
        onChange={setColors}
      />

      <div className="flex justify-center">
        <div className="relative overflow-hidden shadow-2xl border border-border rounded-xl flex" style={{ width: 420, height: 240, background: colors.background }}>
          {/* Left accent */}
          <div className="w-2 flex-shrink-0" style={{ background: `linear-gradient(180deg, ${colors.accent}, ${c[2]?.hex || c[1]?.hex})` }} />
          {/* Content */}
          <div className="flex-1 p-5 flex flex-col justify-center">
            <h3 className="text-lg font-bold mb-0.5" style={{ fontFamily: headingFont, color: colors.heading }}>שם מלא</h3>
            <p className="text-[10px] mb-3 tracking-wide" style={{ fontFamily: bodyFont, color: c[1]?.hex || '#888' }}>תפקיד | שם הארגון</p>
            <div className="w-8 h-0.5 mb-3 opacity-40" style={{ backgroundColor: colors.accent }} />
            <div className="text-[9px] leading-loose" style={{ fontFamily: bodyFont, color: colors.text }}>
              📱 050-1234567<br />
              ✉️ email@example.com<br />
              🌐 www.example.com
            </div>
          </div>
          {/* Side */}
          <div className="w-24 flex-shrink-0 flex flex-col items-center justify-center gap-2" style={{ backgroundColor: colors.accent }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'rgba(255,255,255,0.2)', fontFamily: headingFont }}>א.ב</div>
            <div className="flex gap-1">
              {c.slice(0, 4).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/30" />)}
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
        💡 בטאב החדש – ערכו שם, תפקיד ופרטי קשר. גודל: 1050×600 פיקסלים
      </p>
    </div>
  );
}
