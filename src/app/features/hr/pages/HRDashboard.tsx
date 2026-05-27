import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowUpRight, ArrowDownRight, ChevronRight, Calendar, 
  CheckCircle2, AlertCircle 
} from 'lucide-react'
import { PATHS } from '@/router/path'
import projectActivityImg from '@/shared/assets/projectActivity.png'
import teamImg from '@/shared/assets/sidebar/Team.png'
import totalEmployeeImg from '@/shared/assets/cards/total_employee12.png'
import totalTaskImg from '@/shared/assets/cards/total_task1.png'
import pendingApprovalImg from '@/shared/assets/cards/pending_approvals1.png'
import performanceImg from '@/shared/assets/sidebar/performance.png'
import { Avatar } from '@/shared/components/ui/Avatar'
import { Card, CardHeader } from '@/shared/components/ui/Card'
import { cn } from '@/shared/lib/cn'
import { adminApi } from '@/features/admin/api/adminApi'
import type { AdminUser } from '@/features/admin/model/types'
import { PageLoader } from '@/shared/components/ui/Loader'

// ─── StatCard Component ──────────────────────────────────────────────────────

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  trend?: { value: number; positive: boolean }
  accentColor: string
  gradientFrom: string
  gradientTo: string
  image: string
  imageAlt: string
  href: string
}

