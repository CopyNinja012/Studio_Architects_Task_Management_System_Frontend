import { useState, useEffect, useRef } from 'react'
import { Play, Square, Send } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { toast } from 'sonner'
import { loadTimer, saveTimer, liveSeconds, fmtDuration } from '@/shared/lib/timer'
import type { TaskApi } from '@/features/admin/model/types'
import { StatusPill } from '@/shared/components/status/StatusPill'

interface Props {
  task: TaskApi
  onSubmit: (task: TaskApi) => void
}

export function RowTimerCell({ task, onSubmit }: Props) {
  const [timerState, setTimerState] = useState(() => loadTimer(task.id))
  const [display,    setDisplay]    = useState(() => liveSeconds(loadTimer(task.id)))
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Sync with other components
  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail.id === task.id) {
        setTimerState(e.detail.state)
        setDisplay(liveSeconds(e.detail.state))
      }
    }
    window.addEventListener('timer_updated', handler)
    return () => window.removeEventListener('timer_updated', handler)
  }, [task.id])

  useEffect(() => {
    if (timerState.startedAt) {
      intervalRef.current = setInterval(() => setDisplay(liveSeconds(timerState)), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setDisplay(timerState.totalSeconds)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [timerState])

  const isRunning = !!timerState.startedAt
  const canWork   = task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS' || task.status === 'REWORK_REQUESTED'
  
  if (!canWork && display === 0) {
    return (
      <div className="flex justify-end">
        <StatusPill status={task.status.toLowerCase() as any} />
      </div>
    )
  }

  const start = (e: React.MouseEvent) => {
    e.stopPropagation()
    const ns = { totalSeconds: timerState.totalSeconds, startedAt: new Date().toISOString() }
    setTimerState(ns)
    saveTimer(task.id, ns)
    toast.success('Timer started')
  }

  const pause = (e: React.MouseEvent) => {
    e.stopPropagation()
    const acc = liveSeconds(timerState)
    const ns = { totalSeconds: acc, startedAt: null }
    setTimerState(ns)
    saveTimer(task.id, ns)
    toast.info(`Paused — ${fmtDuration(acc)} logged`)
  }

  const submit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isRunning) {
      const acc = liveSeconds(timerState)
      const ns = { totalSeconds: acc, startedAt: null }
      setTimerState(ns)
      saveTimer(task.id, ns)
    }
    onSubmit(task)
  }

  return (
    <div className="flex items-center gap-1.5 justify-end" onClick={e => e.stopPropagation()}>
      {(isRunning || display > 0) && (
        <span className={cn(
          'text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded-md border',
          isRunning ? 'text-primary-olive bg-primary-50 border-primary-100' : 'text-text-light bg-surface-hover border-surface-border'
        )}>
          {fmtDuration(display)}
        </span>
      )}
      
      {canWork && (
        <>
          {isRunning ? (
            <button onClick={pause} title="Pause timer" className="w-6 h-6 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 hover:bg-amber-100 transition-colors">
              <Square size={10} />
            </button>
          ) : (
            <button onClick={start} title={display > 0 ? 'Resume timer' : 'Start timer'} className="w-6 h-6 rounded-md bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-olive hover:bg-primary-100 transition-colors">
              <Play size={10} />
            </button>
          )}
          <button 
            onClick={submit} 
            className="flex items-center gap-1 px-2 h-6 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 transition-colors group"
          >
            <Send size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            <span className="text-[9px] font-black uppercase">Submit</span>
          </button>
        </>
      )}
    </div>
  )
}
