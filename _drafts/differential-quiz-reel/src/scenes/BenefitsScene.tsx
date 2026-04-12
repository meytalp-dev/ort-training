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
import { ClockIcon, LayersIcon, SheetsIcon } from "../Icons";

// Pill BIG -> Shrink — 3 pills appear one at a time, start BIG then shrink into place
const PILLS = [
  {
    text: "כל אחד מקבל שאלות ברמה שלו",
    color: STYLE.mint,
    Icon: LayersIcon,
  },
  {
    text: "משוב מיידי + הסברים",
    color: STYLE.skyBlue,
    Icon: ClockIcon,
  },
  {
    text: "תוצאות ל-Sheets — בלי לבדוק ידנית",
    color: STYLE.lavender,
    Icon: SheetsIcon,
  },
];

export const BenefitsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title
  const titleStart = 5;
  const titleScale = spring({
    frame: Math.max(0, frame - titleStart),
    fps,
    from: 0,
    to: 1,
    config: { damping: 8, mass: 0.4, stiffness: 160 },
  });
  const titleOpacity = interpolate(
    frame,
    [titleStart, titleStart + 8],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Each pill: starts BIG (scale ~2.5) and centered, then shrinks to its slot
  const pillDuration = 80; // frames per pill phase
  const pillStart = 25;

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 260,
          left: "50%",
          transform: `translate(-50%, 0) scale(${titleScale})`,
          opacity: titleOpacity,
          zIndex: 20,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: STYLE.fontHeading,
            fontSize: 68,
            fontWeight: 800,
            color: STYLE.textDark,
            textShadow: `0 4px 30px ${STYLE.lavender}25`,
          }}
        >
          מה מקבלים?
        </div>
      </div>

      {/* Pills */}
      {PILLS.map((pill, i) => {
        const start = pillStart + i * pillDuration;

        // Phase 1: BIG reveal (0-30 frames within pill phase)
        const bigScale = spring({
          frame: Math.max(0, frame - start),
          fps,
          from: 0,
          to: 2.2,
          config: { damping: 8, mass: 0.5, stiffness: 120 },
        });

        // Phase 2: Shrink to slot (30-60 frames within pill phase)
        const shrinkStart = start + 35;
        const shrinkScale = spring({
          frame: Math.max(0, frame - shrinkStart),
          fps,
          from: 2.2,
          to: 1,
          config: { damping: 12, mass: 0.6, stiffness: 80 },
        });

        // Y position: starts centered, moves to slot
        const slotY = 460 + i * 280;
        const centerY = 850; // vertical center
        const yProgress = spring({
          frame: Math.max(0, frame - shrinkStart),
          fps,
          from: 0,
          to: 1,
          config: { damping: 12, mass: 0.6, stiffness: 80 },
        });
        const currentY = interpolate(yProgress, [0, 1], [centerY, slotY]);

        // Combine scale: use big if before shrink, shrink if after
        const currentScale = frame >= shrinkStart ? shrinkScale : bigScale;

        const opacity = interpolate(frame, [start, start + 5], [0, 1], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
        });

        // Glow pulse after settled
        const settledStart = shrinkStart + 20;
        const glowPulse =
          frame >= settledStart
            ? 0.08 + Math.sin((frame - settledStart) / 6) * 0.04
            : 0;

        const PillIcon = pill.Icon;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: currentY,
              left: "50%",
              transform: `translate(-50%, -50%) scale(${currentScale})`,
              opacity,
              zIndex: 20 - i,
              width: 860,
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: 28,
                padding: "36px 48px",
                border: `2px solid ${pill.color}35`,
                boxShadow: `0 16px 50px ${pill.color}${Math.round(
                  (0.12 + glowPulse) * 255
                )
                  .toString(16)
                  .padStart(2, "0")}, ${STYLE.shadow}`,
                display: "flex",
                alignItems: "center",
                gap: 32,
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  flexShrink: 0,
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: `${pill.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `2px solid ${pill.color}30`,
                }}
              >
                <PillIcon size={44} color={pill.color} />
              </div>

              {/* Text */}
              <span
                style={{
                  fontFamily: STYLE.fontHeading,
                  fontSize: 52,
                  fontWeight: 700,
                  color: STYLE.textDark,
                  lineHeight: 1.2,
                }}
              >
                {pill.text}
              </span>
            </div>
          </div>
        );
      })}

      {/* Decorative side accents */}
      {[0, 1, 2].map((i) => {
        const accentStart = pillStart + i * pillDuration + 10;
        const accentOpacity = interpolate(
          frame,
          [accentStart, accentStart + 10],
          [0, 0.12],
          { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
        );
        return (
          <div
            key={`accent-${i}`}
            style={{
              position: "absolute",
              top: 460 + i * 280,
              left: i % 2 === 0 ? -60 : undefined,
              right: i % 2 === 1 ? -60 : undefined,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: PILLS[i].color,
              opacity: accentOpacity,
              filter: "blur(60px)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
