import { useEffect, useState, useMemo } from 'react'
import {
  Search, Mail, Phone, X,
  Users, UserPlus, Download,
  UserX, UserCheck
} from 'lucide-react'
import { Card } from '@/shared/components/ui/Card'
import { Avatar } from '@/shared/components/ui/Avatar'
import { Button } from '@/shared/components/ui/Button'
import { DataTable, type Column } from '@/shared/components/table/DataTable'
import { Pagination } from '@/shared/components/ui/Pagination'
import { PageLoader } from '@/shared/components/ui/Loader'
import { Dropdown } from '@/shared/components/ui/Dropdown'
import { adminApi } from '@/features/admin/api/adminApi'
import type { AdminUser } from '@/features/admin/model/types'
import { normalizeRole } from '@/shared/config/role'
import { cn } from '@/shared/lib/cn'
import { toast } from 'sonner'
import { formatDate } from '@/shared/lib/date'
import { ROLE_BADGE, ROLE_LABEL } from '@/features/admin/model/constant'
import { AddRoleModal } from '@/features/admin/components/AddRoleModal'
import { UserDetailModal } from '@/features/admin/components/UserDetailModal'

export default function HREmployees() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [addOpen, setAddOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [detailId, setDetailId] = useState<string | null>(null)

  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getUsers(page, 10)
      setUsers(res.content)
      setTotalElements(res.totalElements)
    } catch (err) {
      toast.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (user: AdminUser) => {
    const action = user.enabled ? 'disable' : 'enable'
    if (!confirm(`Are you sure you want to ${action} account for ${user.name}?`)) return
    
    setTogglingId(user.id)
    try {
      if (user.enabled) {
        await adminApi.disableUser(user.id)
        toast.success('Account access restricted')
      } else {
        await adminApi.enableUser(user.id)
        toast.success('Account access restored')
      }
      fetchUsers()
    } catch {
      toast.error(`Failed to ${action} account`)
    } finally {
      setTogglingId(null)
    }
  }

  useEffect(() => { fetchUsers() }, [page])

  const filtered = useMemo(() => {
    return users
      .filter(u => {
        const role = normalizeRole(u.roles?.[0] || '')
        const matchRole = roleFilter === 'all' || role === roleFilter
        const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? u.enabled : !u.enabled)
        const matchSearch =
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
        return matchRole && matchStatus && matchSearch
      })
      .sort((a, b) => {
        const roleA = normalizeRole(a.roles?.[0] || '')
        const roleB = normalizeRole(b.roles?.[0] || '')
        const isAAdmin = roleA === 'admin'
        const isBAdmin = roleB === 'admin'

        if (isAAdmin && !isBAdmin) return -1
        if (!isAAdmin && isBAdmin) return 1
        
        return a.name.localeCompare(b.name)
      })
  }, [users, roleFilter, statusFilter, search])

  const columns: Column<AdminUser>[] = [
    {
      key: 'name', 
      header: 'Employee Info',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" online={row.enabled} />
          <div>
            <p className="text-sm font-bold text-text-dark">{row.name}</p>
            <p className="text-[10px] text-text-light font-medium flex items-center gap-1 mt-0.5">
              <Mail size={9} /> {row.email}
            </p>
          </div>
        </div>
      ),
    },
    { 
      key: 'roles', 
      header: 'Designation', 
      render: (row) => { 
        const role = normalizeRole(row.roles?.[0] || 'employee')
        return (
          <span className={cn(
            'px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider', 
            ROLE_BADGE[role] || 'bg-gray-100 text-gray-600'
          )}>
            {ROLE_LABEL[role] || role}
          </span>
        ) 
      } 
    },
    { 
      key: 'dateOfJoining', 
      header: 'Join Date', 
      render: (row) => <p className="text-xs text-text-medium font-bold">{formatDate(row.dateOfJoining)}</p> 
    },
    { 
      key: 'phone', 
      header: 'Contact', 
      render: (row) => (
        <p className="text-xs text-text-medium font-medium flex items-center gap-1">
          <Phone size={10} className="text-text-light" /> {row.phone || '—'}
        </p>
      ) 
    },
    { 
      key: 'enabled', 
      header: 'Status', 
      align: 'center', 
      render: (row) => (
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border', 
          row.enabled 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-red-50 text-red-600 border-red-200'
        )}>
          {row.enabled ? 'Active' : 'Inactive'}
        </span>
      ) 
    },
    { 
      key: 'actions', 
      header: 'Control', 
      align: 'right', 
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "h-8 px-3 text-[10px] font-black uppercase tracking-tighter transition-all",
              row.enabled 
                ? "text-rose-600 border-rose-100 hover:bg-rose-50" 
                : "text-emerald-600 border-emerald-100 hover:bg-emerald-50"
            )}
            onClick={(e) => {
              e.stopPropagation()
              handleToggleStatus(row)
            }}
            loading={togglingId === row.id}
          >
            {row.enabled ? <UserX size={12} className="mr-1.5" /> : <UserCheck size={12} className="mr-1.5" />}
            {row.enabled ? 'Suspend' : 'Restore'}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full hover:bg-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
             <Download size={14} className="text-text-light" />
          </Button>
        </div>
      ) 
    },
  ]

  if (loading && users.length === 0) return <PageLoader />

  return (
    <div className="space-y-6 animate-fade-in">
      <Card padding="none" className="border border-surface-border shadow-sm overflow-visible bg-transparent">
        
        {/* ── Toolbar ────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-surface-border bg-white relative z-30 overflow-visible rounded-t-2xl">
          <div className="relative shrink-0 w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search staff…" 
              className="w-full pl-9 pr-3 h-8 text-[12px] border border-surface-border rounded-lg bg-white focus:outline-none focus:border-[#40521B] focus:ring-2 focus:ring-[#40521B]/10 transition-all font-medium placeholder:text-text-light" 
            />
          </div>
          <div className="h-6 w-px bg-surface-border shrink-0" />
          <div className="flex items-center gap-1 shrink-0">
            {([
              { value: 'all', label: 'All' }, 
              { value: 'active', label: 'Active' }, 
              { value: 'inactive', label: 'Inactive' }
            ] as const).map(pill => (
              <button 
                key={pill.value} 
                onClick={() => setStatusFilter(pill.value)} 
                className={cn(
                  'flex items-center gap-1 px-2.5 h-7 rounded-full text-[11px] font-bold border transition-all whitespace-nowrap', 
                  statusFilter === pill.value 
                    ? 'bg-[#40521B] text-white border-[#40521B]' 
                    : 'bg-white text-text-light border-surface-border hover:border-[#E9EDDF] hover:text-[#40521B]'
                )}
              >
                {pill.label}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-surface-border shrink-0" />
          <div className="shrink-0 w-40">
            <Dropdown 
              options={[
                { value: 'all', label: 'All Roles' }, 
                ...Object.entries(ROLE_LABEL).map(([v, l]) => ({ value: v, label: l }))
              ]} 
              value={roleFilter} 
              onChange={v => setRoleFilter(v)} 
              placeholder="Role" 
            />
          </div>
          {(search || statusFilter !== 'all' || roleFilter !== 'all') && (
            <button 
              onClick={() => { 
                setSearch('')
                setStatusFilter('all')
                setRoleFilter('all') 
              }} 
              className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 px-2 h-7 rounded-lg hover:bg-red-50 transition-colors"
            >
              <X size={12} /> Clear
            </button>
          )}
          <div className="flex-1" />
          <Button 
            onClick={() => setAddOpen(true)} 
            icon={<UserPlus size={14} />} 
            className="shrink-0 h-8 text-[12px] px-3 font-black uppercase tracking-widest bg-primary-olive text-white shadow-lg shadow-primary-olive/20"
          >
            Add Staff
          </Button>
        </div>

        {/* ── Table & Pagination Wrapper ────────────────────────────────────────── */}
        <div className="rounded-b-2xl overflow-hidden relative z-10 bg-white">
          <DataTable 
            columns={columns} 
            data={filtered} 
            loading={loading} 
            rowKey={r => r.id} 
            onRowClick={row => setDetailId(row.id)}
            emptyMessage="No staff found" 
            emptyIcon={<Users size={40} />} 
          />
          <div className="px-5 py-3.5 border-t border-surface-border bg-white">
            <Pagination 
              page={page + 1} 
              total={totalElements} 
              pageSize={10} 
              onPageChange={(p) => setPage(p - 1)} 
            />
          </div>
        </div>
      </Card>
      <AddRoleModal open={addOpen} onClose={() => setAddOpen(false)} onSuccess={fetchUsers} />
      <UserDetailModal id={detailId} open={!!detailId} onClose={() => setDetailId(null)} />
    </div>
  )
}
