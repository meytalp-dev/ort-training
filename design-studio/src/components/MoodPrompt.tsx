import { useState } from 'react';
import { moodPresets, colorPalettes, designStyles, fontCombos, buttonStyles } from '@/data/studio';
import { useWizard } from '@/store/wizard';

export default function MoodPrompt() {
  const { setPalette, setStyle, setFontCombo, setButtonStyle, setStep } = useWizard();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleSelect = (moodId: string, optionIndex: number) => {
    const mood = moodPresets.find(m => m.id === moodId)!;
    const pal = colorPalettes.find(p => p.id === mood.paletteIds[optionIndex]);
    const sty = designStyles.find(s => s.id === mood.styleIds[optionIndex]);
    const fnt = fontCombos.find(f => f.id === mood.fontIds[optionIndex]);
    const btn = buttonStyles.find(b => b.id === mood.buttonIds[optionIndex]);
    if (pal) setPalette(pal);
    if (sty) setStyle(sty);
    if (fnt) setFontCombo(fnt);
    if (btn) setButtonStyle(btn);
    setStep(4); // go to output selection
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-heebo">בחרו סגנון לפי אווירה</h2>
        <p className="text-muted-foreground">בחרו את האווירה ונציע 4 שילובים מושלמים</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {moodPresets.map(mood => (
          <button
            key={mood.id}
            onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
            className={`px-5 py-3 rounded-2xl text-base font-bold transition-all ${
              selectedMood === mood.id
                ? 'studio-gradient text-primary-foreground shadow-lg scale-105'
                : 'bg-card border-2 border-border text-foreground hover:border-primary/50 hover:shadow-md'
            }`}
          >
            {mood.emoji} {mood.name}
          </button>
        ))}
      </div>

      {selectedMood && (() => {
        const mood = moodPresets.find(m => m.id === selectedMood)!;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {[0, 1, 2, 3].map(i => {
              const pal = colorPalettes.find(p => p.id === mood.paletteIds[i]);
              const sty = designStyles.find(s => s.id === mood.styleIds[i]);
              const fnt = fontCombos.find(f => f.id === mood.fontIds[i]);
              const btn = buttonStyles.find(b => b.id === mood.buttonIds[i]);
              if (!pal || !sty || !fnt || !btn) return null;

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(mood.id, i)}
                  className="rounded-xl border-2 border-border bg-card p-4 text-right hover:border-primary hover:shadow-lg transition-all group"
                >
                  <div className="text-xs text-muted-foreground mb-2">אפשרות {i + 1}</div>
                  <div className="flex gap-1 mb-3 h-8 rounded-lg overflow-hidden">
                    {pal.colors.map((c, j) => (
                      <div key={j} className="flex-1" style={{ backgroundColor: c.hex }} />
                    ))}
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-bold">פלטה:</span> {pal.name}</p>
                    <p><span className="font-bold">סגנון:</span> {sty.name}</p>
                    <p><span className="font-bold">פונטים:</span> {fnt.heading} + {fnt.body}</p>
                    <p><span className="font-bold">כפתורים:</span> {btn.name}</p>
                  </div>
                  <div className="mt-3 text-center">
                    <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      בחרו שילוב זה
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
