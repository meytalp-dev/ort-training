import { MonitorSmartphone } from "lucide-react";
import SlideLayout from "../SlideLayout";

const steps = [
  "היכנסו לאתר וצרו חשבון חינמי.",
  'במסך הראשי, לחצו על כפתור "צור פעילות חדשה".',
  'בחרו את סוג הפעילות הרצוי (למשל, "שאלה רבת-ברירה").',
  "התנסו בממשק וחקרו את האפשרויות.",
];

const SlideGettingStarted = () => (
  <SlideLayout>
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="slide-title">צעדים ראשונים: איך מתחילים?</h2>
        <ol className="mt-6 space-y-4">
          {steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="step-number">{i + 1}.</span>
              <span className="slide-body text-base mt-1">{s}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="slide-card-medium aspect-video flex items-center justify-center relative">
        <p className="text-muted-foreground text-sm">[אזור לצילום מסך של ממשק המשתמש]</p>
        <MonitorSmartphone
          size={64}
          strokeWidth={1}
          className="text-muted-foreground/30 absolute"
        />
      </div>
    </div>
  </SlideLayout>
);

export default SlideGettingStarted;
