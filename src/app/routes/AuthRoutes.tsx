import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { normalizeRole } from '@/shared/config/role'
import { PATHS } from '@/router/path'

const roleMap: Record<string, string> = {
  admin: PATHS.ADMIN_DASHBOARD,
  project_manager: PATHS.PM_DASHBOARD,
  hr: PATHS.HR_DASHBOARD,
  employee: PATHS.EMPLOYEE_DASHBOARD,
  site_person: PATHS.SITE_DASHBOARD,
}

export function AuthRoutes() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Outlet />

  const rawRole = user?.roles?.[0] || ''
  const normalizedRole = normalizeRole(rawRole)
  return <Navigate to={roleMap[normalizedRole] || PATHS.ADMIN_DASHBOARD} replace />
}
