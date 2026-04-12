import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { PRISM, prismBg, prismGradient } from "../prismStyles";
import { PrismParticles } from "../PrismParticles";

// MAGNETIC LETTER ASSEMBLY — letters scatter → pull together magnetically → photo blooms
export const V2IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // === PHASE 1: Scattered letters of "מיטל פלג" pull together (frame 0-30) ===
  const nameLetters = "מיטל פלג".split("");
  const letterPositions = [
    { sx: -300, sy: -400, sr: -45 },
    { sx: 250, sy: -350, sr: 30 },
    { sx: -200, sy: 300, sr: -60 },
    { sx: 350, sy: 250, sr: 50 },
    { sx: -100, sy: -200, sr: 20 },
    { sx: 400, sy: -100, sr: -35 },
    { sx: -350, sy: 100, sr: 40 },
    { sx: 200, sy: 350, sr: -25 },
  ];

  // Magnetic pull — each letter has slightly different timing
  const magneticProgress = (i: number) => {
    const delay = i * 2;
    return spring({
      frame: Math.max(0, frame - delay), fps,
      from: 0, to: 1,
      config: { damping: 12, mass: 0.8, stiffness: 80 },
    });
  };

  // === PHASE 2: Name is assembled — rainbow gradient sweep (frame 30-40) ===
  const sweepProgress = interpolate(frame, [28, 40], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // === PHASE 3: Photo BLOOMS open (frame 35+) — starts as a dot, grows like flower ===
  const photoStart = 35;
  const bloomPhases = [
    // Inner circle grows
    spring({ frame: Math.max(0, frame - photoStart), fps, from: 0, to: 1, config: { damping: 10, mass: 0.6 } }),
    // Outer ring follows
    spring({ frame: Math.max(0, frame - photoStart - 4), fps, from: 0, to: 1, config: { damping: 8, mass: 0.7 } }),
    // Petals (decorative arcs)
    spring({ frame: Math.max(0, frame - photoStart - 8), fps, from: 0, to: 1, config: { damping: 6, mass: 0.5 } }),
  ];

  // === PHASE 4: Title fades in (frame 55+) ===
  const titleStart = 55;
  const titleOpacity = interpolate(frame, [titleStart, titleStart + 8], [0, 1], { extrapolateRight: "clamp" });
  const titleY = spring({ frame: Math.max(0, frame - titleStart), fps, from: 30, to: 0, config: { damping: 10 } });

  // Confetti burst when name assembles (frame 28-40)
  const confettiBurst = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const burstStart = 28;
    const dist = frame >= burstStart
      ? spring({ frame: frame - burstStart, fps, from: 0, to: 200 + (i % 3) * 80, config: { damping: 15, mass: 0.8 } })
      : 0;
    const opacity = frame >= burstStart
      ? interpolate(frame, [burstStart, burstStart + 4, burstStart + 18], [0, 0.6, 0], { extrapolateRight: "clamp" })
      : 0;
    const colors = [PRISM.indigo, PRISM.teal, PRISM.rose, PRISM.violet, PRISM.sky, PRISM.amber];
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      color: colors[i % colors.length],
      opacity,
      w: 10 + (i % 4) * 4,
      h: 5 + (i % 3) * 2,
      rotate: frame * 3 + i * 30,
    };
  });

  return (
    <AbsoluteFill style={prismBg}>
      <PrismParticles />

      {/* Confetti burst */}
      {confettiBurst.map((c, i) => (
        <div key={`cb-${i}`} style={{
          position: "absolute", top: "38%", left: "50%",
          transform: `translate(calc(-50% + ${c.x}px), calc(-50% + ${c.y}px)) rotate(${c.rotate}deg)`,
          width: c.w, height: c.h, borderRadius: 2,
          background: c.color, opacity: c.opacity,
          zIndex: 6,
        }} />
      ))}

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 16, zIndex: 2,
      }}>
        {/* Scattered → assembled name */}
        <div style={{
          display: "flex", gap: 4, height: 70,
          position: "relative", justifyContent: "center",
        }}>
          {nameLetters.map((letter, i) => {
            const p = magneticProgress(i);
            const pos = letterPositions[i] || { sx: 0, sy: 0, sr: 0 };
            const x = pos.sx * (1 - p);
            const y = pos.sy * (1 - p);
            const r = pos.sr * (1 - p);
            const opacity = interpolate(p, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

            // Color sweep: each letter gets gradient color based on position and sweep progress
            const letterProgress = i / nameLetters.length;
            const isSwept = sweepProgress > letterProgress;
            const color = isSwept ? "transparent" : PRISM.textDark;
            const bg = isSwept ? prismGradient : "none";

            return (
              <span key={i} style={{
                fontFamily: PRISM.fontHeading, fontSize: 64, fontWeight: 900,
                color,
                background: isSwept ? bg : "none",
                WebkitBackgroundClip: isSwept ? "text" : undefined,
                WebkitTextFillColor: isSwept ? "transparent" : undefined,
                transform: `translate(${x}px, ${y}px) rotate(${r}deg)`,
                opacity,
                display: "inline-block",
                transition: "none",
              }}>
                {letter === " " ? "\u00A0" : letter}
              </span>
            );
          })}
        </div>

        {/* Photo bloom */}
        <div style={{
          position: "relative", width: 220, height: 220,
          marginTop: 16,
        }}>
          {/* Decorative petal arcs */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <div key={`petal-${i}`} style={{
              position: "absolute", top: "50%", left: "50%",
              width: 240, height: 240, borderRadius: "50%",
              border: `2px solid ${[PRISM.indigo, PRISM.teal, PRISM.rose, PRISM.violet, PRISM.sky, PRISM.amber][i]}`,
              transform: `translate(-50%, -50%) rotate(${angle + frame * 0.3}deg) scale(${bloomPhases[2]})`,
              opacity: bloomPhases[2] * 0.15,
              clipPath: `polygon(50% 50%, 40% 0%, 60% 0%)`,
            }} />
          ))}

          {/* Outer ring */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            width: 230, height: 230, borderRadius: "50%",
            border: `3px solid transparent`,
            borderImage: `${prismGradient} 1`,
            transform: `translate(-50%, -50%) scale(${bloomPhases[1]})`,
            opacity: bloomPhases[1] * 0.4,
          }}>
            <div style={{
              width: "100%", height: "100%", borderRadius: "50%",
              border: `2px solid ${PRISM.violet}`,
              opacity: 0.3,
            }} />
          </div>

          {/* Photo circle */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            width: 200, height: 200, borderRadius: "50%", overflow: "hidden",
            transform: `translate(-50%, -50%) scale(${bloomPhases[0]})`,
            boxShadow: `0 20px 60px ${PRISM.indigo}20, 0 0 40px ${PRISM.violet}10`,
          }}>
            <Img src={staticFile("meytal.jpeg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>

          {/* Prismatic shimmer on photo */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            width: 200, height: 200, borderRadius: "50%",
            transform: `translate(-50%, -50%) scale(${bloomPhases[0]})`,
            background: `linear-gradient(${frame * 2}deg, ${PRISM.indigo}15, transparent, ${PRISM.rose}15, transparent)`,
            pointerEvents: "none",
          }} />
        </div>

        {/* Title */}
        <div style={{
          fontFamily: PRISM.fontBody, fontSize: 38, fontWeight: 500,
          background: prismGradient,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}>
          חדשנות דיגיטלית
        </div>
      </div>
    </AbsoluteFill>
  );
};
