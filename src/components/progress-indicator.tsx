
import React from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProgressStep {
  name: string;
  status: 'pending' | 'in-progress' | 'success' | 'error';
  error?: string;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  show: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ steps, show }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="w-full my-8" >
      <ol className="flex items-start">
        {steps.map((step, index) => (
          <React.Fragment key={step.name}>
            <li className="flex-1 flex flex-col items-center gap-2">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg',
                  step.status === 'success' && 'bg-green-500 text-white',
                  step.status === 'in-progress' && 'bg-blue-500 text-white',
                  step.status === 'pending' && 'bg-gray-200 text-gray-500',
                  step.status === 'error' && 'bg-red-500 text-white'
                )}
              >
                {step.status === 'success' ? (
                  <Check size={24} />
                ) : step.status === 'in-progress' ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : step.status === 'error' ? (
                  <AlertCircle size={24} />
                ) : (
                  index + 1
                )}
              </div>
              <p className={cn(
                "text-sm text-center max-w-24",
                step.status === 'in-progress' && 'font-bold text-blue-600',
                step.status === 'error' && 'font-bold text-red-600',
                )}>
                {step.name}
              </p>
            </li>
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mt-5 mx-2 bg-gray-200">
                 <div
                    className={cn("h-full",
                        step.status === 'success' && "bg-green-500"
                    )}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </ol>
      <div className="mt-4">
        {steps.map(
          (step) =>
            step.status === 'error' &&
            step.error && (
              <div
                key={step.name}
                className="p-4 mt-2 text-sm text-red-800 rounded-lg bg-red-50"
                role="alert"
              >
                <span className="font-medium">
                  Error in "{step.name}" step:
                </span>{" "}
                {step.error}
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default ProgressIndicator;
