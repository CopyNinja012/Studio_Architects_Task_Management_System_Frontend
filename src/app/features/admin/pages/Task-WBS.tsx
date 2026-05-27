import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ListTree, CheckCircle2, RotateCcw, Search,
  Eye, X, Plus, Trash2, FolderKanban,
} from 'lucide-react'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { StatusPill } from '@/shared/components/status/StatusPill'
import { PriorityTag } from '@/shared/components/status/PriorityTag'
import { DataTable, type Column } from '@/shared/components/table/DataTable'
import { Pagination } from '@/shared/components/ui/Pagination'
import { Dropdown } from '@/shared/components/ui/Dropdown'
import { PageLoader } from '@/shared/components/ui/Loader'
import { taskApi } from '../api/taskApi'
import { projectApi } from '../api/projectApi'
import type { TaskApi as TaskApiType } from '../model/types'
import { TASK_STATUSES, PRIORITIES } from '../model/constant'
import { formatDate } from '@/shared/lib/date'
import { cn } from '@/shared/lib/cn'
import { ReworkModal } from '../components/ReworkModal'
import { CreateTaskModal } from '../components/CreateTaskModal'
import { TaskDetailModal } from '../components/TaskDetailModal'
import { toast } from 'sonner'
import { PATHS } from '@/router/path'

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressCell({ value }: { value: number }) {
  const color =
    value >= 75 ? '#40521B' :
    value >= 50 ? '#556F1F' :
    value >= 25 ? '#f59e0b' : '#d1d5db'
  return (
    <div className="flex flex-col gap-1 min-w-22.5">
      <span className="text-[11px] font-black text-text-dark">{value}%</span>
      <div className="h-1.25 w-full bg-surface-border rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function TaskWBS() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<TaskApiType[]>([])
  const [projects, setProjects] = useState<Record<string, string>>({})
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [reworkTask, setReworkTask] = useState<TaskApiType | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const fetchData = async (pg = page, sz = pageSize) => {
    setLoading(true)
    try {
      const [taskRes, projRes] = await Promise.all([
        taskApi.getTasks({
          page: pg - 1,
          size: sz,
          taskName: search || undefined,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
        }),
        projectApi.getAllProjects({}, 0, 200),
      ])

      setTasks(taskRes.content)
      setTotalElements(taskRes.totalElements)

      const pMap: Record<string, string> = {}
      projRes.content.forEach((p: any) => { pMap[p.id] = p.projectName ?? p.name })
      setProjects(pMap)
    } catch {
      setTasks([])
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page, pageSize, statusFilter, priorityFilter])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      fetchData(1, pageSize)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  const handleApprove = async (task: TaskApiType) => {
    setApprovingId(task.id)
    try {
      const updated = await taskApi.reviewTask(task.id, { approved: true, reviewComment: 'Approved' })
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t))
      toast.success('Task approved')
    } catch {
      toast.error('Failed to approve task')
    } finally {
      setApprovingId(null)
    }
  }

  const handleRework = async (note: string) => {
    if (!reworkTask) return
    try {
      const updated = await taskApi.reviewTask(reworkTask.id, { approved: false, reviewComment: note })
      setTasks(prev => prev.map(t => t.id === reworkTask.id ? updated : t))
      toast.success('Task sent back for rework')
    } catch {
      toast.error('Failed to send rework')
    }
    setReworkTask(null)
  }

  const handleDelete = async (task: TaskApiType) => {
    try {
      await taskApi.deleteTask(task.id)
      setTasks(prev => prev.filter(t => t.id !== task.id))
      toast.success('Task deleted')
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const columns: Column<TaskApiType>[] = [
    {
      key: 'jobNumber', header: 'Task ID', width: '110px',
      render: row => (
        <span className="text-[11px] font-mono font-bold text-primary-olive bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
          {row.jobNumber}
        </span>
      ),
    },
    {
      key: 'projectId', header: 'Project',
      render: row => (
        <div className="flex items-center gap-2 max-w-37.5">
          <div className="w-5 h-5 rounded bg-primary-50 flex items-center justify-center shrink-0">
            <FolderKanban size={12} className="text-primary-olive" />
          </div>
          <span className="text-[12px] font-bold text-text-dark truncate">
            {projects[row.projectId] || 'Unknown Project'}
          </span>
        </div>
      ),
    },
    {
      key: 'taskName', header: 'Task Name', sortable: true,
      render: row => (
        <p className="text-[13px] font-semibold text-text-dark max-w-45 truncate" title={row.taskName}>
          {row.taskName}
        </p>
      ),
    },
    {
      key: 'category', header: 'Category',
      render: row => (
        <span className="text-[11px] font-semibold text-text-medium capitalize">
          {row.category.toLowerCase().replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'assignedTo', header: 'Assignee',
      render: row => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-black text-primary-olive shrink-0">
            {(row.assignedTo.name || '?').charAt(0).toUpperCase()}
          </div>
          <span className="text-[12px] font-medium text-text-medium truncate max-w-25">{row.assignedTo.name}</span>
        </div>
      ),
    },
    {
      key: 'plannedStartDate', header: 'Start Date', sortable: true,
      render: row => <span className="text-[12px] font-medium text-text-medium">{formatDate(row.plannedStartDate)}</span>,
    },
    {
      key: 'plannedEndDate', header: 'Deadline', sortable: true,
      render: row => {
        const due = new Date(row.plannedEndDate)
        const now = new Date()
        const late = due < now && row.status !== 'COMPLETED'
        return (
          <span className={cn('text-[12px] font-bold', late ? 'text-red-500' : 'text-text-medium')}>
            {formatDate(row.plannedEndDate)}
          </span>
        )
      },
    },
    { key: 'priority', header: 'Priority', align: 'center', render: row => <PriorityTag priority={row.priority.toLowerCase() as any} /> },
    { key: 'status', header: 'Status', align: 'center', render: row => <StatusPill status={row.status.toLowerCase() as any} /> },
    {
      key: 'progress', header: 'Progress',
      render: row => {
        const planned = row.plannedEffortsHours || 1
        const pct = Math.round((row.actualEffortsHours / planned) * 100)
        return <ProgressCell value={Math.min(100, Math.max(0, pct))} />
      },
    },
  ]

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 animate-fade-in">
      <Card padding="none" className="border border-surface-border shadow-sm overflow-visible bg-transparent">
        
        {/* ── Toolbar ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col xl:flex-row xl:items-center gap-4 px-4 py-4 xl:py-3 border-b border-surface-border bg-white relative z-40 rounded-t-2xl">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            <div className="relative shrink-0 w-full sm:w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search tasks…"
                className="w-full pl-9 pr-3 h-8 text-[12px] border border-surface-border rounded-lg bg-white
                           focus:outline-none focus:border-primary-olive focus:ring-2 focus:ring-primary-olive/10
                           transition-all font-medium placeholder:text-text-light"
              />
            </div>

            <div className="hidden sm:block h-6 w-px bg-surface-border shrink-0" />

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2.5">
              <div className="shrink-0 w-full sm:w-36">
                <Dropdown
                  options={[{ value: '', label: 'All Status' }, ...TASK_STATUSES]}
                  value={statusFilter}
                  onChange={v => { setStatusFilter(v); setPage(1) }}
                  placeholder="All Status"
                />
              </div>

              <div className="shrink-0 w-full sm:w-36">
                <Dropdown
                  options={[{ value: '', label: 'All Priority' }, ...PRIORITIES]}
                  value={priorityFilter}
                  onChange={v => { setPriorityFilter(v); setPage(1) }}
                  placeholder="All Priority"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between xl:justify-end gap-3 shrink-0">
            {(search || statusFilter || priorityFilter) && (
              <button
                onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); setPage(1) }}
                className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 px-2 h-7 rounded-lg hover:bg-red-50 transition-colors"
              >
                <X size={12} /> Clear
              </button>
            )}

            <div className="flex items-center gap-4">
              <span className="hidden sm:inline shrink-0 text-[11px] font-medium text-text-light">
                {totalElements} task{totalElements !== 1 ? 's' : ''}
              </span>

              <Button
                icon={<Plus size={14} />}
                onClick={() => setCreateOpen(true)}
                className="h-8 text-[12px] px-3"
              >
                Add Task
              </Button>
            </div>
          </div>
        </div>

        {/* ── Table & Pagination Wrapper (Clipped) ──────────────────────────────── */}
        <div className="rounded-b-2xl overflow-hidden relative z-10 bg-white">
          <DataTable
            columns={columns}
            data={tasks}
            loading={false}
            rowKey={r => r.id}
            onRowClick={row => setDetailId(row.id)}
            emptyMessage="No tasks found"
            emptyIcon={<ListTree size={36} />}
          />

          <div className="px-5 py-3.5 border-t border-surface-border bg-white">
            <Pagination
              page={page}
              total={totalElements}
              pageSize={pageSize}
              onPageChange={p => setPage(p)}
              onPageSizeChange={s => { setPageSize(s); setPage(1) }}
              pageSizeOptions={[10, 20, 50]}
            />
          </div>
        </div>
      </Card>

      {reworkTask && <ReworkModal task={reworkTask} onClose={() => setReworkTask(null)} onSubmit={handleRework} />}
      <CreateTaskModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={fetchData} />
      <TaskDetailModal id={detailId} open={!!detailId} onClose={() => setDetailId(null)} hideActions={true} />
    </div>
  )
}

