import SlideLayout from "../presentation/SlideLayout";
import { SlideNumber, SectionDivider } from "./Infographics";
import { Animated, Stagger, StaggerItem } from "./SlideAnimations";
import { Compass, Wrench, Users, GraduationCap, Sparkles, LayoutDashboard } from "lucide-react";
import padletHero from "@/assets/padlet-hero.png";

export default function Slide01() {
  const items = [
    { icon: <Compass size={20} />, text: "מהו Padlet" },
    { icon: <Wrench size={20} />, text: "איך יוצרים לוח" },
    { icon: <Users size={20} />, text: "איך משתפים תלמידים" },
    { icon: <GraduationCap size={20} />, text: "שימושים פדגוגיים" },
    { icon: <Sparkles size={20} />, text: "שילוב בינה מלאכותית" },
  ];

  return (
    <SlideLayout className="relative">
      <div className="flex flex-col items-center justify-center h-full gap-8 px-20">
        <Animated type="scaleIn" delay={0.1}>
          <div className="w-24 h-24 rounded-3xl bg-slide-primary-light flex items-center justify-center text-slide-primary">
            <LayoutDashboard size={48} strokeWidth={1.5} />
          </div>
        </Animated>

        <Animated delay={0.25}>
          <div className="text-center">
            <h1 className="text-[7rem] font-rubik font-black leading-none text-slide-dark mb-4">
              <span className="text-slide-primary">Padlet</span>
            </h1>
            <p className="text-4xl font-heebo text-slide-gray font-light">לוח שיתופי להוראה פעילה</p>
          </div>
        </Animated>

        <Animated delay={0.4} type="fadeIn">
          <SectionDivider />
        </Animated>

        <Animated delay={0.5}>
          <div className="bg-slide-card rounded-3xl p-10 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] max-w-[900px] w-full">
            <p className="text-xl font-heebo text-slide-gray mb-6 text-center">בהדרכה נלמד</p>
            <Stagger stagger={0.08} delay={0.6} className="grid grid-cols-2 gap-5">
              {items.map((item, i) => (
                <StaggerItem key={i}>
                  <div className="flex items-center gap-4 text-lg font-heebo text-slide-dark">
                    <div className="w-10 h-10 rounded-xl bg-slide-primary-light flex items-center justify-center text-slide-primary">
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Animated>

        <Animated delay={0.8} type="fadeIn">
          <div className="mt-2">
            <img src={padletHero} alt="Padlet illustration" className="h-32 w-auto object-contain rounded-2xl opacity-90" />
          </div>
        </Animated>
      </div>
      <SlideNumber num={1} total={17} />
    </SlideLayout>
  );
}
