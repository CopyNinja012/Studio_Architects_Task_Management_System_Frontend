import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useUIStore } from '@/store'
import { cn } from '@/shared/lib/cn'

export function AppLayout() {
  const { sidebarCollapsed } = useUIStore()

  // Enterprise Premium Layout variables
  const HEADER_H = 72
  const SIDEBAR_W = sidebarCollapsed ? 72 : 240
  const GUTTER = 32

  return (
    <div
      className="h-dvh bg-[#F8FAF5] overflow-hidden"
      style={{
        ['--app-header-h' as any]: `${HEADER_H}px`,
        ['--app-sidebar-w' as any]: `${SIDEBAR_W}px`,
        ['--app-gutter' as any]: `${GUTTER}px`,
      }}
    >
      <Header />
      <Sidebar />

      {/* Main content is the only scroll container */}
      <main
        className={cn(
          "fixed z-10 overflow-y-auto transition-all duration-300 ease-in-out",
          "left-0 lg:left-[var(--app-sidebar-w)]",
          "right-0 bottom-0"
        )}
        style={{
          top: 'var(--app-header-h)',
          // Padding is smaller on mobile
        }}
      >
        <div className="mx-auto w-full max-w-400 p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}