import { useState } from 'react';
import { outputSizes, outputCategories } from '@/data/studio';
import { useWizard } from '@/store/wizard';
import { Check } from 'lucide-react';

export default function StepOutput() {
  const { outputs, setOutputs, setSelectAll, selectAll, setStep } = useWizard();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? outputSizes : outputSizes.filter(o => o.category === filter);

  const toggleSize = (size: typeof outputSizes[number]) => {
    const exists = outputs.find(o => o.id === size.id);
    if (exists) {
      setOutputs(outputs.filter(o => o.id !== size.id));
      setSelectAll(false);
    } else {
      setOutputs([...outputs, size]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setOutputs([]);
      setSelectAll(false);
    } else {
      setOutputs([...outputSizes]);
      setSelectAll(true);
    }
  };

  const canProceed = selectAll || outputs.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-heebo">בחרו תוצרים</h2>
        <p className="text-muted-foreground">לאילו פורמטים אתם צריכים את העיצוב?</p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSelectAll}
          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
            selectAll
              ? 'studio-gradient text-primary-foreground shadow-lg'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          ✨ הכל – Brand Kit מלא
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {outputCategories.map(cat => (
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(o => {
          const isSelected = selectAll || outputs.find(out => out.id === o.id);
          const aspect = o.width / o.height;
          return (
            <button
              key={o.id}
              onClick={() => { if (!selectAll) toggleSize(o); }}
              className={`group relative rounded-xl p-4 text-center transition-all border-2 bg-card ${
                isSelected ? 'border-primary shadow-md' : 'border-transparent hover:border-border'
              } ${selectAll ? 'opacity-80' : ''}`}
            >
              {isSelected && (
                <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div className="flex justify-center mb-3">
                <div
                  className="border-2 border-border rounded-sm bg-muted"
                  style={{
                    width: aspect >= 1 ? 60 : 60 * aspect,
                    height: aspect >= 1 ? 60 / aspect : 60,
                  }}
                />
              </div>
              <h4 className="font-bold text-xs">{o.name}</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">{o.dimensions}</p>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center">
        {canProceed ? (
          <button
            onClick={() => setStep(5)}
            className="px-8 py-3 rounded-full studio-gradient text-primary-foreground font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            צפו בערכת המיתוג ←
          </button>
        ) : (
          <p className="text-sm text-muted-foreground">בחרו לפחות תוצר אחד כדי להמשיך</p>
        )}
      </div>
    </div>
  );
}
