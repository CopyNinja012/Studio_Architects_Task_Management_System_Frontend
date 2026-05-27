/**
 * ProjectColumns.tsx
 * Reusable column definitions for the Projects table.
 * Import these into any screen that renders a project list.
 */
import { Building2, MoreVertical } from 'lucide-react'
import type { Column } from './DataTable'
import type { Project } from '@/features/admin/model/types'
import { StatusPill } from '@/shared/components/status/StatusPill'
import { PriorityTag } from '@/shared/components/status/PriorityTag'
import { formatDate, daysRemaining } from '@/shared/lib/date'
import { cn } from '@/shared/lib/cn'

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressCell({ value }: { value: number }) {
  const color =
    value >= 75 ? '#40521B' :
    value >= 50 ? '#556F1F' :
    value >= 25 ? '#f59e0b' : '#d1d5db'

  return (
    <div className="flex flex-col gap-1 min-w-27.5">
      <span className="text-[11px] font-black text-text-dark">{value}%</span>
      <div className="h-1.5 w-full bg-surface-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

// ─── Project Type Badge ───────────────────────────────────────────────────────
function TypeBadge({ type }: { type: 'big' | 'small' }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold',
      type === 'big'
        ? 'bg-primary-100 text-primary-olive'
        : 'bg-amber-50 text-amber-700'
    )}>
      {type === 'big' ? 'Big' : 'Small'}
    </span>
  )
}

// ─── Deadline Cell ────────────────────────────────────────────────────────────
function DeadlineCell({ date }: { date: string }) {
  const days = daysRemaining(date)
  const isOverdue = days < 0
  const isNear    = days >= 0 && days < 30

  return (
    <span className={cn(
      'text-[12px] font-bold',
      isOverdue ? 'text-red-500' : isNear ? 'text-amber-600' : 'text-text-medium'
    )}>
      {formatDate(date)}
    </span>
  )
}

// ─── Actions Cell ─────────────────────────────────────────────────────────────
function ActionsCell({ onAction }: { onAction?: () => void }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onAction?.() }}
      className="p-1.5 rounded-lg hover:bg-surface-hover text-text-light hover:text-text-medium transition-colors"
    >
      <MoreVertical size={15} />
    </button>
  )
}

// ─── Column Definitions ───────────────────────────────────────────────────────
export function buildProjectColumns(
  getType: (p: Project) => 'big' | 'small',
  onAction?: (p: Project) => void
): Column<Project>[] {
  return [
    {
      key: 'name',
      header: 'Project Name',
      sortable: true,
      render: row => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
            <Building2 size={15} className="text-primary-olive" />
          </div>
          <span className="text-[13px] font-bold text-text-dark">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Job Number',
      sortable: true,
      render: row => (
        <span className="text-[12px] font-semibold text-text-medium">{row.code}</span>
      ),
    },
    {
      key: 'projectLead',
      header: 'Lead / Employee',
      sortable: true,
      render: row => {
        const leadName = row.projectLead || (row as any).projectLeadName || (row as any).projectLead?.name
        return (
          <span className="text-[12px] font-semibold text-text-medium">{leadName || 'Unassigned'}</span>
        )
      },
    },
    {
      key: 'type',
      header: 'Project Type',
      align: 'center',
      render: row => <TypeBadge type={getType(row)} />,
    },
    {
      key: 'priority',
      header: 'Priority',
      align: 'center',
      render: row => <PriorityTag priority={row.priority as any} />,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: row => <StatusPill status={row.status} />,
    },
    {
      key: 'startDate',
      header: 'Start Date',
      sortable: true,
      render: row => (
        <span className="text-[12px] font-semibold text-text-medium">{formatDate(row.startDate)}</span>
      ),
    },
    {
      key: 'endDate',
      header: 'Deadline',
      sortable: true,
      render: row => <DeadlineCell date={row.endDate} />,
    },
    {
      key: 'progress',
      header: 'Progress',
      render: row => <ProgressCell value={row.progress} />,
    },
    {
      key: '_actions',
      header: '',
      align: 'center',
      width: '48px',
      render: row => <ActionsCell onAction={() => onAction?.(row)} />,
    },
  ]
}


