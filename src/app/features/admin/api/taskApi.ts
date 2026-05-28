import { apiClient } from '@/shared/lib/api/client'
import type {
  ApiResponse,
  PaginatedResponse,
  TaskApi,
  CreateTaskRequest,
  ReviewTaskRequest,
  SubmitTaskRequest,
  TaskTimelineResponse,
  TaskTemplateRef,
  TaskPriorityApi,
  TaskStatusApi,
  TaskAttachmentResponse,
} from '../model/types'

// ─── Query params for listing tasks ──────────────────────────────────────────

export interface TaskListParams {
  projectId?: string
  assignedToUserId?: string
  taskName?: string
  status?: TaskStatusApi | string
  priority?: TaskPriorityApi | string
  source?: string
  page?: number
  size?: number
}

// ─── Task API ────────────────────────────────────────────────────────────────

const BASE = '/tasks'

export const taskApi = {
  // ── Create a new task (admin assigns / employee can also create if allowed) ──
  createTask: async (data: CreateTaskRequest): Promise<TaskApi> => {
    const res = await apiClient.post<ApiResponse<TaskApi>>(BASE, data)
    return res.data.data
  },

  // ── Get ALL tasks (admin / project manager view) ───────────────────────────
  getTasks: async (params: TaskListParams = {}): Promise<PaginatedResponse<TaskApi>> => {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<TaskApi>>>(`${BASE}/allTasks`, {
      params: {
        projectId: params.projectId,
        taskName: params.taskName,
        status: params.status,
        priority: params.priority,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    })
    return res.data.data
  },

  // ── Get tasks assigned to current user (employee / admin "my tasks") ───────
  // ✅ matches Spring: GET /api/tasks/my-tasks
  getMyTasks: async (params: TaskListParams = {}): Promise<PaginatedResponse<TaskApi>> => {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<TaskApi>>>(`${BASE}/my-tasks`, {
      params: {
        projectId: params.projectId,
        status: params.status,
        priority: params.priority,
        source: params.source,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    })
    return res.data.data
  },

  // ── Get a single task by ID ────────────────────────────────────────────────
  getTaskById: async (taskId: string): Promise<TaskApi> => {
    const res = await apiClient.get<ApiResponse<TaskApi>>(`${BASE}/${taskId}`)
    return res.data.data
  },

  // ── Delete a task ──────────────────────────────────────────────────────────
  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`${BASE}/${taskId}`)
  },

  // ── Admin reviews (approve / rework) ───────────────────────────────────────
  reviewTask: async (taskId: string, data: ReviewTaskRequest): Promise<TaskApi> => {
    const res = await apiClient.post<ApiResponse<TaskApi>>(`${BASE}/${taskId}/review`, data)
    return res.data.data
  },

  // ── Employee submits a task for review (works for admin-assigned & manual) ─
  submitTask: async (taskId: string, data: SubmitTaskRequest, files?: File[]): Promise<TaskApi> => {
    const formData = new FormData()
    
    // The backend expects "submission" part to be a JSON blob (MediaType.APPLICATION_JSON)
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    formData.append('submission', blob, 'submission.json')

    // The backend expects "files" part to be one or more binary file parts
    if (files && files.length > 0) {
      files.forEach(f => formData.append('files', f))
    }

    const res = await apiClient.post<ApiResponse<TaskApi>>(`${BASE}/${taskId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data.data
  },

  // ── Attachments ────────────────────────────────────────────────────────────
  listAttachments: async (taskId: string): Promise<TaskAttachmentResponse[]> => {
    const res = await apiClient.get<ApiResponse<TaskAttachmentResponse[]>>(`${BASE}/${taskId}/attachments`)
    return res.data.data
  },

  downloadAttachment: async (taskId: string, attachmentId: string): Promise<void> => {
    const res = await apiClient.get(`${BASE}/${taskId}/attachments/${attachmentId}/download`, {
      responseType: 'blob'
    })
    
    // Trigger browser download
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    
    // Extract filename from header if possible, or use a default
    const disposition = res.headers['content-disposition']
    let fileName = 'attachment'
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const match = disposition.match(/filename="?([^"]+)"?/)
      if (match) fileName = match[1]
    }
    
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  // ── Timeline ───────────────────────────────────────────────────────────────
  getTaskTimeline: async (taskId: string): Promise<TaskTimelineResponse[]> => {
    const res = await apiClient.get<ApiResponse<TaskTimelineResponse[]>>(`${BASE}/${taskId}/timeline`)
    return res.data.data
  },

  // ── Delete attachment ──────────────────────────────────────────────────────
  deleteAttachment: async (taskId: string, attachmentId: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${taskId}/attachments/${attachmentId}`)
  },

  // ── Get manual tasks created by the employee ──────────────────────────────
  getManualTasks: async (params: TaskListParams = {}): Promise<PaginatedResponse<TaskApi>> => {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<TaskApi>>>(`${BASE}/my-tasks`, {
      params: {
        ...params,
        source: 'GENERAL_INTERNAL',
        page: params.page ?? 0,
        size: params.size ?? 50,
      },
    })
    return res.data.data
  },

  // ── Suggestions ────────────────────────────────────────────────────────────
  getTaskSuggestions: async (): Promise<TaskTemplateRef[]> => {
    const res = await apiClient.get<ApiResponse<TaskTemplateRef[]>>(`${BASE}/suggestions`)
    return res.data.data
  },
}
