import React from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate,
  Img, staticFile,
} from "remotion";
import { PRISM, prismBg, prismGradient } from "../prismStyles";
import { PrismParticles } from "../PrismParticles";

interface V2ProductProps {
  screenshot: string;
  title: string;
  subtitle: string;
  variant: 1 | 2 | 3 | 4;
}

// UNIQUE effects per variant:
// 1 = DICE EXPLOSION — colorful cubes fly out chaotically → magnetically reassemble into screenshot
// 2 = SPINNING WHEEL — wheel grows huge + spins → shrinks into screenshot card
// 3 = BLOOM from top (clipPath grows down)
// 4 = BLOOM from bottom-right corner
export const V2ProductScene: React.FC<V2ProductProps> = ({
  screenshot, title, subtitle, variant,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const floatY = Math.sin(frame / 12) * 5;
  const badgeNum = `0${variant}`;

  const variantColors = {
    1: PRISM.indigo,
    2: PRISM.teal,
    3: PRISM.violet,
    4: PRISM.rose,
  };
  const badgeColor = variantColors[variant];
  const gradientAngles: Record<number, number> = { 1: 135, 2: 90, 3: 180, 4: 225 };

  // Exit animation (frame 135-150)
  const exitScale = interpolate(frame, [135, 150], [1, 0.7], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });
  const exitOpacity = interpolate(frame, [135, 150], [1, 0], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // =============================================
  // VARIANT 1: DICE EXPLOSION
  // Colorful cubes scatter chaotically from center → magnetically pull back → form the card
  // =============================================
  if (variant === 1) {
    // 20 cubes with random scatter positions
    const cubes = Array.from({ length: 20 }, (_, i) => {
      const angle = (i / 20) * Math.PI * 2 + i * 0.7;
      const maxDist = 350 + (i % 5) * 80;
      const colors = [PRISM.indigo, PRISM.teal, PRISM.rose, PRISM.violet, PRISM.sky, PRISM.amber];
      const size = 28 + (i % 4) * 14;
      const rotSpeed = 3 + (i % 3) * 2;
      const spinDir = i % 2 === 0 ? 1 : -1;

      // Phase 1 (frame 0-20): cubes EXPLODE outward from center
      const explodeDist = spring({
        frame: Math.min(frame, 20), fps,
        from: 0, to: maxDist,
        config: { damping: 6, mass: 0.4 },
      });

      // Phase 2 (frame 30-55): cubes MAGNETICALLY pull back to center
      const pullBack = frame > 30
        ? spring({ frame: frame - 30, fps, from: 0, to: 1, config: { damping: 12, mass: 0.8, stiffness: 60 } })
        : 0;

      // Combine: scatter then return
      const dist = explodeDist * (1 - pullBack);

      // Opacity: appear, stay, then fade as card appears
      const cubeOpacity = interpolate(frame, [0, 4, 45, 58], [0, 0.9, 0.9, 0], { extrapolateRight: "clamp" });

      return {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        size,
        color: colors[i % colors.length],
        rotate: frame * rotSpeed * spinDir,
        opacity: cubeOpacity,
        borderRadius: size > 35 ? 6 : 4,
      };
    });

    // Card appears after cubes converge (frame 50+)
    const cardAppear = interpolate(frame, [50, 60], [0, 1], { extrapolateRight: "clamp" });
    const cardScale = spring({
      frame: Math.max(0, frame - 50), fps,
      from: 0.7, to: 1, config: { damping: 8, mass: 0.5 },
    });

    // Screenshot
    const ssOpacity = interpolate(frame, [58, 66], [0, 1], { extrapolateRight: "clamp" });

    // Title
    const titleStart = 68;
    const titleOpacity = interpolate(frame, [titleStart, titleStart + 6], [0, 1], { extrapolateRight: "clamp" });
    const titleY = spring({ frame: Math.max(0, frame - titleStart), fps, from: 30, to: 0, config: { damping: 10 } });

    // Subtitle
    const subOpacity = interpolate(frame, [76, 82], [0, 1], { extrapolateRight: "clamp" });

    // Badge
    const badgeScale = spring({ frame: Math.max(0, frame - 60), fps, from: 0, to: 1, config: { damping: 4, mass: 0.2, stiffness: 300 } });

    return (
      <AbsoluteFill style={prismBg}>
        <PrismParticles />

        {/* FLYING CUBES */}
        {cubes.map((cube, i) => (
          <div key={`cube-${i}`} style={{
            position: "absolute", top: "46%", left: "50%",
            transform: `translate(calc(-50% + ${cube.x}px), calc(-50% + ${cube.y}px)) rotate(${cube.rotate}deg)`,
            width: cube.size, height: cube.size,
            background: `linear-gradient(135deg, ${cube.color}, ${cube.color}90)`,
            borderRadius: cube.borderRadius,
            opacity: cube.opacity,
            boxShadow: `0 4px 12px ${cube.color}30`,
            zIndex: 5,
          }} />
        ))}

        {/* Card after cubes converge */}
        <div style={{
          position: "absolute", top: "46%", left: "50%",
          transform: `translate(-50%, -50%) translateY(${floatY}px) scale(${cardScale * exitScale})`,
          opacity: cardAppear * exitOpacity,
          zIndex: 2,
        }}>
          {/* Parallax shadows */}
          <div style={{
            position: "absolute", top: 16, left: -12, width: 960, height: "100%",
            background: `${badgeColor}08`, borderRadius: PRISM.cardRadius + 4,
          }} />
          <div style={{
            position: "absolute", top: 8, left: -6, width: 960, height: "100%",
            background: `${badgeColor}12`, borderRadius: PRISM.cardRadius + 2,
          }} />

          <div style={{
            position: "relative", width: 960, background: PRISM.card,
            borderRadius: PRISM.cardRadius, overflow: "hidden",
            boxShadow: PRISM.shadowDeep, border: `1px solid ${badgeColor}15`,
          }}>
            <div style={{ width: "100%", height: 720, background: PRISM.bg }}>
              <Img src={staticFile(screenshot)} style={{
                width: "100%", height: "100%",
                objectFit: "contain", objectPosition: "top", opacity: ssOpacity,
              }} />
            </div>
            <div style={{ padding: "24px 40px", textAlign: "center", borderTop: `1px solid ${PRISM.indigo}08` }}>
              <div style={{
                fontFamily: PRISM.fontHeading, fontSize: 52, fontWeight: 800,
                background: `linear-gradient(${gradientAngles[variant]}deg, ${PRISM.indigo}, ${PRISM.teal}, ${PRISM.rose})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                opacity: titleOpacity, transform: `translateY(${titleY}px)`, marginBottom: 8,
              }}>{title}</div>
              <div style={{
                fontFamily: PRISM.fontBody, fontSize: 36, fontWeight: 500,
                color: PRISM.textMuted, opacity: subOpacity,
              }}>{subtitle}</div>
            </div>

            {/* Badge */}
            <div style={{
              position: "absolute", top: 20, right: 20, transform: `scale(${badgeScale})`,
              background: `linear-gradient(135deg, ${badgeColor}, ${PRISM.violet})`,
              borderRadius: 50, padding: "10px 28px",
              boxShadow: `0 6px 20px ${badgeColor}40`, zIndex: 3,
            }}>
              <span style={{ fontFamily: PRISM.fontHeading, fontSize: 28, fontWeight: 700, color: PRISM.textLight }}>{badgeNum}</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // =============================================
  // VARIANT 2: SPINNING WHEEL
  // Wheel appears huge, spins fast → slows down → shrinks into card with screenshot
  // =============================================
  if (variant === 2) {
    // Wheel phases
    // Phase 1 (frame 0-12): wheel GROWS from tiny
    const wheelGrowScale = spring({
      frame, fps, from: 0.1, to: 1.6,
      config: { damping: 7, mass: 0.5 },
    });
    const wheelOpacity = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });

    // Phase 2 (frame 0-60): wheel SPINS — starts fast, slows down
    const spinSpeed = interpolate(frame, [0, 20, 40, 60], [25, 18, 8, 0], { extrapolateRight: "clamp" });
    // Accumulate rotation
    let totalRotation = 0;
    for (let f = 0; f < Math.min(frame, 60); f++) {
      totalRotation += interpolate(f, [0, 20, 40, 60], [25, 18, 8, 0], { extrapolateRight: "clamp" });
    }

    // Phase 3 (frame 50-70): wheel SHRINKS and moves into card position
    const wheelShrink = frame > 50
      ? spring({ frame: frame - 50, fps, from: 1.6, to: 0, config: { damping: 10, mass: 0.7 } })
      : wheelGrowScale;
    const wheelFinalScale = frame <= 50 ? wheelGrowScale : wheelShrink;
    const wheelFadeOut = interpolate(frame, [55, 65], [1, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

    // Wheel segments (8 colored slices)
    const segments = 8;
    const segmentColors = [
      PRISM.indigo, PRISM.teal, PRISM.rose, PRISM.violet,
      PRISM.sky, PRISM.amber, PRISM.indigo, PRISM.teal,
    ];

    // Card appears (frame 60+)
    const cardAppear = interpolate(frame, [60, 70], [0, 1], { extrapolateRight: "clamp" });
    const cardScale = spring({
      frame: Math.max(0, frame - 60), fps,
      from: 0.6, to: 1, config: { damping: 8, mass: 0.5 },
    });

    // Screenshot
    const ssOpacity = interpolate(frame, [68, 76], [0, 1], { extrapolateRight: "clamp" });

    // Title
    const titleStart = 78;
    const titleOpacity = interpolate(frame, [titleStart, titleStart + 6], [0, 1], { extrapolateRight: "clamp" });
    const titleY = spring({ frame: Math.max(0, frame - titleStart), fps, from: 30, to: 0, config: { damping: 10 } });

    // Subtitle
    const subOpacity = interpolate(frame, [86, 92], [0, 1], { extrapolateRight: "clamp" });

    // Badge
    const badgeScale = spring({ frame: Math.max(0, frame - 68), fps, from: 0, to: 1, config: { damping: 4, mass: 0.2, stiffness: 300 } });

    // Confetti burst when wheel stops
    const confettiStart = 48;
    const confetti = Array.from({ length: 14 }, (_, i) => {
      const angle = (i / 14) * Math.PI * 2;
      const dist = frame >= confettiStart
        ? spring({ frame: frame - confettiStart, fps, from: 0, to: 200 + (i % 4) * 60, config: { damping: 14, mass: 0.7 } })
        : 0;
      const cOpacity = frame >= confettiStart
        ? interpolate(frame, [confettiStart, confettiStart + 4, confettiStart + 18], [0, 0.7, 0], { extrapolateRight: "clamp" })
        : 0;
      const colors = [PRISM.indigo, PRISM.teal, PRISM.rose, PRISM.violet, PRISM.sky, PRISM.amber];
      return {
        x: Math.cos(angle) * dist, y: Math.sin(angle) * dist,
        color: colors[i % colors.length], opacity: cOpacity,
        w: 10 + (i % 4) * 4, h: 5 + (i % 3) * 2,
        rotate: frame * 3 + i * 26,
      };
    });

    return (
      <AbsoluteFill style={prismBg}>
        <PrismParticles />

        {/* SPINNING WHEEL */}
        <div style={{
          position: "absolute", top: "42%", left: "50%",
          transform: `translate(-50%, -50%) scale(${wheelFinalScale}) rotate(${totalRotation}deg)`,
          opacity: wheelOpacity * wheelFadeOut,
          zIndex: 6,
        }}>
          {/* Wheel — SVG with colored segments */}
          <svg width="500" height="500" viewBox="0 0 500 500">
            {Array.from({ length: segments }, (_, i) => {
              const startAngle = (i / segments) * Math.PI * 2;
              const endAngle = ((i + 1) / segments) * Math.PI * 2;
              const r = 240;
              const cx = 250;
              const cy = 250;
              const x1 = cx + r * Math.cos(startAngle);
              const y1 = cy + r * Math.sin(startAngle);
              const x2 = cx + r * Math.cos(endAngle);
              const y2 = cy + r * Math.sin(endAngle);
              return (
                <path key={i}
                  d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`}
                  fill={segmentColors[i]}
                  opacity={0.85}
                />
              );
            })}
            {/* Center circle */}
            <circle cx="250" cy="250" r="40" fill={PRISM.card}
              stroke={PRISM.indigo} strokeWidth="3" />
            {/* Center dot */}
            <circle cx="250" cy="250" r="12" fill={PRISM.indigo} />
            {/* Outer ring */}
            <circle cx="250" cy="250" r="242" fill="none"
              stroke={PRISM.card} strokeWidth="4" />
          </svg>

          {/* Pointer triangle on top */}
          <div style={{
            position: "absolute", top: -20, left: "50%",
            transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "18px solid transparent",
            borderRight: "18px solid transparent",
            borderTop: `32px solid ${PRISM.rose}`,
            filter: `drop-shadow(0 4px 8px ${PRISM.rose}40)`,
          }} />
        </div>

        {/* Confetti burst when wheel stops */}
        {confetti.map((c, i) => (
          <div key={`wc-${i}`} style={{
            position: "absolute", top: "42%", left: "50%",
            transform: `translate(calc(-50% + ${c.x}px), calc(-50% + ${c.y}px)) rotate(${c.rotate}deg)`,
            width: c.w, height: c.h, borderRadius: 2,
            background: c.color, opacity: c.opacity, zIndex: 7,
          }} />
        ))}

        {/* Card after wheel shrinks */}
        <div style={{
          position: "absolute", top: "46%", left: "50%",
          transform: `translate(-50%, -50%) translateY(${floatY}px) scale(${cardScale * exitScale})`,
          opacity: cardAppear * exitOpacity,
          zIndex: 2,
        }}>
          <div style={{
            position: "absolute", top: 16, left: -12, width: 960, height: "100%",
            background: `${badgeColor}08`, borderRadius: PRISM.cardRadius + 4,
          }} />
          <div style={{
            position: "absolute", top: 8, left: -6, width: 960, height: "100%",
            background: `${badgeColor}12`, borderRadius: PRISM.cardRadius + 2,
          }} />

          <div style={{
            position: "relative", width: 960, background: PRISM.card,
            borderRadius: PRISM.cardRadius, overflow: "hidden",
            boxShadow: PRISM.shadowDeep, border: `1px solid ${badgeColor}15`,
          }}>
            <div style={{ width: "100%", height: 720, background: PRISM.bg }}>
              <Img src={staticFile(screenshot)} style={{
                width: "100%", height: "100%",
                objectFit: "contain", objectPosition: "top", opacity: ssOpacity,
              }} />
            </div>
            <div style={{ padding: "24px 40px", textAlign: "center", borderTop: `1px solid ${PRISM.indigo}08` }}>
              <div style={{
                fontFamily: PRISM.fontHeading, fontSize: 52, fontWeight: 800,
                background: `linear-gradient(${gradientAngles[variant]}deg, ${PRISM.indigo}, ${PRISM.teal}, ${PRISM.rose})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                opacity: titleOpacity, transform: `translateY(${titleY}px)`, marginBottom: 8,
              }}>{title}</div>
              <div style={{
                fontFamily: PRISM.fontBody, fontSize: 36, fontWeight: 500,
                color: PRISM.textMuted, opacity: subOpacity,
              }}>{subtitle}</div>
            </div>

            <div style={{
              position: "absolute", top: 20, right: 20, transform: `scale(${badgeScale})`,
              background: `linear-gradient(135deg, ${badgeColor}, ${PRISM.violet})`,
              borderRadius: 50, padding: "10px 28px",
              boxShadow: `0 6px 20px ${badgeColor}40`, zIndex: 3,
            }}>
              <span style={{ fontFamily: PRISM.fontHeading, fontSize: 28, fontWeight: 700, color: PRISM.textLight }}>{badgeNum}</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // =============================================
  // VARIANTS 3 & 4: BLOOM OPEN (original behavior)
  // =============================================
  const bloomProgress = spring({
    frame, fps, from: 0, to: 1,
    config: { damping: 8, mass: 0.6 },
  });
  const cardOpacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });

  const getBloomClipPath = () => {
    if (variant === 3) {
      const height = bloomProgress * 100;
      return `inset(0 0 ${100 - height}% 0)`;
    }
    // variant 4
    const size = bloomProgress * 150;
    return `circle(${size}% at 100% 100%)`;
  };

  const screenshotOpacity = interpolate(frame, [18, 26], [0, 1], { extrapolateRight: "clamp" });
  const titleStart = 28;
  const titleOpacity = interpolate(frame, [titleStart, titleStart + 6], [0, 1], { extrapolateRight: "clamp" });
  const titleY = spring({ frame: Math.max(0, frame - titleStart), fps, from: 30, to: 0, config: { damping: 10, mass: 0.5 } });
  const subOpacity = interpolate(frame, [36, 42], [0, 1], { extrapolateRight: "clamp" });
  const badgeScale = spring({ frame: Math.max(0, frame - 22), fps, from: 0, to: 1, config: { damping: 4, mass: 0.2, stiffness: 300 } });

  return (
    <AbsoluteFill style={prismBg}>
      <PrismParticles />

      <div style={{
        position: "absolute", top: "46%", left: "50%",
        transform: `translate(-50%, -50%) translateY(${floatY}px) scale(${exitScale})`,
        opacity: exitOpacity, zIndex: 2,
      }}>
        <div style={{
          position: "absolute", top: 16, left: -12, width: 960, height: "100%",
          background: `${badgeColor}08`, borderRadius: PRISM.cardRadius + 4,
          opacity: cardOpacity * 0.4, clipPath: getBloomClipPath(),
        }} />
        <div style={{
          position: "absolute", top: 8, left: -6, width: 960, height: "100%",
          background: `${badgeColor}12`, borderRadius: PRISM.cardRadius + 2,
          opacity: cardOpacity * 0.5, clipPath: getBloomClipPath(),
        }} />

        <div style={{
          position: "relative", width: 960, background: PRISM.card,
          borderRadius: PRISM.cardRadius, overflow: "hidden",
          boxShadow: PRISM.shadowDeep, border: `1px solid ${badgeColor}15`,
          opacity: cardOpacity, clipPath: getBloomClipPath(),
        }}>
          <div style={{ width: "100%", height: 720, background: PRISM.bg }}>
            <Img src={staticFile(screenshot)} style={{
              width: "100%", height: "100%",
              objectFit: "contain", objectPosition: "top", opacity: screenshotOpacity,
            }} />
          </div>
          <div style={{ padding: "24px 40px", textAlign: "center", borderTop: `1px solid ${PRISM.indigo}08` }}>
            <div style={{
              fontFamily: PRISM.fontHeading, fontSize: 52, fontWeight: 800,
              background: `linear-gradient(${gradientAngles[variant]}deg, ${PRISM.indigo}, ${PRISM.teal}, ${PRISM.rose})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              opacity: titleOpacity, transform: `translateY(${titleY}px)`, marginBottom: 8,
            }}>{title}</div>
            <div style={{
              fontFamily: PRISM.fontBody, fontSize: 36, fontWeight: 500,
              color: PRISM.textMuted, opacity: subOpacity,
            }}>{subtitle}</div>
          </div>

          <div style={{
            position: "absolute", top: 20, right: 20, transform: `scale(${badgeScale})`,
            background: `linear-gradient(135deg, ${badgeColor}, ${PRISM.violet})`,
            borderRadius: 50, padding: "10px 28px",
            boxShadow: `0 6px 20px ${badgeColor}40`, zIndex: 3,
          }}>
            <span style={{ fontFamily: PRISM.fontHeading, fontSize: 28, fontWeight: 700, color: PRISM.textLight }}>{badgeNum}</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
