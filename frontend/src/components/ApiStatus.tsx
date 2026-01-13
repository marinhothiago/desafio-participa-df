import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ApiStatusProps {
  status: 'online' | 'offline' | 'loading' | 'waking';
  onRetry?: () => void;
}

export function ApiStatus({ status, onRetry }: ApiStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
          status === 'online' && 'bg-success/10 text-success',
          status === 'offline' && 'bg-destructive/10 text-destructive',
          status === 'loading' && 'bg-muted text-muted-foreground',
          status === 'waking' && 'bg-warning/10 text-warning',
        )}
      >
        {status === 'loading' && (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Conectando...</span>
          </>
        )}
        {status === 'online' && (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>API Online</span>
          </>
        )}
        {status === 'offline' && (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>API Offline</span>
          </>
        )}
        {status === 'waking' && (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Acordando...</span>
          </>
        )}
      </div>
      
      {(status === 'offline' || status === 'waking') && onRetry && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRetry}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
