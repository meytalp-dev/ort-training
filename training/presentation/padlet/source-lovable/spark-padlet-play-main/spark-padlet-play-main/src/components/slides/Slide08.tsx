import SlideLayout from "../presentation/SlideLayout";
import { SlideNumber, SectionDivider } from "./Infographics";
import { Animated, Stagger, StaggerItem } from "./SlideAnimations";
import { Share2, ClipboardCopy, Send, GraduationCap, MessageSquare, QrCode } from "lucide-react";

export default function Slide08() {
  return (
    <SlideLayout>
      <div className="flex flex-col h-full px-32 py-24">
        <Animated delay={0.1}>
          <div className="text-center mb-14">
            <SectionDivider color="bg-slide-secondary" />
            <h1 className="text-6xl font-rubik font-black text-slide-dark mt-6 mb-4">שיתוף עם תלמידים</h1>
            <p className="text-2xl font-heebo text-slide-gray font-light">שלושה צעדים לשיתוף הלוח</p>
          </div>
        </Animated>

        <Stagger stagger={0.12} delay={0.3} className="flex gap-8 mb-14">
          {[
            { num: "01", text: 'לוחצים "Share"', icon: <Share2 size={24} strokeWidth={1.5} />, bg: "bg-slide-primary-light text-slide-primary" },
            { num: "02", text: 'בוחרים "Copy link"', icon: <ClipboardCopy size={24} strokeWidth={1.5} />, bg: "bg-slide-secondary-light text-slide-secondary" },
            { num: "03", text: "שולחים לתלמידים", icon: <Send size={24} strokeWidth={1.5} />, bg: "bg-slide-blue-light text-slide-blue" },
          ].map((step, i) => (
            <StaggerItem key={i} type="scaleIn" className="flex-1">
              <div className="bg-slide-card rounded-3xl p-10 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] flex flex-col items-center text-center gap-5">
                <span className="text-slide-gray/40 text-lg font-heebo self-start">{step.num}</span>
                <div className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center`}>{step.icon}</div>
                <h3 className="text-2xl font-rubik font-bold text-slide-dark">{step.text}</h3>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Animated delay={0.6} type="fadeIn">
          <p className="text-xl font-heebo text-slide-gray mb-8">שולחים דרך:</p>
        </Animated>

        <Stagger stagger={0.12} delay={0.7} className="flex gap-8 flex-1">
          {[
            { icon: <GraduationCap size={26} strokeWidth={1.5} />, label: "Google Classroom", desc: "שיתוף ישיר לכיתה", bg: "bg-slide-green-light text-slide-green" },
            { icon: <MessageSquare size={26} strokeWidth={1.5} />, label: "וואטסאפ", desc: "שליחה מהירה לקבוצה", bg: "bg-slide-primary-light text-slide-primary" },
            { icon: <QrCode size={26} strokeWidth={1.5} />, label: "QR Code", desc: "סריקה עם הנייד", bg: "bg-slide-blue-light text-slide-blue" },
          ].map((opt, i) => (
            <StaggerItem key={i} className="flex-1">
              <div className="bg-slide-card rounded-3xl p-10 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] flex flex-col items-center text-center gap-5 h-full">
                <div className={`w-16 h-16 rounded-2xl ${opt.bg} flex items-center justify-center`}>{opt.icon}</div>
                <h3 className="text-2xl font-rubik font-bold text-slide-dark">{opt.label}</h3>
                <p className="text-xl font-heebo text-slide-gray">{opt.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
      <SlideNumber num={8} total={17} />
    </SlideLayout>
  );
}
