import type { Product } from '@shared/types';
import { ShoppingBag, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import { formatBs } from '../lib/format';

interface ProductCardProps {
  product: Product;
  onInspect: (product: Product) => void;
}

export function ProductCard({ product, onInspect }: ProductCardProps) {
  const { darkMode } = useTheme();
  const { rate, addToCart } = useStore();

  return (
    <div
      className={`rounded-3xl border overflow-hidden flex flex-col justify-between glass-panel group ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-lg shadow-slate-200/50'
      }`}
    >
      <div>
        <div className="relative h-56 overflow-hidden bg-slate-950">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

          <div className="absolute top-3 left-3 flex gap-2">
            <span
              className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg ${
                product.type === 'car' ? 'bg-blue-600 text-white' : 'bg-amber-600 text-white'
              }`}
            >
              {product.type === 'car' ? 'Carro' : 'Moto'}
            </span>
            {product.badge && (
              <span className="px-3 py-1 rounded-xl text-[10px] font-black bg-red-600 text-white shadow-lg animate-pulse">
                {product.badge}
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md text-slate-300 font-bold uppercase text-[10px]">
              {product.category}
            </span>
            <span
              className={`px-2.5 py-1 rounded-lg font-black text-[10px] border ${
                product.stock > 0
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}
            >
              {product.stock > 0 ? `Stock: ${product.stock} un.` : 'Agotado'}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-2">
          <div className="text-[11px] font-black text-amber-500 tracking-wider">
            SKU: {product.sku}
          </div>
          <h3 className="font-black text-base line-clamp-1 group-hover:text-amber-400 transition-colors duration-200">
            {product.name}
          </h3>
          <p className={`text-xs line-clamp-2 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {product.desc}
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800/40 mt-3">
            <div>
              <div className="text-xl font-black text-amber-500">${product.price.toFixed(2)} USD</div>
              <div className={`text-xs font-extrabold ${darkMode ? 'text-amber-400/90' : 'text-amber-700'}`}>
                {formatBs(product.price, rate)}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1.5 rounded-xl border border-amber-500/20">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span>{product.rating}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0 flex items-center gap-2">
        <button
          onClick={() => onInspect(product)}
          className={`flex-1 py-3 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all duration-200 ${
            darkMode
              ? 'border-slate-800 hover:bg-slate-800 text-slate-300'
              : 'border-slate-200 hover:bg-slate-100 text-slate-700'
          }`}
        >
          Inspeccionar
        </button>
        <button
          onClick={() => addToCart(product)}
          disabled={product.stock === 0}
          className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/20 transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingBag className="w-4 h-4" /> {product.stock === 0 ? 'Agotado' : 'Comprar'}
        </button>
      </div>
    </div>
  );
}
