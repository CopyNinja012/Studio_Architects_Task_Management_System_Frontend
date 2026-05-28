import { useState, useEffect } from 'react'
import { 
  Zap, Clock, Target, RotateCcw, TrendingUp, 
  Briefcase, CheckCircle2, History, PlayCircle, AlertCircle,
  ArrowRight, Calendar, Loader2, Award, Activity,
  LayoutDashboard, Fingerprint
} from 'lucide-react'
import { Badge } from '@/shared/components/ui/Badge'
import { Card } from '@/shared/components/ui/Card'
import { cn } from '@/shared/lib/cn'
import { useAuthStore } from '@/store'
import { reportsApi } from '@/features/admin/api/reportsApi'
import { formatDate } from '@/shared/lib/date'
import type { 
  DateRangePreset, 
  EmployeeWorkReportSummary,
  EmployeePerformanceReportSummary,
  EmployeePipelineReportSummary
} from '@/features/admin/model/types'
import { toast } from 'sonner'

const PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: 'TODAY',      label: 'Today' },
  { id: 'THIS_WEEK',   label: 'This Week' },
  { id: 'THIS_MONTH',  label: 'This Month' },
  { id: 'THIS_YEAR',   label: 'This Year' },
]

interface EmployeeReportViewProps {
  userId?: string
  userName?: string
  hideToolbar?: boolean
}

