import { Timer, RotateCw, Smartphone, Trophy } from "lucide-react";
import SlideLayout from "../SlideLayout";

const tips = [
  { icon: Timer, text: "התחילו עם פעילויות קצרות של 2-3 דקות כדי להכניס את הכלי לשגרת השיעור." },
  { icon: RotateCw, text: "אל תפחדו להשתמש באותה פעילות מספר פעמים עם תוכן שונה." },
  { icon: Smartphone, text: "אפשרו לתלמידים להשתמש במכשירים אישיים אם מתאפשר." },
  { icon: Trophy, text: "השתמשו באלמנטים של משחק (ניקוד, זמן) כדי להגביר מוטיבציה." },
];

const SlideTips = () => (
  <SlideLayout>
    <h2 className="slide-title">טיפים ושיטות עבודה מומלצות</h2>
    <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 mt-8">
      {tips.map((t) => (
        <div key={t.text} className="flex items-start gap-4">
          <t.icon size={24} className="text-primary mt-1 flex-shrink-0" strokeWidth={1.5} />
          <p className="slide-body text-base">{t.text}</p>
        </div>
      ))}
    </div>
  </SlideLayout>
);

export default SlideTips;
