import type { ReactNode } from "react"

export type UserSkill = 
  | 'TWO_D_DESIGN' 
  | 'THREE_D_DESIGN' 
  | 'PLANNING' 
  | 'ESTIMATION' 
  | 'INTERIOR_DESIGN' 
  | 'EXTERIOR_DESIGN' 
  | 'STRUCTURAL_DRAWING' 
  | 'AUTOCAD' 
  | 'REVIT' 
  | 'SKETCHUP' 
  | 'SITE_SUPERVISION' 
  | 'CLIENT_HANDLING'

/*
// ─── Attendance ───────────────────────────────────────────────────────────────

export type AttendancePreset =
  | 'TODAY' | 'YESTERDAY'
  | 'THIS_WEEK' | 'LAST_WEEK'
  | 'THIS_MONTH' | 'LAST_MONTH'
  | 'THIS_QUARTER' | 'LAST_QUARTER'
  | 'THIS_YEAR' | 'LAST_YEAR'
  | 'CUSTOM'

export interface AttendanceRecordApi {
  id: string
  userId: string
  userName: string
  date: string           // "yyyy-MM-dd"
  loginTime: string      // ISO datetime
  logoutTime: string     // ISO datetime
  totalHours: number
  exceptionNote: string | null
  isManuallyEdited: boolean
}

export interface AttendanceExceptionRequest {
  userId: string
  date: string           // "yyyy-MM-dd"
  loginTime: string      // ISO datetime
  logoutTime: string     // ISO datetime
  exceptionNote: string
}

export interface AttendanceListParams {
  preset?: AttendancePreset
  startDate?: string     // "yyyy-MM-dd"
  endDate?: string       // "yyyy-MM-dd"
  page?: number
  size?: number
}

export interface AdminAttendanceListParams extends AttendanceListParams {
  userId?: string
}
*/

export interface CreateUserRequest {
  email: string
  password?: string
  role: string
  name: string
  phone: string
  alternativePhone?: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  address: string
  bankAccountNumber: string
  bankIfsc: string
  bankName?: string
  bankBranch?: string
  dateOfJoining: string
  skills: UserSkill[]
  customSkills?: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  phone: string
  alternativePhone?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  address: string
  bankAccountNumber: string
  bankIfsc: string
  bankName?: string
  bankBranch?: string
  dateOfJoining: string
  enabled: boolean
  roles: string[]
  skills: UserSkill[]
  customSkills?: string
}

export interface PaginatedResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
  empty: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface Project {
  id: string
  name: string
  code: string
  description: string
  client: string
  type?: 'BIG' | 'SMALL'
  status: 'PLANNING' | 'IN_PROGRESS' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'REWORK' | 'CANCELLED' | 'PENDING'
  priority: 'low' | 'medium' | 'high' | 'critical'
  startDate: string
  endDate: string
  budget: number
  spent: number
  progress: number
  projectLead: string
  projectLeadId: string
  teamMembers: string[]
  location: string
  category: string
  createdAt: string
}

export interface Employee {
  projectsCompleted: number
  yearsOfExperience: number
  id: string
  employeeId: string
  name: string
  email: string
  phone: string
  role: string
  designation: string
  department: string
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'
  joinDate: string
  salary: number
  manager: string
  location: string
  skills: string[]
  avatar?: string
  performanceScore: number
  tasksCompleted: number
  projectsAssigned: number
}

export interface Task {
  id: string
  title: string
  description: string
  projectId: string
  projectName: string
  assignedTo: string
  assignedToId: string
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'REWORK_REQUESTED' | 'COMPLETED' | 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rework' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  startDate: string
  dueDate: string
  completedDate?: string
  progress: number
  wbsCode: string
  parentTaskId?: string
  level: number
  estimatedHours: number
  actualHours: number
  submittedAt?: string
  reworkNote?: string
  attachments?: string[]
  tags: string[]
}

export interface PerformanceRecord {
  id: string
  employeeId: string
  employeeName: string
  designation: string
  department: string
  month: string
  year: number
  score: number
  tasksCompleted: number
  tasksTotal: number
  onTimeDelivery: number
  qualityScore: number
  attendanceScore: number
  collaborationScore: number
  rank: number
  badge?: 'gold' | 'silver' | 'bronze'
  avatar?: string
}

export interface AuditLog {
  id: string
  userId: string
  username: string
  action: string
  actionDescription: string
  entityType: string
  entityId: string
  entityName: string
  ipAddress: string
  userAgent: string
  status: 'SUCCESS' | 'FAILED' | 'WARNING'
  errorMessage?: string
  oldValue?: string
  newValue?: string
  timestamp: string
  durationMs: number
}

export interface AuditLogFilter {
  userId?: string
  username?: string
  action?: string
  status?: string
  entityType?: string
  entityId?: string
  ipAddress?: string
  startDate?: string
  endDate?: string
  search?: string
}

