import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { PRISM, prismBg, prismGradient } from "../prismStyles";
import { PrismParticles } from "../PrismParticles";

// SPLIT REVEAL — Screen splits horizontally revealing terminal card ->
// prompt text color-sweeps word by word -> green checkmark draws itself (SVG) ->
// "ככה." + subtitle
export const V2RightScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // === PHASE 1: Split reveal — top slides up, bottom slides down (frame 0-18) ===
  const splitProgress = spring({
    frame, fps, from: 0, to: 1,
    config: { damping: 10, mass: 0.7 },
  });
  const splitOffset = splitProgress * 960; // half of 1920

  // === PHASE 2: Terminal card is visible behind split (frame ~10+) ===
  const cardOpacity = interpolate(frame, [6, 12], [0, 1], { extrapolateRight: "clamp" });
  const floatY = Math.sin(frame / 15) * 4;

  // === PHASE 3: Prompt text color-sweeps word by word (frame 16+) ===
  const promptWords = [
    "בנה", "מצגת", "על", "צמיחת", "שיער", "לכיתה", "י׳,",
    "עם", "שאלות", "הבנה,", "דוגמאות", "ותרגול.",
    "עיצוב", "מודרני,", "שפה", "פשוטה.",
  ];
  const wordStart = 16;
  const wordDelay = 2;

  // === PHASE 4: Green checkmark draws itself (frame ~52) ===
  const checkStart = wordStart + promptWords.length * wordDelay + 6;
  const checkDrawProgress = spring({
    frame: Math.max(0, frame - checkStart), fps,
    from: 0, to: 1,
    config: { damping: 12, mass: 0.8 },
  });
  const checkOpacity = interpolate(frame, [checkStart, checkStart + 4], [0, 1], { extrapolateRight: "clamp" });

  // Confetti burst when check completes
  const confettiStart = checkStart + 10;
  const confettiPieces = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2;
    const dist = frame >= confettiStart
      ? spring({ frame: frame - confettiStart, fps, from: 0, to: 150 + (i % 3) * 60, config: { damping: 15, mass: 0.8 } })
      : 0;
    const opacity = frame >= confettiStart
      ? interpolate(frame, [confettiStart, confettiStart + 4, confettiStart + 18], [0, 0.7, 0], { extrapolateRight: "clamp" })
      : 0;
    const colors = [PRISM.indigo, PRISM.teal, PRISM.rose, PRISM.violet, PRISM.sky, PRISM.amber];
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      color: colors[i % colors.length],
      opacity,
      w: 10 + (i % 4) * 4,
      h: 5 + (i % 3) * 2,
      rotate: frame * 3 + i * 36,
    };
  });

  // === PHASE 5: "ככה." text (frame ~66) ===
  const textStart = checkStart + 16;
  const textScale = spring({
    frame: Math.max(0, frame - textStart), fps,
    from: 1.8, to: 1, config: { damping: 6, mass: 0.4 },
  });
  const textOpacity = interpolate(frame, [textStart, textStart + 5], [0, 1], { extrapolateRight: "clamp" });

  // === PHASE 6: Subtitle (frame ~76) ===
  const subStart = textStart + 10;
  const subOpacity = interpolate(frame, [subStart, subStart + 6], [0, 1], { extrapolateRight: "clamp" });
  const subY = spring({
    frame: Math.max(0, frame - subStart), fps,
    from: 20, to: 0, config: { damping: 10 },
  });

  // The SVG checkmark path length (approximate)
  const checkPathLength = 36;

  return (
    <AbsoluteFill style={prismBg}>
      <PrismParticles />

      {/* Split panels — cover the scene initially */}
      {/* Top panel slides up */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: "50%",
        background: `linear-gradient(180deg, ${PRISM.indigo}, ${PRISM.violet})`,
        transform: `translateY(-${splitOffset}px)`,
        zIndex: 10,
      }} />
      {/* Bottom panel slides down */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: "50%",
        background: `linear-gradient(0deg, ${PRISM.teal}, ${PRISM.indigo})`,
        transform: `translateY(${splitOffset}px)`,
        zIndex: 10,
      }} />

      {/* Confetti burst around checkmark */}
      {confettiPieces.map((c, i) => (
        <div key={`cb-${i}`} style={{
          position: "absolute", top: "20%", left: 100,
          transform: `translate(${c.x}px, ${c.y}px) rotate(${c.rotate}deg)`,
          width: c.w, height: c.h, borderRadius: 2,
          background: c.color, opacity: c.opacity,
          zIndex: 6,
        }} />
      ))}

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 28, zIndex: 2,
      }}>
        {/* Terminal card with parallax shadows */}
        <div style={{ position: "relative" }}>
          {/* Shadow layer 2 */}
          <div style={{
            position: "absolute", top: 14, left: -10,
            width: 920, height: "100%",
            background: `${PRISM.teal}10`,
            borderRadius: PRISM.cardRadius + 2,
            transform: `translateY(${floatY + 3}px)`,
            opacity: cardOpacity * 0.5,
          }} />
          {/* Shadow layer 1 */}
          <div style={{
            position: "absolute", top: 7, left: -5,
            width: 920, height: "100%",
            background: `${PRISM.indigo}08`,
            borderRadius: PRISM.cardRadius,
            transform: `translateY(${floatY + 1}px)`,
            opacity: cardOpacity * 0.6,
          }} />

          {/* Main card */}
          <div style={{
            position: "relative",
            background: PRISM.card,
            borderRadius: PRISM.cardRadius,
            width: 920, overflow: "hidden",
            boxShadow: PRISM.shadowDeep,
            border: `1px solid ${PRISM.teal}20`,
            transform: `translateY(${floatY}px)`,
            opacity: cardOpacity,
          }}>
            {/* Terminal header */}
            <div style={{
              display: "flex", gap: 10, padding: "18px 24px",
              background: `${PRISM.indigo}08`,
              borderRadius: `${PRISM.cardRadius}px ${PRISM.cardRadius}px 0 0`,
            }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: PRISM.rose }} />
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: PRISM.amber }} />
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: PRISM.teal }} />
            </div>

            {/* Terminal content */}
            <div style={{
              padding: "28px 32px", fontFamily: "monospace",
              direction: "ltr", textAlign: "left",
            }}>
              <div style={{ color: PRISM.indigo, fontSize: 22, marginBottom: 10 }}>
                * Welcome to Claude Code
              </div>
              <div style={{ color: PRISM.textMuted, fontSize: 20, marginBottom: 24 }}>
                {">"} Think harder...
              </div>

              {/* Prompt — color sweep word by word */}
              <div style={{
                background: `${PRISM.teal}06`,
                borderRadius: 14, padding: "18px 24px",
                border: `1px solid ${PRISM.teal}20`,
                direction: "rtl", textAlign: "right",
              }}>
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 8,
                  justifyContent: "flex-start",
                  fontFamily: PRISM.fontBody, fontSize: 44, lineHeight: 1.6,
                }}>
                  {promptWords.map((word, i) => {
                    const wFrame = wordStart + i * wordDelay;
                    const sweepProgress = interpolate(frame, [wFrame, wFrame + 4], [0, 100], {
                      extrapolateRight: "clamp", extrapolateLeft: "clamp",
                    });
                    const wOpacity = interpolate(frame, [wFrame, wFrame + 2], [0, 1], {
                      extrapolateRight: "clamp", extrapolateLeft: "clamp",
                    });
                    const isSwept = sweepProgress > 50;
                    return (
                      <span key={i} style={{
                        display: "inline-block",
                        opacity: wOpacity,
                        color: isSwept ? "transparent" : PRISM.textDark,
                        background: isSwept ? prismGradient : "none",
                        WebkitBackgroundClip: isSwept ? "text" : undefined,
                        WebkitTextFillColor: isSwept ? "transparent" : undefined,
                        clipPath: `inset(0 ${100 - sweepProgress}% 0 0)`,
                      }}>
                        {word}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Green gradient checkmark — draws itself via stroke-dasharray */}
            <div style={{
              position: "absolute", top: 24, left: 24,
              width: 80, height: 80, borderRadius: "50%",
              background: `linear-gradient(135deg, ${PRISM.teal}, ${PRISM.indigo})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: checkOpacity,
              boxShadow: `0 8px 30px ${PRISM.teal}40`,
            }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline
                  points="20 6 9 17 4 12"
                  strokeDasharray={checkPathLength}
                  strokeDashoffset={checkPathLength * (1 - checkDrawProgress)}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* "ככה." — gradient text */}
        <div style={{
          fontFamily: PRISM.fontHeading, fontSize: 64, fontWeight: 900,
          background: `linear-gradient(135deg, ${PRISM.teal}, ${PRISM.indigo})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          opacity: textOpacity,
          transform: `scale(${textScale})`,
          textAlign: "center",
        }}>
          ככה.
        </div>

        {/* Sub text */}
        <div style={{
          fontFamily: PRISM.fontBody, fontSize: 44, fontWeight: 500,
          color: PRISM.textMuted, opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          textAlign: "center",
        }}>
          פרומפט מדויק = תוצאה מדויקת
        </div>
      </div>
    </AbsoluteFill>
  );
};
