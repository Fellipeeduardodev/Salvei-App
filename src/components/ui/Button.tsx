import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'secondary',
      size = 'md',
      iconLeft,
      iconRight,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-[#4355DB] focus-visible:ring-offset-2';

    const sizeStyles = {
      sm: 'text-xs px-2.5 py-1.5 rounded-md gap-1.5',
      md: 'text-[13px] px-3.5 py-2 rounded-md gap-2',
      lg: 'text-sm px-4 py-2.5 rounded-md gap-2.5',
    };

    const variantStyles = {
      primary:
        'bg-[#171717] hover:bg-[#262626] dark:bg-[#F3F4F6] dark:hover:bg-[#E5E7EB] text-white dark:text-[#111214] border border-transparent shadow-sm',
      accent:
        'bg-[#4355DB] hover:bg-[#3646B8] text-white border border-transparent shadow-sm',
      secondary:
        'bg-white dark:bg-[#191B20] hover:bg-[#F1F1EF] dark:hover:bg-[#242832] text-[#171717] dark:text-[#F3F4F6] border border-[#E7E7E5] dark:border-[#2D3139] hover:border-[#D4D4D0] dark:hover:border-[#3E434D] shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
      ghost:
        'bg-transparent hover:bg-[#F1F1EF] dark:hover:bg-[#242832] text-[#737373] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-[#F3F4F6] border border-transparent',
      destructive:
        'bg-[#EF4444] hover:bg-[#DC2626] text-white border border-transparent shadow-sm',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {iconLeft && <span className="flex-shrink-0">{iconLeft}</span>}
        <span>{children}</span>
        {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
