import React from 'react';

export interface LogoProps {
  /** Size in pixels for the symbol icon */
  size?: number;
  /** Visual variant */
  variant?: 'symbol' | 'horizontal' | 'stacked';
  /** Color theme */
  theme?: 'auto' | 'light' | 'dark' | 'cobalt' | 'white';
  /** Optional version or subtitle tag */
  badge?: string;
  /** Custom className for the root element */
  className?: string;
}

/**
 * Official Salvei S-Tag Dual Cut Symbol from Doop Design System 2.0
 * Geometry: Two reference tickets with waist notches, separated by -16° diagonal cut.
 */
export const SalveiSymbol: React.FC<{
  size?: number;
  className?: string;
  fillColor?: string;
  useGradient?: boolean;
}> = ({
  size = 28,
  className = '',
  fillColor,
  useGradient = true,
}) => {
  const gradientId = React.useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A4CFF" />
          <stop offset="100%" stopColor="#3032D6" />
        </linearGradient>
      </defs>
      <g transform="translate(10, 8)">
        {/* Top Ticket Piece */}
        <path
          d="M 74.4 0.0 L 79.76 0.6 C 84 2 86 6 86 11 L 86 17 C 82 20 78 24 78 32 C 78 37 81 40 85 41 L 76 43 L 26.2 55.8 C 22 57 17 56 13 52 C 8 47 6 42 6 34 L 6 27 C 9 20 16 16 23 14 L 68 2.5 Z"
          fill={fillColor || (useGradient ? `url(#${gradientId})` : 'currentColor')}
        />
        {/* Bottom Ticket Piece */}
        <path
          d="M 25.6 104.0 L 20.24 103.4 C 16 102 14 98 14 93 L 14 87 C 18 84 22 80 22 72 C 22 67 19 64 15 63 L 24 61 L 73.8 48.2 C 78 47 83 48 87 52 C 92 57 94 62 94 70 L 94 77 C 91 84 84 88 77 90 L 32 101.5 Z"
          fill={fillColor || (useGradient ? `url(#${gradientId})` : 'currentColor')}
        />
      </g>
    </svg>
  );
};

/**
 * Official Salvei Logo Lockup with Doop Design System 2.0 Identity
 */
export const Logo: React.FC<LogoProps> = ({
  size = 28,
  variant = 'horizontal',
  theme = 'auto',
  badge,
  className = '',
}) => {
  if (variant === 'symbol') {
    return <SalveiSymbol size={size} className={className} />;
  }

  const textClass =
    theme === 'white'
      ? 'text-white'
      : theme === 'light'
      ? 'text-[#181820]'
      : theme === 'dark'
      ? 'text-[#F3F4F6]'
      : 'text-[#181820] dark:text-[#F3F4F6]';

  const symbolClass =
    theme === 'white'
      ? 'text-white'
      : theme === 'cobalt'
      ? 'text-[#3C3DE3]'
      : theme === 'light'
      ? 'text-[#3C3DE3]'
      : 'text-[#3C3DE3] dark:text-[#585BFF]';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Doop Symbol Squircle or Clean Mark */}
      <SalveiSymbol size={size} className={symbolClass} />

      {/* Official Wordmark */}
      <div className="flex items-baseline gap-1.5">
        <span
          className={`font-['Plus_Jakarta_Sans',sans-serif] font-extrabold tracking-[-0.035em] leading-none ${textClass}`}
          style={{ fontSize: `${Math.round(size * 0.9)}px` }}
        >
          salvei
        </span>
        {badge && (
          <span className="font-mono text-[10px] font-semibold text-[#A8A8A6] dark:text-[#6B7280] tracking-wider uppercase">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
