import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  
  AlertCircle, Calendar, ChevronRight, ArrowUpRight,
  ClipboardList,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader } from '@/shared/components/ui/Card'
import { cn } from '@/shared/lib/cn'
import { PATHS } from '@/router/path'
import myTaskImg from '@/shared/assets/sidebar/myTask.png'
import completeProjectImg from '@/shared/assets/cards/complete-project.png'
import pendingApprovalImg from '@/shared/assets/cards/pending_approvals1.png'
import performanceImg     from '@/shared/assets/sidebar/performance.png'
import { taskApi } from '@/features/admin/api/taskApi'
import type { TaskApi } from '@/features/admin/model/types'

import projectActivityImg from '@/shared/assets/projectActivity.png'
import myTaskImgFull from '@/shared/assets/sidebar/myTask.png'

// ─── Stat Card (same design as admin) ────────────────────────────────────────

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
          
          {/* Enhanced 3D Icon - Reactive Hover */}
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
                <ArrowUpRight size={10} />{trend.value}%
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

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, color = '#40521B' }: { value: number; color?: string }) {
  return (
    <div className="w-full bg-surface-border rounded-full overflow-hidden h-1.5">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  )
}

// ─── Constants ────────────────────────────────────────────────────────────────

const statusStyle: Record<string, string> = {
  in_progress: 'bg-primary-50 text-primary-olive',
  pending:     'bg-amber-50 text-amber-700',
  submitted:   'bg-teal-50 text-teal-700',
  approved:    'bg-emerald-50 text-emerald-700',
  rework:      'bg-orange-50 text-orange-700',
  completed:   'bg-primary-50 text-primary-olive',
}

