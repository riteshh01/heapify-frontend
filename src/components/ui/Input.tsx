/**
 * Input component — 2010s design system
 */

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-xs font-bold text-[#475569] dark:text-[#cbd5e1] mb-2">{label}</label>}
        <input
          ref={ref}
          className={`w-full rounded border px-4 py-2 text-sm text-[#333] dark:text-white bg-[#f8fafc] dark:bg-[#0f172a] placeholder:text-[#94a3b8] ${
            error ? "border-red-500 dark:border-red-400" : "border-[#cbd5e1] dark:border-[#334155]"
          } focus:outline-none focus:ring-1 ${error ? "focus:ring-red-500 focus:border-red-500" : "focus:ring-[#3b5998] dark:focus:ring-[#7dd3fc] focus:border-[#3b5998] dark:focus:border-[#7dd3fc]"} transition-all ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400 font-semibold">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
