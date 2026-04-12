import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Img,
  staticFile,
  Easing,
} from "remotion";
import { bgGradient, COLORS, FONTS } from "../styles";

interface Scene4Props {
  screenshot: string;
  title: string;
  subtitle: string;
  variant: 1 | 2 | 3 | 4;
}

export const Scene4Product: React.FC<Scene4Props> = ({
  screenshot,
  title,
  subtitle,
  variant,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // VARIED ENTRY ANIMATIONS based on variant
  let entryTranslateX = 0;
  let entryTranslateY = 0;
  let entryScale = 1;
  let entryRotate = 0;

  if (variant === 1) {
    // Slide from RIGHT with scale
    entryTranslateX = spring({
      frame: Math.max(0, frame - 3),
      fps,
      from: 600,
      to: 0,
      config: { damping: 8, mass: 0.6 },
    });
    entryScale = spring({
      frame: Math.max(0, frame - 3),
      fps,
      from: 0.5,
      to: 1,
      config: { damping: 8, mass: 0.6 },
    });
  } else if (variant === 2) {
    // Slide from LEFT
    entryTranslateX = spring({
      frame: Math.max(0, frame - 3),
      fps,
      from: -600,
      to: 0,
      config: { damping: 8, mass: 0.6 },
    });
    entryScale = spring({
      frame: Math.max(0, frame - 3),
      fps,
      from: 0.5,
      to: 1,
      config: { damping: 8, mass: 0.6 },
    });
  } else if (variant === 3) {
    // Zoom from center with rotation
    entryScale = spring({
      frame: Math.max(0, frame - 3),
      fps,
      from: 0.3,
      to: 1,
      config: { damping: 7, mass: 0.6 },
    });
    entryRotate = spring({
      frame: Math.max(0, frame - 3),
      fps,
      from: 15,
      to: 0,
      config: { damping: 8, mass: 0.5 },
    });
  } else if (variant === 4) {
    // Drop from TOP with bounce
    entryTranslateY = spring({
      frame: Math.max(0, frame - 3),
      fps,
      from: -800,
      to: 0,
      config: { damping: 6, mass: 0.7 },
    });
    entryScale = spring({
      frame: Math.max(0, frame - 3),
      fps,
      from: 0.6,
      to: 1,
      config: { damping: 7, mass: 0.5 },
    });
  }

  const imgOpacity = interpolate(frame, [3, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Title — wipe reveal
  const titleStart = 20;
  const titleReveal = interpolate(frame, [titleStart, titleStart + 10], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const titleOpacity = interpolate(frame, [titleStart, titleStart + 6], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Subtitle
  const subStart = titleStart + 6;
  const subOpacity = interpolate(frame, [subStart, subStart + 8], [0, 1], {
    extrapolateRight: "clamp",
  });
  const subY = spring({
    frame: Math.max(0, frame - subStart),
    fps,
    from: 20,
    to: 0,
    config: { damping: 10 },
  });

  // Parallax float
  const floatY = Math.sin(frame / 12) * 6;
  const floatX = Math.cos(frame / 18) * 3;

  // Exit animation: fast scale-down + fade (frame 105-120)
  const exitStart = 105;
  const exitEnd = 120;
  const exitScale = interpolate(frame, [exitStart, exitEnd], [1, 0.5], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const exitOpacity = interpolate(frame, [exitStart, exitEnd], [1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Shine/reflection position on device frame
  const shineX = interpolate(frame, [0, 120], [-100, 200], {
    extrapolateRight: "clamp",
  });

  // Background blobs — slow floating
  const blob1X = Math.sin(frame / 22) * 35;
  const blob1Y = Math.cos(frame / 28) * 25;
  const blob2X = Math.cos(frame / 20) * 40;
  const blob2Y = Math.sin(frame / 24) * 30;

  return (
    <AbsoluteFill style={bgGradient}>
      {/* Soft gradient blobs */}
      <div
        style={{
          position: "absolute",
          top: 150 + blob1Y,
          right: -80 + blob1X,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(232,133,61,0.12) 0%, transparent 70%)`,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 200 + blob2Y,
          left: -100 + blob2X,
          width: 550,
          height: 550,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(137,207,240,0.1) 0%, transparent 70%)`,
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />

      {/* Main card with entry + exit transform */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          transform: `translateY(${floatY + entryTranslateY}px) translateX(${floatX + entryTranslateX}px) rotate(${entryRotate}deg) scale(${entryScale * exitScale})`,
          opacity: imgOpacity * exitOpacity,
        }}
      >
        {/* Device frame — simplified: rounded corners, thin border, strong shadow, NO notch */}
        <div
          style={{
            width: 1020,
            height: 850,
            borderRadius: 28,
            overflow: "hidden",
            boxShadow: "0 30px 80px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.1)",
            border: `3px solid ${COLORS.white}`,
            position: "relative",
            background: COLORS.white,
          }}
        >
          {/* Screenshot image — objectFit: contain, white bg */}
          <Img
            src={staticFile(screenshot)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "top",
              background: COLORS.white,
            }}
          />

          {/* Moving shine/reflection overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(105deg, transparent ${shineX - 30}%, rgba(255,255,255,0.15) ${shineX}%, transparent ${shineX + 30}%)`,
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Title — wipe reveal */}
        <div style={{ textAlign: "center", opacity: titleOpacity, marginTop: 16 }}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 52,
              fontWeight: 800,
              color: COLORS.textDark,
              marginBottom: 8,
              clipPath: `inset(0 ${(1 - titleReveal) * 100}% 0 0)`,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 32,
              color: COLORS.orange,
              fontWeight: 500,
              opacity: subOpacity,
              transform: `translateY(${subY}px)`,
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
