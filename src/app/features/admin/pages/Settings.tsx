import { useState, useEffect } from 'react'
import { 
  User, Mail, Phone, MapPin, Shield, 
  Lock, Eye, EyeOff, Loader2, 
  CheckCircle2, AlertCircle
} from 'lucide-react'
import { Card, CardHeader } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { useAuthStore } from '@/store'
import { userApi } from '@/features/admin/api/userApi'
import { authApi } from '@/features/auth/api/authApi'
import { toast } from '@/shared/components/feedback/Toast'
import { format } from 'date-fns'
import { ROLE_LABEL } from '@/features/admin/model/constant'
import { normalizeRole } from '@/shared/config/role'
import type { AdminUser } from '@/features/admin/model/types'

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-[#F8FAF5]/50 rounded-2xl border border-[#E5E7EB] hover:border-[#6B7F3A]/20 transition-all group">
      <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-all">
        <span className="text-[#6B7F3A]">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-text-light uppercase tracking-[0.15em] leading-none mb-1.5">{label}</p>
        <p className="text-[14px] font-bold text-[#111827] truncate">{value || '—'}</p>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

import { skillsApi, type Skill } from '../api/skillsApi'
import { Plus, Trash2, Sparkles } from 'lucide-react'
import { AddSkillModal } from '../components/AddSkillModal'

export default function Settings() {
  const { user: authUser } = useAuthStore()
  const [profile, setProfile] = useState<AdminUser | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  
  // Password state
  const [passwords, setPasswords] = useState({ current: '', new: '' })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loadingPass, setLoadingPass] = useState(false)

  // Skills Management State
  const [allSkills, setAllSkills] = useState<Skill[]>([])
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false)

  const fetchSkills = async () => {
    try {
      const data = await skillsApi.getAll()
      setAllSkills(data)
    } catch (err) {
      console.error('Failed to fetch skills')
    }
  }

  useEffect(() => {
    const authRoles = (authUser?.roles || []).map(r => normalizeRole(r))
    if (authRoles.includes('admin')) fetchSkills()
  }, [authUser?.roles])

  const handleDeleteSkill = async (id: string) => {
// ...
    if (!confirm('Are you sure? This will remove the skill from the selection list.')) return
    try {
      await skillsApi.delete(id)
      toast.success('Skill removed')
      fetchSkills()
    } catch {
      toast.error('Failed to remove skill')
    }
  }

  useEffect(() => {
// ... (existing profile fetch logic)
    if (!authUser?.id) { setLoadingProfile(false); return }
    userApi.getUserById(authUser.id)
      .then(setProfile)
      .catch(() => {
        setProfile({
          id: authUser.id,
          name: authUser.name ?? 'Administrator',
          email: authUser.email,
          phone: '',
          address: '',
          bankAccountNumber: '',
          bankIfsc: '',
          dateOfJoining: '',
          enabled: true,
          roles: authUser.roles,
          skills: [],
        })
      })
      .finally(() => setLoadingProfile(false))
  }, [authUser?.id])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoadingPass(true)
    try {
      await authApi.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new
      })
      toast.success('Password updated successfully')
      setPasswords({ current: '', new: '' })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password')
    } finally {
      setLoadingPass(false)
    }
  }

  if (loadingProfile) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-10 h-10 text-[#6B7F3A] animate-spin" />
    </div>
  )

  const initials = profile?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const role = profile ? normalizeRole(profile.roles[0] || 'admin') : 'admin'

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-12">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-[40px] p-8 md:p-12 border border-surface-border shadow-sm flex flex-col md:flex-row items-center md:items-start gap-10">
        <div
          className="shrink-0 w-32 h-32 rounded-[36px] flex items-center justify-center text-white text-4xl font-black shadow-2xl relative"
          style={{ background: 'linear-gradient(135deg, #4B5A2A 0%, #6B7F3A 100%)' }}
        >
          {initials}
          <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-2xl border-4 border-[#F8FAF5] flex items-center justify-center shadow-lg">
             <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-pulse" />
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-6">
          <div>
            <h1 className="text-4xl font-black text-[#111827] tracking-tight mb-2">{profile?.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-[#6B7F3A] uppercase tracking-widest">
                <Shield size={16} />
                {ROLE_LABEL[role] || 'Administrator'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-surface-border hidden md:block" />
              <span className="text-sm font-bold text-text-light uppercase tracking-widest">
                Studio Architects · Enterprise Control
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            <div className="px-5 py-2 bg-[#F8FAF5] rounded-2xl border border-[#6B7F3A]/10 flex items-center gap-3">
               <span className="text-[10px] font-black text-text-light uppercase tracking-widest">Account ID</span>
               <span className="text-[12px] font-black text-[#111827] font-mono tracking-tighter uppercase">ADMIN-{profile?.id.slice(0, 8)}</span>
            </div>
            {profile?.dateOfJoining && (
              <div className="px-5 py-2 bg-white rounded-2xl border border-surface-border flex items-center gap-3">
                 <span className="text-[10px] font-black text-text-light uppercase tracking-widest">Member Since</span>
                 <span className="text-[12px] font-black text-[#111827]">{format(new Date(profile.dateOfJoining), 'MMM yyyy')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Section: Personal Information */}
        <div className="lg:col-span-7 space-y-8">
          <Card className="rounded-4xl overflow-hidden">
            <CardHeader 
              title="Personal Identity" 
              subtitle="SECURE VERIFIED INFORMATION" 
              icon={<User size={18} className="text-[#6B7F3A]" />} 
            />
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              <InfoRow icon={<User size={14} />} label="Full Name" value={profile?.name || ''} />
              <InfoRow icon={<Mail size={14} />} label="Email Address" value={profile?.email || ''} />
              <InfoRow icon={<Phone size={14} />} label="Contact Number" value={profile?.phone || 'Not provided'} />
              <InfoRow icon={<MapPin size={14} />} label="Operational Base" value={profile?.address || 'Not provided'} />
            </div>
            
            <div className="px-8 pb-8">
               <div className="p-5 bg-[#40521B]/5 rounded-3xl border border-[#40521B]/10 flex items-start gap-4">
                  <AlertCircle size={18} className="text-[#40521B] shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium text-[#40521B] leading-relaxed italic">
                    Administrative identity details are managed by the core HR department. 
                    If any information is incorrect, please initiate a formal update request 
                    through the system support channel.
                  </p>
               </div>
            </div>
          </Card>
        </div>

        {/* Right Section: Security / Password Change */}
        <div className="lg:col-span-5 space-y-8">
          <Card className="rounded-4xl overflow-hidden border-[#40521B]/20">
            <CardHeader 
              title="Access & Security" 
              subtitle="AUTHENTICATION CONTROL" 
              icon={<Lock size={18} className="text-[#40521B]" />} 
            />
            <form onSubmit={handleChangePassword} className="p-8 space-y-6">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-light px-1">Current Password</label>
                <div className="relative">
                  <Input
                    type={showCurrent ? 'text' : 'password'}
                    value={passwords.current}
                    onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                    placeholder="Verification required"
                    className="h-12 rounded-2xl border-surface-border bg-surface-hover/30 focus:bg-white transition-all pl-4 pr-12 text-sm font-bold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light hover:text-[#40521B] transition-colors"
                  >
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-light px-1">New System Password</label>
                <div className="relative">
                  <Input
                    type={showNew ? 'text' : 'password'}
                    value={passwords.new}
                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                    placeholder="Minimum 8 characters"
                    className="h-12 rounded-2xl border-surface-border bg-surface-hover/30 focus:bg-white transition-all pl-4 pr-12 text-sm font-bold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light hover:text-[#40521B] transition-colors"
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                loading={loadingPass}
                className="w-full h-14 bg-[#40521B] hover:bg-[#2D3F1B] text-white rounded-[20px] font-black uppercase text-[11px] tracking-widest shadow-lg shadow-[#40521B]/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
              >
                Update Access Credentials
              </Button>

              <div className="flex items-center gap-3 pt-2 text-[10px] font-bold text-text-light uppercase tracking-tighter">
                 <CheckCircle2 size={12} className="text-emerald-500" />
                 <span>Last changed: {format(new Date(), 'dd MMM yyyy')}</span>
              </div>
            </form>
          </Card>
        </div>
        {/* Bottom Section: Skills Inventory Management (Admin Only) */}
        {(authUser?.roles || []).map(r => normalizeRole(r)).includes('admin') && (
          <div className="lg:col-span-12">
            <Card className="rounded-4xl overflow-hidden border-[#40521B]/10">
              <CardHeader 
                title="Skills & Expertise Catalog" 
                subtitle="GLOBAL TALENT INVENTORY" 
                icon={<Sparkles size={18} className="text-primary-olive" />} 
                action={
                  <Button
                    onClick={() => setIsAddSkillModalOpen(true)}
                    className="h-9 px-4 bg-primary-olive text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#40521B]/10 hover:-translate-y-0.5 active:translate-y-0"
                    icon={<Plus size={14} strokeWidth={3} />}
                  >
                    Add New Skill
                  </Button>
                }
              />
              <div className="p-8 space-y-10">
                
                {/* Skill Grid */}
                <div className="space-y-4">
                   <div className="flex items-center justify-between px-1">
                      <p className="text-[11px] font-black text-[#111827] uppercase tracking-widest">Active Inventory ({allSkills.length})</p>
                      <span className="text-[10px] text-[#6B7280] font-bold italic">Global skills available for assignment</span>
                   </div>

                   {allSkills.length === 0 ? (
                     <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-[#E5E7EB]">
                        <p className="text-sm font-medium text-text-light">No dynamic skills registered yet.</p>
                     </div>
                   ) : (
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                       {allSkills.map(skill => (
                         <div key={skill.id} className="group relative flex items-center justify-between p-3.5 bg-white border border-[#E5E7EB] rounded-2xl hover:border-primary-olive/30 hover:shadow-md transition-all duration-300">
                            <span className="text-[12.5px] font-bold text-[#111827] truncate pr-6">{skill.name}</span>
                            <button
                              onClick={() => handleDeleteSkill(skill.id)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 size={13} strokeWidth={3} />
                            </button>
                         </div>
                       ))}
                     </div>
                   )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <AddSkillModal 
        open={isAddSkillModalOpen} 
        onClose={() => setIsAddSkillModalOpen(false)} 
        onSuccess={fetchSkills} 
      />
    </div>
  )
}
