import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GREG, gregBg } from "../styles";
import { Particles } from "../Particles";
import { MonitorIcon } from "../Icons";

// Empty card → cursor exits → grabs content → drags it into card
export const ComputerUseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // === Empty card appears (frame 0-8) ===
  const cardScale = spring({ frame, fps, from: 0.5, to: 1, config: { damping: 8, mass: 0.5 } });
  const cardOpacity = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });

  // === Cursor exits card, travels, grabs, returns ===
  // Path: card center → outside right → click → drag back to card
  const cursorPhase = interpolate(frame, [8, 18, 22, 30, 40], [0, 1, 1.5, 2, 3], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  const cursorX = interpolate(cursorPhase, [0, 1, 1.5, 2, 3], [540, 900, 900, 900, 540], {
    extrapolateRight: "clamp",
  });
  const cursorY = interpolate(cursorPhase, [0, 1, 1.5, 2, 3], [960, 700, 700, 700, 960], {
    extrapolateRight: "clamp",
  });
  const cursorOpacity = interpolate(frame, [8, 11], [0, 1], { extrapolateRight: "clamp" });

  // Click pulse at grab point
  const clickFrame = 22;
  const clickPulse = frame >= clickFrame && frame <= clickFrame + 5
    ? spring({ frame: frame - clickFrame, fps, from: 2.5, to: 1, config: { damping: 4, mass: 0.3 } })
    : 1;

  // Ripples at click
  const ripples = [0, 3, 6].map(delay => {
    const rStart = clickFrame + delay;
    const rScale = frame >= rStart ? spring({ frame: frame - rStart, fps, from: 0.5, to: 3.5, config: { damping: 18, mass: 1.2 } }) : 0;
    const rOpacity = frame >= rStart ? interpolate(frame, [rStart, rStart + 10], [0.35, 0], { extrapolateRight: "clamp" }) : 0;
    return { rScale, rOpacity };
  });

  // === Content block — grabbed by cursor, dragged to card ===
  const contentVisible = frame >= clickFrame;
  const contentX = interpolate(frame, [clickFrame, 30, 40], [900, 900, 540], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });
  const contentY = interpolate(frame, [clickFrame, 30, 40], [700, 700, 960], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });
  const contentOpacity = interpolate(frame, [clickFrame, clickFrame + 3], [0, 1], { extrapolateRight: "clamp" });
  const contentScale = interpolate(frame, [clickFrame, 40, 44], [0.6, 0.8, 1], {
    extrapolateRight: "clamp",
  });

  // === Card fills with content (frame 40+) ===
  const filledStart = 42;

  // Badge
  const badgeScale = spring({
    frame: Math.max(0, frame - filledStart),
    fps, from: 0, to: 1,
    config: { damping: 4, mass: 0.2, stiffness: 300 },
  });

  // Icon
  const iconScale = spring({
    frame: Math.max(0, frame - filledStart - 2),
    fps, from: 0, to: 1,
    config: { damping: 4, mass: 0.2, stiffness: 300 },
  });

  // Title
  const titleStart = filledStart + 6;
  const titleOpacity = interpolate(frame, [titleStart, titleStart + 5], [0, 1], { extrapolateRight: "clamp" });

  // Description
  const descStart = filledStart + 14;
  const descOpacity = interpolate(frame, [descStart, descStart + 5], [0, 1], { extrapolateRight: "clamp" });

  // Flash when content docks
  const dockFlash = interpolate(frame, [40, 42, 46], [0, 0.15, 0], { extrapolateRight: "clamp" });

  const floatY = Math.sin(frame / 14) * 5;

  return (
    <AbsoluteFill style={gregBg}>
      <Particles />

      {/* Flash */}
      <div style={{ position: "absolute", inset: 0, background: GREG.accent, opacity: dockFlash, zIndex: 5 }} />

      {/* Cursor with glow trail */}
      <div style={{
        position: "absolute", left: cursorX - 10, top: cursorY - 10,
        width: 24, height: 24, borderRadius: "50%",
        background: GREG.accent, opacity: cursorOpacity,
        transform: `scale(${clickPulse})`,
        boxShadow: `0 0 30px ${GREG.accent}60, 0 0 60px ${GREG.accent}20`,
        zIndex: 10,
      }} />

      {/* Click ripples */}
      {ripples.map((r, i) => (
        <div key={i} style={{
          position: "absolute", left: 900 - 35, top: 700 - 35,
          width: 70, height: 70, borderRadius: "50%",
          border: `2px solid ${GREG.accent}`,
          transform: `scale(${r.rScale})`, opacity: r.rOpacity,
          boxShadow: `0 0 20px ${GREG.accent}30`,
          zIndex: 9,
        }} />
      ))}

      {/* Dragged content block */}
      {contentVisible && (
        <div style={{
          position: "absolute", left: contentX - 120, top: contentY - 50,
          transform: `scale(${contentScale})`,
          opacity: contentOpacity * interpolate(frame, [40, 44], [1, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" }),
          background: "rgba(255,255,255,0.9)",
          borderRadius: 16, padding: "16px 32px",
          boxShadow: `0 8px 30px ${GREG.accent}30`,
          border: `2px solid ${GREG.accent}40`,
          zIndex: 8,
        }}>
          <div style={{
            fontFamily: GREG.fontBody, fontSize: 24, color: GREG.textMuted,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <MonitorIcon size={32} color={GREG.accent} />
            <span>תוכן חדש</span>
          </div>
        </div>
      )}

      {/* Main card */}
      <div style={{
        position: "absolute", top: "48%", left: "50%",
        perspective: 1200, zIndex: 2,
        transform: `translate(-50%, -50%) translateY(${floatY}px)`,
      }}>
        <div style={{
          transform: `scale(${cardScale})`,
          opacity: cardOpacity,
          width: 900, minHeight: frame >= filledStart ? 500 : 350,
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: GREG.cardRadius,
          padding: "48px",
          boxShadow: `0 20px 60px ${GREG.accent}20, 0 0 1px rgba(255,255,255,0.6) inset`,
          border: "1px solid rgba(255,255,255,0.5)",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: frame >= filledStart ? "flex-start" : "center",
          gap: 20,
        }}>
          {/* Before fill: just empty */}
          {frame < filledStart && (
            <div style={{ minHeight: 200 }} />
          )}

          {/* After fill: full content */}
          {frame >= filledStart && (
            <>
              {/* Badge */}
              <div style={{
                background: `linear-gradient(135deg, ${GREG.accent}, ${GREG.accentDark})`,
                borderRadius: 50, padding: "8px 28px",
                transform: `scale(${badgeScale})`, position: "absolute", top: -20,
                boxShadow: `0 4px 16px ${GREG.accent}50`,
              }}>
                <span style={{ fontFamily: GREG.fontHeading, fontSize: 24, fontWeight: 700, color: GREG.textLight }}>03</span>
              </div>

              {/* Icon */}
              <div style={{
                transform: `scale(${iconScale})`,
                width: 120, height: 120, borderRadius: "50%",
                background: `rgba(217,119,87,0.12)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 40px ${GREG.accent}20`,
                marginTop: 20,
              }}>
                <MonitorIcon size={65} color={GREG.accent} />
              </div>

              <div style={{ direction: "ltr" }}>
                <div style={{
                  fontFamily: GREG.fontHeading, fontSize: 64, fontWeight: 900,
                  color: GREG.textDark, opacity: titleOpacity,
                  textShadow: `0 2px 20px ${GREG.accent}20`,
                }}>
                  Computer Use
                </div>
              </div>

              <div style={{
                fontFamily: GREG.fontBody, fontSize: 44, fontWeight: 500,
                color: GREG.textMuted, opacity: descOpacity,
                textAlign: "center", lineHeight: 1.6,
              }}>
                גולש, לוחץ, ממלא טפסים.
                <br />
                <span style={{ color: GREG.accent, fontWeight: 700 }}>
                  כאילו יושב לידכם.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
