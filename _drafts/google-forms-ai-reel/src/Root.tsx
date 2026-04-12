import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { GoogleFormsAIReel } from "./GoogleFormsAIReel";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GoogleFormsAIReel"
        component={GoogleFormsAIReel}
        durationInFrames={1100}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
