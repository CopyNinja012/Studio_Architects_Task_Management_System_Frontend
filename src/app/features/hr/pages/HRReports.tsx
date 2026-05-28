import { useState, useEffect, useMemo } from 'react'
import { 
  Search, Download, Briefcase, Clock, TrendingUp, 
  ArrowRight, Users, Zap, RotateCcw, CheckCircle2, 
  History, PlayCircle, AlertCircle, ChevronRight,
  Loader2, FilterX
} from 'lucide-react'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { DataTable, type Column } from '@/shared/components/table/DataTable'
import { reportsApi } from '@/features/admin/api/reportsApi'
import { cn } from '@/shared/lib/cn'
import { formatDate } from '@/shared/lib/date'
import { toast } from 'sonner'
import type { 
  DateRangePreset, 
  EmployeeWorkReportResponse,
  EmployeePerformanceReportResponse,
  EmployeePipelineReportResponse
} from '@/features/admin/model/types'
import EmployeeReportView from '@/shared/components/reports/EmployeeReportView'
import { Modal } from '@/shared/components/ui/Modal'

// ─── Constants ───────────────────────────────────────────────────────────────

const PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: 'TODAY',      label: 'Today' },
  { id: 'THIS_WEEK',   label: 'This Week' },
  { id: 'THIS_MONTH',  label: 'This Month' },
  { id: 'THIS_YEAR',   label: 'This Year' },
]

