import { cn } from '@/lib/utils';

interface ConfidenceBarProps {
  value: number; // 0-1
  classification?: string;
  className?: string;
  showLabel?: boolean;
}

/**
 * Barra de confiança com preenchimento verde sólido
 * O preenchimento segue a porcentagem de confiança
 * 
 * Regra especial: PÚBLICO com prob 0 = 99% (Certeza de Segurança)
 */
export function ConfidenceBar({ value, classification, className, showLabel = true }: ConfidenceBarProps) {
  // Normalizar confiança: se PÚBLICO e probabilidade 0, tratar como 0.99
  const normalizedValue = classification === 'PÚBLICO' && value === 0 ? 0.99 : value;
  const percentage = normalizedValue * 100;
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Track (fundo cinza) */}
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-[60px]">
        {/* Thumb (preenchimento verde) */}
        <div 
          className="h-full rounded-full transition-all duration-300"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: 'hsl(120, 60%, 40%)'
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground w-10 text-right">
          {percentage.toFixed(0)}%
        </span>
      )}
    </div>
  );
}

/**
 * Função utilitária para obter a cor de confiança (verde)
 */
export function getConfidenceColor(): string {
  return 'hsl(120, 60%, 40%)';
}

/**
 * Normaliza a probabilidade para exibição
 * Se classificação é PÚBLICO e probabilidade é 0, retorna 0.99
 */
export function normalizeConfidence(probability: number, classification: string): number {
  if (classification === 'PÚBLICO' && probability === 0) {
    return 0.99;
  }
  return probability;
}
