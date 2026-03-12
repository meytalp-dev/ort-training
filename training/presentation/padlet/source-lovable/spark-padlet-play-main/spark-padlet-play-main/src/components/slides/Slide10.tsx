import SlideLayout from "../presentation/SlideLayout";
import { SlideNumber, SectionDivider } from "./Infographics";
import { Animated, Stagger, StaggerItem } from "./SlideAnimations";
import { MessageSquareDashed, Pin } from "lucide-react";

export default function Slide10() {
  const ideas = [
    "כבר למדנו על זה בשנה שעברה!",
    "זה קשור לנושא של מדע?",
    "ראיתי סרטון על זה!",
    "אני חושב שזה חשוב כי...",
    "אפשר לחבר את זה ל...",
    "שמעתי שיש קשר בין...",
  ];
  const colors = ["bg-slide-primary-light", "bg-slide-secondary-light", "bg-slide-blue-light", "bg-slide-accent-light", "bg-slide-purple-light", "bg-slide-green-light"];

  return (
    <SlideLayout>
      <div className="flex h-full">
        <div className="flex-1 flex flex-col justify-center px-32 py-24">
          <Animated delay={0.1} type="slideRight">
            <SectionDivider color="bg-slide-accent" />
            <h1 className="text-6xl font-rubik font-black text-slide-dark mt-6 mb-4">שימוש ראשון בכיתה</h1>
            <p className="text-2xl font-heebo text-slide-gray font-light mb-12">דוגמה פשוטה לפעילות ראשונה</p>
          </Animated>

          <Animated delay={0.3}>
            <div className="bg-slide-card rounded-3xl p-10 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] mb-12">
              <p className="text-lg font-heebo text-slide-gray mb-3">שאלת פתיחה</p>
              <h2 className="text-3xl font-rubik font-bold text-slide-primary flex items-center gap-3">
                <MessageSquareDashed size={28} strokeWidth={1.5} />
                מה אתם כבר יודעים על הנושא?
              </h2>
            </div>
          </Animated>

          <Animated delay={0.5} type="slideRight">
            <div className="flex items-center gap-4 mb-10">
              {["המורה שואל", "תלמידים כותבים", "סיעור מוחות!"].map((text, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`${["bg-slide-primary-light", "bg-slide-secondary-light", "bg-slide-accent-light"][i]} px-7 py-4 rounded-2xl text-xl font-heebo font-medium text-slide-dark`}>
                    {text}
                  </div>
                  {i < 2 && <span className="text-2xl text-slide-gray/30">←</span>}
                </div>
              ))}
            </div>
          </Animated>

          <Animated delay={0.7}>
            <div className="bg-slide-accent-light rounded-2xl px-8 py-5 flex items-center gap-4">
              <Pin size={22} className="text-slide-accent" strokeWidth={1.5} />
              <p className="text-xl font-heebo text-slide-dark/70 font-medium">מתקבל סיעור מוחות של כל הכיתה – בזמן אמת</p>
            </div>
          </Animated>
        </div>

        <Animated delay={0.4} type="slideLeft" className="w-[580px] flex items-center justify-center p-12">
          <div className="w-full bg-slide-card rounded-3xl p-10 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)]">
            <p className="text-center text-2xl font-rubik font-bold text-slide-dark mb-8 flex items-center justify-center gap-2">
              <MessageSquareDashed size={24} strokeWidth={1.5} className="text-slide-primary" />
              סיעור מוחות
            </p>
            <Stagger stagger={0.08} delay={0.6} className="grid grid-cols-2 gap-4">
              {ideas.map((idea, i) => (
                <StaggerItem key={i} type="scaleIn">
                  <div className={`${colors[i]} rounded-2xl p-5 text-lg font-heebo text-slide-dark`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-slide-dark/5" />
                      <span className="text-sm text-slide-gray">תלמיד/ה {i + 1}</span>
                    </div>
                    {idea}
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Animated>
      </div>
      <SlideNumber num={10} total={17} />
    </SlideLayout>
  );
}
