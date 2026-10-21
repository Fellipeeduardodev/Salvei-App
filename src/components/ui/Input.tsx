import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ iconLeft, iconRight, error, className = '', disabled, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {iconLeft && (
          <div className="absolute left-3 flex items-center pointer-events-none text-[#737373]">
            {iconLeft}
          </div>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={`w-full h-9 rounded-md bg-white text-[#171717] placeholder-[#A8A8A6] text-[13px] border transition-all duration-150 outline-none
            ${iconLeft ? 'pl-9' : 'pl-3'}
            ${iconRight ? 'pr-9' : 'pr-3'}
            ${
              error
                ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20'
                : 'border-[#E7E7E5] hover:border-[#D4D4D0] focus:border-[#4355DB] focus:ring-2 focus:ring-[#4355DB]/20'
            }
            disabled:bg-[#F8F8F6] disabled:text-[#A8A8A6] disabled:cursor-not-allowed
            ${className}`}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-3 flex items-center pointer-events-none text-[#737373]">
            {iconRight}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
