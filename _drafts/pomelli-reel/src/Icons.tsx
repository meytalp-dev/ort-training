import React from "react";

interface IconProps {
  size?: number;
  color?: string;
}

// Camera icon for Photoshoot feature
export const CameraIcon: React.FC<IconProps> = ({ size = 80, color = "#E8548C" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

// Grid icon for 4 Variations (2x2 gallery)
export const GridIcon: React.FC<IconProps> = ({ size = 80, color = "#E8548C" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

// DNA icon for Business DNA (simplified double helix)
export const DNAIcon: React.FC<IconProps> = ({ size = 80, color = "#E8548C" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 15c6.667-6 13.333 0 20-6" />
    <path d="M9 3.236s1 2.764 3 2.764 3-2.764 3-2.764" />
    <path d="M2 9c6.667 6 13.333 0 20 6" />
    <path d="M9 20.764s1-2.764 3-2.764 3 2.764 3 2.764" />
    <line x1="7" y1="6" x2="17" y2="6" />
    <line x1="5" y1="12" x2="19" y2="12" />
    <line x1="7" y1="18" x2="17" y2="18" />
  </svg>
);

// Large quotation mark for Summary scene
export const QuoteIcon: React.FC<IconProps> = ({ size = 120, color = "#E8548C" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
  </svg>
);

// Star icon for benefits
export const StarIcon: React.FC<IconProps> = ({ size = 80, color = "#E8548C" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
    <path d="M19 13l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" opacity="0.7" />
    <path d="M5 17l0.7 2.1L7.8 20l-2.1 0.7L5 22.8l-0.7-2.1L2.2 20l2.1-0.7L5 17z" opacity="0.5" />
  </svg>
);

// Clock icon for speed
export const ClockIcon: React.FC<IconProps> = ({ size = 80, color = "#E8548C" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// Gift/Free icon for pricing
export const GiftIcon: React.FC<IconProps> = ({ size = 80, color = "#E8548C" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

// Cursor SVG for drag animation
export const CursorSVG: React.FC<IconProps> = ({ size = 48, color = "#2A1A22" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M5 3l14 7.5L12 13l-2.5 7.5L5 3z" />
  </svg>
);
