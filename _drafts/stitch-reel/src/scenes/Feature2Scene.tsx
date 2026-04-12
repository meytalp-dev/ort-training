import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { STITCH, stitchBg } from "../styles";
import { Particles } from "../Particles";

// Morph Transform: circle -> morphs into Design System card with ENERGY WAVES
export const Feature2Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Badge "02"
  const badgeScale = spring({
    frame: Math.max(0, frame - 4), fps, from: 0, to: 1,
    config: { damping: 5, mass: 0.3 },
  });

  // Morph phases:
  // 0-15: colored circle pulses AGGRESSIVELY at center
  // 15-45: circle morphs to card shape with ENERGY WAVES
  // 45+: card content appears with screenshots sliding from sides

  const morphStart = 15;
  const morphEnd = 45;
  const morphProgress = interpolate(frame, [morphStart, morphEnd], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Circle/card dimensions
  const circleSize = 180;
  const cardWidth = 920;
  const cardHeight = 700;

  const currentWidth = interpolate(morphProgress, [0, 0.5, 1], [circleSize, 500, cardWidth]);
  const currentHeight = interpolate(morphProgress, [0, 0.5, 1], [circleSize, 350, cardHeight]);
  const currentRadius = interpolate(morphProgress, [0, 0.5, 1], [circleSize / 2, 60, STITCH.cardRadius]);

  // Circle pulse MUCH more aggressively before morph (0.8-1.3 range)
  const circlePulse = frame < morphStart ? 1 + Math.sin(frame / 2.5) * 0.25 : 1;

  // Background transitions from solid accent to glassmorphism
  const bgOpacity = interpolate(morphProgress, [0, 0.3, 1], [1, 0.5, 0]);
  const glassOpacity = interpolate(morphProgress, [0.3, 1], [0, 0.8], { extrapolateLeft: "clamp" });

  // Flash is BIGGER on morph completion (opacity 0.4)
  const flashOpacity = interpolate(frame, [morphStart, morphStart + 2, morphStart + 8], [0, 0.4, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // ENERGY WAVES — 3 rings expand outward from center during morph
  const energyWaves = [0, 1, 2].map((i) => {
    const waveDelay = morphStart + i * 5;
    const waveScale = spring({
      frame: Math.max(0, frame - waveDelay), fps,
      from: 0.3, to: 4,
      config: { damping: 18, mass: 0.6 },
    });
    const waveOpacity = interpolate(frame, [waveDelay, waveDelay + 3, waveDelay + 18], [0, 0.5, 0], {
      extrapolateRight: "clamp", extrapolateLeft: "clamp",
    });
    return { scale: waveScale, opacity: waveOpacity };
  });

  // Screen shake on morph
  const shakeX = frame >= morphStart && frame < morphStart + 10
    ? Math.sin(frame * 13) * (morphStart + 10 - frame) * 2 : 0;
  const shakeY = frame >= morphStart && frame < morphStart + 10
    ? Math.cos(frame * 9) * (morphStart + 10 - frame) * 1.5 : 0;

  // Content appears after morph
  const contentStart = morphEnd + 5;
  const contentOpacity = interpolate(frame, [contentStart, contentStart + 10], [0, 1], {
    extrapolateRight: "clamp",
  });
  const contentScale = spring({
    frame: Math.max(0, frame - contentStart), fps,
    from: 0.85, to: 1,
    config: { damping: 10, mass: 0.5 },
  });

  // Title text
  const titleStart = morphEnd + 3;
  const titleOpacity = interpolate(frame, [titleStart, titleStart + 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Screenshots slide in from LEFT and RIGHT simultaneously
  const screenshotSlideStart = contentStart + 5;
  const leftScreenshotX = spring({
    frame: Math.max(0, frame - screenshotSlideStart), fps,
    from: -500, to: 0,
    config: { damping: 8, mass: 0.5 },
  });
  const rightScreenshotX = spring({
    frame: Math.max(0, frame - screenshotSlideStart), fps,
    from: 500, to: 0,
    config: { damping: 8, mass: 0.5 },
  });
  const screenshotFade = interpolate(frame, [screenshotSlideStart, screenshotSlideStart + 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Subtle 3D tilt on the card (rotateX 3-5 degrees oscillating)
  const tiltX = frame >= morphEnd ? Math.sin(frame / 12) * 4 : 0;

  // Highlight text
  const hlStart = 110;
  const hlOpacity = interpolate(frame, [hlStart, hlStart + 8], [0, 1], { extrapolateRight: "clamp" });
  const hlScale = spring({
    frame: Math.max(0, frame - hlStart), fps,
    from: 1.5, to: 1, config: { damping: 6, mass: 0.3 },
  });

  const floatY = Math.sin(frame / 14) * 5;

  return (
    <AbsoluteFill style={{
      ...stitchBg,
      transform: `translate(${shakeX}px, ${shakeY}px)`,
    }}>
      <Particles />

      {/* Flash */}
      <div style={{
        position: "absolute", inset: -20,
        background: `radial-gradient(circle, #fff 0%, ${STITCH.accent} 30%, transparent 60%)`,
        opacity: flashOpacity, zIndex: 5, pointerEvents: "none",
      }} />

      {/* ENERGY WAVES — expanding rings */}
      {energyWaves.map((wave, i) => (
        <div key={`wave-${i}`} style={{
          position: "absolute", top: "46%", left: "50%",
          transform: `translate(-50%, -50%) scale(${wave.scale})`,
          width: 180, height: 180, borderRadius: "50%",
          border: `2px solid ${STITCH.accent}`,
          opacity: wave.opacity,
          boxShadow: `0 0 30px ${STITCH.accent}50, inset 0 0 20px ${STITCH.accent}20`,
          pointerEvents: "none", zIndex: 4,
        }} />
      ))}

      {/* Morphing shape with 3D tilt */}
      <div style={{
        position: "absolute", top: "46%", left: "50%",
        transform: `translate(-50%, -50%) translateY(${floatY}px) scale(${circlePulse}) perspective(1200px) rotateX(${tiltX}deg)`,
        width: currentWidth, height: currentHeight,
        borderRadius: currentRadius,
        overflow: "hidden", zIndex: 2,
        boxShadow: STITCH.shadowHeavy,
        border: "1px solid rgba(255,255,255,0.5)",
      }}>
        {/* Solid accent background (fades out during morph) */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(135deg, ${STITCH.accent}, ${STITCH.accentDark})`,
          opacity: bgOpacity,
        }} />

        {/* Glassmorphism background (fades in) */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(20px)",
          opacity: glassOpacity,
        }} />

        {/* Palette icon in circle phase */}
        {frame < morphEnd && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: interpolate(morphProgress, [0, 0.6], [1, 0], { extrapolateRight: "clamp" }),
          }}>
            <svg width={80} height={80} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13.5" cy="6.5" r="0.5" fill="#fff" />
              <circle cx="17.5" cy="10.5" r="0.5" fill="#fff" />
              <circle cx="8.5" cy="7.5" r="0.5" fill="#fff" />
              <circle cx="6.5" cy="12.5" r="0.5" fill="#fff" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
            </svg>
          </div>
        )}

        {/* Card content after morph */}
        {frame >= contentStart - 5 && (
          <div style={{
            position: "relative", width: "100%", height: "100%",
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: STITCH.cardPadding, gap: 20,
            opacity: contentOpacity,
            transform: `scale(${contentScale})`,
          }}>
            {/* Badge */}
            <div style={{
              background: `linear-gradient(135deg, ${STITCH.accent}, ${STITCH.accentDark})`,
              borderRadius: 50, padding: "8px 28px",
              position: "absolute", top: -20,
              boxShadow: `0 4px 16px ${STITCH.accent}50`,
              transform: `scale(${badgeScale})`,
            }}>
              <span style={{ fontFamily: STITCH.fontHeading, fontSize: 24, fontWeight: 700, color: STITCH.textLight }}>02</span>
            </div>

            {/* Title */}
            <div style={{
              fontFamily: STITCH.fontHeading, fontSize: 48, fontWeight: 900,
              color: STITCH.textDark, marginTop: 16, textAlign: "center",
              opacity: titleOpacity, direction: "ltr",
            }}>
              עיצוב מוכן — אוטומטית
            </div>

            {/* Side by side screenshots — slide in from LEFT and RIGHT */}
            <div style={{
              display: "flex", gap: 16, width: "100%",
            }}>
              <div style={{
                flex: 1, borderRadius: 16, overflow: "hidden",
                boxShadow: STITCH.shadow,
                transform: `translateX(${leftScreenshotX}px)`,
                opacity: screenshotFade,
              }}>
                <Img
                  src={staticFile("screenshots/design-system-dark.png")}
                  style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}
                />
              </div>
              <div style={{
                flex: 1, borderRadius: 16, overflow: "hidden",
                boxShadow: STITCH.shadow,
                transform: `translateX(${rightScreenshotX}px)`,
                opacity: screenshotFade,
              }}>
                <Img
                  src={staticFile("screenshots/design-system-light.png")}
                  style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Highlight text below card */}
      {frame >= hlStart && (
        <div style={{
          position: "absolute", top: "82%", left: "50%",
          transform: `translateX(-50%) scale(${hlScale})`,
          opacity: hlOpacity, zIndex: 3,
        }}>
          <div style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            borderRadius: 60, padding: "14px 40px",
            boxShadow: `0 8px 30px ${STITCH.accent}20`,
            border: "1px solid rgba(255,255,255,0.4)",
          }}>
            <span style={{
              fontFamily: STITCH.fontHeading, fontSize: 44, fontWeight: 700,
              color: STITCH.accent, textAlign: "center",
            }}>
              הכל מעוצב — בלי לגעת בצבע אחד
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
