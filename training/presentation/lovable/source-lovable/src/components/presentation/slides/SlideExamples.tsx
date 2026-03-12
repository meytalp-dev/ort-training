import SlideLayout from "../SlideLayout";

const examples = [
  { subject: "היסטוריה", desc: "ציר זמן אינטראקטיבי של אירועים מרכזיים." },
  {
    subject: "ספרות",
    desc: 'סקר כיתתי על הדמות האהובה בסיפור ויצירת "ענן מילים" של תכונותיה.',
  },
  { subject: "מדעים", desc: "שאלון תמונות לזיהוי חלקי התא." },
  { subject: "מתמטיקה", desc: "תחרות כיתתית לפתרון מהיר של תרגילים." },
  { subject: "לשון", desc: "פעילות מיון מילים לפי שורש או בניין." },
];

const SlideExamples = () => (
  <SlideLayout>
    <h2 className="slide-title">דוגמאות ליישום במקצועות שונים</h2>
    <div className="mt-8 space-y-4">
      {examples.map((e) => (
        <div key={e.subject} className="flex items-start gap-3">
          <span className="bullet-dot mt-2.5" />
          <p className="slide-body text-base">
            <strong className="text-foreground">{e.subject}:</strong> {e.desc}
          </p>
        </div>
      ))}
    </div>
  </SlideLayout>
);

export default SlideExamples;
