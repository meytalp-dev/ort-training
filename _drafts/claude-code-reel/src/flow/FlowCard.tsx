import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FLOW } from "./styles";

interface FlowCardProps {
  children: React.ReactNode;
  width?: number;
  delay?: number;
  from?: "right" | "left" | "bottom" | "top" | "scale";
  neonColor?: string;
}

export const FlowCard: React.FC<FlowCardProps> = ({
  children,
  width = 920,
  delay = 0,
  from = "bottom",
  neonColor = FLOW.accent,
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

  // Neon border glow pulse
  const glowIntensity = 0.15 + Math.sin(frame / 10) * 0.05;

  return (
    <div style={{
      width,
      background: FLOW.card,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderRadius: FLOW.cardRadius,
      padding: FLOW.cardPadding,
      border: `1px solid ${FLOW.cardBorder}`,
      boxShadow: `${FLOW.shadow}, 0 0 40px ${neonColor}${Math.round(glowIntensity * 255).toString(16).padStart(2, '0')}`,
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
