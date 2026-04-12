import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { SkillsReel } from "./SkillsReel";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="SkillsReel"
      component={SkillsReel}
      durationInFrames={1430}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
