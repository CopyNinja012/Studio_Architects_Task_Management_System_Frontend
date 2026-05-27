import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useUIStore } from '@/store'

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
        className="fixed z-10 overflow-y-auto transition-all duration-300 ease-in-out"
        style={{
          top: 'var(--app-header-h)',
          left: 'var(--app-sidebar-w)',
          right: 0,
          bottom: 0,
          padding: 'var(--app-gutter)',
        }}
      >
        <div className="mx-auto w-full max-w-400">
          <Outlet />
        </div>
      </main>
    </div>
  )
}