import React from "react";
import {
  AbsoluteFill,
  Video,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
} from "remotion";
import { loadFont as loadKarantina } from "@remotion/google-fonts/Karantina";
import { loadFont as loadHeebo } from "@remotion/google-fonts/Heebo";

const karantinaInfo = loadKarantina();
const heeboInfo = loadHeebo();

const karantina = karantinaInfo.fontFamily;
const heebo = heeboInfo.fontFamily;

export const HourglassReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title: "3 משפטים בעברית." — appears at ~1.5s
  const titleStart = Math.round(fps * 1.5);
  const titleOpacity = interpolate(frame, [titleStart, titleStart + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [titleStart, titleStart + 15], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Second line: "שעות חזרה אליך." — appears at ~3s
  const line2Start = Math.round(fps * 3);
  const line2Scale = spring({
    frame: frame - line2Start,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const line2Opacity = interpolate(frame, [line2Start, line2Start + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtitle: "גלו איך עם Claude Code" — appears at ~5s
  const subStart = Math.round(fps * 5);
  const subOpacity = interpolate(frame, [subStart, subStart + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subY = interpolate(frame, [subStart, subStart + 20], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Claude orange glow pulse for subtitle
  const orangeGlow = interpolate(
    Math.sin((frame - subStart) * 0.12),
    [-1, 1],
    [15, 35],
  );

  // Glowing line that expands before subtitle text
  const lineStart = Math.round(fps * 4.5);
  const lineWidth = spring({
    frame: frame - lineStart,
    fps,
    config: { damping: 15, stiffness: 80 },
  });
  const lineOpacity = interpolate(frame, [lineStart, lineStart + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtitle text appears after line expands — with letter spacing animation
  const subTextStart = Math.round(fps * 5.5);
  const subTextOpacity = interpolate(frame, [subTextStart, subTextStart + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subLetterSpacing = interpolate(frame, [subTextStart, subTextStart + 20], [30, 2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subScale = spring({
    frame: frame - subTextStart,
    fps,
    config: { damping: 10, stiffness: 60 },
  });

  // Subtle glow pulse on the number 3
  const glowIntensity = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [8, 20],
  );

  return (
    <AbsoluteFill>
      {/* Background video — only first 5s (before Pomelli text), slowed to fill 12s */}
      <Video
        src={staticFile("hourglass.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        endAt={Math.round(fps * 5)}
        playbackRate={5 / 12}
      />

      {/* Dark overlay for text readability */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Text container */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          direction: "rtl",
          padding: "0 60px",
        }}
      >
        {/* Main title line 1 */}
        <div
          style={{
            fontFamily: karantina,
            fontSize: 110,
            color: "#ffffff",
            textAlign: "center",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textShadow: `0 0 ${glowIntensity}px rgba(0, 210, 210, 0.6), 0 4px 20px rgba(0,0,0,0.8)`,
            lineHeight: 1.1,
            letterSpacing: "2px",
          }}
        >
          3 משפטים בעברית.
        </div>

        {/* Main title line 2 */}
        <div
          style={{
            fontFamily: karantina,
            fontSize: 120,
            color: "#00e6d0",
            textAlign: "center",
            opacity: line2Opacity,
            transform: `scale(${line2Scale})`,
            textShadow: "0 0 30px rgba(0, 230, 208, 0.5), 0 4px 20px rgba(0,0,0,0.8)",
            lineHeight: 1.1,
            marginTop: 20,
            letterSpacing: "2px",
          }}
        >
          שעות חזרה אליך.
        </div>

        {/* Glowing orange line */}
        <div
          style={{
            marginTop: 45,
            width: `${lineWidth * 500}px`,
            maxWidth: "80%",
            height: 2,
            background: "linear-gradient(90deg, transparent, #E87B35, transparent)",
            opacity: lineOpacity,
            boxShadow: `0 0 20px rgba(232, 123, 53, 0.8), 0 0 40px rgba(232, 123, 53, 0.4)`,
          }}
        />

        {/* Subtitle — Claude orange with glow, dramatic entrance */}
        <div
          style={{
            fontFamily: heebo,
            fontSize: 44,
            fontWeight: 400,
            color: "#E87B35",
            textAlign: "center",
            opacity: subTextOpacity,
            transform: `scale(${subScale})`,
            letterSpacing: `${subLetterSpacing}px`,
            textShadow: `0 0 ${orangeGlow}px rgba(232, 123, 53, 0.7), 0 0 ${orangeGlow * 2}px rgba(232, 123, 53, 0.3), 0 4px 15px rgba(0,0,0,0.8)`,
            marginTop: 20,
            lineHeight: 1.5,
          }}
        >
          גלו איך עם Claude Code
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
