import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function RequireAuth() {
  const { isLoggedIn } = useAuthStore();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <Outlet />;
}
