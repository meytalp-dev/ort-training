import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { STYLE } from "../styles";
import { Particles } from "../Particles";

// Scene 8: Fullscreen Gradient — animated rotating gradient background
// + "עוד טיפים בעמוד שלנו" big text + Learni.ai button with glow pulse
// + "מיטל פלג" + social icons
export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Rotating gradient angle
  const gradientAngle = 135 + frame * 0.8;

  // Photo entrance
  const photoScale = spring({
    frame,
    fps,
    from: 0.3,
    to: 1,
    config: { damping: 7, mass: 0.4 },
  });
  const photoOpacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });

  // Glow ring around photo
  const ringScale = spring({
    frame: Math.max(0, frame - 4),
    fps,
    from: 0.5,
    to: 1.3,
    config: { damping: 12, mass: 0.8 },
  });
  const ringOpacity = interpolate(frame, [4, 8, 20], [0, 0.2, 0.1], { extrapolateRight: "clamp" });

  // Name entrance
  const nameStart = 6;
  const nameOpacity = interpolate(frame, [nameStart, nameStart + 5], [0, 1], {
    extrapolateRight: "clamp",
  });
  const nameY = spring({
    frame: Math.max(0, frame - nameStart),
    fps,
    from: 20,
    to: 0,
    config: { damping: 8, mass: 0.5 },
  });

  // Tagline — big text
  const tagStart = 12;
  const tagOpacity = interpolate(frame, [tagStart, tagStart + 6], [0, 1], {
    extrapolateRight: "clamp",
  });
  const tagScale = spring({
    frame: Math.max(0, frame - tagStart),
    fps,
    from: 0.8,
    to: 1,
    config: { damping: 6, mass: 0.4 },
  });

  // Learni.ai button with glow pulse
  const btnStart = 20;
  const btnScale = spring({
    frame: Math.max(0, frame - btnStart),
    fps,
    from: 0,
    to: 1,
    config: { damping: 5, mass: 0.3, stiffness: 250 },
  });
  const glowPulse = frame >= btnStart + 12
    ? 1 + Math.sin((frame - btnStart - 12) / 4) * 0.04
    : 1;
  const glowIntensity = frame >= btnStart + 12
    ? 0.3 + Math.sin((frame - btnStart - 12) / 5) * 0.1
    : 0.35;

  // Social icons
  const socialStart = 28;
  const socialOpacity = interpolate(frame, [socialStart, socialStart + 6], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Learni logo
  const logoStart = 4;
  const logoScale = spring({
    frame: Math.max(0, frame - logoStart),
    fps,
    from: 0,
    to: 1,
    config: { damping: 6, mass: 0.4 },
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientAngle}deg, #F5F3FF 0%, #EDE5FF 25%, #F0EAFF 50%, #E8F5E9 75%, #F5F3FF 100%)`,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: STYLE.fontBody,
        direction: "rtl",
        overflow: "hidden",
      }}
    >
      <Particles />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          zIndex: 2,
        }}
      >
        {/* Learni logo — overlapping circles */}
        <div
          style={{
            position: "relative",
            width: 80,
            height: 50,
            transform: `scale(${logoScale})`,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: STYLE.skyBlue,
              opacity: 0.8,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 22,
              top: 6,
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: STYLE.greenLight,
              opacity: 0.8,
            }}
          />
        </div>

        {/* Photo with glow ring */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${ringScale})`,
              width: 200,
              height: 200,
              borderRadius: "50%",
              border: `3px solid ${STYLE.accent}`,
              opacity: ringOpacity,
              boxShadow: `0 0 40px ${STYLE.accent}30`,
            }}
          />
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: "50%",
              overflow: "hidden",
              border: `4px solid ${STYLE.accent}`,
              boxShadow: `0 12px 40px rgba(123,97,255,0.3)`,
              transform: `scale(${photoScale})`,
              opacity: photoOpacity,
            }}
          >
            <Img
              src={staticFile("meytal.jpeg")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>

        {/* Name */}
        <div
          style={{
            fontFamily: STYLE.fontHeading,
            fontSize: 44,
            fontWeight: 800,
            color: STYLE.textDark,
            opacity: nameOpacity,
            transform: `translateY(${nameY}px)`,
          }}
        >
          מיטל פלג
        </div>

        {/* Big tagline */}
        <div
          style={{
            fontFamily: STYLE.fontHeading,
            fontSize: 56,
            fontWeight: 800,
            color: STYLE.textDark,
            textAlign: "center",
            lineHeight: 1.4,
            opacity: tagOpacity,
            transform: `scale(${tagScale})`,
            maxWidth: 850,
          }}
        >
          נסו עכשיו — קישור בתגובה
        </div>

        {/* Learni.ai button with glow */}
        <div
          style={{
            background: `linear-gradient(135deg, ${STYLE.accent} 0%, ${STYLE.accentDark} 100%)`,
            borderRadius: 60,
            padding: "20px 60px",
            transform: `scale(${btnScale * glowPulse})`,
            boxShadow: `0 8px 36px rgba(123,97,255,${glowIntensity}), 0 0 60px rgba(123,97,255,${glowIntensity * 0.3})`,
            marginTop: 8,
          }}
        >
          <span
            style={{
              fontFamily: STYLE.fontHeading,
              fontSize: 42,
              fontWeight: 700,
              color: STYLE.textLight,
              direction: "ltr",
            }}
          >
            Learni.ai
          </span>
        </div>

        {/* Social icons row */}
        <div
          style={{
            display: "flex",
            gap: 28,
            opacity: socialOpacity,
            marginTop: 12,
          }}
        >
          {/* Facebook icon */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: STYLE.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 16px ${STYLE.accent}30`,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: STYLE.fontBody,
                fontSize: 20,
                fontWeight: 600,
                color: STYLE.textMuted,
              }}
            >
              פייסבוק
            </span>
          </div>

          {/* Instagram icon */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: STYLE.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 16px ${STYLE.accent}30`,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="white" stroke="none" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: STYLE.fontBody,
                fontSize: 20,
                fontWeight: 600,
                color: STYLE.textMuted,
              }}
            >
              אינסטגרם
            </span>
          </div>

          {/* LinkedIn icon */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: STYLE.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 16px ${STYLE.accent}30`,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: STYLE.fontBody,
                fontSize: 20,
                fontWeight: 600,
                color: STYLE.textMuted,
              }}
            >
              לינקדאין
            </span>
          </div>
        </div>

        {/* Link note */}
        <div
          style={{
            fontFamily: STYLE.fontBody,
            fontSize: 40,
            fontWeight: 600,
            color: STYLE.accent,
            opacity: socialOpacity,
            marginTop: 4,
          }}
        >
          שמרו + שלחו לחבר/ה
        </div>
      </div>
    </AbsoluteFill>
  );
};
