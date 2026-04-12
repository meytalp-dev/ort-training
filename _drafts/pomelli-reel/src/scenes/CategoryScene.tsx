import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { POMELLI, pomelliBg } from "../styles";
import { Particles } from "../Particles";

// Intro — "בואו נכיר היום את... Pomelli מבית Google"
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

  // "Pomelli" slams in at frame 42
  const toolStart = 42;
  const toolScale = spring({
    frame: Math.max(0, frame - toolStart), fps,
    from: 4, to: 1,
    config: { damping: 5, mass: 0.3, stiffness: 180 },
  });
  const toolOpacity = interpolate(frame, [toolStart, toolStart + 4], [0, 1], { extrapolateRight: "clamp" });
  const toolGlow = frame >= toolStart + 4
    ? 0.3 + Math.sin((frame - toolStart) / 5) * 0.15 : 0.3;

  // "מבית Google" subtitle
  const subStart = toolStart + 14;
  const subOpacity = interpolate(frame, [subStart, subStart + 8], [0, 1], { extrapolateRight: "clamp" });
  const subY = spring({
    frame: Math.max(0, frame - subStart), fps,
    from: 30, to: 0, config: { damping: 8, mass: 0.5 },
  });

  // Screenshot peek in background
  const screenshotOpacity = interpolate(frame, [10, 25], [0, 0.15], { extrapolateRight: "clamp" });
  const screenshotScale = interpolate(frame, [10, 60], [1.1, 1.2], { extrapolateRight: "clamp" });

  // Flash on tool name slam
  const flashOpacity = interpolate(frame, [toolStart, toolStart + 2, toolStart + 8], [0, 0.2, 0], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill style={pomelliBg}>
      <Particles />

      {/* Background screenshot hint */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: `translate(-50%, -50%) scale(${screenshotScale})`,
        width: 900, height: 900, borderRadius: 40,
        overflow: "hidden", opacity: screenshotOpacity,
        filter: "blur(6px)", zIndex: 0,
      }}>
        <Img src={staticFile("screenshots/pomelli-homepage.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Flash */}
      <div style={{
        position: "absolute", inset: 0, background: POMELLI.accent,
        opacity: flashOpacity, zIndex: 5, pointerEvents: "none",
      }} />

      {/* "בואו נכיר היום את..." */}
      <div style={{
        position: "absolute", top: "38%", left: "50%",
        transform: `translate(-50%, -50%) scale(${introScale}) translateY(${floatY}px)`,
        opacity: introOpacity * introFadeOut, zIndex: 3,
      }}>
        <div style={{
          fontFamily: "'Playpen Sans Hebrew', 'Rubik', sans-serif",
          fontSize: 80, fontWeight: 400,
          color: POMELLI.textDark,
          textAlign: "center", lineHeight: 1.3,
        }}>
          בואו נכיר היום את...
        </div>
      </div>

      {/* "Pomelli" — big slam */}
      <div style={{
        position: "absolute", top: "42%", left: "50%",
        transform: `translate(-50%, -50%) scale(${toolScale}) translateY(${floatY}px)`,
        opacity: toolOpacity, zIndex: 10, direction: "ltr",
      }}>
        <span style={{
          fontFamily: POMELLI.fontHeading, fontSize: 140, fontWeight: 900,
          color: POMELLI.accent,
          textShadow: `0 8px 50px ${POMELLI.accent}${Math.round(toolGlow * 255).toString(16).padStart(2, "0")}, 0 0 80px rgba(232,84,140,0.4)`,
        }}>
          Pomelli
        </span>
      </div>

      {/* "מבית Google" subtitle */}
      <div style={{
        position: "absolute", top: "56%", left: "50%",
        transform: `translate(-50%, -50%) translateY(${subY + floatY}px)`,
        opacity: subOpacity, zIndex: 10,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${POMELLI.accent}, ${POMELLI.accentDark})`,
          borderRadius: 60, padding: "14px 44px",
          boxShadow: `0 8px 30px ${POMELLI.accent}40`,
        }}>
          <span style={{
            fontFamily: POMELLI.fontBody, fontSize: 44, fontWeight: 700,
            color: POMELLI.textLight,
          }}>
            מבית Google
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
