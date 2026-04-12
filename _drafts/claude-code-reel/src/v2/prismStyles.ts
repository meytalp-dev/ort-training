import { CSSProperties } from "react";

// === PRISM Style — prismatic gradient palette ===
export const PRISM = {
  // Gradient endpoints
  indigo: "#6366F1",
  teal: "#14B8A6",
  rose: "#EC4899",
  violet: "#8B5CF6",
  sky: "#38BDF8",
  amber: "#F59E0B",

  // Neutrals
  bg: "#FAFAF9",
  bgAlt: "#F5F3FF",      // faint lavender
  bgMint: "#F0FDFA",     // faint mint
  card: "#FFFFFF",
  textDark: "#1E1B4B",   // deep indigo-black
  textMuted: "#6B7280",
  textLight: "#FFFFFF",

  // Shadows
  shadow: "0 12px 40px rgba(99,102,241,0.10), 0 4px 12px rgba(0,0,0,0.05)",
  shadowDeep: "0 24px 60px rgba(99,102,241,0.15), 0 8px 20px rgba(0,0,0,0.06)",

  // Typography
  fontHeading: "'Rubik', sans-serif",
  fontBody: "'Heebo', sans-serif",

  cardRadius: 24,
};

// Gradient helpers
export const prismGradient = `linear-gradient(135deg, ${PRISM.indigo}, ${PRISM.teal}, ${PRISM.rose})`;
export const prismGradientSoft = `linear-gradient(135deg, ${PRISM.violet}20, ${PRISM.teal}15, ${PRISM.rose}10)`;

export const prismBg: CSSProperties = {
  background: `linear-gradient(160deg, ${PRISM.bg} 0%, ${PRISM.bgAlt} 35%, ${PRISM.bgMint} 65%, ${PRISM.bg} 100%)`,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: PRISM.fontBody,
  direction: "rtl",
  overflow: "hidden",
};
