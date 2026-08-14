import type { Product } from '@shared/types';
import { Eye, ShoppingBag, Star } from 'lucide-react';
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
      className={`rounded-2xl sm:rounded-3xl border overflow-hidden flex flex-col justify-between glass-panel group ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-lg shadow-slate-200/50'
      }`}
    >
      <div>
        <div className="relative h-24 sm:h-44 lg:h-56 overflow-hidden bg-slate-950">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1 sm:gap-2">
            <span
              className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-lg ${
                product.type === 'car' ? 'bg-blue-600 text-white' : 'bg-amber-600 text-white'
              }`}
            >
              {product.type === 'car' ? 'Carro' : 'Moto'}
            </span>
            {product.badge && (
              <span className="hidden sm:inline-flex px-3 py-1 rounded-xl text-[10px] font-black bg-red-600 text-white shadow-lg animate-pulse">
                {product.badge}
              </span>
            )}
          </div>

          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between text-xs">
            <span className="hidden sm:block px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md text-slate-300 font-bold uppercase text-[10px]">
              {product.category}
            </span>
            <span
              className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg font-black text-[9px] sm:text-[10px] border ${
                product.stock > 0
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}
            >
              {product.stock > 0 ? `Stock: ${product.stock} un.` : 'Agotado'}
            </span>
          </div>
        </div>

        <div className="p-3 sm:p-5 space-y-1.5 sm:space-y-2">
          <div className="text-[10px] sm:text-[11px] font-black text-amber-500 tracking-wider">
            SKU: {product.sku}
          </div>
          <h3 className="font-black text-xs sm:text-base line-clamp-1 group-hover:text-amber-400 transition-colors duration-200">
            {product.name}
          </h3>
          <p className={`hidden sm:block text-xs line-clamp-2 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {product.desc}
          </p>

          <div className="pt-1.5 sm:pt-2 flex items-center justify-between gap-1 border-t border-slate-800/40 mt-2 sm:mt-3">
            <div className="min-w-0">
              <div className="text-sm sm:text-xl font-black text-amber-500">${product.price.toFixed(2)} USD</div>
              <div className={`text-[10px] sm:text-xs font-extrabold truncate ${darkMode ? 'text-amber-400/90' : 'text-amber-700'}`}>
                {formatBs(product.price, rate)}
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1.5 rounded-xl border border-amber-500/20">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span>{product.rating}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-5 pt-0 flex flex-col sm:flex-row items-stretch gap-1.5 sm:gap-2">
        <button
          onClick={() => onInspect(product)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 sm:py-3 rounded-xl sm:rounded-2xl border text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-200 ${
            darkMode
              ? 'border-slate-800 hover:bg-slate-800 text-slate-300'
              : 'border-slate-200 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Inspeccionar</span>
        </button>
        <button
          onClick={() => addToCart(product)}
          disabled={product.stock === 0}
          className="flex-1 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-xl shadow-amber-500/20 transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {product.stock === 0 ? 'Agotado' : 'Comprar'}
        </button>
      </div>
    </div>
  );
}
