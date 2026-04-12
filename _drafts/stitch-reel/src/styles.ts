import { CSSProperties } from "react";

export const STITCH = {
  bg: "#F0F6FF",
  bgAlt: "#E4EEFF",
  card: "#FFFFFF",
  cardDark: "#1A2538",
  accent: "#4285F4",
  accentLight: "#7BABD4",
  accentDark: "#2B5EA7",
  teal: "#34A853",
  textDark: "#1A2538",
  textMuted: "#5A6A7A",
  textLight: "#FFFFFF",
  shadow: "0 12px 40px rgba(66,133,244,0.12), 0 4px 12px rgba(0,0,0,0.06)",
  shadowHeavy: "0 20px 60px rgba(66,133,244,0.2), 0 8px 24px rgba(0,0,0,0.08)",
  fontHeading: "'Rubik', sans-serif",
  fontBody: "'Heebo', sans-serif",
  cardRadius: 28,
  cardPadding: 48,
};

export const stitchBg: CSSProperties = {
  background: `linear-gradient(145deg, ${STITCH.bg} 0%, #E8F0FE 40%, ${STITCH.bgAlt} 100%)`,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: STITCH.fontBody,
  direction: "rtl",
  overflow: "hidden",
};
