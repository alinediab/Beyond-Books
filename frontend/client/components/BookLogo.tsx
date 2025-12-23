import React from "react";

interface BookLogoProps {
  className?: string;
  coverColor?: string;
  pageColor?: string;
  size?: number;
}

export default function BookLogo({ 
  className = "", 
  coverColor = "#4A70A9",
  pageColor = "#8FABD4",
  size = 32 
}: BookLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left page layers - fanned out */}
      <path
        d="M14 18 L14 50 L32 46 L32 26 L28 22 Z"
        fill={pageColor}
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 16 L12 48 L30 44 L30 24 L26 20 Z"
        fill={pageColor}
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <path
        d="M10 14 L10 46 L28 42 L28 22 L24 18 Z"
        fill={pageColor}
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.7"
      />
      
      {/* Right page layers - fanned out */}
      <path
        d="M50 18 L50 50 L32 46 L32 26 L36 22 Z"
        fill={pageColor}
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M52 16 L52 48 L34 44 L34 24 L38 20 Z"
        fill={pageColor}
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <path
        d="M54 14 L54 46 L36 42 L36 22 L40 18 Z"
        fill={pageColor}
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.7"
      />
      
      {/* Book cover - left side */}
      <path
        d="M14 18 L14 52 L32 48 L32 24 Q32 22 28 20 Q24 18 14 18 Z"
        fill={coverColor}
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      
      {/* Book cover - right side */}
      <path
        d="M50 18 L50 52 L32 48 L32 24 Q32 22 36 20 Q40 18 50 18 Z"
        fill={coverColor}
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      
      {/* Spine - central */}
      <rect
        x="30"
        y="18"
        width="4"
        height="34"
        fill={coverColor}
        stroke="white"
        strokeWidth="1.5"
      />
      
      {/* Spine decorative lines - horizontal curved lines */}
      <path d="M31 23 Q32 24 33 23" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M31 28 Q32 29 33 28" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M31 33 Q32 34 33 33" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M31 38 Q32 39 33 38" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M31 43 Q32 44 33 43" stroke="white" strokeWidth="1.5" fill="none" />
      
      {/* Text lines on right inner page */}
      <line x1="38" y1="30" x2="48" y2="30" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="38" y1="34" x2="48" y2="34" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
