import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { POMELLI, pomelliBg } from "../styles";
import { Particles } from "../Particles";

// Hook — Homepage screenshot slides up with glow ring
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const floatY = Math.sin(frame / 14) * 5;

  // Card slides up from bottom
  const cardY = spring({
    frame,
    fps,
    from: 600,
    to: 0,
    config: { damping: 10, mass: 0.7, stiffness: 120 },
  });
  const cardOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  // Glow ring expands behind card
  const glowScale = spring({
    frame: Math.max(0, frame - 6),
    fps,
    from: 0.5,
    to: 2,
    config: { damping: 14, mass: 1 },
  });
  const glowOpacity = interpolate(frame, [6, 14, 40], [0, 0.25, 0.1], { extrapolateRight: "clamp" });

  // Subtitle pill emerges below
  const subStart = 40;
  const subY = spring({
    frame: Math.max(0, frame - subStart),
    fps,
    from: 60,
    to: 0,
    config: { damping: 8, mass: 0.5 },
  });
  const subOpacity = interpolate(frame, [subStart, subStart + 8], [0, 1], { extrapolateRight: "clamp" });
  const subScale = spring({
    frame: Math.max(0, frame - subStart),
    fps,
    from: 0.5,
    to: 1,
    config: { damping: 7, mass: 0.4 },
  });

  // Impact flash
  const flashOpacity = interpolate(frame, [10, 13, 18], [0, 0.15, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={pomelliBg}>
      <Particles />

      {/* Flash */}
      <div style={{
        position: "absolute", inset: 0, background: POMELLI.accent,
        opacity: flashOpacity, zIndex: 1,
      }} />

      {/* Glow ring behind card */}
      <div style={{
        position: "absolute", top: "42%", left: "50%",
        transform: `translate(-50%, -50%) scale(${glowScale})`,
        width: 500, height: 500, borderRadius: "50%",
        background: `radial-gradient(circle, ${POMELLI.accent}35 0%, ${POMELLI.accentLight}10 40%, transparent 70%)`,
        opacity: glowOpacity, pointerEvents: "none", zIndex: 1,
      }} />

      {/* Main glassmorphism card with screenshot */}
      <div style={{
        position: "absolute", top: "42%", left: "50%",
        transform: `translate(-50%, calc(-50% + ${cardY + floatY}px))`,
        opacity: cardOpacity, zIndex: 2,
        width: 920, height: 560,
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(20px)",
        borderRadius: POMELLI.cardRadius,
        boxShadow: `0 20px 60px ${POMELLI.accent}20, 0 0 1px rgba(255,255,255,0.6) inset`,
        border: "1px solid rgba(255,255,255,0.5)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 24,
        overflow: "hidden",
      }}>
        {/* Screenshot of homepage */}
        <div style={{
          width: 860, height: 500,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: POMELLI.shadow,
        }}>
          <Img
            src={staticFile("screenshots/pomelli-homepage.png")}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      </div>

      {/* Subtitle pill */}
      <div style={{
        position: "absolute", top: "42%", left: "50%",
        transform: `translate(-50%, calc(-50% + ${310 + subY + floatY}px)) scale(${subScale})`,
        opacity: subOpacity, zIndex: 3,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${POMELLI.accent}, ${POMELLI.accentDark})`,
          borderRadius: 60, padding: "16px 48px",
          boxShadow: `0 8px 30px ${POMELLI.accent}40`,
        }}>
          <span style={{
            fontFamily: POMELLI.fontBody, fontSize: 40, fontWeight: 700,
            color: POMELLI.textLight,
          }}>
            צילום מוצרים + קמפיינים בקליק
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
