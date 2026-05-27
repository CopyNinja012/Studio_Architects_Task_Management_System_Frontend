export type UserRole =
  | 'admin' | 'project_manager' | 'hr' | 'employee' | 'site_person'
  | 'ADMIN' | 'PROJECT_MANAGER' | 'HR' | 'EMPLOYEE' | 'SITE_PERSON'
  | 'ROLE_ADMIN' | 'ROLE_PROJECT_MANAGER' | 'ROLE_HR' | 'ROLE_EMPLOYEE' | 'ROLE_SITE_PERSON'
  | 'role_admin' | 'role_project_manager' | 'role_hr' | 'role_employee' | 'role_site_person'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  project_manager: 'Project Manager',
  hr: 'HR Manager',
  employee: 'Employee',
  site_person: 'Site Personnel',
}

const ROLE_COLOR_MAP: Record<string, string> = {
  admin: 'bg-[#6B7F3A] text-white',
  project_manager: 'bg-blue-600 text-white',
  hr: 'bg-purple-600 text-white',
  employee: 'bg-[#8BAF5A] text-white',
  site_person: 'bg-orange-600 text-white',
}

/** Normalize any backend role format to a plain lowercase key */
export function normalizeRole(role: string): string {
  return role.toLowerCase().replace(/^role_/, '')
}

export const ROLES: Record<string, string> = new Proxy(ROLE_LABELS, {
  get: (target, key: string) => target[normalizeRole(key)] ?? key,
})

export const ROLE_COLORS: Record<string, string> = new Proxy(ROLE_COLOR_MAP, {
  get: (target, key: string) => target[normalizeRole(key)] ?? 'bg-gray-500 text-white',
})