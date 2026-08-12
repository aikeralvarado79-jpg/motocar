import { Package } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import { formatBs } from '../lib/format';

export function OrdersPage() {
  const { darkMode } = useTheme();
  const { orders, rate } = useStore();

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Historial de Mis Pedidos</h2>

      {orders.length === 0 ? (
        <div className={`p-12 rounded-3xl border text-center glass-panel ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
          <Package className="w-16 h-16 mx-auto text-slate-500 mb-4" />
          <p className="text-sm font-bold text-slate-400">No tienes pedidos activos todavía.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className={`p-5 sm:p-6 rounded-3xl border space-y-4 backdrop-blur-xl glass-panel ${
                darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xl'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-black text-amber-500">{ord.id}</span>
                  <h4 className="font-black text-sm">{ord.date}</h4>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <StatusBadge status={ord.status} />
                  <div className="text-right">
                    <div className="font-black text-base text-amber-400">${ord.total.toFixed(2)} USD</div>
                    <div className="text-[10px] font-bold text-amber-200">{formatBs(ord.total, rate)}</div>
                  </div>
                </div>
              </div>

              <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                {ord.customer} · {ord.paymentMethod}
              </div>

              <div className="space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">Componentes Adquiridos:</div>
                {ord.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-bold gap-4">
                    <span className="truncate">
                      {item.qty}x {item.name}
                    </span>
                    <span className="text-amber-400 whitespace-nowrap">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="text-[11px] font-semibold text-slate-400">{ord.address}</div>

              {ord.status === 'en_envio' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
                    <div>
                      <span className="font-black text-slate-200">
                        Motorizado GPS: <strong>{ord.driver}</strong>
                      </span>
                      <div className="text-[10px] text-slate-400">Llegada estimada en {ord.eta}</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-blue-600/20 text-blue-400 font-black border border-blue-500/30 whitespace-nowrap">
                    Rastreo en Vivo
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
