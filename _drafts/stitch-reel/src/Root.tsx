import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { StitchReel } from "./StitchReel";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="StitchReel"
    component={StitchReel}
    durationInFrames={1250}
    fps={30}
    width={1080}
    height={1920}
  />
);
