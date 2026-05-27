import { useState, useEffect } from 'react'
import { 
  Briefcase, MapPin, Clock, DollarSign,
  Building2, PlusCircle, Users, ArrowRight
} from 'lucide-react'
import { Card } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import { adminApi } from '@/features/admin/api/adminApi'
import type { AdminUser } from '@/features/admin/model/types'
import { Avatar } from '@/shared/components/ui/Avatar'

interface JobOpening {
  id: string
  title: string
  department: string
  location: string
  type: string
  salary: string
  applicants: number
  postedDate: string
  status: 'Open' | 'Urgent' | 'Closed'
}

const JOBS: JobOpening[] = [
  { id: '1', title: 'Senior Structural Engineer', department: 'Engineering', location: 'Dubai, UAE', type: 'Full-time', salary: '$8k - $12k', applicants: 24, postedDate: '2 days ago', status: 'Urgent' },
  { id: '2', title: 'Interior Designer', department: 'Design', location: 'Riyadh, KSA', type: 'Full-time', salary: '$5k - $7k', applicants: 45, postedDate: '5 days ago', status: 'Open' },
  { id: '3', title: 'Site Supervisor', department: 'Operations', location: 'Doha, Qatar', type: 'Contract', salary: '$4k - $6k', applicants: 12, postedDate: '1 week ago', status: 'Open' },
  { id: '4', title: 'BIM Modeler', department: 'Engineering', location: 'Remote / Muscat', type: 'Full-time', salary: '$3k - $5k', applicants: 38, postedDate: '3 days ago', status: 'Open' },
]

export default function HRRecruitment() {
  const [activeTab, setActiveTab] = useState<'openings' | 'applicants'>('openings')
  const [employees, setEmployees] = useState<AdminUser[]>([])

  useEffect(() => {
    adminApi.getUsers(0, 5).then(res => setEmployees(res.content))
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Recruitment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#111827] border-none text-white overflow-hidden relative group p-6 rounded-[32px]">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Active Openings</p>
            <p className="text-4xl font-black mt-2 tracking-tighter tabular-nums">12</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
             <Briefcase size={120} />
          </div>
        </Card>

        <Card className="bg-white border-none shadow-premium overflow-hidden relative group p-6 rounded-[32px]">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-light">Total Pipeline</p>
            <p className="text-4xl font-black mt-2 text-text-dark tracking-tighter tabular-nums">156</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700 text-primary-olive">
             <Users size={120} />
          </div>
        </Card>

        <div className="md:col-span-2 bg-primary-olive/5 border border-primary-olive/10 rounded-[32px] p-6 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                 {employees.slice(0, 3).map(e => (
                   <Avatar key={e.id} name={e.name} size="md" className="ring-4 ring-[#F8FAF5]" />
                 ))}
                 {employees.length > 3 && (
                   <div className="w-10 h-10 rounded-full bg-primary-olive text-white border-4 border-[#F8FAF5] flex items-center justify-center text-[10px] font-black">
                      +{employees.length - 3}
                   </div>
                 )}
              </div>
              <div>
                 <p className="text-[10px] font-black text-primary-olive uppercase tracking-widest leading-none mb-1">Recruitment Squad</p>
                 <p className="text-sm font-bold text-text-dark">Active interviewers today</p>
              </div>
           </div>
           <Button variant="primary" size="sm" className="h-10 px-6 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg shadow-primary-olive/20">
              <PlusCircle size={14} className="mr-2" /> Post Job
           </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100/50 backdrop-blur-sm w-fit rounded-2xl border border-slate-200/50">
        <button
          onClick={() => setActiveTab('openings')}
          className={cn(
            "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
            activeTab === 'openings' ? "bg-white text-primary-olive shadow-sm" : "text-text-light hover:text-text-dark"
          )}
        >
          Open Positions
        </button>
        <button
          onClick={() => setActiveTab('applicants')}
          className={cn(
            "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
            activeTab === 'applicants' ? "bg-white text-primary-olive shadow-sm" : "text-text-light hover:text-text-dark"
          )}
        >
          Applicant Stream
        </button>
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {JOBS.map(job => (
          <Card key={job.id} hover className="p-0 overflow-hidden border-none shadow-sm rounded-[32px] bg-white group">
            <div className="flex flex-col md:flex-row items-stretch md:items-center p-6 gap-8">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Briefcase size={26} className="text-primary-olive" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-[17px] font-black text-text-dark truncate leading-none">{job.title}</h3>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter",
                    job.status === 'Urgent' ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  )}>
                    {job.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div className="flex items-center gap-2 text-text-light">
                    <Building2 size={13} className="text-primary-olive/40" />
                    <span className="text-[12px] font-bold text-text-medium">{job.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-light">
                    <MapPin size={13} className="text-primary-olive/40" />
                    <span className="text-[12px] font-bold text-text-medium">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-light">
                    <Clock size={13} className="text-primary-olive/40" />
                    <span className="text-[12px] font-bold text-text-medium">{job.type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-10 md:px-8 md:border-x border-slate-100">
                <div className="text-center">
                  <p className="text-xl font-black text-text-dark tabular-nums">{job.applicants}</p>
                  <p className="text-[9px] font-black text-text-light uppercase tracking-widest mt-0.5">Applied</p>
                </div>
                <div className="text-center">
                   <p className="text-[13px] font-bold text-text-dark whitespace-nowrap">{job.postedDate}</p>
                   <p className="text-[9px] font-black text-text-light uppercase tracking-widest mt-1">Listed</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button variant="outline" size="sm" className="h-10 px-5 rounded-xl text-[10px] font-black uppercase border-slate-200">
                  Manage
                </Button>
                <Button variant="primary" size="sm" className="h-10 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest">
                  View <ArrowRight size={14} className="ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
