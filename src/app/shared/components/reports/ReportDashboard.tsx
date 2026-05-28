import { useState, useEffect, useMemo } from 'react'
import { Users, Search, ChevronDown, UserCheck } from 'lucide-react'
import { adminApi } from '@/features/admin/api/adminApi'
import type { AdminUser } from '@/features/admin/model/types'
import EmployeeReportView from './EmployeeReportView'
import { cn } from '@/shared/lib/cn'
import { Avatar } from '@/shared/components/ui/Avatar'
import { PageLoader } from '@/shared/components/ui/Loader'

export default function ReportDashboard() {
  const [employees, setEmployees] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    adminApi.getUsers(0, 1000)
      .then(res => {
        setEmployees(res.content)
        if (res.content.length > 0) {
          setSelectedId(res.content[0].id)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return employees.filter(e => 
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
    )
  }, [employees, search])

  const selectedUser = useMemo(() => 
    employees.find(e => e.id === selectedId), 
    [employees, selectedId]
  )

  if (loading) return <PageLoader />

  return (
    <div className="space-y-12 animate-fade-in pb-10">
      
      {/* ── Selection Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[20px] bg-primary-olive/10 flex items-center justify-center text-primary-olive">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-dark tracking-tight">Talent Intelligence</h1>
            <p className="text-[11px] font-bold text-text-light uppercase tracking-widest mt-0.5">Global Staff Performance Analytics</p>
          </div>
        </div>

        {/* Custom Modern Dropdown */}
        <div className="relative w-full md:w-80">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between gap-3 px-5 h-14 bg-white border border-[#E5E7EB] rounded-2xl hover:border-primary-olive/30 hover:shadow-premium transition-all text-left group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={selectedUser?.name || '?'} size="sm" className="ring-2 ring-white" />
              <div className="min-w-0">
                <p className="text-xs font-black text-[#111827] truncate">
                  {selectedUser?.name || 'Select Employee'}
                </p>
                <p className="text-[10px] font-bold text-text-light truncate uppercase tracking-tighter">
                  {selectedUser?.roles?.[0]?.replace('_', ' ') || 'Consultant'}
                </p>
              </div>
            </div>
            <ChevronDown size={18} className={cn("text-text-light transition-transform duration-300", isDropdownOpen && "rotate-180")} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3 border-b border-[#F1F5F9]">
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                  <input
                    autoFocus
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search name or email..."
                    className="w-full pl-9 pr-3 h-10 bg-slate-50 border-none rounded-xl text-xs font-bold text-text-dark focus:ring-2 focus:ring-primary-olive/10 outline-none"
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {filtered.map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => {
                      setSelectedId(emp.id)
                      setIsDropdownOpen(false)
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left",
                      selectedId === emp.id ? "bg-primary-olive text-white" : "hover:bg-slate-50 text-text-dark"
                    )}
                  >
                    <Avatar name={emp.name} size="sm" className={cn("ring-2", selectedId === emp.id ? "ring-primary-olive" : "ring-white")} />
                    <div className="min-w-0">
                      <p className={cn("text-[11.5px] font-black truncate", selectedId === emp.id ? "text-white" : "text-[#111827]")}>
                        {emp.name}
                      </p>
                      <p className={cn("text-[9px] font-bold uppercase tracking-tighter truncate opacity-70", selectedId === emp.id ? "text-white/80" : "text-text-light")}>
                        {emp.email}
                      </p>
                    </div>
                    {selectedId === emp.id && <UserCheck size={14} className="ml-auto shrink-0" />}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-[11px] font-bold text-text-light italic">No matches found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-px bg-linear-to-r from-transparent via-[#E5E7EB] to-transparent mx-4" />

      {/* ── Individual Report View ──────────────────────────────────────── */}
      {selectedId && selectedUser ? (
        <EmployeeReportView 
          key={selectedId} 
          userId={selectedId} 
          userName={selectedUser.name} 
        />
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-center space-y-4">
           <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300">
              <Users size={32} />
           </div>
           <div>
              <p className="text-lg font-black text-text-dark">No Selection Detected</p>
              <p className="text-sm font-medium text-text-light max-w-xs">Please choose an employee from the dropdown above to synchronize their performance data.</p>
           </div>
        </div>
      )}
    </div>
  )
}
