import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { STITCH, stitchBg } from "../styles";
import { Particles } from "../Particles";

// Feature 3: 3D Card Flip — prompt on back, result on front (behavioral plan)
export const Feature3Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const floatY = Math.sin(frame / 14) * 5;

  // Badge "03"
  const badgeScale = spring({
    frame: Math.max(0, frame - 4), fps, from: 0, to: 1,
    config: { damping: 5, mass: 0.3 },
  });

  // Card entrance — slides up from bottom
  const cardEntryY = spring({
    frame, fps, from: 500, to: 0,
    config: { damping: 8, mass: 0.6 },
  });
  const cardEntryOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  // Prompt text appears on back (frame 10-50)
  const promptLines = [
    "עצב לי תוכנית התנהגותית לכיתה",
    "עם מעקב תלמידים וצבעים",
    "וגרפים של התקדמות",
  ];
  const promptOpacity = interpolate(frame, [10, 18], [0, 1], { extrapolateRight: "clamp" });

  // Glow pulse on back before flip
  const backGlow = frame < 60 ? 0.15 + Math.sin(frame / 4) * 0.1 : 0;

  // === FLIP at frame 60 ===
  const flipStart = 60;
  const flipProgress = spring({
    frame: Math.max(0, frame - flipStart), fps,
    from: 0, to: 180,
    config: { damping: 12, mass: 0.8 },
  });
  const showFront = flipProgress > 90;
  const rotateY = showFront ? flipProgress - 180 : flipProgress;

  // Flash on flip completion
  const flashFrame = flipStart + 15;
  const flashOpacity = interpolate(frame, [flashFrame, flashFrame + 3, flashFrame + 10], [0, 0.3, 0], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // Screen shake on flip
  const shakeX = frame >= flashFrame && frame < flashFrame + 8
    ? Math.sin(frame * 12) * (flashFrame + 8 - frame) * 1.5 : 0;
  const shakeY = frame >= flashFrame && frame < flashFrame + 8
    ? Math.cos(frame * 10) * (flashFrame + 8 - frame) * 1 : 0;

  // Expanding ring on flip
  const ringStart = flashFrame;
  const ringScale = spring({
    frame: Math.max(0, frame - ringStart), fps,
    from: 0.3, to: 3.5,
    config: { damping: 16, mass: 0.7 },
  });
  const ringOpacity = interpolate(frame, [ringStart, ringStart + 4, ringStart + 16], [0, 0.4, 0], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // Highlight text
  const hlStart = 120;
  const hlOpacity = interpolate(frame, [hlStart, hlStart + 8], [0, 1], { extrapolateRight: "clamp" });
  const hlScale = spring({
    frame: Math.max(0, frame - hlStart), fps,
    from: 2, to: 1, config: { damping: 5, mass: 0.3, stiffness: 200 },
  });

  // Sparkles after flip
  const sparkles = [
    { x: -350, y: -180, delay: flashFrame + 6, size: 16 },
    { x: 370, y: -120, delay: flashFrame + 8, size: 14 },
    { x: -280, y: 160, delay: flashFrame + 10, size: 18 },
    { x: 320, y: 180, delay: flashFrame + 12, size: 13 },
  ];

  return (
    <AbsoluteFill style={{
      ...stitchBg,
      transform: `translate(${shakeX}px, ${shakeY}px)`,
    }}>
      <Particles />

      {/* Flash on flip */}
      <div style={{
        position: "absolute", inset: -20,
        background: `radial-gradient(circle, #fff 0%, ${STITCH.accent} 30%, transparent 60%)`,
        opacity: flashOpacity, zIndex: 20, pointerEvents: "none",
      }} />

      {/* Expanding ring on flip */}
      {frame >= ringStart && (
        <div style={{
          position: "absolute", top: "46%", left: "50%",
          transform: `translate(-50%, -50%) scale(${ringScale})`,
          width: 200, height: 200, borderRadius: "50%",
          border: `2px solid ${STITCH.accent}`,
          opacity: ringOpacity,
          boxShadow: `0 0 30px ${STITCH.accent}50, inset 0 0 20px ${STITCH.accent}20`,
          pointerEvents: "none", zIndex: 1,
        }} />
      )}

      {/* 3D Card Container */}
      <div style={{
        position: "absolute", top: "46%", left: "50%",
        transform: `translate(-50%, calc(-50% + ${cardEntryY + floatY}px))`,
        opacity: cardEntryOpacity, zIndex: 2,
        width: 920, perspective: 1200,
      }}>
        {/* Badge (outside flip) */}
        <div style={{
          background: `linear-gradient(135deg, ${STITCH.accent}, ${STITCH.accentDark})`,
          borderRadius: 50, padding: "8px 28px",
          position: "absolute", top: -20, left: "50%",
          transform: `translateX(-50%) scale(${badgeScale})`,
          boxShadow: `0 4px 16px ${STITCH.accent}50`,
          zIndex: 10,
        }}>
          <span style={{ fontFamily: STITCH.fontHeading, fontSize: 24, fontWeight: 700, color: STITCH.textLight }}>03</span>
        </div>

        {/* Flipping card */}
        <div style={{
          width: "100%",
          transform: `rotateY(${rotateY}deg)`,
          transformStyle: "preserve-3d",
        }}>
          {/* BACK — prompt text on dark background */}
          {!showFront && (
            <div style={{
              background: `linear-gradient(135deg, ${STITCH.cardDark}, #2A3A5A)`,
              borderRadius: STITCH.cardRadius,
              padding: STITCH.cardPadding,
              boxShadow: `${STITCH.shadowHeavy}, 0 0 ${40 * backGlow}px ${STITCH.accent}40`,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
              backfaceVisibility: "hidden",
              minHeight: 500,
            }}>
              {/* Title on back */}
              <div style={{
                fontFamily: STITCH.fontHeading, fontSize: 44, fontWeight: 700,
                color: STITCH.textLight, textAlign: "center", marginTop: 16,
              }}>
                ה-prompt שכתבתי
              </div>

              {/* Prompt lines */}
              <div style={{
                display: "flex", flexDirection: "column", gap: 20,
                opacity: promptOpacity, direction: "rtl",
                width: "100%", padding: "20px 24px",
              }}>
                {promptLines.map((line, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 14,
                  }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: STITCH.accent, flexShrink: 0,
                      boxShadow: `0 0 12px ${STITCH.accent}60`,
                    }} />
                    <span style={{
                      fontFamily: STITCH.fontBody, fontSize: 38, fontWeight: 500,
                      color: STITCH.textLight, lineHeight: 1.4,
                    }}>
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FRONT — result screenshot on glassmorphism */}
          {showFront && (
            <div style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(20px)",
              borderRadius: STITCH.cardRadius,
              padding: 24,
              boxShadow: STITCH.shadowHeavy,
              border: "1px solid rgba(255,255,255,0.5)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
              backfaceVisibility: "hidden",
              minHeight: 500,
            }}>
              {/* Title on front */}
              <div style={{
                fontFamily: STITCH.fontHeading, fontSize: 44, fontWeight: 700,
                color: STITCH.textDark, textAlign: "center", marginTop: 8,
              }}>
                מה שקיבלתי
              </div>

              {/* Result screenshot */}
              <div style={{
                width: "100%", borderRadius: 16, overflow: "hidden",
                boxShadow: STITCH.shadowHeavy,
              }}>
                <Img
                  src={staticFile("screenshots/result-behavior.png")}
                  style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sparkles after flip */}
      {sparkles.map((s, i) => {
        if (frame < s.delay) return null;
        const sF = Math.max(0, frame - s.delay);
        const sScale = spring({ frame: sF, fps, from: 0, to: 1, config: { damping: 4, mass: 0.2, stiffness: 300 } });
        const twinkle = 0.4 + Math.sin((frame + i * 10) / 3) * 0.6;
        return (
          <div key={`spark-${i}`} style={{
            position: "absolute", top: "46%", left: "50%",
            transform: `translate(calc(-50% + ${s.x}px), calc(-50% + ${s.y}px)) scale(${sScale}) rotate(45deg)`,
            width: s.size, height: s.size,
            background: i % 2 === 0 ? STITCH.accentLight : STITCH.accent,
            opacity: twinkle * 0.6,
            boxShadow: `0 0 ${s.size * 3}px ${STITCH.accentLight}50`,
            zIndex: 9, pointerEvents: "none",
          }} />
        );
      })}

      {/* Highlight text */}
      {frame >= hlStart && (
        <div style={{
          position: "absolute", top: "85%", left: "50%",
          transform: `translateX(-50%) scale(${hlScale})`,
          opacity: hlOpacity, zIndex: 10,
        }}>
          <div style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(12px)",
            borderRadius: 60, padding: "14px 40px",
            boxShadow: `0 8px 30px ${STITCH.accent}20`,
            border: "1px solid rgba(255,255,255,0.4)",
          }}>
            <span style={{
              fontFamily: STITCH.fontHeading, fontSize: 44, fontWeight: 700,
              color: STITCH.accent, textAlign: "center",
            }}>
              תוכנית התנהגותית לכיתה. 4 דקות.
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
