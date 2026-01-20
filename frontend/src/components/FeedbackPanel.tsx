import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { api, type EntityFeedback, type FeedbackRequest } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Check, ChevronUp, Edit2, Loader2, MessageSquare, X } from 'lucide-react';
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
            selectedValidation === 'CORRETO' && "bg-success/10 border-success/30",
            selectedValidation === 'INCORRETO' && "bg-destructive/10 border-destructive/30",
            selectedValidation === 'PARCIAL' && "bg-warning/10 border-warning/30",
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

                <TooltipProvider>
                    <div className="flex items-center gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant={selectedValidation === 'CORRETO' ? 'default' : 'outline'}
                                    className={cn(
                                        "h-8 w-8 p-0",
                                        selectedValidation === 'CORRETO' && "bg-success hover:bg-success/90"
                                    )}
                                    onClick={() => handleValidation('CORRETO')}
                                    disabled={disabled}
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Correto - É PII</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant={selectedValidation === 'INCORRETO' ? 'default' : 'outline'}
                                    className={cn(
                                        "h-8 w-8 p-0",
                                        selectedValidation === 'INCORRETO' && "bg-destructive hover:bg-destructive/90"
                                    )}
                                    onClick={() => handleValidation('INCORRETO')}
                                    disabled={disabled}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Incorreto - Falso Positivo</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant={selectedValidation === 'PARCIAL' ? 'default' : 'outline'}
                                    className={cn(
                                        "h-8 w-8 p-0",
                                        selectedValidation === 'PARCIAL' && "bg-warning hover:bg-warning/90"
                                    )}
                                    onClick={() => handleValidation('PARCIAL')}
                                    disabled={disabled}
                                >
                                    {showReclassify ? <ChevronUp className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Reclassificar Tipo</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>

            {/* Painel de Reclassificação Inline (sem Dialog para evitar conflito) */}
            {showReclassify && (
                <div className="px-2 pb-2 pt-1 border-t border-border/50 space-y-2">
                    <div className="flex items-center gap-2">
                        <Select value={newType} onValueChange={setNewType}>
                            <SelectTrigger className="h-8 text-xs flex-1">
                                <SelectValue placeholder="Tipo correto..." />
                            </SelectTrigger>
                            <SelectContent>
                                {PII_TYPES.map((type) => (
                                    <SelectItem key={type} value={type} className="text-xs">
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button size="sm" className="h-8 text-xs" onClick={handleReclassify}>
                            Confirmar
                        </Button>
                    </div>
                    <Textarea
                        placeholder="Comentário opcional..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={1}
                        className="text-xs min-h-[32px]"
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
            // Remove feedback anterior para mesma entidade
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

            toast.success(`Feedback enviado! Acurácia atual: ${(response.stats.accuracy * 100).toFixed(1)}%`);
            setSubmitted(true);
            onFeedbackSubmitted?.();
        } catch (error) {
            toast.error('Erro ao enviar feedback. Tente novamente.');
            console.error('Erro ao enviar feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const allValidated = entityFeedbacks.length === entities.length;
    const validatedCount = entityFeedbacks.length;

    if (submitted) {
        return (
            <div className="bg-success/10 border border-success/30 rounded-lg p-4 text-center">
                <Check className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-sm font-medium text-success">Feedback enviado com sucesso!</p>
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
                        Enviar Feedback ({validatedCount} {validatedCount === 1 ? 'entidade' : 'entidades'})
                    </>
                )}
            </Button>

            {!allValidated && (
                <p className="text-xs text-muted-foreground text-center">
                    Valide todas as entidades para feedback completo
                </p>
            )}
        </div>
    );
}
