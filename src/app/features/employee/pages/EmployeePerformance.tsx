import { TrendingUp, Award, Target, CheckCircle2, Clock, Users, Star, ArrowUpRight, Zap, Briefcase, BarChart3 } from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts'
import { Card } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { cn } from '@/shared/lib/cn'

// ─── Constants & Mock Data ──────────────────────────────────────────────────

const CURRENT = {
  month: 'May 2026',
  overallScore: 92,
  tasksCompleted: 14,
  tasksTotal: 16,
  onTimeDelivery: 94,
  qualityScore: 96,
  collaborationScore: 88,
  efficiency: 91,
  rank: 2,
  badge: 'gold' as const,
  manHours: 156,
}

const HISTORY = [
  { month: 'Nov', score: 78, tasks: 10 },
  { month: 'Dec', score: 82, tasks: 12 },
  { month: 'Jan', score: 79, tasks: 11 },
  { month: 'Feb', score: 85, tasks: 14 },
  { month: 'Mar', score: 88, tasks: 15 },
  { month: 'Apr', score: 91, tasks: 16 },
  { month: 'May', score: 92, tasks: 14 },
]

const RADAR_DATA = [
  { subject: 'Quality',       value: 96, fullMark: 100 },
  { subject: 'On-Time',       value: 94, fullMark: 100 },
  { subject: 'Precision',     value: 92, fullMark: 100 },
  { subject: 'Teamwork',      value: 88, fullMark: 100 },
  { subject: 'Speed',         value: 91, fullMark: 100 },
]

const COLORS = ['#40521B', '#556F1F', '#718742', '#B7C39A']

// ─── Sub-Components ──────────────────────────────────────────────────────────

function PerformanceRing({ score }: { score: number }) {
  const size = 180
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#F5F7F2" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="url(#perfGradient)" strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        <defs>
          <linearGradient id="perfGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#40521B" />
            <stop offset="100%" stopColor="#718742" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-[#1A1F14] tracking-tighter">{score}</span>
        <span className="text-[10px] font-black text-[#40521B]/40 uppercase tracking-[0.2em]">Efficiency</span>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any, label: string, value: string | number, subTextText?: string, sub: string, color: string }) {
  return (
    <Card className="p-6 rounded-[32px] border-none shadow-sm bg-white group hover:-translate-y-1 transition-all duration-500">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-2xl transition-colors", color)}>
          <Icon size={20} />
        </div>
        <ArrowUpRight size={16} className="text-[#40521B]/20 group-hover:text-[#40521B] transition-colors" />
      </div>
      <p className="text-[10px] font-black text-[#40521B]/40 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-2xl font-black text-[#1A1F14]">{value}</p>
      <p className="text-[10px] font-bold text-success mt-1">{sub}</p>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EmployeePerformance() {
  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-md p-4 rounded-[20px] border border-white/40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary-olive flex items-center justify-center text-white shadow-lg shadow-primary-olive/20">
            <Zap size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#1A1F14] tracking-tight uppercase">Performance Intelligence</h1>
            <p className="text-[#40521B]/60 text-[10px] font-bold uppercase tracking-widest mt-0.5">Snapshot for {CURRENT.month}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-50 text-amber-700 border-amber-100 font-black text-[9px] px-3 py-1 rounded-lg uppercase tracking-widest">
            {CURRENT.badge.toUpperCase()} LEVEL ARCHITECT
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Performance Core ── */}
        <Card className="lg:col-span-1 p-6 rounded-[32px] border-none shadow-premium bg-white flex flex-col items-center justify-center text-center">
          <PerformanceRing score={CURRENT.overallScore} />
          <div className="mt-6 space-y-4 w-full">
            <div className="p-3 bg-[#F5F7F2] rounded-xl border border-[#40521B]/5">
              <p className="text-[9px] font-black text-[#40521B]/40 uppercase tracking-widest mb-1">Company Standing</p>
              <p className="text-lg font-black text-[#1A1F14]">Ranked #{CURRENT.rank} in Studio</p>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter leading-none mb-1">Status</p>
                <p className="text-[13px] font-black text-emerald-700 leading-none">Elite</p>
              </div>
              <div className="flex-1 p-2.5 bg-primary-olive text-white rounded-xl shadow-lg shadow-primary-olive/20">
                <p className="text-[8px] font-black text-white/60 uppercase tracking-tighter leading-none mb-1">Next Goal</p>
                <p className="text-[13px] font-black leading-none">Top 1</p>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Key Indicators ── */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatCard 
            icon={CheckCircle2} 
            label="Tasks Mastered" 
            value={CURRENT.tasksCompleted} 
            sub="+2 since last month" 
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard 
            icon={Target} 
            label="Quality Precision" 
            value={`${CURRENT.qualityScore}%`} 
            sub="Above studio average" 
            color="bg-primary-50 text-primary-olive"
          />
          <StatCard 
            icon={Clock} 
            label="Total Effort" 
            value={`${CURRENT.manHours}h`} 
            sub="98% billable hours" 
            color="bg-amber-50 text-amber-700"
          />
          <StatCard 
            icon={Briefcase} 
            label="On-Time Rate" 
            value={`${CURRENT.onTimeDelivery}%`} 
            sub="Optimal reliability" 
            color="bg-blue-50 text-blue-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Growth Trend ── */}
        <Card className="lg:col-span-3 p-8 rounded-[40px] border-none shadow-premium bg-white">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-[#1A1F14] uppercase tracking-widest">Growth Dynamics</h3>
              <p className="text-[10px] text-[#40521B]/40 font-bold uppercase mt-1 tracking-wider">Historical score & output analysis</p>
            </div>
            <BarChart3 className="text-[#40521B]/20" />
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HISTORY}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#40521B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#40521B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F3E8" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#40521B66' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#40521B66' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="score" stroke="#40521B" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ── Capability Matrix ── */}
        <Card className="lg:col-span-2 p-8 rounded-[40px] border-none shadow-premium bg-white overflow-hidden">
          <div className="mb-8">
            <h3 className="text-sm font-black text-[#1A1F14] uppercase tracking-widest">Architect Capability</h3>
            <p className="text-[10px] text-[#40521B]/40 font-bold uppercase mt-1 tracking-wider">Multi-dimensional skill mapping</p>
          </div>
          
          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_DATA}>
                <PolarGrid stroke="#F0F3E8" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 900, fill: '#40521B66' }} />
                <Radar
                  name="Architect"
                  dataKey="value"
                  stroke="#40521B"
                  strokeWidth={2}
                  fill="#40521B"
                  fillOpacity={0.15}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ── Efficiency Distribution ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Drawings', value: 85, color: '#40521B' },
          { label: '3D Renders', value: 92, color: '#556F1F' },
          { label: 'Planning', value: 78, color: '#718742' },
          { label: 'Coordination', value: 88, color: '#B7C39A' },
        ].map((item, idx) => (
          <Card key={idx} className="p-6 rounded-[32px] border-none shadow-sm bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-black text-[#40521B]/40 uppercase tracking-widest">{item.label}</span>
              <span className="text-[12px] font-black text-[#1A1F14]">{item.value}%</span>
            </div>
            <div className="h-1.5 bg-[#F5F7F2] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-[1500ms]" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
