import { useState, useEffect, useMemo } from 'react'
import { 
  BarChart3, Users, LayoutDashboard, Target, 
  Calendar, Search, Download, Filter, 
  ChevronRight, ArrowUpRight, Clock, AlertCircle
} from 'lucide-react'
import { reportsApi } from '@/features/admin/api/reportsApi'
import { useAuthStore } from '@/store'
import { cn } from '@/shared/lib/cn'
import { formatDate } from '@/shared/lib/date'
import { DataTable, type Column } from '../table/DataTable'
import { Button } from '../ui/Button'
import { toast } from 'sonner'
import type { 
  ProjectReportResponse, 
  EmployeeWorkReportResponse, 
  EmployeePipelineReportResponse, 
  EmployeePerformanceReportResponse,
  DateRangePreset,
  DateRangeRequest
} from '@/features/admin/model/types'

type ReportType = 'PROJECTS' | 'WORK' | 'PIPELINE' | 'PERFORMANCE'

const PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: 'TODAY', label: 'Today' },
  { id: 'YESTERDAY', label: 'Yesterday' },
  { id: 'THIS_WEEK', label: 'This Week' },
  { id: 'LAST_WEEK', label: 'Last Week' },
  { id: 'THIS_MONTH', label: 'This Month' },
  { id: 'LAST_MONTH', label: 'Last Month' },
  { id: 'THIS_YEAR', label: 'This Year' },
]

