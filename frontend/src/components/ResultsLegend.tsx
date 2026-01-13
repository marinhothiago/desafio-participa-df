import { CheckCircle, AlertTriangle, ShieldX, AlertCircle, Shield } from 'lucide-react';

interface ResultsLegendProps {
  showClassification?: boolean;
  showRisk?: boolean;
  showConfidence?: boolean;
}

export function ResultsLegend({ 
  showClassification = true, 
  showRisk = true,
  showConfidence = true 
}: ResultsLegendProps) {
  return (
    <div className="space-y-3">
      {/* Classification Legend */}
      {showClassification && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Classificação</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-green-600"></span>
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span>Público (sem dados sensíveis)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-600"></span>
              <AlertTriangle className="w-3 h-3 text-red-600" />
              <span>Não Público (com dados sensíveis)</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Risk Legend */}
      {showRisk && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Nível de Risco</p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-800"></span>
              <ShieldX className="w-3 h-3 text-red-800" />
              <span>Crítico</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span>Alto</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <AlertCircle className="w-3 h-3 text-yellow-500" />
              <span>Moderado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <Shield className="w-3 h-3 text-blue-500" />
              <span>Baixo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-green-600"></span>
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span>Seguro</span>
            </div>
          </div>
        </div>
      )}

      {/* Confidence Legend */}
      {showConfidence && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Confiança</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                <div className="w-full h-full rounded-full" style={{ backgroundColor: 'hsl(120, 60%, 40%)' }}></div>
              </div>
              <span>Barra verde proporcional à %</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
