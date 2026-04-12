import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { STYLE, bgStyle } from "../styles";
import { Particles } from "../Particles";
import { CheckIcon, QuizIcon } from "../Icons";

// Scene 5: Messy -> Organized — scattered question pills reorganize
// into a neat quiz card, Z's float up during organize.
// Text: "מדביקים, מפעילים — יש בוחן מוכן!"
export const Feature3Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Badge "03"
  const badgeScale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 5, mass: 0.3, stiffness: 250 },
  });

  // Question pills — start scattered, then organize
  const pills = [
    { text: "מה גורם לשינוי אקלים?", scatterX: -280, scatterY: -350, finalY: 0 },
    { text: "איך מודדים שביעות רצון?", scatterX: 300, scatterY: -200, finalY: 70 },
    { text: "מה ההבדל בין סוגי תקציב?", scatterX: -200, scatterY: 100, finalY: 140 },
    { text: "מהי אסטרטגיית שיווק?", scatterX: 250, scatterY: 300, finalY: 210 },
    { text: "איך בוחרים כלי AI?", scatterX: -320, scatterY: 400, finalY: 280 },
  ];

  // Phase 1: Pills scattered (frames 0-40)
  // Phase 2: Pills organize (frames 40-70)
  // Phase 3: Card forms around them (frames 70+)

  const organizeStart = 40;
  const cardFormStart = 72;

  // Z's float up during organizing
  const zees = [
    { x: -250, baseY: 200, delay: 45, size: 44 },
    { x: 280, baseY: 150, delay: 50, size: 36 },
    { x: -180, baseY: 300, delay: 55, size: 40 },
    { x: 200, baseY: 250, delay: 48, size: 32 },
  ];

  // Card background
  const cardScale = spring({
    frame: Math.max(0, frame - cardFormStart),
    fps,
    from: 0.6,
    to: 1,
    config: { damping: 7, mass: 0.5 },
  });
  const cardOpacity = interpolate(frame, [cardFormStart, cardFormStart + 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Title text
  const titleStart = cardFormStart + 10;
  const titleOpacity = interpolate(frame, [titleStart, titleStart + 8], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = spring({
    frame: Math.max(0, frame - titleStart),
    fps,
    from: 20,
    to: 0,
    config: { damping: 8, mass: 0.5 },
  });

  // Check mark at the end
  const checkStart = cardFormStart + 25;
  const checkScale = spring({
    frame: Math.max(0, frame - checkStart),
    fps,
    from: 0,
    to: 1,
    config: { damping: 3, mass: 0.2, stiffness: 400 },
  });

  // Celebration sparkle
  const sparkleStart = checkStart + 5;
  const sparkles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const dist = frame >= sparkleStart
      ? spring({
          frame: frame - sparkleStart,
          fps,
          from: 0,
          to: 60 + i * 15,
          config: { damping: 14, mass: 0.5 },
        })
      : 0;
    const opacity = frame >= sparkleStart
      ? interpolate(frame, [sparkleStart, sparkleStart + 4, sparkleStart + 20], [0, 0.6, 0], {
          extrapolateRight: "clamp",
        })
      : 0;
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      opacity,
      color: i % 3 === 0 ? STYLE.green : i % 3 === 1 ? STYLE.accent : STYLE.greenLight,
    };
  });

  const floatY = Math.sin(frame / 15) * 4;

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          zIndex: 2,
          transform: `translateY(${floatY}px)`,
          position: "relative",
        }}
      >
        {/* Badge "03" */}
        <div
          style={{
            background: STYLE.green,
            borderRadius: 20,
            padding: "10px 32px",
            transform: `scale(${badgeScale})`,
            boxShadow: `0 6px 20px ${STYLE.green}30`,
          }}
        >
          <span
            style={{
              fontFamily: STYLE.fontHeading,
              fontSize: 28,
              fontWeight: 700,
              color: STYLE.textLight,
            }}
          >
            03
          </span>
        </div>

        {/* Card background */}
        <div
          style={{
            width: 920,
            minHeight: 520,
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(20px)",
            borderRadius: STYLE.cardRadius,
            padding: STYLE.cardPadding,
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: STYLE.shadow,
            transform: `scale(${cardScale})`,
            opacity: cardOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            position: "relative",
          }}
        >
          {/* Quiz icon */}
          <div style={{ opacity: titleOpacity }}>
            <QuizIcon size={56} color={STYLE.accent} />
          </div>

          {/* Title */}
          <div
            style={{
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontFamily: STYLE.fontBody,
                fontSize: 48,
                fontWeight: 700,
                color: STYLE.textDark,
                lineHeight: 1.4,
              }}
            >
              Gemini מייצר הכל —
            </span>
            <br />
            <span
              style={{
                fontFamily: STYLE.fontBody,
                fontSize: 52,
                fontWeight: 800,
                color: STYLE.accent,
              }}
            >
              בוחן מוכן לשליחה!
            </span>
          </div>

          {/* Checkmark */}
          <div style={{ transform: `scale(${checkScale})` }}>
            <CheckIcon size={56} color={STYLE.green} />
          </div>
        </div>

        {/* Scattered / organizing pills */}
        {pills.map((pill, i) => {
          const organizeProgress = spring({
            frame: Math.max(0, frame - organizeStart - i * 4),
            fps,
            from: 0,
            to: 1,
            config: { damping: 8, mass: 0.5, stiffness: 120 },
          });

          const pillX = interpolate(organizeProgress, [0, 1], [pill.scatterX, 0]);
          const pillY = interpolate(organizeProgress, [0, 1], [pill.scatterY, pill.finalY - 180]);
          const pillRotate = interpolate(organizeProgress, [0, 1], [(i % 2 === 0 ? 1 : -1) * (8 + i * 3), 0]);
          const pillScale = interpolate(organizeProgress, [0, 0.5, 1], [0.9, 1.05, 1], {
            extrapolateRight: "clamp",
          });

          // Pill entrance
          const pillEntrance = spring({
            frame: Math.max(0, frame - 5 - i * 3),
            fps,
            from: 0,
            to: 1,
            config: { damping: 6, mass: 0.3 },
          });

          // After card forms, pills fade into card
          const pillFadeAfterCard = frame >= cardFormStart
            ? interpolate(frame, [cardFormStart, cardFormStart + 12], [1, 0], { extrapolateRight: "clamp" })
            : 1;

          // Gentle wobble while scattered
          const wobble = organizeProgress < 0.5
            ? Math.sin((frame + i * 20) / 8) * 5
            : 0;

          return (
            <div
              key={`pill-${i}`}
              style={{
                position: "absolute",
                transform: `translate(calc(${pillX}px), calc(${pillY}px)) rotate(${pillRotate + wobble}deg) scale(${pillScale})`,
                opacity: pillEntrance * pillFadeAfterCard,
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(12px)",
                borderRadius: 50,
                padding: "14px 32px",
                border: `2px solid ${i % 2 === 0 ? STYLE.accent : STYLE.greenLight}30`,
                boxShadow: `0 4px 16px rgba(123,97,255,0.08)`,
                whiteSpace: "nowrap",
                zIndex: 3,
              }}
            >
              <span
                style={{
                  fontFamily: STYLE.fontBody,
                  fontSize: 28,
                  fontWeight: 600,
                  color: STYLE.textDark,
                }}
              >
                {pill.text}
              </span>
            </div>
          );
        })}

        {/* Z's removed — unclear metaphor */}

        {/* Celebration sparkles */}
        {sparkles.map((s, i) => (
          <div
            key={`sp-${i}`}
            style={{
              position: "absolute",
              bottom: "30%",
              left: "50%",
              transform: `translate(calc(-50% + ${s.x}px), ${s.y}px)`,
              width: 8 + (i % 3) * 4,
              height: 8 + (i % 3) * 4,
              borderRadius: i % 2 === 0 ? "50%" : "2px",
              background: s.color,
              opacity: s.opacity,
              zIndex: 5,
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
