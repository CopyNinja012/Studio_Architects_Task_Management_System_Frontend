import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ListTree, ChevronLeft } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/Button'
import { Dropdown } from '@/shared/components/ui/Dropdown'
import { Combobox } from '@/shared/components/ui/Combobox'
import { Input } from '@/shared/components/ui/Input'
import { DatePicker } from '@/shared/components/ui/DatePicker'
import { PageContainer } from '@/layout/app-layout/PageContainer'
import { PATHS } from '@/router/path'

import { taskApi } from '../api/taskApi'
import { projectApi } from '../api/projectApi'
import { userApi } from '../api/userApi'

import type { TaskCategory, TaskPriorityApi } from '../model/types'

// Keep literals in ONE place (matches TaskCategory union)
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
  referenceType: z.enum(['VERBAL', 'ON_CALL', 'VISIT', 'EMAIL']).optional(),
  referredBy: z.string().optional(),
  plannedStartDate: z.date({ message: 'Start date required' }),
  plannedEndDate: z.date({ message: 'End date required' }),
  plannedEffortsHours: z.number().min(0.1, 'Hours must be > 0'),
})

type TaskFormValues = z.infer<typeof taskSchema>

export default function TaskFormPage() {
  const navigate = useNavigate()

  const [projects, setProjects] = useState<{ value: string; label: string }[]>([])
  const [employees, setEmployees] = useState<{ value: string; label: string }[]>([])
  const [suggestions, setSuggestions] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      projectApi.getAllProjects({}, 0, 200),
      userApi.getUsers(0, 200),
      taskApi.getTaskSuggestions(),
    ])
      .then(([pRes, uRes, sRes]) => {
        setProjects(pRes.content.map((p: any) => ({ value: p.id, label: p.projectName ?? p.name })))
        setEmployees(uRes.content.map((u: any) => ({ value: u.id, label: u.name })))
        setSuggestions(sRes.map(s => ({ value: s.id, label: s.name })))
      })
      .finally(() => setLoading(false))
  }, [])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'MEDIUM',
      plannedEffortsHours: 1,
      description: '',
      // category must be set by user; you can set a default if you want:
      // category: 'TWO_D_DESIGN',
    },
  })

  const onSubmit = async (values: TaskFormValues) => {
    try {
      // Only send templateId if it's a valid UUID to avoid backend 500 error
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(values.templateId || '')

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
        referenceType: values.referenceType as any,
        referredBy: values.referredBy,
        plannedStartDate: values.plannedStartDate.toISOString().slice(0, 10),
        plannedEndDate: values.plannedEndDate.toISOString().slice(0, 10),
        plannedEffortsHours: values.plannedEffortsHours,
      })

      toast.success('Task created and assigned')
      navigate(PATHS.ADMIN_TASKS)
    } catch {
      toast.error('Failed to create task')
    }
  }

  return (
    <PageContainer>
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-text-light hover:text-primary-olive font-bold text-xs transition-colors"
        >
          <ChevronLeft size={14} /> Back
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-surface-border overflow-hidden">
          <div className="p-6 md:p-8 border-b border-surface-border bg-surface-hover/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-olive flex items-center justify-center text-white shadow-lg">
                <ListTree size={24} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-text-dark tracking-tight">Create New Task</h1>
                <p className="text-xs md:text-sm font-medium text-text-light mt-1">
                  Define task parameters and assign to team members
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  error={errors.referredBy?.message}
                  {...register('referredBy')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <label className="text-sm font-black text-text-dark uppercase tracking-widest text-[11px]">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Enter task details, instructions or scope…"
                  className="w-full rounded-xl border border-surface-border bg-white px-4 py-3 text-sm text-text-dark
                             placeholder:text-text-light resize-none font-medium transition-all
                             focus:outline-none focus:ring-2 focus:ring-primary-olive/15 focus:border-primary-olive"
                />
              </div>

              <div className="pt-6 border-t border-surface-border flex items-center justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => navigate(-1)} className="h-12 px-8">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  icon={<Plus size={18} />}
                  className="h-12 px-10 rounded-xl shadow-lg shadow-primary-olive/20"
                >
                  Assign Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
