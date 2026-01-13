import { Thermometer, AlertTriangle, AlertCircle, CheckCircle, ShieldX, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RiskDistribution, getRiskLabel, getRiskBgClass } from '@/contexts/AnalysisContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RiskThermometerProps {
  distribution: RiskDistribution;
  total: number;
}

export function RiskThermometer({ distribution, total }: RiskThermometerProps) {
  // Ordem fixa para o termômetro (do mais crítico ao mais seguro)
  const allLevels = [
    { 
      key: 'critical' as const, 
      label: 'Crítico', 
      range: 'Risco máximo',
      icon: ShieldX,
      bgClass: 'bg-red-800',
      textClass: 'text-red-800',
      count: distribution.critical 
    },
    { 
      key: 'high' as const, 
      label: 'Alto', 
      range: 'Risco elevado',
      icon: AlertTriangle,
      bgClass: 'bg-red-400',
      textClass: 'text-red-500',
      count: distribution.high 
    },
    { 
      key: 'moderate' as const, 
      label: 'Moderado', 
      range: 'Risco médio',
      icon: AlertCircle,
      bgClass: 'bg-yellow-500',
      textClass: 'text-yellow-600',
      count: distribution.moderate 
    },
    { 
      key: 'low' as const, 
      label: 'Baixo', 
      range: 'Risco baixo',
      icon: Shield,
      bgClass: 'bg-blue-500',
      textClass: 'text-blue-600',
      count: distribution.low 
    },
    { 
      key: 'safe' as const, 
      label: 'Seguro', 
      range: 'Sem risco',
      icon: CheckCircle,
      bgClass: 'bg-green-600',
      textClass: 'text-green-600',
      count: distribution.safe 
    },
  ];

  // Ordenar por quantidade (maior para menor) para exibição na legenda
  const sortedLevels = [...allLevels].sort((a, b) => b.count - a.count);
  
  // Invertido para a barra (menor para maior)
  const reversedLevels = [...sortedLevels].reverse();

  const getPercentage = (count: number) => {
    if (total === 0) return 0;
    return (count / total) * 100;
  };

  return (
    <div className="gov-card animate-slide-up h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Thermometer className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Termômetro de Risco</h3>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {/* Visual Thermometer - barra horizontal com tooltips */}
        <TooltipProvider>
          <div className="flex flex-col gap-1">
            {/* Barra do termômetro */}
            <div className="h-8 w-full bg-muted rounded-full overflow-hidden flex flex-row border-2 border-border">
              {reversedLevels.map((level) => {
                const percentage = getPercentage(level.count);
                if (level.count === 0) return null;
                
                return (
                  <Tooltip key={level.key}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(level.bgClass, 'transition-all duration-500 cursor-pointer hover:opacity-80')}
                        style={{ 
                          width: `${percentage}%`,
                          minWidth: '4px'
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover border border-border shadow-lg">
                      <div className="flex items-center gap-2 p-1">
                        <level.icon className={cn('w-4 h-4', level.textClass)} />
                        <div>
                          <p className={cn('font-semibold', level.textClass)}>{level.label}</p>
                          <p className="text-xs text-muted-foreground">{level.range}</p>
                          <p className="text-sm font-bold">{level.count} registros ({percentage.toFixed(1)}%)</p>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
            {/* Labels de porcentagem alinhados com a barra */}
            <div className="flex items-center text-xs font-medium">
              <span className="text-muted-foreground">0%</span>
              <div className="flex flex-1">
                {reversedLevels.map((level) => {
                  const percentage = getPercentage(level.count);
                  if (level.count === 0) return null;
                  
                  return (
                    <div
                      key={level.key}
                      className="text-center truncate"
                      style={{ width: `${percentage}%`, minWidth: '20px' }}
                    >
                      <span className={cn('text-xs font-medium', level.textClass)}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
              <span className="text-muted-foreground">100%</span>
            </div>
          </div>
        </TooltipProvider>

        {/* Legend and Stats - ordenado por quantidade (maior para menor) */}
        <div className="flex-1 space-y-1.5 min-w-0">
          {sortedLevels.map((level) => {
            const Icon = level.icon;
            const percentage = getPercentage(level.count);
            
            return (
              <div key={level.key} className="flex items-center gap-2">
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
                  level.bgClass
                )}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('text-sm font-medium', level.textClass)}>
                      {level.label}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold text-foreground">
                        {level.count}
                      </span>
                      {total > 0 && (
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          ({percentage.toFixed(0)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Barra de progresso */}
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                    <div 
                      className={cn(level.bgClass, 'h-full rounded-full transition-all duration-500')}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
