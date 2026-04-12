import React from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate,
  Img, staticFile,
} from "remotion";
import { PRISM, prismBg, prismGradient } from "../prismStyles";
import { PrismParticles } from "../PrismParticles";

// RIBBON UNFOLD — Gradient ribbon unfolds from center -> photo in hexagonal frame ->
// name types itself -> button with parallax shadow -> price ->
// 3 social icons pop with stagger -> "הלינקים בתגובה" gradient pulse
export const V2CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // === PHASE 1: Gradient ribbon unfolds from center (frame 0-14) ===
  const ribbonWidth = spring({
    frame, fps, from: 0, to: 100,
    config: { damping: 8, mass: 0.5 },
  });
  const ribbonOpacity = interpolate(frame, [0, 4, 12, 18], [0, 0.7, 0.7, 0], {
    extrapolateRight: "clamp",
  });

  // === PHASE 2: Photo zooms in inside hexagonal frame (frame 8+) ===
  const photoStart = 8;
  const photoScale = spring({
    frame: Math.max(0, frame - photoStart), fps,
    from: 0.2, to: 1, config: { damping: 7, mass: 0.4 },
  });
  const photoOpacity = interpolate(frame, [photoStart, photoStart + 6], [0, 1], { extrapolateRight: "clamp" });

  // === PHASE 3: "מיטל פלג" types itself (frame 18+) ===
  const nameStart = 18;
  const nameText = "מיטל פלג";
  const nameCharsPerFrame = 0.5;
  const nameVisibleChars = Math.min(
    nameText.length,
    Math.floor(Math.max(0, frame - nameStart) * nameCharsPerFrame)
  );
  const nameTyped = nameText.slice(0, nameVisibleChars);
  const nameTypingDone = nameVisibleChars >= nameText.length;
  const nameCursorBlink = Math.sin(frame / 3) > 0;

  // === PHASE 4: Button slides up with parallax shadow (frame 32+) ===
  const btnStart = 32;
  const btnScale = spring({
    frame: Math.max(0, frame - btnStart), fps,
    from: 1.3, to: 1, config: { damping: 6, mass: 0.4 },
  });
  const btnOpacity = interpolate(frame, [btnStart, btnStart + 5], [0, 1], { extrapolateRight: "clamp" });
  const btnY = spring({
    frame: Math.max(0, frame - btnStart), fps,
    from: 40, to: 0, config: { damping: 10, mass: 0.5 },
  });
  const btnPulse = frame >= btnStart + 15 ? 1 + Math.sin((frame - btnStart - 15) / 5) * 0.03 : 1;

  // === PHASE 5: "99 ש״ח בלבד" (frame 40+) ===
  const priceStart = 40;
  const priceOpacity = interpolate(frame, [priceStart, priceStart + 5], [0, 1], { extrapolateRight: "clamp" });
  const priceY = spring({
    frame: Math.max(0, frame - priceStart), fps,
    from: 20, to: 0, config: { damping: 10 },
  });

  // === PHASE 6: 3 social icons pop with stagger (frame 50+) ===
  const socialStart = 50;
  const socialIcons = [
    { icon: "f", label: "פייסבוק" },
    { icon: "@", label: "אינסטגרם" },
    { icon: "\u2709", label: "מייל" },
  ];

  // === PHASE 7: "הלינקים בתגובה הראשונה" gradient pulse (frame 66+) ===
  const linkStart = 66;
  const linkScale = spring({
    frame: Math.max(0, frame - linkStart), fps,
    from: 1.4, to: 1, config: { damping: 6, mass: 0.4 },
  });
  const linkOpacity = interpolate(frame, [linkStart, linkStart + 5], [0, 1], { extrapolateRight: "clamp" });
  // Gradient pulse effect — rotate the gradient angle over time
  const linkGradientAngle = frame >= linkStart ? 135 + Math.sin((frame - linkStart) / 6) * 30 : 135;

  // Hexagon clip path
  const hexClip = "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";

  return (
    <AbsoluteFill style={prismBg}>
      <PrismParticles />

      {/* === Gradient ribbon unfold === */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: `${ribbonWidth}%`, height: 120,
        background: prismGradient,
        opacity: ribbonOpacity,
        borderRadius: 60,
        filter: "blur(20px)",
        zIndex: 1,
      }} />

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 14, zIndex: 2,
        marginTop: 20,
      }}>
        {/* === Hexagonal photo frame === */}
        <div style={{
          position: "relative", width: 200, height: 200,
          transform: `scale(${photoScale})`,
          opacity: photoOpacity,
        }}>
          {/* Parallax shadow hex behind photo */}
          <div style={{
            position: "absolute", top: 8, left: -6,
            width: 200, height: 200,
            background: `${PRISM.indigo}15`,
            clipPath: hexClip,
          }} />
          <div style={{
            position: "absolute", top: 4, left: -3,
            width: 200, height: 200,
            background: `${PRISM.violet}12`,
            clipPath: hexClip,
          }} />

          {/* Gradient border hex */}
          <div style={{
            position: "absolute", top: -6, left: -6,
            width: 212, height: 212,
            background: prismGradient,
            clipPath: hexClip,
          }} />
          {/* Photo hex */}
          <div style={{
            position: "relative",
            width: 200, height: 200,
            clipPath: hexClip,
            overflow: "hidden",
            boxShadow: PRISM.shadowDeep,
          }}>
            <Img
              src={staticFile("meytal.jpeg")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>

        {/* === Name — types itself === */}
        <div style={{
          fontFamily: PRISM.fontHeading, fontSize: 52, fontWeight: 800,
          color: PRISM.textDark, minHeight: 65, textAlign: "center",
        }}>
          {nameTyped}
          {!nameTypingDone && nameCursorBlink && (
            <span style={{ color: PRISM.indigo, fontWeight: 300 }}>|</span>
          )}
        </div>

        {/* === CTA Button with parallax shadow === */}
        <div style={{
          position: "relative",
          opacity: btnOpacity,
          transform: `translateY(${btnY}px) scale(${btnScale * btnPulse})`,
        }}>
          {/* Button shadow layers */}
          <div style={{
            position: "absolute", top: 10, left: -6,
            width: "calc(100% + 12px)", height: "100%",
            background: `${PRISM.indigo}18`,
            borderRadius: 60,
            filter: "blur(8px)",
          }} />
          <div style={{
            position: "absolute", top: 5, left: -3,
            width: "calc(100% + 6px)", height: "100%",
            background: `${PRISM.violet}12`,
            borderRadius: 60,
            filter: "blur(4px)",
          }} />

          <div style={{
            position: "relative",
            background: `linear-gradient(135deg, ${PRISM.indigo}, ${PRISM.violet})`,
            borderRadius: 60, padding: "22px 60px",
            boxShadow: `0 12px 40px ${PRISM.indigo}30`,
          }}>
            <span style={{
              fontFamily: PRISM.fontHeading, fontSize: 44, fontWeight: 700,
              color: PRISM.textLight,
            }}>
              הדרכת Claude Code
            </span>
          </div>
        </div>

        {/* === Price === */}
        <div style={{
          fontFamily: PRISM.fontBody, fontSize: 44, fontWeight: 600,
          color: PRISM.textMuted, opacity: priceOpacity,
          transform: `translateY(${priceY}px)`,
        }}>
          99 ש״ח בלבד
        </div>

        {/* === Social icons — staggered pop === */}
        <div style={{ display: "flex", gap: 32, marginTop: 4 }}>
          {socialIcons.map((item, i) => {
            const iconDelay = socialStart + i * 5;
            const iconScale = spring({
              frame: Math.max(0, frame - iconDelay), fps,
              from: 0, to: 1,
              config: { damping: 4, mass: 0.2, stiffness: 300 },
            });
            const iconY = spring({
              frame: Math.max(0, frame - iconDelay), fps,
              from: 40, to: 0, config: { damping: 6, mass: 0.3 },
            });
            const iconColors = [PRISM.indigo, PRISM.rose, PRISM.teal];
            return (
              <div key={i} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                transform: `scale(${iconScale}) translateY(${iconY}px)`,
              }}>
                {/* Icon circle with parallax shadow */}
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute", top: 4, left: -3,
                    width: 66, height: 66, borderRadius: "50%",
                    background: `${iconColors[i]}15`,
                  }} />
                  <div style={{
                    position: "relative",
                    width: 60, height: 60, borderRadius: "50%",
                    background: PRISM.card,
                    border: `2px solid ${iconColors[i]}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: PRISM.fontHeading, fontSize: 26, fontWeight: 700,
                    color: iconColors[i],
                    boxShadow: PRISM.shadow,
                  }}>
                    {item.icon}
                  </div>
                </div>
                <span style={{
                  fontFamily: PRISM.fontBody, fontSize: 24, fontWeight: 600,
                  color: PRISM.textMuted,
                }}>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* === "הלינקים בתגובה הראשונה" — gradient text pulse === */}
        <div style={{
          fontFamily: PRISM.fontHeading, fontSize: 44, fontWeight: 700,
          background: `linear-gradient(${linkGradientAngle}deg, ${PRISM.indigo}, ${PRISM.teal}, ${PRISM.rose})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          opacity: linkOpacity,
          transform: `scale(${linkScale})`,
          marginTop: 4,
        }}>
          הלינקים בתגובה הראשונה
        </div>
      </div>
    </AbsoluteFill>
  );
};
