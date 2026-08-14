import { NavLink } from 'react-router-dom';
import { BarChart3, DollarSign, Package, RefreshCw, Truck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const tabs = [
  { to: '/admin/dashboard', label: 'Dashboard General', icon: BarChart3 },
  { to: '/admin/products', label: 'Catálogo & Inventario', icon: Package },
  { to: '/admin/orders', label: 'Gestión de Pedidos & GPS', icon: Truck },
  { to: '/admin/finance', label: 'Módulo Financiero Pro', icon: DollarSign },
  { to: '/admin/rates', label: 'Tasa & Historial', icon: RefreshCw },
];

export function AdminNav() {
  const { darkMode } = useTheme();

  return (
    <nav
      className={`border-b w-full px-4 sm:px-8 py-3 flex gap-3 overflow-x-auto ${darkMode ? 'bg-[#090c12]/90 border-slate-800' : 'bg-slate-100/90 border-slate-200'}`}
      aria-label="Navegación de administración"
    >
      <div className="w-full max-w-7xl mx-auto flex gap-3 items-center">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-200 whitespace-nowrap shadow-sm glass-panel ${
                isActive
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30 ring-1 ring-red-400/50'
                  : darkMode
                    ? 'text-slate-400 bg-slate-900/60 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                    : 'text-slate-600 bg-white hover:bg-slate-50 border border-slate-200'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
