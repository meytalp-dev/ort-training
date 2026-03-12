import SlideLayout from "../presentation/SlideLayout";
import { SlideNumber, SectionDivider } from "./Infographics";
import { Animated } from "./SlideAnimations";
import { ArrowUpRight, MessageSquare, Heart } from "lucide-react";

export default function Slide15() {
  return (
    <SlideLayout className="relative">
      <div className="flex flex-col items-center justify-center h-full gap-10 px-28">
        <Animated type="scaleIn" delay={0.1}>
          <div className="w-20 h-20 rounded-2xl bg-slide-primary-light flex items-center justify-center text-slide-primary">
            <ArrowUpRight size={40} strokeWidth={1.5} />
          </div>
        </Animated>

        <Animated delay={0.25}>
          <h1 className="text-7xl font-rubik font-black text-slide-dark text-center">בואו ננסה יחד!</h1>
        </Animated>

        <Animated delay={0.35} type="fadeIn">
          <SectionDivider />
        </Animated>

        <Animated delay={0.45}>
          <p className="text-2xl font-heebo text-slide-gray">סרקו את הקוד או היכנסו לקישור</p>
        </Animated>

        <Animated delay={0.55} type="scaleIn">
          <div className="bg-slide-card rounded-3xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] p-12 flex flex-col items-center gap-8">
            <div className="w-52 h-52 bg-slide-dark rounded-2xl grid grid-cols-7 grid-rows-7 gap-1 p-5">
              {[...Array(49)].map((_, i) => (
                <div key={i} className={`rounded-sm ${Math.random() > 0.35 ? "bg-white" : "bg-transparent"}`} />
              ))}
            </div>
            <div className="bg-slide-primary-light text-slide-primary px-8 py-3 rounded-full text-xl font-heebo font-medium">
              padlet.com/example
            </div>
          </div>
        </Animated>

        <Animated delay={0.7}>
          <div className="bg-slide-card rounded-3xl p-10 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] max-w-[900px] w-full text-center">
            <p className="text-lg font-heebo text-slide-gray mb-3">כתבו בלוח:</p>
            <h2 className="text-3xl font-rubik font-bold text-slide-primary flex items-center justify-center gap-3">
              <MessageSquare size={28} strokeWidth={1.5} />
              איך הייתם משתמשים ב-Padlet בכיתה שלכם?
            </h2>
          </div>
        </Animated>

        <Animated delay={0.85} type="fadeIn">
          <p className="text-2xl font-heebo text-slide-gray font-light flex items-center gap-2">
            תודה רבה! <Heart size={22} className="text-slide-secondary" strokeWidth={1.5} />
          </p>
        </Animated>
      </div>
      <SlideNumber num={15} total={17} />
    </SlideLayout>
  );
}
