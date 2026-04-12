import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { PomelliReel } from "./PomelliReel";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="PomelliReel"
    component={PomelliReel}
    durationInFrames={980}
    fps={30}
    width={1080}
    height={1920}
  />
);
