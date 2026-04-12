import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { STYLE, bgStyle } from "../styles";
import { Particles } from "../Particles";
import { StarIcon, KeyIcon, CheckIcon, QuestionIcon } from "../Icons";

// Scene 6: Stack Build — bonus tip cards stack like card deck,
// each landing with bounce. Long scene (300 frames / 10s).
// "טיפ בונוס: תבקשו גם מפתח תשובות + הסברים לכל שאלה"
export const BenefitsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "Bonus" badge slams
  const bonusScale = spring({
    frame,
    fps,
    from: 5,
    to: 1,
    config: { damping: 5, mass: 0.3, stiffness: 200 },
  });
  const bonusOpacity = interpolate(frame, [0, 3], [0, 1], { extrapolateRight: "clamp" });

  // Flash on slam
  const flashOpacity = interpolate(frame, [0, 2, 8], [0, 0.2, 0], { extrapolateRight: "clamp" });

  // Stacking cards — each one drops in from above with bounce
  const cards = [
    {
      title: "Suggest Questions",
      subtitle: "AI מציע שאלות נוספות לבד",
      icon: "key" as const,
      color: STYLE.gold,
      start: 20,
    },
    {
      title: "הסברים לכל שאלה",
      subtitle: "מי שענה מבין למה טעה",
      icon: "question" as const,
      color: STYLE.accent,
      start: 65,
    },
    {
      title: "רמות קושי מותאמות",
      subtitle: "שאלות לכל רמה ולכל קהל",
      icon: "check" as const,
      color: STYLE.green,
      start: 110,
    },
    {
      title: "חוסכים שעות עבודה",
      subtitle: "מה שלקח שעה — לוקח 5 דקות",
      icon: "star" as const,
      color: STYLE.accentDark,
      start: 155,
    },
  ];

  const iconMap = {
    key: KeyIcon,
    question: QuestionIcon,
    check: CheckIcon,
    star: StarIcon,
  };

  // Main summary text appears after all cards
  const summaryStart = 210;
  const summaryOpacity = interpolate(frame, [summaryStart, summaryStart + 10], [0, 1], {
    extrapolateRight: "clamp",
  });
  const summaryScale = spring({
    frame: Math.max(0, frame - summaryStart),
    fps,
    from: 0.8,
    to: 1,
    config: { damping: 7, mass: 0.5 },
  });

  const floatY = Math.sin(frame / 15) * 4;

  // Gold shimmer across all cards
  const shimmerX = interpolate(frame, [20, 280], [-300, 1400], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      {/* Flash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle, ${STYLE.gold}40 0%, transparent 60%)`,
          opacity: flashOpacity,
          zIndex: 3,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 120,
          gap: 20,
          zIndex: 2,
          transform: `translateY(${floatY}px)`,
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        {/* Bonus badge */}
        <div
          style={{
            background: `linear-gradient(135deg, ${STYLE.gold} 0%, #E8A917 100%)`,
            borderRadius: 20,
            padding: "12px 44px",
            transform: `scale(${bonusScale})`,
            opacity: bonusOpacity,
            boxShadow: `0 8px 28px ${STYLE.gold}40`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <StarIcon size={32} color="white" />
          <span
            style={{
              fontFamily: STYLE.fontHeading,
              fontSize: 34,
              fontWeight: 800,
              color: "white",
            }}
          >
            טיפ בונוס
          </span>
          <StarIcon size={32} color="white" />
        </div>

        {/* Stacking cards */}
        <div
          style={{
            position: "relative",
            width: 900,
            height: 900,
          }}
        >
          {cards.map((card, i) => {
            const cardFrame = Math.max(0, frame - card.start);

            // Drop from above with spring bounce
            const dropY = spring({
              frame: cardFrame,
              fps,
              from: -400,
              to: i * 190,
              config: { damping: 6, mass: 0.5, stiffness: 150 },
            });

            const cardOpacity = interpolate(cardFrame, [0, 5], [0, 1], {
              extrapolateRight: "clamp",
            });

            // Slight rotation on land
            const landRotate = spring({
              frame: cardFrame,
              fps,
              from: (i % 2 === 0 ? 1 : -1) * 5,
              to: 0,
              config: { damping: 8, mass: 0.4 },
            });

            // Scale bounce on land
            const landScale = spring({
              frame: cardFrame,
              fps,
              from: 1.08,
              to: 1,
              config: { damping: 5, mass: 0.3, stiffness: 300 },
            });

            // Shadow intensifies on landing
            const shadowIntensity = interpolate(cardFrame, [0, 5, 15], [0, 0.15, 0.08], {
              extrapolateRight: "clamp",
            });

            const IconComponent = iconMap[card.icon];

            return (
              <div
                key={`card-${i}`}
                style={{
                  position: "absolute",
                  left: 0,
                  width: "100%",
                  transform: `translateY(${dropY}px) rotate(${landRotate}deg) scale(${landScale})`,
                  opacity: cardOpacity,
                  zIndex: 10 + i,
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(20px)",
                    borderRadius: STYLE.cardRadius,
                    padding: "28px 40px",
                    border: `2px solid ${card.color}25`,
                    boxShadow: `0 ${8 + shadowIntensity * 40}px ${24 + shadowIntensity * 60}px rgba(0,0,0,${0.04 + shadowIntensity})`,
                    display: "flex",
                    alignItems: "center",
                    gap: 24,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {/* Card shimmer */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: shimmerX - i * 100,
                      width: 80,
                      height: "100%",
                      background: `linear-gradient(90deg, transparent, ${card.color}10, transparent)`,
                      transform: "skewX(-20deg)",
                      pointerEvents: "none",
                    }}
                  />

                  {/* Color accent bar */}
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                      width: 6,
                      height: "100%",
                      background: card.color,
                      borderRadius: "0 0 0 0",
                    }}
                  />

                  {/* Icon */}
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 16,
                      background: `${card.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <IconComponent size={36} color={card.color} />
                  </div>

                  {/* Text */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span
                      style={{
                        fontFamily: STYLE.fontBody,
                        fontSize: 38,
                        fontWeight: 700,
                        color: STYLE.textDark,
                        lineHeight: 1.3,
                      }}
                    >
                      {card.title}
                    </span>
                    <span
                      style={{
                        fontFamily: STYLE.fontBody,
                        fontSize: 30,
                        fontWeight: 500,
                        color: STYLE.textMuted,
                      }}
                    >
                      {card.subtitle}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary line after all cards */}
        {frame >= summaryStart && (
          <div
            style={{
              opacity: summaryOpacity,
              transform: `scale(${summaryScale})`,
              textAlign: "center",
              marginTop: -80,
            }}
          >
            <span
              style={{
                fontFamily: STYLE.fontBody,
                fontSize: 36,
                fontWeight: 600,
                color: STYLE.accent,
              }}
            >
              הכל מובנה ב-Forms, הכל בקליק
            </span>
          </div>
        )}
      </div>

      {/* Floating stars decoration */}
      {[
        { x: 80, y: 400, delay: 25, size: 28 },
        { x: 950, y: 600, delay: 70, size: 24 },
        { x: 120, y: 1200, delay: 115, size: 30 },
        { x: 900, y: 1400, delay: 160, size: 22 },
      ].map((s, i) => {
        const sF = Math.max(0, frame - s.delay);
        const sScale = spring({
          frame: sF,
          fps,
          from: 0,
          to: 1,
          config: { damping: 4, mass: 0.2 },
        });
        const twinkle = 0.4 + Math.sin((frame + i * 15) / 4) * 0.4;
        const sFloat = Math.sin((frame + i * 20) / 12) * 8;
        return (
          <div
            key={`fstar-${i}`}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y + sFloat,
              transform: `scale(${sScale})`,
              opacity: twinkle,
              zIndex: 1,
            }}
          >
            <StarIcon size={s.size} color={STYLE.gold} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
