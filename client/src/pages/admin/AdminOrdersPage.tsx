import type { OrderStatus } from '@shared/types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { formatBs } from '../../lib/format';

const STATUS_OPTIONS: Array<{ value: OrderStatus; label: string }> = [
  { value: 'pago_en_revision', label: 'Pago en Revisión' },
  { value: 'en_preparacion', label: 'En Preparación' },
  { value: 'en_envio', label: 'En Envío GPS' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
];

export function AdminOrdersPage() {
  const { darkMode } = useTheme();
  const { orders, rate, refresh } = useStore();
  const { token } = useAuth();
  const { showToast } = useToast();

  const changeStatus = async (id: string, status: OrderStatus) => {
    if (!token) return;
    try {
      await api.updateOrderStatus(id, status, token);
      showToast(`Estado de orden ${id} actualizado a ${status.replace(/_/g, ' ')}`, 'success');
      void refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al actualizar el estado', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Gestión de Pedidos & Envíos GPS</h2>
        <p className="text-xs font-bold text-slate-400">Los cambios se sincronizan en tiempo real con los clientes.</p>
      </div>

      <div className="space-y-4">
        {orders.length === 0 && (
          <div className="p-10 rounded-3xl border text-center text-sm font-bold text-slate-400 glass-panel">
            No hay pedidos registrados.
          </div>
        )}

        {orders.map((ord) => (
          <div
            key={ord.id}
            className={`p-5 sm:p-6 rounded-3xl border backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 glass-panel ${
              darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xl'
            }`}
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-red-500">{ord.id}</span>
                <span className="text-xs font-bold text-slate-400">• {ord.date}</span>
                <StatusBadge status={ord.status} />
              </div>
              <h4 className="font-black text-base">Cliente: {ord.customer}</h4>
              <p className="text-xs font-semibold text-slate-400 break-words">
                {ord.address} ({ord.deliveryType})
              </p>
              <p className="text-xs font-semibold text-slate-400">{ord.paymentMethod}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <div className="text-left md:text-right">
                <div className="font-black text-lg text-amber-400">${ord.total.toFixed(2)} USD</div>
                <div className="text-[10px] font-bold text-slate-400">{formatBs(ord.total, rate)}</div>
              </div>

              <select
                value={ord.status}
                onChange={(e) => void changeStatus(ord.id, e.target.value as OrderStatus)}
                className={`px-4 py-3 rounded-2xl border text-xs font-black uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
