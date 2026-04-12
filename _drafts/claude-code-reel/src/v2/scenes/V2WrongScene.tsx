import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { PRISM, prismBg, prismGradient } from "../prismStyles";
import { PrismParticles } from "../PrismParticles";

// STAMP REJECT — Terminal card appears -> text types letter by letter ->
// red STAMP slams diagonally -> "לא ככה." with gradient strikethrough
export const V2WrongScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // === Card enters with parallax shadow layers ===
  const cardScale = spring({ frame, fps, from: 0.3, to: 1, config: { damping: 7, mass: 0.5 } });
  const cardOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const floatY = Math.sin(frame / 15) * 4;

  // === PHASE 1: Text "תבנה לי מצגת" types letter by letter (frame 8-30) ===
  const fullText = "תבנה לי מצגת";
  const typingStart = 8;
  const charsPerFrame = 0.7;
  const visibleChars = Math.min(
    fullText.length,
    Math.floor(Math.max(0, frame - typingStart) * charsPerFrame)
  );
  const typedText = fullText.slice(0, visibleChars);
  const cursorBlink = Math.sin(frame / 3) > 0;
  const typingDone = visibleChars >= fullText.length;
  const typingDoneFrame = typingStart + Math.ceil(fullText.length / charsPerFrame);

  // === PHASE 2: Red STAMP slams down diagonally (frame ~32) ===
  const stampStart = typingDoneFrame + 4;
  const stampScale = spring({
    frame: Math.max(0, frame - stampStart), fps,
    from: 5, to: 1,
    config: { damping: 4, mass: 0.3, stiffness: 200 },
  });
  const stampOpacity = interpolate(frame, [stampStart, stampStart + 2], [0, 1], { extrapolateRight: "clamp" });
  const stampRotate = -18;

  // Screen shake on stamp
  const stampShakeActive = frame >= stampStart && frame <= stampStart + 10;
  const shakeX = stampShakeActive ? Math.sin(frame * 12) * (stampStart + 10 - frame) * 2 : 0;
  const shakeY = stampShakeActive ? Math.cos(frame * 10) * (stampStart + 10 - frame) * 1.5 : 0;

  // === PHASE 3: "לא ככה." fades up with gradient strikethrough (frame ~44) ===
  const textStart = stampStart + 12;
  const finalTextOpacity = interpolate(frame, [textStart, textStart + 6], [0, 1], { extrapolateRight: "clamp" });
  const finalTextY = spring({
    frame: Math.max(0, frame - textStart), fps,
    from: 30, to: 0, config: { damping: 10, mass: 0.5 },
  });

  // Strikethrough line sweeps across
  const strikeProgress = interpolate(frame, [textStart + 4, textStart + 14], [0, 100], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // === PHASE 4: Sub text (frame ~54) ===
  const subStart = textStart + 10;
  const subOpacity = interpolate(frame, [subStart, subStart + 6], [0, 1], { extrapolateRight: "clamp" });
  const subY = spring({
    frame: Math.max(0, frame - subStart), fps,
    from: 25, to: 0, config: { damping: 10 },
  });

  return (
    <AbsoluteFill style={{
      ...prismBg,
      transform: `translate(${shakeX}px, ${shakeY}px)`,
    }}>
      <PrismParticles />

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 32, zIndex: 2,
      }}>
        {/* Terminal card with parallax shadow layers */}
        <div style={{ position: "relative" }}>
          {/* Shadow layer 3 (deepest) */}
          <div style={{
            position: "absolute", top: 16, left: -12,
            width: 920, height: "100%",
            background: `${PRISM.indigo}08`,
            borderRadius: PRISM.cardRadius + 4,
            transform: `translateY(${floatY + 4}px) scale(${cardScale * 0.98})`,
            opacity: cardOpacity * 0.5,
          }} />
          {/* Shadow layer 2 */}
          <div style={{
            position: "absolute", top: 10, left: -7,
            width: 920, height: "100%",
            background: `${PRISM.violet}10`,
            borderRadius: PRISM.cardRadius + 2,
            transform: `translateY(${floatY + 2}px) scale(${cardScale * 0.99})`,
            opacity: cardOpacity * 0.6,
          }} />
          {/* Shadow layer 1 */}
          <div style={{
            position: "absolute", top: 5, left: -3,
            width: 920, height: "100%",
            background: `${PRISM.rose}08`,
            borderRadius: PRISM.cardRadius,
            transform: `translateY(${floatY + 1}px) scale(${cardScale * 0.995})`,
            opacity: cardOpacity * 0.7,
          }} />

          {/* Main terminal card — light style */}
          <div style={{
            position: "relative",
            background: PRISM.card,
            borderRadius: PRISM.cardRadius,
            width: 920, overflow: "visible",
            boxShadow: PRISM.shadowDeep,
            border: `1px solid ${PRISM.indigo}15`,
            transform: `translateY(${floatY}px) scale(${cardScale})`,
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

              {/* Typing text */}
              <div style={{
                background: `${PRISM.indigo}06`,
                borderRadius: 14, padding: "18px 24px",
                border: `1px solid ${PRISM.indigo}12`,
                direction: "rtl", textAlign: "right",
                minHeight: 60,
              }}>
                <span style={{
                  color: PRISM.textDark,
                  fontSize: 44, fontFamily: PRISM.fontBody,
                }}>
                  {typedText}
                  {!typingDone && cursorBlink && (
                    <span style={{ color: PRISM.indigo, fontWeight: 300 }}>|</span>
                  )}
                </span>
              </div>
            </div>

            {/* STAMP overlay — slams diagonally */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: `translate(-50%, -50%) rotate(${stampRotate}deg) scale(${stampScale})`,
              opacity: stampOpacity, zIndex: 3,
              border: `8px solid ${PRISM.rose}`,
              borderRadius: 16,
              padding: "14px 40px",
            }}>
              <span style={{
                fontFamily: PRISM.fontHeading,
                fontSize: 72, fontWeight: 900,
                color: PRISM.rose,
                letterSpacing: 12,
                textTransform: "uppercase",
              }}>
                REJECTED
              </span>
            </div>
          </div>
        </div>

        {/* "לא ככה." — fades up with gradient strikethrough */}
        <div style={{
          position: "relative",
          opacity: finalTextOpacity,
          transform: `translateY(${finalTextY}px)`,
          textAlign: "center",
        }}>
          <span style={{
            fontFamily: PRISM.fontHeading, fontSize: 64, fontWeight: 900,
            background: prismGradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            לא ככה.
          </span>
          {/* Gradient strikethrough line */}
          <div style={{
            position: "absolute", top: "55%", right: 0,
            width: `${strikeProgress}%`, height: 5,
            background: prismGradient,
            borderRadius: 3,
          }} />
        </div>

        {/* Sub text */}
        <div style={{
          fontFamily: PRISM.fontBody, fontSize: 44, fontWeight: 500,
          color: PRISM.textMuted, opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          textAlign: "center",
        }}>
          לא בקשה גנרית.
        </div>
      </div>
    </AbsoluteFill>
  );
};
