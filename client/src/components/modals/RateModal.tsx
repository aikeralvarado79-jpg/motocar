import { useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';

interface RateModalProps {
  open: boolean;
  onClose: () => void;
}

export function RateModal({ open, onClose }: RateModalProps) {
  const { darkMode } = useTheme();
  const { token } = useAuth();
  const { rate, refresh } = useStore();
  const { showToast } = useToast();
  const [input, setInput] = useState('');

  const save = async () => {
    const val = parseFloat(input);
    if (!Number.isFinite(val) || val <= 0) {
      showToast('Por favor ingresa un valor válido mayor a 0', 'error');
      return;
    }
    if (!token) return;
    try {
      await api.updateRate(val, token);
      setInput('');
      showToast('¡Tasa BCV actualizada con éxito en la red!', 'success');
      void refresh();
      onClose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al actualizar la tasa', 'error');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Actualizar Tasa BCV Oficial">
      <p className="text-xs text-slate-400 font-semibold leading-relaxed mb-5">
        Ingresa la nueva tasa cambiaria oficial. Se actualizará automáticamente el doble etiquetado en toda la
        plataforma y en todos los dispositivos conectados, y quedará registrada en la auditoría.
      </p>

      <input
        type="number"
        step="0.01"
        min="0.01"
        placeholder={`Ej: ${rate.toFixed(2)}`}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className={`w-full p-4 rounded-2xl border text-base font-black focus:outline-none focus:ring-2 focus:ring-amber-500 ${
          darkMode ? 'bg-slate-950 border-slate-800 text-amber-400' : 'bg-slate-50 border-slate-200 text-amber-600'
        }`}
      />

      <div className="flex gap-3 pt-6">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-2xl border border-slate-700 text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={() => void save()}
          className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/30 transition-colors"
        >
          Guardar Tasa
        </button>
      </div>
    </Modal>
  );
}
