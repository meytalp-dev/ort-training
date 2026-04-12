import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { STYLE, bgStyle } from "../styles";
import { Particles } from "../Particles";

// Terminal screen: running /training and showing output
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const termY = spring({ frame, fps, from: 400, to: 0, config: { damping: 8, mass: 0.6 } });
  const termOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  const cmd = "/training --list";
  const cmdChars = Math.floor(interpolate(frame, [15, 40], [0, cmd.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  const outputLines = [
    { text: "44 סקילים נמצאו", isHebrew: true, color: STYLE.terminalGreen, delay: 48 },
    { text: "נוסחה אחת. אותן תוצאות — כל פעם.", isHebrew: true, color: STYLE.terminalYellow, delay: 60 },
    { text: "", isHebrew: false, color: "", delay: 0 },
    { text: "בונה מצגת...        ✓", isHebrew: true, color: STYLE.terminalGreen, delay: 70 },
    { text: "בונה שאלון...       ✓", isHebrew: true, color: STYLE.terminalGreen, delay: 80 },
    { text: "בונה רילס...        ✓", isHebrew: true, color: STYLE.terminalGreen, delay: 90 },
    { text: "", isHebrew: false, color: "", delay: 0 },
    { text: "הכל מוכן.", isHebrew: true, color: STYLE.terminalPink, delay: 105 },
  ];

  const showNumber = frame > 115;
  const numScale = spring({ frame: Math.max(0, frame - 115), fps, from: 4, to: 1, config: { damping: 5, mass: 0.3, stiffness: 200 } });
  const numOpacity = interpolate(frame, [115, 120], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 30, zIndex: 10,
        transform: `translateY(${termY}px)`,
        opacity: termOpacity,
      }}>
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
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#FF5F56" }} />
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#FFBD2E" }} />
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#27C93F" }} />
            <span style={{
              fontFamily: STYLE.fontMono, fontSize: 16,
              color: "rgba(255,255,255,0.4)", marginLeft: 16,
            }}>
              Terminal — claude-code
            </span>
          </div>

          <div style={{
            padding: "24px 32px",
            fontFamily: STYLE.fontMono, fontSize: 28,
            lineHeight: 1.8, direction: "ltr",
          }}>
            <div>
              <span style={{ color: STYLE.terminalGreen }}>{'>'}</span>
              <span style={{ color: STYLE.terminalText, marginLeft: 8 }}>
                {cmd.slice(0, cmdChars)}
              </span>
              {frame < 40 && (
                <span style={{ color: STYLE.terminalText, opacity: Math.sin(frame / 4) > 0 ? 1 : 0 }}>_</span>
              )}
            </div>

            {outputLines.map((line, i) => {
              if (!line.text) return <div key={i} style={{ height: 12 }} />;
              const lineOpacity = interpolate(frame, [line.delay, line.delay + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={i} style={{
                  color: line.color, opacity: lineOpacity,
                  direction: line.isHebrew ? "rtl" : "ltr",
                  fontSize: 28,
                }}>
                  {line.text}
                </div>
              );
            })}
          </div>
        </div>

        {showNumber && (
          <div style={{
            position: "absolute", top: "12%",
            fontFamily: STYLE.fontHeading, fontSize: 180, fontWeight: 900,
            color: STYLE.accent,
            transform: `scale(${numScale})`,
            opacity: numOpacity,
            textShadow: `0 0 60px ${STYLE.accent}40`,
          }}>
            44
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
