import {
  MousePointerClick,
  FilePlus2,
  Users,
  Gamepad2,
  Share2,
  Presentation,
} from "lucide-react";
import SlideLayout from "../SlideLayout";

const features = [
  { icon: MousePointerClick, text: "יצירת שאלונים וסקרים אינטראקטיביים" },
  { icon: FilePlus2, text: "הוספת סרטונים, תמונות וקבצי אודיו" },
  { icon: Users, text: "פעילויות שיתופיות כמו לוח רעיונות" },
  { icon: Gamepad2, text: "תבניות משחק מוכנות (Gamification)" },
  { icon: Share2, text: "שיתוף קל באמצעות קישור או קוד QR" },
  { icon: Presentation, text: "בניית מצגות אינטראקטיביות" },
];

const SlideFeatures = () => (
  <SlideLayout>
    <h2 className="slide-title">יכולות מרכזיות</h2>
    <ul className="mt-8 grid md:grid-cols-2 gap-x-12 gap-y-5">
      {features.map((f) => (
        <li key={f.text} className="flex items-center gap-3">
          <f.icon size={22} strokeWidth={1.5} className="text-primary flex-shrink-0" />
          <span className="slide-body text-base">{f.text}</span>
        </li>
      ))}
    </ul>
  </SlideLayout>
);

export default SlideFeatures;
