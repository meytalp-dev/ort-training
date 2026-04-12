import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { GREG } from "../greg/styles";
import { V2IntroScene } from "./scenes/V2IntroScene";
import { V2HookScene } from "./scenes/V2HookScene";
import { V2WrongScene } from "./scenes/V2WrongScene";
import { V2RightScene } from "./scenes/V2RightScene";
import { V2ProductScene } from "./scenes/V2ProductScene";
import { V2NumbersScene } from "./scenes/V2NumbersScene";
import { V2QuoteScene } from "./scenes/V2QuoteScene";
import { V2CTAScene } from "./scenes/V2CTAScene";

// Timing (raw):
//   Intro 3s=90 + Hook 4s=120 + Wrong 3.5s=105 + Right 3.5s=105
//   + 4 Products 5s=150 each + Numbers 4.5s=135 + Quote 4s=120 + CTA 4s=120
//   = 90+120+105+105+600+135+120+120 = 1395 raw
// 9 crossfades × 10 frames = 90 overlap
// Net: ~1305 frames = ~43.5 sec

export const ClaudeCodeReelV2: React.FC = () => {
  const crossfade = 10;

  return (
    <AbsoluteFill style={{ backgroundColor: GREG.bg }}>
      <Audio src={staticFile("music.mp3")} volume={0.2} />

      <TransitionSeries>
        {/* Intro — energy pulse + Meytal photo — 3s */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <V2IntroScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Hook — "0 שורות קוד, 100+ כלים" — 4s */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <V2HookScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Wrong — terminal + X explosion — 3.5s */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <V2WrongScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Right — terminal + checkmark — 3.5s */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <V2RightScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Product 1: Games — cursor drags into card — 5s */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <V2ProductScene
            screenshot="screenshots/games.png"
            title="מחולל משחקים"
            subtitle="12 סוגי משחקים בלחיצה"
            variant={1}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Product 2: Wheel — card flip — 5s */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <V2ProductScene
            screenshot="screenshots/wheel.png"
            title="גלגל המזל"
            subtitle="פעילות פתיחה אינטראקטיבית"
            variant={2}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Product 3: Website — pills organize — 5s */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <V2ProductScene
            screenshot="screenshots/website.png"
            title="אתר הדרכות מלא"
            subtitle="בינה מלאכותית מעצימה מורים"
            variant={3}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Product 4: Design Studio — drop + spin — 5s */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <V2ProductScene
            screenshot="screenshots/design-studio.png"
            title="סטודיו עיצוב"
            subtitle="פלטות, פונטים, סגנונות"
            variant={4}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Numbers — BIG pills like Benefits — 4.5s */}
        <TransitionSeries.Sequence durationInFrames={135}>
          <V2NumbersScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* Quote — kinetic typography + sparkles — 4s */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <V2QuoteScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: crossfade })}
        />

        {/* CTA — flying icons + photo + glow — 4s */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <V2CTAScene />
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
