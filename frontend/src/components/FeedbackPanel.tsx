import { Button } from '@/components/ui/button';
import { api, type EntityFeedback, type FeedbackRequest } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, ChevronUp, Loader2, MessageSquare, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// Tipos de PII disponíveis para reclassificação
const PII_TYPES = [
    'CPF', 'CNPJ', 'RG', 'CNH', 'PIS', 'CNS', 'TITULO_ELEITOR', 'PASSAPORTE', 'CTPS',
    'EMAIL', 'TELEFONE', 'CELULAR', 'TELEFONE_INTERNACIONAL',
    'ENDERECO', 'CEP', 'ENDERECO_BRASILIA',
    'NOME', 'NOME_COMPLETO',
    'PIX', 'CONTA_BANCARIA', 'CARTAO_CREDITO',
    'PLACA_VEICULO', 'PROCESSO_CNJ', 'MATRICULA',
    'CID', 'DADO_BIOMETRICO', 'MENOR_IDENTIFICADO',
    'IP_ADDRESS', 'COORDENADAS_GPS', 'USER_AGENT',
    'OUTRO'
];

interface EntityFeedbackItemProps {
    entity: {
        tipo: string;
        valor: string;
        confianca?: number;
        fonte?: string;
    };
    onFeedback: (feedback: EntityFeedback) => void;
    disabled?: boolean;
}

