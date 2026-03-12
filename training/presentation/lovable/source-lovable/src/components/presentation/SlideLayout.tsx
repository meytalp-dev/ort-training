import { ReactNode } from "react";

interface SlideLayoutProps {
  children: ReactNode;
}

const SlideLayout = ({ children }: SlideLayoutProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-8 md:p-12 lg:p-16">
      <div className="w-full h-full max-w-6xl flex flex-col justify-center">
        {children}
      </div>
    </div>
  );
};

export default SlideLayout;
