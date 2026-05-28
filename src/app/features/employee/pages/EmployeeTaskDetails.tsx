import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  X, Send, CheckCircle2, Clock,
  Calendar, Timer, FolderKanban, Building2,
  RotateCcw, ListTree, ChevronLeft,
  Upload, FileText, Trash2, Eye, Loader2,
  Play,
  Square,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/Button'
import { PageContainer } from '@/layout/app-layout/PageContainer'
import { taskApi } from '@/features/admin/api/taskApi'
import { useAuthStore } from '@/store'
import type { TaskApi, TaskStatusApi, TaskAttachmentResponse } from '@/features/admin/model/types'
import { toast } from 'sonner'
import { Modal } from '@/shared/components/ui/Modal'
import { FilePreviewModal } from '@/shared/components/ui/FilePreviewModal'
import { loadTimer, saveTimer, liveSeconds, fmtDuration, secondsToHours, clearTimer } from '@/shared/lib/timer'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso?: string) {
  if (!iso) return '—'
  try { return format(new Date(iso), 'dd MMM yyyy') } catch { return iso }
}

function daysLeft(iso?: string) {
  if (!iso) return null
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
}

// ─── Badge configs ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<TaskStatusApi, { label: string; cls: string }> = {
  ASSIGNED:         { label: 'Assigned',        cls: 'bg-slate-50 text-slate-600 border-slate-200'         },
  IN_PROGRESS:      { label: 'In Progress',     cls: 'bg-primary-50 text-primary-olive border-primary-100' },
  UNDER_REVIEW:     { label: 'Under Review',    cls: 'bg-teal-50 text-teal-700 border-teal-200'            },
  COMPLETED:        { label: 'Completed',       cls: 'bg-emerald-50 text-emerald-700 border-emerald-200'   },
  REWORK_REQUESTED: { label: 'Rework Required', cls: 'bg-orange-50 text-orange-700 border-orange-200'      },
  CANCELLED:        { label: 'Cancelled',       cls: 'bg-red-50 text-red-600 border-red-200'               },
  ON_HOLD:          { label: 'On Hold',         cls: 'bg-yellow-50 text-yellow-700 border-yellow-200'      },
  DRAFT:            { label: 'Draft',           cls: 'bg-gray-50 text-gray-500 border-gray-200'            },
  SUBMITTED:        { label: 'Submitted',       cls: 'bg-purple-50 text-purple-700 border-purple-200'      },
  APPROVED:         { label: 'Approved',        cls: 'bg-green-50 text-green-700 border-green-200'         },
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value }: { value: number }) {
  const color = value >= 75 ? '#40521B' : value >= 50 ? '#556F1F' : value >= 25 ? '#f59e0b' : '#d1d5db'
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black text-text-light uppercase tracking-widest leading-none">Completion Progress</span>
        <span className="text-[13px] font-black leading-none" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-surface-border rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

// ─── Submit Modal ─────────────────────────────────────────────────────────────

function SubmitWorkModal({ task, totalSeconds, onClose, onSuccess }: {
  task: TaskApi
  totalSeconds: number
  onClose: () => void
  onSuccess: (updated: TaskApi) => void
}) {
  const [files,   setFiles]   = useState<File[]>([])
  const [note,    setNote]    = useState('')
  const [loading, setLoading] = useState(false)
  const [hours,   setHours]   = useState(() => secondsToHours(totalSeconds))

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
      toast.success('Work submitted for review')
      clearTimer(task.id)
      onSuccess(updated)
      onClose()
    } catch {
      toast.error('Failed to submit work')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      title="Submit Work"
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
                {fmtDuration(totalSeconds)}
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

export default function EmployeeTaskDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [task,        setTask]        = useState<TaskApi | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [showSubmit,  setShowSubmit]  = useState(false)

  const [timerState, setTimerState] = useState(() => (id ? loadTimer(id) : { totalSeconds: 0, startedAt: null }))
  const [displaySecs, setDisplaySecs] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Preview state
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: string } | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    taskApi.getTaskById(id)
      .then(t => {
        setTask(t)
        const saved = loadTimer(t.id)
        setTimerState(saved)
        setDisplaySecs(liveSeconds(saved))
      })
      .catch(() => {
        toast.error('Failed to load task')
        navigate(-1)
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  useEffect(() => {
    if (timerState.startedAt) {
      intervalRef.current = setInterval(() => { setDisplaySecs(liveSeconds(timerState)) }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setDisplaySecs(timerState.totalSeconds)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [timerState])

  const handleStartTimer = () => {
    if (!task) return
    const newState = { totalSeconds: timerState.totalSeconds, startedAt: new Date().toISOString() }
    setTimerState(newState); saveTimer(task.id, newState); toast.success('Timer started')
  }

  const handlePauseTimer = () => {
    if (!task) return
    const accumulated = liveSeconds(timerState)
    const newState = { totalSeconds: accumulated, startedAt: null }
    setTimerState(newState); saveTimer(task.id, newState); toast.info(`Timer paused — ${fmtDuration(accumulated)} logged`)
  }

  const handleStopAndSubmit = () => {
    if (!task) return
    const accumulated = liveSeconds(timerState)
    const newState = { totalSeconds: accumulated, startedAt: null }
    setTimerState(newState); saveTimer(task.id, newState); setShowSubmit(true)
  }

  const handleFilePreview = (file: TaskAttachmentResponse) => {
    if (!task) return
    
    // Get current token from auth store for authenticated direct access
    const token = useAuthStore.getState().user?.token
    const directUrl = taskApi.getAttachmentUrl(task.id, file.id, token)

    // For images and PDFs, we open the direct URL in a new tab (backend sends inline disposition)
    if (file.fileType.startsWith('image/') || file.fileType === 'application/pdf') {
      window.open(directUrl, '_blank')
      return
    }

    // For other files, use the preview modal with the direct authenticated URL
    setPreviewFile({ url: directUrl, name: file.fileName, type: file.fileType })
  }

  if (loading || !task) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-olive" />
        </div>
      </PageContainer>
    )
  }

  const statusCfg  = STATUS_CFG[task.status]
  const days       = daysLeft(task.plannedEndDate)
  const isLate     = days !== null && days < 0 && task.status !== 'COMPLETED'
  const isRunning  = !!timerState.startedAt
  const canWork    = task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS' || task.status === 'REWORK_REQUESTED'
  const canSubmit  = task.status === 'IN_PROGRESS' || task.status === 'REWORK_REQUESTED'
  const progress   = Math.min(100, Math.round((task.actualEffortsHours / (task.plannedEffortsHours || 1)) * 100))

  return (
    <PageContainer>
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-text-light hover:text-primary-olive font-bold text-xs transition-colors">
          <ChevronLeft size={14} /> Back to My Tasks
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        <div className="space-y-5">
          <div className="bg-white rounded-3xl shadow-sm border border-surface-border overflow-hidden">
            <div className="relative p-5 md:p-6 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #334612 0%, #556F1F 100%)' }}>
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-white/60 bg-white/10 px-2 py-0.5 rounded-md">{task.jobNumber}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border border-white/20 text-white bg-white/10">{statusCfg.label}</span>
                </div>
                <h1 className="text-lg md:text-xl font-black text-white tracking-tight leading-tight">{task.taskName}</h1>
                <p className="text-white/70 text-[11px] md:text-[12px] font-semibold mt-1 flex items-center gap-1.5">
                  <Building2 size={12} /> Project: {task.projectName || 'Assigned Project'}
                </p>
              </div>
            </div>

            <div className="p-5 md:p-6 space-y-5">
              {task.status === 'REWORK_REQUESTED' && (
                <div className="flex gap-3 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0"><RotateCcw size={18} className="text-orange-600" /></div>
                  <div>
                    <p className="text-[11px] font-black text-orange-700 uppercase tracking-widest mb-0.5">Rework Requested</p>
                    <p className="text-[13px] text-orange-800 font-medium leading-snug">Review the admin's comments and resubmit your work.</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-2 px-1">Description</p>
                <div className="bg-surface-hover/50 p-4 rounded-2xl border border-surface-border">
                  <p className="text-[13.5px] text-text-medium leading-relaxed font-medium">{task.description || 'No description provided.'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-surface-hover/30 rounded-2xl border border-surface-border">
                  <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-2 flex items-center gap-1.5 leading-none"><Calendar size={11} /> Dates</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-text-light font-bold">Assigned:</span>
                      <span className="text-[11.5px] text-text-dark font-black">{fmtDate(task.plannedStartDate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-text-light font-bold">Target:</span>
                      <span className={cn('text-[11.5px] font-black', isLate ? 'text-red-500' : 'text-text-dark')}>{fmtDate(task.plannedEndDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-surface-hover/30 rounded-2xl border border-surface-border">
                  <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-2 flex items-center gap-1.5 leading-none"><Timer size={11} /> Efforts</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-text-light font-bold">Budgeted:</span>
                      <span className="text-[11.5px] text-text-dark font-black">{task.plannedEffortsHours}h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-text-light font-bold">Logged:</span>
                      <span className="text-[11.5px] text-text-dark font-black">{task.actualEffortsHours}h</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-surface-hover/30 rounded-2xl border border-surface-border">
                <ProgressBar value={progress} />
              </div>

              {task.attachments && task.attachments.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-[9px] font-black text-text-light uppercase tracking-widest flex items-center gap-1.5 px-1 leading-none">
                    <Upload size={11} /> Task Attachments
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {task.attachments.map(file => (
                      <div key={file.id} 
                        onClick={() => handleFilePreview(file)}
                        className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-surface-border hover:border-primary-olive/30 hover:bg-primary-50/20 transition-all cursor-pointer group shadow-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                            <FileText size={16} className="text-primary-olive" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-bold text-text-dark truncate leading-tight">{file.fileName}</p>
                            <p className="text-[9px] text-text-light font-bold uppercase">{(file.fileSize / 1024).toFixed(0)} KB • {file.fileType.split('/')[1]?.toUpperCase() || 'FILE'}</p>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-text-light group-hover:text-primary-olive group-hover:bg-primary-50 transition-all opacity-0 group-hover:opacity-100">
                           <Eye size={13} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-3xl shadow-sm border border-surface-border p-5">
            <h3 className="text-[11px] font-black text-text-dark uppercase tracking-widest mb-4">Task Execution Timer</h3>
            <div className={cn('flex flex-col items-center justify-center rounded-2xl py-6 mb-4 border-2 transition-all', isRunning ? 'bg-primary-50 border-primary-100 shadow-inner' : 'bg-surface-hover border-surface-border')}>
              <p className={cn('text-3xl font-black tracking-tight tabular-nums transition-colors duration-500', isRunning ? 'text-primary-olive' : 'text-text-light')}>{fmtDuration(displaySecs)}</p>
              <p className="text-[9px] font-black text-text-light mt-1 uppercase tracking-widest">{isRunning ? '● Live Recording' : displaySecs > 0 ? 'Session Paused' : 'Ready to Start'}</p>
            </div>

            {canWork && (
              <div className="space-y-2.5">
                {!isRunning ? (
                  <Button icon={<Play size={14} fill="currentColor" />} className="w-full h-10 rounded-xl text-[13px] font-black shadow-lg shadow-primary-olive/10" onClick={handleStartTimer}>{displaySecs > 0 ? 'Resume Work Session' : 'Start Execution'}</Button>
                ) : (
                  <Button variant="ghost" icon={<Square size={12} fill="currentColor" />} className="w-full h-9 rounded-xl text-[12px] border border-surface-border text-text-medium" onClick={handlePauseTimer}>Pause Recording</Button>
                )}
                {canSubmit && <Button icon={<Send size={14} />} className="w-full h-10 rounded-xl text-[13px] font-black shadow-lg shadow-primary-olive/10 bg-primary-olive" onClick={handleStopAndSubmit}>{isRunning ? 'Stop & Submit' : 'Submit for Review'}</Button>}
              </div>
            )}

            {task.status === 'UNDER_REVIEW' && (
              <div className="flex flex-col items-center text-center py-4 bg-teal-50/50 rounded-2xl border border-teal-100">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mb-2 text-teal-600"><Clock size={20} /></div>
                <p className="text-[13px] font-black text-teal-800">Verification Pending</p>
                <p className="text-[11px] text-teal-600 font-bold px-4 leading-tight mt-1">Your work is currently being reviewed by the department head.</p>
              </div>
            )}
            {task.status === 'COMPLETED' && (
              <div className="flex flex-col items-center text-center py-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-2 text-emerald-600"><CheckCircle2 size={20} /></div>
                <p className="text-[13px] font-black text-emerald-800">Task Completed</p>
                <p className="text-[11px] text-emerald-600 font-bold px-4 leading-tight mt-1">Assignment approved and archived. Excellent performance!</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-surface-border p-5">
            <h3 className="text-[11px] font-black text-text-dark uppercase tracking-widest mb-4">Assignment Identity</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center text-primary-olive font-black text-xs shrink-0 shadow-sm">{task.createdBy.name.charAt(0).toUpperCase()}</div>
                <div>
                  <p className="text-[9px] font-black text-text-light uppercase tracking-widest leading-none mb-1">Supervisor</p>
                  <p className="text-[12.5px] font-bold text-text-dark">{task.createdBy.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <p className="text-[9px] font-black text-text-light uppercase tracking-widest leading-none mb-1.5 px-1">Discipline</p>
                  <span className="inline-block px-2.5 py-1 bg-surface-hover text-text-medium text-[10px] font-black rounded-lg border border-surface-border uppercase tracking-tight">{task.category.replace(/_/g, ' ')}</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-text-light uppercase tracking-widest leading-none mb-1.5 px-1">Priority Level</p>
                  <span className={cn('inline-block px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase tracking-tight',
                    task.priority === 'URGENT' ? 'bg-red-50 text-red-600 border-red-200' :
                    task.priority === 'HIGH'   ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-gray-50 text-gray-500 border-gray-200')}>{task.priority} Priority</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSubmit && (
        <SubmitWorkModal
          task={task}
          totalSeconds={timerState.totalSeconds}
          onClose={() => setShowSubmit(false)}
          onSuccess={updated => { setTask(updated); setTimerState({ totalSeconds: 0, startedAt: null }); setDisplaySecs(0) }}
        />
      )}

      {previewFile && (
        <FilePreviewModal
          open={!!previewFile}
          onClose={() => setPreviewFile(null)}
          fileUrl={previewFile.url}
          fileName={previewFile.name}
          fileType={previewFile.type}
        />
      )}
    </PageContainer>
  )
}
