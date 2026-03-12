import { LayoutTemplate } from "lucide-react";
import SlideLayout from "../SlideLayout";

const SlideWhatIs = () => (
  <SlideLayout>
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="slide-title">
          מה זה <span className="text-primary">lovable</span>?
        </h2>
        <p className="slide-body mt-4">
          lovable היא פלטפורמה דיגיטלית המאפשרת למורים ליצור פעילויות למידה
          אינטראקטיביות, משחקים ומצגות מרתקות בדקות ספורות, ללא צורך בידע טכני.
        </p>
        <p className="slide-body mt-4">
          המטרה: להפוך את הלמידה בכיתה לפעילה, שיתופית ומהנה יותר.
        </p>
      </div>
      <div className="slide-card-medium aspect-video flex items-center justify-center">
        <LayoutTemplate size={128} strokeWidth={1} className="text-secondary" />
      </div>
    </div>
  </SlideLayout>
);

export default SlideWhatIs;
