import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { STYLE, bgStyle } from "../styles";
import { Particles } from "../Particles";

// Before/After: messy prompt vs clean skill command
export const BeforeAfterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const beforeY = spring({ frame: Math.max(0, frame - 5), fps, from: 400, to: 0, config: { damping: 8, mass: 0.6 } });
  const beforeOpacity = interpolate(frame, [5, 13], [0, 1], { extrapolateRight: "clamp" });

  const afterY = spring({ frame: Math.max(0, frame - 55), fps, from: 400, to: 0, config: { damping: 8, mass: 0.6 } });
  const afterOpacity = interpolate(frame, [55, 63], [0, 1], { extrapolateRight: "clamp" });

  const afterGlow = frame > 70 ? 0.15 + Math.sin((frame - 70) / 5) * 0.05 : 0;

  // Reduced to 5 lines, larger font
  const messyLines = [
    "תבנה מצגת על Pomelli. פונט Heebo, צבעים ירוקים.",
    "תוסיף שקפים עם דוגמאות. אל תשכח RTL ו-responsive.",
    "תוסיף שאלון בסוף עם 5 שאלות. תשמור ב-docs/training.",
    "אה, וגם favicon, meta tags, אנימציות CSS...",
    "רגע, גם לוגו, קישורים, ובדיקת QA.",
  ];

  // Blur before card when after appears
  const beforeBlur = interpolate(frame, [55, 65], [0, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 28, zIndex: 10, padding: "0 50px",
      }}>
        {/* Before — messy prompt */}
        <div style={{
          width: 860, borderRadius: 20,
          background: `${STYLE.accent}08`,
          border: `1px solid ${STYLE.accent}25`,
          boxShadow: `0 12px 40px ${STYLE.accent}08`,
          padding: "28px 36px",
          transform: `translateY(${beforeY}px)`,
          opacity: beforeOpacity,
          filter: `blur(${beforeBlur}px)`,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            marginBottom: 16,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${STYLE.terminalRed}20`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={STYLE.terminalRed} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <span style={{
              fontFamily: STYLE.fontHeading, fontSize: 30, fontWeight: 700,
              color: STYLE.accentDark, direction: "rtl",
            }}>
              בלי סקיל
            </span>
          </div>

          <div style={{
            fontFamily: STYLE.fontMono, fontSize: 22,
            color: "#6A5A4A", lineHeight: 1.8, direction: "rtl",
            opacity: 0.85,
          }}>
            {messyLines.map((line, i) => {
              const lineOpacity = interpolate(frame, [12 + i * 6, 16 + i * 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return <div key={i} style={{ opacity: lineOpacity }}>{line}</div>;
            })}
          </div>
        </div>

        {/* After — clean skill */}
        <div style={{
          width: 860, borderRadius: 20,
          background: STYLE.cardDark,
          boxShadow: `0 20px 60px rgba(0,0,0,0.12), 0 0 40px ${STYLE.teal}${Math.round(afterGlow * 255).toString(16).padStart(2, '0')}`,
          border: `1px solid ${STYLE.teal}30`,
          padding: "28px 36px",
          transform: `translateY(${afterY}px)`,
          opacity: afterOpacity,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            marginBottom: 16,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${STYLE.teal}20`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={STYLE.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span style={{
              fontFamily: STYLE.fontHeading, fontSize: 30, fontWeight: 700,
              color: STYLE.teal, direction: "rtl",
            }}>
              עם סקיל
            </span>
          </div>

          <div style={{
            fontFamily: STYLE.fontMono, fontSize: 32, fontWeight: 600,
            color: STYLE.terminalGreen, direction: "ltr",
          }}>
            <span style={{ color: STYLE.terminalGreen }}>{'>'}</span>
            <span style={{ color: STYLE.terminalText, marginLeft: 8 }}>
              /training pomelli
            </span>
          </div>
          <div style={{
            fontFamily: STYLE.fontBody, fontSize: 28,
            color: STYLE.terminalYellow, marginTop: 12,
            direction: "rtl",
            opacity: interpolate(frame, [75, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>
            מצגת + שאלון + רילס + אינפוגרפיקה + פוסט
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
