import { Skeleton } from '@/components/ui/skeleton';

interface AnalysisSkeletonProps {
  variant?: 'card' | 'inline' | 'table-row';
}

export function AnalysisSkeleton({ variant = 'card' }: AnalysisSkeletonProps) {
  if (variant === 'inline') {
    return (
      <div className="space-y-3 pt-2 border-t border-border animate-pulse">
        <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
          <Skeleton className="w-5 h-5 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-12" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    );
  }

  if (variant === 'table-row') {
    return (
      <tr className="border-b border-border">
        <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
        <td className="py-3 px-4"><Skeleton className="h-4 w-12" /></td>
        <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
        <td className="py-3 px-4 text-center"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></td>
        <td className="py-3 px-4"><Skeleton className="h-2 w-24 mx-auto" /></td>
        <td className="py-3 px-4 text-center"><Skeleton className="h-6 w-24 mx-auto rounded-full" /></td>
        <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
        <td className="py-3 px-4"><Skeleton className="h-8 w-16 mx-auto" /></td>
      </tr>
    );
  }

  // Default: card skeleton
  return (
    <div className="gov-card animate-pulse space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      
      <div className="space-y-3">
        <Skeleton className="h-24 w-full rounded-lg" />
        
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 flex-1 rounded-full" />
          <Skeleton className="h-4 w-12" />
        </div>
        
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function BatchProgressSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <p className="text-sm text-muted-foreground text-center">
        Processando textos com o motor de IA...
      </p>
    </div>
  );
}
