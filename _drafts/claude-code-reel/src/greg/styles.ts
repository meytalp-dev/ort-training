import { CSSProperties } from "react";

// Greg style + Claude Code orange brand
export const GREG = {
  // Colors — Claude Code orange dominant
  bg: "#FFF5EE",            // warm cream background
  bgAlt: "#FFEDE0",         // slightly darker warm
  card: "#FFFFFF",           // white cards
  cardDark: "#2A1F1A",      // dark warm card
  accent: "#D97757",        // Claude Code brand orange
  accentLight: "#F0A47A",   // lighter orange
  accentDark: "#B85C3E",    // deeper orange
  teal: "#2CBAA0",          // secondary teal for contrast
  textDark: "#2A1F1A",      // warm dark
  textMuted: "#6A5A4A",     // warm gray
  textLight: "#FFFFFF",     // white
  shadow: "0 12px 40px rgba(217,119,87,0.12), 0 4px 12px rgba(0,0,0,0.06)",
  shadowHeavy: "0 20px 60px rgba(217,119,87,0.2), 0 8px 24px rgba(0,0,0,0.08)",

  // Typography
  fontHeading: "'Rubik', sans-serif",
  fontBody: "'Heebo', sans-serif",

  // Sizes
  cardRadius: 28,
  cardPadding: 48,
};

// Warm cream background
export const gregBg: CSSProperties = {
  background: `linear-gradient(145deg, ${GREG.bg} 0%, #FFF0E5 40%, ${GREG.bgAlt} 100%)`,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: GREG.fontBody,
  direction: "rtl",
  overflow: "hidden",
};
