import { useWizard } from '@/store/wizard';
import { useState } from 'react';
import { getBgFromPalette } from '@/lib/paletteBg';
import { getToolbarHTML } from '@/lib/toolbarHTML';
import ColorCustomizer, { type ColorOverrides } from './ColorCustomizer';
import { fontFamilyMap } from '@/lib/fontFamily';

interface Props {
  onBack: () => void;
}

export default function ProductWorksheet({ onBack }: Props) {
  const { palette, style, fontCombo } = useWizard();
  const c = palette?.colors || [];
  const [colors, setColors] = useState<ColorOverrides>({
    heading: c[0]?.hex || '#333',
    background: '#ffffff',
    accent: c[0]?.hex || '#333',
    button: c[0]?.hex || '#333',
    text: '#555555',
  });

  if (!palette || !style || !fontCombo) return null;

  const headingFont = fontFamilyMap[fontCombo.heading] || `'${fontCombo.heading}', sans-serif`;
  const bodyFont = fontFamilyMap[fontCombo.body] || `'${fontCombo.body}', sans-serif`;

  const openInNewTab = () => {
    const questions = Array.from({ length: 8 }, (_, i) => i + 1);
    const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<title>דף עבודה – ${palette.name}</title>
<link href="https://fonts.googleapis.com/css2?family=${fontCombo.heading.replace(/ /g, '+')}&family=${fontCombo.body.replace(/ /g, '+')}&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
@media print { body { background: white; } .no-print { display: none; } }
body { display: flex; flex-direction: column; align-items: center; min-height: 100vh; background: #f0f0f0; padding: 20px; }
.page { width: 210mm; min-height: 297mm; background: ${colors.background}; padding: 20mm; position: relative; box-shadow: 0 2px 20px rgba(0,0,0,.1); }
.page [contenteditable]:focus { outline: 2px dashed ${colors.accent}; outline-offset: 2px; }
.header { border-bottom: 3px solid ${colors.accent}; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
.header h1 { font-family: ${headingFont}; font-size: 28px; color: ${colors.heading}; }
.header .meta { font-family: ${bodyFont}; font-size: 13px; color: #888; text-align: left; }
.name-line { display: flex; gap: 20px; margin-bottom: 24px; font-family: ${bodyFont}; font-size: 14px; color: ${colors.text}; }
.name-line span { border-bottom: 1px solid #ccc; flex: 1; padding-bottom: 4px; }
.instructions { background: ${colors.accent}08; border-right: 4px solid ${colors.accent}; padding: 12px 16px; margin-bottom: 24px; font-family: ${bodyFont}; font-size: 14px; color: ${colors.text}; border-radius: 0 8px 8px 0; }
.question { margin-bottom: 20px; page-break-inside: avoid; }
.question-num { display: inline-flex; width: 28px; height: 28px; border-radius: 50%; background: ${colors.accent}; color: white; align-items: center; justify-content: center; font-family: ${bodyFont}; font-weight: 700; font-size: 14px; margin-left: 10px; vertical-align: middle; }
.question-text { font-family: ${bodyFont}; font-size: 15px; color: ${colors.text}; display: inline; }
.answer-lines { margin-top: 8px; margin-right: 38px; }
.answer-line { border-bottom: 1px solid #e0e0e0; height: 32px; }
.footer { position: absolute; bottom: 15mm; left: 20mm; right: 20mm; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 8px; }
.footer-dots { display: flex; gap: 6px; }
.footer-dots span { width: 8px; height: 8px; border-radius: 50%; }
.print-btn { position: fixed; top: 20px; left: 20px; padding: 10px 24px; background: ${colors.accent}; color: white; border: none; border-radius: 8px; cursor: pointer; font-family: ${bodyFont}; font-size: 14px; z-index: 100; }
</style>
</head>
<body>
${getToolbarHTML('.page', 'worksheet-' + palette.name, colors.accent)}
<div class="page">
  <div class="header">
    <div>
      <h1 contenteditable="true">שם דף העבודה</h1>
      <p style="font-family:${bodyFont};font-size:13px;color:${c[1]?.hex || '#888'};margin-top:4px;" contenteditable="true">נושא הלימוד | כיתה ___</p>
    </div>
    <div class="meta" contenteditable="true">תאריך: ___/___/______</div>
  </div>
  <div class="name-line">
    <span contenteditable="true">שם התלמיד/ה: </span>
  </div>
  <div class="instructions" contenteditable="true">
    📌 <strong>הוראות:</strong> ענו על כל השאלות. כתבו תשובות מלאות בכתב ברור.
  </div>
  ${questions.map(n => `
  <div class="question">
    <span class="question-num">${n}</span>
    <span class="question-text" contenteditable="true">כתבו כאן את השאלה מספר ${n}</span>
    <div class="answer-lines">
      <div class="answer-line"></div>
      <div class="answer-line"></div>
      <div class="answer-line"></div>
    </div>
  </div>`).join('')}
  <div class="footer">
    <div style="font-family:${bodyFont};font-size:10px;color:#bbb;">נוצר באמצעות סטודיו עיצוב</div>
    <div class="footer-dots">${c.map(col => `<span style="background:${col.hex}"></span>`).join('')}</div>
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
        <h2 className="text-xl font-bold font-heebo">📝 דף עבודה</h2>
      </div>

      {/* Color customizer */}
      <ColorCustomizer
        paletteColors={c}
        defaultBg={style.bgColor}
        overrides={colors}
        onChange={setColors}
      />

      <div className="flex justify-center">
        <div className="relative overflow-hidden shadow-2xl border border-border" style={{ width: 300, height: 420, background: colors.background }}>
          <div className="p-5 h-full flex flex-col">
            {/* Header */}
            <div className="border-b-2 pb-2 mb-3" style={{ borderColor: colors.accent }}>
              <h3 className="text-sm font-bold" style={{ fontFamily: headingFont, color: colors.heading }}>שם דף העבודה</h3>
              <p className="text-[8px]" style={{ fontFamily: bodyFont, color: c[1]?.hex || '#888' }}>נושא הלימוד | כיתה ___</p>
            </div>
            {/* Name line */}
            <div className="text-[8px] mb-2 border-b pb-1" style={{ fontFamily: bodyFont, color: colors.text, borderColor: '#ddd' }}>
              שם התלמיד/ה: _______________
            </div>
            {/* Instructions */}
            <div className="text-[7px] p-1.5 rounded-sm mb-3" style={{ background: `${colors.accent}08`, borderRight: `3px solid ${colors.accent}`, fontFamily: bodyFont, color: colors.text }}>
              📌 הוראות: ענו על כל השאלות
            </div>
            {/* Questions */}
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="mb-2">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-4 h-4 rounded-full text-white text-[7px] flex items-center justify-center font-bold" style={{ backgroundColor: colors.accent }}>{n}</div>
                  <span className="text-[8px]" style={{ fontFamily: bodyFont, color: colors.text }}>שאלה מספר {n}</span>
                </div>
                <div className="mr-5 space-y-1.5">
                  <div className="border-b" style={{ borderColor: '#e5e5e5', height: 10 }} />
                  <div className="border-b" style={{ borderColor: '#e5e5e5', height: 10 }} />
                </div>
              </div>
            ))}
            {/* Footer dots */}
            <div className="mt-auto flex justify-end gap-1">
              {c.map((col, i) => <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: col.hex }} />)}
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
        💡 בטאב החדש – ערכו שאלות, כותרת והוראות. לחצו "הדפס" לשמירה כ-PDF
      </p>
    </div>
  );
}
