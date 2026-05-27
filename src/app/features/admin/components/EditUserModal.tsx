import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserPlus, Landmark, X, Check, Phone, User, MapPin, Sparkles, Loader2, Edit3 } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { Modal } from '@/shared/components/ui/Modal'
import { Input } from '@/shared/components/ui/Input'
import { Dropdown } from '@/shared/components/ui/Dropdown'
import { Button } from '@/shared/components/ui/Button'
import { DatePicker } from '@/shared/components/ui/DatePicker'
import { userApi } from '../api/userApi'
import { toast } from '@/shared/components/feedback/Toast'
import { cn } from '@/shared/lib/cn'
import { mobileValidator, ifscValidator, bankAccountNumberValidator } from '@/shared/lib/validators'
import { ALL_ROLES, AVAILABLE_SKILLS, GENDER_OPTIONS } from '../model/constant'
import type { AdminUser, UserSkill } from '../model/types'
import { skillsApi, type Skill } from '../api/skillsApi'

const userSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: mobileValidator,
  alternativePhone: mobileValidator.optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'] as const, { message: 'Gender is required' }),
  address: z.string().min(5, 'Address is required'),
  bankAccountNumber: bankAccountNumberValidator,
  bankIfsc: ifscValidator,
  bankName: z.string().min(2, 'Bank name is required'),
  branchLocation: z.string().min(2, 'Branch name is required'),
  dateOfJoining: z.date({ message: 'Joining date is required' }),
  role: z.string().min(1, 'Role is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  customSkills: z.string().optional(),
})

type UserFormData = z.infer<typeof userSchema>

interface EditUserModalProps {
  user: AdminUser
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditUserModal({ user, open, onClose, onSuccess }: EditUserModalProps) {
  const [allSkills, setAllSkills] = useState<Skill[]>([])
  const [loadingSkills, setLoadingSkills] = useState(false)

  const { register, handleSubmit, setValue, watch, control, reset, formState: { errors, isSubmitting } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  })

