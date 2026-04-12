import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GREG, gregBg } from "../styles";
import { Particles } from "../Particles";
import { ShieldIcon, MoonIcon, MonitorIcon } from "../Icons";

export const SummaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "3" slams in
  const numScale = spring({ frame, fps, from: 5, to: 1, config: { damping: 5, mass: 0.3, stiffness: 200 } });
  const numOpacity = interpolate(frame, [0, 3], [0, 1], { extrapolateRight: "clamp" });

  // Flash on slam
  const flashOpacity = interpolate(frame, [1, 3, 7], [0, 0.15, 0], { extrapolateRight: "clamp" });

  // Three icons — each flies in BIG from different direction, spins, then shrinks to position
  const icons = [
    { Icon: ShieldIcon, enterFrame: 12, fromX: -600, fromY: -400, fromRotate: -180, targetX: -160 },
    { Icon: MoonIcon, enterFrame: 22, fromX: 0, fromY: 500, fromRotate: 180, targetX: 0 },
    { Icon: MonitorIcon, enterFrame: 32, fromX: 600, fromY: -300, fromRotate: 270, targetX: 160 },
  ];

  // "מצבים. 0 התערבות."
  const bottomStart = 50;
  const bottomScale = spring({ frame: Math.max(0, frame - bottomStart), fps, from: 2, to: 1, config: { damping: 6, mass: 0.4 } });
  const bottomOpacity = interpolate(frame, [bottomStart, bottomStart + 5], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={gregBg}>
      <Particles />

      {/* Flash */}
      <div style={{ position: "absolute", inset: 0, background: GREG.accent, opacity: flashOpacity, zIndex: 1 }} />

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 44, zIndex: 2,
      }}>
        {/* Big "3" */}
        <div style={{
          fontFamily: GREG.fontHeading, fontSize: 200, fontWeight: 900,
          color: GREG.accent, transform: `scale(${numScale})`,
          opacity: numOpacity, lineHeight: 1,
          textShadow: `0 8px 40px ${GREG.accent}30`,
        }}>
          3
        </div>

        {/* Icons row */}
        <div style={{ display: "flex", gap: 36, position: "relative", height: 130, width: 500 }}>
          {icons.map(({ Icon, enterFrame, fromX, fromY, fromRotate, targetX }, i) => {
            const f = Math.max(0, frame - enterFrame);

            // Phase 1: fly in BIG (f 0-10)
            const flyX = spring({ frame: f, fps, from: fromX, to: 0, config: { damping: 7, mass: 0.5 } });
            const flyY = spring({ frame: f, fps, from: fromY, to: 0, config: { damping: 7, mass: 0.5 } });
            const flyRotate = spring({ frame: f, fps, from: fromRotate, to: 0, config: { damping: 8, mass: 0.6 } });

            // Starts big, shrinks to final
            const scaleValue = f <= 0 ? 0
              : f < 10 ? spring({ frame: f, fps, from: 0, to: 2.2, config: { damping: 7, mass: 0.5 } })
              : spring({ frame: Math.max(0, f - 10), fps, from: 2.2, to: 1, config: { damping: 8, mass: 0.5 } });

            // Move to final column position after shrink
            const settleX = f > 10
              ? spring({ frame: Math.max(0, f - 10), fps, from: 0, to: targetX, config: { damping: 9, mass: 0.6 } })
              : 0;

            const opacity = interpolate(f, [0, 3], [0, 1], { extrapolateRight: "clamp" });

            // Glow ring when big
            const glowOpacity = f > 2 && f < 14 ? 0.15 : 0;

            return (
              <div key={i} style={{
                position: "absolute", top: "50%", left: "50%",
                transform: `translate(-50%, -50%) translate(${flyX + settleX}px, ${flyY}px) rotate(${flyRotate}deg) scale(${scaleValue})`,
                opacity, zIndex: 10 - i,
              }}>
                {/* Glow ring */}
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 180, height: 180, borderRadius: "50%",
                  border: `2px solid ${GREG.accent}`,
                  boxShadow: `0 0 30px ${GREG.accent}30`,
                  opacity: glowOpacity,
                }} />

                <div style={{
                  width: 120, height: 120, borderRadius: "50%",
                  background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)",
                  boxShadow: `${GREG.shadow}, 0 0 30px ${GREG.accent}10`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={56} color={GREG.accent} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom text */}
        <div style={{
          fontFamily: GREG.fontHeading, fontSize: 56, fontWeight: 800,
          color: GREG.textDark, transform: `scale(${bottomScale})`,
          opacity: bottomOpacity, textAlign: "center", lineHeight: 1.4,
        }}>
          מצבים. <span style={{ color: GREG.accent }}>0 התערבות.</span>
        </div>

        {/* Clarification line */}
        <div style={{
          fontFamily: GREG.fontBody, fontSize: 36, fontWeight: 500,
          color: GREG.textMuted,
          opacity: interpolate(frame, [bottomStart + 8, bottomStart + 14], [0, 1], { extrapolateRight: "clamp" }),
          textAlign: "center",
        }}>
          מובנה ב-Claude Code. פשוט מתחילים.
        </div>
      </div>
    </AbsoluteFill>
  );
};
