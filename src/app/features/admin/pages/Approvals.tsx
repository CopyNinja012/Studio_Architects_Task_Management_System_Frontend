import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardCheck, CheckCircle2, RotateCcw, Search,
  Clock, Eye, X, Building2
} from 'lucide-react'
import { Card } from '@/shared/components/ui/Card'
import { DataTable, type Column } from '@/shared/components/table/DataTable'
import { Pagination } from '@/shared/components/ui/Pagination'
import { PageLoader } from '@/shared/components/ui/Loader'
import { taskApi } from '../api/taskApi'
import { projectApi } from '../api/projectApi'
import type { TaskApi, TaskStatusApi } from '../model/types'
import { formatDate } from '@/shared/lib/date'
import { cn } from '@/shared/lib/cn'
import { StatusPill } from '@/shared/components/status/StatusPill'
import { TaskDetailModal } from '../components/TaskDetailModal'
import { ReworkModal } from '../components/ReworkModal'
import { toast } from 'sonner'
import { useAuthStore } from '@/store'

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Approvals() {
  const { user } = useAuthStore()
  const [tasks, setTasks]           = useState<TaskApi[]>([])
  const [projects, setProjects]     = useState<Record<string, string>>({})
  const [loading, setLoading]       = useState(true)
  const [activeTab, setActiveTab]   = useState<TaskStatusApi>('UNDER_REVIEW')
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const [reworkTask, setReworkTask] = useState<TaskApi | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [taskRes, projRes] = await Promise.all([
        taskApi.getTasks({ size: 500 }),
        projectApi.getAllProjects({}, 0, 200)
      ])
      
      let visibleTasks = taskRes.content
      if (user.roles.includes('project_manager')) {
        visibleTasks = visibleTasks.filter(t => t.createdBy?.id === user.id)
      }
      
      setTasks(visibleTasks)
      const pMap: Record<string, string> = {}
      projRes.content.forEach(p => { pMap[p.id] = p.projectName })
      setProjects(pMap)
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = useMemo(() => tasks.filter(t => {
    const q = search.toLowerCase()
    const pName = projects[t.projectId]?.toLowerCase() || ''
    return (!search || t.taskName.toLowerCase().includes(q) || t.jobNumber.toLowerCase().includes(q) || t.assignedTo.name.toLowerCase().includes(q) || pName.includes(q))
  }), [tasks, search, projects])

  const paginated = useMemo(() => {
    return filtered
      .filter(t => t.status === activeTab)
      .slice((page - 1) * 10, page * 10)
  }, [filtered, activeTab, page])

  const counts = useMemo(() => ({
    UNDER_REVIEW: filtered.filter(t => t.status === 'UNDER_REVIEW').length,
    COMPLETED: filtered.filter(t => t.status === 'COMPLETED').length,
    REWORK_REQUESTED: filtered.filter(t => t.status === 'REWORK_REQUESTED').length,
  }), [filtered])

  const handleApprove = async (task: TaskApi) => {
    setApprovingId(task.id)
    try {
      const updated = await taskApi.reviewTask(task.id, { approved: true, remarks: 'Approved' })
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t))
      toast.success('Task approved successfully')
    } catch {
      toast.error('Failed to approve task')
    } finally {
      setApprovingId(null)
    }
  }

  const handleRework = async (note: string) => {
    if (!reworkTask) return
    try {
      const updated = await taskApi.reviewTask(reworkTask.id, { approved: false, remarks: note })
      setTasks(prev => prev.map(t => t.id === reworkTask.id ? updated : t))
      toast.success('Task sent back for rework')
    } catch {
      toast.error('Failed to send rework')
    }
    setReworkTask(null)
  }

  const columns: Column<TaskApi>[] = [
    { key: 'jobNumber', header: 'Task ID', width: '110px', render: row => <span className="text-[11px] font-mono font-bold text-primary-olive bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">{row.jobNumber}</span> },
    {
      key: 'taskName', header: 'Task', sortable: true,
      render: (row) => (
        <div>
          <p className="text-[13px] font-semibold text-text-dark truncate max-w-40">{row.taskName}</p>
          <p className="text-[10px] text-text-light font-medium uppercase">Category: {row.category.toLowerCase().replace(/_/g, ' ')}</p>
        </div>
      ),
    },
    { key: 'assignedTo', header: 'Assignee', render: row => <span className="text-[12px] font-medium text-text-medium">{row.assignedTo.name}</span> },
    {
      key: 'projectId', header: 'Project',
      render: (row) => (
        <span className="text-xs font-bold text-text-dark truncate max-w-40 block">{projects[row.projectId] || 'Assigned Project'}</span>
      ),
    },

    { key: 'plannedEndDate', header: 'Deadline', render: (row) => <span className="text-[12px] text-text-medium font-medium">{formatDate(row.plannedEndDate)}</span> },
    { key: 'status', header: 'Status', align: 'center', render: row => <StatusPill status={row.status} /> },
    {
      key: '_actions', header: '', align: 'center', width: '100px',
      render: (row) => {
        if (row.status !== 'UNDER_REVIEW') return null
        return (
          <div className="flex items-center gap-1 justify-center">
            <button
              onClick={(e) => { e.stopPropagation(); handleApprove(row) }}
              disabled={approvingId === row.id}
              className="p-1.5 rounded-lg hover:bg-emerald-50 text-text-light hover:text-emerald-600 transition-colors disabled:opacity-40"
              title="Approve"
            >
              <CheckCircle2 size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setReworkTask(row) }}
              className="p-1.5 rounded-lg hover:bg-rose-50 text-text-light hover:text-rose-600 transition-colors"
              title="Send for Rework"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        )
      }
    }
  ]

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 animate-fade-in">
      <Card padding="none" className="border border-surface-border shadow-sm overflow-visible bg-transparent">
        
        {/* ── Toolbar ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-4 py-4 lg:py-3 border-b border-surface-border bg-white rounded-t-2xl relative z-30">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1 min-w-0">
            {/* Search */}
            <div className="relative shrink-0 w-full sm:w-52">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
              <input 
                value={search} 
                onChange={e => { setSearch(e.target.value); setPage(1) }} 
                placeholder="Search approvals…" 
                className="w-full pl-9 pr-3 h-9 text-[12px] border border-surface-border rounded-xl bg-[#F9FAFB] focus:outline-none focus:border-primary-olive focus:ring-4 focus:ring-primary-olive/5 transition-all font-medium placeholder:text-text-light" 
              />
            </div>

            <div className="hidden sm:block h-6 w-px bg-surface-border" />

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] overflow-x-auto no-scrollbar max-w-full">
              {([
                { value: 'UNDER_REVIEW',     label: 'Pending' },
                { value: 'COMPLETED',        label: 'Approved'        },
                { value: 'REWORK_REQUESTED', label: 'Rework'          },
              ] as const).map((s) => (
                <button
                  key={s.value}
                  onClick={() => { setActiveTab(s.value); setPage(1) }}
                  className={cn(
                    "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap",
                    activeTab === s.value 
                      ? "bg-white text-primary-olive shadow-sm ring-1 ring-black/5" 
                      : "text-text-light hover:text-text-medium"
                  )}
                >
                  {s.label}
                  <span className="ml-1 text-[8px] opacity-40">
                    {counts[s.value]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
            {search && (
              <button 
                onClick={() => { setSearch(''); setPage(1) }} 
                className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 px-2 h-8 rounded-lg hover:bg-red-50 transition-colors"
              >
                <X size={12} />
              </button>
            )}

            <span className="text-[10px] font-black uppercase tracking-widest text-text-light bg-surface-hover px-2 py-1 rounded-md border border-surface-border">
              {paginated.length} Items
            </span>
          </div>
        </div>

        {/* ── Table & Pagination Wrapper ────────────────────────────────────────── */}
        <div className="rounded-b-2xl overflow-hidden relative z-10 bg-white">
          <DataTable 
            columns={columns} 
            data={paginated} 
            loading={loading} 
            rowKey={r => r.id} 
            onRowClick={row => setDetailTaskId(row.id)} 
            emptyMessage="No tasks found" 
            emptyIcon={<ClipboardCheck size={40} />} 
          />
          <div className="px-5 py-3.5 border-t border-surface-border bg-white">
            <Pagination 
              page={page} 
              total={filtered.filter(t => t.status === activeTab).length} 
              pageSize={10} 
              onPageChange={setPage} 
            />
          </div>
        </div>
      </Card>

      {reworkTask && (
        <ReworkModal 
          task={reworkTask} 
          onClose={() => setReworkTask(null)} 
          onSubmit={handleRework} 
        />
      )}

      <TaskDetailModal 
        id={detailTaskId}
        open={!!detailTaskId}
        onClose={() => setDetailTaskId(null)}
        onTaskUpdated={(updated) => {
          setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
        }}
      />
    </div>
  )
}
