import { ReactNode } from "react";
import ScaledSlide from "./ScaledSlide";

interface SlideLayoutProps {
  children: ReactNode;
  bg?: string;
  className?: string;
}

export default function SlideLayout({ children, bg = "bg-slide-bg", className = "" }: SlideLayoutProps) {
  return (
    <ScaledSlide>
      <div className={`w-full h-full ${bg} ${className} overflow-hidden`} dir="rtl">
        {children}
      </div>
    </ScaledSlide>
  );
}
