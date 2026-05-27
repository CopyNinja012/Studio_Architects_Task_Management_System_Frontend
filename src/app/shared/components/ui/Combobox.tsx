import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, Plus } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
  onCustomValue?: (value: string) => void
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select or type...',
  label,
  error,
  required,
  disabled,
  className,
  onCustomValue,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = options.find(o => o.value === value)
  
  // When closed and we have a selected value, set query to its label
  useEffect(() => {
    if (!open && selected) {
      setQuery(selected.label)
    } else if (!open && !value) {
      setQuery('')
    }
  }, [open, selected, value])

  const filtered = query === ''
    ? options
    : options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (val: string) => {
    onChange(val)
    setOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    if (!open) setOpen(true)
    // If user clears input, clear value
    if (e.target.value === '') {
      onChange('')
    }
  }

  const handleFocus = () => {
    setOpen(true)
  }

  const handleCreateNew = () => {
    if (query && onCustomValue) {
      onCustomValue(query)
      setOpen(false)
    }
  }

  const isExactMatch = options.some(o => o.label.toLowerCase() === query.toLowerCase())

  return (
    <div className={cn('flex flex-col gap-1.5', className)} ref={ref}>
      {label && (
        <label className="text-sm font-medium text-text-dark">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="relative group">
          <input
            ref={inputRef}
            type="text"
            disabled={disabled}
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-lg border bg-white text-sm',
              'transition-all duration-200 outline-none pr-10',
              open ? 'border-primary-secondary ring-2 ring-primary-secondary/20' : 'border-surface-border hover:border-primary-300',
              error && 'border-red-400',
              disabled && 'opacity-50 cursor-not-allowed bg-background'
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light flex items-center gap-1 pointer-events-none">
            <ChevronDown size={14} className={cn('transition-transform duration-200', open && 'rotate-180')} />
          </div>
        </div>

        {open && (
          <div className="absolute z-100 w-full mt-1 bg-white border border-surface-border rounded-xl shadow-xl animate-scale-in overflow-hidden">
            <div className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0 && !query && (
                <div className="px-3 py-4 text-center">
                   <p className="text-xs text-text-light font-bold uppercase tracking-widest">No templates found</p>
                </div>
              )}
              
              {filtered.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 text-sm text-left',
                    'hover:bg-primary-50 transition-colors duration-150',
                    option.value === value && 'bg-primary-50 text-primary-olive font-bold'
                  )}
                >
                  <span>{option.label}</span>
                  {option.value === value && <Check size={14} className="text-primary-olive" />}
                </button>
              ))}

              {query && !isExactMatch && onCustomValue && (
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="w-full flex items-center gap-2 px-3 py-3 text-sm text-primary-olive font-black border-t border-surface-border hover:bg-primary-50 transition-colors"
                >
                  <Plus size={14} />
                  <span>Use "{query}" as new template</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

