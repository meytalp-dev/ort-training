import SlideLayout from "../presentation/SlideLayout";
import { SlideNumber, SectionDivider, StepCard } from "./Infographics";
import { Animated, Stagger, StaggerItem } from "./SlideAnimations";
import { Globe, Mail, Lock, ArrowRight } from "lucide-react";

export default function Slide03() {
  const steps = [
    { number: "01", title: "כניסה לאתר", description: "padlet.com פותחים את", icon: <Globe size={36} strokeWidth={1.5} />, iconBg: "bg-slide-primary-light text-slide-primary" },
    { number: "02", title: "הרשמה / התחברות", description: "כתובת אימייל עם סיסמה או Google", icon: <Mail size={36} strokeWidth={1.5} />, iconBg: "bg-slide-secondary-light text-slide-secondary" },
    { number: "03", title: "אישור חשבון", description: "לחצו על הקישור במייל", icon: <Lock size={36} strokeWidth={1.5} />, iconBg: "bg-slide-blue-light text-slide-blue" },
  ];

  return (
    <SlideLayout>
      <div className="flex flex-col h-full px-24 py-20">
        <Animated delay={0.1}>
          <div className="text-center mb-12">
            <SectionDivider />
            <h1 className="text-5xl font-rubik font-black text-slide-dark mt-6 mb-4">
              איך <span className="text-slide-primary">נכנסים</span> ל-Padlet?
            </h1>
            <p className="text-2xl font-heebo text-slide-gray font-light">שלושה שלבים פשוטים להתחיל</p>
          </div>
        </Animated>

        <div className="flex-1 flex items-center">
          <Stagger stagger={0.15} delay={0.3} className="grid grid-cols-3 gap-8 w-full">
            {steps.map((step, i) => (
              <StaggerItem key={i} type="scaleIn" className="relative">
                <StepCard number={step.number} title={step.title} description={step.description} icon={step.icon} iconBg={step.iconBg} />
                {i < 2 && (
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:flex">
                    <div className="w-12 h-12 rounded-full bg-slide-primary/10 flex items-center justify-center">
                      <ArrowRight size={24} className="text-slide-primary rotate-180" strokeWidth={1.5} />
                    </div>
                  </div>
                )}
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <Animated delay={0.7}>
          <div className="bg-gradient-to-r from-slide-primary-light to-slide-secondary-light rounded-2xl px-12 py-6 mt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-slide-primary shadow-sm">
                  <Globe size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-lg font-rubik font-bold text-slide-dark">padlet.com</p>
                  <p className="text-base font-heebo text-slide-gray">כתובת האתר הרשמית</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-lg font-heebo text-slide-dark">חשבון בסיסי הוא <span className="font-bold text-slide-primary">חינם</span></p>
              </div>
            </div>
          </div>
        </Animated>
      </div>
      <SlideNumber num={3} total={17} />
    </SlideLayout>
  );
}
