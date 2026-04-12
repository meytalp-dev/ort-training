import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { POMELLI, pomelliBg } from "../styles";
import { Particles } from "../Particles";

// Summary — 3 things to know about Pomelli
export const SummaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const floatY = Math.sin(frame / 14) * 5;

  const items = [
    { text: "חינמי — עד 300 יצירות בחודש", delay: 0 },
    { text: "הממשק באנגלית, התוצרים לכל שוק", delay: 16 },
    { text: "חלק מ-Google Flow", delay: 32 },
  ];

  // Title
  const titleScale = spring({ frame, fps, from: 2, to: 1, config: { damping: 5, mass: 0.3, stiffness: 200 } });
  const titleOpacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={pomelliBg}>
      <Particles />

      {/* Title */}
      <div style={{
        position: "absolute", top: "22%", left: "50%",
        transform: `translate(-50%, -50%) scale(${titleScale}) translateY(${floatY}px)`,
        opacity: titleOpacity, zIndex: 3,
      }}>
        <div style={{
          fontFamily: POMELLI.fontHeading, fontSize: 52, fontWeight: 900,
          color: POMELLI.textDark, textAlign: "center",
        }}>
          3 דברים שכדאי לדעת
        </div>
      </div>

      {/* 3 items stacked */}
      {items.map((item, i) => {
        const f = Math.max(0, frame - 10 - item.delay);
        const itemScale = spring({ frame: f, fps, from: 0.5, to: 1, config: { damping: 7, mass: 0.4 } });
        const itemOpacity = interpolate(f, [0, 6], [0, 1], { extrapolateRight: "clamp" });
        const itemY = spring({ frame: f, fps, from: 40, to: 0, config: { damping: 8, mass: 0.5 } });

        return (
          <div key={i} style={{
            position: "absolute", top: `${36 + i * 16}%`, left: "50%",
            transform: `translate(-50%, ${itemY + floatY}px) scale(${itemScale})`,
            opacity: itemOpacity, zIndex: 3,
          }}>
            <div style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(16px)",
              borderRadius: 60, padding: "18px 48px",
              boxShadow: `0 8px 30px ${POMELLI.accent}15`,
              border: "1px solid rgba(255,255,255,0.5)",
              display: "flex", alignItems: "center", gap: 20,
            }}>
              {/* Number badge */}
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: `linear-gradient(135deg, ${POMELLI.accent}, ${POMELLI.accentDark})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                boxShadow: `0 4px 16px ${POMELLI.accent}40`,
              }}>
                <span style={{
                  fontFamily: POMELLI.fontHeading, fontSize: 26, fontWeight: 900,
                  color: POMELLI.textLight,
                }}>{i + 1}</span>
              </div>
              <span style={{
                fontFamily: POMELLI.fontBody, fontSize: 40, fontWeight: 700,
                color: POMELLI.textDark,
              }}>
                {item.text}
              </span>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