type ReportTab = 'work' | 'performance' | 'pipeline'

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HRReports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('work')
  const [preset, setPreset] = useState<DateRangePreset>('THIS_MONTH')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  const [workData, setWorkData] = useState<EmployeeWorkReportResponse[]>([])
  const [perfData, setPerfData] = useState<EmployeePerformanceReportResponse[]>([])
  const [pipeData, setPipeData] = useState<EmployeePipelineReportResponse[]>([])

  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = { preset }
      const [work, perf, pipe] = await Promise.all([
        reportsApi.getEmployeesWork(params),
        reportsApi.getEmployeesPerformance(params),
        reportsApi.getEmployeesPipeline()
      ])
      setWorkData(work)
      setPerfData(perf)
      setPipeData(pipe)
    } catch (err) {
      toast.error('Failed to synchronize global staff intelligence')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [preset])

  // ─── Columns Definition ───────────────────────────────────────────────────

  const workColumns: Column<EmployeeWorkReportResponse>[] = [
    {
      key: 'userName', header: 'Staff Member',
      render: row => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-text-light font-bold text-[10px]">
            {row.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p className="text-[13px] font-black text-text-dark leading-none">{row.userName}</p>
            <p className="text-[9px] font-bold text-text-light uppercase tracking-widest mt-1.5">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'status', header: 'Execution Summary',
      render: row => {
        const counts = row.report.taskCountByStatus
        return (
          <div className="flex gap-2">
            {[
              { label: 'Done', key: 'COMPLETED', color: 'emerald' },
              { label: 'Review', key: 'UNDER_REVIEW', color: 'blue' },
              { label: 'Rework', key: 'REWORK_REQUESTED', color: 'rose' }
            ].map(s => (
              <div key={s.key} className={cn(
                "flex flex-col items-center px-2 py-1 rounded-lg border min-w-14",
                s.color === 'emerald' ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                s.color === 'blue' ? "bg-blue-50 border-blue-100 text-blue-700" :
                "bg-rose-50 border-rose-100 text-rose-700"
              )}>
                <span className="text-[7px] font-black uppercase">{s.label}</span>
                <span className="text-[11px] font-black">{counts[s.key] || 0}</span>
              </div>
            ))}
          </div>
        )
      }
    },
    {
      key: 'hours', header: 'Time Utilization',
      render: row => (
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[12px] font-black text-text-dark leading-none">{row.report.totalActualHours.toFixed(1)}h</p>
            <p className="text-[8px] font-bold text-text-light uppercase tracking-tighter mt-1">Actual</p>
          </div>
          <div className="w-px h-6 bg-slate-100" />
          <div>
            <p className={cn(
              "text-[12px] font-black leading-none",
              row.report.effortVariance > 15 ? "text-rose-600" : "text-emerald-600"
            )}>{row.report.effortVariance.toFixed(0)}%</p>
            <p className="text-[8px] font-bold text-text-light uppercase tracking-tighter mt-1">Variance</p>
          </div>
        </div>
      )
    }
  ]

  const perfColumns: Column<EmployeePerformanceReportResponse>[] = [
    {
      key: 'userName', header: 'Staff Member',
      render: row => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-olive font-bold text-[10px]">
            {row.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p className="text-[13px] font-black text-text-dark leading-none">{row.userName}</p>
            <p className="text-[9px] font-bold text-text-light uppercase tracking-widest mt-1.5">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'efficiency', header: 'Efficiency Alpha',
      render: row => {
        const score = Math.min(100, Math.round(row.report.efficiencyScore))
        return (
          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-primary-olive w-10">{score}%</span>
            <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-olive rounded-full transition-all duration-1000" style={{ width: `${score}%` }} />
            </div>
          </div>
        )
      }
    },
    {
      key: 'reliability', header: 'On-Time Delivery',
      render: row => {
        const rate = Math.min(100, Math.round(row.report.onTimeDeliveryRate * 100))
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-emerald-600">
               <CheckCircle2 size={12} strokeWidth={3} />
               <span className="text-[13px] font-black">{rate}%</span>
            </div>
            <p className="text-[8px] font-black text-text-light uppercase tracking-widest mt-0.5">Reliability Score</p>
          </div>
        )
      }
    },
    {
      key: 'quality', header: 'Quality Audit',
      render: row => (
        <div className="flex items-center gap-2">
          <Badge className={cn(
            "px-2 py-0.5 rounded-lg border text-[10px] font-black",
            row.report.reworkCount > 3 ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-500 border-slate-100"
          )}>
            {row.report.reworkCount} REWORKS
          </Badge>
        </div>
      )
    }
  ]

  const pipeColumns: Column<EmployeePipelineReportResponse>[] = [
    {
      key: 'userName', header: 'Staff Member',
      render: row => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 font-bold text-[10px]">
            {row.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p className="text-[13px] font-black text-text-dark leading-none">{row.userName}</p>
            <p className="text-[9px] font-bold text-text-light uppercase tracking-widest mt-1.5">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'current', header: 'Currently Engaged',
      render: row => {
        const t = row.report.currentTask
        if (!t) return <span className="text-[10px] font-bold text-text-light italic">Standby Mode</span>
        return (
          <div className="max-w-xs">
            <p className="text-[12px] font-black text-text-dark truncate leading-tight">{t.taskName}</p>
            <p className="text-[9px] font-bold text-primary-olive uppercase tracking-widest mt-1">{t.jobNumber} • {formatDate(t.plannedEndDate)}</p>
          </div>
        )
      }
    },
    {
      key: 'next', header: 'Next Scheduled',
      render: row => {
        const t = row.report.nextScheduledTask
        if (!t) return <span className="text-[10px] font-bold text-text-light italic">Clear Pipeline</span>
        return (
          <div className="max-w-xs">
            <p className="text-[12px] font-black text-text-dark truncate leading-tight">{t.taskName}</p>
            <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-1">{t.jobNumber} • Starts {formatDate(t.plannedStartDate)}</p>
          </div>
        )
      }
    }
  ]

  const filteredData = useMemo(() => {
    const s = search.toLowerCase()
    let base: any[] = []
    if (activeTab === 'work') base = workData
    else if (activeTab === 'performance') base = perfData
    else base = pipeData

    return base.filter(row => 
      row.userName.toLowerCase().includes(s) || 
      row.email.toLowerCase().includes(s)
    )
  }, [activeTab, workData, perfData, pipeData, search])

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* ── Tabs Toolbar ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm overflow-x-auto no-scrollbar">
          {[
            { id: 'work', label: 'Work Audit', icon: <Clock size={14} /> },
            { id: 'performance', label: 'Performance Alpha', icon: <TrendingUp size={14} /> },
            { id: 'pipeline', label: 'Execution Pipeline', icon: <ArrowRight size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as ReportTab); setSearch('') }}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === tab.id ? "bg-[#111827] text-white shadow-lg" : "text-text-light hover:text-text-dark hover:bg-slate-50"
              )}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-[#F3F4F6] rounded-[24px] border border-[#E5E7EB] overflow-x-auto no-scrollbar">
          {PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => setPreset(p.id)}
              className={cn(
                "px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap",
                preset === p.id ? "bg-white text-primary-olive shadow-sm ring-1 ring-black/5" : "text-text-light hover:text-text-medium"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Data Table Card ─────────────────────────────────────────── */}
      <Card padding="none" className="rounded-4xl border-none shadow-premium overflow-hidden bg-white">
        <div className="p-4 border-b border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white relative z-20">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative w-full md:w-80">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search staff members..."
                className="w-full pl-11 pr-4 h-12 bg-[#F9FAFB] rounded-2xl border border-transparent focus:bg-white focus:border-primary-olive/30 focus:ring-4 focus:ring-primary-olive/5 transition-all text-[13px] font-bold"
              />
            </div>
            <div className="h-8 w-px bg-slate-100 hidden md:block" />
            <div className="hidden md:flex items-center gap-2 text-text-light">
              <Users size={16} />
              <span className="text-[11px] font-bold uppercase tracking-widest">Global Staff Inventory</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <Button
                variant="outline"
                className="h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest border-slate-200"
                icon={<Download size={14} />}
             >
                Export CSV
             </Button>
          </div>
        </div>

        <div className="relative z-10">
          <DataTable
            columns={activeTab === 'work' ? workColumns : activeTab === 'performance' ? perfColumns : pipeColumns}
            data={filteredData}
            loading={loading}
            rowKey={r => r.userId}
            onRowClick={r => setSelectedUser({ id: r.userId, name: r.userName })}
            emptyMessage={`No ${activeTab} intelligence detected for this period.`}
            emptyIcon={<FilterX size={40} className="text-slate-200" />}
          />
        </div>
      </Card>

      {/* ── Detailed Modal ──────────────────────────────────────────────── */}
      <Modal 
        open={!!selectedUser} 
        onClose={() => setSelectedUser(null)}
        size="xl"
        title="Staff Intelligence Dossier"
        subtitle={selectedUser?.name || ''}
        icon={<Zap size={20} className="text-primary-olive" />}
      >
        {selectedUser && (
          <div className="py-2">
            <EmployeeReportView 
              userId={selectedUser.id} 
              userName={selectedUser.name} 
              hideToolbar={true} 
            />
          </div>
        )}
      </Modal>

      {/* Info Banner */}
      <div className="p-6 bg-[#111827] rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2 text-primary-olive">System Integrity Notice</p>
          <p className="text-xl font-black">Staff intelligence is synchronized in real-time.</p>
          <p className="text-xs font-medium opacity-60 mt-2 max-w-md">Performance Alphas and Execution velocity are calculated based on task completion accuracy and chronometric variance.</p>
        </div>
        <div className="shrink-0 relative z-10">
           <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <Zap size={16} className="text-primary-olive animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest">Active Monitoring</span>
           </div>
        </div>
        <TrendingUp className="absolute -right-8 -bottom-8 w-48 h-48 opacity-5 group-hover:scale-110 transition-transform duration-1000" />
      </div>

    </div>
  )
}
