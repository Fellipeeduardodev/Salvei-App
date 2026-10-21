import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  const baseStyles =
    'inline-flex items-center font-mono font-medium tracking-wider uppercase select-none transition-colors';

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 rounded',
    md: 'text-[11px] px-2 py-0.5 rounded-md',
  };

  const variantStyles = {
    neutral: 'bg-[#F1F1EF] text-[#737373] border border-[#E7E7E5]/70',
    accent: 'bg-[#4355DB]/10 text-[#4355DB] border border-[#4355DB]/20',
    success: 'bg-[#22c55e]/10 text-[#15803d] border border-[#22c55e]/20',
    warning: 'bg-[#F59E0B]/10 text-[#b45309] border border-[#F59E0B]/20',
    error: 'bg-[#EF4444]/10 text-[#b91c1c] border border-[#EF4444]/20',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
