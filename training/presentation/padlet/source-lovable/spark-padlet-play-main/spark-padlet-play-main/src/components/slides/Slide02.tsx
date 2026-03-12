import SlideLayout from "../presentation/SlideLayout";
import { SlideNumber, SectionDivider } from "./Infographics";
import { Animated, Stagger, StaggerItem } from "./SlideAnimations";
import { Star, HelpCircle } from "lucide-react";

export default function Slide02() {
  const ratingOptions = [
    { num: 1, label: "לא מכיר/ה כלל", color: "bg-red-100 text-red-600" },
    { num: 2, label: "מכיר/ה מעט", color: "bg-orange-100 text-orange-600" },
    { num: 3, label: "מכיר/ה היטב", color: "bg-yellow-100 text-yellow-700" },
    { num: 4, label: "משתמש/ת כבר", color: "bg-lime-100 text-lime-700" },
    { num: 5, label: "מומחה/ה!", color: "bg-emerald-100 text-emerald-700" },
  ];

  return (
    <SlideLayout>
      <div className="flex flex-col h-full px-24 py-20">
        <Animated delay={0.1}>
          <div className="text-center mb-12">
            <SectionDivider />
            <h1 className="text-5xl font-rubik font-black text-slide-dark mt-6 mb-4">
              סקר <span className="text-slide-primary">פתיחה</span>
            </h1>
            <p className="text-2xl font-heebo text-slide-gray font-light">דרג/י את ההכרות שלך עם Padlet</p>
          </div>
        </Animated>

        <div className="flex-1 flex flex-col justify-center gap-8">
          <Animated delay={0.3}>
            <div className="bg-slide-card rounded-[2rem] p-12 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-slide-primary-light flex items-center justify-center text-slide-primary">
                  <Star size={32} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-2xl font-rubik font-bold text-slide-dark">דרג/י את ההכרות שלך</h3>
                  <p className="text-lg font-heebo text-slide-gray">מ-1 (לא מכיר/ה) עד 5 (מומחה/ה)</p>
                </div>
              </div>
              <Stagger stagger={0.08} delay={0.4} className="flex items-stretch gap-4">
                {ratingOptions.map((option) => (
                  <StaggerItem key={option.num} type="scaleIn" className="flex-1">
                    <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-slide-gray/10 hover:border-slide-primary/30 transition-colors">
                      <div className={`w-16 h-16 rounded-2xl ${option.color} flex items-center justify-center text-3xl font-black`}>
                        {option.num}
                      </div>
                      <span className="text-lg font-heebo font-medium text-slide-dark text-center">{option.label}</span>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </Animated>

          <Animated delay={0.6}>
            <div className="bg-slide-card rounded-[2rem] p-12 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slide-secondary-light flex items-center justify-center text-slide-secondary">
                  <HelpCircle size={32} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-3xl font-rubik font-bold text-slide-primary">מה תוכל/י לעשות עם Padlet?</h3>
                  <p className="text-lg font-heebo text-slide-gray mt-2">שאלה פתוחה – שתפו את הרעיונות שלכם</p>
                </div>
              </div>
              <div className="w-full bg-slide-bg rounded-2xl p-8 min-h-[120px] flex items-center justify-center">
                <p className="text-2xl font-heebo text-slide-gray/40 text-center">כתבו את התשובה שלכם כאן...</p>
              </div>
            </div>
          </Animated>
        </div>
      </div>
      <SlideNumber num={2} total={17} />
    </SlideLayout>
  );
}
