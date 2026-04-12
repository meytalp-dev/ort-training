import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Img,
  staticFile,
} from "remotion";
import { STYLE, bgStyle } from "../styles";
import { Particles } from "../Particles";

// CTA: Photo+Social — meytal.jpeg with glow ring + name + Learni + social icons + CTA text
export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Photo scales in with glow
  const photoStart = 5;
  const photoScale = spring({
    frame: Math.max(0, frame - photoStart),
    fps,
    from: 0,
    to: 1,
    config: { damping: 8, mass: 0.5, stiffness: 140 },
  });

  // Glow ring pulses
  const glowPulse = 0.6 + Math.sin(frame / 5) * 0.15;

  // Name text
  const nameStart = 12;
  const nameY = spring({
    frame: Math.max(0, frame - nameStart),
    fps,
    from: 30,
    to: 0,
    config: { damping: 10, mass: 0.4 },
  });
  const nameOpacity = interpolate(
    frame,
    [nameStart, nameStart + 8],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Learni logo
  const logoStart = 18;
  const logoScale = spring({
    frame: Math.max(0, frame - logoStart),
    fps,
    from: 0,
    to: 1,
    config: { damping: 6, mass: 0.3, stiffness: 200 },
  });

  // Social icons stagger in
  const socialStart = 25;
  const socials = [
    { label: "Instagram", delay: 0 },
    { label: "Facebook", delay: 5 },
    { label: "LinkedIn", delay: 10 },
  ];

  // CTA text
  const ctaStart = 40;
  const ctaScale = spring({
    frame: Math.max(0, frame - ctaStart),
    fps,
    from: 0,
    to: 1,
    config: { damping: 6, mass: 0.3, stiffness: 180 },
  });
  const ctaOpacity = interpolate(
    frame,
    [ctaStart, ctaStart + 8],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // CTA bounce
  const ctaBounce =
    frame >= ctaStart + 15
      ? Math.sin((frame - ctaStart - 15) / 5) * 5
      : 0;

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      {/* Photo with glow ring */}
      <div
        style={{
          position: "absolute",
          top: 420,
          left: "50%",
          transform: `translate(-50%, 0) scale(${photoScale})`,
          zIndex: 20,
        }}
      >
        {/* Outer glow ring */}
        <div
          style={{
            position: "absolute",
            top: -16,
            left: -16,
            width: 272,
            height: 272,
            borderRadius: "50%",
            background: `conic-gradient(${STYLE.mint}, ${STYLE.lavender}, ${STYLE.skyBlue}, ${STYLE.pink}, ${STYLE.mint})`,
            opacity: glowPulse,
            filter: "blur(4px)",
          }}
        />
        {/* Photo container */}
        <div
          style={{
            position: "relative",
            width: 240,
            height: 240,
            borderRadius: "50%",
            overflow: "hidden",
            border: "6px solid white",
            boxShadow: `0 12px 40px ${STYLE.lavender}30`,
          }}
        >
          <Img
            src={staticFile("meytal.jpeg")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </div>

      {/* Name */}
      <div
        style={{
          position: "absolute",
          top: 720,
          left: "50%",
          transform: `translate(-50%, ${nameY}px)`,
          opacity: nameOpacity,
          zIndex: 20,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: STYLE.fontHeading,
            fontSize: 60,
            fontWeight: 700,
            color: STYLE.textDark,
          }}
        >
          מיטל פלג
        </div>
      </div>

      {/* Learni logo text */}
      <div
        style={{
          position: "absolute",
          top: 800,
          left: "50%",
          transform: `translate(-50%, 0) scale(${logoScale})`,
          zIndex: 20,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: STYLE.fontHandwriting,
            fontSize: 48,
            color: STYLE.lavender,
            letterSpacing: 2,
            direction: "ltr",
          }}
        >
          Learni
        </div>
      </div>

      {/* Social icons row */}
      <div
        style={{
          position: "absolute",
          top: 900,
          left: "50%",
          transform: "translate(-50%, 0)",
          display: "flex",
          gap: 28,
          zIndex: 20,
        }}
      >
        {socials.map((social, i) => {
          const start = socialStart + social.delay;
          const scale = spring({
            frame: Math.max(0, frame - start),
            fps,
            from: 0,
            to: 1,
            config: { damping: 6, mass: 0.3, stiffness: 220 },
          });
          return (
            <div
              key={i}
              style={{
                transform: `scale(${scale})`,
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: `2px solid ${STYLE.lavender}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 16px ${STYLE.lavender}15`,
              }}
            >
              {/* Simple SVG social icons */}
              {i === 0 && (
                // Instagram
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={STYLE.pink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill={STYLE.pink} stroke="none" />
                </svg>
              )}
              {i === 1 && (
                // Facebook
                <svg width="32" height="32" viewBox="0 0 24 24" fill={STYLE.skyBlue} stroke="none">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              )}
              {i === 2 && (
                // LinkedIn
                <svg width="32" height="32" viewBox="0 0 24 24" fill={STYLE.skyBlue} stroke="none">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* "רוצים לראות איך?" CTA text */}
      <div
        style={{
          position: "absolute",
          top: 1020,
          left: "50%",
          transform: `translate(-50%, ${ctaBounce}px) scale(${ctaScale})`,
          opacity: ctaOpacity,
          zIndex: 20,
          textAlign: "center",
          width: "88%",
        }}
      >
        <div
          style={{
            fontFamily: STYLE.fontHandwriting,
            fontSize: 52,
            color: STYLE.textDark,
            marginBottom: 20,
          }}
        >
          כתבו "שאלון" בתגובה
        </div>
        {/* learni.ai button */}
        <div
          style={{
            display: "inline-block",
            background: `linear-gradient(135deg, ${STYLE.skyBlue}, ${STYLE.mint})`,
            borderRadius: 60,
            padding: "18px 56px",
            boxShadow: `0 8px 28px ${STYLE.skyBlue}35`,
          }}
        >
          <span
            style={{
              fontFamily: STYLE.fontHeading,
              fontSize: 40,
              fontWeight: 700,
              color: STYLE.textLight,
              direction: "ltr",
            }}
          >
            learni.ai
          </span>
        </div>
        <div
          style={{
            fontFamily: STYLE.fontBody,
            fontSize: 44,
            color: STYLE.textMuted,
            marginTop: 16,
          }}
        >
          ונשלח דוגמה
        </div>
      </div>

      {/* Decorative corner sparkles */}
      {[
        { x: 80, y: 350, size: 12 },
        { x: 980, y: 400, size: 16 },
        { x: 120, y: 1100, size: 14 },
        { x: 950, y: 1050, size: 10 },
      ].map((s, i) => {
        const sparkOpacity = 0.2 + Math.sin((frame + i * 15) / 4) * 0.15;
        const sparkRotate = frame * 3 + i * 90;
        return (
          <div
            key={`cta-spark-${i}`}
            style={{
              position: "absolute",
              top: s.y,
              left: s.x,
              width: s.size,
              height: s.size,
              background: i % 2 === 0 ? STYLE.mint : STYLE.pink,
              transform: `rotate(${sparkRotate}deg)`,
              opacity: sparkOpacity,
              pointerEvents: "none",
              zIndex: 5,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
