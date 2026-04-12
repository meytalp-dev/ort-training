import { CSSProperties } from "react";

// Pomelli pink brand tokens
export const POMELLI = {
  bg: "#FFF5F8",
  bgAlt: "#FFE8EF",
  card: "#FFFFFF",
  cardDark: "#2A1A22",
  accent: "#E8548C",
  accentLight: "#F5A0C0",
  accentDark: "#C23A6E",
  teal: "#34A853",
  textDark: "#2A1A22",
  textMuted: "#6A5A62",
  textLight: "#FFFFFF",
  shadow: "0 12px 40px rgba(232,84,140,0.12), 0 4px 12px rgba(0,0,0,0.06)",
  shadowHeavy: "0 20px 60px rgba(232,84,140,0.2), 0 8px 24px rgba(0,0,0,0.08)",
  fontHeading: "'Rubik', sans-serif",
  fontBody: "'Heebo', sans-serif",
  cardRadius: 28,
  cardPadding: 48,
};

// Soft rose background gradient
export const pomelliBg: CSSProperties = {
  background: `linear-gradient(145deg, ${POMELLI.bg} 0%, #FFE0EA 40%, ${POMELLI.bgAlt} 100%)`,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: POMELLI.fontBody,
  direction: "rtl",
  overflow: "hidden",
};
