import { useState } from 'react';
import { colorPalettes, paletteCategories, type PaletteCategory } from '@/data/studio';
import { useWizard } from '@/store/wizard';
import { Check } from 'lucide-react';

export default function StepPalette() {
  const { palette, setPalette, setStep } = useWizard();
  const [filter, setFilter] = useState<PaletteCategory>('all');

  const filtered = filter === 'all' ? colorPalettes : colorPalettes.filter(p => p.category === filter);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-heebo">בחרו פלטת צבעים</h2>
        <p className="text-muted-foreground">הפלטה שתגדיר את האווירה של העיצוב שלכם</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {paletteCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === cat.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => {
          const isSelected = palette?.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => { setPalette(p); setStep(1); }}
              className={`group relative rounded-xl p-4 text-right transition-all border-2 hover:shadow-lg ${
                isSelected ? 'border-primary shadow-lg bg-card' : 'border-transparent bg-card hover:border-border'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className="flex gap-1 mb-3 h-12 rounded-lg overflow-hidden">
                {p.colors.map((c, i) => (
                  <div key={i} className="flex-1 transition-transform group-hover:scale-y-110" style={{ backgroundColor: c.hex }} />
                ))}
              </div>
              <h3 className="font-bold text-sm">{p.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {p.colors.map((c, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">{c.name}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
