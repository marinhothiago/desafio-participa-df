import { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'highlight';
  className?: string;
  tooltip?: string;
}

export function KPICard({ title, value, subtitle, icon, variant = 'default', className, tooltip }: KPICardProps) {
  return (
    <div
      className={cn(
        'gov-card animate-fade-in transition-all duration-200 hover:shadow-md',
        variant === 'success' && 'border-l-4 border-l-success',
        variant === 'danger' && 'border-l-4 border-l-destructive',
        variant === 'highlight' && 'border-l-4 border-l-primary',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    <p>{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <p className={cn(
            'text-2xl sm:text-3xl font-bold tracking-tight',
            variant === 'success' && 'text-success',
            variant === 'danger' && 'text-destructive',
            variant === 'highlight' && 'text-primary',
          )}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground line-clamp-2">{subtitle}</p>
          )}
        </div>
        <div className={cn(
          'p-2 sm:p-3 rounded-lg shrink-0',
          variant === 'default' && 'bg-muted text-muted-foreground',
          variant === 'success' && 'bg-success/10 text-success',
          variant === 'danger' && 'bg-destructive/10 text-destructive',
          variant === 'highlight' && 'bg-primary/10 text-primary',
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
