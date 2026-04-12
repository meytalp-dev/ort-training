import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { STYLE, bgStyle } from "../styles";
import { Particles } from "../Particles";

// Number Slam: "44" + "סקילים. 0 חזרות."
export const SummaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numScale = spring({ frame, fps, from: 5, to: 1, config: { damping: 5, mass: 0.3, stiffness: 200 } });
  const numOpacity = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });

  const shakeX = frame >= 0 && frame <= 8
    ? Math.sin(frame * 12) * (8 - frame) * 2 : 0;
  const shakeY = frame >= 0 && frame <= 8
    ? Math.cos(frame * 10) * (8 - frame) * 1.5 : 0;

  const flashOpacity = interpolate(frame, [0, 2, 8], [0, 0.3, 0], { extrapolateRight: "clamp" });

  const tagOpacity = interpolate(frame, [25, 35], [0, 1], { extrapolateRight: "clamp" });
  const tagY = spring({ frame: Math.max(0, frame - 25), fps, from: 40, to: 0, config: { damping: 8, mass: 0.5 } });

  const icons = [
    { path: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", color: STYLE.accent, angle: -30, delay: 15 },
    { path: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z", color: STYLE.teal, angle: 90, delay: 20 },
    { path: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", color: "#4A90D9", angle: 210, delay: 25 },
  ];

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      <div style={{
        position: "absolute", inset: 0,
        background: STYLE.accent,
        opacity: flashOpacity,
        pointerEvents: "none", zIndex: 20,
      }} />

      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 30, zIndex: 10,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}>
        <div style={{
          fontFamily: STYLE.fontHeading, fontSize: 280, fontWeight: 900,
          color: STYLE.accent,
          transform: `scale(${numScale})`,
          opacity: numOpacity,
          textShadow: `0 0 80px ${STYLE.accent}50`,
          lineHeight: 1,
        }}>
          44
        </div>

        <div style={{ position: "relative", width: 400, height: 80 }}>
          {icons.map((icon, i) => {
            const iconDist = spring({
              frame: Math.max(0, frame - icon.delay), fps,
              from: 300, to: 0,
              config: { damping: 6, mass: 0.4, stiffness: 180 },
            });
            const iconScale = spring({
              frame: Math.max(0, frame - icon.delay), fps,
              from: 2.5, to: 1,
              config: { damping: 5, mass: 0.3 },
            });
            const iconOpacity = interpolate(frame, [icon.delay, icon.delay + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const rad = (icon.angle * Math.PI) / 180;
            const ix = Math.cos(rad) * iconDist;
            const iy = Math.sin(rad) * iconDist;
            const settledX = (i - 1) * 120;
            const finalX = frame > icon.delay + 15 ? settledX : ix + settledX;
            const finalY = frame > icon.delay + 15 ? 0 : iy;

            return (
              <div key={i} style={{
                position: "absolute",
                left: 200 + finalX - 30,
                top: 40 + finalY - 30,
                width: 56, height: 56,
                borderRadius: 16,
                background: `${icon.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transform: `scale(${iconScale})`,
                opacity: iconOpacity,
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={icon.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon.path} />
                </svg>
              </div>
            );
          })}
        </div>

        <div style={{
          fontFamily: STYLE.fontHeading, fontSize: 48, fontWeight: 700,
          color: STYLE.textDark, textAlign: "center",
          opacity: tagOpacity,
          transform: `translateY(${tagY}px)`,
          direction: "rtl",
        }}>
          44 סקילים. <span style={{ color: STYLE.accent }}>0 חזרות.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
