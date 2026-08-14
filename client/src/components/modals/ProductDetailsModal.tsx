import { useState } from 'react';
import type { Product } from '@shared/types';
import { Bike, Car, Minus, Plus, ShoppingCart, Star } from 'lucide-react';
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
  const [qty, setQty] = useState(1);

  if (!product) return null;
  const out = product.stock === 0;
  const subtotal = product.price * qty;

  return (
    <Modal open={!!product} onClose={onClose} maxWidth="max-w-xl">
      <div className="grid gap-5 sm:grid-cols-[260px_1fr] sm:items-start">
        {/* Imagen destacada */}
        <div className="relative h-44 sm:h-[300px] rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-xl shrink-0">
          <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
            {product.type === 'car' ? <Car className="w-3 h-3" /> : <Bike className="w-3 h-3" />}
            {product.type === 'car' ? 'Carro' : 'Moto'}
          </span>

          <span
            className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border backdrop-blur ${
              out
                ? 'bg-red-500/90 border-red-400 text-white'
                : 'bg-emerald-500/90 border-emerald-300 text-emerald-950'
            }`}
          >
            {out ? 'Agotado' : `${product.stock} un.`}
          </span>

          <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-slate-950/80 text-slate-200 text-[9px] font-bold uppercase tracking-wider border border-slate-700">
            {product.category}
          </span>

          <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-slate-950/80 text-amber-400 text-[10px] font-black flex items-center gap-1 border border-slate-700">
            <Star className="w-3 h-3 fill-amber-400" /> {product.rating.toFixed(1)}
          </span>
        </div>

        {/* Información */}
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] sm:text-xs font-black text-amber-500 tracking-wider">
            SKU · {product.sku}
          </span>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight mt-0.5">{product.name}</h3>

          <p className={`text-xs leading-relaxed mt-2.5 line-clamp-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {product.desc}
          </p>

          <div className="mt-auto pt-4">
            <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-orange-600/10 to-transparent">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-[10px] font-black text-amber-200/80 uppercase tracking-widest">USD</span>
                <span className="text-xs text-slate-400 font-bold">·</span>
                <span className="text-base sm:text-lg font-black text-amber-200">{formatBs(product.price, rate)}</span>
              </div>
              <div className="text-[9px] font-bold text-slate-400 mt-1 tracking-wider">
                Doble etiquetado dinámico USD / VES
              </div>
              <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-amber-500/25">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Subtotal · {qty} un.
                </span>
                <span className="text-xs font-black text-amber-300">
                  ${subtotal.toFixed(2)} <span className="text-slate-500">·</span> {formatBs(subtotal, rate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pie: cantidad + agregar */}
      <div className="flex items-center gap-3 mt-5">
        <div
          className={`flex items-center gap-1 p-1 rounded-2xl border ${
            darkMode ? 'border-slate-700 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={out || qty <= 1}
            className="p-2.5 rounded-xl hover:bg-slate-800/60 text-slate-300 disabled:opacity-30"
            aria-label="Reducir cantidad"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-10 text-center text-sm font-black">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            disabled={out || qty >= product.stock}
            className="p-2.5 rounded-xl hover:bg-slate-800/60 text-amber-400 disabled:opacity-30"
            aria-label="Aumentar cantidad"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => {
            addToCart(product, qty);
            onClose();
          }}
          disabled={out}
          className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-4 h-4" /> Añadir al Carrito
        </button>
      </div>
    </Modal>
  );
}