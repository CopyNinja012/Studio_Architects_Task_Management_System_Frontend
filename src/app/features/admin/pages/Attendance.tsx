/*
import { useEffect, useState } from 'react'
import {
  Users, Download, Search, CalendarDays,
  Clock, CheckCircle2, XCircle, Edit3, X, Save,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/shared/lib/cn'
import { attendanceApi } from '../api/attendanceApi'
import type {
  AttendanceRecordApi,
  AttendancePreset,
  AttendanceExceptionRequest,
} from '../model/types'
import { PageLoader } from '@/shared/components/ui/Loader'

// ... rest of the file ...
*/

export default function AdminAttendance() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-text-light">
       <p className="text-lg font-bold">Attendance feature is currently disabled.</p>
       <p className="text-sm">The system is focusing on Task Management.</p>
    </div>
  )
}

