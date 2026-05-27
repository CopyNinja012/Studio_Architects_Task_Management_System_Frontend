import { format, parseISO, isValid, differenceInDays, addDays } from 'date-fns'

export const formatDate = (date: string | Date, fmt = 'dd MMM yyyy'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isValid(d) ? format(d, fmt) : '—'
}

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd MMM yyyy, HH:mm')
}

export const daysRemaining = (endDate: string | Date): number => {
  const d = typeof endDate === 'string' ? parseISO(endDate) : endDate
  return differenceInDays(d, new Date())
}

export const addDaysToDate = (date: Date, days: number): Date => {
  return addDays(date, days)
}

export { format, parseISO, isValid }
