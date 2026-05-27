import { useState, useMemo, useEffect } from 'react'
import { Plus, X, ClipboardList, Search, Trash2, Building2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Dropdown } from '@/shared/components/ui/Dropdown'
import { DatePicker } from '@/shared/components/ui/DatePicker'
import { DataTable, type Column } from '@/shared/components/table/DataTable'
import { Pagination } from '@/shared/components/ui/Pagination'
import { cn } from '@/shared/lib/cn'
import { format, parseISO } from 'date-fns'
import type { ManualTaskEntry, ReferenceType } from '../model/types'
import { taskApi } from '@/features/admin/api/taskApi'
import type { TaskApi, TaskReferenceType, TaskSource } from '@/features/admin/model/types'
import { TASK_STATUSES, PRIORITIES } from '@/features/admin/model/constant'
import { useAuthStore } from '@/store'
import { Modal } from '@/shared/components/ui/Modal'
import { StatusPill } from '@/shared/components/status/StatusPill'
import { EmployeeTaskDetailModal } from '../components/EmployeeTaskDetailModal'
import { RowTimerCell } from '../components/RowTimerCell'
import { QuickSubmitModal } from './EmployeeTasks'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'drawing',       label: 'Drawing'       },
  { value: 'design',        label: 'Design'        },
  { value: 'coordination',  label: 'Coordination'  },
  { value: 'site',          label: 'Site Visit'    },
  { value: 'estimation',    label: 'Estimation'    },
  { value: 'documentation', label: 'Documentation' },
  { value: 'meeting',       label: 'Meeting'       },
  { value: 'other',         label: 'Other'         },
]

const REFERENCE_TYPES = [
  { value: 'VERBAL',  label: 'Verbal'  },
  { value: 'ON_CALL', label: 'On Call' },
  { value: 'VISIT',   label: 'Visit'   },
  { value: 'EMAIL',   label: 'Email'   },
  { value: 'OTHER',   label: 'Other'   },
]

const SOURCE_OPTIONS = [
  { value: 'PROJECT_DRIVEN',   label: 'Project Driven'   },
  { value: 'GENERAL_INTERNAL', label: 'General Internal' },
  { value: 'FIELD_DIRECT',     label: 'Field Direct'     },
]

// ─── Form helpers ─────────────────────────────────────────────────────────────

function toDate(iso?: string): Date | null {
  if (!iso) return null
  try { return parseISO(iso) } catch { return null }
}

function fromDate(d: Date | null): string {
  if (!d) return ''
  return format(d!, 'yyyy-MM-dd')
}

