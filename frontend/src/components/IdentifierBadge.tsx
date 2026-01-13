import { cn } from '@/lib/utils';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  FileText,
  Hash,
  AlertTriangle
} from 'lucide-react';

interface IdentifierBadgeProps {
  tipo: string;
  valor: string;
  confianca?: number;
  showConfidence?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Mapeamento de tipos para ícones e cores
const typeConfig: Record<string, { icon: typeof User; color: string; bgColor: string }> = {
  'CPF': { icon: CreditCard, color: 'text-red-700', bgColor: 'bg-red-100 border-red-200' },
  'RG': { icon: FileText, color: 'text-red-700', bgColor: 'bg-red-100 border-red-200' },
  'NOME_PESSOAL': { icon: User, color: 'text-orange-700', bgColor: 'bg-orange-100 border-orange-200' },
  'NOME': { icon: User, color: 'text-orange-700', bgColor: 'bg-orange-100 border-orange-200' },
  'EMAIL': { icon: Mail, color: 'text-purple-700', bgColor: 'bg-purple-100 border-purple-200' },
  'TELEFONE': { icon: Phone, color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-200' },
  'ENDERECO_SENSIVEL': { icon: MapPin, color: 'text-amber-700', bgColor: 'bg-amber-100 border-amber-200' },
  'ENDERECO': { icon: MapPin, color: 'text-amber-700', bgColor: 'bg-amber-100 border-amber-200' },
  'MATRICULA': { icon: Hash, color: 'text-indigo-700', bgColor: 'bg-indigo-100 border-indigo-200' },
};

const defaultConfig = { 
  icon: AlertTriangle, 
  color: 'text-gray-700', 
  bgColor: 'bg-gray-100 border-gray-200' 
};

export function IdentifierBadge({ 
  tipo, 
  valor, 
  confianca,
  showConfidence = true,
  size = 'md',
  className 
}: IdentifierBadgeProps) {
  const config = typeConfig[tipo.toUpperCase()] || defaultConfig;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <div 
      className={cn(
        'inline-flex items-center rounded-lg border',
        config.bgColor,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={cn(iconSizes[size], config.color)} />
      <span className={cn('font-semibold uppercase', config.color)}>
        {tipo.replace('_', ' ')}
      </span>
      <code className="font-mono bg-white/60 px-1.5 rounded text-foreground">
        {valor}
      </code>
      {showConfidence && confianca !== undefined && (
        <span className="text-muted-foreground opacity-70">
          {(confianca * 100).toFixed(0)}%
        </span>
      )}
    </div>
  );
}

export function IdentifierList({ 
  identificadores,
  showConfidence = true,
  size = 'sm',
  className
}: { 
  identificadores: Array<{ tipo: string; valor: string; conf?: number }>;
  showConfidence?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  if (!identificadores || identificadores.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Nenhum dado pessoal identificado
      </p>
    );
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {identificadores.map((id, index) => (
        <IdentifierBadge
          key={`${id.tipo}-${index}`}
          tipo={id.tipo}
          valor={id.valor}
          confianca={id.conf}
          showConfidence={showConfidence}
          size={size}
        />
      ))}
    </div>
  );
}
