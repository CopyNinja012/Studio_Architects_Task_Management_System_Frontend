import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/shared/lib/cn'
import { Button } from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: ReactNode
  icon?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-[96vw] h-[92vh]',
}

export function Modal({ 
  open, 
  onClose, 
  title, 
  subtitle, 
  icon,
  children, 
  footer, 
  size = 'md', 
  className, 
  padding = 'md' 
}: ModalProps) {
  
  // Handle Background Scroll Locking
  useEffect(() => {
    if (!open) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = originalOverflow }
  }, [open])

  // Handle ESC Key
  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden">
          
          {/* ── Overlay / Backdrop ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
            onClick={onClose}
          />

          {/* ── Modal Container ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative w-full bg-white/95 backdrop-blur-xl rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.25)]',
              'border border-white/40 flex flex-col max-h-[90vh] overflow-hidden',
              sizes[size],
              className
            )}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Premium Header */}
            {(title || subtitle) && (
              <div className="flex items-center justify-between px-8 py-7 border-b border-primary-100 bg-primary-50/30 shrink-0">
                <div className="flex items-center gap-5">
                  {icon && (
                    <div className="w-12 h-12 rounded-[20px] bg-white flex items-center justify-center border border-primary-100 shadow-sm shrink-0">
                      <span className="text-primary-olive">{icon}</span>
                    </div>
                  )}
                  <div className="space-y-1">
                    <h2 className="text-[22px] font-black text-text-dark tracking-tight leading-none">{title}</h2>
                    {subtitle && <div className="text-[10px] font-black text-primary-olive uppercase tracking-[0.2em] leading-none">{subtitle}</div>}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-2xl hover:bg-rose-50 text-text-light hover:text-rose-600 transition-all border border-transparent hover:border-rose-100 flex items-center justify-center shrink-0 group"
                  aria-label="Close modal"
                >
                  <X size={22} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
            )}

            {/* Scrollable Content Body */}
            <div className={cn(
              'flex-1 overflow-y-auto custom-scrollbar bg-white',
              padding === 'none' ? 'p-0' : 
              padding === 'sm' ? 'p-5' : 
              padding === 'lg' ? 'p-12' : 
              'p-10'
            )}>
              {children}
            </div>

            {/* Premium Footer */}
            {footer && (
              <div className="px-10 py-7 border-t border-primary-100 bg-primary-50/20 flex items-center justify-end gap-4 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*                            REUSABLE CONFIRM MODAL                          */
/* ────────────────────────────────────────────────────────────────────────── */

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export function ConfirmModal({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = 'Confirm', 
  variant = 'primary', 
  loading 
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle="SYSTEM CONFIRMATION"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} className="rounded-2xl font-bold h-12 px-6">Cancel</Button>
          <Button 
            variant={variant === 'danger' ? 'danger' : 'primary'} 
            onClick={onConfirm} 
            loading={loading}
            className={cn(
              "rounded-2xl px-8 h-12 font-black uppercase text-[11px] tracking-widest shadow-xl transition-all hover:-translate-y-0.5 active:scale-95",
              variant === 'primary' ? "bg-primary-olive hover:bg-primary-700 shadow-primary-olive/20" : "shadow-rose-100"
            )}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center",
          variant === 'danger' ? "bg-rose-50 text-rose-600" : "bg-primary-50 text-primary-olive"
        )}>
           {variant === 'danger' ? <X size={32} strokeWidth={3} /> : <X size={32} strokeWidth={3} className="rotate-45" />}
        </div>
        <p className="text-[15px] text-[#4B4B4B] font-bold leading-relaxed max-w-xs">{message}</p>
      </div>
    </Modal>
  )
}

