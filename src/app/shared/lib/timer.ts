// src/app/shared/lib/timer.ts

export interface TimerState {
  totalSeconds: number
  startedAt: string | null
}

export function timerKey(id: string) {
  return `task_timer_${id}`
}

export function loadTimer(id: string): TimerState {
  try {
    const r = localStorage.getItem(timerKey(id))
    if (r) return JSON.parse(r)
  } catch {}
  return { totalSeconds: 0, startedAt: null }
}

export function saveTimer(id: string, s: TimerState) {
  localStorage.setItem(timerKey(id), JSON.stringify(s))
  // Notify other components in the same window
  window.dispatchEvent(new CustomEvent('timer_updated', { detail: { id, state: s } }))
}

export function clearTimer(id: string) {
  localStorage.removeItem(timerKey(id))
  // Notify other components in the same window
  window.dispatchEvent(new CustomEvent('timer_updated', { detail: { id, state: { totalSeconds: 0, startedAt: null } } }))
}

export function liveSeconds(s: TimerState) {
  if (!s.startedAt) return s.totalSeconds
  return s.totalSeconds + Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 1000)
}

export function fmtDuration(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function secondsToHours(sec: number) {
  return Math.round((sec / 3600) * 10) / 10
}
