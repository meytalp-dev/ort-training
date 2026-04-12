import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { FLOW, flowBg } from "../styles";
import { FlowParticles } from "../FlowParticles";

// CTA — photo + "want to learn more?" + tutorial link + FB/IG
export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Photo
  const photoScale = spring({ frame, fps, from: 0.3, to: 1, config: { damping: 7, mass: 0.4 } });
  const photoOpacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });

  // Glow ring
  const ringScale = spring({ frame: Math.max(0, frame - 4), fps, from: 0.5, to: 1.3, config: { damping: 12, mass: 0.8 } });
  const ringOpacity = interpolate(frame, [4, 8, 20], [0, 0.2, 0.1], { extrapolateRight: "clamp" });

  // Name
  const nameStart = 8;
  const nameOpacity = interpolate(frame, [nameStart, nameStart + 5], [0, 1], { extrapolateRight: "clamp" });

  // "Want to learn more?"
  const questionStart = 14;
  const questionOpacity = interpolate(frame, [questionStart, questionStart + 6], [0, 1], { extrapolateRight: "clamp" });
  const questionY = spring({
    frame: Math.max(0, frame - questionStart), fps,
    from: 25, to: 0, config: { damping: 10, mass: 0.5 },
  });

  // Button
  const btnStart = 22;
  const btnScale = spring({
    frame: Math.max(0, frame - btnStart), fps,
    from: 0, to: 1, config: { damping: 5, mass: 0.3, stiffness: 250 },
  });
  const pulse = frame >= btnStart + 12 ? 1 + Math.sin((frame - btnStart - 12) / 5) * 0.03 : 1;

  // Social icons
  const iconsStart = 30;
  const iconsOpacity = interpolate(frame, [iconsStart, iconsStart + 6], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={flowBg}>
      <FlowParticles />

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 22, zIndex: 2,
      }}>
        {/* Photo + ring */}
        <div style={{ position: "relative" }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: `translate(-50%, -50%) scale(${ringScale})`,
            width: 200, height: 200, borderRadius: "50%",
            border: `2px solid ${FLOW.accent}`,
            boxShadow: `0 0 30px ${FLOW.accent}30`,
            opacity: ringOpacity,
          }} />
          <div style={{
            width: 170, height: 170, borderRadius: "50%", overflow: "hidden",
            border: `3px solid ${FLOW.accent}`,
            boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 30px ${FLOW.accent}20`,
            transform: `scale(${photoScale})`, opacity: photoOpacity,
          }}>
            <Img src={staticFile("meytal.jpeg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>

        {/* Name */}
        <div style={{
          fontFamily: FLOW.fontHeading, fontSize: 40, fontWeight: 800,
          color: FLOW.textLight, opacity: nameOpacity,
        }}>
          מיטל פלג
        </div>

        {/* "Want to learn more?" */}
        <div style={{
          fontFamily: "'Playpen Sans Hebrew', 'Rubik', sans-serif",
          fontSize: 52, fontWeight: 400,
          color: FLOW.accent, opacity: questionOpacity,
          transform: `translateY(${questionY}px)`,
          textShadow: `0 0 25px ${FLOW.accent}30`,
        }}>
          רוצים לדעת עוד?
        </div>

        {/* Tutorial button */}
        <div style={{
          background: `linear-gradient(135deg, ${FLOW.accent}, ${FLOW.purple})`,
          borderRadius: 60, padding: "20px 48px",
          transform: `scale(${btnScale * pulse})`,
          boxShadow: `0 8px 28px rgba(0,0,0,0.4), 0 0 30px ${FLOW.accent}25`,
        }}>
          <span style={{
            fontFamily: FLOW.fontHeading, fontSize: 36, fontWeight: 700,
            color: FLOW.textLight,
          }}>
            מצגת הדרכה מלאה
          </span>
        </div>

        {/* Social icons + platforms */}
        <div style={{
          display: "flex", gap: 36, opacity: iconsOpacity,
          marginTop: 8,
        }}>
          {[
            { icon: "f", label: "פייסבוק", color: "#1877F2" },
            { icon: "@", label: "אינסטגרם", color: "#E4405F" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: item.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: FLOW.fontHeading, fontSize: 24, fontWeight: 700,
                color: FLOW.textLight,
                boxShadow: `0 4px 16px ${item.color}40`,
              }}>
                {item.icon}
              </div>
              <span style={{
                fontFamily: FLOW.fontBody, fontSize: 22, fontWeight: 600,
                color: FLOW.textMuted,
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom text */}
        <div style={{
          fontFamily: FLOW.fontBody, fontSize: 30, fontWeight: 600,
          color: FLOW.accent, opacity: iconsOpacity,
          marginTop: 4,
        }}>
          הלינקים בתגובה הראשונה
        </div>

        {/* Learni watermark */}
        <div style={{
          fontFamily: FLOW.fontHeading, fontSize: 24, fontWeight: 500,
          color: "rgba(255,255,255,0.2)", opacity: iconsOpacity,
          direction: "ltr",
        }}>
          Learni.ai
        </div>
      </div>
    </AbsoluteFill>
  );
};
