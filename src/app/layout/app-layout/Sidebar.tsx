// src/layout/Sidebar.tsx
import { useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LogOut, ChevronDown } from 'lucide-react'

import { useAuthStore, useUIStore } from '@/store'
import { authApi } from '@/features/auth/api/authApi'
import { normalizeRole } from '@/shared/config/role'
import { PATHS } from '@/router/path'
import { cn } from '@/shared/lib/cn'

import administratorImg from '@/shared/assets/admin1.png'

// Sidebar Images
import homeImg from '@/shared/assets/sidebar/home.png'
import projectImg from '@/shared/assets/sidebar/projects.png'
import task_wbsImg from '@/shared/assets/sidebar/task_wbs.png'
import assignedTaskImg from '@/shared/assets/sidebar/assignedTask.png'
import approvalImg from '@/shared/assets/sidebar/approvals.png'
import userImg from '@/shared/assets/sidebar/user.png'
import performanceImg from '@/shared/assets/sidebar/performance.png'
import reportsImg from '@/shared/assets/sidebar/Reports.png'
import auditLogsImg from '@/shared/assets/sidebar/auditLogs.png'
import settingImg from '@/shared/assets/sidebar/setting.png'
import myTaskImg from '@/shared/assets/sidebar/myTask.png'
import teamImg from '@/shared/assets/sidebar/Team.png'
import recruitementImg from '@/shared/assets/sidebar/recruitement.png'

interface NavItem {
  label: string
  path: string
  image: string
}

const adminNav: NavItem[] = [
  { label: 'Dashboard',        path: PATHS.ADMIN_DASHBOARD,   image: homeImg },
  { label: 'Projects',         path: PATHS.ADMIN_PROJECTS,    image: projectImg },
  { label: 'Tasks & WBS',      path: PATHS.ADMIN_TASKS,       image: task_wbsImg },
  { label: 'Approvals',        path: PATHS.ADMIN_APPROVALS,   image: approvalImg },
  { label: 'Staff Management', path: PATHS.ADMIN_USER_MGMT,   image: userImg },
  { label: 'Performance',      path: PATHS.ADMIN_PERFORMANCE, image: performanceImg },
  { label: 'Reports',          path: PATHS.ADMIN_REPORTS,     image: reportsImg },
  { label: 'Audit Logs',       path: PATHS.ADMIN_LOGS,        image: auditLogsImg },
  { label: 'Settings',         path: PATHS.ADMIN_SETTINGS,    image: settingImg },
]

const pmNav: NavItem[] = [
  { label: 'Dashboard',      path: PATHS.PM_DASHBOARD,      image: homeImg },
  { label: 'Projects',       path: PATHS.PM_PROJECTS,       image: projectImg },
  { label: 'Tasks & WBS',    path: PATHS.PM_TASKS,          image: task_wbsImg },
  { label: 'Assigned Task',  path: PATHS.PM_ASSIGNED_TASKS, image: assignedTaskImg },
  { label: 'My Task',        path: PATHS.PM_MY_TASKS,       image: myTaskImg },
  { label: 'My Approvals',   path: PATHS.PM_APPROVALS,      image: approvalImg },
  { label: 'Team',           path: PATHS.PM_TEAM,           image: teamImg },
  { label: 'Performance',    path: PATHS.PM_PERFORMANCE,    image: performanceImg },
  { label: 'Reports',        path: PATHS.PM_REPORTS,        image: reportsImg },
  { label: 'Settings',       path: PATHS.PM_SETTINGS,       image: settingImg },
]

const hrNav: NavItem[] = [
  { label: 'Dashboard',   path: PATHS.HR_DASHBOARD,   image: homeImg },
  { label: 'Employees',   path: PATHS.HR_EMPLOYEES,   image: userImg },
  { label: 'Recruitment', path: PATHS.HR_RECRUITMENT, image: recruitementImg },
  { label: 'Performance', path: PATHS.HR_PERFORMANCE, image: performanceImg },
  { label: 'Reports',     path: PATHS.HR_REPORTS,     image: reportsImg },
  { label: 'Settings',    path: PATHS.HR_SETTINGS,    image: settingImg },
]

const employeeNav: NavItem[] = [
  { label: 'Dashboard',     path: PATHS.EMPLOYEE_DASHBOARD,   image: homeImg },
  { label: 'Assigned Task', path: PATHS.EMPLOYEE_TASKS,       image: assignedTaskImg },
  { label: 'Manual Task',   path: PATHS.EMPLOYEE_MANUAL_TASK, image: myTaskImg },
  { label: 'My Reports',    path: PATHS.EMPLOYEE_REPORTS,     image: reportsImg },
  { label: 'Performance',   path: PATHS.EMPLOYEE_PERFORMANCE, image: performanceImg },
  { label: 'My Profile',    path: PATHS.EMPLOYEE_PROFILE,     image: userImg },
]

// const siteNav: NavItem[] = [
//   { label: 'Dashboard',    path: PATHS.SITE_DASHBOARD, image: homeImg },
//   { label: 'My Tasks',     path: PATHS.SITE_TASKS,     image: task_wbsImg },
//   { label: 'Site Reports', path: PATHS.SITE_REPORTS,   image: reportsImg },
//   { label: 'Site Photos',  path: PATHS.SITE_PHOTOS,    image: reportsImg },
//   { label: 'Site Map',     path: PATHS.SITE_MAP,       image: projectImg },
// ]

