import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FLOW, flowBg } from "../styles";
import { FlowParticles } from "../FlowParticles";

// 3 tools inside Flow — Veo, Imagen, Whisk as glowing pills
export const ToolsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title
  const titleOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const titleY = spring({ frame, fps, from: -40, to: 0, config: { damping: 10, mass: 0.5 } });

  const tools = [
    { name: "Veo 3", desc: "סרטונים עם סאונד", color: FLOW.accent, icon: "▶", delay: 10 },
    { name: "Imagen 4", desc: "תמונות מדויקות", color: FLOW.blueLight, icon: "◆", delay: 22 },
    { name: "Whisk", desc: "עריכה ואנימציה", color: FLOW.warm, icon: "✦", delay: 34 },
  ];

  return (
    <AbsoluteFill style={flowBg}>
      <FlowParticles />

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", zIndex: 2, gap: 40,
      }}>
        {/* Title */}
        <div style={{
          fontFamily: FLOW.fontBody, fontSize: 44, fontWeight: 400,
          color: FLOW.textMuted, opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}>
          מה יש בפנים
        </div>

        {/* Tool pills */}
        {tools.map((tool, i) => {
          const f = Math.max(0, frame - tool.delay);
          // Enter BIG then settle
          const pillScale = spring({
            frame: f, fps, from: 1.4, to: 1,
            config: { damping: 6, mass: 0.4 },
          });
          const entryScale = spring({
            frame: f, fps, from: 0, to: 1,
            config: { damping: 7, mass: 0.3, stiffness: 250 },
          });
          const pillOpacity = interpolate(f, [0, 5], [0, 1], { extrapolateRight: "clamp" });

          // Neon glow pulse
          const glow = 0.15 + Math.sin((frame + i * 20) / 8) * 0.08;

          // Float offset
          const floatY = Math.sin((frame + i * 30) / 12) * 5;

          return (
            <div key={i} style={{
              transform: `scale(${entryScale * pillScale}) translateY(${floatY}px)`,
              opacity: pillOpacity,
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 28,
                background: `rgba(255,255,255,0.06)`,
                backdropFilter: "blur(16px)",
                border: `1px solid ${tool.color}30`,
                borderRadius: 80,
                padding: "28px 56px",
                boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 40px ${tool.color}${Math.round(glow * 255).toString(16).padStart(2, '0')}`,
                minWidth: 700,
                justifyContent: "center",
              }}>
                {/* Icon */}
                <span style={{
                  fontSize: 48, color: tool.color,
                  filter: `drop-shadow(0 0 12px ${tool.color}60)`,
                }}>
                  {tool.icon}
                </span>

                {/* Name */}
                <span style={{
                  fontFamily: FLOW.fontHeading, fontSize: 48, fontWeight: 800,
                  color: FLOW.textLight, direction: "ltr",
                }}>
                  {tool.name}
                </span>

                {/* Divider */}
                <div style={{
                  width: 2, height: 40,
                  background: `linear-gradient(${tool.color}00, ${tool.color}60, ${tool.color}00)`,
                }} />

                {/* Description */}
                <span style={{
                  fontFamily: FLOW.fontBody, fontSize: 38, fontWeight: 400,
                  color: FLOW.textMuted,
                }}>
                  {tool.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
