import { Home, Youtube, FolderKanban, BookUser, ArrowLeft } from "lucide-react";
import SlideLayout from "../SlideLayout";

const links = [
  { icon: Home, label: "אתר רשמי" },
  { icon: Youtube, label: "סרטוני הדרכה" },
  { icon: FolderKanban, label: "דוגמאות לפרויקטים" },
  { icon: BookUser, label: "חומרי עזר למורים" },
];

const SlideLinks = () => (
  <SlideLayout>
    <h2 className="slide-title">קישורים שימושיים</h2>
    <div className="grid md:grid-cols-2 gap-4 mt-8">
      {links.map((l) => (
        <a key={l.label} href="#" className="link-card">
          <l.icon size={20} className="text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
          <span className="font-medium text-foreground">{l.label}</span>
          <ArrowLeft size={18} className="mr-auto text-muted-foreground" />
        </a>
      ))}
    </div>
  </SlideLayout>
);

export default SlideLinks;
