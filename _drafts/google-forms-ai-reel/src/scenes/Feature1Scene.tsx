import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { STYLE, bgStyle } from "../styles";
import { Particles } from "../Particles";
import { FormsIcon } from "../Icons";

// Scene 3: Cursor Drag — cursor moves to Google Forms icon, clicks (ripples),
// drags a form into a glassmorphism card.
// Text: "בונים טופס רגיל ב-Google Forms"
export const Feature1Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Badge "01" entrance
  const badgeScale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 5, mass: 0.3, stiffness: 250 },
  });

  // Phase 1: Cursor moves toward Forms icon (frames 0-30)
  const cursorStartX = 800;
  const cursorStartY = 1400;
  const iconCenterX = 540;
  const iconCenterY = 750;

  const cursorMoveProgress = spring({
    frame: Math.max(0, frame - 5),
    fps,
    from: 0,
    to: 1,
    config: { damping: 10, mass: 0.7 },
  });

  const cursorX = interpolate(cursorMoveProgress, [0, 1], [cursorStartX, iconCenterX]);
  const cursorY = interpolate(cursorMoveProgress, [0, 1], [cursorStartY, iconCenterY]);

  // Phase 2: Click ripple at frame ~30
  const clickFrame = 30;
  const ripple1Scale = spring({
    frame: Math.max(0, frame - clickFrame),
    fps,
    from: 0,
    to: 3,
    config: { damping: 15, mass: 0.8 },
  });
  const ripple1Opacity = interpolate(frame, [clickFrame, clickFrame + 3, clickFrame + 15], [0, 0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ripple2Scale = spring({
    frame: Math.max(0, frame - clickFrame - 4),
    fps,
    from: 0,
    to: 2.5,
    config: { damping: 15, mass: 0.8 },
  });
  const ripple2Opacity = interpolate(frame, [clickFrame + 4, clickFrame + 7, clickFrame + 18], [0, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 3: Drag — icon+form moves down to card area (frames 40-70)
  const dragStart = 42;
  const dragProgress = spring({
    frame: Math.max(0, frame - dragStart),
    fps,
    from: 0,
    to: 1,
    config: { damping: 8, mass: 0.6 },
  });

  const formIconY = interpolate(dragProgress, [0, 1], [0, 200]);
  const formIconScale = interpolate(dragProgress, [0, 0.3, 1], [1, 1.1, 0.7], {
    extrapolateRight: "clamp",
  });
  const formIconOpacity = interpolate(dragProgress, [0.7, 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cursor follows the drag
  const dragCursorX = interpolate(dragProgress, [0, 1], [iconCenterX, 540]);
  const dragCursorY = interpolate(dragProgress, [0, 1], [iconCenterY, iconCenterY + 200]);

  const finalCursorX = frame >= dragStart ? dragCursorX : cursorX;
  const finalCursorY = frame >= dragStart ? dragCursorY : cursorY;

  // Phase 4: Card appears with content (frames 65+)
  const cardStart = 65;
  const cardScale = spring({
    frame: Math.max(0, frame - cardStart),
    fps,
    from: 0.5,
    to: 1,
    config: { damping: 6, mass: 0.4, stiffness: 180 },
  });
  const cardOpacity = interpolate(frame, [cardStart, cardStart + 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Content text fades in
  const textStart = cardStart + 12;
  const textOpacity = interpolate(frame, [textStart, textStart + 10], [0, 1], {
    extrapolateRight: "clamp",
  });
  const textY = spring({
    frame: Math.max(0, frame - textStart),
    fps,
    from: 25,
    to: 0,
    config: { damping: 8, mass: 0.5 },
  });

  // Cursor fades out after drag
  const cursorOpacity = interpolate(frame, [dragStart + 25, dragStart + 35], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const floatY = Math.sin(frame / 15) * 4;

  // Drop shadow trail during drag
  const trailOpacity = frame >= dragStart && frame < dragStart + 30
    ? interpolate(frame, [dragStart, dragStart + 10, dragStart + 30], [0, 0.15, 0], { extrapolateRight: "clamp" })
    : 0;

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          zIndex: 2,
          transform: `translateY(${floatY}px)`,
        }}
      >
        {/* Badge "01" */}
        <div
          style={{
            background: STYLE.accent,
            borderRadius: 20,
            padding: "10px 32px",
            transform: `scale(${badgeScale})`,
            boxShadow: `0 6px 20px ${STYLE.accent}30`,
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
            01
          </span>
        </div>

        {/* Google Forms icon — gets dragged */}
        <div
          style={{
            transform: `translateY(${formIconY}px) scale(${formIconScale})`,
            opacity: formIconOpacity,
            transition: "none",
            zIndex: 5,
          }}
        >
          <FormsIcon size={100} color={STYLE.accent} />
        </div>

        {/* Drag trail shadow */}
        {trailOpacity > 0 && (
          <div
            style={{
              position: "absolute",
              top: iconCenterY + formIconY * 0.5,
              left: iconCenterX - 50,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: STYLE.accent,
              filter: "blur(30px)",
              opacity: trailOpacity,
              zIndex: 3,
            }}
          />
        )}

        {/* Glassmorphism card — appears after drag */}
        <div
          style={{
            width: 920,
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
            gap: 28,
          }}
        >
          <div
            style={{
              opacity: textOpacity,
              transform: `translateY(${textY}px)`,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            <FormsIcon size={72} color={STYLE.accent} />
            <span
              style={{
                fontFamily: STYLE.fontBody,
                fontSize: 52,
                fontWeight: 700,
                color: STYLE.textDark,
                lineHeight: 1.4,
              }}
            >
              פותחים Google Forms
            </span>
            <span
              style={{
                fontFamily: STYLE.fontBody,
                fontSize: 44,
                fontWeight: 500,
                color: STYLE.textMuted,
              }}
            >
              ולוחצים "Help me create"
            </span>
          </div>

          {/* Form preview lines */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              width: "80%",
              opacity: textOpacity * 0.6,
            }}
          >
            {[0.85, 0.7, 0.55].map((w, i) => {
              const lineDelay = textStart + 8 + i * 5;
              const lineOpacity = interpolate(frame, [lineDelay, lineDelay + 8], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <div
                  key={i}
                  style={{
                    height: 12,
                    width: `${w * 100}%`,
                    borderRadius: 6,
                    background: `linear-gradient(90deg, ${STYLE.accent}20, ${STYLE.accentLight}15)`,
                    opacity: lineOpacity,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Click ripples */}
      {frame >= clickFrame && (
        <>
          <div
            style={{
              position: "absolute",
              left: iconCenterX - 30,
              top: iconCenterY - 30,
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: `3px solid ${STYLE.accent}`,
              transform: `scale(${ripple1Scale})`,
              opacity: ripple1Opacity,
              zIndex: 8,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: iconCenterX - 30,
              top: iconCenterY - 30,
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: `2px solid ${STYLE.accentLight}`,
              transform: `scale(${ripple2Scale})`,
              opacity: ripple2Opacity,
              zIndex: 8,
            }}
          />
        </>
      )}

      {/* Custom cursor */}
      <div
        style={{
          position: "absolute",
          left: finalCursorX,
          top: finalCursorY,
          zIndex: 20,
          opacity: cursorOpacity,
          pointerEvents: "none",
        }}
      >
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
          <path
            d="M4 2L4 32L12 24L20 36L26 32L18 20L28 18L4 2Z"
            fill="white"
            stroke={STYLE.textDark}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
