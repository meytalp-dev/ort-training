import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GREG, gregBg } from "../styles";
import { Particles } from "../Particles";
import { ShieldIcon } from "../Icons";

export const AutoModeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // === PHASE 1: Card with approve button (frame 0-50) — SLOW, visible ===
  const card1Scale = spring({ frame, fps, from: 0.5, to: 1, config: { damping: 8, mass: 0.5 } });
  const card1Opacity = interpolate(frame, [0, 8, 52, 60], [0, 1, 1, 0], { extrapolateRight: "clamp" });

  // Button appears clearly, stays visible for a while
  const btnAppear = interpolate(frame, [8, 14], [0, 1], { extrapolateRight: "clamp" });

  // Button shakes impatiently before escaping (frame 30-42)
  const btnShake = frame >= 30 && frame < 42
    ? Math.sin(frame * 4) * 8 * Math.min(1, (frame - 30) / 6)
    : 0;

  // Button escapes upward (frame 42+)
  const btnEscapeStart = 42;
  const btnY = frame >= btnEscapeStart
    ? spring({ frame: frame - btnEscapeStart, fps, from: 0, to: -400, config: { damping: 6, mass: 0.4 } })
    : 0;
  const btnScale = frame >= btnEscapeStart
    ? spring({ frame: frame - btnEscapeStart, fps, from: 1, to: 1.5, config: { damping: 8, mass: 0.5 } })
    : 1;
  const btnRotate = frame >= btnEscapeStart
    ? spring({ frame: frame - btnEscapeStart, fps, from: 0, to: -20, config: { damping: 10, mass: 0.6 } })
    : 0;

  // === PHASE 2: Button explodes (frame 52+) ===
  const explodeStart = 52;
  const explodeParticles = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2;
    const distance = frame >= explodeStart
      ? spring({ frame: frame - explodeStart, fps, from: 0, to: 250 + (i % 3) * 100, config: { damping: 12, mass: 0.6 } })
      : 0;
    const particleOpacity = frame >= explodeStart
      ? interpolate(frame, [explodeStart, explodeStart + 4, explodeStart + 16], [0, 1, 0], { extrapolateRight: "clamp" })
      : 0;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 400,
      size: 14 + (i % 4) * 10,
      opacity: particleOpacity,
      rotate: frame * 4 + i * 26,
    };
  });

  const explodeFlash = interpolate(frame, [explodeStart, explodeStart + 2, explodeStart + 8], [0, 0.25, 0], {
    extrapolateRight: "clamp",
  });

  // === PHASE 3: New card (frame 62+) ===
  const card2Start = 62;
  const card2Scale = spring({
    frame: Math.max(0, frame - card2Start), fps, from: 0.3, to: 1,
    config: { damping: 7, mass: 0.5 },
  });
  const card2Opacity = interpolate(frame, [card2Start, card2Start + 6], [0, 1], { extrapolateRight: "clamp" });
  const card2RotateY = spring({
    frame: Math.max(0, frame - card2Start), fps, from: -30, to: 0,
    config: { damping: 10, mass: 0.8 },
  });

  // Shield icon
  const iconStart = 70;
  const iconScale = spring({
    frame: Math.max(0, frame - iconStart), fps, from: 0, to: 1,
    config: { damping: 4, mass: 0.2, stiffness: 300 },
  });

  // Title
  const titleStart = 78;
  const titleOpacity = interpolate(frame, [titleStart, titleStart + 6], [0, 1], { extrapolateRight: "clamp" });

  // Description
  const descStart = 90;
  const descOpacity = interpolate(frame, [descStart, descStart + 6], [0, 1], { extrapolateRight: "clamp" });
  const descY = spring({ frame: Math.max(0, frame - descStart), fps, from: 30, to: 0, config: { damping: 9 } });

  const floatY = Math.sin(frame / 14) * 5;

  return (
    <AbsoluteFill style={gregBg}>
      <Particles />

      {/* Explosion flash */}
      <div style={{
        position: "absolute", inset: 0, background: GREG.accent,
        opacity: explodeFlash, zIndex: 5,
      }} />

      {/* === PHASE 1: Card with approve button === */}
      <div style={{
        position: "absolute", top: "48%", left: "50%",
        transform: `translate(-50%, -50%) translateY(${floatY}px) scale(${card1Scale})`,
        opacity: card1Opacity, zIndex: 2,
        width: 800,
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(20px)",
        borderRadius: GREG.cardRadius,
        padding: "48px 40px",
        boxShadow: `0 20px 60px ${GREG.accent}15`,
        border: "1px solid rgba(255,255,255,0.5)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 28,
      }}>
        <div style={{
          fontFamily: GREG.fontBody, fontSize: 40, color: GREG.textMuted, textAlign: "center",
        }}>
          לאשר פעולה?
        </div>

        {/* The button — visible, shakes, then escapes */}
        <div style={{
          transform: `translateY(${btnY}px) translateX(${btnShake}px) scale(${btnScale}) rotate(${btnRotate}deg)`,
          opacity: btnAppear,
          zIndex: 10,
        }}>
          <div style={{
            background: "#e74c3c", borderRadius: 18, padding: "20px 56px",
            boxShadow: frame >= btnEscapeStart
              ? `0 8px 30px rgba(231,76,60,0.5)`
              : "0 6px 16px rgba(231,76,60,0.2)",
          }}>
            <span style={{
              fontFamily: GREG.fontHeading, fontSize: 38, fontWeight: 700, color: "white",
            }}>
              אשר? אשר? אשר?
            </span>
          </div>
        </div>

        <div style={{
          fontFamily: GREG.fontBody, fontSize: 30, color: GREG.textMuted,
          opacity: 0.5, textAlign: "center",
        }}>
          שוב ושוב ושוב...
        </div>
      </div>

      {/* === Explosion particles === */}
      {explodeParticles.map((p, i) => (
        <div key={i} style={{
          position: "absolute", top: "48%", left: "50%",
          transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px)) rotate(${p.rotate}deg)`,
          width: p.size, height: p.size,
          borderRadius: i % 3 === 0 ? "50%" : "4px",
          background: i % 2 === 0 ? GREG.accent : GREG.accentLight,
          opacity: p.opacity,
          boxShadow: `0 0 ${p.size}px ${GREG.accent}50`,
          zIndex: 6,
        }} />
      ))}

      {/* === PHASE 3: New card === */}
      <div style={{
        position: "absolute", top: "48%", left: "50%",
        perspective: 1200, zIndex: 3,
        transform: `translate(-50%, -50%) translateY(${floatY}px)`,
      }}>
        <div style={{
          transform: `scale(${card2Scale}) rotateY(${card2RotateY}deg)`,
          opacity: card2Opacity,
          width: 900,
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: GREG.cardRadius,
          padding: "48px",
          boxShadow: `0 20px 60px ${GREG.accent}20, 0 0 1px rgba(255,255,255,0.6) inset`,
          border: "1px solid rgba(255,255,255,0.5)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${GREG.accent}, ${GREG.accentDark})`,
            borderRadius: 50, padding: "8px 28px",
            position: "absolute", top: -20,
            boxShadow: `0 4px 16px ${GREG.accent}50`,
          }}>
            <span style={{ fontFamily: GREG.fontHeading, fontSize: 24, fontWeight: 700, color: GREG.textLight }}>01</span>
          </div>

          <div style={{
            transform: `scale(${iconScale})`,
            width: 120, height: 120, borderRadius: "50%",
            background: `rgba(217,119,87,0.12)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 40px ${GREG.accent}20`,
            marginTop: 20,
          }}>
            <ShieldIcon size={65} color={GREG.accent} />
          </div>

          <div style={{ direction: "ltr" }}>
            <div style={{
              fontFamily: GREG.fontHeading, fontSize: 68, fontWeight: 900,
              color: GREG.textDark, opacity: titleOpacity,
              textShadow: `0 2px 20px ${GREG.accent}20`,
            }}>
              Auto Mode
            </div>
          </div>

          <div style={{
            fontFamily: GREG.fontBody, fontSize: 44, fontWeight: 500,
            color: GREG.textMuted, opacity: descOpacity,
            transform: `translateY(${descY}px)`, textAlign: "center",
            lineHeight: 1.6,
          }}>
            נותנים הוראה — הוא רץ לבד.
            <br />
            <span style={{ color: GREG.accent, fontWeight: 700 }}>
              בלי לאשר כל צעד.
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
