import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GREG } from "./styles";

interface GregCardProps {
  children: React.ReactNode;
  width?: number;
  dark?: boolean;
  delay?: number;
  // Entry direction
  from?: "right" | "left" | "bottom" | "top" | "scale";
}

export const GregCard: React.FC<GregCardProps> = ({
  children,
  width = 920,
  dark = false,
  delay = 0,
  from = "bottom",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - delay);

  // Entry animation
  let translateX = 0;
  let translateY = 0;
  let scale = 1;

  if (from === "right") {
    translateX = spring({ frame: f, fps, from: 800, to: 0, config: { damping: 8, mass: 0.6 } });
  } else if (from === "left") {
    translateX = spring({ frame: f, fps, from: -800, to: 0, config: { damping: 8, mass: 0.6 } });
  } else if (from === "bottom") {
    translateY = spring({ frame: f, fps, from: 600, to: 0, config: { damping: 8, mass: 0.6 } });
  } else if (from === "top") {
    translateY = spring({ frame: f, fps, from: -600, to: 0, config: { damping: 8, mass: 0.6 } });
  } else if (from === "scale") {
    scale = spring({ frame: f, fps, from: 0.3, to: 1, config: { damping: 7, mass: 0.5 } });
  }

  const opacity = interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  // Subtle float
  const floatY = Math.sin(frame / 15) * 4;

  return (
    <div
      style={{
        width,
        background: dark ? GREG.cardDark : GREG.card,
        borderRadius: GREG.cardRadius,
        padding: GREG.cardPadding,
        boxShadow: dark ? GREG.shadowHeavy : GREG.shadow,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        transform: `translate(${translateX}px, ${translateY + floatY}px) scale(${scale})`,
        opacity,
      }}
    >
      {children}
    </div>
  );
};
