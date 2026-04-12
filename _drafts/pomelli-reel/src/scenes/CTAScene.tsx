import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { POMELLI, pomelliBg } from "../styles";
import { Particles } from "../Particles";

// CTA — Card with Photo + details
export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const floatY = Math.sin(frame / 14) * 5;

  // Card slides in from bottom
  const cardY = spring({
    frame, fps,
    from: 500, to: 0,
    config: { damping: 9, mass: 0.6 },
  });
  const cardOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  // Pulsing accent glow behind card
  const glowPulse = 1 + Math.sin(frame / 8) * 0.15;
  const glowOpacity = interpolate(frame, [6, 14], [0, 0.12], { extrapolateRight: "clamp" });

  // Photo
  const photoScale = spring({ frame: Math.max(0, frame - 6), fps, from: 0.3, to: 1, config: { damping: 7, mass: 0.4 } });
  const photoOpacity = interpolate(frame, [6, 12], [0, 1], { extrapolateRight: "clamp" });

  // Name + role
  const nameStart = 14;
  const nameOpacity = interpolate(frame, [nameStart, nameStart + 6], [0, 1], { extrapolateRight: "clamp" });
  const nameY = spring({ frame: Math.max(0, frame - nameStart), fps, from: 20, to: 0, config: { damping: 8 } });

  // Link text
  const linkStart = 24;
  const linkOpacity = interpolate(frame, [linkStart, linkStart + 6], [0, 1], { extrapolateRight: "clamp" });

  // Social icons
  const socialStart = 30;
  const socialOpacity = interpolate(frame, [socialStart, socialStart + 6], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={pomelliBg}>
      <Particles />

      {/* Pulsing glow behind card */}
      <div style={{
        position: "absolute", top: "46%", left: "50%",
        transform: `translate(-50%, -50%) scale(${glowPulse})`,
        width: 800, height: 700, borderRadius: "50%",
        background: `radial-gradient(circle, ${POMELLI.accent}30 0%, ${POMELLI.accentLight}10 40%, transparent 70%)`,
        opacity: glowOpacity, pointerEvents: "none", zIndex: 1,
      }} />

      {/* Main glassmorphism card */}
      <div style={{
        position: "absolute", top: "46%", left: "50%",
        transform: `translate(-50%, calc(-50% + ${cardY + floatY}px))`,
        opacity: cardOpacity, zIndex: 2,
        width: 900, height: 380,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        borderRadius: POMELLI.cardRadius,
        boxShadow: POMELLI.shadowHeavy,
        border: "1px solid rgba(255,255,255,0.5)",
        display: "flex", alignItems: "center",
        padding: "32px 48px",
        gap: 36,
      }}>
        {/* Photo — circular */}
        <div style={{
          flexShrink: 0,
          position: "relative",
        }}>
          {/* Glow ring around photo */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: `translate(-50%, -50%) scale(${1.2 + Math.sin(frame / 10) * 0.05})`,
            width: 200, height: 200, borderRadius: "50%",
            border: `3px solid ${POMELLI.accent}`,
            opacity: 0.15,
          }} />
          <div style={{
            width: 180, height: 180, borderRadius: "50%", overflow: "hidden",
            border: `4px solid ${POMELLI.accent}`,
            boxShadow: `0 12px 40px ${POMELLI.accent}30`,
            transform: `scale(${photoScale})`, opacity: photoOpacity,
          }}>
            <Img src={staticFile("meytal.jpeg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>

        {/* Name + role */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 8,
          opacity: nameOpacity,
          transform: `translateY(${nameY}px)`,
        }}>
          <div style={{
            fontFamily: POMELLI.fontHeading, fontSize: 52, fontWeight: 800,
            color: POMELLI.textDark,
          }}>
            מיטל פלג
          </div>
          <div style={{
            fontFamily: POMELLI.fontBody, fontSize: 38, fontWeight: 500,
            color: POMELLI.accent, direction: "ltr",
          }}>
            Learni.ai
          </div>
        </div>
      </div>

      {/* "הלינקים בתגובה הראשונה" */}
      <div style={{
        position: "absolute", top: "46%", left: "50%",
        transform: `translate(-50%, calc(-50% + ${230 + floatY}px))`,
        opacity: linkOpacity, zIndex: 3,
      }}>
        <div style={{
          fontFamily: POMELLI.fontBody, fontSize: 38, fontWeight: 600,
          color: POMELLI.accent,
        }}>
          הלינקים בתגובה הראשונה
        </div>
      </div>

      {/* Social icons row */}
      <div style={{
        position: "absolute", top: "46%", left: "50%",
        transform: `translate(-50%, calc(-50% + ${310 + floatY}px))`,
        opacity: socialOpacity, zIndex: 3,
        display: "flex", gap: 24,
      }}>
        {[
          { label: "פייסבוק", path: "M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.47h-2.796v8.385C19.612 22.954 24 17.99 24 12z" },
          { label: "אינסטגרם", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
          { label: "מייל", path: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" },
        ].map((item, i) => (
          <div key={i} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: POMELLI.accent,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 4px 16px ${POMELLI.accent}30`,
              transform: `translateY(${Math.sin((frame + i * 15) / 14) * 3}px)`,
            }}>
              <svg width={28} height={28} viewBox="0 0 24 24" fill="#fff"><path d={item.path} /></svg>
            </div>
            <span style={{
              fontFamily: POMELLI.fontBody, fontSize: 22, fontWeight: 600,
              color: POMELLI.textMuted,
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
