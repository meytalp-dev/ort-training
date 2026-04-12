import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { STYLE, bgStyle } from "../styles";
import { Particles } from "../Particles";
import { ClockIcon, ZapIcon } from "../Icons";

// Morph Transform — "שעתיים+" morphs/shrinks into "5 דקות" with confetti explosion
export const Feature3Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: "שעתיים+" appears big (0-40)
  const beforeStart = 8;
  const beforeScale = spring({
    frame: Math.max(0, frame - beforeStart),
    fps,
    from: 0,
    to: 1,
    config: { damping: 8, mass: 0.5, stiffness: 140 },
  });

  // Phase 2: Morph transition (40-70)
  const morphStart = 45;
  const morphProgress = spring({
    frame: Math.max(0, frame - morphStart),
    fps,
    from: 0,
    to: 1,
    config: { damping: 12, mass: 0.8, stiffness: 60 },
  });

  // "שעתיים+" shrinks and fades
  const beforeMorphScale = interpolate(morphProgress, [0, 0.5], [1, 0.3], {
    extrapolateRight: "clamp",
  });
  const beforeMorphOpacity = interpolate(morphProgress, [0, 0.5], [1, 0], {
    extrapolateRight: "clamp",
  });

  // "5 דקות" grows from small
  const afterMorphScale = interpolate(morphProgress, [0.3, 1], [0.2, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const afterMorphOpacity = interpolate(morphProgress, [0.3, 0.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Clock icon (before) and Zap icon (after) swap
  const clockOpacity = interpolate(morphProgress, [0, 0.4], [1, 0], {
    extrapolateRight: "clamp",
  });
  const zapOpacity = interpolate(morphProgress, [0.4, 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const zapScale = spring({
    frame: Math.max(0, frame - morphStart - 15),
    fps,
    from: 0,
    to: 1,
    config: { damping: 5, mass: 0.3, stiffness: 200 },
  });

  // Flash on morph completion
  const flashStart = morphStart + 12;
  const flashOpacity = interpolate(
    frame,
    [flashStart, flashStart + 3, flashStart + 15],
    [0, 0.35, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Screen shake on morph
  // Removed shake for consistency with gentle hook
  const shakeX = 0;
  const shakeY = 0;

  // Confetti particles explosion after morph
  const confettiStart = morphStart + 10;
  const confettiColors = [
    STYLE.mint, STYLE.pink, STYLE.lavender, STYLE.skyBlue,
    STYLE.mint, STYLE.pink, STYLE.lavender, STYLE.skyBlue,
  ];
  const confettiParticles = Array.from({ length: 30 }, (_, i) => {
    const angle = (i / 30) * Math.PI * 2 + (i * 0.3);
    const speed = 6 + (i % 5) * 3;
    const size = 8 + (i % 4) * 6;
    const rotateSpeed = (i % 2 === 0 ? 1 : -1) * (3 + i % 5);
    return { angle, speed, size, rotateSpeed, color: confettiColors[i % confettiColors.length] };
  });

  // Arrow from before to after
  const arrowStart = morphStart - 5;
  const arrowOpacity = interpolate(
    frame,
    [arrowStart, arrowStart + 5, morphStart + 5, morphStart + 10],
    [0, 0.6, 0.6, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Celebration text
  const celebStart = morphStart + 25;
  const celebScale = spring({
    frame: Math.max(0, frame - celebStart),
    fps,
    from: 0,
    to: 1,
    config: { damping: 6, mass: 0.3, stiffness: 200 },
  });
  const celebOpacity = interpolate(
    frame,
    [celebStart, celebStart + 5],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        ...bgStyle,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      <Particles />

      {/* Flash overlay */}
      <div
        style={{
          position: "absolute",
          inset: -20,
          background: `radial-gradient(circle, white 0%, ${STYLE.mint}30 50%, transparent 80%)`,
          opacity: flashOpacity,
          zIndex: 25,
          pointerEvents: "none",
        }}
      />

      {/* Clock icon — fades out */}
      <div
        style={{
          position: "absolute",
          top: 380,
          left: "50%",
          transform: `translate(-50%, 0) scale(${1 - morphProgress * 0.5})`,
          opacity: clockOpacity,
          zIndex: 15,
        }}
      >
        <ClockIcon size={120} color={STYLE.pink} />
      </div>

      {/* Zap icon — fades in */}
      <div
        style={{
          position: "absolute",
          top: 380,
          left: "50%",
          transform: `translate(-50%, 0) scale(${zapScale})`,
          opacity: zapOpacity,
          zIndex: 15,
        }}
      >
        <ZapIcon size={120} color={STYLE.mint} />
      </div>

      {/* "שעתיים+" text — morphs out */}
      <div
        style={{
          position: "absolute",
          top: "46%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${beforeScale * beforeMorphScale})`,
          opacity: frame >= beforeStart ? beforeMorphOpacity : 0,
          zIndex: 20,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: STYLE.fontHeading,
            fontSize: 130,
            fontWeight: 900,
            color: STYLE.pink,
            textShadow: `0 6px 40px ${STYLE.pink}30`,
            whiteSpace: "nowrap",
          }}
        >
          שעתיים+
        </div>
        <div
          style={{
            fontFamily: STYLE.fontBody,
            fontSize: 38,
            color: STYLE.textMuted,
            marginTop: 12,
          }}
        >
          הכנת מבחן אחד
        </div>
      </div>

      {/* "5 דקות" text — morphs in */}
      <div
        style={{
          position: "absolute",
          top: "46%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${afterMorphScale})`,
          opacity: afterMorphOpacity,
          zIndex: 20,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: STYLE.fontHeading,
            fontSize: 140,
            fontWeight: 900,
            color: STYLE.mint,
            textShadow: `0 6px 40px ${STYLE.mint}40`,
            whiteSpace: "nowrap",
          }}
        >
          5 דקות
        </div>
        <div
          style={{
            fontFamily: STYLE.fontBody,
            fontSize: 38,
            color: STYLE.textMuted,
            marginTop: 12,
          }}
        >
          עם הכלי שלנו ב-Learni
        </div>
      </div>

      {/* Down arrow during morph */}
      <svg
        style={{
          position: "absolute",
          top: "54%",
          left: "50%",
          transform: "translate(-50%, 0)",
          opacity: arrowOpacity,
          zIndex: 18,
        }}
        width="60"
        height="80"
        viewBox="0 0 60 80"
      >
        <path
          d="M30 5 L30 65 M10 50 L30 70 L50 50"
          fill="none"
          stroke={STYLE.lavender}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Confetti explosion */}
      {frame >= confettiStart &&
        confettiParticles.map((p, i) => {
          const cF = frame - confettiStart;
          const progress = Math.min(cF / 40, 1);
          const dist = p.speed * cF;
          const x = Math.cos(p.angle) * dist;
          const y = Math.sin(p.angle) * dist + (cF * cF * 0.08); // gravity
          const rotate = cF * p.rotateSpeed;
          const opacity = interpolate(cF, [0, 5, 30, 45], [0, 1, 0.8, 0], {
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={`confetti-${i}`}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: p.size,
                height: p.size * (i % 3 === 0 ? 1 : 0.5),
                borderRadius: i % 3 === 0 ? "50%" : 3,
                background: p.color,
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rotate}deg)`,
                opacity,
                zIndex: 30,
                pointerEvents: "none",
              }}
            />
          );
        })}

      {/* Celebration text */}
      <div
        style={{
          position: "absolute",
          bottom: 320,
          left: "50%",
          transform: `translate(-50%, 0) scale(${celebScale})`,
          opacity: celebOpacity,
          zIndex: 20,
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: 20,
            padding: "18px 44px",
            border: `2px solid ${STYLE.mint}30`,
            boxShadow: STYLE.shadow,
          }}
        >
          <span
            style={{
              fontFamily: STYLE.fontHandwriting,
              fontSize: 44,
              color: STYLE.textDark,
            }}
          >
            משעתיים ל-5 דקות
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
