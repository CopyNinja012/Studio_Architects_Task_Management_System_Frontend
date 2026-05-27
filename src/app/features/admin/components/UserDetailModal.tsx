import { useState, useMemo, useEffect } from 'react'
import {
  X, Mail, Phone, MapPin, Briefcase, Clock,
  ChevronLeft, ChevronRight, TrendingUp,
  FileText, Star, CheckCircle2, AlertCircle, Download,
  CalendarDays, Building2, CreditCard, User as UserIcon, Loader2,
  Shield,
} from 'lucide-react'
import { format, parseISO, getDaysInMonth, startOfMonth, getDay } from 'date-fns'
import { userApi } from '../api/userApi'
import type { AdminUser } from '../model/types'
import { Avatar } from '@/shared/components/ui/Avatar'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { Modal } from '@/shared/components/ui/Modal'
import { cn } from '@/shared/lib/cn'
import { formatDate } from '@/shared/lib/date'
import { normalizeRole } from '@/shared/config/role'
import { ROLE_LABEL, AVAILABLE_SKILLS } from '@/features/admin/model/constant'
import { EditUserModal } from './EditUserModal'
import { useAuthStore } from '@/store'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[9px] font-bold text-text-light uppercase tracking-widest flex items-center gap-1">
        {icon} {label}
      </p>
      <p className="text-[13px] font-bold text-text-dark">{value || '—'}</p>
    </div>
  )
}

