import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { STYLE, bgStyle } from "../styles";
import { Particles } from "../Particles";

// CTA: Photo + Social — Hebrew, broader subtitle
export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const photoScale = spring({ frame, fps, from: 0.3, to: 1, config: { damping: 7, mass: 0.5 } });
  const photoOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const glowScale = spring({ frame: Math.max(0, frame - 3), fps, from: 0.5, to: 1.3, config: { damping: 12, mass: 0.6 } });

  const nameOpacity = interpolate(frame, [15, 25], [0, 1], { extrapolateRight: "clamp" });
  const nameY = spring({ frame: Math.max(0, frame - 15), fps, from: 30, to: 0, config: { damping: 8, mass: 0.5 } });

  const btnOpacity = interpolate(frame, [30, 40], [0, 1], { extrapolateRight: "clamp" });
  const btnPulse = 1 + Math.sin(frame / 5) * 0.03;

  const socialOpacity = interpolate(frame, [45, 55], [0, 1], { extrapolateRight: "clamp" });
  const followOpacity = interpolate(frame, [55, 65], [0, 1], { extrapolateRight: "clamp" });

  const socials = [
    { name: "Facebook", color: "#1877F2", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
    { name: "Instagram", color: "#E4405F", path: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" },
    { name: "LinkedIn", color: "#0A66C2", path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" },
  ];

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 28, zIndex: 10,
        marginTop: -60,
      }}>
        <div style={{
          position: "absolute", top: "28%", left: "50%",
          width: 280, height: 280,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${STYLE.accent}30 0%, transparent 70%)`,
          transform: `translate(-50%, -50%) scale(${glowScale})`,
          opacity: 0.4,
          pointerEvents: "none",
        }} />

        <div style={{
          width: 180, height: 180,
          borderRadius: "50%",
          border: `4px solid ${STYLE.accent}`,
          boxShadow: `0 0 40px ${STYLE.accent}30`,
          overflow: "hidden",
          transform: `scale(${photoScale})`,
          opacity: photoOpacity,
          background: "#eee",
        }}>
          <Img src={staticFile("meytal.jpeg")} style={{
            width: "100%", height: "100%", objectFit: "cover",
          }} />
        </div>

        <div style={{
          opacity: nameOpacity,
          transform: `translateY(${nameY}px)`,
          textAlign: "center", direction: "rtl",
        }}>
          <div style={{
            fontFamily: STYLE.fontHeading, fontSize: 48, fontWeight: 800,
            color: STYLE.textDark,
          }}>
            מיטל פלג
          </div>
          <div style={{
            fontFamily: STYLE.fontBody, fontSize: 32,
            color: STYLE.textMuted, marginTop: 4,
          }}>
            אוטומציה חכמה עם AI
          </div>
        </div>

        <div style={{
          opacity: btnOpacity,
          transform: `scale(${btnPulse})`,
          padding: "20px 56px",
          borderRadius: 50,
          background: `linear-gradient(135deg, ${STYLE.accent}, ${STYLE.accentDark})`,
          boxShadow: `0 8px 30px ${STYLE.accent}40`,
        }}>
          <span style={{
            fontFamily: STYLE.fontHeading, fontSize: 32, fontWeight: 700,
            color: STYLE.textLight,
          }}>
            Learni.ai
          </span>
        </div>

        <div style={{
          display: "flex", gap: 24,
          opacity: socialOpacity,
          marginTop: 10,
        }}>
          {socials.map((s, i) => {
            const iconScale = spring({
              frame: Math.max(0, frame - 45 - i * 5), fps,
              from: 0, to: 1,
              config: { damping: 5, mass: 0.3, stiffness: 250 },
            });
            return (
              <div key={s.name} style={{
                width: 72, height: 72, borderRadius: 18,
                background: `${s.color}15`,
                border: `1px solid ${s.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transform: `scale(${iconScale})`,
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill={s.color}>
                  <path d={s.path} />
                </svg>
              </div>
            );
          })}
        </div>

        <div style={{
          fontFamily: STYLE.fontBody, fontSize: 32, fontWeight: 500,
          color: STYLE.textMuted, textAlign: "center",
          opacity: followOpacity, direction: "rtl",
          lineHeight: 1.6,
        }}>
          מחולל סקילים חינמי — לינק בביו
        </div>

        <div style={{
          fontFamily: STYLE.fontBody, fontSize: 28, fontWeight: 400,
          color: STYLE.textMuted, textAlign: "center",
          opacity: interpolate(frame, [65, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          direction: "rtl",
        }}>
          עקבו אחריי ברשתות החברתיות
        </div>
      </div>
    </AbsoluteFill>
  );
};
