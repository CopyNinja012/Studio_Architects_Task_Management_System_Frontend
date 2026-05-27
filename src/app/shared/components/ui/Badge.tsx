import { type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size?: 'sm' | 'md'
  dot?: boolean
  className?: string
}

const variants = {
  default: 'bg-primary-100 text-primary-olive border-surface-border-strong',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-teal-50 text-teal-700 border-teal-200',
  neutral: 'bg-gray-50 text-gray-600 border-gray-200',
}

const dotColors = {
  default: 'bg-primary-secondary',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-teal-500',
  neutral: 'bg-gray-400',
}

export function Badge({ children, variant = 'default', size = 'sm', dot, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        variants[variant],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase().replace(/_/g, ' ')
  const key = status.toLowerCase()
  const map: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'neutral', label: 'Inactive' },
    pending: { variant: 'warning', label: 'Pending' },
    planning: { variant: 'neutral', label: 'Planning' },
    assigned: { variant: 'neutral', label: 'Assigned' },
    completed: { variant: 'success', label: 'Completed' },
    in_progress: { variant: 'default', label: 'In Progress' },
    on_hold: { variant: 'warning', label: 'On Hold' },
    cancelled: { variant: 'danger', label: 'Cancelled' },
    approved: { variant: 'success', label: 'Approved' },
    rejected: { variant: 'danger', label: 'Rejected' },
    rework: { variant: 'warning', label: 'Rework' },
    rework_requested: { variant: 'warning', label: 'Rework' },
    submitted: { variant: 'info', label: 'Submitted' },
    under_review: { variant: 'info', label: 'Under Review' },
  }
  const config = map[key] || { variant: 'neutral', label: s.charAt(0).toUpperCase() + s.slice(1) }
  return <Badge variant={config.variant} dot>{config.label}</Badge>
}

export function PriorityBadge({ priority }: { priority: string }) {
  const p = priority.toLowerCase()
  const map: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    low: { variant: 'neutral', label: 'Low' },
    medium: { variant: 'warning', label: 'Medium' },
    high: { variant: 'danger', label: 'High' },
    critical: { variant: 'danger', label: 'Critical' },
    urgent: { variant: 'danger', label: 'Urgent' },
  }
  const config = map[p] || { variant: 'neutral', label: priority }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

