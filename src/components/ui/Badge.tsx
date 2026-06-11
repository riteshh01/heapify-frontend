/**
 * Badge component — 2010s design system
 */

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function Badge({ children, variant = "primary", className = "" }: BadgeProps) {
  const variantStyles = {
    primary: "bg-blue-50 dark:bg-blue-900/30 text-[#3b5998] dark:text-[#7dd3fc] border border-blue-200 dark:border-blue-500/30",
    success: "bg-[#dcfce7] dark:bg-[#064e3b]/50 text-[#166534] dark:text-[#34d399] border border-[#bbf7d0] dark:border-[#047857]",
    warning: "bg-[#fef9c3] dark:bg-[#78350f]/50 text-[#854d0e] dark:text-[#fbbf24] border border-[#fef08a] dark:border-[#b45309]",
    danger: "bg-[#fee2e2] dark:bg-[#7f1d1d]/50 text-[#991b1b] dark:text-[#f87171] border border-[#fecaca] dark:border-[#b91c1c]",
    info: "bg-[#e2e8f0] dark:bg-[#334155] text-[#475569] dark:text-[#cbd5e1] border border-[#cbd5e1] dark:border-[#475569]",
  };

  return (
    <span
      className={`inline-block rounded px-3 py-1 text-sm font-bold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
