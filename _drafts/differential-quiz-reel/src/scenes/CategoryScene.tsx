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

// Split Reveal — screen splits pink left + green right, reveals "לפני vs אחרי"
export const CategoryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Two colored halves cover the screen (0-20 frames)
  // Phase 2: They split apart revealing content (20+)
  const splitStart = 18;
  const splitProgress = spring({
    frame: Math.max(0, frame - splitStart),
    fps,
    from: 0,
    to: 1,
    config: { damping: 10, mass: 0.7, stiffness: 120 },
  });

  const leftX = interpolate(splitProgress, [0, 1], [0, -560]);
  const rightX = interpolate(splitProgress, [0, 1], [0, 560]);

  // Halves fade out after splitting
  const halvesOpacity = interpolate(
    frame,
    [splitStart + 10, splitStart + 25],
    [1, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // "VS" badge bounces in center
  const vsStart = splitStart + 5;
  const vsScale = spring({
    frame: Math.max(0, frame - vsStart),
    fps,
    from: 0,
    to: 1,
    config: { damping: 6, mass: 0.4, stiffness: 200 },
  });
  const vsRotate = spring({
    frame: Math.max(0, frame - vsStart),
    fps,
    from: -15,
    to: 0,
    config: { damping: 8, mass: 0.3 },
  });

  // "לפני" text slides from left
  const beforeStart = vsStart + 8;
  const beforeX = spring({
    frame: Math.max(0, frame - beforeStart),
    fps,
    from: -400,
    to: 0,
    config: { damping: 10, mass: 0.5 },
  });
  const beforeOpacity = interpolate(
    frame,
    [beforeStart, beforeStart + 8],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // "אחרי" text slides from right
  const afterStart = beforeStart + 6;
  const afterX = spring({
    frame: Math.max(0, frame - afterStart),
    fps,
    from: 400,
    to: 0,
    config: { damping: 10, mass: 0.5 },
  });
  const afterOpacity = interpolate(
    frame,
    [afterStart, afterStart + 8],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Category label at top
  const labelStart = 5;
  const labelY = spring({
    frame: Math.max(0, frame - labelStart),
    fps,
    from: -80,
    to: 0,
    config: { damping: 12, mass: 0.4 },
  });
  const labelOpacity = interpolate(
    frame,
    [labelStart, labelStart + 8],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      {/* Left half — pink */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "50%",
          height: "100%",
          background: `linear-gradient(135deg, ${STYLE.pink}60, ${STYLE.pink}30)`,
          transform: `translateX(${leftX}px)`,
          opacity: halvesOpacity,
          zIndex: 10,
        }}
      />

      {/* Right half — mint */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          height: "100%",
          background: `linear-gradient(225deg, ${STYLE.mint}60, ${STYLE.mint}30)`,
          transform: `translateX(${rightX}px)`,
          opacity: halvesOpacity,
          zIndex: 10,
        }}
      />

      {/* Category label top */}
      <div
        style={{
          position: "absolute",
          top: 340,
          left: "50%",
          transform: `translate(-50%, ${labelY}px)`,
          opacity: labelOpacity,
          zIndex: 20,
          fontFamily: STYLE.fontBody,
          fontSize: 38,
          color: STYLE.textMuted,
          letterSpacing: 4,
        }}
      >
        שאלון דיפרנציאלי
      </div>

      {/* "לפני" label — pink side */}
      <div
        style={{
          position: "absolute",
          top: "42%",
          right: "54%",
          transform: `translateX(${beforeX}px)`,
          opacity: beforeOpacity,
          zIndex: 20,
        }}
      >
        <div
          style={{
            background: `rgba(232,160,180,0.25)`,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: 28,
            padding: "28px 52px",
            border: `2px solid ${STYLE.pink}40`,
            boxShadow: STYLE.shadow,
          }}
        >
          <span
            style={{
              fontFamily: STYLE.fontHeading,
              fontSize: 72,
              fontWeight: 700,
              color: STYLE.pink,
            }}
          >
            לפני
          </span>
        </div>
      </div>

      {/* VS badge — center */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${vsScale}) rotate(${vsRotate}deg)`,
          zIndex: 25,
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${STYLE.lavender}, ${STYLE.skyBlue})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 8px 40px ${STYLE.skyBlue}40, 0 0 80px ${STYLE.lavender}25`,
          }}
        >
          <span
            style={{
              fontFamily: STYLE.fontHeading,
              fontSize: 58,
              fontWeight: 900,
              color: "#fff",
              direction: "ltr",
            }}
          >
            VS
          </span>
        </div>
      </div>

      {/* "אחרי" label — mint side */}
      <div
        style={{
          position: "absolute",
          top: "58%",
          left: "54%",
          transform: `translateX(${afterX}px)`,
          opacity: afterOpacity,
          zIndex: 20,
        }}
      >
        <div
          style={{
            background: `rgba(125,212,172,0.25)`,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: 28,
            padding: "28px 52px",
            border: `2px solid ${STYLE.mint}40`,
            boxShadow: STYLE.shadow,
          }}
        >
          <span
            style={{
              fontFamily: STYLE.fontHeading,
              fontSize: 72,
              fontWeight: 700,
              color: STYLE.mint,
            }}
          >
            אחרי
          </span>
        </div>
      </div>

      {/* Decorative line between */}
      <div
        style={{
          position: "absolute",
          top: "44%",
          left: "50%",
          width: 3,
          height: interpolate(frame, [splitStart, splitStart + 20], [0, 280], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          }),
          background: `linear-gradient(to bottom, transparent, ${STYLE.lavender}40, transparent)`,
          transform: "translateX(-50%)",
          zIndex: 15,
        }}
      />
    </AbsoluteFill>
  );
};
