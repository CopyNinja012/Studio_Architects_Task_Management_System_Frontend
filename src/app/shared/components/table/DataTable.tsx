import { type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { SkeletonRow } from '../ui/Loader'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  onRowClick?: (row: T) => void
  emptyMessage?: string
  emptyIcon?: ReactNode
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (key: string) => void
  rowKey: (row: T) => string
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  loading,
  onRowClick,
  emptyMessage = 'No data found',
  emptyIcon,
  sortKey,
  sortDir,
  onSort,
  rowKey,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">

          {/* ── Header ─────────────────────────────────────────────── */}
          <thead>
            <tr className="border-b border-surface-border">
              {columns.map(col => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && onSort?.(col.key)}
                  className={cn(
                    'px-5 py-3 bg-white text-[10px] font-black text-text-light uppercase tracking-[0.14em] whitespace-nowrap select-none',
                    col.align === 'center' && 'text-center',
                    col.align === 'right'  && 'text-right',
                    !col.align             && 'text-left',
                    col.sortable && 'cursor-pointer hover:text-primary-olive transition-colors'
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <span className="text-text-light/50">
                        {sortKey === col.key
                          ? sortDir === 'asc'
                            ? <ChevronUp   size={11} className="text-primary-olive" />
                            : <ChevronDown size={11} className="text-primary-olive" />
                          : <ChevronsUpDown size={11} />
                        }
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Body ───────────────────────────────────────────────── */}
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} cols={columns.length} />
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    {emptyIcon && <div className="text-text-light/40">{emptyIcon}</div>}
                    <p className="text-sm font-medium text-text-light">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-b border-surface-border transition-colors duration-100',
                    idx % 2 === 0 ? 'bg-white' : 'bg-white',
                    onRowClick && 'cursor-pointer hover:bg-primary-50'
                  )}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-5 py-4 text-text-medium whitespace-nowrap',
                        col.align === 'center' && 'text-center',
                        col.align === 'right'  && 'text-right'
                      )}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

