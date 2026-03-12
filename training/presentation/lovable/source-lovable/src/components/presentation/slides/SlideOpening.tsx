import { Sparkles } from "lucide-react";
import SlideLayout from "../SlideLayout";

const SlideOpening = () => (
  <SlideLayout>
    <div className="flex flex-col items-center justify-center text-center h-full">
      <div className="icon-container mb-6">
        <Sparkles size={48} strokeWidth={1.5} className="text-foreground" />
      </div>
      <h1 className="text-6xl md:text-7xl font-bold text-foreground">lovable</h1>
      <p className="mt-4 text-2xl text-muted-foreground max-w-2xl">
        הופכים כל שיעור לחוויה אינטראקטיבית
      </p>
    </div>
  </SlideLayout>
);

export default SlideOpening;