function SectionLabel({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-black text-text-dark uppercase tracking-widest mb-3 flex items-center gap-2 px-1">
      {icon && <span className="text-primary-olive">{icon}</span>}
      {children}
    </h3>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ user }: { user: AdminUser }) {
  const role = normalizeRole(user.roles?.[0] || 'employee')
  
  // Extract labels for skills. If not in hardcoded list, use the string itself.
  const hardcodedMap: Record<string, string> = {}
  AVAILABLE_SKILLS.forEach(s => { hardcodedMap[s.value] = s.label })
  
  const skillLabels = user.skills.map(s => hardcodedMap[s as any] || s)
  
  // Also include customSkills if they were stored separately
  if (user.customSkills) {
    user.customSkills.split(',').forEach(cs => {
      const trimmed = cs.trim()
      if (trimmed && !skillLabels.includes(trimmed)) {
        skillLabels.push(trimmed)
      }
    })
  }

  const profData = {
    employeeId:      `EMP-${user.id.slice(0, 4).toUpperCase()}-${user.id.slice(4, 7).toUpperCase()}`,
    role:            ROLE_LABEL[role] || role,
    department:      'Construction Department',
    employmentType:  'Full Time',
    workLocation:    'New York Office',
    about: `${user.name} is an experienced ${ROLE_LABEL[role] || role} with a proven track record in delivering construction projects on time and within budget.`,
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 border-surface-border shadow-sm">
          <SectionLabel icon={<Briefcase size={14} />}>Professional Overview</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
            <InfoRow label="Employee ID"     value={profData.employeeId}            icon={<UserIcon size={11} />}     />
            <InfoRow label="Date of Joining" value={formatDate(user.dateOfJoining)} icon={<CalendarDays size={11} />} />
            <InfoRow label="Role"            value={profData.role}                  icon={<Briefcase size={11} />}    />
            <InfoRow label="Department"      value={profData.department}            icon={<Building2 size={11} />}    />
          </div>
        </Card>
        <Card className="p-4 border-surface-border shadow-sm">
          <SectionLabel icon={<Phone size={14} />}>Contact Information</SectionLabel>
          <div className="space-y-3">
            <InfoRow label="Email"   value={user.email}   icon={<Mail size={11} />}   />
            <InfoRow label="Phone"   value={user.phone}   icon={<Phone size={11} />}  />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-4 border-surface-border shadow-sm">
          <SectionLabel icon={<UserIcon size={14} />}>Biography</SectionLabel>
          <p className="text-[12.5px] text-text-medium leading-relaxed font-medium">{profData.about}</p>
          {skillLabels.length > 0 && (
            <div className="mt-4 pt-4 border-t border-surface-border">
              <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-2.5 px-1">Skills & Expertise</p>
              <div className="flex flex-wrap gap-2">
                {skillLabels.map(s => (
                  <span key={s} className="px-2.5 py-0.5 bg-primary-50 text-primary-olive text-[9px] font-black rounded-lg border border-primary-100 uppercase tracking-wide">{s}</span>
                ))}
              </div>
            </div>
          )}
        </Card>
        <Card className="p-4 border-surface-border shadow-sm flex flex-col">
          <SectionLabel icon={<CreditCard size={14} />}>Financial & Address</SectionLabel>
          <div className="space-y-3 flex-1">
             <InfoRow label="Account Number" value={user.bankAccountNumber ? `****${user.bankAccountNumber.slice(-4)}` : '—'} />
             <InfoRow label="IFSC Code"      value={user.bankIfsc || '—'} />
             <div className="h-px bg-surface-border my-0.5" />
             <InfoRow label="Address" value={user.address} icon={<MapPin size={11} />} />
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

type TabId = 'overview' | 'performance' | 'activity'

interface Props {
  id: string | null
  open: boolean
  onClose: () => void
}

export function UserDetailModal({ id, open, onClose }: Props) {
  const { user: authUser } = useAuthStore()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [isEditOpen, setIsEditOpen] = useState(false)

  const fetchUser = () => {
    if (!id || !open) return
    setLoading(true)
    userApi.getUsers(0, 500) // Temporary fetch until getUserById is reliable across roles
      .then(res => {
        const found = res.content.find(u => u.id === id)
        if (found) setUser(found)
        else { 
          // If not in current page, try specific fetch (might fail with 403 for non-admins)
          userApi.getUserById(id).then(setUser).catch(() => onClose())
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUser()
  }, [id, open])

  if (!open) return null

  if (loading || !user) {
    return (
      <Modal open={open} onClose={onClose} size="xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-olive" />
        </div>
      </Modal>
    )
  }

  const role = normalizeRole(user.roles?.[0] || 'employee')
  
  // Use normalizeRole to check permissions against lowercase normalized strings
  const authRoles = (authUser?.roles || []).map(r => normalizeRole(r))
  const canEdit = authRoles.includes('admin') || authRoles.includes('hr')

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={user.name}
      subtitle={`${ROLE_LABEL[role] || role} · Construction Department`}
      icon={<Avatar name={user.name} size="sm" online={user.enabled} className="w-full h-full" />}
      footer={
        <div className="flex items-center justify-between w-full px-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-text-light leading-none">
            <Clock size={11} />
            Last Login: {user.dateOfJoining ? format(new Date(user.dateOfJoining), 'dd MMM yyyy') : 'Never'}
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button 
                variant="ghost" 
                onClick={() => setIsEditOpen(true)}
                className="h-8 px-4 text-[11px] border border-surface-border font-bold rounded-lg hover:bg-primary-50 hover:text-primary-olive hover:border-primary-200 transition-all"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Tabs Bar */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-surface-border -mt-4 mb-4">
          {[
            { id: 'overview',    label: 'Overview'    },
            { id: 'performance', label: 'Performance' },
            { id: 'activity',    label: 'Activity'    },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={cn(
                'pb-3 text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all relative',
                activeTab === tab.id
                  ? 'text-primary-olive after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-primary-olive after:rounded-t-full'
                  : 'text-text-light hover:text-text-medium'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'overview'    && <OverviewTab user={user} />}
          {activeTab === 'performance' && <div className="py-16 text-center text-text-light font-black uppercase tracking-widest opacity-40 text-[11px]">Performance data coming soon</div>}
          {activeTab === 'activity'    && <div className="py-16 text-center text-text-light font-black uppercase tracking-widest opacity-40 text-[11px]">Activity logs coming soon</div>}
        </div>
      </div>

      {isEditOpen && user && (
        <EditUserModal 
          user={user} 
          open={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
          onSuccess={fetchUser} 
        />
      )}
    </Modal>
  )
}
