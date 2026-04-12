import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { bgGradient, COLORS, FONTS, darkCardStyle } from "../styles";

export const Scene2Wrong: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Terminal ZOOMS IN from tiny to fill (faster — 60 frames total)
  const termScale = spring({
    frame,
    fps,
    from: 0.15,
    to: 1,
    config: { damping: 8, mass: 0.6 },
  });
  const termOpacity = interpolate(frame, [0, 6], [0, 1], {
    extrapolateRight: "clamp",
  });

  // X SLAMS down at frame 30 (was 40)
  const xStart = 30;
  const xScale = spring({
    frame: Math.max(0, frame - xStart),
    fps,
    from: 3,
    to: 1,
    config: { damping: 6, mass: 0.4 },
  });
  const xOpacity = interpolate(frame, [xStart, xStart + 3], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Shake effect after X slam
  const shakeFrame = Math.max(0, frame - xStart);
  const shakeIntensity = interpolate(shakeFrame, [0, 3, 12], [0, 1, 0], {
    extrapolateRight: "clamp",
  });
  const shakeX = Math.sin(shakeFrame * 4) * 12 * shakeIntensity;
  const shakeY = Math.cos(shakeFrame * 5) * 8 * shakeIntensity;

  // "Not like this" text — slides in FAST from right (frame 40, was 52)
  const textStart = 40;
  const textX = spring({
    frame: Math.max(0, frame - textStart),
    fps,
    from: -400,
    to: 0,
    config: { damping: 7, mass: 0.4 },
  });
  const textOpacity = interpolate(frame, [textStart, textStart + 4], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Subtle breathe on resting terminal
  const breathe = Math.sin(frame / 20) * 0.005 + 1;

  return (
    <AbsoluteFill style={bgGradient}>
      {/* No red flash overlay — removed */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          transform: `translate(${shakeX}px, ${shakeY}px)`,
        }}
      >
        {/* Terminal card — zoom in (stays dark) */}
        <div
          style={{
            ...darkCardStyle,
            padding: 0,
            overflow: "hidden",
            transform: `scale(${termScale * breathe})`,
            opacity: termOpacity,
            position: "relative",
          }}
        >
          {/* Terminal header */}
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: "16px 20px",
              background: "rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#e74c3c" }} />
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#f39c12" }} />
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#27ae60" }} />
          </div>

          {/* Terminal content */}
          <div
            style={{
              padding: "24px 28px",
              fontFamily: "monospace",
              direction: "ltr",
              textAlign: "left",
            }}
          >
            <div style={{ color: COLORS.tealAccent, fontSize: 20, marginBottom: 8 }}>
              * Welcome to Claude Code
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 18, marginBottom: 20 }}>
              {">"} Think harder...
            </div>

            {/* Input — Hebrew RTL */}
            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "16px 20px",
                marginTop: 16,
                border: "1px solid rgba(255,255,255,0.1)",
                direction: "rtl",
                textAlign: "right",
              }}
            >
              <span style={{ color: COLORS.white, fontSize: 22, fontFamily: FONTS.body }}>
                תבנה לי מצגת
              </span>
            </div>
          </div>

          {/* Big X overlay — SLAM */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${xScale})`,
              fontSize: 220,
              color: COLORS.red,
              fontWeight: 900,
              textShadow: `0 0 60px rgba(231,76,60,0.8), 0 10px 30px rgba(231,76,60,0.5)`,
              opacity: xOpacity,
            }}
          >
            X
          </div>
        </div>

        {/* "Not like this" text — slides from side */}
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.red,
            opacity: textOpacity,
            transform: `translateX(${textX}px)`,
            textAlign: "center",
          }}
        >
          לא ככה.
          <br />
          <span style={{ fontSize: 30, color: COLORS.textMuted, fontWeight: 400 }}>
            לא בקשה גנרית.
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
