import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { GREG, gregBg } from "../styles";
import { Particles } from "../Particles";

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Photo
  const photoScale = spring({ frame, fps, from: 0.3, to: 1, config: { damping: 7, mass: 0.4 } });
  const photoOpacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });

  // Glow ring around photo
  const ringScale = spring({ frame: Math.max(0, frame - 4), fps, from: 0.5, to: 1.3, config: { damping: 12, mass: 0.8 } });
  const ringOpacity = interpolate(frame, [4, 8, 20], [0, 0.15, 0.08], { extrapolateRight: "clamp" });

  // Name
  const nameStart = 8;
  const nameOpacity = interpolate(frame, [nameStart, nameStart + 5], [0, 1], { extrapolateRight: "clamp" });

  // Button
  const btnStart = 16;
  const btnScale = spring({ frame: Math.max(0, frame - btnStart), fps, from: 0, to: 1, config: { damping: 5, mass: 0.3, stiffness: 250 } });
  const pulse = frame >= btnStart + 12 ? 1 + Math.sin((frame - btnStart - 12) / 5) * 0.03 : 1;

  return (
    <AbsoluteFill style={gregBg}>
      <Particles />
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 24, zIndex: 2,
      }}>
        {/* Photo + ring */}
        <div style={{ position: "relative" }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: `translate(-50%, -50%) scale(${ringScale})`,
            width: 200, height: 200, borderRadius: "50%",
            border: `3px solid ${GREG.accent}`, opacity: ringOpacity,
          }} />
          <div style={{
            width: 180, height: 180, borderRadius: "50%", overflow: "hidden",
            border: `4px solid ${GREG.accent}`,
            boxShadow: `0 12px 40px rgba(217,119,87,0.3)`,
            transform: `scale(${photoScale})`, opacity: photoOpacity,
          }}>
            <Img src={staticFile("meytal.jpeg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>

        <div style={{
          fontFamily: GREG.fontHeading, fontSize: 42, fontWeight: 800,
          color: GREG.textDark, opacity: nameOpacity,
        }}>
          מיטל פלג
        </div>

        <div style={{
          background: GREG.accent, borderRadius: 60, padding: "18px 52px",
          transform: `scale(${btnScale * pulse})`,
          boxShadow: `0 8px 28px rgba(217,119,87,0.35)`,
        }}>
          <span style={{ fontFamily: GREG.fontHeading, fontSize: 36, fontWeight: 700, color: GREG.textLight }}>
            Learni.ai
          </span>
        </div>

        {/* Social icons row */}
        <div style={{
          display: "flex", gap: 24, opacity: nameOpacity,
          marginTop: 8,
        }}>
          {[
            { icon: "f", label: "פייסבוק" },
            { icon: "@", label: "אינסטגרם" },
            { icon: "✉", label: "מייל" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: GREG.accent,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: GREG.fontHeading, fontSize: 22, fontWeight: 700,
                color: GREG.textLight,
                boxShadow: `0 4px 16px ${GREG.accent}30`,
              }}>
                {item.icon}
              </div>
              <span style={{
                fontFamily: GREG.fontBody, fontSize: 20, fontWeight: 600,
                color: GREG.textMuted,
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Link in comments */}
        <div style={{
          fontFamily: GREG.fontBody, fontSize: 30, fontWeight: 600,
          color: GREG.accent, opacity: nameOpacity,
          marginTop: 8,
        }}>
          הלינקים בתגובה הראשונה
        </div>
      </div>
    </AbsoluteFill>
  );
};
