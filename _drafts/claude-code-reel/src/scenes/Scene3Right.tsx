import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { bgGradient, COLORS, FONTS, darkCardStyle } from "../styles";

export const Scene3Right: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Terminal ZOOMS IN from tiny (faster — 60 frames total)
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

  // Checkmark SPINS in with bounce (frame 28, was 35)
  const checkStart = 28;
  const checkScale = spring({
    frame: Math.max(0, frame - checkStart),
    fps,
    from: 0,
    to: 1,
    config: { damping: 6, mass: 0.5 },
  });
  const checkRotate = spring({
    frame: Math.max(0, frame - checkStart),
    fps,
    from: 720,
    to: 0,
    config: { damping: 8, mass: 0.6 },
  });
  const checkOpacity = interpolate(frame, [checkStart, checkStart + 4], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Glow pulse behind checkmark
  const glowPulse = Math.sin((frame - checkStart) / 6) * 0.4 + 0.6;
  const glowScale = 1 + Math.sin((frame - checkStart) / 8) * 0.15;

  // Bottom text — slides from LEFT (frame 40, was 52)
  const textStart = 40;
  const textX = spring({
    frame: Math.max(0, frame - textStart),
    fps,
    from: 400,
    to: 0,
    config: { damping: 7, mass: 0.4 },
  });
  const textOpacity = interpolate(frame, [textStart, textStart + 4], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Breathing
  const breathe = Math.sin(frame / 20) * 0.005 + 1;

  return (
    <AbsoluteFill style={bgGradient}>
      {/* No green flash overlay — removed */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
        }}
      >
        {/* Terminal card (stays dark) */}
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

            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "16px 20px",
                marginTop: 16,
                border: "1px solid rgba(90,184,160,0.3)",
              }}
            >
              <span
                style={{
                  color: COLORS.white,
                  fontSize: 19,
                  fontFamily: FONTS.body,
                  direction: "rtl",
                  display: "block",
                  textAlign: "right",
                }}
              >
                בנה מצגת על צמיחת שיער לכיתה י׳,
                <br />
                עם שאלות הבנה, דוגמאות ותרגול.
                <br />
                עיצוב מודרני, שפה פשוטה.
              </span>
            </div>
          </div>

          {/* Glow behind checkmark */}
          {frame >= checkStart && (
            <div
              style={{
                position: "absolute",
                top: 20,
                left: 20,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `radial-gradient(circle, rgba(39,174,96,${glowPulse * 0.5}) 0%, transparent 70%)`,
                transform: `scale(${glowScale * 2.5})`,
                zIndex: 0,
              }}
            />
          )}

          {/* Checkmark — spins in */}
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              transform: `scale(${checkScale}) rotate(${checkRotate}deg)`,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: COLORS.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 25px rgba(39,174,96,0.4), 0 0 40px rgba(39,174,96,${glowPulse * 0.3})`,
              opacity: checkOpacity,
              zIndex: 1,
            }}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* Bottom text — slides from opposite side */}
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 46,
            fontWeight: 700,
            color: COLORS.green,
            opacity: textOpacity,
            transform: `translateX(${textX}px)`,
            textAlign: "center",
          }}
        >
          ככה.
          <br />
          <span style={{ fontSize: 30, color: COLORS.textMuted, fontWeight: 400 }}>
            פרומפט מדויק = תוצאה מדויקת
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
