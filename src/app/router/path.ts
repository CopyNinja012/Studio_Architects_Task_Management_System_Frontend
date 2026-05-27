export const PATHS = {
  // Auth
  LOGIN: '/login',

  // Admin
  ADMIN: '/admin',
  ADMIN_DASHBOARD:      '/admin/dashboard',
  ADMIN_PROJECTS:       '/admin/projects',
  ADMIN_TASKS:          '/admin/tasks',
  ADMIN_APPROVALS:      '/admin/approvals',
  ADMIN_USER_MGMT:      '/admin/user-management',
  ADMIN_PERFORMANCE:    '/admin/performance',
  ADMIN_LOGS:           '/admin/audit-log',
  ADMIN_SETTINGS:       '/admin/settings',
  ADMIN_REPORTS:        '/admin/reports',
  ADMIN_ATTENDANCE:     '/admin/attendance', // For routing fallback if needed
  ADMIN_EMPLOYEE:       '/admin/employees', // For routing fallback if needed

  // Project Manager
  PM: '/pm',
  PM_DASHBOARD:      '/pm/dashboard',
  PM_PROJECTS:       '/pm/projects',
  PM_TASKS:          '/pm/tasks',
  PM_TASK_WBS:       '/pm/task-wbs',
  PM_ASSIGNED_TASKS: '/pm/assigned-tasks',
  PM_MY_TASKS:       '/pm/my-tasks',
  PM_APPROVALS:      '/pm/approvals',
  PM_TEAM:           '/pm/team',
  PM_REPORTS:        '/pm/reports',
  PM_PERFORMANCE:    '/pm/performance',
  PM_PROJECT_DETAIL: '/pm/project/:projectId', // Dynamic route for project details
  PM_SETTINGS:       '/pm/settings',

  // HR
  HR: '/hr',
  HR_DASHBOARD:   '/hr/dashboard',
  HR_EMPLOYEES:   '/hr/employees',
  HR_RECRUITMENT: '/hr/recruitment',
  HR_PERFORMANCE: '/hr/performance',
  HR_REPORTS:     '/hr/reports',
  HR_SETTINGS:    '/hr/settings',

  // Employee
  EMPLOYEE: '/employee',
  EMPLOYEE_DASHBOARD:   '/employee/dashboard',
  EMPLOYEE_TASKS:       '/employee/tasks',
  EMPLOYEE_MANUAL_TASK: '/employee/manual-task',
  EMPLOYEE_REPORTS:     '/employee/reports',
  EMPLOYEE_PERFORMANCE: '/employee/performance',
  EMPLOYEE_PROFILE:     '/employee/profile',

  // Site Person
  SITE: '/site',
  SITE_DASHBOARD: '/site/dashboard',
  SITE_TASKS:     '/site/tasks',
  SITE_REPORTS:   '/site/reports',
  SITE_PHOTOS:    '/site/photos',
  SITE_MAP:       '/site/map',
} as const
