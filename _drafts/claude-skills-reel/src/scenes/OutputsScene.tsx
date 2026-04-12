import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { STYLE, bgStyle } from "../styles";
import { Particles } from "../Particles";

// Real outputs cascade — showing what skills actually produce
export const OutputsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  const outputs = [
    { label: "מצגת הדרכה", icon: "M4 6h16M4 12h16M4 18h16", color: STYLE.accent, rotate: -4, x: -20, y: -30 },
    { label: "רילס", icon: "M23 7l-7 5 7 5V7z M14 5H3v14h11V5z", color: "#E4405F", rotate: 3, x: 30, y: -15 },
    { label: "שאלון דיפרנציאלי", icon: "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11", color: STYLE.teal, rotate: -2, x: -10, y: 0 },
    { label: "אינפוגרפיקה", icon: "M12 20V10 M18 20V4 M6 20v-4", color: "#4A90D9", rotate: 5, x: 20, y: 15 },
    { label: "פוסט לרשתות", icon: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z", color: "#1877F2", rotate: -3, x: -25, y: 30 },
  ];

  // Terminal header
  const termOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 20, zIndex: 10, padding: "0 40px",
      }}>
        {/* Terminal prompt */}
        <div style={{
          width: 800, padding: "16px 28px",
          borderRadius: 14,
          background: STYLE.cardDark,
          boxShadow: STYLE.shadowHeavy,
          opacity: termOpacity,
          direction: "ltr",
        }}>
          <span style={{
            fontFamily: STYLE.fontMono, fontSize: 24,
            color: STYLE.terminalGreen,
          }}>{'>'}</span>
          <span style={{
            fontFamily: STYLE.fontMono, fontSize: 24,
            color: STYLE.terminalText, marginLeft: 8,
          }}>
            /training pomelli
          </span>
          <span style={{
            fontFamily: STYLE.fontMono, fontSize: 24,
            color: STYLE.terminalGreen, marginLeft: 16,
          }}>
            ✓ done
          </span>
        </div>

        {/* Title */}
        <div style={{
          fontFamily: STYLE.fontHeading, fontSize: 44, fontWeight: 700,
          color: STYLE.textDark, textAlign: "center",
          opacity: titleOpacity, direction: "rtl",
          marginTop: 10, marginBottom: 10,
        }}>
          פקודה אחת. <span style={{ color: STYLE.accent }}>5 תוצרים.</span>
        </div>

        {/* Cards cascade */}
        <div style={{
          position: "relative",
          width: 900, height: 700,
        }}>
          {outputs.map((output, i) => {
            const cardDelay = 25 + i * 22;
            const cardScale = spring({
              frame: Math.max(0, frame - cardDelay), fps,
              from: 0.5, to: 1,
              config: { damping: 6, mass: 0.4, stiffness: 200 },
            });
            const cardOpacity = interpolate(frame, [cardDelay, cardDelay + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const cardY = spring({
              frame: Math.max(0, frame - cardDelay), fps,
              from: -200, to: 0,
              config: { damping: 7, mass: 0.5 },
            });

            // Stack position
            const baseY = i * 130;
            const floatY = frame > cardDelay + 15 ? Math.sin((frame + i * 30) / 14) * 3 : 0;

            // Flash on land
            const flashOpacity = interpolate(frame, [cardDelay + 8, cardDelay + 10, cardDelay + 15], [0, 0.1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

            return (
              <React.Fragment key={output.label}>
                <div style={{
                  position: "absolute", inset: 0,
                  background: output.color,
                  opacity: flashOpacity,
                  pointerEvents: "none", zIndex: 30,
                  borderRadius: 20,
                }} />

                <div style={{
                  position: "absolute",
                  left: 50 + output.x,
                  top: baseY + cardY + floatY,
                  width: 800,
                  padding: "24px 36px",
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(10px)",
                  boxShadow: `0 8px 30px ${output.color}12, 0 2px 8px rgba(0,0,0,0.04)`,
                  border: `1px solid ${output.color}20`,
                  display: "flex", alignItems: "center", gap: 20,
                  transform: `scale(${cardScale}) rotate(${output.rotate}deg)`,
                  opacity: cardOpacity,
                  zIndex: 10 + i,
                  direction: "rtl",
                }}>
                  {/* Icon */}
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: `${output.color}12`,
                    border: `1px solid ${output.color}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={output.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={output.icon} />
                    </svg>
                  </div>

                  <span style={{
                    fontFamily: STYLE.fontHeading, fontSize: 32, fontWeight: 700,
                    color: STYLE.textDark,
                  }}>
                    {output.label}
                  </span>

                  {/* Checkmark */}
                  <div style={{
                    marginRight: "auto", marginLeft: 0,
                    opacity: interpolate(frame, [cardDelay + 12, cardDelay + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={STYLE.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
