import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { POMELLI, pomelliBg } from "../styles";
import { Particles } from "../Particles";

// Feature 3 — Campaign Builder: choose image + text = ready campaign
export const Feature3Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const floatY = Math.sin(frame / 14) * 5;

  // Card appears with 3D rotation
  const cardScale = spring({ frame, fps, from: 0.6, to: 1, config: { damping: 8, mass: 0.5 } });
  const cardOpacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  const cardRotateY = spring({ frame, fps, from: 25, to: 0, config: { damping: 10, mass: 0.6 } });

  // Badge
  const badgeScale = spring({ frame: Math.max(0, frame - 4), fps, from: 0, to: 1, config: { damping: 4, mass: 0.2, stiffness: 300 } });

  // Screenshot
  const screenshotStart = 10;
  const screenshotOpacity = interpolate(frame, [screenshotStart, screenshotStart + 8], [0, 1], { extrapolateRight: "clamp" });

  // Title
  const titleStart = 20;
  const titleOpacity = interpolate(frame, [titleStart, titleStart + 8], [0, 1], { extrapolateRight: "clamp" });
  const titleY = spring({ frame: Math.max(0, frame - titleStart), fps, from: 30, to: 0, config: { damping: 8 } });

  // Format pills
  const pillsStart = 55;
  const pills = ["סטורי", "פיד", "מרובע"];

  // Highlight
  const hlStart = 80;
  const hlOpacity = interpolate(frame, [hlStart, hlStart + 8], [0, 1], { extrapolateRight: "clamp" });
  const hlScale = spring({ frame: Math.max(0, frame - hlStart), fps, from: 1.5, to: 1, config: { damping: 6, mass: 0.3 } });

  return (
    <AbsoluteFill style={pomelliBg}>
      <Particles />

      {/* Title above card */}
      <div style={{
        position: "absolute", top: 70, left: "50%",
        transform: `translate(-50%, ${titleY + floatY}px)`,
        opacity: titleOpacity, zIndex: 3,
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: POMELLI.fontHeading, fontSize: 52, fontWeight: 900,
          color: POMELLI.textDark,
        }}>
          בוחרים תמונה + טקסט = קמפיין מוכן
        </div>
      </div>

      {/* Main card with 3D rotation entrance */}
      <div style={{
        position: "absolute", top: "46%", left: "50%",
        transform: `translate(-50%, calc(-50% + ${floatY}px)) scale(${cardScale}) perspective(1200px) rotateY(${cardRotateY}deg)`,
        opacity: cardOpacity, zIndex: 2,
        width: 920, height: 500,
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(20px)",
        borderRadius: POMELLI.cardRadius,
        boxShadow: `0 20px 60px ${POMELLI.accent}15, 0 0 1px rgba(255,255,255,0.5) inset`,
        border: "1px solid rgba(255,255,255,0.4)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 24,
        overflow: "visible",
      }}>
        {/* Badge 03 */}
        <div style={{
          position: "absolute", top: -20, right: 40,
          width: 64, height: 64, borderRadius: "50%",
          background: `linear-gradient(135deg, ${POMELLI.accent}, ${POMELLI.accentDark})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: `scale(${badgeScale})`,
          boxShadow: `0 8px 20px ${POMELLI.accent}40`,
        }}>
          <span style={{
            fontFamily: POMELLI.fontHeading, fontSize: 28, fontWeight: 900,
            color: POMELLI.textLight,
          }}>03</span>
        </div>

        {/* Screenshot of Campaign Builder */}
        <div style={{
          width: 840, height: 420,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: POMELLI.shadow,
          opacity: screenshotOpacity,
        }}>
          <Img
            src={staticFile("screenshots/pomelli-campaign.png")}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      </div>

      {/* Format pills row */}
      <div style={{
        position: "absolute", bottom: 190, left: "50%",
        transform: `translateX(-50%) translateY(${floatY}px)`,
        display: "flex", gap: 20, zIndex: 3,
      }}>
        {pills.map((pill, i) => {
          const pillStart2 = pillsStart + i * 6;
          const pillScale = spring({
            frame: Math.max(0, frame - pillStart2), fps,
            from: 0, to: 1,
            config: { damping: 5, mass: 0.3, stiffness: 200 },
          });
          const pillOpacity = interpolate(frame, [pillStart2, pillStart2 + 5], [0, 1], { extrapolateRight: "clamp" });

          return (
            <div key={`pill-${i}`} style={{
              transform: `scale(${pillScale})`,
              opacity: pillOpacity,
            }}>
              <div style={{
                background: i === 0
                  ? `linear-gradient(135deg, ${POMELLI.accent}, ${POMELLI.accentDark})`
                  : "rgba(255,255,255,0.88)",
                borderRadius: 60, padding: "14px 36px",
                boxShadow: `0 6px 20px ${POMELLI.accent}20`,
                border: i === 0 ? "none" : `2px solid ${POMELLI.accentLight}`,
              }}>
                <span style={{
                  fontFamily: POMELLI.fontHeading, fontSize: 38, fontWeight: 700,
                  color: i === 0 ? POMELLI.textLight : POMELLI.accent,
                }}>
                  {pill}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Highlight at bottom */}
      <div style={{
        position: "absolute", bottom: 100, left: "50%",
        transform: `translateX(-50%) scale(${hlScale}) translateY(${floatY}px)`,
        opacity: hlOpacity, zIndex: 5,
      }}>
        <div style={{
          fontFamily: POMELLI.fontHeading, fontSize: 44, fontWeight: 700,
          color: POMELLI.accent,
        }}>
          מ-prompt לפוסט מוכן — בדקות.
        </div>
      </div>
    </AbsoluteFill>
  );
};
