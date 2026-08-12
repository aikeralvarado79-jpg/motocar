/**
 * Formato de moneda y utilidades de texto.
 */
import type { OrderStatus } from '@shared/types';

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)} USD`;
}

export function formatBs(usdAmount: number, rate: number): string {
  return `Bs. ${(usdAmount * rate).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pago_en_revision: 'Pago en Revisión',
  en_preparacion: 'En Preparación',
  en_envio: 'En Envío GPS',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export function getStatusLabel(status: OrderStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function getStatusClasses(status: OrderStatus): string {
  switch (status) {
    case 'entregado':
      return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
    case 'en_envio':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/40';
    case 'cancelado':
      return 'bg-rose-500/20 text-rose-400 border border-rose-500/40';
    case 'pago_en_revision':
      return 'bg-purple-500/20 text-purple-400 border border-purple-500/40';
    default:
      return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
  }
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pagomovil: 'Pago Móvil / Zelle',
  credito: 'Crédito Inmediato',
  efectivo: 'Efectivo / Divisas',
};
