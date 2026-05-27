import { PATHS } from '@/router/path'

import projectActivityImg from '@/shared/assets/projectActivity.png'
import taskDistributionImg from '@/shared/assets/taskDistribution.png'
import recentProjectImg from '@/shared/assets/recentProject.png'
import myTaskImgFull from '@/shared/assets/sidebar/myTask.png'

// Import Images
import totalProjectImg    from '@/shared/assets/cards/total_project.png'
import totalTaskImg       from '@/shared/assets/cards/total_task1.png'
import totalEmployeeImg   from '@/shared/assets/cards/total_employee12.png'
import pendingApprovalImg from '@/shared/assets/cards/pending_approvals1.png'
import { Card, CardHeader } from '@/shared/components/ui/Card'
import { cn } from '@/shared/lib/cn'
import { ChevronRight, Clock, CheckCircle2, TrendingUp, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function StatCard({ title, value, subtitle, accentColor, gradientFrom, gradientTo, image, imageAlt, href }: {
  title: string; value: string | number; subtitle: string
  accentColor: string; gradientFrom: string; gradientTo: string
  image: string; imageAlt: string; href: string
}) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(href)}
      className="group relative w-full text-left overflow-hidden rounded-2xl bg-white transition-all duration-500 ease-out focus:outline-none hover:shadow-premium-hover hover:-translate-y-1.5"
      style={{ border: `1.5px solid ${accentColor}11`, boxShadow: `0 4px 20px ${gradientFrom}08` }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}05 0%, ${gradientTo}02 100%)` }} />
      
      <div className="relative px-5 pt-6 pb-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-light mb-2.5">{title}</p>
            <p className="text-[2.6rem] font-black tracking-tighter leading-none" style={{ color: gradientFrom }}>{value}</p>
          </div>
          
          {/* Enhanced 3D Icon - Reactive Hover */}
          <div className="shrink-0 w-18 h-18 flex items-center justify-center pointer-events-none relative">
            <img 
              src={image} 
              alt={imageAlt}
              className={cn(
                "w-16 h-16 object-contain transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) brightness-110 saturate-110",
                "opacity-100 scale-110 group-hover:scale-150 group-hover:-translate-y-3 group-hover:rotate-6",
                "drop-shadow-[0_15px_20px_rgba(0,0,0,0.1)] group-hover:drop-shadow-[0_30px_45px_rgba(0,0,0,0.25)]"
              )} 
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          <p className="text-[11px] text-text-light font-semibold truncate group-hover:text-text-dark transition-colors">{subtitle}</p>
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

const myProjects = [
  { name: 'Riverside Complex', progress: 72, status: 'In Progress', due: '15 Jun 2026' },
  { name: 'Metro Office Tower', progress: 45, status: 'In Progress', due: '30 Aug 2026' },
  { name: 'Green Valley Villas', progress: 90, status: 'Near Completion', due: '01 Jun 2026' },
]

const pendingTasks = [
  { title: 'Foundation Review', project: 'Riverside Complex', assignee: 'Ali Hassan', submitted: '2h ago' },
  { title: 'Structural Drawing v3', project: 'Metro Office Tower', assignee: 'Sara Khan', submitted: '5h ago' },
  { title: 'Site Safety Report', project: 'Green Valley Villas', assignee: 'Usman Raza', submitted: '1d ago' },
]

export default function PMDashboard() {
  const navigate = useNavigate()
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="My Projects" value={3} subtitle="2 active, 1 near completion" 
          accentColor="#40521B" gradientFrom="#40521B" gradientTo="#556F1F" 
          image={totalProjectImg} imageAlt="Projects" href={PATHS.PM_PROJECTS} 
        />
        <StatCard 
          title="Open Tasks" value={14} subtitle="Across all projects" 
          accentColor="#0F766E" gradientFrom="#0F766E" gradientTo="#2D9A92" 
          image={totalTaskImg} imageAlt="Tasks" href={PATHS.PM_TASKS} 
        />
        <StatCard 
          title="Team Members" value={8} subtitle="Assigned to my projects" 
          accentColor="#607B44" gradientFrom="#607B44" gradientTo="#556F1F" 
          image={totalEmployeeImg} imageAlt="Team" href={PATHS.PM_TEAM} 
        />
        <StatCard 
          title="Pending Reviews" value={3} subtitle="Tasks awaiting approval" 
          accentColor="#B45309" gradientFrom="#B45309" gradientTo="#D97706" 
          image={pendingApprovalImg} imageAlt="Approvals" href={PATHS.PM_APPROVALS} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="group transition-all duration-500 hover:shadow-premium-hover">
          <CardHeader 
            title="My Projects" 
            subtitle="Progress overview" 
            icon={
              <img 
                src={recentProjectImg} 
                className="w-14 h-14 object-contain brightness-110 saturate-110 transition-all duration-700 ease-out group-hover:scale-150 group-hover:-translate-y-2 group-hover:rotate-3 group-hover:drop-shadow-2xl" 
              />
            } 
          />
          <div className="space-y-5 mt-6">
            {myProjects.map(p => (
              <div key={p.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-text-dark">{p.name}</p>
                  <span className="text-xs font-bold text-[#40521B]">{p.progress}%</span>
                </div>
                <div className="w-full bg-surface-hover rounded-full h-2">
                  <div className="h-2 rounded-full bg-[#40521B] transition-all duration-700" style={{ width: `${p.progress}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-light font-medium">{p.status}</span>
                  <span className="text-[10px] text-text-light font-medium">Due: {p.due}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="group transition-all duration-500 hover:shadow-premium-hover">
          <CardHeader title="Pending Task Reviews" subtitle="Submitted by team members" icon={<Clock size={16} />} />
          <div className="space-y-4 mt-6">
            {pendingTasks.map(t => (
              <div key={t.title} className="flex items-center justify-between p-4 rounded-xl bg-surface-hover hover:bg-primary-100 transition-colors">
                <div>
                  <p className="text-sm font-bold text-text-dark">{t.title}</p>
                  <p className="text-[10px] text-text-light font-medium mt-0.5">{t.project} · {t.assignee}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-text-light">{t.submitted}</span>
                  <div className="flex gap-2 mt-1.5">
                    <button className="text-[10px] font-bold text-emerald-600 hover:underline">Approve</button>
                    <button className="text-[10px] font-bold text-red-500 hover:underline">Rework</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="group transition-all duration-500 hover:shadow-premium-hover">
        <CardHeader 
          title="Quick Stats" 
          subtitle="This week at a glance" 
          icon={
            <img 
              src={projectActivityImg} 
              className="w-14 h-14 object-contain brightness-110 saturate-110 transition-all duration-700 ease-out group-hover:scale-150 group-hover:-translate-y-2 group-hover:rotate-3 group-hover:drop-shadow-2xl" 
            />
          } 
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Tasks Approved', value: 12, icon: <CheckCircle2 size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Tasks Sent for Rework', value: 3, icon: <Clock size={18} />, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Milestones Hit', value: 2, icon: <TrendingUp size={18} />, color: 'text-teal-600', bg: 'bg-teal-50' },
            { label: 'Team Utilization', value: '87%', icon: <Users size={18} />, color: 'text-[#40521B]', bg: 'bg-[#F5F7F2]' },
          ].map(s => (
            <div key={s.label} className={cn('rounded-2xl p-4 flex items-center gap-3', s.bg)}>
              <span className={s.color}>{s.icon}</span>
              <div>
                <p className="text-lg font-black text-text-dark">{s.value}</p>
                <p className="text-[10px] text-text-light font-medium leading-tight">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}



