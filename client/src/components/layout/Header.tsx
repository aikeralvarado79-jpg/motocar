import { Link, NavLink, useNavigate } from 'react-router-dom';
import { DollarSign, Gauge, LogOut, Moon, Package, ShieldCheck, ShoppingCart, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';

const linkBase = 'text-xs font-black tracking-wider uppercase transition-colors duration-200 py-2 px-3 rounded-xl';
const linkActive = 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-lg shadow-amber-500/30';
const linkIdle = (darkMode: boolean) =>
  darkMode ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100';

export function Header() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { cartCount, rate } = useStore();
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const adminUrl = isAdmin ? '/admin' : '/login';

  return (
    <header
      className={`safe-top sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-all duration-300 ${
        darkMode
          ? 'bg-[#0b0e14]/85 border-slate-800/80 shadow-xl shadow-black/40'
          : 'bg-white/85 border-slate-200/85 shadow-md shadow-slate-200/50'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/30 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Gauge className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-black tracking-widest uppercase bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent whitespace-nowrap">
                  MotoCar
                </h1>
                <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-red-600/20 text-red-500 border border-red-500/30 text-[9px] font-black tracking-wider uppercase whitespace-nowrap">
                  PRO ELITE
                </span>
              </div>
              <p className={`hidden md:block text-[11px] font-semibold tracking-wider truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Autopartes de Lujo Táctico & Competición
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <div
            className={`hidden lg:flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-bold ${darkMode ? 'bg-slate-900/60 border-slate-800 text-amber-400' : 'bg-amber-50 border-amber-200/80 text-amber-800'}`}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <DollarSign className="w-4 h-4 text-amber-500" />
            <span>
              Tasa de la tienda: <strong>Bs. {rate.toFixed(2)}</strong>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle(darkMode)}`}>
              Catálogo
            </NavLink>
            <NavLink to="/cart" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle(darkMode)}`}>
              <span className="flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4" /> Carrito{cartCount > 0 && ` (${cartCount})`}
              </span>
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle(darkMode)}`}>
              <span className="flex items-center gap-1.5">
                <Package className="w-4 h-4" /> Pedidos
              </span>
            </NavLink>
          </nav>

          <Link
            to={adminUrl}
            className={`hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-black tracking-wider transition-all duration-200 border ${
              isAdmin
                ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white border-transparent shadow-lg shadow-red-600/30'
                : darkMode
                  ? 'border-slate-800 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">{isAdmin ? 'Panel Admin' : 'Admin'}</span>
          </Link>

          {isAdmin && (
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className={`p-2.5 rounded-xl border transition-all duration-200 ${
                darkMode ? 'border-slate-800 text-rose-400 hover:bg-slate-800' : 'border-slate-200 text-rose-600 hover:bg-slate-100'
              }`}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={toggleDarkMode}
            className={`p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 glass-panel ${
              darkMode
                ? 'bg-slate-900/80 border-slate-800 text-amber-400 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
            aria-label="Cambiar tema"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
