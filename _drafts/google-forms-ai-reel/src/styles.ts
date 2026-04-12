import { CSSProperties } from "react";

// Google Forms + AI tip reel — purple/green palette
export const STYLE = {
  // Colors — Google purple dominant
  bg: "#F5F0FF",            // soft lavender background
  bgAlt: "#EDE5FF",         // slightly deeper lavender
  card: "#FFFFFF",           // white cards
  cardDark: "#1A1530",      // dark purple card
  accent: "#7b61ff",        // Google purple
  accentLight: "#a78bfa",   // lighter purple
  accentDark: "#5b3fd4",    // deeper purple
  green: "#34A853",         // Google green
  greenLight: "#7dd4ac",    // mint green (Learni)
  skyBlue: "#7babd4",       // sky blue (Learni)
  gold: "#F5B731",          // golden for bonus tip
  goldLight: "#FCEABB",     // light gold
  textDark: "#1A1530",      // dark purple-black
  textMuted: "#5A4A7A",     // muted purple
  textLight: "#FFFFFF",     // white
  shadow: "0 12px 40px rgba(123,97,255,0.12), 0 4px 12px rgba(0,0,0,0.06)",
  shadowHeavy: "0 20px 60px rgba(123,97,255,0.2), 0 8px 24px rgba(0,0,0,0.08)",

  // Typography
  fontHeading: "'Rubik', sans-serif",
  fontBody: "'Heebo', sans-serif",
  fontHandwriting: "'Playpen Sans Hebrew', 'Rubik', sans-serif",

  // Sizes
  cardRadius: 28,
  cardPadding: 48,
};

// Soft lavender background gradient
export const bgStyle: CSSProperties = {
  background: `linear-gradient(145deg, ${STYLE.bg} 0%, #F0EAFF 40%, ${STYLE.bgAlt} 100%)`,
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
