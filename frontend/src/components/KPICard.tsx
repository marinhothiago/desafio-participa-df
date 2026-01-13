import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'highlight';
  className?: string;
}

export function KPICard({ title, value, subtitle, icon, variant = 'default', className }: KPICardProps) {
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
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn(
            'text-3xl font-bold tracking-tight',
            variant === 'success' && 'text-success',
            variant === 'danger' && 'text-destructive',
            variant === 'highlight' && 'text-primary',
          )}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-lg',
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
