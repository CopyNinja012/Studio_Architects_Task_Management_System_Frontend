import { useEffect, useState, useMemo } from 'react'
import {
  ListTree, CheckCircle2, RotateCcw, Search,
  X, Plus, Trash2, FolderKanban,
} from 'lucide-react'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { PriorityBadge, StatusBadge } from '@/shared/components/ui/Badge'
import { DataTable, type Column } from '@/shared/components/table/DataTable'
import { Pagination } from '@/shared/components/ui/Pagination'
import { Dropdown } from '@/shared/components/ui/Dropdown'
import { PageLoader } from '@/shared/components/ui/Loader'
import { taskApi } from '@/features/admin/api/taskApi'
import { projectApi } from '@/features/admin/api/projectApi'
import type { TaskApi as TaskApiType } from '@/features/admin/model/types'
import { TASK_STATUSES, PRIORITIES } from '@/features/admin/model/constant'
import { formatDate } from '@/shared/lib/date'
import { cn } from '@/shared/lib/cn'
import { ReworkModal } from '@/features/admin/components/ReworkModal'
import { TaskDetailModal } from '@/features/admin/components/TaskDetailModal'
import { CreateTaskModal } from '@/features/admin/components/CreateTaskModal'
import { toast } from 'sonner'

import { useAuthStore } from '@/store'

