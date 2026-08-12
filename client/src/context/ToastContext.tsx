import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { useTheme } from './ThemeContext';

type ToastType = 'success' | 'error';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { darkMode } = useTheme();
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      const timer = setTimeout(() => removeToast(id), 4500);
      timers.current.set(id, timer);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-4 rounded-2xl shadow-2xl backdrop-blur-2xl border animate-toast-slide ${
              toast.type === 'error'
                ? darkMode
                  ? 'bg-slate-950/95 border-rose-500/40 text-slate-100 shadow-rose-950/50'
                  : 'bg-white/95 border-rose-300 text-slate-900 shadow-rose-100'
                : darkMode
                  ? 'bg-slate-950/95 border-amber-500/40 text-slate-100 shadow-amber-950/50'
                  : 'bg-white/95 border-amber-300 text-slate-900 shadow-amber-100'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                toast.type === 'error'
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 pr-2">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-black tracking-widest uppercase ${
                    toast.type === 'error' ? 'text-rose-400' : 'text-amber-500'
                  }`}
                >
                  {toast.type === 'error' ? 'Alerta Corporativa' : 'Notificación Pro Elite'}
                </span>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                  aria-label="Cerrar notificación"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs font-semibold leading-relaxed mt-0.5">{toast.message}</p>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/50 overflow-hidden">
              <div
                className={`h-full animate-progress-shrink ${toast.type === 'error' ? 'bg-rose-500' : 'bg-amber-500'}`}
              />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}
