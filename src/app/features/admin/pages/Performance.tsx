import { useEffect, useState } from 'react'
import {
  ClipboardCheck, TrendingUp, Clock, Award,
  MoreVertical, Users,
} from 'lucide-react'
import { adminApi } from '../api/adminApi'
import type { PerformanceRecord } from '../model/types'
import { PageLoader } from '@/shared/components/ui/Loader'
import { cn } from '@/shared/lib/cn'
import bestEmployeeImg from '@/shared/assets/medals/best-employee1.png'
import goldMedalImg from '@/shared/assets/medals/medalgold.png'
import silverMedalImg from '@/shared/assets/medals/medalsilver.png'
import bronzeMedalImg from '@/shared/assets/medals/medalbroze.png'

// ─── Mock data (used when API returns empty) ──────────────────────────────────
const MOCK: PerformanceRecord[] = [
  {
    id: '1', employeeId: 'e1', employeeName: 'Rahul Sharma',
    designation: 'Project Manager', department: 'Architecture Department',
    month: 'May', year: 2025, score: 96, tasksCompleted: 48, tasksTotal: 50,
    onTimeDelivery: 100, qualityScore: 98, attendanceScore: 100,
    collaborationScore: 95, rank: 1, badge: 'gold',
  },
  {
    id: '2', employeeId: 'e2', employeeName: 'Priya Mehta',
    designation: 'Senior Architect', department: 'Design Department',
    month: 'May', year: 2025, score: 92, tasksCompleted: 42, tasksTotal: 50,
    onTimeDelivery: 98, qualityScore: 94, attendanceScore: 98,
    collaborationScore: 90, rank: 2, badge: 'silver',
  },
  {
    id: '3', employeeId: 'e3', employeeName: 'Amit Verma',
    designation: 'Structural Engineer', department: 'Engineering Department',
    month: 'May', year: 2025, score: 90, tasksCompleted: 38, tasksTotal: 50,
    onTimeDelivery: 96, qualityScore: 91, attendanceScore: 95,
    collaborationScore: 88, rank: 3, badge: 'bronze',
  },
  {
    id: '4', employeeId: 'e4', employeeName: 'Sneha Iyer',
    designation: 'QA Engineer', department: 'Quality Department',
    month: 'May', year: 2025, score: 87, tasksCompleted: 34, tasksTotal: 50,
    onTimeDelivery: 94, qualityScore: 89, attendanceScore: 92,
    collaborationScore: 85, rank: 4,
  },
  {
    id: '5', employeeId: 'e5', employeeName: 'Vikram Singh',
    designation: 'Business Analyst', department: 'Management Department',
    month: 'May', year: 2025, score: 85, tasksCompleted: 30, tasksTotal: 50,
    onTimeDelivery: 93, qualityScore: 87, attendanceScore: 90,
    collaborationScore: 83, rank: 5,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ─── Rank Medal ───────────────────────────────────────────────────────────────
function RankMedal({ rank, badge }: { rank: number; badge?: string }) {
  if (badge === 'gold') return (
    <img src={goldMedalImg} alt="Gold Medal" className="w-9 h-9 object-contain drop-shadow-md" />
  )
  if (badge === 'silver') return (
    <img src={silverMedalImg} alt="Silver Medal" className="w-9 h-9 object-contain drop-shadow-md" />
  )
  if (badge === 'bronze') return (
    <img src={bronzeMedalImg} alt="Bronze Medal" className="w-9 h-9 object-contain drop-shadow-md" />
  )
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-black border-2 border-surface-border text-text-medium bg-surface-hover">
      {rank}
    </div>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function EmpAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'w-16 h-16 text-xl' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'
  return (
    <div
      className={cn('rounded-full flex items-center justify-center font-black text-white shrink-0', sz)}
      style={{ background: 'linear-gradient(135deg, #334612, #556F1F)' }}
    >
      {initials(name)}
    </div>
  )
}

// ─── Top Performer Hero Banner ────────────────────────────────────────────────
function TopPerformerBanner({ top }: { top: PerformanceRecord }) {
  const emojis = ['🎉','🎊','✨','🌟','💫','⭐','🏆','🎖️','🎀','🥳','🎈','🪄']
  
  return (
    <div
      className="relative rounded-[32px] overflow-hidden p-6 md:p-8 mb-6"
      style={{
        background: 'linear-gradient(135deg, #F5F7F2 0%, #eef3e6 50%, #F5F7F2 100%)',
        border: '2px solid #D6DFC8',
        boxShadow: '0 12px 48px rgba(107, 127, 58, 0.12)',
      }}
    >
      {/* Celebration emojis — randomly placed everywhere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {emojis.concat(emojis).map((emoji, i) => {
          // Simple pseudo-randomness based on index
          const s1 = ((i * 137) % 100) / 100
          const s2 = ((i * 197) % 100) / 100
          const s3 = ((i * 7) % 100) / 100
          const left = `${s1 * 95}%`
          const top = `${s2 * 90}%`
          const fontSize = `${s3 * 15 + 14}px`
          const opacity = s3 * 0.4 + 0.3
          const delay = s1 * 3
          return (
            <span
              key={i}
              className="absolute select-none animate-bounce"
              style={{ 
                left, top, fontSize, opacity,
                animationDelay: `${delay}s`,
              }}
            >
              {emoji}
            </span>
          )
        })}
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
        {/* Trophy / Best Employee Image */}
        <div className="shrink-0 w-36 h-36 bg-white/60 rounded-full flex items-center justify-center p-4 shadow-2xl ring-8 ring-white/40 animate-float">
          <img 
            src={bestEmployeeImg} 
            alt="Top Performer" 
            className="w-full h-full object-contain drop-shadow-2xl" 
          />
        </div>

        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-olive text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-lg">
            <Award size={14} /> Top Performer of the Month
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-text-dark tracking-tighter mb-2 leading-none">
            {top.employeeName}
          </h1>
          <p className="text-md md:text-lg font-bold text-primary-olive/70 mb-6">
            {top.designation} <span className="mx-2 opacity-30">•</span> {top.department}
          </p>

          {/* Progress Section */}
          <div className="max-w-lg mx-auto lg:mx-0 bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-sm">
            <div className="flex justify-between items-end mb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-text-light uppercase tracking-widest mb-1">Performance Score</span>
                <span className="text-xs font-bold text-text-dark">Exceptional Achievement</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-primary-olive">{top.score}</span>
                <span className="text-base font-black text-primary-olive/50">%</span>
              </div>
            </div>
            
            <div className="h-4 w-full bg-white/80 rounded-full overflow-hidden p-1 shadow-inner border border-white/50">
               <div 
                 className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                 style={{ 
                   width: `${top.score}%`,
                   background: 'linear-gradient(90deg, #334612, #556F1F)',
                   boxShadow: '0 0 15px rgba(64, 82, 27, 0.4)'
                 }}
               >
                 {/* Shine effect */}
                 <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" 
                      style={{ backgroundSize: '200% 100%' }} />
               </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-5">
               <div className="text-center">
                 <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-1">Tasks</p>
                 <p className="text-md font-black text-text-dark">{top.tasksCompleted}</p>
               </div>
               <div className="text-center border-x border-surface-border/50">
                 <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-1">On-Time</p>
                 <p className="text-md font-black text-text-dark">{top.onTimeDelivery}%</p>
               </div>
               <div className="text-center">
                 <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-1">Quality</p>
                 <p className="text-md font-black text-text-dark">{top.qualityScore}%</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Rank Table Row ───────────────────────────────────────────────────────────
function RankRow({ rec, isLast }: { rec: PerformanceRecord; isLast: boolean }) {
  return (
    <div className={cn(
      'flex items-center gap-4 px-5 py-3.5 hover:bg-primary-50 transition-colors duration-150 group',
      !isLast && 'border-b border-surface-border'
    )}>
      {/* Rank */}
      <div className="w-10 shrink-0 flex justify-center">
        <RankMedal rank={rec.rank} badge={rec.badge} />
      </div>

      {/* Avatar + Name */}
      <div className="flex items-center gap-3 w-50 shrink-0">
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-text-dark truncate">{rec.employeeName}</p>
        </div>
      </div>

      {/* Designation */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-text-dark truncate">{rec.designation}</p>
        <p className="text-[11px] text-text-light truncate">{rec.department}</p>
      </div>

      {/* Tasks Completed */}
      <div className="w-32.5 shrink-0 flex items-center gap-1.5">
        <span className="text-[14px] font-black text-primary-olive">{rec.tasksCompleted}</span>
        <ClipboardCheck size={14} className="text-primary-300" />
      </div>

      {/* Performance */}
      <div className="w-27.5 shrink-0 flex items-center gap-1.5">
        <span className="text-[14px] font-black text-teal-500">{rec.score}%</span>
        <TrendingUp size={14} className="text-teal-400" />
      </div>

      {/* On-Time Delivery */}
      <div className="w-32.5 shrink-0 flex items-center gap-1.5">
        <span className="text-[14px] font-black text-indigo-500">{rec.onTimeDelivery}%</span>
        <Clock size={14} className="text-indigo-400" />
      </div>

      {/* Actions */}
      <div className="w-8 shrink-0 flex justify-center">
        <button className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-border transition-all">
          <MoreVertical size={15} className="text-text-light" />
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Performance() {
  const [records, setRecords] = useState<PerformanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getPerformance()
      .then(data => setRecords(data.length ? data : MOCK))
      .catch(() => setRecords(MOCK))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const sorted = [...records].sort((a, b) => a.rank - b.rank)
  const top = sorted[0]

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Top Performer Banner ─────────────────────────────────── */}
      {top && <TopPerformerBanner top={top} />}

      {/* ── Rank Table ───────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden bg-white"
        style={{
          border: '1.5px solid var(--color-surface-border)',
          boxShadow: '0 4px 24px rgba(107, 127, 58,0.07)',
        }}
      >
        {/* Table header */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-surface-border bg-primary-50">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-primary-olive" />
            <span className="text-[13px] font-black text-text-dark">Rank Wise Employees</span>
          </div>
        </div>

        {/* Column labels */}
        <div className="flex items-center gap-4 px-5 py-2.5 border-b border-surface-border bg-surface-hover">
          <div className="w-10 shrink-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-light">Rank</span>
          </div>
          <div className="w-50 shrink-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-light">Employee</span>
          </div>
          <div className="flex-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-light">Designation</span>
          </div>
          <div className="w-32.5 shrink-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-light">Tasks Completed</span>
          </div>
          <div className="w-27.5 shrink-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-light">Performance</span>
          </div>
          <div className="w-32.5 shrink-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-light">On-Time Delivery</span>
          </div>
          <div className="w-8 shrink-0" />
        </div>

        {/* Rows */}
        {sorted.map((rec, i) => (
          <RankRow key={rec.id} rec={rec} isLast={i === sorted.length - 1} />
        ))}
      </div>
    </div>
  )
}


