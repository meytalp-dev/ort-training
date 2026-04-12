import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GREG, gregBg } from "../styles";
import { Particles } from "../Particles";

// Card flips to reveal the message
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card starts face-down, flips to face-up
  const flipProgress = spring({
    frame: Math.max(0, frame - 4),
    fps,
    from: 0,
    to: 180,
    config: { damping: 12, mass: 0.8 },
  });
  const cardOpacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });

  // Determine which face is showing
  const showFront = flipProgress > 90;
  const rotateY = showFront ? flipProgress - 180 : flipProgress;

  // After flip: subtitle emerges from card bottom
  const subStart = 24;
  const subY = spring({
    frame: Math.max(0, frame - subStart),
    fps,
    from: 0,
    to: 120,
    config: { damping: 8, mass: 0.5 },
  });
  const subOpacity = interpolate(frame, [subStart, subStart + 6], [0, 1], { extrapolateRight: "clamp" });
  const subScale = spring({
    frame: Math.max(0, frame - subStart),
    fps,
    from: 0.5,
    to: 1,
    config: { damping: 7, mass: 0.4 },
  });

  // Glow intensifies after flip
  const glowIntensity = interpolate(frame, [12, 20], [0, 1], { extrapolateRight: "clamp" });

  // Impact flash on flip completion
  const flashOpacity = interpolate(frame, [14, 16, 20], [0, 0.2, 0], { extrapolateRight: "clamp" });

  const floatY = Math.sin(frame / 14) * 5;

  return (
    <AbsoluteFill style={gregBg}>
      <Particles />

      {/* Flash */}
      <div style={{
        position: "absolute", inset: 0, background: GREG.accent,
        opacity: flashOpacity, zIndex: 1,
      }} />

      {/* Glow behind card */}
      <div style={{
        position: "absolute", top: "46%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600, height: 400, borderRadius: "50%",
        background: `radial-gradient(circle, ${GREG.accent}20 0%, transparent 70%)`,
        opacity: glowIntensity, pointerEvents: "none", zIndex: 1,
      }} />

      {/* 3D flip card */}
      <div style={{
        position: "absolute", top: "46%", left: "50%",
        transform: `translate(-50%, -50%) translateY(${floatY}px)`,
        perspective: 1200, zIndex: 2,
      }}>
        <div style={{
          width: 900, height: 450,
          transform: `rotateY(${rotateY}deg)`,
          opacity: cardOpacity,
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
        }}>
          {/* BACK face (visible first) — CC orange with logo */}
          {!showFront && (
            <div style={{
              width: "100%", height: "100%",
              background: `linear-gradient(135deg, ${GREG.accent}, ${GREG.accentDark})`,
              borderRadius: GREG.cardRadius,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 20,
              boxShadow: `0 20px 60px ${GREG.accent}30, 0 0 80px ${GREG.accent}10`,
            }}>
              {/* CC logo symbol */}
              <svg width={90} height={90} viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <div style={{
                fontFamily: GREG.fontHeading, fontSize: 36, fontWeight: 700,
                color: "rgba(255,255,255,0.6)",
              }}>
                ?
              </div>
            </div>
          )}

          {/* FRONT face (after flip) — white glass with title */}
          {showFront && (
            <div style={{
              width: "100%", height: "100%",
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(20px)",
              borderRadius: GREG.cardRadius,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 16,
              boxShadow: `0 20px 60px ${GREG.accent}20, 0 0 1px rgba(255,255,255,0.6) inset`,
              border: "1px solid rgba(255,255,255,0.5)",
            }}>
              {/* LTR wrapper for English text */}
              <div style={{ direction: "ltr" }}>
                <div style={{
                  fontFamily: GREG.fontHeading, fontSize: 88, fontWeight: 900,
                  color: GREG.textDark,
                  textShadow: `0 4px 24px ${GREG.accent}20`,
                }}>
                  Claude Code
                </div>
              </div>
              {/* Orange underline */}
              <div style={{
                width: 300, height: 6,
                background: `linear-gradient(90deg, ${GREG.accentLight}, ${GREG.accent}, ${GREG.accentLight})`,
                borderRadius: 3,
                boxShadow: `0 0 16px ${GREG.accent}50`,
              }} />
            </div>
          )}
        </div>
      </div>

      {/* Subtitle — emerges from below card */}
      <div style={{
        position: "absolute", top: "46%", left: "50%",
        transform: `translate(-50%, calc(-50% + ${180 + subY}px)) scale(${subScale})`,
        opacity: subOpacity, zIndex: 3,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${GREG.accent}, ${GREG.accentDark})`,
          borderRadius: 60, padding: "16px 48px",
          boxShadow: `0 8px 30px ${GREG.accent}40`,
        }}>
          <span style={{
            fontFamily: GREG.fontHeading, fontSize: 40, fontWeight: 700,
            color: GREG.textLight,
          }}>
            כבר לא מחכה לך.
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
