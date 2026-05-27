import React from 'react';
import { ChevronUp, ChevronRight, ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/cn';

export type Priority = 'high' | 'medium' | 'low' | 'urgent';

interface PriorityTagProps {
  priority: Priority;
  className?: string;
  showIcon?: boolean;
}

const priorityConfig = {
  urgent: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: AlertCircle,
  },
  high: {
    label: 'High',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: ChevronUp,
  },
  medium: {
    label: 'Medium',
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    icon: ChevronRight,
  },
  low: {
    label: 'Low',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: ChevronDown,
  },
};

export const PriorityTag: React.FC<PriorityTagProps> = ({ 
  priority, 
  className,
  showIcon = true 
}) => {
  const config = priorityConfig[priority.toLowerCase() as Priority] || priorityConfig.medium;
  const Icon = config.icon;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
      config.color,
      className
    )}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
};

