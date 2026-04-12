import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { STITCH, stitchBg } from "../styles";
import { Particles } from "../Particles";

// Intro — "בואו נכיר היום את... Stitch מבית Google" — with MORE effects
export const CategoryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const floatY = Math.sin(frame / 14) * 5;

  // "בואו נכיר היום את..." fades in first
  const introOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const introScale = spring({
    frame, fps, from: 0.7, to: 1,
    config: { damping: 8, mass: 0.4 },
  });
  // Intro fades out when tool name arrives
  const introFadeOut = interpolate(frame, [38, 46], [1, 0], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // "Stitch" slams in at frame 42
  const toolStart = 42;
  const toolScale = spring({
    frame: Math.max(0, frame - toolStart), fps,
    from: 4, to: 1,
    config: { damping: 5, mass: 0.3, stiffness: 180 },
  });
  const toolOpacity = interpolate(frame, [toolStart, toolStart + 4], [0, 1], { extrapolateRight: "clamp" });
  const toolGlow = frame >= toolStart + 4
    ? 0.3 + Math.sin((frame - toolStart) / 5) * 0.15 : 0.3;

  // "מבית Google" subtitle with subtle glow pulse
  const subStart = toolStart + 14;
  const subOpacity = interpolate(frame, [subStart, subStart + 8], [0, 1], { extrapolateRight: "clamp" });
  const subY = spring({
    frame: Math.max(0, frame - subStart), fps,
    from: 30, to: 0, config: { damping: 8, mass: 0.5 },
  });
  const subGlowPulse = frame >= subStart + 8
    ? 0.3 + Math.sin((frame - subStart) / 4) * 0.15 : 0.3;

  // Screenshot peek in background — with PULSE (subtle scale oscillation)
  const screenshotOpacity = interpolate(frame, [10, 25], [0, 0.15], { extrapolateRight: "clamp" });
  const screenshotBaseScale = interpolate(frame, [10, 60], [1.1, 1.2], { extrapolateRight: "clamp" });
  const screenshotPulse = 1 + Math.sin(frame / 8) * 0.02; // subtle pulse
  const screenshotScale = screenshotBaseScale * screenshotPulse;

  // Flash on tool name slam — kept
  const flashOpacity = interpolate(frame, [toolStart, toolStart + 2, toolStart + 8], [0, 0.2, 0], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // Screen shake on slam — MORE intense
  const shakeX = frame >= toolStart && frame < toolStart + 10
    ? Math.sin(frame * 14) * (toolStart + 10 - frame) * 2.5 : 0;
  const shakeY = frame >= toolStart && frame < toolStart + 10
    ? Math.cos(frame * 11) * (toolStart + 10 - frame) * 1.8 : 0;

  // 2 expanding GLOW RINGS when Stitch lands
  const glowRings = [0, 1].map((i) => {
    const ringDelay = toolStart + 1 + i * 4;
    const ringScale = spring({
      frame: Math.max(0, frame - ringDelay), fps,
      from: 0.3, to: 3.5 + i * 0.8,
      config: { damping: 16, mass: 0.6 },
    });
    const ringOpacity = interpolate(frame, [ringDelay, ringDelay + 3, ringDelay + 16], [0, 0.45, 0], {
      extrapolateRight: "clamp", extrapolateLeft: "clamp",
    });
    return { scale: ringScale, opacity: ringOpacity };
  });

  return (
    <AbsoluteFill style={{
      ...stitchBg,
      transform: `translate(${shakeX}px, ${shakeY}px)`,
    }}>
      <Particles />

      {/* Background screenshot hint — with pulse */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: `translate(-50%, -50%) scale(${screenshotScale})`,
        width: 900, height: 900, borderRadius: 40,
        overflow: "hidden", opacity: screenshotOpacity,
        filter: "blur(6px)", zIndex: 0,
      }}>
        <Img src={staticFile("screenshots/stitch-generating.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Flash */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle, #fff 0%, ${STITCH.accent} 30%, ${STITCH.accentLight} 50%, transparent 70%)`,
        opacity: flashOpacity, zIndex: 5, pointerEvents: "none",
      }} />

      {/* Expanding glow rings on Stitch slam */}
      {glowRings.map((ring, i) => (
        <div key={`glow-ring-${i}`} style={{
          position: "absolute", top: "42%", left: "50%",
          transform: `translate(-50%, -50%) scale(${ring.scale})`,
          width: 140, height: 140, borderRadius: "50%",
          border: `2px solid ${i === 0 ? STITCH.accent : STITCH.accentLight}`,
          opacity: ring.opacity,
          boxShadow: `0 0 30px ${STITCH.accent}50, inset 0 0 20px ${STITCH.accent}20`,
          pointerEvents: "none", zIndex: 6,
        }} />
      ))}

      {/* "בואו נכיר היום את..." */}
      <div style={{
        position: "absolute", top: "38%", left: "50%",
        transform: `translate(-50%, -50%) scale(${introScale}) translateY(${floatY}px)`,
        opacity: introOpacity * introFadeOut, zIndex: 3,
      }}>
        <div style={{
          fontFamily: "'Playpen Sans Hebrew', 'Rubik', sans-serif",
          fontSize: 80, fontWeight: 400,
          color: STITCH.textDark,
          textAlign: "center", lineHeight: 1.3,
        }}>
          בואו נכיר היום את...
        </div>
      </div>

      {/* "Stitch" — big slam */}
      <div style={{
        position: "absolute", top: "42%", left: "50%",
        transform: `translate(-50%, -50%) scale(${toolScale}) translateY(${floatY}px)`,
        opacity: toolOpacity, zIndex: 10, direction: "ltr",
      }}>
        <span style={{
          fontFamily: STITCH.fontHeading, fontSize: 140, fontWeight: 900,
          color: STITCH.accent,
          textShadow: `0 8px 50px ${STITCH.accent}${Math.round(toolGlow * 255).toString(16).padStart(2, "0")}, 0 0 80px ${STITCH.accent}30`,
        }}>
          Stitch
        </span>
      </div>

      {/* "מבית Google" subtitle with glow pulse */}
      <div style={{
        position: "absolute", top: "56%", left: "50%",
        transform: `translate(-50%, -50%) translateY(${subY + floatY}px)`,
        opacity: subOpacity, zIndex: 10,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${STITCH.accent}, ${STITCH.accentDark})`,
          borderRadius: 60, padding: "14px 44px",
          boxShadow: `0 8px 30px ${STITCH.accent}${Math.round(subGlowPulse * 255).toString(16).padStart(2, "0")}`,
        }}>
          <span style={{
            fontFamily: STITCH.fontBody, fontSize: 44, fontWeight: 700,
            color: STITCH.textLight,
          }}>
            מבית Google
          </span>
        </div>
      </div>

      {/* Sparkles after Stitch lands — 6 instead of 4, bigger */}
      {frame >= toolStart + 8 && [
        { x: -320, y: -140, delay: toolStart + 8, size: 20 },
        { x: 340, y: -100, delay: toolStart + 9, size: 17 },
        { x: -240, y: 120, delay: toolStart + 10, size: 15 },
        { x: 280, y: 140, delay: toolStart + 11, size: 19 },
        { x: -380, y: 20, delay: toolStart + 12, size: 16 },
        { x: 380, y: -40, delay: toolStart + 13, size: 18 },
      ].map((s, i) => {
        const sF = Math.max(0, frame - s.delay);
        const sScale = spring({ frame: sF, fps, from: 0, to: 1, config: { damping: 4, mass: 0.2, stiffness: 300 } });
        const twinkle = 0.4 + Math.sin((frame + i * 10) / 3) * 0.6;
        return (
          <div key={`spark-${i}`} style={{
            position: "absolute", top: "42%", left: "50%",
            transform: `translate(calc(-50% + ${s.x}px), calc(-50% + ${s.y}px)) scale(${sScale}) rotate(45deg)`,
            width: s.size, height: s.size,
            background: i % 2 === 0 ? STITCH.accentLight : STITCH.accent,
            opacity: twinkle * 0.6,
            boxShadow: `0 0 ${s.size * 3}px ${STITCH.accentLight}50`,
            zIndex: 9,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};
