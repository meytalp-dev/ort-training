import { useWizard } from '@/store/wizard';
import { useState } from 'react';
import { getBgFromPalette } from '@/lib/paletteBg';
import { getToolbarHTML } from '@/lib/toolbarHTML';
import ColorCustomizer, { type ColorOverrides } from './ColorCustomizer';
import { fontFamilyMap } from '@/lib/fontFamily';

interface Props {
  onBack: () => void;
}

export default function ProductLanding({ onBack }: Props) {
  const { palette, style, fontCombo, buttonStyle } = useWizard();
  const c = palette?.colors || [];
  const paletteBg = getBgFromPalette(c);
  const [colors, setColors] = useState<ColorOverrides>({
    heading: c[0]?.hex || '#333',
    background: paletteBg,
    accent: c[0]?.hex || '#333',
    button: c[0]?.hex || '#333',
    text: '#666666',
  });

  if (!palette || !style || !fontCombo || !buttonStyle) return null;

  const headingFont = fontFamilyMap[fontCombo.heading] || `'${fontCombo.heading}', sans-serif`;
  const bodyFont = fontFamilyMap[fontCombo.body] || `'${fontCombo.body}', sans-serif`;
  const isOutline = buttonStyle.category === 'outline';
  const isGradient = buttonStyle.category === 'gradient';
  const btnBg = isOutline ? 'transparent' : isGradient ? `linear-gradient(135deg, ${colors.button}, ${c[3]?.hex || c[1]?.hex})` : colors.button;
  const btnColor = isOutline ? colors.button : '#fff';
  const btnBorder = isOutline ? `2px solid ${colors.button}` : 'none';

  const openInNewTab = () => {
    const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<title>דף נחיתה – ${palette.name}</title>
<link href="https://fonts.googleapis.com/css2?family=${fontCombo.heading.replace(/ /g, '+')}&family=${fontCombo.body.replace(/ /g, '+')}&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: ${bodyFont}; background: ${colors.background}; color: ${colors.text}; }
[contenteditable]:focus { outline: 2px dashed ${colors.accent}; outline-offset: 4px; }
.hero { min-height: 90vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px 20px; position: relative; overflow: hidden; }
.hero .blob1 { position: absolute; width: 500px; height: 500px; border-radius: 50%; background: ${colors.accent}; opacity: 0.05; top: -100px; right: -100px; }
.hero .blob2 { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: ${c[2]?.hex || colors.accent}; opacity: 0.05; bottom: -80px; left: -80px; }
.hero h1 { font-family: ${headingFont}; font-size: 64px; color: ${colors.heading}; margin-bottom: 20px; line-height: 1.2; max-width: 800px; }
.hero p { font-size: 22px; color: ${colors.text}; max-width: 600px; margin-bottom: 40px; line-height: 1.6; }
.cta-btn { display: inline-flex; padding: 18px 48px; font-size: 20px; font-weight: 700; border-radius: ${buttonStyle.css.borderRadius || '12px'}; background: ${btnBg}; color: ${btnColor}; border: ${btnBorder}; cursor: pointer; text-decoration: none; transition: transform 0.2s; }
.cta-btn:hover { transform: scale(1.05); }
.features { padding: 80px 20px; max-width: 1100px; margin: 0 auto; }
.features h2 { font-family: ${headingFont}; font-size: 40px; color: ${colors.heading}; text-align: center; margin-bottom: 50px; }
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
.feature-card { background: white; border-radius: 16px; padding: 40px 30px; text-align: center; box-shadow: 0 2px 20px rgba(0,0,0,.05); border: 1px solid #eee; }
.feature-icon { width: 60px; height: 60px; border-radius: 50%; background: ${colors.accent}10; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 28px; }
.feature-card h3 { font-family: ${headingFont}; font-size: 22px; color: ${colors.heading}; margin-bottom: 12px; }
.feature-card p { font-size: 15px; color: ${colors.text}; line-height: 1.6; }
.cta-section { padding: 80px 20px; text-align: center; background: ${colors.accent}08; }
.cta-section h2 { font-family: ${headingFont}; font-size: 36px; color: ${colors.heading}; margin-bottom: 16px; }
.cta-section p { font-size: 18px; color: ${colors.text}; margin-bottom: 30px; }
.footer { padding: 30px; text-align: center; font-size: 13px; color: #aaa; border-top: 1px solid #eee; }
.footer .dots { display: flex; justify-content: center; gap: 8px; margin-bottom: 12px; }
.footer .dots span { width: 10px; height: 10px; border-radius: 50%; }
@media (max-width: 768px) {
  .hero h1 { font-size: 36px; }
  .features-grid { grid-template-columns: 1fr; }
}
</style>
</head>
<body>
${getToolbarHTML('body', 'landing-' + palette.name, colors.accent)}
<section class="hero">
  <div class="blob1"></div>
  <div class="blob2"></div>
  <h1 contenteditable="true">הכותרת הראשית של דף הנחיתה</h1>
  <p contenteditable="true">תיאור קצר ומשכנע שמסביר למה כדאי להצטרף, להירשם או לקנות. שנו את הטקסט הזה לפי הצורך.</p>
  <a class="cta-btn" contenteditable="true">התחילו עכשיו</a>
</section>
<section class="features">
  <h2 contenteditable="true">למה לבחור בנו?</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">🚀</div>
      <h3 contenteditable="true">יתרון ראשון</h3>
      <p contenteditable="true">תיאור קצר של היתרון הראשון שמסביר מה הלקוח מקבל ולמה זה חשוב.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">💡</div>
      <h3 contenteditable="true">יתרון שני</h3>
      <p contenteditable="true">תיאור קצר של היתרון השני שמדגיש את הערך הייחודי שלכם.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">✨</div>
      <h3 contenteditable="true">יתרון שלישי</h3>
      <p contenteditable="true">תיאור קצר של היתרון השלישי שמחזק את ההחלטה של הלקוח.</p>
    </div>
  </div>
</section>
<section class="cta-section">
  <h2 contenteditable="true">מוכנים להתחיל?</h2>
  <p contenteditable="true">הצטרפו אלינו היום ותתחילו ליהנות מכל היתרונות</p>
  <a class="cta-btn" contenteditable="true">הרשמו בחינם</a>
</section>
<footer class="footer">
  <div class="dots">${c.map(col => `<span style="background:${col.hex}"></span>`).join('')}</div>
  <span contenteditable="true">© 2026 שם הארגון. כל הזכויות שמורות.</span>
</footer>
</body>
</html>`;
    const w = window.open();
    if (w) { w.document.write(html); w.document.close(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">← חזרה לתוצרים</button>
        <h2 className="text-xl font-bold font-heebo">🌐 דף נחיתה</h2>
      </div>

      {/* Color customizer */}
      <ColorCustomizer
        paletteColors={c}
        defaultBg={style.bgColor}
        overrides={colors}
        onChange={setColors}
      />

      <div className="flex justify-center">
        <div className="relative overflow-hidden shadow-2xl border border-border rounded-xl" style={{ width: 480, height: 300, background: colors.background }}>
          {/* Hero preview */}
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-5" style={{ backgroundColor: colors.accent }} />
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: headingFont, color: colors.heading }}>הכותרת הראשית</h3>
            <p className="text-[10px] mb-3 max-w-xs" style={{ fontFamily: bodyFont, color: colors.text }}>תיאור קצר ומשכנע שמסביר את הערך</p>
            <div className="text-[9px] font-bold px-4 py-1.5 rounded" style={{ background: btnBg, color: btnColor, border: btnBorder, borderRadius: buttonStyle.css.borderRadius || '8px' }}>
              התחילו עכשיו
            </div>
            {/* Mini features */}
            <div className="flex gap-4 mt-4">
              {['🚀', '💡', '✨'].map((emoji, i) => (
                <div key={i} className="text-center">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] mx-auto mb-1" style={{ background: `${colors.accent}10` }}>{emoji}</div>
                  <div className="text-[7px]" style={{ fontFamily: bodyFont, color: colors.text }}>יתרון {i + 1}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Footer dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {c.map((col, i) => <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: col.hex }} />)}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <button onClick={openInNewTab} className="px-6 py-3 rounded-full studio-gradient text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105">
          פתח לעריכה בטאב חדש
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        💡 בטאב החדש – ערכו כותרות, תיאורים וכפתורים. העמוד מותאם למובייל
      </p>
    </div>
  );
}
