import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Calendar, Command, Search, Menu, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { useUIStore } from '@/store'
import { PATHS } from '@/router/path'

import logoImg from '@/shared/assets/studio_logo.png'

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  // Admin
  [PATHS.ADMIN_DASHBOARD]: { title: 'Admin Dashboard', subtitle: 'SYSTEM CONTROL' },
  [PATHS.ADMIN_PROJECTS]: { title: 'Project Directory', subtitle: 'ENTERPRISE ASSETS' },
  [PATHS.ADMIN_TASKS]: { title: 'Task Workflow', subtitle: 'OPERATIONAL WBS' },
  [PATHS.ADMIN_APPROVALS]: { title: 'Review Center', subtitle: 'PENDING APPROVALS' },
  [PATHS.ADMIN_USER_MGMT]: { title: 'Staff Directory', subtitle: 'HUMAN RESOURCES' },
  [PATHS.ADMIN_PERFORMANCE]: { title: 'Analytics', subtitle: 'PERFORMANCE METRICS' },
  [PATHS.ADMIN_REPORTS]: { title: 'Reports', subtitle: 'SYSTEM REPORTS' },
  [PATHS.ADMIN_LOGS]: { title: 'Audit Trail', subtitle: 'SECURITY LOGS' },
  [PATHS.ADMIN_SETTINGS]: { title: 'Configuration', subtitle: 'SYSTEM SETTINGS' },

  // Project Manager
  [PATHS.PM_DASHBOARD]: { title: 'PM Dashboard', subtitle: 'PROJECT OVERSIGHT' },
  [PATHS.PM_PROJECTS]: { title: 'My Projects', subtitle: 'MANAGEMENT PORTAL' },
  [PATHS.PM_TASKS]: { title: 'Task Tracking', subtitle: 'WORKFLOW CONTROL' },
  [PATHS.PM_APPROVALS]: { title: 'Review Desk', subtitle: 'STAFF SUBMISSIONS' },
  [PATHS.PM_TEAM]: { title: 'Team Overview', subtitle: 'RESOURCE MANAGEMENT' },
  [PATHS.PM_SETTINGS]: { title: 'Preferences', subtitle: 'PM CONFIGURATION' },

  // HR
  [PATHS.HR_DASHBOARD]: { title: 'HR Dashboard', subtitle: 'WORKFORCE PORTAL' },
  [PATHS.HR_EMPLOYEES]: { title: 'Staff Records', subtitle: 'EMPLOYEE DIRECTORY' },
  [PATHS.HR_RECRUITMENT]: { title: 'Recruitment', subtitle: 'TALENT ACQUISITION' },
  [PATHS.HR_PERFORMANCE]: { title: 'Staff Metrics', subtitle: 'EVALUATION PORTAL' },
  [PATHS.HR_SETTINGS]: { title: 'HR Settings', subtitle: 'PORTAL CONFIG' },

  // Employee
  [PATHS.EMPLOYEE_DASHBOARD]: { title: 'My Dashboard', subtitle: 'EMPLOYEE PORTAL' },
  [PATHS.EMPLOYEE_TASKS]: { title: 'My Assignments', subtitle: 'WORKFLOW' },
  [PATHS.EMPLOYEE_MANUAL_TASK]: { title: 'Manual Logging', subtitle: 'WORK LOGS' },
  [PATHS.EMPLOYEE_PERFORMANCE]: { title: 'My Growth', subtitle: 'PERFORMANCE' },
  [PATHS.EMPLOYEE_PROFILE]: { title: 'My Profile', subtitle: 'IDENTITY' },

  // Site Person
  [PATHS.SITE_DASHBOARD]: { title: 'Site Overview', subtitle: 'FIELD PORTAL' },
  [PATHS.SITE_TASKS]: { title: 'Field Tasks', subtitle: 'ON-SITE WORKFLOW' },
}

export function Header() {
  const [searchFocused, setSearchFocused] = useState(false)
  const location = useLocation()
  const meta = pageMeta[location.pathname] || { title: 'Studio Architects', subtitle: 'SYSTEM PORTAL' }
  const { sidebarCollapsed, mobileSidebarOpen, toggleMobileSidebar } = useUIStore()

  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const dateStr = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const dayStr = time.toLocaleDateString('en-US', { weekday: 'long' })

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E7EB] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between px-4 md:px-6"
      style={{ height: 'var(--app-header-h, 72px)' }}
    >
      {/* LEFT: Logo (corner) + Title */}
      <div className="flex items-center h-full">
        {/* Mobile Toggle */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 mr-2 rounded-xl bg-[#F8FAF5] border border-[#E5E7EB] text-[#6B7F3A]"
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo at the corner (no subtext) */}
        <div className={cn('shrink-0 flex items-center', sidebarCollapsed ? 'pr-2 md:pr-3' : 'pr-2 md:pr-4')}>
          <img
            src={logoImg}
            alt="Studio Architects"
            className={cn(
              'w-auto object-contain',
              // Responsive height
              'h-9 md:h-11 lg:h-12',
              // Shadow + subtle hover polish
              'drop-shadow-[0_6px_14px_rgba(0,0,0,0.18)]',
              'transition-transform duration-300 hover:scale-[1.03]'
            )}
          />
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-9 bg-[#E5E7EB] mx-3 md:mx-5" />

        {/* Page Title */}
        <div className="hidden sm:flex flex-col justify-center">
          <p className="text-[8px] md:text-[9px] font-black text-[#6B7F3A] tracking-[0.2em] uppercase mb-0.5 leading-none">
            {meta.subtitle}
          </p>
          <h2 className="text-[16px] md:text-[20px] font-black text-[#111827] tracking-tight leading-none truncate max-w-37.5 md:max-w-none">
            {meta.title}
          </h2>
        </div>
      </div>

      {/* CENTER: Search */}
      <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-130 hidden xl:block">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={16} className={searchFocused ? 'text-[#6B7F3A]' : 'text-text-light'} />
          </div>

          <input
            type="text"
            placeholder="Quick search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full h-10 pl-11 pr-14 rounded-full bg-[#F8FAF5] border border-[#E5E7EB] text-[13px] font-semibold text-[#111827] placeholder:text-text-light transition-all duration-300 focus:outline-none focus:border-[#6B7F3A] focus:ring-4 focus:ring-[#6B7F3A]/10 focus:bg-white shadow-inner group-hover:bg-white"
          />

          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
            <span className="flex items-center justify-center h-5 px-2 rounded-md bg-white border border-[#E5E7EB] text-[9px] font-black text-text-light shadow-sm tracking-widest">
              <Command size={8} className="mr-0.5" /> K
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Date & Time */}
        <div className="hidden md:flex items-center gap-2.5 h-10 px-2.5 rounded-xl bg-[#F8FAF5] border border-[#E5E7EB] shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#6B7F3A]">
            <Calendar size={14} />
          </div>
          <div className="flex flex-col pr-2 justify-center leading-tight">
            <span className="text-[12px] font-black text-[#111827]">{dateStr}</span>
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wide">
              {dayStr} • {timeStr}
            </span>
          </div>
        </div>

        {/* Light/Dark UI */}
        {/* <div className="flex items-center gap-1.5 p-1 bg-[#F8FAF5] rounded-full border border-[#E5E7EB]">
          <button className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-xs md:text-sm" title="Light Mode">
            ☀️
          </button>
          <button
            className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all"
            title="Dark Mode"
          >
            🌙
          </button>
        </div> */}
      </div>
    </header>
  )
}
