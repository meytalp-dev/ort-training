import SlideLayout from "../presentation/SlideLayout";
import { SlideNumber, SectionDivider } from "./Infographics";
import { Animated, Stagger, StaggerItem } from "./SlideAnimations";
import { PenLine, Image, Link2, Play, FolderOpen, Pin } from "lucide-react";

export default function Slide07() {
  const contentTypes = [
    { icon: <PenLine size={20} strokeWidth={1.5} />, label: "טקסט", bg: "bg-slide-primary-light text-slide-primary" },
    { icon: <Image size={20} strokeWidth={1.5} />, label: "תמונה", bg: "bg-slide-secondary-light text-slide-secondary" },
    { icon: <Link2 size={20} strokeWidth={1.5} />, label: "קישור", bg: "bg-slide-blue-light text-slide-blue" },
    { icon: <Play size={20} strokeWidth={1.5} />, label: "סרטון", bg: "bg-slide-purple-light text-slide-purple" },
    { icon: <FolderOpen size={20} strokeWidth={1.5} />, label: "קובץ", bg: "bg-slide-green-light text-slide-green" },
  ];

  return (
    <SlideLayout>
      <div className="flex h-full">
        <div className="flex-1 flex flex-col justify-center px-32 py-24">
          <Animated delay={0.1} type="slideRight">
            <SectionDivider color="bg-slide-green" />
            <h1 className="text-6xl font-rubik font-black text-slide-dark mt-6 mb-4">הוספת פוסטים</h1>
            <p className="text-2xl font-heebo text-slide-gray font-light mb-14">
              לוחצים על <span className="text-slide-primary font-bold text-3xl">+</span> ומוסיפים תוכן
            </p>
          </Animated>

          <Stagger stagger={0.08} delay={0.3} className="flex flex-wrap gap-5 mb-14">
            {contentTypes.map((c, i) => (
              <StaggerItem key={i} type="scaleIn">
                <div className="bg-slide-card rounded-2xl px-8 py-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center`}>{c.icon}</div>
                  <span className="text-xl font-heebo font-semibold text-slide-dark">{c.label}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Animated delay={0.7}>
            <div className="bg-slide-green-light rounded-2xl px-8 py-5 flex items-center gap-4">
              <Pin size={22} className="text-slide-green" strokeWidth={1.5} />
              <p className="text-xl font-heebo text-slide-green font-medium">כל תלמיד יכול להוסיף פוסט בעצמו!</p>
            </div>
          </Animated>
        </div>

        <Animated delay={0.4} type="slideLeft" className="w-[520px] flex items-center justify-center p-16">
          <div className="w-full bg-slide-card rounded-3xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] p-10">
            <div className="text-2xl font-rubik font-bold text-slide-dark mb-8">פוסט חדש</div>
            <div className="w-full h-40 bg-slide-bg rounded-xl mb-6 flex items-center justify-center text-slide-gray/40 text-lg font-heebo">כתבו כאן...</div>
            <div className="flex gap-3 mb-8">
              {contentTypes.map((c, i) => (
                <div key={i} className={`w-11 h-11 rounded-lg ${c.bg} flex items-center justify-center`}>{c.icon}</div>
              ))}
            </div>
            <div className="w-full h-12 bg-slide-primary rounded-xl flex items-center justify-center text-lg font-heebo text-white font-medium">Publish</div>
          </div>
        </Animated>
      </div>
      <SlideNumber num={7} total={17} />
    </SlideLayout>
  );
}
