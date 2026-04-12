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
import { XIcon } from "../Icons";

// 3D Card Flip — pink card flips to reveal 4 "before" problems
const PROBLEMS = [
  "כולם מקבלים את אותו מבחן",
  "בדיקה ידנית",
  "אין משוב למי שענה",
  "שעתיים+",
];

export const Feature1Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title flies in from top
  const titleStart = 5;
  const titleY = spring({
    frame: Math.max(0, frame - titleStart),
    fps,
    from: -120,
    to: 0,
    config: { damping: 10, mass: 0.5 },
  });
  const titleOpacity = interpolate(
    frame,
    [titleStart, titleStart + 10],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Card flip animation: rotates from Y=90 (edge-on) to Y=0 (face)
  const flipStart = 15;
  const flipRotateY = spring({
    frame: Math.max(0, frame - flipStart),
    fps,
    from: 90,
    to: 0,
    config: { damping: 12, mass: 0.8, stiffness: 80 },
  });
  const cardOpacity = interpolate(frame, [flipStart, flipStart + 5], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Card scale bounce on landing
  const cardScale = spring({
    frame: Math.max(0, frame - flipStart),
    fps,
    from: 0.85,
    to: 1,
    config: { damping: 8, mass: 0.4, stiffness: 150 },
  });

  // Each problem item staggers in
  const itemDelay = 18;
  const itemStagger = 12;

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      {/* "לפני" title */}
      <div
        style={{
          position: "absolute",
          top: 280,
          left: "50%",
          transform: `translate(-50%, ${titleY}px)`,
          opacity: titleOpacity,
          zIndex: 20,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: STYLE.fontHeading,
            fontSize: 72,
            fontWeight: 800,
            color: STYLE.pink,
            textShadow: `0 4px 30px ${STYLE.pink}30`,
          }}
        >
          לפני
        </div>
        <div
          style={{
            width: 120,
            height: 4,
            background: `linear-gradient(90deg, transparent, ${STYLE.pink}, transparent)`,
            margin: "12px auto 0",
            borderRadius: 2,
          }}
        />
      </div>

      {/* 3D Flipping Card */}
      <div
        style={{
          position: "absolute",
          top: 460,
          left: "50%",
          transform: `translate(-50%, 0) perspective(1200px) rotateY(${flipRotateY}deg) scale(${cardScale})`,
          opacity: cardOpacity,
          zIndex: 15,
          width: 900,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: 28,
            padding: "48px 52px",
            border: `2px solid ${STYLE.pink}30`,
            boxShadow: `0 20px 60px ${STYLE.pink}15, ${STYLE.shadow}`,
          }}
        >
          {PROBLEMS.map((problem, i) => {
            const itemStart = flipStart + itemDelay + i * itemStagger;
            const itemX = spring({
              frame: Math.max(0, frame - itemStart),
              fps,
              from: -200,
              to: 0,
              config: { damping: 10, mass: 0.4, stiffness: 130 },
            });
            const itemOpacity = interpolate(
              frame,
              [itemStart, itemStart + 6],
              [0, 1],
              { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
            );

            // Strike-through line grows across text
            const strikeStart = itemStart + 6;
            const strikeWidth = spring({
              frame: Math.max(0, frame - strikeStart),
              fps,
              from: 0,
              to: 100,
              config: { damping: 15, mass: 0.5 },
            });

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  marginBottom: i < PROBLEMS.length - 1 ? 36 : 0,
                  transform: `translateX(${itemX}px)`,
                  opacity: itemOpacity,
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: `${STYLE.pink}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `2px solid ${STYLE.pink}30`,
                  }}
                >
                  <XIcon size={32} color={STYLE.pink} />
                </div>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      fontFamily: STYLE.fontBody,
                      fontSize: 48,
                      fontWeight: 500,
                      color: STYLE.textDark,
                      lineHeight: 1.3,
                    }}
                  >
                    {problem}
                  </span>
                  {/* Animated strike-through */}
                  <div
                    style={{
                      position: "absolute",
                      top: "55%",
                      right: 0,
                      width: `${strikeWidth}%`,
                      height: 3,
                      background: `${STYLE.pink}50`,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pink glow behind card */}
      <div
        style={{
          position: "absolute",
          top: 500,
          left: "50%",
          width: 600,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${STYLE.pink}15 0%, transparent 70%)`,
          transform: "translate(-50%, 0)",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
