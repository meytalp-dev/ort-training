import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { bgGradient, COLORS, FONTS } from "../styles";

export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Line 1: "0 שורות קוד." — SLAM onto screen (frame 0-15)
  const line1Scale = spring({
    frame,
    fps,
    from: 3,
    to: 1,
    config: { damping: 6, mass: 0.4, stiffness: 200 },
  });
  const line1Opacity = interpolate(frame, [0, 4], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Line 2: "100+ כלים דיגיטליים." — appears frame 15-35
  const line2Start = 15;
  const line2Scale = spring({
    frame: Math.max(0, frame - line2Start),
    fps,
    from: 2,
    to: 1,
    config: { damping: 7, mass: 0.5 },
  });
  const line2Opacity = interpolate(frame, [line2Start, line2Start + 6], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Both lines fade slightly at frame 35
  const fadeDown = interpolate(frame, [33, 38], [1, 0.6], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Line 3: "אני מורה. בלי רקע בתכנות." — appears frame 35-60
  const line3Start = 35;
  const line3Opacity = interpolate(frame, [line3Start, line3Start + 8], [0, 1], {
    extrapolateRight: "clamp",
  });
  const line3Y = spring({
    frame: Math.max(0, frame - line3Start),
    fps,
    from: 40,
    to: 0,
    config: { damping: 8, mass: 0.5 },
  });

  // Line 4: "וככה זה נראה" — teal accent, frame 60-75
  const line4Start = 60;
  const line4Opacity = interpolate(frame, [line4Start, line4Start + 6], [0, 1], {
    extrapolateRight: "clamp",
  });
  const line4Scale = spring({
    frame: Math.max(0, frame - line4Start),
    fps,
    from: 0.7,
    to: 1,
    config: { damping: 7, mass: 0.4 },
  });
  // Arrow bounce
  const arrowBounce =
    frame >= line4Start + 8
      ? Math.sin((frame - line4Start - 8) / 4) * 8
      : 0;

  // Background blobs — BIGGER and more visible
  const blob1X = Math.sin(frame / 20) * 40;
  const blob1Y = Math.cos(frame / 25) * 30;
  const blob2X = Math.cos(frame / 18) * 50;
  const blob2Y = Math.sin(frame / 22) * 35;
  const blob3X = Math.sin(frame / 15) * 30;
  const blob3Y = Math.cos(frame / 20) * 45;

  return (
    <AbsoluteFill style={bgGradient}>
      {/* Large colorful gradient blobs — bigger, more visible */}
      <div
        style={{
          position: "absolute",
          top: 100 + blob1Y,
          right: -150 + blob1X,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(245,160,192,0.2) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 200 + blob2Y,
          left: -120 + blob2X,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(137,207,240,0.2) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 700 + blob3Y,
          left: 200 + blob3X,
          width: 650,
          height: 650,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(232,133,61,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Main text */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: "0 60px",
          textAlign: "center",
        }}
      >
        {/* Line 1 — SLAM */}
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 96,
            fontWeight: 900,
            color: COLORS.textDark,
            opacity: line1Opacity * fadeDown,
            transform: `scale(${line1Scale})`,
            lineHeight: 1.2,
          }}
        >
          0 שורות קוד.
        </div>

        {/* Line 2 — orange */}
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 70,
            fontWeight: 800,
            color: COLORS.orange,
            opacity: line2Opacity * fadeDown,
            transform: `scale(${line2Scale})`,
            lineHeight: 1.3,
          }}
        >
          +100 כלים דיגיטליים.
        </div>

        {/* Line 3 — smaller, muted */}
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 40,
            fontWeight: 500,
            color: COLORS.textMuted,
            opacity: line3Opacity,
            transform: `translateY(${line3Y}px)`,
            lineHeight: 1.5,
            marginTop: 20,
          }}
        >
          אני מורה. בלי רקע בתכנות.
        </div>

        {/* Line 4 — teal accent with arrow */}
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 44,
            fontWeight: 700,
            color: COLORS.tealAccent,
            opacity: line4Opacity,
            transform: `scale(${line4Scale})`,
            marginTop: 30,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span>וככה זה נראה</span>
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLORS.tealAccent}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: `translateY(${arrowBounce}px)`,
            }}
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};
