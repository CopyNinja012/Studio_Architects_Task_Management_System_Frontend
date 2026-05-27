import { apiClient } from '@/shared/lib/api/client'
import type { 
  ApiResponse, 
  DateRangeRequest, 
  ProjectReportResponse, 
  ProjectReportSummary,
  EmployeeWorkReportResponse,
  EmployeeWorkReportSummary,
  EmployeePipelineReportResponse,
  EmployeePipelineReportSummary,
  EmployeePerformanceReportResponse,
  EmployeePerformanceReportSummary
} from '../model/types'

const BASE = '/v1/reports'

export const reportsApi = {
  // ─── Project Reports ───────────────────────────────────────────────────────
  
  getProjectsSummary: async (params: DateRangeRequest): Promise<ProjectReportResponse[]> => {
    const res = await apiClient.get<ApiResponse<ProjectReportResponse[]>>(`${BASE}/projects`, { params })
    return res.data.data
  },

  getProjectDetail: async (projectId: string, params: DateRangeRequest): Promise<ProjectReportSummary> => {
    const res = await apiClient.get<ApiResponse<ProjectReportSummary>>(`${BASE}/project/${projectId}`, { params })
    return res.data.data
  },

  // ─── Employee Reports (Admin/PM access) ────────────────────────────────────

  getEmployeesWork: async (params: DateRangeRequest): Promise<EmployeeWorkReportResponse[]> => {
    const res = await apiClient.get<ApiResponse<EmployeeWorkReportResponse[]>>(`${BASE}/employees/work`, { params })
    return res.data.data
  },

  getEmployeesPipeline: async (): Promise<EmployeePipelineReportResponse[]> => {
    const res = await apiClient.get<ApiResponse<EmployeePipelineReportResponse[]>>(`${BASE}/employees/pipeline`)
    return res.data.data
  },

  getEmployeesPerformance: async (params: DateRangeRequest): Promise<EmployeePerformanceReportResponse[]> => {
    const res = await apiClient.get<ApiResponse<EmployeePerformanceReportResponse[]>>(`${BASE}/employees/performance`, { params })
    return res.data.data
  },

  // ─── Specific Employee Reports (Everyone access for self, Admin/PM for others) ──

  getEmployeeWork: async (userId: string, params: DateRangeRequest): Promise<EmployeeWorkReportSummary> => {
    const res = await apiClient.get<ApiResponse<EmployeeWorkReportSummary>>(`${BASE}/employee/${userId}/work`, { params })
    return res.data.data
  },

  getEmployeePipeline: async (userId: string): Promise<EmployeePipelineReportSummary> => {
    const res = await apiClient.get<ApiResponse<EmployeePipelineReportSummary>>(`${BASE}/employee/${userId}/pipeline`)
    return res.data.data
  },

  getEmployeePerformance: async (userId: string, params: DateRangeRequest): Promise<EmployeePerformanceReportSummary> => {
    const res = await apiClient.get<ApiResponse<EmployeePerformanceReportSummary>>(`${BASE}/employee/${userId}/performance`, { params })
    return res.data.data
  },
}
