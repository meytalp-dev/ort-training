import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { GREG } from "./styles";

interface IconBubbleProps {
  children: React.ReactNode;
  bgColor?: string;
  size?: number;
  delay?: number;
}

export const IconBubble: React.FC<IconBubbleProps> = ({
  children,
  bgColor = GREG.bg,
  size = 140,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - delay);

  const scale = spring({
    frame: f,
    fps,
    from: 0,
    to: 1,
    config: { damping: 6, mass: 0.4, stiffness: 200 },
  });

  // Gentle pulse
  const pulse = 1 + Math.sin(frame / 10) * 0.03;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${scale * pulse})`,
        boxShadow: `0 8px 24px rgba(0,0,0,0.08)`,
      }}
    >
      {children}
    </div>
  );
};
