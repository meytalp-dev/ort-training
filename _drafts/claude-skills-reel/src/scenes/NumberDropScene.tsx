import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { STYLE, bgStyle } from "../styles";
import { Particles } from "../Particles";

// Number counter: 0 → 1,234 lines → "פקודה אחת בשבילכם"
export const NumberDropScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Counter rapidly scrolls from 0 to 1234
  const counterEnd = 50;
  const rawCount = interpolate(frame, [5, counterEnd], [0, 1234], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Accelerate then decelerate (ease-out)
  const eased = Math.round(rawCount);

  // Format with comma
  const formatted = eased.toLocaleString();

  // "שורות קוד" label
  const labelOpacity = interpolate(frame, [counterEnd - 5, counterEnd + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Divider line
  const lineWidth = spring({ frame: Math.max(0, frame - counterEnd - 5), fps, from: 0, to: 800, config: { damping: 10, mass: 0.6 } });
  const lineOpacity = interpolate(frame, [counterEnd + 5, counterEnd + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // "פקודה אחת בשבילכם" appears
  const tagDelay = counterEnd + 15;
  const tagScale = spring({ frame: Math.max(0, frame - tagDelay), fps, from: 2, to: 1, config: { damping: 5, mass: 0.3, stiffness: 200 } });
  const tagOpacity = interpolate(frame, [tagDelay, tagDelay + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Flash on slam
  const flashOpacity = interpolate(frame, [tagDelay, tagDelay + 2, tagDelay + 8], [0, 0.2, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Counter color shifts as number grows
  const counterColor = frame < counterEnd
    ? STYLE.textDark
    : STYLE.accent;

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      {/* Flash */}
      <div style={{
        position: "absolute", inset: 0,
        background: STYLE.accent,
        opacity: flashOpacity,
        pointerEvents: "none", zIndex: 20,
      }} />

      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 20, zIndex: 10,
      }}>
        {/* Big counter */}
        <div style={{
          fontFamily: STYLE.fontMono, fontSize: 140, fontWeight: 900,
          color: counterColor,
          lineHeight: 1,
          letterSpacing: -4,
          textShadow: frame >= counterEnd ? `0 0 40px ${STYLE.accent}30` : "none",
        }}>
          {formatted}
        </div>

        {/* "שורות קוד בסקיל create-reels" */}
        <div style={{
          fontFamily: STYLE.fontBody, fontSize: 32, fontWeight: 500,
          color: STYLE.textMuted,
          opacity: labelOpacity,
          direction: "rtl",
        }}>
          שורות קוד בסקיל <span style={{ fontFamily: STYLE.fontMono, color: STYLE.accent }}>create-reels</span>
        </div>

        {/* Divider */}
        <div style={{
          width: lineWidth, height: 2,
          background: `linear-gradient(90deg, transparent, ${STYLE.accent}40, transparent)`,
          opacity: lineOpacity,
          marginTop: 10, marginBottom: 10,
        }} />

        {/* "פקודה אחת בשבילכם" */}
        <div style={{
          fontFamily: STYLE.fontHeading, fontSize: 56, fontWeight: 800,
          color: STYLE.accent,
          transform: `scale(${tagScale})`,
          opacity: tagOpacity,
          textShadow: `0 0 40px ${STYLE.accent}25`,
          direction: "rtl",
        }}>
          הכל מפקודה אחת.
        </div>
      </div>
    </AbsoluteFill>
  );
};
