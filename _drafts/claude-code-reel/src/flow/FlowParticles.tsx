import React from "react";
import { useCurrentFrame } from "remotion";
import { FLOW } from "./styles";

export const FlowParticles: React.FC = () => {
  const frame = useCurrentFrame();

  // === COLOR BLOBS — Flow's signature pink/blue/warm ===
  const blob1Points = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const radius = 300 + Math.sin(frame / 22 + i * 1.1) * 70 + Math.cos(frame / 17 + i * 0.7) * 50;
    const x = 200 + Math.cos(angle) * radius + Math.sin(frame / 30) * 50;
    const y = 400 + Math.sin(angle) * radius + Math.cos(frame / 25) * 40;
    return `${x},${y}`;
  });
  const blob2Points = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const radius = 280 + Math.cos(frame / 20 + i * 1.4) * 65 + Math.sin(frame / 14 + i) * 40;
    const x = 850 + Math.cos(angle) * radius + Math.cos(frame / 26) * 45;
    const y = 1400 + Math.sin(angle) * radius + Math.sin(frame / 22) * 35;
    return `${x},${y}`;
  });
  const blob3Points = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const radius = 250 + Math.sin(frame / 18 + i * 0.9) * 60;
    const x = 900 + Math.cos(angle) * radius + Math.cos(frame / 24) * 30;
    const y = 300 + Math.sin(angle) * radius + Math.sin(frame / 20) * 25;
    return `${x},${y}`;
  });

  const toSmoothPath = (points: string[]) => {
    const pts = points.map(p => p.split(",").map(Number));
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

  // === LIGHT STREAKS — cinematic diagonal lines ===
  const streaks = [
    { x: -200, y: 300, angle: -35, len: 600, speed: 60, delay: 0, color: FLOW.accent },
    { x: 400, y: -100, angle: -30, len: 500, speed: 80, delay: 20, color: FLOW.blueLight },
    { x: 800, y: 500, angle: -40, len: 700, speed: 70, delay: 40, color: FLOW.warm },
    { x: 100, y: 1200, angle: -32, len: 550, speed: 90, delay: 60, color: FLOW.accent },
  ];

  // === FLOATING ORBS — neon glow ===
  const orbs = [
    { x: 100, y: 350, size: 50, color: FLOW.accent, speed: 16, drift: 45 },
    { x: 920, y: 700, size: 40, color: FLOW.blueLight, speed: 20, drift: 55 },
    { x: 480, y: 1300, size: 45, color: FLOW.purple, speed: 14, drift: 40 },
    { x: 180, y: 1650, size: 35, color: FLOW.accent, speed: 22, drift: 50 },
    { x: 850, y: 1100, size: 30, color: FLOW.blue, speed: 18, drift: 35 },
  ];

  return (
    <>
      {/* Color blobs — pink, blue, warm */}
      <svg style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", opacity: 0.25,
      }}>
        <defs>
          <radialGradient id="fblob1">
            <stop offset="0%" stopColor={FLOW.accent} stopOpacity="0.6" />
            <stop offset="100%" stopColor={FLOW.accent} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fblob2">
            <stop offset="0%" stopColor={FLOW.blueLight} stopOpacity="0.5" />
            <stop offset="100%" stopColor={FLOW.blueLight} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fblob3">
            <stop offset="0%" stopColor={FLOW.warm} stopOpacity="0.5" />
            <stop offset="100%" stopColor={FLOW.warm} stopOpacity="0" />
          </radialGradient>
          <filter id="fblobBlur">
            <feGaussianBlur stdDeviation="55" />
          </filter>
        </defs>
        <path d={toSmoothPath(blob1Points)} fill="url(#fblob1)" filter="url(#fblobBlur)" />
        <path d={toSmoothPath(blob2Points)} fill="url(#fblob2)" filter="url(#fblobBlur)" />
        <path d={toSmoothPath(blob3Points)} fill="url(#fblob3)" filter="url(#fblobBlur)" />
      </svg>

      {/* Light streaks — cinematic */}
      {streaks.map((s, i) => {
        const progress = ((frame + s.delay) % s.speed) / s.speed;
        const streakOpacity = progress < 0.3
          ? progress / 0.3 * 0.12
          : progress < 0.7
            ? 0.12
            : (1 - progress) / 0.3 * 0.12;
        const offset = progress * 1200 - 200;
        return (
          <div key={`streak-${i}`} style={{
            position: "absolute",
            left: s.x + offset * Math.cos(s.angle * Math.PI / 180),
            top: s.y + offset * Math.sin(s.angle * Math.PI / 180),
            width: s.len,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`,
            transform: `rotate(${s.angle}deg)`,
            opacity: streakOpacity,
            pointerEvents: "none",
          }} />
        );
      })}

      {/* Floating orbs with neon glow */}
      {orbs.map((orb, i) => {
        const ox = orb.x + Math.sin((frame + i * 50) / orb.speed) * orb.drift;
        const oy = orb.y + Math.cos((frame + i * 30) / (orb.speed * 1.2)) * orb.drift * 0.8;
        const pulse = 1 + Math.sin((frame + i * 20) / 8) * 0.2;
        return (
          <div key={`orb-${i}`} style={{
            position: "absolute", left: ox, top: oy,
            width: orb.size * pulse, height: orb.size * pulse,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${orb.color}60, transparent)`,
            opacity: 0.2,
            boxShadow: `0 0 ${orb.size * 1.5}px ${orb.color}30`,
            pointerEvents: "none",
          }} />
        );
      })}

      {/* Subtle grid overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
        pointerEvents: "none",
        opacity: 0.5,
      }} />
    </>
  );
};
