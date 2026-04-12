import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { STITCH, stitchBg } from "../styles";
import { Particles } from "../Particles";

// Typewriter Build: prompt lines typed one by one -> SHATTER -> screenshot BURSTS up
export const Feature1Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card entrance — smooth scale, no slam
  const cardScale = spring({
    frame, fps, from: 0.5, to: 1,
    config: { damping: 8, mass: 0.5 },
  });
  const cardOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });


  // Badge "01"
  const badgeScale = spring({
    frame: Math.max(0, frame - 4), fps, from: 0, to: 1,
    config: { damping: 5, mass: 0.3 },
  });

  // Typewriter lines
  const lines = [
    "עצב לי ממשק ניהול משימות",
    "עם רשימת מטלות וצבעים",
    "ותאריכי יעד",
  ];

  const lineStartFrames = [10, 35, 55];
  const typeSpeed = 20; // frames per line

  // Cursor blink
  const cursorOpacity = Math.sin(frame / 4) > 0 ? 1 : 0;

  // Checkmarks after each line
  const checkFrames = [33, 53, 73];

  // Whoosh effect — each line slides in from right
  const lineWhoosh = (lineStart: number) => {
    const p = spring({
      frame: Math.max(0, frame - lineStart), fps,
      from: 80, to: 0,
      config: { damping: 12, mass: 0.4 },
    });
    return p;
  };

  // SHATTER effect — typewriter area breaks into fragments at screenshotStart
  const screenshotStart = 85;
  const shatterStart = screenshotStart - 5; // shatter begins slightly before screenshot
  const isShattered = frame >= shatterStart;

  // Generate shatter fragments
  const shatterFragments = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2 + (i * 0.3);
    const dist = spring({
      frame: Math.max(0, frame - shatterStart), fps,
      from: 0, to: 600 + (i % 4) * 200,
      config: { damping: 20, mass: 0.5 },
    });
    const rotation = spring({
      frame: Math.max(0, frame - shatterStart), fps,
      from: 0, to: (i % 2 === 0 ? 1 : -1) * (180 + i * 45),
      config: { damping: 20, mass: 0.5 },
    });
    const fragOpacity = interpolate(frame, [shatterStart, shatterStart + 15], [1, 0], {
      extrapolateRight: "clamp", extrapolateLeft: "clamp",
    });
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;
    const size = 30 + (i % 5) * 15;
    return { x, y, rotation, opacity: fragOpacity, size };
  });

  // Screenshot BURSTS up from below with ring of light
  const screenshotScale = spring({
    frame: Math.max(0, frame - screenshotStart), fps,
    from: 0.3, to: 1,
    config: { damping: 6, mass: 0.4, stiffness: 180 },
  });
  const screenshotY = spring({
    frame: Math.max(0, frame - screenshotStart), fps,
    from: 400, to: 0,
    config: { damping: 8, mass: 0.5 },
  });
  const screenshotOpacity = interpolate(frame, [screenshotStart, screenshotStart + 5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Screen shake + flash on screenshot reveal
  const ssShakeX = frame >= screenshotStart && frame < screenshotStart + 10
    ? Math.sin(frame * 14) * (screenshotStart + 10 - frame) * 2.5 : 0;
  const ssShakeY = frame >= screenshotStart && frame < screenshotStart + 10
    ? Math.cos(frame * 11) * (screenshotStart + 10 - frame) * 1.8 : 0;
  const ssFlash = interpolate(frame, [screenshotStart, screenshotStart + 2, screenshotStart + 10], [0, 0.4, 0], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // Expanding ring of light behind screenshot
  const ringScale = spring({
    frame: Math.max(0, frame - screenshotStart), fps,
    from: 0.2, to: 3,
    config: { damping: 15, mass: 0.8 },
  });
  const ringOpacity = interpolate(frame, [screenshotStart, screenshotStart + 4, screenshotStart + 18], [0, 0.5, 0], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // No orbiting sparkles — let the screenshot breathe

  // Highlight text
  const hlStart = 115;
  const hlOpacity = interpolate(frame, [hlStart, hlStart + 8], [0, 1], { extrapolateRight: "clamp" });
  const hlScale = spring({
    frame: Math.max(0, frame - hlStart), fps,
    from: 1.5, to: 1, config: { damping: 6, mass: 0.3 },
  });

  const floatY = Math.sin(frame / 14) * 5;

  // Combine shakes
  const totalShakeX = ssShakeX;
  const totalShakeY = ssShakeY;

  return (
    <AbsoluteFill style={{
      ...stitchBg,
      transform: `translate(${totalShakeX}px, ${totalShakeY}px)`,
    }}>
      <Particles />


      {/* Screenshot reveal flash */}
      <div style={{
        position: "absolute", inset: -20,
        background: `radial-gradient(circle, #fff 0%, ${STITCH.accent} 30%, transparent 60%)`,
        opacity: ssFlash, zIndex: 15, pointerEvents: "none",
      }} />

      {/* Expanding ring of light behind screenshot */}
      {frame >= screenshotStart && (
        <div style={{
          position: "absolute", top: "46%", left: "50%",
          transform: `translate(-50%, -50%) scale(${ringScale})`,
          width: 300, height: 300, borderRadius: "50%",
          border: `3px solid ${STITCH.accent}`,
          opacity: ringOpacity,
          boxShadow: `0 0 40px ${STITCH.accent}60, inset 0 0 40px ${STITCH.accent}30`,
          zIndex: 1, pointerEvents: "none",
        }} />
      )}

      <div style={{
        position: "absolute", top: "46%", left: "50%",
        transform: `translate(-50%, -50%) translateY(${floatY}px) scale(${cardScale})`,
        opacity: cardOpacity, zIndex: 2,
        width: 920,
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(20px)",
        borderRadius: STITCH.cardRadius,
        padding: STITCH.cardPadding,
        boxShadow: STITCH.shadowHeavy,
        border: "1px solid rgba(255,255,255,0.5)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
      }}>
        {/* Badge */}
        <div style={{
          background: `linear-gradient(135deg, ${STITCH.accent}, ${STITCH.accentDark})`,
          borderRadius: 50, padding: "8px 28px",
          position: "absolute", top: -20,
          boxShadow: `0 4px 16px ${STITCH.accent}50`,
          transform: `scale(${badgeScale})`,
        }}>
          <span style={{ fontFamily: STITCH.fontHeading, fontSize: 24, fontWeight: 700, color: STITCH.textLight }}>01</span>
        </div>

        {/* Title */}
        <div style={{
          fontFamily: STITCH.fontHeading, fontSize: 48, fontWeight: 900,
          color: STITCH.textDark, marginTop: 16, textAlign: "center",
        }}>
          כותבים prompt...
        </div>

        {/* Typewriter area — only visible before shatter */}
        {!isShattered && (
          <div style={{
            width: "100%",
            background: STITCH.cardDark,
            borderRadius: 16, padding: "28px 32px",
            display: "flex", flexDirection: "column", gap: 16,
            boxShadow: STITCH.shadow,
            minHeight: 200,
          }}>
            {lines.map((line, i) => {
              const lineStart = lineStartFrames[i];
              const typedChars = Math.floor(
                interpolate(frame, [lineStart, lineStart + typeSpeed], [0, line.length], {
                  extrapolateRight: "clamp",
                  extrapolateLeft: "clamp",
                })
              );
              const visibleText = line.slice(0, typedChars);
              const isTyping = frame >= lineStart && frame < lineStart + typeSpeed;
              const isDone = frame >= checkFrames[i];

              if (frame < lineStart) return null;

              // Checkmark scale
              const checkScale = isDone
                ? spring({
                    frame: Math.max(0, frame - checkFrames[i]), fps,
                    from: 0, to: 1,
                    config: { damping: 3, stiffness: 400, mass: 0.2 },
                  })
                : 0;

              // Whoosh slide from right
              const whooshX = lineWhoosh(lineStart);

              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  direction: "rtl",
                  transform: `translateX(${whooshX}px)`,
                }}>
                  {/* Checkmark */}
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: isDone ? STITCH.teal : "transparent",
                    border: isDone ? "none" : `2px solid ${STITCH.textMuted}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transform: `scale(${isDone ? checkScale : 1})`,
                    flexShrink: 0,
                  }}>
                    {isDone && (
                      <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>&#10003;</span>
                    )}
                  </div>

                  {/* Text */}
                  <span style={{
                    fontFamily: "'Heebo', monospace", fontSize: 36, fontWeight: 500,
                    color: STITCH.textLight,
                  }}>
                    {visibleText}
                    {isTyping && (
                      <span style={{ opacity: cursorOpacity, color: STITCH.accent }}>|</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Shatter fragments — dark card pieces flying outward */}
        {isShattered && frame < shatterStart + 18 && shatterFragments.map((frag, i) => (
          <div key={`frag-${i}`} style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: frag.size, height: frag.size * 0.6,
            background: STITCH.cardDark,
            borderRadius: 4,
            opacity: frag.opacity,
            transform: `translate(calc(-50% + ${frag.x}px), calc(-50% + ${frag.y}px)) rotate(${frag.rotation}deg)`,
            boxShadow: `0 0 12px rgba(0,0,0,0.4)`,
            pointerEvents: "none",
            zIndex: 20,
          }} />
        ))}

        {/* Screenshot result — BURSTS up from below */}
        {frame >= screenshotStart && (
          <div style={{
            width: "100%", borderRadius: 16, overflow: "hidden",
            boxShadow: STITCH.shadowHeavy,
            transform: `scale(${screenshotScale}) translateY(${screenshotY}px)`,
            opacity: screenshotOpacity,
          }}>
            <Img
              src={staticFile("screenshots/result-tasks.png")}
              style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}
            />
          </div>
        )}


        {/* Highlight text */}
        {frame >= hlStart && (
          <div style={{
            fontFamily: STITCH.fontHeading, fontSize: 44, fontWeight: 700,
            color: STITCH.accent, opacity: hlOpacity,
            transform: `scale(${hlScale})`, transformOrigin: "center",
            textAlign: "center",
          }}>
            עיצוב ממשק ניהול. מ-prompt אחד.
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
