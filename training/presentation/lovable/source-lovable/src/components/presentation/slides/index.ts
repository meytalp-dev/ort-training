import { ComponentType } from "react";
import SlideOpening from "./SlideOpening";
import SlideWhatIs from "./SlideWhatIs";
import SlideWhyUse from "./SlideWhyUse";
import SlideFeatures from "./SlideFeatures";
import SlideGettingStarted from "./SlideGettingStarted";
import SlideFirstActivity from "./SlideFirstActivity";
import SlidePedagogy from "./SlidePedagogy";
import SlideExamples from "./SlideExamples";
import SlideActivityIdeas from "./SlideActivityIdeas";
import SlideTryIt from "./SlideTryIt";
import SlideMistakes from "./SlideMistakes";
import SlideTips from "./SlideTips";
import SlideLinks from "./SlideLinks";
import SlideCommunity from "./SlideCommunity";

interface SlideData {
  id: number;
  component: ComponentType;
}

export const slides: SlideData[] = [
  { id: 1, component: SlideOpening },
  { id: 2, component: SlideWhatIs },
  { id: 3, component: SlideWhyUse },
  { id: 4, component: SlideFeatures },
  { id: 5, component: SlideGettingStarted },
  { id: 6, component: SlideFirstActivity },
  { id: 7, component: SlidePedagogy },
  { id: 8, component: SlideExamples },
  { id: 9, component: SlideActivityIdeas },
  { id: 10, component: SlideTryIt },
  { id: 11, component: SlideMistakes },
  { id: 12, component: SlideTips },
  { id: 13, component: SlideLinks },
  { id: 14, component: SlideCommunity },
];
