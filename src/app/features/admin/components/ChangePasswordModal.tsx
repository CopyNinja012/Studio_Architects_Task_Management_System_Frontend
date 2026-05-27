import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Check, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '@/shared/components/ui/Modal'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { authApi } from '@/features/auth/api/authApi'
import { toast } from '@/shared/components/feedback/Toast'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
})

type PasswordFormData = z.infer<typeof passwordSchema>

interface ChangePasswordModalProps {
  open: boolean
  onClose: () => void
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = async (data: PasswordFormData) => {
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success('Password updated successfully')
      reset()
      onClose()
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update password'
      toast.error(message)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Change Password"
      subtitle="Update your security credentials"
      icon={<Lock size={22} className="text-primary-olive" />}
      footer={
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-none px-6 rounded-xl font-bold text-[#6B7280]">Cancel</Button>
          <Button 
            type="submit" 
            form="change-password-form" 
            loading={isSubmitting} 
            className="flex-1 sm:flex-none px-8 rounded-xl bg-primary-olive hover:bg-primary-700 text-white font-black shadow-lg shadow-primary-olive/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
            icon={<Check size={16} strokeWidth={3} />}
          >
            Update Password
          </Button>
        </div>
      }
    >
      <form id="change-password-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4 p-6 bg-[#F8FAF5] rounded-3xl border border-[#40521B]/5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] px-1">Current Password</label>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                placeholder="Verification required"
                error={errors.currentPassword?.message}
                {...register('currentPassword')}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#40521B] transition-colors"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] px-1">New Password</label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                error={errors.newPassword?.message}
                {...register('newPassword')}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#40521B] transition-colors"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  )
}
