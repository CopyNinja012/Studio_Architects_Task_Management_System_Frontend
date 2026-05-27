import { useState, useMemo, useEffect, useRef } from 'react'
import {
  ListTree, Search, X,
  RotateCcw, Send, Loader2,
  Play, Square, Timer, Building2,
  Upload, FileText, Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { DataTable, type Column } from '@/shared/components/table/DataTable'
import { Pagination } from '@/shared/components/ui/Pagination'
import { cn } from '@/shared/lib/cn'
import { format } from 'date-fns'
import type { TaskApi } from '@/features/admin/model/types'
import { PriorityTag } from '@/shared/components/status/PriorityTag'
import { StatusPill } from '@/shared/components/status/StatusPill'
import { EmployeeTaskDetailModal } from '@/features/employee/components/EmployeeTaskDetailModal'
import { taskApi } from '@/features/admin/api/taskApi'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'

// ─── Timer helpers ────────────────────────────────────────────────────────────

interface TimerState { totalSeconds: number; startedAt: string | null }
function timerKey(id: string) { return `task_timer_${id}` }
function loadTimer(id: string): TimerState {
  try { const r = localStorage.getItem(timerKey(id)); if (r) return JSON.parse(r) } catch {}
  return { totalSeconds: 0, startedAt: null }
}
function saveTimer(id: string, s: TimerState) { localStorage.setItem(timerKey(id), JSON.stringify(s)) }
function clearTimer(id: string) { localStorage.removeItem(timerKey(id)) }
function liveSeconds(s: TimerState) {
  if (!s.startedAt) return s.totalSeconds
  return s.totalSeconds + Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 1000)
}
function fmtDuration(sec: number) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}
function secondsToHours(sec: number) { return Math.round((sec / 3600) * 10) / 10 }

function fmtDate(iso?: string) {
  if (!iso) return '—'
  try { return format(new Date(iso), 'dd MMM yyyy') } catch { return iso }
}

const STATUS_TABS = [
  { value: '',                 label: 'All'            },
  { value: 'ASSIGNED',         label: 'Assigned'       },
  { value: 'IN_PROGRESS',      label: 'In Progress'    },
  { value: 'UNDER_REVIEW',     label: 'Under Review'   },
  { value: 'REWORK_REQUESTED', label: 'Rework'         },
  { value: 'COMPLETED',        label: 'Completed'      },
] as const

// ─── Row Timer Cell ───────────────────────────────────────────────────────────

