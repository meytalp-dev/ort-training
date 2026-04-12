import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FLOW, flowBg } from "../styles";
import { FlowParticles } from "../FlowParticles";
import { FlowCard } from "../FlowCard";

// Hook — "Google opened a free video studio — works from Israel"
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card flips in
  const flipY = spring({
    frame, fps, from: 90, to: 0,
    config: { damping: 8, mass: 0.6 },
  });
  const cardOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  // Play icon floats above card
  const iconScale = spring({
    frame: Math.max(0, frame - 8), fps,
    from: 0, to: 1, config: { damping: 6, mass: 0.4 },
  });
  const iconFloat = Math.sin(frame / 8) * 8;

  // Text lines appear staggered
  const line1Start = 12;
  const line2Start = 22;
  const line3Start = 32;

  const lineOpacity = (start: number) =>
    interpolate(frame, [start, start + 6], [0, 1], { extrapolateRight: "clamp" });
  const lineY = (start: number) =>
    spring({ frame: Math.max(0, frame - start), fps, from: 25, to: 0, config: { damping: 10, mass: 0.5 } });

  return (
    <AbsoluteFill style={flowBg}>
      <FlowParticles />

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", zIndex: 2, gap: 30,
      }}>
        {/* Floating play icon */}
        <svg
          style={{
            width: 80, height: 80,
            transform: `scale(${iconScale}) translateY(${iconFloat}px)`,
            filter: `drop-shadow(0 0 20px ${FLOW.accent}60)`,
          }}
          viewBox="0 0 64 64"
        >
          <circle cx="32" cy="32" r="30" fill="none" stroke={FLOW.accent} strokeWidth="2" opacity="0.4" />
          <path d="M26 18 L48 32 L26 46 Z" fill={FLOW.accent} />
        </svg>

        {/* Main card */}
        <div style={{
          transform: `perspective(1200px) rotateY(${flipY}deg)`,
          opacity: cardOpacity,
          backfaceVisibility: "hidden",
        }}>
          <FlowCard width={940} neonColor={FLOW.accent}>
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 28, padding: "12px 0",
            }}>
              {/* Line 1 */}
              <div style={{
                fontFamily: FLOW.fontHeading, fontSize: 52, fontWeight: 800,
                color: FLOW.textLight, textAlign: "center",
                opacity: lineOpacity(line1Start),
                transform: `translateY(${lineY(line1Start)}px)`,
              }}>
                גוגל פתחו סטודיו סרטונים
              </div>

              {/* Line 2 — accented */}
              <div style={{
                fontFamily: FLOW.fontHeading, fontSize: 64, fontWeight: 900,
                color: FLOW.accent, textAlign: "center",
                opacity: lineOpacity(line2Start),
                transform: `translateY(${lineY(line2Start)}px)`,
                textShadow: `0 0 30px ${FLOW.accent}40`,
              }}>
                בחינם
              </div>

              {/* Line 3 */}
              <div style={{
                fontFamily: FLOW.fontBody, fontSize: 44, fontWeight: 400,
                color: FLOW.textMuted, textAlign: "center",
                opacity: lineOpacity(line3Start),
                transform: `translateY(${lineY(line3Start)}px)`,
              }}>
                גם מישראל
              </div>
            </div>
          </FlowCard>
        </div>
      </div>
    </AbsoluteFill>
  );
};
