import type { Product } from '@shared/types';
import { ShoppingCart } from 'lucide-react';
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
    <Modal open={!!product} onClose={onClose} maxWidth="max-w-lg">
      <div className="flex items-start gap-4">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[8px] font-black uppercase tracking-wider">
            {product.type === 'car' ? 'Carro' : 'Moto'}
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <span className="text-[10px] sm:text-xs font-black text-amber-500 tracking-wider">
              SKU: {product.sku}
            </span>
            <h3 className="text-lg sm:text-xl font-black tracking-tight leading-tight mt-0.5">{product.name}</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                product.stock > 0
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}
            >
              {product.stock > 0 ? `Stock: ${product.stock} un.` : 'Agotado'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 text-[10px] font-black uppercase tracking-wider border border-slate-800">
              {product.category}
            </span>
          </div>

          <div>
            <div className="text-xl sm:text-2xl font-black text-amber-400">${product.price.toFixed(2)} USD</div>
            <div className="text-xs font-black text-amber-200 mt-0.5">{formatBs(product.price, rate)}</div>
          </div>
        </div>
      </div>

      <p className={`text-xs leading-relaxed mt-4 line-clamp-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
        {product.desc}
      </p>

      <button
        onClick={() => {
          addToCart(product);
          onClose();
        }}
        disabled={product.stock === 0}
        className="mt-5 w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ShoppingCart className="w-4 h-4" /> Añadir al Carrito
      </button>
    </Modal>
  );
}