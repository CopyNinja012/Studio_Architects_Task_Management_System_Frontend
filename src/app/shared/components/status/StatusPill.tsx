import React from 'react';
import { cn } from '../../lib/cn';

export type StatusType = 
  | 'pending' 
  | 'in-progress' 
  | 'completed' 
  | 'cancelled' 
  | 'on-hold' 
  | 'review'
  | 'approved'
  | 'rejected';

interface StatusPillProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  // Task Statuses
  'assigned': { label: 'Assigned', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  'in_progress': { label: 'In Progress', color: 'bg-primary-50 text-primary-olive border-primary-100' },
  'under_review': { label: 'Review', color: 'bg-teal-50 text-teal-700 border-teal-100' },
  'rework_requested': { label: 'Rework', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  'completed': { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },

  // Project Statuses
  'planning': { label: 'Planning', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  'on_hold': { label: 'On Hold', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  'rework': { label: 'Rework', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  'cancelled': { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-100' },

  // Generic / Fallbacks
  'pending': { label: 'Pending', color: 'bg-slate-50 text-slate-500 border-slate-200' },
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className }) => {
  const normalizedStatus = status.toLowerCase()
  const config = statusConfig[normalizedStatus] || {
    label: status.replace(/_/g, ' '),
    color: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      config.color,
      className
    )}>
      {config.label}
    </span>
  );
};


