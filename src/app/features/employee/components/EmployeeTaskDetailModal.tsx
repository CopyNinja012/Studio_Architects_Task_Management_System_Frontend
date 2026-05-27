import { useState, useEffect, useRef, useMemo } from 'react'
import {
  X, Send, CheckCircle2, Clock, Calendar, Timer,
  RotateCcw, ListTree, Upload, Play, Square, Loader2,
  Building2, FileText, Trash2, Eye,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/shared/lib/cn'
import { formatDate } from '@/shared/lib/date'
import { taskApi } from '@/features/admin/api/taskApi'
import type { TaskApi, TaskStatusApi, TaskTimelineResponse, TaskAttachmentResponse } from '@/features/admin/model/types'
import { toast } from 'sonner'
import { Modal } from '@/shared/components/ui/Modal'
import { FilePreviewModal } from '@/shared/components/ui/FilePreviewModal'
import { 
  type TimerState, 
  loadTimer, 
  saveTimer, 
  clearTimer, 
  liveSeconds, 
  fmtDuration, 
  secondsToHours 
} from '@/shared/lib/timer'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso?: string) {
  if (!iso) return '—'
  try { return format(new Date(iso), 'dd MMM yyyy') } catch { return iso }
}
function daysLeft(iso?: string) {
  if (!iso) return null
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
}

const STATUS_CFG: Record<TaskStatusApi, { label: string; bg: string; text: string }> = {
  ASSIGNED:         { label: 'Assigned',        bg: 'bg-slate-100',   text: 'text-slate-600'   },
  IN_PROGRESS:      { label: 'In Progress',     bg: 'bg-primary-100', text: 'text-primary-olive'},
  UNDER_REVIEW:     { label: 'Under Review',    bg: 'bg-blue-100',    text: 'text-teal-700'    },
  COMPLETED:        { label: 'Completed',       bg: 'bg-emerald-100', text: 'text-emerald-700' },
  REWORK_REQUESTED: { label: 'Rework Required', bg: 'bg-orange-100',  text: 'text-orange-700'  },
  CANCELLED:        { label: 'Cancelled',       bg: 'bg-red-100',     text: 'text-red-600'     },
  ON_HOLD:          { label: 'On Hold',         bg: 'bg-yellow-100',  text: 'text-yellow-700'  },
  DRAFT:            { label: 'Draft',           bg: 'bg-gray-100',    text: 'text-gray-500'    },
  SUBMITTED:        { label: 'Submitted',       bg: 'bg-purple-100',  text: 'text-purple-700'  },
  APPROVED:         { label: 'Approved',        bg: 'bg-green-100',   text: 'text-green-700'   },
}

const PRIORITY_CFG: Record<string, { label: string; cls: string }> = {
  LOW:    { label: 'Low',    cls: 'bg-gray-100 text-gray-500'     },
  MEDIUM: { label: 'Medium', cls: 'bg-amber-100 text-amber-700'   },
  HIGH:   { label: 'High',   cls: 'bg-orange-100 text-orange-700' },
  URGENT: { label: 'Urgent', cls: 'bg-red-100 text-red-600'       },
}

// ─── Submit Panel ─────────────────────────────────────────────────────────────

