import { apiClient } from '@/shared/lib/api/client'
import type { AdminUser, CreateUserRequest, PaginatedResponse, ApiResponse, UserSkill } from '../model/types'

export const userApi = {
  // Get all users with pagination
  getUsers: async (page = 0, size = 10): Promise<PaginatedResponse<AdminUser>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AdminUser>>>('/admin', {
      params: { page, size }
    })
    return response.data.data
  },

  // Get single user by ID
  getUserById: async (id: string): Promise<AdminUser> => {
    const response = await apiClient.get<ApiResponse<AdminUser>>(`/admin/${id}`)
    return response.data.data
  },

  // Create new user (multi-role support)
  createUser: async (user: CreateUserRequest): Promise<AdminUser> => {
    const response = await apiClient.post<ApiResponse<AdminUser>>('/admin/create-user', user)
    return response.data.data
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/${id}`)
  },

  // Enable user account
  enableUser: async (id: string): Promise<void> => {
    await apiClient.patch(`/admin/${id}/enable`)
  },

  // Disable user account
  disableUser: async (id: string): Promise<void> => {
    await apiClient.patch(`/admin/${id}/disable`)
  },

  // Update user info
  updateUser: async (id: string, user: any): Promise<AdminUser> => {
    const response = await apiClient.put<ApiResponse<AdminUser>>(`/admin/${id}`, user)
    return response.data.data
  },

  // Search users by skill
  getUsersBySkill: async (skill: UserSkill, page = 0, size = 10): Promise<PaginatedResponse<AdminUser>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AdminUser>>>('/admin/by-skill', {
      params: { skill, page, size }
    })
    return response.data.data
  },
}
