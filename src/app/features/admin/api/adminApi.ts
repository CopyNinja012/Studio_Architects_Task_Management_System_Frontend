import { apiClient } from '@/shared/lib/api/client'
import { projectApi } from './projectApi'
import { taskApi } from './taskApi'
import type { Employee, Task, Project, PerformanceRecord, AuditLog, AdminUser, CreateUserRequest, PaginatedResponse, ApiResponse, UserSkill } from '../model/types'

export const adminApi = {
  // Projects — delegate to projectApi which uses the correct /admin/projects base
  getProjects: async () => {
    const page = await projectApi.getAllProjects({}, 0, 200)
    
    if (!page || !page.content) {
      console.warn('adminApi.getProjects: No content found in response', page)
      return []
    }

    // Map ProjectResponse → legacy Project shape expected by Dashboard
    return page.content.map(p => ({
      id:            p.id,
      name:          p.projectName,
      code:          p.jobNumber,
      description:   p.description ?? '',
      client:        p.clientOwnerName,
      type:          p.projectType as Project['type'],
      status:        p.status as Project['status'],
      priority:      'medium' as const,
      progress:      p.progress,
      startDate:     p.startDate,
      endDate:       p.expectedCompletionDate,
      budget:        0,
      spent:         0,
      projectLead:   p.projectLeadName ?? '',
      projectLeadId: '',
      teamMembers:   [],
      location:      p.siteLocation,
      category:      '',
      createdAt:     p.startDate,
    }))
  },

  // Users Management
  getUsers: async (page = 0, size = 10): Promise<PaginatedResponse<AdminUser>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AdminUser>>>('/admin', {
      params: { page, size }
    })
    return response.data.data
  },

  getUserById: async (id: string): Promise<AdminUser> => {
    const response = await apiClient.get<ApiResponse<AdminUser>>(`/admin/${id}`)
    return response.data.data
  },

  createUser: async (user: CreateUserRequest): Promise<AdminUser> => {
    const response = await apiClient.post<ApiResponse<AdminUser>>('/admin/create-user', user)
    return response.data.data
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/admin/${id}`)
  },

  enableUser: async (id: string): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>(`/admin/${id}/enable`)
  },

  disableUser: async (id: string): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>(`/admin/${id}/disable`)
  },

  getUsersBySkill: async (skill: UserSkill, page = 0, size = 10): Promise<PaginatedResponse<AdminUser>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AdminUser>>>('/admin/by-skill', {
      params: { skill, page, size }
    })
    return response.data.data
  },

  // Bridge for existing UI
  getEmployees: async (): Promise<Employee[]> => {
    const users = await adminApi.getUsers(0, 100)
    
    if (!users || !users.content) {
      console.warn('adminApi.getEmployees: No content found in response', users)
      return []
    }

    return users.content.map(u => ({
      id: u.id,
      employeeId: u.id.slice(0, 8),
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.roles[0]?.toLowerCase() || 'employee',
      designation: 'Staff',
      department: 'General',
      status: u.enabled ? 'ACTIVE' : 'INACTIVE',
      joinDate: u.dateOfJoining,
      salary: 0,
      manager: 'Admin',
      location: u.address,
      skills: u.skills,
      performanceScore: 0,
      tasksCompleted: 0,
      projectsAssigned: 0,
      projectsCompleted: 0,
      yearsOfExperience: 0,
    }))
  },

  // Tasks — delegate to taskApi which uses the correct /admin/tasks base
  getTasks: async (): Promise<Task[]> => {
    const page = await taskApi.getTasks({ size: 200 })
    
    if (!page || !page.content) {
      console.warn('adminApi.getTasks: No content found in response', page)
      return []
    }

    return page.content as any
  },

  approveTask: async (id: string): Promise<Task> => {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}/approve`)
    return response.data.data
  },

  sendRework: async (id: string, note: string): Promise<Task> => {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}/rework`, { note })
    return response.data.data
  },

  // Performance
  getPerformance: async (): Promise<PerformanceRecord[]> => {
    const response = await apiClient.get<ApiResponse<PerformanceRecord[]>>('/performance')
    return response.data.data
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const response = await apiClient.get<ApiResponse<AuditLog[]>>('/audit-logs')
    return response.data.data
  },
}
