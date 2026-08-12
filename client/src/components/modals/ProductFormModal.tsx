import { useState } from 'react';
import type { Product, ProductInput, VehicleType } from '@shared/types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';

interface ProductFormModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}

const inputClass = (darkMode: boolean) =>
  `w-full p-3 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
    darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
  }`;

const labelClass = 'block font-black uppercase tracking-wider mb-1.5 text-xs';

export function ProductFormModal({ open, product, onClose }: ProductFormModalProps) {
  const { darkMode } = useTheme();
  const { token } = useAuth();
  const { refresh } = useStore();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    const data = new FormData(e.currentTarget);

    const input: ProductInput = {
      name: String(data.get('name') ?? '').trim(),
      sku: String(data.get('sku') ?? '').trim(),
      type: String(data.get('type') ?? 'car') as VehicleType,
      category: String(data.get('category') ?? 'motor').trim(),
      price: Number(data.get('price')),
      stock: Number(data.get('stock')),
      image: String(data.get('image') ?? '').trim(),
      desc: String(data.get('desc') ?? '').trim(),
    };

    setSaving(true);
    try {
      if (product) {
        await api.updateProduct(product.id, input, token);
        showToast('Repuesto actualizado con éxito', 'success');
      } else {
        await api.createProduct(input, token);
        showToast('Repuesto registrado con éxito', 'success');
      }
      void refresh();
      onClose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al guardar el repuesto', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={product ? 'Editar Repuesto Pro' : 'Registrar Nuevo Repuesto Pro'} maxWidth="max-w-xl">
      <form onSubmit={(e) => void submit(e)} className="space-y-4 text-xs font-semibold">
        <div>
          <label className={labelClass}>Nombre del Repuesto</label>
          <input name="name" defaultValue={product?.name ?? ''} required className={inputClass(darkMode)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Código SKU</label>
            <input name="sku" defaultValue={product?.sku ?? ''} required className={inputClass(darkMode)} />
          </div>
          <div>
            <label className={labelClass}>Tipo de Vehículo</label>
            <select name="type" defaultValue={product?.type ?? 'car'} className={inputClass(darkMode)}>
              <option value="car">Carro</option>
              <option value="moto">Moto</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Categoría</label>
            <input name="category" defaultValue={product?.category ?? 'motor'} required className={inputClass(darkMode)} />
          </div>
          <div>
            <label className={labelClass}>Precio (USD)</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.price ?? ''}
              required
              className={inputClass(darkMode)}
            />
          </div>
          <div>
            <label className={labelClass}>Stock Inicial</label>
            <input
              name="stock"
              type="number"
              step="1"
              min="0"
              defaultValue={product?.stock ?? ''}
              required
              className={inputClass(darkMode)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>URL de Imagen HD</label>
          <input name="image" defaultValue={product?.image ?? ''} className={inputClass(darkMode)} />
        </div>

        <div>
          <label className={labelClass}>Descripción Detallada</label>
          <textarea name="desc" defaultValue={product?.desc ?? ''} rows={3} className={inputClass(darkMode)} />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-700 font-black uppercase tracking-wider text-xs hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-red-600/30 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Repuesto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
