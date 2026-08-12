import { useState } from 'react';
import type { Product } from '@shared/types';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { ProductFormModal } from '../../components/modals/ProductFormModal';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { formatBs } from '../../lib/format';

export function ProductsPage() {
  const { darkMode } = useTheme();
  const { products, rate, refresh } = useStore();
  const { token } = useAuth();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const handleDelete = async (product: Product) => {
    if (!token) return;
    if (!window.confirm(`¿Eliminar "${product.name}" del inventario?`)) return;
    try {
      await api.deleteProduct(product.id, token);
      showToast('Repuesto eliminado del inventario', 'success');
      void refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al eliminar', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Catálogo & Inventario CRUD</h2>
          <p className="text-xs font-bold text-slate-400">Gestión avanzada con doble etiquetado de precios.</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="px-5 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-red-600/30 flex items-center gap-2 glass-panel"
        >
          <Plus className="w-4 h-4" /> Nuevo Repuesto Pro
        </button>
      </div>

      <div
        className={`rounded-3xl border overflow-hidden backdrop-blur-xl glass-panel ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xl'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-slate-800 bg-slate-950/60 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                <th className="p-4 font-black uppercase tracking-wider">Repuesto</th>
                <th className="p-4 font-black uppercase tracking-wider">SKU</th>
                <th className="p-4 font-black uppercase tracking-wider">Tipo / Categoría</th>
                <th className="p-4 font-black uppercase tracking-wider">Precio USD / VES</th>
                <th className="p-4 font-black uppercase tracking-wider">Stock</th>
                <th className="p-4 font-black uppercase tracking-wider text-right">Acciones Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} loading="lazy" className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0" />
                      <span className="font-black">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-amber-400 font-bold">{p.sku}</td>
                  <td className="p-4 uppercase font-black text-[10px]">
                    <span className={`px-2.5 py-1 rounded-lg ${p.type === 'car' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {p.type}
                    </span>{' '}
                    / {p.category}
                  </td>
                  <td className="p-4">
                    <div className="font-black text-amber-400">${p.price.toFixed(2)} USD</div>
                    <div className="text-[10px] text-slate-400 font-bold">{formatBs(p.price, rate)}</div>
                  </td>
                  <td className="p-4 font-black">{p.stock} un.</td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setEditing(p);
                        setModalOpen(true);
                      }}
                      className="p-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 mr-2 text-amber-400 transition-colors"
                      aria-label="Editar repuesto"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => void handleDelete(p)}
                      className="p-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-rose-500 transition-colors"
                      aria-label="Eliminar repuesto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProductFormModal
        key={editing?.id ?? 'new'}
        open={modalOpen}
        product={editing}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
