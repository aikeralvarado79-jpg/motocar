import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { RateModal } from '../../components/modals/RateModal';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';

export function RatesPage() {
  const { darkMode } = useTheme();
  const { rate, rateHistory } = useStore();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Tasas BCV & Historial de Auditoría</h2>

      <div
        className={`p-8 rounded-3xl border backdrop-blur-xl space-y-4 w-full glass-panel ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xl'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-400">Tasa Oficial BCV Vigente</div>
            <div className="text-4xl font-black text-amber-400 mt-1">
              Bs. {rate.toFixed(2)} <span className="text-sm font-bold text-slate-400">/ USD</span>
            </div>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Modificar Tasa Hoy
          </button>
        </div>
      </div>

      <div
        className={`p-6 rounded-3xl border backdrop-blur-xl space-y-4 glass-panel ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xl'
        }`}
      >
        <h3 className="font-black text-base uppercase tracking-wider">
          Histórico de Modificaciones & Trazabilidad Contable
        </h3>
        <div className="divide-y divide-slate-800/40">
          {rateHistory.length === 0 && (
            <div className="py-6 text-center text-xs font-bold text-slate-400">Sin registros de auditoría.</div>
          )}
          {rateHistory.map((rh, idx) => (
            <div key={idx} className="py-3.5 flex items-center justify-between text-xs">
              <div>
                <div className="font-black text-amber-400 text-sm">Bs. {rh.rate.toFixed(2)} / USD</div>
                <div className="text-slate-400 font-semibold">{rh.date}</div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-slate-950 text-slate-300 font-black border border-slate-800">
                Auditor: {rh.author}
              </span>
            </div>
          ))}
        </div>
      </div>

      <RateModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
