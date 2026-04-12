import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { POMELLI, pomelliBg } from "../styles";
import { Particles } from "../Particles";

// Feature 1 — Business DNA: define brand once
export const Feature1Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const floatY = Math.sin(frame / 14) * 5;

  // Card appears
  const cardScale = spring({ frame, fps, from: 0.6, to: 1, config: { damping: 8, mass: 0.5 } });
  const cardOpacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });

  // Badge
  const badgeScale = spring({ frame: Math.max(0, frame - 4), fps, from: 0, to: 1, config: { damping: 4, mass: 0.2, stiffness: 300 } });

  // Screenshot fades in with scale spring
  const screenshotStart = 10;
  const screenshotScale = spring({
    frame: Math.max(0, frame - screenshotStart), fps,
    from: 0.7, to: 1,
    config: { damping: 8, mass: 0.5 },
  });
  const screenshotOpacity = interpolate(frame, [screenshotStart, screenshotStart + 8], [0, 1], { extrapolateRight: "clamp" });

  // Title text
  const titleStart = 20;
  const titleOpacity = interpolate(frame, [titleStart, titleStart + 8], [0, 1], { extrapolateRight: "clamp" });
  const titleY = spring({ frame: Math.max(0, frame - titleStart), fps, from: 30, to: 0, config: { damping: 8 } });

  // Description text
  const descStart = 35;
  const descOpacity = interpolate(frame, [descStart, descStart + 8], [0, 1], { extrapolateRight: "clamp" });

  // Highlight text
  const hlStart = 55;
  const hlOpacity = interpolate(frame, [hlStart, hlStart + 8], [0, 1], { extrapolateRight: "clamp" });
  const hlScale = spring({ frame: Math.max(0, frame - hlStart), fps, from: 1.5, to: 1, config: { damping: 6, mass: 0.3 } });

  return (
    <AbsoluteFill style={pomelliBg}>
      <Particles />

      {/* Title above card */}
      <div style={{
        position: "absolute", top: 80, left: "50%",
        transform: `translate(-50%, ${titleY + floatY}px)`,
        opacity: titleOpacity, zIndex: 3,
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: POMELLI.fontHeading, fontSize: 56, fontWeight: 900,
          color: POMELLI.textDark,
        }}>
          מגדירים את המותג פעם אחת
        </div>
      </div>

      {/* Main glassmorphism card with screenshot */}
      <div style={{
        position: "absolute", top: "48%", left: "50%",
        transform: `translate(-50%, calc(-50% + ${floatY}px)) scale(${cardScale})`,
        opacity: cardOpacity, zIndex: 2,
        width: 920, height: 520,
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(20px)",
        borderRadius: POMELLI.cardRadius,
        boxShadow: `0 20px 60px ${POMELLI.accent}15, 0 0 1px rgba(255,255,255,0.5) inset`,
        border: "1px solid rgba(255,255,255,0.4)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 24,
        overflow: "visible",
      }}>
        {/* Badge 01 */}
        <div style={{
          position: "absolute", top: -20, right: 40,
          width: 64, height: 64, borderRadius: "50%",
          background: `linear-gradient(135deg, ${POMELLI.accent}, ${POMELLI.accentDark})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: `scale(${badgeScale})`,
          boxShadow: `0 8px 20px ${POMELLI.accent}40`,
        }}>
          <span style={{
            fontFamily: POMELLI.fontHeading, fontSize: 28, fontWeight: 900,
            color: POMELLI.textLight,
          }}>01</span>
        </div>

        {/* Screenshot of Business DNA */}
        <div style={{
          width: 840, height: 420,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: POMELLI.shadow,
          transform: `scale(${screenshotScale})`,
          opacity: screenshotOpacity,
        }}>
          <Img
            src={staticFile("screenshots/pomelli-bdna.png")}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      </div>

      {/* Description below card */}
      <div style={{
        position: "absolute", bottom: 180, left: "50%",
        transform: `translateX(-50%) translateY(${floatY}px)`,
        opacity: descOpacity, zIndex: 3,
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: POMELLI.fontBody, fontSize: 44, fontWeight: 500,
          color: POMELLI.textMuted,
        }}>
          לוגו, צבעים, סגנון — Pomelli לומד את המותג שלכם
        </div>
      </div>

      {/* Highlight */}
      <div style={{
        position: "absolute", bottom: 100, left: "50%",
        transform: `translateX(-50%) scale(${hlScale}) translateY(${floatY}px)`,
        opacity: hlOpacity, zIndex: 3,
      }}>
        <div style={{
          fontFamily: POMELLI.fontHeading, fontSize: 44, fontWeight: 700,
          color: POMELLI.accent,
        }}>
          כל תמונה עתידית — כבר בסגנון שלכם.
        </div>
      </div>
    </AbsoluteFill>
  );
};
