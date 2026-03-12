import SlideLayout from "../presentation/SlideLayout";
import { SlideNumber, SectionDivider } from "./Infographics";
import { Animated, Stagger, StaggerItem } from "./SlideAnimations";
import { LayoutGrid, Columns3 } from "lucide-react";
import padletCreate from "@/assets/padlet-create.png";

export default function Slide05() {
  return (
    <SlideLayout>
      <div className="flex flex-col h-full px-32 py-24">
        <Animated delay={0.1}>
          <div className="text-center mb-14">
            <SectionDivider color="bg-slide-accent" />
            <h1 className="text-6xl font-rubik font-black text-slide-dark mt-6 mb-4">יצירת לוח חדש</h1>
            <p className="text-2xl font-heebo text-slide-gray font-light">בחרו את סוג הלוח המתאים לפעילות</p>
            <Animated delay={0.2} type="fadeIn">
              <img src={padletCreate} alt="Padlet create" className="h-28 w-auto object-contain mx-auto mt-4 rounded-xl opacity-90" />
            </Animated>
          </div>
        </Animated>

        <Animated delay={0.3} type="slideRight">
          <div className="flex items-center gap-8 mb-14">
            {[
              { num: "01", text: 'לוחצים "Make a Padlet"', bg: "bg-slide-primary-light" },
              { num: "02", text: "בוחרים סוג לוח", bg: "bg-slide-secondary-light" },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-xl ${step.bg} flex items-center justify-center text-lg font-rubik font-bold text-slide-dark/60 shrink-0`}>
                  {step.num}
                </div>
                <span className="text-2xl font-heebo font-medium text-slide-dark">{step.text}</span>
              </div>
            ))}
          </div>
        </Animated>

        <Animated delay={0.4} type="fadeIn">
          <p className="text-xl font-heebo text-slide-gray mb-10">הנפוצים ביותר:</p>
        </Animated>

        <Stagger stagger={0.2} delay={0.5} className="flex-1 flex gap-10 justify-center">
          {[
            { icon: <LayoutGrid size={44} strokeWidth={1.5} />, name: "Wall", desc: "לוח רעיונות חופשי – תלמידים מוסיפים תכנים בסדר חופשי", bg: "bg-slide-primary-light text-slide-primary", color: "bg-slide-primary/10" },
            { icon: <Columns3 size={44} strokeWidth={1.5} />, name: "Grid", desc: "לוח מסודר בעמודות – מתאים לסיווג והשוואה", bg: "bg-slide-secondary-light text-slide-secondary", color: "bg-slide-secondary/10" },
          ].map((board, i) => (
            <StaggerItem key={i} type="scaleIn">
              <div className="w-[400px] bg-slide-card rounded-3xl p-12 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] flex flex-col items-center gap-8 text-center">
                <div className={`w-20 h-20 rounded-2xl ${board.bg} flex items-center justify-center`}>{board.icon}</div>
                <h3 className="text-4xl font-rubik font-bold text-slide-dark">{board.name}</h3>
                <p className="text-xl font-heebo text-slide-gray leading-relaxed">{board.desc}</p>
                <div className="w-full bg-slide-bg rounded-2xl p-5 grid grid-cols-3 gap-2.5">
                  {[...Array(6)].map((_, j) => (<div key={j} className={`aspect-square rounded-xl ${board.color}`} />))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
      <SlideNumber num={5} total={17} />
    </SlideLayout>
  );
}
