import { Navigate, Outlet } from 'react-router-dom';
import { AdminNav } from '../../components/layout/AdminNav';
import { useAuth } from '../../context/AuthContext';

export function AdminLayout() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <AdminNav />
      <Outlet />
    </div>
  );
}
