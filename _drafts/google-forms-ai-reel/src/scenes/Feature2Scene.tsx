import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { STYLE, bgStyle } from "../styles";
import { Particles } from "../Particles";
import { AIIcon } from "../Icons";

// Scene 4: Button Escape — "AI" button on card shakes, escapes upward,
// explodes into particles, new card appears with 3D rotation.
// Text: "מבקשים מ-AI לכתוב שאלות לפי נושא ורמה"
export const Feature2Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Badge "02"
  const badgeScale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 5, mass: 0.3, stiffness: 250 },
  });

  // Phase 1: Initial card with "AI" button (frames 0-35)
  const initialCardOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const initialCardScale = spring({
    frame: Math.max(0, frame - 3),
    fps,
    from: 0.8,
    to: 1,
    config: { damping: 8, mass: 0.5 },
  });

  // Button shaking (frames 15-35)
  const shakePhase = frame >= 15 && frame < 40;
  const buttonShakeX = shakePhase
    ? Math.sin(frame * 8) * interpolate(frame, [15, 25, 35], [1, 6, 8], { extrapolateRight: "clamp" })
    : 0;
  const buttonShakeY = shakePhase
    ? Math.cos(frame * 6) * interpolate(frame, [15, 25, 35], [0.5, 3, 4], { extrapolateRight: "clamp" })
    : 0;

  // Phase 2: Button escapes upward (frames 38-50)
  const escapeStart = 38;
  const escapeY = frame >= escapeStart
    ? spring({
        frame: frame - escapeStart,
        fps,
        from: 0,
        to: -600,
        config: { damping: 15, mass: 0.3, stiffness: 100 },
      })
    : 0;
  const escapeScale = frame >= escapeStart
    ? interpolate(frame, [escapeStart, escapeStart + 8], [1, 1.5], { extrapolateRight: "clamp" })
    : 1;

  // Phase 3: Explosion at frame 50
  const explodeFrame = 50;
  const explosionParticles = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2 + i * 0.15;
    const speed = 100 + (i % 4) * 60;
    const size = 8 + (i % 5) * 5;
    const dist = frame >= explodeFrame
      ? spring({
          frame: frame - explodeFrame,
          fps,
          from: 0,
          to: speed,
          config: { damping: 12, mass: 0.5 },
        })
      : 0;
    const opacity = frame >= explodeFrame
      ? interpolate(frame, [explodeFrame, explodeFrame + 4, explodeFrame + 18], [0, 0.7, 0], {
          extrapolateRight: "clamp",
        })
      : 0;
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist - 300,
      size,
      opacity,
      color: i % 3 === 0 ? STYLE.accent : i % 3 === 1 ? STYLE.accentLight : STYLE.greenLight,
    };
  });

  // Flash on explosion
  const flashOpacity = interpolate(
    frame,
    [explodeFrame - 1, explodeFrame + 1, explodeFrame + 4, explodeFrame + 12],
    [0, 0.5, 0.2, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Hide initial card after explosion
  const initialCardFadeOut = frame >= explodeFrame
    ? interpolate(frame, [explodeFrame, explodeFrame + 8], [1, 0], { extrapolateRight: "clamp" })
    : 1;

  // Button opacity (fades at explosion)
  const buttonOpacity = frame >= explodeFrame
    ? 0
    : frame >= escapeStart
    ? interpolate(frame, [escapeStart + 8, explodeFrame], [1, 0.5], { extrapolateRight: "clamp" })
    : 1;

  // Phase 4: New card appears with 3D rotation (frames 60+)
  const newCardStart = 62;
  const newCardRotateY = spring({
    frame: Math.max(0, frame - newCardStart),
    fps,
    from: -90,
    to: 0,
    config: { damping: 8, mass: 0.6 },
  });
  const newCardScale = spring({
    frame: Math.max(0, frame - newCardStart),
    fps,
    from: 0.3,
    to: 1,
    config: { damping: 7, mass: 0.5 },
  });
  const newCardOpacity = interpolate(frame, [newCardStart, newCardStart + 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Content text in new card
  const contentStart = newCardStart + 15;
  const contentOpacity = interpolate(frame, [contentStart, contentStart + 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  const floatY = Math.sin(frame / 15) * 4;

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      {/* Flash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 30%, ${STYLE.accent} 0%, transparent 60%)`,
          opacity: flashOpacity,
          zIndex: 5,
        }}
      />

      {/* Explosion particles */}
      {explosionParticles.map((p, i) => (
        <div
          key={`exp-${i}`}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px))`,
            width: p.size,
            height: p.size,
            borderRadius: i % 2 === 0 ? "50%" : "3px",
            background: p.color,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 1.5}px ${p.color}50`,
            zIndex: 6,
          }}
        />
      ))}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          zIndex: 2,
          transform: `translateY(${floatY}px)`,
          perspective: "1200px",
        }}
      >
        {/* Badge "02" */}
        <div
          style={{
            background: STYLE.accent,
            borderRadius: 20,
            padding: "10px 32px",
            transform: `scale(${badgeScale})`,
            boxShadow: `0 6px 20px ${STYLE.accent}30`,
          }}
        >
          <span
            style={{
              fontFamily: STYLE.fontHeading,
              fontSize: 28,
              fontWeight: 700,
              color: STYLE.textLight,
            }}
          >
            02
          </span>
        </div>

        {/* Initial card (fades out) */}
        {initialCardFadeOut > 0 && (
          <div
            style={{
              width: 920,
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(20px)",
              borderRadius: STYLE.cardRadius,
              padding: STYLE.cardPadding,
              border: "1px solid rgba(255,255,255,0.5)",
              boxShadow: STYLE.shadow,
              opacity: initialCardOpacity * initialCardFadeOut,
              transform: `scale(${initialCardScale})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              position: "relative",
            }}
          >
            <span
              style={{
                fontFamily: STYLE.fontBody,
                fontSize: 44,
                fontWeight: 600,
                color: STYLE.textMuted,
              }}
            >
              יש טופס מוכן...
            </span>

            {/* AI button that shakes and escapes */}
            <div
              style={{
                background: `linear-gradient(135deg, ${STYLE.accent} 0%, ${STYLE.accentDark} 100%)`,
                borderRadius: 60,
                padding: "16px 48px",
                transform: `translate(${buttonShakeX}px, ${buttonShakeY + escapeY}px) scale(${escapeScale})`,
                opacity: buttonOpacity,
                boxShadow: `0 8px 28px ${STYLE.accent}40`,
                display: "flex",
                alignItems: "center",
                gap: 12,
                zIndex: 10,
              }}
            >
              <AIIcon size={36} color="white" />
              <span
                style={{
                  fontFamily: STYLE.fontHeading,
                  fontSize: 36,
                  fontWeight: 700,
                  color: STYLE.textLight,
                }}
              >
                AI
              </span>
            </div>
          </div>
        )}

        {/* New card — 3D rotation entrance */}
        {frame >= newCardStart && (
          <div
            style={{
              width: 920,
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(20px)",
              borderRadius: STYLE.cardRadius,
              padding: STYLE.cardPadding,
              border: "1px solid rgba(255,255,255,0.5)",
              boxShadow: STYLE.shadow,
              transform: `rotateY(${newCardRotateY}deg) scale(${newCardScale})`,
              opacity: newCardOpacity,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              transformStyle: "preserve-3d",
            }}
          >
            <div
              style={{
                opacity: contentOpacity,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                textAlign: "center",
              }}
            >
              <AIIcon size={72} color={STYLE.accent} />
              <span
                style={{
                  fontFamily: STYLE.fontBody,
                  fontSize: 52,
                  fontWeight: 700,
                  color: STYLE.textDark,
                  lineHeight: 1.4,
                }}
              >
                כותבים prompt
              </span>
              <span
                style={{
                  fontFamily: STYLE.fontBody,
                  fontSize: 44,
                  fontWeight: 500,
                  color: STYLE.textMuted,
                }}
              >
                נושא, רמה, סוג שאלות
              </span>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
