import SlideLayout from "../presentation/SlideLayout";
import { SlideNumber, SectionDivider } from "./Infographics";
import { Animated, Stagger, StaggerItem } from "./SlideAnimations";
import { Eye, MessageCircle, PenTool, Star, Pin } from "lucide-react";

export default function Slide09() {
  const permissions = [
    { role: "Viewer", icon: <Eye size={32} strokeWidth={1.5} />, desc: "צפייה בלבד", bg: "bg-slide-blue-light text-slide-blue", barWidth: "33%" },
    { role: "Commenter", icon: <MessageCircle size={32} strokeWidth={1.5} />, desc: "הוספת תגובות", bg: "bg-slide-purple-light text-slide-purple", barWidth: "66%" },
    { role: "Writer", icon: <PenTool size={32} strokeWidth={1.5} />, desc: "הוספת פוסטים", bg: "bg-slide-primary-light text-slide-primary", barWidth: "100%", recommended: true },
  ];

  return (
    <SlideLayout>
      <div className="flex flex-col h-full px-32 py-24">
        <Animated delay={0.1}>
          <div className="text-center mb-14">
            <SectionDivider color="bg-slide-blue" />
            <h1 className="text-6xl font-rubik font-black text-slide-dark mt-6 mb-4">הגדרת הרשאות</h1>
            <p className="text-2xl font-heebo text-slide-gray font-light">ב-Share בוחרים רמת הרשאה לתלמידים</p>
          </div>
        </Animated>

        <Stagger stagger={0.15} delay={0.3} className="flex-1 flex flex-col gap-8">
          {permissions.map((p, i) => (
            <StaggerItem key={i} type="slideRight">
              <div className={`bg-slide-card rounded-3xl p-10 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] flex items-center gap-10 ${p.recommended ? "ring-2 ring-slide-primary/20" : ""}`}>
                <div className={`w-20 h-20 rounded-2xl ${p.bg} flex items-center justify-center shrink-0`}>{p.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-3xl font-rubik font-bold text-slide-dark">{p.role}</h3>
                    {p.recommended && (
                      <span className="bg-slide-primary-light text-slide-primary px-5 py-1.5 rounded-full text-lg font-heebo font-medium flex items-center gap-2">
                        <Star size={16} strokeWidth={1.5} /> מומלץ
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-heebo text-slide-gray mb-4">{p.desc}</p>
                  <div className="w-full h-2.5 bg-slide-bg rounded-full overflow-hidden">
                    <div className="h-full bg-slide-primary/30 rounded-full" style={{ width: p.barWidth }} />
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Animated delay={0.8}>
          <div className="bg-slide-primary-light rounded-2xl px-8 py-5 mt-8 flex items-center gap-4">
            <Pin size={22} className="text-slide-primary" strokeWidth={1.5} />
            <p className="text-xl font-heebo text-slide-primary font-medium">בכיתה מומלץ לבחור Writer כדי שתלמידים יוכלו להוסיף תוכן</p>
          </div>
        </Animated>
      </div>
      <SlideNumber num={9} total={17} />
    </SlideLayout>
  );
}
