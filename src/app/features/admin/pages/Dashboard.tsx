// src/features/admin/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  ChevronRight,
  FolderKanban,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

import projectsImg from '@/shared/assets/sidebar/projects.png'
import tasksImg from '@/shared/assets/sidebar/task_wbs.png'
import approvalsImg from '@/shared/assets/sidebar/approvals.png'
import staffImg from '@/shared/assets/sidebar/user.png'
import teamImg from '@/shared/assets/sidebar/Team.png'
import completeProjectImg from '@/shared/assets/cards/complete-project.png'

import projectActivityImg from '@/shared/assets/projectActivity.png'
import taskDistributionImg from '@/shared/assets/taskDistribution.png'
import recentProjectImg from '@/shared/assets/recentProject.png'

import { Card, CardHeader } from '@/shared/components/ui/Card'
import { StatusBadge, PriorityBadge } from '@/shared/components/ui/Badge'
import { Avatar } from '@/shared/components/ui/Avatar'
import { PageLoader } from '@/shared/components/ui/Loader'
import { adminApi } from '../api/adminApi'
import { taskApi } from '../api/taskApi'
import type { Project, Employee, Task, TaskApi as TaskApiType } from '../model/types'
import { daysRemaining } from '@/shared/lib/date'
import { cn } from '@/shared/lib/cn'
import { PATHS } from '@/router/path'