function RowTimerCell({ task, onSubmit }: { task: TaskApi; onSubmit: (task: TaskApi) => void }) {
  const [timerState, setTimerState] = useState<TimerState>(() => loadTimer(task.id))
  const [display,    setDisplay]    = useState(() => liveSeconds(loadTimer(task.id)))
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (timerState.startedAt) {
      intervalRef.current = setInterval(() => setDisplay(liveSeconds(timerState)), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setDisplay(timerState.totalSeconds)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [timerState])

  const isRunning = !!timerState.startedAt
  const canWork   = task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS' || task.status === 'REWORK_REQUESTED'
  const canSubmit = task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS' || task.status === 'REWORK_REQUESTED'

  const start = (e: React.MouseEvent) => { e.stopPropagation(); const ns: TimerState = { totalSeconds: timerState.totalSeconds, startedAt: new Date().toISOString() }; setTimerState(ns); saveTimer(task.id, ns) }
  const pause = (e: React.MouseEvent) => { e.stopPropagation(); const acc = liveSeconds(timerState); const ns: TimerState = { totalSeconds: acc, startedAt: null }; setTimerState(ns); saveTimer(task.id, ns) }
  const submit = (e: React.MouseEvent) => { e.stopPropagation(); if (isRunning) { const acc = liveSeconds(timerState); const ns: TimerState = { totalSeconds: acc, startedAt: null }; setTimerState(ns); saveTimer(task.id, ns) }; onSubmit(task) }

  if (!canWork && display === 0) return null

  return (
    <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
      {(isRunning || display > 0) && <span className={cn('text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded-md border', isRunning ? 'text-primary-olive bg-primary-50 border-primary-100' : 'text-text-light bg-surface-hover border-surface-border')}>{fmtDuration(display)}</span>}
      {canWork && (isRunning ? <button onClick={pause} title="Pause timer" className="w-6 h-6 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 hover:bg-amber-100 transition-colors"><Square size={10} /></button> : <button onClick={start} title={display > 0 ? 'Resume timer' : 'Start timer'} className="w-6 h-6 rounded-md bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-olive hover:bg-primary-100 transition-colors"><Play size={10} /></button>)}
      {canSubmit && <button onClick={submit} className="flex items-center gap-1.5 px-2.5 h-6 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 transition-colors group"><Send size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /><span className="text-[10px] font-black uppercase">Submit</span></button>}
    </div>
  )
}

// ─── Quick Submit Modal ───────────────────────────────────────────────────────

function QuickSubmitModal({ task, onClose, onSuccess }: {
  task: TaskApi; onClose: () => void; onSuccess: (updated: TaskApi) => void
}) {
  const [note,    setNote]    = useState('')
  const [loading, setLoading] = useState(false)
  const [files,   setFiles]   = useState<File[]>([])
  
  const saved = loadTimer(task.id)
  const totalSecs = liveSeconds(saved)
  const [hours, setHours] = useState(() => secondsToHours(totalSecs))

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
              <p className="text-[9px] font-black text-primary-olive uppercase tracking-widest leading-none mb-1">Timer Recorded</p>
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
          <label className="text-[11px] font-black text-text-dark uppercase tracking-widest px-1">Attachments (optional)</label>
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PMAssignedTasks() {
  const [tasks,        setTasks]        = useState<TaskApi[]>([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page,         setPage]         = useState(1)
  const [pageSize,     setPageSize]     = useState(10)
  
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [submitTask,   setSubmitTask]   = useState<TaskApi | null>(null)

  const fetchTasks = () => {
    setLoading(true)
    taskApi.getMyTasks({ size: 100 })
      .then(res => setTasks(res.content))
      .catch(() => { setTasks([]); toast.error('Failed to load tasks') })
      .finally(() => setLoading(false))
  }

  useEffect(() => fetchTasks(), [])

  const filtered = useMemo(() => tasks.filter(t => {
    const q = search.toLowerCase()
    return (!search || t.taskName.toLowerCase().includes(q) || t.jobNumber.toLowerCase().includes(q) || (t.projectName || '').toLowerCase().includes(q))
      && (!statusFilter || t.status === statusFilter)
  }), [tasks, search, statusFilter])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)
  const reworkCount = tasks.filter(t => t.status === 'REWORK_REQUESTED').length

  const handleTaskUpdated = (updated: TaskApi) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
    setDetailTaskId(null); setSubmitTask(null)
  }

  const columns: Column<TaskApi>[] = [
    { key: 'jobNumber', header: 'Task ID', width: '100px', render: row => <span className="text-[11px] font-mono font-bold text-primary-olive bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">{row.jobNumber}</span> },
    { key: 'projectId', header: 'Project', render: row => <div className="flex items-center gap-2 max-w-37.5"><div className="w-5 h-5 rounded bg-primary-50 flex items-center justify-center shrink-0"><Building2 size={12} className="text-primary-olive" /></div><span className="text-[12px] font-bold text-text-dark truncate">{row.projectName || 'Assigned Project'}</span></div> },
    { key: 'taskName', header: 'Task Name', sortable: true, render: row => <div><p className="text-[13px] font-semibold text-text-dark max-w-45 truncate" title={row.taskName}>{row.taskName}</p>{row.status === 'REWORK_REQUESTED' && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 mt-0.5"><RotateCcw size={9} /> Rework required</span>}</div> },
    { key: 'assignedBy', header: 'Assigned By', render: row => <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-black text-primary-olive shrink-0">{(row.createdBy.name || '?').charAt(0).toUpperCase()}</div><span className="text-[12px] font-medium text-text-medium truncate max-w-25">{row.createdBy.name}</span></div> },
    { key: 'plannedEndDate', header: 'Deadline', sortable: true, render: row => { const late = new Date(row.plannedEndDate) < new Date() && row.status !== 'COMPLETED'; return <span className={cn('text-[12px] font-bold', late ? 'text-red-500' : 'text-text-medium')}>{fmtDate(row.plannedEndDate)}</span> } },
    { key: 'priority', header: 'Priority', align: 'center', render: row => <PriorityTag priority={row.priority.toLowerCase() as any} /> },
    { key: 'status', header: 'Status', align: 'center', render: row => <StatusPill status={row.status} /> },
    { key: '_timer', header: 'Actions', width: '160px', render: row => <RowTimerCell task={row} onSubmit={t => setSubmitTask(t)} /> },
  ]

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-olive" /></div>

  return (
    <>
      <div className="space-y-4 animate-fade-in">
        {reworkCount > 0 && <div className="flex items-center gap-3 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl"><RotateCcw size={16} className="text-orange-600 shrink-0" /><p className="text-[12px] font-bold text-orange-800">{reworkCount} task{reworkCount > 1 ? 's' : ''} sent back for rework — review and resubmit.</p></div>}
        <div className="bg-white rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-surface-border bg-white overflow-x-auto">
            <div className="relative shrink-0 w-44"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" /><input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search tasks…" className="w-full pl-8 pr-3 h-8 text-[12px] border border-surface-border rounded-lg bg-white focus:outline-none focus:border-primary-olive focus:ring-2 focus:ring-primary-olive/10 transition-all font-medium placeholder:text-text-light" /></div>
            <div className="h-6 w-px bg-surface-border shrink-0" />
            <div className="flex items-center gap-1 shrink-0">{STATUS_TABS.map(tab => (<button key={tab.value} onClick={() => { setStatusFilter(tab.value); setPage(1) }} className={cn('px-2.5 h-7 rounded-full text-[11px] font-bold border transition-all whitespace-nowrap', statusFilter === tab.value ? 'bg-primary-olive text-white border-primary-olive' : 'bg-white text-text-medium border-surface-border hover:border-primary-300 hover:text-primary-olive')}>{tab.label}{tab.value === 'REWORK_REQUESTED' && reworkCount > 0 && <span className="ml-1 bg-orange-500 text-white text-[9px] font-black px-1 py-0.5 rounded-full">{reworkCount}</span>}</button>))}</div>
            {search && <button onClick={() => { setSearch(''); setPage(1) }} className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 px-2 h-7 rounded-lg hover:bg-red-50 transition-colors"><X size={12} /> Clear</button>}
            <div className="flex-1" /><span className="text-[11px] font-medium text-text-light shrink-0">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</span>
          </div>
          <DataTable columns={columns} data={paginated} loading={false} rowKey={r => r.id} onRowClick={row => setDetailTaskId(row.id)} emptyMessage="No tasks found" emptyIcon={<ListTree size={36} />} />
          <div className="px-5 py-3.5 border-t border-surface-border bg-white"><Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={p => setPage(p)} onPageSizeChange={s => { setPageSize(s); setPage(1) }} pageSizeOptions={[10, 20, 50]} /></div>
        </div>
      </div>
      
      <EmployeeTaskDetailModal id={detailTaskId} open={!!detailTaskId} onClose={() => setDetailTaskId(null)} onTaskUpdated={handleTaskUpdated} />
      {submitTask && <QuickSubmitModal task={submitTask} onClose={() => setSubmitTask(null)} onSuccess={handleTaskUpdated} />}
    </>
  )
}