export default function ReportDashboard() {
  const { user } = useAuthStore()
  const isHR = user?.roles?.includes('HR') ?? false
  
  const [activeTab, setActiveTab] = useState<ReportType>(isHR ? 'WORK' : 'PROJECTS')
  const [preset, setPreset] = useState<DateRangePreset>('THIS_MONTH')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  // Data states
  const [projectsData, setProjectsData] = useState<ProjectReportResponse[]>([])
  const [workData, setWorkData] = useState<EmployeeWorkReportResponse[]>([])
  const [pipelineData, setPipelineData] = useState<EmployeePipelineReportResponse[]>([])
  const [performanceData, setPerformanceData] = useState<EmployeePerformanceReportResponse[]>([])

  const fetchReport = async () => {
    setLoading(true)
    const params: DateRangeRequest = { preset }
    try {
      switch (activeTab) {
        case 'PROJECTS':
          const pData = await reportsApi.getProjectsSummary(params)
          setProjectsData(pData)
          break
        case 'WORK':
          const wData = await reportsApi.getEmployeesWork(params)
          setWorkData(wData)
          break
        case 'PIPELINE':
          const piData = await reportsApi.getEmployeesPipeline()
          setPipelineData(piData)
          break
        case 'PERFORMANCE':
          const perfData = await reportsApi.getEmployeesPerformance(params)
          setPerformanceData(perfData)
          break
      }
    } catch (err) {
      toast.error('Failed to fetch report data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [activeTab, preset])

  const filteredData = useMemo(() => {
    const s = search.toLowerCase()
    switch (activeTab) {
      case 'PROJECTS':
        return projectsData.filter(p => p.projectName.toLowerCase().includes(s) || p.jobNumber.toLowerCase().includes(s))
      case 'WORK':
        return workData.filter(w => w.userName.toLowerCase().includes(s) || w.email.toLowerCase().includes(s))
      case 'PIPELINE':
        return pipelineData.filter(p => p.userName.toLowerCase().includes(s) || p.email.toLowerCase().includes(s))
      case 'PERFORMANCE':
        return performanceData.filter(p => p.userName.toLowerCase().includes(s) || p.email.toLowerCase().includes(s))
      default:
        return []
    }
  }, [activeTab, search, projectsData, workData, pipelineData, performanceData])

  // ─── Column Definitions ───────────────────────────────────────────────────

  const projectColumns: Column<ProjectReportResponse>[] = [
    { key: 'projectName', header: 'Project Name', render: r => (
      <div className="flex flex-col">
        <span className="font-black text-text-dark">{r.projectName}</span>
        <span className="text-[10px] text-text-light uppercase tracking-tighter">ID: {r.projectId.slice(0, 8)}</span>
      </div>
    )},
    { key: 'jobNumber', header: 'Job Number', render: r => <span className="font-bold text-primary-olive">{r.jobNumber}</span> },
    { key: 'totalTasks', header: 'Total Tasks', render: r => <span className="font-black">{r.report.totalTasks}</span>, align: 'center' },
    { key: 'delayedTasks', header: 'Delayed', render: r => (
      <span className={cn("font-black", r.report.delayedTasksCount > 0 ? "text-rose-500" : "text-emerald-500")}>
        {r.report.delayedTasksCount}
      </span>
    ), align: 'center' },
    { key: 'completedTasks', header: 'Completed', render: r => <span className="font-black text-emerald-600">{r.report.completedTasks}</span>, align: 'center' },
    { key: 'percentage', header: 'Completion %', render: r => (
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
          <div 
            className="h-full bg-primary-olive rounded-full" 
            style={{ width: `${Math.round(r.report.completionPercentage * 100)}%` }} 
          />
        </div>
        <span className="text-xs font-black">{Math.round(r.report.completionPercentage * 100)}%</span>
      </div>
    ), align: 'right' },
  ]

  const workColumns: Column<EmployeeWorkReportResponse>[] = [
    { key: 'userName', header: 'Employee', render: r => (
      <div className="flex flex-col">
        <span className="font-black text-text-dark">{r.userName}</span>
        <span className="text-[10px] text-text-light uppercase tracking-tighter">{r.email}</span>
      </div>
    )},
    { key: 'completed', header: 'Complete', render: r => <span className="font-black text-emerald-600">{r.report.taskCountByStatus['COMPLETED'] || 0}</span>, align: 'center' },
    { key: 'underReview', header: 'Review', render: r => <span className="font-black text-blue-600">{r.report.taskCountByStatus['UNDER_REVIEW'] || 0}</span>, align: 'center' },
    { key: 'assigned', header: 'Assigned', render: r => <span className="font-black text-slate-500">{r.report.taskCountByStatus['ASSIGNED'] || 0}</span>, align: 'center' },
    { key: 'rework', header: 'Rework', render: r => <span className="font-black text-orange-500">{r.report.taskCountByStatus['REWORK_REQUESTED'] || 0}</span>, align: 'center' },
    { key: 'projects', header: 'Contributing Projects', render: r => (
      <div className="flex flex-wrap gap-1 max-w-xs">
        {r.report.contributingProjects.slice(0, 2).map(p => (
          <span key={p} className="px-2 py-0.5 bg-slate-100 text-[9px] font-bold rounded uppercase truncate">{p}</span>
        ))}
        {r.report.contributingProjects.length > 2 && (
          <span className="text-[9px] text-text-light font-bold">+{r.report.contributingProjects.length - 2} more</span>
        )}
      </div>
    )},
  ]

  const pipelineColumns: Column<EmployeePipelineReportResponse>[] = [
    { key: 'userName', header: 'Employee', render: r => (
      <div className="flex flex-col">
        <span className="font-black text-text-dark">{r.userName}</span>
        <span className="text-[10px] text-text-light uppercase tracking-tighter">{r.email}</span>
      </div>
    )},
    { key: 'currentTask', header: 'Current Task', render: r => r.report.currentTask ? (
      <div className="flex flex-col max-w-50">
        <span className="font-bold text-text-dark truncate">{r.report.currentTask.taskName}</span>
        <span className="text-[9px] text-primary-olive font-black uppercase">{r.report.currentTask.jobNumber}</span>
        <span className="text-[9px] text-text-light">{formatDate(r.report.currentTask.plannedStartDate)} → {formatDate(r.report.currentTask.plannedEndDate)}</span>
      </div>
    ) : <span className="text-[10px] text-text-light italic">No Active Task</span> },
    { key: 'nextTask', header: 'Next Scheduled', render: r => r.report.nextScheduledTask ? (
      <div className="flex flex-col max-w-50">
        <span className="font-bold text-text-dark truncate">{r.report.nextScheduledTask.taskName}</span>
        <span className="text-[9px] text-blue-500 font-black uppercase">{r.report.nextScheduledTask.jobNumber}</span>
        <span className="text-[9px] text-text-light">{formatDate(r.report.nextScheduledTask.plannedStartDate)} → {formatDate(r.report.nextScheduledTask.plannedEndDate)}</span>
      </div>
    ) : <span className="text-[10px] text-text-light italic">Queue Clear</span> },
  ]

  const performanceColumns: Column<EmployeePerformanceReportResponse>[] = [
    { key: 'userName', header: 'Employee', render: r => (
      <div className="flex flex-col">
        <span className="font-black text-text-dark">{r.userName}</span>
        <span className="text-[10px] text-text-light uppercase tracking-tighter">{r.email}</span>
      </div>
    )},
    { key: 'efficiency', header: 'Efficiency Score', render: r => (
      <div className="flex items-center gap-2">
        <div className={cn(
          "px-2 py-0.5 rounded text-[10px] font-black",
          r.report.efficiencyScore >= 80 ? "bg-emerald-100 text-emerald-700" :
          r.report.efficiencyScore >= 50 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
        )}>
          {Math.round(r.report.efficiencyScore)}%
        </div>
      </div>
    ), align: 'center' },
    { key: 'rework', header: 'Rework Count', render: r => <span className="font-black">{r.report.reworkCount}</span>, align: 'center' },
    { key: 'onTime', header: 'On-Time Delivery', render: r => (
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
          <div 
            className="h-full bg-blue-500 rounded-full" 
            style={{ width: `${Math.round(r.report.onTimeDeliveryRate * 100)}%` }} 
          />
        </div>
        <span className="text-xs font-black">{Math.round(r.report.onTimeDeliveryRate * 100)}%</span>
      </div>
    ), align: 'right' },
  ]

  const tabs = [
    { id: 'PROJECTS', label: 'Project Reports', icon: <BarChart3 size={16} />, hide: isHR },
    { id: 'WORK', label: 'Employee Work', icon: <Users size={16} /> },
    { id: 'PIPELINE', label: 'Staff Pipeline', icon: <LayoutDashboard size={16} /> },
    { id: 'PERFORMANCE', label: 'Performance', icon: <Target size={16} /> },
  ].filter(t => !t.hide)

  return (
    <div className="space-y-6 pb-10">
      
      {/* ── Refactored Navigation & Controls (Cylindrical Box) ─────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-2 bg-white border border-[#E5E7EB] rounded-4xl md:rounded-full shadow-sm mx-2">
        <div className="flex flex-wrap items-center gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ReportType)}
              className={cn(
                "flex items-center gap-2.5 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-full",
                activeTab === tab.id 
                  ? "bg-primary-olive text-white shadow-lg shadow-primary-olive/20" 
                  : "text-text-light hover:bg-slate-50 hover:text-text-medium"
              )}
            >
              <span className={cn(activeTab === tab.id ? "text-white" : "text-primary-olive")}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 px-4 lg:px-2 pb-2 lg:pb-0">
          {loading && (
            <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-bold text-primary-olive animate-pulse mr-2">
              <Clock size={10} /> Syncing...
            </div>
          )}
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-[#E5E7EB] rounded-full flex-1 sm:flex-none">
            <Calendar size={14} className="text-text-light ml-2" />
            <select 
              value={preset} 
              onChange={e => setPreset(e.target.value as any)}
              className="bg-transparent text-[10px] font-black text-text-dark outline-none pr-4 cursor-pointer uppercase tracking-wider w-full sm:w-auto"
            >
              {PRESETS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <Button 
            onClick={() => {/* export logic */}}
            icon={<Download size={14} />} 
            className="rounded-full h-10 px-6 bg-black hover:bg-black/90 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10"
          >
            Export
          </Button>
        </div>
      </div>

      {/* ── Table Container ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-4xl border border-[#E5E7EB] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reports by keyword..."
              className="w-full h-11 pl-11 pr-4 bg-slate-50 border-none rounded-2xl text-[13px] font-medium text-text-dark placeholder:text-text-light/60 focus:ring-2 focus:ring-primary-olive/10 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
             <div className="px-3 py-1.5 bg-primary-50 text-primary-olive text-[10px] font-black rounded-lg uppercase tracking-tighter">
               {filteredData.length} records found
             </div>
             <Button variant="ghost" className="w-10 h-10 p-0 rounded-xl border border-slate-100">
                <Filter size={14} />
             </Button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          loading={loading}
          data={filteredData}
          rowKey={(r: any) => r.projectId || r.userId}
          columns={
            activeTab === 'PROJECTS' ? projectColumns as any :
            activeTab === 'WORK' ? workColumns as any :
            activeTab === 'PIPELINE' ? pipelineColumns as any :
            performanceColumns as any
          }
          className="min-h-100"
          emptyMessage={`No ${activeTab.toLowerCase()} data available for this period.`}
        />
      </div>

      {/* ── Insights Footer ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
        <div className="p-6 bg-primary-50 rounded-[28px] border border-primary-100 flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary-olive shadow-sm group-hover:scale-110 transition-transform">
            <BarChart3 size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black text-primary-olive uppercase tracking-[0.2em] mb-0.5">Overall Efficiency</p>
            <p className="text-2xl font-black text-text-dark">84.2%</p>
          </div>
          <ArrowUpRight size={16} className="ml-auto text-emerald-500" />
        </div>
        
        <div className="p-6 bg-blue-50 rounded-[28px] border border-blue-100 flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-0.5">On-Time Delivery</p>
            <p className="text-2xl font-black text-text-dark">91.8%</p>
          </div>
          <ArrowUpRight size={16} className="ml-auto text-emerald-500" />
        </div>

        <div className="p-6 bg-rose-50 rounded-[28px] border border-rose-100 flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-rose-600 shadow-sm group-hover:scale-110 transition-transform">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black text-rose-600 uppercase tracking-[0.2em] mb-0.5">Active Impediments</p>
            <p className="text-2xl font-black text-text-dark">04</p>
          </div>
          <ChevronRight size={16} className="ml-auto text-text-light" />
        </div>
      </div>

    </div>
  )
}
