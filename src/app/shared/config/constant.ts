export const APP_NAME = 'ArchSystem'
export const APP_VERSION = '1.0.0'

export const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  inactive: 'bg-gray-100 text-gray-600 border-gray-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-[#E8EDE0] text-[#6B7F3A] border-[#C5CCBA]',
  on_hold: 'bg-orange-100 text-orange-700 border-orange-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  rework: 'bg-amber-100 text-amber-700 border-amber-200',
  submitted: 'bg-blue-100 text-blue-700 border-blue-200',
} as const

export const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-600 border-gray-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  critical: 'bg-red-100 text-red-700 border-red-200',
} as const

export const ITEMS_PER_PAGE = 10