export function EntityFeedbackItem({ entity, onFeedback, disabled = false }: EntityFeedbackItemProps) {
    const [selectedValidation, setSelectedValidation] = useState<'CORRETO' | 'INCORRETO' | 'PARCIAL' | null>(null);
    const [showReclassify, setShowReclassify] = useState(false);
    const [newType, setNewType] = useState<string>('');
    const [comment, setComment] = useState('');

    const handleValidation = (validacao: 'CORRETO' | 'INCORRETO' | 'PARCIAL') => {
        if (validacao === 'PARCIAL') {
            setShowReclassify(!showReclassify);
            setSelectedValidation(validacao);
        } else {
            setSelectedValidation(validacao);
            setShowReclassify(false);
            onFeedback({
                tipo: entity.tipo,
                valor: entity.valor,
                confianca_modelo: entity.confianca ?? 0,
                fonte: entity.fonte,
                validacao_humana: validacao,
                comentario: comment || undefined,
            });
        }
    };

    const handleReclassify = () => {
        onFeedback({
            tipo: entity.tipo,
            valor: entity.valor,
            confianca_modelo: entity.confianca ?? 0,
            fonte: entity.fonte,
            validacao_humana: 'PARCIAL',
            tipo_corrigido: newType || undefined,
            comentario: comment || undefined,
        });
        setShowReclassify(false);
    };

    return (
        <div className={cn(
            "rounded-lg border transition-colors",
            selectedValidation === 'CORRETO' && "bg-green-500/10 border-green-500/30",
            selectedValidation === 'INCORRETO' && "bg-red-500/10 border-red-500/30",
            selectedValidation === 'PARCIAL' && "bg-yellow-500/10 border-yellow-500/30",
            !selectedValidation && "bg-muted/50 border-border"
        )}>
            <div className="flex items-center justify-between gap-2 p-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">{entity.tipo}</span>
                        {entity.confianca !== undefined && (
                            <span className="text-xs text-muted-foreground">
                                ({(entity.confianca * 100).toFixed(0)}%)
                            </span>
                        )}
                    </div>
                    <p className="text-sm font-mono truncate" title={entity.valor}>
                        {entity.valor}
                    </p>
                </div>

                {/* Botões simples sem Tooltip */}
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        title="Correto - É PII"
                        className={cn(
                            "h-8 w-8 rounded-md border flex items-center justify-center transition-colors",
                            selectedValidation === 'CORRETO'
                                ? "bg-green-600 text-white border-green-600"
                                : "bg-background border-input hover:bg-accent"
                        )}
                        onClick={() => handleValidation('CORRETO')}
                        disabled={disabled}
                    >
                        <Check className="h-4 w-4" />
                    </button>

                    <button
                        type="button"
                        title="Incorreto - Falso Positivo"
                        className={cn(
                            "h-8 w-8 rounded-md border flex items-center justify-center transition-colors",
                            selectedValidation === 'INCORRETO'
                                ? "bg-red-600 text-white border-red-600"
                                : "bg-background border-input hover:bg-accent"
                        )}
                        onClick={() => handleValidation('INCORRETO')}
                        disabled={disabled}
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <button
                        type="button"
                        title="Reclassificar Tipo"
                        className={cn(
                            "h-8 w-8 rounded-md border flex items-center justify-center transition-colors",
                            selectedValidation === 'PARCIAL'
                                ? "bg-yellow-600 text-white border-yellow-600"
                                : "bg-background border-input hover:bg-accent"
                        )}
                        onClick={() => handleValidation('PARCIAL')}
                        disabled={disabled}
                    >
                        {showReclassify ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {/* Painel de Reclassificação com elementos nativos */}
            {showReclassify && (
                <div className="px-2 pb-2 pt-1 border-t border-border/50 space-y-2">
                    <div className="flex items-center gap-2">
                        <select
                            value={newType}
                            onChange={(e) => setNewType(e.target.value)}
                            className="h-8 text-xs flex-1 rounded-md border border-input bg-background px-2"
                        >
                            <option value="">Selecione o tipo correto...</option>
                            {PII_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                        <Button size="sm" className="h-8 text-xs" onClick={handleReclassify}>
                            OK
                        </Button>
                    </div>
                    <input
                        type="text"
                        placeholder="Comentário opcional..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full h-8 text-xs rounded-md border border-input bg-background px-2"
                    />
                </div>
            )}
        </div>
    );
}

interface FeedbackPanelProps {
    analysisId?: string;
    originalText: string;
    entities: Array<{
        tipo: string;
        valor: string;
        confianca?: number;
        fonte?: string;
    }>;
    classificacao: string;
    onFeedbackSubmitted?: () => void;
}

export function FeedbackPanel({
    analysisId,
    originalText,
    entities,
    classificacao,
    onFeedbackSubmitted
}: FeedbackPanelProps) {
    const [entityFeedbacks, setEntityFeedbacks] = useState<EntityFeedback[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [classificacaoCorrigida, setClassificacaoCorrigida] = useState<string | null>(null);

    const handleEntityFeedback = (feedback: EntityFeedback) => {
        setEntityFeedbacks(prev => {
            const filtered = prev.filter(f => f.valor !== feedback.valor);
            return [...filtered, feedback];
        });
    };

    const handleSubmit = async () => {
        if (entityFeedbacks.length === 0) {
            toast.error('Valide pelo menos uma entidade antes de enviar');
            return;
        }

        setIsSubmitting(true);
        try {
            const feedbackRequest: FeedbackRequest = {
                analysis_id: analysisId,
                original_text: originalText,
                entity_feedbacks: entityFeedbacks,
                classificacao_modelo: classificacao,
                classificacao_corrigida: classificacaoCorrigida ?? undefined,
            };

            const response = await api.submitFeedback(feedbackRequest);

            toast.success(`Feedback enviado! Acurácia: ${(response.stats.accuracy * 100).toFixed(1)}%`);
            setSubmitted(true);
            onFeedbackSubmitted?.();
        } catch (error) {
            toast.error('Erro ao enviar feedback. Tente novamente.');
            console.error('Erro ao enviar feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const validatedCount = entityFeedbacks.length;

    if (submitted) {
        return (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-600">Feedback enviado!</p>
                <p className="text-xs text-muted-foreground mt-1">
                    Obrigado por ajudar a melhorar o sistema.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Validar Detecção</span>
                </div>
                <span className="text-xs text-muted-foreground">
                    {validatedCount}/{entities.length} validados
                </span>
            </div>

            {/* Lista de entidades para validar */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
                {entities.map((entity, index) => (
                    <EntityFeedbackItem
                        key={`${entity.tipo}-${entity.valor}-${index}`}
                        entity={entity}
                        onFeedback={handleEntityFeedback}
                        disabled={isSubmitting}
                    />
                ))}
            </div>

            {/* Opção para corrigir classificação geral */}
            {classificacao === 'NÃO PÚBLICO' && (
                <div className="flex items-center gap-2 pt-2 border-t">
                    <input
                        type="checkbox"
                        id="corrigir-classificacao"
                        className="rounded border-border"
                        onChange={(e) => setClassificacaoCorrigida(e.target.checked ? 'PÚBLICO' : null)}
                    />
                    <label htmlFor="corrigir-classificacao" className="text-sm text-muted-foreground">
                        Na verdade, este texto é <strong>PÚBLICO</strong> (sem PII real)
                    </label>
                </div>
            )}

            {/* Botão de enviar */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || entityFeedbacks.length === 0}
                className="w-full"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                    </>
                ) : (
                    <>
                        Enviar Feedback ({validatedCount} {validatedCount === 1 ? 'item' : 'itens'})
                    </>
                )}
            </Button>
        </div>
    );
}
