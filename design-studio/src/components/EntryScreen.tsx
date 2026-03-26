import { MessageSquare, Sparkles, Image, Layers } from 'lucide-react';

export type EntryMode = 'tell-me' | 'suggest' | 'logo' | 'manual';

const entries: { id: EntryMode; icon: typeof MessageSquare; title: string; desc: string }[] = [
  { id: 'tell-me', icon: MessageSquare, title: 'ספרו לי על הארגון', desc: 'ענו על כמה שאלות קצרות ונציע שפה עיצובית מותאמת' },
  { id: 'suggest', icon: Sparkles, title: 'הציעו לי סגנון', desc: 'בחרו אווירה ונציע 4 שילובים מוכנים' },
  { id: 'logo', icon: Image, title: 'יש לנו לוגו', desc: 'העלו תמונה של הלוגו – נחלץ צבעים ונציע שילובים' },
  { id: 'manual', icon: Layers, title: 'נבחר בעצמנו', desc: 'אשף צעד-צעד – בחרו הכל לבד' },
];

interface Props {
  onSelect: (mode: EntryMode) => void;
}

export default function EntryScreen({ onSelect }: Props) {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold font-heebo studio-gradient-text">בנו את השפה העיצובית שלכם</h2>
        <p className="text-muted-foreground">בחרו צבעים, סגנון ופונטים – וקבלו ערכת מיתוג שתשמור על אחידות בכל החומרים</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {entries.map(({ id, icon: Icon, title, desc }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="group rounded-2xl border-2 border-border bg-card p-6 text-right transition-all hover:border-primary hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
              <Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-lg font-bold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
