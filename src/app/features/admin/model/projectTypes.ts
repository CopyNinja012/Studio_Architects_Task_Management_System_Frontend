/**
 * projectTypes.ts
 * TypeScript DTOs matching the Spring Boot backend for the Project module.
 */

// ─── Shared wrappers ──────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PageResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
  empty: boolean
}

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ProjectType   = 'BIG' | 'SMALL'
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'REWORK' | 'CANCELLED' | 'PENDING'

// ─── Request DTOs ─────────────────────────────────────────────────────────────

/** POST /api/admin/projects */
export interface ProjectCreateRequest {
  jobNumber:              string        // @NotBlank, max 50
  projectName:            string        // @NotBlank, max 255
  clientOwnerName:        string        // @NotBlank, max 255
  projectType:            ProjectType   // @NotNull  (BIG | SMALL)
  startDate:              string        // @NotNull  ISO date "YYYY-MM-DD"
  expectedCompletionDate: string        // @NotNull  ISO date "YYYY-MM-DD"
  projectLeadId?:         string        // UUID — optional for SMALL
  assignedEmployeeId?:    string        // UUID — optional
  siteLocation:           string        // @NotBlank, max 500
  description?:           string        // optional, max 2000
}

/** PUT /api/admin/projects/:id */
export interface ProjectUpdateRequest extends Partial<ProjectCreateRequest> {}

/** PATCH /api/admin/projects/:id/status */
export interface ProjectStatusUpdateRequest {
  status: ProjectStatus
  reason?: string
}

/** Query params for GET /api/admin/projects */
export interface ProjectFilterRequest {
  projectName?:   string
  status?:        ProjectStatus
  projectType?:   ProjectType
  projectLeadId?: string
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface AssignableUserResponse {
  id:          string
  name:        string
  email:       string
  designation?: string
  role?:        string
}

export interface ProjectStatusHistoryResponse {
  id:          string
  fromStatus:  ProjectStatus
  toStatus:    ProjectStatus
  changedBy:   string
  changedAt:   string
  reason?:     string
}

export interface UserContactInfo {
  id:    string
  name:  string
  email: string
  phone: string
}

export interface ProjectResponse {
  id:                     string
  jobNumber:              string
  projectName:            string
  clientOwnerName:        string
  projectType:            ProjectType
  status:                 ProjectStatus
  startDate:              string
  expectedCompletionDate: string
  siteLocation:           string
  description?:           string
  progress:               number
  projectLeadId?:         string
  projectLeadName?:       string
  assignedEmployeeId?:    string
  assignedEmployeeName?:  string
  projectLead?:           UserContactInfo
  assignedEmployee?:      UserContactInfo
  createdAt:              string
  updatedAt:              string
}
