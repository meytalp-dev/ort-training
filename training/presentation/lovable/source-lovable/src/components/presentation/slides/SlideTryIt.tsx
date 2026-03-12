import { Target } from "lucide-react";
import SlideLayout from "../SlideLayout";

const SlideTryIt = () => (
  <SlideLayout>
    <div className="text-center flex flex-col items-center justify-center h-full">
      <div className="icon-container mb-6">
        <Target size={48} strokeWidth={1.5} className="text-foreground" />
      </div>
      <h2 className="slide-title">נסו בעצמכם: אתגר 5 הדקות</h2>
      <p className="slide-body mt-4 mx-auto text-center max-w-2xl">
        היכנסו עכשיו ל-lovable וצרו פעילות מסוג "שאלה רבת-ברירה" בנושא השיעור
        הבא שלכם. שתפו אותה בקבוצת הווטסאפ שלנו!
      </p>
    </div>
  </SlideLayout>
);

export default SlideTryIt;
