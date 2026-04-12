import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { STYLE, bgStyle } from "../styles";
import { Particles } from "../Particles";

// VS Code style: showing SKILL.md structure — larger fonts
export const StructureScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const titleY = spring({ frame, fps, from: -40, to: 0, config: { damping: 8, mass: 0.5 } });

  const components = [
    { icon: "{ }", label: "Metadata", desc: "שם + תיאור", color: STYLE.accent },
    { icon: "→", label: "Input", desc: "מה צריך מהמשתמש", color: "#4A90D9" },
    { icon: "←", label: "Output", desc: "מה נוצר ולאן", color: STYLE.teal },
    { icon: "▶", label: "Steps", desc: "שלב אחר שלב", color: "#E8853D" },
    { icon: "!", label: "Rules", desc: "כללי ברזל", color: "#C0392B" },
  ];

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 28, zIndex: 10, padding: "0 50px",
      }}>
        <div style={{
          fontFamily: STYLE.fontHeading, fontSize: 52, fontWeight: 800,
          color: STYLE.textDark, textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          marginBottom: 10, direction: "rtl",
        }}>
          האנטומיה של סקיל טוב
        </div>

        <div style={{
          width: 860, borderRadius: 20,
          background: STYLE.terminal,
          boxShadow: STYLE.shadowHeavy,
          overflow: "hidden",
        }}>
          <div style={{
            display: "flex", alignItems: "center",
            padding: "14px 20px",
            background: "#181825",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            gap: 10,
          }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F56" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FFBD2E" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27C93F" }} />
            </div>
            <span style={{
              fontFamily: STYLE.fontMono, fontSize: 16, color: "rgba(255,255,255,0.5)",
              marginLeft: 16,
            }}>
              SKILL.md
            </span>
          </div>

          <div style={{ padding: "28px 36px", display: "flex", flexDirection: "column", gap: 0 }}>
            {components.map((comp, i) => {
              const lineStart = 12 + i * 28;
              const lineEnd = lineStart + 18;
              const fullText = `${comp.label}: ${comp.desc}`;
              const chars = Math.floor(interpolate(frame, [lineStart, lineEnd], [0, fullText.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
              const isTyping = frame >= lineStart && frame < lineEnd;
              const isDone = frame >= lineEnd;

              const checkScale = spring({ frame: Math.max(0, frame - lineEnd - 2), fps, from: 0, to: 1, config: { damping: 3, stiffness: 400 } });
              const checkOpacity = interpolate(frame, [lineEnd + 2, lineEnd + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const lineOpacity = interpolate(frame, [lineStart - 2, lineStart], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

              return (
                <div key={comp.label} style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "16px 0",
                  borderBottom: i < components.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  opacity: lineOpacity, direction: "ltr",
                }}>
                  <span style={{
                    fontFamily: STYLE.fontMono, fontSize: 22,
                    color: "rgba(255,255,255,0.25)", width: 30, textAlign: "right",
                  }}>
                    {i + 1}
                  </span>

                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `${comp.color}20`,
                    border: `1px solid ${comp.color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: STYLE.fontMono, fontSize: 22, fontWeight: 700,
                    color: comp.color,
                  }}>
                    {comp.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <span style={{
                      fontFamily: STYLE.fontMono, fontSize: 28, fontWeight: 600,
                      color: comp.color,
                    }}>
                      {fullText.slice(0, Math.min(chars, comp.label.length))}
                    </span>
                    {chars > comp.label.length && (
                      <span style={{
                        fontFamily: STYLE.fontBody, fontSize: 28,
                        color: "rgba(255,255,255,0.7)", direction: "rtl",
                      }}>
                        {fullText.slice(comp.label.length, chars)}
                      </span>
                    )}
                    {isTyping && (
                      <span style={{
                        color: comp.color,
                        opacity: Math.sin(frame / 4) > 0 ? 1 : 0,
                        fontSize: 28,
                      }}>|</span>
                    )}
                  </div>

                  {isDone && (
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: `${STYLE.teal}20`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transform: `scale(${checkScale})`,
                      opacity: checkOpacity,
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={STYLE.teal} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