function ProgressCell({ value }: { value: number }) {
  const color = value >= 75 ? '#40521B' : value >= 50 ? '#556F1F' : value >= 25 ? '#f59e0b' : '#d1d5db'
  return (
    <div className="flex flex-col gap-1 min-w-22.5">
      <span className="text-[11px] font-black text-text-dark">{value}%</span>
      <div className="h-1.25 w-full bg-surface-border rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function PMTasks() {
  const { user } = useAuthStore()
  const [tasks, setTasks] = useState<TaskApiType[]>([])
  const [projects, setProjects] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [createOpen,   setCreateOpen]   = useState(false)
  const [reworkTask,   setReworkTask]   = useState<TaskApiType | null>(null)
  const [approvingId,  setApprovingId]  = useState<string | null>(null)

  const fetchData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [taskRes, projRes] = await Promise.all([
        taskApi.getTasks({ size: 500 }),
        projectApi.getAllProjects({}, 0, 200),
      ])
      setTasks(taskRes.content)
      const pMap: Record<string, string> = {}
      projRes.content.forEach((p: any) => { pMap[p.id] = p.projectName ?? p.name })
      setProjects(pMap)
    } catch {
      setTasks([]); toast.error('Failed to load tasks and projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [user?.id])

  const filtered = useMemo(() => tasks.filter(t => {
    const q = search.toLowerCase()
    const pName = projects[t.projectId]?.toLowerCase() || ''
    
    // PM Visibility Scoping: Assigned to me OR Created by me
    const isRelevant = t.assignedTo?.id === user?.id || t.createdBy?.id === user?.id
    if (!isRelevant) return false

    return (!search || t.taskName.toLowerCase().includes(q) || t.jobNumber.toLowerCase().includes(q) || t.assignedTo.name.toLowerCase().includes(q) || pName.includes(q))
      && (!statusFilter || t.status === statusFilter)
      && (!priorityFilter || t.priority === priorityFilter)
  }), [tasks, search, statusFilter, priorityFilter, projects, user?.id])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleApprove = async (task: TaskApiType) => {
    setApprovingId(task.id)
    try {
      const updated = await taskApi.reviewTask(task.id, { approved: true, remarks: 'Approved' })
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t)); toast.success('Task approved')
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
      setTasks(prev => prev.map(t => t.id === reworkTask.id ? updated : t)); toast.success('Task sent back for rework')
    } catch {
      toast.error('Failed to send rework')
    }
    setReworkTask(null)
  }

  const handleDelete = async (task: TaskApiType) => {
    try {
      await taskApi.deleteTask(task.id); setTasks(prev => prev.filter(t => t.id !== task.id)); toast.success('Task deleted')
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const columns: Column<TaskApiType>[] = [
    { key: 'jobNumber', header: 'Task ID', width: '110px', render: row => <span className="text-[11px] font-mono font-bold text-primary-olive bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">{row.jobNumber}</span> },
    { key: 'projectId', header: 'Project', render: row => <div className="flex items-center gap-2 max-w-37.5"><div className="w-5 h-5 rounded bg-primary-50 flex items-center justify-center shrink-0"><FolderKanban size={12} className="text-primary-olive" /></div><span className="text-[12px] font-bold text-text-dark truncate">{projects[row.projectId] || 'Unknown Project'}</span></div> },
    { key: 'taskName', header: 'Task Name', sortable: true, render: row => <p className="text-[13px] font-semibold text-text-dark max-w-45 truncate" title={row.taskName}>{row.taskName}</p> },
    { key: 'category', header: 'Category', render: row => <span className="text-[11px] font-semibold text-text-medium capitalize">{row.category.toLowerCase().replace('_', ' ')}</span> },
    { key: 'assignedTo', header: 'Assignee', render: row => <span className="text-[12px] font-medium text-text-medium truncate max-w-25">{row.assignedTo.name}</span> },
    { key: 'plannedStartDate', header: 'Start Date', sortable: true, render: row => <span className="text-[12px] font-medium text-text-medium">{formatDate(row.plannedStartDate)}</span> },
    { key: 'plannedEndDate', header: 'Deadline', sortable: true, render: row => { const late = new Date(row.plannedEndDate) < new Date() && row.status !== 'COMPLETED'; return <span className={cn('text-[12px] font-bold', late ? 'text-red-500' : 'text-text-medium')}>{formatDate(row.plannedEndDate)}</span> } },
    { key: 'priority', header: 'Priority', align: 'center', render: row => <PriorityBadge priority={row.priority.toLowerCase() as any} /> },
    { key: 'status', header: 'Status', align: 'center', render: row => <StatusBadge status={row.status.toLowerCase() as any} /> },
    { key: 'progress', header: 'Progress', render: row => { const planned = row.plannedEffortsHours || 1; const pct = Math.round((row.actualEffortsHours / planned) * 100); return <ProgressCell value={Math.min(100, Math.max(0, pct))} /> } },
    { key: '_actions', header: '', align: 'center', width: '80px', render: row => {
      if (row.status !== 'UNDER_REVIEW') return null
      return (
        <div className="flex items-center gap-1 justify-center">
          <button onClick={e => { e.stopPropagation(); handleApprove(row) }} disabled={approvingId === row.id} className="p-1.5 rounded-lg hover:bg-emerald-50 text-text-light hover:text-emerald-600 transition-colors disabled:opacity-40" title="Approve"><CheckCircle2 size={14} /></button>
          <button onClick={e => { e.stopPropagation(); setReworkTask(row) }} className="p-1.5 rounded-lg hover:bg-amber-50 text-text-light hover:text-amber-600 transition-colors" title="Rework"><RotateCcw size={14} /></button>
        </div>
      )
    }},
  ]

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 animate-fade-in">
      <Card padding="none" className="border border-surface-border shadow-sm overflow-visible bg-transparent">
        
        {/* ── Toolbar ────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-surface-border bg-white rounded-t-2xl relative z-30">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Search */}
            <div className="relative shrink-0 w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
              <input 
                value={search} 
                onChange={e => { setSearch(e.target.value); setPage(1) }} 
                placeholder="Search tasks…" 
                className="w-full pl-9 pr-3 h-9 text-[12px] border border-surface-border rounded-xl bg-[#F9FAFB] focus:outline-none focus:border-primary-olive focus:ring-4 focus:ring-primary-olive/5 transition-all font-medium placeholder:text-text-light" 
              />
            </div>

            <div className="h-6 w-px bg-surface-border hidden md:block" />

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] overflow-x-auto no-scrollbar max-w-full">
              {[{ value: '', label: 'All' }, ...TASK_STATUSES].map((s) => (
                <button
                  key={s.value}
                  onClick={() => { setStatusFilter(s.value); setPage(1) }}
                  className={cn(
                    "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap",
                    statusFilter === s.value 
                      ? "bg-white text-primary-olive shadow-sm ring-1 ring-black/5" 
                      : "text-text-light hover:text-text-medium"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-4">
            <div className="shrink-0 w-36 hidden sm:block">
              <Dropdown options={[{ value: '', label: 'All Priority' }, ...PRIORITIES]} value={priorityFilter} onChange={v => { setPriorityFilter(v); setPage(1) }} placeholder="Priority" />
            </div>

            {(search || statusFilter || priorityFilter) && (
              <button 
                onClick={() => { 
                  setSearch('')
                  setStatusFilter('')
                  setPriorityFilter('')
                  setPage(1) 
                }} 
                className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 px-2 h-8 rounded-lg hover:bg-red-50 transition-colors"
              >
                <X size={12} />
              </button>
            )}
            
            <Button icon={<Plus size={14} />} onClick={() => setCreateOpen(true)} className="shrink-0 h-9 text-[11px] px-4 rounded-xl font-black uppercase tracking-widest bg-primary-olive shadow-lg shadow-primary-olive/10 transition-all active:scale-95">
              Add Task
            </Button>
          </div>
        </div>

        {/* ── Table & Pagination Wrapper ────────────────────────────────────────── */}
        <div className="rounded-b-2xl overflow-hidden relative z-10 bg-white">
          <DataTable 
            columns={columns} 
            data={paginated} 
            loading={false} 
            rowKey={r => r.id} 
            onRowClick={row => setDetailTaskId(row.id)} 
            emptyMessage="No tasks found" 
            emptyIcon={<ListTree size={36} />} 
          />
          <div className="px-5 py-3.5 border-t border-surface-border bg-white">
            <Pagination 
              page={page} 
              total={filtered.length} 
              pageSize={pageSize} 
              onPageChange={p => setPage(p)} 
              onPageSizeChange={s => { setPageSize(s); setPage(1) }} 
              pageSizeOptions={[10, 20, 50]} 
            />
          </div>
        </div>
      </Card>
      
      {reworkTask && <ReworkModal task={reworkTask} onClose={() => setReworkTask(null)} onSubmit={handleRework} />}
      <TaskDetailModal id={detailTaskId} open={!!detailTaskId} onClose={() => setDetailTaskId(null)} />
      <CreateTaskModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={fetchData} />
    </div>
  )
}


