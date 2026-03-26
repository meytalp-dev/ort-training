import { useState } from 'react';
import { moodPresets, colorPalettes, designStyles, fontCombos, buttonStyles, type ColorPalette, type DesignStyle, type FontCombo, type ButtonStyle } from '@/data/studio';
import { useWizard } from '@/store/wizard';
import { fontFamilyMap } from '@/lib/fontFamily';
import { ArrowRight, ArrowLeft, Sparkles, Check, ChevronDown } from 'lucide-react';

type OrgType = 'school' | 'nonprofit' | 'business' | 'personal';
type Vibe = 'professional' | 'cheerful' | 'earthy' | 'romantic' | 'dynamic' | 'festive';

const orgOptions: { id: OrgType; label: string; desc: string }[] = [
  { id: 'school', label: 'בית ספר / מוסד חינוכי', desc: 'מצגות, דפי עבודה, חומרי לימוד' },
  { id: 'nonprofit', label: 'עמותה / ארגון', desc: 'אירועים, הזמנות, רשתות חברתיות' },
  { id: 'business', label: 'עסק / חברה', desc: 'מיתוג, דפי נחיתה, כרטיסי ביקור' },
  { id: 'personal', label: 'פרויקט אישי', desc: 'פוסטים, הזמנות, מצגות' },
];

const valueOptions = [
  'מקצועיות', 'חדשנות', 'קהילה', 'יצירתיות', 'אמינות',
  'חינוך', 'צמיחה', 'שיתוף פעולה', 'מצוינות', 'אכפתיות',
  'הכלה', 'מנהיגות', 'מסורת', 'קיימות', 'עצמאות',
];

const vibeOptions: { id: Vibe; label: string; desc: string }[] = [
  { id: 'professional', label: 'מקצועי ונקי', desc: 'רשמי, אמין, מסודר' },
  { id: 'cheerful', label: 'עליז וצבעוני', desc: 'שמח, אנרגטי, צעיר' },
  { id: 'earthy', label: 'אותנטי וטבעי', desc: 'חם, ירוק, אדמתי' },
  { id: 'romantic', label: 'עדין ורך', desc: 'פסטלי, שקט, אלגנטי' },
  { id: 'dynamic', label: 'נועז ודינמי', desc: 'חזק, בולט, מודרני' },
  { id: 'festive', label: 'חגיגי ורשמי', desc: 'זהב, מכובד, מרשים' },
];

// Usage recommendations per style
const usageMap: Record<string, { best: string[]; good: string[] }> = {
  'watercolor': { best: ['הזמנות', 'מחברות'], good: ['פוסטים', 'דפי עבודה'] },
  'coral-warm': { best: ['פוסטים', 'דפי נחיתה'], good: ['הדרכות', 'מצגות'] },
  'lime-fresh': { best: ['רשתות חברתיות', 'סטוריז'], good: ['פוסטים', 'פליירים'] },
  'dusty-rose': { best: ['מצגות', 'אירועים'], good: ['מיתוג', 'הזמנות'] },
  'clean-mgmt': { best: ['מצגות', 'דוחות'], good: ['דפי עבודה', 'מכתבים'] },
  'edu-presentation': { best: ['שקפים', 'שיעורים'], good: ['חומרי לימוד', 'דפי עבודה'] },
  'playful': { best: ['משחקים', 'פעילויות'], good: ['קלפים', 'פוסטים'] },
  'earthy-warm': { best: ['מצגות', 'קמפיינים'], good: ['שיווק', 'כרטיסי ביקור'] },
  'pastel-soft': { best: ['הזמנות', 'מחברות'], good: ['תכנון', 'פוסטים'] },
  'field-flowers': { best: ['הזמנות', 'חגים'], good: ['מצגות', 'פוסטים'] },
  'splash-bold': { best: ['פוסטים', 'באנרים'], good: ['מצגות', 'פליירים'] },
  'splash-dramatic': { best: ['כנסים', 'אירועים'], good: ['מצגות', 'פוסטים'] },
};

type Suggestion = {
  palette: ColorPalette;
  style: DesignStyle;
  fontCombo: FontCombo;
  buttonStyle: ButtonStyle;
};

