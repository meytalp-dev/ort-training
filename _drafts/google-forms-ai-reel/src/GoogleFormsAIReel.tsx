import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { STYLE } from "./styles";
import { CategoryScene } from "./scenes/CategoryScene";
import { HookScene } from "./scenes/HookScene";
import { Feature1Scene } from "./scenes/Feature1Scene";
import { Feature2Scene } from "./scenes/Feature2Scene";
import { Feature3Scene } from "./scenes/Feature3Scene";
import { BenefitsScene } from "./scenes/BenefitsScene";
import { SummaryScene } from "./scenes/SummaryScene";
import { CTAScene } from "./scenes/CTAScene";

// 8 scenes: 90+120+150+150+150+300+105+105 = 1170 raw
// 7 crossfades x 10 = 70 overlap -> ~1100 frames
export const GoogleFormsAIReel: React.FC = () => {
  const crossfade = 10;

  return (
    <AbsoluteFill style={{ backgroundColor: STYLE.bg }}>
      <Audio src={staticFile("music.mp3")} volume={0.2} />

      <TransitionSeries>
        {/* 1. Category — Typing Reveal — 90 frames (3s) */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <CategoryScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* 2. Hook — Particle Converge — 120 frames (4s) */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <HookScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* 3. Feature 1 — Cursor Drag — 150 frames (5s) */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Feature1Scene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* 4. Feature 2 — Button Escape — 150 frames (5s) */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Feature2Scene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* 5. Feature 3 — Messy to Organized — 150 frames (5s) */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Feature3Scene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* 6. Benefits — Stack Build — 300 frames (10s) */}
        <TransitionSeries.Sequence durationInFrames={300}>
          <BenefitsScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* 7. Summary — Quote Card — 105 frames (3.5s) */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <SummaryScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* 8. CTA — Fullscreen Gradient — 105 frames (3.5s) */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <CTAScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Learni watermark */}
      <div style={{
        position: "absolute", top: 40, right: 40,
        fontFamily: STYLE.fontHeading, fontSize: 22,
        color: "rgba(26,21,48,0.15)", zIndex: 100, pointerEvents: "none",
      }}>
        Learni
      </div>
    </AbsoluteFill>
  );
};