export default function EmployeeReportView({ userId, userName, hideToolbar = false }: EmployeeReportViewProps) {
  const { user: authUser } = useAuthStore()
  const targetUserId = userId || authUser?.id
  const targetUserName = userName || authUser?.name

  const [preset, setPreset] = useState<DateRangePreset>('THIS_MONTH')
  const [loading, setLoading] = useState(true)

  const [work, setWork] = useState<EmployeeWorkReportSummary | null>(null)
  const [perf, setPerf] = useState<EmployeePerformanceReportSummary | null>(null)
  const [pipe, setPipe] = useState<EmployeePipelineReportSummary | null>(null)

  useEffect(() => {
    if (!targetUserId) return
    setLoading(true)
    
    Promise.all([
      reportsApi.getEmployeeWork(targetUserId, { preset }),
      reportsApi.getEmployeePerformance(targetUserId, { preset }),
      reportsApi.getEmployeePipeline(targetUserId)
    ]).then(([w, p, pi]) => {
      setWork(w)
      setPerf(p)
      setPipe(pi)
    }).catch(() => {
      toast.error('Failed to load personal analytics')
    }).finally(() => {
      setLoading(false)
    })
  }, [targetUserId, preset])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[40px]">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-primary-olive opacity-20" />
          <Activity className="w-6 h-6 text-primary-olive absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-olive/60 animate-pulse">Synchronizing Intelligence</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in pb-20 space-y-10 max-w-350 mx-auto">
      
      {/* ── Refactored Toolbar (Cylindrical Box) ────────────────────────── */}
      {!hideToolbar && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-2 bg-white border border-[#E5E7EB] rounded-4xl md:rounded-full shadow-sm mx-2">
          <div className="flex items-center gap-4 px-4">
            <div className="w-10 h-10 rounded-full bg-primary-olive/10 flex items-center justify-center text-primary-olive text-xl">
              👤
            </div>
            <div>
              <p className="text-[9px] font-black text-primary-olive uppercase tracking-[0.2em] mb-0.5 leading-none">Analytic Dossier</p>
              <p className="text-[13px] font-bold text-text-dark leading-none">{targetUserName}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100/50 backdrop-blur-md rounded-full border border-slate-200/50 overflow-x-auto no-scrollbar">
            {PRESETS.map(p => (
              <button 
                key={p.id} 
                onClick={() => setPreset(p.id)} 
                className={cn(
                  "px-6 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-full transition-all duration-300 whitespace-nowrap", 
                  preset === p.id 
                    ? "bg-white text-primary-olive shadow-sm ring-1 ring-black/5" 
                    : "text-text-light hover:text-text-dark"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Intelligence Cards Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Card 1: Performance Alpha */}
        <Card className="p-8 rounded-[40px] border-none shadow-premium bg-white group hover:-translate-y-1 transition-all duration-500">
          <div className="flex items-center justify-between mb-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl">
              🏆
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] font-black uppercase px-3 py-1">Reliability: {Math.min(100, Math.round((perf?.onTimeDeliveryRate || 0) * 100))}%</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-text-light uppercase tracking-[0.2em]">Efficiency Score</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-5xl font-black text-text-dark tracking-tighter tabular-nums">{Math.min(100, Math.round(perf?.efficiencyScore || 0))}</h3>
              <span className="text-xl font-black text-primary-olive">%</span>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-50">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-text-light uppercase tracking-widest">Quality Audit</span>
                <span className="text-sm font-black text-text-dark">{perf?.reworkCount || 0} Reworks</span>
             </div>
             <div className="w-full h-1.5 bg-slate-50 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.max(10, 100 - (perf?.reworkCount || 0) * 10)}%` }} 
                />
             </div>
          </div>
        </Card>

        {/* Card 2: Chronometric Audit */}
        <Card className="p-8 rounded-[40px] border-none shadow-premium bg-white group hover:-translate-y-1 transition-all duration-500">
          <div className="flex items-center justify-between mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">
              ⏱️
            </div>
            <div className="flex flex-col items-end">
               <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Actual Hours</p>
               <p className="text-xl font-black text-text-dark">{work?.totalActualHours.toFixed(1)}h</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <span className="text-[10px] font-black text-text-light uppercase tracking-widest">Planned Capacity</span>
               <span className="text-sm font-black text-text-dark">{work?.totalPlannedHours.toFixed(1)}h</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-[8px] font-black text-emerald-600 uppercase mb-1">Completed</p>
                  <p className="text-xl font-black text-emerald-700">{work?.taskCountByStatus['COMPLETED'] || 0}</p>
               </div>
               <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                  <p className="text-[8px] font-black text-rose-600 uppercase mb-1">Reworks</p>
                  <p className="text-xl font-black text-rose-700">{work?.taskCountByStatus['REWORK_REQUESTED'] || 0}</p>
               </div>
            </div>
          </div>
        </Card>

        {/* Card 3: Execution Pipeline */}
        <Card className="p-8 rounded-[40px] border-none shadow-premium bg-white group hover:-translate-y-1 transition-all duration-500">
          <div className="flex items-center justify-between mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-2xl">
              🚀
            </div>
            <p className="text-[10px] font-black text-primary-olive uppercase tracking-[0.2em]">Operational Flow</p>
          </div>
          <div className="space-y-6">
             <div className="relative pl-6 border-l-2 border-emerald-500/20">
                <div className="absolute -left-1.25 top-0 w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-[9px] font-black text-emerald-600 uppercase mb-1 tracking-widest">Currently Active</p>
                <p className="text-[13px] font-bold text-text-dark truncate">{pipe?.currentTask?.taskName || 'No active task'}</p>
                {pipe?.currentTask && <p className="text-[9px] font-bold text-text-light mt-1">{pipe.currentTask.jobNumber}</p>}
             </div>
             <div className="relative pl-6 border-l-2 border-blue-500/20">
                <div className="absolute -left-1.25 top-0 w-2 h-2 rounded-full bg-blue-500" />
                <p className="text-[9px] font-black text-blue-600 uppercase mb-1 tracking-widest">Scheduled Next</p>
                <p className="text-[13px] font-bold text-text-dark truncate">{pipe?.nextScheduledTask?.taskName || 'Pipeline Clear'}</p>
                {pipe?.nextScheduledTask && <p className="text-[9px] font-bold text-text-light mt-1">{pipe.nextScheduledTask.jobNumber}</p>}
             </div>
          </div>
          <div className="mt-8">
             <Badge className="w-full bg-slate-50 text-slate-500 border-slate-100 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                📡 System Sync: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </Badge>
          </div>
        </Card>

      </div>

      {/* ── Engagement Footprint (Modern List) ─────────────────────────────────── */}
      <div className="mx-2">
         <Card className="p-8 rounded-[40px] border-none shadow-premium bg-white overflow-hidden relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
               <div>
                  <h3 className="text-lg font-black text-text-dark tracking-tight flex items-center gap-3">
                     <span className="text-2xl">🏗️</span> Project Engagement Footprint
                  </h3>
                  <p className="text-xs font-medium text-text-light mt-1">Snapshot of project contributions during this period</p>
               </div>
               <div className="flex -space-x-2">
                  {work?.contributingProjects.slice(0, 5).map((p, i) => (
                    <div key={p} className={cn(
                      "w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm",
                      i % 3 === 0 ? "bg-primary-olive" : i % 3 === 1 ? "bg-amber-500" : "bg-blue-500"
                    )}>
                      {p[0]}
                    </div>
                  ))}
               </div>
            </div>

            <div className="flex flex-wrap gap-3 relative z-10">
               {work?.contributingProjects.map(p => (
                 <Badge key={p} className="bg-slate-50 hover:bg-primary-olive hover:text-white transition-all duration-300 border-slate-100 text-text-medium px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest cursor-default">
                   {p}
                 </Badge>
               ))}
               {(!work?.contributingProjects || work.contributingProjects.length === 0) && (
                 <div className="w-full py-12 flex flex-col items-center justify-center text-text-light/40 italic">
                    <span className="text-4xl mb-4">🌫️</span>
                    <p className="text-sm font-bold uppercase tracking-widest">No active footprints detected</p>
                 </div>
               )}
            </div>

            <Activity className="absolute -right-12 -bottom-12 w-64 h-64 opacity-[0.03] text-primary-olive pointer-events-none" />
         </Card>
      </div>

    </div>
  )
}
