import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { PATHS } from '@/router/path'
import { AuthRoutes } from '@/routes/AuthRoutes'
import { ProtectedRoutes } from '@/routes/ProtectedRoutes'
import { AppLayout } from '@/layout/app-layout/AppLayout'
import { AuthProvider } from '@/providers/AuthProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'

// ── Admin ──────────────────────────────────────────────────────────────────
import AdminDashboard     from '@/features/admin/pages/Dashboard'
import AdminProjects      from '@/features/admin/pages/Projects'
import AdminTaskWBS       from '@/features/admin/pages/Task-WBS'
import AdminApprovals     from '@/features/admin/pages/Approvals'
import AdminAttendance    from '@/features/admin/pages/Attendance'
import AdminPerformance   from '@/features/admin/pages/Performance'
import AdminUserMgmt      from '@/features/admin/pages/UserManagement'
import AdminAuditLog      from '@/features/admin/pages/AuditLog'
import AdminSettings      from '@/features/admin/pages/Settings'
import AdminReports       from '@/features/admin/pages/Reports'

// ── Project Manager ────────────────────────────────────────────────────────
import PMDashboard      from '@/features/project-manager/pages/PMDashboard'
import PMProjects       from '@/features/project-manager/pages/PMProjects'
import PMTasks          from '@/features/project-manager/pages/PMTasks'
import PMAssignedTasks  from '@/features/project-manager/pages/PMAssignedTasks'
import PMMyTasks        from '@/features/project-manager/pages/PMMyTasks'
import PMTeam           from '@/features/project-manager/pages/PMTeam'
import PMReports        from '@/features/project-manager/pages/PMReports'
import PMSettings       from '@/features/project-manager/pages/PMSettings'

// ── HR ─────────────────────────────────────────────────────────────────────
import HRDashboard    from '@/features/hr/pages/HRDashboard'
import HREmployees    from '@/features/hr/pages/HREmployees'
import HRRecruitment  from '@/features/hr/pages/HRRecruitment'
import HRPerformance  from '@/features/hr/pages/HRPerformance'
import HRReports      from '@/features/hr/pages/HRReports'
import HRSettings     from '@/features/hr/pages/HRSettings'

// ── Employee ───────────────────────────────────────────────────────────────
import EmployeeDashboard   from '@/features/employee/pages/EmployeeDashboard'
import EmployeeTasks       from '@/features/employee/pages/EmployeeTasks'
import EmployeeManualTask  from '@/features/employee/pages/ManualTask'
// import EmployeeAttendance  from '@/features/employee/pages/EmployeeAttendance'
import EmployeeReports     from '@/features/employee/pages/EmployeeReports'
import EmployeePerformance from '@/features/employee/pages/EmployeePerformance'
import EmployeeProfile     from '@/features/employee/pages/EmployeeProfile'



// ── Auth ───────────────────────────────────────────────────────────────────
import Login from '@/features/auth/pages/Login'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Toaster position="top-right" richColors closeButton />
          
          <Routes>
            <Route path={PATHS.LOGIN} element={<Login />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoutes />}>
              <Route element={<AppLayout />}>
                
                {/* Admin */}
                <Route path={PATHS.ADMIN} element={<Navigate to={PATHS.ADMIN_DASHBOARD} replace />} />
                <Route path={PATHS.ADMIN_DASHBOARD}  element={<AdminDashboard />} />
                <Route path={PATHS.ADMIN_PROJECTS}   element={<AdminProjects />} />
                <Route path={PATHS.ADMIN_TASKS}      element={<AdminTaskWBS />} />
                <Route path={PATHS.ADMIN_APPROVALS}  element={<AdminApprovals />} />
                <Route path={PATHS.ADMIN_ATTENDANCE} element={<AdminAttendance />} />
                <Route path={PATHS.ADMIN_PERFORMANCE} element={<AdminPerformance />} />
                <Route path={PATHS.ADMIN_USER_MGMT}  element={<AdminUserMgmt />} />
                <Route path={PATHS.ADMIN_LOGS}       element={<AdminAuditLog />} />
                <Route path={PATHS.ADMIN_SETTINGS}   element={<AdminSettings />} />
                <Route path={PATHS.ADMIN_REPORTS}    element={<AdminReports />} />

                {/* Project Manager */}
                <Route path={PATHS.PM} element={<Navigate to={PATHS.PM_DASHBOARD} replace />} />
                <Route path={PATHS.PM_DASHBOARD} element={<PMDashboard />} />
                <Route path={PATHS.PM_PROJECTS}  element={<PMProjects />} />
                <Route path={PATHS.PM_TASKS}     element={<PMTasks />} />
                <Route path={PATHS.PM_TASK_WBS}  element={<PMTasks />} />
                <Route path={PATHS.PM_ASSIGNED_TASKS} element={<PMAssignedTasks />} />
                <Route path={PATHS.PM_MY_TASKS}       element={<PMMyTasks />} />
                <Route path={PATHS.PM_APPROVALS} element={<AdminApprovals />} />
                <Route path={PATHS.PM_TEAM}      element={<PMTeam />} />
                <Route path={PATHS.PM_REPORTS}   element={<PMReports />} />
                <Route path={PATHS.PM_PERFORMANCE} element={<AdminPerformance />} />
                <Route path={PATHS.PM_SETTINGS} element={<PMSettings />} />

                {/* HR */}
                <Route path={PATHS.HR} element={<Navigate to={PATHS.HR_DASHBOARD} replace />} />
                <Route path={PATHS.HR_DASHBOARD}   element={<HRDashboard />} />
                <Route path={PATHS.HR_EMPLOYEES}   element={<HREmployees />} />
                <Route path={PATHS.HR_RECRUITMENT} element={<HRRecruitment />} />
                <Route path={PATHS.HR_PERFORMANCE} element={<HRPerformance />} />
                <Route path={PATHS.HR_REPORTS}     element={<HRReports />} />
                <Route path={PATHS.HR_SETTINGS}    element={<HRSettings />} />

                {/* Employee */}
                <Route path={PATHS.EMPLOYEE} element={<Navigate to={PATHS.EMPLOYEE_DASHBOARD} replace />} />
                <Route path={PATHS.EMPLOYEE_DASHBOARD} element={<EmployeeDashboard />} />
                <Route path={PATHS.EMPLOYEE_TASKS}       element={<EmployeeTasks />} />
                <Route path={PATHS.EMPLOYEE_MANUAL_TASK} element={<EmployeeManualTask />} />
                <Route path={PATHS.EMPLOYEE_REPORTS}     element={<EmployeeReports />} />
                <Route path={PATHS.EMPLOYEE_PERFORMANCE} element={<EmployeePerformance />} />
                <Route path={PATHS.EMPLOYEE_PROFILE}     element={<EmployeeProfile />} />

             
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to={PATHS.LOGIN} replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

