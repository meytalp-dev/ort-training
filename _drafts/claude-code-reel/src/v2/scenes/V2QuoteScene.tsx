import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { PRISM, prismBg, prismGradient } from "../prismStyles";
import { PrismParticles } from "../PrismParticles";

// WAVE TEXT REVEAL — Background wave sweeps across screen ->
// text appears word by word behind wave -> "גם את/ה" big gradient ->
// horizontal lines radiate outward from center
export const V2QuoteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // === PHASE 1: Wave sweep across screen (frame 0-40) ===
  // The wave is a vertical gradient band that moves from right to left (RTL)
  const waveSweepX = interpolate(frame, [0, 40], [1200, -400], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });
  const waveOpacity = interpolate(frame, [0, 5, 35, 42], [0, 0.7, 0.7, 0], { extrapolateRight: "clamp" });

  // Wave wobble
  const waveWobble = Math.sin(frame / 4) * 20;

  // === PHASE 2: Words appear as wave passes over them ===
  const words1 = ["אם", "מורה", "בלי", "רקע", "טכני", "יכולה", "\u2014"];
  const words2 = ["גם", "את/ה"];

  const wordStart = 6;
  const wordDelay = 3;

  // Calculate when all text is done
  const allWordsEnd = wordStart + (words1.length + words2.length) * wordDelay + 10;

  // === PHASE 3: Horizontal lines radiate outward from center (after all text) ===
  const linesStart = allWordsEnd + 4;
  const lineCount = 6;
  const lines = Array.from({ length: lineCount }, (_, i) => {
    const delay = i * 3;
    const lineProgress = spring({
      frame: Math.max(0, frame - linesStart - delay), fps,
      from: 0, to: 1,
      config: { damping: 12, mass: 0.8 },
    });
    const lineOpacity = frame >= linesStart + delay
      ? interpolate(frame, [linesStart + delay, linesStart + delay + 6, linesStart + delay + 20], [0, 0.5, 0.15], { extrapolateRight: "clamp" })
      : 0;
    return { progress: lineProgress, opacity: lineOpacity };
  });

  return (
    <AbsoluteFill style={prismBg}>
      <PrismParticles />

      {/* === Wave sweep band === */}
      <div style={{
        position: "absolute", top: 0, bottom: 0,
        width: 350, left: waveSweepX + waveWobble,
        background: `linear-gradient(90deg, transparent, ${PRISM.indigo}25, ${PRISM.teal}30, ${PRISM.rose}25, transparent)`,
        opacity: waveOpacity,
        filter: "blur(30px)",
        zIndex: 3,
        pointerEvents: "none",
      }} />

      {/* === Horizontal radiating lines === */}
      {lines.map((line, i) => {
        const isTop = i < lineCount / 2;
        const index = isTop ? i : i - lineCount / 2;
        const yOffset = isTop ? -(40 + index * 60) : (40 + index * 60);
        const width = line.progress * 800;
        const colors = [PRISM.indigo, PRISM.teal, PRISM.rose, PRISM.violet, PRISM.sky, PRISM.amber];
        return (
          <div key={`line-${i}`} style={{
            position: "absolute",
            top: `calc(50% + ${yOffset}px)`,
            left: "50%",
            transform: "translateX(-50%)",
            width, height: 3,
            background: `linear-gradient(90deg, transparent, ${colors[i % colors.length]}60, transparent)`,
            opacity: line.opacity,
            borderRadius: 2,
            zIndex: 5,
          }} />
        );
      })}

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", zIndex: 4,
        padding: "0 60px",
      }}>
        {/* === Quote card with parallax shadows === */}
        <div style={{ position: "relative" }}>
          {/* Shadow layer 2 */}
          <div style={{
            position: "absolute", top: 14, left: -10,
            width: 940, height: "100%",
            background: `${PRISM.violet}08`,
            borderRadius: PRISM.cardRadius + 4,
            opacity: 0.5,
          }} />
          {/* Shadow layer 1 */}
          <div style={{
            position: "absolute", top: 7, left: -5,
            width: 940, height: "100%",
            background: `${PRISM.indigo}06`,
            borderRadius: PRISM.cardRadius + 2,
            opacity: 0.6,
          }} />

          <div style={{
            position: "relative",
            background: PRISM.card,
            borderRadius: PRISM.cardRadius,
            padding: "64px 52px",
            width: 940,
            boxShadow: PRISM.shadowDeep,
            border: `1px solid ${PRISM.indigo}10`,
            textAlign: "center",
          }}>
            {/* Large quote mark — gradient */}
            <div style={{
              position: "absolute", top: -20, right: 50,
              fontFamily: "Georgia, serif", fontSize: 200,
              background: prismGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              opacity: 0.15, lineHeight: 0.5,
            }}>
              &ldquo;
            </div>

            {/* Line 1 — word by word reveal */}
            <div style={{
              fontFamily: PRISM.fontHeading, fontSize: 52, fontWeight: 700,
              color: PRISM.textDark, lineHeight: 1.6,
              display: "flex", flexWrap: "wrap", justifyContent: "center",
              gap: 14, direction: "rtl", marginTop: 40,
            }}>
              {words1.map((word, i) => {
                const wFrame = wordStart + i * wordDelay;
                const wOpacity = interpolate(frame, [wFrame, wFrame + 4], [0, 1], {
                  extrapolateRight: "clamp", extrapolateLeft: "clamp",
                });
                const wY = spring({
                  frame: Math.max(0, frame - wFrame), fps,
                  from: 30, to: 0, config: { damping: 8, mass: 0.4 },
                });
                // Color sweep reveal — starts transparent, sweeps to visible
                const sweepProgress = interpolate(frame, [wFrame, wFrame + 5], [100, 0], {
                  extrapolateRight: "clamp", extrapolateLeft: "clamp",
                });
                return (
                  <span key={i} style={{
                    opacity: wOpacity,
                    transform: `translateY(${wY}px)`,
                    display: "inline-block",
                    clipPath: `inset(0 ${sweepProgress}% 0 0)`,
                  }}>
                    {word}
                  </span>
                );
              })}
            </div>

            {/* Line 2 — "גם את/ה" big gradient colored */}
            <div style={{
              fontFamily: PRISM.fontHeading, fontSize: 80, fontWeight: 900,
              lineHeight: 1.6,
              display: "flex", flexWrap: "wrap", justifyContent: "center",
              gap: 16, direction: "rtl", marginTop: 20,
            }}>
              {words2.map((word, i) => {
                const wFrame = wordStart + words1.length * wordDelay + 8 + i * wordDelay;
                const wOpacity = interpolate(frame, [wFrame, wFrame + 5], [0, 1], {
                  extrapolateRight: "clamp", extrapolateLeft: "clamp",
                });
                const wScale = spring({
                  frame: Math.max(0, frame - wFrame), fps,
                  from: 1.8, to: 1, config: { damping: 5, mass: 0.3, stiffness: 200 },
                });
                const wY = spring({
                  frame: Math.max(0, frame - wFrame), fps,
                  from: 40, to: 0, config: { damping: 6, mass: 0.3 },
                });
                return (
                  <span key={i} style={{
                    background: prismGradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    opacity: wOpacity,
                    transform: `translateY(${wY}px) scale(${wScale})`,
                    display: "inline-block",
                  }}>
                    {word}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
