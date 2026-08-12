import type { Order } from '@shared/types';
import { CheckCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';
import { formatBs } from '../../lib/format';
import { Modal } from '../ui/Modal';

interface SuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export function SuccessModal({ order, onClose }: SuccessModalProps) {
  const { darkMode } = useTheme();
  const { rate } = useStore();
  if (!order) return null;

  return (
    <Modal open={!!order} onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-6 text-center">
        <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500 rounded-3xl mx-auto flex items-center justify-center text-emerald-400 shadow-2xl shadow-emerald-500/50 animate-bounce">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black text-amber-500 uppercase tracking-widest">{order.id}</span>
          <h3 className="text-2xl font-black tracking-tight">¡Pedido Emitido con Éxito!</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tu pedido ha sido registrado en la red Pro y está siendo procesado para despacho con GPS satelital o
            retiro en tienda.
          </p>
        </div>

        <div
          className={`p-4 rounded-2xl text-left space-y-2 text-xs ${
            darkMode ? 'bg-slate-950 border border-slate-800' : 'bg-slate-50 border border-slate-200'
          }`}
        >
          <div className="flex justify-between font-bold">
            <span className="text-slate-400">Total Pagado:</span>
            <span className="text-amber-400">
              ${order.total.toFixed(2)} USD ({formatBs(order.total, rate)})
            </span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-slate-400">Método de Pago:</span>
            <span>{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-slate-400">Artículos:</span>
            <span>{order.items.reduce((a, b) => a + b.qty, 0)}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-500/30"
        >
          Ver Mis Pedidos en Vivo
        </button>
      </div>
    </Modal>
  );
}
