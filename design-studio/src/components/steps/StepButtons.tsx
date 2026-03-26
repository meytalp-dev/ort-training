import { useState } from 'react';
import { buttonStyles, buttonCategories, type ButtonCategory } from '@/data/studio';
import { useWizard } from '@/store/wizard';
import { Check, ArrowLeft } from 'lucide-react';

export default function StepButtons() {
  const { buttonStyle, setButtonStyle, setStep, palette } = useWizard();
  const [filter, setFilter] = useState<ButtonCategory>('all');
  const primaryColor = palette?.colors[0]?.hex || '#C4704B';
  const lightColor = palette?.colors[3]?.hex || '#E8DCC8';

  const filtered = filter === 'all' ? buttonStyles : buttonStyles.filter(b => b.category === filter);

  const handleSkip = () => {
    const defaultBtn = buttonStyles.find(b => b.id === 'rounded-full') || buttonStyles[0];
    setButtonStyle(defaultBtn);
    setStep(4);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-heebo">בחרו סגנון כפתורים</h2>
        <p className="text-muted-foreground">הכפתורים שישלימו את העיצוב שלכם</p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSkip}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground bg-secondary hover:bg-secondary/80 transition-colors"
        >
          דלגו עם ברירת מחדל
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {buttonCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
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
        {filtered.map(b => {
          const isSelected = buttonStyle?.id === b.id;
          const isOutline = b.category === 'outline';
          const isGradient = b.category === 'gradient';
          const btnBg = isOutline ? 'transparent' : isGradient ? `linear-gradient(135deg, ${primaryColor}, ${lightColor})` : primaryColor;
          const btnColor = isOutline ? primaryColor : '#fff';
          const btnBorder = isOutline ? `2px solid ${primaryColor}` : 'none';

          return (
            <button
              key={b.id}
              onClick={() => { setButtonStyle(b); setStep(4); }}
              className={`group relative rounded-xl p-5 text-right transition-all border-2 hover:shadow-lg bg-card ${
                isSelected ? 'border-primary shadow-lg' : 'border-transparent hover:border-border'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className="flex justify-center mb-4">
                <div
                  className="flex items-center justify-center text-sm font-medium"
                  style={{
                    ...b.css,
                    background: btnBg,
                    color: btnColor,
                    border: btnBorder,
                    minWidth: b.css.width ? undefined : '100px',
                  }}
                >
                  {b.css.width ? '→' : 'כפתור'}
                </div>
              </div>
              <h3 className="font-bold text-sm">{b.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{b.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {b.tags.map((t, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">{t}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
