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
import { ClockIcon, ZapIcon, LayersIcon } from "../Icons";

// Number Slam — giant "5" slams in + icons fly in from random directions
export const SummaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Giant "5" slams in from scale 8 -> 1
  const numberStart = 5;
  const numberScale = spring({
    frame: Math.max(0, frame - numberStart),
    fps,
    from: 8,
    to: 1,
    config: { damping: 6, mass: 0.5, stiffness: 100 },
  });
  const numberOpacity = interpolate(
    frame,
    [numberStart, numberStart + 3],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Removed shake for consistency with gentle hook
  const shakeX = 0;
  const shakeY = 0;

  // Flash
  const flashOpacity = interpolate(
    frame,
    [shakeStart, shakeStart + 2, shakeStart + 8],
    [0, 0.25, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // "דקות" subtitle appears
  const subtitleStart = numberStart + 10;
  const subtitleY = spring({
    frame: Math.max(0, frame - subtitleStart),
    fps,
    from: 40,
    to: 0,
    config: { damping: 10, mass: 0.4 },
  });
  const subtitleOpacity = interpolate(
    frame,
    [subtitleStart, subtitleStart + 8],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Icons fly in from random directions
  const icons = [
    {
      Icon: ClockIcon,
      color: STYLE.skyBlue,
      startX: -500,
      startY: -300,
      endX: -220,
      endY: 160,
      delay: 20,
      size: 80,
    },
    {
      Icon: ZapIcon,
      color: STYLE.mint,
      startX: 500,
      startY: -200,
      endX: 220,
      endY: -120,
      delay: 25,
      size: 80,
    },
    {
      Icon: LayersIcon,
      color: STYLE.lavender,
      startX: -400,
      startY: 400,
      endX: -180,
      endY: -180,
      delay: 30,
      size: 72,
    },
  ];

  // "שאלון דיפרנציאלי מלא" label
  const labelStart = 35;
  const labelScale = spring({
    frame: Math.max(0, frame - labelStart),
    fps,
    from: 0,
    to: 1,
    config: { damping: 8, mass: 0.4, stiffness: 180 },
  });

  return (
    <AbsoluteFill
      style={{
        ...bgStyle,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      <Particles />

      {/* Flash */}
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

      {/* Giant "5" */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${numberScale})`,
          opacity: numberOpacity,
          zIndex: 20,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: STYLE.fontHeading,
            fontSize: 320,
            fontWeight: 900,
            color: STYLE.mint,
            lineHeight: 1,
            textShadow: `0 8px 60px ${STYLE.mint}40, 0 0 120px ${STYLE.mint}15`,
          }}
        >
          5
        </div>
      </div>

      {/* "דקות" subtitle */}
      <div
        style={{
          position: "absolute",
          top: "58%",
          left: "50%",
          transform: `translate(-50%, ${subtitleY}px)`,
          opacity: subtitleOpacity,
          zIndex: 20,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: STYLE.fontHeading,
            fontSize: 72,
            fontWeight: 700,
            color: STYLE.textDark,
          }}
        >
          דקות
        </div>
      </div>

      {/* Flying icons */}
      {icons.map((icon, i) => {
        const iconProgress = spring({
          frame: Math.max(0, frame - icon.delay),
          fps,
          from: 0,
          to: 1,
          config: { damping: 8, mass: 0.5, stiffness: 100 },
        });
        const iconX = interpolate(iconProgress, [0, 1], [icon.startX, icon.endX]);
        const iconY = interpolate(iconProgress, [0, 1], [icon.startY, icon.endY]);
        const iconOpacity = interpolate(
          frame,
          [icon.delay, icon.delay + 5],
          [0, 1],
          { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
        );
        const rotate = interpolate(iconProgress, [0, 1], [180, 0]);

        return (
          <div
            key={`icon-${i}`}
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: `translate(calc(-50% + ${iconX}px), calc(-50% + ${iconY}px)) rotate(${rotate}deg)`,
              opacity: iconOpacity,
              zIndex: 18,
            }}
          >
            <div
              style={{
                width: icon.size + 24,
                height: icon.size + 24,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2px solid ${icon.color}30`,
                boxShadow: `0 8px 30px ${icon.color}20`,
              }}
            >
              <icon.Icon size={icon.size} color={icon.color} />
            </div>
          </div>
        );
      })}

      {/* Bottom label */}
      <div
        style={{
          position: "absolute",
          bottom: 300,
          left: "50%",
          transform: `translate(-50%, 0) scale(${labelScale})`,
          opacity: labelScale > 0.01 ? 1 : 0,
          zIndex: 20,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: 24,
            padding: "20px 48px",
            border: `2px solid ${STYLE.lavender}30`,
            boxShadow: STYLE.shadow,
          }}
        >
          <span
            style={{
              fontFamily: STYLE.fontBody,
              fontSize: 40,
              fontWeight: 500,
              color: STYLE.textDark,
            }}
          >
            שאלון שמתאים את עצמו לכל אחד
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
