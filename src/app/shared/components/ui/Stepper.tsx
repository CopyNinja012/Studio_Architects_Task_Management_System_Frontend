import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface Step {
  title: string;
  description?: string;
  status?: 'complete' | 'current' | 'upcoming';
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Stepper: React.FC<StepperProps> = ({ 
  steps, 
  currentStep, 
  className,
  orientation = 'horizontal'
}) => {
  return (
    <div className={cn(
      "w-full",
      orientation === 'vertical' ? "flex flex-col" : "flex items-center",
      className
    )}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.title}>
            <div className={cn(
              "flex items-center",
              orientation === 'vertical' ? "relative pb-8" : "flex-1"
            )}>
              {/* Connector Line for Vertical */}
              {orientation === 'vertical' && !isLast && (
                <div className="absolute left-4 top-10 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
              )}

              <div className="flex items-center group">
                <span className="flex items-center h-9">
                  <span className={cn(
                    "relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-200",
                    isCompleted ? "bg-primary border-primary" : 
                    isCurrent ? "border-primary bg-white" : "border-slate-300 bg-white"
                  )}>
                    {isCompleted ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <span className={cn(
                        "text-sm font-semibold",
                        isCurrent ? "text-primary" : "text-slate-500"
                      )}>
                        {index + 1}
                      </span>
                    )}
                  </span>
                </span>
                <span className={cn(
                  "ml-4 flex min-w-0 flex-col",
                  orientation === 'horizontal' && isLast && "pr-4"
                )}>
                  <span className={cn(
                    "text-sm font-medium",
                    isCurrent ? "text-primary" : "text-slate-900"
                  )}>
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="text-xs text-slate-500 truncate">{step.description}</span>
                  )}
                </span>
              </div>

              {/* Connector Line for Horizontal */}
              {orientation === 'horizontal' && !isLast && (
                <div className="mx-4 h-0.5 flex-1 bg-slate-200" aria-hidden="true" />
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

