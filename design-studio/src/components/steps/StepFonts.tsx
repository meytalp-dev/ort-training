import { fontCombos } from '@/data/studio';
import { useWizard } from '@/store/wizard';
import { Check } from 'lucide-react';
import { fontFamilyMap } from '@/lib/fontFamily';

export default function StepFonts() {
  const { fontCombo, setFontCombo, setStep, palette } = useWizard();
  const primaryColor = palette?.colors[0]?.hex || '#C4704B';

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-heebo">בחרו שילוב פונטים</h2>
        <p className="text-muted-foreground">כותרת + גוף טקסט שיעבדו ביחד</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fontCombos.map(f => {
          const isSelected = fontCombo?.id === f.id;
          const headingFamily = fontFamilyMap[f.heading] || `'${f.heading}', sans-serif`;
          const bodyFamily = fontFamilyMap[f.body] || `'${f.body}', sans-serif`;
          return (
            <button
              key={f.id}
              onClick={() => { setFontCombo(f); setStep(3); }}
              className={`group relative rounded-xl p-5 text-right transition-all border-2 hover:shadow-lg bg-card ${
                isSelected ? 'border-primary shadow-lg' : 'border-transparent hover:border-border'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className="mb-3 space-y-2">
                <p className="text-2xl leading-tight" style={{ fontFamily: headingFamily, color: primaryColor }}>
                  כותרת בפונט {f.heading}
                </p>
                <p className="text-base text-muted-foreground leading-relaxed" style={{ fontFamily: bodyFamily }}>
                  זהו טקסט לדוגמה בפונט {f.body} – כך ייראה גוף הטקסט בעיצוב שלך
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">כותרת: {f.heading}</span>
                <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground">גוף: {f.body}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {f.tags.map((t, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
