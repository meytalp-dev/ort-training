import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { STITCH, stitchBg } from "../styles";
import { Particles } from "../Particles";

// Particle Converge: 30 particles scattered -> converge -> BIGGER flash -> expanding RINGS -> sparkles
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 30 particles (up from 20) start at random positions, converge to center
  const convergeEnd = 50;
  const convergeProgress = interpolate(frame, [0, convergeEnd], [0, 1], {
    extrapolateRight: "clamp",
  });

  const centerX = 540;
  const centerY = 880;

  const particles = Array.from({ length: 30 }, (_, i) => {
    const angle = (i / 30) * Math.PI * 2;
    const dist = 400 + (i % 7) * 70;
    const startX = centerX + Math.cos(angle) * dist;
    const startY = centerY + Math.sin(angle) * dist;
    const x = startX + (centerX - startX) * convergeProgress;
    const y = startY + (centerY - startY) * convergeProgress;
    const size = 12 + (i % 4) * 6;
    const opacity = interpolate(convergeProgress, [0, 0.8, 1], [0.6, 0.8, 0], {
      extrapolateRight: "clamp",
    });
    const colors = [STITCH.accent, STITCH.accentLight, STITCH.teal, STITCH.accentDark];
    return { x, y, size, opacity, color: colors[i % 4] };
  });

  // BIGGER flash when converged (opacity 0.5)
  const flashOpacity = interpolate(frame, [convergeEnd - 2, convergeEnd, convergeEnd + 6], [0, 0.5, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Screen shake MORE INTENSE (multiplied by 2)
  const shakeX = frame >= convergeEnd - 2 && frame < convergeEnd + 8
    ? Math.sin(frame * 12) * (convergeEnd + 8 - frame) * 2 : 0;
  const shakeY = frame >= convergeEnd - 2 && frame < convergeEnd + 8
    ? Math.cos(frame * 10) * (convergeEnd + 8 - frame) * 1.5 : 0;

  // 3 EXPANDING RINGS when particles converge
  const expandingRings = [0, 1, 2].map((i) => {
    const ringDelay = convergeEnd - 1 + i * 4;
    const ringScale = spring({
      frame: Math.max(0, frame - ringDelay), fps,
      from: 0.2, to: 4 + i * 0.8,
      config: { damping: 18, mass: 0.6 },
    });
    const ringOpacity = interpolate(frame, [ringDelay, ringDelay + 3, ringDelay + 16], [0, 0.5, 0], {
      extrapolateRight: "clamp", extrapolateLeft: "clamp",
    });
    return { scale: ringScale, opacity: ringOpacity };
  });

  // "Stitch" text appears after convergence
  const textStart = convergeEnd + 2;
  const textScale = spring({
    frame: Math.max(0, frame - textStart), fps,
    from: 3, to: 1,
    config: { damping: 6, mass: 0.3, stiffness: 200 },
  });
  const textOpacity = interpolate(frame, [textStart, textStart + 5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Subtitle slides up
  const subStart = textStart + 15;
  const subY = spring({
    frame: Math.max(0, frame - subStart), fps,
    from: 60, to: 0,
    config: { damping: 9, mass: 0.5 },
  });
  const subOpacity = interpolate(frame, [subStart, subStart + 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Glow behind text
  const glowPulse = frame >= textStart ? 0.3 + Math.sin((frame - textStart) / 5) * 0.15 : 0;

  const floatY = Math.sin(frame / 14) * 5;

  return (
    <AbsoluteFill style={{
      ...stitchBg,
      transform: `translate(${shakeX}px, ${shakeY}px)`,
    }}>
      <Particles />

      {/* Flash */}
      <div style={{
        position: "absolute", inset: -20,
        background: `radial-gradient(circle, #fff 0%, ${STITCH.accent} 30%, ${STITCH.accentLight} 50%, transparent 70%)`,
        opacity: flashOpacity, zIndex: 5, pointerEvents: "none",
      }} />

      {/* Expanding rings on convergence */}
      {expandingRings.map((ring, i) => (
        <div key={`ring-${i}`} style={{
          position: "absolute", top: centerY, left: centerX,
          transform: `translate(-50%, -50%) scale(${ring.scale})`,
          width: 120, height: 120, borderRadius: "50%",
          border: `2px solid ${i === 0 ? STITCH.accent : i === 1 ? STITCH.accentLight : STITCH.teal}`,
          opacity: ring.opacity,
          boxShadow: `0 0 25px ${STITCH.accent}50, inset 0 0 15px ${STITCH.accent}20`,
          pointerEvents: "none", zIndex: 6,
        }} />
      ))}

      {/* Converging particles */}
      {particles.map((p, i) => (
        <div key={`p-${i}`} style={{
          position: "absolute",
          left: p.x - p.size / 2,
          top: p.y - p.size / 2,
          width: p.size, height: p.size,
          borderRadius: "50%",
          background: p.color,
          opacity: p.opacity,
          boxShadow: `0 0 ${p.size * 2}px ${p.color}60`,
          pointerEvents: "none", zIndex: 4,
        }} />
      ))}

      {/* Glow ring behind text */}
      {frame >= textStart && (
        <div style={{
          position: "absolute", top: centerY, left: centerX,
          transform: "translate(-50%, -50%)",
          width: 500, height: 500, borderRadius: "50%",
          background: `radial-gradient(circle, ${STITCH.accent}${Math.round(glowPulse * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
          pointerEvents: "none", zIndex: 6,
        }} />
      )}

      {/* "Stitch" text */}
      <div style={{
        position: "absolute", top: "46%", left: "50%",
        transform: `translate(-50%, -50%) translateY(${floatY}px) scale(${textScale})`,
        opacity: textOpacity, zIndex: 10,
        direction: "ltr",
      }}>
        <span style={{
          fontFamily: STITCH.fontHeading, fontSize: 120, fontWeight: 900,
          color: STITCH.accent,
          textShadow: `0 8px 50px ${STITCH.accent}50, 0 0 80px ${STITCH.accent}20`,
        }}>
          Stitch
        </span>
      </div>

      {/* Subtitle */}
      <div style={{
        position: "absolute", top: "58%", left: "50%",
        transform: `translate(-50%, ${subY}px) translateY(${floatY}px)`,
        opacity: subOpacity, zIndex: 10,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${STITCH.accent}, ${STITCH.accentDark})`,
          borderRadius: 60, padding: "14px 44px",
          boxShadow: `0 8px 30px ${STITCH.accent}40`,
        }}>
          <span style={{
            fontFamily: STITCH.fontHeading, fontSize: 44, fontWeight: 700,
            color: STITCH.textLight,
          }}>
            כותבים prompt — מקבלים עיצוב מוכן
          </span>
        </div>
      </div>

      {/* Sparkles after text lands — BIGGER and more numerous (8 instead of 4) */}
      {frame >= textStart + 8 && [
        { x: -300, y: -120, delay: textStart + 8, size: 20 },
        { x: 320, y: -80, delay: textStart + 9, size: 18 },
        { x: -220, y: 100, delay: textStart + 10, size: 16 },
        { x: 280, y: 120, delay: textStart + 11, size: 19 },
        { x: -380, y: -40, delay: textStart + 12, size: 17 },
        { x: 360, y: 60, delay: textStart + 13, size: 15 },
        { x: -160, y: -180, delay: textStart + 14, size: 18 },
        { x: 200, y: 180, delay: textStart + 15, size: 16 },
      ].map((s, i) => {
        const sF = Math.max(0, frame - s.delay);
        const sScale = spring({ frame: sF, fps, from: 0, to: 1, config: { damping: 4, mass: 0.2, stiffness: 300 } });
        const twinkle = 0.4 + Math.sin((frame + i * 10) / 3) * 0.6;
        return (
          <div key={`spark-${i}`} style={{
            position: "absolute", top: "46%", left: "50%",
            transform: `translate(calc(-50% + ${s.x}px), calc(-50% + ${s.y}px)) scale(${sScale}) rotate(45deg)`,
            width: s.size, height: s.size,
            background: i % 2 === 0 ? STITCH.accentLight : STITCH.accent,
            opacity: twinkle * 0.6,
            boxShadow: `0 0 ${s.size * 3}px ${STITCH.accentLight}50`,
            zIndex: 9, pointerEvents: "none",
          }} />
        );
      })}
    </AbsoluteFill>
  );
};
