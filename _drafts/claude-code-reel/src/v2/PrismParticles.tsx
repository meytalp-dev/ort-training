import React from "react";
import { useCurrentFrame } from "remotion";
import { PRISM } from "./prismStyles";

// Confetti + hexagons + wave — NOT Greg's orbs/diamonds/liquid blobs
export const PrismParticles: React.FC = () => {
  const frame = useCurrentFrame();

  // === CONFETTI — small colorful rectangles that drift down and rotate ===
  const confetti = [
    { x: 80, y: 120, w: 12, h: 6, color: PRISM.indigo, speed: 0.6, wobble: 25 },
    { x: 950, y: 200, w: 10, h: 5, color: PRISM.rose, speed: 0.8, wobble: 30 },
    { x: 200, y: 800, w: 14, h: 6, color: PRISM.teal, speed: 0.5, wobble: 20 },
    { x: 850, y: 1000, w: 11, h: 5, color: PRISM.violet, speed: 0.7, wobble: 35 },
    { x: 500, y: 400, w: 13, h: 6, color: PRISM.sky, speed: 0.4, wobble: 22 },
    { x: 150, y: 1400, w: 10, h: 5, color: PRISM.amber, speed: 0.6, wobble: 28 },
    { x: 780, y: 600, w: 12, h: 6, color: PRISM.indigo, speed: 0.5, wobble: 32 },
    { x: 400, y: 1600, w: 11, h: 5, color: PRISM.rose, speed: 0.7, wobble: 18 },
  ];

  // === HEXAGONS — hollow, slowly rotating, soft colors ===
  const hexagons = [
    { x: 100, y: 300, size: 50, color: PRISM.violet, speed: 0.012 },
    { x: 920, y: 500, size: 40, color: PRISM.teal, speed: 0.015 },
    { x: 180, y: 1200, size: 45, color: PRISM.indigo, speed: 0.01 },
    { x: 850, y: 1500, size: 35, color: PRISM.rose, speed: 0.018 },
  ];

  // === WAVE — soft gradient wave at bottom ===
  const waveY1 = Math.sin(frame / 20) * 20;
  const waveY2 = Math.cos(frame / 16) * 15;
  const waveY3 = Math.sin(frame / 24) * 18;

  // Hexagon SVG path
  const hexPath = (s: number) => {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      return `${s / 2 + (s / 2) * Math.cos(a)},${s / 2 + (s / 2) * Math.sin(a)}`;
    });
    return `M${pts.join("L")}Z`;
  };

  return (
    <>
      {/* Confetti pieces */}
      {confetti.map((c, i) => {
        const cy = (c.y + frame * c.speed * 2) % 2000;
        const cx = c.x + Math.sin((frame + i * 50) / 12) * c.wobble;
        const rotate = frame * (1.5 + i * 0.3);
        return (
          <div key={`c-${i}`} style={{
            position: "absolute", left: cx, top: cy,
            width: c.w, height: c.h,
            background: c.color, borderRadius: 2,
            transform: `rotate(${rotate}deg)`,
            opacity: 0.18,
            pointerEvents: "none",
          }} />
        );
      })}

      {/* Hexagons */}
      {hexagons.map((h, i) => {
        const hx = h.x + Math.sin((frame + i * 80) / 18) * 40;
        const hy = h.y + Math.cos((frame + i * 60) / 22) * 30;
        const rotate = frame * h.speed * 60;
        return (
          <svg key={`h-${i}`} style={{
            position: "absolute", left: hx, top: hy,
            width: h.size, height: h.size,
            opacity: 0.12,
            transform: `rotate(${rotate}deg)`,
            pointerEvents: "none",
          }} viewBox={`0 0 ${h.size} ${h.size}`}>
            <path d={hexPath(h.size)} fill="none" stroke={h.color} strokeWidth="2" />
          </svg>
        );
      })}

      {/* Gradient wave at bottom */}
      <svg style={{
        position: "absolute", bottom: 0, left: 0,
        width: "100%", height: 200, opacity: 0.06,
        pointerEvents: "none",
      }} viewBox="0 0 1080 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="prismWave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={PRISM.indigo} />
            <stop offset="50%" stopColor={PRISM.teal} />
            <stop offset="100%" stopColor={PRISM.rose} />
          </linearGradient>
        </defs>
        <path
          d={`M0,${100 + waveY1} C270,${60 + waveY2} 540,${140 + waveY3} 810,${80 + waveY1} L1080,${110 + waveY2} L1080,200 L0,200 Z`}
          fill="url(#prismWave)"
        />
        <path
          d={`M0,${130 + waveY2} C360,${90 + waveY3} 720,${160 + waveY1} 1080,${100 + waveY3} L1080,200 L0,200 Z`}
          fill="url(#prismWave)" opacity="0.5"
        />
      </svg>

      {/* Soft prismatic glow spots */}
      <div style={{
        position: "absolute", top: 200, right: -100,
        width: 500, height: 500, borderRadius: "50%",
        background: `radial-gradient(circle, ${PRISM.violet}10 0%, transparent 70%)`,
        filter: "blur(60px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: 300, left: -80,
        width: 450, height: 450, borderRadius: "50%",
        background: `radial-gradient(circle, ${PRISM.teal}10 0%, transparent 70%)`,
        filter: "blur(60px)", pointerEvents: "none",
      }} />
    </>
  );
};
