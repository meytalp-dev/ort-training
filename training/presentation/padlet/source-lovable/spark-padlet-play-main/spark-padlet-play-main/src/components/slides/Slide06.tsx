import SlideLayout from "../presentation/SlideLayout";
import { SlideNumber, SectionDivider } from "./Infographics";
import { Animated, Stagger, StaggerItem } from "./SlideAnimations";
import { Tag, PenLine, Palette, Settings, Pin } from "lucide-react";

export default function Slide06() {
  const settings = [
    { key: "Title", desc: "שם הלוח", icon: <Tag size={24} strokeWidth={1.5} />, example: "סיעור מוחות – נושא השיעור", bg: "bg-slide-primary-light text-slide-primary" },
    { key: "Description", desc: "הנחיות לתלמידים", icon: <PenLine size={24} strokeWidth={1.5} />, example: "כתבו רעיון אחד בפוסט", bg: "bg-slide-secondary-light text-slide-secondary" },
    { key: "Background", desc: "רקע הלוח", icon: <Palette size={24} strokeWidth={1.5} />, example: "בחרו צבע או תמונה", bg: "bg-slide-blue-light text-slide-blue" },
  ];

  return (
    <SlideLayout>
      <div className="flex h-full">
        <div className="flex-1 flex flex-col justify-center px-32 py-24">
          <Animated delay={0.1} type="slideRight">
            <SectionDivider color="bg-slide-purple" />
            <h1 className="text-6xl font-rubik font-black text-slide-dark mt-6 mb-4">הגדרת הלוח</h1>
            <p className="text-2xl font-heebo text-slide-gray font-light mb-14">
              לוחצים על <Settings size={22} className="inline text-slide-gray" strokeWidth={1.5} /> Settings ומגדירים
            </p>
          </Animated>

          <Stagger stagger={0.12} delay={0.3} className="flex flex-col gap-6">
            {settings.map((s, i) => (
              <StaggerItem key={i} type="slideRight">
                <div className="bg-slide-card rounded-2xl p-8 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>{s.icon}</div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xl font-rubik font-bold text-slide-dark">{s.key}</span>
                      <span className="text-xl font-heebo text-slide-gray">– {s.desc}</span>
                    </div>
                    <p className="text-lg font-heebo text-slide-gray/50">לדוגמה: "{s.example}"</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Animated delay={0.7}>
            <div className="bg-slide-primary-light rounded-2xl px-8 py-5 mt-10 flex items-center gap-4">
              <Pin size={22} className="text-slide-primary" strokeWidth={1.5} />
              <p className="text-xl font-heebo text-slide-primary font-medium">חשוב לכתוב משימה ברורה ומדויקת!</p>
            </div>
          </Animated>
        </div>

        <Animated delay={0.4} type="slideLeft" className="w-[520px] flex items-center justify-center p-16">
          <div className="w-full bg-slide-card rounded-3xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] p-10">
            <div className="flex items-center gap-3 mb-10">
              <Settings size={24} className="text-slide-gray" strokeWidth={1.5} />
              <span className="text-2xl font-rubik font-bold text-slide-dark">Settings</span>
            </div>
            {["Title", "Description", "Background"].map((field, i) => (
              <div key={i} className="mb-7">
                <label className="text-lg font-heebo text-slide-gray mb-2 block">{field}</label>
                <div className="w-full h-12 bg-slide-bg rounded-xl flex items-center px-5 text-lg font-heebo text-slide-gray/40">
                  {field === "Title" ? "שם הלוח..." : field === "Description" ? "הנחיות..." : "בחר רקע"}
                </div>
              </div>
            ))}
            <div className="w-full h-12 bg-slide-primary rounded-xl flex items-center justify-center text-lg font-heebo text-white font-medium">Save</div>
          </div>
        </Animated>
      </div>
      <SlideNumber num={6} total={17} />
    </SlideLayout>
  );
}
