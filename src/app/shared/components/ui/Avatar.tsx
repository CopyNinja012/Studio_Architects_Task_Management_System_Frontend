import { cn } from '@/shared/lib/cn'
import { getInitials } from '@/shared/lib/format'

interface AvatarProps {
  name: string
  src?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  online?: boolean
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg',
}

const dotSizes = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-3.5 h-3.5',
}

const colors = [
  'bg-primary-olive text-white',
  'bg-primary-600 text-white',
  'bg-primary-secondary text-white',
  'bg-teal-600 text-white',
  'bg-indigo-600 text-white',
  'bg-orange-600 text-white',
  'bg-teal-600 text-white',
]

function getColor(name: string) {
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

export function Avatar({ name, src, size = 'md', className, online }: AvatarProps) {
  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn('rounded-full object-cover ring-2 ring-white', sizes[size])}
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-semibold ring-2 ring-white',
            sizes[size],
            getColor(name)
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-white',
            dotSizes[size],
            online ? 'bg-emerald-500' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  )
}

