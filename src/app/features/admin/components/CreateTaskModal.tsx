import { useEffect, useState } from 'react'
import { Plus, ListTree } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/Button'
import { Dropdown } from '@/shared/components/ui/Dropdown'
import { Input } from '@/shared/components/ui/Input'
import { DatePicker } from '@/shared/components/ui/DatePicker'
import { Modal } from '@/shared/components/ui/Modal'
import { Combobox } from '@/shared/components/ui/Combobox'

import { taskApi } from '../api/taskApi'
import { projectApi } from '../api/projectApi'
import { userApi } from '../api/userApi'

import type { TaskCategory, TaskPriorityApi } from '../model/types'

const CATEGORY_VALUES = [
  'TWO_D_DESIGN',
  'THREE_D_DESIGN',
  'PLANNING',
  'ESTIMATION',
  'INTERIOR_DESIGN',
  'EXTERIOR_DESIGN',
  'STRUCTURAL_DRAWING',
  'AUTOCAD',
  'REVIT',
  'SKETCHUP',
  'SITE_SUPERVISION',
  'CLIENT_HANDLING',
  'SITE_VISIT',
] as const satisfies readonly TaskCategory[]

const PRIORITY_VALUES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const satisfies readonly TaskPriorityApi[]

const taskSchema = z.object({
  projectId: z.string().min(1, 'Project selection required'),
  taskName: z.string().min(3, 'Task name required'),
  templateId: z.string().optional(),
  category: z.enum(CATEGORY_VALUES, { message: 'Category required' }),
  description: z.string().optional(),
  assignedToUserId: z.string().min(1, 'Assignee required'),
  priority: z.enum(PRIORITY_VALUES),
  referenceType: z.enum(['VERBAL', 'ON_CALL', 'VISIT', 'EMAIL', 'OTHER']).optional(),
  referredBy: z.string().optional(),
  plannedStartDate: z.date({ message: 'Start date required' }),
  plannedEndDate: z.date({ message: 'End date required' }),
  plannedEffortsHours: z.number().min(0.1, 'Hours must be > 0'),
})

type TaskFormValues = z.infer<typeof taskSchema>

interface Props {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}

