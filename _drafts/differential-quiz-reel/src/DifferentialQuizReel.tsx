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

const CROSSFADE = 10;

// Category 3s + Hook 4s + Feature1 5s + Feature2 5s + Feature3 5s + Benefits 10s + Summary 3.5s + CTA 3.5s = 39s
// 7 crossfades x 10 frames = 70 overlap -> ~36.7s = 1100 frames
export const DifferentialQuizReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: STYLE.bg }}>
      <Audio src={staticFile("music.mp3")} volume={0.2} />

      {/* Learni watermark top-left */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 36,
          zIndex: 1000,
          fontFamily: STYLE.fontHandwriting,
          fontSize: 32,
          color: STYLE.lavender,
          opacity: 0.55,
          letterSpacing: 1,
          direction: "ltr",
          pointerEvents: "none",
        }}
      >
        Learni
      </div>

      <TransitionSeries>
        {/* 1. Category — Split Reveal "לפני vs אחרי" (90 frames / 3s) */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <CategoryScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: CROSSFADE })}
        />

        {/* 2. Hook — Slam "מי עוד מכינה מבחנים ב-Word?" (120 frames / 4s) */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <HookScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: CROSSFADE })}
        />

        {/* 3. Feature 1 — Before card flip (150 frames / 5s) */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Feature1Scene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: CROSSFADE })}
        />

        {/* 4. Feature 2 — After typewriter build (150 frames / 5s) */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Feature2Scene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: CROSSFADE })}
        />

        {/* 5. Feature 3 — Time morph transform (150 frames / 5s) */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Feature3Scene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: CROSSFADE })}
        />

        {/* 6. Benefits — Pill BIG to shrink (300 frames / 10s) */}
        <TransitionSeries.Sequence durationInFrames={300}>
          <BenefitsScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: CROSSFADE })}
        />

        {/* 7. Summary — Number slam "5 דקות" (105 frames / 3.5s) */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <SummaryScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: CROSSFADE })}
        />

        {/* 8. CTA — Photo + Learni (105 frames / 3.5s) */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <CTAScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
