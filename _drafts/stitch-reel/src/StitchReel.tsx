import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { STITCH } from "./styles";
import { CategoryScene } from "./scenes/CategoryScene";
import { HookScene } from "./scenes/HookScene";
import { Feature1Scene } from "./scenes/Feature1Scene";
import { Feature2Scene } from "./scenes/Feature2Scene";
import { Feature3Scene } from "./scenes/Feature3Scene";
import { BenefitsScene } from "./scenes/BenefitsScene";
import { SummaryScene } from "./scenes/SummaryScene";
import { CTAScene } from "./scenes/CTAScene";

// Category 4s + Hook 5s + F1 6s + F2 6s + F3 6s + Benefits 8s + Summary 4.5s + CTA 4.5s = 44s
// 7 crossfades x 10 frames = 70 overlap -> ~41.7s = 1250 frames
export const StitchReel: React.FC = () => {
  const crossfade = 10;

  return (
    <AbsoluteFill style={{ backgroundColor: STITCH.bg }}>
      <Audio src={staticFile("music.mp3")} volume={0.2} />

      <TransitionSeries>
        {/* Category -- 4 sec = 120 frames */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <CategoryScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Hook -- 5 sec = 150 frames -- Particle Converge */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <HookScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Feature 1 -- 6 sec = 180 frames -- Typewriter Build */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <Feature1Scene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Feature 2 -- 6 sec = 180 frames -- Morph Transform */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <Feature2Scene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Feature 3 -- 6 sec = 180 frames */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <Feature3Scene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Benefits -- 8 sec = 240 frames -- Orbit */}
        <TransitionSeries.Sequence durationInFrames={240}>
          <BenefitsScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Summary -- 4.5 sec = 135 frames -- Before/After Split */}
        <TransitionSeries.Sequence durationInFrames={135}>
          <SummaryScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* CTA -- 4.5 sec = 135 frames */}
        <TransitionSeries.Sequence durationInFrames={135}>
          <CTAScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Learni watermark */}
      <div style={{
        position: "absolute", top: 40, right: 40,
        fontFamily: STITCH.fontHeading, fontSize: 22,
        color: "rgba(26,37,56,0.15)", zIndex: 100, pointerEvents: "none",
      }}>
        Learni
      </div>
    </AbsoluteFill>
  );
};
