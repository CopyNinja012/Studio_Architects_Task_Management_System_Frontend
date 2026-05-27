import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { PATHS } from '@/router/path'

export function ProtectedRoutes() {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Outlet /> : <Navigate to={PATHS.LOGIN} replace />
}
