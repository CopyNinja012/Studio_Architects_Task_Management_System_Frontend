import { type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
  glass?: boolean
  gradient?: boolean
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ children, className, hover, onClick, padding = 'md', glass, gradient }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{ background: '#FFFFFF' }}
      className={cn(
        'relative overflow-hidden rounded-[24px] border border-[#E5E7EB] transition-all duration-300',
        glass ? 'backdrop-blur-xl bg-white/80' : 'bg-white',
        'shadow-[0_4px_24px_rgba(0,0,0,0.03)]',
        hover && 'hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 cursor-pointer hover:border-[#D1D5DB]',
        paddings[padding],
        className
      )}
    >
      {gradient && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4B5A2A] via-[#6B7F3A] to-[#A3B18A]" />
      )}
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  icon?: ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, action, icon, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-6', className)}>
      <div className="flex items-center gap-4">
        {icon && (
          <div className="flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-[17px] font-black text-[#111827] tracking-tight leading-none">{title}</h3>
          {subtitle && <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mt-1.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

