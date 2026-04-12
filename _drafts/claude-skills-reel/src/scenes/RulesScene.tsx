import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { STYLE, bgStyle } from "../styles";
import { Particles } from "../Particles";

// Terminal showing rules — larger fonts, fewer lines
export const RulesScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  const rules = [
    { text: '# כללי ברזל', color: STYLE.terminalPink, delay: 10 },
    { text: '', color: '', delay: 0 },
    { text: '- תמיד להגדיר פורמט פלט', color: STYLE.terminalGreen, delay: 22 },
    { text: '- לבדוק עובדות לפני פרסום', color: STYLE.terminalGreen, delay: 42 },
    { text: '- בדיקת איכות לפני הצגה', color: STYLE.terminalGreen, delay: 62 },
    { text: '', color: '', delay: 0 },
    { text: '# לא ככה:', color: STYLE.terminalYellow, delay: 85 },
    { text: '"תעשה שזה ייראה טוב"', color: STYLE.terminalRed, delay: 95 },
    { text: '', color: '', delay: 0 },
    { text: '# אלא ככה:', color: STYLE.terminalYellow, delay: 115 },
    { text: '"פלט: HTML | רקע: בהיר | QA: חובה"', color: STYLE.terminalGreen, delay: 125 },
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
          fontFamily: STYLE.fontHeading, fontSize: 50, fontWeight: 800,
          color: STYLE.textDark, textAlign: "center",
          opacity: titleOpacity, direction: "rtl",
        }}>
          כללי ברזל — <span style={{ color: STYLE.accent }}>לא הנחיות עמומות</span>
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
              SKILL.md — rules
            </span>
          </div>

          <div style={{
            padding: "28px 36px",
            fontFamily: STYLE.fontMono,
            lineHeight: 2, direction: "rtl",
          }}>
            {rules.map((rule, i) => {
              if (!rule.text) return <div key={i} style={{ height: 10 }} />;

              const ruleChars = Math.floor(interpolate(frame, [rule.delay, rule.delay + 14], [0, rule.text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
              const isTyping = frame >= rule.delay && frame < rule.delay + 14;

              return (
                <div key={i} style={{
                  color: rule.color,
                  opacity: frame >= rule.delay ? 1 : 0,
                  fontSize: rule.text.startsWith('#') ? 30 : 28,
                  fontWeight: rule.text.startsWith('#') ? 700 : 400,
                }}>
                  {rule.text.slice(0, ruleChars)}
                  {isTyping && (
                    <span style={{ opacity: Math.sin(frame / 4) > 0 ? 1 : 0 }}>_</span>
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