export interface AuditLogStats {
  totalLogs: number
  successfulActions: number
  failedActions: number
  warningActions: number
  uniqueUsers: number
  actionBreakdown: Record<string, number>
  entityBreakdown: Record<string, number>
  userActivityBreakdown: Record<string, number>
  dailyActivityBreakdown: Record<string, number>
}

export interface TopUserAuditStats {
  userId: string
  username: string
  totalActions: number
  lastActivity: string
  firstActivity: string
  topActions: { action: string; count: number }[]
}

// ─── Task API types ───────────────────────────────────────────────────────────

export type TaskCategory =
  | 'TWO_D_DESIGN' | 'THREE_D_DESIGN' | 'PLANNING' | 'ESTIMATION'
  | 'INTERIOR_DESIGN' | 'EXTERIOR_DESIGN' | 'STRUCTURAL_DRAWING'
  | 'AUTOCAD' | 'REVIT' | 'SKETCHUP' | 'SITE_SUPERVISION' | 'CLIENT_HANDLING'
  | 'SITE_VISIT'

export type TaskPriorityApi = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type TaskStatusApi =
  | 'ASSIGNED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'REWORK_REQUESTED' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD' | 'DRAFT' | 'SUBMITTED' | 'APPROVED'

export interface TaskTimelineResponse {
  performedBy: ReactNode
  id: string
  fromStatus: TaskStatusApi
  toStatus: TaskStatusApi
  changedBy: {
    id: string
    name: string
    email: string
  }
  remarks: string
  timestamp: string
}

export type TaskSource = 'PROJECT_DRIVEN' | 'GENERAL_INTERNAL' | 'FIELD_DIRECT'

export type TaskReferenceType = 'VERBAL' | 'ON_CALL' | 'VISIT' | 'EMAIL' | 'OTHER'

export interface TaskUserRef {
  id: string
  name: string
  email: string
}

export interface TaskTemplateRef {
  id: string
  name: string
  isCustomAdded: boolean
}

export interface TaskAttachmentResponse {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedBy: string
  uploadedAt: string
}

export interface TaskApi {
  id: string
  jobNumber: string
  taskName: string
  template: TaskTemplateRef | null
  category: TaskCategory
  description: string
  projectId: string
  projectName?: string
  assignedTo: TaskUserRef
  createdBy: TaskUserRef
  source: TaskSource
  priority: TaskPriorityApi
  status: TaskStatusApi
  referenceType?: TaskReferenceType
  referredBy?: string
  attachments?: TaskAttachmentResponse[]
  plannedStartDate: string    // "yyyy-MM-dd"
  plannedEndDate: string      // "yyyy-MM-dd"
  plannedEffortsHours: number
  actualEffortsHours: number
  createdAt: string
  updatedAt: string
}

export interface CreateTaskRequest {
  jobNumber: string
  projectId?: string          // Optional in manual form
  taskName: string
  templateId?: string
  category: TaskCategory
  description: string
  assignedToUserId: string
  source?: TaskSource
  priority: TaskPriorityApi
  referenceType?: TaskReferenceType
  referredBy?: string
  plannedStartDate: string    // "yyyy-MM-dd"
  plannedEndDate: string      // "yyyy-MM-dd"
  plannedEffortsHours: number
}

export interface ReviewTaskRequest {
  approved: boolean
  reviewComment: string
}

// ─── Reports & Analytics ───────────────────────────────────────────────────

export type DateRangePreset = 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'LAST_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'CUSTOM'

export interface DateRangeRequest {
  preset: DateRangePreset
  startDate?: string
  endDate?: string
}

export interface ProjectReportSummary {
  completionPercentage: number
  delayedTasksCount: number
  totalTasks: number
  completedTasks: number
}

export interface ProjectReportResponse {
  projectId: string
  projectName: string
  jobNumber: string
  report: ProjectReportSummary
}

export interface EmployeeWorkReportSummary {
  taskCountByStatus: Record<string, number>
  totalPlannedHours: number
  totalActualHours: number
  effortVariance: number
  contributingProjects: string[]
}

export interface EmployeeWorkReportResponse {
  userId: string
  userName: string
  email: string
  report: EmployeeWorkReportSummary
}

export interface PipelineTaskRef {
  id: string
  jobNumber: string
  taskName: string
  plannedStartDate: string
  plannedEndDate: string
}

export interface EmployeePipelineReportSummary {
  currentTask: PipelineTaskRef | null
  nextScheduledTask: PipelineTaskRef | null
}

export interface EmployeePipelineReportResponse {
  userId: string
  userName: string
  email: string
  report: EmployeePipelineReportSummary
}

export interface EmployeePerformanceReportSummary {
  efficiencyScore: number
  reworkCount: number
  onTimeDeliveryRate: number
}

export interface EmployeePerformanceReportResponse {
  userId: string
  userName: string
  email: string
  report: EmployeePerformanceReportSummary
}

export interface SubmitTaskRequest {
  submissionNotes: string
  attachmentPaths: string[]
  hoursInvested: number   // total hours worked (timer elapsed converted to hours)
}