function SubmitPanel({ task, totalSeconds, onSuccess }: {
  task: TaskApi; totalSeconds: number; onSuccess: (updated: TaskApi) => void
}) {
  const [files, setFiles] = useState<File[]>([])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [hours, setHours] = useState(() => secondsToHours(totalSeconds))

  // Update hours if totalSeconds changes (e.g. timer stopped)
  useEffect(() => {
    setHours(secondsToHours(totalSeconds))
  }, [totalSeconds])

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
    } catch {
      toast.error('Failed to submit task')
    } finally {
      setLoading(false)
    }
  }

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl border border-primary-100">
          <div className="w-8 h-8 rounded-lg bg-primary-olive/10 flex items-center justify-center shrink-0">
            <Timer size={16} className="text-primary-olive" />
          </div>
          <div>
            <p className="text-[8px] font-black text-primary-olive uppercase tracking-widest leading-none mb-1">Recorded</p>
            <p className="text-[14px] font-black text-primary-olive tabular-nums leading-none">
              {fmtDuration(totalSeconds)}
            </p>
          </div>
        </div>
        <div className="p-2.5 bg-white rounded-xl border border-surface-border">
          <label className="text-[8px] font-black text-text-light uppercase tracking-widest mb-1 block">Hours Invested</label>
          <input 
            type="number" 
            step="0.1" 
            min="0.1"
            value={hours} 
            onChange={e => setHours(parseFloat(e.target.value) || 0)}
            className="w-full bg-transparent text-[14px] font-black text-text-dark focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-[9px] font-black text-text-dark uppercase tracking-widest mb-1.5 block px-1">
          Attachments
        </label>
        <div className="space-y-2">
          <label className={cn(
            'flex items-center gap-3 w-full px-4 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
            files.length > 0 ? 'border-primary-olive bg-primary-50' : 'border-surface-border hover:border-primary-olive/40 hover:bg-surface-hover'
          )}>
            <Upload size={15} className={files.length > 0 ? 'text-primary-olive' : 'text-text-light'} />
            <span className="text-[11px] font-medium text-text-medium">
              {files.length > 0 ? `${files.length} file(s) selected` : 'Click to attach files'}
            </span>
            <input type="file" multiple className="hidden" onChange={e => e.target.files && setFiles(prev => [...prev, ...Array.from(e.target.files!)])} />
          </label>

          {files.length > 0 && (
            <div className="space-y-1.5">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-surface-hover rounded-lg border border-surface-border animate-fade-in">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={13} className="text-primary-olive shrink-0" />
                    <span className="text-[10.5px] font-medium text-text-dark truncate">{f.name}</span>
                    <span className="text-[8px] text-text-light">({(f.size/1024).toFixed(0)}KB)</span>
                  </div>
                  <button onClick={() => removeFile(i)} className="text-text-light hover:text-red-500 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="text-[9px] font-black text-text-dark uppercase tracking-widest mb-1.5 block px-1">
          Submission Note
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={2}
          placeholder="Add notes or comments for the admin…"
          className="w-full rounded-xl border border-surface-border bg-white px-3 py-2 text-[12px] text-text-dark resize-none focus:outline-none focus:ring-2 focus:ring-primary-olive/15 focus:border-primary-olive transition-all"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full flex flex-col items-center justify-center h-12 rounded-xl text-white bg-primary-olive hover:bg-primary-700 transition-all disabled:opacity-60 shadow-md shadow-primary-olive/20 group"
      >
        <div className="flex items-center gap-2">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
          <span className="text-[12px] font-black uppercase tracking-widest">Submit for Review</span>
        </div>
        <span className="text-[8px] font-bold text-white/60 uppercase tracking-tighter mt-0.5">
          Sent to: {task.createdBy.name}
        </span>
      </button>
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface Props {
  task?: TaskApi
  id?: string | null
  open: boolean
  projects?: Record<string, string>
  onClose: () => void
  onTaskUpdated?: (updated: TaskApi) => void
}

export function EmployeeTaskDetailModal({ task: initialTask, id, open, projects = {}, onClose, onTaskUpdated }: Props) {
  const [task, setTask] = useState<TaskApi | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'submit' | 'timeline'>('details')
  const [timeline, setTimeline] = useState<TaskTimelineResponse[]>([])
  const [loadingTimeline, setLoadingTimeline] = useState(false)
  const [loadingTask, setLoadingTask] = useState(false)
  
  const [timerState, setTimerState] = useState<TimerState>({ totalSeconds: 0, startedAt: null })
  const [displaySecs, setDisplaySecs] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Preview state
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: string } | null>(null)

  // 1. Reset state when ID changes or modal opens
  useEffect(() => {
    if (open) {
      if (initialTask && (!id || initialTask.id === id)) {
        setTask(initialTask)
        const saved = loadTimer(initialTask.id)
        setTimerState(saved)
        setDisplaySecs(liveSeconds(saved))
      } else if (id) {
        setTask(null) // Clear previous task data
        setLoadingTask(true)
        taskApi.getTaskById(id)
          .then(res => {
            setTask(res)
            const saved = loadTimer(res.id)
            setTimerState(saved)
            setDisplaySecs(liveSeconds(saved))
          })
          .catch(() => toast.error('Failed to load task'))
          .finally(() => setLoadingTask(false))
      }
      setActiveTab('details')
      setTimeline([])
    }
  }, [id, open, initialTask])

  // Sync with other components (timer updates)
  useEffect(() => {
    const handler = (e: any) => {
      if (task && e.detail.id === task.id) {
        setTimerState(e.detail.state)
        setDisplaySecs(liveSeconds(e.detail.state))
      }
    }
    window.addEventListener('timer_updated', handler)
    return () => window.removeEventListener('timer_updated', handler)
  }, [task?.id])

  // Fetch timeline
  useEffect(() => {
    if (!task || !open) return
    setLoadingTimeline(true)
    taskApi.getTaskTimeline(task.id)
      .then(res => setTimeline(res))
      .catch(() => {})
      .finally(() => setLoadingTimeline(false))
  }, [task?.id, open])

  const reworkEntry = useMemo(() => 
    timeline.find(t => t.toStatus === 'REWORK_REQUESTED'), 
    [timeline]
  )

  useEffect(() => {
    if (timerState.startedAt) {
      intervalRef.current = setInterval(() => setDisplaySecs(liveSeconds(timerState)), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setDisplaySecs(timerState.totalSeconds)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [timerState])

  const handleTaskUpdated = (updated: TaskApi) => {
    setTask(updated)
    setTimerState({ totalSeconds: 0, startedAt: null })
    setDisplaySecs(0)
    onTaskUpdated?.(updated)
  }

  const handleFilePreview = async (file: TaskAttachmentResponse) => {
    if (!task) return
    try {
      const blobRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/tasks/${task.id}/attachments/${file.id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      const blob = await blobRes.blob()
      const url = window.URL.createObjectURL(blob)
      setPreviewFile({ url, name: file.fileName, type: file.fileType })
    } catch (err) {
      toast.error('Failed to load file preview')
    }
  }

  const handleDeleteAttachment = async (fileId: string) => {
    if (!task) return
    try {
      await taskApi.deleteAttachment(task.id, fileId)
      toast.success('Attachment removed')
      setTask({
        ...task,
        attachments: task.attachments?.filter(a => a.id !== fileId)
      })
    } catch {
      toast.error('Failed to delete attachment')
    }
  }

  if (!open) return null

  if (loadingTask || !task) {
    return (
      <Modal open={open} onClose={onClose} size="sm">
        <div className="flex flex-col items-center gap-4 py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-olive" />
          <p className="text-[10px] font-black text-text-light uppercase tracking-widest">Loading task details…</p>
        </div>
      </Modal>
    )
  }

  const startTimer = () => {
    if (!task) return
    const ns: TimerState = { totalSeconds: timerState.totalSeconds, startedAt: new Date().toISOString() }
    setTimerState(ns); saveTimer(task.id, ns)
    toast.success('Timer started')
  }

  const pauseTimer = () => {
    if (!task) return
    const acc = liveSeconds(timerState)
    const ns: TimerState = { totalSeconds: acc, startedAt: null }
    setTimerState(ns); saveTimer(task.id, ns)
    toast.info(`Paused — ${fmtDuration(acc)} logged`)
  }

  const projectName = projects[task.projectId] || task.projectName || 'Active Studio Project'
  const isRunning = !!timerState.startedAt
  const canWork = task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS' || task.status === 'REWORK_REQUESTED'
  const canSubmit = task.status === 'IN_PROGRESS' || task.status === 'REWORK_REQUESTED'

  const days = daysLeft(task.plannedEndDate)
  const isLate = days !== null && days < 0 && task.status !== 'COMPLETED'
  const progress = Math.min(100, Math.round((task.actualEffortsHours / (task.plannedEffortsHours || 1)) * 100))

  const statusCfg = STATUS_CFG[task.status]
  const priorityCfg = PRIORITY_CFG[task.priority] ?? PRIORITY_CFG.MEDIUM

  const tabs = [
    { id: 'details',  label: 'Details' },
    { id: 'submit',   label: 'Submission', show: canSubmit },
    { id: 'timeline', label: 'Timeline' },
  ].filter(t => t.id !== 'submit' || t.show)

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      padding="none"
      title={task.taskName}
      subtitle={
        <div className="flex items-center gap-2 mt-1">
          <span className="px-2 py-0.5 bg-primary-olive/10 text-primary-olive text-[10px] font-black rounded-md border border-primary-olive/10 uppercase tracking-widest">
            {projectName}
          </span>
          <span className="text-[10px] text-text-light font-bold">Job: {task.jobNumber}</span>
        </div>
      }
      icon={<ListTree size={20} className="text-primary-olive" />}
      footer={
        <div className="flex items-center justify-between w-full px-4">
          <p className="text-[9px] font-black text-text-light uppercase tracking-widest italic">Task ID: {task.jobNumber}</p>
          {canSubmit && (
            <button
              onClick={() => setActiveTab('submit')}
              className="flex items-center gap-2 px-6 h-9 rounded-xl bg-emerald-600 text-white text-[11px] font-black uppercase hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
            >
              <Send size={13} />
              Submit Work
            </button>
          )}
        </div>
      }
    >
      <div className="flex flex-col">
        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-4 pb-0 border-b border-surface-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'px-4 py-2 text-[11px] font-black uppercase tracking-widest border-b-4 transition-all',
                activeTab === tab.id ? 'border-primary-olive text-primary-olive' : 'border-transparent text-text-light hover:text-text-medium'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {activeTab === 'details' && (
            <>
              <div className="flex flex-wrap gap-2">
                <span className={cn('text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-lg border shadow-sm', statusCfg.bg, statusCfg.text, 'border-current/10')}>
                  {statusCfg.label}
                </span>
                <span className={cn('text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-lg border shadow-sm', priorityCfg.cls, 'border-current/10')}>
                  {priorityCfg.label} Priority
                </span>
              </div>

              {task.status === 'REWORK_REQUESTED' && (
                <div className="flex gap-3 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-xl">
                  <RotateCcw size={18} className="text-orange-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-orange-700 uppercase tracking-widest mb-1.5">Rework Instruction</p>
                    {reworkEntry?.remarks && (
                      <div className="p-3 bg-white/80 rounded-lg border border-orange-100 shadow-inner">
                        <p className="text-[13px] text-orange-950 font-medium italic leading-relaxed">"{reworkEntry.remarks}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 bg-white rounded-2xl border border-surface-border shadow-sm flex flex-col gap-1 hover:border-primary-100 transition-colors">
                  <p className="text-[8px] font-black text-text-light uppercase tracking-[0.2em] mb-1">Primary Category</p>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-olive" />
                    <span className="text-[13px] font-black text-text-dark uppercase tracking-tight">
                      {task.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-surface-border shadow-sm flex flex-col gap-1 hover:border-primary-100 transition-colors">
                  <p className="text-[8px] font-black text-text-light uppercase tracking-[0.2em] mb-1">Assignment Source</p>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="text-[13px] font-black text-text-dark uppercase tracking-tight">
                      {task.source.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 bg-white rounded-2xl border border-surface-border shadow-sm space-y-3">
                  <p className="text-[9px] font-black text-text-light uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} className="text-primary-olive" /> Schedule & Deadline
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[8px] font-black text-text-light uppercase">Assigned</p>
                      <p className="text-[12px] font-black text-text-dark">{fmtDate(task.plannedStartDate)}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-text-light uppercase">Target</p>
                      <p className={cn('text-[12px] font-black', isLate ? 'text-red-500' : 'text-text-dark')}>{fmtDate(task.plannedEndDate)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-surface-border shadow-sm space-y-3">
                  <p className="text-[9px] font-black text-text-light uppercase tracking-widest flex items-center gap-2">
                    <Timer size={12} className="text-primary-olive" /> Labor Metrics
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[8px] font-black text-text-light uppercase">Budgeted</p>
                      <p className="text-[12px] font-black text-text-dark">{task.plannedEffortsHours}h</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-text-light uppercase">Utilized</p>
                      <p className="text-[12px] font-black text-text-dark">{task.actualEffortsHours}h</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-surface-hover/30 rounded-2xl border border-surface-border shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black text-text-light uppercase tracking-widest">Progress Confidence</span>
                  <span className="text-[13px] font-black text-primary-olive">{progress}%</span>
                </div>
                <div className="h-2 bg-surface-border rounded-full overflow-hidden p-0.5">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, background: '#40521B' }} />
                </div>
              </div>

              <div>
                <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-2 px-1">Assignment Authority</p>
                <div className="p-4 bg-surface-hover/50 rounded-2xl border border-surface-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-surface-border flex items-center justify-center text-[11px] font-black text-text-dark shadow-sm">
                      {task.createdBy.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[12px] font-black text-text-dark leading-none mb-0.5">{task.createdBy.name}</p>
                      <p className="text-[10px] font-bold text-text-light uppercase tracking-wider">Task Authority</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-text-light uppercase tracking-widest mb-0.5">Assigned On</p>
                    <p className="text-[11px] font-bold text-text-dark">{formatDate(task.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-2 px-1">Task Specification</p>
                <div className="text-[13.5px] text-text-medium leading-relaxed bg-surface-hover/30 p-5 rounded-[28px] border border-surface-border font-medium shadow-inner-sm">
                  {task.description || 'Detailed architectural instructions not provided.'}
                </div>
              </div>

              {(task.referredBy || task.referenceType) && (
                <div className="p-4 bg-primary-50/50 rounded-2xl border border-primary-100 space-y-3">
                  <p className="text-[9px] font-black text-primary-olive uppercase tracking-widest px-1">Communication Context</p>
                  <div className="grid grid-cols-2 gap-4">
                    {task.referenceType && (
                      <div>
                        <p className="text-[8px] font-black text-primary-olive/60 uppercase tracking-widest">Reference Type</p>
                        <p className="text-[11px] font-bold text-text-dark uppercase tracking-tight">{task.referenceType}</p>
                      </div>
                    )}
                    {task.referredBy && (
                      <div>
                        <p className="text-[8px] font-black text-primary-olive/60 uppercase tracking-widest">Referred By</p>
                        <p className="text-[11px] font-bold text-text-dark">{task.referredBy}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {canWork && (
                <div className="p-5 bg-white rounded-3xl border-2 border-primary-100 shadow-xl shadow-primary-olive/5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-primary-olive uppercase tracking-[0.15em]">Execution Timer</p>
                    <div className={cn('flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase', 
                      isRunning ? 'bg-emerald-50 text-emerald-600 animate-pulse' : 'bg-gray-100 text-gray-400')}>
                      <div className={cn('w-1 h-1 rounded-full', isRunning ? 'bg-emerald-600' : 'bg-gray-400')} />
                      {isRunning ? 'Live' : 'Standby'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-6">
                    <p className={cn('text-4xl font-black tabular-nums tracking-tighter leading-none', isRunning ? 'text-primary-olive' : 'text-text-light/50')}>
                      {fmtDuration(displaySecs)}
                    </p>
                    <div className="flex gap-2">
                      {!isRunning ? (
                        <button onClick={startTimer} className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary-olive text-white shadow-lg shadow-primary-olive/20 hover:scale-105 transition-all"><Play size={20} fill="currentColor" /></button>
                      ) : (
                        <button onClick={pauseTimer} className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"><Square size={18} fill="currentColor" /></button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments Section - Conditional Visibility */}
              {task.attachments && task.attachments.length > 0 && ['REWORK_REQUESTED', 'UNDER_REVIEW', 'COMPLETED', 'SUBMITTED'].includes(task.status) && (
                <div className="space-y-3 pt-2">
                  <p className="text-[9px] font-black text-text-light uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <Upload size={12} /> Task Attachments
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {task.attachments.map(file => (
                      <div key={file.id} 
                        className="flex items-center justify-between p-2 bg-white rounded-xl border border-surface-border hover:border-primary-olive/30 transition-all group shadow-sm">
                        <div className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1" onClick={() => handleFilePreview(file)}>
                          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 border border-primary-100 group-hover:bg-white">
                            <FileText size={15} className="text-primary-olive" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-text-dark truncate leading-tight">{file.fileName}</p>
                            <p className="text-[8px] text-text-light font-medium">{(file.fileSize / 1024).toFixed(0)} KB · {file.fileType.split('/')[1]?.toUpperCase() || 'FILE'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleFilePreview(file)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-light hover:text-primary-olive hover:bg-primary-50 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Eye size={13} />
                          </button>
                          {task.status === 'REWORK_REQUESTED' && (
                            <button 
                              onClick={() => handleDeleteAttachment(file.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-light hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'submit' && (
            <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
              {canSubmit ? (
                <SubmitPanel task={task} totalSeconds={liveSeconds(timerState)} onSuccess={handleTaskUpdated} />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-text-light opacity-30">
                  <ListTree size={48} strokeWidth={1} className="mb-3" />
                  <p className="text-[12px] font-black uppercase tracking-widest">Locked State</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
              {loadingTimeline ? (
                <div className="flex flex-col items-center py-16">
                  <Loader2 size={24} className="animate-spin text-primary-olive" />
                </div>
              ) : (
                <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-hover before:rounded-full">
                  {timeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className={cn(
                        "absolute left-[-2.2rem] top-0 w-6 h-6 rounded-xl border-2 border-white flex items-center justify-center z-10 shadow-sm",
                        item.toStatus === 'COMPLETED' ? 'bg-emerald-500 text-white' :
                        item.toStatus === 'REWORK_REQUESTED' ? 'bg-orange-500 text-white' :
                        'bg-white text-text-light border-surface-border'
                      )}>
                        {item.toStatus === 'COMPLETED' ? <CheckCircle2 size={10} /> :
                         item.toStatus === 'REWORK_REQUESTED' ? <RotateCcw size={10} /> :
                         <Clock size={10} />}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-[12.5px] font-black text-text-dark tracking-tight">
                            {STATUS_CFG[item.toStatus as TaskStatusApi]?.label || item.toStatus}
                          </p>
                          <span className="text-[9px] font-bold text-text-light bg-surface-hover px-2 py-0.5 rounded-full border border-surface-border">
                            {format(new Date(item.timestamp), 'dd MMM, HH:mm')}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-medium font-bold">
                          Initiated by <span className="text-primary-olive">{item.performedBy}</span>
                        </p>
                        {item.remarks && (
                          <div className="p-3 bg-primary-50/60 rounded-xl border border-primary-100 italic text-[12px] text-text-medium font-medium leading-relaxed">
                            "{item.remarks}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {previewFile && (
        <FilePreviewModal
          open={!!previewFile}
          onClose={() => setPreviewFile(null)}
          fileUrl={previewFile.url}
          fileName={previewFile.name}
          fileType={previewFile.type}
        />
      )}
    </Modal>
  )
}