/* -------------------------------------------------------------------------- */
/*                               Small helpers                                */
/* -------------------------------------------------------------------------- */

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function EmptyState({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="p-8 rounded-3xl border border-[#E5E7EB] bg-[#F8FAF5]/50 text-center">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#6B7F3A] shadow-sm">
        {icon ?? <FolderKanban size={20} />}
      </div>
      <p className="mt-3 text-sm font-black text-[#111827]">{title}</p>
      {subtitle && <p className="mt-1 text-xs text-[#6B7280] font-semibold">{subtitle}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   Cards                                    */
/* -------------------------------------------------------------------------- */

type StatTone = 'olive' | 'teal' | 'amber' | 'slate' | 'indigo'

const TONES: Record<
  StatTone,
  { accent: string; bg: string; text: string }
> = {
  olive: {
    accent: '#6B7F3A',
    bg: '#F8FAF5',
    text: '#4B5A2A',
  },
  teal: {
    accent: '#0D9488',
    bg: '#F0FDFA',
    text: '#0F766E',
  },
  amber: {
    accent: '#D97706',
    bg: '#FFFBEB',
    text: '#92400E',
  },
  slate: {
    accent: '#4B5563',
    bg: '#F9FAFB',
    text: '#111827',
  },
  indigo: {
    accent: '#4F46E5',
    bg: '#EEF2FF',
    text: '#3730A3',
  },
}

function StatCard({
  title,
  value,
  subtitle,
  trend,
  tone = 'olive',
  image,
  href,
}: {
  title: string
  value: string | number
  subtitle: string
  trend?: { value: number; positive: boolean }
  tone?: StatTone
  image: string
  href: string
}) {
  const navigate = useNavigate()
  const t = TONES[tone]

  return (
    <Card
      padding="none"
      onClick={() => navigate(href)}
      className="flex flex-col group h-full relative overflow-hidden transition-all duration-500 hover:shadow-premium-hover hover:-translate-y-1.5"
    >
      <div className="p-6 flex flex-col h-full relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-text-light tracking-[0.2em] uppercase">
              {title}
            </p>
            <h3 className="text-4xl font-black text-[#111827] tracking-tighter transition-all duration-500 group-hover:translate-x-1">
              {value}
            </h3>
          </div>
          
          {/* Enhanced 3D Icon - Reactive Hover */}
          <div className="relative w-18 h-18 flex items-center justify-center pointer-events-none">
            <img 
              src={image} 
              alt={title} 
              className={cn(
                "w-16 h-16 object-contain transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) brightness-125 saturate-110",
                "opacity-100 scale-110 group-hover:scale-150 group-hover:-translate-y-3 group-hover:rotate-6",
                "drop-shadow-[0_15px_20px_rgba(0,0,0,0.1)] group-hover:drop-shadow-[0_30px_45px_rgba(0,0,0,0.25)]"
              )} 
            />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {trend && (
              <span
                className={cn(
                  'flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all duration-500',
                  trend.positive ? 'bg-[#F0FDF4] text-[#166534]' : 'bg-[#FEF2F2] text-[#991B1B]',
                  'group-hover:ring-1 group-hover:ring-offset-1',
                  trend.positive ? 'group-hover:ring-[#166534]/20' : 'group-hover:ring-[#991B1B]/20'
                )}
              >
                {trend.positive ? <ArrowUpRight size={10} className="mr-0.5" /> : <ArrowDownRight size={10} className="mr-0.5" />}
                {trend.value}%
              </span>
            )}
            <p className="text-[11px] font-semibold text-[#6B7280] truncate leading-none pt-0.5 group-hover:text-[#111827] transition-colors">{subtitle}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#F3F5EE] flex items-center justify-center text-[#6B7F3A] opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0 shadow-sm border border-[#E5E7EB]">
            <ChevronRight size={18} strokeWidth={3} />
          </div>
        </div>
      </div>
      
      {/* Dynamic background glow on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-1000"
        style={{ background: `radial-gradient(circle at top right, ${t.accent}, transparent 70%)` }}
      />
      
      <div className="h-1.5 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundColor: t.accent }} />
    </Card>
  )
}

function ProgressBar({
  value,
  color = '#6B7F3A',
  size = 'md',
}: {
  value: number
  color?: string
  size?: 'sm' | 'md'
}) {
  return (
    <div className={cn('w-full bg-[#F3F5EE] rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2')}>
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%`, backgroundColor: color }}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   Charts                                   */
/* -------------------------------------------------------------------------- */

const projectTrendData = [
  { month: 'Nov', active: 4, completed: 2 },
  { month: 'Dec', active: 5, completed: 3 },
  { month: 'Jan', active: 6, completed: 2 },
  { month: 'Feb', active: 7, completed: 4 },
  { month: 'Mar', active: 6, completed: 5 },
  { month: 'Apr', active: 8, completed: 3 },
  { month: 'May', active: 6, completed: 4 },
]

/* -------------------------------------------------------------------------- */
/*                                 Dashboard                                  */
/* -------------------------------------------------------------------------- */

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const mapTask = (t: TaskApiType, pMap: Record<string, string>): Task => {
      const statusMap: Record<string, Task['status']> = {
        ASSIGNED: 'pending',
        IN_PROGRESS: 'in_progress',
        UNDER_REVIEW: 'submitted',
        REWORK_REQUESTED: 'rework',
        COMPLETED: 'completed',
      }

      const priorityMap: Record<string, Task['priority']> = {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
        URGENT: 'critical',
      }

      const st = statusMap[String(t.status)] ?? 'pending'

      const progress =
        String(t.status) === 'COMPLETED'
          ? 100
          : String(t.status) === 'SUBMITTED' || String(t.status) === 'UNDER_REVIEW'
            ? 100
            : String(t.status) === 'IN_PROGRESS'
              ? 50
              : 0

      return {
        id: t.id,
        title: t.taskName,
        description: t.description,
        projectId: t.projectId,
        projectName: pMap[t.projectId] || t.projectId,
        assignedTo: t.assignedTo.name,
        assignedToId: t.assignedTo.id,
        status: st,
        priority: priorityMap[String(t.priority)] ?? 'medium',
        startDate: t.plannedStartDate,
        dueDate: t.plannedEndDate,
        progress,
        wbsCode: t.jobNumber,
        level: 1,
        estimatedHours: t.plannedEffortsHours,
        actualHours: t.actualEffortsHours,
        tags: [String(t.category || '').toLowerCase()].filter(Boolean),
      }
    }

    const normalizeProjectType = (type: unknown): Project['type'] => {
      const normalized = String(type ?? '').toUpperCase()
      return normalized === 'BIG' || normalized === 'SMALL' ? normalized : undefined
    }

    const mapProject = (project: any): Project => ({
      ...project,
      type: normalizeProjectType(project.type),
    })

    setLoading(true)

    Promise.all([adminApi.getProjects(), adminApi.getEmployees(), taskApi.getTasks({ size: 200 })])
      .then(([p, e, taskPage]) => {
        setProjects(p.map(mapProject))
        setEmployees(e)

        const pMap: Record<string, string> = {}
        p.forEach(pj => {
          pMap[pj.id] = pj.name
        })

        setTasks(taskPage.content.map(t => mapTask(t, pMap)))
      })
      .finally(() => setLoading(false))
  }, [])

  const EMP_PATH =
    (PATHS as any).ADMIN_EMPLOYEE ?? (PATHS as any).ADMIN_EMPLOYEES ?? '/admin/employees'

  const derived = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'PLANNING' || p.status === 'REWORK').length
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length

    const activeEmployees = employees.filter(e => e.status === 'ACTIVE').length
    const pendingApprovals = tasks.filter(t => t.status === 'submitted').length
    
    // Running Tasks = Assigned + In Progress + Under Review + Rework
    const inProgressTasks = tasks.filter(t => 
      ['pending', 'in_progress', 'submitted', 'rework'].includes(t.status)
    ).length
    
    const presentStaff = activeEmployees // Using active staff as "present" for now

    const recentProjects = [...projects]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

    const topPerformers = [...employees]
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 4)

    const submittedTasks = tasks.filter(t => t.status === 'submitted').slice(0, 6)

    const statusCounts = {
      completed: tasks.filter(t => t.status === 'completed').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      submitted: tasks.filter(t => t.status === 'submitted').length,
      rework: tasks.filter(t => t.status === 'rework').length,
      pending: tasks.filter(t => t.status === 'pending').length,
    }

    const taskStatusData = [
      { name: 'Completed', value: statusCounts.completed, color: '#6B7F3A' },
      { name: 'In Progress', value: statusCounts.in_progress, color: '#A3B18A' },
      { name: 'Submitted', value: statusCounts.submitted, color: '#0D9488' },
      { name: 'Rework', value: statusCounts.rework, color: '#D97706' },
      { name: 'Pending', value: statusCounts.pending, color: '#9CA3AF' },
    ].filter(x => x.value > 0)

    return {
      activeProjects,
      completedProjects,
      activeEmployees,
      presentStaff,
      pendingApprovals,
      inProgressTasks,
      recentProjects,
      topPerformers,
      submittedTasks,
      taskStatusData,
    }
  }, [projects, employees, tasks])

  if (loading) return <PageLoader />

  return (
    <div className="animate-fade-in pb-12">
      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
        <StatCard
          title="Total Projects"
          value={projects.length}
          subtitle={`${derived.activeProjects} active currently`}
          trend={{ value: 12, positive: true }}
          tone="olive"
          image={projectsImg}
          href={PATHS.ADMIN_PROJECTS}
        />
        <StatCard
          title="Running Tasks"
          value={derived.inProgressTasks}
          subtitle="Currently in progress"
          trend={{ value: 8, positive: true }}
          tone="teal"
          image={tasksImg}
          href={PATHS.ADMIN_TASKS}
        />
        <StatCard
          title="Staff Present"
          value={derived.presentStaff}
          subtitle="Active members today"
          trend={{ value: 2, positive: true }}
          tone="slate"
          image={teamImg}
          href={PATHS.ADMIN_ATTENDANCE}
        />
        <StatCard
          title="Pending Approvals"
          value={derived.pendingApprovals}
          subtitle="Review required"
          trend={{ value: 3, positive: false }}
          tone="amber"
          image={approvalsImg}
          href={PATHS.ADMIN_APPROVALS}
        />
        <StatCard
          title="Total Staff"
          value={employees.length}
          subtitle="Registered studio members"
          trend={{ value: 5, positive: true }}
          tone="indigo"
          image={staffImg}
          href={EMP_PATH}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Activity Chart */}
        <Card className="lg:col-span-2 group transition-all duration-500 hover:shadow-premium-hover">
          <CardHeader
            title="Project Activity"
            subtitle="PERFORMANCE METRICS"
            icon={
              <img 
                src={projectActivityImg} 
                className="w-14 h-14 object-contain brightness-110 saturate-110 transition-all duration-700 ease-out group-hover:scale-140 group-hover:-translate-y-2 group-hover:rotate-3 group-hover:drop-shadow-2xl" 
              />
            }
          />
          <div className="p-2">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={projectTrendData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 700 }} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 700 }} 
                  axisLine={false} 
                  tickLine={false} 
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: '#F8FAF5', radius: 12 }}
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: 16,
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
                    padding: '12px 16px',
                  }}
                  itemStyle={{ fontSize: 12, fontWeight: 700, padding: '2px 0' }}
                />
                <Legend 
                  iconType="circle" 
                  iconSize={8} 
                  wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 24, color: '#6B7280' }} 
                />
                <Bar dataKey="active" name="Active" fill="#6B7F3A" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="completed" name="Completed" fill="#A3B18A" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Task Status Chart */}
        <Card className="flex flex-col group transition-all duration-500 hover:shadow-premium-hover">
          <CardHeader 
            title="Task Distribution" 
            subtitle="WORKLOAD OVERVIEW" 
            icon={
              <img 
                src={taskDistributionImg} 
                className="w-14 h-14 object-contain brightness-110 saturate-110 transition-all duration-700 ease-out group-hover:scale-140 group-hover:-translate-y-2 group-hover:-rotate-3 group-hover:drop-shadow-2xl" 
              />
            } 
          />
          <div className="flex-1 p-2 flex flex-col justify-center">
            {derived.taskStatusData.length === 0 ? (
              <EmptyState
                title="No tasks available"
                subtitle="Start by creating tasks for your projects."
                icon={<TrendingUp size={20} />}
                action={
                  <Link
                    to={PATHS.ADMIN_TASKS}
                    className="px-6 py-2.5 rounded-xl bg-[#6B7F3A] text-white text-xs font-black shadow-lg shadow-[#6B7F3A]/20 transition-all hover:-translate-y-0.5"
                  >
                    Manage Tasks
                  </Link>
                }
              />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={derived.taskStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={100}
                      paddingAngle={10}
                      dataKey="value"
                      stroke="none"
                    >
                      {derived.taskStatusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: 16,
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-2 gap-2 mt-8">
                  {derived.taskStatusData.map(item => (
                    <div key={item.name} className="flex items-center gap-2 p-2 rounded-2xl bg-[#F8FAF5] border border-transparent hover:border-[#E5E7EB] transition-all">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-[#6B7280] uppercase truncate">{item.name}</span>
                        <span className="text-sm font-black text-[#111827] leading-none">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Recent Projects */}
        <Card className="lg:col-span-2 overflow-hidden group transition-all duration-500 hover:shadow-premium-hover">
          <CardHeader
            title="Recent Projects"
            subtitle="PROJECT TIMELINE"
            icon={
              <img 
                src={recentProjectImg} 
                className="w-14 h-14 object-contain brightness-110 saturate-110 transition-all duration-700 ease-out group-hover:scale-140 group-hover:-translate-y-2 group-hover:rotate-2 group-hover:drop-shadow-2xl" 
              />
            }
            action={
              <Link to={PATHS.ADMIN_PROJECTS} className="text-[11px] text-[#6B7F3A] hover:underline font-black flex items-center gap-1">
                VIEW ALL <ChevronRight size={14} />
              </Link>
            }
          />

          <div className="divide-y divide-[#F1F5F9]">
            {derived.recentProjects.length === 0 ? (
              <EmptyState
                title="No recent projects"
                subtitle="Your latest projects will show up here."
                icon={<Building2 size={20} />}
              />
            ) : (
              derived.recentProjects.map(project => {
                const days = daysRemaining(project.endDate)
                return (
                  <div
                    key={project.id}
                    className="group flex items-center gap-4 py-4 px-2 first:pt-0 last:pb-0 transition-all hover:bg-[#F8FAF5]/50 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <Building2 size={20} className="text-[#6B7F3A]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="text-sm font-black text-[#111827] truncate">{project.name}</p>
                        <StatusBadge status={project.status} />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <ProgressBar value={project.progress} size="sm" />
                        </div>
                        <span className="text-[10px] font-black text-text-light shrink-0 w-8">{project.progress}%</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 min-w-25">
                      <PriorityBadge priority={project.priority} />
                      <p
                        className={cn(
                          'text-[9px] font-bold mt-1.5 uppercase tracking-tighter',
                          days < 0 ? 'text-[#991B1B]' : days < 30 ? 'text-[#92400E]' : 'text-text-light'
                        )}
                      >
                        {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d remaining`}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>

        {/* Performance & Top Performers */}
        <Card className="flex flex-col group transition-all duration-500 hover:shadow-premium-hover">
          <CardHeader 
            title="Team Performance" 
            subtitle="LEADERBOARD" 
            icon={
              <img 
                src={teamImg} 
                className="w-12 h-12 object-contain brightness-110 transition-all duration-700 ease-out group-hover:scale-140 group-hover:-translate-y-2 group-hover:rotate-3 group-hover:drop-shadow-2xl" 
              />
            } 
          />

          <div className="space-y-6">
            <div className="p-5 rounded-3xl bg-linear-to-br from-[#4B5A2A] to-[#6B7F3A] text-white shadow-md flex items-center gap-4 group cursor-pointer transition-all duration-500 hover:shadow-xl hover:scale-[1.02]">
              <div className="w-16 h-16 flex items-center justify-center shrink-0">
                <img 
                  src={completeProjectImg} 
                  alt="Completed" 
                  className="w-14 h-14 object-contain brightness-200 transition-all duration-700 ease-out group-hover:scale-150 group-hover:rotate-6 group-hover:drop-shadow-2xl" 
                />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-white/70 uppercase tracking-widest leading-none mb-1.5">
                  TOTAL SUCCESS
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black">{derived.completedProjects}</span>
                  <span className="text-[11px] font-bold text-white/60">Projects</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black text-text-light uppercase tracking-widest mb-2">
                TOP PERFORMERS
              </p>

              {derived.topPerformers.length === 0 ? (
                <EmptyState title="No performance data" subtitle="Tracking will begin as tasks complete." icon={<Users size={20} />} />
              ) : (
                derived.topPerformers.map((emp, idx) => (
                  <div key={emp.id} className="flex items-center gap-3 p-2.5 rounded-2xl border border-transparent hover:border-[#E5E7EB] hover:bg-[#F8FAF5] transition-all group">
                    <Avatar name={initials(emp.name)} size="sm" className="ring-2 ring-white shadow-sm border border-[#E5E7EB]" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-black text-[#111827] truncate group-hover:text-[#6B7F3A] transition-colors">{emp.name}</p>
                        <span className="text-[11px] font-black text-[#6B7F3A]">{emp.performanceScore}%</span>
                      </div>
                      <ProgressBar
                        value={emp.performanceScore}
                        size="sm"
                        color={idx === 0 ? '#D97706' : '#6B7F3A'}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Approvals Banner */}
      {derived.submittedTasks.length > 0 && (
        <div className="mt-10 rounded-4xl bg-[#F8FAF5] border border-[#E5E7EB] p-8 flex flex-col md:flex-row items-center gap-10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#6B7F3A]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="w-24 h-24 rounded-4xl bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0 shadow-soft group-hover:scale-105 transition-transform duration-500">
            <AlertCircle size={44} className="text-[#D97706]" />
          </div>

          <div className="flex-1 text-center md:text-left relative z-10">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-md bg-[#FFFBEB] text-[#D97706] text-[9px] font-black tracking-widest uppercase border border-[#FEF3C7]">
                ATTENTION REQUIRED
              </span>
            </div>
            <h3 className="text-2xl font-black text-[#111827] mb-2 tracking-tight">Pending Approvals</h3>
            <p className="text-[13px] text-[#6B7280] font-semibold max-w-xl leading-relaxed">
              There are <span className="text-[#111827] font-black underline decoration-[#D97706]/30">{derived.submittedTasks.length} tasks</span> awaiting your professional review. Keep the momentum going.
            </p>
            
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-2.5">
              {derived.submittedTasks.slice(0, 3).map(task => (
                <div key={task.id} className="px-4 py-2 bg-white rounded-2xl border border-[#E5E7EB] flex items-center gap-2 shadow-sm group-hover:border-[#6B7F3A]/30 transition-colors">
                  <Zap size={14} className="text-[#D97706]" />
                  <span className="text-[11px] font-black text-[#111827]">{task.title}</span>
                </div>
              ))}
              {derived.submittedTasks.length > 3 && (
                <div className="px-4 py-2 bg-[#F3F5EE] rounded-2xl border border-transparent flex items-center justify-center">
                  <span className="text-[10px] font-black text-[#6B7F3A]">+{derived.submittedTasks.length - 3} OTHERS</span>
                </div>
              )}
            </div>
          </div>

          <Link
            to={PATHS.ADMIN_APPROVALS}
            className="px-10 py-4 rounded-2xl bg-[#111827] text-white text-[13px] font-black shadow-xl shadow-[#111827]/10 hover:shadow-2xl hover:bg-[#6B7F3A] transition-all duration-500 hover:-translate-y-1 relative z-10"
          >
            REVIEW ALL
          </Link>
        </div>
      )}
    </div>
  )
}
