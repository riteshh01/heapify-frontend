/**
 * Button component — 2010s design system
 */

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const baseStyles =
      "font-bold rounded transition-colors inline-flex items-center justify-center gap-2 shadow-sm";

    const variantStyles = {
      primary: "bg-[#3b5998] dark:bg-[#2563eb] text-white hover:bg-[#2d4373] dark:hover:bg-[#1d4ed8]",
      secondary: "bg-[#e2e8f0] dark:bg-[#334155] text-[#475569] dark:text-[#cbd5e1] hover:bg-[#cbd5e1] dark:hover:bg-[#475569] border border-[#cbd5e1] dark:border-[#475569]",
      danger: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800",
    };

    const sizeStyles = {
      sm: "px-3 py-1 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} disabled:opacity-50 disabled:cursor-not-allowed`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <span className="animate-spin">⌛</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
