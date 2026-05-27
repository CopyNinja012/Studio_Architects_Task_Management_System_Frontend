import React from 'react';
import { cn } from '../../lib/cn';

export interface TimelineItem {
  id: string | number;
  title: string;
  description?: string;
  time: string;
  icon?: React.ReactNode;
  status?: 'default' | 'success' | 'warning' | 'error';
  isLast?: boolean;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
  return (
    <div className={cn("flow-root", className)}>
      <ul className="-mb-8">
        {items.map((item, itemIdx) => {
          const isLast = itemIdx === items.length - 1;
          
          return (
            <li key={item.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white transition-colors duration-200",
                      item.status === 'success' ? "bg-green-500 shadow-sm shadow-green-200" :
                      item.status === 'warning' ? "bg-yellow-500 shadow-sm shadow-yellow-200" :
                      item.status === 'error' ? "bg-red-500 shadow-sm shadow-red-200" :
                      "bg-slate-400 shadow-sm shadow-slate-200"
                    )}>
                      {item.icon ? (
                        <span className="text-white h-5 w-5 flex items-center justify-center">{item.icon}</span>
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-900 font-bold leading-none mb-1">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                      <time dateTime={item.time}>{item.time}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

