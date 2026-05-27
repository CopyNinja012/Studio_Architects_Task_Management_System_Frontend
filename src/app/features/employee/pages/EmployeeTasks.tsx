import { useState, useEffect, useMemo } from 'react'
import {
  Play, Square, Timer, Send, Search,
  RotateCcw, Building2, Upload, FileText, Trash2, X, ListTree,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { StatusPill } from '@/shared/components/status/StatusPill'
import { PriorityTag } from '@/shared/components/status/PriorityTag'
import { DataTable, type Column } from '@/shared/components/table/DataTable'
import { Pagination } from '@/shared/components/ui/Pagination'
import { Dropdown } from '@/shared/components/ui/Dropdown'
import { PageLoader } from '@/shared/components/ui/Loader'
import { taskApi } from '@/features/admin/api/taskApi'
import type { TaskApi } from '@/features/admin/model/types'
import { TASK_STATUSES, PRIORITIES } from '@/features/admin/model/constant'
import { formatDate } from '@/shared/lib/date'
import { cn } from '@/shared/lib/cn'
import { toast } from 'sonner'
import { EmployeeTaskDetailModal } from '../components/EmployeeTaskDetailModal'
import { RowTimerCell } from '../components/RowTimerCell'
import { loadTimer, clearTimer, liveSeconds, fmtDuration, secondsToHours } from '@/shared/lib/timer'

// ─── Quick Submit Modal ───────────────────────────────────────────────────────

export function QuickSubmitModal({ task, onClose, onSuccess }: {
  task: TaskApi; onClose: () => void; onSuccess: (updated: TaskApi) => void
}) {
  const [note,    setNote]    = useState('')
  const [loading, setLoading] = useState(false)
  const [files,   setFiles]   = useState<File[]>([])
  
  const saved = loadTimer(task.id)
  const [totalSecs, setTotalSecs] = useState(() => liveSeconds(saved))
  const [hours, setHours] = useState(() => secondsToHours(totalSecs))

  // Sync with timer updates
  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail.id === task.id) {
        const newSecs = liveSeconds(e.detail.state)
        setTotalSecs(newSecs)
        setHours(secondsToHours(newSecs))
      }
    }
    window.addEventListener('timer_updated', handler)
    return () => window.removeEventListener('timer_updated', handler)
  }, [task.id])

  const handleSubmit = async () => {
    if (hours <= 0) {
      toast.error('Please enter valid hours invested')
      return
    }
    setLoading(true)
    try {
      const updated = await taskApi.submitTask(task.id, {
        submissionNotes: note,
        attachmentPaths: [],
        hoursInvested: hours,
      }, files)
      toast.success('Task submitted for review')
      clearTimer(task.id)
      onSuccess(updated)
      onClose()
    } catch {
      toast.error('Failed to submit task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      title="Submit for Review"
      subtitle={task.taskName}
      icon={<Send size={22} className="text-primary-olive" />}
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            loading={loading}
            icon={<Send size={15} />}
            className="bg-primary-olive hover:bg-primary-700 text-white rounded-xl px-8 font-black shadow-lg shadow-primary-olive/20"
          >
            Submit Task
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-center gap-3">
            <Timer size={18} className="text-primary-olive shrink-0" />
            <div>
              <p className="text-[9px] font-black text-primary-olive uppercase tracking-widest leading-none mb-1">Recorded</p>
              <p className="text-[18px] font-black text-primary-olive tabular-nums leading-none">
                {fmtDuration(totalSecs)}
              </p>
            </div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-surface-border shadow-sm group hover:border-primary-100 transition-all">
            <label className="text-[9px] font-black text-text-light uppercase tracking-widest leading-none mb-2 block group-hover:text-primary-olive">Hours Invested</label>
            <input 
              type="number" 
              step="0.1" 
              min="0.1"
              value={hours} 
              onChange={e => setHours(parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent text-[18px] font-black text-text-dark focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-text-dark uppercase tracking-widest px-1">Attachments</label>

          <label className={cn(
            'flex flex-col items-center justify-center gap-2 w-full h-28 rounded-3xl border-2 border-dashed border-[#E5E7EB] cursor-pointer transition-all',
            files.length > 0 ? 'border-primary-olive bg-primary-50' : 'hover:bg-primary-50/50 hover:border-primary-olive/30'
          )}>
            <Upload size={22} className={files.length > 0 ? 'text-primary-olive' : 'text-text-light'} />
            <p className="text-[11px] font-bold text-text-medium">
              {files.length > 0 ? `${files.length} file(s) selected` : 'Drop files here or click to upload'}
            </p>
            <input 
              type="file" 
              multiple 
              className="hidden" 
              accept="image/*,.pdf"
              onChange={e => e.target.files && setFiles(prev => [...prev, ...Array.from(e.target.files!)])} 
            />
          </label>

          {files.length > 0 && (
            <div className="grid grid-cols-1 gap-2 mt-3">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-surface-border animate-in fade-in slide-in-from-bottom-1 duration-300">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 border border-primary-100">
                      <FileText size={14} className="text-primary-olive" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11.5px] font-bold text-text-dark truncate leading-tight">{f.name}</p>
                      <p className="text-[9px] text-text-light font-bold uppercase">{(f.size/1024).toFixed(0)}KB</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                    className="w-8 h-8 rounded-lg hover:bg-rose-50 text-text-light hover:text-rose-500 transition-colors flex items-center justify-center"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-text-dark uppercase tracking-widest px-1">Submission Note</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            placeholder="Describe your work and any relevant observations…"
            className="w-full rounded-3xl border border-surface-border bg-white px-4 py-3.5 text-[13px] text-text-dark resize-none focus:outline-none focus:ring-4 focus:ring-primary-olive/5 focus:border-primary-olive transition-all font-medium"
          />
        </div>
      </div>
    </Modal>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const FILTER_STATUSES = [
  { value: '', label: 'All Tasks' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'REWORK_REQUESTED', label: 'Rework' },
  { value: 'UNDER_REVIEW', label: 'Review' },
  { value: 'COMPLETED', label: 'Completed' },
]

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState<TaskApi[]>([])
  const [projects, setProjects] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [submitTask,   setSubmitTask]   = useState<TaskApi | null>(null)

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const taskRes = await taskApi.getMyTasks({ size: 100, source: 'PROJECT_DRIVEN' })
      setTasks(taskRes.content)
      const pMap: Record<string, string> = {}
      taskRes.content.forEach(t => { 
        if (t.projectId) {
          pMap[t.projectId] = t.projectName || 'Assigned Project'
        }
      })
      setProjects(pMap)
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTasks() }, [])

  const filtered = useMemo(() => tasks.filter(t => {
    const q = search.toLowerCase()
    const pName = projects[t.projectId]?.toLowerCase() || ''
    return (!search || t.taskName.toLowerCase().includes(q) || t.jobNumber.toLowerCase().includes(q) || pName.includes(q))
      && (!statusFilter || t.status === statusFilter)
      && t.source === 'PROJECT_DRIVEN'
  }), [tasks, search, statusFilter, projects])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleTaskUpdated = (updated: TaskApi) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
    setDetailTaskId(null)
    setSubmitTask(null)
  }

  const columns: Column<TaskApi>[] = [
    {
      key: 'jobNumber', header: 'Task ID', width: '100px',
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
            <Building2 size={12} className="text-primary-olive" />
          </div>
          <span className="text-[12px] font-bold text-text-dark truncate">
            {projects[row.projectId] || 'Assigned Project'}
          </span>
        </div>
      ),
    },
    {
      key: 'taskName', header: 'Task Information', sortable: true,
      render: row => (
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-text-dark truncate max-w-50" title={row.taskName}>
            {row.taskName}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
             <span className="text-[10px] text-text-light font-medium uppercase tracking-tight">{row.category.toLowerCase().replace('_', ' ')}</span>
             {row.status === 'REWORK_REQUESTED' && (
               <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600">
                 <RotateCcw size={10} /> Rework requested
               </span>
             )}
          </div>
        </div>
      ),
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
    { key: 'status', header: 'Status', align: 'center', width: '100px', render: row => <StatusPill status={row.status} /> },
    { key: '_timer', header: 'WIP', width: '140px', render: row => <RowTimerCell task={row} onSubmit={t => setSubmitTask(t)} /> },
  ]

  if (loading) return <PageLoader />

  return (
    <>
      <div className="space-y-4 animate-fade-in">
        <div className="bg-white rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-surface-border bg-white">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="relative shrink-0 w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Search tasks, projects…"
                  className="w-full pl-9 pr-3 h-9 text-[12px] border border-surface-border rounded-xl bg-[#F9FAFB] focus:outline-none focus:border-primary-olive focus:ring-4 focus:ring-primary-olive/5 transition-all font-medium placeholder:text-text-light"
                />
              </div>

              <div className="h-6 w-px bg-surface-border hidden md:block" />

              {/* Status Pills Selection */}
              <div className="flex items-center gap-1.5 p-1 bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] overflow-x-auto no-scrollbar max-w-full">
                {FILTER_STATUSES.map((s) => (
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

            <div className="flex items-center gap-3 shrink-0">
              {search && (
                <button 
                  onClick={() => { setSearch(''); setPage(1) }}
                  className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 px-2 h-8 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <X size={12} />
                </button>
              )}

              <span className="text-[10px] font-black uppercase tracking-widest text-text-light bg-surface-hover px-2 py-1 rounded-md border border-surface-border">
                {filtered.length} Items
              </span>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={paginated}
            loading={false}
            rowKey={r => r.id}
            onRowClick={row => setDetailTaskId(row.id)}
            emptyMessage="No tasks found matching your filters"
            emptyIcon={<ListTree size={36} />}
          />


          <div className="px-5 py-3.5 border-t border-surface-border bg-white">
            <Pagination
              page={page}
              total={filtered.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={s => { setPageSize(s); setPage(1) }}
            />
          </div>
        </div>
      </div>

      <EmployeeTaskDetailModal 
        id={detailTaskId} 
        open={!!detailTaskId} 
        onClose={() => setDetailTaskId(null)} 
        onTaskUpdated={handleTaskUpdated} 
        projects={projects}
      />

      {submitTask && (
        <QuickSubmitModal 
          task={submitTask} 
          onClose={() => setSubmitTask(null)} 
          onSuccess={handleTaskUpdated} 
        />
      )}
    </>
  )
}
