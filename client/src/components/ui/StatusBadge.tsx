import type { OrderStatus } from '@shared/types';
import { getStatusClasses, getStatusLabel } from '../../lib/format';

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap ${getStatusClasses(status)}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}
