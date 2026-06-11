/**
 * Modal component — 2010s design system
 */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
      <div className="max-w-md w-full rounded-xl bg-white dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] p-6 shadow-lg transition-colors duration-300">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#334155] dark:text-[#f1f5f9]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#64748b] dark:text-[#94a3b8] hover:text-[#334155] dark:hover:text-[#f1f5f9] transition-colors text-lg font-bold"
          >
            ✕
          </button>
        </div>
        <div className="mb-4">{children}</div>
        {footer && <div className="border-t border-[#e2e8f0] dark:border-[#334155] pt-4">{footer}</div>}
      </div>
    </div>
  );
}
