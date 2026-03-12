import SlideLayout from "../presentation/SlideLayout";
import { SlideNumber, SectionDivider } from "./Infographics";
import { Animated, Stagger, StaggerItem } from "./SlideAnimations";
import { FileSpreadsheet, Image, Film, FileText, Palette } from "lucide-react";

export default function Slide12() {
  const fileTypes = [
    { icon: <FileSpreadsheet size={32} strokeWidth={1.5} />, label: "מצגת", ext: ".pptx", bg: "bg-slide-secondary-light text-slide-secondary" },
    { icon: <Image size={32} strokeWidth={1.5} />, label: "תמונה", ext: ".jpg", bg: "bg-slide-blue-light text-slide-blue" },
    { icon: <Film size={32} strokeWidth={1.5} />, label: "סרטון", ext: ".mp4", bg: "bg-slide-purple-light text-slide-purple" },
    { icon: <FileText size={32} strokeWidth={1.5} />, label: "קובץ", ext: ".pdf", bg: "bg-slide-green-light text-slide-green" },
  ];

  const galleryIcons = [
    { icon: <FileSpreadsheet size={28} strokeWidth={1.5} />, bg: "bg-slide-primary-light text-slide-primary" },
    { icon: <Image size={28} strokeWidth={1.5} />, bg: "bg-slide-secondary-light text-slide-secondary" },
    { icon: <Film size={28} strokeWidth={1.5} />, bg: "bg-slide-blue-light text-slide-blue" },
    { icon: <FileText size={28} strokeWidth={1.5} />, bg: "bg-slide-purple-light text-slide-purple" },
    { icon: <FileSpreadsheet size={28} strokeWidth={1.5} />, bg: "bg-slide-green-light text-slide-green" },
    { icon: <Palette size={28} strokeWidth={1.5} />, bg: "bg-slide-accent-light text-slide-accent" },
  ];

  return (
    <SlideLayout>
      <div className="flex flex-col h-full px-32 py-24">
        <Animated delay={0.1}>
          <div className="text-center mb-14">
            <SectionDivider color="bg-slide-secondary" />
            <h1 className="text-6xl font-rubik font-black text-slide-dark mt-6 mb-4">העלאת עבודות תלמידים</h1>
            <p className="text-2xl font-heebo text-slide-gray font-light">התלמידים יכולים להעלות מגוון קבצים</p>
          </div>
        </Animated>

        <Stagger stagger={0.1} delay={0.3} className="flex gap-8 mb-14">
          {fileTypes.map((f, i) => (
            <StaggerItem key={i} type="scaleIn" className="flex-1">
              <div className="bg-slide-card rounded-3xl p-10 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] flex flex-col items-center text-center gap-5">
                <div className={`w-[72px] h-[72px] rounded-2xl ${f.bg} flex items-center justify-center`}>{f.icon}</div>
                <h3 className="text-2xl font-rubik font-bold text-slide-dark">{f.label}</h3>
                <span className="text-lg font-heebo text-slide-gray bg-slide-bg px-4 py-1.5 rounded-full">{f.ext}</span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Animated delay={0.7}>
          <div className="flex-1 bg-slide-card rounded-3xl p-10 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)]">
            <p className="text-2xl font-rubik font-bold text-slide-dark mb-8 text-center flex items-center justify-center gap-2">
              <Palette size={24} strokeWidth={1.5} className="text-slide-primary" />
              גלריית עבודות כיתתית
            </p>
            <Stagger stagger={0.06} delay={0.8} className="grid grid-cols-6 gap-5">
              {galleryIcons.map((item, i) => (
                <StaggerItem key={i} type="scaleIn">
                  <div className={`${item.bg} aspect-square rounded-2xl flex flex-col items-center justify-center gap-2`}>
                    {item.icon}
                    <span className="text-sm font-heebo text-slide-gray">תלמיד/ה {i + 1}</span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Animated>
      </div>
      <SlideNumber num={12} total={17} />
    </SlideLayout>
  );
}
