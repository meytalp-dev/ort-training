import { Lightbulb } from "lucide-react";
import SlideLayout from "../SlideLayout";

const mistakes = [
  { label: "עומס מידע", desc: "אל תנסו לדחוס יותר מדי תוכן לשקופית אחת." },
  { label: "שאלות מורכבות מדי", desc: "שמרו על שאלות קצרות וברורות לפעילות מהירה." },
  {
    label: "התעלמות מהתוצאות",
    desc: "השתמשו בתשובות התלמידים כדי לנהל דיון או להתאים את ההוראה.",
  },
  {
    label: "שימוש יתר",
    desc: "שלבו את הכלי בחוכמה, לא בכל דקה של השיעור.",
  },
];

const SlideMistakes = () => (
  <SlideLayout>
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="slide-title">טעויות נפוצות (ואיך להימנע מהן)</h2>
        <div className="mt-6 space-y-4">
          {mistakes.map((m) => (
            <div key={m.label} className="flex items-start gap-3">
              <span className="bullet-dot mt-2.5" />
              <p className="slide-body text-base">
                <strong className="text-foreground">{m.label}:</strong> {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center">
        <Lightbulb size={128} strokeWidth={1} className="text-accent" />
      </div>
    </div>
  </SlideLayout>
);

export default SlideMistakes;
