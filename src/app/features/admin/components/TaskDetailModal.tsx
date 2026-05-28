import { useState, useEffect } from 'react'
import {
  User, Layers, Calendar, Clock,
  History, CheckCircle2,
  FileText, Eye, Building2,
  RotateCcw, Download,
} from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { StatusPill } from '@/shared/components/status/StatusPill'
import { PriorityTag } from '@/shared/components/status/PriorityTag'
import { Timeline } from '@/shared/components/ui/Timeline'
import { FilePreviewModal } from '@/shared/components/ui/FilePreviewModal'
import { formatDate, formatDateTime } from '@/shared/lib/date'
import { taskApi } from '../api/taskApi'
import { projectApi } from '../api/projectApi'
import { cn } from '@/shared/lib/cn'
import type { TaskApi, TaskTimelineResponse, TaskAttachmentResponse } from '../model/types'

interface Props {
  id: string | null
  open: boolean
  onClose: () => void
  onTaskUpdated?: (updated: TaskApi) => void
  hideActions?: boolean
}

export function TaskDetailModal({ id, open, onClose, onTaskUpdated, hideActions = false }: Props) {
  const [task, setTask] = useState<TaskApi | null>(null)
  const [projectName, setProjectName] = useState('Loading...')
  const [timeline, setTimeline] = useState<TaskTimelineResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [showReworkInput, setShowReworkInput] = useState(false)
  const [reworkRemark, setReworkRemark] = useState('')

  // Preview state
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: string } | null>(null)

  const fetchTaskData = async () => {
    if (!id) return
    setLoading(true)
    try {
      // 1. Fetch core data (Task and Projects)
      const [t, projRes] = await Promise.all([
        taskApi.getTaskById(id),
        projectApi.getAllProjects({}, 0, 200)
      ])
      setTask(t)
      const p = projRes.content.find(pj => pj.id === t.projectId)
      setProjectName(p?.projectName || 'Unknown Project')

      // 2. Fetch timeline separately to prevent blocking on failure (500 error)
      taskApi.getTaskTimeline(id)
        .then(tl => setTimeline(tl))
        .catch(() => {
          console.warn('Failed to load timeline for task:', id)
          setTimeline([])
        })
    } catch {
      toast.error('Failed to load task details')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id && open) {
      fetchTaskData()
      setShowReworkInput(false)
      setReworkRemark('')
    }
  }, [id, open])

  const handleApprove = async () => {
    if (!task) return
    setActionLoading(true)
    try {
      const updated = await taskApi.reviewTask(task.id, { approved: true, remarks: 'Approved' })
      setTask(updated)
      toast.success('Task approved successfully')
      onTaskUpdated?.(updated)
      taskApi.getTaskTimeline(task.id).then(setTimeline).catch(() => {})
    } catch {
      toast.error('Failed to approve task')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSendRework = async () => {
    if (!task || !reworkRemark.trim()) {
      toast.error('Please provide a remark for rework')
      return
    }
    setActionLoading(true)
    try {
      const updated = await taskApi.reviewTask(task.id, { approved: false, remarks: reworkRemark })
      setTask(updated)
      toast.success('Task sent back for rework')
      setShowReworkInput(false)
      onTaskUpdated?.(updated)
      taskApi.getTaskTimeline(task.id).then(setTimeline).catch(() => {})
    } catch {
      toast.error('Failed to send rework')
    } finally {
      setActionLoading(false)
    }
  }

  const handleFilePreview = async (file: TaskAttachmentResponse) => {
    if (!task) return
    
    try {
      // We fetch the blob first using apiClient (which includes the ngrok bypass header)
      const blob = await taskApi.getAttachmentBlob(task.id, file.id)
      const url = window.URL.createObjectURL(blob)
      
      // For images and PDFs, we open the blob URL in a new tab
      if (file.fileType.startsWith('image/') || file.fileType === 'application/pdf') {
        window.open(url, '_blank')
        return
      }

      // For other files, use the preview modal
      setPreviewFile({ url, name: file.fileName, type: file.fileType })
    } catch (err) {
      toast.error('Failed to load file preview')
    }
  }

  if (!open) return null

  if (loading || !task) {
    return (
      <Modal open={open} onClose={onClose} size="xl">
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-olive rounded-full animate-spin" />
        </div>
      </Modal>
    )
  }

  const timelineItems = timeline.map(event => ({
    id: event.id,
    title: event.toStatus.replace('_', ' '),
    description: `by ${event.changedBy.name}${event.remarks ? `: ${event.remarks}` : ''}`,
    time: formatDateTime(event.timestamp),
    status: (event.toStatus === 'COMPLETED' ? 'success' : 
             event.toStatus === 'REWORK_REQUESTED' ? 'error' : 
             event.toStatus === 'UNDER_REVIEW' ? 'warning' : 'default') as any,
    icon: event.toStatus === 'COMPLETED' ? <CheckCircle2 size={12} /> : <Clock size={12} />
  }))

  const showAttachments = task.status === 'COMPLETED' || !hideActions

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={task.taskName}
      subtitle={`Task ID #${task.jobNumber} · ${projectName}`}
      icon={<Building2 size={24} className="text-primary-olive" />}
      footer={
        <div className="flex items-center justify-between w-full px-2">
          <div className="flex items-center gap-4 text-[9px] font-black text-[#9CA3AF] uppercase tracking-widest italic">
            Created {formatDate(task.createdAt)} by {task.createdBy.name}
          </div>
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold text-[#6B7280] h-9">Close Detail</Button>
        </div>
      }
    >
      <div className="animate-in fade-in duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          <div className="space-y-5">
            {/* Main Info */}
            <div className="bg-white rounded-[24px] shadow-sm border border-[#E5E7EB] p-5">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex flex-wrap gap-2">
                  <StatusPill status={task.status} />
                  <PriorityTag priority={task.priority as any} />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-widest mb-2 px-1">Task Specification</p>
                  <div className="text-[13.5px] text-[#4B5563] leading-relaxed bg-primary-50/50 p-5 rounded-2xl border border-[#E5E7EB] font-medium">
                    {task.description || 'No description provided.'}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Assigned To', value: task.assignedTo.name,    icon: <User size={12} />     },
                    { label: 'Category',    value: task.category,           icon: <Layers size={12} />   },
                    { label: 'Start Date',  value: formatDate(task.plannedStartDate),   icon: <Calendar size={12} /> },
                    { label: 'Deadline',    value: formatDate(task.plannedEndDate),     icon: <Calendar size={12} /> },
                    { label: 'Est. Hours',  value: `${task.plannedEffortsHours}h`,    icon: <Clock size={12} />    },
                    { label: 'Logged Time', value: `${task.actualEffortsHours}h`,     icon: <Clock size={12} />    },
                  ].map(item => (
                    <div key={item.label} className="p-3 bg-white rounded-xl border border-[#E5E7EB] shadow-sm hover:border-primary-100 hover:shadow-primary-olive/5 transition-all group">
                      <div className="flex items-center gap-1.5 text-[#9CA3AF] mb-1.5 group-hover:text-primary-olive transition-colors">
                        {item.icon}
                        <span className="text-[8.5px] uppercase tracking-widest font-black">{item.label}</span>
                      </div>
                      <p className="text-[12px] font-bold text-[#111827] truncate">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="p-5 bg-primary-50 rounded-[24px] border border-primary-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary-olive/5 rounded-full blur-2xl" />
                  <div className="flex justify-between items-end mb-2.5 relative z-10">
                    <div>
                      <p className="text-[9px] font-black text-primary-olive uppercase tracking-widest">Execution Metrics</p>
                      <p className="text-xl font-black text-[#111827] mt-0.5">
                        {Math.round((task.actualEffortsHours / (task.plannedEffortsHours || 1)) * 100)}%
                      </p>
                    </div>
                    <p className="text-[10px] text-[#6B7280] font-bold mb-0.5">
                      {task.actualEffortsHours} / {task.plannedEffortsHours} hours efficiency
                    </p>
                  </div>
                  <div className="h-1.5 bg-white rounded-full overflow-hidden border border-[#E5E7EB]">
                    <div
                      className="h-full rounded-full transition-all duration-1000 shadow-sm"
                      style={{
                        width: `${Math.min(100, Math.round((task.actualEffortsHours / (task.plannedEffortsHours || 1)) * 100))}%`,
                        backgroundColor: '#40521B'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments Section - Conditional for Admin */}
            {showAttachments && (
              <div className="bg-white rounded-[24px] shadow-sm border border-[#E5E7EB] p-5">
                <h3 className="text-[9px] font-black text-[#111827] uppercase tracking-widest mb-4 flex items-center gap-2 px-1">
                  <FileText size={13} className="text-primary-olive" />
                  Deliverables
                </h3>
                
                {task.attachments && task.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {task.attachments.map(file => (
                      <div key={file.id} 
                        onClick={() => handleFilePreview(file)}
                        className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#E5E7EB] hover:border-primary-100 hover:shadow-md hover:shadow-primary-olive/5 transition-all cursor-pointer group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 border border-[#E5E7EB] group-hover:border-primary-100 transition-all">
                            <FileText size={14} className="text-primary-olive" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-[#111827] truncate leading-tight">{file.fileName}</p>
                            <p className="text-[8.5px] text-[#9CA3AF] font-bold mt-0.5 uppercase tracking-tight">
                              {(file.fileSize / 1024).toFixed(0)} KB · {file.fileType.split('/')[1]?.toUpperCase() || 'DATA'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[9px] font-black text-primary-olive uppercase tracking-widest">Preview</span>
                          <Eye size={12} className="text-primary-olive" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-primary-100 rounded-[24px] bg-primary-50/30">
                    <FileText size={28} className="text-primary-200 mb-2 opacity-40" />
                    <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">No documentation found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar: Timeline & Actions */}
          <div className="space-y-5">
            <div className="bg-white rounded-[24px] shadow-sm border border-[#E5E7EB] p-5">
              <h3 className="text-[9px] font-black text-[#111827] uppercase tracking-widest mb-5 flex items-center gap-2 px-1">
                <History size={13} className="text-primary-olive" />
                Event Timeline
              </h3>

              {timelineItems.length === 0 ? (
                <p className="text-[11px] text-[#9CA3AF] italic px-1">No event history recorded.</p>
              ) : (
                <Timeline items={timelineItems as any} />
              )}
            </div>

            {/* Actions: Only if NOT hidden (Approvals screen) */}
            {task.status === 'UNDER_REVIEW' && !hideActions && (
              <div className="bg-white rounded-[24px] shadow-xl border border-primary-100 overflow-hidden">
                <div className="bg-[#111827] px-5 py-3 flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-primary-olive" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">Management Review</span>
                </div>
                <div className="p-5 space-y-4">
                  {!showReworkInput ? (
                    <div className="flex flex-col gap-2">
                      <Button 
                        fullWidth 
                        onClick={handleApprove} 
                        loading={actionLoading}
                        className="bg-primary-olive hover:bg-primary-700 text-white rounded-xl h-10 font-black shadow-lg shadow-primary-olive/20 transition-all hover:-translate-y-0.5"
                        icon={<CheckCircle2 size={14} strokeWidth={3} />}
                      >
                        Final Approve
                      </Button>
                      <Button 
                        fullWidth 
                        variant="ghost" 
                        onClick={() => setShowReworkInput(true)}
                        className="text-[#6B7280] bg-primary-50 hover:bg-white hover:border-primary-olive/20 border border-primary-100 rounded-xl h-10 font-bold transition-all"
                        icon={<RotateCcw size={14} />}
                      >
                        Request Rework
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div>
                        <label className="text-[8.5px] font-black text-[#9CA3AF] uppercase tracking-widest mb-1.5 block px-1">Critical Feedback</label>
                        <textarea 
                          value={reworkRemark}
                          onChange={e => setReworkRemark(e.target.value)}
                          rows={4}
                          placeholder="Detail specific improvements required..."
                          className="w-full rounded-2xl border border-primary-100 bg-white px-3.5 py-3 text-[12.5px] text-[#111827] resize-none focus:outline-none focus:ring-4 focus:ring-primary-olive/5 focus:border-primary-olive transition-all font-medium"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg h-9 font-black" 
                          onClick={handleSendRework}
                          loading={actionLoading}
                        >
                          Send
                        </Button>
                        <Button 
                          className="flex-1 rounded-lg h-9 font-bold" 
                          variant="ghost" 
                          onClick={() => setShowReworkInput(false)}
                          disabled={actionLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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
