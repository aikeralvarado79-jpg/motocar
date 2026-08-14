import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { TasaCalculator } from './components/calc/TasaCalculator';
import { BottomNav } from './components/layout/BottomNav';
import { Header } from './components/layout/Header';
import { UpdateBanner } from './components/layout/UpdateBanner';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { FinancePage } from './pages/admin/FinancePage';
import { ProductsPage } from './pages/admin/ProductsPage';
import { RatesPage } from './pages/admin/RatesPage';
import { CartPage } from './pages/CartPage';
import { CatalogPage } from './pages/CatalogPage';
import { LoginPage } from './pages/LoginPage';
import { OrdersPage } from './pages/OrdersPage';

function Layout() {
  const { darkMode } = useTheme();

  return (
    <div
      className={`min-h-screen w-full overflow-x-clip font-sans antialiased transition-colors duration-300 selection:bg-amber-500 selection:text-slate-950 ${
        darkMode ? 'bg-[#07090e] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* EFECTO DE RESPLANDOR DE FONDO */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[350px] bg-gradient-to-b from-amber-500/10 via-red-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <Header />
      <UpdateBanner />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 pb-28 md:pb-16">
        <Outlet />
      </main>

      <BottomNav />
      <TasaCalculator />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <StoreProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<CatalogPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/login" element={<LoginPage />} />

                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="finance" element={<FinancePage />} />
                  <Route path="rates" element={<RatesPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </StoreProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
