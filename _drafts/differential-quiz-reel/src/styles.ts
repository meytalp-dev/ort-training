import { CSSProperties } from "react";

// Learni brand colors — lavender/mint/sky
export const STYLE = {
  // Colors — Learni palette
  bg: "#F5F0FF",              // soft lavender background
  bgAlt: "#EDE5FF",           // slightly deeper lavender
  card: "#FFFFFF",             // white cards
  cardDark: "#2A1F3A",        // dark purple card

  // Learni brand accents
  mint: "#7dd4ac",
  lavender: "#b8a9d4",
  skyBlue: "#7babd4",
  pink: "#e8a0b4",

  // Functional
  accent: "#7babd4",          // sky blue as primary accent
  accentLight: "#a3c5e0",
  accentDark: "#5a8ab8",

  // Before/After
  redBefore: "#e57373",       // soft red for "before"
  redBeforeBg: "#FFF0F0",     // light red background
  greenAfter: "#66bb6a",      // green for "after"
  greenAfterBg: "#F0FFF0",    // light green background

  teal: "#7dd4ac",            // mint as secondary
  textDark: "#2A1F3A",
  textMuted: "#6A5A8A",
  textLight: "#FFFFFF",

  shadow: "0 12px 40px rgba(123,171,212,0.12), 0 4px 12px rgba(0,0,0,0.06)",
  shadowHeavy: "0 20px 60px rgba(123,171,212,0.2), 0 8px 24px rgba(0,0,0,0.08)",

  // Typography
  fontHeading: "'Rubik', sans-serif",
  fontBody: "'Heebo', sans-serif",
  fontHandwriting: "'Playpen Sans Hebrew', 'Rubik', sans-serif",

  // Sizes
  cardRadius: 28,
  cardPadding: 48,
};

// Soft lavender background
export const bgStyle: CSSProperties = {
  background: `linear-gradient(145deg, ${STYLE.bg} 0%, #EEE8FF 40%, ${STYLE.bgAlt} 100%)`,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: STYLE.fontBody,
  direction: "rtl",
  overflow: "hidden",
};