const navByRole: Record<string, NavItem[]> = {
  admin: adminNav,
  project_manager: pmNav,
  hr: hrNav,
  employee: employeeNav,
  // site_person: siteNav,
}

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const navigate = useNavigate()

  const role = normalizeRole(user?.roles?.[0] || '')
  const navItems = navByRole[role] ?? adminNav
  const displayName = user?.name || user?.email?.split('@')[0] || 'User'

  // Matches AppLayout sizes
  const WIDTH_EXPANDED = 240
  const WIDTH_COLLAPSED = 72
  const sidebarWidth = sidebarCollapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED

  useEffect(() => {
    document.documentElement.style.setProperty('--app-sidebar-w', `${sidebarWidth}px`)
  }, [sidebarWidth])

  const handleLogout = async () => {
    const refreshToken = useAuthStore.getState().user?.refreshToken
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch (e) {
        console.error('Logout API failed', e)
      }
    }
    logout()
    navigate(PATHS.LOGIN, { replace: true })
  }

  return (
    <aside
      className={cn(
        'fixed z-40 flex flex-col',
        'bg-white border-r border-[#E5E7EB]',
        'transition-[width] duration-300 ease-in-out'
      )}
      style={{
        left: 0,
        top: 'var(--app-header-h, 64px)',
        bottom: 0,
        width: sidebarWidth,
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'absolute -right-4 top-8 w-8 h-8 rounded-full',
          'bg-white border border-[#E5E7EB]',
          'shadow-sm hover:shadow-md hover:bg-[#F8FAF5]',
          'transition-all duration-300 z-50 flex items-center justify-center text-[#6B7F3A]'
        )}
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 scrollbar-none">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            title={sidebarCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center rounded-[14px] transition-all duration-300',
                sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3.5 px-3.5 py-2.5',
                isActive
                  ? 'bg-[#F8FAF5] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(107,127,58,0.06)]'
                  : 'border border-transparent text-[#6B7280] hover:bg-[#F3F5EE] hover:text-[#111827]'
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Professional Active Indicator */}
                <span
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full transition-all duration-500',
                    isActive ? 'bg-[#6B7F3A] opacity-100 shadow-[2px_0_12px_#6B7F3A]' : 'bg-transparent opacity-0'
                  )}
                />

                <div
                  className={cn(
                    'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500',
                    isActive ? 'bg-white border border-[#E5E7EB] shadow-sm' : 'bg-transparent group-hover:bg-white/60 group-hover:shadow-sm'
                  )}
                >
                  <img
                    src={item.image}
                    alt={item.label}
                    className={cn(
                      item.label === 'Settings' ? 'w-9 h-9' : 'w-7.5 h-7.5',
                      'object-contain transition-all duration-500 brightness-110', 
                      !isActive ? 'drop-shadow-[0_12px_15px_rgba(0,0,0,0.35)]' : 'drop-shadow-[0_8px_20px_rgba(107,127,58,0.3)]',
                      'group-hover:scale-125 group-hover:-translate-y-1 group-hover:brightness-125 group-hover:drop-shadow-[0_15px_25px_rgba(0,0,0,0.4)]',
                      isActive ? 'brightness-125 scale-110' : ''
                    )}
                  />
                </div>

                {!sidebarCollapsed && (
                  <span className={cn('text-[14px] truncate transition-all duration-300 tracking-tight', isActive ? 'font-black text-[#111827]' : 'font-bold text-[#6B7280] group-hover:text-[#111827]')}>
                    {item.label}
                  </span>
                )}

                {sidebarCollapsed && (
                  <div className="absolute left-full ml-5 px-4 py-2.5 bg-[#111827] text-white text-[11px] font-black rounded-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-2xl z-100 tracking-widest uppercase">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-[#111827]" />
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile Section */}
      <div className="border-t border-[#E5E7EB] p-5 bg-white shadow-[0_-8px_20px_rgba(0,0,0,0.02)]">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all cursor-pointer">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#F3F5EE] border border-[#E5E7EB]">
                <img src={administratorImg} alt="Avatar" className="w-full h-full object-contain" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-black text-[#111827] truncate leading-tight">{displayName}</p>
              <p className="text-[10px] font-bold text-text-light uppercase tracking-wider mt-0.5 truncate">
                {role.replaceAll('_', ' ')}
              </p>
            </div>

            <ChevronDown size={14} className="text-text-light shrink-0" />
          </div>
        ) : (
          <div className="flex justify-center mb-3">
            <div className="relative cursor-pointer hover:scale-105 transition-transform">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-white border border-[#E5E7EB] shadow-sm">
                <img src={administratorImg} alt="Avatar" className="w-full h-full object-contain" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center rounded-xl transition-all duration-200 mt-3',
            'border border-red-100 bg-red-50 hover:bg-red-100 hover:border-red-200',
            sidebarCollapsed ? 'justify-center py-3' : 'gap-3 px-4 py-3'
          )}
        >
          <LogOut size={16} className="text-red-500 shrink-0" />
          {!sidebarCollapsed && (
            <span className="text-[12px] font-bold text-red-600 uppercase tracking-widest">
              Sign Out
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}
