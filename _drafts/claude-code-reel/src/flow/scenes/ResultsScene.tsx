import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Video, staticFile } from "remotion";
import { FLOW, flowBg } from "../styles";
import { FlowParticles } from "../FlowParticles";

// Show the actual videos Meytal created — the proof!
export const ResultsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title fades in
  const titleOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  // Video 1 (lake) — enters from left
  const vid1Start = 8;
  const vid1X = spring({
    frame: Math.max(0, frame - vid1Start), fps,
    from: -600, to: 0, config: { damping: 8, mass: 0.6 },
  });
  const vid1Opacity = interpolate(frame, [vid1Start, vid1Start + 6], [0, 1], { extrapolateRight: "clamp" });

  // Video 2 (eagle) — enters from right
  const vid2Start = 20;
  const vid2X = spring({
    frame: Math.max(0, frame - vid2Start), fps,
    from: 600, to: 0, config: { damping: 8, mass: 0.6 },
  });
  const vid2Opacity = interpolate(frame, [vid2Start, vid2Start + 6], [0, 1], { extrapolateRight: "clamp" });

  // Caption
  const captionStart = 30;
  const captionOpacity = interpolate(frame, [captionStart, captionStart + 8], [0, 1], { extrapolateRight: "clamp" });
  const captionY = spring({
    frame: Math.max(0, frame - captionStart), fps,
    from: 30, to: 0, config: { damping: 10, mass: 0.5 },
  });

  // Neon frame glow
  const glow1 = 0.3 + Math.sin(frame / 8) * 0.15;
  const glow2 = 0.3 + Math.sin(frame / 8 + 2) * 0.15;

  return (
    <AbsoluteFill style={flowBg}>
      <FlowParticles />

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", zIndex: 2, gap: 24, padding: "0 40px",
      }}>
        {/* Title */}
        <div style={{
          fontFamily: "'Playpen Sans Hebrew', 'Rubik', sans-serif",
          fontSize: 56, fontWeight: 400,
          color: FLOW.accent, opacity: titleOpacity,
          textShadow: `0 0 30px ${FLOW.accent}40`,
          textAlign: "center",
        }}>
          יצרתי את זה עם משפט אחד
        </div>

        {/* Videos side by side */}
        <div style={{
          display: "flex", gap: 24, alignItems: "center",
          justifyContent: "center",
        }}>
          {/* Video 1 — Lake */}
          <div style={{
            transform: `translateX(${vid1X}px)`,
            opacity: vid1Opacity,
            borderRadius: 20, overflow: "hidden",
            border: `2px solid ${FLOW.accent}${Math.round(glow1 * 255).toString(16).padStart(2, '0')}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 30px ${FLOW.accent}${Math.round(glow1 * 200).toString(16).padStart(2, '0')}`,
            width: 440, height: 440,
          }}>
            <Video
              src={staticFile("flow-lake.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              volume={0}
              startFrom={0}
            />
          </div>

          {/* Video 2 — Eagle */}
          <div style={{
            transform: `translateX(${vid2X}px)`,
            opacity: vid2Opacity,
            borderRadius: 20, overflow: "hidden",
            border: `2px solid ${FLOW.blueLight}${Math.round(glow2 * 255).toString(16).padStart(2, '0')}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 30px ${FLOW.blueLight}${Math.round(glow2 * 200).toString(16).padStart(2, '0')}`,
            width: 440, height: 440,
          }}>
            <Video
              src={staticFile("flow-eagle.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              volume={0}
              startFrom={0}
            />
          </div>
        </div>

        {/* Caption */}
        <div style={{
          fontFamily: FLOW.fontBody, fontSize: 44, fontWeight: 600,
          color: FLOW.textLight, textAlign: "center",
          opacity: captionOpacity,
          transform: `translateY(${captionY}px)`,
        }}>
          בעברית. פחות מדקה.
        </div>

        {/* "Made with Flow" badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          opacity: captionOpacity,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 40, padding: "12px 28px",
          border: `1px solid rgba(255,255,255,0.1)`,
        }}>
          <svg width="24" height="24" viewBox="0 0 64 64">
            <path d="M24 16 L48 32 L24 48 Z" fill={FLOW.accent} />
          </svg>
          <span style={{
            fontFamily: FLOW.fontHeading, fontSize: 28, fontWeight: 500,
            color: FLOW.textMuted, direction: "ltr",
          }}>
            Made with Google Flow
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
