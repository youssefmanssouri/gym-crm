import React from 'react';

interface BrandLogoProps {
  /**
   * Dimension size in pixels or standard token.
   * Defaults to 36px (matching standard app headers).
   */
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /**
   * If true, renders within an athletic squircle container.
   * Useful for headers, avatars, and card badges.
   */
  withContainer?: boolean;
  containerClassName?: string;
  'aria-label'?: string;
}

const SIZE_MAP = {
  xs: 20,
  sm: 28,
  md: 36,
  lg: 48,
  xl: 64,
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  withContainer = false,
  containerClassName = '',
  'aria-label': ariaLabel = 'Apex Gym Brand Logo',
}) => {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 36;

  const svgContent = (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label={ariaLabel}
      role="img"
    >
      {/* Outer Athletic Shield Contour */}
      <path
        d="M24 4L7 10V22.5C7 33.2 14.3 42.8 24 45.5C33.7 42.8 41 33.2 41 22.5V10L24 4Z"
        fill="#09090b"
        stroke="#06b6d4"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Upper Apex Mountain / Performance Peak ("A" Monogram) */}
      <path
        d="M24 10.5L14.5 27H19.5L24 18.5L28.5 27H33.5L24 10.5Z"
        fill="#22d3ee"
      />
      {/* Olympic Barbell Shaft */}
      <path
        d="M10 27H38"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Precision Weight Plates Left */}
      <rect x="11.5" y="21" width="3" height="12" rx="1" fill="#ffffff" />
      <rect x="15.5" y="23" width="2" height="8" rx="0.75" fill="#38bdf8" />
      {/* Precision Weight Plates Right */}
      <rect x="30.5" y="23" width="2" height="8" rx="0.75" fill="#38bdf8" />
      <rect x="33.5" y="21" width="3" height="12" rx="1" fill="#ffffff" />
      {/* Lower Athletic Power Chevron */}
      <path
        d="M24 32.5L28.5 38.5H19.5L24 32.5Z"
        fill="#06b6d4"
      />
    </svg>
  );

  if (withContainer) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 shadow-md shadow-cyan-500/10 ${containerClassName}`}
        style={{ width: pixelSize + 8, height: pixelSize + 8 }}
      >
        {svgContent}
      </div>
    );
  }

  return svgContent;
};

export default BrandLogo;
