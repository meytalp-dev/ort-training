import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { POMELLI } from "./styles";
import { CategoryScene } from "./scenes/CategoryScene";
import { HookScene } from "./scenes/HookScene";
import { Feature1Scene } from "./scenes/Feature1Scene";
import { Feature2Scene } from "./scenes/Feature2Scene";
import { Feature3Scene } from "./scenes/Feature3Scene";
import { BenefitsScene } from "./scenes/BenefitsScene";
import { SummaryScene } from "./scenes/SummaryScene";
import { CTAScene } from "./scenes/CTAScene";

// Category 3s + Hook 4s + F1 5s + F2 5s + F3 5s + Benefits 6s + Summary 3.5s + CTA 3.5s = 35s
// 7 crossfades x 10 frames = 70 overlap -> ~32.7s = 980 frames
export const PomelliReel: React.FC = () => {
  const crossfade = 10;

  return (
    <AbsoluteFill style={{ backgroundColor: POMELLI.bg }}>
      <Audio src={staticFile("music.mp3")} volume={0.2} />

      <TransitionSeries>
        {/* Category — 3 sec = 90 frames — Photo Zoom */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <CategoryScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Hook — 4 sec = 120 frames — Slide Up + Glow */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <HookScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Feature 1 — 5 sec = 150 frames — Cursor Drag */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Feature1Scene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Feature 2 — 5 sec = 150 frames — Button Escape */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Feature2Scene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Feature 3 — 5 sec = 150 frames — Messy->Organized */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Feature3Scene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Benefits — 6 sec = 180 frames — Stack Build */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <BenefitsScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Summary — 3.5 sec = 105 frames — Quote Card */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <SummaryScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* CTA — 3.5 sec = 105 frames — Card with Photo */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <CTAScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Learni watermark — persistent top-right */}
      <div style={{
        position: "absolute", top: 40, right: 40,
        fontFamily: POMELLI.fontHeading, fontSize: 22,
        color: "rgba(42,26,34,0.15)", zIndex: 100, pointerEvents: "none",
      }}>
        Learni
      </div>
    </AbsoluteFill>
  );
};
