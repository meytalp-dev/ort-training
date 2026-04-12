import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { STYLE } from "./styles";
import { CategoryScene } from "./scenes/CategoryScene";
import { HookScene } from "./scenes/HookScene";
import { BeforeAfterScene } from "./scenes/BeforeAfterScene";
import { StructureScene } from "./scenes/StructureScene";
import { RulesScene } from "./scenes/RulesScene";
import { CompositionScene } from "./scenes/CompositionScene";
import { OutputsScene } from "./scenes/OutputsScene";
import { NumberDropScene } from "./scenes/NumberDropScene";
import { SummaryScene } from "./scenes/SummaryScene";
import { CTAScene } from "./scenes/CTAScene";

// 10 scenes, ~49 seconds
// Raw: 120+160+150+200+170+180+165+120+120+135 = 1520
// 9 crossfades × 10 = 90 overlap
// Net: 1430 frames ≈ 47.7s
export const SkillsReel: React.FC = () => {
  const crossfade = 10;

  return (
    <AbsoluteFill style={{ backgroundColor: STYLE.bg }}>
      <Audio src={staticFile("music.mp3")} volume={0.18} />

      <TransitionSeries>
        {/* 1. Category — 4s = 120 frames */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <CategoryScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* 2. Hook — 5.3s = 160 frames */}
        <TransitionSeries.Sequence durationInFrames={160}>
          <HookScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* 3. Before/After — 5s = 150 frames (NEW) */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <BeforeAfterScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* 4. Structure — 6.7s = 200 frames */}
        <TransitionSeries.Sequence durationInFrames={200}>
          <StructureScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* 5. Rules — 5.7s = 170 frames */}
        <TransitionSeries.Sequence durationInFrames={170}>
          <RulesScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* 6. Composition — 6s = 180 frames */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <CompositionScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* 7. Real Outputs — 5.5s = 165 frames (NEW, replaces Benefits) */}
        <TransitionSeries.Sequence durationInFrames={165}>
          <OutputsScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* 8. Number Drop — 4s = 120 frames (NEW) */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <NumberDropScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* 9. Summary — 4s = 120 frames */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <SummaryScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* 10. CTA — 4.5s = 135 frames */}
        <TransitionSeries.Sequence durationInFrames={135}>
          <CTAScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Learni watermark */}
      <div style={{
        position: "absolute", top: 80, right: 50,
        fontFamily: STYLE.fontHeading, fontSize: 22,
        color: "rgba(42,31,26,0.1)", zIndex: 100, pointerEvents: "none",
      }}>
        Learni
      </div>
    </AbsoluteFill>
  );
};
