import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { AlertCircle, BarChart3, Check, CheckCircle, Loader2, TrendingUp, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ValidationBreakdown {
    correct: number;
    incorrect: number;
    partial: number;
}

interface ByTypeStats {
    correct: number;
    incorrect: number;
    partial: number;
    total: number;
}

interface TrainingStatus {
    status: string;
    last_calibration: string | null;
    total_samples_used: number;
    total_feedbacks: number;
    accuracy_before: number;
    accuracy_after: number;
    improvement_percentage: number;
    time_since_last: string;
    by_source: Record<string, ByTypeStats>;
    validation_breakdown?: ValidationBreakdown;
    recommendations: Array<{
        type: string;
        message: string;
        action: string;
    }>;
}

// Evento customizado para notificar quando feedback é enviado
const FEEDBACK_SUBMITTED_EVENT = 'feedbackSubmitted';

export function TrainingStatus() {
    const [status, setStatus] = useState<TrainingStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAutoRefresh, setIsAutoRefresh] = useState(true);

    const fetchStatus = async () => {
        try {
            const data = await api.getTrainingStatus();
            if (data && !('error' in data)) {
                setStatus(data as unknown as TrainingStatus);
                setError(null);
            } else {
                setError((data as { error?: string })?.error || 'Erro ao carregar status');
            }
        } catch (err) {
            console.error('Erro ao buscar status:', err);
            setError('Erro ao carregar status de treinamento');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();

        // Auto-refresh a cada 30 segundos para refletir dados de outras sessões
        let interval: ReturnType<typeof setInterval> | null = null;
        if (isAutoRefresh) {
            interval = setInterval(fetchStatus, 30000);
        }

        // Escuta evento de feedback para atualizar imediatamente
        const handleFeedbackSubmitted = () => {
            setTimeout(fetchStatus, 1000); // Aguarda 1s para backend processar
        };
        window.addEventListener(FEEDBACK_SUBMITTED_EVENT, handleFeedbackSubmitted);

        return () => {
            if (interval) clearInterval(interval);
            window.removeEventListener(FEEDBACK_SUBMITTED_EVENT, handleFeedbackSubmitted);
        };
    }, [isAutoRefresh]);

    // Exporta função para disparar atualização
    (TrainingStatus as unknown as { refresh: () => void }).refresh = fetchStatus;

    if (loading) {
        return (
            <div className="bg-card border border-border rounded-lg p-4 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Carregando status...</p>
            </div>
        );
    }

    if (error || !status) {
        return (
            <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <div>
                        <p className="text-sm font-medium">Aguardando dados de treinamento</p>
                        <p className="text-xs mt-1">Submeta feedbacks nas análises para calibrar o modelo automaticamente.</p>
                    </div>
                </div>
            </div>
        );
    }

    const statusColor =
        status.status === 'ready' ? 'text-green-600' :
            status.status === 'improving' ? 'text-blue-600' :
                status.status === 'learning' ? 'text-yellow-600' :
                    status.status === 'needs_attention' ? 'text-orange-600' :
                        'text-gray-500';

    const statusIcon =
        status.status === 'ready' ? <Check className="h-4 w-4" /> :
            status.status === 'improving' ? <TrendingUp className="h-4 w-4" /> :
                status.status === 'learning' ? <BarChart3 className="h-4 w-4" /> :
                    status.status === 'needs_attention' ? <AlertCircle className="h-4 w-4" /> :
                        <AlertCircle className="h-4 w-4" />;

    const statusLabel =
        status.status === 'ready' ? 'Modelo Calibrado' :
            status.status === 'improving' ? 'Aprendendo...' :
                status.status === 'learning' ? 'Coletando Dados' :
                    status.status === 'needs_attention' ? 'Precisa Atenção' :
                        'Aguardando Feedbacks';

    // Se nunca treinado (zero feedbacks), mostra interface informativa
    if (status.status === 'never_trained' || status.total_samples_used === 0) {
        return (
            <div className="space-y-3">
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-full">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">Sistema de Calibração Automática</h4>
                            <p className="text-xs text-muted-foreground mb-3">
                                O modelo melhora automaticamente com base nos seus feedbacks.
                                Revise análises e valide se os PIIs detectados estão corretos.
                            </p>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-muted/50 rounded p-2">
                                    <p className="text-lg font-bold text-muted-foreground">0</p>
                                    <p className="text-[10px] text-muted-foreground">Avaliações</p>
                                </div>
                                <div className="bg-muted/50 rounded p-2">
                                    <p className="text-lg font-bold text-muted-foreground">—</p>
                                    <p className="text-[10px] text-muted-foreground">Acurácia</p>
                                </div>
                                <div className="bg-muted/50 rounded p-2">
                                    <p className="text-lg font-bold text-muted-foreground">20</p>
                                    <p className="text-[10px] text-muted-foreground">Meta Inicial</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-xs bg-blue-500/10 border border-blue-500/20 rounded p-3 text-blue-700">
                    💡 <strong>Dica:</strong> Clique em "Detalhes" nas análises e use o painel de feedback para validar os PIIs detectados.
                </div>
            </div>
        );
    }

    // Interface com dados de feedback coletados
    const breakdown = status.validation_breakdown || { correct: 0, incorrect: 0, partial: 0 };
    const totalValidations = breakdown.correct + breakdown.incorrect + breakdown.partial;

    return (
        <div className="space-y-3">
            {/* Card Principal */}
            <div className={cn(
                'bg-card border rounded-lg p-4',
                status.status === 'ready' && 'border-green-500/30 bg-green-500/5',
                status.status === 'improving' && 'border-blue-500/30 bg-blue-500/5',
                status.status === 'learning' && 'border-yellow-500/30 bg-yellow-500/5',
                status.status === 'needs_attention' && 'border-orange-500/30 bg-orange-500/5',
            )}>
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <div className={cn('flex items-center gap-2 text-sm font-medium', statusColor)}>
                            {statusIcon}
                            <span>{statusLabel}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{status.time_since_last}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">
                            {status.accuracy_after > 0 ? `${(status.accuracy_after * 100).toFixed(0)}%` : '—'}
                        </div>
                        <p className="text-xs text-muted-foreground">Acurácia</p>
                    </div>
                </div>

                {/* Barra de Progresso Visual */}
                {totalValidations > 0 && (
                    <div className="mb-3">
                        <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                            <div
                                className="bg-green-500 transition-all"
                                style={{ width: `${(breakdown.correct / totalValidations) * 100}%` }}
                            />
                            <div
                                className="bg-yellow-500 transition-all"
                                style={{ width: `${(breakdown.partial / totalValidations) * 100}%` }}
                            />
                            <div
                                className="bg-red-500 transition-all"
                                style={{ width: `${(breakdown.incorrect / totalValidations) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Métricas de Validação */}
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-green-500/10 rounded p-2 border border-green-500/20">
                        <div className="flex items-center justify-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <p className="text-lg font-bold text-green-600">{breakdown.correct}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Corretas</p>
                    </div>
                    <div className="bg-yellow-500/10 rounded p-2 border border-yellow-500/20">
                        <div className="flex items-center justify-center gap-1">
                            <AlertCircle className="h-3 w-3 text-yellow-600" />
                            <p className="text-lg font-bold text-yellow-600">{breakdown.partial}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Parciais</p>
                    </div>
                    <div className="bg-red-500/10 rounded p-2 border border-red-500/20">
                        <div className="flex items-center justify-center gap-1">
                            <XCircle className="h-3 w-3 text-red-600" />
                            <p className="text-lg font-bold text-red-600">{breakdown.incorrect}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Incorretas</p>
                    </div>
                </div>
            </div>

            {/* Estatísticas por Tipo de PII */}
            {Object.keys(status.by_source).length > 0 && (
                <div className="bg-card border border-border rounded-lg p-3">
                    <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Acurácia por Tipo de PII
                    </h4>
                    <div className="space-y-1.5">
                        {Object.entries(status.by_source)
                            .sort((a, b) => b[1].total - a[1].total)
                            .slice(0, 5)
                            .map(([tipo, data]) => {
                                const accuracy = data.total > 0 ? data.correct / data.total : 0;
                                return (
                                    <div key={tipo} className="flex items-center gap-2">
                                        <span className="text-xs font-medium w-20 truncate" title={tipo}>{tipo}</span>
                                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all",
                                                    accuracy >= 0.9 ? "bg-green-500" :
                                                        accuracy >= 0.7 ? "bg-yellow-500" : "bg-red-500"
                                                )}
                                                style={{ width: `${accuracy * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground w-10 text-right">
                                            {(accuracy * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* Recomendações */}
            {status.recommendations && status.recommendations.length > 0 && (
                <div className="space-y-1.5">
                    {status.recommendations.map((rec, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                'text-xs p-2 rounded border-l-2',
                                rec.type === 'ready_for_finetuning' && 'bg-green-500/10 border-l-green-500 text-green-700',
                                rec.type === 'needs_attention' && 'bg-orange-500/10 border-l-orange-500 text-orange-700',
                                rec.type === 'collect_more_data' && 'bg-blue-500/10 border-l-blue-500 text-blue-700',
                                rec.type === 'get_started' && 'bg-blue-500/10 border-l-blue-500 text-blue-700',
                            )}
                        >
                            <p>{rec.message}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Auto-Refresh Toggle */}
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input
                    type="checkbox"
                    checked={isAutoRefresh}
                    onChange={(e) => setIsAutoRefresh(e.target.checked)}
                    className="rounded"
                />
                Atualizar automaticamente (30s)
            </label>
        </div>
    );
}
