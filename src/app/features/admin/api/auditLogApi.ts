import { apiClient } from '@/shared/lib/api/client'
import type { 
  ApiResponse, 
  PaginatedResponse, 
  AuditLog, 
  AuditLogFilter, 
  AuditLogStats, 
  TopUserAuditStats 
} from '../model/types'

const BASE = '/admin/audit-logs'

export const auditLogApi = {
  /**
   * Get all audit logs (paginated and filtered)
   */
  getLogs: async (
    filter: AuditLogFilter = {}, 
    page = 0, 
    size = 20, 
    sortBy = 'timestamp', 
    sortDir = 'desc'
  ): Promise<PaginatedResponse<AuditLog>> => {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<AuditLog>>>(BASE, {
      params: { ...filter, page, size, sortBy, sortDir }
    })
    return res.data.data
  },

  /**
   * Get recent logs from the last X hours
   */
  getRecentLogs: async (hours = 24): Promise<AuditLog[]> => {
    const res = await apiClient.get<ApiResponse<AuditLog[]>>(`${BASE}/recent`, {
      params: { hours }
    })
    return res.data.data
  },

  /**
   * Get logs for a specific entity
   */
  getEntityLogs: async (entityType: string, entityId: string): Promise<AuditLog[]> => {
    const res = await apiClient.get<ApiResponse<AuditLog[]>>(`${BASE}/entities/${entityType}/${entityId}`)
    return res.data.data
  },

  /**
   * Get logs for a specific user (paginated)
   */
  getUserLogs: async (userId: string, page = 0, size = 20): Promise<PaginatedResponse<AuditLog>> => {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<AuditLog>>>(`${BASE}/users/${userId}`, {
      params: { page, size }
    })
    return res.data.data
  },

  /**
   * Get statistics for a date range
   */
  getStatistics: async (startDate?: string, endDate?: string): Promise<AuditLogStats> => {
    const res = await apiClient.get<ApiResponse<AuditLogStats>>(`${BASE}/statistics`, {
      params: { startDate, endDate }
    })
    return res.data.data
  },

  /**
   * Get most active users in terms of actions
   */
  getTopUsers: async (limit = 10): Promise<TopUserAuditStats[]> => {
    const res = await apiClient.get<ApiResponse<TopUserAuditStats[]>>(`${BASE}/top-users`, {
      params: { limit }
    })
    return res.data.data
  },

  /**
   * Get a single log detail by ID
   */
  getLogById: async (id: string): Promise<AuditLog> => {
    const res = await apiClient.get<ApiResponse<AuditLog>>(`${BASE}/${id}`)
    return res.data.data
  },

  /**
   * Export logs to CSV based on current filters
   */
  exportToCsv: async (filter: AuditLogFilter = {}): Promise<string> => {
    const res = await apiClient.post<string>(`${BASE}/export/csv`, filter, {
      responseType: 'blob' as any
    })
    return res.data
  }
}