function safeFmt(iso?: string, fmt = 'dd MMM yyyy') {
  if (!iso) return '—'
  try { return format(parseISO(iso), fmt) } catch { return '—' }
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

function ManualTaskFormModal({ initial, projects = [], onClose, onSave }: {
  initial?: ManualTaskEntry
  projects?: { value: string; label: string }[]
  onClose: () => void
  onSave: (e: ManualTaskEntry) => void
}) {
  const [title,       setTitle]       = useState(initial?.title              ?? '')
  const [projectId,   setProjectId]   = useState(initial?.projectName        ?? '')
  const [category,    setCategory]    = useState(initial?.category           ?? '')
  const [source,      setSource]      = useState<TaskSource>(initial?.source ?? 'GENERAL_INTERNAL')
  const [refType,     setRefType]     = useState<string>(initial?.referenceType ?? '')
  const [refPerson,   setRefPerson]   = useState(initial?.referredBy         ?? '')
  const [startDate,   setStartDate]   = useState<Date | null>(toDate(initial?.startDate))
  const [dueDate,     setDueDate]     = useState<Date | null>(toDate(initial?.dueDate))
  const [description, setDescription] = useState(initial?.description        ?? '')
  const [status,      setStatus]      = useState<string>(initial?.status     ?? 'ASSIGNED')
  const [loading,     setLoading]     = useState(false)
  const [errors,      setErrors]      = useState<Record<string, string>>({})

  // Logic: if project is selected, force source to PROJECT_DRIVEN
  useEffect(() => {
    if (projectId) {
      setSource('PROJECT_DRIVEN')
    }
  }, [projectId])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!title.trim())       e.title       = 'Task name is required'
    if (!category)           e.category    = 'Category is required'
    if (!source)             e.source      = 'Source is required'
    if (!refType)            e.refType     = 'Reference type is required'
    if (!refPerson.trim())   e.refPerson   = 'Referred By is required'
    if (!startDate)          e.startDate   = 'Start date is required'
    if (!dueDate)            e.dueDate     = 'Deadline is required'
    if (!description.trim()) e.description = 'Description is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setLoading(true)
    onSave({
      id:                  initial?.id ?? `m${Date.now()}`,
      title:               title.trim(),
      projectName:         projectId.trim() || undefined,
      category,
      source,
      referenceType:       refType as ReferenceType,
      referredBy:          refPerson.trim(),
      startDate:           fromDate(startDate),
      dueDate:             fromDate(dueDate),
      description:         description.trim(),
      status:              status as ManualTaskEntry['status'],
      createdAt:           initial?.createdAt ?? new Date().toISOString(),
    })
    toast.success(initial ? 'Task updated' : 'Manual task added')
    onClose()
    setLoading(false)
  }

  const currentSourceOptions = projectId 
    ? SOURCE_OPTIONS.filter(o => o.value === 'PROJECT_DRIVEN')
    : SOURCE_OPTIONS

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={initial ? 'Edit Manual Task' : 'Add Manual Task'}
      subtitle="Log work that wasn't assigned by admin or PM"
      icon={<ClipboardList size={22} className="text-primary-olive" />}
      footer={
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">Cancel</Button>
          <Button 
            loading={loading} 
            icon={<Plus size={14} />} 
            onClick={handleSave}
            className="bg-primary-olive hover:bg-primary-700 text-white rounded-xl px-8 font-black shadow-lg shadow-primary-olive/20"
          >
            {initial ? 'Update Record' : 'Save Task'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Task Name" required
            placeholder="e.g. Site coordination call"
            value={title} onChange={e => setTitle(e.target.value)}
            error={errors.title}
          />
          <Dropdown
            label="Project (Optional)"
            options={projects}
            value={projectId}
            onChange={setProjectId}
            placeholder="Select project"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Dropdown
            label="Category" required
            options={CATEGORIES}
            value={category}
            onChange={setCategory}
            placeholder="Select category"
            error={errors.category}
          />
          <Dropdown
            label="Source" required
            options={currentSourceOptions}
            value={source}
            onChange={(v) => setSource(v as TaskSource)}
            placeholder="Select source"
            error={errors.source}
            disabled={!!projectId}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Dropdown
            label="Reference Type" required
            options={REFERENCE_TYPES}
            value={refType}
            onChange={setRefType}
            placeholder="Select reference type"
            error={errors.refType}
          />
          <Input
            label="Referred By" required
            placeholder="e.g. Rajesh Patil"
            value={refPerson} onChange={e => setRefPerson(e.target.value)}
            error={errors.refPerson}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <DatePicker
            label="Start Date" required
            placeholder="Select start date"
            value={startDate}
            onChange={setStartDate}
            error={errors.startDate}
          />
          <DatePicker
            label="Deadline" required
            placeholder="Select deadline"
            value={dueDate}
            onChange={setDueDate}
            minDate={startDate ?? undefined}
            error={errors.dueDate}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-black text-[#111827] uppercase tracking-widest px-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe the work done, context, and any relevant details…"
            className={cn(
              'w-full rounded-3xl border bg-white px-4 py-3.5 text-sm text-text-dark',
              'placeholder:text-text-light resize-none transition-all',
              'focus:outline-none focus:ring-4 focus:ring-primary-olive/5',
              errors.description
                ? 'border-red-400'
                : 'border-surface-border focus:border-primary-olive'
            )}
          />
          {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
        </div>

        <Dropdown
          label="Status" required
          options={[
            { value: 'ASSIGNED',         label: 'Pending'     },
            { value: 'IN_PROGRESS',      label: 'In Progress' },
            { value: 'COMPLETED',        label: 'Completed'   },
          ]}
          value={status}
          onChange={setStatus}
          placeholder="Select status"
        />
      </div>
    </Modal>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const FILTER_STATUSES = [
  { value: '', label: 'All Tasks' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'REWORK_REQUESTED', label: 'Rework' },
  { value: 'UNDER_REVIEW', label: 'Review' },
  { value: 'COMPLETED', label: 'Completed' },
]

export default function ManualTask() {
  const [entries,   setEntries]   = useState<TaskApi[]>([])
  const [projects,  setProjects]  = useState<Record<string, string>>({})
  const [search,    setSearch]    = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page,      setPage]      = useState(1)
  const [pageSize,  setPageSize]  = useState(10)
  const [showForm,  setShowForm]  = useState(false)
  
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [submitTask,   setSubmitTask]   = useState<TaskApi | null>(null)

  const fetchTasks = async () => {
    try {
      const res = await taskApi.getMyTasks({ size: 500 })
      const manualEntries = res.content.filter(t => t.source !== 'PROJECT_DRIVEN')
      setEntries(manualEntries)
      
      const pMap: Record<string, string> = {}
      manualEntries.forEach(t => { 
        if (t.projectId) pMap[t.projectId] = t.projectName || 'Manual Project' 
      })
      setProjects(pMap)
    } catch {
      setEntries([])
    }
  }

  useEffect(() => { fetchTasks() }, [])

  const filtered = useMemo(() => entries.filter(e => {
    const q = search.toLowerCase()
    const pName = projects[e.projectId]?.toLowerCase() || e.projectName?.toLowerCase() || ''
    return (!search || e.taskName.toLowerCase().includes(q) || pName.includes(q) || e.category.toLowerCase().includes(q) || (e.referredBy || '').toLowerCase().includes(q))
      && (!statusFilter || e.status === statusFilter)
  }), [entries, search, projects, statusFilter])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSave = async (entry: ManualTaskEntry) => {
    try {
      const categoryMap: Record<string, any> = {
        drawing: 'TWO_D_DESIGN', design: 'THREE_D_DESIGN',
        coordination: 'PLANNING', site: 'SITE_SUPERVISION',
        estimation: 'ESTIMATION', documentation: 'PLANNING',
        meeting: 'CLIENT_HANDLING', other: 'PLANNING',
      }
      
      const currentUserId = useAuthStore.getState().user?.id || ''
      
      await taskApi.createTask({
        jobNumber:           `MAN-${Date.now().toString().slice(-6)}`,
        projectId:           entry.projectName || undefined, 
        taskName:            entry.title,
        category:            categoryMap[entry.category] ?? 'PLANNING',
        description:         entry.description,
        assignedToUserId:    currentUserId,
        priority:            'MEDIUM',
        source:              entry.source,
        referenceType:       entry.referenceType as TaskReferenceType,
        referredBy:          entry.referredBy,
        plannedStartDate:    entry.startDate,
        plannedEndDate:      entry.dueDate,
        plannedEffortsHours: 1,
      })
      
      fetchTasks()
    } catch (err: any) {
      toast.error('Failed to save task')
    }
  }

  const handleTaskUpdated = (updated: TaskApi) => {
    setEntries(prev => prev.map(t => t.id === updated.id ? updated : t))
    setDetailTaskId(null)
    setSubmitTask(null)
  }

  const projectOptions = Object.entries(projects).map(([id, name]) => ({ value: id, label: name }))

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
        <div className="flex items-center gap-2 max-w-45">
          <div className="w-5 h-5 rounded bg-primary-50 flex items-center justify-center shrink-0">
            <Building2 size={12} className="text-primary-olive" />
          </div>
          <span className="text-[12px] font-bold text-text-dark truncate">
             {row.projectName || projects[row.projectId] || 'Manual Project'}
          </span>
        </div>
      ),
    },
    {
      key: 'taskName', header: 'Task Name', sortable: true,
      render: row => (
        <div>
          <p className="text-[13px] font-semibold text-text-dark max-w-45 truncate" title={row.taskName}>
            {row.taskName}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
             <span className="text-[10px] text-text-light font-medium uppercase tracking-tight">{row.category.toLowerCase().replace('_', ' ')}</span>
             <span className="text-[10px] font-black text-primary-olive uppercase tracking-tight bg-primary-50 px-1.5 rounded">
               {row.source.replace('_', ' ')}
             </span>
          </div>
        </div>
      ),
    },
    {
      key: 'startDate', header: 'Start Date', sortable: true,
      render: row => <span className="text-[12px] font-medium text-text-medium">{safeFmt(row.plannedStartDate)}</span>,
    },
    {
      key: 'plannedEndDate', header: 'Deadline', sortable: true,
      render: row => {
        const late = row.plannedEndDate && parseISO(row.plannedEndDate) < new Date() && row.status !== 'COMPLETED'
        return (
          <span className={cn('text-[12px] font-bold', late ? 'text-red-500' : 'text-text-medium')}>
            {safeFmt(row.plannedEndDate)}
          </span>
        )
      },
    },
    {
      key: 'status', header: 'Status', align: 'center', width: '100px',
      render: row => <StatusPill status={row.status} />
    },
    {
      key: '_timer', header: 'WIP', width: '140px',
      render: row => <RowTimerCell task={row} onSubmit={t => setSubmitTask(t)} />
    },
  ]

  return (
    <>
      <div className="space-y-4 animate-fade-in">
        <div className="bg-white rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col border-b border-surface-border bg-white">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="relative shrink-0 w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                  <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                    placeholder="Search manual tasks…"
                    className="w-full pl-9 pr-3 h-9 text-[12px] border border-surface-border rounded-xl bg-[#F9FAFB] focus:outline-none focus:border-primary-olive focus:ring-4 focus:ring-primary-olive/5 transition-all font-medium placeholder:text-text-light"
                  />
                </div>

                <div className="h-6 w-px bg-surface-border hidden md:block" />

                {/* Status Pills Selection */}
                <div className="flex items-center gap-1.5 p-1 bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] overflow-x-auto no-scrollbar max-w-full">
                  {[{ value: '', label: 'All Tasks' }, ...TASK_STATUSES].map((s) => (
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
                <Button icon={<Plus size={14} />} onClick={() => setShowForm(true)} className="h-9 text-[11px] px-4 rounded-xl font-black uppercase tracking-widest bg-primary-olive shadow-lg shadow-primary-olive/10 transition-all active:scale-95">
                  Add Record
                </Button>
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={paginated}
            loading={false}
            rowKey={r => r.id}
            onRowClick={row => setDetailTaskId(row.id)}
            emptyMessage="No manual tasks yet — log work that wasn't assigned to you."
            emptyIcon={<ClipboardList size={36} />}
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
      </div>

      <EmployeeTaskDetailModal 
        id={detailTaskId} 
        open={!!detailTaskId} 
        onClose={() => setDetailTaskId(null)} 
        onTaskUpdated={handleTaskUpdated}
        projects={projects}
      />

      {showForm && (
        <ManualTaskFormModal projects={projectOptions} onClose={() => setShowForm(false)} onSave={handleSave} />
      )}
      
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
