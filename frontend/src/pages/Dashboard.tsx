import { ConfidenceBar, normalizeConfidence } from '@/components/ConfidenceBar';
import { DistributionChart } from '@/components/DistributionChart';
import { ExpandableText } from '@/components/ExpandableText';
import { ExportButton } from '@/components/ExportButton';
import { IdentifierList } from '@/components/IdentifierBadge';
import { KPICard } from '@/components/KPICard';
import { PIITypesChart } from '@/components/PIITypesChart';
import { ResultsLegend } from '@/components/ResultsLegend';
import { RiskDistributionChart } from '@/components/RiskDistributionChart';
import { RiskThermometer } from '@/components/RiskThermometer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getRiskBgClass, getRiskLabel, useAnalysis } from '@/contexts/AnalysisContext';
import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, BarChart3, CheckCircle, ChevronLeft, ChevronRight, Clock, Eye, FileText, Info, Percent, Shield, ShieldX, Target, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';

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

export function Dashboard() {
  const { history, metrics, counters, clearHistory } = useAnalysis();
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<typeof history[0] | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(history.length / pageSize);
  const paginatedHistory = history.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return <ShieldX className="w-5 h-5" />;
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'moderate': return <AlertCircle className="w-5 h-5" />;
      case 'low': return <Shield className="w-5 h-5" />;
      case 'safe': return <CheckCircle className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard de Análise</h2>
        <p className="text-muted-foreground">
          Métricas em tempo real e análise de desempenho do sistema de identificação de dados pessoais
        </p>
      </div>

      {/* Hybrid System Performance - Only this one */}
      <div className="gov-card bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-warning" />
          <span className="text-sm font-semibold text-foreground">Benchmarks de Performance do Motor Híbrido Ensemble de Alta Recall (BERT NER + spaCy + Regex + Validação DV)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-card/50 rounded-lg border border-success/20">
            <div className="flex items-center justify-center gap-1 text-success mb-1">
              <Target className="w-4 h-4" />
              <MetricTooltip content="Estratégia Ensemble OR: qualquer detector positivo classifica como PII, maximizando recall para conformidade LGPD/LAI.">
                <span className="text-xs font-medium">Precisão Global</span>
              </MetricTooltip>
            </div>
            <p className="text-2xl font-bold text-success">94%</p>
          </div>

          <div className="text-center p-3 bg-card/50 rounded-lg border border-success/20">
            <div className="flex items-center justify-center gap-1 text-success mb-1">
              <TrendingUp className="w-4 h-4" />
              <MetricTooltip content="22 tipos de PII detectados: CPF, CNPJ, RG, CNH, PIS, CNS, Email, Telefone, Endereço, Nome e mais.">
                <span className="text-xs font-medium">Sensibilidade</span>
              </MetricTooltip>
            </div>
            <p className="text-2xl font-bold text-success">98%</p>
          </div>

          <div className="text-center p-3 bg-card/50 rounded-lg border border-success/20">
            <div className="flex items-center justify-center gap-1 text-success mb-1">
              <BarChart3 className="w-4 h-4" />
              <MetricTooltip content="100+ casos de teste validados incluindo edge cases de Brasília/GDF e imunidade funcional (LAI).">
                <span className="text-xs font-medium">F1-Score Combinado</span>
              </MetricTooltip>
            </div>
            <p className="text-2xl font-bold text-success">96%</p>
          </div>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <strong className="text-foreground">Arquitetura do Motor:</strong> Pipeline de 4 camadas em <span className="text-primary font-medium">estratégia Ensemble OR</span> — (1) <span className="text-warning font-medium">Regex com Validação DV</span> (Módulo 11 para CPF, CNPJ, PIS, CNS), (2) <span className="text-primary font-medium">BERT NER Multilíngue</span> (Davlan/bert-base-multilingual-cased-ner-hrl) como detector primário de nomes, (3) <span className="text-success font-medium">spaCy pt_core_news_lg</span> como NER complementar (captura nomes não detectados pelo BERT), e (4) <span className="text-muted-foreground font-medium">Regras de Negócio</span> (imunidade funcional, contexto GDF). Qualquer camada positiva classifica como PII, garantindo máximo recall para conformidade LGPD/LAI.
        </div>
      </div>

      {/* Volume KPIs Section */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4" />
          KPIs de Volume da Sessão
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KPICard
            title="Total de Pedidos"
            value={metrics.totalProcessed.toLocaleString()}
            subtitle="processados nesta sessão"
            icon={<FileText className="w-5 h-5" />}
            variant="default"
            tooltip="Quantidade total de pedidos de acesso à informação analisados pelo motor de IA durante esta sessão de uso."
          />
          <KPICard
            title="Públicos"
            value={metrics.publicCount.toLocaleString()}
            subtitle="sem dados sensíveis"
            icon={<CheckCircle className="w-5 h-5" />}
            variant="success"
            tooltip="Pedidos que NÃO contêm dados pessoais identificáveis (PII) e podem ser divulgados publicamente conforme a LAI."
          />
          <KPICard
            title="Não Públicos"
            value={metrics.nonPublicCount.toLocaleString()}
            subtitle="com dados sensíveis"
            icon={<AlertTriangle className="w-5 h-5" />}
            variant="danger"
            tooltip="Pedidos que CONTÊM dados pessoais sensíveis (CPF, nome, endereço, etc.) e requerem tratamento especial conforme a LGPD."
          />
          <KPICard
            title="Confiança Média"
            value={metrics.totalProcessed > 0 ? `${(metrics.averageConfidence * 100).toFixed(1)}%` : '0%'}
            subtitle="probabilidade média de acerto"
            icon={<Percent className="w-5 h-5" />}
            variant="highlight"
            tooltip="Média da confiança do modelo em suas classificações. Valores acima de 90% indicam alta certeza nas predições."
          />
        </div>
      </div>

      {/* Charts Row 1: Risk Thermometer + Classification Distribution */}
      {metrics.totalProcessed === 0 ? (
        <div className="gov-card">
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhuma requisição processada ainda</p>
            <p className="text-sm mt-1">Acesse a página de Classificação para começar.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="min-h-[300px]">
              <RiskThermometer
                distribution={metrics.riskDistribution}
                total={metrics.totalProcessed}
              />
            </div>
            <div className="min-h-[300px]">
              <DistributionChart
                publicCount={metrics.publicCount}
                restrictedCount={metrics.nonPublicCount}
              />
            </div>
          </div>

          {/* Charts Row 2: Risk Distribution + PII Types */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="min-h-[300px]">
              <RiskDistributionChart distribution={metrics.riskDistribution} />
            </div>
            <div className="min-h-[300px]">
              <PIITypesChart data={metrics.piiTypeCounts} />
            </div>
          </div>
        </>
      )}

      {/* Request History */}
      <div className="gov-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Histórico de Requisições</h3>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton data={history} disabled={history.length === 0} />
            {history.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => clearHistory()}>
                Limpar Tudo
              </Button>
            )}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma requisição processada ainda.</p>
            <p className="text-sm mt-1">Acesse a página de Classificação para começar.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase w-16">#</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Data</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Horário</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Tipo</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Classificação</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Confiança</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Nível de Risco</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">ID do Pedido</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase hidden lg:table-cell">Prévia do Pedido</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.map((item, index) => {
                    // Calcula o ID sequencial baseado na página atual
                    const sequentialId = ((currentPage - 1) * pageSize) + index + 1;

                    // Verifica se tem explicações para tooltip XAI (com verificação de segurança)
                    const hasExplicacoes = item.details?.some(d => d.explicacao) ?? false;

                    return (
                      <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono text-sm text-muted-foreground font-medium">
                            {sequentialId}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
                          {item.date}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
                          {item.time}
                        </td>
                        <td className="py-3 px-4">
                          <span className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                            item.type === 'individual'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          )}>
                            {item.type === 'individual' ? 'Individual' : 'Lote'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className={cn(
                                  'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium cursor-help',
                                  item.classification === 'PÚBLICO'
                                    ? 'bg-green-600/10 text-green-600'
                                    : 'bg-red-600/10 text-red-600'
                                )}>
                                  {item.classification === 'PÚBLICO' ? (
                                    <>
                                      <CheckCircle className="w-3 h-3" />
                                      Público
                                    </>
                                  ) : (
                                    <>
                                      <AlertTriangle className="w-3 h-3" />
                                      Não Público
                                      {hasExplicacoes && <HelpCircle className="w-3 h-3 ml-1 opacity-60" />}
                                    </>
                                  )}
                                </span>
                              </TooltipTrigger>
                              {hasExplicacoes && (
                                <TooltipContent side="bottom" className="max-w-md p-3">
                                  <div className="space-y-2">
                                    <p className="font-semibold text-xs uppercase text-muted-foreground">
                                      Explicação (XAI)
                                    </p>
                                    {(item.details ?? []).filter(d => d.explicacao).map((d, i) => (
                                      <div key={i} className="text-xs">
                                        <span className="font-semibold text-primary">{d.tipo}:</span>
                                        <ul className="ml-2 mt-1 space-y-0.5">
                                          {d.explicacao?.motivos?.map((m, j) => (
                                            <li key={j} className="text-muted-foreground">{m}</li>
                                          ))}
                                          {d.explicacao?.validacoes?.map((v, j) => (
                                            <li key={`v-${j}`} className="text-green-600">{v}</li>
                                          ))}
                                        </ul>
                                        <p className="text-muted-foreground mt-1">
                                          Fonte: {d.explicacao?.fontes?.join(', ') ?? 'N/A'}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {(() => {
                            const normalizedProb = normalizeConfidence(item.probability, item.classification);
                            return (
                              <ConfidenceBar
                                value={normalizedProb}
                                classification={item.classification}
                                className="justify-center"
                              />
                            );
                          })()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border',
                            getRiskBgClass(item.riskLevel)
                          )}>
                            {item.riskLevel === 'critical' && <ShieldX className="w-3 h-3" />}
                            {item.riskLevel === 'high' && <AlertTriangle className="w-3 h-3" />}
                            {item.riskLevel === 'moderate' && <AlertCircle className="w-3 h-3" />}
                            {item.riskLevel === 'low' && <Shield className="w-3 h-3" />}
                            {item.riskLevel === 'safe' && <CheckCircle className="w-3 h-3" />}
                            {getRiskLabel(item.riskLevel)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm text-primary font-medium">
                            #{item.pedidoId}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate hidden lg:table-cell">
                          {item.text}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedHistoryItem(item)}
                            className="text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Detalhes
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Exibindo {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, history.length)} de {history.length} resultados
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-border">
          <ResultsLegend showClassification showRisk showConfidence />
        </div>
      </div>

      {/* History Item Details Dialog */}
      <Dialog open={!!selectedHistoryItem} onOpenChange={() => setSelectedHistoryItem(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-3">
              <span>Detalhes da Análise</span>
              {selectedHistoryItem && (
                <span className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
                  selectedHistoryItem.classification === 'PÚBLICO'
                    ? 'bg-green-600/10 text-green-600'
                    : 'bg-red-600/10 text-red-600'
                )}>
                  {selectedHistoryItem.classification}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedHistoryItem && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">ID do Pedido</h4>
                <p className="text-sm font-mono text-foreground bg-primary/10 px-3 py-2 rounded-lg inline-block">
                  #{selectedHistoryItem.pedidoId}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Texto Analisado</h4>
                <ExpandableText
                  text={selectedHistoryItem.text}
                  maxLines={3}
                />
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Nível de Risco</h4>
                <div className={cn(
                  'p-3 rounded-lg flex items-center gap-3',
                  getRiskBgClass(selectedHistoryItem.riskLevel)
                )}>
                  {getRiskIcon(selectedHistoryItem.riskLevel)}
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{getRiskLabel(selectedHistoryItem.riskLevel)}</p>
                    <p className="text-xs opacity-90">
                      Probabilidade: {(selectedHistoryItem.probability * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {selectedHistoryItem.details.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Dados Pessoais Identificados ({selectedHistoryItem.details.length})
                  </h4>
                  <IdentifierList
                    identificadores={selectedHistoryItem.details}
                    showConfidence={true}
                    size="md"
                  />
                </div>
              )}

              {/* Seção XAI - Explicabilidade */}
              {(selectedHistoryItem.details ?? []).some(d => d.explicacao) && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Explicação da IA (XAI)
                  </h4>
                  <div className="space-y-3 bg-muted/30 p-3 rounded-lg border border-border">
                    {(selectedHistoryItem.details ?? []).filter(d => d.explicacao).map((detail, idx) => (
                      <div key={idx} className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-primary">{detail.tipo}</span>
                          <span className="text-xs text-muted-foreground">
                            ({detail.explicacao?.confianca_percent})
                          </span>
                        </div>

                        {/* Motivos */}
                        {detail.explicacao?.motivos && detail.explicacao.motivos.length > 0 && (
                          <div className="ml-2 mb-1">
                            <span className="text-xs font-medium text-muted-foreground">Motivos:</span>
                            <ul className="list-disc list-inside text-xs text-muted-foreground">
                              {detail.explicacao.motivos.map((m, i) => (
                                <li key={i}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Validações */}
                        {detail.explicacao?.validacoes && detail.explicacao.validacoes.length > 0 && (
                          <div className="ml-2 mb-1">
                            <span className="text-xs font-medium text-green-600">Validações:</span>
                            <ul className="list-disc list-inside text-xs text-green-600">
                              {detail.explicacao.validacoes.map((v, i) => (
                                <li key={i}>{v}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Contexto */}
                        {detail.explicacao?.contexto && detail.explicacao.contexto.length > 0 && (
                          <div className="ml-2 mb-1">
                            <span className="text-xs font-medium text-blue-600">Contexto:</span>
                            <ul className="list-disc list-inside text-xs text-blue-600">
                              {detail.explicacao.contexto.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Fontes */}
                        <div className="ml-2 text-xs text-muted-foreground">
                          <span className="font-medium">Fontes:</span> {detail.explicacao?.fontes?.join(', ') ?? 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                Analisado em: {selectedHistoryItem.date} às {selectedHistoryItem.time}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
