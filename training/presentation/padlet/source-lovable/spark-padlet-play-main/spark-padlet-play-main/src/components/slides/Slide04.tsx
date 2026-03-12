import SlideLayout from "../presentation/SlideLayout";
import { SlideNumber, SectionDivider } from "./Infographics";
import { Animated, Stagger, StaggerItem } from "./SlideAnimations";
import { Globe, LogIn, KeyRound, CircleDot, Square, Mail, LayoutDashboard } from "lucide-react";

export default function Slide04() {
  return (
    <SlideLayout>
      <div className="flex h-full">
        <div className="flex-1 flex flex-col justify-center px-32 py-24">
          <Animated delay={0.1} type="slideRight">
            <SectionDivider color="bg-slide-blue" />
            <h1 className="text-6xl font-rubik font-black text-slide-dark mt-6 mb-4">כניסה למערכת</h1>
            <p className="text-2xl font-heebo text-slide-gray font-light mb-16">שלושה צעדים פשוטים להתחלה</p>
          </Animated>

          <Stagger stagger={0.12} delay={0.3} className="flex flex-col gap-10">
            {[
              { num: "01", title: "נכנסים לאתר", desc: "padlet.com", icon: <Globe size={22} strokeWidth={1.5} />, iconBg: "bg-slide-primary-light text-slide-primary" },
              { num: "02", title: 'לוחצים "Log in / Sign up"', icon: <LogIn size={22} strokeWidth={1.5} />, iconBg: "bg-slide-secondary-light text-slide-secondary" },
              { num: "03", title: "מתחברים באמצעות", icon: <KeyRound size={22} strokeWidth={1.5} />, iconBg: "bg-slide-blue-light text-slide-blue" },
            ].map((step, i) => (
              <StaggerItem key={i} type="slideRight">
                <div className="flex items-center gap-8">
                  <div className={`w-16 h-16 rounded-2xl ${step.iconBg} flex items-center justify-center shrink-0`}>
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-rubik font-bold text-slide-dark">{step.title}</h3>
                    {step.desc && <p className="text-xl text-slide-gray mt-1 font-heebo">{step.desc}</p>}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Stagger stagger={0.1} delay={0.7} className="flex gap-6 mt-12 mr-24">
            {[
              { icon: <CircleDot size={20} strokeWidth={1.5} />, label: "Google", bg: "bg-slide-blue-light text-slide-blue" },
              { icon: <Square size={20} strokeWidth={1.5} />, label: "Microsoft", bg: "bg-slide-purple-light text-slide-purple" },
              { icon: <Mail size={20} strokeWidth={1.5} />, label: "מייל", bg: "bg-slide-primary-light text-slide-primary" },
            ].map((m, i) => (
              <StaggerItem key={i} type="scaleIn">
                <div className={`${m.bg} rounded-2xl px-8 py-5 flex items-center gap-3 text-xl font-heebo font-medium`}>
                  {m.icon}
                  <span className="text-slide-dark">{m.label}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <Animated delay={0.4} type="slideLeft" className="w-[560px] flex items-center justify-center p-16">
          <div className="w-full bg-slide-card rounded-3xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="bg-slide-bg px-8 py-5 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-slide-secondary/30" />
                <div className="w-3.5 h-3.5 rounded-full bg-slide-accent/30" />
                <div className="w-3.5 h-3.5 rounded-full bg-slide-green/30" />
              </div>
              <div className="flex-1 bg-white rounded-xl px-5 py-2.5 text-lg font-heebo text-slide-gray/60 text-center">
                padlet.com
              </div>
            </div>
            <div className="p-14 flex flex-col items-center gap-8">
              <div className="w-20 h-20 rounded-2xl bg-slide-primary-light flex items-center justify-center text-slide-primary">
                <LayoutDashboard size={40} strokeWidth={1.5} />
              </div>
              <div className="text-3xl font-rubik font-bold text-slide-dark">Padlet</div>
              <div className="w-full max-w-[280px] h-14 bg-slide-primary rounded-2xl flex items-center justify-center text-xl font-heebo text-white font-medium">
                Sign Up – Free!
              </div>
              <div className="w-full max-w-[280px] h-14 border-2 border-slide-primary/20 rounded-2xl flex items-center justify-center text-xl font-heebo text-slide-primary font-medium">
                Log In
              </div>
            </div>
          </div>
        </Animated>
      </div>
      <SlideNumber num={4} total={17} />
    </SlideLayout>
  );
}
