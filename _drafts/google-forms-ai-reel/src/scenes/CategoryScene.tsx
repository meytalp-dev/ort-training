import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { STYLE, bgStyle } from "../styles";
import { Particles } from "../Particles";
import { playpenFamily } from "../fonts";

// Scene 1: Typing Reveal — "Google Forms + AI = ?" typed character by character
// Handwriting font, blinking cursor, soft entrance
export const CategoryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const text = "Google Forms + AI = ?";
  const typingStart = 8;
  const typingEnd = 70;

  const typedChars = Math.floor(
    interpolate(frame, [typingStart, typingEnd], [0, text.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const visibleText = text.slice(0, typedChars);

  // Blinking cursor
  const cursorVisible = Math.sin(frame / 3) > 0;
  const showCursor = typedChars < text.length || frame < typingEnd + 10;

  // Subtle scale-in for the whole text container
  const containerScale = spring({
    frame: Math.max(0, frame - 4),
    fps,
    from: 0.85,
    to: 1,
    config: { damping: 12, mass: 0.6 },
  });
  const containerOpacity = interpolate(frame, [4, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Decorative line beneath text
  const lineWidth = interpolate(frame, [typingEnd - 10, typingEnd + 10], [0, 400], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Floating "tip" badge at top
  const badgeStart = 2;
  const badgeScale = spring({
    frame: Math.max(0, frame - badgeStart),
    fps,
    from: 0,
    to: 1,
    config: { damping: 5, mass: 0.3, stiffness: 250 },
  });

  // Gentle sparkles appearing around the question mark
  const sparkles = [
    { x: 280, y: -30, delay: typingEnd + 2, size: 12 },
    { x: -260, y: 20, delay: typingEnd + 5, size: 10 },
    { x: 200, y: 50, delay: typingEnd + 8, size: 14 },
    { x: -180, y: -50, delay: typingEnd + 4, size: 8 },
  ];

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          zIndex: 2,
        }}
      >
        {/* Tip badge */}
        <div
          style={{
            background: `linear-gradient(135deg, ${STYLE.accent} 0%, ${STYLE.accentDark} 100%)`,
            borderRadius: 20,
            padding: "10px 36px",
            transform: `scale(${badgeScale})`,
            boxShadow: `0 6px 20px ${STYLE.accent}30`,
          }}
        >
          <span
            style={{
              fontFamily: STYLE.fontHeading,
              fontSize: 30,
              fontWeight: 700,
              color: STYLE.textLight,
            }}
          >
            טיפ יומי
          </span>
        </div>

        {/* Typing text */}
        <div
          style={{
            transform: `scale(${containerScale})`,
            opacity: containerOpacity,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            direction: "ltr",
          }}
        >
          <span
            style={{
              fontFamily: playpenFamily,
              fontSize: 72,
              fontWeight: 400,
              color: STYLE.textDark,
              whiteSpace: "nowrap",
              textShadow: `0 4px 20px rgba(123,97,255,0.1)`,
            }}
          >
            {visibleText}
          </span>
          {showCursor && (
            <span
              style={{
                display: "inline-block",
                width: 4,
                height: 68,
                background: STYLE.accent,
                opacity: cursorVisible ? 1 : 0,
                marginLeft: 4,
                borderRadius: 2,
              }}
            />
          )}
        </div>

        {/* Decorative line */}
        <div
          style={{
            width: lineWidth,
            height: 4,
            borderRadius: 2,
            background: `linear-gradient(90deg, ${STYLE.accent}, ${STYLE.greenLight})`,
            opacity: 0.5,
          }}
        />

        {/* Sparkles */}
        {sparkles.map((s, i) => {
          const sF = Math.max(0, frame - s.delay);
          const sScale = spring({
            frame: sF,
            fps,
            from: 0,
            to: 1,
            config: { damping: 4, mass: 0.2, stiffness: 300 },
          });
          const twinkle = 0.4 + Math.sin((frame + i * 10) / 3) * 0.6;
          return (
            <div
              key={`spark-${i}`}
              style={{
                position: "absolute",
                top: "48%",
                left: "50%",
                transform: `translate(calc(-50% + ${s.x}px), calc(-50% + ${s.y}px)) scale(${sScale}) rotate(45deg)`,
                width: s.size,
                height: s.size,
                background: i % 2 === 0 ? STYLE.accent : STYLE.greenLight,
                opacity: twinkle * 0.5,
                boxShadow: `0 0 ${s.size * 2}px ${STYLE.accentLight}40`,
                zIndex: 3,
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
