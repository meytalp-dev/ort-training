import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { STITCH, stitchBg } from "../styles";
import { Particles } from "../Particles";

// Fullscreen Gradient CTA
export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Big text "try it yourself"
  const textScale = spring({
    frame, fps, from: 0.3, to: 1,
    config: { damping: 7, mass: 0.5 },
  });
  const textOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  // URL
  const urlStart = 12;
  const urlOpacity = interpolate(frame, [urlStart, urlStart + 6], [0, 1], { extrapolateRight: "clamp" });

  // Button
  const btnStart = 20;
  const btnScale = spring({
    frame: Math.max(0, frame - btnStart), fps,
    from: 0, to: 1, config: { damping: 5, mass: 0.3, stiffness: 250 },
  });
  const pulse = frame >= btnStart + 12 ? 1 + Math.sin((frame - btnStart - 12) / 5) * 0.03 : 1;

  // Photo + name
  const photoStart = 30;
  const photoScale = spring({
    frame: Math.max(0, frame - photoStart), fps,
    from: 0.3, to: 1, config: { damping: 7, mass: 0.4 },
  });
  const photoOpacity = interpolate(frame, [photoStart, photoStart + 6], [0, 1], { extrapolateRight: "clamp" });

  // Social icons
  const socialOpacity = interpolate(frame, [photoStart + 6, photoStart + 12], [0, 1], { extrapolateRight: "clamp" });

  const floatY = Math.sin(frame / 14) * 5;

  return (
    <AbsoluteFill style={{
      ...stitchBg,
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: STITCH.fontBody,
      overflow: "hidden",
    }}>
      <Particles />

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 28, zIndex: 2,
        transform: `translateY(${floatY}px)`,
      }}>
        {/* Big CTA text */}
        <div style={{
          fontFamily: STITCH.fontHeading, fontSize: 72, fontWeight: 900,
          color: STITCH.accent,
          textShadow: `0 4px 30px ${STITCH.accent}30`,
          transform: `scale(${textScale})`,
          opacity: textOpacity, textAlign: "center",
        }}>
          נסו בעצמכם
        </div>

        {/* URL */}
        <div style={{
          fontFamily: STITCH.fontBody, fontSize: 36, fontWeight: 500,
          color: STITCH.textMuted,
          opacity: urlOpacity, direction: "ltr",
        }}>
          stitch.withgoogle.com
        </div>

        {/* Button */}
        <div style={{
          background: `linear-gradient(135deg, ${STITCH.accent}, ${STITCH.accentDark})`,
          borderRadius: 60, padding: "18px 52px",
          transform: `scale(${btnScale * pulse})`,
          boxShadow: `0 8px 28px ${STITCH.accent}30`,
        }}>
          <span style={{
            fontFamily: STITCH.fontHeading, fontSize: 36, fontWeight: 700,
            color: STITCH.textLight,
          }}>
            הדרכה מלאה ב-Learni.ai
          </span>
        </div>

        {/* Photo */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 12, marginTop: 12,
        }}>
          <div style={{
            width: 140, height: 140, borderRadius: "50%", overflow: "hidden",
            border: "4px solid rgba(255,255,255,0.6)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
            transform: `scale(${photoScale})`, opacity: photoOpacity,
          }}>
            <Img src={staticFile("meytal.jpeg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>

          <div style={{
            fontFamily: STITCH.fontHeading, fontSize: 36, fontWeight: 800,
            color: STITCH.textDark, opacity: photoOpacity,
          }}>
            מיטל פלג
          </div>
        </div>

        {/* Social icons row */}
        <div style={{
          display: "flex", gap: 24, opacity: socialOpacity,
        }}>
          {[
            { label: "פייסבוק", path: "M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.47h-2.796v8.385C19.612 22.954 24 17.99 24 12z" },
            { label: "אינסטגרם", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
            { label: "מייל", path: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              transform: `translateY(${Math.sin((frame + i * 15) / 14) * 3}px)`,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: STITCH.accent,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 4px 16px ${STITCH.accent}30`,
              }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="#fff"><path d={item.path} /></svg>
              </div>
              <span style={{
                fontFamily: STITCH.fontBody, fontSize: 20, fontWeight: 600,
                color: STITCH.textMuted,
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
