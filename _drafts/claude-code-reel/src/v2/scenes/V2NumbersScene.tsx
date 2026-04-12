import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { PRISM, prismBg, prismGradient } from "../prismStyles";
import { PrismParticles } from "../PrismParticles";

// COUNTER ROLL + CONFETTI — Three ribbon cards slide in from alternating sides ->
// counter rolls up to final value -> confetti burst on each -> tagline at bottom
export const V2NumbersScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cards = [
    {
      value: "100+", numericTarget: 100, suffix: "+",
      label: "תוצרים",
      enterFrame: 4,
      fromX: 600,  // from right
      gradientAngle: 135,
      color1: PRISM.indigo, color2: PRISM.teal,
    },
    {
      value: "0", numericTarget: 0, suffix: "",
      label: "שורות קוד",
      enterFrame: 24,
      fromX: -600, // from left
      gradientAngle: 90,
      color1: PRISM.teal, color2: PRISM.rose,
    },
    {
      value: "1", numericTarget: 1, suffix: "",
      label: "מורה",
      enterFrame: 44,
      fromX: 600,  // from right
      gradientAngle: 180,
      color1: PRISM.violet, color2: PRISM.indigo,
    },
  ];

  // Positions: stacked vertically
  const cardYPositions = [-340, 0, 340];

  // === Tagline at bottom (frame 80+) ===
  const tagStart = 80;
  const tagOpacity = interpolate(frame, [tagStart, tagStart + 6], [0, 1], { extrapolateRight: "clamp" });
  const tagY = spring({
    frame: Math.max(0, frame - tagStart), fps,
    from: 30, to: 0, config: { damping: 8, mass: 0.5 },
  });

  return (
    <AbsoluteFill style={prismBg}>
      <PrismParticles />

      {/* === Three ribbon cards === */}
      {cards.map((card, i) => {
        const f = Math.max(0, frame - card.enterFrame);

        // Slide in from alternating sides
        const slideX = spring({
          frame: f, fps, from: card.fromX, to: 0,
          config: { damping: 10, mass: 0.6 },
        });
        const slideOpacity = interpolate(f, [0, 5], [0, 1], { extrapolateRight: "clamp" });

        // Counter roll animation
        const counterDuration = 20;
        const counterProgress = interpolate(f, [6, 6 + counterDuration], [0, 1], {
          extrapolateRight: "clamp", extrapolateLeft: "clamp",
        });
        // Eased counter value
        const easedProgress = counterProgress * counterProgress * (3 - 2 * counterProgress); // smoothstep
        const currentNum = Math.round(easedProgress * card.numericTarget);
        const displayValue = `${currentNum}${card.suffix}`;
        const counterDone = counterProgress >= 1;
        const counterDoneFrame = card.enterFrame + 6 + counterDuration;

        // Confetti burst when counter hits final number
        const confettiBurstFrame = counterDoneFrame;
        const confettiPieces = Array.from({ length: 10 }, (_, j) => {
          const angle = (j / 10) * Math.PI * 2;
          const dist = frame >= confettiBurstFrame
            ? spring({
                frame: frame - confettiBurstFrame, fps,
                from: 0, to: 120 + (j % 3) * 50,
                config: { damping: 14, mass: 0.7 },
              })
            : 0;
          const cOpacity = frame >= confettiBurstFrame
            ? interpolate(frame, [confettiBurstFrame, confettiBurstFrame + 3, confettiBurstFrame + 16], [0, 0.7, 0], { extrapolateRight: "clamp" })
            : 0;
          const colors = [PRISM.indigo, PRISM.teal, PRISM.rose, PRISM.violet, PRISM.sky, PRISM.amber];
          return {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            color: colors[j % colors.length],
            opacity: cOpacity,
            w: 10 + (j % 4) * 3,
            h: 5 + (j % 3) * 2,
            rotate: frame * 3 + j * 36,
          };
        });

        const cardFloat = Math.sin((frame + i * 30) / 14) * 3;

        return (
          <React.Fragment key={i}>
            {/* Confetti pieces for this card */}
            {confettiPieces.map((c, j) => (
              <div key={`conf-${i}-${j}`} style={{
                position: "absolute",
                top: `calc(50% + ${cardYPositions[i] + c.y}px)`,
                left: `calc(50% + ${c.x}px)`,
                width: c.w, height: c.h, borderRadius: 2,
                background: c.color, opacity: c.opacity,
                transform: `rotate(${c.rotate}deg)`,
                zIndex: 8,
              }} />
            ))}

            {/* Ribbon card */}
            <div style={{
              position: "absolute",
              top: `calc(50% + ${cardYPositions[i] + cardFloat}px)`,
              left: "50%",
              transform: `translate(-50%, -50%) translateX(${slideX}px)`,
              opacity: slideOpacity,
              zIndex: 3,
            }}>
              {/* Parallax shadow layers */}
              <div style={{
                position: "absolute", top: 10, left: -8,
                width: 900, height: "100%",
                background: `${card.color1}10`,
                borderRadius: 20,
                opacity: 0.5,
              }} />
              <div style={{
                position: "absolute", top: 5, left: -4,
                width: 900, height: "100%",
                background: `${card.color2}08`,
                borderRadius: 18,
                opacity: 0.6,
              }} />

              {/* Main ribbon card */}
              <div style={{
                position: "relative",
                width: 900, padding: "28px 48px",
                background: PRISM.card,
                borderRadius: 20,
                boxShadow: PRISM.shadow,
                border: `1px solid ${card.color1}12`,
                display: "flex", alignItems: "center", gap: 32,
                direction: "rtl",
              }}>
                {/* Left gradient accent bar */}
                <div style={{
                  position: "absolute", right: 0, top: 0, bottom: 0,
                  width: 6, borderRadius: "0 20px 20px 0",
                  background: `linear-gradient(${card.gradientAngle}deg, ${card.color1}, ${card.color2})`,
                }} />

                {/* Counter number */}
                <div style={{
                  fontFamily: PRISM.fontHeading, fontSize: 80, fontWeight: 900,
                  background: `linear-gradient(${card.gradientAngle}deg, ${card.color1}, ${card.color2})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1, minWidth: 180,
                  textAlign: "center",
                }}>
                  {displayValue}
                </div>

                {/* Label */}
                <div style={{
                  fontFamily: PRISM.fontHeading, fontSize: 48, fontWeight: 700,
                  color: PRISM.textDark,
                }}>
                  {card.label}
                </div>

                {/* Subtle checkmark when counter done */}
                {counterDone && (
                  <div style={{
                    marginRight: "auto",
                    opacity: interpolate(f, [6 + counterDuration, 6 + counterDuration + 4], [0, 0.4], { extrapolateRight: "clamp" }),
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                      stroke={card.color1} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* === Tagline at bottom === */}
      <div style={{
        position: "absolute", bottom: 140, left: "50%",
        transform: `translateX(-50%) translateY(${tagY}px)`,
        opacity: tagOpacity, zIndex: 5,
      }}>
        <div style={{
          background: PRISM.card,
          borderRadius: 60, padding: "18px 52px",
          boxShadow: PRISM.shadow,
          border: `1px solid ${PRISM.indigo}10`,
        }}>
          <span style={{
            fontFamily: PRISM.fontHeading, fontSize: 44, fontWeight: 900,
            color: PRISM.textDark,
          }}>
            בלי קוד.{" "}
            <span style={{
              background: prismGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              בלי גבולות.
            </span>
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
