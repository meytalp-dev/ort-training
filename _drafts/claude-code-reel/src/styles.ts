import { CSSProperties } from "react";

export const COLORS = {
  bgCream: "#FFF8EE",
  bgTeal: "#E0F5F0",
  bgOrange: "#FFF0E0",
  tealDark: "#1a3a3a",
  tealMid: "#2a8a8a",
  tealLight: "#40B5A0",
  tealAccent: "#2CBAA0",
  skyBlue: "#89CFF0",
  orange: "#E8853D",
  orangeLight: "#F5A623",
  cardDark: "#1e2d2d",
  cardWhite: "#ffffff",
  white: "#ffffff",
  gold: "#C9A96E",
  red: "#e74c3c",
  green: "#27ae60",
  textDark: "#2a2a3a",
  textMuted: "#5a5a6a",
  textLight: "#8a8a9a",
  pink: "#F5A0C0",
};

export const FONTS = {
  heading: "'Rubik', 'Heebo', sans-serif",
  body: "'Heebo', 'Rubik', sans-serif",
};

export const bgGradient: CSSProperties = {
  background: `linear-gradient(145deg, #FFFFFF 0%, ${COLORS.bgTeal} 30%, ${COLORS.bgCream} 55%, ${COLORS.bgOrange} 80%, rgba(232,133,61,0.08) 100%)`,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: FONTS.body,
  direction: "rtl",
};

export const cardStyle: CSSProperties = {
  background: COLORS.cardWhite,
  borderRadius: 24,
  padding: 32,
  boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
  width: "85%",
  maxWidth: 900,
};

export const darkCardStyle: CSSProperties = {
  ...cardStyle,
  background: COLORS.cardDark,
  border: `1px solid rgba(44,186,160,0.25)`,
  boxShadow: "0 20px 60px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.15)",
};
