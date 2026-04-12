import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { STYLE, bgStyle } from "../styles";
import { Particles } from "../Particles";
import { playpenFamily } from "../fonts";

// Scene 2: Particle Converge — scattered particles converge to center
// forming "!בוחן חכם" text with a flash
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Particles scattered (frames 0-50)
  // Phase 2: Particles converge to center (frames 50-75)
  // Phase 3: Flash + text appears (frames 75+)

  const convergeStart = 40;
  const flashFrame = 70;

  // 24 scattered particles that converge
  const particleCount = 24;
  const convergeParticles = Array.from({ length: particleCount }, (_, i) => {
    const angle = (i / particleCount) * Math.PI * 2 + i * 0.3;
    const maxDist = 500 + (i % 5) * 80;
    const size = 10 + (i % 6) * 6;

    // Scattered position
    const scatterX = Math.cos(angle) * maxDist + Math.sin(frame / (8 + i % 4)) * 30;
    const scatterY = Math.sin(angle) * maxDist + Math.cos(frame / (10 + i % 3)) * 25;

    // Converge progress with spring
    const convergeProgress = spring({
      frame: Math.max(0, frame - convergeStart - (i % 6) * 2),
      fps,
      from: 0,
      to: 1,
      config: { damping: 8, mass: 0.4, stiffness: 120 },
    });

    const x = interpolate(convergeProgress, [0, 1], [scatterX, 0]);
    const y = interpolate(convergeProgress, [0, 1], [scatterY, 0]);

    // Particles fade out at convergence
    const opacity = frame < flashFrame
      ? interpolate(convergeProgress, [0, 0.8, 1], [0.6, 0.8, 0.3], { extrapolateRight: "clamp" })
      : interpolate(frame, [flashFrame, flashFrame + 8], [0.3, 0], { extrapolateRight: "clamp" });

    return { x, y, size, opacity, color: i % 3 === 0 ? STYLE.accent : i % 3 === 1 ? STYLE.greenLight : STYLE.accentLight };
  });

  // Flash effect
  const flashOpacity = interpolate(
    frame,
    [flashFrame - 2, flashFrame, flashFrame + 3, flashFrame + 12],
    [0, 0.6, 0.3, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Screen shake on flash
  const shakeX = frame >= flashFrame && frame <= flashFrame + 10
    ? Math.sin(frame * 14) * (flashFrame + 10 - frame) * 1.5 : 0;
  const shakeY = frame >= flashFrame && frame <= flashFrame + 10
    ? Math.cos(frame * 11) * (flashFrame + 10 - frame) * 1 : 0;

  // Text slams in after flash
  const textStart = flashFrame + 2;
  const textScale = spring({
    frame: Math.max(0, frame - textStart),
    fps,
    from: 6,
    to: 1,
    config: { damping: 4, mass: 0.25, stiffness: 200 },
  });
  const textOpacity = interpolate(frame, [textStart, textStart + 4], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Glow pulse on text
  const glowIntensity = frame >= textStart + 12
    ? 0.25 + Math.sin((frame - textStart) / 5) * 0.1
    : 0.35;

  // Expanding ring effect on flash
  const ringScale = spring({
    frame: Math.max(0, frame - flashFrame),
    fps,
    from: 0.2,
    to: 3,
    config: { damping: 15, mass: 0.8 },
  });
  const ringOpacity = interpolate(frame, [flashFrame, flashFrame + 5, flashFrame + 18], [0, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtitle appears after
  const subStart = textStart + 18;
  const subOpacity = interpolate(frame, [subStart, subStart + 8], [0, 1], { extrapolateRight: "clamp" });
  const subY = spring({
    frame: Math.max(0, frame - subStart),
    fps,
    from: 30,
    to: 0,
    config: { damping: 8, mass: 0.5 },
  });

  return (
    <AbsoluteFill
      style={{
        ...bgStyle,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      <Particles />

      {/* Flash */}
      <div
        style={{
          position: "absolute",
          inset: -20,
          background: `radial-gradient(circle, ${STYLE.accent} 0%, ${STYLE.accentLight} 30%, transparent 70%)`,
          opacity: flashOpacity,
          zIndex: 5,
        }}
      />

      {/* Expanding ring */}
      {frame >= flashFrame && (
        <div
          style={{
            position: "absolute",
            top: "46%",
            left: "50%",
            width: 150,
            height: 150,
            borderRadius: "50%",
            border: `3px solid ${STYLE.accent}`,
            transform: `translate(-50%, -50%) scale(${ringScale})`,
            opacity: ringOpacity,
            zIndex: 6,
          }}
        />
      )}

      {/* Converging particles */}
      {convergeParticles.map((p, i) => (
        <div
          key={`cp-${i}`}
          style={{
            position: "absolute",
            top: "46%",
            left: "50%",
            transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px))`,
            width: p.size,
            height: p.size,
            borderRadius: i % 2 === 0 ? "50%" : "4px",
            background: p.color,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 1.5}px ${p.color}50`,
            zIndex: 4,
          }}
        />
      ))}

      {/* Main text — slams in */}
      {frame >= textStart && (
        <div
          style={{
            position: "absolute",
            top: "42%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${textScale})`,
            opacity: textOpacity,
            zIndex: 10,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: playpenFamily,
              fontSize: 120,
              fontWeight: 400,
              color: STYLE.accent,
              textShadow: `0 8px 50px rgba(123,97,255,${glowIntensity}), 0 0 80px ${STYLE.accent}15`,
            }}
          >
            בוחן חכם!
          </span>
        </div>
      )}

      {/* Subtitle */}
      {frame >= subStart && (
        <div
          style={{
            position: "absolute",
            top: "58%",
            left: "50%",
            transform: `translate(-50%, ${subY}px)`,
            opacity: subOpacity,
            zIndex: 10,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: STYLE.fontBody,
              fontSize: 44,
              fontWeight: 600,
              color: STYLE.textDark,
            }}
          >
            ב-3 צעדים פשוטים
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};
