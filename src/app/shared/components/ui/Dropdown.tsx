import { useState, useRef, useEffect, type ReactNode } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export interface DropdownOption {
  value: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

interface DropdownProps {
  options: DropdownOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
  searchable?: boolean
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select option',
  label,
  error,
  required,
  disabled,
  className,
  searchable,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)

  const filtered = searchable
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className={cn('flex flex-col gap-1.5', className)} ref={ref}>
      {label && (
        <label className="text-sm font-medium text-text-dark">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(!open)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 rounded-lg border bg-white text-sm',
            'transition-all duration-200 cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-primary-secondary/20',
            open ? 'border-primary-secondary ring-2 ring-primary-secondary/20' : 'border-surface-border hover:border-surface-border-strong',
            error && 'border-red-400',
            disabled && 'opacity-50 cursor-not-allowed bg-background'
          )}
        >
          <span className={cn('flex items-center gap-2', !selected && 'text-text-muted')}>
            {selected?.icon && <span className="text-primary-secondary">{selected.icon}</span>}
            <span className={selected ? 'text-text-dark' : 'text-text-muted'}>
              {selected?.label || placeholder}
            </span>
          </span>
          <ChevronDown
            size={16}
            className={cn('text-text-muted transition-transform duration-200', open && 'rotate-180')}
          />
        </button>

        {open && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-surface-border rounded-xl shadow-lg animate-scale-in overflow-hidden">
            {searchable && (
              <div className="p-2 border-b border-surface-border">
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-2 py-1.5 text-sm border border-surface-border rounded-lg focus:outline-none focus:border-primary-secondary"
                />
              </div>
            )}
            <div className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <div className="px-3 py-2 text-sm text-text-muted text-center">No options found</div>
              ) : (
                filtered.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                      setSearch('')
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 text-sm text-left',
                      'hover:bg-primary-100 transition-colors duration-150',
                      option.value === value && 'bg-primary-100 text-primary-olive font-medium',
                      option.disabled && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {option.icon && <span className="text-primary-secondary">{option.icon}</span>}
                      {option.label}
                    </span>
                    {option.value === value && <Check size={14} className="text-primary-olive" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

