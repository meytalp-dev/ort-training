import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { STITCH, stitchBg } from "../styles";
import { Particles } from "../Particles";

// Orbit: 3 cards rotating carousel with SLAM, EXPLOSION, GLOW TRAILS, PULSE
export const BenefitsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title card SLAMS in (scale 5→1) with screen shake and flash
  const titleScale = spring({ frame, fps, from: 5, to: 1, config: { damping: 5, mass: 0.3, stiffness: 200 } });
  const titleOpacity = interpolate(frame, [0, 3, 25, 35], [0, 1, 1, 0], { extrapolateRight: "clamp" });

  // Screen shake on title slam
  const titleShakeX = frame < 12
    ? Math.sin(frame * 14) * (12 - frame) * 2.5 : 0;
  const titleShakeY = frame < 12
    ? Math.cos(frame * 11) * (12 - frame) * 1.8 : 0;

  // Flash on title slam
  const titleFlash = interpolate(frame, [0, 2, 10], [0, 0.4, 0], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // Title fades out (no explosion — save drama for Feature3)

  // Three result cards in orbit
  const cards = [
    { img: "screenshots/result-tasks.png", label: "עיצוב ממשק ניהול" },
    { img: "screenshots/result-behavior.png", label: "עיצוב תוכנית כיתה" },
    { img: "screenshots/result-tasks.png", label: "עיצוב דשבורד" },
  ];

  // Orbit timing
  const orbitStart = 40;
  const orbitFrame = Math.max(0, frame - orbitStart);

  // Smooth rotation angle
  const rotationAngle = interpolate(orbitFrame, [0, 60, 80, 140, 160, 220, 240], [0, 0, 0.33, 0.33, 0.66, 0.66, 0.66], {
    extrapolateRight: "clamp",
  }) * Math.PI * 2;

  // Track which card reaches front for shake
  const frontCardPhase = Math.floor(
    interpolate(orbitFrame, [0, 78, 80, 158, 160, 240], [0, 0, 1, 1, 2, 2], { extrapolateRight: "clamp" })
  );
  const frontTransitionFrames = [orbitStart, orbitStart + 80, orbitStart + 160];

  // Screen shake when card reaches front
  const orbitShakeX = frontTransitionFrames.reduce((acc, ftf) => {
    if (frame >= ftf && frame < ftf + 8) {
      return acc + Math.sin(frame * 12) * (ftf + 8 - frame) * 1.5;
    }
    return acc;
  }, 0);
  const orbitShakeY = frontTransitionFrames.reduce((acc, ftf) => {
    if (frame >= ftf && frame < ftf + 8) {
      return acc + Math.cos(frame * 10) * (ftf + 8 - frame) * 1;
    }
    return acc;
  }, 0);

  // Tagline SLAMS in from above (translateY from -200)
  const tagStart = 160;
  const tagScale = spring({
    frame: Math.max(0, frame - tagStart), fps,
    from: 2, to: 1,
    config: { damping: 5, mass: 0.3, stiffness: 200 },
  });
  const tagY = spring({
    frame: Math.max(0, frame - tagStart), fps,
    from: -200, to: 0,
    config: { damping: 8, mass: 0.4 },
  });
  const tagOpacity = interpolate(frame, [tagStart, tagStart + 8], [0, 1], { extrapolateRight: "clamp" });

  // Tagline slam shake
  const tagShakeX = frame >= tagStart && frame < tagStart + 8
    ? Math.sin(frame * 14) * (tagStart + 8 - frame) * 2 : 0;
  const tagShakeY = frame >= tagStart && frame < tagStart + 8
    ? Math.cos(frame * 11) * (tagStart + 8 - frame) * 1.5 : 0;

  const floatY = Math.sin(frame / 14) * 4;

  // Combine all shakes
  const totalShakeX = titleShakeX + orbitShakeX + tagShakeX;
  const totalShakeY = titleShakeY + orbitShakeY + tagShakeY;

  return (
    <AbsoluteFill style={{
      ...stitchBg,
      transform: `translate(${totalShakeX}px, ${totalShakeY}px)`,
    }}>
      <Particles />

      {/* Title slam flash */}
      <div style={{
        position: "absolute", inset: -20,
        background: `radial-gradient(circle, #fff 0%, ${STITCH.accent} 30%, transparent 60%)`,
        opacity: titleFlash, zIndex: 5, pointerEvents: "none",
      }} />

      {/* Title card */}
      <div style={{
        position: "absolute", top: "48%", left: "50%",
        transform: `translate(-50%, -50%) scale(${titleScale}) translateY(${floatY}px)`,
        opacity: titleOpacity, zIndex: 2,
        width: 650, height: 260,
        background: `linear-gradient(135deg, ${STITCH.accent}, ${STITCH.accentDark})`,
        borderRadius: STITCH.cardRadius,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16,
        boxShadow: `0 20px 60px ${STITCH.accent}30`,
      }}>
        <div style={{
          fontFamily: STITCH.fontHeading, fontSize: 52, fontWeight: 900,
          color: STITCH.textLight, textAlign: "center",
          direction: "ltr",
        }}>
          {"3 prompts. 3 תוצרים."}
        </div>
        <div style={{
          width: 200, height: 4, borderRadius: 2,
          background: "rgba(255,255,255,0.3)",
        }} />
      </div>


      {/* Orbit cards */}
      {frame >= orbitStart && cards.map((card, i) => {
        // Position in orbit ring
        const cardAngle = rotationAngle + (i / 3) * Math.PI * 2;
        const orbitRadiusX = 300;
        const orbitRadiusZ = 200;

        const x = Math.sin(cardAngle) * orbitRadiusX;
        const z = Math.cos(cardAngle) * orbitRadiusZ;

        // Scale and opacity based on depth (z position)
        const normalizedZ = (z + orbitRadiusZ) / (orbitRadiusZ * 2); // 0 = back, 1 = front
        const cardScale = 0.65 + normalizedZ * 0.45;
        const cardOpacity = 0.3 + normalizedZ * 0.7;
        const cardZIndex = Math.round(normalizedZ * 10) + 3;

        // Entry animation
        const entryProgress = spring({
          frame: Math.max(0, orbitFrame - i * 5), fps,
          from: 0, to: 1,
          config: { damping: 10, mass: 0.7 },
        });

        // PULSE effect when card reaches front position
        const isAtFront = normalizedZ > 0.85;
        const pulseScale = isAtFront
          ? 1 + Math.sin((frame) * 0.5) * 0.05
          : 1;

        const labelOpacity = isAtFront ? 1 : 0;
        const cardFloat = Math.sin((frame + i * 30) / 14) * 3;

        // GLOW TRAIL — brighter shadow on moving cards
        const glowIntensity = 0.2 + normalizedZ * 0.5;
        const trailGlow = `0 0 ${30 + normalizedZ * 40}px ${STITCH.accent}${Math.round(glowIntensity * 255).toString(16).padStart(2, "0")}`;

        return (
          <div key={i} style={{
            position: "absolute",
            top: `calc(46% + ${cardFloat}px)`,
            left: `calc(50% + ${x * entryProgress}px)`,
            transform: `translate(-50%, -50%) scale(${cardScale * entryProgress * pulseScale})`,
            opacity: cardOpacity * entryProgress,
            zIndex: cardZIndex,
            width: 380,
          }}>
            {/* Card */}
            <div style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(16px)",
              borderRadius: STITCH.cardRadius,
              padding: 20,
              boxShadow: isAtFront ? `${STITCH.shadowHeavy}, ${trailGlow}` : `${STITCH.shadow}, ${trailGlow}`,
              border: `1px solid rgba(255,255,255,${isAtFront ? 0.6 : 0.3})`,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
            }}>
              {/* Screenshot */}
              <div style={{
                width: "100%", borderRadius: 16, overflow: "hidden",
                boxShadow: STITCH.shadow,
              }}>
                <Img
                  src={staticFile(card.img)}
                  style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}
                />
              </div>

              {/* Label pill */}
              <div style={{
                background: `linear-gradient(135deg, ${STITCH.accent}, ${STITCH.accentDark})`,
                borderRadius: 40, padding: "8px 32px",
                opacity: labelOpacity,
                boxShadow: `0 4px 16px ${STITCH.accent}30`,
              }}>
                <span style={{
                  fontFamily: STITCH.fontHeading, fontSize: 36, fontWeight: 700,
                  color: STITCH.textLight,
                }}>
                  {card.label}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Tagline — SLAMS from above */}
      <div style={{
        position: "absolute", bottom: 100, left: "50%",
        transform: `translateX(-50%) scale(${tagScale}) translateY(${tagY}px)`,
        opacity: tagOpacity, zIndex: 10,
      }}>
        <div style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          borderRadius: 60, padding: "16px 44px",
          boxShadow: `0 8px 30px ${STITCH.accent}20`,
          border: "1px solid rgba(255,255,255,0.4)",
        }}>
          <span style={{
            fontFamily: STITCH.fontHeading, fontSize: 44, fontWeight: 900,
            color: STITCH.textDark, textAlign: "center",
          }}>
            {"הכל מ-Stitch. הכל בעברית. "}
            <span style={{ color: STITCH.accent }}>חינם כרגע.</span>
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
