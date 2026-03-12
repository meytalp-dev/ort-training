import SlideLayout from "../presentation/SlideLayout";
import { SlideNumber, SectionDivider } from "./Infographics";
import { Animated, Stagger, StaggerItem } from "./SlideAnimations";
import { Wand2, Sparkles, Brush, ListChecks, Pin } from "lucide-react";

export default function Slide13() {
  const aiFeatures = [
    { icon: <Wand2 size={28} strokeWidth={1.5} />, title: "לוח אוטומטי", desc: "יצירת לוח מוכן לפי נושא", bg: "bg-slide-purple-light text-slide-purple" },
    { icon: <Sparkles size={28} strokeWidth={1.5} />, title: "רעיונות לפעילות", desc: "AI מציע פעילויות יצירתיות", bg: "bg-slide-secondary-light text-slide-secondary" },
    { icon: <Brush size={28} strokeWidth={1.5} />, title: "יצירת תמונות", desc: "תמונות AI מותאמות אישית", bg: "bg-slide-primary-light text-slide-primary" },
    { icon: <ListChecks size={28} strokeWidth={1.5} />, title: "סיכום פוסטים", desc: "סיכום אוטומטי של כל הלוח", bg: "bg-slide-blue-light text-slide-blue" },
  ];

  return (
    <SlideLayout>
      <div className="flex flex-col h-full px-32 py-24">
        <Animated delay={0.1}>
          <div className="text-center mb-14">
            <SectionDivider color="bg-slide-purple" />
            <h1 className="text-6xl font-rubik font-black text-slide-dark mt-6 mb-4">
              בינה מלאכותית ב-<span className="text-slide-primary">Padlet</span>
            </h1>
            <p className="text-2xl font-heebo text-slide-gray font-light">כלים חכמים לחיסכון בזמן</p>
          </div>
        </Animated>

        <Stagger stagger={0.12} delay={0.3} className="grid grid-cols-4 gap-8 flex-1">
          {aiFeatures.map((f, i) => (
            <StaggerItem key={i} type="scaleIn">
              <div className="bg-slide-card rounded-3xl p-10 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] flex flex-col items-center text-center gap-5 h-full">
                <span className="text-slide-gray/40 text-lg font-heebo self-start">{String(i + 1).padStart(2, '0')}</span>
                <div className={`w-16 h-16 rounded-2xl ${f.bg} flex items-center justify-center`}>{f.icon}</div>
                <h3 className="text-2xl font-rubik font-bold text-slide-dark">{f.title}</h3>
                <p className="text-xl font-heebo text-slide-gray leading-relaxed">{f.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Animated delay={0.8}>
          <div className="bg-slide-purple-light rounded-2xl px-8 py-5 mt-10 flex items-center gap-4">
            <Pin size={22} className="text-slide-purple" strokeWidth={1.5} />
            <p className="text-xl font-heebo text-slide-dark/70 font-medium">בינה מלאכותית עוזרת לתכנן, ליצור ולסכם – הכל בתוך Padlet</p>
          </div>
        </Animated>
      </div>
      <SlideNumber num={13} total={17} />
    </SlideLayout>
  );
}
