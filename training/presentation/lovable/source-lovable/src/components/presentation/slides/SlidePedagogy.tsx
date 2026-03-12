import { BrainCircuit, UsersRound, ClipboardCheck, Paintbrush } from "lucide-react";
import SlideLayout from "../SlideLayout";

const items = [
  {
    icon: BrainCircuit,
    title: "למידה פעילה",
    desc: "התלמידים לא רק צורכים מידע, אלא יוצרים, מגיבים ומשתתפים באופן פעיל.",
  },
  {
    icon: UsersRound,
    title: "למידה שיתופית",
    desc: "פעילויות כמו סיעור מוחות או לוח שיתופי המעודדות עבודת צוות.",
  },
  {
    icon: ClipboardCheck,
    title: "הערכה מעצבת",
    desc: "בדיקת הבנה מהירה במהלך השיעור והתאמת ההוראה בהתאם.",
  },
  {
    icon: Paintbrush,
    title: "יצירתיות והבעה",
    desc: "מתן במה לתלמידים להביע את עצמם בדרכים מגוונות.",
  },
];

const SlidePedagogy = () => (
  <SlideLayout>
    <h2 className="slide-title">שימושים פדגוגיים בכיתה</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {items.map((item) => (
        <div key={item.title} className="slide-card flex items-start gap-4">
          <item.icon
            size={32}
            className="text-primary flex-shrink-0 mt-1"
            strokeWidth={1.5}
          />
          <div>
            <h4 className="font-semibold text-lg text-foreground">{item.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </SlideLayout>
);

export default SlidePedagogy;
