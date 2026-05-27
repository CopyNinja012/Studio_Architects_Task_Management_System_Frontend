import { useState, useEffect } from 'react'
import {
  Building2, MapPin, Users, Calendar, Clock,
  Layers, Trash2, Pencil, RefreshCw,
  ListTree, X,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/Button'
import { Modal, ConfirmModal } from '@/shared/components/ui/Modal'
import { projectApi } from '../api/projectApi'
import { taskApi } from '../api/taskApi'
import { PROJECT_STATUSES_LIST } from '../model/constant'
import type { ProjectResponse, ProjectStatus, ProjectType } from '../model/projectTypes'
import type { TaskApi } from '../model/types'
import { StatusPill } from '@/shared/components/status/StatusPill'
import { Timeline } from '@/shared/components/ui/Timeline'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso?: string) {
  if (!iso) return '—'
  try { return format(new Date(iso), 'dd MMM yyyy') } catch { return iso }
}

function daysLeft(iso?: string) {
  if (!iso) return null
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
}

// ─── Badges ───────────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: ProjectType }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider',
      type === 'BIG' ? 'bg-primary-50 text-primary-olive border border-primary-100' : 'bg-amber-50 text-amber-700 border border-amber-200'
    )}>
      {type === 'BIG' ? 'Enterprise' : 'Small'}
    </span>
  )
}

const TASK_STATUS_STYLES: Record<string, string> = {
  ASSIGNED:        'bg-slate-50 text-slate-600 border-slate-200',
  IN_PROGRESS:     'bg-teal-50 text-teal-700 border-teal-200',
  UNDER_REVIEW:    'bg-amber-50 text-amber-700 border-amber-200',
  COMPLETED:       'bg-primary-50 text-primary-olive border-primary-100',
  REWORK_REQUESTED: 'bg-orange-50 text-orange-700 border-orange-200',
}

function TaskStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize', TASK_STATUS_STYLES[status] ?? 'bg-gray-50 text-gray-600 border-gray-200')}>
      {status.toLowerCase().replace('_', ' ')}
    </span>
  )
}

