import { useState, useEffect, useMemo } from 'react'
import { 
  AreaChart, Area, Tooltip, ResponsiveContainer
} from 'recharts'
import { 
  Download, Search, Briefcase, TrendingUp, Clock, 
  Building2, Loader2,
  CheckCircle2, AlertCircle, PlayCircle, History,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { Modal } from '@/shared/components/ui/Modal'
import { DataTable, type Column } from '@/shared/components/table/DataTable'
import { cn } from '@/shared/lib/cn'
import { useAuthStore } from '@/store'
import { reportsApi } from '@/features/admin/api/reportsApi'
import { formatDate } from '@/shared/lib/date'
import type { 
  DateRangePreset, 
  ProjectReportResponse,
  EmployeeWorkReportResponse,
  EmployeePerformanceReportResponse,
  EmployeePipelineReportResponse,
} from '@/features/admin/model/types'
import { toast } from 'sonner'

// ─── Constants ───────────────────────────────────────────────────────────────

const PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: 'TODAY',      label: 'Today' },
  { id: 'THIS_WEEK',   label: 'This Week' },
  { id: 'THIS_MONTH',  label: 'This Month' },
  { id: 'THIS_YEAR',   label: 'This Year' },
]

type ReportTab = 'projects' | 'work' | 'pipeline' | 'performance'

// ─── Project Detail Modal ───────────────────────────────────────────────────

function ProjectReportDetailModal({ id, preset, onClose }: { id: string; preset: DateRangePreset; onClose: () => void }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reportsApi.getProjectDetail(id, { preset })
      .then(setData)
      .catch(() => toast.error('Failed to load project intelligence'))
      .finally(() => setLoading(false))
  }, [id, preset])

  return (
    <Modal open onClose={onClose} size="xl" title="Project Intelligence Report" subtitle="Granular Execution Analysis" icon={<Building2 size={20} className="text-primary-olive" />}>
      {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-olive" /></div> : (
        <div className="space-y-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 bg-[#F8FAF5] rounded-3xl border border-[#40521B]/5">
                 <p className="text-[9px] font-black text-primary-olive/60 uppercase mb-1">Completion</p>
                 <p className="text-2xl font-black text-[#111827]">{Math.min(100, Math.round(data.completionPercentage * 100))}%</p>
              </div>
              <div className="p-5 bg-white rounded-3xl border border-surface-border">
                 <p className="text-[9px] font-black text-text-light uppercase mb-1">Total Tasks</p>
                 <p className="text-2xl font-black text-[#111827]">{data.totalTasks}</p>
              </div>
              <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100">
                 <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">Completed</p>
                 <p className="text-2xl font-black text-emerald-700">{data.completedTasks}</p>
              </div>
              <div className="p-5 bg-rose-50 rounded-3xl border border-rose-100">
                 <p className="text-[9px] font-black text-rose-600 uppercase mb-1">Delayed</p>
                 <p className="text-2xl font-black text-rose-700">{data.delayedTasksCount}</p>
              </div>
           </div>
           <div className="p-8 bg-[#111827] rounded-[40px] text-white">
              <h4 className="text-xs font-black uppercase tracking-widest mb-6 opacity-40">Progress Trajectory</h4>
              <div className="h-[240px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { name: 'Initial', val: 0 },
                      { name: 'Target', val: Math.min(100, data.completionPercentage * 100) },
                      { name: 'Final', val: 100 }
                    ]}>
                       <Area type="monotone" dataKey="val" stroke="#40521B" fill="#40521B" fillOpacity={0.2} strokeWidth={4} />
                       <Tooltip />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
      )}
    </Modal>
  )
}

// ─── Employee Work Detail Modal ──────────────────────────────────────────────

