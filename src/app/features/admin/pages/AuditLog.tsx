import { useState, useEffect, useMemo } from 'react'
import { 
  History, Search, Download, 
  ShieldCheck, ShieldAlert, Users, 
  Database, Eye, Calendar,
  Info, AlertTriangle, Monitor,
  Loader2, TrendingUp, Clock,
  Fingerprint, RotateCw
} from 'lucide-react'
import { format } from 'date-fns'
import { Card } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { StatusPill } from '@/shared/components/status/StatusPill'
import { DataTable, type Column } from '@/shared/components/table/DataTable'
import { Pagination } from '@/shared/components/ui/Pagination'
import { auditLogApi } from '../api/auditLogApi'
import type { AuditLog as AuditLogType, AuditLogFilter, AuditLogStats, TopUserAuditStats } from '../model/types'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/cn'
import { useAuthStore } from '@/store'

// ─── User Activity Card ───────────────────────────────────────────────────────

function UserActivityCard({ user }: { user: TopUserAuditStats }) {
  const topAction = user.topActions?.[0]
  return (
    <div className="min-w-64 bg-white rounded-2xl border border-surface-border p-4 shadow-sm hover:border-primary-olive/30 transition-all group">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-[11px] font-black text-primary-olive border border-primary-200">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-text-dark truncate">{user.username}</p>
          <p className="text-[10px] font-bold text-text-light uppercase tracking-widest">{user.totalActions} Total Actions</p>
        </div>
      </div>
      <div className="space-y-2">
        {topAction && (
          <div className="flex items-center justify-between text-[11px] font-bold px-3 py-1.5 bg-surface-hover rounded-lg">
            <span className="text-text-medium uppercase tracking-tight truncate mr-2">Top: {topAction.action.replace(/_/g, ' ')}</span>
            <span className="text-primary-olive bg-white px-1.5 py-0.5 rounded shadow-sm">{topAction.count}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-text-light mt-2 px-1">
          <Clock size={12} className="text-primary-olive/60" />
          <span>Last Active: {format(new Date(user.lastActivity), 'dd MMM, HH:mm')}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page Component ────────────────────────────────────────────────────────

export default function AuditLog() {
  const { user: currentUser } = useAuthStore()
  const [logs, setLogs] = useState<AuditLogType[]>([])
  const [stats, setStats] = useState<AuditLogStats | null>(null)
  const [topUsers, setTopUsers] = useState<TopUserAuditStats[]>([])
  const [recentLogs, setRecentLogs] = useState<AuditLogType[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [totalElements, setTotalElements] = useState(0)
  
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'admin' | 'team'>('admin')
  
  const [selectedLog, setSelectedLog] = useState<AuditLogType | null>(null)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const filter: AuditLogFilter = {
        search: search || undefined,
      }
      const [logRes, statsRes, recentRes] = await Promise.all([
        auditLogApi.getLogs(filter, page - 1, pageSize, 'timestamp', 'desc'),
        auditLogApi.getStatistics(),
        auditLogApi.getRecentLogs(24)
      ])
      setLogs(logRes.content)
      setTotalElements(logRes.totalElements)
      setStats(statsRes)
      setRecentLogs(recentRes)
    } catch {
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const users = await auditLogApi.getTopUsers(10)
      setTopUsers(users)
    } catch {
      // silent fail
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => { fetchLogs() }, [page, pageSize])
  useEffect(() => { fetchUsers() }, [])

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchLogs() }, 400)
    return () => clearTimeout(t)
  }, [search])

  const handleExport = async () => {
    try {
      const csv = await auditLogApi.exportToCsv({ search })
      const url = window.URL.createObjectURL(new Blob([csv]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `audit_logs_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Audit logs exported successfully')
    } catch {
      toast.error('Failed to export logs')
    }
  }

  // Filter logs locally for the tabs
  const filteredData = useMemo(() => {
    if (activeTab === 'admin') {
      return logs.filter(l => l.userId === currentUser?.id)
    }
    return logs.filter(l => l.userId !== currentUser?.id)
  }, [logs, activeTab, currentUser])

  const columns: Column<AuditLogType>[] = [
    {
      key: 'timestamp', header: 'Timestamp', width: '150px',
      render: row => (
        <div className="flex flex-col">
          <span className="text-[12px] font-bold text-text-dark">{format(new Date(row.timestamp), 'dd MMM, HH:mm')}</span>
          <span className="text-[9px] text-text-light font-black uppercase tracking-tighter opacity-60">{format(new Date(row.timestamp), 'yyyy')}</span>
        </div>
      )
    },
    {
      key: 'username', header: 'User Identity', width: '200px',
      render: row => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center text-[10px] font-black text-primary-olive shrink-0 border border-primary-100">
            {row.username.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-black text-text-dark truncate">{row.username}</p>
            <p className="text-[9px] font-bold text-primary-olive/60 uppercase tracking-widest leading-none mt-0.5">
               {row.userId === currentUser?.id ? 'Current Admin' : 'System Contributor'}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'action', header: 'Event Activity',
      render: row => (
        <div className="max-w-100">
          <div className="flex items-center gap-2">
             <span className="text-[11px] font-black text-primary-olive uppercase tracking-tight">{row.action.replace(/_/g, ' ')}</span>
             <span className="w-1 h-1 rounded-full bg-surface-border" />
             <span className="text-[10px] font-bold text-text-light uppercase tracking-widest">{row.entityType}</span>
          </div>
          <p className="text-[11px] text-text-medium font-medium leading-tight mt-1 line-clamp-1 italic">{row.actionDescription}</p>
        </div>
      )
    },
    {
      key: 'status', header: 'Status', align: 'center', width: '100px',
      render: row => <StatusPill status={row.status} className="scale-90 shadow-sm" />
    }
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Main Content Area */}
      <div className="space-y-4">
        <Card padding="none" className="overflow-hidden border-surface-border/60 shadow-xl bg-white rounded-4xl">
          
          {/* Professional Tabbed Header */}
          <div className="px-6 pt-6 pb-0 border-b border-surface-border flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-8 self-stretch md:self-auto">
               <button 
                 onClick={() => { setActiveTab('admin'); setPage(1); }}
                 className={cn(
                   "pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
                   activeTab === 'admin' ? "text-primary-olive" : "text-text-light hover:text-text-medium"
                 )}
               >
                 <div className="flex items-center gap-2">
                   <Fingerprint size={14} />
                   Administrative Control
                 </div>
                 {activeTab === 'admin' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-olive rounded-t-full shadow-[0_-2px_10px_rgba(107, 127, 58,0.3)]" />}
               </button>
               <button 
                 onClick={() => { setActiveTab('team'); setPage(1); }}
                 className={cn(
                   "pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
                   activeTab === 'team' ? "text-primary-olive" : "text-text-light hover:text-text-medium"
                 )}
               >
                 <div className="flex items-center gap-2">
                   <Users size={14} />
                   Team Activity Feed
                 </div>
                 {activeTab === 'team' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-olive rounded-t-full shadow-[0_-2px_10px_rgba(107, 127, 58,0.3)]" />}
               </button>
            </div>

            <div className="flex items-center gap-3 pb-4">
               <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
                  <Input 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search event signature..." 
                    className="pl-10 h-10 w-64 rounded-2xl bg-surface-hover/50 border-transparent focus:bg-white focus:border-primary-olive transition-all shadow-inner"
                  />
               </div>
               <Button variant="ghost" size="sm" onClick={handleExport} className="h-10 rounded-2xl border border-surface-border bg-white font-black uppercase text-[10px] tracking-widest" icon={<Download size={14} />}>
                 Export
               </Button>
               <Button size="sm" onClick={fetchLogs} className="h-10 rounded-2xl bg-primary-olive text-white shadow-lg shadow-primary-olive/20 font-black uppercase text-[10px] tracking-widest" icon={<RotateCw size={14} />}>
                 Refresh
               </Button>
            </div>
          </div>

          {/* Single Table Implementation */}
          <div className="min-h-100">
            <DataTable 
              columns={columns}
              data={filteredData}
              loading={loading}
              rowKey={r => r.id}
              onRowClick={row => setSelectedLog(row)}
              emptyMessage={activeTab === 'admin' ? "No administrative logs recorded" : "No contributor activity found"}
            />
          </div>

          {/* Footer Pagination */}
          <div className="p-5 border-t border-surface-border bg-surface-hover/20 flex items-center justify-between">
            <p className="text-[10px] font-black text-text-light uppercase tracking-widest">
              Showing {filteredData.length} records in {activeTab} profile
            </p>
            <Pagination 
              page={page}
              total={totalElements}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </Card>

        {/* Security Integrity Notice */}
        <div className="p-6 bg-[#40521B]/5 rounded-4xl border-b-8 border-[#40521B] mt-6 group transition-all hover:bg-[#40521B]/10">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-[#40521B] flex items-center justify-center shadow-xl shadow-[#40521B]/20">
               <ShieldCheck size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-black text-black uppercase tracking-widest mb-1.5">Security & Data Integrity Protocol</h3>
              <p className="text-[12px] font-medium text-black leading-relaxed max-w-4xl">
                The logs provided above represent an immutable technical record of all operations across the Studio Architect ecosystem. 
                These records are synchronized in real-time and retained for a standard 365-day compliance window. 
                Internal policy dictates that any administrative or high-impact change is monitored for operational transparency 
                and to ensure a robust security posture.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Intelligence Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Statistics Dashboard */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <Database size={16} className="text-teal-600" />
            </div>
            <h2 className="text-sm font-black text-text-dark uppercase tracking-[0.2em]">System Statistics</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-surface-border shadow-sm">
              <p className="text-[10px] font-black text-text-light uppercase tracking-widest mb-1">Total Logs</p>
              <p className="text-2xl font-black text-text-dark tabular-nums">{stats?.totalLogs || 0}</p>
            </div>
            <div className="p-5 bg-white rounded-3xl border border-surface-border shadow-sm">
              <p className="text-[10px] font-black text-text-light uppercase tracking-widest mb-1">Success Rate</p>
              <p className="text-2xl font-black text-emerald-600 tabular-nums">{stats ? `${Math.round((stats.successfulActions / stats.totalLogs) * 100)}%` : '0%'}</p>
            </div>
            <div className="p-5 bg-white rounded-3xl border border-surface-border shadow-sm">
              <p className="text-[10px] font-black text-text-light uppercase tracking-widest mb-1">Security Alerts</p>
              <p className="text-2xl font-black text-rose-600 tabular-nums">{stats?.failedActions || 0}</p>
            </div>
            <div className="p-5 bg-white rounded-3xl border border-surface-border shadow-sm">
              <p className="text-[10px] font-black text-text-light uppercase tracking-widest mb-1">Unique Actors</p>
              <p className="text-2xl font-black text-amber-600 tabular-nums">{stats?.uniqueUsers || 0}</p>
            </div>
          </div>
        </div>

        {/* Recent API Activity */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-primary-olive/10 flex items-center justify-center">
              <Monitor size={16} className="text-primary-olive" />
            </div>
            <h2 className="text-sm font-black text-text-dark uppercase tracking-[0.2em]">Recent API Events</h2>
          </div>
          <div className="bg-white rounded-4xl border border-surface-border shadow-sm overflow-hidden flex flex-col h-57.5">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {recentLogs.slice(0, 10).map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-surface-hover transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      log.status === 'SUCCESS' ? "bg-emerald-500" : log.status === 'FAILED' ? "bg-rose-500" : "bg-amber-500"
                    )} />
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-text-dark truncate uppercase tracking-tighter">{log.action.replace(/_/g, ' ')}</p>
                      <p className="text-[9px] font-bold text-text-light uppercase">{log.entityType}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-black text-text-dark">{format(new Date(log.timestamp), 'HH:mm:ss')}</p>
                    <p className="text-[9px] font-bold text-text-light">{format(new Date(log.timestamp), 'dd MMM')}</p>
                  </div>
                </div>
              ))}
              {recentLogs.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-text-light opacity-50">
                   <Clock size={32} strokeWidth={1} className="mb-2" />
                   <p className="text-xs font-bold uppercase tracking-widest">No Recent Activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Breakdown Section (Bottom) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-xl bg-primary-olive/10 flex items-center justify-center">
            <TrendingUp size={16} className="text-primary-olive" />
          </div>
          <h2 className="text-sm font-black text-text-dark uppercase tracking-[0.2em]">Staff Activity</h2>
        </div>
        {loadingUsers ? (
          <div className="flex items-center gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {[1, 2, 3, 4].map(i => <div key={i} className="min-w-64 h-36 bg-surface-hover/50 rounded-2xl border border-surface-border animate-pulse" />)}
          </div>
        ) : (
          <div className="flex items-center gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {topUsers.map(user => <UserActivityCard key={user.userId} user={user} />)}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal 
        open={!!selectedLog} 
        onClose={() => setSelectedLog(null)} 
        size="lg" 
        title="System Event Forensic Detail"
        subtitle="Immutable Audit Record"
        icon={<Fingerprint size={22} className="text-[#6B7F3A]" />}
        footer={
          <Button variant="ghost" onClick={() => setSelectedLog(null)} className="rounded-xl font-bold text-[#6B7280]">Dismiss View</Button>
        }
      >
        {selectedLog && (
          <div className="space-y-8">
            <div className="flex items-center justify-between p-5 bg-primary-50 rounded-3xl border border-[#E5E7EB] shadow-inner">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-[#E5E7EB]">
                  <Monitor size={24} className="text-[#6B7F3A]" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-text-light uppercase tracking-widest">Transaction Event</p>
                  <p className="text-lg font-black text-[#111827]">{selectedLog.action.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <StatusPill status={selectedLog.status} className="scale-110 shadow-sm" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-black text-text-light uppercase tracking-widest mb-2 px-1">Actor Profile</p>
                  <div className="p-5 bg-white rounded-3xl border border-[#E5E7EB] shadow-sm space-y-1">
                    <p className="text-[10px] font-black text-text-light uppercase tracking-widest opacity-60">Authorized ID</p>
                    <p className="text-sm font-black text-[#111827]">{selectedLog.username}</p>
                    <div className="mt-3 pt-3 border-t border-[#E5E7EB] flex items-center gap-2 text-[#6B7F3A]">
                       <ShieldCheck size={12} strokeWidth={3} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Authenticated Session</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-black text-text-light uppercase tracking-widest mb-2 px-1">Timeline</p>
                  <div className="p-5 bg-white rounded-3xl border border-[#E5E7EB] shadow-sm flex items-center gap-3 text-sm font-black text-[#111827]">
                    <Calendar size={16} className="text-[#6B7F3A]" />
                    {format(new Date(selectedLog.timestamp), 'PPP ppp')}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-black text-text-light uppercase tracking-widest mb-2 px-1">Subject Resource</p>
                  <div className="p-5 bg-white rounded-3xl border border-[#E5E7EB] shadow-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-text-light uppercase tracking-widest">Resource Type</span>
                      <span className="px-2 py-0.5 bg-primary-50 rounded-lg text-[9px] font-black text-[#6B7F3A] uppercase border border-[#6B7F3A]/20">{selectedLog.entityType}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[10px] font-black text-text-light uppercase tracking-widest">Identifier</span>
                      <span className="font-mono text-[11px] font-bold text-[#111827]">{selectedLog.entityId?.slice(0, 16) || 'N/A'}...</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-black text-text-light uppercase tracking-widest mb-2 px-1">Execution Metrics</p>
                  <div className="p-5 bg-white rounded-3xl border border-[#E5E7EB] shadow-sm flex items-center gap-3 text-sm font-black text-[#111827]">
                    <RotateCw size={16} className="text-amber-500" />
                    {selectedLog.durationMs}ms Backend Latency
                  </div>
                </div>
              </div>
            </div>

            {selectedLog.errorMessage && (
              <div className="p-5 bg-rose-50 border border-rose-100 rounded-3xl flex items-start gap-4 shadow-sm">
                <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-black text-rose-700 uppercase tracking-widest">Runtime Exception</p>
                  <p className="text-[13px] font-bold text-rose-900 mt-1 leading-relaxed">{selectedLog.errorMessage}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-[11px] font-black text-text-light uppercase tracking-widest px-1">Action Semantic Description</p>
              <div className="p-6 bg-primary-50/50 rounded-4xl border border-[#E5E7EB] text-sm font-bold text-[#111827] leading-relaxed shadow-inner">
                {selectedLog.actionDescription}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-text-light uppercase tracking-widest mb-2 px-1">Browser Signature (User Agent)</p>
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-[#E5E7EB] text-[10px] font-mono text-[#6B7280] leading-relaxed whitespace-pre-wrap break-all opacity-80">
                {selectedLog.userAgent}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}





