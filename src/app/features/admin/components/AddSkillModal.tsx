import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Sparkles, Check, X } from 'lucide-react'
import { Modal } from '@/shared/components/ui/Modal'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { skillsApi } from '../api/skillsApi'
import { toast } from '@/shared/components/feedback/Toast'

const skillSchema = z.object({
  name: z.string().min(2, 'Skill name must be at least 2 characters').max(50, 'Skill name is too long'),
})

type SkillFormData = z.infer<typeof skillSchema>

interface AddSkillModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddSkillModal({ open, onClose, onSuccess }: AddSkillModalProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: '',
    }
  })

  const onSubmit = async (data: SkillFormData) => {
    try {
      await skillsApi.create(data.name.trim())
      toast.success('Skill added to catalog')
      reset()
      onSuccess()
      onClose()
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to add skill'
      toast.error(message)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Register New Expertise"
      subtitle="Expand the global talent inventory"
      icon={<Sparkles size={22} className="text-primary-olive" />}
      footer={
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-none px-6 rounded-xl font-bold text-[#6B7280]">Cancel</Button>
          <Button 
            type="submit" 
            form="add-skill-form" 
            loading={isSubmitting} 
            className="flex-1 sm:flex-none px-8 rounded-xl bg-primary-olive hover:bg-primary-700 text-white font-black shadow-lg shadow-primary-olive/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
            icon={<Check size={16} strokeWidth={3} />}
          >
            Add to Catalog
          </Button>
        </div>
      }
    >
      <form id="add-skill-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="p-6 bg-primary-50 rounded-3xl border border-primary-olive/10 space-y-4">
          <div className="flex items-center gap-2 text-primary-olive">
            <Sparkles size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest px-1">Expertise Details</span>
          </div>
          
          <div className="space-y-2">
            <Input 
              label="Skill Name" 
              placeholder="e.g. Architectural Visualization, Structural Analysis..." 
              error={errors.name?.message} 
              {...register('name')} 
              autoFocus
            />
            <p className="text-[10px] font-medium text-[#6B7280] px-1 italic">
              This skill will become available for assignment across all projects and staff profiles.
            </p>
          </div>
        </div>
      </form>
    </Modal>
  )
}
