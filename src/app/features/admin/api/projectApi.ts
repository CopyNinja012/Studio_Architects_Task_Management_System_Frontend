/**
 * projectApi.ts
 * All project-related API calls mapped to the backend ProjectController.
 * Base path: /api/admin/projects
 */
import { apiClient } from '@/shared/lib/api/client'
import type { ApiResponse, PageResponse } from '@/features/admin/model/projectTypes'
import type {
  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectStatusUpdateRequest,
  ProjectFilterRequest,
  ProjectResponse,
  ProjectStatusHistoryResponse,
  AssignableUserResponse,
} from '@/features/admin/model/projectTypes'

const BASE = '/admin/projects'

export const projectApi = {

  // ── Create ──────────────────────────────────────────────────────────────
  createProject: async (data: ProjectCreateRequest): Promise<ProjectResponse> => {
    const res = await apiClient.post<ApiResponse<ProjectResponse>>(BASE, data)
    return res.data.data
  },

  // ── Update ──────────────────────────────────────────────────────────────
  updateProject: async (id: string, data: ProjectUpdateRequest): Promise<ProjectResponse> => {
    const res = await apiClient.put<ApiResponse<ProjectResponse>>(`${BASE}/${id}`, data)
    return res.data.data
  },

  // ── Delete ──────────────────────────────────────────────────────────────
  deleteProject: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`${BASE}/${id}`)
  },

  // ── Get by ID ───────────────────────────────────────────────────────────
  getProjectById: async (id: string): Promise<ProjectResponse> => {
    const res = await apiClient.get<ApiResponse<ProjectResponse>>(`${BASE}/${id}`)
    return res.data.data
  },

  // ── Get all (paginated + filtered) ──────────────────────────────────────
  getAllProjects: async (
    filter: Partial<ProjectFilterRequest> = {},
    page    = 0,
    size    = 10,
    sortBy  = 'createdAt',
    sortDir = 'desc',
  ): Promise<PageResponse<ProjectResponse>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<ProjectResponse>>>(BASE, {
      params: { ...filter, page, size, sortBy, sortDir },
    })
    return res.data.data
  },

  // ── Update status ────────────────────────────────────────────────────────
  updateProjectStatus: async (
    id: string,
    data: ProjectStatusUpdateRequest,
  ): Promise<ProjectResponse> => {
    const res = await apiClient.patch<ApiResponse<ProjectResponse>>(`${BASE}/${id}/status`, data)
    return res.data.data
  },

  // ── Status history ───────────────────────────────────────────────────────
  getStatusHistory: async (id: string): Promise<ProjectStatusHistoryResponse[]> => {
    const res = await apiClient.get<ApiResponse<ProjectStatusHistoryResponse[]>>(
      `${BASE}/${id}/status-history`,
    )
    return res.data.data
  },

  // ── Assignable project managers ──────────────────────────────────────────
  getProjectManagers: async (): Promise<AssignableUserResponse[]> => {
    const res = await apiClient.get<ApiResponse<AssignableUserResponse[]>>(`${BASE}/managers`)
    return res.data.data
  },

  // ── Assignable employees ─────────────────────────────────────────────────
  getAssignableEmployees: async (): Promise<AssignableUserResponse[]> => {
    const res = await apiClient.get<ApiResponse<AssignableUserResponse[]>>(`${BASE}/employees`)
    return res.data.data
  },
}
