import { useState, useMemo, useEffect } from 'react'
import {
  ListTree, Search, X, Plus, Trash2, FolderKanban, Eye, ClipboardList
} from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/shared/components/ui/Card'
import { Dropdown } from '@/shared/components/ui/Dropdown'
import { DataTable, type Column } from '@/shared/components/table/DataTable'
import { Pagination } from '@/shared/components/ui/Pagination'
import { Button } from '@/shared/components/ui/Button'
import { PriorityBadge, StatusBadge } from '@/shared/components/ui/Badge'
import { cn } from '@/shared/lib/cn'
import { formatDate } from '@/shared/lib/date'
import { taskApi } from '@/features/admin/api/taskApi'
import { projectApi } from '@/features/admin/api/projectApi'
import { CreateTaskModal } from '@/features/admin/components/CreateTaskModal'
import { TaskDetailModal } from '@/features/admin/components/TaskDetailModal'
import type { TaskApi as TaskApiType } from '@/features/admin/model/types'
import { TASK_STATUSES, PRIORITIES } from '@/features/admin/model/constant'
import { useAuthStore } from '@/store'

import { StatusPill } from '@/shared/components/status/StatusPill'

export default function PMMyTasks() {
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

  const fetchData = async () => {
    setLoading(true)
    try {
      const [taskRes, projRes] = await Promise.all([
        taskApi.getTasks({ size: 500 }),
        projectApi.getAllProjects({}, 0, 200),
      ])

      const myCreated = taskRes.content.filter(t => t.createdBy?.id === user?.id)
      setTasks(myCreated)

      const pMap: Record<string, string> = {}
      projRes.content.forEach((p: any) => { pMap[p.id] = p.projectName ?? p.name })
      setProjects(pMap)
    } catch {
      setTasks([]); toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [user?.id])

  const filtered = useMemo(() => tasks.filter(t => {
    const q = search.toLowerCase()
    const pName = projects[t.projectId]?.toLowerCase() || ''
    return (!search || t.taskName.toLowerCase().includes(q) || t.jobNumber.toLowerCase().includes(q) || t.assignedTo.name.toLowerCase().includes(q) || pName.includes(q))
      && (!statusFilter || t.status === statusFilter)
      && (!priorityFilter || t.priority === priorityFilter)
  }), [tasks, search, statusFilter, priorityFilter, projects])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleDelete = async (id: string) => {
    try {
      await taskApi.deleteTask(id)
      setTasks(prev => prev.filter(t => t.id !== id))
      toast.success('Task deleted')
    } catch { toast.error('Failed to delete task') }
  }

  const columns: Column<TaskApiType>[] = [
    { key: 'jobNumber', header: 'Task ID', width: '110px', render: row => <span className="text-[11px] font-mono font-bold text-primary-olive bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">{row.jobNumber}</span> },
    { key: 'projectId', header: 'Project', render: row => <div className="flex items-center gap-2 max-w-37.5"><div className="w-5 h-5 rounded bg-primary-50 flex items-center justify-center shrink-0"><FolderKanban size={12} className="text-primary-olive" /></div><span className="text-[12px] font-bold text-text-dark truncate">{projects[row.projectId] || 'Unknown Project'}</span></div> },
    { key: 'taskName', header: 'Task Name', sortable: true, render: row => <p className="text-[13px] font-semibold text-text-dark max-w-45 truncate" title={row.taskName}>{row.taskName}</p> },
    { key: 'assignedTo', header: 'Assignee', render: row => <span className="text-[12px] font-medium text-text-medium truncate max-w-25">{row.assignedTo.name}</span> },
    { key: 'plannedEndDate', header: 'Deadline', sortable: true, render: row => { const late = new Date(row.plannedEndDate) < new Date() && row.status !== 'COMPLETED'; return <span className={cn('text-[12px] font-bold', late ? 'text-red-500' : 'text-text-medium')}>{formatDate(row.plannedEndDate)}</span> } },
    { key: 'priority', header: 'Priority', align: 'center', render: row => <PriorityBadge priority={row.priority.toLowerCase() as any} /> },
    { key: 'status', header: 'Status', align: 'center', render: row => <StatusPill status={row.status} /> },
  ]

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
                placeholder="Search your tasks…" 
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
              Assign Task
            </Button>
          </div>
        </div>

        {/* ── Table & Pagination Wrapper ────────────────────────────────────────── */}
        <div className="rounded-b-2xl overflow-hidden relative z-10 bg-white">
          <DataTable columns={columns} data={paginated} loading={loading} rowKey={r => r.id} onRowClick={row => setDetailTaskId(row.id)} emptyMessage="You haven't assigned any tasks or logged manual work yet" emptyIcon={<ClipboardList size={36} />} />
          <div className="px-5 py-3.5 border-t border-surface-border bg-white">
            <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={p => setPage(p)} onPageSizeChange={s => { setPageSize(s); setPage(1) }} pageSizeOptions={[10, 20, 50]} />
          </div>
        </div>
      </Card>
      
      <TaskDetailModal id={detailTaskId} open={!!detailTaskId} onClose={() => setDetailTaskId(null)} />
      <CreateTaskModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={fetchData} />
    </div>
  )
}

