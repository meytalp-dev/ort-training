import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { PRISM, prismBg, prismGradient } from "../prismStyles";
import { PrismParticles } from "../PrismParticles";

// COLOR SWEEP REVEAL — numbers paint themselves onto screen with gradient wipe
// "0" typewriter blinks → color sweep reveals → "100+" counter rolls up → sticker pops
export const V2HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // === "0" appears with typewriter cursor blink (frame 4-15) ===
  const zeroOpacity = interpolate(frame, [4, 8], [0, 1], { extrapolateRight: "clamp" });
  const cursorBlink = Math.sin(frame / 3) > 0 ? 1 : 0;
  const cursorFade = interpolate(frame, [15, 20], [1, 0], { extrapolateRight: "clamp" });

  // === "שורות קוד." — color sweep wipe from right to left (frame 12-25) ===
  const line1Sweep = interpolate(frame, [12, 25], [100, 0], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });
  const line1Opacity = interpolate(frame, [12, 16], [0, 1], { extrapolateRight: "clamp" });

  // === Divider line draws itself (frame 26-32) ===
  const dividerWidth = interpolate(frame, [26, 32], [0, 180], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // === "100+" counter rolls up (frame 34-50) ===
  const counterStart = 34;
  const counterValue = Math.min(100, Math.floor(
    interpolate(frame, [counterStart, counterStart + 14], [0, 100], {
      extrapolateRight: "clamp", extrapolateLeft: "clamp",
    })
  ));
  const counterOpacity = interpolate(frame, [counterStart, counterStart + 4], [0, 1], { extrapolateRight: "clamp" });
  const counterScale = counterValue >= 100
    ? spring({ frame: Math.max(0, frame - counterStart - 14), fps, from: 1.2, to: 1, config: { damping: 6, mass: 0.4 } })
    : 1;

  // === "כלים דיגיטליים." — sweep from left (frame 50-60) ===
  const line2Sweep = interpolate(frame, [50, 60], [-100, 0], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });
  const line2Opacity = interpolate(frame, [50, 54], [0, 1], { extrapolateRight: "clamp" });

  // === Sticker pop: "בלי קוד!" — bounces in like a sticker (frame 66) ===
  const stickerStart = 66;
  const stickerScale = spring({
    frame: Math.max(0, frame - stickerStart), fps,
    from: 0, to: 1,
    config: { damping: 4, mass: 0.3, stiffness: 300 },
  });
  const stickerRotate = spring({
    frame: Math.max(0, frame - stickerStart), fps,
    from: -15, to: 3,
    config: { damping: 8, mass: 0.5 },
  });

  // === Bottom text (frame 78) ===
  const bottomStart = 78;
  const bottomOpacity = interpolate(frame, [bottomStart, bottomStart + 8], [0, 1], { extrapolateRight: "clamp" });
  const bottomY = spring({ frame: Math.max(0, frame - bottomStart), fps, from: 30, to: 0, config: { damping: 10 } });

  // === Arrow (frame 90) ===
  const arrowStart = 90;
  const arrowOpacity = interpolate(frame, [arrowStart, arrowStart + 5], [0, 1], { extrapolateRight: "clamp" });
  const arrowBounce = frame >= arrowStart + 5 ? Math.sin((frame - arrowStart - 5) / 4) * 10 : 0;

  return (
    <AbsoluteFill style={prismBg}>
      <PrismParticles />

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 12, zIndex: 2,
      }}>
        {/* Card with layered shadow (parallax depth) */}
        <div style={{ position: "relative" }}>
          {/* Shadow layer 1 — offset */}
          <div style={{
            position: "absolute", top: 8, left: 8,
            width: 920, height: 520, borderRadius: 24,
            background: PRISM.indigo, opacity: 0.06,
          }} />
          {/* Shadow layer 2 */}
          <div style={{
            position: "absolute", top: 4, left: 4,
            width: 920, height: 520, borderRadius: 24,
            background: PRISM.violet, opacity: 0.04,
          }} />

          {/* Main card */}
          <div style={{
            position: "relative",
            width: 920, borderRadius: 24,
            background: PRISM.card,
            padding: "48px 44px",
            boxShadow: PRISM.shadowDeep,
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 14, textAlign: "center",
          }}>
            {/* "0" with typewriter cursor */}
            <div style={{ position: "relative", display: "inline-flex", alignItems: "baseline" }}>
              <span style={{
                fontFamily: PRISM.fontHeading, fontSize: 160, fontWeight: 900,
                background: prismGradient,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                lineHeight: 1, opacity: zeroOpacity,
              }}>0</span>
              {/* Blinking cursor */}
              <div style={{
                width: 6, height: 100, borderRadius: 3,
                background: PRISM.indigo,
                opacity: cursorBlink * cursorFade,
                marginRight: 8,
              }} />
            </div>

            {/* "שורות קוד." — color sweep */}
            <div style={{
              fontFamily: PRISM.fontHeading, fontSize: 52, fontWeight: 700,
              color: PRISM.textDark, opacity: line1Opacity,
              clipPath: `inset(0 ${line1Sweep}% 0 0)`,
            }}>שורות קוד.</div>

            {/* Divider — draws itself */}
            <div style={{
              width: dividerWidth, height: 4, borderRadius: 2,
              background: prismGradient,
              margin: "6px 0",
            }} />

            {/* "100+" counter roll */}
            <div style={{
              fontFamily: PRISM.fontHeading, fontSize: 110, fontWeight: 900,
              background: prismGradient,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              lineHeight: 1, opacity: counterOpacity,
              transform: `scale(${counterScale})`,
            }}>
              {counterValue >= 100 ? "+100" : `+${counterValue}`}
            </div>

            {/* "כלים דיגיטליים." — sweep from left */}
            <div style={{
              fontFamily: PRISM.fontHeading, fontSize: 52, fontWeight: 700,
              color: PRISM.textDark, opacity: line2Opacity,
              clipPath: `inset(0 0 0 ${Math.abs(line2Sweep)}%)`,
            }}>כלים דיגיטליים.</div>

            {/* Sticker — "בלי קוד!" */}
            <div style={{
              position: "absolute", top: -20, left: -30,
              transform: `scale(${stickerScale}) rotate(${stickerRotate}deg)`,
              background: prismGradient,
              borderRadius: 16, padding: "10px 24px",
              boxShadow: `0 6px 20px ${PRISM.indigo}30`,
            }}>
              <span style={{
                fontFamily: PRISM.fontHeading, fontSize: 28, fontWeight: 700,
                color: PRISM.textLight,
              }}>בלי קוד!</span>
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <div style={{
          fontFamily: PRISM.fontBody, fontSize: 44, fontWeight: 500,
          color: PRISM.textMuted, opacity: bottomOpacity,
          transform: `translateY(${bottomY}px)`,
          textAlign: "center", marginTop: 12,
        }}>
          אני מורה. בלי רקע בתכנות.
        </div>

        {/* Arrow */}
        <div style={{
          opacity: arrowOpacity,
          transform: `translateY(${arrowBounce}px)`,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        }}>
          <span style={{
            fontFamily: PRISM.fontHeading, fontSize: 44, fontWeight: 700,
            background: prismGradient,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>וככה זה נראה</span>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
            stroke={PRISM.indigo} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};
