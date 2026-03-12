import SlideLayout from "../presentation/SlideLayout";
import { SlideNumber, SectionDivider } from "./Infographics";
import { Animated, Stagger, StaggerItem } from "./SlideAnimations";
import { Sparkle, HelpCircle, Pin, Ticket } from "lucide-react";

export default function Slide11() {
  return (
    <SlideLayout>
      <div className="flex h-full">
        <div className="flex-1 flex flex-col justify-center px-32 py-24">
          <Animated delay={0.1} type="slideRight">
            <SectionDivider color="bg-slide-green" />
            <h1 className="text-6xl font-rubik font-black text-slide-dark mt-6 mb-4">פעילות סיכום שיעור</h1>
            <p className="text-2xl font-heebo text-slide-gray font-light mb-14">בסוף השיעור, כל תלמיד כותב:</p>
          </Animated>

          <Stagger stagger={0.15} delay={0.3} className="flex gap-8 mb-14">
            <StaggerItem type="scaleIn" className="flex-1">
              <div className="bg-slide-card rounded-3xl p-10 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] text-center">
                <div className="w-16 h-16 rounded-2xl bg-slide-green-light flex items-center justify-center mx-auto mb-5 text-slide-green">
                  <Sparkle size={30} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-rubik font-bold text-slide-dark mb-3">דבר אחד שלמד</h3>
                <p className="text-xl font-heebo text-slide-gray">מה הדבר המשמעותי ביותר?</p>
              </div>
            </StaggerItem>
            <StaggerItem type="scaleIn" className="flex-1">
              <div className="bg-slide-card rounded-3xl p-10 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] text-center">
                <div className="w-16 h-16 rounded-2xl bg-slide-secondary-light flex items-center justify-center mx-auto mb-5 text-slide-secondary">
                  <HelpCircle size={30} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-rubik font-bold text-slide-dark mb-3">שאלה שנשארה</h3>
                <p className="text-xl font-heebo text-slide-gray">על מה עוד רוצים ללמוד?</p>
              </div>
            </StaggerItem>
          </Stagger>

          <Animated delay={0.7}>
            <div className="bg-slide-green-light rounded-2xl px-8 py-5 flex items-center gap-4">
              <Pin size={22} className="text-slide-green" strokeWidth={1.5} />
              <p className="text-xl font-heebo text-slide-green font-medium">המורה מקבל משוב מיידי – לדעת מה הבינו ומה צריך לחזק</p>
            </div>
          </Animated>
        </div>

        <Animated delay={0.4} type="slideLeft" className="w-[520px] flex items-center justify-center p-12">
          <div className="w-full bg-slide-card rounded-3xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] p-10">
            <p className="text-center text-xl font-rubik font-bold text-slide-dark mb-8 flex items-center justify-center gap-2">
              <Ticket size={20} strokeWidth={1.5} className="text-slide-primary" />
              כרטיס יציאה
            </p>
            <Stagger stagger={0.1} delay={0.6} className="flex flex-col gap-4">
              {[
                { name: "דנה", learned: "למדתי על תהליך הפוטוסינתזה", question: "איך זה עובד בחושך?", bg: "bg-slide-green-light" },
                { name: "יוסי", learned: "הבנתי את ההבדל בין...", question: "מה קורה כשאין מים?", bg: "bg-slide-blue-light" },
                { name: "מיכל", learned: "גיליתי שצמחים...", question: "למה העלים ירוקים?", bg: "bg-slide-purple-light" },
              ].map((s, i) => (
                <StaggerItem key={i}>
                  <div className={`${s.bg} rounded-2xl p-5`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-slide-dark/5 flex items-center justify-center text-xs font-bold text-slide-gray">{s.name[0]}</div>
                      <span className="text-lg font-heebo font-medium text-slide-dark">{s.name}</span>
                    </div>
                    <p className="text-base font-heebo text-slide-dark mb-1 flex items-center gap-1">
                      <Sparkle size={14} strokeWidth={1.5} className="text-slide-green" /> {s.learned}
                    </p>
                    <p className="text-base font-heebo text-slide-gray flex items-center gap-1">
                      <HelpCircle size={14} strokeWidth={1.5} className="text-slide-secondary" /> {s.question}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Animated>
      </div>
      <SlideNumber num={11} total={17} />
    </SlideLayout>
  );
}
