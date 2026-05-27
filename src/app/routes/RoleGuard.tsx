import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store'
import type { UserRole } from '@/shared/config/role'
import { normalizeRole } from '@/shared/config/role'
import { PATHS } from '@/router/path'

interface RoleGuardProps {
  allowedRoles: UserRole[]
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { user } = useAuthStore()

  const normalizedAllowed = allowedRoles.map((r) => normalizeRole(r))
  const hasAccess = user?.roles?.some((role) =>
    normalizedAllowed.includes(normalizeRole(role))
  )

  if (!user || !hasAccess) return <Navigate to={PATHS.LOGIN} replace />
  return <Outlet />
}
