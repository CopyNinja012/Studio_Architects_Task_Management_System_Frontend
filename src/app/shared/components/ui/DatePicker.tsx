import { useState, useRef, useEffect } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isSameMonth, addMonths, subMonths,
  isToday, isBefore, isAfter,
} from 'date-fns'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

interface DatePickerProps {
  value?: Date | null
  onChange: (date: Date | null) => void
  label?: string
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
}

const DAYS   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  error,
  required,
  disabled,
  minDate,
  maxDate,
  className,
}: DatePickerProps) {
  const [open,     setOpen]     = useState(false)
  const [openUp,   setOpenUp]   = useState(false)
  const [viewDate, setViewDate] = useState(value ?? new Date())
  const [mode,     setMode]     = useState<'day' | 'month' | 'year'>('day')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setMode('day')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    if (disabled) return
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      // If less than 320px below, open upwards
      setOpenUp(spaceBelow < 320)
    }
    setOpen(!open)
    setMode('day')
  }

  const days     = eachDayOfInterval({ start: startOfMonth(viewDate), end: endOfMonth(viewDate) })
  const startPad = startOfMonth(viewDate).getDay()

  const isDisabledDay = (day: Date) => {
    if (minDate && isBefore(day, minDate)) return true
    if (maxDate && isAfter(day, maxDate))  return true
    return false
  }

  const currentYear  = viewDate.getFullYear()
  const yearStart    = Math.floor(currentYear / 12) * 12
  const yearRange    = Array.from({ length: 12 }, (_, i) => yearStart + i)

  return (
    <div className={cn('flex flex-col gap-1.5', className)} ref={ref}>
      {label && (
        <label className="text-xs font-bold text-[#111827] uppercase tracking-wider">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger */}
      <div className="relative">
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          onClick={handleOpen}
          onKeyDown={e => !disabled && e.key === 'Enter' && handleOpen()}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg border bg-white text-xs text-left',
            'transition-all duration-200 focus:outline-none cursor-pointer',
            open
              ? 'border-[#6B7F3A] ring-4 ring-[#6B7F3A]/5'
              : 'border-[#E5E7EB] hover:border-[#6B7F3A]/30',
            error    && 'border-red-400',
            disabled && 'opacity-50 cursor-not-allowed bg-[#F9FAFB]'
          )}
        >
          <Calendar size={14} className={cn('shrink-0 transition-colors', open ? 'text-[#6B7F3A]' : 'text-[#9CA3AF]')} />
          <span className={cn('flex-1 truncate', value ? 'text-[#111827] font-bold' : 'text-[#9CA3AF] font-medium')}>
            {value ? format(value, 'dd MMM yyyy') : placeholder}
          </span>
          {value && !disabled && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(null) }}
              className="shrink-0 text-[#9CA3AF] hover:text-red-500 transition-colors p-0.5 rounded-md hover:bg-red-50"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* ── Calendar Popover ─────────────────────────────────── */}
        {open && (
          <div
            className={cn(
              "absolute z-70 left-0 bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] animate-scale-in overflow-hidden",
              openUp ? "bottom-full mb-2" : "top-full mt-2"
            )}
            style={{ width: '230px', boxShadow: '0 12px 48px rgba(0,0,0,0.15)' }}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-2.5 py-2 border-b border-[#E5E7EB] bg-[#F8FAF5]">
              <button
                type="button"
                onClick={() => mode === 'year'
                  ? setViewDate(d => new Date(d.getFullYear() - 12, d.getMonth(), 1))
                  : setViewDate(subMonths(viewDate, 1))
                }
                className="w-5.5 h-5.5 rounded-lg hover:bg-[#6B7F3A]/10 flex items-center justify-center text-[#6B7F3A] transition-colors"
              >
                <ChevronLeft size={12} strokeWidth={3} />
              </button>

              {/* Month / Year toggle */}
              <button
                type="button"
                onClick={() => setMode(m => m === 'day' ? 'month' : m === 'month' ? 'year' : 'day')}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg hover:bg-[#6B7F3A]/10 text-[#111827] text-[10px] font-black uppercase tracking-wider transition-colors"
              >
                {mode === 'year'
                  ? `${yearStart}–${yearStart + 11}`
                  : mode === 'month'
                  ? format(viewDate, 'yyyy')
                  : format(viewDate, 'MMM yyyy')
                }
              </button>

              <button
                type="button"
                onClick={() => mode === 'year'
                  ? setViewDate(d => new Date(d.getFullYear() + 12, d.getMonth(), 1))
                  : setViewDate(addMonths(viewDate, 1))
                }
                className="w-5.5 h-5.5 rounded-lg hover:bg-[#6B7F3A]/10 flex items-center justify-center text-[#6B7F3A] transition-colors"
              >
                <ChevronRight size={12} strokeWidth={3} />
              </button>
            </div>

            <div className="p-1.5">
              {/* ── Year picker ─────────────────────────────── */}
              {mode === 'year' && (
                <div className="grid grid-cols-4 gap-0.5">
                  {yearRange.map(yr => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => { setViewDate(new Date(yr, viewDate.getMonth(), 1)); setMode('month') }}
                      className={cn(
                        'py-1 rounded-lg text-[10px] font-black transition-all',
                        yr === currentYear
                          ? 'bg-[#6B7F3A] text-white shadow-md'
                          : 'text-[#6B7280] hover:bg-[#F8FAF5] hover:text-[#6B7F3A]'
                      )}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Month picker ─────────────────────────────── */}
              {mode === 'month' && (
                <div className="grid grid-cols-3 gap-0.5">
                  {MONTHS.map((m, i) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setViewDate(new Date(currentYear, i, 1)); setMode('day') }}
                      className={cn(
                        'py-1.5 rounded-lg text-[10px] font-black transition-all uppercase tracking-wider',
                        i === viewDate.getMonth()
                          ? 'bg-[#6B7F3A] text-white shadow-md'
                          : 'text-[#6B7280] hover:bg-[#F8FAF5] hover:text-[#6B7F3A]'
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Day picker ───────────────────────────────── */}
              {mode === 'day' && (
                <>
                  {/* Day-of-week headers */}
                  <div className="grid grid-cols-7 mb-0.5">
                    {DAYS.map(d => (
                      <div key={d} className="text-center text-[8.5px] font-black text-[#9CA3AF] py-0.5 uppercase tracking-widest">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Day cells */}
                  <div className="grid grid-cols-7 gap-0.5">
                    {Array.from({ length: startPad }).map((_, i) => <div key={`p${i}`} />)}
                    {days.map(day => {
                      const sel      = value && isSameDay(day, value)
                      const todayDay = isToday(day)
                      const inMonth  = isSameMonth(day, viewDate)
                      const dis      = isDisabledDay(day)

                      return (
                        <button
                          key={day.toISOString()}
                          type="button"
                          disabled={dis}
                          onClick={() => { onChange(day); setOpen(false); setMode('day') }}
                          className={cn(
                            'w-full aspect-square flex items-center justify-center text-[10px] rounded-lg transition-all duration-150',
                            sel      && 'bg-[#6B7F3A] text-white font-black shadow-lg shadow-[#6B7F3A]/20 scale-110 z-10',
                            !sel && todayDay && 'text-[#6B7F3A] font-black ring-1 ring-[#6B7F3A]/50 bg-[#F8FAF5]',
                            !sel && !todayDay && inMonth  && !dis && 'text-[#111827] font-bold hover:bg-[#F3F5EE] hover:text-[#6B7F3A]',
                            !sel && !inMonth  && 'text-[#9CA3AF]/40',
                            dis      && 'opacity-20 cursor-not-allowed'
                          )}
                        >
                          {format(day, 'd')}
                        </button>
                      )
                    })}
                  </div>

                  {/* Footer */}
                  <div className="mt-1.5 pt-1.5 border-t border-[#E5E7EB] flex items-center justify-between px-1">
                    <button
                      type="button"
                      onClick={() => { onChange(new Date()); setOpen(false) }}
                      className="text-[9px] font-black text-[#6B7F3A] uppercase tracking-widest hover:text-[#4B5A2A] transition-colors px-1.5 py-0.5 rounded-md hover:bg-[#F8FAF5]"
                    >
                      Today
                    </button>
                    {value && (
                      <button
                        type="button"
                        onClick={() => { onChange(null); setOpen(false) }}
                        className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-widest hover:text-red-500 transition-colors px-1.5 py-0.5 rounded-md hover:bg-red-50"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-[11px] font-bold text-red-500 mt-1">{error}</p>}
    </div>
  )
}