function EmployeeWorkDetailModal({ user, onClose }: { user: EmployeeWorkReportResponse; onClose: () => void }) {
  const { report } = user
  return (
    <Modal open onClose={onClose} size="lg" title="Employee Work Breakdown" subtitle={user.userName} icon={<Zap size={20} className="text-primary-olive" />}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Planned Hours</p>
            <p className="text-xl font-black text-slate-700">{report.totalPlannedHours.toFixed(1)}h</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Actual Hours</p>
            <p className="text-xl font-black text-emerald-700">{report.totalActualHours.toFixed(1)}h</p>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-40">Task Breakdown by Status</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Completed', key: 'COMPLETED', color: 'emerald', icon: <CheckCircle2 size={12} /> },
              { label: 'Under Review', key: 'UNDER_REVIEW', color: 'blue', icon: <History size={12} /> },
              { label: 'Assigned', key: 'ASSIGNED', color: 'slate', icon: <PlayCircle size={12} /> },
              { label: 'Rework', key: 'REWORK_REQUESTED', color: 'rose', icon: <AlertCircle size={12} /> },
            ].map(s => (
              <div key={s.key} className={cn("p-3 rounded-xl border flex flex-col items-center justify-center gap-1", 
                s.color === 'emerald' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                s.color === 'blue' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                s.color === 'rose' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                'bg-slate-50 border-slate-100 text-slate-700'
              )}>
                {s.icon}
                <p className="text-[9px] font-black uppercase">{s.label}</p>
                <p className="text-lg font-black">{report.taskCountByStatus[s.key] || 0}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-40">Contributing Projects</h4>
          <div className="flex flex-wrap gap-2">
            {report.contributingProjects.length > 0 ? report.contributingProjects.map(p => (
              <Badge key={p} variant="neutral" className="px-3 py-1 text-[11px] font-bold border-primary-olive/20 text-primary-olive">{p}</Badge>
            )) : <p className="text-xs text-text-light italic">No projects recorded in this period</p>}
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReportDashboard() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<ReportTab>('projects')
  const [preset, setPreset] = useState<DateRangePreset>('THIS_MONTH')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [projectReports, setProjectReports] = useState<ProjectReportResponse[]>([])
  const [employeeWork, setEmployeeWork] = useState<EmployeeWorkReportResponse[]>([])
  const [employeePerf, setEmployeePerf] = useState<EmployeePerformanceReportResponse[]>([])
  const [employeePipe, setEmployeePipe] = useState<EmployeePipelineReportResponse[]>([])

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedWorkUser, setSelectedWorkUser] = useState<EmployeeWorkReportResponse | null>(null)

  const fetchData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const params = { preset }
      const [projects, work, perf, pipe] = await Promise.all([
        reportsApi.getProjectsSummary(params),
        reportsApi.getEmployeesWork(params),
        reportsApi.getEmployeesPerformance(params),
        reportsApi.getEmployeesPipeline()
      ])
      setProjectReports(projects)
      setEmployeeWork(work)
      setEmployeePerf(perf)
      setEmployeePipe(pipe)
    } catch {
      toast.error('Failed to load real-time analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [preset, user?.id])

  // ─── Table Columns ────────────────────────────────────────────────────────

  const projectColumns: Column<ProjectReportResponse>[] = [
    {
      key: 'projectName', header: 'Project Information',
      render: row => (
        <div>
          <p className="text-[13px] font-black text-text-dark leading-none">{row.projectName}</p>
          <p className="text-[9px] font-bold text-text-light uppercase tracking-widest mt-1.5">Job ID: {row.jobNumber}</p>
        </div>
      )
    },
    {
      key: 'tasks', header: 'Task Summary',
      render: row => (
        <div className="flex gap-4">
           <div><p className="text-[8px] font-black text-text-light uppercase mb-0.5">Total</p><p className="text-[11px] font-bold text-text-dark">{row.report.totalTasks}</p></div>
           <div><p className="text-[8px] font-black text-rose-600 uppercase mb-0.5">Delayed</p><p className="text-[11px] font-bold text-rose-600">{row.report.delayedTasksCount}</p></div>
           <div><p className="text-[8px] font-black text-emerald-600 uppercase mb-0.5">Complete</p><p className="text-[11px] font-bold text-emerald-600">{row.report.completedTasks}</p></div>
        </div>
      )
    },
    {
      key: 'completion', header: 'Completion %',
      render: row => {
        // Ensure score is under 100%
        const score = Math.min(100, Math.round(row.report.completionPercentage * 100))
        return (
          <div className="w-40">
            <div className="flex items-center justify-between mb-1.5">
               <span className="text-[10px] font-black text-primary-olive">{score}%</span>
            </div>
            <div className="h-2 w-full bg-surface-hover rounded-full overflow-hidden">
               <div className="h-full bg-primary-olive rounded-full transition-all duration-1000" style={{ width: `${score}%` }} />
            </div>
          </div>
        )
      }
    }
  ]

  const workColumns: Column<EmployeeWorkReportResponse>[] = [
    {
      key: 'userName', header: 'Employee',
      render: row => (
        <div>
          <p className="text-[13px] font-black text-text-dark leading-none">{row.userName}</p>
          <p className="text-[9px] font-bold text-text-light uppercase tracking-widest mt-1.5">{row.email}</p>
        </div>
      )
    },
    {
      key: 'status', header: 'Task Status Breakdown',
      render: row => {
        const counts = row.report.taskCountByStatus
        return (
          <div className="flex gap-2">
            <div className="flex flex-col items-center px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100 min-w-[64px]">
              <span className="text-[7px] font-black text-emerald-600 uppercase">Completed</span>
              <span className="text-[11px] font-black text-emerald-700">{counts['COMPLETED'] || 0}</span>
            </div>
            <div className="flex flex-col items-center px-2 py-1 bg-blue-50 rounded-lg border border-blue-100 min-w-[64px]">
              <span className="text-[7px] font-black text-blue-600 uppercase">Review</span>
              <span className="text-[11px] font-black text-blue-700">{counts['UNDER_REVIEW'] || 0}</span>
            </div>
            <div className="flex flex-col items-center px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 min-w-[64px]">
              <span className="text-[7px] font-black text-slate-600 uppercase">Assigned</span>
              <span className="text-[11px] font-black text-slate-700">{counts['ASSIGNED'] || 0}</span>
            </div>
            <div className="flex flex-col items-center px-2 py-1 bg-rose-50 rounded-lg border border-rose-100 min-w-[64px]">
              <span className="text-[7px] font-black text-rose-600 uppercase">Rework</span>
              <span className="text-[11px] font-black text-rose-700">{counts['REWORK_REQUESTED'] || 0}</span>
            </div>
          </div>
        )
      }
    },
    {
      key: 'plannedHours', header: 'Planned Hours',
      render: row => (
        <div className="flex flex-col">
          <p className="text-[12px] font-black text-text-dark">{row.report.totalPlannedHours.toFixed(1)}h</p>
          <p className="text-[8px] font-bold text-text-light uppercase">Planned</p>
        </div>
      )
    },
    {
      key: 'actualHours', header: 'Actual Hours',
      render: row => (
        <div className="flex flex-col">
          <p className="text-[12px] font-black text-text-dark">{row.report.totalActualHours.toFixed(1)}h</p>
          <p className={cn("text-[8px] font-black uppercase tracking-tighter", 
            row.report.effortVariance > 10 ? 'text-rose-600' : 'text-emerald-600'
          )}>
            Var: {row.report.effortVariance.toFixed(1)}%
          </p>
        </div>
      )
    },
    {
      key: 'projects', header: 'Project Contributions',
      render: row => (
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {row.report.contributingProjects.length > 0 ? (
            row.report.contributingProjects.slice(0, 3).map(p => (
              <Badge key={p} className="text-[8px] bg-slate-100 text-slate-600 border-none px-1.5 py-0.5">{p}</Badge>
            ))
          ) : (
             <span className="text-[10px] text-text-light italic">No contributions</span>
          )}
          {row.report.contributingProjects.length > 3 && (
            <span className="text-[8px] font-bold text-text-light self-center">+{row.report.contributingProjects.length - 3}</span>
          )}
        </div>
      )
    }
  ]

  const pipelineColumns: Column<EmployeePipelineReportResponse>[] = [
    {
      key: 'userName', header: 'Employee',
      render: row => (
        <div>
          <p className="text-[13px] font-black text-text-dark leading-none">{row.userName}</p>
          <p className="text-[9px] font-bold text-text-light uppercase tracking-widest mt-1.5">{row.email}</p>
        </div>
      )
    },
    {
      key: 'current', header: 'Current Task Engagement',
      render: row => {
        const t = row.report.currentTask
        if (!t) return <span className="text-[10px] font-bold text-text-light italic">No Active Task</span>
        return (
          <div className="max-w-xs">
            <div className="flex items-center gap-1.5 mb-1">
              <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black px-1 py-0 rounded">ACTIVE</Badge>
              <span className="text-[11px] font-black text-text-dark truncate">{t.taskName}</span>
            </div>
            <p className="text-[9px] font-bold text-text-light uppercase tracking-widest">
              {t.jobNumber} • {formatDate(t.plannedStartDate)} to {formatDate(t.plannedEndDate)}
            </p>
          </div>
        )
      }
    },
    {
      key: 'next', header: 'Next Assigned Task',
      render: row => {
        const t = row.report.nextScheduledTask
        if (!t) return <span className="text-[10px] font-bold text-text-light italic">Clear Pipeline</span>
        return (
          <div className="max-w-xs">
            <div className="flex items-center gap-1.5 mb-1">
              <Badge className="bg-blue-500 text-white border-none text-[8px] font-black px-1 py-0 rounded">UPCOMING</Badge>
              <span className="text-[11px] font-black text-text-dark truncate">{t.taskName}</span>
            </div>
            <p className="text-[9px] font-bold text-text-light uppercase tracking-widest">
              {t.jobNumber} • {formatDate(t.plannedStartDate)} to {formatDate(t.plannedEndDate)}
            </p>
          </div>
        )
      }
    }
  ]

  const performanceColumns: Column<EmployeePerformanceReportResponse>[] = [
    {
      key: 'userName', header: 'Employee',
      render: row => (
        <div>
          <p className="text-[13px] font-black text-text-dark leading-none">{row.userName}</p>
          <p className="text-[9px] font-bold text-text-light uppercase tracking-widest mt-1.5">{row.email}</p>
        </div>
      )
    },
    {
      key: 'efficiency', header: 'Efficiency Score',
      render: row => {
        const score = Math.min(100, Math.round(row.report.efficiencyScore))
        return (
          <div className="flex flex-col">
             <span className="text-lg font-black text-primary-olive">{score}%</span>
             <p className="text-[8px] font-black uppercase tracking-widest text-primary-olive/60">Execution Alpha</p>
          </div>
        )
      }
    },
    {
      key: 'quality', header: 'Quality (Reworks)',
      render: row => (
        <div className="flex items-center gap-2">
           <div className={cn("p-2 rounded-xl border", row.report.reworkCount > 3 ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-slate-50 border-slate-100 text-slate-600")}>
              <RotateCcw size={14} />
           </div>
           <div>
              <p className="text-[14px] font-black text-text-dark">{row.report.reworkCount}</p>
              <p className="text-[8px] font-black text-text-light uppercase">Total Reworks</p>
           </div>
        </div>
      )
    },
    {
      key: 'reliability', header: 'On-Time Rate',
      render: row => {
        const rate = Math.min(100, Math.round(row.report.onTimeDeliveryRate * 100))
        return (
          <div className="flex items-center gap-4">
             <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rate}%` }} />
             </div>
             <span className="text-[11px] font-black text-emerald-600">{rate}%</span>
          </div>
        )
      }
    }
  ]

  const filteredData = useMemo(() => {
    const s = search.toLowerCase()
    switch(activeTab) {
      case 'projects': 
        return projectReports.filter(p => p.projectName.toLowerCase().includes(s) || p.jobNumber.toLowerCase().includes(s))
      case 'work':
        return employeeWork.filter(e => e.userName.toLowerCase().includes(s) || e.email.toLowerCase().includes(s))
      case 'pipeline':
        return employeePipe.filter(e => e.userName.toLowerCase().includes(s) || e.email.toLowerCase().includes(s))
      case 'performance':
        return employeePerf.filter(e => e.userName.toLowerCase().includes(s) || e.email.toLowerCase().includes(s))
    }
  }, [activeTab, projectReports, employeeWork, employeePerf, employeePipe, search])

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Tabs Bar ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 p-1.5 bg-white/40 backdrop-blur-sm w-fit rounded-[24px] border border-white/40 shadow-sm overflow-x-auto no-scrollbar max-w-full">
        {[
          { id: 'projects', label: 'Projects', icon: <Briefcase size={14} /> },
          { id: 'work', label: 'Work Report', icon: <Clock size={14} /> },
          { id: 'pipeline', label: 'Pipeline', icon: <ArrowRight size={14} /> },
          { id: 'performance', label: 'Performance', icon: <TrendingUp size={14} /> },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as ReportTab); setSearch('') }} 
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap", 
              activeTab === tab.id ? "bg-white text-primary-olive shadow-md" : "text-text-light hover:text-text-dark"
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Main Report Card ────────────────────────────────────────────────── */}
      <Card padding="none" className="rounded-[32px] border-none shadow-premium overflow-hidden bg-white">
        <div className="p-4 border-b border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative w-64">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search report data..." 
                className="w-full pl-11 pr-4 h-10 bg-[#F9FAFB] rounded-xl border border-surface-border focus:ring-4 focus:ring-primary-olive/5 transition-all text-[12px] font-medium" 
              />
            </div>
            <div className="h-6 w-px bg-surface-border hidden md:block" />
            <div className="flex items-center gap-1.5 p-1 bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] overflow-x-auto no-scrollbar max-w-full">
              {PRESETS.map(p => (
                <button 
                  key={p.id} 
                  onClick={() => setPreset(p.id)} 
                  className={cn(
                    "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap", 
                    preset === p.id ? "bg-white text-primary-olive shadow-sm ring-1 ring-black/5" : "text-text-light hover:text-text-medium"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button 
              className="bg-primary-olive hover:bg-primary-700 text-white h-10 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary-olive/20 transition-all active:scale-95" 
              icon={<Download size={14} />}
            >
              Export Report
            </Button>
          </div>
        </div>

        {activeTab === 'projects' && (
          <DataTable 
            columns={projectColumns} 
            data={filteredData as ProjectReportResponse[]} 
            loading={loading} 
            rowKey={r => r.projectId} 
            onRowClick={r => setSelectedProjectId(r.projectId)}
            emptyMessage="No project data found for this period"
          />
        )}

        {activeTab === 'work' && (
          <DataTable 
            columns={workColumns} 
            data={filteredData as EmployeeWorkReportResponse[]} 
            loading={loading} 
            rowKey={r => r.userId} 
            onRowClick={r => setSelectedWorkUser(r)}
            emptyMessage="No work report data found for this period"
          />
        )}

        {activeTab === 'pipeline' && (
          <DataTable 
            columns={pipelineColumns} 
            data={filteredData as EmployeePipelineReportResponse[]} 
            loading={loading} 
            rowKey={r => r.userId} 
            emptyMessage="No pipeline data found for this period"
          />
        )}

        {activeTab === 'performance' && (
          <DataTable 
            columns={performanceColumns} 
            data={filteredData as EmployeePerformanceReportResponse[]} 
            loading={loading} 
            rowKey={r => r.userId} 
            emptyMessage="No performance data found for this period"
          />
        )}
      </Card>

      {selectedProjectId && (
        <ProjectReportDetailModal 
          id={selectedProjectId} 
          preset={preset} 
          onClose={() => setSelectedProjectId(null)} 
        />
      )}

      {selectedWorkUser && (
        <EmployeeWorkDetailModal 
          user={selectedWorkUser} 
          onClose={() => setSelectedWorkUser(null)} 
        />
      )}
    </div>
  )
}
