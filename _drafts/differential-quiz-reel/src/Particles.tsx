import React from "react";
import { useCurrentFrame } from "remotion";
import { STYLE } from "./styles";

export const Particles: React.FC = () => {
  const frame = useCurrentFrame();

  // === LIQUID MORPHING BLOBS ===
  const blob1Points = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const radius = 350 + Math.sin(frame / 20 + i * 1.2) * 80 + Math.cos(frame / 15 + i * 0.8) * 50;
    const x = 180 + Math.cos(angle) * radius + Math.sin(frame / 25) * 40;
    const y = 350 + Math.sin(angle) * radius + Math.cos(frame / 22) * 30;
    return `${x},${y}`;
  });
  const blob2Points = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const radius = 300 + Math.cos(frame / 18 + i * 1.5) * 70 + Math.sin(frame / 13 + i) * 45;
    const x = 880 + Math.cos(angle) * radius + Math.cos(frame / 28) * 35;
    const y = 1450 + Math.sin(angle) * radius + Math.sin(frame / 20) * 40;
    return `${x},${y}`;
  });

  const toSmoothPath = (points: string[]) => {
    const pts = points.map((p) => p.split(",").map(Number));
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length; i++) {
      const curr = pts[i];
      const next = pts[(i + 1) % pts.length];
      const nextNext = pts[(i + 2) % pts.length];
      const cpx = next[0] + (nextNext[0] - curr[0]) * 0.15;
      const cpy = next[1] + (nextNext[1] - curr[1]) * 0.15;
      d += ` Q ${cpx} ${cpy} ${next[0]} ${next[1]}`;
    }
    return d + " Z";
  };

  // === FLOATING ORBS — Learni colors ===
  const orbs = [
    { x: 120, y: 300, size: 55, color: STYLE.mint, speed: 14, drift: 50 },
    { x: 900, y: 600, size: 45, color: STYLE.lavender, speed: 18, drift: 60 },
    { x: 500, y: 1200, size: 50, color: STYLE.skyBlue, speed: 16, drift: 45 },
    { x: 200, y: 1600, size: 40, color: STYLE.pink, speed: 20, drift: 55 },
    { x: 800, y: 1000, size: 35, color: STYLE.mint, speed: 12, drift: 40 },
    { x: 950, y: 200, size: 30, color: STYLE.lavender, speed: 22, drift: 50 },
  ];

  // === GLOWING RINGS ===
  const rings = [
    { x: 850, y: 220, size: 180, speed: 0.01 },
    { x: 100, y: 1300, size: 150, speed: 0.015 },
    { x: 920, y: 1000, size: 120, speed: 0.012 },
    { x: 180, y: 700, size: 100, speed: 0.018 },
  ];

  // === ROTATING DIAMONDS ===
  const diamonds = [
    { x: 80, y: 400, size: 22 },
    { x: 950, y: 500, size: 18 },
    { x: 150, y: 1100, size: 20 },
    { x: 880, y: 1500, size: 16 },
    { x: 500, y: 200, size: 24 },
  ];

  return (
    <>
      {/* Liquid blobs */}
      <svg
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          pointerEvents: "none", opacity: 0.22,
        }}
      >
        <defs>
          <radialGradient id="blob1grad">
            <stop offset="0%" stopColor={STYLE.lavender} stopOpacity="0.7" />
            <stop offset="100%" stopColor={STYLE.lavender} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="blob2grad">
            <stop offset="0%" stopColor={STYLE.mint} stopOpacity="0.6" />
            <stop offset="100%" stopColor={STYLE.mint} stopOpacity="0" />
          </radialGradient>
          <filter id="blobBlur">
            <feGaussianBlur stdDeviation="50" />
          </filter>
        </defs>
        <path d={toSmoothPath(blob1Points)} fill="url(#blob1grad)" filter="url(#blobBlur)" />
        <path d={toSmoothPath(blob2Points)} fill="url(#blob2grad)" filter="url(#blobBlur)" />
      </svg>

      {/* Floating orbs with glow */}
      {orbs.map((orb, i) => {
        const ox = orb.x + Math.sin((frame + i * 50) / orb.speed) * orb.drift;
        const oy = orb.y + Math.cos((frame + i * 30) / (orb.speed * 1.2)) * orb.drift * 0.8;
        const pulse = 1 + Math.sin((frame + i * 20) / 8) * 0.15;
        return (
          <div
            key={`orb-${i}`}
            style={{
              position: "absolute", left: ox, top: oy,
              width: orb.size * pulse, height: orb.size * pulse,
              borderRadius: "50%", background: orb.color,
              opacity: 0.18,
              boxShadow: `0 0 ${orb.size}px ${orb.color}40, 0 0 ${orb.size * 2}px ${orb.color}15`,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Glowing rings */}
      {rings.map((r, i) => {
        const ringScale = 1 + Math.sin((frame + i * 50) / 20) * 0.15;
        const ringY = r.y + Math.sin((frame + i * 30) / 25) * 40;
        const ringOpacity = 0.14 + Math.sin((frame + i * 40) * r.speed) * 0.05;
        return (
          <div
            key={`ring-${i}`}
            style={{
              position: "absolute", left: r.x, top: ringY,
              width: r.size, height: r.size, borderRadius: "50%",
              border: `2px solid ${STYLE.skyBlue}`,
              boxShadow: `0 0 ${r.size / 2}px ${STYLE.skyBlue}25`,
              opacity: ringOpacity, transform: `scale(${ringScale})`,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Rotating diamonds */}
      {diamonds.map((d, i) => {
        const dx = d.x + Math.sin((frame + i * 100) / 14) * 50;
        const dy = d.y + Math.cos((frame + i * 80) / 18) * 40;
        const rotate = frame * 2 + i * 72;
        return (
          <div
            key={`d-${i}`}
            style={{
              position: "absolute", left: dx, top: dy,
              width: d.size, height: d.size, background: STYLE.lavender,
              transform: `rotate(${rotate}deg)`,
              opacity: 0.14,
              boxShadow: `0 0 ${d.size * 1.5}px ${STYLE.lavender}30`,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Bottom wave */}
      <svg
        style={{
          position: "absolute", bottom: 0, left: 0, width: "100%", height: 250,
          opacity: 0.08, pointerEvents: "none",
        }}
        viewBox="0 0 1080 250"
        preserveAspectRatio="none"
      >
        <path
          d={`M0,${120 + Math.sin(frame / 15) * 25} C270,${70 + Math.cos(frame / 12) * 20} 540,${160 - Math.sin(frame / 15) * 25} 810,${100 + Math.cos(frame / 12) * 20} L1080,${130 - Math.sin(frame / 15) * 25} L1080,250 L0,250 Z`}
          fill={STYLE.skyBlue}
        />
      </svg>
    </>
  );
};
