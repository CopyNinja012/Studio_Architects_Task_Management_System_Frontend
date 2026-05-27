import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Building2, X, FolderKanban, ChevronLeft, Calendar, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { Input } from '@/shared/components/ui/Input'
import { DatePicker } from '@/shared/components/ui/DatePicker'
import { DataTable, type Column } from '@/shared/components/table/DataTable'
import { Pagination } from '@/shared/components/ui/Pagination'
import { Dropdown } from '@/shared/components/ui/Dropdown'
import { projectApi } from '../api/projectApi'
import { cn } from '@/shared/lib/cn'
import type {
  ProjectResponse,
  ProjectType,
  ProjectStatus,
} from '../model/projectTypes'
import { PROJECT_TYPES, PROJECT_STATUSES_LIST } from '../model/constant'
import { PATHS } from '@/router/path'

import { StatusPill } from '@/shared/components/status/StatusPill'

import { ProjectDetailModal } from '../components/ProjectDetailModal'

// ─── Project Form Schema ──────────────────────────────────────────────────────

const projectSchema = z.object({
  projectName:            z.string().min(3,  'Project name required'),
  jobNumber:              z.string().min(2,  'Job number required'),
  clientOwnerName:        z.string().min(2,  'Client/Owner name required'),
  projectType:            z.enum(['BIG', 'SMALL'], { message: 'Project type required' }),
  projectLeadId:          z.string().optional(),
  assignedEmployeeId:     z.string().optional(),
  startDate:              z.date({ message: 'Start date required' }),
  expectedCompletionDate: z.date({ message: 'Expected completion date required' }),
  siteLocation:           z.string().min(2,  'Site location required'),
  description:            z.string().max(2000).optional(),
})
type ProjectFormValues = z.infer<typeof projectSchema>

// ─── Create Project Modal ─────────────────────────────────────────────────────

function CreateProjectModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const navigate = useNavigate()
  const [managers,  setManagers]  = useState<{ value: string; label: string }[]>([])
  const [employees, setEmployees] = useState<{ value: string; label: string }[]>([])
  const [loadingPeople, setLoadingPeople] = useState(true)

  useEffect(() => {
    if (!open) return
    setLoadingPeople(true)
    Promise.all([projectApi.getProjectManagers(), projectApi.getAssignableEmployees()])
      .then(([mgrs, emps]) => {
        setManagers(mgrs.map(u => ({ value: u.id, label: u.name + (u.designation ? ` — ${u.designation}` : '') })))
        setEmployees(emps.map(u => ({ value: u.id, label: u.name + (u.designation ? ` — ${u.designation}` : '') })))
      })
      .catch(() => {})
      .finally(() => setLoadingPeople(false))
  }, [open])

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { projectType: 'SMALL' },
  })

  const onSubmit = async (values: ProjectFormValues) => {
    try {
      const created = await projectApi.createProject({
        ...values,
        startDate:              format(values.startDate, 'yyyy-MM-dd'),
        expectedCompletionDate: format(values.expectedCompletionDate, 'yyyy-MM-dd'),
      })
      toast.success('Project created successfully')
      reset()
      onCreated()
      onClose()
      navigate(PATHS.ADMIN_PROJECTS) // Stay on projects or go to detail if needed
    } catch (err: any) {
      toast.error('Failed to create project', { description: err?.message })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Create New Project"
      subtitle="Operational Initialization"
      icon={<FolderKanban size={22} className="text-[#6B7F3A]" />}
      footer={
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold text-[#6B7280]">Cancel</Button>
          <Button 
            type="submit" 
            form="create-project-form" 
            loading={isSubmitting} 
            className="bg-[#6B7F3A] hover:bg-[#4B5A2A] text-white rounded-xl px-8 font-black shadow-lg shadow-[#6B7F3A]/20 transition-all hover:-translate-y-1"
            icon={<Plus size={16} />}
          >
            Create Project
          </Button>
        </div>
      }
    >
      <form id="create-project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* Core Identity */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-3">
            <span className="w-6 h-6 rounded-lg bg-primary-50 flex items-center justify-center text-[#6B7F3A] border border-[#E5E7EB]">
              <Building2 size={12} strokeWidth={3} />
            </span>
            <h3 className="text-[11px] font-black text-[#111827] uppercase tracking-[0.15em]">Project Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <Input label="Project Name" required placeholder="e.g. Sahyadri Heights" error={errors.projectName?.message} {...register('projectName')} />
            <Input label="Job Number" required placeholder="e.g. JOB-2025-001" error={errors.jobNumber?.message} {...register('jobNumber')} />
            <Input label="Client / Owner Name" required placeholder="e.g. Rajesh Patil" error={errors.clientOwnerName?.message} {...register('clientOwnerName')} />
            <Controller name="projectType" control={control} render={({ field }) => (
              <Dropdown label="Project Classification" required options={PROJECT_TYPES} value={field.value} onChange={field.onChange} placeholder="Select type" error={errors.projectType?.message} />
            )} />
          </div>
        </div>

        {/* Assignment & Timeline */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-3">
            <span className="w-6 h-6 rounded-lg bg-primary-50 flex items-center justify-center text-[#6B7F3A] border border-[#E5E7EB]">
              <Calendar size={12} strokeWidth={3} />
            </span>
            <h3 className="text-[11px] font-black text-[#111827] uppercase tracking-[0.15em]">Timeline & Assignment</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <Controller name="projectLeadId" control={control} render={({ field }) => (
              <Dropdown label="Project Manager" searchable options={managers} value={field.value ?? ''} onChange={field.onChange} placeholder={loadingPeople ? 'Loading…' : 'Select manager'} error={errors.projectLeadId?.message} />
            )} />
            <Controller name="assignedEmployeeId" control={control} render={({ field }) => (
              <Dropdown label="Assigned Employee" searchable options={employees} value={field.value ?? ''} onChange={field.onChange} placeholder={loadingPeople ? 'Loading…' : 'Select employee'} error={errors.assignedEmployeeId?.message} />
            )} />
            <Controller name="startDate" control={control} render={({ field }) => (
              <DatePicker label="Start Date" required value={field.value} onChange={field.onChange} error={errors.startDate?.message} />
            )} />
            <Controller name="expectedCompletionDate" control={control} render={({ field }) => (
              <DatePicker label="Deadline Goal" required value={field.value} onChange={field.onChange} error={errors.expectedCompletionDate?.message} />
            )} />
          </div>
        </div>

        {/* Location & Context */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-3">
            <span className="w-6 h-6 rounded-lg bg-primary-50 flex items-center justify-center text-[#6B7F3A] border border-[#E5E7EB]">
              <MapPin size={12} strokeWidth={3} />
            </span>
            <h3 className="text-[11px] font-black text-[#111827] uppercase tracking-[0.15em]">Location & Context</h3>
          </div>

          <div className="space-y-5">
            <Input label="Site Location Address" required placeholder="e.g. Baner, Pune" error={errors.siteLocation?.message} {...register('siteLocation')} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#111827]">Detailed Project Description</label>
              <textarea {...register('description')} rows={3}
                placeholder="Enter project instructions or scope…"
                className="w-full rounded-3xl border border-[#E5E7EB] bg-white px-4 py-3.5 text-[14px] text-[#111827]
                           placeholder:text-text-light resize-none font-medium transition-all
                           focus:outline-none focus:ring-4 focus:ring-[#6B7F3A]/5 focus:border-[#6B7F3A] shadow-sm" />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  )
}
 

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso?: string) {
  if (!iso) return '—'
  try { return format(new Date(iso), 'dd MMM yyyy') } catch { return iso }
}

function daysLeft(iso?: string) {
  if (!iso) return null
  const diff = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
  return diff
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressCell({ value }: { value: number }) {
  const color = value >= 75 ? '#40521B' : value >= 50 ? '#556F1F' : value >= 25 ? '#f59e0b' : '#d1d5db'
  return (
    <div className="flex flex-col gap-1 min-w-27.5">
      <span className="text-[11px] font-black text-text-dark">{value}%</span>
      <div className="h-1.25 w-full bg-surface-border rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

// ─── Type Badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: ProjectType }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold',
      type === 'BIG' ? 'bg-primary-100 text-primary-olive' : 'bg-amber-50 text-amber-700'
    )}>
      {type === 'BIG' ? 'Big' : 'Small'}
    </span>
  )
}

// ─── Deadline Cell ────────────────────────────────────────────────────────────

function DeadlineCell({ date }: { date?: string }) {
  const days = daysLeft(date)
  const isOverdue = days !== null && days < 0
  const isNear    = days !== null && days >= 0 && days < 30
  return (
    <span className={cn('text-[12px] font-bold', isOverdue ? 'text-red-500' : isNear ? 'text-amber-600' : 'text-text-medium')}>
      {fmtDate(date)}
    </span>
  )
}

// ─── Table Columns ────────────────────────────────────────────────────────────

function buildColumns(): Column<ProjectResponse>[] {
  return [
    {
      key: 'projectName', header: 'Project Name', sortable: true,
      render: row => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
            <Building2 size={14} className="text-primary-olive" />
          </div>
          <span className="text-[13px] font-bold text-text-dark">{row.projectName}</span>
        </div>
      ),
    },
    {
      key: 'jobNumber', header: 'Job Number', sortable: true,
      render: row => <span className="text-[12px] font-semibold text-text-medium">{row.jobNumber}</span>,
    },
    {
      key: 'projectLeadName', header: 'Lead / Employee',
      render: row => {
        const leadName = row.projectLeadName || row.projectLead?.name
        const employeeName = row.assignedEmployeeName || row.assignedEmployee?.name
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] font-semibold text-text-medium">{leadName || '—'}</span>
            {employeeName && (
              <span className="text-[10px] text-text-light">{employeeName}</span>
            )}
          </div>
        )
      },
    },
    {
      key: 'projectType', header: 'Project Type', align: 'center',
      render: row => <TypeBadge type={row.projectType} />,
    },
    {
      key: 'status', header: 'Status', align: 'center',
      render: row => <StatusPill status={row.status} />,
    },

    {
      key: 'startDate', header: 'Start Date', sortable: true,
      render: row => <span className="text-[12px] font-semibold text-text-medium">{fmtDate(row.startDate)}</span>,
    },
    {
      key: 'expectedCompletionDate', header: 'Deadline', sortable: true,
      render: row => <DeadlineCell date={row.expectedCompletionDate} />,
    },
    {
      key: 'progress', header: 'Progress',
      render: row => <ProgressCell value={row.progress} />,
    },
  ]
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Projects() {
  const navigate = useNavigate()
  const [projects,       setProjects]       = useState<ProjectResponse[]>([])
  const [totalElements,  setTotalElements]  = useState(0)
  const [loading,        setLoading]        = useState(true)
  const [search,         setSearch]         = useState('')
  const [statusFilter,   setStatusFilter]   = useState<ProjectStatus | ''>('')
  const [typeFilter,     setTypeFilter]     = useState<ProjectType | ''>('')
  const [page,           setPage]           = useState(1)
  const [pageSize,       setPageSize]       = useState(10)
  const [createOpen,     setCreateOpen]     = useState(false)
  const [detailId,       setDetailId]       = useState<string | null>(null)

  const fetchProjects = async (pg = page, sz = pageSize) => {
    setLoading(true)
    try {
      const res = await projectApi.getAllProjects(
        {
          projectName: search || undefined,
          status:      statusFilter || undefined,
          projectType: typeFilter   || undefined,
        },
        pg - 1, sz,
      )
      setProjects(res.content)
      setTotalElements(res.totalElements)
    } catch {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [page, pageSize, statusFilter, typeFilter])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchProjects(1, pageSize) }, 400)
    return () => clearTimeout(t)
  }, [search])

  const hasFilters = !!(search || statusFilter || typeFilter)

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {}
    projects.forEach(p => { map[p.status] = (map[p.status] ?? 0) + 1 })
    return map
  }, [projects])

  const columns = buildColumns()

  return (
    <div className="space-y-6 animate-fade-in">
      <Card padding="none" className="border border-surface-border shadow-sm overflow-visible bg-transparent">
        
        {/* ── Toolbar ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-4 py-4 lg:py-3 border-b border-surface-border bg-white rounded-t-2xl relative z-30">
          <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1 min-w-0">
            {/* Search */}
            <div className="relative shrink-0 w-full md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search projects…"
                className="w-full pl-9 pr-3 h-10 md:h-9 text-[12px] border border-surface-border rounded-xl bg-[#F9FAFB]
                           focus:outline-none focus:border-primary-olive focus:ring-4 focus:ring-primary-olive/5
                           transition-all font-medium placeholder:text-text-light" />
            </div>

            <div className="h-6 w-px bg-surface-border hidden md:block" />

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] overflow-x-auto no-scrollbar max-w-full">
              {[{ value: '', label: 'All' }, ...PROJECT_STATUSES_LIST].map((s) => (
                <button
                  key={s.value}
                  onClick={() => { setStatusFilter(s.value as ProjectStatus | ''); setPage(1) }}
                  className={cn(
                    "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap",
                    statusFilter === s.value 
                      ? "bg-white text-primary-olive shadow-sm ring-1 ring-black/5" 
                      : "text-text-light hover:text-text-medium"
                  )}
                >
                  {s.label}
                  {s.value && <span className="ml-1 text-[8px] opacity-40">{statusCounts[s.value] ?? 0}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full lg:w-auto justify-between lg:justify-end">
            <div className="shrink-0 w-32 sm:w-40">
              <Dropdown options={[{ value: '', label: 'All Types' }, ...PROJECT_TYPES]} value={typeFilter}
                onChange={v => { setTypeFilter(v as ProjectType | ''); setPage(1) }} placeholder="Type" />
            </div>
            
            <div className="flex items-center gap-2">
              {hasFilters && (
                <button onClick={() => { setSearch(''); setStatusFilter(''); setTypeFilter(''); setPage(1) }}
                  className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 px-2 h-9 md:h-8 rounded-lg hover:bg-red-50 transition-colors">
                  <X size={12} />
                </button>
              )}

              <Button icon={<Plus size={14} />} onClick={() => setCreateOpen(true)} className="shrink-0 h-10 md:h-9 text-[11px] px-4 md:px-5 rounded-xl font-black uppercase tracking-widest bg-primary-olive shadow-lg shadow-primary-olive/10">
                New Project
              </Button>
            </div>
          </div>
        </div>

        {/* ── Table & Pagination Wrapper ────────────────────────────────────────── */}
        <div className="rounded-b-2xl overflow-hidden relative z-10 bg-white">
          <DataTable columns={columns} data={projects} loading={loading} rowKey={r => r.id}
            onRowClick={row => setDetailId(row.id)}
            emptyMessage="No projects found" emptyIcon={<Building2 size={40} />} />
          <div className="px-5 py-3.5 border-t border-surface-border bg-white">
            <Pagination page={page} total={totalElements} pageSize={pageSize} onPageChange={p => setPage(p)} onPageSizeChange={s => { setPageSize(s); setPage(1) }} pageSizeOptions={[10, 20, 50]} />
          </div>
        </div>
      </Card>
      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => fetchProjects(1, pageSize)} />
      <ProjectDetailModal id={detailId} open={!!detailId} onClose={() => setDetailId(null)} onDeleted={() => fetchProjects()} />
    </div>
  )
}