import { useWizard } from '@/store/wizard';
import { useState } from 'react';
import { getBgFromPalette } from '@/lib/paletteBg';
import { fontFamilyMap } from '@/lib/fontFamily';
import ColorCustomizer, { type ColorOverrides } from './ColorCustomizer';

interface Props {
  onBack: () => void;
}

export default function ProductPresentation({ onBack }: Props) {
  const { palette, style, fontCombo, buttonStyle, orgInfo } = useWizard();
  if (!palette || !style || !fontCombo || !buttonStyle) return null;

  const c = palette.colors;
  const bg = getBgFromPalette(c);
  const hf = fontFamilyMap[fontCombo.heading] || `'${fontCombo.heading}', sans-serif`;
  const bf = fontFamilyMap[fontCombo.body] || `'${fontCombo.body}', sans-serif`;

  const defaultOverrides = (): ColorOverrides => ({
    heading: c[0].hex,
    background: bg,
    accent: c[1]?.hex || c[0].hex,
    button: c[0].hex,
    text: '#555555',
  });

  const [colorOverrides, setColorOverrides] = useState<ColorOverrides>(defaultOverrides);
  const ov = colorOverrides;

  const orgName = orgInfo?.name || 'שם הארגון שלכם';
  const orgRole = orgInfo?.role || 'כותרת משנית';

  // Mini slide previews
  const slides = [
    // Slide 1 - Title
    (
      <div key="1" className="rounded-lg overflow-hidden border border-border" style={{ background: ov.background, aspectRatio: '16/9' }}>
        <div className="h-full flex flex-col items-center justify-center p-6 text-center relative">
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-medium" style={{ background: `${ov.accent}20`, color: ov.accent }}>{style.tags[0] || 'מצגת'}</div>
          <h3 className="text-xl font-bold mb-1" style={{ fontFamily: hf, color: ov.heading }}>{orgName}</h3>
          <p className="text-sm" style={{ fontFamily: bf, color: ov.accent }}>{orgRole}</p>
          <p className="text-xs mt-3 max-w-[80%]" style={{ fontFamily: bf, color: ov.text }}>כאן אפשר לכתוב הסבר קצר על בית הספר, המגמה או הנושא</p>
          <div className="flex gap-2 mt-4">
            <span className="px-4 py-1.5 rounded-full text-[10px] font-bold text-white" style={{ background: ov.button, ...buttonStyle.css, padding: '6px 16px' }}>כפתור ראשי</span>
            <span className="px-4 py-1.5 rounded-full text-[10px] font-bold border" style={{ color: ov.button, borderColor: ov.button, ...buttonStyle.css, padding: '6px 16px', background: 'transparent' }}>כפתור משני</span>
          </div>
          <div className="flex gap-1 mt-3">
            {c.map((col, i) => <div key={i} className="w-4 h-4 rounded-full border border-white/50" style={{ background: col.hex }} />)}
          </div>
        </div>
      </div>
    ),
    // Slide 2 - Content Cards
    (
      <div key="2" className="rounded-lg overflow-hidden border border-border" style={{ background: ov.background, aspectRatio: '16/9' }}>
        <div className="h-full p-4">
          <h3 className="text-sm font-bold mb-3" style={{ fontFamily: hf, color: ov.heading }}>נושא השקף</h3>
          <div className="grid grid-cols-3 gap-2 h-[70%]">
            {['ערך ראשון', 'ערך שני', 'ערך שלישי'].map((title, i) => (
              <div key={i} className="rounded-lg p-2 flex flex-col items-center" style={{ background: `${c[i]?.hex || c[0].hex}15` }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold mb-1" style={{ background: c[i]?.hex || c[0].hex }}>{i + 1}</div>
                <p className="text-[10px] font-bold text-center" style={{ fontFamily: hf, color: c[i]?.hex || c[0].hex }}>{title}</p>
                <p className="text-[8px] text-center mt-0.5" style={{ fontFamily: bf, color: ov.text }}>הוסיפו כאן תוכן</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    // Slide 3 - Data
    (
      <div key="3" className="rounded-lg overflow-hidden border border-border" style={{ background: ov.background, aspectRatio: '16/9' }}>
        <div className="h-full p-4">
          <h3 className="text-sm font-bold mb-2" style={{ fontFamily: hf, color: ov.heading }}>נתונים ומספרים</h3>
          <div className="flex gap-3 h-[65%]">
            <div className="flex-1 space-y-1.5">
              {[{ v: '350', l: 'תלמידים' }, { v: '95%', l: 'זכאות בגרות' }, { v: '12', l: 'מגמות לימוד' }].map((kpi, i) => (
                <div key={i} className="rounded-lg p-2" style={{ background: `${c[i]?.hex || c[0].hex}12` }}>
                  <p className="text-sm font-bold" style={{ fontFamily: hf, color: c[i]?.hex || c[0].hex }}>{kpi.v}</p>
                  <p className="text-[8px]" style={{ fontFamily: bf, color: ov.text }}>{kpi.l}</p>
                </div>
              ))}
            </div>
            <div className="flex-1 flex items-end gap-1 pb-2">
              {[60, 80, 55, 95].map((pct, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className="w-full rounded-t" style={{ height: `${pct}%`, background: c[i]?.hex || c[0].hex }} />
                  <span className="text-[7px] mt-0.5" style={{ color: ov.text }}>שנה {String.fromCharCode(1488 + i)}׳</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    // Slide 4 - Process
    (
      <div key="4" className="rounded-lg overflow-hidden border border-border" style={{ background: ov.background, aspectRatio: '16/9' }}>
        <div className="h-full p-4">
          <h3 className="text-sm font-bold mb-4" style={{ fontFamily: hf, color: ov.heading }}>תהליך העבודה</h3>
          <div className="flex items-start justify-center gap-4">
            {['שלב ראשון', 'שלב שני', 'שלב שלישי', 'שלב רביעי'].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: c[i % c.length]?.hex }}>0{i + 1}</div>
                <p className="text-[9px] font-bold mt-1" style={{ fontFamily: hf, color: c[i % c.length]?.hex }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    // Slide 5 - CTA
    (
      <div key="5" className="rounded-lg overflow-hidden border border-border" style={{ background: ov.heading, aspectRatio: '16/9' }}>
        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
          <p className="text-3xl opacity-30 mb-1" style={{ fontFamily: hf, color: 'white' }}>״</p>
          <p className="text-sm font-bold text-white mb-1" style={{ fontFamily: hf }}>כאן אפשר לשים ציטוט מעורר השראה</p>
          <p className="text-[10px] text-white/60" style={{ fontFamily: bf }}>{orgName !== 'שם הארגון שלכם' ? `– ${orgName}` : '– השם שלכם'}</p>
          <span className="mt-3 px-4 py-1.5 rounded-full text-[10px] font-bold" style={{ background: 'white', color: ov.heading, ...buttonStyle.css, padding: '6px 16px' }}>לחצו כאן לפעולה</span>
        </div>
      </div>
    ),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">← חזרה</button>
        <h3 className="text-base font-bold">תצוגה מקדימה – מצגת</h3>
      </div>

      <ColorCustomizer
        paletteColors={c}
        defaultBg={bg}
        overrides={colorOverrides}
        onChange={setColorOverrides}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {slides.map((slide, i) => (
          <div key={i} className="relative">
            <span className="absolute top-1 right-2 text-[9px] text-muted-foreground z-10">שקף {i + 1}</span>
            {slide}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        💡 הפריוויו מראה את הסגנון – לחצו "הורד PPTX" בתפריט למעלה כדי לקבל קובץ מצגת לעריכה
      </p>
    </div>
  );
}
