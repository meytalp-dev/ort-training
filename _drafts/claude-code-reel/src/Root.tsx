import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { ClaudeCodeReel } from "./ClaudeCodeReel";
import { HourglassReel } from "./HourglassReel";
import { GregStyleReel } from "./greg/GregStyleReel";
import { FlowReel } from "./flow/FlowReel";
import { ClaudeCodeReelV2 } from "./v2/ClaudeCodeReelV2";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* V2 — Greg style upgrade of the original products reel — ~43s = 1300 frames */}
      <Composition
        id="ClaudeCodeReelV2"
        component={ClaudeCodeReelV2}
        durationInFrames={1395}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* Total: 2+3.5+3+3+4*4+3.5+3+4 = 38 sec = 1140 frames */}
      <Composition
        id="ClaudeCodeReel"
        component={ClaudeCodeReel}
        durationInFrames={1140}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="HourglassReel"
        component={HourglassReel}
        durationInFrames={30 * 12} // 12 seconds at 30fps
        fps={30}
        width={1080}
        height={1920}
      />
      {/* Greg Isenberg style v9 — ~36.5 sec = 1100 frames */}
      <Composition
        id="GregStyleReel"
        component={GregStyleReel}
        durationInFrames={1100}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* Google Flow — dark cinematic style — ~34 sec = 1020 frames */}
      <Composition
        id="FlowReel"
        component={FlowReel}
        durationInFrames={1020}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
