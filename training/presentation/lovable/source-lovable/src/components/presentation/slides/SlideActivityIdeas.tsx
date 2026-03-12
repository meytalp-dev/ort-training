import SlideLayout from "../SlideLayout";

const ideas = [
  { label: "פתיחת שיעור", desc: '"מה אתם כבר יודעים על...?" – שאלה פתוחה.' },
  { label: "בדיקת הבנה", desc: "שאלת נכון/לא נכון מהירה באמצע ההסבר." },
  { label: "סיכום שיעור", desc: "בקשו מהתלמידים לכתוב 3 דברים חדשים שלמדו היום." },
  { label: "דיבייט", desc: "הציגו היגד ובקשו מהתלמידים להצביע בעד/נגד." },
];

const SlideActivityIdeas = () => (
  <SlideLayout>
    <h2 className="slide-title">רעיונות לפעילויות מהירות</h2>
    <div className="mt-8 space-y-5">
      {ideas.map((idea) => (
        <div key={idea.label} className="flex items-start gap-3">
          <span className="bullet-dot mt-2.5" />
          <p className="slide-body text-base">
            <strong className="text-foreground">{idea.label}:</strong> {idea.desc}
          </p>
        </div>
      ))}
    </div>
  </SlideLayout>
);

export default SlideActivityIdeas;