function StatCard({ title, value, subtitle, trend, accentColor, gradientFrom, gradientTo, image, imageAlt, href }: StatCardProps) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(href)}
      className="group relative w-full text-left overflow-hidden rounded-2xl bg-white transition-all duration-500 ease-out focus:outline-none hover:shadow-premium-hover hover:-translate-y-1.5"
      style={{ border: `1.5px solid ${accentColor}11`, boxShadow: `0 4px 20px ${gradientFrom}08` }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}05 0%, ${gradientTo}02 100%)` }} />
      
      <div className="relative p-5 md:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-light mb-2.5">{title}</p>
            <p className="text-3xl md:text-[2.6rem] font-black tracking-tighter leading-none" style={{ color: gradientFrom }}>{value}</p>
          </div>
          
          <div className="shrink-0 w-14 h-14 md:w-18 md:h-18 flex items-center justify-center pointer-events-none relative">
            <img 
              src={image} 
              alt={imageAlt}
              className={cn(
                "w-12 h-12 md:w-16 md:h-16 object-contain transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) brightness-110 saturate-110",
                "opacity-100 scale-110 group-hover:scale-150 group-hover:-translate-y-3 group-hover:rotate-6",
                "drop-shadow-[0_15px_20px_rgba(0,0,0,0.1)] group-hover:drop-shadow-[0_30px_45px_rgba(0,0,0,0.25)]"
              )} 
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {trend && (
              <span className={cn('inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 transition-all duration-500',
                trend.positive ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/10' : 'bg-red-50 text-red-500 ring-1 ring-red-500/10')}>
                {trend.positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {trend.value}%
              </span>
            )}
            <p className="text-[11px] text-text-light font-semibold truncate group-hover:text-text-dark transition-colors">{subtitle}</p>
          </div>
          <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 border border-surface-border bg-surface-hover shadow-sm"
            style={{ color: gradientFrom }}>
            <ChevronRight size={14} strokeWidth={3} />
          </div>
        </div>
      </div>
      
      <div className="h-1.5 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundColor: gradientFrom }} />
    </button>
  )
}

// ─── Main HR Dashboard ──────────────────────────────────────────────────────────

export default function HRDashboard() {
  const [employees, setEmployees] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getUsers(0, 100)
      .then(res => setEmployees(res.content))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const activeCount = employees.filter(e => e.enabled).length
  const inactiveCount = employees.length - activeCount

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={employees.length}
          subtitle={`${activeCount} active, ${inactiveCount} inactive`}
          trend={{ value: 4, positive: true }}
          accentColor="#40521B"
          gradientFrom="#40521B"
          gradientTo="#556F1F"
          image={totalEmployeeImg}
          imageAlt="Employees"
          href={PATHS.HR_EMPLOYEES}
        />
        <StatCard
          title="Open Vacancies"
          value={12}
          subtitle="4 positions urgent"
          trend={{ value: 12, positive: true }}
          accentColor="#0F766E"
          gradientFrom="#0F766E"
          gradientTo="#2D9A92"
          image={totalTaskImg}
          imageAlt="Vacancies"
          href={PATHS.HR_RECRUITMENT}
        />
        <StatCard
          title="Leave Requests"
          value={5}
          subtitle="2 pending approval"
          trend={{ value: 20, positive: false }}
          accentColor="#B45309"
          gradientFrom="#B45309"
          gradientTo="#D97706"
          image={pendingApprovalImg}
          imageAlt="Leave"
          href={PATHS.HR_DASHBOARD}
        />
        <StatCard
          title="Performance"
          value="84%"
          subtitle="Avg score this month"
          trend={{ value: 5, positive: true }}
          accentColor="#40521B"
          gradientFrom="#40521B"
          gradientTo="#556F1F"
          image={performanceImg}
          imageAlt="Performance"
          href={PATHS.HR_PERFORMANCE}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Hires */}
        <Card className="lg:col-span-2 group transition-all duration-500 hover:shadow-premium-hover">
          <CardHeader 
            title="Recent Onboarding" 
            subtitle="Employees joined recently" 
            icon={
              <img 
                src={projectActivityImg} 
                className="w-14 h-14 object-contain brightness-110 saturate-110 transition-all duration-700 ease-out group-hover:scale-150 group-hover:-translate-y-2 group-hover:rotate-3 group-hover:drop-shadow-2xl" 
              />
            } 
          />
          <div className="space-y-4 mt-6">
            {employees.slice(0, 4).map(e => (
              <div key={e.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-hover border border-transparent hover:border-surface-border transition-all cursor-pointer group">
                <Avatar name={e.name} size="md" className="ring-2 ring-white shadow-sm" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-dark">{e.name}</p>
                  <p className="text-[10px] text-text-light font-medium uppercase tracking-wider">{e.roles.join(', ')}</p>
                </div>
                <div className="text-right">
                  <span className={cn(
                    'text-[10px] font-bold px-2.5 py-1 rounded-full',
                    e.enabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                  )}>{e.enabled ? 'Active' : 'Inactive'}</span>
                  <div className="flex items-center gap-1.5 justify-end mt-1.5 text-text-light">
                    <Calendar size={10} />
                    <span className="text-[10px] font-medium">{e.dateOfJoining ? new Date(e.dateOfJoining).toLocaleDateString() : '—'}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* Leave Requests */}
        <Card className="group transition-all duration-500 hover:shadow-premium-hover">
          <CardHeader 
            title="Leave Requests" 
            subtitle="Approval pending" 
            icon={
              <img 
                src={teamImg} 
                className="w-14 h-14 object-contain brightness-110 saturate-110 transition-all duration-700 ease-out group-hover:scale-150 group-hover:-translate-y-2 group-hover:-rotate-3 group-hover:drop-shadow-2xl" 
              />
            } 
          />
          <div className="space-y-4 mt-6">
            {[
              { name: 'Rahul Sharma', type: 'Annual', days: 3, from: '22 May', status: 'Pending' },
              { name: 'Sneha Patel', type: 'Sick', days: 1, from: '21 May', status: 'Pending' },
              { name: 'Amit Verma', type: 'Annual', days: 5, from: '25 May', status: 'Approved' },
            ].map(r => (
              <div key={r.name} className="p-4 rounded-xl bg-surface-hover/50 border border-surface-border">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={r.name} size="sm" />
                  <div>
                    <p className="text-xs font-bold text-text-dark">{r.name}</p>
                    <p className="text-[10px] text-text-light font-medium">{r.type} Leave · {r.days} Days</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-light">
                    <Calendar size={10} />
                    Starts {r.from}
                  </div>
                  {r.status === 'Pending' ? (
                    <div className="flex gap-2">
                      <button className="h-7 px-3 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase shadow-sm shadow-emerald-100">Approve</button>
                      <button className="h-7 px-3 rounded-lg bg-white border border-red-200 text-red-500 text-[10px] font-black uppercase">Deny</button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <CheckCircle2 size={10} /> Approved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 rounded-xl border border-primary-olive/20 text-primary-olive text-[11px] font-black uppercase hover:bg-primary-50 transition-colors">
            View All Requests
          </button>
        </Card>
      </div>

      <Card className="border-none bg-teal-50 shadow-sm overflow-hidden relative">
        <div className="absolute right-0 top-0 w-32 h-32 bg-teal-100/50 rounded-full -mr-16 -mt-16" />
        <div className="flex flex-col md:flex-row items-center gap-5 p-6 md:p-8 relative z-10 text-center md:text-left">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-teal-200 group-hover:scale-105 transition-transform duration-500">
            <AlertCircle size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-black text-teal-900">Upcoming Contract Renewals</h3>
            <p className="text-[12px] text-teal-700/80 mt-1 font-medium">3 employee contracts expire within the next 30 days. Action is required for visa processing.</p>
          </div>
          <button className="w-full md:w-auto px-8 h-12 rounded-xl bg-teal-700 text-white text-[12px] font-black uppercase shadow-lg shadow-teal-200 hover:bg-teal-800 transition-all hover:-translate-y-0.5">
            Review Contracts
          </button>
        </div>
      </Card>
    </div>
  )
}
