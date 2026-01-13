import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ApiWakingUpMessageProps {
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
  variant?: 'inline' | 'card';
}

export function ApiWakingUpMessage({ 
  onRetry, 
  isRetrying = false, 
  className,
  variant = 'card'
}: ApiWakingUpMessageProps) {
  if (variant === 'inline') {
    return (
      <div className={cn(
        'flex items-center gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg',
        className
      )}>
        <div className="flex-shrink-0">
          <Loader2 className="w-5 h-5 text-warning animate-spin" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-warning">
            Motor de IA acordando...
          </p>
          <p className="text-xs text-muted-foreground">
            O servidor Hugging Face pode demorar alguns segundos para iniciar.
          </p>
        </div>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            disabled={isRetrying}
            className="flex-shrink-0"
          >
            {isRetrying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 bg-warning/5 border border-warning/20 rounded-xl',
      className
    )}>
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-warning animate-spin" />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-warning/30 animate-ping" />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Motor de IA Acordando
      </h3>
      
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
        O modelo de IA está hospedado no Hugging Face Spaces e pode levar alguns segundos 
        para iniciar após um período de inatividade.
      </p>
      
      {onRetry && (
        <Button 
          variant="outline" 
          onClick={onRetry}
          disabled={isRetrying}
          className="gap-2"
        >
          {isRetrying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Reconectando...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </>
          )}
        </Button>
      )}
    </div>
  );
}