export function CreateTaskModal({ open, onClose, onCreated }: Props) {
  const [projects, setProjects] = useState<{ value: string; label: string }[]>([])
  const [employees, setEmployees] = useState<{ value: string; label: string }[]>([])
  const [suggestions, setSuggestions] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    Promise.all([
      projectApi.getAllProjects({}, 0, 200),
      userApi.getUsers(0, 500),
      taskApi.getTaskSuggestions(),
    ])
      .then(([pRes, uRes, sRes]) => {
        setProjects(pRes.content.map((p: any) => ({ value: p.id, label: p.projectName ?? p.name })))
        setEmployees(uRes.content.map((u: any) => ({ value: u.id, label: u.name })))
        setSuggestions(sRes.map(s => ({ value: s.id, label: s.name })))
      })
      .finally(() => setLoading(false))
  }, [open])

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'MEDIUM',
      plannedEffortsHours: 1,
      description: '',
    },
  })

  const onSubmit = async (values: TaskFormValues) => {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(values.templateId || '')
      
      await taskApi.createTask({
        jobNumber: `JOB-${Date.now().toString().slice(-6)}`,
        projectId: values.projectId,
        taskName: values.taskName,
        templateId: isUuid ? values.templateId : undefined,
        category: values.category,
        description: values.description ?? '',
        assignedToUserId: values.assignedToUserId,
        priority: values.priority,
        source: 'PROJECT_DRIVEN',
        referenceType: values.referenceType || undefined,
        referredBy: values.referredBy || undefined,
        plannedStartDate: values.plannedStartDate.toISOString().slice(0, 10),
        plannedEndDate: values.plannedEndDate.toISOString().slice(0, 10),
        plannedEffortsHours: values.plannedEffortsHours,
      })

      toast.success('Task created and assigned')
      reset()
      onCreated?.()
      onClose()
    } catch {
      toast.error('Failed to create task')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Create New Task"
      subtitle="Operational Execution"
      icon={<ListTree size={22} className="text-primary-olive" />}
      footer={
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">Cancel</Button>
          <Button 
            type="submit" 
            form="create-task-form" 
            loading={isSubmitting} 
            className="bg-primary-olive hover:bg-primary-700 text-white rounded-xl px-8 font-black shadow-lg shadow-primary-olive/20"
            icon={<Plus size={16} />}
          >
            Assign Task
          </Button>
        </div>
      }
    >
      <form id="create-task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
             <Controller
               name="projectId"
               control={control}
               render={({ field }) => (
                 <Dropdown
                   label="Project"
                   required
                   options={projects}
                   value={field.value}
                   onChange={field.onChange}
                   placeholder={loading ? 'Loading…' : 'Select project'}
                   error={errors.projectId?.message}
                 />
               )}
             />
          </div>
          <div className="space-y-1.5">
             <Controller
               name="templateId"
               control={control}
               render={({ field }) => (
                 <Combobox
                   label="Task Template (Optional)"
                   options={suggestions}
                   value={field.value ?? ''}
                   onChange={field.onChange}
                   onCustomValue={(val) => field.onChange(val)}
                   placeholder={loading ? 'Loading…' : 'Select or type template'}
                   error={errors.templateId?.message}
                 />
               )}
             />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Task Name"
            required
            placeholder="e.g. 2D Floor Plan Design"
            error={errors.taskName?.message}
            {...register('taskName')}
          />
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Dropdown
                label="Category"
                required
                options={[
                  { value: 'TWO_D_DESIGN', label: '2D Design' },
                  { value: 'THREE_D_DESIGN', label: '3D Design' },
                  { value: 'PLANNING', label: 'Planning' },
                  { value: 'ESTIMATION', label: 'Estimation' },
                  { value: 'SITE_VISIT', label: 'Site Visit' },
                  { value: 'INTERIOR_DESIGN', label: 'Interior Design' },
                  { value: 'EXTERIOR_DESIGN', label: 'Exterior Design' },
                  { value: 'STRUCTURAL_DRAWING', label: 'Structural Drawing' },
                  { value: 'AUTOCAD', label: 'AutoCAD' },
                  { value: 'REVIT', label: 'Revit' },
                  { value: 'SKETCHUP', label: 'Sketchup' },
                  { value: 'SITE_SUPERVISION', label: 'Site Supervision' },
                  { value: 'CLIENT_HANDLING', label: 'Client Handling' },
                ]}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select category"
                error={errors.category?.message}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Controller
            name="assignedToUserId"
            control={control}
            render={({ field }) => (
              <Dropdown
                label="Assign To"
                required
                options={employees}
                value={field.value}
                onChange={field.onChange}
                placeholder={loading ? 'Loading…' : 'Select team member'}
                error={errors.assignedToUserId?.message}
              />
            )}
          />
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Dropdown
                label="Priority"
                required
                options={[
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'URGENT', label: 'Urgent' },
                ]}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select priority"
                error={errors.priority?.message}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Controller
            name="referenceType"
            control={control}
            render={({ field }) => (
              <Dropdown
                label="Reference Type (Optional)"
                options={[
                  { value: 'VERBAL',  label: 'Verbal'  },
                  { value: 'ON_CALL', label: 'On Call' },
                  { value: 'VISIT',   label: 'Visit'   },
                  { value: 'EMAIL',   label: 'Email'   },
                  { value: 'OTHER',   label: 'Other'   },
                ]}
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder="Select reference type"
              />
            )}
          />
          <Input
            label="Referred By (Optional)"
            placeholder="e.g. Mr. Sharma"
            {...register('referredBy')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Controller
            name="plannedStartDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Start Date"
                required
                placeholder="Select start date"
                value={field.value}
                onChange={field.onChange}
                error={errors.plannedStartDate?.message}
              />
            )}
          />
          <Controller
            name="plannedEndDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="End Date"
                required
                placeholder="Select deadline"
                value={field.value}
                onChange={field.onChange}
                error={errors.plannedEndDate?.message}
              />
            )}
          />
        </div>

        <Input
          label="Planned Efforts (Hours)"
          type="number"
          step="0.5"
          required
          error={errors.plannedEffortsHours?.message}
          {...register('plannedEffortsHours', { valueAsNumber: true })}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-black text-[#111827] uppercase tracking-widest px-1">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Enter task instructions or scope…"
            className="w-full rounded-3xl border border-[#E5E7EB] bg-white px-4 py-3.5 text-[14px] text-[#111827]
                       placeholder:text-text-light resize-none font-medium transition-all
                       focus:outline-none focus:ring-4 focus:ring-primary-olive/5 focus:border-primary-olive shadow-sm"
          />
        </div>
      </form>
    </Modal>
  )
}
