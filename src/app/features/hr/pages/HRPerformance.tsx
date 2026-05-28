import { useState } from 'react'
import { 
  Award, Target, Zap, 
  BarChart3, Star, ShieldCheck, Activity,
  Search
} from 'lucide-react'
import { Card, CardHeader } from '@/shared/components/ui/Card'
import { Avatar } from '@/shared/components/ui/Avatar'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const performanceData = [
  { name: 'Engineering', score: 88, target: 85 },
  { name: 'Design', score: 92, target: 85 },
  { name: 'Operations', score: 78, target: 80 },
  { name: 'Management', score: 85, target: 90 },
]

const TOP_PERFORMERS = [
  { id: '1', name: 'Ayesha Malik', score: 96, growth: '+4%', role: 'Structural Engineer', image: '' },
  { id: '2', name: 'Nadia Hussain', score: 94, growth: '+2%', role: 'Interior Designer', image: '' },
  { id: '3', name: 'Omar Farooq', score: 91, growth: '+5%', role: 'Project Manager', image: '' },
]

export default function HRPerformance() {
  const [activePeriod, setActiveTab] = useState('Quarterly')

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Avg Efficiency', value: '86.4%', icon: <Zap size={16}/>, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Retention Rate', value: '94.2%', icon: <ShieldCheck size={16}/>, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Growth Index', value: '+12.5%', icon: <Activity size={16}/>, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Total Appraisals', value: '38', icon: <Target size={16}/>, color: 'text-teal-700', bg: 'bg-teal-50' },
        ].map(m => (
          <Card key={m.label} padding="none" className="flex items-center gap-4 p-5 border-none shadow-sm bg-white rounded-4xl">
            <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center shrink-0", m.bg, m.color)}>
              {m.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-text-light uppercase tracking-widest leading-none mb-1.5">{m.label}</p>
              <p className="text-2xl font-black text-text-dark leading-none tabular-nums">{m.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dept Performance Chart */}
        <Card className="lg:col-span-2 rounded-[40px] border-none shadow-premium p-8">
          <div className="flex items-center justify-between mb-10">
             <div>
                <h3 className="text-sm font-black text-text-dark uppercase tracking-widest">Departmental Benchmarks</h3>
                <p className="text-[10px] text-text-light font-bold uppercase mt-1">Current scores vs organization targets</p>
             </div>
             <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                {['Monthly', 'Quarterly', 'Yearly'].map(period => (
                  <button
                    key={period}
                    onClick={() => setActiveTab(period)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                      activePeriod === period 
                        ? "bg-white text-primary-olive shadow-sm" 
                        : "text-text-light hover:text-text-medium"
                    )}
                  >
                    {period}
                  </button>
                ))}
             </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 900, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontWeight: 900, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC', radius: 12 }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', fontWeight: 900, fontSize: '11px' }}
                />
                <Bar dataKey="score" name="Actual" fill="#40521B" radius={[8, 8, 0, 0]} barSize={45} />
                <Bar dataKey="target" name="Target" fill="#E2E8F0" radius={[8, 8, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Performers */}
        <Card className="rounded-[40px] border-none shadow-premium p-8">
          <CardHeader title="Elite Talent" subtitle="Highest ratings this period" icon={<Award size={18} className="text-primary-olive" />} />
          <div className="space-y-6 mt-8">
            {TOP_PERFORMERS.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 group cursor-pointer">
                <div className="relative">
                   <Avatar name={p.name} size="md" className="ring-4 ring-slate-50 shadow-sm" />
                   <div className={cn(
                     "absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-md",
                     i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-300" : "bg-orange-300"
                   )}>
                     <span className="text-[10px] font-black text-white">{i + 1}</span>
                   </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-text-dark group-hover:text-primary-olive transition-colors truncate leading-none">{p.name}</p>
                  <p className="text-[10px] text-text-light font-bold uppercase tracking-widest mt-1.5">{p.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-[15px] font-black text-primary-olive tabular-nums">{p.score}%</p>
                  <p className="text-[9px] font-black text-emerald-600 mt-1">{p.growth}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 pt-8 border-t border-slate-100">
             <div className="flex items-center justify-between mb-4">
               <p className="text-[10px] font-black text-text-light uppercase tracking-[0.2em]">Institutional Health</p>
               <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">EXCELLENT</span>
             </div>
             <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-primary-olive rounded-full transition-all duration-2000" style={{ width: '84%' }} />
             </div>
             <p className="text-[10px] text-text-light mt-3 font-bold italic tracking-tight">Organization is operating at 84% peak structural efficiency.</p>
          </div>
        </Card>
      </div>

      {/* Performance Grid/Table */}
      <Card padding="none" className="rounded-[40px] overflow-hidden border-none shadow-premium bg-white">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-sm font-black text-text-dark uppercase tracking-widest">Performance Matrix</h3>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" placeholder="Search staff metrics..." className="w-full pl-11 pr-4 h-10 bg-slate-50/50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-primary-olive/20 transition-all" />
            </div>
            <Button variant="outline" size="sm" className="h-10 px-6 text-[10px] uppercase font-black rounded-xl border-slate-200">Export Dossier</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-text-light uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 text-[10px] font-black text-text-light uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-text-light uppercase tracking-widest text-center">Efficiency</th>
                <th className="px-6 py-4 text-[10px] font-black text-text-light uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-text-light uppercase tracking-widest text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { name: 'Ayesha Malik', cat: 'Structural Engineering', score: '96%', status: 'Validated' },
                { name: 'Bilal Ahmed', cat: 'Operations Management', score: '82%', status: 'In Review' },
                { name: 'Nadia Hussain', cat: 'Architectural Design', score: '91%', status: 'Validated' },
                { name: 'Omar Farooq', cat: 'Project Leadership', score: '88%', status: 'Pending' },
              ].map(row => (
                <tr key={row.name} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <Avatar name={row.name} size="sm" className="ring-2 ring-white" />
                      <span className="text-[13px] font-black text-text-dark group-hover:text-primary-olive transition-colors">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[11px] font-bold text-text-light uppercase tracking-widest">{row.cat}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <span className="text-[13px] font-black text-text-dark tabular-nums">{row.score}</span>
                       <div className="w-8 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: row.score }} />
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={cn(
                      "text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border",
                      row.status === 'Validated' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      row.status === 'In Review' ? "bg-teal-50 text-teal-700 border-teal-100" :
                      "bg-amber-50 text-amber-700 border-amber-100"
                    )}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="text-[10px] font-black text-primary-olive hover:underline uppercase tracking-widest">Full Record</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
