import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { STYLE } from "./styles";

interface GregCardProps {
  children: React.ReactNode;
  width?: number;
  dark?: boolean;
  delay?: number;
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
  const floatY = Math.sin(frame / 15) * 4;

  return (
    <div style={{
      width,
      background: dark
        ? STYLE.cardDark
        : "rgba(255,255,255,0.85)",
      backdropFilter: dark ? "none" : "blur(20px)",
      borderRadius: STYLE.cardRadius,
      padding: STYLE.cardPadding,
      boxShadow: dark ? STYLE.shadowHeavy : STYLE.shadow,
      border: dark ? "none" : "1px solid rgba(255,255,255,0.5)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 24,
      transform: `translate(${translateX}px, ${translateY + floatY}px) scale(${scale})`,
      opacity,
    }}>
      {children}
    </div>
  );
};
