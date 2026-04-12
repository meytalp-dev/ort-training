import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { STYLE, bgStyle } from "../styles";
import { Particles } from "../Particles";

// Typing Reveal: "רוצים לבנות סקיל ב-Claude Code? הנה הנוסחה."
export const CategoryScene: React.FC = () => {
  const frame = useCurrentFrame();

  const line1 = "רוצים לבנות סקיל";
  const line2eng = "Claude Code";
  const line2heb = "?ב-";
  const line3 = "הנה הנוסחה.";

  const cursorOpacity = Math.sin(frame / 4) > 0 ? 1 : 0;

  const chars1 = Math.floor(interpolate(frame, [5, 30], [0, line1.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  // Line 2: type the full "ב-Claude Code?" as one unit
  const fullLine2 = "ב-Claude Code?";
  const chars2 = Math.floor(interpolate(frame, [32, 58], [0, fullLine2.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const chars3 = Math.floor(interpolate(frame, [62, 80], [0, line3.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  const activeLine = frame < 32 ? 1 : frame < 62 ? 2 : 3;

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 20, zIndex: 10,
        padding: "0 60px",
      }}>
        {/* Line 1 — Hebrew */}
        <div style={{
          fontFamily: STYLE.fontHeading, fontSize: 74, fontWeight: 500,
          color: STYLE.textDark, textAlign: "center",
          minHeight: 90, direction: "rtl",
        }}>
          {line1.slice(0, chars1)}
          {activeLine === 1 && (
            <span style={{ opacity: cursorOpacity, color: STYLE.accent }}>|</span>
          )}
        </div>

        {/* Line 2 — "ב-Claude Code?" rendered as RTL with LTR span */}
        <div style={{
          fontFamily: STYLE.fontHeading, fontSize: 82, fontWeight: 900,
          color: STYLE.accent, textAlign: "center",
          minHeight: 100, direction: "rtl",
          textShadow: `0 0 40px ${STYLE.accent}30`,
        }}>
          {chars2 > 0 && (
            <>
              <span>ב-</span>
              <span dir="ltr" style={{ unicodeBidi: "embed" }}>
                {chars2 > 2 ? "Claude Code".slice(0, Math.max(0, chars2 - 2)) : ""}
              </span>
              {chars2 >= fullLine2.length && <span>?</span>}
            </>
          )}
          {activeLine === 2 && (
            <span style={{ opacity: cursorOpacity, color: STYLE.textDark }}>|</span>
          )}
        </div>

        {/* Line 3 — Hebrew */}
        <div style={{
          fontFamily: STYLE.fontHeading, fontSize: 70, fontWeight: 700,
          color: STYLE.textDark, textAlign: "center",
          minHeight: 85, direction: "rtl",
        }}>
          {line3.slice(0, chars3)}
          {activeLine === 3 && (
            <span style={{ opacity: cursorOpacity, color: STYLE.accent }}>|</span>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
