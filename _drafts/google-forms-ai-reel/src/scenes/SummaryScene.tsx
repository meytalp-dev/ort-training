import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { STYLE, bgStyle } from "../styles";
import { Particles } from "../Particles";
import { playpenFamily } from "../fonts";

// Scene 7: Quote Card — elegant card with "3 צעדים. בוחן מוכן."
// in handwriting font, giant quotation marks fly in
export const SummaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card entrance
  const cardScale = spring({
    frame: Math.max(0, frame - 3),
    fps,
    from: 0.5,
    to: 1,
    config: { damping: 7, mass: 0.5 },
  });
  const cardOpacity = interpolate(frame, [3, 12], [0, 1], { extrapolateRight: "clamp" });

  // Left quotation mark flies in from left
  const quoteLeftX = spring({
    frame: Math.max(0, frame - 8),
    fps,
    from: -400,
    to: 0,
    config: { damping: 6, mass: 0.4, stiffness: 120 },
  });
  const quoteLeftOpacity = interpolate(frame, [8, 16], [0, 0.15], { extrapolateRight: "clamp" });

  // Right quotation mark flies in from right
  const quoteRightX = spring({
    frame: Math.max(0, frame - 12),
    fps,
    from: 400,
    to: 0,
    config: { damping: 6, mass: 0.4, stiffness: 120 },
  });
  const quoteRightOpacity = interpolate(frame, [12, 20], [0, 0.15], { extrapolateRight: "clamp" });

  // Text appears with scale
  const textStart = 18;
  const textScale = spring({
    frame: Math.max(0, frame - textStart),
    fps,
    from: 0.7,
    to: 1,
    config: { damping: 6, mass: 0.4 },
  });
  const textOpacity = interpolate(frame, [textStart, textStart + 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Underline draws
  const lineStart = textStart + 12;
  const lineWidth = spring({
    frame: Math.max(0, frame - lineStart),
    fps,
    from: 0,
    to: 500,
    config: { damping: 12, mass: 0.6 },
  });

  // Subtitle
  const subStart = textStart + 20;
  const subOpacity = interpolate(frame, [subStart, subStart + 8], [0, 1], {
    extrapolateRight: "clamp",
  });
  const subY = spring({
    frame: Math.max(0, frame - subStart),
    fps,
    from: 20,
    to: 0,
    config: { damping: 8, mass: 0.5 },
  });

  const floatY = Math.sin(frame / 15) * 4;

  // Glow pulse behind card
  const glowPulse = 0.08 + Math.sin(frame / 8) * 0.03;

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      {/* Glow behind card */}
      <div
        style={{
          position: "absolute",
          top: "45%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${STYLE.accent} 0%, transparent 70%)`,
          opacity: glowPulse,
          filter: "blur(60px)",
          zIndex: 1,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          zIndex: 2,
          transform: `translateY(${floatY}px)`,
          position: "relative",
        }}
      >
        {/* Card */}
        <div
          style={{
            width: 920,
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(20px)",
            borderRadius: STYLE.cardRadius,
            padding: "64px 56px",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: STYLE.shadowHeavy,
            transform: `scale(${cardScale})`,
            opacity: cardOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Giant quotation mark — left */}
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 40,
              transform: `translateX(${quoteLeftX}px)`,
              opacity: quoteLeftOpacity,
              fontFamily: "Georgia, serif",
              fontSize: 280,
              fontWeight: 700,
              color: STYLE.accent,
              lineHeight: 0.8,
              pointerEvents: "none",
            }}
          >
            &ldquo;
          </div>

          {/* Giant quotation mark — right */}
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 40,
              transform: `translateX(${quoteRightX}px)`,
              opacity: quoteRightOpacity,
              fontFamily: "Georgia, serif",
              fontSize: 280,
              fontWeight: 700,
              color: STYLE.accent,
              lineHeight: 0.8,
              pointerEvents: "none",
            }}
          >
            &rdquo;
          </div>

          {/* Main quote text */}
          <div
            style={{
              opacity: textOpacity,
              transform: `scale(${textScale})`,
              textAlign: "center",
              zIndex: 2,
            }}
          >
            <span
              style={{
                fontFamily: playpenFamily,
                fontSize: 80,
                fontWeight: 400,
                color: STYLE.textDark,
                lineHeight: 1.4,
              }}
            >
              3 צעדים.
            </span>
            <br />
            <span
              style={{
                fontFamily: playpenFamily,
                fontSize: 80,
                fontWeight: 400,
                color: STYLE.accent,
              }}
            >
              בוחן מוכן.
            </span>
          </div>

          {/* Decorative underline */}
          <div
            style={{
              width: lineWidth,
              height: 4,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${STYLE.accent}, ${STYLE.greenLight})`,
              zIndex: 2,
            }}
          />

          {/* Subtitle */}
          <div
            style={{
              opacity: subOpacity,
              transform: `translateY(${subY}px)`,
              textAlign: "center",
              zIndex: 2,
            }}
          >
            <span
              style={{
                fontFamily: STYLE.fontBody,
                fontSize: 38,
                fontWeight: 600,
                color: STYLE.textMuted,
              }}
            >
              Google Forms + AI = יעילות
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
