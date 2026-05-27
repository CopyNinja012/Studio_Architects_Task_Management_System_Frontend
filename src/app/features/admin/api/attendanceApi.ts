/*
import { apiClient } from '@/shared/lib/api/client'
import type {
  ApiResponse,
  PaginatedResponse,
  AttendanceRecordApi,
  AttendanceExceptionRequest,
  AttendanceListParams,
  AdminAttendanceListParams,
} from '../model/types'

export const attendanceApi = {
  // ── Admin: create / edit an attendance exception ──────────────────────────
  createException: async (
    data: AttendanceExceptionRequest,
  ): Promise<AttendanceRecordApi> => {
    const response = await apiClient.post<ApiResponse<AttendanceRecordApi>>(
      '/attendance/admin/exception',
      data,
    )
    return response.data.data
  },

  // ── Employee: get own attendance records (paginated) ──────────────────────
  getMyRecords: async (
    params: AttendanceListParams = {},
  ): Promise<PaginatedResponse<AttendanceRecordApi>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AttendanceRecordApi>>>(
      '/attendance/my-records',
      {
        params: {
          preset: params.preset,
          startDate: params.startDate,
          endDate: params.endDate,
          page: params.page ?? 0,
          size: params.size ?? 10,
        },
      },
    )
    return response.data.data
  },

  // ── Admin: get all employees' attendance records (paginated) ──────────────
  getAdminRecords: async (
    params: AdminAttendanceListParams = {},
  ): Promise<PaginatedResponse<AttendanceRecordApi>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AttendanceRecordApi>>>(
      '/attendance/admin/records',
      {
        params: {
          userId: params.userId,
          preset: params.preset,
          startDate: params.startDate,
          endDate: params.endDate,
          page: params.page ?? 0,
          size: params.size ?? 10,
        },
      },
    )
    return response.data.data
  },

  // ── Admin: export attendance as file (returns blob) ───────────────────────
  exportAttendance: async (
    params: AdminAttendanceListParams = {},
  ): Promise<Blob> => {
    const response = await apiClient.get('/attendance/admin/export', {
      params: {
        preset: params.preset,
        startDate: params.startDate,
        endDate: params.endDate,
        userId: params.userId,
      },
      responseType: 'blob',
    })
    return response.data as Blob
  },
}
*/
