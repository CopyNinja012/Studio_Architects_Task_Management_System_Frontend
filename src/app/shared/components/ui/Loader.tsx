import { cn } from '@/shared/lib/cn'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function Loader({ size = 'md', className, text }: LoaderProps) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn('relative', sizes[size])}>
        <div className={cn('absolute inset-0 rounded-full border-2 border-primary-100')} />
        <div className={cn('absolute inset-0 rounded-full border-2 border-transparent border-t-primary-olive animate-spin')} />
      </div>
      {text && <p className="text-sm text-text-muted">{text}</p>}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-100">
      <Loader size="lg" text="Loading..." />
    </div>
  )
}

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 skeleton rounded" />
        </td>
      ))}
    </tr>
  )
}

