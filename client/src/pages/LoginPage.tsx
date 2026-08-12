import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function LoginPage() {
  const { darkMode } = useTheme();
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await login(username, password);
    setSubmitting(false);
    if (ok) navigate('/admin', { replace: true });
  };

  const inputClass = `w-full pl-11 pr-4 py-3.5 rounded-2xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
    darkMode ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800'
  }`;

  return (
    <div className="w-full max-w-md mx-auto animate-in fade-in duration-200">
      <div
        className={`p-8 rounded-3xl border space-y-6 shadow-2xl glass-panel ${
          darkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl shadow-amber-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Panel Admin Pro</h2>
          <p className="text-xs font-bold text-slate-400">Acceso restringido para administradores</p>
        </div>

        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-3.5 w-5 h-5 text-amber-500" />
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className={inputClass}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-amber-500" />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? 'Verificando...' : 'Iniciar Sesión'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-[11px] font-semibold text-slate-500">
          Credenciales por defecto: <code className="text-amber-500">admin / motocar123</code> (configurable en
          <code className="text-amber-500"> server/.env</code>)
        </p>
      </div>
    </div>
  );
}