export default function TellMeQuestionnaire() {
  const { setPalette, setStyle, setFontCombo, setButtonStyle, setStep, setOrgInfo } = useWizard();
  const [qStep, setQStep] = useState(0);
  const [orgType, setOrgType] = useState<OrgType | null>(null);
  const [orgName, setOrgName] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [vibe, setVibe] = useState<Vibe | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [editingPart, setEditingPart] = useState<string | null>(null);

  const toggleValue = (v: string) => {
    setSelectedValues(prev =>
      prev.includes(v) ? prev.filter(x => x !== v) : prev.length < 5 ? [...prev, v] : prev
    );
  };

  const generateSuggestions = () => {
    if (!vibe) return;
    const mood = moodPresets.find(m => m.id === vibe)!;
    const sugs: Suggestion[] = [];
    for (let i = 0; i < 4; i++) {
      const pal = colorPalettes.find(p => p.id === mood.paletteIds[i]);
      const sty = designStyles.find(s => s.id === mood.styleIds[i]);
      const fnt = fontCombos.find(f => f.id === mood.fontIds[i]);
      const btn = buttonStyles.find(b => b.id === mood.buttonIds[i]);
      if (pal && sty && fnt && btn) sugs.push({ palette: pal, style: sty, fontCombo: fnt, buttonStyle: btn });
    }
    setSuggestions(sugs);
    setQStep(3);
  };

  const handleSelect = (idx: number) => {
    setSelectedIdx(idx);
  };

  const handleConfirm = () => {
    if (selectedIdx === null) return;
    const s = suggestions[selectedIdx];
    setPalette(s.palette);
    setStyle(s.style);
    setFontCombo(s.fontCombo);
    setButtonStyle(s.buttonStyle);
    if (orgName) setOrgInfo({ name: orgName });
    setStep(4);
  };

  const updateSuggestion = (idx: number, partial: Partial<Suggestion>) => {
    setSuggestions(prev => prev.map((s, i) => i === idx ? { ...s, ...partial } : s));
  };

  const totalSteps = 4;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Progress */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i <= qStep ? 'w-12 bg-primary' : 'w-6 bg-border'
            }`}
          />
        ))}
      </div>

      {/* Step 0: Org Type + Name */}
      {qStep === 0 && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold font-heebo">ספרו לנו על הארגון</h2>
            <p className="text-muted-foreground">נתאים לכם שפה עיצובית מושלמת</p>
          </div>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-muted-foreground">שם הארגון (אופציונלי)</span>
            <input
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
              placeholder="למשל: בית ספר אורט בית הערבה"
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-base text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {orgOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => { setOrgType(opt.id); setQStep(1); }}
                className={`rounded-xl border-2 p-5 text-right transition-all hover:border-primary hover:shadow-md ${
                  orgType === opt.id ? 'border-primary bg-primary/5' : 'border-border bg-card'
                }`}
              >
                <span className="text-base font-bold block">{opt.label}</span>
                <span className="text-sm text-muted-foreground">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Values */}
      {qStep === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold font-heebo">מה הערכים שמנחים אתכם?</h2>
            <p className="text-muted-foreground">בחרו עד 5 ערכים שמייצגים את הארגון</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {valueOptions.map(v => {
              const selected = selectedValues.includes(v);
              return (
                <button
                  key={v}
                  onClick={() => toggleValue(v)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selected
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-card border border-border text-foreground hover:border-primary/50'
                  }`}
                >
                  {selected && <Check className="w-3 h-3 inline ml-1" />}
                  {v}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between">
            <button onClick={() => setQStep(0)} className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm text-muted-foreground hover:bg-secondary transition-colors">
              <ArrowRight className="w-4 h-4" /> חזרה
            </button>
            <button
              onClick={() => setQStep(2)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-md hover:shadow-lg transition-all"
            >
              המשיכו
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Vibe */}
      {qStep === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold font-heebo">איזו אווירה מתאימה לכם?</h2>
            <p className="text-muted-foreground">בחרו את הסגנון שהכי מייצג אתכם</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vibeOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setVibe(opt.id)}
                className={`rounded-xl border-2 p-5 text-right transition-all hover:border-primary hover:shadow-md ${
                  vibe === opt.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-card'
                }`}
              >
                <span className="text-base font-bold block">{opt.label}</span>
                <span className="text-sm text-muted-foreground">{opt.desc}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button onClick={() => setQStep(1)} className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm text-muted-foreground hover:bg-secondary transition-colors">
              <ArrowRight className="w-4 h-4" /> חזרה
            </button>
            {vibe && (
              <button
                onClick={generateSuggestions}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-md hover:shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4" />
                הציגו הצעות
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Suggestions */}
      {qStep === 3 && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold font-heebo">בחרו את ערכת המיתוג שלכם</h2>
            <p className="text-muted-foreground">4 הצעות מותאמות – לחצו לבחור, ואפשר גם לערוך כל פרט</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((sug, idx) => {
              const isSelected = selectedIdx === idx;
              const usage = usageMap[sug.style.id] || { best: sug.style.tags.slice(0, 2), good: sug.style.tags.slice(2) };
              const hf = fontFamilyMap[sug.fontCombo.heading] || `'${sug.fontCombo.heading}', sans-serif`;
              const bf = fontFamilyMap[sug.fontCombo.body] || `'${sug.fontCombo.body}', sans-serif`;

              return (
                <div
                  key={idx}
                  className={`rounded-2xl border-2 transition-all overflow-hidden ${
                    isSelected ? 'border-primary shadow-xl ring-2 ring-primary/20' : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
                  }`}
                >
                  {/* Header - clickable to select */}
                  <button onClick={() => handleSelect(idx)} className="w-full text-right p-4 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted-foreground">הצעה {idx + 1}</span>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Palette strip */}
                    <div className="flex gap-1 h-8 rounded-lg overflow-hidden mb-3">
                      {sug.palette.colors.map((c, j) => (
                        <div key={j} className="flex-1" style={{ backgroundColor: c.hex }} />
                      ))}
                    </div>

                    {/* Mini preview */}
                    <div className="rounded-lg p-4 mb-3" style={{ background: sug.style.bgColor }}>
                      <p className="text-lg font-bold mb-0.5" style={{ fontFamily: hf, color: sug.palette.colors[0].hex }}>
                        {orgName || 'שם הארגון שלכם'}
                      </p>
                      <p className="text-sm" style={{ fontFamily: bf, color: '#666' }}>
                        {selectedValues.length > 0 ? selectedValues.slice(0, 3).join(' · ') : 'טקסט לדוגמה'}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span
                          className="text-xs font-bold px-3 py-1"
                          style={{ ...sug.buttonStyle.css, background: sug.palette.colors[0].hex, color: '#fff', padding: '4px 12px', fontSize: '11px' }}
                        >
                          כפתור
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-1 text-sm">
                      <p><span className="font-bold">פלטה:</span> {sug.palette.name}</p>
                      <p><span className="font-bold">סגנון:</span> {sug.style.name}</p>
                      <p><span className="font-bold">פונטים:</span> {sug.fontCombo.heading} + {sug.fontCombo.body}</p>
                      <p><span className="font-bold">כפתורים:</span> {sug.buttonStyle.name}</p>
                    </div>
                  </button>

                  {/* Usage recommendations */}
                  <div className="px-4 pb-3 border-t border-border pt-3">
                    <p className="text-xs font-bold text-foreground mb-1.5">מומלץ במיוחד עבור:</p>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {usage.best.map((u, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${sug.palette.colors[0].hex}20`, color: sug.palette.colors[0].hex }}>{u}</span>
                      ))}
                    </div>
                    <p className="text-xs font-bold text-muted-foreground mt-1.5 mb-1">מתאים גם ל:</p>
                    <div className="flex flex-wrap gap-1">
                      {usage.good.map((u, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{u}</span>
                      ))}
                    </div>
                  </div>

                  {/* Edit options - only for selected */}
                  {isSelected && (
                    <div className="border-t border-border bg-secondary/30 p-3 space-y-2">
                      <p className="text-xs font-bold text-foreground">רוצים לשנות משהו?</p>

                      {/* Edit fonts */}
                      <EditDropdown
                        label={`פונטים: ${sug.fontCombo.heading} + ${sug.fontCombo.body}`}
                        isOpen={editingPart === `font-${idx}`}
                        onToggle={() => setEditingPart(editingPart === `font-${idx}` ? null : `font-${idx}`)}
                      >
                        <div className="grid grid-cols-1 gap-1 max-h-[200px] overflow-y-auto">
                          {fontCombos.map(f => {
                            const fhf = fontFamilyMap[f.heading] || `'${f.heading}', sans-serif`;
                            return (
                              <button
                                key={f.id}
                                onClick={() => { updateSuggestion(idx, { fontCombo: f }); setEditingPart(null); }}
                                className={`rounded-lg p-2 text-right transition-all border ${sug.fontCombo.id === f.id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-secondary'}`}
                              >
                                <p className="text-sm font-bold" style={{ fontFamily: fhf }}>{f.heading}</p>
                                <p className="text-[10px] text-muted-foreground">{f.body} – {f.name}</p>
                              </button>
                            );
                          })}
                        </div>
                      </EditDropdown>

                      {/* Edit buttons */}
                      <EditDropdown
                        label={`כפתורים: ${sug.buttonStyle.name}`}
                        isOpen={editingPart === `btn-${idx}`}
                        onToggle={() => setEditingPart(editingPart === `btn-${idx}` ? null : `btn-${idx}`)}
                      >
                        <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto py-1">
                          {buttonStyles.slice(0, 10).map(b => {
                            const bg = b.category === 'outline' ? 'transparent' : sug.palette.colors[0].hex;
                            const clr = b.category === 'outline' ? sug.palette.colors[0].hex : '#fff';
                            const bdr = b.category === 'outline' ? `2px solid ${sug.palette.colors[0].hex}` : 'none';
                            return (
                              <button
                                key={b.id}
                                onClick={() => { updateSuggestion(idx, { buttonStyle: b }); setEditingPart(null); }}
                                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all border ${sug.buttonStyle.id === b.id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-secondary'}`}
                              >
                                <div className="text-[10px] font-medium" style={{ ...b.css, background: bg, color: clr, border: bdr, minWidth: '60px', padding: '4px 10px' }}>
                                  {b.css.width ? '→' : 'דוגמה'}
                                </div>
                                <span className="text-[9px] text-muted-foreground">{b.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </EditDropdown>

                      {/* Edit palette */}
                      <EditDropdown
                        label={`פלטה: ${sug.palette.name}`}
                        isOpen={editingPart === `pal-${idx}`}
                        onToggle={() => setEditingPart(editingPart === `pal-${idx}` ? null : `pal-${idx}`)}
                      >
                        <div className="grid grid-cols-2 gap-1.5 max-h-[200px] overflow-y-auto">
                          {colorPalettes.map(p => (
                            <button
                              key={p.id}
                              onClick={() => { updateSuggestion(idx, { palette: p }); setEditingPart(null); }}
                              className={`rounded-lg p-1.5 text-right transition-all border ${sug.palette.id === p.id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-secondary'}`}
                            >
                              <div className="flex gap-0.5 h-4 rounded overflow-hidden mb-0.5">
                                {p.colors.map((col, i) => <div key={i} className="flex-1" style={{ backgroundColor: col.hex }} />)}
                              </div>
                              <span className="text-[10px] font-medium">{p.name}</span>
                            </button>
                          ))}
                        </div>
                      </EditDropdown>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <button onClick={() => setQStep(2)} className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm text-muted-foreground hover:bg-secondary transition-colors">
              <ArrowRight className="w-4 h-4" /> חזרה
            </button>
            {selectedIdx !== null && (
              <button
                onClick={handleConfirm}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                אישור ומעבר לתוצרים
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EditDropdown({ label, isOpen, onToggle, children }: { label: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div>
      <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium bg-card border border-border hover:border-primary/50 transition-colors">
        <span>{label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="mt-1 p-2 rounded-lg bg-card border border-border">{children}</div>}
    </div>
  );
}
