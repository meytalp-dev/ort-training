import { ReactNode } from "react";

interface IconCircleProps {
  icon: ReactNode;
  color?: string;
  size?: string;
}

export function IconCircle({ icon, color = "bg-slide-primary-light text-slide-primary", size = "w-16 h-16" }: IconCircleProps) {
  return (
    <div className={`${size} ${color} rounded-2xl flex items-center justify-center text-2xl`}>
      {icon}
    </div>
  );
}

export function SlideNumber({ num, total }: { num: number; total: number }) {
  return (
    <div className="absolute bottom-8 left-12 text-slide-gray/40 text-base font-heebo tracking-wide">
      {String(num).padStart(2, '0')} / {String(total).padStart(2, '0')}
    </div>
  );
}

export function SectionDivider({ color = "bg-slide-primary" }: { color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`${color} h-[3px] w-12 rounded-full`} />
      <div className={`${color} h-1.5 w-1.5 rounded-full`} />
    </div>
  );
}

export function SlideCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-slide-card rounded-3xl p-10 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] ${className}`}>
      {children}
    </div>
  );
}

interface StepCardProps {
  number: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  iconBg?: string;
}

export function StepCard({ number, title, description, icon, iconBg = "bg-slide-primary-light text-slide-primary" }: StepCardProps) {
  return (
    <div className="bg-slide-card rounded-3xl p-10 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] flex flex-col items-center text-center gap-5">
      <span className="text-slide-gray/40 text-lg font-heebo self-start">{number}</span>
      {icon && (
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${iconBg}`}>
          {icon}
        </div>
      )}
      <h3 className="text-2xl font-rubik font-bold text-slide-dark">{title}</h3>
      {description && <p className="text-xl font-heebo text-slide-gray leading-relaxed">{description}</p>}
    </div>
  );
}
