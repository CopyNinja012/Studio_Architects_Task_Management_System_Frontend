// ─── Employee Task ────────────────────────────────────────────────────────────

export type EmployeeTaskStatus =
  | 'pending'
  | 'in_progress'
  | 'submitted'
  | 'approved'
  | 'rework'
  | 'completed'

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export interface EmployeeTask {
  id: string
  wbsCode: string
  title: string
  description: string
  projectId: string
  projectName: string
  assignedBy: string          // admin / PM name
  status: EmployeeTaskStatus
  priority: TaskPriority
  startDate: string           // ISO
  dueDate: string             // ISO
  completedDate?: string
  progress: number            // 0–100
  estimatedHours: number
  actualHours: number
  reworkNote?: string         // set by admin when sending back for rework
  submittedAt?: string
  attachments?: SubmittedFile[]
  tags: string[]
}

export interface SubmittedFile {
  name: string
  url: string
  size: number                // bytes
  uploadedAt: string
}

// ─── Manual Task ──────────────────────────────────────────────────────────────

import type { TaskSource, TaskReferenceType } from '@/features/admin/model/types'

export type ReferenceType = TaskReferenceType

export interface ManualTaskEntry {
  id: string
  title: string
  projectName?: string
  category: string
  source: TaskSource
  referenceType: ReferenceType
  referredBy: string
  startDate: string           // ISO date
  dueDate: string             // ISO date
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  notes?: string
  createdAt: string
}

export interface ManualTaskFormData {
  title: string
  projectName?: string
  category: string
  source: TaskSource
  referenceType: ReferenceType
  referredBy: string
  startDate: string
  dueDate: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  notes?: string
}

/*
// ─── Attendance ───────────────────────────────────────────────────────────────

export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'leave' | 'holiday'

export interface AttendanceRecord {
  id: string
  date: string                // ISO date
  status: AttendanceStatus
  checkIn?: string            // HH:mm
  checkOut?: string           // HH:mm
  hoursWorked?: number
  leaveType?: 'casual' | 'sick' | 'earned' | 'unpaid'
  note?: string
}

export interface AttendanceSummary {
  month: string               // "May 2025"
  totalDays: number
  present: number
  absent: number
  halfDay: number
  leaves: number
  holidays: number
}
*/

// ─── Performance ──────────────────────────────────────────────────────────────

export interface EmployeePerformanceMonth {
  month: string               // "May 2025"
  overallScore: number        // 0–100
  tasksCompleted: number
  tasksTotal: number
  onTimeDelivery: number      // %
  qualityScore: number        // 0–100
  // attendanceScore: number     // 0–100
  collaborationScore: number  // 0–100
  rank: number
  badge?: 'gold' | 'silver' | 'bronze'
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface EmployeeProfile {
  id: string
  name: string
  email: string
  phone: string
  address: string
  designation: string
  department: string
  dateOfJoining: string
  skills: string[]
  roles: string[]
  bankAccountNumber?: string
  bankIfsc?: string
  enabled: boolean
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface TaskReport {
  month: string
  tasksAssigned: number
  tasksCompleted: number
  tasksRework: number
  avgCompletionDays: number
  onTimeRate: number          // %
}
