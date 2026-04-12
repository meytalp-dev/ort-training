import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { bgGradient, COLORS, FONTS } from "../styles";

export const Scene8Numbers: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const accentColors = [COLORS.tealAccent, COLORS.orange, COLORS.gold];

  const numbers = [
    { value: "100+", label: "תוצרים", delay: 0, accentColor: accentColors[0] },
    { value: "0", label: "שורות קוד", delay: 15, accentColor: accentColors[1] },
    { value: "1", label: "מורה", delay: 30, accentColor: accentColors[2] },
  ];

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
          right: -60 + blob1X,
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
          bottom: 150 + blob2Y,
          left: -80 + blob2X,
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
          gap: 40,
          padding: "0 40px",
        }}
      >
        {numbers.map((item, i) => {
          const localFrame = Math.max(0, frame - item.delay);

          // Slide in from alternating sides
          const fromSide = i % 2 === 0 ? "right" : "left";
          const slideX = spring({
            frame: localFrame,
            fps,
            from: fromSide === "right" ? 600 : -600,
            to: 0,
            config: { damping: 7, mass: 0.5 },
          });

          const scale = spring({
            frame: localFrame,
            fps,
            from: 0.5,
            to: 1,
            config: { damping: 7, mass: 0.5 },
          });

          const opacity = interpolate(
            frame,
            [item.delay, item.delay + 8],
            [0, 1],
            { extrapolateRight: "clamp" }
          );

          // "0" gets a SLAM effect (scale from 5 to 1)
          let displayValue = item.value;
          let numberScale = 1;
          if (item.value === "0") {
            numberScale = spring({
              frame: Math.max(0, localFrame - 5),
              fps,
              from: 5,
              to: 1,
              config: { damping: 6, mass: 0.3 },
            });
          }

          // Subtle float when resting
          const floatY = localFrame > 25 ? Math.sin((localFrame - 25) / 15) * 4 : 0;

          return (
            <div
              key={i}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 30,
                transform: `translateX(${slideX}px) translateY(${floatY}px) scale(${scale})`,
                opacity,
                background: COLORS.white,
                borderRadius: 24,
                padding: "28px 50px",
                boxShadow: "0 12px 40px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.03)",
                borderLeft: `6px solid ${item.accentColor}`,
                borderRight: "none",
                borderTop: "1px solid rgba(0,0,0,0.06)",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                width: "85%",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: 120,
                  fontWeight: 900,
                  background: `linear-gradient(135deg, ${item.accentColor}, ${COLORS.gold})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1,
                  position: "relative",
                  zIndex: 1,
                  transform: item.value === "0" ? `scale(${numberScale})` : undefined,
                }}
              >
                {displayValue}
              </div>
              <div
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: 44,
                  fontWeight: 600,
                  color: COLORS.textDark,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
