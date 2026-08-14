import { useNavigate } from 'react-router-dom';
import { Clock, DollarSign, Package, RefreshCw, TrendingUp } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';
import { formatBs } from '../../lib/format';

export function DashboardPage() {
  const { darkMode } = useTheme();
  const { stats, rate } = useStore();
  const navigate = useNavigate();

  if (!stats) {
    return <div className="text-sm font-bold text-slate-400">Cargando métricas...</div>;
  }

  const cards = [
    { title: 'Ventas Totales (Mes)', value: `$${stats.monthIncome.toFixed(2)}`, change: formatBs(stats.monthIncome, rate), icon: TrendingUp, color: 'text-emerald-400' },
    { title: 'Pedidos en Tránsito', value: String(stats.pendingOrders), change: 'GPS Activo', icon: Clock, color: 'text-amber-400' },
    { title: 'Stock Global Piezas', value: String(stats.totalStock), change: `${stats.totalProducts} SKUs protegidos`, icon: Package, color: 'text-blue-400' },
    { title: 'Tasa Vigente', value: `Bs. ${rate.toFixed(2)}`, change: 'Actualizado Hoy', icon: DollarSign, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Dashboard General Pro</h2>
          <p className="text-xs font-bold text-slate-400">Control operativo, métricas en tiempo real y tasa activa.</p>
        </div>
        <button
          onClick={() => navigate('/admin/rates')}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 flex items-center gap-2 glass-panel"
        >
          <RefreshCw className="w-4 h-4" /> Actualizar Tasa
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`p-6 rounded-3xl border backdrop-blur-xl flex items-center justify-between glass-panel ${
                darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xl'
              }`}
            >
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">{stat.title}</div>
                <div className="text-2xl font-black mb-1">{stat.value}</div>
                <div className={`text-[11px] font-black ${stat.color}`}>{stat.change}</div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-inner shrink-0">
                <Icon className="w-7 h-7" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
