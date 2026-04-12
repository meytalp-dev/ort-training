import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GREG, gregBg } from "../styles";
import { Particles } from "../Particles";
import { MoonIcon } from "../Icons";

// Card with messy pills ON it → pills reorganize INTO neat rows on the same card → card transforms
export const AutoDreamScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // === Card appears (frame 0+) ===
  const cardScale = spring({ frame, fps, from: 0.5, to: 1, config: { damping: 8, mass: 0.5 } });
  const cardOpacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });

  // === PHASE 1: Messy pills ON the card (frame 0-40) ===
  // They sit on the card at scattered positions and angles
  const messyPills = [
    { text: "זיכרון", messyX: -200, messyY: -80, messyR: -18, cleanX: 0, cleanY: -60, cleanR: 0 },
    { text: "פידבק", messyX: 160, messyY: -100, messyR: 12, cleanX: 0, cleanY: -10, cleanR: 0 },
    { text: "הגדרות", messyX: -100, messyY: 60, messyR: -8, cleanX: 0, cleanY: 40, cleanR: 0 },
    { text: "פרויקט", messyX: 180, messyY: 80, messyR: 20, cleanX: 0, cleanY: 90, cleanR: 0 },
    { text: "משתמש", messyX: -50, messyY: -30, messyR: 15, cleanX: 0, cleanY: 140, cleanR: 0 },
  ];

  // Organize transition (frame 40-60)
  const organizeProgress = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // === PHASE 2: Card transforms to result card (frame 65+) ===
  const transformStart = 65;
  const card2Progress = interpolate(frame, [transformStart, transformStart + 10], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // Messy pills fade out as result card comes
  const pillsFade = interpolate(frame, [transformStart - 5, transformStart + 5], [1, 0], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // Icon
  const iconStart = 75;
  const iconScale = spring({
    frame: Math.max(0, frame - iconStart), fps, from: 0, to: 1,
    config: { damping: 4, mass: 0.2, stiffness: 300 },
  });

  // Title
  const titleStart = 82;
  const titleOpacity = interpolate(frame, [titleStart, titleStart + 6], [0, 1], { extrapolateRight: "clamp" });

  // Description
  const descStart = 94;
  const descOpacity = interpolate(frame, [descStart, descStart + 6], [0, 1], { extrapolateRight: "clamp" });
  const descY = spring({ frame: Math.max(0, frame - descStart), fps, from: 30, to: 0, config: { damping: 9 } });

  // Z's — appear during organize phase
  const zs = [
    { x: 740, y: 350, size: 70, delay: 45, speed: 0.4 },
    { x: 790, y: 260, size: 55, delay: 52, speed: 0.6 },
    { x: 700, y: 180, size: 42, delay: 59, speed: 0.8 },
  ];

  // Sparkle flash when organize completes
  const organizeFlash = interpolate(frame, [58, 60, 64], [0, 0.15, 0], { extrapolateRight: "clamp" });

  const floatY = Math.sin(frame / 14) * 5;

  return (
    <AbsoluteFill style={gregBg}>
      <Particles />

      {/* Organize flash */}
      <div style={{
        position: "absolute", inset: 0, background: GREG.accent,
        opacity: organizeFlash, zIndex: 5,
      }} />

      {/* Z's */}
      {zs.map((z, i) => {
        const zOpacity = interpolate(frame, [z.delay, z.delay + 8, z.delay + 40], [0, 0.3, 0], { extrapolateRight: "clamp" });
        const zY = frame > z.delay ? -(frame - z.delay) * z.speed : 0;
        const zX = Math.sin((frame - z.delay) / 5) * 25;
        return (
          <div key={i} style={{
            position: "absolute", left: z.x + zX, top: z.y + zY,
            fontFamily: GREG.fontHeading, fontSize: z.size, fontWeight: 900,
            color: GREG.accent, opacity: zOpacity, zIndex: 1,
            textShadow: `0 0 24px ${GREG.accent}50`,
          }}>Z</div>
        );
      })}

      {/* Main card */}
      <div style={{
        position: "absolute", top: "48%", left: "50%",
        transform: `translate(-50%, -50%) translateY(${floatY}px) scale(${cardScale})`,
        opacity: cardOpacity, zIndex: 2,
        width: 900, minHeight: 500,
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(20px)",
        borderRadius: GREG.cardRadius,
        padding: "48px",
        boxShadow: `0 20px 60px ${GREG.accent}20, 0 0 1px rgba(255,255,255,0.6) inset`,
        border: "1px solid rgba(255,255,255,0.5)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        overflow: "visible",
      }}>
        {/* Messy pills that reorganize ON the card */}
        {pillsFade > 0 && messyPills.map((pill, i) => {
          const x = pill.messyX + (pill.cleanX - pill.messyX) * organizeProgress;
          const y = pill.messyY + (pill.cleanY - pill.messyY) * organizeProgress;
          const r = pill.messyR + (pill.cleanR - pill.messyR) * organizeProgress;
          const pillAppear = interpolate(frame, [4 + i * 3, 8 + i * 3], [0, 1], { extrapolateRight: "clamp" });
          const bgOpacity = organizeProgress > 0.5 ? 0.12 : 0.06;

          return (
            <div key={i} style={{
              position: "absolute",
              transform: `translate(${x}px, ${y}px) rotate(${r}deg)`,
              fontFamily: GREG.fontBody, fontSize: 32, fontWeight: 600,
              color: organizeProgress > 0.8 ? GREG.accent : GREG.textMuted,
              background: `rgba(217,119,87,${bgOpacity})`,
              borderRadius: 14, padding: "10px 24px",
              opacity: pillAppear * pillsFade,
              transition: "color 0.3s",
              boxShadow: organizeProgress > 0.5 ? `0 4px 16px ${GREG.accent}15` : "none",
            }}>
              {pill.text}
            </div>
          );
        })}

        {/* Result content — appears after pills fade */}
        {card2Progress > 0 && (
          <>
            {/* Badge */}
            <div style={{
              background: `linear-gradient(135deg, ${GREG.accent}, ${GREG.accentDark})`,
              borderRadius: 50, padding: "8px 28px",
              position: "absolute", top: -20,
              boxShadow: `0 4px 16px ${GREG.accent}50`,
              opacity: card2Progress,
            }}>
              <span style={{ fontFamily: GREG.fontHeading, fontSize: 24, fontWeight: 700, color: GREG.textLight }}>02</span>
            </div>

            {/* Icon */}
            <div style={{
              transform: `scale(${iconScale})`,
              width: 120, height: 120, borderRadius: "50%",
              background: `rgba(217,119,87,0.12)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 40px ${GREG.accent}20`,
            }}>
              <MoonIcon size={65} color={GREG.accent} />
            </div>

            <div style={{ direction: "ltr" }}>
              <div style={{
                fontFamily: GREG.fontHeading, fontSize: 68, fontWeight: 900,
                color: GREG.textDark, opacity: titleOpacity,
                textShadow: `0 2px 20px ${GREG.accent}20`,
              }}>
                Auto Dream
              </div>
            </div>

            <div style={{
              fontFamily: GREG.fontBody, fontSize: 44, fontWeight: 500,
              color: GREG.textMuted, opacity: descOpacity,
              transform: `translateY(${descY}px)`, textAlign: "center",
              lineHeight: 1.6,
            }}>
              סוגרים מחשב — הוא ממשיך.
              <br />
              <span style={{ color: GREG.accent, fontWeight: 700 }}>
                בבוקר הכל מסודר.
              </span>
            </div>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};
