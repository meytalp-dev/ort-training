import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { STITCH, stitchBg } from "../styles";
import { Particles } from "../Particles";
import { HourglassIcon, RocketIcon } from "../Icons";

// Before/After Split: 3 hours vs 4 minutes — with SLAM, LIGHTNING, GLOW, SPARKLES
export const SummaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Split animation — divider line grows from center
  const dividerStart = 8;
  const dividerHeight = spring({
    frame: Math.max(0, frame - dividerStart), fps,
    from: 0, to: 1400,
    config: { damping: 12, mass: 0.8 },
  });
  const dividerOpacity = interpolate(frame, [dividerStart, dividerStart + 6], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Left side ("before") enters from left
  const leftX = spring({
    frame, fps, from: -500, to: 0,
    config: { damping: 10, mass: 0.7 },
  });
  const leftOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  // Right side ("after") enters from right
  const rightX = spring({
    frame: Math.max(0, frame - 6), fps, from: 500, to: 0,
    config: { damping: 10, mass: 0.7 },
  });
  const rightOpacity = interpolate(frame, [6, 16], [0, 1], { extrapolateRight: "clamp" });

  // "Before" number SLAMS in HUGE (scale 6→1) with screen shake
  const beforeNumStart = 20;
  const beforeNumScale = spring({
    frame: Math.max(0, frame - beforeNumStart), fps,
    from: 6, to: 1,
    config: { damping: 5, mass: 0.3, stiffness: 200 },
  });

  // Screen shake on "3" slam
  const beforeShakeX = frame >= beforeNumStart && frame < beforeNumStart + 10
    ? Math.sin(frame * 14) * (beforeNumStart + 10 - frame) * 2.5 : 0;
  const beforeShakeY = frame >= beforeNumStart && frame < beforeNumStart + 10
    ? Math.cos(frame * 11) * (beforeNumStart + 10 - frame) * 1.8 : 0;

  // Flash on "3" slam
  const beforeFlash = interpolate(frame, [beforeNumStart, beforeNumStart + 2, beforeNumStart + 8], [0, 0.3, 0], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // "After" number SLAMS in HUGE (scale 6→1) with screen shake
  const afterNumStart = 35;
  const afterNumScale = spring({
    frame: Math.max(0, frame - afterNumStart), fps,
    from: 6, to: 1,
    config: { damping: 5, mass: 0.3, stiffness: 200 },
  });

  // Screen shake on "4" slam
  const afterShakeX = frame >= afterNumStart && frame < afterNumStart + 10
    ? Math.sin(frame * 14) * (afterNumStart + 10 - frame) * 3 : 0;
  const afterShakeY = frame >= afterNumStart && frame < afterNumStart + 10
    ? Math.cos(frame * 11) * (afterNumStart + 10 - frame) * 2 : 0;

  // Flash on "4" slam
  const afterFlash = interpolate(frame, [afterNumStart, afterNumStart + 2, afterNumStart + 8], [0, 0.4, 0], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // After glow
  const afterGlow = frame >= afterNumStart + 8 ? 0.3 + Math.sin((frame - afterNumStart) / 5) * 0.15 : 0;


  // Sparkles around "4 דקות" side
  const sparkleStart = afterNumStart + 10;
  const sparkles = Array.from({ length: 8 }, (_, i) => {
    const spAngle = (i / 8) * Math.PI * 2 + frame * 0.05;
    const spRadius = 180 + Math.sin(frame * 0.08 + i * 2) * 30;
    const spX = Math.cos(spAngle) * spRadius;
    const spY = Math.sin(spAngle) * spRadius;
    const spSize = 8 + (i % 3) * 5;
    const twinkle = 0.3 + Math.sin((frame + i * 12) / 3) * 0.7;
    return { x: spX, y: spY, size: spSize, opacity: twinkle };
  });

  // Bottom text with GLOW RING expanding behind it
  const bottomStart = 55;
  const bottomOpacity = interpolate(frame, [bottomStart, bottomStart + 8], [0, 1], {
    extrapolateRight: "clamp",
  });
  const bottomScale = spring({
    frame: Math.max(0, frame - bottomStart), fps,
    from: 0.5, to: 1, config: { damping: 7, mass: 0.4 },
  });

  // Glow ring behind bottom text — expands and pulses
  const glowRingScale = spring({
    frame: Math.max(0, frame - bottomStart), fps,
    from: 0.3, to: 2.5,
    config: { damping: 15, mass: 0.8 },
  });
  const glowRingPulse = frame >= bottomStart + 10
    ? 0.15 + Math.sin((frame - bottomStart) / 4) * 0.1 : 0.15;
  const glowRingOpacity = interpolate(frame, [bottomStart, bottomStart + 5, bottomStart + 20], [0, 0.3, glowRingPulse], {
    extrapolateRight: "clamp",
  });

  const floatY = Math.sin(frame / 14) * 5;

  // Combine shakes
  const totalShakeX = beforeShakeX + afterShakeX;
  const totalShakeY = beforeShakeY + afterShakeY;

  return (
    <AbsoluteFill style={{
      ...stitchBg,
      transform: `translate(${totalShakeX}px, ${totalShakeY}px)`,
    }}>
      <Particles />

      {/* Flash on "3" slam */}
      <div style={{
        position: "absolute", inset: -20,
        background: `radial-gradient(circle at 25% 50%, ${STITCH.textMuted} 0%, transparent 50%)`,
        opacity: beforeFlash, zIndex: 5, pointerEvents: "none",
      }} />

      {/* Flash on "4" slam */}
      <div style={{
        position: "absolute", inset: -20,
        background: `radial-gradient(circle at 75% 50%, ${STITCH.accent} 0%, ${STITCH.accentLight} 30%, transparent 60%)`,
        opacity: afterFlash, zIndex: 5, pointerEvents: "none",
      }} />

      {/* Left — Before */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: "48%", height: "100%",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 24,
        transform: `translateX(${leftX}px) translateY(${floatY}px)`,
        opacity: leftOpacity, zIndex: 2,
      }}>
        <div style={{
          fontFamily: STITCH.fontHeading, fontSize: 48, fontWeight: 800,
          color: STITCH.textMuted,
        }}>
          לפני
        </div>

        <HourglassIcon size={100} color={STITCH.textMuted} />

        <div style={{
          fontFamily: STITCH.fontHeading, fontSize: 100, fontWeight: 900,
          color: STITCH.textMuted,
          transform: `scale(${beforeNumScale})`,
        }}>
          3
        </div>

        <div style={{
          fontFamily: STITCH.fontBody, fontSize: 44, fontWeight: 600,
          color: STITCH.textMuted,
        }}>
          שעות עבודה
        </div>
      </div>

      {/* Center divider — straight line */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 4, height: dividerHeight,
        background: `linear-gradient(180deg, transparent 0%, ${STITCH.accent} 20%, ${STITCH.accent} 80%, transparent 100%)`,
        opacity: dividerOpacity, zIndex: 3,
        boxShadow: `0 0 20px ${STITCH.accent}40`,
      }} />


      {/* Right — After */}
      <div style={{
        position: "absolute", top: 0, right: 0, width: "48%", height: "100%",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 24,
        transform: `translateX(${rightX}px) translateY(${floatY}px)`,
        opacity: rightOpacity, zIndex: 2,
      }}>
        <div style={{
          fontFamily: STITCH.fontHeading, fontSize: 48, fontWeight: 800,
          color: STITCH.accent,
        }}>
          אחרי
        </div>

        <RocketIcon size={100} color={STITCH.accent} />

        <div style={{
          fontFamily: STITCH.fontHeading, fontSize: 100, fontWeight: 900,
          color: STITCH.accent,
          transform: `scale(${afterNumScale})`,
          textShadow: `0 0 40px ${STITCH.accent}${Math.round(afterGlow * 255).toString(16).padStart(2, "0")}`,
        }}>
          4
        </div>

        <div style={{
          fontFamily: STITCH.fontBody, fontSize: 44, fontWeight: 600,
          color: STITCH.accent,
        }}>
          דקות עם Stitch
        </div>

        {/* Sparkles around "4 דקות" */}
        {frame >= sparkleStart && sparkles.map((sp, i) => (
          <div key={`sparkle-${i}`} style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: `translate(calc(-50% + ${sp.x}px), calc(-50% + ${sp.y}px)) rotate(45deg)`,
            width: sp.size, height: sp.size,
            background: i % 2 === 0 ? STITCH.accentLight : STITCH.accent,
            opacity: sp.opacity * 0.5,
            boxShadow: `0 0 ${sp.size * 3}px ${STITCH.accentLight}50`,
            borderRadius: 2,
            pointerEvents: "none", zIndex: 6,
          }} />
        ))}
      </div>

      {/* Glow ring behind bottom text */}
      {frame >= bottomStart && (
        <div style={{
          position: "absolute", bottom: 140, left: "50%",
          transform: `translateX(-50%) scale(${glowRingScale})`,
          width: 200, height: 200, borderRadius: "50%",
          background: `radial-gradient(circle, ${STITCH.accent}30 0%, transparent 70%)`,
          opacity: glowRingOpacity,
          pointerEvents: "none", zIndex: 3,
        }} />
      )}

      {/* Bottom text */}
      <div style={{
        position: "absolute", bottom: 120, left: "50%",
        transform: `translateX(-50%) scale(${bottomScale})`,
        opacity: bottomOpacity, zIndex: 4,
      }}>
        <div style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          borderRadius: 60, padding: "16px 48px",
          boxShadow: `0 8px 30px ${STITCH.accent}20`,
          border: "1px solid rgba(255,255,255,0.4)",
        }}>
          <span style={{
            fontFamily: STITCH.fontHeading, fontSize: 44, fontWeight: 900,
            color: STITCH.textDark,
          }}>
            {"אותה תוצאה. "}
            <span style={{ color: STITCH.accent }}>פחות זמן.</span>
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
