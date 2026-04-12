import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { STYLE, bgStyle } from "../styles";
import { Particles } from "../Particles";

// Terminal showing skill calling other skills — pipeline
export const CompositionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  const cmd = "/training pomelli";
  const cmdChars = Math.floor(interpolate(frame, [10, 30], [0, cmd.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  const pipelineSteps = [
    { text: "מפעיל /ai-expert — חוקר את הכלי...", isHebrew: true, color: STYLE.terminalBlue, delay: 35, statusDelay: 50 },
    { text: "מפעיל /create-reels — בונה סרטון...", isHebrew: true, color: STYLE.terminalBlue, delay: 55, statusDelay: 72 },
    { text: "מפעיל /create-quiz — בונה שאלון...", isHebrew: true, color: STYLE.terminalBlue, delay: 77, statusDelay: 92 },
    { text: "מפעיל /infographic — סיכום ויזואלי...", isHebrew: true, color: STYLE.terminalBlue, delay: 97, statusDelay: 112 },
    { text: "מפעיל /social-publish — פוסט לרשתות...", isHebrew: true, color: STYLE.terminalBlue, delay: 117, statusDelay: 130 },
  ];

  const finalDelay = 138;
  const finalOpacity = interpolate(frame, [finalDelay, finalDelay + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const tagDelay = 148;
  const tagOpacity = interpolate(frame, [tagDelay, tagDelay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagY = spring({ frame: Math.max(0, frame - tagDelay), fps, from: 30, to: 0, config: { damping: 8, mass: 0.5 } });

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 25, zIndex: 10, padding: "0 50px",
      }}>
        <div style={{
          fontFamily: STYLE.fontHeading, fontSize: 48, fontWeight: 800,
          color: STYLE.textDark, textAlign: "center",
          opacity: titleOpacity, direction: "rtl",
        }}>
          סקיל אחד מפעיל <span style={{ color: STYLE.accent }}>תהליך שלם</span>
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
            gap: 10,
          }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F56" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FFBD2E" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27C93F" }} />
            </div>
            <span style={{
              fontFamily: STYLE.fontMono, fontSize: 16,
              color: "rgba(255,255,255,0.4)", marginLeft: 16,
            }}>
              Terminal — pipeline
            </span>
          </div>

          <div style={{
            padding: "24px 32px",
            fontFamily: STYLE.fontMono, fontSize: 26,
            lineHeight: 1.9,
          }}>
            <div style={{ direction: "ltr" }}>
              <span style={{ color: STYLE.terminalGreen }}>{'>'}</span>
              <span style={{ color: STYLE.terminalText, marginLeft: 8 }}>
                {cmd.slice(0, cmdChars)}
              </span>
              {frame < 30 && (
                <span style={{ color: STYLE.terminalText, opacity: Math.sin(frame / 4) > 0 ? 1 : 0 }}>_</span>
              )}
            </div>

            {pipelineSteps.map((step, i) => {
              const stepOpacity = interpolate(frame, [step.delay, step.delay + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const statusOpacity = interpolate(frame, [step.statusDelay, step.statusDelay + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

              const isWaiting = frame >= step.delay && frame < step.statusDelay;
              const spinChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
              const spinChar = spinChars[Math.floor(frame / 2) % spinChars.length];

              return (
                <div key={i} style={{
                  color: step.color, opacity: stepOpacity,
                  display: "flex", justifyContent: "space-between",
                  direction: "rtl", fontSize: 26,
                }}>
                  <span>{step.text}</span>
                  <span style={{ color: STYLE.terminalGreen, opacity: statusOpacity, direction: "ltr" }}>
                    {isWaiting ? <span style={{ color: STYLE.terminalYellow }}>{spinChar}</span> : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={STYLE.terminalGreen} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle" }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                </div>
              );
            })}

            <div style={{ opacity: finalOpacity, marginTop: 8, direction: "rtl" }}>
              <span style={{ color: STYLE.terminalPink, fontWeight: 700, fontSize: 28 }}>
                5 תוצרים מוכנים מפקודה אחת.
              </span>
            </div>
          </div>
        </div>

        <div style={{
          fontFamily: STYLE.fontHeading, fontSize: 44, fontWeight: 700,
          color: STYLE.textDark, textAlign: "center",
          opacity: tagOpacity,
          transform: `translateY(${tagY}px)`,
          direction: "rtl",
        }}>
          פקודה אחת. <span style={{ color: STYLE.accent }}>תהליך אוטומטי מלא.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
