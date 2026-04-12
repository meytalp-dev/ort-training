import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FLOW, flowBg } from "../styles";
import { FlowParticles } from "../FlowParticles";

// Summary — "Free. From Israel. Hebrew." + play triangle returns
export const SummaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = [
    { text: "חינם", delay: 0, color: FLOW.accent },
    { text: "מישראל", delay: 12, color: FLOW.blueLight },
    { text: "בעברית", delay: 24, color: FLOW.purple },
  ];

  // Play triangle returns at end
  const triStart = 50;
  const triScale = spring({
    frame: Math.max(0, frame - triStart), fps,
    from: 0, to: 1, config: { damping: 6, mass: 0.3 },
  });
  const triPulse = 1 + Math.sin((frame - triStart) / 5) * 0.08;
  const triOpacity = interpolate(frame, [triStart, triStart + 6], [0, 0.3], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={flowBg}>
      <FlowParticles />

      {/* Background play triangle — large, faded */}
      <svg
        style={{
          position: "absolute", top: "50%", left: "50%",
          transform: `translate(-50%, -50%) scale(${triScale * triPulse * 8})`,
          opacity: triOpacity,
          filter: `drop-shadow(0 0 40px ${FLOW.accent}30)`,
          zIndex: 1,
        }}
        viewBox="0 0 64 64"
      >
        <path d="M24 16 L48 32 L24 48 Z" fill={FLOW.accent} />
      </svg>

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", zIndex: 2, gap: 50,
      }}>
        {/* Words slam in one by one */}
        {words.map((w, i) => {
          const f = Math.max(0, frame - w.delay);
          const scale = spring({
            frame: f, fps, from: 3, to: 1,
            config: { damping: 5, mass: 0.3, stiffness: 200 },
          });
          const opacity = interpolate(f, [0, 3], [0, 1], { extrapolateRight: "clamp" });

          // Impact flash
          const flashOp = interpolate(f, [0, 2, 6], [0, 0.2, 0], { extrapolateRight: "clamp" });

          return (
            <div key={i} style={{ position: "relative" }}>
              {/* Flash */}
              <div style={{
                position: "absolute", inset: -40,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${w.color}40, transparent 70%)`,
                opacity: flashOp,
              }} />

              <div style={{
                fontFamily: FLOW.fontHeading, fontSize: 88, fontWeight: 900,
                color: w.color,
                transform: `scale(${scale})`,
                opacity,
                textShadow: `0 0 40px ${w.color}50, 0 4px 20px rgba(0,0,0,0.5)`,
                letterSpacing: 4,
              }}>
                {w.text}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
