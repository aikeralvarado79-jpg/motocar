import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  title?: string;
}

export function Modal({ open, onClose, children, maxWidth = 'max-w-md', title }: ModalProps) {
  const { darkMode } = useTheme();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex overflow-y-auto p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`${maxWidth} w-full rounded-3xl border p-6 sm:p-8 shadow-2xl glass-panel relative m-auto max-h-[calc(100dvh-2rem)] overflow-y-auto ${
          darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          {title ? <h3 className="text-xl font-black tracking-tight pr-6">{title}</h3> : <span />}
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}