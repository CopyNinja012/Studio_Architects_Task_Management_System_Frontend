import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

// Simple but functional visual toast implementation
export const toast = {
  success: (msg: string) => showToast(msg, 'success'),
  error: (msg: string) => showToast(msg, 'error'),
  info: (msg: string) => showToast(msg, 'info'),
}

function showToast(message: string, type: 'success' | 'error' | 'info') {
  const containerId = 'toast-container'
  let container = document.getElementById(containerId)
  
  if (!container) {
    container = document.createElement('div')
    container.id = containerId
    container.className = 'fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none'
    document.body.appendChild(container)
  }

  const toastElement = document.createElement('div')
  toastElement.className = `
    flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border 
    translate-x-full opacity-0 transition-all duration-300 pointer-events-auto
    min-w-[300px] max-w-md animate-slide-in-right
  `
  
  const styles = {
    success: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]',
    error: 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]',
    info: 'bg-[#F0F9FF] border-[#BAE6FD] text-[#075985]',
  }
  
  toastElement.className += ` ${styles[type]}`
  
  const icon = type === 'success' ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' 
             : type === 'error' ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
             : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'

  toastElement.innerHTML = `
    <div class="shrink-0">${icon}</div>
    <div class="flex-1 text-sm font-bold">${message}</div>
    <button class="shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors cursor-pointer">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `

  container.appendChild(toastElement)

  // Animation start
  setTimeout(() => {
    toastElement.classList.remove('translate-x-full', 'opacity-0')
  }, 10)

  const removeToast = () => {
    toastElement.classList.add('translate-x-full', 'opacity-0')
    setTimeout(() => {
      toastElement.remove()
      if (container && container.childNodes.length === 0) {
        container.remove()
      }
    }, 300)
  }

  // Auto remove after 5 seconds
  const timeoutId = setTimeout(removeToast, 5000)

  // Manual remove
  toastElement.querySelector('button')?.addEventListener('click', () => {
    clearTimeout(timeoutId)
    removeToast()
  })
}

