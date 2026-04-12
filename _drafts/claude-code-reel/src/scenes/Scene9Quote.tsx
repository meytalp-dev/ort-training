import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { bgGradient, COLORS, FONTS } from "../styles";

export const Scene9Quote: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Quote marks — large and dramatic, scale in
  const quoteScale = spring({
    frame,
    fps,
    from: 3,
    to: 1,
    config: { damping: 7, mass: 0.5 },
  });
  const quoteOpacity = interpolate(frame, [0, 10], [0, 0.2], {
    extrapolateRight: "clamp",
  });

  // Word by word reveal — faster wordDelay (3 frames)
  const words = ["אם", "מורה", "בלי", "רקע", "טכני", "יכולה", "\u2014"];
  const words2 = ["גם", "את/ה"];

  const wordDelay = 3;
  const wordStartFrame = 8;

  // Quote mark float
  const quoteFloat = Math.sin(frame / 18) * 8;

  // Background blobs
  const blob1X = Math.sin(frame / 22) * 35;
  const blob1Y = Math.cos(frame / 28) * 25;
  const blob2X = Math.cos(frame / 20) * 40;
  const blob2Y = Math.sin(frame / 24) * 30;

  return (
    <AbsoluteFill style={bgGradient}>
      {/* Soft gradient blobs */}
      <div
        style={{
          position: "absolute",
          top: 200 + blob1Y,
          right: -80 + blob1X,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(232,133,61,0.1) 0%, transparent 70%)`,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 300 + blob2Y,
          left: -100 + blob2X,
          width: 550,
          height: 550,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(137,207,240,0.12) 0%, transparent 70%)`,
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />

      {/* Subtle glow behind text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(90,184,160,0.08) 0%, transparent 70%)`,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 60px",
          textAlign: "center",
        }}
      >
        {/* Large dramatic quote mark */}
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 240,
            color: COLORS.orange,
            opacity: quoteOpacity,
            lineHeight: 0.4,
            marginBottom: 40,
            transform: `scale(${quoteScale}) translateY(${quoteFloat}px)`,
          }}
        >
          &ldquo;
        </div>

        {/* Word-by-word text — line 1 */}
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 52,
            fontWeight: 700,
            color: COLORS.textDark,
            lineHeight: 1.6,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 14,
            direction: "rtl",
          }}
        >
          {words.map((word, i) => {
            const wordFrame = wordStartFrame + i * wordDelay;
            const wordOpacity = interpolate(
              frame,
              [wordFrame, wordFrame + 4],
              [0, 1],
              { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
            );
            const wordY = spring({
              frame: Math.max(0, frame - wordFrame),
              fps,
              from: 30,
              to: 0,
              config: { damping: 8, mass: 0.4 },
            });
            const wordScale = spring({
              frame: Math.max(0, frame - wordFrame),
              fps,
              from: 0.7,
              to: 1,
              config: { damping: 8, mass: 0.4 },
            });

            return (
              <span
                key={i}
                style={{
                  opacity: wordOpacity,
                  transform: `translateY(${wordY}px) scale(${wordScale})`,
                  display: "inline-block",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Line 2 — accent colored, appears after line 1 */}
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1.6,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 14,
            direction: "rtl",
            marginTop: 10,
          }}
        >
          {words2.map((word, i) => {
            const wordFrame =
              wordStartFrame + words.length * wordDelay + 6 + i * wordDelay;
            const wordOpacity = interpolate(
              frame,
              [wordFrame, wordFrame + 4],
              [0, 1],
              { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
            );
            const wordScale = spring({
              frame: Math.max(0, frame - wordFrame),
              fps,
              from: 0.5,
              to: 1,
              config: { damping: 6, mass: 0.4 },
            });
            const wordY = spring({
              frame: Math.max(0, frame - wordFrame),
              fps,
              from: 40,
              to: 0,
              config: { damping: 6, mass: 0.4 },
            });

            return (
              <span
                key={i}
                style={{
                  color: COLORS.tealAccent,
                  opacity: wordOpacity,
                  transform: `translateY(${wordY}px) scale(${wordScale})`,
                  display: "inline-block",
                  textShadow: `0 0 30px rgba(90,184,160,${wordOpacity * 0.3})`,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      {/* No cinematic letterbox bars — removed */}
    </AbsoluteFill>
  );
};