function ProgressBar({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const color = value >= 75 ? '#40521B' : value >= 50 ? '#556F1F' : value >= 25 ? '#f59e0b' : '#d1d5db'
  return (
    <div className="flex items-center gap-2">
      <div className={cn('flex-1 bg-surface-border rounded-full overflow-hidden', size === 'sm' ? 'h-1' : 'h-1.5')}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-black text-text-dark w-7 text-right">{value}%</span>
    </div>
  )
}

function InfoCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 p-3.5 bg-primary-50 rounded-2xl border border-primary-100 hover:border-primary-olive/30 transition-colors shadow-sm">
      <div className="w-7 h-7 rounded-xl bg-white border border-primary-100 flex items-center justify-center shrink-0 shadow-sm">
        <span className="text-primary-olive">{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[8.5px] font-black text-text-light uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}

function InfoText({ value }: { value: string }) {
  return <p className="text-[12.5px] font-bold text-[#111827] truncate">{value}</p>
}

function ContactInfo({ name, email, phone }: { name: string; email: string; phone: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[12.5px] font-bold text-[#111827] truncate">{name}</p>
      <div className="flex flex-col">
        <p className="text-[9.5px] font-medium text-[#6B7280] truncate">{email}</p>
        <p className="text-[9.5px] font-medium text-[#6B7280] truncate">{phone}</p>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  id: string | null
  open: boolean
  onClose: () => void
  onDeleted?: () => void
}

export function ProjectDetailModal({ id, open, onClose, onDeleted }: Props) {
  const [project, setProject] = useState<ProjectResponse | null>(null)
  const [loading, setProjectLoading] = useState(false)
  const [activeTab,      setActiveTab]      = useState<'overview' | 'tasks'>('overview')
  const [tasks,          setTasks]          = useState<TaskApi[]>([])
  const [loadingTasks,   setLoadingTasks]   = useState(false)
  const [confirmDelete,  setConfirmDelete]  = useState(false)
  const [deleting,       setDeleting]       = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (!id || !open) return
    setProjectLoading(true)
    projectApi.getProjectById(id)
      .then(setProject)
      .catch(() => {
        toast.error('Failed to load project')
        onClose()
      })
      .finally(() => setProjectLoading(false))
  }, [id, open])

  useEffect(() => {
    if (activeTab === 'tasks' && id && open) {
      setLoadingTasks(true)
      taskApi.getTasks({ projectId: id })
        .then(res => setTasks(res.content))
        .catch(() => toast.error('Failed to load tasks'))
        .finally(() => setLoadingTasks(false))
    }
  }, [activeTab, id, open])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await projectApi.deleteProject(project!.id)
      toast.success('Project deleted successfully')
      onDeleted?.()
      onClose()
    } catch {
      toast.error('Failed to delete project')
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    setUpdatingStatus(true)
    setShowStatusMenu(false)
    try {
      const updated = await projectApi.updateProjectStatus(project!.id, { status: status as ProjectStatus })
      toast.success(`Status updated to ${status.replace('_', ' ')}`)
      setProject(updated)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (!open) return null

  if (loading || !project) {
    return (
      <Modal open={open} onClose={onClose} size="xl">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-olive rounded-full animate-spin" />
        </div>
      </Modal>
    )
  }

  const days = daysLeft(project.expectedCompletionDate)

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={project.projectName}
      subtitle={`Job #${project.jobNumber} · ${project.clientOwnerName}`}
      icon={<Building2 size={22} className="text-primary-olive" />}
      footer={
        <div className="flex items-center justify-between w-full px-2">
          <p className="hidden sm:block text-[10px] font-bold text-text-light uppercase tracking-widest italic leading-none">
            Initialized on {fmtDate(project.startDate)}
          </p>
          <div className="flex items-center gap-2">
             <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold text-[#6B7280] h-9">Close</Button>
             <Button 
               variant="danger" 
               icon={<Trash2 size={12} />} 
               onClick={() => setConfirmDelete(true)}
               className="rounded-xl px-5 h-9 font-black shadow-lg shadow-red-500/10"
             >
               Delete Project
             </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ── Action & Tabs Bar ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4 -mt-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                icon={<RefreshCw size={12} />}
                loading={updatingStatus}
                onClick={() => setShowStatusMenu(v => !v)}
                className="h-8 text-[12px] px-3 border border-[#E5E7EB] font-bold rounded-lg"
              >
                Update Status
              </Button>
              {showStatusMenu && (
                <div className="absolute top-full left-0 mt-1.5 w-44 bg-white rounded-xl shadow-2xl border border-[#E5E7EB] z-60 py-1 animate-in fade-in zoom-in-95 duration-200">
                  {PROJECT_STATUSES_LIST.map(s => (
                    <button
                      key={s.value}
                      onClick={() => handleStatusChange(s.value)}
                      className={cn(
                        'w-full text-left px-3.5 py-2 text-[12px] font-semibold hover:bg-primary-50 transition-colors flex items-center justify-between',
                        project.status === s.value ? 'text-primary-olive font-bold bg-primary-50' : 'text-[#6B7280]'
                      )}
                    >
                      {s.label}
                      {project.status === s.value && <X size={11} className="rotate-45" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              icon={<Pencil size={12} />}
              className="h-8 text-[12px] px-3 border border-[#E5E7EB] font-bold rounded-lg"
              onClick={() => toast.info('Edit project coming soon')}
            >
              Edit Details
            </Button>
          </div>

          <div className="flex items-center gap-1 bg-primary-50 p-1 rounded-lg border border-primary-100">
            {(['overview', 'tasks'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all',
                  activeTab === tab
                    ? 'bg-white text-primary-olive shadow-sm border border-primary-100'
                    : 'text-text-light hover:text-text-medium'
                )}
              >
                {tab === 'overview' ? <Layers size={12} strokeWidth={3} /> : <ListTree size={12} strokeWidth={3} />}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ─────────────────────────────────────────── */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="p-5 bg-white rounded-3xl border border-primary-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-olive/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <p className="text-[10px] font-black text-text-light uppercase tracking-widest leading-none">Execution Progress</p>
                  <div className="flex items-center gap-2">
                    <TypeBadge type={project.projectType} />
                    {days !== null && (
                      <span className={cn('text-[11px] font-black uppercase tracking-tight px-2 py-0.5 rounded-lg bg-white border border-primary-100', days < 0 ? 'text-red-500' : days < 30 ? 'text-amber-600' : 'text-primary-olive')}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                      </span>
                    )}
                  </div>
                </div>
                <ProgressBar value={project.progress} />
              </div>

              {project.description && (
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-text-light uppercase tracking-widest px-1">Description</p>
                  <div className="text-[13.5px] text-[#4B5563] leading-relaxed bg-primary-50/40 p-5 rounded-3xl border border-primary-100 font-medium italic">
                    "{project.description}"
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-[9px] font-black text-text-light uppercase tracking-widest px-1">Infrastructure Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <InfoCard icon={<Users size={12} />}    label="Client / Owner">
                    <InfoText value={project.clientOwnerName} />
                  </InfoCard>
                  <InfoCard icon={<MapPin size={12} />}   label="Site Location">
                    <InfoText value={project.siteLocation} />
                  </InfoCard>
                  <InfoCard icon={<Layers size={12} />}   label="Project Lead">
                    {project.projectLead ? (
                      <ContactInfo name={project.projectLead.name} email={project.projectLead.email} phone={project.projectLead.phone} />
                    ) : (
                      <InfoText value={project.projectLeadName || 'Unassigned'} />
                    )}
                  </InfoCard>
                  <InfoCard icon={<Users size={12} />}    label="Assigned Staff">
                    {project.assignedEmployee ? (
                      <ContactInfo name={project.assignedEmployee.name} email={project.assignedEmployee.email} phone={project.assignedEmployee.phone} />
                    ) : (
                      <InfoText value={project.assignedEmployeeName || 'Unassigned'} />
                    )}
                  </InfoCard>
                  <InfoCard icon={<Calendar size={12} />} label="Inception Date">
                    <InfoText value={fmtDate(project.startDate)} />
                  </InfoCard>
                  <InfoCard icon={<Clock size={12} />}    label="Delivery Goal">
                    <InfoText value={fmtDate(project.expectedCompletionDate)} />
                  </InfoCard>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-black text-text-light uppercase tracking-widest px-1">Milestone History</p>
                <div className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm">
                  <Timeline items={[
                    { id: 1, title: 'Project Created', description: `Architectural project initialized`, time: fmtDate(project.startDate), status: 'success' },
                    { id: 2, title: 'Leadership Defined', description: `${project.projectLead?.name || project.projectLeadName || 'Manager'} appointed`, time: fmtDate(project.startDate), status: 'default' },
                    { id: 3, title: 'Progress Update', description: `Currently at ${project.progress}% completion`, time: 'Current', status: 'warning' },
                  ]} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-5">
              {loadingTasks ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-olive rounded-full animate-spin" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-text-light bg-white rounded-3xl border border-dashed border-primary-100">
                  <ListTree size={40} className="mb-3 opacity-10 text-primary-olive" />
                  <p className="text-[14px] font-bold text-[#111827] tracking-tight">No tasks currently recorded</p>
                  <p className="text-[11px] font-medium text-text-light mt-1">New project tasks will appear here once assigned.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-[1fr_100px_100px_120px_90px] gap-4 px-5 pb-1">
                    {['Task Information', 'Start', 'Deadline', 'Execution', 'Status'].map(h => (
                      <p key={h} className="text-[8.5px] font-black text-text-light uppercase tracking-widest">{h}</p>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {tasks.map(task => {
                      const due  = new Date(task.plannedEndDate)
                      const now  = new Date()
                      const late = due < now && task.status !== 'COMPLETED'
                      return (
                        <div
                          key={task.id}
                          className="grid grid-cols-[1fr_100px_100px_120px_90px] gap-4 items-center px-5 py-4 rounded-[20px] bg-white border border-primary-100 hover:border-primary-olive/30 shadow-sm transition-all group cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="text-[12.5px] font-black text-[#111827] truncate group-hover:text-primary-olive transition-colors">{task.taskName}</p>
                            <p className="text-[9px] font-mono font-bold text-text-light mt-0.5 uppercase tracking-tighter">{task.jobNumber}</p>
                          </div>
                          <span className="text-[11.5px] font-bold text-[#6B7280]">{fmtDate(task.plannedStartDate)}</span>
                          <span className={cn('text-[11.5px] font-black', late ? 'text-red-500' : 'text-[#6B7280]')}>
                            {fmtDate(task.plannedEndDate)}
                          </span>
                          <ProgressBar value={Math.round((task.actualEffortsHours / (task.plannedEffortsHours || 1)) * 100)} size="sm" />
                          <TaskStatusBadge status={task.status} />
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between px-1 pt-2">
                    <span className="text-[10px] font-black text-text-light uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-lg border border-primary-100">
                      {tasks.length} active tasks monitored
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message={`This action will permanently delete "${project.projectName}" and all associated task history. This cannot be reversed.`}
        confirmLabel="Destroy Project"
        variant="danger"
        loading={deleting}
      />
    </Modal>
  )
}
