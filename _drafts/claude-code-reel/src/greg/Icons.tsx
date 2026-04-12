import React from "react";

interface IconProps {
  size?: number;
  color?: string;
}

// Shield icon for Auto Mode
export const ShieldIcon: React.FC<IconProps> = ({ size = 80, color = "#2CBAA0" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

// Moon icon for Auto Dream
export const MoonIcon: React.FC<IconProps> = ({ size = 80, color = "#2CBAA0" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// Monitor/cursor icon for Computer Use
export const MonitorIcon: React.FC<IconProps> = ({ size = 80, color = "#2CBAA0" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <path d="M9 10l2 2 4-4" fill="none" />
  </svg>
);

// Zap icon for hook/energy
export const ZapIcon: React.FC<IconProps> = ({ size = 80, color = "#E8853D" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

// Sparkles icon for summary
export const SparklesIcon: React.FC<IconProps> = ({ size = 80, color = "#2CBAA0" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
    <path d="M19 13l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" opacity="0.7" />
    <path d="M5 17l0.7 2.1L7.8 20l-2.1 0.7L5 22.8l-0.7-2.1L2.2 20l2.1-0.7L5 17z" opacity="0.5" />
  </svg>
);
