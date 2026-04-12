import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FLOW, flowBg } from "../styles";
import { FlowParticles } from "../FlowParticles";

// Play triangle explodes → "כלי ששווה להכיר" bursts out
export const PlayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // === PHASE 1: Play triangle appears and pulses (0-25) ===
  const triScale = spring({
    frame, fps, from: 0, to: 1,
    config: { damping: 6, mass: 0.4, stiffness: 200 },
  });
  const triPulse = 1 + Math.sin(frame / 3) * 0.1;
  const triGlow = 1 + Math.sin(frame / 2) * 0.4;

  // Triangle shrinks before explosion
  const triShrink = interpolate(frame, [22, 28], [1, 0.2], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // === PHASE 2: Neon rings pulse outward ===
  const ringStarts = [8, 15, 22];

  // === PHASE 3: EXPLOSION — triangle expands to flash (frame 28) ===
  const explosionStart = 28;
  const flashOpacity = interpolate(frame, [explosionStart, explosionStart + 2, explosionStart + 10], [0, 0.4, 0], {
    extrapolateRight: "clamp",
  });

  // Screen shake
  const shakeX = frame >= explosionStart && frame <= explosionStart + 8
    ? Math.sin(frame * 12) * (explosionStart + 8 - frame) * 2 : 0;
  const shakeY = frame >= explosionStart && frame <= explosionStart + 8
    ? Math.cos(frame * 10) * (explosionStart + 8 - frame) * 1.5 : 0;

  // === PHASE 4: Text bursts out (frame 30+) ===
  const textStart = 30;
  const textScale = spring({
    frame: Math.max(0, frame - textStart), fps,
    from: 3.5, to: 1,
    config: { damping: 5, mass: 0.3, stiffness: 180 },
  });
  const textOpacity = interpolate(frame, [textStart, textStart + 3], [0, 1], { extrapolateRight: "clamp" });

  // === Explosion particles — neon colored ===
  const colors = [FLOW.accent, FLOW.blueLight, FLOW.purple, FLOW.warm, FLOW.teal];
  const particles = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * Math.PI * 2 + (i * 0.2);
    const speed = 180 + (i % 5) * 80;
    const size = 8 + (i % 5) * 7;
    const distance = frame >= explosionStart
      ? spring({ frame: frame - explosionStart, fps, from: 0, to: speed, config: { damping: 12, mass: 0.5 } })
      : 0;
    const pOpacity = frame >= explosionStart
      ? interpolate(frame, [explosionStart, explosionStart + 3, explosionStart + 20], [0, 0.7, 0], { extrapolateRight: "clamp" })
      : 0;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size, opacity: pOpacity,
      color: colors[i % colors.length],
      rotate: frame * 3 + i * 15,
    };
  });

  // Subtitle
  const subStart = textStart + 12;
  const subOpacity = interpolate(frame, [subStart, subStart + 6], [0, 1], { extrapolateRight: "clamp" });
  const subY = spring({
    frame: Math.max(0, frame - subStart), fps,
    from: 30, to: 0, config: { damping: 10, mass: 0.5 },
  });

  return (
    <AbsoluteFill style={{
      ...flowBg,
      transform: `translate(${shakeX}px, ${shakeY}px)`,
    }}>
      <FlowParticles />

      {/* Full screen flash — pink/purple */}
      <div style={{
        position: "absolute", inset: -20,
        background: `radial-gradient(circle, ${FLOW.accent} 0%, ${FLOW.purple} 40%, transparent 70%)`,
        opacity: flashOpacity, zIndex: 5,
      }} />

      {/* Neon rings */}
      {ringStarts.map((start, i) => {
        const rF = Math.max(0, frame - start);
        const rScale = spring({ frame: rF, fps, from: 0.2, to: 3.5 + i, config: { damping: 15, mass: 1 } });
        const rOpacity = interpolate(frame, [start, start + 3, start + 15], [0, 0.25 - i * 0.04, 0], { extrapolateRight: "clamp" });
        return (
          <div key={`ring-${i}`} style={{
            position: "absolute", top: "46%", left: "50%",
            transform: `translate(-50%, -50%) scale(${rScale})`,
            width: 100, height: 100, borderRadius: "50%",
            border: `2px solid ${FLOW.accent}`,
            boxShadow: `0 0 30px ${FLOW.accent}40, 0 0 60px ${FLOW.purple}20`,
            opacity: rOpacity, zIndex: 3,
          }} />
        );
      })}

      {/* Explosion particles — multi-colored neon */}
      {particles.map((p, i) => (
        <div key={`p-${i}`} style={{
          position: "absolute", top: "46%", left: "50%",
          transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px)) rotate(${p.rotate}deg)`,
          width: p.size, height: p.size,
          borderRadius: i % 3 === 0 ? "50%" : "3px",
          background: p.color,
          opacity: p.opacity,
          boxShadow: `0 0 ${p.size * 2}px ${p.color}60`,
          zIndex: 6,
        }} />
      ))}

      {/* Play triangle — pulses then explodes */}
      {frame < explosionStart + 3 && (
        <svg
          style={{
            position: "absolute", top: "46%", left: "50%",
            transform: `translate(-50%, -50%) scale(${triScale * triPulse * triShrink})`,
            width: 120, height: 120, zIndex: 4,
            filter: `drop-shadow(0 0 ${30 * triGlow}px ${FLOW.accent}80) drop-shadow(0 0 ${60 * triGlow}px ${FLOW.purple}30)`,
          }}
          viewBox="0 0 64 64"
        >
          <path d="M20 12 L52 32 L20 52 Z" fill={FLOW.accent} />
        </svg>
      )}

      {/* "כלי ששווה להכיר" — bursts out */}
      <div style={{
        position: "absolute", top: "42%", left: "50%",
        transform: `translate(-50%, -50%) scale(${textScale})`,
        opacity: textOpacity, zIndex: 8,
        textAlign: "center",
      }}>
        <span style={{
          fontFamily: "'Playpen Sans Hebrew', 'Rubik', sans-serif",
          fontSize: 100,
          fontWeight: 400,
          color: FLOW.textLight,
          textShadow: `0 0 40px ${FLOW.accent}60, 0 0 80px ${FLOW.purple}25`,
        }}>
          כלי ששווה להכיר
        </span>
      </div>

      {/* Subtitle — Google Flow */}
      <div style={{
        position: "absolute", top: "56%", left: "50%",
        transform: `translate(-50%, ${subY}px)`,
        opacity: subOpacity, zIndex: 8,
      }}>
        <span style={{
          fontFamily: FLOW.fontHeading, fontSize: 52, fontWeight: 300,
          color: FLOW.accent, letterSpacing: 8,
          direction: "ltr",
          textShadow: `0 0 30px ${FLOW.accent}40`,
        }}>
          Google Flow
        </span>
      </div>
    </AbsoluteFill>
  );
};
