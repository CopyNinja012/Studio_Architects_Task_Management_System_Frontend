import { useState, useEffect } from 'react'
import { 
  Zap, Clock, Target, RotateCcw, TrendingUp, 
  Briefcase, CheckCircle2, History, PlayCircle, AlertCircle,
  ArrowRight, Calendar, Loader2, Award, Activity,
  LayoutDashboard, Fingerprint
} from 'lucide-react'
import { Badge } from '@/shared/components/ui/Badge'
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
    <div className="animate-fade-in pb-20 space-y-12 max-w-[1400px] mx-auto">
      
      {/* ── Minimalist Toolbar ────────────────────────────────────────────── */}
      {!hideToolbar && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-primary-olive/10 flex items-center justify-center text-primary-olive">
              <Fingerprint size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-primary-olive uppercase tracking-[0.2em] mb-0.5">Analytic Dossier</p>
              <p className="text-sm font-bold text-text-dark">{targetUserName} — {preset.replace('_', ' ')}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100/50 backdrop-blur-md rounded-2xl border border-slate-200/50">
            {PRESETS.map(p => (
              <button 
                key={p.id} 
                onClick={() => setPreset(p.id)} 
                className={cn(
                  "px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all duration-300", 
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
      {/* ── Intelligence Grid (No Cards) ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Core Performance Metrics */}
        <div className="lg:col-span-4 space-y-12">
          
          <div className="relative group">
            <p className="text-[9px] font-black text-text-light uppercase tracking-[0.4em] mb-6 px-1 flex items-center gap-2">
              <Award size={12} className="text-primary-olive" /> Proficiency Alpha
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-8xl font-black text-text-dark tracking-tighter tabular-nums leading-none">
                {Math.min(100, Math.round(perf?.efficiencyScore || 0))}
              </span>
              <span className="text-4xl font-black text-primary-olive">%</span>
            </div>
            <p className="text-[11px] font-medium text-text-medium mt-4 leading-relaxed max-w-[240px]">
              Aggregate score of your execution velocity and delivery accuracy for this period.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100">
            <div>
              <p className="text-[8px] font-black text-text-light uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <TrendingUp size={10} className="text-emerald-500" /> Reliability
              </p>
              <p className="text-3xl font-black text-text-dark">{Math.min(100, Math.round((perf?.onTimeDeliveryRate || 0) * 100))}%</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-text-light uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <RotateCcw size={10} className="text-rose-500" /> Quality
              </p>
              <p className="text-3xl font-black text-text-dark">{perf?.reworkCount || 0}</p>
            </div>
          </div>

          <div className="pt-12">
             <p className="text-[9px] font-black text-text-light uppercase tracking-[0.4em] mb-6 px-1">Engagement Footprint</p>
             <div className="flex flex-wrap gap-2">
               {work?.contributingProjects.map(p => (
                 <Badge key={p} className="bg-transparent border border-slate-200 text-text-medium px-4 py-2 rounded-xl text-[11px] font-bold hover:border-primary-olive hover:text-primary-olive transition-colors">
                   {p}
                 </Badge>
               ))}
               {(!work?.contributingProjects || work.contributingProjects.length === 0) && (
                 <p className="text-xs text-text-light italic px-1">No active contributions detected.</p>
               )}
             </div>
          </div>
        </div>

        {/* Middle Column: Work Audit (Modern List Style) */}
        <div className="lg:col-span-4 space-y-12">
           <p className="text-[9px] font-black text-text-light uppercase tracking-[0.4em] mb-6 px-1 flex items-center gap-2">
             <Clock size={12} className="text-blue-500" /> Chronometric Audit
           </p>

           <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                 <div>
                    <p className="text-[8px] font-black text-text-light uppercase mb-1">Planned Capacity</p>
                    <p className="text-2xl font-black text-text-dark">{work?.totalPlannedHours.toFixed(1)}h</p>
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-300">
                    <History size={20} />
                 </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-[#F8FAF5] rounded-3xl border border-primary-olive/10">
                 <div>
                    <p className="text-[8px] font-black text-primary-olive uppercase mb-1">Actual Utilization</p>
                    <p className="text-2xl font-black text-text-dark">{work?.totalActualHours.toFixed(1)}h</p>
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary-olive">
                    <Zap size={20} />
                 </div>
              </div>
           </div>

           <div className="space-y-4 pt-4">
              {[
                { label: 'Task Completion', key: 'COMPLETED', color: 'emerald', icon: <CheckCircle2 size={12} /> },
                { label: 'Under Review', key: 'UNDER_REVIEW', color: 'blue', icon: <History size={12} /> },
                { label: 'Pending / Assigned', key: 'ASSIGNED', color: 'slate', icon: <PlayCircle size={12} /> },
                { label: 'Rework Required', key: 'REWORK_REQUESTED', color: 'rose', icon: <AlertCircle size={12} /> },
              ].map(s => (
                <div key={s.key} className="flex items-center justify-between px-2 py-3 border-b border-slate-50 group hover:border-primary-olive/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-2 h-2 rounded-full", 
                      s.color === 'emerald' ? 'bg-emerald-500' :
                      s.color === 'blue' ? 'bg-blue-500' :
                      s.color === 'rose' ? 'bg-rose-500' :
                      'bg-slate-300'
                    )} />
                    <span className="text-[12px] font-bold text-text-medium uppercase tracking-wide group-hover:text-text-dark transition-colors">{s.label}</span>
                  </div>
                  <span className="text-[14px] font-black text-text-dark tabular-nums">{work?.taskCountByStatus[s.key] || 0}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Right Column: Execution Pipeline */}
        <div className="lg:col-span-4 space-y-12">
           <p className="text-[9px] font-black text-text-light uppercase tracking-[0.4em] mb-6 px-1 flex items-center gap-2">
             <LayoutDashboard size={12} className="text-amber-500" /> Operational Pipeline
           </p>

           <div className="space-y-8">
              <div className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-emerald-500 before:to-transparent">
                 <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                 <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">Engaged Currently</p>
                 {pipe?.currentTask ? (
                   <>
                     <h4 className="text-lg font-black text-text-dark leading-snug">{pipe.currentTask.taskName}</h4>
                     <p className="text-[11px] font-bold text-text-light mt-2">{pipe.currentTask.jobNumber} • {formatDate(pipe.currentTask.plannedStartDate)} - {formatDate(pipe.currentTask.plannedEndDate)}</p>
                   </>
                 ) : (
                    <p className="text-sm font-bold text-text-light italic">No active task engagements detected.</p>
                 )}
              </div>

              <div className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-blue-400 before:to-transparent">
                 <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-blue-400 ring-4 ring-blue-50" />
                 <p className="text-[10px] font-black text-blue-500 uppercase mb-2">Scheduled Next</p>
                 {pipe?.nextScheduledTask ? (
                   <>
                     <h4 className="text-lg font-black text-text-dark leading-snug">{pipe.nextScheduledTask.taskName}</h4>
                     <p className="text-[11px] font-bold text-text-light mt-2">{pipe.nextScheduledTask.jobNumber} • Starts {formatDate(pipe.nextScheduledTask.plannedStartDate)}</p>
                   </>
                 ) : (
                    <p className="text-sm font-bold text-text-light italic">Operational pipeline is currently clear.</p>
                 )}
              </div>
           </div>

           <div className="mt-12 p-8 bg-primary-olive rounded-[40px] text-white overflow-hidden relative group">
              <div className="relative z-10">
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Dossier Status</p>
                 <p className="text-xl font-black">Professional Profile Updated</p>
                 <p className="text-xs font-medium opacity-60 mt-2">Intelligence sync completed at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <Activity className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
           </div>
        </div>

      </div>
    </div>
  )
}
