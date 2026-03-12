import SlideLayout from "../SlideLayout";

const steps = [
  {
    num: "1",
    title: "בחירת תבנית",
    desc: 'לחצו על "צור חדש" ובחרו בתבנית "ענן מילים".',
  },
  {
    num: "2",
    title: "הזנת שאלה",
    desc: 'כתבו את השאלה המרכזית, למשל: "מהי המילה הראשונה שעולה לכם בראש כשאתם חושבים על...?"',
  },
  {
    num: "3",
    title: "שיתוף והפעלה",
    desc: 'לחצו "הפעל", שתפו את הקישור עם התלמידים וצפו בתשובות בזמן אמת.',
  },
];

const SlideFirstActivity = () => (
  <SlideLayout>
    <h2 className="slide-title">יצירת הפעילות הראשונה שלכם</h2>
    <p className="slide-subtitle mt-2">מדריך מהיר: בניית סקר פתיחת שיעור</p>
    <div className="mt-6 grid md:grid-cols-3 gap-6">
      {steps.map((s) => (
        <div key={s.num} className="slide-card">
          <span className="step-number">{s.num}</span>
          <h4 className="font-semibold text-lg text-foreground mt-2">{s.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
        </div>
      ))}
    </div>
  </SlideLayout>
);

export default SlideFirstActivity;
