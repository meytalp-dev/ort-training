import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Img,
  staticFile,
} from "remotion";
import { STYLE, bgStyle } from "../styles";
import { Particles } from "../Particles";

// Gentle fade-in hook with screenshot of quiz welcome screen
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main text fades in gently
  const textStart = 8;
  const textScale = spring({
    frame: Math.max(0, frame - textStart),
    fps,
    from: 0.85,
    to: 1,
    config: { damping: 15, mass: 0.8 },
  });
  const textOpacity = interpolate(frame, [textStart, textStart + 15], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Screenshot fades in after text
  const imgStart = 30;
  const imgY = spring({
    frame: Math.max(0, frame - imgStart),
    fps,
    from: 60,
    to: 0,
    config: { damping: 14, mass: 0.7 },
  });
  const imgOpacity = interpolate(frame, [imgStart, imgStart + 15], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Subtitle appears
  const subStart = 55;
  const subOpacity = interpolate(frame, [subStart, subStart + 12], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const subY = spring({
    frame: Math.max(0, frame - subStart),
    fps,
    from: 30,
    to: 0,
    config: { damping: 12, mass: 0.6 },
  });

  // Gentle float for screenshot
  const floatY = Math.sin(frame / 18) * 4;

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      {/* Main title — gentle fade */}
      <div
        style={{
          position: "absolute",
          top: 280,
          left: "50%",
          transform: `translate(-50%, 0) scale(${textScale})`,
          opacity: textOpacity,
          zIndex: 20,
          textAlign: "center",
          width: "90%",
        }}
      >
        <div
          style={{
            fontFamily: STYLE.fontHandwriting,
            fontSize: 78,
            fontWeight: 400,
            color: STYLE.textDark,
            lineHeight: 1.4,
          }}
        >
          שאלון אחד
        </div>
        <div
          style={{
            fontFamily: STYLE.fontHandwriting,
            fontSize: 78,
            fontWeight: 400,
            color: STYLE.mint,
            lineHeight: 1.4,
            textShadow: `0 4px 30px ${STYLE.mint}25`,
          }}
        >
          שמתאים את עצמו לכל אחד
        </div>
      </div>

      {/* Screenshot of welcome screen */}
      <div
        style={{
          position: "absolute",
          top: 680,
          left: "50%",
          transform: `translate(-50%, ${imgY + floatY}px)`,
          opacity: imgOpacity,
          zIndex: 15,
          width: 750,
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: `0 20px 60px ${STYLE.lavender}18, 0 8px 24px rgba(0,0,0,0.06)`,
          border: `2px solid rgba(255,255,255,0.6)`,
        }}
      >
        <Img
          src={staticFile("screenshots/quiz-welcome.png")}
          style={{ width: "100%", display: "block" }}
        />
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          bottom: 260,
          left: "50%",
          transform: `translate(-50%, ${subY}px)`,
          opacity: subOpacity,
          zIndex: 20,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: STYLE.fontBody,
            fontSize: 44,
            fontWeight: 500,
            color: STYLE.textMuted,
          }}
        >
          5 דקות. בלי קוד. בלי Word.
        </div>
      </div>

      {/* Soft glow */}
      <div
        style={{
          position: "absolute",
          top: 600,
          left: "50%",
          width: 600,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${STYLE.lavender}10 0%, transparent 70%)`,
          transform: "translate(-50%, 0)",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