const taskTrendData = [
  { month: 'Nov', completed: 3, rework: 1 },
  { month: 'Dec', completed: 5, rework: 0 },
  { month: 'Jan', completed: 4, rework: 2 },
  { month: 'Feb', completed: 6, rework: 1 },
  { month: 'Mar', completed: 7, rework: 0 },
  { month: 'Apr', completed: 5, rework: 1 },
  { month: 'May', completed: 4, rework: 0 },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmployeeDashboard() {
  const navigate = useNavigate()
  const [apiTasks, setApiTasks] = useState<TaskApi[]>([])
  const [projects, setProjects] = useState<Record<string, string>>({})

  useEffect(() => {
    taskApi.getMyTasks({ size: 100 })
      .then(p => {
        setApiTasks(p.content)
        
        // Build project map from tasks if needed
        const pMap: Record<string, string> = {}
        p.content.forEach(t => {
          if (t.projectName) pMap[t.projectId] = t.projectName
        })
        setProjects(pMap)
      })
      .catch(() => {
         console.error('Failed to load dashboard tasks')
         setApiTasks([])
      })
  }, [])

  const totalTasks     = apiTasks.length
  const inProgress     = apiTasks.filter(t => t.status === 'IN_PROGRESS').length
  const completed      = apiTasks.filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED').length
  const pendingReview  = apiTasks.filter(t => t.status === 'SUBMITTED' || t.status === 'UNDER_REVIEW').length
  const reworkTasks    = apiTasks.filter(t => t.status === 'REWORK_REQUESTED')

  const displayTasks = apiTasks.slice(0, 4).map(t => ({
    id:       t.id,
    title:    t.taskName,
    project:  projects[t.projectId] || 'Assigned Project',
    due:      t.plannedEndDate,
    status:   t.status.toLowerCase().replace('_', '_') as string,
    progress: t.status === 'COMPLETED' || t.status === 'APPROVED' ? 100
            : t.status === 'SUBMITTED' || t.status === 'UNDER_REVIEW' ? 100
            : t.status === 'IN_PROGRESS' ? 50 : 0,
  }))

  const upcomingDeadlines = apiTasks
    .filter(t => t.status !== 'COMPLETED' && t.status !== 'APPROVED')
    .sort((a, b) => new Date(a.plannedEndDate).getTime() - new Date(b.plannedEndDate).getTime())
    .slice(0, 3)
    .map(t => {
      const diff = Math.ceil((new Date(t.plannedEndDate).getTime() - Date.now()) / 86_400_000)
      return { id: t.id, task: t.taskName, date: t.plannedEndDate, daysLeft: diff }
    })

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Stat Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="My Tasks"
          value={totalTasks}
          subtitle={`${inProgress} in progress`}
          trend={{ value: 8, positive: true }}
          accentColor="#40521B"
          gradientFrom="#40521B"
          gradientTo="#556F1F"
          image={myTaskImg}
          imageAlt="My Tasks"
          href={PATHS.EMPLOYEE_TASKS}
        />
        <StatCard
          title="Completed"
          value={completed}
          subtitle="Total completed"
          trend={{ value: 15, positive: true }}
          accentColor="#0F766E"
          gradientFrom="#0F766E"
          gradientTo="#2D9A92"
          image={completeProjectImg}
          imageAlt="Completed"
          href={PATHS.EMPLOYEE_TASKS}
        />
        <StatCard
          title="Pending Review"
          value={pendingReview}
          subtitle="Awaiting approval"
          trend={{ value: 3, positive: false }}
          accentColor="#B45309"
          gradientFrom="#B45309"
          gradientTo="#D97706"
          image={pendingApprovalImg}
          imageAlt="Pending Review"
          href={PATHS.EMPLOYEE_TASKS}
        />
        <StatCard
          title="Performance"
          value="88%"
          subtitle="Above team average"
          trend={{ value: 5, positive: true }}
          accentColor="#40521B"
          gradientFrom="#40521B"
          gradientTo="#556F1F"
          image={performanceImg}
          imageAlt="Performance"
          href={PATHS.EMPLOYEE_PERFORMANCE}
        />
      </div>

      {/* ── Charts + Tasks ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Task Activity Chart */}
        <Card className="lg:col-span-2 group transition-all duration-500 hover:shadow-premium-hover">
          <CardHeader 
            title="Task Activity" 
            subtitle="Completed vs rework — last 7 months" 
            icon={
              <img 
                src={projectActivityImg} 
                className="w-14 h-14 object-contain brightness-110 saturate-110 transition-all duration-700 ease-out group-hover:scale-150 group-hover:-translate-y-2 group-hover:rotate-3 group-hover:drop-shadow-2xl" 
              />
            } 
          />
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={taskTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-light)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-light)' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'var(--color-surface-hover)', radius: 8 }}
                  contentStyle={{ background: '#fff', border: '1px solid var(--color-surface-border)', borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="completed" name="Completed" fill="#40521B" radius={[6, 6, 0, 0]} />
                <Bar dataKey="rework"    name="Rework"    fill="#B45309" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="group transition-all duration-500 hover:shadow-premium-hover">
          <CardHeader title="Upcoming Deadlines" subtitle="Sorted by urgency" icon={<Calendar size={16} />} />
          <div className="space-y-3 mt-4">
            {upcomingDeadlines.length === 0 ? (
               <p className="text-center py-10 text-text-light text-xs italic">No upcoming deadlines</p>
            ) : upcomingDeadlines.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3.5 rounded-xl bg-surface-hover border border-surface-border">
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold text-text-dark truncate">{d.task}</p>
                  <p className="text-[10px] text-text-light font-medium mt-0.5">{d.date}</p>
                </div>
                <span className={cn('text-[11px] font-black px-2.5 py-1 rounded-full ml-2 shrink-0',
                  d.daysLeft <= 2 ? 'bg-red-100 text-red-600' : d.daysLeft <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-primary-50 text-primary-olive')}>
                  {d.daysLeft < 0 ? 'Overdue' : `${d.daysLeft}d left`}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── My Tasks List ───────────────────────────────────────────── */}
      <Card className="group transition-all duration-500 hover:shadow-premium-hover">
        <CardHeader
          title="My Tasks"
          subtitle="Tasks assigned to you"
          icon={
            <img 
              src={myTaskImgFull} 
              className="w-14 h-14 object-contain brightness-110 saturate-110 transition-all duration-700 ease-out group-hover:scale-150 group-hover:-translate-y-2 group-hover:rotate-3 group-hover:drop-shadow-2xl" 
            />
          }
          action={
            <button onClick={() => navigate(PATHS.EMPLOYEE_TASKS)}
              className="text-[11px] font-bold text-primary-olive hover:underline">
              View all →
            </button>
          }
        />
        <div className="space-y-3">
          {displayTasks.length === 0 ? (
            <p className="text-center py-10 text-text-light text-xs italic">No tasks assigned yet</p>
          ) : displayTasks.map(t => (
            <div key={t.id}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-hover transition-colors border border-transparent hover:border-surface-border cursor-pointer"
              onClick={() => navigate(PATHS.EMPLOYEE_TASKS)}
            >
              <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
                <ClipboardList size={15} className="text-primary-olive" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-[13px] font-bold text-text-dark truncate">{t.title}</p>
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0', statusStyle[t.status] || 'bg-gray-50')}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <ProgressBar value={t.progress} />
                  </div>
                  <span className="text-[11px] font-bold text-text-light shrink-0">{t.progress}%</span>
                </div>
                <p className="text-[10px] text-text-light font-medium mt-1">{t.project} · Due {t.due}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Rework Alert ────────────────────────────────────────────── */}
      {reworkTasks.length > 0 && (
        <Card className="border-none bg-orange-50 shadow-sm">
          <div className="flex items-start gap-4 p-4 md:p-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-orange-600 md:hidden" />
              <AlertCircle size={24} className="text-orange-600 hidden md:block" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-text-dark">
                {reworkTasks.length} Task{reworkTasks.length > 1 ? 's' : ''} Sent Back for Rework
              </h3>
              <p className="text-xs text-text-light mt-1 font-medium">
                Review the rework notes and resubmit before the deadline.
              </p>
              <button onClick={() => navigate(PATHS.EMPLOYEE_TASKS)}
                className="mt-3 text-xs font-bold text-primary-olive hover:underline">
                Go to My Tasks →
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Submission Reminder (when no rework) ────────────────────── */}
      {reworkTasks.length === 0 && pendingReview === 0 && inProgress > 0 && (
        <Card className="border-none bg-amber-50 shadow-sm">
          <div className="flex items-start gap-4 p-4 md:p-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-amber-600 md:hidden" />
              <AlertCircle size={24} className="text-amber-600 hidden md:block" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-text-dark">Task Submission Reminder</h3>
              <p className="text-xs text-text-light mt-1 font-medium">
                You have {inProgress} task{inProgress > 1 ? 's' : ''} in progress. Upload your work files and submit before the deadline.
              </p>
              <button onClick={() => navigate(PATHS.EMPLOYEE_TASKS)}
                className="mt-3 text-xs font-bold text-primary-olive hover:underline">
                Go to My Tasks →
              </button>
            </div>
          </div>
        </Card>
      )}

    </div>
  )
}



