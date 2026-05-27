import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, X, FolderKanban, ChevronLeft } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import { Dropdown } from '@/shared/components/ui/Dropdown'
import { Input } from '@/shared/components/ui/Input'
import { DatePicker } from '@/shared/components/ui/DatePicker'
import { projectApi } from '../api/projectApi'
import { PROJECT_TYPES } from '../model/constant'
import { PageContainer } from '@/layout/app-layout/PageContainer'
import { PATHS } from '@/router/path'

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

export default function ProjectFormPage() {
  const navigate = useNavigate()
  const [managers,   setManagers]   = useState<{ value: string; label: string }[]>([])
  const [employees,  setEmployees]  = useState<{ value: string; label: string }[]>([])
  const [loadingPeople, setLoadingPeople] = useState(true)

  useEffect(() => {
    Promise.all([projectApi.getProjectManagers(), projectApi.getAssignableEmployees()])
      .then(([mgrs, emps]) => {
        setManagers(mgrs.map(u => ({ value: u.id, label: u.name + (u.designation ? ` — ${u.designation}` : '') })))
        setEmployees(emps.map(u => ({ value: u.id, label: u.name + (u.designation ? ` — ${u.designation}` : '') })))
      })
      .catch(() => {})
      .finally(() => setLoadingPeople(false))
  }, [])

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<ProjectFormValues>({
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
      navigate(PATHS.ADMIN_PROJECTS)
    } catch (err: any) {
      toast.error('Failed to create project', {
        description: err?.message || 'Please check your inputs and try again.',
      })
    }
  }

  return (
    <PageContainer>
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-text-light hover:text-primary-olive font-bold text-xs transition-colors">
          <ChevronLeft size={14} /> Back
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-surface-border overflow-hidden">
          <div className="p-6 md:p-8 border-b border-surface-border bg-surface-hover/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-olive flex items-center justify-center text-white shadow-lg">
                <FolderKanban size={24} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-text-dark tracking-tight">Create New Project</h1>
                <p className="text-xs md:text-sm font-medium text-text-light mt-1">Initialize a new project and assign leads</p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Project Name" required placeholder="e.g. Sahyadri Heights"
                  error={errors.projectName?.message} {...register('projectName')} />
                <Input label="Job Number" required placeholder="e.g. JOB-2025-001"
                  error={errors.jobNumber?.message} {...register('jobNumber')} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Client / Owner Name" required placeholder="e.g. Mr. Rajesh Patil"
                  error={errors.clientOwnerName?.message} {...register('clientOwnerName')} />
                <Controller name="projectType" control={control} render={({ field }) => (
                  <Dropdown label="Project Type" required
                    options={PROJECT_TYPES} value={field.value} onChange={field.onChange}
                    placeholder="Select project type" error={errors.projectType?.message} />
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller name="projectLeadId" control={control} render={({ field }) => (
                  <Dropdown label="Project Lead / Manager" searchable
                    options={managers} value={field.value ?? ''} onChange={field.onChange}
                    placeholder={loadingPeople ? 'Loading managers…' : 'Select project manager'}
                    error={errors.projectLeadId?.message} />
                )} />
                <Controller name="assignedEmployeeId" control={control} render={({ field }) => (
                  <Dropdown label="Assigned Employee" searchable
                    options={employees} value={field.value ?? ''} onChange={field.onChange}
                    placeholder={loadingPeople ? 'Loading employees…' : 'Select employee'}
                    error={errors.assignedEmployeeId?.message} />
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller name="startDate" control={control} render={({ field }) => (
                  <DatePicker label="Start Date" required placeholder="Select start date"
                    value={field.value} onChange={field.onChange} error={errors.startDate?.message} />
                )} />
                <Controller name="expectedCompletionDate" control={control} render={({ field }) => (
                  <DatePicker label="Expected Completion Date" required placeholder="Select deadline"
                    value={field.value} onChange={field.onChange} error={errors.expectedCompletionDate?.message} />
                )} />
              </div>

              <Input label="Site Location" required placeholder="e.g. Baner, Pune"
                error={errors.siteLocation?.message} {...register('siteLocation')} />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-black text-text-dark uppercase tracking-widest text-[11px]">Description</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Enter project description (optional)"
                  className="w-full rounded-xl border border-surface-border bg-white px-4 py-3 text-sm text-text-dark
                             placeholder:text-text-light resize-none font-medium transition-all
                             focus:outline-none focus:ring-2 focus:ring-primary-olive/15 focus:border-primary-olive"
                />
              </div>

              <div className="pt-6 border-t border-surface-border flex items-center justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => navigate(-1)} className="h-12 px-8">Cancel</Button>
                <Button type="submit" loading={isSubmitting} icon={<Plus size={18} />} className="h-12 px-10 rounded-xl shadow-lg shadow-primary-olive/20">
                  Create Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

