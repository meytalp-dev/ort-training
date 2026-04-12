import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { DifferentialQuizReel } from "./DifferentialQuizReel";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="DifferentialQuizReel"
    component={DifferentialQuizReel}
    durationInFrames={1100}
    fps={30}
    width={1080}
    height={1920}
  />
);
