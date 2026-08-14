import { NavLink } from 'react-router-dom';
import { Home, Package, ShieldCheck, ShoppingCart } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';

const items = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/cart', label: 'Carrito', icon: ShoppingCart },
  { to: '/orders', label: 'Pedidos', icon: Package },
  { to: '/admin', label: 'Admin', icon: ShieldCheck },
];

export function BottomNav() {
  const { darkMode } = useTheme();
  const { cartCount } = useStore();

  return (
    <nav
      className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur-xl safe-bottom ${
        darkMode ? 'bg-[#0b0e14]/95 border-slate-800' : 'bg-white/95 border-slate-200'
      }`}
      aria-label="Navegación principal"
    >
      <div className="grid grid-cols-4 h-16">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 text-[10px] font-black uppercase tracking-wider transition-colors duration-200 ${
                isActive ? 'text-amber-400' : darkMode ? 'text-slate-500' : 'text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : ''}`} />
                  {to === '/cart' && cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-r from-red-600 to-orange-600 text-white text-[9px] font-black flex items-center justify-center shadow-lg">
                      {cartCount}
                    </span>
                  )}
                </span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
