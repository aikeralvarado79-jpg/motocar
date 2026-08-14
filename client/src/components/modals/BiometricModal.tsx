import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { Fingerprint } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface BiometricModalProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
}

type BiometricStatus = 'idle' | 'scanning' | 'success';

/**
 * Simulación de verificación biométrica passkey para pedidos VIP > $500.
 * En un entorno real se integraría WebAuthn (navigator.credentials).
 */
export function BiometricModal({ open, onClose, onVerified }: BiometricModalProps) {
  const { darkMode } = useTheme();
  const [status, setStatus] = useState<BiometricStatus>('idle');
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  const startScan = () => {
    setStatus('scanning');
    const t1 = setTimeout(() => {
      setStatus('success');
      const t2 = setTimeout(() => onVerified(), 1200);
      timers.current.push(t2);
    }, 1800);
    timers.current.push(t1);
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex overflow-y-auto p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`max-w-md w-full rounded-3xl border p-8 space-y-6 text-center shadow-2xl glass-panel m-auto max-h-[calc(100dvh-2rem)] overflow-y-auto ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="w-20 h-20 bg-amber-500/20 border-2 border-amber-500 rounded-3xl mx-auto flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-500/50">
          <Fingerprint className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black text-amber-500 uppercase tracking-widest">
            Seguridad Lujo Táctico VIP
          </span>
          <h3 className="text-2xl font-black tracking-tight">Verificación Biométrica Passkey</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Para transacciones de alto valor superiores a $500 USD, se requiere confirmación biométrica en tu
            dispositivo.
          </p>
        </div>

        {status === 'idle' && (
          <button
            onClick={startScan}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-500/30"
          >
            Escanear Huella / Passkey
          </button>
        )}

        {status === 'scanning' && (
          <div className="text-xs font-black text-amber-400 animate-pulse py-4">
            Analizando token biométrico seguro...
          </div>
        )}

        {status === 'success' && (
          <div className="text-xs font-black text-emerald-400 flex items-center justify-center gap-2 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/30">
            <Fingerprint className="w-5 h-5" /> ¡Biometría Verificada con Éxito!
          </div>
        )}

        {status !== 'idle' && (
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl border border-slate-700 text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
