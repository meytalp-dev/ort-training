import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { POMELLI, pomelliBg } from "../styles";
import { Particles } from "../Particles";

// Feature 2 — Photoshoot AI: write concept, get studio photography
export const Feature2Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const floatY = Math.sin(frame / 14) * 5;

  // Badge
  const badgeScale = spring({ frame: Math.max(0, frame - 4), fps, from: 0, to: 1, config: { damping: 4, mass: 0.2, stiffness: 300 } });

  // === PHASE 1: Typewriter text (frame 0-50) ===
  const conceptText = "שעון חול מרחף, תאורת סטודיו דרמטית, רקע לבן...";
  const charsPerFrame = 0.7;
  const typewriterStart = 8;
  const visibleChars = Math.min(
    conceptText.length,
    Math.max(0, Math.floor((frame - typewriterStart) * charsPerFrame))
  );
  const displayedText = conceptText.substring(0, visibleChars);
  const cursorVisible = frame >= typewriterStart && visibleChars < conceptText.length
    ? Math.sin(frame / 3) > 0 ? 1 : 0
    : 0;

  // Typewriter card
  const typeCardOpacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  const typeCardFade = interpolate(frame, [55, 65], [1, 0], { extrapolateRight: "clamp" });

  // === PHASE 2: Two photoshoot results appear (frame 60+) ===
  const photo1Start = 60;
  const photo1Y = spring({
    frame: Math.max(0, frame - photo1Start), fps,
    from: 400, to: 0,
    config: { damping: 8, mass: 0.6, stiffness: 120 },
  });
  const photo1Opacity = interpolate(frame, [photo1Start, photo1Start + 6], [0, 1], { extrapolateRight: "clamp" });

  const photo2Start = 68;
  const photo2Y = spring({
    frame: Math.max(0, frame - photo2Start), fps,
    from: 400, to: 0,
    config: { damping: 8, mass: 0.6, stiffness: 120 },
  });
  const photo2Opacity = interpolate(frame, [photo2Start, photo2Start + 6], [0, 1], { extrapolateRight: "clamp" });

  // Title
  const titleOpacity = interpolate(frame, [photo2Start + 10, photo2Start + 18], [0, 1], { extrapolateRight: "clamp" });

  // Highlight
  const hlStart = 100;
  const hlOpacity = interpolate(frame, [hlStart, hlStart + 8], [0, 1], { extrapolateRight: "clamp" });
  const hlScale = spring({ frame: Math.max(0, frame - hlStart), fps, from: 1.5, to: 1, config: { damping: 6, mass: 0.3 } });

  return (
    <AbsoluteFill style={pomelliBg}>
      <Particles />

      {/* Badge 02 — top right */}
      <div style={{
        position: "absolute", top: 60, right: 60,
        width: 64, height: 64, borderRadius: "50%",
        background: `linear-gradient(135deg, ${POMELLI.accent}, ${POMELLI.accentDark})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: `scale(${badgeScale})`,
        boxShadow: `0 8px 20px ${POMELLI.accent}40`,
        zIndex: 10,
      }}>
        <span style={{
          fontFamily: POMELLI.fontHeading, fontSize: 28, fontWeight: 900,
          color: POMELLI.textLight,
        }}>02</span>
      </div>

      {/* Title */}
      <div style={{
        position: "absolute", top: 70, left: "50%",
        transform: `translate(-50%, ${floatY}px)`,
        opacity: titleOpacity, zIndex: 3,
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: POMELLI.fontHeading, fontSize: 52, fontWeight: 900,
          color: POMELLI.textDark,
        }}>
          כותבים קונספט — מקבלים צילום סטודיו
        </div>
      </div>

      {/* === Typewriter card === */}
      <div style={{
        position: "absolute", top: "40%", left: "50%",
        transform: `translate(-50%, calc(-50% + ${floatY}px))`,
        opacity: typeCardOpacity * typeCardFade, zIndex: 2,
        width: 880, height: 200,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        borderRadius: POMELLI.cardRadius,
        boxShadow: POMELLI.shadow,
        border: "1px solid rgba(255,255,255,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px 48px",
      }}>
        <div style={{
          fontFamily: "'Playpen Sans Hebrew', 'Rubik', sans-serif",
          fontSize: 44, fontWeight: 400,
          color: POMELLI.textDark,
          textAlign: "center",
          lineHeight: 1.5,
        }}>
          {displayedText}
          <span style={{
            opacity: cursorVisible,
            color: POMELLI.accent,
            fontWeight: 300,
          }}>|</span>
        </div>
      </div>

      {/* === Two photoshoot results side by side === */}
      <div style={{
        position: "absolute", top: "42%", left: "50%",
        transform: `translate(-50%, calc(-50% + ${floatY}px))`,
        display: "flex", gap: 36,
        zIndex: 4,
      }}>
        {/* Photo 1 — portrait */}
        <div style={{
          width: 320, height: 560,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: POMELLI.shadowHeavy,
          border: "3px solid rgba(255,255,255,0.6)",
          transform: `translateY(${photo1Y}px)`,
          opacity: photo1Opacity,
        }}>
          <Img
            src={staticFile("screenshots/pomelli-asset-1.png")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Photo 2 — portrait */}
        <div style={{
          width: 320, height: 560,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: POMELLI.shadowHeavy,
          border: "3px solid rgba(255,255,255,0.6)",
          transform: `translateY(${photo2Y}px)`,
          opacity: photo2Opacity,
        }}>
          <Img
            src={staticFile("screenshots/pomelli-asset-2.png")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* Highlight at bottom */}
      <div style={{
        position: "absolute", bottom: 100, left: "50%",
        transform: `translateX(-50%) scale(${hlScale}) translateY(${floatY}px)`,
        opacity: hlOpacity, zIndex: 5,
      }}>
        <div style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(12px)",
          borderRadius: 60, padding: "16px 48px",
          boxShadow: `0 8px 30px ${POMELLI.accent}20`,
          border: "1px solid rgba(255,255,255,0.4)",
        }}>
          <span style={{
            fontFamily: POMELLI.fontHeading, fontSize: 44, fontWeight: 900,
            color: POMELLI.textDark,
          }}>
            4 גרסאות מקצועיות. 45 שניות.{" "}
            <span style={{ color: POMELLI.accent }}>0 ₪.</span>
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
