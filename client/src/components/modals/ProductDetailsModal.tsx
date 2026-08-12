import type { Product } from '@shared/types';
import { ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';
import { formatBs } from '../../lib/format';
import { Modal } from '../ui/Modal';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductDetailsModal({ product, onClose }: ProductDetailsModalProps) {
  const { darkMode } = useTheme();
  const { rate, addToCart } = useStore();

  if (!product) return null;

  return (
    <Modal open={!!product} onClose={onClose} maxWidth="max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-center">
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 h-64 sm:h-72">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl">
            {product.category}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-xs font-black text-amber-500 tracking-wider">SKU: {product.sku}</span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight mt-1">{product.name}</h3>
          </div>

          <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {product.desc}
          </p>

          <div className="pt-2">
            <div className="text-3xl font-black text-amber-400">${product.price.toFixed(2)} USD</div>
            <div className="text-xs font-black text-amber-200 mt-0.5">{formatBs(product.price, rate)}</div>
          </div>

          <div
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black border ${
              product.stock > 0
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}
          >
            {product.stock > 0 ? `Stock disponible: ${product.stock} un.` : 'Agotado'}
          </div>

          <button
            onClick={() => {
              addToCart(product);
              onClose();
            }}
            disabled={product.stock === 0}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-4 h-4" /> Añadir al Garaje
          </button>
        </div>
      </div>
    </Modal>
  );
}
