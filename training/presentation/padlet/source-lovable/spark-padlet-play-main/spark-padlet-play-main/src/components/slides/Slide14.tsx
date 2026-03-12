import SlideLayout from "../presentation/SlideLayout";
import { SlideNumber, SectionDivider } from "./Infographics";
import { Animated, Stagger, StaggerItem } from "./SlideAnimations";
import { XCircle, CheckCircle, Check } from "lucide-react";

export default function Slide14() {
  const mistakes = [
    { mistake: "אין הנחיה ברורה למשימה", fix: "לכתוב בדיוק מה צריך לעשות" },
    { mistake: "הלוח עמוס מדי בפוסטים", fix: "להגביל מספר פוסטים לתלמיד" },
    { mistake: "אין בקרה על תוכן", fix: "להפעיל אישור פוסטים (Moderation)" },
  ];

  return (
    <SlideLayout>
      <div className="flex flex-col h-full px-32 py-24">
        <Animated delay={0.1}>
          <div className="text-center mb-14">
            <SectionDivider color="bg-slide-secondary" />
            <h1 className="text-6xl font-rubik font-black text-slide-dark mt-6 mb-4">טעויות נפוצות</h1>
            <p className="text-2xl font-heebo text-slide-gray font-light">דברים שכדאי להימנע מהם ואיך לתקן</p>
          </div>
        </Animated>

        <Stagger stagger={0.15} delay={0.3} className="flex-1 flex flex-col gap-7">
          {mistakes.map((m, i) => (
            <StaggerItem key={i} type="slideRight">
              <div className="flex items-stretch gap-6">
                <div className="flex-1 bg-slide-card rounded-3xl p-8 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-slide-secondary-light flex items-center justify-center shrink-0 text-slide-secondary">
                    <XCircle size={22} strokeWidth={1.5} />
                  </div>
                  <span className="text-2xl font-heebo font-medium text-slide-dark">{m.mistake}</span>
                </div>
                <div className="flex items-center text-2xl text-slide-gray/30">←</div>
                <div className="flex-1 bg-slide-card rounded-3xl p-8 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-slide-green-light flex items-center justify-center shrink-0 text-slide-green">
                    <CheckCircle size={22} strokeWidth={1.5} />
                  </div>
                  <span className="text-2xl font-heebo font-medium text-slide-dark">{m.fix}</span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Animated delay={0.8}>
          <div className="bg-slide-green-light rounded-2xl px-8 py-5 mt-8 flex items-center gap-4">
            <Check size={22} className="text-slide-green" strokeWidth={1.5} />
            <p className="text-xl font-heebo text-slide-green font-medium">פתרון כללי: להגדיר משימה קצרה, ברורה ומוגדרת היטב</p>
          </div>
        </Animated>
      </div>
      <SlideNumber num={14} total={17} />
    </SlideLayout>
  );
}
