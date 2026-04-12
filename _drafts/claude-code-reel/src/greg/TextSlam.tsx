import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GREG } from "./styles";

interface TextSlamProps {
  text: string;
  fontSize?: number;
  color?: string;
  delay?: number;
  bold?: boolean;
}

export const TextSlam: React.FC<TextSlamProps> = ({
  text,
  fontSize = 64,
  color = GREG.textDark,
  delay = 0,
  bold = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - delay);

  const scale = spring({
    frame: f,
    fps,
    from: 2.5,
    to: 1,
    config: { damping: 6, mass: 0.4, stiffness: 180 },
  });

  const opacity = interpolate(f, [0, 4], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        fontFamily: GREG.fontHeading,
        fontSize,
        fontWeight: bold ? 800 : 500,
        color,
        textAlign: "center",
        transform: `scale(${scale})`,
        opacity,
        lineHeight: 1.3,
      }}
    >
      {text}
    </div>
  );
};
