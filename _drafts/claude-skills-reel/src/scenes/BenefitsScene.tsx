import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { STYLE, bgStyle } from "../styles";
import { Particles } from "../Particles";

// Benefits — Hebrew, practitioner language
export const BenefitsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const benefits = [
    {
      title: "פקודה אחת — 20 שקפים מוכנים",
      example: "/training → מצגת + שאלון + סרטון",
      iconPath: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
      color: STYLE.accent,
    },
    {
      title: "אותם פונטים, אותו מבנה, כל פעם",
      example: "Design tokens שמורים בתוך הסקיל",
      iconPath: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
      color: STYLE.teal,
    },
    {
      title: "בלי להעתיק-להדביק פרומפטים",
      example: "הסקיל זוכר הכל — פעם אחת כותבים, תמיד עובד",
      iconPath: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
      color: "#4A90D9",
    },
  ];

  const titleOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 30, zIndex: 10, padding: "0 50px",
      }}>
        <div style={{
          fontFamily: STYLE.fontHeading, fontSize: 52, fontWeight: 800,
          color: STYLE.textDark, textAlign: "center",
          opacity: titleOpacity, marginBottom: 10, direction: "rtl",
        }}>
          למה זה משנה את הכל
        </div>

        {benefits.map((b, i) => {
          const landFrame = 30 + i * 55;
          const cardY = spring({
            frame: Math.max(0, frame - landFrame), fps,
            from: -800, to: 0,
            config: { damping: 6, mass: 0.4 },
          });
          const cardOpacity = interpolate(frame, [landFrame, landFrame + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const cardRotate = spring({
            frame: Math.max(0, frame - landFrame), fps,
            from: -8 + i * 5, to: 0,
            config: { damping: 10, mass: 0.6 },
          });

          const flashOpacity = interpolate(frame, [landFrame + 8, landFrame + 10, landFrame + 16], [0, 0.15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const floatY = frame > landFrame + 15 ? Math.sin((frame + i * 30) / 12) * 4 : 0;
          const isActive = frame >= landFrame && frame < landFrame + 55;
          const cardScale = isActive
            ? spring({ frame: Math.max(0, frame - landFrame), fps, from: 1.08, to: 1, config: { damping: 8, mass: 0.5 } })
            : 1;

          return (
            <React.Fragment key={b.title}>
              <div style={{
                position: "absolute", inset: 0,
                background: b.color,
                opacity: flashOpacity,
                pointerEvents: "none", zIndex: 20,
              }} />

              <div style={{
                width: 920, padding: "36px 44px",
                borderRadius: 24,
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(20px)",
                boxShadow: `0 12px 40px ${b.color}15, 0 4px 12px rgba(0,0,0,0.06)`,
                border: `1px solid ${b.color}25`,
                display: "flex", alignItems: "center", gap: 28,
                transform: `translateY(${cardY + floatY}px) rotate(${cardRotate}deg) scale(${cardScale})`,
                opacity: cardOpacity,
                zIndex: 15 + i,
                direction: "rtl",
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 20,
                  background: `${b.color}15`,
                  border: `1px solid ${b.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={b.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={b.iconPath} />
                  </svg>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{
                    fontFamily: STYLE.fontHeading, fontSize: 34, fontWeight: 700,
                    color: STYLE.textDark,
                  }}>
                    {b.title}
                  </div>
                  <div style={{
                    fontFamily: STYLE.fontBody, fontSize: 24,
                    color: STYLE.textMuted,
                  }}>
                    {b.example}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
