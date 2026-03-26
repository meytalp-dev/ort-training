import { useWizard } from '@/store/wizard';
import StepPalette from '@/components/steps/StepPalette';
import StepStyle from '@/components/steps/StepStyle';
import StepFonts from '@/components/steps/StepFonts';
import StepButtons from '@/components/steps/StepButtons';
import StepOutput from '@/components/steps/StepOutput';
import BrandKit from '@/components/BrandKit';
import MoodPrompt from '@/components/MoodPrompt';
import EntryScreen from '@/components/EntryScreen';
import LogoExtractor from '@/components/LogoExtractor';
import TellMeQuestionnaire from '@/components/TellMeQuestionnaire';
import type { EntryMode } from '@/components/EntryScreen';
import { Palette, Brush, Type, SquareMousePointer, Layout, Sparkles, ArrowRight } from 'lucide-react';

const steps = [
  { label: 'צבעים', icon: Palette },
  { label: 'סגנון', icon: Brush },
  { label: 'פונטים', icon: Type },
  { label: 'כפתורים', icon: SquareMousePointer },
  { label: 'תוצרים', icon: Layout },
];

export default function Index() {
  const { step, setStep, palette, style, fontCombo, buttonStyle, entryMode, setEntryMode, reset } = useWizard();

  const canGoToStep = (s: number) => {
    if (s === 0) return true;
    if (s === 1) return !!palette;
    if (s === 2) return !!palette && !!style;
    if (s === 3) return !!palette && !!style && !!fontCombo;
    if (s === 4) return !!palette && !!style && !!fontCombo && !!buttonStyle;
    return false;
  };

  const isBrandKit = step === 5;
  const showEntry = !entryMode;
  const showMood = entryMode === 'suggest';
  const showLogo = entryMode === 'logo';
  const showTellMe = entryMode === 'tell-me';
  const showWizard = entryMode === 'manual';

  const handleEntrySelect = (mode: EntryMode) => {
    setEntryMode(mode);
    if (mode === 'manual') {
      setStep(0);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl studio-gradient flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold font-heebo">סטודיו מיתוג</h1>
                <p className="text-xs text-muted-foreground">בנו את השפה העיצובית שלכם</p>
              </div>
            </div>

            {entryMode && !isBrandKit && (
              <button
                onClick={() => { reset(); }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-secondary transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                חזרה להתחלה
              </button>
            )}

            {isBrandKit && (
              <button
                onClick={() => setStep(4)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-secondary transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                חזרה לעריכה
              </button>
            )}
          </div>

          {/* Step indicators - show only in wizard/manual modes when inside steps */}
          {entryMode && !isBrandKit && !showMood && !showLogo && !showTellMe && (
            <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const active = step === i;
                const completed = canGoToStep(i + 1);
                const clickable = canGoToStep(i);
                return (
                  <button
                    key={i}
                    onClick={() => clickable && setStep(i)}
                    disabled={!clickable}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                      active
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : completed
                        ? 'bg-accent/20 text-accent cursor-pointer'
                        : clickable
                        ? 'text-muted-foreground hover:bg-secondary cursor-pointer'
                        : 'text-muted-foreground/40 cursor-not-allowed'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{i + 1}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-6xl mx-auto px-4 py-8">
        {showEntry ? (
          <EntryScreen onSelect={handleEntrySelect} />
        ) : isBrandKit ? (
          <BrandKit />
        ) : showTellMe && step < 4 ? (
          <TellMeQuestionnaire />
        ) : showMood && step < 4 ? (
          <MoodPrompt />
        ) : showLogo && !palette ? (
          <LogoExtractor onBack={() => setEntryMode(null)} />
        ) : (
          <>
            {step === 0 && <StepPalette />}
            {step === 1 && <StepStyle />}
            {step === 2 && <StepFonts />}
            {step === 3 && <StepButtons />}
            {step === 4 && <StepOutput />}
          </>
        )}
      </main>
    </div>
  );
}
