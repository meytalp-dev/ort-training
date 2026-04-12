import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FLOW, flowBg } from "../styles";
import { FlowParticles } from "../FlowParticles";

// Why it's worth knowing — 3 big pills enter one by one
export const WhyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const benefits = [
    { text: "50 קרדיטים ביום", sub: "בלי מנוי, בלי תשלום", color: FLOW.accent, delay: 8 },
    { text: "עובד בעברית", sub: "Flow מתרגם מאחורי הקלעים", color: FLOW.blueLight, delay: 70 },
    { text: "סאונד אוטומטי", sub: "מוזיקה ודיאלוג מסונכרנים", color: FLOW.purple, delay: 132 },
  ];

  // Title
  const titleOpacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={flowBg}>
      <FlowParticles />

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", zIndex: 2, gap: 36,
      }}>
        {/* Title */}
        <div style={{
          fontFamily: FLOW.fontBody, fontSize: 44, fontWeight: 400,
          color: FLOW.textDim, opacity: titleOpacity,
        }}>
          למה שווה להכיר
        </div>

        {/* Benefit pills — enter BIG, read, shrink */}
        {benefits.map((b, i) => {
          const f = Math.max(0, frame - b.delay);

          // Enter big
          const enterScale = spring({
            frame: f, fps, from: 0, to: 1.3,
            config: { damping: 5, mass: 0.3, stiffness: 250 },
          });

          // After 1.5 sec, shrink to final size
          const settleStart = 45;
          const settleScale = f >= settleStart
            ? spring({ frame: f - settleStart, fps, from: 1.3, to: 0.92, config: { damping: 8, mass: 0.5 } })
            : enterScale;

          const finalScale = f >= settleStart ? settleScale : enterScale;

          const pillOpacity = interpolate(f, [0, 4], [0, 1], { extrapolateRight: "clamp" });

          // Glow
          const glow = 0.12 + Math.sin((frame + i * 20) / 8) * 0.06;

          return (
            <div key={i} style={{
              transform: `scale(${finalScale})`,
              opacity: pillOpacity,
              transformOrigin: "center",
            }}>
              <div style={{
                background: `rgba(255,255,255,0.05)`,
                backdropFilter: "blur(16px)",
                border: `1px solid ${b.color}30`,
                borderRadius: 28,
                padding: "32px 48px",
                boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 40px ${b.color}${Math.round(glow * 255).toString(16).padStart(2, '0')}`,
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 12, minWidth: 780,
              }}>
                <span style={{
                  fontFamily: FLOW.fontHeading, fontSize: 48, fontWeight: 800,
                  color: FLOW.textLight,
                }}>
                  {b.text}
                </span>
                <span style={{
                  fontFamily: FLOW.fontBody, fontSize: 34, fontWeight: 400,
                  color: b.color,
                }}>
                  {b.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
