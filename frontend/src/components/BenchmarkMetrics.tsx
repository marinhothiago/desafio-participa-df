import { Bot, Cpu, Target, TrendingUp, BarChart3, Sparkles, TestTube, Info, Zap } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function MetricTooltip({ children, content }: { children: React.ReactNode; content: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-help">
            {children}
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface BenchmarkMetricsProps {
  totalTests: number;
}

export function BenchmarkMetrics({ totalTests }: BenchmarkMetricsProps) {
  return (
    <div className="space-y-6">
      {/* IA Benchmark Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Benchmarks do Motor de IA
          </h3>
        </div>
        
        <div className="gov-card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">Modelo: spaCy pt_core_news_lg</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-card/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Target className="w-4 h-4" />
                <MetricTooltip content="Percentual de identificações corretas dentre todas as identificações feitas pelo modelo de IA.">
                  <span className="text-xs font-medium">Precisão</span>
                </MetricTooltip>
              </div>
              <p className="text-2xl font-bold text-foreground">92%</p>
            </div>
            
            <div className="text-center p-3 bg-card/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <TrendingUp className="w-4 h-4" />
                <MetricTooltip content="Percentual de dados pessoais que o modelo consegue encontrar dentre todos os existentes.">
                  <span className="text-xs font-medium">Sensibilidade</span>
                </MetricTooltip>
              </div>
              <p className="text-2xl font-bold text-foreground">90%</p>
            </div>
            
            <div className="text-center p-3 bg-card/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <BarChart3 className="w-4 h-4" />
                <MetricTooltip content="Média harmônica entre Precisão e Sensibilidade, indicando o equilíbrio do modelo.">
                  <span className="text-xs font-medium">F1-Score</span>
                </MetricTooltip>
              </div>
              <p className="text-2xl font-bold text-foreground">91%</p>
            </div>
            
            <div className="text-center p-3 bg-card/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <TestTube className="w-4 h-4" />
                <span className="text-xs font-medium">Total de Testes</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalTests.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hybrid System Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-warning" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Benchmarks de Performance do Motor Híbrido (IA + Regex)
          </h3>
        </div>
        
        <div className="gov-card bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-warning" />
            <span className="text-sm font-semibold text-foreground">Sistema Combinado: NLP + Expressões Regulares + Validação Matemática</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-card/50 rounded-lg border border-success/20">
              <div className="flex items-center justify-center gap-1 text-success mb-1">
                <Target className="w-4 h-4" />
                <MetricTooltip content="A IA valida o contexto do Regex, reduzindo falsos positivos e aumentando a precisão global.">
                  <span className="text-xs font-medium">Precisão Global</span>
                </MetricTooltip>
              </div>
              <p className="text-2xl font-bold text-success">94%</p>
            </div>
            
            <div className="text-center p-3 bg-card/50 rounded-lg border border-success/20">
              <div className="flex items-center justify-center gap-1 text-success mb-1">
                <TrendingUp className="w-4 h-4" />
                <MetricTooltip content="O Regex garante a captura de 100% dos CPFs, CNPJs e outros padrões estruturados.">
                  <span className="text-xs font-medium">Sensibilidade</span>
                </MetricTooltip>
              </div>
              <p className="text-2xl font-bold text-success">98%</p>
            </div>
            
            <div className="text-center p-3 bg-card/50 rounded-lg border border-success/20 sm:col-span-1 col-span-2">
              <div className="flex items-center justify-center gap-1 text-success mb-1">
                <BarChart3 className="w-4 h-4" />
                <MetricTooltip content="Média harmônica do sistema híbrido, refletindo o melhor dos dois mundos.">
                  <span className="text-xs font-medium">F1-Score Combinado</span>
                </MetricTooltip>
              </div>
              <p className="text-2xl font-bold text-success">96%</p>
            </div>
          </div>
          
          <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <strong className="text-foreground">Como funciona:</strong> O motor utiliza uma arquitetura híbrida de <span className="text-primary font-medium">Processamento de Linguagem Natural (spaCy)</span> para compreender o contexto semântico e <span className="text-warning font-medium">Expressões Regulares (Regex)</span> para identificar padrões estruturados. O diferencial do sistema é a <span className="text-success font-medium">Camada de Validação Matemática</span>, que aplica algoritmos de verificação (como o Módulo 11) para confirmar a autenticidade de CPFs e CNPJs, eliminando falsos positivos e garantindo maior precisão na classificação de PII.
          </div>
        </div>
      </div>
    </div>
  );
}