  useEffect(() => {
    if (open && user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
        alternativePhone: user.alternativePhone || '',
        gender: user.gender as any,
        address: user.address,
        bankAccountNumber: user.bankAccountNumber,
        bankIfsc: user.bankIfsc,
        bankName: user.bankName || '',
        branchLocation: user.bankBranch || '',
        dateOfJoining: user.dateOfJoining ? new Date(user.dateOfJoining) : new Date(),
        role: user.roles?.[0] || '',
        skills: user.skills || [],
        customSkills: user.customSkills || '',
      })
    }
  }, [open, user, reset])

  // ─── Fetch Dynamic Skills ───────────────────────────────────────────────────
  
  const fetchSkills = async () => {
    setLoadingSkills(true)
    try {
      const data = await skillsApi.getAll()
      setAllSkills(data)
    } catch (err) {
      console.error('Failed to fetch skills', err)
    } finally {
      setLoadingSkills(false)
    }
  }

  useEffect(() => {
    if (open) fetchSkills()
  }, [open])

  const selectedSkills = watch('skills') || []
  const isOtherSelected = selectedSkills.includes('OTHER')

  const toggleSkill = (skill: string) => {
    const next = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill]
    setValue('skills', next, { shouldValidate: true })
  }

  const onSubmit = async (data: UserFormData) => {
    try {
      const skillsToSubmit = data.skills.filter(s => s !== 'OTHER')
      const customSkillValue = data.customSkills?.trim()

      // 1. If 'Other' is provided, handle it
      if (isOtherSelected && customSkillValue) {
        // Always include it in the user's skill association list
        if (!skillsToSubmit.includes(customSkillValue)) {
          skillsToSubmit.push(customSkillValue)
        }

        try {
          // Attempt to register it in the global catalog
          await skillsApi.create(customSkillValue)
        } catch (err) {
          // If creation fails (e.g. already exists), we still proceed to link it
          console.info('Custom skill already exists or creation skipped:', customSkillValue)
        }
      }

      // 2. Update the user
      await userApi.updateUser(user.id, {
        email: data.email,
        role: data.role,
        name: data.name,
        phone: data.phone.replace(/\D/g, ''),
        address: data.address,
        altPhone: data.alternativePhone?.replace(/\D/g, ''),
        gender: data.gender,
        bankAccountNumber: data.bankAccountNumber.replace(/\D/g, ''),
        bankIfsc: data.bankIfsc,
        bankName: data.bankName,
        branchLocation: data.branchLocation,
        dateOfJoining: data.dateOfJoining.toISOString().split('T')[0],
        skills: skillsToSubmit,
        customSkills: isOtherSelected ? customSkillValue : '', // Also sync the text field
      })
      
      toast.success('Staff information updated successfully')
      onSuccess()
      onClose()
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to update user'
      toast.error(message)
    }
  }

  const combinedSkillsList = useMemo(() => {
    const hardcoded = AVAILABLE_SKILLS.filter(s => s.value !== 'OTHER')
    const dynamic = allSkills
      .filter(s => !hardcoded.some(h => h.value === s.name))
      .map(s => ({ label: s.name, value: s.name }))
    
    return [...hardcoded, ...dynamic, { label: 'Other Expertise...', value: 'OTHER' }]
  }, [allSkills])

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Edit Staff Information"
      subtitle="Update organizational data"
      icon={<Edit3 size={22} className="text-primary-olive" />}
      footer={
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-none px-6 rounded-xl font-bold text-[#6B7280]">Cancel</Button>
          <Button 
            type="submit" 
            form="edit-user-form" 
            loading={isSubmitting} 
            className="flex-1 sm:flex-none px-8 rounded-xl bg-primary-olive hover:bg-primary-700 text-white font-black shadow-lg shadow-primary-olive/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
            icon={<Check size={16} strokeWidth={3} />}
          >
            Update Information
          </Button>
        </div>
      }
    >
      <form id="edit-user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* SECTION 1: Personal Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-3">
            <span className="w-6 h-6 rounded-lg bg-primary-50 flex items-center justify-center text-primary-olive border border-[#E5E7EB]">
              <User size={12} strokeWidth={3} />
            </span>
            <h3 className="text-[11px] font-black text-[#111827] uppercase tracking-[0.15em]">Personal Information</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <Input label="Full Name" required placeholder="Rajesh Patil" error={errors.name?.message} {...register('name')} />
            <Input label="Email Address" type="email" required placeholder="rajesh@example.com" error={errors.email?.message} {...register('email')} />
            
            <Controller 
              name="gender" 
              control={control} 
              render={({ field }) => (
                <Dropdown label="Gender" required options={GENDER_OPTIONS} value={field.value} onChange={field.onChange} error={errors.gender?.message} />
              )} 
            />
            <Input label="Primary Phone" required placeholder="9876543210" error={errors.phone?.message} {...register('phone', { onChange: (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10) } })} />

            <Input label="Alternative Number" placeholder="Secondary contact" error={errors.alternativePhone?.message} {...register('alternativePhone', { onChange: (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10) } })} />
            <Controller
              name="dateOfJoining"
              control={control}
              render={({ field }) => (
                <DatePicker label="Joining Date" required value={field.value} onChange={field.onChange} error={errors.dateOfJoining?.message} />
              )}
            />

            <div className="sm:col-span-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#111827] flex items-center gap-2">
                  <MapPin size={13} className="text-text-light" />
                  Residential Address <span className="text-red-500">*</span>
                </label>
                <textarea 
                  {...register('address')} 
                  rows={2} 
                  placeholder="Full street, area, city and pincode..." 
                  className={cn("w-full px-4 py-3 text-sm border rounded-xl bg-white focus:outline-none focus:border-primary-olive focus:ring-4 focus:ring-primary-olive/5 transition-all resize-none font-medium", errors.address ? "border-red-500" : "border-[#E5E7EB]")} 
                />
                {errors.address && <p className="text-xs text-red-500 font-bold">{errors.address.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Role & Expertise */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-3">
            <span className="w-6 h-6 rounded-lg bg-primary-50 flex items-center justify-center text-primary-olive border border-[#E5E7EB]">
              <Check size={12} strokeWidth={3} />
            </span>
            <h3 className="text-[11px] font-black text-[#111827] uppercase tracking-[0.15em]">Work & Expertise</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Controller 
              name="role" 
              control={control} 
              render={({ field }) => (
                <Dropdown label="Organization Role" required options={ALL_ROLES} value={field.value} onChange={field.onChange} error={errors.role?.message} />
              )} 
            />
          </div>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-text-light uppercase tracking-widest leading-none flex items-center gap-2">
                Skills & Software Proficiency
                {loadingSkills && <Loader2 size={10} className="animate-spin text-primary-olive" />}
              </label>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {combinedSkillsList.map(skill => {
                const isSelected = selectedSkills.includes(skill.value)
                
                return (
                  <button 
                    type="button"
                    key={skill.value} 
                    onClick={() => toggleSkill(skill.value)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300",
                      isSelected 
                        ? "bg-primary-olive border-primary-olive text-white shadow-lg shadow-primary-olive/20 scale-[1.02]" 
                        : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-primary-olive/30 hover:bg-primary-50"
                    )}
                  >
                    <div className={cn(
                      "shrink-0 w-3.5 h-3.5 rounded-full border flex items-center justify-center",
                      isSelected ? "bg-white/20 border-white/40" : "bg-gray-50 border-gray-200"
                    )}>
                      {isSelected && <Check size={8} strokeWidth={4} className="text-white" />}
                    </div>
                    <span className="text-[11.5px] font-bold select-none whitespace-nowrap">
                      {skill.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {isOtherSelected && (
              <div className="p-5 bg-primary-50 rounded-3xl border border-primary-olive/20 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-primary-olive">
                    <Sparkles size={14} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Specify New Expertise</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="e.g. Architectural Rendering, Revit Advance..."
                      {...register('customSkills')}
                      className="w-full bg-white px-5 h-12 rounded-2xl border border-[#E5E7EB] text-sm font-bold text-[#111827] focus:outline-none focus:border-primary-olive focus:ring-4 focus:ring-primary-olive/5 transition-all shadow-inner"
                      autoFocus
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-olive/40 pointer-events-none">
                      <Sparkles size={16} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {errors.skills && <p className="text-xs text-red-500 font-bold">{errors.skills.message}</p>}
          </div>
        </div>

        {/* SECTION 3: Banking Details */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-3">
            <span className="w-6 h-6 rounded-lg bg-primary-50 flex items-center justify-center text-primary-olive border border-[#E5E7EB]">
              <Landmark size={12} strokeWidth={3} />
            </span>
            <h3 className="text-[11px] font-black text-[#111827] uppercase tracking-[0.15em]">Banking Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <Input label="Bank Name" required placeholder="State Bank of India" error={errors.bankName?.message} {...register('bankName')} />
            <Input label="Branch Location" required placeholder="Pune Main Branch" error={errors.branchLocation?.message} {...register('branchLocation')} />
            <Input label="Account Number" required placeholder="0000 0000 0000" error={errors.bankAccountNumber?.message} {...register('bankAccountNumber', { onChange: (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 18) } })} />
            <Input label="IFSC Code" required placeholder="SBIN0001234" error={errors.bankIfsc?.message} {...register('bankIfsc', { onChange: (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11) } })} />
          </div>
        </div>
      </form>
    </Modal>
  )
}
