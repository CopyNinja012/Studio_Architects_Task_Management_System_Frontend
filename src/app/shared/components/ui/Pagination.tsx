import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

interface PaginationProps {
  page: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  className?: string
  /** Legacy prop alias */
  onChange?: (page: number) => void
}

export function Pagination({
  page,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className,
  onChange,
}: PaginationProps) {
  const handlePageChange = onPageChange ?? onChange ?? (() => {})
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end   = Math.min(page * pageSize, total)

  // Build visible page numbers: always show first, last, current ±1, with ellipsis
  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  const btnBase = cn(
    'flex items-center justify-center rounded-lg border border-surface-border',
    'text-[12px] font-semibold text-text-medium transition-all duration-150',
    'hover:bg-primary-50 hover:border-primary-300 hover:text-primary-olive',
    'disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-surface-border disabled:hover:text-text-medium'
  )

  return (
    <div className={cn('flex items-center justify-between gap-4 flex-wrap', className)}>

      {/* Left: showing info */}
      <p className="text-[12px] text-text-light font-medium shrink-0">
        Showing{' '}
        <span className="font-bold text-text-dark">{start}</span>
        {' '}to{' '}
        <span className="font-bold text-text-dark">{end}</span>
        {' '}of{' '}
        <span className="font-bold text-text-dark">{total}</span>
        {' '}projects
      </p>

      {/* Right: per-page + nav */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Per-page selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={e => { onPageSizeChange(Number(e.target.value)); handlePageChange(1) }}
              className="h-8 pl-3 pr-7 rounded-lg border border-surface-border bg-white text-[12px] font-semibold
                         text-text-dark focus:outline-none focus:border-primary-olive cursor-pointer appearance-none
                         bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')]
                         bg-no-repeat bg-position-[right_8px_center]"
            >
              {pageSizeOptions.map(s => (
                <option key={s} value={s}>{s} per page</option>
              ))}
            </select>
          </div>
        )}

        {/* First */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={page === 1}
          className={cn(btnBase, 'w-8 h-8')}
        >
          <ChevronsLeft size={14} />
        </button>

        {/* Prev */}
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className={cn(btnBase, 'w-8 h-8')}
        >
          <ChevronLeft size={14} />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pages.map((p, i) =>
            p === '...' ? (
              <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-[12px] text-text-light">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => handlePageChange(p as number)}
                className={cn(
                  'w-8 h-8 rounded-lg text-[12px] font-bold transition-all duration-150',
                  p === page
                    ? 'bg-primary-olive text-white shadow-sm shadow-primary-olive/30'
                    : cn(btnBase, 'w-8 h-8')
                )}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Next */}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className={cn(btnBase, 'w-8 h-8')}
        >
          <ChevronRight size={14} />
        </button>

        {/* Last */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={page === totalPages}
          className={cn(btnBase, 'w-8 h-8')}
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  )
}

