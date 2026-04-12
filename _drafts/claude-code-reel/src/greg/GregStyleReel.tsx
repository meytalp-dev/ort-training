import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { GREG } from "./styles";
import { CategoryScene } from "./scenes/CategoryScene";
import { HookScene } from "./scenes/HookScene";
import { AutoModeScene } from "./scenes/AutoModeScene";
import { AutoDreamScene } from "./scenes/AutoDreamScene";
import { ComputerUseScene } from "./scenes/ComputerUseScene";
import { BenefitsScene } from "./scenes/BenefitsScene";
import { SummaryScene } from "./scenes/SummaryScene";
import { CTAScene } from "./scenes/CTAScene";

// Category 3s + Hook 4s + Auto 5s + Dream 5s + Computer 5s + Benefits 10s + Summary 3.5s + CTA 3.5s = 39s
// 7 crossfades × 10 frames = 70 overlap → ~36.5s = 1100 frames
export const GregStyleReel: React.FC = () => {
  const crossfade = 10;

  return (
    <AbsoluteFill style={{ backgroundColor: GREG.bg }}>
      <Audio src={staticFile("music.mp3")} volume={0.2} />

      <TransitionSeries>
        {/* Category — 3 sec = 90 frames — "טיפ" typing */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <CategoryScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Hook — 4 sec = 120 frames */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <HookScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Auto Mode — 5 sec = 150 frames */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <AutoModeScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Auto Dream — 5 sec = 150 frames */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <AutoDreamScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Computer Use — 5 sec = 150 frames */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <ComputerUseScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Benefits — 10 sec = 300 frames */}
        <TransitionSeries.Sequence durationInFrames={300}>
          <BenefitsScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Summary — 3.5 sec = 105 frames */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <SummaryScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* CTA — 3.5 sec = 105 frames */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <CTAScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Learni watermark */}
      <div style={{
        position: "absolute", top: 40, right: 40,
        fontFamily: GREG.fontHeading, fontSize: 22,
        color: "rgba(42,31,26,0.15)", zIndex: 100, pointerEvents: "none",
      }}>
        Learni
      </div>
    </AbsoluteFill>
  );
};
