import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GREG, gregBg } from "../styles";
import { Particles } from "../Particles";

// Energy pulse → word explodes out — DRAMATIC opener
export const CategoryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // === PHASE 1: Orange dot appears and pulses (frame 0-20) ===
  const dotScale = spring({
    frame, fps, from: 0, to: 1,
    config: { damping: 8, mass: 0.4 },
  });
  const dotPulse = 1 + Math.sin(frame / 3) * 0.15;
  const dotGlow = 1 + Math.sin(frame / 2) * 0.3;

  // Dot shrinks before explosion
  const dotShrink = interpolate(frame, [20, 26], [1, 0.3], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // === PHASE 2: Energy rings pulse outward (frame 10, 15, 20) ===
  const ringStarts = [8, 14, 20];

  // === PHASE 3: BIG EXPLOSION — dot expands to full screen flash (frame 26) ===
  const explosionStart = 26;
  const flashOpacity = interpolate(frame, [explosionStart, explosionStart + 2, explosionStart + 8], [0, 0.5, 0], {
    extrapolateRight: "clamp",
  });

  // Screen shake on explosion
  const shakeX = frame >= explosionStart && frame <= explosionStart + 8
    ? Math.sin(frame * 12) * (explosionStart + 8 - frame) * 2
    : 0;
  const shakeY = frame >= explosionStart && frame <= explosionStart + 8
    ? Math.cos(frame * 10) * (explosionStart + 8 - frame) * 1.5
    : 0;

  // === PHASE 4: "ידעתם?" BURSTS out huge (frame 28+) ===
  const textStart = 28;
  const textScale = spring({
    frame: Math.max(0, frame - textStart), fps,
    from: 4, to: 1,
    config: { damping: 5, mass: 0.3, stiffness: 180 },
  });
  const textOpacity = interpolate(frame, [textStart, textStart + 3], [0, 1], { extrapolateRight: "clamp" });

  // Text glow pulses after appearing
  const textGlow = frame >= textStart + 10
    ? 0.2 + Math.sin((frame - textStart) / 5) * 0.1
    : 0.3;

  // === Explosion particles fly outward ===
  const particles = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2 + (i * 0.3);
    const speed = 150 + (i % 4) * 100;
    const size = 10 + (i % 5) * 8;
    const distance = frame >= explosionStart
      ? spring({ frame: frame - explosionStart, fps, from: 0, to: speed, config: { damping: 12, mass: 0.5 } })
      : 0;
    const pOpacity = frame >= explosionStart
      ? interpolate(frame, [explosionStart, explosionStart + 3, explosionStart + 18], [0, 0.8, 0], { extrapolateRight: "clamp" })
      : 0;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size,
      opacity: pOpacity,
      rotate: frame * 3 + i * 18,
    };
  });

  // === Decorative sparkles after text lands ===
  const sparkles = [
    { x: -280, y: -120, delay: 34, size: 14 },
    { x: 300, y: -80, delay: 36, size: 12 },
    { x: -200, y: 100, delay: 38, size: 10 },
    { x: 250, y: 120, delay: 40, size: 16 },
    { x: -350, y: 0, delay: 42, size: 11 },
    { x: 350, y: -40, delay: 44, size: 13 },
  ];

  // Question mark bounces separately
  const qmStart = textStart + 8;
  const qmBounce = frame >= qmStart
    ? Math.sin((frame - qmStart) / 4) * 8
    : 0;

  return (
    <AbsoluteFill style={{
      ...gregBg,
      transform: `translate(${shakeX}px, ${shakeY}px)`,
    }}>
      <Particles />

      {/* Full screen flash */}
      <div style={{
        position: "absolute", inset: -20,
        background: `radial-gradient(circle, ${GREG.accent} 0%, ${GREG.accentLight} 40%, transparent 70%)`,
        opacity: flashOpacity, zIndex: 5,
      }} />

      {/* Energy pulse rings */}
      {ringStarts.map((start, i) => {
        const rF = Math.max(0, frame - start);
        const rScale = spring({ frame: rF, fps, from: 0.2, to: 4 + i, config: { damping: 15, mass: 1 } });
        const rOpacity = interpolate(frame, [start, start + 3, start + 15], [0, 0.3 - i * 0.05, 0], { extrapolateRight: "clamp" });
        return (
          <div key={`ring-${i}`} style={{
            position: "absolute", top: "48%", left: "50%",
            transform: `translate(-50%, -50%) scale(${rScale})`,
            width: 100, height: 100, borderRadius: "50%",
            border: `3px solid ${GREG.accent}`,
            boxShadow: `0 0 40px ${GREG.accent}40, 0 0 80px ${GREG.accent}15`,
            opacity: rOpacity, zIndex: 3,
          }} />
        );
      })}

      {/* Explosion particles */}
      {particles.map((p, i) => (
        <div key={`p-${i}`} style={{
          position: "absolute", top: "48%", left: "50%",
          transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px)) rotate(${p.rotate}deg)`,
          width: p.size, height: p.size,
          borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "3px" : "50%",
          background: i % 3 === 0 ? GREG.accent : i % 3 === 1 ? GREG.accentLight : "#F5C6A0",
          opacity: p.opacity,
          boxShadow: `0 0 ${p.size * 1.5}px ${GREG.accent}50`,
          zIndex: 6,
        }} />
      ))}

      {/* Center dot — pulses then shrinks before explosion */}
      {frame < explosionStart + 3 && (
        <div style={{
          position: "absolute", top: "48%", left: "50%",
          transform: `translate(-50%, -50%) scale(${dotScale * dotPulse * dotShrink})`,
          width: 60, height: 60, borderRadius: "50%",
          background: `radial-gradient(circle, ${GREG.accent}, ${GREG.accentDark})`,
          boxShadow: `0 0 ${40 * dotGlow}px ${GREG.accent}60, 0 0 ${80 * dotGlow}px ${GREG.accent}25`,
          zIndex: 4,
        }} />
      )}

      {/* "ידעתם?" text — BURSTS out */}
      <div style={{
        position: "absolute", top: "48%", left: "50%",
        transform: `translate(-50%, -50%) scale(${textScale})`,
        opacity: textOpacity, zIndex: 8,
        display: "flex", alignItems: "baseline",
      }}>
        <span style={{
          fontFamily: "'Playpen Sans Hebrew', 'Rubik', sans-serif",
          fontSize: 140,
          fontWeight: 400,
          color: GREG.accent,
          textShadow: `0 8px 50px ${GREG.accent}${Math.round(textGlow * 255).toString(16).padStart(2, '0')}, 0 0 100px ${GREG.accent}15`,
        }}>
          ידעתם
        </span>
        {/* Question mark bounces */}
        <span style={{
          fontFamily: "'Playpen Sans Hebrew', 'Rubik', sans-serif",
          fontSize: 160,
          fontWeight: 400,
          color: GREG.accentDark,
          transform: `translateY(${qmBounce}px)`,
          display: "inline-block",
          textShadow: `0 8px 50px ${GREG.accentDark}30`,
        }}>
          ?
        </span>
      </div>

      {/* Sparkles around text */}
      {sparkles.map((s, i) => {
        const sF = Math.max(0, frame - s.delay);
        const sScale = spring({ frame: sF, fps, from: 0, to: 1, config: { damping: 4, mass: 0.2, stiffness: 300 } });
        const twinkle = 0.4 + Math.sin((frame + i * 10) / 3) * 0.6;
        return (
          <div key={`spark-${i}`} style={{
            position: "absolute", top: "48%", left: "50%",
            transform: `translate(calc(-50% + ${s.x}px), calc(-50% + ${s.y}px)) scale(${sScale}) rotate(45deg)`,
            width: s.size, height: s.size,
            background: i % 2 === 0 ? GREG.accentLight : GREG.accent,
            opacity: twinkle * 0.5,
            boxShadow: `0 0 ${s.size * 2}px ${GREG.accentLight}40`,
            zIndex: 7,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};
