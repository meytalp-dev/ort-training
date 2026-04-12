import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GREG, gregBg } from "../styles";
import { Particles } from "../Particles";
import { ShieldIcon, MoonIcon, MonitorIcon } from "../Icons";

// Source card → each pill enters BIG (read it) → shrinks to row → next pill
export const BenefitsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // === Title card (frame 0-25) ===
  const sourceScale = spring({ frame, fps, from: 0.5, to: 1, config: { damping: 8, mass: 0.5 } });
  const sourceOpacity = interpolate(frame, [0, 6, 22, 30], [0, 1, 1, 0], { extrapolateRight: "clamp" });

  // === 3 pills — staggered, each goes BIG → stays → shrinks ===
  const pills = [
    {
      Icon: ShieldIcon, label: "Auto Mode",
      text: '"בנה לי דף נחיתה" — ומקבלים אתר.',
      highlight: 'בלי לאשר כל צעד.',
      enterFrame: 28,
      bigFrame: 34,
      shrinkFrame: 60,
      settledY: -300,
    },
    {
      Icon: MoonIcon, label: "Auto Dream",
      text: "סוגרים מחשב — הוא ממשיך לעבוד.",
      highlight: "בבוקר הכל מוכן ומסודר.",
      enterFrame: 66,
      bigFrame: 72,
      shrinkFrame: 98,
      settledY: -30,
    },
    {
      Icon: MonitorIcon, label: "Computer Use",
      text: "בונה אתר, ממלא טפסים, מנהל קמפיין.",
      highlight: "בלי שורת קוד אחת.",
      enterFrame: 104,
      bigFrame: 110,
      shrinkFrame: 136,
      settledY: 240,
    },
  ];

  // === Tagline (frame 160+) ===
  const tagStart = 160;
  const tagScale = spring({ frame: Math.max(0, frame - tagStart), fps, from: 2.5, to: 1, config: { damping: 5, mass: 0.3, stiffness: 200 } });
  const tagOpacity = interpolate(frame, [tagStart, tagStart + 6], [0, 1], { extrapolateRight: "clamp" });

  const floatY = Math.sin(frame / 14) * 4;

  return (
    <AbsoluteFill style={gregBg}>
      <Particles />

      {/* === Source card === */}
      <div style={{
        position: "absolute", top: "48%", left: "50%",
        transform: `translate(-50%, -50%) scale(${sourceScale})`,
        opacity: sourceOpacity, zIndex: 2,
        width: 500, height: 300,
        background: `linear-gradient(135deg, ${GREG.accent}, ${GREG.accentDark})`,
        borderRadius: GREG.cardRadius,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16,
        boxShadow: `0 20px 60px ${GREG.accent}30`,
      }}>
        <div style={{
          fontFamily: GREG.fontHeading, fontSize: 48, fontWeight: 900,
          color: GREG.textLight,
        }}>
          מה זה נותן לכם?
        </div>
        <div style={{
          width: 200, height: 4, borderRadius: 2,
          background: "rgba(255,255,255,0.3)",
        }} />
      </div>

      {/* === 3 pills — each enters big, shrinks to its position === */}
      {pills.map((pill, i) => {
        const f = Math.max(0, frame - pill.enterFrame);

        // Enter: scale up big in center
        const enterScale = spring({
          frame: f, fps, from: 0, to: 1.3,
          config: { damping: 7, mass: 0.5 },
        });
        const enterOpacity = interpolate(f, [0, 5], [0, 1], { extrapolateRight: "clamp" });

        // Shrink: scale down + move to final Y
        const shrinkF = Math.max(0, frame - pill.shrinkFrame);
        const shrinkScale = shrinkF > 0
          ? spring({ frame: shrinkF, fps, from: 1.3, to: 0.92, config: { damping: 10, mass: 0.6 } })
          : enterScale;

        const moveY = shrinkF > 0
          ? spring({ frame: shrinkF, fps, from: 0, to: pill.settledY, config: { damping: 9, mass: 0.6 } })
          : 0;

        // Width shrinks too
        const cardWidth = shrinkF > 0
          ? interpolate(shrinkF, [0, 12], [900, 920], { extrapolateRight: "clamp" })
          : 900;

        // Content items
        const iconAppear = spring({ frame: Math.max(0, f - 4), fps, from: 0, to: 1, config: { damping: 4, mass: 0.2, stiffness: 300 } });
        const labelOpacity = interpolate(f, [6, 10], [0, 1], { extrapolateRight: "clamp" });
        const textOpacity = interpolate(f, [12, 16], [0, 1], { extrapolateRight: "clamp" });
        const hlOpacity = interpolate(f, [18, 22], [0, 1], { extrapolateRight: "clamp" });
        const hlScale = spring({ frame: Math.max(0, f - 18), fps, from: 1.5, to: 1, config: { damping: 6, mass: 0.3 } });

        const pillFloat = Math.sin((frame + i * 40) / 14) * 3;

        return (
          <div key={i} style={{
            position: "absolute", top: "48%", left: "50%",
            transform: `translate(-50%, calc(-50% + ${moveY + pillFloat}px)) scale(${shrinkScale})`,
            opacity: enterOpacity, zIndex: 4 + i,
            width: cardWidth,
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(16px)",
            borderRadius: 24,
            boxShadow: `0 12px 40px ${GREG.accent}15, 0 0 1px rgba(255,255,255,0.5) inset`,
            border: "1px solid rgba(255,255,255,0.4)",
            display: "flex", alignItems: "center",
            padding: "28px 40px",
            gap: 20,
          }}>
            {/* Icon */}
            <div style={{
              transform: `scale(${iconAppear})`,
              flexShrink: 0,
              width: 90, height: 90, borderRadius: "50%",
              background: `rgba(217,119,87,0.12)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 24px ${GREG.accent}15`,
            }}>
              <pill.Icon size={48} color={GREG.accent} />
            </div>

            {/* Text */}
            <div style={{
              display: "flex", flexDirection: "column", gap: 4,
              flex: 1,
            }}>
              <div style={{
                fontFamily: GREG.fontHeading, fontSize: 38, fontWeight: 800,
                color: GREG.accent, opacity: labelOpacity,
              }}>
                {pill.label}
              </div>
              <div style={{
                fontFamily: GREG.fontBody, fontSize: 34, fontWeight: 500,
                color: GREG.textMuted, opacity: textOpacity,
              }}>
                {pill.text}
              </div>
              <div style={{
                fontFamily: GREG.fontHeading, fontSize: 36, fontWeight: 700,
                color: GREG.accent, opacity: hlOpacity,
                transform: `scale(${hlScale})`, transformOrigin: "right center",
              }}>
                {pill.highlight}
              </div>
            </div>
          </div>
        );
      })}

      {/* === Tagline === */}
      <div style={{
        position: "absolute", bottom: 140, left: "50%",
        transform: `translateX(-50%) scale(${tagScale})`,
        opacity: tagOpacity, zIndex: 10,
      }}>
        <div style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          borderRadius: 60, padding: "16px 48px",
          boxShadow: `0 8px 30px ${GREG.accent}20`,
          border: "1px solid rgba(255,255,255,0.4)",
        }}>
          <span style={{
            fontFamily: GREG.fontHeading, fontSize: 40, fontWeight: 900,
            color: GREG.textDark,
          }}>
            עובדים פחות.{" "}
            <span style={{ color: GREG.accent }}>הוא עובד יותר.</span>
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
