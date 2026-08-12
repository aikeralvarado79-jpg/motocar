import { Download, TrendingDown, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { formatBs } from '../../lib/format';

export function FinancePage() {
  const { darkMode } = useTheme();
  const { transactions, rate, stats, refresh } = useStore();
  const { token } = useAuth();
  const { showToast } = useToast();

  const exportCsv = async () => {
    if (!token) return;
    const rows = await api.transactions(token);
    const header = ['ID', 'Referencia', 'Tipo', 'Categoría', 'Fecha', 'Monto (USD)'];
    const lines = rows.map((t) =>
      [t.id, t.ref, t.type === 'income' ? 'Ingreso' : 'Egreso', t.category, t.date, t.amount.toFixed(2)]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    );
    const csv = [header.join(','), ...lines].join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-financiero-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Reporte financiero corporativo exportado con éxito', 'success');
    void refresh();
  };

  const income = stats?.monthIncome ?? 0;
  const expenses = stats?.monthExpenses ?? 0;
  const margin = stats?.netMargin ?? 0;

  const summary = [
    { title: 'Ingresos Totales (Mes)', value: `$${income.toFixed(2)}`, sub: formatBs(income, rate), color: 'text-emerald-400', icon: TrendingUp },
    { title: 'Inversiones & Egresos', value: `$${expenses.toFixed(2)}`, sub: formatBs(expenses, rate), color: 'text-rose-400', icon: TrendingDown },
    { title: 'Margen de Utilidad Neto', value: `${margin.toFixed(1)}%`, sub: margin >= 0 ? 'Rentabilidad óptima' : 'Margen negativo', color: 'text-amber-400', icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Módulo Financiero Pro (USD / VES)</h2>
          <p className="text-xs font-bold text-slate-400">Ingresos, inversiones y trazabilidad contable multimoneda.</p>
        </div>
        <button
          onClick={() => void exportCsv()}
          className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center gap-2 glass-panel"
        >
          <Download className="w-4 h-4" /> Exportar Reporte Ejecutivo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {summary.map(({ title, value, sub, color, icon: Icon }, i) => (
          <div
            key={i}
            className={`p-6 rounded-3xl border backdrop-blur-xl glass-panel ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">{title}</div>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className={`text-3xl font-black ${color}`}>{value}</div>
            <div className="text-xs font-bold text-slate-400 mt-2">{sub}</div>
          </div>
        ))}
      </div>

      <div
        className={`p-5 sm:p-6 rounded-3xl border backdrop-blur-xl glass-panel ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}
      >
        <h3 className="font-black text-base mb-4">Registro de Movimientos Financieros</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="pb-3 font-black uppercase tracking-wider">ID / Ref</th>
                <th className="pb-3 font-black uppercase tracking-wider">Tipo</th>
                <th className="pb-3 font-black uppercase tracking-wider">Categoría</th>
                <th className="pb-3 font-black uppercase tracking-wider">Fecha</th>
                <th className="pb-3 font-black uppercase tracking-wider text-right">Monto (USD / VES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {transactions.map((trx) => (
                <tr key={trx.id}>
                  <td className="py-4 font-black">
                    {trx.id} <span className="text-slate-400 font-semibold">({trx.ref})</span>
                  </td>
                  <td className="py-4">
                    <span
                      className={`px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider ${
                        trx.type === 'income'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {trx.type === 'income' ? 'Ingreso' : 'Egreso'}
                    </span>
                  </td>
                  <td className="py-4 font-bold">{trx.category}</td>
                  <td className="py-4 font-semibold text-slate-400">{trx.date}</td>
                  <td className={`py-4 text-right font-black ${trx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trx.type === 'income' ? '+' : '-'}${trx.amount.toFixed(2)} USD
                    <div className="text-[10px] text-slate-400 font-bold">{formatBs(trx.amount, rate)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
