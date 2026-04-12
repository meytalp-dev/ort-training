import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { FLOW } from "./styles";
import { PlayScene } from "./scenes/PlayScene";
import { HookScene } from "./scenes/HookScene";
import { ToolsScene } from "./scenes/ToolsScene";
import { ResultsScene } from "./scenes/ResultsScene";
import { WhyScene } from "./scenes/WhyScene";
import { SummaryScene } from "./scenes/SummaryScene";
import { CTAScene } from "./scenes/CTAScene";

// Play 3.5s + Hook 4s + Tools 5s + Results 6s + Why 10s + Summary 3.5s + CTA 4s = 36s
// 6 crossfades × 10 frames = 60 overlap → ~34s = 1020 frames
export const FlowReel: React.FC = () => {
  const crossfade = 10;

  return (
    <AbsoluteFill style={{ backgroundColor: FLOW.bg }}>
      <Audio src={staticFile("music.mp3")} volume={0.15} />

      <TransitionSeries>
        {/* Play — 3.5 sec = 105 frames */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <PlayScene />
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

        {/* Tools — 5 sec = 150 frames */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <ToolsScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Results — 6 sec = 180 frames — THE KEY SCENE */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <ResultsScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Why — 10 sec = 300 frames */}
        <TransitionSeries.Sequence durationInFrames={300}>
          <WhyScene />
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

        {/* CTA — 4 sec = 120 frames */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <CTAScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Learni watermark — top right */}
      <div style={{
        position: "absolute", top: 40, right: 40,
        fontFamily: FLOW.fontHeading, fontSize: 22,
        color: "rgba(255,255,255,0.1)", zIndex: 100, pointerEvents: "none",
        direction: "ltr",
      }}>
        Learni
      </div>
    </AbsoluteFill>
  );
};
