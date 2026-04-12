import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { bgGradient, COLORS, FONTS } from "../styles";

export const Scene10CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title — bouncy scale in
  const titleScale = spring({
    frame,
    fps,
    from: 0.3,
    to: 1,
    config: { damping: 6, mass: 0.5 },
  });
  const titleOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleRotate = spring({
    frame,
    fps,
    from: -5,
    to: 0,
    config: { damping: 8 },
  });

  // CTA Button — bounces in
  const btnStart = 18;
  const btnScale = spring({
    frame: Math.max(0, frame - btnStart),
    fps,
    from: 0,
    to: 1,
    config: { damping: 6, mass: 0.5 },
  });
  const btnOpacity = interpolate(frame, [btnStart, btnStart + 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Strong pulse glow on button — bigger pulse (1.08)
  const pulsePhase = Math.max(0, frame - btnStart - 12);
  const pulse = 1 + Math.sin(pulsePhase / 5) * 0.08;
  const glowIntensity = 0.3 + Math.sin(pulsePhase / 6) * 0.2;
  const glowSpread = 40 + Math.sin(pulsePhase / 6) * 20;

  // Price text
  const priceStart = 35;
  const priceOpacity = interpolate(frame, [priceStart, priceStart + 8], [0, 1], {
    extrapolateRight: "clamp",
  });
  const priceScale = spring({
    frame: Math.max(0, frame - priceStart),
    fps,
    from: 0.7,
    to: 1,
    config: { damping: 7 },
  });

  // "הקישור בביו" — pulsing orange
  const bioStart = 50;
  const bioOpacity = interpolate(frame, [bioStart, bioStart + 8], [0, 1], {
    extrapolateRight: "clamp",
  });
  const bioPulse = frame >= bioStart ? 0.7 + Math.sin((frame - bioStart) / 4) * 0.3 : 0;

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
          top: 100 + blob1Y,
          right: -80 + blob1X,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(232,133,61,0.12) 0%, transparent 70%)`,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 200 + blob2Y,
          left: -100 + blob2X,
          width: 550,
          height: 550,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(137,207,240,0.1) 0%, transparent 70%)`,
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          padding: "0 60px",
          textAlign: "center",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 60,
            fontWeight: 800,
            color: COLORS.textDark,
            lineHeight: 1.4,
            transform: `scale(${titleScale}) rotate(${titleRotate}deg)`,
            opacity: titleOpacity,
          }}
        >
          רוצים ללמוד איך?
        </div>

        {/* CTA Button — ORANGE with pulse glow */}
        <div
          style={{
            position: "relative",
            transform: `scale(${btnScale * pulse})`,
            opacity: btnOpacity,
          }}
        >
          {/* Glow behind button */}
          <div
            style={{
              position: "absolute",
              inset: -20,
              borderRadius: 80,
              background: `linear-gradient(135deg, rgba(232,133,61,${glowIntensity}) 0%, rgba(200,110,30,${glowIntensity}) 100%)`,
              filter: `blur(${glowSpread}px)`,
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "relative",
              background: `linear-gradient(135deg, ${COLORS.orange} 0%, #D0722A 100%)`,
              borderRadius: 60,
              padding: "24px 60px",
              boxShadow: `0 12px 40px rgba(232,133,61,0.3), 0 0 ${glowSpread}px rgba(232,133,61,${glowIntensity * 0.5})`,
              zIndex: 1,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.heading,
                fontSize: 36,
                fontWeight: 700,
                color: COLORS.white,
              }}
            >
              הדרכת Claude Code למורים
            </div>
          </div>
        </div>

        {/* Price */}
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 28,
            color: COLORS.textMuted,
            opacity: priceOpacity,
            transform: `scale(${priceScale})`,
          }}
        >
          99 ש״ח בלבד
        </div>

        {/* "הקישור בביו" — pulsing orange */}
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 34,
            fontWeight: 700,
            color: COLORS.orange,
            opacity: bioOpacity * bioPulse,
            marginTop: 10,
          }}
        >
          הקישור בביו
        </div>
      </div>
    </AbsoluteFill>
  );
};
