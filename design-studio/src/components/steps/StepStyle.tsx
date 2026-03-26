import { designStyles } from '@/data/studio';
import { useWizard } from '@/store/wizard';
import { Check } from 'lucide-react';

export default function StepStyle() {
  const { style, setStyle, setStep, palette } = useWizard();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-heebo">בחרו סגנון עיצוב</h2>
        <p className="text-muted-foreground">הסגנון הוויזואלי שייתן לתוצרים שלכם אופי</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {designStyles.map(s => {
          const isSelected = style?.id === s.id;
          const primary = palette?.colors[0]?.hex || s.accentColor;
          return (
            <button
              key={s.id}
              onClick={() => { setStyle(s); setStep(2); }}
              className={`group relative rounded-xl overflow-hidden text-right transition-all border-2 hover:shadow-lg ${
                isSelected ? 'border-primary shadow-lg' : 'border-transparent hover:border-border'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 left-3 z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className="h-24 relative" style={{ backgroundColor: s.bgColor }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full opacity-30" style={{ backgroundColor: primary }} />
                  <div className="absolute w-10 h-10 rounded-lg opacity-20 rotate-12" style={{ backgroundColor: primary, top: '10px', right: '20px' }} />
                </div>
              </div>
              <div className="p-4 bg-card">
                <h3 className="font-bold text-sm">{s.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {s.tags.map((t, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">{t}</span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
