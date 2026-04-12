import React from "react";

interface IconProps {
  size?: number;
  color?: string;
}

// Google Forms icon — simplified form/checklist
export const FormsIcon: React.FC<IconProps> = ({ size = 48, color = "#7b61ff" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="8" y="4" width="32" height="40" rx="4" fill={color} />
    <circle cx="17" cy="16" r="3" fill="white" />
    <rect x="23" y="14" width="12" height="4" rx="2" fill="white" opacity="0.9" />
    <circle cx="17" cy="26" r="3" fill="white" />
    <rect x="23" y="24" width="12" height="4" rx="2" fill="white" opacity="0.9" />
    <circle cx="17" cy="36" r="3" fill="white" />
    <rect x="23" y="34" width="12" height="4" rx="2" fill="white" opacity="0.9" />
  </svg>
);

// AI / Lightning bolt icon
export const AIIcon: React.FC<IconProps> = ({ size = 48, color = "#7b61ff" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M28 4L12 26h10l-4 18L44 22H32L28 4z" fill={color} />
    <path d="M28 4L12 26h10l-4 18L44 22H32L28 4z" fill="white" opacity="0.3" />
  </svg>
);

// Checkmark / celebration icon
export const CheckIcon: React.FC<IconProps> = ({ size = 48, color = "#34A853" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="20" fill={color} />
    <path d="M14 24l7 7 13-14" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Star / bonus icon
export const StarIcon: React.FC<IconProps> = ({ size = 48, color = "#F5B731" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M24 4l5.5 12.5L42 18l-9.5 8.5L35 40 24 33.5 13 40l2.5-13.5L6 18l12.5-1.5L24 4z" fill={color} />
  </svg>
);

// Key / answer key icon
export const KeyIcon: React.FC<IconProps> = ({ size = 48, color = "#F5B731" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="16" cy="28" r="10" stroke={color} strokeWidth="3" fill="none" />
    <circle cx="16" cy="28" r="4" fill={color} />
    <rect x="24" y="26" width="18" height="4" rx="2" fill={color} />
    <rect x="36" y="22" width="4" height="8" rx="1" fill={color} />
    <rect x="30" y="24" width="4" height="6" rx="1" fill={color} />
  </svg>
);

// Clipboard / quiz icon
export const QuizIcon: React.FC<IconProps> = ({ size = 48, color = "#7b61ff" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="8" y="8" width="32" height="36" rx="4" fill={color} opacity="0.15" />
    <rect x="8" y="8" width="32" height="36" rx="4" stroke={color} strokeWidth="2.5" fill="none" />
    <rect x="18" y="4" width="12" height="8" rx="3" fill={color} />
    <path d="M16 22h16M16 30h12M16 38h8" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// Question mark icon
export const QuestionIcon: React.FC<IconProps> = ({ size = 48, color = "#7b61ff" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="20" fill={color} opacity="0.15" />
    <circle cx="24" cy="24" r="20" stroke={color} strokeWidth="2.5" fill="none" />
    <text x="24" y="32" textAnchor="middle" fill={color} fontSize="26" fontWeight="bold" fontFamily="Rubik, sans-serif">?</text>
  </svg>
);
