import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Award, Shield, Loader2, Building2, CreditCard, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { useAuthStore } from '@/store'
import { format } from 'date-fns'
import { userApi } from '@/features/admin/api/userApi'
import { authApi } from '@/features/auth/api/authApi'
import { toast } from '@/shared/components/feedback/Toast'
import type { AdminUser } from '@/features/admin/model/types'
import { ROLE_LABEL, AVAILABLE_SKILLS } from '@/features/admin/model/constant'
import { normalizeRole } from '@/shared/config/role'

// ─── Skill chip ───────────────────────────────────────────────────────────────

function SkillChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black bg-[#F8FAF5] text-[#6B7F3A] border border-[#6B7F3A]/20 uppercase tracking-wide">
      {label}
    </span>
  )
}

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

export default function ProfileSettings() {
  const { user: authUser } = useAuthStore()
  const [profile,  setProfile]  = useState<AdminUser | null>(null)
  const [loading,  setLoading]  = useState(true)

  // Password state
  const [passwords, setPasswords] = useState({ current: '', new: '' })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loadingPass, setLoadingPass] = useState(false)

  useEffect(() => {
    if (!authUser?.id) { setLoading(false); return }
    userApi.getUserById(authUser.id)
      .then(setProfile)
      .catch(() => {
        setProfile({
          id:                authUser.id,
          name:              authUser.name ?? 'Staff Member',
          email:             authUser.email,
          phone:             '',
          address:           '',
          bankAccountNumber: '',
          bankIfsc:          '',
          dateOfJoining:     '',
          enabled:           true,
          roles:             authUser.roles,
          skills:            [],
        })
      })
      .finally(() => setLoading(false))
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

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 border-4 border-[#6B7F3A]/20 border-t-[#6B7F3A] rounded-full animate-spin" />
    </div>
  )

  if (!profile) return null

  const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const role = normalizeRole(profile.roles[0] || 'employee')
  const skillLabels = AVAILABLE_SKILLS.filter(s => profile.skills.includes(s.value as any)).map(s => s.label)

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Profile Header */}
      <Card className="p-0 border-none bg-transparent shadow-none overflow-visible">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div
            className="shrink-0 w-28 h-28 rounded-4xl flex items-center justify-center text-white text-3xl font-black shadow-2xl relative"
            style={{ background: 'linear-gradient(135deg, #4B5A2A 0%, #6B7F3A 100%)' }}
          >
            {initials}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-2xl border-4 border-[#F8FAF5] flex items-center justify-center shadow-lg">
               <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left pt-2">
            <h1 className="text-3xl font-black text-[#111827] tracking-tight">{profile.name}</h1>
            <p className="text-sm font-bold text-[#6B7280] uppercase tracking-widest mt-1.5 flex items-center justify-center md:justify-start gap-2">
              <Shield size={14} className="text-[#6B7F3A]" />
              {ROLE_LABEL[role] || role} · Studio Architects
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
              <span className="px-4 py-1.5 rounded-2xl bg-white border border-[#E5E7EB] text-[11px] font-black text-[#111827] uppercase tracking-widest shadow-sm">
                ID: STAFF-{profile.id.slice(0, 6).toUpperCase()}
              </span>
              <span className="px-4 py-1.5 rounded-2xl bg-[#F8FAF5] border border-[#6B7F3A]/20 text-[11px] font-black text-[#6B7F3A] uppercase tracking-widest shadow-sm">
                Join Date: {profile.dateOfJoining ? format(new Date(profile.dateOfJoining), 'dd MMM yyyy') : '—'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal & Contact */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader title="Professional Dossier" subtitle="Personal and contact verification" icon={<User size={18} />} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-8 pt-0">
              <InfoRow icon={<User size={14} />}   label="Legal Name"    value={profile.name} />
              <InfoRow icon={<Mail size={14} />}   label="Email"         value={profile.email} />
              <InfoRow icon={<Phone size={14} />}  label="Contact Number" value={profile.phone || '—'} />
              <InfoRow icon={<MapPin size={14} />} label="Residence"     value={profile.address || '—'} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Skillset & Mastery" subtitle="Verified organizational competencies" icon={<Award size={18} />} />
            <div className="p-8 pt-0">
              {skillLabels.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {skillLabels.map(s => <SkillChip key={s} label={s} />)}
                </div>
              ) : (
                <div className="py-6 text-center bg-[#F8FAF5] rounded-3xl border border-dashed border-[#E5E7EB]">
                  <p className="text-xs font-bold text-text-light uppercase tracking-widest">No verified skills recorded</p>
                </div>
              )}
            </div>
          </Card>

          {/* Access & Security Section - SELF SERVICE UPGRADE */}
          <Card className="border-[#40521B]/20">
            <CardHeader 
              title="Access & Security" 
              subtitle="UPDATE SYSTEM CREDENTIALS" 
              icon={<Lock size={18} className="text-[#40521B]" />} 
            />
            <form onSubmit={handleChangePassword} className="p-8 pt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      placeholder="Minimum 6 characters"
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
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2">
                <div className="flex items-center gap-3 text-[10px] font-bold text-text-light uppercase tracking-tighter">
                   <CheckCircle2 size={12} className="text-emerald-500" />
                   <span>Multi-factor protection enabled</span>
                </div>
                <Button
                  type="submit"
                  loading={loadingPass}
                  className="w-full md:w-auto h-12 px-8 bg-[#40521B] hover:bg-[#2D3F1B] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-[#40521B]/20 transition-all hover:-translate-y-0.5"
                >
                  Update Credentials
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Work & Financial */}
        <div className="space-y-8">
          <Card className="bg-[#111827] text-white border-none shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6B7F3A]/10 rounded-full blur-3xl" />
            <CardHeader 
              title="Employment" 
              subtitle="HIERARCHY & STATUS" 
              icon={<Briefcase size={18} className="text-white" />} 
              className="text-white"
            />
            <div className="space-y-4 p-8 pt-0">
               <div className="flex justify-between items-center pb-3 border-b border-white/10">
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Department</span>
                 <span className="text-[13px] font-bold">Construction & Design</span>
               </div>
               <div className="flex justify-between items-center pb-3 border-b border-white/10">
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Role Level</span>
                 <span className="text-[13px] font-bold capitalize">{role.replace('_', ' ')}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Account Status</span>
                 <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">Active</span>
               </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Financial Information" subtitle="SECURE BANKING DETAILS" icon={<CreditCard size={18} />} />
            <div className="space-y-4 p-8 pt-0">
              <div className="p-4 bg-[#F8FAF5] rounded-2xl border border-[#E5E7EB]">
                <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-1.5">Account Number</p>
                <p className="text-[14px] font-black tracking-[0.2em]">{profile.bankAccountNumber ? `****${profile.bankAccountNumber.slice(-4)}` : 'NOT PROVIDED'}</p>
              </div>
              <div className="p-4 bg-[#F8FAF5] rounded-2xl border border-[#E5E7EB]">
                <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-1.5">IFSC Code</p>
                <p className="text-[14px] font-black">{profile.bankIfsc || 'NOT PROVIDED'}</p>
              </div>
              <div className="flex items-center gap-2 p-3 text-text-light">
                 <Shield size={12} />
                 <p className="text-[9px] font-bold uppercase tracking-tighter italic">Details are managed by administrative payroll.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
