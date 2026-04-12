import { CSSProperties } from "react";

// Google Flow — dark cinematic theme (opposite of Claude Code warm cream)
export const FLOW = {
  // Colors — dark + neon accents
  bg: "#0A0A1A",              // deep dark blue-black
  bgAlt: "#0F0F2A",           // slightly lighter
  card: "rgba(255,255,255,0.06)", // dark glassmorphism
  cardBorder: "rgba(255,255,255,0.12)",
  accent: "#ffbdf5",          // Flow pink
  accentDark: "#d98fd0",      // deeper pink
  blue: "#185ccc",            // Flow banner blue
  blueLight: "#94b1c9",       // cool blob
  warm: "#cbae92",            // warm blob
  purple: "#8B5CF6",          // vivid purple
  teal: "#2CBAA0",            // teal for Google brand touch
  textLight: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.55)",
  textDim: "rgba(255,255,255,0.35)",
  shadow: "0 12px 40px rgba(0,0,0,0.4), 0 0 60px rgba(255,189,245,0.08)",
  shadowHeavy: "0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(255,189,245,0.12)",

  // Typography
  fontHeading: "'Rubik', sans-serif",
  fontBody: "'Heebo', sans-serif",

  // Sizes
  cardRadius: 28,
  cardPadding: 48,
};

// Dark cinematic background
export const flowBg: CSSProperties = {
  background: `radial-gradient(ellipse at 30% 20%, ${FLOW.bgAlt} 0%, ${FLOW.bg} 50%, #050510 100%)`,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: FLOW.fontBody,
  direction: "rtl",
  overflow: "hidden",
};
