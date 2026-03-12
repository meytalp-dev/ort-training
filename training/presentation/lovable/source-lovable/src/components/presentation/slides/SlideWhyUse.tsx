import { Zap, Clock, BarChart3 } from "lucide-react";
import SlideLayout from "../SlideLayout";

const cards = [
  {
    icon: Zap,
    title: "הגברת מעורבות תלמידים",
    desc: "פעילויות אינטראקטיביות שמושכות את תשומת הלב ומעודדות השתתפות.",
  },
  {
    icon: Clock,
    title: "חיסכון בזמן הכנה",
    desc: "ממשק פשוט ותבניות מוכנות מאפשרים יצירת פעילות בדקות.",
  },
  {
    icon: BarChart3,
    title: "הערכה מעצבת בזמן אמת",
    desc: "קבלת תמונת מצב מיידית על הבנת התלמידים בכיתה.",
  },
];

const SlideWhyUse = () => (
  <SlideLayout>
    <h2 className="slide-title">למה כדאי לכם להשתמש בכלי?</h2>
    <div className="grid md:grid-cols-3 gap-6 mt-10">
      {cards.map((c) => (
        <div key={c.title} className="slide-card">
          <div className="icon-container mb-4">
            <c.icon size={24} strokeWidth={1.5} className="text-foreground" />
          </div>
          <h4 className="font-semibold text-lg text-foreground">{c.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
        </div>
      ))}
    </div>
  </SlideLayout>
);

export default SlideWhyUse;
