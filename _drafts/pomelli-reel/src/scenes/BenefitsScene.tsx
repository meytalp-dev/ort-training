import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { POMELLI, pomelliBg } from "../styles";
import { Particles } from "../Particles";

// Benefits — Show real campaigns created with Pomelli
export const BenefitsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const floatY = Math.sin(frame / 14) * 4;

  // === Title card (frame 0-40) ===
  const titleScale = spring({ frame, fps, from: 0.5, to: 1, config: { damping: 8, mass: 0.5 } });
  const titleOpacity = interpolate(frame, [0, 6, 30, 40], [0, 1, 1, 0], { extrapolateRight: "clamp" });

  // === 3 campaign cards fan out ===
  const campaigns = [
    {
      image: "screenshots/facebook-testimonials-stars.png",
      label: "תמונה לפרזנטציה",
      enterFrame: 30,
      rotation: -5,
      xOffset: -300,
    },
    {
      image: "screenshots/facebook-ai-tip-tools.png",
      label: "צילום מוצר לחנות",
      enterFrame: 50,
      rotation: 0,
      xOffset: 0,
    },
    {
      image: "screenshots/hourglass-after.png",
      label: "קמפיין לסושיאל",
      enterFrame: 70,
      rotation: 5,
      xOffset: 300,
    },
  ];

  // === Tagline (frame 100+) ===
  const tagStart = 100;
  const tagScale = spring({ frame: Math.max(0, frame - tagStart), fps, from: 2.5, to: 1, config: { damping: 5, mass: 0.3, stiffness: 200 } });
  const tagOpacity = interpolate(frame, [tagStart, tagStart + 6], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={pomelliBg}>
      <Particles />

      {/* === Title card === */}
      <div style={{
        position: "absolute", top: "44%", left: "50%",
        transform: `translate(-50%, -50%) scale(${titleScale})`,
        opacity: titleOpacity, zIndex: 2,
        width: 600, height: 280,
        background: `linear-gradient(135deg, ${POMELLI.accent}, ${POMELLI.accentDark})`,
        borderRadius: POMELLI.cardRadius,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16,
        boxShadow: `0 20px 60px ${POMELLI.accent}30`,
      }}>
        <div style={{
          fontFamily: POMELLI.fontHeading, fontSize: 56, fontWeight: 900,
          color: POMELLI.textLight,
        }}>
          מה יצרנו עם Pomelli?
        </div>
        <div style={{
          width: 200, height: 4, borderRadius: 2,
          background: "rgba(255,255,255,0.3)",
        }} />
      </div>

      {/* === 3 campaign cards fanning out === */}
      {campaigns.map((campaign, i) => {
        const f = Math.max(0, frame - campaign.enterFrame);

        // Bounce entrance from below
        const enterY = spring({
          frame: f, fps,
          from: 600, to: 0,
          config: { damping: 8, mass: 0.6, stiffness: 120 },
        });
        const enterOpacity = interpolate(f, [0, 5], [0, 1], { extrapolateRight: "clamp" });
        const enterScale = spring({
          frame: f, fps,
          from: 0.7, to: 1,
          config: { damping: 6, mass: 0.3 },
        });

        // Mini flash when card lands
        const flashOpacity = interpolate(f, [8, 10, 14], [0, 0.12, 0], { extrapolateRight: "clamp" });

        const cardFloat = Math.sin((frame + i * 30) / 14) * 3;

        return (
          <React.Fragment key={`campaign-${i}`}>
            {/* Flash */}
            {f > 7 && f < 16 && (
              <div style={{
                position: "absolute", inset: 0,
                background: POMELLI.accent,
                opacity: flashOpacity, zIndex: 1,
                pointerEvents: "none",
              }} />
            )}

            <div style={{
              position: "absolute", top: "42%", left: "50%",
              transform: `translate(calc(-50% + ${campaign.xOffset}px), calc(-50% + ${enterY + cardFloat + floatY}px)) scale(${enterScale}) rotate(${campaign.rotation}deg)`,
              opacity: enterOpacity, zIndex: 3 + i,
              width: 300, height: 420,
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(16px)",
              borderRadius: 24,
              boxShadow: POMELLI.shadowHeavy,
              border: "1px solid rgba(255,255,255,0.5)",
              display: "flex", flexDirection: "column",
              alignItems: "center",
              padding: 12,
              gap: 12,
              overflow: "hidden",
            }}>
              {/* Campaign screenshot */}
              <div style={{
                width: 276, height: 340,
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: POMELLI.shadow,
              }}>
                <Img
                  src={staticFile(campaign.image)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              {/* Label */}
              <div style={{
                fontFamily: POMELLI.fontHeading, fontSize: 32, fontWeight: 700,
                color: POMELLI.accent, textAlign: "center",
              }}>
                {campaign.label}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* === Tagline at bottom === */}
      <div style={{
        position: "absolute", bottom: 100, left: "50%",
        transform: `translateX(-50%) scale(${tagScale}) translateY(${floatY}px)`,
        opacity: tagOpacity, zIndex: 10,
      }}>
        <div style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(12px)",
          borderRadius: 60, padding: "16px 48px",
          boxShadow: `0 8px 30px ${POMELLI.accent}20`,
          border: "1px solid rgba(255,255,255,0.4)",
        }}>
          <span style={{
            fontFamily: POMELLI.fontHeading, fontSize: 44, fontWeight: 900,
            color: POMELLI.textDark,
          }}>
            תוצר מקצועי.{" "}
            <span style={{ color: POMELLI.accent }}>בלי ידע בעיצוב.</span>
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
