import { CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'public' | 'restricted';
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, showIcon = true, size = 'md' }: StatusBadgeProps) {
  const isPublic = status === 'public';
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        isPublic 
          ? 'bg-success/10 text-success' 
          : 'bg-destructive/10 text-destructive',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        size === 'lg' && 'px-4 py-1.5 text-base',
      )}
    >
      {showIcon && (
        isPublic 
          ? <CheckCircle className={cn(size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
          : <AlertTriangle className={cn(size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
      )}
      {isPublic ? 'Público' : 'Restrito'}
    </span>
  );
}
