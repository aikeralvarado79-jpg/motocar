import { useEffect, useRef, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { fetchServerVersion, getStoredVersion, storeVersion } from '../../lib/appVersion';

const POLL_INTERVAL = 60_000;

export function UpdateBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [applying, setApplying] = useState(false);
  const { darkMode } = useTheme();
  const dismissed = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval>;

    async function check() {
      const serverVersion = await fetchServerVersion();
      if (cancelled || !serverVersion) return;

      const stored = getStoredVersion();

      if (stored === null) {
        // Primer uso en este dispositivo: fijamos la versión base sin avisar.
        storeVersion(serverVersion);
        return;
      }

      if (stored !== serverVersion && !dismissed.current) {
        setUpdateAvailable(true);
        if (navigator.vibrate) navigator.vibrate(150);
      }
    }

    function onVisible() {
      if (document.visibilityState === 'visible') void check();
    }

    void check();
    timer = setInterval(() => void check(), POLL_INTERVAL);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  async function applyUpdate() {
    if (applying) return;
    setApplying(true);
    const serverVersion = await fetchServerVersion();
    storeVersion(serverVersion ?? '');
    window.location.reload();
  }

  if (!updateAvailable) return null;

  return (
    <div
      className={`update-banner w-full border-b backdrop-blur-xl ${
        darkMode
          ? 'bg-gradient-to-r from-amber-600/95 to-orange-700/95 border-amber-500/40 text-slate-950'
          : 'bg-gradient-to-r from-amber-500 to-orange-600 border-amber-600/40 text-slate-950'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex items-center gap-3">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950" />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-black tracking-wider uppercase">Nueva versión disponible</p>
          <p className="text-[11px] font-semibold opacity-90 truncate">
            Hay cambios nuevos en la aplicación. Actualizá para aplicar las mejoras.
          </p>
        </div>

        <button
          onClick={applyUpdate}
          disabled={applying}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 text-amber-400 text-xs font-black uppercase tracking-wider shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${applying ? 'animate-spin' : ''}`} />
          {applying ? 'Actualizando…' : 'Actualizar'}
        </button>

        <button
          onClick={() => {
            dismissed.current = true;
            setUpdateAvailable(false);
          }}
          className="p-1.5 rounded-lg hover:bg-slate-950/10 transition-colors text-slate-950/80 shrink-0"
          aria-label="Descartar aviso de actualización"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}