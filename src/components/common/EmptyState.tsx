/**
 * Empty State component — 2010s design system
 * Shows when no data is available
 */

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon = "📭", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-4xl">{icon}</div>
      <h3 className="mt-4 text-lg font-bold text-[#334155] dark:text-[#f1f5f9]">{title}</h3>
      <p className="mt-2 text-sm text-[#64748b] dark:text-[#94a3b8]">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 rounded bg-[#3b5998] dark:bg-[#2563eb] px-4 py-2 text-white font-bold text-sm hover:bg-[#2d4373] dark:hover:bg-[#1d4ed8] transition-all shadow-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
