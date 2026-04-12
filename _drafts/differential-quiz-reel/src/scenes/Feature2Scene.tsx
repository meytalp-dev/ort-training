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
import { CheckIcon } from "../Icons";

// "After" scene — screenshot of real quiz + 3-step flow
export const Feature2Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title drops in
  const titleStart = 5;
  const titleY = spring({
    frame: Math.max(0, frame - titleStart),
    fps,
    from: -100,
    to: 0,
    config: { damping: 10, mass: 0.5 },
  });
  const titleOpacity = interpolate(
    frame,
    [titleStart, titleStart + 10],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Screenshot slides in from right
  const imgStart = 15;
  const imgX = spring({
    frame: Math.max(0, frame - imgStart),
    fps,
    from: 300,
    to: 0,
    config: { damping: 10, mass: 0.6 },
  });
  const imgOpacity = interpolate(
    frame,
    [imgStart, imgStart + 8],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Flow steps appear one by one
  const steps = [
    "2 שאלות מאבחנות",
    "הרמה נקבעת",
    "שאלות מותאמות לכל אחד",
  ];

  const stepsStart = 55;
  const stepStagger = 18;

  return (
    <AbsoluteFill style={bgStyle}>
      <Particles />

      {/* "אחרי" title */}
      <div
        style={{
          position: "absolute",
          top: 300,
          left: "50%",
          transform: `translate(-50%, ${titleY}px)`,
          opacity: titleOpacity,
          zIndex: 20,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: STYLE.fontHeading,
            fontSize: 72,
            fontWeight: 800,
            color: STYLE.mint,
            textShadow: `0 4px 30px ${STYLE.mint}30`,
          }}
        >
          אחרי
        </div>
        <div
          style={{
            width: 120,
            height: 4,
            background: `linear-gradient(90deg, transparent, ${STYLE.mint}, transparent)`,
            margin: "12px auto 0",
            borderRadius: 2,
          }}
        />
      </div>

      {/* Screenshot of real quiz */}
      <div
        style={{
          position: "absolute",
          top: 330,
          left: "50%",
          transform: `translate(calc(-50% + ${imgX}px), 0)`,
          opacity: imgOpacity,
          zIndex: 15,
          width: 960,
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: `0 20px 60px ${STYLE.mint}20, 0 8px 24px rgba(0,0,0,0.08)`,
          border: `3px solid ${STYLE.mint}40`,
        }}
      >
        <Img
          src={staticFile("screenshots/quiz-diagnostic.png")}
          style={{ width: "100%", display: "block" }}
        />
      </div>

      {/* 3-step flow below screenshot */}
      <div
        style={{
          position: "absolute",
          top: 1080,
          left: "50%",
          transform: "translate(-50%, 0)",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: 20,
          direction: "rtl",
        }}
      >
        {steps.map((step, i) => {
          const stepStart = stepsStart + i * stepStagger;
          const stepScale = spring({
            frame: Math.max(0, frame - stepStart),
            fps,
            from: 0,
            to: 1,
            config: { damping: 6, mass: 0.3, stiffness: 200 },
          });
          const stepOpacity = interpolate(
            frame,
            [stepStart, stepStart + 5],
            [0, 1],
            { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
          );

          return (
            <React.Fragment key={i}>
              {/* Step pill */}
              <div
                style={{
                  transform: `scale(${stepScale})`,
                  opacity: stepOpacity,
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  borderRadius: 20,
                  padding: "16px 28px",
                  border: `2px solid ${STYLE.mint}30`,
                  boxShadow: `0 8px 24px ${STYLE.mint}12`,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${STYLE.mint}, ${STYLE.skyBlue})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: STYLE.fontHeading,
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#fff",
                    }}
                  >
                    {i + 1}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: STYLE.fontBody,
                    fontSize: 30,
                    fontWeight: 600,
                    color: STYLE.textDark,
                    whiteSpace: "nowrap",
                  }}
                >
                  {step}
                </span>
              </div>

              {/* Arrow between steps */}
              {i < steps.length - 1 && (
                <div
                  style={{
                    opacity: stepOpacity,
                    transform: `scale(${stepScale})`,
                  }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={STYLE.mint}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transform: "scaleX(-1)" }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mint glow behind screenshot */}
      <div
        style={{
          position: "absolute",
          top: 450,
          left: "50%",
          width: 700,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${STYLE.mint}12 0%, transparent 70%)`,
          transform: "translate(-50%, 0)",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
